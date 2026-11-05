#!/usr/bin/env bash
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §41 — rebuilds the oracle the Modeller's port is proved against (bim-ootb modeller/tests/witness_pdf2dxf_rules.js, witness_pdf2dxf_reader.js): the sheet model and the Python chain's sheets and logs, for TB-LKTN, the second drawing and the variants.
# Usage: make_port_oracle.sh <reference outdir, a clean run_p1> <witness_second.sh work dir> <witness_variant.sh work dir> <pdf> <out oracle dir>
set -u
S="$(cd "$(dirname "$0")" && pwd)"; REF="$1"; SEC="$2"; VAR="$3"; PDF="$4"; OUT="$5"
one(){ k="$1"; d="$2"; p="$3"; mkdir -p "$OUT/$k"; python3 -I "$S/dump_sheet_model.py" "$d/svg" "$p" "$OUT/$k/model.json"; rm -rf "$OUT/$k/typed"; cp -r "$d/typed" "$OUT/$k/typed"; cp "$d/inferred.json" "$d/rosetta.effective.json" "$d/template.effective.json" "$OUT/$k/"; for l in 00_fill_blanks 03b_infer_type 06_emit_dxf_p1 06b_read_rooms 08_elev_emit 09_to_std 09b_section_emit 09c_roof_emit; do cp "$d/logs/$l.log" "$OUT/$k/"; done; }
one tb "$REF" "$PDF"; one second "$SEC/run" "$SEC/second_drawing.pdf"; for k in Z B H S T G D; do one "$k" "$VAR/$k" "$VAR/var_$k.pdf"; done
