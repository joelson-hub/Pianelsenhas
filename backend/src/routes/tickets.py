from flask import Blueprint, jsonify, request
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
from src.models.user import db
from src.models.ticket import Ticket
from src.models.category import Category
from src.models.counter import Counter
from src.routes.auth import token_required

tickets_bp = Blueprint('tickets', __name__)

def generate_ticket_number(category_prefix, unit_id):
    """Gera o próximo número de senha para uma categoria"""
    today = datetime.now().date()
    
    # Busca o último número da categoria no dia
    last_ticket = Ticket.query.filter(
        and_(
            Ticket.ticket_number.like(f'{category_prefix}%'),
            Ticket.unit_id == unit_id,
            func.date(Ticket.generated_at) == today
        )
    ).order_by(Ticket.id.desc()).first()
    
    if last_ticket:
        # Extrai o número da senha (ex: 'N001' -> 1)
        last_number = int(last_ticket.ticket_number[len(category_prefix):])
        next_number = last_number + 1
    else:
        next_number = 1
    
    # Formata com zeros à esquerda (ex: N001, P015)
    return f'{category_prefix}{next_number:03d}'

@tickets_bp.route('/tickets/generate', methods=['POST'])
@token_required
def generate_ticket(current_user):
    """Gera uma nova senha"""
    try:
        data = request.get_json()
        
        if not data or not data.get('category_id'):
            return jsonify({'message': 'ID da categoria é obrigatório'}), 400
        
        category = Category.query.get_or_404(data['category_id'])
        
        # Verifica permissões
        if current_user.role != 'admin' and current_user.unit_id != category.unit_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        if not category.is_active:
            return jsonify({'message': 'Categoria inativa'}), 400
        
        # Gera o número da senha
        ticket_number = generate_ticket_number(category.prefix, category.unit_id)
        
        ticket = Ticket(
            ticket_number=ticket_number,
            category_id=category.id,
            unit_id=category.unit_id,
            status='waiting'
        )
        
        db.session.add(ticket)
        db.session.commit()
        
        return jsonify({
            'message': 'Senha gerada com sucesso',
            'ticket': ticket.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@tickets_bp.route('/tickets/queue', methods=['GET'])
@token_required
def get_queue(current_user):
    """Obtém a fila de senhas aguardando"""
    try:
        unit_id = request.args.get('unit_id')
        if current_user.role != 'admin':
            unit_id = current_user.unit_id
        
        if not unit_id:
            return jsonify({'message': 'Unidade é obrigatória'}), 400
        
        # Busca senhas aguardando, ordenadas por prioridade e ordem de chegada
        tickets = Ticket.query.join(Category).filter(
            and_(
                Ticket.unit_id == unit_id,
                Ticket.status == 'waiting'
            )
        ).order_by(
            Category.priority.desc(),
            Ticket.generated_at.asc()
        ).all()
        
        return jsonify([ticket.to_dict() for ticket in tickets]), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@tickets_bp.route('/tickets/<int:ticket_id>/call', methods=['POST'])
@token_required
def call_ticket(current_user, ticket_id):
    """Chama uma senha específica"""
    try:
        data = request.get_json()
        counter_id = data.get('counter_id') if data else None
        
        if not counter_id:
            return jsonify({'message': 'ID do guichê é obrigatório'}), 400
        
        ticket = Ticket.query.get_or_404(ticket_id)
        counter = Counter.query.get_or_404(counter_id)
        
        # Verifica permissões
        if current_user.role != 'admin' and current_user.unit_id != ticket.unit_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        if ticket.status not in ['waiting', 'called']:
            return jsonify({'message': 'Senha não pode ser chamada neste status'}), 400
        
        if not counter.is_active:
            return jsonify({'message': 'Guichê inativo'}), 400
        
        # Atualiza o status da senha
        ticket.status = 'calling'
        ticket.counter_id = counter_id
        ticket.called_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Senha chamada com sucesso',
            'ticket': ticket.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@tickets_bp.route('/tickets/call-next', methods=['POST'])
@token_required
def call_next_ticket(current_user):
    """Chama a próxima senha da fila"""
    try:
        data = request.get_json()
        counter_id = data.get('counter_id') if data else None
        
        if not counter_id:
            return jsonify({'message': 'ID do guichê é obrigatório'}), 400
        
        counter = Counter.query.get_or_404(counter_id)
        
        # Verifica permissões
        if current_user.role != 'admin' and current_user.unit_id != counter.unit_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        if not counter.is_active:
            return jsonify({'message': 'Guichê inativo'}), 400
        
        # Busca a próxima senha na fila (por prioridade)
        next_ticket = Ticket.query.join(Category).filter(
            and_(
                Ticket.unit_id == counter.unit_id,
                Ticket.status == 'waiting'
            )
        ).order_by(
            Category.priority.desc(),
            Ticket.generated_at.asc()
        ).first()
        
        if not next_ticket:
            return jsonify({'message': 'Não há senhas na fila'}), 404
        
        # Chama a senha
        next_ticket.status = 'calling'
        next_ticket.counter_id = counter_id
        next_ticket.called_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Próxima senha chamada com sucesso',
            'ticket': next_ticket.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@tickets_bp.route('/tickets/<int:ticket_id>/finish', methods=['POST'])
@token_required
def finish_ticket(current_user, ticket_id):
    """Finaliza o atendimento de uma senha"""
    try:
        ticket = Ticket.query.get_or_404(ticket_id)
        
        # Verifica permissões
        if current_user.role != 'admin' and current_user.unit_id != ticket.unit_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        if ticket.status != 'calling':
            return jsonify({'message': 'Senha não está sendo atendida'}), 400
        
        # Finaliza o atendimento
        ticket.status = 'finished'
        ticket.finished_at = datetime.utcnow()
        ticket.calculate_service_time()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Atendimento finalizado com sucesso',
            'ticket': ticket.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@tickets_bp.route('/tickets/<int:ticket_id>/miss', methods=['POST'])
@token_required
def miss_ticket(current_user, ticket_id):
    """Marca uma senha como perdida (cliente não compareceu)"""
    try:
        ticket = Ticket.query.get_or_404(ticket_id)
        
        # Verifica permissões
        if current_user.role != 'admin' and current_user.unit_id != ticket.unit_id:
            return jsonify({'message': 'Acesso negado'}), 403
        
        if ticket.status != 'calling':
            return jsonify({'message': 'Senha não está sendo chamada'}), 400
        
        # Marca como perdida
        ticket.status = 'missed'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Senha marcada como perdida',
            'ticket': ticket.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@tickets_bp.route('/tickets/current-display', methods=['GET'])
def get_current_display(current_user=None):
    """Obtém informações para o painel de exibição pública"""
    try:
        unit_id = request.args.get('unit_id')
        if not unit_id:
            return jsonify({'message': 'ID da unidade é obrigatório'}), 400
        
        # Senha atualmente sendo chamada
        current_ticket = Ticket.query.filter(
            and_(
                Ticket.unit_id == unit_id,
                Ticket.status == 'calling'
            )
        ).order_by(Ticket.called_at.desc()).first()
        
        # Últimas 5 senhas chamadas
        recent_tickets = Ticket.query.filter(
            and_(
                Ticket.unit_id == unit_id,
                or_(Ticket.status == 'finished', Ticket.status == 'missed')
            )
        ).order_by(Ticket.called_at.desc()).limit(5).all()
        
        return jsonify({
            'current_ticket': current_ticket.to_dict() if current_ticket else None,
            'recent_tickets': [ticket.to_dict() for ticket in recent_tickets]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@tickets_bp.route('/tickets/history', methods=['GET'])
@token_required
def get_tickets_history(current_user):
    """Obtém histórico de senhas"""
    try:
        unit_id = request.args.get('unit_id')
        if current_user.role != 'admin':
            unit_id = current_user.unit_id
        
        if not unit_id:
            return jsonify({'message': 'Unidade é obrigatória'}), 400
        
        # Parâmetros de filtro
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        category_id = request.args.get('category_id')
        status = request.args.get('status')
        
        query = Ticket.query.filter(Ticket.unit_id == unit_id)
        
        if start_date:
            query = query.filter(Ticket.generated_at >= datetime.fromisoformat(start_date))
        
        if end_date:
            query = query.filter(Ticket.generated_at <= datetime.fromisoformat(end_date))
        
        if category_id:
            query = query.filter(Ticket.category_id == category_id)
        
        if status:
            query = query.filter(Ticket.status == status)
        
        tickets = query.order_by(Ticket.generated_at.desc()).all()
        
        return jsonify([ticket.to_dict() for ticket in tickets]), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

