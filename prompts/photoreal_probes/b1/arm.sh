#!/bin/bash
# arm.sh <prefix> <port> <extraQ> [poses-file]: fresh-profile first press per pose line "name|db|q|cam|tgt"; § lines + lum.js stats
S=/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad; PFX=$1; PORT=$2; XQ=$3; PF=${4:-$S/poses.txt}
RE='§METER|§GLARE|§GI_STILL result|§FAULT |§STILL_STAGE_MS|§COVE_QUAL|§COVE_LIGHT build|§LAMP_EN applied|§SOURCED_LIGHT on|PAGEERROR|Shader Error'
while IFS='|' read -r N DB Q C T; do [ -z "$N" ] && continue; L=$S/${PFX}_$N
  curl -s --max-time 60 localhost:8631/close >/dev/null; SW=$(curl -s localhost:$PORT/viewer/sw.js | grep -o "CACHE_VERSION = '[^']*'" | head -1 | tr -d "'")
  curl -s --max-time 500 "localhost:8631/open?port=$PORT&db=$DB&q=$Q$XQ&reload=1" > /dev/null
  curl -s -G --max-time 700 "localhost:8631/alts" --data-urlencode "cam=$C" --data-urlencode "tgt=$T" --data-urlencode "gi=1" --data-urlencode "re=$RE" > $L.log
  curl -s --max-time 120 -X POST localhost:8631/eval --data-binary @$S/lum.js > ${L}_lum.log
  node -e "const f=require('fs'),a=JSON.parse(f.readFileSync('$L.log')),r=JSON.parse(f.readFileSync('${L}_lum.log')).result,ln=a.lines||[];const g=re=>{const x=ln.find(l=>re.test(l));return x||''};
   const m=g(/§METER/), gl=(g(/§GLARE/).match(/GLARE bld=\S+ \w+ black_exterior=\d+ junction_zone_flip=\d+ covered_open_side_black=\d+/)||[''])[0], cm=(g(/§GI_STILL result/).match(/compositeMean=[\d.]+/)||[''])[0];
   console.log('$PFX $N [$SW] '+cm+' '+gl.replace(/black_exterior=|junction_zone_flip=|covered_open_side_black=/g,'')+' | comp p5/50/95='+r.comp.p5+'/'+r.comp.p50+'/'+r.comp.p95+' le15='+r.comp.le15pct+'% ge250='+r.comp.ge250pct+'% exp='+r.exposure+'\n   '+m.slice(0,420))"
done < $PF
echo "== $PFX done $(date +%T)"
