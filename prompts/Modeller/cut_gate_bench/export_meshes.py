#!/usr/bin/env python3
# Exports the 50 refusing Duplex wall meshes (positions+faces) plus a representative cut box per
# element to JSON, for the node three-bvh-csg benchmark harness. Read-only against the fetched DBs.
import sqlite3, struct, json

geo = sqlite3.connect('Duplex_geo.db')
result = json.load(open('classify_result.json'))

out = []
for r in result['results']:
    if r.get('is_box'):
        continue  # only the refusing 50 are benchmark targets
    ghash = r['hash']
    row = geo.execute("select vertices, faces from component_geometries where geometry_hash=?", (ghash,)).fetchone()
    if not row:
        continue
    vblob, fblob = row
    nverts = len(vblob) // 4 // 3
    verts = list(struct.unpack('<%df' % (nverts * 3), vblob))
    nfaces = (len(fblob) // 4)
    faces = list(struct.unpack('<%dI' % nfaces, fblob))
    xs = verts[0::3]; ys = verts[1::3]; zs = verts[2::3]
    xmin, xmax = min(xs), max(xs)
    ymin, ymax = min(ys), max(ys)
    zmin, zmax = min(zs), max(zs)
    extents = sorted([('x', xmax - xmin), ('y', ymax - ymin), ('z', zmax - zmin)], key=lambda t: t[1])
    thin_axis = extents[0][0]   # smallest extent = wall thickness axis
    lo = dict(x=xmin, y=ymin, z=zmin); hi = dict(x=xmax, y=ymax, z=zmax)
    mid = dict(x=(xmin+xmax)/2, y=(ymin+ymax)/2, z=(zmin+zmax)/2)
    # representative window-like cut box: 40% of the two long axes, centered; overshoots the thin
    # (thickness) axis by 2x on both sides so the void fully perforates the wall (a real cut always
    # goes clean through the thickness — this is the only assumption this harness makes, documented).
    c1 = {}; c2 = {}
    for ax in ('x', 'y', 'z'):
        if ax == thin_axis:
            span = hi[ax] - lo[ax]
            c1[ax] = lo[ax] - span
            c2[ax] = hi[ax] + span
        else:
            span = (hi[ax] - lo[ax]) * 0.4
            c1[ax] = mid[ax] - span / 2
            c2[ax] = mid[ax] + span / 2
    out.append(dict(
        guid=r['guid'], name=r['name'], hash=ghash, ntris=r['ntris'], nverts=r['nverts'],
        vertices=verts, faces=faces,
        cutbox=dict(c1=[c1['x'], c1['y'], c1['z']], c2=[c2['x'], c2['y'], c2['z']]),
        bbox=dict(xmin=xmin, xmax=xmax, ymin=ymin, ymax=ymax, zmin=zmin, zmax=zmax),
        thin_axis=thin_axis,
    ))

json.dump(out, open('bench/meshes.json', 'w'))
print('exported', len(out), 'meshes to bench/meshes.json')
