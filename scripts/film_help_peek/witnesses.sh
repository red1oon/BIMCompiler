#!/bin/bash
# ⚠ DO NOT REMOVE — film v3: the witnesses the admin report card reads, run ONCE on the recording day on the same main tree (logs into out/, READ them; an exit code is not evidence). Usage: witnesses.sh <bim-ootb tree>
T="$1"; OD="$(cd "$(dirname "$0")" && pwd)/out"; cd "$T"; export NODE_PATH=/home/red1/bim-compiler/node_modules
node erp/tests/witness_ctxhelp_overlay.js > $OD/witness_ctxhelp_overlay.log 2>&1; echo "exit=$?" >> $OD/witness_ctxhelp_overlay.log
node erp/tests/witness_ctxhelp_derived.js > $OD/witness_ctxhelp_derived_main.log 2>&1; echo "exit=$?" >> $OD/witness_ctxhelp_derived_main.log
DV_BREAK=srcline node erp/tests/witness_ctxhelp_derived.js > $OD/witness_ctxhelp_derived_red_srcline.log 2>&1; echo "exit=$?" >> $OD/witness_ctxhelp_derived_red_srcline.log
node erp/tests/witness_ctxhelp_legacy.js > $OD/witness_ctxhelp_legacy.log 2>&1; echo "exit=$?" >> $OD/witness_ctxhelp_legacy.log
echo "§WITNESSES_DONE $(date -Is)" > $OD/witnesses.done
