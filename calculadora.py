import sys
def folga(eixo, alojamento): return round(float(alojamento) - float(eixo), 3)
if name == "__main__": print(f"📏 Folga de Óleo Calculada: {folga(sys.argv[1], sys.argv[2])}mm")