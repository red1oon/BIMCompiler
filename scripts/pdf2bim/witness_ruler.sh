#!/usr/bin/env bash
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §33 — W-T3..W-T6: runs that alter one thing and say what it changed. Slow (several whole chains); not part of run_p1.sh. Read the log.
# Usage: PDF2BIM_OOTB=<tree> witness_ruler.sh <reference outdir, a clean run_p1 of this code> <work dir>
set -u
S="$(cd "$(dirname "$0")" && pwd)"; REF="$1"; WK="$2"; T="$S/types"; TJ="$T/low_cost_single_storey_unit.json"; RJ="$T/low_cost_house_rosetta.json"; mkdir -p "$WK"
PDF="${PDF2BIM_PDF:-}"; for c in "$S/../../2D_Layout/input/TBKLTN_House.pdf" "$HOME/bim-compiler/2D_Layout/input/TBKLTN_House.pdf"; do [ -z "$PDF" ] && [ -f "$c" ] && PDF="$c"; done
[ -f "$REF/typed/plan.dxf" ] || { echo "§T W-T3 VACUOUS no reference run at $REF"; exit 1; }
fails=0; say(){ [ "$2" = PASS ] || fails=$((fails+1)); echo "§T $1 $2 $3"; }
chain(){ d="$WK/$1"; shift; rm -rf "$d"; mkdir -p "$d"; ln -sfn "$(readlink -f "$REF/lib")" "$d/lib"; env "$@" "$S/run_p1.sh" "$d" > "$d/run.out" 2>&1; }
same(){ n=0; for f in "$REF"/typed/*.dxf; do cmp -s "$f" "$1/typed/$(basename "$f")" || { n=$((n+1)); echo "§T   differs $(basename "$f") lines $(diff "$f" "$1/typed/$(basename "$f")" 2>&1 | grep -c '^[<>]')"; }; done; echo "$n"; }
# W-T4: the same drawing moved on an enlarged page: no position may be typed
gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dDEVICEWIDTHPOINTS=960 -dDEVICEHEIGHTPOINTS=720 -dFIXEDMEDIA -dAutoRotatePages=/None -sOutputFile="$WK/moved.pdf" -c "<</PageOffset [60 0]>> setpagedevice" -f "$PDF" > "$WK/gs.log" 2>&1
a=$(pdftotext -f 1 -l 1 -bbox "$PDF" - | grep -c '<word'); b=$(pdftotext -f 1 -l 1 -bbox "$WK/moved.pdf" - | grep -c '<word'); x0=$(pdftotext -f 1 -l 1 -bbox "$PDF" - | grep -m1 '>A<' | sed -E 's/.*xMin="([0-9.]+)".*/\1/'); x1=$(pdftotext -f 1 -l 1 -bbox "$WK/moved.pdf" - | grep -m1 '>A<' | sed -E 's/.*xMin="([0-9.]+)".*/\1/')
echo "§T   moved page: words $a -> $b, first A x $x0 -> $x1"
if [ "$x0" = "$x1" ]; then say W-T4 NO-OP "the moved PDF did not move"; else
  chain moved PDF2BIM_PDF="$WK/moved.pdf"; h0=$(cat "$REF/logs/18_geom_hash.log"); h1=$(cat "$WK/moved/logs/18_geom_hash.log" 2>/dev/null); echo "§T   reference $h0"; echo "§T   moved     $h1"
  python3 -I "$S/witness_sheets_same.py" "$REF/typed" "$WK/moved/typed" > "$WK/same.log" 2>&1; sed 's/^/§T   /' "$WK/same.log" | cut -c1-200; bad=$(grep -hE '^§(PDF G1 .*WRONG|WC RESULT fails [1-9]|R RESULT fails [1-9]|T RESULT WRONG)' "$WK"/moved/logs/*.log | wc -l)
  if [ "$h0" = "$h1" ] && grep -q '^§SAME PASS' "$WK/same.log" && [ "$bad" = 0 ]; then say W-T4 PASS "moved drawing: same geometry, same entities, chain witnesses clean"; else say W-T4 WRONG "moved drawing: hash same=$([ "$h0" = "$h1" ] && echo yes || echo no), witnesses WRONG $bad"; fi
fi
# W-T5a: a wrong ruler is overruled by the sheet
python3 -I - "$TJ" "$WK/wrong_ruler.json" <<'PY'
import json,sys
T=json.load(open(sys.argv[1])); T['blanks']['beam_above_ffl']['nominal']=3100; T['blanks']['eaves_from_axis']['nominal']=900; json.dump(T,open(sys.argv[2],'w'))
PY
python3 -I "$S/infer_type.py" "$REF/svg" "$RJ" "$WK/wrong_ruler.json" "$PDF" "$WK/wrong_ruler_out.json" > "$WK/wrong_ruler.log" 2>&1; grep -E 'beam_above_ffl|eaves_from_axis' "$WK/wrong_ruler.log" | cut -c1-120 | sed 's/^/§T   /'
python3 -I - "$WK/wrong_ruler_out.json" <<'PY' > "$WK/r.txt"
import json,sys
V=json.load(open(sys.argv[1]))['values']; b,e=V['beam_above_ffl'],V['eaves_from_axis']
print('PASS' if b['status']=='FINDING' and abs(b['value']-3000)<=15 and e['status']=='FINDING' and abs(e['value']-750)<=15 else 'WRONG')
PY
say W-T5a "$(cat "$WK/r.txt")" "template says beam 3100 eaves 900: the sheet's values are used and stated as FINDING"
# W-T5b: a sheet that cannot state a blank gives DEFAULT, not a crash and not silence
mkdir -p "$WK/strip"; cp "$REF"/svg/*.svg "$WK/strip/"; python3 -I - "$WK/strip/p5.svg" <<'PY'
import re,sys
f=sys.argv[1]; s=open(f).read(); n=[0]
def keep(m):
    t=m.group(0); d=re.search(r' d="([^"]*)"',t)
    if not d or 'C' in d.group(1): return t
    v=[float(x) for x in re.findall(r'-?[\d.]+',d.group(1))]; p=list(zip(v[::2],v[1::2]))
    if any(abs(a[0]-b[0])>1 and abs(a[1]-b[1])>1 for a,b in zip(p,p[1:])): n[0]+=1; return ''
    return t
open(f,'w').write(re.sub(r'<path [^>]*?/>',keep,s)); print('stripped',n[0])
PY
python3 -I "$S/infer_type.py" "$WK/strip" "$RJ" "$TJ" "$PDF" "$WK/strip_out.json" > "$WK/strip.log" 2>&1; l=$(grep -E '^§INFER ridge_above_beam' "$WK/strip.log" | cut -c1-100); echo "§T   $l"; case "$l" in *DEFAULT*) say W-T5b PASS "diagonals stripped from the side elevations: ridge is DEFAULT";; *) say W-T5b WRONG "diagonals stripped, ridge still: $l";; esac
# W-T6: the presumed orientation has one check
python3 -I - "$TJ" "$WK/swapped.json" <<'PY'
import json,sys
T=json.load(open(sys.argv[1])); v=T['views']; v['FRONT']['row'],v['REAR']['row']=v['REAR']['row'],v['FRONT']['row']; json.dump(T,open(sys.argv[2],'w'))
PY
chain swapped PDF2BIM_TEMPLATE="$WK/swapped.json"; t0=$(grep -c 'NO plan chain' "$REF/logs/08_elev_emit.log"); t1=$(grep -c 'NO plan chain' "$WK/swapped/logs/08_elev_emit.log")
[ "$t0" = 0 ] && [ "$t1" -gt 0 ] && say W-T6 PASS "true orientation: 0 windows lost their plan chain; FRONT and REAR swapped: $t1 lost" || say W-T6 WRONG "true $t0, swapped $t1"
echo "§T RESULT fails $fails"
