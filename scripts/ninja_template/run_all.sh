#!/bin/bash
# ninja_template parity gates. Default run needs NO legacy server and NO Postgres: frozen text goldens of the legacy plugin's output (golden/), the twin snapshot db,
# the source templates and the migrated .xlsx templates (all under $NT_DATA). Public cases are the GardenWorld fixtures below. Customer cases are OPTIONAL and PRIVATE:
# put them in $NT_PRIVATE (cases.txt, golden/, env.sh) - they are never committed. PG=1 adds the live-Postgres gates.   Exit 0 only if every gate prints its expected verdict.
cd "$(dirname "$0")"; D=$PWD; fail=0; NT_DATA=${NT_DATA:-$HOME/Projects/ninja-template-data}; L=$NT_DATA; NT_PRIVATE=${NT_PRIVATE:-$NT_DATA/private}; export NT_DATA NT_PRIVATE; mkdir -p logs
[ -f "$NT_PRIVATE/env.sh" ] && . "$NT_PRIVATE/env.sh"          # private: NT_PGDB, NT_EXTRA_TABLES, ...
M=$HOME/.m2/repository/org/apache/commons/commons-math3/3.6.1/commons-math3-3.6.1.jar; JCP=$(ls $HOME/Projects/red1-ninja-roundtrip/lib/*.jar | tr '\n' ':')$M:.
OUT=${OUT:-/tmp/ninja_template_out}; mkdir -p $OUT
javac -nowarn -cp "$JCP" -d . W27_StyleParity.java W32_GoldenStyle.java GoldenDump.java Xls2Xlsx.java 2>&1 | grep -v '^Note:' | head -5
chk(){ local name=$1 want=$2; shift 2; out=$("$@" 2>&1); echo "$out" > logs/$name.log; got=$(echo "$out" | grep -E "PARITY_VERDICT|TWIN_STMT_VERDICT|STYLE_PARITY_VERDICT|CELL_PARITY_VERDICT|ROUNDTRIP_VERDICT|PDF_GEOM_VERDICT|PDF_CONTENT_VERDICT" | head -1 | grep -oE "PASS|FAIL|INCONCLUSIVE"); [ "$got" = "$want" ] && echo "ok   $name $got" || { echo "BAD  $name want=$want got=$got"; fail=1; }; }
gp(){ [ -f golden/$1.styles.tsv ] && echo golden/$1 || echo "$NT_PRIVATE/golden/$1"; }
# case line:  name|source .xls (rel. to NT_DATA)|migrated .xlsx (rel.)|from|to
CASES=("parity_v2|legacy/parity_v2.xls|legacy/xlsx/parity_v2.xlsx|2006-12-01|2006-12-31" "parity_xtab|legacy/parity_xtab.xls|legacy/xlsx/parity_xtab.xlsx|2006-12-01|2006-12-31")
PRIV=0; if [ -f "$NT_PRIVATE/cases.txt" ]; then while IFS= read -r l; do [ -n "$l" ] && CASES+=("$l") && PRIV=$((PRIV+1)); done < "$NT_PRIVATE/cases.txt"; fi
echo "cases: $((${#CASES[@]}-PRIV)) public, $PRIV private"
FIRST=${CASES[0]}; SECOND=${CASES[1]}; IFS='|' read n1 x1 y1 a1 b1 <<< "$FIRST"; IFS='|' read n2 x2 y2 a2 b2 <<< "$SECOND"
for spec in "${CASES[@]}"; do IFS='|' read n xls xlsx a b <<< "$spec"
  FROM="$a 00:00:00.0" TO="$b 00:00:00.0" EXEC=sqlite TPL=$L/$xls chk A_engine_$n PASS node W20_Parity.js $n                       # [A] engine on the SQLite twin vs frozen golden
  chk B_conv_style_$n PASS java -cp "$JCP" W27_StyleParity $L/$xls $L/$xlsx Output BACKUP                                           # [B] template migration kept the formatting
  chk B_host_roundtrip_$n PASS node W28_Roundtrip.js $L/$xlsx $OUT/$n.rt.xlsx                                                       #     ExcelJS host loses nothing
  FROM="$a 00:00:00.0" TO="$b 00:00:00.0" node W29_TwinXlsx.js $L/$xlsx $OUT/$n.twin.xlsx > logs/C_run_$n.log 2>&1                    # [C] twin end to end
  chk C_cells_$n PASS node W30_CellCompare.js $n $OUT/$n.twin.xlsx
  chk C_style_$n PASS java -cp "$JCP" W32_GoldenStyle $(gp $n) $OUT/$n.twin.xlsx
  FROM="$a 00:00:00.0" TO="$b 00:00:00.0" node W33_PdfRender.js $L/$xlsx $OUT/$n.content.pdf excel > logs/D_render_$n.log 2>&1    # [D] PDF content completeness
  FROM="$a 00:00:00.0" TO="$b 00:00:00.0" chk D_content_$n PASS node W36_PdfContent.js $L/$xlsx $OUT/$n.content.pdf
done
# negative controls: each gate must be able to say NO
FROM="$a1 00:00:00.0" TO="$b1 00:00:00.0" EXEC=sqlite NEG=noscale TPL=$L/$x1 chk A_NEG_noscale FAIL node W20_Parity.js $n1               # scale-blind executor must differ from the golden
chk B_NEG_conv_style FAIL java -cp "$JCP" W27_StyleParity $L/$x1 $L/$y2 Output                                                          # another template's formatting must not match
chk C_NEG_style FAIL java -cp "$JCP" W32_GoldenStyle $(gp $n1) $OUT/$n2.twin.xlsx                                                       # another case's output must not match this golden
# [D] PDF geometry vs the Spire reference goldens (same font Spire used on that host)
export SAME_FONT_AS_SPIRE=1 FROM='2006-12-01 00:00:00.0' TO='2006-12-31 00:00:00.0'
for spec in "geom|parity_geom|" "xtab|parity_xtab|" "v2|parity_v2|21,4"; do IFS='|' read n f known <<< "$spec"
  node W33_PdfRender.js $L/legacy/xlsx/$f.xlsx $OUT/$n.ours.pdf spire-local > logs/D_render_$n.log 2>&1; python3 pdf_geom.py $OUT/$n.ours.pdf > $OUT/$n.ours.json 2>/dev/null
  chk D_geom_$n PASS env KNOWN_EDGE_DEVIATION=$known node W34_PdfCompare.js golden/pdf/$n.spire.geom.json $OUT/$n.ours.json
done
chk D_NEG_geom FAIL node W34_PdfCompare.js golden/pdf/xtab.spire.geom.json $OUT/geom.ours.json
unset SAME_FONT_AS_SPIRE
# [P] live Postgres clone gates (PG=1)
if [ "$PG" = 1 ]; then for spec in "${CASES[@]}"; do IFS='|' read n xls xlsx a b <<< "$spec"; FROM="$a 00:00:00.0" TO="$b 00:00:00.0" chk P_stmt_$n PASS node W24_TwinStatements.js $L/$xls; done
  FROM="$a1 00:00:00.0" TO="$b1 00:00:00.0" chk P_NEG_stmt_noscale FAIL env NEG=noscale node W24_TwinStatements.js $L/$x1; fi
exit $fail
