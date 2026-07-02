#!/usr/bin/env python3
"""
Geomapping calibration miner — Phase A: relation sidecars. Phase B: per-building
dimension bands with MEASURED accuracy.

Implementing prompts/RESUME_IFC_BOM_GEOMAPPING.md §DELIVERABLE (calibration/mining
tool) — Witnesses: W-GEOMAP-TIER1 (sidecar vs elements_meta ground truth),
W-GEOMAP-TIER2 (bands carry their measured split-half accuracy),
W-GEOMAP-NONINVENT (absent relation -> absent key, never fabricated).

Tier-2 design is the MEASURED winner of Step 2.3 (spike4.log, 2026-07-02):
per-building-class bands, split-half top-1 81.4% overall / own-class in-band
93-96%; cross-building pooling measured-dead (8-17% in every variant) and is
therefore not offered — bands are keyed building-first, and classify across
buildings must honest-refuse.

Mines REAL IFC relationships from the source .ifc files (internal/sources/,
internal/UNMERGED/) into git-tracked JSON sidecars keyed by element GUID —
joinable 1:1 against the shipped deploy/buildings/*_extracted.db (GUID join
measured 100%: SH 60/60, SC 3621/3621, DX 1122/1122 via ARC+MEP pair; see
prompts/poc_geomapping/spike3.log). The shipped geometry DBs are NEVER touched
(re-extraction corrupted SC once before — PR #543).

Non-invent: every record cites the IFC relation instance it came from. An
element with no relation gets NO entry (honest absence, not a guess).

Output: geomap/relations_<TAG>.json  (deterministic: sorted keys,
source-file md5 stamped, no timestamps — auditable diff on re-mine).

Usage:
  python3 tools/mine_geomap.py            # mine all buildings in MANIFEST
  python3 tools/mine_geomap.py SH DX      # subset
Read the §-log after every run.
"""
import hashlib
import json
import os
import sqlite3
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract import normalize_storey, get_storey_for_element  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Frame semantics per F5 (prompts/RESUME_IFC_BOM_GEOMAPPING.md §POC-FINDINGS):
# SH/DX/SC corpus DBs: rotation cols hardcoded 0, bbox = world-frame AABB.
MANIFEST = {
    "SH": {
        "ifcs": ["internal/sources/Ifc4_SampleHouse.ifc"],
        "db": "deploy/buildings/SampleHouse_extracted.db",
        "db_frame": {"frame": "world-zup", "units": "m", "rotation_semantics": "none-baked-into-mesh"},
    },
    "DX": {
        "ifcs": ["internal/sources/Ifc2x3_Duplex_Architecture.ifc",
                 "internal/UNMERGED/Ifc2x3_Duplex_MEP.ifc"],
        "db": "deploy/buildings/Duplex_extracted.db",
        "db_frame": {"frame": "world-zup", "units": "m", "rotation_semantics": "none-baked-into-mesh"},
    },
    "SC": {
        "ifcs": ["internal/sources/Ifc2x3_SampleCastle.ifc"],
        "db": "deploy/buildings/SampleCastle_extracted.db",
        "db_frame": {"frame": "world-zup", "units": "m", "rotation_semantics": "none-baked-into-mesh"},
    },
    # Clinic + Hospital (§NEXT-SESSION-TASKS item 4, onboarded 2026-07-02 via the SOP):
    # real extracted DBs + real source IFCs already in-repo. GUID-join sampled 12/12 each
    # before adding (F11 lesson: verify, don't assume); coverage() measures the full join.
    # Frame: rotation cols measured all-zero + bbox all-positive on both DBs -> same
    # world-baked semantics as SH/DX/SC. Hospital db guids join BOTH the IFC2x3 and IFC4
    # sets (same model exported twice, sampled 12/12 in each) — the IFC4 set is mined.
    "CL": {
        "ifcs": ["internal/UNMERGED/Clinic_Architectural_IFC2x3.ifc",
                 "internal/UNMERGED/Clinic_Structural_IFC2x3.ifc",
                 "internal/UNMERGED/Clinic_Electrical_IFC2x3.ifc",
                 "internal/UNMERGED/Clinic_HVAC_IFC2x3.ifc",
                 "internal/UNMERGED/Clinic_Plumbing_IFC2x3.ifc"],
        "db": "deploy/buildings/Clinic_extracted.db",
        "db_frame": {"frame": "world-zup", "units": "m", "rotation_semantics": "none-baked-into-mesh"},
    },
    "HO": {
        "ifcs": ["internal/UNMERGED/Hospital_IFC4_ARC.ifc",
                 "internal/UNMERGED/Hospital_IFC4_STR.ifc",
                 "internal/UNMERGED/Hospital_IFC4_ELE.ifc",
                 "internal/UNMERGED/Hospital_IFC4_MECH.ifc",
                 "internal/UNMERGED/Hospital_IFC4_PLB.ifc",
                 "internal/UNMERGED/Hospital_IFC4_FIRE.ifc",
                 "internal/UNMERGED/Hospital_IFC4_SPR.ifc"],
        "db": "deploy/buildings/Hospital_extracted.db",
        "db_frame": {"frame": "world-zup", "units": "m", "rotation_semantics": "none-baked-into-mesh"},
    },
    # HHS Office (user scope decision 2026-07-02: part of the "home dry" working corpus).
    # SOURCE UPGRADE 2026-07-02 (RESUME_IFC_BOM_GEOMAPPING.md §ALIAS-SPEC note): the 6
    # opensourceBIM_HHS_Office_* files union to 100.0% GUID join (6,871/6,871) against
    # HHS_Office_Federated_extracted.db, verified against the FULL corpus (not a sample) —
    # a strictly better ground-truth source than Ifc4_Revit_MEP.ifc alone (was 69.0%,
    # 4,743/6,871). Old file kept in the union per its own note ("doesn't hurt").
    "HHS": {
        "ifcs": ["internal/UNMERGED/opensourceBIM_HHS_Office_architect.ifc",
                 "internal/UNMERGED/opensourceBIM_HHS_Office_architect2.ifc",
                 "internal/UNMERGED/opensourceBIM_HHS_Office_construction.ifc",
                 "internal/UNMERGED/opensourceBIM_HHS_Office_construction2.ifc",
                 "internal/UNMERGED/opensourceBIM_HHS_Office_MEP.ifc",
                 "internal/UNMERGED/opensourceBIM_HHS_Office_MEP2.ifc",
                 "internal/UNMERGED/Ifc4_Revit_MEP.ifc"],
        "db": "deploy/buildings/HHS_Office_Federated_extracted.db",
        "db_frame": {"frame": "world-zup", "units": "m", "rotation_semantics": "none-baked-into-mesh"},
    },
    # Terminal — F11 CORRECTION (2026-07-02): the real source IFC EXISTS at
    # internal/UNMERGED/merged_federation.ifc (215MB IFC4, federates the 8 SJTII discipline
    # files; GUID-joinable 200/200 sampled). The old "no source IFC in this repo" comment here
    # was WRONG (conflated with F4's separate geometry-hash unjoinability, which still holds:
    # bands come from element_transforms bbox cols, not meshes). guid_strip: the extractor
    # prefixed db guids with a discipline index (T{n}_Terminal_<GlobalId>) — strip to join
    # the sidecar's real IFC GlobalIds.
    "Terminal": {
        "ifcs": ["internal/UNMERGED/merged_federation.ifc"],
        "db": "deploy/buildings/Terminal_extracted.db",
        "guid_strip": r"^T\d+_Terminal_",
        "db_frame": {"frame": "bbox-cols-frame-UNVERIFIED", "units": "m",
                     "rotation_semantics": "euler-radians-xyz"},
    },
}

OUT_DIR = os.path.join(ROOT, "geomap")


def _md5(path):
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _gid(entity):
    try:
        return entity.GlobalId
    except AttributeError:
        return None


def mine_ifc(ifc_path, sidecar):
    """Walk one IFC's relationship instances into the sidecar dict. Additive."""
    import ifcopenshell
    f = ifcopenshell.open(ifc_path)
    src = os.path.relpath(ifc_path, ROOT)
    el = sidecar["elements"]

    def entry(guid):
        return el.setdefault(guid, {})

    n = {"storey": 0, "space": 0, "type": 0, "fills": 0, "agg": 0,
         "sb": 0, "conn": 0}

    # Storeys with elevation — needed by rooms_from_topology's section cut.
    for st in f.by_type("IfcBuildingStorey"):
        sidecar["storeys"][st.Name] = {
            "guid": st.GlobalId,
            "elevation": float(st.Elevation) if st.Elevation is not None else None,
            "src": src,
        }

    # Spaces (with their storey) — targets for containment + boundaries
    for sp in f.by_type("IfcSpace"):
        storey = None
        try:
            for rel in sp.Decomposes:
                if rel.RelatingObject.is_a("IfcBuildingStorey"):
                    storey = normalize_storey(rel.RelatingObject.Name)
                    break
        except (AttributeError, TypeError):
            pass
        sidecar["spaces"][sp.GlobalId] = {
            "name": sp.Name or getattr(sp, "LongName", None),
            "long_name": getattr(sp, "LongName", None),
            "storey": storey,
            "src": src,
        }

    # Containment: element -> storey (walk, same semantics as extract.py) and
    # element -> space (direct containment).
    for rel in f.by_type("IfcRelContainedInSpatialStructure"):
        container = rel.RelatingStructure
        for e in rel.RelatedElements:
            g = _gid(e)
            if not g:
                continue
            if container.is_a("IfcSpace"):
                entry(g)["space"] = container.GlobalId
                n["space"] += 1
            storey = get_storey_for_element(e)
            if storey and storey != "Unknown":
                entry(g)["storey"] = storey
                n["storey"] += 1

    # Type objects: element -> its IfcTypeObject name + class.
    for rel in f.by_type("IfcRelDefinesByType"):
        t = rel.RelatingType
        if not t:
            continue
        for e in rel.RelatedObjects:
            g = _gid(e)
            if not g:
                continue
            entry(g)["type_name"] = t.Name
            entry(g)["type_class"] = t.is_a()
            n["type"] += 1

    # R21 chain: opening -> host, then filling -> host.
    opening_to_host = {}
    for rel in f.by_type("IfcRelVoidsElement"):
        try:
            opening_to_host[rel.RelatedOpeningElement.GlobalId] = \
                rel.RelatingBuildingElement.GlobalId
        except (AttributeError, TypeError):
            pass
    for rel in f.by_type("IfcRelFillsElement"):
        try:
            host = opening_to_host.get(rel.RelatingOpeningElement.GlobalId)
            filling = rel.RelatedBuildingElement.GlobalId
            if host:
                entry(filling)["fills_host"] = host
                n["fills"] += 1
        except (AttributeError, TypeError):
            pass

    # R22: aggregates (assembly decomposition), element-level only.
    for rel in f.by_type("IfcRelAggregates"):
        try:
            parent = rel.RelatingObject
            if not parent.is_a("IfcElement") and not parent.is_a("IfcElementAssembly"):
                # skip spatial decomposition (project/site/building/storey)
                if not parent.is_a("IfcProduct") or parent.is_a("IfcSpatialStructureElement"):
                    continue
            pg = _gid(parent)
            if not pg:
                continue
            for child in rel.RelatedObjects:
                cg = _gid(child)
                if not cg:
                    continue
                entry(cg)["aggregates_parent"] = pg
                sidecar["aggregates"].append({"parent": pg, "child": cg, "src": src})
                n["agg"] += 1
        except (AttributeError, TypeError):
            pass

    # Space boundaries — THE room-relational signal (present in source,
    # never extracted before; see §POC-FINDINGS follow-up 2026-07-02).
    for rel in f.by_type("IfcRelSpaceBoundary"):
        try:
            sp = rel.RelatingSpace
            e = rel.RelatedBuildingElement
            if sp is None:
                continue
            sidecar["space_boundaries"].append({
                "space": sp.GlobalId,
                "element": _gid(e),  # None = virtual boundary with no element
                "physical": str(rel.PhysicalOrVirtualBoundary or ""),
                "internal": str(rel.InternalOrExternalBoundary or ""),
                "src": src,
            })
            n["sb"] += 1
        except (AttributeError, TypeError):
            pass

    # Wall connectivity (Tier-3 graph substrate).
    for rel in f.by_type("IfcRelConnectsPathElements"):
        try:
            a, b = rel.RelatingElement, rel.RelatedElement
            if a is None or b is None:
                continue
            sidecar["wall_connects"].append({
                "a": a.GlobalId, "b": b.GlobalId,
                "a_end": str(rel.RelatingConnectionType or ""),
                "b_end": str(rel.RelatedConnectionType or ""),
                "src": src,
            })
            n["conn"] += 1
        except (AttributeError, TypeError):
            pass

    sidecar["sources"].append({"file": src, "md5": _md5(ifc_path),
                               "schema": f.schema})
    print(f"  §MINE {src}: storey={n['storey']} space={n['space']} type={n['type']} "
          f"fills={n['fills']} agg={n['agg']} space_boundaries={n['sb']} wall_connects={n['conn']}")
    return n


def coverage(tag, cfg, sidecar):
    """§-log: what fraction of the SHIPPED corpus elements each signal covers.

    guid_strip (F11, Terminal): the extractor prefixed db guids (T{n}_Terminal_<GlobalId>);
    join on the stripped form. The sidecar stays keyed by the REAL IFC GlobalIds — consumers
    apply the same strip, recorded in the artifact as `guid_strip`."""
    import re
    db = os.path.join(ROOT, cfg["db"])
    c = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
    db_guids = {r[0] for r in c.execute("SELECT guid FROM elements_meta")}
    c.close()
    strip = cfg.get("guid_strip")
    if strip:
        rx = re.compile(strip)
        db_guids = {rx.sub("", g) for g in db_guids}
        sidecar["guid_strip"] = strip
    el = sidecar["elements"]
    hit = {k: 0 for k in ("storey", "space", "type_name", "fills_host", "aggregates_parent")}
    joined = 0
    for g in db_guids:
        e = el.get(g)
        if e is None:
            continue
        joined += 1
        for k in hit:
            if k in e:
                hit[k] += 1
    sb_elements = {b["element"] for b in sidecar["space_boundaries"] if b["element"]}
    sb_hit = len(db_guids & sb_elements)
    n = len(db_guids)
    print(f"§COVERAGE {tag}: corpus={n} sidecar-joined={joined} ({100.0*joined/n:.1f}%)")
    for k, v in hit.items():
        print(f"    {k:<18} {v:>5} ({100.0*v/n:.1f}%)")
    print(f"    space_boundary     {sb_hit:>5} ({100.0*sb_hit/n:.1f}%)  "
          f"[edges total={len(sidecar['space_boundaries'])}, spaces={len(sidecar['spaces'])}]")
    print(f"    wall_connects edges={len(sidecar['wall_connects'])}")
    return {"corpus": n, "joined": joined, "hits": hit, "space_boundary_elements": sb_hit}


# ---------------------------------------------------------------------------
# Phase B: per-building dimension bands (Tier 2) with measured accuracy
# ---------------------------------------------------------------------------

EPS = 1e-4  # 0.1mm floor for degenerate spans


def load_dims(tag, cfg):
    """Per-element sorted dims (metres) for one building, deterministic order.
    SH/DX/SC: world-AABB of the element's mesh. Terminal: bbox_x/y/z columns."""
    import numpy as np
    db = os.path.join(ROOT, cfg["db"])
    c = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
    rows = []
    if tag == "Terminal":
        for guid, cls, bx, by, bz in c.execute(
                "SELECT em.guid, em.ifc_class, t.bbox_x, t.bbox_y, t.bbox_z "
                "FROM elements_meta em JOIN element_transforms t ON em.guid=t.guid "
                "ORDER BY em.guid"):
            if not bx or by is None or bz is None:
                continue
            rows.append((guid, cls, sorted((abs(bx), abs(by), abs(bz)))))
    else:
        cls_of = dict(c.execute("SELECT guid, ifc_class FROM elements_meta"))
        hash_of = dict(c.execute("SELECT guid, geometry_hash FROM element_instances"))
        span = {}
        for h, blob in c.execute("SELECT geometry_hash, vertices FROM component_geometries"):
            v = np.frombuffer(blob, dtype=np.float32).reshape(-1, 3)
            if len(v) < 3:
                continue
            span[h] = sorted(float(x) for x in (v.max(axis=0) - v.min(axis=0)))
        for guid in sorted(cls_of):
            s = span.get(hash_of.get(guid))
            if s:
                rows.append((guid, cls_of[guid], s))
    c.close()
    return rows


def _log3(dims):
    import math
    return [math.log(max(d, EPS)) for d in dims]


def fit_bands(rows):
    """ifc_class -> band over log sorted dims: median, robust sigma, p2.5/p97.5 +0.10 pad."""
    import numpy as np
    by = {}
    for _, cls, dims in rows:
        by.setdefault(cls, []).append(_log3(dims))
    bands = {}
    for cls, arr in sorted(by.items()):
        if len(arr) < 3:
            continue  # honest-refuse below minimum support, never a 1-sample "band"
        a = np.array(arr)
        bands[cls] = {
            "count": len(arr),
            "med": [round(float(x), 6) for x in np.median(a, axis=0)],
            "sig": [round(float(max(x, 0.05)), 6) for x in
                    (np.percentile(a, 75, axis=0) - np.percentile(a, 25, axis=0)) / 1.349],
            "lo": [round(float(x - 0.10), 6) for x in np.percentile(a, 2.5, axis=0)],
            "hi": [round(float(x + 0.10), 6) for x in np.percentile(a, 97.5, axis=0)],
        }
    return bands


def rank_classes(bands, dims):
    """Deterministic robust-z ranking. Returns [(score, cls)] ascending."""
    lf = _log3(dims)
    scored = []
    for cls, b in bands.items():
        score = sum(abs(lf[i] - b["med"][i]) / b["sig"][i] for i in range(3))
        scored.append((round(score, 9), cls))
    scored.sort()
    return scored


def in_band(band, dims):
    lf = _log3(dims)
    return all(band["lo"][i] <= lf[i] <= band["hi"][i] for i in range(3))


def measure_split_half(rows):
    """The W-GEOMAP-TIER2 protocol: bands from even rows, evaluate odd rows."""
    train = [r for i, r in enumerate(rows) if i % 2 == 0]
    test = [r for i, r in enumerate(rows) if i % 2 == 1]
    bands = fit_bands(train)
    n = top1 = top3 = inb = 0
    for _, cls, dims in test:
        if cls not in bands:
            continue
        n += 1
        ranked = [c for _, c in rank_classes(bands, dims)]
        if ranked[0] == cls:
            top1 += 1
        if cls in ranked[:3]:
            top3 += 1
        if in_band(bands[cls], dims):
            inb += 1
    return {"protocol": "split-half even/odd by guid sort",
            "n": n, "top1": top1, "top3": top3, "own_class_in_band": inb}


def phase_b(tags):
    rules = {
        "version": 1,
        "feature": "sorted world-AABB dims (m), log-space bands",
        "ranking": "sum of |log(dim)-med|/sig over 3 sorted dims, ascending",
        "cross_building": "REFUSE — measured 8-17% top-1 in every pooled variant (spike4.log)",
        "buildings": {},
    }
    for tag in tags:
        cfg = MANIFEST[tag]
        rows = load_dims(tag, cfg)
        measured = measure_split_half(rows)
        bands = fit_bands(rows)  # final bands use ALL rows; accuracy is the split-half number
        rules["buildings"][tag] = {
            "db": cfg["db"], "db_md5": _md5(os.path.join(ROOT, cfg["db"])),
            "frame": cfg["db_frame"], "n_elements": len(rows),
            "measured": measured, "classes": bands,
        }
        pct = lambda k: 100.0 * measured[k] / max(measured["n"], 1)
        print(f"§BANDS {tag}: elements={len(rows)} classes={len(bands)} "
              f"| measured split-half: n={measured['n']} top1={pct('top1'):.1f}% "
              f"top3={pct('top3'):.1f}% own-in-band={pct('own_class_in_band'):.1f}%")
    out = os.path.join(OUT_DIR, "geomap_rules.json")
    with open(out, "w") as f:
        json.dump(rules, f, indent=1, sort_keys=True)
    print(f"§WRITE {out} ({os.path.getsize(out)/1024:.0f} KB)")


def main():
    tags = [t for t in sys.argv[1:] if t in MANIFEST] or list(MANIFEST)
    os.makedirs(OUT_DIR, exist_ok=True)
    for tag in tags:
        cfg = MANIFEST[tag]
        if not cfg["ifcs"]:
            print(f"\n== MINE {tag}: no source IFC in repo — relations sidecar skipped "
                  f"(honest absence, bands only)")
            continue
        print(f"\n== MINE {tag}")
        sidecar = {"building": tag, "db": cfg["db"], "db_frame": cfg["db_frame"],
                   "sources": [], "storeys": {}, "spaces": {}, "elements": {},
                   "space_boundaries": [], "aggregates": [], "wall_connects": []}
        for rel in cfg["ifcs"]:
            mine_ifc(os.path.join(ROOT, rel), sidecar)
        cov = coverage(tag, cfg, sidecar)
        sidecar["coverage"] = cov
        # Deterministic artifact: sort edge lists; json sort_keys.
        sidecar["space_boundaries"].sort(key=lambda b: (b["space"], b["element"] or ""))
        sidecar["aggregates"].sort(key=lambda a: (a["parent"], a["child"]))
        sidecar["wall_connects"].sort(key=lambda w: (w["a"], w["b"]))
        out = os.path.join(OUT_DIR, f"relations_{tag}.json")
        with open(out, "w") as f:
            json.dump(sidecar, f, indent=1, sort_keys=True)
        print(f"§WRITE {out} ({os.path.getsize(out)/1024:.0f} KB)")
    print("\n== PHASE B: dimension bands")
    phase_b(tags)


if __name__ == "__main__":
    main()
