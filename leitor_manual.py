import pdfplumber
import sys
import re
import requests
import json

DEEPSEEK_KEY = "sk-d2d407d812824e188f78b903eadad7e4"

def consultar_ia(texto):
    url = "https://api.deepseek.com/chat/completions"
    headers = {"Authorization": f"Bearer {DEEPSEEK_KEY}", "Content-Type": "application/json"}
    prompt = f"Extraia os dados técnicos deste manual de motor. Retorne um JSON com: motor, cabecote, bielas, mancais. Texto: {texto[:4000]}"
    
    payload = {
        "model": "deepseek-chat",
        "messages": [{"role": "user", "content": prompt}],
        "response_format": {"type": "json_object"}
    }
    try:
        response = requests.post(url, json=payload, headers=headers)
        return response.json()['choices'][0]['message']['content']
    except:
        return None

def processar(caminho):
    texto = ""
    with pdfplumber.open(caminho) as pdf:
        for pagina in pdf.pages[:5]: # Analisa as primeiras 5 páginas (geralmente onde estão os dados)
            texto += pagina.extract_text()
    
    dados_json = consultar_ia(texto)
    if dados_json:
        dados = json.loads(dados_json)
        print(f"✅ Motor Identificado: {dados.get('motor')}")
        print(f"📍 Cabeçote: {dados.get('cabecote')}")
        print(f"📍 Bielas: {dados.get('bielas')}")
        print(f"📍 Mancais: {dados.get('mancais')}")
        return dados
    else:
        print("❌ Não foi possível estruturar os dados do PDF.")

if __name__ == "__main__":
    processar(sys.argv[1])
