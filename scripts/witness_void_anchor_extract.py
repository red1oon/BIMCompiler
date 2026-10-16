#!/usr/bin/env python3
# Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT
"""
W-VOID-ANCHOR-EXTRACT — witness for §ANCHOR (extractor half).
Spec: prompts/RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §START HERE OPEN 1 (USER-APPROVED 2026-07-30,
binding condition: anchors UNMISTAKABLE + excluded from every count/pick/audit).

THE ISSUE THIS TEST EXPOSES
---------------------------
A VOID-CONSUMED host (its own authored opening subtracts 100% of its body) used to leave NOTHING in
the DB — correct as geometry, but it kills `stretchRide()` for its filling (SampleCastle reach 9/74
because 65/71 hosts are void-consumed). The extractor already computed the host's world placement
(`shape.transformation.matrix`) and the pre-boolean Body ITEM's extent (inside `is_void_consumed()`)
and THREW BOTH AWAY. This witness proves the extractor now persists that already-computed data as
unmistakable anchor rows — and proves the binding guardrail: anchors contaminate NO count, NO
renderable table, NO §PROOF gate.

  A1  fresh SampleCastle extraction ⇒ exactly 65 anchor rows (elements_meta.is_anchor=1 AND
      element_transforms.transform_source='void_anchor'), the known void-consumed population
  A2  every anchor carries REAL extracted data: non-null center/rotation, extent > 0 on all axes,
      and every anchor guid is a rel_fills_host host (they ARE the opening-hosts)
  A3  anchors add ZERO renderable rows: element_instances count identical to the pre-change
      baseline; 0 element_instances and 0 elements_rtree rows for anchor guids/ids
  A4  imported/failed/void_consumed identical to the pre-change baseline; anchors logged as their
      OWN count (anchors=65), never folded into elements=
  A5  one §ANCHOR log line per persisted host (65) + the §ANCHOR summary line
  A6  §PROOF gates unaffected: per-gate PASS/FAIL set identical pre vs post. SampleCastle's exit 1
      is EXPECTED in BOTH runs and attributable to the one known honest refusal alone (sporenkap
      2vGfAAaCDC$u2rePIbFqLy §LAYER-REFUSE ⇒ P10 LOD400_ENVELOPE 1/75) — unchanged by this work
  A7  FALSIFICATION (RED on pre-change code): the baseline DB has NO anchor rows — 0 rows / no
      is_anchor column at all. Without A7 this witness would pass on code that never persisted
      anything.

USAGE
    python3 scripts/witness_void_anchor_extract.py [--ifc PATH] [--workdir DIR] [--pre-ref REF]
    --reuse  reuse existing workdir extractions/logs (debugging only — a claims run must be fresh)
Reads the extractors' own logs (Log Mandate) — never an exit code alone.
"""
import argparse
import os
import re
import sqlite3
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTRACTOR = os.path.join(ROOT, "DAGCompiler", "python", "extractIFCtoDB.py")
DEFAULT_IFC = os.path.join(ROOT, "internal", "sources", "Ifc2x3_SampleCastle.ifc")

# Measured ground truth for SampleCastle (2026-07-27 probe, unchanged): 71 rel_fills_host hosts,
# 6 survive the boolean with geometry, 65 fully consumed ⇒ 65 anchors. Re-derive if the IFC changes.
EXPECT_ANCHORS = 65
SPORENKAP = "2vGfAAaCDC$u2rePIbFqLy"   # the ONE known honest P10 refusal — SC exits 1 for it BY DESIGN

_pass = _fail = 0


def check(name, ok, evidence):
    global _pass, _fail
    if ok:
        _pass += 1
    else:
        _fail += 1
    print(f"  {'PASS' if ok else 'FAIL'}  {name:24s}  {evidence}")
    return ok


def run_extract(extractor, ifc, out, log):
    with open(log, "w") as fh:
        rc = subprocess.run([sys.executable, extractor, "--ifc", ifc, "-o", out],
                            stdout=fh, stderr=subprocess.STDOUT, cwd=ROOT).returncode
    return rc, open(log, errors="ignore").read()


def parse_proof(text):
    m = re.search(r"§PROOF \S+\s+elements=(\d+)\s+failed=(\d+)\s+void_consumed=(\d+)"
                  r"\s+bbox_fallback=(\d+)(?:\s+anchors=(\d+))?", text)
    counts = {"elements": int(m.group(1)), "failed": int(m.group(2)),
              "void_consumed": int(m.group(3)), "bbox_fallback": int(m.group(4)),
              "anchors": int(m.group(5)) if m.group(5) else None} if m else None
    gates = {name: tag for tag, name in re.findall(r"^\s{4}(PASS|FAIL)\s+(\S+)", text, re.M)}
    return counts, gates


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ifc", default=DEFAULT_IFC)
    ap.add_argument("--workdir", default=os.environ.get(
        "WITNESS_WORKDIR", os.path.join(ROOT, "logs", "witness_void_anchor")))
    ap.add_argument("--pre-ref", default=None,
                    help="git ref for the PRE-change extractor (default: merge-base HEAD origin/master)")
    ap.add_argument("--reuse", action="store_true")
    args = ap.parse_args()
    os.makedirs(args.workdir, exist_ok=True)

    if not os.path.exists(args.ifc):
        print(f"SKIP — source IFC not present: {args.ifc}")
        return 0

    db_new = os.path.join(args.workdir, "SC_anchor_new.db")
    log_new = os.path.join(args.workdir, "SC_anchor_new.log")
    db_pre = os.path.join(args.workdir, "SC_anchor_pre.db")
    log_pre = os.path.join(args.workdir, "SC_anchor_pre.log")
    extractor_pre = os.path.join(args.workdir, "extract_pre.py")

    print(f"W-VOID-ANCHOR-EXTRACT  ifc={os.path.basename(args.ifc)}")

    # ── POST-change: fresh extraction with the working-tree extractor ──
    if args.reuse and os.path.exists(db_new) and os.path.exists(log_new):
        rc_new, out_new = None, open(log_new, errors="ignore").read()
        m = re.search(r"^exit=(\d+)", out_new, re.M)
        rc_new = int(m.group(1)) if m else None
        print(f"  (reusing {db_new})")
    else:
        for p in (db_new,):
            if os.path.exists(p):
                os.remove(p)
        print(f"  extracting (NEW code) → {db_new}  (log: {log_new})")
        rc_new, out_new = run_extract(EXTRACTOR, args.ifc, db_new, log_new)
        with open(log_new, "a") as fh:
            fh.write(f"exit={rc_new}\n")

    # ── PRE-change baseline: extractor materialized from git (the falsification run) ──
    pre_ref = args.pre_ref
    if not pre_ref:
        pre_ref = subprocess.run(["git", "merge-base", "HEAD", "origin/master"],
                                 capture_output=True, text=True, cwd=ROOT).stdout.strip()
    if args.reuse and os.path.exists(db_pre) and os.path.exists(log_pre):
        out_pre = open(log_pre, errors="ignore").read()
        m = re.search(r"^exit=(\d+)", out_pre, re.M)
        rc_pre = int(m.group(1)) if m else None
        print(f"  (reusing {db_pre})")
    else:
        blob = subprocess.run(["git", "show", f"{pre_ref}:DAGCompiler/python/extractIFCtoDB.py"],
                              capture_output=True, text=True, cwd=ROOT)
        if blob.returncode != 0:
            print(f"FAIL — cannot materialize pre-change extractor from {pre_ref}")
            return 1
        with open(extractor_pre, "w") as fh:
            fh.write(blob.stdout)
        if os.path.exists(db_pre):
            os.remove(db_pre)
        print(f"  extracting (PRE-change {pre_ref[:12]}) → {db_pre}  (log: {log_pre})")
        rc_pre, out_pre = run_extract(extractor_pre, args.ifc, db_pre, log_pre)
        with open(log_pre, "a") as fh:
            fh.write(f"exit={rc_pre}\n")

    counts_new, gates_new = parse_proof(out_new)
    counts_pre, gates_pre = parse_proof(out_pre)
    if not counts_new or not counts_pre:
        print("FAIL — could not parse §PROOF line from one of the logs; read them")
        return 1

    conn = sqlite3.connect("file:" + db_new + "?mode=ro", uri=True)

    # A1 — exactly the known void-consumed population, doubly marked
    n_meta = conn.execute("SELECT COUNT(*) FROM elements_meta WHERE is_anchor=1").fetchone()[0]
    n_tr = conn.execute("SELECT COUNT(*) FROM element_transforms "
                        "WHERE transform_source='void_anchor'").fetchone()[0]
    n_both = conn.execute("""
        SELECT COUNT(*) FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid
        WHERE m.is_anchor=1 AND t.transform_source='void_anchor'""").fetchone()[0]
    check("A1_ANCHOR_COUNT", n_meta == EXPECT_ANCHORS and n_tr == EXPECT_ANCHORS
          and n_both == EXPECT_ANCHORS,
          f"is_anchor=1: {n_meta}, transform_source='void_anchor': {n_tr}, "
          f"both-marked: {n_both} (expected {EXPECT_ANCHORS})")

    # A2 — real extracted data, and the anchors ARE the opening-hosts
    bad = conn.execute("""
        SELECT COUNT(*) FROM element_transforms WHERE transform_source='void_anchor'
        AND (center_x IS NULL OR center_y IS NULL OR center_z IS NULL
             OR rotation_x IS NULL OR rotation_y IS NULL OR rotation_z IS NULL
             OR bbox_x IS NULL OR bbox_y IS NULL OR bbox_z IS NULL
             OR bbox_x <= 0 OR bbox_y <= 0 OR bbox_z <= 0)""").fetchone()[0]
    in_hosts = conn.execute("""
        SELECT COUNT(*) FROM elements_meta m WHERE m.is_anchor=1
        AND m.guid IN (SELECT host_guid FROM rel_fills_host)""").fetchone()[0]
    probe = conn.execute("""
        SELECT ROUND(bbox_x,3), ROUND(bbox_y,3), ROUND(bbox_z,3) FROM element_transforms
        WHERE guid='1A9aTEU4z9SwaqEUwI8Lx4'""").fetchone()
    probe_ok = probe == (1.21, 0.114, 1.85)   # the documented 2026-07-27 hand-probe of that kozijn
    check("A2_REAL_DATA", bad == 0 and in_hosts == EXPECT_ANCHORS and probe_ok,
          f"null/degenerate rows: {bad}; in rel_fills_host host set: {in_hosts}/{EXPECT_ANCHORS}; "
          f"probe 1A9aTEU4z9SwaqEUwI8Lx4 extent={probe} (expect (1.21, 0.114, 1.85))")

    # A3 — zero renderable rows added
    inst_new = conn.execute("SELECT COUNT(*) FROM element_instances").fetchone()[0]
    pconn = sqlite3.connect("file:" + db_pre + "?mode=ro", uri=True)
    inst_pre = pconn.execute("SELECT COUNT(*) FROM element_instances").fetchone()[0]
    a_inst = conn.execute("""SELECT COUNT(*) FROM element_instances
        WHERE guid IN (SELECT guid FROM elements_meta WHERE is_anchor=1)""").fetchone()[0]
    a_rtree = conn.execute("""SELECT COUNT(*) FROM elements_rtree
        WHERE id IN (SELECT id FROM elements_meta WHERE is_anchor=1)""").fetchone()[0]
    check("A3_NO_RENDERABLE", inst_new == inst_pre and a_inst == 0 and a_rtree == 0,
          f"element_instances {inst_pre}→{inst_new} (unchanged); "
          f"anchor instances={a_inst}, anchor rtree rows={a_rtree}")

    # A4 — extractor totals untouched; anchors are their own count
    same = all(counts_new[k] == counts_pre[k]
               for k in ("elements", "failed", "void_consumed", "bbox_fallback"))
    check("A4_COUNTS_UNCHANGED", same and counts_new["anchors"] == EXPECT_ANCHORS
          and counts_pre["anchors"] is None,
          f"pre {counts_pre} → new {counts_new} "
          f"(imported/failed/void_consumed identical; anchors= is NEW and separate)")

    # A5 — §ANCHOR log lines (⚠ '§ANCHORED' is a different, pre-existing datum tag — boundary-match)
    lines = re.findall(r"^  §ANCHOR Ifc\S+ (\S+) name=", out_new, re.M)
    summary = re.search(r"§ANCHOR persisted anchors=(\d+)", out_new)
    check("A5_ANCHOR_LINES", len(lines) == EXPECT_ANCHORS and len(set(lines)) == EXPECT_ANCHORS
          and summary and int(summary.group(1)) == EXPECT_ANCHORS,
          f"{len(lines)} §ANCHOR lines ({len(set(lines))} distinct guids), "
          f"summary anchors={summary.group(1) if summary else 'MISSING'}")

    # A6 — P-gates unaffected; the red exit is the ONE known refusal, in BOTH runs
    refuse_new = re.findall(r"§LAYER-REFUSE guid=(\S+?) ", out_new)
    refuse_pre = re.findall(r"§LAYER-REFUSE guid=(\S+?) ", out_pre)
    only_sporenkap = set(refuse_new) == {SPORENKAP} and set(refuse_pre) == {SPORENKAP}
    fails_new = sorted(k for k, v in gates_new.items() if v == "FAIL")
    fails_pre = sorted(k for k, v in gates_pre.items() if v == "FAIL")
    check("A6_GATES_UNAFFECTED",
          gates_new == gates_pre and fails_new == ["LOD400_ENVELOPE"]
          and rc_new == 1 and rc_pre == 1 and only_sporenkap,
          f"gates pre={gates_pre} == new={gates_new}; FAIL set={fails_new}; "
          f"exit pre={rc_pre} new={rc_new} — both 1, attributable to §LAYER-REFUSE "
          f"{sorted(set(refuse_new))} alone (the known honest sporenkap refusal, unchanged)")

    # A7 — FALSIFICATION: the same anchor queries against the PRE-change DB must come up EMPTY (RED)
    try:
        pre_anchor = pconn.execute(
            "SELECT COUNT(*) FROM elements_meta WHERE is_anchor=1").fetchone()[0]
        pre_evidence = f"pre-change DB has is_anchor column with {pre_anchor} rows"
    except sqlite3.OperationalError as e:
        pre_anchor = 0
        pre_evidence = f"pre-change DB: {e} (no is_anchor column at all)"
    try:
        pre_va = pconn.execute("SELECT COUNT(*) FROM element_transforms "
                               "WHERE transform_source='void_anchor'").fetchone()[0]
    except sqlite3.OperationalError:
        pre_va = 0
    pre_anchor_log = "§ANCHOR persisted" in out_pre
    check("A7_FALSIFY_RED", pre_anchor == 0 and pre_va == 0 and not pre_anchor_log,
          f"RED on pre-change code as required: {pre_evidence}; void_anchor transforms={pre_va}; "
          f"§ANCHOR summary in pre log: {pre_anchor_log}")

    conn.close()
    pconn.close()
    print(f"\nW-VOID-ANCHOR-EXTRACT: {_pass} PASS, {_fail} FAIL")
    return 1 if _fail else 0


if __name__ == "__main__":
    sys.exit(main())
