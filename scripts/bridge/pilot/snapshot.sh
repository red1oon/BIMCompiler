#!/bin/sh
# §PILOT-SNAPSHOT  take | restore [dump] | list | verify <dump>
# take    : pg_dump -Fc of idempiere_pilot -> ~/.cache/bim_bridge/snapshots/idempiere_pilot_<ts>.dump (size>0, pg_restore --list ok)
# restore : stop server, drop/recreate DB from dump (default = newest), start server. RESTORE_DB=<name> restores into
#           a scratch DB instead (no server stop, live pilot untouched) -- used to test the restore.
set -e
DB=${PILOT_DB:-idempiere_pilot}
DIR=${SNAP_DIR:-$HOME/.cache/bim_bridge/snapshots}
PG="docker exec -i postgres"
mkdir -p "$DIR"
verify() { [ -s "$1" ] || { echo "§SNAPSHOT FAIL empty $1"; exit 1; }
  docker exec -i postgres pg_restore --list < "$1" | wc -l | awk -v f="$1" '$1>50{print "§SNAPSHOT verify OK toc_entries=" $1 " " f; exit 0} {print "§SNAPSHOT FAIL toc=" $1; exit 1}'; }
case "$1" in
 take) f="$DIR/${DB}_$(date +%Y%m%d_%H%M%S).dump"
   $PG pg_dump -U postgres -Fc "$DB" > "$f"; echo "§SNAPSHOT take $f bytes=$(stat -c%s "$f")"; verify "$f";;
 verify) verify "$2";;
 list) ls -l "$DIR";;
 restore) f=${2:-$(ls -t "$DIR"/${DB}_*.dump | head -1)}; verify "$f"
   T=${RESTORE_DB:-$DB}
   if [ "$T" = "$DB" ]; then ~/idempiere-pilot/stop.sh || true; sleep 5; fi
   $PG psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c "select pg_terminate_backend(pid) from pg_stat_activity where datname='$T' and pid<>pg_backend_pid()" >/dev/null
   $PG psql -U postgres -d postgres -v ON_ERROR_STOP=1 -c "drop database if exists \"$T\"" -c "create database \"$T\""
   $PG pg_restore -U postgres -d "$T" --no-owner --role=postgres < "$f" 2>"$DIR/restore_$T.err" || echo "§SNAPSHOT restore pg_restore rc!=0 (see $DIR/restore_$T.err; owner/ext warnings are normal)"
   echo "§SNAPSHOT restore db=$T from=$f"
   if [ "$T" = "$DB" ]; then ~/idempiere-pilot/start.sh; echo "§SNAPSHOT server starting; wait for /webui/ 200 then sleep 10"; fi;;
 *) echo "usage: $0 take|restore [dump]|list|verify <dump>"; exit 2;;
esac
