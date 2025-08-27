from flask_sqlalchemy import SQLAlchemy
from src.models.user import db
from datetime import datetime

class Ticket(db.Model):
    __tablename__ = 'tickets'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_number = db.Column(db.String(10), nullable=False)  # Ex: 'N001', 'P005'
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.id'), nullable=False)
    counter_id = db.Column(db.Integer, db.ForeignKey('counters.id'), nullable=True)
    
    # Status: waiting, calling, called, finished, missed
    status = db.Column(db.String(20), default='waiting', nullable=False)
    
    # Timestamps
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    called_at = db.Column(db.DateTime, nullable=True)
    finished_at = db.Column(db.DateTime, nullable=True)
    
    # Tempo de atendimento em segundos
    service_time = db.Column(db.Integer, nullable=True)
    
    def __repr__(self):
        return f'<Ticket {self.ticket_number}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'ticket_number': self.ticket_number,
            'category_id': self.category_id,
            'unit_id': self.unit_id,
            'counter_id': self.counter_id,
            'status': self.status,
            'generated_at': self.generated_at.isoformat() if self.generated_at else None,
            'called_at': self.called_at.isoformat() if self.called_at else None,
            'finished_at': self.finished_at.isoformat() if self.finished_at else None,
            'service_time': self.service_time,
            'category': self.category.to_dict() if self.category else None,
            'counter': self.counter.to_dict() if self.counter else None
        }
    
    def calculate_service_time(self):
        """Calcula o tempo de atendimento em segundos"""
        if self.called_at and self.finished_at:
            delta = self.finished_at - self.called_at
            self.service_time = int(delta.total_seconds())
        return self.service_time

