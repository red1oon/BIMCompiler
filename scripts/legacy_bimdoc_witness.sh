#!/usr/bin/env bash
# ⚠ DO NOT REMOVE — W-BIMDOC-LEGACY L2/L3 on the BIM Document TEST instance (run scripts/legacy_bimdoc_refresh.sh first). Read the log: the §W-BIMDOC-LEGACY line is the verdict.
# Sends the console command `bimdocwitness` (the test bundle org.idempiere.bimdocument.test) to the running instance's OSGi console and prints what it answers. The test creates its rows in
# one transaction and ROLLS IT BACK. The model layer needs the OSGi runtime, so it cannot run in a standalone JVM.
set -uo pipefail
INST="${INST:-$HOME/idempiere-bimdoc}"; PORT="${CONSOLE_PORT:-12622}"
pgrep -f "[i]dempiere-bimdoc/server/plugins/org.eclipse.equinox.launcher" >/dev/null || { echo "§W-BIMDOC-LEGACY INCONCLUSIVE the instance is not running (start it: $INST/start.sh)"; exit 1; }
OUT="$(mktemp)"
exec 3<>/dev/tcp/127.0.0.1/"$PORT" || { echo "§W-BIMDOC-LEGACY INCONCLUSIVE no console on $PORT"; exit 1; }
cat <&3 > "$OUT" &
RD=$!; sleep 1; echo "bimdocwitness" >&3
for i in $(seq 1 90); do grep -q "§W-BIMDOC-LEGACY \(PASS\|FAIL\|INCONCLUSIVE\|ERROR\)" "$OUT" && break; sleep 1; done
echo "close" >&3; sleep 1; kill $RD 2>/dev/null; exec 3>&-
grep -a -v "^osgi>\|^$" "$OUT" | cut -c1-300
grep -aq "§W-BIMDOC-LEGACY PASS" "$OUT"; rc=$?; rm -f "$OUT"; exit $rc
