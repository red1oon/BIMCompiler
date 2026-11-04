#!/usr/bin/env bash
# Implements prompts/PDF2BIM_VECTOR_PROBE.md (RESUME block) — the whole TB-LKTN page-1 chain, every stage logged to <out>/logs. Read the logs; exit code is not evidence.
# Usage: [PDF2BIM_PDF=<TBKLTN_House.pdf>] [PDF2BIM_LIBDB=<component_library.db>] scripts/pdf2bim/run_p1.sh [outdir]      needs poppler (pdftocairo/pdftotext), node, web-ifc (bim-compiler/node_modules), bim-ootb checkout at ~/bim-ootb (read-only)
set -u
H="$(cd "$(dirname "$0")/../.." && pwd)"; O="${1:-/tmp/pdf2bim_run}"; PDF="${PDF2BIM_PDF:-}"; for c in "$H/2D_Layout/input/TBKLTN_House.pdf" "$HOME/bim-compiler/2D_Layout/input/TBKLTN_House.pdf"; do [ -z "$PDF" ] && [ -f "$c" ] && PDF="$c"; done; [ -f "$PDF" ] || { echo "TBKLTN_House.pdf not found (it is git-IGNORED: 2D_Layout/input/*.pdf) — put it at 2D_Layout/input/ or set PDF2BIM_PDF=<file>"; exit 2; }; T="$H/scripts/pdf2bim/types"; RJ="$T/low_cost_house_rosetta.json"; S="$H/scripts/pdf2bim"; TJ="${PDF2BIM_TEMPLATE:-$T/low_cost_single_storey_unit.json}"
PG(){ python3 -I -c "import json,sys;print(json.load(open(sys.argv[1]))['sheets'][sys.argv[2]])" "$TJ" "$1"; }; P1=$(PG plan); P3=$(PG roof); P4=$(PG elevations_a); P5=$(PG elevations_b); P6=$(PG sections)   # page roles are the type template's (§33)
mkdir -p "$O/logs" "$O/svg"; cd "$O" || exit 1
run(){ n="$1"; shift; "$@" > "logs/$n.log" 2>&1; echo "== $n exit=$? ($(wc -l < logs/$n.log) lines)"; }
for p in 1 2 3 4 5 6 7 8; do pdftocairo -svg -f $p -l $p "$PDF" "svg/p$p.svg"; done
if [ -z "${PDF2BIM_NO_FILL:-}" ]; then run 00_fill_blanks python3 -I $S/fill_blanks.py svg "$RJ" "$TJ" "$PDF" "$O/rosetta.effective.json"; [ -f "$O/rosetta.effective.json" ] && RJ="$O/rosetta.effective.json"; fi   # §35: the sheets fill the dictionary's K, grid and schedule; the falsifier skips this
run 01_extract_p1      python3 -I $S/extract_p1.py "$PDF" $P1 "$O/x1"
run 02_rosetta_verify  python3 -I $S/rosetta_verify.py "$PDF" "$RJ"
run 03_type_checklist  python3 -I $S/type_checklist.py "$PDF" $P1 8 "$T/low_cost_house.json"
run 03b_infer_type     python3 -I $S/infer_type.py svg "$RJ" "$TJ" "$PDF" "$O/inferred.json"
run 04_walls_p1        python3 -I $S/walls_p1.py svg/p$P1.svg "$RJ" "$PDF" "$TJ"
run 05_openings_p1     python3 -I $S/openings_p1.py svg/p$P1.svg "$RJ" "$PDF" "$TJ"
run 06_emit_dxf_p1     python3 -I $S/emit_dxf_p1.py svg/p$P1.svg "$RJ" "$PDF" "$O/p1_extracted.dxf" "$TJ"
run 06b_read_rooms     python3 -I $S/read_rooms.py svg/p$P1.svg "$RJ" "$TJ" "$PDF" "$O/logs/06_emit_dxf_p1.log" "$O/rosetta.effective.json"; [ -f "$O/rosetta.effective.json" ] && RJ="$O/rosetta.effective.json"   # §36: rooms and printed areas, read per drawing
run 06c_witness_rooms  python3 -I $S/witness_rooms.py svg/p$P1.svg "$RJ" "$TJ" "$PDF" "$O/logs/06b_read_rooms.log"
run 07_plan_marks      python3 -I $S/add_plan_marks.py "$O/p1_extracted.dxf" "$RJ" "$O/p1_marked.dxf"
run 08_elev_emit       python3 -I $S/elev_emit.py svg/p$P4.svg svg/p$P5.svg "$O/p1_extracted.dxf" "$RJ" "$O/elev" "$PDF" "$O/inferred.json"
run 09_to_std          python3 -I $S/to_std.py "$O/p1_marked.dxf" "$O/elev" "$RJ" "$O/typed" "$O/inferred.json"
run 09b_section_emit   python3 -I $S/section_emit.py svg/p$P6.svg svg/p$P1.svg "$RJ" "$PDF" "$O/typed" "$O/inferred.json"
run 09c_roof_emit      python3 -I $S/roof_emit.py svg/p$P3.svg svg/p$P4.svg svg/p$P6.svg "$RJ" "$PDF" "$O/typed" "$O/inferred.json"
# LOD400 library: local export (git-ignored scripts/library_building_types.json is a default-only data file)
[ -f "$H/scripts/library_building_types.json" ] || cp "$T/library_building_types.default.json" "$H/scripts/library_building_types.json"
LIBDB="${PDF2BIM_LIBDB:-}"; for c in "$H/library/component_library.db" "$HOME/bim-compiler/library/component_library.db"; do [ -z "$LIBDB" ] && [ -f "$c" ] && LIBDB="$c"; done
# the library DB is never modified: a COPY gets the append-only migration(s) this lane depends on (CL006 = size pair on the two exact-size FD1 door families, spec §27), then the export reads the copy
export_lib(){
  cp "$LIBDB" "$O/component_library.migrated.db"
  python3 -I - "$O/component_library.migrated.db" "$H/migration/CL006_opening_family_size_pair.sql" "$H/migration/CL007_low_cost_window_families.sql" "$H/migration/CL008_low_cost_door_families.sql" > logs/10a_library_migrate.log 2>&1 <<'PY'
import sqlite3,sys,os
c=sqlite3.connect(sys.argv[1]); q="select count(*) from ad_opening_family where description like '%×2100mm%' and family_id like 'INST_FIRE_DOOR_%'"
b=c.execute(q).fetchone()[0]; c.executescript(open(sys.argv[2],encoding='utf-8').read()); c.commit(); a=c.execute(q).fetchone()[0]
w0=c.execute("select count(*) from ad_opening_family where family_id like 'LCSSU_%'").fetchone()[0]; c.executescript(open(sys.argv[3],encoding='utf-8').read()); c.commit(); w1=c.execute("select count(*) from ad_opening_family where family_id like 'LCSSU_%'").fetchone()[0]
q8="select count(*) from ad_opening_family where family_id like 'LCSSU_D%'"; d0=c.execute(q8).fetchone()[0]; c.executescript(open(sys.argv[4],encoding='utf-8').read()); c.commit(); d1=c.execute(q8).fetchone()[0]
x=os.environ.get('EXTRA_SQL')
if x: c.executescript(open(x,encoding='utf-8').read()); c.commit(); print('§MIG this run\'s generated families applied to the copy:',x)
print('§MIG CL006 families with a size pair before',b,'after',a,'| CL007 window families before',w0,'after',w1,'| CL008 door families before',d0,'after',d1)
PY
  echo "== 10a_library_migrate ($(cat logs/10a_library_migrate.log | tr '\n' ' '))"
  run 10_library_export node "$H/scripts/export_library_subset.js" --full --out-dir "$O/lib" --lib "$O/component_library.migrated.db"
}
if [ ! -f "$O/lib/latest.json" ]; then export_lib; fi
run 10b_families python3 -I $S/family_stage.py "$RJ" "$TJ" "$O/lib" "$O/families_new.sql"   # §39: a size the library lacks gets its family, on this run's copy only
if [ -s "$O/families_new.sql" ]; then [ -L "$O/lib" ] && rm "$O/lib"; rm -rf "$O/lib"; EXTRA_SQL="$O/families_new.sql" export_lib; fi
( cd "${PDF2BIM_OOTB:-$HOME/bim-ootb}/modeller" && run_in(){ :; }; node "$S/lib_probe.js" "$O/typed" "$O/lib/" "$O/tbkltn_p1.ifc" > "$O/logs/11_lib_probe.log" 2>&1; echo "== 11_lib_probe exit=$? ($(wc -l < $O/logs/11_lib_probe.log) lines)" )
run 12_ifc_check       python3 "$S/ifc_check.py" "$O/tbkltn_p1.ifc"
run 13_witness_level_c python3 -I $S/witness_level_c.py "$O" "$RJ"
run 14_other_sheets    python3 -I $S/other_sheets.py "$O" "$RJ" "$PDF"
run 15_gap_register    python3 "$S/gap_register.py" "$O" "$RJ"
run 16_witness_roof    python3 "$S/witness_house_roof.py" "$O"
run 16b_witness_windows python3 "$S/witness_windows.py" "$O" "$RJ"
run 16c_witness_doors  env PDF2BIM_PDF_USED="$PDF" python3 "$S/witness_doors.py" "$O" "$RJ" "$S"
run 17_witness_template python3 -I "$S/witness_template.py" "$O" "$TJ"
run 18_geom_hash       python3 "$S/geom_hash.py" "$O/tbkltn_p1.ifc"
echo "--- headline"; grep -h -E "W-P1 |W-P5 wall pairs|W-P12 round|G1 scale|MATCH D|TOTAL by class" logs/0*.log | cut -c1-170; grep -h -E "LIB els|IFC counts|IFC bbox .* IfcWall|IFC validate" logs/11_lib_probe.log logs/12_ifc_check.log | cut -c1-200; grep -h -E "W-C[0-9] |§WC" logs/13_witness_level_c.log | cut -c1-220; grep -h -E "^§(S |GAP-TOTAL)" logs/14_other_sheets.log logs/15_gap_register.log | cut -c1-200; grep -h -E "^§R " logs/16_witness_roof.log | cut -c1-200; grep -h -E "^§W " logs/16b_witness_windows.log | cut -c1-200; grep -h -E "^§D " logs/16c_witness_doors.log | cut -c1-200; grep -h -E "^§A " logs/06c_witness_rooms.log | grep -v "§A   left" | cut -c1-200; grep -h -E "^§INFER RESULT" logs/03b_infer_type.log | cut -c1-200; grep -h -E "^§T " logs/17_witness_template.log | cut -c1-200; cat logs/18_geom_hash.log
