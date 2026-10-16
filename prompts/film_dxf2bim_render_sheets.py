# Renders each std sheet (DXF) to a PNG on paper-white with ezdxf's drawing add-on (it DRAWS, it does not analyse),
# plus a JSON per sheet: the pixel transform and the overlay items read from the DXF entities (door arcs on A-DOOR,
# grid bubbles on A-GRID, dimension extents on A-ANNO-DIMS). Every overlay number is a count of DXF entities. Read the log (§SHEETPNG).
import sys, os, json, math
import ezdxf
from ezdxf.addons.drawing import RenderContext, Frontend
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
from ezdxf.addons.drawing.config import Configuration, ColorPolicy, BackgroundPolicy, LineweightPolicy
from ezdxf import bbox as ebbox
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
src, out = sys.argv[1], sys.argv[2]
W, H = 3840, 2160
os.makedirs(out, exist_ok=True)
for name in sys.argv[3:]:
    f = os.path.join(src, 'DX_%s_std.dxf' % name)
    doc = ezdxf.readfile(f); msp = doc.modelspace()
    ext = ebbox.extents(msp, fast=False)
    x0, y0, x1, y1 = ext.extmin.x, ext.extmin.y, ext.extmax.x, ext.extmax.y
    print('extent', name, x0, y0, x1, y1)
    m = 0.04 * max(x1 - x0, y1 - y0); x0 -= m; y0 -= m; x1 += m; y1 += m
    # widen the box to the image aspect (no distortion)
    cx, cy, w, h = (x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0
    if w / h > W / H: h = w * H / W
    else: w = h * W / H
    x0, x1, y0, y1 = cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2
    fig = plt.figure(figsize=(W / 100, H / 100), dpi=100)
    ax = fig.add_axes([0, 0, 1, 1]); ax.set_axis_off()
    cfg = Configuration(color_policy=ColorPolicy.BLACK, background_policy=BackgroundPolicy.WHITE, lineweight_scaling=2.2, min_lineweight=0.45)
    Frontend(RenderContext(doc), MatplotlibBackend(ax), config=cfg).draw_layout(msp, finalize=True)
    ax.set_xlim(x0, x1); ax.set_ylim(y0, y1); ax.set_aspect('auto'); ax.set_position([0, 0, 1, 1])
    png = os.path.join(out, name + '.png'); fig.savefig(png, dpi=100, facecolor='white'); plt.close(fig)
    px = lambda x, y: [round((x - x0) / (x1 - x0) * W, 1), round((y1 - y) / (y1 - y0) * H, 1)]
    sc = W / (x1 - x0)
    items = {'door_arcs': [], 'grid_bubbles': [], 'dims': [], 'grid_labels': []}
    for e in msp:
        L, T = e.dxf.layer, e.dxftype()
        if L == 'A-DOOR' and T == 'ARC':
            c, r, a0, a1 = e.dxf.center, e.dxf.radius, e.dxf.start_angle, e.dxf.end_angle
            if a1 < a0: a1 += 360
            pts = [px(c.x + r * math.cos(math.radians(a)), c.y + r * math.sin(math.radians(a))) for a in [a0 + (a1 - a0) * i / 24 for i in range(25)]]
            items['door_arcs'].append({'h': e.dxf.handle, 'pts': pts, 'hinge': px(c.x, c.y)})
        elif L == 'A-GRID' and T == 'CIRCLE':
            items['grid_bubbles'].append({'h': e.dxf.handle, 'c': px(e.dxf.center.x, e.dxf.center.y), 'r': round(e.dxf.radius * sc, 1)})
        elif L == 'A-GRID' and T == 'TEXT':
            items['grid_labels'].append(e.dxf.text)
        elif T == 'DIMENSION':
            b = ebbox.extents([v for v in e.virtual_entities()], fast=True)
            if b.has_data:
                p0, p1 = px(b.extmin.x, b.extmax.y), px(b.extmax.x, b.extmin.y)
                items['dims'].append({'h': e.dxf.handle, 'r': [p0[0], p0[1], p1[0], p1[1]], 'm': round(e.get_measurement(), 3)})
    json.dump({'sheet': name, 'file': os.path.basename(f), 'W': W, 'H': H, 'extent_mm': [x0, y0, x1, y1], 'items': items}, open(os.path.join(out, name + '.json'), 'w'))
    print('§SHEETPNG %s file=%s png=%dx%d door_arcs=%d grid_bubbles=%d grid_labels=%s dims=%d' % (name, os.path.basename(f), W, H, len(items['door_arcs']), len(items['grid_bubbles']), sorted(set(items['grid_labels'])), len(items['dims'])))
