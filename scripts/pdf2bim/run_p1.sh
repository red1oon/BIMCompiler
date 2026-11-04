#!/usr/bin/env bash
# Implements prompts/PDF2BIM_VECTOR_PROBE.md (RESUME block) — the whole TB-LKTN page-1 chain, every stage logged to <out>/logs. Read the logs; exit code is not evidence.
# Usage: [PDF2BIM_PDF=<TBKLTN_House.pdf>] [PDF2BIM_LIBDB=<component_library.db>] scripts/pdf2bim/run_p1.sh [outdir]      needs poppler (pdftocairo/pdftotext), node, web-ifc (bim-compiler/node_modules), bim-ootb checkout at ~/bim-ootb (read-only)
set -u
H="$(cd "$(dirname "$0")/../.." && pwd)"; O="${1:-/tmp/pdf2bim_run}"; PDF="${PDF2BIM_PDF:-}"; for c in "$H/2D_Layout/input/TBKLTN_House.pdf" "$HOME/bim-compiler/2D_Layout/input/TBKLTN_House.pdf"; do [ -z "$PDF" ] && [ -f "$c" ] && PDF="$c"; done; [ -f "$PDF" ] || { echo "TBKLTN_House.pdf not found (it is git-IGNORED: 2D_Layout/input/*.pdf) — put it at 2D_Layout/input/ or set PDF2BIM_PDF=<file>"; exit 2; }; T="$H/scripts/pdf2bim/types"; RJ="$T/low_cost_house_rosetta.json"; S="$H/scripts/pdf2bim"
mkdir -p "$O/logs" "$O/svg"; cd "$O" || exit 1
run(){ n="$1"; shift; "$@" > "logs/$n.log" 2>&1; echo "== $n exit=$? ($(wc -l < logs/$n.log) lines)"; }
for p in 1 4 5; do pdftocairo -svg -f $p -l $p "$PDF" "svg/p$p.svg"; done
run 01_extract_p1      python3 -I $S/extract_p1.py "$PDF" 1 "$O/x1"
run 02_rosetta_verify  python3 -I $S/rosetta_verify.py "$PDF" "$RJ"
run 03_type_checklist  python3 -I $S/type_checklist.py "$PDF" 1 8 "$T/low_cost_house.json"
run 04_walls_p1        python3 -I $S/walls_p1.py svg/p1.svg "$RJ" "$PDF"
run 05_openings_p1     python3 -I $S/openings_p1.py svg/p1.svg "$RJ" "$PDF"
run 06_emit_dxf_p1     python3 -I $S/emit_dxf_p1.py svg/p1.svg "$RJ" "$PDF" "$O/p1_extracted.dxf"
run 07_plan_marks      python3 -I $S/add_plan_marks.py "$O/p1_extracted.dxf" "$RJ" "$O/p1_marked.dxf"
run 08_elev_emit       python3 -I $S/elev_emit.py svg/p4.svg svg/p5.svg "$O/p1_extracted.dxf" "$RJ" "$O/elev"
run 09_to_std          python3 -I $S/to_std.py "$O/p1_marked.dxf" "$O/elev" "$RJ" "$O/typed"
# LOD400 library: local export (git-ignored scripts/library_building_types.json is a default-only data file)
[ -f "$H/scripts/library_building_types.json" ] || cp "$T/library_building_types.default.json" "$H/scripts/library_building_types.json"
LIBDB="${PDF2BIM_LIBDB:-}"; for c in "$H/library/component_library.db" "$HOME/bim-compiler/library/component_library.db"; do [ -z "$LIBDB" ] && [ -f "$c" ] && LIBDB="$c"; done
# the library DB is never modified: a COPY gets the append-only migration(s) this lane depends on (CL006 = size pair on the two exact-size FD1 door families, spec §27), then the export reads the copy
if [ ! -f "$O/lib/latest.json" ]; then
  cp "$LIBDB" "$O/component_library.migrated.db"
  python3 -I - "$O/component_library.migrated.db" "$H/migration/CL006_opening_family_size_pair.sql" > logs/10a_library_migrate.log 2>&1 <<'PY'
import sqlite3,sys
c=sqlite3.connect(sys.argv[1]); q="select count(*) from ad_opening_family where description like '%×2100mm%' and family_id like 'INST_FIRE_DOOR_%'"
b=c.execute(q).fetchone()[0]; c.executescript(open(sys.argv[2],encoding='utf-8').read()); c.commit(); a=c.execute(q).fetchone()[0]
print('§MIG CL006 families with a size pair before',b,'after',a)
PY
  echo "== 10a_library_migrate ($(cat logs/10a_library_migrate.log | tr '\n' ' '))"
  run 10_library_export node "$H/scripts/export_library_subset.js" --full --out-dir "$O/lib" --lib "$O/component_library.migrated.db"
fi
( cd "$HOME/bim-ootb/modeller" && run_in(){ :; }; node "$S/lib_probe.js" "$O/typed" "$O/lib/" "$O/tbkltn_p1.ifc" > "$O/logs/11_lib_probe.log" 2>&1; echo "== 11_lib_probe exit=$? ($(wc -l < $O/logs/11_lib_probe.log) lines)" )
run 12_ifc_check       python3 "$S/ifc_check.py" "$O/tbkltn_p1.ifc"
echo "--- headline"; grep -h -E "W-P1 |W-P5 wall pairs|W-P12 round|G1 scale|MATCH D|TOTAL by class" logs/0*.log | cut -c1-170; grep -h -E "LIB els|IFC counts|IFC bbox .* IfcWall|IFC validate" logs/11_lib_probe.log logs/12_ifc_check.log | cut -c1-200
