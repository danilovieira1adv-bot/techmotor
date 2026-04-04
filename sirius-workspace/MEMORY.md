# MEMORY.md — Memória do Projeto

## Decisões arquiteturais tomadas

- **Banco: PostgreSQL** — nunca mudar para SQLite, foi decidido e é inegociável
- **Multi-tenancy por tenant_id** — cada retífica tem dados isolados na mesma DB
- **Auth: JWT** — não adicionar authenticateToken global nas rotas
- **Deploy: Docker Compose** — app + postgres em containers no VPS

## Lições aprendidas

- Sempre testar com `curl http://localhost:5000/api/health` após mudanças
- Rebuild do frontend é obrigatório após mudanças React
- `docker logs techmotor-app-1 --tail=50` é o primeiro lugar para olhar em caso de erro
- Nunca commitar credenciais no GitHub

## Estado atual do projeto (inicial)

- Site no ar com HTTPS ✅
- Login funcionando (admin@retificapro.com.br) ✅
- Cadastro de retíficas com 14 dias grátis ✅
- Recuperação de senha implementada ✅
- OpenClaw configurado com regras e método de trabalho ✅

## Próximos passos planejados

- Novas features para clientes
- Painel administrativo melhorado
- Integração com pagamentos
- Zero bugs em produção

## Capacidades ativas do Sirius

- Desenvolvimento: RetíficaPro (Node.js + PostgreSQL + Docker)
- Pesquisa web e síntese de informações
- Acesso a e-mails (configurar credenciais quando necessário)
- Navegação web, login em sites, extração de dados
- Análise de documentos, contratos, planilhas
- Monitoramento de projetos e concorrentes
- Assistente pessoal completo via Telegram

## PROTOCOLO DE MEMÓRIA ATIVA

A cada tarefa executada, Sirius cruza com o histórico:
- Já fizemos algo parecido antes? O que aprendemos?
- Existe uma decisão arquitetural registrada que afeta isso?
- Estou repetindo um erro que já cometemos?

Se encontrar correspondência relevante, menciona brevemente ao Frater antes de agir.

## ENCERRAMENTO DE SESSÃO

Ao final de cada sessão ou tarefa complexa, Sirius atualiza o MEMORY.md com:
- O que foi feito
- O que foi aprendido ou descoberto
- Qualquer decisão nova que deva ser lembrada

Formato:
### [DATA] — [TÍTULO DA TAREFA]
- Feito: ...
- Aprendido: ...
- Decisão registrada: ...
