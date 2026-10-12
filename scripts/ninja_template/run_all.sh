#!/bin/bash
# One command for every ExpenseReport parity gate. Needs: docker postgres up, idempiere_laos DB, and (for W20) the oracle xls/logs in ../legacy.
# Reads nothing from the pilot DB. Writes logs/*.log. Exit 0 only if every gate prints its expected verdict.
cd "$(dirname "$0")"; fail=0
chk(){ local name=$1 want=$2; shift 2; out=$("$@" 2>&1); echo "$out" > logs/$name.log; got=$(echo "$out" | grep -E "PARITY_VERDICT|TWIN_STMT_VERDICT" | head -1 | grep -oE "PASS|FAIL|INCONCLUSIVE"); [ "$got" = "$want" ] && echo "ok   $name $got" || { echo "BAD  $name want=$want got=$got"; fail=1; }; }
L=/home/red1/Projects/LaosExpenseReport
export FROM='2026-05-01 00:00:00.0' TO='2026-05-31 00:00:00.0'
chk W20_sofp PASS node W20_Parity.js MOES_sofp
chk W20_cashflow PASS node W20_Parity.js MOES_cashflow
export FROM='2006-12-01 00:00:00.0' TO='2006-12-31 00:00:00.0'
chk W20_parity_v2 PASS env TPL=$L/legacy/parity_v2.xls node W20_Parity.js parity_v2
chk W20_parity_xtab PASS env TPL=$L/legacy/parity_xtab.xls node W20_Parity.js parity_xtab
chk W20_NEG_client_xtab FAIL env NEG=client TPL=$L/legacy/parity_xtab.xls node W20_Parity.js parity_xtab
chk W20_NEG_droprow_v2 FAIL env NEG=droprow TPL=$L/legacy/parity_v2.xls node W20_Parity.js parity_v2
chk W24_xtab PASS node W24_TwinStatements.js $L/legacy/parity_xtab.xls
chk W24_v2 PASS node W24_TwinStatements.js $L/legacy/parity_v2.xls      # D1 closed: Java BigDecimal scale reproduced from the dictionary side tables
chk W24_NEG_noscale_v2 FAIL env NEG=noscale node W24_TwinStatements.js $L/legacy/parity_v2.xls   # scale-blind adapter must still fail (D1 is real, the witness sees it)
export FROM='2026-05-01 00:00:00.0' TO='2026-05-31 00:00:00.0'
# END-TO-END ON THE TWIN: engine + SQLite executor vs the Postgres-run real-fork oracle workbook
chk W20_TWIN_sofp PASS env EXEC=sqlite node W20_Parity.js MOES_sofp
chk W20_TWIN_cashflow PASS env EXEC=sqlite node W20_Parity.js MOES_cashflow
export FROM='2006-12-01 00:00:00.0' TO='2006-12-31 00:00:00.0'
chk W20_TWIN_parity_v2 PASS env EXEC=sqlite TPL=$L/legacy/parity_v2.xls node W20_Parity.js parity_v2
chk W20_TWIN_parity_xtab PASS env EXEC=sqlite TPL=$L/legacy/parity_xtab.xls node W20_Parity.js parity_xtab
export FROM='2026-05-01 00:00:00.0' TO='2026-05-31 00:00:00.0'
chk W24_sofp PASS node W24_TwinStatements.js $L/source/MOES_sofp.xls
chk W24_cashflow PASS node W24_TwinStatements.js $L/source/MOES_cashflow.xls
# ── STYLES-AWARE XLSX PATH (ExcelJS host): conversion fidelity, host roundtrip, engine on SQLite -> styled xlsx vs the REAL plugin's .xls output ──
M=/home/red1/.m2/repository/org/apache/commons/commons-math3/3.6.1/commons-math3-3.6.1.jar; JCP=$(ls /home/red1/Projects/red1-ninja-roundtrip/lib/*.jar | tr '\n' ':')$M:.
OUT=/tmp/ninja_template_out; mkdir -p $OUT
chks(){ local name=$1 want=$2; shift 2; out=$("$@" 2>&1); echo "$out" > logs/$name.log; got=$(echo "$out" | grep -E "STYLE_PARITY_VERDICT|CELL_PARITY_VERDICT|ROUNDTRIP_VERDICT" | head -1 | grep -oE "PASS|FAIL|INCONCLUSIVE"); [ "$got" = "$want" ] && echo "ok   $name $got" || { echo "BAD  $name want=$want got=$got"; fail=1; }; }
for f in MOES_sofp MOES_cashflow; do
  chks CONV_style_$f PASS java -cp "$JCP" W27_StyleParity $L/source/$f.xls $L/legacy/xlsx/$f.xlsx Output BACKUP
  chks HOST_roundtrip_$f PASS node W28_Roundtrip.js $L/legacy/xlsx/$f.xlsx $OUT/$f.rt.xlsx
done
chks CONV_style_NEG FAIL java -cp "$JCP" W27_StyleParity $L/source/MOES_sofp.xls $L/legacy/xlsx/MOES_cashflow.xlsx Output   # wrong template must FAIL
for spec in "MOES_sofp|2026-05-01|2026-05-31" "MOES_cashflow|2026-05-01|2026-05-31" "parity_v2|2006-12-01|2006-12-31" "parity_xtab|2006-12-01|2006-12-31"; do
  IFS='|' read n a b <<< "$spec"
  FROM="$a 00:00:00.0" TO="$b 00:00:00.0" node W29_TwinXlsx.js $L/legacy/xlsx/$n.xlsx $OUT/$n.twin.xlsx > logs/W29_$n.log 2>&1
  chks TWIN_cells_$n PASS node W30_CellCompare.js $L/legacy/oracle_fork_$n.xls $OUT/$n.twin.xlsx
  chks TWIN_style_$n PASS java -cp "$JCP" W27_StyleParity $L/legacy/oracle_fork_$n.xls $OUT/$n.twin.xlsx Output
done
exit $fail
