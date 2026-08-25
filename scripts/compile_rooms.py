#!/usr/bin/env python3
"""
compile_rooms.py — COMPILE rooms from wall/door enclosure (deterministic, not invented).

Per storey: rasterize wall + door footprints into a 2D plan grid, flood-fill the exterior
from the border, and treat each connected pocket of free space that the exterior cannot reach
as a ROOM (enclosed by walls). Output = spatial_structure IfcSpace rows (guid/name/parent +
center_x/y/z, size_x/y/z) + rel_contained_in_space (elements whose XY centre falls in a room).

This is COMPILE, not invent: every room is a region enclosed by REAL wall geometry. guid/name
are deterministic labels for the computed cell. Geometry tables are never touched.

Usage:
  compile_rooms.py <db>            # DRY: print detected rooms per storey, write nothing
  compile_rooms.py <db> --write    # inject spatial_structure + rel_contained_in_space
"""
import sqlite3, sys, math, itertools, datetime

# §ROOM_WALKER_VERSION_STAMP (ROOM_INJECTOR_NEEDLE.md) — algorithm version, EFFECTS_V convention:
# bump on every ALGORITHM change, never on cosmetic edits. Kept in LOCKSTEP with the same-named
# constant in build/room_walker.js (py/js parity discipline, ROOM_WALKER_PHASE_INVARIANCE.md's
# §RASTER-EPS parity sweep is the precedent). 'v2' continues the existing lib/room_walker.js?v=2
# loader lineage rather than restarting at an arbitrary v1.
ROOM_WALKER_V = 'v2 (§LOCAL-FRAME + §RASTER-EPS, post-§SUSPECT-LARGE)'

RES = 0.20          # grid cell size (m)
MIN_AREA = 4.0      # m^2 — drop slivers / wall cavities
# §SUSPECT-LARGE (2026-07-14, real bug found live: HHS Level 3's genuine 456m^2 corridor was
# silently dropped, never compiled, never flagged — 73/70 room-graph dead-ends traced to this).
# MAX_AREA_ABS used to be a hard drop threshold, calibrated to residential room sizes ("a real room
# is rarely bigger"). That reasoning predates §DOOR-PARTITION-EXT-EXCLUDE, which is now the real,
# precise leak detector (walks the actual exterior-reachability flood before this check ever runs) —
# measured fleet-wide: SampleHouse/Duplex/SampleCastle/HospitalGarage/Clinic/Terminal/Hospital's real
# biggest ext-excluded (confirmed-interior) pockets range 38-1544 m^2, so ANY fixed absolute drop
# threshold is wrong for some real building — including SampleCastle (315 m^2) despite being
# "residential"-classed for rules purposes. Repurposed: still compiles, just flagged for review
# (same §ROOM-FORM treatment as SUSPECT_OPEN/SUSPECT_ELONGATED) instead of silently vanishing.
MAX_AREA_ABS = 150.0  # m^2 — SUSPECT_LARGE flag threshold, no longer a drop threshold
MAX_AREA_FRAC = 0.92  # still a hard drop — self-scaling (% of THIS building's own storey plan),
                       # catches a genuinely undivided/uncompiled floor regardless of building size
SEAL = 2            # dilate walls this many cells (×RES) to close hairline corner/door gaps
# §RASTER-EPS (ROOM_WALKER_PHASE_INVARIANCE.md S1/S2, 2026-07-17 — measured, not assumed): wall
# edges routinely sit EXACTLY on a RES cell boundary relative to the data-derived grid origin
# (xs0 = min - 2·RES keeps CAD-grid-nice offsets RES-aligned), so floor((x-xs0)/RES) is a knife
# edge: translating the SAME geometry by a constant Δ perturbs (x-xs0) by ~1 ulp and flips those
# cells — measured on Terminal_norooms: 8/14 constant translations changed the compile (rooms
# 50-54 vs baseline 51; Python identical, 51→52 at Δ=(0.1,0.1)). Fix: treat a coordinate within
# RASTER_EPS cell-fractions below a boundary as ON the boundary — floor(t + RASTER_EPS) for cell
# indices, ceil(t - RASTER_EPS) for grid extents. RASTER_EPS is derived from the mechanism, not
# fitted: FP error of (x-xs0)/RES is ≤ ~2 ulp of |x|/RES ≈ 5e-9 cells at |x|=1e5 m; 1e-6 cells
# gives >100x headroom yet equals 0.2 µm of geometry — 5 orders below any real coordinate.
# Post-fix the same sweep is 14/14 EQUAL (§W-FRAME-EQ).
RASTER_EPS = 1e-6   # cell fractions — boundary snap band for raster quantization
WALL_LIKE = ("IfcWall%", "IfcDoor%", "IfcCurtainWall%", "IfcColumn%", "IfcWindow%")
# §STAIR-EXCLUDE: a stairwell is a wall-enclosed pocket, so the flood-fill flags it as a "room".
# It is circulation, NOT a room. Reject any compiled pocket that a stair footprint substantially
# overlaps. IfcStair% LIKE also covers IfcStairFlight. (User: "staircase is also marked as room".)
STAIR_LIKE = ("IfcStair%", "IfcRamp%")
STAIR_OVERLAP_REJECT = 0.35   # drop a pocket if a stair footprint covers ≥35% of its area
# §DOOR-RESCUE (abstract rule, not a fitted band): the definition of "room" is architectural, not a
# size threshold — an enclosed pocket is a room IFF it has a DOOR (how a person enters/exits it). A
# wall cavity, duct or structural void never has one. MIN_AREA alone is a blunt proxy for this that
# only works by accident when small rooms happen to be rare; it wrongly drops real small rooms
# (toilets, risers, store/utility closets) that a strict area cutoff can't tell apart from noise.
# So below MIN_AREA, door presence — not a second area number picked by eyeballing any one building —
# is the actual test. Two supporting checks are geometry-derived, not observed-data-fitted:
#   - the adjacency buffer is each DOOR's OWN extracted footprint (half its real leaf/frame span) plus
#     one grid cell of rasterization slack — self-scaling to whatever doors this building actually has,
#     never a fixed metre guess;
#   - NOISE_FLOOR_DIM rejects a pocket whose rect is narrower than a few grid cells in EITHER axis —
#     that is a property of the flood-fill's own resolution (a 1-2 cell sliver is rasterization noise
#     by construction, regardless of which building produced it), not a threshold tuned to this data.
NOISE_FLOOR_DIM = 3 * RES   # m — a pocket narrower than this in x OR y is a grid artefact, not a room
DOOR_BUFFER_SLACK = RES     # m — rasterization slack added on top of each door's own real footprint
# §DOOR-NOT-ROOM: a door that leads to a SHAFT, not a habitable room, must not be used as the
# §DOOR-RESCUE "this pocket is a room" signal — same shape of problem as §STAIR-EXCLUDE (a real,
# correctly-classified element that still isn't evidence of a room). Found on real data (SampleCastle):
# 28 IfcDoor rows named 'liftdeur' (Dutch: lift/elevator door), width 0.5m — real doors, but 2 of them
# were rescuing actual elevator-shaft fragments as fake "rooms". Name-keyword match (multi-language,
# reviewed against real extractions, same discipline as NONHAB_TYPES) — not a width cutoff, since a
# lift door's width alone isn't reliably distinct from a narrow single-leaf door's.
NON_ROOM_DOOR_NAMES = ("liftdeur", "lift", "elevator", "aufzug", "fahrstuhl", "hoist")
def _is_room_door(name):
    n = (name or "").lower()
    return not any(k in n for k in NON_ROOM_DOOR_NAMES)
# §7 ROOM WELL-FORMEDNESS (ROOM_INJECTION_HYBRID.md §7, 2026-07-11 — user doctrine: "a room must be
# well formed, fully enclosed, has door"; failures become SUSPECT_* rows for a later review feature,
# never silently different geometry). Both factors are SELF-SCALING to the building's own extracted
# doors (same discipline as §DOOR-RESCUE's per-door buffer) — no fixed metres:
#   §WALL-VERT: IfcCurtainWall parents carry NO transform (verified HHS/Hospital/Clinic/Garage —
#     center_x NULL on all of them), so curtain walls rasterized as NOTHING and HHS's flood-fill
#     structurally failed. The real geometry is in the children: IfcMember (mullions) + IfcPlate
#     (glazing). Blanket inclusion is wrong (Terminal: 33,324 FLAT "Metal Deck" IfcPlate; Clinic:
#     stair-part IfcMember) — include a member/plate iff VERTICAL: bbox_z >= VERT_FACTOR × the
#     building's median real door height. Buildings with no doors skip inclusion (= old behavior).
VERT_FACTOR = 0.5
CW_CHILD_CLASSES = ("IfcMember", "IfcPlate")
#   §ROOM-FORM: openM = unsealed perimeter metres (boundary contacts that exit to free space without
#     meeting a raw wall within the dilation band; 3-wide probe so curved/diagonal wall stair-steps
#     don't read open). A room may legitimately have a doorless archway or two — more unsealed edge
#     than OPEN_PERIM_FACTOR × median door width is not "fully enclosed" → SUSPECT_OPEN. No adjacent
#     door at all → SUSPECT_NO_DOOR (voids/shafts/light-wells).
OPEN_PERIM_FACTOR = 2.0
# §MULTI-RECT (ROOM_INJECTION_HYBRID.md §8, 2026-07-11): ONE inscribed rectangle under-covers a
# non-rectangular room (measured single-rect coverage down to 0.23 on real Hospital/Clinic/Terminal
# rooms — the "doesn't fully form the inner room space" gap the user saw). A confirmed room is now
# a SET of non-overlapping rectangles carved from its (seal-band-recovered) region by a repeated
# constrained maximal-rectangle scan. All three knobs are grid-derived, not tuned:
#   RECT_COVER_TARGET: stop once this fraction of the region is covered — the remainder past 0.95
#     is stair-step fringe smaller than the noise floor (measured across all 8 buildings).
#   sub-rect minimum dimension = NOISE_FLOOR_DIM (the existing grid-resolution floor): a rect
#     thinner than 3 cells in either axis is rasterization fringe, not room space.
#   MAX_SUBRECTS: pure safety bound (measured: no real room needed >5).
# SUSPECT rooms stay single-rect (decomposition is for confirmed rooms only — orthogonal to §ROOM-FORM).
RECT_COVER_TARGET = 0.95
MAX_SUBRECTS = 8

# ============================================================================
# §PHASE0-HEALTH — Data Health Guard (SPARSE_WALL_ROOM_INFERENCE.md Phase 0, 2026-07-11).
# Runs BEFORE flood-fill. Real-schema queries only (elements_meta.ifc_class / .discipline —
# verified live against Hospital/Clinic/HHS_extracted.db, not assumed: real wall class is
# 'IfcWallStandardCase', not bare 'IfcWall'). Thresholds below are DERIVED from these 3
# buildings' own measured numbers (not asserted round numbers) — see each derivation comment.
# This guard INFORMS, it does not block: flood-fill still runs on every building regardless of
# the flag — its job is to tell the truth about how much the result should be trusted, before
# the room count is read, not to silently degrade or refuse to compile.
#
# Why "wall / DOOR count", not "wall / SPACE count" (the spec's literal wording): IfcSpace is
# ABSENT from all 3 raw federated extracts (0 rows, confirmed by direct COUNT(*) on all three
# DBs, 2026-07-11) — there is no ground-truth room count to divide by pre-flood-fill. Using
# flood-fill's OWN output as the denominator would be circular (this guard runs BEFORE it) — and
# provably unstable: HHS's flood-fill room count went from failing to 71 honest rooms from a
# single same-day commit (§7 WALL-VERT, 7133bbe06), which would have silently moved this guard's
# threshold under it. Door count (IfcDoor%, discipline='ARC') is real, independently extracted,
# and every habitable room conventionally has >=1 door, so wall-count/door-count is the closest
# real, stable proxy available for "true partitions per expected room".
def wall_door_ratio(c):
    """Architectural Completeness Ratio: TRUE wall entities (ifc_class LIKE 'IfcWall%', discipline
    ='ARC' — narrower than flood-fill's own WALL_LIKE raster set, which also counts doors/
    curtainwall/columns/windows) divided by real ARC door count."""
    walls = c.execute(
        "SELECT COUNT(*) FROM elements_meta WHERE ifc_class LIKE 'IfcWall%' AND discipline='ARC'"
    ).fetchone()[0]
    doors = c.execute(
        "SELECT COUNT(*) FROM elements_meta WHERE ifc_class LIKE 'IfcDoor%' AND discipline='ARC'"
    ).fetchone()[0]
    ratio = (walls / doors) if doors else (float('inf') if walls else 0.0)
    return walls, doors, ratio

# Measured 2026-07-11 (direct COUNT(*), elements_meta, discipline='ARC'):
#   Hospital: 1440 walls / 440 doors = 3.27
#   Clinic:   1080 walls / 254 doors = 4.25
#   HHS:       160 walls / 133 doors = 1.20   (NOTE: HHS's flood-fill currently recovers 71 rooms
#              anyway — via §WALL-VERT counting curtain-wall GLAZING panels as vertical enclosure,
#              not because the building has enough true interior walls. The ratio stays low
#              regardless of that downstream rescue, which is exactly why this is a useful
#              independent, upstream signal rather than a duplicate of flood-fill's own success.)
# WALL_DOOR_SPARSE_THRESHOLD = midpoint between HHS's 1.20 and Hospital's 3.27 (the two NEAREST
# measured points straddling the line) = (1.20 + 3.27) / 2 = 2.235 — anchored to real data on
# both sides, not a round guess.
WALL_DOOR_SPARSE_THRESHOLD = 2.235

def discipline_fingerprint(c):
    """Component Discipline Fingerprint: STR-discipline share of ALL elements_meta rows. Uses the
    discipline COLUMN, not ifc_class alone — raw ifc_class counts are misleading on their own:
    Hospital has 7127 IfcMember rows but ALL of them are discipline='ARC' (curtain-wall mullions),
    while HHS's 1450 IfcMember rows are ALL discipline='STR' (real structural steel connection
    detail) — confirmed by direct GROUP BY discipline query, 2026-07-11. discipline is the
    correct filter (WalkerDoctrine.md: "discipline is a WHERE column")."""
    total = c.execute("SELECT COUNT(*) FROM elements_meta").fetchone()[0]
    str_rows = c.execute("SELECT COUNT(*) FROM elements_meta WHERE discipline='STR'").fetchone()[0]
    frac = (str_rows / total) if total else 0.0
    return str_rows, total, frac

# Measured 2026-07-11: Hospital STR%=4.46% (2828/63415), Clinic STR%=10.06% (1621/16114),
# HHS STR%=24.81% (1707/6880). STR_DOMINANCE_THRESHOLD = midpoint between Clinic's 10.06%
# (the higher of the two healthy buildings) and HHS's 24.81% = 17.4% — same derivation discipline.
STR_DOMINANCE_THRESHOLD = 0.174

def circulation_completeness(c):
    """Multi-storey building with ZERO real IfcStair/IfcRamp entities anywhere = a structural/MEP
    federation missing its architectural circulation model entirely — a hard flag, not a ratio.
    Storeys counted from real (non-'Unknown') storey names; stairs counted across ALL disciplines
    (a stair modeled under any discipline still proves circulation was captured)."""
    storeys = c.execute(
        "SELECT COUNT(DISTINCT storey) FROM elements_meta WHERE storey IS NOT NULL AND storey <> 'Unknown'"
    ).fetchone()[0]
    stairs = c.execute(
        "SELECT COUNT(*) FROM elements_meta WHERE ifc_class LIKE 'IfcStair%' OR ifc_class LIKE 'IfcRamp%'"
    ).fetchone()[0]
    return storeys, stairs

def data_health_guard(c, building_label=""):
    """§PHASE0-HEALTH: pre-flood-fill sparsity check. Prints an honest flag, returns a dict —
    never raises, never blocks (flood-fill still runs regardless, see module comment above)."""
    walls, doors, ratio = wall_door_ratio(c)
    str_rows, total, str_frac = discipline_fingerprint(c)
    storeys, stairs = circulation_completeness(c)
    flags = []
    if doors > 0 and ratio < WALL_DOOR_SPARSE_THRESHOLD:
        flags.append(f"SPARSE_WALLS (wall/door ratio {ratio:.2f} < {WALL_DOOR_SPARSE_THRESHOLD:.2f} "
                      f"— insufficient architectural partitions to compute true spatial boundaries)")
    if str_frac > STR_DOMINANCE_THRESHOLD:
        flags.append(f"STRUCTURAL_ONLY_FEDERATION (STR discipline = {str_frac*100:.1f}% of all "
                      f"elements, > {STR_DOMINANCE_THRESHOLD*100:.1f}% — reads like a structural/MEP "
                      f"federation with a thin or absent architectural model)")
    if storeys > 1 and stairs == 0:
        flags.append(f"NO_CIRCULATION (multi-storey [{storeys} storeys] with ZERO IfcStair/IfcRamp "
                      f"entities — architectural circulation model appears entirely absent)")
    status = "FLAGGED" if flags else "OK"
    print(f"§PHASE0-HEALTH [{building_label or 'building'}]: {status}  "
          f"walls={walls} doors={doors} wall/door={ratio:.2f}  "
          f"STR%={str_frac*100:.1f} storeys={storeys} stairs={stairs}")
    for f in flags:
        print(f"  ⚠ {f}")
    if not flags:
        print("  no sparsity/structural-only/circulation flags — architectural data looks sufficient")
    return {"walls": walls, "doors": doors, "wall_door_ratio": ratio, "str_frac": str_frac,
            "storeys": storeys, "stairs": stairs, "flags": flags, "status": status}

def _median(vals):
    s = sorted(vals)
    return s[len(s) // 2] if s else 0.0

def door_stats(c):
    """Building-level medians of real door width/height — the self-scaling anchors for
    §WALL-VERT / §ROOM-FORM. Width = max(bbox_x, bbox_y) (leaf+frame plan span)."""
    rows = c.execute(
        "SELECT COALESCE(t.bbox_x,0), COALESCE(t.bbox_y,0), COALESCE(t.bbox_z,0) "
        "FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid "
        "WHERE m.ifc_class LIKE 'IfcDoor%' AND m.discipline='ARC' AND t.center_x IS NOT NULL").fetchall()
    ws = [max(bx, by_) for bx, by_, bz in rows if max(bx, by_) > 0]
    hs = [bz for bx, by_, bz in rows if bz > 0]
    return _median(ws), _median(hs)

def storey_z_anchors(c):
    """§STOREY-Z: per-storey mean center_z of EXPLICITLY-assigned real walls — the anchor used to
    reassign 'Unknown'-storey wall-like elements + doors to their actual floor (HHS: all 716
    vertical curtain children carry storey 'Unknown'; their z clusters match Level 1/2/3 exactly)."""
    rows = c.execute(
        "SELECT m.storey, t.center_z FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid "
        "WHERE m.ifc_class LIKE 'IfcWall%' AND m.discipline='ARC' AND t.center_x IS NOT NULL "
        "AND m.storey IS NOT NULL AND m.storey <> 'Unknown'").fetchall()
    acc = {}
    for st, cz in rows:
        acc.setdefault(st, []).append(cz)
    return {st: sum(v) / len(v) for st, v in acc.items()}

def _assign_by_z(st, cz, anchors, anchor_names):
    if st and st != "Unknown":
        return st
    if not anchor_names:
        return "Unknown"
    best, bd = None, float("inf")
    for a in anchor_names:  # sorted order = deterministic tie-break
        d = abs(cz - anchors[a])
        if d < bd:
            bd = d; best = a
    return best
# §APPROX: these rooms are COMPILED from wall enclosure (flood-fill), NOT extracted IfcSpace.
# Validated ~5/21 recall on ground-truth Duplex → treat as APPROXIMATE. Labelled '≈' + COMPILED.

def storey_walls(c, vert_min=0.0, anchors=None):
    # §DISC-ARC: room enclosure is an ARCHITECTURAL concept — discipline='ARC' on every element
    # query here, not just ifc_class LIKE. WalkerDoctrine.md: "discipline is a WHERE column."
    # Real gap found (2026-07-11): a raw multi-discipline extract (deploy/buildings/*_extracted.db,
    # not ARC-only stripped) carries STR-discipline IfcColumn/IfcWallStandardCase/IfcMember/IfcPlate
    # rows that also match WALL_LIKE/CW_CHILD_CLASSES ifc_class patterns — structural framing, not
    # room-enclosing walls — and without this filter they silently pollute the raster.
    cond = " OR ".join("m.ifc_class LIKE ?" for _ in WALL_LIKE)
    rows = c.execute(
        f"SELECT m.storey, t.center_x,t.center_y,t.center_z, t.bbox_x,t.bbox_y,t.bbox_z "
        f"FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid "
        f"WHERE ({cond}) AND m.discipline='ARC' AND t.center_x IS NOT NULL", WALL_LIKE).fetchall()
    # §WALL-VERT: curtain-wall children (IfcMember/IfcPlate) that stand wall-height — the enclosure
    # the bare WALL_LIKE query misses because IfcCurtainWall parents have no transform of their own.
    if vert_min > 0:
        ph = ",".join("?" for _ in CW_CHILD_CLASSES)
        rows = rows + c.execute(
            f"SELECT m.storey, t.center_x,t.center_y,t.center_z, t.bbox_x,t.bbox_y,t.bbox_z "
            f"FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid "
            f"WHERE m.ifc_class IN ({ph}) AND m.discipline='ARC' AND t.center_x IS NOT NULL AND t.bbox_z >= ?",
            CW_CHILD_CLASSES + (vert_min,)).fetchall()
    anchors = anchors or {}
    anchor_names = sorted(anchors)
    by = {}
    for st, cx, cy, cz, bx, by_, bz in rows:
        st = _assign_by_z(st or "Unknown", cz, anchors, anchor_names)  # §STOREY-Z
        by.setdefault(st, []).append((cx, cy, cz, bx, by_, bz))
    return by

def storey_stairs(c):
    """Per-storey stair/ramp footprints (cx,cy,bx,by) — circulation cores to exclude from rooms."""
    cond = " OR ".join("m.ifc_class LIKE ?" for _ in STAIR_LIKE)
    rows = c.execute(
        f"SELECT m.storey, t.center_x,t.center_y, t.bbox_x,t.bbox_y "
        f"FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid "
        f"WHERE ({cond}) AND m.discipline='ARC' AND t.center_x IS NOT NULL", STAIR_LIKE).fetchall()
    by = {}
    for st, cx, cy, bx, by_ in rows:
        by.setdefault(st or "Unknown", []).append((cx, cy, bx, by_))
    return by

def storey_doors(c, anchors=None):
    """Per-storey door (cx,cy,bx,by) — the §DOOR-RESCUE clue for genuine small rooms. Each door's
    OWN real footprint is carried through so adjacency self-scales to that door, not a guessed metre.
    §STOREY-Z applies here too: an 'Unknown'-storey door is reassigned to its z-nearest real floor."""
    rows = c.execute(
        "SELECT m.storey, m.element_name, t.center_x,t.center_y, t.center_z, COALESCE(t.bbox_x,0), COALESCE(t.bbox_y,0) "
        "FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid "
        "WHERE m.ifc_class LIKE 'IfcDoor%' AND m.discipline='ARC' AND t.center_x IS NOT NULL").fetchall()
    anchors = anchors or {}
    anchor_names = sorted(anchors)
    by = {}
    for st, name, cx, cy, cz, bx, by_ in rows:
        if not _is_room_door(name): continue  # §DOOR-NOT-ROOM: lift/elevator doors aren't room evidence
        st = _assign_by_z(st or "Unknown", cz if cz is not None else 0.0, anchors, anchor_names)
        by.setdefault(st, []).append((cx, cy, bx, by_))
    return by

def _door_adjacent(rx0, ry0, rx1, ry1, doors):
    for dx, dy, dbx, dby in doors:
        buf = max(dbx, dby) / 2 + DOOR_BUFFER_SLACK  # this door's own span, not a fixed guess
        if rx0 - buf <= dx <= rx1 + buf and ry0 - buf <= dy <= ry1 + buf:
            return True
    return False

def _stair_overlap_frac(rx0, ry0, rx1, ry1, stairs):
    """Largest fraction of room rect [rx0,ry0,rx1,ry1] covered by any single stair footprint."""
    room_area = max(1e-6, (rx1 - rx0) * (ry1 - ry0))
    best = 0.0
    for scx, scy, sbx, sby in stairs:
        sx0, sx1 = scx - sbx / 2, scx + sbx / 2
        sy0, sy1 = scy - sby / 2, scy + sby / 2
        ox = max(0.0, min(rx1, sx1) - max(rx0, sx0))
        oy = max(0.0, min(ry1, sy1) - max(ry0, sy0))
        best = max(best, (ox * oy) / room_area)
    return best

def _rasterize(walls, nx, ny, xs0, ys0):
    """Flat bytearray raster (k = i*ny + j — identical indexing to the JS port's Uint8Array)."""
    # §RASTER-EPS: floor(t + eps) — boundary-exact edges quantize identically in any frame
    def ix(x): return min(nx - 1, max(0, int(math.floor((x - xs0) / RES + RASTER_EPS))))
    def iy(y): return min(ny - 1, max(0, int(math.floor((y - ys0) / RES + RASTER_EPS))))
    raw = bytearray(nx * ny)
    for cx, cy, cz, bx, by_, bz in walls:
        i0, i1 = ix(cx - bx / 2), ix(cx + bx / 2)
        j0, j1 = iy(cy - by_ / 2), iy(cy + by_ / 2)
        for i in range(i0, i1 + 1):
            base = i * ny
            for j in range(j0, j1 + 1):
                raw[base + j] = 1
    return raw

def _dilate(blocked, nx, ny, seal):
    b = blocked
    for _ in range(seal):
        d = bytearray(nx * ny)
        for i in range(nx):
            for j in range(ny):
                k = i * ny + j
                v = b[k]
                if not v and i > 0 and b[k - ny]: v = 1
                if not v and i < nx - 1 and b[k + ny]: v = 1
                if not v and j > 0 and b[k - 1]: v = 1
                if not v and j < ny - 1 and b[k + 1]: v = 1
                d[k] = v
        b = d
    return b

def _open_perimeter_m(cells, in_set, raw, dil, nx, ny, seal_steps):
    """§ROOM-FORM: metres of the region's boundary NOT backed by a raw wall. Each boundary contact
    (cell face, RES metres each) marches outward through the dilation band (<= seal_steps+1 cells);
    3-wide probe (straight + both perpendicular neighbors) so stair-stepped curved/diagonal walls
    read as wall, not open. A contact that exits to free space without meeting raw wall is open."""
    open_c = 0
    for k in cells:
        i = k // ny; j = k % ny
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = i + di, j + dj
            if a < 0 or a >= nx or b < 0 or b >= ny:
                open_c += 1; continue
            if in_set[a * ny + b]:
                continue
            pi, pj = dj, di
            hit_wall = False
            for s in range(seal_steps + 1):
                aa, bb = i + di * (1 + s), j + dj * (1 + s)
                if aa < 0 or aa >= nx or bb < 0 or bb >= ny: break
                kk = aa * ny + bb
                hit = raw[kk]
                if not hit:
                    la, lb = aa + pi, bb + pj
                    if 0 <= la < nx and 0 <= lb < ny and raw[la * ny + lb]: hit = 1
                if not hit:
                    ra, rb = aa - pi, bb - pj
                    if 0 <= ra < nx and 0 <= rb < ny and raw[ra * ny + rb]: hit = 1
                if hit:
                    hit_wall = True; break
                if not dil[kk]: break  # re-entered free space without meeting raw wall
            if not hit_wall:
                open_c += 1
    return open_c * RES

def _inscribed_rect(in_set, ny, mni, mxi, mnj, mxj):
    """§RECT-HONESTY: largest axis-aligned rectangle fully inside the claimed cells (maximal-rectangle
    histogram scan; deterministic scan order + strict '>' so ties resolve identically in both ports).
    Returns (i0, i1, j0, j1) in grid indices."""
    w = mxi - mni + 1; h = mxj - mnj + 1
    hist = [0] * h
    best_area = 0; bi0 = mni; bi1 = mni; bj0 = mnj; bj1 = mnj
    for i in range(w):
        for j in range(h):
            hist[j] = hist[j] + 1 if in_set[(mni + i) * ny + (mnj + j)] else 0
        stk = []
        for j in range(h + 1):
            cur = hist[j] if j < h else 0
            while stk and hist[stk[-1]] >= cur:
                top = stk.pop()
                height = hist[top]
                left = stk[-1] + 1 if stk else 0
                area = height * (j - left)
                if area > best_area:
                    best_area = area
                    bi0 = mni + i - height + 1; bi1 = mni + i
                    bj0 = mnj + left; bj1 = mnj + j - 1
            stk.append(j)
    return bi0, bi1, bj0, bj1

def _grow_region(cells, in_set, raw, dil, nx, ny, steps):
    """§MULTI-RECT: recover the SEAL erosion — grow the region up to `steps` layers into cells that
    are raw-free but dilation-blocked (the band between the region and its real walls). Never grows
    into other free space (exterior / another pocket), so every grown cell is this room's own floor.
    Mutates in_set; returns (added_cells, mni, mxi, mnj, mxj) with bounds covering the growth."""
    frontier = cells
    added = []
    mni = mxi = cells[0] // ny; mnj = mxj = cells[0] % ny
    for k in cells:
        i, j = k // ny, k % ny
        mni = min(mni, i); mxi = max(mxi, i); mnj = min(mnj, j); mxj = max(mxj, j)
    for _ in range(steps):
        nxt = []
        for k in frontier:
            i, j = k // ny, k % ny
            for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                a, b = i + di, j + dj
                if 0 <= a < nx and 0 <= b < ny:
                    kk = a * ny + b
                    if not in_set[kk] and not raw[kk] and dil[kk]:
                        in_set[kk] = 1; nxt.append(kk); added.append(kk)
                        mni = min(mni, a); mxi = max(mxi, a); mnj = min(mnj, b); mxj = max(mxj, b)
        frontier = nxt
    return added, mni, mxi, mnj, mxj

# §WALL-SNAP (2026-07-13, real HHS finding: user-reported "room box doesn't reach the real wall"):
# raster quantization (RES=0.20m) plus _grow_region's seal-band recovery cap (SEAL=2 cells=0.4m)
# leave a compiled room's rect short of its TRUE (continuous-coordinate) wall face. Measured across
# 208 real non-suspect room-sides fleet-wide (HHS): 0/208 ever overshoot a wall (no invented
# overlap risk) — every side is short by 0.003-0.599m, mean 0.303m. SNAP_MAX_GAP is the measured
# worst case (0.599m) plus one RES step of headroom, not an arbitrary round number.
SNAP_MAX_GAP = 0.8  # m

def _snap_rect_to_walls(x0, y0, x1, y1, walls):
    """Move each of the 4 sides OUT (never in) to the nearest real wall's own measured near face,
    only when the gap is real and <= SNAP_MAX_GAP. Each side only ever reads the wall's NEAR face
    (xmin reads a wall's right face, xmax reads a wall's left face, etc.), so two rooms sharing one
    real wall each stop at their own side of it and can never be made to overlap by this function —
    same non-invent discipline as R-MERGE/R-REJECT: it only ever reveals more of an already-real
    wall-bounded space, never guesses a boundary where no wall exists."""
    best = {}
    for (wcx, wcy, wcz, wbx, wby_, wbz) in walls:
        wx0, wx1 = wcx - wbx / 2, wcx + wbx / 2
        wy0, wy1 = wcy - wby_ / 2, wcy + wby_ / 2
        ovY = min(y1, wy1) - max(y0, wy0)
        if ovY > 0:
            g = x0 - wx1
            if 0 <= g <= SNAP_MAX_GAP and (best.get('xmin') is None or g < best['xmin']): best['xmin'] = g
            g = wx0 - x1
            if 0 <= g <= SNAP_MAX_GAP and (best.get('xmax') is None or g < best['xmax']): best['xmax'] = g
        ovX = min(x1, wx1) - max(x0, wx0)
        if ovX > 0:
            g = y0 - wy1
            if 0 <= g <= SNAP_MAX_GAP and (best.get('ymin') is None or g < best['ymin']): best['ymin'] = g
            g = wy0 - y1
            if 0 <= g <= SNAP_MAX_GAP and (best.get('ymax') is None or g < best['ymax']): best['ymax'] = g
    if 'xmin' in best: x0 -= best['xmin']
    if 'xmax' in best: x1 += best['xmax']
    if 'ymin' in best: y0 -= best['ymin']
    if 'ymax' in best: y1 += best['ymax']
    return x0, y0, x1, y1

def _inscribed_rect_min(in_set, ny, mni, mxi, mnj, mxj, min_cells):
    """§MULTI-RECT: constrained maximal rectangle — both dims >= min_cells (the NOISE_FLOOR in
    cells; a thinner rect is rasterization fringe, not room space). None if no such rect exists.
    Same deterministic scan order / strict '>' tie-break as _inscribed_rect."""
    w = mxi - mni + 1; h = mxj - mnj + 1
    hist = [0] * h
    best_area = 0; best = None
    for i in range(w):
        for j in range(h):
            hist[j] = hist[j] + 1 if in_set[(mni + i) * ny + (mnj + j)] else 0
        stk = []
        for j in range(h + 1):
            cur = hist[j] if j < h else 0
            while stk and hist[stk[-1]] >= cur:
                top = stk.pop()
                height = hist[top]
                left = stk[-1] + 1 if stk else 0
                width = j - left
                if height >= min_cells and width >= min_cells:
                    area = height * width
                    if area > best_area:
                        best_area = area
                        best = (mni + i - height + 1, mni + i, mnj + left, mnj + j - 1)
            stk.append(j)
    return best

def _decompose_region(in_set, ny, mni, mxi, mnj, mxj, total_cells, single):
    """§MULTI-RECT: carve the region into non-overlapping rectangles — repeated constrained
    maximal-rectangle scan, stopping at RECT_COVER_TARGET coverage / MAX_SUBRECTS / no rect left
    above the noise floor. `single` (SUSPECT rooms) emits the first rect only. Clears carved cells
    from in_set (caller resets the full region afterwards). Falls back to the unconstrained
    single rect when the region is too small/thin for a 3x3 (door-rescued slivers).
    Returns (rects, covered_cells)."""
    min_cells = int(round(NOISE_FLOOR_DIM / RES))
    rects = []
    covered = 0
    for _ in range(MAX_SUBRECTS):
        r = _inscribed_rect_min(in_set, ny, mni, mxi, mnj, mxj, min_cells)
        if r is None:
            break
        i0, i1, j0, j1 = r
        rects.append(r)
        for i in range(i0, i1 + 1):
            base = i * ny
            for j in range(j0, j1 + 1):
                in_set[base + j] = 0
        covered += (i1 - i0 + 1) * (j1 - j0 + 1)
        if single:
            break
        if covered >= RECT_COVER_TARGET * total_cells:
            break
    if not rects:
        r = _inscribed_rect(in_set, ny, mni, mxi, mnj, mxj)
        rects.append(r)
        covered = (r[1] - r[0] + 1) * (r[3] - r[2] + 1)
    return rects, covered

def _classify(has_door, open_m, door_w_med):
    """§ROOM-FORM: user doctrine 'a room must be well formed, fully enclosed, has door'.
    Returns None (well-formed) / 'NO_DOOR' / 'OPEN'. door_w_med <= 0 (no real doors in the
    building) → openM test is skipped (nothing to derive the limit from; such pockets are
    already SUSPECT_NO_DOOR)."""
    if not has_door:
        return "NO_DOOR"
    if door_w_med > 0 and open_m > OPEN_PERIM_FACTOR * door_w_med:
        return "OPEN"
    return None

def flood_rooms(walls, stairs=None, doors=None, door_w_med=0.0):
    stairs = stairs or []
    doors = doors or []
    xs0 = min(w[0] - w[3] / 2 for w in walls); xs1 = max(w[0] + w[3] / 2 for w in walls)
    ys0 = min(w[1] - w[4] / 2 for w in walls); ys1 = max(w[1] + w[4] / 2 for w in walls)
    pad = RES * 2
    xs0 -= pad; ys0 -= pad; xs1 += pad; ys1 += pad
    # §RASTER-EPS: ceil(t - eps) — an exact-multiple span gets the same cell count in any frame
    nx = max(4, int(math.ceil((xs1 - xs0) / RES - RASTER_EPS)))
    ny = max(4, int(math.ceil((ys1 - ys0) / RES - RASTER_EPS)))
    raw = _rasterize(walls, nx, ny, xs0, ys0)
    # Morphological close: dilate walls SEAL cells to seal hairline corner/door-jamb gaps so the
    # exterior flood can't leak into a room through a 1–2 cell crack (it still leaves real ~1m
    # doorways open — by design those connect rooms, handled by the area filter / per-room split).
    dil = _dilate(raw, nx, ny, SEAL) if SEAL > 0 else raw
    free = bytearray(0 if dil[m] else 1 for m in range(nx * ny))
    # exterior flood from border free cells (4-connectivity, iterative stack)
    ext = bytearray(nx * ny)
    stack = []
    for i in range(nx):
        for j in (0, ny - 1):
            k = i * ny + j
            if free[k] and not ext[k]: ext[k] = 1; stack.append(k)
    for j in range(ny):
        for i in (0, nx - 1):
            k = i * ny + j
            if free[k] and not ext[k]: ext[k] = 1; stack.append(k)
    while stack:
        k0 = stack.pop()
        i, j = k0 // ny, k0 % ny
        for di, dj in ((1,0),(-1,0),(0,1),(0,-1)):
            a, b = i + di, j + dj
            if 0 <= a < nx and 0 <= b < ny:
                k = a * ny + b
                if free[k] and not ext[k]: ext[k] = 1; stack.append(k)
    enclosed = bytearray(1 if free[m] and not ext[m] else 0 for m in range(nx * ny))
    # connected components on enclosed
    rooms = []
    seen = bytearray(nx * ny)
    in_set = bytearray(nx * ny)
    cell_area = RES * RES
    plan_area = nx * ny * cell_area
    cz = sum(w[2] for w in walls) / len(walls); bz = sum(w[5] for w in walls) / len(walls)
    for si in range(nx):
        for sj in range(ny):
            sk = si * ny + sj
            if not enclosed[sk] or seen[sk]: continue
            comp = []; st = [sk]; seen[sk] = 1
            mni = mxi = si; mnj = mxj = sj
            while st:
                k = st.pop(); comp.append(k)
                i, j = k // ny, k % ny
                mni = min(mni, i); mxi = max(mxi, i); mnj = min(mnj, j); mxj = max(mxj, j)
                for di, dj in ((1,0),(-1,0),(0,1),(0,-1)):
                    a, b = i + di, j + dj
                    if 0 <= a < nx and 0 <= b < ny:
                        kk = a * ny + b
                        if enclosed[kk] and not seen[kk]:
                            seen[kk] = 1; st.append(kk)
            area = len(comp) * cell_area
            if area > plan_area * MAX_AREA_FRAC: continue   # §SUSPECT-LARGE: MAX_AREA_ABS flags below, never drops
            wx0 = xs0 + mni * RES; wx1 = xs0 + (mxi + 1) * RES
            wy0 = ys0 + mnj * RES; wy1 = ys0 + (mxj + 1) * RES
            # §DOOR-RESCUE (abstract test, applies uniformly — not a size band): a pocket is a room if
            # it is big enough to obviously be one on its own (area >= MIN_AREA, the original rule,
            # unchanged for the common case) OR it has a real door AND isn't a bare rasterization sliver
            # (NOISE_FLOOR_DIM, a grid-resolution property, not a fitted area number).
            door_rescued = False
            has_door = _door_adjacent(wx0, wy0, wx1, wy1, doors)
            if area < MIN_AREA:
                # §RASTER-EPS: the noise-floor test is a CELL-COUNT rule (3 cells) — test it in
                # integer cells, not in metres reconstructed from xs0+i*RES (whose FP dirt made a
                # 3-cell pocket flip at exact equality with NOISE_FLOOR_DIM=3*RES; same integer
                # convention _decompose_region already uses via min_cells).
                min_cells = int(round(NOISE_FLOOR_DIM / RES))
                dims_ok = (mxi - mni + 1) >= min_cells and (mxj - mnj + 1) >= min_cells
                if not (dims_ok and has_door):
                    continue
                door_rescued = True
            # §STAIR-EXCLUDE: a stair/ramp footprint covering this pocket → it's a circulation
            # shaft, not a room. Drop it (the lens was showing staircases as rooms).
            sf = _stair_overlap_frac(wx0, wy0, wx1, wy1, stairs)
            if sf >= STAIR_OVERLAP_REJECT:
                print(f"    skip stair-shaft pocket area={round(area)} stair_overlap={sf:.0%}"); continue
            # §ROOM-FORM + §RECT-HONESTY + §MULTI-RECT (ROOM_INJECTION_HYBRID.md §7/§8)
            for k in comp: in_set[k] = 1
            open_m = _open_perimeter_m(comp, in_set, raw, dil, nx, ny, SEAL)
            suspect = _classify(has_door, open_m, door_w_med)
            # §SUSPECT-ELONGATED: a wall-bounded pocket can still be an absurdly long undivided
            # span (real walls on the long sides, none dividing it) — same test as door-partition.
            if not suspect and _is_elongated(wx0, wy0, wx1, wy1):
                suspect = "ELONGATED"
            # §SUSPECT-LARGE: real but unusually big for a residential-calibrated eye — compiles,
            # flagged for review, never silently dropped (see MAX_AREA_ABS comment above).
            if not suspect and area > MAX_AREA_ABS:
                suspect = "LARGE"
            grown, gmni, gmxi, gmnj, gmxj = _grow_region(comp, in_set, raw, dil, nx, ny, SEAL)
            total_cells = len(comp) + len(grown)
            grects, covered = _decompose_region(in_set, ny, gmni, gmxi, gmnj, gmxj, total_cells,
                                                bool(suspect))
            for k in comp: in_set[k] = 0
            for k in grown: in_set[k] = 0
            rects = []
            for (ri0, ri1, rj0, rj1) in grects:
                rx0 = xs0 + ri0 * RES; rx1 = xs0 + (ri1 + 1) * RES
                ry0 = ys0 + rj0 * RES; ry1 = ys0 + (rj1 + 1) * RES
                rx0, ry0, rx1, ry1 = _snap_rect_to_walls(rx0, ry0, rx1, ry1, walls)
                rects.append({"cx": (rx0 + rx1) / 2, "cy": (ry0 + ry1) / 2,
                              "sx": rx1 - rx0, "sy": ry1 - ry0})
            r0 = grects[0]
            cover1 = ((r0[1] - r0[0] + 1) * (r0[3] - r0[2] + 1)) / total_cells
            rooms.append({
                "cx": rects[0]["cx"], "cy": rects[0]["cy"], "cz": cz,
                "sx": rects[0]["sx"], "sy": rects[0]["sy"], "sz": max(bz, 2.0), "area": area,
                "door_rescued": door_rescued, "open_m": open_m, "suspect": suspect,
                "rects": rects, "cover1": cover1, "cover_n": covered / total_cells})
    return rooms

# §DOOR-PARTITION: on some real buildings (HHS confirmed) wall-enclosure flood-fill structurally
# can't find rooms — most of the floor floods as one exterior-reachable blob regardless of area/door
# filtering, because the walls that would divide individual rooms simply aren't in this extraction.
# The gate for "walls can't do this, fall back" is the DIRECT, abstract test the user named: compare
# what flood-fill (with door-rescue already applied) actually found against how many real doors this
# storey has — every door leads to a room, so a storey whose flood-fill result is a small fraction of
# its door count has failed, full stop, regardless of which building it is. Measured before picking
# the ratio: HHS's floors find 0-11% of their door count via flood-fill; every other building's
# working floors find 25-100%+ (Garage's sparsest working floor: 5 rooms / 8 doors = 62%; Hospital's
# sparsest: 1 room / 5 doors = 20%) — DOOR_SHORTFALL_RATIO=0.15 sits below every working floor's own
# ratio and above every one of HHS's, so it never overrides an already-functioning floor (verified:
# Garage's genuine 5-room floor and Hospital's genuine 1-room floor both correctly keep flood-fill's
# result, not door-partition's coarser one). Where flood-fill DOES fail this test, partition the
# storey's free space by NEAREST DOOR (multi-source BFS through real free cells, real walls still
# block) — each door claims whatever space no other door reaches first, same as how a real occupant
# would experience the floor from that door. Fully derived from real door + wall positions, still
# deterministic and reproducible; a different compile technique for where enclosure-based compiling
# structurally cannot work, not an invention.
DOOR_SHORTFALL_RATIO = 0.15  # flood-fill finding fewer rooms than this fraction of doors = has failed

# §SUSPECT-ELONGATED (ROOM_INTELLIGENCE_SCOREBOARD.md "Confirmed case in point" / R9, 2026-07-13):
# door-partition's nearest-door BFS has no wall to stop it when a storey is missing dividing walls
# (the same SPARSE_WALLS condition §PHASE0-HEALTH already flags) — it then assigns one door whatever
# long, undivided free-floor span it reaches first. Threshold measured, not eyeballed: HHS's own 105
# door-partitioned rooms (2026-07-13 direct query, /tmp/wt-fable-livewire/modeller/HHS_ARC.db) have a
# clean bimodal aspect-ratio spread — 98 rooms climb smoothly 1.00→7.50 (the same shape every other
# building's genuine rooms show), then a hard gap to 7 outliers at 13.64→37.25 (R9 = 13.64, the
# smallest of the 7). SUSPECT_ELONGATED_ASPECT_MIN = midpoint of that gap, same derivation discipline
# as WALL_DOOR_SPARSE_THRESHOLD above: (7.50 + 13.64) / 2 = 10.57.
# EXTENDED to flood-fill too (2026-07-13, same session): a live recompile of HHS's own canonical
# source (deploy/buildings/HHS_Office_Federated_extracted.db) showed door-partition no longer fires
# at all on today's data (wall coverage has improved since whatever run produced the 105-row result
# above) — but ONE flood-fill room still came out 24.2m x 2.0m (aspect 12.1), proving wall-bounded
# rooms aren't immune to this failure mode either (a real corridor with real walls on the long sides
# but none dividing it can still flood-fill as one absurdly long pocket). So this test runs against
# BOTH compile paths now, same threshold, same reasoning. A flagged room still compiles (never
# invented away) — same §ROOM-FORM treatment as SUSPECT_OPEN/SUSPECT_NO_DOOR: no element containment,
# review candidate, geometry untouched.
SUSPECT_ELONGATED_ASPECT_MIN = 10.57

def _is_elongated(wx0, wy0, wx1, wy1):
    span_x = wx1 - wx0; span_y = wy1 - wy0
    aspect = max(span_x, span_y) / max(min(span_x, span_y), 0.01)
    return aspect > SUSPECT_ELONGATED_ASPECT_MIN

def _flood_exterior(free, nx, ny):
    """§DOOR-PARTITION-EXT-EXCLUDE (2026-07-13): same exterior-flood test flood_rooms already uses
    (border-seeded 4-connected flood over free cells) — factored out so partition_by_doors can reuse
    it. Returns the ext mask (1 = reachable from outside the building)."""
    ext = bytearray(nx * ny)
    stack = []
    for i in range(nx):
        for j in (0, ny - 1):
            k = i * ny + j
            if free[k] and not ext[k]: ext[k] = 1; stack.append(k)
    for j in range(ny):
        for i in (0, nx - 1):
            k = i * ny + j
            if free[k] and not ext[k]: ext[k] = 1; stack.append(k)
    while stack:
        k0 = stack.pop()
        i, j = k0 // ny, k0 % ny
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = i + di, j + dj
            if 0 <= a < nx and 0 <= b < ny:
                k = a * ny + b
                if free[k] and not ext[k]: ext[k] = 1; stack.append(k)
    return ext

def partition_by_doors(walls, doors, stairs, door_w_med=0.0):
    if not doors: return []
    xs0 = min(w[0] - w[3] / 2 for w in walls); xs1 = max(w[0] + w[3] / 2 for w in walls)
    ys0 = min(w[1] - w[4] / 2 for w in walls); ys1 = max(w[1] + w[4] / 2 for w in walls)
    pad = RES * 2; xs0 -= pad; ys0 -= pad; xs1 += pad; ys1 += pad
    # §RASTER-EPS: same boundary-snap quantization as flood_rooms (translation invariance)
    nx = max(4, int(math.ceil((xs1 - xs0) / RES - RASTER_EPS))); ny = max(4, int(math.ceil((ys1 - ys0) / RES - RASTER_EPS)))
    raw = _rasterize(walls, nx, ny, xs0, ys0)
    def ix(x): return min(nx - 1, max(0, int(math.floor((x - xs0) / RES + RASTER_EPS))))
    def iy(y): return min(ny - 1, max(0, int(math.floor((y - ys0) / RES + RASTER_EPS))))
    # §DOOR-PARTITION-EXT-EXCLUDE (2026-07-13, real HHS finding: R9's own footprint sampled 93%
    # exterior-reachable): the door-BFS must never claim exterior space as a room. Determine exterior
    # topology on the DILATED (SEAL-sealed) wall footprint — same band flood_rooms uses — so a
    # hairline rasterization gap can't leak the exterior flood through; but apply the resulting ext
    # mask against the RAW (undilated) free cells for the room's own shape, so the seal band is
    # "given back" (same net effect as flood_rooms's dilate-then-_grow_region, without a separate
    # grow step: the ext flood never reaches raw-free/dilation-blocked cells in the first place, since
    # it only ever traverses free_dil, so they're never marked exterior).
    free_raw = bytearray(0 if raw[m] else 1 for m in range(nx * ny))
    dil = _dilate(raw, nx, ny, SEAL) if SEAL > 0 else raw
    free_dil = bytearray(0 if dil[m] else 1 for m in range(nx * ny))
    ext = _flood_exterior(free_dil, nx, ny)
    free = bytearray(1 if free_raw[m] and not ext[m] else 0 for m in range(nx * ny))
    cz = sum(w[2] for w in walls) / len(walls); bz = sum(w[5] for w in walls) / len(walls)

    owner = [-1] * (nx * ny)
    queue = []; head = 0
    for di, (dcx, dcy, dbx, dby) in enumerate(doors):
        ci, cj = ix(dcx), iy(dcy)
        seed = None
        for r in range(7):  # expand outward (~1.4m) to find a free cell to seed this door from
            for da in range(-r, r + 1):
                if seed is not None: break
                for db in range(-r, r + 1):
                    if max(abs(da), abs(db)) != r: continue
                    a, b = ci + da, cj + db
                    if 0 <= a < nx and 0 <= b < ny:
                        k = a * ny + b
                        if free[k] and owner[k] == -1:
                            seed = k; break
            if seed is not None: break
        if seed is None: continue
        owner[seed] = di; queue.append(seed)

    while head < len(queue):
        k0 = queue[head]; head += 1
        i, j = k0 // ny, k0 % ny
        for di_, dj_ in ((1,0),(-1,0),(0,1),(0,-1)):
            a, b = i + di_, j + dj_
            if 0 <= a < nx and 0 <= b < ny:
                k = a * ny + b
                if free[k] and owner[k] == -1:
                    owner[k] = owner[k0]; queue.append(k)

    by_owner = {}
    for k in range(nx * ny):
        o = owner[k]
        if o == -1: continue
        by_owner.setdefault(o, []).append(k)

    cell_area = RES * RES; plan_area = nx * ny * cell_area
    in_set = bytearray(nx * ny)
    rooms = []
    for di in range(len(doors)):
        cells = by_owner.get(di)
        if not cells: continue
        area = len(cells) * cell_area
        mni = mnj = None
        for k in cells:
            i, j = k // ny, k % ny
            if mni is None:
                mni = mxi = i; mnj = mxj = j
            else:
                mni = min(mni, i); mxi = max(mxi, i); mnj = min(mnj, j); mxj = max(mxj, j)
        wx0 = xs0 + mni * RES; wx1 = xs0 + (mxi + 1) * RES
        wy0 = ys0 + mnj * RES; wy1 = ys0 + (mxj + 1) * RES
        # §RASTER-EPS: integer-cell noise-floor test (see flood_rooms) — no FP knife edge
        min_cells = int(round(NOISE_FLOOR_DIM / RES))
        if (mxi - mni + 1) < min_cells or (mxj - mnj + 1) < min_cells: continue
        if area > plan_area * MAX_AREA_FRAC: continue   # §SUSPECT-LARGE: MAX_AREA_ABS flags below, never drops
        if _stair_overlap_frac(wx0, wy0, wx1, wy1, stairs) >= STAIR_OVERLAP_REJECT: continue
        # §ROOM-FORM + §RECT-HONESTY + §MULTI-RECT (ROOM_INJECTION_HYBRID.md §7/§8). No dilation on
        # this path → seal_steps=0 for the openM march, no seal band to grow back into.
        for k in cells: in_set[k] = 1
        open_m = _open_perimeter_m(cells, in_set, raw, raw, nx, ny, 0)
        has_door = _door_adjacent(wx0, wy0, wx1, wy1, doors)
        suspect = _classify(has_door, open_m, door_w_med)
        # §SUSPECT-ELONGATED: an already-suspect room's existing reason (NO_DOOR/OPEN) is left
        # untouched, same rule §R-REJECT already follows for its own suspect-priority ordering.
        if not suspect and _is_elongated(wx0, wy0, wx1, wy1):
            suspect = "ELONGATED"
        # §SUSPECT-LARGE: real but unusually big — compiles, flagged for review, never dropped.
        if not suspect and area > MAX_AREA_ABS:
            suspect = "LARGE"
        grects, covered = _decompose_region(in_set, ny, mni, mxi, mnj, mxj, len(cells), bool(suspect))
        for k in cells: in_set[k] = 0
        rects = []
        for (ri0, ri1, rj0, rj1) in grects:
            rx0 = xs0 + ri0 * RES; rx1 = xs0 + (ri1 + 1) * RES
            ry0 = ys0 + rj0 * RES; ry1 = ys0 + (rj1 + 1) * RES
            rx0, ry0, rx1, ry1 = _snap_rect_to_walls(rx0, ry0, rx1, ry1, walls)
            rects.append({"cx": (rx0 + rx1) / 2, "cy": (ry0 + ry1) / 2,
                          "sx": rx1 - rx0, "sy": ry1 - ry0})
        r0 = grects[0]
        cover1 = ((r0[1] - r0[0] + 1) * (r0[3] - r0[2] + 1)) / len(cells)
        rooms.append({"cx": rects[0]["cx"], "cy": rects[0]["cy"], "cz": cz,
                      "sx": rects[0]["sx"], "sy": rects[0]["sy"], "sz": max(bz, 2.0), "area": area,
                      "door_rescued": False, "door_partitioned": True, "open_m": open_m,
                      "suspect": suspect, "rects": rects, "cover1": cover1,
                      "cover_n": covered / len(cells)})
    return rooms

# ============================================================================
# §R-MERGE / §R-REJECT (ROOM_TAXONOMY_STRATEGY_2026-07-12.md Tasks 1/1b — POC-validated:
# JKR 79->51 rooms, split-hallway chains R2+R3+R8/R21-R23/R24-R27/R28-R31 merged; Duplex control
# 0 false merges; JKR 48 non-OPEN rooms (24 INTERNAL + 10 INTERNAL_SMALL + 14 SUSPECT_NO_DOOR)
# 0 false rejects, 16/31 SUSPECT_OPEN correctly rejected). Parameters/formulas are the spec file's
# own Task 1/1b pseudocode, taken verbatim — not re-derived here. Runs AFTER flood_rooms/
# partition_by_doors produce a storey's room list, BEFORE guid/name assignment: R-MERGE first
# (a merge only removes a synthetic dividing line between two already-real pockets, never invents
# geometry), then R-REJECT (merging raises enclosure of legitimate unions, so reject must see the
# post-merge shape).
MERGE_GAP_TOL_FACTOR = 2.0    # x median real-wall thickness = seam-adjacency search band
MERGE_SHARE_MIN = 0.50        # shared edge >= 50% of the smaller room's parallel side
MERGE_WALL_COVER_MAX = 0.25   # same family as STAIR_OVERLAP_REJECT: measured-overlap threshold
MERGE_DOOR_TOL = 0.60         # m — door center within this of the seam blocks the merge (safety)
WALL_TOL = 0.45               # m — band around a seam/perimeter side within which a wall AABB
                               # counts as backing it (shared by R-MERGE's wall_cover and
                               # R-REJECT's enclosure — same constant, same physical meaning)
REJECT_ENCLOSURE = 0.25       # enclosure < this => REJECT (not a room — unbounded/exterior pocket)
SUSPECT_OPEN_ENCLOSURE = 0.50 # enclosure < this (and >= REJECT_ENCLOSURE) => KEEP + SUSPECT_OPEN
# §STAIRWELL-STACK (user report 2026-07-12: "still staircase well as a room", Terminal, screenshot
# ≈ Aras 01 R1): a stair SHAFT's per-storey flight footprint covers only ~0.22 of the shaft pocket
# (measured, Terminal) — under STAIR_OVERLAP_REJECT=0.35, which STAYS for the single-flight case —
# but flights STACKED through the same XY across storeys cover it 1.30–2.23x cumulatively, while
# the highest legitimate room measures 0.37 (clean gap). Controls: Duplex 0/21, JKR 0/79 false
# hits; Terminal exactly the 12 shaft rects on both variants (§STACK log, 2026-07-12). A shaft is
# a VERTICAL object — this is the vertical test the horizontal per-flight threshold cannot be.
STAIRWELL_STACK_REJECT = 0.50   # cumulative all-storey stair overlap >= this x pocket area…
STAIRWELL_STACK_MIN_LEVELS = 3  # …across at least this many distinct stair z-levels (~2m buckets)

def all_walls_raw(c):
    """§R-MERGE/§R-REJECT: whole-building real wall list (ifc_class LIKE 'IfcWall%' only — NOT the
    wider WALL_LIKE raster set flood-fill uses for enclosure — with z, for the seam/perimeter
    wall-coverage tests). (cx,cy,cz,bx,by,bz) tuples."""
    rows = c.execute(
        "SELECT t.center_x,t.center_y,t.center_z,COALESCE(t.bbox_x,0),COALESCE(t.bbox_y,0),COALESCE(t.bbox_z,0) "
        "FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid "
        "WHERE m.ifc_class LIKE 'IfcWall%' AND m.discipline='ARC' AND t.center_x IS NOT NULL").fetchall()
    return [tuple(r) for r in rows]

def all_stairs_z(c):
    """§STAIRWELL-STACK: whole-building stair/ramp footprints WITH z (cx,cy,cz,bx,by) — the
    vertical-stack test needs distinct z-levels, which storey_stairs' per-storey XY list drops."""
    cond = " OR ".join("m.ifc_class LIKE ?" for _ in STAIR_LIKE)
    rows = c.execute(
        f"SELECT t.center_x,t.center_y,t.center_z,COALESCE(t.bbox_x,0),COALESCE(t.bbox_y,0) "
        f"FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid "
        f"WHERE ({cond}) AND m.discipline='ARC' AND t.center_x IS NOT NULL", STAIR_LIKE).fetchall()
    return [tuple(r) for r in rows]

def _reject_stairwell(rooms, stairs_z):
    """§STAIRWELL-STACK: drop pockets that are vertical stair shafts (see constants above)."""
    out = []
    for r in rooms:
        x0, y0, x1, y1 = _room_bbox(r)
        area = max(1e-6, (x1 - x0) * (y1 - y0))
        cum = 0.0; levels = set()
        for scx, scy, scz, sbx, sby in stairs_z:
            ox = max(0.0, min(x1, scx + sbx / 2) - max(x0, scx - sbx / 2))
            oy = max(0.0, min(y1, scy + sby / 2) - max(y0, scy - sby / 2))
            o = ox * oy
            if o > 0.01:
                cum += o; levels.add(round((scz or 0.0) / 2))
        if cum / area >= STAIRWELL_STACK_REJECT and len(levels) >= STAIRWELL_STACK_MIN_LEVELS:
            print(f"    skip stairwell-stack pocket area={round(area)} stack={cum / area:.2f} levels={len(levels)}")
            continue
        out.append(r)
    return out

def all_doors_raw(c):
    """§R-MERGE: whole-building real door centers (with z) for the seam door-block test."""
    rows = c.execute(
        "SELECT t.center_x,t.center_y,t.center_z "
        "FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid "
        "WHERE m.ifc_class LIKE 'IfcDoor%' AND m.discipline='ARC' AND t.center_x IS NOT NULL").fetchall()
    return [tuple(r) for r in rows]

def _wall_thickness(walls):
    ts = sorted(min(w[3], w[4]) for w in walls if min(w[3], w[4]) > 0.01)
    return ts[len(ts) // 2] if ts else 0.0

def _union_len(segs):
    if not segs: return 0.0
    segs = sorted(segs)
    tot = 0.0; lo, hi = segs[0]
    for a, b in segs[1:]:
        if a > hi:
            tot += hi - lo; lo, hi = a, b
        else:
            hi = max(hi, b)
    return tot + (hi - lo)

def _room_bbox(r):
    xs0 = min(rc["cx"] - rc["sx"] / 2 for rc in r["rects"])
    xs1 = max(rc["cx"] + rc["sx"] / 2 for rc in r["rects"])
    ys0 = min(rc["cy"] - rc["sy"] / 2 for rc in r["rects"])
    ys1 = max(rc["cy"] + rc["sy"] / 2 for rc in r["rects"])
    return xs0, ys0, xs1, ys1

def _shared_edge(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1, gap_tol):
    ox = min(ax1, bx1) - max(ax0, bx0)
    oy = min(ay1, by1) - max(ay0, by0)
    gapy = max(ay0, by0) - min(ay1, by1)
    gapx = max(ax0, bx0) - min(ax1, bx1)
    if ox > 0 and 0 <= gapy <= gap_tol:
        lo, hi = max(ax0, bx0), min(ax1, bx1)
        ymid = (min(ay1, by1) + max(ay0, by0)) / 2
        return ("x", lo, hi, ymid, ox, ox / min(ax1 - ax0, bx1 - bx0))
    if oy > 0 and 0 <= gapx <= gap_tol:
        lo, hi = max(ay0, by0), min(ay1, by1)
        xmid = (min(ax1, bx1) + max(ax0, bx0)) / 2
        return ("y", lo, hi, xmid, oy, oy / min(ay1 - ay0, by1 - by0))
    return None

def _merge_rooms(rooms, walls, doors_xyz):
    """§R-MERGE: union same-storey pockets whose shared seam is wall-free (no real wall backing the
    boundary => a synthetic flood-fill/door-partition split, not an architectural wall). `walls`/
    `doors_xyz` are whole-building lists (thickness + coverage measured across the building, per
    the spec); the pairwise test itself only ever compares same-storey rooms (the caller passes one
    storey's room list at a time)."""
    n = len(rooms)
    if n < 2:
        return rooms
    wall_t = _wall_thickness(walls)
    gap_tol = MERGE_GAP_TOL_FACTOR * wall_t
    boxes = [_room_bbox(r) for r in rooms]
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]; x = parent[x]
        return x
    merges = 0
    for i, j in itertools.combinations(range(n), 2):
        if find(i) == find(j):
            continue
        ax0, ay0, ax1, ay1 = boxes[i]; bx0, by0, bx1, by1 = boxes[j]
        se = _shared_edge(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1, gap_tol)
        if not se:
            continue
        axis, lo, hi, mid, slen, frac = se
        if frac < MERGE_SHARE_MIN:
            continue
        zlo = min(rooms[i]["cz"] - rooms[i]["sz"] / 2, rooms[j]["cz"] - rooms[j]["sz"] / 2)
        zhi = zlo + 3.0
        segs = []
        for (wcx, wcy, wcz, wbx, wby, wbz) in walls:
            if not (zlo - 1 <= wcz <= zhi + 1):
                continue
            wx0, wx1 = wcx - wbx / 2, wcx + wbx / 2
            wy0, wy1 = wcy - wby / 2, wcy + wby / 2
            if axis == "x":
                if wy0 - WALL_TOL <= mid <= wy1 + WALL_TOL:
                    s0, s1 = max(wx0, lo), min(wx1, hi)
                    if s1 > s0: segs.append((s0, s1))
            else:
                if wx0 - WALL_TOL <= mid <= wx1 + WALL_TOL:
                    s0, s1 = max(wy0, lo), min(wy1, hi)
                    if s1 > s0: segs.append((s0, s1))
        cover = _union_len(segs) / slen if slen > 0 else 1.0
        if cover > MERGE_WALL_COVER_MAX:
            continue
        door_here = False
        for (dcx, dcy, dcz) in doors_xyz:
            if not (zlo - 0.3 <= dcz <= zlo + 2.5):
                continue
            if axis == "x" and lo <= dcx <= hi and abs(dcy - mid) <= MERGE_DOOR_TOL:
                door_here = True; break
            if axis == "y" and lo <= dcy <= hi and abs(dcx - mid) <= MERGE_DOOR_TOL:
                door_here = True; break
        if door_here:
            continue
        parent[find(i)] = find(j); merges += 1
    if not merges:
        return rooms
    groups = {}
    for i in range(n):
        groups.setdefault(find(i), []).append(i)
    out = []
    for members in groups.values():
        if len(members) == 1:
            out.append(rooms[members[0]]); continue
        merged_rects = []
        for m in members: merged_rects.extend(rooms[m]["rects"])
        total_area = sum(rooms[m]["area"] for m in members)
        rep = max(members, key=lambda m: rooms[m]["area"])  # largest member = provenance base
        merged = dict(rooms[rep])
        merged["rects"] = merged_rects
        merged["area"] = total_area
        merged["cx"] = merged_rects[0]["cx"]; merged["cy"] = merged_rects[0]["cy"]
        merged["sx"] = merged_rects[0]["sx"]; merged["sy"] = merged_rects[0]["sy"]
        merged["door_rescued"] = any(rooms[m].get("door_rescued") for m in members)
        merged["door_partitioned"] = any(rooms[m].get("door_partitioned") for m in members)
        merged["merged_from"] = len(members)
        out.append(merged)
    return out

def _rect_enclosure(rx0, ry0, rx1, ry1, walls):
    per = 2 * ((rx1 - rx0) + (ry1 - ry0))
    if per <= 0:
        return 0.0
    covered = 0.0
    for side in ("N", "S", "E", "W"):
        segs = []
        if side in ("N", "S"):
            y = ry1 if side == "N" else ry0
            for (wcx, wcy, wcz, wbx, wby, wbz) in walls:
                wy0, wy1 = wcy - wby / 2, wcy + wby / 2
                if wy0 - WALL_TOL <= y <= wy1 + WALL_TOL:
                    wx0, wx1 = wcx - wbx / 2, wcx + wbx / 2
                    lo, hi = max(wx0, rx0), min(wx1, rx1)
                    if hi > lo: segs.append((lo, hi))
        else:
            x = rx1 if side == "E" else rx0
            for (wcx, wcy, wcz, wbx, wby, wbz) in walls:
                wx0, wx1 = wcx - wbx / 2, wcx + wbx / 2
                if wx0 - WALL_TOL <= x <= wx1 + WALL_TOL:
                    wy0, wy1 = wcy - wby / 2, wcy + wby / 2
                    lo, hi = max(wy0, ry0), min(wy1, ry1)
                    if hi > lo: segs.append((lo, hi))
        covered += _union_len(segs)
    return covered / per

def _room_enclosure(r, walls):
    zlo = r["cz"] - r["sz"] / 2 - 1.5; zhi = r["cz"] + r["sz"] / 2 + 1.5
    ws = [w for w in walls if zlo <= w[2] <= zhi]
    rects = r["rects"]
    tot_area = sum(rc["sx"] * rc["sy"] for rc in rects) or 1.0
    e = 0.0
    for rc in rects:
        rx0, rx1 = rc["cx"] - rc["sx"] / 2, rc["cx"] + rc["sx"] / 2
        ry0, ry1 = rc["cy"] - rc["sy"] / 2, rc["cy"] + rc["sy"] / 2
        e += (rc["sx"] * rc["sy"]) * _rect_enclosure(rx0, ry0, rx1, ry1, ws)
    return e / tot_area

def _reject_rooms(rooms, walls):
    """§R-REJECT: drop pockets whose enclosure (wall-backed fraction of their own perimeter) falls
    below REJECT_ENCLOSURE — an unbounded/exterior pocket, not a room. Only ever REMOVES rooms
    (containment trivially preserved). Rooms in [REJECT_ENCLOSURE, SUSPECT_OPEN_ENCLOSURE) that were
    NOT already flagged suspect for another reason (§ROOM-FORM's NO_DOOR/OPEN test) get newly
    flagged SUSPECT_OPEN here — an already-suspect room's existing reason is left untouched (never
    invents a priority ordering between two different suspect causes the spec didn't specify)."""
    out = []
    for r in rooms:
        enc = _room_enclosure(r, walls)
        r["enclosure"] = enc
        if enc < REJECT_ENCLOSURE:
            continue
        if enc < SUSPECT_OPEN_ENCLOSURE and not r.get("suspect"):
            r["suspect"] = "OPEN"
        out.append(r)
    return out

# §NO-OVERLAP (2026-07-13, user request — "rooms are stacked to each other, not overlapping"):
# a hard geometric invariant, not a fuzzy threshold — two real rooms can never occupy the same
# floor space. Both compile paths already guarantee this BY CONSTRUCTION (flood-fill rooms are
# disjoint connected components of the enclosed grid; door-partition rooms are disjoint BFS-owned
# cell sets) — verified directly against real compiled data, 0 violations across 773 rect rows in
# 6 real buildings (SampleCastle/HHS/Clinic/Garage/Hospital/Terminal). This check exists as a
# permanent regression guard against that invariant ever breaking (e.g. a future R-MERGE/§MULTI-RECT
# change), not because a violation is currently expected — informs like §PHASE0-HEALTH, never blocks.
def _verify_no_overlap(allrooms):
    by_storey = {}
    for r in allrooms:
        by_storey.setdefault(r["storey"], []).append(r)
    hits = 0
    for st, rooms in by_storey.items():
        for i in range(len(rooms)):
            for j in range(i + 1, len(rooms)):
                ri, rj = rooms[i], rooms[j]
                if ri["guid"] == rj["guid"]:
                    continue
                for a in (ri.get("rects") or [ri]):
                    ax0, ax1 = a["cx"] - a["sx"] / 2, a["cx"] + a["sx"] / 2
                    ay0, ay1 = a["cy"] - a["sy"] / 2, a["cy"] + a["sy"] / 2
                    for b in (rj.get("rects") or [rj]):
                        bx0, bx1 = b["cx"] - b["sx"] / 2, b["cx"] + b["sx"] / 2
                        by0, by1 = b["cy"] - b["sy"] / 2, b["cy"] + b["sy"] / 2
                        ox = min(ax1, bx1) - max(ax0, bx0)
                        oy = min(ay1, by1) - max(ay0, by0)
                        if ox > 0 and oy > 0 and ox * oy > 0.5:
                            hits += 1
                            print(f"  ⚠ §NO-OVERLAP VIOLATION storey={st!r} {ri['guid']} vs "
                                  f"{rj['guid']} overlap={ox*oy:.2f}m2")
    if not hits:
        print("§NO-OVERLAP: 0 cross-room overlaps (invariant holds)")
    return hits

def main():
    if len(sys.argv) < 2:
        print(__doc__); return
    db = sys.argv[1]; write = "--write" in sys.argv
    con = sqlite3.connect(db); c = con.cursor()
    data_health_guard(c, building_label=db.rsplit("/", 1)[-1])  # §PHASE0-HEALTH, runs first, never blocks
    # storey guid map (for parent_guid)
    st_guid = {}
    try:
        for g, n in c.execute("SELECT guid, name FROM spatial_structure WHERE type='IfcBuildingStorey'").fetchall():
            st_guid[n] = g
    except Exception:
        pass
    # §7 self-scaling anchors: this building's own median door width/height (§ROOM-FORM/§WALL-VERT)
    # + per-storey wall-z anchors (§STOREY-Z).
    door_w_med, door_h_med = door_stats(c)
    vert_min = VERT_FACTOR * door_h_med if door_h_med > 0 else 0.0
    anchors = storey_z_anchors(c)
    by = storey_walls(c, vert_min, anchors)
    stairs_by = storey_stairs(c)
    doors_by = storey_doors(c, anchors)
    # §STAIR-EXCLUDE: stair storey is often 'Unknown'/unassigned in the extract, and a stair is a
    # CONTINUOUS vertical shaft anyway — so test every room pocket against the UNION of all stair
    # footprints by XY (not per-storey). A staircase at an XY is circulation on whatever floor it cuts.
    all_stairs = [s for lst in stairs_by.values() for s in lst]
    # §R-MERGE/§R-REJECT: whole-building wall/door lists (not the per-storey raster set) — the
    # thickness/coverage measurements are building-wide, per the spec.
    all_walls_raw_list = all_walls_raw(c)
    all_doors_raw_list = all_doors_raw(c)
    all_stairs_z_list = all_stairs_z(c)   # §STAIRWELL-STACK
    # §LOCAL-FRAME (ROOM_WALKER_PHASE_INVARIANCE.md S2, 2026-07-17): rebase every x/y the compile
    # touches to a building-local origin (the raster wall set's own min corner — pure EXTRACT) and
    # quantize to QUANT. Under a constant frame translation Δ, (x+Δ)-(min+Δ) differs from (x-min)
    # by only FP rounding (measured ≤ ~1e-10 m at |Δ|=1e6), so after 1µm quantization every number
    # entering flood/partition/merge/reject is BIT-IDENTICAL in any frame — the compile provably
    # cannot depend on the frame. Measured before this fix: 8/14 constant translations changed the
    # room set (50-54 vs 51) via knife-edge comparisons on absolute coords (e.g. a 3-cell pocket's
    # (wx1-wx0) >= NOISE_FLOOR_DIM at exact equality — §DOOR-RESCUE flips, door_rescued 7→8 at
    # Δ=(0.1,0.1)). After: 14/14 EQUAL (§W-FRAME-EQ). Output rooms are un-rebased on emit, so
    # written coords stay in the DB's own frame. z is untouched (no raster on z; anchors translate
    # with the data). QUANT=1e-6 m: >=4 orders above worst FP jitter, 3 orders below data (mm).
    QUANT = 1e-6
    def _q(v): return math.floor(v / QUANT + 0.5) * QUANT
    _rw = [w for lst in by.values() for w in lst]
    org_x = min(w[0] - w[3] / 2 for w in _rw) if _rw else 0.0
    org_y = min(w[1] - w[4] / 2 for w in _rw) if _rw else 0.0
    def _rb6(t): return (_q(t[0] - org_x), _q(t[1] - org_y), t[2], _q(t[3]), _q(t[4]), t[5])
    def _rb4(t): return (_q(t[0] - org_x), _q(t[1] - org_y), _q(t[2]), _q(t[3]))
    by = {st: [_rb6(w) for w in lst] for st, lst in by.items()}
    all_stairs = [_rb4(s) for s in all_stairs]
    doors_by = {st: [_rb4(d) for d in lst] for st, lst in doors_by.items()}
    all_walls_raw_list = [_rb6(w) for w in all_walls_raw_list]
    all_doors_raw_list = [(_q(t[0] - org_x), _q(t[1] - org_y), t[2]) for t in all_doors_raw_list]
    all_stairs_z_list = [(_q(t[0] - org_x), _q(t[1] - org_y), t[2], _q(t[3]), _q(t[4])) for t in all_stairs_z_list]
    total = 0; door_rescued_total = 0; door_partition_total = 0; allrooms = []; st_z = {}
    merged_total = 0; rejected_total = 0
    for st in sorted(by):
        ws = by[st]
        if len(ws) < 3:
            print(f"  storey {st!r}: walls={len(ws)} (too few — skip)"); continue
        doors = doors_by.get(st, [])
        rooms_flood = flood_rooms(ws, all_stairs, doors, door_w_med)
        # §DOOR-PARTITION gate: flood-fill found far fewer rooms than this storey has real doors —
        # it has structurally failed here, fall back to nearest-door partitioning (never overrides
        # an already-working floor — see the ratio derivation above).
        if doors and len(rooms_flood) < DOOR_SHORTFALL_RATIO * len(doors):
            rooms = partition_by_doors(ws, doors, all_stairs, door_w_med)
            method = f"door-partition (flood-fill only found {len(rooms_flood)}/{len(doors)} doors)"
        else:
            rooms = rooms_flood
            method = "flood-fill"
        # §R-MERGE then §R-REJECT (ordering per spec: merge first, reject sees the post-merge shape).
        pre_merge_n = len(rooms)
        rooms = _merge_rooms(rooms, all_walls_raw_list, all_doors_raw_list)
        merged_n = pre_merge_n - len(rooms)
        pre_reject_n = len(rooms)
        rooms = _reject_rooms(rooms, all_walls_raw_list)
        rooms = _reject_stairwell(rooms, all_stairs_z_list)   # §STAIRWELL-STACK, after R-REJECT
        rejected_n = pre_reject_n - len(rooms)
        # §LOCAL-FRAME: un-rebase on emit — everything after this point (report, no-overlap guard,
        # write + element containment against absolute DB coords) sees the DB's own frame again.
        for r in rooms:
            r["cx"] += org_x; r["cy"] += org_y
            for rc in r["rects"]:
                rc["cx"] += org_x; rc["cy"] += org_y
        merged_total += merged_n; rejected_total += rejected_n
        if merged_n or rejected_n:
            print(f"    R-MERGE merged {merged_n} pocket(s) → {pre_reject_n} rooms; "
                  f"R-REJECT dropped {rejected_n} non-room pocket(s)")
        total += len(rooms)
        rescued = sum(1 for r in rooms if r.get('door_rescued'))
        partitioned = sum(1 for r in rooms if r.get('door_partitioned'))
        suspects = sum(1 for r in rooms if r.get('suspect'))
        door_rescued_total += rescued; door_partition_total += partitioned
        st_z[st] = sum(w[2] for w in ws) / len(ws)  # storey z = mean wall centre-z
        print(f"  storey {st!r}: walls={len(ws)} doors={len(doors)} [{method}] → rooms={len(rooms)} "
              f"(door_rescued={rescued} door_partitioned={partitioned} suspect={suspects})  areas={[round(r['area']) for r in rooms]}")
        for k, r in enumerate(rooms):
            r["storey"] = st; r["guid"] = f"RM_{st}_{k+1}".replace(" ", "_")
            # §APPROX: '≈' marks the room as compiled/approximate in the lens label; '⚠' marks a
            # §ROOM-FORM SUSPECT (kept visible for the future review feature, never silently dropped).
            # parent_guid → a compiled storey row (created below) so the Room lens groups per floor.
            mark = "⚠" if r.get("suspect") else "≈"
            r["name"] = f"{mark} {st} R{k+1}"; r["parent"] = st_guid.get(st) or ("STC_" + st).replace(" ", "_")
            allrooms.append(r)
    suspect_total = sum(1 for r in allrooms if r.get('suspect'))
    print(f"TOTAL compiled rooms = {total} (door_rescued={door_rescued_total} door_partitioned={door_partition_total} "
          f"suspect={suspect_total} merged={merged_total} rejected={rejected_total})")
    _verify_no_overlap(allrooms)
    if not write:
        print("(dry run — pass --write to inject)"); return
    # ensure spatial_structure has bbox columns
    cols = [r[1] for r in c.execute("PRAGMA table_info(spatial_structure)").fetchall()] if \
        c.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='spatial_structure'").fetchall() else None
    if cols is None:
        c.execute("""CREATE TABLE spatial_structure (guid TEXT, type TEXT, name TEXT, parent_guid TEXT,
                     object_type TEXT, predefined_type TEXT, center_x REAL, center_y REAL, center_z REAL,
                     size_x REAL, size_y REAL, size_z REAL)"""); cols = []
    def _addcol(table, col, typ):
        try: c.execute(f"ALTER TABLE {table} ADD COLUMN {col} {typ}")
        except sqlite3.OperationalError: pass  # already exists — fine
    for col in ("center_x","center_y","center_z","size_x","size_y","size_z"):
        _addcol("spatial_structure", col, "REAL")
    for col in ("object_type","predefined_type","room_guid"):
        _addcol("spatial_structure", col, "TEXT")
    # §APPROX: compiled storey rows (only where the DB has none) so the Room lens can group
    # rooms per floor via parent_guid → IfcBuildingStorey.name. Idempotent on the STC_ prefix.
    c.execute("DELETE FROM spatial_structure WHERE type='IfcBuildingStorey' AND guid LIKE 'STC_%'")
    for st in sorted(st_z):
        if not any(r["storey"] == st for r in allrooms):
            continue
        c.execute("INSERT INTO spatial_structure (guid,type,name,parent_guid,object_type,"
                  "predefined_type,center_z) VALUES (?,?,?,?,?,?,?)",
                  (("STC_" + st).replace(" ", "_"), "IfcBuildingStorey", st, None, "COMPILED", None, st_z[st]))
    # remove any prior compiled rooms (idempotent)
    c.execute("DELETE FROM spatial_structure WHERE type='IfcSpace' AND guid LIKE 'RM_%'")
    for r in allrooms:
        # predefined_type distinguishes which compile technique found each room (wall-enclosure vs
        # §DOOR-RESCUE small room vs §DOOR-PARTITION) for traceability — object_type stays 'COMPILED'
        # either way (the tag spacesOf()'s exclusion filter and every tag-purity check key on).
        # §ROOM-FORM: SUSPECT_* overrides — the room failed "well formed, fully enclosed, has door"
        # and is carried as a review candidate, not as a trusted room.
        ptype = ("SUSPECT_" + r["suspect"]) if r.get("suspect") else \
                "INTERNAL_DOORPART" if r.get("door_partitioned") else \
                "INTERNAL_SMALL" if r.get("door_rescued") else "INTERNAL"
        # §MULTI-RECT: one row per sub-rect, ALL sharing room_guid (= the primary rect's guid) and
        # the same name/type — N rects, ONE logical room. Sub-rect guids get a letter suffix
        # (RM_..._5, RM_..._5b, RM_..._5c) so 'RM\_%' patterns keep matching every row.
        for ri, rc in enumerate(r.get("rects") or [{"cx": r["cx"], "cy": r["cy"], "sx": r["sx"], "sy": r["sy"]}]):
            g = r["guid"] if ri == 0 else r["guid"] + chr(ord('a') + ri)
            c.execute("INSERT INTO spatial_structure (guid,type,name,parent_guid,object_type,predefined_type,"
                      "center_x,center_y,center_z,size_x,size_y,size_z,room_guid) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
                      (g, "IfcSpace", r["name"], r["parent"], "COMPILED", ptype,
                       rc["cx"], rc["cy"], r["cz"], rc["sx"], rc["sy"], r["sz"], r["guid"]))
    # rel_contained_in_space: elements whose XY centre falls inside a room (compiled)
    if not c.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='rel_contained_in_space'").fetchall():
        c.execute("CREATE TABLE rel_contained_in_space (space_guid TEXT, element_guid TEXT)")
    c.execute("DELETE FROM rel_contained_in_space WHERE space_guid LIKE 'RM_%'")
    els = c.execute("SELECT m.guid, m.storey, t.center_x, t.center_y FROM elements_meta m "
                    "JOIN element_transforms t ON t.guid=m.guid WHERE t.center_x IS NOT NULL").fetchall()
    rel = 0
    byst = {}
    # §ROOM-FORM: SUSPECT rooms get no element containment — an unreviewed corridor/void must not
    # capture elements away from real rooms.
    for r in allrooms:
        if r.get("suspect"): continue
        byst.setdefault(r["storey"], []).append(r)
    for g, st, ex, ey in els:
        for r in byst.get(st, []):
            # §MULTI-RECT: contained iff inside ANY of the room's rects; the rel row keys the
            # LOGICAL room guid so downstream still sees one room, not N.
            hit = False
            for rc in (r.get("rects") or [r]):
                if abs(ex - rc["cx"]) <= rc["sx"]/2 and abs(ey - rc["cy"]) <= rc["sy"]/2:
                    hit = True; break
            if hit:
                c.execute("INSERT INTO rel_contained_in_space (space_guid, element_guid) VALUES (?,?)", (r["guid"], g)); rel += 1
                break
    # §ROOM_WALKER_VERSION_STAMP stage 2 (write side only): record WHICH algorithm version compiled
    # these rooms, so stage 3 can later trust-until-version-moves-on instead of trust-forever.
    # Missing row = compiled before this shipped (counts as maximally stale once stage 3 reads it).
    c.execute("CREATE TABLE IF NOT EXISTS rooms_meta (id INTEGER PRIMARY KEY CHECK(id=1), "
              "version TEXT, built_at TEXT, room_count INTEGER)")
    c.execute("INSERT OR REPLACE INTO rooms_meta (id, version, built_at, room_count) VALUES (1,?,?,?)",
              (ROOM_WALKER_V, datetime.datetime.now(datetime.timezone.utc).isoformat(), len(allrooms)))
    con.commit()
    rect_rows = sum(len(r.get("rects") or [None]) for r in allrooms)
    print(f"WROTE {len(allrooms)} rooms as {rect_rows} IfcSpace rect rows + {rel} rel_contained_in_space rows")
    print(f"§ROOMS_META stamped version={ROOM_WALKER_V} room_count={len(allrooms)}")

if __name__ == "__main__":
    main()
