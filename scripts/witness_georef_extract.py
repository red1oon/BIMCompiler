#!/usr/bin/env python3
# Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT
"""W-GEOREF-EXTRACT — witness for prompts/GEOREF_SUNPATH_COMPASS.md §2/§3.1/§4.

THE ISSUE THIS TEST EXISTS TO PROVE OR DISPROVE (Standing Rule: "every test must name the
issue"):
  `project_metadata.true_north_angle` was written as the literal string "0" for EVERY building
  by DAGCompiler/python/extractIFCtoDB.py, while viewer/sitecam.js:81 and viewer/walk.js:275
  applied a real rotation formula to it on every site-camera open and every walk-mode GPS fix.
  A live consumer, a real formula, a permanently stubbed input. This witness proves the stub is
  gone AND that the replacement gets the SIGN right, which is the part a "it's non-zero now"
  check would have shipped wrong.

WHAT MAKES IT A WITNESS AND NOT A SMOKE TEST (PRIMAL LAW §4 — it must be able to say NO-OP,
VACUOUS and WRONG):
  - VACUOUS: the fixture IFCs live under internal/ and internal/UNMERGED/, which are gitignored.
    A checkout without them judges NOTHING, and this prints INCONCLUSIVE, never PASS.
  - NO-OP: the DUPLEX and CLINIC rows below are the no-change cases (no TrueNorth / no IfcSite
    georef at all). If the extractor ever starts INVENTING a value for them, they fail — that is
    the §4 guard, and it is the reason a "did it produce a number" assertion is not enough.
  - WRONG: every expected value here was derived BY HAND from the raw STEP literal quoted beside
    it, before the function was run — not copied back out of the function's own output.

RUN:  python3 scripts/witness_georef_extract.py   (from the repo root; exit 0 = PASS)
"""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
EXTRACTOR = os.path.join(ROOT, 'DAGCompiler', 'python', 'extractIFCtoDB.py')


def _fixture_roots():
    """Where to look for the fixture IFCs, nearest first.

    `internal/` is gitignored, so it exists ONLY in the primary checkout — a `git worktree` has
    the code but not the files. Rather than hardcode a machine path, ask git for the common dir
    (`<primary>/.git`) and add its parent. In the primary checkout that is ROOT again and the
    list de-duplicates to one entry; in a worktree it is the checkout that actually holds them.
    """
    roots = [ROOT]
    try:
        import subprocess
        common = subprocess.run(
            ['git', '-C', ROOT, 'rev-parse', '--path-format=absolute', '--git-common-dir'],
            capture_output=True, text=True, timeout=10)
        if common.returncode == 0:
            primary = os.path.dirname(common.stdout.strip())
            if primary and primary not in roots:
                roots.append(primary)
    except Exception:
        pass
    return roots

# ── Load ONLY the georef functions out of the extractor ──────────────────────────────────────
# extractIFCtoDB.py is a CLI with heavy imports; importing it whole to reach two pure functions
# would make this witness depend on things it is not judging. The slice is bounded by two `def`
# lines, so a rename breaks the witness loudly instead of silently testing nothing.
def _load_georef_ns():
    src = open(EXTRACTOR).read()
    a = src.index('def _length_unit_scale(')
    b = src.index('def extract_material_layers(')
    ns = {}
    exec(compile(src[a:b], 'extractIFCtoDB.georef', 'exec'), ns)
    for need in ('_compound_angle_to_degrees', 'extract_georef'):
        if need not in ns:
            print(f'§GEOREF_WITNESS INCONCLUSIVE — {need} not found in the extractor slice')
            sys.exit(2)
    return ns


# ── The fixtures. `expect` values are HAND-DERIVED from the STEP literal in the comment. ──────
# Every one of these is a real source file already in this repo's fleet — no synthetic IFC was
# authored for this witness, so a PASS here is a statement about production data.
CASES = [
    # #91=IFCDIRECTION((-0.0871557427476695,0.996194698091745))  -> atan2(+0.08716, 0.99619)
    #                                                            = +5.000000 deg
    # IFCSITE(... ,(42,21,30,344238),(-71,-3,-35,-194702),165811.2, ...)  unit = MILLI.METRE
    #   lat = 42 + 21/60 + 30/3600 + 344238/3.6e9      = 42.35842896
    #   lon = -(71 + 3/60 + 35/3600 + 194702/3.6e9)    = -71.05977631
    #   elev = 165811.2 mm * 0.001                     = 165.8112 m
    ('internal/UNMERGED/Hospital_IFC2x3_ARC.ifc', {
        'true_north_angle': 5.000000, 'true_north_source': 'ifc_truenorth',
        'site_latitude': 42.35842896, 'site_longitude': -71.05977631,
        'site_elevation_m': 165.8112, 'site_latlong_source': 'ifc_site'}),

    # #23=IFCDIRECTION((-0.788440765510192,0.615110688642054)) -> atan2(+0.788441, 0.615111)
    #                                                           = +52.040036 deg
    # IFCSITE(... ,(5,57,45,982417),(100,38,13,652547),3.03512190000002, ...) unit = MILLI.METRE
    #   lat = 5 + 57/60 + 45/3600 + 982417/3.6e9       = 5.96277289   (Penang, MY)
    #   lon = 100 + 38/60 + 13/3600 + 652547/3.6e9     = 100.63712571
    #   elev = 3.0351219 mm * 0.001 = 0.0030 m — physically odd, and DELIBERATELY asserted as-is:
    #          the file says 3 mm, so the extractor says 3 mm. "Looks wrong, so round it up to
    #          3 m" is exactly the invention this project forbids. A source-data defect is a
    #          finding to report, not a number to fix in the reader.
    ('internal/UNMERGED/merged_federation.ifc', {
        'true_north_angle': 52.040036, 'true_north_source': 'ifc_truenorth',
        'site_latitude': 5.96277289, 'site_longitude': 100.63712571,
        'site_elevation_m': 0.0030, 'site_latlong_source': 'ifc_site'}),

    # IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-009,#26,$)  <- TrueNorth is $ (ABSENT)
    # IFCSITE(... ,(41,52,27,840000),(-87,-38,-21,-839999),-0., ...)  unit = METRE
    #   THE NO-OP CASE FOR TRUE NORTH: the answer is still 0, and it MUST still be 0 — but
    #   `true_north_source` now says default_zero, so a consumer can tell this apart from
    #   SampleHouse's REAL zero below. That distinction is the entire §1 finding.
    #   The -0. RefElevation also guards the signed-zero normalisation ("0.0000", not "-0.0000").
    ('internal/sources/Ifc2x3_Duplex_Architecture.ifc', {
        'true_north_angle': 0.0, 'true_north_source': 'default_zero',
        'site_latitude': 41.87440000, 'site_longitude': -87.63940000,
        'site_elevation_m': 0.0, 'site_latlong_source': 'ifc_site'}),

    # #93=IFCDIRECTION((6.12303176911189E-17,1.))  <- a REAL, AUTHORED "north is north"
    # IFCSITE(... ,(51,30,0,549316),(0,-7,-34,-450321),0., ...)  unit = MILLI.METRE
    #   lat = 51 + 30/60 + 0 + 549316/3.6e9            = 51.50015259  (London)
    #   lon: THE UNSIGNED-ZERO-DEGREES EXPORT. Components are (0, -7, -34, -450321) — the degrees
    #        component carries no sign because it is zero. Sign must come from ANY negative
    #        component, or a naive abs() would yield +0.126 and put the site east of Greenwich.
    #        = -(0 + 7/60 + 34/3600 + 450321/3.6e9)    = -0.12623620
    ('internal/sources/Ifc4_SampleHouse.ifc', {
        'true_north_angle': 0.0, 'true_north_source': 'ifc_truenorth',
        'site_latitude': 51.50015259, 'site_longitude': -0.12623620,
        'site_elevation_m': 0.0, 'site_latlong_source': 'ifc_site'}),

    # IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.0E-9,#3,$)   <- TrueNorth is $ (ABSENT)
    # IFCSITE(... ,(42,21,30,344238),(-71,-3,-35,-194702),-0.0, ...)  unit = METRE
    #   The SECOND no-TrueNorth building, and the one that shows the two facts are independent:
    #   a real lat/long WITH a defaulted true north. Same Boston coordinates as Hospital above
    #   (both come from the same Revit sample dataset) — that is the source data, not a copy
    #   error here. Its -0.0 RefElevation is in METRES, not mm, so it also covers the case where
    #   the unit scale is 1.0 and must NOT be applied twice.
    ('internal/UNMERGED/Clinic_Architectural_IFC2x3.ifc', {
        'true_north_angle': 0.0, 'true_north_source': 'default_zero',
        'site_latitude': 42.35842896, 'site_longitude': -71.05977631,
        'site_elevation_m': 0.0, 'site_latlong_source': 'ifc_site'}),
]


# ── §4 GUARD — the "source carries nothing" paths, proved WITHOUT a file. ─────────────────────
# Every IFC in this repo's fleet happens to carry an IfcSite georef, so the honest-default path
# has no real fixture here. Files that DO lack it exist (~/Downloads/Clinic.ifc, TerminalMerged
# .ifc, LTU_AHouse_AIR.ifc all write `.ELEMENT.,$,$,$` — checked 2026-09-18) but they are outside
# every checkout, so a witness that depended on them would be VACUOUS on any other machine.
# These stubs drive `extract_georef`'s OWN branches directly instead. They fabricate no
# coordinate and assert no place — they assert that the extractor REFUSES to fabricate one.
class _StubSite:
    def __init__(self, lat=None, lon=None, elev=None):
        self.RefLatitude, self.RefLongitude, self.RefElevation = lat, lon, elev


class _StubCtx:
    def __init__(self, tn):
        self.TrueNorth = tn


class _StubDir:
    def __init__(self, ratios):
        self.DirectionRatios = ratios


class _StubProject:
    def __init__(self, ctxs):
        self.RepresentationContexts = ctxs


class _StubIfc:
    """The minimum surface `extract_georef` touches: by_type('IfcProject'/'IfcSite')."""
    def __init__(self, projects=(), sites=()):
        self._t = {'IfcProject': list(projects), 'IfcSite': list(sites)}

    def by_type(self, t):
        return self._t.get(t, [])


STUB_CASES = [
    ('IfcSite present, all georef attrs $',
     _StubIfc(sites=[_StubSite()]),
     {'site_latitude': '', 'site_longitude': '', 'site_elevation_m': '',
      'site_latlong_source': 'unknown', 'true_north_angle': '0',
      'true_north_source': 'default_zero'}),
    ('no IfcSite and no IfcProject at all',
     _StubIfc(),
     {'site_latitude': '', 'site_longitude': '', 'site_latlong_source': 'unknown',
      'true_north_angle': '0', 'true_north_source': 'default_zero'}),
    ('context exists but TrueNorth is $',
     _StubIfc(projects=[_StubProject([_StubCtx(None)])]),
     {'true_north_angle': '0', 'true_north_source': 'default_zero'}),
    ('TrueNorth present but a degenerate (0,0) direction',
     _StubIfc(projects=[_StubProject([_StubCtx(_StubDir([0.0, 0.0]))])]),
     {'true_north_angle': '0', 'true_north_source': 'default_zero'}),
    # THE MALFORMED CASE, AND IT IS NOT HYPOTHETICAL — this exact vector is in four shipped source
    # files (Clinic_Electrical_IFC2x3.ifc #11050, Clinic_HVAC_IFC2x3.ifc #76172,
    # Ifc2x3_Duplex_Plumbing.ifc #40, LTU_AHouse_STR.ifc #66). TrueNorth must lie in the ground
    # plane; this one has z = 1.0 and an XY part of length 2. Reading its first two ratios yields
    # atan2(-2, 0) = -90.000000 deg — precise, confident and a quarter turn wrong. Refusing it is
    # the whole point, and this row is what stops a later "be more permissive" change bringing it back.
    ('malformed 3D TrueNorth (2.0, 6.123e-17, 1.0) is REFUSED, not read as -90 deg',
     _StubIfc(projects=[_StubProject([_StubCtx(_StubDir([2.0, 6.12303176911189e-17, 1.0]))])]),
     {'true_north_angle': '0', 'true_north_source': 'malformed_truenorth_ignored'}),
    ('a 3-component TrueNorth that DOES lie in the ground plane is accepted',
     _StubIfc(projects=[_StubProject([_StubCtx(_StubDir([-0.0871557427476695, 0.996194698091745, 0.0]))])]),
     {'true_north_angle': '5.000000', 'true_north_source': 'ifc_truenorth'}),
    ('first IfcSite is bare, a later one carries the real georef',
     _StubIfc(sites=[_StubSite(), _StubSite((5, 57, 45, 982417), (100, 38, 13, 652547))]),
     {'site_latitude': '5.96277289', 'site_longitude': '100.63712571',
      'site_latlong_source': 'ifc_site'}),
]

ANG_TOL = 1e-5      # degrees — the extractor stores 6 dp
DEG_TOL = 1e-7      # decimal degrees — the extractor stores 8 dp (~1 cm of latitude)
LEN_TOL = 1e-4      # metres — the extractor stores 4 dp


def main():
    ns = _load_georef_ns()

    # ── Pure-arithmetic assertions first: they need no IFC and can never be VACUOUS. ──────────
    cad = ns['_compound_angle_to_degrees']
    unit_checks = [
        ('all-negative compound', (-87, -38, -21, -839999), -87.63940000),
        ('unsigned-zero degrees', (0, -7, -34, -450321), -0.12623620),
        ('three-element (no millionths)', (52, 9, 0), 52.15000000),
        ('positive', (5, 57, 45, 982417), 5.96277289),
        ('empty -> None', (), None),
        ('None -> None', None, None),
    ]
    fails = 0
    for name, parts, want in unit_checks:
        got = cad(parts)
        ok = (got is None and want is None) or (
            got is not None and want is not None and abs(got - want) < DEG_TOL)
        print(f'  §GEOREF_ANGLE {"ok  " if ok else "WRONG"} {name}: {parts} -> {got} (want {want})')
        if not ok:
            fails += 1

    # ── §4 stub assertions: the honest-default branches, no file needed, never VACUOUS. ──────
    for name, stub, expect in STUB_CASES:
        got = ns['extract_georef'](stub)
        bad = {k: (got.get(k), v) for k, v in expect.items() if got.get(k) != v}
        print(f'  §GEOREF_DEFAULT {"ok  " if not bad else "WRONG"} {name}'
              + (f' -> {bad}' if bad else ''))
        fails += len(bad)

    # ── Fixture assertions. ──────────────────────────────────────────────────────────────────
    try:
        import ifcopenshell
    except ImportError:
        print('§GEOREF_WITNESS INCONCLUSIVE — ifcopenshell not installed; '
              f'{len(unit_checks)} arithmetic + {len(STUB_CASES)} default-branch checks ran, '
              f'{fails} wrong, 0 files judged')
        sys.exit(2 if fails == 0 else 1)

    judged = 0
    for rel, expect in CASES:
        path = next((q for q in (os.path.join(r, rel) for r in _fixture_roots())
                     if os.path.exists(q)), None)
        if path is None:
            print(f'  §GEOREF_FIXTURE skip {rel} — not under any of {_fixture_roots()} '
                  '(internal/ is gitignored)')
            continue
        got = ns['extract_georef'](ifcopenshell.open(path))
        judged += 1
        for key, want in expect.items():
            raw = got[key]
            if isinstance(want, str):
                ok = (raw == want)
                shown = repr(raw)
            elif raw == '':
                ok = False
                shown = "'' (EMPTY — expected a number)"
            else:
                tol = ANG_TOL if key == 'true_north_angle' else (
                    LEN_TOL if key == 'site_elevation_m' else DEG_TOL)
                ok = abs(float(raw) - want) < tol
                shown = raw
            if not ok:
                fails += 1
            print(f'  §GEOREF_FIXTURE {"ok  " if ok else "WRONG"} '
                  f'{os.path.basename(rel)} {key}={shown} (want {want!r})')

    # ── Verdict. INCONCLUSIVE when nothing was judged — never PASS on an empty population. ────
    if judged == 0:
        print(f'§GEOREF_WITNESS INCONCLUSIVE — VACUOUS on files: 0 of {len(CASES)} fixture IFCs '
              f'present. {len(unit_checks)} arithmetic + {len(STUB_CASES)} default-branch checks '
              f'ran, {fails} wrong.')
        sys.exit(2 if fails == 0 else 1)
    verdict = 'PASS' if fails == 0 else 'FAIL'
    print(f'§GEOREF_WITNESS {verdict} files={judged}/{len(CASES)} '
          f'arithmetic={len(unit_checks)} defaults={len(STUB_CASES)} wrong={fails}')
    sys.exit(0 if fails == 0 else 1)


if __name__ == '__main__':
    main()
