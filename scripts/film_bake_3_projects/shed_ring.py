# ⚠ DO NOT REMOVE — scope: owner 2026-11-23 "Modify the Shed path so it does not end up outside but turns in or around midway to show the fuller buildup".
# Presentation only (a camera path). Inputs are extracted: barn box = element_world_bbox of SHED_extracted.db; modelOffset = the viewer's own
# §CENTRES_RESULT (streaming.js: AVG(center_*) of the one building) from the bake log. ifc2three = scene.js:521 (x-ox, z-oz, -(y-oy)).
import json, math, sys
ox, oy, oz = -661.3071497166593, -103.27348000538257, 2.7447474896616986
X0, X1, Y0, Y1, Z0, Z1 = -681.53, -640.69, -111.7, -94.94, -1.45, 5.82
cx, cy = (X0 + X1) / 2, (Y0 + Y1) / 2; GAP, EYE, N = 14.0, 8.0, 8        # presentation choices: ring 14 m out from the walls, 8 m eye, 8 sticks
rx, ry = (X1 - X0) / 2 + GAP, (Y1 - Y0) / 2 + GAP
t3 = lambda ix, iy, iz: {'x': ix - ox, 'y': iz - oz, 'z': -(iy - oy)}
look = t3(cx, cy, 1.5)                                                   # the barn's middle, 1.5 m above its floor (z=0)
bands = []
for i in range(N):
    a = -math.pi / 2 + 2 * math.pi * i / N                               # start on the south side, go anticlockwise (seen from above)
    ix, iy = cx + rx * math.cos(a), cy + ry * math.sin(a)
    tx, ty = -rx * math.sin(a), ry * math.cos(a); L = math.hypot(tx, ty)
    c = t3(ix, iy, EYE); d = {'x': tx / L, 'y': 0.0, 'z': -ty / L}
    bands.append({'c': c, 'd': d, 'len': 3.35, 'hold': 0, '_stick': True, 'lookAt': look})
json.dump({'bands': bands}, open(sys.argv[1], 'w'), indent=1)
print('§SHED_RING bands=%d rx=%.1f ry=%.1f eye=%.1f lookAt=%s' % (N, rx, ry, EYE, json.dumps({k: round(v, 2) for k, v in look.items()})))
