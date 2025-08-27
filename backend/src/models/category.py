from flask_sqlalchemy import SQLAlchemy
from src.models.user import db
from datetime import datetime

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    prefix = db.Column(db.String(5), nullable=False)  # Ex: 'N' para Normal, 'P' para Preferencial
    priority = db.Column(db.Integer, default=1)  # 1 = baixa, 2 = média, 3 = alta
    unit_id = db.Column(db.Integer, db.ForeignKey('units.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    tickets = db.relationship('Ticket', backref='category', lazy=True)
    
    def __repr__(self):
        return f'<Category {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'prefix': self.prefix,
            'priority': self.priority,
            'unit_id': self.unit_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

