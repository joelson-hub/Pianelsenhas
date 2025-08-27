from flask import Blueprint, jsonify, request
from src.models.user import db
from src.models.category import Category
from src.routes.auth import token_required, admin_required

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/categories', methods=['GET'])
@token_required
def get_categories(current_user):
    """Lista todas as categorias"""
    try:
        if current_user.role == 'admin':
            unit_id = request.args.get('unit_id')
            if unit_id:
                categories = Category.query.filter_by(unit_id=unit_id).order_by(Category.priority.desc()).all()
            else:
                categories = Category.query.order_by(Category.priority.desc()).all()
        else:
            # Atendentes só veem categorias de sua unidade
            categories = Category.query.filter_by(unit_id=current_user.unit_id).order_by(Category.priority.desc()).all() if current_user.unit_id else []
        
        return jsonify([category.to_dict() for category in categories]), 200
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@categories_bp.route('/categories', methods=['POST'])
@token_required
def create_category(current_user):
    """Cria uma nova categoria"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('name', 'prefix')):
            return jsonify({'message': 'Nome e prefixo da categoria são obrigatórios'}), 400
        
        # Define a unidade
        unit_id = data.get('unit_id')
        if current_user.role != 'admin':
            unit_id = current_user.unit_id
        
        if not unit_id:
            return jsonify({'message': 'Unidade é obrigatória'}), 400
        
        # Verifica se já existe categoria com mesmo prefixo na unidade
        existing = Category.query.filter_by(prefix=data['prefix'], unit_id=unit_id).first()
        if existing:
            return jsonify({'message': 'Já existe categoria com este prefixo nesta unidade'}), 400
        
        category = Category(
            name=data['name'],
            prefix=data['prefix'].upper(),
            priority=data.get('priority', 1),
            unit_id=unit_id,
            is_active=data.get('is_active', True)
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'message': 'Categoria criada com sucesso',
            'category': category.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@categories_bp.route('/categories/<int:category_id>', methods=['GET'])
@token_required
def get_category(current_user, category_id):
    """Obtém uma categoria específica"""
    try:
        category = Category.query.get_or_404(category_id)
        
        # Verifica permissões
        if current_user.role != 'admin' and current_user.unit_id != category.unit_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        return jsonify(category.to_dict()), 200
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@categories_bp.route('/categories/<int:category_id>', methods=['PUT'])
@token_required
def update_category(current_user, category_id):
    """Atualiza uma categoria"""
    try:
        category = Category.query.get_or_404(category_id)
        
        # Verifica permissões
        if current_user.role != 'admin' and current_user.unit_id != category.unit_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'message': 'Dados são obrigatórios'}), 400
        
        # Verifica se o novo prefixo já existe (se foi alterado)
        if 'prefix' in data and data['prefix'] != category.prefix:
            existing = Category.query.filter_by(prefix=data['prefix'], unit_id=category.unit_id).first()
            if existing:
                return jsonify({'message': 'Já existe categoria com este prefixo nesta unidade'}), 400
        
        category.name = data.get('name', category.name)
        category.prefix = data.get('prefix', category.prefix).upper()
        category.priority = data.get('priority', category.priority)
        category.is_active = data.get('is_active', category.is_active)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Categoria atualizada com sucesso',
            'category': category.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@categories_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@token_required
def delete_category(current_user, category_id):
    """Exclui uma categoria"""
    try:
        category = Category.query.get_or_404(category_id)
        
        # Verifica permissões
        if current_user.role != 'admin' and current_user.unit_id != category.unit_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        # Verifica se há senhas relacionadas
        if category.tickets:
            return jsonify({'message': 'Não é possível excluir categoria com senhas relacionadas'}), 400
        
        db.session.delete(category)
        db.session.commit()
        
        return jsonify({'message': 'Categoria excluída com sucesso'}), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

