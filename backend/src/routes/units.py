from flask import Blueprint, jsonify, request
from src.models.user import db
from src.models.unit import Unit
from src.routes.auth import token_required, admin_required

units_bp = Blueprint('units', __name__)

@units_bp.route('/units', methods=['GET'])
@token_required
def get_units(current_user):
    """Lista todas as unidades"""
    try:
        if current_user.role == 'admin':
            units = Unit.query.all()
        else:
            # Atendentes só veem sua própria unidade
            units = Unit.query.filter_by(id=current_user.unit_id).all() if current_user.unit_id else []
        
        return jsonify([unit.to_dict() for unit in units]), 200
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@units_bp.route('/units', methods=['POST'])
@token_required
@admin_required
def create_unit(current_user):
    """Cria uma nova unidade"""
    try:
        data = request.get_json()
        
        if not data or not data.get('name'):
            return jsonify({'message': 'Nome da unidade é obrigatório'}), 400
        
        unit = Unit(
            name=data['name'],
            address=data.get('address', '')
        )
        
        db.session.add(unit)
        db.session.commit()
        
        return jsonify({
            'message': 'Unidade criada com sucesso',
            'unit': unit.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@units_bp.route('/units/<int:unit_id>', methods=['GET'])
@token_required
def get_unit(current_user, unit_id):
    """Obtém uma unidade específica"""
    try:
        unit = Unit.query.get_or_404(unit_id)
        
        # Verifica permissões
        if current_user.role != 'admin' and current_user.unit_id != unit_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        return jsonify(unit.to_dict()), 200
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@units_bp.route('/units/<int:unit_id>', methods=['PUT'])
@token_required
@admin_required
def update_unit(current_user, unit_id):
    """Atualiza uma unidade"""
    try:
        unit = Unit.query.get_or_404(unit_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'Dados são obrigatórios'}), 400
        
        unit.name = data.get('name', unit.name)
        unit.address = data.get('address', unit.address)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Unidade atualizada com sucesso',
            'unit': unit.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@units_bp.route('/units/<int:unit_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_unit(current_user, unit_id):
    """Exclui uma unidade"""
    try:
        unit = Unit.query.get_or_404(unit_id)
        
        # Verifica se há dados relacionados
        if unit.counters or unit.categories or unit.tickets:
            return jsonify({'message': 'Não é possível excluir unidade com dados relacionados'}), 400
        
        db.session.delete(unit)
        db.session.commit()
        
        return jsonify({'message': 'Unidade excluída com sucesso'}), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

