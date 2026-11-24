# Implementing PDF2BIM_VECTOR_PROBE.md §43.7 + §43.11 + §43.15 + §43.18 — Witness: W-S12a (round trip, every sheet), W-S18 (READ snap + dimensions), W-S17e (two storeys).
# Emits the scan in the importer's STD sheet form (same layers/marks as to_std.py + elev_emit.py): plan, four
# elevations, roof. READ: walls (§43.2 READ), exterior ring + window gaps (§43.1), plan size (chains), roof pitch
# (§43.10). DEFAULT (stated, registry values): wall height, window sill/height, plan level 0, north = sheet top.
# Usage: python3 -P raster_emit.py <plan workdir (walls.json, walls_all.json, chains.json)> <roof.json> <out_dir> [<EG workdir>] [<section_heights.json>] [<annex_heights.json>]
#   with the 6th argument (§43.22 step 3): the annex (double garage) from the EG work's annex.json + annex_heights.json, appended after every house entity
#   with the 5th argument (§43.20 step 3): storey level, slab, roof bottom are READ-GEOM from the section (raster_section.py), not DEFAULT
#   with the 4th argument (§43.18): the EG is Level 1 at 0, the first plan is the OG above it; heights DEFAULT (storey = wall.height, slab = synth.slab.thickness)
import sys, os, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_werkplan_door_families import fid_of, door_height   # §43.21 one owner of the door family id + DEFAULT height
TPL_EFH = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'types', 'german_werkplan_efh.json')))

def log(*a): print(*a, flush=True)

work, roof_json, out = sys.argv[1], sys.argv[2], sys.argv[3]
EGW = sys.argv[4] if len(sys.argv) > 4 else None
SH = json.load(open(sys.argv[5])) if len(sys.argv) > 5 else None
AH = json.load(open(sys.argv[6])) if len(sys.argv) > 6 else None   # §43.22 step 3
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
if EGW:   # §43.18 two storeys, every height a DEFAULT: storey height = wall.height, EG walls stop under the slab (synth.slab.thickness)
    SLAB = round(float(regv('synth.slab.thickness')) * 1000)
    STOREYS = [dict(tag='EG', work=EGW, level=0, wall_h=H - SLAB, sheet='plan_eg.dxf'), dict(tag='OG', work=work, level=H, wall_h=H, sheet='plan_og.dxf')]
    if SH:   # §43.20 step 3: READ-GEOM from the section (levels above the base slab top = EG level 0)
        OGL, SLAB = SH['levels'][1], SH['slab_thk'][0]
        STOREYS = [dict(tag='EG', work=EGW, level=0, wall_h=OGL - SLAB, sheet='plan_eg.dxf'), dict(tag='OG', work=work, level=OGL, wall_h=SH['roof_bottom'] - OGL, sheet='plan_og.dxf')]
        log(f"§RASTER_EMIT_HEIGHTS READ-GEOM (section, k={SH['k_px_per_m']} px/m) OG level={OGL} slab={SLAB} roof_bottom={SH['roof_bottom']} measured apex={SH['apex']} | replaces DEFAULT wall.height={H} synth.slab.thickness={round(float(regv('synth.slab.thickness')) * 1000)}")
else: STOREYS = [dict(tag='OG', work=work, level=0, wall_h=H, sheet='plan_og.dxf')]
ROOF0 = STOREYS[-1]['level'] + STOREYS[-1]['wall_h']
RIDGE = ROOF0 + RISE
log(f"§RASTER_EMIT_VALUES READ plan={BW}x{BD}mm pitch={PITCH}deg (geometry gables {sorted(gab)}) | DEFAULT wall.height={H} "
    f"window.sill={SILL} window.height={WH} level=0 north=sheet_top | DERIVED ridge={RIDGE}mm (H + {BD}/2*tan{PITCH})" + (f' | wall.height/slab/roof bottom NOT used: READ-GEOM from the section, ridge = roof bottom {ROOF0} + rise' if SH and EGW else ''))
if EGW: log(f"§RASTER_EMIT_STOREYS " + ' '.join(f"{q['tag']}: level={q['level']} walls {q['level']}..{q['level'] + q['wall_h']}" for q in STOREYS) + f" roof_bottom={ROOF0} | {'READ-GEOM' if SH else 'DEFAULT'} synth.slab.thickness={SLAB}")

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
        if t[i] == '0' and t[i + 1] in ('LWPOLYLINE', 'TEXT', 'LINE', 'DIMENSION', 'ARC') and t[i + 2] == '8': back[t[i + 3]] = back.get(t[i + 3], 0) + 1
    ok = all(back.get(k, 0) == v for k, v in want.items())
    log(f"§RASTER_W-S12a {name} written={want} read_back={back} verdict={'PASS' if ok else 'FAIL'}")

def storey(work, tag, level, sheet, wall_h, door_h=None):
    C = json.load(open(os.path.join(work, 'chains.json')))
    W1 = json.load(open(os.path.join(work, 'walls.json')))['walls']
    WA = json.load(open(os.path.join(work, 'walls_all.json')))['walls']
    KH, KV = C['scale_px_per_m']['H'], C['scale_px_per_m']['V']
    gh = max([c for c in C['chains'] if c['verdict'] == 'GREEN' and c['dir'] == 'H'], key=lambda c: len(c['segs']))
    gv = max([c for c in C['chains'] if c['verdict'] == 'GREEN' and c['dir'] == 'V'], key=lambda c: len(c['segs']))
    BW, BD = round(gh['overall'] * 1000), round(gv['overall'] * 1000)   # this storey's READ overall chains
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
    # §43.16 openings measured jamb to jamb, sized to DIN 4172 (raster_openings.py): the two runs of each opening end at its nominal edges
    OPF = os.path.join(work, 'openings.json')
    if os.path.exists(OPF):
        EXT_IDX = [i for i, w in enumerate(W1) if w['thk_chain_m'] == ext_t]
        for o in json.load(open(OPF))['openings']:
            ia, ib = EXT_IDX.index(o['run_a']), EXT_IDX.index(o['run_b']); k0, k1 = ('x0', 'x1') if o['axis'] == 'H' else ('y0', 'y1')
            EXT[ia] = dict(EXT[ia], **{k1: o['a_mm']}); EXT[ib] = dict(EXT[ib], **{k0: o['b_mm']})
            log(f"§RASTER_EMIT_OPENING face={o['face']} nominal={o['nominal_mm']} class={o['cls']} edges_mm={o['a_mm']}..{o['b_mm']} (measured {o['meas_mm']})")
    else: log("§RASTER_EMIT_OPENING openings.json absent: gaps are the run gaps (§43.11 behaviour)")
    # §43.21 step 2: doors (raster_doors.py doors.json). Interior runs ending within 1 px + 30 mm of a door's nominal edge, in its band, end AT it
    DF = os.path.join(work, 'doors.json'); DOORS = json.load(open(DF))['doors'] if os.path.exists(DF) else []
    if DOORS:
        EXT_IDX_ = [i for i, w in enumerate(W1) if w['thk_chain_m'] == ext_t]; OPS_ = json.load(open(OPF))['openings'] if os.path.exists(OPF) else []
        nmv = 0
        for d in DOORS:
            K_ = KH if d['axis'] == 'H' else KV; tol = 1000 / K_ + 30; n2 = d['nominal_mm'] / 2
            d['ea'], d['eb'] = d['centre_mm'] - n2, d['centre_mm'] + n2
            if d['src'] == 'exterior':
                o = OPS_[d['index']]; d['ea'], d['eb'] = o['a_mm'], o['b_mm']; wr = EXT[EXT_IDX_.index(o['run_a'])]
                d['band'] = (wr['y0'], wr['y1']) if d['axis'] == 'H' else (wr['x0'], wr['x1']); continue
            k0, k1, b0, b1 = ('x0', 'x1', 'y0', 'y1') if d['axis'] == 'H' else ('y0', 'y1', 'x0', 'x1')
            tb = 1000 / (KV if d['axis'] == 'H' else KH) + 30
            for j, w in enumerate(INT):
                if w['axis'] != d['axis'] or abs(w[b0] - d['band_mm'][0]) > tb or abs(w[b1] - d['band_mm'][1]) > tb: continue
                if abs(w[k1] - d['ea']) <= tol and w[k1] != d['ea']: INT[j] = dict(w, **{k1: d['ea']}); nmv += 1
                elif abs(w[k0] - d['eb']) <= tol and w[k0] != d['eb']: INT[j] = dict(w, **{k0: d['eb']}); nmv += 1
            host = [w for w in INT if w['axis'] == d['axis'] and (w[k1] == d['ea'] or w[k0] == d['eb']) and abs(w[b0] - d['band_mm'][0]) <= tb and abs(w[b1] - d['band_mm'][1]) <= tb]
            pj = [j for j, w in enumerate(INT) if w['axis'] == d['axis'] and (w[k1] == d['ea'] or w[k0] == d['eb']) and abs(w[b0] - d['band_mm'][0]) <= tb and abs(w[b1] - d['band_mm'][1]) <= tb]
            if len(pj) == 2 and (abs(INT[pj[0]][b0] - INT[pj[1]][b0]) > 1 or abs(INT[pj[0]][b1] - INT[pj[1]][b1]) > 1):   # one wall, two traces: READ wins (§43.21 step 2 rule ii)
                T_ = round(d['thk_m'] * 1000); RT = {r for m, r in (TX if d['axis'] == 'V' else TY)}
                exact = [INT[j] for j in pj if abs((INT[j][b1] - INT[j][b0]) - T_) <= 1]
                band = (exact[0][b0], exact[0][b1]) if exact else None; why = 'piece at READ thickness'
                if band is None:
                    fr = [(INT[j][b0], +1) for j in pj if INT[j][b0] in RT] + [(INT[j][b1], -1) for j in pj if INT[j][b1] in RT]
                    if fr: f_, sg = fr[0]; band = (f_, f_ + T_) if sg > 0 else (f_ - T_, f_); why = f'READ tick face {f_} + READ thickness {T_}'
                if band:
                    mv = [round(max(abs(INT[j][b0] - band[0]), abs(INT[j][b1] - band[1])), 1) for j in pj]
                    for j in pj: INT[j] = dict(INT[j], **{b0: band[0], b1: band[1]})
                    log(f"§RASTER_EMIT_DOOR_BAND {tag} door centre={d['centre_mm']:.0f} two jamb pieces -> one band {band} ({why}); faces moved_mm={mv}")
                else: log(f"§RASTER_EMIT_DOOR_BAND {tag} door centre={d['centre_mm']:.0f} two jamb pieces differ, no READ value to unify them (stated, unchanged)")
                host = [INT[j] for j in pj]
            d['band'] = (host[0][b0], host[0][b1]) if host else (d['band_mm'][0], d['band_mm'][1])   # the EMITTED piece's band: the importer reads the hinge on its face to 1 mm
            d['host_found'] = bool(host)
        log(f"§RASTER_EMIT_DOORS {tag} doors={len(DOORS)} (interior {sum(d['src'] == 'interior' for d in DOORS)}, exterior {sum(d['src'] == 'exterior' for d in DOORS)}) interior_run_ends_moved_to_door_edges={nmv}")
    log(f"§RASTER_EMIT_SNAP moved={SN['n']} max_tick_offset_mm={SN['max_off']:.1f} (<= 1 px = {1000/KH:.1f}/{1000/KV:.1f}) max_shift_mm={SN['max_shift']:.1f} "
        f"envelope_mm={min(w['x0'] for w in EXT):.0f},{min(w['y0'] for w in EXT):.0f}..{max(w['x1'] for w in EXT):.0f},{max(w['y1'] for w in EXT):.0f}")

    # grid = the GREEN chains' ticks (mm from the outer corner)
    GX = {f'X{i+1}': r for i, (m, r) in enumerate(TX)}                 # §43.15 the READ cumulative positions (outer = READ overall)
    GY = {f'Y{i+1}': r for i, (m, r) in enumerate(TY)}

    # ---- plan ----
    body = []; nw = ng = 0
    for w in EXT + INT: body += lw('A-WALL-FULL', rect(w['x0'], w['y0'], w['x1'], w['y1'])); nw += 1
    STK = os.path.join(work, 'walls_stacked.json')
    if tag == 'EG' and os.path.exists(STK):   # §51 walls the upper plan places and this scan's own ink confirms (raster_stack.py): the upper wall's rectangle, stated as STACKED
        for w in json.load(open(STK))['walls']:
            body += lw('A-WALL-FULL', rect(w['x0'], w['y0'], w['x1'], w['y1'])); nw += 1
            log(f"§RASTER_EMIT_STACKED {tag} {w['axis']} rect_mm=({w['x0']:.0f},{w['y0']:.0f})-({w['x1']:.0f},{w['y1']:.0f}) thk {w['thk_chain_m']} J={w['stack_J']} from {w['stack_from']} (position and thickness: the upper plan's; presence: this scan's ink)")
    NF = os.path.join(work, 'notch.json'); ncw = ncol = 0; colz = []   # §43.19 a notched corner: glazed runs (curtain walls) + the post if measured
    if os.path.exists(NF):
        for cn in json.load(open(NF))['corners']:
            for q in cn.get('curtain', []): body += lw('A-WALL-CURT', rect(q['x0'], q['y0'], q['x1'], q['y1'])); ncw += 1
            if cn.get('post'): p_ = cn['post']; body += lw('A-COLS', rect(p_['x0'], p_['y0'], p_['x1'], p_['y1'])); ncol += 1
        log(f"§RASTER_EMIT_NOTCH {tag} curtain_walls={ncw} posts={ncol}")
    glaz = []   # gaps between collinear exterior runs = the measured openings (§43.1 W-S7b)
    for axis in ('H', 'V'):
        for side in (0, 1):
            ws = [w for w in EXT if w['axis'] == axis and ((w['y0'] < BD / 2) if axis == 'H' else (w['x0'] < BW / 2)) == (side == 0)]
            ws.sort(key=lambda w: w['x0'] if axis == 'H' else w['y0'])
            for a, b in zip(ws, ws[1:]):
                g0, g1 = (a['x1'], b['x0']) if axis == 'H' else (a['y1'], b['y0'])
                if g1 - g0 > 300:
                    face = ('N' if side == 0 else 'S') if axis == 'H' else ('W' if side == 0 else 'E')
                    if any(d['src'] == 'exterior' and d['face'] == face and d['ea'] < g1 and d['eb'] > g0 for d in DOORS): continue   # §43.21 a DOOR, written as its arc
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
    # §43.21 step 2: each DOOR = one A-DOOR ARC (hinge = centre, radius = nominal width, the importer's door rule), @TAG at the swing box centre
    DH = door_h or door_height(TPL_EFH); DHS = 'READ-GEOM (section door outlines, §43.21 step 3)' if door_h else 'DEFAULT(DIN 18101 opening Nennmaß)'; ndr = 0; tags_d = []; fams = {}
    # §52.2 owner ruling 2026-11-24 (German custom): the GROUND storey's exterior windows are full-height window doors (Fenstertüren):
    # sill 0, the storey's door height. DEFAULT: the sheet's BRH (sill) digits are not readable at this print (§47); a READ sill would win.
    if len(STOREYS) >= 2 and level == min(q['level'] for q in STOREYS):   # the ground storey of a multi-storey set (a one-sheet run is not judged)
        FT = []
        for g in glaz:
            if g.get('sidelight'): continue
            g['sill'] = 0; g['h'] = DH; g['fenster'] = True
            FT.append(dict(face=g['face'], along_mm=[round(g['a'], 1), round(g['b'], 1)], nominal_mm=round(g['b'] - g['a']), thk_m=ext_t, height_mm=DH, sill_mm=0))
            log(f"§RASTER_EMIT_FENSTERTUER {tag} face={g['face']} along_mm={g['a']:.1f}..{g['b']:.1f} width={round(g['b'] - g['a'])} sill=0 height={DH} "
                f"(DEFAULT owner 2026-11-24: ground storey = Fenstertür, German custom; was sill {SILL} / height {WH} registry)")
        log(f"§RASTER_W-S52e {tag} ground storey: window doors={len(FT)} of {sum(1 for g in glaz if not g.get('sidelight'))} exterior windows (side lights keep their own)")
        json.dump(dict(spec='PDF2BIM_VECTOR_PROBE.md §52.2', openings=FT), open(os.path.join(work, 'fenstertueren.json'), 'w'), indent=1)
    ANG = {('H', 'a', -1): (0, 90), ('H', 'a', 1): (270, 360), ('H', 'b', -1): (90, 180), ('H', 'b', 1): (180, 270),
           ('V', 'a', -1): (180, 270), ('V', 'a', 1): (270, 360), ('V', 'b', -1): (90, 180), ('V', 'b', 1): (0, 90)}   # DXF y up; sheet y down
    SLJ = []; sl_marks = []   # §48 the side lights (sidelights.json for the family generator): @TAG + @SCHEDULE marks, written with the door tags
    for d in DOORS:
        r = d.get('leaf_mm', d['nominal_mm']); al = d['ea'] if d['hinge'] == 'a' else d['eb']   # §48 a leaf narrower than its opening: the arc = the leaf
        ac = d['band'][0] if d['side'] == -1 else d['band'][1]   # hinge ON the host piece's face (importer L1.2 R9 / dxf2shell doorStrip, 1 mm); the drawn frame offset is logged, not used
        hx, hy = (al, -ac) if d['axis'] == 'H' else (ac, -al)
        a0, a1 = ANG[(d['axis'], d['hinge'], d['side'])]
        body += ['0', 'ARC', '8', 'A-DOOR', '10', f'{hx:.1f}', '20', f'{hy:.1f}', '30', '0', '40', f'{r:.1f}', '50', f'{a0:g}', '51', f'{a1:g}']; ndr += 1
        fam = fid_of(r, round(d['thk_m'] * 1000), DH); fams[fam] = r
        m_ = math.radians((a0 + a1) / 2); tags_d.append((hx + r / 2 * math.sqrt(2) * math.cos(m_), hy + r / 2 * math.sqrt(2) * math.sin(m_), f'@TAG=door,{fam}'))
        log(f"§RASTER_EMIT_DOOR {tag} {d['src']} axis={d['axis']} hinge=({hx:.1f},{hy:.1f}) r={r} arc={a0}..{a1} family={fam} edges_mm={d['ea']:.1f}..{d['eb']:.1f} host_band={d['band']} drawn_hinge_offset_mm={d['hinge_offset_mm']} (not used) height={DH} {DHS}")
        if d.get('leaf_mm'):   # §48 the rest of the opening, away from the hinge = a fixed side light in the same wall gap (sill 0, the door's height: DEFAULT, it shares the door frame)
            s0, s1 = (d['ea'] + r, d['eb']) if d['hinge'] == 'a' else (d['ea'], d['eb'] - r); sw = round(s1 - s0)
            rr_ = (s0, d['band'][0], s1, d['band'][1]) if d['axis'] == 'H' else (d['band'][0], s0, d['band'][1], s1)
            body += lw('A-GLAZ', rect(*rr_)); ng += 1; th = round(d['thk_m'] * 1000)
            sfam = 'DEWP_W%d%s_%dx%d' % (sw, '' if th == 365 else 'd%d' % th, sw, DH)
            sl_marks.append(((rr_[0] + rr_[2]) / 2, -(rr_[1] + rr_[3]) / 2, f'@TAG=window,{sfam}'))
            glaz.append(dict(face=d['face'], r=rr_, a=s0, b=s1, sill=0, h=DH, sidelight=True))   # the elevation shows it (its own sill / height), as every window
            SLJ.append(dict(face=d['face'], along_mm=[round(s0, 1), round(s1, 1)], nominal_mm=sw, thk_m=d['thk_m'], height_mm=DH, sill_mm=0, family=sfam, leaf_mm=r, door_index=d.get('index')))
            log(f"§RASTER_EMIT_SIDELIGHT {tag} face={d['face']} along_mm={s0:.1f}..{s1:.1f} width={sw} family={sfam} sill=0 height={DH} (DEFAULT: the door's frame) leaf={r} opening={d['eb'] - d['ea']:.1f}")
    for x_, y_, t_ in tags_d: body += tx(x_, y_, t_)
    FXJ = os.path.join(work, 'fixtures.json'); nfx = 0   # §52.5 each sanitary symbol read: @FIXTURE=<kind>,<facing> at its back point (DXF frame: y up, facing CCW from +x)
    if os.path.exists(FXJ):
        for f_ in json.load(open(FXJ))['fixtures']:
            fd = (360 - f_['facing_deg']) % 360; body += tx(f_['back_mm'][0], -f_['back_mm'][1], f"@FIXTURE={f_['kind']},{fd:g}"); nfx += 1
            log(f"§RASTER_EMIT_FIXTURE {tag} kind={f_['kind']} back_mm=({f_['back_mm'][0]:.0f},{f_['back_mm'][1]:.0f}) facing_sheet={f_['facing_deg']} facing_dxf={fd:g} drawn_mm={f_['size_mm']}")
        log(f"§RASTER_EMIT_FIXTURES {tag} written={nfx}")
    if SLJ: json.dump(dict(spec='PDF2BIM_VECTOR_PROBE.md §48', openings=SLJ), open(os.path.join(work, 'sidelights.json'), 'w'), indent=1)
    for x_, y_, t_ in sl_marks:
        if x_ is not None: body += tx(x_, y_, t_); tags_d.append((x_, y_, t_))
    marks = ['@UNITS=mm', '@SET=STD', '@VIEW=PLAN', f'@NAME={tag} (scan)', f'@LEVEL={level / 1000:g}'] + ([f'@BODYZ=column,{level / 1000:g},{(level + wall_h) / 1000:g}'] if ncol else []) + ([f'@SCHEDULE={f},door,{w_},{DH}' for f, w_ in sorted(fams.items())] + ['@HEADFRAME=0'] if fams else []) + [t_ for x_, y_, t_ in sl_marks if x_ is None]
    for n, m in enumerate(marks): body += tx(-3000, -2500 - 300 * n, m)
    for k, x in GX.items(): body += tx(x, 600, f'@GRIDX={k}')
    for k, y in GY.items(): body += tx(-600, -y, f'@GRIDY={k}')
    want = {'A-WALL-FULL': nw, 'A-GLAZ': ng, 'A-ANNO-DIMS': nd, 'DXF2BIM-MARK': len(marks) + len(GX) + len(GY)}
    if ndr: want['A-DOOR'] = ndr; want['DXF2BIM-MARK'] += len(tags_d)
    want['DXF2BIM-MARK'] += nfx   # §52.5 the @FIXTURE marks
    if ncw: want['A-WALL-CURT'] = ncw
    if ncol: want['A-COLS'] = ncol
    if SH and EGW and tag == 'EG':   # §46.1 the house's ground-floor slab, drawn (A-A's base slab rows, READ-GEOM), after the house entities, before the annex
        bs = SH['rows']['base']; hthk = int(round((bs['bot'] - bs['top']) / SH['k_px_per_m'] * 1000 / 5) * 5)
        hx0 = min(w['x0'] for w in EXT); hx1 = max(w['x1'] for w in EXT); hy0 = min(w['y0'] for w in EXT); hy1 = max(w['y1'] for w in EXT)
        e = lw('A-FLOR-OTLN', rect(hx0, hy0, hx1, hy1)); e[6:6] = ['38', f'{0:.1f}', '39', f'{hthk:.1f}']; body += e; want['A-FLOR-OTLN'] = want.get('A-FLOR-OTLN', 0) + 1
        log(f"§RASTER_EMIT_HOUSE_SLAB ring_mm=({hx0:.1f},{hy0:.1f})-({hx1:.1f},{hy1:.1f}) top=0 (EG level 0, DEFAULT) thickness={hthk} (READ-GEOM, A-A base rows {bs['top']}/{bs['bot']} at k={SH['k_px_per_m']})")
    if sheet == STOREYS[-1]['sheet'] and TPL_EFH.get('owner_rulings'):   # §46.2 the owner's acceptance, on paper (bim-ootb §L37 / §L41a), as the type file states it
        OR_ = TPL_EFH['owner_rulings']; OA_ = OR_['_accept']; acc = [f"@ACCEPT={c},{OA_['who']},{OA_['date']},{OA_['reason']}" for k, v in OR_.items() if not k.startswith('_') for c in v]
        for n, m in enumerate(acc): body += tx(-3000, -2500 - 300 * (len(marks) + n), m)
        want['DXF2BIM-MARK'] += len(acc); log(f"§RASTER_EMIT_ACCEPT {len(acc)} marks on {sheet}: " + ' '.join(c for k, v in OR_.items() if not k.startswith('_') for c in v))
    SJ = os.path.join(work, 'stair.json')
    if tag == 'EG' and os.path.exists(SJ):   # §50 a READ stair (type_expect.py): its outline, the spine as a hole, the walk line (open, the turn as a bulge) on A-FLOR-STRS + @STAIR
        S_ = json.load(open(SJ)); o_ = S_['outline_mm']; sp_ = S_['spine_mm']; w_ = S_['walk_line_mm']
        body += lw('A-FLOR-STRS', rect(*o_)) + lw('A-FLOR-STRS', rect(*sp_))
        (xa, ya), (cx_, cy_), rr, (xb, yb) = w_['start'], w_['turn_centre'], w_['radius'], w_['end']
        bul = -1.0 if xa > xb else 1.0   # DXF y up: a half turn from the east run to the west run passing south (below the spine end) is clockwise
        pl = ['0', 'LWPOLYLINE', '8', 'A-FLOR-STRS', '90', '4', '70', '0', '10', f'{xa:.1f}', '20', f'{-ya:.1f}', '10', f'{xa:.1f}', '20', f'{-cy_:.1f}', '42', f'{bul:g}',
              '10', f'{xb:.1f}', '20', f'{-cy_:.1f}', '10', f'{xb:.1f}', '20', f'{-yb:.1f}']
        body += pl; want['A-FLOR-STRS'] = want.get('A-FLOR-STRS', 0) + 3
        sm = f"@STAIR={S_['n_risers']},{S_['rise_mm']},{S_['going_mm']}"; body += tx(o_[0], -(o_[1] - 300), sm); want['DXF2BIM-MARK'] += 1
        log(f"§RASTER_EMIT_STAIR {tag} outline_mm={o_} spine_mm={sp_} walk line {w_['start']} -> turn {w_['turn_centre']} r={rr} -> {w_['end']} bulge={bul:g} mark={sm} source={S_['source']}")
    GAR = None
    if AH and tag == 'EG':   # §43.22 step 3: the annex, appended AFTER every house entity (the reader's index handles of the house do not move)
        A_ = json.load(open(os.path.join(work, 'annex.json'))); assert A_['ring_closed'], 'annex ring not closed'
        Wn = {w['name']: w for w in A_['walls']}; Hs = sorted([w for w in A_['walls'] if w['axis'] == 'H'], key=lambda w: w['faces_mm'][0]); Vw = [w for w in A_['walls'] if w['axis'] == 'V'][0]
        yN = Hs[0]['faces_mm'][0]; yS = snap(Hs[1]['faces_mm'][1], TY, KV); xW = Vw['faces_mm'][0]   # MEASURED outer faces; S snaps to the house's READ south face (§43.15 rule)
        tN, tS, tW = Hs[0]['thk_mm'], Hs[1]['thk_mm'], Vw['thk_mm']
        log(f"§RASTER_EMIT_GARAGE faces_mm N={yN} S={Hs[1]['faces_mm'][1]}->{yS} W={xW} (MEASURED; S snapped to READ) thicknesses {tN}/{tS}/{tW} (READ-SERIES) | heights {dict((k, AH[k]) for k in ('wall_clear', 'roof_slab_thk', 'roof_slab_top', 'base_slab_thk'))} datum={AH['datum_vs_EG']}")
        OPn = []
        for o in A_['openings']:
            c_ = (o['edge_mm'][0] + o['edge_mm'][1]) / 2; h_ = o['nominal_mm'] / 2; OPn.append(dict(o, a=round(c_ - h_, 2), b=round(c_ + h_, 2), face='N' if Wn[o['wall']] is Hs[0] else 'S'))
        def pieces(x0, x1, ops):
            cut = sorted((q['a'], q['b']) for q in ops); out_ = []; a = x0
            for qa, qb in cut: out_.append((a, qa)); a = qb
            return out_ + [(a, x1)]
        WP = [('N', x0_, yN, x1_, yN + tN) for x0_, x1_ in pieces(xW, 0, [q for q in OPn if q['face'] == 'N'])] + \
             [('S', x0_, yS - tS, x1_, yS) for x0_, x1_ in pieces(xW, 0, [q for q in OPn if q['face'] == 'S'])] + [('W', xW, yN + tN, xW + tW, yS - tS)]
        gb = body; n0 = sum(1 for i in range(0, len(body), 2) if body[i] == '0')   # bim-ootb §L40: the garage ON the EG plan again, after every house entity (the house's index handles do not move)
        hd = []
        for k_, (f_, x0_, y0_, x1_, y1_) in enumerate(WP):
            gb += lw('A-WALL-FULL', rect(x0_, y0_, x1_, y1_)); hd.append(str(n0 + k_))
            log(f"§RASTER_EMIT_GARAGE_WALL {f_} rect_mm=({x0_},{y0_})-({x1_},{y1_}) handle={n0 + k_} top={AH['wall_clear']} base=0")
        ngz = 0
        for q in OPn:
            if q['face'] == 'S': gb += lw('A-GLAZ', rect(q['a'], yS - tS, q['b'], yS)); ngz += 1; log(f"§RASTER_EMIT_GARAGE_WINDOW S x_mm={q['a']}..{q['b']} nominal={q['nominal_mm']} ({q['cls']}, measured {q['meas_mm']})")
        GD = [q for q in OPn if q['face'] == 'N']; gdh = door_height(TPL_EFH); gfam = []
        for q in GD:   # hinge at the west edge on the inner face, swing into the garage (+y on the sheet): ANG ('H','a',+1)
            r = q['nominal_mm']; hx, hy = q['a'], -(yN + tN); fam = fid_of(r, tN, gdh); gfam.append((fam, r))
            gb += ['0', 'ARC', '8', 'A-DOOR', '10', f'{hx:.1f}', '20', f'{hy:.1f}', '30', '0', '40', f'{r:.1f}', '50', '270', '51', '360']
            m_ = math.radians(315); gb += tx(hx + r / 2 * math.sqrt(2) * math.cos(m_), hy + r / 2 * math.sqrt(2) * math.sin(m_), f'@TAG=door,{fam}')
            log(f"§RASTER_EMIT_GARAGE_DOOR N x_mm={q['a']}..{q['b']} nominal={r} ({q['cls']}, measured {q['meas_mm']}) hinge=({hx},{hy}) family={fam} height={gdh} DEFAULT (B-B draws only the door track)")
        ring = rect(xW, yN, 0, yS)
        for nm, top, thk in (('base', 0, AH['base_slab_thk']), ('roof', AH['roof_slab_top'], AH['roof_slab_thk'])):   # §D75: the piece's own top (38) and thickness (39), mm
            e = lw('A-FLOR-OTLN', ring); e[6:6] = ['38', f'{top:.1f}', '39', f'{thk:.1f}']; gb += e
            log(f"§RASTER_EMIT_GARAGE_SLAB {nm} ring_mm=({xW},{yN})-(0,{yS}) top={top} thickness={thk} (READ-GEOM, B-B){' -> IfcSlab, a flat roof beside a pitched one is not importable as IfcRoof (bim-ootb finding)' if nm == 'roof' else ''}")
        gm = [f'@WALLTOP=handle:{h},{AH["wall_clear"] / 1000:g},0' for h in hd] + [f'@SCHEDULE={f},door,{w_},{gdh}' for f, w_ in gfam]
        hw_ = [g for g in glaz if g['face'] == 'W' and g['a'] >= yN - 1 and g['b'] <= yS + 1]   # §L40: a house window now behind the garage: no elevation shows it -> its size by a schedule entry (§F8 D24), sill/height DEFAULT as every window
        for g in hw_:
            gh_, gs_ = g.get('h', WH), g.get('sill', SILL)   # §52.2 a ground-storey window door keeps its own sill / height here too
            wl = f"DEWP_W{round(g['b'] - g['a'])}_{round(g['b'] - g['a'])}x{gh_}"; r_ = g['r']; gb += tx((r_[0] + r_[2]) / 2, -(r_[1] + r_[3]) / 2, f'@TAG=window,{wl}')
            gm.append(f"@SCHEDULE={wl},window,{round(g['b'] - g['a'])},{gh_},{gs_}"); log(f"§RASTER_EMIT_GARAGE_HIDDEN_WINDOW W y_mm={g['a']}..{g['b']} tagged {wl}, schedule sill={gs_} height={gh_} ({'§52.2 window door' if g.get('fenster') else 'DEFAULT registry, as every window'})")
        for n, m in enumerate(gm): gb += tx(xW - 3000, -2500 - 300 * n, m)
        want['A-WALL-FULL'] += len(WP); want['A-GLAZ'] = want.get('A-GLAZ', 0) + ngz; want['A-FLOR-OTLN'] = want.get('A-FLOR-OTLN', 0) + 2; want['DXF2BIM-MARK'] += len(gm) + len(GD) + len(hw_)
        if GD: want['A-DOOR'] = want.get('A-DOOR', 0) + len(GD)
        GAR = dict(xW=xW, yN=yN, yS=yS, top=AH['wall_clear'], win=[q for q in OPn if q['face'] == 'S'])
    write(sheet, body, want)


    return dict(EXT=EXT, glaz=glaz, GX=GX, GY=GY, level=level, garage=GAR)

for i_, q in enumerate(STOREYS): q['door_h'] = SH['doors'][i_]['model_mm'] if (SH and EGW and SH.get('doors') and i_ < len(SH['doors'])) else None   # §43.21 step 3
ST = [dict(q, **storey(q['work'], q['tag'], q['level'], q['sheet'], q['wall_h'], q['door_h'])) for q in STOREYS]
TOP = ST[-1]; EXT, GX, GY = TOP['EXT'], TOP['GX'], TOP['GY']

# ---- elevations: S (+X), N (-X), E (+Y), W (-Y) with north = sheet top (DEFAULT) ----
_ey0 = min(w['y0'] for w in EXT); _ey1 = max(w['y1'] for w in EXT)
RIDGE = ROOF0 + round((_ey1 - _ey0) / 2 * math.tan(math.radians(PITCH)))   # the roof sheet uses the same envelope depth
FACEMARK = {'S': 'minY', 'N': 'maxY', 'E': 'maxX', 'W': 'minX'}   # DXF y up, north = sheet top (DEFAULT)
for face, hax in (('S', '+X'), ('N', '-X'), ('E', '+Y'), ('W', '-Y')):
    width = BW if face in 'SN' else BD
    def drawn(v):   # plan coordinate along the face -> drawn x (left to right as seen from outside)
        if face == 'S': return v
        if face == 'N': return BW - v
        if face == 'E': return BD - v      # sheet y (down = south): seen from the east, south is on the left
        return v
    b = []; n_ = 0
    for q in ST:   # §43.18 one wall band per storey (level .. level + wall_h), its own openings at its own sill
        G_ = q.get('garage'); hid = (G_['yN'], G_['yS']) if (G_ and face == 'W') else None   # bim-ootb §L40 R2: on W the garage hides the house's EG wall over its y range
        for x0b, x1b in ([(0, width)] if not hid else [(a_, b_) for a_, b_ in ((0, hid[0]), (hid[1], width)) if b_ - a_ > 1]):
            b += lw('A-WALL', [(x0b, q['level']), (x1b, q['level']), (x1b, q['level'] + q['wall_h']), (x0b, q['level'] + q['wall_h'])])
            if hid: log(f"§RASTER_EMIT_GARAGE_ELEV W house band split: drawn {x0b}..{x1b} (hidden {hid[0]}..{hid[1]})")
        for g in q['glaz']:
            if g['face'] != face: continue
            if hid and g['a'] >= hid[0] - 1 and g['b'] <= hid[1] + 1: log(f"§RASTER_EMIT_GARAGE_ELEV W house window {g['a']}..{g['b']} hidden behind the garage: not drawn"); continue
            x0, x1 = sorted((drawn(g['a']), drawn(g['b']))); z0 = q['level'] + g.get('sill', SILL); gh_ = g.get('h', WH)   # §48 a side light states its own sill / height
            b += lw('A-GLAZ', [(x0, z0), (x1, z0), (x1, z0 + gh_), (x0, z0 + gh_)]); n_ += 1
    ng_ = 0
    for q in ST:   # §43.22 step 3: the garage band (and its S windows) on the faces it shows
        G_ = q.get('garage')
        if not G_: continue
        span = {'S': (G_['xW'], 0), 'N': (drawn(0), drawn(G_['xW'])), 'W': (G_['yN'], G_['yS'])}.get(face)   # §L40: the W band again (the house band is split around it)
        if not span: continue
        b += lw('A-WALL', [(span[0], q['level']), (span[1], q['level']), (span[1], q['level'] + G_['top']), (span[0], q['level'] + G_['top'])]); ng_ += 1
        if face == 'S':
            for g in G_['win']:
                z0 = q['level'] + SILL; b += lw('A-GLAZ', [(g['a'], z0), (g['b'], z0), (g['b'], z0 + WH), (g['a'], z0 + WH)]); n_ += 1
        log(f"§RASTER_EMIT_GARAGE_ELEV {face} band drawn x {span[0]}..{span[1]} z {q['level']}..{q['level'] + G_['top']} windows {len(G_['win']) if face == 'S' else 0}")
    mk = ['@VIEW=ELEV', f'@FACE={FACEMARK[face]}', f'@HAXIS={hax}', '@UNITS=mm', '@SET=STD', f'@ROOF={RIDGE/1000}']
    for i, m in enumerate(mk): b += tx(-3000, -1000 - 300 * i, m)
    b += tx(-1500, 0, '@Z=0') + tx(-1500, H, f'@Z={H/1000}')
    ZL = sorted({q['level'] for q in ST} | {ROOF0, RIDGE})
    for zl in ZL:   # §43.12: roof bottom / top drawn (dxf2shell roofZ); §43.15: + every plan level (DEFAULT) the qualifier asks drawn
        b += ['0', 'LINE', '8', 'A-ANNO-LEVL', '10', '-500', '20', f'{zl:.1f}', '30', '0', '11', f'{width + 500:.1f}', '21', f'{zl:.1f}', '31', '0']
    G = GX if face in 'SN' else GY
    for k, v in G.items(): b += tx(drawn(v), -600, f'@GRIDH={k}')
    write(f'elev_{face}.dxf', b, {'A-WALL': sum(1 for i in range(0, len(b) - 3, 2) if b[i] == '0' and b[i + 3] == 'A-WALL'), 'A-GLAZ': n_, 'A-ANNO-LEVL': len(ZL), 'DXF2BIM-MARK': len(mk) + 2 + len(G)})

# ---- roof (§43.12): outline = the EMITTED exterior envelope; gable rect + ridge along x (gables OST/WEST) ----
ex0 = min(w['x0'] for w in EXT); ex1 = max(w['x1'] for w in EXT); ey0 = min(w['y0'] for w in EXT); ey1 = max(w['y1'] for w in EXT)
cy = (ey0 + ey1) / 2
RIDGE = ROOF0 + round((ey1 - ey0) / 2 * math.tan(math.radians(PITCH)))   # recomputed on the emitted envelope depth
log(f"§RASTER_EMIT_ROOF envelope_mm=({ex0:.0f},{ey0:.0f})-({ex1:.0f},{ey1:.0f}) pitch={PITCH} READ ridge_z={RIDGE} DERIVED ridge_axis=x (gables OST/WEST)")
if SH and EGW:
    dd = RIDGE - SH['apex']; px_ = dd / 1000 * SH['k_px_per_m']
    log(f"§RASTER_EMIT_RIDGE_CHECK derived ridge={RIDGE} (READ pitch) vs measured apex={SH['apex']} d={dd:+d} mm ({px_:+.1f} px, limit 2) verdict={'PASS' if abs(px_) <= 2 else 'FINDING'}")
b = lw('A-ROOF', rect(ex0, ey0, ex1, ey1)) + lw('A-ROOF-GABLE', rect(ex0, ey0, ex1, ey1))
b += ['0', 'LINE', '8', 'A-ROOF-RIDGE', '10', f'{ex0:.1f}', '20', f'{-cy:.1f}', '30', f'{RIDGE:.1f}', '11', f'{ex1:.1f}', '21', f'{-cy:.1f}', '31', f'{RIDGE:.1f}']
mk = ['@UNITS=mm', '@SET=STD', '@VIEW=ROOF', '@NAME=ROOF PLAN', f'@LEVEL={ROOF0/1000}', f'@ROOF={RIDGE/1000}', f'@PITCH={PITCH}']
for i, m in enumerate(mk): b += tx(-3000, -2500 - 300 * i, m)
for k, x in GX.items(): b += tx(x, 600, f'@GRIDX={k}')
for k, y in GY.items(): b += tx(-600, -y, f'@GRIDY={k}')
write('roof.dxf', b, {'A-ROOF': 1, 'A-ROOF-GABLE': 1, 'A-ROOF-RIDGE': 1, 'DXF2BIM-MARK': len(mk) + len(GX) + len(GY)})
