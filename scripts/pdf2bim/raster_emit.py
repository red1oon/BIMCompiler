# Implementing PDF2BIM_VECTOR_PROBE.md §43.7 + §43.11 — Witness: W-S12a (round trip, every sheet).
# Emits the scan in the importer's STD sheet form (same layers/marks as to_std.py + elev_emit.py): plan, four
# elevations, roof. READ: walls (§43.2 READ), exterior ring + window gaps (§43.1), plan size (chains), roof pitch
# (§43.10). DEFAULT (stated, registry values): wall height, window sill/height, plan level 0, north = sheet top.
# Usage: python3 -P raster_emit.py <plan workdir (walls.json, walls_all.json, chains.json)> <roof.json> <out_dir>
import sys, os, json, math

def log(*a): print(*a, flush=True)

work, roof_json, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
C = json.load(open(os.path.join(work, 'chains.json')))
W1 = json.load(open(os.path.join(work, 'walls.json')))['walls']          # §43.1 anchored trace
WA = json.load(open(os.path.join(work, 'walls_all.json')))['walls']      # §43.2 whole-plan search
RF = json.load(open(roof_json))
KH, KV = C['scale_px_per_m']['H'], C['scale_px_per_m']['V']
gh = max([c for c in C['chains'] if c['verdict'] == 'GREEN' and c['dir'] == 'H'], key=lambda c: len(c['segs']))
gv = max([c for c in C['chains'] if c['verdict'] == 'GREEN' and c['dir'] == 'V'], key=lambda c: len(c['segs']))
BW = (gh['ticks_x'][-1] - gh['ticks_x'][0]) / KH * 1000; BD = (gv['ticks_y'][-1] - gv['ticks_y'][0]) / KV * 1000
BW, BD = round(gh['overall'] * 1000), round(gv['overall'] * 1000)   # READ overall chains (12490 x 11990)

# DEFAULTS (registry bim-ootb modeller/element_defaults.json, read at run time so the value is the registry's)
REG = json.load(open('/home/red1/bim-ootb/modeller/element_defaults.json'))['defaults']
def regv(k): v = REG[k]; return v['value'] if isinstance(v, dict) else v
H = round(float(regv('wall.height')) * 1000); SILL = round(float(regv('window.sill')) * 1000); WH = round(float(regv('window.height')) * 1000)
gab = {k: v for k, v in RF['roof'].items() if min(v['pitch_l'], v['pitch_r']) > 5}
PITCH = RF['pitch_text'][0] if RF.get('pitch_text') else None
if PITCH is None: sys.exit(log("§RASTER_EMIT verdict=VACUOUS no READ pitch"))
RISE = round(BD / 2 * math.tan(math.radians(PITCH)))
RIDGE = H + RISE
log(f"§RASTER_EMIT_VALUES READ plan={BW}x{BD}mm pitch={PITCH}deg (geometry gables {sorted(gab)}) | DEFAULT wall.height={H} "
    f"window.sill={SILL} window.height={WH} level=0 north=sheet_top | DERIVED ridge={RIDGE}mm (H + {BD}/2*tan{PITCH})")

ext_t = max(w['thk_chain_m'] for w in W1 if w['thk_chain_m'])
EXT = [w for w in W1 if w['thk_chain_m'] == ext_t]                  # the ring with its measured window gaps
# exterior strip: interior walls inside it are dropped (the ring owns that strip)
def in_strip(w):
    t = ext_t * 1000 + 30
    return (w['x0'] < t and w['x1'] < t + 400) or w['x1'] > BW - t and w['x0'] > BW - t - 400 or \
           (w['y0'] < t and w['y1'] < t + 400) or (w['y1'] > BD - t and w['y0'] > BD - t - 400)
INT = [w for w in WA if w.get('src', 'READ') == 'READ' and w['thk_chain_m'] < ext_t and not in_strip(w)]
log(f"§RASTER_EMIT_WALLS exterior_runs={len(EXT)} interior_READ={len(INT)} candidates_MEASURED={sum(1 for w in WA if w.get('src') == 'MEASURED')} (not built)")

def lw(layer, pts):
    e = ['0', 'LWPOLYLINE', '8', layer, '90', str(len(pts)), '70', '1']
    for x, y in pts: e += ['10', f'{x:.1f}', '20', f'{y:.1f}']
    return e
def tx(x, y, t): return ['0', 'TEXT', '8', 'DXF2BIM-MARK', '10', f'{x:.1f}', '20', f'{y:.1f}', '30', '0', '40', '150', '1', t + ' @BY=user']
def rect(x0, y0, x1, y1): return [(x0, -y0), (x1, -y0), (x1, -y1), (x0, -y1)]   # sheet y down -> DXF y up
def write(name, body, want):
    dxf = ['0', 'SECTION', '2', 'HEADER', '9', '$INSUNITS', '70', '4', '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES'] + body + ['0', 'ENDSEC', '0', 'EOF']
    p = os.path.join(out, name); open(p, 'w').write('\n'.join(dxf) + '\n')
    t = open(p).read().split('\n'); back = {}
    for i in range(len(t) - 3):
        if t[i] == '0' and t[i + 1] in ('LWPOLYLINE', 'TEXT', 'LINE') and t[i + 2] == '8': back[t[i + 3]] = back.get(t[i + 3], 0) + 1
    ok = all(back.get(k, 0) == v for k, v in want.items())
    log(f"§RASTER_W-S12a {name} written={want} read_back={back} verdict={'PASS' if ok else 'FAIL'}")

# grid = the GREEN chains' ticks (mm from the outer corner)
GX = {f'X{i+1}': round((t - gh['ticks_x'][0]) / KH * 1000) for i, t in enumerate(gh['ticks_x'])}
GY = {f'Y{i+1}': round((t - gv['ticks_y'][0]) / KV * 1000) for i, t in enumerate(gv['ticks_y'])}
GX[list(GX)[-1]] = BW; GY[list(GY)[-1]] = BD                       # the outer ticks ARE the READ overall

# ---- plan ----
body = []; nw = ng = 0
for w in EXT + INT: body += lw('A-WALL-FULL', rect(w['x0'], w['y0'], w['x1'], w['y1'])); nw += 1
glaz = []   # gaps between collinear exterior runs = the measured openings (§43.1 W-S7b)
for axis in ('H', 'V'):
    for side in (0, 1):
        ws = [w for w in EXT if w['axis'] == axis and ((w['y0'] < BD / 2) if axis == 'H' else (w['x0'] < BW / 2)) == (side == 0)]
        ws.sort(key=lambda w: w['x0'] if axis == 'H' else w['y0'])
        for a, b in zip(ws, ws[1:]):
            g0, g1 = (a['x1'], b['x0']) if axis == 'H' else (a['y1'], b['y0'])
            if g1 - g0 > 300:
                face = ('N' if side == 0 else 'S') if axis == 'H' else ('W' if side == 0 else 'E')
                r = (g0, a['y0'], g1, a['y1']) if axis == 'H' else (a['x0'], g0, a['x1'], g1)
                glaz.append(dict(face=face, r=r, a=g0, b=g1)); body += lw('A-GLAZ', rect(*r)); ng += 1
for f in ('N', 'S', 'E', 'W'): log(f"§RASTER_EMIT_OPENINGS face={f} widths_mm={[round(g['b']-g['a']) for g in glaz if g['face'] == f]}")
marks = ['@UNITS=mm', '@SET=STD', '@VIEW=PLAN', '@NAME=OG (scan)', '@LEVEL=0']
for n, m in enumerate(marks): body += tx(-3000, -2500 - 300 * n, m)
for k, x in GX.items(): body += tx(x, 600, f'@GRIDX={k}')
for k, y in GY.items(): body += tx(-600, -y, f'@GRIDY={k}')
write('plan_og.dxf', body, {'A-WALL-FULL': nw, 'A-GLAZ': ng, 'DXF2BIM-MARK': len(marks) + len(GX) + len(GY)})

# ---- elevations: S (+X), N (-X), E (+Y), W (-Y) with north = sheet top (DEFAULT) ----
FACEMARK = {'S': 'minY', 'N': 'maxY', 'E': 'maxX', 'W': 'minX'}   # DXF y up, north = sheet top (DEFAULT)
for face, hax in (('S', '+X'), ('N', '-X'), ('E', '+Y'), ('W', '-Y')):
    width = BW if face in 'SN' else BD
    def drawn(v):   # plan coordinate along the face -> drawn x (left to right as seen from outside)
        if face == 'S': return v
        if face == 'N': return BW - v
        if face == 'E': return BD - v      # sheet y (down = south): seen from the east, south is on the left
        return v
    b = lw('A-WALL', [(0, 0), (width, 0), (width, H), (0, H)]); n_ = 0
    for g in glaz:
        if g['face'] != face: continue
        x0, x1 = sorted((drawn(g['a']), drawn(g['b'])))
        b += lw('A-GLAZ', [(x0, SILL), (x1, SILL), (x1, SILL + WH), (x0, SILL + WH)]); n_ += 1
    mk = ['@VIEW=ELEV', f'@FACE={FACEMARK[face]}', f'@HAXIS={hax}', '@UNITS=mm', '@SET=STD', f'@ROOF={RIDGE/1000}']
    for i, m in enumerate(mk): b += tx(-3000, -1000 - 300 * i, m)
    b += tx(-1500, 0, '@Z=0') + tx(-1500, H, f'@Z={H/1000}')
    G = GX if face in 'SN' else GY
    for k, v in G.items(): b += tx(drawn(v), -600, f'@GRIDH={k}')
    write(f'elev_{face}.dxf', b, {'A-WALL': 1, 'A-GLAZ': n_, 'DXF2BIM-MARK': len(mk) + 2 + len(G)})

# ---- roof ----
b = lw('A-ROOF', rect(0, 0, BW, BD))
mk = ['@UNITS=mm', '@SET=STD', '@VIEW=ROOF', '@NAME=ROOF PLAN', f'@LEVEL={H/1000}', f'@ROOF={RIDGE/1000}']
for i, m in enumerate(mk): b += tx(-3000, -2500 - 300 * i, m)
for k, x in GX.items(): b += tx(x, 600, f'@GRIDX={k}')
for k, y in GY.items(): b += tx(-600, -y, f'@GRIDY={k}')
write('roof.dxf', b, {'A-ROOF': 1, 'DXF2BIM-MARK': len(mk) + len(GX) + len(GY)})
