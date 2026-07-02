#!/usr/bin/env python3
"""
Alias-map miner — prompts/RESUME_IFC_BOM_GEOMAPPING.md §ALIAS-SPEC (item 6, the
lane-concluding piece per the user scope decision 2026-07-02).
Witness: W-GEOMAP-ALIAS (scripts/witness_geomap_alias.py).

Mines the observed `type_class -> element ifc_class` distribution from EVERY
onboarded building (sidecar type relations joined to the db's ifc_class) into
geomap/alias_map.json. This is the GRAPH-CONTEXT alias source: an element with
a useless/proxy ifc_class (IfcBuildingElementProxy overuse, generic
IfcDistributionElement) but a REAL IfcRelDefinesByType relation gets its class
INFUSED from the mined map — cited, measured, never geometry-guessed.

Measured-in-artifact (per this spec's PRIME DIRECTIVE):
  - resubstitution recovery: hide every typed element's ifc_class, predict from
    its type_class via the full map (upper bound; map saw the element).
  - LOBO recovery: same, but the map is mined WITHOUT that element's building
    (the honest incoming-building number — type_class names are IFC-schema
    classes, so unlike bbox bands (F3) they CAN transfer; measured, not assumed).
  - ambiguity: a type_class mapping to >1 element class is flagged ambiguous
    and carries the full candidate distribution — never a silently-picked winner.

Usage: python3 tools/mine_alias_map.py            (all MANIFEST buildings)
Read the §-log after every run.
"""
import json
import os
import re
import sqlite3
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mine_geomap import MANIFEST, OUT_DIR  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def typed_pairs(tag):
    """[(type_class, element ifc_class)] for one building — sidecar relation x db class."""
    side_path = os.path.join(OUT_DIR, f"relations_{tag}.json")
    if not os.path.exists(side_path):
        return []
    side = json.load(open(side_path))
    rx = re.compile(side["guid_strip"]) if side.get("guid_strip") else None
    cfg = MANIFEST[tag]
    c = sqlite3.connect(f"file:{os.path.join(ROOT, cfg['db'])}?mode=ro", uri=True)
    cls_of = {}
    for g, cls in c.execute("SELECT guid, ifc_class FROM elements_meta"):
        cls_of[rx.sub("", g) if rx else g] = cls
    c.close()
    pairs = []
    for g, e in side["elements"].items():
        tc = e.get("type_class")
        cls = cls_of.get(g)
        if tc and cls:
            pairs.append((tc, cls))
    return pairs


def build_map(pairs):
    """type_class -> {classes: {cls: n}, winner, ambiguous}."""
    m = {}
    for tc, cls in pairs:
        m.setdefault(tc, {}).setdefault(cls, 0)
        m[tc][cls] += 1
    out = {}
    for tc in sorted(m):
        dist = m[tc]
        winner = max(sorted(dist), key=lambda k: dist[k])
        out[tc] = {"classes": dict(sorted(dist.items())),
                   "winner": winner,
                   "ambiguous": len(dist) > 1,
                   "n": sum(dist.values())}
    return out


def recovery(pairs, amap):
    """(winner-hit, set-hit, n): top-1 via the map's winner, and membership in the full
    candidate set (the honest output for ambiguous entries IS the set, per A3)."""
    n = hit = shit = 0
    for tc, cls in pairs:
        row = amap.get(tc)
        if not row:
            continue
        n += 1
        if row["winner"] == cls:
            hit += 1
        if cls in row["classes"]:
            shit += 1
    return hit, shit, n


def main():
    tags = [t for t in MANIFEST if os.path.exists(os.path.join(OUT_DIR, f"relations_{t}.json"))]
    per = {t: typed_pairs(t) for t in tags}
    allp = [p for t in tags for p in per[t]]
    amap = build_map(allp)
    n_amb = sum(1 for v in amap.values() if v["ambiguous"])
    print(f"§ALIAS mined {len(amap)} type_class entries from {len(allp)} typed elements "
          f"across {len(tags)} buildings ({n_amb} ambiguous)")

    measured = {}
    for t in tags:
        rh, rs, rn = recovery(per[t], amap)
        lobo_map = build_map([p for u in tags if u != t for p in per[u]])
        lh, ls, ln = recovery(per[t], lobo_map)
        measured[t] = {"resub": {"winner": rh, "in_set": rs, "n": rn},
                       "lobo": {"winner": lh, "in_set": ls, "n": ln}}
        print(f"§ALIAS {t}: resub winner {rh}/{rn} ({100.0*rh/max(rn,1):.1f}%) set {rs}/{rn} "
              f"({100.0*rs/max(rn,1):.1f}%) | LOBO winner {lh}/{ln} ({100.0*lh/max(ln,1):.1f}%) "
              f"set {ls}/{ln} ({100.0*ls/max(ln,1):.1f}%)")

    out = {"map": amap, "measured": measured,
           "buildings": {t: len(per[t]) for t in tags},
           "method": "type_class->ifc_class observed distribution; winner=max count (ties alphabetical); "
                     "ambiguous entries carry the full candidate set — consumers must not present the "
                     "winner as certain when ambiguous=true"}
    dst = os.path.join(OUT_DIR, "alias_map.json")
    with open(dst, "w") as fh:
        json.dump(out, fh, indent=1, sort_keys=True)
        fh.write("\n")
    print(f"§WRITE {dst} ({os.path.getsize(dst)//1024} KB)")


if __name__ == "__main__":
    main()
