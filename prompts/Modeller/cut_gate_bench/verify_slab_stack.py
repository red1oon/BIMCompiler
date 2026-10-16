#!/usr/bin/env python3
# §CUT_GATE_SLAB_STACK_VERIFY — refined test for candidate B's real fidelity claim. The naive per-layer
# box test (verify_layers_are_boxes.py) found 0/184 layer slabs pass a strict "8-corner box" test — but
# that conflates two DIFFERENT causes of non-box shape:
#  (1) legitimate multi-layer stacking along the thickness axis (N parallel boundary planes — expected,
#      and still exactly representable as N boxes, candidate B's whole point), vs
#  (2) real non-box envelope complexity (wall-end miters/steps/notches at wall-to-wall joins) in the
#      LENGTH or HEIGHT axes — NOT fixable by any number of boxes stacked along thickness; boxing this
#      would be invented geometry (a straight cut where the real wall has a step).
# This test separates them: find the thickness axis (smallest extent), then check whether the OTHER TWO
# axes have exactly 2 distinct values (min/max only, within tol) across the WHOLE element's vertex set.
# If yes -> pure slab-stack, candidate B is exact. If no -> real notch/miter present, candidate B would
# have to invent a straight edge — flag it by name.
import sqlite3, struct, json

geo = sqlite3.connect('Duplex_geo.db')
d = json.load(open('classify_result.json'))
refuse = [r for r in d['results'] if not r['is_box']]

def distinct_values(vals, tol):
    vals = sorted(vals)
    groups = [vals[0]]
    for v in vals[1:]:
        if abs(v - groups[-1]) > tol:
            groups.append(v)
    return groups

pure_stack = []
notched = []

for r in refuse:
    ghash = r['hash']
    vblob, fblob = geo.execute("select vertices, faces from component_geometries where geometry_hash=?", (ghash,)).fetchone()
    nverts = len(vblob) // 4 // 3
    verts = struct.unpack('<%df' % (nverts * 3), vblob)
    xs = verts[0::3]; ys = verts[1::3]; zs = verts[2::3]
    extents = [('x', max(xs) - min(xs)), ('y', max(ys) - min(ys)), ('z', max(zs) - min(zs))]
    extents.sort(key=lambda t: t[1])
    thin_axis = extents[0][0]
    other_axes = [a for a, _ in extents[1:]]
    axis_vals = dict(x=xs, y=ys, z=zs)
    tol = 1e-4 * max(e for _, e in extents)
    n_distinct = {}
    for ax in other_axes:
        n_distinct[ax] = len(distinct_values(axis_vals[ax], tol))
    if all(n_distinct[ax] <= 2 for ax in other_axes):
        pure_stack.append(r['guid'])
    else:
        notched.append((r['guid'], r['name'], thin_axis, n_distinct))

print('=== §CUT_GATE_SLAB_STACK_VERIFY ===')
print('total refusing wallish elements:', len(refuse))
print('PURE slab-stack (candidate B exact, no envelope notch):', len(pure_stack))
print('NOTCHED envelope (candidate B would invent a straight edge):', len(notched))
for x in notched:
    print('  NOTCHED', x)
