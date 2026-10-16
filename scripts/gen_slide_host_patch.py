#!/usr/bin/env python3
# Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT
# ⚠ DO NOT REMOVE — §SLIDE-REAL-WALLS Phase B, extractor half (prompts/RESUME_MODELLER_LOD400_REAL_GEOMETRY.md
# §SLIDE-REAL-WALLS; Phase M verdict "build it", 2026-09-27). Read the log after every run.
"""
Emit a Modeller self-heal SQL patch carrying, for every SLIDEABLE authored opening of a building, what the Modeller
needs to slide it along its REAL host wall:
  slide_hosts    — the host wall's UNCUT body (IfcRelVoidsElement subtraction DISABLED at tessellation), in the SAME
                   local frame the shipped baked mesh uses (extractIFCtoDB.py: USE_WORLD_COORDS=False, verts float32,
                   faces int32, world = center + R·local), content-hashed like the extractor (sha256[:16]).
  slide_openings — the opening's own solid as a WORLD axis-aligned box (c1/c2) — exactly the `void` a GEOM_CUT row
                   carries — plus the host/filling guids of the rel_fills_host chain.
The Modeller's seed (arc_editable.js §SLIDE-SEED) folds the host as the uncut body + one GEOM_CUT per opening; the
existing §CUT-MOVE then carries the hole with the door. Nothing is invented: the wall body is authored uncut in IFC
(openings are separate IfcOpeningElements the consumer applies), the box is the opening's own solid.

Which rows qualify is re-measured HERE with the Phase M rules (scripts/measure_slide_real_walls.py, same functions):
  M1 opening solid is a plain axis-aligned box in the host frame; M2/M3 the shipped bake is exactly the opening
  subtraction (tris uncut ≠ cut, and the uncut body's local AABB == the shipped baked mesh's local AABB, 1 mm);
  M4 the box goes through the wall thickness; the host is not void-consumed. Rows failing any rule are logged as
  REFUSED with the reason and emitted NOWHERE — the Modeller keeps today's honest refusal for them.
  M5 (2026-09-30b, §UNCUT-IS-SOLID) the "uncut" body is SOLID at EVERY opening of its host: a line through each
  IfcOpeningElement's box centre along the host's thickness axis must cross the uncut body (≥2 face crossings).
  WHY: disabling IfcRelVoidsElement subtraction only removes the CONSUMER's cut. An IfcFacetedBrep body exported with
  its openings already in the faces (SampleHouse 3cUkl32yn9qRSPvBJVyWy4 / …Ww5: 0 triangles over any opening centre)
  stays holed — seeding it "uncut" and cutting again leaves the authored hole behind when the door slides (measured in
  the browser, W-E2E-SLIDE-REAL E5: open span [-1.53,1.22] = old ∪ new). M2/M3's "tris uncut ≠ cut" could not see it.
  One uncovered opening refuses the WHOLE host (its body is not an uncut body).

Idempotent: CREATE TABLE IF NOT EXISTS + INSERT OR IGNORE on each PRIMARY KEY (same contract as the rel_fills_host
patch). Blobs are emitted as X'hex' literals — text, reviewable, no binary crosses the network.

Usage:
  python3 scripts/gen_slide_host_patch.py --ifc reference/residential/Ifc4_SampleHouse.ifc --bldg SampleHouse \
      --arc-db <shipped SampleHouse_ARC.db> --geo-db <shipped SampleHouse_geo.db> \
      --out <bim-ootb>/modeller/patches/SampleHouse_ARC.db.sql --append
"""
import argparse, datetime, hashlib, math, sqlite3, sys
import numpy as np
import ifcopenshell, ifcopenshell.geom
import ifcopenshell.util.placement as up

TOL = 1e-3  # 1 mm


def shape(f, el, cut, world):
    s = ifcopenshell.geom.settings()
    s.set('use-world-coords', world)
    s.set('weld-vertices', True)
    s.set('disable-opening-subtractions', not cut)
    try:
        sh = ifcopenshell.geom.create_shape(s, el)
    except Exception as e:  # noqa
        return None, str(e)[:80]
    v = np.array(sh.geometry.verts, dtype=float).reshape(-1, 3)
    fc = np.array(sh.geometry.faces, dtype=np.int64).reshape(-1, 3)
    return (v, fc, sh), None


def yaw_of(el):
    m = up.get_local_placement(el.ObjectPlacement)
    return math.atan2(m[1][0], m[0][0]), np.array(m, dtype=float)


def in_frame(v, yaw):
    c, s = math.cos(-yaw), math.sin(-yaw)
    R = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
    return v @ R.T


def is_box(v):
    mn, mx = v.min(0), v.max(0)
    on = np.all((np.abs(v - mn) < TOL) | (np.abs(v - mx) < TOL), axis=1)
    corners = {tuple((np.abs(p - mx) < TOL).astype(int)) for p in v}
    return bool(on.all()) and len(corners) == 8, mn, mx


def ray_crossings(v, fc, origin, direction):
    # Möller–Trumbore over every triangle — number of faces the full line (t ∈ ℝ) crosses. ≥2 ⇒ solid there.
    a, b, c = v[fc[:, 0]], v[fc[:, 1]], v[fc[:, 2]]
    e1, e2 = b - a, c - a
    h = np.cross(direction, e2)
    det = np.einsum('ij,ij->i', e1, h)
    ok = np.abs(det) > 1e-12
    inv = np.where(ok, 1.0 / np.where(ok, det, 1.0), 0.0)
    sv = origin - a
    u = inv * np.einsum('ij,ij->i', sv, h)
    qv = np.cross(sv, e1)
    w = inv * (qv @ direction)
    hit = ok & (u >= 0) & (u <= 1) & (w >= 0) & (u + w <= 1)
    return int(hit.sum())


def uncut_covers_openings(f, host, hu, yaw):
    # M5: every IfcOpeningElement voiding this host must sit INSIDE solid material of the uncut body
    hvf = in_frame(hu[0], yaw)
    ext = hvf.max(0) - hvf.min(0)
    k = 0 if ext[0] < ext[1] else 1
    d_local = np.zeros(3); d_local[k] = 1.0
    d_world = in_frame(d_local[None, :], -yaw)[0]
    out = []
    for rv in host.HasOpenings:
        o, _ = shape(f, rv.RelatedOpeningElement, cut=False, world=True)
        if not o: out.append((rv.RelatedOpeningElement.GlobalId, None)); continue
        ctr = (o[0].min(0) + o[0].max(0)) / 2
        out.append((rv.RelatedOpeningElement.GlobalId, ray_crossings(hu[0], hu[1], ctr, d_world)))
    return out


def q(s):
    return "'" + str(s).replace("'", "''") + "'"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ifc', required=True)
    ap.add_argument('--bldg', required=True)
    ap.add_argument('--arc-db', required=True, help='shipped modeller/<B>_ARC.db (element_instances guid→hash, element_transforms)')
    ap.add_argument('--geo-db', required=True, help='served <B>_geo.db (component_geometries: the shipped BAKED meshes)')
    ap.add_argument('--out', required=True)
    ap.add_argument('--append', action='store_true')
    a = ap.parse_args()
    f = ifcopenshell.open(a.ifc)
    arc = sqlite3.connect(a.arc_db)
    geo = sqlite3.connect(a.geo_db)
    hashes = dict(arc.execute('SELECT guid, geometry_hash FROM element_instances'))
    tx = {r[0]: r[1:] for r in arc.execute('SELECT guid, center_x, center_y, center_z, bbox_x, bbox_y, bbox_z, rotation_z FROM element_transforms')}
    hosts_sql, openings_sql, stats, reasons = [], [], {'fills': 0, 'slideable': 0}, {}
    m5 = {}   # host guid -> [(opening guid, crossings)] — computed once per host
    for r in f.by_type('IfcRelFillsElement'):
        op = r.RelatingOpeningElement
        fill = r.RelatedBuildingElement
        voids = op.VoidsElements
        if not voids:
            reasons['opening-voids-nothing'] = reasons.get('opening-voids-nothing', 0) + 1; continue
        host = voids[0].RelatingBuildingElement
        stats['fills'] += 1
        o, e1 = shape(f, op, cut=False, world=True)          # the opening's own solid, WORLD (= the GEOM_CUT void frame)
        hu, e2 = shape(f, host, cut=False, world=True)       # host UNCUT, WORLD
        hc, e3 = shape(f, host, cut=True, world=True)        # host as shipped (cut), WORLD — the bake control
        why = []
        if not o or not hu or not hc:
            why.append('tessellation-failed:' + str(e1 or e2 or e3))
        else:
            yaw, M = yaw_of(host)
            ov = in_frame(o[0], yaw)
            obox, omn, omx = is_box(ov)
            if not obox: why.append('opening-not-box')
            # host thickness axis in its frame = the shorter horizontal extent of the UNCUT body (host-frame)
            hvf = in_frame(hu[0], yaw)
            ext = hvf.max(0) - hvf.min(0)
            k = 0 if ext[0] < ext[1] else 1
            through = omn[k] <= hvf.min(0)[k] + TOL and omx[k] >= hvf.max(0)[k] - TOL
            if not through: why.append('not-through-thickness')
            if host.GlobalId not in m5:
                m5[host.GlobalId] = uncut_covers_openings(f, host, hu, yaw)
                print('§SLIDE-UNCUT-SOLID host=%s(%s) body=%s crossings=%s' % (host.GlobalId, host.is_a(),
                    '/'.join(sorted({it.is_a() for r in host.Representation.Representations if r.RepresentationIdentifier == 'Body' for it in r.Items})),
                    ' '.join('%s:%s' % (g, c) for g, c in m5[host.GlobalId])))
            bare = [g for g, c in m5[host.GlobalId] if not c or c < 2]
            if bare: why.append('uncut-body-carries-opening:%d/%d' % (len(bare), len(m5[host.GlobalId])))
            baked = len(hc[1]) != len(hu[1])
            if not baked: why.append('no-bake')
            if len(hc[1]) == 0: why.append('host-fully-consumed')
            if np.abs(np.r_[hc[0].min(0) - hu[0].min(0), hc[0].max(0) - hu[0].max(0)]).max() > TOL: why.append('bake-changes-aabb')
            # the shipped mesh frame (extractIFCtoDB.py: world = center + R(rotation_z)·local, the fold's own inverse):
            # local = R(−rz)·(world − center), with center/rz read from the SHIPPED element_transforms row — never re-derived
            t = tx.get(host.GlobalId)
            bh = hashes.get(host.GlobalId)
            row = geo.execute('SELECT vertices, length(faces)/12 FROM component_geometries WHERE geometry_hash=?', (bh,)).fetchone() if bh else None
            if t is None or row is None:
                why.append('no-shipped-mesh')
            else:
                cx, cy, cz, _, _, _, rz = t; rz = rz or 0.0
                hv_local = in_frame(hu[0] - np.array([cx, cy, cz]), rz)
                sv = np.frombuffer(row[0], dtype=np.float32).reshape(-1, 3).astype(float)
                d = np.abs(np.r_[sv.min(0) - hv_local.min(0), sv.max(0) - hv_local.max(0)]).max()
                if d > TOL: why.append('frame-mismatch:%.4fm' % d)
                shipped_tris = row[1]
        ok = not why
        if ok:
            vblob = hv_local.astype(np.float32).tobytes()
            fblob = hu[1].astype(np.int32).tobytes()
            uh = hashlib.sha256(vblob + fblob).hexdigest()[:16]
            omn_w, omx_w = o[0].min(0), o[0].max(0)              # world AABB of the box opening (axis-aligned in world for yaw-only walls: yaw ∈ {0, ±90°} on SampleHouse; asserted below)
            # the world box must be the SAME box as the host-frame one (rotate back): only then is a world-axis void honest
            back = in_frame(np.array([omn, omx]), -yaw)
            if np.abs(np.sort(back, 0) - np.array([omn_w, omx_w])).max() > TOL:
                why.append('opening-box-not-world-axis-aligned(yaw=%.3f)' % yaw); ok = False
        if ok:
            hosts_sql.append("INSERT OR IGNORE INTO slide_hosts (host_guid,geometry_hash,vertices,faces,vertex_count,face_count,baked_hash,provenance) VALUES (%s,%s,X'%s',X'%s',%d,%d,%s,'ifc:uncut-body');" % (
                q(host.GlobalId), q(uh), vblob.hex(), fblob.hex(), len(hu[0]), len(hu[1]), q(bh)))
            openings_sql.append("INSERT OR IGNORE INTO slide_openings (opening_guid,host_guid,filling_guid,x0,y0,z0,x1,y1,z1,provenance) VALUES (%s,%s,%s,%.6f,%.6f,%.6f,%.6f,%.6f,%.6f,'ifc:opening-box');" % (
                q(op.GlobalId), q(host.GlobalId), q(fill.GlobalId), omn_w[0], omn_w[1], omn_w[2], omx_w[0], omx_w[1], omx_w[2]))
            stats['slideable'] += 1
            print('§SLIDE-PATCH bldg=%s host=%s(%s) opening=%s filling=%s uncutTris=%d bakedTris=%d shippedTris=%s uncutHash=%s bakedHash=%s box=[%.3f,%.3f,%.3f]-[%.3f,%.3f,%.3f] OK' % (
                a.bldg, host.GlobalId, host.is_a(), op.GlobalId, fill.GlobalId, len(hu[1]), len(hc[1]), shipped_tris, uh, bh, *omn_w, *omx_w))
        else:
            for w in why: reasons[w.split(':')[0]] = reasons.get(w.split(':')[0], 0) + 1
            print('§SLIDE-PATCH bldg=%s host=%s opening=%s REFUSE:%s' % (a.bldg, host.GlobalId, op.GlobalId, ','.join(why)))
    print('§SLIDE-PATCH-SUMMARY bldg=%s fills=%d slideable=%d refused=%s hosts=%d openings=%d' % (
        a.bldg, stats['fills'], stats['slideable'], reasons or '{}', len({h for h in hosts_sql}), len(openings_sql)))
    hdr = [
        '',
        '-- %s §SLIDE-REAL-WALLS Phase B — uncut host bodies + opening boxes for the SLIDEABLE authored openings.' % (a.bldg + '_ARC.db'),
        '-- Self-heal patch section. Generated by scripts/gen_slide_host_patch.py (bim-compiler) — regenerate, do not hand-edit.',
        '-- Source: %s   Generated: %s   Rules: Phase M (M1 box opening, M2/M3 bake == opening subtraction, M4 through-wall, M5 uncut body solid at every opening).' % (a.ifc.split('/')[-1], datetime.date.today().isoformat()),
        '-- %d of %d fills slideable; refused (named, not emitted): %s' % (stats['slideable'], stats['fills'], reasons or 'none'),
        '-- slide_hosts.vertices/faces: the host body with IfcRelVoidsElement subtraction DISABLED, in the shipped mesh\'s',
        '-- own local frame (float32 xyz / int32 tri indices, world = center + R·local); geometry_hash = sha256[:16] of the',
        '-- blobs (extractIFCtoDB.py geometry_hash()). baked_hash = the shipped element_instances hash it replaces at seed time.',
        '-- slide_openings: the opening\'s own solid as a WORLD axis-aligned box = the GEOM_CUT `void` (c1=x0,y0,z0 c2=x1,y1,z1).',
        'CREATE TABLE IF NOT EXISTS slide_hosts (host_guid TEXT PRIMARY KEY, geometry_hash TEXT, vertices BLOB, faces BLOB, vertex_count INTEGER, face_count INTEGER, baked_hash TEXT, provenance TEXT);',
        'CREATE TABLE IF NOT EXISTS slide_openings (opening_guid TEXT PRIMARY KEY, host_guid TEXT, filling_guid TEXT, x0 REAL, y0 REAL, z0 REAL, x1 REAL, y1 REAL, z1 REAL, provenance TEXT);',
    ]
    # one row per host (a host with 2 openings is emitted once — INSERT OR IGNORE keeps the first; identical bodies anyway)
    seen, uniq = set(), []
    for s in hosts_sql:
        k = s.split('VALUES (')[1].split(',')[0]
        if k in seen: continue
        seen.add(k); uniq.append(s)
    body = '\n'.join(hdr + uniq + openings_sql) + '\n'
    with open(a.out, 'a' if a.append else 'w') as fh:
        fh.write(body)
    print('§SLIDE-PATCH-WRITTEN %s hosts=%d openings=%d bytes=%d' % (a.out, len(uniq), len(openings_sql), len(body)))
    return 0 if stats['slideable'] else 1


if __name__ == '__main__':
    sys.exit(main())
