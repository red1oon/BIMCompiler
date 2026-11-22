# Implementing PDF2BIM_VECTOR_PROBE.md §43.7 — Witness: W-S12a (round trip). Emits the scan's plan in the importer's
# STD sheet form (same layers as to_std.py): A-WALL-FULL closed footprints, A-GLAZ wall-thick rectangles in the
# exterior-ring gaps, interior gaps left open. Only READ walls are emitted; MEASURED ones are listed, not built.
# Usage: python3 -P raster_emit.py <workdir with walls_all.json> <out_dir>  > raster_emit.log
import sys, os, json

def log(*a): print(*a, flush=True)

work, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
W = json.load(open(os.path.join(work, 'walls_all.json')))['walls']
read = [w for w in W if w.get('src', 'READ') == 'READ']
meas = [w for w in W if w.get('src') == 'MEASURED']
for w in meas:
    log(f"§RASTER_EMIT_CANDIDATE MEASURED thk={w['thk_chain_m']} axis={w['axis']} x={w['x0']:.0f}..{w['x1']:.0f} y={w['y0']:.0f}..{w['y1']:.0f} (not built)")
ext_t = max(w['thk_chain_m'] for w in read)
X1 = max(w['x1'] for w in read); Y1 = max(w['y1'] for w in read)

ents = []
def poly(layer, x0, y0, x1, y1):   # closed LWPOLYLINE, sheet mm, y UP (DXF) = -y (sheet, y down)
    pts = [(x0, -y0), (x1, -y0), (x1, -y1), (x0, -y1)]
    e = ['0', 'LWPOLYLINE', '8', layer, '90', '4', '70', '1']
    for x, y in pts: e += ['10', f'{x:.1f}', '20', f'{y:.1f}']
    ents.append((layer, e))

for w in read: poly('A-WALL-FULL', w['x0'], w['y0'], w['x1'], w['y1'])

# exterior-ring gaps = openings in the exterior wall (the glazing evidence of §43.2 lives there): one A-GLAZ
# rectangle of the wall's own thickness per gap between two collinear exterior pieces
nglaz = 0
for axis in ('H', 'V'):
    ex = [w for w in read if w['axis'] == axis and w['thk_chain_m'] == ext_t]
    key = (lambda w: round(w['y0'] / 50)) if axis == 'H' else (lambda w: round(w['x0'] / 50))
    groups = {}
    for w in ex: groups.setdefault(key(w), []).append(w)
    for k, ws in groups.items():
        ws.sort(key=lambda w: w['x0'] if axis == 'H' else w['y0'])
        for a, b in zip(ws, ws[1:]):
            if axis == 'H':
                g0, g1 = a['x1'], b['x0']
                if g1 - g0 > 300: poly('A-GLAZ', g0, a['y0'], g1, a['y1']); nglaz += 1; log(f"§RASTER_EMIT_GLAZ H width={g1-g0:.0f}mm at y={a['y0']:.0f}")
            else:
                g0, g1 = a['y1'], b['y0']
                if g1 - g0 > 300: poly('A-GLAZ', a['x0'], g0, a['x1'], g1); nglaz += 1; log(f"§RASTER_EMIT_GLAZ V width={g1-g0:.0f}mm at x={a['x0']:.0f}")

marks = ['@UNITS=mm', '@SET=STD', '@VIEW=PLAN', '@NAME=OG (scan)']
M = []
for n, m in enumerate(marks):
    M += ['0', 'TEXT', '8', 'DXF2BIM-MARK', '10', '-3000', '20', str(-2500 - 300 * n), '30', '0', '40', '150', '1', m + ' @BY=user']
body = [x for _, e in ents for x in e] + M
dxf = ['0', 'SECTION', '2', 'HEADER', '9', '$INSUNITS', '70', '4', '0', 'ENDSEC',
       '0', 'SECTION', '2', 'ENTITIES'] + body + ['0', 'ENDSEC', '0', 'EOF']
path = os.path.join(out, 'plan_og.dxf')
open(path, 'w').write('\n'.join(dxf) + '\n')

# W-S12a round trip: count entities per layer back from the file
t = open(path).read().split('\n'); back = {}
for i in range(len(t) - 3):
    if t[i] == '0' and t[i + 1] in ('LWPOLYLINE', 'TEXT') and t[i + 2] == '8':
        back[t[i + 3]] = back.get(t[i + 3], 0) + 1
want = {'A-WALL-FULL': len(read), 'A-GLAZ': nglaz, 'DXF2BIM-MARK': len(marks)}
ok = all(back.get(k, 0) == v for k, v in want.items())
log(f"§RASTER_W-S12a written={want} read_back={back} verdict={'PASS' if ok else 'FAIL'} file={os.path.basename(path)} "
    f"walls_READ={len(read)} candidates_MEASURED={len(meas)} glazing={nglaz}")
