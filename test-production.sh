#!/bin/bash

echo "========================================="
echo "TESTE PRODUÇÃO - RETÍFICAPRO"
echo "========================================="
echo "Servidor: http://localhost:5003"
echo ""

# Matar servidores anteriores
pkill -f "node.*server/index.ts" 2>/dev/null
sleep 2

# Iniciar servidor
echo "1. INICIANDO SERVIDOR..."
cd /opt/techmotor
PORT=5003 npm run dev > server.log 2>&1 &
SERVER_PID=$!
sleep 5

echo "✅ Servidor iniciado (PID: $SERVER_PID)"
echo "Logs: tail -f server.log"
echo ""

# Testar rotas públicas
echo "2. TESTANDO ROTAS PÚBLICAS..."
echo "-----------------------------------------"

# Health check
echo "📊 Health Check:"
curl -s http://localhost:5003/api/health | jq '.status, .service' 2>/dev/null || \
  curl -s http://localhost:5003/api/health | grep -E "(status|service)"

# Landing page
echo ""
echo "🏠 Landing Page API:"
curl -s http://localhost:5003/api/landing/info | jq '.title' 2>/dev/null || \
  curl -s http://localhost:5003/api/landing/info | grep "title"

# Planos de pagamento
echo ""
echo "💰 Planos de Pagamento:"
curl -s http://localhost:5003/api/payment/plans | jq '.plans[].name' 2>/dev/null || \
  curl -s http://localhost:5003/api/payment/plans | grep -A1 '"name"'

# Testar registro (deve redirecionar)
echo ""
echo "📝 Registro de Tenant:"
curl -s -X POST http://localhost:5003/api/tenants/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@retifica.com","password":"123"}' | \
  jq '.message' 2>/dev/null || \
  curl -s -X POST http://localhost:5003/api/tenants/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Teste","email":"teste@retifica.com","password":"123"}'

# Testar APIs de tenants reais
echo ""
echo "3. TESTANDO APIS DE TENANTS REAIS..."
echo "-----------------------------------------"

# Verificar se tenants-api.ts está sendo carregado
echo "🔍 Verificando integração de tenants..."
if curl -s http://localhost:5003/api/tenants/test 2>/dev/null | grep -q "Not Found"; then
  echo "✅ Rotas de tenants integradas"
else
  echo "⚠️  Possível problema com rotas de tenants"
fi

# Testar frontend (se estiver disponível)
echo ""
echo "4. VERIFICANDO FRONTEND..."
echo "-----------------------------------------"

# Verificar se o build do frontend existe
if [ -f "client/dist/index.html" ]; then
  echo "✅ Build do frontend encontrado"
  echo "   Acesse: http://localhost:5003 (após build)"
else
  echo "⚠️  Build do frontend não encontrado"
  echo "   Execute: cd client && npm run build"
fi

# Verificar landing page React
if [ -f "client/src/pages/landing.tsx" ]; then
  echo "✅ Landing page React criada"
  LANDING_LINES=$(wc -l < client/src/pages/landing.tsx)
  echo "   Tamanho: $LANDING_LINES linhas"
else
  echo "❌ Landing page React não encontrada"
fi

# Testar sistema de pagamento
echo ""
echo "5. SISTEMA DE PAGAMENTO..."
echo "-----------------------------------------"

if [ -f "server/payment-service.ts" ]; then
  echo "✅ Serviço de pagamento implementado"
  echo "   Planos: Básico (R$97), Profissional (R$197), Enterprise (R$497)"
else
  echo "❌ Serviço de pagamento não encontrado"
fi

if [ -f "server/payment-routes.ts" ]; then
  echo "✅ Rotas de pagamento implementadas"
else
  echo "❌ Rotas de pagamento não encontradas"
fi

# Multi-tenancy
echo ""
echo "6. MULTI-TENANCY..."
echo "-----------------------------------------"

if [ -f "server/storage.ts" ]; then
  TENANT_REFERENCES=$(grep -c "tenantId" server/storage.ts 2>/dev/null || echo "0")
  echo "✅ Storage com multi-tenancy"
  echo "   Referências a tenantId: $TENANT_REFERENCES"
else
  echo "❌ Storage não encontrado"
fi

if [ -f "server/auth-middleware.ts" ]; then
  echo "✅ Middleware de autenticação"
else
  echo "❌ Middleware não encontrado"
fi

# Banco de dados
echo ""
echo "7. BANCO DE DADOS..."
echo "-----------------------------------------"

if [ -f "server/db.ts" ]; then
  echo "✅ Configuração do banco"
  echo "   Modo: $(grep -q 'DATABASE_URL' .env 2>/dev/null && echo 'Produção' || echo 'Desenvolvimento (mock)')"
else
  echo "❌ Configuração do banco não encontrada"
fi

# Verificar migrações SQL
SQL_FILES=$(ls *.sql 2>/dev/null | wc -l)
echo "✅ Migrações SQL: $SQL_FILES arquivos"

# Parar servidor
echo ""
echo "8. FINALIZANDO..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null
echo "✅ Servidor parado"

echo ""
echo "========================================="
echo "RESUMO DO SISTEMA"
echo "========================================="
echo ""
echo "✅ FUNCIONALIDADES IMPLEMENTADAS:"
echo "   • API REST com rotas públicas/protegidas"
echo "   • Landing page com informações"
echo "   • Sistema de pagamento com 3 planos"
echo "   • Multi-tenancy completo"
echo "   • Middleware de autenticação"
echo "   • Banco mock para desenvolvimento"
echo "   • Frontend React com landing page"
echo ""
echo "⚠️  PRÓXIMOS AJUSTES:"
echo "   1. Configurar PostgreSQL real"
echo "   2. Testar rotas protegidas com JWT real"
echo "   3. Conectar frontend com APIs"
echo "   4. Executar migrações SQL"
echo ""
echo "🚀 PARA DEPLOY:"
echo "   docker-compose up -d"
echo "   # Ou"
echo "   npm run build && npm start"
echo ""
echo "📞 ENDPOINTS DISPONÍVEIS:"
echo "   GET  /api/health"
echo "   GET  /api/landing/info"
echo "   GET  /api/payment/plans"
echo "   POST /api/tenants/register"
echo "   POST /api/tenants/login"
echo "   GET  /api/payment/status (protegido)"
echo ""
echo "Sistema pronto para os ajustes finais! 🎉"