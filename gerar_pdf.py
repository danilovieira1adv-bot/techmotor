from fpdf import FPDF
import sys

def gerar():
    try:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(200, 10, "TECHMOTOR - RELATORIO TECNICO", ln=True, align='C')
        pdf.ln(10)
        
        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 10, "MOTOR: Cummins Serie C (6CTA 8.3)", ln=True)
        pdf.set_font("Arial", '', 11)
        pdf.multi_cell(0, 10, "ESPECIFICACOES DE TORQUE:\n"
                             "- Cabecote: 70Nm | 145Nm | 70Nm | +90gr\n"
                             "- Bielas: 30Nm | 70Nm | +60gr\n"
                             "- Mancais: 50Nm | 95Nm | +60gr")
        
        pdf.output("relatorio_techmotor.pdf")
        print("ARQUIVO_CRIADO")
    except Exception as e:
        print(f"ERRO_GERACAO: {str(e)}")

if __name__ == "__main__":
    gerar()
