from flask import Blueprint, jsonify, request
from functools import wraps
from src.models.user import User, db

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    """Decorator para proteger rotas que requerem autenticação"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token é obrigatório'}), 401
        
        try:
            # Remove 'Bearer ' do token se presente
            if token.startswith('Bearer '):
                token = token[7:]
            
            payload = User.verify_token(token)
            if not payload:
                return jsonify({'message': 'Token inválido'}), 401
            
            current_user = User.query.get(payload['user_id'])
            if not current_user or not current_user.is_active:
                return jsonify({'message': 'Usuário não encontrado ou inativo'}), 401
            
        except Exception as e:
            return jsonify({'message': 'Token inválido'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def admin_required(f):
    """Decorator para proteger rotas que requerem privilégios de admin"""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.role != 'admin':
            return jsonify({'message': 'Acesso negado. Privilégios de administrador necessários.'}), 403
        return f(current_user, *args, **kwargs)
    
    return decorated

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint de login"""
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Username e password são obrigatórios'}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'message': 'Credenciais inválidas'}), 401
        
        if not user.is_active:
            return jsonify({'message': 'Usuário inativo'}), 401
        
        token = user.generate_token()
        
        return jsonify({
            'message': 'Login realizado com sucesso',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint de registro (apenas para admins)"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ('username', 'email', 'password')):
            return jsonify({'message': 'Username, email e password são obrigatórios'}), 400
        
        # Verifica se já existe usuário com mesmo username ou email
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username já existe'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email já existe'}), 400
        
        user = User(
            username=data['username'],
            email=data['email'],
            role=data.get('role', 'attendant'),
            unit_id=data.get('unit_id')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'Usuário criado com sucesso',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor'}), 500

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Retorna informações do usuário atual"""
    return jsonify(current_user.to_dict()), 200

