#!/bin/sh
# §SHOPDAY-RUN-1 Stage 3: one shop day on a FRESH throwaway client (opt-in; run_all.sh calls it with SHOPDAY=1). Needs docker postgres + the pilot (:8088) with the
# D6 config rows of scripts/bridge/pilot/ws_shopday_*.sql applied (once). Steps: create the client on legacy as SuperUser (InitialClientSetup via run_process), grant
# its Admin role the WS types (admin lane), RESTART the pilot (WS config is cached), run SD-00..SD-nn. Output: the driver's §SHOPDAY_* lines.
# env: SHOPDAY_CLIENT=<name> (default ShopDay<mmddHHMMSS>); SHOPDAY_SKIP=SD-06,... (steps to leave out)
cd "$(dirname "$0")" || exit 1
NAME=${SHOPDAY_CLIENT:-ShopDay$(date +%m%d%H%M%S)}; export SHOPDAY_CLIENT=$NAME
echo "§SHOPDAY_RUN client=$NAME"
node cycle_shopday.js --create 2>&1 | grep '^§SHOPDAY'
~/idempiere-pilot/stop.sh >/dev/null 2>&1; sleep 6; ~/idempiere-pilot/start.sh
c=000; i=0; while [ "$c" != 200 ] && [ $i -lt 60 ]; do c=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8088/webui/); i=$((i+1)); [ "$c" = 200 ] || sleep 5; done; sleep 10
echo "§SHOPDAY_RESTART pilot up http=$c"
if [ -n "$SHOPDAY_SKIP" ]; then node cycle_shopday.js --skip "$SHOPDAY_SKIP"; else node cycle_shopday.js; fi
