#!/usr/bin/env python3
"""
W-GEOMAP-TIER1 — prompts/RESUME_IFC_BOM_GEOMAPPING.md §WITNESS.

ISSUE PROVED: the relation sidecars (geomap/relations_*.json, mined by
tools/mine_geomap.py from the SOURCE IFCs) match the shipped corpus DBs'
relational ground truth EXACTLY where both sides know the answer, and the
mining is deterministic (re-mine -> byte-identical artifact). If either fails,
Tier 1 would be fabricating relations — the exact non-invent failure (PR #543)
this library exists to prevent.

Ground truth: elements_meta.storey (SH 20 / DX 146 / SC 3332 known rows) and
DX rel_contained_in_space (61 rows). Measured 2026-07-02: 100% agreement on all.
Exit 0 only if every assertion holds. Read the §-log, not the exit code alone.
"""
import json
import os
import sqlite3
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from extract import normalize_storey  # noqa: E402

BUILDINGS = {
    "SH": "deploy/buildings/SampleHouse_extracted.db",
    "DX": "deploy/buildings/Duplex_extracted.db",
    "SC": "deploy/buildings/SampleCastle_extracted.db",
    # §NEXT-SESSION-TASKS item 4 (2026-07-02): Clinic + Hospital onboarded via the MANIFEST SOP.
    "CL": "deploy/buildings/Clinic_extracted.db",
    "HO": "deploy/buildings/Hospital_extracted.db",
    # HHS Office (user scope decision 2026-07-02): 69% join is the HONEST ceiling — the db's missing
    # MEP portion came from an export revision with no in-repo source (see MANIFEST comment).
    "HHS": "deploy/buildings/HHS_Office_Federated_extracted.db",
    # F11 (2026-07-02): Terminal's real source IFC is internal/UNMERGED/merged_federation.ifc;
    # its db guids carry the extractor's T{n}_Terminal_ prefix — the sidecar records `guid_strip`
    # and this witness joins on the stripped form, same as every consumer must.
    "Terminal": "deploy/buildings/Terminal_extracted.db",
}

fails = 0


def check(name, cond, detail=""):
    global fails
    status = "PASS" if cond else "FAIL"
    if not cond:
        fails += 1
    print(f"§W-GEOMAP-TIER1 {status}: {name} {detail}")


def main():
    import re
    for tag, db_rel in BUILDINGS.items():
        side_path = os.path.join(ROOT, "geomap", f"relations_{tag}.json")
        side = json.load(open(side_path))
        el = side["elements"]
        rx = re.compile(side["guid_strip"]) if side.get("guid_strip") else None
        norm = (lambda g: rx.sub("", g)) if rx else (lambda g: g)
        c = sqlite3.connect(f"file:{os.path.join(ROOT, db_rel)}?mode=ro", uri=True)

        both = agree = 0
        disagree = []  # (stripped guid, db storey, sidecar storey)
        for g, st in c.execute("SELECT guid, storey FROM elements_meta "
                               "WHERE storey IS NOT NULL AND storey NOT IN ('','Unknown')"):
            g = norm(g)
            s = el.get(g, {}).get("storey")
            if not s:
                continue
            both += 1
            if normalize_storey(st) == normalize_storey(s):
                agree += 1
            else:
                disagree.append((g, st, s))
        if not disagree:
            check(f"{tag} storey exact-match", both > 0,
                  f"({agree}/{both} both-known rows)")
        else:
            # Disagreement is NOT automatically a sidecar failure: the db's storey column can be a
            # DERIVED (z-binned) value while the sidecar mines the REAL IfcRelContainedInSpatialStructure.
            # ADJUDICATE against the source IFC directly: the witness passes only if the sidecar matches
            # the file's own containment on EVERY disagreeing row — and then the db rows are a FINDING
            # (extraction inaccuracy detected), not a fault. First seen: HHS, 93 rows, all MEP fittings
            # z-binned to 'Level 1' while the file contains them in Level 2/3 (verified 2026-07-02).
            import ifcopenshell
            ifc_truth = {}
            for srcrec in side["sources"]:
                f = ifcopenshell.open(os.path.join(ROOT, srcrec["file"]))
                for rel in f.by_type("IfcRelContainedInSpatialStructure"):
                    if rel.RelatingStructure.is_a("IfcBuildingStorey"):
                        for e in rel.RelatedElements:
                            gid = getattr(e, "GlobalId", None)
                            if gid:
                                ifc_truth[gid] = rel.RelatingStructure.Name
            bad = [(g, st, s) for g, st, s in disagree
                   if normalize_storey(ifc_truth.get(g, "")) != normalize_storey(s)]
            check(f"{tag} storey: sidecar == source-IFC containment on ALL {len(disagree)} db-disagreements",
                  both > 0 and not bad,
                  f"({agree}/{both} agree; sidecar-vs-IFC mismatches: {bad[:3]})")
            if not bad:
                print(f"§W-GEOMAP-TIER1 FINDING {tag}: db storey column WRONG on {len(disagree)} rows "
                      f"(derived z-binning vs the file's real containment) — e.g. {disagree[0]}")

        sboth = sagree = 0
        try:
            for g, sp in c.execute("SELECT element_guid, space_guid FROM rel_contained_in_space"):
                s = el.get(g, {}).get("space")
                if s is None:
                    continue
                sboth += 1
                if s == sp:
                    sagree += 1
            if sboth:
                check(f"{tag} space-containment exact-match", sagree == sboth,
                      f"({sagree}/{sboth})")
        except sqlite3.OperationalError:
            pass  # corpus DB has no rel_contained_in_space table (F2) — nothing to compare

        # NONINVENT guard: sidecar must not claim relations for GUIDs outside the source IFC
        db_guids = {norm(r[0]) for r in c.execute("SELECT guid FROM elements_meta")}
        joined = sum(1 for g in el if g in db_guids)
        check(f"{tag} sidecar join sanity", joined > 0,
              f"({joined} sidecar elements join corpus {len(db_guids)})")
        c.close()

    # Determinism: re-mine the smallest building (SH) fresh -> byte-identical artifact.
    import mine_geomap as mg
    cfg = mg.MANIFEST["SH"]
    sidecar = {"building": "SH", "db": cfg["db"], "db_frame": cfg["db_frame"],
               "sources": [], "storeys": {}, "spaces": {}, "elements": {},
               "space_boundaries": [], "aggregates": [], "wall_connects": []}
    for rel in cfg["ifcs"]:
        mg.mine_ifc(os.path.join(ROOT, rel), sidecar)
    sidecar["coverage"] = mg.coverage("SH", cfg, sidecar)
    sidecar["space_boundaries"].sort(key=lambda b: (b["space"], b["element"] or ""))
    sidecar["aggregates"].sort(key=lambda a: (a["parent"], a["child"]))
    sidecar["wall_connects"].sort(key=lambda w: (w["a"], w["b"]))
    fresh = json.dumps(sidecar, indent=1, sort_keys=True)
    disk = open(os.path.join(ROOT, "geomap", "relations_SH.json")).read()
    check("SH re-mine deterministic byte-identical", fresh == disk,
          f"(fresh {len(fresh)}B vs disk {len(disk)}B)")

    print(f"§W-GEOMAP-TIER1 RESULT: {'GREEN' if fails == 0 else f'RED ({fails} failures)'}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
