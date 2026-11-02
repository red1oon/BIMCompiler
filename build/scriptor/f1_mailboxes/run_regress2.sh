#!/bin/bash
cd /tmp/wt-f1
L=/home/red1/bim-compiler/build/scriptor/f1_mailboxes
export NODE_PATH=/home/red1/bim-ootb/tests/node_modules
LN='[{"i_isimported":"N","issotrx":"Y","doctypename":"POS Order","m_product_id":123,"qtyordered":1,"c_uom_id":100,"dateordered":"2026-10-27 00:00:00"},{"i_isimported":"N","issotrx":"Y","doctypename":"POS Order","m_product_id":130,"qtyordered":1,"c_uom_id":100,"dateordered":"2026-10-27 00:00:00"},{"i_isimported":"N","issotrx":"Y","doctypename":"POS Order","m_product_id":123,"qtyordered":2,"c_uom_id":100,"dateordered":"2026-10-27 00:00:00"}]'
export PC_LINES="$LN" FL_LINES="$LN"
rm -f $L/regress2_summary.txt
for w in witness_pos_plan witness_team_floor witness_team_so witness_team_base witness_team_executors witness_team_publish witness_team_versions witness_team_docaction witness_docno_till witness_team_seatbelt witness_team_terms witness_team_plan witness_pos_chain; do
  [ -f erp/tests/$w.js ] || continue
  timeout 2400 node erp/tests/$w.js > $L/regress2_$w.log 2>&1; echo "$w exit=$?" >> $L/regress2_summary.txt
done
node /home/red1/bim-compiler/scripts/witness_hq_hotspots.js /tmp/wt-f1 --base /home/red1/bim-ootb > $L/regress2_hq_hotspots.log 2>&1; echo "hq_hotspots exit=$?" >> $L/regress2_summary.txt
echo ALLDONE >> $L/regress2_summary.txt
