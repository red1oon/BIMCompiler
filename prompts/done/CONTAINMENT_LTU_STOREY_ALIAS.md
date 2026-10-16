# ⚠ DO NOT REMOVE — Scope & Working Rules

Scope: `scripts/compile_rooms.py`'s `rel_contained_in_space` write block ONLY (the
element→room containment join, ~line 1289-1313). Do NOT touch room detection/flood-fill
itself (ARC-only wall/door geometry stays exactly as-is) — only which elements get matched
to already-detected rooms. Read the log after every run (row counts, by discipline).

## 1. Origin — why this file exists

`prompts/Viewer/FLY_TOUR_DLOD_SCALE.md` §5 names room-level occlusion (the Fly Tour's biggest
remaining interior-flight lever, 8.9 vs 44k elements/room) as **BLOCKED**: `rel_contained_in_space`
covers only 1.3% of LTU_AHouse's elements (1,608 of 125,698, across 181 spaces) — "not a logic
problem, a data problem... belongs in a separate spec." This is that spec.

## 2. Root cause (verified via SQL against `deploy/buildings/LTU_AHouse_extracted.db`, not assumed)

`compile_rooms.py`'s containment join keys on **exact string equality** of `elements_meta.storey`
(`byst.setdefault(r["storey"], []).append(r)` groups rooms; `for r in byst.get(st, []):` looks up
each element by its own `storey` string). Rooms are only ever detected/keyed under the ARC storey
string (room flood-fill uses `WALL_LIKE` = ARC classes only). But each discipline's source IFC used
its OWN floor-naming convention:

```
discipline(s)                storey label      count    center_z: avg / min / max
STR                           Ref.               297     3.34 / 0.91 / 5.82
STR, ARC                      VÅN 1 / VÅNING 1   853/1265  4.2-4.3 / 0.85-0.85 / 6.79-9.21
HEAT,VENT,SAN,PLB,HVAC,VOID   Plan 1 / Storey 1  ~46k     4.4-5.4 / 1.27-4.58 / 5.7-8.51
... (same pattern repeats for floors 2, 3, 4; STR alone also has VÅN 5, 19 elements)
ARC                            Unknown            3419     9.49 / 3.1 / 16.94   <- spans ALL floors
STR                            Unknown             644     7.84 / 1.15 / 14.46  <- spans ALL floors
ARC                            TAKPLAN             279    12.84 / 4.19 / 16.83  <- spans ALL floors
```

Z-band clustering (measured via `AVG/MIN/MAX(element_transforms.center_z)` grouped by
discipline+storey, full table in session log) confirms **VÅNING N ≡ VÅN N ≡ Plan N ≡ Storey N**
for the same N across all 4 real floors — a pure labeling mismatch, not a real spatial
difference. Of the 1,608 currently-matched rows, 1,593 are ARC and 15 are STR — **zero MEP**,
because no room is ever keyed `"Plan 1"`/`"Storey N"`. MEP is 83.7% of the building's elements.

`Unknown`/`TAKPLAN`/`Ref.` are a SEPARATE, genuinely different case — their Z range spans the
**entire building height**, not one band, so no string-alias can resolve them; they need a
per-element nearest-floor lookup. `compile_rooms.py` already has exactly this mechanism for a
similar problem (`storey_z_anchors()` / `_assign_by_z()`, lines 229-254, built for HHS's
'Unknown'-storey curtain-wall children) — reuse it, don't build a second one.

## 3. SPEC

1. **Canonical floor key** — a small deterministic function: strip a known discipline prefix
   (`VÅNING`, `VÅN`, `Plan`, `Storey`, case-insensitive) + trailing digit → `"F<digit>"`. Anything
   that doesn't match one of these forms (i.e. `Unknown`, `TAKPLAN`, `Ref.`, and any future unknown
   label) falls through to step 2, never guessed.
2. **Z-band resolve the fallthrough set** — for elements whose storey does NOT match step 1's
   pattern, reuse `storey_z_anchors()` (built from the now-canonical numbered floors' real mean Z)
   + `_assign_by_z()` to bucket them into the nearest canonical `F<digit>`, exactly the existing
   HHS technique, same call, same file.
3. **Apply the canonical key on BOTH sides of the containment join** — room grouping
   (`byst.setdefault`) keys on the room's OWN storey run through the same canonicalizer (rooms are
   ARC-only today, so this is a no-op for them, but keeps the join symmetric and future-proof if
   room detection ever grows a second source), and the element lookup (`byst.get(st, [])`) keys on
   the canonicalized element storey from steps 1-2.
4. **No change to room geometry, flood-fill, or which elements COUNT as walls/doors** — this task
   only widens which elements get tested against the (unchanged) detected room rectangles.

## 4. VERIFY — W-CONTAINMENT-ALIAS

On a **scratch copy** of `deploy/buildings/LTU_AHouse_extracted.db` (never the checked-in original):
run `compile_rooms.py --write` before and after the fix, diff `rel_contained_in_space` row counts
**broken down by discipline** (join back through `elements_meta.discipline`). Pass = a large,
honest increase that now includes non-zero MEP rows (proving the join actually widened, not just a
row-count coincidence) — no fixed target percentage claimed in advance (this is a data-quality
fix, not a tuned threshold). Report exact before/after numbers in the log, not an estimate.

### RESULT (2026-07-21) — implemented, W-CONTAINMENT-ALIAS PASS

`_canonical_floor()` + a `_join_key()` closure (both new, `scripts/compile_rooms.py`) collapse
`VÅNING N`/`VÅN N`/`Plan N`/`Storey N` onto one `F<n>` key on both sides of the containment join;
anything that doesn't match (Unknown/TAKPLAN/Ref./etc.) falls back to nearest-Z resolution against
canonical-floor anchors built from the (ARC-only) rooms' own `cz` — same nearest-anchor TECHNIQUE
as `_assign_by_z`/`storey_z_anchors` above it, but a fresh small closure rather than a literal call
to those two: they're anchored to raw ARC-wall storey strings for a different, earlier-pipeline
purpose (Unknown-storey wall/door reassignment BEFORE canonical floor keys exist), so reusing them
verbatim would need an extra re-canonicalization pass — the new closure is simpler for this join.

**W-CONTAINMENT-ALIAS** (`scripts/witness_containment_alias.py`, fresh scratch DB copies each run,
original fetched via `git show origin/fable/meshdb-livewire:scripts/compile_rooms.py`, never the
checked-in DB touched):
- **LTU_AHouse** (the building this spec targets): `rel_contained_in_space` **314 → 30,409** rows
  (0.25% → 24.2% of 125,698 positioned elements). Newly-covered disciplines: HEAT (0→7,998), PLB
  (0→7,059), VENT (0→6,220), HVAC (0→5,312), SAN (0→2,978), VOID (0→372) — the 83.7%-of-building
  MEP set the doc's root-cause section named. ARC 314→331 and STR 0→139 also grew slightly (Z-band
  now also resolves some of ARC's own Unknown/TAKPLAN elements). Room geometry byte-identical
  (529 rect rows before AND after) — confirms room detection/flood-fill was untouched, only the
  join widened. Zero SUSPECT-room containment leakage (before and after). PASS.
  24.2% is not 100% and isn't meant to be — containment is XY-rect-in-room, so elements outside
  every detected room's footprint (columns/beams in walls, MEP inside cavities, VÅNING 4's mostly-
  suspect floor) legitimately stay uncontained; the fix corrected the storey-mismatch EXCLUSION
  bug, not a claim of full coverage.
- **Regression check, 4 other buildings** (HHS_Office_Federated, Duplex, SampleHouse, Terminal —
  none of which use VÅNING/VÅN/Plan/Storey naming): containment row count, per-discipline
  breakdown, and room-rect count are **byte-identical before/after** on every one — confirms the
  fix is a true no-op elsewhere, not a blanket behavior change. (The witness script's own PASS/FAIL
  wording assumes LTU's widening scenario, so it reports "FAIL" on these — read as "0 diff", the
  correct and intended regression result, not a defect.)

### ADDENDUM (2026-07-21) — this fix alone never reaches real users; ported to room_walker.js

**Correction, not an extension of scope:** compile_rooms.py is the offline reference/verification
tool, run manually by developers. It is NOT what runs for real users — the viewer compiles rooms
CLIENT-SIDE, on demand, from whatever DB a user has loaded (including a building this codebase has
never seen before) via `A.ensureRooms()` in `viewer/navigate_find.js`, which calls `room_walker.js`
(bim-ootb) — the JS port of this exact file. `room_walker.js` had the IDENTICAL bug (same
`byst[r.storey]`/`byst[e.st]` exact-string join). Fixing only the Python side would have been a
proven, tested fix that never actually shipped to anyone.

**bim-ootb PR #950** ports `_canonicalFloor()`/`_joinKey()` verbatim into `room_walker.js` (same
regex, same Z-band-fallback technique) and bumps `ROOM_WALKER_V` v2→v3 so the existing stage-3
version-stamp self-heal (`ROOM_INJECTOR_NEEDLE.md`, `§NEEDLE_VERSION_STALE`) recompiles any
already-loaded building once and picks up the fix — **no OCI redistribution of any per-building DB
needed**, which is exactly what that self-heal mechanism is for. Parity witness
(`witness_containment_alias_js.js`, sql.js) confirms BYTE-IDENTICAL numbers to this file's Python
result: LTU_AHouse 314→30,409 rows, same per-discipline breakdown; same 4-building regression set
(HHS_Office_Federated, Duplex, SampleHouse, Terminal) byte-identical before/after in JS too.

## 5. NOT IN SCOPE

- Room geometry/flood-fill changes (ARC-only detection stays as-is).
- The viewer-side room-level occlusion feature itself — that's `FLY_TOUR_DLOD_SCALE.md` §5's job,
  gated on this fix landing first, and is its own follow-up spec/PR.
- Other buildings' containment coverage (Terminal's is a different, already-partially-addressed
  mismatch — `docs/archive/TerminalAnalysis.md` §S231 — not re-touched here).
