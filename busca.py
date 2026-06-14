import sqlite3
import sys

def converter_torque(valor_nm):
    try:
        # Extrai o primeiro número se houver texto
        nm = float(''.join(filter(lambda x: x.isdigit() or x == '.', valor_nm.split()[0])))
        kgfm = round(nm * 0.10197, 2)
        lbft = round(nm * 0.73756, 2)
        return f"{nm}Nm | {kgfm}kgfm | {lbft}lb.ft"
    except:
        return valor_nm

def pesquisar(termo):
    conn = sqlite3.connect('database/engine_specs.db')
    cursor = conn.cursor()
    query = """
    SELECT t.motor, t.cabecote, t.bielas, t.mancais, p.categoria, p.descricao, p.codigo_referencia
    FROM torques t
    LEFT JOIN pecas p ON t.id = p.motor_id
    WHERE t.motor LIKE ?
    """
    cursor.execute(query, ('%' + termo + '%',))
    res = cursor.fetchall()
    conn.close()
    return res

if __name__ == "__main__":
    termo = " ".join(sys.argv[1:])
    dados = pesquisar(termo)
    
    if not dados:
        print(f"❌ Nenhum dado encontrado para '{termo}'.")
    else:
        m = dados[0]
        print(f"🚛 MOTOR: {m[0]}")
        print(f"🔩 TORQUES (Conversão Automática):")
        print(f"   Cabeçote: {converter_torque(m[1])}")
        print(f"   Bielas: {converter_torque(m[2])}")
        print(f"   Mancais: {converter_torque(m[3])}")
        
        # Diferencial Competitivo: Sequência de Aperto Padrão
        print(f"\n🔄 SEQUÊNCIA DE APERTO SUGERIDA:")
        print("   [10][06][02][03][07]")
        print("   [09][05][01][04][08] (Inicie do centro para as extremidades)")
        
        print(f"\n📦 CATÁLOGO DE PEÇAS:")
        for d in dados:
            if d[4]:
                print(f"   • {d[4]}: {d[5]} (Ref: {d[6]})")
