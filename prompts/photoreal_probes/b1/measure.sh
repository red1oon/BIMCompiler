#!/bin/bash
# measure.sh <tag> <db> <port> <openq> ; pose lines "name|[cam]|[tgt]" on stdin. open (reload=1) -> per pose: one Alt+S (gi=1, § lines),
# dark_cls -> fgeo once (pose-free) -> cells.js with the pose points. Logs: $S/<tag>_*.log. Read the logs, not this summary.
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad; P=/home/red1/bim-compiler/prompts/photoreal_probes
TAG=$1; DB=$2; PORT=$3; Q=$4; RE='§LIGHT_ZONE|§GLARE|§SKY_VIEW_FIELD on|§SKY_SHELL|§GROUND_VIEW_FIELD built|§STILL_STAGE_MS|§GI_STILL result|§FAULT|§METER camera|§ZONE_IDB_CACHE|PAGEERROR|Shader Error'
if [ "$Q" != "noopen" ]; then echo "== $TAG open $DB $Q $(date +%T)"; curl -s --max-time 500 "localhost:8631/open?port=$PORT&db=$DB&q=$Q&reload=1" > $S/${TAG}_open.log; tr -d '\n' < $S/${TAG}_open.log | cut -c1-200; echo; fi
PTS="["
while IFS='|' read -r NAME CAM TGT; do [ -z "$NAME" ] && continue
  if [ "$CAM" != "skip" ]; then echo "== $TAG alts $NAME $(date +%T)"; curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=$CAM" --data-urlencode "tgt=$TGT" --data-urlencode "gi=1" --data-urlencode "re=$RE" > $S/${TAG}_alts_${NAME}.log
    grep -o '"verdict": "[^"]*"\|compositeMean=[0-9.]*\|appMean=[0-9.]*\|stagingTotal=[0-9]*\|"zones":[0-9]*\|indoorCells":[0-9]*\|GLARE bld=[A-Za-z]* [A-Z]*\|§SKY_SHELL_RAYS[^"]\{0,160\}' $S/${TAG}_alts_${NAME}.log | tr '\n' ' '; echo
    curl -s --max-time 300 -X POST localhost:8631/eval --data-binary @$P/dark_cls.js > $S/${TAG}_darkcls_${NAME}.log; grep -o '"darkPct": [0-9.]*' $S/${TAG}_darkcls_${NAME}.log; fi
  C=$(echo "$CAM" | tr -d '[] '); PTS="$PTS['$NAME',$C],"
done
PTS="${PTS%,}]"
echo "== $TAG fgeo $(date +%T)"; curl -s --max-time 900 -X POST localhost:8631/eval --data-binary @$S/fgeo.js > $S/${TAG}_fgeo.log
node -e "const r=JSON.parse(require('fs').readFileSync('$S/${TAG}_fgeo.log')).result; if(!r){console.log('fgeo ERROR');process.exit()} console.log('ext', JSON.stringify(r.COVERED_exterior_geoMC_gt_0_2), 'open', JSON.stringify(r.OPEN_control_all.within01), r.totalMs, 'ms')"
echo "== $TAG cells $(date +%T)"; { echo "window.__b1pts = $PTS;"; cat $S/cells.js; } | curl -s --max-time 120 -X POST localhost:8631/eval --data-binary @- > $S/${TAG}_cells.log
node -e "const r=JSON.parse(require('fs').readFileSync('$S/${TAG}_cells.log')); console.log(r.result ? JSON.stringify(r.result.rows) : JSON.stringify(r))"
echo "== $TAG done $(date +%T)"
