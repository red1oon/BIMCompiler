#!/bin/bash
cd /tmp/wt-f1
L=/home/red1/bim-compiler/build/scriptor/f1_mailboxes
export NODE_PATH=/home/red1/bim-ootb/tests/node_modules
for w in witness_team_so witness_team_base witness_team_executors witness_team_publish witness_team_versions witness_team_docaction witness_pos_plan witness_docno_till witness_team_floor witness_team_seatbelt witness_team_terms witness_team_plan; do
  [ -f erp/tests/$w.js ] || continue
  timeout 1500 node erp/tests/$w.js > $L/regress_$w.log 2>&1; echo "$w exit=$?" >> $L/regress_summary.txt
done
node /home/red1/bim-compiler/scripts/witness_hq_hotspots.js /tmp/wt-f1 --base /home/red1/bim-ootb > $L/regress_hq_hotspots.log 2>&1; echo "hq_hotspots exit=$?" >> $L/regress_summary.txt
echo ALLDONE >> $L/regress_summary.txt
