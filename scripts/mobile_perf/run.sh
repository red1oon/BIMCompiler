#!/bin/bash
# P0 (MOBILE_PERF.md §D): Lighthouse mobile, CPU 4x slowdown, NO network throttle (isolates parse/compile/eval), cold profile.
S=$(dirname "$0"); LH=$S/tools/node_modules/.bin/lighthouse
for i in 1 2 3; do for tag in 818:8451 851:8452; do n=${tag%%:*}; p=${tag##*:}
  flock /tmp/claude-1000/gpu.lock $LH "http://localhost:$p/viewer/viewer.html?db=buildings/Duplex_extracted.db" \
    --only-categories=performance --form-factor=mobile --throttling-method=devtools \
    --throttling.cpuSlowdownMultiplier=4 --throttling.requestLatencyMs=0 --throttling.downloadThroughputKbps=0 --throttling.uploadThroughputKbps=0 \
    --max-wait-for-load=90000 --chrome-flags="--headless=new --no-first-run" \
    --output=json --output-path=$S/lh_${n}_$i.json --quiet; echo "§P0_RUN build=$n run=$i exit=$?"
done; done
