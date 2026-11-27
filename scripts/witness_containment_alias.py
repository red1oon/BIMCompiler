#!/usr/bin/env python3
"""
witness_containment_alias.py — W-CONTAINMENT-ALIAS (CONTAINMENT_LTU_STOREY_ALIAS.md §4).

ISSUE IT PROVES/DISPROVES: compile_rooms.py's element->room containment join keyed on exact
storey-string equality, so MEP disciplines (which spell floors "Plan N"/"Storey N" instead of
ARC's "VÅNING N") were structurally excluded from rel_contained_in_space regardless of true
geometric location. PASS = the canonicalized join (a) increases total containment rows, (b) gives
non-zero rows to MEP disciplines that had ZERO before, (c) leaves room geometry (spatial_structure
IfcSpace rect count) byte-identical, (d) never assigns a SUSPECT room any containment rows.

Runs compile_rooms.py's ORIGINAL (pre-fix, fetched from a git ref) and CURRENT (working tree)
versions against two scratch copies of the same source DB — never touches the checked-in original.

Usage: python3 scripts/witness_containment_alias.py <source_db> [<git_ref_for_original>]
  <git_ref_for_original> defaults to origin/fable/meshdb-livewire (this fix's base).
"""
import sqlite3, subprocess, sys, tempfile, shutil, os

def by_discipline(db_path):
    con = sqlite3.connect(db_path)
    rows = con.execute(
        "SELECT m.discipline, COUNT(*) FROM rel_contained_in_space rcs "
        "JOIN elements_meta m ON m.guid = rcs.element_guid GROUP BY m.discipline"
    ).fetchall()
    total = con.execute("SELECT COUNT(*) FROM rel_contained_in_space").fetchone()[0]
    rects = con.execute(
        "SELECT COUNT(*) FROM spatial_structure WHERE type='IfcSpace' AND guid LIKE 'RM_%'"
    ).fetchone()[0]
    suspect_leak = con.execute(
        "SELECT COUNT(*) FROM rel_contained_in_space rcs "
        "JOIN spatial_structure ss ON ss.room_guid = rcs.space_guid "
        "WHERE ss.predefined_type LIKE 'SUSPECT_%'"
    ).fetchone()[0]
    con.close()
    return {"total": total, "rects": rects, "suspect_leak": suspect_leak, "by_disc": dict(rows)}


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(2)
    src = sys.argv[1]
    base_ref = sys.argv[2] if len(sys.argv) > 2 else "origin/fable/meshdb-livewire"
    tmp = tempfile.mkdtemp(prefix="witness-containment-")
    before_db = os.path.join(tmp, "before.db")
    after_db = os.path.join(tmp, "after.db")
    orig_script = os.path.join(tmp, "compile_rooms_ORIGINAL.py")
    shutil.copyfile(src, before_db)
    shutil.copyfile(src, after_db)

    with open(orig_script, "w") as f:
        subprocess.run(["git", "show", f"{base_ref}:scripts/compile_rooms.py"],
                        cwd=os.path.dirname(os.path.abspath(__file__)) + "/..", stdout=f, check=True)

    subprocess.run([sys.executable, orig_script, before_db, "--write"],
                    check=True, capture_output=True)
    cur_script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "compile_rooms.py")
    subprocess.run([sys.executable, cur_script, after_db, "--write"],
                    check=True, capture_output=True)

    b = by_discipline(before_db)
    a = by_discipline(after_db)

    print(f"BEFORE: total={b['total']} rects={b['rects']} suspect_leak={b['suspect_leak']} by_disc={b['by_disc']}")
    print(f"AFTER:  total={a['total']} rects={a['rects']} suspect_leak={a['suspect_leak']} by_disc={a['by_disc']}")

    was_zero = {d for d in a["by_disc"] if b["by_disc"].get(d, 0) == 0}
    now_nonzero_mep = [d for d in was_zero if a["by_disc"][d] > 0 and d not in ("ARC", "STR")]

    pss = (a["total"] > b["total"]
           and len(now_nonzero_mep) > 0
           and a["rects"] == b["rects"]
           and a["suspect_leak"] == 0 and b["suspect_leak"] == 0)

    if pss:
        print(f"PASS — containment rows {b['total']} -> {a['total']}, "
              f"newly-covered disciplines: {sorted(now_nonzero_mep)}, "
              f"room rect count unchanged ({a['rects']}), zero suspect-room leakage")
    else:
        print(f"FAIL — total {b['total']}->{a['total']}, newly_nonzero_mep={now_nonzero_mep}, "
              f"rects {b['rects']}->{a['rects']}, suspect_leak before={b['suspect_leak']} after={a['suspect_leak']}")

    shutil.rmtree(tmp, ignore_errors=True)
    sys.exit(0 if pss else 1)


if __name__ == "__main__":
    main()
