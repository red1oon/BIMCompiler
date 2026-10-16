#!/usr/bin/env python3
"""
split_ifc_by_discipline.py — split one oversized IFC into per-discipline sub-files, streaming.

WHY: ifcopenshell loads the WHOLE model before a single element can be read (~520 bytes per STEP
entity, fleet-measured). KUL OVERALL.ifc — 2.0GB, 37,716,099 entities, ~19GB resident — OOM-killed
extractIFCtoDB.py twice, at 44,000 and 45,000 of 66,214 elements, and stripping non-model data only
recovers 1.4% of it because 95.6% of that file IS raw tessellation
(IFCPOLYLOOP 25.6% / IFCFACEOUTERBOUND 25.4% / IFCFACE 25.4% / IFCCARTESIANPOINT 19.2%).
You cannot strip the geometry you came for. You CAN load it in pieces.

THIS IS THE FLEET CONVENTION, not a workaround. Every resident in this pipeline was onboarded
per-discipline: LTU_AHouse = 9 files (largest ARC 172.9MB / 3.53M entities / ~1.8GB resident, yet
122,667 elements — 1.85x MORE than OVERALL), Hospital = 7 files (largest 76.6MB), Clinic = 5
(largest 53.2MB). KUL OVERALL.ifc is the first single merged federation file ever fed in whole, and
the only one that has ever failed. Its own siblings CONTAINMENT.ifc / EQUIPMENT.ifc are exactly
these per-discipline parts, and both extracted clean.

MEMORY DESIGN — the whole point is to never do what ifcopenshell does. This script holds a BITSET
per part (1 bit per entity id), not a parsed model: ~4.7MB per part for a 37.7M-entity file,
independent of file size. No id->type dict, no reference graph in RAM. Everything else is
sequential I/O.

ALGORITHM
  pass 1   locate every IfcProduct declaration, map its class -> discipline via extractIFCtoDB's
           own DISCIPLINE_MAP (never a private copy), and seed that part's bitset. Entities that
           must appear in EVERY part (units, contexts, the spatial chain, materials, styles) are
           seeded into all of them.
  rounds   repeatedly scan the file; for every line already marked in a part, mark everything it
           references. Geometry graphs are 6-10 levels deep (product -> shape -> representation ->
           items -> faces -> loops -> points), so this reaches fixpoint in ~10 rounds. Each round
           is one sequential read; the loop stops early the moment a round adds nothing.
  write    one output file per part: original header verbatim, then every marked line in original
           order, then ENDSEC/END-ISO. Ids are never renumbered, so a part is directly diffable
           against the source and the parts stay mutually consistent.

The parts share the source's coordinate system, so the resulting DBs co-register — the same way
KUL CONTAINMENT and EQUIPMENT already agree on site offset to within 10m.

Usage:
    split_ifc_by_discipline.py IN.ifc OUTDIR [--prefix NAME] [--max-rounds N] [--dry-run]

Then extract each part normally, e.g.:
    for p in OUTDIR/NAME_*.ifc; do
        python3 DAGCompiler/python/extractIFCtoDB.py --ifc "$p" -o "${p%.ifc}.db" \
                --building-type "$(basename "${p%.ifc}")"
    done
"""
import os
import re
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

RE_DECL = re.compile(rb'^#(\d+)\s*=\s*([A-Z0-9_]+)\s*\(')
RE_REF = re.compile(rb'#(\d+)')

# Present in EVERY part: shared context the extractor needs to make sense of any element.
SHARED_TYPES = {
    'IFCPROJECT', 'IFCSITE', 'IFCBUILDING', 'IFCBUILDINGSTOREY', 'IFCSPACE',
    'IFCRELAGGREGATES',
    'IFCSIUNIT', 'IFCUNITASSIGNMENT', 'IFCCONVERSIONBASEDUNIT', 'IFCMEASUREWITHUNIT',
    'IFCDIMENSIONALEXPONENTS', 'IFCMONETARYUNIT',
    'IFCGEOMETRICREPRESENTATIONCONTEXT', 'IFCGEOMETRICREPRESENTATIONSUBCONTEXT',
    'IFCAXIS2PLACEMENT3D', 'IFCDIRECTION', 'IFCCARTESIANPOINT',   # context placement roots
    'IFCOWNERHISTORY', 'IFCPERSONANDORGANIZATION', 'IFCPERSON', 'IFCORGANIZATION',
    'IFCAPPLICATION',
    'IFCMATERIAL', 'IFCMATERIALLAYER', 'IFCMATERIALLAYERSET', 'IFCMATERIALLAYERSETUSAGE',
    'IFCMATERIALLIST', 'IFCMATERIALPROFILESETUSAGE', 'IFCMATERIALCONSTITUENTSET',
    'IFCMATERIALDEFINITIONREPRESENTATION',
    'IFCSURFACESTYLE', 'IFCSURFACESTYLERENDERING', 'IFCSURFACESTYLESHADING',
    'IFCPRESENTATIONSTYLEASSIGNMENT', 'IFCSTYLEDREPRESENTATION',
    'IFCCOLOURRGB',
}

# §FANOUT — relations that name MANY elements in ONE line. Copying these into every part is what
# makes a split useless: IfcRelContainedInSpatialStructure lists every element of a storey (observed
# in KUL OVERALL.ifc: a single line 219,990 characters long, ~20,000 refs), so seeding it into both
# parts drags the whole model — and all its geometry — into both. Measured cost of getting this
# wrong: a 2045MB source split into two parts of 1977MB and 1976MB, i.e. no saving at all.
# These are therefore NEVER seeded and NEVER contribute to the closure; at WRITE time each part
# emits its own copy with the element list filtered down to the ids that part actually owns.
FANOUT_RELS = {
    'IFCRELCONTAINEDINSPATIALSTRUCTURE', 'IFCRELASSOCIATESMATERIAL',
    'IFCRELDEFINESBYTYPE', 'IFCRELASSIGNSTOGROUP', 'IFCRELDEFINESBYPROPERTIES',
}
# §BACKREF — points AT geometry rather than being pointed at, so sharing it pulls the target in.
# Emitted only when the item it decorates is already in the part (64,014 of them in KUL OVERALL).
BACKREF_TYPES = {'IFCSTYLEDITEM'}
RE_SETLIST = re.compile(rb'\(((?:\s*#\d+\s*,?)+)\)')
# SHARED_TYPES entries that are far too numerous to broadcast wholesale — they get in only via
# the reference closure of something a part actually owns.
SHARED_BY_CLOSURE_ONLY = {'IFCAXIS2PLACEMENT3D', 'IFCDIRECTION', 'IFCCARTESIANPOINT'}


def _log(m):
    print(m, flush=True)


class Bits(object):
    """1 bit per entity id. 37.7M ids = 4.7MB — the reason this scales where a parsed model can't."""

    __slots__ = ('b', 'n')

    def __init__(self, maxid):
        self.n = maxid + 1
        self.b = bytearray((maxid >> 3) + 2)

    def set(self, i):
        self.b[i >> 3] |= (1 << (i & 7))

    def get(self, i):
        return (self.b[i >> 3] >> (i & 7)) & 1

    def count(self):
        return sum(bin(x).count('1') for x in self.b)


def _load_disc_map():
    """Reuse extractIFCtoDB's own DISCIPLINE_MAP — never a private copy that can drift."""
    try:
        import extractIFCtoDB as X
        dm = getattr(X, 'DISCIPLINE_MAP', None)
        if dm:
            return dm, getattr(X, 'NON_GEOMETRIC_CLASSES', set())
    except Exception as e:
        _log('  §DISC_MAP_IMPORT_FAIL %s — falling back to single-part split' % e)
    return None, set()


def _product_types(schema_name):
    """Every IfcProduct subtype, from IfcOpenShell's own SCHEMA — not the file.

    §WHY-SCHEMA: DISCIPLINE_MAP only names the classes with a NON-default discipline;
    extractIFCtoDB's infer_discipline() falls back to 'ARC' for everything else. Splitting on the
    map alone therefore silently drops every unmapped product — on KUL OVERALL.ifc that is
    IfcBuildingElementProxy, i.e. 39,254 of 66,214 elements (59% of the model) missing without a
    single warning. Reading the schema costs no file parse and no RAM: it is the declaration table
    IfcOpenShell already ships, so this stays a streaming script.
    """
    import ifcopenshell.ifcopenshell_wrapper as W
    subs = set()

    def walk(decl):
        for t in decl.subtypes():
            subs.add(t.name())
            walk(t)
    walk(W.schema_by_name(schema_name).declaration_by_name('IfcProduct'))
    return subs


def _detect_schema(src):
    """Read FILE_SCHEMA from the header only — a few KB, never the body."""
    with open(src, 'rb') as f:
        for _ in range(200):
            line = f.readline()
            if not line:
                break
            u = line.upper()
            if b'FILE_SCHEMA' in u:
                m = re.search(rb"'([A-Z0-9_]+)'", u)
                if m:
                    return m.group(1).decode('ascii')
    return 'IFC2X3'


def main():
    args = sys.argv[1:]
    if len(args) < 2:
        _log(__doc__)
        return 2
    src, outdir = args[0], args[1]
    prefix = args[args.index('--prefix') + 1] if '--prefix' in args else \
        os.path.splitext(os.path.basename(src))[0].replace(' ', '_')
    max_rounds = int(args[args.index('--max-rounds') + 1]) if '--max-rounds' in args else 12
    nparts = int(args[args.index('--parts') + 1]) if '--parts' in args else 0
    dry = '--dry-run' in args

    disc_map, non_geo = _load_disc_map()
    if disc_map is None:
        _log('ERROR: could not import DISCIPLINE_MAP from extractIFCtoDB.py — refusing to guess.')
        return 2

    _log('=' * 72)
    _log('§SPLIT START')
    _log('=' * 72)
    _log('  §IN     %s  (%.1f MB)' % (src, os.path.getsize(src) / 1048576.0))
    _log('  §OUT    %s/%s_%s.ifc%s'
         % (outdir, prefix, 'P<NN>' if nparts else '<DISC>', '   (DRY RUN)' if dry else ''))
    if nparts:
        _log('  §MODE   balanced round-robin, %d parts (discipline axis overridden)' % nparts)

    # ── pass 1: header, max id, product -> discipline, shared seeds ──────────
    schema = _detect_schema(src)
    prods = _product_types(schema)
    # Products the extractor itself skips (no body) must not seed a part.
    prods = {c for c in prods if c not in non_geo}
    # UPPERCASE lookup -> discipline, mirroring infer_discipline(): mapped class wins, else 'ARC'.
    dm_upper = {c.upper(): disc_map.get(c, 'ARC') for c in prods}
    _log('  §SCHEMA %s  product_types=%d (non-geometric skipped=%d)'
         % (schema, len(prods), len(non_geo)))
    t0 = time.time()
    header = []
    maxid = 0
    seeds = {}          # part -> list of ids
    counts_all = []     # §BALANCED round-robin cursor
    shared = []
    total = 0
    counts = {}
    in_data = False
    with open(src, 'rb') as f:
        for line in f:
            if not in_data:
                header.append(line)
                if line.strip().upper().startswith(b'DATA'):
                    in_data = True
                continue
            m = RE_DECL.match(line)
            if not m:
                continue
            total += 1
            i = int(m.group(1))
            if i > maxid:
                maxid = i
            t = m.group(2).decode('ascii', 'replace')
            if t in FANOUT_RELS or t in BACKREF_TYPES:
                continue                      # handled at write time, never seeded (see §FANOUT)
            if t in SHARED_TYPES:
                if t not in SHARED_BY_CLOSURE_ONLY:
                    shared.append(i)
                continue
            # §PERF: DISCIPLINE_MAP is keyed in CamelCase, STEP declares UPPERCASE. Fold it ONCE
            # (dm_upper, built before the loop) — folding per line is 37.7M x len(map) comparisons.
            d = dm_upper.get(t)
            if d is None:
                continue
            if nparts:
                # §BALANCED — discipline is the WRONG axis when one class carries all the geometry.
                # Measured on KUL OVERALL.ifc: splitting ARC|MEP gave 1924MB (~17.4GB RAM) vs 76MB
                # (~0.6GB) because 26,078 tessellated IfcBuildingElementProxy equipment objects hold
                # 95.5% of the entities, while 26,960 parametric MEP products hold 6%. Round-robin
                # over products in file order spreads that weight evenly instead.
                d = 'P%02d' % (len(counts_all) % nparts)
                counts_all.append(1)
            seeds.setdefault(d, []).append(i)
            counts[d] = counts.get(d, 0) + 1

    _log('  §PASS1 entities=%s maxid=%s shared=%s  %.1fs'
         % (format(total, ','), format(maxid, ','), format(len(shared), ','), time.time() - t0))
    if not seeds:
        _log('  §SPLIT NOOP — no products matched DISCIPLINE_MAP')
        return 1
    for d in sorted(counts, key=lambda k: -counts[k]):
        _log('    §PART %-6s products=%s' % (d, format(counts[d], ',')))
    _log('  §MEM bitsets=%d x %.1f MB = %.1f MB total'
         % (len(seeds), (maxid >> 3) / 1048576.0, len(seeds) * (maxid >> 3) / 1048576.0))

    if dry:
        _log('§SPLIT DRY-RUN DONE  %.1fs' % (time.time() - t0))
        return 0

    parts = sorted(seeds)
    bits = {}
    for d in parts:
        bs = Bits(maxid)
        for i in seeds[d]:
            bs.set(i)
        for i in shared:
            bs.set(i)
        bits[d] = bs
    del seeds

    # ── closure rounds ───────────────────────────────────────────────────────
    for rnd in range(max_rounds):
        t1 = time.time()
        added = 0
        with open(src, 'rb') as f:
            for line in f:
                m = RE_DECL.match(line)
                if not m:
                    continue
                t = m.group(2).decode('ascii', 'replace')
                if t in FANOUT_RELS or t in BACKREF_TYPES:
                    continue                  # §FANOUT: would drag the whole model into every part
                i = int(m.group(1))
                refs = None
                for d in parts:
                    if not bits[d].get(i):
                        continue
                    if refs is None:
                        refs = [int(r) for r in RE_REF.findall(line)]
                    bd = bits[d]
                    for r in refs:
                        if r != i and not bd.get(r):
                            bd.set(r)
                            added += 1
        _log('  §CLOSURE round=%d added=%s  %.1fs' % (rnd + 1, format(added, ','), time.time() - t1))
        if added == 0:
            break
    else:
        _log('  §CLOSURE WARNING: hit --max-rounds=%d without fixpoint — parts may be incomplete'
             % max_rounds)

    # ── write ────────────────────────────────────────────────────────────────
    if not os.path.isdir(outdir):
        os.makedirs(outdir)
    t2 = time.time()
    handles = {d: open(os.path.join(outdir, '%s_%s.ifc' % (prefix, d)), 'wb') for d in parts}
    kept = {d: 0 for d in parts}
    filtered = {d: 0 for d in parts}
    for d in parts:
        for h in header:
            handles[d].write(h)
    with open(src, 'rb') as f:
        seen_data = False
        for line in f:
            if not seen_data:
                if line.strip().upper().startswith(b'DATA'):
                    seen_data = True
                continue
            m = RE_DECL.match(line)
            if not m:
                continue
            i = int(m.group(1))
            t = m.group(2).decode('ascii', 'replace')

            if t in BACKREF_TYPES:
                # e.g. IfcStyledItem — belongs to whichever part owns the item it decorates
                tgt = RE_REF.findall(line)
                for d in parts:
                    if any(bits[d].get(int(r)) for r in tgt[1:2] or tgt[:1]):
                        handles[d].write(line)
                        kept[d] += 1
                        filtered[d] += 0
                continue

            if t in FANOUT_RELS:
                # rewrite the (#a,#b,...) element list down to the ids THIS part owns
                mm = None
                for cand in RE_SETLIST.finditer(line):
                    mm = cand                     # last set-list is the RelatedObjects/Elements one
                if mm is None:
                    continue
                ids = [int(x) for x in RE_REF.findall(mm.group(1))]
                for d in parts:
                    mine = [x for x in ids if bits[d].get(x)]
                    if not mine:
                        continue
                    new = (line[:mm.start(1)] + b','.join(b'#%d' % x for x in mine)
                           + line[mm.end(1):])
                    handles[d].write(new)
                    kept[d] += 1
                    filtered[d] += 1
                continue

            for d in parts:
                if bits[d].get(i):
                    handles[d].write(line)
                    kept[d] += 1
    for d in parts:
        handles[d].write(b'ENDSEC;\nEND-ISO-10303-21;\n')
        handles[d].close()

    _log('  §WRITE  %.1fs' % (time.time() - t2))
    src_mb = os.path.getsize(src) / 1048576.0
    tot_mb = 0.0
    for d in parts:
        p = os.path.join(outdir, '%s_%s.ifc' % (prefix, d))
        mb = os.path.getsize(p) / 1048576.0
        tot_mb += mb
        _log('    §RESULT %-6s entities=%9s  %8.1f MB  fanout_rewritten=%s  RAM_FORECAST ~%.1f GB'
             % (d, format(kept[d], ','), mb, format(filtered[d], ','), kept[d] * 520 / 1073741824.0))
    _log('  §TOTAL  source %.1f MB (%s entities) -> %d parts, %.1f MB, largest part decides RAM'
         % (src_mb, format(total, ','), len(parts), tot_mb))
    _log('§SPLIT DONE  total %.1fs' % (time.time() - t0))
    return 0


if __name__ == '__main__':
    sys.exit(main())
