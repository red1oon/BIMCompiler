#!/usr/bin/env python3
"""
prepare_large_ifc.py — ONE entry point that makes an oversized IFC processable.

WHY THIS EXISTS (read before changing it — two levers were already tried and one was given up):
  The naive route — feed the whole file to extractIFCtoDB.py — was tried on KUL070 OVERALL.ifc
  (2045 MB) and ABANDONED: systemd-oomd killed it at 44,000/66,214 elements and took the whole
  terminal with it (IFC_LARGE_PRIVATE_STRESS_TEST.md §CRASH). The browser route hits a harder wall:
  the wasm32 address space caps at 4,294,901,760 bytes and OVERALL.ifc spends ~3.4 GB of it on PARSE
  ALONE, so geometry building dies at element #3,956 of 66,214 — quietly, with no error (§KUL009).

  The obvious fix — "strip the redundant psets" — was ALSO already tried and MEASURED DEAD for that
  file: strip_ifc_psets.py was written, superseded by strip_ifc_nonessential.py, then measured at
  psets = 1.0% of OVERALL.ifc, file -1.8%. 95.6% of it is raw tessellation (IFCPOLYLOOP 25.6% /
  IFCFACEOUTERBOUND 25.4% / IFCFACE 25.4% / IFCCARTESIANPOINT 19.2%). You cannot strip the geometry
  you came for. On CONTAINMENT.ifc the same lever gives -45.2%, because THERE the bloat really is
  metadata (psets 19.4% + ports 13.6%).

  So: THE LEVER MUST BE CHOSEN FROM THE HISTOGRAM, NEVER ASSUMED. That is this script's whole job.
  It invents nothing — it reads the entity histogram, picks strip and/or split, and drives the two
  existing proven tools.

WHAT IT DOES
  1. §PLAN   histogram both strip tiers (strip_ifc_nonessential.py --stats-only) — is the bloat
             METADATA or GEOMETRY?
  2. §STRIP  only if the model tier can remove >= --strip-min-pct of entities. Otherwise it SKIPS
             and prints the measured percentage that justifies skipping.
  3. §SPLIT  only if still over --target-part-mb. Part count is derived from the measured wasm
             budget, not guessed.
  4. §FIXPOINT  escalates --max-rounds until the splitter reports `added=0`. It NEVER accepts
             `§CLOSURE WARNING: hit --max-rounds`. That warning is not cosmetic: at the default 12
             rounds, OVERALL.ifc was short 1,148 IFCCARTESIANPOINT/IFCDIRECTION leaves and the
             geometry of 523 of 66,214 elements silently changed (§KUL011).
  5. §MANIFEST  every output part with its size + RAM forecast, ready for extractIFCtoDB.py.

MEASURED CONSTANTS (§KUL009 / §KUL011 — change only with a new measurement)
  wasm32 ceiling         4,294,901,760 B
  2045 MB source         ->  ~3.4 GB wasm on parse alone,  3,955 / 66,214 elements survive
  254-461 MB part        ->  0.8-1.4 GB,  100% of elements survive, 0 skips  (8/8 parts)
  => 500 MB/part is the default target: proven to fit with >2x headroom.

Usage
  prepare_large_ifc.py IN.ifc OUTDIR [--prefix NAME] [--target-part-mb 500]
                       [--strip-min-pct 15] [--max-parts 32] [--plan-only]

Then, per part:
  python3 DAGCompiler/python/extractIFCtoDB.py --ifc PART.ifc -o PART.db --building-type NAME
  (do NOT pass --library — it needs a pre-migrated component_library.db and aborts without one)
"""
import os
import re
import subprocess
import sys
import math

HERE = os.path.dirname(os.path.abspath(__file__))
STRIP = os.path.join(HERE, 'strip_ifc_nonessential.py')
SPLIT = os.path.join(HERE, 'split_ifc_by_discipline.py')

WASM_CEILING_B = 4294901760          # 2**32 - 65536, measured verbatim from the failing import
BYTES_PER_ENTITY = 520               # fleet-measured ifcopenshell residency


EXTRACT = os.path.join(HERE, 'extractIFCtoDB.py')


def _log(m):
    print(m, flush=True)


def merge_part_dbs(dbs, out, scope=None):
    """Merge extracted part DBs into one. Witness W-KUL-DB-MERGE.

    A plain `INSERT OR IGNORE` across parts is WRONG TWICE and both modes were hit for real:
      1. elements_meta.id is INTEGER PRIMARY KEY and per-part sequential -> ids collide and rows are
         silently DROPPED (observed: element_transforms=87,333 beside elements_meta=14,191 — a DB
         that looks fine until you join it). Fix: omit `id`, dedup on `guid UNIQUE`.
      2. datum_plane.datum_id is per-part sequential and means a DIFFERENT coord in each part, while
         rel_anchored/rel_spans reference it — a naive merge re-points ~500k relations at the wrong
         planes. Fix: offset datum_id per part so each part's relations keep their own datums.
      3. elements_rtree is a VIRTUAL table keyed on elements_meta.id — REBUILD it, never copy it,
         and never touch its _node/_parent/_rowid shadows.
    """
    import sqlite3
    import shutil
    if os.path.exists(out):
        os.remove(out)
    shutil.copy(dbs[0], out)
    c = sqlite3.connect(out)
    c.execute("PRAGMA foreign_keys=OFF")
    SHADOW = {'elements_rtree', 'elements_rtree_node', 'elements_rtree_parent', 'elements_rtree_rowid'}
    tables = [r[0] for r in c.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        if r[0] not in SHADOW]
    DATUM_DEP = {'datum_plane': ['datum_id'], 'rel_anchored': ['datum_id'],
                 'rel_spans': ['datum_lo_id', 'datum_hi_id']}

    def cols(t, schema='main'):
        return [r[1] for r in c.execute('PRAGMA %s.table_info("%s")' % (schema, t))]

    for p in dbs[1:]:
        c.execute("ATTACH ? AS src", (p,))
        off = c.execute("SELECT COALESCE(MAX(datum_id),0) FROM datum_plane").fetchone()[0]
        for t in tables:
            mc, sc = cols(t), cols(t, 'src')
            if not sc:
                continue
            use = [x for x in mc if x in sc]
            if t == 'elements_meta':
                use = [x for x in use if x != 'id']
            sel = ['"%s" + %d' % (x, off) if x in DATUM_DEP.get(t, []) else '"%s"' % x for x in use]
            c.execute('INSERT OR IGNORE INTO "%s" (%s) SELECT %s FROM src."%s"'
                      % (t, ','.join('"%s"' % x for x in use), ','.join(sel), t))
        c.commit()
        c.execute("DETACH src")

    warn = []
    if scope:
        keep = [s.strip().upper() for s in scope.split(',')]
        q = ','.join('?' * len(keep))
        before = c.execute("SELECT COUNT(*) FROM elements_meta").fetchone()[0]
        gone = [r[0] for r in c.execute(
            "SELECT guid FROM elements_meta WHERE UPPER(discipline) NOT IN (%s)" % q, keep)]
        c.execute("DELETE FROM elements_meta WHERE UPPER(discipline) NOT IN (%s)" % q, keep)
        for t, col in (('element_instances', 'guid'), ('element_transforms', 'guid'),
                       ('rel_anchored', 'element_guid'), ('rel_spans', 'element_guid'),
                       ('rel_contained_in_space', 'element_guid')):
            if cols(t):
                c.execute('DELETE FROM "%s" WHERE "%s" NOT IN (SELECT guid FROM elements_meta)' % (t, col))
        c.execute("DELETE FROM rel_adjacency WHERE a_guid NOT IN (SELECT guid FROM elements_meta)"
                  " OR b_guid NOT IN (SELECT guid FROM elements_meta)")
        c.execute("DELETE FROM base_geometries WHERE geometry_hash NOT IN"
                  " (SELECT geometry_hash FROM element_instances)")
        c.commit()
        warn.append('--scope %s kept %d of %d elements' % (scope, before - len(gone), before))

    # ── §KUL001: the extractor never writes elements_meta.building, and writes no
    # project_metadata. Without them the viewer's centres query fails with
    # `no such column: m.building` -> §CENTRES_RESULT rows=0 -> §BOOTSTRAP centres=0, and
    # A.startStreaming() takes a SILENT early return: the DB loads, reports its full size, and
    # renders NOTHING. It reads like a size/perf problem and is neither.
    # The self-heal patch route (viewer/buildings/patches/*.sql) does NOT cover this case — an
    # opened local file arrives as `import://…` and the loader dies with
    # `URL scheme "import" is not supported`. So it has to be written into the DB, here.
    bld = 'T0_' + os.path.splitext(os.path.basename(out))[0].replace('_complete', '')
    if 'building' not in cols('elements_meta'):
        c.execute("ALTER TABLE elements_meta ADD COLUMN building TEXT")
    c.execute("UPDATE elements_meta SET building=? WHERE building IS NULL", (bld,))
    c.execute("CREATE TABLE IF NOT EXISTS project_metadata (key TEXT PRIMARY KEY, value TEXT)")
    for k, v in (('building_name', bld), ('true_north_angle', '0')):
        c.execute("INSERT OR REPLACE INTO project_metadata (key,value) VALUES (?,?)", (k, v))
    c.commit()
    warn.append('§KUL001 applied: elements_meta.building=%s + project_metadata '
                '(without these the viewer loads the DB and renders NOTHING, silently)' % bld)

    # ── R-tree: CARRY THE PRISTINE AABB ACROSS, never recompute it from center ± bbox/2.
    # elements_rtree is virtual and keyed on elements_meta.id, and ids are reassigned by this merge,
    # so it must be rebuilt — but rebuilt from each part's OWN rtree rows, joined by guid.
    # WHY (measured 2026-07-30, and a first cut of this function got it wrong):
    # `element_transforms.center_*` is the placement-matrix TRANSLATION (extractIFCtoDB.py
    # `center = mat4[:3, 3]`), i.e. the element's placement ORIGIN — NOT the centre of its AABB.
    # The gap between them is real and data-dependent: median 0.11 m on OVERALL_P00 (14,183 rows,
    # only 23.9% within 10 mm) and median 11.31 m on KUL_CONTAINMENT (21,009 rows, 3.6% within
    # 10 mm — cable-ladder placements sit far from their geometry). `bbox_*` is only the EXTENT
    # (maxK-minK, verified exact to 0.5 mm on 100% of rows), so center ± bbox/2 puts the box in the
    # wrong PLACE while giving it the right SIZE. That silently corrupts every spatial query built
    # on the r-tree (adjacency derivation, nearest-neighbour, picking) without touching rendering,
    # which uses center + origin-relative vertices and stays correct — so it would not be visible
    # on screen. Rendering being fine is NOT evidence the r-tree is fine.
    c.execute("DELETE FROM elements_rtree")
    carried = 0
    for p in dbs:
        c.execute("ATTACH ? AS src", (p,))
        cur = c.execute("""INSERT INTO elements_rtree (id, minX, maxX, minY, maxY, minZ, maxZ)
            SELECT dm.id, sr.minX, sr.maxX, sr.minY, sr.maxY, sr.minZ, sr.maxZ
            FROM src.elements_rtree sr
            JOIN src.elements_meta sm ON sm.id = sr.id
            JOIN main.elements_meta dm ON dm.guid = sm.guid
            WHERE dm.id NOT IN (SELECT id FROM elements_rtree)""")
        carried += cur.rowcount if cur.rowcount and cur.rowcount > 0 else 0
        c.commit()
        c.execute("DETACH src")
    _nm = c.execute("SELECT COUNT(*) FROM elements_meta").fetchone()[0]
    _nr = c.execute("SELECT COUNT(*) FROM elements_rtree").fetchone()[0]
    if _nr != _nm:
        warn.append('R-TREE INCOMPLETE %d rows for %d elements — spatial queries will silently '
                    'miss the difference' % (_nr, _nm))
    else:
        warn.append('r-tree carried pristine AABBs for %d/%d elements (NOT recomputed from '
                    'center+-bbox/2 — see the comment for why that is wrong)' % (_nr, _nm))
    ok = c.execute("PRAGMA integrity_check").fetchone()[0]
    if ok != 'ok':
        warn.append('INTEGRITY=' + ok)
    for label, q2 in (
        ('rel_anchored->datum_plane', "SELECT COUNT(*) FROM rel_anchored r LEFT JOIN datum_plane d ON d.datum_id=r.datum_id WHERE d.datum_id IS NULL"),
        ('rel_spans->datum_plane', "SELECT COUNT(*) FROM rel_spans r LEFT JOIN datum_plane d ON d.datum_id=r.datum_lo_id WHERE d.datum_id IS NULL"),
        ('element_instances->base_geometries', "SELECT COUNT(*) FROM element_instances i LEFT JOIN base_geometries g ON g.geometry_hash=i.geometry_hash WHERE g.geometry_hash IS NULL"),
        ('element_transforms<->elements_meta', "SELECT (SELECT COUNT(*) FROM element_transforms t LEFT JOIN elements_meta m ON m.guid=t.guid WHERE m.guid IS NULL) + (SELECT COUNT(*) FROM elements_meta m LEFT JOIN element_transforms t ON t.guid=m.guid WHERE t.guid IS NULL)"),
    ):
        n = c.execute(q2).fetchone()[0]
        if n:
            warn.append('ORPHAN %s = %d' % (label, n))
    # datum_plane is N partial cadence derivations, not one whole-model one — say so, don't bury it.
    dn = c.execute("SELECT COUNT(*) FROM datum_plane").fetchone()[0]
    if len(dbs) > 1:
        warn.append('datum_plane=%d is %d PARTIAL cadence derivations, not one whole-model one — '
                    're-derive if a walker needs true datums (§KUL012)' % (dn, len(dbs)))
    n = c.execute("SELECT COUNT(*) FROM elements_meta").fetchone()[0]
    c.execute("VACUUM")
    c.close()
    return n, warn


def _run(cmd, log_path=None):
    """Run a child tool. Log Mandate: always capture to a file and return the text — never judge a
    run by its exit code alone."""
    p = subprocess.run(cmd, capture_output=True, text=True)
    out = p.stdout + p.stderr
    if log_path:
        with open(log_path, 'w') as f:
            f.write(out)
    return p.returncode, out


def _mb(path):
    return os.path.getsize(path) / 1048576.0


def stats(src, tier):
    """Return (entities, candidates, candidate_pct, histogram list) for one strip tier."""
    rc, out = _run([sys.executable, STRIP, src, '--stats-only', '--tier', tier])
    ents = cands = 0
    pct = 0.0
    hist = []
    for line in out.splitlines():
        m = re.search(r'§PASS1 entities=([\d,]+)', line)
        if m:
            ents = int(m.group(1).replace(',', ''))
        m = re.search(r'§CANDIDATES ([\d,]+) \(([\d.]+)% of entities\)', line)
        if m:
            cands = int(m.group(1).replace(',', ''))
            pct = float(m.group(2))
        m = re.search(r'§HIST (\S+)\s+([\d,]+)\s+([\d.]+)%', line)
        if m:
            hist.append((m.group(1), int(m.group(2).replace(',', '')), float(m.group(3))))
    if not ents:
        _log('  §STATS_FAIL tier=%s — could not parse §PASS1. Child output:' % tier)
        _log(out[-2000:])
        sys.exit(2)
    return ents, cands, pct, hist


# Entity families that are GEOMETRY. If these dominate, stripping metadata cannot help — this is the
# measured lesson from OVERALL.ifc, encoded so the script cannot repeat it.
GEOM_FAMILY = ('IFCPOLYLOOP', 'IFCFACEOUTERBOUND', 'IFCFACE', 'IFCCARTESIANPOINT',
               'IFCFACETEDBREP', 'IFCCLOSEDSHELL', 'IFCTRIANGULATEDFACESET',
               'IFCPOLYGONALFACESET', 'IFCDIRECTION', 'IFCAXIS2PLACEMENT3D')


def main():
    args = sys.argv[1:]
    if len(args) < 2 or args[0] in ('-h', '--help'):
        print(__doc__)
        sys.exit(0)
    src, outdir = args[0], args[1]

    def opt(name, default, cast=str):
        return cast(args[args.index(name) + 1]) if name in args else default

    prefix = opt('--prefix', os.path.splitext(os.path.basename(src))[0].replace(' ', '_'))
    target_mb = opt('--target-part-mb', 500.0, float)
    strip_min = opt('--strip-min-pct', 15.0, float)
    max_parts = opt('--max-parts', 32, int)
    plan_only = '--plan-only' in args

    os.makedirs(outdir, exist_ok=True)
    _log('=' * 72)
    _log('§PREPARE START  %s  (%.1f MB)' % (src, _mb(src)))
    _log('=' * 72)

    # ── 1. PLAN — which lever? ────────────────────────────────────────────────
    ents, m_cands, m_pct, hist = stats(src, 'meta')
    _, d_cands, d_pct, _ = stats(src, 'model')
    geom_pct = sum(p for n, _, p in hist if n in GEOM_FAMILY)
    _log('  §PLAN entities=%s  ram_forecast=%.1f GB' % (format(ents, ','), ents * BYTES_PER_ENTITY / 2**30))
    _log('  §PLAN strippable: tier=meta %.1f%%  tier=model %.1f%%' % (m_pct, d_pct))
    _log('  §PLAN geometry families in top histogram = %.1f%%' % geom_pct)
    for n, c, p in hist[:6]:
        _log('    §HIST %-32s %10s %5.1f%%' % (n, format(c, ','), p))

    if d_pct >= strip_min:
        _log('  §LEVER STRIP+SPLIT — metadata is %.1f%% of the file (>= %.1f%% threshold)'
             % (d_pct, strip_min))
    else:
        _log('  §LEVER SPLIT ONLY — stripping would remove just %.1f%% (< %.1f%%); the bloat is '
             'GEOMETRY (%.1f%%), and you cannot strip the geometry you came for.'
             % (d_pct, strip_min, geom_pct))

    work = src
    # ── 2. STRIP (conditional) ───────────────────────────────────────────────
    if d_pct >= strip_min:
        stripped = os.path.join(outdir, prefix + '_model.ifc')
        _log('  §STRIP -> %s' % stripped)
        if plan_only:
            _log('    (plan-only, not run — the stripped file would be the input to everything below)')
            work = stripped   # so the size/split decision below reports on the right file
        else:
            rc, out = _run([sys.executable, STRIP, src, stripped, '--tier', 'model', '--sweep', '3'],
                           os.path.join(outdir, 'strip.log'))
            if rc != 0 or not os.path.exists(stripped):
                _log('  §STRIP_FAIL rc=%d — see strip.log' % rc)
                sys.exit(3)
            _log('  §STRIP DONE %.1f MB -> %.1f MB (-%.1f%%)'
                 % (_mb(src), _mb(stripped), 100 * (1 - _mb(stripped) / _mb(src))))
            work = stripped

    # ── 3. SPLIT (conditional) ───────────────────────────────────────────────
    cur_mb = _mb(work) if os.path.exists(work) else _mb(src) * (1 - d_pct / 100.0)
    if cur_mb <= target_mb:
        _log('  §SPLIT NOT NEEDED — %.1f MB is already under the %.0f MB/part target.' % (cur_mb, target_mb))
        _log('§PREPARE DONE  extract %s directly.' % work)
        return

    nparts = min(max_parts, max(2, math.ceil(cur_mb / target_mb)))
    _log('  §SPLIT %.1f MB / %.0f MB target -> --parts %d' % (cur_mb, target_mb, nparts))
    if plan_only:
        _log('§PREPARE PLAN-ONLY DONE')
        return

    # ── 4. FIXPOINT — escalate rounds until added=0. Never accept the WARNING. ─
    rounds = 18
    for attempt in range(4):
        log_path = os.path.join(outdir, 'split_r%d.log' % rounds)
        rc, out = _run([sys.executable, SPLIT, work, outdir, '--prefix', prefix,
                        '--parts', str(nparts), '--max-rounds', str(rounds)], log_path)
        added = re.findall(r'§CLOSURE round=(\d+) added=([\d,]+)', out)
        warned = 'without fixpoint' in out
        last = ('%s@round%s' % (added[-1][1], added[-1][0])) if added else 'none'
        _log('  §FIXPOINT max_rounds=%d  last=%s  warning=%s' % (rounds, last, warned))
        if rc == 0 and not warned:
            _log('  §FIXPOINT REACHED — closure is complete (added=0). Parts are whole.')
            break
        if rc != 0:
            _log('  §SPLIT_FAIL rc=%d — see %s' % (rc, log_path))
            sys.exit(4)
        rounds *= 2
        _log('  §FIXPOINT NOT reached — retrying at --max-rounds %d. (Accepting the warning is how '
             '523 of 66,214 elements silently changed geometry on OVERALL.ifc — see §KUL011.)' % rounds)
    else:
        _log('  §FIXPOINT GIVING UP after %d rounds — parts may be incomplete, DO NOT SHIP THEM.' % rounds)
        sys.exit(5)

    # ── 5. MANIFEST ──────────────────────────────────────────────────────────
    parts = sorted(f for f in os.listdir(outdir)
                   if f.startswith(prefix + '_P') and f.endswith('.ifc'))
    _log('  §MANIFEST %d parts:' % len(parts))
    total = 0.0
    for f in parts:
        p = os.path.join(outdir, f)
        mb = _mb(p)
        total += mb
        ok = 'OK' if mb <= target_mb * 1.1 else 'OVER'
        _log('    %-44s %8.1f MB   %s' % (f, mb, ok))
    _log('  §MANIFEST total %.1f MB across %d parts (largest decides RAM)' % (total, len(parts)))

    if '--no-extract' in args:
        _log('§PREPARE DONE (--no-extract) — next: extractIFCtoDB.py per part (no --library), then merge.')
        return

    # ── 6. EXTRACT every part ────────────────────────────────────────────────
    dbs = []
    for i, f in enumerate(parts, 1):
        p = os.path.join(outdir, f)
        db = os.path.splitext(p)[0] + '.db'
        _log('  §EXTRACT %d/%d %s' % (i, len(parts), f))
        rc, out = _run([sys.executable, EXTRACT, '--ifc', p, '-o', db,
                        '--building-type', prefix], os.path.splitext(p)[0] + '.extract.log')
        # Log Mandate: the exit code is not the evidence — read the proof lines.
        proof = re.search(r'§PROOF RESULT: (\d+) PASS, (\d+) FAIL', out)
        fails = re.search(r'§PROOF \S+\s+elements=(\d+)\s+failed=(\d+)', out)
        if rc != 0 or not proof or int(proof.group(2)) != 0:
            _log('    §EXTRACT_FAIL rc=%d proof=%s — see the .extract.log' % (rc, proof.group(0) if proof else 'absent'))
            sys.exit(6)
        _log('    §PROOF %s PASS, %s FAIL   elements=%s failed=%s   %.1f MB'
             % (proof.group(1), proof.group(2), fails.group(1) if fails else '?',
                fails.group(2) if fails else '?', _mb(db)))
        dbs.append(db)

    # ── 7. MERGE into one DB ─────────────────────────────────────────────────
    merged = os.path.join(outdir, prefix + '_complete.db')
    _log('  §MERGE %d part DBs -> %s' % (len(dbs), os.path.basename(merged)))
    n, warn = merge_part_dbs(dbs, merged, scope=opt('--scope', None))
    _log('  §MERGE DONE elements=%s  %.0f MB' % (format(n, ','), _mb(merged)))
    for w in warn:
        _log('  §MERGE_NOTE ' + w)
    _log('§PREPARE DONE -> %s' % merged)


if __name__ == '__main__':
    main()
