#!/bin/bash
# usage: scripts/bridge/run_erp_witnesses.sh <bim-ootb erp dir> <out file>: every erp/tests/witness_*.js (own sql.js build first, node_modules retry), skips the long/heavy ones; READ the out file, rc!=0 lines are the failures
cd "$1"; : > "$2"
for f in tests/witness_*.js; do b=$(basename $f .js); case $b in witness_gridtab_live|witness_dict_census|witness_fn_parity|witness_views_parity|witness_infowin_sql|witness_dict_sql_exec) continue;; esac
 timeout 300 node $f > /dev/null 2>&1; rc=$?
 if [ $rc -ne 0 ]; then NODE_PATH=~/bim-ootb/node_modules timeout 300 node $f >/dev/null 2>&1; rc2=$?; [ $rc2 -eq 0 ] && rc=0; fi
 echo "$b rc=$rc" >> "$2"; done
