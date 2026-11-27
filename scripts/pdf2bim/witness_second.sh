#!/usr/bin/env bash
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §40 — the chain on a drawing in another hand, written from its own table, judged against that table. A test instrument: not a real drafter's set. Read the log.
# Usage: PDF2BIM_OOTB=<tree> witness_second.sh <reference outdir, for its library export> <work dir>
set -u
S="$(cd "$(dirname "$0")" && pwd)"; REF="$1"; WK="$2"; mkdir -p "$WK"
python3 -I "$S/make_second_drawing.py" "$WK/second_drawing.pdf"
chain(){ d="$WK/$1"; shift; rm -rf "$d"; mkdir -p "$d"; ln -sfn "$(readlink -f "$REF/lib")" "$d/lib"; env "$@" "$S/run_p1.sh" "$d" > "$d/run.out" 2>&1; }
chain run PDF2BIM_PDF="$WK/second_drawing.pdf"; python3 "$S/witness_second.py" "$WK/run" "$WK/second_drawing.pdf.truth.json"
grep -hE 'RESULT' "$WK/run/logs/06c_witness_rooms.log" "$WK/run/logs/13_witness_level_c.log" "$WK/run/logs/16_witness_roof.log" "$WK/run/logs/16b_witness_windows.log" "$WK/run/logs/16c_witness_doors.log" "$WK/run/logs/17_witness_template.log" | cut -c1-60
chain nofill PDF2BIM_PDF="$WK/second_drawing.pdf" PDF2BIM_NO_FILL=1; python3 "$S/witness_second.py" "$WK/nofill" "$WK/second_drawing.pdf.truth.json" | sed 's/^§2D /§2D-FALSIFIER /' | grep -E 'RESULT|IFC' | cut -c1-120
