# ⚠ DO NOT REMOVE — PDF2BIM_VECTOR_PROBE.md §49 / §50: the EXPECTATION CHECKLIST. Read the log after every run (one §EXPECT line per rule).
# Implementing PDF2BIM_VECTOR_PROBE.md §50 — Witness: W-S49a (DE-1 stair READ, checks PASS), W-S49b (one storey -> NOT-EXPECTED), W-S49c (no evidence -> MISSING / FOUND-UNREAD, never READ)
# Usage: python3 -P type_expect.py <rules.json> <facts.json> <out_dir> [<dictionary.json>]
#   facts.json (written by scan2dxf.py): {"pdf_sha256": ..., "storeys": [{"name": "ERDGESCHOSS", "level_mm": 0, "buildup_mm": 145}, ...], "section_px_mm": 19.6}
#   writes <out_dir>/expect.json (every verdict) and, per READ stair, <out_dir>/stair.json (what the emitter draws). Nothing is drawn for a rule that is not READ.
import sys, os, json, re, math

def log(*a): print(*a, flush=True)
rules_p, facts_p, out = sys.argv[1], sys.argv[2], sys.argv[3]
R = json.load(open(rules_p))['rules']; F = json.load(open(facts_p))
D = json.load(open(sys.argv[4])) if len(sys.argv) > 4 and sys.argv[4] and os.path.exists(sys.argv[4]) else None
if D and D.get('applies_to_pdf_sha256') != F.get('pdf_sha256'):
    log(f"§EXPECT_DICT refused: the dictionary is bound to {str(D.get('applies_to_pdf_sha256'))[:12]}…, this set is {str(F.get('pdf_sha256'))[:12]}… (never applied to another drawing)"); D = None
ST = F['storeys']; facts = {'storeys': len(ST)}

def when_true(expr):   # one comparison over a READ fact: '<name> <op> <int>'; anything else is refused, not evaluated
    m = re.fullmatch(r'\s*(\w+)\s*(>=|<=|==|>|<)\s*(\d+)\s*', expr)
    if not m or m.group(1) not in facts: raise SystemExit(f"§EXPECT refused rule condition {expr!r} (only '<fact> <op> <int>' over {sorted(facts)})")
    a, op, b = facts[m.group(1)], m.group(2), int(m.group(3))
    return {'>=': a >= b, '<=': a <= b, '==': a == b, '>': a > b, '<': a < b}[op]

# --- checks, one function each (the rule names them) ---
def risers_times_rise_vs_storey(s, lo, hi):
    """stairs rise finished floor to finished floor: storey = level difference + upper build-up - lower build-up (section, §43.20 / §43.21);
    tolerance = the label's rounding (n x 0.5 mm) + one section pixel (the section's own resolution)"""
    ffl = (hi['level_mm'] + hi.get('buildup_mm', 0)) - (lo['level_mm'] + lo.get('buildup_mm', 0)); tot = s['n_risers'] * s['rise_mm']
    tol = s['n_risers'] * 0.5 + F.get('section_px_mm', 0); d = tot - ffl
    return abs(d) <= tol, f"n x rise = {s['n_risers']} x {s['rise_mm']} = {tot} mm vs finished floor to finished floor {ffl} mm (levels {lo['level_mm']}->{hi['level_mm']}, build-ups {lo.get('buildup_mm', 0)}/{hi.get('buildup_mm', 0)}) d={d:+.0f} tol={tol:.1f}"
def step_rule_din18065(s, lo, hi):
    v = 2 * s['rise_mm'] + s['going_mm']; return 590 <= v <= 650, f"2 x rise + going = {v} mm in 590..650 (DIN 18065 Schrittmaßregel)"
def walk_line_length_vs_treads(s, lo, hi):
    w = s['walk_line_mm']; (x0, y0), (cx, cy), r, (x1, y1) = w['start'], w['turn_centre'], w['radius'], w['end']
    L = abs(cy - y0) + math.pi * r + abs(cy - y1); need = (s['n_risers'] - 1) * s['going_mm']
    tol = (s['n_risers'] - 1) * 0.5 + 2 * F.get('plan_px_mm', 0)
    return abs(L - need) <= tol, f"walk line {abs(cy - y0):.0f} + pi x {r} + {abs(cy - y1):.0f} = {L:.0f} mm vs (n-1) x going = {need} mm d={L - need:+.0f} tol={tol:.1f}"
CHECKS = {f.__name__: f for f in (risers_times_rise_vs_storey, step_rule_din18065, walk_line_length_vs_treads)}

res = []; judged = 0
for rule in R:
    rid = rule['id']
    if not when_true(rule['when']):
        res.append(dict(id=rid, verdict='NOT-EXPECTED', why=f"{rule['when']} is false ({facts})")); log(f"§EXPECT id={rid} verdict=NOT-EXPECTED ({rule['when']} with {facts})"); continue
    judged += 1
    if rid == 'stair_per_storey_pair':
        pairs = list(zip(ST, ST[1:]))
        for lo, hi in pairs:
            src, s = None, None
            for ev in rule['evidence']:
                kind, key = ev.split(':')
                if kind == 'reader' and os.path.exists(os.path.join(out, key + '.json')): s = json.load(open(os.path.join(out, key + '.json'))); src = ev; break
                if kind == 'dictionary' and D and D.get(key) and D[key].get('from_storey') == lo['name'] and D[key].get('to_storey') == hi['name']: s = D[key]; src = ev + ' (owner-accepted multimodal read, §50)'; break
            tag = f"{lo['name']}->{hi['name']}"
            if s is None:
                res.append(dict(id=rid, pair=tag, verdict='MISSING', why='no reader output and no dictionary entry for this pair'))
                log(f"§EXPECT id={rid} pair={tag} verdict=MISSING (looked: {rule['evidence']}; nothing drawn, a stated finding)"); continue
            cs = [(c,) + CHECKS[c](s, lo, hi) for c in rule['check']]
            for c, ok, msg in cs: log(f"§EXPECT_CHECK id={rid} pair={tag} {c} {'PASS' if ok else 'FAIL'}: {msg}")
            v = 'READ' if all(ok for _, ok, _ in cs) else 'READ-FINDING'
            res.append(dict(id=rid, pair=tag, verdict=v, source=src, checks=[dict(name=c, ok=ok, msg=m) for c, ok, m in cs]))
            log(f"§EXPECT id={rid} pair={tag} verdict={v} source={src} label={s.get('label')!r}")
            if v == 'READ':
                rise_model = round((hi['level_mm'] - lo['level_mm']) / s['n_risers'], 3)
                json.dump(dict(s, level_from_mm=lo['level_mm'], level_to_mm=hi['level_mm'], rise_model_mm=rise_model, source=src, spec='PDF2BIM_VECTOR_PROBE.md §50'),
                          open(os.path.join(out, 'stair.json'), 'w'), indent=1, ensure_ascii=False)
                log(f"§EXPECT_STAIR written stair.json: n={s['n_risers']} rise label={s['rise_mm']} model={rise_model} (raw slab {lo['level_mm']} -> {hi['level_mm']}: the model has no floor build-up) going={s['going_mm']}")
    else:
        res.append(dict(id=rid, verdict='FOUND-UNREAD', why='no reader for this rule yet')); log(f"§EXPECT id={rid} verdict=FOUND-UNREAD (no reader for this rule yet)")
json.dump(dict(spec='PDF2BIM_VECTOR_PROBE.md §50', facts=facts, results=res), open(os.path.join(out, 'expect.json'), 'w'), indent=1, ensure_ascii=False)
log(f"§EXPECT_SUMMARY rules={len(R)} judged={judged} " + ' '.join(f"{r['id']}{'/' + r['pair'] if 'pair' in r else ''}={r['verdict']}" for r in res) + ('' if judged else ' verdict=INCONCLUSIVE (nothing was expected)'))
