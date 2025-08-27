from flask import Blueprint, jsonify, request
from src.models.user import db
from src.models.display_settings import DisplaySettings
from src.routes.auth import token_required

display_bp = Blueprint('display', __name__)

@display_bp.route('/display/settings/<int:unit_id>', methods=['GET'])
def get_display_settings(unit_id):
    """Obtém configurações do painel de exibição (público)"""
    try:
        settings = DisplaySettings.query.filter_by(unit_id=unit_id).first()
        
        if not settings:
            # Cria configurações padrão se não existir
            settings = DisplaySettings(unit_id=unit_id)
            db.session.add(settings)
            db.session.commit()
        
        return jsonify(settings.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@display_bp.route('/display/settings/<int:unit_id>', methods=['PUT'])
@token_required
def update_display_settings(current_user, unit_id):
    """Atualiza configurações do painel de exibição"""
    try:
        # Verifica permissões
        if current_user.role != 'admin' and current_user.unit_id != unit_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'message': 'Dados são obrigatórios'}), 400
        
        settings = DisplaySettings.query.filter_by(unit_id=unit_id).first()
        
        if not settings:
            settings = DisplaySettings(unit_id=unit_id)
            db.session.add(settings)
        
        # Atualiza campos
        if 'message' in data:
            settings.message = data['message']
        
        if 'show_last_tickets_count' in data:
            count = data['show_last_tickets_count']
            if isinstance(count, int) and 1 <= count <= 10:
                settings.show_last_tickets_count = count
        
        if 'sound_enabled' in data:
            settings.sound_enabled = bool(data['sound_enabled'])
        
        if 'theme' in data:
            theme = data['theme']
            if theme in ['light', 'dark']:
                settings.theme = theme
        
        db.session.commit()
        
        return jsonify({
            'message': 'Configurações atualizadas com sucesso',
            'settings': settings.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

