#!/usr/bin/env bash
# Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
# SPDX-License-Identifier: MIT
# ⚠ DO NOT REMOVE — Scope guard
# Scope: W-POST-TAIL §W-POST-TAIL-2 (prompts/HARDEN_MATRIX.md) — GENERATE the Cash/Inventory posting-tail
#   oracle. Twin of scripts/generate_post_oracle.sh (W-POST-B3 §W-2): clone idempiere_test → SCRATCH
#   idempiere_tail, drive the REAL compiled posters via the vendor's own OSGi test harness
#   (scripts/logic_oracle/PostingTailTest.java), capture the committed fact_acct + source rows into the
#   TEXT fixture build/erp/oracle/post_tail_fixture.json. UNLIKE B-3, this drives ZERO seed authoring —
#   every document posted/completed here already existed in idempiere_test (2 CO c_cash journals never
#   posted; 3 m_inventory drafts). The shared idempiere_test is NEVER written; scratch dropped at the end.
# READ THE LOG after every run: build/erp/generate_post_tail_oracle.log (exit ≠ evidence).
# Run:  bash scripts/generate_post_tail_oracle.sh
set -euo pipefail
cd "$(dirname "$0")/.."

CONTAINER=postgres
PGUSER=adempiere
SRC_DB=idempiere_test
SCRATCH_DB=idempiere_tail
IDMP="$HOME/idempiere-dev-setup/idempiere"
TAIL_HOME=/tmp/idempiere_tail_home
LOG=build/erp/generate_post_tail_oracle.log
FIXTURE=build/erp/oracle/post_tail_fixture.json
ORACLE_SRC=scripts/logic_oracle/PostingTailTest.java
ORACLE_DST="$IDMP/org.idempiere.test/src/org/idempiere/test/oracle/PostingTailTest.java"
# same workspace-bundle dep closure of org.idempiere.test as generate_post_oracle.sh (probed 2026-07-17):
MODULES="org.idempiere.p2.targetplatform,org.apache.ecs,org.adempiere.base,org.adempiere.base.callout,org.adempiere.base.process,org.adempiere.payment.processor,org.adempiere.ui,org.adempiere.ui.zk,org.adempiere.report.jasper,org.adempiere.report.jasper.library,org.idempiere.zk.billboard,org.idempiere.zk.extra,org.adempiere.server,org.idempiere.webservices,org.idempiere.webservices.resources,org.compiere.db.postgresql.provider,org.compiere.db.oracle.provider,org.adempiere.install,org.adempiere.replication,org.adempiere.pipo,org.adempiere.pipo.handlers,org.adempiere.plugin.utils,org.idempiere.hazelcast.service,org.idempiere.tablepartition,org.idempiere.test"

mkdir -p build/erp/oracle
: > "$LOG"
say() { echo "$@" | tee -a "$LOG"; }

say "== §W-POST-TAIL-2 generate: scratch clone $SCRATCH_DB from $SRC_DB =="
docker exec "$CONTAINER" psql -U "$PGUSER" -d postgres -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname IN ('$SRC_DB','$SCRATCH_DB') AND pid<>pg_backend_pid();" >>"$LOG" 2>&1 || true
docker exec "$CONTAINER" psql -U "$PGUSER" -d postgres -c "DROP DATABASE IF EXISTS $SCRATCH_DB;" >>"$LOG" 2>&1
docker exec "$CONTAINER" createdb -U "$PGUSER" -T "$SRC_DB" "$SCRATCH_DB"
say "§GEN scratch=$SCRATCH_DB cloned (template $SRC_DB)"

say "== scratch IDEMPIERE_HOME at $TAIL_HOME (Connection → $SCRATCH_DB) =="
mkdir -p "$TAIL_HOME/utils" "$TAIL_HOME/log"
sed "s/DBname\\\\=idempiere,/DBname\\\\=$SCRATCH_DB,/" "$IDMP/idempiere.properties" > "$TAIL_HOME/idempiere.properties"
grep -q "DBname\\\\=$SCRATCH_DB" "$TAIL_HOME/idempiere.properties" || { say "§GEN FATAL properties patch failed"; exit 1; }
cp "$IDMP/org.adempiere.server-feature/utils.unix/getVar.sh" "$TAIL_HOME/utils/"
chmod +x "$TAIL_HOME/utils/getVar.sh"
cp "$IDMP/.idpass" "$TAIL_HOME/.idpass"
sed "s/^ADEMPIERE_DB_NAME=.*/ADEMPIERE_DB_NAME=$SCRATCH_DB/" "$IDMP/idempiereEnv.properties" > "$TAIL_HOME/idempiereEnv.properties"

say "== place PostingTailTest into the vendor harness (removed again at the end) =="
mkdir -p "$(dirname "$ORACLE_DST")"
cp "$ORACLE_SRC" "$ORACLE_DST"

say "== drive the REAL compiled posters (tycho-surefire OSGi, scratch DB) — long step =="
set +e
( cd "$IDMP" && ./mvnw verify -pl "$MODULES" -DskipTests=false \
    -Didempiere.home="$TAIL_HOME" -Dtest=PostingTailTest ) >>"$LOG" 2>&1
MVN_EXIT=$?
set -e
rm -f "$ORACLE_DST"; rmdir "$(dirname "$ORACLE_DST")" 2>/dev/null || true
grep '§TAILORACLE' "$LOG" | tee build/erp/oracle/post_tail_oracle_run.log || true
if [ $MVN_EXIT -ne 0 ]; then
  say "§GEN FATAL mvn exit=$MVN_EXIT — READ $LOG (posting did not complete; scratch kept for autopsy)"
  exit 1
fi
say "§GEN posting run green (mvn exit 0) — capturing fixture"

say "== capture fixture (scoped to C_Cash/M_Inventory) =="
node scripts/capture_post_tail_fixture.js "$SCRATCH_DB" "$FIXTURE" | tee -a "$LOG"

say "== drop scratch =="
docker exec "$CONTAINER" psql -U "$PGUSER" -d postgres -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$SCRATCH_DB' AND pid<>pg_backend_pid();" >>"$LOG" 2>&1 || true
docker exec "$CONTAINER" psql -U "$PGUSER" -d postgres -c "DROP DATABASE IF EXISTS $SCRATCH_DB;" >>"$LOG" 2>&1
say "§GEN scratch dropped; fixture at $FIXTURE — now run: bash build/erp/run_witness.sh scripts/poc_post_tail.js"
