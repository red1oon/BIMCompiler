#!/usr/bin/env python3
"""
Tier-3 room recovery from wall topology — prompts/RESUME_IFC_BOM_GEOMAPPING.md
§TIER-3-FABLE5. Witness: W-GEOMAP-TIER3 (scripts/witness_geomap_tier3.py — the
measured recall/precision numbers live THERE, against the 21-room ground-truth
Duplex standard; this tool is BLIND to IfcSpace and stores no accuracy claim).

Method (deterministic, every closure cites a real relation):
  1. Element footprints: exact XY projection of each wall/curtain-wall/column
     mesh (extracted DB world frame; triangles unioned — no centerline
     abstraction, no rectangle approximation).
  2. R21 doorway closures: for every mined rel `fills_host` (IfcRelVoidsElement
     + IfcRelFillsElement), close the host's opening with the filling element's
     real width along the host axis x host thickness. Doors/windows CLOSE a
     room boundary; open archways (no filling element) honestly stay open.
  3. Wall-connects bridges: for every mined IfcRelConnectsPathElements edge
     whose two footprints have a real gap 0 < d < 0.3 m (extraction tolerance),
     bridge at the nearest points. The relation asserts contact — the bridge
     just realizes it; pairs with no relation are NEVER bridged (non-invent).
  4. Section cut per storey (sidecar `storeys` elevations): walls whose real
     Z-interval straddles elevation+1.30 m (standard plan cut); fallback
     elevation+0.30 m when no wall reaches the primary cut (parapet-only
     storeys, e.g. DX Roof) — fallback use is logged per storey.
  5. Rooms = interior holes of the union, >= 1.0 m^2 (GT includes a 1.4 m^2
     utility; below that is wall cavity).

Known structural ceiling (measured on DX, not a bug): spaces separated only by
VIRTUAL space boundaries / open archways (open-plan living<->kitchen<->foyer)
cannot be recovered from physical walls by ANY method — that separation exists
only as declared IfcSpace/IfcRelSpaceBoundary data (mined in the relation
sidecar; Rung-1 relational recovery covers those).

Output: geomap/rooms_topology_<TAG>.json (deterministic; rooms + full closure/
bridge provenance + honest refusals).
Usage: python3 tools/rooms_from_topology.py DX
Read the §-log after every run.
"""
import json
import os
import sqlite3
import sys

import numpy as np
from shapely.geometry import Polygon, MultiPolygon, LineString
from shapely.ops import unary_union, nearest_points

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mine_geomap import MANIFEST, OUT_DIR, _md5  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MIN_AREA = 1.0        # m^2
CUT_PRIMARY = 1.30    # m above storey elevation
CUT_FALLBACK = 0.30   # m — parapet-only storeys
BRIDGE_MAX = 0.30     # m — relation-asserted contact gap ceiling
ENCLOSING = ("IfcWall", "IfcCurtainWall", "IfcColumn")
FILLING = ("IfcDoor", "IfcWindow")


def load_elements(db_path):
    """World-frame XY footprints + Z-ranges + PCA axis for every enclosing/filling element."""
    c = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    meta = {g: cls for g, cls in c.execute("SELECT guid, ifc_class FROM elements_meta")
            if cls.startswith(ENCLOSING + FILLING)}
    h_of = dict(c.execute("SELECT guid, geometry_hash FROM element_instances"))
    ctr = {g: (x, y, z) for g, x, y, z in c.execute(
        "SELECT guid, center_x, center_y, center_z FROM element_transforms")}
    mesh, tri = {}, {}
    for h, vb, fb in c.execute("SELECT geometry_hash, vertices, faces FROM component_geometries"):
        mesh[h] = np.frombuffer(vb, dtype=np.float32).reshape(-1, 3)
        tri[h] = np.frombuffer(fb, dtype=np.int32).reshape(-1, 3)
    c.close()
    els, no_mesh = {}, []
    for g in sorted(meta):
        h = h_of.get(g)
        if h not in mesh or g not in ctr:
            no_mesh.append(g)
            continue
        v = mesh[h].astype(np.float64) + np.array(ctr[g])
        polys = []
        for a, b, cc in tri[h]:
            p = Polygon([v[a][:2], v[b][:2], v[cc][:2]])
            if p.is_valid and p.area > 1e-9:
                polys.append(p)
        if not polys:
            no_mesh.append(g)
            continue
        xy = v[:, :2]
        cen = xy.mean(axis=0)
        d = xy - cen
        _, vec = np.linalg.eigh(d.T @ d / len(xy))
        els[g] = {"cls": meta[g], "fp": unary_union(polys),
                  "zmin": float(v[:, 2].min()), "zmax": float(v[:, 2].max()),
                  "cen": cen, "axis": vec[:, 1],
                  "long": float((d @ vec[:, 1]).max() - (d @ vec[:, 1]).min()),
                  "thick": float((d @ vec[:, 0]).max() - (d @ vec[:, 0]).min())}
    return els, no_mesh


def r21_closures(els, sidecar):
    """One rect per fills_host relation: filling width along host axis x host thickness."""
    rects, cites = [], []
    fills = {g: e["fills_host"] for g, e in sidecar["elements"].items() if "fills_host" in e}
    for filling, host in sorted(fills.items()):
        if filling not in els or host not in els:
            continue
        F, H = els[filling], els[host]
        ax, cen = H["axis"], H["cen"]
        c = cen + ax * float((F["cen"] - cen) @ ax)
        hw = max(F["long"], F["thick"]) / 2
        ht = max(H["thick"], 0.05) / 2
        n = np.array([-ax[1], ax[0]])
        rects.append(Polygon([tuple(c - ax*hw - n*ht), tuple(c + ax*hw - n*ht),
                              tuple(c + ax*hw + n*ht), tuple(c - ax*hw + n*ht)]))
        cites.append({"filling": filling, "host": host, "via": "IfcRelFillsElement(R21)"})
    return rects, cites


def connect_bridges(els, sidecar):
    """Bridge real gaps (< BRIDGE_MAX) between relation-connected wall pairs."""
    rects, cites = [], []
    for e in sidecar["wall_connects"]:
        a, b = e["a"], e["b"]
        if a not in els or b not in els:
            continue
        d = els[a]["fp"].distance(els[b]["fp"])
        if 0 < d < BRIDGE_MAX:
            pa, pb = nearest_points(els[a]["fp"], els[b]["fp"])
            rects.append(LineString([pa, pb]).buffer(max(d, 0.08), cap_style=2))
            cites.append({"a": a, "b": b, "gap_m": round(d, 3),
                          "via": "IfcRelConnectsPathElements"})
    return rects, cites


def rooms_at(els, closures, h):
    fps = [e["fp"] for e in els.values()
           if e["cls"].startswith(ENCLOSING) and e["zmin"] <= h <= e["zmax"]]
    if not fps:
        return [], 0
    u = unary_union(fps + closures)
    if u.geom_type == "GeometryCollection":
        u = unary_union([g for g in u.geoms if g.geom_type in ("Polygon", "MultiPolygon")])
    polys = list(u.geoms) if isinstance(u, MultiPolygon) else [u]
    rooms = []
    for p in polys:
        if p.geom_type != "Polygon":
            continue
        for ring in p.interiors:
            r = Polygon(ring)
            if r.area >= MIN_AREA:
                rooms.append(r)
    rooms.sort(key=lambda r: (round(r.area, 6), r.bounds))
    return rooms, len(fps)


def recover(tag):
    cfg = MANIFEST[tag]
    db_path = os.path.join(ROOT, cfg["db"])
    side = json.load(open(os.path.join(OUT_DIR, f"relations_{tag}.json")))
    els, no_mesh = load_elements(db_path)
    cl_rects, cl_cites = r21_closures(els, side)
    br_rects, br_cites = connect_bridges(els, side)
    closures = cl_rects + br_rects
    print(f"§TOPO {tag}: elements={len(els)} no-mesh={len(no_mesh)} "
          f"r21-closures={len(cl_cites)} connects-bridges={len(br_cites)}")
    out = {"building": tag, "db": cfg["db"], "db_md5": _md5(db_path),
           "frame": cfg["db_frame"], "method_constants": {
               "min_area_m2": MIN_AREA, "cut_primary_m": CUT_PRIMARY,
               "cut_fallback_m": CUT_FALLBACK, "bridge_max_m": BRIDGE_MAX},
           "closures": cl_cites, "bridges": br_cites,
           "refusals": {"elements_without_mesh": sorted(no_mesh)},
           "storeys": {}}
    # cut plane capped below the NEXT storey's elevation, else a low storey's cut
    # slices the storey above it (observed: DX T/FDN at -1.25 + 1.3 cut L1 walls)
    elevs = sorted(v["elevation"] for v in side.get("storeys", {}).values()
                   if v.get("elevation") is not None)
    for name in sorted(side.get("storeys", {})):
        elev = side["storeys"][name].get("elevation")
        if elev is None:
            out["storeys"][name] = {"refused": "no IfcBuildingStorey.Elevation in source"}
            print(f"§CUT {tag}/{name!r}: REFUSED (no elevation)")
            continue
        nxt = [e for e in elevs if e > elev + 1e-6]
        offset = min(CUT_PRIMARY, (nxt[0] - elev) / 2) if nxt else CUT_PRIMARY
        cut, fallback = elev + offset, False
        rooms, nsel = rooms_at(els, closures, cut)
        if nsel == 0:
            cut, fallback = elev + CUT_FALLBACK, True
            rooms, nsel = rooms_at(els, closures, cut)
        out["storeys"][name] = {
            "elevation": elev, "cut_z": round(cut, 3), "fallback_cut": fallback,
            "walls_in_cut": nsel,
            "rooms": [{"area_m2": round(r.area, 2),
                       "polygon_xy": [[round(x, 4), round(y, 4)]
                                      for x, y in r.exterior.coords]}
                      for r in rooms]}
        print(f"§CUT {tag}/{name!r} z={cut:.2f}{' (fallback)' if fallback else ''}: "
              f"walls={nsel} rooms={len(rooms)} areas={[round(r.area,1) for r in rooms]}")
    path = os.path.join(OUT_DIR, f"rooms_topology_{tag}.json")
    with open(path, "w") as f:
        json.dump(out, f, indent=1, sort_keys=True)
    print(f"§WRITE {path} ({os.path.getsize(path)/1024:.0f} KB)")
    return out


if __name__ == "__main__":
    tags = [t for t in sys.argv[1:] if t in MANIFEST] or ["DX"]
    for tag in tags:
        if not MANIFEST[tag]["ifcs"]:
            print(f"§TOPO {tag}: REFUSED — no relation sidecar (no source IFC)")
            continue
        recover(tag)
