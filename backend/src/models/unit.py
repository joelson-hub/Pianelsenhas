from flask_sqlalchemy import SQLAlchemy
from src.models.user import db
from datetime import datetime

class Unit(db.Model):
    __tablename__ = 'units'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    counters = db.relationship('Counter', backref='unit', lazy=True, cascade='all, delete-orphan')
    categories = db.relationship('Category', backref='unit', lazy=True, cascade='all, delete-orphan')
    tickets = db.relationship('Ticket', backref='unit', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Unit {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

