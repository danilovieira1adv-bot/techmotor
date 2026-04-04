#!/bin/bash
# Script para iniciar monitor em background
MONITOR_SCRIPT="/data/.openclaw/workspace/monitor-openclaw.sh"
LOG="/data/.openclaw/workspace/monitor-service.log"

echo "[$(date)] Iniciando monitor do OpenClaw..." >> $LOG

# Loop infinito - verifica a cada 1 minuto
while true; do
 $MONITOR_SCRIPT
 sleep 60
done