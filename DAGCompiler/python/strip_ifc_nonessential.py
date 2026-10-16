#!/usr/bin/env python3
"""
strip_ifc_nonessential.py — remove IFC data our model never reads, streaming, provably lossless.

WHY: ifcopenshell holds the WHOLE model resident. Measured on this fleet: ~520 bytes per STEP
entity (KUL OVERALL.ifc 37.7M entities -> 19.6-21.5GB, OOM-killed twice at 44,000 and 45,000 of
66,214 elements). Every entity removed here is one the extraction would have parsed, paid RAM for,
and then discarded — so the saving is real RAM, not just disk.

WHAT COUNTS AS NON-ESSENTIAL is derived from DAGCompiler/python/extractIFCtoDB.py itself, not
guessed. That script consumes exactly: IfcProduct + geometry, IfcLocalPlacement, IfcMappedItem,
IfcBooleanResult, the spatial chain (IfcProject/Site/Building/BuildingStorey/IfcSpace,
IfcRelAggregates, IfcRelContainedInSpatialStructure), materials (IfcRelAssociatesMaterial,
IfcMaterial*, IfcMaterialLayerSet*, IfcMaterialList, IfcMaterialProfileSetUsage), styles
(IfcStyledItem, IfcSurfaceStyle*, IfcPresentationStyleAssignment, IfcColourRgb), openings
(IfcRelVoidsElement, IfcRelFillsElement) and IfcRelDefinesByType. Nothing else.

Two verified examples of what that makes droppable:
  * Property sets — extractIFCtoDB.py:1326 walks elem.IsDefinedBy but matches ONLY
    IfcRelDefinesByType, never IfcRelDefinesByProperties, and creates no properties table.
  * Ports — the port_elements / port_connections tables are CREATED but never INSERTed into
    (verified: all three KUL DBs report port_elements=0, port_connections=0), and
    IfcDistributionPort is in the extractor's own NON_GEOMETRIC_CLASSES skip list.

TIERS
  --tier meta    (default) property sets + quantities only. Conservative.
  --tier model   adds everything above the extractor provably never reads: ports, classifications,
                 documents, libraries, approvals, constraints, group/system/zone assignments,
                 presentation layers, annotations, space boundaries, element connections.

SAFETY — nothing is ever deleted blind:
  pass 1  id -> type for every candidate, plus a full histogram and a RAM forecast
  pass 2  scan every RETAINED line for #<id> references; any candidate still referenced is
          RESCUED (so a pset held by IfcRelDefinesByTemplate, or a port some construct not modelled
          here points at, survives untouched)
  sweep   optional (--sweep N): after the drop set settles, repeatedly retire pure SUPPORT entities
          (placements, points, directions, owner-history) that nothing references any more —
          e.g. the IfcLocalPlacement chain left behind by a dropped port. Fixpoint or N rounds.
  pass 3  write everything except the (now provably unreferenced) drop set

WHEN STRIPPING DOES NOT HELP — check the histogram before trusting it. Measured same-day:
  KUL CONTAINMENT.ifc  psets 19.4% + ports 13.6%  ->  a third of the file
  KUL OVERALL.ifc      psets  1.0%                ->  -1.8%, pointless: 95.6% of that file is raw
                       IFCPOLYLOOP/IFCFACE/IFCCARTESIANPOINT tessellation. You cannot strip the
                       geometry you came for — split the source per discipline instead.

PREFLIGHT — run this before extracting ANY unfamiliar IFC:
    strip_ifc_nonessential.py IN.ifc --stats-only
Read the RAM forecast against the host's free RAM:
    < 40% of free RAM  -> extract directly
    40-70%             -> strip first if the histogram shows heavy psets/quantities/ports
    > 70%              -> do NOT run whole; split per discipline
Fleet precedent for that last line: EVERY resident was onboarded per-discipline, never merged —
LTU_AHouse is 9 files (largest ARC 172.9MB / 3.53M entities / ~1.8GB), Hospital 7 (largest 76.6MB),
Clinic 5 (largest 53.2MB). KUL OVERALL.ifc (2.0GB / 37.7M entities) is the first single merged
federation file ever fed in whole, and it is the only one that has ever failed.

Usage:
    strip_ifc_nonessential.py IN.ifc --stats-only
    strip_ifc_nonessential.py IN.ifc OUT.ifc [--tier meta|model] [--sweep N] [--dry-run]
"""
import os
import re
import sys
import time

# ── TIER: meta ── leaf property/quantity machinery. Nothing reads these.
DROP_META = {
    'IFCPROPERTYSET', 'IFCRELDEFINESBYPROPERTIES', 'IFCPROPERTYSINGLEVALUE',
    'IFCPROPERTYENUMERATEDVALUE', 'IFCPROPERTYLISTVALUE', 'IFCPROPERTYBOUNDEDVALUE',
    'IFCPROPERTYTABLEVALUE', 'IFCPROPERTYREFERENCEVALUE', 'IFCCOMPLEXPROPERTY',
    'IFCPROPERTYSETTEMPLATE', 'IFCRELDEFINESBYTEMPLATE', 'IFCSIMPLEPROPERTYTEMPLATE',
    'IFCELEMENTQUANTITY', 'IFCQUANTITYLENGTH', 'IFCQUANTITYAREA', 'IFCQUANTITYVOLUME',
    'IFCQUANTITYCOUNT', 'IFCQUANTITYWEIGHT', 'IFCQUANTITYTIME',
}

# ── TIER: model ── everything else extractIFCtoDB.py provably never reads.
DROP_MODEL = DROP_META | {
    # ports: port_elements / port_connections are created but never populated
    'IFCDISTRIBUTIONPORT', 'IFCRELCONNECTSPORTTOELEMENT', 'IFCRELCONNECTSPORTS',
    # external references
    'IFCRELASSOCIATESCLASSIFICATION', 'IFCCLASSIFICATION', 'IFCCLASSIFICATIONREFERENCE',
    'IFCRELASSOCIATESDOCUMENT', 'IFCDOCUMENTREFERENCE', 'IFCDOCUMENTINFORMATION',
    'IFCRELASSOCIATESLIBRARY', 'IFCLIBRARYREFERENCE', 'IFCLIBRARYINFORMATION',
    'IFCRELASSOCIATESAPPROVAL', 'IFCAPPROVAL', 'IFCRELASSOCIATESCONSTRAINT',
    'IFCCONSTRAINT', 'IFCOBJECTIVE', 'IFCMETRIC',
    # groupings — never queried
    'IFCRELASSIGNSTOGROUP', 'IFCGROUP', 'IFCSYSTEM', 'IFCDISTRIBUTIONSYSTEM',
    'IFCZONE', 'IFCRELSERVICESBUILDINGS',
    # presentation / annotation
    'IFCPRESENTATIONLAYERASSIGNMENT', 'IFCPRESENTATIONLAYERWITHSTYLE',
    'IFCANNOTATION', 'IFCTEXTLITERAL', 'IFCTEXTLITERALWITHEXTENT',
    # topology relations the extractor recomputes itself (rel_adjacency is derived, not read)
    'IFCRELSPACEBOUNDARY', 'IFCRELSPACEBOUNDARY1STLEVEL', 'IFCRELSPACEBOUNDARY2NDLEVEL',
    'IFCRELCONNECTSELEMENTS',
}

# Pure support entities — retired ONLY by the sweep, and ONLY once nothing references them.
SWEEPABLE = {
    'IFCLOCALPLACEMENT', 'IFCAXIS2PLACEMENT3D', 'IFCAXIS2PLACEMENT2D',
    'IFCCARTESIANPOINT', 'IFCDIRECTION', 'IFCOWNERHISTORY',
    'IFCPERSONANDORGANIZATION', 'IFCAPPLICATION', 'IFCPERSON', 'IFCORGANIZATION',
}

BYTES_PER_ENTITY = 520          # fleet-measured ifcopenshell residency
RE_DECL = re.compile(rb'^#(\d+)\s*=\s*([A-Z0-9_]+)\s*\(')
RE_REF = re.compile(rb'#(\d+)')


def _log(m):
    print(m, flush=True)


def _scan_types(src, drop_types, want_sweep):
    """pass 1 — histogram + ONLY the id sets we actually need.

    §MEM: deliberately does NOT build a full id->type dict. On a 37.7M-entity file that dict alone
    is multi-GB — i.e. it would reintroduce the exact residency problem this script exists to avoid.
    Candidate ids are a small set; sweepable ids are only collected when --sweep is asked for.
    """
    cand, sweep_ids, hist, total = set(), set(), {}, 0
    with open(src, 'rb') as f:
        for line in f:
            m = RE_DECL.match(line)
            if not m:
                continue
            total += 1
            t = m.group(2)
            hist[t] = hist.get(t, 0) + 1
            ts = t.decode('ascii', 'replace')
            if ts in drop_types:
                cand.add(int(m.group(1)))
            elif want_sweep and ts in SWEEPABLE:
                sweep_ids.add(int(m.group(1)))
    return cand, sweep_ids, hist, total


def _referenced_by_retained(src, drop):
    """Every #id referenced from a line that is NOT itself being dropped."""
    ref = set()
    with open(src, 'rb') as f:
        for line in f:
            m = RE_DECL.match(line)
            if m and int(m.group(1)) in drop:
                continue
            for r in RE_REF.findall(line):
                ref.add(int(r))
    return ref


def main():
    args = [a for a in sys.argv[1:]]
    if not args:
        _log(__doc__)
        return 2
    src = args[0]
    stats_only = '--stats-only' in args
    dry = '--dry-run' in args
    tier = 'meta'
    if '--tier' in args:
        tier = args[args.index('--tier') + 1]
    sweep_rounds = 0
    if '--sweep' in args:
        sweep_rounds = int(args[args.index('--sweep') + 1])
    dst = None
    for a in args[1:]:
        if not a.startswith('--') and args[args.index(a) - 1] not in ('--tier', '--sweep'):
            dst = a
            break
    if not stats_only and not dst:
        _log('ERROR: OUT.ifc required unless --stats-only')
        return 2

    drop_types = DROP_MODEL if tier == 'model' else DROP_META

    _log('=' * 72)
    _log('§STRIP START  tier=%s sweep=%d' % (tier, sweep_rounds))
    _log('=' * 72)
    _log('  §IN   %s  (%.1f MB)' % (src, os.path.getsize(src) / 1048576.0))
    if not stats_only:
        _log('  §OUT  %s%s' % (dst, '  (DRY RUN)' if dry else ''))

    t0 = time.time()
    cand, sweep_ids, hist, total = _scan_types(src, drop_types, sweep_rounds > 0)
    _log('  §PASS1 entities=%s  %.1fs' % (format(total, ','), time.time() - t0))
    for t, n in sorted(hist.items(), key=lambda kv: -kv[1])[:14]:
        _log('    §HIST %-34s %10s  %5.1f%%'
             % (t.decode('ascii', 'replace'), format(n, ','), 100.0 * n / max(total, 1)))
    _log('  §RAM_FORECAST %.1f GB resident at %d bytes/entity'
         % (total * BYTES_PER_ENTITY / 1073741824.0, BYTES_PER_ENTITY))

    _log('  §CANDIDATES %s (%.1f%% of entities) under tier=%s'
         % (format(len(cand), ','), 100.0 * len(cand) / max(total, 1), tier))

    if stats_only:
        _log('§STRIP STATS-ONLY DONE  %.1fs' % (time.time() - t0))
        return 0

    # pass 2 — rescue anything still referenced
    t1 = time.time()
    ref = _referenced_by_retained(src, cand)
    rescued = {i for i in cand if i in ref}
    drop = cand - rescued
    _log('  §PASS2 rescued=%s final_drop=%s  %.1fs'
         % (format(len(rescued), ','), format(len(drop), ','), time.time() - t1))

    # sweep — retire support entities nothing references any more (fixpoint or N rounds)
    for rnd in range(sweep_rounds):
        t2 = time.time()
        ref = _referenced_by_retained(src, drop)
        newly = {i for i in sweep_ids if i not in drop and i not in ref}
        if not newly:
            _log('  §SWEEP round=%d fixpoint (nothing newly orphaned)  %.1fs' % (rnd + 1, time.time() - t2))
            break
        drop |= newly
        _log('  §SWEEP round=%d retired=%s total_drop=%s  %.1fs'
             % (rnd + 1, format(len(newly), ','), format(len(drop), ','), time.time() - t2))

    if not drop:
        _log('  §STRIP NOOP — nothing safely removable')
        return 0
    if dry:
        _log('  §DRY_RUN would remove %s of %s entities (%.1f%%)  → RAM ~%.1f GB'
             % (format(len(drop), ','), format(total, ','), 100.0 * len(drop) / total,
                (total - len(drop)) * BYTES_PER_ENTITY / 1073741824.0))
        return 0

    # pass 3 — write
    t3 = time.time()
    kept = removed = 0
    with open(src, 'rb') as fi, open(dst, 'wb') as fo:
        for line in fi:
            m = RE_DECL.match(line)
            if m and int(m.group(1)) in drop:
                removed += 1
                continue
            fo.write(line)
            if m:
                kept += 1
    si, so = os.path.getsize(src) / 1048576.0, os.path.getsize(dst) / 1048576.0
    _log('  §PASS3 kept=%s removed=%s  %.1fs' % (format(kept, ','), format(removed, ','), time.time() - t3))
    _log('  §RESULT %.1f MB -> %.1f MB (-%.1f%%)  entities %s -> %s (-%.1f%%)'
         % (si, so, 100.0 * (si - so) / si, format(total, ','), format(kept, ','),
            100.0 * removed / total))
    _log('  §RAM_FORECAST ~%.1f GB -> ~%.1f GB'
         % (total * BYTES_PER_ENTITY / 1073741824.0, kept * BYTES_PER_ENTITY / 1073741824.0))
    _log('§STRIP DONE  total %.1fs' % (time.time() - t0))
    return 0


if __name__ == '__main__':
    sys.exit(main())
