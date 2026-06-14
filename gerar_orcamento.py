from fpdf import FPDF
import sqlite3
import sys

def gerar(os_id):
    conn = sqlite3.connect('database/engine_specs.db')
    cursor = conn.cursor()
    
    # Busca dados da OS
    cursor.execute("SELECT cliente_nome, motor_modelo FROM ordens_servico WHERE id=?", (os_id,))
    os_info = cursor.fetchone()
    
    # Busca itens
    cursor.execute("SELECT descricao, valor, tipo FROM itens_orcamento WHERE os_id=?", (os_id,))
    itens = cursor.fetchall()
    conn.close()

    pdf = FPDF()
    pdf.add_page()
    
    # Cabeçalho Comercial
    pdf.set_font("Arial", 'B', 16)
    pdf.set_text_color(0, 51, 102)
    pdf.cell(200, 10, "TECHMOTOR - ORCAMENTO DE RETIFICA", ln=True, align='C')
    pdf.set_font("Arial", '', 10)
    pdf.cell(200, 5, f"Ordem de Servico: #{os_id}", ln=True, align='C')
    pdf.ln(10)

    # Dados do Cliente
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, f"Cliente: {os_info[0]}", ln=True)
    pdf.cell(0, 10, f"Motor: {os_info[1]}", ln=True)
    pdf.line(10, 45, 200, 45)
    pdf.ln(5)

    # Tabela de Itens
    pdf.set_font("Arial", 'B', 10)
    pdf.cell(110, 8, "Descricao", border=1)
    pdf.cell(40, 8, "Tipo", border=1)
    pdf.cell(40, 8, "Valor (R$)", border=1, ln=True)
    
    pdf.set_font("Arial", '', 10)
    total = 0
    for item in itens:
        pdf.cell(110, 8, f" {item[0]}", border=1)
        pdf.cell(40, 8, f" {item[2]}", border=1)
        pdf.cell(40, 8, f" {item[1]:.2f}", border=1, ln=True)
        total += item[1]

    # Total
    pdf.ln(5)
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(150, 10, "TOTAL DO ORCAMENTO:", align='R')
    pdf.cell(40, 10, f" R$ {total:.2f}", ln=True)

    nome_arq = f"orcamento_os_{os_id}.pdf"
    pdf.output(nome_arq)
    print(nome_arq)

if __name__ == "__main__":
    gerar(sys.argv[1])
