#!/bin/bash

echo "🚀 Testando API do RetíficaPro"
echo "================================"

# Testar health check
echo "1. Health check:"
curl -s http://localhost:3000/api/health | jq . || echo "Servidor não está rodando ou jq não instalado"

echo ""
echo "2. Informações da landing page:"
curl -s http://localhost:3000/api/landing/info | jq '.title, .description' || echo "Rota não disponível"

echo ""
echo "3. Testar cadastro de tenant:"
curl -s -X POST http://localhost:3000/api/tenants/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Retífica Teste",
    "email": "teste@retifica.com",
    "senha": "teste123",
    "telefone": "(11) 99999-9999",
    "plano": "profissional"
  }' | jq '.message, .tenant.nome' || echo "Falha no cadastro"

echo ""
echo "4. Testar login:"
curl -s -X POST http://localhost:3000/api/tenants/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "exemplo@retifica.com",
    "senha": "demo123"
  }' | jq '.message, .tenant.nome, .token' || echo "Falha no login"

echo ""
echo "✅ Testes completos!"
echo ""
echo "📋 Endpoints disponíveis:"
echo "  GET  /api/health"
echo "  GET  /api/landing/info"
echo "  POST /api/tenants/register"
echo "  POST /api/tenants/login"
echo "  GET  /api/tenants/me (requer token)"
echo "  GET  /api/subscription/status (requer token)"