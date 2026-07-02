#!/usr/bin/env python3
"""
W-GEOMAP-RUNG1 — prompts/RESUME_IFC_BOM_GEOMAPPING.md §RUNG1-SPEC: relational
room recovery from IfcRelSpaceBoundary, measured on the SAME 21-room
ground-truth Duplex standard as W-GEOMAP-TIER3 (identical GT loader + scorer).

ISSUES PROVED:
  R1 RECALL       rung-1 IoU>=0.5 recall is MEASURED + reported; specifically
                  it must recover topology's 8 open-plan misses (the whole
                  point of a relational rung) — report exactly which.
  R2 COMBINED     best-of(topology, rung-1) per space is the headline number
                  vs topology's 13/21 — measured, never assumed 21/21.
  R3 CITATIONS    every recovered polygon cites >=1 real IfcRelSpaceBoundary
                  GlobalId that exists in the source IFC; zero uncited rooms.
  R4 DETERMINISM  re-run -> byte-equivalent artifact (same discipline as every
                  other geomap artifact).
  R5 HONEST-REFUSE refused spaces are listed with a reason, never emitted as a
                  guessed polygon (recovered+refused == total spaces).
  R6 BLIND        the tool never reads IfcSpace shape representations —
                  grep-asserted (no create_shape/Representation on spaces).
Exit 0 only if every assertion holds. Read the §-log, not the exit code alone.
"""
import json
import os
import subprocess
import sys

from shapely.geometry import Polygon, box

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
sys.path.insert(0, os.path.join(ROOT, "scripts"))

from witness_geomap_tier3 import load_gt, iou  # noqa: E402 — the SAME harness

IOU_T = 0.5
ART = os.path.join(ROOT, "geomap", "rooms_boundaries_DX.json")
TOPO = os.path.join(ROOT, "geomap", "rooms_topology_DX.json")

# Topology's shipped misses (W-GEOMAP-TIER3, 2026-07-02) — the 8 rung-1 exists to close.
TOPO_IOU_MISSES = {
    "A101 Foyer", "A102 Living Room", "A103 Kitchen", "A105 Stair",
    "B101 Foyer", "B102 Living Room", "B103 Kitchen", "B105 Room",
}

fails = 0


def check(name, cond, detail=""):
    global fails
    if not cond:
        fails += 1
    print(f"§W-GEOMAP-RUNG1 {'PASS' if cond else 'FAIL'}: {name} {detail}")


def main():
    gt = load_gt()
    check("ground truth = 21 spaces", len(gt) == 21, f"({len(gt)})")

    # R4 determinism: regenerate and compare bytes
    before = open(ART, "rb").read() if os.path.exists(ART) else None
    subprocess.run([sys.executable, os.path.join(ROOT, "tools", "rooms_from_boundaries.py"), "DX"],
                   check=True, cwd=ROOT)
    after = open(ART, "rb").read()
    check("R4 re-run byte-equivalent to shipped artifact",
          before is None or before == after)

    art = json.loads(after)
    spaces, refused = art["spaces"], art["refused"]

    # R5 honest accounting
    check("R5 recovered+refused == 21, refusals carry reasons",
          len(spaces) + len(refused) == 21 and all(refused.values()),
          f"(recovered={len(spaces)} refused={len(refused)})")

    # R1 recall — GT guid → polygon (rung-1 keys by the space's own GlobalId: exact join, no matching heuristic)
    hits, miss = [], []
    per_gt_iou = {}
    for gguid, name, storey, mn, mx in gt:
        ent = spaces.get(gguid)
        if not ent:
            miss.append(name)
            continue
        p = Polygon(ent["polygon"])
        if not p.is_valid:
            p = p.buffer(0)
        v = iou(p, box(mn[0], mn[1], mx[0], mx[1]))
        per_gt_iou[name] = round(v, 3)
        (hits if v >= IOU_T else miss).append(name)
    print(f"§W-GEOMAP-RUNG1 per-space IoU: {json.dumps(per_gt_iou, sort_keys=True)}")
    check(f"R1 rung-1 IoU recall MEASURED: {len(hits)}/21", True, f"(misses: {sorted(miss)})")
    closed = TOPO_IOU_MISSES & set(hits)
    check("R1 closes topology's open-plan misses (>=1, report exact set)",
          len(closed) >= 1,
          f"(closed {len(closed)}/8: {sorted(closed)}; not closed: {sorted(TOPO_IOU_MISSES - set(hits))})")

    # R2 combined headline: best-of(topology's matched set, rung-1 hits)
    topo = json.loads(open(TOPO, "rb").read())
    topo_matched = set()
    for gguid, name, storey, mn, mx in gt:
        gtb = box(mn[0], mn[1], mx[0], mx[1])
        for r in topo["storeys"].get(storey, {}).get("rooms", []):
            # same lossless validity repair as witness_geomap_tier3 (4-dp rounding can self-touch a ring)
            p = Polygon(r["polygon_xy"])
            if not p.is_valid:
                p = p.buffer(0)
            if iou(p, gtb) >= IOU_T:
                topo_matched.add(name)
                break
    combined = topo_matched | set(hits)
    check(f"R2 combined best-of recall MEASURED: {len(combined)}/21 (topology alone {len(topo_matched)}/21)",
          len(combined) > len(topo_matched),
          f"(still missing: {sorted(set(n for _, n, *_ in gt) - combined)})")

    # R3 citations: every room cites >=1 rel GlobalId present in the source IFC
    import ifcopenshell
    f = ifcopenshell.open(os.path.join(ROOT, art["src"]))
    real_rels = {r.GlobalId for r in f.by_type("IfcRelSpaceBoundary")}
    uncited = [e["name"] for e in spaces.values() if not e["cites"]]
    fake = sorted({c for e in spaces.values() for c in e["cites"]} - real_rels)
    check("R3 every room cites >=1 rel; every cite is a REAL IfcRelSpaceBoundary GlobalId",
          not uncited and not fake, f"(uncited={uncited} fake={fake})")

    # R6 blind to the answer: the tool must never read IfcSpace shapes
    src = open(os.path.join(ROOT, "tools", "rooms_from_boundaries.py")).read()
    check("R6 tool is BLIND to IfcSpace shape (no create_shape / .Representation)",
          "create_shape" not in src and ".Representation" not in src)

    print(f"§W-GEOMAP-RUNG1 RESULT: {'RED' if fails else 'GREEN'} ({fails} fail)")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
