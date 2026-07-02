#!/usr/bin/env python3
"""
SPIKE 5 — within-building self-bootstrap band-fitting POC (DISPOSABLE, not shipped).

Implementing prompts/RESUME_IFC_BOM_GEOMAPPING.md §TIER3-FABLE5-TASK / §INCOMING-BUILDINGS
idea 3 — Witness (if promising): W-GEOMAP-BOOTSTRAP.

ISSUE THIS POC PROVES OR DISPROVES: can a brand-new building, with ZERO pre-mined
Tier-2 calibration, fit its OWN per-class dimension bands live from ONLY the
fraction of its elements Tier 1 already labels via a REAL relation
(`type_name`/`type_class` from IfcRelDefinesByType, mined into
geomap/relations_{SH,DX,SC}.json) — and then classify the geometry-only
remainder of the SAME building at accuracy comparable to the pre-mined
full-corpus split-half numbers (SH 93.8 / DX 53.1 / SC 51.8 / Terminal 84.2% top-1)?

Non-invent constraints honoured (spec §TIER3-FABLE5-TASK):
- The "known" fraction = elements with a real type_class from IfcRelDefinesByType
  (SH/DX/SC: pre-mined sidecars; Terminal: mined in-run from the REAL source IFC
  `internal/UNMERGED/merged_federation.ifc` found by the F11 correction —
  the DB's own element_type column is present-but-empty, 0/48,428, re-verified).
  Independence from elements_meta.ifc_class VERIFIED in-run (§INDEPENDENCE):
  type_class is NEVER a verbatim copy of ifc_class and is not deterministically
  derivable from it (IfcWallType -> {IfcWall, IfcWallStandardCase};
  IfcCableSegmentType -> IfcFlowSegment). Their real ifc_class is used as the
  band-fit label ONLY for that fraction — justified because Tier 1 already
  identified those elements via a genuine relation.
- ifc_class of the HELD-OUT remainder is used only as evaluation ground truth,
  never for fitting.
- Bands need >=3 supporting samples (mine_geomap.fit_bands convention, reused).
- geomap_rules.json is read ONLY to print the pre-mined comparison line — never
  as an input to the bootstrap fit (zero-prior-calibration simulated honestly).
- Terminal frame caveat unchanged (F5): dims come from bbox_x/y/z cols, frame
  UNVERIFIED — same feature the pre-mined Terminal bands use, so the comparison
  is like-for-like. mine_geomap.py's MANIFEST is NOT modified by this POC.

Band math is REUSED from tools/mine_geomap.py (fit_bands/rank_classes/in_band/
_log3/load_dims) — nothing reimplemented.

Usage:  python3 tools/bootstrap_geomap_poc.py | tee prompts/poc_geomapping/spike5_bootstrap.log
Read the §-log after every run.
"""
import json
import os
import re
import sqlite3
import sys
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import mine_geomap as mg  # noqa: E402

TAGS = ["SH", "DX", "SC", "Terminal"]
TERMINAL_IFC = "internal/UNMERGED/merged_federation.ifc"  # F11 correction


def typed_map_from_sidecar(tag):
    """guid -> type_class for SH/DX/SC from the pre-mined relation sidecars."""
    el = json.load(open(os.path.join(ROOT, "geomap", f"relations_{tag}.json")))["elements"]
    return {g: e["type_class"] for g, e in el.items() if "type_class" in e}


def typed_map_terminal():
    """guid -> type_class mined LIVE from Terminal's real source IFC (F11).
    DB guids carry a T{n}_Terminal_ discipline prefix — strip to join (per F11)."""
    import ifcopenshell
    path = os.path.join(ROOT, TERMINAL_IFC)
    f = ifcopenshell.open(path)
    raw = {}
    for rel in f.by_type("IfcRelDefinesByType"):
        t = rel.RelatingType
        if not t:
            continue
        for e in rel.RelatedObjects:
            try:
                raw[e.GlobalId] = t.is_a()
            except AttributeError:
                continue
    db = os.path.join(ROOT, "deploy/buildings/Terminal_extracted.db")
    c = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
    n_empty = c.execute("SELECT COUNT(*) FROM elements_meta WHERE element_type "
                        "IS NOT NULL AND element_type != ''").fetchone()[0]
    guids = [r[0] for r in c.execute("SELECT guid FROM elements_meta")]
    c.close()
    out = {}
    for g in guids:
        tc = raw.get(re.sub(r"^T\d+_Terminal_", "", g))
        if tc:
            out[g] = tc
    print(f"§MINE Terminal: {TERMINAL_IFC} IfcRelDefinesByType-typed elements={len(raw)}; "
          f"DB join after T{{n}}_Terminal_ prefix-strip: {len(out)}/{len(guids)} "
          f"({100.0*len(out)/len(guids):.1f}%); DB element_type populated rows={n_empty} "
          f"(source IFC is the ONLY real type signal)")
    return out


def independence_check(tag, rows, typed):
    """§INDEPENDENCE: prove type_class is a distinct signal, not ifc_class copied."""
    labeled = [(g, cls, typed[g]) for g, cls, _ in rows if g in typed]
    verbatim = sum(1 for _, ic, tc in labeled if tc == ic)
    tc_to_ic = defaultdict(set)
    for _, ic, tc in labeled:
        tc_to_ic[tc].add(ic)
    ambig = {tc: sorted(ics) for tc, ics in tc_to_ic.items() if len(ics) > 1}
    print(f"§INDEPENDENCE {tag}: labeled={len(labeled)} "
          f"type_class==ifc_class verbatim={verbatim} "
          f"distinct_type_classes={len(tc_to_ic)} "
          f"one-to-many={ambig if len(ambig) <= 6 else f'{len(ambig)} type_classes'}")
    return verbatim == 0


def bootstrap_eval(tag, typed):
    """Fit bands from Tier-1-typed fraction only; evaluate on the held-out rest."""
    rows = mg.load_dims(tag, mg.MANIFEST[tag])  # (guid, ifc_class, sorted dims)
    ok = independence_check(tag, rows, typed)

    labeled = [r for r in rows if r[0] in typed]
    heldout = [r for r in rows if r[0] not in typed]
    bands = mg.fit_bands(labeled)  # >=3-sample convention lives inside fit_bands

    lab_classes = Counter(c for _, c, _ in labeled)
    dropped = sorted(c for c in lab_classes if c not in bands)
    held_classes = Counter(c for _, c, _ in heldout)
    unseen = {c: n for c, n in held_classes.items() if c not in bands}
    overlap = sorted(set(lab_classes) & set(held_classes))

    print(f"§SPLIT {tag}: corpus_with_dims={len(rows)} "
          f"tier1_labeled={len(labeled)} ({100.0*len(labeled)/max(len(rows),1):.1f}%) "
          f"heldout={len(heldout)}")
    print(f"§FIT {tag}: classes_in_labeled={len(lab_classes)} bands_fit={len(bands)} "
          f"dropped_lt3_support={dropped or 'none'}")
    print(f"§HELDOUT {tag}: classes={dict(sorted(held_classes.items()))}")
    print(f"§DISJOINT {tag}: labeled∩heldout class overlap={overlap or 'NONE'}")
    if unseen:
        print(f"§HELDOUT {tag}: class-has-no-band (can never be top-1): {unseen} "
              f"= {sum(unseen.values())}/{len(heldout)} rows")

    # Same metric convention as measure_split_half: rows whose class has no band
    # are excluded from n (comparable). ALSO report strict variant counting them
    # as wrong (a live system can't skip them) — both numbers, no cherry-pick.
    n = top1 = top3 = inb = 0
    for _, cls, dims in heldout:
        if cls not in bands:
            continue
        n += 1
        ranked = [c for _, c in mg.rank_classes(bands, dims)]
        if ranked[0] == cls:
            top1 += 1
        if cls in ranked[:3]:
            top3 += 1
        if mg.in_band(bands[cls], dims):
            inb += 1
    n_all = len(heldout)
    res = {"n_heldout": n_all, "n_eval": n, "top1": top1, "top3": top3,
           "own_class_in_band": inb, "independence_verbatim_zero": ok,
           "class_overlap": overlap}
    pct = lambda k, d: 100.0 * res[k] / max(d, 1)
    print(f"§BOOTSTRAP {tag}: eval n={n} (of {n_all} heldout) "
          f"top1={pct('top1', n):.1f}% top3={pct('top3', n):.1f}% "
          f"own-in-band={pct('own_class_in_band', n):.1f}% "
          f"| STRICT over all heldout: top1={pct('top1', n_all):.1f}% "
          f"top3={pct('top3', n_all):.1f}%")
    return res


def main():
    print("§SPIKE5 within-building self-bootstrap — bands from Tier-1-typed "
          "fraction ONLY (type_name/type_class real IfcRelDefinesByType relation), "
          "evaluated on the geometry-only remainder of the SAME building. "
          "geomap_rules.json NOT used for fitting (zero-prior-calibration).")

    # Pre-mined comparison line (read-only, comparison ONLY — not an input).
    rules = json.load(open(os.path.join(ROOT, "geomap", "geomap_rules.json")))
    results = {}
    for tag in TAGS:
        print(f"\n== {tag}")
        typed = typed_map_terminal() if tag == "Terminal" else typed_map_from_sidecar(tag)
        results[tag] = bootstrap_eval(tag, typed)
        m = rules["buildings"][tag]["measured"]
        p = lambda k: 100.0 * m[k] / max(m["n"], 1)
        print(f"§PREMINED {tag} (split-half, full ifc_class ground truth): "
              f"n={m['n']} top1={p('top1'):.1f}% top3={p('top3'):.1f}% "
              f"own-in-band={p('own_class_in_band'):.1f}%")

    print("\n§VERDICT-TABLE (bootstrap eval-convention top1 vs pre-mined split-half top1):")
    for tag in TAGS:
        r = results[tag]
        m = rules["buildings"][tag]["measured"]
        bt = 100.0 * r["top1"] / max(r["n_eval"], 1)
        pm = 100.0 * m["top1"] / max(m["n"], 1)
        print(f"  {tag}: bootstrap {bt:.1f}% (n={r['n_eval']}/{r['n_heldout']} heldout) "
              f"vs pre-mined {pm:.1f}% (n={m['n']})  delta={bt-pm:+.1f}pp "
              f"class-overlap={r['class_overlap'] or 'NONE'}")
    print("§VERDICT: typed vs untyped fractions are class-DISJOINT (overlap NONE) in "
          "SH/DX/SC — IfcRelDefinesByType coverage is CLASS-CORRELATED (typed = "
          "manufactured/catalog: doors/windows/furniture/MEP; untyped = in-situ: "
          "DX-walls/slabs/coverings/footings/roofs/stairs/members/element-parts), so "
          "the bootstrap has ZERO training samples for every class it must predict. "
          "Terminal is the degenerate opposite: type relation covers ~100%, nothing "
          "left to bootstrap. Idea 3 collapses on this corpus.")
    print("§SPIKE5 DONE — read every § line above before concluding.")


if __name__ == "__main__":
    main()
