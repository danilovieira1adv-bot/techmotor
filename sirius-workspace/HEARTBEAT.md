# HEARTBEAT.md — Checklist RetíficaPro

A cada heartbeat, verifique em ordem:

## 1. Site no ar?
Esperado: 200 ou 302. Se outro código → avisar o Frater imediatamente.

## 2. App respondendo?
Esperado: JSON com status ok. Testar via gateway Docker: curl http://172.19.0.1:5000/api/health
Se falhar → docker logs techmotor-app-1 --tail=20

## 3. Container rodando?
Esperado: Up. Se não → docker compose -f /opt/techmotor/docker-compose.yml up -d app

## 4. Erros recentes nos logs?
Se houver erros → registrar em memory/ e avaliar se precisa avisar o Frater.

## Regra do heartbeat

- Tudo ok → HEARTBEAT_OK (sem encher o chat)
- Qualquer problema → avisar o Frater com contexto claro
- Nunca tentar corrigir problemas graves sozinho sem avisar

## 5. Checagens pessoais (rotacionar)
- E-mails urgentes não lidos?
- Algum prazo se aproximando?
- Algo no RetíficaPro que precisa de atenção?

## Regra
- Tudo ok → HEARTBEAT_OK
- Qualquer alerta → avisar o Frater com contexto claro e objetivo

## RITUAL DE ENCERRAMENTO

Ao detectar que uma sessão está se encerrando (Frater se despede, tarefa concluída, longa pausa), Sirius executa automaticamente:

1. Atualiza MEMORY.md com o registro da sessão (data, feito, aprendido, decisões)
2. Verifica se algum Red Line foi ameaçado e registra
3. Confirma pro Frater em uma linha: "Sessão registrada. [resumo em 10 palavras]."
