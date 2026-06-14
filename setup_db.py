import sqlite3
from werkzeug.security import generate_password_hash
import os

# Caminho do banco definido no seu resumo
DB_PATH = '/root/techmotor/database/engine_specs.db'

def setup_database():
    # Garante que a pasta do banco existe
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("--- Iniciando Reestruturação do Banco ---")

    # 1. Remove a tabela antiga para evitar conflitos de coluna
    cursor.execute("DROP TABLE IF EXISTS usuarios")
    
    # 2. Cria a tabela com a coluna 'login' correta
    cursor.execute('''
        CREATE TABLE usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            login TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL
        )
    ''')
    print("[OK] Tabela 'usuarios' criada com sucesso.")

    # 3. Cria o usuário admin padrão
    # A senha aqui é 'admin123', sinta-se à vontade para alterar
    senha_hash = generate_password_hash('admin123')
    try:
        cursor.execute("INSERT INTO usuarios (login, senha) VALUES (?, ?)", ('admin', senha_hash))
        conn.commit()
        print(f"[OK] Usuário 'admin' inserido com sucesso!")
        print("     Login: admin")
        print("     Senha: admin123")
    except sqlite3.IntegrityError:
        print("[!] Usuário admin já existia.")

    conn.close()
    print("--- Configuração Concluída ---")

if __name__ == "__main__":
    setup_database()
