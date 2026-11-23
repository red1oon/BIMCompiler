#!/bin/bash
# ⚠ DO NOT REMOVE — film "UAT, hands on" PART III, the LEGACY B4 scenes (prompts/FILM_UAT_GUIDE.md §5.18 L2): the BIM OOTB plugin on the :8108 test instance, around a backup. NOT filmed.
# READ THE LOG (§PL_* lines). The owner allowed copy and restore of :8108 (2026-11-20).
# usage: prepL.sh up <logdir> <bundles dir>   stop; back up idempiere_bimdoc; the two bundle folders into plugins/ + 2 bundles.info lines; start (the plugin's activator packs in its 2Pack);
#                                              "BIM OOTB Push" included in role 102 (GardenWorld Admin); restart; checks: 2Pack row, BIMOOTB types, /bimootb/viewer/viewer.html 200
#        prepL.sh ready <logdir>              (after up) stop; snapshot the installed state as idempiere_film_pl_ready; start   ·   prepL.sh reset <logdir>  stop; idempiere_bimdoc <- that snapshot; start (before each take)
#        prepL.sh down <logdir>               stop; idempiere_bimdoc <- the backup; the bundles.info lines and the plugin folders removed; checks as found; drop the backup. Leaves :8108 STOPPED (as found).
# 'up' refuses if the backup exists (it may be the only good copy); 'down' refuses without it.
set -u; OP=$1; LOG=$2; mkdir -p "$LOG"; DB=idempiere_bimdoc; BAK=idempiere_film_pl_bak; RDY=idempiere_film_pl_ready; INST=~/idempiere-bimdoc; SRV=$INST/server; BI=$SRV/configuration/org.eclipse.equinox.simpleconfigurator/bundles.info
say(){ echo "$*" | tee -a "$LOG/prepL.log"; }
pq(){ docker exec -i postgres psql -U adempiere -d "${2:-postgres}" -v ON_ERROR_STOP=1 -qtA -c "$1"; }
q(){ pq "set search_path=adempiere; $1" $DB | tail -1; }
stop_i(){ sh $INST/stop.sh > "$LOG/stop.log" 2>&1; for i in $(seq 1 90); do ss -ltn | grep -q ':8108 ' || { say "§PL_STOP closed after ${i}s"; return 0; }; sleep 1; done; say "§PL_STOP FAIL :8108 still listening"; exit 2; }
start_i(){ sh $INST/start.sh > "$LOG/start.log" 2>&1; for i in $(seq 1 140); do [ "$(curl -s -o /dev/null -w '%{http_code}' -m 5 localhost:8108/webui/)" = 200 ] && { say "§PL_START up after $((i*3))s"; return 0; }; sleep 3; done; say "§PL_START FAIL no login page"; exit 2; }
state(){ say "§PL_STATE $1 bundles_info=$(grep -c bimootb $BI) folders=$(ls -d $SRV/plugins/org.idempiere.bimootb* 2>/dev/null | wc -l) types=$(q "select count(*) from ws_webservicetype where value like 'BIMOOTB\_%'") pkg_ok=$(q "select count(*) from ad_package_imp where name='org.idempiere.bimootb' and pk_status like 'Completed%'") role_incl=$(q "select count(*) from ad_role_included i join ad_role r on r.ad_role_id=i.included_role_id where i.ad_role_id=102 and r.name='BIM OOTB Push'") shed=$(q "select count(*) from c_project where value='SHED'") imp_proc=$(q "select count(*) from ad_package_imp_proc")"; }
if [ "$OP" = up ]; then
  BD=$3; J=$(ls -d $BD/org.idempiere.bimootb_13.1.0.* | head -1); V=$(ls -d $BD/org.idempiere.bimootb.viewer_13.1.0.* | head -1); [ -d "$J" ] && [ -d "$V" ] || { say "§PL_REFUSED no bundles in $BD"; exit 3; }
  [ "$(pq "select count(*) from pg_database where datname='$BAK'")" = 0 ] || { say "§PL_REFUSED $BAK exists already: run 'down' first"; exit 3; }
  [ "$(grep -c bimootb $BI)" = 0 ] || { say "§PL_REFUSED bundles.info already names bimootb: not as found"; exit 3; }
  state before; grep '§PL_STATE before' "$LOG/prepL.log" | tail -1 | sed 's/.*bundles_info/bundles_info/' > "$LOG/as_found_pl.txt"
  stop_i; pq "CREATE DATABASE $BAK TEMPLATE $DB" && say "§PL_BACKUP made $BAK"; cp "$BI" "$LOG/bundles.info.as_found"
  cp -r "$J" "$V" $SRV/plugins/; JV=${J##*_}; VV=${V##*_}
  printf 'org.idempiere.bimootb,%s,plugins/%s/,4,true\norg.idempiere.bimootb.viewer,%s,plugins/%s/,4,true\n' "$JV" "$(basename $J)" "$VV" "$(basename $V)" >> "$BI"; say "§PL_INSTALL $(basename $J) $(basename $V)"
  start_i
  # the activator packs in AFTER the login page answers (measured 2026-11-22: the first read came too early): wait for the 2Pack's role, up to 180 s
  RID=""; for i in $(seq 1 60); do RID=$(q "select ad_role_id from ad_role where name='BIM OOTB Push'"); [ -n "$RID" ] && { say "§PL_PACKED_IN role 'BIM OOTB Push'=$RID after $((i*3))s"; break; }; sleep 3; done
  state packed_in; [ -n "$RID" ] || { say "§PL_FAIL no 'BIM OOTB Push' role 180 s after start (2Pack not applied?)"; exit 4; }
  # the admin's one step (§8.4 P4), done here by SQL on the TEST instance only: include the plugin's master role in GardenWorld Admin (102), then restart (WS access is cached per role)
  pq "set search_path=adempiere; INSERT INTO ad_role_included (ad_client_id, ad_org_id, ad_role_id, included_role_id, seqno, isactive, created, createdby, updated, updatedby, ad_role_included_uu) VALUES (11, 0, 102, $RID, 900, 'Y', now(), 100, now(), 100, gen_random_uuid())" $DB > /dev/null && say "§PL_ROLE_INCLUDED 'BIM OOTB Push' ($RID) in role 102"
  stop_i; start_i; state after
  C=$(curl -s -o /dev/null -w '%{http_code} %{content_type}' -m 20 localhost:8108/bimootb/viewer/viewer.html); say "§PL_VIEWER_SERVED /bimootb/viewer/viewer.html $C"
  grep '§PL_STATE after' "$LOG/prepL.log" | tail -1 | grep -q 'pkg_ok=[1-9].*role_incl=1' && [ "${C%% *}" = 200 ] && say "§PL_UP_VERDICT PASS" || { say "§PL_UP_VERDICT FAIL"; exit 4; }
elif [ "$OP" = ready ]; then
  stop_i; pq "DROP DATABASE IF EXISTS $RDY" > /dev/null; pq "CREATE DATABASE $RDY TEMPLATE $DB" && say "§PL_READY snapshot $RDY"; start_i; state ready
elif [ "$OP" = reset ]; then
  [ "$(pq "select count(*) from pg_database where datname='$RDY'")" = 1 ] || { say "§PL_REFUSED no ready snapshot $RDY"; exit 3; }
  stop_i; pq "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB'" > /dev/null; pq "DROP DATABASE $DB" && pq "CREATE DATABASE $DB TEMPLATE $RDY" && say "§PL_RESET $DB <- $RDY"; start_i; state reset
elif [ "$OP" = down ]; then
  [ "$(pq "select count(*) from pg_database where datname='$BAK'")" = 1 ] || { say "§PL_REFUSED no backup $BAK: refusing to drop $DB"; exit 3; }
  stop_i; pq "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB'" > /dev/null
  pq "DROP DATABASE $DB" && pq "CREATE DATABASE $DB TEMPLATE $BAK" && say "§PL_RESTORE $DB recreated from $BAK"
  sed -i '/^org\.idempiere\.bimootb/d' "$BI"; rm -rf $SRV/plugins/org.idempiere.bimootb_13.1.0.* $SRV/plugins/org.idempiere.bimootb.viewer_13.1.0.*; say "§PL_UNINSTALL bundles.info lines and folders removed"
  cmp -s "$BI" "$LOG/bundles.info.as_found" && say "§PL_BUNDLES_INFO equal to as found" || say "§PL_BUNDLES_INFO FAIL differs from as found"
  state restored; A=$(cat "$LOG/as_found_pl.txt"); R=$(grep '§PL_STATE restored' "$LOG/prepL.log" | tail -1 | sed 's/.*bundles_info/bundles_info/')
  [ "$A" = "$R" ] && say "§PL_RESTORE_CHECK PASS equal to as found: $R" || { say "§PL_RESTORE_CHECK FAIL as found: $A | now: $R (backup KEPT)"; exit 5; }
  pq "DROP DATABASE $BAK" && pq "DROP DATABASE IF EXISTS $RDY" && say "§PL_DOWN_VERDICT PASS backup and ready snapshot dropped; :8108 left stopped (as found)"
fi
