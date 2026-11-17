#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — scope: prompts/LOD400_DEFAULT_RULES_SCOPE.md section 7 (BUILD 2 SPEC). Read the log after every run; the exit code is not evidence.
# Implementing LOD400_DEFAULT_RULES_SCOPE.md §7 — Witness: §PJRB_MARKS
# Issue proved/disproved: can a beam schedule that a drawing reader already pulled out as a table (columns + rows of text cells)
#   become the marks JSON the rebar engine takes (--schedule-json), with every stated cell kept verbatim and cited, and agree
#   with the earlier hand parser's numbers for every mark?
# Usage: s401_marks.py <tables.json> <out_marks.json> [--sheet S-401] [--cross-check beam_records.json]
#   <tables.json> = list of {file, tables:[{columns:[...], rows:[{cells:[...]}]}]} (the drawing table reader's output).
#   A table is a beam schedule when its first column is 'Type Mark'. Columns are found by header text, not by position.
# Output rows: {mark: {w, h, bottom:[[n,dia]..] (A + ADD B), top:[[n,dia]..] (D + E), hanger:[[n,dia]..] (C, kept, not used by the
#   engine), side:'2T12-300', stirrup:[dia, spacing_mm], stirrup_legs:n, stirrup_balance:[dia, spacing]|null, stirrup_inner:'..',
#   cells:{header: raw text}, source:'<file basename> table <i> row <k>'}}.  Deterministic: no clock, no random, sorted output keys.
import json, re, sys, os, math, argparse
ap = argparse.ArgumentParser(); ap.add_argument('tables'); ap.add_argument('out')
ap.add_argument('--sheet', default='S-401'); ap.add_argument('--cross-check', default=None)
A = ap.parse_args()

def parse_bars(s):                      # '4T20', '5T20 + 2T16', '-' ; same reading as the earlier hand parser (beam_rules.py bars())
    if not s or s.strip() in ('-', ''): return [], []
    out, bad = [], []
    for part in re.split(r'[+,&]', s):
        m = re.match(r'\s*(\d+)\s*[TtΦ@]?\s*(\d+)', part)
        if m: out.append([int(m.group(1)), int(m.group(2))])
        elif part.strip() not in ('', '-'): bad.append(part.strip())
    return out, bad
def parse_stirrup(s):                   # '2T10-150' -> legs 2, dia 10, spacing 150
    m = re.search(r'(\d+)\s*T\s*(\d+)\s*-\s*(\d+)', s or '')
    return None if not m else (int(m.group(1)), int(m.group(2)), int(m.group(3)))
COLS = {'A': r'BOTTOM\s*\(A\)', 'B': r'ADD\s*BOTTOM', 'C': r'HANGER', 'D': r'TOP\s*\(D\)', 'E': r'TOP\s*\(E\)', 'end_out': r'END\s*/\s*OUTER',
        'end_in': r'END\s*/\s*INNER', 'bal_out': r'BALANCE\s*/\s*OUTER', 'bal_in': r'BALANCE\s*/\s*INNER', 'side': r'SIDE\s*BARS', 'w': r'^Width', 'h': r'^Depth'}
data = json.load(open(A.tables)); fe = [x for x in data if A.sheet in x['file']]
if len(fe) != 1: print(f'§PJRB_MARKS sheets_matching_{A.sheet}={len(fe)} -> FAIL'); sys.exit(1)
fe = fe[0]; base = os.path.basename(fe['file']); marks = {}; unparsed = []; skipped = []; ntab = 0
for ti, t in enumerate(fe['tables']):
    cols = t.get('columns') or []
    if not cols or cols[0] != 'Type Mark': continue
    ntab += 1; ix = {}
    for k, pat in COLS.items():
        hit = [i for i, c in enumerate(cols) if re.search(pat, c or '', re.I)]
        ix[k] = hit[0] if hit else None
    missing = [k for k in ('A', 'D', 'side', 'end_out', 'w', 'h') if ix[k] is None]
    if missing: print(f'§PJRB_MARKS table {ti} lacks header(s) {missing} -> FAIL'); sys.exit(1)
    for ri, r in enumerate(t['rows']):
        c = r['cells']; mk = (c[0] or '').strip() if c else ''
        if mk in ('', '-'): continue
        cell = lambda k: (c[ix[k]] if ix[k] is not None and ix[k] < len(c) else '') or ''
        try: w = int(cell('w')); h = int(cell('h'))
        except ValueError: skipped.append((mk, 'width/depth not integer')); continue
        row = {'w': w, 'h': h}
        for key, cols_ in (('bottom', ('A', 'B')), ('top', ('D', 'E')), ('hanger', ('C',))):
            L = []
            for k in cols_:
                b, bad = parse_bars(cell(k)); L += b; unparsed += [(mk, k, x) for x in bad]
            row[key] = L
        sd = cell('side'); row['side'] = '' if sd.strip() in ('-', '') else sd.strip()
        st = parse_stirrup(cell('end_out'))
        row['stirrup'] = None if not st else [st[1], st[2]]; row['stirrup_legs'] = None if not st else st[0]
        sb = parse_stirrup(cell('bal_out')); row['stirrup_balance'] = None if not sb else [sb[1], sb[2]]
        row['stirrup_inner'] = '' if cell('end_in').strip() in ('-', '') and cell('bal_in').strip() in ('-', '') else f'end {cell("end_in").strip()} / balance {cell("bal_in").strip()}'
        row['cells'] = {cols[i]: (c[i] if i < len(c) else '') for i in range(len(cols))}
        row['source'] = f'{base} table {ti} row {ri} (mark {mk})'
        if mk in marks and {k: v for k, v in marks[mk].items() if k not in ('source', 'cells')} != {k: v for k, v in row.items() if k not in ('source', 'cells')}:
            print(f'§PJRB_MARKS mark {mk} appears twice with different values -> FAIL'); sys.exit(1)
        marks[mk] = row
json.dump({k: marks[k] for k in sorted(marks)}, open(A.out, 'w'), indent=1, sort_keys=True)
print(f'§PJRB_MARKS source_sheet={base} beam_tables={ntab} marks={len(marks)} skipped_rows={len(skipped)} unparsed_cells={len(unparsed)} ' + (f'first_unparsed={unparsed[0]}' if unparsed else '') + (f' skipped={skipped}' if skipped else '') + (' -> PASS' if marks and not unparsed else ' -> INCONCLUSIVE' if not marks else ' -> FAIL'))
nstir = sum(1 for r in marks.values() if r['stirrup']); nside = sum(1 for r in marks.values() if r['side']); nh = sum(1 for r in marks.values() if r['hanger'])
bal_diff = sorted(k for k, r in marks.items() if r['stirrup_balance'] and r['stirrup_balance'] != r['stirrup']); inner = sorted(k for k, r in marks.items() if r['stirrup_inner'])
print(f'§PJRB_MARKS_FIELDS with_stirrup={nstir} with_side={nside} with_hanger_C={nh} balance_differs_from_end={len(bal_diff)} {bal_diff} with_inner_legs_text={len(inner)}')
if A.cross_check:                       # agree with the earlier hand parser's per-mark records
    ref = {r['mark']: r for r in json.load(open(A.cross_check))}; bad = []
    area = lambda bl: sum(n * math.pi * d * d / 4 for n, d in bl)
    for mk, r in sorted(ref.items()):
        m = marks.get(mk)
        if m is None: bad.append((mk, 'missing')); continue
        if (m['w'], m['h']) != (r['w'], r['h']): bad.append((mk, 'size'))
        if abs(area(m['bottom']) - r['bot']) > 1e-6 or abs(area(m['top']) - r['top']) > 1e-6: bad.append((mk, 'bar area'))
        if (m['side'] or '') != (r['side'] or ''): bad.append((mk, 'side'))
        if (m['stirrup'] or None) != (list(r['stir']) if r['stir'] else None): bad.append((mk, 'stirrup'))
    extra = sorted(set(marks) - set(ref))
    print(f'§PJRB_MARKS_XCHECK reference_marks={len(ref)} compared={len(ref) - sum(1 for b in bad if b[1] == "missing")} mismatches={len(bad)} extra_marks_not_in_reference={len(extra)} ' + (f'first={bad[0]}' if bad else '') + (' -> PASS' if ref and not bad and not extra else ' -> FAIL' if ref else ' -> INCONCLUSIVE'))
