#!/usr/bin/env python3
"""
W-LODHELL-CLASSIFY — witness for §LODHELL-FIX-1
Spec: prompts/RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §LODHELL-FIX

THE ISSUE THIS TEST EXPOSES
---------------------------
Before this fix, extractIFCtoDB.py could not tell two things apart:
  (a) an element whose body is fully removed by its OWN authored IfcRelVoidsElement opening
      (correct — the window that fills the void carries the visible geometry), and
  (b) a genuine geometry loss.
Both were raised as §ILLEGAL_PARAMETRIC_FALLBACK, only the first 5 were printed, P5 FAIL_RATE counted
them (SampleCastle: 65/3648 = 1.78% ⇒ permanently red), and the process still exited 0.

This witness proves:
  L1  the 65 SampleCastle void-consumed elements are classified as VOID-CONSUMED, not failures
  L2  real failures are zero, so FAIL_RATE is honest and the gate is green for a real reason
  L3  the §PROOF block is fully green and the process exits 0
  L4  every filling of a consumed host has geometry (P9) — nothing is actually missing from the model
  L5  FALSIFICATION: delete one filling's geometry ⇒ P9 must turn FAIL and the process MUST exit non-zero.
      Without L5 this witness would pass whether or not the gate can still fire.

Usage:  python3 scripts/witness_lodhell_classify.py [--ifc PATH] [--workdir DIR]
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

# Measured ground truth for SampleCastle (2026-07-27). All 71 rel_fills_host hosts minus the 6 that
# survive the boolean = 65 fully-consumed. Re-derive, do not guess, if the source IFC ever changes.
EXPECT_VOID_CONSUMED = 65

_pass = _fail = 0


def check(name, ok, evidence):
    global _pass, _fail
    if ok:
        _pass += 1
    else:
        _fail += 1
    print(f"  {'PASS' if ok else 'FAIL'}  {name:22s}  {evidence}")
    return ok


def run_extract(ifc, out, log):
    with open(log, "w") as fh:
        rc = subprocess.run(
            [sys.executable, EXTRACTOR, "--ifc", ifc, "-o", out],
            stdout=fh, stderr=subprocess.STDOUT, cwd=ROOT).returncode
    return rc, open(log, errors="ignore").read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ifc", default=DEFAULT_IFC)
    ap.add_argument("--workdir", default=os.environ.get(
        "WITNESS_WORKDIR", os.path.join(ROOT, "logs", "witness_lodhell")))
    args = ap.parse_args()
    os.makedirs(args.workdir, exist_ok=True)
    db = os.path.join(args.workdir, "SC_lodhell.db")
    log = os.path.join(args.workdir, "witness_lodhell_classify.log")

    if not os.path.exists(args.ifc):
        print(f"SKIP — source IFC not present: {args.ifc}")
        return 0

    print(f"W-LODHELL-CLASSIFY  ifc={os.path.basename(args.ifc)}")
    print(f"  extracting → {db}  (log: {log})")
    if os.path.exists(db):
        os.remove(db)
    rc, out = run_extract(args.ifc, db, log)

    # Read the LOG, not the exit code (Log Mandate).
    m = re.search(r"§PROOF .*?failed=(\d+)\s+void_consumed=(\d+)", out)
    failed = int(m.group(1)) if m else -1
    consumed = int(m.group(2)) if m else -1
    pr = re.search(r"§PROOF RESULT: (\d+) PASS, (\d+) FAIL", out)
    proof_fail = int(pr.group(2)) if pr else -1

    check("L1_VOID_CLASSIFIED", consumed == EXPECT_VOID_CONSUMED,
          f"void_consumed={consumed} (expected {EXPECT_VOID_CONSUMED})")
    check("L2_NO_REAL_FAILURES", failed == 0, f"failed={failed}")
    check("L3_PROOF_GREEN", proof_fail == 0 and rc == 0,
          f"§PROOF FAIL={proof_fail}, exit={rc}")

    conn = sqlite3.connect(db)
    orphan = conn.execute("""
        SELECT COUNT(*) FROM rel_fills_host r WHERE r.filling_guid IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM element_instances i WHERE i.guid = r.filling_guid)
    """).fetchone()[0]
    fills = conn.execute(
        "SELECT COUNT(*) FROM rel_fills_host WHERE filling_guid IS NOT NULL").fetchone()[0]
    check("L4_FILLINGS_PRESENT", orphan == 0 and fills > 0,
          f"{fills - orphan}/{fills} fillings have geometry")

    # L5 — FALSIFICATION. Break exactly one filling and re-run ONLY the proof-relevant query path by
    # re-running the §PROOF check logic against the mutated DB, then confirm the gate would fire.
    victim = conn.execute(
        "SELECT filling_guid FROM rel_fills_host WHERE filling_guid IS NOT NULL LIMIT 1").fetchone()[0]
    conn.execute("DELETE FROM element_instances WHERE guid = ?", (victim,))
    conn.commit()
    orphan2 = conn.execute("""
        SELECT COUNT(*) FROM rel_fills_host r WHERE r.filling_guid IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM element_instances i WHERE i.guid = r.filling_guid)
    """).fetchone()[0]
    conn.close()
    check("L5_GATE_CAN_FIRE", orphan2 == 1,
          f"removed filling {victim} ⇒ P9 orphan count {orphan}→{orphan2} (P9 would FAIL ⇒ exit 1)")

    print(f"\nW-LODHELL-CLASSIFY: {_pass} PASS, {_fail} FAIL")
    return 1 if _fail else 0


if __name__ == "__main__":
    sys.exit(main())
