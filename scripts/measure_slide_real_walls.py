#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — §SLIDE-REAL-WALLS Phase M (measure only, no build). Spec: prompts/RESUME_MODELLER_LOD400_REAL_GEOMETRY.md
# §SLIDE-REAL-WALLS. Read the log after every run.
# Issue it answers: can an authored door/window slide along its REAL host wall by re-cutting? That needs (M1) the opening
# to be a plain box, (M2) the host's uncut body, (M3) proof the shipped bake is exactly the opening subtraction, (M4) the
# opening box aligned with the host's own frame and through its full thickness. Pure read of the source IFC.
import sys, math, argparse, collections
import numpy as np
import ifcopenshell, ifcopenshell.geom

TOL = 1e-3  # 1 mm


def shape(f, el, cut):
    s = ifcopenshell.geom.settings()
    s.set('use-world-coords', True)
    s.set('disable-opening-subtractions', not cut)
    try:
        sh = ifcopenshell.geom.create_shape(s, el)
    except Exception as e:
        return None, str(e)[:60]
    v = np.array(sh.geometry.verts, dtype=float).reshape(-1, 3)
    t = len(sh.geometry.faces) // 3
    return (v, t), None


def yaw_of(el):
    # host local frame: its ObjectPlacement's RefDirection (world yaw); walls here are yaw-only (§ARC-YAW-ONLY)
    import ifcopenshell.util.placement as up
    m = up.get_local_placement(el.ObjectPlacement)
    return math.atan2(m[1][0], m[0][0]), m


def in_frame(v, yaw):
    c, s = math.cos(-yaw), math.sin(-yaw)
    R = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
    return v @ R.T


def is_box(v):
    # every vertex sits on a min or max face per axis, and the mesh has the 8 corners
    mn, mx = v.min(0), v.max(0)
    on = np.all((np.abs(v - mn) < TOL) | (np.abs(v - mx) < TOL), axis=1)
    corners = {tuple((np.abs(p - mx) < TOL).astype(int)) for p in v}
    return bool(on.all()) and len(corners) == 8, mn, mx


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ifc', required=True)
    ap.add_argument('--bldg', required=True)
    a = ap.parse_args()
    f = ifcopenshell.open(a.ifc)
    fills = f.by_type('IfcRelFillsElement')
    stats = collections.Counter()
    reasons = collections.Counter()
    for r in fills:
        op = r.RelatingOpeningElement
        voids = op.VoidsElements
        if not voids:
            reasons['opening-voids-nothing'] += 1; continue
        host = voids[0].RelatingBuildingElement
        stats['fills'] += 1
        o, err = shape(f, op, cut=False)
        hu, err2 = shape(f, host, cut=False)
        hc, err3 = shape(f, host, cut=True)
        if not o or not hu or not hc:
            reasons['tessellation-failed'] += 1
            print('§SLIDE-ROW bldg=%s host=%s opening=%s FAIL tessellation %s' % (a.bldg, host.GlobalId, op.GlobalId, err or err2 or err3))
            continue
        yaw, _ = yaw_of(host)
        ov = in_frame(o[0], yaw); hv = in_frame(hu[0], yaw)
        obox, omn, omx = is_box(ov)
        hbox, hmn, hmx = is_box(hv)
        # host thickness axis in its frame = the shorter horizontal extent
        ext = hmx - hmn
        k = 0 if ext[0] < ext[1] else 1
        through = omn[k] <= hmn[k] + TOL and omx[k] >= hmx[k] - TOL
        baked = hc[1] != hu[1]
        stats['boxOpenings'] += obox
        stats['hostPlainBox'] += hbox
        stats['through'] += bool(through and obox)
        stats['bakeIsOpening'] += baked
        consumed = hc[1] == 0   # the opening eats the whole host (void-consumed strip): no wall left to slide along
        stats['hostFullyConsumed'] += consumed
        ok = obox and through and baked and not consumed
        stats['slideable'] += ok
        why = [] if ok else [w for w, c in (('opening-not-box', not obox), ('not-through-thickness', not through), ('no-bake', not baked), ('host-fully-consumed', consumed)) if c]
        for w in why: reasons[w] += 1
        print('§SLIDE-ROW bldg=%s host=%s(%s) opening=%s filling=%s openingBox=%s hostBox=%s through=%s trisUncut=%d trisCut=%d %s' % (
            a.bldg, host.GlobalId, host.is_a(), op.GlobalId, r.RelatedBuildingElement.GlobalId, obox, hbox, through,
            hu[1], hc[1], 'OK' if ok else 'REFUSE:' + ','.join(why)))
    print('§SLIDE-MEASURE bldg=%s fills=%d boxOpenings=%d hostPlainBox=%d through=%d bakeIsOpening=%d hostFullyConsumed=%d slideable=%d reasons=%s' % (
        a.bldg, stats['fills'], stats['boxOpenings'], stats['hostPlainBox'], stats['through'], stats['bakeIsOpening'],
        stats['hostFullyConsumed'], stats['slideable'], dict(reasons)))


if __name__ == '__main__':
    main()
