from flask import Blueprint, jsonify, request
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from src.models.user import db
from src.models.ticket import Ticket
from src.models.category import Category
from src.models.counter import Counter
from src.routes.auth import token_required

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/reports/dashboard', methods=['GET'])
@token_required
def get_dashboard_data(current_user):
    """Obtém dados para o dashboard administrativo"""
    try:
        unit_id = request.args.get('unit_id')
        if current_user.role != 'admin':
            unit_id = current_user.unit_id
        
        if not unit_id:
            return jsonify({'message': 'Unidade é obrigatória'}), 400
        
        # Data de hoje
        today = datetime.now().date()
        
        # Estatísticas do dia
        today_tickets = Ticket.query.filter(
            and_(
                Ticket.unit_id == unit_id,
                func.date(Ticket.generated_at) == today
            )
        ).all()
        
        # Contadores
        total_today = len(today_tickets)
        waiting_count = len([t for t in today_tickets if t.status == 'waiting'])
        finished_count = len([t for t in today_tickets if t.status == 'finished'])
        missed_count = len([t for t in today_tickets if t.status == 'missed'])
        
        # Tempo médio de atendimento
        finished_tickets = [t for t in today_tickets if t.status == 'finished' and t.service_time]
        avg_service_time = sum(t.service_time for t in finished_tickets) / len(finished_tickets) if finished_tickets else 0
        
        # Senhas por categoria
        category_stats = db.session.query(
            Category.name,
            Category.prefix,
            func.count(Ticket.id).label('count')
        ).join(Ticket).filter(
            and_(
                Ticket.unit_id == unit_id,
                func.date(Ticket.generated_at) == today
            )
        ).group_by(Category.id, Category.name, Category.prefix).all()
        
        # Senhas por guichê
        counter_stats = db.session.query(
            Counter.name,
            func.count(Ticket.id).label('count'),
            func.avg(Ticket.service_time).label('avg_time')
        ).join(Ticket).filter(
            and_(
                Ticket.unit_id == unit_id,
                func.date(Ticket.generated_at) == today,
                Ticket.status == 'finished'
            )
        ).group_by(Counter.id, Counter.name).all()
        
        return jsonify({
            'summary': {
                'total_today': total_today,
                'waiting_count': waiting_count,
                'finished_count': finished_count,
                'missed_count': missed_count,
                'avg_service_time': round(avg_service_time, 2)
            },
            'category_stats': [
                {
                    'name': stat.name,
                    'prefix': stat.prefix,
                    'count': stat.count
                } for stat in category_stats
            ],
            'counter_stats': [
                {
                    'name': stat.name,
                    'count': stat.count,
                    'avg_time': round(float(stat.avg_time), 2) if stat.avg_time else 0
                } for stat in counter_stats
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@reports_bp.route('/reports/period', methods=['GET'])
@token_required
def get_period_report(current_user):
    """Obtém relatório por período"""
    try:
        unit_id = request.args.get('unit_id')
        if current_user.role != 'admin':
            unit_id = current_user.unit_id
        
        if not unit_id:
            return jsonify({'message': 'Unidade é obrigatória'}), 400
        
        # Parâmetros de data
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({'message': 'Datas de início e fim são obrigatórias'}), 400
        
        start_date = datetime.fromisoformat(start_date).date()
        end_date = datetime.fromisoformat(end_date).date()
        
        # Busca senhas do período
        tickets = Ticket.query.filter(
            and_(
                Ticket.unit_id == unit_id,
                func.date(Ticket.generated_at) >= start_date,
                func.date(Ticket.generated_at) <= end_date
            )
        ).all()
        
        # Estatísticas gerais
        total_tickets = len(tickets)
        finished_tickets = [t for t in tickets if t.status == 'finished']
        missed_tickets = [t for t in tickets if t.status == 'missed']
        
        # Tempo médio de atendimento
        service_times = [t.service_time for t in finished_tickets if t.service_time]
        avg_service_time = sum(service_times) / len(service_times) if service_times else 0
        
        # Estatísticas por dia
        daily_stats = {}
        for ticket in tickets:
            date_str = ticket.generated_at.date().isoformat()
            if date_str not in daily_stats:
                daily_stats[date_str] = {
                    'total': 0,
                    'finished': 0,
                    'missed': 0,
                    'waiting': 0
                }
            
            daily_stats[date_str]['total'] += 1
            daily_stats[date_str][ticket.status] += 1
        
        # Estatísticas por categoria
        category_stats = {}
        for ticket in tickets:
            if ticket.category:
                cat_name = ticket.category.name
                if cat_name not in category_stats:
                    category_stats[cat_name] = {
                        'total': 0,
                        'finished': 0,
                        'missed': 0,
                        'avg_time': 0
                    }
                
                category_stats[cat_name]['total'] += 1
                if ticket.status == 'finished':
                    category_stats[cat_name]['finished'] += 1
                elif ticket.status == 'missed':
                    category_stats[cat_name]['missed'] += 1
        
        # Calcula tempo médio por categoria
        for cat_name in category_stats:
            cat_tickets = [t for t in finished_tickets if t.category and t.category.name == cat_name and t.service_time]
            if cat_tickets:
                category_stats[cat_name]['avg_time'] = sum(t.service_time for t in cat_tickets) / len(cat_tickets)
        
        return jsonify({
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'summary': {
                'total_tickets': total_tickets,
                'finished_count': len(finished_tickets),
                'missed_count': len(missed_tickets),
                'avg_service_time': round(avg_service_time, 2)
            },
            'daily_stats': daily_stats,
            'category_stats': {
                name: {
                    **stats,
                    'avg_time': round(stats['avg_time'], 2)
                } for name, stats in category_stats.items()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@reports_bp.route('/reports/export', methods=['GET'])
@token_required
def export_report(current_user):
    """Exporta relatório (dados para PDF/Excel)"""
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
        
        query = Ticket.query.filter(Ticket.unit_id == unit_id)
        
        if start_date:
            query = query.filter(func.date(Ticket.generated_at) >= datetime.fromisoformat(start_date).date())
        
        if end_date:
            query = query.filter(func.date(Ticket.generated_at) <= datetime.fromisoformat(end_date).date())
        
        if category_id:
            query = query.filter(Ticket.category_id == category_id)
        
        tickets = query.order_by(Ticket.generated_at.desc()).all()
        
        # Prepara dados para exportação
        export_data = []
        for ticket in tickets:
            export_data.append({
                'numero_senha': ticket.ticket_number,
                'categoria': ticket.category.name if ticket.category else '',
                'guiche': ticket.counter.name if ticket.counter else '',
                'status': ticket.status,
                'gerada_em': ticket.generated_at.strftime('%d/%m/%Y %H:%M:%S'),
                'chamada_em': ticket.called_at.strftime('%d/%m/%Y %H:%M:%S') if ticket.called_at else '',
                'finalizada_em': ticket.finished_at.strftime('%d/%m/%Y %H:%M:%S') if ticket.finished_at else '',
                'tempo_atendimento': f'{ticket.service_time}s' if ticket.service_time else ''
            })
        
        return jsonify({
            'data': export_data,
            'summary': {
                'total': len(tickets),
                'period': f"{start_date} a {end_date}" if start_date and end_date else "Todos os registros"
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

