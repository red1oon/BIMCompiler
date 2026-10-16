#!/usr/bin/env python3
# §CUT_GATE_LAYER_BOX_VERIFY — task 3: does each individual layer SLAB (not the whole multi-layer
# envelope) independently pass the SAME box test _insertCutBox uses? Verifies candidate B's core claim
# ("slabs ARE boxes by construction") against the LIVE geo store, per-layer, not trusted from doctrine.
import sqlite3, struct, json

geo = sqlite3.connect('Duplex_geo.db')
d = json.load(open('classify_result.json'))
refuse = [r for r in d['results'] if not r['is_box']]

def box_test(verts, tol_scale=1e-4):
    if len(verts) < 8:
        return None
    xs = [v[0] for v in verts]; ys = [v[1] for v in verts]; zs = [v[2] for v in verts]
    xmin, xmax = min(xs), max(xs); ymin, ymax = min(ys), max(ys); zmin, zmax = min(zs), max(zs)
    sx, sy, sz = xmax - xmin, ymax - ymin, zmax - zmin
    if not (sx > 1e-6 and sy > 1e-6 and sz > 1e-6):
        return None
    tol = tol_scale * max(sx, sy, sz)
    def near(v, lo, hi): return abs(v - lo) <= tol or abs(v - hi) <= tol
    for (x, y, z) in verts:
        if not (near(x, xmin, xmax) and near(y, ymin, ymax) and near(z, zmin, zmax)):
            return False
    return True

total_layers = 0
box_layers = 0
non_box_layers = []
for r in refuse:
    ghash = r['hash']
    vblob, fblob = geo.execute("select vertices, faces from component_geometries where geometry_hash=?", (ghash,)).fetchone()
    nverts = len(vblob) // 4 // 3
    verts = struct.unpack('<%df' % (nverts * 3), vblob)
    nfaces = len(fblob) // 4
    faces = struct.unpack('<%dI' % nfaces, fblob)
    layers = geo.execute("select layer_seq, material_name, thickness_m, face_start, face_count from component_geometry_layers where geometry_hash=? order by layer_seq", (ghash,)).fetchall()
    for (seq, mat, thick, fstart, fcount) in layers:
        total_layers += 1
        if fcount <= 0:
            continue  # authored-empty subset row (row-33 exception) — not a geometry slab, skip
        idxs = faces[fstart*3 : (fstart+fcount)*3]
        uniq_vidx = sorted(set(idxs))
        vlist = [(verts[3*vi], verts[3*vi+1], verts[3*vi+2]) for vi in uniq_vidx]
        is_box = box_test(vlist)
        if is_box:
            box_layers += 1
        else:
            non_box_layers.append((r['guid'], r['name'], seq, mat, fcount, len(vlist)))

print('=== §CUT_GATE_LAYER_BOX_VERIFY ===')
print('total layer rows across the 50 refusing elements:', total_layers)
print('layer rows that ARE independently axis-aligned boxes:', box_layers)
print('layer rows that are NOT boxes:', len(non_box_layers))
for x in non_box_layers[:20]:
    print('  NON-BOX LAYER', x)
