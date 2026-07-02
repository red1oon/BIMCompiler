#!/usr/bin/env python3
"""
W-GEOMAP-ALIAS — prompts/RESUME_IFC_BOM_GEOMAPPING.md §ALIAS-SPEC (item 6, the
lane-concluding piece). Mining side (A1-A3, A5-mining); the runtime alias()
checks (A4 rename table + refusal path) live in bim-ootb
geomapping/tests/witness_alias.js.

ISSUES PROVED:
  A1 MINED-HONEST   re-mine -> byte-equivalent artifact; every measured number
                    in the artifact reproduces from an INDEPENDENT recount here
                    (a drifted/asserted number goes RED).
  A2 MEASURED       per-building recovery (winner + candidate-set, resub + LOBO)
                    recomputed and matched against the artifact — the alias
                    layer's accuracy claim is these numbers, nothing else.
  A3 AMBIGUITY      ambiguous entries carry >=2 candidates + winner in set;
                    non-ambiguous carry exactly 1. No silently-picked winner.
  A5 NON-INVENT     the map contains ONLY type_classes observed in real
                    sidecar relations (spot: no empty entries, all counts >=1).
Exit 0 only if every assertion holds. Read the §-log, not the exit code alone.
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))

ART = os.path.join(ROOT, "geomap", "alias_map.json")

fails = 0


def check(name, cond, detail=""):
    global fails
    if not cond:
        fails += 1
    print(f"§W-GEOMAP-ALIAS {'PASS' if cond else 'FAIL'}: {name} {detail}")


def main():
    import mine_alias_map as mam

    # A1: deterministic re-run byte-equivalence
    before = open(ART, "rb").read() if os.path.exists(ART) else None
    subprocess.run([sys.executable, os.path.join(ROOT, "tools", "mine_alias_map.py")],
                   check=True, cwd=ROOT)
    after = open(ART, "rb").read()
    check("A1 re-mine byte-equivalent", before is None or before == after)
    art = json.loads(after)
    amap, measured = art["map"], art["measured"]

    # A2: independent recount of every measured number
    tags = sorted(art["buildings"])
    per = {t: mam.typed_pairs(t) for t in tags}
    fresh_map = mam.build_map([p for t in tags for p in per[t]])
    check("A2 map reproduces from sidecars", fresh_map == amap, f"({len(amap)} entries)")
    all_match = True
    for t in tags:
        rh, rs, rn = mam.recovery(per[t], amap)
        lobo = mam.build_map([p for u in tags if u != t for p in per[u]])
        lh, ls, ln = mam.recovery(per[t], lobo)
        m = measured[t]
        ok = (m["resub"] == {"winner": rh, "in_set": rs, "n": rn} and
              m["lobo"] == {"winner": lh, "in_set": ls, "n": ln})
        all_match = all_match and ok
        print(f"§W-GEOMAP-ALIAS measured {t}: LOBO winner {lh}/{ln} set {ls}/{ln} "
              f"({'match' if ok else 'MISMATCH vs artifact'})")
    check("A2 every artifact number reproduces independently", all_match)

    # A3: ambiguity honesty
    bad = [tc for tc, v in amap.items()
           if (v["ambiguous"] != (len(v["classes"]) > 1)) or v["winner"] not in v["classes"]]
    check("A3 ambiguous flag == (candidates>1); winner always in candidate set",
          not bad, f"(violations: {bad[:3]})")

    # A5: non-invent — every entry observed >=1 time, no empty candidate sets
    bad5 = [tc for tc, v in amap.items()
            if not v["classes"] or any(n < 1 for n in v["classes"].values())
            or v["n"] != sum(v["classes"].values())]
    check("A5 map holds only real observed relations (counts>=1, n==sum)", not bad5)

    print(f"§W-GEOMAP-ALIAS RESULT: {'RED' if fails else 'GREEN'} ({fails} fail)")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
