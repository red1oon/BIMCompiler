#!/usr/bin/env python3
# §CUT_GATE_CLASSIFY — reproduces bonsai_kernel.js _insertCutBox()'s box-only-box test against the
# LIVE Duplex resident (ARC db + patches applied, geo db fetched from OCI geoV=6). Read-only, no app
# code touched. Classifies every IfcWall*/refusing element as (a) layered wall, (b) opening-cut host,
# (c) other real geometry, per CUT_GATE_CSG_SPEC task 1.
import sqlite3, struct, sys, json

ARC = 'Duplex_ARC.db'
GEO = 'Duplex_geo.db'

arc = sqlite3.connect(ARC)
geo = sqlite3.connect(GEO)

def box_test(verts, tol_scale=1e-4):
    # exact port of bonsai_kernel.js _insertCutBox: every vertex must sit at one of the AABB's 8
    # actual corners (near(x,xmin,xmax) AND near(y,...) AND near(z,...) simultaneously per vertex).
    if len(verts) < 8:
        return None, 'degenerate(<8 verts)'
    xs = [v[0] for v in verts]; ys = [v[1] for v in verts]; zs = [v[2] for v in verts]
    xmin, xmax = min(xs), max(xs)
    ymin, ymax = min(ys), max(ys)
    zmin, zmax = min(zs), max(zs)
    sx, sy, sz = xmax - xmin, ymax - ymin, zmax - zmin
    if not (sx > 1e-6 and sy > 1e-6 and sz > 1e-6):
        return None, 'degenerate(flat)'
    tol = tol_scale * max(sx, sy, sz)
    def near(v, lo, hi):
        return abs(v - lo) <= tol or abs(v - hi) <= tol
    for (x, y, z) in verts:
        if not (near(x, xmin, xmax) and near(y, ymin, ymax) and near(z, zmin, zmax)):
            return False, 'non-box vertex'
    return True, 'box'

# 1) all wallish elements resolving a mesh
rows = arc.execute("""
    select m.guid, m.ifc_class, m.element_name, i.geometry_hash,
           t.rotation_x, t.rotation_y, t.rotation_z
    from elements_meta m
    join element_instances i on m.guid = i.guid
    left join element_transforms t on t.guid = m.guid
    where m.ifc_class like 'IfcWall%'
    order by m.guid
""").fetchall()

layered = {r[0] for r in arc.execute("select element_guid from rel_material_layer_set")}
opening_hosts = {r[0]: r[1] for r in arc.execute("select host_guid, count(*) from rel_fills_host group by host_guid")}
opening_host_classes = dict(arc.execute("select host_guid, host_class from rel_fills_host"))

results = []
for guid, ifc_class, name, ghash, rx, ry, rz in rows:
    grow = geo.execute("select vertices, faces from component_geometries where geometry_hash=?", (ghash,)).fetchone()
    if not grow:
        results.append(dict(guid=guid, ifc_class=ifc_class, name=name, hash=ghash, status='NO_GEOMETRY'))
        continue
    vblob, fblob = grow
    nverts = len(vblob) // 4 // 3
    verts = struct.unpack('<%df' % (nverts * 3), vblob)
    vlist = [(verts[i], verts[i+1], verts[i+2]) for i in range(0, len(verts), 3)]
    ntris = (len(fblob) // 4) // 3
    is_box, reason = box_test(vlist)
    is_layered = guid in layered
    is_opening_host = guid in opening_hosts
    layer_rows = geo.execute("select count(*) from component_geometry_layers where geometry_hash=?", (ghash,)).fetchone()[0]
    results.append(dict(
        guid=guid, ifc_class=ifc_class, name=name, hash=ghash,
        nverts=nverts, ntris=ntris, is_box=bool(is_box), reason=reason,
        rot=(round(rx or 0, 4), round(ry or 0, 4), round(rz or 0, 4)),
        is_layered_authored=is_layered, layer_geo_rows=layer_rows,
        is_opening_host=is_opening_host, opening_count=opening_hosts.get(guid, 0),
    ))

total = len(results)
cuttable = [r for r in results if r['is_box']]
refuse = [r for r in results if not r['is_box']]

print('=== §CUT_GATE_CLASSIFY — Duplex wallish (IfcWall*) candidates ===')
print('total wallish elements resolving a mesh:', total)
print('CUTTABLE (pass box test):', len(cuttable))
for r in cuttable:
    print('  BOX', r['guid'], r['ifc_class'], r['name'], 'tris=%d verts=%d' % (r['ntris'], r['nverts']))
print('REFUSE (fail box test):', len(refuse))

# classify refusals
class_a = [r for r in refuse if r['layer_geo_rows'] > 0]                       # real layered slab geometry present
class_b = [r for r in refuse if r['layer_geo_rows'] == 0 and r['is_opening_host']]  # opening-cut host, no layers
class_c = [r for r in refuse if r['layer_geo_rows'] == 0 and not r['is_opening_host']]  # other real geometry / rotation

print()
print('--- refusal class breakdown ---')
print('(a) layered wall (component_geometry_layers rows present):', len(class_a))
for r in class_a:
    print('    ', r['guid'], r['name'], 'layer_rows=%d tris=%d authored_layered=%s' % (r['layer_geo_rows'], r['ntris'], r['is_layered_authored']))
print('(b) opening-cut host (rel_fills_host, no layer rows):', len(class_b))
for r in class_b:
    print('    ', r['guid'], r['name'], 'openings=%d tris=%d rot=%s' % (r['opening_count'], r['ntris'], r['rot']))
print('(c) other real geometry (neither layered nor opening-host):', len(class_c))
for r in class_c:
    print('    ', r['guid'], r['name'], 'tris=%d verts=%d rot=%s reason=%s' % (r['ntris'], r['nverts'], r['rot'], r['reason']))

print()
print('=== SUMMARY TABLE ===')
print('total=%d  cuttable_box=%d  refuse=%d  (a)layered=%d  (b)opening_host=%d  (c)other=%d' % (
    total, len(cuttable), len(refuse), len(class_a), len(class_b), len(class_c)))

with open('classify_result.json', 'w') as f:
    json.dump(dict(total=total, cuttable=len(cuttable), refuse=len(refuse),
                    class_a_layered=len(class_a), class_b_opening=len(class_b), class_c_other=len(class_c),
                    results=results), f, indent=1)
print('wrote classify_result.json')
