import sqlite3
from werkzeug.security import generate_password_hash
import os

# Define o caminho do banco de dados
DB_PATH = 'database/engine_specs.db' if os.path.exists('database') else 'engine_specs.db'

def setup_usuarios():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Criar tabela de usuários
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        login TEXT UNIQUE NOT NULL,
        senha_hash TEXT NOT NULL,
        nome TEXT NOT NULL,
        nivel TEXT CHECK(nivel IN ('admin', 'operador', 'cliente')) DEFAULT 'operador'
    )
    ''')
    
    # Criar senha segura para o admin
    senha_hash = generate_password_hash('admin123')
    
    try:
        cursor.execute("INSERT INTO usuarios (login, senha_hash, nome, nivel) VALUES (?, ?, ?, ?)",
                       ('admin', senha_hash, 'Gestor TechMotor', 'admin'))
        conn.commit()
        print(f"✅ Sucesso! Tabela criada em {DB_PATH}")
    except sqlite3.IntegrityError:
        print("⚠️ Usuário 'admin' já existe.")
    
    conn.close()

if __name__ == "__main__":
    setup_usuarios()
