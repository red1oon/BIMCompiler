#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — W-MESHBIND-DISC (prompts/MODELLER_MASTER.md §MINER-DISC). READ THE LOG after every run; the exit code is not the evidence.
# THE ISSUE it proves/disproves: the mesh miner bound a (discipline, class) to the most frequent mesh of the CLASS, whatever discipline the
#   extraction records for it, so one discipline could be given another's mesh. Scratch copies only: no shipped DB is written.
# Usage: python3 scripts/witness_meshbind_discipline.py [bim-ootb dir]   (default ~/bim-ootb)
import importlib.util, os, shutil, sqlite3, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
OOTB = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else "~/bim-ootb")
P = F = I = 0


def verdict(name, v, info):
    global P, F, I
    if v == "PASS": P += 1
    elif v == "FAIL": F += 1
    else: I += 1
    print(f"§WMBD {name} {v} {info}")


def load(path, name):
    sp = importlib.util.spec_from_file_location(name, path)
    m = importlib.util.module_from_spec(sp)
    sp.loader.exec_module(m)
    return m


def mine(mod, rules_src, ext, tmp, tag):
    dst = os.path.join(tmp, tag + "_" + os.path.basename(rules_src))
    shutil.copy(rules_src, dst)
    lines = []
    mod.project(dst, ext, log=lines.append)
    con = sqlite3.connect(dst)
    rows = con.execute("SELECT disc, ifc_class, geometry_hash, n_of, n_total, provenance FROM rule_mesh_binding ORDER BY 1,2").fetchall()
    discs = {r[0] for r in con.execute("SELECT DISTINCT disc FROM rule_placement WHERE n_measured > 0")}
    con.close()
    return rows, lines, discs


def labels_of(ext, cls, ghash):
    b = sqlite3.connect("file:" + ext + "?mode=ro", uri=True)
    r = dict(b.execute("SELECT em.discipline, COUNT(*) FROM element_instances ei JOIN elements_meta em ON em.guid=ei.guid "
                       "WHERE em.ifc_class=? AND ei.geometry_hash=? GROUP BY 1", (cls, ghash)).fetchall())
    b.close()
    return r


def main():
    tmp = tempfile.mkdtemp(prefix="wmbd_")
    new = load(os.path.join(HERE, "..", "build", "project_rule_mesh_binding.py"), "miner_new")
    old_src = subprocess.run(["git", "-C", os.path.join(HERE, ".."), "show", "origin/master:build/project_rule_mesh_binding.py"],
                             capture_output=True, text=True).stdout
    old_path = os.path.join(tmp, "miner_old.py")
    open(old_path, "w").write(old_src)
    old = load(old_path, "miner_old") if "def project" in old_src else None
    T_RULES, T_EXT = os.path.join(OOTB, "modeller/terminal_rules.db"), os.path.join(OOTB, "buildings/Terminal_extracted.db")
    D_RULES, D_EXT = os.path.join(OOTB, "modeller/duplex_rules.db"), os.path.join(OOTB, "buildings/Duplex_extracted.db")
    for p in (T_RULES, T_EXT, D_RULES, D_EXT):
        if not os.path.exists(p) or os.path.getsize(p) < 100000:
            verdict("SETUP", "INCONCLUSIVE", f"missing or stub: {p}")
            print(f"§WMBD-VERDICT INCONCLUSIVE pass={P} fail={F} inconclusive={I}")
            return 2

    # M1 Terminal: the re-mined bindings equal the shipped ones
    con = sqlite3.connect("file:" + T_RULES + "?mode=ro", uri=True)
    shipped = con.execute("SELECT disc, ifc_class, geometry_hash, n_of, n_total FROM rule_mesh_binding ORDER BY 1,2").fetchall()
    con.close()
    rows, lines, _ = mine(new, T_RULES, T_EXT, tmp, "t_new")
    got = [r[:5] for r in rows]
    sole = [f"{r[0]}/{r[1]}" for r in rows if r[5].endswith(":sole-claimant")]
    diff = sorted(set(shipped) ^ set(got))
    verdict("M1 Terminal unchanged", "INCONCLUSIVE" if not shipped else ("PASS" if not diff else "FAIL"),
            f"shipped={len(shipped)} mined={len(got)} soleClaimant={len(sole)} {sole} diff={[d[:2] for d in diff][:6]}")

    # M2 Duplex: every binding's mesh comes from its own discipline, or is a logged sole claimant
    rows, lines, discs = mine(new, D_RULES, D_EXT, tmp, "d_new")
    bad, own, solo = [], 0, 0
    for disc, cls, gh, n_of, n_tot, prov in rows:
        lab = labels_of(D_EXT, cls, gh)
        if prov.endswith(":sole-claimant"):
            solo += 1
            if any(l in discs and l != disc for l in lab): bad.append((disc, cls, lab))
        elif lab.get(disc, 0) > 0: own += 1
        else: bad.append((disc, cls, lab))
    for l in lines:
        if "MESHBIND-PROJ" in l and "rule_frame_ref" not in l and "z_datum" not in l: print("   new| " + l[:400])
    print("   new rows| " + "; ".join(f"{r[0]}/{r[1]} {r[3]}of{r[4]}" for r in rows))
    verdict("M2 Duplex binds within the discipline", "INCONCLUSIVE" if not rows else ("PASS" if not bad else "FAIL"),
            f"bindings={len(rows)} ownDiscipline={own} soleClaimant={solo} crossDiscipline={bad}")

    # M3 red control: the miner on origin/master crosses disciplines on the same input
    if not old:
        verdict("M3 red control", "INCONCLUSIVE", "origin/master miner not readable")
    else:
        orow, _, odiscs = mine(old, D_RULES, D_EXT, tmp, "d_old")
        cross = []
        for disc, cls, gh, n_of, n_tot, prov in orow:
            lab = labels_of(D_EXT, cls, gh)
            if not lab.get(disc) and any(l in odiscs and l != disc for l in lab): cross.append(f"{disc}/{cls} mesh from {lab}")
        print("   old rows| " + "; ".join(f"{r[0]}/{r[1]} {r[3]}of{r[4]}" for r in orow))
        verdict("M3 red control (old miner crosses disciplines)", "PASS" if cross else "FAIL", f"oldBindings={len(orow)} cross={cross}")
    shutil.rmtree(tmp, ignore_errors=True)
    print(f"§WMBD-VERDICT {'FAIL' if F else 'INCONCLUSIVE' if I else 'PASS'} pass={P} fail={F} inconclusive={I}")
    return 1 if F else 2 if I else 0


if __name__ == "__main__":
    sys.exit(main())
