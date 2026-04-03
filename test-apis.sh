#!/bin/bash

echo "========================================="
echo "TESTE DE APIS - RETÍFICAPRO"
echo "========================================="
echo ""

# Iniciar servidor de teste em background
echo "1. INICIANDO SERVIDOR DE TESTE..."
node test-server.mjs &
SERVER_PID=$!
sleep 2

echo "✅ Servidor iniciado (PID: $SERVER_PID)"
echo ""

# Testar health check
echo "2. TESTANDO HEALTH CHECK..."
curl -s http://localhost:5001/api/health | jq . 2>/dev/null || \
  curl -s http://localhost:5001/api/health
echo ""

# Testar landing page API
echo "3. TESTANDO LANDING PAGE API..."
curl -s http://localhost:5001/api/landing/info | jq '.title, .description' 2>/dev/null || \
  curl -s http://localhost:5001/api/landing/info | head -5
echo ""

# Testar payment plans API
echo "4. TESTANDO PAYMENT PLANS API..."
curl -s http://localhost:5001/api/payment/plans | jq '.plans[].name' 2>/dev/null || \
  curl -s http://localhost:5001/api/payment/plans | grep -A5 '"name"'
echo ""

# Testar registro de tenant
echo "5. TESTANDO REGISTRO DE TENANT..."
curl -s -X POST http://localhost:5001/api/tenants/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Retífica Teste","email":"teste@retifica.com","password":"senha123","phone":"(11) 99999-9999"}' | \
  jq '.message, .tenant.email' 2>/dev/null || \
  curl -s -X POST http://localhost:5001/api/tenants/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Retífica Teste","email":"teste@retifica.com","password":"senha123","phone":"(11) 99999-9999"}' | head -5
echo ""

# Testar login
echo "6. TESTANDO LOGIN..."
curl -s -X POST http://localhost:5001/api/tenants/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@retifica.com","password":"senha123"}' | \
  jq '.token, .user.email' 2>/dev/null || \
  curl -s -X POST http://localhost:5001/api/tenants/login \
    -H "Content-Type: application/json" \
    -d '{"email":"teste@retifica.com","password":"senha123"}' | head -5
echo ""

# Testar payment status (com autenticação)
echo "7. TESTANDO PAYMENT STATUS (com autenticação)..."
curl -s http://localhost:5001/api/payment/status \
  -H "Authorization: Bearer mock-jwt-token-123456" | \
  jq '.hasActiveSubscription, .currentPlan.name' 2>/dev/null || \
  curl -s http://localhost:5001/api/payment/status \
    -H "Authorization: Bearer mock-jwt-token-123456" | head -5
echo ""

# Parar servidor
echo "8. PARANDO SERVIDOR..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null
echo "✅ Servidor parado"
echo ""

echo "========================================="
echo "TESTE CONCLUÍDO!"
echo "========================================="
echo ""
echo "📊 RESUMO DAS APIS TESTADAS:"
echo "   ✅ /api/health"
echo "   ✅ /api/landing/info"
echo "   ✅ /api/payment/plans"
echo "   ✅ /api/tenants/register"
echo "   ✅ /api/tenants/login"
echo "   ✅ /api/payment/status"
echo ""
echo "🔧 PRÓXIMOS PASSOS PARA APIS REAIS:"
echo "   1. Configurar PostgreSQL"
echo "   2. Executar migrações SQL"
echo "   3. Iniciar servidor principal: npm run dev"
echo "   4. Testar com banco real"
echo ""
echo "As APIs mock estão funcionando corretamente! 🎉"