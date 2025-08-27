import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db

# Importar todos os modelos para criar as tabelas
from src.models.user import User
from src.models.unit import Unit
from src.models.counter import Counter
from src.models.category import Category
from src.models.ticket import Ticket
from src.models.display_settings import DisplaySettings

# Importar todas as rotas
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.units import units_bp
from src.routes.counters import counters_bp
from src.routes.categories import categories_bp
from src.routes.tickets import tickets_bp
from src.routes.reports import reports_bp
from src.routes.display import display_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Habilitar CORS para todas as rotas
CORS(app, origins="*")

# Registrar blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(units_bp, url_prefix='/api')
app.register_blueprint(counters_bp, url_prefix='/api')
app.register_blueprint(categories_bp, url_prefix='/api')
app.register_blueprint(tickets_bp, url_prefix='/api')
app.register_blueprint(reports_bp, url_prefix='/api')
app.register_blueprint(display_bp, url_prefix='/api')

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Criar tabelas e dados iniciais
with app.app_context():
    db.create_all()
    
    # Criar dados iniciais se não existirem
    if not User.query.first():
        # Criar usuário admin padrão
        admin = User(
            username='admin',
            email='admin@sistema.com',
            role='admin'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        
        # Criar unidade padrão
        unit = Unit(
            name='Unidade Principal',
            address='Endereço da unidade principal'
        )
        db.session.add(unit)
        db.session.flush()  # Para obter o ID da unidade
        
        # Associar admin à unidade
        admin.unit_id = unit.id
        
        # Criar categorias padrão
        categories = [
            Category(name='Normal', prefix='N', priority=1, unit_id=unit.id),
            Category(name='Preferencial', prefix='P', priority=2, unit_id=unit.id),
            Category(name='Urgência', prefix='U', priority=3, unit_id=unit.id)
        ]
        for category in categories:
            db.session.add(category)
        
        # Criar guichês padrão
        counters = [
            Counter(name='Guichê 01', unit_id=unit.id),
            Counter(name='Guichê 02', unit_id=unit.id),
            Counter(name='Caixa 01', unit_id=unit.id)
        ]
        for counter in counters:
            db.session.add(counter)
        
        # Criar configurações do painel
        display_settings = DisplaySettings(
            unit_id=unit.id,
            message='Bem-vindos ao nosso atendimento!'
        )
        db.session.add(display_settings)
        
        db.session.commit()
        print("Dados iniciais criados com sucesso!")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
