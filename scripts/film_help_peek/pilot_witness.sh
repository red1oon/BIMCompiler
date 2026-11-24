#!/bin/bash
# ⚠ DO NOT REMOVE — film "Read from legacy's own code" (VOCAB_MESSAGE_CATALOG.md §19.20, owner: apply, shoot, remove). After legacy_shot.js: the WITNESS that the shared pilot is back as it was, and the L&F parity verdict. READ the logs; exit codes are not evidence.
#   out/pilot_witness.log: ad_ctxhelp must be 1, ad_tab links 0, ad_process links 0 (counts read from the pilot's own tables); out/lf_parity.log: scripts/bridge/witness_lf_parity.js (BRIDGE_OOTB = the bim-ootb tree the film used).
# Usage: pilot_witness.sh <bim-ootb tree>
set -u; cd "$(dirname "$0")"; OD="${OUTD:-out}"; TREE="$1"
q() { docker exec postgres psql -U adempiere -d idempiere_pilot -At -c "set search_path=adempiere; $1" | grep -v '^SET$'; }
{ echo "§PILOT_WITNESS $(date -Is) db=idempiere_pilot";
  a=$(q "select count(*) from ad_ctxhelp"); b=$(q "select count(*) from ad_tab where ad_ctxhelp_id is not null"); c=$(q "select count(*) from ad_process where ad_ctxhelp_id is not null")
  echo "§PILOT_COUNT ad_ctxhelp=$a (must be 1)"; echo "§PILOT_COUNT ad_tab_with_ctxhelp=$b (must be 0)"; echo "§PILOT_COUNT ad_process_with_ctxhelp=$c (must be 0)"
  if [ "$a" = 1 ] && [ "$b" = 0 ] && [ "$c" = 0 ]; then echo "§PILOT_VERDICT PASS 1/0/0"; else echo "§PILOT_VERDICT FAIL $a/$b/$c"; fi; } > $OD/pilot_witness.log 2>&1
cat $OD/pilot_witness.log
(cd ../bridge && BRIDGE_OOTB="$TREE" BRIDGE_UI_DB="$TREE/erp/ad_seed.db" NODE_PATH=/home/red1/bim-compiler/node_modules timeout 900 node witness_lf_parity.js) > $OD/lf_parity.log 2>&1; echo "lf exit=$?" >> $OD/lf_parity.log
grep "§LF_VERDICT\|§LF_FINDINGS\|lf exit" $OD/lf_parity.log
