FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./

# Instalar dependências (incluindo tsx)
RUN npm install

# Copiar o resto do código
COPY . .

# Expor porta
EXPOSE 5000

# Comando para rodar com tsx
CMD ["npx", "tsx", "server/index.ts"]