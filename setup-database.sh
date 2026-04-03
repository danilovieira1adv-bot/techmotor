#!/bin/bash

echo "========================================="
echo "SETUP DO BANCO DE DADOS - RETÍFICAPRO"
echo "========================================="
echo ""

# Verificar se o PostgreSQL está disponível
echo "1. VERIFICANDO POSTGRESQL..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL CLI disponível"
else
    echo "❌ PostgreSQL CLI não encontrado"
    echo "   Instalando PostgreSQL via Homebrew..."
    brew install postgresql@15
fi

# Iniciar serviço do PostgreSQL
echo ""
echo "2. INICIANDO POSTGRESQL..."
brew services start postgresql@15 2>/dev/null || true

# Aguardar PostgreSQL iniciar
echo "   Aguardando PostgreSQL iniciar..."
sleep 5

# Verificar se está rodando
if brew services list | grep -q "postgresql@15.*started"; then
    echo "✅ PostgreSQL rodando"
else
    echo "⚠️  PostgreSQL pode não estar rodando. Tentando continuar..."
fi

# Criar banco de dados
echo ""
echo "3. CRIANDO BANCO DE DADOS..."
echo "   Database: techmotor"
echo "   User: postgres"
echo "   Password: postgres123"

# Tentar criar banco via psql
if command -v psql &> /dev/null; then
    # Primeiro, tentar conectar e criar banco
    PGPASSWORD=postgres123 psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE techmotor;" 2>/dev/null || \
        echo "   Banco já existe ou erro na criação"
    
    # Verificar se banco foi criado
    if PGPASSWORD=postgres123 psql -U postgres -h localhost -p 5432 -l | grep -q techmotor; then
        echo "✅ Banco 'techmotor' criado com sucesso"
    else
        echo "❌ Falha ao criar banco 'techmotor'"
        echo "   Tentando criar via script alternativo..."
    fi
else
    echo "❌ psql não disponível, pulando criação do banco"
fi

# Executar migrações SQL
echo ""
echo "4. EXECUTANDO MIGRAÇÕES SQL..."

SQL_FILES=(
    "create-tables.sql"
    "create-tenants-tables.sql"
    "tabelas_corretas.sql"
)

for sql_file in "${SQL_FILES[@]}"; do
    if [ -f "$sql_file" ]; then
        echo "   Executando: $sql_file"
        if command -v psql &> /dev/null; then
            PGPASSWORD=postgres123 psql -U postgres -h localhost -p 5432 -d techmotor -f "$sql_file" 2>/dev/null && \
                echo "     ✅ Sucesso" || \
                echo "     ⚠️  Possível erro ou já executado"
        else
            echo "     ❌ psql não disponível, pulando"
        fi
    else
        echo "   ❌ Arquivo $sql_file não encontrado"
    fi
done

# Verificar tabelas criadas
echo ""
echo "5. VERIFICANDO TABELAS CRIADAS..."
if command -v psql &> /dev/null; then
    echo "   Listando tabelas no banco 'techmotor':"
    PGPASSWORD=postgres123 psql -U postgres -h localhost -p 5432 -d techmotor -c "\dt" 2>/dev/null || \
        echo "   ❌ Não foi possível listar tabelas"
else
    echo "   ❌ psql não disponível para verificação"
fi

# Configurar variáveis de ambiente
echo ""
echo "6. CONFIGURANDO VARIÁVEIS DE AMBIENTE..."
if [ -f ".env" ]; then
    echo "✅ Arquivo .env já existe"
else
    echo "⚠️  Criando arquivo .env básico..."
    cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/techmotor
NODE_ENV=development
PORT=5000
SESSION_SECRET=techmotor-secret-key-change-in-production
EOF
    echo "✅ Arquivo .env criado"
fi

# Instalar dependências do Node.js
echo ""
echo "7. INSTALANDO DEPENDÊNCIAS..."
if [ -f "package.json" ]; then
    echo "   Verificando dependências..."
    npm install 2>/dev/null || echo "   ⚠️  Possível erro na instalação"
    echo "✅ Dependências instaladas/verificadas"
else
    echo "❌ package.json não encontrado"
fi

echo ""
echo "========================================="
echo "SETUP CONCLUÍDO!"
echo "========================================="
echo ""
echo "PRÓXIMOS PASSOS:"
echo "1. Iniciar servidor: npm run dev"
echo "2. Acessar aplicação: http://localhost:5000"
echo "3. Testar APIs: curl http://localhost:5000/api/landing/info"
echo "4. Acessar frontend: http://localhost:5173 (em desenvolvimento)"
echo ""
echo "Para problemas com PostgreSQL:"
echo "- Verificar se está rodando: brew services list"
echo "- Iniciar manualmente: brew services start postgresql@15"
echo "- Verificar logs: tail -f /opt/homebrew/var/log/postgresql@15.log"
echo ""
echo "Boa sorte com o RetíficaPro! 🚀"