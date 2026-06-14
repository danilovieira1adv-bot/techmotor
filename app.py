from flask import Flask, render_template, request, redirect, url_for, flash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import check_password_hash
import sqlite3

app = Flask(__name__)
app.secret_key = 'techmotor_secret_key_2026'

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

DB_PATH = 'database/engine_specs.db'

class User(UserMixin):
    def __init__(self, id, login, nome, nivel):
        self.id = id
        self.login = login
        self.nome = nome
        self.nivel = nivel

@login_manager.user_loader
def load_user(user_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, login, nome, nivel FROM usuarios WHERE id = ?", (user_id,))
    data = cursor.fetchone()
    conn.close()
    return User(*data) if data else None

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT id, login, senha_hash, nome, nivel FROM usuarios WHERE login = ?", (username,))
        user_data = cursor.fetchone()
        conn.close()
        
        if user_data and check_password_hash(user_data[2], password):
            user = User(user_data[0], user_data[1], user_data[3], user_data[4])
            login_user(user)
            return redirect(url_for('index'))
        flash('Usuário ou senha inválidos.')
    return render_template('login.html')

@app.route('/')
@login_required
def index():
    return render_template('index.html', usuario=current_user)

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
