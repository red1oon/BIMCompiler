# Implementing PDF2BIM_VECTOR_PROBE.md §43.22 step 3 + bim-ootb DXF2BIM §L40 — Witnesses W-S22f (the garage is in the IFC as measured) and W-S22g (the house is unchanged).
# Issue it proves or disproves: "adding the annex leaves the house exactly as it was, and every annex.json / annex_heights.json value reaches the model".
# Usage: python3 witness_garage.py <house-only.ifc (baseline)> <with-garage.ifc> <EG work (annex.json)> <annex_heights.json> [<registry window sill mm> <window height mm> <door height mm>]
#   run WITHOUT -I (IfcOpenShell lives in the user site). Prints § lines; verdict PASS / FAIL / INCONCLUSIVE (nothing judged).
import sys, json, os
import ifcopenshell, ifcopenshell.geom
base_p, new_p, work, ah_p = sys.argv[1:5]
SILL, WH, DH = (int(v) for v in (sys.argv[5:8] if len(sys.argv) > 7 else (900, 1200, 2005)))
A = json.load(open(os.path.join(work, 'annex.json'))); AH = json.load(open(ah_p))
st = ifcopenshell.geom.settings(); st.set(st.USE_WORLD_COORDS, True)
def boxes(p):
    f = ifcopenshell.open(p); out = []
    it = ifcopenshell.geom.iterator(st, f, 4)
    if it.initialize():
        while True:
            sh = it.get(); v = sh.geometry.verts; xs, ys, zs = v[0::3], v[1::3], v[2::3]
            out.append((f.by_id(sh.id).is_a(), tuple(round(c * 1000) for c in (min(xs), min(ys), min(zs), max(xs), max(ys), max(zs)))))
            if not it.next(): break
    return out
B, N = boxes(base_p), boxes(new_p)
def near(a, b, t=1): return a[0] == b[0] and all(abs(p - q) <= t for p, q in zip(a[1], b[1]))
# W-S22g: every baseline element is in the new model (class + bbox to 1 mm); every new element not in the baseline lies west of the house (x_max <= 0)
left = list(N); missing = []
for e in B:
    m = next((x for x in left if near(x, e)), None)
    if m: left.remove(m)
    else: missing.append(e)
# W-S46b (PDF2BIM_VECTOR_PROBE.md §46.1, env HOUSE_SLAB=<section_heights.json>): the house's ground-floor slab is the ONE stated addition to the house:
# IfcSlab over the baseline house walls' plan box, z = -(A-A base slab rows, mm5) .. 0. Found exactly once -> taken out of the 'east of the house' list; absent or doubled -> FAIL.
if os.environ.get('HOUSE_SLAB'):
    SHh = json.load(open(os.environ['HOUSE_SLAB'])); bs = SHh['rows']['base']; thk = int(round((bs['bot'] - bs['top']) / SHh['k_px_per_m'] * 1000 / 5) * 5)
    hw = [b for c, b in B if c == 'IfcWall']; exp = ('IfcSlab', (min(b[0] for b in hw), min(b[1] for b in hw), -thk, max(b[3] for b in hw), max(b[4] for b in hw), 0))
    hits = [e for e in left if near(e, exp)]
    if len(hits) == 1: left.remove(hits[0])
    print(f"§W-S46b house ground slab expected={exp} found={len(hits)} (thickness {thk} mm READ-GEOM from A-A rows {bs['top']}/{bs['bot']}) verdict={'PASS' if len(hits) == 1 else 'FAIL'}")
extra_house = [e for e in left if e[1][3] > 1]
g_ok = not missing and not extra_house and len(B) > 0
print(f"§W-S22g house elements baseline={len(B)} found_in_new={len(B) - len(missing)} missing={missing[:4]} new_elements={len(left)} of which east of the house face={extra_house[:4]} verdict={'PASS' if g_ok else ('INCONCLUSIVE' if not B else 'FAIL')}")
# W-S22f: the garage elements (x_max <= 0) against the measured values
G = left
K = A['K3']; Hs = sorted([w for w in A['walls'] if w['axis'] == 'H'], key=lambda w: w['faces_mm'][0]); Vw = [w for w in A['walls'] if w['axis'] == 'V'][0]
xW = round(Vw['faces_mm'][0]); yN = round(Hs[0]['faces_mm'][0]); yS = 11990   # S face snapped to the READ house face (§43.22 step 3 spec)
top, rt, rthk, bthk = AH['wall_clear'], AH['roof_slab_top'], AH['roof_slab_thk'], AH['base_slab_thk']
chk = []
def has(cls, pred, what):
    hit = [e for e in G if e[0] == cls and pred(e[1])]; chk.append((what, len(hit))); return hit
walls = has('IfcWall', lambda b: b[2] == 0 and abs(b[5] - top) <= 1, f'IfcWall z 0..{top}')
slabs_b = has('IfcSlab', lambda b: abs(b[5] - 0) <= 1 and abs(b[2] + bthk) <= 1 and abs(b[0] - xW) <= 1 and abs(b[4] + yN) <= 1 and abs(b[1] + yS) <= 1, f'IfcSlab base {-bthk}..0 over the footprint')
slabs_r = has('IfcSlab', lambda b: abs(b[5] - rt) <= 1 and abs(b[2] - (rt - rthk)) <= 1 and abs(b[0] - xW) <= 1, f'IfcSlab roof {rt - rthk}..{rt}')
OP = {(round(o['nominal_mm'])): o for o in A['openings']}
win = has('IfcWindow', lambda b: abs(b[2] - SILL) <= 1 and abs(b[5] - SILL - WH) <= 1, f'IfcWindow z {SILL}..{SILL + WH}')
door = has('IfcDoor', lambda b: b[2] == 0 and abs(b[5] - DH) <= 1, f'IfcDoor z 0..{DH}')
ww = sorted(round(b[3] - b[0]) for c, b in win); dw = sorted(round(b[3] - b[0]) for c, b in door)
wx = sorted(round(b[0]) for c, b in walls); outer = (min([b[0] for c, b in walls] or [0]), max([b[3] for c, b in walls] or [0]), min([b[1] for c, b in walls] or [0]), max([b[4] for c, b in walls] or [0]))
f_ok = len(walls) >= 6 and len(slabs_b) == 1 and len(slabs_r) == 1 and ww == sorted(o['nominal_mm'] for o in A['openings'] if o['wall'] != Hs[0]['name']) and dw == [o['nominal_mm'] for o in A['openings'] if o['wall'] == Hs[0]['name']] \
    and abs(outer[0] - xW) <= 1 and abs(outer[1]) <= 1 and abs(outer[2] + yS) <= 1 and abs(outer[3] + yN) <= 1
print(f"§W-S22f garage elements={len(G)} checks={chk} window widths={ww} door widths={dw} wall outer box x {outer[0]}..{outer[1]} y {outer[2]}..{outer[3]} (expected x {xW}..0 y {-yS}..{-yN}) "
      f"verdict={'PASS' if f_ok else ('INCONCLUSIVE' if not G else 'FAIL')}")
