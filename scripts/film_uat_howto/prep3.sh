#!/bin/bash
# ⚠ DO NOT REMOVE — film "UAT, hands on" PART III (prompts/FILM_UAT_GUIDE.md §5.16): the :8108 test instance around the take. NOT filmed. READ THE LOG (§P3_* lines).
# usage: prep3.sh up <logdir>    stop; back up idempiere_bimdoc; A2 (setup_test_instance.sh); start; A3.1 Pack In from a folder; A3.6 products script; restart; check TD_=12, PWD-=10 (guide: 'the construction-products script (10 materials at standard cost)')
#        prep3.sh ready <logdir>  (after up) stop; snapshot the PREPARED state as idempiere_film_p3_ready; start   ·   prep3.sh reset <logdir>  stop; idempiere_bimdoc <- the ready snapshot; start (before each take)
#        prep3.sh down <logdir>  stop; restore idempiere_bimdoc from the backup; check as found (TD_=0, imp_proc=1, the setup verdict recorded by 'up'); start; drop the backup
# The owner allowed copy and restore of :8108 (2026-11-20). 'up' refuses if the backup already exists (it may be the only good copy); 'down' refuses without it.
set -u; OP=$1; LOG=$2; mkdir -p "$LOG"; DB=idempiere_bimdoc; BAK=idempiere_film_p3_bak; RDY=idempiere_film_p3_ready; INST=~/idempiere-bimdoc; OOTB=~/bim-ootb; TD=$OOTB/capex/plugin/testdata_2pack
say(){ echo "$*" | tee -a "$LOG/prep3.log"; }
pq(){ docker exec -i postgres psql -U adempiere -d "${2:-postgres}" -v ON_ERROR_STOP=1 -qtA -c "$1"; }
q(){ pq "set search_path=adempiere; $1" $DB | tail -1; }
stop_i(){ sh $INST/stop.sh > "$LOG/stop.log" 2>&1; for i in $(seq 1 90); do ss -ltn | grep -q ':8108 ' || { say "§P3_STOP closed after ${i}s"; return 0; }; sleep 1; done; say "§P3_STOP FAIL :8108 still listening"; exit 2; }
start_i(){ sh $INST/start.sh > "$LOG/start.log" 2>&1; for i in $(seq 1 140); do [ "$(curl -s -o /dev/null -w '%{http_code}' -m 5 localhost:8108/webui/)" = 200 ] && { say "§P3_START up after $((i*3))s"; return 0; }; sleep 3; done; say "§P3_START FAIL no login page"; exit 2; }
counts(){ say "§P3_COUNTS $1 td_projects=$(q "select count(*) from c_project where value like 'TD\_%'") pwd_products=$(q "select count(*) from m_product where value like 'PWD-%'") imp_proc=$(q "select count(*) from ad_package_imp_proc") setup=\"$(DB=$DB bash $OOTB/capex/legacy/test_instance/setup_test_instance.sh --check | grep -o '§SETUP_VERDICT.*')\""; }
if [ "$OP" = up ]; then
  [ "$(pq "select count(*) from pg_database where datname='$BAK'")" = 0 ] || { say "§P3_REFUSED $BAK exists already (it may be the only good copy): restore with 'down' first"; exit 3; }
  counts before; grep '§P3_COUNTS before' "$LOG/prep3.log" | tail -1 > "$LOG/as_found.txt"
  stop_i; pq "CREATE DATABASE $BAK TEMPLATE $DB" && say "§P3_BACKUP made $BAK"
  DB=$DB bash $OOTB/capex/legacy/test_instance/setup_test_instance.sh > "$LOG/a2_setup.log" 2>&1; say "§P3_A2 $(grep -o '§SETUP_VERDICT.*' "$LOG/a2_setup.log")"
  start_i
  F=$(mktemp -d); cp $TD/202611131200_GardenWorld_CAPEXTestData.zip $F/; sh $INST/server/utils/RUN_ApplyPackInFromFolder.sh $F > "$LOG/a31_packin.log" 2>&1; rm -rf $F
  say "§P3_A31 $(grep -E 'Successful application|Error=' "$LOG/a31_packin.log" | tr '\n' ' ' | cut -c1-200)"
  cat $TD/202611141500_CAPEX-TD-CONSTRUCTION-PRODUCTS.sql | docker exec -i postgres psql -U adempiere -d $DB -v ON_ERROR_STOP=1 -qtA -c "set search_path=adempiere" -f - > "$LOG/a36_products.log" 2>&1; say "§P3_A36 rc=$?"
  stop_i; start_i; counts after
  grep -q 'td_projects=12 pwd_products=10' <(grep '§P3_COUNTS after' "$LOG/prep3.log" | tail -1) && say "§P3_UP_VERDICT PASS" || { say "§P3_UP_VERDICT FAIL (the take must not start)"; exit 4; }
elif [ "$OP" = ready ]; then
  stop_i; pq "DROP DATABASE IF EXISTS $RDY" > /dev/null; pq "CREATE DATABASE $RDY TEMPLATE $DB" && say "§P3_READY snapshot $RDY"; start_i; counts ready
elif [ "$OP" = reset ]; then
  [ "$(pq "select count(*) from pg_database where datname='$RDY'")" = 1 ] || { say "§P3_REFUSED no ready snapshot $RDY"; exit 3; }
  stop_i; pq "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB'" > /dev/null; pq "DROP DATABASE $DB" && pq "CREATE DATABASE $DB TEMPLATE $RDY" && say "§P3_RESET $DB <- $RDY"
  start_i; counts reset; say "§P3_RESET_ORDERS c_order_td=$(q "select count(*) from c_order o join c_project p using(c_project_id) where p.value like 'TD\_%'")"
elif [ "$OP" = down ]; then
  [ "$(pq "select count(*) from pg_database where datname='$BAK'")" = 1 ] || { say "§P3_REFUSED no backup $BAK: refusing to drop $DB"; exit 3; }
  stop_i; pq "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB'" > /dev/null
  pq "DROP DATABASE $DB" && pq "CREATE DATABASE $DB TEMPLATE $BAK" && say "§P3_RESTORE $DB recreated from $BAK"
  counts restored; A=$(sed 's/.*td_projects/td_projects/' "$LOG/as_found.txt"); R=$(grep '§P3_COUNTS restored' "$LOG/prep3.log" | tail -1 | sed 's/.*td_projects/td_projects/')
  [ "$A" = "$R" ] && say "§P3_RESTORE_CHECK PASS equal to as found: $R" || { say "§P3_RESTORE_CHECK FAIL as found: $A | now: $R (backup KEPT)"; start_i; exit 5; }
  start_i; pq "DROP DATABASE $BAK" && pq "DROP DATABASE IF EXISTS $RDY" && say "§P3_DOWN_VERDICT PASS backup and ready snapshot dropped"
fi
