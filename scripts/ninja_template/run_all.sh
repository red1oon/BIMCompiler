#!/bin/bash
# ExpenseReport / ninja_template parity gates. Default run needs NO legacy server and NO Postgres: frozen text goldens of the REAL Laos plugin's output (golden/),
# the twin snapshot db, the source templates and the migrated .xlsx templates (all under $NT_DATA). PG=1 adds the live-Postgres gates.
# Exit 0 only if every gate prints its expected verdict.
cd "$(dirname "$0")"; D=$PWD; fail=0; NT_DATA=${NT_DATA:-/home/red1/Projects/LaosExpenseReport}; L=$NT_DATA; mkdir -p logs
M=/home/red1/.m2/repository/org/apache/commons/commons-math3/3.6.1/commons-math3-3.6.1.jar; JCP=$(ls /home/red1/Projects/red1-ninja-roundtrip/lib/*.jar | tr '\n' ':')$M:.
OUT=${OUT:-/tmp/ninja_template_out}; mkdir -p $OUT
javac -nowarn -cp "$JCP" -d . W27_StyleParity.java W32_GoldenStyle.java GoldenDump.java Xls2Xlsx.java 2>&1 | grep -v '^Note:' | head -5
chk(){ local name=$1 want=$2; shift 2; out=$("$@" 2>&1); echo "$out" > logs/$name.log; got=$(echo "$out" | grep -E "PARITY_VERDICT|TWIN_STMT_VERDICT|STYLE_PARITY_VERDICT|CELL_PARITY_VERDICT|ROUNDTRIP_VERDICT" | head -1 | grep -oE "PASS|FAIL|INCONCLUSIVE"); [ "$got" = "$want" ] && echo "ok   $name $got" || { echo "BAD  $name want=$want got=$got"; fail=1; }; }
# ── [A] engine on the SQLite twin vs the frozen goldens (no PG, no legacy) ──
export EXEC=sqlite
FROM='2026-05-01 00:00:00.0' TO='2026-05-31 00:00:00.0'; export FROM TO
chk A_engine_sofp PASS node W20_Parity.js MOES_sofp
chk A_engine_cashflow PASS node W20_Parity.js MOES_cashflow
export FROM='2006-12-01 00:00:00.0' TO='2006-12-31 00:00:00.0'
chk A_engine_parity_v2 PASS env TPL=$L/legacy/parity_v2.xls node W20_Parity.js parity_v2
chk A_engine_parity_xtab PASS env TPL=$L/legacy/parity_xtab.xls node W20_Parity.js parity_xtab
chk A_NEG_engine_noscale FAIL env NEG=noscale TPL=$L/legacy/parity_v2.xls node W20_Parity.js parity_v2   # scale-blind executor must differ from the golden
unset EXEC
# ── [B] migrated templates + styles-aware xlsx host ──
for f in MOES_sofp MOES_cashflow; do
  chk B_conv_style_$f PASS java -cp "$JCP" W27_StyleParity $L/source/$f.xls $L/legacy/xlsx/$f.xlsx Output BACKUP
  chk B_host_roundtrip_$f PASS node W28_Roundtrip.js $L/legacy/xlsx/$f.xlsx $OUT/$f.rt.xlsx
done
chk B_NEG_conv_style FAIL java -cp "$JCP" W27_StyleParity $L/source/MOES_sofp.xls $L/legacy/xlsx/MOES_cashflow.xlsx Output
# ── [C] the twin end to end: .xlsx template -> engine on SQLite -> styled .xlsx, vs goldens (cells, log-free) and style goldens (two-way) ──
for spec in "MOES_sofp|2026-05-01|2026-05-31" "MOES_cashflow|2026-05-01|2026-05-31" "parity_v2|2006-12-01|2006-12-31" "parity_xtab|2006-12-01|2006-12-31"; do
  IFS='|' read n a b <<< "$spec"
  FROM="$a 00:00:00.0" TO="$b 00:00:00.0" node W29_TwinXlsx.js $L/legacy/xlsx/$n.xlsx $OUT/$n.twin.xlsx > logs/C_run_$n.log 2>&1
  chk C_cells_$n PASS node W30_CellCompare.js $n $OUT/$n.twin.xlsx
  chk C_style_$n PASS java -cp "$JCP" W32_GoldenStyle golden/$n $OUT/$n.twin.xlsx
done
chk C_NEG_style FAIL java -cp "$JCP" W32_GoldenStyle golden/MOES_sofp $OUT/MOES_cashflow.twin.xlsx     # other template's output must not match this golden
# ── [P] live Postgres clone gates (optional: PG=1) ──
if [ "$PG" = 1 ]; then
  export FROM='2006-12-01 00:00:00.0' TO='2006-12-31 00:00:00.0'
  chk P_stmt_xtab PASS node W24_TwinStatements.js $L/legacy/parity_xtab.xls
  chk P_stmt_v2 PASS node W24_TwinStatements.js $L/legacy/parity_v2.xls
  chk P_NEG_stmt_noscale FAIL env NEG=noscale node W24_TwinStatements.js $L/legacy/parity_v2.xls
  export FROM='2026-05-01 00:00:00.0' TO='2026-05-31 00:00:00.0'
  chk P_stmt_sofp PASS node W24_TwinStatements.js $L/source/MOES_sofp.xls
  chk P_stmt_cashflow PASS node W24_TwinStatements.js $L/source/MOES_cashflow.xls
fi
exit $fail
