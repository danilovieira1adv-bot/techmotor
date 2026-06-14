import sqlite3
import os

db_path = 'database/engine_specs.db'
os.makedirs('database', exist_ok=True)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Tabela para torques, folgas e especificações
cursor.execute('''
    CREATE TABLE IF NOT EXISTS engine_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        modelo_motor TEXT NOT NULL,
        componente TEXT NOT NULL,
        especificacao TEXT NOT NULL,
        observacao TEXT
    )
''')

# Inserindo dados de exemplo para teste
motores_exemplo = [
    ('VW AP 1.8', 'Cabeçote', '40Nm + 60Nm + 180°', 'Sequência caracol'),
    ('Fiat Fire 1.0', 'Biela', '20Nm + 40°', 'Parafusos novos recomendados'),
    ('Ford Ka 1.0 3cil', 'Mancal', '25Nm + 90°', 'Motor Ti-VCT')
]

cursor.executemany('INSERT INTO engine_data (modelo_motor, componente, especificacao, observacao) VALUES (?,?,?,?)', motores_exemplo)

conn.commit()
conn.close()
print("✅ Banco de dados técnico inicializado com sucesso!")
