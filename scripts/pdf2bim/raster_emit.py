# Implementing PDF2BIM_VECTOR_PROBE.md §43.7 + §43.11 + §43.15 — Witness: W-S12a (round trip, every sheet), W-S18 (READ snap + dimensions).
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

# §43.15 READ values used where the scan measures them (template rule §33): a GREEN chain's ticks (px -> mm) pair with the
# cumulative sums of its READ segments; a wall coordinate within 1 px of a tick takes the READ value. Nothing farther moves.
def read_ticks(c, key, K):
    t = c[key]; segs = c['segs']
    if 'ticks_rot' in c:   # a V chain is read rotated: its segments run in ticks_rot order, which maps onto ticks_y reversed or as is
        tr, n = c['ticks_rot'], len(c['ticks_rot'])
        rev = len({tr[i] + t[n - 1 - i] for i in range(n)}) == 1; fwd = len({tr[i] - t[i] for i in range(n)}) == 1
        assert rev != fwd, 'ticks_rot does not map onto ' + key
        if rev: segs = segs[::-1]
        log(f"§RASTER_EMIT_SNAP_ORDER chain={c['dir']} segments_vs_{key}={'reversed' if rev else 'same'}")
    cum = [0]
    for sg in segs: cum.append(cum[-1] + round(sg['v'] * 1000))
    assert len(cum) == len(t) and cum[-1] == round(c['overall'] * 1000), 'chain ticks/segments/overall disagree'
    out = [((v - t[0]) / K * 1000, r) for v, r in zip(t, cum)]
    worst = max(abs(m - r) for m, r in out)   # every tick's measured mm vs its READ position: the pairing itself is witnessed
    log(f"§RASTER_EMIT_TICKS chain={c['dir']} worst_tick_vs_READ_mm={worst:.1f} (1 px = {1000/K:.1f})")
    assert worst <= 2000 / K, 'tick/READ pairing off by more than 2 px'
    return out
TX, TY = read_ticks(gh, 'ticks_x', KH), read_ticks(gv, 'ticks_y', KV)
SN = dict(n=0, max_off=0.0, max_shift=0.0)
def snap(v, T, K):
    m, r = min(T, key=lambda p: abs(p[0] - v))
    if abs(m - v) > 1000 / K: return v
    if r != v: SN['n'] += 1; SN['max_off'] = max(SN['max_off'], abs(m - v)); SN['max_shift'] = max(SN['max_shift'], abs(r - v))
    return r
def snapw(w): return dict(w, x0=snap(w['x0'], TX, KH), x1=snap(w['x1'], TX, KH), y0=snap(w['y0'], TY, KV), y1=snap(w['y1'], TY, KV))
EXT = [snapw(w) for w in EXT]; INT = [snapw(w) for w in INT]
log(f"§RASTER_EMIT_SNAP moved={SN['n']} max_tick_offset_mm={SN['max_off']:.1f} (<= 1 px = {1000/KH:.1f}/{1000/KV:.1f}) max_shift_mm={SN['max_shift']:.1f} "
    f"envelope_mm={min(w['x0'] for w in EXT):.0f},{min(w['y0'] for w in EXT):.0f}..{max(w['x1'] for w in EXT):.0f},{max(w['y1'] for w in EXT):.0f}")

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
        if t[i] == '0' and t[i + 1] in ('LWPOLYLINE', 'TEXT', 'LINE', 'DIMENSION') and t[i + 2] == '8': back[t[i + 3]] = back.get(t[i + 3], 0) + 1
    ok = all(back.get(k, 0) == v for k, v in want.items())
    log(f"§RASTER_W-S12a {name} written={want} read_back={back} verdict={'PASS' if ok else 'FAIL'}")

# grid = the GREEN chains' ticks (mm from the outer corner)
GX = {f'X{i+1}': r for i, (m, r) in enumerate(TX)}                 # §43.15 the READ cumulative positions (outer = READ overall)
GY = {f'Y{i+1}': r for i, (m, r) in enumerate(TY)}

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
# §43.15 the GREEN chains as DIMENSIONs, on the side they are drawn (pattern: to_std.py dim()); text = the READ value in mm
def dim(p1, p2, anchor, rot, text): return ['0', 'DIMENSION', '8', 'A-ANNO-DIMS', '10', f'{anchor[0]:.1f}', '20', f'{anchor[1]:.1f}', '30', '0', '13', f'{p1[0]:.1f}', '23', f'{p1[1]:.1f}', '33', '0',
                                           '14', f'{p2[0]:.1f}', '24', f'{p2[1]:.1f}', '34', '0', '70', '0', '50', str(rot), '1', str(text)]
nd = 0
sideH = 'maxY' if gh['line_y'] < gv['ticks_y'][0] else 'minY'; sideV = 'maxX' if gv['line_x'] > gh['ticks_x'][-1] else 'minX'
cy_ = 900 if sideH == 'maxY' else -BD - 900; sgn = 1 if sideH == 'maxY' else -1
cx_ = BW + 900 if sideV == 'maxX' else -900; sgv = 1 if sideV == 'maxX' else -1
xs = [r for m, r in TX]; ys = [r for m, r in TY]
for a, b in list(zip(xs, xs[1:])) + [(xs[0], xs[-1])]:
    off = 450 if (a, b) == (xs[0], xs[-1]) else 0
    body += dim((a, -BD if sideH == 'minY' else 0), (b, -BD if sideH == 'minY' else 0), ((a + b) / 2, cy_ + sgn * off), 0, b - a); nd += 1
for a, b in list(zip(ys, ys[1:])) + [(ys[0], ys[-1])]:
    off = 450 if (a, b) == (ys[0], ys[-1]) else 0
    body += dim((BW if sideV == 'maxX' else 0, -a), (BW if sideV == 'maxX' else 0, -b), (cx_ + sgv * off, -(a + b) / 2), 90, b - a); nd += 1
log(f"§RASTER_EMIT_DIMS H_chain side={sideH} values_mm={[b - a for a, b in zip(xs, xs[1:])]} overall={xs[-1]} | V_chain side={sideV} values_mm={[b - a for a, b in zip(ys, ys[1:])]} overall={ys[-1]} | written={nd} (other sides: no GREEN chain, none stated)")
marks = ['@UNITS=mm', '@SET=STD', '@VIEW=PLAN', '@NAME=OG (scan)', '@LEVEL=0']
for n, m in enumerate(marks): body += tx(-3000, -2500 - 300 * n, m)
for k, x in GX.items(): body += tx(x, 600, f'@GRIDX={k}')
for k, y in GY.items(): body += tx(-600, -y, f'@GRIDY={k}')
write('plan_og.dxf', body, {'A-WALL-FULL': nw, 'A-GLAZ': ng, 'A-ANNO-DIMS': nd, 'DXF2BIM-MARK': len(marks) + len(GX) + len(GY)})

# ---- elevations: S (+X), N (-X), E (+Y), W (-Y) with north = sheet top (DEFAULT) ----
_ey0 = min(w['y0'] for w in EXT); _ey1 = max(w['y1'] for w in EXT)
RIDGE = H + round((_ey1 - _ey0) / 2 * math.tan(math.radians(PITCH)))   # the roof sheet uses the same envelope depth
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
    for zl in (0, H, RIDGE):   # §43.12: roof bottom / top drawn (dxf2shell roofZ); §43.15: + the plan level (DEFAULT 0) the qualifier asks drawn
        b += ['0', 'LINE', '8', 'A-ANNO-LEVL', '10', '-500', '20', f'{zl:.1f}', '30', '0', '11', f'{width + 500:.1f}', '21', f'{zl:.1f}', '31', '0']
    G = GX if face in 'SN' else GY
    for k, v in G.items(): b += tx(drawn(v), -600, f'@GRIDH={k}')
    write(f'elev_{face}.dxf', b, {'A-WALL': 1, 'A-GLAZ': n_, 'A-ANNO-LEVL': 3, 'DXF2BIM-MARK': len(mk) + 2 + len(G)})

# ---- roof (§43.12): outline = the EMITTED exterior envelope; gable rect + ridge along x (gables OST/WEST) ----
ex0 = min(w['x0'] for w in EXT); ex1 = max(w['x1'] for w in EXT); ey0 = min(w['y0'] for w in EXT); ey1 = max(w['y1'] for w in EXT)
cy = (ey0 + ey1) / 2
RIDGE = H + round((ey1 - ey0) / 2 * math.tan(math.radians(PITCH)))   # recomputed on the emitted envelope depth
log(f"§RASTER_EMIT_ROOF envelope_mm=({ex0:.0f},{ey0:.0f})-({ex1:.0f},{ey1:.0f}) pitch={PITCH} READ ridge_z={RIDGE} DERIVED ridge_axis=x (gables OST/WEST)")
b = lw('A-ROOF', rect(ex0, ey0, ex1, ey1)) + lw('A-ROOF-GABLE', rect(ex0, ey0, ex1, ey1))
b += ['0', 'LINE', '8', 'A-ROOF-RIDGE', '10', f'{ex0:.1f}', '20', f'{-cy:.1f}', '30', f'{RIDGE:.1f}', '11', f'{ex1:.1f}', '21', f'{-cy:.1f}', '31', f'{RIDGE:.1f}']
mk = ['@UNITS=mm', '@SET=STD', '@VIEW=ROOF', '@NAME=ROOF PLAN', f'@LEVEL={H/1000}', f'@ROOF={RIDGE/1000}', f'@PITCH={PITCH}']
for i, m in enumerate(mk): b += tx(-3000, -2500 - 300 * i, m)
for k, x in GX.items(): b += tx(x, 600, f'@GRIDX={k}')
for k, y in GY.items(): b += tx(-600, -y, f'@GRIDY={k}')
write('roof.dxf', b, {'A-ROOF': 1, 'A-ROOF-GABLE': 1, 'A-ROOF-RIDGE': 1, 'DXF2BIM-MARK': len(mk) + len(GX) + len(GY)})
