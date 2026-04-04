# TOOLS.md - Setup do RetíficaPro

## VPS
- Host: 187.77.60.16
- User: root
- Alias: srv1430825

## Docker
- App: techmotor-app-1 (porta 5000)
- DB: techmotor-postgres-1 (porta 5432)
- OpenClaw: openclaw-kqte-openclaw-1
- Compose: /opt/techmotor/docker-compose.yml

## Comandos essenciais
- Health: curl http://localhost:5000/api/health
- Logs: docker logs techmotor-app-1 --tail=50
- Restart: docker compose -f /opt/techmotor/docker-compose.yml up -d app
- Rebuild: docker compose -f /opt/techmotor/docker-compose.yml build app && docker compose -f /opt/techmotor/docker-compose.yml up -d app

## Banco
- URL: postgresql://postgres:postgres123@172.17.0.1:5432/techmotor
- Admin site: admin@retificapro.com.br / Admin@123

## LiteLLM + DeepSeek
- LiteLLM: porta 4000 em /docker/litellm/
- Proxy: porta 4001 (serviço litellm-proxy)
- DeepSeek API: sk-002365092bf3488298722b53617ff727
