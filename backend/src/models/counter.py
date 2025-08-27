from flask_sqlalchemy import SQLAlchemy
from src.models.user import db
from datetime import datetime

class Counter(db.Model):
    __tablename__ = 'counters'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    tickets = db.relationship('Ticket', backref='counter', lazy=True)
    
    def __repr__(self):
        return f'<Counter {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'unit_id': self.unit_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

