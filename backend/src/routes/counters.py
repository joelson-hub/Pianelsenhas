from flask import Blueprint, jsonify, request
from src.models.user import db
from src.models.counter import Counter
from src.routes.auth import token_required, admin_required

counters_bp = Blueprint('counters', __name__)

@counters_bp.route('/counters', methods=['GET'])
@token_required
def get_counters(current_user):
    """Lista todos os guichês"""
    try:
        if current_user.role == 'admin':
            unit_id = request.args.get('unit_id')
            if unit_id:
                counters = Counter.query.filter_by(unit_id=unit_id).all()
            else:
                counters = Counter.query.all()
        else:
            # Atendentes só veem guichês de sua unidade
            counters = Counter.query.filter_by(unit_id=current_user.unit_id).all() if current_user.unit_id else []
        
        return jsonify([counter.to_dict() for counter in counters]), 200
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@counters_bp.route('/counters', methods=['POST'])
@token_required
def create_counter(current_user):
    """Cria um novo guichê"""
    try:
        data = request.get_json()
        
        if not data or not data.get('name'):
            return jsonify({'message': 'Nome do guichê é obrigatório'}), 400
        
        # Define a unidade
        unit_id = data.get('unit_id')
        if current_user.role != 'admin':
            unit_id = current_user.unit_id
        
        if not unit_id:
            return jsonify({'message': 'Unidade é obrigatória'}), 400
        
        counter = Counter(
            name=data['name'],
            unit_id=unit_id,
            is_active=data.get('is_active', True)
        )
        
        db.session.add(counter)
        db.session.commit()
        
        return jsonify({
            'message': 'Guichê criado com sucesso',
            'counter': counter.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@counters_bp.route('/counters/<int:counter_id>', methods=['GET'])
@token_required
def get_counter(current_user, counter_id):
    """Obtém um guichê específico"""
    try:
        counter = Counter.query.get_or_404(counter_id)
        
        # Verifica permissões
        if current_user.role != 'admin' and current_user.unit_id != counter.unit_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        return jsonify(counter.to_dict()), 200
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@counters_bp.route('/counters/<int:counter_id>', methods=['PUT'])
@token_required
def update_counter(current_user, counter_id):
    """Atualiza um guichê"""
    try:
        counter = Counter.query.get_or_404(counter_id)
        
        # Verifica permissões
        if current_user.role != 'admin' and current_user.unit_id != counter.unit_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'message': 'Dados são obrigatórios'}), 400
        
        counter.name = data.get('name', counter.name)
        counter.is_active = data.get('is_active', counter.is_active)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Guichê atualizado com sucesso',
            'counter': counter.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@counters_bp.route('/counters/<int:counter_id>', methods=['DELETE'])
@token_required
def delete_counter(current_user, counter_id):
    """Exclui um guichê"""
    try:
        counter = Counter.query.get_or_404(counter_id)
        
        # Verifica permissões
        if current_user.role != 'admin' and current_user.unit_id != counter.unit_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        # Verifica se há senhas relacionadas
        if counter.tickets:
            return jsonify({'message': 'Não é possível excluir guichê com senhas relacionadas'}), 400
        
        db.session.delete(counter)
        db.session.commit()
        
        return jsonify({'message': 'Guichê excluído com sucesso'}), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

