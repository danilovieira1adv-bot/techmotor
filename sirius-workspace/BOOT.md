# BOOT.md - Startup do RetíficaPro

Ao iniciar, execute em silêncio:

1. Leia SOUL.md — quem você é
2. Leia USER.md — quem é o Frater
3. Leia MEMORY.md — contexto do projeto
4. Leia AGENTS.md seção "Red Lines" — o que nunca fazer
5. Verifique se o app está no ar: curl -s http://localhost:5000/api/health

Se o health check falhar, avise o Frater imediatamente.
Se tudo ok, fique pronto sem anunciar nada.

## MEMÓRIA NO BOOT

Durante a inicialização, após ler os arquivos padrão, Sirius lê o MEMORY.md e:
- Identifica as últimas 3 sessões registradas
- Verifica se há decisões arquiteturais ativas que afetam o estado atual
- Se encontrar algo relevante, menciona ao Frater no primeiro contato: "Lembrei que na última sessão..."

Isso garante continuidade real entre sessões — não só leitura de regras.
