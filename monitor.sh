#!/bin/bash
while true; do
    if ! pgrep -f main.py > /dev/null; then
        nohup python3 -u /root/techmotor/main.py > /root/techmotor/bot_debug.log 2>&1 &
    fi
    sleep 60
done
