from flask_sqlalchemy import SQLAlchemy
from src.models.user import db
from datetime import datetime
import json

class DisplaySettings(db.Model):
    __tablename__ = 'display_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.id'), nullable=False)
    message = db.Column(db.Text, default='Bem-vindos!')
    show_last_tickets_count = db.Column(db.Integer, default=5)
    sound_enabled = db.Column(db.Boolean, default=True)
    theme = db.Column(db.String(20), default='light')  # light, dark
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento
    unit = db.relationship('Unit', backref='display_settings')
    
    def __repr__(self):
        return f'<DisplaySettings for Unit {self.unit_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'unit_id': self.unit_id,
            'message': self.message,
            'show_last_tickets_count': self.show_last_tickets_count,
            'sound_enabled': self.sound_enabled,
            'theme': self.theme,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

