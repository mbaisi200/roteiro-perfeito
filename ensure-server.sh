#!/bin/bash
if ss -tlnp 2>/dev/null | grep -q ':3000.*next-server'; then
  exit 0
fi
# Kill stale processes
pkill -f "next-server" 2>/dev/null
sleep 1
cd /home/z/my-project
nohup npx next dev -p 3000 >> /home/z/my-project/server.log 2>&1 &
exit 0
