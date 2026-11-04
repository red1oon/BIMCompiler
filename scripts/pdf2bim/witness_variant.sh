#!/usr/bin/env bash
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §35 — the same chain on drawings it has never seen. No template or dictionary change. Read the log.
# Usage: PDF2BIM_OOTB=<tree> witness_variant.sh <reference outdir, a clean run_p1> <work dir>
set -u
S="$(cd "$(dirname "$0")" && pwd)"; REF="$1"; WK="$2"; mkdir -p "$WK"; RJ="$REF/rosetta.effective.json"; PDF="${PDF2BIM_PDF:-}"; for c in "$S/../../2D_Layout/input/TBKLTN_House.pdf" "$HOME/bim-compiler/2D_Layout/input/TBKLTN_House.pdf"; do [ -z "$PDF" ] && [ -f "$c" ] && PDF="$c"; done
chain(){ d="$WK/$1"; shift; rm -rf "$d"; mkdir -p "$d"; ln -sfn "$(readlink -f "$REF/lib")" "$d/lib"; env "$@" "$S/run_p1.sh" "$d" > "$d/run.out" 2>&1; }
var(){ python3 -I "$S/variant_drawing.py" "$REF/svg" "$RJ" "$REF/inferred.json" "$PDF" "$WK/var_$1.pdf" "$1" > "$WK/var_$1.log" 2>&1; grep -E "mode" "$WK/var_$1.log" | cut -c1-150; }
var Z; chain Z PDF2BIM_PDF="$WK/var_Z.pdf"; python3 "$S/witness_variant.py" Z "$WK/Z"; SAME_TOL_LINE=5 python3 -I "$S/witness_sheets_same.py" "$REF/typed" "$WK/Z/typed" | cut -c1-200
var B; chain B PDF2BIM_PDF="$WK/var_B.pdf"; python3 "$S/witness_variant.py" B "$WK/B"
chain NOFILL PDF2BIM_PDF="$WK/var_B.pdf" PDF2BIM_NO_FILL=1; python3 "$S/witness_variant.py" NOFILL "$WK/NOFILL"
var H; chain H PDF2BIM_PDF="$WK/var_H.pdf"; python3 "$S/witness_variant.py" H "$WK/H"
gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dDEVICEWIDTHPOINTS=842 -dDEVICEHEIGHTPOINTS=595 -dFIXEDMEDIA -dAutoRotatePages=/None -sOutputFile="$WK/var_S.pdf" -c "<</BeginPage{0.9 0.9 scale}>> setpagedevice" -f "$PDF" > "$WK/gs_S.log" 2>&1; chain S PDF2BIM_PDF="$WK/var_S.pdf"; python3 "$S/witness_variant.py" S "$WK/S"
var T; chain T PDF2BIM_PDF="$WK/var_T.pdf"; python3 "$S/witness_variant.py" T "$WK/T"
var G; chain G PDF2BIM_PDF="$WK/var_G.pdf"; python3 "$S/witness_variant.py" G "$WK/G"
python3 "$S/witness_variant.py" FR "$REF"
