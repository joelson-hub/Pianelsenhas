from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import jwt
import os

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='attendant')  # admin, attendant
    unit_id = db.Column(db.Integer, db.ForeignKey('units.id'), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamento
    unit = db.relationship('Unit', backref='users')

    def __repr__(self):
        return f'<User {self.username}>'
    
    def set_password(self, password):
        """Define a senha do usuário com hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verifica se a senha está correta"""
        return check_password_hash(self.password_hash, password)
    
    def generate_token(self):
        """Gera um token JWT para o usuário"""
        payload = {
            'user_id': self.id,
            'username': self.username,
            'role': self.role,
            'unit_id': self.unit_id
        }
        return jwt.encode(payload, os.environ.get('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT'), algorithm='HS256')
    
    @staticmethod
    def verify_token(token):
        """Verifica e decodifica um token JWT"""
        try:
            payload = jwt.decode(token, os.environ.get('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT'), algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'unit_id': self.unit_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
