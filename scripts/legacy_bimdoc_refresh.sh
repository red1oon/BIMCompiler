#!/usr/bin/env bash
# ⚠ DO NOT REMOVE — Scope: refresh the BIM Document TEST instance of a real iDempiere server FROM THE BASE SEED, install the plugin, and read the rows back.
# Spec: prompts/ERP_IDEMPIERE_UX_PARITY.md §BIMDOC-LEGACY (W-BIMDOC-LEGACY L1). Read the log (§BIMDOC-LEGACY lines): the exit code is not evidence.
# Owner (2026-11-11): the local machine is the test/dev server; refresh from the base seed each time so every state traces from base.
#
# What it does, in order (each step prints a §BIMDOC-LEGACY line):
#   0 setup   the instance dir ~/idempiere-bimdoc (a copy of the pilot's server dir with its own DB name, ports 8108/8464, console 12622) if missing
#   1 stop    only THIS instance (pattern is the instance dir, never the pilot's)
#   2 seed    drop + create DB idempiere_bimdoc, import data/seed/Adempiere_pg.dmp. NOT ImportIdempiere.sh: it runs `dropuser adempiere`, which on a Postgres
#             shared with the pilot and other DBs would attack the shared role. The same two steps (createdb, import the dump) are done directly.
#   3 sync    RUN_SyncDB.sh (the migration scripts newer than the seed) against idempiere_bimdoc
#   4 bundle  compile iDempiereOOTB/org.idempiere.bimdocument/src against the instance's own jars, assemble plugins/org.idempiere.bimdocument_<ver>/, one bundles.info line
#   5 start   the instance; wait for Incremental2PackActivator to say the pack is installed
#   6 verify  SQL counts: table, columns, physical columns, virtual columns, window, tabs, processes + class names, menu place
# Usage: scripts/legacy_bimdoc_refresh.sh            (all steps)     STOP_ONLY=1 scripts/legacy_bimdoc_refresh.sh   (step 1 only)
#        BREAK=nosupersede scripts/legacy_bimdoc_refresh.sh   (FALSIFIER: the bundle without the supersede rule; legacy_bimdoc_witness.sh must then FAIL L2a and L3; run it again without BREAK afterwards)
# Never `pkill -f` a pattern that appears in your own command line (it kills the shell): kill by PID.
set -uo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PILOT="${PILOT:-$HOME/idempiere-pilot}"; INST="${INST:-$HOME/idempiere-bimdoc}"; DB="${DB:-idempiere_bimdoc}"
BUNDLE_SRC="${BUNDLE_SRC:-$REPO/iDempiereOOTB/org.idempiere.bimdocument}"; PG="${PG:-postgres}"   # PG = the docker container name of the shared Postgres
say() { echo "§BIMDOC-LEGACY $*"; }
psqlq() { docker exec "$PG" psql -U adempiere -d "$DB" -tAc "$1" 2>&1 | tr '\n' ' '; }
[ "$DB" != "idempiere_pilot" ] && [ "$DB" != "idempiere" ] || { say "REFUSED DB=$DB is not this instance's database"; exit 2; }

# 0 setup -------------------------------------------------------------------------------------------------
if [ ! -d "$INST/server" ]; then
  [ -d "$PILOT/server" ] || { say "REFUSED no pilot server dir to copy at $PILOT"; exit 2; }
  mkdir -p "$INST" && cp -a "$PILOT/server" "$INST/server" || exit 1
  cd "$INST/server" || exit 1
  for f in idempiereEnv.properties idempiere.properties utils/myEnvironment.sh jettyhome/etc/jetty-http.xml jettyhome/etc/jetty-ssl.xml; do
    sed -i "s#idempiere-pilot#idempiere-bimdoc#g; s#idempiere_pilot#$DB#g; s#8088#8108#g; s#8444#8464#g" "$f"; done
  sed -i "s#^ADEMPIERE_DB_NAME=.*#ADEMPIERE_DB_NAME=\"$DB\"#; s#^ADEMPIERE_DB_URL=.*#ADEMPIERE_DB_URL=\"jdbc:postgresql://localhost:5432/$DB\"#" utils/myEnvironment.sh
  printf '#!/bin/sh\n# Start the BIM Document TEST instance (DB %s, from the base seed) on :8108 / :8464. Log: ~/idempiere-bimdoc/server.log\ncd "$(dirname "$0")/server" && TELNET_PORT=12622 setsid nohup ./idempiere-server.sh >> ../server.log 2>&1 &\n' "$DB" > "$INST/start.sh"
  printf "#!/bin/sh\n# Stop the BIM Document TEST instance (matches only the copy under ~/idempiere-bimdoc/server)\npkill -f '[i]dempiere-bimdoc/server/plugins/org.eclipse.equinox.launcher' && echo stopped\n" > "$INST/stop.sh"
  chmod +x "$INST/start.sh" "$INST/stop.sh"; say "setup instance=$INST db=$DB ports=8108/8464 console=12622 copied-from=$PILOT"
else say "setup instance=$INST present"; fi
grep -q "^ADEMPIERE_DB_NAME=\"$DB\"" "$INST/server/utils/myEnvironment.sh" || { say "REFUSED $INST/server/utils/myEnvironment.sh does not name $DB (a sync would hit another database)"; exit 2; }

# 1 stop --------------------------------------------------------------------------------------------------
"$INST/stop.sh" >/dev/null 2>&1; for i in $(seq 1 30); do pgrep -f "[i]dempiere-bimdoc/server/plugins/org.eclipse.equinox.launcher" >/dev/null || break; sleep 2; done
pgrep -f "[i]dempiere-bimdoc/server/plugins/org.eclipse.equinox.launcher" >/dev/null && { say "FAILED the instance did not stop"; exit 1; }
say "stop instance down"; [ "${STOP_ONLY:-}" = 1 ] && exit 0

# 2 seed --------------------------------------------------------------------------------------------------
docker exec "$PG" dropdb -U adempiere --if-exists --force "$DB" 2>&1 | head -2   # --force: a stray server connection must not wedge a refresh (seen 2026-11-11)
docker exec "$PG" createdb -U adempiere -T template0 -E UNICODE -O adempiere "$DB" 2>&1 | head -2
docker exec "$PG" psql -U adempiere -d "$DB" -tAc "ALTER ROLE adempiere SET search_path TO adempiere, pg_catalog" >/dev/null 2>&1
docker exec -i "$PG" psql -q -U adempiere -d "$DB" < "$INST/server/data/seed/Adempiere_pg.dmp" > "$INST/import.log" 2>&1
say "seed db=$DB tables=$(psqlq 'select count(*) from ad_table') projects=$(psqlq 'select count(*) from c_project') migration-scripts=$(psqlq 'select count(*) from ad_migrationscript') bim_document-rows-in-dictionary=$(psqlq "select count(*) from ad_table where tablename='BIM_Document'")"

# 3 sync --------------------------------------------------------------------------------------------------
( cd "$INST/server/utils" && ./RUN_SyncDB.sh ) > "$INST/sync.log" 2>&1   # it reads ./myEnvironment.sh: it must run from utils
say "sync migration-scripts=$(psqlq 'select count(*) from ad_migrationscript') sync-says="$(grep -v "^ *$\|^-\|row" "$INST/sync.log" | tail -1 | cut -c1-80)""

# 4 bundle ------------------------------------------------------------------------------------------------
VER="13.0.0.$(date +%Y%m%d%H%M)"; NAME="org.idempiere.bimdocument_$VER"; DEST="$INST/server/plugins/$NAME"
rm -rf "$INST/server/plugins"/org.idempiere.bimdocument_*; mkdir -p "$DEST"
CP="$(ls "$INST"/server/plugins/*.jar | tr '\n' ':')"
SRCDIR="$BUNDLE_SRC/src"
if [ "${BREAK:-}" = nosupersede ]; then   # FALSIFIER: the same bundle WITHOUT the supersede rule; the witness must FAIL L2a
  SRCDIR="$(mktemp -d)"; cp -r "$BUNDLE_SRC/src/." "$SRCDIR/"; sed -i 's/if (!live || o.getRevision() >= getRevision())/if (true)/' "$SRCDIR/org/kernel/bim/model/MBIMDocument.java"
  grep -q "if (true)" "$SRCDIR/org/kernel/bim/model/MBIMDocument.java" || { say "REFUSED BREAK=nosupersede did not change the source"; exit 2; }; say "BREAK nosupersede: the supersede loop is disabled in this build"
fi
javac -Xlint:-options -d "$DEST" -cp "$CP" -source 17 -target 17 $(find "$SRCDIR" -name '*.java') 2>&1 | head -20
cp -r "$BUNDLE_SRC/META-INF" "$BUNDLE_SRC/OSGI-INF" "$DEST/"; sed -i "s/^Bundle-Version: .*/Bundle-Version: $VER/" "$DEST/META-INF/MANIFEST.MF"
BI="$INST/server/configuration/org.eclipse.equinox.simpleconfigurator/bundles.info"; sed -i '/^org.idempiere.bimdocument,/d' "$BI"
echo "org.idempiere.bimdocument,$VER,plugins/$NAME/,4,true" >> "$BI"
# the TEST bundle (a console command that runs W-BIMDOC-LEGACY inside the server): installed on this test instance only
TSRC="$REPO/iDempiereOOTB/org.idempiere.bimdocument.test"
if [ -d "$TSRC/src" ]; then
  TNAME="org.idempiere.bimdocument.test_$VER"; TDEST="$INST/server/plugins/$TNAME"; rm -rf "$INST/server/plugins"/org.idempiere.bimdocument.test_*; mkdir -p "$TDEST"
  javac -Xlint:-options -d "$TDEST" -cp "$CP:$DEST" -source 17 -target 17 $(find "$TSRC/src" -name '*.java') 2>&1 | head -20
  cp -r "$TSRC/META-INF" "$TSRC/OSGI-INF" "$TDEST/"; sed -i "s/^Bundle-Version: .*/Bundle-Version: $VER/" "$TDEST/META-INF/MANIFEST.MF"
  sed -i '/^org.idempiere.bimdocument.test,/d' "$BI"; echo "org.idempiere.bimdocument.test,$VER,plugins/$TNAME/,5,true" >> "$BI"
  say "test-bundle $TNAME classes=$(find "$TDEST" -name '*.class' | wc -l)"
fi
say "bundle $NAME classes=$(find "$DEST" -name '*.class' | wc -l) pack=$(ls "$DEST/META-INF" | grep 2Pack | tr '\n' ' ')"

# 5 start -------------------------------------------------------------------------------------------------
: > "$INST/server.log"; "$INST/start.sh"
for i in $(seq 1 90); do grep -q "Incremental2PackActivator.packIn: org.idempiere.bimdocument .* installed" "$INST/server.log" && break; sleep 4; done
say "start $(grep -h 'Incremental2PackActivator.packIn' "$INST/server.log" | cut -c1-140 | tr '\n' '|')"

# 5b component migration scripts (the document types, T3): the bundle's own migration/postgresql/*.sql, in name order, each in one transaction against this instance's DB only
for f in $(ls "$BUNDLE_SRC"/migration/postgresql/*.sql 2>/dev/null | sort); do
  r=$( (echo "SET search_path=adempiere;"; cat "$f") | docker exec -i "$PG" psql -U adempiere -d "$DB" -v ON_ERROR_STOP=1 -qtA --single-transaction 2>&1 | grep -E "ERROR|registered" | head -2 | tr '\n' ' ')
  say "migration $(basename "$f") $r"
done

# 6 verify ------------------------------------------------------------------------------------------------
TID="$(psqlq "select ad_table_id from ad_table where tablename='BIM_Document'" | tr -d ' ')"
say "verify table=$TID columns=$(psqlq "select count(*) from ad_column where ad_table_id=${TID:-0}") physical=$(psqlq "select count(*) from information_schema.columns where table_name='bim_document'") virtual=$(psqlq "select count(*) from ad_column where ad_table_id in (select ad_table_id from ad_table where tablename in ('C_ProjectTask','C_ProjectPhase')) and columnname like 'BIM%' and columnsql is not null")"
say "verify window=$(psqlq "select count(*) from ad_window where name='BIM Document'") tabs=$(psqlq "select string_agg(w.name||':'||t.tablevel||'/'||t.seqno, ',') from ad_tab t join ad_window w on w.ad_window_id=t.ad_window_id where t.ad_table_id=${TID:-0}") processes=$(psqlq "select string_agg(classname, ',') from ad_process where value like 'BIM_Document%'") menu=$(psqlq "select p.name||'@'||n.seqno from ad_menu m join ad_treenodemm n on n.node_id=m.ad_menu_id join ad_menu p on p.ad_menu_id=n.parent_id where m.name='BIM Document'")"
