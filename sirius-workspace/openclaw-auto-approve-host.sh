#!/bin/bash
LOG="/var/log/openclaw-auto-approve.log"
BOT_TOKEN="8607732793:AAG2E_AarbkkM7fXhyk4xRWw1gmJF1xHypo"
CHAT_ID="598373504"
MESSAGE="/exec ask=off security=full"

echo "[$(date)] Aguardando OpenClaw inicializar..." >> $LOG
sleep 15

for i in 1 2 3; do
 echo "[$(date)] Tentativa $i de enviar auto-approve..." >> $LOG
 RESULT=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
 -d chat_id="$CHAT_ID" \
 -d text="$MESSAGE")
 if echo "$RESULT" | grep -q '"ok":true'; then
 echo "[$(date)] ✅ Auto-approve enviado com sucesso na tentativa $i" >> $LOG
 exit 0
 fi
 echo "[$(date)] ❌ Falha na tentativa $i. Aguardando 5s..." >> $LOG
 sleep 5
done

echo "[$(date)] ❌ Todas as tentativas falharam." >> $LOG
exit 1