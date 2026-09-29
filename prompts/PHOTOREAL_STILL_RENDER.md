# ⚠ DO NOT REMOVE — Photoreal Still Render: spec for the "photoshop finish" idea (2026-07-15)
# SCOPE: a camera-still render mode aiming for archviz-marketing-image quality. Distinct from
#   MOBILE_PERF.md (that's runtime navigation speed — this is a deliberately expensive, idle-only,
#   opt-in still). Read the log after every run. This file is the spec — no implementation without
#   reading §HONEST VERDICT first; don't build past what that verdict promises.
# Full day-by-day history (2026-07-15 → 2026-08-11, ~7400 lines) archived verbatim, nothing lost:
#   prompts/archive/PHOTOREAL_STILL_RENDER_full_history_2026-07-15_to_2026-08-11.md
#   Consolidated 2026-08-11 per user ask ("prompts/# has got too long") — this file kept to the
#   evergreen spec + the still-OPEN threads only. Closed/shipped work is a one-line pointer with
#   its commit/PR; full diagnostic narrative for closed items lives in the archive if ever needed.

## ⛨ §WATCHDOG RESUME 2026-09-25 — RETIRED 2026-09-26 (history only). red1: no watchdog from now; one combined
## session works the cycle in §WORKING MODE below (its RULINGS + REFERENCES + LESSONS absorb this block).
**WATCHDOG STATE at suspend (red1-c6, 2026-09-25 evening) — read this first, then the rest of this block.**
Gated PASS (on bim-ootb branches, NOT on 8600, NOT merged): shadow edge 3883eebe · portal bias 2980872b/3edd28a8 · zone open sky
b4cb61c1 · cascades 0a9950a3 + meter-exists fix c56769bf (= feat/sourced-light-int remote) · lamp zone pick (FLYIN_DARK)
3df3e1bf (8622). FAIL: per-zone ADF daylight 522b3eac (DF > 100%) → replaced by §SKY_VIEW_FIELD (OPEN, option a: portals
retired; conditions: low elevations, CIE overcast, bent normal logged, one glass T, IRC OFF by default). In build: sky field
(/tmp/wt-daylight, 8621), glow layers DELETE (/tmp/wt-noglow, 8623). Specs OPEN, not built: §COVE_LIGHT (all compartments,
deficit vs EN 12464-1, voids 100 lx watchdog decision), §GLASS_VEIL (premultiplied, T+Fresnel only), §METER_HIST (70/95
from Unreal docs; red1 A/B of avg/centre/hist at café-corner + stair poses before any default change), ENTRANCE_GLOW (may
close with the glow deletion). red1 served tree for looks: 8619 = e61c116b (frozen); 8622 = lamp pick. 8600 unchanged
(b35d5cf9 v1337). References: see the baseline lines below + 'outside looking in' …319885328 + fly-in series.
Alt+C: parked until the zero list; plan prompts/ALTC_FOUNDATION.md + ALTC_SHOWSTOPPERS.md; rules: Alt+S = lighting truth
(BUILD cached + DECIDE per frame), films steady exposure by default, ramp opt-in last, continuity not identity.
**ON RESUME, watchdog's first two rulings (dev paused, all pushed, §DEV RESUME 155e37363):**
(1) SKY FIELD 59e0b22d (8621): gate good (SKY_STEP 528->0 / 384->0 on red1's Terminal poses, maxF <= 1, outside ref
  unchanged, link -6%, no >2x exposure drop) BUT with IRC OFF (my ruling) a real GI still leaves the Terminal hall black
  (345/564; hall_floor 279/573; &irc=1: 75 / 13). Screen-space GI has no lit neighbour under opaque roofs. Decide: IRC on
  with a no-double-count rule, or a real interreflection pass, or keep portals for opaque-roof zones. Watchdog leaning: IRC
  ON as the zone's diffuse bounce floor, and the screen GI adds only what exceeds it (no double count), logged per share.
(2) GLOW REMOVAL 92b36bdb (8623): grep 0 refs; ITEM_C glowDraws 3 -> 0 at red1's Clinic pose, nothing emissive behind the
  glass = item C cause confirmed. K lamps without an emissive mesh = 14/98/28, ALL synthetic no-guid lamps: check they are
  fabricated staging lights (red1 rule: only real sources) — if so, remove them rather than give them shapes. Two old
  witnesses test deleted code: retire them.
(3) red1's look on the watchdog's combined tree (bim-ootb local branch look/combined-0925 9991dcee = 59e0b22d + 92b36bdb +
  3df3e1bf, /tmp/wt-look, :8624; flyin gate 5/5 PASS, cap 160 with portals retired, GUARD 0), 5 Hospital stills
  …331480796-…331589447: aerial fine; interiors no black (≤1.2%). CORRECTION: the soft dark blotches on the stair-tower
  wall and under the stair (…331509591, …331544049) PERSIST with portals retired, so they are NOT portal shadows (my
  earlier read was wrong). Suspects: N8AO screen-space AO at large radius, or far-cascade sun shadow blur. Next: log the
  AO term vs the sun-shadow term at points on that wall (one press, the §CAMDEP_SURFACE point set) — same probe also
  answers the Terminal ceiling halos (AO) item. Minor: slight green cast (g−r +2..+5) on 8622/8624 interiors.
(4) 2026-09-26 later: tower blotch SOLVED = lamp cap + portal light lost on no-sky walls (AO minor) → LAMP_UNCAPPED on
  the zero list; IRC ruling FINAL = ON with MAX(IRC, SSGI) per fragment. red1 dropped test sweeps for quick turnaround
  BUT wants in-viewer §FAULT logging per press to catch faults during debug (dev WIP f5ff2085 :8625, must move to
  §STILL_REFINE done + add fieldBad/unlitCeil/blown/dark). Open on :8624: RAINBOW VOXEL EDGE on a Hospital ceiling
  (Fable fix/field-zone-edge :8626 in flight), black ceilings/voids (cove), Clinic exterior warm orbs = the 2026-07-15
  PHOTO PROPS (effects.js _buildPhotoProps ~686-760: facade up/downlights, sconces, sparkle sprites; fabricated) —
  red1 asked: remove completely or off by day. Clinic glass opaque (item D). Clinic corridor 'perfect' reference.

You are the WATCHDOG (previous: red1-c6, before it red1-4b). You do not write viewer code. You gate every dev spec/step from pushed code + full
console-captured § logs, do ALL visual comparison yourself (red1's stills in ~/Downloads vs the baseline), relay red1's asks,
decide technical keep/park/order calls (red1: "full confidence"), and prove merges live. Dev session now: `red1-5a`
(ListAgents; it may be renewed — re-find it). red1 wants the dev to use Fable subagents for hard foundational pieces.
**BASELINE REPLACED (red1 2026-09-25): ~/Downloads/bounce_still_1790307025522.png** — Hospital atrium from a balcony,
v1337 sourced light, 1666x864: mean 92, p5 27, p95 203, >=235 0.2%, <=5 0.2%, RGB [86,94,98]. red1: "darker is expected,
but at least realistic"; how far the available light reaches in dark areas is a LATER tweak, not a defect. Known defect in
it: stair-stepped shadow of the stair flights on the stair-tower wall (shadow-edge lane). Old baseline kept for history only:
~/Downloads/PerfectIndoor.png (Hospital atrium from a balcony,
old lighting, 2776x1440): 8-bit mean 124, p5 55, p95 203, ≥235 2.0%, saturation 21.2, mean RGB [115,129,128]. NOT
BestHospitalIndoor.png. **Second reference (red1 approved 2026-09-25): Clinic indoor look, ~/Downloads/bounce_still_1790304784259.png**
(Clinic corridor/atrium, v1337 sourced light, 1666x864): mean 64, p5 9, p95 104, >=235 0.2%, mean RGB [65,66,60] (watchdog's own
PIL method; same method gives PerfectIndoor mean 124, p5 54, p95 203, sat 15.5 — compare like with like). It is a LOOK reference
(lamp-lit, neutral-warm, no black holes), not a brightness target.
**Baseline-to-be (red1 2026-09-25, "amazing"): Terminal indoor ~/Downloads/bounce_still_1790306684370.png** (v1337, 1666x864):
mean 118, p5 58, p95 208, >=235 0.1%, <=5 0.1%, RGB [109,119,128]. Becomes THE baseline once its defects are gone: dark
halos around ceiling diffusers/panels, stair-stepped dark band at the column top, a grey smear mid-ceiling (cause unknown). Latest v1337 indoor (bounce_still_1790304025519): mean 90, sat 13.3, RGB [84,91,95] = darker, flatter, colder.
**localhost:8600** = /tmp/wt-sourced-live detached at b35d5cf9 (feat/sourced-light, v1337). Watchdog smoke: 0 Shader Error /
0 Context Lost. KNOWN on it: (1) shaded EXTERIOR surfaces pure black (open-sky cells labelled indoor: 29,332 cells, zones 13/1);
(2) interiors dark/cold (missing per-zone daylight + roof glazing); (3) jagged/blocky sun-shadow edges + base gap. red1's
workaround for exteriors: &sourced=0. First Alt+S of a session is slow (~46 s link + ~2 min bounce build) — expected.
**In flight (verify with git/ps, not this note):** Fable agent in /tmp/wt-zone-sky (feat/zone-open-sky, :8614): OPEN-TO-SKY
= outside, COVERED = indoor, openings → per-zone daylight apertures; witness: shaded open-sky samples with hemi=0 → 0, Terminal
hall zone ≠ 0 (~174 m² aperture), crossWall 0. red1-5a in /tmp/wt-shadow-edge (feat/still-shadow-edge, :8615): shadow depth
near/far fitted to light-space depth extent (lesson from nav Shadow mode: its 609 m range vs Alt+S 19,748 m), bias = 1 fitted
texel, normalBias (R+1) texels, R 1.5; plus aerial wall-edge mismatch rate (ray vs lookup) and why the aerial box is 530x285 m
for a 102x137 footprint; near cascade (Fable) only if needed. Targets: predictedBaseGap < 0.05 m at 45° and 20°, acne 0,
thin-caster count reported.
**Then:** §SOURCED_DAYLIGHT (spec 481d42c43) → §WASH_FRACTION re-measure (café tone-mapped median target 0.55-0.70, ref
0.636; Clinic/Terminal WASH ≤ Hospital's; Terminal through-glass < shaded facade) → your comparison vs the baseline → speed
(CAP 2.3 s→<200 ms, frame ms, Alt+S session cache) → parity/films → one PR at lane end, prove live.
**Direction (red1 2026-09-25):** finish Alt+S, then apply it the best way to Alt+C (§FILM_PARITY). QUEUED AFTER, not now:
nav viewer colour — materials are identical in nav and Alt+S (§ALBEDO_SRGB off by default; triplanar only multiplies);
nav's flat fill (ambient 0.386 + hemi 0.617, scene.js) is the likely wash, UNPROVEN: side-by-side same pose first, then a
cheap zone-aware indoor fill / nearest lamps as a look change for red1.
**Witness duty (red1 2026-09-25):** the dev does no A/B visual checks (red1 + watchdog do). Witnesses must flag GLARING errors
before red1 sees them: each prints a FAIL count per known class (black_exterior, junction_zone_flip, covered_open_side_black,
acne, gap outside EDGE), target 0, run FAILs if > 0. A glaring error that reaches red1 past a green witness = the witness
is wrong: fix the witness first, then the code. Watchdog gates on those lines.
**Efficiency (red1 2026-09-25: "no more time wasting outside WITNESS logging"):** loop = witness FAILs on the known
v1337 defect AND reads 0 on a correct pose -> fix to 0 -> push -> § lines to watchdog -> gate -> red1 looks. Before arm run
ONCE and kept; only the after arm reruns; Hospital/Clinic/Terminal only; <=15 min per run; no side studies, short recaps.
**ALT+S TO ZERO FIRST (red1 2026-09-25: "let alt-s finish till zero"; watchdog has full authority to guide + answer).**
Alt+C (prompts/ALTC_FOUNDATION.md) waits, no parallel build. ZERO = every count below at 0 / in band, from logged lines:
  shadow gap45/20 < 0.05 m [PASS 3883eebe] · portal gap <= 0.025 m [PASS 2980872b] · thinCasterRisk <= max(0.05 m, 1.5 px at the cascade's
  near split) + texelPerPixel <= 2 (cascades; watchdog ruling 2026-09-25, pixel-based) · black_exterior 0 · junction_zone_flip 0 · canopy (covered_open_side_black, fixed
  predicate) 0 · §SKY_PORTAL_BLOCKED explained/0 · Terminal ceiling-fixture AO halo count 0 · §SOURCED_DAYLIGHT per-zone DF in
  BRE-plausible bands (café median REPORTED vs old 0.636, not a fail band: baseline replaced, no hand tuning) · FLYIN_DARK 0 (lamp pick by the zones lamps light, not fixture-in-frustum; red1's 5-pose fly-in)
  · GLOW_DECOR DELETED (red1 2026-09-25: "remove completely" §GLOW_LENS_QUAD + §PHOTO_GLOW_SPRITE, all paths, no flags; fixtures glow themselves)
  · LAMP_UNCAPPED (ALTC F1 moved into Alt+S 2026-09-26: tower blotch = lamp cap 160/547 + portal light lost on no-sky walls, AO minor; logs aosun_tower2/tw_p/blotch_tower)
  · PRE_LOOK_SWEEP PASS before any tree reaches red1 (red1 frowns on eye-found defects)
  · SKY_STEP 0 · GLASS_VEIL · BLACK_INTERIOR (answer FIXED by red1 2026-09-25: "a dark place just gets ceiling perimeter back glow" = zone-bound cove, real emitters, cited level, no flat fill; amended: ALL compartments incl. plenums/voids/shafts/MEP crevices get trim light — red1: "there are crevices where MEP goes thru") · ENTRANCE_GLOW · GUARD 0/0/0. Then red1's look on 8600 -> one PR -> live.
**red1's look test of 8619 (e61c116b), Hospital, 2026-09-25 14:01-14:05, 6 stills (pose in each PNG; watchdog notes):**
  GOOD: atrium stair from balcony (…099886, mean 94 ≈ baseline 92, stair-tower shadow now soft); ground-floor stair
  (…152626, mean 80, soft clean shadows); aerial courtyard (…292291) + close roof aerial (…353319): shaded facades grey,
  no black exteriors. BAD: small interior room (…225589, cam [9.9,-7.7,0.1]) 98% black; toilet (…255696, cam
  [8.3,-8.6,-3.6]) 57% black — only the lamp-facing side lit, the rest pure black (no bounce/base light reaches it).
  => new zero-list item BLACK_INTERIOR: zones with NO source (no lamp, portal, daylight DF, sky) and lit zones whose
  surfaces get ~0 — count zones/m2 from the grid; red1 principle 3 (cove base light for rooms with no window/fixture) is
  the spec'd answer. Held until red1 finishes testing Clinic/Terminal.
**… Terminal, 14:11-14:14, 4 stills:** GOOD: both exterior facades (…681554, …720592): shaded walls grey, canopy glass
  fine. BAD (glaring, voxel-shaped): canteen hall (…780362) walls split into a light lower band / dark upper band along a
  stair-stepped boundary with square notches; waiting hall (…842570) a stair-stepped WHITE wash region on the right wall and
  over-bright white chairs beside normally lit ones. Watchdog read: the binary per-cell SKY_BIT (24-ray sweep, nearest-cell
  lookup) — a cell either gets the FULL hemi or none, so the zone grid's cell edges draw on the walls and sky-lit cells
  wash. The canteen's stepped dark bands were already in red1's v1337 still (…716026). Fix direction to spec: a continuous
  sky-view fraction per cell (share of the rays that see sky), filtered between cells, scaling the hemi — no binary step.
  Witness: grid count of SKY_BIT on/off boundaries across visible wall/floor faces (m of edge), target 0 steps > one
  filter width. Minor: dark pockets under the Terminal's stepped roof edges; skyline towers show night-lit windows by day.
**… Clinic, 14:15-14:17, 4 stills:** GOOD: upper balcony over the atrium (…958870, mean 66) and the corridor (…063429,
  mean 69 ≈ approved ref 64: red1's corridor look holds). Small room (…988661) now LIT, not black, but pure-black bands and
  gaps where the ceiling panels meet the wall/each other (the void above the panels has no source = same class as
  BLACK_INTERIOR). Exterior (…938795): shaded facade grey (good), but a vertical white light shaft + round glow blobs show
  through the glazed entrance and its canopies in daylight — a lamp glow/halo drawn through solid geometry or left on
  outside by day. Skyline towers again show night windows by day.
**Batch sent to the dev after red1's 3-building test (watchdog order):** A BLACK_INTERIOR (grid count of zones/m2 with no
  source + red1 principle 3 cove base light) · B SKY_STEP (continuous filtered sky-view fraction instead of the binary
  SKY_BIT) · C ENTRANCE_GLOW (count of glow/halo quads drawn by day or failing the depth test) · minor: skyline day windows,
  Terminal roof-edge pockets.
**red1 14:26 (…317578153, Hospital, cam [-15.84,2.47,4.14] looking through a glazed pane into the atrium):** "the window
  glass should allow light thru or/and reflect the cam point of lite if any". Seen: the whole view behind the glass is a
  flat lavender-grey veil (no contrast, no colour, no lamp highlights), though that atrium renders lit and colourful
  without glass between. The pane acts as a fog layer, neither transmitting nor reflecting. => item D GLASS_VEIL.
**red1 14:35 (…317692247, Hospital atrium stair):** "too dark — light from outside and inside needs to be back in proper
  value due to blocking of sky/sun thru the walls". Watchdog: agreed. On 8619 a covered non-SKY_BIT cell gets no sky
  except via the 8 nearest portals; the sky-view field (OPEN, option a, portals retired) is the replacement. Added gate
  §LUX_CHECK: per-zone working-plane lux (sky-through, lamps, total) vs EN 12464-1 maintained illuminance by space use;
  < 50% FAIL-to-explain; meter exposure + stops vs outdoor logged. No exposure knob (rule 5).
**red1 APPROVED (2026-09-25 15:04), reference 'outside looking in': ~/Downloads/bounce_still_1790319885328.png** (Hospital,
  cam [-5.53,-0.54,-42.32], 8619 tree): sun through the curtain wall onto floors/stair "very good"; deeper interior dark
  but "acceptable as in real life we cannot see from outside in such well lit building. Only when entering the exposure
  changes." (mean 87, p5 35, p95 157, 0% black). Rule: seen from outside, interiors stay at outdoor exposure (no lift);
  exposure changes on entering (Alt+S: camera inside/outside meter; Alt+C: the F3 crossing ramp). The glass-veil fix must
  keep this view's look.
**ARCHITECTURE RULE (red1 2026-09-25): "make Alt+S the source of truth in managing such lighting so that Alt+C merely
inherits."** Every lighting decision (lamp pick, sky field, sun fit, glass, meter, cove) lives in ONE Alt+S function of
(camera, sun, time, visible geometry) with no still-only state; Alt+C calls the same functions per frame and adds ONLY
continuity (fades/hysteresis on picks, per-shot exposure hold, stable shadow boxes). No new look logic behind
`!A._maxqActive`; a film-only branch may exist only for smoothing, named as such. Gate: every Alt+S look commit lists
the functions it adds/changes and confirms the film path calls them (or names the smoothing it still needs).
**red1's 8622 series (lamp-zone-pick 3df3e1bf + cascades + meter fix), 7 Hospital stills …329927399-…330146959:**
  all 76-94 mean, black ≤ 1.4%; the fly-in end pose (…330146959, cam [-9.26,-12.30,12.16], near the old dark pose 5) is lit
  (was mean 40 / 39% black) — FLYIN_DARK confirmed by eye. Stair-tower wall (…329927399) carries a soft blurred shadow of
  the flights/railings: plausible sun shadow, not a defect. Lower atrium levels dark (awaits the sky field).
**red1 APPROVED (2026-09-26): Clinic corridor indoors "looks perfect" — ~/Downloads/bounce_still_1790352156838.png** (Clinic.db
  OCI &ghost=1, cam [21.243,-0.606,-1.261]); no regression allowed. Same session: exterior …352178540 shows a warm spot-pool
  disc + star glow behind the entrance glass by day (item: EXTERIOR_LIGHTS, target 0); side bays black → §COVE_LIGHT.
**Hi-res:** feat/still-res served on :8603 (/tmp/wt-stillres, old tree) for red1: &stillres=1440p works (2776x1440), 4k cap bug.
**Recurring traps:** 8600 must serve a clean committed tree (check `git status` of the SERVED worktree via `ps`); witnesses
must console-capture "Shader Error"/"Context Lost"; the exterior default pose + OCI URL is what red1 uses; the dev's
floorShareBySource probe was invalid; never trust a dev claim without reading the diff/log.

## ▶▶▶▶▶▶▶▶▶▶ §WORKING MODE from 2026-09-26 — NO WATCHDOG, FAST TURNAROUND (red1) — READ FIRST
The dev session works directly with red1 now; there is no watchdog gate. Report to red1 in plain words.
DEBUG CYCLE (red1's preferred loop):
1. red1 tests on localhost and saves stills; every saved PNG carries its pose (tEXt "bim-still-pose": cam, tgt, db, url,
   w/h; with feat/still-pose-host also host:port + sw). Read the pose from the PNG, never guess it.
2. Find the cause from STATE at that exact pose (page state + § log lines, one Alt+S), not from pixels and not by eye.
3. Fix in a side worktree on its own port; never edit the served look tree in place.
4. 1-minute smoke (viewer/tests/smoke_alts.js: loads, one real Alt+S, 0 Shader Error / Context Lost / pageerror), plus the
   §FAULT line at red1's pose for that defect, before -> after.
5. Fast-forward the ONE look tree red1 tests (/tmp/wt-look, :8624), bump sw + the ?v= tags, ONE commit per fix (so any one
   can be backed out), push. Tell red1: link + sha + one line of what changed.
No test suites, no A/B arms, no gate runs unless red1 asks. The viewer's own per-press §FAULT line (still_fault.js) is the
witness: its counters must cover every defect class red1 has found by eye; a defect red1 finds that §FAULT missed -> add the
counter in the same commit.
AGENTS: Sonnet for simple work (deletions, plumbing, reruns); Fable for genuinely tough pieces (unknown cause, new algorithm);
say which and why. One GPU browser at a time. Each agent in its own worktree/port; you review the diff and smoke it.
LESSONS LEARNED (2026-09-25/26):
- Check the WHOLE distribution, not the camera zone: the ADF daylight "passed" on camera zones while lit zones sat at
  14-33% DF and one at 125.6% (> 100% impossible); the meter hid it (exposure 2-3.5x down). Always log exposure next to any
  lighting change.
- A test harness can lie: a white override material broke spot shadows (every portal sample "dark"); MeshBasic skyline props
  were skipped as casters (their shadows counted as acne); an off-grid -1 was read as "unknown". Before trusting a count,
  check one sample by hand against the render path.
- A fix can break a neighbour silently: the cascade lights added with needsUpdate=false left every indoor §METER VACUOUS
  (maps did not exist before the fit). Grep the logs for VACUOUS / failed / NaN after every change, not just your own line.
- Exposure confounds A/B: switching sun shadows off moved the meter 14.3 -> 3.4. Lock exposure when comparing arms.
- Timing of a check matters: a report at staging end saw lamps that later switch off (191 vs 31 true).
- Camera-dependent staging makes "mutating" pictures: the lamp cap (keeps the N nearest to the camera), the portal pick and
  the meter change with the pose (café corner 2.2x brighter exposure than the stair; tower blotches = lamp cap + retired
  portal light). Prefer camera-free BUILD data + a cheap DECIDE step.
- red1's rules that bit: only REAL sources light surfaces (glow layers, synthetic room-fallback lamps and the photo props are
  fabricated — remove or ask); no brightness/exposure knobs; no invented values (cite a source or ask red1); the Alt+S look
  is the source of truth and films inherit it.
- Keep specs short and write them before code, but for small fixes a one-paragraph note in the commit is enough now.

RULINGS IN FORCE (combined from the retired watchdog red1-c6, 2026-09-25/26; don't re-litigate):
- PHOTO PROPS: REMOVE COMPLETELY (red1 2026-09-26, on the watchdog's recommendation): effects.js _buildPhotoProps ~686-760 —
  facade up/downlights, sconces, _photoSparkles, and any other fabricated staging light — code and all, every path, like the
  glow layers (deleted 92b36bdb). Night facade lighting later only from real model fixtures. Closes the Clinic 'warm orbs'.
- Only real sources; no brightness/exposure knobs; no invented values (cite or ask red1). Glow quads/sprites: deleted.
- Alt+S = lighting source of truth; every lighting function = BUILD (per building, cached) + DECIDE (per camera/frame,
  ray-free, ms); films call the same functions and add only continuity. Alt+C waits until the Alt+S zero list is met
  (plan: prompts/ALTC_FOUNDATION.md + ALTC_SHOWSTOPPERS.md): films steady exposure by default (per shot, held), crossing
  ramp opt-in last; camera-dependent light OK in films if it changes smoothly frame to frame.
- Sky: §SKY_VIEW_FIELD (portals retired, &portals=1 A/B) + IRC ON with MAX(IRC, SSGI) per fragment (never a sum).
- Dark places: ceiling-perimeter cove in ALL compartments (rooms, voids, shafts, MEP crevices), deficit vs EN 12464-1 by
  space use; voids TRIM_LUX_VOID = 100 lx (EN circulation row, via summaries; primary not consulted).
- Lamps: pick by the zones they light (done); LAMP_UNCAPPED next (the cap = the tower blotches, CAP_LIMITED).
- Glass: T + Fresnel reflection only, premultiplied (out = refl + dst·t_s·(1−F)), √T per surface, every glassy material
  incl. Clinic's; from outside by day interiors stay darker (real) — no interior lift.
- Meter: red1 picks avg / centre / hist(70/95, Unreal docs) at the café-corner + stair poses before any default change.
REFERENCES red1 approved (no regression allowed; files in ~/Downloads, pose in each PNG): Hospital atrium from balcony
  bounce_still_1790307025522 (baseline, mean 92, 'darker is realistic'); Clinic corridor 1790352156838 ('perfect');
  Hospital outside-looking-in 1790319885328; Clinic look 1790304784259; Terminal indoor 1790306684370 ('amazing').
LESSONS from the watchdog side: read the FULL log before believing a summary (the ADF distribution, the meter VACUOUS);
  spot-check a claim's file:line in source; red1's eye found almost every fault — so the in-viewer §FAULT line must grow a
  counter for each eye-found class; never hand red1 a tree without the 1-minute smoke; answer red1 in plain short English,
  lead with the verdict; a still's camera pose + host are in its PNG — use them, never guess.

## ▶▶▶▶▶▶▶▶▶▶▶▶ §DEV RESUME 2026-09-27 ("resume alts loose") — START HERE. LAUNCH A FABLE AGENT FOR B1 (red1's request)
red1 2026-09-27: "it has fallen dark on walls away from the Sun outside. Dark patches still persists. ... launch a Fable agent to
tackle the toughest layer". (Overrides the standing Sonnet-only dispatch memory for THIS task — red1 named Fable explicitly.)
STATE: look tree /tmp/wt-look = look/combined-0925 @ 48204a78 sw v1455 served :8624 (after a reboot: `git worktree add /tmp/wt-look
look/combined-0925` in ~/bim-ootb + `node ~/bin/serve_tree.js /tmp/wt-look 8624 &`). Shipped this lane 2026-09-26/27 (each its own
fix/ branch, all FF'd into look): 5e5fda56 §CSM_NEAR_LEAK · 140bc884 &metermode=hist · a00637e5 §FAULT irOnly · 31bdfcec sw in first
PNG · 17f1af2a §FAULT_GI hueCls · 1916bf34 §COVE_IR · 48204a78 M2 (ghost=1 auto-shell no longer fires on Alt+S Esc).
NOT MERGED: fix/zone-cap-centre (4ca8a627 + bump, sw v1456) — see B1.

### B1 — THE TOUGHEST LAYER: exterior walls in shade go black (the sky-view field on the 0.5 m lattice). Dispatch to Fable.
Evidence (red1 still ~/Downloads/bounce_still_1790438202002.png, Hospital aerial, cam [-44.334,20.357,48.696] tgt
[-2.924,-11.908,7.912], db /buildings/Hospital_extracted.db &ghost=1; v1455): 4.31% of pixels <= 15/255. Classes (probe
prompts/photoreal_probes/dark_cls.js):
 (a) IFC colour 000000 parts in the open (albedo 0) — data, leave.
 (b) facade 707f8e, side-facing, 27-41 m, shaded: the cells in front are labelled COVERED (zone 1 = the building's giant zone,
     83% of indoor volume) and their sky-view field G reads F 0.06-0.10 (skycheck.js), while 48 cosine rays against the real
     meshes find ~0.44 of a possible ~0.5 open (a vertical wall fully open to sky). ~3-4x too little sky -> black in shade.
 Mechanism measured: the voxeliser (light_zones.js build(): barycentric samples at CELL/2 -> any touched cell SOLID) + the open-sky
 top-down scan (any SOLID above = covered) + the field (FIELD_DIRS lattice march; a SOLID mid cell blocks) together turn a lip that
 clips a column's edge (coping/fascia/window head/parapet) into a full 0.5 m roof, and the facade's own fattened voxels block the
 field's rays. Census (cand.js, Hospital): 21,507 covered cells beside open air; 1,170 under a thin cap with open sky above; mesh
 up-ray from the cell centre escapes in 113/167 of those. Mesh raycasts cost ~10 ms/ray (4,856 objects, no scene BVH) — a
 per-cell ray pass is too slow as-is.
 Attempt 1 (fix/zone-cap-centre, UNMERGED): only a SOLID cell whose column centre line is crossed by a triangle counts as a roof.
 Result at red1's pose: px<=15 4.31% -> 2.82% (capSkipped 210,815 of capCells 236,984). NOT enough (red1: walls away from the
 sun still dark), and the interior-leak check (roofed rooms must stay covered; zone count / indoorCells / largest zone before vs
 after) was NOT run. The field (G) itself is untouched by it: side-facing wall cells still march through the wall's own voxels.
What the Fable agent should decide and build (spec first, in this file, then code; witness = numbers, never red1's eyes):
 1. Is the right fix at the LABEL (covered vs open) or the FIELD (F per cell), or both? Measure F vs geometric sky on a sample of
    exterior wall cells across Hospital/Clinic/Terminal (skycheck.js pattern), before and after, as a distribution — target: F
    within +-0.1 of the geometric fraction for cells whose geometric sky > 0.2.
 2. Candidate directions (not decided): start field rays from the surface-side face of the cell instead of its centre / skip the
    source cell's own-wall voxels; exact mesh visibility for the boundary shell only (needs a BVH over the merged boundary draws —
    three-mesh-bvh is loaded, §BVH_DEFERRED); finer lattice near facades.
 3. Guards: black_exterior / junction_zone_flip / covered_open_side_black (§GLARE audit) stay 0; approved refs unchanged (Clinic
    corridor [21.243,-0.606,-1.261]->[1.197,-4.155,-2.608] composite ~76-78; Hospital inner room [9.947,-7.699,0.098]->
    [14.735,-8.114,2.081] ~101; red1's outside-looking-in / Terminal indoor refs in §WORKING MODE); zone stats logged; ZONE cache
    rebuilds on code change (SRC hash) — fine.
 Tools: viewer/tests/warm_probe.js (or prompts/photoreal_probes/warm_probe_key.js = same + /key?k=Escape for real key presses);
 SW landmine: after editing, bump sw CACHE_VERSION or clear SW+caches before /open reload=1. One GPU browser at a time. The agent
 works in its own /tmp/wt-* worktree + port, never edits /tmp/wt-look; you (the dev session) review its diff, smoke it, FF look.

### B1 SPEC (Fable, 2026-09-27) — measured mechanism, chosen fix, witness claims. Tree /tmp/wt-b1 (fable/b1-sky-field, from
### fix/zone-cap-centre def9c79b), port :8630, warm probe :8631. Probes: bim-compiler prompts/photoreal_probes/ + scratch fgeo.js/shellpass.js.
MEASURED BEFORE (Hospital, v1456 tree = attempt 1 in place; one Alt+S at red1's aerial pose, headless NVIDIA 1666x864):
 - px<=15 at red1's pose 3.86% on this harness (dark_cls: 90/253 sampled dark px = facade 707f8e side-facing shaded zone=in, 50 = 564b4d
   up-facing sun-blocked, 20 = GROUND up-facing zone=in). skycheck at the pose: the 707f8e cells read F 0.07-0.37 (adjacent cells
   differ 4x: 0.37 vs 0.09) against geomSky 0.23-0.54 in skycheck's units (cosine about the wall normal, upward rays only, max 0.5).
 - The reference for F is made precise: F_geoMC = the SAME integral the field defines (upper hemisphere, CIE overcast x cos(zenith),
   64 stratified rays from the cell centre against a BVH over the real ARC+STR meshes, glass x T) — F is a horizontal-receiver
   quantity of the CELL; skycheck's geomSky is a different quantity (the wall's own hemisphere) and is reported beside it, not
   as the target. Sample: seeded 400 covered + 120 open cells beside a wall (lateral SOLID neighbour) within 2 cells of open air.
 - COVERED cells with F_geoMC > 0.2 (the exterior population, n=53 of 400: most covered cells beside walls are truly covered):
   F within +-0.1 of F_geoMC for 60%; mean F 0.246 vs truth 0.318; median dF -0.045, 18 of 53 more than 0.1 low, 3 more than 0.3 low.
   Split of the error: VISIBILITY (F - sum_d w_d vis_mesh_d along the lattice's own 41 directions) median +0.003 on the population,
   but 14 of 53 cells are BLIND (F - F_geoLat < -0.1, down to F=0 vs 0.37): in every one the lost directions are the 45/35/27 deg
   rays TOWARD a SOLID neighbour that the exact ray clears — the neighbour is a thin or low feature (sill, lintel, slab edge,
   coping, string course) fattened to a whole 0.5 m cell by the any-touch rasteriser, and the march's conservative mids rule
   (any SOLID content in any touched cell blocks) turns it into a wall. QUADRATURE (41 directions vs the integral) median -0.055.
   The wall's OWN voxels are not the cause: directions into a real wall are blocked in the mesh too (agreement on those).
 - OPEN control (F = 1 by definition, 120 cells beside walls): F_geoMC mean 0.538. An open cell beside a wall truly sees half the
   sky; the code's F=1 there is what makes a free-standing wall render right (three's hemisphere light already halves the sky for a
   vertical normal), and it means a COVERED cell beside the same wall (F ~0.3-0.45 even with perfect visibility) renders that wall
   at 30-45% of its open-cell neighbours: the open/covered SEAM. Any cap above the column (coping, overhang, upper-floor
   projection) makes the cell covered, so a facade is patched at half brightness — red1's "dark patches" are this seam plus
   the blind cells. This is a DEFINITION mismatch (a horizontal-receiver F applied to a vertical surface), not a visibility bug.
 - Zone label (attempt 1, §ZONE_CAP_CENTRE): a continuous roof crosses every column centre it covers, so a roofed room cannot be
   opened by it; the interior-leak numbers (zones / indoorCells / largest zone, named roofed cells) are measured with and without
   it (&capcentre=0&zonecache=0 A/B switch added). KEEP unless those numbers move.
 - Cost facts: raycasts through the scene 10 ms/ray (4,856 objects); ONE merged BVH over the 234,224 boundary triangles (the
   voxeliser's own draws) builds in ~0.4 s (10 MB) and answers an any-hit ray in 4.5 us (raycastFirst 11-14 us). Shell = covered
   cells beside a wall within 2 cells of open air: Hospital 31,630; 34.9 of 41 directions lattice-blocked per cell; a 5-ray
   pre-test (zenith + 4 axis 45 deg, all blocked -> keep the lattice value) skips 46%: ~630k rays ~ 3 s one-time (IDB-cached).
CHOSEN FIX (this branch): §SKY_SHELL_RAYS — the FIELD, visibility only, monotone (F can only rise, never fall):
 1. build(): while rasterising, keep the boundary triangle soup (world positions + per-triangle glass T) on the cache (not in IDB).
 2. field(): shell cells = covered, non-solid, j >= groundJ, lateral SOLID neighbour, an open cell within 2 cells laterally at
    dy 0..2. During the 41-direction sweep record each shell cell's per-direction lattice value. After the sweep: opaque any-hit
    BVH (three-mesh-bvh shapecast, already loaded: §BVH_INIT) + a glass BVH (x T per pane, as the march does). Pre-test 5 axis
    rays; for every direction the lattice called blocked, one exact ray from the cell centre replaces it; acc += w_d v'_d;
    the bent-normal sums follow. Directions the lattice called open are kept (lattice-open agreed with the mesh: 'gained' ~0).
    Correction applies to the shell cell's own F (not re-propagated down the chains: deeper cells keep the lattice value).
 3. No BVH (loader failed) or &skyshell=0 / APP._stillSkyShell=false -> today's field, logged. New § line: §SKY_SHELL_RAYS
    bld shellCells pretestSkipped rays raysPerCell bvhTris bvhMs passMs lifted(>0.05) meanLift maxLift; VACUOUS when shellCells=0.
    SRC hash changes -> §ZONE_IDB_CACHE rebuilds. Attempt 1 kept (see above).
 PREDICTED (prototype shellpass.js on the same Hospital sample): exterior within +-0.1: 60% -> 79%; mean F 0.246 -> 0.334 (truth
 0.318, bias +0.016); truly-covered cells (F_geoMC <= 0.2, n=347): mean 0.040 -> 0.081 (+0.03 over-lift where a non-boundary
 element — beam/member/proxy canopy — is the real cover; within +-0.1 85% -> 87%).
NOT FIXED HERE, ⛔ FOR red1 (needs a look decision, indoors changes by design): the SEAM. The principled repair is a DIRECTIONAL
 read: store per cell the four half-space sums S(+x) S(-x) S(+z) S(-z) (= sum over the lattice directions on that side of
 w_d v_d / that side's weight; 4 x 8 bit, one RGBA8UI 3D texture, Hospital +41 MB GPU/IDB) and read F_n = the half-space of the
 fragment's normal (blend by |n.x|,|n.z|; F itself for n.y <= 0 and blended in by n.y). A wall in a covered cell beside a free wall
 then reads ~1 like its open neighbours; under a real overhang it reads the overhang's loss once, not the wall's own back half.
 Indoors it changes looks: walls facing a window brighter (~2F), the window wall itself darker (~0) — physically right, but the
 approved indoor refs (Clinic corridor ~76-78, Hospital inner room ~101) will move. Question for red1: accept the directional
 read indoors (refs re-approved) or restrict it? The cheap analytic form F/H(n) (H = 0.5 for a vertical normal) needs no texture
 but doubles every vertical wall's F indoors regardless of facing — not proposed.
WITNESS CLAIMS (numbers, per building Hospital / Clinic / Terminal, before -> after; INCONCLUSIVE where a population is empty):
 W1 F vs F_geoMC on covered exterior cells (F_geoMC > 0.2): share within +-0.1 rises on every building; target >= 75%; mean bias
    |dF| <= 0.05. Truly-covered cells (F_geoMC <= 0.2): mean over-lift <= 0.05.
 W2 red1's pose (Hospital aerial, &ghost=1): px<=15 fraction falls (3.86% before on this harness); F at the 707f8e facade cells
    (skycheck rows) rises toward ~0.45 (their horizontal-receiver truth; the seam keeps them below the open cells' 1.0).
 W3 interior leak guard: zones / indoorCells / largest zone identical before vs after (the fix touches F only, not labels); named
    roofed cells (Hospital inner-room cam, Clinic corridor cam, Terminal inside cam) stay COVERED with SOLID above; attempt 1
    A/B (&capcentre=0) reported for the same numbers.
 W4 §GLARE guards black_exterior / junction_zone_flip / covered_open_side_black = 0 on all three.
 W5 refs: Clinic corridor composite (§GI_STILL compositeMean) and Hospital inner room, Hospital outside-looking-in unchanged
    within +-1.5; Terminal indoor and Clinic look: the approved PNGs are not on disk and no pose is recorded -> the Terminal
    inside pose [7.473,-7.532,1.036]->[6.397,-8.016,3.054] (the S4 pose) is measured as a named proxy, INCONCLUSIVE for the
    approved still itself.
 W6 first-press staging (§STILL_STAGE_MS stagingTotal, fresh profile, no IDB record) grows by <= 5 s on Hospital; IDB-hit press
    unchanged. Smoke: 0 Shader Error / Context Lost / pageerror.

### B1 HANDOFF (Fable, 2026-09-27) — stopped at red1's request before any code went into the tree. Everything below is
### measured; nothing was changed in /tmp/wt-b1 (still def9c79b = fix/zone-cap-centre, sw v1456, served :8630, warm probe :8631).
FILES: prompts/photoreal_probes/b1/ — probes fgeo.js (F vs geometric, pose-free), cells.js (named cells: label/zone/F/cap),
 shellpass.js (fix prototype), weights.js (lattice direction weights, node), pngpose.js (pose from a still's tEXt), measure.sh /
 before_all.sh / before2.sh / after_all.sh (drivers), warm_probe.js (= photoreal_probes/warm_probe_key.js, ctl port 8631);
 every before-log (*_before_*.log, hospital_before_* etc.); light_zones.SKY_SHELL_RAYS.draft.js + .patch = the UNAPPLIED,
 node-syntax-checked draft of the chosen fix against /tmp/wt-b1/viewer/light_zones.js (review before use; never run in a browser yet).
HEADLINE NUMBERS (BEFORE = v1456 tree, attempt 1 §ZONE_CAP_CENTRE on; headless NVIDIA 1666x864, default sun 45 deg):
 Hospital (&ghost=1): red1's aerial pose FIRST press px<=15 = 3.86% (alts_hospital_red1pose_before.log, darkcls_hospital_before.log;
   dark classes: 90/253 = facade 707f8e side-facing shaded zone=in, 50 = 564b4d up-facing sun-blocked zone=in, 20 = GROUND up zone=in,
   19 = 737278 side). skycheck_hospital_before.log: 707f8e cells F 0.07-0.37 (adjacent cells 0.37 vs 0.09) vs geomSky 0.23-0.54.
   Zones 848, indoorCells 1,531,269, largest 159,087 m3 (83.1%), capCells 236,984 / capSkipped 210,815, §GLARE PASS 0/0/0,
   staging 11,843 ms (zoneBuild 3,787 + sourcedStage 4,923), compositeMean 67.18 / appMean 71.64.
   fgeo_hospital_before.log (400 covered + 120 open wall-adjacent cells, ARC+STR BVH truth): covered EXTERIOR (F_geoMC > 0.2)
   n=53: within +-0.1 60.4%, mean F 0.246 vs truth 0.318, visibility error median +0.003, quadrature -0.055; 14/53 BLIND
   (blind_hospital_before.log: every lost direction is a 45/35/27 deg ray toward a SOLID neighbour the exact ray clears = a
   thin/low feature fattened to a cell). Truly covered (<= 0.2) n=347: 85% within. OPEN control n=120: truth 0.538, F = 1.
   shellpass_hospital_before.log / shellpass_pretest_hospital.log (prototype, boundary BVH 234,224 tris 0.4 s): exterior within
   +-0.1 60% -> 79%, mean F 0.334 (truth 0.318); 31,630 shell cells, 34.9 lattice-blocked dirs/cell, pre-test skips 14,632;
   raybench_hospital.log: raycastFirst 11-14 us/ray, shapecast any-hit 4.5 us/ray.
   REFS: inner room [9.947,-7.699,0.098]->[14.735,-8.114,2.081] FIRST press on a fresh page compositeMean 99.83 (ref ~101,
   hospital_before_fresh_innerroom.log, staging 14,799); the SAME pose as a 2nd press on a warm page after the aerial press gave
   65.61 (hospital_before_alts_innerroom.log) and every warm-page pose landed at 65-67 -> REF PROTOCOL: first press on a fresh
   PAGE, one pose per page. Outside-looking-in fresh-page first press: compositeMean 129.75 / appMean 132.37, §FAULT OK, §GLARE
   PASS (hospital_before_fresh_outsidein.log; the warm 2nd press at the same pose gave 66.48). NOTE the warm-probe BROWSER keeps its
   IndexedDB across /open: that press shows zoneBuild=116 audit=0 = §ZONE_IDB_CACHE hit, staging 15,518 (zoneCap 3,374 +
   sourcedStage 6,448). A truly cold staging number (W6) needs /close before /open (11,843 measured cold at the aerial pose).
   cells: inner-room cam cell 7058199 zone 207 COVERED cap 1 above; red1 aerial cam OPEN; outside-in cam OPEN.
 Clinic (&ghost=1): corridor [21.243,-0.606,-1.261]->[1.197,-4.155,-2.608] first press compositeMean 75.5 (ref 76-78), px<=15
   0.02%, staging 7,284, zones 441, indoorCells 141,215, largest 5,523 m3 (31.3%), capCells 57,141 / capSkipped 49,916, §GLARE PASS.
   clinic_before_fgeo.log: exterior n=32: within +-0.1 37.5%, mean F 0.215 vs 0.381, visibility median -0.052, quadrature -0.056;
   truly covered n=368: 97.8% within. cells: corridor cam cell 797874 zone 27 COVERED cap 11 above (clinic_before_cells.log);
   a zone-only re-press on a fresh page: §GLARE PASS, staging 5,971 IDB-hit (clinic_before_zoneonly.log).
 Terminal: inside [7.473,-7.532,1.036]->[6.397,-8.016,3.054] (proxy for the approved indoor still, whose pose is unknown) first
   press compositeMean 103.35, px<=15 0.01%, staging 20,190, zones 156, indoorCells 1,153,331, largest 134,395 m3 (93.2%),
   capCells 54,525 / capSkipped 78,714, §GLARE PASS. terminal_before_fgeo.log: exterior n=140: within +-0.1 16.4%, mean F 0.358 vs
   0.432, visibility median 0.000, QUADRATURE median -0.118; 15 cells read F 0.90 (lattice, through glass T) where the truth is
   0.42-0.65 = under the glazed hall roof whose space frame (IfcMember/IfcBeam, not a boundary class) blocks the sky.
   cells: inside cam cell 1825936 zone 16 COVERED cap 2 above.
WHAT THE NUMBERS SAY — LABEL vs FIELD:
 1. FIELD, not LABEL. The zone labels are right where checked (named roofed cells covered on all three; §GLARE 0/0/0); attempt 1
    changes labels only where no triangle crosses the column centre (a continuous roof always does) — KEEP it; its interior-leak
    A/B (same numbers with &capcentre=0&zonecache=0) is still unmeasured (the draft adds that switch).
 2. Inside the field the error is NOT the wall's own voxels (directions into a real wall are blocked in the mesh too). It is
    (a) visibility past THIN features fattened to a cell (Hospital 14/53 cells, up to F 0 vs 0.37), (b) the 41-direction
    QUADRATURE (Terminal median -0.12, Clinic/Hospital -0.06), (c) sky occluders outside the boundary classes (Terminal roof
    structure: lattice 0.90 vs 0.42-0.65). None of these is fixed by moving the ray start or skipping own-wall voxels.
 3. The largest visible effect is a DEFINITION seam, not a bug: F is a horizontal-receiver sky view of the cell; an OPEN cell is set
    to 1 (right for a free wall: three's hemisphere already halves the sky for a vertical normal), a COVERED cell beside the same
    wall reads its true ~0.3-0.5 (the wall's own back half counted as loss) -> that wall renders at 30-50% of its open-cell
    neighbours. Any cap above the column (coping, overhang, upper-floor projection) makes the cell covered -> red1's dark
    patches. Fixing (a)-(c) lifts the 707f8e cells from 0.07-0.37 to ~0.45; they stay at half of the open cells' 1.0.
RECOMMENDED FIX DIRECTION (why): two layers, both in the FIELD, in this order —
 A. §SKY_SHELL_RAYS (draft patch in b1/): for the SHELL cells (covered, above ground, lateral SOLID neighbour, open cell within 2
    cells) replace the lattice F by 64 stratified CIE-cos rays (the witness's own estimator, seeded per cell) against one BVH
    over the boundary soup + sky-occluder classes (IfcMember/Beam/Column/Railing/Stair/Proxy/Footing; budget 6M tris), glass x T
    per group, 5-ray pre-test keeps truly covered cells; three-mesh-bvh shapecast any-hit 4.5 us/ray -> est. Hospital ~6 s
    ONE-TIME (IDB-cached, SRC hash rebuilds), Clinic/Terminal shells are 5-6k cells (cheap). Fixes (a)+(b)+(c) by construction;
    deeper cells keep the lattice. &skyshell=0 A/B. Expected W1 within +-0.1 >= 75% on all three (Hospital prototype: 79% with
    the weaker blocked-only variant).
 B. The SEAM (⛔ red1): a DIRECTIONAL read — per cell the four half-space sums S(+x) S(-x) S(+z) S(-z) (RGBA8UI 3D texture,
    Hospital +41 MB GPU/IDB), F_n = the half-space of the fragment's normal (F itself for n.y <= 0). Removes the open/covered
    seam (a wall beside a free wall reads ~1 in both), but changes indoor walls by design (facing a window ~2F, the window wall
    ~0) so the approved indoor refs move -> red1 must accept or restrict it. The analytic F/H(n) shortcut doubles every indoor
    wall regardless of facing: not proposed.
STILL UNMEASURED: everything AFTER (the draft never ran in a browser): W1 after per building, px<=15 after at red1's pose, refs
 after (first-press protocol), staging after (target <= +5 s Hospital), attempt-1 A/B numbers (&capcentre=0&zonecache=0), the
 Terminal approved-still pose and the Clinic-look pose (PNGs 1790306684370 / 1790304784259 not on disk), Hospital outside-in
 fresh first press if before2 did not finish, smoke (viewer/tests/smoke_alts.js) on the changed tree.
RERUN COMMANDS (all from a shell; one GPU browser at a time; the warm page serialises calls):
  node ~/bin/serve_tree.js /tmp/wt-b1 8630 &            # tree server (already up)
  cd <scratch> && node prompts/photoreal_probes/b1/warm_probe.js 8631 &   # warm probe (already up on 8631)
  curl 'localhost:8631/open?port=8630&db=Hospital&q=%26ghost%3D1&reload=1'      # fresh page (reload=1 after ANY edit + sw bump)
  curl -G localhost:8631/alts --data-urlencode 'cam=[-44.334,20.357,48.696]' --data-urlencode 'tgt=[-2.924,-11.908,7.912]' \
       --data-urlencode gi=1 --data-urlencode 're=§LIGHT_ZONE|§GLARE|§SKY_VIEW_FIELD on|§SKY_SHELL|§STILL_STAGE_MS|§GI_STILL result|§FAULT|§METER camera'
  curl -X POST localhost:8631/eval --data-binary @prompts/photoreal_probes/dark_cls.js      # px<=15 at the staged pose
  curl -X POST localhost:8631/eval --data-binary @prompts/photoreal_probes/skycheck.js      # F vs geomSky at the pose (707f8e rows)
  curl -X POST localhost:8631/eval --data-binary @prompts/photoreal_probes/b1/fgeo.js       # W1 distribution (pose-free; window.__b1opt = {kCov,kOpen,mc,seed})
  { echo "window.__b1pts=[['innerroom',9.947,-7.699,0.098]];"; cat prompts/photoreal_probes/b1/cells.js; } | curl -X POST localhost:8631/eval --data-binary @-
  curl -X POST localhost:8631/eval --data-binary @prompts/photoreal_probes/b1/shellpass.js  # fix prototype (needs fgeo first; window.__b1shell={pretest:true})
  TAG=after prompts/photoreal_probes/b1/after_all.sh   # the whole AFTER set (fresh page per ref, first press) -> <scratch>/*_after_*.log
  Refs: Clinic corridor cam [21.243,-0.606,-1.261] tgt [1.197,-4.155,-2.608] (&ghost=1); Hospital inner room [9.947,-7.699,0.098]->
  [14.735,-8.114,2.081]; outside-in [-5.529,-0.544,-42.321]->[4.014,-6.761,2.325]; Terminal inside [7.473,-7.532,1.036]->[6.397,-8.016,3.054].

### B1 RESULT (Opus, 2026-09-27) — §SKY_SHELL_RAYS applied, witnessed, pushed. bim-ootb fable/b1-sky-field @ 808f578f, sw v1457
### (light_zones.js ?v=16). NOT merged, look not FF'd, no PR (coordinating session). Logs + probes: prompts/photoreal_probes/b1/.
WHAT WAS BUILT (review of the Fable draft, then changed): shell selection, estimator (64 seeded stratified CIE-cos rays), 5-ray
 pre-test and bent-normal swap kept from the draft. Changed: (1) the triangle soup is built INSIDE field() (draft: in build()),
 so a field rebuilt over a zone grid restored from §ZONE_IDB_CACHE still gets it; (2) glass = x T per PANE along the ray (all
 hits, a new pane after a 0.3 m gap = fgeo.js's rule; draft: once per T group); (3) BVH indirect on non-indexed soup (unit
 check bvhtest.log: faceIndex = original triangle, any-hit shapecast OK); (4) occluders ARC/STR only — MEASURED all-discipline
 occluders on Hospital 10.16M tris (4.3M of them PLB/MEP/ELEC/FP proxies, occcount_hospital.log) > the 6M budget, so the draft
 dropped them all; ARC/STR = fgeo.js's own reference geometry, 5.82M; (5) occluder triangles in covered cells with lattice F = 0
 culled (1.19M Hospital / 1.11M Terminal); cull A/B (&shellcull=0, cull*_G.json via shellG.js): Hospital 4 of 31,630 shell
 cells differ (max 0.19), Terminal 0 of 5,615; (6) &capcentre=0 and &skyshell=0 enter the IDB fingerprint (a switch flip
 rebuilds). § line: `§SKY_SHELL_RAYS bld cache=built|hit on shellCells pretestSkipped recomputed mc rays usPerRay boundaryTris
 occluderTris cull occluderCulled glassTris soupMs bvhMs selectMs passMs F mean dF mean meanAbs lifted lowered maxLift maxDrop`
 (+ VACUOUS / INCONCLUSIVE when nothing judged). Hospital: 31,630 shell, 16,621 kept by pre-test, 15,009 recomputed, 1.08M rays
 at ~6 us, soup 0.6 s + BVH 2.2 s + pass 6.4 s; lifted 6,841, lowered 3,025 (occluders). Clinic 6,159/871 recomputed, 0.7 s.
 Terminal 5,615/2,368, 2.4 s, maxDrop -0.87 (the roof space frame under glass).
NOISE (same code, repeated cold first presses on a fresh profile): Clinic corridor 75.5 vs 78.2 (2.7); Hospital inner room 99.83
 vs 99.84; outside-in 129.75 vs 130.04; Terminal inside 103.35 / 103.45 / 103.73 / 103.69 (0.38); red1 P2 111.68 / 111.50.
 px<=15 at red1's aerial pose on the UNCHANGED tree: 1.64% cold, 2.13% warm — the HANDOFF's 3.86% did not reproduce (same zone
 stats, same exposure); so W2 is judged as a same-session A/B (&skyshell=0 = the before field on this tree), 2 reps per arm.
W1 F vs 64-ray truth (fgeo.js, seed 7, same 400+120 sample as BEFORE; covered exterior = truth > 0.2):
 | bld      | n   | within +-0.1  | mean F vs truth       | median dF      | > 0.1 low | > 0.1 high | truly covered: within / mean dF |
 | Hospital | 53  | 60.4% -> 100% | 0.246 -> 0.314 / 0.318 | -0.045 -> 0.000 | 18 -> 0   | 3 -> 0     | 85.0% -> 97.1% / -0.017 -> -0.010 |
 | Clinic   | 32  | 37.5% -> 100% | 0.215 -> 0.393 / 0.381 | -0.151 -> 0.015 | 20 -> 0   | 0 -> 0     | 97.8% -> 100% / -0.007 -> -0.003 |
 | Terminal | 140 | 16.4% -> 98.6%| 0.358 -> 0.430 / 0.432 | -0.139 -> 0.000 | 89 -> 1   | 28 -> 1    | 86.2% -> 100% / +0.020 -> -0.005 |
 Terminal roof-glass cells (the > 0.3-high bin, lattice 0.90 vs truth 0.42-0.65): 15 -> 0. Truly-covered over-lift: none (mean dF
 stays <= 0 on all three; W1 target over-lift <= 0.05 met). INDEPENDENT truth (256 rays, seed 11, a different 400-cell sample,
 x_sh*_hosp_fgeo256.log), Hospital sh0 -> sh1: exterior n=64 57.8% -> 100%, mean F 0.268 -> 0.334 (truth 0.334); truly covered
 86.3% -> 98.2%, 0.039 -> 0.044 (truth 0.053). SCOPE NOTE (PRIMAL LAW 4): W1 samples exactly the shell population, so it cannot
 see facade cells whose nearest open cell is > 2 cells away: at red1's aerial pose 2 of the 15 covered 707f8e cells skycheck
 hit are such cells (9911662/3: nearest open r=3, F 0.07/0.06 vs 256-ray truth 0.43/0.40, unchanged). The other 13 went from
 F 0.06-0.31 to 0.44-0.48 (truth 0.44-0.48) (x_sh*_cells707.log). Widening SHELL_R to 3 is the obvious next step — not done
 (out of the approved scope; the witness population would widen with it).
W2 red1 aerial 1790438202002 (Hospital &ghost=1), &skyshell=0 -> default, 2 cold reps each (w2ab_*): px<=15 composite
 1.614 / 1.627% -> 1.465 / 1.475%; app frame 2.965 / 2.959% -> 2.323 / 2.339%. dark_cls: 707f8e side-facing shaded ~4,120 px ->
 ~1,990 px; the rest is up-facing sun-blocked 564b4d / 009e49 / GROUND / ebe6d9 in zone 1 and albedo-0 000000 outside (not the
 shell population). skycheck 707f8e dark samples 23 -> 5.
 red1 P1 aerial 1790449862668 (cam [-41.633,17.723,25.635] tgt [-1.62,-5.131,2.23]; red1: 2.27% on v1455 = no attempt 1, OCI db,
 1685x874): px<=15 composite 0.83% -> 0.73%, app 1.10% -> 0.94%; §FAULT OK both. Remaining dark (dark_cls, est. px): proxy
 ebe6d9 up sun-blocked ~2,500, 707f8e side ~2,400 (was ~3,070), 009e49 up sun-blocked ~2,150, albedo-0 000000 zone=out ~1,450.
W3 leak: zones / indoorCells / largest identical sh0 vs sh1 on all three (Hospital 848 / 1,531,269 / 159,087 m3; Clinic 441 /
 141,215 / 5,523; Terminal 156 / 1,153,331 / 134,395). Named roofed cells stay COVERED with SOLID above: inner room 7058199
 zone 207 cap 1, Clinic corridor 797874 zone 27 cap 11, Terminal inside 1825936 zone 16 cap 2.
 ATTEMPT-1 A/B (&capcentre=0 -> default, abcap*): Hospital zones 1,117 -> 848, indoorCells 1,557,348 -> 1,531,269 (-26,079 =
 -1.7%), largest 161,739 -> 159,087, openSky +14,912; Clinic 456 -> 441, 142,298 -> 141,215, 5,619 -> 5,523; Terminal 156 -> 156,
 1,185,166 -> 1,153,331 (-2.7%), 138,385 -> 134,395. Named cells covered in both arms; §GLARE 0/0/0 both; aerial px<=15 1.87% ->
 1.49%. Whether any of the ~26k/32k opened cells lies inside a roofed room is NOT judged beyond the named cells (INCONCLUSIVE).
W4 §GLARE black_exterior / junction_zone_flip / covered_open_side_black = 0/0/0 on every run, all three buildings.
W5 refs (cold first press, fresh profile), before -> after: Clinic corridor 75.5 / 78.2 -> 76.91; Hospital inner room 99.83 /
 99.84 -> 99.85; outside-in 129.75 / 130.04 -> 129.67; Terminal inside (named proxy) 103.35 / 103.45 / 103.73 / 103.69 -> 104.01
 / 103.53 / 103.68; red1 P2 1790449885596 (cam [-7.307,-6.507,12.017] tgt [-2.403,-7.682,3.378], meter 6.49 stops, zonePass
 182.8 = red1's 6.48 / 182.8) 111.68 / 111.50 -> 111.62 / 111.61, px<=15 0.02% both. All inside the measured noise. Terminal
 approved still and Clinic look: PNGs not on disk -> INCONCLUSIVE for those stills.
W6 staging (§STILL_STAGE_MS stagingTotal, cold = fresh profile): Hospital 10,952 / 11,187 (sh0) -> 20,533 / 20,631 / 21,028
 (+9.5 s — OVER the spec's <= +5 s); IDB-hit press 4,659 -> 4,923 (unchanged; §SKY_SHELL_RAYS cache=hit logged). Clinic 2,831 ->
 3,689; Terminal 8,037 / 8,135 -> 10,682 / 10,787. Smoke (viewer/tests/smoke_alts.js, real Alt+S): SMOKE PASS shaderError=0
 contextLost=0 pageError=0 on Hospital / Clinic / Terminal; the §FAULT glassLow on Clinic (1) / Terminal (2) is identical with
 &skyshell=0 (pre-existing); one Terminal default-pose hueNoise 68 did not reproduce (2 vs 2 on repeat).
VERDICT per the coordinator's PASS rule: refs unchanged (within noise) PASS; guards 0 PASS; no interior leak (zone stats
 identical) PASS; exterior within +-0.1 improved on all three PASS -> READY TO FF. Not in the PASS rule but judged: W6 FAIL
 (+9.5 s cold on Hospital). W2 PASS (falls, modest). Attempt-1 leak INCONCLUSIVE beyond named cells.
⛔ red1 (one question): Hospital's FIRST Alt+S per code version now stages ~20.6 s instead of ~11 s (one time; cached after, warm
 press unchanged). Cost split: the 64-ray pass 6.4 s (boundary-only it was 5.0 s), the roof-structure BVH 2.2 s + soup 0.6 s.
 Accept the one-time +9.5 s, or trade accuracy for time (boundary-only occluders: +2.7 s, but Terminal's roof-glass cells lose
 their space frame)?

### Other open items (after B1)
 - S4: an outside still AFTER an inside still gets 1,127-1,430 fringe px (Terminal [41.691,4.561,33.774]->[0.377,-13.544,0.58] after
   [7.473,-7.532,1.036]->[6.397,-8.016,3.054]); first press 5-6. Not cascades (off: 1,237). App frame itself is darker after the inside
   press (Terminal appMean 87.6 -> 70.7). Part explained: the first press renders before the ground texture ('earth') loads. Also
   §SOURCED_LIGHT pushed 105 -> 109 materials after an inside press. Fringe class = 'other' opaque surfaces in a dark block.
 - M1 "mem hog": no regression measured old vs new (GPU 2.6-2.7 GB same, heap same swing); red1 not yet said where it showed.
 - Overhang meter pose: needs red1's still id. Then the Alt+C read-only review (FIRST TASK of the block below).

## ▶▶▶▶▶▶▶▶▶▶▶ §DEV RESUME 2026-09-26 EVENING ("resume altc") — START HERE
TRIGGER: red1 says "resume altc" (or "resume alts loose"): do the STILL FINDINGS S1-S3 first, then this. Look tree /tmp/wt-look (look/combined-0925) @ d0125d74, sw v1448, served :8624 (after a reboot:
`git worktree add /tmp/wt-look look/combined-0925` from ~/bim-ootb + `node ~/bin/serve_tree.js /tmp/wt-look 8624 &`).
FIRST TASK (red1): a READ-ONLY REVIEW of present Alt+C (cinema_maxq.js recorder + cli_silent_bake.js + gi_film + tools.js bake
pool) against the pending Alt+S version (everything shipped 2026-09-26, all gated `!A._maxqActive`: §ZONE_IDB_CACHE, §LAMP_UNCAPPED
lamp data, §IRC_MAX v2, §GROUND_VIEW_FIELD, §GLASS_SPEC_GATE/§GLASS_BATCHED/§GLASS_ENV, §LAMP_EN(+ZONE, SPACE_USES), §METER_ADAPT,
§COVE_LIGHT) to anticipate STOPPERS before any film code: update prompts/ALTC_SHOWSTOPPERS.md (its S1-S5 predate today) with a
dated section — per new function: can it run per frame / per shot, cost, determinism, 4D build-up (S3), flicker risk. Then the
order in the 1d block below. Tools: viewer/tests/warm_probe.js (checks in 5-17 s; SW landmine noted in 1d).
The full day's record is the "resume bounce" block and its 1a-1d notes below.
LIVE 2026-09-26 18:00: PR bim-ootb#1783 merged (890e4c70, merge of release/look-0926 = look d0125d74 + main's 17 Modeller commits;
conflicts were version lines: sw v1449, cinema_maxq ?v=9, rule_findings_film ?v=15). GH Pages built 890e4c70; live sw.js =
v1449 (minified: grep 'CACHE_VERSION="v1449"'). Release smoke: Hospital/Clinic/Terminal Alt+S+bounce 0/0/0; Modeller page 0 errors.
STILL FINDINGS TO FIX BEFORE ALT+C (red1's 17:47-17:52 Hospital stills, v1448; 4 of 5 §FAULT OK):
 S1. …416110090 cam [-10.903,-1.976,-16.429] tgt [3.839,-6.592,0.064]: blown 2.91% (clipped white), expStep 5.74 — the
     §METER_ADAPT exposure opened 5.7 stops. Find WHICH surfaces clip (lamp fixtures? cove strips 0xffe4b5 MeshBasic? surfaces
     near lamps?) by readback, then decide: blown cap in the meter (a cited rule) vs a source-side cause. No knob.
 S2. …416128632 cam [-18.514,-8.311,-2.779] tgt [3.838,-6.592,0.065]: §FAULT unlitCeil 21/144 REPRODUCED on the release build
     (lampList mean 138 but zonePass 8: the ceilings' fragment zone has few lamps of its own). Hypothesis to test: the zone meets
     its EN row on the 0.8 m plane so §COVE_LIGHT's deficit is 0, and §IRC_MAX's zone floor is low — ceilings are judged
     nowhere. Measure per-term (lamps/IR/cove/sky) at the 21 samples before changing anything.
 S3. Carried: Terminal 2 tall shafts dark (top-only cove >15 m above the floor); plenum duct undersides dark (floor-facing);
     camera under an overhang metered as inside (Hospital corner pose → bright); hueNoise over-reports colour bleed.
Then the Alt+C review (FIRST TASK above). red1 will discuss the implications of adopting the new Alt+S settings for films.
REINFORCED by red1's 24 stills 17:47-18:13 (Hospital, Terminal, Clinic OCI, HHS, LTU; v1448; read with the tEXt pose/fault):
 S1+ blown correlates with LOW zonePass (lamps passing the zone test per fragment): Clinic …416837500 cam [-9.095,-0.161,1.44]
     tgt [0.472,-0.961,0.704] blown 9.83% zonePass 5 (vs ~100-180 on clean stills); Hospital …416110090 2.91%; HHS …417251249
     1.16% expStep 6.63. Mechanism to confirm: dim zone -> meter opens 5-8 stops -> bright areas seen through openings clip.
 S2+ unlitCeil in a 2nd building: HHS …417274231 cam [-10.669,-3.739,-29.894] tgt [1.565,-4.363,0.902] unlitCeil 10/143
     zonePass 14.9; Hospital 21/144 zonePass 9.3 — same low-own-lamps pattern.
 S4 NEW: hueNoise spikes on EXTERIOR stills: HHS …417236845 1785, Terminal …416662700 805 / …416627932 420, LTU …417533045 432,
     …417596710 399, Clinic …416868223 178. Either the rainbow-edge artifact (§GI_RECEIVER_QUANT) is back outdoors or the counter
     counts real colour bleed (known over-report) — classify the flagged pixels (app near-black + composite saturated) by surface
     before trusting either.
 S5 minor: the FIRST still after a page load records sw=None in its tEXt (…416041529, …416505303, …416707328, …417236845,
     …417533045) — §STILL_POSE_HOST reads the SW version before the worker controls the page.
S1 ✅ DONE (witness) 2026-09-26 night — look @ 5e5fda56, sw v1450, served :8624 (branch fix/s1-blown). The "low zonePass"
  correlation was WRONG; three different causes, classified by readback + raycast at each pose (scratchpad s1/blown_probe.js):
  - Clinic …416837500 (9.83%) = REAL DEFECT §CSM_NEAR_LEAK: the 1 m zMin floor also bounded cascade 0's box, surfaces < 1 m sat
    in no cascade box, shadow_cascade.js D3 lit them -> full sun through the roof on a wall 0.9 m away (249/249 sun-facing
    clipped samples ray-blocked; meter read them at E 0.001 — the meter was right). Fix: cascade 0 box from cam.near. New
    witness §STILL_SHADOW_CASCADE uncovered= / §FAULT csmUncovered (n/a when not judged). 6250 -> 0, blown 9.67% -> 0.03%.
  - Hospital …416110090 (0.95% here) = sunlit exterior through curtain-wall glass (IfcPlate T 0.30) at interior exposure 5.8 stops:
    physical single-exposure behaviour, not a defect.
  - HHS …417251249 (1.24%) = ELEC luminaires' own emissive (cccc44/em ffe4b5), mostly added by the bounce composite: physical.
  Also built (non-default, red1 to A/B): 140bc884 &metermode=hist (70/95) — at Clinic S1 8.45 vs 9.43 stops, corridor ref
  composite 66.9 vs 78.6 (avg). avg/centre/zone all gave ~9 stops at Clinic S1 (none of them was the cause).
S2 ✅ DONE (witness) a00637e5 sw v1451 — §FAULT unlitCeil was IR-BLIND (false positive): at the Hospital pose the 21 'unlit'
  ceiling samples display 70/255 median (frame p10; median 118) with §IRC_MAX IR, 0 with &ir=0. Counter now reports irOnly
  (zone IR > 0) apart from unlit; SourcedLight.irZone(z). Hospital: unlit 0 / irOnly 21 (IR off: FAULT unlit 21, dark 27.5%);
  HHS: unlit 0 / irOnly 10, dark 0%. The low-own-lamps pattern was real but those ceilings are lit by the zone IR floor.
S5 ✅ DONE (witness) 31bdfcec sw v1452 — the sw.js fetch now patches the first press's pose; PNG sw on a fresh page = "v1452" (was null).
S4 ⛔ NOT REPRODUCED headless (same GPU class, nvidia|lovelace): HHS …417236845 3 vs 1785, Terminal …416662700 6 vs 805. From red1's
  PNGs: flagged px lie within 2 px of app-black px (IfcWindow colour 000000 + dark interiors through glass, zone=in, 30-56 m),
  hue pair red/orange + cyan/blue, value ~45. 17f1af2a sw v1453: §FAULT_GI + PNG faultGi now carry hueCls {behindGlass,
  blackMat, other, miss} over 64 flagged px + giAdapter — red1's next exterior still classifies itself. Headless: 5/5 behindGlass,
  composite lift behind glass +4.3 (56.6 -> 60.9) vs opaque +2.6.
S3 plenum/shafts ✅ DONE (witness) 1916bf34 sw v1454 — red1 ruled "Yes as long it's not left in the dark": §COVE_IR = cove light
  enters its zone's IR (direct = deficit x (1-R), IR = deficit x R, level holds). Plenum dark 4.15% -> 0%, unlit 89 -> 0; Terminal
  26 m / 17 m shafts ~50 lx IR top to bottom; corridor ref unchanged. (Record of the question below.)
S3 plenum/shafts (question, answered): Hospital plenum pose (void zone 50) cam [-20.496,-5.619,-34.439] tgt
  [-23.527,-6.051,-22.952]: cove 100 lx, IR 0 (IR is built BEFORE the cove, so cove light never enters the zone's interreflection),
  floor-facing undersides get neither -> dark 4.15%, unlit 89/144. Fix candidate: IR includes the cove (cove sized x(1-R) so the
  level still holds) = a zone-flat term in dark compartments, against red1's "no flat fill" for BLACK_INTERIOR; the same term
  would lift the Terminal shaft bottoms. Q to red1: allow the cove's light into the IR bounce floor?
S3 overhang meter ⛔ needs the still: no pose recorded for "Hospital corner pose -> bright". hueNoise over-report: see S4 witness.
PAUSED 2026-09-27 (red1 suspend) — RESUME HERE. Look @ 48204a78 sw v1455 on :8624 (M2 ghost-on-Esc fixed there).
 B1 BLACK BLOTCHES (red1 …438202002, Hospital aerial cam [-44.334,20.357,48.696] tgt [-2.924,-11.908,7.912], v1455): 4.3% px <=15.
   Classes: (a) IFC colour 000000 parts in the open (albedo 0, data); (b) grey facade 707f8e 27-41 m: cells labelled covered zone 1
   because a SOLID voxel sits 0.5 m above, but a mesh up-ray from the cell centre escapes (3/5; census: 1,170 thin-cap cells beside
   open air, 113/167 escape) -> sky field F 0.06-0.10 vs geometric sky ~0.44 -> black in shade. red1 said "yes" to the fix.
   BUILT, UNTESTED: branch fix/zone-cap-centre (/tmp/wt-cap, pushed): §ZONE_CAP_CENTRE — capC[cell] = a triangle crosses the column
   centre line in that cell (plan-view point-in-triangle, seam tol 1e-6); the open-sky scan counts only capC cells as roofs;
   §LIGHT_ZONE stats capCells/capSkipped/capTris. NEXT: serve /tmp/wt-cap, witness at red1's pose (px<=15, F at the 707f8e cells),
   zone count / largest zone / indoorCells vs before (no interior leak: check a roofed room stays covered), refs (Clinic corridor
   [21.243,-0.606,-1.261]->[1.197,-4.155,-2.608], Hospital inner room, Terminal indoor), bump sw/?v= (light_zones.js), FF look.
 S4 partly explained: the FIRST outside press after a load renders before the ground texture ('earth') loads (§GROUND_ALBEDO logs
   map=none), so later presses at the same pose are darker (Hospital appMean 71.2 -> 62.2). Fringe after an inside press is NOT
   cascades (off: still 1237). Remaining diff: pushed materials 105 -> 109 after an inside press. Open.
 M1: no regression measured (see below); ask red1 where the "hog" showed.
PAUSED 2026-09-26 late (red1 suspending the machine). Look @ 1916bf34 sw v1454 on :8624. OPEN, in order:
 M1 MEASURED 2026-09-26 (headless gpu-process PID only + performance.memory, Terminal, 3 x ext+int presses, d0125d74 vs 1916bf34):
   GPU 2631-2735 vs 2639-2731 MiB (same), after Esc 2137 vs 2169; JS heap 1818-2033 vs 1750-2184 MB (same swing), after Esc
   1654 vs 1876 (one sample, inside the swing); press secs equal. NO regression found. Asked red1 which number/where they saw it.
   (M2's ghost shell built on every Esc since 09-24 is the only new-on-Esc work found.)
 M1 original: "latest changes introduced some mem hog" (red1) — first A/B was confounded: First A/B (d0125d74 vs 1916bf34, Terminal, 4 x
   exterior+interior presses) was CONFOUNDED: nvidia-smi summed red1's own Chrome (2276 MiB) with the headless one (2786 MiB);
   the heap read failed (window.gc absent -> whole eval threw). Redo: per-PID GPU (headless chrome gpu-process pid only) +
   performance.memory WITHOUT gc(), both trees, same sequence; press secs were equal (ext 33-37 s, int 12-15 s both). Suspects
   by code: §FAULT_GI hueCls raycasts all scene meshes x 64 rays per press when hueNoise>0 (runs every exterior-after-interior
   press); irCoveApply texture (small, 1 row). Ask red1 whether "hog" = RAM/GPU number or a stall (lesson: a past 'hog' was a
   shader-compile stall).
 M2 ✅ DONE (witness) 48204a78 sw v1455 — cause: ghost=1 (landing default) auto bbox-shell trigger in navigate_find.js, armed by
   Alt+S's module load, only HELD during the still, fired on Esc (4,518 ARC/STR boxes, 0 solid tris). Now skipped when the module
   was loaded by still/cinema. Hospital aerial after Esc: old 0 tris ghostOn, fixed 13,689,020 tris = before Alt+S.
 M2 (original report): after Alt+S -> Esc, rooftop solar panels + cafeteria tables go missing in navigation. Same class as
   §BAKE_MISSING_ELEMENTS (dlod restoring zeroed matrices)? Witness first: per-mesh non-zero instance/batch matrix census before
   Alt+S vs after Esc; building + pose from red1.
 S4 REPRODUCED headless: hueNoise 1183-1398 on the Terminal exterior pose [41.691,4.561,33.774] EVERY time it follows an interior
   press ([7.473,-7.532,1.036]); 5-6 on a first press. Same on d0125d74 (pre-today) = sequence state carried across presses in the
   GI path (G.acc / kept renderer?). hueCls will now classify it; bisect what the interior press leaves behind.
ORDER (red1 2026-09-26 18:30): loose Alt+S items FIRST (S1 blown, S2 unlit ceilings, then S3), THEN the Alt+C review.
ALT+C RULINGS (red1 2026-09-26, recorded for the film lane — do not re-litigate):
 R1. EXPOSURE = a movie camera in action: meter every frame (the §METER_ADAPT CIECAM02 meter, 160x90 readback) and ease toward
     it at a capped adaptation speed (cite the source of the speed, e.g. Unreal Engine auto-exposure documented defaults), never
     a jump; not fixed per film.
 R2. 4D BUILD-UP: shadows + bounce follow the visible geometry per frame (as today). Zone-based interior lighting (zone binding,
     sky gating, IR floor, cove, EN lamps) applies to a space only once it is ENCLOSED (its walls + roof built); until then it is
     lit as OUTDOORS (sun, sky, shadows, bounce). The switch fades over a few frames. Lamps light as they are placed; where a
     space has no lamp, ambient/sky as in Alt+S. Realism of a fast daytime film is the goal (red1: "realism is what we going
     for"; build-up mostly in bright day, MEP comes on soon).
 R3. Alt+S defines the look; films inherit it, camera-free terms computed per building (or per build-up stage), only sun,
     camera and exposure ease vary per frame; continuity beats per-frame optimum; fixed seeds, constant program count.

## ▶▶▶▶▶▶▶▶▶▶ §DEV RESUME 2026-09-26 PM ("resume bounce") — START HERE (dev red1-55; red1 rebooting for the NVIDIA driver)
TRIGGER: when red1 says "resume bounce", read §WORKING MODE above, then this block, then continue the NEXT list. Supersedes the
09-26 AM block below (kept for history).
LOOK TREE: /tmp/wt-look (branch look/combined-0925) @ f5f16c44, sw v1431, serves :8624 (node ~/bin/serve_tree.js /tmp/wt-look
8624 — /tmp is wiped by a reboot: recreate with `git worktree add /tmp/wt-look look/combined-0925` from ~/bim-ootb, restart the
server; buildings fall back to ~/bim-ootb/buildings). Every commit below is on origin/look/combined-0925 + its own fix/ branch.
SHIPPED today (one commit each, oldest first):
- 285f7197 §GI_RECEIVER_QUANT — rainbow voxel edge FIXED: cause was gi_still.js receiver() reading the hue of 8-bit near-black
  pixels (app [1,1,0] -> composite [95,94,0]); chroma shrunk by 1 sRGB code. Probe at red1's pose: invented-hue px 16,780 -> 337.
  The sky-field zone-mixing lead was WRONG (the F step is a real zone boundary; cross-zone taps were open cells, by design).
- a71e3022 §FAULT at §STILL_REFINE done + §FAULT_GI (hueNoise, blown %, dark %) — BOTH WRITTEN INTO THE SAVED PNG tEXt
  (bim-still-pose .fault/.faultGi). Read any still: python3 of the tEXt chunk (see still_meta.py pattern: struct-walk chunks).
  Counters: unlit, unlitCeil, fieldBad, glassOpaque, glassStock, lamps lit/loaded/cap (f5f16c44), capDropNear, extLightsDay,
  glassLow, portalsRetired, expStep, guard.
- dd2bae45 §STILL_POSE_HOST (host + sw in the PNG). 4f3a46f6 §NO_PHOTO_PROPS (fabricated staging lights removed: facade
  up/down, roof spots, sconces, tree lights, skyline window points, sparkle orbs; skyline boxes kept).
- ac46e4e0 §STILL_ESC_LEAK (5.8 MB canvas stranded per Alt+S->Esc). 6b92c252 §ZONE_TEX_CPU_DROP (41 MB) + §WIDE_RELEASE.
- 5a6d4843 §STILL_STATUS_STEPS (status line names each step, says which are one-time). 96cab2e7 §GI_READBACK_CHURN
  (~370 MB garbage/press gone).
- 7ba2c4df §LAMP_LOOP — THE HANG: three.js unrolled 200 point lights into every program; first staged frame 157 s -> 7 s
  (Hospital, headless Vulkan); §METER identical looped vs &lamploop=0. Hospital Alt+S works again (red1 confirmed).
TEST RIG NOTE: NVIDIA module 595.84 vs lib 595.91 mismatch until reboot -> headless gl-egl fails; headless over Vulkan
(--use-angle=vulkan --enable-features=Vulkan, no EGL env) works but lands on the Intel iGPU (~1.1 s/frame: TAA/AO times there
are NOT red1's). After reboot re-check gl-egl on NVIDIA.
ALT+S TIME (Hospital first press, Intel headless): rooms 0.6 s, staging 16-19 s (zone 3.7 + sky 1.5 + audit 1.5 + cap 1.2 +
shadowFit 1-5 + other), TAA 16 fr, AO 24 fr, GI: engine 2.6 s + COPY BUILDING 63 s (once per page, 4,888 renderables) +
orientation 11 s (already cached in localStorage on red1's browser) + 8 passes 3 s.
NEXT (red1's order, decide nothing twice):
1. ✅ DONE 2026-09-26 de341c89 (sw v1433, on look/combined-0925 + fix/zone-idb-cache): §ZONE_IDB_CACHE — Hospital first
   Alt+S after reload staging 12.2 s -> 3.7 s; hit arrays byte-identical; code edit -> stale-code rebuild. Was: Zone grid + sky-view field cache in IndexedDB per building (red1 asked "cache the 1-time work"; ~6.5 s/first press). Not
   into the .db file.
2. Bounce-free FIRST press (preview): first Alt+S shows the still without the GI layer while the WebGPU copy runs in the
   background; next press adds bounce. Offered to red1, not yet approved — ask once, one line. Quiet copy after page load was
   discussed: costs ~80 MB GPU + a second mesh copy + possible 2.9 s stutter slices; red1 asked if lamp count could gate it —
   no (the bounce engine draws no lights; cost = renderable count).
3. §FAULT gap: red1's Hospital still bounce_still_1790378763574 (cam [-8.88,-3.263,37.26]) shows blocky diagonal stair-step
   shading on a tall teal wall; every counter clean -> add a blockiness counter, then find the cause (shadow texel 0.0868 m
   single map vs the 0.5 m zone grid). red1: "jags in shadow still there, less pronounced".
4. §IRC_MAX black ceilings (spec 28ce40f5b): LTU still …378339859 unlitCeil=12/121 (black ceiling blotches, bounce-only).
5. §FAULT false-positive checks: glassOpaque (13 HHS / 90 Hospital — probably frame-only IfcWindow meshes), glassStock=440
   on LTU (window looks clear), hueNoise counts real colour bleed (HHS green beams 1,315). Covered-outdoor black (LTU canopy
   dark 2.9%) not caught by unlit.
6. Then the old queue: §LAMP_UNCAPPED (b00ea663e; capDropNear=120 on a Hospital aerial), §COVE_LIGHT (TRIM_LUX_VOID 100),
   §GLASS_VEIL (Clinic windows opaque from outside: still …374222505), floor blotches.
SHIPPED later 2026-09-26 PM (look/combined-0925, each its own fix/ branch):
- 28f86ff7 §STILL_LAMPS_OUTSIDE default 1 (red1: "good to have them on and bright so outside view can be impressive"; calibrated
  intensity, no boost; films same). Aerial pose: GPU peak 5244 vs 5892 MiB, GI 72 vs 73 s — no cost.
- 524c3db1 §LAMP_UNCAPPED (NEXT 6 pulled forward; red1 "far corner dark, lights up when near" / "one angle lit, other dark").
  Cause measured: cap 160-200 picked around the camera (Terminal 421 lamps near red1's target lit 132 vs 91 from two poses).
  Now every placed lamp is data (tools.js A._lampData -> sourced_light.js clusters 2 m, shader loop). Witness scratch probe
  uncap_probe.js: Terminal 861/861 lit both poses, target list identical, 0/221 missing; Hospital indoor 1274/1274 (was 160),
  refine 12.3 vs 12.2 s, link same, loop mean 164/fragment. §FAULT now prints lampList mean/max. Films still on the pool (next).
SHIPPED 2026-09-26 PM (cont.; witness = § counters, red1: "no more rely on my visuals"):
- e04af53d §FAULT glassOpaque windows-only (IfcPlate opaque = IFC-opaque: Hospital "Spandrel Glass" T 0.0, Terminal "Metal
  Deck") + glassPlateLost per guid; d4c12d99 §INST_RGBA_SPLIT (57 Hospital glass panels drawn opaque: instanced hash groups
  keyed on geometry alone; now split by rgba/class/matVariant) — Hospital §FAULT OK first time.
- 87c9bf77 §GLASS_SPEC_GATE (Clinic glass black from outside: reflection gated by diffuse F in window reveals; now its own
  mirror-ray march) — §FAULT glassReflDark 32/37 -> 5/37; refs unchanged.
OPEN (branches pushed, NOT merged):
- fix/irc-max §IRC_MAX v2 (spec above): Clinic black strip 2044 -> 0 near-black px; BUT refs move (Clinic corridor composite
  77.7 -> 72.2 meter-with-IR / 97.7 meter-direct; Hospital indoor 83.5 -> 72.3 / 107.4) -> ASKED red1 which (recommended
  meter-with-IR). Branch currently = meter-direct (flip = drop the IRP[1]=0 in meterRead).
- fix/ground-view (Fable agent): red1 "very black shadows" (Hospital aerial …387480591): 6101 near-black px, shader-exact
  class = covered exterior surfaces F<0.2 in sun shadow; slSkyKeep scales hemi ground half by the UPWARD sky-view F.
- fix/glass-batched: §GLASS_FRESNEL patches untagged batched buckets whose members are all glazing (Clinic 40/80 stock glass
  hits); glassStock counts them. Untested (GPU busy).
- fix/fault-block: §FAULT_BLOCK instrument parked (confounded by grid-aligned geometry).
SHIPPED later (look/combined-0925 @ 5c9e7fc6, sw v1441): 9e491e8e §IRC_MAX v2 (meter counts all light — decided for red1:
"darker is realistic"; Clinic strip 2044 -> 0; refs Clinic corridor 77.7 -> 70.4, Hospital indoor 83.5 -> 72.4), db29c4b8
§GLASS_BATCHED (Clinic stock glass 40/80 -> 0), 5c9e7fc6 §GROUND_VIEW_FIELD (Fable; hemi ground half x Gd 'bounce' mode;
Hospital aerial near-black 6101 -> 3844, dark 0.24% -> 0.13%).
NEXT (red1 11:22, before suspend):
1. "Outside Hospital there are dark blotches along corners" — still …392936525 cam [16.708,9.062,17.766] tgt 0,0,0 (taken on
   v1440, BEFORE §GROUND_VIEW_FIELD). First: black_probe.js (scratchpad) exact classification at that pose on v1441.
2. "lamp strength should be commensurate with indoor space, a standard governs it" — EN 12464-1 maintained illuminance per
   space use (§LUX_CHECK already maps it). Today every lamp = one calibrated intensity (§SOURCED_LIGHT_CALIB) regardless of
   room. Spec: per zone scale lamps so the zone's mean working-plane E (0.8 m, lamps only, analytic — §LUX_CHECK way) meets
   its EN row (cite rows; unknown use -> circulation 100 lx, as TRIM_LUX_VOID). Indoor still …392969959 cam
   [-9.745,-2.417,8.472] tgt [-4.804,-0.83,-2.23] (blown 0.32%).
   -> 167af49a §LAMP_EN shipped (sw v1442): room-category EN table (corridor 100, restroom 200, kitchen 200, utilities 200,
   habitable 200 default = 6.37.1); per room box, 3 passes, cap p90, unassigned -> median; Clinic achieved E/EN p50 0.88,
   lamps were ~7x over EN. §LUX_CHECK fixed (read point lights -> lamp-blind since §LAMP_UNCAPPED). Clinic IFC has 269 named
   IfcSpace (CORRIDOR 40, TOILET, WAITING, OFFICE...) dropped by extraction -> carry over later; Hospital/Terminal IFC have 0.
1a. WARM PROBE (use it instead of fresh-browser runs): viewer/tests/warm_probe.js on the look tree — `node viewer/tests/warm_probe.js
   8699 &` then curl -g 'localhost:8699/open?port=8624&db=Hospital&q=%26ghost%3D1', /alts?cam=[..]&tgt=[..]&gi=0|1, POST /eval.
   Hospital: load 38.6 s once, first press 103 s, then 4.9 s (gi=0) / 8-17 s (gi=1). /open reload=1 after a code change.
   First catch: Hospital has only 8 injected rooms -> §LAMP_EN is effectively one building-wide scale 0.142 (1270/1274 lamps
   unassigned); Hospital indoor ref composite 72.3 -> 56.1 (meter 9.76 -> 21.1). Awaiting red1's eye.
1c. SHIPPED 2026-09-26 PM (look @ 3a29e730, sw v1445): 90f82d95 §LAMP_EN_ZONE (Hospital lamps in no room -> per light zone,
   402 zones at 1.00x EN); 508664ac §SPACE_USES (Clinic lamps by REAL IfcSpace use via GUID containment in the Electrical IFC —
   821 lamps, office 500 / corridor 100 / waiting-toilet-plant 200; sidecar buildings/space_uses/Clinic.json, script
   viewer/tests/extract_space_uses.py); 3a29e730 §METER_ADAPT (red1: "dynamic lever derived from such data"): meter exposure
   = base x ratio^-D, D = CIECAM02 degree of adaptation from the metered lux (corridor 168 lx D 0.843 -> composite 78, approved
   was 77.7; Hospital indoor 351 lx D 0.862 -> 116). &adapt=stevens = old fixed 0.33. Snapshots sent to red1 for the look call.
1d. SHIPPED (look @ d0125d74, sw v1448): 933e2a8b §GLASS_ENV (per-still cube capture of the staged scene as the glass clones'
   envMap; Clinic outside glass mean 4.8 -> 36.2, near-black 63/81 -> 33/81, 189 ms); d0125d74 §COVE_LIGHT (Fable): every dark
   compartment gets a ceiling-perimeter cove sized to its deficit (rooms EN row / TRIM_LUX_VOID 100 lx), own RGBA8UI texture
   (deviation from spec 4, stated), visible 0xffe4b5 strip mesh (+1 program); Hospital 382 zones qualified, inner room black px
   45,980 -> ~1,050, plenum 74% -> 7.7% (remaining = floor-facing undersides, bounce's job); lit refs unchanged (cove 0).
   Open: Clinic ceiling-gap + Hospital toilet defect poses do not reproduce (0 black before) — INCONCLUSIVE; Terminal 2 shafts
   >15 m below top-only emitters stay dark. WARM PROBE LANDMINE: after editing a file WITHOUT bumping CACHE_VERSION the SW
   precache serves the stale file — clear SW + caches (scratchpad/cove/swclear.js) before /open reload=1, or bump sw per test.
   ALT+C next (red1 asked "way paved?"): order = F0 gate hygiene + F8/F7 instruments -> lamp data for films -> per-shot meter
   freeze -> gi_film max(IR) -> 5 s check clips -> S3 4D build-up (hardest). Films are gated out of ALL of today's work.
1b. Corner blotches (item 1) — Fable §GROUND_VIEW_SUN step 1: hypothesis WRONG, nothing built. 55% of the black is an OPEN 0.5 m
   slot between two "Roof Soffit: Metal Panel - 50mm" layers (0yBDUVxBfEAwIEA5xi7UcV above, 3j5XRUDAL1bfmNQ9$z3SDQ below) at
   "Exterior - Metal Panel" wall 2kX3tz5gv6bv4UYUPS1hhW, x 10.2-14.5 y 4.5-4.8 z 9.7: no fascia modelled; mesh sky view ~0.09,
   ground 0, sunlit-obstruction share 0.000 -> physically dark at exposure 0.383. 36% = dark interior through glass (ruling).
   Levers = data (closure) or a ruling on shaded cavities. Lattice limit noted: min elevation 6.72 deg, a 1-cell slot reads F 0.
3. Parked: §FAULT_BLOCK instrument (fix/fault-block), films on lamp data (still pool), 3183 unresolved-zone near-black px (Clinic).
RED1 2026-09-26 PM on still …380099073 (aerial, outside, day): "windows very dark no light within". State: lamps 0/200 lit —
§STILL_LAMPS_OUTSIDE (effects.js ~4338) turns all lamps off for a daylight still shot from outside; &lampsout=1 keeps them
on; default 0 "until red1 picks". -> red1 picked ON (28f86ff7).
red1 2026-09-26 PM: "Terminal, Hospital indoor rather botchy shadows. Only Clinic hallway is nice ... clear up any pending fixes
and do good WITNESS logging and no more rely on my visuals" -> work the NEXT list, every fix proven by a § counter.
LESSONS today: pkill -f / pgrep -f self-match killed my own shell twice (exit 144) — kill by pid. A memory "hog" report was a
main-thread stall (shader compile), not RAM: measure the first staged frame (SOURCED_LIGHT_BIND -> GLERR firstFrame gap).
red1 tests the latest always — never ask which version.

## ▶▶▶▶▶▶▶▶▶ §DEV RESUME 2026-09-26 (dev red1-5a; context low -> new session) — START HERE
LOOP NOW: see §WORKING MODE above (no watchdog). NO new witnesses/A-B/gate runs. Build a fix -> merge into ONE look tree /tmp/wt-look
(branch look/combined-0925, base 9991dcee, serves :8624 — red1 tests there; never leave a broken intermediate: develop in a
side worktree, fast-forward /tmp/wt-look only after a clean smoke) -> bump sw -> commit each fix separately -> 1-minute
smoke (scratchpad smoke.js, also committed as viewer/tests/smoke_alts.js) -> tell the watchdog sha + one line. Agent models:
Sonnet for simple work, Fable for tough pieces (red1 2026-09-26). Every fix pastes the §FAULT line before -> after at
red1's pose for that defect (poses from the PNG tEXt chunk "bim-still-pose").
IN FLIGHT:
- RAINBOW VOXEL EDGE (red1 still …353472343, Hospital cam [-31.093,-2.567,4.481] tgt [6.293,-9.591,13.424]) — PRIORITY 1,
  NOT FIXED. The Fable agent hit its session limit before any code change (worktree /tmp/wt-edgefix, branch
  fix/field-zone-edge off 9991dcee, :8626: clean, nothing committed). Its probe data (scratchpad
  /tmp/claude-1000/-home-red1/41023e8a-7672-4a6f-ba92-f40c1311eff5/scratchpad/probe_before_8624_session.json, probe_edge.js,
  probe_body.js, band_body.js; 8624 = before): frame hdrNaN 0, hdrNeg 0, fNaN 0 -> suspect (c) NaN/negative hue shift RULED
  OUT. Three screen lines across the bulkhead (y 30/90/150 px, x 300-1000): line y=150 has one step F 0.306 -> 0.006 at a zone
  flip (605 -> 640) and 28 pixels whose trilinear taps span >1 zone AND were accepted (acceptedSpanPx 28) -> suspect (a), the
  in-zone filter accepting other-zone taps, is the lead (not yet proven as the colour-band cause). Next: in sourced_light.js
  make the filter weight ONLY same-zone taps (compare the tap's zone id, never interpolate ids or the SKY_BIT-packed value),
  renormalise, fall back to the picked cell; re-run the agent's line probe at the pose (stepF 0, acceptedSpanPx 0), smoke,
  merge. Fable for this if the budget allows (it resets 4:50am Asia/Kuala_Lumpur), else do it directly.
- §FAULT per-press self-check: /tmp/wt-dev branch dev/look-next f5ff2085 + smoke 8d1aab2f (:8625), WIP, NOT merged. To do:
  (1) call StillFault.report at "§STILL_REFINE done" (not at staging end: the lamps go off later; it logged
  extLightsDay=191 where the true after-press state is 31); (2) add fieldBad (F NaN/<0/>1, taps spanning >1 zone),
  unlitCeil (down-facing unlit), blown/dark (from the meter's 160x90 render after exposure); irrBad is shader-side (n/a
  unless a debug readback). Then merge first.
FOUND (not yet fixed): the 31 lights on outside by day are the PHOTO PROPS (effects.js ~686-760 _buildPhotoProps: facade
uplights 0xffaa55/0x8cc0ff, downlights, sconces 0xffcf9a range 6, _photoSparkles sprites, skyline lights) — fabricated
staging lights, not real sources; likely red1's Clinic "warm orbs with star flares" (…353558771). Ask red1 via the watchdog:
remove completely (like the glow layers) or off by day.
QUEUE after the edge fix + §FAULT: §IRC_MAX (28ce40f5b; black ceilings), §LAMP_UNCAPPED (b00ea663e), §COVE_LIGHT (all
compartments, deficit, TRIM_LUX_VOID 100; red1's Clinic corridor side-bay voids …353577428), §GLASS_VEIL (Clinic opaque
glass …352178540), exterior lights by day (photo props above), then the floor blotches (…353323520, bounce/AO grain).
Other pushed branches: feat/still-pose-host 814eb79d (host:port + sw in §STILL_POSE; syntax-checked only, merge + smoke);
feat/lamp-zone-pick 3df3e1bf, feat/no-glow-layers 92b36bdb, feat/sourced-daylight 59e0b22d (all already inside 9991dcee
except pose-host). Findings on record: tower blotch = lamp cap + retired-portal light loss (AO minor); lamp cap = CAP_LIMITED.

## ▶▶▶▶▶▶▶▶ §DEV RESUME 2026-09-25 EVENING (dev red1-5a; PAUSED for machine suspend) — START HERE
Watchdog = red1-c6 (red1 delegated answers to it). Rules in force: Alt+S = source of truth, film inherits (every lighting
function = BUILD per building + DECIDE per frame, ray-free, ms; film adds only continuity; commit lists BUILD/DECIDE +
"film path"); spec first; § witnesses only, no visual/pixel judging; one GPU browser at a time; after resume RERUN any
witness (nothing was left running).
SERVED (unchanged, do not move without the watchdog): 8600 = /tmp/wt-sourced-live @b35d5cf9 v1337 · 8619 = /tmp/wt-int @e61c116b
v1370 (red1's look tree; its branch feat/sourced-light-int is already c56769bf on origin — pull the worktree forward only when
the watchdog moves 8619).
GATED PASS (all pushed): §STILL_SHADOW_EDGE 51c93e87/3883eebe · §STILL_POSE_PNG 5c48105a · §PORTAL_SHADOW_BIAS 2980872b/3edd28a8 ·
§ZONE_OPEN_SKY b4cb61c1 · -int e61c116b · §STILL_SHADOW_CASCADE 0a9950a3 + meter fix §STILL_SHADOW_CASCADE_MAPS_EXIST c56769bf
(= origin/feat/sourced-light-int) · §STILL_STAGE_MS 88c90251 (feat/still-stage-ms; goes onto -int with the next 8619 move) ·
FLYIN_DARK §LAMP_ZONE_PICK 996d2049 + CAP_LIMITED witness 3df3e1bf (feat/lamp-zone-pick, 8622; ff onto -int WITH the sky field).
FAILED + replaced: §SOURCED_DAYLIGHT ADF (522b3eac: DF > 100%, exposure hidden) -> §SKY_VIEW_FIELD.
OPEN, in order:
1. §SKY_VIEW_FIELD feat/sourced-daylight 59e0b22d (8621, sw v1397; includes §LUX_CHECK + §STILL_STAGE_MS). Gate mostly good
   (SKY_STEP 528->0 canteen, 384->0 waiting hall; maxF<=1; outside ref pose unchanged; regressions PASS; link -6%) BUT a
   GLARING defect for the watchdog: with IRC off (its default) a real GI still leaves the Terminal hall black (345/564
   samples; hall_floor 279/573; with &irc=1 75 and 13). Cause: F is the sky component only; ceilings under opaque roofs get
   F=0, portals are retired, screen-space GI has no lit neighbour. Options to rule: IRC on / a real interreflection pass /
   keep portals for opaque-roof zones. Also: §LUX_CHECK EN mapping empty — the served DBs have no named IfcSpace rows (data
   finding). Logs scratchpad/day/.
2. §GLOW_LAYERS_OFF feat/no-glow-layers 92b36bdb (8623): both layers DELETED (grep 0 refs), §FIXTURE_EMISSIVE K = Hospital 14,
   Clinic 98, Terminal 28 (all synthetic no-guid lamps), ITEM_C at red1's Clinic pose: glowDraws 3 on 8619 -> 0 here,
   emissiveBehindGlass [] (item C cause = the glow layers, confirmed). Two old witnesses test the deleted code
   (witness_vacuous_tag_guards.js, witness_tail_lights_all_discs.js:41) — retire/update. Needs its gate request.
3. §COVE_LIGHT spec OPEN (fb2b30263 + deficit rule 83e9c05f9 + all-compartments 7edc19490 + TRIM_LUX_VOID=100 3a2163a9c):
   build on top of the sky field (B/A texture channels). Gate: red1's inner room / toilet / Clinic ceiling gaps + a Hospital
   plenum-with-MEP pose.
4. §GLASS_VEIL spec OPEN (b0f706126 + blend 780960d6a): after the sky field (same T).
5. §METER_HIST spec (c6dd7807a, ruling 70/95 c281e6fd6): red1 A/B at café corner + stair, three modes; after the field.
6. Later / logged: §CAMDEP_SURFACE witness (scratchpad/witness_camdep_surface.js, report; commit it to -int), film wiring of
   §LAMP_ZONE_PICK DECIDE + fade, speed list (Terminal first press 144-164 s top; audit off at runtime; zoneCap; portal stage
   gone with the field), ALTC F1 (lamps as zone data, no cap).

## ▶▶▶▶▶▶▶ §RESUME 2026-09-25 LATE — START HERE (dev hand-off #2; written by the watchdog red1-4b)
Supersedes the §RESUME 2026-09-25 block below (still valid as background). Roles: you are the DEV session; watchdog =
`red1-4b` (SendMessage): recap to it, it gates every step from pushed code + full § logs. red1 does ALL visual judging live on
localhost:8600 — you do NO visual checks (no sheets, no frame/pixel judging): code, console-captured witnesses, § numbers only.
Use a Fable subagent (Agent tool, model "fable") for hard foundational pieces; review its diff + rerun its witness yourself.

**Live on main (unchanged this lane):** #1765/#1766/#1767 (sw v1303). Nothing from §SOURCED_LIGHT is merged to main.
**localhost:8600** = /tmp/wt-sourced-live @c0e44bc3 (feat/film-parity eb3a41c1 + sw bump, v1332, OLD lighting, known-good).
Put the new lighting on 8600 ONLY after the matrix below passes, from a clean committed tree, with an sw bump.

**Branch feat/sourced-light** (/tmp/wt-sourced; tip b35d5cf9 — check it is pushed): voxel light zones (light_zones.js),
zone-bound lamps/portals + indoor hemi/ambient 0 (sourced_light.js, `&sourced=0` = old), zone-priority lamp cap, glass out
of the sun shadow pass, physical lamp calibration + Stevens-0.33 incident-light meter (`&calib=0` off; `&metermode=avg`
default, centre|zone kept), §WASH_SOURCES/§WASH_FRACTION witness (viewer/tests/witness_wash_sources.js, analytic, no bounce),
shared console GUARD (FAIL on "Shader Error"/"Context Lost"/pageerror), and the §SOURCED_LIGHT_LINK fix (Fable agent,
fix/sl-gl-link 75dd41e5): slFragZone once per fragment — the per-light inlined copy (181 per program) hung the GPU process
(exit 133) → LINK-false storm → Context Lost = red1's red bar. Link total 129.8 s → 46.4 s (old shaders 28.9 s), max 1.7 s.

**NEXT, in order:**
1. ✅ DONE (watchdog, 2026-09-25): matrix 8/8 on merged b35d5cf9 + agent 10/10; 8600 now serves /tmp/wt-sourced-live detached at b35d5cf9 (v1337), watchdog smoke 0/0/0. Original text: GL-fix acceptance matrix on the merged branch: pose (default exterior + café) × db (local + OCI Hospital) × ANGLE
   (gl-egl + vulkan): 0 Shader Error, 0 Context Lost, §SOURCED_LIGHT_GLERR clean, feature ON. Log §SOURCED_LIGHT_LINK
   totalMs/maxMs. Then 8600 (sw bump) → message the watchdog (it tells red1 what to look at).
2. §SOURCED_DAYLIGHT (spec 481d42c43): per-zone BRE daylight factor over ALL panes incl. ROOF glazing (sky_portal drops
   |n.y|>0.7 today, so the atrium roof glass contributes nothing). Watchdog's read: the Hospital café is too dark
   (tone-mapped median 0.358 vs reference 0.636, target band 0.55-0.70) because this daylight is MISSING — build it before
   ANY balance/exponent change (no hand tuning; cited values only).
3. COVERED = INDOOR zones (watchdog spec, see message log): a cell with solid above is indoor; open bands/unfilled openings
   become daylight apertures of the zone. Terminal hall is zone 0 (outside) today via a ~174 m² open band at the roof edge.
4. Re-measure §WASH_FRACTION: Hospital café reference (old lighting 0.636/0.834/0.7%), Clinic corridor, Terminal
   hall_floor stand-in; acceptance: café 0.55-0.70, Clinic/Terminal WASH ≤ Hospital's, Terminal exterior through-glass
   median < shaded facade median.
5. Speed: §SOURCED_LIGHT_CAP 2.3 s/press → <200 ms (use the zone texture, no scene raycasts); §SOURCED_LIGHT_FRAME ms vs
   &sourced=0; Alt+S same-session cache (§STILL_CACHE hit/miss/savedMs; honour §R17).
6. Shadow base gap: depth bias from the FITTED texel (~1 texel), normalBias carries acne; target predictedBaseGap < 0.05 m
   at 45°, acne count 0 (ray vs shadow-lookup witness).
7. Later: parity PR (films follow the approved lighting; film-fill default revisits under sourced light), §STILL_RES cost
   table (window/1440p/4k same pose; 4k cap one-line fix), 4-nearest-lamp shadows (stills only, zone casters) only if red1 asks.

**§STILL_SHADOW_EDGE — SPEC (2026-09-25, dev red1-5a; watchdog reorder: jagged edges + base gap BEFORE §SOURCED_DAYLIGHT,
one shadow change with NEXT 6). red1 on v1337: shadows "jagged and with a base gap". Alt+S only (`!A._maxqActive`); films
and nav unchanged. Branch bim-ootb feat/still-shadow-edge off feat/sourced-light 3395ae42.**
Facts from source (not re-derived later): r186 PCFShadowMap = 5 Vogel-disk taps on a sampler2DShadow (each tap a hardware
2x2 bilinear compare), disk radius = shadow.radius TEXELS, taps rotated per pixel by interleaved gradient noise of
gl_FragCoord. Depth bias is world 0.305 m, fixed (effects.js ~3480) -> base gap = 0.305/tan(elev) = 0.34 m at 42 deg,
0.305 m at 45 deg. normalBias = 2 x fitted texel (_stillFitApply). Map 8192 on Hospital (square); fitted box on the default
exterior 530x285 m -> texel 0.065 x 0.035 m. A texel's on-screen size = texel / pixel footprint, pixel footprint at view
depth d = d x 2 tan(fov/2) / H: at d = 5 m (fov 60, H 864) a pixel is 0.0067 m, so a 0.065 m texel is a ~10 px stair.
1. BASE GAP (NEXT 6). At the fit (_stillFitApply, Alt+S): worldBias = 1 x the fitted texel (max of texelX/texelY; per
   cascade in 3), bias = -worldBias / (far - near). normalBias = (R + 1) x texel (R = the PCF radius): a tap s texels off
   on a surface tilted theta from the light differs in depth by s.texel.tan(theta); lifting the lookup (R+1) texels
   along the normal clears the whole kernel (R) plus the bilinear footprint (1). normalBias makes no base gap on the ground
   (a lifted ground point behind a column still meets the column on its sun ray). Log `predictedBaseGap45=` worldBias/tan45.
   With one 0.065 m texel the gap is 0.065 m at 45 deg: the < 0.05 m target needs a texel <= 0.05 m where the gap is seen,
   i.e. the near cascade (3).
2. RADIUS. The PCF radius cannot remove a stair wider than a few pixels: it only turns a 10 px stair into a ~30 px blur.
   So R is fixed at 1.5 texels (edge filtered over 2R = 3 texels + the bilinear 1, the watchdog's "2-3 texels"), and the
   PROJECTED texel decides the cascade instead (3). &shadowradius / APP._stillShadowRadius still override. Log R.
3. NEAR CASCADE (Alt+S only). Trigger: the fitted texel > 0.03 m (watchdog's budget) — on Hospital's default exterior it is.
   Near map: a second shadow-only DirectionalLight (colour 0, same direction as the sun, castShadow, map = the sun's size
   when maxTextureSize allows, else 4096; logged) whose box = the light-space rect of the view frustum slice [near, S],
   S = 35 m (watchdog's 30-40 m) or the farthest building corner if nearer, + 2 m pad, centre snapped to whole texels.
   The ortho cameras keep the whole sun ray (near/far = the sun's), so a caster outside the slice that shades inside it is
   still in the map. Shader: one patch in lights_fragment_begin's directional-shadow line — for the SUN (identified by a
   uniform index, not list order), shadow = mix(near lookup, far lookup, w), w = smoothstep(S - 3, S, view depth); the near
   light adds no light (colour 0). Texture budget +1 (sampler2DShadow): §LIGHT_TEXTURE_BUDGET reserve 9 -> 10 (logged;
   shadowed portals drop by one only on a 16-unit backend). Near map rendered once per still (autoUpdate false, like the
   portals). Removed at teardown; §R17 releases both maps.
4. WITNESS (numbers only, no frames judged): viewer/tests/witness_still_shadow_edge.js, Hospital (OCI db) default exterior
   + café + one grazing pose, sun 45 deg and 20 deg, real GPU. Logs `§STILL_SHADOW_FIT` texel per cascade, `R`,
   `predictedBaseGap45`, shadow-pass ms (both maps, gl.finish-timed) vs before. ACNE / GAP predicate on a 48x25 grid of
   visible surface points: RAY = a ray to the sun from the point + 0.05 m along its normal (glass skipped: it casts
   nothing since §SUN_GLASS_CASTERS) vs LOOKUP = the renderer's own sun-only shading of that pixel (white Lambert override,
   every other light at intensity 0, float target) / N.L.Isun. ACNE = ray lit, lookup < 0.5; GAP = ray shadowed, lookup
   > 0.5; a point whose ray flips when moved (R+1) texels in light space is EDGE (penumbra), counted apart. Target: acne 0,
   gap 0 outside EDGE, predictedBaseGap45 < 0.05 m in the near cascade. Arms: before (v1337 values) / after.


**§ZONE_OPEN_SKY — SPEC (2026-09-25, Fable agent; watchdog brief via the dev session; branch bim-ootb feat/zone-open-sky
off feat/sourced-light 3395ae42, served on 127.0.0.1:8614). Replaces the connectivity + 4.5 m closing notion of OUTSIDE.**
PROBLEM (measured on 3395ae42, Hospital local db, default pose after Alt+S): OUTSIDE = the empty component reaching the grid
edge after the solids are grown 4 cells (CLOSE_R 4 = openings < 4.5 m shut); every other empty component is an indoor zone
and its fragments get no hemi / ambient / IBL sky (uSLParams.z = 0). Courtyards, light wells and the gaps between wings
seal as INDOOR: 29,332 zone cells have no solid anywhere above them (zone 13: 18,645; zone 1: 7,920; then 489/312/239), so
every sun-shaded exterior surface there renders black (red1's v1337 still). The Terminal hall is zone 0 (outside) through
a ~174 m2 open band at the roof edge. Both symptoms have one root: outside was a connectivity class, not a physical one.
RULE (light_zones.js build()): a cell is OPEN-TO-SKY when no SOLID cell lies above it in its own column (one top-down
column scan); every other empty cell is COVERED. Open cells carry value 0 (the shader's OUTSIDE, sky kept); light zones
are the 6-connected components of the COVERED cells only (ids 1..; SOLID 65535 unchanged). No closing radius, no
connectivity to the grid edge, no per-building value. EARTH: below the ground plane (A.ground.position.y) an uncovered
cell is soil = SOLID (the viewer draws the ground plane there; the old edge-ring rule is subsumed); the bottom two layers
below ground stay solid so a basement zone has a floor. The grid keeps 2 padding cells, so its top layer is always open.
DAYLIGHT APERTURES: every face between a zone cell and an open cell is an aperture of that zone: apertureM2 = faces x
CELL^2, split upM2 (open cell above, +y) and sideM2 (+-x/+-z; the open set is upward-closed, so no aperture faces down).
surfaceM2 = faces to SOLID cells (A_z for §SOURCED_DAYLIGHT). Exposed on the LightZones cache: cache.zoneInfo[z-1] =
{ cells, apertureM2, upM2, sideM2, surfaceM2, apertureCells (Int32Array of the zone cells that own an aperture face) }
and cache.aperture (Uint8Array per cell, bit 1 = +y open, 2/4 = -x/+x, 8/16 = -z/+z). The daylight term itself is NOT
built here. Log: `§LIGHT_ZONE ... openSkyCells= soilCells= zonesWithAperture= apertureM2= (up= side=) topApertureZones=
[id:m2:up:side:cells]`.
TWO MORE CASES (red1's v1337 stills via the watchdog, added 2026-09-25 before the after-arm run):
(J) JUNCTION STRIP — a bright-white strip at every wall/floor junction and around column / partition bases (Hospital
level-1 hall). Cause as read: a floor or wall-base fragment inside a wall's rasterised 0.5 m column found every +normal
probe solid and fell back to the FAR side (-normal: the void under the slab, classed outside/unbound) -> full hemi.
FIX (shader + CPU mirror, same order): C0 = the cell of p + 0.25 m along the eye-facing normal; the nearest non-solid
cell CENTRE (from p) among C0's 27 cells whose centre lies on the eye side of the surface wins (the room cell beside the
wall column is always nearer than any cell across the wall or under the slab); none -> walk up C0's column to the first
non-solid cell; a fully solid column = unknown (-1: sky off, lamps as today). The far-side probe is gone.
(C) CANOPY — the Clinic recessed entrance under its canopy rendered as black cut-outs; "covered = indoor" alone keeps
every porch / arcade / deep overhang black until the DF exists. FOUNDATION RULE (meanwhile, no knob): a covered cell is
SKY-LIT when it sees the sky along one of the grid's 24 upward lattice directions (dx, dz in -2..2, dy = +1: elevations
45 / 35.3 / 26.6 / 19.5 deg; BRE's "no-sky line" sampled on the lattice) through non-solid cells only — each ray checks
every cell its centre-to-centre segment crosses, so it cannot tunnel through a one-cell wall or a diagonal crack — plus
one 6-neighbour dilation through empty cells (the grid's own resolution; the 8-direction set alone left a cell-parity
checkerboard under a canopy and reached only one canopy height deep). A sky-lit cell keeps the hemi/ambient/IBL sky like
an open one; its zone id still binds its lamps. Glazing is SOLID, so a room with windows has no sky-lit cells; a room with
a doorless opening is sky-lit near the opening (real: it is bright there; the DF later scales it). ENCODING: the zone
texture stays R16UI: a sky-lit covered cell carries SKY_BIT 0x4000 on its zone id (ids < 16384, warned at exhaustion);
LightZones.at()/atLamp()/atSurface() strip it, skyAt()/surfaceInfo() read it, the shader reads texel & 0x3FFF and sets
_slSky once with _slFZ; slSkyKeep = _slSky ? 1 : uSLParams.z. No new sampler, one slFragZone per fragment.
Lamp/portal binding (atLamp, bindLights, the band functions, §SOURCED_LIGHT_CAP, the §METER zone mode) read masked ids
and are unchanged. red1: Clinic INDOORS is right now — the corridor has no aperture, so its numbers must not move
(witness_wash_sources Clinic before/after).
EDGE CASES (decided, not tuned): a covered arcade / canopy / eave soffit is a COVERED zone with a large sideM2 whose
cells are sky-lit where the lattice rays reach the open air (a canopy soffit's own top layer at the centre is not: only
its lamps + sun until the DF); deeper than ~2 canopy heights it is indoor (lamp-lit) until §SOURCED_DAYLIGHT. Glass roofs:
IfcPlate/IfcWindow/IfcCurtainWall are SOLID, so a glazed atrium is covered with apertureM2 0 — right, its daylight is the
panes' Ag in the DF, not an aperture. An open stair shaft under a roof joins its storeys into one zone as before. A cell
below ground with a solid above it (basement, or soil under a canopy) is a covered zone cell; soil under an open column is
SOLID. Unit-tested offline on a synthetic room + open-sided canopy (scratchpad zone_unit.mjs): room zone 0 apertures /
0 sky-lit, canopy zone 34.5 m2 side apertures, 331 of 336 cells sky-lit, wall base / floor-by-wall / wall-under-canopy /
ground-under-canopy classed as expected.
WITNESS (viewer/tests/witness_zone_open_sky.js, real GPU, console GUARD, load gate = full element count or VACUOUS):
per building (Hospital, Clinic, Terminal, HHS_Office_Federated, JKR, LTU_AHouse, Duplex) at the default pose and an
aerial pose over the building centre: `§SKY_LOSS` on a 48x25 grid of visible surface points (glass/basic/shader/invisible
materials, sky and portals skipped): open = a straight-up ray from point + 0.05 m x normal hits nothing; denied = the CPU
mirror (atSurface, eye-facing normal, off-grid = outside) withholds sky; target open AND denied = 0; the same grid read
back from the SHADER (SourcedLight.debugZones(1) colour = zone) gives gpuAgree/gpuDiffer and gpuOpenDenied. Terminal
hall_floor stand-in: the hall zone id (must be != 0) with its apertureM2/up/side. `§JUNCTION`: a floor sample within
0.6 m of a vertical hit (4 horizontal rays) or a wall sample within 0.6 m above a floor whose zone/sky class differs from
the NEAREST room sample (floor, nothing vertical within 1 m, <= 3 m away): junctionMismatch 0, CPU and shader, at the
interior stand-ins (Hospital cafe_atrium_high + rail_L1, Clinic corridor). `§CANOPY`: direct (not through glass) samples
whose up ray is blocked, split skyLit / denied with the blocker's class; `§PORCH`: a geometry-derived canopy pose per
building (the largest side-aperture zone with no up aperture whose lowest aperture cell is within 2 layers of the ground
plane; camera 8 m outside its side-aperture centroid along the mean outward face normal, 1.6 m up) — coveredDirectSkyLit
must not be 0 there; the before arm gets the identical pose by injecting the new builder as LightZonesNew. Zone counts +
`§LIGHT_ZONE` ms (skyMs) per building, before (3395ae42) / after.
§GLARE (watchdog red1-c6 rule, every run of every witness in the lane: a §GLARE line with counts, FAIL + exit 3 when any
count > 0; "if a glaring error reaches red1 with a green witness, that witness is wrong"): witness_zone_open_sky.js prints
black_exterior (open-sky samples in SUN SHADOW — a ray to the sun from point + 0.05 m x normal hits a drawn mesh, or the
surface faces away — whose zone rule withholds sky: shader readback when available, else the CPU mirror), junction_zone_flip
(§JUNCTION mismatches, shader when available) and covered_open_side_black (direct covered samples in sun shadow, denied
sky, that SEE THE SKY SIDEWAYS: one of 16 world rays from point + 0.05 m x normal — 8 azimuths x elevations 26.6 / 45 deg,
the lattice families of the sky-lit rule — escapes the drawn meshes). Watchdog review of the first cut (zos_before2): the
zone-aperture form of covered_open_side_black flagged 1176/1200 on the Hospital café (an indoor atrium whose zone owns a
doorless opening somewhere) — replaced by the ray form, which reads 0 in an atrium and fires under a canopy. The §PORCH
pose selection by "largest sideM2" picked the whole interior (Hospital sideM2 4840 m2) — replaced by "more than half of
the zone's cells sky-lit sideways" (a porch is open at its sides by definition; the interiors read 24% / 13%). Named pose
clinic_entrance = 8 m outside the exterior double door M_Double-Flush 1830 x 2134mm Exterior:18 (IFC -37.0, -0.3, 1.1)
on the Exterior Slab on Grade in front of it, for red1's Clinic canopy still. witness_sourced_crosswall.js prints
crossWall=N (VACUOUS = FAIL); witness_wash_sources.js prints black_direct_samples=N (direct samples no source reaches at
all). Default fleet list drops LTU_AHouse (its v1337 zone build returns null; on request) and runs the aerial pose on the
three reference buildings only, to keep a full run near 15 min.
WATCHDOG DECISION (red1: "ray-test runs waste time"; supersedes the pose walk as the gate): the three counts are CPU facts
of the zone grid, computed by LightZones.audit(grid, rule, cellSky) at build time and logged in the §LIGHT_ZONE line +
a `§GLARE bld= PASS|FAIL black_exterior= junction_zone_flip= covered_open_side_black=` line, no render, no pose walk:
black_exterior = faces between a SOLID cell and an OPEN-TO-SKY cell whose fragment lookup at the face centre (normal
toward the open cell) withholds sky; junction_zone_flip = for every empty cell E with a solid below (floor) and a solid
side neighbour W (wall / column / partition base), the lookup at the floor point INSIDE W's column 0.2 m from E, 0.05 m
above W's bottom, normal up, is not E's zone + sky class; covered_open_side_black = covered cells that see the sky
sideways (the 24-direction sweep, no dilation) whose cell class withholds sky. witness_zone_glare.js (Hospital, Clinic,
Terminal; ~80 s for all three) builds the tree's grid (AFTER) and injects the 3395ae42 builder as LightZonesOld to audit
the BEFORE grid from the same scene with the old rule (atSurface: 0 / off-grid = sky, zone > 0 or solid = no sky); the
GPU readback (witness_zone_open_sky.js) stays a one-off cross-check. RESULT (2026-09-25, WIP 30924ff0, sw v1338):
BEFORE Hospital FAIL 26800 / 5087 / 42305, Clinic FAIL 10438 / 2251 / 4761, Terminal FAIL 8837 / 2252 / 488513;
AFTER Hospital PASS 0 / 0 / 0, Clinic PASS 0 / 0 / 0, Terminal PASS 0 / 0 / 0 (exteriorFaces 146293 / 60295 / 44228,
junctionTested 193225 / 43616 / 63181, rayLitCoveredCells 240291 / 3905 / 466309). Zones 964 -> 1117 (Hospital),
434 -> 456 (Clinic), 203 -> 156 (Terminal); apertureM2 6875 / 325 / 5185; build ms 2184 / 404 / 1462 (skyMs 1580 /
283 / 784, auditMs 1469 / 272 / 659) vs 1536 / 324 / 1160 before. GUARD PASS.
ONE-OFF SHADER CROSS-CHECK (witness_zone_open_sky.js on the after code, sw v1338): zone-debug readback vs the CPU mirror
gpuAgreeZone 1200/1200 and gpuAgreeSky 1200/1200 on Hospital aerial + cafe_atrium_high and Clinic default + corridor
(clinic_entrance 1092/1093); §SKY_LOSS openDenied Hospital aerial 79 -> 0, Clinic default 19 -> 0 / aerial 138 -> 0.
Terminal §HALL_ZONE: the hall_floor camera reads zone 0 (outside) before, zone 1 after (1,107,080 cells, sideM2 5098.5,
upM2 0: the roof-edge band is a SIDE aperture of the hall's topmost covered layer, folded into the interior's total).
PORTAL BINDING (found by the Clinic corridor wash re-measure, median 0.537 -> 0.457, exposure 34.0 -> 25.8): 4 of 19
portal spots sat in courtyard cells the old rule sealed as a zone (bound there, unable to reach the corridor); open under
the new rule they were UNBOUND ("a portal outside the zones stays unbound") and lit the corridor through its walls, which
the §METER read. Fix: a portal in an open or off-grid cell binds to OUTSIDE like a lamp (only a portal whose every lookup
is solid stays unbound); sw v1339. Re-measured: the corridor median stayed 0.457 (portals were not the cause; kept as
the correct binding, crossWall 0, portalsBound 19/19).
CORRIDOR CAUSE (probe_corridor_meter.js on 8611 = 3395ae42 vs 8614 = after, the meter's own 160x90 white-Lambert frame
joined per pixel with the shader's zone class): the corridor surfaces' light is unchanged (wash analytic levels identical:
lamps 93.7% / portals 6.3%, 0.010 of sunlit ground; the camera-zone pixels' Ein 0.0411 -> 0.0438), but under the OLD
lookup 1,478 of the 14,400 meter pixels (10.3%) of corridor surfaces were classed into OTHER zones — zone 15: 852 px at
E = 0 (black), zone 2: 436 px, zone 94: 107 px at E = 0.0007, unknown 27 — the dark twin of red1's junction strips; the
new lookup classes 14,247 px (98.9%) as the corridor zone (zone 15: 58 px). The log-average meter no longer sees 10% black
pixels: logAvgEin 4.987e-3 -> 7.528e-3, exposure 34.04 -> 25.83, tone-mapped median 0.537 -> 0.457 (p95 0.737 -> 0.667,
wash 0). red1's "Clinic indoors is right" look therefore included the exposure lift those black patches bought; the
surfaces themselves are lit exactly as before. Decision on the corridor level is the watchdog's (a meter matter, not a
zone one); nothing was tuned. Plus witness_sourced_crosswall.js (crossWall must stay 0) and witness_wash_sources.js
(tone-mapped median/p95/wash per pose) before/after. The off-grid = unknown bug in witness_wash_sources.js:77 and the
crosswall witness's CPU column (a -1 raw value is OUTSIDE 65534, not unknown) is fixed in the same commit.
**§PORTAL_SHADOW_BIAS — SPEC (2026-09-25, dev red1-5a; watchdog red1-c6 order (1) after 3883eebe PASS). Alt+S only
(`!A._maxqActive`); films keep -0.0005 / 0.** The 8 shadowed sky portals (sky_portal.js) are SpotLights: perspective shadow
camera near 0.1 / far 40 m, map 512, cone half-angle 70 deg, bias -0.0005 (NDC depth), normalBias 0. Ray grid (café, v1337
before arm): 916 portal acne samples (walls 632, floors 204). Same rule as §STILL_SHADOW_EDGE: the texel of a perspective
map grows with distance, texel(d) = 2 d tan(angle) / mapSize; the still is seen from ONE camera, so each portal takes
d_ref = its distance to the camera (clamped 1..40 m) and normalBias = (R + 1.5) x texel(d_ref). Depth bias = -1/65536
(the 16-bit format step, as the sun's range/65536); its world size at d is d^2 (f - n) / (f n) / 65536, logged as the gap
at d_ref. Log per still: `§PORTAL_SHADOW_BIAS shadowed= dRef[] texel[] normalBias[] gapAtDref[] (was bias -0.0005 = world
gapAtDref[])`. Gate: that line + the café portal acne count from one press (witness_still_shadow_edge POSES=cafe SUNS=45).

**§STILL_SHADOW_CASCADE — SPEC (2026-09-25, dev red1-5a; watchdog red1-c6 order (2); replaces §STILL_SHADOW_EDGE item 3's
single 35 m near slice). Alt+S only first (`!A._maxqActive`); the film path (stabilised) is a separate §FILM_PARITY item.**
WHY (measured, 3883eebe gate log): one 8192 map per still gives texel 0.075-0.086 m on the Hospital default exterior and
aerial, so thinCasterRisk = normalBias = 3 texels = 0.23-0.26 m, and walls at 60-75 deg to the sun see projected texels of
0.27-0.68 m (texel / N.L, witness ray grid) = red1's "blocky walls by the wings". Bias and radius cannot fix it; smaller
texels where the eye looks can.
TARGET (watchdog): texel <= 0.03 m on every surface the frame shows within the cascades' reach, and thinCasterRisk
((R+1.5) x texel) < 0.05 m for the cascade holding the building's visible surfaces — i.e. texel <= 0.0167 m there.
METHOD, cited:
1. Split the VISIBLE depth range, not near..far: a still is one frame, so read the depth range the frame actually shows
   (min/max view depth of drawn opaque pixels from one small depth readback, like §METER's 160x90 render) — Lauritzen,
   Salvi, Lefohn, "Sample Distribution Shadow Maps", I3D 2011. Splits over [zMin, zMax] by the practical scheme
   C_i = lambda C_log + (1 - lambda) C_uni, lambda = 0.5 (Zhang et al., "Parallel-Split Shadow Maps for Large-scale
   Virtual Environments", VRCIA 2006; the value three's own CSM addon defaults to).
2. Per cascade, fit the light-space x/y box to the frustum slice (and, SDSM-tight, to the readback's world points in that
   slice), padded by the PCF reach (R+1 texels); z = the §STILL_SHADOW_EDGE depth fit (building + props + ground slab).
   Per-cascade bias = range/65536, normalBias = (R+1.5) x that cascade's texel (the gated §STILL_SHADOW_EDGE rule).
3. Cascade count m = the smallest of 2..4 whose cascade-0 texel meets the target; map size per cascade = the sun map's
   size (8192 where maxTextureSize allows, else 4096). Memory logged (8192^2 x 4 B = 256 MB per cascade) and released at
   teardown by §R17. Maps rendered once per still (autoUpdate false, like the portals).
4. Shader: A.sun stays the ONE lit directional light (every consumer reads it: §METER, the witnesses, sky). Cascades 1..m-1
   are shadow-only DirectionalLights (colour 0, same direction). One patch in lights_fragment_begin's directional-shadow
   line, for the sun only (identified by a uniform index, never list order): shadow = the cascade covering this
   fragment's view depth, blended linearly over the last 10% of each split (no seam). Must co-exist with the §SOURCED_LIGHT
   patches (zone-once, slPass on point/spot) and add no per-light inlined code (§SOURCED_LIGHT_LINK lesson): the cascade
   choice is computed once per fragment. Texture budget +(m-1) sampler2DShadow in §LIGHT_TEXTURE_BUDGET (logged; shadowed
   portals drop only on a 16-unit backend).
5. Stabilisation (films only, later): bounding-sphere cascade boxes + whole-texel snapping (Valient, "Stable Rendering of
   Cascaded Shadow Maps", ShaderX6, 2008) so edges do not crawl between frames.
WATCHDOG GATE CONDITIONS (red1-c6, 2026-09-25 — OPEN with these; they override items 1-4 where they differ):
C1 FIXED m, one program: m fixed for the session (4, or 3 if enough); unused cascades get a degenerate box, render
   skipped, sampler still bound. Log `programs=` before/after the first press and on a second press at another pose:
   second-press new programs = 0.
C2 ONE LINK: the cascade lights are added in the same staging step, before the first compile, as the §SOURCED_LIGHT
   patches. Log §SOURCED_LIGHT_LINK totalMs with and without cascades (46.4 s baseline); target <= +10%.
C3 MEMORY: cascade 0 at 8192 only if its fit needs it, cascades 1..m-1 at 4096; total memMB <= 512; graceful fallback
   (fewer/smaller cascades), logged, never a crash (4 x 8192^2 x 4 B = 1 GB is a Context Lost risk).
C4 zMax CLAMP: the SDSM readback's zMax is clamped to the §STILL_SHADOW_EDGE depth fit (building + kept props + slab);
   sky and far-ground pixels excluded, so the last split does not balloon.
C5 texelPerPixel per cascade at its near split edge (texel / pixel footprint at that depth, from H and fov): <= 2 in
   every cascade; cascade-0 texel <= 0.0167 m stays the thin-caster target.
Portal thinCasterRisk (0.34 m café / 0.56 m Terminal) is logged, not on the zero list.
BUILD DECISIONS (cascade agent, 2026-09-25, written before the code; bim-ootb feat/still-shadow-cascade off 3edd28a8):
D1 MEMORY UNIT: three r186 WebGLShadowMap allocates each PCF map as `new WebGLRenderTarget(w, h)` (RGBA8 colour plane) +
   a DepthTexture (UnsignedIntType) = 8 B/texel, the unit §R17 already logs: 4096^2 = 128 MB, 8192^2 = 512 MB. So C3's
   512 MB holds 4 x 4096 (= today's single 8192 map) and never a cascade 0 at 8192 beside m-1 >= 1 others; cascade 0 is
   raised to 8192 only when its 4096 fit misses 0.0167 m AND the total stays <= 512 (i.e. not with m >= 2): logged
   `c0at8192=no(budget)` and the texel is reported as is. Fallback order on a smaller maxTextureSize/budget: 4096 -> 2048
   per cascade, then fewer used cascades; logged, never a throw.
D2 SUN = CASCADE 0 (the nearest); cascade lights 1..m-1 are A.sun's shadow-only siblings (colour 0, intensity 0, same
   position/target = same light basis). Shader identifies each by uniform index (uCsmIdx = its slot in three's
   directional-shadow list, found from WebGLLights' order = castShadow first, scene order), never by list order.
D3 IN-BOX FALLBACK: the fragment takes the first cascade >= its depth cascade whose map box contains its shadow coord
   (4 compares per cascade, no texture) — the 160x90 readback can miss a thin surface, so a tight SDSM box must not leak
   light. Beyond the last cascade's box: lit, as today outside the §STILL_SHADOW_FIT box. Blend = linear over the last
   10% of a split, only when the next cascade also holds the fragment.
D4 DEPTH READBACK: one 160x90 render (the §METER size) with MeshDepthMaterial (RGBADepthPacking) as override; sky, glass
   (transparent, opacity < 0.95), basic/shader/sprite/line/points and sky portals hidden; cleared pixels skipped. zMin =
   min view depth (>= camera near), zMax = min(readback max, the max VIEW depth of the §STILL_SHADOW_EDGE point set:
   building corners + kept props + the slab corners) (C4). The shadow maps are not rendered by this pass.
D5 PER-CASCADE BOX (one function, _cascadeFit(slice, film)): frustum slice rect [C_c - 10% blend, C_c+1] in light space
   ∩ the §STILL_SHADOW_FIT union (building ∪ kept props) ∩ ±env, ∩ (SDSM) the rect of the readback's world points in the
   slice padded by 2 readback-pixel footprints at the slice's far depth; + (R+1) texels; centre snapped to whole texels.
   film=true is the §FILM_PARITY F2 entry (sphere fit per shot), not built now: it returns null and films stay unchanged.
D6 m: fixed per session = 4 unless every gate pose meets C5 + the cascade-0 target with 3 (the per-press line logs the
   cascade-0 texel m=2/3/4 would give from the same readback: `c0texelIf=[m2,m3,m4]`). Unused cascades (m_used < m):
   box degenerate, needsUpdate false (no render), sampler bound to three's empty shadow texture.
D7 C2 LINK TIME: the witness (LINK=1) sums wall ms of compileShader + linkProgram + getProgramParameter(LINK_STATUS) +
   getShaderParameter over one Hospital default press with Chrome's program cache and the NVIDIA disk cache off,
   &shadowcascade=0 vs on.
D8 NEVER COARSER THAN THE SINGLE MAP (first after-arm run, 2026-09-25): at 4 x 4096 the Hospital default exterior (nearest
   visible surface 179 m away, ground across the whole 593 m-wide slice) gave cascade texels [0.108, 0.143, 0.140, 0.135] m
   against the single 8192 map's 0.085 m — every visible surface coarser. Rule: the cascades are used only when every used
   cascade's texel <= the single map's texel at its §SHADOW_SIZE_BY_ENVELOPE size (same 512 MB); otherwise the still keeps
   the single map (sun map back to that size, the §STILL_SHADOW_EDGE fit re-applied), uCsm off, the cascade lights stay in
   the scene unrendered (program unchanged, C1), logged `mode=single(reason)` with the cascade numbers it declined.
   m = 4: m = 3 does not meet more poses (aerial cascade-0 texel 0.0328 vs 0.0207 at m = 4; café both meet).
RESULT (2026-09-25, bim-ootb feat/still-shadow-cascade 6edfdf22 sw v1360; integrated feat/still-shadow-cascade-int = e61c116b +
   this, sw v1380 — same numbers; witness_still_shadow_lines.js, one press per pose, GUARD 0/0/0). BEFORE (3edd28a8, one map):
   texel default 0.0851 / aerial 0.0741 / café 0.0124 / Terminal 0.0158. AFTER cascade texels [c0..c3]: default = single
   0.0862 (D8: cascades [0.108,0.144,0.140,0.135] declined, nearest surface 179 m, a pixel there 0.24 m); aerial
   [0.0207,0.0371,0.0481,0.0606] (FAIL c0 > 0.0167, tpp <= 0.43); café [0.0037,0.0044,0.0058,0.0058] PASS (tpp 1.01 max);
   Terminal hall [0.0004,0.0038,0.0020,0.0066] PASS. gap45 <= 0.0086, gap20 <= 0.0236 everywhere; memMB 512 (Terminal was
   128 with its single 4096 map); dirShadows 4 on every press (C1: new program keys on presses 2/3 = 1 / 4, the base's
   own numbers); C2 press wall time with Chrome + NVIDIA caches off, Hospital default: 55.8 s vs 55.6 s &shadowcascade=0.
   UNMET: cascade-0 <= 0.0167 m on the two far exterior poses — not reachable at 4 x 4096 under C3 with lambda 0.5.
GATE, from one Alt+S press per pose (witness_still_shadow_lines.js extended; no ray grid): `§STILL_SHADOW_CASCADE m= splits=
[m] texel=[m per cascade] normalBias=[..] thinCasterRisk=[..] memMB= ms=` + the per-cascade §STILL_SHADOW_EDGE numbers,
Hospital default exterior / aerial / café + Terminal hall_floor; FAIL if cascade-0 texel > 0.0167 m or any gap45/20 >= 0.05 m;
GUARD 0/0/0. red1 judges the look on its port.

**red1's rulings this lane (don't re-litigate):** only real sources light surfaces; no light through walls/floors (only
glass/openings); no exposure/brightness knob, no lamp-count caps, no per-building values; bounce is paramount; mid-film
lamps OFF only for the freeze, discipline reveal, or full-ARC-hidden (§INTERIOR_LIGHTS_BOUNDARY today is far wider — narrow
it inside this lane); Hospital interiors must keep the character of his baseline still (held by the watchdog, not you).
**Working rules:** spec before code; one sw bump per served change; 8600 only from a clean committed tree; one PR at lane
end + prove live; § evidence only; never hand red1 a git/permission decision.

## ▶▶▶▶▶▶ §RESUME 2026-09-25 — START HERE (dev session hand-off; written by the watchdog red1-4b)
Supersedes the EVENING block below (history + evidence). Roles: you are the DEV session; the watchdog is `red1-4b`
(SendMessage) — send it recaps, it gates every spec/merge by reading pushed code + full § logs. LOOK sign-off is red1's.
**red1 (2026-09-25): no proof stills/sheets for him — he tests live on localhost:8600 himself, for speed.** Keep § log witnesses.

**LIVE on main (verified by the watchdog: ancestor of origin/main + live marker):** #1765 still-exit (v1295), #1766
§STILL_SHADOW_FIT (v1298), #1767 §FRAME_REUSE_SANITY 247cb9ae (live sw v1303, `_ruleFilmLive` in live files).

**HELD branches (do NOT merge until §SOURCED_LIGHT is gated):**
- bim-ootb `feat/film-parity` @eb3a41c1 (sw v1310, worktree /tmp/wt-parity, pushed). Fleet smoke 7/7 PASS. Carries: film
  bounce (viewer/gi_film.js + §GI_FILM_BLANK_GRAB), every `!A._maxqActive` gate per-frame, §NIGHT_BAKE_POOL_REATTACH (films
  had 0 lamps in scene on main — real defect), §SKY_PORTAL_INSIDE (portal spots 0.3 m inside glass; the white discs were
  spots 5 cm outside lighting their own pane), per-shot film shadow box, §LAMP_CAP_FADE/CHURN, §LAMP_CAP_NEAREST OFF by
  default (list order kept = approved Terminal hall), §131 Sanity quiet dials, `--film-fill restore|alts` (default restore —
  WILL FLIP under §SOURCED_LIGHT principle 1: no sourceless fill). Open item: film ground reads warmer/darker than Alt+S at
  the same pose/sun (cause not found; all 85 ground uniforms equal).
- bim-ootb `feat/still-res` @c8a624d8, /tmp/wt-stillres, pushed, parked: &stillres=window|1080p|1440p|4k,
  default window. 1440p PASS (Hospital p1 2776x1440, bounce 86 s); 4k FAIL (bounce cap 3998x2074, one-line fix). Cost
  table (same pose at window/1440p/4k) still owed before any default change.

**NEXT, in order:**
1. **§SOURCED_LIGHT — spec WRITTEN (983309ad4, below the #1764 line); (a)-(e) ADDED 2026-09-25 (dev session, "GATE
   ADDITIONS" block under the spec) — awaiting red1-4b's gate. WATCHDOG GATE (red1-4b, 2026-09-25): OPEN once
   these five are added to the spec (spec edit, then build):**
   (a) OPENINGS: room-binding must not block light through real openings. Merge rooms joined by an opening with no
   door/glazing, and multi-storey voids/atria, into one LIGHT ZONE (the texture stores zone id); treat doors as closed.
   Otherwise the Hospital atrium floor loses the upper levels' lamps. Say which data gives the adjacency (room_graph /
   IfcOpeningElement / voids).
   (b) FAR WINDOWS: portals are capped (≤32, within 40 m of the camera). With hemi zeroed indoors, every glazed room
   beyond that goes dark, including the interiors seen through glass in ref5 (red1's "see-through lit-up inside" look).
   Add an analytic per-zone DAYLIGHT term (sky through that zone's own glazing: glazing area/orientation → a per-zone
   sky factor in a texture channel, like the cove), so it's sourced from its windows with no light objects added.
   Portals stay as the near, shadowed detail.
   (c) SKYLIGHTS/roof glazing: state whether portals cover them; if not, (b) must.
   (d) SUN THROUGH GLASS: verify glazing does not cast sun shadow (castShadow on glass would block the sun indoors). Log it.
   (e) red1 tests LIVE on 8600 himself: drop the ref sheet. Keep the § witnesses (coverage, crossWall=0, ms/frame) and
   expose the cove + daylight intensities as dials for his live testing, with the defaults logged.
   Original text of the ask follows (red1 confirmed the principle): red1 CONFIRMED the principle (2026-09-25):**
   "The paramount idea is bounce. If it is all washed, we cannot enjoy good bounce. With disparate sources, we can see
   them." / "light cannot leak through walls in real life except through glass." / "It is a surface matter, not a knob
   bumped up by the number of lights."
   (1) Only real sources light surfaces: sky/sun only through glazing + openings (portals); lamps at fixtures. Indoors no
   flat ambient and no hemi reaching deep interiors; outdoors unchanged. Films the same (fill default flips off restore).
   (2) No light through walls/floors — only through glass/openings: lamps ROOM-BOUND (each lamp lights only its own room,
   rooms/roomAt data; no per-lamp shadow maps); unshadowed portals bound to the room behind their pane too. Spec the
   mechanism (light layers / per-room material masks / clipping) + per-frame cost; rooms with no rooms data.
   (3) Rooms with no windows and no fixtures: a modern base light — soft cove along the ceiling edges, real sources per room.
   (4) Bounce carries the rest; state what screen-space bounce cannot carry.
   (5) NO exposure/brightness knob (exposure stays 0.383). The stillexp tone-down sheet and §LAMP_LUX_CAP are CANCELLED.
   Witness: per-surface-sample § lines naming which sources reach it; 0 lamps reaching across a wall.
2. **Mid-film lamps-off rule (red1):** lamps off ONLY for the load-path freeze, the discipline reveal, or when the full ARC
   is hidden. Logs show far wider: Hospital §INTERIOR_LIGHTS_BOUNDARY off 0.353→0.959, Terminal 0.1609→0.9056 (src
   plan.beats.rise). Fact-find which beats that window covers and which code sets it (§116 / §129.41 /
   §CPE_TAIL_LIGHTS_ALL_ONLY); narrow it to red1's three cases inside §SOURCED_LIGHT.
3. Then: parity PR (after the fill flip + §SOURCED_LIGHT), §STILL_RES cost table, the skyline-footprint union fix for the
   #1766 exterior side effect (HHS outside app mean 91.5→98.4; target back to 2fe6360a values).

**Facts established this session (don't re-derive):** Clinic/HHS washout was NOT a code regression (v1295 vs v1299 identical
§ lines, bounce on) — the approved v1290 dials were only ever tuned on Hospital/Terminal; Alt+S lamps = 16 / reach 25 m /
decay 1.5, lamp cap 132; floorShareBySource probe is invalid (ACES not additive) — never quote it.
**Working rules:** spec before code; serve on 8600; one PR at the end with auto-merge, then `git merge-base --is-ancestor`
+ live sw + § marker; short GPU runs; § log evidence only; never hand red1 a git/permission decision.

## ▶▶▶▶▶ §RESUME 2026-09-24 EVENING — START HERE: §FILM_PARITY (Alt+S look -> Alt+C films, verbatim)
Supersedes every block below (they are history + evidence). Written by the watcher (red1-fe) at session close.

**red1's objective:** "the Alt+S to Alt+C ad verbatim is the objective." The approved Alt+S look must come out of Alt+C
films unchanged. red1 has given the watcher standing authority on technical picks; LOOK sign-off on films stays his.

**⚠ OPEN DEFECT, FIRST (watcher, 2026-09-24 ~19:25, v1294 = live):** after an Alt+S still red1 "has to refresh the
viewer as it is stuck to continue". The viewer doesn't come back after the still (his still
~/Downloads/bounce_still_1790247910581.png, Hospital atrium stair, &ghost=1 URL). Suspects, all new today: §STILL_LOCK
not releasing (APP._stillLockOn left true, main.js cancel paths returning early), §STILL_GHOST_OWNERSHIP restore / the held
§SHELL_GHOST_AUTO build running on Esc, or the bounce overlay not closing. Get the log tail after Esc (§STILL_LOCK off,
§STILL_GHOST_OWNERSHIP restored, §PHOTO_STAGING off, any error), reproduce on his URL, fix, witness "Esc -> nav works
(camera moves, §FPS_MODE orbit=1)". Hotfix PR, prove live. Also that still shows the far floor/room washed near-white again
at an interior aerial pose: re-check against the §FLOOR_WASH pick (lamps 16 / 25 m).

**§STILL_EXIT_NAV — SPEC (2026-09-24 late, fix/still-exit-stuck), CAUSE REPRODUCED:** witness_still_exit_nav.js on red1's
URL (OCI Hospital + &ghost=1, v1294 = main f4109331): clicking the overlay's **"Close (Esc)" BUTTON** removes the picture
only; §STILL_LOCK stays on, staging stays on, the still stays active, so every click/drag after is swallowed — camera did
not move, no §FPS_MODE line (VERDICT=STUCK). The Esc KEY path works (lock off, ghost restored, drag moved the camera,
§FPS_MODE orbit=1). Fix: ONE exit routine in effects.js (`A.stillExit(reason)`: remove overlay, lock off, tear the still
down) used by the Esc key, the Close button and gi_still.js's own Esc listener (which also leaked one keydown listener per
still). Log `§STILL_EXIT via=esc|close`. Witness: both arms NAV_OK (lock off, camMoved, orbit=1), 0 page errors.
Floor wash at interior aerial (his still) is NOT this defect — checked separately against the §FLOOR_WASH pick.

**RAISED by red1 (19:3x): the JAGGED SHADOW fix goes WITH §STILL_CULL, before §FILM_PARITY.** Evidence already on file
(this doc, the shadow-edge diff): nav looks smooth only because its sun is fixed at 63° high; Alt+S uses the real sun, and at a
grazing angle the 0.088 m texel stretches to ~0.5 m steps; PCF radius 1. Do it as ONE shadow-camera change with §STILL_CULL,
since both fit the sun's frustum to the camera's view + its sun-ward shadow volume. (1) View-fitted sun frustum for the still
(tighter texel where the camera looks, stable across the 16 refine frames); (2) second arm, a PCF radius 2-3 if steps remain;
(3) the shadow map rendered once per still. Witness: texel + ground footprint logged before/after at pose_p1 and the Hospital
parapet pose; the Terminal roof-through-sky stays fixed; one side-by-side sheet for red1's eye (look at every frame first).

**§STILL_SHADOW_FIT + §STILL_CULL — SPEC (2026-09-24 late, one shadow-camera change, branch feat/still-shadow-fit off
origin/main). Alt+S only (`!A._maxqActive`); films and nav unchanged (films get it under §FILM_PARITY).**
Facts from source (r186 + effects.js on main 2fe6360a): the sun shadow camera is orthographic, aimed at the building bbox
centre, square ±env (Hospital env 362 → 0.088 m texel at 8192); near/far along the sun ray already span sunDist×0.05..×4,
so depth never clips a caster. r186 PCFShadowMap samples a Vogel disk scaled by `shadow.radius` (a uniform, default 1).
`renderer.shadowMap.autoUpdate` is already false on this path; the map re-renders only when something sets needsUpdate
(enable chunks, reassert flips). Staging pauses DLOD for the whole still (§DLOD_STILL_OWNERSHIP): every one of Hospital's
instances is drawn, and cast into the 8192 map, for every refine frame and the bounce.
1. **FIT (the jagged-edge fix).** At staging, after the ±env box is set, shrink the box's left/right/top/bottom to the
   light-space footprint of what the camera sees: the 8 corners of the view frustum, far clipped at the farthest corner of
   the ±env world box, projected into the sun camera's space; box = that footprint ∩ ±env, + a 2 m margin. Depth stays.
   Why this keeps every caster: a caster that shades a visible point lies on the sun ray through that point, and an
   ortho camera keeps the whole ray inside its x/y footprint, whatever its distance (behind the camera, off screen).
   normalBias follows the new texel (2×texel, unchanged rule). Frozen for the still: computed once at staging.
   Log `§STILL_SHADOW_FIT env= box=WxH m (was 2env) texelX= texelY= (was t) gain=× sunElev=`.
   Arm 2 (only if steps remain on the sheet): `&shadowradius=` / APP._stillShadowRadius, default 1 = unchanged.
2. **ONCE.** Count real sun shadow-map renders per still (WebGLShadowMap.render entered with needsUpdate); target 1 after
   the casters are flagged. Log `§STILL_SHADOW_RENDERS n= refineMs=` at still done. If >1, find who sets needsUpdate.
3. **CULL (red1: "the non-DLOD flag may cost heavy").** After staging is complete (after sky portals, whose side rays
   must see the full model), zero-scale InstancedMesh instances outside ALL of: the view frustum, the fitted sun box
   (full depth), and, when shadowed portal spots exist, a 2×PORTAL_RANGE (80 m) sphere round the camera (a portal is
   within 40 m of the camera and shades up to 40 m from itself). BatchedMesh is left alone (three culls it per camera,
   the shadow camera included). Separate flag per instance (`_stillHid`), all restored at teardown BEFORE the DLOD
   re-enable. Skipped on mobile and below DLOD's 5,000-element floor. Log `§STILL_CULL kept= culled= of= (view= sun=
   portal=) ms=` and `§STILL_CULL restored=`.
**Witness** (Hospital local DB, real GPU, full-count gate 63,182 else VACUOUS; short runs, red1 shares the GPU):
pose_p1 aerial [-62,38,-4]→[-16,-2,-4] and a parapet close-up (p1 dollied to 40%), sun 10°/228° (the grazing case), arms
main vs branch: box, texel, culled count, shadow renders, refine ms; Terminal hall pose from witness_dlod_still_ownership.js:
roof must still block the sky (no sun shafts). Atrium (watcher's ask, red1's 19:25 still): same pose, log §LIGHT_STACK at
the floor point, report whether lamps 16 / 25 m stack there; no retune without the watcher. One side-by-side sheet, every
frame looked at before sending.

**§STILL_SHADOW_FIT — RESULT (2026-09-24 late, bim-ootb feat/still-shadow-fit, witness_still_shadow_fit.js, real GPU,
full-count gate, 0 page errors).** §STILL_EXIT_NAV SHIPPED first: PR #1765 squash 2fe6360a, ancestor of origin/main, LIVE sw
v1295 (live gi_still.js carries stillExit(via), effects.js "STILL_EXIT via=").
- First fit (view frustum ∩ ±env) gained only 1.0-1.2x: aerial views see the horizon, so the box stayed ~724 m. Second fit
  also intersects the BUILDING's light-space footprint (its ground shadow projects inside it): Hospital sun 10°/228°:
  p1 box 184x77 m, texel 0.088 -> 0.022 m (3.94x); parapet 175x58 (4.15x); atrium 167x44 (4.35x); Terminal hall sun 40°
  81x51, 0.089 -> 0.020 (4.49x). normalBias follows (0.177 -> 0.045 m). Given up by design: skyline-prop shadows outside
  the footprint (0 dropped at every tested pose).
- SAFETY: sun rays from 780-1200 visible points per pose hit a caster in FIT exactly when in BASE (mismatch 0, 5 poses);
  no point the building shades falls outside the fitted box (lost 0). Terminal hall: roof still blocks the sky.
- Look vs geometry (ray images, not pixel stats): at the 10° sun the plants' long courtyard shadows and the roof-deck
  sawtooth are REAL (ray image shows both); AFTER draws them, BEFORE blurred them away. PCF-radius arm not needed
  (dial `&shadowradius=` exists, default 1).
- ONCE: §STILL_SHADOW_RENDERS n=1 per still in BOTH arms — main already renders the sun map once (autoUpdate off).
- §STILL_CULL built and REMOVED: 0 culled of 25,040 (Hospital) / 35,510 (Terminal) instances at all 5 poses — the sun box
  must hold the building wherever the view sees it, and portals keep 80 m. Refine ms base vs fit within noise
  (6.4/5.8/4.5 s vs 5.1/5.6/4.7 s). red1's "non-DLOD cost" is not reducible this way; recorded, not chased.
- Atrium (red1's 19:25 still, nearest pose by eye cam [-11.15,2.92,4.08] tgt [0.75,-13.08,-7.82]): §LIGHT_STACK at floor
  (-2.9,-8.2,-4.2): lampsLit 132, 40 over 5% of peak, sum/strongest 6.4 — lamps 16/25 m DO stack there. The APP frame
  is not washed white; this witness does not run the bounce, which his still includes. No retune.
- One base frame came back blank (sky only) in one run and did not repeat on re-shoot; unexplained, recorded.
- Sheet: ~/Downloads/still_shadow_fit_sheet.png (looked at, every frame).

**§STILL_RES — SPEC (2026-09-24 late, red1: "The Alt-S, can we bump up its resolution?"; order by watchdog red1-4b:
after #1766, before §FILM_PARITY; branch feat/still-res off fresh origin/main).**
Facts (main 2fe6360a): the app still is the displayed canvas (drawing buffer = window CSS px × pixelRatio, pixelRatio =
min(devicePixelRatio, 2), scene.js:113). gi_still.js shoot() sizes the bounce from window.innerWidth/innerHeight (cap
2560x1440) then scales down to MAX_PIXELS 1600×900 (line 59), and reads the app frame from the displayed canvas
(grabAppFrame). red1's saved stills are all 1666×864 = his window. SSGI radius is a world/view-space value (the log turns
it into px as radius×(w/2)/16), so the pixel search already scales with width; confirm in the witness, don't rescale.
1. **Size option** `&stillres=` / APP._stillRes: `window` | `1080p` | `1440p` | `4k` (height 1080/1440/2160; width = height ×
   the window's aspect, even). **Default `1440p`** (red1 asked for more; 4k is opt-in until its cost is measured). Never
   below the window: target = max(window drawing buffer, preset).
2. **App side**: at still start (before staging, so TAA/AO/composer allocate once) set renderer + composer pixelRatio =
   targetH / innerHeight (the canvas keeps its CSS size; the browser shows it downscaled). Restore the nav pixelRatio at
   teardown (all exit paths — they all funnel through _teardownStillRefine). SSAO/TAA pass sizes follow setSize.
3. **Bounce side**: size = the app drawing buffer; MAX_PIXELS raised to 3840×2160 (the renderer is rebuilt when the size
   changes — already the rule). Saved PNG = that size.
4. **Log** `§STILL_RES target=WxH preset= pixelRatio=a->b appMs=<refine ms> bounceMs= estGpuMB=` (estimate = sum of
   render-target bytes the size change allocates; the 8192 sun map, 512 MB, is not size-dependent). No change to the
   sun map or the fitted box; re-check shadow edges at 4k on the sheet.
**Witness** (short GPU runs): Hospital pose_p1 + Terminal hall, presets window / 1440p / 4k: saved PNG dimensions ==
target; refine + bounce ms and estGpuMB per preset; pixelRatio back to nav after Esc; one sheet: each hi-res still
downscaled next to the window still at the same pose (must look the same, only sharper), every frame looked at.

**§STILL_SHADOW_FIT SHIPPED: #1766 squash 21ffe710, ancestor of origin/main, LIVE sw v1298** (live effects.js carries
STILL_SHADOW_FIT / RENDERS / RADIUS, no STILL_CULL; fleet 7/7 PASS; 6/6 frames non-blank).
**§STILL_RES — PARKED at feat/still-res c8a624d8 (/tmp/wt-stillres), watchdog: default stays `window` until costed.**
witness_still_res.js, Hospital p1: window 1666x864 PASS (bounce 119.5 s = first build); 1440p 2776x1440 PASS (refine 7.4 s,
bounce 85.8 s — renderer rebuilt for the new size, est 244 MB, readback 61 MB/buffer); 4k 4165x2160 FAIL: bounce capped
at 3998x2074 by MAX_PIXELS 3840x2160 (9.0 MP at red1's aspect) — cap by area of the preset, one line. pixelRatio back to
1.000 after Esc in all arms. Open: cost per preset on a SECOND press (renderer kept), sheet.
**§STILL_WASH_REGRESSION — INVESTIGATED (red1 via watchdog: "indoor too bright by this session"): no code regression.**
v1295 tree (:8601) vs v1299 (:8600), Alt+S + bounce, default sun 45°: Hospital 3 interior poses composite 153.86/153.98,
95.18/95.78, 130.02/131.93; Clinic corridor 110.85/110.87; HHS interior 107.51/107.51; all §STILL_BASE/§LIGHT_STACK/
§SKY_PORTAL lines identical. red1's 19:40-19:54 stills (OK) are all Hospital; 20:14+ are Clinic (green roof, barrel vault)
and HHS (brick L-block) — a change of building, not of code. HHS interior floor shares (fresh render, TAA off): sky 35.5,
portals 31.2, lamps 0.7. Found in passing: EXTERIOR poses looking away from HHS are brighter with the fit (app 91.5->98.4,
93.1->96.1): far ground outside the fitted box loses shadow — witness arm to add. Lesson: a probe render on a frozen still
re-shows the TAA buffer; set _taaPass.accumulate=false for any one-source-off measurement.

**§FILM_PARITY — SPEC v1 (2026-09-24 late, red1-78; gate: watchdog red1-4b). Alt+S look -> Alt+C films, verbatim.
Branch feat/film-parity off fresh origin/main (21ffe710 or later). Line refs = origin/main 21ffe710.**
**ONE DECISION FOR red1 BEFORE BUILD (the only conflict found):** films stage §FILM_FILL_RESTORE (effects.js:2932/4178,
red1 on the HHS+Hospital A/B: "restored is better"): ambient 0.785, hemi 1.257. The approved Alt+S look (§STILL_BASE, sky 2 x
0.617 / base 0) is hemi 1.234, ambient 0. The sky term is the same (1.257 vs 1.234); the ONLY difference is the flat ambient,
0.785 in films vs 0 in Alt+S. "Verbatim" means films drop to ambient 0, which reverses his earlier film ruling. Default
proposal: verbatim (ambient 0, hemi 1.234) behind `--film-fill restore` for his A/B; the 5 s clips show both.
**1. Bounce in the film (today: sandbox/spike_ssgi_webgpu/gi_bake_tap2.js via `cli_silent_bake.js --tap`, dev only).**
Promote it to viewer/gi_film.js (loaded like gi_still.js, same r186 one-THREE rule), installing cinema_maxq.js's existing
`window.__giCaptureFrame` hook (cinema_maxq.js:1665) when the option is on. Option: CPE panel checkbox "Bounce", ON by
default, stored on the path (like bakeRes, cinema_path_editor.js:753); the copy-bake-command line (cinema_path_editor.js
:3955) carries `--bounce 0|1`; cli_silent_bake.js maps it to the page flag. No WebGPU / not r186 / touch -> §GI_FILM_OFF
reason= and the film bakes without it. Bounce renderer: lighting off (§GI_PRESS_COST), built once per film, §GI_SCENE_BORROWED
holds the app frame across its awaits. Log per frame §GI_FILM f= ms= compositeMean= appMean=.
**2. Every Alt+S-only gate made film-capable (`!A._maxqActive` sites), evaluated per frame over the MOVING sun:**
- §STILL_DIALS lamps 16 / reach 25 m / decay 1.5 + §LIGHT_UNIFORM_BUDGET + §STILL_LIGHT_PAD (effects.js ~4040): set once at
  film start; constant light count for every frame (a count change recompiles ~110 materials, 40-108 s).
- §LAMP_SHAPE_COLOUR: once at film start (fixture shapes don't change).
- §STILL_GLOW (~4091): the daylight test per frame (films pass through dusk); glow/lamp emissive written as a UNIFORM only.
  DROP its `mat.needsUpdate = true` (watchdog note: it forces a recompile; emissiveIntensity is a uniform).
  Lamps-off-when-outside per frame from the camera's inside test; lamps as intensity 0, never removed.
- §STILL_BASE (~4124): per the decision above.
- §SKY_PORTAL (~4176): chosen within 40 m of the camera at stage() — in a film, a FIXED set of light objects (same count,
  same pads, same shadowed count) re-aimed/re-weighted per frame from the camera's current nearest panes; portal shadow
  maps render at most once per frame (autoUpdate off, needsUpdate only on re-aim).
- §GLASS_FRESNEL (~4177): once at film start (glazing clones are camera-independent).
- §STILL_SHADOW_FIT: per frame (camera and sun both move): refit left/right/top/bottom + normalBias each frame, no
  reallocation; plus the skyline-footprint union fix (open) before it ships to films.
- §SKY_OCCLUSION stays opt-in (rejected as a default). §ALBEDO_SRGB stays off.
**3. §131 §RULE_FILM_QUIET folded in** (bim-compiler MEP_CLASH_REVEAL_MOVIE.md §131: floor 0, pause 8 s, peak 0.6, opacity
0.14; dials), so the bounce reads under a quieter Sanity overlay.
**v2 — watchdog gaps closed (source facts, origin/main 21ffe710):**
(G1) FILL PIN. _bakeFillPin (effects.js:2780) re-writes ambient/hemi from A._photoFillBase and _nightPLScale from
  _plTopoutWant(_nightPLScaleStaged) every frame. (a) Lamps-off does NOT go through _nightPLScale: tools.js:2152/2187
  multiply each lamp by `A._stillLampsOff ? 0 : _nightPLScale`, so the per-frame §STILL_GLOW sets the FLAG and the pin
  cannot write it back. The one site that also zeroes _nightPLScale for Alt+S (effects.js ~5737) is skipped under parity;
  the pin logs `lampsOff=` per frame. (b) Topout: plScale eases 0.5 -> PL_TOPOUT_TARGET 1.0 (effects.js:2773) after
  topout, x the lamp multiplier 16 = double the lamp output at dusk. Kept as intended (red1's §PL_TOPOUT_UNPIN "the
  internal will be livelier"); logged per frame as `plScale= x lampMul=16 = effLamp=`; red1 sees it in the dusk end of the
  clip. (c) Under parity §STILL_BASE runs for films and §FILM_FILL_RESTORE is skipped (unless --film-fill restore); both
  sit before the _photoFillBase snapshot (effects.js:4191), so the pin holds the Alt+S values.
(G2) STABLE FIT. Per SHOT (a cut or path segment), not per frame: the box size = the union of the fitted boxes over the
  shot's frames (computed from the plan's camera path before recording) quantised up to 8 m; per frame only the centre
  moves, snapped to whole texels in light space. The sun moves too, so the light basis turns; the snap uses the current
  basis. Log per frame `§STILL_SHADOW_FIT shot= box=WxH texel= snapped=`. Witness: texel change inside a shot = 0.
(G3) PORTALS. Pane collection + the 5-ray inside/outside test are camera-independent: run ONCE at film start for every
  pane, cached. Per frame: filter by distance, re-rank, re-aim the fixed light set (same count/pads/shadowed count). Log
  `§SKY_PORTAL_FRAME ms= reaimed= shadowRerender=`.
(G4) BOUNCE COST. The film tap renders ONE bounce pass per frame (gi_bake_tap2.js:175 pipeline.render, no
  accumulation); the still's 8 passes are Alt+S only. The 116 s on a Hospital still is the renderer's FIRST BUILD, paid
  once per film, not per frame (second press 1.5-2.3 s). Measured so far: HHS 1080p 0.95 s/frame vs 0.78 without
  (+22%). Terminal and Hospital are NOT measured: the 5 s clips log ms/frame and the witness prints a projected
  full-film time (frames x ms + first build) for both BEFORE any full bake. If Hospital projects past ~8 h it is said up front.
(G5) SCOPE. The bounce hooks cinema_maxq's _captureFrame (cinema_maxq.js:1599/1665), which is the recorder loop
  (:4550) for the in-window Alt+C AND the CLI bake. So both get it wherever WebGPU + r186 exist (desktop Chrome); the
  in-window path is proved by its own log in one short in-window run, not assumed.
Proof adds one Hospital INTERIOR control/parity pair (the brightness question was all interiors).

**4. Proof before ANY full film (red1 judges the look):** 1080p24 5 s CONTROL clip (today's film) + 5 s PARITY clip, same
building and frames, identical except the parity switch. Building: Terminal (ref4/ref5 are Terminal); frames named in the
witness before baking, chosen from the plan where the camera faces the facade (ref5 pose is not logged: nearest by eye,
said so). Per-frame § lines show each feature applied (§GI_FILM, §STILL_GLOW per frame, §SKY_PORTAL re-aim, light count
constant, §STILL_SHADOW_FIT per frame). One parity frame next to ref5 at the nearest pose; every frame looked at. A freeze
clip too if the change can touch the load-path hold. Sanity clips per §131 (a building where a lone structural set
returns more than twice). Never send red1 a film before its clip check.

**§FILM_PARITY BUILD (2026-09-24 night, gate OPEN by watchdog; bim-ootb feat/film-parity /tmp/wt-parity, NOT pushed):**
- 0ccfe322 sw v1302: A._filmParity (staging; --film-parity 0 = control), --film-fill restore, --bounce 0; Alt+S gates open to
  films; A._filmParityStep per frame (daylight glow, lamps-outside flag, shadow fit quantised 8 m + texel-snapped centre,
  portal re-aim from a once-classified pane cache); film bounce = gi_still.js GiFilm (the still's own build/dials, one pass
  per frame, hooks cinema_maxq __giCaptureFrame); §131 dials; Bounce checkbox + bake command; fit adds skyline props only
  when the camera is outside (the union blew an HHS interior box to 334 m).
- **DEFECT ON MAIN, found + fixed on the branch: films bake with NO interior lamps.** Light dump at the captured frame (HHS,
  parity on AND off): bake pool 200, lit 113, IN SCENE 0. A bake-prep staging toggles night mode off (removes A._nightLights
  = the pool from the scene), the pool object survives, the create branch is skipped, never re-added. Fix
  §NIGHT_BAKE_POOL_REATTACH (tools.js). After it, film vs Alt+S at the same pose/sun: 149/149 point lights, lamp sum
  1753.6/1753.6, exposure 0.383 both; app mean 218 vs 213. Pool also capped to §LIGHT_UNIFORM_BUDGET under parity and given
  the Alt+S reach/decay (was infinite / 1).
- Bounce cost (HHS 720p): first build 8.0-8.5 s once per film, then 53-61 ms/frame. Portal cache 843-989 ms once.
- Witness seams: cinema_maxq __maxqPreCaptureTap(i) (dev tap, like __maxqPoseTap); scratchpad film/lightdump.js.
- Terminal clip frames chosen from a 2 fps scan of Terminal_silent (85.5 s film): facade face-on = film 0.75..0.8085 (5 s).

**§FILM_PARITY clips + findings (2026-09-25 early, watchdog red1-4b gated each step):**
- Terminal clips delivered to red1 via the watchdog: ~/Downloads/parity_Terminal_{1_control_main,2_parity_altsfill,
  3_parity_restorefill}.mp4 + _sheet (Terminal_silent film 0.75..0.8085, 1080p24). Pool 132/132 in scene.
- Cost split (1080p Terminal, frame-hash deltas): control 0.93 s; parity no lamps 1.05; +132 lamps 1.80; +bounce 1.93.
  First frame 111 s with lamps (shader compile, once) vs 14 s. Terminal full film ~66 min vs ~32.
- Facade shadow in parity = §STILL_GLOW daylight glow off (control keeps 7 glow mats emissive by day).
- Film vs Alt+S differences explained: skyline towers differ (films seed Math.random); my first "ground shadow gap" was
  a harness error (sun moved after staging). OPEN: film ground reads warmer/darker than Alt+S (ground only; building,
  lights, bounce dials match; 85 ground uniforms, 40 defines, textures, composer chain, camera + projection identical;
  seed, encode, bounce, in-material tone mapping all excluded).
- §FRAME_REUSE_SANITY (watchdog item, main defect): a Sanity wave live inside a load-path hold freezes on reused frames
  (reuse key has no film time; Sanity draws inside _captureFrame). Must land before any full film with load path +
  Measure. Plan: no reuse while the last composite had a live Sanity box/wave.
- Harness lessons: set the sun BEFORE staging an Alt+S comparison still; probe renders need TAA accumulate off.

**§FILM_PARITY — state 2026-09-25 (feat/film-parity @b8def6de, sw v1309, pushed, NO PR; 8600 serves it):**
- §GI_FILM_BLANK_GRAB: Hospital parity clips had 5-10/120 blank frames (app canvas empty at grab); guard re-renders +
  re-grabs; re-bakes 0/120 blank (recovered 10/3). Every clip now blank-counted over all frames.
- §LAMP_CAP_NEAREST + §LAMP_CAP_FADE: the uniform cap kept the first 132 in LIST order (Alt+S too) — now nearest, with a
  6 m fade at the boundary; §LAMP_CAP_CHURN: no in-clip 0<->full step (only frame 0 / a prep reselection).
- §FILM_FIT_PER_SHOT: box fixed per plan.beats shot from plan poses + shot sun; 0 size changes in a shot (was 16/120).
  Film texel 0.06-0.07 m vs Alt+S ~0.02 m, by design.
- §SKY_PORTAL_INSIDE: portal spots were 5 cm OUTSIDE their pane (lighting it: white discs by day, red1's 17:38 "lamps lit
  from outside" puzzle); now 0.3 m inside, hotspots=0; changes Alt+S too.
- Clips for red1 (~/Downloads/parity_*): Terminal facade trio, Hospital interior trio (lamps off by §116), Terminal refs
  before/after (hall: nearest lamps brighter, 81.5->93.0; facade: no lamp change, skyline differs). Lit lamps are seen
  from inside only in early build-up in the current Hospital/Terminal films (interiors fall in the §116 off window).
- Open: film ground warmer/darker than Alt+S (cause not found); fill ruling (red1); hall lamp change (red1); separate
  branch fix/frame-reuse-sanity @eac0b2c6 (W-FRAME-REUSE PART F) to land before any full film with load path + Measure.

**§FILM_PARITY — READY, HELD (2026-09-25): feat/film-parity @eb3a41c1, sw v1310, pushed, fleet smoke 7/7 PASS, local CI
checks pass. Watchdog decisions for red1: film fill default RESTORE (--film-fill alts = ambient 0); §LAMP_CAP_NEAREST OFF
(list order = approved look; &lampcap=nearest); Clinic/HHS no per-building tuning; §LAMP_LUX_CAP dead; stillexp sheet
cancelled. PR HELD by red1: "establish the principles of lighting first" — surfaces lit by their real sources (daylight
through windows, fixtures, and for rooms with neither a modern base light, ceiling-cove style). The restore fill is a
sourceless fill and may flip once the principle is agreed (effects.js _filmFillRestore, one line). Checks: portal-inside
fix costs the hall +0.5 composite; list-order churn: no in-clip 0<->full lamp step.**

## §ALTC_FOUNDATION — PRIOR ART first (watchdog red1-c6, 2026-09-25; red1: "research the industry's best practice first, or else we become prior art")
Problem (red1's hypothesis): Alt+S stages its light for ONE camera pose; a film moves the camera, the sun and the visible
geometry every frame, so per-pose picks pop, recompile or flicker. Known answers, each cited, mapped to our case:
1. FILM FRAME = A MINI-STILL (offline). Unreal Movie Render Queue renders cinematics OFFLINE: 8 spatial x 8 temporal
   sub-samples per frame and 32+ warm-up frames so the temporal GI history settles ("Lumen needs >32 frames to stabilise
   bounce"); flicker in dark areas is a known Lumen/MRQ issue. Our Alt+C is also offline (cli_silent_bake), and a film
   bounce pass is 53-61 ms (HHS 720p, §FILM_PARITY BUILD), so several bounce passes per frame + warm-up at each cut are
   affordable. The film does ONE pass today. (dev.epicgames.com MRQ docs + "Warmup and First Frame Issues" tutorial.)
2. MANY LIGHTS WITHOUT A CAP OR RECOMPILES: clustered forward shading (Olsson, Billeter, Assarsson, HPG 2012): lights are
   DATA in a 3D cluster grid; each fragment loops only its cluster's list; the program never changes with the light
   count. three.js ships it as ClusteredLighting, but it's WebGPURenderer only, point lights only, no shadows (threejs.org
   docs). Our main renderer is WebGL, so we take the principle, not the addon: our light-zone grid already IS a spatial
   light binding (zone -> its lamps/portals), which replaces the per-camera "nearest 40 m portals" and the lamp cap order.
3. SHADOWS THAT DON'T SHIMMER: stable cascaded shadow maps (Valient, ShaderX6, 2008): fixed projection size per
   cascade (sphere-fit) + light-space snapping to whole texels; splits per PSSM (Zhang 2006). Our §FILM_FIT_PER_SHOT
   already fixes the size per shot + snaps; add the cascades (shared with the Alt+S aerial fix).
4. BOUNCE THAT DOESN'T DEPEND ON THE SCREEN: world-space irradiance probes, DDGI (Majercik et al., JCGT 2019): a probe
   grid updated incrementally, camera-independent, sees off-screen light; screen-space bounce can't see what left the
   frame, which is a flicker source in a moving shot. three.js side: three-rc (radiance cascades, three-mesh-bvh), a probe
   volume proposal on discourse; nothing in core. Our zones give a natural probe layout (probes per zone, no leaks
   across walls: DDGI's own leak fix is visibility per probe).
5. EXPOSURE: engines adapt over time in f-stops/second (Unreal auto exposure, 64-bin histogram); for us red1 forbids
   exposure knobs, so a film keeps 0.383 fixed, or the still's meter frozen per shot; never per-frame metering.
Watchdog read: red1's hypothesis is right, and the industry answer is "bind light to the WORLD (clusters/zones, probes,
stable cascades), render each film frame like a still (sub-samples + warm-up)". What looks new here: deriving the light
binding from BIM room/zone geometry; not claimed as new until checked further.
**Full spec: prompts/ALTC_FOUNDATION.md** (Fable agent, watchdog-checked 2026-09-25: inventory of 35 Alt+S steps with
file:line, verdict = hypothesis CONFIRMED, foundation F0-F8 + order). Watchdog spot-checked: the §SOURCED_LIGHT stage/prepare,
§STILL_SHADOW_EDGE and shadow-radius gates are Alt+S only (no _filmParity path); lamp calib + portal exposure key on
SourcedLight.installed(), true from page load (scene.js:46), so it must be checked with one clip's §SOURCED_LIGHT_CALIB line (F0).

## §SOURCED_LIGHT — SPEC ONLY (2026-09-25; red1 confirmed the principle, watchdog red1-4b gates; NO code yet)
red1: "The paramount idea is bounce. If it is all washed, we cannot enjoy good bounce. With disparate sources, we can see
them." — "light cannot leak through walls in real life except through glass." Refs are on bim-ootb feat/film-parity
@eb3a41c1 (sw v1310).
**Principles (red1):** (1) only real sources light a surface; indoors no flat ambient, no hemi sky deep inside — the sky
enters through glazing/openings (portals); outdoors unchanged; films then drop --film-fill restore as default (parity =
sourced, as Alt+S). (2) no light through walls/floors — lamps and portals are ROOM-BOUND; no per-lamp shadow maps.
(3) rooms with no window and no fixture get a modern base light: a soft ceiling-edge cove, per room, as a source.
(4) bounce carries the rest. (5) no exposure/brightness knob — exposure stays 0.383.
**Source facts (line refs):** ambient scene.js:197 (0.386), hemi scene.js:207 (0xb0c4de / 0x8b7355, 0.617); Alt+S
§STILL_BASE effects.js:4186 (base 0 → ambient 0, sky 2.0 → hemi 1.234 everywhere, inside and out); films
§FILM_FILL_RESTORE effects.js:3947 (ambient 0.785 / hemi 1.257); lamps = PointLights, intensity tools.js:2186 (bake pool)
/ :2232 (Alt+S), reach 25 m decay 1.5, no shadows; portals = SpotLights sky_portal.js:135/:202 (8 shadowed, 11 not);
camera room test effects.js:3894 (_stillCamInside: RoomWalker.buildCameraRoomIndex, up-ray fallback); rooms compile
navigate_find.js:937 (A.ensureRooms). Room data per building (DB): Hospital 0 IfcSpace (rooms compiled at runtime; its
camera index held 2 rects), Terminal 53, JKR 79, LTU 369, HHS 14 (0 IfcLightFixture — lamps from room fallback),
Clinic 798 (elements_meta), Duplex 21. Coverage is therefore the first thing to MEASURE, not assume.
**Mechanism — room id per fragment (one shader patch, installed once at load like §SKY_OCCLUSION's):**
- A ROOM VOLUME TEXTURE per building, built at staging from the room polygons + storey heights: 3D texture (R16 room id,
  0 = outside / unknown) over the envelope at 0.5 m cells (Hospital ~1.3 M cells at 1 m = 2.6 MB; 0.5 m = 8x — pick by
  measured coverage vs memory, log it). Fragment room = texel at world pos + 0.2 m along the surface normal (a wall face
  reads the room it faces; a floor reads the room above it).
- Each lamp / portal spot carries a room id uniform (lamp: room at its position; portal: the room on its inward side).
  The patched lights loop (lights_fragment_begin, point + spot loops) skips light i when lightRoom[i] != fragRoom and both
  are known (!= 0). Unknown either side = unbound (lights as today) and COUNTED.
- Hemi/ambient: fragRoom != 0 → hemi and ambient contribution 0 (indoors lit only by lamps, portals, sun through glass,
  cove, bounce); fragRoom == 0 → unchanged (outdoors, and anything the rooms don't cover).
- Cost: one 3D-texture fetch per lit fragment + one compare per light iteration; one recompile at install (not per
  still/frame — ids are uniforms). Light count unchanged. Witness logs ms/frame before/after on Hospital.
**Rooms with no rooms data:** lamps/portals unbound, hemi as today, logged per building (`§SOURCED_LIGHT_COVERAGE
rooms= lampsBound=/lamps portalsBound=/portals floorAreaCovered=%`). A building below a stated coverage (e.g. <60% of
lamps bound) is reported, not silently half-sourced.
**Cove (principle 3):** per room with 0 portals and 0 lamps: an analytic ceiling-edge term in the same patch — irradiance
from a line source along the room's ceiling perimeter (room polygon edges at ceiling height), falloff by distance, one
per-room intensity uniform (texture channel), so no light objects are added. Intensity: one constant to be set against a
cited typical ambient-cove output, or red1 picks from a sheet; not tuned per building.
**Bounce (principle 4):** the Alt+S/film bounce is SCREEN-SPACE SSGI: it spreads light only from surfaces visible in the
frame. A source off-screen (a lamp behind the camera lighting a wall in view) still lights directly; its second bounce
from off-screen surfaces is not carried. State this on the sheet.
**Mid-film lights-off rule (red1: off ONLY for the freeze, the discipline reveal, or when the full ARC is hidden).**
Facts: today's window is cinema_maxq.js:3804-3850 (§116 → §129.41 → §129.47): off from plan.beats.out (last stick) to
plan.beats.rise (orbit start). Hospital: out 0.3530, pullout/topout 0.3607, rise 0.9590 (60.6% of the film); Terminal:
out 0.1609, topout 0.179, rise 0.9056 (74.5%). Inside it: the pull-out (out→pullout, <2%), the load-path freeze hold
(armed at topout), the discipline-reveal round (ghost slots hide ARC+STR; tail-one slots show one discipline — already
lamps-off via §CPE_TAIL_LIGHTS_ALL_ONLY / _cpeRevealLightsOff), and the storey reveal (ends at rise; ARC shown storey by
storey, i.e. NOT fully hidden). DEFECT vs red1's rule: the pull-out span, the reveal slots where ARC is visible, and the
whole storey reveal are dark. NARROWING (per frame, replaces the beats window): lightsOff = loadPath hold active
(_lpHoldCtl.inHold) OR _cpeRevealLightsOff OR ARC hidden (A.hiddenDiscs has 'ARC'). Witness: per-frame reason counts
over the Hospital/Terminal films; lamps on in the storey reveal.
**Refs predicted (they WILL change; red1 judges one sheet):** ref4 Terminal hall + ref3 Hospital stair (interior): walls
away from lamps/windows darker (hemi 1.234 gone indoors), lamp pools and window light read as distinct sources, bounce
visible in shade; rooms behind walls no longer lit by the neighbour's lamps. ref1 courtyard / ref2 aerial / ref5 facade
(exterior): unchanged outside; interiors seen through glass darker except where lamps/portals are (the see-through look
should hold where rooms are lit). Clinic 20:22 / HHS 20:43 interiors (the washout): expected clearly less washed.
**Witness:** per surface sample (screen grid) `§SOURCED_LIGHT_SAMPLE room= lampsReaching= crossWall=0 portals= hemi=0|1
cove=0|1`, with lamps reaching across a wall = 0 on every sample (a lamp whose room != the sample's room contributes 0);
coverage lines per building; ms/frame; the ref sheet (ref1-5 + Clinic/HHS interiors) before/after, every frame looked at.

**§SOURCED_LIGHT — GATE ADDITIONS (a)-(e) (2026-09-25, dev session; answers red1-4b's gate; sources read on
feat/film-parity @eb3a41c1 + the fleet DBs in /tmp/wt-parity/buildings; still NO code).**
Correction to the spec above: rooms are AXIS-ALIGNED RECTS, not polygons — spatial_structure IfcSpace rows carry
center_x/y/z + size_x/y/z (viewer/lib/room_walker.js:5); a room may be N rects sharing room_guid (§MULTI-RECT,
common/room_graph.js). The volume texture rasterises rects; the cove runs along each rect's outer edges.
**(a) OPENINGS → LIGHT ZONES.** The texture stores a ZONE id, not a room id; lamps, portals and the daylight term bind to
zones. What the data has (measured): no IfcRelVoids / IfcRelFills table in any fleet DB; no room-adjacency table.
IfcOpeningElement rows: Hospital 735, JKR 425, LTU 3368, Duplex 50; Terminal / HHS / Clinic 0. Room-to-room edges come
from common/room_graph.js buildGraph: E1 = a door touching 2 rooms, E2 = door onto circulation, E3 = stair/ramp flight
across storeys, E5/E8 = corridor junctions (no door). Zone merge rules, a union-find over rooms, built once per load:
  1. E1/E2 door edges: NOT merged (doors treated closed).
  2. E5/E8 corridor junctions (doorGuid null, open by construction): merged.
  3. Unfilled openings: an IfcOpeningElement whose bbox holds no IfcDoor / IfcWindow centre (geometric fill test —
     there is no fills relation to read), touching 2 rooms by the same point-to-rect distance rule room_graph uses for
     doors: merged. Buildings with 0 opening rows get no such merges (logged, not guessed).
  4. Voids / atria, vertical: for each room rect, cast a grid of up-rays (1 m) from 0.2 m under its ceiling to the room
     rect above; if ≥25% of the rays reach that rect with no slab / floor hit, the two rooms are one zone. E3 stairs
     alone do NOT merge (a stair core has its own walls; the up-ray test catches an open stairwell anyway).
  5. Cells with no room (zone 0) stay "outside/unknown": lights unbound there, hemi unchanged.
Witness: `§LIGHT_ZONE rooms= zones= merged: corridor= opening= void= (openings tested= unfilled=) largestZone=m2` per
building, plus on Hospital: the atrium floor sample names ≥1 lamp from an upper storey (lampsReaching lists storey).
**(b) FAR WINDOWS → per-zone DAYLIGHT term (analytic, no light objects).** Portals stay: ≤32 spots, within PORTAL_RANGE
40 m, 8 shadowed (sky_portal.js:8, :82-83). Everything else gets the zone term. At staging, reuse collectPanes (ALL
glazing panes, not the ≤32) + the §SKY_PORTAL_SIDE inward test (films already classify every pane once —
§SKY_PORTAL_FILM_CACHE); each pane's zone = texel at pane centre + 0.3 m inward. Per zone: the BRE average daylight
factor form DF = T·Ag·θ / (A·(1−R²)) (Littlefair, BRE Digest 309/310; T glass transmittance from the pane opacity,
Ag glazing m2, θ visible sky angle from the up/out side rays already cast, A total zone surface ≈ from rects, R 0.5
area-weighted mean reflectance as a stated constant). Stored in a texture channel (like the cove). Not flat across the
zone: a second channel holds each cell's distance to its zone's nearest glazed cell (BFS inside the zone at staging),
shader term = hemi colour × DF × f(d), f(d) = 1/(1+(d/D)²), D = the zone's mean window head height above floor
(logged). This is the "see-through lit-up inside" look for glazed rooms past 40 m. BatchedMesh glazing is not read by
collectPanes (batchedGlassSkipped, logged) — counted per building in §SOURCED_LIGHT_COVERAGE, not silently lost.
**(c) SKYLIGHTS / roof glass: portals do NOT cover them** — collectPanes drops every triangle with |normal.y| > 0.7
(sky_portal.js:56). The daylight term (b) takes them: a roof pane counts into its zone's Ag with θ = its sky view
(the up-ray), and its zone is the texel 0.3 m BELOW it. Log `skylightM2=` per building.
**(d) SUN THROUGH GLASS — defect found in source, to be proven by log.** tools.js:996 and effects.js:2996
(_reassertPhotoShadowCoverage) set castShadow=true on EVERY visible mesh, glass included; three's shadow pass has no
transparency test, so glass casts a solid sun shadow. Only §SURFACE_R10 split window panes are exempt (depth-pass discard
on aPane=1, streaming.js:1009 _r10DepthMat; §SURFACE_R10_SHADOW paneCasters). Unsplit glazing — IfcPlate (Terminal
33,324 rows), IfcCurtainWall panels, R10 fallback windows — still blocks the sun indoors. Witness first:
`§SUN_GLASS_CASTERS meshes= instances= glassM2= byClass={} r10Exempt=` (glassy material = the collectPanes test,
castShadow true, no discard depth material). Fix (built with §SOURCED_LIGHT): glass material groups discard in the
depth pass (the same _r10DepthMat idea, keyed on the glassy material group rather than aPane), mullions/frames still
cast. After: glassM2 casting = 0, and a Terminal hall sample shows sun reaching the floor through the facade.
**(e) Live testing, dials, no sheet.** The ref sheet is DROPPED (red1 tests live on 127.0.0.1:8600). Kept: every §
witness above (coverage, crossWall=0, zone merges, glass casters, ms/frame before/after). Dials, URL + APP field, read
at staging, defaults logged once per still: `&cove=` / A._stillCove, `&daylight=` / A._stillDaylight (both 0..3,
default 1 = the stated constant), `&sourced=0` / A._sourcedLight=false turns the whole patch off (today's look, for
his A/B). Log `§SOURCED_LIGHT_DIALS cove= daylight= sourced= (defaults cove=1 daylight=1 sourced=1)`.

**§SOURCED_LIGHT — BUILD LOG + SPEC CHANGE (2026-09-25, dev session, branch bim-ootb feat/sourced-light off
feat/film-parity @eb3a41c1).**
- BEFORE stack (witness_sourced_stack.js @0845900e, local DBs, full-count gate, sun 45/228, stand-in poses, blocker = first
  wall/slab/roof/ceiling/door hit): share of the lamp sum at the floor point, clear / through wall / through slab —
  café atrium_high 31.5/23.7/44.8 (sum 21.4), rail_L1 12.7/59.1/28.2, atrium_ground 0/0/100 (sum 1.2), Clinic corr_x
  46/53/1 (sum 21.6). 54-87% leaked. Units: sun 4.4 at 45° = 3.11 horizontal; clear own-room lamps alone 6.7 (café) /
  9.9 (Clinic) = 2.2-3.2x the sunlit ground; real 320-500 lx office vs 22.6k-70.7k lx horizontal sun at 45°
  (Wikipedia "Lux", after Schlyter; CIBSE LG10-1999 DF 2%/5%) = 0.0045-0.022 → lamps 100-700x too strong.
  Watchdog RULING (A): physical calibration + metered exposure indoors (cited partial-adaptation law), 0.383 outside.
- COVERAGE (witness_sourced_coverage.js, after A.ensureRooms): Hospital 2 rects / 9 m2, Clinic 264 / 2262 m2, Terminal
  57 / 716 m2, HHS 88 / 2214 m2, JKR 34 / 250 m2 (rects in a different frame from the fixtures: x≈271405), LTU 405 /
  5653 m2, Duplex 5 / 316 m2; fixtures inside a room rect (roomAt) = 0 of 2275 on every building (the floor join has
  no anchors except LTU). **Room rects cannot carry the light zones.**
- **SPEC CHANGE (replaces the room-rect texture + union-find of (a)): LIGHT ZONES FROM THE GEOMETRY.** Voxelise the
  building at staging (cached per building, not per still): grid over the building bbox + 1 cell, 0.5 m cells (log
  cells/MB/ms; Hospital ~90x110x40 m ≈ 3.2 M cells). SOLID = cells touched by triangles of the room-boundary classes
  IfcWall/IfcWallStandardCase, IfcSlab, IfcRoof, IfcCovering, IfcDoor (closed), IfcWindow, IfcCurtainWall, IfcPlate
  (conservative: triangles sampled at ≤ cell/2). Flood fill the empty cells, 6-connected: the component touching the
  grid edge = OUTSIDE (zone 0, unbound, hemi unchanged); every other component = one light zone. This gives (a) with
  no room data: a doorless opening, an atrium or a stairwell is connected empty space, so it is one zone; a door or
  glass is solid. A gap in the model (a wall short of the slab) joins zones (errs toward today's look), counted.
  Lamp zone = first empty cell at/below the lamp within 1 m; portal zone = the cell 0.3 m inward of its pane; fragment
  zone = texel at world pos + 0.2 m along the normal. Daylight (b)/(c) and the cove bind to the same zones. Witness:
  `§LIGHT_ZONE cells= solid= zones= outsideCells= largestZoneM3= lampsBound=/ portalsBound=/ ms=` per building, and
  the café floor sample names lamps from the upper storeys around the atrium as own-zone.

**§SOURCED_DAYLIGHT — BUILD SPEC for gate items (b)+(c) (2026-09-25, dev session; watchdog: "the café reads as MISSING
PHYSICS" — 92% portal-lit at 1.3% of outdoor, and sky_portal.js drops |n.y|>0.7 so the atrium roof glazing gives nothing).**
- Per zone z: DF_z = T * Ag_z * theta_z / (A_z * (1 - R^2)) in percent (BRE average daylight factor; Littlefair, BRE Digest
  309/310; CIBSE LG10: DF < 2% "not adequately lit", > 5% "well lit").
  T = the pane's transmittance, 1 - material opacity (glass drawn at opacity 0.3 -> 0.7); stated, per pane.
  Ag_z = glazing m2 of every pane whose inward cell (centre + 0.3 m inward; skylights: 0.3 m BELOW) is in zone z — ALL panes
  (collectPanes), including |n.y| > 0.7 roof glazing, EXCEPT panes that carry a placed portal spot this still (no double
  count: the portal already delivers that pane's sky light, shadowed, near the camera).
  theta_z (deg, per pane, area-weighted): vertical pane = 90 x (sky fraction of its 5 outward side rays, §SKY_PORTAL_SIDE);
  roof pane = 180 x (sky fraction of its up rays). BRE's definition: angle of visible sky from the window centre.
  A_z = total zone surface = boundary faces between zone cells and solid cells x CELL^2 (from the voxel grid).
  R = 0.5, BRE's typical area-weighted reflectance for a light-coloured room (stated constant, logged).
- Indoor daylight irradiance at a cell = DF_z/100 x E_skyH x f(d)/mean_z(f), E_skyH = the hemi's up-facing irradiance
  (the sky, not the sun: DF is an overcast-sky ratio); f(d) = 1/(1+(d/D_z)^2), d = BFS distance through zone cells to
  the nearest glazed cell, D_z = area-weighted pane-centre height above the zone floor (logged). Normalised by the
  zone mean so the zone average stays exactly DF (BRE's is an average).
- Storage: the zone texture becomes RG16UI (R = zone, G = daylight fraction x 10000); the fragment reads both in the one
  per-fragment lookup (§SOURCED_LIGHT_LINK zone-once); shader adds  G/10000 x skyColour x hemiIntensity  to the indirect
  irradiance of zone fragments. No new sampler (texture-unit budget unchanged). Rebuilt per still (portals are per still).
- Log `§SOURCED_DAYLIGHT zones= glazedZones= panes= (skylights= portaled=) T= R= DFmedian= DFmax= topZones=[id:DF%:Ag:A]
  ms=`; witness: §WASH_SOURCES gains a `daylight` source; the café/atrium zone's DF and the re-measured medians.

**§SOURCED_DAYLIGHT v2 — SPEC UPDATE (2026-09-25, dev red1-5a; after §ZONE_OPEN_SKY b4cb61c1 + cascades 0a9950a3; base
feat/sourced-light-int 0a9950a3). Replaces the v1 block above where they differ. Alt+S only first (`!A._maxqActive`).**
What changed underneath: zones are now COVERED space (open-to-sky column scan); glass/IfcWindow/IfcPlate/IfcCurtainWall are
SOLID; covered cells that see sky through real openings carry SKY_BIT and already get the full hemi (slSkyKeep = 1). So the
daylight term is only for covered, non-sky-lit cells (_slSky = 0), and a zone's sky reaches it through two kinds of hole:
1. GLAZING (as v1): every pane from collectPanes INCLUDING |n.y| > 0.7 roof glass (a flag, the portal path still skips roof).
   Pane zone: LightZones.surfaceInfo at pane centre +/- 0.3 m; the inward side = the side whose cell is a covered zone
   (both covered / both open / solid = skipped, counted). T = 1 - opacity (per pane, logged). theta: vertical = 90 x sky
   fraction of the 5 outward §SKY_PORTAL_SIDE rays; roof = 180 x sky fraction of the up rays (BRE: rooflight 180,
   unobstructed vertical window 90).
2. OPEN APERTURES (new): the zone's aperture faces to open-sky cells (zoneInfo[z].upM2 / sideM2, per-cell bits in
   cache.aperture), T = 1; theta = 180 (up) / 90 x the sky fraction of the same 5 rays from <= 64 sampled side-face
   centres per zone (logged).
EXCLUDED: panes carrying a placed portal this still — EXCEPT a portal with §SKY_PORTAL_BLOCKED blockedFrac >= 0.5 (its
light does not reach the room; the café #6 at 0.80), whose pane counts in the DF instead (logged `portaledKept=`).
DF_z = sum(T.A.theta) / (A_z (1 - R^2)) % (BRE average daylight factor, Littlefair BRE Digest 309/310), R = 0.5 stated,
A_z = zoneInfo[z].surfaceM2. Per cell: DF_z/100 x f(d)/mean_z(f), f(d) = 1/(1+(d/D_z)^2), d = BFS distance through zone
cells to the nearest aperture/pane cell, D_z = area-weighted source-centre height above the zone floor below it.
STORAGE: the zone texture becomes RG16UI (R = zone | SKY_BIT as now, G = round(daylight fraction x 10000), cap 65535);
the fragment reads .g from the SAME texel slFragZone already picked (one lookup, no new sampler, no per-light code). G is
rebuilt per still (portal exclusion is per still; the rest cached per building), re-uploaded (Hospital 2 x 20.7 MB, logged ms).
SHADER: for a zone fragment with _slSky = 0: irradiance += (G/10000) x uSLSky.rgb, uSLSky = hemi sky colour x intensity x
the daylight dial (&daylight= / A._stillDaylight, 0..3, default 1, logged in §SOURCED_LIGHT_DIALS). Nothing else changes.
LOG per press: `§SOURCED_DAYLIGHT zones= litZones= panes= (roof= portaled= portaledKept= skipped=) apertures(up/side m2)=
T= R= DFmedian= DFmax= bandsLG10(<2%/2-5%/>5% zones)= topZones=[id:DF%:srcM2:surfaceM2] buildMs= uploadMs=`.
GATE (one press + the wash witness): the log line on Hospital café / Clinic corridor / Terminal hall_floor; §WASH_SOURCES gains
a `daylight` source (G/10000 x hemi-up, analytic) and reports tone-mapped median/p95/wash + the sky-cool vs lamp-warm share of
indoor irradiance (watchdog: carry colour). Target (zero list): café median 0.55-0.70; Clinic/Terminal wash <= Hospital's;
GUARD 0/0/0; link time within +10% (probe_link_time.js). No per-building values, no hand tuning (R and the dial default are
the only constants, both stated).
WATCHDOG GATE (red1-c6, 2026-09-25): OPEN with 3 changes, overriding the text above:
G1 TARGET: "café median 0.55-0.70" is NOT a FAIL criterion (it came from the old-lighting reference; red1 now holds the
   darker v1337 atrium as realistic; forcing a band = hand tuning). Gate on physics sanity instead: per-zone DF in BRE ranges
   (LG10 bands logged); a roof-glazed atrium/café zone should land >= 2%; any zone > 10%, or a glazed zone at 0%, is
   FAIL-to-explain; plus Clinic/Terminal wash <= Hospital's, GUARD 0/0/0, link <= +10%. Report the café median next to the
   old 0.636 as information only. red1 judges the look.
G2 DIRECTION: log `§SOURCED_DAYLIGHT_DIR` = area-weighted mean source direction per zone. Dev decision: LOG ONLY in this
   build (a directional weight max(0,N.dir)k + (1-k) needs a k with no cited value = hand tuning); the RGBA16UI octahedral
   direction is a follow-up item once a sourced k exists.
G3 BLOCKED PORTAL: when a blocked portal's pane counts in the DF (portaledKept), its portal light is dropped (intensity 0,
   pad kept so the light count does not change) and logged `droppedBlockedPortals=`.
BUILD DECISIONS (agent on feat/sourced-daylight, 2026-09-25; written before the code, deviations from the text above marked D):
D1 THETA RAYS ON THE ZONE GRID: the 5 §SKY_PORTAL_SIDE directions (up, out, out+up, out+/-along) are marched through the
   §LIGHT_ZONE voxel grid (step CELL/4, from 0.5 m off the pane / aperture face, 60 m = the portal's rc.far; a SOLID cell =
   blocked, leaving the grid or reaching 60 m = sky), not raycast against the scene. Why: every pane incl. roof glass is
   classified (hundreds per building) and item 5 of the lane asks for "the zone texture, no scene raycasts"; cached per
   building. Known difference: non-boundary objects (columns, furniture, site props) do not block; the 0.5 m cells fatten
   thin walls (err toward blocked). Logged: panes with theta 0.
D2 PANE SIDES: surfaceInfo(c + s*0.3*n, s*n) for s = +/-1. covered|open (zone 0 or off grid) -> the covered side is inward.
   covered|covered where exactly ONE side is sky-lit (SKY_BIT: a window under an eave / canopy) -> the non-sky-lit side is
   inward (the eave's cells see sky; skipping them would drop every window under an overhang); other covered|covered, both
   open, or a SOLID lookup = skipped. Counted separately (sidesOpen=, sidesEave=, skipped=).
D3 PANE = the §SKY_PORTAL_SOURCES 6 m tile (the portal's own unit, so a placed portal maps to exactly one DF pane by its
   plane+tile key); T = the tile's glass-area-weighted (1 - opacity).
D4 f(d) mean over ALL the zone's cells (the zone average of the sourced term stays DF); G is written only to covered,
   non-sky-lit cells. D_z source height = source centre y - the top of the first SOLID cell below the source's zone cell,
   floored at CELL/2 (the grid cannot resolve a floor closer than half a cell). Weights: source m2.
D5 A source with T*A*theta = 0 (theta 0) is not a BFS source. Side-aperture theta per zone = 90 x the mean sky fraction of
   <= 64 side faces sampled at a fixed stride over the zone's aperture cells (deterministic).
D6 DFmedian / DFmax / bands over the LIT zones (DF > 0); zones= counts all. Per press also `§SOURCED_DAYLIGHT_CAM` (the
   camera zone: DF, source m2 by kind vertGlass/roofGlass/apUp/apSide, surfaceM2, D_z, band) and `over10=` / `glazedZero=`
   lists (FAIL-to-explain, G1). Films (A._maxqActive): SourcedLight.stage does not run, so there is NO film path (G = 0).
D7 A_z = surfaceM2 + apertureM2 (after run 1 on 746662af). BRE's A is the total area of the room's surfaces INCLUDING
   its windows; glass is SOLID so panes are already in surfaceM2, open apertures (faces to open-sky cells) were not (a zone
   with open sides divided its aperture light by its solid surface only: Terminal hall 10.12%). over10 logged split into
   all-sky-lit zones (G never written there) and receiving zones with their glazing ratio (vert+roof glass m2 / A_z).
FINDING run 1 (8618 = 0a9950a3 AND 8621): `§METER camera=inside VACUOUS no lit surface pixels — exposure unchanged 0.383`
   on every indoor pose (café, Clinic corridor, Terminal hall/hall_floor) — the meter reads nothing on the base tree, so the
   tone-mapped medians are unmetered in both arms (café 0.008 before). Pre-existing, not in this lane: reported, not fixed.
   Hospital carries NO roof glazing: up-facing glassy area = 15.3 m2 IfcPlate + 28.3 m2 in BatchedMesh (pane top edges),
   0 tiles >= 0.5 m2 (probe_roofglass.js) — the "atrium roof glass" premise does not hold for this model; café = zone 1.

**§SKY_FRACTION — SPEC (2026-09-25, dev red1-5a; watchdog item B from red1's 8619 look). Alt+S only (`!A._maxqActive`).**
DEFECT (red1, v1337 AND e61c116b): Terminal canteen cam [-20.06,-16.13,-1.00] walls split light/dark along a stair-stepped
boundary with square notches; waiting hall cam [0.45,-12.80,11.90] a stair-stepped white wash patch. CAUSE (source):
light_zones.js marks a covered cell sky-lit by ONE bit (SKY_BIT = any of the 24 lattice sweeps reaches open sky, then a
6-neighbour dilation) and the shader takes the NEAREST cell: full hemi/IBL or none, so the 0.5 m grid is drawn on walls.
FIX, cited:
1. Per cell a continuous SKY-VIEW FRACTION instead of the bit: the cosine-weighted share of the lattice directions (the 24
   + straight up) whose sweep reaches open sky — the sky view factor (Oke, "Canyon geometry and the nocturnal urban heat
   island", J. Climatology 1981; the same quantity as ambient-occlusion visibility, Zhukov, Iones, Kronin, EGWR 1998),
   weight per direction = cos(angle from zenith) = 1/sqrt(1 + dx^2 + dz^2), normalised. Open-to-sky cells = 1. No
   dilation (it was the bit's patch). Computed per building in the same sweep (per-direction counts), cached.
2. ONE field for all sky light: BRE's daylight factor is exactly this ratio (indoor / unobstructed horizontal sky
   illuminance) and its sky component is the view factor, so the cell value F = max(skyView, DF_cell) (DF_cell from
   §SOURCED_DAYLIGHT). Stored in the existing G channel (RG16UI, F x 10000): no texture growth, no new sampler.
3. FILTERED like an irradiance volume (Greger, Shirley, Hubbard, Greenberg, "The Irradiance Volume", IEEE CG&A 1998:
   trilinear interpolation between grid samples): once per fragment, 8 texelFetch around (world pos + 0.5 cell along the
   eye-facing normal), weights = trilinear x (cell not SOLID and in the fragment's zone or open) renormalised — so no sky
   leaks through a wall; all 8 rejected -> the picked cell's F. The §SOURCED_LIGHT_LINK rule holds: one filtered read per
   fragment, no per-light code.
4. SHADER: zone fragments' sky terms (hemi, ambient, IBL irradiance + radiance: today slSkyKeep = 1 or indoorSky) are
   scaled by F_filtered; the separate §SOURCED_DAYLIGHT add (G x uSLSky) is removed (F carries it, now through the hemi's
   own normal dependence). Outside fragments (zone 0 / off grid) keep 1. &daylight dial scales the DF part as today.
COUNT (FAILs on red1's two poses before, target 0 after; numbers only): zone-debug mode w=6 writes F_filtered; one float
readback per pose; SKY_STEP = screen-adjacent pixel pairs on the same surface (view depth within 1%, normals within 5 deg)
with |dF| > 0.25, reported as count and metres of edge (pixel footprint); plus the grid-only raw count (face-adjacent
same-zone cells with |dF| > 0.5). Poses: Terminal canteen + waiting hall (red1's PNG poses), Hospital café, Clinic corridor.
Regressions: zone_glare, shadow_lines, wash (metered), link <= +10%, GUARD 0/0/0.

**§SKY_VIEW_FIELD — SPEC (2026-09-25, dev red1-5a; watchdog red1-c6 OPEN option (a)). SUPERSEDES the §SOURCED_DAYLIGHT
v2 per-cell DF (ADF) and §SKY_FRACTION's max(skyView, DF): ONE camera-independent sky-view field. Alt+S only for now;
the field is camera-free by design (ALTC_FOUNDATION F1/F4 can reuse it).**
WHY: 522b3eac FAILED (watchdog): ADF is a room formula (Littlefair, BRE Digest 310, sidelit rooms); on open-sided zones and
small glass boxes it gave DFmedian 14-33% over lit zones and DFmax 125.6% (> 100% is impossible), and the meter hid it
(exposure 2-3.5x down). The BRE SKY COMPONENT per cell is bounded by definition and needs no room-validity test.
1. FIELD F(c) per covered cell (open-to-sky cells = 1): F = sum_d w_d v_d(c) / sum_d w_d over a direction set d, with
   v_d(c) = 1 at an open-to-sky cell, v_d(next) through an empty cell, T_pane x v_d(next) through a GLASS cell (glass
   rasterised into its own per-cell bit at build; T_pane = 1 - opacity of its glazing material), 0 at any other solid.
   Computed by one dynamic sweep per direction (top layer first, like today's skySweep), cached per building.
2. DIRECTIONS (condition 1): down to <= 10 deg elevation (the 24-lattice has none below 19.5 deg, so deep rooms behind side
   windows fell off too fast). Lattice dy = +1 with |dx|,|dz| up to 6 (min elevation ~6.7 deg diagonal, 9.5 deg axial),
   subsampled as the cost allows; log `dirs= minElevDeg=`. Cost cap: first press per building <= +3 s on Hospital
   (§STILL_STAGE_MS).
3. SKY MODEL (condition 2): the CIE standard overcast sky (CIE S 011/E:2003, sky type 1; the sky the daylight factor is
   defined under): luminance L(gamma) proportional to (1 + 2 sin gamma), gamma = elevation; weight w_d = cos(zenith angle)
   x (1 + 2 sin gamma) x the direction's solid angle. The hemi's GROUND term is scaled by the same F (an opening admits the
   ground view as it admits the sky view, to first order); the externally reflected component (BRE ERC) is NOT modelled
   beyond that and is logged as such.
4. STORAGE + SHADER: G channel (RG16UI, F x 10000), read with the §SKY_FRACTION irradiance-volume trilinear filter once per
   fragment (8 fetches, same-zone/open cells only, renormalised); zone fragments' hemi + ambient + IBL (irradiance and
   radiance) are scaled by F_filtered. SKY_BIT stays for binding/audit only; the separate DF add is removed.
5. PORTALS RETIRED when the field is on (&portals=1 keeps them for A/B): sky through glass is now F; the sun through glass is
   the real sun. Removes the portal stage (3.4-3.8 s) and 8 shadow maps from the texture budget (logged).
6. DIRECTION recorded, not used (condition 3): per zone the F-weighted mean unoccluded direction ("bent normal", Landis,
   "Production-ready global illumination", SIGGRAPH 2002 course) in the stats/log only — the G2 follow-up.
7. GLASS T (condition 4): one number per glazing material, T = 1 - opacity, logged per material; item D (§GLASS_VEIL) must
   make the visible pane transmit the same T.
8. ADF kept ONLY as a logged cross-check per enclosed glazed zone (mean F x 100 vs ADF), not used.
GATE (condition 5): m2-weighted F distribution over all lit zones, enclosed rooms reported separately (median 1-10%,
against the ADF cross-check); max F <= 1 asserted; exposure before/after per pose (> 2x drop FAILs unless explained per
source); SKY_STEP = 0 on red1's Terminal canteen [-20.06,-16.13,-1.00] and waiting hall [0.45,-12.80,11.90] poses;
§GLARE black counts unchanged; link <= +10%; first-press cost in §STILL_STAGE_MS (<= +3 s Hospital); GUARD 0/0/0.
§LUX_CHECK (watchdog red1-c6 after red1 14:35 "too dark ... proper values": cited values, not knobs). Per zone at stage, in
lux on the working plane (0.8 m above the zone floor): E_sky = F_zone(mean over working-plane cells) x the scene's
horizontal sky illuminance (the same E the hemi represents, converted with the §SOURCED_LIGHT_CALIB scale, stated); E_lamps
= the calibrated lamps (CALIB_LAMP_LUX path) at those cells; E_total. Compare with EN 12464-1 maintained illuminance for
the zone's use, mapped from the IFC space Name/LongName where present (watchdog's list: corridor/circulation 100 lx,
atrium/entrance hall 200, office 500, toilets 200, canteen 200 — each row to be QUOTED from a citable source of the
standard's tables; unverifiable rows marked "unverified"), else "unknown". FAIL-to-explain: a zone with E_total < 50% of
its EN value (says whether lamps are under-scaled — a calibration bug — or the sky share is missing). Logged for red1's
poses (atrium stair [-10.95,-2.91,5.42], inner room [9.95,-7.70,0.10], toilet [8.34,-8.65,-3.58]) + café / Clinic corridor
/ Terminal hall. Plus the METER: exposure picked and stops vs the outdoor base on every indoor press (a real camera indoors
sits several stops above outdoors; if ours does not, that is a finding, not a knob). Red1 rule 5 stands: no exposure knob.
BUILD DECISIONS (agent on feat/sourced-daylight from 522b3eac, 2026-09-25; written before the code):
V1 DIRECTIONS: zenith + the 24 lattice dirs (|dx|,|dz| <= 2) + axial and diagonal dirs at max(|dx|,|dz|) = 4 and 6 (16) =
   41 dirs, minElev = atan(1/(6 sqrt 2)) = 6.7 deg (axial 9.5). The outer rings are sparse (cost). WEIGHTS (spec item 3,
   exact on the partition): the plane y = 1 square |x|,|z| <= 6 (the set's footprint) is sampled on a 0.05 grid; each sample
   is assigned to the angularly nearest direction and adds cos(zenith) x (1 + 2 sin(elev)) x dOmega (dOmega = dA / r^3 on the
   plane); w_d = its sum, normalised to sum 1 (elevations below the square's edge are outside the set; logged).
V2 SWEEP: per direction, top layer first, over the covered + glass cells only; v(c) = transmittance of the cells the
   centre-to-centre segment crosses (mids, as skySweep: empty 1, glass T, other solid 0) x v(c + d), a glass cell x its own
   T; a target off the grid's x/z edge or above its top = sky (1). Timed in `§SKY_VIEW_FIELD ... ms=`, cached per building.
V3 GLASS CELL: a boundary cell hit only by triangles of glassy materials (sky_portal's test: transparent, opacity < 0.95, no
   map, not Basic) — any opaque triangle in the cell makes it opaque; T = min over its glassy materials of 1 - opacity. A
   glass cell stays SOLID for zones / open-to-sky (unchanged topology). BatchedMesh: its one material decides.
V4 G = round(F x 10000) in every non-solid cell (open = 10000); solid 0. Uploaded once per building (camera-free).
V5 SHADER: the §SKY_FRACTION filter (8 fetches around wp + 0.5 cell x eye-facing normal, trilinear, cells kept when not SOLID
   and (same zone as the fragment or open), renormalised; none kept -> the picked cell's G). Zone fragments: hemi (sky +
   ground), ambient, IBL irradiance + radiance x F_filtered; outside x 1; unknown (-1) x indoorSky as today. SKY_BIT no
   longer gates light when the field is on. &skyfield=0 = the old binary SKY_BIT path + portals (A/B).
V6 PORTALS retired when the field is on (Alt+S only): budget portalCap 0 / shadowed 0, stage logs `§SKY_PORTAL off
   retired=1`; &portals=1 keeps them. Films untouched (field off when A._maxqActive: no film path).
V7 ADF cross-check: LightZones.daylight without BFS/G (no portal exclusion: portals retired); per ENCLOSED glazed zone
   (apertureM2 0, glazing > 0): mean working-plane F x 100 vs ADF, logged `§SKY_VIEW_ADF_CHECK`.
V8 DISTRIBUTION: per lit zone the mean F over its WORKING-PLANE cells (0.8 m above a floor: the cell floor(0.8/CELL) layers
   above a zone cell with SOLID below, same zone), weighted by the zone's floor m2; p10/p50/p90/max, all lit zones and
   enclosed zones separately; max F over every covered cell asserted <= 1.
V9 LUX: luxPerUnit = CALIB_SUN_LUX / calibSunI (the §SOURCED_LIGHT_CALIB scale: the scene sun = 100,000 lx). E_skyH =
   lum(hemi) x intensity + lum(ambient) x intensity (both are sky fills scaled by F in the shader) x luxPerUnit. E_sky =
   F_wp x E_skyH. E_lamps = the zone-bound point lamps (sourcedZone = z, intensity > 0, camera fill excluded) at <= 64
   working-plane cells (fixed stride), I x lum(colour) x three's getDistanceAttenuation x cos(up), unoccluded (an upper
   bound inside the zone), x luxPerUnit. EN 12464-1 values QUOTED from the CEN enquiry draft prEN 12464-1 (July 2019, will
   supersede EN 12464-1:2011; https://www.valosto.com/tiedostot/prEN%2012464-1.pdf, Em,r column) — the 2021 final text
   is not verified, so every row is tagged `prEN2019`: 6.1.1 Corridors and circulation 100 · 6.1.2 Stairs, escalators 100 ·
   6.2.1 Canteens and break areas 200 · 6.2.4 Cloakroom, washrooms, bathrooms, ... toilet areas 200 · 6.26.2 Writing,
   typing, reading, data processing 500 · 6.28.1 Entrance halls 100 (places of public assembly; education 6.36.16 and
   railway 6.53.7 give 200) · 6.28.3 Lounges 200 · 6.37.1 Waiting rooms (health care) 200 · 6.38.1 Staff office 500 ·
   6.3.1 Plant rooms, switch gear rooms 200. Atrium: no row -> "unverified". Space names: elements_meta IfcSpace +
   element_transforms (A.ifc2three) or spatial_structure; a zone takes the use of most of its mapped spaces; none ->
   "unknown". Hospital has no IfcSpace rows, Terminal's are "Aras NN RN" (unmappable): both "unknown".
V3' (after the Hospital smoke on 901d75a5): "any opaque triangle wins" shrank every window opening by up to one cell per side
   (the fattened wall reveal / frame around a pane): §SKY_VIEW_ADF_CHECK median Fwp/ADF 0.044. Revised: a cell is GLASS when
   its glassy rasteriser samples (uniform barycentric, ~ area) are >= its opaque ones — the cell's majority surface decides.
V5' outside fragments are filtered too (stencil accepts every non-solid cell): the open/covered nearest-cell flip on a surface
   running under a roof edge was a step (out-zone pairs); a solid cell still separates (the stencil reaches half a cell past
   the surface).
V11 SKY_STEP witness: a step pair whose two points (0.25 m off the surface, eye side) straddle a SOLID grid cell (a partition or
   glass line the readback does not draw — glass is hidden) is a physical boundary: reported as acrossSolid, not in SKY_STEP.
   Each debug readback is rendered twice (a program built in the first draw gets its uniforms on the next).
V12 INTERREFLECTED COMPONENT (after the gate run on 5bae708a: §WASH §GLARE black_direct_samples Terminal hall 291/576, hall_floor
   221/573, café 1 — before 0/0/0). Cause (source): F is the sky component only; a ceiling / soffit under an opaque roof sees
   no sky (F = 0) and the portals that lit it are retired, so no source reaches it (the GI still pass is not in the analytic
   witness). BRE's DF is SC + ERC + IRC; the IRC was never modelled. Added, per zone, the uniform interreflected term of the
   flux balance behind the ADF formula itself (Sumpner's integrating-sphere relation; Littlefair, BRE Digest 310, derives
   ADF = T W theta / (A (1 - R^2)) from it): F_ir,z = R x (mean working-plane F_z x floorM2_z) / (A_z (1 - R)), R = 0.5 (the
   same stated constant), A_z = surfaceM2 + apertureM2 (D7). Added to every covered cell of the zone (clamped to F <= 1);
   a zone with no sky has F_ir = 0 (lamps only). Logged: `§SKY_VIEW_FIELD ... irc(zones/median/max)=`. The DIST and ADF
   cross-check report the final F (SC + ERC-by-ground + IRC).
V12 RULING (watchdog via the coordinator, 2026-09-25): IRC OFF BY DEFAULT. The Alt+S still already carries interreflection
   through the GI bounce pass (gi_still.js, 8 passes); V12 on top counts ceilings twice, and a uniform per-zone add is the
   flat fill red1 rejected ("bounce is paramount"). V12 was motivated by the ANALYTIC witness, which runs no GI. &irc=1 /
   APP._stillIrc = true keeps it for A/B (logged `irc=ON`). The witness gains a GI-aware check (§GI_AWARE, wash witness):
   numeric readback of the finished composite + the app frame gi_still.js keeps (__giStillDebugCanvas) at each sample pixel:
   blackFinal (direct samples pure black at 8-bit, max channel <= 1), indoor GI share (composite - app)/composite, and the
   analytic IRC share of the sample's irradiance (0 unless &irc=1).
V13 ARCHITECTURE (red1 via the coordinator: Alt+S is the source of truth, Alt+C inherits): the field is BUILD (LightZones.field,
   per building, camera-free, cached; the zone cache key has no film time: note for the 4D build-up item F5) + DECIDE (one
   filtered texel read per fragment in slFragZone; skyField is its CPU mirror). SourcedLight.fieldOn() carries no film gate;
   the only gate is the existing staging call site (effects.js: SourcedLight.stage runs for !A._maxqActive). Film path: not
   called yet; when it is, F needs no smoothing (static per building) — exposure hold per shot is the film's own continuity.
V10 SKY_STEP witness targets: the camera looks along the longest free horizontal ray at eye height (32 azimuths, the
   zone grid's first SOLID cell), target = camera + that ray x its free length ("along the room", rule not eye).

**§GLASS_VEIL — SPEC (2026-09-25, dev red1-5a; watchdog item D; builds on §SKY_VIEW_FIELD's per-material T). Alt+S
only (`!A._maxqActive`), films later (parity list).**
DEFECT: red1 14:26, Hospital cam [-15.84,2.47,4.14] tgt [3.96,-3.12,0.20]: behind a glazed pane "a flat lavender-grey
veil". red1: "the window glass should allow light thru or/and reflect the cam point of lite if any." CAUSE (probe
glass_veil.out, one press): camera OUTSIDE (zone 0, exposure 0.383), 1.44 m from the pane; the centre ray crosses TWO
glass faces 2 cm apart of a SHARED material that §GLASS_FRESNEL skips (skippedShared {"?":26, IfcMember:44}): stock
MeshStandard, opacity 0.3, colour #737278, NormalBlending, depthWrite true = a sun/hemi-lit grey body at 30 %, twice.
FIX:
1. SCOPE: every mesh whose materials are ALL glassy (the §SUN_GLASS_CASTERS test: transparent, opacity < 0.95, no map, not
   Basic) gets the glass clone, whatever its IFC class; the clone is made once per ORIGINAL material and assigned only to
   those meshes, so a shared material also used by a mixed/frame mesh keeps its stock look there (mullion safety).
2. ONE PANE, TWO SURFACES (watchdog add 1): the two faces 2 cm apart are the pane's own two surfaces (a thin solid), which
   is how real glass transmits: T_pane (the material's one number, T = 1 - opacity, the SAME T §SKY_VIEW_FIELD uses) is
   split per surface as t_s = sqrt(T_pane), so two faces give exactly T_pane. A pane seen as a single face (open mesh)
   gets t_s = T_pane (counted: surfacesPerPane per material from a coplanar-pair test at build, logged).
3. PHYSICS per surface (no lit diffuse body): premultiplied blend, dst x t_s x (1 - F(theta)), src = the reflected radiance
   only (three's totalSpecular: env/IBL + sun + lamp highlights, Schlick F with f0 0.04 as §GLASS_FRESNEL), so the
   camera-side sky and lamps reflect and rise at grazing angles, and what is behind shows at T. Nothing brightens the
   interior (watchdog add 2: from outside by day an interior at ~1/100 of outdoor light IS dark through glass; lit lamps
   and bright interior surfaces show through, the interior is not lifted to fake it).
BLEND EQUATION (watchdog, gate OPEN): premultiplied output, blend ONE / ONE_MINUS_SRC_ALPHA (premultipliedAlpha true):
   fragment rgb = the Fresnel reflection radiance (three's totalSpecular, already x F — NOT x alpha), alpha = 1 - t_s(1 - F);
   so out = reflection + dst x t_s x (1 - F). NOT NormalBlending (src x alpha + dst x (1 - alpha) always paints the pane's
   own colour). Logged in the witness line as `blend=ONE/ONE_MINUS_SRC_ALPHA out=refl+dst*t_s*(1-F)` next to Tnormal, so
   T means what reaches the eye. Tint: a colour in T only where the model states one per material; else neutral (logged).
WITNESS (material state + maths, one press at red1's pose + café + Terminal hall): per glazing material `§GLASS_VEIL
mat= meshes= surfacesPerPane= T= t_s= bodyAlpha=0 f0= Tnormal= (= t_s^2 (1-F0)^2 per pane) veilNormal= (F0 x env
luminance x exposure) cameraSide=in|out EinOverEout=` (E at the pane's interior cell from §LUX_CHECK / the meter's
outdoor E). COUNT: glazing materials still stock (not cloned) = 0; any clone with a diffuse body > 0 = 0; Tnormal within
1 % of T_pane(1-F0)^2. GUARD 0/0/0, link <= +10%.

**RED1 APPROVED REFERENCE (2026-09-25, watchdog red1-c6): NO-REGRESSION POSE for §SKY_VIEW_FIELD, §GLASS_VEIL and §METER_HIST.**
~/Downloads/bounce_still_1790319885328.png, Hospital, cam [-5.529,-0.544,-42.321] tgt [4.014,-6.761,2.325], 8619 tree
(e61c116b): outside looking in through the curtain wall. Sun on the floors/stair inside "very good"; the deeper interior
dark but "acceptable, as in real life we cannot see from outside in such a well-lit building. Only when entering does the
exposure change." So: outside-camera exposure stays as is (no interior lift from outside); each of the three gates logs
at this pose the camera side, the exposure and the metered band, before/after — any change is FAIL-to-explain.

**§LAMP_ZONE_PICK — SPEC (2026-09-25, dev red1-5a; watchdog OPEN; zero-list item FLYIN_DARK). After §SKY_VIEW_FIELD lands
(same staging code), before §GLASS_VEIL. Alt+S first; the film path gets the same rule under ALTC F1.**
DEFECT (red1's 5-still Hospital fly-in on 8619, probe flyin.out): pose 5 (cam [-8.226,-11.841,13.38]) goes 39% black; the
left wall (zone 1) has 22/24 points at 0 lamp light, zone-1 lamps kept 123 -> 20, exposure +1.77 stops. CAUSE (source): the
zone priority runs only when the frustum holds more fixtures than the cap (tools.js:1987 `_zoneCap = inView.length > _capN`);
otherwise the zone-blind top-up `_nightPickNearest` (tools.js:2012) fills the set with lamps of 23 small other zones that
reach nothing in view. Films re-pick per frame the same way (cinema_maxq.js:4005 restages every frame; tools.js:1947-2012).
RULE (one rule for cap and top-up): pick lamps by the ZONES THEY LIGHT, not by whether the fixture is in the frustum (a
lamp behind the camera lights the wall in front). Candidates = every lamp bound to the camera zone, then lamps bound to the
zones visible in frame (zone ids of the existing 12x7 §SOURCED_LIGHT_CAP readback: zone -> share of frame hits), ordered
camera zone first, then by the zone's share of the frame, within a zone by distance to the camera. Cap = the uniform
budget as today (until ALTC F1 makes lamps zone data with no cap). The frustum test and the zone-blind top-up are removed
from the Alt+S path (nav keeps its own). ARCHITECTURE (red1, Alt+S = source of truth): the pick is ONE function
(camera, visible zones) called by the still AND per frame by films (it replaces tools.js:1947-2012 for both); the film adds
only continuity (a lamp entering/leaving the kept set fades over §LAMP_CAP_FADE_M-equivalent frames, no 0<->full step).
LOG per press: `§LAMP_ZONE_PICK camZone= zoneLamps= kept= perZone=[z:kept/available] dropped= (= §LAMP_CAP_DROPPED)`.
GATE (logged state, one run): red1's 5 fly-in poses in one session: zone-1 left-wall points at 0 lamp light = 0 at every
pose; camera-zone lamps kept = min(cap, zone lamps) at every pose; exposure change pose 4 -> 5 reported (was +1.77 stops);
no regression at the outside-looking-in reference pose; GUARD 0/0/0.

**§GLOW_LAYERS_OFF — SPEC (2026-09-25, dev red1-5a; red1 decision, watchdog agreed; item C suspect). Branch feat/no-glow-layers
off -int c56769bf, port 8623.**
red1: remove the decorative glow layers from Alt+S — §GLOW_LENS_QUAD (emissive rect/round lens quads at fixture footprints,
_glowLensOn) and §PHOTO_GLOW_SPRITE (bloom sprites, _glowOn; the still stages only the exit-sign subset). Not real sources,
often misaligned, prime suspect for item C (Clinic entrance shaft/blobs by day). Fixture meshes stay emissive (§STILL_GLOW,
§LAMP_SHAPE_COLOUR); real lamps stay.
CALL SITES (source): both are staged at ONE place, startStillRefine (effects.js ~6117-6119: `_glowOff(); _glowOn(exit
filter); _glowLensOn();`). Films call startStillRefine every baked frame (cinema_maxq.js:4005), so the same switch covers
Alt+C (Alt+S-truth rule). Nav stages neither (§GLOW_SPRITE_NAV_OFF; A._glowStage has no caller outside effects.js).
1. CORRECTION (red1: "I mean remove completely"): DELETE both, code and all, from every path (Alt+S, films, nav, teardown/
   §R17, the vacuous-log tables, the bloom threshold note). No flags, no A/B. Grep proof in the commit: 0 references left.
   bbox_x/bbox_y/rotation_z are MODEL data and stay (the K-lamp emissive shapes use them).
2. COUNT FIRST: `§FIXTURE_EMISSIVE lamps=N withMesh=M withoutMesh=K byClass={}` per press — a lamp (fixture world
   position, A._nightFixtureWorldPositions) "withMesh" when its element's own drawn mesh/instance (guid -> object via
   A.guidMap) has a material with emissive > 0 at the staged still. K listed per building (Hospital/Clinic/Terminal). If
   K > 0, a follow-up gives those a small emissive shape at the fixture's REAL position/footprint/yaw (bbox_x/bbox_y/
   rotation_z, the data the quad used) — not in this commit.
3. ITEM C in the same gate: at red1's Clinic exterior pose cam [43.873,7.747,-3.074] (tgt from the PNG tEXt) by day:
   glow draws (sprites + lens quads) with the camera outside = 0; every emissive surface seen through the entrance glass
   (grid rays through glass, first opaque hit with emissive > 0) named by class/material.
GATE: §FIXTURE_EMISSIVE on Hospital/Clinic/Terminal + the item C count + GUARD 0/0/0; commit names the call site and
"film path: same call site (startStillRefine per frame), no smoothing needed".

**§IRC_MAX — SPEC (2026-09-26, dev red1-5a; watchdog FINAL ruling: IRC ON by default, no double count by a MAX rule). On the
sky-field branch (feat/sourced-daylight 59e0b22d). Alt+S-truth: IRC is BUILD (per zone, camera-free); the max is DECIDE.**
WHY: with IRC off, a real GI still left the Terminal hall black (345/564; hall_floor 279/573) and the tower wall lost the
retired portals' light (wall mean 68 vs 115 with portals, §AO_VS_SUN). Ceilings under opaque roofs have F = 0 and screen-
space GI has no lit neighbour there. IRC (the per-zone interreflected component, flux balance R 0.5, V12) is the analytic floor.
RULE (watchdog): per fragment, indirect diffuse = max(IRC_zone, SSGI_indirect), never the sum. The GI still composites a
bounce layer over the app frame (gi_still.js ~717; its own 'linear' encode mode exists, ~502). So:
1. The app frame renders WITH the IRC term (the shader add, as on &irc=1).
2. One extra small numeric pass renders the IRC term alone, in the same linear units as the bounce layer (a zone-debug mode
   writing IRC irradiance x albedo x exposure, linear, before tone mapping), at the GI still's resolution.
3. The composite adds only what the bounce layer carries ABOVE the IRC: bounce' = max(0, bounce - IRC_px), done in linear
   light (the 'linear' encode path), so final = app_without_IRC + max(IRC, bounce). If the composite is not linear-exact
   in some mode, the log says so and that mode is not used.
LOG per press: `§IRC_MAX ircOn=1 pixelsIrcWins= pixelsSsgiWins= (shares %) meanIrc= meanBounce= blackDirectGI= ms=`.
GATE (the sweep + these): Terminal hall + hall_floor blackDirectGI 0 with a real GI still (was 345 / 279); the tower wall
(red1's pose) mean with the max rule reported next to the portals-on 115 reference (not forced); Hospital/Clinic references
and the outside-looking-in pose unchanged within the sweep's tolerance; link <= +10%; GUARD 0/0/0. Films: the film GI path
(gi_film.js) must use the same max composite — named in the commit ("film path: gi_film composite uses the same max").

**§IRC_MAX v2 (lamps + daylight) — SPEC (2026-09-26 PM, dev; supersedes the §IRC_MAX method below, keeps its RULE).**
TRIGGER: red1 "One room has black strip" (Clinic …385840825). State: 398/400 sampled near-black pixels (max channel <= 3, the
§FAULT_GI definition) are HORIZONTAL surfaces at y 4 m in windowless zone 173 (819 m3, 29 lamps); every lamp sits 8 cm ABOVE
them, 1-1.6 m away: the ceiling band around recessed fittings, lit only by interreflection, which nothing supplies (SSGI needs
lit neighbours on screen; V12 IRC is daylight-only and the room has no aperture).
METHOD (Sumpner flux balance, the V12 relation): per zone E_ir = R/(1-R) x mean DIRECT irradiance over the zone's own surfaces
(R = R_BRE 0.5). Lamps: the mean of three's own point-light term (att(d, range, decay) x cos) from the zone's lamps (+ unbound),
over zone-grid surface faces (every zone cell face against SOLID; <= 4000 faces sampled per zone, even stride). Daylight: the
V12 irc_z (already computed by LightZones.field) x the hemisphere sky irradiance (hemi sky colour x intensity at staging).
One RGBA32F texel per zone; shader: irradiance += E_ir[_slFZ] (indirect diffuse, the material's own BRDF), staged only.
RULE (unchanged, watchdog): indirect = max(IR, SSGI), never the sum: gi_still composite adds max(0, bounce - IR_px), IR_px =
decode(app) x share, share = IR radiance / total radiance per pixel from two linear renders (IR-only readback w=9, normal).
The share is exact in linear light; applying it to the tone-mapped app colour is an approximation (stated in the log).
LOG: §IRC_MAX build (zones with IR, lamp/day parts, ms) + per press (pixels IR wins / SSGI wins, mean share).
WITNESS: red1's Clinic pose near-black app pixels in zone 173 (2044 before) -> after; Hospital indoor + Clinic corridor refs
app mean change reported (not forced); 0 shader/context/page errors. &ir=0 = off; &ircmax=0 = sum (A/B only).

**§LAMP_UNCAPPED — SPEC (2026-09-26, dev red1-5a; watchdog: the lamp cap is now a GLARING Alt+S defect; ALTC F1 moves into
the Alt+S zero list). After the sweep and §IRC_MAX.**
DEFECT: the uniform budget caps point lights (120-160); a zone like Hospital zone 1 has 547 lamps, so far walls lose their
nearby fixtures (tower wall: nearest zone fixture 1.9-4.8 m NOT kept, nearest kept 15-20 m; §BLOTCH_LIGHT) and the dark
patches move with the camera (§CAMDEP_SURFACE: lamps differ at 94/95 points between two poses).
METHOD: clustered forward shading over our own zone grid (Olsson, Billeter, Assarsson, "Clustered Deferred and Forward
Shading", HPG 2012): lamps become DATA, not three.js lights.
1. BUILD (per building, camera-free, cached): a lamp data texture (position, colour x intensity, range, zone) for EVERY
   fixture; a cluster grid = the zone grid coarsened to 4x4x4 cells (2 m); per cluster the list of lamps of the cluster's
   zone(s) whose influence sphere (the lamp's own distance cutoff, three's getDistanceAttenuation window, 25 m today)
   reaches the cluster; stored as (offset, count) per cluster + one flat index texture. Log clusters, max/mean lamps per
   cluster, MB, ms.
2. SHADER (one patch, once per fragment — the §SOURCED_LIGHT_LINK rule): look up the fragment's cluster, loop its list
   (dynamic loop, bounded by the BUILD max), accumulate three's own point-light term (getDistanceAttenuation, the same
   BRDF path) with the zone binding intrinsic (lists are per zone). Program count CONSTANT (NUM_POINT_LIGHTS unchanged by
   lamp count; the lamp point lights are removed from the scene when the data path is on). No uniform cap.
3. DECIDE: nothing camera-dependent (the per-frame cost is the loop). Films inherit as-is: no pick, no fade, no churn.
4. COST: per-fragment loop length logged (mean/max per frame over the frame's clusters) + ms per frame vs today at red1's
   poses; if the max list is too long for a real-time nav budget, the path stays Alt+S/film-only (stills and bakes are not
   60 fps) — stated with numbers.
INTERIM (watchdog "if cheap"): ranking capped lamps by distance to the camera zone's VISIBLE SURFACE samples instead of the
camera needs surface samples; the ray-free DECIDE has only zone boxes, the 64x36 depth readback costs 220-650 ms and the
84-ray grid 2.3 s — so NOT cheap; not done (stated).
GATE: at red1's tower pose + fly-in poses + the sweep: every lamp within range of a visible surface contributes (analytic:
all-fixture irradiance vs the rendered set, max relative loss < 1% per point); §CAMDEP_SURFACE lamps term identical across
poses; program count constant across presses; link <= +10%; GUARD 0/0/0; frame ms reported.

**§RELEASE GATE — STANDING RULE (red1 2026-09-27: "let the WITNESS logging dig thoroughly to filter off any GIGO"; "on any baking
channel you may administer, use deeply such logging to debug before releasing").** Nothing is FF'd into look, published, or handed
to red1 as ready — still OR bake (cli_silent_bake, Alt+C MaxQ, gi_film/bake pool) — until the GIGO witness (viewer/tests/
witness_alts_all.js, fix/alts-all) prints §BAKE_RELEASE_GATE / per-pose verdicts PASS: instrument sanity first (sw/?v=/lawHash/
fresh profile/no page errors/cache keys/pose tEXt/meter finite) else INCONCLUSIVE; each fix's NO-OP check vs its off switch;
VACUOUS guards; look bands; refs; per-frame film checks (steps, programs, black/white/reused frames, SW-race double-init).

## ▶▶▶▶ §DEV RESUME 2026-09-30 ("resume sky leak") — START HERE (model: Opus allowed by red1 for this task; Fable resting)
# ⚠ DO NOT REMOVE — scope: the SKY-VIEW FIELD false-bright patches (Hospital hall, stairs). Read the log after every run. Proof =
# § numbers, never red1's eyes (PRIMAL LAW). GPU probes ALWAYS `flock /tmp/claude-1000/gpu.lock`; OOM lines > 0 = not evidence.
STATE: look/combined-0925 @43db04b6 sw v1500 served :8624 from /tmp/wt-look (after a reboot: `git -C ~/bim-ootb worktree add /tmp/wt-look
look/combined-0925` + symlink ~/bim-ootb/buildings/*.db + ~/bim-compiler/deploy/dev/buildings/HITOS_extracted.db into buildings/ +
`node ~/bin/serve_tree.js /tmp/wt-look 8624 &`). Hotfix tree /tmp/wt-hot = fix/look-hot1 (same commit), serves :8662 for probes.
PROBE: scratchpad of session deaf078b… (/tmp/claude-1000/-home-red1-bim-compiler/deaf078b-7b7d-43e2-a8ce-dce2f252d96b/scratchpad/
diag.js; copy it if /tmp was wiped — lost on reboot, then rebuild from the env list below): env LEAK=1 LEAKW/LEAKH (grid rows: zone, sky,
F, N.sun, sunOpaqueAt, blocker, Lu/Lf, mat), HEMI='[[x,y,z],..]' (exact hemisphere), PREJS='js' (eval before Alt+S), Q='&flag',
OUTD/SUF; judge: sl/judge.py (bright+blocked count).
MEASURED (see SUN_SHADOW_LEAK status below): Hospital …598818184, 23 floor points Lf 200-230 vs median 129; NOT the sun map
(&shadowcascade/fit/edge=0 and sun off all still 23; two-sided shadowSide on 107 mats still 23). All 23 have field F 0.062 vs 0 on 193
normal points. Exact rays (uniform elevation, glass-then-opaque=blocked) see 0 % sky. red1: stairs also pass light.
STEP 1 (15 min): re-probe the 3 bright + 2 normal points with a COSINE-weighted, GLASS-TRANSMISSIVE exact hemisphere (the Z26 agent's
  HHS method, z26r/leak.js if present) + APP._fieldTrace=[points] (Z.field.trace per-direction lattice contributions). Decide: lattice
  over-reads (leak) vs real skylight.
STEP 2 (spec first, append here): if leak — bound each cell's F by exact rays at field build (reuse the Z26 §GLASS_REFL_OPEN BVH/ray
  machinery in light_zones.js), § line §SKY_FIELD_EXACT (cells, rays, ms, meanΔF, cells lowered/raised); A/B &skyexact=0. Hospital build
  cost must be stated (field sweep today 91 s).
STEP 3 witness: …598818184 bright+blocked 23 -> ~0, floor median unchanged ±3; HHS …601892033 bright band (real window light) stays;
  Terminal ext …622137170 229/236 ground agreement stays; Clinic …495545980 glassReflDark 2/44 stays. Then commit, FF look, push.
STEP 1 RESULT 2026-09-29 (Opus, leak.js with PTS env + _fieldTrace lifted 0.25 m into the air cell; :8662 v1500, OOM 0; logs
  scratchpad 6c1a56ce…/s1/1790598818184_s1b.*): LATTICE OVER-READS (quadrature), not real skylight at that level.
  | point | lattice F | lattice dirs | exact cos-hemisphere 128 rays, x glass T | dir 8 cone (48 rays) clear / xT | 0.0886 x coneT |
  | [-0.2,-15.4,-10] bright | 0.0622 | 1: di 8 (dx -1 dz 0, 45 deg) w 0.0886 vt 0.702 (glass) | 0.0191 | 0.333 / 0.163 | 0.0144 |
  | [0.4,-15.4,-6] bright | 0.0622 | same one dir | 0.0038 | 0.146 / 0.071 (centre ray hits opaque at 6.85 m) | 0.0063 |
  | [-1.8,-15.4,1.7] bright | 0.0622 | same one dir | 0.0115 | 0.375 / 0.184 | 0.0163 |
  | [-8.9,-15.4,2.3] / [-10.3,-15.4,3.7] normal | 0 / 0 | none | 0 / 0 | - | - |
  => ONE of the 41 directions (weight 8.9 % of the sky) is credited in FULL because its single lattice path threads the atrium
  glazing, while 62-85 % of that direction's solid angle is really blocked (the cone check reproduces the exact hemisphere:
  0.014/0.006/0.016 vs 0.019/0.004/0.012). The lattice F is 3-16x too high; the hall floor gets the patch wherever that one path
  threads the gap. Real skylight exists there but is 0.004-0.019, not 0.062.
### §SKY_FIELD_EXACT — SPEC (2026-09-29, Opus; Witness = STEP 3 above)
- WHAT: after the lattice sweep and the §SKY_SHELL_RAYS pass, over the SAME BVH (boundary + occluders, glass x T per pane), bound
  every lattice contribution of a READ cell by exact rays inside that direction's own quadrature cell. Contribution (cell c, dir d)
  = w_d vt_d (lattice) -> min(w_d vt_d, w_d E_cd), E_cd = mean exact T over sub-directions of d. LOWER ONLY (a bound): the lattice's
  under-reads (HHS dim points) are out of scope, counted as `wouldRaise`, not applied.
- READ cells = non-solid covered cells within Chebyshev distance 2 of a SOLID cell (fieldRead samples the 2x2x2 texels around
  p + 0.5 cell x n: at most 2 cells off the solid). Cells the shell pass recomputed are skipped (already exact).
- SUB-DIRECTIONS: per d, the plane-y=1 points (0.05 step, the same integrand cos x (1 + 2 sin elev) dOmega that makes w_d) that
  pick d as nearest, systematic-sampled by cumulative weight into K = 16 fixed directions (same set for every cell: spatially
  coherent, no per-cell noise). Stage 1 = every 4th (4 rays); if all 4 reach sky with T >= lattice vt, the contribution stands;
  else stage 2 casts the other 12 and E = mean of 16.
- Bent normal (zb) moves by the removed share x u_d. Switch &skyexact=0 / APP._stillSkyExact=false (enters the §ZONE_IDB_CACHE
  fingerprint); needs the shell BVH (shell off -> skyexact off, logged).
- § line §SKY_FIELD_EXACT per build: readCells, pairs, rays (stage1/stage2), ms, cells lowered (>0.005 F), meanDF over lowered,
  maxDrop, wouldRaise pairs, VACUOUS when pairs = 0. Hospital cost stated from the log.
§SKY_FIELD_EXACT BUILD LOG (Opus, /tmp/wt-hot uncommitted, Hospital …598818184, OOM 0):
  v1 (16 sub-dirs, every pair): readCells 800088, pairs 1470932 (shell-skipped 290540), lowered pairs 744797, cells lowered 107764
  meanDF -0.0445 maxDrop -0.59, wouldRaise 925, rays 13.7 M, 112 s — too slow.
  v2 (8 of 16, pairs with w vt < 0.005 unchecked = the 16 lowest dirs, sum w 0.029): pairs checked 498913, cells lowered 102998
  meanDF -0.0438, wouldRaise 143, rays 3.17 M, 29.1 s (9.2 us/ray). => ~96 % of v1's effect at 26 % of the cost.
  FOUND ON THE WAY (pre-existing, silent): gi_still.js waitForStill(120000) counts the first press's staging (field build inside it:
  Hospital 109 s baseline, 138 s with v2) -> > 120 s = the bounce pass is abandoned with a toast and NO § line (runs fx/fx2/fx3 had
  no §GI_STILL result). Fix §GI_WAIT_BUDGET: wait while the still stays active (900 s cap) + §GI_STILL_FAIL reason=… on every give-up.
  WITNESS Hospital …598818184 (v2 + §GI_WAIT_BUDGET, fx/…_fx4.log, OOM 0, §GI_STILL result OK): bright+blocked 23 -> 0. The 31 floor
  points whose F changed: F 0.017-0.075 -> 0-0.015, Lf 202-228 -> 133-185. The 200 floor points with F UNCHANGED moved Lf median
  128 -> 134 = auto-exposure, not the field: meter Lavg 67.5 -> 56.4 cd/m2, exposure 70.1 -> 84.0 (+0.26 EV) because the false
  light left the frame. Spec's "median ±3" is outside by +3 for that reason (camera behaviour, not a field regression).
  §STILL_OVERLAY_GUARD (red1 2026-09-29 "a guard not to allow the canvas to be in x-ray or other overlay mode"): startStillRefine
  clears X-Ray + the ghost bbox shell before every still (same reset as the film's §CINEMA_XRAY_RESET/§CINEMA_GHOST_RESET), logs it.
  REGRESSION A/B (same tree, &skyexact=0 vs default, all OOM 0): HHS …601892033 window band kept (F 0.032 -> 0.022-0.028, Lf
  160-170 -> 141-168; 125/880 grid points' F changed); Terminal ext …622137170 ground dark<->sun-blocked agreement 364/371 -> 366/373
  (build +20.0 s, 201591 cells lowered); Clinic …495545980 glassReflDark 2/44 -> 2/44 (build +0.5 s). HHS build +10.0 s.
  ✅ SHIPPED 9d7ebc71 sw v1501 (look/combined-0925 FF + fix/look-hot1, both pushed; :8624 serves v1501). W-OVERLAY (overlay.js):
  X-Ray PASS on Clinic; ghost arm INCONCLUSIVE (the ghost auto-shell only arms after the navigate module loads — never on a fresh page).
- SAMPLEHOUSE_WALL_GHOST (red1 still …645217887, v1500, "done without any overlay"): faint white basin/pedestal silhouettes on the
  wall between piano and door. Diagnostic press (LEAKPX, OOM 0): ALL 6 pixels hit the same opaque wall 3cUkl32yn9qRSPvBJVyWXt (c8c8c8,
  op 1), zone 3, F 0-0.003 -> the shapes are IN the wall's lighting, not geometry seen through it. Lu/Lf inside the shapes 148/120,
  150/135 vs plain wall 159-164/153-160: present in the app frame, ~3x stronger after the bounce pass. §FAULT OK, §FAULT_GI OK (the
  fault counters do not see it). A/B per light term (:8624 v1501, LEAKPX rg/px_sh.json, Lu/Lf per pixel; px0/1 = basin/pedestal,
  px4/5 = plain wall; baseline 148/120 150/135 · 159/153 164/160):
  | &torch=0 | 143/119 144/110 · 153/141 159/154 (unchanged -> not the torch) |
  | &sourced=0 | 143/171 129/149 · 155/183 178/194 (pattern stays) |
  | &aoindirect=0 | 155/145 162/139 · 159/153 164/160 (APP frame flattens: basin 155-162 vs wall 159-164) |
  | &giredist=0 | 149/149 148/148 · 159/159 164/164 (final = app frame: the 3x amplification gone) |
  LEAD: the silhouette comes from the INDIRECT AO buffer (N8AO, screen-space — cannot legitimately see objects behind an opaque
  wall; suspect its depth/normal input includes the hidden/behind-wall fixtures, e.g. §METER hidden=36) and §GI_REDISTRIBUTE
  amplifies it (IR removed x (1 - AO)). NOT RUN (paused by red1 suspend): &skyfield=0, &ir=0. RESUME: read which meshes N8AO's
  depth pass draws at this pose (hidden / layer / visible flags of the sanitary fixtures behind wall 3cUkl…XWXt), then fix at source.
  Probe: scratchpad 6c1a56ce…/diag.js (env WAIT, LEAKPX) + rg/px_sh.json; still ~/Downloads/bounce_still_1790645217887.png.
- OPAQUE-SET AUDIT (red1 2026-09-29: "the abstract rule — opaque as long it's not glass?"; "staircase still doesn't block the light";
  "lamps are not evident on surfaces further away"; "Terminal roof slabs too seem to allow light thru; the pattern of shadows there and
  in Hospital is not consistent with the structure they fall under"). Each light term uses a DIFFERENT opaque set (code-read v1501):
  sun = every castShadow mesh (shadow map); sky lattice = BOUNDARY classes only (light_zones.js:16 — no stairs/beams/columns/MEP);
  sky exact rays (shell + §SKY_FIELD_EXACT) = BOUNDARY + OCCLUDERS (:43) of disc ARC/STR only (:42 — MEP never blocks sky); lamps =
  nothing (no shadow); AO/SSGI = on-screen only; glass = material opacity < 0.95 (not IFC class; SampleHouse IfcWindow mesh op 0.1).
  TARGET RULE: one opaque set for every term = every drawn mesh unless glass (IFC class + material). Order: lamp shadow map (queued),
  MEP into the exact-ray soup, glass by class. MEASURING FIRST which term leaks (lamps ruled weak at distance by red1):
  su/run.sh = &meter=0 vs &meter=0&sunoff=1 (§SUN_OFF_AB debug switch, /tmp/wt-hot, uncommitted) at Hospital …512160 + Terminal
  …602379032 — sun share per grid point vs exact sun ray; sr/ = stair.js (§STAIR_GRID: floor points whose up-ray hits IfcStair*).
  SETTINGS INFERENCE (no new render; st/1790646512160_on.log, v1501): §STILL_SHADOW_CASCADE uncovered 0/14400, 4 cascades 4096,
  texel 1.5-8.7 mm, depth range 143 m covers groundY -15.9 .. topY 22 -> the sun map cannot leak a slab at that pose; and EVERY one
  of 731 grid floor points is sun-blocked by real geometry (STR 422 / ARC 199 / IfcBeam 83). Floor brightness is monotonic in the
  lattice F: F 0 -> Lf 71 (n 153) · 0.001-0.01 -> 85 · 0.01-0.03 -> 117 · 0.03-0.1 -> 160 · > 0.1 -> 211 (n 23). => the stair-hall
  floor blotches ARE the sky-view field pattern; whether F matches the structure above is the open question (§LIGHT_WITNESS).
### §LIGHT_WITNESS — SPEC (2026-09-29, red1: "those latest stills' blotches should give enough clue what to dig up and prepare full
### WITNESS debug measures"; "reduce testing time with WITNESS logging and settings inference")
- WHERE: shipped, every Alt+S, computed after the GI composite (gi_still.js, beside §FAULT_GI: it needs the final pixels), result
  merged into A._stillFaultLast.lw so the saved PNG's tEXt carries it. No external probe needed to judge a red1 still.
- SAMPLES: 16x9 screen grid, first opaque scene hit (glass skipped), eye-facing normal. Time budget 6 s (logged n done).
- PER SAMPLE: L = final-pixel luminance; F = lattice sky-view (skyField); E = EXACT sky: 16 stratified CIE-overcast x cos rays, glass
  x (1 - opacity), any other hit = 0 (the same integrand the field approximates); sun = one exact ray to the sun (blocked + blocker
  class); up = class of the first hit straight up (stair / slab / beam / none).
- LINE §LIGHT_WITNESS: n, ms; skyOver (F - E > 0.02 and F > 1.5E) / skyUnder (E - F > 0.02 and E > 1.5F); sunBlocked n; brightness
  table of SUN-BLOCKED samples binned by E: n, median L, p90 L per bin [0,.001) [.001,.01) [.01,.03) [.03,.1) [.1,1] — a leak shows as
  a high-L E~0 bin or a non-monotonic table; worst 3 skyOver with p, F, E, up class. Verdict WARN when skyOver > 0 or the E~0 bin p90
  exceeds the next bin's median; INCONCLUSIVE when n = 0; not part of §FAULT's verdict until calibrated on red1's stills.
- WITNESS of the witness: on Hospital …512160 it must reproduce the F-band table above from its own samples, and report skyOver at
  red1's stair-hall stills; &skyexact=0 must raise skyOver at …598818184 (the 23-point patch) — i.e. it can say WRONG.
### §LIGHT_GRID_TRUTH — SPEC (2026-09-29, red1: "can't we have a mechanism of testing results based on a grid array?")
- TRUTH (once per building, persisted, keyed on the building DB hash — PRIMAL LAW 5 "run once, persist, read forever"): a WORLD
  grid, not a screen grid: every 1 m on the top face of each covered slab (a down ray from each slab's storey top finds the floor)
  + wall points at 1.2 m. Per point: exact sky E (64 CIE-overcast x cos rays, glass x (1 - opacity)), sun blocked + blocker class
  (at the still's standard sun), class of the first hit straight up. Stored as ~/.cache/bim4d/light_grid/<bld>_<dbhash>.json.
- MODEL (per code change, seconds): page load, LightZones.build + field (IDB-cached per code version, persistent profile), F at
  every grid point via skyField — NO Alt+S, no refine, no GI, no pixels.
- RESULT §LIGHT_GRID <bld>: points, skyOver (F - E > 0.02 and F > 1.5E), skyUnder, median |F - E|, per up-class breakdown (IfcStair*,
  IfcSlab, IfcBeam, none), worst 10 with p / F / E / up. Before/after = diff of two arrays over the SAME points: a fix is judged over
  the whole building, not one camera. Renders stay for what needs pixels (exposure, bounce) via §LIGHT_WITNESS on red1's own stills.
- Tool: scratchpad fieldprobe.js -> lightgrid.js (world grid + persisted truth).
- EXTENDED (red1: "can it also be used to return other values to infer blotches?"): per point the model side also returns zone
  (surfaceInfo), ground-bounce Gd, V12 zone fill (field.ircAll), relative lamp sum (I cos / d^1.5, zone-bound; null without lamp data).
  BLOTCH tests over 1 m neighbour pairs on one floor: skyJump (|dF| > 0.02, |dE| < 0.005 — a field edge the geometry lacks), zoneFlip
  (different zones, same up class — the Z23 eye-side lookup class behind TERMINAL_CORNER / Castle speckle), irStep (fill differs
  across a flip), lampStep (lamp ratio > 2, same up class). Not covered (screen-space): AO, SSGI — §LIGHT_WITNESS covers those.
- CLINIC BASELINE (red1 2026-09-29 "latest Clinic stills showing good", v1501, from the PNG tEXt stamps): …656754442 and …656779058:
  unlit 0/144 and 0/142, irOnly 0, hueNoise 0, blown 0.27 % / 2.95 %, dark 0 %. Both still say §FAULT FAULT, and the ONLY counter is
  glassLow = 1 (one visible glazing material with T < 0.7). All 172 see-through plates are drawn as glass (lost 0). So the FAULT flag
  fires on every Clinic still from one material. OPEN: name that material and check the IFC — a tinted pane is data, and then glassLow
  should not flip the verdict.
- HHS STILLS 2026-09-29 PM (v1501, PNG stamps + pixel sixths): …657642427 atrium corridor: brightness by sixth L->R 189/179/165/139/47/21,
  right sixth 8.68 % pure black (corridor wall + doors) while §FAULT says OK unlit 0/102 -> the fault check misses it; same class as
  HHS_CORRIDOR_DARK (floor->wall bounce under-counted). …657722332 room looking out through glass: 206/183/161/70/33/29, left thirds
  4.3-6.9 % blown (the atrium seen through glass), no black — possibly correct exposure; undecided. …646782139/…646800064 glassReflDark
  92/126, 62/120: HYPOTHESIS (unverified) the covered atrium counts as camOutside so inward-facing panes are judged against sky.
  Queued: lightgrid.js at …657642427 (HHS) after the Hospital grid runs.
- §LIGHT_WITNESS FIRST RUNS (/tmp/wt-hot uncommitted, :8662, lw/*.log, OOM 0): CAN SAY WRONG — …598818184 skyOver 0 (fix on) vs 2 with
  &skyexact=0 (worst F 0.0622 / E 0 = the known patch). DEFECTS before it ships: (1) slow — 24-34 of 144 samples in the 6 s budget
  (~200 ms/sample, plain scene raycasts); (2) 16 rays quantise E to 0 or >= 0.03 (middle bins empty); (3) DARK_BIN_BRIGHT fires on
  every press — lamps and bounce legitimately light E~0 points; the rule needs the lamp term or goes. Not shipped.
- PERSISTENT PROFILE SAVING (measured): Hospital press with the IndexedDB field reused: §ZONE_IDB_CACHE hit ms=53 (was 119,263 ms),
  run wall 177 s vs 337 s.
- §LIGHT_FIELD_PATCH (red1 "can the initial glass data be injected into DB ... so my own testing will be faster"): fix/light-field-db
  merged onto v1501 = bim-ootb fix/lfdb-v1501 (8dbc3bd9, sw v1502) + c6a47418: optional binary sidecar
  buildings/patches/<db>.lightfield.bin ('LFP1' + header + gzip blob; gitignored, derived) applied after <db>.sql. Local first
  (red1's ruling): baked into /tmp/wt-lfdb (served :8663) for Clinic/Hospital/HHS/Terminal by scratchpad bake.js; restorecheck.js =
  witness. OCI later, once light_zones.js stops changing (the row's key is that file's hash: every light-code edit makes it stale).
- §LIGHT_GRID FIRST RESULTS (scratchpad lightgrid.js, :8662, lg/*.log; truth ~/.cache/bim4d/light_grid/): Hospital truth computed once
  1,456 s (117,784 rays, 11.0 ms/ray — plain scene raycasts), then a check with cached truth + cached field = 36 s wall (vs 337 s for a
  test press with the field cached, ~21 min fresh). SampleHouse 14 s first run. WHOLE-HOSPITAL A/B (3,000 floor points, 818 neighbour
  pairs), &skyexact=0 -> v1501: skyOver 191 -> 50, skyJump 22 -> 3, skyUnder 191 -> 224 (the 8-ray bound lowers some cells past the
  32-ray truth — tune). Remaining skyOver by up class: STR 25, ARC 19, MEP 2, FP 2. DEFECT: zoneFlip has no wall-between test
  (SampleHouse 75 flips / 63 irStep, many likely real walls) — add a ray between the pair before trusting it.
- §LIGHT_GRID HHS (…657642427 pose, v1501): truth 192 s once (1.6 ms/ray). 3,000 floor points: skyOver 145 (4.8 %), skyUnder 352
  (11.7 %), skyJump 136 / 5,129 pairs (2.7 % vs Hospital 0.4 % — HHS is the blotchiest), zoneFlip 503 (no wall test yet). Under MEP
  46/515 over-read = MEP never blocks sky (opaque-set step 2). Corridor wall NOT answered: the grid samples floors only — add 1.2 m wall points.
- ✅ §LIGHT_FIELD_PATCH LIVE LOCALLY (look FF to c6a47418, sw v1502, :8624; sidecars copied into /tmp/wt-look/buildings/patches,
  gitignored). Baked (bake.js, key 6cf4c681:142097): Clinic 0.34 MB (raw 22 MB), HHS 1.2 MB, Terminal 3.2 MB, Hospital 5.8 MB (raw
  125 MB). NAME = the file the viewer patches: <bld>_meta.db for Clinic/Hospital/Terminal (they load the meta split), HHS
  _extracted.db (first attempt used _extracted everywhere -> INCONCLUSIVE, no sidecar fetched). W_LIGHT_FIELD_PATCH fresh profile
  (restorecheck.js): Clinic PASS field 11.6 s -> 24 ms; Hospital PASS 111 s -> 66 ms (restore at open 1.2 s); Terminal PASS 87 ms;
  HHS PASS 22 ms. Only for LOCAL db URLs (?db=../buildings/<bld>_extracted.db); OCI URLs fetch OCI patches. Re-bake after every
  light_zones.js edit (the key is that file's hash).
- HOSPITAL v1502 STILLS (red1 PM, local db + sidecar on :8663): …926827 aerial OK; …010578 / …977510 cloudy smudges on the dark stair
  core + soffits; …041706 basement room irOnly 81/144 (lit only by the flat zone fill — a fixture-less windowless room would be ~black).
  STAIR CORE MEASURED (…010578, diag LEAKPX 32 px + walle.js exact 64-ray E per surface normal, sidecar field, OOM 0; staging with the
  sidecar sourcedStage 6.9 s vs 98-128 s): Lu follows F point by point (F 0 -> Lu 43-57; 0.02-0.03 -> 104-114; 0.047-0.064 -> 121-136),
  GI adds ~0 (Lu ~ Lf). TRUTH on the main face E 0.008-0.015 ~uniform; lattice F 0 .. 0.029 patchy; side face (n -z) E 0 vs F 0.047 /
  0.064. => the smudge = lattice quadrature noise (over AND under) on a surface whose true sky is smooth and low; §SKY_FIELD_EXACT
  (lower-only, dirs >= 0.005) does not reach it. PROPOSAL (now affordable because the field is BAKED, not built on the press): exact
  CIE rays for every READ cell (Hospital ~800k cells; ~7 min at 8 us/ray, once per bake) replacing the lattice value there; witness =
  §LIGHT_GRID with wall points (skyJump -> ~0, skyOver/skyUnder -> ~0) + this core face.
- TERMINAL v1502 STILLS (red1 PM, local db, :8624): …374052 / …420910 cloudy blotches on columns + the hall partition wall = same look as
  the Hospital stair core (lattice quadrature noise) — INFERRED, not measured here (§SKY_FIELD_EXACT lowered 201,654 Terminal cells);
  …512860 small room: warm mottled ceiling bands (lamp term? unmeasured); …480619 corridor / …320275 hall / …283007 aerial: nothing
  evident. All 6 §FAULT FAULT on glassLow = 2 only (Clinic: 1) -> the verdict flag is noise on these buildings; name the materials.
### §SKY_FIELD_EXACT_ALL — SPEC (2026-09-29, red1 "proceed systematically"; dispatched to one Opus agent)
- WHY (measured): smudges on walls/columns in Hospital (stair core …010578: truth E 0.008-0.015 smooth, lattice F 0-0.064 patchy) and
  Terminal (…374052 / …420910, inferred) = 41-direction lattice quadrature noise, over AND under. §SKY_FIELD_EXACT (lower-only, dirs
  w vt >= 0.005) cannot reach it. The field is now BAKED (§LIGHT_FIELD_PATCH), so exact cost moves off the user's press.
- WHAT: for every READ cell (non-solid covered, Chebyshev <= 2 from SOLID) not already shell-recomputed, F := exact CIE-overcast x cos
  integral over the SAME soup/BVH as the shell pass (boundary + occluders, glass x T per pane), with a FIXED direction set shared by
  all cells (no per-cell jitter: neighbours integrate the same directions, so residual error is smooth, not speckle). The bent normal
  (zb) is rebuilt from the same rays. Replaces the lattice value there (raise AND lower). Deeper cells keep the lattice.
- ORIGIN: the cell centre can sit inside fattened geometry; start rays from the nearest free point (cell centre nudged out along the
  open side, as the shell pass does or better) — measure how many cells start inside geometry and log it.
- RAYS: choose N (fixed set, e.g. 128-256 stratified by the integrand) by measurement: residual |F - E_truth| on §LIGHT_GRID points and
  skyJump must beat v1501; log Hospital build time (expected tens of minutes once per bake — acceptable, it is baked).
- SWITCH &skyexactall=0 / APP._stillSkyExactAll=false (enters the §ZONE_IDB_CACHE fingerprint). § line §SKY_FIELD_EXACT_ALL: cells,
  rays, ms, us/ray, startedInside, raised/lowered counts (> 0.005), mean |dF|.
- WITNESS: (1) §LIGHT_GRID extended with WALL points (1.2 m above each floor point, first wall hit along +-x/+-z within 3 m, normal =
  the wall's) + zoneFlip wall-between ray; before/after on Hospital, HHS, Terminal, Clinic: skyOver/skyUnder/skyJump/medAbsDF all drop
  vs v1502, whole building. (2) walle.js at Hospital …010578 core face: F within +-0.01 of E, no patch. (3) §FAULT / glassReflDark
  unchanged at Clinic …495545980 and the Hospital/Terminal controls. Then re-bake the 4 sidecars (bake.js), restorecheck PASS each,
  FF look, push. Local only — no OCI.
- HHS STAIR LIGHT (red1 "staircase doesn't block the light"; …662836953, stair.js §STAIR_GRID 48x27, :8624 v1502, OOM 0): 49 floor points
  under the stair flight (up-ray hits IfcStairFlight 2x4PKs… / stair slabs 2dAUCO…, 2oD5kL… at 2-3 m): 19 are zone 0 (OPEN) with F 1.0,
  Lf 220-228, exact sun ray blocked 4.6 m; 30 are zone 57, F ~0.02, Lf ~146; control under slab 3XrBtx…: F 0.01-0.03, Lf 120.
  CAUSE (code): field() sets G = 10000 (F = 1) for every open cell (zone 0) whatever sits overhead; stairs are not BOUNDARY classes, so
  the column under a free-standing stair stays open. Sun shadow is right; the SKY term is the leak. Same class: any outdoor surface
  under a canopy / overhang / beam. Added to the §SKY_FIELD_EXACT_ALL agent's scope (open read cells get exact F). The stair.js class
  lookup returns null on HHS (A.metaByGuid lacks it) — use guids.
- CLINIC v1502 (red1 "look very good", local db + sidecar): …662912403 / …662965285 / …662987583 / …663038659: unlit 0 on all
  (15-144 samples), irOnly 0, hueNoise 0, blown 0.06-2.96 %, dark 0-0.23 %; exterior …662912403 glassReflDark 3/47. FAULT flag again
  only from glassLow = 1. Baseline for regression after §SKY_FIELD_EXACT_ALL.
- HOSPITAL EXTERIOR BASELINE (red1 "best angle shot, the reflection play kills it", …664322668, v1502 local db, low camera
  [41.8,-10.5,-50.8]): §FAULT OK (first all-OK Hospital exterior of the session), glassReflDark 0/67, glassReflOpen 12 (Z26 table
  decided), blown 0.01 %, dark 0.16 %, hueNoise 0. Also …663408931 (red1: glass "reflective and see-thru at realistic returns"):
  glassReflDark 2/59, open 5, blown 0, dark 0.12. Regression controls for §SKY_FIELD_EXACT_ALL (glass gates read the field).
- RULING (red1 2026-09-29 PM): let the running §SKY_FIELD_EXACT_ALL agent finish gracefully; after its report assign NO further
  agents (red1 resting). Parent only reviews the report + records it; no look FF / OCI without red1.
- NOTE — GLASS MUST REFLECT THE BUILDING'S OWN SHAPE (red1 2026-09-29: "glass reflection should also take into account building shape
  is reflected. In Hospital its wing is not reflected in the glass wall, but the unobstructed skyline. The wing should be the
  obstruction."). CODE-READ CAUSE (not yet measured): §GLASS_ENV (glass_fresnel.js:92-97) captures ONE cube map from the CAMERA
  position and uses it as every pane's envMap. A cube map assumes reflected things are infinitely far, so a pane's reflected ray is
  looked up by DIRECTION from the camera, not traced from the pane: a wing 20-40 m from the pane but off the camera's line in that
  direction reads as the sky beyond it (parallax error). §GLASS_REFL_OPEN (Z26) only scales the reflection brightness
  (T x rho_hit x F_hit) — it knows the wing blocks, but not what it looks like. CANDIDATE FIXES (to measure, cheapest first): (a) the
  Z26 table already stores per pane side whether the mirror direction is blocked — where blocked, tint the reflection toward the
  blocker's lit colour instead of the env sample; (b) parallax-corrected (box-projected) env per facade / per wing; (c) screen-space
  reflections for panes whose reflected ray lands on screen; (d) ray-traced reflections from the pane against the shell BVH at a
  reduced resolution. WITNESS idea: at red1's Hospital exterior poses (…663408931, …664322668), per glass sample, exact reflected ray
  from the pane -> hit class (wing IfcWall/IfcPlate vs sky) vs what the env lookup returns; count "sky shown where geometry is hit".
  ILLUSTRATION (red1 still …667308830, v1502 local db, cam [-21.39,7.57,41.34] tgt [-1.61,-3.24,-0.31], Hospital courtyard): the
  right-hand glass wall faces the opposite wing at a grazing angle, yet its panes show a pale sky gradient, not that wing's facade.
  The still's own check is BLIND to it: §FAULT OK, glassReflDark 0/263, glassReflOpen 7, blown 0.33 %, dark 0.05 % — glassReflDark
  judges darkness, not WHAT is reflected. The witness above ("sky shown where the exact reflected ray hits geometry") is the missing
  counter; this pose is its first test case (expect most right-wall samples to hit the opposite wing within ~20-40 m).
  NOT STARTED (red1 resting; no agent assigned).
- GLASS IN FILMS (Alt+C) — code-read 2026-09-29 (red1: "will the glass reflection feature be in alt-c?" -> "of course"): films get
  §GLASS_FRESNEL (effects.js:4570, via &filmparity default on, effects.js:4208) but NOT §GLASS_ENV (scene cube capture, skipped when
  A._maxqActive, effects.js:5990 — film panes mirror the sky HDRI only) and NOT §GLASS_REFL_OPEN (sourced-light staging never runs for
  films, sourced_light.js:847). PLAN (for the Alt+C lane, ALTC_FOUNDATION.md): reuse the baked Z26 per-pane table in films (camera-
  independent, already in the sidecar) + the wing-reflection fix above FIRST, so films do not inherit the sky-for-wing error; a per-frame
  scene capture is a per-frame cost to measure before adopting.
### ▶ RESUME HERE — §SKY_FIELD_EXACT_ALL (paused 2026-09-29, Opus agent; red1 "pause gracefully")
- CODE: bim-ootb fix/lfdb-v1501 @a62c261d (pushed; sw v1503, light_zones.js?v=23). NOT on look/combined-0925, NOT on OCI.
  light_zones.js field(): after the shell pass, every target cell gets F := mean T over ONE fixed 256-direction set (16 x 16, mu
  from the CIE x cos CDF at stratum centres, azimuth rows golden-ratio rotated), same soup/BVH as the shell pass; targets =
  covered READ cells (Chebyshev <= 2 of SOLID, not shell) + covered cells beside an OCCLUDER cell + OPEN cells under (<= 6 m,
  plan +-2 cells) or beside an occluder (the HHS scope addition). Occluder cull off under the pass. Start points enclosed by
  >= 2 opposite axis pairs within 0.3 m are nudged past the nearest face. Supersedes §SKY_FIELD_EXACT (logged 'superseded').
  Switches: &skyexactall=0 (= v1502 field), &skyexactalln=N, &skyexactallshell=1 (measurement: redo shell cells) - all in fp.
- BUILD COST (§SKY_FIELD_EXACT_ALL lines): Clinic 173,474 cells 44.4 M rays 134 s (2.96 us/ray); HHS 165,125 cells 42.3 M rays
  188 s; Hospital 1,146,922 cells (777,991 read / 139,608 near-occluder / 229,323 open) 293.6 M rays 1,994 s = 33 min (6.63
  us/ray), startedInside 1,688 (nudged 1,669, unresolved 19). N=128 (Clinic): half the time, slightly worse (floor over 33 vs 27,
  jump 13 vs 10, walls 16/3/5 vs 12/3/1) -> N = 256 kept. RISK: an UNBAKED first press pays this (Hospital 33 min > the 900 s
  §GI_WAIT_BUDGET cap) -> OCI buildings need the sidecars before this ships beyond local.
- WITNESS 1 (§LIGHT_GRID v2, lightgrid.js with WALL + OPEN points; truth = BVH over EVERY visible mesh, 256 rays, glass T per pane;
  over/under/jump/medAbs/meanAbs; FLOOR E at +3 cm, E25 at the field height +0.25 m; WALL truth Eh = field integrand at p+0.25n):
| log | FLOOR(E +3cm) over/under/jump/medAbs/meanAbs | FLOOR(E25 field height) over/under/jump/meanAbs | WALL over/under/jump/medAbs/meanAbs | WALL vs En over/under/med | OPEN over/under/jump/meanAbs | OPEN underSomething n/over/F1 |
| Clinic_v1502.log | 17/90/12/0.0000/0.0032 | 13/94/12/0.0031 | 8/23/1/0.0000/0.0019 | 25/32/0 | 151/0/0/0.1127 E25 138/0/0.0984 | 7/7/7 |
| Clinic_sa256.log | 45/6/12/0.0000/0.0019 | 27/4/10/0.0015 | 12/3/1/0.0000/0.0017 | 45/18/0 | 45/1/28/0.0428 E25 38/1/0.0293 | 7/5/5 |
| Hospital_v1502.log | 12/312/3/0.0000/0.0081 | 7/282/4/0.0080 | 32/73/3/0.0000/0.0059 | 67/129/0 | 878/0/0/0.3877 E25 811/0/0.3748 | 137/136/137 |
| Hospital_sa256.log | 45/8/2/0.0000/0.0029 | 13/3/1/0.0022 | 44/11/3/0.0000/0.0036 | 105/64/0 | 63/67/26/0.0674 E25 49/32/0.0436 | 137/16/0 |
| HHS_Office_Federated_v1502.log | 9/485/46/0.0064/0.0162 | 12/385/57/0.0146 | 114/86/1/0.0037/0.0219 | 146/231/0.0101 | 306/0/0/0.1638 E25 303/0/0.1602 | 104/104/104 |
| HHS_Office_Federated_sa256.log | 7/23/32/0.0030/0.0074 | 7/2/28/0.0053 | 157/13/1/0.0030/0.0116 | 183/158/0.0081 | 137/0/34/0.0683 E25 134/1/0.0648 | 104/30/15 |
| TerminalMerged_v1502.log | 27/297/25/0.0000/0.0090 | 22/300/25/0.0090 | 88/139/3/0.0000/0.0372 | 118/108/0.0016 | 234/24/33/0.1550 E25 231/24/0.1471 | 85/83/83 |
  FINDINGS: (a) skyUnder collapses everywhere (Hospital floor 312 -> 8, HHS 485 -> 23, walls 73 -> 11 / 86 -> 13); open floors
  under something F = 1 -> exact (Hospital 137/137 F1 -> 0). (b) the REMAINING skyOver is NOT the pass: against the same truth
  restricted to the soup's opaque set AT THE STENCIL CENTROID fieldRead really samples (§LIGHT_GRID_STENCIL, DIAGC=1) Clinic floor
  over 25 -> 1 (meanAbs 0.0011), HHS walls over 44 -> 2 (meanAbs 0.0051). Causes: fieldRead's stencil skips the SOLID (fattened)
  texels, so a floor samples at +0.43..0.59 m (median), a wall 0.45 m out, not 0.25 m; plus MEP/furniture not in the soup
  (opaque-set step 2). (c) vs the wall's own normal irradiance En, walls beside windows now read F 0.15-0.19 where En ~ 0 (HHS
  WALL vs En over 146 -> 183): the scalar, normal-agnostic field cannot light a pier/reveal correctly; before, the lattice
  under-read them to 0 by accident. Next lever = a directional field or a normal-aware stencil, not more rays.
  (d) open cells beside boundary walls only (facades, courtyard floors) are NOT targets (the hemisphere w already halves a facade;
  exact F 0.25 m off a facade ~0.5 would double-count): Hospital open floors still over 63 (mostly facade/courtyard feet).
- HHS OPEN-CELL SCOPE ADDITION (parent 2026-09-29): DONE. §STAIR_UNDER (stairpts.js, parent's 49 §STAIR_GRID points): the 19
  zone-0 points under stair flight 2x4PKsKvfDM97UO7ZhjXbT: F median 1 -> 0.0034 (min 0, max 0.0286), truth E 0.0029, stillF1 0
  (control &skyexactall=0: median 1, 14 still F 1). The 30 covered points under stair slabs: F 0.0212 -> 0.0045 vs truth 0.0146 /
  E25 0.0176 = now UNDER by ~0.01 (not diagnosed: stencil height / soup vs truth there). The pixel-level stair.js re-press (Lf) NOT run.
- BAKES (bake.js, key e74a50fe:154742, fresh profile): Clinic 0.40 MB (raw 22 MB) field 147 s, restorecheck PASS 26 ms; HHS 1.34
  MB field 222 s, restorecheck PASS 24 ms. Sidecars in /tmp/wt-lfdb/buildings/patches at pause: Clinic_meta.db.lightfield.bin
  404,584 B key e74a50fe:154742 (v1503, PASS) · HHS_Office_Federated_extracted.db.lightfield.bin 1,341,914 B key e74a50fe:154742
  (v1503, PASS) · Hospital_meta.db.lightfield.bin 5,777,760 B and Terminal_meta.db.lightfield.bin 3,193,668 B are the OLD v1502
  bakes (key 6cf4c681:142097) = STALE under v1503: the viewer logs '§LIGHT_FIELD_DB stale' and rebuilds (Hospital ~33 min).
  Terminal bake ABORTED mid-build at red1's request (bake.js 'FATAL Target closed', no sidecar written — expected). Hospital NOT baked.
- NOT DONE (exact next steps, in order): (1) Terminal: `flock /tmp/claude-1000/gpu.lock node <probes>/bake.js 8663 Terminal`, then
  mv buildings/patches/Terminal_extracted.db.lightfield.bin -> Terminal_meta.db.lightfield.bin, then restorecheck.js 8663 Terminal
  (or BLDS=Terminal ./bakeall.sh, which does all three); (2) BLDS=Hospital ./bakeall.sh (~35 min)
  -> rename to Hospital_meta.db... (bakeall does it) + restorecheck; (3) Terminal after-grid: BLDS=Terminal SUFX=_sa256 ./base.sh
  (reads the sidecar), then python3 summ.py lg/*.log; (4) walle.js at Hospital …010578 core face: PX=hp/px_core.json node walle.js
  8663 ~/Downloads/bounce_still_1790661010578.png (fresh profile reads the Hospital sidecar), compare to &skyexactall=0; (5) §FAULT
  controls: diag.js with URLDB=../buildings/<bld>_extracted.db at Clinic …495545980 (glassReflDark 2/44 before), Hospital
  …598818184, Terminal …622137170, default vs Q=&skyexactall=0; (6) record the results here, then the parent FFs look + OCI.
  Every run through flock /tmp/claude-1000/gpu.lock; grep 'Uncaptured WebGPU' (all runs so far: 0).
- PROBES: prompts/photoreal_probes/lightgrid/ (lightgrid.js v2, walle.js (+Eh, 256 rays, PROF/Q), stairpts.js + stairpts.json,
  diag.js (+URLDB, SW bypass), bake.js, bakeall.sh, restorecheck.js, base.sh, summ.py, key.js; lg/*.log = every § line quoted
  above). Run them from a copy in a scratch dir (they write lg/ and prof_<port>/ next to themselves). Probes bypass the service
  worker (a persistent profile served the v1502 light_zones.js from the SW cache until setBypassServiceWorker — cost one run).
- TRUTH CACHES: ~/.cache/bim4d/light_grid/Clinic_16071.v2.json, Hospital_63182.v2.json, HHS_Office_Federated_6839.v2.json,
  TerminalMerged_48428.v2.json (v2: pts / walls / opens / flip, E, E25, Es25, Esh; v1 files kept). Truth v2 cost: 12-15 s per
  building (BVH, 5.9-8.6 us/ray vs 11 ms/ray raycasts before). zoneFlip wall-between test: Clinic 459/462 walled, Hospital
  25/25, Terminal 65/65, HHS 403/503 walled (100 open flips, all irStep).
- Pre-existing, not from this change: witness_z19_ir_colour.js FAILS 1 row on HEAD too ("alb joins the zone record KEYS").
- RULING (red1 2026-09-29 eve, after v1503 Clinic stills "indoors spotty"): TEST EACH CASE TO ZERO BEFORE DOING FURTHER, to conserve
  cycles — one building / one defect at a time; no batch bakes or multi-building chains while a known defect is open. Chain stopped:
  Terminal v1503 sidecar baked 16:51 (4.18 MB, restorecheck NOT run), Hospital v1503 bake killed (old v1502 file stays, stale).
- CLINIC v1503 SPOTS (red1 …673812371 / …673796302 / …673780207, :8663 v1503): mottled corridor floor, cloudy bulkhead + back walls;
  §FAULT clean (unlit 0, dark <= 0.01 %) — blind to it. Measuring: diag LEAKPX 26x18 on vs &skyexactall=0 + walle exact E at the same
  pixels (sfa/cs/).
- CLINIC SPOTS RESULT 1 (…673812371, 26x18 LEAKPX + walle exact E, :8663, OOM 0): the SKY FIELD IS NOT THE CAUSE here. v1503 / v1502:
  mean |F - E| 0.0019 / 0.0013, over(>0.02) 0 / 0, under 0 / 2 (n 468); neighbour pairs with |dLu| >= 15 (the spots) 106 / 89 of
  420; floor Lu p10/50/90 127/145/156 vs 130/154/163. Sky ~0 in this corridor and right in both. Next: lamps on vs &sourced=0 with
  &meter=0 (fixed exposure) at the same pixels (cs/lamps.sh), after the floor-corner check (cs/corner.sh).
- CLINIC FLOOR-CORNER BANDS (red1 "floor corners bandish", toilet still …673908384, LEAKPX 18x10 floor grid, v1503 vs &skyexactall=0,
  OOM 0): F = 0 at every floor point and on == off -> NOT the sky field. The cubicle floor is zone 141 (Lu 63-80, smooth), but points
  hugging the partition base resolve to zone 130 (the neighbouring cubicle) and read Lu 36-59 -> lamps are zone-bound, so a point
  given the wrong zone gets the neighbour's lamps = the dark corner strip. SAME CLASS as TERMINAL_CORNER / Castle speckle / §LIGHT_GRID
  zoneFlip (surfaceInfo's eye-side 0.5 m cell lookup crossing a thin partition). Fix target: surfaceInfo (the zone of a surface point
  must be the room the SURFACE faces, decided by an exact ray / the geometry, not the nearest cell) — witness = zoneFlip with wall test.
- CLINIC SPOTS RESULT 2 — INCONCLUSIVE, instrument flaws (cs/lamps.sh): (1) &meter=0 left the corridor at median Lu 13/255 (base
  exposure) -> no jumps measurable, the 'lamp' arm proves nothing; (2) &sourced=0 is NOT lamps-off, it swaps the whole lighting
  pipeline (§SOURCED_LIGHT not installed) — it still shows 81 relative jumps > 0.15 vs 84 with v1503; (3) the 26x18 neighbour-jump
  counter mostly counts OBJECT EDGES (60/84 are pairs of different wall elements; 3 on the floor) — coarser than the mottle.
  NEXT (proposed to red1): dense 8 px floor-only sampling, same element + zone, high-pass residual (the mottle), one term off at a
  time without switching pipelines (lamp dial / &aoindirect=0 / bounce toggle), same exposure within each A/B.
- CLINIC SPOTS RESULT 3 (dense 8 px floor-only, 2,219 points, residual vs same-element same-zone 5x5 mean, relative; sfa/cs/mottle.py,
  OOM 0): default Lu p50/p90 0.016/0.047 (>0.05: 197) · &lamps=0 0.058/0.233 (1,214; Lavg 4.7 cd/m2, exposure 1011) · &aoindirect=0
  0.018/0.055 (264). Lf ~ Lu (bounce adds little: 0.017 default, 0.078 lamps-off). => lamps are NOT the source (they mask it);
  indirect AO is not the cause; the mottle is in the NON-lamp light. With sky ~0 here the candidates are the ground-view field
  (§GROUND_VIEW_FIELD, a 0.5 m lattice like the sky one) vs the zone fill (flat per zone, unlikely). Running: &lamps=0&groundview=0 and
  &lamps=0&ir=0.
- CLINIC SPOTS RESULT 4 (OOM 0): &lamps=0 p50/p90 0.058/0.233 · +&groundview=0 0.056/0.218 (ground-view field RULED OUT) · +&ir=0
  0.217/0.842 (frame Lu median 21 — too dark to trust). CORRECTION: the relative residual inflates at low brightness (one 8-bit step
  = 1-5 %) and the lamps-off frames are auto-exposed up to x1011 (render noise amplified), so "lamps-off 4-5x worse" is partly the
  instrument. Reliable arms (normal exposure): default 0.016/0.047 (~+-2 / +-7 levels at Lu 146), &aoindirect=0 0.018/0.055. Also the
  5x5 (~40 px) local-mean residual mostly measures fine grain; red1's cloudy patches are ~0.5-2 m. RULED OUT: sky field, ground-view
  field, indirect AO; lamps mask, do not cause. OPEN: floor env specular (envMapIntensity), §GI_REDISTRIBUTE, refine/soft-shadow
  noise — measure at the 0.5-2 m scale (band-pass on the final floor pixels), normal exposure only. Parent's recommendation to red1:
  park this and do the explained zone-assignment fix (floor-corner bands / TERMINAL_CORNER / Castle speckle) first.
### §ZONE_EYE — SPEC + FIRST WITNESS (2026-09-29 eve, red1 "yes" to the zone-assignment fix)
- RULE: the room of a VISIBLE surface point = the first non-solid cell stepping back from it along the eye ray (0.25 m x 12 = 3 m);
  none -> the old nearest-eye-side-cell rule. The eye ray reached the point through that air, so it cannot cross a partition.
  Shader slFragZone (sourced_light.js), switch uSLOrg.w (spare slot) = &zoneeye=0 / APP._stillZoneEye=false, § line §ZONE_EYE.
  CPU mirror surfaceInfo(p, n, eye) written then REVERTED for now: any light_zones.js edit changes the field key (hash of the whole
  file) and invalidates every baked sidecar — shader-only test first. OPEN: key the field on field-relevant code only.
- WITNESS toilet …673908384 (px_corner 18x10, :8663, OOM 0, shader errors 0): 6-step walk fixed 2/5 strip points (39->57, 44->64);
  eyewalk.js showed the other 3 stay SOLID for 1.5 m (view down past the 0.5 m-fattened partition) -> 12 steps: all 5 resolve to the
  cubicle zone 141 and read 62/67/57/72/64 vs own-floor neighbours 65-75 (were 44/47/39/59/44). 45/180 grid points changed; 11 darker
  = the partition's own face + top (z -8.6) now lit by the camera-side room it faces (was the cubicle behind it). Running: Terminal
  corner …621233765 on vs &zoneeye=0 (wall 3Q026pUy1CnxmrPEZ8YbBE).
- ✅ WITNESS 2 Terminal …621233765 (48x26, local db + v1503 sidecar, OOM 0, shader errors 0): wall 3Q026pUy… strip (14 points, old
  zone 70) Lu 68 -> 172 (range 171-181) vs the rest of the wall (723 points, zone 1) 185 -> 185; frame 18/1248 changed > 5, 0 darker.
  COMMITTED bim-ootb fix/lfdb-v1501 @85b9f303 (sw v1504, sourced_light.js?v=71), pushed; :8663 serves it. NOT on look / :8624.
- BLOWOUT FACTOR REVIEW (red1 2026-09-29 eve: "some blowout factor influencing the lighting that needs to be reviewed"). FROM EXISTING
  LOGS, no new render (§METER tag=final, §GI_STILL result): the auto-exposure normalises every still to frame mean ~106-122 whatever
  the scene light: Terminal ext Lavg 8,422 cd/m2 -> +0.56 stops over base; Clinic ext 4,345 -> +1.51; Hospital stair hall 135 ->
  +6.52; Hospital hall 56 -> +7.78; HHS room 51 -> +7.92; Clinic corridor …673812371 (red1's "spotty") 16.5 -> +9.55 stops (x750).
  => in dim interiors every residual error (field noise, flat fill, bounce blotch) is amplified ~x750 — the corridor with the most
  gain is the spotty one (consistent, not yet proven causal). GI is not the blowout (composite vs app mean 4-8 levels).
  LIGHT LOST IN THE CHAIN: same press §LUX_CHECK_CAM zone 27: sky 112 + lamps 191 = 303 lx predicted -> ~48 cd/m2 on a rho 0.5 floor
  (L = rho E / pi); meter measured 16.5 cd/m2 = ~3x less. §LUX_CHECK withEN=0 unknown=439: NO zone has a room use / EN 12464-1
  target yet. REVIEW ORDER (measure before change): (1) trace predicted lux vs rendered L at the same points in the Clinic corridor
  (lamp term, sky term, albedo, meter) to find the 3x; (2) exposure rule — cap, or meter against the room's design level, so dim rooms
  stay dim; (3) room use -> EN 12464-1 lamp targets. After the Clinic spot case closes (one case at a time).
RULING (red1 2026-09-29): precomputed light results (field + §SKY_FIELD_EXACT + glass-open etc.) go into the LOCAL copies of
  the OCI building DBs first (buildings/patches/<bld>.sql + self-heal loader, applied and witnessed on localhost); post to OCI only
  after the numbers stop moving — mistakes and debug iterations stay local.
ALSO OPEN (order red1 approved): lamp overhead shadow map fix/lamp-shadow @295ac63f (batch: scratchpad run_lampsh.sh + table_lampsh.js),
  room-use -> EN 12464-1 lamp targets (Sonnet), light-field DB persistence fix/light-field-db @98677577 (witness unfinished) + OCI SQL
  patches, then Alt+C film law S4.

## ▶▶▶ §DEV RESUME 2026-09-28 ("resume alts live") — START HERE
2026-09-28 PM (after reboot; /tmp wiped, diag6.js + uncommitted &aolamps=0 LOST; worktrees rebuilt, DBs symlinked, :8624 look / :8662 hot):
- ✅ §FAULT_TORCH_EXEMPT (95608fa7, v1488): red1 exterior stills …582731985/…582785182 FAULT extLightsDay=1 = cam_torch (probe listed it). Torch exempt like _camLight, logged torch=1. Re-press: §FAULT OK both.
- ✅ §GI_REDIST_EVIDENCE (v1489): red1 HHS still …583845329 black ceiling corners = §GI_REDISTRIBUTE removing zone IR where screen-space SSGI saw nothing (bounce~0, AO~1). Now IR removed x (1-AO_ssgi). At that pose: dark 1.29%->0%, composite mean 104.2->122.8 (app 130), meanAbsDiff 25.5->7.6 (add-only 0.04). Hospital interior …582878311: dark 0%, meanAbsDiff 4.2.
- Probe harness: scratchpad diag.js (PNG tEXt pose -> fresh page -> Alt+S -> § lines + light culprits); env OUTD/SUF/Q.
- OPEN(1) §CONTACT_BOUNCE RESULT (v1489 + &aolamps=0 A/B switch in /tmp/wt-hot sourced_light.js, AOP[1]): floor pixels with an
  opaque hit within 1.5 m straight up ("under") vs open floor, grid 24 px, luminance ratio under/open. def runs of cafe + Hospital were
  OOM-contaminated (Z14 agent sharing the card: 485 / 1392 WebGPU OOM lines) -> discarded; clean rows:
  | pose | app ratio aolamps ON | app ratio OFF | final ratio redist ON | final ratio &giredist=0 |
  | cafe …366920 (n 114/1222) | 0.858 | 0.870 | (OOM) | 0.860 |
  | stair …426486 (n 4/321, thin) | 0.904 | 0.911 | 0.802 | 0.900 |
  | Hospital int …582878311 (n 37/487) | 0.742 | 0.757 | 0.719 (aol0 run) | 0.735 |
  => §AO_LAMPS darkens under-furniture floor only 1-2 % (hypothesis CONFIRMED: LightLaw.AO radiusM 0.5 cannot see a 0.74 m table top).
  §GI_REDIST_EVIDENCE adds 2-11 %. PROPOSAL (not built): a SECOND N8AO buffer for the lamp term only, radius >= furniture height
  (indirect AO stays 0.5 m = the field cell, so no double count); cost = a second AO accumulation per press.
- ✅ Z14/S4 §GI_CARRY (b690eec7, v1490, Fable agent + parent witness): kept WebGPU bounce RT held the previous press when a pass was
  dropped by WebGPU OOM (shared 8 GB card) -> pasted onto the next still. RED: ext mask = int mask to the digit, meanAbsDiff 41-48 vs
  fresh 4.7. GREEN (OOM 0): Terminal int->ext OK 4.29; Hospital int->ext OK 2.73; forced drop (__GI_STILL_INJECT_GEOM_DROP) -> STALE +
  released + §GI_STILL_FAIL, next press OK 4.75 (fresh 4.72); same pose twice OK. hueNoise>0 not re-measured (INCONCLUSIVE, same mechanism).
  LESSON: two GPU probe streams on the card at once = OOM = false defects. Serialize every headless GPU run: `flock /tmp/claude-1000/gpu.lock node …`.
- Z25 MEASURED (§FIXTURE_PIXELS, diag.js FIX=1, HHS pose …583845329): every fixture pixel = emissive ffe4b5 x 0.3 = 6818 cd/m2
  (x luxPer 22727) at exposure 92.9 (meter 51 cd/m2) -> 944/955 samples clipped white; faces down 539 / side 379 / up 37 ALL glow —
  the whole fixture mesh emits, housing included (audit #43 UNSOURCED). Hospital interior pose: 0 fixture pixels in view.
  Z25 SPEC: (a) only the EMITTING face emits — the face §LAMP_SHAPE_FACE already picks per geometry hash (plan = bottom, -Y local;
  xy/zy = the elevation, either sign); housing emissive 0, lit like any surface. (b) face luminance L = Phi / (pi x A_face) in the
  one calibration (emissive = L / luxPer), Phi = the fixture's own lamp flux as §LAMP_EN/lamp data already carry it, A_face = the
  hull area _fixtureFaceFill computes; no flux -> keep 0.3 and log it UNSOURCED. (c) § line §FIXTURE_FACE per press: fixtures,
  faceEmit / housingDark counts, L range cd/m2, clipped% of fixture pixels. Witness: §FIXTURE_PIXELS side/up buckets -> 0 emissive
  where the face is plan; blown% of the whole still drops; fixture faces may still clip (a real camera clips a 3000+ cd/m2 face 6 stops over).
- Z26 MEASURED (§GLASS_DARK_CENSUS, diag.js GLASS=1, Clinic ext still …495545980 cam [39.743,7.291,-6.397], v1491, OOM 0):
  64x36 grid, 159 glass hits: 24 dark by the binary mirror gate (25 by §SPEC_SMOOTH — the §FAULT counter uses binary, the shader smooth;
  same verdict here). Dark panes render lum median 3.5 vs 89 for the rest (near-black). ALL are vertical clerestory panes (n.y 0) stepping
  down the roof at x 4.28 / 10.67 / 16.95 / 23.44 — NOT flat roof glass. The mirror-ray march (0.25 m x 32, SOLID after 1 m -> base F)
  meets opaque cells 0.25-2 m out (trace e.g. `G 188* 188* 188* S S S 0 0 …`: glass, covered sky-lit zone 188 (eave), opaque, open),
  but a real three.js raycast along the SAME reflected ray hits NOTHING within 60 m for 6 of 8 traced samples (2 of 8 hit a wall at
  0.53 / 3.18 m = real). Nearby instances are all visible (no hidden-batch voxels); classes near: IfcRoof standing-seam, exterior
  IfcWall, mullions (IfcMember, not rasterised). => false blocking = 0.5 m voxel thickening of eave/roof edges grazing the reflected
  ray (Z23 class). The gate then falls back to sky-view F ~0 -> no reflection -> black pane.
  Z26 SPEC (fix direction, exact against geometry, build-time): per glass cell, a CPU reflection-openness computed ONCE at zone build
  by real raycasts against the boundary+occluder meshes (a small cone of mirror directions about the pane normal, e.g. the lattice
  FIELD_DIRS in the outward hemisphere), stored beside glassT; the shader/specVis use it for glass cells instead of the voxel march
  (the march stays for opaque specular). § line §GLASS_REFL_OPEN per build: glass cells, mean/min openness, ms. Witness: this pose's
  dark count 24 -> ~2 (the two real walls), dark-pane lum up, other glass unchanged; Hospital/Terminal glass counts unchanged.
- ✅ Z24 §GROUND_DOOR_CHECK (v1494, look FF'd): rule = the picked ground slab must be one its storey's own doors stand on; door-sill
  mode (0.25 m bins) > 1.0 m (the slab filter's thickness bound) below it -> largest slab of that storey whose bottom is within 1.0 m
  under the doors. sqlite3 fleet (10 DBs) + live §GROUND_Y (7 buildings, flock'd): only HITOS moves 27.63 -> 24.15 (62 u.etg doors at
  24.25); Clinic/Terminal/LTU/Hospital/HHS/Duplex "consistent". Door-level-only rules REJECTED by the fleet: lowest GF cluster chains
  storeys (LTU 2.40->0.70, Terminal 14.72->13.99). NOTED not changed: Clinic ground -1.37 is a 192 m2 sunken GF slab while 145 doors
  stand at 0.00 (doors ABOVE the plane, outside this rule's direction) — raise only if red1 reports Clinic ground.
- Z23(b) RE-MEASURED on v1494 (§SPECKLE, diag.js; red1's Castle stills …541575336 / …541605417 read from ~/.local/share/Trash, not
  restored; OOM 0): hueNoise 528 / 158 (red1, v1464) -> 0 / 0 now (§GI_CARRY-era). Isolated dark px (L<=20, 8-neighbour mean >= +45) in
  the final: 108 / 205 (app frame 259 / 194) = 0.01 % of the frame. Sampled 40: 39 on axis-aligned faces, surfaceInfo resolves them to
  an INTERIOR zone (18/20/30) with sky-view F 0-0.001 — mostly IfcWindow jamb/reveal faces (n = -x) in the wall opening seen from
  OUTSIDE (cam [-13.8,0.6,-14.9]): the 27-cell nearest-eye-side search lands in the room behind the opening. Same class as Z26
  (0.5 m lattice at thin elements). NOT built: fix after Z26's build-time exact-raycast mechanism lands (extend it to reveal faces:
  a surface whose eye-side lookup crosses a window cell takes the open side), else two agents collide in light_zones.js.
- ✅ Z25 §FIXTURE_FACE (Fable agent 34329ab7 v1492, merged into look v1495): per-vertex aFixFace (batched ranges) / aFixInst (instanced)
  + one uniform uFixFace (1 in the still, 0 at teardown: nav/films unchanged). Face per §LAMP_SHAPE_FACE; emissive = 4 I / A_face
  (Phi = 4 pi I luxPer of the omni lamp the shader already lights with, L = Phi/(pi A)); non-luminaires on a glow material (HHS: 315
  IfcFlowTerminal diffusers) emissive 0 (&fixnonlum=0 A/B; &fixface=0 whole fix off). HHS pose: housing clipped 95.8 -> 0 %, diffuser
  99.2 -> 0 %, face 96 % (a real face 6.7 stops over the meter), whole-still blown 2.37 -> 0.5 % (parent smoke on merged look: 0.5 %,
  OOM 0). Hospital: housing meanL 250 -> 132. RULED (red1 2026-09-28 21:15, after viewing stills): "lighting fixtures treatment as it is,
  is very nice now" -> KEEP 4 pi (omni, as lit); the pi/Lambertian face is NOT to be applied. red1's standing goal the same day: predict
  real-life optics (design, surfacing, daylight, interior lighting) with standard expected settings.
- HHS_LEAK (red1 21:30 "HHS still has some mishaps in enclosed room", still …601892033, v1495; diag.js LEAK=1 + HEMI, OOM 0):
  closed room zone 92, sun blocked at every sample. Floor/wall band z 18.7-20.1 renders Lu ~200 / 165 vs ~123 / 106 beside it, and the
  ONLY input that changes is the sky-view field F: 0.027-0.044 there vs 0.003-0.005. Real raycasts (128 dirs, upper hemisphere) from
  the bright floor points: sky 0 %, through glass 0-0.8 % => the field sees sky that the geometry does not = a lattice leak (same
  0.5 m-lattice class as Z26/Z23). Handed to the Z26 agent (build-time exact rays can bound F by geometry).
- HHS_CORRIDOR_DARK (red1 "left corridor has too darkened walls in shadows, somehow its surface material maybe affecting lighting",
  still …601860293): MATERIAL RULED OUT — wall "Lamelle 11.5" IFC ≈ Grey rgba 0.502 -> linear 0.216 (Z9 sRGB decode), SAME as the
  corridor floor "Fliesen" 0.498. Floor = sun through the atrium glazing (Lu 193-201, F 0.12-0.22); wall = shaded by the corridor
  ceiling (sun ray blocked 1.8-3.3 m), F 0.05, Lu 15-25 (bounce pass 23 -> 29 only). Wall/floor linear ratio rendered ~1.5 %;
  view-factor estimate for a wall facing a sunlit floor strip 2-5 % => ~1-1.7 stops too dark. Likely cause: the floor->wall bounce
  is the zone-flat IR (zone 57 = the whole corridor wing) + a screen-space SSGI that adds little. OPEN: measure the sunlit-floor
  first bounce onto that wall exactly (raycast view factor x floor radiance) before any fix.
- §AO_LAMP_BUF (Fable agent, bim-ootb fix/lamp-ao @af16db95 v1497, NOT merged): second N8AO buffer at 0.75 m (EN 12464-1 desk
  reference plane, >= EN 527-1 type C 740 mm) for the lamp term only. RESULT Hospital int (OOM 0): under/open 0.745 -> 0.740 (-0.7 %),
  lamp buffer 0.898 vs indirect 0.908; cost +383 ms (24 frames). RAYCAST TRUTH (§LAMP_VIS, floor -> nearest 12 lamps, I cos/d^1.5):
  under/open = 0.18. => screen-space AO at ANY radius cannot reach it: n8ao counts an occluder only within 0.2 r falloff of the sample
  ALONG THE VIEW RAY (kernel, verbatim in the agent report). Radius is not the lever. &lampaof=5 run pending (halo check needed).
  STANDARD MECHANISM (recommended): a straight-down orthographic depth (shadow) map over the visible zone for the ceiling lamps as one
  broad overhead source, PCF kernel sized to the lamp spread, sampled by the lamp term — same shadow-map machinery as sun/torch.
  FULL TABLE (9/9 runs, OOM 0; table_lampao.js): under/open ratioApp base / 0.75m f1 / 0.75m f5 — Hospital 0.745/0.740/0.727
  (lamp buf 0.898 / 0.822; truth 0.18), cafe 0.869/0.863/0.837 (lamp buf 0.856 / 0.674; truth 0.33), stair (n=2) 0.896/0.891/0.853.
  Open floor unchanged in f5 (122.9 / 112.0 vs 123.1 / 112.6 — no halo). Cost 382 ms/press. Even f5 closes < 15 % of the gap to the
  raycast truth => fix/lamp-ao NOT merged; the overhead lamp shadow map is the path (awaiting red1 go).
- Z26 §GLASS_REFL_OPEN (Fable agent, bim-ootb fix/z26-glass-open @7d9252d6 v1496, NOT merged yet): per glass cell/side, exact rays
  (12 az x 25 el, 7.5 deg) at field build, blocker = its rho x field F; RGBA32UI uSLGO table; &glassopen=0 old march, &glassblock=0 literal.
  Clinic …495545980: census dark 24 -> 15, dark-pane lum median 6 -> 14, §FAULT glassReflDark 5/44 -> 3/44 (§FAULT now follows
  §SPEC_SMOOTH). 13 of the remaining 15 REALLY reflect a wall 1-5 m away (next sawtooth riser) — dim, not sky; v3 (blocker F from the
  near-side cell) pending. Build cost once per building per code version (IDB-cached): Clinic 10 s, Terminal 15.7 s, HHS 23 s,
  Hospital 54 s (+~11 s est.) — DECISION for red1: accept vs GO_RAY_BUDGET level 2 (~33 s). Hospital/Terminal: no regression seen.
  HHS_LEAK RE-JUDGED by the agent's lattice trace: the bright band's 7-8 lattice directions all pass the room's window glass (T 0.749)
  to sky, exact cone rays confirm; exact cosine hemisphere T-weighted 0.035/0.053 bright vs 0.023/0.023 dim, lattice 0.032/0.044 vs
  0.004/0.004 => the lattice is RIGHT at the bright points and 5-6x LOW at the dim ones (41-direction aliasing of a small window), not a
  leak. My earlier HEMI probe (uniform-elevation, glass-then-opaque counted blocked) disagrees -> INCONCLUSIVE until one method is used.
  Z23(b) reveal speckle: different mechanism (diffuse surfaceInfo lookup) — not extended.
  FINAL BATCH (all OOM 0 / linkfail 0 / pageerr 0; old march &glassopen=0 vs final): §FAULT glassReflDark Clinic 5/44 -> 2/44 (v3
  blocker-F), Hospital …196433 1/107 -> 0/107, Hospital …138871 0/75 -> 0/75, Terminal …725998 0/119 -> 0/119, Terminal …578781
  0/76 -> 0/76; §FAULT_GI dark % unchanged every pose. Hospital final build 66.7 s (level 2, 35053 sides). READY TO MERGE pending
  red1's Hospital first-press cost call (accept 67 s once per building per code version, IDB-cached, vs cap buried sides).
  ✅ MERGED 2026-09-29 (look FF to 7d9252d6, sw v1496; smoke OOM 0: Clinic glassReflDark 2/44, HHS blown 0.5 % = Z25 intact).
  Cost decided by parent per red1's standing direction (real-life optics first): accepted; OPEN = move the build off the press path.
- FE colour (red1 "fire extinguisher grey then red"): CLOSED, no defect — Terminal FE 1IJh$…SqX material 1.0,0.2,0.2 renders ff3333
  at load and after far/back camera moves; red1 confirmed "I was mistaken". Hospital has no FE elements (fire alarm panels 0.92,0.90,0.85).
- Lamp overhead shadow map DISPATCHED (Fable, bim-ootb fix/lamp-shadow, v1497): red1 2026-09-29 "is it required to achieve as I and
  others would expect?" -> yes (under-furniture 0.745 vs raycast truth 0.18); direction already given, so no further go needed.
- TERMINAL_CORNER (red1 "slight black blotch at a corner", still …621233765, v1495; LEAK grid 32x18, OOM 0): (a) the pure-black
  pixels (1.31 %, all x 1388-1665 y 89-572) = the IfcWindow frame, authored material 000000 — data, not a fault. (b) the dark wall strip
  left of the door (red1 PNG mean 69.6 vs 139.1 beside it): SAME wall guid 3Q026pUy1CnxmrPEZ8YbBE, same d3d3d3, but its last ~0.4 m
  before the corner resolves to zone 70 (Lu 74-84) while the rest is zone 1 (Lu 175-210) = surfaceInfo's 27-cell eye-side lookup
  taking the neighbour room at a corner — the Z23 lattice class (same as the Castle reveal speckle). Alt+S only: SourcedLight.stage
  never runs for films (sourced_light.js:847), so Alt+C does not show THIS; films carry their own lighting (pool lamps, no zones).
- TERMINAL_GROUND_SHADOWS (red1 "roof lets light blast thru, splats of shadow", still …622137170): ground pixels vs an exact ray to the
  sun (0,0.707,-0.707): 229/236 agree (dark <-> blocked); sunlit median 141 (min 112), blocked median 55, blockers 10-30 m away
  (the open-truss roof edge / overhangs). => the splats are real sun shadows of the geometry, not an anomaly; patchiness partly the
  ground's dirt texture. 7 disagreements = blocked-but-bright (penumbra / through glass / map resolution at 25 m).
- Z26 build cost follow-up (red1: "will it hog mem? cached? can't it be saved during saving to DB?"): built once, stored in the
  browser IndexedDB field record (Hospital record 113.8 MB incl. the rest of the field; glass table 11.1 MB GPU texture while a still
  is staged). PLAN: bake it offline at publish (same code, headless) as a per-building sidecar on OCI keyed to the code version; the
  viewer fetches it and only computes when missing — users never pay the 67 s.
- SUN_SHADOW_LEAK (red1 2026-09-29: "patchy light splashes in Hospital main hall winding stair surroundings / Terminal main hall
  cafeteria / HHS — too much interplay?"): Hospital …598818184 (v1496 replay, OOM 0) 40x22 floor grid: 23 floor points render Lf 200-230
  (median 128) with N.sun 0.71, yet the exact ray to the sun hits OPAQUE geometry 6-8 m up for ALL: 14x Level 2 slab 0e8pm26Tv5vPrj6zU55Mad
  (IfcSlab 150 mm concrete + metal deck, 98.9x90.6 m, BatchedMesh, castShadow true, visible), 3x cable tray, 4x UB beams. => the sun
  SHADOW MAP leaks through a slab the scene contains: a DEFECT, not correct interplay. Dispatched (Fable, bim-ootb fix/sun-shadow-leak,
  v1499) incl. Terminal hall …602379032 + HHS. Exterior Terminal …622137170 stays the control (229/236 correct).
- Light-field DB persistence DISPATCHED (Fable, bim-ootb fix/light-field-db, v1498): red1 "put it as part of the one time DB save;
  I can save the DB again as a silent_bake.db to test". Memory answer given: IndexedDB = disk, GPU 11.1 MB only while a still is staged.
- PRECOMPUTE LIST (red1 2026-09-29 "what else can be pre calculated during save"; Hospital first-press timings, bl/1790598818184_blk.log):
  camera-free (store per building, keyed to code version): §SKY_VIEW_FIELD 91.5 s (sweep 88.9), §GLASS_REFL_OPEN 66.8, §SKY_SHELL_RAYS
  16.0 (bvh 3.2), §GROUND_VIEW_FIELD 2.5 — ALL in the light_zones field record = fix/light-field-db scope (~177 s). NEXT (Sonnet):
  §MEP_SMOOTH_NORMALS 4.2 + §NORMAL_REPAIR 2.5 (bake into geometry), §BVH_DEFERRED 2.9, §GLARE audit 2.1, §COVE_LIGHT 0.6,
  §IRC_MAX faces 0.24, §SURFACE_ROOF_LAYER 0.3, §FIXTURE_FACE 0.2 (~13 s). Camera-bound (cannot): §STILL_REFINE 112, bounce GI 77,
  §SOURCED_LIGHT_CAP 7.8, meters ~2. Delivery to OCI DBs = buildings/patches/<bld>.sql + the viewer self-heal loader, regenerated per
  light-code release (the record's key carries the code version).
- AGENT MODEL (red1 2026-09-29): "rest the Fable agents once done; use Sonnet if they can carry on clearly, save tokens" — no new Fable
  dispatches; follow-ups = Sonnet with tight specs, or parent.
- FABLE AGENTS STOPPED 2026-09-29 (red1: "rest the Fable agents early as tokens are running out"): fix/light-field-db @98677577
  (3 commits on look, pushed, worktree /tmp/wt-lfdb clean, witness NOT finished — resume with Sonnet: run its
  viewer/tests/witness_light_field_db.js Clinic/Hospital under the GPU flock, read, merge if GREEN); fix/sun-shadow-leak = 0 commits
  (agent stopped while reading; the SUN_SHADOW_LEAK measurement above is the whole handoff); fix/lamp-shadow @295ac63f (2 commits,
  pushed; its RED/GREEN batch never ran: scratchpad run_lampsh.sh + table_lampsh.js).
- ✅ §METER_FIXFACE (v1500, look FF'd): red1 Clinic corridor …628230228 "went dark" (expStep -1.72). A/B at that pose: default meter
  117 cd/m2, frame mean 22; &glassopen=0 identical (not Z26); pre-Z25 build v1494 mean 6 (meter 6184 cd/m2 from glows) — NOT a
  regression. Cause: Z25 made lamp faces lit-material emissive, so the meter (which §METER_EV v2 keeps free of light sources) read
  them. Fix: meter pass renders faces with emission 0 (uFixFace 2). Result: …628230228 meter 26 cd/m2, mean 74; …628332802 mean 112
  (blown 2.8 %); HHS …583845329 meter 50.1 vs 50.9 (unchanged). OPEN: red1 "wall lamps had bounce before" — not measured separately;
  exit-door glare pulling exposure near the corridor end — centre-weighting TBD after red1 re-looks.
- SUN_SHADOW_LEAK status 2026-09-29 (session end, tokens out): v1500 still 23 bright-but-blocked floor points at …598818184 (floor
  median 129). RULED OUT: shadowSide = DoubleSide on all 107 opaque materials (PREJS A/B, OOM 0) -> identical 23, identical means =>
  NOT face culling / winding. NOT yet run: &shadowcascade=0 / &shadowfit=0 / &shadowedge=0 A/B (scratchpad sl/judge.py + diag.js LEAK=1
  LEAKW=40 LEAKH=22, Q=...). Next suspects: CSM cascade fit / SDSM depth-slice box excluding the L2 slab (§STILL_SHADOW_FIT box
  105.5x60.4 m vs footprint 102x137), shadow camera near/far. NO FIX COMMITTED.
  UPDATE (same day): &shadowcascade=0 / &shadowfit=0 / &shadowedge=0 -> all 23 (identical); sun.intensity=0 via PREJS -> still 23
  (caveat: staging may re-set sunI). The 23 bright points ALL carry sky-view field F 0.062 (median) vs F 0 on the 193 normal floor
  points, all zone 1. Exact 128-ray upper hemisphere (uniform-elevation, glass-then-opaque = blocked) at 3 bright points: sky 0 %,
  through-glass 0-1.6 %, while the field says F 0.035-0.077 => the patches are the SKY-VIEW FIELD (0.5 m lattice), not the sun shadow
  map: same class as Z23/Z26/HHS_LEAK. INCONCLUSIVE until a cosine-weighted, glass-transmissive probe (the Z26 agent's method) agrees.
  FIX DIRECTION: bound F per cell by exact rays at field build (the Z26 build-time ray machinery). red1 confirmed stairs also pass light.
- Z26 Fable agent DIED at start (Fable session limit, resets 20:50 Asia/KL) — nothing built; spec above stands, re-dispatch after reset.
- Z22 GPU witness RUN: FAIL, no speed gain (442 -> 448 s; frame 0 still 181 s = 41 % of the bake) — see ALTC_SHOWSTOPPERS.md
  "Z22 GPU WITNESS — RUN 2026-09-28". fix/bake-speed stays unmerged; next = what frame 0 spends 181 s on.
  Films keep whole-mesh glow (no per-lamp I on the pool path).
LOOK = look/combined-0925 @31c8e3ce (sw v1487) served :8624 from /tmp/wt-look; hotfix branch fix/look-hot1 (/tmp/wt-hot, same commit,
DBs symlinked in buildings/). Mode: red1 refreshes :8624 and judges; fix -> smoke one press at red1's pose (diag.js pattern:
scratchpad …/diag*.js, reads the PNG tEXt pose, one fresh-page press, prints § lines) -> FF look. No long gates unless asked.
Shipped today on top of fix/alts-all-3 (release gate PASS 06:30): §GROUND_NOMAP_ALBEDO (ground white x2.3 before its texture
loaded blacked out outdoor views), torch = soft 120 deg flood 450 lm -> 573 cd penumbra 1 (L1b), §R10_CLONE_MAP_SHADOW (bake crash
'arr.map'), §METER_EC +1 EV (Unreal 4.25+ default), §METER_ROOM (inside camera meters its own zone), §AO_LAMPS (AO on lamp direct
light), §GI_REDISTRIBUTE (bounce = local estimate replacing the flat IR; smoke: GI meanAbsDiff 0.92 -> 14.4, mean 117 -> 104).
PAUSED 2026-09-28 ~09:00 (machine suspend) mid OPEN (1): A/B probe written + started — scratchpad /tmp/claude-1000/-home-red1-bim-compiler/57e7a274-73e5-4619-823e-c154ca1aaf2c/scratchpad/diag6.js (log diag6_out/contact_bounce.log): poses …366920 (cafe) + …426486 (stair) x {default, &giredist=0, &aolamps=0} on :8662 (/tmp/wt-hot). Metric §CONTACT_BOUNCE = floor pixels UNDER furniture (upward 1.5 m ray hits) vs OPEN floor: final/underlay luminance ratio + N8AO buffer mean. Hypothesis to test: AO world radius 0.5 m cannot see a table top ~0.75 m up, so under-table AO ~1 and §AO_LAMPS shows little. &aolamps=0 switch is UNCOMMITTED in /tmp/wt-hot viewer/sourced_light.js (A/B only, default unchanged, node -c OK). Still …283542 is exterior (glassReflDark=1 = Z26). RESUME: if the run was cut by the suspend, re-run `node diag6.js`, read the log.
UPDATE 09:50: run 1 — the render itself went fine (cafe_default p50 79.6, GI meanAbsDiff 10.61, §FAULT_GI OK) but the tab died inside the CONTACT_BOUNCE raycast ('Target closed'; 10 px grid + full-RT readback too heavy). Probe made lighter: 28 px grid, a 60 s cap, AO readback in a separate call. The re-run was stopped by red1 before its first result ('enough data', pre-suspend). No contact/bounce numbers yet — OPEN (1) still unanswered.
OPEN, in order: (1) red1: "last two stills not confirming the fix evident enough" — stills …1790556283542 / …1790556366920 (red1 then: the next still …1790556426486 "shows better signs" — compare all three): check
contact shadows under furniture (§AO_LAMPS) + bounce surfacing (§GI_REDISTRIBUTE) there by numbers; the bounce layer's magnitude
vs the flat IR (mean dropped 11 %) may need calibration. (2) Z25 lit fixtures wash out (MeshBasic glow outside the lux scale ->
emitting face calibrated, housing lit). (3) Z26 Clinic roof glass opaque from outside (glassReflDark). (4) Z14/S4 carried state
between presses (odd frames that clear on reload). (5) Z23 zone grid at thin elements (dormer speckle; camera 'not in a zone').
(6) Z24 ground level by slab-elevation clusters (HITOS storey bleed, 3.4 m high). (7) Alt+C: 30 s clip ~/Videos/altc_witness_0928/
hospital_first30s_all.mp4 PASSED (baked at EC 0 — re-bake at +1 if asked); Z22 bake-speed (fix/bake-speed) GPU witness not run;
§FILM_LAW S4 + Z16 camera track next. Opus subagents hit the weekly limit (resets Oct 2 16:00) — use Sonnet agents.

**LIVE ON LOOK 2026-09-28 06:30: look/combined-0925 FF'd to fix/alts-all-3 @0323302c (sw v1478, served :8624) — §RELEASE GATE
all PASS: §ALTS_ALL_VERDICT PASS (937 PASS, 0 FAIL/INCONCLUSIVE/VACUOUS/NO-OP, 3 SCOPE-BLIND), §BAKE_RELEASE_GATE PASS (A,A2,C,E,T,
altc), §W_COLOUR_TRUTH_GPU PASS 25/25 (after the harness pin fix 0323302c; the first run's single FAIL was an all-black instrument
arm). Logs /tmp/alts_all5. Watch item: Alt+S trade colours near-saturated (duct still sat 0.98) — candidate: trade hues at paint
strength, one named value, after red1's look.**

**STATUS 2026-09-28 — Alt+S RESTS, Alt+C FIRST (red1: "Done many stills. Overall much improvement. Would just update results and
rest on alt-s to see to alt-c first").** Alt+S candidate = bim-ootb fix/alts-all-3 @05d0ee7d (sw v1478): B1 + Z8 sky shell rays,
cove glow only (no strip, L1a), §METER one bound reading on the final scene (EV100 band 40/90, ACES pre-scale kept), lamp truth, LightLaw,
Z9 albedo sRGB, Z10 AO indirect-only, Z11 bounce real albedo + FIX 10 energy bound, Z12 ground half, §CAM_TORCH (L1b), §SPEC_SMOOTH (Z18),
colour truth Z19-Z21 (+ MEP discipline hue, metalness 0), FIX 11 normals (first-press black glass), FIX 16 cascade fit front-side,
FIX 17 skyline seed. Pass 3: stills 894 PASS / 1 FAIL (tr4, fixed by FIX 17), bakes PASS, colour-truth 0 FAIL. Final gate run (Sonnet,
/tmp/alts_all5) in progress; FF look/combined-0925 to it only on §ALTS_ALL_VERDICT + §BAKE_RELEASE_GATE + §W_COLOUR_TRUTH_GPU PASS.
Open Alt+S (parked): Z15 baked bounce volume, Z18 teeth count by the direct instrument, S4 carried state residue (tr6 spread), M1.
NEXT = Alt+C (prompts/ALTC_SHOWSTOPPERS.md): Z22 bake speed (load once, shader pre-compile), §FILM_LAW S4 (sourced chain in films,
4a-4f, R2 enclosure), Z16 camera track, film torch done (fix/film-law-v2 -> in alts-all-3).

**§ZERO LIST 2026-09-27 (red1: "You have my confidence and mandate to chase paths till zero") — work top to bottom; each item
✅ DONE (witness) or ⛔ BLOCKED: <question>. Coordinator = the dev session; GPU witness = one agent, serial.**
 Z1 ✅ B1 §SKY_SHELL_RAYS — look 808f578f (walls within ±0.1: Hospital 60->100%, Clinic 38->100%, Terminal 16->98.6%).
 Z2 ✅ §COVE_NO_STRIP — look fdecbd1c (strip 1->0 at 5 poses, refs within noise).
 Z3 ✅ §STILL_RES port — look 53128dd3 (opt-in &stillres=; default path unchanged by code; cost of 4k unmeasured -> Z12).
 Z4 ⏳ §METER_EV (fixes 1+2) — fix/meter-one-rule 1b5f1c0b, GPU witness queued.
 Z5 ⏳ §LAMP_TRUTH (fixes 3+4: remeter, 0.5 cut, cove L1a) — fix/lamp-truth c539f129, queued.
 Z6 ⏳ §LIGHT_LAW_MODULE identity — fix/light-law-module 39959e8a, queued. Then FF Z4-Z6 into look.
 Z7 ⏳ §FILM_LAW S1-S3 — fix/film-law 3688b3c5, film bake witness queued (ALTC_SHOWSTOPPERS §FILM_LAW).
 Z8 ⏳ B1 reach — BUILT radius-free rule in fix/alts-all (### Z8 SPEC; node W 4/0); GPU row GZ queued (### ALTS-ALL BUILD).
 Z9 ⏳ fix 5 ALBEDO sRGB — fix/z9-albedo-srgb 5127a649 (sw v1466), node W pass=4/0 ran=11; GPU witness queued (### Z9 SPEC).
 Z10 ⏳ fix 6 AO indirect-only (option A, shader path) + 0.5 m world radius — fix/z10-ao-indirect 5c1739ec (sw v1467), node W pass=4/0 ran=18; GPU witness queued (### Z10 SPEC).
 Z11 ⏳ fix 7 BUILT: AO once + real receiver albedo — fix/z11-bounce-linear 024ce32d (sw v1468), node W pass=4/0 ran=10; composite-before-tone = PLAN P1-P5 (### Z11 SPEC); GPU witness queued.
 Z12 ⏳ fix 8 BUILT: ground half = rho_g x E_g + §SUN_PENUMBRA diagnostic — fix/z12-ground-penumbra c6463e4b (sw v1469), node W pass=4/0 ran=12; PCSS = spec only; 4k §STILL_RES cost = GPU queue (### Z12 SPEC).
 Z13 §FILM_LAW S4 (sourced chain in films, R2 build-up key) 4a->4f — after Z7 numbers.
 Z15 baked bounce light in the 3D light volume (per building + build-up stage) — film speed + still/film identity.
 Z16 camera track precompute per film/shot (exposure, visible set, lamp pool, reflection points) — extends _filmFitPrecompute.
 Z17 ⏳ camera torch L1b — Alt+S fix/alts-torch @1dd60a62 (v1472); films in fix/film-law-v2 @931882df (v1473).
 Z18 two-tier stair-stepped shadow edges (red1 still …1790484725274, HHS, cam [-10.011,-4.496,-21.246] tgt [0.306,-2.129,0.238],
     v1464): suspected 0.5 m zone-grid stepping (audit C cause 4 stencil drop + cause 3 per-zone IR) overlapping the soft sun
     shadow. Prove by readback of sun term vs grid term along the floor band, then continuous cross-cell blending; witness =
     0.5 m steps along the line -> 0, refs unchanged. FIRST item of the next pass.
 Z19 ⏳ BUILT: COLOURED INTERREFLECTION (L2) — zone IR tinted by its surfaces' area-weighted mean albedo, Y unchanged — fix/colour-truth c89d7de7 (sw v1476), node W pass=4/0 ran=12; GPU witness queued (### Z19 SPEC, ### COLOUR-TRUTH BUILD).
 Z20 ⏳ BUILT: PORCELAIN — own colour, roughness 0.08 (physicallybased.info Porcelain 0, §refl floor), metal 0 — 564066f5, node W pass=4/0 ran=35, matched Hospital 554 / LTU 85; GPU queued (### Z20 SPEC, ### COLOUR-TRUTH DECISIONS).
 Z21 ⏳ BUILT: PLACEHOLDER = NO COLOUR — cream -> class STD_MAT default, MEP-trade proxies -> trade hue, canvas AND Alt+S — 564066f5, node W pass=4/0 ran=32, Hospital replaced 10,947 + proxies hued 3,683; GPU queued (### Z21 SPEC, ### COLOUR-TRUTH DECISIONS).
### Z18 DIAGNOSIS (Opus GPU witness, 2026-09-27, no code change) — VERDICT: the hard stair-stepped edges on the floor AND the duct
sides are the §GLASS_SPEC_GATE mirror-ray march (slSpecKeep, sourced_light.js:159-176): the IBL reflection gate flips from F to 1.
They are NOT the sun shadow, NOT the sky field F / ground Gd, NOT IR per zone, NOT AO, NOT the lamp clusters. The suspicion written
above (0.5 m zone-grid stepping of the diffuse terms) is RULED OUT.
 Setup: /tmp/wt-torch @1dd60a62 (sw v1472, :8638), HHS_Office_Federated &ghost=1, red1's pose, one fresh-page Alt+S (probe
 z18_press.log: §GLARE 0/0/0, §SKY_VIEW_FIELD on, §COVE_LIGHT on, §IRC_MAX on, torch on). Then linear float-RT readbacks of the
 frozen staged frame (1685x874; red1's PNG is 1666x864, so image coords differ ~1 %). Probes b1/t3*.js, analysis z18gate.py ->
 z18_gate_teeth.log. Both of red1's stepped edges reproduce at this build: the floor sawtooth at image x ~780-810, y 730-874; the
 duct-side staircases at x 480-600, y 150-200 and x 760-840, y 0-110.
 PER-TERM, one term at a time (sample pixels either side of the floor edge (792|796, 860) and a duct-side step (520, 170|172)):
  - full linear luminance: floor 0.0438 -> 0.0759 (x1.73), duct 0.0228 -> 0.0312 (x1.37) across one pixel.
  - sun direct: 0 on both ROIs. Duct sides face ±x, and N.L with sun (-0.002,0.707,-0.707) is ~0. The floor band is in shadow:
    castShadow=false lifts both floor sides to 0.249/0.244 with no step. Caveat: A.sun.intensity=0 did not reach the shader
    (intensity is an own property there), so the sun was judged through castShadow and cascade hiding, not through its intensity.
  - sky field F (mode 6/8 G) and ground view Gd (mode 10): continuous across both edges (F 0.2132 -> 0.2138 floor, 0.0123 ->
    0.0127 duct). They are trilinear, so they give the SOFT wide gradient (tier A of the look). They add 0 steps: along floor
    rows y=780/820/860, the line crosses 0.5 m cell boundaries (e.g. z cell 88->89 at x 792) with no jump in F, Gd, IR or AO.
  - IR per zone (mode 9): constant 0.00593 inside zone 57. It changes only at the zone-57/zone-0 boundary, which on the floor is
    a straight grid-plane line (the dark triangle), not stepped. uSLIrP.y=0 lowers both sides by the same 0.0041, and the step remains.
  - AO (N8AO accumulation target, half float): 1.0 on both sides (min 0.76, only at contacts); no steps.
  - lamps (uSLLamp.x=0): -0.0002 on both sides; step remains. Cove 0 here. Torch 0 at these pixels (and red1's v1464 had no torch).
  - All light colours black: step remains (duct 0.0008 -> 0.0092). uSLSky.x=0 (binary path) removes it (0.1446/0.1447). So
    does uSLParams.x=0 (0.1403/0.1403).
  - DECIDING: mode 8 (_slSpec) = F on one side and exactly 1 on the other at every sampled edge (floor 0.2132 | 1, duct 0.0123 |
    1). With material envMapIntensity=0 (32 of 69 materials carry a cube-RT envMap), the edge is gone: floor 0.01649/0.01653,
    duct 0.02259/0.02262. The stepped tier is the IBL radiance, x1 where the 0.25 m mirror-ray march through the 0.5 m zone
    grid reaches an OPEN cell and xF where it meets a SOLID one first. That is a binary cell test.
 STEP COUNT / SPACING (gate boundary traced line by line; teeth = boundary jumps >= 3 px):
  - Floor (y=-5.354): 6 teeth in 174 rows, period along z 0.208 / 0.203 / 0.197 / 0.193 / 0.182 m. The edge runs x = 0.558 z +
    1.84. Tooth z positions sit at cell fractions 0.00/0.58/0.18/0.77/0.37/0.99, so they are NOT on 0.5 m cell boundaries of the
    receiver, and the spacing is ~0.2 m, not 0.5 m. The cause is still the grid: the march's far samples (k x 0.25 m along the
    reflected ray) cross a 0.5 m cell of the occluder/opening, and that crossing is projected back onto the floor. Brightness
    ratio across a tooth is 1.49.
  - Duct left side (x=-7.908 plane): 4 teeth in 117 columns, period along z 0.110 / 0.118 / 0.129 m, y rise ~0.07 m per tooth,
    ratio 1.34. Upper-right duct: 3 jumps in 66 columns (0.19 / 0.10 m), ratio 1.71.
  - The 3-5 consecutive 1-px jumps inside each tooth are the slanted riser of one tooth, not a second step family.
 "TWO TIERS" = tier A, the soft wide wedge (hemi x F/Gd, trilinear, smooth), with tier B on top of it: the hard sawtooth of the IBL
 spec gate. A fix belongs in slSpecKeep. Make the open/solid verdict continuous, e.g. filter the march with the same 8-texel
 trilinear weights as _slF, or blend F->1 over the last samples, or feather by the distance from the cell boundary. The Z18 witness
 is unchanged: teeth along these three traced lines -> 0, and the envMapIntensity=0 control stays equal. A confound was seen and
 not used: hiding the stillShadowCascade lights (which changes the program variant) also removed the floor jump. The deciding
 test (envMapIntensity=0) changes no program.
PAUSED 2026-09-27 (red1 "pause for now"). RESUME: (1) read the GPU agent's §ALTS_COMBINED RESULT (partial) — torch Alt-S witness
 on fix/alts-torch @1dd60a62, 7 poses, PASS = p50 40..200 & clipped < 2 % at >= 6/7, §GLARE 0; if PASS FF look/combined-0925 to it
 and tell red1 to reload :8624; (2) film test bake fix/film-law-v2 (ALTC_SHOWSTOPPERS §FILM_LAW v2 amendment); (3) Z18; then
 Z10/Z11 witnesses, Z8 reach-3, Z15/Z16. Worktrees: /tmp/wt-torch /tmp/wt-film2 /tmp/wt-comb /tmp/wt-z9..z12 /tmp/wt-law
 /tmp/wt-lamp /tmp/wt-meter /tmp/wt-b1 /tmp/wt-look(:8624).
 Z23 GENERALITY GAPS (red1 2026-09-28, SampleCastle stills …541575336-…541653414, v1464: "introduces new gaps in our abstract
     treatment of general cases"): (a) glass found by IFC class convention (IfcPlate/IfcWindow + opacity) — Castle (external IFC from the landing-page library, like the rest of the fleet)
     glassOpaque=22, plates glassDb 0: glass must be recognised by MATERIAL (transmission/opacity/name), class-free; (b) sloped /
     non-axis-aligned surfaces (dormer reveal) vs the 0.5 m axis-aligned zone lattice — speckled dark edges, hueNoise 528; (c) the
     witness fleet lacks SampleCastle (sloped roofs/dormers, non-Revit conventions) — add its poses to every gate. Measurement queued (post-gate A/B).
 Z24 GROUND LEVEL general rule (red1 2026-09-28, HITOS stills …542813611-…542991128: "ground level is miscalculated (prior
     condition)"): tools.js _calcGroundY picks ground by a hard-coded storey-NAME list, then largest-lowest slab heuristics — a
     name convention, not a general rule. Measure HITOS (§GROUND_Y source vs storey elevations / slab bottoms / exterior door sills),
     then derive a data rule (e.g. the storey whose exterior doors/walls meet the site, or the IfcSite/terrain reference) that
     holds for every fleet building; witness: ground Y vs door-sill elevation per building.
 Z14 open carry-overs: S4 fringe after an inside press (pushed materials 105->109); M1 "hog" (no regression measured); overhang meter pose.

### MEP GREY (Hospital nav) — RESULT (2026-09-27, nav only, no Alt+S; /tmp/wt-look @53128dd3 sw v1464 served read-only on :8650; probe
scratchpad mep_nav.js, fresh profile per URL). Three URLs: OCI `?db=https://objectstorage…/Hospital_extracted.db&ghost=1`, local
`?db=/buildings/Hospital_extracted.db&ghost=1`, local without &ghost=1 — ALL THREE IDENTICAL:
 `§MEP_HUE_TALLY bld=Hospital rows=63182 mep_elements=41987 tinted=40634 tier1_authored_name=0 tier1_own_hue=1353 no_trade_hue=0
 distinct_hues=5 trade_codes=5 T=0.344 inst_mep_uniform=2870 inst_mep_mixed=0 hue_off=0`; A._instMepUniform 2870, A._instMepMixed 0.
 Materials actually used (A._matCache, meshes counted in the scene): IfcPipeSegment `0.920,0.900,0.850|…|FP|PLB` -> 0x9c4eeb
 (1,926 uses), `…|PLB|PLB` -> 9c4eeb (1,320), `…|MEP|PLB` -> 9c4eeb (1,080); IfcDuctSegment `…|MEP|DUCT` -> 0x4eeb4e (387–417).
 => the hue is NOT dropped: tier 2 fires for 40,634 / 41,987 MEP rows (the other 1,353 keep their own hue: the FP fittings' red),
 OCI and local DB behave the same, ghost mode changes nothing, no noMepHue path (inst_mep_mixed 0), §INST_RGBA_SPLIT not involved.
 TWO FACTS for the "greyish" read (no code changed):
 (1) streaming.js:691-697 `A._mepTradeHue`: the Revit NAME HINT wins over the discipline — every IfcPipeSegment, including the 6,228
     FP (sprinkler) pipes, carries mepHint PLB, so ALL pipes are one purple 0x9c4eeb (PLB 8844cc hue at the element's V 0.92) and
     never FP orange; only the ducts differ (green). Trade separation between pipes is lost, not the colour.
 (2) streaming.js:1275/1278 STD_MAT (IfcPipeSegment metal 0.45 rough 0.40 envInt 0.05; IfcDuctSegment 0.40/0.45/0.05) + the material
     build (opts.metalness = stdMat.metal; roughness x 0.75; envMapIntensity = envInt): at metalness 0.45 the diffuse albedo is scaled
     by 0.55 and the tinted specular reflection is nearly off (envInt 0.05) — a hued but dim, low-contrast pipe. Not measured on
     canvas pixels here (no pose looks at MEP in this probe); a pixel readback at an MEP pose is the next step if red1's "grey" is
     not the name-hint purple.

### Z8 SPEC — B1 reach: a radius-free shell rule (2026-09-27; B1 RESULT scope note) — bim-ootb `fix/alts-all`, light_zones.js ?v=17
DATA (reach_r2_{hosp,clinic,term}_dist.log, look 808f578f, reachdist.js: wall-side covered cells bucketed by lateral distance r to the
nearest open cell, 150-cell seeded sample per bucket vs 64-ray truth): exterior cells (truth > 0.2) under-read by > 0.1 at EVERY
reach — Hospital r3..8/far 6/5/2/2/2/3/1 (est. 1,292 + 291 + 250 + 211 + 177 + 305 + 814 cells), Terminal 46/67/19/27/2/3/2 (est.
1,957 + 1,384 + 185 + 1,704 + 38 + 148 + 336), Clinic 1 at r3. The error does not stop at any radius, so SHELL_R = 3 (or any value)
would be one arbitrary constant; the data supports a radius-free rule.
RULE: a covered, non-solid, above-ground cell with a lateral SOLID neighbour (unchanged) is SHELL when (a) an open cell lies within 2
cells (B1, kept: it catches the BLIND cells whose every lattice direction is fattened shut) OR (b) the lattice's own 41-direction
sweep reached the sky through AIR only in at least one direction (vt === 1: no solid, no glass on the path) — an exterior-exposed
cell however far the open column is. Cells that see sky only through glass (rooms behind windows) or not at all keep the lattice F.
The exact estimator (64 seeded CIE-cos rays, W1 100 / 100 / 98.6 % within ±0.1 on the B1 population) replaces F for them.
RESIDUAL (stated): a BLIND F = 0 cell more than 2 cells from open air (e.g. Hospital 7211325, F 0 vs 0.11) is not caught — rule (b)
needs one open lattice direction. COST: unknown until the GPU press (§SKY_SHELL_RAYS passMs / rays; first press only, IDB-cached).
SWITCH: &shellreach=2 / APP._stillShellReach = 2 = the B1 rule exactly; the rule enters the §ZONE_IDB_CACHE fingerprint ('sr' token);
the SRC hash changed with the code, so every building rebuilds once.
§-LINE: §SKY_SHELL_RAYS … reach=air|r2 candidates= near2= airOnly= recomputedAirOnly= airOnlyDMean= airOnlyLifted= airOnlySample=[cells]
(+ Z8_NOOP when the air rule added no cell). WITNESS node viewer/tests/witness_z8_shell_reach.js (the REAL field() over a synthetic
wall + 5-cell overhang + skylit room; LightZones._testField hook): 4/0, 9 rows — 96 facade cells at reach 5 selected by 'air', 0 by
'r2'; the glass-only skylit cell (F 0.165) and a deep F = 0 cell not selected; r2 shell = near2 set; air ⊇ r2; redControl = clear glass
(T = 1) selects the skylit cell. GPU row (harness GZ): at the a202 aerial pose cells 9911662/3 F >= 0.33 (truth 0.43/0.40).

### ALTS-ALL BUILD (2026-09-27) — bim-ootb `fix/alts-all` @e0d2082b (pushed, NOT merged, no PR), sw v1474, lawHash dc0e8638
TREE: fix/film-law-v2 @931882df (torch Alt+S + film law v2) + merge fix/z10-ao-indirect @5c1739ec + merge fix/z11-bounce-linear
@024ce32d. Conflicts (sw.js, viewer.html, light_law.js, sourced_light.js export line) kept both sides: LightLaw gains AO beside
TORCH/ALBEDO/GROUND/SUN (hence lawHash 918804c2 -> dc0e8638), SourcedLight exports both aoPatch/aoSet/aoOn and albedoMap/albedoEncode.
Both branches had gi_still.js?v=29 with different content -> bumped. Versions: light_law 6, sourced_light 59, effects 115, gi_still 30,
light_zones 17, cinema_maxq 11. Node witnesses on the tree: light_law_unit 4/0 (41), z9 4/0, z10 4/0, z11 4/0, z12 4/0,
film_exposure_unit 4/0, z8_shell_reach 4/0 (9), z18_gridblend 4/0 (15), alts_all_selftest 4/0 (26). (witness_still_res is a GPU witness.)
WHAT IS IN (switch = its A/B off arm):
 - Z4-Z6/Z9/Z12/Z17 (from the torch + film-law-v2 chain): meter v3, lamp truth, LightLaw, albedo sRGB (&srgbfix=0), ground half
   (&groundlaw=0), camera torch (&torch=0), film law S1-S3 + film torch.
 - Z10 AO on indirect light only, world radius 0.5 m (&aoindirect=0). Z11 bounce: AO once + real receiver albedo (&gialb=0).
 - Z8 radius-free shell rule (&shellreach=2 = B1; &skyshell=0 = no shell pass) — spec above.
 - Z18 (### Z18 DIAGNOSIS: the teeth are the §GLASS_SPEC_GATE binary mirror march): §SPEC_SMOOTH, DEFAULT ON, &specsmooth=0 = the
   binary march. Each march sample reads the 8 texels around it (trilinear): o = open/off-grid weight, s = SOLID weight (ignored for the
   first 4 samples, as before); P += T·o, T ·= 1 − o − s; gate = F + (1 − F)·P — continuous in the fragment position, equal to the
   binary result where all 8 texels agree. Node (CPU mirror LightZones.specVis(p, n, eye, true), same maths): binary max jump per cm
   0.80 (the F -> 1 tooth), smooth 0.014, range kept 0.21..1.00. Cost: up to 8 fetches × 32 samples per reflective fragment (early out
   at T < 0.004) — the GPU press-time row reports it. &gridblend=1 (the earlier diffuse-grid hypothesis, ruled out as the cause): kept,
   default OFF, harmless (node: continuous across zone boundaries, unchanged across walls), not part of the look.
 - TORCH REMETER VACUOUS (§ALTS_COMBINED RESULT): cause not isolated in node (the remeter render drew nothing: skyPx = pixels = 14400,
   Lavg = the hemi sky luminance 6780.8 cd/m² at every pose; the 9 new programs compiled only at the first frame AFTER staging, so that
   render compiled and drew no mesh). Fix by construction: a still now stages the torch BEFORE SourcedLight.stage (the stage meter and
   the lamp remeter both see it); the separate torch remeter is gone. Guard kept: a remeter whose readback is all sky after a meter that
   saw the scene keeps the previous exposure and logs `§METER remeter VACUOUS …`.
 - STAGE -> LAMP REMETER JUMP at outside poses (filmD2 f=57: EV 16.10 -> 18.52 on the SAME pixels 7201 / skyPx 3040; bandL 0.388 ->
   2.071, allLogAvg 0.241 -> 1.033, hidden 1 -> 36): NOT fixed (cause not clear from the logs: between the two meters staging
   reasserts the ground colour 0xd9c39a × gain 2.3 (§GROUND_COLOR_ORDER_FIX), rebuilds the lamps and fits the sun shadow). New
   `§METER_STATE` line before every §METER: ground colour/gain/map/visible, sun I / castShadow, shadow autoUpdate/needsUpdate, visible
   light census by type (count/sum), envMap mean, hidden, bandL; for OUTSIDE cameras also the band L re-read with the ground hidden
   (groundShare = 1 − L_noGround/L). Harness row G3 "stage -> final remeter EV jump <= 1 EV" prints the fields that changed.
 - §FRAME_QA (cinema_maxq.js): every captured frame logs the luma of the exact canvas encoded (64×36: mean/min/max, dark %, clip %,
   reused, cam) beside §FRAME_HASH. cli_silent_bake.js `--url-query '&torch=0'` appends raw switches (film off arms).
HARNESS — viewer/tests/witness_alts_all.js (+ alts_all_judge.js pure judge, witness_alts_all_selftest.js). RUN ONCE, PERSIST: raw
records <out>/raw/<pose>__<arm>.json, film logs <out>/film/{A,C,E,T,B,altc}.log/.mp4/_tap.json/_frames.json; `--judge <out>` re-judges
with no browser; a record is re-run only with --rerun. Output: <out>/alts_all.log (table), <out>/alts_all.json.
 GPU COMMANDS (one browser at a time):
   node ~/bin/serve_tree.js /tmp/wt-all 8640 &
   cd /tmp/wt-all && node viewer/tests/witness_alts_all.js --port 8640 --tree /tmp/wt-all --out /tmp/alts_all --plan     # prints the plan only
   cd /tmp/wt-all && node viewer/tests/witness_alts_all.js --port 8640 --tree /tmp/wt-all --out /tmp/alts_all --noise --film --altc 90
   (film bakes serve themselves on port+20; add --base-tree /tmp/wt-film2 for overlay identity vs the pre-merge tree, else vs control C)
 PRESS COUNT: default = 12 base poses (clinic, inner, term, p2, night, p614, p698 pale, p672 blotch, a616, a202 aerial/Z8, plenum,
 hhs_z18) + 13 off-arm presses at their own poses (torch0 inner+night, srgbfix0 inner, groundlaw0 night, aoindirect0 inner, gialb0
 inner, skyshell0 a202, shellreach2 a202, gridblend1 hhs_z18, specsmooth0 hhs_z18, meterband7095 inner+night) = 25 (+ --noise:
 a second base press at each arm pose, 5) — each press = fresh profile + load 60-90 s + press 15-215 s ≈ 2-5 min => ~1-2.5 h.
 --arms all = the full matrix 12 poses × 11 arms = 132 presses (≈ 4.5-11 h). --arms a,b / --arm-poses p,q / --poses limit it.
 Film: 4 bakes (A parity, C --film-exposure 0 --film-fill restore, E --film-parity 0, T --url-query &torch=0) × ~6-8 min at 90 frames;
 --altc 90 = one in-browser MaxQ run (APP.startMaxQualityOrbit({frames:90}) — the function the Alt+C key calls, capped).
 STATES: PASS / FAIL / INCONCLUSIVE (instrument) / VACUOUS (population 0) / NO-OP (global fix: on == off beyond max(0.05, 2×noise)) /
 SCOPE-BLIND (local fix — skyshell, shellreach, gridblend, specsmooth — acted but this pose's image is unchanged; also a look row judged
 on the app frame instead of the saved composite) / WARN (listed: programs, press time, ref deltas, the Z18 step proxy).
 ROWS: G1 (per press, else the whole press = INCONCLUSIVE, no other row judged): served sw == tree sw, every edited file's ?v= in
 the DOM, served bytes of each edited file == tree (FNV), LightLaw lawHash page == node, LightZones SRC page == node, 0 PAGEERROR /
 §LOAD_FAIL / Shader Error / context lost / GPU OOM, no SW controller at load (fresh profile), zone/field cache built|hit reported,
 staged pose == requested, PNG tEXt pose == requested (Save PNG clicked, PNG parsed in node), last §METER finite / pixels > 0 / not all
 sky, press finished. G2 per fix vs its off arm (on line in base, off line in the arm, population > 0, effect vs noise). G3 §COVE_QUAL
 qualified, §ALBEDO_SRGB converted, shell recomputed, AO bound mats, receiver-albedo px, §GLARE populations, no inside §METER all-sky,
 torch staged before the stage meter, stage -> final EV jump <= 1 EV. G4 p5/p50/p95, px<=15 %, clipped %, PASS band p50 40..200 &
 clipped < 2 %, §GLARE 0/0/0, programs, press time. G5 deltas vs §ALTS_COMBINED RESULT (torch) else §METER_EV v2 40/90 else B1. GZ Z8
 cells at a202, Z18 step proxy. FILM (every bake channel): SW purge/reload race (unregistered > 0 AND a pre-purge *_INIT tag also after
 the purge => INCONCLUSIVE-instrument; v1 film_law_new.log trips it, v2 does not), env sw, tap (?v= + lawHash of the baked page), page
 errors, frames > 0, §FILM_EXPOSURE every frame, step within +3/−1 stops/s (INCONCLUSIVE if never capped), no overshoot, programs
 constant f >= 2, torch = exactly ONE §CAM_TORCH film line per CAPTURED staging (the bake stages twice; the first staging is torn down)
 and torch= constant == it (T arm: off every frame), fill ambient 0 + drift=none, lawHash film == node, frame luma < 5 / > 250 / NaN
 (in-page §FRAME_QA and ffprobe YAVG of the file, limited range converted), byte-identical consecutive frames while the camera moved
 (§FRAME_HASH / framemd5; §FRAME_REUSE or a static camera = intentional), NO-OP of film exposure+fill (A vs C), parity (A vs E), torch
 (A vs T) on the per-frame luma, overlay identity vs base/control with the exclusion list printed (§CLASH_MEM, §LOADPATH_PIXEL_DIAG*;
 timings stripped). The film judge on the real v2 log: every row PASS except tap (not run then) and frame luma (no §FRAME_QA then) =
 INCONCLUSIVE — as it must be.
 VERDICT LINES: `§ALTS_ALL_VERDICT PASS|FAIL|INCONCLUSIVE` (stills) and `§BAKE_RELEASE_GATE PASS|FAIL|INCONCLUSIVE` (bakes). Exit 0
 only when every judged row is PASS (SCOPE-BLIND / WARN listed, not blocking) and no press is INCONCLUSIVE.
 RELEASE-GATE RULE (red1 2026-09-27: "on any baking channel you may administer, use deeply such logging to debug before releasing"):
 NOTHING SHIPS — no FF of look/combined, no merge, no publish of a film or still build — unless the harness prints
 `§BAKE_RELEASE_GATE PASS` for the bake channels and `§ALTS_ALL_VERDICT PASS` for the stills on that exact tree commit.
 SELF-TEST (node viewer/tests/witness_alts_all.js --selftest): 26 red controls, 4/0 — a GREEN still and a GREEN film fixture PASS;
 sw mismatch, SW controller, lawHash mismatch, page error, stale ?v= => INCONCLUSIVE; all-sky meter, converted=0, §GLARE populations 0
 => VACUOUS; 2.4 EV remeter jump => FAIL naming the changed §METER_STATE fields; p50 25 => FAIL; identical torch arm => NO-OP;
 identical skyshell arm => SCOPE-BLIND; converted=0 in G2 => VACUOUS; dead switch => FAIL; effect inside noise => NO-OP; film black
 frame => FAIL; reused frame => FAIL; SW-race double init => INCONCLUSIVE (gate INCONCLUSIVE); identical torch-off film => NO-OP;
 film lawHash mismatch => FAIL; no bake => gate INCONCLUSIVE.
 NOT JUDGED IN NODE (GPU owes it): every rendered number; the Z18 teeth count after §SPEC_SMOOTH (the step proxy is a proxy — the
 diagnosis probes b1/t3*.js + z18gate.py are the direct instrument); the Z8 staging cost; whether the lamp remeter jump is the ground.

### §ALTS_ALL RESULT (GPU) (Opus GPU witness, 2026-09-27) — RELEASE GATE: FAIL (stills FAIL, bakes FAIL; instrument clean: INCONCLUSIVE 0)
BUILD: viewer = fix/alts-all @e0d2082b (sw v1474, lawHash dc0e8638, LightZones SRC 567a94fc:97712; every press: served sw, all 6 edited
 ?v= in the DOM, FNV bytes == tree, fresh profile, pose + PNG tEXt pose == requested). Harness-only commits on top (instrument fixes,
 below): e5417ab3, ad6e40aa, f49048f2, 1bf2831f — `git diff e0d2082b..1bf2831f -- viewer ':!viewer/tests'` is empty, so the verdict
 is the e0d2082b viewer's. Served /tmp/wt-all :8640, bakes :8660, B = /tmp/wt-film2 (v1473). Headless puppeteer, gl-egl, RTX 4060 8 GB.
RUNS: pass 1 14:58 -> 16:49 (28 presses + Alt+C 90 f + bakes A,C,E,T,B; 1 h 51 min). Pass 2 16:51 -> 17:16 (6 instrument re-presses +
 A, C re-baked). Final `--judge /tmp/alts_all --base-tree /tmp/wt-film2`. GPU total about 2 h 20 min. Press wall 25..191 s (load 28..42 s,
 press 14..149 s); bakes 246..436 s each. Data: photoreal_probes/alts_all/ (alts_all.json, summary.md); raw records /tmp/alts_all/raw.
 §ALTS_ALL_SUMMARY tree=1bf2831f sw=v1474 lawHash=dc0e8638 records=28 bakes=A,C,E,T,B,altc PASS=565 FAIL=8 INCONCLUSIVE=0 VACUOUS=0 NO-OP=2 SCOPE-BLIND=1 WARN=41
 §ALTS_ALL_VERDICT FAIL
 §BAKE_RELEASE_GATE FAIL — nothing ships (no FF of look/combined, no publish) on this tree.
STILLS, base arm (composite canvas = the saved PNG; EV100 = every §METER camera line, stage -> lamp remeter; "old" = final EV of the
 same pose on the torch build, §ALTS_COMBINED RESULT). G3 VACUOUS guards all PASS (cove qualified, sRGB converted, shell recomputed, AO
 bound, receiver albedo, §GLARE populations, torch before the stage meter).
 | pose    | EV stage -> final (old) | p5/p50/p95       | px<=15 % | clip % | G4 band | GLARE | progs | press s | hueNoise | step proxy |
 | clinic  | 8.79 -> 8.79 (6.95)     | 12.3/23.1/90.9   | 18.66    | 2.32   | FAIL    | 0/0/0 | 94    | 25.1    | 0        | 0.74 |
 | inner   | 9.68 -> 9.68 (7.85)     | 3.2/36.1/58.1    | 20.27    | 0      | FAIL    | 0/0/0 | 122   | 146.4   | 0        | 0.37 |
 | term    | 10.31 -> 10.31 (7.54)   | 10/20/174.8      | 33.04    | 0.66   | FAIL    | 0/0/0 | 114   | 31.6    | 0        | 13.93 |
 | p2      | 9.71 -> 9.71            | 45.9/92.3/156.2  | 0.13     | 0.76   | PASS    | 0/0/0 | 128   | 105.0   | 0        | 5.58 |
 | night   | 10.06 -> 10.00 (13.98)  | 216.4/238.1/255  | 0.38     | 21.72  | FAIL    | 0/0/0 | 128   | 129.3   | 0        | 5.80 |
 | p614    | 13.54 -> 13.30          | 65.6/115.1/207.2 | 0.001    | 0.03   | PASS    | 0/0/0 | 129   | 149.1   | 21       | 4.06 |
 | p698    | 10.23 -> 10.23          | 42.6/66.9/119.2  | 0.03     | 0.21   | PASS    | 0/0/0 | 128   | 132.1   | 0        | 2.06 |
 | p672    | 9.20 -> 9.20 (10.75)    | 69.5/137.1/243.2 | 0        | 3.15   | FAIL    | 0/0/0 | 128   | 108.3   | 0        | 5.76 |
 | a616    | 14.86 -> 15.33 (16.62)  | 29.8/112.6/170.3 | 2.70     | 0      | PASS    | 0/0/0 | 129   | 115.3   | 0        | 3.45 |
 | a202    | 12.81 -> 13.17          | 70.7/139.9/238.6 | 0.07     | 1.52   | PASS    | 0/0/0 | 129   | 118.8   | 11       | 5.35 |
 | plenum  | 9.38 -> 11.93 (10.44)   | 0.9/88.9/253.6   | 25.17    | 9.25   | FAIL (+G3 jump 2.55 EV) | 0/0/0 | 126 | 103.0 | 79008 | 2.63 |
 | hhs_z18 | 12.32 -> 12.22          | 0/119.4/233.1    | 22.78    | 0.86   | PASS    | 0/0/0 | 89    | 14.3    | 645      | 3.63 |
FIX ARMS (G2, arm vs base at the arm's pose; noise = |base - base_r2| of the same pose):
 | fix (arm)                         | pose    | base vs arm (mean / p50 / EV)          | noise | state |
 | Z9 albedo sRGB (&srgbfix=0)       | inner   | 31.88 vs 43.34 / 36.1 vs 48 / =        | 0.04  | PASS |
 | Z10 AO indirect (&aoindirect=0)   | inner   | 31.88 vs 31.08 / 36.1 vs 35.0 / =      | 0.04  | PASS |
 | Z11 receiver albedo (&gialb=0)    | inner   | 31.88 vs 31.38 / 36.1 vs 34.9 / =      | 0.04  | PASS |
 | Z12 ground half (&groundlaw=0)    | night   | 236.76 vs 230.99 / 238.1 vs 232.3 / =  | 0.7   | PASS |
 | meter band 70/95 (&meterband)     | inner   | 31.88 vs 26.28 / EV 9.68 vs 9.97       | 0.04  | PASS |
 | meter band 70/95 (&meterband)     | night   | 236.76 vs 220.2 / EV 10.00 vs 10.79    | 0.7   | PASS |
 | B1 shell (&skyshell=0)            | a202    | 153.64 vs 152.58 / 139.9 vs 138.4      | 0.43  | PASS |
 | Z8 reach (&shellreach=2)          | a202    | 153.64 vs 153.24 / 139.9 vs 141.2      | 0.43  | PASS |
 | Z18 spec smooth (&specsmooth=0)   | hhs_z18 | 112.01 vs 111.82 / EV 12.22 vs 12.23   | 0.5   | PASS (on the 0.01 EV move only) |
 | Z18 grid blend (&gridblend=1)     | hhs_z18 | 112.01 vs 112.02 / 119.4 vs 118.6      | 0.5   | SCOPE-BLIND |
 | L1b camera torch (&torch=0)       | inner   | 31.88 vs 31.85 / 36.1 vs 36.1 / =      | 0.04  | NO-OP |
 | L1b camera torch (&torch=0)       | night   | 236.76 vs 236.84 / 238.1 vs 237.9 / =  | 0.7   | NO-OP |
 GZ Z8 (a202): cells 9911662/3 F 0.4063/0.4375 (truth 0.43/0.40) PASS; the r2 rule gives 0.0714/0.0597, &skyshell=0 the same. Cost
 (§SKY_SHELL_RAYS, Hospital, first press, IDB-cached after): reach=air recomputed=22154 (airOnly 7145, lifted 2793) rays 1.58 M passMs
 10.6..11.1 s, vs r2 15009 cells / 1.08 M rays / 6.6 s.
FILM (Hospital AjaibPath 0:90, 15 fps): A/C/E/T all rows PASS except the WARN "SW unregistered=1, no pre-purge _INIT after" on every CLI
 bake. A vs C 93.63 vs 139.44, A vs E 93.63 vs 149.93, overlay identity A vs B PASS (after the 1bf2831f normaliser fix), programs 110 ->
 149 constant f>=2, step max +0.020/-0.067 per frame (capped down 6), 0 black/white/reused frames (in-page §FRAME_QA and ffprobe).
 B (reference, v1473, lawHash 918804c2) rows PASS against its own tree facts. Alt+C (in-browser, 90 frames, §MAXQ_DONE, lawHash
 dc0e8638, torch line once): every row PASS except programs.
NON-PASS ROWS, cause + evidence:
 1. G4 FAIL clinic / inner / term (too dark), night / p672 (clipped), plenum (G3 + G4): ONE cause. The lamp remeter reads the frame the
    STAGE meter read, not the staged scene. Evidence: §METER_HIST bandL stage | remeter = clinic 2.430e-3 | 2.430e-3, inner 4.527e-3 |
    4.527e-3, term 6.967e-3 | 6.975e-3, night 5.886e-3 | 5.650e-3; EV stage == final at 9 of 12 poses. The torch build's 3rd render at
    the SAME poses read the staged scene: clinic 6.807e-4 (EV 6.95), inner 1.270e-3 (7.85), term 1.025e-3 (7.54), night 8.877e-2 (13.98)
    (photoreal_probes/b1/torch_<pose>.log). Clinic closes numerically: old/new exposure 153.02 / 42.86 = 3.57 = bandL 2.430e-3 / 6.807e-4,
    and p50 63.3 -> 23.1. What changed between: ALTS-ALL moved the torch before SourcedLight.stage and deleted the torch remeter —
    the only render between staging and the lamp remeter (effects.js diff 931882df..e0d2082b). The mechanism is in ### ALTS-ALL FIX 1
    below (r186 getProgram: a new program key clones install-time §SOURCED_LIGHT uniforms). Plenum is the partial case: the remeter
    sees the lamp tail (70/95 band 2.632e-1) but its dark floor stays at the stage frame's 2.66e-3 (old 6.84e-4) -> EV 11.93 vs old
    10.44, clip 9.25 %. §METER_STATE shows what changed between the meters (ground 555566->ffffff, point 0->1, hidden 1->36/38) — it
    does not explain equal bandL. WITNESS NOTE (scope-blind row): G3 "stage -> final <= 1 EV" PASSES a remeter that re-reads the
    identical frame (it passed at 9 poses here). A row "remeter bandL != stage bandL when staging changed the scene" would have caught it.
 2. NO-OP torch (inner, night): torch staged (§CAM_TORCH on intensityUnits=3.960e-2; §METER_STATE spot=1/0.0396; §SOURCED_LIGHT_BIND
    spots=1; slPass(zone 0) = 1, unbound passes) but its effect is below noise. Saved-PNG diff base vs torch0: inner 0.087 % px > 4
    codes/ch, meanAbs 0.415 (noise base vs base_r2: 5.73 %, 1.018); night meanAbs 2.41 (noise 2.06). Film T: per-frame YAVG max |A - T|
    = 0.28/255; the judge prints PASS because same() uses a fixed 0.01 with no noise baseline -> read the film torch effect as unproven
    too. Cause not isolated. Candidates: target distance/exposure (FIX 4 below: close pose), or a spot shadow map never drawn while
    shadowMap.autoUpdate=0 (§METER_STATE shadowAuto=0/0).
 3. SCOPE-BLIND &gridblend=1 (default OFF, not in the look): mean/p50 unchanged; PNG diff 8.6 % px > 4/ch vs noise 4.9 % = acts
    locally. Not blocking.
 4. Alt+C programs 137 -> 139 at f85 (bake FAIL): the camera cuts f84 -> f85 ([62.63,92.79,69.96] -> [-58.43,70.26,85.21], 123 m in one
    frame) while §BAKE_INTERIOR_TOPUP lamps go 30 -> 50 and §STILL_REFINE restarts; 2 programs compile mid-film. The CLI bakes A/T stay
    at 149 for f>=2. Sky is ruled out (skyPx > 0 already at f2-8 and f54-71). New materials first visible after the cut = likely, not
    isolated.
 Z18 (not a row, WARN): §SPEC_SMOOTH changes the image (PNG diff 11.9 % px > 4/ch, 1.40 % > 16 vs noise 4.9 % / 0.32 %), but the step
    proxy cannot judge teeth: base 3.63, base_r2 6.07, specsmooth0 3.82 (noise > effect). The Z18 teeth count after SPEC_SMOOTH is still
    owed to the direct instrument (b1/t3*.js + z18gate.py). hueNoise (WARN, not judged): plenum 79008, hhs_z18 645.
SETUP CAUSES SEEN (so the rerun avoids them; all were caught as INCONCLUSIVE, then re-run clean):
 a. WebGPU OOM on 5 presses (a202 base/skyshell0/shellreach2, a616, p672): `GPUOutOfMemoryError: vkAllocateMemory failed with
    VK_ERROR_OUT_OF_DEVICE_MEMORY` from '§GI_STILL stage copying the building' (2846..8077 lines per press; 0 in the torch run). red1's
    desktop Chrome held 3204 MiB of 8188 MiB then (590 MiB at the re-run). Before a GPU run: `nvidia-smi --query-compute-apps=pid,used_memory`.
 b. HospitalAjaibPath.db 404 in /tmp/wt-all film bakes A/C: cli_silent_bake serves --root with no ~/bim-ootb/buildings fallback
    (serve_tree.js has one) -> §CLI_BAKE_LOAD_FATAL §DB_404_OCI_FAIL. Fix = the gitignored symlink /tmp/wt-film2 already had:
    `ln -s ~/bim-ootb/buildings/HospitalAjaibPath.db <tree>/buildings/`.
 c. B tree sw/lawHash mismatch BY DESIGN (B = the pre-merge reference): the judge compared it to this tree -> INCONCLUSIVE by
    construction; fixed f49048f2 (B judged against --base-tree facts).
 d. p2: three-mesh-bvh CDN import failed (§BVH_INIT_FAIL) -> §SKY_SHELL_RAYS "no BVH" recomputed=0 while G1 PASSED; G1 row added
    e5417ab3. Viewer note (not checked): the press saved §ZONE_IDB_CACHE field=1 anyway — whether a later press reuses a shell-less field.
 e. Alt+C channel: harness called startMaxQualityOrbit without editor:false -> §CPE_OPEN, the editor waited 23 min, no frame. The
    witness clicked #cpe-ok once over CDP (the real Alt+C one-click OK, no edit = derived plan); fixed ad6e40aa (auto-OK, every terminal
    §MAXQ tag, 15-min stall guard). Also f49048f2: the in-browser race row = single-init check (was INCONCLUSIVE by construction).
 f. Overlay identity A vs B failed only on '§CLASH_RTREE ready … in 1085ms' (no space) -> normaliser fixed 1bf2831f.
 g. `--help` is not a flag: it starts the full run (killed, output discarded).

### ALTS-ALL FIX 1 (2026-09-27) — ONE METER READING PER STILL, on a BOUND final scene — bim-ootb `fix/alts-all-2` (from fix/alts-all @f49048f2), sw v1475
CAUSE (code + the saved lines, /tmp/alts_all/raw): three r186 `getProgram` (lib/three.module.min.js, `dt()`): when a material needs
a program key it has not had before (new light count / spot-shadow count, or the meter's own variant: float target + NoToneMapping +
fog null), it runs `s.uniforms = getUniforms(e)` = a fresh clone of ShaderLib[k].uniforms and makes it `properties.uniforms`. For the
§SOURCED_LIGHT uniforms that clone carries the INSTALL-TIME values: the shared typed arrays (P, SKY, IRP, LAMP, COVEP: live, so
uSLParams.x = 1 "staged") but the DUMMY textures (uSLZone = 1x1 zone 0, uSLGround, uSLIr, uSLCove, uSLLampT/LIdx/Clu, uSLAoT).
`push()` (sourced_light.js 737) re-binds only when called, and its callers run BEFORE the draw: stage()'s push (on the old uniforms)
and scene.onBeforeRender `own` (only when renderer.info.programs.length changed — blind to a new key served by an existing GL program).
So a meter render that creates program keys draws the scene with sourced ON + zone texture = dummy: every fragment reads zone 0 =
"not in a zone" -> slPass() returns 1 -> nav hemi/ambient indoors, no IR, no cove, no lamp data = a DIFFERENT scene from the still.
 WHAT EACH READING SAW (inner room / night / plenum; §METER ms = compile time):
 - fix/alts-all stage meter: torch staged just before -> spot-shadow count 0->1 -> every lit material gets a new key in the meter's
   own render (ms 4170 inner) -> DUMMY scene. Lamp remeter: lamp rebuild -> point count 0->1 -> new keys again (ms 3875) -> DUMMY
   again. Both identical at inner (bandL 4.527e-3 both, EV 9.68) = "stable" only because both were wrong the same way.
 - torch build @1dd60a62: stage meter DUMMY (9.68 inner); torch remeter compiled the torch keys and drew nothing (all sky); lamp
   remeter: no new key, `own` pushed on the programs.length change -> the only BOUND reading of the press = 7.85 inner, 13.98 night
   (x15 of the dummy 10.07). That is why the torch build's interiors were 63/131/140 and this tree's 23/36/20.
 - PROOF IN THE SAVED LINES (no new run): §METER_STATE's own no-ground re-read at night (second render, keys now exist, `own`
   pushed) gives noGroundL 8.880e-2 vs L 5.886e-3 = groundShare −14.1: hiding the ground cannot make the band 15x BRIGHTER — the
   re-read was simply the first bound render. Same x15 as the torch build's bound final (EV 10.07 -> 13.98).
 - the other §METER_STATE deltas: ground 555566 -> ffffff = the ground is NOT yet staged at the stage meter (§GROUND_COLOR_ORDER_FIX
   reasserts colour x gain 2.30 after SourcedLight.stage; getHexString clamps 2.30 to ff) — the stage meter reads the wrong ground at
   every outside pose; hidden 1 -> 36/38 = the lamp rebuild's MeshBasic fixture glows (the §METER_EV v2 emitter mask working as
   meant, not lit surfaces: inner/clinic/term bandL unchanged by them); point 0/0.000 -> 1/0.000 = one pool light at intensity 0,
   whose only effect is the key change above. The all-sky guard never fired (no remeter was all-sky) — not a factor.
RULE (implemented): ONE §METER reading per still, taken on the FINAL staged scene (after the lamp rebuild, ground reassert, torch,
albedo, glass env capture — immediately before §STILL_REFINE start), and taken on BOUND uniforms:
 (a) meterRead() primes: one render into the meter target (creates every key this exact render needs), then push() on every scene
     material, then the measured render. §METER_BIND line: programs before/after prime, rebound = materials whose uniforms object the
     prime replaced, dummyAtRead = staged lit materials still on the dummy zone texture at the read (must be 0 while staged).
 (b) SourcedLight.stage() no longer sets exposure: it logs `§METER_DIAG camera=.. EV100=..` (+ its §METER_STATE tag=diag) — a
     diagnostic only; effects.js calls SourcedLight.meterFinal(A) once (replaces the lamp-remeter call, which only ran with the night
     still boost); it prints the ONE `§METER camera=.. tag=final` + `§METER_STATE tag=final` + `§LIGHT_LAW tag=final`.
 (c) `own` also re-pushes any staged material whose properties.uniforms object changed since its last push (not only on a
     programs.length change) and logs `§SOURCED_REBIND n=` when it had to — it cannot rescue the frame that created the key (its hook
     runs before the draw), so it counts how many app frames drew with dummies (diagnostic for a follow-up: first TAA frame / glass
     env capture — same mechanism, NOT fixed here).
 §METER_STATE kept; adds hiddenKinds (sky/sprite/points/line/basic/shader + first names) and torchShadowMap (0/1).
WITNESS: harness G3 "one §METER per still, after the lamp rebuild + ground reassert" (count == 1, order), G3 "meter read on bound
uniforms" (§METER_BIND dummyAtRead == 0, rebound reported), G3 "stage diag -> final" printed as INFO with the §METER_STATE diff.
Red control (selftest): two §METER camera= lines => FAIL; dummyAtRead > 0 => FAIL.

### ALTS-ALL FIX 2 — film bakes A/C 404 (instrument)
CAUSE: cli_silent_bake.js serves only its own --root; HospitalAjaibPath.db is git-ignored and was absent from /tmp/wt-all/buildings in
pass 1 (§DB_404_OCI_FAIL, exit 2 in 3-4 s; the witness agent symlinked it at 16:32, after A/C). FIX (harness): before any bake, for
the film DB and Hospital_silent_local.db (ALTC_SHOWSTOPPERS §FILM_LAW RESULT: both symlinked in v1) link <tree>/buildings/<f> ->
~/bim-ootb/buildings/<f> when absent and log `§ALTS_FILM_DB`; a missing source => the bake is not run and its F-G1 row
"building loaded" is INCONCLUSIVE naming the file. Judge F-G1 "building loaded": no §DB_404 / §CLI_BAKE_LOAD_FATAL in the log.

### ALTS-ALL FIX 3 — WebGPU OOM (instrument + measure)
The harness ALREADY launches a fresh browser + profile per press (pressStill: launch … finally b.close()); the 5 OOM presses (a202
x3, a616, p672 — all Hospital aerial/outside + gi_still WebGPU) were single presses in a fresh browser. So per the rule "one press
alone OOMs = a real defect" it is reported with numbers. Harness adds: nvidia-smi sampling every 3 s during each press (total used
+ per-pid for the press's chrome gpu-process and every other GPU process, e.g. the user's own Chrome), peak logged per press as
`§ALTS_GPU_MEM` in the record (rec.gpu), and the G1 OOM row detail prints the peak.

### ALTS-ALL FIX 4 — torch judged at a CLOSE pose (instrument)
900 cd at 8.9 m (inner room centre hit (18.1,−8.4,3.5), §LIGHT_STACK) is 11 lx on a surface lit by ~100s of lx: a NO-OP there is
physics, not a dead switch. New pose `inner_close`: the inner room camera moved along its own centre ray to 1.5 m from that hit
(cam [16.72,−8.28,2.92], tgt [18.1,−8.4,3.5]; 900 cd at 1.5 m = 400 lx). torch0 arm runs at inner_close; the torch G2 rows at far
poses (inner, night) print INFO (not NO-OP, not blocking) with the numbers.

### ALTS-ALL FIX 5 — Alt+C programs 137 -> 139 (instrument first)
altc.log (pass 1): programs 103 (f0) -> 137 (f1, staging) -> 139 at f=85, the frame where the orbit first swings to the far side
(skyPx 0 -> 1120, cam [-58.4,70.3,85.2]): 2 programs compiled for objects entering the frustum for the first time (three compiles
lazily per visible object). Harness adds an in-page program census for the altc channel (`§ALTC_PROGRAM_NEW f= names=` — the
material type/name of each material whose program is new since the last frame). Decision after the census: if the late programs
belong to our staging (torch shadow, a staged material), fix it; if they are scene materials first seen at f=85, document (the film
judge's "programs constant f>=2" row then becomes WARN with the names, since a first-seen material is not a staging defect).

### ALTS-ALL FIX 6 — DEFECT 6 (red1, v1464): Terminal glass see-thru on canvas, OPAQUE after Alt+S — re-scoped to carried state (S4)
red1 (coordinator relay): gone after a Chrome restart; seen only after many Alt+S presses in one long-lived tab while headless GPU runs
shared the 8 GB card (WebGPU OOM seen then). The PNG tEXt counter (glassLow=2, glassOpaque=0) did not see it = scope-blind.
TEST (harness, instrument): (a) `--sequence`: ONE tab on Terminal, red1's six poses (tr1..tr6 from the PNG tEXt of
~/Downloads/bounce_still_1790495808484/…6624063/…6658867/…6698786/…6721496/…6748431) pressed twice (12 presses, Esc between);
per press: composite look, glass see-through, JS heap, renderer.info (geometries/textures/programs), materials, §GLASS_FRESNEL clone
count, GPU memory of this tab's gpu-process (nvidia-smi per pid, 3 s), any allocation-failure/OOM/context-lost/page-error line. The
fresh-page presses tr1..tr6 (ordinary base presses) are the control.
 GLASS SEE-THROUGH (G6, every Terminal press): glass pixels = a 32x18 ray grid whose FIRST hit is glass (a §GLASS_FRESNEL clone, or
 transparent with opacity < 0.95, or transmission > 0); at those pixels the staged scene rendered linear into a float target with the
 glass visible vs hidden (a prime render first — ### ALTS-ALL FIX 1) -> ratio = L_vis / L_hid. Physical rule: transmitted T x
 background + Fresnel x env, no diffuse => ratio in [0.5 T, T + 0.5], T = 1 − opacity. PASS: >= 80 % of glass samples in band;
 n < 10 at a pose => INFO (no glass in view); no Terminal pose with n >= 10 => VACUOUS. Also logs the composite luma at those pixels.
 SEQUENCE (G7): per pose, the 2nd-round press vs the fresh-page press: |p50| <= 5 codes, |glass ratio p50| <= 0.1, |composite glass
 luma| <= 8 codes; growth: JS heap slope <= 20 MB/press, gpu-process peak slope <= 50 MiB/press, textures/geometries 2nd-round minus
 1st-round at the same pose <= 2; zero allocation failures. (Bounds are stated before the run; noise of a Terminal repeat press is
 not measured — a FAIL within 2x of a bound is reported as such, not re-tuned.) Cross-building sequences (red1's tab may have switched
 Hospital/Clinic/Terminal) are NOT covered: the harness loads one building per tab.
 The diffuse-glass hypothesis (a) of the first relay is not chased first (a fresh page is fine); G6 still decomposes it by numbers.

### ALTS-ALL FIX 7 — a zone/field cache written WITHOUT the shell pass must not be reused (GPU run p2: three-mesh-bvh CDN import failed)
light_zones.js: scheduleSave() persists the zone grid but NOT the field when the field's shell pass was wanted and skipped ('no BVH'
or 'failed') — `§ZONE_IDB_CACHE field NOT saved`; restore() rejects such a field from an older record (`§ZONE_IDB_CACHE field
REJECTED`) and rebuilds it. (Fresh-profile witness presses never reuse a cache; this protects a real user's IndexedDB.)

### ALTS-ALL FIX 8 — harness rows the coordinator asked for (instrument)
 - "final meter re-rendered the scene": §METER_BIND logs rendered (renderer.info.render.frame advanced), calls (draw calls of the read
   render) and bufHash (FNV of the float read-back). FAIL when rendered=0 or calls=0; a final buffer byte-identical to the diag buffer
   while §METER_STATE changed => WARN (legit only when every change is off-screen). (The <= 1 EV row was blind to an identical re-read.)
 - film arms vs A: noise baseline = a repeat bake A2 (`--film A,A2,...`): d = mean per-frame |A − arm| luma, noise = mean |A − A2|,
   PASS iff d > max(0.05, 2 x noise), else NO-OP; without A2, PASS only when d > 1 code, else INCONCLUSIVE (a fixed 0.01 threshold
   passed a 0.28/255 difference).
 - in-browser Alt+C: `startMaxQualityOrbit({frames, fps, editor:false})` (the #cpe-ok click stays as a fallback).

### ALTS-ALL FIX 9 — DEFECT 6 CAUSE: glazing in material ARRAYS was never skipped by the GI geometry pass (measured, first rerun)
MEASURED (/tmp/alts_all2, @5f14d0e4): every Terminal press, fresh page AND one-tab sequence, logged `§GI_STILL glass skip: 0` while
`§GLASS_FRESNEL patched={"IfcWindow(R10 pane)":65,"IfcWindow":1,"IfcWindow(members)":4}`; GI mask solid 98.4 % (fresh tr4) = 98.5 %
(sequence tr4). CODE: gi_still.js §GI_GLASS_SKIP `if (!o.visible || !m || Array.isArray(m)) return;` — Terminal's panes are R10
material ARRAYS (frame + pane groups, streaming.js A._r10MatArray = a real Array), so every pane went into the geometry pass as a
SOLID wall and the composite replaced the app's see-through glass with bounce shading of that wall = red1's "alt-s makes them opaque
… sunlight into the hall from an opposing angle" (the bounce lights the pane plane). The one-tab difference: at tr4/tr5 the saved
composite's value at the glass samples was 0 on the fresh page and 192/169 on the 2nd-round press (same mask) — the solid-pane
shading changes with carried GI state; no growth was measured (geometries 1193, textures 1814, programs 129, clones 2, heap and
gpu-process flat over 12 presses, zero allocation failures). FIX: an object with ANY glass group (transparent, opacity < 0.9) is left
out of the geometry pass (its frame keeps the app's pixels too — a sliver); the skip line is logged on EVERY press (was once per page:
a press-2+ change was invisible) with the multi-material count. Smoke tr4: `glass skip: 82 (65 multi-material)`, mask clear 1.58 ->
2.33 %. ROW (G6, blocking): glass skip >= §GLASS_FRESNEL patched glazing count at every Terminal press; composite-vs-app luma at
the glass samples = INFO (the bounce legitimately shades the surface BEHIND a pane). The L_vis/L_hid probe of FIX 6 is kept as INFO:
it read 1.000 at every sample (the probe's float-target render did not draw the clones — instrument, not a scene fact).
### ALTS-ALL FIX 1 (e) — a §SOURCED_REBIND DURING the still's accumulation restarts it (TAA accumulateIndex = −1, the refine loop's
own §STILL_REFINE_RESTART mechanism, max 3 per press): first rerun showed 14–25 materials re-keyed on one accumulation frame after
§STILL_REFINE start at every pose (that sample drew them with the dummy zone texture). §METER_PRIME_APP (the composer-target variant
primed after the final meter) rebound 0 — the late key is a different variant (not isolated; the restart makes it harmless).

§ALTS_ALL_2 RESULT (Opus GPU fix-and-rerun, 2026-09-27) — bim-ootb `fix/alts-all-2` @b19ba5c5 (pushed, NOT merged, no PR; from fix/alts-all
 @1bf2831f), sw v1477 (v1476 = fix/colour-truth), lawHash dc0e8638, served /tmp/wt-all2 :8641, fresh profile per press. Harness run on the
 EXACT commit: `--noise --film A,C --altc 90 --sequence` = 37 presses + one-tab 12-press Terminal sequence + in-browser Alt+C 90 + bakes A, C.
 Logs: photoreal_probes/alts_all2/run3_alts_all.log (the judged table; raw records /tmp/alts_all3), run2_alts_all.log (the intermediate run
 @5f14d0e4 that found FIX 9 / FIX 1(e)), glass_seq*.log, mep_nav.log. Node on the tree: selftest 4/0 (37), light_law 4/0, z8/z9/z10/z11/z12/
 z18/film_exposure 4/0.
 VERDICTS: `§ALTS_ALL_VERDICT FAIL` (PASS 769 FAIL 6 INCONCLUSIVE 3 SCOPE-BLIND 1 WARN 77 INFO 24; 0 inconclusive presses — the a202 WebGPU
 OOM did not recur) · `§BAKE_RELEASE_GATE INCONCLUSIVE` (bakes E, T not in this run's scope; C tripped the SW-race row, see below).
 FIX 1 PROOF — the one BOUND final reading now equals the torch build's only bound reading (§ALTS_COMBINED RESULT) at every shared pose:
 final EV100 pass 1 (unbound) -> fix/alts-all-2 (torch build): clinic 8.79 -> 7.04 (6.95), inner 9.68 -> 7.85 (7.85), Terminal 10.31 -> 7.55
 (7.54), night 10.00 -> 14.11 (13.98), a616 15.33 -> 16.62 (16.62), p672 9.20 -> 10.75 (10.75), plenum 11.93 -> 10.44 (10.44). Rows: "ONE §METER per
 still, on the final scene" PASS all 19 base poses; "meter read on BOUND uniforms" dummyAtRead 0 PASS; "final meter re-rendered" PASS; diag -> final
 EV (INFO) within 0.2 EV except plenum 7.40 -> 10.44 (the lamp rebuild adds the lit 70/95 band: EV 15.02 there) and a616 15.91 -> 16.62.
 LOOK (composite, p5/p50/p95 · le15 % · clip %; PASS = p50 40..200 & clip < 2):
  clinic 45.2/66.3/159.7 · 0 · 2.70 FAIL | inner 19/100.2/141.2 · 0.20 · 0 | term 69.1/78.1/241.9 · 1.07 · 4.53 FAIL | night 43.4/76.0/166.5 · 1.00 · 0
  a616 10.7/58.4/104.3 · 13.49 · 0 | p672 28.8/68.4/193.8 · 0.66 · 0.42 | plenum 6.3/95.6/255 · 17.41 · 21.74 FAIL | p2 35.8/74.6/133.4 · 0.53 · 0.64
  p614 28.2/60.0/137.3 · 0.20 · 0 | p698 50.7/78.6/134.0 · 0.02 · 0.23 | a202 18.3/45.0/168.0 · 3.55 · 0.56 | hhs_z18 0/48.6/152.9 · 29.65 · 0
  inner_close 32.6/45.3/182.5 · 0 · 0 | tr1 52.2/79.9/99.9 · 0.31 · 0 | tr2 53.8/79.0/157.9 · 0.24 · 0.94 | tr3 30.9/88.6/108.7 · 0.49 · 0.03
  tr4 6/55.1/227.9 · 8.28 · 0.16 | tr5 0/60.9/151.5 · 11.05 · 0.19 | tr6 16.3/63.9/164.3 · 4.58 · 0.03
  (pass 1 @e0d2082b: clinic p50 23.1, inner 36.1, term 20.0, night clip 21.7 %, plenum clip 9.25 %.)
 REMAINING NON-PASS (6 FAIL, 3 INCONCLUSIVE, 1 SCOPE-BLIND):
  - clinic clip 2.70 %, term clip 4.53 %: the app frame already clips (GI meanAbsDiff 0.8 / 2.2) — bright exterior through the openings from an
    inside pose at EV 7.0/7.6. red1 RULING 2 ("outside very bright through the openings = WANTED, relative eye adjustment") conflicts with the
    band's clip < 2 %: a rule decision for the coordinator, not a render change.
  - plenum clip 21.74 %: the GI composite adds +46 codes (compositeMean 116.3 vs appMean 70.2, meanAbsDiff 46.2) in the ceiling void — a GI
    bounce defect in tight spaces, not the meter (final EV 10.44 = the torch build's). Not fixed here.
  - G7 sequence tr4 / tr5 / tr6 (2nd-round press vs fresh page): p50 within 1.4-3.7 codes, NO growth (geometries 1193, textures 1814, programs
    129, glass clones 2, heap and gpu-process flat, 0 allocation failures over 12 presses) — they FAIL on the glass-pixel luma: fresh page 0 at
    tr4/tr5 vs 176-183 / 136-156 in the tab. DIRECT PROBE (glass_seq*.log, one tab, tr4 x3): on the FIRST press of a page every glass sample of
    the saved still is 0 (14/14, app layer AND bounce), the glass clone renders NaN in a float probe render at 7/14 samples; presses 2-3 are
    see-through (app 167-253 = the hall/exterior behind). RULED OUT by numbers (both reverted, not shipped): the §GLASS_ENV cube capture being
    unbound (prime + SourcedLight re-push: rebound 0, same black) and HalfFloat overflow in the capture (6 non-finite texels on EVERY press,
    FloatType capture: same black on press 1). OPEN: first-press black glass — cause not isolated (next: the clone's first program build on press
    0, `newClones=2` only then). tr6's miss (fresh 148.7 vs 130.3) is inside the same tab's own round-to-round spread (150.9 -> 130.3).
  - film C "SW purge / reload race" INCONCLUSIVE: unregistered=1 even with a fresh --profile per bake (A passed the same row) — instrument, open.
  - film A vs E / T: arms not run (scope --film A,C) -> INCONCLUSIVE by construction.
  - a202 Z8 &shellreach=2 SCOPE-BLIND (mean 68.47 vs 66.52, p50 45 = 45, noise 2.02) — the Z8 cells move, this pose's frame does not.
 FIX 2: films A, C loaded (§ALTS_FILM_DB linked HospitalAjaibPath.db 262 MB + Hospital_silent_local.db 315 MB; "building loaded" PASS).
 FIX 3 (OOM, numbers): a202 press alone peaks 4.28 GB of 8.19 GB (a616 4.24). Run 2 OOM'd a202 x3 when red1's Chrome held 2.4-3.3 GB (total
 7.74-7.78 GB at the peak); run 3 (red1's Chrome 0.4 GB): peak 4.82 GB total, zero OOM. => card contention, not a single-press defect.
 FIX 4: torch at inner_close (1.5 m): mean 76.02 vs 75.25, p50 45.3 vs 44.8, EV 6.86 vs 6.83 -> PASS (the torch acts); inner / night INFO.
 FIX 5: census — f=1 +7 staging programs (MeshStandard, batched/instanced building meshes), f=84/85 +1 each = SpriteMaterial (overlay sprite
 first on screen late in the orbit; a `_halo` sprite in the scene) -> row WARN (overlay only), not ours to fix.
 FIX 9: Terminal `glass skip: 82 (65 multi-material)` at every press (was 0); G6 PASS at tr1..tr6 and term.
 FIX 1(e): §SOURCED_REBIND during accumulation -> 2 accumulation restarts at every press, 3 (the cap) at 9 presses (clinic, term, inner_r2 …);
  no rebind after STILL_REFINE start went un-restarted at those 9.

### ALTS-ALL FIX 10–16 SPEC (2026-09-27, pass 3; coordinator decisions D1–D3 for red1) — bim-ootb `fix/alts-all-3` = fix/alts-all-2 @b19ba5c5 + merge fix/colour-truth @564066f5 (ce65724a: keep both; light_zones fp csum + sr; SourcedLight irTint/zoneAlbedo + FIX 1 API; light_zones.js?v=19, sourced_light.js?v=62; sw v1478)
 FIX 10 (D1, harness, ruling 2) — CLIPPING IS COUNTED ONLY ON INTERIOR OPAQUE SURFACES. RULE: red1 ruling 2 ("outside very bright
  through the openings from an inside pose = WANTED, relative eye adjustment; do not cap"). Per press, after the still, the harness
  classifies every clipped (L >= 250) pixel of the SAVED composite by the surface under it, from the staged scene itself (no pose is
  excluded): pass (b) "first surface" = every mesh re-materialled flat (lit opaque -> black, glass [§GLASS_FRESNEL clone | transparent
  opacity < 0.95 | transmission > 0] -> blue, drawn after opaque without depth write, every non-lit material [MeshBasic emitters,
  sprites, points, lines, raw shaders] -> red), sky/background off; pass (a) "zone of the first OPAQUE lit surface" = glass materials
  and non-lit meshes hidden, SourcedLight.debugZones(1) (the shipped §SOURCED_LIGHT_ZONE_DEBUG readback: R,G = slFragZone zone,
  B = sky flag) into a float target at the composite size. Classes: EMITTER (first surface non-lit: a source seen directly — it is
  the light, not a lit surface), EXTERIOR (no opaque surface = sky, or its zone is 0 = outdoors / 65534 = off-grid), INTERIOR (zone
  > 0; behind interior glass still interior). Inside camera (§METER camera=inside): the band's clip % = INTERIOR clipped / all pixels;
  EXTERIOR (with its glass-backed part) and EMITTER shares print as INFO. Outside camera: every clipped pixel counts (unchanged).
  Row: G4 "p50 40..200 & interior-opaque clip < 2%" + INFO "clip by surface". Missing classification (probe error / no zone data) =>
  the row falls back to the whole-frame clip and says so (never PASS on a missing readback: INCONCLUSIVE if the whole-frame clip >= 2).
  Selftest red control: a fixture whose clipped pixels are INTERIOR must FAIL; all-EXTERIOR must PASS with the INFO share.
 FIX 11 (D2, viewer, streaming.js) — MEP TRADE COLOUR + PHYSICAL METALNESS. (a) `A._mepTradeHue`: when the extracted discipline is a
  SPECIFIC trade (FP/PLB/ELEC/ACMV/HVAC/SAN/VENT/HEAT) with a chromatic DISC_COLORS entry, the discipline decides; the Revit element-name
  hint decides only when the discipline is the generic 'MEP' or absent (the HHS case it was built for). Hospital's 6,228 FP pipes ->
  FP 0xcc8844 hue, not PLB purple. (b) PBR metallic workflow: metalness is near-binary — 0 for dielectrics incl. painted/coated metal,
  1 for bare metal (Filament, "Physically Based Rendering in Filament" §Parameterization / Standard parameters: Metallic "Whether a surface appears to be dielectric (0.0) or conductor (1.0). Often used as a binary value (0 or 1)"; physicallybased.info
  v2 materials, schema 2.2 updated 202609010742: every metal metalness 1, porcelain 0). STD_MAT defaults of pipes (IfcPipe,
  IfcPipeFitting, IfcPipeSegment, IfcFlowSegment, IfcFlowFitting), ducts (IfcDuct, IfcDuctFitting, IfcDuctSegment) and structural steel
  (IfcBeam, IfcMember, IfcPlate) -> metal 0 (painted/coated: the data gives no bare-metal statement). BARE METAL only when the authored
  material name or the element name says so (galvani[sz]ed|zinc -> Zinc, stainless -> Stainless Steel, copper -> Copper,
  alumin(i)um -> Aluminum): metalness 1 and, when the element has no colour of its own (NULL / exporter placeholder), the cited
  srgb-linear base colour (Zinc 0.808,0.844,0.865 · Stainless 0.669,0.639,0.598 · Copper 0.932,0.623,0.522 · Aluminum 0.916,0.923,0.924),
  stored sRGB-encoded (the colour domain of every _getMaterial albedo, which Z9 decodes at stage); a bare-metal element takes no MEP hue
  (the name states its material). Owner `A._bareMetalKey(cls, name, matName)` via the element variant ('metal:<key>', in the cache/batch
  key like 'porcelain'). DB census (fleet, those classes): Hospital 0 pipe/duct/steel rows + 2 IfcCableCarrierFitting (out of class
  scope) -> the bare-metal branch is VACUOUS on shipped data; node witness proves it on fixtures. (c) the pipe/duct envInt 0.05 overrides
  are REMOVED (their stated reason — §PIPE_DUCT_BLUE_TINT, sky-blue PMREM dominating a metal 0.40–0.45 albedo — is a metalness artefact;
  a dielectric's reflection is F0 0.04 and untinted by the albedo): those classes take the global 0.6 like every dielectric. KEPT:
  IfcBeam/IfcRailing envInt 0 (red1 2026-08-15 "get rid of those railings and overhead beams from been recolorized" = a user source),
  IfcMember/IfcPlate 0.05 and the terminals/devices block (not in D2's scope; listed). Switch `&metalpbr=0` / APP._metalPbrOff (in the
  cache key) = the old table. CANVAS LOOK CHANGE (stated): pipes/ducts/steel lose the ×(1−metal) diffuse cut (0.55/0.60/0.35–0.40) ->
  diffuse albedo ×1.8/×1.7/×2.5–2.9 brighter, hue now fully visible; reflections become weak white dielectric sheen (F0 0.04 × env 0.6;
  in Alt+S the §PHOTO_ENVMAP_BOOST ×2.0 now applies to them because they are no longer envInt-exempt and roughness 0.30 <= 0.5 — that
  boost is itself an unsourced value, listed for the audit, not changed here); Hospital FP pipes orange, PLB purple, ducts green.
  Node witness `viewer/tests/witness_d2_mep_metal.js` (red control = &metalpbr=0 table + old hint order must fail).
 FIX 12 (D3, witness_colour_truth_gpu.js criteria) — the pass-2 criteria were ad hoc: (1) toilet: porcelain stays white (sat < 0.12)
  AND a specular highlight is present: p99 of the porcelain pixel luma > p99 of the matte arm (BEFORE = look @53128dd3, the old
  roughness 0.375 finish), on a 32x32 ray grid inside the anchor's screen box; the "mean within 8 %" part is DROPPED (a glossy white
  correctly reads brighter: Z20 roughness 0.08 adds the specular term). (2) beams/members: the Z21 claim is about the MATERIAL, so
  the row reads the hit material's colour (× instance/batch colour when present) and requires it == STD_MAT steel for its class
  (canvas: max channel diff <= 0.01; still: == LightLaw.srgbToLinear(STD) when §ALBEDO_SRGB srgbfix=1, else STD); the lit-pixel "b >= r"
  test is dropped (warm lamps / the cove legitimately warm a neutral surface — pass 2 row 1 failed on exactly that). (3) FIX 11 moves
  pipe/duct/steel pixels by design: the "MEP placeholder pipes keep their tier-2 colour" row becomes "FP/PLB pipes' material hue ==
  their DISCIPLINE's DISC_COLORS hue (±6°)" and REFS excludes the FIX 11 classes. (4) instrument: expected sw / streaming.js ?v= are
  read from the tree the witness runs in (was hard-coded v1476/78); §PLACEHOLDER_COLOUR / §PORCELAIN counts unchanged.
 FIX 13 (F10, viewer, gi_still.js) — THE BOUNCE ENERGY BOUND (L2). Cause (plenum, /tmp/alts_all3): meanShare 0.54 (IR carries half the
  radiance, R = IR_R 0.5 -> E_ir = R/(1−R) x mean direct = the Sumpner total of ALL bounces), yet the composite added +46 codes: the
  SSGI term (giIntensity 10, a display-space gain, gathering from the tone-mapped frame incl. emitter pixels at 1.0) has no energy
  bound, and a tight void (most rays hit bright near geometry, few escape) is where it is largest. RULE: the interreflected light at a
  pixel cannot exceed k2 x its direct light, k2 = R/(1−R) at the SAME R the zone IR uses (SourcedLight IR_R; zone-average of the bound
  = k2 x mean direct = the Sumpner total, so the bound's zone mean equals the physical interreflection). Composite: added =
  clamp(giT − IR_px, 0, max(0, k2·D_px − IR_px)), D_px = C·(1 − share) (the pixel's non-IR light: sun, sky, lamps, cove),
  IR_px = C·share (both on the display colour — the same approximation §IRC_MAX already states). `&gibound=0` = unbounded (A/B).
  §GI_BOUND line per press: k2, bounded px %, mean added before/after the bound (display codes). Composite-before-tone (Z11 P1–P5)
  stays the planned exact form; this is the energy law without it. Witness: plenum interior-opaque clip < 2 % (FIX 10 classification)
  and the §GI_BOUND share logged; G2 arm gibound0 at plenum (moved => PASS, else NO-OP).
 FIX 14 (F11) — FIRST-PRESS BLACK GLASS. PROBE (probe/f11*.js, Terminal tr4, one fresh tab, press 1 then 2; /tmp/alts_all4/probe):
  press 1: the clones' uniforms ARE bound (uSLZone = the real 184x123x187 texture, same object as a staged wall) yet a float render
  gives NaN at 4/4 glass samples and 1208 NaN pixels frame-wide; glass hidden -> 0 NaN; envMapIntensity 0 -> still NaN (NaN x 0);
  a second §GLASS_ENV capture -> 0 NaN. The capture itself holds NaN texels on EVERY press (nonFinitePerFace [6,0,0,0,0,0]); with an
  explicit PMREMGenerator the NaN reached the glass on EVERY press (three's lazy regeneration happened to wash them out on presses
  2+). Locator (probe/f11nan.js): the NaN texels are a grey Terminal surface seen edge-on in +X; plain MeshStandardMaterial swap, sourced
  light unstaged, every light type off: still NaN; its geometry (batched mesh 924, guid 3Q026pUy1CnxmrPEZ8YaXF) has 145 zero-length
  vertex normals of 16,547 -> normalize(0) = NaN. CAUSE = degenerate normals (the §RED_GREY_MYSTERY repair existed, disabled at
  ~12 s/building). FIX: `A._repairDegenerateNormals` rewritten O(triangles) (first non-degenerate adjacent face normal; a vertex on
  zero-area triangles only rasterises nothing -> copied from a valid vertex at the same position, else counted unfixed; 5 % valve
  removed — a face normal is right at any fraction), run at Alt+S staging, once per geometry version (&normrepair=0 = off,
  §NORMAL_REPAIR line). Kept as guards: explicit PMREM prefilter + re-capture while any material re-keys (§GLASS_ENV passes=
  rekeyedPerPass= nonFinitePerFace= pmrem=explicit). Probe after: Terminal 282,023 degenerate (36 from a face, 244,920 same-position,
  37,067 zero-area only) in 1.24 s on press 1, 1 ms after; nonFinite [0x6]; press 1 glass see-through (app 499-757 at the samples).
  Harness G6 (blocking) "glass see-through on this press" (n >= 10): 0 NaN glass samples AND no black pane over a lit background
  (app <= 2 codes while the glass-hidden linear L behind > 1e-3). First run used "< 20 % black" (my number, no rule): tr4 read 3/14
  black with NaN 0 — a dark object behind clear glass is correctly dark, so the rule was refined to the physical one before the rerun.
 FIX 16 (found by F10's probe) — PLENUM SUN LEAK. With FIX 13 the composite = app (+0.7 codes, was +46) but the APP frame still
  clipped 22 %: probe/plen.js — clipped pixels are INTERIOR (zone 24), L 0.66 linear vs frame median 0.00086, sun off -> 0.00064,
  every sampled sun ray blocked at 1-3 m, and a +-80 m single shadow box -> 0.00064: a SHADOW COVERAGE leak. The §STILL_SHADOW_CASCADE
  depth readback (_csmReadback) drew every mesh DoubleSide while the still draws the §WALL_SIDE closed classes FrontSide; from inside
  the ceiling void its nearest depth was those culled back faces (median view depth 0.75 m; readback 1.01 m where the visible face is
  2.03 m), the SDSM boxes shrank onto them (cascade 0 1.2 x 2.6 m) and the visible surfaces fell in no box. `uncovered=0/14400` was
  SCOPE-BLIND (it judges the readback's own points). FIX: the readback draws each mesh with ITS side (FrontSide pass, then
  DoubleSide/BackSide) into one depth buffer; &csmsides=0 = old; the cascade line prints readbackSides=. Probe after: app clip 21.96 %
  -> 0.78 %, meter EV 10.39 -> 7.32. Arm csmsides0 at plenum (G2).
 FIX 15 (F12, instrument, cli_silent_bake.js + judge) — the SW-race row flagged a FRESH-profile bake: with --profile fresh the first
  navigation installs THIS tree's sw.js; if the purge runs after that install it unregisters 1 (C: purge at 1.6 s, A at 0.5 s) and the
  pre-purge page's _INIT lines repeat after the reload. That page was served by the NETWORK (no controller at load), i.e. by this tree
  — not stale JS. RULE: the race exists only when a service worker CONTROLLED the pre-purge page. The CLI records
  `navigator.serviceWorker.controller` at document start (evaluateOnNewDocument) and logs `controllerAtLoad=0|1` + the registration's
  script URL on §CLI_BAKE_SW_PURGE; judge: race = unregistered > 0 AND duplicated _INIT AND controllerAtLoad = 1; controllerAtLoad = 0
  -> PASS with the detail; line without the field (old CLI) -> old rule.
§ALTS_ALL_3 RESULT (Opus GPU fix-and-rerun pass 3, 2026-09-27/28) — bim-ootb `fix/alts-all-3` @c939e963 (pushed, NOT merged, no PR; viewer code last
 changed @b2daafd0, later commits = harness/witness only), sw v1478, lawHash dc0e8638, served /tmp/wt-all3 :8642, bakes :8662, fresh profile per
 press/bake. Run: `--noise --film A,A2,C,E,T --altc 90 --sequence` = 43 presses + one-tab 12-press Terminal sequence + Alt+C 90 + 5 bakes; then
 re-presses tr4/tr5/tr6 (harness G6 change only) + bake E re-run (first E: page never finished loading, §CLI_BAKE_CRASH 900 s wait, no frame).
 Logs: photoreal_probes/alts_all3/ (run_alts_all.log = every judge pass appended, the LAST block is the verdict; alts_all.json; probes f11*/plen*;
 witness_colour_truth_gpu.log); raw records /tmp/alts_all4/run/raw. Node: selftest 4/0 (42), d2_mep_metal 4/0 (23), z19 4/0 (12, loads light_law.js
 first after the merge), z20 4/0 (35), z21 4/0 (32), z8/z9/z10/z11/z12/z18/light_law_unit 4/0.
 §ALTS_ALL_VERDICT FAIL — PASS 894 FAIL 1 INCONCLUSIVE 0 VACUOUS 0 NO-OP 0 SCOPE-BLIND 2 WARN 77 INFO 40 (0 inconclusive presses, 0 OOM; GPU peak
   per press 1.8-4.1 GB of 8.2).
 §BAKE_RELEASE_GATE PASS — films A, A2, C, E, T + in-browser Alt+C 90: SW race PASS on all (A/C: unregistered=1 controllerAtLoad=0 = this tree's own
   fresh install, FIX 15); A vs C d 45.95, A vs E d 56.39 (noise A-A2 0.109, tol 0.218) PASS; overlay identity 394/394; frame luma / reuse / lawHash /
   fill / exposure step / overshoot PASS on every arm; torch A vs T d 0.093 < tol -> INFO by the FIX 4 rule carried to films (upper-bound torch share
   8.6e-5 < 1/255 at every frame: aerial, camera >= 20 m from its target); Alt+C programs f>=2 129 -> 131 = 2 SpriteMaterial (WARN, overlay).
 §W_COLOUR_TRUTH_GPU INCONCLUSIVE judged=17 fail=0 inconclusive=5 (BEFORE = look code @53128dd3 served from /tmp/wt-res :8652, AFTER :8642). PASS:
   instrument (served tree v1478 / streaming.js?v=81), replaced 10947, mepTier2 44246 / proxyKept 1293, porcelain 554, BEFORE no line; beam/member
   MATERIAL = STD_MAT steel canvas n 143/186 off 0 and still (sRGB-decoded) n 143/186 off 0; FIX 11 pipe/duct hue == discipline hue: plenum 129 MEP
   ducts, beams pose 166 (11 FP pipes, 155 MEP ducts), off 0, metal 0; REFS 0.05/0.00/0.02 codes; toilet canvas white sat 0.054 + p99 197.2 > 191.2;
   Z19 still saturation plenum 0.187 -> 0.296, beams 0.081 -> 0.167 (pass 2: FELL 0.187 -> 0.172). INCONCLUSIVE: 4 MEP-trade-proxy rows with 1 and 4
   pixels (< 5; hue moves: sat 0.04 -> 0.40, 0.13 -> 0.60); toilet STILL — the arms are metered differently (BEFORE has no §METER line; still means
   81.8 vs 40.2), p99 126.9 vs 128.9 at unequal exposure = not a finish comparison (a p99/p50 ratio was tried and DROPPED: no rule behind it).
 LOOK (composite PNG; p5/p50/p95 · le15 % · clip judged [whole frame] · final EV100; D1: inside cameras judge interior-opaque clip):
  clinic 45.1/66.4/145.1 · 0 · 1.67 [2.68] · 6.99 | inner 18.9/81.9/131.2 · 0.43 · 0 · 7.80 | term 66.1/77.0/243 · 1.46 · 0.83 [4.61] · 7.55
  night 45.8/78.8/156.8 · 1.09 · 0 (outside) · 14.04 | a616 11.8/57.2/105.3 · 12.19 · 0 · 16.62 | a202 24.6/45.4/167.6 · 2.50 · 0.59 · 15.45
  p672 27.6/64.3/188.9 · 0.65 · 0.05 [0.70] · 10.70 | plenum 24.1/66.3/134.5 · 0 · 0.78 [0.78] · 7.32 | p2 31.1/66.7/140 · 0.54 · 0.36 [0.64] · 9.99
  p614 27.2/57.7/133.5 · 0.55 · 0 · 14.84 | p698 39.7/75.4/139.9 · 0.02 · 0.19 [0.23] · 9.83 | hhs_z18 13.7/68.9/186.6 · 7.43 · 0 · 14.24
  inner_close 32.9/44.9/166.3 · 0.21 · 0 · 6.82 | tr1 46.6/77.8/99.8 · 1.26 · 0 · 8.34 | tr2 51/71/158 · 0.67 · 0.37 [1.15] · 8.08
  tr3 28.8/84.9/108.4 · 1.45 · 0.03 · 10.89 | tr4 11/48.4/219.9 · 9.17 · 0.005 [0.67] · 13.02 | tr5 9.7/62.7/162.3 · 8.61 · 0 [0.01] · 12.42
  tr6 17/62.6/170.7 · 4.53 · 0.006 [0.05] · 12.45   => all 19 G4 bands PASS (pass 2: clinic/term/plenum FAIL).
 PER ITEM:
  D1 FIX 10 — clip classification live on every press: clinic whole 2.68 % = interior 1.67 + exterior 1.01; term 4.61 % -> interior 0.83; plenum
   (before FIX 16) 22.7 % = interior 22.7 (NOT exterior — ruling 2 did not apply there, the fix was needed). 0 % unclassified at every pose.
  D2 FIX 11 — Hospital 6,228 FP pipe rows -> FP (node, 6228/6228); pipes/ducts/steel metal 0 (built: IfcPipeSegment 9c4eeb/eb9c4e r0.300 m0.00,
   IfcBeam 8c9199 m0.00); bare-metal branch VACUOUS on shipped data (0 named pipe/duct/steel rows fleet-wide; fixture-proven). Arm metalpbr0
   at plenum: mean 74.61 vs 71.44 (G2 PASS). Canvas look: pipes/ducts/steel brighter and fully hued (lit duct pixels 45,94,46 -> 78,133,81).
  D3 FIX 12 — witness criteria as specified; the toilet still is INCONCLUSIVE for the exposure reason above (not re-tuned).
  F10 FIX 13 — plenum composite +46 -> +0.8 codes (compositeMean 69.60 vs appMean 68.79); arm gibound0 mean 74.61 vs 80.81 (PASS); composite -
   app at the other poses 0.1-4.8 codes. The plenum CLIP was not the GI: see FIX 16.
  F11 FIX 14 — cause = zero-length vertex normals (NaN in the §GLASS_ENV capture); first-press glass see-through: tr4/tr5/tr6 G6 PASS (NaN 0; tr4's
   3 and tr6's 1 black samples sit over a background the app itself displays at 0 / 4 codes); §GLASS_ENV nonFinitePerFace [0 x6]; §NORMAL_REPAIR
   Terminal 282,023 degenerate / 1.24 s press 1, 1 ms after; Hospital 79,212 / ~2 s. Arm normrepair0 at tr4 mean 79.22 vs 75.70 (PASS).
  F12 FIX 15 — every bake's §CLI_BAKE_SW_PURGE carries controllerAtLoad (0 on all 6); C's race row PASS (was INCONCLUSIVE).
  FIX 16 — plenum app clip 22.69 % -> 0.78 %, EV 10.39 -> 7.32; arm csmsides0 p50 66.3 vs 10.2 (PASS).
 REMAINING NON-PASS:
  - FAIL G7 sequence tr4: the 2nd-round press in the one tab shows the glass samples brighter than the fresh page — compL 250.4 vs 159.4 (1st round
    in the same tab 172.3; bound 8 codes, stated before the run). p50 48.2 vs 48.4, meter 12.99 vs 13.02, no growth (geometries 1204, textures 1815,
    programs 131, heap/gpu slopes -8.7 MB / 6.9 MiB per press, 0 allocation failures). Same carried-state class as DEFECT 6 (S4); not black any more
    (pass 2: 0 on the fresh page). Cause NOT isolated — suspect the §GLASS_ENV capture/PMREM target reused across presses (the only glass input that
    persists per page). tr5/tr6 PASS this time (Δ 4.6 / 2.0).
  - SCOPE-BLIND (not blocking) Z18 gridblend1 / specsmooth0 at hhs_z18: mean moves 0.93 / 0.01 inside tol 4.8 (noise 2.4).
  - Pre-existing, not this lane: node witness_mep_color_photoreal 54/55 — LTU tinted 107 vs its stored census 102, identical on fix/colour-truth
    @564066f5 (the COLOUR-TRUTH D2 'tomt mönster' decision moved 5 LTU WC rows; the witness's expectation was not updated).
 HARNESS CHANGES THIS PASS (each with its rule): D1 clip classification (ruling 2); G6 black glass = over a background the app DISPLAYS >= 10 codes
  (the first rule "< 20 % black" was mine without a source — tr4 3/14 samples over a 0-code background); film torch INFO when its upper-bound share
  < 1/255 (FIX 4 rule); arms gibound0 / metalpbr0 / csmsides0 / normrepair0; EDITED += glass_fresnel.js, streaming.js; D3 colour-truth rows.
 NOT MERGED to look (coordinator's call): the still gate is FAIL on the single G7 tr4 row; the bake gate is PASS.
### ALTS-ALL FIX 17 SPEC (2026-09-28, pass 4) — G7 tr4: the glass is not the variable; the backdrop behind it is re-rolled every press
 PROBE (photoreal_probes/alts_all4/seq4.js; one Terminal tab; §GLASS_ENV now logs capture# / capMeanL / exposureAtCapture / clonesEnvInt):
  - the coordinator's suspect is RULED OUT by numbers: §GLASS_ENV recaptures on EVERY press (capture#1..#6, one per press), from the final
    staged scene, linear HalfFloat, tone mapping not applied to a render target (exposureAtCapture 0.3825 = the pre-meter base on every
    press, irrelevant to a linear capture), capMeanL at tr4 6.50e-2 / 6.77e-2 / 6.25e-2 over three presses (±4 %); the clones persist with
    envMapIntensity 1.2, opacity 0.1, roughness 0.08 unchanged, and the same PMREM texture object.
  - what DOES change: the scene BEHIND the panes. With glass materials invisible, the displayed background at the same 14 tr4 samples
    reads 252.5/189.4/251.5/253.4 (press 1) vs 180.5/182.8/174.7/180.5 (press 3): the far hits are `MeshBasicMaterial` boxes at 132-153 m
    whose object ids change every press (1443/1445 -> 1591 -> 1687/1688/1689) and cover different samples (6, 2, 9 of 14) — the
    §PHOTO_PROPS skyline ring (effects.js _buildPhotoProps: 40 boxes, bw = 18 + Math.random()*32, bh = 20 + Math.random()*60, shade
    Math.random), rebuilt on every press (_disposePhotoProps on real exit). A sample is sky (253) or a box (~180) by the roll.
 RULE: §PHOTO_VARIATION (2026-07-16, user spec) already says ONE seed, A._photoPaintSeed, "drives every randomized presentation touch",
  re-rolled per press while unlocked and locked by the cinema capture. The skyline's Math.random calls are outside that owner — an unowned
  random. FIX: the skyline draws its sizes/shades from the same seed (the file's own _seededRand, keyed seed + box index). A still is then a
  function of (build, pose, seed). Witness instrument: `&photoseed=<x>` (witness-only URL param) sets and locks A._photoPaintSeed at the
  roll, so every press of every arm and the one-tab sequence render the same variation; the harness passes &photoseed=0.5 (logged in
  §PHOTO_PAINT_SEED ... pinned=url). User behaviour without the param is unchanged (per-press variation while unlocked, now including the
  skyline — which was already varying, only not through the owner).
 WITNESS: G7 sequence tr4/tr5/tr6 as before (bounds unchanged); new G1 row "variation seed pinned (§PHOTO_PAINT_SEED pinned=url)".
 ### ALTS-ALL FIX 18 SPEC (2026-09-28, colour-truth witness instrument; coordinator items 2a/2b)
  (a) MEP-trade proxy population: a 4th pose `proxy` = the first (guid order, up to 80) IfcBuildingElementProxy whose extracted discipline is
      an MEP trade, carrying the exporter placeholder, not porcelain, that is the FIRST opaque hit on the centre ray from 3 m horizontal /
      +0.5 m (the toilet/beam anchor rule). The row reads the anchor's own pixels on the dense 32x32 grid in its screen box (was: the 48x27
      frame grid, 1-4 px): saturation after > before + 0.1, >= 5 px each arm. At the other poses a < 5 px proxy sample prints INFO (the
      population is judged where it is framed), not INCONCLUSIVE.
  (b) toilet still at ONE exposure: after the metered press, the toilet pose is pressed again in each arm with the meter OFF
      (`APP._stillMeter = false`, honoured by both builds: sourced_light.js stage/meterFinal log `§METER off (&meter=0) exposure=`), so
      both arms render at the base exposure; row `stillFixed` = white (sat < 0.12) + p99 of the anchor > the matte arm, judged only if the
      two logged exposures agree within 0.001 (else INCONCLUSIVE). The metered still prints INFO with both EV100. Every arm URL carries
      &photoseed=0.5 (FIX 17; the BEFORE build ignores it).
§ALTS_ALL_5 RESULT (Sonnet GPU run, 2026-09-28) — bim-ootb `fix/alts-all-3` @05d0ee7d (tree unchanged from §ALTS_ALL_3 except the two
 witness-only commits already listed under ### ALTS-ALL FIX 17/18 above), sw v1478, served /tmp/wt-all3 :8642. Run: `--noise --film
 A,A2,C,E,T --altc 90 --sequence` (matches the §ALTS_ALL_3 command exactly, confirmed via `--plan` against /tmp/alts_all4/run's raw
 records before running). Logs /tmp/alts_all5/*.log.
 §ALTS_ALL_VERDICT PASS — PASS=937 FAIL=0 INCONCLUSIVE=0 VACUOUS=0 NO-OP=0 SCOPE-BLIND=3 WARN=77 INFO=40. §BAKE_RELEASE_GATE PASS.
 The pass-3 FAIL (G7 sequence tr4 carried-state) is now PASS: `p50 49.5 vs 49.7 (1st round 49.5) glass ratioP50 1 vs 1 compL 173.623
 vs 171.483 meter 13.02 vs 13.05` — FIX 17's photoseed pin closed it. tr5/tr6 also PASS. All 19 G4 look bands PASS. SCOPE-BLIND (not
 blocking, unchanged from pass-3): a202 shellreach2/skyshell0, hhs_z18 gridblend1 — all inside noise tolerance (0.1-0.2 vs tol 0.200).
 §W_COLOUR_TRUTH_GPU — run 1 (BEFORE fix, log colour.log): FAIL judged=25 fail=1 inconclusive=0. The one FAIL (`Z20 toilet stillFixed:
 porcelain pixels stay white + specular highlight` at fixed exposure 0.383) read mean 0,0,0 / sat 0.000 / p99 0.0 on BOTH arms — flagged
 INSTRUMENT-SUSPECT (not a rendering regression: the SAME toilet pose's regular `canvas`/`still` (metered) modes gave real sensible
 numbers on both arms just above it in the log; two different codebases producing byte-identical degenerate zero is far more consistent
 with a harness timing/read bug in the newly-added FIX 18(b) re-press path than a shared app defect). Coordinator (red1) fixed the
 harness, commit `0323302c` on fix/alts-all-3 (pins both arms to the AFTER arm's metered exposure via `&meter=0&stillexp=k`; an all-black
 arm is now INCONCLUSIVE, never FAIL — no viewer code touched). Run 2 (log colour2.log) after that fix, tree confirmed @0323302c via
 `git log -1`: **§W_COLOUR_TRUTH_GPU PASS judged=25 fail=0 inconclusive=0** — no non-PASS rows.
 GPU: 0 OOM/context-lost across the whole run; per-press peaks 1.3-4.6 GiB of 8.2 (well inside budget).

§RED1_STILLS_0928 A/B (PARTIAL — Sonnet GPU run, 2026-09-28; STOPPED mid-list on red1's URGENT priority to hand the GPU back for a
 30 s film bake, per his instruction; append-and-stop, no further presses were run after this point).
 ⚠ SCOPE CAVEAT (read before trusting any BEFORE number below): BEFORE was meant to be a frozen v1464 snapshot (`/tmp/wt-look`, matching
 the `"sw":"v1464"` every source PNG's own tEXt records) served read-only on :8654. Mid-run, red1/coordinator began live-editing
 `/tmp/wt-look` on the SAME worktree (it is also his interactive :8624 tab) — first to `0323302c` (the colour-truth harness fix, no
 viewer change) then to `9996bd46` ("hotfix: §GROUND_NOMAP_ALBEDO … + torch at rated max power", sw v1480), found via `git -C
 /tmp/wt-look log -1` AFTER this batch's presses had already run. `serve_tree.js` reads files fresh off disk every request, so every
 press below picked up WHATEVER commit was checked out at that instant — BEFORE is a **moving target**, not a controlled v1464 baseline,
 for every row in this run. Where BEFORE ≈ AFTER below (duplex_28pct, castle_dormer) that is now explained: `0323302c` is a commit ON
 fix/alts-all-3, the SAME branch AFTER serves — the two arms may have been running near-identical code by press time, not "the fix did
 nothing." Where BEFORE and AFTER differ (ltu_dark1, hitos_4) the delta is a real measurement but of two POINTS ALONG A MOVING TIMELINE,
 not a clean v1464-vs-fix diff — re-run against a re-frozen `/tmp/wt-look` before citing these as regression/improvement proof.
 Completed (5 of 21, priority order honoured: LTU dark, Duplex 28%, HITOS over-exposure+ground, Castle glass, then next-in-list):
 - **ltu_dark1** (LTU_AHouse, cam [-31.79,3.467,-28.134]): BEFORE(moving) p5/50/95 52/110.1/178.8 le15 0.066% EV100 n/a (indoor CIECAM02
   line, no EV100 field) meanSat 0.270 | AFTER(fix-alts-all-3) p5/50/95 11.4/57.7/98 le15 12.763% EV100=16.71 exposure=0.1768 (-1.11
   stops) meanSat 0.429. Both §FAULT glassOpaque=1 glassLow=1. Note: BEFORE's le15%=0.066 does NOT match red1's original v1464 reading
   of 52.6% near-black for this pose — consistent with the moving-BEFORE caveat above (BEFORE had already picked up brightening fixes).
 - **duplex_28pct** (Duplex, cam [-3.531,-0.868,3.254]): BEFORE p5/50/95 0.8/7/246 le15 61.28% clip{interiorPct 0.003% only, zone "6"} EV100
   =12.72 exposure=2.805 (+2.87 stops) | AFTER p5/50/95 0.8/7/246 le15 61.29% — effectively IDENTICAL to BEFORE (both arms same branch
   by press time, see caveat). §FAULT OK both arms (no fault flags) — the 28.2% clip red1 saw on his ORIGINAL v1464 capture is not
   reproduced by either arm here; whatever fixed it landed before this run's BEFORE was captured. D1 classifies the clip that IS present
   (39/37 px, 0.003%) as 100% interior-surface (zone "6"), 0% sky/exterior, 0% lamp-glow — not the 28.2% split red1's own capture showed.
 - **hitos_4** (HITOS, cam [10.837,0.589,0.524], red1's "over exposure" pose): BEFORE p5/50/95 70.7/192.6/250 le15 0.001% clip 0.12%
   (100% interior, zone "112" dominant) EV100=12.51 exposure=3.2507 (+3.09 stops) | AFTER p5/50/95 0/29.6/222.1 le15 37.15% clip 0.119%
   — SAME meter line (EV100/exposure byte-identical both arms) but AFTER's composite is far darker (le15 37% vs 0.001%) despite identical
   exposure: the difference is downstream of the meter, in the two builds' scene state, not a fresh over-exposure candidate-fix check
   (the caveat applies here too — cannot attribute this cleanly to "AFTER" vs "BEFORE" since BEFORE may have out-run AFTER on fixes).
   **HITOS ground — CONFIRMED LIVE, matches the DB-side prediction exactly:** both arms log `§GROUND_Y src=gf-storey-slab(u.etg)
   z=27.63 y=-3.89`. Pre-computed via sqlite3 against `HITOS_extracted.db` (no IfcSite rows; exterior "Ytterdør" doors cluster at
   z=24.2-24.7, the true grade): `tools.js` `_calcGroundY` Step 1 (`/tmp/wt-look` lines 8-91) DOES match storey `u.etg` (already in the
   `gfNames` allowlist) but its "top-5-by-area, then lowest-of-5" rule picks slabs at z=28.02/28.02/27.76/27.80/27.63 that are tagged
   `u.etg` in the DB yet sit at 1.etg's own elevation (1.etg wall_bottom_min=27.615, Δ0.015 m from the picked 27.63) — a storey-bucket
   bleed in the source IFC (u.etg's own slabs legitimately span z 24.05-31.21, a mezzanine/double-height condition), not a tools.js
   name-matching bug. The true entry-level slab (z 24.05-24.23, area 105.82) is smaller than 5 higher slabs sharing the label, so it
   never enters the top-5 window the lowest-of-5 rule scans. Ground plane sits ~3.4-3.6 m (about one storey) too high. Identical on both
   arms — confirmed by `diff` of `tools.js` lines 1-92 between `/tmp/wt-look` and `/tmp/wt-all3` (byte-identical) — a DATA/heuristic
   defect, not something FIX 1-18 touched.
 - **castle_dormer** (SampleCastle, external landing-page IFC, NOT Modeller-authored): BEFORE/AFTER effectively identical (moving-BEFORE
   caveat) p50 61.2/61.3, EV100=8.58 exposure=49.57 (+7.02 stops, a very dark interior), §FAULT glassOpaque=22 both arms.
   **glassOpaque=22 provenance (measured, all 22 identical both arms):** every hit is `ifc_class=IfcWindow` per `elements_meta`, mesh
   material `MeshStandardMaterial transparent=false opacity=1`, each with a real authored solid colour (e.g. "dakkoepel 1000x" (dormer
   window) colour `646557` olive-grey; two "stelkozijn" (window frame) instances `370d00` dark brown and `d8b17a` tan). `plates.glassDb=0
   /glassMeshes=0` confirms this model has NO IfcPlate-based glazing at all. Detection is NOT missing anything by class convention — it
   correctly flags IfcWindow — the SOURCE IFC exports these windows with a solid frame/pane material and no separate transparent glazing
   sub-material, unlike Hospital/Terminal's IfcPlate-glass split. This is a source-model authoring characteristic, not an instrument gap.
   **Dormer dark-speckle probe (contrary to the sloped-surface hypothesis, measured):** 162-164 isolated dark pixels found (L<=20,
   neighbour contrast >=45), 60 raycast-sampled. Only **1 of 60** hit a genuinely sloped (non-axis-aligned) surface (maxAxis=0.906); the
   other **59/60 hit AXIS-ALIGNED surfaces** — mostly `IfcDoor` meshes at normal=[1,0,0] (14) and unclassified mesh faces at normal=
   [0,0,-1] (38, the largest single group) — all reporting zone=65535 (sentinel/solid) at the hit point. **31/60 samples showed a
   SOLID/open flip** within one voxel-step (cell×0.6) along the surface tangent — real zone-lattice inconsistency, but on wall/door
   faces near the dormer, not on the sloped roof itself as hypothesised. hueNoise 528 / hueCls {behindGlass:0 blackMat:0 other:64
   miss:0} (both arms) — the "other" bucket (unclassified-by-material rainbow-edge pixels) dominates; not further split by this probe.

**HITOS ground — URGENT diagnostic (Hospital, red1's outdoors-all-dark pose, 2026-09-28):** requested separately from the fleet A/B
 above — different building (Hospital, not HITOS; filed here as it's the same ground/exposure diagnostic class of work this session.
 Live LIVE-look code check, `/tmp/wt-look`, found at commit `9996bd46` at press time (NOT `0323302c` as first stated — it had already
 moved forward again), a hotfix titled "§GROUND_NOMAP_ALBEDO (ground drew white × 2.3 albedo before its texture loaded → meter blacked
 out outdoor views)" (sw v1480). Pose cam [-80.492,31.033,24.844] tgt [-6.162,-13.338,8.453] (red1's still …1790549015779: outdoors all
 dark, p50 21, 42% near-black on whatever build he captured that on). MEASURED on `9996bd46`: **p5/50/95 = 24.3/82.1/144, le15%=0.79**
 — i.e. the reported defect is NOT reproduced on this commit; p50 is 4x higher and near-black is 0.79% not 42%, consistent with the
 hotfix's own stated purpose already having fixed this exact symptom. `§METER` (final): `EV100bands[70/95=16.23 40/90=15.77
 10/90=15.23] Lavg=7006.8cd/m2 EV100=15.77 exposure=0.3379 vs base 0.383 = -0.18 stops skyPx=0/14400 pixels=7201 hidden=36`. `§METER_STATE`
 (final): `ground=5e5e5e gain=2.30 map=0 vis=1 sunI=4.400 ... bandL=3.083e-1 noGroundL=2.984e-1 groundShare=0.032 noGroundSkyPx=8604`.
 skyPx=0/14400 at both meterband settings — this camera angle frames zero sky pixels in the metered buffer. With `&meterband=70,95`:
 p5/50/95=17.3/67.8/121.1, le15%=2.89%, `§METER` EV100=16.23 exposure=0.2469 (-0.63 stops), Lavg=9590.4cd/m2. Sky-exclusion witness
 switch: none exists in the code (checked `sourced_light.js` `meter()`/`meterband` handling — `&meterband=lo,hi` reweights the
 percentile band read from the SAME buffer, it does not remove sky pixels) — third press skipped per instruction.

**Z22 bake-speed GPU witness — NOT YET RUN.** Queued last in this session's plan (BEFORE=/tmp/wt-all3 @05d0ee7d, AFTER=/tmp/wt-speed
 fix/bake-speed @9a271b18 sw v1479); prep complete (DBs symlinked into `/tmp/wt-speed/buildings/`, fix code confirmed present in AFTER /
 absent in BEFORE, a red-control-tested judge script written) but the GPU was reclaimed for red1's own priority work before this ran.
### MEP GREY + COLOUR-TRUTH RESULT (Opus GPU, 2026-09-27) — see ### MEP GREY (Hospital nav) under §ZERO LIST for the nav check.
### COLOUR-TRUTH RESULT — `node viewer/tests/witness_colour_truth_gpu.js 8650 8651` from /tmp/wt-colour (BEFORE = /tmp/wt-look @53128dd3 sw v1464
 :8650 read-only, AFTER = fix/colour-truth @564066f5 sw v1476 :8651; log photoreal_probes/alts_all2/witness_colour_truth_gpu.log).
 `§W_COLOUR_TRUTH_GPU FAIL judged=17 fail=4 inconclusive=4`. PASS: instrument (both arms booted, v1476 + streaming.js?v=78, 0 page errors);
 §PLACEHOLDER_COLOUR replaced 10947 / mepTier2 44246 / proxyKept 1293; §PORCELAIN matched 554; BEFORE has no such line; plenum canvas beams
 cream -> steel (55.5,54.0,50.5 -> 38.2,38.1,38.2, n 143); plenum MEP placeholder pipes unchanged (meanAbs 0.01, n 129); REFS untouched pixels
 plenum/toilet/beams meanAbs 0.00/0.00/0.01; toilet still white (sat 0.025); beams still cream -> steel (94.1,96.3,92.4 -> 76.4,82.6,81.9);
 Z19 beams still saturation 0.0807 -> 0.0887.
 FAIL: (1) Z21 plenum STILL beams stay r > b (136.5,126.0,110.1 -> 131.5,126.4,117.6) — canvas is steel, the still's warm light keeps r > b;
 (2) Z19 plenum still saturation FALLS 0.1872 -> 0.1717 (§IR_COLOUR coloured=489 meanSat 0.116, Y unchanged per zone); (3) Z20 toilet CANVAS
 mean +14.7 % (92.8,91.7,90.4 -> 106.4,105.2,109.5; sat 0.054 < 0.12 passes, the mean-within-8 % part fails — the roughness 0.08 specular);
 (4) Z21 beams CANVAS 39.8,37.5,34.0 -> 24.9,24.5,24.0 — neutral grey, misses the strict b >= r by 0.9 code.
 INCONCLUSIVE (4): the MEP-trade proxy rows sampled 1 and 4 pixels (< 5): the hue does move (plenum canvas sat 0.041 -> 0.398, beams canvas
 0.128 -> 0.600, beams still 0.026 -> 0.429) but under the population rule.

### Z9 SPEC — ALBEDO sRGB (2026-09-27, audit #48; L2) — branch bim-ootb `fix/z9-albedo-srgb` from fix/light-law-module @39959e8a, sw v1466
CAUSE (code): loader.js:145 `THREE.ColorManagement.enabled = false` ("enabling breaks HSL color slider palettes"); streaming.js:1542
`new THREE.Color(r,g,b)` from the AUTHORED (sRGB) IFC values; output encodes sRGB ⇒ every flat albedo is used as linear
(0.5 → 0.5, true 0.214, ×2.3; 0.8 → 0.8, true 0.604, ×1.3) while textures (colorSpace sRGB) are decoded. The switch exists:
effects.js §ALBEDO_SRGB (4400-4431, restore 4641), default OFF since 2026-09-24 because it "darkened the exterior refs
(courtyard_a 73.2 -> 45.0)" — that was BEFORE §METER_EV: the base now includes the eye meter (sourced_light.js meter(), run
inside SourcedLight.stage AFTER the §ALBEDO_SRGB block), which meters the frame with the real materials, so a darker albedo is
re-exposed by the law instead of shown dark. The darkening objection is therefore obsolete by construction; the GPU numbers decide.
WHERE: Alt+S staging ONLY (not the loader). Reasons from code: (a) nav has a FIXED exposure (0.45, no meter) — a loader-wide decode
would drop every nav frame ~1 stop with nothing to re-expose it; (b) loader.js:145's own reason (HSL slider palettes) is a nav UI
constraint; (c) Alt+C (`A._maxqActive`) is outside the block (`if (!A._maxqActive)`), untouched. A colour is a uniform: convert at
stage, restore at unstage (Esc) — no recompile, no program-count change.
CHANGE: (1) LightLaw gains `ALBEDO: { authored: 'sRGB', decode: true }` + `srgbToLinear(c)` (IEC 61966-2-1 EOTF, the exact
expression of three r186 `SRGBToLinear`, bit-identical) + `decodeAlbedo(color)` (skip rule below). (2) effects.js §ALBEDO_SRGB default
= `LightLaw.ALBEDO.decode` (off switches kept: `&srgbfix=0` / `APP._stillSrgbFix = false`). (3) SKIP a colour that is not an authored
sRGB albedo: the ground material (its colour is the §GROUND_ALBEDO linear GAIN 2.3 over a map whose 0.155 mean was measured
sRGB-DECODED — already linear; tools.js:162-166 multiplies AFTER setHex's transfer) and any colour with a channel > 1 (a gain, not a
reflectance). (4) `§ALBEDO_SRGB` line adds `decode=law skippedGround= skippedGain= meanLumBefore= meanLumAfter=` (Rec.709 luminance
mean over converted materials). Light colours (sun/hemi/lamps hex, audit #12/#42) are NOT in Z9 — they stay rows of their own.
WITNESS node `viewer/tests/witness_z9_albedo_srgb.js`: srgbToLinear bit-identical to the r186 function text extracted from
lib/three.core.min.js over 4097 inputs (INCONCLUSIVE if the function cannot be extracted); hand values 0.5 → 0.21404, 0.8 → 0.60383,
0.04 → 0.003096 (linear toe); decodeAlbedo skips gain > 1 and the ground; converts in place and returns the original for restore;
redControl = a γ 2.2 approximation must fail bit-identity.
GPU WITNESS (queue): the poses of §ZERO GPU POSES below, Alt+S on 39959e8a vs fix/z9-albedo-srgb: `§ALBEDO_SRGB srgbfix=1
converted=N>0 decode=law` + `restored mats=N` on Esc (same N); `§METER` ev100 per pose (expected LOWER exposure-independent
luminance ⇒ the meter opens: report Δev100); metrics table per pose, before/after. The refs WILL move; judged by numbers: p50 within
±15 % of before (the meter's job) with p5 lower (contrast restored) = accept; p50 collapse (> −30 %) = the meter did not absorb it ⇒ ⛔.

### Z10 SPEC — AO = visibility of INDIRECT light, radius in metres (2026-09-27, audit #54/#55, blotch rank 1; L2) — branch `fix/z10-ao-indirect` from 39959e8a, sw v1467
CAUSE (code, effects.js @39959e8a): §PHOTO_AO folds N8AO over the FINISHED TAA beauty (adapter 5093-5160, composite
`mix(C, C·AO^4, …)` in the n8ao compositer): (a) it multiplies direct sun + lamps (Frostbite 2014 §4.10.3 p.79: "medium and large
scale occlusion is only applied on indirect lighting"; Filament: "only applied to indirect lighting"; UE `ambient_occlusion_intensity`
"non direct lighting") — a sunlit crease at AO 0.7 loses ×0.7⁴ = 0.24 (−2.1 stops) of DIRECT sun; (b) `screenSpaceRadius` 32 px ⇒
world radius r = 32·2d·tan(fov/2)/H grows linearly with depth (fov 50°, H 921: 0.10 m at 3 m, 0.97 m at 30 m) — the "far wall gets a
large dark band" blotch; (c) intensity 4 is an exponent, not a visibility.
OPTIONS COSTED (code read, no GPU):
 A. SHADER PATH (chosen). Patch three's `aomap_fragment` ONCE at install (sourced_light.js install, next to the §SOURCED_LIGHT chunks,
    before any compile): `if (uSLAo.x > 0.5) { ao = texture(uSLAoT, gl_FragCoord.xy·uSLAo.zw).r; reflectedLight.indirectDiffuse *= ao;
    STANDARD+envmap: indirectSpecular *= computeSpecularOcclusion(NdotV, ao, roughness) }` — three's OWN aoMap maths (indirect diffuse +
    Lagarde specular occlusion), fed by a screen-space AO texture instead of a UV map. `irradiance` there already carries hemi (× F / Gd),
    ambient, IBL irradiance, §IRC_MAX IR and the cove (sourced_light.js 246-250), so exactly the indirect terms are occluded, direct sun
    and lamps (RE_Direct) never. Order: the AO must exist BEFORE the beauty: phase 1 = N8AO world-radius, renderMode 1 (AO only), 24
    accumulated frames into a private half-float target while the screen keeps the TAA frame; phase 2 = TAA re-accumulates 16 frames
    with uSLAo.x = 1 (set around each composer render only, so no other render — probes, meter, shadow — ever samples it; after the
    last TAA frame it stays 1 for the frozen frame — a later composer render is the TAA short-circuit of the same accumulation — and
    is released at teardown: `§AO_INDIRECT released`). Cost: +16
    scene renders per press (≈ +1.2 s on Hospital by the §MAXQ_FRAME_BUDGET measure, TAA ≈ 1.2 s / 16), +1 sampler per lit program,
    program COUNT unchanged (patched at page load, uniform-gated, like every §SOURCED_LIGHT line). TAA jitter vs an unjittered AO
    texture: ≤ 0.5 px registration at depth edges, under the denoise radius (7 px).
 B. Two-render composite `out = C − I·(1−AO)` with I = a second 16-frame TAA of indirect-only light (sun + lamps at 0): same +16
    renders, but emissive and the lamp-data path need their own zeroing and the subtraction happens after TAA clamping — more state,
    less exact. Rejected.
 C. MRT G-buffer (indirect in a second attachment): a composer rewrite. Rejected (large).
 D. Delete AO (audit's first option: F + IR already carry occlusion). F is a 0.5 m cell field (light_zones.js:15 CELL) — it cannot
    resolve a skirting, a mullion or a column foot; the sub-cell band is what AO is for. Kept as the fallback question if A's numbers fail.
RADIUS (cited): r = the sky-view field's cell, 0.5 m (light_zones.js:15 `CELL = 0.5`): the field carries occlusion at ≥ one cell, AO
carries the sub-cell band, so the two do not count the same occluder twice (Frostbite fn 49: an AO already in the indirect term
"should not be applied … again"; min() for overlapping terms — here the scales are split instead). World-space mode
(`screenSpaceRadius=false`, n8ao README: aoRadius in world units), distanceFalloff 1 (n8ao default), intensity 1 (AO = visibility,
no exponent). These are law values: `LightLaw.AO = { radiusM: 0.5, power: 1, falloff: 1, appliesTo: 'indirect' }`.
SCOPE: stills only (`!A._maxqActive`); a film keeps today's composite and today's values (explicitly re-set per phase, so a still never
leaks its config into a film) until Z13 (§FILM_LAW S4) inherits the approved still. Alt+G (effects_gi_poc.js) untouched.
§SUN_SHADOW_RESTORE is bypassed in mode A (direct light is no longer blurred by AO, so there is nothing to restore). Fallbacks: the
patch missing (&sourced=0 / link-fail fallback) ⇒ the old composite with the LAW radius/power ("world-radius step only"), logged;
`&aoindirect=0` ⇒ today's path exactly (A/B switch).
§-LINES (as built): `§AO_INDIRECT mode=shader|composite|legacy radius=0.5m power=1 falloff=1 patch=1` at phase start;
`§PHOTO_AO start … mode=`; `§AO_INDIRECT done mode=shader boundMats= aoFrames=24 taa2=16 taa2Ms= totalMs=`; install:
`§AO_INDIRECT installed patch=1`; teardown `§AO_INDIRECT released (reason)`. Node witness caught one real bug before any GPU run
(aoSet released the texture while the gate was closed = no AO at all; RED on the old line, fixed in 5c1739ec).
WITNESS node `viewer/tests/witness_z10_ao_indirect.js`: (1) the patch applied to the REAL r186 `aomap_fragment` text (extracted from
lib/three.module.min.js): original text preserved, new block multiplies ONLY indirectDiffuse/indirectSpecular, never direct*, gated by
uSLAo.x, only in STANDARD/LAMBERT/PHONG/TOON; (2) LightLaw.AO radius = light_zones CELL (parsed); (3) maths rows: sunlit crease
(direct 1, indirect 0.25, AO 0.7): legacy ×0.7⁴ vs new = 1 + 0.25·0.7 (direct kept); screen-radius world size at 3/30 m vs 0.5 m.
INCONCLUSIVE if the chunk cannot be extracted. redControl: a patch that touches directDiffuse must fail.
GPU WITNESS (queue): §ZERO GPU POSES, 39959e8a vs fix/z10-ao-indirect: `§AO_INDIRECT mode=shader` on every still press, program count
equal before/after (the patch compiles at load), press time delta (expect ≈ +1.2 s Hospital), metrics table; plus at the blotch pose
the patch L spread (p95−p5 of a 64×64 patch on the far wall) before/after, and a sunlit exterior crease's L (direct must NOT drop).
&aoindirect=0 run at one pose = byte-identical §PHOTO_AO line to 39959e8a (the switch is honest).

### Z11 SPEC — BOUNCE (gi_still): real receiver albedo, AO counted once; plan for the composite before the tone curve (2026-09-27, audit #56; L2/L3) — branch `fix/z11-bounce-linear` from 39959e8a, sw v1468
CAUSE (code, gi_still.js @39959e8a): composite (outputFor, 526) `out = C·(1−aoK+aoK·AO) + max(0, recv·GI·gain − C·IRshare)` where
C = the app's FINISHED frame (tone-mapped ACES, exposure applied, sRGB-decoded on sample), GI = SSGINode gathered from that same
display-referred frame × giIntensity 10 (741), recv = the lit colour's hue at a FIXED brightness 0.5 (GI_ALBEDO_EST 482, "not measured
data"), aoK = 0.55 (GI_AO_DEFAULT 452) = a second AO on top of §PHOTO_AO. Three faults: (1) light added after exposure + tone curve
(L3); (2) receiver albedo invented (L2); (3) AO twice (L2 double count).
BUILT NOW (small, safe):
 (a) AO ONCE: GI_AO_DEFAULT 0.55 → 0 — §PHOTO_AO (Z10: the indirect-only AO) is the one AO; gi_still adds bounce only. The dial stays
     (`&ao=` / APP._stillAo) for A/B.
 (b) REAL RECEIVER ALBEDO: a new §SOURCED_LIGHT readback mode (uSLParams.w = 13, the same dithering_fragment switch as the IR share
     mode 9) writes each lit fragment's `material.diffuseColor` (the albedo the app actually shades with: colour × map × vertex colour,
     × (1−metalness) for STANDARD) with marker alpha 0.75. `SourcedLight.albedoMap(A, w, h)` renders it once per press into a float
     target at the bounce resolution (the irShare pattern: same row flip, background null), sRGB-encodes it into a canvas (alpha 255 =
     real albedo, 0 = none: sky, unpatched or blended-transparent pixels). gi_still's receiver uses the real albedo where alpha > 0.5
     and the old estimate elsewhere. `&gialb=0` = the estimate everywhere (A/B). Cost: one app render + one float readback per press
     (≈ the irShare cost, which the §IRC_MAX line reports as ms=).
 §-LINES: `§GI_RECEIVER_ALBEDO real=<px> est=<px> realPct= meanAlbLum= ms=`; `§GI_STILL … ao=0 …` (existing line, new default).
NOT BUILT (plan, costed) — THE COMPOSITE BEFORE THE TONE CURVE (L3):
 P1. Source = the composer's pre-OutputPass buffer (the TAA + AO result, half-float LINEAR, exposure not yet applied) read with
     readRenderTargetPixels at the bounce size (1600×900×4 half floats ≈ 11.5 MB, ~20 ms) instead of the tone-mapped canvas.
 P2. SSGINode on that linear radiance; giIntensity → 1 (the gathered radiance is then in scene units; 10 was a display-space gain).
 P3. Composite in linear: `L_out = L + ρ_recv·GI − IR` with the max(IR, SSGI) rule on LINEAR values (exact, no share approximation).
 P4. The app's exposure × three's ACESFilmic (incl. the 1/0.6 factor, LightLaw.TONE.acesDiv) + sRGB OETF in TSL, identity-checked by
     mode 'coloronly' against the app frame (< 1 code mean abs diff) — the witness that the tone curve was replicated, not approximated.
 P5. L3 re-meter: the meter ran before the bounce existed; with P1-P4 the bounce is part of the light reaching the eye, so the meter
     histogram is taken on L_out (one extra histogram pass on data already in hand).
 COST: ~150-200 lines in gi_still.js + a 20-line readback in effects.js; +20-40 ms per press; risk = tone-curve replication (caught
 by P4's identity mode); gi_still's films hook (§GI_FILM) must follow in the same change (it shares outputFor). Recommended as the
 next gi_still change after Z10's GPU numbers (Z10 changes the AO the bounce sits on).
WITNESS node `viewer/tests/witness_z11_bounce_receiver.js`: GI_AO_DEFAULT = 0 read from gi_still.js; the receiver maths on sample
pixels (a shaded white soffit: C = 0.02 linear, real ρ 0.8 → bounce ×1.6 vs the 0.5 estimate; a dark floor ρ 0.1 → ×0.2); the
readback mode 13 is present in sourced_light.js's dithering branch and writes material.diffuseColor with the 0.75 marker; the
albedo encoder (sRGB OETF bytes, alpha rule) round-trips through the r186 SRGBToLinear within 2 linear codes (the 8-bit sRGB step
at white is 2.28 linear codes). FILMS UNCHANGED (as built): a film keeps ao 0.55 (GI_AO_FILM_PRE_Z11) and the estimate receiver
until Z13. INCONCLUSIVE if a file is
missing. redControl: GI_AO_DEFAULT 0.55 must fail.
GPU WITNESS (queue, desktop WebGPU only — gi_still is OFF elsewhere): §ZERO GPU POSES, 39959e8a vs fix/z11-bounce-linear: the
`§GI_RECEIVER_ALBEDO` line (realPct expected > 80 % of geometry pixels indoors), `§GI_STILL ao=0`, `§GI_STILL_TERM` giterm/aoloss
means before/after, metrics table on the FINAL (bounce) PNG, §GI_PRESS_COST newPipelines ≈ 0 on the second press.

### Z12 SPEC — GROUND HALF from the ground's albedo; SUN PENUMBRA from the 0.53° disc (2026-09-27, audit #21/#57, blotch rank 5; L1/L2) — branch `fix/z12-ground-penumbra` from 39959e8a, sw v1469
GROUND HALF — CAUSE: the hemi ground colour is a fixed hex 0x8b7355 (LightLaw.SCENE.hemi.ground, used as linear, lum 0.4626) ×
hemi I (1.234 after &sky 2.0) ⇒ upward irradiance 0.571 u whatever the ground is or how it is lit. Physics (Lambertian ground,
L2 `L = ρE/π`): the irradiance a downward-facing surface receives from an infinite ground plane is π·L_g = ρ_g·E_g, with
E_g = sun·sinE·f + E_sky (f = sunlit fraction of the ground seen). In three's units the hemi's ground term IS that upward
irradiance (getHemisphereLightIrradiance → mix(ground, sky, ·); the slHemi patch keeps the same split × Gd), so
`groundColor = ρ_g,rgb × E_g / hemi.I`. At red1's 45° noon: ρ_g 0.36, E_g = 4.4·0.707 + 0.938 = 4.05 u ⇒ upward 1.46 u (audit #21:
the render is 0.63× physical on a shaded vertical wall, −0.67 stop).
CHANGE (built): LightLaw gains `GROUND: { sunlitFraction: 1 }` + `groundIrradiance(ρ, sunI, sinE, skyE, f)` + `groundColor(ρrgb, Eg,
hemiI)`; §STILL_BASE (stills only, `!A._maxqActive`) sets hemi.groundColor from them and restores it at unstage. ρ_g = the ground
AS SHOWN: the ground map's mean linear RGB measured at stage time (a 32×32 drawImage of `ground.material.map.image`, sRGB-decoded per
pixel — the same method as the §GROUND_ALBEDO constant, textures/materials/NOTICE.txt) × the §GROUND_ALBEDO gain (2.3); if the image
cannot be read, the code's own measured luminance (earth 0.1599 / paved 0.155, effects.js §GROUND_ALBEDO) × gain as grey. sunI and
sinE from the scene sun (position − target), E_sky = lum(hemi sky) × hemi I (the meter's own Eout term). f = 1 (ground sunlit): the
honest unknown — a façade whose foreground lies in the building's shadow gets up to ρ·sun·sinE too much there (the audit: "slightly
HIGH" in shadow); per-fragment f needs the shadow map at a ground point, which the fragment stage does not have (three's
directionalShadowMatrix is vertex-only) — plan below. `&groundlaw=0` = today's hex. Wetness (#50) not folded in (its own row).
§-LINE: `§GROUND_HALF rho=[r,g,b] rhoSrc=texture|table sunI= sinE= skyE= f=1 Eg= upward= groundColor=[..] was=0x8b7355 (upward 0.571)`.
SUN PENUMBRA — CAUSE: §STILL_SHADOW_EDGE PCF radius 1.5 texels per cascade (effects.js:3591) ⇒ filter width (2R+1)·texel, a
per-cascade constant; the sun's disc (0.53°, Frostbite 2014 fn 29 solid angle 6.6-7.1e-5 sr ⇒ 0.52-0.54°) gives a penumbra
w = d·tan(0.53°) = 0.00925·d growing with the occluder→receiver distance d. NOT BUILT (cost): faithful = PCSS in
shadowmap_pars_fragment (blocker search 16 taps → d → variable PCF radius per fragment), with the §CSM cascade selection
(shadow_cascade.js) inside the same chunk — ~60-90 GLSL lines, +16-32 shadow taps per lit fragment, every shadowed program
recompiles once at load; risk: peter-panning/acne interplay with §129.45 bias. BUILT: the diagnostic — a `§SUN_PENUMBRA` line per
cascade fit (stills): `filterM=[(2R+1)·texel] dMatch=[filterM / tan 0.53°]` = the occluder distance at which today's fixed filter
equals the true penumbra (shorter occluders are too soft, longer ones too hard), so the GPU witness reports how far from the law the
current edge is before PCSS is paid for. LightLaw gains `SUN: { discDeg: 0.53 }` + `penumbra(d)`.
WITNESS node `viewer/tests/witness_z12_ground_penumbra.js`: groundIrradiance(0.36, 4.4, sin45, 0.938, 1) = 4.05·0.36 = 1.458;
vertical wall ground half = 0.729 (audit 0.73); today's 0.286; groundColor × hemiI = upward (round trip); penumbra(10 m) = 0.0925 m;
dMatch for a 4096 map over 100 m at R 1.5 = 4·0.0244/0.00925 = 10.6 m. INCONCLUSIVE if light_law.js cannot be loaded. redControl:
the old fixed hex must fail the ρ·E rule.
GPU WITNESS (queue): §ZERO GPU POSES + red1's night (shade-side) still, 39959e8a vs fix/z12-ground-penumbra: `§GROUND_HALF` (rhoSrc
should be texture), metrics table; at the night pose the shaded façade patch L p50 must RISE (the −0.67 stop) with §GLARE 0/0/0;
an interior pose must move < 2 % (Gd small indoors); `§SUN_PENUMBRA` dMatch per cascade reported. `&groundlaw=0` at one pose =
byte-identical §STILL_BASE line to 39959e8a.

### Z21 SPEC — PLACEHOLDER = NO COLOUR (2026-09-27; red1: "MEP in Hospital even normal canvas, is all greyish. If they lack materials, didn't we have a standard setting?"; "Even beams, columns frames, or any else without material color.") — bim-ootb `fix/colour-truth` from look/combined-0925 @53128dd3, streaming.js ?v=78, sw v1476
**Measured (elements_meta, local ~/bim-ootb/buildings, `material_rgba = '0.920,0.900,0.850,1.000'`, material_name empty on EVERY such row, all 4 buildings that carry it):**
Hospital IfcPipeSegment 14452, IfcPipeFitting 12323, IfcMember 6635, IfcBuildingElementProxy 5008, IfcDuctSegment 4816, IfcDuctFitting 4740,
IfcBeam 1970, IfcFireSuppressionTerminal 1354, IfcWallStandardCase 1226, IfcLightFixture 1151, IfcDistributionControlElement 860, IfcOpeningElement 580,
IfcColumn 506, IfcValve 466, IfcFooting 444, IfcCovering 152, IfcElectricAppliance 138, IfcSwitchingDevice 113, IfcCableCarrier* 150, IfcDoor 5, IfcRailing 4,
IfcWall 3, IfcSlab 2. Clinic IfcFlowFitting 4908, IfcFlowSegment 4441, IfcFlowTerminal 1974, IfcBeam 738, IfcMember 534, IfcSpace 529, IfcFlowController 369,
IfcOpeningElement 338, IfcColumn 159, IfcFurnishingElement 68, IfcBuildingElementProxy 29, … Duplex IfcFlowSegment 427, IfcFlowFitting 358, IfcFlowTerminal 105,
IfcFurnishingElement 45, IfcBeam 8, … JKR IfcOpeningElement 425 only. (Clinic also carries `0.920,0.900,0.850,0.250` — alpha 0.25 = a real transparent
material, NOT the placeholder.) streaming.js §ENTOURAGE already documents this value as "the RPC exporter's default, NOT a deliberate design color".
**Defect.** Only two paths treat it as "no colour": §ENTOURAGE (named RPC proxies, Alt+S only) and MEP tier 2 (`_mepDiscAlbedo`). Every other class
keeps the cream although `_getMaterial`'s STD_MAT (streaming.js ~1232, "§S265 standard reference materials", applied "when IFC author assigned no
material") has a class default: IfcBeam steel 0.55/0.57/0.60, IfcMember steel 0.50/0.52/0.55, IfcColumn concrete 0.65/0.64/0.62, IfcFooting 0.60/0.58/0.56,
IfcCovering plasterboard, IfcDoor timber, IfcFurnishingElement wood, … The gate is `!rgbaStr` — the placeholder IS a string, so it never fires.
**Rule (ONE owner, `A._isExporterPlaceholder(rgbaStr, matName)`):** true iff rgba parses to exactly (0.920, 0.900, 0.850) at 3 decimals, alpha absent or
1.000, AND the material name is not authored (empty, or `≈`-prefixed — `A._isAuthoredMatName`, reused). Then in `_getMaterial`:
 1. MEP tier 2 runs FIRST and is unchanged (its input V stays the placeholder's 0.92, so its output is byte-identical to today).
 2. If tier 2 returned nothing AND the element is a placeholder AND its class has a STD_MAT row → the albedo is the STD_MAT colour. Roughness,
    metalness, envInt already come from STD_MAT by class (unchanged; they never depended on the rgba).
 3. EXCLUDED: IfcBuildingElementProxy — its STD_MAT row is TEAL 0.00/0.78/0.78, a flag colour, not a real-world material (it is the
    §BATCH_BUCKET_CLASS_PAINT "floating blue piece"). Proxies keep the cream (Hospital 5,008). Entourage proxies keep their §ENTOURAGE variant.
    ⛔ OPEN for red1: the 3,715 MEP/PLB/ELEC/FP-discipline proxies (boilers, VAV valves) could take the discipline trade hue by joining MEP_HUE_CLASSES —
    a colour-policy call, not taken here.
 4. Classes with no STD_MAT row (IfcOpeningElement, IfcSpace, IfcDistributionControlElement, IfcSwitchingDevice, IfcCableCarrierSegment/Fitting, …) are unchanged.
 5. The alpha, the §S260d near-white taming, triplanar, §SURFACE_RULES all run after, as before.
**⚠ This changes the NORMAL CANVAS look too** (red1 asked for it there): `_getMaterial` builds the one material both views use. Beams/members turn steel
grey, columns/footings concrete, doors timber, furnishings wood.
**Cache key.** The decision is a function of (rgbaStr, ifcClass, matName) — all three already in `cacheKey`. The red control `A._placeholderOff`
(witness only) is appended as `|phOff` when set, so a flipped flag can never be served a stale material.
**Log.** `§PLACEHOLDER_COLOUR bld= rows= placeholder= replaced= proxyKept= mepTier2= noStdMat= off=` + one `§PLACEHOLDER_CLASS cls= n=` per replaced class,
computed at stream-complete over the REAL stream queue through the REAL owner (as §MEP_HUE_TALLY). VACUOUS when rows=0 or placeholder=0; NO-OP when replaced=0.
**Witness (node, `viewer/tests/witness_z21_placeholder_colour.js`):** detection exact (0.920,0.900,0.850[,1.000] true; alpha 0.25 false; 0.921 false; authored
name false; `≈` name true); IfcBeam/IfcMember/IfcColumn placeholder → STD_MAT colour + STD_MAT rough/metal; MEP placeholder colour byte-identical to
`_placeholderOff`; proxy + no-STD_MAT class + non-placeholder rgba byte-identical; red control = `_placeholderOff` must fail the beam row.

### Z20 SPEC — PORCELAIN (2026-09-27; red1: "at least toilet bowls should have porcelain white") — `fix/colour-truth`, same build
**Measured matches (elements_meta, 7 buildings):** Hospital 282 `Toilet-Wall-Mounted` proxy 0.949,0.953,0.953; 119 `Sink_Wall-Mounted` 0.498 grey;
20 `M_Sink - Island` + 12 `M_Urinal - Wall Hung` placeholder cream; 13 `Urinal-Wall-3D` 0.969,0.969,0.937. Clinic 42 `M_Lavatory`, 24 `M_Water Closet`,
36+6 `M_Sink`, 3 `M_Urinal` (IfcFlowTerminal, placeholder). Duplex 4+2 lavatory, 4 WC, 2 sink. HHS 5 WC, 4 lavatory, 2 urinal (proxy, NULL rgba → today TEAL).
JKR 24 `(TD2) WC` (NULL → today PLB purple), 12 `MRV basic round sink` 0.976/0.937/0.902. LTU 67+13 `WC` IfcFurnishingElement + 5 IfcFlowTerminal.
Terminal IfcFlowTerminal `Porcelain - Linen` (sinks 20, toilets 16+6+6+2+2), `Fixtures - Porcelain - Ivory` urinals 11+8+3. No IfcSanitaryTerminal row exists
in any shipped DB. **False positives found in the same census and excluded by the rule:** IfcSpace `TOILET`, IfcOpeningElement, IfcWallStandardCase
`Toilet Partition`/`WC Trennwand`, IfcDoor `M_Toilet Partition`, IfcFlowController `Lavatory Faucet`/`Kitchen Sink Faucet`, IfcFurnishingElement
`Counter Top w Sink Hole`/`Vanity Cabinet … Sink Unit`, `Urinal Screen`, `Hand Bidet Flexible Hose` (chrome), `WCPU` AHUs, `JWCC_Mask_Dispenser`,
Terminal walls `…CeramicPaint…`, Terminal sinks authored `Metal - Steel, Polished` / `<Unnamed>` 0.224.
**Rule (ONE owner, `A._porcelainVariant(ifcClass, name, matName)` → 'porcelain' | ''):**
 - class ∈ {IfcSanitaryTerminal, IfcFlowTerminal, IfcBuildingElementProxy, IfcFurnishingElement} (fixture classes; spaces/openings/walls/doors/faucet
   controllers never match);
 - an AUTHORED material name (`A._isAuthoredMatName`) decides alone: porcelain iff it contains porcelain | vitreous china | ceramic (Terminal's
   Porcelain rows in, its polished-steel / `<Unnamed>` sinks out);
 - otherwise IfcSanitaryTerminal always; else the element name, whole word, case-insensitive, one of import_worker.js:97's fixture words
   lavatory | water closet | urinal | sink | basin | toilet | wc | bidet — and NONE of the accessory words faucet | tap | hose | partition | screen |
   counter | cabinet | vanity | hole | dispenser (each one is a measured false positive above).
 - It is carried as the element's `matVariant` (entourage first — `A._elementVariant`), which already splits batch/merge/instance buckets and the
   material cache key, so a porcelain fixture never shares a material with a non-fixture.
**Finish.** Colour = the element's own (Hospital 0.949 white stays 0.949). Where the element has NO colour of its own (NULL, or the Z21 placeholder),
the colour is STD_MAT.IfcSanitaryTerminal's "ceramic" 0.88/0.88/0.85 (the class default the sanitary class already has) and MEP tier 2 is skipped
(a toilet is not painted plumbing purple). **Roughness = 0, metalness = 0, ior 1.5 from physicallybased.info "Porcelain"**
(https://api.physicallybased.info/materials, entry `Porcelain`: color [0.745,0.745,0.723], metalness 0, roughness 0, ior 1.5; sources Wikipedia
Vitreous_china/Porcelain/Ceramic, engineeringtoolbox ceramics-properties). Applied roughness = max(0.08, 0) = **0.08** — 0.08 is the existing
§refl floor ("nothing becomes a mirror artefact"), not a new value. envMapIntensity = the global 0.6 (a dielectric: the §HOSPITAL_BLUE_TINT
0.05 override exists only for high-metalness classes, the same argument §GLASS_NOT_METAL made), no triplanar wear texture, no fake grain (glaze is smooth).
**Log.** `§PORCELAIN bld= matched= byClass={…} byKey={authored,class,name} ownColour= classDefault=` at stream-complete over the real queue; VACUOUS when rows=0,
NO-OP (building has no fixture) printed as such. **Witness (node, `viewer/tests/witness_z20_porcelain.js`):** the census rows above in/out exactly;
porcelain material roughness 0.08 / metal 0 / own colour; placeholder + NULL fixtures → 0.88/0.88/0.85; red control = accessory words removed must fail.

### Z19 SPEC — COLOURED INTERREFLECTION (2026-09-27; red1: "The bounce still gives impressive surfacing but its like a black and white still"; law L2) — `fix/colour-truth`, light_zones.js ?v=17, sourced_light.js ?v=51
**Measured (coordinator, Hospital interior):** frame saturation +45 % with `&ir=0` — the zone IR (§IRC_MAX v2) adds a colourless term: E_ir = R/(1-R) x mean
direct E with R = 0.5 on all three channels, so every interreflected photon is white whatever it bounced off.
**L2:** interreflected light carries the colour of the surfaces it left. Per zone, IR colour = the AREA-WEIGHTED MEAN ALBEDO (linear) of the zone's own
surfaces, normalised so the zone's IR LUMINANCE is unchanged (the Sumpner magnitude R/(1-R) and its §LUX_CHECK / §LAMP_EN / meter readers are untouched;
only chromaticity moves). IR_rgb' = IR_rgb x (a_rgb / Y(a)) x Y(IR) / Y(IR x a / Y(a)), Y = Rec.709 0.2126/0.7152/0.0722 (the file's own luminance).
**Where the albedo comes from (the cheaper of the two options):** the zone rasteriser (light_zones.js build) already visits every boundary triangle with
its material and its cells; it now also accumulates, per SOLID cell, the material colour (`mat.color`, the linear value the shader uses as diffuseColor)
over its uniform barycentric samples (sample count ∝ area → area-weighted by construction); glass triangles are not counted. Stored as `alb`
(Uint8 RGB, linear x 255) in the zone record (+ §ZONE_IDB_CACHE; its fingerprint gains the sum of boundary material colours so a colour change
rebuilds). irBuild reads it at each sampled IR face (≤ 4,000 per zone, equal 0.5 m faces = equal areas): the solid cell behind the face.
**Not counted (stated):** MEP/furniture (not boundary geometry — they do not bound a zone), the triplanar texture multiply (colour only), the cove's
own IR share (keeps the cove colour). A cell rasterised before the change (an old cache record) has no `alb` → the zone stays neutral and the log says so.
**Switch:** `&ircol=0` / `APP._stillIrColour = false` = today's neutral IR (red control). **Log:** `§IR_COLOUR bld= zones= coloured= neutral(noAlb)= meanSat= maxSat=`
+ `§IR_COLOUR_ZONE z= faces= alb=r,g,b tint=r,g,b Y before/after` for the 3 zones with the most faces. VACUOUS when no zone has an albedo; NO-OP when every
tint is (1,1,1). **Cost:** +1 Float32 accumulator of 4 x N cells during the rasterise (Hospital grid N from §LIGHT_ZONE stats) freed after, + 3 bytes/cell stored;
irBuild +1 lookup per sampled face. **Witness (node, `viewer/tests/witness_z19_ir_colour.js`):** luminance unchanged to 1e-9 over random zones; grey albedo
→ identity; red wall → red-shifted IR with the same Y; zero/NULL albedo → identity; red control = un-normalised tint must fail the Y row.

### COLOUR-TRUTH BUILD (2026-09-27) — bim-ootb `fix/colour-truth` @c89d7de7 (pushed, NOT merged, no PR), sw v1476, streaming.js ?v=78, sourced_light.js ?v=51, light_zones.js ?v=17
**Node witnesses (logs = the run output; node --check clean on all edited files):**
 - `witness_z21_placeholder_colour.js` pass=4/0 ran=27. Real Hospital queue through the shipped rollup:
   `§PLACEHOLDER_COLOUR bld=Hospital rows=64150 placeholder=57098 replaced=10947 mepTier2=40563 proxyKept=4976 noStdMat=580 porcelain=32` —
   IfcMember 6635, IfcBeam 1970, IfcWallStandardCase 1226, IfcColumn 506, IfcFooting 444, IfcCovering 152, IfcDoor 5, IfcRailing 4, IfcWall 3, IfcSlab 2.
   mepTier2 40,563 = the §MEP_COLOR_SURVIVES_PHOTOREAL census number exactly (tier 2 output byte-identical to `_placeholderOff`, asserted on FP pipe / MEP duct).
   noStdMat 580 = IfcOpeningElement. Red control `_placeholderOff` fails the beam row.
 - `witness_z20_porcelain.js` pass=4/0 ran=33. 25 census rows in/out exact; toilet 0.949 white kept (x0.92 §S260d taming as every white),
   roughness 0.08 / metal 0 / env 0.6 / no triplanar; the same row without the variant = 0.375 / 0.1 (old finish); NULL / placeholder / HHS NULL proxy ->
   0.88,0.88,0.85 (control: NULL PLB terminal without the variant = tier-2 purple 0.533,0.267,0.8). Per building matched: Hospital 554 (282 toilets,
   119+108 grey sinks, 20 island sinks, 12+13 urinals), Clinic 112, Duplex 12, HHS 11, JKR 40, Terminal 74 (all by authored `Porcelain` names),
   LTU 0 (NO-OP: its 85 `WC` rows carry the authored name `tomt mönster` = "empty pattern", which decides "not porcelain" under the rule —
   ⛔ red1: treat `tomt mönster` as a non-material placeholder? one-line change in `_porcelainKey`).
 - `witness_z19_ir_colour.js` pass=4/0 ran=12. max relative dY over 2000 random zones 4.67e-16; grey = identity; red wall (0.6,0.2,0.15) on 0.3 grey IR ->
   0.6396,0.2132,0.1599 (sat 0.75, dY 0); NULL / black albedo = identity; zoneAlbedo reads the SOLID cell behind a face, skips no-albedo cells, old cache -> null;
   source contract (opaque-only accumulation, `alb` in KEYS, colour sum in fp, `|col` in the IR key). Red control = un-normalised tint breaks Y.
**Z19 cost as built:** 7 bytes/cell while rasterising (Uint16 x3 sums + Uint8 count, <= 255 samples/cell), 3 bytes/cell kept + cached; irBuild +1 cell
lookup per sampled face (<= 4,000/zone). Code: light_zones.js +15 lines, sourced_light.js +30.
**GPU witness (queued for the coordinator) — `viewer/tests/witness_colour_truth_gpu.js`:**
`node viewer/tests/witness_colour_truth_gpu.js <PORT_BEFORE> <PORT_AFTER> [63182] > viewer/tests/witness_colour_truth_gpu.log 2>&1` — BEFORE = a server on
look/combined-0925 @53128dd3, AFTER = fix/colour-truth @c89d7de7; fresh profile per arm; AFTER runs first and its poses are replayed in BEFORE.
Poses: plenum cam [-20.496,-5.619,-34.439] -> [-23.527,-6.051,-22.952]; toilet = first `Toilet-Wall-Mounted` (guid order) whose centre ray from 2.2 m
horizontal / +0.8 m is a first hit on it; beams = first placeholder IfcBeam seen from 3 m horizontal / 2.5 m below as a first hit. Per pose: canvas frame
(render + same-task copy) AND the Alt+S overlay canvas; 48x27 raycast grid -> guid -> elements_meta class / placeholder / porcelain; per-class mean RGB
+ saturation; frame mean saturation. Verdicts: instrument (sw v1476, streaming.js?v=78, no page errors) else INCONCLUSIVE; §PLACEHOLDER_COLOUR
replaced = 10947 and §PORCELAIN matched = 554 on Hospital; BEFORE has no such line; Z21 beam/member placeholder pixels cream (r>b) -> steel (b>=r),
canvas and still; Z21 plenum MEP placeholder pipe/duct pixels unchanged (<= 2 codes); Z20 toilet porcelain pixels stay white (sat < 0.12, mean within 8 %);
REFS untouched-element canvas pixels (same cell, same guid, not placeholder, not porcelain) mean abs <= 2 codes; Z19 plenum/beams still mean
saturation rises with a non-VACUOUS §IR_COLOUR line. Any class with < 5 sampled pixels / missing anchor -> INCONCLUSIVE. §MATERIALS lines print the
built THREE material colours/roughness per class for both arms.

### COLOUR-TRUTH DECISIONS (2026-09-27, coordinator for red1) — amends ### Z21 SPEC rule 3 and ### Z20 SPEC; bim-ootb `fix/colour-truth` @564066f5 (pushed, not merged)
 D1 (Z21, replaces the "⛔ OPEN" in rule 3): an IfcBuildingElementProxy whose EXTRACTED `discipline` is an MEP trade (MEP/FP/PLB/ELEC/ACMV/HVAC/SAN/VENT/HEAT)
    AND carries the exporter placeholder is MEP-hue eligible like the MEP classes. ONE owner `A._mepHueEligible(cls, disc, rgba, matName)`, read by
    `_mepDiscAlbedo`, the batch/merge bucket 'M' bit, the instanced mixed-set guard (a hash set mixing eligible and ineligible members is still built
    with noMepHue), §MEP_HUE_TALLY and §PLACEHOLDER_COLOUR. ARC/STR proxies stay cream and count as proxyKept. Red control `A._mepProxyOff`.
 D2 (Z20/Z21): `A.EXPORTER_PLACEHOLDER_MAT_NAMES = {'tomt mönster'}` inside `_isAuthoredMatName` (Swedish Revit "empty pattern"; MEASURED LTU_AHouse
    2,858 rows over 14 classes with dozens of different rgba — the name carries no material identity). Side effect, measured through §MEP_HUE_TALLY on
    LTU: tier1_authored_name 5 -> 0, tinted 14 -> 19 in the tally — those 5 are the `WC` IfcFlowTerminals, which render porcelain (porcelain skips the
    MEP hue), so no LTU pipe changes colour. Hospital / HHS tallies are unaffected by D2 (no such name).
 NEW COUNTS (node, real DB queues through the shipped rollups):
   §PLACEHOLDER_COLOUR Hospital placeholder 57098 replaced 10947 mepTier2 44246 (was 40563; +3683 MEP-trade proxies = 3715 - 32 porcelain) proxyKept 1293
   (= the ARC proxies; was 4976) noStdMat 580 porcelain 32 · Clinic 14142 / replaced 1534 / mepTier2 11629 / proxyKept 0 / noStdMat 867 / porcelain 112 ·
   Duplex 1012 / 60 / 892 / 0 / 48 / 12 · JKR 425 / 0 NO-OP (all IfcOpeningElement) · HHS, LTU, Terminal VACUOUS (no placeholder row).
   §MEP_HUE_TALLY Hospital mep_elements 41987 -> 45702, tinted 40634 -> 44349, distinct hues 5 -> 6.
   §PORCELAIN matched Hospital 554, Clinic 112, Duplex 12, HHS 11, JKR 40, LTU 85 (80 IfcFurnishingElement + 5 IfcFlowTerminal; was 0), Terminal 74.
 Witnesses: z21 pass=4/0 ran=32 (+PLB proxy -> PLB hue at own V, ARC/STR proxy cream, real-colour MEP proxy untouched, eligibility owner rows, Hospital
   mepTier2 44246 / proxyKept 1293; red control = both switches off), z20 pass=4/0 ran=35 (LTU row IN, placeholder-name row, LTU 85; red control also empties
   the list), z19 unchanged 4/0 ran=12. GPU witness pass conditions add: §PLACEHOLDER_COLOUR mepTier2 = 44246 and proxyKept = 1293; MEP-trade proxy
   placeholder pixels gain saturation (+0.1) where >= 5 are sampled.

**§ZERO GPU POSES + METRICS (shared by Z9-Z12).** Poses: Clinic corridor cam [21.243,-0.606,-1.261] → tgt [1.197,-4.155,-2.608];
Hospital inner room [9.947,-7.699,0.098] → [14.735,-8.114,2.081]; Terminal inside (the §METER_EV ref pose); P2 …885596; red1's
night / pale / blotch stills in ~/Downloads (pose in the PNG tEXt chunk `bim-still-pose`: …1790468614025 night, …1790465698534 pale,
…1790468672505 blotch). Per pose, before (39959e8a) and after (the Z branch): L p5 / p50 / p95 (Rec.709 luma 0-255 of the PNG),
px ≤ 15 (%), clipped ≥ 250 (%), `§GLARE` 0/0/0, WebGL program count after the press (`renderer.info.programs.length`), press time
(`§STILL_STAGE_MS` total + the TAA end), plus the Z-specific §-line named in each spec.

**§LIGHT_ONE_SCALE — LAW (red1 2026-09-27: "The laws of optical physics should be singular"; ranks above every per-term
calibration in this file).** One photometric chain for every source, every surface, every camera, inside or out:
 L1 SOURCES in physical units through ONE calibration (§SOURCED_LIGHT_CALIB lux-per-unit): sun + sky from one cited clear-sky
    model (sun/sky split for the sun elevation), lamps from their data (lumens), cove from its EN 12464-1 level. No scale, boost,
    lift or tint that is not a physical quantity (mood constants = deleted, not tuned).
 L1a THE ONE ADDED SOURCE (red1 2026-09-27: "It is only internal lighting source for non lighted room and that also subjected
    to the same law of optics"): the cove (§COVE_LIGHT) is the ONLY light not in the model data, placed ONLY in a compartment
    with no real source (no lamp, no sky reaching it), and it obeys L1-L3 like any lamp (lux calibration, albedo x E / pi,
    counted once incl. its IR share, same exposure). CHANGE vs the 2026-09-25 watchdog gate: a compartment that HAS a real
    source but falls below its EN row no longer gets a cove top-up (it is shown as its real sources light it).
 L1b THE CAMERA TORCH (red1 2026-09-27: "a torch effect is more realistic", "agree on the spotlight offset"): a rated handheld
    source, allowed in every view — Petzl ACTIK STANDARD 100 lm, ANSI FL1 60 m -> 900 cd peak, 10.8 deg half angle; spotlight 0.3 m
    right / 0.1 m up of the lens (on-axis hides its own shadows), shadow-casting, inverse square, metered. bim-ootb fix/alts-torch
    @1dd60a62 (§CAM_TORCH, Alt+S; films = Z17). Replaces the old unsourced CAM_LIGHT (intensity 3, 4 m cut).
 L2 TRANSPORT: seen luminance = albedo x E / pi; every path (direct, sky view, interreflection, screen GI, AO as visibility)
    counted ONCE — a term that re-adds light another term already carries is a double count, removed.
 L3 EYE: one exposure from the light reaching the eye (§METER_ONE_RULE), then one tone curve.
PLAN: the §LIGHT_TRUTH_AUDIT table (appended at the end of this file) lists every live value; each UNSOURCED / INCONSISTENT /
DOUBLE-COUNT row becomes one change on its own fix/ branch, witnessed by numbers (refs, §GLARE, the night/pale/blotch poses)
before it goes to look. Exceptions need red1's word, recorded here.

§LAMP_TRUTH RESULT (Opus, 2026-09-27) — fix/lamp-truth @c539f129 (sw v1462, /tmp/wt-lamp :8634), fresh-profile first press.
 Baseline for the shared poses = 1b5f1c0b (evB_* logs, same session). ⚠ the ltB_* baseline run for plenum / Clinic gap poses
 landed on /tmp/wt-meter AFTER it moved to 53608f22 (sw v1470, meter v2 hides emitters): it is NOT a 1b5f1c0b baseline — used
 only where stated. Logs photoreal_probes/b1/ltC_* ltB_*.
 (a) REMETER: every press now prints two §METER lines (stage, then after the still lamp rebuild). First -> second stops:
   aerial 616826 -1.91 -> -2.82 (EV100 16.77 -> 17.68; comp 36.98 on 1b5f1c0b -> 11.64, le15 62.9 %); night +3.92 -> +4.07;
   Hospital plenum +4.79 -> -1.13 (EV100 10.06 -> 15.99; bandL x60; inferred, not isolated: the rebuilt lamps' emitters enter the 70/95 band) ->
   comp 22.8, p50 0, le15 73.4 % NEAR-BLACK (v1470 arm, which hides emitters: EV100 10.03, comp 100.9, le15 21.3 %);
   Clinic corridor / inner room / P2 / 698534 / Clinic gap poses: second = first (within 0.01 EV); Terminal 11.02 -> 11.03;
   672505 10.24 -> 10.23.
 (b) lamp staging cut 0.5 -> 1.0: not separately judged (no § line isolates it) -> INCONCLUSIVE beyond the refs below.
 (c) §COVE_QUAL (L1a): Hospital qualified 358 / belowLevelWithLamps 0 / belowLevelWithSkyOnly 18 (was 376 qualified);
   Clinic 110 / 62-66 / 0 (was 166); Terminal 54 / 3 / 5 (was 63). Lost-cove check: Hospital inner room comp 15.86 = 15.86,
   §FAULT unlit 0/144; plenum §FAULT unlit 0/144 irOnly 89 both arms — its near-black comes from (a), not cove loss;
   Clinic gap poses [0.617,3.56,-19.198] -> [0.617,7.16,-17.454] / [0.617,8.5,-19.0]: comp 63.4 / 33.7, le15 72.4 / 79.5 %
   IDENTICAL to the v1470 arm (63.4 / 33.8, 72.4 / 79.5 %) = the black void is there without this branch too.
 REFS vs 1b5f1c0b: Clinic corridor 28.74 -> 28.55, inner room 15.86 -> 15.86, Terminal inside 22.14 -> 20.78, P2 39.87 -> 40.01,
   698534 29.96 -> 29.72, 672505 66.64 -> 68.76, night 199.4 -> 203.0, aerial 616826 36.98 -> 11.64 (remeter). §GLARE 0/0/0 all.
 VERDICT: NOT READY as-is — (a) the remeter re-reads lamp emitters and blacks out the plenum pose and darkens the sunlit aerial
   by a further 0.9 stop; the meter v2 emitter mask (53608f22) is the evident companion (after the rebase, re-witness plenum
   and aerial). (c) cove L1a: no near-black caused by lost coves at the judged poses.

**§LIGHT_LAW_MODULE — SPEC (2026-09-27; coordinator ask: "one file that holds the chain's values and formulas so Alt+S reads
them now and Alt+C can later read the SAME values").** PURE REFACTOR — zero behaviour change, no value retuned, no Alt+C wiring.
FILE: bim-ootb `viewer/light_law.js`, global `window.LightLaw` (frozen objects; also `module.exports` so node can test it).
Loaded in viewer.html BEFORE sourced_light.js (and so before effects.js / scene.js), precached in sw.js, sw v1463. Branch
`fix/light-law-module` from `fix/lamp-truth` @c539f129.
WHAT MOVES (the literal leaves its file; the file reads LightLaw):
 - CALIB (L1, §SOURCED_LIGHT_CALIB): sunLux 100000, lampLux 500, refH 2.5 m — effects.js:4274 `CALIB_*` and the three
   `|| 100000` fallbacks in sourced_light.js (§LAMP_EN enApply, §LUX_CHECK luxRows, §METER meter). Formula
   `luxPer(sunLux, sunI)` = sunLux / sunI (null when sunI <= 0) — the ONE scene-units -> lux conversion.
 - SCENE source values (L1, scene.js:125-213): tone curve 'ACESFilmic', base exposure 0.45, sun 0xfff0dd x 4.4, hemi sky
   0xb0c4de / ground 0x8b7355 x 0.617, ambient 0xffffff x 0.386. scene.js builds its lights from them (same numbers, same
   order). They are still §LIGHT_TRUTH_AUDIT rows #1/#2/#12/#19/#24 with their verdicts — moving them is not endorsing them.
 - METER (L3, §METER_EV): K 12.5, 100 (ISO), q-factor 1.2, ACES exposure divisor 0.6, histogram band 0.70 / 0.95, readback
   160 x 90. Formulas: `ev100(Lcd)` = log2(Lcd x 100 / K); `exposureFromEv(ev, luxPer, acesDiv)` = luxPer x acesDiv /
   (1.2 x 2^ev) — the same floating-point operation order as sourced_light.js meter() so the result is bit-identical;
   `acesDiv(renderer, THREE)` = 0.6 when the renderer's toneMapping is ACESFilmic, else 1.
 - COVE (L1a, §COVE_LIGHT): TRIM_LUX_VOID 100, COVE_UNKNOWN_LUX 100, colour 0xffe4b5 (red1 exception #46).
WHAT STAYS (not law values, or not this step): PHOTO_* scales in effects.js (audit NO-OP/mood rows #3/#4/#16/#17 — to be
deleted, not dignified by a move); lamp decay / range dials (§STILL_DIALS, audit #38/#39); NIGHT_LIGHT_INTENSITY_BASE
(tools.js); EN_ROWS (sourced_light.js, a data table, not a constant); R_BRE / IR formulas (light_zones.js); COVE_R /
COVE_MAX_EMIT / COVE_BUDGET (range + perf); N8AO / gi_still dials (audit #54/#56 — to be removed by their own fixes);
time_machine.js / cinema_maxq.js values (Alt+C wiring is a later step, see ALTC_SHOWSTOPPERS 2026-09-27).
SNAPSHOT: `LightLaw.snapshot(A)` -> { law: {version, CALIB, SCENE, METER, TONE, COVE}, lawHash, live: {calibSunI,
calibSunLux, luxPer, exposure, toneMapping, sunI, sunColor, hemiI, hemiSky, hemiGround, ambientI, meterEv100, meterExposure},
liveHash }. lawHash = FNV-1a 32 over the key-sorted JSON of `law` (constants only: the same in node and every browser, changes
only when a law value changes). liveHash = the same over law + live (the state a frame was rendered with). A is optional
(node: live = {}). Logs nothing by itself; `LightLaw.log(A, tag)` prints `§LIGHT_LAW tag=.. lawHash=.. liveHash=.. luxPer=..
exposure=.. ev100=..`; Alt+S calls it after each meter (tags `stage`, `remeter`; log only, no value changes) so a film frame
can later log/assert the same law as the still (the film call is NOT wired in this step).
WITNESS (two parts):
 (1) node, now: viewer/tests/witness_light_law_unit.js (witness_kit contract): asserts ev100 / exposureFromEv / luxPer
     numerically against hand-computed values (100 klx sun at sunI 4.4 -> luxPer 22727.27; L 1000 cd/m2 -> EV100 12.966;
     exposure at that EV = luxPer x 0.6 / (1.2 x 2^EV)), bit-identity vs the pre-refactor inline expressions, and lawHash
     stable across calls + unchanged by a live A; redControl = a law value changed -> hash differs. Prints INCONCLUSIVE (not
     PASS) if light_law.js cannot be loaded.
 (2) GPU agent, later (NOT run here — no browser in this step): Hospital / Clinic / Terminal reference poses, Alt+S on
     fix/lamp-truth @c539f129 vs fix/light-law-module: every number on the §SOURCED_LIGHT_CALIB, §METER, §METER_HIST,
     §LUX_CHECK, §COVE_LIGHT, §LAMP_EN and §TONEMAPPING lines byte-identical (diff the §-lines of the two full console logs,
     timings `ms=` excluded); `§LIGHT_LAW tag=stage` + `tag=remeter` lines on every press, lawHash identical on all three
     buildings (node value 5368cb0a), and `exposure=` on the remeter line = the §METER exposure of that press.
§LIGHT_LAW_MODULE RESULT (Opus, 2026-09-27) — fix/lamp-truth @c539f129 (:8634) vs fix/light-law-module @39959e8a (:8635, sw v1463),
 fresh-profile first press (own puppeteer per press, full console saved: photoreal_probes/b1/law_{8634,8635}_{hospital,clinic,
 terminal}[_r2].txt; diff tool lawdiff2.py, every `*ms=` / `(types N)` timing stripped). TWO presses per arm per building, so
 same-arm run noise is measured next to the cross-arm diff:
 | bld      | A1-A2 (same arm) | B1-B2 (same arm) | A-B pairs                                        |
 | Hospital | differ (METER*, LUX_CHECK*) | identical | A2 = B2 and A2 = B1 BYTE-IDENTICAL; A1 differs from both B exactly as from A2 |
 | Clinic   | identical        | differ (METER_HIST) | A1 = B1 and A2 = B1 BYTE-IDENTICAL; B2 differs as from B1 |
 | Terminal | differ           | differ           | never identical — nor within either arm (meter readback 4th digit: exposure 5.4679 / 5.4674 / 5.4686) |
 The only lines that ever differ are §METER / §METER_HIST / §LUX_CHECK(_CAM) (which print the exposure), and only in the 4th
 significant digit (Hospital bandL 5.540e-3 vs 5.528e-3, 3604 vs 3605 band pixels) — the same size within an arm.
 §SOURCED_LIGHT_CALIB, §COVE_LIGHT*, §LAMP_EN*, §TONEMAPPING identical in every pair. §LIGHT_LAW tag=stage + tag=remeter on
 every press, lawHash=5368cb0a on all three; remeter exposure = that press's (second) §METER exposure (Hospital 11.3067 =
 11.3067, Clinic 19.6287 = 19.6287, Terminal 5.4425 = 5.4425 / 5.4436 = 5.4436); stage exposure = the first §METER line.
 node viewer/tests/witness_light_law_unit.js: §WITNESS_LIGHT_LAW_UNIT pass=4 fail=0 ran=41.
 NOTE: the first Clinic capture on 8635 logged 40,373 'Uncaptured WebGPU GPUOutOfMemoryError / Invalid Texture' lines — a
 second headless browser (the warm probe's) was still holding 4 GB of the 8 GB GPU (red1's Chrome 3.1 GB). Closed it and re-ran:
 0 such lines on every r2 capture. Its §-lines matched anyway.
 VERDICT: PASS — byte-identical where the same arm repeats byte-identically (Hospital, Clinic); Terminal byte-identity
 INCONCLUSIVE (not reproducible within one arm), cross-arm deltas no larger than same-arm deltas.

**§METER_ONE_RULE — SPEC (red1 2026-09-27: "for outside or in, the exposure rule must be consistent based on condition of
light reaching the eye"; trigger: first outside still …1790468166215 "as if night time", cam [33.5,8.121,11.498] tgt [0,0,0],
v1457, L p5/50/95 23/40/79).**
CAUSE (code, look @808f578f): sourced_light.js meter() line 1235 `if (!inside) ... return null` = an OUTSIDE camera keeps the
base exposure (no adaptation), while an inside camera adapts up to METER_MAX_STOPS 10 (CIECAM02 D). A view of the shade side
(sun from -z at 45 deg; that facade gets sky only) with nothing sunlit in frame is shown at the sunlit-surface exposure -> night.
Also: stops < 0 clamped to 0 (a scene brighter than the outdoor reference is never stopped down). Exposure does NOT carry
between presses (effects.js 4428/4642 save/restore, stage() -> unstage(A,true) -> meterOff), so the "previous still's memory"
is not the exposure.
RULE: ONE meter for every camera, no inside/outside branch: exposure = base x (Ein / Eout)^(-D), Ein = the log-average light
reaching the visible surfaces (existing meterRead, 160x90), Eout = the outdoor reference (sun x sinElev + sky), D = CIECAM02
(unchanged). Clamp symmetric: |stops| <= METER_MAX_STOPS. The inside flag stays only as a logged fact (and for &metermode=zone).
&meter=0 = off as before.
WITNESS: §METER line now prints for outside cameras with Ein/Eout/D/stops; at the night pose p50 rises (report p5/50/95); a
sunlit aerial (…1790465616826 pose) moves < 0.5 stop (Ein ~ Eout); inside refs (Clinic corridor, Hospital inner room, Terminal
inside, P2 …885596, …698534) unchanged (same code path); §GLARE 0/0/0. Branch fix/meter-one-rule from look @808f578f, sw v1460.
SUPERSEDED same day by §METER_EV (1b5f1c0b, sw v1461) — the audit showed D (CIECAM02) is CHROMATIC adaptation (D=1 outdoors =
full re-exposure = pale). LAW NOW (engine chain, Frostbite 2014 / Filament / HDRP; sources + URLs in the §LIGHT_TRUTH_AUDIT
follow-up): meter renders the frame as the eye gets it (real materials, glass, emitters; sky pixels = the hemi sky luminance
the lighting uses), histogram 70/95 log-average L -> cd/m2 via luxPer -> EV100 = log2(L x 100 / 12.5) -> exposure =
1/(1.2 x 2^EV100) (x luxPer, x 0.6 to cancel three's ACES 1/0.6). No base, no compensation, no clamp; inside and outside alike.
Inside refs WILL move (new rule for all); re-approval by numbers. Engine reference: sun 100-120 klx, clear sky 13-30 klx at
45 deg, sunny EV100 ~15, office 7-9, K 12.5, adaptation 3 stops/s up / 1 down (films, R1).
§METER_EV RESULT (Opus, 2026-09-27) — fix/meter-one-rule @1b5f1c0b (sw v1461, /tmp/wt-meter :8633) vs look 808f578f (:8630). Fresh
 profile, first press, Hospital &ghost=1 unless noted. Logs prompts/photoreal_probes/b1/evA_* evB_* evBavg_* (+ _lum = lum.js stats).
 (Superseded fc8b07f6 partial run, for the record: sunlit aerials +1.59 / +2.64 stops, night +3.75 stops -> p50 43.6 -> 199.8.)
 | pose            | before: comp  p50  le15%  ge250%  stops | after (hist 70/95): EV100  stops  comp   p50   le15%  ge250%  skyPx  ms |
 | night 166215    | 43.4   41.4  1.95  0     0 (outside)    | 10.94  +3.92  199.4  206.3  0.38  0.79  0     576  |
 | pale 367731     | 171.5  169.3 0.00  3.28  2.61           | 16.01  -1.15  47.3   30.2   17.1  0     1781  492  |
 | pale 100646     | 127.1  95.6  0.31  7.15  5.90           | 12.72  +2.14  49.6   11.8   55.1  0.51  1032  516  |
 | shade 501304    | 85.8   61.2  2.65  0     0 (outside)    | 15.90  -1.04  56.7   35.4   19.1  0     2402  481  |
 | shade 614025    | 69.5   55.6  1.46  0     0 (outside)    | 16.17  -1.31  32.6   21.9   32.6  0     0     543  |
 | aerial 616826   | 90.5   79.1  1.33  0     0 (outside)    | 16.78  -1.92  37.0   28.1   33.4  0     0     558  |
 | aerial 862668   | 67.5   55.4  0.75  0     0 (outside)    | 14.81  +0.05  69.9   59.5   0.63  0     235   538  |
 | Clinic corridor | 76.8   69.5  0.02  0     7.65           | 9.18   +5.68  28.7   20.3   21.8  0     0     796  |
 | Hosp inner room | 99.9   107.2 0     0     7.96           | 9.97   +4.89  15.9   17.1   45.0  0     0     766  |
 | Terminal inside | 103.4  99.0  0.01  0.06  7.95           | 11.02  +3.84  22.1   10.0   68.0  0     170   1752 |
 | P2 885596       | 111.6  107.1 0.02  0.28  6.48           | 10.62  +4.24  39.9   32.3   12.7  0.27  32    1018 |
 | 698534          | 116.9  115.8 0.01  0.04  6.60           | 10.93  +3.93  30.0   26.9   10.7  0.04  6     1039 |
 | 672505          | 118.5  110.6 0.01  0.01  6.02           | 10.30  +4.56  66.6   55.3   1.30  0.01  56    1725 |
 &metermode=avg (after tree): night EV100 9.72 +5.14 stops comp 227.5 p50 232.8 ge250 7.71% (FLAG > 2% clipped, median > 200);
 aerial 616826 EV100 12.61 +2.25 comp 175.6 p50 179.4; Clinic corridor EV100 8.81 +6.05 comp 35.8 p50 27.4 le15 5.2%.
 FLAGS (median < 40 / > 200 / clipped > 2%): median < 40 at 10 of 13 poses (367731 30.2, 100646 11.8, 501304 35.4, 614025 21.9,
 616826 28.1, Clinic 20.3, inner room 17.1, Terminal 10.0, P2 32.3, 698534 26.9); night median 206.3 > 200. Clipped > 2%: none (hist).
 EV SANITY: sunlit aerial 616826 16.78 (ANSI ~15: +1.8, the 70/95 band sits on the sunlit roofs), 862668 14.81 (in range);
 interiors 9.2-11.0 (office 7-9: +1-2). The sky enters the meter when visible (skyPx up to 16.7%) and then pulls interiors and
 shade views dark (367731, 501304). §GLARE 0/0/0 on every run. Meter ms: hist 481-1752 vs old 123-1025.
 VERDICT: NOT READY as a look (the rule is consistent inside/outside, but under the 70/95 band + exposure 0.6/(1.2 x 2^EV)
 the median surface sits 1.5-3 stops under mid-grey at 10 of 13 poses; the avg arm lifts interiors only ~+0.4 stop and makes the
 night pose clip). Not judged: which constant red1 wants (band, K, compensation) — that is a look decision, not a defect.
§METER_EV v2 RESULT (Opus, 2026-09-27) — fix/meter-one-rule @53608f22 (sw v1470, :8633), fresh-profile first press, 13 poses.
 Logs photoreal_probes/b1/evC_* (default 70/95) + evD_* (&meterband=40,90). EV100bands per pose (70/95 / 40/90 / 10/90):
 night 10.94/10.08/9.44 · 367731 16.04/14.38/12.61 · 100646 12.67/10.52/9.36 · 501304 15.91/14.13/12.30 · 614025 16.22/14.49/12.95 ·
 aerial 616826 16.81/15.12/12.76 · aerial 862668 14.82/13.34/12.13 · Clinic 9.18/8.79/8.64 · inner 9.97/9.68/9.30 · Terminal
 11.02/10.31/9.89 · P2 10.61/9.71/8.27 · 698534 10.93/10.24/9.24 · 672505 10.24/9.21/8.49.
 BAND CHOICE (worst error: sunlit aerials vs ANSI 15, interiors vs 7-9): 70/95 max(1.81, 2.02) = 2.02; 40/90 max(1.66, 1.31) =
 1.66; 10/90 max(2.87, 0.89) = 2.87 -> second arm = 40/90 (none fits both: 40/90 puts 616826 at 15.12 but 862668 at 13.34;
 10/90 fits interiors but sunlit aerials read 12.1-12.8).
 | pose          | 70/95: EV100 stops comp  p50   le15  ge250 | 40/90: EV100 stops comp  p50   le15  ge250 | skyPx |
 | night         | 10.94 +3.92 198.2 203.0 0.40 0.60        | 10.08 +4.78 221.6 227.0 0.28 4.82 FLAG     | 0     |
 | 367731        | 16.01 -1.16 49.0  31.3  16.8 0           | 14.40 +0.46 96.4  75.3  0.42 0           | 1781  |
 | 100646        | 12.72 +2.14 49.6  11.9  55.1 0.48        | 11.03 +3.83 75.8  35.6  10.9 6.87 FLAG     | 1032  |
 | 501304        | 15.89 -1.03 55.0  34.7  18.9 0           | 14.13 +0.73 107.6 85.1  0.38 0.05        | 2402  |
 | 614025        | 16.22 -1.36 32.1  23.2  36.0 0           | 14.48 +0.37 80.8  67.4  0.41 0           | 0     |
 | aerial 616826 | 16.81 -1.95 34.3  24.0  41.9 0           | 15.04 -0.18 87.1  78.0  1.15 0           | 0     |
 | aerial 862668 | 14.82 +0.04 69.9  60.4  0.64 0           | 13.30 +1.56 126.7 120.2 0.11 1.45        | 235   |
 | Clinic        | 9.18  +5.68 29.5  21.0  20.1 0           | 8.79  +6.07 35.6  27.3  5.14 0           | 0     |
 | inner room    | 9.97  +4.89 15.9  17.1  45.1 0           | 9.68  +5.18 20.0  21.9  38.8 0           | 0     |
 | Terminal      | 11.02 +3.84 21.7  10.0  68.9 0           | 10.31 +4.55 28.2  15.0  51.1 0           | 170   |
 | P2            | 10.61 +4.25 40.1  32.6  12.4 0.27        | 9.71  +5.14 63.9  55.6  0.81 0.27        | 32    |
 | 698534        | 10.93 +3.92 29.8  26.7  11.0 0.04        | 10.24 +4.62 45.7  42.1  1.66 0.04        | 6     |
 | 672505        | 10.24 +4.62 68.3  57.2  1.09 0.01        | 9.21  +5.65 104.3 94.7  0.04 0.37        | 56    |
 §GLARE 0/0/0 every run; meter ms 295-2561 (typ. 450-520). Emitter mask: `hidden=2` (v1 1) — the 70/95 EVs moved <= 0.06 vs v1.
 VERDICT (rule: median 40..200 at >= 11 of 13 and clipped < 2 %): 70/95 2/13 -> NOT READY; 40/90 8/13 with 2 poses clipped
 > 2 % (night 4.82, 100646 6.87) -> NOT READY. Failing under 40/90: Clinic 27.3, inner room 21.9, Terminal 15.0 (interiors at
 EV100 8.8-10.3 still land 1.5-2.5 stops under), night 227 (shade view with no sky), 100646 35.6 with clipped glass.
§ALTS_COMBINED RESULT (Opus GPU witness, 2026-09-27) — VERDICT: PASS 7/7 (p50 40..200 and clipped < 2 % at 7 of 7, §GLARE 0/0/0,
 0 page errors) -> FF look to fix/alts-torch @1dd60a62 is supported by these numbers. One defect found: the torch remeter is VACUOUS (below).
 Build: bim-ootb fix/alts-torch @1dd60a62 (sw v1472 read from the served sw.js), /tmp/wt-torch :8638, fresh profile + fresh page
 per pose (warm_probe /close -> /open reload=1), ONE first press per pose, Hospital &ghost=1 except Terminal. Presses ran
 12:47-13:00 (the earlier witness agent's queue, completed before it died); read back from its logs, not re-run.
 Logs photoreal_probes/b1/torch_<pose>{,_lum,_zpatch,_esc}.log + torch.out; summary `node zsumm.js torch`. p50 / px<=15 /
 clipped>=250 = Rec.709 luma of the composite canvas (__giStillDebugCanvas.bounce, the image the PNG saves; lum.js), not a
 re-decoded PNG file. EV100 = every §METER camera line in press order (stage -> torch remeter -> lamp remeter = final).
 | pose (source)                    | EV100 stage/torch/final | exposure | p50   | px<=15 % | clip>=250 % | GLARE | programs | press s |
 | night (…1790468166215)           | 10.07 / 15.73 / 13.98   | 1.1735   | 76.1  | 1.04     | 0           | 0/0/0 | 128      | 215.7*  |
 | sunlit aerial a616 (…1790465616826) | 14.86 / 15.73 / 16.62 | 0.1875   | 43.1  | 15.21    | 0           | 0/0/0 | 129      | 147.4   |
 | Clinic corridor                  | 8.79 / 15.73 / 6.95     | 153.02   | 63.3  | 0.07     | 0           | 0/0/0 | 94       | 24.2    |
 | Hospital inner room              | 9.68 / 15.73 / 7.85     | 82.03    | 131.4 | 0.02     | 0           | 0/0/0 | 122      | 106.5   |
 | Terminal inside (evC/evD pose)   | 10.31 / 15.73 / 7.54    | 101.63   | 140.4 | 0.34     | 0.45        | 0/0/0 | 114      | 24.4    |
 | blotch p672 (…1790468672505)     | 9.20 / 15.73 / 10.75    | 11.02    | 76.5  | 1.36     | 0.12        | 0/0/0 | 128      | 96.6    |
 | Hospital plenum                  | 9.38 / 15.73 / 10.44    | 13.65    | 69.4  | 20.23    | 0.26        | 0/0/0 | 126      | 99.4    |
 (*first page of the run pays the 66 s one-time "copying the building to the bounce-light engine"; press s = warm_probe /alts secs.)
 Poses: PNG tEXt 'bim-still-pose' cams match (a616 [26.431,36.87,42.209], night [33.5,8.121,11.498], p672 [-13.552,1.366,-1.289]).
 §CAM_TORCH (identical every pose): on peakCd=900 (100 lm, FL1 60 m) halfAngle=10.8 offset R0.3/U0.1 m intensityUnits=3.960e-2
 (cd / luxPer 22727.3) shadow=1024. §ALBEDO_SRGB (Hospital) converted=108 meanLum 0.6557->0.4680, Esc: restored mats=108
 lateDecoded=0 changedDuringStill=0 (Clinic 64/64, Terminal 95/95). §GROUND_HALF rhoSrc=table(earth) rho 0.368 upward 1.485u
 (33760 lx) ratio 2.60. vs §METER_EV v2 40/90 (evD): Clinic 27.3 -> 63.3, inner 21.9 -> 131.4, Terminal 15.0 -> 140.4, night 227
 -> 76.1 (clip 4.82 -> 0), 672505 94.7 -> 76.5 — the lamp remeter (final EV 7-8 inside) is what moved the interiors in band.
 DEFECT (VACUOUS, all 7 poses): the torch remeter (effects.js:4604 `SourcedLight.remeter(A)` right after §CAM_TORCH on) reads a
 frame with skyPx=14400/14400, pixels=14400, EV100=15.73, Lavg=6780.8 cd/m2 — the same value everywhere = it metered an all-sky
 frame, not the scene. Its exposure (0.3491) is overwritten by the lamp remeter (effects.js:5768) before §STILL_REFINE, so the
 still is unaffected, but the claim "the meter sees the torch (L3)" is NOT witnessed: population judged = 0 scene pixels.
 Not judged: the torch's own contribution (no &torch=0 A/B — no pose failed, so none was owed); dark share px<=15 is high at the
 aerial (15.2 %) and the plenum (20.2 %) — inside the PASS rule, stated for the look decision.

**RULINGS red1 2026-09-27 (inside still …1790465698534, v1457):** (1) "If original colors then OK" — the pale-interior check
passes if the chroma readback shows the IFC material colours intact (low saturation = the data's greys, not a render fault).
(2) Outside very bright through the openings from an inside pose = WANTED: "relative eye adjustment" (§METER_ADAPT, expStep
6.61 there). Not a defect; do not cap it. (Same class as S1's Hospital curtain-wall case.)
PALE CHECKS RESULT (Opus, 2026-09-27, look 808f578f :8630, fresh-profile first press; logs photoreal_probes/b1/pale_*, seq*, sky0_* sky1_*,
 probes chroma.js / matsnap.js / lum.js / clip_cls.js):
 INSIDE 1790465698534 (chroma): material colours INTACT — 4,777 materials snapshotted before Alt+S, 1 changed by staging
 (5c4033 -> ffffff, one unnamed MeshStandardMaterial; which object carries it was NOT checked — suspected the ground texture swap). 200 surface
 samples: mean material HSV S 0.046 (only 5 of 200 have S > 0.15) = the Hospital interior's IFC colours are low-saturation
 greys; hue kept (median |dH| 4-6 deg on the coloured ones). Saturation by stage (frame mean S): app 0.058, composite 0.055
 (GI composite -6%); &ir=0 composite 0.080 (+45%: the §IRC_MAX IR floor is the stage that greys it; also std 29.7 -> 35.5,
 meter 6.60 -> 7.21 stops); &cove=0 0.054 (no change); &skyshell=0 0.055 (B1: none — comp 117.08 vs 116.79, darkest-quartile
 F 0.0014 both); &srgbfix=1 0.082 (albedo used as linear, §ALBEDO_SRGB: on coloured samples authored S 0.57 -> 0.32 predicted
 -> 0.39 rendered). VERDICT: not a colour override; low-chroma data + IR floor + albedo-as-linear. No code changed.
 OUTSIDE 1790466367731: pale on a FRESH first press too (p5/50/95 102/170/249, >=250 4.1-5.2 %); 251/253 clipped samples hit
 nothing = the SKY; the camera cell is covered -> metered 'inside', +2.61 stops. &skyshell=0 vs default 173.5 vs 173.0 (B1 none).
 1790466100646: clipped = IfcPlate glass 211/251 at +5.90 stops interior exposure (red1 ruling 2: wanted). SEQUENCE (red1's
 order 616826 -> 698534 -> 100646 -> 367731 on one page) vs fresh at 367731: comp 177.9 vs 172.5/173.0/173.5, p50 178.9 vs 170-172,
 >=250 2.97 vs 4.1-5.2 %; exposure identical 2.3309; carried state seen: §SOURCED_LIGHT pushed 105 -> 109 after the inside press,
 GI pass 1 s vs 66 s (kept renderer). VERDICT: meter class (covered camera looking out), not B1; carried state adds ~+5.

**§COVE_NO_STRIP — RULING (red1 2026-09-27, overrides §COVE_LIGHT "and a VISIBLE thin emissive strip mesh" + impl note 6):**
red1: "The ceiling rim lighting need not have the actual lighting element. That be inventing objects. Rather just have the
glow that goes along its corner axes. Need not be accurate or bright. Just to replace the sheer darkness."
SPEC: delete the visible strip (coveStrip/coveStripOff, the 'cove_strip' MeshBasicMaterial mesh, the strip bar list). The cove
FIELD (the glow along the wall-ceiling edges: DOWN + UP lobes in the RGBA8UI texture, §COVE_IR) stays as is — level unchanged
(red1 allows it to be dimmer, not a request to retune; no knob added). WITNESS: §COVE_LIGHT strip line gone; scene has 0 meshes
named cove_strip / userData.coveStrip after an Alt+S press; §COVE_LIGHT zones/emitters and the cove readback term unchanged vs
before (same pose); program count -1 (the strip's MeshBasic program); approved refs (Clinic corridor, Hospital inner room)
unchanged except where a strip bar was on screen. Branch fix/cove-no-strip (from look @ 48204a78), sw v1457.
§COVE_NO_STRIP RESULT (Opus, 2026-09-27) — branch fix/cove-no-strip @ fdecbd1c (sw v1458, served /tmp/wt-cove :8632) vs look 808f578f
 (:8630); fresh-profile first press per pose, Hospital &ghost=1. Logs prompts/photoreal_probes/b1/cove{A,B}_*.log + cove.out (probe coveprobe.js).
 Strip gone: scene meshes named cove_strip / userData.coveStrip after Alt+S 1 -> 0 at all 5 poses; '§COVE_LIGHT strip mesh' line
 (Hospital bars=13,713, Clinic 5,374, Terminal 849) -> absent. §COVE_LIGHT build identical (Hospital zones 848, qualified 376
 {room 223, void 140, crevice 2, shaft 11}, emitters 10,498, perimeter 5,413 m, cells 98,576; Clinic qualified 166 / emitters 4,536;
 Terminal 63 / 742); NOFLAT PASS both. renderer.info.programs -1 at every pose (Hospital 85->84 / 83->82 / 85->84, Clinic 67->66,
 Terminal 84->83); geometries -1. compositeMean A -> B: Hospital plenum pose (strip on screen) 144.32 -> 143.47, px<=15 composite
 0 -> 0 %, app 0.213 -> 0.207 %; inner room 99.84 -> 99.84; P2 111.60 -> 111.53; Clinic corridor 76.97 -> 76.35 (noise 2.7);
 Terminal inside 103.95 -> 103.47 (all runs this session 103.35-104.01). §GLARE 0/0/0 all. VERDICT: READY (every claim judged).

**§COVE_LIGHT — SPEC (2026-09-25, dev red1-5a; item A BLACK_INTERIOR; red1: "a dark place just gets a ceiling-perimeter back
glow"). Builds on §SKY_VIEW_FIELD (same zone texture). Alt+S-truth: BUILD per building + DECIDE per frame; films inherit.**
DEFECT (8619): Hospital inner room cam [9.947,-7.699,0.098] 98% black; toilet [8.344,-8.647,-3.579] 57% black; Clinic room
[0.617,3.56,-19.198] black bands at ceiling-panel gaps.
WHAT IT IS: a REAL, zone-bound source: a line of emitters along each wall-ceiling edge of a qualifying zone, 0.1 m below the
ceiling and 0.15 m off the wall, emitting toward the ceiling (an indirect cove: washes the ceiling edge, then the walls);
and a VISIBLE thin emissive strip mesh along the same line, so the source can be seen. Never an ambient or flat fill.
1. QUALIFYING ZONES (BUILD): a ROOM zone (has walkable floor: floor cells with >= 2.0 m clear headroom — the stair
   headroom of UK Approved Document K, cited; so ceiling plenums/voids never qualify) with NO lamp (the §LAMP_ZONE_PICK
   BUILD table), NO glazing pane or open aperture, and sky-view F = 0 everywhere. The "lit zone whose surfaces get ~0"
   case (Clinic ceiling gaps: the dark is the plenum void seen through the gaps, a non-room zone) does NOT get a cove; those
   points are counted GEOMETRY_DARK (bounce's job) — stated so, not hidden.
WATCHDOG GATE (red1-c6): OPEN with one change, overriding 1 and 3: QUALIFY BY DARKNESS IN LUX (red1: "a dark PLACE gets the
   glow"; as written the toilet, which has a lamp, could not qualify). A room zone qualifies when its existing working-plane E
   (lamps + sky field, analytic, the §LUX_CHECK way) is below its EN 12464-1 row; the cove supplies only the DEFICIT
   (EN - existing, >= 0), 0 where the room already meets EN. The source-less room is the case existing = 0. Log per zone:
   existingE, enRow, coveE, qualified yes/no. The Clinic ceiling gaps stay GEOMETRY_DARK (plenum) and are named plainly in the
   recap for red1 to judge by eye after the cove lands; no fix without their word.
RED1 AMENDMENT (2026-09-25, via red1-c6): "there are crevices where MEP goes through, so ALL compartments must have trim
   lighting" (a BIM viewer: MEP in ceiling voids, shafts and crevices must be readable). Overrides the headroom exclusion:
   a. EVERY covered zone qualifies (rooms, plenums/voids, shafts, crevices), same mechanism (perimeter emitters along the
      zone's ceiling edges, texture term, zero new program keys) and the same DEFICIT rule vs the zone's level.
   b. ZONE TYPE (logged per zone: type, count, cove E): room = walkable floor with >= 2.0 m headroom; void = headroom < 2.0 m
      and footprint aspect (long/short side) < 4; crevice = headroom < 2.0 m and aspect >= 4 (a slot); shaft = vertical
      extent > 2 x its largest horizontal side.
   c. LEVEL for non-room compartments — no invented lux: EN 12464-1 has no row for ceiling voids or crevices. Nearest rows
      found only in SECONDARY summaries (primary standard not accessible here): "circulation areas and corridors 100 lx";
      "plant rooms, switch gear rooms" given as 150 lx (BS EN 12464-1:2002 summaries) or 200 lx (other summaries) — sources
      disagree. So: UNVERIFIED; proposal = the circulation row, 100 lx, for void/crevice/shaft; shown to red1 before it is
      used (the build ships the value as a logged constant behind that decision).
      DECIDED (watchdog, red1 delegated): TRIM_LUX_VOID = 100 (EN 12464-1 circulation row, via emprics/luxmeterpro/techlumen
      summaries; primary standard not consulted) — named in code + log, swappable if the primary text says otherwise.
   d. THIN ZONES: a zone under 2 cells (1.0 m) tall gets ONE emitter line along its long axis centred at mid-height (not two
      edges); a shaft gets emitter lines at the top perimeter only, as a room.
   GATE adds: red1's Clinic ceiling-gap pose [0.617,3.56,-19.198] reads BLACK_INTERIOR 0 (the gaps are no longer
   GEOMETRY_DARK); one Hospital plenum pose with MEP visible (picked and logged) reads 0 black on MEP surfaces.
2. PLACEMENT (BUILD): ceiling-edge cells = zone cells with SOLID directly above AND SOLID on a horizontal side; emitters
   every 0.5 m (one cell) along that perimeter, per wall run. Logged per zone: perimeterM, emitters.
3. LEVEL, cited: the emitters' total output is set so the zone's mean working-plane illuminance (0.8 m) equals the EN 12464-1
   maintained illuminance of its use (the §LUX_CHECK table and mapping; unknown use -> the circulation row, stated), from the
   analytic line-source integral in BUILD. Colour = the viewer's existing lamp colour constant (0xffe4b5), stated.
4. STORAGE + SHADER, no light objects: per cell the cove irradiance (sum over the zone's emitters of I cos / d^2, visibility
   through zone cells only) in the zone texture's B channel (RG16UI -> RGBA16UI; E x 10000) and its dominant direction
   (octahedral) in A; the fragment reads B/A from the same filtered read as F and adds E x max(0, N.dir) x the cove colour
   (Lambert from a mostly one-sided source; no k constant). Zero new lights, zero new program keys per zone (one format change
   for all), one vec4 uniform (colour). Memory: Hospital zone texture 41 -> 83 MB (logged; the retired portal shadow maps
   free 8 x 512^2 x 8 B).
5. DECIDE per frame: nothing camera-dependent (a texture read). Films: same read, no smoothing needed.
GATE (logged state): at red1's three poses, BLACK_INTERIOR = camera-zone surface points with zero total light (sun, F, lamps,
cove) that are not GEOMETRY_DARK -> 0 (inner room, toilet); Clinic gap points reported GEOMETRY_DARK with their zone type;
NO FLAT FILL: per cove zone the cell-to-cell coefficient of variation of the cove term > 0 and the cove term = 0 outside
cove zones (asserted); §LUX_CHECK per cove zone = its EN value within 10 %; §COVE line `zones= emitters= perimeterM= memMB=
buildMs=`; regressions (zone glare, shadow lines, outside reference pose) + GUARD.

**§METER_HIST — SPEC (2026-09-25, dev red1-5a; watchdog ruling after §STILL_CAMDEP). QUEUED after §SKY_VIEW_FIELD (it
changes what every "metered" gate number means: land once, then re-baseline). Alt+S only.**
FINDING (probe camdep.out, 8619, red1's poses, same zone 1, same 123 lamps): café corner exposure 18.235 (5.58 stops) vs
stair 8.205 (4.42 stops), 2.22x; meter input logAvgEin 1.266e-2 vs 4.169e-2. The log-average over ALL lit pixels (Reinhard
2002 eq. 1, delta 1e-4) is dominated by near-zero pixels (under tables, gaps), so the darker-looking corner is lifted past
the stair.
METHOD (not a knob: a metering method, industry practice): `&metermode=hist` = the log-average of Ein over the pixels whose
Ein lies between the LOW and HIGH percentiles of the frame's histogram; the Stevens 0.33 mapping is unchanged.
Percentiles, QUOTED (Unreal Engine Python API, PostProcessSettings, dev.epicgames.com, application_version 5.4):
auto_exposure_low_percent "The value is defined as having x percent below this brightness ... >0, <100, good values are in
the range 70 .. 80"; auto_exposure_high_percent "... good values are in the range 80 .. 95". The page states RANGES, no
default. (A search summary claims UE5 changed the defaults to 10 / 90; not verified from a primary page — 403 on the 5.0
doc page — so NOT used.) Open for the watchdog: which values inside the quoted ranges (or the verified engine-source
defaults if someone can cite Scene.h), stated once.
WATCHDOG RULING (red1-c6, 2026-09-25): hist = 70 / 95 — the widest band the quoted Unreal pages endorse (low "70 .. 80",
high "80 .. 95"; no engine-source default could be verified by either session). Stated plainly: it is HIGHLIGHT-WEIGHTED and
will likely read DARKER than avg — the opposite of red1's "too dark" — so red1 sees it next to the others. The A/B for red1:
café corner + stair, three cited modes: avg (Reinhard log-average, today), centre (Nikon C-W, built), hist 70/95; one line
per press (exposure, stops, metered band). red1 picks; no default change without that.
GATE (logged state only): at red1's two poses both modes; log per press `§METER_HIST low%= high%= bandEin= bandPixels=
allLogAvg= exposure= stops=`; the stops difference between the two poses must be explained by the two bands' own Ein
(log both); plus exposure per pose (café / Clinic corridor / Terminal hall) in avg vs hist. Default flips only after red1
looks at those two poses in both modes.
Also logged from now (watchdog): `§LAMP_CAP_DROPPED inCamZone= kept= dropped=` per press (the uniform budget; the
clustered/zone light set of ALTC_FOUNDATION F1 is the real fix, not now).

**✅ SHIPPED (was HOTFIX FIRST) — #1764 live v1294 (watcher, 2026-09-24 ~18:40; LIVE since #1763 / sw v1293):** Alt+S on a
`&ghost=1` URL renders GHOST BOXES, not the model. red1's v1293 console (OCI Hospital + &ghost=1): §STILL_LOCK on →
§STILL_ROOMS lazily loads navigate_find + NEEDLE (rooms recompiled 1,053 ms) → `[MG] §SHELL_GHOST_AUTO meshCacheKeys=20609
(deferred build)` → `§SHELL_GHOST_BBOX boxes=4518` → still staged with `§PHOTO_SHADOW_FRUSTUM_COVERAGE inFrustum=6`,
`§PHOTO_SHADOW_FORCE_REASSERT visMeshes=41`, GI compile 41 renderables, `§FPS_MODE disp=bbox`. NOT memory (heap 1.9 GB,
GPU 2.4/8 GB). Fix (spec first): Alt+S owns the display mode like §DLOD_STILL_OWNERSHIP owns DLOD: suspend ghost /
shell-ghost (and hold its deferred build) at staging, restore at teardown, log `§STILL_GHOST_OWNERSHIP`; check §STILL_ROOMS
triggers no other deferred build. Witness on red1's exact URL: visMeshes ≈ full count, disp=solid during the still. Small
hotfix PR off fresh origin/main, CI auto-merge, prove live.

**State at close (verify before trusting — `git -C /tmp/wt-shadow log -1`, `curl -s 127.0.0.1:8600/viewer/sw.js`):**
- bim-ootb `feat/shadow-size-by-envelope`, worktree /tmp/wt-shadow, served on http://127.0.0.1:8600 (restart recipe in the
  13:10 block below). Last seen @6f1df03d sw v1292, **31 commits ahead of origin, NOT merged, NO PR**.
- **BLOCKER before any merge:** red1's desktop console on v1292 (Hospital from the OCI URL + `&ghost=1`) printed
  `effects.js:2934 Uncaught`, and §EFFECTS_INIT/§EFFECTS_LOADED never printed, so Alt+S did nothing. The served effects.js
  passes `node --check` and line 2934 is `var _stillBaseSaved = null;` → suspect a stale/mismatched file after 6f1df03d
  (merged origin/main, "kept our sw/viewer/effects sides") or a truncated uncaught promise. Reproduce on HIS URL on a
  clean profile, real GPU, and show §EFFECTS_LOADED + a staged Alt+S. Add that URL shape to the fleet smoke.
- red1 RULED: **remove §STILL_GUARD** ("let it load normally, it's a user learning curve"); keep §STILL_LOCK (Esc-only).
- Then the end PR: fleet smoke (Hospital, Terminal, HHS, Clinic, JKR, LTU, Duplex; 0 PAGEERROR, nav fps vs main, one
  Alt+S each, DLOD on split meshes) → one PR, CI auto-merge → `git merge-base --is-ancestor` → prove live
  (red1oon.github.io/bim-ootb sw version + § markers). Hut-wall shading is pre-existing and does NOT gate the PR.
- **2026-09-24 evening, renewed session (dated lines):**
  · BLOCKER CAUSE: while merging origin/main (6f1df03d), effects.js line 2934 held `<<<<<<< HEAD` for a few minutes; 8600 serves
    the working tree live and sw had ALREADY been bumped to v1292, so red1's browser cached the conflicted effects.js under v1292.
    Fixed by v1293 (5b81ef61). Lesson: never bump sw before every conflict is resolved; resolve conflicts off the served tree.
  · §STILL_GUARD REMOVED (red1 ruling). §STILL_LOCK hole fixed: clicks inside the bounce overlay (picture, Save PNG) bubbled to
    main.js's window pointerdown and cancelled the still; main.js cancel paths now return while APP._stillLockOn.
  · witness_oci_ghost_url.js (red1's exact URL: OCI .../o/buildings/Hospital_extracted.db + &ghost=1, clean profile, real GPU):
    §EFFECTS_LOADED, 0 page errors, Alt+S stages + bounce, overlay click + Save PNG keep the still, Esc exits.
  · FLEET SMOKE on 5b81ef61 (witness_fleet_smoke.js, real GPU): 7/7 PASS, 0 errors, one Alt+S each completes + Esc exits.
    Nav render median ms: Hospital 54.8, Terminal 19.1, HHS 4.6, Clinic 8.7, JKR 10.1, LTU 173.8 (main 153.8: +13%, p90 equal
    177), Duplex 1.5. DLOD on split meshes: zeroed when looking away and restored on Hospital/Terminal/HHS/Clinic/JKR/LTU;
    Duplex (1 split mesh, 2 instances) never zeroed — DLOD likely inactive on a building that small (restore trivially 0).
  · Atrium portal priority: area x facing placed 639 m2 vs 540 m2 nearest-first, composite 93.24 vs 93.06 — no lift; default kept.
  · KNOWN COST (watcher accepted): LTU nav median +13% (173.8 vs 153.8 ms, p90 equal) from the R10 glass draws red1 chose.
  · **SHIPPED: bim-ootb PR #1763, squash merge 735c0dd3 (ancestor of origin/main confirmed), CI green (fast-checks needed
    `/* global Buffer */` in 7 node witnesses for the no-undef gate, 203c65f6).** LIVE on red1oon.github.io/bim-ootb: sw.js
    CACHE_VERSION="v1293"; markers present in the minified live files (§ is escaped as \xA7): SURFACE_RULES(_CLASS/_COLOUR/_TALLY)
    + SURFACE_R10 in streaming.js, SKY_PORTAL + LIGHT_UNIFORM_BUDGET in sky_portal.js, GLASS_FRESNEL in glass_fresnel.js,
    STILL_LOCK in effects.js, GI_APP_FRAME in gi_still.js, APP._stillLockOn in main.js; "STILL_GUARD refused" absent (removed).
    Next session: §FILM_PARITY off fresh origin/main (feat/shadow-size-by-envelope is merged; do not reuse it).
  · **HOTFIX spec §STILL_GHOST_OWNERSHIP (live since #1763, red1 "Alt+S goes into bboxes"):** on `&ghost=1` URLs the
    navigate_find auto-trigger (§SHELL_GHOST_AUTO, deferred merged-ghost build) was set off by §STILL_ROOMS' lazy navigate load
    and built the ghost shell MID-still (visMeshes 41, disp=bbox). Fix: (1) the auto-trigger also waits while APP._stillLockOn
    / _stillRefineActive / _photoStagingOn (same rule as §FLY-NO-AUTO-GHOST), re-checked when its idle callback fires;
    (2) Alt+S staging owns the ghost view like §DLOD_STILL_OWNERSHIP: if ghostXrayOn(), toggle it off for the still, back on at
    teardown; log `§STILL_GHOST_OWNERSHIP suspended= restored= autoBuildHeld=`. Branch fix/still-ghost-ownership off
    origin/main. Witness: red1's URL, visMeshes ~ full during the still, §SHELL_GHOST_AUTO only after exit.
  · **HOTFIX SHIPPED: PR #1764, squash f4109331 (ancestor of origin/main), LIVE sw v1294** (live navigate_find.js carries
    "STILL_GHOST_OWNERSHIP autoBuildHeld", effects.js "STILL_GHOST_OWNERSHIP suspended", main.js navigate_find.js?v=60).
    witness_still_ghost_ownership.js on red1's URL: visibleMeshes 4972 during the still (was 41), ghost build only after Esc,
    ghost-on-before-press suspended/restored; red1: "it works". localhost:8600 serves /tmp/wt-ghost (fix/still-ghost-ownership,
    = main).
  · **QUEUE (before §FILM_PARITY; red1: "the non-DLOD flag may cost heavy; any way to reduce its load?") — §STILL_CULL, spec
    next session:** (1) sun shadow map rendered ONCE per still (autoUpdate=false after the first staged frame; scene frozen),
    refine ms before/after; (2) instead of un-culling all 63k at the DLOD pause, keep DLOD culling for anything neither in the
    view frustum nor inside the view's sun-ward shadow volume (camera frustum swept toward the sun, clipped at the envelope), so
    off-screen roof casters stay and parts behind the camera / away from the sun stay culled. Witness: roof-through-sky stays
    fixed (Terminal hall pose), zero-scaled counts + refine ms before/after on Hospital. Speeds every film frame too.

**The approved Alt+S look = v1290 defaults** (sw v1290, 65c471b1): sky 2.0 (hemi), base 0 (flat ambient), lamps 16,
reach 25 m, decay 1.5, bounce gain 1.0 / ao 0.55 / §GI_RECEIVER albedo-estimate on, sky portals (all planar glazing,
nearest-first, cap 32), Fresnel glass on glazing-only clones, surface rules R1-R10, concrete tone 0.55/4 m, lamp colour by
shape (round amber 0xffdca8, rect white), daylight: no window glow, lamps off only when the camera is outside.
Colour fix `&srgbfix` stays OFF (it darkened exteriors ~40%; a future re-balance lane).
**References (protect in every change, re-shoot side by side):** ref1 ~/Downloads/bounce_still_1790230280204.png
(Hospital courtyard 13:51), ref2 ..._1790231488686 (Hospital aerial, bounce off the middle wing), ref3 ..._1790240550314
(spiral stair close-up), ref4 ..._1790242559558 (Terminal hall, "this is the one"), ref5 ..._1790242929806 (Terminal
facade face-on: "the see-through lit-up inside is surreal" — THE look to carry into films).

**§FILM_PARITY — the lane (spec first, then build):**
1. Bounce in Alt+C: a proper option, ON by default, checkbox off; the "copy bake command" carries it (today only the dev
   `--tap` sandbox gi_bake_tap2.js via cli_silent_bake does). No WebGPU → stands down with a logged §GI_*_OFF.
2. Every Alt+S-only gate in viewer/effects.js made film-capable, per frame over a MOVING sun (lines at close):
   3969, 4020 (§STILL_GLOW daylight rule — evaluate per frame, films pass through dusk), 4053 (§STILL_BASE sky/base),
   4078 (lamps: strength/reach/decay + §LIGHT_UNIFORM_BUDGET + §STILL_LIGHT_PAD), 4105 (§SKY_PORTAL), 4106
   (§GLASS_FRESNEL), 5644; also the lamp shape colours. 4104 §SKY_OCCLUSION stays opt-in (rejected as a default).
3. Hard rules for films: constant light count across ALL frames (a count change recompiles ~110 materials: 40-108 s);
   portal shadow maps once per frame at most; the bounce renderer with lighting.enabled=false (§GI_PRESS_COST); nothing
   shared stays changed across an await (§GI_SCENE_BORROWED holds the app frame).
4. Proof: 5 s control clip + 5 s parity clip at target size before ANY full film; per-frame § lines show each feature
   applied; one frame of the parity clip next to ref5/ref1 at the same pose. Never send red1 a film before its check.

**Queue after parity:** atrium daylight (`&portalsort=area` exists, 1c85ae96 — measure the atrium), roof-deck moiré at
distance (fade/coarsen the R1 texture), lamps-seen-lit-from-outside-by-day puzzle (red1's 17:38 Terminal still), real
reflections (cube map at Alt+S time vs SSR; must NOT dim the see-through interiors), hi-res Alt+S (1080p/4K independent
of the window), first-build compile (~62 s), view-fitted sun frustum (jagged edges; nav looks smooth only because its sun
is fixed high), fake bounce lights, ceiling-only base, colour-correct re-balance, hut walls, probe grid.

**Working rules:** serve on 8600 as you go; every recap "localhost:8600 serves <branch>@<real sha>, sw vNNNN"; bump sw +
?v= on every served change; one push + PR + auto-merge at session END then prove live; § log evidence, never guesses;
look at every frame before describing it; gate every capture on full load + THIS press's completion lines; keep GPU test
runs short (red1 shares the GPU); never hand red1 a git/permission decision.

## ▶▶▶▶ §RESUME 2026-09-24 13:10 — START HERE (supersedes the PM block below; that block is history)

**On localhost:8600 (red1 judges here):** bim-ootb `feat/shadow-size-by-envelope` @ **6750db1b**, sw **v1253**, tree
/tmp/wt-shadow, PUSHED (backup), **NO PR** (the open items below gate the one end-of-session PR).
URLs: http://127.0.0.1:8600/viewer/viewer.html?db=/buildings/Hospital_extracted.db (also Terminal_extracted.db,
HHS_Office_Federated_extracted.db). Dials: `&base=0.25` raises the Alt+S base light (0..1, default 0);
`&surf=off` = old surfaces; console `APP._sunShadowRestoreEnabled=true` = parked restore pass; `&tri=big` (superseded).
**Restart 8600 after a reboot** (/tmp dies): `git -C ~/bim-ootb worktree add /tmp/wt-shadow feat/shadow-size-by-envelope`
(fetch first), symlink any missing DB into /tmp/wt-shadow/buildings (serve_tree falls back to ~/bim-ootb/buildings anyway),
then `setsid nohup node ~/bin/serve_tree.js /tmp/wt-shadow 8600 > /tmp/serve8600.log 2>&1 < /dev/null &`.
**Live on main already:** #1759 row probe (sw v1235), #1760 film fill (v1240).

**red1 RULED today (all on the branch unless noted):**
- Surfaces §SURFACE_RULES R1-R9 ON by default ("cleaner, no more drab surfacing"); floors before substance (R4).
- R10 openings: split glass/frame + door handle/leaf (merged from feat/surface-r10 ac6c5524); glass alpha = building's own.
- Film fill restored 0.785/1.257 (#1760 LIVE). Alt+S keeps #1601's fill, and now scaled by the base dial.
- Daylight Alt+S (sun > 6°, dusk mood off): NO window glow; lamps OFF only when the camera is OUTSIDE (rooms roomAt, up-ray
  fallback); films unchanged (§STILL_GLOW af75fb41).
- Alt+S base light (ambient+hemi) = dial, default 0 = real sources only; deep interiors go dark by design (§STILL_BASE fac153dd).
- Shadow restore pass: PARKED (off; depth fix kept behind the flag).
- Alt+C bounce: ON by default with an off checkbox, the copy-bake-command line carries it, no WebGPU -> stands down + logs.
- Probe-grid lighting: survey written (§PROBE_GRID_SURVEY); first step = one measured 4 m sky-only Hospital bake.
- Also on the branch: DLOD paused during Alt+S, 8192 Hospital map, status-at-once, §STILL_POSE pose log.

**OPEN, in order (all gate the end PR):**
0. **FIRST — red1's two rulings after eyeballing 8600 (dials to tune live on 8600):**
   (a) "Alt+S is too dark. It seems not to take in enough sky ambient light." At base=0 the SKY (hemi) is scaled away
   together with the flat ambient (§STILL_BASE scales both). Split the dial: `&sky=` scales hemi (the sky from above),
   and `&base=` scales the flat ambient only. Sky default > 0, value picked by red1 by eye. Both read at every press.
   (b) "Indoor lighting is not throwing enough, so it is a knob." Add `&lamps=<scale>` (and a range multiplier) for the
   fixture point lights in Alt+S, read at every press. Mind the `(A._nightPLScale || 1)` trap in tools.js (~2052/2087):
   0 must mean 0. Facts from source: the Alt+S lamp set is §NIGHT_STILL_FRUSTUM (tools.js ~1842): fixtures whose position
   is inside the camera frustum, capped at 200 (a sanity ceiling, not a creative limit), plus the §BAKE_INTERIOR_TOPUP
   branch; the nav budget is nearest-N to the camera (sorted by distance, ~1790). The Alt+S intensity is
   NIGHT_LIGHT_INTENSITY 2.0 x fade x _nightPLScale (_nightPLScaleStill 0.5 in staging, §STAGED_PL_CUT); the range/decay
   are NIGHT_LIGHT_RANGE / NIGHT_LIGHT_DECAY. Log per still: `§STILL_BASE sky= base= lamps= range= camInside=`.
   **§STILL_DIALS spec (2026-09-24 PM, renewed session):** Alt+S only (`!A._maxqActive`); films and nav unchanged.
   Read once per press, URL then console override (`APP._stillSky/_stillBaseScale/_stillLamps/_stillLampDecay`).
   - `&sky=` 0..2, default **1** = hemi at #1601's Alt+S value (0.617), i.e. what Alt+S had before §STILL_BASE.
     Default is a start point for red1's eye, not a ruling.
   - `&base=` 0..2, default 0 = flat ambient off (unchanged meaning, now ambient ONLY).
   - `&lamps=` 0..4, default 1 = today's lamp strength. A plain multiplier on each fixture light, checked with
     `typeof === 'number'`, never `||`, so 0 gives intensity 0 (no `|| 1`). Films' `_nightPLScale || 1` untouched.
   - Range, from source: NIGHT_LIGHT_RANGE = 0 = infinite reach already; a range MULTIPLIER on 0 does nothing.
     The real reach lever is the fall-off: `&lampdecay=` 0..2, default NIGHT_LIGHT_DECAY 1.0; lower = throws further.
     Set on every Alt+S lamp (new and reused); nav lamps get NIGHT_LIGHT_DECAY back at teardown.
   - Log per press: `§STILL_BASE sky= base= lamps= decay= range=0(inf) hemi= ambient= camInside= lampsOn=`.
   - Proof: one headless Alt+S press per dial arm on Hospital gated on 63,182 elements (VACUOUS otherwise), reading
     the logged hemi/ambient and the sum of lamp intensities; lamps=0 must log sum 0.
   - red1 (via watcher): `&sky=` default 1.0 (old Alt+S hemi), `&base=` default **0.25**. Tuned by eye on 8600.
   - red1 LOOK ruling 13:3x ("I think we got it"; off-sun walls read dark): base default **0**; sky default **1.5**,
     range 0..3; bounce MORE: **§GI_STILL_GAIN_DIAL** `&bounce=` 0..3 (APP._stillBounceGain, window.__GI_STILL_GAIN),
     default 1.0 (was 0.6), read at EVERY press: gain and AO become TSL uniforms on the kept renderer (fixes
     §GI_DIALS_FIRST_BUILD for gain/AO; slices/steps still first-build). Log `§GI_STILL gain= ao= applied`.
     bim-ootb f42f1c37, sw v1256.
   - Gate note: the page's JOIN says 63,415 for Hospital, Hospital_meta.db's own JOIN says 63,182 (the loaded set).
     witness_still_glow.js takes `--want 63182` and logs both.
   **§LAMP_SHAPE_COLOUR spec (red1 via watcher: "round lights soft amber, rectangular ones white; it gives good
   reflective play on the surfaces"):** Alt+S only (films/nav keep §NIGHT_LIGHT_MIX). Shape from each fixture's OWN
   mesh (A.meshCache[ghash], local X/Z = plan, local Y = up), never its name: fill = convex-hull plan area / plan
   bbox area; aspect = long/short side. ROUND: fill 0.70-0.86 and aspect <= 1.25 (a disc is 0.785). RECT: fill >= 0.93.
   Anything else, or no mesh loaded = AMBIGUOUS, keeps its §NIGHT_LIGHT_MIX colour. Exit signs keep their green.
   Colours from the existing palette (tools.js): round = NIGHT_WARM 0xffdca8 (~2900K, "downlight/sconce/pendant";
   softer than NIGHT_MIX_AMBER 0xffb45c), rect = NIGHT_MIX_WHITE 0xffffff. Light and glow sprite take the same colour.
   Log once per press: `§LAMP_SHAPE_COLOUR bld= round= rect= ambiguous= noMesh= exit=`; run Hospital, Terminal, HHS.
1. **Rooftop hut walls show no away-from-sun shading** (red1 disputes the glow explanation for opaque huts). Opus agent
   STOPPED mid-run, no verdict. Evidence in scratchpad wallshadow/ (hut.js, log_hut_{base,sunonly,surfoff,trioff,
   nopoints,noambhemi}.txt, sheet_hut_base_vs_sunonly.png, sheet_hut_variants.png). Two LEADS, unproven: (a) its last
   line: "the triplanar chunk skips `batchingMatrix`", i.e. for BatchedMesh the triplanar world position/normal ignores
   the per-instance transform; (b) §MEP_SMOOTH_NORMALS smoothed 15,591,853 verts in 1,166 geoms at staging, far beyond
   MEP; check whether hut walls are in it (smoothed box normals light every face alike). Next: sun-only N·L per face
   from the buffer normals + the shader normal, one variable at a time.
2. **R10 gaps** (feat/surface-r10 @ 250b8546 = WIP witness with the full-count gate; agent stopped): (1) glass-shadow arm
   re-run with the gate (a "before" of 0 vs 4,272 smelled of a short load); (2) force DLOD on split meshes, zero-scaled >0
   then restored, both groups together; (3) Alt+S bounce with split meshes on the real GPU; (4) LTU fps before/after
   (draws +17%, transparent 18->489).
3. §STILL_GLOW / §STILL_BASE: one clean Alt+S witness run on this build (the latest arm's load was short; the stopped run
   was the check of the new lines). Stills for red1: courtyard (no glow, no lamps), interior (lamps on), dusk (both).
   Beam/railing check with the lamps off.
4. Hospital mid-wing arms, if still needed after 1 (texel/frustum/filter known from source; the view-fitted frustum
   is the lever to test).
5. Bounce composite shifted sideways on alternate shots after __giStillRelease (scratchpad dials/run2/); then gain stills.
6. Alt+C bounce option (spec'd above). 7. Probe grid first bake.
**Renewed session 2026-09-24 PM (bim-ootb feat/shadow-size-by-envelope, local commits, 8600 serves each):**
- 4e18a35d..327f6a66: §STILL_DIALS (sky 2.0 / base 0 / lamps 2.0 / lampdecay 0.8), §LAMP_SHAPE_COLOUR + §LAMP_SHAPE_FACE
  (HHS rect 260 round 150; Hospital rect 1260 round 12 noghash 14; Terminal rect 748 round 66 noghash 28; 0 ambiguous),
  §GI_STILL_GAIN_DIAL (&bounce= &ao=, uniforms per press; witness_gi_gain_dial.js PASS), §STILL_CAMINSIDE_SPARSE
  (room-index miss falls through to the up-ray), §GI_STILL_TERM modes, §GI_RECEIVER (bounce x albedo estimate, not the
  lit colour: courtyard 0.8%->4.9%, L1 13%->32%; SSGI dials &girecv= &girad= &githick= &gisteps= &giint=),
  §STILL_LAMPS_OUTSIDE (&lampsout=1, default 0 pending red1).
- REFERENCE LOOK (red1: "quite good outside"): ~/Downloads/bounce_still_1790230280204.png, Hospital courtyard, sw v1262
  defaults (sky 2, base 0, lamps 2, lampdecay 0.8, bounce 1, ao 0.55, girecv 1). Its §STILL_POSE is not in our logs yet
  (it is red1's own press); closest logged pose = pose_p1 cam [-62,38,-4] tgt [-16,-2,-4]. Re-shoot after every
  glass/portal/ceiling change, side by side for red1.
- REFERENCE 2 (red1: "really good; see the bounce on the wall from the middle wing"): ~/Downloads/bounce_still_1790231488686.png,
  Hospital from above, sw v1265 defaults (sky 2, base 0, lamps 2, lampdecay 0.8, bounce 1, ao 0.55, girecv 1, concrete 0.55,
  concretetile 4, portal 1, lampsout 0). These defaults are the BASELINE: do not move them without red1. Re-shoot refs 1+2
  after every lighting/glass change.
- §GLASS_FRESNEL spec (red1: "reflection has to follow the physics: a lit surface reflects well"): Schlick Fresnel at FULL
  strength, never scaled by opacity; the reflected content's own brightness decides how strongly it shows (sunlit facade
  / sky opposite drowns the interior view; dark surround lets you see in). Source = sky env now, cube-map/SSR later. No
  strength dial, only on/off for comparison. Log `§GLASS_FRESNEL mats= f0=`.
- **§STILL_LAG (red1 "getting laggy", measured 2026-09-24, witness_still_lag.js, Hospital L1, real GPU, headless):**
  portal=0: refine 3.9 s / 2.2 s, bounce passes 1.6 s / 37.2 s (press 1 / 2). portal on (placed 32, 8 shadowed):
  refine 11.6 s / 4.7 s, bounce passes 1.5 s / 34.9 s. First build, both arms: geometry-pass compile ~62 s, orientation
  ~50-54 s (red1 desktop: 67.6 s / 12.7 s). Heap flat press 1->2 (~1.9 GB). READ: portals cost refine time (x3 on press
  1, x2 on press 2): shadowed spots re-render + recompile. But the 10x bounce slowdown on press 2 happens WITH portals
  off too, so it is NOT the portals: the kept WebGPU renderer's second shot is the suspect. The first-build compile is
  also portal-independent. Headless runs share red1's GPU: no GPU runs while he is eyeballing.
  Fix queue when resumed: (1) press-2 bounce slowdown (kept renderer), (2) portal shadows rendered once per still +
  constant light count across presses, (3) first-build compile 62 s. Then view-fitted shadow frustum (watcher call),
  then Fresnel glass. Ref 2 pose (watcher, from red1's paste): cam [-39.469,12.563,50.109] tgt [3,-4,3] fov 60.
- **§SKY_OCCLUSION spec (red1: "indoor floor too bright, not taking in shadows"; resumed 2026-09-24):** Alt+S only.
  At staging, render ONE top-down orthographic depth map (DepthTexture, 2048^2) over the building envelope; hidden in
  that pass: transparent glazing (glass lets sky in), sprites/lines/points, sky, ground. Shader: THREE.ShaderChunk
  patched ONCE at load (loader.js, right after three loads, before any material compiles): lights_pars_begin gets a
  skyOccVis() (uniforms uSkyOcc/uSkyOccMap/uSkyOccMat/uSkyOccKeep/uSkyOccBias/uSkyOccTexel; STANDARD/LAMBERT/PHONG/TOON
  only; uSkyOcc=0 returns 1 = nav and films unchanged); the hemi irradiance, the env irradiance and the env radiance
  are multiplied by it. Lookup at world pos + 0.5 m along the world normal (a facade samples open air outside it, a
  floor samples under its ceiling), 3x3 PCF, bias 0.3 m. vis = mix(1, keep, coveredFraction), keep = &skyocc= 0..1
  (default 0.15). Uniform values are pushed into every scene material's program uniforms from scene.onBeforeRender
  (a recompile re-clones them), so there is no recompile and no light-count change. Map rendered once per still, disposed
  at teardown. Log `§SKY_OCCLUSION map= texel= coveredFrac= mats= ms=`. Proof: refs 1+2 (outdoor) show no change, L1
  interior floor darker.
- (was PAUSED 2026-09-24 at 84541b9f / v1266; RESUMED by red1, whole queue: sky occlusion -> lag -> Fresnel -> compile -> view-fitted shadow -> fake bounce -> SSR vs cube -> ceiling base.)
- **OPEN (2026-09-24):** (a) the "missing building" frames — cause found: the bounce's first build hides app meshes
  across awaits (~60 s progressive compile); app renders in that window showed a half-hidden building. Fixed by
  §GI_SCENE_BORROWED (app holds its frame). The earlier unexplained frame is consistent with it. (b) The bounce read a
  near-black app frame (appMean 13.3) on some presses (ref re-shoot press 2; Fresnel witness press 1 at pose_p1) while
  the saved WebGL frame was normal (mean 119): the canvas read during/after heavy WebGPU work; not chased yet.
  (c) Poses: "p2_courtyard_low" [-44,2,-6] is BELOW ground (Hospital ground y = -15.9) — do not use. Courtyard pose
  checked by eye: courtyard_a cam [-40,1.8,-4] tgt [-10,3,-4] (ref 1 stand-in).
- **§STILL_GUARD + §STILL_LOCK spec (red1, 2026-09-24):** GUARD at the user entry (toggleStillRefineUI, i.e. Alt+S and
  the pill): refuse to start when A._bboxPlaceholders.length > 0 (bbox not cleared), A.streaming (not complete), or
  A.xrayOn (display mode). Ghost glass keeps its state private (not checked, logged n/a); DLOD has no bbox stand-ins
  (it only zero-scales, and Alt+S already pauses it). Toast "Still loading — Alt+S when the model is solid" (or the
  X-ray wording); log `§STILL_GUARD refused reason=` / `ok`. The bounce's own Alt+S handler stays silent on a refusal.
  LOCK from a UI start until the still is released: a window capture-phase listener swallows pointer/touch/wheel/
  contextmenu/dblclick everywhere except inside #gi-still-overlay (Save PNG / Close), and every key except Escape
  (Alt+S included). Esc = the only exit: closes the bounce overlay and tears the still down ('cancelled (Esc)').
  Log `§STILL_LOCK on` / `off blocked=<n>`. Programmatic starts (bake, witnesses) are not locked.
- REFERENCE 3 (red1: "the bounce is very good on the slab by the stairs"): ~/Downloads/bounce_still_1790240550314.png,
  spiral-stair close-up, v1287. Pose not logged; nearest stair close-up to be picked by eye. Atrium pose (checked by eye):
  cam [-5.355,-13.58,9.984] tgt [-5.355,-11.28,-2.316].
- §FLOOR_WASH findings (2026-09-24, dials default OFF, 9d790e5f): colour pipeline uses authored sRGB as linear (walls 0.92
  where 0.828 is right); §LIGHT_STACK: 132 lamps all reach the atrium floor point, sum 74x the strongest. Finite reach at
  lamp strength 2.0 is uniformly too dark (composite 88 vs 187 now); proposal: reach 20 m/decay 1.5 + per-lamp strength
  raised (arms lamps 8 / 16), awaiting the watcher's pick. Sheets: ~/Downloads/atrium_wash_sheet.png, atrium_reach_sheet.png.
- **REFERENCE 4 + APPROVED LOOK (red1 17:35, "I think this is the one"):** ~/Downloads/bounce_still_1790242559558.png,
  Terminal hall, sw v1290 (bim-ootb 65c471b1). The v1290 Alt+S defaults are LOCKED as the approved look: sky 2.0, base 0,
  lamps 16, lamprange 25 m, lampdecay 1.5, srgbfix OFF, bounce 1.0, ao 0.55, girecv 1, concrete 0.55 / tile 4 m,
  portal 1 (budget 19 incl. 8 shadowed, lamps 132 padded), Fresnel glass ON (glazing clones), lampsout 0, skyocc not
  installed. §FILM_PARITY carries exactly these into Alt+C. Ref 4 pose: not logged (red1's press); nearest Terminal hall
  pose not yet found (table cluster IFC x 103.6-109.6, y -38.3..-11.4, "Aras Tanah").
- **FUTURE LANE — colour-correct re-balance (parked, watcher 2026-09-24):** authored sRGB colours are used as linear
  (ColorManagement off + new THREE.Color(r,g,b) + sRGB output). &srgbfix=1 converts them in Alt+S, but on its own it
  darkens every look red1 approved (aerial composite 92.5 -> 75.4, courtyard_a 73.2 -> 45.0; atrium 186.7 -> 173.3).
  A fix needs a matching exposure/fill re-tune across refs 1-4; not now.
- GLASS: frosting causes measured (all panes opacity 0.3 double-sided = ~0.51 effective, grey 737278 diffuse lit like a
  wall, non-R10 glazing roughness 0.22-0.49). red1 then said (direct, 2026-09-24): glass "got the right effect thruout";
  the problem is interiors seen THROUGH it are drab. Glass change PARKED; nothing changed on glass.
- Drab interiors from outside: daylight + camera outside = lamps OFF (earlier ruling), so rooms get only the flat hemi.
  &lampsout=1 is served for red1's eye; sky portals (queued) are the window-light source.
- OPEN, not chased: Hospital's room index has 2 rects for the whole building; roomAt callers (RoomWalker
  .buildCameraRoomIndex: effects.js _stillCamInside, dlod_nav.js room leg) are likely blind on Hospital.
- Off-frame bounce (a sunlit source outside the view) is beyond screen space: the PROBE GRID is the answer; it moves up
  after the sky portals.
- **§SKY_PORTAL spec (built next):** Alt+S only. Panes = R10 split window meshes, pane box from the aPane=1 vertices
  (local bbox -> world via instance/matrixWorld; thin axis = normal; the two long axes = pane size). Inward side = the
  side whose up-ray (0.5 m off the pane) hits building geometry within 30 m; both/neither -> skipped, logged. Candidates:
  panes within PORTAL_RANGE 40 m of the camera, nearest first, cap &portalcap= (default 32). One SpotLight per pane,
  just outside the pane, aimed inward, half-angle 70 deg, penumbra 1, decay 2; the nearest &portalshadow= (default 8)
  cast shadows at 512 (pane casts nothing since R10, frames cast = mullion shadows), the rest unshadowed (can leak
  through walls — logged). RectAreaLight NOT used: RectAreaLightUniformsLib is not in viewer/lib (checked 2026-09-24).
  Intensity: physical base I = H x A / pi (H = staged hemi intensity, A = pane area; a diffuse pane of radiance H/pi),
  x PORTAL_EXPOSURE 10 (start value for red1's eye: the unoccluded hemi already lights interiors everywhere, so a
  physical portal is drowned) x &portal= 0..3 (default 1). Colour = hemi sky colour x the pane's own colour HUE
  (normalised to max 1; no alpha dimming, red1's glass ruling). Log `§SKY_PORTAL placed= shadowed= unshadowed=
  capped= skipped= intensity= ms=`. Cost: render ms with/without, real GPU, HHS + Hospital. Teardown removes all.
- Queue: sky portals (shadowed spots for the nearest 4-8 panes, RectAreaLights beyond, hue-only filter, &portal=),
  then the ceiling-only base (&ceil=), then the probe grid. Hut walls + R10 gaps still gate the end PR.

**Awaiting red1's ruling (films, NOT changed):** tools.js lamp intensity uses `(A._nightPLScale || 1)`, so a scale of 0
becomes 1. The film's §CPE_TAIL_LIGHTS_ALL_ONLY lights-off slot has therefore never switched lamps off. Alt+S now gates
on its own flag (§STILL_GLOW). Fixing it globally would change films.
**Flaky headless loads (open, not chased):** Terminal streamed 48,428 / 47,928 / 29,928 / 0; Hospital sometimes 8,682 or
62,682 of 63,182. Every witness must gate on elements WITH transforms (elements_meta JOIN element_transforms per building;
Hospital 63,182, not elements_meta's 63,415) and print VACUOUS otherwise.
**Agents:** red1 rests Fable when tokens are low; Fable clears the hard unknowns, then Opus/Sonnet do the follow-on.

## ▶▶▶ §RESUME 2026-09-24 PM — START HERE (supersedes the block below for what is open)
**Served on localhost:8600:** bim-ootb `feat/shadow-size-by-envelope` @ eb854d69, sw v1247, from /tmp/wt-shadow
(`node <scratchpad>/serve_tree.js /tmp/wt-shadow 8600`, started with setsid). PUSHED as a branch for backup; **NO
PR yet**, on purpose: the watcher ruled nothing merges that could make Alt+S worse, and the Hospital mid-wing
shadow question below is unresolved; its suspects (8192 map, DLOD pause, surface rules) are all on this branch.
**Live on main already:** #1759 row probe (sw v1235), #1760 film fill (sw v1240).
**On the branch, witnessed:** §DLOD_STILL_OWNERSHIP, §SHADOW_SIZE_BY_ENVELOPE (8192 Hospital), §SUN_SHADOW_RESTORE_DEPTH
(fix kept, pass OFF by default = PARKED), §STILL_STATUS_FIRST, §TRI_BIG_ONLY switch, §SURFACE_RULES R1-R9 DEFAULT ON
(red1: "cleaner"), film fill merged in. Witnesses: viewer/tests/witness_{dlod_still_ownership,tri_big_only,
still_status_first,surface_rules}.js.
**OPEN, in the watcher's order (fable agents stopped by red1 to save tokens; nothing half-written in any tree):**
1. Hospital mid-wing shadows (red1: "shadows may disappear ... mid in between wings") + the film-vs-Alt+S "wall
   facing away from the sun" pair. Arms and required logs: see the watcher's brief (A1/A2 8600 before/after the bounce,
   B live main, C1 ?surf=off, C2 4096, C3 DLOD; D1 film staging via A._maxqActive=true vs D2 Alt+S, logging the
   sun, fill, env/envInt, bounce gain, and N·L of the off-sun wall). Only poses exist so far: scratchpad shadow_ab/pose_p1.json, pose_p2.json.
   ADDED (red1 via watcher): is the jagged edge part of the same problem? Per arm, one line: shadow texel (m) at the
   parapet and at the mid-wing wall, and the filter in use. KNOWN FROM SOURCE, before any run: the photo shadow is
   PCFShadowMap (effects.js:3164; tools.js:942), shadow.radius never set (= three's default 1). The sun camera is
   ORTHOGRAPHIC, so the texel is the SAME everywhere in the frustum: 2*env/size = 0.088 m at 8192 on this branch,
   0.177 m at 4096 on main (Hospital env 362). What differs by place is the footprint on the surface: a texel
   stretches to texel / sin(angle between surface and sun), e.g. a flat roof at a 10° sun gets 0.088/0.174 = 0.51 m
   steps along the sun direction, while a sun-facing wall gets ~0.09 m. So the saw-tooth is area-per-map at grazing
   incidence, with a 1-texel PCF that does not hide it. To confirm per arm: the logged frustum bounds and whether the
   mid-wing point is inside it (a point OUTSIDE the frustum gets no shadow at all, which would explain missed walls).
   LEVER TO TEST WHEN THE RUN RESUMES (watcher, not now): Alt+S is ONE still view, so fit the sun frustum to the
   camera's VISIBLE receivers instead of the whole 362 m envelope. The texel shrinks many-fold where it matters. Test it
   as one variable next to PCFSoft / radius. Caveat to log: casters OUTSIDE the view (a wing behind the camera) must
   still land in the frustum: extend it toward the sun over the envelope's height, or shadows go missing (the
   same symptom as the mid-wing report). Log the fitted bounds + texel per arm.
   TEST POSE (red1, 11:43): ~/Downloads/bounce_still_1790221419718.png, Hospital, looking down into the courtyard
   between two wings; roof items cast shadows (the helicopter's falls lower-left, so the sun is behind the right
   wing), yet the courtyard floor and both inner facades carry no wing shadow, and the right wing's inner (off-sun)
   facade is bright. Both of red1's points in one frame. The PNG has no pose, and no console line logs the camera at
   Alt+S; red1 was asked (via the watcher) to paste: JSON.stringify({cam:APP.camera.position.toArray(),
   tgt:APP.controls.target.toArray(),fov:APP.camera.fov,aspect:APP.camera.aspect,sun:APP.sun.position.toArray(),
   sunTgt:APP.sun.target?APP.sun.target.position.toArray():null,sunI:APP.sun.intensity,db:location.search,w:innerWidth,h:innerHeight})
2. Bounce composite shifted sideways on alternate shots after __giStillRelease (HHS, camera logged identical,
   appMean 119.25 every shot). Evidence: scratchpad dials/run2/. Then the bounce-gain stills 0.6/1.0/1.4 for red1
   (the bounce dials apply only at first build, §GI_DIALS_FIRST_BUILD).
3. §SURFACE_R10 openings: spec + additions approved; /tmp/wt-r10 branch feat/surface-r10 created at eb854d69,
   NO code yet. The measurement to port is in scratchpad r10/.
3b. §SURFACE_R10 BUILT (Opus agent, /tmp/wt-r10 feat/surface-r10 @ ac6c5524, local): split counts match the
   measurement exactly (Hospital 118/118, Terminal 223/228, LTU 951/976); paneCasters=0. Closing 4 gaps before red1
   looks: glass-shadow arm with a full-load guard, DLOD forced on split meshes, the Alt+S bounce on the real GPU with
   split meshes, LTU cost in fps. Then merge into the served branch after §STILL_GLOW.
OPEN (record, not chased): headless page loads are FLAKY. Terminal streamed 48,428 / 47,928 / 29,928 / 0 in different
   runs, and Hospital sometimes 8,682 or 60,682 of 63,182. It hits every witness: each must gate on the full element
   count (elements_meta per building vs guidMap) and print VACUOUS otherwise.
4. Bounce as a proper Alt+C film option (today only the dev --tap). red1 AGREED (2026-09-24, via watcher): ON by
   default, a checkbox to switch it off; covers the in-browser film AND the "copy bake command" line (it must carry
   the option, not the dev --tap); no WebGPU -> stands down with a logged §GI_*_OFF and the film still bakes. Spec
   first. Proof before any big bake: 5 s control clip + 5 s bounce clip, and a log showing the bounce ran per frame.
   Order unchanged: mid-wing/off-sun-wall report, the shift, gain stills, R10 (Opus agent running in /tmp/wt-r10), then this.

## ▶▶ §RESUME 2026-09-24 — START HERE. The bounce is LIVE on the real site; three items open.
Everything in §GI_BUILT below is history + evidence; this block is the state.

**LIVE on https://red1oon.github.io/bim-ootb/ (sw v1234):** Alt+S bounce still (desktop + WebGPU + three
r186; phones/no-WebGPU log `§GI_STILL_OFF`). Merged: bim-ootb #1756 (bounce + film tap, sandbox),
#1757 (viewer: r186 core/webgpu, viewer/gi_still.js, gate), #1758 (§GI_ORIENT_RATIO). Fleet check
(7 buildings, r185 vs r186) identical. A browser still showing the OLD Alt+S = its service worker;
reload twice / close all tabs (red1 hit this 2026-09-24).

**On a branch, tested, NO PR yet** — bim-ootb `feat/shadow-size-by-envelope` (8a938d9c, de29cb96;
worktree /tmp/wt-shadow, served on http://127.0.0.1:8600/index.html by
`node <scratchpad>/serve_tree.js /tmp/wt-shadow 8600` — /tmp, gone after reboot):
  1. §GI_ROW_PROBE — red1's desktop reads rows the OPPOSITE way to headless (flipOut=true, Clinic
     20.93% vs 0.01%); the live #1758 fallback ("no flips") is therefore WRONG on his machine at an
     undecided view. Probe witnessed 0/2048 vs 2048/0 (injected). **Ship this first** — it is a live
     correctness fix. sw/effects version bumps already in the branch (v1235, effects.js?v=40).
  2. §SHADOW_SIZE_BY_ENVELOPE — Hospital 8192 (0.088 m texel, 512 MB freed on exit), Clinic/HHS 4096.
     BUT red1's 07:21 Hospital still (Downloads/bounce_still_1790205672390.png, taken on this build)
     STILL shows the sawtooth under the parapet: resolution alone does not fix it. Hypothesis (NOT
     measured): the grazing-sun PCF kernel widening (`§SUN_SHADOW_RESTORE kernelMaxScale=4`). Next:
     one-variable A/B on Alt+S at that pose, kernel scale 4 vs 1, before any PR of the size change.

**OPEN — film interiors gloomier than Alt+S stills (red1: "old issue, shadow ON can darken
interiors").** NOT the lamps (red1 ruled it out: lamps are on early and it is still gloomy). Lead:
LOADPATH_FREEZE_POLISH_RESUME.md §134 "A REAL DEFECT FOUND" — PR #1601 (2026-09-01) halved fill
(ambient 0.785->0.386, hemi 1.257->0.617); bake prints sunFillRatio=4.387 vs TM's 2.155, so shadowed
interiors get ~2x the contrast. The honest experiment there is still undone: one clip with fill
restored (runtime override, no file edit) vs as-is, same frames, red1 judges.

**WATCHER HANDOFF (2026-09-24, red1-20 -> fresh session).** The working session is `red1-ff`
(local, find it with ListAgents). red1's arrangement: it sends its recaps to the watcher; the watcher
answers routine calls on red1's behalf within the set direction and keeps it from veering; LOOK
rulings and scope changes go to red1 himself. Rules it has been given: serve ALL work on
http://127.0.0.1:8600/index.html as it goes (sw/?v bump when Alt+S changes; every recap states
"localhost:8600 serves <branch>@<sha>, sw vNNNN"), ONE push + PR + CI auto-merge at session END,
then prove on the live site; never hand red1 git decisions; § log evidence, never guesses.
Its queue, in order (as of 08:40): (1) DLOD off during Alt+S — red1's 08:37 Terminal still
(Downloads/bounce_still_1790210272668.png) shows sky/sun through the roof; only Time Machine pauses
DLOD today (time_machine.js:9312); also confirm bakes (TM pause, §DLOD_BAKE_PROXY :9331);
(2) fill-restore A/B clips for gloomy interiors (HHS film frames 168-288, --no-load-path; clip B valid
only if EVERY per-frame §SUN_ARC_FILL_PIN reads ambient 0.7850 / hemi 1.2570) — result goes to red1
for the look; (3) low-sun (~10 deg, 228 az) shadow re-run on Hospital at 8192: k4 / k1 / shadows OFF,
each logging elevation + NdotL/kScale at the parapet (first A/B at 45 deg was INCONCLUSIVE: kScale
only 1.41x). Also noted open, not chased: red1's 07:21 still is left-right mirrored vs headless.
**NEW OBSERVATION (red1, 2026-09-24): rugged surfacing is overdone on SMALL parts.** Doors and some
beams get the same rough triplanar texture as big walls and slabs — "not appropriate and overdone as
big walls, slabs already have them". Evidence in red1's own logs: `§TRIPLANAR_INIT class=IfcDoor
tex=textures/materials/metal_color_1k.jpg`, `class=IfcBeam`, `IfcMember`, `IfcFlowTerminal`,
`IfcRailing` all receive a triplanar map (`§TRI_SRC_TALLY ... textured=46729` of 48428 on Terminal).
Not traced yet: which rule assigns triplanar by class/name (search §TRIPLANAR_INIT in viewer/). Likely
direction for red1 to confirm: apply the rugged maps by SIZE or class (walls, slabs, columns, big
coverings) and give small parts (doors, beams, members, fittings, railings) a smooth material. Queue
after the three items above; red1 judges the look on localhost.
**§SUN_SHADOW_RESTORE IS INERT — MEASURED (2026-09-24, Hospital, 8192 map, sun 10° alt / 228° az).**
Low-sun re-run, three arms (k4 / k1 / sun.castShadow off), same pose, real GPU. Each still printed its
own `§SHADOW_SIZE_BY_ENVELOPE size=8192` and `§SHADOW_KERNEL_AB ... sunElev=10.0deg kScale(flatRoof
NdotL=0.174)=4.00` (k1: 1.00). The widening WAS live per pixel (k4 crop meanK 3.29, max 4), but the
pass's own shadow term classed **0 of 1,439,424 frame pixels as shadowed, and 0 as edge**, in both arms
(`§AB_KSCALE_READBACK`). Cause: the shader does `step(sc.z, texture2D(tShadowMap, sc.xy).r)` with
`tShadowMap = A.sun.shadow.map.texture` (effects.js ~4500). In this three build the WebGL shadow map
writes depth to a separate `map.depthTexture`; `map.texture` is an RGBA8 colour attachment (readback
.r ≈ 0.76 where sc.z ≈ 0.24), so the step never fires and the pass returns the AO colour untouched.
**Not a r186 regression:** the WebGL shadow-map allocation in three.module.min.js is byte-identical
before and after #1757, and §SUN_SHADOW_RESTORE landed 2026-08-14, after r185 (06-27), so it has
likely never worked. With shadows OFF the parapet edge is clean, so the stair-step is the native
PCFShadowMap edge (0.088 m texels at 8192), not geometry. The kernel dial cannot fix it. Fix
direction (red1's call, NOT done): sample `map.depthTexture` (compareFunction null for this path)
instead of `map.texture`. Evidence: scratchpad shadow_ab/ (sheets, debug readbacks, logs), spike
edit uncommitted in /tmp/wt-shadow-kernel. Open, not chased: red1's 07:21 still is left-right mirrored.
**§SUN_SHADOW_RESTORE_DEPTH — SPEC (red1 ruled FIX, 2026-09-24).** The pass reads the shadow map's
DEPTH: `tShadowMap = A.sun.shadow.map.depthTexture`, declared `sampler2DShadow` and sampled
`texture(tShadowMap, vec3(sc.xy, sc.z + bias))`. Reason: the app uses PCFShadowMap, and for that type
three sets `depthTexture.compareFunction` (three.module.min.js: `this.type===PCFShadowMap ?
compareFunction=...`), so a plain sampler2D read of it is undefined; a shadow sampler is how three's
own PCF shader reads it. The lit test is unchanged (1 = lit, 0 = shadowed; hardware 2x2 compare
filtering gives fractions at the boundary, which the edge detector already handles). No depthTexture
-> the pass stands down and logs `§SUN_SHADOW_RESTORE_SRC none` (never reads the colour attachment
again). Log once per still: `§SUN_SHADOW_RESTORE_SRC depthTexture compare=<fn>`.
**Test (proves the defect gone):** same Hospital pose, sun 10°/228°, 8192 map: the pass's own shadow
term must class a NON-ZERO number of shadowed and edge pixels (`§AB_KSCALE_READBACK`, was 0/0), and
the k4 vs k1 crops must differ. Then red1 judges the parapet edge on localhost.
**§TRI_BIG_ONLY — TRACED + SPEC (2026-09-24), a switch, NOT a change of the maps.** Source: bim-ootb
`viewer/streaming.js` `A._triResolve` — authored material NAME first (`TRIPLANAR_BY_NAME`, e.g.
'Metal Deck' 33,756, 'Silver' 4,263 — this is how IfcDoor gets metal), IFC CLASS second
(`TRIPLANAR_MAT`: concrete for wall/slab/column/footing/stair, plaster for covering, METAL for beam,
member, plate, railing and every MEP class). Size is never consulted. A per-element SIZE rule cannot
be applied cleanly: one material is shared per batch and built from the batch's FIRST element
(`_getMaterial(items[0]...)`). So the proposal is by CLASS. BIG = {IfcWall, IfcWallStandardCase,
IfcSlab, IfcColumn, IfcFooting, IfcStair, IfcStairFlight, IfcCovering, IfcRoof}: those keep the rough
maps. Every other class drops them during the still (flat colour, no grain). Measured sizes, Terminal,
median 2nd-largest bbox dim: Wall 3.50 m, Slab 1.92, Covering 2.45 vs Door 0.95, Beam 0.75,
Member 0.40, Plate 0.15, FlowTerminal 0.39.
**Switch:** `?tri=big` on the viewer URL, or `APP._triBigOnly = true` in the console; takes effect on the
next still frame (per-material `uTriActive`, re-asserted in onBeforeRender), no restream. Default OFF =
byte-identical look. `TRIPLANAR_MAT` / `TRIPLANAR_BY_NAME` untouched until red1 rules.
**Log:** `§TRI_BIG_ONLY_TALLY` per class, rows textured now vs rows textured under the switch (via the
app's own `_triResolve`, not re-derived).
**Test:** the tally prints, and with the switch on during Alt+S every non-BIG triplanar material
reads uTriActive=0 while BIG ones read 1 (`§TRI_BIG_ONLY_ACTIVE`). red1 judges the look.
**BUILT + WITNESSED (bim-ootb c1b2f08d, local; served on 8600):** `§TRI_BIG_ONLY_TALLY` Terminal
texturedNow=46,729 -> texturedUnderSwitch=1,305 (Slab 700/700, Wall 333/333, Column 158/158, Covering
82/82, StairFlight 32/32; Plate 33,324/0, Door 133/0, Beam 432/0, Member 442/0, Railing 34/0, all MEP 0).
`§TRI_BIG_ONLY_ACTIVE` during Alt+S: on {big 15 on, small 46 off}; off {big 15 on, small 46 on}.
Witness: viewer/tests/witness_tri_big_only.js.

**Other open, lower:** app-side run-to-run glow haze (not the bounce; control has it; parked by red1);
cause of the rare empty app render under the tap (guarded + logged `§GI_BAKE_TAP BLANK_GRAB`); Alt+S
status message appears late = the app's own synchronous still staging (measured 70 s headless HHS,
~5 s on red1's desktop), not the bounce; free look dials untried (drop the film's second AO layer;
bounce gain > 0.6); the film tap is still sandbox-only (gi_bake_tap2.js via cli_silent_bake --tap).

**Films delivered 2026-09-23/24** (~/films/, copies in ~/Downloads): HHS whole path 480p + 1080p
(`hhs_gi_full_1080p.mp4`), Hospital whole path 480p + 1080p (`hospital_gi_full_1080p.mp4`, 2h43m).
Check policy agreed with red1: no full-length control; 5 s control clip before a big bake + self-checks.

## §STILL_STATUS_FIRST (2026-09-24) — SPEC: Alt+S says so AT ONCE
**red1:** on Alt+S the status must appear immediately; today it shows only after the app's synchronous still
staging (~5 s on his desktop, 70 s headless HHS), so nothing tells him the press registered. **Source:**
scene.js:3228 (Alt+S) and panels.js:428 (button) call A.toggleStillRefine() -> startStillRefine() ->
_applyPhotoStaging() synchronously inside the key event; gi_still.js's toast is set in a setTimeout that
cannot paint until that returns. **Rule:** the two USER entry points call `A.toggleStillRefineUI()`: if a
still is on it toggles off as before; otherwise it shows the status toast (same element/style as
gi_still.js, `#gi-still-toast`), waits for one animation frame plus a macrotask (the frame is committed),
THEN calls startStillRefine(). Programmatic callers (bake, witnesses) keep the synchronous
toggleStillRefine/startStillRefine unchanged. A second press while pending is ignored. The toast hides when
the still is ready (busy clears) unless gi_still has taken it over. **Log:** `§STILL_STATUS painted t=`,
`frame t=`, `stagingStart t= gap=<ms since painted>`. **Test:** headless Alt+S keypress -> the three lines in
that order, gap < ~100 ms, and the still still completes (and the bounce still runs where supported).

## §PROBE_GRID_SURVEY (2026-09-24) — SURVEY ONLY, no code. Queued AFTER the wall-shadow fix and R10.
**Goal (red1):** replace the even ambient + hemi base (a flat fill that lights a deep corridor as brightly as a
window bay) with light that comes from real sources: sky and sun entering through the openings.
**1. What fits our r186 setup — from the shipped library files, not from memory:**
- **three's WebGL renderer ALREADY reads a probe grid natively.** three.module.min.js: a scene object with
  `isLightProbeGrid` is collected in the render list (`pushLightProbeGrid`), defines `USE_LIGHT_PROBES_GRID`, and the
  standard lighting chunk adds `getLightProbeGridIrradiance(worldPos, worldNormal)`: a trilinear lookup in a
  `sampler3D probesSH` atlas (9-term L2 spherical harmonics, RGB = 27 floats packed as 7 RGBA texels per probe, z padded),
  bounded by `probesMin/probesMax` at `probesResolution`, sampled half a cell along the normal (cheap leak damping).
  The renderer reads `.texture`, `.boundingBox`, `.resolution` from the object. **The grid CLASS is not in our lib
  files** (no LightProbeGrid constructor in three.core/module), so it is a three add-on to vendor, or a small object
  we write with those three fields. The baker (cube capture per probe -> SH projection) is ours to write; three ships
  `LightProbe` + `SphericalHarmonics3`, and the add-on `LightProbeGenerator.fromCubeRenderTarget` does the projection.
- **WebGPU (the Alt+S bounce renderer) has no grid support** (three.webgpu.min.js: only LightProbeNode). That does not
  matter: the bounce starts FROM the app's finished WebGL frame, so the grid's light is already in it.
- **Baked lightmaps:** needs a second UV set on every mesh; our geometry is instanced/batched from hashed blobs with no
  lightmap UVs, and one element instance per hash would need its own texels. Rejected for the whole-building case.
- **three-gpu-pathtracer, stills only:** not installed (not in node_modules); ground truth for one still, minutes per
  frame. Useful as the REFERENCE to judge the grid against, not as the runtime path.
- **DDGI-style (live-updating probes with visibility):** the right shape long-term (moving sun during a film), but a
  per-probe ray/depth pass per frame. Start with a static bake per sun state; the film's sun arc would need one bake
  per sampled sun position, or a sky-only grid plus the existing real-time sun.
**2. Placement from our rooms data, not a blind grid.** One grid object = one axis-aligned box at one spacing (what
the shader reads). Rooms data decide which probes are VALID and how they may see: `spatial_structure` (Terminal 59
rows, HHS 17, Hospital_silent 79; Hospital_extracted has none) and the app's room graph (navigate_find.js
`_roomGraphFor`, rooms + doors + exits). Use: (a) invalidate probes inside solids, or outside any room/envelope, and
fill them from their room's valid neighbours; this is the main leak cure, because a probe inside a wall sees black
or outdoors. (b) Weight openings: a probe sees the sky only through IfcWindow panes and open doors. (c) Per-room
brightness sanity: a probe must not be lit by a room it has no door or opening to.
**3. Hospital numbers.** ARITHMETIC now, to be MEASURED before any decision. Structural extent 116 x 134 x 47 m.
Probes/atlas (7 RGBA texels each): 4 m spacing 11,832 probes, 0.7 MB half-float; 2 m 93,264, 5.2 MB; 1 m 746,112,
41.8 MB. Bake = 6 renders per probe (cube) of the whole building: 11,832 x 6 = 71k renders at 4 m. The wall time,
the file size after compression, the runtime cost (one extra 3D-texture lookup x 7 per pixel), and the phone impact
(sampler3D + half-float support; fallback = today's ambient) must each be MEASURED on Hospital, headless and on red1's
desktop, before it ships. Distribution: a per-building file on OCI next to the DB (the DB rule), not git.
**4. Dependencies:** R10 glass panes FIRST: today's black opaque windows would block the sky, and the grid would bake
dark rooms. The wall-shadow fix FIRST, so walls receive the sun that the grid's bounce is built on. The §SURFACE_RULES
roughness also matters (a smooth floor reflects the grid's light differently from a rough one).
**5. Scope:** ONE grid per building feeds browsing, Alt+S and Alt+C films the same way (all are the WebGL frame).
Behind a switch (default off until red1 judges). Keep a base floor of about 25% of today's ambient + hemi, so deep
rooms with no probe light never go black. Film sun arc: sky-only grid + real-time sun first; per-sun-position bakes
only if red1 asks.
**FIRST STEP when reached (watcher, accepted 2026-09-24):** ONE measured 4 m sky-only bake on Hospital (bake time,
compressed size, fps on desktop, a phone estimate) BEFORE any wiring.

## §SURFACE_RULES (2026-09-24) — SPEC, sent to the watcher BEFORE any code. Supersedes §TRI_BIG_ONLY.
**red1:** surfaces are too rough and materials hard to tell apart. "keep the metal deck rough; ... it is floor
slabs and small beams that are given rough surfaces; not to do so, as that is not realistic in real life."
"if floor slabs are marble like done is OK, just not rough." Rules must be general (no one-off names),
balanced, and tied to how the real surface is finished.
**Why it looks rough today (source, bim-ootb viewer/streaming.js):** only three textures exist (concrete,
plaster, metal). Each is pushed hard: contrastBoost 1.6 / 1.5 / 1.9 plus a normal map. They are handed out
by authored name, then class, and METAL covers beams, members, plates, railings and all MEP, so most of the
model wears the same coarse metal grain. Materials that differ in life (painted steel, galvanised pipe, timber
door) then read alike, because the texture swamps their base colours.
**Signals the rules may use (all present in the data, no names):** (1) IFC class; (2) the SUBSTANCE of the
authored material via a small lexicon (metal / concrete / plaster-gypsum / timber / glass / stone-tile),
absent -> class default; (3) ROLE from geometry: FLAT = thinnest bbox axis vertical; ROOF LAYER = a flat
element with no other flat element above it over its footprint (1 m grid of the building's own elements);
UPRIGHT = thinnest axis horizontal. Not usable: exterior vs interior (no reliable field in any of the 3
DBs) — stated, not guessed. One material is shared per batch, so a batch takes its members' MAJORITY
outcome, not its first element's.
**Measured, so the roof rule is geometric, not by height:** Terminal's 'Metal Deck' plates (33,324, all flat,
0.11x0.15x0.5 m) sit 33-42 m, mostly NOT within 6 m of the top (2,522 are); HHS's 629 plates are UPRIGHT
(facade panels); Hospital's 2,211 plates are mostly upright (127 flat).

| # | Surface (role + substance) | Real-life finish (reason) | Texture | Look: base colour · roughness · texture scale/strength |
|---|---|---|---|---|
| R1 | ROOF LAYER, metal (deck, sheeting) | exposed, weathered profiled sheet | metal ON | IFC/class grey · 0.55 · tile 0.6 m, contrast 1.9 -> 1.2 |
| R2 | ROOF LAYER, other (membrane, tile, concrete) | exposed to weather | its substance's map ON | class colour · 0.8 · contrast x0.7 |
| R3 | Exposed structural concrete: IfcWall, IfcColumn, IfcFooting, IfcPile (substance concrete/absent) | board-marked / cast finish | concrete ON | warm grey · 0.85 · tile 2.5 m, contrast 1.6 -> 1.1 |
| R4 | FLAT floor slab (IfcSlab not roof layer), stairs, ramps | finished floor: screed, tile, stone | OFF | class grey, slightly lighter · 0.35 (polished; marble-like sheen OK) · envInt 0.3 |
| R5 | Finished walls/ceilings: IfcWallStandardCase, IfcCovering, substance plaster/gypsum | painted plaster / board | OFF | light warm white · 0.75 · none (reads as paint by colour) |
| R6 | Steel sections: IfcBeam, IfcMember, IfcPlate NOT roof layer | painted / galvanised steel, fabricated | OFF | cool mid grey · 0.45 · none; metal kept |
| R7 | Fabricated small parts: IfcDoor, IfcRailing, IfcWindow frame, IfcFurniture | factory finish | OFF | colour carries identity: door timber brown, railing dark steel, furniture wood · 0.5-0.65 |
| R8 | MEP: pipes, ducts, fittings, terminals, valves | galvanised / painted, colour-coded | OFF | keep MEP hue coding · 0.4 · none |
| R9 | Glass (alpha < 1) | glazing | OFF (unchanged) | unchanged |

Distinctness comes from base colour + roughness first; texture is kept only where the real surface is
visibly coarse at building scale (R1-R3). No row keys on one material string; 'Metal Deck' stays rough
because it is a metal ROOF LAYER (R1), the same row that would catch any building's roof sheeting.
**Delivery:** behind a localhost switch (`?surf=rules` / `APP._surfRules = true`), default = today's look, until
red1 rules. **Log:** `§SURFACE_RULES_TALLY bld=... rowCounts R1..R9 (rows now textured -> textured under rules)`
per building (Terminal, HHS, Hospital), plus `§SURFACE_ROOF_LAYER flat=.. roofLayer=..` so the geometry test
is visible. **Test:** tallies print on all three; during Alt+S with the switch on, textured materials are
exactly R1-R3 (`§SURFACE_RULES_ACTIVE`); red1 judges the look on localhost.

**§SURFACE_RULES — REVISION 1 (watcher review, 2026-09-24).**
**(1) R1 measured BEFORE code** (read-only probe scratchpad roof_layer.py, extracted DBs, FLAT = thinnest bbox
axis vertical, 1 m grid, a flat element is a ROOF LAYER when < 50% of its cells have another flat element whose
bottom is at/above its top). First pass: only 16,297 / 33,324 Terminal deck pieces passed, because the sloped
deck's OWN strips overlap inside a 1 m cell (171,813 cover hits were Metal Deck over Metal Deck). Rule
refined, general: **pieces of the same surface (same class + material) above do not count as cover** (a sloped
roof made of strips). Result: Terminal Metal Deck **33,225 / 33,324 (99.7%) roof layer**; the 99 others sit
under a ceiling board, a floor slab or ducts. Roof-layer slabs: Terminal 5/469 flat, HHS 17/83, Hospital 8/35.
Coverings: 0 (Terminal), 2 (HHS), 0 (Hospital). The deck stays rough through R1, with no name involved.
**(2) Precedence, first match wins:** R9 glass (alpha < 1) > R10 single-style opening > R8 MEP (by class:
colour-coded services are never retextured) > R1/R2 ROOF LAYER (any envelope class: slab, plate, roof,
covering) > FLOOR (a flat non-roof IfcSlab / stair / ramp -> R4, whatever it is cast from; accepted 2026-09-24) > SUBSTANCE (concrete -> R3, plaster/gypsum -> R5, metal -> R6, timber/stone-tile -> smooth, their
class colour) > CLASS default (R3 walls/columns/footings, R4 flat slabs/stairs, R6 steel, R7 fabricated
parts). Substance beats class, so the IfcWall vs IfcWallStandardCase split (an authoring artefact) no longer
decides rough vs smooth: a plaster IfcWall is R5 and a concrete IfcWallStandardCase is R3. A roof-layer
IfcSlab is R2 (its substance's map, strength x0.7); a non-metal roof-layer plate is R2 too.
**(3) No invented colours.** Rows change ROUGHNESS, TEXTURE on/off/strength and envInt only. Base colour
stays what it is today: the authored IFC / surface_styles colour where one exists; STD_MAT's class default
only where rgba is NULL (existing rule §S265c, unchanged). The table's colour words describe today's
defaults, not new values. Log: `§SURFACE_RULES_COLOUR authored=n classDefault=n` per building.
**(4) Majority flips:** a batch takes its members' majority row; `§SURFACE_RULES_TALLY` also prints
`againstOwnRow=n` (elements whose own row differs from their batch's) per row.
**R10 (from the watcher's trace): single-style opening.** IfcWindow / IfcDoor whose whole mesh carries ONE style
(Terminal windows 228/236 black opaque, doors 110/135 one near-white handle style; Hospital 118/131, JKR 83/83,
LTU 976/976 windows opaque). A data gap, never silent: `§SURFACE_OPENING_SINGLE_STYLE bld= class= n=`. Window:
pane split from frame by geometry, pane -> class-default glazing, frame keeps the authored colour; if the split
is not clean, the whole element gets class-default glazing, and the path taken is logged. Door: leaf -> smooth
R7 finish. Multi-style / glass-styled openings untouched. **Split feasibility is being measured (geometry,
read-only) before any R10 code.**

**§SURFACE_RULES — BUILT (bim-ootb 4c8c8d4f, local, served on 8600; default OFF, `?surf=rules` at load).**
One deviation from rev 1, recorded: a FLAT non-roof slab/stair is R4 BEFORE substance. Otherwise Terminal's 322
'Concrete - Cast-in-Place' slabs would be R3 rough, against red1's "floor slabs smooth" (a floor is a finished
surface whatever it is cast from). Substance still beats class for walls. Witness viewer/tests/witness_surface_rules.js:
Terminal roofLayer 33,217, R1 32,826 (deck rough, 165 against own row), R4 733, textured 46,729 -> 32,921;
HHS roofLayer 118, textured 5,600 -> 278; Hospital roofLayer 488, textured 51,516 -> 1,320; colours all
authored or class default, unchanged. Only R1/R2/R3 materials carry a texture; switch off = today's 61
textured materials on Terminal. Terminal note: walls/columns/railings resolve R5 (plaster) through the leaked
'…BrickPlaster' type name (smooth, as a plastered brick wall reads). Doors/windows resolve R6 (metal names);
R10 will own them. **Look: red1 on localhost.**
**§SUN_SHADOW_RESTORE — PARKED (watcher ruling for red1, 2026-09-24).** Stays OFF by default (32fa52e8,
`§SUN_SHADOW_RESTORE OFF (default)` witnessed on 8600). The depth-texture fix (62ef1985) stays behind
`APP._sunShadowRestoreEnabled = true`. Evidence: with the fix it fires (low-sun Hospital crop shadowedPx 25,012,
edgeBandPx 18,395 at k4 / 9,753 at k1, was 0/0), but it paints blocky halos: the edge band is 36% of the frame at k4,
and the stair-step reads MORE clearly (sheet ~/Downloads/hospital_shadow_edge_before_after_fix.png; stills and
readbacks in the photoreal scratchpad shadow_ab/). The parapet saw-tooth is the native PCF edge, present with or
without the pass. Nobody missed it (inert since 08-14). A later session may tune it; no tuning this session.

**§SURFACE_R10 — SPEC (openings with a single style), from the read-only geometry measurement (2026-09-24,
scratchpad r10/: spec.md, measure_windows.py, windows_all.log, doors_all.log).** Data = what the viewer renders
(<B>_meta.db + <B>_geo.db when split, else _extracted.db; blobs decoded as scene.js blobToGeometry).
Single-style window = IfcWindow with material alpha >= 1 (reproduces the IFC counts: Terminal 228, Hospital 118,
JKR 83, LTU 976).
**Window split rule (per MESH, counted per element; windows share meshes, e.g. Terminal 228 -> 31):**
oriented frame from the mesh's own face normals (n = largest area-weighted normal cluster, >= 40% of area; u = the
largest in-plane cluster; v = n x u). NOT the bbox thin axis: 40 of 118 Hospital windows are rotated ~10° in their
local frame, and the bbox rule fails all of them. PANE triangle: |normal·n| >= 0.95, no vertex within 1 mm of the
oriented box's in-plane edges; patches grouped by depth (0.5 mm) + shared position; a patch is PANE when area >= 2%
of the elevation, min side >= 120 mm, solidity >= 0.85 (rejects hollow sash rings). CLEAN = best pane depth level
covers >= 50% of the elevation, inset >= 10 mm on all four sides, and the frame remainder is a ring. Split per
TRIANGLE, not per connected component: JKR and LTU weld the glass to the frame (a component split fails 54 + 466).
**Measured:** Terminal 223/228 clean (97.8%; the 5 are DG glazed screens whose main sheet is flush to the edge);
Hospital 118/118 (100%); JKR 54/83 at a 50% normal floor, 67/83 at 40%; the other 16 are LOUVRES, with no pane in life
either; LTU 951/976 (97.4%; 25 divided-light windows whose muntins are welded coplanar). Fleet 1,346 / 1,405 (95.8%).
**Look:** pane triangles -> the class-default glazing (IfcWindow STD_MAT, alpha + reflection); frame keeps the
authored colour. Not clean -> the whole element stays as authored (NOT whole-element glass: a louvre or a muntin
grid is not a pane), logged. Louvres stay slats.
**Doors:** Terminal 130/134 single-style doors have separable hardware (4-6 small components, 0.5-1.3% of area): the
handle keeps the authored (handle) colour, and the rest gets the class-default door finish, smooth (R7). Hospital doors are
already brown with no handle geometry: untouched. LTU: hardware found on 578/606.
**Implementation shape:** geometry groups on the shared mesh (one group per material: pane / frame, or hardware /
leaf), a material array per mesh; decided once per mesh hash at stream time, so instances cost nothing extra.
**Logs:** `§SURFACE_OPENING_SINGLE_STYLE bld= class= n=`, `§SURFACE_R10_SPLIT bld= windows clean=/fallback=
(reasons) doors hardware=/leafOnly=`. **Test:** the counts above reproduce in the app's own log per building;
default on with the surface rules; red1 judges the look.
**R10 additions (watcher review):**
(1) SHADOWS THROUGH GLASS. three.js casts shadows per MESH, not per group, so a split pane still blocks the sun
unless handled. Rule: the pane group's material gets `alphaTest`-free transparency AND the mesh's shadow pass
uses a customDepthMaterial that discards pane triangles (a per-vertex/per-group attribute `aPane`), so frames
still cast and panes do not. Witness as a SEPARATE arm from the mid-wing question: sun on an interior floor
behind a Hospital window, lit-pixel count on that floor patch from the pass's own shadow term (or the
readback tool), before vs after; `§SURFACE_R10_SHADOW paneCasters=0 frameCasters=n`.
(2) BATCHING. Per path, witness that the groups + material array survive: instanced (shared mesh hash), merged
(bucket merge bakes per-element index ranges; the split must be applied before the merge or the merged buffer
must carry the group), batched (BatchedMesh takes ONE material; a split element leaves the batch and goes
instanced/single), DLOD (zero-scale per instance, unaffected). Also that the Alt+S bounce geometry pass (one
override material ignores groups; fine, it only needs depth/normals) and the shadow depth pass (customDepthMaterial
above) still draw split meshes. Log `§SURFACE_R10_PATHS instanced=n merged=n batchedMoved=n single=n` per building.
(3) COST. Log draw calls (renderer.info.render.calls) and transparent-object count before/after on LTU (976
windows) and Terminal, same pose: `§SURFACE_R10_COST drawCalls a->b transparent a->b`.

## §DLOD_STILL_OWNERSHIP (2026-09-24) — SPEC: Alt+S must not let DLOD hide roof casters
**Defect (red1, ~/Downloads/bounce_still_1790210272668.png, Terminal hall 08:37):** sky and sun shafts
come through the roof. red1: "DLOD is removing the off frame roof where the Sun shines thru."
**Source:** dlod.js zero-scales InstancedMesh slots outside the camera frustum (`§DLOD_ENABLE
mode=per_slot_frustum`). A zero-scaled roof slot casts no shadow, so the sun reaches inside. Only the
Time Machine pauses DLOD (time_machine.js §DLOD_TM_OWNERSHIP, `_dlodPausedByTm`); nothing on the
Alt+S path does, so the still inherits the nav-mode culling.
**Rule:** `_applyPhotoStaging` (shared by Alt+S and the cinema/bake path) pauses DLOD if it is on,
and `_teardownPhotoStaging` re-enables it ONLY if staging paused it (a user's own DLOD-off is not
ours to flip; a bake where TM already paused it is a no-op). While staging holds, `dlodEnable`
(e.g. streaming.js after a stream completes) must not switch it back on; it records the request and
teardown honours it. Logs: `§DLOD_STILL_OWNERSHIP paused=1|0 ...` at staging, `restored=1|0` at teardown.
**Tests (prove the defect gone):** headless, Terminal, same hall pose, before/after the change:
DLOD state + zero-scaled instance count during the still (expect 0 after), and the gi_still.js
geometry pass sees the same unculled roof. Bake: an existing log must show DLOD already off for
every frame (TM owns it); say whether `§DLOD_BAKE_PROXY` hides roof casters too.

## ▶ §GI_BUILT (2026-09-23) — THE BOUNCE IS RUNNING, ON Alt+S LIVE AND IN THE BAKE. READ THIS FIRST;
## §WEBGPU_SSGI_SPIKE below is the investigation that preceded it and is now history, not the state.

**Nothing is shipped. Nothing under `viewer/` is committed.** Everything below lives in the bim-ootb
worktree `/tmp/wt-ssgi-webgpu-spike` and in `/tmp` roots that a reboot destroys — see WHERE THINGS
LIVE. Merged to main is only the sandbox source itself (PR bim-ootb#1755, squash `4818b3f0`:
28 files, all under `sandbox/spike_ssgi_webgpu/`, plus one `.gitignore` line; no shipped file).

### What works today, measured, not claimed
| | before | after |
|---|---|---|
| Alt+S first press (HHS, 664 objects) | **127 065 ms** one synchronous block | **3 003 ms** |
| Alt+S whole shot | 128.2 s | **5.7-7.0 s**, 2.8-3.6 s on later presses |
| Film, per frame, all 12 features, 1080p | 0.78 s (no bounce) | **0.95 s** (+22%) |

- **Alt+S** — press it as always. The app's own still runs untouched to completion, THEN the bounce
  is composited over the finished picture; a Save PNG / Esc bar appears. `Alt+Shift+S` releases the
  renderer. red1's verdict on the stills: "these are the ones to publish".
- **The film** — `gi_bake_tap2.js` through `cli_silent_bake.js --tap`, 614 frames at 24 fps.

### The architecture, and why it is this and not the obvious one
The obvious version (v1) re-rendered the whole scene with a second renderer and pasted the result in.
It silently dropped everything the app draws that the second renderer does not — red1 found four in
one viewing: the window lights (they are bloom, a post pass), the stack-freeze blackout, the
discipline reveal, and the sun shadows. Marker counts proved the app's own logic ran correctly in
every case (`§GLOW_LENS_QUAD` 68/68, `§PHOTO_GLOW_SPRITE_GATE` 615/615,
`§CPE_REVEAL_LENS_QUAD_OFF` 42/42, `§LOADPATH_HOLD` 3/3 against the r185 baseline) — the pixels just
never reached the frame.

**v2 starts FROM the app's finished frame.** That frame is the colour input; the second renderer
computes only depth and surface normals with ONE shared override material; the output is
`colour x AO + colour x GI`, re-encoded with `sRGBTransferOETF`, and composited back where the
geometry pass drew. Everything the app draws survives by construction. Consequences worth keeping:
1. **One shared material is what killed the 127 s stall.** WebGPU builds one render pipeline per
   render object, synchronously, on the main thread — `three.webgpu.js:85689-85720` only takes the
   async branch when `compileAsync` passes it a promise array. 292 of them back-to-back was the hang.
2. **No tone mapping and no exposure in this renderer.** The colour is already tone-mapped at the
   app's exposure; sampling decodes sRGB and the output re-encodes it, so an untouched pixel comes
   back unchanged (`mode 'coloronly'` measures compositeMean == appMean, meanAbsDiff 0).
3. **Coverage comes from DEPTH, never from alpha or brightness.** Four attempts failed on this.
   `SSGINode.updateBefore` wraps its quad render in `renderer.setClearColor(0xffffff, 1)`
   (`vendor/SSGINode.js:391`) and `PassNode.updateBefore` never sets a clear colour of its own
   (`three.webgpu.js:42967-43043`), so the frame comes back cleared WHITE at alpha 1 — there was
   never an empty signal to read. `depth.r.lessThan(0.999999)` is the honest test.
4. **The app's own frame must be drawn first.** The bake hook REPLACES cinema_maxq's
   `ctx.drawImage(A.renderer.domElement)`, so a correct mask over nothing is still black. Draw the
   app frame, then the bounce layer over it. Sky measured back at 173.0 against the app's own 170.5.
5. **Orientation is decided by MATCHING, never assumed.** Score the bounce layer against the app's
   frame both ways round (and, in the still, over all four combinations of texture-v and readback
   row order), keep the better, log the margin. A brightness-based test was tried and flipped the
   wrong way the moment red1 turned sky and ground on — it measured exactly what those settings change.
6. **Transparent meshes are left OUT of the geometry pass** (§GI_GLASS_SKIP). One opaque material
   records glass as a solid wall, and the hall fills with milky sheets; excluded, glass keeps the
   app's own pixels. Terminal has 26 such meshes at opacity 0.25.

### Dials (console; take effect only when the bounce renderer is BUILT — first Alt+S, or after Alt+Shift+S)
- **§GI_DIALS_FIRST_BUILD (2026-09-24, measured):** the dials below are baked into the output shader when the bounce renderer is FIRST built, and it is reused, so they apply to the first Alt+S of a session only, or after Alt+Shift+S releases the renderer. (Four HHS shots with different dials came out identical, compositeMean 106.76, until __giStillRelease() ran between them.)
- `window.__GI_STILL_AO` — occlusion blend, default **0.55**. 1.0 was red1's "eerie bouncing" on an
  aerial: at distance nearly every probe reads occluded and the whole building dims.
- `window.__GI_STILL_GAIN` — bounce strength, default **0.6**. At 1.0 a white hall measured
  compositeMean 163.68 against appMean 159.81 — it was adding light, not shaping it.
- `window.__GI_SLICES` / `window.__GI_STEPS` — sample counts, default 3/16 (the node's "high").
- `window.__GI_GLASS_OPACITY` — what counts as glass, default 0.9.

### WHERE THINGS LIVE — all of it is in /tmp and dies on reboot
- Worktree `/tmp/wt-ssgi-webgpu-spike` (branch `spike/ssgi-webgpu`), sandbox dir
  `sandbox/spike_ssgi_webgpu/`: `gi_still.js` (live Alt+S), `serve_gi_live.js` (dev server, port
  8600), `gi_bake_tap2.js` (film), `gi_bake_tap.js` (v1, superseded), `run_gi_still_headless.js`
  (puppeteer verifier — USE IT, do not ask red1 to test), `vendor/*.appbound.js`.
- **One uncommitted edit to a shipped file**: `viewer/cinema_maxq.js` §GI_CAPTURE_HOOK, 20 lines —
  `if (typeof window.__giCaptureFrame === 'function') await it; else` the original drawImage line.
  Inert without the hook.
- `/tmp/bake-r186-root` — a symlink farm of the worktree with only `viewer/lib/three.webgpu.min.js`
  and `three.core.min.js` replaced by r186. Rebuild it if it is gone; nothing tracked was touched.
- **ONE three.js instance, always.** A private copy makes `light instanceof THREE.Light` false, the
  renderer ignores the app's lights and every frame is black (measured: own lights 479 280 lit
  pixels, app's lights 0). That is what `vendor/*.appbound.js` exists for.

### §GI_STILL_ORIENT_GEOM (2026-09-23) — SPEC: orientation by surface direction, not by colour
**Defect, measured** (witness `witness_gi_orient_indoor.js`, HHS 1280x720, no edits): the colour
`composite` score picks between the two colour-upright candidates by margins of 0.08-0.33 (red1's
Terminal indoor press: 0.05), and picked the upside-down one at 3 of 4 poses (aerial, cinema
frames 240, 300). Upside-down AO/GI/mask over upright colour = red1's "smearing".
**Rule:** a front-facing surface's view normal n and the camera ray r through its pixel satisfy
n·r <= 0. Render the packed view normal RAW (no OETF, no colour transform) once; count covered
pixels with n·r > 0.05|r| with readback rows as-is and reversed. Fewer = flipOut. Measured
separation 0.06-1.8% against 21-32%, all 4 poses. flipTex is then the one of the two whose colour
`composite` score is lower at that flipOut. If both counts are within 2x of each other, log
UNDECIDED and keep the colour decision.
**Test (proves the defect gone):** the same witness at the same 4 poses must print RIGHT at all 4,
and at a Terminal indoor pose; `run_gi_still_headless.js` must still pass (incl. injected flip).

### §GI_SHARED_ATTR_WIDEN (2026-09-23) — SPEC: the second renderer must not rewrite the app's geometry
**Defect, measured.** Film v2 vs a same-frame no-tap control: 355/614 frames lose slabs, walls,
stairs (all BatchedMesh). Reproduced outside the bake (`witness_tap_before_after.js`, pose 460): one
tap capture, then the app's OWN frame differs by 67.7 levels, 48% of pixels. State diff across one
capture (`witness_batched_state.js`): 60/128 BatchedMesh index arrays Uint16Array -> Uint32Array,
and the app's next multiDrawStarts double (216 -> 432). Cause, in source:
`three.webgpu.min.js:84196-84214` (WebGPUAttributeUtils.createAttribute) widens non-normalized
8/16-bit arrays and writes `bufferAttribute.array = array` onto the SHARED attribute; the app's
WebGL buffer stays 16-bit (version unchanged, no re-upload) while BatchedMesh.onBeforeRender
(`three.core.min.js:27803+`) now computes byte offsets at 4 bytes/index -> draws read garbage.
Camera coordinateSystem was measured and RULED OUT (<=0.07 levels).
WebGPU reads the index format from `index.array`'s type at draw time (`three.webgpu.min.js:89025`),
so the fix is a swap, not a restore: before each second-renderer render, every 8/16-bit
non-normalized attribute (index included) of the scene gets a 32-bit copy we own (0xffff -> 0xffffffff
on a Uint16 index, as upstream does), rebuilt whenever the attribute's version moves; after the
render the app's own array is put back and every BatchedMesh gets `_visibilityChanged = true` so its
draw list is rebuilt at 2 bytes/index. Applies to `gi_bake_tap2.js` AND `gi_still.js`.
**Tests (prove the defect gone):** `witness_batched_state.js` -> no idxType change, no mdStart
change after tap+app; `witness_tap_before_after.js` -> tapVsBase ~0 at 460/150/60; film re-bake
vs the control -> the >5%-pixels-off-by-60 count drops from 355/614 to ~0 (only bounce shading left).

### §GI_TAP_SYNC_GRAB + §GI_TAP_GLASS_SKIP (2026-09-23) — SPEC: the two faults left after §GI_SHARED_ATTR_WIDEN
After the widen fix the film still differed from the control on 129/614 frames, in two groups.
1. **Frames 469-591, the load-path freeze, show the whole building instead of the blackout.**
   Debug bake (dumps at hold frames): the app canvas copied at the hook's FIRST line is correct
   (black + stack); the same canvas copied after `await ready` shows an older picture with the whole
   building, with `renderer.info.render.frame` unchanged (0 WebGL renders in between). A WebGL
   canvas does not keep its pixels past the task that drew them (the rule gi_still.js's
   grabAppFrame already states). **Rule:** copy the app frame synchronously at hook entry, before
   any await; that one copy is both the colour input and the underlay. Never read
   `A.renderer.domElement` after an await.
2. **Six single frames (350-413) go near-black.** Under scene.overrideMaterial the WebGPU renderer
   copies `transparent` but not opacity from the source (`three.webgpu.min.js:65410-65414`), so a
   fading/glass mesh is a solid occluder in the geometry pass. **Rule:** same as §GI_GLASS_SKIP on
   Alt+S — hide transparent meshes below opacity 0.9, A._sky and raw-GLSL ShaderMaterials for the
   geometry pass only, restore in `finally`.
**Test:** re-bake with the verbatim command vs the no-tap control; frames with >5% of pixels off by
>60 must fall from 129 to ~0, the blackout's dark share must match the control (~54%) at 480/520/600.
**Result of that re-bake:** 129 -> 10. Blackout matches (52.3/54.3/50.6 vs 52.4/54.3/50.5). But 4 NEW
single-frame dropouts (12, 49, 122, 604 — the app's own picture near-empty) appeared with the
`.visible` flip, the only change that writes app state; app code runs during the awaited WebGPU work.
**Amendment — skip by LAYER, never by `.visible`:** the geometry pass renders through its OWN camera
(copied from A.camera every frame) that sees only layer 31; every object except glass/sky/raw-GLSL
gets bit 31 each frame. The app never uses layers (grep: 0 calls) and its camera lacks bit 31, so
nothing the app reads changes. Also stops WebGPU rewriting A.camera.coordinateSystem.
The remaining 6 (350-413) are camera cuts where the tap film's 3D lags the HUD by one frame —
identical in both tap runs, absent in the control; separate open item.

### Open
- **DONE 2026-09-23: v2 film re-baked and checked frame-by-frame against a same-frame no-tap control**
  (`~/films/hhs_ssgi_2026-09-22/hhs_gi_v2_24fps.mp4`, `_small.mp4` 6.3 MB sent to red1; control
  `hhs_control_notap_24fps.mp4`). Frames off by >60 on >5% of pixels: 355 -> 129 -> 10 -> **3**.
  Blackout dark share 53.3/55.2/51.5% vs control 52.4/54.3/50.5%. PASS/FAIL tally identical (35/7).
  Superseded films kept with suffixes _BROKEN_batched / _widenonly / _visibleskip.
  **Still open:** frames 491, 592, 593 — at the freeze's layer-placed steps the new stack clone reaches
  the tap picture one frame late (app logged §LOADPATH_STACK on the same frames in both runs, so it is
  render-side). Tap film is darker overall (luma 90.9 vs 99.2): tap2 applies AO and bounce at FULL
  strength, not Alt+S's __GI_STILL_AO 0.55 / __GI_STILL_GAIN 0.6 — red1's look call.
- **§GI_TAP_DIALS (2026-09-23, red1: "proceed in tuning")** — SPEC: the film uses the SAME output
  formula and dials as Alt+S (`ao = 1 - K + K*AO`, `rgb = C*ao + C*GI*gain`, K=__GI_STILL_AO default
  0.55, gain=__GI_STILL_GAIN default 0.6) — the stills red1 approved for publishing. Test: film mean
  luma moves toward the control (was 90.9 vs 99.2) while the per-frame compare stays at <=3 frames off.
  Then the whole saved path (no --clip) at 854x480/24fps.
- **§GI_READBACK_ROWPAD (2026-09-23, red1: "smearing across")** — DEFECT, measured: the whole-path
  480p film (854 wide) came back with every row sheared sideways. `readRenderTargetPixelsAsync` at
  854x480 returned 1,658,840 floats vs 1,639,680 expected = rows padded to 864 px (256-byte WebGPU
  row alignment; RGBA float = 16 B/px, so any width not a multiple of 16), last row unpadded. 1920
  and 1280 are multiples of 16 — every earlier test was blind to it. red1's Alt+S window (1666x864)
  is NOT, so the live still was sheared too. **Rule:** after every readback, if length != w*h*4,
  stride = (len/4 - w)/(h-1) px (must be an integer >= w), copy each row's first w px. Both
  gi_bake_tap2.js and gi_still.js readRT. **Test:** tap at 854x480 and gi_still at 1666x864 headless
  -> composite vs app frame meanAbs back to the ~7-10 level of aligned sizes, no streaks.
- **§GI_TAP_EMPTY_GRAB (2026-09-23)** — whole-path 480p after the rowpad fix: 45/3275 frames off,
  of which 13 are single-frame blanks in the tap film only (app picture empty, HUD drawn) at RANDOM
  frames (161,166,239,1083… vs 153,160,1176… the run before) — ~0.4%. CORRECTION: the 4 blanks on the
  1080p clip were NOT caused by the `.visible` flip; the layer switch coincided, it did not fix them.
  SPEC: at hook entry, sample the synchronous grab; if it is empty (no alpha), log §GI_TAP_EMPTY_GRAB
  with `renderer.info.render.frame` delta since the previous capture, re-render the app
  synchronously (A._composer.render()) and grab again, log whether the second grab has pixels.
  TEST: a ~300-frame 480p clip (random 0.4% → expect ~1-3 events): every event logged, 0 blank
  frames in the output (self-referenced flash test, no control needed).
  **RESULT — the grab is NOT empty, the app rendered an empty scene.** 301-frame clip, flash at film
  frame 94 = capture 95: `GRAB_DROP lum=13.3 prevLum=91.2 rgb=8,8,24 alpha=255 clear=#080818
  appRendersSinceLastCapture=185` — opaque clear colour only, and the app renders on its own between
  captures (rAF/refine), i.e. also DURING the tap's awaited WebGPU render, while the shared scene
  still carries `overrideMaterial = GI_BAKE_GEOM` (a NodeMaterial the WebGL renderer cannot draw) and
  the widened index arrays. **Rule (§GI_TAP_NO_SHARED_ACROSS_AWAIT):** nothing shared stays mutated
  across an await. The geometry pass renders SYNCHRONOUSLY (`pipeline.render()`), override + widen set
  and restored around that one call; only the readback (touches nothing shared) is awaited.
  TEST: same clip length, 0 flash frames, 0 GRAB_DROP at the flash signature.
  **RESULT: the sync render did NOT remove it** (2 flashes, same signature) — kept anyway, it is the
  right rule. Root cause still UNKNOWN: on random captures one app composer render comes back as the
  flat clear colour (#080818); the per-frame count of 185 renders is normal (8 refine + 12 AO passes).
  **Guard (§GI_TAP_BLANK_GRAB):** a flat clear-colour grab right after a normal frame -> re-render
  synchronously, grab again, log `BLANK_GRAB ... lum now=`. 301-frame clip: 3 blanks, all 3 recovered
  (114.9/129.8/121.8 vs the frames before), 0 flash frames in the output. Open: why that one render is
  empty, and why never in a no-tap run (0 in 3275 control frames).
  Amended: the brightness condition (prevLum > 20) is dropped — blanks inside the dark load-path
  freeze (whole-path 935, 941) slipped past it; a genuinely empty frame re-renders to itself.
- **DELIVERED 2026-09-23: whole saved path, 480p/24, 3275 frames** (`hhs_gi_fullpath_480p.mp4`,
  `_small.mp4` 9.9 MB sent to red1). Vs `hhs_control_fullpath_480p.mp4`: meanAbs 5.2, luma 74.2 vs
  77.4, PASS/PARTIAL/FAIL 46/8/4 in both, 16 blanks caught+recovered, freeze dark share within 3 pts,
  escape route 156.21 m fully drawn. Only difference: a sun/lamp glow haze the APP draws on in one run
  and off in the other over ~60 frames, at a different place each run (1990-2050, then 2495-2556),
  plus 708-711 — app-side glow timing, not the bounce. Superseded films kept with suffixes
  _SMEARED_rowpad / _BLANKS / _darkblank.
- **OPEN (pre-existing, NOT the bounce) — jagged sun-shadow edges on long roof edges (red1, 2026-09-24).**
  Same sawtooth in the no-bounce control (hr_clip_ctl vs hr_clip_tap, frame 200). Cause in the log:
  `§PHOTO_SHADOW texelPerM=5.7` / `texel=0.177m` on Hospital (env=362) vs 11.4 on HHS (env=180) — one
  map stretched over twice the width; low sun (10 deg) stretches each step. Options by cost: 8192 map
  (4x memory ~512 MB), camera-following or cascaded shadow maps (the proper fix, real work), softer
  filtering (hides steps, blurs edges). red1: weigh benefit vs cost once the code settles.
- **§SHADOW_SIZE_BY_ENVELOPE (2026-09-24, red1: "Agree on the shadow 5 lines work") — SPEC.** The photo
  sun-shadow map is a fixed 4096 (bim-ootb viewer/effects.js ~3268) spread over +-env; Hospital's env
  (362) is twice HHS's (180), so its texels are twice as coarse (0.177 m vs 0.088 m, texelPerM 5.7 vs
  11.4). Make the size follow env: size = 4096 * 2^ceil(log2(env/180)), clamped to [4096, 8192] and to
  renderer.capabilities.maxTextureSize. HHS unchanged (4096); Hospital 8192. Bias already derives from
  the texel (texelWorld = 2*env/mapSize), release on still-exit already frees whatever size was raised.
  Cost: 8192 = 4x memory (~512 MB, stills/bakes only) + 4x shadow-pass pixels (bake time: measure).
  TEST: Alt+S headless on the new tree — Hospital logs texelPerM ~11.3 and the still completes;
  HHS still logs 11.4 at 4096 (no change); §SHADOWMAP_RELEASE frees the raised size on exit.
- **§GI_ROW_PROBE + §SHADOW_SIZE threshold (2026-09-24, from red1's own desktop log, Clinic, v1235).**
  (a) red1's desktop Chrome read `asRead=20.93% reversed=0.01% -> flipOut=true` — the OPPOSITE row
  order to every headless run (flipOut=false). So §GI_ORIENT_RATIO's "measured platform answer (no
  flips)" fallback is WRONG on his machine: at an undecided view it would shade upside down. SPEC:
  when undecided and no decisive answer yet this session, render a PROBE — a horizontal plane below a
  level camera, geometry material, same renderer, same readback path (incl. the test-injection hook) —
  and read which half the drawn pixels land in: bottom half as read = flipOut=false, top = true.
  Decisive by construction, per machine. flipTex stays false (every decisive reading, headless AND
  red1's desktop). TEST: undecided live view -> "row-order probe" and flipOut=false headless; same view
  with __GI_STILL_INJECT_READBACK_FLIP -> probe says flipOut=true; 4 HHS poses still RIGHT.
  (b) §SHADOW_SIZE_BY_ENVELOPE doubled Clinic (env 198 -> 8192, 512 MB, texel 0.048 m) though 4096
  already gives 0.097 m (~HHS's 0.088). SPEC: 8192 only when the 4096 texel exceeds 0.12 m (env > 245).
  TEST: Clinic 4096, HHS 4096, Hospital 8192.
- Look dials with NO bake cost, not yet tried: film AO applied twice (tap's SSGI AO over the app's N8AO)
  — drop the tap's; bounce gain above 0.6 (colour bleed barely visible at Hospital distances; 1.0
  washed out Terminal's white hall). Judge on a 5 s clip at 2-3 settings.
- **DONE 2026-09-24: Hospital FULL length 1080p/24 with bounce, all features** (red1: "full length as i
  got full machine up") — `~/films/hospital_ssgi_2026-09-23/hospital_gi_full_1080p.mp4` (245 MB, copy in
  ~/Downloads; `_small.mp4` 19.9 MB sent). 4963 frames, 9752 s wall = 2 h 43 min (1.96 s/frame; my
  concurrent live-site tests shared the GPU). Self-checks: 0 errors, 0 flash, 0 flat frames, 274 blank
  grabs all recovered, verdicts 51/14/4 = the 480p run, escape route 156.20 m fully drawn.
- **PAUSED 2026-09-23 by red1 ("kill the bake, will resume later"): Hospital 1080p ending, 1-hour
  budget.** 5 s 1080p clip pair (frames 3600:3720) CLEAN vs control (0 off, 0 flash, 2.2 s/frame).
  NOTE the 1080p film grid is 4699 frames, not 4963 (`§FRAME_RANGE_OOB b=4963 > full film
  frames=4699` — first attempt refused). Resume verbatim:
      rm -rf /tmp/silent-bake-profile-8613; cd /tmp/bake-r186-root && node cli_silent_bake.js \
        --root /tmp/bake-r186-root --db Hospital_silent \
        --out ~/films/hospital_ssgi_2026-09-23/hospital_gi_end_1080p.mp4 \
        --log ~/films/hospital_ssgi_2026-09-23/hospital_gi_end_1080p.log --gpu real \
        --chrome-args "--enable-unsafe-webgpu" --port 8613 --width 1920 --height 1080 --fps 24 \
        --frame-range 3336:4699 --tap /tmp/wt-ssgi-webgpu-spike/sandbox/spike_ssgi_webgpu/gi_bake_tap2.js \
        --buildup --label --4d5d --reveal --clash --measure --storey-reveal --load-path --ledger \
        --cost --escape-route --sun-compass
  Needs `/tmp/bake-r186-root` and `buildings/Hospital_silent.db -> ~/Downloads/Hospital_silent.db`
  (both in /tmp — rebuild after a reboot). Check policy agreed with red1: no full-length control;
  a 5 s control clip before each big bake + self-checks (flash/blank/errors/escape route).
- **§GI_LIVE (2026-09-23, red1: "i mean the upgrade to Viewer") — SPEC: bounce on Alt+S in the LIVE viewer.**
  bim-ootb#1756 merged + deployed (sw v1232) but the live viewer never loads gi_still.js and ships
  three r185, so live Alt+S has no bounce. Change, one PR, off fresh origin/main:
  1. `viewer/lib/three.core.min.js` + `three.webgpu.min.js` -> official three@0.186.0 minified builds
     (416 KB + 821 KB; export names identical to the tested unminified r186, 635/447), webgpu's
     `./three.core.js` import rewritten to `./three.core.min.js`. `three.module.min.js` (the WebGL
     renderer the app draws with) UNCHANGED — the exact mix every bake and the dev server ran today.
  2. `viewer/gi_still.js` + `viewer/lib/gi/{three.tsl.appbound.js,SSGINode.appbound.js}` — imports made
     RELATIVE (the absolute `/viewer/...`, `/sandbox/...` paths break under Pages' `/bim-ootb/`).
  3. Gate: registers its Alt+S hook ONLY on a desktop (no coarse pointer) with `navigator.gpu` and
     THREE r186; otherwise logs `§GI_STILL_OFF reason=...` and Alt+S stays exactly as today.
  4. viewer.html script tag; sw.js precache the 3 new files + CACHE_VERSION bump.
  TESTS (before PR): (a) fleet — every buildings/ DB loads on OLD (origin/main) vs NEW tree, plain
  static server, same `§CONTRACT_CHECK` counts, no new `§LOAD_FAIL`/pageerror/§UPGRADE_THREE_FAIL;
  (b) Alt+S headless on the NEW tree served plainly (no in-memory swap) at 1666x864: §GI_STILL result
  + ORIENT_GEOM right + app frame unchanged after; (c) gate: headless with WebGPU disabled ->
  §GI_STILL_OFF and the app's own still completes; (d) CI fast checks.
- **§GI_LIVE merged (bim-ootb#1757) + §GI_ORIENT_RATIO (2026-09-23).** Live-site witness (real
  red1oon.github.io, HHS_Office_Federated_extracted from OCI, default view, 1666x864): r186 loaded,
  rows unpadded, still completes — BUT `§GI_STILL_ORIENT_GEOM asRead=0.02% reversed=0.20%` ->
  `colour (geometry UNDECIDED)` and colour picked flip/flip (margin 0.49) = upside-down shading.
  Cause: the decision rule `hi >= 2*lo + 1` carries a 1-POINT absolute floor sized for the indoor poses
  (21-32 vs 0.1-2); at a low-contrast view the signal is a 10x RATIO on ~90,000 samples but under 1
  point. (My first witness also printed PASS on this — it matched /geometry/ inside "geometry
  UNDECIDED"; regex anchored.) SPEC: decide by geometry when `hi >= 3*lo && hi - lo >= 0.1` points.
  REVISED after measuring: the ratio alone is not enough — the same view read 0.02% vs 0.20% then
  0.02% vs 0.09% (mostly camera-facing walls: flipping rows barely changes which surfaces face away).
  FINAL RULE: decisive (`hi >= 3*lo && hi-lo >= 0.1`) -> geometry; undecided -> the last decisive
  answer this session, else the MEASURED platform answer flipTex=false flipOut=false (every decisive
  reading today: 13 runs, 9 poses, 3 servers). Never colour (wrong in every weak case measured).
  RESULT: live view -> "measured platform answer (no flips)"; 4 HHS poses RIGHT; full Alt+S incl.
  injected flip RIGHT (geometry decisive 30.5% vs 0.04%); app frame unchanged after (0.96).
- (superseded) **The film needs one full re-bake on v2** to confirm the four features return. v2 is verified on a
  120-frame test (orientation `same=10.5 flipped=130.4`, clear 12%), not yet on a full 614-frame run.
- The bake's `exposure=1.8` in v1 is gone in v2 by design; if a v2 film reads dark, that is the first
  thing to check, not the last.
- Alt+S on Hospital still pays ~68 s on the first press (5 080 renderables). Inherent: ~13 ms per
  render object, no async door. Later presses are seconds.
- **§S277b is NOT resolved.** This runs on desktop with a real GPU, operator-controlled. red1 has
  said Alt+S is desktop-only by design, which removes the mobile hazard but not the fleet re-test.

## ▶ §WEBGPU_SSGI_SPIKE (2026-09-22) — native TSL bounce-light/AO investigated for Alt+S/Alt+C, weighed against §S277b — supersedes nothing below, read alongside RESUME

### Why this was opened
§RENDER_HONEST_SCORE (this file's own history, `COMPETITIVE_TWINMOTION_HORIZON.md`) rates interior
5/10 vs exterior 8/10 — AO darkens creases but can't add bounced fill light, and the Alt+C film
spends most of its runtime indoors. The prior bounce-light attempt (`§PHOTO_SSGI`,
`effects_gi_poc.js`, third-party `realism-effects` library) was rejected 2026-07-17 by the user's
own live verdict — "not accurate or crisp," plus ghosting/fragility — and defaulted off
(`A._stillSSGIEnabled = false`, still true today). This session checked whether anything changed
since, given a year+ of upstream three.js work.

### What's confirmed, not guessed (isolated worktree `/tmp/wt-ssgi-webgpu-spike`, branch
`spike/ssgi-webgpu`, `sandbox/spike_ssgi_webgpu/` only, nothing committed, 1.8GB of disposable
artifacts, zero shipped files touched)
- **The vendored `realism-effects` library (used by Alt-S/Alt-G's SSGI fold) is dead upstream** —
  last commit 2024-02-03, its `poisson-recursive` branch 2023-09-21. No patch to pull. The "not
  crisp" verdict from 07-17 has no upstream fix available.
- **three.js's own first-party TSL node GI (`SSGINode`+`GTAONode`, `mrdoob/three.js` #31839→#31895,
  Sept 2025→Jun 2026) runs correctly on this app's real geometry** — tested on Clinic (61
  BatchedMesh/9,644 slots + 531 InstancedMesh), Duplex, Hospital: real bounce light (GI luminance
  mean 0.15 in a previously pure-black corridor), 0 NaN, clean normals/velocity on BatchedMesh (the
  exact class of geometry that broke the old library). Needs the r186 core specifically (already
  vendored unused at `viewer/lib/three.webgpu.min.js`, dated Jun 27 — r185 throws a TSL build error
  on these nodes). Per-frame GPU cost measured 1-4ms — cheap, vs. the old N8AO-in-bake estimate of
  ~317ms/frame that ruled GI out of Alt+C entirely.
- **Quality is real but scene-dependent, not a clean win.** A close, low-contrast interior corner
  (Hospital, real cinema-path pose) converged clean — soft AO gradient, no visible grain. A
  high-contrast corridor (Duplex, hard directional sun + dark void) stayed visibly grainy even at
  1000-frame convergence, because `TRAANode`'s temporal blend is a fixed 5%-per-frame EMA
  (~20-frame time constant) — more frames past that plateau, don't help, and one artifact got worse
  at 1000 frames. Same class of finding as before: crispness is not free, contrast-dependent.
- **Camera motion does NOT ghost/flicker — but the first two debugging passes chased a phantom.**
  A 240-frame then 576-frame (full real HHS saved path, see below) moving-camera sequence appeared
  to freeze solid after frame 0 across two sessions of tracing `PassNode`/`SSGINode`/`GTAONode`
  internals. Actual cause, found on the third pass: the SPIKE's OWN camera-framing code computed an
  infinite far-plane for HHS's Batched/InstancedMesh (a bounding-box check that silently no-ops on
  that geometry type) — a one-line bug in our own test harness, not in three.js. Once fixed: the
  real HHS saved path (61.04s, its own `cinema_path` DB table — see below) rendered end to end,
  every beat (dive/walk-out/rise/exterior orbit/pullback) sampled for adjacent-frame ghosting —
  none found. Lesson worth keeping: check your own harness before tracing vendor internals two
  sessions deep.
- **HHS has a real saved/authored cinema path**, `buildings/HHS_Office_Federated_silent.db`'s
  `cinema_path` table (4 `seq` rows = 4 bands of ONE composite path, not alternatives — traced to
  `effects.js:9203` `_cpeLoadFromDb`), total 61.04s — not the generic 24s this whole investigation
  initially assumed from an old default-constant comment. `cinema_maxq.js`'s real bake path also
  defaults to 15fps, not the 24fps used elsewhere in the app — two separate places this session's
  early tests got the wrong constant from stale assumptions instead of reading the real per-building
  data; corrected once found.

### The constraint that actually matters — §S277b, found late, should have been checked first
`docs/internal/CINEMATIC_RENDERING.md`/`ROADMAP.md` record that §S276 (2026-05-24) already tried
WebGPU as the app's PRIMARY renderer and rolled it back to WebGL: compat-mode (WebGPU-on-WebGL2,
transpiling TSL→GLSL) measured 9.2s for 44 materials on a weak iGPU; a software "swiftshader"
adapter must be explicitly detected/rejected or it poisons the canvas and blocks the WebGL fallback;
on this dev machine specifically, Chrome/Dawn's PRIME handling on Linux exposes ONLY swiftshader
natively for native WebGPU — reaching the real NVIDIA adapter needs explicit launch flags or a
system GPU-mode switch; mobile `compileAsync` hangs outright. **This spike never tested or
contradicts any of that** — it only ever ran headless, flag-forced onto the real GPU
(`--enable-unsafe-webgpu --enable-features=Vulkan`), matching `cli_silent_bake.js`'s own existing
`--gpu real` convention for the OPERATOR-controlled bake path, never the live/any-user's-browser
path §S277b is about. That's a materially different scenario, not a refutation — but it means this
spike's clean results say nothing about whether WebGPU is safe for live navigation, only about an
offline, flag-controlled bake process.

### Dual-GPU-context risk — RESOLVED 2026-09-22, it works
The one real architectural unknown above is no longer open. A standalone sandbox harness (not
`cli_silent_bake.js`, no shipped file touched) booted a second, fully independent
`WebGPURenderer`+`SSGINode`/`GTAONode`/`TRAANode` pipeline in the same page as the real app's live
`WebGLRenderer`, on the real GPU (`adapter=nvidia/lovelace`, not SwiftShader). The app's own WebGL
context stayed alive throughout (`contextLost=false`). Drove 4 real poses from HHS's actual saved
path via `window.APP.cinemaPathPlan(61.04, ov).poseAt(t)` at t=0/10/30/61s — all rendered correctly
(t=10s: real interior corridor; t=61s: real exterior aerial orbit). 32-62ms/frame after warmup.

### Open, blocked on a permission gate, not a technical one
The one-function opt-in patch to `cinema_maxq.js`'s `_captureFrame()` (draw from a parallel readback
canvas when `window.__giWebgpuRenderFrame` exists, byte-identical when absent) is scoped but was
refused by the permission system as a shared/production-file edit, even inside the disposable
worktree — correctly requires explicit human sign-off, not an in-thread agent instruction. Separately
found: `cli_silent_bake.js`'s real `--gpu real` launch is missing `--enable-unsafe-webgpu`/
`--enable-features=Vulkan` (confirmed needed on this box) — a second small additive change needed
there too before a real bake could use this path. Nothing in `viewer/` has been changed.

### Verdict
Alt+S (single cost-insensitive still) is the safer candidate — bounce light is real and confirmed,
clean in low-contrast framing, same known noise-in-high-contrast tradeoff as every prior attempt.
Alt+C integration is technically scoped and the motion/ghosting question is answered clean, but sits
behind one untested architectural risk (dual GPU context) and needs to be squared with §S277b's
existing, deliberate WebGPU-deferral reasoning before any shipped file is touched. Nothing in
`viewer/` has been changed by this investigation.

### ✅ ALL 3 QUEUED FOLLOW-ONS CLOSED 2026-08-16+1 — PR bim-ootb#1409 MERGED+LIVE (CI green,
fast-checks+e2e both SUCCESS, confirmed on `origin/main` @ 6a0f89a)
1. ✅ **§MIRROR_TRUE_REFLECT — SHIPPED.** Confirmed case (a) from the costed branch below: Clinic's
   22 `M_Mirror` elements carry `material_rgba` 0.843,0.843,0.843,1.000 — a direct DB query showed
   it's not shared with any other `IfcFlowTerminal` fixture in the building, so streaming.js's
   rgba+class `_matCache` key already makes the mirror material genuinely exclusive. Fix: a
   name-keyword DB lookup (same pattern as `§PHOTO_EMBER`'s `EMBER_WORDS`, cached per building) that
   bypasses `_photoEnvExempt` for mirror-only materials, forces near-zero roughness (0.03 vs the
   metal path's `roughness*0.4`), and lets `_reassertPhotoMatBoost` mark it room-probe-eligible.
   **Live-verified headless on Clinic**: mirror material roughness 0.03, envMapIntensity boosted
   0.05→0.15, `envMap` swapped to the real room-probe capture (not the sky) — while a control
   grab-bar material (same class, different rgba) stayed fully untouched (`_photoBoosted=false`,
   still exempt), proving the fix doesn't leak into other `IfcFlowTerminal` fixtures.
2. ✅ **§TRIPLANAR_MEP_GAPS — SHIPPED.** Added the 4 named classes
   (`IfcFlowController`/`IfcFlowMovingDevice`/`IfcFlowInstrument`/`IfcFlowStorageDevice`) to
   `TRIPLANAR_MAT`'s metal group, **plus `IfcValve`** — a real gap the original diagnosis missed,
   found by cross-checking every `STD_MAT` class with `metal>0.3` (the table's own documented rule)
   against `TRIPLANAR_MAT`'s keys; `IfcValve` had 111 live elements on Terminal and none on any
   triplanar entry, silently falling back to a fake procedural-grain perturbation instead of the
   real photo texture. **Live-verified headless on Terminal** (a different, larger building than
   the original diagnosis): both `IfcValve` and `IfcFlowController` materials now compile with the
   real `uTriNorm` triplanar shader (`§TRIPLANAR_INIT class=IfcValve` / `class=IfcFlowController`
   fired, `onBeforeCompile` contains `uTriNorm`) instead of the flat/fake-grain fallback.
3. ✅ **§EXTERIOR_FLAT_SHADOW — INVESTIGATED, VERDICT = candidate (a), no code change.** Two
   numeric checks settle (a) vs (b):
   - **Shadow-frustum coverage is NOT the gap, on either building tested.** Clinic:
     `outsideFrustum=0` (of 565 casters), `texelPerM=10.3` (~9.7cm/texel). Terminal (much bigger —
     28MB source, ~3x Clinic's element count): `outsideFrustum=0` (of 577 casters),
     `texelPerM=11.3` (~8.9cm/texel), shadow-camera frustum `env=182m` — sized to the FULL building
     envelope by `_enablePhotoShadows()`'s own `_env` computation, not a local/partial box. Both
     buildings: fine resolution, zero geometry clipped from the shadow camera's view.
   - **N8AO is architecturally contact/crease-only, confirmed from its own config, not assumed.**
     `STILL_AO_RADIUS = 32` (`effects.js` — pixels, `screenSpaceRadius` mode) means N8AO can only
     ever sample and darken pixels within 32 SCREEN pixels of a depth discontinuity (a corner,
     crease, or contact point) — this is the fundamental limit of every screen-space AO technique,
     not a bug in this codebase's tuning. A broad, flat exterior wall panel far from any corner has
     no nearby depth-different geometry within that radius, so it legitimately reads AO≈1.0
     (no darkening) — exactly candidate (a)'s prediction from the costed branch below.
   - **Verdict: this is EXPECTED N8AO behaviour, not a fixable gap** — no code change made. If the
     user wants broad-surface darkening away from creases (not contact-AO), that needs a genuinely
     different mechanism (e.g. a stronger sun-vs-fill light ratio so orientation-based N·L falloff
     reads more dramatically, or a distance-based fake ambient-occlusion pass) — named here as a
     possible future ask, not built, since the diagnosed item itself doesn't call for it.
   - Witness scripts (this session, not committed): scratchpad `witness_mirror_true_reflect.js`,
     `witness_triplanar_mep_gaps.js`, `witness_exterior_flat_shadow.js` — headless Chrome 147 needs
     `--use-angle=swiftshader --enable-unsafe-swiftshader` (not the older `--use-gl=swiftshader`,
     which now fails WebGL context creation outright — "GL_VENDOR = Disabled" — worth recording,
     cost real time this session). Terminal specifically needs its split trio symlinked
     (`Terminal_meta.db`/`_geo.db`/`_positions.bin`, not just `_extracted.db`) — the split-detect
     logic hangs (guidMap stays 0 indefinitely, no console error) if only the combined DB is present
     but a stale split reference still gets probed.

### ✅ Follow-on session same day (2026-08-16+1, cont.) — sw.js cache bump + mirror metalness,
user-tested live, WRAPPED
- **PR #1409 shipped but never went live — root cause found+fixed, PR bim-ootb#1411 MERGED+LIVE.**
  #1409 touched only `effects.js`/`streaming.js` and never bumped `sw.js` `CACHE_VERSION`, so
  browsers with an existing install kept serving the pre-#1409 bundle (documented bug class —
  `feedback_sw_version.md`: "zero §-tags appear in logs" — exactly what happened, user's live
  console showed zero `§MIRROR_TRUE_REFLECT` output despite a full Alt+S cycle completing). Fix:
  `CACHE_VERSION` v1052→v1053, `viewer.html` `effects.js?v=24`/`streaming.js?v=63`. Confirmed live
  via `curl` against the served `sw.js`/`viewer.html` post-deploy.
- **§MIRROR_TRUE_REFLECT_METALNESS — real second bug, PR bim-ootb#1415 MERGED+LIVE (bundled its
  own sw.js bump this time — v1053→v1054 — same PR, learned from the miss above).** User re-tested
  after the cache fix and reported "still not reflection in mirror." #1409's roughness-only fix
  left `metalness` at `STD_MAT.IfcFlowTerminal`'s 0.30 — `MeshStandardMaterial`'s diffuse/specular
  split is driven by metalness, not roughness, so at 0.30 the shader still blended ~70% diffuse
  albedo into the output; even a sharp, boosted envMap reflection read as a faint sheen, not a
  mirror image. Fix: force `metalness=0.95` for mirror materials specifically (same `isMirror`
  exclusivity gate), save/restore on teardown. Live-verified headless on Clinic: metalness
  0.30→0.95 confirmed, `_photoOrigMetalness` saved for restore. **User-confirmed live**: mirror now
  visibly reflects via Alt+S (user initially thought it worked without Alt+S — corrected: "it is
  from alt-s that the mirror effect comes about").
- **Two follow-on mirror-quality observations, understood not urgent, not built:** (1) "still
  metallic" — the room-probe capture is only 128×128 (`§MIRROR_ROOM_PROBE ... size=128`), too
  low-res for a crisp mirror image, reads as a soft/grainy metal sheen instead; a real fix needs a
  higher-res probe and/or a lower-metalness glass-mirror-tuned look instead of the metal path. (2)
  "reflects what is outside the room too" — expected, not new: the probe is ONE fixed capture
  point for the WHOLE building (the existing "35% up from lowest point" pivot heuristic from
  #1407), not per-room/per-mirror — if that one point has line-of-sight to a window, every mirror
  in the building shows it. Real fix = per-mirror local probe (expensive) or a smarter per-room
  probe placement — this is literally the original "§MIRROR_TRUE_REFLECT — real per-mirror
  reflection" ask from the very first costed branch below, items 1 (metalness/roughness) only
  partially closes it. Named here for a future session, not costed yet.
- **§EXTERIOR_FLAT_SHADOW revisited — user pushed back with a real physics question ("will it be
  darker on wall away from the Sun? ... I don't see that is so"), leading to a SEPARATE, more
  severe finding than the AO-contact verdict above:** a rigorous live A/B (same scene, only
  `A.sun.castShadow` toggled true/false, raw render, two ground points symmetric around the
  building) showed **byte-identical pixels** — the ground gets ZERO contribution from the sun's
  real directional shadow, confirmed on Clinic in plain-nav Shadow mode ('h'). A guaranteed solid
  occluder box placed directly overhead a sample point only moved luminance by 0.7/255 (consistent
  with SSAO's small contact-only darkening, not a real cast shadow). Ruled out `§GROUND_DETAIL`'s
  `onBeforeCompile` ground shader patch as the cause (stripping it entirely made zero difference to
  the same test). Ruled out frustum coverage (already proven clean above). Live THREE.js revision
  confirmed **r185** (a stale log label elsewhere claims r184 — not proven as the cause, just an
  inconsistency worth another look). **⛔ USER RE-TESTED LIVE AND COULD NOT REPRODUCE — "ground
  shadow gone away. False alarm or there is a mem race conflict."** Per this same file's own
  `§GROUND_RECT_ARTIFACT` precedent (closed the same way earlier today), the user's live call
  wins — not chased further, no code changed. The headless A/B evidence above is real and
  reproducible in THAT run, so if this resurfaces, re-run `witness_ground_shadow3.js`/
  `witness_ground_shadow_bisect.js` (scratchpad `7d2a0b3a-.../scratchpad/`, not committed) as a
  starting point rather than re-deriving from scratch — but do not assume it's still broken without
  a fresh live check first.
- **§TRIPLANAR_MEP_GAPS user-confirmed live, unprompted positive**: "now even piping is smooth
  metallic and no longer jagged." Some pipes still read jagged per the user — expected, not a new
  bug: only the classes actually added to `TRIPLANAR_MAT` today (IfcValve/IfcFlowController/etc.)
  got the real texture: any remaining jagged pipe is a class not yet in that table, not a
  regression in what shipped.
- **Lane closed by explicit user instruction ("wrap up and close") — next session picks up
  `prompts/CPE_4D_PERF_MEM_STUDY.md` ("the mem hog prompt"), not this file.**

### ⛔ OPEN TASKS FOR NEXT SESSION (2026-08-16 closeout, 3 items — costed, not started) — CLOSED
above, kept for the original cost/diagnosis reasoning
1. **§MIRROR_TRUE_REFLECT — real per-mirror reflection.** Corrected root cause (supersedes the
   "batched elements bypass `A._matCache`" theory in the §MIRROR_ROOM_PROBE section below, which
   was wrong — traced further, `A._getMaterial()` runs uniformly across batched/instanced/merged
   paths and DOES populate `_matCache` for all of them). The REAL reason Clinic's real
   `IfcFlowTerminal "M_Mirror"` elements get nothing: `STD_MAT.IfcFlowTerminal` carries
   `envInt: 0.05` (`viewer/streaming.js` ~line 421) — the SAME fixed-low-reflection override
   applied to pipes/ducts by §HOSPITAL_BLUE_TINT/§PIPE_DUCT_BLUE_TINT to kill a blue-sky-tint bug.
   That sets `mat.userData._photoEnvExempt = true`, which is `_reassertPhotoMatBoost`'s very FIRST
   early-return guard — skips envMapIntensity boost, roughness scale, AND the room-probe
   eligibility flag entirely, for the whole class, mirrors swept up in a fix meant for pipes.
   **Cost, not yet determined which case applies (check first, ~15-30 min, same methodology as
   the already-documented §PHOTO_EMBER_EXCLUSIVE lesson):** if the mirror's real IFC colour
   already lands it in its OWN exclusive `_matCache` key (not shared with other `IfcFlowTerminal`
   fixtures like diffusers/grilles) — **~1-2h**: exclude mirror-named elements from the exemption
   (name-keyword query, same proven vocabulary pattern as `§PHOTO_EMBER`'s `EMBER_WORDS`), force
   near-zero roughness + the room-probe texture, verify live. If the material IS shared with
   other non-mirror fixtures — **~2-3h**: needs a per-element material split/clone for just the
   mirror sub-set (can't touch the shared key without boosting the fixtures sharing it too).
2. **§TRIPLANAR_MEP_GAPS — texture-grain amplifier reads "selective" on piping.** User: "i notice
   it replaces selectively in some piping but not exactly similar next to it." Found via code
   read (NOT yet visually confirmed against the user's actual observation — do that first):
   `TRIPLANAR_MAT` (`viewer/streaming.js` ~line 518) covers `IfcPipeSegment/Fitting`,
   `IfcDuctSegment/Fitting`, `IfcCableCarrier*`, and the generic-MEP `IfcFlowSegment/Fitting/
   Terminal` — but NOT `IfcFlowController`, `IfcFlowMovingDevice`, `IfcFlowInstrument`,
   `IfcFlowStorageDevice` (valves, dampers, pumps, gauges) — real MEP runs mix these in among
   segments/fittings, so an uncovered fitting sitting between two textured pipe segments on the
   SAME run would render flat/plain right next to heavily-streaked neighbours — exactly the
   symptom described. **Cost: ~30-45 min** — add the missing classes to `TRIPLANAR_MAT`'s metal
   group (a few lines, same convention as the existing entries), verify live that they pick up
   the grain and the "selective" look is gone.
3. **§EXTERIOR_FLAT_SHADOW — surfaces away from any wall don't darken.** User: "the surface of
   building away from wall does not get darker shadow effect." NOT INVESTIGATED yet — two
   candidate readings, need a live check to tell which: (a) N8AO by design only darkens contact/
   crease areas (near-adjacent geometry) — a broad open exterior wall far from any corner
   legitimately stays bright under AO, nothing to occlude against, this would be EXPECTED
   behaviour, not a bug; (b) real self-shadowing (the sun's own shadow map, `A.sun.shadow`) isn't
   reaching/covering distant exterior surfaces — a real gap, possibly a frustum-coverage issue
   (this file already has instrumentation for exactly this — `§PHOTO_SHADOW_FRUSTUM_COVERAGE`
   logs an `outsideFrustum` count; check it on the building/surface in question). Cost not
   estimated — investigation first (~20-30 min to tell (a) from (b) live), then cost depends on
   which.

### ✅ §MIRROR_ROOM_PROBE — SHIPPED 2026-08-16, PR bim-ootb#1407 (auto-merge armed)
User: "what does it take for mirrors to truly reflect... try the single room-representative probe
first" (asked after diagnosing a "jagged pipe surface" + "whitewashed" scene — see the
`§TRIPLANAR_CONTRAST`/`PHOTO_ENVMAP_BOOST=3.0` diagnosis in this session's chat, not yet acted on
below). Every glossy/metal material only ever reflected the static sky/HDRI env map — no local
scene reflection existed anywhere. Shipped: one `CubeCamera` capture at a representative interior
point (reuses `_cinemaPathPlan`'s own "35% up from the lowest point" pivot heuristic), used as
`envMap` for the existing `isGlossy` material set instead of the sky. Verified live on Clinic
(17,279 elements, real building the user was looking at — its console log is in this session's
chat): probe builds, ≥1 glossy material picks up the room-probe texture.
**A per-element "real mirror" boost was attempted and DROPPED, not shipped**: Clinic's real
`IfcFlowTerminal "M_Mirror:Mirror 600mm x 900mm"` elements (22 of them, user pasted a live pick
of one) render via the BATCHED mesh path — confirmed from the user's own console log
(`§BATCHED_PICK batchId=2`) — and `A._matCache` (what this whole boost/envmap system reads) only
covers instanced/merged-tracked elements. A batched element's material never gets a
`color|class|discipline` key in `_matCache` at all, so a per-element mirror boost has nothing to
attach to regardless of how the guid lookup is written (traced through `A.guidMap` →
`_batchMeta`/`_instanceGuids`/`findMeshByGuid` — batched elements use a SEPARATE identity system).
Fixing that needs a batched-mesh-aware boost path — a bigger, separate task, named here not built.
**RETRACTED 2026-09-21 — "Terminal has ZERO `_matCache` entries" was wrong, re-checked live.** A
fresh headless probe (`probe_matcache_dlod.js`, puppeteer/swiftshader, full 48,428/48,428 elements
streamed) found `_matCache` populated normally: 92 entries before AND after Alt+S, 14 materials get
the envmap boost, `§MIRROR_ROOM_PROBE` builds, `§TRIPLANAR_PERF materials=60` fires. A Clinic control
run (54 entries, populated) confirms the probe method itself was sound. The DLOD-bypass theory was
never possible in the first place: `A._useDlodPath` is hardwired `false` at both stream-queue paths
(`viewer/streaming.js:397,452`, §S262) since the 2026-05-23 initial-migration commit — i.e. already
false when this paragraph was written on 2026-08-16. Why that day's probe read zero is not
reconstructible from current code; treat it as a probe/timing artifact from that session, not a real
defect. Alt+S's material-boost/triplanar/envmap/room-probe layer is confirmed live on large
buildings — no dedicated session needed here. (The batched-mesh mirror gap two paragraphs up is
unaffected by this retraction — still real, still unfixed.)
**Real bug found+fixed in the same pass**: dispose+rebuild every Alt+S cycle leaked +1
texture/cycle, compounding (measured C1/C2/C3 exit deltas: 25, 1, 1 — same bug CLASS as
§ALTS_MEM_HOG above, found via the identical bisection discipline). A bare isolated
build+dispose loop OUTSIDE the real staging pipeline did NOT reproduce it — leak was specific to
disposing the RT while real materials still referenced its texture (most likely a stray render
between reset-envmap and dispose triggers a phantom re-upload three.js then never tracks). Fixed:
build the probe ONCE, keep it alive, reuse across cycles (only disposed on a real building
switch) — same "created once, reused" discipline this file already uses for `A._camLight`.
Re-verified: 3 full cycles, texture/geometry/program counts flat every exit.
**Still open, not yet started**: the "jagged pipe" / "whitewashed" diagnosis from earlier this
session — `contrastBoost=1.9` (metal group, highest of 3) at `tileMeters=0.6` (finest tile) is the
likely source of the pipe's "jagged" streak read (texture-space contrast, not geometric aliasing
— TAA correctly doesn't touch it); `PHOTO_ENVMAP_BOOST=3.0` (glossy envMapIntensity multiplier,
tuned pre-§TRINORM_LINEAR when metal read near-black) is the likely "whitewash" source now that
metal's real darkness bug is already fixed. User said "try the room probe first" — this ships
that; the contrastBoost/envMapBoost retune is the natural next step if the room probe alone isn't
enough (not yet judged live).

### ✅ ALL 3 ITEMS CLOSED 2026-08-16 (were: OPEN TASKS from the prior closeout) — see PR links in each
1. ✅ **§GROUND_RECT_ARTIFACT — CLOSED 2026-08-16, user: "the rect shadow cloud is gone. False
   alarm."** Original report: "alt-s seems to have a large rect cloud cover over it," suspected as
   a §GROUND_DETAIL (#1388) regression from the paved normal map's 780m tile (rectangular slab
   joints amplified through lighting) and/or the 90m `floor()`-cell blotch (both real, hard-edged
   mechanisms — confirmed mathematically mid-investigation, a `floor()`-quantized per-cell hash is
   piecewise-constant with discontinuities at every cell boundary by construction) — but the user's
   live browser no longer showed it and called it a false alarm before the attribution rig
   finished. A GLSL smoothing fix for both mechanisms was drafted and verified working but NOT
   shipped (dropped per user's false-alarm call — avoid unsolicited scope creep on a
   no-longer-reported symptom). **Redirected instead, same session: §GROUND_EARTH_DEFAULT — PR
   bim-ootb#1393 (auto-merge armed).** User: "more realistic even surface feel" — switches
   `_applyPhotoStaging()`'s Alt+S/Alt+C bake ground texture from 'paved' (concrete_floor_01, the
   texture carrying the rectangular joint pattern above) back to 'earth' (no such structure), and
   reorders the Shadow-mode toggle cycle (`_SG_CYCLE` in tools.js) so 'earth' is the first real
   choice instead of 'grass'. §GROUND_ALBEDO's existing gain calibration carries over unchanged —
   earth's measured mean (0.1599) is within 3% of paved's (0.155). Verified headless (Duplex, cold
   cache): first `toggleShadow()` press → `_shadowGroundKey='earth'`; Alt+S staging's real
   `§GROUND_MAP key=earth` log confirms both nor/rough maps loaded.
2. ✅ **§LTU_SUBSURFACE_BBOX in Alt+C — WITNESSED 2026-08-16, live plan build confirmed working,
   no dive.** Triggered the REAL Alt+C entry point (`A.cinemaPathPlan(24)`, the same function
   `cinema_maxq.js` calls — not a synthetic stand-in) headless on `LTU_AHouse_extracted.db`
   (125,698 elements; only the DB needs to be open for this — `_buildingBBoxArc()`/
   `_cinemaPathPlan()` read `A.dbQuery`, not streamed THREE.js mesh, so no need to wait out the
   many-minutes full mesh stream). Confirmed exactly as predicted:
   `§CINEMA_BBOX_FENCE excluded=13/9712 rawZ=[-45.55,16.31] fencedZ=[-3.19,16.31]
   fence=[-3.78,18.89]` fires during PLAN build — the fence throws out real subsurface junk
   (raw Z min -45.55 → fenced -3.19). `A._cinemaPathEdit` confirmed empty (no saved/authored
   waypoints for LTU — the named "predates the fix" suspect doesn't apply here, ruled out
   directly rather than inferred). **Pivot Y**: a fresh headless page's `A.controls.target`
   defaults to the origin, which happens to pass `_cinemaPathPlan`'s "plausible" proximity check
   for LTU's geometry and wins the pivot over the arc-bbox centre — not a bug, just means a
   fresh-load probe doesn't exercise that branch by default. Forcing it (parking
   `controls.target` on the camera's own nose, exactly the "replanted target" failure case
   `§CINEMA_PIVOT`'s own guard is written to reject) gives `pivotSrc=arc-bbox-centre
   pivot=(6.3,-4.1,87.8)` — **not** the pre-fix −24 dive, but also not the session's own +3.6m
   estimate; the ~7.7m gap is `A.ifc2three()`'s per-building Z-datum offset (the +3.6 estimate
   was raw-IFC-Z arithmetic, before that offset applies — real building-specific calibration, not
   an error in the estimate's logic). The `§CINEMA_DIVE` settle point in both plan variants
   (`settle.y=-9.2`, `floorY=-10.94`) sits just above the real floor, consistent with a working,
   non-diving plan. **Verdict: the bbox fence works, LTU does not dive underground on a real Alt+C
   plan build.** Not chased further: whether `ifc2three`'s Y-offset for LTU specifically should
   itself read closer to the +3.6 estimate — low priority since the practical symptom (diving to
   −24) is gone. Witness script: scratchpad `probe_ltu_bbox_fence.js` / `_fence2.js` (this
   session, not committed).
3. ✅ **§ALTS_MEM_HOG — DONE (witness) 2026-08-16, PR bim-ootb#1391 (auto-merge armed).** Root
   cause found and fixed: `_teardownPhotoStaging()` called `_showPhotoProps(false)`, which only
   sets `.visible=false` on `_photoUplights`/`_photoSkyline`/`_photoSkylineLights` and does
   nothing at all for `_photoSparkles` (they froze at whatever visibility the last accumulation
   frame's sun-glint test left them — a live "sprite left glowing after Alt+S exit" bug). None of
   it disposed GPU resources — the whole photo-prop tree (~30 PointLights, 40 skyline-box meshes,
   1 window-sparkle Points cloud, ~24 glint sprites) stayed allocated after every REAL Alt+S exit,
   only ever freed later by a building switch (`_showPhotoProps(true)`'s own rebuild guard).
   Headless-measured on `HHS_Office_Federated` (Hospital's 63,917-element stream alone exceeded
   300s under this sandbox's swiftshader-only headless Chromium — no real GPU here, same caveat
   `VIEWER_MEMORY_LEAK.md` already documents; the LEAK MECHANISM is building-size-independent, only
   the absolute heapMB magnitude doesn't transfer): before fix, `startStillRefine()` →
   `stopStillRefine(true,false)` left textures 225/225, geometries 417→380, programs 49→44,
   sceneChildren 633→388 — **42 scene objects never freed** vs the pre-staging baseline. After fix:
   0 leftover objects, geometries/programs fall all the way back to the 364/12 baseline. Ran 2 full
   Alt+S on/off cycles back-to-back post-fix: cycle-2-exit vs cycle-1-exit delta = 0 on every
   counter — confirms no per-cycle growth (the one remaining one-time +22 textures/+32 programs on
   cycle 1 only is legitimate singleton-cached lazy-init — HDRI PMREM env map, N8AO scratch render
   target — not a leak). Fix: `_teardownPhotoStaging()` now calls `_disposePhotoProps()` (the same
   function the building-switch path already used) instead of the hide-only path. Probe scripts:
   scratchpad `probe_alts_mem_hog.js` / `probe_alts_mem_hog_2cycle.js` (this session,
   `aa515841-…` scratchpad — not committed, throwaway).

### ✅ §TRINORM_LINEAR — 2026-08-16 (8th session): BOTH open Alt+S bugs SOLVED, one mechanism — PR #1383 MERGED + LIVE (fetched back from production: streaming.js carries 4.8763, sw v1037)
**§ONGOING_TINT (bluish/darkish piping) and §RED_GREY_MYSTERY (red valve → literal black) were the
same bug, and it was NOT degenerate normals, NOT a stale shader program, NOT data:** every
triplanar `normFactorRGB` (and the scalar before it) was derived from the JPG's **sRGB byte
means**, but the shader multiply runs in **linear** light (textures are `SRGBColorSpace` —
GPU-decoded before `texture2D` returns). Under-normalized 2.0–2.4×, so the "centred at 1.0"
product actually centred at 0.42–0.53, and the contrast line `(x-1.0)*boost+1.0` clamps every
texel below `1-1/boost` to **literal zero**:
- metal (boost 1.9): 41.4% of texels → multiply-by-0 → the valve's pure-black pixels (719/1681
  grid samples); surviving mean multiply `[0.000, 0.011, 0.071]` — blue-dominant near-black =
  "bluish tint … greyer piping gets similar dark treatment" verbatim. Applies to ALL metal
  classes (Beam/Member/Plate/Railing/Pipe*/Duct*/CableCarrier*/Flow*), which is why it was
  widespread, colour-independent, and Alt+S-only (`uTriActive` gates staging).
- concrete/plaster: uniform ×0.467 / ×0.53 multiply — the systemic "Alt+S too dark" backdrop.
**Fix (PR #1383, branch `fix/trinorm-linear-space`, streaming.js?v=62, sw v1037):**
`normFactorRGB` = inverse LINEAR mean — concrete 2.0755, plaster [1.9428, 1.9262, 2.0172],
metal [4.8763, 4.0250, 3.3988]. Multiply centres at 1.000/channel, 0.00% texels clamp to zero,
contrastBoost unchanged. Witness: isolated valve, raw single-frame render, black 719→**0**,
meanRGB [119,79,66] vs triplanar-off reference [117,80,66] (brightness restored, only grain
remains). Offline texture-histogram + live uniform-variant probes in scratchpad
`aa515841-…/scratchpad/` (`probe_noop_recompile.js`, `probe_stale_uniform_diff.js`,
`probe_contrast_crush_confirm.js`, `witness_trinorm_fix.js`, `*.log`). Scene-wide A/B at the
default far view (raw render, 16k-sample grid): black 22→1, meanLum 124→126 — no regression,
the big deltas are close-up on metal surfaces as expected.
**How the prior sessions' probes all lied — two traps, record permanently:**
1. **Every shader-checkpoint probe REPLACED `mat.onBeforeCompile`** — which is where the
   triplanar patch lives — so every "clean" checkpoint was testing a triplanar-stripped shader.
   The "unresolved contradiction" (all stages clean, full shader black) was exactly this. Never
   assign `onBeforeCompile` on a material that already has one without composing the original.
2. **The `uTriActive=0` rule-out was silently undone** by the material's own per-frame
   `onBeforeRender` self-heal (re-asserts from `A._stillRefineActive` — §TRIPLANAR_RECOMPILE_FIX).
   Toggle `A._stillRefineActive` itself, or the toggle never survives to the render.
**Consequences for earlier verdicts:** the §RED_GREY_MYSTERY "root cause = degenerate vertex
normals" verdict below is **SUPERSEDED — wrong**. The 24 zero-magnitude normals are a real data
quirk but sit on zero-area triangles (rasterize nothing) — consistent with the repair changing
zero pixels. `A._repairDegenerateNormals` stays disabled; no longer a suspect for anything
user-visible. The earlier `length(normal)` "NaN spread" reading was a probe artifact (curved-mesh
interpolated `vNormal` length, not NaN).
**Still open after this:** (a) user visual confirm of Alt+S on live once #1383 deploys — expect
visibly brighter triplanar surfaces (metal especially); AO/exposure tunings were calibrated
against the crushed baseline and may want a revisit — user's call; (b) §SKY_SYNC_REGRESSION
(sky-dome sun-disc vs shadow direction mismatch, revert #1381) still open, separate;
(c) §HOSPITAL_META_DB_STALE regenerated split DBs still awaiting explicit user go to upload.
**(b) and (c) both CLOSED later the same day — see §SKY_SUNPOS_INIT and §HOSPITAL_DATA_SHIPPED
below.**

### ✅ §SKY_SUNPOS_INIT — 2026-08-16 (same session, cont.): black-sky-on-Alt+S SOLVED — PR #1384 MERGED + LIVE
User re-reported "sky is black again" after #1383 went live. Root cause found by code read +
live repro, NOT the #1380 uniform-copy mistake: `scene.js updateSky()` gated its `sunPosition`
uniform copy on `_sky.visible`, the init-time `updateSky(45,180)` runs while the sky is hidden
(so the Sky shader kept its stock `(0,0,0)` sun vector), and since #1379 the non-dusk Alt+S
shows the sky WITHOUT calling `updateSky` → first Alt+S of a fresh session = Preetham with a
zero sun = fully black sky. **Live-reproduced numerically** (sky band 192/192 black px, uniform
read back `[0,0,0]`) and **the #1381 equivalence question is answered**:
`normalize(A.sun.position)` equals the `setFromSphericalCoords` direction to 1e-16 (sun.position
is a pure direction ×5000, no offset/parent transform). Fix: uniform copy now unconditional
(scene.js?v=56, sw v1038) — a uniform write on a hidden object is free, so `visible = true` is
safe from any caller. Witness on fixed code: sky band 0/192 black, meanRGB [178,211,236].
§SKY_SYNC_REGRESSION's "mismatch still open" thread is thereby CLOSED for the fresh-load case —
the "stale sun-disc vs shadow" report was this same uninitialized/stale uniform.

### ✅ Same-day follow-ons (2026-08-16, all user-GO'd, all MERGED): #1386 §LTU_SUBSURFACE_BBOX (movie path no longer dives underground — full record in CINEMA_PATH_EDITOR.md), #1388 §GROUND_DETAIL (ground nor/rough maps + linear-mean-normalized detail multiply + anti-tiling blotch — user ask "ground surface material… not that realistic"), #1389 §STAGED_PL_CUT (night PLs halved during staging only, restores slab shadow play in bakes — full record in NIGHT_AND_FIXTURE_LIGHTING.md)

### ✅ §HOSPITAL_DATA_SHIPPED — 2026-08-16 (same session): stale split DEPLOYED to OCI + self-heal patch for cached users — DONE, VERIFIED
User asked "so the meta dbs can be uploaded whole to OCI? LTU, Terminal too?" — answered + done:
- **Hospital**: regenerated split (meta 23.3MB/geo 239MB/positions 1.5MB from `/tmp/split_test`)
  uploaded to the `bim-ootb` bucket `buildings/` prefix. ⚠ **Bucket convention discovered: DB
  objects are gzip-compressed with `content-encoding: gzip`** (old objects all were; a first raw
  upload was redone gzipped). All 3 fetch-back verified: decompressed md5 == local raw md5.
  Staleness re-confirmed on the actual served bytes first (old: IfcBeam 0/1970,
  IfcPipeSegment 0/14452 etc.; new: 100%).
- **LTU/Terminal need nothing**: LTU's split on the bucket is fresh (re-uploaded 2026-08-10);
  Terminal audited fine 2026-08-15 (split newer than source).
- **Cached users** (cachedFetch serves IDB blobs with NO revalidation — an OCI re-upload alone
  never reaches them): colour backfill appended to `buildings/patches/Hospital_meta.db.sql`
  (+ `viewer/buildings/patches/` mirror), shipped through `scripts/oci_patch_gate.js`
  (PASS → UPLOAD_VERIFIED, verifier committed, manifest committed) — PR #1385 MERGED. One
  guarded UPDATE: every previously-uncoloured element in 23 classes gets the single value the
  new extraction assigned them all (`0.920,0.900,0.850,1.000` — one DISTINCT value, checked);
  empty-rows-only guard = no-op on the new DB, never touches the 233 aggregate ghosts.

**§RED_GREY_MYSTERY — 2026-08-15/16 (7th session, updated, session closed — handed to a fresh
Fable session next.) ⚠ Historical record — its "GENUINELY STILL UNSOLVED" item and
degenerate-normal verdict are resolved/superseded by §TRINORM_LINEAR above.**

### Shipped this session — MERGED to `main`, LIVE on production (`red1oon.github.io/bim-ootb`)
PR #1379 (TAA fix + sun separation), #1380 (follow-up same day — point-light restore, see below),
#1381 (revert — see §SKY_SYNC_REGRESSION below). All merged, all live.
1. **§STILL_REFINE_JITTER_MISMATCH — TAA smoothing was silently half-broken, now fixed and live.**
   `viewer/lib/TAARenderPass.js` used a 32-entry jitter table while the still-refine loop only ran
   16 accumulate frames — a "converged" still was a 50/50 blend of 16 real jittered samples + 1
   plain unjittered hold-frame. Fixed: matching 16-entry table, zero extra cost.
2. **§PHOTO_SUN_SEPARATION — Alt+S no longer force-overrides the sun position, now live.** Was:
   unconditional reset to a fixed 6°-elevation dusk + reddish sky drama + forced night-mode amber
   glow, every press, regardless of real time-of-day. Now: sun position/sky-drama/warm-tint default
   OFF (plain daylight); old package still reachable via `APP._photoDuskMood = true` for A/B,
   not deleted. Alt+C's movie noon→dusk sun arc is a fully separate code path — confirmed
   untouched, never touch `PHOTO_SUN_ELEVATION`/`_AZIMUTH` constants themselves, only the call site.
3. **Point-light fixture illumination restored (PR #1380), now live.** Removing the whole
   night-mode force-toggle (item 2) also silently removed ~200 supplementary point lights it loads
   as a side effect — REAL illumination, not mood; beam/railing (`envInt:0` by an earlier,
   unrelated fix, so zero sky-reflection by design) leaned on them for visible sheen and went
   flat/dark without them. Fixed: night-mode's point-light toggle now fires UNCONDITIONALLY every
   Alt+S (and its intensity/exposure override, which just restores the real pre-toggle daytime
   values — not mood either); ONLY the warm-tint COLOUR override stays dusk-mood-gated.
4. **§SKY_SYNC_REGRESSION — shipped broken, reverted same session, DO NOT retry blind.** Attempted
   to fix a real sky/shadow-direction mismatch (sky dome showing a stale sun-disc position vs
   where shadows actually fall) by copying `A.sun.position` (normalized) into the Sky shader's
   `sunPosition` uniform whenever the sky is made visible. **Shipped without live verification —
   broke the sky entirely (rendered fully black in production), because this app's reflections are
   sampled FROM the sky as the env map, so it also killed reflections everywhere, not just on the
   originally-reported element.** Reverted (PR #1381) back to the known-good
   `if (A._sky) { A._sky.visible = true; }` only. **The mismatch is still real and still open** —
   re-derive the fix properly next time: `scene.js`'s own `updateSky()` builds the sky uniform via
   `setFromSphericalCoords(1, phi, theta)`, NOT by normalizing `A.sun.position` — check whether
   `A.sun.position` carries anything beyond a pure direction (offset, non-uniform scale via a
   parent transform, etc.) before assuming `.normalize()` is equivalent, and test live (screenshot
   or — per this project's own rule — better yet a numeric colour/luminance read of the sky
   pixels) BEFORE merging, not after a user reports it broken.
5. **§ONGOING_TINT — user's last observation this session, NOT resolved. IS a rendering bug, not
   a data/colour issue. §HOSPITAL_META_DB_STALE is NOT the cause of this — settled, don't
   re-litigate it here.** §HOSPITAL_META_DB_STALE (further below in this file) is a real, separate,
   smaller, already-scoped issue about MISSING colour data — it is unrelated to this symptom and
   was already proposed and rejected once this session as an explanation; do not re-propose it for
   §ONGOING_TINT without genuinely new evidence. After all 4 fixes above: "bluish tint still there
   though darker, but the greyer piping gets similar dark treatment. Thus it is just replacing the
   too bluish with another similar set of too darkish." **A grey element going BLACK is not
   explained by any colour-data gap — grey is a legitimate, valid RGB value; something in
   RENDERING has to actively zero it out.** That is the exact same failure shape as
   §RED_GREY_MYSTERY's already-found root cause on the one red valve (degenerate/zero-length
   vertex normals → `normalize(vec3(0))` → NaN → literal `[0,0,0]`, independent of the element's
   real base colour — proven on THAT element by the diffuseColor probe reading 100% healthy while
   the final pixel was still black). **This session's disabled normal-repair scan already measured
   how widespread the same raw defect is across this ONE building, unprompted by this specific
   complaint** — worth re-reading directly: `meshesScanned=4368 meshesAffected=1552
   degenTotal=72077` (from the `§NORMAL_REPAIR` log line, `A._repairDegenerateNormals` in
   `streaming.js`, currently commented out at its call site). 1,552 of 4,368 meshes in Hospital
   carry at least one degenerate normal — more than a third. That is a very plausible explanation
   for "greyer piping gets similar dark treatment" being a WIDESPREAD pattern, not one isolated
   valve. **Next session: do NOT chase a data/DB theory for this — pick up exactly where
   §GENUINELY STILL UNSOLVED (below) left off** on the one confirmed element, since the repair
   itself was verified to change ZERO rendered pixels there (the real mechanism is still not
   found, only the data-level symptom), then check whether the SAME "recompile clears it" lead
   generalizes to grey piping elements too.
1. **§STILL_REFINE_JITTER_MISMATCH — TAA smoothing was silently half-broken, now fixed.**
   `viewer/lib/TAARenderPass.js:35` used a 32-entry jitter table (`_JitterVectors[5]`) while
   `effects.js`'s still-refine loop only ever ran 16 accumulate frames — a "converged" still was
   actually a 50/50 blend of (16 real jittered samples) + (1 plain unjittered hold-frame), which is
   why edges looked jagged on EVERY object, not just the broken one. Fixed: switched to the
   matching 16-entry table (`_JitterVectors[4]`), zero extra render cost. Verified:
   `taaAccumulateIndex=16` converges cleanly.
2. **§PHOTO_SUN_SEPARATION — Alt+S no longer force-overrides the sun.** User: "Sun should be a
   separation of concern" + "too dark contrasting unrealistic ... too cartoonish." Alt+S used to
   unconditionally reset the sun to a fixed 6°-elevation dusk (`PHOTO_SUN_ELEVATION`/`_AZIMUTH`,
   still used by the Alt+C movie sun-arc — untouched), boost the sky toward reddish drama
   (turbidity/rayleigh/mie), and force night-mode's amber glow on — all regardless of whatever real
   time-of-day was already active. **New default: none of that happens** — sun/sky/night-mode stay
   exactly as they already are (plain daylight, if that's what's active). **Old behavior still
   reachable, not deleted** — user explicitly asked to compare, not lose it: set
   `APP._photoDuskMood = true` before pressing Alt+S to get the full old dusk package back
   (sun position + sky drama + night-glow + warm-evening tint), leave unset/false for the new
   default. Verified live both ways (sun position unchanged by default, forced-different with the
   flag, shadows confirmed still enabled+casting either way — user's explicit "don't break that").

### GENUINELY STILL UNSOLVED — next session starts HERE, do not re-derive from scratch
**A real element (Hospital `IfcValve` guid `0HuLVU0hf5gxwY8y9yDvc0`, isolated with zero possible
neighbour occlusion — including same-BatchedMesh slots via `setVisibleAt`, not just other meshes)
still renders literal `[0,0,0]` on ~43% of its own pixels under Alt+S.** This session ruled out,
by direct raw-single-frame-render test (NOT the TAA-accumulated composite, which was found to mask
real differences — always test with `A.renderer.render(A.scene, A.camera)` directly, never
`A._composer.render()` for a differential "does toggling X change anything" test):
- AO, shadow-restore blend, sun shadow map (incl. bias), triplanar, env reflection, batch-neighbour
  occlusion, backface culling (`mat.side` is already `DoubleSide`), vertex colours (none exist on
  this material — no `color` attribute at all), material maps (none — no map/aoMap/alphaMap/
  normalMap/roughnessMap/metalnessMap), opacity/alphaTest/transparency (all default/off).
- **Geometry-data normals**: found 24 genuinely zero-magnitude vertex normals on this element's own
  mesh (raw CPU-side buffer read, real in-range positions, not padding) — built and verified a
  repair (`A._repairDegenerateNormals` in `streaming.js`, currently commented out/disabled at its
  call site): recompute-from-triangle first, nearest-valid-neighbour-by-position fallback when the
  vertex's own triangles are ALL zero-area (confirmed the actual case here — every one of the 24 sits
  on a degenerate triangle, so simple per-face recompute alone doesn't reach them). **The repair is
  confirmed 100% effective at the DATA level** (read back live: 0 degenerate vertices remain, at
  every checkpoint across the full staging sequence — streaming-complete, post-isolation,
  mid-staging, fully-converged, all confirmed clean in one unbroken test) **but changes ZERO
  rendered pixels**, tried 3 different GPU-upload-forcing strategies (`needsUpdate=true`, swap in a
  genuinely new `BufferAttribute` object, `renderer.properties.remove(geom)` to drop cached GPU
  state) — none moved the black-pixel count at all. **This means the 24 raw-degenerate vertices are
  NOT the (or not the sole) cause of the visible black — that causal link, assumed earlier this
  session from a correlated but not confirmed in-shader `length(normal)` probe, does not hold up.**
- **Stage-by-stage shader probe, real finding, most valuable lead for next session**: patched
  `mat.onBeforeCompile` with early-`return` checkpoints at successive points in the ACTUAL compiled
  shader (not a synthetic isolated fragment) and re-rendered raw each time. Every single checkpoint
  came back **100% clean (zero black pixels)**: `diffuseColor.rgb` right after `#include
  <color_fragment>` (pre-lighting), `length(normal)` right after `#include
  <normal_fragment_maps>` (post-repair — was NOT clean pre-repair, matches expectation),
  `reflectedLight.directDiffuse + indirectDiffuse` right after `#include <lights_fragment_end>`,
  `outgoingLight` right after `#include <opaque_fragment>` (post envmap/specular combine),
  and the fully-tonemapped+colorspace-converted `gl_FragColor.rgb` right before `#include
  <fog_fragment>`. Fog itself was also directly ruled out (`material.fog = false` + forced
  recompile — same black count as fog-on, 721 both times). **Every stage tested individually is
  clean, yet the FULL unmodified shader (no early-return patches) still outputs black at those
  exact pixels.** This is an unresolved contradiction — most likely explanation not yet tested:
  something about the shader RECOMPILE each probe triggers (`mat.needsUpdate = true`) inadvertently
  fixes or sidesteps the real bug as a side effect (e.g. a stale/mismatched compiled-program cache
  for this exact material+light-count combination, separate from anything in the GLSL source
  itself) — test THIS directly next: patch a checkpoint that changes NOTHING (a true no-op
  replace-with-itself) and confirm whether the mere act of forcing recompile alone clears the black,
  independent of which checkpoint/probe content is used. If recompiling alone fixes it, the real bug
  is a stale compiled shader program (e.g. from a light-count change after initial compile — this
  scene ends up with up to 47 `PointLight`s active during staging) never getting recompiled for this
  specific material through the normal path, not anything in the source data or GLSL logic.
- Test infra: `verify_site2` (port 8403, `python3 -m http.server 8403` from
  `/tmp/claude-1000/-home-red1-bim-compiler/2a545224-.../scratchpad/verify_site2`, symlinked to
  `/tmp/wt-triplanar-metal-cast/viewer`) — restart the server if the port's not listening
  (`ps aux | grep 8403`). Every probe script referenced above lives in this session's scratchpad
  (`8929c17e-...../scratchpad/probe_*.js`, `witness_*.js`) — reuse the pattern (isolate via
  `setVisibleAt`, raw `A.renderer.render()` per differential test, `A.startStillRefine()` +
  `_stillRefineBusy===false` wait for the real converged case) rather than rebuilding from scratch.
- User's standing instruction, unchanged: "if u say near black, that is rejected" — this must
  resolve to a real, understood, FIXED mechanism or a clearly-still-open item, never a write-off.

The findings below (§1-4) are from earlier sessions the same day and are unrelated to this open
item — already fixed/parked, do not re-open.**

### Fixed / verified earlier this session (real evidence, not assumed)
1. **Reflection tuning (envInt) — DONE, LIVE, verified on `origin/main`.** 27 STD_MAT classes
   exempted from Alt+S's ×3 reflection boost, beam/railing at `envInt:0`, 25 others at `0.05`.
   `streaming.js?v=61`, `sw.js` `v1031`+. This was correct and complete for what it targeted
   (sky-reflection strength) — it was never able to fix the other two bugs below, which are a
   different layer (base colour data, and a separate texture-multiply effect).
2. **§HOSPITAL_META_DB_STALE (data bug) — fix built + verified LOCALLY, NOT DEPLOYED.**
   `Hospital_meta.db`/`Hospital_geo.db` (the split files the live viewer actually streams) are
   dated 2026-06-04/05 — 2 months older than the current combined source, which already has real
   colour for classes the split copy is missing (confirmed class-by-class: `IfcBeam` 0/1970 in the
   stale split vs 1970/1970 in the current combined source; same pattern for `IfcPipeSegment`,
   `IfcDuctSegment/Fitting`, `IfcFireSuppressionTerminal` — all 0% in the stale split, 100% in the
   current source). Regenerated via the existing `scripts/split_db.sh` into `/tmp/split_test/`
   (Hospital_meta.db/geo.db/positions.bin) — confirmed live: the same beam's
   `mesh.material.color` goes from wrong `8c9199` (STD_MAT's grey fallback) to correct `ebe6d9`
   (matches the real `0.920,0.900,0.850`). **Not yet uploaded to the live OCI bucket — needs an
   explicit go-ahead before touching production, per this project's PRIME RULE. User has not yet
   said go.** Audited other split buildings the same way: Terminal is fine (its split is newer
   than its source); Clinic's split file is old by date but its actual colour coverage checked out
   complete for the classes inspected; HHS_Office_Federated doesn't use split mode locally.
3. **§TRIPLANAR_METAL_CAST (a second, separate code bug, Alt+S-only) — fix built, NOT committed,
   NOT deployed.** The triplanar system (Layer 3, "8 distinct triplanar materials" — that phrase
   traced to a real 2026-07-15 witness count, archived in
   `prompts/archive/PHOTOREAL_STILL_RENDER_full_history_2026-07-15_to_2026-08-11.md` line 236, not
   a designed 8-material system) multiplies a real photographed texture onto every metal/
   concrete/plaster-class element's colour, Alt+S/Alt+G only. Measured the 3 actual texture files
   directly: concrete is exactly grayscale (no bug possible), plaster is ~2% off (negligible), but
   **`metal_color_1k.jpg` has a real, systematic per-channel cast** (mean RGB `0.4901, 0.5353,
   0.5784` — B 18% above R) that the old scalar `normFactor` (a single brightness number) never
   corrected, and the metal group's contrast-boost (1.9×, the strongest of the 3 groups) then
   amplified that cast — dulling/cooling ANY colour under it (real or STD_MAT fallback alike) only
   during staging. **Fix:** replaced the scalar `normFactor` with a per-channel `normFactorRGB`
   (measured inverse means: metal `[2.0406, 1.8679, 1.7290]`) so the multiply is a true identity
   `(1,1,1)` on average for any colour, only real grain survives. Built in worktree
   `/tmp/wt-triplanar-metal-cast` (branch `fix/triplanar-metal-color-cast`, off `origin/main`
   `77f8234`) — 3 files touched in `viewer/streaming.js`: the `_TRI_CONCRETE`/`_TRI_PLASTER`/
   `_TRI_METAL` definitions, the `_triNorm` construction (now a `THREE.Vector3`), and the shader's
   `uniform float uTriNorm` → `uniform vec3 uTriNorm`. **Verified two ways:** (a) live uniform
   read post-fix, no pixel sampling: `uTriNorm = [2.0406, 1.8679, 1.729]`, exact match, no NaN, no
   shader compile error (`gl.getError()==0`); (b) real pixel test, the beam, both with its correct
   real cream colour AND with the grey STD_MAT fallback, wide non-crevice pose, 717 confirmed
   on-target samples each: Alt+S comes out hue 0-5° (warm/neutral) in BOTH cases — no longer
   bluish either way. **NOT yet committed, NOT a PR, NOT deployed — user's explicit instruction
   this session: "I rather u do not fix that [extraction] script" (item 4 below) but this
   triplanar fix was explicitly confirmed wanted ("the red is confirmed then fix the alt-s
   effect... the grey is also confirmed fallback then treat similar not bluish") — this one IS
   meant to ship, just hasn't been committed/PR'd/deployed yet.**
4. **Extraction-script gap — found, root-caused, EXPLICITLY PARKED, do not touch without new
   instruction.** `DAGCompiler/python/extractIFCtoDB.py`'s `get_colour_for_element()` (the actual
   function that builds a building's combined source DB from its real IFC — confirmed this is the
   one, not `tools/extract.py` which builds a different Rosetta-reference DB) only reads colour via
   direct per-instance geometry styling (`IfcStyledItem`/`StyledByItem` on the geometry itself) —
   it never reads colour via material ASSOCIATION (`IfcRelAssociatesMaterial` → the material's own
   defined render colour), which is how Revit typically colours structural elements ("this beam's
   material is Steel, Steel has a colour"). Real numbers, multiple buildings, not just Hospital:
   | building | class | has colour / total |
   |---|---|---|
   | Hospital | IfcBeam | 0 / 1,970 |
   | Terminal | IfcBeam | 432 / 432 |
   | Terminal | IfcColumn | 122 / 158 |
   | Terminal | IfcMember | 312 / 442 |
   | LTU_AHouse | IfcBeam | 819 / 1,144 |
   | LTU_AHouse | IfcColumn | 1,365 / 1,785 |
   | LTU_AHouse | IfcMember | 2,283 / 2,349 |

   Hospital is total (0%) because its source IFC apparently has zero redundant per-instance
   styling for these classes; Terminal/LTU are partial (70-97%) because their exports happen to
   carry some redundant styling the buggy function can still pick up. **User's explicit ruling
   this session: do NOT fix this now** ("I rather u do not fix that script as i fear it is
   pivoting and drifting") — parked, not touched, not re-opened without new instruction. If ever
   revisited: fixing means re-running full IFC extraction (the function takes a live `ifcopenshell`
   element, not a `.db` row) against the ORIGINAL source IFC — not a `.db`-side patch — and a
   partial "colour-only" re-run mode vs a full geometry re-extraction was never confirmed to exist,
   check before assuming either is cheap.

### §RED_GREY_MYSTERY — ROOT CAUSE FOUND 2026-08-15 (5th session same day), FIX NOT YET WRITTEN
**Both named candidate causes from the prior session (stale AO depth-prime, AO/shadow-restore
per-pixel bug) are RULED OUT by direct test — the real mechanism is a THIRD thing, deeper than
either guess: a genuine geometry-data defect (zero-magnitude vertex normals) on this specific
element's own mesh, unmasked by staging's lower light levels.** Full chase, in order, each step
empirically tested (not guessed) on `verify_site2` (fixed data + fixed triplanar code, port 8403,
worktree `/tmp/wt-triplanar-metal-cast`) — reuse the same 8 probe scripts in
`/tmp/claude-1000/-home-red1-bim-compiler/8929c17e-.../scratchpad/probe_*.js` if this needs
re-verifying rather than re-deriving:

1. **Methodology hole found in the PRIOR session's own isolation test**, before ever reaching the
   two named candidates: `witness_isolated_red.js` hides every other scene *mesh* but the target
   (`0HuLVU0hf5gxwY8y9yDvc0`, an `IfcValve`) is drawn by a `BatchedMesh` (id 3365) holding **92
   elements in one shared buffer** — hiding "every other mesh" left all 91 neighbours in the SAME
   batch fully visible and able to occlude/shadow the target. `mesh.setVisibleAt()` was never
   called. Fixed with true single-slot isolation (`setVisibleAt(i, false)` for all 91 others) —
   **made no measurable difference** (729→729 black px), so this hole didn't change the verdict,
   but it means the original "zero possible neighbour occlusion" claim was never actually true and
   should not be trusted at face value again without checking `setVisibleAt` support first.
2. **Both prior-session candidate causes are wrong.** Toggling `A._sunShadowRestoreEnabled`,
   `A._stillAOAdapter.enabled`, and `A.sun.castShadow` (+ a 20× bias diagnostic) all independently
   made **zero difference** to the black-pixel count, once tested correctly (see next point) — N8AO,
   the shadow-restore blend, and the sun shadow map are all innocent.
3. **Real methodology trap hit mid-session, worth recording for next time**: the very first round
   of "toggle X, call `A._composer.render()` once more, resample" tests all came back suspiciously
   *identical* — including swapping the element's material for flat-white `MeshBasicMaterial`,
   which should have looked nothing like the real material but read the exact same RGB. Cause:
   `A._composer.render()` after `startStillRefine()` has converged doesn't give a fresh single-sample
   frame — TAA's `accumulate=true` buffer is 16-deep, so one more call only blends ~1/17 of a new
   sample into 16/17 of old history. Every "no difference" conclusion from that first round was
   **unverified, not disproven**. Fix: bypass the accumulator entirely — raw `A.renderer.render(A.scene,
   A.camera)` — for every differential test from that point on. (This also cleanly excludes AO and
   the shadow-restore blend from raw-render results *by construction*, since both are composer-only
   passes — independently reconfirming point 2 for those two.)
4. **Redone properly (raw render, single frame, no accumulation): sun shadow off, triplanar off
   (`uTriActive=0`), and `envMapIntensity=0` — still zero difference** (725/725/727 black px,
   baseline 725). Batch-neighbour occlusion, AO, shadow-restore, sun shadow, triplanar, and env
   reflection are now ALL independently ruled out by direct measurement, not inference.
5. **Unlit `MeshBasicMaterial` swap via raw render (the first *reliable* version of that test):
   ZERO black pixels, full coverage.** This proves the geometry itself has no gaps/holes at this
   camera pose — rules out mesh completeness and (combined with `mat.side` already being
   `THREE.DoubleSide`, confirmed live, not `FrontSide`) rules out backface culling too.
6. **Direct in-shader probe of `diffuseColor.rgb` right after `#include <color_fragment>`
   (pre-lighting): ZERO black pixels.** The base albedo (no `map`, no `aoMap`, no vertex-colour
   attribute — confirmed, `geometry.attributes` is only `position`+`normal`) is completely healthy
   everywhere. The defect is proven to live specifically in the **lighting stage**, which is the
   one stage that depends on the surface normal.
7. **Direct in-shader probe of `length(normal)` right after `#include <normal_fragment_maps>`**
   (the same `normal` variable `lights_physical_fragment` uses, confirmed from the actual
   `three.module.min.js` chunk source — no normal/bump map on this material, so `_maps` is a
   no-op and `normal` at this point is exactly `normalize(vNormal) * faceDirection` from
   `normal_fragment_begin`, which is mathematically guaranteed to be unit length unless the
   source is degenerate): **734/1681 sampled pixels read a clean ~1.0 length; the other 947 read a
   scattered, non-clustered spread from ~0.39 to ~0.95** — not a physically real distribution for a
   post-`normalize()` vector (floating-point noise would cluster near 1.0, not spread continuously
   down to 0.39). Consistent with `normalize(vec3(0))` → NaN at some vertices, then NaN propagating
   through interpolation and getting written to the 8-bit framebuffer as an inconsistent small value
   per pixel (undefined-but-typically-low GLSL→u8 NaN conversion behaviour), not a genuine geometric
   normal length.
8. **Confirmed directly in the raw geometry buffer (CPU-side, no shader involved):** this element's
   own `BatchedMesh` slot (`getGeometryRangeAt(48)` → `vertexStart=64168, vertexCount=37880`,
   bounding sphere radius 0.51 — matches the valve's real size, so this is genuinely this element's
   own dense ~16,420-triangle mesh, not shared/padding data) contains **24 vertices with a raw
   `normal` attribute magnitude near zero** — real mesh data, not inert padding (checked: their
   `position` values are small, in-range local coordinates on the valve's actual surface, e.g.
   `[0.143, -0.387, 0.178]`, not origin/garbage). That's 24 of the 51 total degenerate-normal
   vertices found across the *entire 92-element batch* concentrated on this ONE valve instance —
   this specific element's tessellation is unusually bad, not a universal per-vertex background
   noise rate.
**Verdict:** this is a **real, previously-undiagnosed 4th bug** — a geometry-generation defect
(zero-magnitude vertex normals on specific curved/detailed elements, at least this valve) that
produces literal `[0,0,0]` fragments through ordinary NaN propagation in standard PBR lighting.
It is NOT caused by AO, shadow, triplanar, envMap, or batch-neighbour occlusion (all independently
disproven above), and it is NOT "near black is just how ambient light works" — per the user's
standing instruction ("if u say near black, that is rejected"), this is not being written off:
it's a confirmed, mechanistically-understood defect with a named data location, just not yet
patched. It surfaces specifically under Alt+S staging (not plain nav) because staging's much lower
overall light level (`toneMappingExposure` 0.3825 vs nav's 0.45, dusk sun at 6° elevation) is
what pushes the NaN-corrupted fragments' *effective* darkness over the threshold where a viewer
would notice — plain nav's brighter, higher-exposure lighting was very likely masking the exact
same defect as an unremarkable slightly-dim patch, not a genuine absence of the bug.
**Not yet done, next session or on go-ahead:**
- No fix has been written. The likely fix shape (NOT yet verified/built): detect
  near-zero-magnitude normals at geometry-load time (either in the extraction pipeline,
  `DAGCompiler/python/extractIFCtoDB.py`, or as a viewer-side self-heal on the `normal`
  BufferAttribute after streaming) and replace them with a recomputed face normal (cross-product of
  the triangle's edge vectors) instead of the degenerate stored value — needs its own witness
  before shipping, not assumed correct from this diagnosis alone.
- Only ONE element (`0HuLVU0hf5gxwY8y9yDvc0`) was chased to full root cause. Whether other
  elements/buildings carry the same defect at a rate that matters for the ORIGINAL "red/grey dark/
  bluish" user complaint (as opposed to being a rare, easy-to-miss edge case) is unmeasured — the
  extraction-script gap (item 4, above, explicitly parked) is a separate, already-understood issue
  and should not be conflated with this one.

### Test infrastructure left running/available, reuse don't rebuild
**⚠ RETIRED 2026-08-16 (post-§TRINORM_LINEAR):** verify_site2 (8403) server stopped and
`/tmp/wt-triplanar-metal-cast` pruned (branch fully pushed+merged, clean) — the mystery they
existed for is solved. Still standing: `/tmp/wt-sandbox` (8399). This session's probes/witnesses
+ logs: scratchpad `aa515841-…/scratchpad/`. Historical list below kept for the probe-script
pattern references only.
- `/tmp/wt-sandbox` (port 8399) — standing sandbox, STALE Hospital data, unfixed code — baseline/
  regression reference.
- `/tmp/split_test/` — regenerated Hospital_meta.db/geo.db/positions.bin, correct colour data,
  not yet uploaded anywhere.
- `/tmp/wt-triplanar-metal-cast` (git worktree, branch `fix/triplanar-metal-color-cast`) — the
  triplanar per-channel fix, uncommitted.
- Scratchpad `verify_site/` (port 8402, fixed data + unfixed code), `verify_site2/` (port 8403,
  fixed data + fixed code), `verify_site3/` (port 8404, stale data + fixed code) — the 2×2 combos
  used to isolate which fix caused which effect. `witness_isolated_red.js` there is the
  hide-everything-else isolation harness — reuse it for the mystery above, don't rebuild it.

### Methodology lessons, hard-won this session — apply immediately, don't re-learn
- **Never call `A.renderer.render()` yourself to "sample" after Alt+S has already converged** —
  that bypasses the composer's real AO/TAA output and silently re-renders a plainer frame than
  what's actually on screen. Read the canvas exactly as the app's own internal loop left it
  (no extra render call) for any post-convergence sample.
- **An automated "pick the camera offset with the most raycast hits" pose-selector is biased
  toward bad poses** — close-up/crevice angles maximize on-screen coverage (more hits) but also
  maximize AO/shadow crushing. Don't reuse that heuristic without capping minimum distance or
  checking the result isn't degenerate.
- **Isolating a target by hiding everything else removes occlusion ambiguity but may introduce ITS
  OWN artifact** (see candidate cause 1 above) — don't trust an isolated-element result at face
  value without checking whether AO/depth state was correctly re-primed for the new (empty)
  scene.
- **`mesh.material.color.getHexString()` (a direct property read) is far more reliable than pixel
  sampling for verifying base colour assignment** — reach for it first; pixel sampling is only
  needed to check what LIGHTING does to that colour, and even then a large flat surface (a beam)
  samples far more reliably than a small, tightly-packed element (a coupling/valve).

## §HOSPITAL_META_DB_STALE — supersede notice
The block below (§HOSPITAL_META_DB_STALE, originally written earlier the same day) is now folded
into the numbered list above — kept in place for its full diagnostic detail (DB timestamps, exact
queries) rather than duplicated, but its resume-first status is superseded by the block above.

**§HOSPITAL_META_DB_STALE — REAL ROOT CAUSE FOUND 2026-08-15 (3rd session same day, user: "That
red metal even up close does not look red at all. Bluish railings and beams still there.") — THIS
is why the envInt/reflection work below never fully closed the complaint. Read this block FIRST,
before the reflection-tuning history below — that work was real and correct but was fixing a
SECOND, smaller effect on top of this larger, primary one.**

- **Root cause, proven not guessed:** `buildings/Hospital_meta.db` + `Hospital_geo.db` (the
  split-DB pair the live viewer actually streams from — confirmed via `§CACHE_WRITE_OK
  Hospital_meta.db` in a real session log, even when the URL param requests
  `Hospital_extracted.db`, the split-detect logic silently prefers meta+geo when present) are
  **dated 2026-06-04/05 on disk** (`ls -la --time-style=full-iso`). `Hospital_extracted.db` —
  the single combined source DB — is dated **2026-08-03**, almost 2 months NEWER. The split was
  never regenerated after whatever pass added/fixed real `material_rgba` values in the extracted
  DB. Direct query, stale `Hospital_meta.db` on disk: **56,751 of 63,415 elements (89.5%) have
  `material_rgba IS NULL`, including 1,970/1,970 IfcBeam (100%) and most IfcRailing.** The CURRENT
  `Hospital_extracted.db` has real, correct, warm-cream colour (`0.920,0.900,0.850`) for every one
  of them — confirmed via direct `sqlite3` query against the file, not the app.
- **This is why beam/railing never actually looked right despite the envInt=0 fix below:** with
  `rgbaStr` null, `streaming.js`'s `_getMaterial()` correctly (and separately, not a bug) falls
  back to the class default `STD_MAT.IfcBeam = { r:0.55, g:0.57, b:0.60, ... }` — a **cool
  blue-grey "generic steel" placeholder**, `b` slightly the dominant channel — that IS the blue the
  user kept seeing. The envInt work fixed the SKY-REFLECTION contribution correctly; it was never
  able to fix the BASE ALBEDO because the base albedo data itself never reached the deployed file.
  Live-confirmed the material itself, not just the DB: real GPU witness against a real beam
  (`3PPIAPsErEhBLQrdgjAPap`, `meshId=626, instanceIndex=2`) on the stale meta.db —
  `mesh.material.color.getHexString()` = `8c9199` = `[140,145,153]`, an EXACT match for
  `STD_MAT.IfcBeam` converted to 0-255 — proof positive it's the null-fallback, not a rounding or
  reflection artefact.
- **Fix regenerated and verified locally, NOT yet deployed (needs explicit go-ahead — this
  touches the live OCI bucket, `PRIME RULE` production boundary):**
  `scripts/split_db.sh` (bim-compiler, already existed, does the right thing — `.clone` + drop
  geometry tables, no rewrite of `elements_meta`) re-run against the current
  `Hospital_extracted.db` in an isolated `/tmp` copy. Regenerated `Hospital_meta.db`: **63,917/
  64,150 elements (99.6%) now have real `material_rgba`**, all 1,970 IfcBeam included, confirmed
  `0.920,0.900,0.850` intact. Live GPU witness against the REGENERATED files (served from an
  isolated scratch dir, shared `~/bim-ootb` checkout untouched — the auto-mode classifier
  correctly blocked writing into that shared tree, worked around by staging in
  `scratchpad/verify_site/` instead, symlinking `viewer/` read-only): same beam,
  `mesh.material.color.getHexString()` now `ebe6d9` = `[235,230,217]` — **exact match to the true
  DB colour.** Root cause fixed at the data level, verified by rendering, not assumed.
- **Residual, small, EXPECTED effect, not a bug — don't re-chase:** even with the correct warm
  base colour, the SAME beam's actual rendered pixel in ambient-only shadow (no direct sun, this
  session's now-familiar camera-below-looking-up pose) still reads mildly cool
  (`[94,101,113]`, B the highest channel) — because the scene's native `THREE.HemisphereLight` sky
  colour is genuinely `0xb0c4de` (light steel-blue) and this surface has no direct sun on it. This
  is the SAME class of effect as §PHOTO_METAL_BLUE_TINT's ambient-only-shadow finding below,
  correctly proportioned, real physics, not a data bug — the difference now is the base colour
  UNDER that shadow tint is correct cream, not a wrong cool-grey to begin with.
- **Not yet done, real next steps if this is picked up again:**
  1. **Deploy the regenerated `Hospital_meta.db`/`Hospital_geo.db`/`Hospital_positions.bin` to the
     live OCI bucket** (`deploy/OCI_UPLOAD.md` §RULES — remember `--content-type` on every object)
     — this is the actual fix reaching the user; everything above is proven but inert until this
     ships. Regenerated files currently sitting in `/tmp/split_test/` (this machine only, not
     committed — per the DB-changes doctrine, these are never git/LFS).
  2. **Audit every OTHER split-mode building for the same staleness** (`Terminal`,
     `HHS_Office_Federated`, `Clinic`, any building shipping a `_meta.db`+`_geo.db` pair) — compare
     `_extracted.db` mtime vs `_meta.db`/`_geo.db` mtime, re-split any that are behind. Not checked
     this session, Hospital was the only one investigated (it's what the user was actually
     looking at).
  3. **The general-rule question (user asked directly, "why can't all this be as a general
     rule?"): make staleness structurally impossible, not a thing to remember.** Concrete options,
     not yet built or decided: (a) a pre-deploy check that fails loudly if `_meta.db`/`_geo.db` are
     older than their source `_extracted.db`; (b) fold `split_db.sh` as a mandatory last step of
     whatever pipeline writes/patches `_extracted.db`'s `material_rgba`, so a split file can
     structurally never exist without its source's latest data; (c) drop the split optimization
     for the metadata table specifically (keep geometry split, since that's the actual size win)
     so `material_rgba` always comes from a single always-current source. Worth deciding, not
     invented/chosen here.

## §PHOTO_METAL_BLUE_TINT — reflection-only history, real and shipped, but NOT the full story (see block above)
**§PHOTO_METAL_BLUE_TINT — MOSTLY CLOSED 2026-08-15, resume here first if the user reports ANY more
"still blue/bluish/dark" complaint on beams/railings/pipes/ducts/MEP devices.** Session chased a
single root cause across 5 shipped PRs (#1367, #1369, #1371, #1370, #1373) on bim-ootb — do NOT
re-diagnose from scratch, read this block first.

- **Root cause (confirmed, code-grounded):** metal/glossy materials reflect the scene's sky
  environment map (physically real — same as any polished surface reflecting its surroundings), and
  a SEPARATE Alt+S/Alt+G-only pass (`_reassertPhotoMatBoost`, effects.js) blindly multiplied that
  reflection strength x3 (+ tightened roughness x0.4) on every metal/glossy material with zero
  awareness of a per-class tuning (`STD_MAT[...].envInt`, streaming.js) that already existed to fight
  this exact effect on 4 classes. Non-null (real, authored) IFC colors were NEVER touched — verified
  repeatedly, `if (!rgbaStr && stdMat)` gates all hue changes; only the REFLECTION STRENGTH (a
  physical/rendering setting) is shared per-class regardless of null status, which is correct
  (a red-painted beam and a grey one reflect light identically in reality).
- **Current shipped state, VERIFIED BY READING `origin/main`'s RAW FILE CONTENT directly (not just
  `gh pr view` merge status — see the landmine below on why that matters):**
  - 27 STD_MAT classes (all structural-steel + MEP: beam/member/plate/pipe*/duct*/cablecarrier/
    flow*/valve/alarm/fireSuppressionTerminal/lightFixture/sanitaryTerminal/airTerminal/
    energyConversionDevice/electricAppliance/buildingElementProxy/transportElement) are now
    `_photoEnvExempt` — the Alt+S/Alt+G triple-boost pass skips them entirely.
  - `IfcBeam` and `IfcRailing` specifically: `envInt: 0` (zero sky reflection, pure albedo) — direct
    user request ("get rid of those railings and overhead beams from been recolorized").
  - The other 25: `envInt: 0.05` (was 0.6 uncapped → 0.18 → 0.05, three successive tightening passes
    this session, each user-driven: "still blue" → cut further → cut further again).
  - `viewer.html`: `streaming.js?v=61`. `sw.js`: `CACHE_VERSION = 'v1031'`.
  - Glass (`IfcCurtainWall`, `IfcWindow`) deliberately left alone — full reflectivity there is the
    wanted glint effect (§PHOTO_HOTSPOT), never reported as a problem.
- **Real numeric test, not a screenshot (this session's own GPU witness, Hospital, real streamed
  geometry, real Alt+S convergence, camera at a real beam's exact DB-recorded position, Level 4):**
  709 non-metal sample pixels R=96.1 G=88.1 B=89.0 (blue LOWER than red/green); 191 metal sample
  pixels R=119.1 G=116.7 B=117.4 (blue essentially neutral, -0.5). **Caveat: this test ran BEFORE the
  final #1373 fix (beam/railing→0, +13 recovered MEP classes) was confirmed on `main`** — it's real
  evidence the mechanism works, not a post-#1373 re-verification. Re-run it first if picking this back
  up, using the SAME method (raycast-grid + `gl.readPixels`, bucket by real `material.metalness`, not
  visual inspection) before touching any more code.
- **HARD LESSON, apply to every future PR here or anywhere else on this project:**
  `gh pr merge --auto --squash` can lock the squash content to whatever the branch HEAD was when
  checks passed — pushing MORE commits to that same branch afterward does NOT reliably get included,
  even though `git push` succeeds and the branch shows the commits. This bit this session TWICE: PR
  #1371's second commit (13 MEP classes + a version bump) silently never landed despite being pushed
  and the PR showing MERGED — only caught because the user kept reporting the exact symptom that
  commit was supposed to fix, and only proven by reading `origin/main:viewer/streaming.js` directly
  (`git show origin/main:<path>`), not by trusting `gh pr view --json state,mergedAt`. **Going
  forward: push ALL intended commits to a branch BEFORE enabling `--auto`, and after any merge,
  verify by reading the actual file content on `origin/main`, never just the merge/PR state.**
- **Ambient/hemi fill — RE-INVESTIGATED 2026-08-15 (second session same day), verdict CHANGED from
  "not yet coded" to "measured, understood, NOT a color bug, decision needed before any fix":**
  the entry below this one (as originally written) guessed the cause was `PHOTO_HEMI_SKY_COLOR`'s
  cool-violet HUE (a photo-staging-only tint). **That guess is now falsified by a real numeric
  witness** (raycast-grid + `gl.readPixels`, same convention as the reflection witness above,
  GPU `ANGLE (NVIDIA RTX 4060)`), and the true mechanism is broader and simpler:
  - **Target: a real Victaulic Grooved Coupling, Hospital Level 5, guid
    `0HuLVU0hf5gxwY8y9yDwsP`, confirmed non-null real IFC color `0.843,0.137,0.102` (hex `d7231a`,
    255-scale `[215,35,26]`, true luminance 72.6).** Confirmed via `mesh.material.color` read
    directly off the live `THREE.InstancedMesh` (not the DB) that the material IS exactly this
    color — the color pipeline is NOT the bug, ruled out first.
  - **This happens in PLAIN NAV, before any Alt+S/photo staging runs at all** — so it is not a
    dusk-mode-only issue. Camera posed realistically (looking up at the ceiling-mounted fitting
    from ~1.2m below, the way a person actually sees it, not a straight-down macro shot — a
    straight-down pose was tried first and hit a specular hotspot artifact instead, a dead end
    worth skipping next time). 127 confirmed on-target pixels (guid-matched via raycast, not
    guessed): rendered median RGB `[77,13,12]`, luminance **26.5 — 36.5% of the true 72.6.**
  - **Control sample, same session: a nearby neutral/light-grey Victaulic Elbow on the SAME pipe
    run** (guid `0HuLVU0hf5gxwY8y9yDwsQ`, same camera offset, same method, 181 confirmed pixels):
    real material colour (read from the live mesh, not the DB — a separate, uninvestigated
    discrepancy exists between this element's DB `material_rgba` `0.920,0.900,0.850` and its
    rendered material `9499a1`/`[148,153,161]`, not chased further this session, flagged below)
    luminance 152.5 → rendered luminance 63.5, **41.6% of true.**
  - **Verdict: the red joint's 36.5% and the grey elbow's 41.6% are the same ballpark — this is
    UNIFORM ambient-only shading, not a red-specific or colour-specific darkening.** This renderer
    has no bounce/GI; a surface with no direct sun on it is lit by ambient+hemi fill alone, and at
    native (non-photo) intensity that fill leaves ~37-42% of true albedo luminance, for ANY colour.
    The reason a RED joint specifically reads as "gone black" while a grey one still reads as "a
    visible dim grey" is arithmetic, not a bug: red's OWN true luminance is already low (72.6, vs a
    near-white's 200+) because luminance is G-dominated (`Y=0.2126R+0.7152G+0.0722B`) and a
    saturated red has almost no G. The same proportional cut that leaves grey at a legible 63.5
    pushes red down to 26.5 — indistinguishable from black to a viewer, even though nothing
    singled red out.
  - **What this means for a fix, and why none was applied this session:** the earlier hypothesis
    ("ambient/hemi COLOR is the next lever") is retired — it's INTENSITY/no-GI, not hue. A global
    ambient/hemi intensity boost is the obvious lever, but §MOVIE_SHADOW_TM and
    §PHOTO_CONTRAST_DIALBACK elsewhere in this file are a direct prior instance of exactly that
    lever being tried and REVERTED because it flattened shadow/spotlight contrast — re-pulling it
    without a narrower, colour-legibility-only mechanism (e.g. a small shadow-side luminance floor
    scoped to real/non-null saturated colours only, leaving the global fill and shadow contrast
    untouched) risks re-breaking what that revert fixed. **This is a real product decision (accept
    physically-correct-but-perceptually-black shadow rendering, vs. spend a narrow fix on
    legibility) — not something to invent unilaterally.** Not yet asked/decided as of this entry.
  - **Loose thread, not chased:** the grey elbow's rendered material (`9499a1`) doesn't match its
    own DB `material_rgba` (`0.920,0.900,0.850`) at all — that element streams via the `BatchedMesh`
    path (bucketed by `[storey,disc,rgba]`), and the mismatch wasn't root-caused this session (ruled
    out one candidate: the "§S260d near-white taming ×0.92" rule doesn't apply here, `b=0.850` is
    not `>0.85`). Separate from the red-joint investigation above; flagging so it isn't lost.
  - Witness scripts (not committed, scratchpad only):
    `witness_indoor_red_darkening_v3.js` + `witness_reference_grey_v2.js`, both against the standing
    `/tmp/wt-sandbox` (localhost:8399) — reusable if this is picked up again, same GUIDs/offsets.
  - **Follow-up same session, user pushback ("it's a bright area, why completely not red — investigate
    harder"): three more real tests, one dead-end honestly retracted.**
    1. **Colour-assignment audit, 6 more real red elements, both code paths:** every one checked —
      `IfcPipeFitting` Tee/Coupling variants (InstancedMesh) and `IfcValve`/
      `IfcDistributionControlElement` (BatchedMesh, guids `0HuLVU0hf5gxwY8y9yDvc0/vcG`,
      `2NvWEO1Wb9Jwl21EQJp70a`) — every single one has the CORRECT material colour
      (`d7231a`/`ff0000` matching their real DB `material_rgba` exactly). **No red-colour-assignment
      bug exists on either streaming path.** (The one mismatched element found earlier, the grey
      Elbow rendering `9499a1` instead of its true cream `0.920,0.900,0.850`, does NOT generalize to
      reds — still an open, unexplained, separate loose thread, not chased further.)
    2. **Dead end, tried and RETRACTED — do not re-chase:** added a synthetic `new
      THREE.PointLight(0xffffff, 100000, 0, 1)` right next to the same red coupling and re-rendered —
      ZERO pixel change, even at absurd intensity, even on a plain (non-instanced) `THREE.Mesh`
      (the ground plane), even after forcing `material.needsUpdate`/`A.markDirty()`/a second render
      call. `renderer.info.programs.length` DID increase (16→21, proving a shader recompile for the
      new light count genuinely happened) yet the pixel still didn't move — looked at first like a
      real "point lights don't illuminate this scene" engine bug. **Falsified by the next test below
      — this was a test-harness artifact (most likely a camera/target-positioning mismatch in the
      ad-hoc probe, never root-caused further since a working alternative existed), not a real bug.
      Do not report "point lights don't work" from this project's own history — it's wrong.**
    3. **Decisive real-mechanism test: `A.toggleNightMode()`** (the actual shipped fixture-glow
      code path, not a synthetic light — `§NIGHT_MODE on fixtures=1286 ... glowMats=8`,
      `nightLights=30` real point lights added) **on the SAME red coupling, same camera pose:
      luminance 26.5 → 81.9 (3.1x), RGB `[77,13,12]`→`[174,58,47]`, staying clearly red/warm-toned
      throughout.** Proves the shipped lighting mechanism works correctly end-to-end on this exact
      element — a real nearby light source DOES correctly restore visible red brightness. This is
      why the point-light dead-end above was retracted rather than reported.
    - **Net effect on the earlier verdict: unchanged, now on firmer ground.** The material and the
      real lighting mechanism both check out correct. What remains is exactly what the first pass
      found: ordinary ambient-only shadow (no direct sun, no nearby active light) reads at ~37-42%
      of true luminance for ANY colour, and saturated red's low baseline luminance means that
      ordinary dimming crosses into "looks black" territory sooner than it would for other colours.
      If the user's "bright area" report was Alt+S/G dusk mode or plain daylight nav with NO nearby
      active light source on that specific element, this is that same, already-measured effect —
      not a new bug. If a future report is pinned to a moment where a real nearby light IS on (night
      mode, fixture glow, camera fill-light) and the element still doesn't recover, THAT would be a
      genuinely new lead worth its own witness — not yet observed this session.
  - **No true indoor/outdoor occlusion for the env-map reflection** — every material's `envMap` is the
    SAME global sky capture regardless of whether that surface can actually see the sky (an indoor
    pipe "reflects" the exterior sky through the walls). This session mitigated it by crushing
    reflection intensity near-zero on the affected classes rather than fixing the underlying
    architecture (no per-element or per-pixel occlusion test feeds the env map). Cheap enough for now
    that this may never need real fixing, but it's the honest root cause if intensity tuning alone
    ever stops being enough.
- **Explicitly ruled out / do NOT revisit:** Hospital's pipe/duct classes are ~100% real (non-null)
  IFC color, mostly a generic Revit default (`0.920,0.900,0.850`, confirmed via direct DB query,
  36,331 elements share this exact value) — proposed treating that default as equivalent-to-null so it
  could get real trade colors like HHS's null elements do; **user ruling: "NO CHANGE!!!" — Hospital's
  extracted data is not to be touched, full stop, this door is closed.**
- **Colour-swap system (separate from the reflection bug above, unaffected by any of this session's
  fixes, already correct going in) — for when a piece has genuinely NO IFC colour:** name-match first
  (`A._mepNameHint`, streaming.js) — duct→grey, sprinkler/groove/coupling/victaulic→orange (FP),
  diffuser/grille/exhaust→red (ACMV), dwv/sanitary→magenta (SAN), pipe→purple (PLB), light/sconce/
  lamp→yellow (ELEC); falls back to the discipline column (`A.DISC_COLORS`) if no name match — HHS's
  unlabelled MEP is flat `"MEP"` discipline → green; only truly unclassifiable pieces (no name match,
  no discipline) land on the flat blue-grey `STD_MAT` default. Real, non-null colours are NEVER
  touched by any of this — confirmed and reconfirmed multiple times this session.

Other open threads, all below in full detail:
0. **§WEATHER_ADVANCED_MODE** — SPEC ONLY, no code. Opt-in bake-only weather (the Twinmotion/Lumion
   parity ask). Most of the machinery is already shipped; start at the Phase 1 overcast preset, not
   at clouds. Flagged against the schedule-accuracy-first ruling — a decision, not a queued task.
1. **§LTU_FLOOR_FLICKER** — MaxQ bake floor flicker on `LTU_AHouse`. Mechanism-confirmed
   (transparent-sort instability, ghost-ground × x-ray-staging), NOT pixel-proven, NOT fixed.
2. **§SHADOW_FRONTIER** — shadows on in-progress/ghosted construction elements during a MaxQ bake.
   Mechanism traced, no code bug found (unlike the sun-arc bug below), genuinely needs live
   evidence next. **User ruling 2026-08-11: not serious, nice-to-have only if free — don't burn a
   session on it.**
3. **§PHOTO_AO_TUNING / §PHOTO_AO_SCALE / §PHOTO_AO_EDGE** — CLOSED 2026-08-13. The N8AO
   ambient-occlusion fold went too dark → far bright/up close dark → no visible edge/corner shadow,
   across 3 same-day rounds. Three fixes SHIPPED (bim-ootb PR #1331 flat retune + denoise bump,
   #1334 screenSpaceRadius distance-scale fix, #1335 intensity 2→4) plus a real SW precache
   staleness bug found+fixed along the way (PR #1332) and a related night-PointLight near-field
   fix (#1336, decay 1.5→1.0). **Correction (2026-08-13): PR #1337 is NOT part of this chain** —
   checked live via `gh pr view 1337`, it's `§GLOW_LENS_SOFT_EDGE`/`§GLOW_LENS_SHAPE_FIT` (fixture
   glow quad softening in `effects.js`, merged 2026-08-12T19:48Z), unrelated to N8AO. Previously
   miscited here as a 4th AO fix — fixed, don't re-cite it against AO work. **User confirmed live,
   real bake MP4 (Clinic): "much better," and Alt+G+Night nav "amazing."**
4. **§SUN_SHADOW_DROWNED — shipped part CLOSED 2026-08-14 (PR #1346, MERGED, confirmed via
   `gh pr view 1346`). The slab/wall asymmetry it left behind reopened same day as
   §SUN_SHADOW_GRAZE_SCALE — also CLOSED 2026-08-14/15 (PR #1363, MERGED).** PR #1346 itself:
   mask/blend restore pass in `_buildStillAO()`, samples `A.sun.shadow.map` directly, mirrors
   three.js's own `getShadow()` chunk, restores AO-eroded contrast at the detected sun-shadow
   boundary only, denoise/AO tuning fully untouched. (§SUN_SHADOW_GRAZE_SCALE below: pixel-proof
   found the fix's shader logic sound but no measurable synthetic-pose effect — closed anyway on
   the user's own live-bake read, "shadows are sharp enough," same as #1346's own closure pattern.)
   Real-pixel witness: +18.7% contrast at the shadow edge, 40x scoped away from
   ordinary AO corners. User's own live gut-check (fresh HHS_Office_Federated Alt+C bake, hard reset
   confirmed `§SUN_SHADOW_RESTORE_INIT_OK` live): "not evident to be diff[erent] onset" at first,
   then later in the same bake "strong shadows on walls and different surfaces.. this is good sign,"
   closed with "I am OK as this is as good as it can get but is good enough." Root cause: Alt+S/Alt+C's
   N8AO denoise was bumped in PR #1331 for indoor noise; Alt+G's was never touched — the fix borrows
   sharpness from the already-correct shadow map instead of touching denoise. Full diagnostic trail
   (10 rounds of user corrections, 2 ruled-out hypotheses, the witness methodology, PR #1343's
   insufficient partial fix that preceded #1346): archived in
   `prompts/archive/PHOTOREAL_STILL_RENDER_SUN_SHADOW_DROWNED_2026-08-13_to_2026-08-14.md`.

   **§SUN_SHADOW_GRAZE_SCALE — CLOSED 2026-08-15, bim-ootb PR #1363 MERGED (auto-merge armed
   2026-08-14, confirmed via `gh pr view 1363`).** User kept seeing "slab shadows still soft, wall
   shadows now strong" across multiple fresh bakes after #1346 shipped (HHS_Office_Federated AND
   Hospital). This thread traced why, built a fix, verified it COMPILES/RUNS clean, then a first
   pixel-proof attempt was RETRACTED as an N8AO-noise artifact (null-control proved it), and a
   corrected zero-noise methodology was built and run to a decisive answer: the fix's shader logic
   is verified sound (its kScale widening genuinely engages at grazing incidence, reaching ~91% of
   its cap at real shadow-boundary pixels) but produced ZERO measurable image difference on every
   SYNTHETIC pose/elevation tested this session (Hospital, tour-path pose, both grazing elev=6 and
   normal elev=40) — root-caused to the mask being mathematically binary per pixel, so a wider
   kernel only matters where erosion exceeds the base 4px reach, and no such case was found in the
   tested scenes. Full trail in the entry below (search `Corrected methodology BUILT and RUN`).
   **Closed anyway** on a REAL Hospital MaxQ bake (`BIM_MaxQ_Hospital_1786724035476.mp4`, landed
   2026-08-15) — user's own live read: "shadows are sharp enough. Previous was too soft. U may
   close." Same closure pattern as #1346 itself (a real bake's visual read outweighing a synthetic
   witness that couldn't reproduce the exact erosion case). Committed
   `408efb0` on `fix/sun-shadow-kernel-graze`, merged onto `origin/main`@`2b86a47` first (12 commits,
   clean fast-forward, no conflicts) before pushing.

   - **Mechanism, code-grounded (not the earlier camera-angle guess, which had unresolved direction
     ambiguity — superseded):** `_srFrag`'s edge-detect (`effects.js` ~3564-3579, confirmed still at
     that location on `origin/main`) uses a FIXED `kernelPx=4` screen-space neighbor tap with no
     angle-awareness. The live console log's own `§PHOTO_SHADOW_BIAS worldBias=…m … grazeElev=6`
     and `§PHOTO_SUN_SHADOW_REACH elevation=6.0 … shadowReach=413` lines (pasted by the user
     mid-session, from a real Hospital bake) show the codebase ALREADY compensates shadow BIAS for
     grazing sun elevation elsewhere (`_reassertPhotoShadowCoverage`) — the restore kernel has no
     equivalent. At low sun elevation, light hits a horizontal GROUND/slab at near-grazing incidence
     (inherently wide/bias-eroded boundary) but hits a sun-facing WALL at near-normal incidence
     (tight boundary) — same sun, same frame, opposite effect depending on surface orientation. A
     flat `kernelPx=4` was implicitly tuned against the wall case.
   - **Real numeric baseline, obtained from the user's own just-landed bake, current SHIPPED code
     (no fix applied yet)** — `~/Downloads/BIM_MaxQ_Hospital_1786691108809.mp4`, frame `h_010.png`
     (Day 412/412, low/grazing sun elevation, extracted via `ffmpeg -sseof -6`), same
     ffmpeg+numpy FWHM methodology as the #1346 witness (script rewritten this session at
     `/tmp/wt-sun-shadow-kernel-graze/measure_shadow_edge.py`, per-row max-gradient FWHM + 8px
     plateau contrast):
     | surface | rows/cols | edge width | edge contrast |
     |---|---|---|---|
     | wall (shaded facade split, rows 370-480, x 600-780) | n=110 | median 2.0px, mean 2.23, std 0.48 | mean **103.4** |
     | ground (plaza shadow, rows 650-850, x 600-1500) | n=191 | median 2.0px, mean 2.83, std **1.32** | mean **40.1** |

     Width is close on both (the scan partly locks onto rock/material edges on the ground — a real
     limitation of this method, don't over-read the width column). **Contrast is 2.5× weaker on the
     ground** and far noisier (std 1.32 vs 0.48) — this is the real signature. Reframes the fix
     target: a too-narrow `kernelPx` doesn't uniformly blur the ground boundary, it makes the 8-tap
     mask fire PARTIALLY (some taps cross the boundary, some don't → `edge` comes back as a weak
     fraction, not 0 or 1) → `mix(aoColor, sharpColor, edge*strength)` only partially restores → a
     low-contrast wash, not a wide blur. A wider grazing-angle kernel should make more/all taps
     cross the real boundary → `edge≈1` → full restore.
   - **Fix built, real-GPU compile/run VERIFIED, pixel-effect NOT yet verified:** worktree
     `/tmp/wt-sun-shadow-kernel-graze` (fresh off `origin/main`@`f5db8f9`, branch
     `fix/sun-shadow-kernel-graze`, **uncommitted working-tree diff, not yet a commit or PR** — the
     diff is sitting there, `git diff -- viewer/effects.js` shows it). Adds a per-PIXEL adaptive
     `kScale` to `_srFrag`: reconstructs a screen-space surface normal via `dFdx`/`dFdy` of the
     depth-reconstructed world position (no extra G-buffer needed), takes
     `NdotL = abs(dot(normal, sunDir))`, and widens `kernelPx` by `clamp(1/NdotL, 1, kernelMaxScale)`
     (`kernelMaxScale=4.0`). Per-pixel (not per-frame/per-elevation) on purpose — a wall and a slab
     can both be in frame at the same sun elevation with very different local incidence. Needed
     `extensions: { derivatives: true }` on the `THREE.ShaderMaterial` (WebGL1-mode GLSL under this
     renderer's default — `dFdx`/`dFdy` don't work without it). `sunDir` uniform recomputed every
     frame from `A.sun.position - A.sun.target.position` (the arc moves the sun every capture).
     Real-hardware-GL witness (`witness/harness.js`-style `playwright-core` launch,
     `--use-angle=gl`, NOT swiftshader — puppeteer+swiftshader was tried first and was too slow to
     even finish one 16-sample TAA accumulate in a reasonable smoke-test window, a dead end worth
     skipping next time) at
     `/tmp/wt-sun-shadow-kernel-graze/witness_sun_shadow_graze_scale.js`: PASS on
     `ANGLE (NVIDIA GeForce RTX 4060 Laptop GPU…)` — `SUN_SHADOW_RESTORE_INIT_OK kernelPx=4
     strength=1 kernelMaxScale=4` fired, `STILL_REFINE done`/`PHOTO_AO done` both completed, **zero
     shader/compile errors, zero page errors**. This only proves it doesn't crash — it does NOT
     prove it improves the contrast numbers above.
   - **A LAN dev server may still be up** from this session at `http://10.253.10.188:8400` (bind
     `0.0.0.0`, `python3 -m http.server` in the worktree above, Hospital + HHS_Office_Federated DBs
     symlinked into `viewer/buildings/` and `buildings/`) — check with `curl -sI
     http://localhost:8400/viewer/viewer.html` before assuming it's alive; restart if not
     (`cd /tmp/wt-sun-shadow-kernel-graze && python3 -m http.server 8400 --bind 0.0.0.0 &`).
   - **Pixel-proof attempted 2026-08-14, RETRACTED same session — the first "real" result was a
     measurement artifact, not a fix effect. Caught before it shipped; recording the trap so it is
     not re-walked.** Method: single converged Hospital still, real MaxQ tour path pose
     (`A.cinemaPathPlan(24).poseAt(0.8)` — reuses the SAME camera formula the real film flies, not a
     hand-rolled bbox pose; two bbox-derived poses were tried first and failed for instructive reasons
     kept below), sun elevation=6 (`A._sunArcStep(1.0)`, matches baseline `grazeElev=6`), toggled
     `A._shadowRestoreMat.uniforms.kernelMaxScale.value` between 4.0 (fix) and 1.0 (old flat-kernel,
     byte-identical to pre-fix shipped code) across successive `A._composer.render()` calls on the
     same frozen camera — the same single-build-A/B pattern that worked for #1346. First pass found a
     small, correctly-directioned-looking signal (grazing surfaces ~11% more affected than wall-like
     ones, classified via `THREE.Raycaster` NdotL against the real scene). **A null-control killed
     it:** rerunning with NO real toggle at all (kernelMaxScale set to the SAME 4.0 both times)
     produced the identical magnitude (grazing meanAbsLumDelta 1.39 vs the "real" run's 1.40;
     normal-incidence 1.29 vs 1.26) — proving the whole signal was render-call-order noise, not the
     uniform being changed. Root cause: `_composer.render()` re-invokes `n8.render()` (N8AOPass)
     every call, and N8AO's own internal dither/jitter state advances per call regardless of camera
     or uniforms — #1346's own witness never hit this because its effect (+18.7%) was far above this
     noise floor; this fix's effect, whatever it is, is not. Doubling `kernelMaxScale` (4→8) and
     doubling `strength` (1→2) were also tried against this same flawed methodology and *also* showed
     no movement — **that result is equally untrustworthy, not evidence either lever is saturated.**
   - **Corrected methodology BUILT and RUN (2026-08-14, same session) — clean, zero-noise, and
     decisive: kernelMaxScale/strength measurably do NOTHING on this test scene, but a direct shader-
     level check shows the mechanism itself is working correctly. This is a real, evidenced result,
     not another false start — read in full before touching this fix again.** Built
     `witness_graze_scale_frozen.js`: one `_composer.render()` call to freeze
     `A._shadowRestoreMat.uniforms` (tAO/tSharp/tDepth/tShadowMap/shadowMatrix now hold one frame's
     static content, `n8.render()` never called again), then a manual full-screen quad
     (`A.renderer.render(quadScene, quadCam)`) reusing that SAME material for each sample — verified
     visually (`quad_only_render.png`) that this draws the real composited scene, not a blank/garbage
     buffer. **Sanity is now perfect, not just small:** reconverge (ON→ON) sumAbsDiff=0 EXACTLY,
     null-control (same value twice) sumAbsDiff=0 EXACTLY — the noise from the render-loop method is
     fully eliminated. **Result: kernelMaxScale 1→4, 1→8, and strength 1→2 each produced
     `meanAbsDiff=0` across the WHOLE frame** (Hospital, tour-path pose `poseAt(0.8)`), tested at BOTH
     grazing elevation=6 (`_sunArcStep(1.0)`) AND non-grazing elevation~40 (`_sunArcStep(0.3)`) — same
     zero result at both, ruling out "wrong elevation" as the explanation.
   - **Why zero, root-caused via direct shader inspection, not guessed:** built
     `probe_mask_visualize.js`, a shader clone of `_srFrag`'s edge-detect that outputs `sC` (raw
     shadow term) and `edge` (the restore mask) as pixel colour instead of the final blend, sharing
     the SAME frozen uniforms. Confirmed `canRestore`'s preconditions are all true this frame
     (`sunCastShadow/hasShadowMap/sunShadowRestoreEnabled` all true) and the mask genuinely fires:
     `edgeMax=255`, 52,620/1.44M pixels (3.7%) have `edge>10` — real shadow boundaries ARE present
     and ARE being detected. Extended the probe to also output `kScale/kernelMaxScale` as a channel:
     at those firing pixels, **`kScale` averages 91% of its max (0.25-1.0 range, mean 0.91)** — the
     per-pixel grazing-incidence widening genuinely engages and reaches near its 4x cap, exactly as
     designed. **So why does widening the search radius change nothing?** `edge` is built from
     `max(abs(sC - shadowAt(tap)))` across 8 taps, and both `sC` and every `shadowAt(tap)` are hard
     `step()` outputs — strictly 0.0 or 1.0, never a fraction. `edge` is therefore mathematically
     BINARY at the pixel level: the instant ANY one tap disagrees with the center, `edge=1`, full
     restore, regardless of how many taps agree. **This falsifies the original fix rationale written
     earlier in this section** ("the 8-tap mask fires PARTIALLY... a weak fraction, not 0 or 1") — that
     was written from the symptom (weak plateau contrast in a real bake) before the shader math was
     read this closely; the mechanism cannot produce a partial per-pixel value at all. What a wider
     kernel actually changes is SPATIAL: which pixels register `edge=1` in the first place (a pixel
     5-14px from a true boundary that a narrow 4px kernel can't reach, but a widened one can). On
     THIS scene, at the pixels where `edge` already fires, it already fires at kernelPx=4 (the
     un-widened base) — there is no ring of "boundary within 14px but not within 4px" pixels for the
     widening to newly catch, so nothing changes when the cap is raised.
   - **Honest bottom line: the fix's own logic is verified sound (kScale computes correctly, engages
     at grazing incidence, is not a no-op in the shader), but this session found ZERO scene/pose where
     it produces a measurable image difference** — meaning there is still no positive evidence it
     helps the user's original complaint (soft floor-slab shadows in a real bake), only evidence it
     doesn't break anything and isn't dead code. The gap is most likely POSE-SPECIFIC: the real
     baseline (`ground` contrast 40.1 vs `wall` 103.4, §above) came from an actual user-recorded
     MaxQ Cinema MP4 (Hospital Day 412/412), not a synthetic headless pose — the erosion band that
     baseline shows must be wider than 4px SOMEWHERE in that real bake, or the ground/wall contrast
     gap wouldn't exist pre-fix. This session's synthetic tour-path pose (`poseAt(0.8)`, same
     building) apparently never crosses a boundary that wide, at either elevation tried. **Next step,
     if this is picked up again: stop hand-deriving poses and instead run this fixed build through an
     ACTUAL MaxQ Cinema bake (or get the user to run one) and re-apply the SAME ffmpeg+`
     measure_shadow_edge.py` methodology used for the pre-fix baseline** — that is how the baseline
     numbers were obtained and is the only way confirmed so far to reproduce the real symptom; more
     headless bbox/tour-pose engineering has diminishing returns after this session's three failed
     framings (§below) plus this one's zero-signal result.
   - **Two bbox-pose attempts that FAILED before the tour-path pose worked, don't repeat them:**
     (a) `dist=span*1.3` from centroid (the "establishing shot" distance) put the building far enough
     away that a fixed `kernelPx=4` screen-space kernel already covers a huge world-space footprint,
     saturating the shader's `edge` mask to ~binary regardless of `kScale` — measured deltaPct=0, a
     zoom artifact, not a real null result. (b) `dist=span*0.75` from centroid put the camera INSIDE
     the campus bbox (a large, irregular multi-wing footprint — "0.75x the diagonal span from
     centroid" is not reliably outside an elongated shape), producing clipped/backface-visible
     wireframe-looking artifacts that were briefly mistaken for a streaming/DLOD placeholder issue
     (it wasn't — `§CONTRACT_CHECK streamed=63182 orphans=0` had already fired well before this pose
     was tried). The fix that actually worked: stop hand-deriving a pose from the bbox at all, call
     `A.cinemaPathPlan(24)` and use `plan.poseAt(0.8)` — the same formula the real MaxQ film flies —
     screen-verified via a cheap pre-AO screenshot before committing to a full 24-frame AO converge.
   - **Ruled out this session, don't re-chase these:** (a) plain camera-viewing-angle-only
     explanation (ambiguous which direction it cuts — superseded by the light-incidence-angle
     explanation above, which is unambiguous); (b) TAA history / N8AO depth-dirty state carrying
     over between consecutive MaxQ-loop stills — read `viewer/lib/TAARenderPass.js` and
     `effects.js`'s `_startStillAOPhase`/`_stillAODepthDirty` directly, both correctly reset every
     still, not the bug; (c) the per-frame `§STILL_REFINE cancelled (interaction)` / `§PHOTO_AO off`
     lines the user sees in EVERY MaxQ frame's log — read `cinema_maxq.js`'s actual loop order,
     this is normal `§MAXQ_STAGE_KEEP` teardown that fires AFTER `_captureFrame()` already grabbed
     that frame's pixels, not a bug that discards the shadow before capture; (d) user's "sunlight
     passing through not-yet-appeared 4D structure" hypothesis — checked against a real live log's
     `§SHADOW_FRONTIER_AT_CAPTURE`/`§PHOTO_SHADOW_FRUSTUM_COVERAGE` lines, `castShadowFalse=0` and
     `outsideFrustum=0` throughout the portion checked, force-reassert was actively catching/fixing
     drift every frame — no evidence of it being the cause, though the "last bit" (near-complete
     structure) of a run was never actually reached in the checked log, so this isn't fully closed
     either, just not supported by what was checked; (e) a full-video 4D construction-tour MP4 (not
     a single frozen still) IS valid evidence for this bug — `cinema_maxq.js` calls
     `A.startStillRefine()` on every captured frame of a MaxQ Cinema run, not just a dedicated Alt+S
     still, so the whole shadow-restore pipeline runs on every frame of a tour bake too; (f) dark
     blobs with bright specular highlights on the ground in some frames are rock/crater DECAL
     geometry, not shadows — don't re-measure those as shadow edges.

Closed this session, confirmed working live: §CAM_LIGHT (camera fill-light) and §SUN_ARC
(noon→dusk sweep) — see their one-line status below, full story in the archive.

## §WEATHER_ADVANCED_MODE — SPEC ONLY (2026-08-12, user ask: "can we incorporate what they have as an advanced mode during baking?") — NOT STARTED, NO CODE

**Context for the ask.** Twinmotion and Lumion both ship weather (rain, snow, fog, wind, seasons;
Twinmotion adds volumetric clouds) AND 4D construction phasing in the same tool, so "a film with
weather while the 4D reveal runs" is an existing, documented competitor workflow, not white space.
This viewer currently has **no weather at all** — the sky is a clear-sky Preetham model with no cloud
geometry (see the §PHOTO_SKY comment in `effects.js`, which says so explicitly).

**The surprise on inspection: most of the hard half is already shipped.** Verified against
`origin/main` before writing this — nothing below is assumed:

| already live | where |
|---|---|
| Scene fog colour + density saved, re-tuned for the shoot, restored on teardown | `effects.js` `_photoFogColorSaved` / `A.scene.fog.density = Math.min(..., 0.00006)` |
| **Wet ground** — 6 seeded circular puddles, per-puddle roughness drop + diffuse darkening via a ground-material `onBeforeCompile` injection, plus `§GROUND_WETNESS_OVERRIDE` | `effects.js` §PHOTO_PUDDLE |
| Real photographed HDRI env, swapped in at staging and restored at teardown, loaded by filename from `viewer/textures/hdri/` | `effects.js` §LAYER2_HDRI (`belfast_sunset_puresky_1k.hdr` — currently the ONLY file in that dir) |
| Sun travel 55°→6° per frame of the bake | `effects.js` §SUN_ARC `_sunArcStep` |
| Staffage/entourage trees with real spatial placement + ground seating | `effects.js` §STAFFAGE |

So the gap vs Lumion/Twinmotion is exactly four things: **clouds, precipitation particles, snow
accumulation, and an overcast lighting state.** Everything else a weather preset needs is wired.

**Recommended order — cheapest real gain first. Do NOT start at clouds.**

1. **Phase 1 — an "Overcast / after rain" preset. Highest realism-per-line in the whole list, and it
   needs no new rendering technique at all.** It is a preset over knobs that already exist: add one
   overcast `.hdr` beside the sunset one (the loader takes a filename in a single place), raise fog
   density above the current `0.00006` cap, drop `A.sun.intensity` and lift hemi/ambient for diffuse
   sky-dome light, and leave the shipped puddles on. **The structural reason this is the right first
   move:** the one genuine conflict between an HDRI sky and §SUN_ARC is that an HDRI has its sun
   baked at a fixed position while the arc sweeps — and an overcast sky has *no visible sun disc*, so
   that conflict simply does not arise in this preset. Free pass on the hardest integration problem.
2. **Phase 2 — rain streaks.** GPU points / instanced quads in a camera-locked volume, additive.
   Modest cost. Deliberately AFTER Phase 1: rain particles over dry ground read fake, and the wet
   ground that sells them is the part already built. Rain without Phase 1 is the wrong order.
3. **Phase 3 — clouds.** Either a scrolling cloud-layer texture on a dome (cheap, moves, fake
   parallax) or raymarched volumetrics (real, expensive). Budget reality from this file's own Layer 4
   note: N8AO alone already costs ~317 ms/frame extra on an RTX 4060, and volumetrics are the same
   order — so this is bake-only and will lengthen a bake noticeably. A cloudy HDRI gives photographed
   clouds for free in reflections but cannot move or parallax, and its baked sun WILL fight §SUN_ARC
   in any non-overcast preset.
4. **Phase 4 — snow accumulation.** The payoff shot for "seasons", and the biggest lift: needs an
   up-facing-normal blend in the triplanar shader (`streaming.js` Layer 3). Snow as particles alone,
   with no accumulation on roofs and sills, will not read.

**Honesty constraints on whatever ships.**
- This closes the "no weather at all" gap. It will not match Lumion's weather quality, and the
  positioning must not claim it does — the durable differentiator remains *the film and the 4D
  sequence are derived from the IFC itself, in a browser, with no export round-trip*, not atmosphere.
- `docs/BIMUserGuide.md` §"Sun, sky and shadow while the film records" currently states in print:
  *"There is no weather: no rain, no snow, no cloud shapes."* That sentence must be updated in the
  same PR as whatever phase ships, or the manual becomes false.
- Advanced mode must be **opt-in and bake-only**, like Alt+J/SSGI — never a default that slows every
  film or changes an existing bake's look without being asked for.

### §SUN_START_TIME — one setting: start time. Fixed 6-hour film. (user spec 2026-08-12, reaffirmed) — FEASIBLE, NOT STARTED

**User decision, final:** a **fixed 6-hour duration** and **one setting: the start time**. Default
**12:00**. No span setting, no dusk anchoring, no solar calculation. The film runs
`startTime → startTime + 6h`.

**What each setting produces** (hour → elevation via the sine Time Machine already uses,
`time_machine.js` `applySunCycle`: `elevation = sin((t/24)·2π − π/2)·90` — no new maths):

| start | end | sun elevation | shadow length / height |
|---|---|---|---|
| 06:00 | 12:00 | 0° → 90° | sunrise → overhead |
| 08:00 | 14:00 | 45° → 77.9° | 1.00 → 0.21 |
| 09:00 | 15:00 | 63.6° → 63.6° | 0.50 → 0.50 (peaks overhead mid-film) |
| 10:00 | 16:00 | 77.9° → 45.0° | 0.21 → 1.00 |
| 11:00 | 17:00 | 86.6° → 23.3° | 0.06 → 2.32 |
| **12:00 (default)** | **18:00** | **90° → 0°** | **0 → sunset** |

**The one range bound, and it is mechanical, not a preference:** with a fixed 6-hour span, any start
later than 12:00 ends after 18:00 — below the horizon, i.e. the film ends in the dark (13:00 start ends
at −23.3°). So the setting's range is **06:00–12:00**. That is the whole rule: *the film is six hours,
so noon is the latest you can start.*

#### Implementation — deliberately small

- `PHOTO_SUN_ELEVATION_START` and `PHOTO_SUN_ELEVATION_END` stop being constants and become
  `elevationForHour(startHour)` and `elevationForHour(startHour + 6)`. `_sunElevationAt(tNorm)` keeps
  interpolating between them exactly as it does now. `_sunArcStep` is untouched.
- Setting range 06:00–12:00, default 12:00. One control.
- Persist the chosen start time with the saved Cinema path, so re-baking an old plan gives the same
  film.
- `§PHOTO_SUN_SHADOW_REACH` (frustum) and `§PHOTO_SHADOW_BIAS_SCALE` (grazing term) are computed once
  at staging from a single elevation — they must use whichever end of the chosen window is **lower**,
  since with a settable start that is no longer always the end frame (e.g. a 06:00 start is lowest at
  the START). One `Math.min`, no new machinery.

#### Two consequences of the default worth recording (statements of fact, not objections)

1. The default **changes today's shipped look**: 55° → 6° becomes 90° → 0°. The opening is an overhead
   sun (short shadows — what `PHOTO_SUN_ELEVATION_START`'s own comment describes as reading flat), and
   the film now ends at the horizon rather than 6° above it.
2. At the 0° end, `§PHOTO_SUN_SHADOW_REACH`'s existing `_elevDeg > 0.5` guard skips frustum widening
   (`height/tan(0)` is unbounded). Practically the last frames are at sunset and near-dark, so there is
   nothing to widen the frustum for — the guard already handles it correctly, no change needed.

#### Witness

1. Assert the logged per-frame elevation matches `elevationForHour` for the chosen window, first and
   last frame, at three start times.
2. Assert the setting rejects/clamps a start later than 12:00.
3. Re-run `scripts/witness_shadow_bias_ab.js` at the window's lowest elevation — shadow contrast there
   must be no worse than today's measured −15.2 mean luminance drop.

#### Not in this spec

Real solar geometry (site latitude/longitude + date). It would make the hour label literally true and
make shadows rotate as well as lengthen, and it reuses this same setting — but it is explicitly out of
scope here. Recorded only because the measured coincidence is worth keeping: on 12 Aug at London's
latitude real solar noon is 53.6°, within 1.4° of the 55° hand-tuned into the current constant.

### Separation + re-render architecture (answered 2026-08-12, verified against `origin/main`)

**Q: keep it separate so it can't disturb the working bake — and can we render over the same frames,
or must it be anew?**

**Separate: yes, and the pattern already exists — copy it, don't invent one.** Alt+J/SSGI is already
opt-in and deliberately excluded from the bake path. Advanced weather is the same shape: one flag read
at `_applyPhotoStaging` time, plus a `_weatherStep(tNorm)` called beside the existing
`_sunArcStep(tNorm)` in `cinema_maxq.js`. Flag off ⇒ every existing code path executes exactly as it
does today, byte-identical output. No new architecture needed.

**Anew, not over the same frames — and the reason is structural, not a preference:**
- `cinema_maxq.js` `poseAt(tNorm)` is a **pure function of tNorm** over the saved plan
  (`plan.poseAt(tNorm)` with the §CPE_CLIP window remap as the ONE place the clip is applied), and the
  4D buildup order is derived from that same `plan.poseAt`. So re-running a saved plan reproduces the
  **identical** film frame-for-frame — same camera, same reveal — with only the atmosphere different.
  That is a re-shoot of the same take, not a similar one.
- The saved frames cannot support the alternative. `_captureFrame()` renders the composer, draws into a
  2D canvas, composites the room title / day counter, and `toBlob('image/webp', 0.92)` — **flat RGB, no
  depth, no normals, no motion vectors.** A flat 2D rain overlay could be composited onto that;
  volumetric fog, clouds with correct occlusion, wet reflections and — decisively — **any shadow
  change** cannot. Compositing cannot fix a shadow, which is the thing being asked for.

**⚠ CORRECTION (same day, before anyone scoped against it): the IndexedDB frame store is NOT a cache
and gives NO second-bake speedup today.** An earlier note in this section called sub-range re-rendering
a free capability. It is not free — it is achievable, which is a different claim. Verified in
`cinema_maxq.js`:
- one fixed store, `IDB_NAME = 'bim_ootb_cinema_maxq'`, `IDB_STORE = 'frames'` (line ~412);
- **`await _idbDelete()` at the START of every bake** (line ~1124), immediately before `_idbOpen()`;
- **`await _idbDestroy(db)` at the END** (line ~1458).

So the frames are a scratch buffer that exists only between capture and mux, wiped at both ends. **A
second bake today costs exactly what the first did.** Nothing is reused.

**What IS achievable, and its real limit.** `poseAt(tNorm)` determinism means any frame index is
independently reproducible, so frames COULD be kept — keyed by (plan hash, frame index, settings hash)
— and an advanced pass could then re-render only the frames it actually changes and re-mux the rest.
But note where that does and does not pay:
- **Whole-film weather change: no saving at all.** Every frame's pixels change, so every frame is
  re-rendered regardless. An advanced bake costs a full bake plus whatever weather costs per frame.
  The expense is the per-frame `_composer.render()` + SSAA/N8AO + `toBlob`, not the muxing.
- **Sub-range change: real saving.** The dusk-shadow case (re-shoot only the last ~20% of frames at a
  higher arc-end elevation) is exactly the shape that benefits, and is the case worth building for.

**⚠ Load-bearing constraint — do not simply delete the deletes.** The start-of-bake `_idbDelete()`
exists because a leftover/blocked store caused a real, diagnosed hang: "stuck right after
§MAXQ_PREVIEW done, zero further lines" (LTU, v810/MAXQ v7 — see the §MAXQ_IDB comment block at
line ~510, which documents the three guards added: track+close our own connection, purge a pending
delete BEFORE opening, and race the open against `IDB_OPEN_TIMEOUT_MS`). Any frame-persistence design
must keep those guards intact and add explicit invalidation + a storage budget (360–576 webp frames at
bake resolution is not free disk), not remove the cleanup that fixed a shipped bug.

### The dusk shadow at the end of the film — not a bug, and weather will NOT fix it

User observation on the landed mp4: the shadow stops working toward the end, "hardly noticeable."
That is the cosine law, not a defect. `PHOTO_SUN_ELEVATION = 6` is the arc's end elevation, and direct
sun on horizontal ground scales with `sin(elevation)` — `sin(6°) = 0.105`, about a tenth of the noon
term. A shadow is the *removal* of direct light, so when there is barely any direct light left there is
barely any shadow to see. **Measured, same building, same session, same fix:** mean luminance drop on
shadowed pixels was **−32.7 at 55° vs −15.2 at 6°** — less than half the contrast (scratchpad
`witness_shadow_bias_ab.js`).

Weather mode makes this WORSE, not better: an overcast preset removes directional shadows entirely.

**The actual lever is the arc's end elevation, not the atmosphere.** Ending at ~12–15° instead of 6°
roughly doubles the direct-light term (`sin 12° = 0.208`, `sin 15° = 0.259`) while still throwing long
shadows (`1/tan 12° = 4.7×` building height). **Put that inside advanced mode**, not in the shared
constant — the default film's look then stays exactly as shipped, honouring "separate so as not to
disturb this." Measure the contrast at the candidate elevation with the existing A/B witness before
committing to a number; the sine law predicts ~2× but that is a prediction, not yet a measurement.

**Priority flag, stated once and then it is the user's call.** `feedback_schedule_accuracy_over_movie_polish.md`
(user ruling 2026-08-05) puts movie-maker polish behind 4D schedule accuracy, and
`prompts/4D_SCHEDULE_PERFECTION.md` still carries an open punch list. Weather is polish by that
definition. Worth deciding explicitly rather than drifting into it.

## HONEST VERDICT (read this before anything else)
**No — this will not be "truly photorealistic" in the indistinguishable-from-a-photograph sense.**
It CAN get meaningfully closer than flat-CG look — plausibly "good archviz render" quality (the
SketchUp+Enscape / Twinmotion tier) — but not camera-photograph quality. Three structural reasons,
not effort/time reasons — more budget doesn't remove them:
1. **The geometry itself is idealized.** IFC-derived meshes have no real-world imperfection — no
   chips, stains, dust, slight panel misalignment, weathering.
2. **Materials are auto-assigned by class, not hand-tuned per surface.** Even with a real texture
   library, a script picking "concrete" for every `IfcSlab` can't replicate an artist choosing
   exactly the right weathered-concrete variant for one specific wall.
3. **No per-shot human grading.** An automated "press a key, get a still" pipeline can't do the
   manual exposure/color/DoF/composition tuning a professional render gets — it's a batch process,
   not an art director.
None of this means the effort is wasted — flat-CG to good-archviz is a real, visible, worthwhile
jump. Just don't scope or promise beyond it.

## STATUS — Layers 1-3 shipped and are baseline behavior; Layer 4 (GI) opt-in only
Full original spec (triplanar shader sketch, texture sourcing, technical approach) is in the
archive if ever needed again — kept out of this file because all three are long since shipped and
live, confirmed as recently as today's witness run (`§TRIPLANAR_PERF materials=12` and
`§LAYER2_HDRI_READY belfast_sunset_puresky_1k` both fired on a real load, 2026-08-11):
- **Layer 1** (Alt+S TAA still-refine, 16-sample jittered accumulation) — shipped, baseline.
- **Layer 2** (real photographed HDRI env, Poly Haven CC0) — shipped, baseline.
- **Layer 3** (triplanar PBR diffuse+roughness on dominant envelope classes) — shipped, baseline.
- **Layer 4** (GI/bounce light): baked lightmaps and full path-tracing both ruled out structurally
  (no UV2 infrastructure; `InstancedMesh`/`BatchedMesh` incompatibility) — SSGI shipped once as the
  DEFAULT, hit real bugs (ghosting, noise/transparency), reverted to default OFF, kept **opt-in only
  via Alt+J**. Deliberately EXCLUDED from the MaxQ/Cinema Orbit bake path — N8AO alone already costs
  ~317ms/frame extra on an RTX 4060 ("a recording with GI active would be a ~3fps slideshow").
  User ruling 2026-08-11: do not pursue further unless another concrete innovation to test.

## NOT IN SCOPE (this spec)
- True photograph-indistinguishable output (see §HONEST VERDICT — structurally unreachable here).
- Baked lightmap GI (blocked — no UV2 infrastructure, separate project if ever pursued).
- Real path tracing on full buildings (blocked — InstancedMesh/BatchedMesh incompatibility).

---

## §LTU_FLOOR_FLICKER — MaxQ bake floor flicker on `LTU_AHouse` (2026-08-03) — CAUSE MECHANISM CONFIRMED, static-camera pixel proof shows NO flicker under isolated conditions (motion-coupled case still open), NOT fixed
User report: floor flicker in a successful MaxQ bake (MP4) on `LTU_AHouse`.

**Two hypotheses REFUTED with real evidence:**
1. **Z-fighting / meta-extracted DB mismatch** — a real `2.39999999` vs `2.39999961` divergence
   exists, but is dead data: `LTU_AHouse` serves in split-DB mode (`viewer/streaming.js` §6.9,
   `meta.db`+`geo.db`), and `extracted.db`'s value is never read on that path. Live-confirmed:
   `§GROUND_Y src=gf-storey-slab(VÅNING 1) z=2.40` matches `meta.db` bit-for-bit. Not systemic
   (Hospital: byte-identical in both files; Duplex: no meta.db, doesn't apply).
2. **DLOD swapping** — `dlod_nav.js:307` fully disengages DLOD for the entire bake
   (`app._maxqActive`), every frame. No swap-threshold oscillation is possible during a bake.

**Live suspect (mechanism-confirmed, NOT pixel-proven): transparent-sort instability** between
the ghost-ground fade (`cinema_maxq.js` `_ghostGroundAt()`, `m.transparent=!solid`) and x-ray
construction-staging (`time_machine.js` `_buildXrayElements()`, no slab exclusion) — both went
default-ON the same day as this report. Ground plane Z == ground-floor slab Z by construction
(`tools.js` `_calcGroundY()` reads the identical row). THREE.js's transparent-pass sort is a
function of camera-to-object distance; for two near-coincident semi-transparent surfaces, small
camera-position deltas frame-to-frame can flip which sorts first.

**Pixel-proof status, real GPU bakes (RTX 4060, `--use-gl=angle --use-angle=gl
--ignore-gpu-blocklist --enable-gpu` — swiftshader was measured ~45x too slow for this building
size, use the GL flags for any future LTU/Terminal/Hospital-scale headless witness):**
- First attempt (authored dive path): diff signal dominated by ordinary camera motion, inconclusive.
- **Static-camera Pass 1** (camera pinned, content NOT frozen): two large diff bursts, but spanning
  0-100% of frame height/width — matches this building's own logged reveal-pacing batches, not a
  ground-plane-height band. Camera motion isolated; content-population was not.
- **Static-camera Pass 2** (camera pinned AND construction cursor frozen at the exact
  `§GHOST_GROUND_TRIGGER_FIRED` threshold): diff traces a single smooth hump matching the ghost
  fade's own `smoothstep` formula analytically — **no alternating/oscillating signature found**
  under fully-isolated conditions. Rules out flicker from the opacity ramp alone or static-scene
  numerical instability — does **not** disprove the original camera-motion-coupled hypothesis
  (a fully static camera can't exercise "small camera-position deltas flip sort order" by
  construction — zero motion ⇒ provably stable sort, that's not evidence either way for a moving
  camera).
- Confirmed: no `renderOrder` is set anywhere on the ground plane or x-ray-staged elements
  (grepped the whole `viewer/` tree) — the sort-order collision precondition is real and
  unaddressed. A `renderOrder` fix, if the motion-coupled case is later confirmed, is genuinely new
  ground, not colliding with any existing convention.
- **Blocked, not abandoned:** reading the ACTUAL ground-floor slab's live `renderOrder`/
  `_tm_xrayStaged`/material state at the trigger moment needs the `BatchedMesh`/`InstancedMesh`
  per-instance index (there's no single per-slab scene node to traverse to) — not done, named as
  the concrete next step.

**Status: NOT FIXED.** Per this project's own no-screenshot/log-not-visual-proof rule, a
`renderOrder` fix should not ship without the pixel-level confirmation described above. Next
session: re-run the static-camera harness (`scratchpad/ltu_flicker_probe_static*.js` pattern) with
the camera pre-positioned at ground level near the slab, spanning the trigger window, WITH the
camera genuinely moving this time (small deltas, not fully static) to actually exercise the
motion-coupled hypothesis one way or the other.

---

## §CAM_LIGHT + §SUN_ARC — camera fill-light + noon→dusk sun sweep (2026-08-11) — CLOSED, confirmed working live
**§CAM_LIGHT**: short-range `THREE.PointLight` riding the camera during Alt+S/Alt+C staging.
Shipped `bim-ootb` PR #1284. User-confirmed working live, watching a real bake: "bright torch light
seems to follow camera is working."

**§SUN_ARC**: `PHOTO_SUN_ELEVATION_START=55°` ("high noon") sweeping to the existing dusk value
(6°, unchanged) across the film — `_sunArcStep(tNorm)` calling `A.updateSky()` every frame, forcing
`shadowMap.needsUpdate=true` since `updateSky()` doesn't touch the shadow map itself. Shipped PR
#1284, but hit **two real regressions same day, both landmines of the same kind**:
1. **Call-order bug** (PR #1284 as shipped): `_sunArcStep()` was called BEFORE
   `A.startStillRefine()`, which internally re-runs `updateSky(PHOTO_SUN_ELEVATION, ...)` (the fixed
   dusk value) as part of its own per-frame staging reset — every frame's swept elevation was
   immediately overwritten back to static dusk before capture. Fixed: moved `_sunArcStep()` to
   AFTER `startStillRefine()`. PR #1288.
2. **SW cache-version miss, TWICE in the same session on the same file:** #1284 edited
   `cinema_maxq.js`/`effects.js`, both in `sw.js`'s `PRECACHE_ASSETS` (cache-first, keyed by
   `CACHE_VERSION`) — shipped without bumping the version, so already-installed PWAs kept serving
   stale code no matter what was merged. Caught and fixed for #1284 (v978→v979, PR #1285) — then
   **#1288 made the identical mistake** (touched `cinema_maxq.js`, zero version bump), which is
   exactly why the user's live retest still showed no arc after #1288 supposedly fixed it. Fixed:
   v980→v981, PR #1289. **Lesson, sharpened: this rule needing to be caught twice in one day means
   it isn't self-enforcing from memory — treat "bump CACHE_VERSION" as a hard pre-merge checklist
   item for any `cinema_maxq.js`/`effects.js` diff.**

**Confirmed working, sandbox witness (not eyeballing — headless Puppeteer, isolated worktree, real
merged code, log read after the run):** `§SUN_ARC_STEP` fired `elevation=55.0/42.8/30.5/18.3/6.0`
at `tNorm=0/0.25/0.5/0.75/1`, exact linear sweep, cross-validated against `A.sun.position.y` read
independently from live scene state (fell `4095.76→522.64` in lockstep — the sun object genuinely
moves, not just the printed number). **User confirmed live on a real bake same day: "sun is
working."** Tuning constants (`CAM_LIGHT_INTENSITY=3`, `PHOTO_SUN_ELEVATION_START=55`) are
first-pass, unmeasured guesses — whether they look RIGHT (not just whether they run) is still
subjective/unverified, not a bug.

**Instrumentation shipped for ongoing verification (PR #1290, v981→v982), no logic changed:**
`§SUN_ARC_STEP tNorm=... elevation=...` on every arc step (direct elevation readout — the older
`§PHOTO_SHADOW sunDist=...` line is camera-target distance, not elevation, and is a misleading
proxy). `§PHOTO_SHADOW_FORCE_REASSERT visMeshes=... flippedOn=...` on the forced reassert that
fires once per MaxQ-captured frame right before capture.

## §SHADOW_FRONTIER — shadows on in-progress/ghosted construction elements (2026-08-11) — OPEN, mechanism traced, no proven bug, LOW PRIORITY (user: "nice to have if free")
User report: shadows not affirming on in-progress constructed beams. Later clarified: specifically
whether interior sun/shadow interplay through open (not-yet-enclosed) construction gaps tracks
4D progress correctly, or fights with Alt+S staging's per-frame teardown/rebuild.

**Traced the full mechanism, found no provable code bug** (unlike §SUN_ARC above, which was a
clean call-order mistake). `time_machine.js:1439-1473` (`renderAtTime`'s per-mesh shadow-flag
block): frontier (actively-installing) meshes get `castShadow = !!app._shadowOn` — gated on the
SEPARATE Sunglass toggle, almost certainly `false` during a MaxQ bake; already-placed non-staged
meshes get `castShadow=false` UNCONDITIONALLY every tick (`§S259`). Both look like the reported bug
— BUT `effects.js`'s `_reassertPhotoShadowCoverage(force=true)`, called from `_finishStillRefine()`
at the end of every captured frame's accumulation, does an unconditional full-scene traverse
setting `castShadow=receiveShadow=true` on every visible mesh, no exception for frontier/staged —
runs AFTER the construction-tick stomp and BEFORE the frame is captured. On paper the loop closes.

**Sandbox witness attempt (2026-08-11):** ran a headless Puppeteer witness calling the real shipped
`A._sunArcStep()`/`A.toggleStillRefine()` directly. Confirmed both new log lines fire correctly with
sane, cross-validated numbers — but that run had **no active Time-Machine construction playback**,
so there were no frontier/staged elements to stomp in the first place. `flippedOn=0` there means
"nothing needed fixing," not "the stomp-then-correct cycle was exercised and passed." A follow-up
witness (driving the TM cursor through two points mid-late in the schedule via `window.tmSetCursor`/
`window.tmGetState`, to actually create staged elements and read their `castShadow` before/after)
was scoped and scripted (`scratchpad/witness_shadow_construction_interplay.js`, not run — 2+
still-refine cycles under swiftshader software rendering, ~126s each measured, so several minutes
total) but **deprioritized mid-session per user ruling: not serious, nice-to-have only if free.**

**Ran the script (2026-08-11, revisited then re-closed same session).** Result: inconclusive, not
negative — the test itself was flawed, not the shadow mechanism. `snapshot()` counted meshes with
`o.isMesh && o.userData.guid`, which returned **zero** at both T1 and T2 (`T1_STOMPED guids=0`,
`T2_STOMPED guids=0`) — this building's geometry is entirely `BatchedMesh`/`InstancedMesh`
(confirmed separately in the §LTU_FLOOR_FLICKER section above), so the individually-meshed
population this script checked never existed to measure. Real finding, though: `§XRAY_EDGES
staged=0/6880` — for HHS_Office_Federated's actual derived build order, the x-ray-ghost mechanism
never triggers at all (no element's support carrier ever finishes after its own reveal), so that
specific "ghosted in-progress" visual state may not even occur in this building's data. Second
cursor-advance cycle (T2) never completed within its 180s budget — resource contention with T1's
own still-running AO tail (194.976s), a script sequencing gap (didn't wait for AO settle before
advancing), not evidence of anything broken.

**Closed 2026-08-11, not pursuing further** — then REOPENED same day when the user hit a sharper,
more specific version of the same underlying problem while actively baking. See
§MAIN_BUILDING_SHADOW below for the full reopened investigation, current status, and the concrete
next step for a fresh session (`if ever revisited` above is superseded — it WAS revisited).

## §MAIN_BUILDING_SHADOW — main building casts NO shadow at all; skyline props + Time Machine's native Shadow mode both DO — ✅ SOLVED 2026-08-12 (PR #1302): shadow.bias is normalised depth, so -0.0005 meant 9.87 m here vs 0.305 m in the working path
User's own established facts (do not re-litigate, do not re-verify — treat as given):
- The main building (HHS_Office_Federated) casts **no shadow whatsoever**, at any point in a
  MaxQ bake, confirmed repeatedly across several fresh live bakes same session.
- The decorative skyline silhouette props (`_buildPhotoProps()`, simple `THREE.Mesh` boxes) DO
  cast a visible shadow, in the SAME bakes, SAME scene.
- Time Machine's own native Shadow mode (`A.toggleShadow`, tools.js, the 'h' pill — a completely
  separate system from PHOTO_SHADOW) already renders shadows correctly and always has.
- Rejected explanations, do not re-propose: dense/thin closely-packed geometry needing a
  different shadow bias (guessed, never verified, user explicitly rejected — "IT IS NOT DENSE").
  Ghost-ground opacity ramp (real mechanism, real log evidence, but user rejected it as a pivot
  away from the actual ask — the differential is main-building-vs-skyline, not early-vs-late).

**Shipped this session (all real, all self-verified before shipping, all still live) — do NOT
re-diagnose these, they are closed and working:**
- PR #1293 `§PHOTO_SUN_SHADOW_REACH` — shadow frustum now widens at low sun angles so the
  building's own long dusk shadow doesn't get clipped (was a real, separate, now-fixed bug).
- PR #1295 `§PHOTO_SHADOW_TARGET_CENTRE` — shadow camera now aims at the real building bbox
  centre via `A.ifc2three()`, not wherever the view camera happened to be looking (was a real,
  separate, now-fixed bug — same failure shape as the already-fixed `§CINEMA_PIVOT`).
  Instrumented in #1296 (`§PHOTO_SHADOW_TARGET` log).
- PR #1298 `§PHOTO_SHADOW_FRUSTUM_COVERAGE` — real `THREE.Frustum` test proves 100% of casters
  are geometrically visible to the shadow camera at every angle tested (noon AND dusk). Confirmed
  live on real bakes: `inFrustum=170+ outsideFrustum=0`, every single frame, no exceptions.
- PR #1299 — shadow map resolution doubled 2048→4096 for the bake-only path (was washing out
  small rooftop-scale detail; unrelated to the main-building-zero-shadow problem but a real fix).
- PR #1300 `§SHADOW_FRONTIER_AT_CAPTURE` — real `castShadow` check on the actively-installing
  (frontier) geometry, read at the exact moment each frame is captured, both for individually-
  meshed AND `BatchedMesh`/`InstancedMesh` objects (batch-wide flag, the finest grain this
  renderer allows). Confirmed live on 24+ consecutive real captured frames: `batchCastShadowTrue`
  exactly matches `batchObjsContainingFrontier` every time, `batchCastShadowFalse=0` throughout.

**So: castShadow flags ✓ (both frontier-specific and the general ~170-mesh population, proven
with real numbers across dozens of frames), frustum coverage ✓ (100%, both elevations), shadow
map resolution ✓ (doubled), shadow-camera target ✓ (aimed at the building, not drifting), deploy/
cache correctness ✓ (`§PHOTO_SHADOW_TARGET`/`§PHOTO_SHADOW_FRUSTUM_COVERAGE` both confirmed firing
on real live bakes). Despite all of this, the user's direct, repeated, live observation stands:
still no shadow from the main building.**

**Went one level deeper — read the actual bundled three.js source** (`viewer/lib/three.module.min.js`,
not the app code) to check whether `BatchedMesh`'s shadow-pass inclusion depends on something the
app never computes. Found: the shadow render loop gates each object on
`!object.frustumCulled || frustum.intersectsObject(object)`. Live witness
(`scratchpad/witness_boundingsphere_check.js`) showed every `BatchedMesh` in the scene has
`frustumCulled: true` (so it DOES go through the intersectsObject test) and
`geometry.boundingSphere: null` (the app's own streaming/batching pipeline never computes it) —
BUT the bundled three.js's actual `intersectsObject` implementation checks `object.boundingSphere`
(the BatchedMesh's own top-level one, confirmed present and valid) BEFORE ever falling back to
`geometry.boundingSphere` — so this specific mechanism, while a genuinely odd gap (the app never
computes a value three.js's own newer BatchedMesh-aware code path doesn't even need), is NOT the
cause. Ruled out with the literal engine source, not inferred.

**Status: genuinely stuck.** Every layer checkable from code and console logs has been checked and
comes back clean. This is not for lack of trying — it is the honest limit of what log-only
diagnosis can resolve here.

### ✅ SOLVED 2026-08-12 — `shadow.bias` is NORMALISED depth, not metres (PR #1302)

**Root cause.** `_enablePhotoShadows()` copied `A.toggleShadow`'s proven `A.sun.shadow.bias =
-0.0005` verbatim. three.js applies that constant in **normalised** depth — the bundled
`three.module.min.js`'s own `shadowmap_pars_fragment` does literally `shadowCoord.z += shadowBias`,
where `z` spans `[0,1]` across the shadow camera's `near..far`. Its world-space meaning is therefore
`bias × (far − near)`, and the two paths run wildly different depth ranges (both measured live on
`HHS_Office_Federated`, not derived on paper):

| path | sunDist | near | far | range | what `-0.0005` actually is |
|---|---|---|---|---|---|
| `A.toggleShadow` (tools.js — the path the user confirms has always worked) | 150 m | 7.7 | 617 | 609 m | **0.305 m** |
| `_enablePhotoShadows` (PHOTO_SHADOW) | 5000 m | 250 | 19998 | 19,748 m | **9.874 m** |

**32.4×.** The cause of the range gap: `toggleShadow` repositions the sun to `ctr + env*(0.8,2,0.6)`
(~150 m away) and derives `near/far` from that; the photo path *must not* move the sun —
`A.sun.position` is what `updateSky`, the Sky shader and the lensflare all read, so it stays at
`updateSky`'s `direction * 5000` — and then derives `near = sunDist*0.05`, `far = sunDist*4` from
5000 m.

**Why that erases exactly what the user saw.** A world-space bias of 9.87 m erases any shadow whose
caster→receiver separation *along the sun ray* is under ~10 m. That separation is
`casterHeight / sin(elevation)`, so at the film's 55° opening **nothing under 8.1 m tall cast
anything at all** — every rooftop fixture, and the near part of a short building's own ground
shadow — while the tall skyline silhouette props cleared it easily. That is the
main-building-vs-skyline differential, and it also explains "did not act in the early seconds"
(early = high sun = worst case) and "nor its roof where objects cast no shadow".

**Why every earlier check came back clean.** `castShadow`, frustum coverage, shadow-camera target
and map resolution were all genuinely correct — PRs #1293/#1295/#1298/#1299/#1300 fixed real bugs.
The bias governs the depth *comparison*, which none of those instruments measure.

**Fix (PR #1302).** Hold the WORLD-space bias instead of copying the normalised constant: floor at
`toggleShadow`'s own proven 0.305 m, raised to `texelWorld / tan(lowest arc elevation)` so grazing
dusk sun doesn't self-shadow the ground (acne) — `_enablePhotoShadows` runs once at staging while
`_sunArcStep` sweeps 55°→6° afterwards without recomputing this camera, so the bias has to be safe
at the worst angle the film reaches. Both terms computed from live values. New `§PHOTO_SHADOW_BIAS`
log line. Live on a real load:
`§PHOTO_SHADOW_BIAS worldBias=0.836m bias=-4.234e-5 range=19748m texel=0.088m grazeElev=6`.

**Proof — paired A/B, identical camera pose / sun / geometry, only `shadow.bias` changed:**

| elevation | px darkened | px brightened |
|---|---|---|
| 55° (film opening) | 1,665 | **0** |
| 6° (dusk) | 12,095 | **0** |

Zero brightened at either — the change only ever *adds* shadow. Post-fix, shipped code vs the old
`-0.0005`: 1,599 px darkened at 55°, 1,084 px at 6°, 0 brightened, isolated-dark-pixel fraction
8.3%/8.9% (low ⇒ contiguous cast shadow, not speckle). The dusk 12,095-vs-1,084 gap is the acne the
grazing term prevents: a flat 0.305 m sits below the 0.836 m texel depth-noise floor at 6°, so most
of that 12,095 was ground self-shadow, not building shadow. Witnesses (headless, numeric pixel
counts, no screenshot in the evidence chain), kept out of the session scratchpad so they don't rot:
`scripts/witness_shadow_bias_ab.js`, `scripts/witness_shadow_bias_postfix.js`. Both need a static
server on the bim-ootb tree (`PORT=<port> node scripts/witness_shadow_bias_ab.js`).

**Instrumentation defect found and fixed in the same PR:** `A.sun.updateMatrixWorld()` was missing
before `shadow.updateMatrices()` in the `§PHOTO_SHADOW_FRUSTUM_COVERAGE` block. `updateMatrices`
reads `light.matrixWorld`, **not** `light.position`, so that log could measure a stale sun —
observed `inFrustum=2 outsideFrustum=349` on one load vs `351/0` on a clean one, identical geometry.
The render was never affected (the renderer refreshes matrices before its own shadow pass), but the
log was not trustworthy as evidence. `time_machine.js`'s `applySunCycle` already did this.

**Lesson worth keeping:** a shadow constant copied between two lights is only portable if their
shadow-camera depth ranges match. `shadow.bias` is unitless; `shadow.normalBias` is the one in world
units. Any future path that reuses another path's shadow tuning must compare `far - near` first.

---

**The next step as named BEFORE the fix above (kept for the record — step 4's code-diff is what
found it, though the differential turned out to be the bias, not the `needsUpdate`/`updateMatrixWorld`
candidates guessed here):**
Time Machine's native Shadow mode (`A.toggleShadow`) is PROVEN to work. PHOTO_SHADOW
(`_enablePhotoShadows`, effects.js) is a DELIBERATE, DOCUMENTED reuse of the same underlying
mechanism (see this file's own earlier session notes: "§PHOTO_DUSK_SHADOWS: reuses time_machine.js's
own proven sun-cycle shadow mechanics... NOT reinvented"). Something in the two setups still
differs even though both end up setting the same flags — that differential is the thing to find,
and it needs a **controlled, same-camera-pose, same-building A/B pixel comparison** between the
two, not more flag-reading:
1. Load the building fresh, park the camera at a fixed pose facing the building's own base/ground.
2. Trigger `A.toggleShadow()` (cycle to 'grass' — real Shadow mode ON), capture the canvas, extract
   real pixel/luminance stats near the building's base (same numeric method already used
   throughout this file — mean/std/contrast in a defined region, NOT eyeballing).
3. Toggle Shadow back off, trigger PHOTO_SHADOW instead (`A.toggleStillRefine()`), same camera
   pose, same capture, same numeric extraction.
4. Compare the two numerically. If TM's pass shows a real contrast/darkness signature near the
   base and PHOTO_SHADOW's doesn't, THAT confirms the differential exists visually (closing the
   "is this even real" question definitively) — then diff the two code paths line-by-line
   (`A.toggleShadow` in tools.js vs `_enablePhotoShadows`/`_reassertPhotoShadowCoverage` in
   effects.js) for the one thing that differs beyond what's already been checked here: candidates
   worth checking first are `renderer.shadowMap.needsUpdate` timing/consumption order relative to
   the two systems' different render-loop integration, and whether `A.sun.target.updateMatrixWorld()`
   is being called at the right point relative to `shadow.updateMatrices()` in each path.
This is resourceful and does not require the user's own DevTools — it's a headless Puppeteer
canvas-capture + numeric pixel comparison, the same class of witness already used successfully
several times this session (see `scratchpad/witness_*.js` for the pattern).

### §MOVIE_SHADOW_TM — CONFIRMED GOOD BY USER, live GPU (2026-08-12)
User: *"shadows working great. Note that."* Movie-maker bake shadow strength now matches Time
Machine exactly. Confirmed on the user's own GPU run, numerically not by eye:
`§MOVIE_SHADOW_TM sun=4.400 ambient=0.785 hemi=1.257 fill=2.042 sunFillRatio=2.155` — identical to
TM native `4.4/(0.785+1.257)`. Was 1.245 (42% weaker) because the sun was scaled x0.7 while the fill
was scaled x1.21, and because §SUN_ARC animates the sun ANGLE every frame while the three intensity
scales are applied ONCE at photo-mode entry — so noon frames were lit with dusk values.
Shipped bim-ootb PR #1316, sw v1004. **Strength only** — PHOTO_SUN_COLOR, ambient/hemi colours,
exposure lift, fog, ground albedo, env-map boost, PHOTO_SUN_ELEVATION and both §SUN_ARC endpoints
deliberately untouched, so the dusk LOOK is unchanged. Do not "re-tune" these three scales without
re-checking the ratio against TM's 2.155 — the §MOVIE_SHADOW_TM log line exists for exactly that.

---

## §PHOTO_AO_TUNING — N8AO ambient-occlusion fold reads too dark/noisy during Alt+C bakes (2026-08-13) — TWO FIXES SHIPPED (bim-ootb PR #1331, #1334) + a real SW caching bug found+fixed (PR #1332), AWAITING USER VISUAL CONFIRM
User report: "during alt-c we apply alt-s which puts in shadow noise (alt-G) but it is too dark and
noise." Confirmed real and current on `bim-ootb` `origin/main` (@9d56919, clean worktree — the shared
`/home/red1/bim-ootb` checkout was found dirty/behind mid-session, NOT used for this read):

**Not the standalone Alt+G/GI composer** (`§GI_CINEMA_PRESET`, `effects_gi_poc.js`) — that one is
already excluded from bakes by default, per this file's STATUS section. It's a separate integration:
`effects.js` §PHOTO_AO (~line 3420-3465) builds its own `N8AOPass` inside the native composer, gated
only by `STILL_AO_ENABLED = true` (unconditional, no user toggle), driven from `A.startStillRefine()`
— the Alt+S entry point. `cinema_maxq.js`'s bake loop calls `A.startStillRefine()` on every captured
frame (warm-up + per-frame, `:1136`/`:1296`) and genuinely `await`s the full 24-frame AO converge
(`_waitFoldDone` polls `A._stillRefineBusy`, which `effects.js` only clears at `f >= STILL_AO_FRAMES`
— confirmed by reading the clear site, not assumed) before capturing. So every baked frame gets the
SAME converged AO quality as a manual Alt+S still, not a partial one — bar the rare `_unconverged`/
`§MAXQ_FRAME_TIMEOUT` case (30s cap per frame; worth checking a bake's own log for a non-zero count,
but not the routine explanation).

**First-pass fix attempted then RETRACTED, on-the-record for the next session:** initially proposed
retuning `STILL_AO_RADIUS`/`STILL_AO_INTENSITY` down. Wrong — missed the `§PHOTO_AO_TUNE` comment
sitting right at the definition (`effects.js:3432`, 2026-07-16): this EXACT radius=8/intensity=6 was
already real-GPU A/B tested at still quality (`PHOTO_AO_TUNE_r{8_i6,5_i4,3_i4,1p5_i3}_2026-07-16.png`)
and deliberately KEPT — the earlier "broad mottle" verdict was measured over LIVE NAVIGATION (raw,
unconverged single-frame AO), not the converged still/bake case, and smaller radii read as
near-invisible at whole-building establishing distance. Reverting it now would undo a tested decision
on no new evidence — exactly what this project's rules forbid. No code changed.

**Two better-grounded hypotheses instead, both consistent with "fully converged AO, still reads bad
in the film" and neither yet witnessed:**
1. **Temporal AO flicker/noise, invisible to a single-still A/B by construction.** N8AO's accumulate
   buffer resets on every camera/view-matrix change (confirmed, `effects_gi_poc.js` §GI_POC_GHOST_FIX
   comment, same underlying library). Each Alt+C frame is a NEW pose → AO reconverges from a fresh
   seed every time. Any one frame can individually match the 2026-07-16 still-quality look and still
   differ, pixel-for-pixel, from its neighbours' independently-seeded convergence — reading as
   shimmer/noise ACROSS the assembled movie, a failure mode a static PNG-vs-PNG A/B cannot show at
   all. This is the better fit for "noise" specifically.
2. **AO darkening compounds with §SUN_ARC's dusk sweep, a feature that postdates the AO A/B test.**
   `§SUN_ARC` (shipped 2026-08-11, this file, above) sweeps every Alt+C film from 55° noon to 6° dusk.
   AO darkening is multiplicative on scene radiance, so the identical AO curve reads far heavier on
   the dim back half of a film than on whatever single lighting condition the 2026-07-16 AO A/B was
   shot under — a joint condition (AO × dusk sweep) that was never re-validated together, because the
   sweep didn't exist yet when the AO tuning was tested. Better fit for "too dark" specifically.

**Not pursued further — superseded by a direct user ruling.** Both hypotheses above stayed open
questions; before either got a witness, the user gave a direct live verdict instead: "Alt-G too
dark... affecting Alt-S and movie." Per this project's own standing rule ("the look is the user's
to judge"), a live user verdict on darkness supersedes the 2026-07-16 A/B test it's overriding —
no synthetic re-proof needed before shipping, only a live round-trip to confirm after.

**SHIPPED (2026-08-13), bim-ootb PR #1331, branch `fix/photo-ao-darkness`, commit `81c58e5`:**
- `effects_gi_poc.js` (standalone Alt+G composer): `aoRadius` 8→4, `intensity` 6→2.
- `effects.js` §PHOTO_AO (the Alt+S fold, same pass Alt+C's MaxQ bake runs every captured frame):
  `STILL_AO_RADIUS` 8→4, `STILL_AO_INTENSITY` 6→2, `denoiseSamples` 4→8, `denoiseRadius` 6→12
  (toward n8ao's own library defaults — free at bake/still quality, an offline accumulate, not a
  real-time cost).
- `sw.js` `CACHE_VERSION` v1013→v1014 (`effects.js` is in `PRECACHE_ASSETS`).

**Verified live, real GPU (RTX 4060, headless Chrome, `Duplex_extracted.db`, sandbox-adjacent
worktree, not the shared checkout):** both passes confirmed running the new values end-to-end, not
just present in source — `§WITNESS_GI_CFG {"aoRadius":4,"intensity":2}`, `§PHOTO_AO start frames=24
radius=4 intensity=2`, `§PHOTO_AO done frames=24 totalMs=396 avgRenderMs=3.3` (24/24 converged, no
timeout, no page errors). **This proves the wiring, not the look** — merge/verify on the user's own
next round trip (Alt+G, Alt+S, and one real Alt+C bake), same discipline as every other "shipped,
not yet visually verified" entry in this file.

The two temporal/dusk-sweep hypotheses above are NOT ruled out or disproven — they're just no
longer blocking, since the fix path taken (lower the whole curve) helps both regardless of which
mechanism dominates. If "too dark" persists after this ships, revisit hypothesis 2 (§SUN_ARC
compounding) specifically, since intensity/radius alone don't touch it.

**Real deploy bug found and fixed in between (bim-ootb PR #1332, `sw.js` `CACHE_VERSION`
v1014→v1015):** user tested #1331 live minutes after merge and still saw the old
`radius=8 intensity=6` in the console log. Origin/CDN was already serving the fixed file
(confirmed via curl, `age: 2s`) — the staleness was 100% client-side. Root cause: the SW's
`install` handler used `cache.add(url)`, which fetches through the BROWSER's own HTTP cache: these
static assets serve `Cache-Control: max-age=600`, so a browser that loaded the old `effects.js`
within the previous 10 minutes silently re-precached that same stale response into the NEW
version's cache during install, even though `CACHE_VERSION` itself bumped correctly. This is a
real, repo-wide bug affecting every future deploy of any precached file, not specific to this fix
— switched to `fetch(url, {cache:'reload'})` + `cache.put()` to force a genuine network fetch on
every precache install. **Practical lesson for verifying ANY future `bim-ootb` deploy:** don't
trust `§BUILD_VERSION` alone as proof a specific file's content updated — cross-check the actual
behavior/log line the change should produce, the way this session caught it.

## §PHOTO_AO_SCALE — same day, user follow-up: "far off well lighted, up close dark" — SHIPPED (bim-ootb PR #1334), AWAITING USER VISUAL CONFIRM
After #1331 deployed (past the PR #1332 caching bug above), user reported the flat retune didn't
fix the real symptom: viewed from outside, the building interior reads bright at a distance and
goes dark up close. **This is a distance-SCALE problem, not an overall-strength problem** — #1331
only lowered the same flat curve, which doesn't touch it.

**Root cause:** both N8AO integrations set `aoRadius` as a FIXED WORLD-SPACE distance (metres, was
8 then 4). At `screenSpaceRadius` off (n8ao's default, never touched before), the shader samples a
neighbour position at that literal metre offset regardless of how close the camera is — up close,
a several-metre radius spans the ENTIRE visible wall (broad-area darkening, not contact shadow);
far away (whole-building establishing shot), the same radius is a barely-visible sliver (why it was
bumped from 1.5m to 8m in the first place, 2026-07-16, `§GI_POC_RADIUS_TEST`). No single metre
value is correct at both distances — this was always structurally present, just not diagnosed
until the user's distance-specific report.

**Fix:** `screenSpaceRadius: true` (n8ao's own docs, fetched and read live via WebFetch, not
guessed: "aoRadius represents the size... in pixels, recommended 16-64" in this mode, with
`distanceFalloff` "0.2 in most cases" — this app had never set `distanceFalloff` at all before,
leaving it at n8ao's library default of 1). `aoRadius` 4→**32 (pixels, not metres)**,
`distanceFalloff` unset→**0.2**, in both `effects_gi_poc.js` (Alt+G) and `effects.js` §PHOTO_AO
(Alt+S/Alt+C fold). `intensity` left at #1331's already-lowered 2 — orthogonal axis, not touched.
The effective world-space radius now self-scales with camera distance, so AO should read a
consistent size on screen whether the shot is a far exterior or a close interior.

**Verified live, real GPU (RTX 4060, headless Chrome, `Duplex_extracted.db`, same
sandbox-adjacent-worktree method as #1331):** both passes confirmed running
`screenSpaceRadius=true distanceFalloff=0.2 aoRadius=32`, `§PHOTO_AO` converges cleanly (24/24,
395ms, no timeout/errors). **Proves the wiring, not the look** — pixel radius (32) is a first-pass
value within n8ao's documented 16-64 range, not independently tuned against this app's real
geometry; verify live on the user's next round trip, specifically re-checking the far-vs-close
symptom this targets, before calling §PHOTO_AO_TUNING fully closed.

## §PHOTO_AO_EDGE — same day, 3rd round: darkness cleared, but "completely no edge corner shadow" — SHIPPED (bim-ootb PR #1335), AWAITING USER VISUAL CONFIRM
User confirmed #1334 cleared the darkness (both flat and far-vs-close), then reported the AO effect
had gone too far the OTHER way — no visible contact shadow at corners/edges at all. Asked directly
"what was the measure before" — table for reference:

| stage | radius | intensity | mode |
|---|---|---|---|
| original (since 2026-07-16) | 8m | 6 | world-space |
| PR #1331 (1st retune — "too dark") | 4m | 2 | world-space |
| PR #1334 (2nd retune — cleared, then "no shadow") | 32px | 2 | screen-space |
| PR #1335 (this) | 32px | 4 | screen-space |

**Cause:** `intensity` had been sitting at 2 (down from the original 6) since #1331 and was never
revisited when #1334 changed the radius mechanism entirely (metres → self-scaling pixels) — once
the broad-area over-darkening from the old mode was gone, 2 was too weak to read as any visible
effect at all. **Fix:** one controlled step, intensity 2→4 (not back to 6) in both integrations.
`aoRadius` (32px) deliberately left untouched — single-variable change, so the next round trip
isolates whether intensity alone was the gap or whether radius also needs a nudge.

**Verified live, real GPU, same method:** both passes confirmed running `intensity=4` (radius/mode
unchanged from #1334), converges cleanly (24/24, 395ms, no errors). **Proves the wiring, not the
look** — verify live: corner/edge contact shadow should now read as visible without reverting to
the original over-dark look. If still too weak or too strong, the next lever is intensity again
(not radius, until intensity is confirmed right) — keep changes single-variable per round.

## §PHOTO_REALISM_RETUNE — over-bright/over-reflective washing out shadow contrast + cool indoor read (2026-08-27, user-queued) — **2 of 3 items SHIPPED AND MERGED; item 1 still open**

> ⛔ **HEADING CORRECTED 2026-09-02 (queue item A-4 item 2). It used to read "SPEC ONLY, not built",
> which was already false when written down and got more false afterwards** — a session reading only
> the heading would have re-specced work that is live on `main`. Verified against `origin/main`
> @ `c8a6df61`, in the code, not from the PR titles:
>
> | item | state | evidence in the shipped tree |
> |---|---|---|
> | **1** brightness / staged-PL re-measure vs the post-`§TRINORM_LINEAR` baseline | ⛔ **NOT DONE** | `A._nightPLScaleStill = 0.5` unchanged (`viewer/tools.js:1100`), and no re-measurement against that baseline is recorded anywhere in this file or `NIGHT_AND_FIXTURE_LIGHTING.md` |
> | **2** `PHOTO_ENVMAP_BOOST` 3.0 → 2.0 (the room probe double-counts) | ✅ **SHIPPED** — bim-ootb **PR #1575**, merged `81599696` | `var PHOTO_ENVMAP_BOOST = 2.0;` (`viewer/effects.js:2643`), with the full history comment and `witness_envmap_retune.js` |
> | **3** warm camera fill, `CAM_LIGHT_COLOR` → the `0xffdca8` family | ✅ **SHIPPED** — bim-ootb **PR #1579** (`§TRIPLANAR_NORMAL`), which names "§PHOTO_REALISM_RETUNE item 3" in its own commit message | `var CAM_LIGHT_COLOR = 0xffdca8` (`viewer/effects.js:332`) — the spec text below still says `0xfff2e0`; that value is gone |
>
> **Scope note, so item 2 is not overstated:** #1575 changed the CONSTANT and added a witness. There
> was no separate "room-probe double-counting" code fix — double-counting is the *reason* the
> constant was stepped down, not a second thing that shipped.
>
> The item-1/2/3 prose below is the ORIGINAL spec and is left intact for the trail. Read items 2 and
> 3 as history, not as work to do.

**User's ask, verbatim:** *"we already got things too bright, shiny reflection, it be shadow effects
for realism"* — then, same session: *"Indoor lighting should have more warm lighting."* Studied
first, not invented: both trace to ALREADY-NAMED, unresolved loose ends in this project's own
history, not new problems.

**1. Brightness washing out shadow play — the exact complaint is already on record, only half-fixed.**
`NIGHT_AND_FIXTURE_LIGHTING.md §STAGED_PL_CUT` (2026-08-16) shipped a 0.5× night-fixture-intensity
cut after the user said staged lighting was *"too bright … it also wipe out the ground slab shadow
play during alt-c movie baking."* That section's own closing note flags the loose end: **a LATER
change, `§TRINORM_LINEAR`, made every triplanar surface brighter — "likely why 'too bright'
resurfaced now" — and was never re-measured against the 0.5× fix.** So the shadow-washout complaint
isn't a missing shadow feature; it's existing shadow work (AO retuned carefully above, real sun
shadow maps) getting drowned by brightness that crept back in through a different, later change.
**Named fix:** re-measure current staged brightness (real GPU, same `§PHOTO_AO`-style before/after
numbers) against the post-§TRINORM_LINEAR baseline; if confirmed too bright again, retune
`_nightPLScale` and/or the triplanar brightness gain — single-variable, one round-trip at a time,
same discipline `§PHOTO_AO_EDGE` above already used.

**2. "Shiny reflection" — the envmap boost was tuned for a bug that's since been fixed, never
retuned.** `§MIRROR_ROOM_PROBE` (2026-08-16) diagnosed but did not act on this: `PHOTO_ENVMAP_BOOST
=3.0` (a 3× reflection-intensity multiplier on every glossy/metal material) was tuned *before*
`§TRINORM_LINEAR` fixed metal's real darkness bug — that section's own words: **"the likely
'whitewash' source now that metal's real darkness bug is already fixed... the natural next step if
the room probe alone isn't enough (not yet judged live)."** Nobody judged it live; nobody retuned it.
**Named fix:** with the room probe (already shipped, gives materials a real local reflection instead
of just sky/HDRI) doing more of the reflection work now, `PHOTO_ENVMAP_BOOST` almost certainly no
longer needs 3×. Re-measure live, step it down in one controlled increment (matching `§PHOTO_AO_EDGE`'s
"one controlled step" precedent, not a guess-and-hope multi-variable change), re-check against the
same Clinic building that originally showed the "whitewash"/"jagged pipe" symptoms.

**3. Indoor daytime read is cooler than this project's own established warm palette.** The camera's
fill light — the dominant light source for interior walk shots, per `§CAM_LIGHT`'s own "bright torch
light follows camera" confirmation — is `CAM_LIGHT_COLOR = 0xfff2e0` (`effects.js:332`), barely off
pure white. This project already committed to a real warm tone elsewhere for exactly this purpose:
Night Mode's fixture palette uses `0xffdca8`/`0xffe4b5` (a proper amber) for warm-class fittings
(`tools.js`, downlight/sconce/pendant/surface). So the "cool indoor" read isn't a missing feature —
it's one specific constant sitting far cooler than the palette this codebase already uses everywhere
else for warm interior light. **Named fix:** shift `CAM_LIGHT_COLOR` toward the established
`0xffdca8`-family warmth (a tuning knob, not a redesign — same file, same variable, no new
mechanism), verify live that interior walk shots read warmer without over-saturating exterior/daylit
frames the same light also touches.

**Item 2 SHIPPED 2026-08-27/28 — bim-ootb PR #1575 (`fix/photo-envmap-retune`), MERGED (user: "send
it!") — live on `bim-ootb main`.** `PHOTO_ENVMAP_BOOST` stepped 3.0→2.0 (one controlled increment, matching `§PHOTO_AO_EDGE`'s
own single-step precedent above) — the room probe now supplies part of the reflection that 3.0 was
calibrated for before the probe existed. New witness `witness_envmap_retune.js`. Verified on Clinic
(the building "whitewash" was originally reported on), real GPU, apples-to-apples before/after (both
room-probe-applied): `meanBoostRatio` 3.0000→2.0000, `meanBoostedEnvMapIntensity` 1.8000→1.2000
(track the constant exactly), frame `meanLuma` 174.19→178.02, `stdLuma` 69.65→66.57 —
**not darker, less extreme contrast, zero clipping either side.** Hospital's material-level numbers
confirmed the change reaches its real 17-19 glossy materials the same way, but a clean frame-level
before/after there was blocked by unrelated environment flakiness (a hang, then a puppeteer crash) —
flagged honestly, not claimed as verified. **Items 1 (brightness/PL-scale re-measure) and 3 (warm
camera fill) deliberately NOT touched in this pass** — single-variable discipline, per spec.
**⚠ 2026-09-02: item 3 shipped LATER, in bim-ootb PR #1579 (`§TRIPLANAR_NORMAL`), which cites
"§PHOTO_REALISM_RETUNE item 3" by name — `CAM_LIGHT_COLOR` is `0xffdca8` on `main` today. Only
item 1 is still open.** See the corrected heading table at the top of this section.

**Order, and why:** items 1+2 first (both are literally "step back an already-known-overtuned
constant," lowest risk, most likely source of "too bright/shiny" exactly as reported) — verify those
live before touching item 3, since a warmer camera light on TOP of still-too-bright/too-reflective
staging would make it harder to isolate which change fixed what, the same single-variable discipline
this file's whole AO-tuning history already earned the hard way.

## §PHOTO_SHADING_CEILING — three per-pixel shading attempts all landed 1–7%, none visible to the user (2026-08-30, measured, one change KEPT, one REVERTED)

**Context:** user asked what would improve Alt+S photorealism, then "do only the single thing that
carries the most benefit." Three attempts, all measured on real GPU frames (Terminal departure
lounge, 960x540, one condition per page load). **All three produced sub-visible deltas. The user's
own repeated verdict — "don't notice changes", "I cannot single out a real win" — is correct and
matches the numbers.** Do not re-run these lanes expecting a different answer.

### Baseline, measured on the user's own Alt+S frame (1773x921, Terminal interior)
`meanLuma 139.79  stdLuma 54.21  p99.9 245.1  >250 0.0000%  <16 0.103%`
`gradEnergy 2.35 -> 4.07` is what triplanar texture already buys (+73%, the biggest single win to date).
Flat-surface measurements that motivated the work: **ceiling patch luma std 5.67 / grad 1.61; floor
patch luma std 16.92 / grad 2.00.**

### 1. §PHOTO_GRADE — still-only spec-clip + shadow-deepen composer pass. BUILT, MEASURED, **REVERTED**.
v1 shipped with constants derived from an inverse-ACES reconstruction of a PNG (range topped at
3.065). **`§PHOTO_GRADE_PROBE` then read the REAL scene-linear HDR buffer: luma p45=0.5406
p75=5.6826 p88=7.4827 p95=8.4239 p99=9.5590 max=10.6996; grad p50=0.0154 p90=0.0755 p99=4.2845.**
The v1 pivot of 0.4259 was **17.6x too low** — a p75 pixel scored hi=1.99, clamped to 1.0, so over
75% of the frame had the highlight term saturated; times the 0.35 mask floor that is a 2.75x lift on
flat surfaces. User's live result: mean luma +18.6, 12.94% of pixels over 240, "overlighted."
v2 (pivot at real p95, edge GATING instead of a floor, gain 5.0->3.0) passed its numeric bar —
`meanLuma -2.82, stdLuma +4.5%, >250 0% -> 0.2118%` — and the user still could not see it. **Reverted
on the user's call. A 4.5% contrast shift is below the threshold of noticing.**

### 2. §TRIPLANAR_NORMAL — the missing third PBR map. BUILT, MEASURED, **KEPT** (cheap, correct, marginal).
`NOTICE.txt` recorded the omission from day one: *"Diffuse+roughness only (no normal/AO ...
two-maps-only first pass)"*. Without it every fragment of a flat surface shares ONE normal, so the
lighting term is constant across it. Wired as a whiteout/UDN triplanar blend at
`#include <normal_fragment_maps>` in `viewer/streaming.js`, same still-only `uTriActive` gate,
NormalGL maps from the same ambientCG assets already vendored. A/B switch: `APP._triNormalOff`.
- **Interior pose:** blockStd 11.0039 -> 11.4801 (**+4.3%**), gradEnergy +2.8%. 42/46 materials.
- **Exterior pose:** blockStd 9.214 -> 9.230 (**+0.2%**), gradEnergy +1.4%, but stdLuma 72.15 ->
  77.54 (+7.5%) and meanLuma 197.49 -> 190.08.

### 3. The hypothesis that FAILED — do not repeat it
Predicted the interior result was small because normal maps need DIRECTIONAL light and the interior
is lit near-uniformly (ambient + hemi + ~200 point fixtures + cam torch; `effects.js` §CAM_LIGHT:
*"no bounce anywhere in this pipeline"*). **The exterior sun-side test REFUTED this** — under a
strong directional key the fine-relief gain was 0.2%, *smaller* than indoors. What the exterior
numbers actually show is large-scale facet shading shifting (stdLuma +7.5%, mean -7.4), not fine
relief: at ~80 m the 2.5 m-repeat relief is far below pixel scale and averages out.

### The conclusion worth carrying forward
**Per-pixel shading knobs cannot create contrast the lighting does not have.** Three independent
attempts landed 1–7% and none crossed the visibility threshold. The remaining real wins are the ones
a person can NAME IN WORDS, not measure in percent — material IDENTITY errors:
`TRIPLANAR_MAT` (`streaming.js:519`) keys texture selection on `ifc_class`, so Terminal's floor
(`jkrAR_flr-f_(jhn21)-3 300 x 300 x 8 mm Jubin Homogeneous "non slip"`) and its ceiling
(`jkrAR_clg-f_(pv60)-3 600mm x 600mm PVC Laminated Gypsum Board`) BOTH render as 2.5 m cast concrete
because both are `IfcSlab`; and Terminal's walls are all concrete (`IfcWall` 333) while Hospital's
are all plaster (`IfcWallStandardCase` 1310) — decided by the exporter's class choice, not material.
**The DB already carries the answer and the renderer never reads it:** `material_name` coverage is
Terminal **79 distinct names / 90.3% of 48,428 elements**, LTU_AHouse 178/29.4%, HHS 4/34.7%, and
**Hospital / Clinic / JKR 0%** (90,882 elements with nothing to bind to — any palette needs a
class/storey fallback for them). `tileMeters` 2.5/2.0/0.6 are invented while the material name
literally contains "300 x 300" and "600mm x 600mm". Persistence for a palette is already built —
`A._applyPendingPatch` (`viewer/scene.js:1426`) + `buildings/patches/*.sql`.

### Witness-methodology defects found and fixed here (both produced FALSE verdicts first)
1. **VACUOUS:** `document.querySelector('canvas')` grabbed a 300x150 all-black overlay canvas; the
   witness judged an empty frame and printed **NO-OP**. Use `APP.renderer.domElement`, and print
   INCONCLUSIVE when the readback is black.
2. **CONFOUNDED:** running both A/B conditions on ONE page load is invalid — the second Alt+S logs
   `§PHOTO_AO done avgRenderMs=0.7` against the first's `94.5`, i.e. the AO phase does no real work
   the second time. **One condition per page load.** Witnesses must also assert the poses match and
   both AO phases did real work, or print INCONCLUSIVE.
3. Calibrating constants at one camera pose and scoring them at another (probe pose vs witness pose)
   invalidated a whole round. Same pose, both.

### Unrelated fact established while chasing the user's 1.6 GB tab report (NOT the renderer)
GH Pages 404s on `/buildings/Terminal_*.db` and falls through to OCI, which serves a **monolithic
281,600,000 B `Terminal_extracted.db`**. The local checkout's same-named file is **28,262,400 B and
meta-only** (tables: `elements_meta`, `element_instances`, `element_transforms`, `surface_styles` —
no mesh table); geometry is a separate **261,349,376 B `Terminal_geo.db`**. Same filename, 10x
different content and a different residency model — settle that before attributing memory to
rendering. (`surface_styles` is EMPTY on Terminal/LTU_AHouse_extracted; `material_rgba` is 86–100%
populated fleet-wide except HHS at 34.8%, and IS already used.)

## §PHOTO_SHADING_CEILING — UPDATE 2026-08-30 evening: the shading fault was REAL and is now FIXED

The section above concluded that per-pixel shading knobs land at 1–7% and that the remaining wins
are material-identity ones. **Half of that stands; the other half was wrong, and the user was right.**

**§SHADE_PROBE settled it (Clinic, 448 real streamed geometries):** every class ships HARD PER-FACE
normals — weldRatio 0.107–0.29, splitNormal 96–100% — so `flatShading:false` was being silently
overridden by the data. Curved MEP was not "as good as tessellation allows"; its roundness was being
thrown away at shading time. IfcFlowController carries 189 distinct facet directions, IfcFlowTerminal
128.6, IfcFlowFitting 114.3 — richly tessellated shapes rendered flat.

**Fixed and live (sw v1106): §MEP_SMOOTH_NORMALS.** Gate is the SHAPE — ≥16 distinct facet
directions, where every box class measures EXACTLY 7 — OR'd with a curve-class list for low-poly
ducts (IfcFlowSegment 10.3). Crease-limited at 55°, rewriting normal VALUES in place: no weld, no
re-index, so ranges/picking/BVH/§TRIPLANAR all keep reading the same vertex layout. Witness 5/5 on
Hospital with the user's constraint measured independently: **non-curve changed=0, maxDelta=0 of
6,370,253 vertices.** Hospital went 0 → 14,068 element spans once the batched/instanced paths were
handled (it reports merged=0, so a ranges-only gate reached nothing there). 8.6 s ONCE per session.

**Still true from the section above:** §PHOTO_GRADE was reverted (passed +4.5% contrast, invisible),
the 199 MB normal-drop is withdrawn (breaks §TRIPLANAR's vTriWorldNormal), and the material-identity
lane remains the largest unbuilt win. Full record: `prompts/CINEMA_PATH_EDITOR.md` §SESSION_2026-08-30.

## §WALL_WINDING_MEASURE (2026-09-01) — is FrontSide viable, measured, not feared

**Question.** User wants walls facing away from the sun to render dark. Cause (code-read, this
session): every element material is `THREE.DoubleSide` (`streaming.js:839`, the §S260d line), and
three.js negates the shading normal on back-facing fragments, so diffuse lighting tracks the
CAMERA, not the sun. Candidate fix `THREE.FrontSide` is correct shading but any wrongly-wound face
vanishes. This section measures how much geometry is actually mis-wound, so the choice is data.
MEASUREMENT ONLY — no rendering change shipped with this section.

**Data + validity (all verified this session, not assumed):**
- Source = the DBs the viewer streams (`§SPLIT_GEO_LOADED`): `Terminal_geo.db` (249 MB, 9,394
  unique meshes) + `Terminal_meta.db`; `Hospital_geo.db` (229 MB, 20,609 meshes) + `Hospital_meta.db`
  (`/home/red1/bim-ootb/viewer/buildings/`, Hospital symlinked to `deploy/buildings/`).
- Decode identical to `A.blobToGeometry` (`scene.js:1830`): `vertices`=Float32 xyz, `faces`=Uint32
  tri indices. The viewer's axis swap (x,y,z)→(x,z,−y) has det=+1 (proper rotation) and instancing
  composes with scale (1,1,1), Euler rotations only (`streaming.js:2242,2347`; `element_transforms`
  has no scale column) — so winding measured in the DB IS what the GPU sees.
- Per mesh: signed volume V=Σ det(v0,v1,v2)/6 (divergence theorem; V>0 ⇔ CCW-outward ⇔ FrontSide
  shows the exterior). Winding consistency via directed-edge multiset after welding coincident
  verts at 0.1 mm (the index carries duplicated positions — weldRatio 0.107–0.29, §SHADE_PROBE):
  an interior edge whose two directed copies run the SAME way = winding flip between neighbours
  (the only case a uniform flip cannot repair). Boundary edge (used once) = open shell → no
  meaningful volume, own bucket. Open meshes re-tested at 1 mm and 5 mm weld (false-open detector),
  and sub-bucketed by boundary-edge fraction: near-closed ≤0.5 %, partly-open ≤5 %, sheet >5 %.
- Probe run 2026-09-01, ~14 s/building + ~30 s drill; logs `winding_{Terminal,Hospital}.log`,
  `drill_*.log`, `sheet_census_Hospital.log` (session scratchpad; every number below is a §-line
  from those logs). All 111,610 elements with geometry resolved a mesh — missing_geo=0 both
  buildings, nothing vacuous.

**Terminal — 48,428 elements, every one measured:**
| bucket | elements | % |
|---|---|---|
| uniformly outward, closed | 45,520 | 94.0 % |
| uniformly INVERTED | **0** | **0.0 %** |
| mixed winding | **0** | **0.0 %** |
| open shells | 2,908 | 6.0 % |
Open drill: 49 close at a coarser weld (false-open); 1,702 near-closed, 1,136 partly-open —
**every single one with V>0 (outward)**; true sheets 21 elements (0.04 %). Net: **48,407/48,428 =
99.96 % of Terminal elements are uniformly outward-wound.**
Wall classes: IfcWall 333 = 110 closed-outward + 190 near-closed(+) + 33 partly-open(+) → **100 %
outward, 0 sheets**; IfcSlab 705, IfcCovering 82, IfcPlate 33,324 (the facade) → 100 % closed
outward. (No IfcWallStandardCase/IfcCurtainWall in Terminal.) Triangle-weighted: 38.3 % of drawn
tris are closed-outward, 61.1 % open-but-positive (the big facade/wall meshes are near-closed
solids, not sheets), sheets 0.5 %.

**Hospital — 63,182 elements with geometry (of 63,415; the 233 without include all 178
IfcCurtainWall — containers that decompose into IfcPlate/IfcMember, both 100 % outward):**
| bucket | elements | % |
|---|---|---|
| uniformly outward, closed | 49,434 | 78.2 % |
| outward after open-drill (false-open 1,330 + near-closed 6,747 + partly-open 52, all V>0) | 8,129 | 12.9 % |
| uniformly INVERTED | **2** | **0.003 %** |
| mixed winding | 303 | 0.5 % |
| true sheets | 5,314 | 8.4 % |
Net: **57,563/63,182 = 91.1 % uniformly outward.** The 303 mixed elements are 298
IfcBuildingElementProxy + 5 others — but they are huge meshes: **18.9 % of the building's 15.3 M
drawn triangles.** Sheets by class: IfcPipeFitting 3,635, IfcDuctFitting 811, proxies 714,
IfcWindow 118, IfcDoor 12 — wall classes only 22 (IfcCovering 9, IfcWallStandardCase 8, IfcWall 5).
Wall classes: IfcWallStandardCase 1,310 → 97.6 % closed-outward + 2.4 % open (8 sheets); IfcWall
158 → 86.7 % closed + 16 near/partly-open(+) + 5 sheets; IfcCovering 602 → 98.5 % + 9 sheets;
IfcSlab 35 → 88.6 % + 4 near-closed (1 mixed).

**Shipped `normal` attribute vs winding: 0 % disagreement — BY CONSTRUCTION, there is no shipped
normal.** `component_geometries` has no `normals` column in Terminal_geo, Hospital_geo, or
Hospital_extracted (schema read); the viewer's §NORMALS_PROBE (`streaming.js:1481`) finds none and
`blobToGeometry` falls to `geo.computeVertexNormals()` (`scene.js:1869`) — the on-screen shading
normal is DERIVED from the winding (then §MEP_SMOOTH_NORMALS rewrites values, not sign). So the
§S260d comment "IFC geometry has inconsistent normals" is now measured: the winding is NOT
inconsistent (0 mixed meshes in Terminal, 0.6 % of meshes in Hospital) — what makes lighting track
the viewer is DoubleSide's camera-facing flip alone.

**VERDICT — FrontSide is viable for the walls, with ~zero repair; load-time winding repair is a
solution to a defect that does not exist.**
- The number that drives it: **uniformly-inverted meshes = 0 in Terminal, 2 elements in Hospital
  (0.003 %)** — there is nothing to flip. Wall classes are 100 % outward-positive in Terminal and
  ≥ 96.8 % in Hospital (22 sheet elements ≈ 1 % of wall-class population).
- The real FrontSide cost is not winding but the ONE-SIDED SHEET population + mixed meshes:
  Terminal 21 elements (0.04 %); Hospital 5,617 (8.9 % of elements — open-ended pipe/duct
  fittings, windows, doors, proxy meshes; the 303 mixed alone are 18.9 % of drawn triangles). A
  sheet is invisible from one side under FrontSide regardless of winding — unrepairable by any
  flip, per-face surgery only for the mixed ones.
- So the data reshapes the either/or: **class-keyed side** — FrontSide for the closed classes the
  user is looking at (walls, slabs, coverings, plates, structure), DoubleSide retained for the
  sheet-heavy classes (fittings, windows, doors, terminals, stairs, railings) — same class-keyed
  pattern STD_MAT already uses. Blanket FrontSide would hole out ~9 % of Hospital; blanket
  load-time repair has nothing to repair.
- Honest caveat: the near-closed/partly-open positive shells (Terminal walls: 223/333) have real
  boundary cracks (≤5 % of edges) where FrontSide shows through where DoubleSide today paints the
  interior back face — hairline-bounded, and only where faces are already absent.
- Separate lever, NOT this measurement: ambient 0.785 + hemisphere 1.257 vs sun 4.4 + envMap 0.6
  (`scene.js:178-190`, `streaming.js:839-853`) means even perfectly-wound geometry only drops to
  ~1/3 of lit value on the dark side. Side-flip alone will not give the user dark shadow faces.

## §WALL_SIDE_AND_LIGHT_FLOOR (2026-09-01) — class-keyed side + fill-floor retune. SPEC FIRST; measured numbers appended below after each run.

**Goal (user ask):** walls facing away from the sun render DARK. Input = §WALL_WINDING_MEASURE
(above): winding is consistent (2/111,610 inverted fleet-wide), §S260d's "inconsistent normals"
premise is measured false, and a side-flip alone cannot darken anything because ambient+hemi
≈ 2.04 vs sun 4.4. So the ship is TWO levers together: (1) class-keyed `material.side`,
(2) a lowered non-directional fill — gated by (3) pick integrity, plus perf/mem non-regression
(user, this session: "watch mem hog not to slow down, look for any oppurtunity to perf").

### SPEC S1 — class-keyed side (streaming.js `_getMaterial`)
- Opaque side = `THREE.FrontSide` iff the element's `ifc_class` passes **T1**; else `DoubleSide`.
  Transparent path (`a < 1.0`, streaming.js:819) stays `DoubleSide` — untouched.
- **T1 (the threshold, a number):** pooled across the two measured buildings
  (Terminal_geo + Hospital_geo, the DBs the viewer streams), the class's
  `(true-sheet + mixed-winding + uniformly-inverted)` element fraction is **≤ 2.0 %** of its
  elements-with-geometry, with pooled population **≥ 30**. Classes not measured, or under
  population, default `DoubleSide` (conservative). Rationale for 2.0 %: the measured wall-class
  defect fractions sit at 0–1.4 % fleet-wide while the sheet-heavy classes sit at ≥ 8 %
  (PipeFitting/DuctFitting/proxies, §WALL_WINDING_MEASURE) — 2.0 % separates the two measured
  populations with margin on both sides and admits no class whose FrontSide cost is triangles
  the user can see through. Class table = derived by a fresh per-class census probe (same
  methodology as §WALL_WINDING_MEASURE: signed volume, directed-edge multiset @0.1 mm weld,
  1 mm/5 mm false-open retest, boundary-fraction buckets ≤0.5 %/≤5 %/>5 %), cross-checked
  against that section's published per-class numbers before being trusted.
- `side` is a pure function of `(ifcClass, a<1.0)`. `ifcClass` is ALREADY a cacheKey dimension
  (streaming.js:780) → the material cache CANNOT fragment. Asserted (S6).
- `mat.userData.origSide` (streaming.js:1132) := the RESOLVED side (today it records FrontSide
  for every opaque material while the material is actually created DoubleSide — a latent
  mismatch against the x-ray restore fallback chain, tools.js:337/359). X-ray path
  (streaming.js:1133, tools.js:317-360, walk.js:507/588) reads live `mat.side` at toggle time
  and restores it — stays coherent with no change beyond origSide.
- The §S260d comment at streaming.js:839 is corrected to cite the measurement.

### SPEC S2 — light floor (scene.js:178-190)
- Lighting model (three.js physical lights; every term MEASURED in-harness in
  ambient-equivalent units via single-light probe renders to a linear render target —
  no factor is hand-assumed): fill `F(N) = Ia + Ih·h(N) + Ienv·env(N)`;
  lit `= F + Is·cs·max(0, N·L)`. Real sun vector L = (200,400,300)/‖·‖ = (0.371, 0.743, 0.557);
  representative vertical-wall pair uses the max horizontal N·L = **0.669**.
- **T2 (target contrast):** away-facing/sun-facing ≤ **0.25** for that pair (today ≈ 0.35).
  Rationale: clear-day shade-to-sun luminance ratios span ~1:4–1:10; 1:4 is the conservative
  edge, chosen because the same fill lights the interiors.
- **T3 (interior floor — the constraint that may bind first):** at a real interior standpoint,
  linear frame luminance must retain **p25 ≥ 0.55×** and **mean ≥ 0.70×** the pre-change value.
  Rationale: perceived lightness ~ Y^(1/3) (CIELAB), so these bound the darkest interior
  quartile to ≤ 18 % perceived loss and the room overall to ≤ 11 %. (Interiors keep their sun
  term — `castShadow=false` means the sun lights interior surfaces through walls — only the
  fill fraction of interior light drops.)
- Derivation: one scale k applied to (ambient, hemi) JOINTLY (preserves today's colour
  balance); solve k from T2 given the measured env term; **if that k violates T3, clamp k at
  the T3 floor and report BOTH numbers as a declared conflict** — never silently favour one.
  Sun intensity, envMapIntensity, PHOTO_ENVMAP_BOOST (CPE lane) untouched.

### SPEC S3 — pick integrity (GATES the ship)
- §S260d's stated reason for DoubleSide was "ensures pick works"; `Raycaster` respects
  `material.side`. In the LIVE viewer (real DB, real `A.raycaster`, the picking.js:225-231
  mesh collection): sample real elements of EVERY FrontSide class; cast identical rays
  before (all-DoubleSide, toggled on the live material cache) and after (shipped sides), from
  OUTSIDE toward element centroids and from INSIDE a real room toward inner wall faces.
  Assert per-ray top-hit element identity and hit counts. Any regression → that class drops
  back to DoubleSide and the census table is annotated; the witness re-runs to green before
  ship.

### SPEC S4 — nothing vanishes
- `renderer.info.render.triangles` and `.calls` before vs after: EQUAL (side changes GPU
  culling, not submission — a triangle-count drop means a mesh was lost, a rise means the
  cache fragmented).
- Uncovered-pixel proof: sky mesh hidden, clear colour set to a sentinel, one deterministic
  render per standpoint (exterior sun side, exterior away side, interior), count sentinel
  pixels before vs after; delta ≤ **0.5 %** of the frame. Catches walls holing out.

### SPEC S5 — the actual shading claim
- Per-face N·L census over the real wall-class geometry (world-transformed, the same decode
  as `A.blobToGeometry`): mean linear irradiance of away-facing (N·L ≤ 0) wall faces and
  sun-facing faces, BEFORE (DoubleSide + Ia 0.785/Ih 1.257) vs AFTER (class side + retuned).
  Report the before/after away-face ratio and the contrast pair. If the away face does not
  measurably darken, SAY SO and do not ship part 2. (Expected honest split: for CLOSED walls
  the camera only ever sees front fragments, so part 1 changes their shading by ~0 —
  the darkening is part 2's; part 1's render value is back-face-fragment correctness on the
  open/sheet population + the culling win. The witness measures rather than assumes this.)
- **In-harness verify-then-report:** measured contrast ratio must round to the derived
  prediction within ±0.02 or the run is INCONCLUSIVE.

### SPEC S6 — perf/mem non-regression (user scope addition, same session)
- M1 unique-material count + draw calls per building: before == after (no cache fragmentation).
- M2 backface-culling win: median frame time over ≥ 30 timed renders at the same pose,
  before vs after — FrontSide should be ≤; report the signed number either way.
- M3 heap: `performance.memory.usedJSHeapSize` same building+pose before vs after; known
  Hospital baseline ≈ 1.57 GB; delta above noise (± ~50 MB run-to-run) = flag, do not ship.
- M4 shadow config untouched: `sun.castShadow === false` and `sun.shadow.mapSize` identical
  before/after (the 4096² map cost note stays historical).
- If any of M1–M4 is negative, that part does NOT ship; the number is the finding.

### Witness
- `viewer/tests/witness_wall_side_light_floor.js` (live Playwright harness, own static server,
  real Hospital split DB; Terminal covered by the node-side census + N·L probe). Prints one
  `§WWSLF_*` line per claim, a final verdict line able to say `NO-OP` / `VACUOUS` /
  `INCONCLUSIVE`, exit 1 on any FAIL. Log saved and read before any conclusion.

### MEASURED 1 — per-class census + T1 table (2026-09-01, census_winding_class.js, logs census_{Terminal,Hospital}.log + t1_decision.log in session scratchpad)
- **Probe validity, proven against §WALL_WINDING_MEASURE before trusting anything:** first run
  mis-defined "mixed" as ANY repeated same-direction edge — that counts multi-shell solids
  (shared internal faces carry 2+2 directed copies) and mis-bucketed 2,777 Terminal elements
  (doc says 0). Corrected to the doc's definition (an edge used exactly TWICE, both copies the
  same way). After the fix the cross-check reproduces every decision-relevant number EXACTLY:
  Terminal closed_out 45,520→(with false-open fold-in 47,229 — bookkeeping split only), mixed 0,
  inverted 0, sheets 21; Hospital with_geo 63,182, inverted 2, mixed 303, sheets+open_neg
  5,275+39 = 5,314, outward net 57,563. (My closed/near-closed boundary differs from the doc's
  drill bookkeeping — welding earlier closes more shells — but that split does not feed T1;
  defect = sheet+mixed+inverted+open_negative matches exactly.)
- **T1 applied (≤2.0 % pooled defect, pop ≥30) — FrontSide (25):** IfcAirTerminal, IfcAlarm,
  IfcBeam, IfcCableCarrierFitting, IfcCableCarrierSegment, IfcColumn (0.52 %), IfcCovering
  (1.32 %), IfcDistributionControlElement, IfcDuctSegment, IfcElectricAppliance,
  IfcFireSuppressionTerminal, IfcFooting, IfcFurniture, IfcLightFixture, IfcMember (0.03 %),
  IfcPipeSegment, IfcPlate (0.00 %), IfcRailing, IfcSlab (0.14 %), IfcStair, IfcStairFlight,
  IfcSwitchingDevice, IfcValve (0.17 %), IfcWall (1.02 %), IfcWallStandardCase (0.61 %).
- **DoubleSide kept (10):** IfcPipeFitting 20.4 %, IfcBuildingElementProxy 16.4 %,
  IfcDuctFitting 14.9 %, IfcWindow 32.7 %, IfcFlowTerminal 5.1 %, IfcDoor 2.09 % (just over —
  honest miss, not rounded down), + under-population IfcController(6), IfcFlowController(21),
  IfcRampFlight(1), IfcRoof(2). Unlisted classes default DoubleSide.
- Wider win than the ask: the census shows the SEGMENT MEP classes (pipe/duct/cable runs,
  18k+5k+84 elements) are 100 % closed-outward — they get backface culling for free; only the
  FITTING classes are the open-ended sheet population.

### MEASURED 2 — derive + witness run 1 (2026-09-01, wwslf_derive.log + wwslf_assert.log, session scratchpad)
- **Calibration (in-page single-light probe renders, linear RT):** unit response = 0.31831 =
  1/π exactly (the Lambert albedo/π — the probe measures the real BRDF, nothing assumed);
  hemi 0.6109/unit intensity at horizontal N; envMap term 0.2029 at intensity 0.6 (the PMREM
  IS live in plain nav); sun 0.9578/unit at N=L.
- **Fill model, measured:** fill_old = 0.785 + 1.257·0.6109 + 0.2029 = **1.756** vs sun term
  4.4·0.9578·0.669 = **2.820** → contrast_old = **0.384** (the "roughly a third" of
  §WALL_WINDING_MEASURE, now exact). T2 (0.25) solves k=0.475; **T3's p25-fill floor 0.55 binds
  first at k=0.491 — the declared conflict happened**, clamped at the floor: shipped
  **ambient 0.386, hemi 0.617**, predicted contrast **0.255**.
- **Witness run 1 (Hospital live, 109 sampled elements/28 classes + 12 in-room rays): 19 PASS /
  1 FAIL — the FAIL is the S3 pick gate doing its job.** One ray of 121 diverged:
  `out|IfcElectricAppliance|1cL9Mv$oTAD8jv7e2bmYul` — its origin (target + 8.5 m radial offset)
  lands INSIDE a recessed IfcLightFixture shell; DoubleSide first-hit was that fixture's own
  interior back face, FrontSide resolves to the supply diffuser beyond it. Winding census had
  IfcLightFixture at 0 % defect — the withdrawal is PICK-behavioural, not winding.
  **Action per spec: IfcLightFixture dropped from FRONT_SIDE_CLASSES (25→24), re-run required.**
- Everything else green, with the numbers:
  - S1: 96 live materials — 59 FrontSide / 34 DoubleSide / transparent all DoubleSide,
    0 mismatched, origSide 100 % coherent.
  - S4: submitted triangles identical 10,105,100 = 10,105,100; draw calls 4,001 = 4,001;
    background-pixel delta 0.0000 at all three standpoints (nothing vanished, no cache
    fragmentation).
  - T3 interior (real render, ACES-mapped): mean retention 0.822, p25 retention 0.833 — well
    above the 0.70/0.55 floors, because interiors keep their sun term (castShadow=false).
  - Away facade real render: mean ratio 0.848 (view mixes lit fragments + env specular);
    pure away-face irradiance (S5 census): **0.550** — the actual darkening of the claim.
  - S5 wall-face census (IfcWall+IfcWallStandardCase, area-weighted, real transforms):
    Terminal 69,154 faces, contrast 0.471→**0.329**; Hospital 50,443 faces, 0.463→**0.322**
    (meanNL of lit faces ≈ 0.47, grazing included — the representative pair is 0.384→0.255).
  - M1 materials 96=96, calls Δ0. M2 frame median 2433→2320 ms headless-swiftshader
    (**−4.7 %**, the backface-culling win, sign checked). M3 heap Δ **0 MB** (1,640 MB both
    states, against the memory probe's measured 1,546–1,583 MB baseline). M4 shadow config
    identical (castShadow=false, 512² — the 4096² note was historical; measured value logged).
  - Mean hit-count drop per ray 12.41 (back-face exit hits gone) with first-hit identity held
    on 120/121 — the WYSIWYG contract intact.

### MEASURED 3 — confirmation run 2, merged tree, SHIPPED (2026-09-01, wwslf_assert2.log)
Tree = branch merged with origin/main @4fb753c6 (#1599); sw conflict resolved v1118→**v1119**
(both-notes, higher-version, own-bump rule). **§WWSLF_VERDICT PASS judged=20 fails=0** —
`§WITNESS_WALL_SIDE_LIGHT_FLOOR pass=20 fail=0 ran=20`.
- S3 pick gate GREEN after the IfcLightFixture withdrawal: **121/121 rays, 0 first-hit
  divergences** (outside + in-room), mean hit-count drop 12.36 (back-face exit hits gone —
  expected, identity intact). Final list = **24 FrontSide classes** (S1: 54 front / 39 double
  / transparent all double, 0 mismatched, origSide coherent).
- Same derivation reproduced exactly (calib deterministic): fill 1.756 → 0.966
  ambient-equivalents, contrast 0.384 → 0.255, T3-clamp conflict again declared.
- T3 interior: retention mean 0.822 / p25 0.833 (floors 0.70/0.55) — interiors keep their sun
  term, so the fill cut lands mostly on exterior away faces, as designed.
- M2 honest note: frame median run 1 **−113 ms** (−4.7 %), run 2 **+30 ms** (+1.5 %) on
  ~2 s software-GL frames — the backface-culling win is WITHIN HEADLESS NOISE, sign checked
  both runs; no reliable frame-time claim either way. M3 heap 1,545 MB both states (Δ 0 MB;
  measured baseline band 1,546–1,583 MB). M4 shadow {cast:false, 512²} identical — note the
  4096² figure circulating in the lane brief is NOT what the live sun carries; measured 512².
- Ship state: branch feat/wall-side-light-floor, commit bd5adf10 + merge 2fbea94a; PR + merge
  verification recorded below when landed.
- **LANDED 2026-09-01: bim-ootb PR #1601 MERGED as origin/main d16646db (verified by fetch, not the PR page: sw v1119, FRONT_SIDE_CLASSES, ambient 0.386 / hemi 0.617 all present on main).**

## §SUN_FILL_RATIO (2026-09-02) — the wall away from the sun, in the PHOTOREAL path. SPEC FIRST; measured numbers appended below after each run.

**User ask (AGENT_QUEUE D-1, 2026-09-02 film review):** *"Wall away from Sun shadow?"* — a wall
facing away from the sun should read darker than one facing it.

**Not re-opened here (settled, on record, correct):** shadows are on and correct in Alt+S
(`§PHOTO_SHADOW enabled casters=382 … texelPerM=11.4`); nothing is clipped (`outsideFrustum=0` on two
buildings); N8AO is contact/crease-only by architecture (`STILL_AO_RADIUS = 32` is in SCREEN pixels),
so a broad flat wall legitimately reads AO≈1.0. This is an ORIENTATION read, not an occlusion one.

**Why this is a PHOTOREAL-ONLY defect.** `§WALL_SIDE_AND_LIGHT_FLOOR` (PR #1601, merged `d16646db`,
2026-09-01) already cut the non-directional fill in `scene.js` and took the plain-navigation
away/sun contrast 0.384 → 0.255. The user's complaint is dated AFTER that landed and is about the
FILM. So the only question is narrow: **does #1601's separation survive into the Alt+S / bake path?**
Measured answer: **no.**

### The instrument — `viewer/tests/witness_sun_fill_ratio.js`
Real viewer, real split building DB, the real `A.startStillRefine()` staging. No mock, no synthetic
scene, no screenshot anywhere, no bake.
- **The pair:** two REAL wall elements of the SAME `ifc_class` AND the SAME `material_rgba`, so
  albedo cannot be the confound. One outward normal toward the LIVE sun, one away.
- **Outward is signed by the building centroid, NOT by face area.** A first pass classified by which
  face carried more area and produced 556 "sun-facing" of 602 walls — a wall slab has near-equal
  area on both faces, so that test is degenerate and its answer is a coin flip. The axis is the
  principal eigenvector of the area-weighted orientation tensor of the element's vertical face
  normals (real geometry, real transforms, the same decode as `A.blobToGeometry`); the sign points
  away from the building centroid; **exteriority is then GATED by a 25-ray coverage test** — an
  interior wall's camera lands inside the building and fails. Coverage ≥ 0.88 or the pair is dropped.
- **The sun vector is READ from `A.sun`, never assumed.** `A.updateSky()` repositions the light at
  load: the live direction is `[0.000, 0.707, −0.707]`, NOT `scene.js`'s source constant
  `(200,400,300)` → `(0.371,0.743,0.557)`. Assuming the constant INVERTED the sun/away labels on the
  first run — the sun-labelled wall measured `sun=0.0001` and the away-labelled one `sun=0.494`.
  A whole session's finding would have been reported backwards. Read the live scene, always.
- **Camera:** 12 m standoff, deliberately beyond `CAM_LIGHT_DISTANCE = 4` so the camera torch
  provably cannot contribute, with the FOV narrowed so the wall fills the frame.
- **Luminance is scene-linear.** three.js applies tone mapping ONLY when the destination is the
  canvas, so a `FloatType` render-target read is raw linear radiance (`renderer.toneMapping` is
  ACESFilmic, `scene.js:110`, and is logged). ACES + exposure are monotonic and applied afterwards,
  so a linear "not brighter" verdict survives them; and a uniform exposure scale cannot change a
  ratio at all.
- **Lighting is therefore ADDITIVE**, so each group's share is measured exactly as (all on) −
  (that group off): `sun / ambient / hemi / env / pl / camlight`. **Closure of the sum against the
  total is asserted** — measured 0.990–1.007, so the decomposition is trusted, not assumed.
- **A/B on ONE page load, and the `CPE_4D_PERF_MEM_STUDY §R10` trade-off was RE-CHECKED rather than
  copied:** these are deterministic single renders, not AO/TAA accumulations, so there is no
  first-fold-does-the-work effect and no scene reseed between conditions. `Math.random` is seeded
  anyway, and a **RED CONTROL** re-measures the untouched condition at the end and asserts it
  reproduces.
- The verdict line prints NO-OP / VACUOUS / INCONCLUSIVE and did so for real: Hospital's first run
  ended `INCONCLUSIVE — no albedo-matched exterior pair passed the 0.88 coverage gate`, which is the
  witness refusing to score a population it never judged.

### ⚠ INSTRUMENT COST FOUND — a 4096² shadow map re-rendered on EVERY staged render
Under SwiftShader the staged scene carries a **4096² shadow map over 708 casters plus ~216 night
fixture point lights**, and every camera move ALSO restarts a 16-frame AO+TAA accumulation. A
14-render decomposition ran **>25 minutes with no change to any measured quantity**. This is exactly
the class of instrument cost §R10 warns about, so it is recorded rather than quietly worked around.
It is a SPEED cost, not a noise cost — and that claim is not asserted, it is **gated**: the witness
reads the SAME pose immediately before and after freezing (`shadowMap.autoUpdate = false` +
`_stillRefineActive = false`) and requires the two to agree (`§SFR_FREEZE … relDrift`, gate < 0.005).
The sun's shadow frustum is fixed to the building envelope and the geometry does not move, so the map
is camera-independent and valid for every pose. **No RED number was taken from an un-gated run.**

### The measured cause — it is the envMap, and this codebase already banned exactly this
`_applyPhotoStaging()` swaps `A._envMap` from the procedural sky PMREM to a real photographed HDRI
(`textures/hdri/belfast_sunset_puresky_1k.hdr`, `§LAYER2_HDRI_READY`) and `_reassertPhotoEnvMap()`
then pushes that map onto **every** cached material — matte concrete and plaster included. IBL is a
whole-hemisphere, **non-directional** term and in three.js **it is not shadow-map-occluded**, so it
lands on a wall regardless of which way that wall faces.

This is not a new insight; it is a route around a gate this file already argued for and shipped.
`PHOTO_GLOSSY_ROUGHNESS_MAX = 0.5` exists (`effects.js:2680`) with the comment *"excludes
concrete/plaster/wood (STD_MAT rough 0.6-0.95), whose shadow-darkened diffuse read must stay
untouched"*, and `PHOTO_ENVMAP_BOOST`'s own history records the symptom from when that gate was
missing: *"user reported 'all shadows on building are gone.' Root cause of THAT: env-map/IBL
reflection is NOT shadow-map-occluded in three.js … the old gate applied the boost to EVERY
material."* The gate that was added limits the **intensity multiplier**. The **map swap** was never
gated, so the same defect returned through the other door — and bigger, because the HDRI is far
brighter than the procedural sky it replaced.

### SPEC — the change, and why this knob and not another
**Constraint honoured first: measure before adding light.** The user's standing words are *"we
already got things too bright, shiny reflection, it be shadow effects for realism"*. Every candidate
was scored against the measured decomposition, and the one shipped **removes** light. No sun
intensity was raised; the separation was not bought with brightness.

| candidate | what it does | why NOT it — the number |
|---|---|---|
| raise `A.sun.intensity` | more N·L range | ADDS light against a standing "too bright" complaint; also breaks `§MOVIE_SHADOW_TM`'s deliberate sun/fill parity with Time Machine (`sunFillRatio 4.387` today) |
| cut `scene.js` ambient/hemi again | lowers fill | already clamped at the T3 interior floor by #1601 (`k_T2=0.475` wanted, `k_T3=0.491` bound) — and it is not the large term: measured ambient+hemi ≈ **0.123 of the away wall's 0.582** staged luminance |
| `PHOTO_AMBIENT/HEMI_INTENSITY_SCALE` (staged-only, both 1.0) | lowers staged fill only | same 21% ceiling, cannot reach the target; and `§MOVIE_SHADOW_TM` set both to 1.0 by explicit user directive |
| `_nightPLScaleStill` (0.5) | dims the ~216 fixture point lights | measured `pl = 0.007` of 0.582 on the away wall — **1.2%**. Not the cause. *(This also answers §PHOTO_REALISM_RETUNE item 1 for the EXTERIOR read: the staged point lights are not what washes out a facade.)* |
| `CAM_LIGHT_INTENSITY` (3) | dims the camera torch | measured `camlight = 0.000` at 12 m — `CAM_LIGHT_DISTANCE = 4` means it provably cannot reach an exterior facade |
| **matte materials keep the plain-nav sky env map** | removes the staged HDRI's unshadowed diffuse fill from concrete/plaster, keeps it on glass and metal | **SHIPPED** — the only term big enough (**76%** of the away wall's staged light), it only ever removes light, it needs **no new constant**, and it re-states a policy this file already shipped |

**The change (`viewer/effects.js`, `_reassertPhotoEnvMap`):** the env-map target becomes
room-probe → glossy: `A._envMap` (the HDRI) → **matte: `_photoEnvMapSaved`** (the sky PMREM captured
at staging entry — exactly what plain navigation uses). Glossiness is decided by a new SHARED
predicate `_isPhotoGlossyMat()` (room-probe/mirror flag, `metalness > PHOTO_METAL_THRESHOLD`, or
`roughness <= PHOTO_GLOSSY_ROUGHNESS_MAX`) so the two reassert loops cannot disagree and the outcome
does not depend on which ran first this tick. **No constant is introduced, tuned or fitted** — the
matte term is restored to the value plain navigation already ships, which is the value
§WALL_SIDE_AND_LIGHT_FLOOR derived and T3-clamped.

**Second, required half (teardown).** Matte materials are not in `_photoEnvBoostedMats`, so they
would keep a reference to `_photoEnvMapSaved` after Alt+S exits — and a later `A.updateSky()` regen
DISPOSES the previous render target (`§MEMLEAK_PMREM_DISPOSE`, `scene.js:227`). One pass at teardown
points every cached material back at the live `A._envMap` (`§SUN_FILL_RATIO teardown envMap restored
on N material(s)`), witness-asserted. **This also closes a pre-existing leak: before this change
matte materials kept the staged HDRI as their envMap after Alt+S exited**, so plain navigation after
a photoshoot was not the same plain navigation as before it.

**Named caveat, not hidden.** Under the opt-in dusk mood (`A._photoDuskMood`, default OFF),
`A.updateSky(PHOTO_SUN_ELEVATION, …)` runs *after* `_envMapHdriActive` is set, so the PMREM is not
regenerated and `_photoEnvMapSaved` stays the pre-staging daytime sky; matte walls would then take a
daytime-sky IBL in a dusk frame. The term is small (21% of an away wall's light in plain nav) and
dusk mood is off by default, so it was NOT chased in the same pass — single-variable discipline.
Recorded as the next thing to measure if dusk mood is ever defaulted on.

---

## §MEP_COLOR_SURVIVES_PHOTOREAL — 2026-09-02 (queue D-2)

> **User, 2026-09-02:** *"The bad coloring or material in IFC elements, to get standard MEP look
> during Alt-S and movie, is that tackled? At the moment still see greyish metallic good contrast,
> but if there is use of std color for certain diff devices such as Yellow, Blue, Green, Red. Only a
> certain turn lever is already fire red which is fine."*

### ⚠ THE PALETTE IS AN AUTHORED CHOICE, NOT A PUBLISHED STANDARD

Same boundary PR #1604 shipped under, restated because this section extends that palette's reach.
**No MEP colour convention exists anywhere in the model data** — no `IfcSystem` / `system` column on
any shipped building DB, and the colour columns that do exist are either a single undifferentiated
default or the extractor's own `≈`-prefixed approximations. What is EXTRACTED is the *key*
(`elements_meta.discipline`, `material_rgba`, `material_name`); what is AUTHORED is the
discipline→hue *assignment*, and it reuses `A.DISC_COLORS` (`viewer/config.js:43-49`) **verbatim** —
the same 12-entry table the HUD bars, bbox placeholders, `city.js`, `measure.js` and the §SUNGLASS
band already paint with. **No new colour value is introduced by this section.** It is not, and is
not claimed to be, an industry standard.

### The measured defect — the tint was a total no-op on 4 of 5 buildings

`§MEP_DISC_TINT` (`streaming.js`, 2026-08-14) already supplies a trade colour to MEP. Its gate is
`if (!rgbaStr && stdMat) { … if (DISC_TINT_CLASSES[ifcClass]) … }`. Two scoping failures, both
measured against the shipped meta DBs (`sat_census.log`, `gap2.log`):

**(a) `!rgbaStr` — "the element has no colour" is the wrong question.** MEP elements carrying a
`material_rgba` value:

| building | MEP elements | with an rgba | dominant value | its HSV saturation |
|---|---|---|---|---|
| Hospital | 41,987 | **41,987 (100%)** | `0.920,0.900,0.850,1.000` × 40,563, `material_name` **NULL** | **0.076** |
| Clinic | 12,480 | **12,480 (100%)** | `0.920,0.900,0.850,1.000` × 11,712, name `≈ Off-White` | **0.076** |
| Terminal | 11,844 | **11,844 (100%)** | `1.000,1.000,1.000` × 6,552 / `Silver` × 3,612 (real authored names) | 0.000 |
| LTU_AHouse | 84,675 | **84,675 (100%)** | four fully-saturated trade colours (green/magenta/blue/yellow) | **1.000** |
| HHS_Office_Federated | 3,391 | 1 | — (3,390 NULL) | — |

So the tint fires **only on HHS**. On Hospital and Clinic every MEP element carries an *achromatic
off-white default*, `_TRI_METAL` multiplies over it (`diffuseColor.rgb *= triContrasted`, the shader
already tints rather than replaces), and the result is exactly the user's words: greyish metallic.

**(b) `DISC_TINT_CLASSES` is 3 classes.** `{IfcFlowSegment, IfcFlowFitting, IfcFlowTerminal}` —
the IFC2x3 generic trio. Hospital/Terminal export IFC4-style `IfcPipeSegment` / `IfcPipeFitting` /
`IfcDuctSegment` / `IfcDuctFitting` / `IfcCableCarrier*` / `IfcAirTerminal` / `IfcLightFixture` /
`IfcFireSuppressionTerminal`. **0 of Hospital's 41,987 MEP elements are in `DISC_TINT_CLASSES`.**

**The user's fire-red lever, identified exactly:** Hospital `IfcPipeFitting | FP |
0.843,0.137,0.102,1.000` × **1,298** (+2 `IfcValve`, +1 `IfcDistributionControlElement`) — the
grooved/Victaulic couplings §MEP_DISC_TINT's own comment already names. Saturation **0.879**. It
survives because its own colour carries a hue. That is the tier this change must not touch.

### The rule — ONE owner, three tiers, hue from the first source that has one

`A._mepDiscAlbedo()` (`streaming.js`) is the single owner. Value/luminance always comes from the
element; only HUE is ever supplied.

| tier | test (all EXTRACTED) | outcome |
|---|---|---|
| **1a** | `material_name` present and **not** `≈`-prefixed → a real authored IFC material | **untouched, byte-identical** |
| **1b** | the element's own `material_rgba` has HSV saturation ≥ `T` → its colour already carries a hue | **untouched, byte-identical** |
| **2** | MEP class, no authored name, colour absent or achromatic | hue+saturation from the trade colour, **V from the element's own albedo** |
| **3** | anything else (non-MEP class, no trade colour available) | unchanged — STD_MAT class default |

Within tier 2 the trade colour is the first source that carries a hue: `_mepNameHint(element_name)`
(the authored Revit family name — a *more specific* real-BIM signal) → `A.DISC_COLORS[discipline]`.
An **achromatic** hint carries no trade hue and falls through — this is what finally moves
`_mepNameHint`'s `DUCT` entry (STD_MAT galvanized grey, sat 0.052), which was itself part of the
"uniform grey metal" complaint. A discipline whose legend entry is achromatic (`VOID`, `0x666666`)
supplies no hue either, and the element is left alone.

**Hue transfer is HSV, not HSL.** HSL desaturates hard as L→1, so at the off-white default's
L = 0.885 an HSL recombination returns near-white. HSV keeps chroma: H and S from the trade colour,
**V = max(r,g,b) of the element's own albedo**. The off-white `0.920,0.900,0.850` under FP
(`0xcc8844`, H 30°, S 0.667) becomes `0.920,0.613,0.306` — a solid orange at the element's own
brightness. The metal normal/roughness maps, `metalness`, `envMapIntensity` and the triplanar
multiply are all untouched, so the *"greyish metallic good contrast"* the user complimented is the
shading response, and it survives — only the hue moves.

**When the element has no colour at all** (HHS's 3,390 NULL rows) the trade colour is used verbatim
— **byte-identical to shipped `§MEP_DISC_TINT`**, so that path is preserved, not re-derived.

### `T` — the achromatic threshold, derived from the data, not picked

Over the tier-2-eligible population fleet-wide (MEP classes, no authored name), the distinct HSV
saturations present are `{0.000, 0.033, 0.076, 0.100, 0.588, 0.713, 0.879, 1.000}`. The distribution
is starkly bimodal and the **widest empty band is 0.100 → 0.588, width 0.4884**; its midpoint is
**T = 0.344**. Split: 53,204 achromatic / 85,934 chromatic, and **0 elements lie within ±0.1 of T** —
the classification is not knife-edge and no element's tier depends on the third decimal. The witness
re-measures this gap per run and fails if any element lands inside the band.

### Verification — `viewer/tests/witness_mep_color_photoreal.js` (W-MEP-COLOR-PHOTOREAL)

Tier-A style (the `W-CPE-MATERIAL-KEY` pattern): boot the viewer once on a small building, then for
each meta DB run the real stream `SELECT` through `sql.js` in-page and call the **shipped**
`A._getMaterial()` on every element, reading `mat.color` back. Hues are COUNTED off real material
objects. **No frame, no screenshot** (CLAUDE.md FUNDAMENTAL LAW).

Gates: distinct MEP hues after ≥ before and ≤ the 12-entry legend ceiling; distinct-hue count equals
the count of disciplines that actually reached tier 2; **RED CONTROL** — with `A._mepHueOff = true`
every gate must fail (before==after); **TIER-1 CONTROL** — every tier-1a/1b element's material
`color` is byte-identical before and after, asserted element-for-element, including the 1,298
fire-red Hospital fittings and Terminal's 11,844 authored-name MEP; `T`-gap re-measured live.
Self-failure: `VACUOUS` on an empty population, `NO-OP` when nothing moved, `INCONCLUSIVE` — never
PASS — when nothing was judged.

### MEASURED — 2026-09-02, W-MEP-COLOR-PHOTOREAL **55/55, five buildings, 0 red**

Hues are COUNTED off real `THREE.Material` objects built by the shipped `A._getMaterial()`, plus the
app's own `§MEP_HUE_TALLY` read off a live HHS stream. **No frame, screenshot or film was rendered
or inspected.** Log: `viewer/tests/witness_mep_color_photoreal.log`.

| building | distinct MEP hues pre → shipped | colourless MEP elements pre → shipped | tinted | RED CONTROL (`_mepHueOff`) |
|---|---|---|---|---|
| **Hospital** | **3 → 8** | **40,634 → 0** | 40,634 | 3 hues — the gain disappears |
| **Clinic** | **2 → 5** | **12,467 → 43** | 12,467 | 2 hues — the gain disappears |
| **HHS_Office_Federated** | 6 → 6 | **1,768 → 0** | 3,391 | **0 hues** — the gain disappears |
| **LTU_AHouse** | **4 → 6** | 107 → 91 | 102 | 4 hues — the gain disappears |
| **Terminal** | 2 → 2 | 11,828 → 11,828 | **0** | unchanged — every MEP element is tier 1a |

Hospital's tinted split: `PLB 17,096 · MEP 13,495 · FP 6,832 · ELEC 1,623 · SAN 1,588` — **5 trade
codes, 5 distinct hues painted, no collisions.** HHS: 6 codes → 6 hues, live-confirmed by the shipped
line `§MEP_HUE_TALLY bld=HHS_Office_Federated mep_elements=3391 tinted=3391 distinct_hues=6
trade_codes=6 legend_ceiling=12 T=0.344 inst_mep_uniform=283 inst_mep_mixed=0`.

**Gate 1 is deliberately two-sided.** HHS gains real colour *without* gaining a distinct hue — its
1,768 ducts moved off `_mepNameHint`'s galvanized-grey `DUCT` entry onto a hue other elements
already carried. Counting hues alone would have scored that a NO-OP, which is the exact
scope-blindness PRIMAL LAW 4 names.

**TIER-1 CONTROL:** 98,283 tier-1 elements byte-identical with the rule on and off, asserted
element-for-element. **The user's fire-red lever: 1300/1300 elements, `#d7231a` → `#d7231a`.**

**Terminal's Gate 5 reports VACUOUS, not PASS** — 0 of its elements ever consult `T` (all 11,844 are
settled at tier 1a by a real authored material name), so a min-distance there would mean nothing.

### MIXED-BUCKET SAFETY — a real hazard this change created, measured and closed

The merge/batch path gives a whole `(storey|disc|rgba|matVariant|mepHintCode)` bucket **one**
material built from `items[0]`'s class. **MEASURED: Hospital had 21 of 160 such buckets mixing an MEP
class with a non-MEP one, up to 3,714 non-MEP elements** (Clinic 2/65, LTU 21/231, Terminal 0/244) —
they would have taken an MEP trade hue they do not belong to. The bucket key therefore gains an
MEP-hue-class bit; splitting keeps both halves correct and costs at most 21 extra buckets.

The **InstancedMesh** branch buckets by GEOMETRY HASH ALONE — the same caveat §MEP_DISC_PALETTE
recorded for discipline — and cannot be split without a draw call per hash. MEASURED: Hospital
**0 of 20,609** and Clinic **0 of 8,459** hashes span an MEP and a non-MEP class; LTU_AHouse has
**108 of 51,393** (1,386 elements). On a set that is not uniform on MEP-ness the hue is **SUPPRESSED**
(prior behaviour) and COUNTED (`inst_mep_mixed`), never applied.

### Shipped in bim-ootb PR #1621 · `sw.js` v1126 → **v1127**, `viewer.html streaming.js?v=67 → 68`
Owner: `A._mepDiscAlbedo` (`viewer/streaming.js`). Kill switch for the red control: `A._mepHueOff`
— deliberately NOT a `cacheKey` dimension, so a caller flipping it MUST clear `A._matCache`.

### MEASURED — RED and GREEN, two buildings, real renders (2026-09-02)

Numbers below are the FINAL runs on the shipped tree (branch merged with `origin/main` through
**#1621**, `sw v1128`). Earlier runs on the pre-merge tree agreed to within 0.003 on every headline
figure — the reruns were done rather than assuming #1619/#1621 could not reach this measurement.
Logs: `ship2_clinic.log`, `ship2_hospital.log` (session scratchpad).

Wall pair per building: same `ifc_class`, same `material_rgba`, 12 m standoff, coverage **1.00** on
both sides (every measured pixel is the target element), live sun `[0.000, 0.707, −0.707]`.
Clinic `IfcWallStandardCase | 0.502,0.502,0.502` at N·L ±0.707; Hospital `IfcWall |
0.439,0.498,0.557` at N·L ±0.704. All values are **scene-linear luminance**.

| away-facing ÷ sun-facing | Clinic | Hospital |
|---|---|---|
| plain navigation (what #1601 ships) | **0.2414** | **0.2371** |
| **RED** — Alt+S before this change | **1.0453** | **0.9170** |
| **GREEN** — Alt+S after this change | **0.2388** | **0.2347** |
| derived prediction (no fitted constant) | 0.2388 | 0.2346 |
| RED CONTROL — untouched condition re-measured | drift 0.00051 | drift 0.00001 |
| verdict | `FAIL judged=20 fails=1` (the 1 is the interior-diagnostic closure below, not a shipped claim) | **`PASS-WITH-DECLARED-CONFLICT judged=20 fails=0`** |

**The RED number IS the user's complaint.** On Clinic the wall facing AWAY from the sun measured
**brighter than the wall facing it** (1.0453); on Hospital it was within 8% of it. There was no
sun/shade read in the photoreal path at all. GREEN restores plain navigation's own separation to
within 0.003 on both buildings and lands on the derived prediction to four decimal places — the
change does exactly and only what the decomposition says it does.

**Per-group decomposition, away-facing wall, Alt+S GREEN (Clinic):**
`sun=0.00000 ambient=0.06168 hemi=0.06023 env=0.03355 pl=0.00000 camlight=0.00000 emissive=0.00000`,
closure 1.000. RED's away wall was 0.81332, of which **0.69137 (85%) was the HDRI env term**;
Hospital's was 0.70141 of which **0.58503 (83%)**.

**Nothing got brighter — asserted per pose, not claimed** (GREEN ÷ RED, scene-linear):

| pose | Clinic | Hospital |
|---|---|---|
| exterior, sun side | 0.835 | 0.832 |
| exterior, away side | **0.191** | **0.213** |
| interior standpoints (3 real `IfcSpace` centres each) | 0.334 / 0.542 / 0.651 | 0.535 / 0.293 / 0.498 |

Every pose on both buildings is darker. The separation was bought by REMOVING light: sun, ambient,
hemi, `PHOTO_ENVMAP_BOOST`, `_nightPLScaleStill` and `CAM_LIGHT` are all untouched.

**The HDRI reflection feature is provably untouched:** 43/43 (Clinic) and 70/70 (Hospital) glossy
materials still read the HDRI or the room probe; only the matte set moved (11 of 54 / 26 of 97).

**Instrument controls:**
- **FREEZE CONTROL** — frozen shadow map vs a freshly rendered one at the same pose, taken at the END
  of the run when the scene has long settled: `frozen=0.15546 liveShadowMap=0.15546 relDrift=0.00000`
  (Clinic), `0.14927 / 0.14927 / 0.00000` (Hospital). An earlier placement of this control read
  `relDrift=0.0627` because it sampled BEFORE the staged scene finished converging — that reading was
  **discarded and the control moved**, not explained away.
- **RED CONTROL** — 0.00051 / 0.00001 drift against effect sizes of 0.81 and 0.68.
- **Closure** — the light groups sum to the measured total within 1.000 ± 0.010 on every wall pose.
- **Teardown** — `§SUN_FILL_RATIO teardown envMap restored on 32 material(s), stale _photoBoosted
  cleared on 11`; census after exit `stale=0 leftBoosted=0 leftOrigEnv=0 castShadow=false` on both.

### ⛔ DECLARED CONFLICT — the interior cost, and the trade the user has to price (→ AGENT_QUEUE U-11)
Removing the unshadowed fill costs Alt+S interiors, because staging turns the sun's shadow ON
(`castShadow=true`) and the HDRI had been standing in for all interior daylight:

| interior retention, GREEN ÷ RED | Clinic | Hospital | floor (§WALL_SIDE_AND_LIGHT_FLOOR T3) |
|---|---|---|---|
| mean | 0.510 | 0.411 | ≥ 0.70 |
| p25 | 0.421 | 0.487 | ≥ 0.55 |

**The clamp is priced, not hand-waved** (`§SFR_CLAMP`): keeping fraction **m = 0.388** (Clinic) /
**0.491** (Hospital) of the HDRI matte fill would hold both floors, but the wall separation would then
be **0.5863 / 0.6011** instead of 0.2388 / 0.2347 — the away wall back to ~60% of the sun wall, better
than RED's 105% and not what the user asked for. **Both numbers are on record rather than silently
favouring either half.** Shipped state = the full fix; `m` is the one number to move.

**What actually lights an Alt+S interior after the fix** (`§SFR_INTERIOR_DECOMP`, Hospital, closure
**0.997**): `ambient=0.09682 hemi=0.09422 env=0.05027` of a 0.24252 total — and `pl=0.00000`,
`camlight=0.00000`, `emissive=0.00055`. So the room is left on the non-directional fill alone. The
same probe on Clinic closed at only **0.447**, i.e. the witness reporting that it could NOT account
for 55% of that frame; the standpoint's max pixel is 2.46–3.22 (brighter than any lit wall), which
points at sky geometry visible through a window — unchanged between RED and GREEN, so it DILUTES the
retention figure toward 1.0 and the true interior-surface darkening is stronger than the frame-level
number above. Named, not chased.

**⚠ The `§STAGED_PL_CUT` remedy is OPEN, not refuted — and the first answer was a false one.** The
staged fixture lights are the obvious interior knob. A first sweep reported a clean `0.00000` interior
change, i.e. "the fixtures do not light interiors" — **a FALSE finding manufactured by the
instrument**: `tools.js`'s pooled fixture update (`§STAGED_PL_CUT`, `tools.js:1787/1821`) recomputes
every light's intensity from `A._nightPLScale` on camera moves, so a per-light write is overwritten
before the next render. The sweep now moves that scalar and reads the intensity total back — and on
the corrected run it printed **`INCONCLUSIVE — the sweep never actually changed the staged fixture
light total (0 → 0 → 0)`**, because that pool is CAMERA-PROXIMITY driven (`_fade = min(1, dist/15)`,
lights outside the needed set are set to 0) and is empty once the accumulation loop is stopped for
measurement. **So: `pl` measured 0.00000 on the away facade in every run — it is certainly not the
CAUSE — but whether raising `_nightPLScaleStill` could restore Alt+S interiors is NOT yet answered.
Answering it needs a measurement that keeps the fixture pool live, which the current freeze forbids.**
That is the next thing to build if U-11 goes that way.

## §DUCT_SILHOUETTE — 2026-09-02 (queue D-3) — ✅ DONE (witness), bim-ootb PR pending at time of writing

> **USER:** *"The roundness to jagged curves seems to work on lamps but certain large duct piping
> seems lacking. Is the formula easy? Detecting an element to possess curved surface but having
> jagged and thus candidate to apply."*

**Answer to the user's actual question, first: YES, the formula is easy — it is two lines — and the
detector they are imagining already exists. The split they are seeing is NOT a detection failure at
all. It is SIZE, and it is ~50x wide.**

### §D3.1 — why the existing pass cannot be the fix (do not re-litigate)
`§MEP_SMOOTH_NORMALS geoms=160 ranges=1662 vertsSmoothed=2,074,656 vertsKeptHard=691,414
creaseDeg=55` rewrites **normals** at a 55° crease. It changes **shading**. A faceted cylinder
shades smoothly and its **silhouette stays a polygon**, because the silhouette *is* the geometry.
`streaming.js` already says this in its own header: *"IfcFlowSegment is 10.3 over 26 triangles: a
genuine 10-sided prism, so its SHADING improves here but its silhouette cannot."*

⛔ **Widening `creaseDeg` is NOT the remedy** — it addresses shading, which is not the defect, and it
would round genuine hard edges. `CREASE_DEG` stays 55, and this new pass deliberately reuses the
*same* 55°/2° edge classification so shading and silhouette always describe one surface.

### §D3.2 — THE FORMULA (measured, validated, no fit, no class list, no building name)
For any edge shared by two faces whose dihedral θ is small enough that the shipped smoothing pass
welds across it — i.e. the two facets are *meant* to read as one curved surface — project both faces
perpendicular to that edge. The edge collapses to a point `E`; the two opposite vertices give `A`
and `B`; all three lie on the swept cross-section. Therefore:

```
R      = |EA|·|AB|·|BE| / (4·area(EAB))      circumradius of three points — EXACT
s      = R · (1 − cos(θ/2))                  chord deviation, metres — "the jaggedness"
D_1px  = s · k,   k = (H/2)/tan(fov/2)       = 935.3 px/rad at 1080p, fov 60 (scene.js:139)
```

`s` is how far the flat facet sags inside the ideal arc. **`D_1px` is the distance out to which that
sag still covers a whole screen pixel** — i.e. how far away the element still looks jagged.

**VALIDATED, not asserted.** On Hospital the estimator lands on **R = 525.0 mm and 550.0 mm** — real
1050/1100 mm manufacturing duct sizes — and its segment count agrees **exactly (11 vs 11)** with a
completely independent PCA ring fit. A first, cheaper centroid-based estimator was biased by a
constant 0.653 on triangulated quads and was **discarded**, not corrected by a fudge factor.

### §D3.3 — THE LAMP-vs-DUCT SPLIT, quantified (this is the user's observation, in numbers)
| Hospital class | curve-detected? | mean N | mean s | worst D_1px |
|---|---|---|---|---|
| `IfcLightFixture` | yes | 13.3 | — | **falls out of the offender list at every gate tried** |
| `IfcDuctSegment` | yes | 12.8 | 4.17 mm | **20.8 m** |
| `IfcPipeSegment` | yes | 11.0 | 0.75 mm | 5.2 m |
| `IfcRailing` | yes | 22.7 | 63.98 mm | 154.6 m |
| `IfcBeam` (curved sweeps) | yes | 11.8 | 21.50 mm | 685.5 m |

**Both classes are detected. Both carry the same tessellation quality (N ≈ 11–13). The error is
linear in radius**, so a lamp is sub-pixel past arm's length while an 1100 mm duct is a whole pixel
at **twenty metres**. Detection was never the problem — size was. ⚠ Note the worst offenders on
Hospital are **not ducts at all** but large-radius *curved sweeps* (railings, curved beams); the
user only named ducts because that is what they were looking at.

### §D3.4 — BOTH REMEDIES, COSTED. Recommendation: re-tessellation.
**Remedy B — a silhouette treatment that adds no geometry. VERDICT: no credible option exists, and
that is a finding, not a cop-out.** Priced honestly:
1. **Anti-aliasing** — already shipped (`taa=8`). Softens the edge *pixel*; the polygon outline is
   unchanged. A 3 px sagitta stays 3 px. Cost 0, benefit 0. **Not a remedy.**
2. **Radial rescale onto the mid-radius polygon** — genuinely halves max deviation for free, but it
   **moves real geometry outward by ~s/2** on a model that carries clash detection, measure and QTO.
   Silently inflating every duct by up to 11 mm is falsifying the model. **Rejected on PRIME RULE
   grounds**, and it only buys 2x anyway.
3. **Parallax/POM silhouette** — cannot extend a surface outward past itself, and there is no height
   map. **Not credible.**
4. **Hardware tessellation** — WebGL2 has no tessellation shader. **Not available** (and §S276
   WebGPU is deferred).
5. **Re-extract at a finer IfcOpenShell chord tolerance** — the *correct* fix at the source, but it
   re-tessellates the **whole fleet** instead of the measured tail, requires re-extracting and
   re-uploading every building DB (Hospital alone is 252 MB, fleet 2.2 GB on OCI), and costs **more**
   memory, not less. **Rejected as untargeted.**

**Remedy A — one level of uniform Phong (PN-triangle) subdivision on the qualifying tail. CHOSEN.**
θ halves, so the residual sag drops ~4x. Measured cost, Hospital, through the shipped module:

| gate | refined geoms | instances | +MB per-geometry | +MB per-instance | mean sagitta |
|---|---|---|---|---|---|
| D_1px ≥ 2 m | 3,589 | 8,372 | +107.0 | **+307.0** | 12.324 → 2.457 mm (5.02x) |
| D_1px ≥ 3 m | 2,607 | 6,649 | +85.4 | +241.8 | 14.773 → 2.783 mm (5.31x) |
| **D_1px ≥ 5 m** | **1,419** | **4,019** | **+59.3** | **+159.3** | **21.331 → 3.383 mm (6.31x)** |
| D_1px ≥ 10 m | 860 | 2,898 | +43.5 | +126.1 | 26.991 → 3.646 mm (7.40x) |

The two bounds are real and both are quoted because the answer lies between them: JS-heap cost is
**per geometry** (`A.meshCache` is keyed by geometry hash, so each is refined once), while GPU
buffer cost is **per instance** for anything on the `BatchedMesh` path and **per geometry** for
anything instanced (Hospital `§CONTRACT_CHECK batch=38169 instanced=25013`).

**Gate = 5 m, chosen on the cost curve, not on taste.** Tightening 5 → 3 m costs **+82 MB** for
1,188 more geometries that are mostly small fittings; loosening 5 → 10 m saves only **33 MB** while
dropping 559. And `§R12_HOSPITAL_MEM` already puts Hospital's heap at ~1,577 MB, so the brief's
warning applies directly: **the 2 m gate's +307 MB is the "hundreds of MB is not a win" case and is
rejected.** 5 m is +3.8% to +10.1%.

### §D3.5 — fleet population and result at the shipped gate (through the shipped module)
| building | geoms | curve-detected | refined | instances | +MB perGeom / perInst | mean sagitta mm |
|---|---|---|---|---|---|---|
| Hospital | 20,609 | 15,428 | 1,419 | 4,019 | +59.3 / +159.3 | 21.331 → 3.383 (**6.31x**) |
| Terminal | 9,394 | 7,424 | 28 | 28 | +30.6 / +30.6 | 42.924 → 5.238 (**8.20x**) |
| JKR | 6,877 | 5,342 | 74 | 74 | +10.7 / +10.7 | 47.440 → 4.495 (**10.55x**) |
| Clinic | 9,230 | 4,366 | 59 | 934 | +6.1 / +94.2 | 30.012 → 5.508 (**5.45x**) |
| HHS_Office_Federated | 4,710 | 2,314 | 117 | 388 | +3.9 / +6.9 | 14.591 → 2.848 (**5.12x**) |
| Duplex | 835 | 503 | 6 | 6 | +1.4 / +1.4 | 42.804 → 10.968 (**3.90x**) |

Hospital's refined set is **9.2% of its curve-detected geometry**. The realised improvement beats
the 4x the theory predicts, because the gate selects the worst offenders and those improve most.

### §D3.6 — the shape factor is DERIVED, not tuned
The plain linear midpoint leaves the sag untouched; the *fully* projected Phong midpoint OVERSHOOTS
(a 12-gon goes from −3.4% inside to +3.1% outside — no gain). The damped midpoint
`m' = m − (α/2)·[((m−p_i)·n_i)n_i + ((m−p_j)·n_j)n_j]` is exact on a cylinder at
`α = (sec(θ/2) − 1)/sin²(θ/2)`, whose limit as θ→0 is **exactly 1/2** (`sec x − 1 ~ x²/2`,
`sin²x ~ x²`). It barely moves over the range that matters: **0.527 at N=12, 0.539 at N=10, 0.619 at
N=6.** So `ALPHA = 0.5` is the second-order-exact value, not a knob turned until it looked right.

### §D3.7 — safety, met by construction (the user's standing constraint, without a class list)
*"It must not impact non curve intending surfaces."*
- A midpoint on a **HARD** edge is **never projected**. The midpoint of a straight edge lies **on**
  that edge, so a planar facet keeps the same plane, outline and area.
- Midpoint positions are computed once per **welded representative** pair and shared by both
  neighbouring faces, so a crack is impossible and the result cannot depend on triangle visit order.
- The per-face vertex split of the source data is preserved — nothing is welded or renumbered, so
  picking, per-element hide, the BVH and `§TRIPLANAR`'s `vTriWorldNormal` all still see their layout.
- **No building name, no IFC class list, no material name anywhere in the file.** A round column, a
  curved railing, a dome and a duct are judged by the same two lines of arithmetic (user, 2026-09-02:
  *"No custom code to any particular building has been our rule."*).

### §D3.8 — TWO THINGS THE WITNESS CAUGHT AND THE CODE CHANGED FOR
Recorded because both were plausible on paper and wrong in measurement:
1. **Curved-shell-only refinement + green T-junction closure — MEASURED WRONG, abandoned.** Refining
   only triangles touching a smooth edge and closing the frontier with 1→2 / 1→3 green splits is
   ~2.6x instead of 4x, and it is the obvious optimisation. On real Hospital geometry it drove
   **non-manifold edges 24 → 211** and opened **875 T-junctions**, because a real IFC mesh is not the
   clean two-manifold that argument assumes — it carries edges shared by 3+ faces, and a
   refined/unrefined frontier through one of those cannot be closed by a green split. **Uniform 1→4
   removes the frontier itself**, so a crack is impossible by construction. The extra cost is the
   4x column above and it is paid deliberately.
2. **Midpoints built from whichever per-face copy the loop reached first.** Copies that weld together
   can still differ by up to the 0.1 mm quantum, making the output depend on triangle visit order.
   Now built from the **welded representative**.

### §D3.9 — WITNESS: `viewer/tests/witness_duct_silhouette.js` — **W-DUCT-SIL 10/10, 37 refined
elements across 8 building DBs, red control caught, exit 0**
No browser, no bake, no screenshot anywhere in the chain — it reads real geometry blobs out of the
shipped DBs and calls the shipped module (CLAUDE.md PRIMAL LAW + FUNDAMENTAL LAW).
- **C2 (load-bearing)** — non-curve surfaces unmoved: 0 original vertices lost, every hard-edge
  midpoint within **4 float32 ULP** of its own edge. Stated in ULPs because that is the measurement
  floor: positions live in a `Float32Array` whose ULP at a 35 m coordinate is 4.2 µm, while a real
  displacement would be the sagitta — **millimetres, ~1000x above it**. The red control sets 120 ULP
  and is caught.
- **C3 / C3b** — sagitta improves ≥3.5x fleet-wide and **no element regressed**, re-measured on the
  **output** mesh, not predicted from the formula that motivated the change.
- **C4a** — the uniform-refinement identity `V'=V+E`, `E'=2E+3T`, `T'=4T` holds **exactly** on every
  weld-injective element, with boundary and non-manifold structure exactly doubled.
- **C4b** — direct point-on-edge crack scan, **scoped and declared**: 8 clean-input elements judged
  of 37; the 29 that entered with coincidences and the 2 over the scan cap are named, not passed
  over. Prints `INCONCLUSIVE` rather than PASS if the judged population is empty.
- **C5** — `§SIL_NOOP gateM=1e9 judged=400 refined=0 geometryChanged=0` — the pass declines and says
  **NO-OP**, exercised for real against the same population.
- **C6** — triangle growth is exactly 4x per element, never more.
- Per-building `§SIL_BUILDING` lines print **NO-OP** where nothing qualified (JKR at the 800-geometry
  sample), never a green zero.

### §D3.10 — three measurement traps recorded, so the next session does not pay for them again
1. **A 12-gon round duct has ~14 distinct face normals and therefore FAILS the shipped shape gate
   `CURVE_MIN_DISTINCT = 16`.** It is smoothed only because `IfcDuctSegment` is on
   `MEP_CURVE_CLASSES`. Any future work that assumes the shape gate alone covers round ducts is wrong.
2. **The class gate lets boxes through.** Hospital/HHS `IfcFlowTerminal` includes 12-triangle,
   `distinct=6` tapered boxes (rectangular diffusers) that bypass the shape test entirely via the
   class list. Harmless for shading; it would be a disaster for re-tessellation, which is why this
   pass gates on **shape only** and never reads a class.
3. **A nearly-coplanar triangle pair fits an arbitrarily large circumradius** and reported a
   **4,290.9 mm** bulge on a flat `IfcWallStandardCase`. Two physical guards, not tuned thresholds:
   `s ≤ 0.25 × bbox diagonal`, and **≥ 6 smooth edges** (a real tessellated curve has many facets at
   a consistent step). With the guards on, `IfcLightFixture` drops out of the offender list — which
   independently reproduces the user's own "it works on lamps".

**Files:** `viewer/silhouette_refine.js` (new) · `viewer/scene.js` (`A.blobToGeometry` — the single
geometry choke point, and the only place refinement can happen: both batch paths size their
`BatchedMesh` from `item.geo` at flush time, so an already-refined geometry is reserved for
correctly with no batch change) · `viewer/streaming.js` (reports next to `§MEP_SMOOTH_NORMALS`, so
the shading half and the outline half are read together) · `viewer/sw.js` `CACHE_VERSION v1128→v1129`
+ precache entry · `viewer.html` `scene.js?v=58→59`, `streaming.js?v=68→69`, all in the same commit.

---

## §SFR_FIXTURE_FIRST — U-11 re-scoped: *"Will room lighting be better if it has no Sun?"* + *"it should be LIVELY"* (2026-09-02/03)

> **User:** *"Will room lighting be better if it has no Sun?"* — light a room from its OWN fixtures
> rather than from sun/environment fill.
> **User, same session:** *"About room lighting, it should be LIVELY. So far it has never been,
> though lighting has been BRIGHT."*

**⛔ NOT DONE. Nothing shipped from this section. Read §SFR_NEXT at the bottom for the one blocking
item.** What IS settled below is settled with numbers; what is not is named as not.

### 0. THE HEADLINE CORRECTION — `pl = 0.00000` WAS AN INSTRUMENT ARTEFACT, AND TWO PUBLISHED CLAIMS ABOVE ARE WRONG

`§SUN_FILL_RATIO`'s own record states, twice, that the staged fixture point lights contribute
nothing: *"`pl` measured 0.00000 on the away facade in every run"* and `§SFR_INTERIOR_DECOMP`'s
*"`pl=0.00000` … So the room is left on the non-directional fill alone."* **Both are false.** They
came from one line in `viewer/tests/witness_sun_fill_ratio.js`'s light-group isolator:

```js
if (!W._plI) W._plI = new Map(ls.map(l => [l.uuid, l.intensity]));
ls.forEach(l => { const v = W._plI.get(l.uuid);
                  l.intensity = on ? (v === undefined ? l.intensity : v) : 0; });
```

First use is the **plainNav** decomposition, where night mode is off and there are **zero** point
lights — so the restore map was captured EMPTY and never rebuilt. At Alt+S the ~216 staged fixture
lights are all absent from it, so `off` set every one to 0 and `on` restored
`l.intensity = l.intensity` = **0**. From the first `pl` toggle onward the fixture pool was dark for
the rest of the run. The closure check could not catch it, because the all-on reference render for
the *second* wall side was itself taken after the lights were already zeroed (0 − 0 = 0, closure
1.000). The same bug shape sat in the `env` and `emissive` groups — and the emissive one explains the
other published oddity, `emissive=0.00055` and the Clinic interior decomposition that *"could not
account for 55% of that frame"*: `A._applyNightGlowToMatCache()` CREATES the luminaire/window glow
during staging, so a set captured at plainNav does not contain the materials the group exists to
measure.

**Corrected, both buildings, real renders, fixture pool live and re-selected at every pose**
(`§SFR_INTERIOR_DECOMP`, GREEN/shipped state):

| interior standpoint | total | ambient | hemi | env | **pl (fixtures)** | emissive | closure |
|---|---|---|---|---|---|---|---|
| Hospital `≈ Level 1 R18` | 0.33102 | 0.09045 | 0.08146 | 0.04469 | **0.09724 (29.4 %)** | 0.00387 | 0.960 |
| Clinic `≈ First Floor R62` | 0.32692 | 0.06048 | 0.05472 | 0.03378 | **0.07111 (21.8 %)** | 0.00816 | 0.699 |

**The room is NOT "left on the non-directional fill alone." The fixtures are already its single
largest directional term.** Clinic's 0.699 closure is the sky-through-a-window term this file
already named — unchanged and still not chased.

Away-facade `pl`, corrected: Clinic **0.00753 of 0.16429 (4.6 %)**, Hospital **0.00029 of 0.13786
(0.2 %)**. Still small — so the *conclusion* PR #1622 shipped on (the HDRI matte fill was the cause)
is unaffected — but "certainly not the cause" was being asserted from a number that was not measured.

**Re-proved endpoints with the corrected instrument** (`§SFR_REDGREEN`, `§SFR_CONTROL` drift
0.00000 on Clinic): plainNav **0.2414 / 0.2371**, RED **1.0434 / 1.0608**, GREEN **0.2526 / 0.2839**.
The shipped separation is **0.2526 (Clinic) / 0.2839 (Hospital)**, not the 0.2388 / 0.2347 recorded
above — that pair was measured with the fixture lights artificially at zero. **Use these numbers.**

### 1. THE SECOND DEFECT — THE STILL'S NEAR-FIELD BOOST NEVER FIRES ON AN INTERACTIVE Alt+S

`tools.js` defines two constants *for the frozen still specifically*:
`A._nightNearFadeFloorStill = 1.0` (*"still: no proximity penalty at all"*, `tools.js:1089`) and
`A._nightMaxLightsStill = 50` (`tools.js:1087`). `effects.js`'s §NIGHT_STILL_LIGHTS block applies
them — but it is guarded:

```js
// effects.js:4918
if (A._nightStillBoost &&
    A._nightLights && A._nightLights.length && typeof A._nightUpdateLights === 'function') {
  A._nightMaxLights      = A._nightMaxLightsStill;
  A._nightNearFadeFloor  = A._nightNearFadeFloorStill;   // §NIGHT_NEAR_FADE
```

…and `_applyPhotoStaging()` — the call that turns Night Mode on and **builds those very lights** —
does not run until **`effects.js:4945`**. On the normal path (Alt+S from a session not already in
Night Mode) `A._nightLights` is empty at :4918, the guard is false, and the block is skipped.

**MEASURED LIVE, both buildings, inside a real `A.startStillRefine()`** (`§SFR_POOL` census):
`"maxLights":30, "nearFadeFloor":0.3` at **every one of the five poses on both buildings** — the
NAVIGATION values. §NIGHT_NEAR_FADE's own comment on that floor: *"exactly backwards for the
complaint now being made: standing under a fixture gives the WEAKEST light in the scene… lifted to
full strength for the frozen still."* It is not lifted. Scale of the miss: `intensity = 2.0 ×
(floor + (1−floor)·min(1, d/15)) × plScale`, so at 3 m a fixture gives 0.44 instead of 1.0 (**2.3×**)
and at 1.5 m 0.37 instead of 1.0 (**2.7×**); at ≥15 m the two are identical, so a facade 12 m out is
untouched. Clinic has **240 luminaires within 15 m** of interior0 and Hospital 114 within 15 m of
its interior1 — i.e. essentially every fixture that lights a room is inside the penalty window.

**⚠ SCOPE, and it matters — this is NOT the film explanation.** `startStillRefine()` runs once per
FOLD, so in a bake frame 1 skips the block (night mode still off) and **frames 2…N do fire it**
(that is the 2,026 firings the §VAC comment at `effects.js:4923` already records from
`s5_hospital.log`, *"raised to 200 lights, near-fade floor 1"*), with `_teardownStillRefine`
(`effects.js:4291-4295`) handing the floor back to 0.3 between frames. So: **a FILM already gets the
still floor from frame 2 onward; an interactive Alt+S never does, and neither does a film's first
frame.** Do not sell this as the cause of the drained bright register in the exported films.
This is a real defect in the Alt+S still path and a 2-line fix (move the block below
`_applyPhotoStaging()`), but its measured EFFECT is not yet trustworthy — see §2c.

### 2. WHAT THE LEVERS MEASURE — two-sided gate, both buildings, `m = 0`

Instrument: `viewer/tests/witness_sun_fill_ratio.js`, real viewer, real split DBs, real
`A.startStillRefine()` staging, scene-linear `FloatType` render-target reads, **no bake, no
screenshot, no film**. Logs: `sfr_clinic6.log`, `sfr_hospital6.log` (session scratchpad).

**Liveliness is measured as SHAPE, not level** (`§SFR_LIVELY`), all from the same single render:
`cv = std/mean`; `p90/p10`; `topShare` (share of frame luminance in the brightest decile — 0.10 is
perfectly flat); `tileCV` (cv of 8×6 tile means = the spatial falloff gradient); `wcStd`
(luminance-weighted stddev of the warm/cool axis `(r−b)/(r+b)` = chromatic separation).
**Every figure is a ratio against the CURRENT shipped state (m = 0, post-#1622)** — #1622's own CV
gain is already in the baseline and is not re-claimed.
**The gate is two-sided:** clear the T3 floors (mean ≥ 0.70, p25 ≥ 0.55, §WALL_SIDE_AND_LIGHT_FLOOR)
**AND** keep `cv` and `tileCV` at ≥ 0.98× the shipped value. A lever that buys the mean by flattening
the field would undo #1622 and is scored **REJECT**, not PASS.

| lever | Clinic retMean / retP90 | Clinic cv · tileCV | Clinic verdict | Hospital retMean / retP90 | Hospital cv · tileCV | Hospital verdict | facade separation |
|---|---|---|---|---|---|---|---|
| shipped `m=0` | 0.743 / 0.892 | 1.00 · 1.00 | baseline | 0.598 / 0.545 | 1.00 · 1.00 | baseline | 0.2503 / 0.2723 |
| **fixtures ×2** (`_nightPLScaleStill` 0.5→**1.0**) | **1.284 / 1.731** | ×0.92 · ×1.10 | REJECT (cv) | **0.814 / 0.844** | **×1.58 · ×1.75** | **WIN** | 0.2591 / 0.2717 |
| **fixtures ×4** (scale 2.0) | **2.130 / 3.118** | ×1.02 · ×1.27 | **WIN** | **1.222 / 1.417** | **×2.22 · ×2.57** | **WIN** | 0.2767 / 0.2704 |
| `m` = HDRI fill 0.25 | 0.914 / 1.118 | ×0.83 · ×0.96 | **REJECT** | 0.683 / 0.649 | ×1.05 · ×1.12 | floors missed | 0.4568 / 0.4318 |
| `m` = HDRI fill 0.50 | 1.040 / 1.290 | ×0.75 · ×0.90 | **REJECT** | 0.837 / 0.810 | ×0.92 · ×1.01 | **REJECT** | 0.6737 / 0.5830 |
| `m` = HDRI fill 1.00 (= RED) | 1.293 / 1.599 | ×0.66 · ×0.83 | **REJECT** | 1.146 / 1.133 | ×0.76 · ×0.89 | **REJECT** | 1.0397 / 0.7997 |

**a. The `m` lever is REJECTED, on both buildings, at every sampled fraction.** It is the textbook
failure the two-sided gate exists to catch: it lifts the mean (0.743 → 1.293 on Clinic) while
driving `cv` **down** (×0.66) and `topShare` down (×0.83), i.e. it buys brightness by flattening the
field — and it costs the facade the whole of #1622 (separation 0.2503 → 1.0397). **U-11's `m` option
should be closed, not tuned.** The one HDRI row that is not an outright REJECT (Hospital s0.25,
"shape kept") does not clear the floors.

**b. The fixture route is the only one that raises the field.** At the shippable ceiling
(`_nightPLScaleStill = 1.0` — `A._nightPLScale`'s own nav-tuned default and the value §STAGED_PL_CUT
cut FROM, so no constant is invented) Hospital is a clean **WIN**: floors cleared, `cv` ×1.58,
`tileCV` ×1.75, `topShare` ×1.37, and the **upper register restored 0.545 → 0.844** — the exact
register the real-bake A/B says drained. **The facade is free**: Hospital's separation moves
0.2723 → 0.2717 across the whole ×1…×4 sweep, Clinic's 0.2503 → 0.2767. Clinic at ×2 clears the
floors and raises `tileCV` (×1.10) and `p90/p10` (×1.39) but dips `cv` to ×0.92, so the gate scores
it REJECT; both buildings are a WIN at ×4, which is `_nightPLScaleStill = 2.0` — **an invented
constant, so it is not proposable.**

**c. OPT_F (the near-field floor), OPT_B (decay 2.0) and OPT_D (emissive ×3) are INCONCLUSIVE, not
measured.** OPT_F reports a **darker** frame (retMean 0.563 Clinic / 0.435 Hospital) while the
shipped pool total it produced **rose** (Clinic 147.936 → 171.04 at extSun, live lights 99 → 122).
That is physically impossible for purely additive light — `floor + (1−floor)·fade` is monotone
non-decreasing in `floor` — so the reading is an instrument fault, not a property of the lever.
See §3.

**d. The colour levers (A and C) are CLOSED without a render** — see §SFR_LIVELY option A + C below.

### 3. THE THIRD INSTRUMENT DEFECT — PROBE CROSS-CONTAMINATION, and how it was isolated

This lane has now hit three instrument faults in a row, and they cost more than the measurement did.
Recorded so the next session recognises the shape:

1. **`tools.js`'s pooled fixture update overwrote a per-light sweep** (already on record above) — a
   per-light intensity write is recomputed from `A._nightPLScale` on the next update, so the sweep
   measured nothing and reported a clean 0.
2. **The light-group restore map captured empty** (§0) — manufactured `pl = 0.00000` and two
   published claims.
3. **Probe cross-contamination (new).** In the first clean run the option probes ran in sequence
   within one pose, each restoring what it changed. Two did not restore:
   - `W.setPLDecay` cached ONE scalar base off `ls[0]` — which is a **city-prop** point light with
     `decay = 2`, not a fixture light with `decay = 1` (visible in the `§SFR_POOL` colour census as
     `"decay":"1..2"`). "Restoring" therefore set **every fixture light to decay 2 permanently**,
     dimming the whole far field for the rest of the pose.
   - `W.setNearFadeFloor` let a non-finite value through `f < 0` into `A._nightNearFadeFloor`, where
     `floor + (1−floor)·fade` turns it into 0-or-NaN, and then **rebuilt the pool from it**.

   **How it was isolated — the signature, not a guess:** on both buildings the four option rows
   downstream of the first bad probe reported **byte-identical** `retP25 / retP90 / retP10`
   (Hospital: 0.473 / 0.365 / 0.511 on all four; Clinic interior2: `nearFadeStill` and `decay2` both
   exactly 0.15612). Four different levers cannot produce identical percentiles; a dead pool can.
   Fixes now in the witness: per-light decay base (a Map, not a scalar), a hard range guard on the
   floor, the fallback `m` sweep moved BEFORE any option probe so it can never sit downstream of
   one, and — the general remedy — **every sample now records the pool it was taken against**
   (`pool[live=… sum=… floor=… scale=… decay=…]`) and any row with `poolLive = 0` prints
   `INCONCLUSIVE` instead of a verdict.
4. **A fourth, still open.** Even after those fixes, the baseline sample's own pool disagrees with
   the pose census taken moments earlier (Clinic interior0: `pl_x1` reads `pool[live=46 sum=88.036]`
   against a census of `sum=103.084`; the missing ~16 lights are the city props). Consequence:
   **the interior baseline is not reproducible run to run** — Clinic's baseline `cv` read 1.0825 in
   one run and 0.5207 in the next, a 2× swing in the headline metric, far outside the RED CONTROL's
   own drift (0.00000 Clinic / 0.01278 Hospital). **Until that is closed, no lever's ranking is
   safe and nothing here should ship.**

**Instrument changes that DID gate clean and are worth keeping:**
- **§SFR_FROZEN_POOL.** Refreshing the pool per pose is mandatory (the shipped still branch selects
  by camera frustum, so the pool is pose-dependent) — but on the shipped churn path every pose change
  moves the scene's point-light COUNT, a shader DEFINE, and two full runs sat **>20 min inside a
  single wall pose** recompiling. The witness now runs the SHIPPED `§NIGHT_BAKE_POOL` path
  (`A._maxqActive`), which freezes the slot count and updates position/colour/intensity as uniforms.
  **POOL-MODE CONTROL passes on both buildings: `relDrift = 0.00000`** (same pose, camera untouched).
  Its first version FAILED at 0.179 because it read before the churn-path refresh and so compared a
  stale pool against a fresh one — a confounded control, corrected by reordering, not explained away.
- **FREEZE CONTROL** Clinic 0.00000 / **Hospital 0.00515 (FAIL, gate 0.005)** — Hospital's shadow
  freeze is marginal and its RED CONTROL also failed at **0.01278**. Hospital's run therefore carries
  ~1.3 % instrument drift; the effect sizes above (×1.58, ×1.75) are well clear of it, the `m` rows'
  shape deltas mostly are not.

### 4. WHAT THIS MEANS FOR THE COMPOSITION (sun shafts through windows) — noted, not built

A fixture-lit interior at `_nightPLScaleStill = 1.0` raises the interior's own `topShare` (Hospital
×1.37) and `tileCV` (×1.75) while leaving the facade separation flat (0.2723 → 0.2717). A shaft is a
high-`topShare`, high-`tileCV` feature in the same frame, so the two ADD rather than compete: the
room's ambient floor does not rise (ambient/hemi/env are untouched), only the fixture-lit patches do,
which preserves the contrast a shaft needs to read. The `m` lever would do the opposite — it raises
the whole non-directional floor, which is precisely what washes a shaft out. **Not built, not
measured; recorded as the prediction to test if shafts are ever specced.**

### 5. §SFR_NEXT — the exact next step, and the one blocking question

1. **Close instrument fault #4 first** (§3.4). The baseline sample must reproduce the pose census
   (`pl_x1.pool.sum == census.sum`) before any ranking is trusted. Likely cause to check first: the
   city-prop point lights (`effects.js:660-723`) are in `W.pointLights()` but are NOT rebuilt by
   `A._nightUpdateLights()`, so `W._plBase` and the group-restore maps can disagree about them.
   Add an assertion that the two agree and re-run both buildings. **Everything else waits on this.**
2. Then re-measure OPT_F/B/D with the hardened probes and settle §1's fix.
3. `§NIGHT_STILL_LIGHTS` ordering fix (`effects.js` — move the :4918 block below the
   `_applyPhotoStaging()` call at :4945) is a real, independently-proven defect and is a 2-line
   change; hold it until step 1 lets its effect be measured, so it does not ship unmeasured.

⛔ **THE ONE USER QUESTION (→ AGENT_QUEUE U-11):** the only lever that passes the two-sided gate on
BOTH buildings is `_nightPLScaleStill = 2.0` (fixtures ×4), which is an invented constant. The
largest *repo-native* value, `_nightPLScaleStill = 1.0` (fixtures ×2), passes cleanly on Hospital and
fails Clinic on `cv` alone (×0.92) — and it **partially reverses §STAGED_PL_CUT, a standing user
directive** (*"too bright … reduce PLs or intensity. As it also wipe out the ground slab shadow play
during alt-c movie baking"*). Measured, that directive's stated harm is small at the wall poses
(separation moves ≤ 0.026 across the whole sweep) but **the ground slab was never in the measured
set.** So: *do you accept undoing half of §STAGED_PL_CUT (staged fixture scale 0.5 → 1.0) to get the
interior's own fixtures back, given the away-wall read is measured to cost ≤ 0.026 and the ground
slab is unmeasured?*

### §SFR_LIVELY option A + C — the colour lever is ALREADY at its ceiling, closed WITHOUT a render (2026-09-02, `nlc_spread.log`, `colour_spread_probe.js`)

Candidate A was *"fixture colour temperature (~2700–3000 K warm against a cooler sky)"* and C was
*"per-fixture variation derived from the model's own fixture type/class — not random, not
per-building."* **Both already ship, and what ships is the best of the three the repo can express.**
`A.nightLightColor(name, key)` (`tools.js:1151`) is called from exactly one place
(`A._nightFixtureWorldPositions`, `tools.js:1631`) and ALWAYS with a `key`, so the 20/20/60 hash mix
(`NIGHT_MIX_BLUE 0xa8c8ff` / `NIGHT_MIX_AMBER 0xffb45c` / `NIGHT_MIX_WHITE 0xffffff`) always wins —
the mix the user asked for by name.

Measured on `wc = (r−b)/(r+b)`, the same scale-invariant chromatic axis §SFR_LIVELY scores, over the
real luminaire population selected by tools.js's own §NIGHT_FIXTURE_VOCAB `WHERE` clause:

| building | luminaires | SHIPPED hash mix `wcStd` | option C (white bucket tinted by the model's own name) | the type rule alone |
|---|---|---|---|---|
| Clinic | 884 (47 exit) | **0.2179** | 0.2201 (**+1.0 %**) | 0.1249 (**−42.7 %**) |
| Hospital | 1,272 (57 exit) | **0.2182** | 0.2181 (**−0.1 %**) | 0.0581 (**−73.4 %**) |
| Terminal | 814 (38 exit) | **0.2256** | 0.2286 (**+1.3 %**) | 0.1019 (**−54.8 %**) |

- **Option C as framed — "derive it from the fixture type, not random" — is measurably WORSE, by
  43–73 %.** The type vocabulary collapses a building onto two or three temperatures: Hospital has
  **0** troffer/batten/T8 names and only **64** downlight/sconce/pendant of 1,272, so 1,151 fixtures
  fall to a single `NIGHT_AMBER` fallback. The hash is not "random" in the sense that matters — it is
  FNV-1a over `name|x,y,z`, deterministic across sessions and machines, and it is the only rule that
  keeps three temperatures on a model whose names state nothing.
- **A real doc-vs-code defect, but NOT a liveliness lever:** `NIGHT_WHITE_COOL 0xf2f6ff` and
  `NIGHT_WHITE_WARM 0xfff4e4` (`tools.js:1137/1138`) are **declared and referenced nowhere in
  `viewer/`**, while the §NIGHT_MIX_WHITE comment three lines above states as fact that *"the white
  bucket is neutral by default and tinted a few points when the model says which it is."* It is not.
  Wiring them in moves `wcStd` by **+1.0 % / −0.1 % / +1.3 %**. Fix the comment or wire the
  constants — but do not spend a render on it and do not sell it as liveliness.
- **0 of the 2,970 luminaires on Clinic/Hospital state `cw`/`ww`** (Terminal states 368), so the
  "stated temperature outranks the type default" path is, on the two buildings under test, a
  population of zero. Recorded so no future session re-derives it.

### §SFR_LIVELY option E — exposure/tone cannot add liveliness, BY IDENTITY (no run spent)

`toneMappingExposure` multiplies the linear colour **before** the ACES curve — verified in this
repo's own bundled three.js, not from memory: `viewer/lib/three.module.min.js` contains
`color *= toneMappingExposure / 0.6;` as the first line of `ACESFilmicToneMapping`, ahead of
`ACESInputMat`/`RRTAndODTFit`. A scalar multiply leaves **every** §SFR_LIVELY metric exactly
invariant (`cv`, `p90/p10`, `topShare`, `tileCV`, `wcStd` are all ratios or scale-invariant moments).
So exposure cannot manufacture shape; only the curve can, and it ends in `saturate(color)`, which
compresses the highlights — the register that is already drained. **Ranked last, and closed.**
(Also verified in the same bundle: `toneMapping` is forced to `NoToneMapping` whenever the render
target is not the canvas — `r.toneMapped && (null !== F && !0 !== F.isXRRenderTarget || (Le = e.toneMapping))`
— which is what makes every render-target read in this witness scene-linear.)

## §BAKE_INTERIOR_TOPUP — 2026-09-04 — ✅ SHIPPED (witness), bim-ootb PR #1642

> **USER, 2026-09-04, mid Hospital Alt+C bake:** *"i can visually see that the indoor is gloomy and
> not lively. Discuss. if it is color, or surface, or lighting effects?"* and, minutes later, the
> sentence that decided it: *"I noted that outside the scene of the building is very lively, thus
> indoors can also be."* Later still, on the second bake: *"On indoors, it is still ok, but been
> livelier while maintaining realism be good."*

### §BIT.0 — the three-way answer, with the number that decides each

**It is LIGHTING. Colour and surface are exonerated by measurement, not by argument.**

| candidate | verdict | the number |
|---|---|---|
| colour | **improved**, not regressed | #1621 §MEP_COLOR_SURVIVES_PHOTOREAL + #1604 §MEP_DISC_PALETTE gave MEP its trade colour back instead of uniform grey metal |
| surface | **improved**, not regressed | roughness/metalness are CLASS-keyed (`streaming.js:1219/1233`), untouched this window; #1631 §DUCT_SILHOUETTE added outlines |
| lighting | **the cause** | see §BIT.1 |

A lead that had to be RETRACTED, recorded so it is not re-chased: `~/Downloads/Hospital_silent.db`
carries `material_name` NULL on all 64,150 rows while the served `Hospital_meta.db` has 17 distinct
names, which looked like it would collapse the glossy set and strip the HDRI from everything. **It
does not.** `material_name` never reaches roughness/metalness — the rule is class-keyed — and the
glossy census is IDENTICAL across the two DBs: 56/82 material keys by the parsed `STD_MAT` rule,
59,890/63,182 elements (94.8%); browser-confirmed 97 materials / 71 glossy / 59,924 of 63,316
(94.6%), so #1622's "70/70 Hospital glossy still on the HDRI" holds. The user's local DB is not
handicapped.

### §BIT.1 — the defect: a bake pose can select ZERO fixture lights, and scaling zero is zero

`tools.js _nightUpdateLights`'s still/bake branch (§NIGHT_STILL_FRUSTUM, 2026-08-07) selected
fixture point lights by **frustum-CENTRE containment only, with no floor**. An interior pose is
precisely the case that test answers wrong: the troffers lighting the room you stand in sit
overhead or behind the eye, so the set comes back short — or empty.

Since §NIGHT_BAKE_POOL (2026-09-01) froze the pool size for the whole bake, an empty set no longer
disposes the lights; it leaves **every pooled slot at intensity 0**. The room is then lit by flat
ambient + hemi fill alone. Two consequences worth stating plainly:

- **This is why the exterior stayed lively while the interior did not.** Photo staging turns the
  sun's shadow casting on, so an interior surface is shadow-occluded from the sun and depends on the
  fixtures for everything that is not flat fill; an exterior surface keeps the sun and loses almost
  nothing. One mechanism, both halves of the user's report — and it also explains the older
  "Fly/handsfree is well lit, the bake is dark" split, since navigation never takes the frustum
  branch (§NIGHT_STILL_BOOST_GATE_FIX).
- **It supersedes the U-11 fixture-scale question for the FILM case.** `_nightPLScaleStill` (0.5,
  §STAGED_PL_CUT) *scales this set*. Scaling zero is zero, so no value of that constant could ever
  have reached a pose whose selection was empty. U-11's `m`-lever remains closed and its fixture
  lever remains a live user decision for Alt+S, but neither is the film explanation.

Also live and fixed here: **§BAKE_FRUSTUM_STALE** — the frustum was built from
`camera.matrixWorldInverse` with no `updateMatrixWorld()`, while `cinema_maxq.js` sets the pose and
calls `startStillRefine()` *before* any render of it. The cull was running against the previous
frame's view.

### §BIT.2 — the fix, and what was deliberately NOT taken

Reuse, not reinvention: the in-frustum set is **topped up** to the still budget using the SAME
nearest-to-aim + §NIGHT_SPREAD rule navigation already uses, extracted VERBATIM as
`_nightPickNearest` (§NIGHT_PICK_NEAREST) so nav and bake cannot drift into two selection rules.
Nav calls it with an empty `already` set and is behaviourally identical. The in-frustum set is
**never truncated** — the top-up only fills the remainder. No new constant, no fitted value.

This is the `tools.js` half of the **parked PR #1327 §BAKE_INTERIOR_LIGHTS** (2026-08-12), which
measured the same defect on a headless Duplex bake: 18 fixture lights at frame 0, **0 from frame 1
for the rest of the film**, scene point-light intensity sum 127.39 → 82.39 = exactly
18 × NIGHT_LIGHT_INTENSITY(2.5). That PR sat 312 commits behind main; its own triage note
(2026-09-02) records `viewer/effects.js` as a **non-mechanical** conflict against §NIGHT_BAKE_POOL /
§STAGED_PL_CUT and rules it unsafe to blind-merge. Taking only the `tools.js` half avoids that
conflict entirely.

**NOT taken, on purpose:**
1. #1327's `effects.js` re-arm-gate fix (the gates read `A._nightLights.length`, the OUTPUT of the
   selector). §NIGHT_BAKE_POOL keeps that array full for the whole bake, so the self-latching zero
   is already masked *for films*. It is still live for interactive Alt+S — see U-11's measurement of
   `nearFadeFloor: 0.3, maxLights: 30` at five live poses — and remains open there.
2. #1327's **§BAKE_LIGHT_BUILDUP_GATE**, which would gate the illumination on Time Machine
   placement so a light cannot shine from an un-installed fitting. It is correct in principle and
   the glow sprite already does it (`§PHOTO_GLOW_SPRITE_GATE 0/18 fixtures placed yet` while 18
   point lights shone from those same fittings), but it **REMOVES** interior light during round 1
   of a 4D film, which runs against the user's live ask. It needs its own decision, not a silent
   ride-along.

### §BIT.3 — witness

`viewer/tests/witness_bake_interior_topup.js` — **W-BAKE-TOPUP 8/8, RED control detected.** Whitebox,
no browser: slices `_nightPickNearest` and `_nightUpdateLights` out of the shipped `tools.js` by
brace matching and reads `NIGHT_SPREAD_MIN_M` from the file rather than hardcoding it, so it cannot
pass against a copy that is not what ships. The verdict line prints NO-OP (the top-up never changed
a selection), VACUOUS (no scenario judged) or INCONCLUSIVE (the slice failed) instead of PASS.

```
§BAKE_INTERIOR_TOPUP_ROW bake-interior-frustum-empty fixtures=40 budget=50 inFrustum=0  lit=40
§BAKE_INTERIOR_TOPUP_ROW bake-interior-frustum-short fixtures=40 budget=50 inFrustum=3  lit=40
§BAKE_INTERIOR_TOPUP_ROW bake-wide-frustum-full      fixtures=80 budget=50 inFrustum=60 lit=60
§BAKE_INTERIOR_TOPUP_ROW alt-s-frustum-short         fixtures=40 budget=50 inFrustum=2  lit=40
§BAKE_INTERIOR_TOPUP_ROW nav-no-still                fixtures=40 budget=24 inFrustum=0  lit=24
```

The shipped runtime line to look for in the next bake log is
`§BAKE_INTERIOR_TOPUP inFrustum=N toppedUpTo=M budget=B fixtures=F`, run-length guarded (it would
otherwise fire once per baked frame). An `inFrustum=0` row names itself: *"frustum found NO fixture
centre at this pose; without the top-up this frame had zero fixture light"*.

### §BIT.4 — what is still open

- The **⛔ U-11 fixture-scale decision** (staged `_nightPLScaleStill` 0.5 → 1.0, partially reversing
  §STAGED_PL_CUT) is unchanged and still the user's. It now applies to a set that is actually
  populated, so its measured effect should be RE-TAKEN after #1642 rather than read off the
  pre-#1642 sweep.
- **NOT MEASURED:** how many poses of a real Hospital film actually had `inFrustum=0`. The defect is
  proven structurally and by #1327's Duplex run; the Hospital-specific frequency needs the shipped
  `§BAKE_INTERIOR_TOPUP` line from the user's next bake log. Do not quote a number for it until then.
- #1327 should be closed as superseded-in-part once #1642 lands, with its two untaken halves carried
  forward rather than lost.

## §BAKE_MISSING_ELEMENTS — 2026-09-04 — 🟠 ROOT CAUSE MEASURED (§BME.8), FIX RED/GREEN-PROVEN (§BME.10), bim-ootb PR #1660. READ §BME.10 (newest, at the END of this file) THEN §BME.9 — §BME.1–§BME.6 are the pre-solution record

> **USER, on the landed Hospital silent bake** (`~/Downloads/Hospital_silent_bake_2026-09-04.mp4`,
> 2,937 frames, 195.8 s, sw v1138):
> *"some window glass panels not landed completely, leaving omissions. This maybe with other elements
> too thruout. This seems an anomaly as all this while they land evenly and completely."*
> … *"comparing to previous bake at seconds 47-55"* … *"they are selective not thru out"*
> … *"Even at 1min22sec u can see some chairs but not full table sets. This is erroneus behaviour
> introduced."* … *"before this is was not an issue."*

**THE DEFECT IS REAL AND IT IS NOT SOLVED.** Everything below is measured; the cause is still open.

### §BME.1 — what is CONFIRMED (do not re-derive)
- **Visually confirmed at full build.** Frame at **78 s** (fly-back) reads `Day 310 / 310` — the
  buildup is COMPLETE — and the left elevation still shows bays open to the interior with only a
  couple of infill panels. **So it is NOT schedule pacing.** (The user's own invariant, and it is
  correct: *"In the return to start, the whole buildup is supposed to be fully completed."*)
- Previous bake for contrast: `BIM_MaxQ_Hospital_1788397252225.mp4` (2026-09-03 09:00, 3,118 frames,
  207.9 s) at the same second reads `Day 273 / 507` with the ribbon glazing solid. Different film
  lengths, so timecodes do NOT align frame-for-frame — the Day 310/310 frame is the load-bearing one.
- **It spans classes**: glass panels at 0:47–0:55, and *"some chairs but not full table sets"* at
  1:22. Partial sets of an assembly, across unrelated classes. Not a discipline, not one material.

### §BME.2 — what is RULED OUT, with the number that rules it out
| candidate | verdict | evidence |
|---|---|---|
| schedule / buildup omission | **OUT** | `§CPE_BUILDUP frame=2936/2937 t=1.000 placed=63415/63415`; `kernel_ops` holds exactly 63,415 `ELEMENT_PLACE` ops |
| missing geometry in the DB | **OUT** | every `IfcPlate` 2211, `IfcMember` 7127, `IfcWindow` 131 has an `element_instances` row AND its `geometry_hash` resolves in `component_geometries` — 0 missing |
| placement timing | **OUT** | on the played layer: `IfcWindow` all by 8.7 s, `IfcCurtainWall` 43.4 s, `IfcPlate` 44.6 s, `IfcMember` 44.7 s (buildup spans 0→70.7 s) |
| discipline tagging / selective ARC strip | **OUT** | `IfcPlate` 2211/2211 ARC, `IfcCurtainWall` 178/178 ARC, `IfcWindow` 131/131 ARC (only oddity: `IfcMember` 7122 ARC + **5 STR**) |
| the Reveal ghost | **OUT** | ghost starts at frame 1357 (**1:30**), after the 0:47–0:55 report; and `§DVS_REVEAL_ALL drawn=63182/63182 after filterDiscs(null)` |
| Reveal slot leakage | **OUT** | `§DVS_REVEAL_SLOT` PLB 9121/9121, FP 14357/14357, ELEC 2798/2798, MEP 19670/19670, `leakOtherDiscs=0` |
| non-determinism | **OUT** | the bake seeds `Math.random` with an LCG per frame and restores it (`cinema_maxq.js:686-690`); its only callers are city skyline and staffage props, never a BIM element |

### §BME.3 — TWO RETRACTIONS. Do not resurrect either.
1. **"All 178 IfcCurtainWall are absent, that's the missing glass" — WRONG.** They have **zero**
   `element_instances` (178/178), as do 24 `IfcRoof` and 31 `IfcStair` — the `absent=233` set. They
   are pure aggregate containers whose glazing IS their `IfcPlate`/`IfcMember` children. They were
   never drawable **in any bake, including the ones that looked right**, so they cannot be what
   changed. Still a real schedule-hygiene defect (they inflate `placed=63415` and occupy programme
   time for something that can never appear) — but a DIFFERENT one, and not this.
2. **"§SUN_FILL_RATIO's map swap causes recompile churn" — WRONG, disproven by its own witness.**
   Under a regenerating sky the two-target version recompiles FEWER times (10 vs 16 over 3 regens),
   because the matte set is pinned to a stable reference. The hazard it really carried was the
   STALE REFERENCE, closed by §SFR_UNIFORM_NOT_DEFINE (#1659).

### §BME.4 — THE OPEN LEAD, and the instrument's own blind spot
`viewer/tests/witness_tm_drawn_vs_scheduled.js` (PR #1658, **ships RED on purpose**) compares
SCHEDULED against DRAWN per class per cursor. Two live failures on `Hospital_silent_local`:

- **`other` = missing, but neither §XRAY-staged nor absent — and it persists to `t=1.0`.** This is
  the residue and the best lead: `IfcColumn` maxMissing 109 (**57 not staged**), `IfcBeam` 37 (**23**),
  `IfcSlab` 12 (**10**), `IfcWall` 1 (1). `missWindow_t=0.01..1` — the WHOLE film.
- **`§XRAY_EDGES … staged=544/63415`** — "elements whose last support carrier finishes after their
  own reveal". Every early-film miss is one of these (`t=0.020 sched=716 drawn=603 missing=113
  staged=113`). Same root as §M Q3's 237 indefensible structural midair.

⚠ **THE INSTRUMENT DOES NOT REPRODUCE THE USER'S SYMPTOM YET, AND THAT IS ITS OWN DEFECT.** It loads
the model fully, scrubs the TM cursor, and counts scene-graph visibility. The bake draws each frame
through **photoreal staging**. `IfcPlate 2211/2211 drawn` means "visible objects at that cursor", NOT
"rendered in that frame". Selective loss *inside a staged frame* is invisible to it. **Next session's
first job: census what a STAGED frame actually draws** — hook `onBeforeRender` on the meshes and
count how many fire during one real staged render at the bake's own pose (`plan.poseAt`) at Day
310/310, and extend the class list beyond the glass set to `IfcFurniture` (the 1:22 table report).

### §BME.5 — what shipped this session that touches the render path (suspect list, in landing order)
`#1604 §MEP_DISC_PALETTE` (InstancedMesh discipline resolution — the tag drives BOTH colour and the
`filterDiscs` visibility filter) · `#1622 §SUN_FILL_RATIO` · `#1631 §DUCT_SILHOUETTE` (rewrites
vertex data) · `#1633 §CPE_REVEAL_ARCH_HOLD` · `#1642 §BAKE_INTERIOR_TOPUP` · `#1649
§CPE_TAIL_LIGHTS_ALL_ONLY` · `#1659 §SFR_UNIFORM_NOT_DEFINE`. The user's marker is *"before this it
was not an issue"* and the last clean bake is **2026-09-03 09:00**, so anything merged AFTER
2026-09-03 01:00 UTC is in scope and anything before it is not.

### §BME.6 — reproduction, ready to run
```
cd ~/bim-ootb && node viewer/tests/witness_tm_drawn_vs_scheduled.js      # BLD defaults to Hospital_silent_local
ffmpeg -ss 78 -i ~/Downloads/Hospital_silent_bake_2026-09-04.mp4 -frames:v 1 out.png   # Day 310/310, bays open
```
The user's DB is `~/Downloads/Hospital_silent.db`, symlinked into `buildings/Hospital_silent_local.db`.

### §BME.7 — 2026-09-04 — SPEC: the STAGED-FRAME CENSUS (the instrument §BME.4 asked for)
**Claim under test (W-SDC):** in a frame rendered THROUGH photoreal staging by the real `__maxqBake`
loop (clipped to the film window around 78 s, `--clip in:out`), every element the scene graph says is
visible AND whose bounding sphere lies inside the capture camera's frustum is submitted to the GPU in
the last colour pass before `_captureFrame` reads the canvas. If it is not, the census names the
class, the representation and sample guids — that is the "selective loss inside a staged frame"
§BME.4 said the plain-scene instrument cannot see.
**Instrument:** `cli_silent_bake.js --clip in:out --tap viewer/tests/tap_staged_draw_census.js`
(dev-only, same family as `__maxqPoseTap`). The tap wraps: `renderer.render` (pass tagging —
colour = main scene, no `overrideMaterial`); `BatchedMesh.prototype.onBeforeRender` (reads
`_indirectTexture.image.data[0.._multiDrawCount)`, the exact instance ids three r185 submits —
extracted from `three.core.min.js` `class Eo`, not assumed); `Object3D.prototype.onBeforeRender`
(InstancedMesh: whole-object draw, per-instance = non-zero matrix, `count` vs meta length). Capture
moment = `CanvasRenderingContext2D.drawImage(renderer.domElement)`, `_captureFrame`'s own read.
**§-lines (in the bake log, `§CLI_BAKE_TAP` block, and `<out>_tap.json`):**
- `§SDC_FRAME i= film_t= passes= colorPasses= bmObjs= imObjs= drawnBm= drawnIm=`
- `§SDC_CLASS i= cls= visible= inFrustum= drawn= notDrawn= sample=<guids>` — notDrawn = visible ∧
  strictly-in-frustum (0.05 m margin, so TAA jitter cannot count) ∧ not in the last colour pass.
- `§SDC_INSTANCED i= cls= objs= drawnObjs= countShort=` — `count` < meta length = instances the GPU never sees.
- `§SDC_MAT i= uuid= type= <field>:<old>→<new>` — a drawn material whose visible/opacity/transparent/
  transmission/envMap/depthWrite/program-diagnostic changed between frames.
- `§SDC_BOUNDS_STALE bm= geoms= stale=` — once: `_geometryInfo` sphere vs one recomputed from the batched positions.
**Verdict:** `witness_staged_draw_census.js` reads `<out>_tap.json` through `witness_kit/contract.js`:
PASS = notDrawn=0 and countShort=0 in every frame; INCONCLUSIVE = no frame captured or no colour pass
seen; RED CONTROL = one row mutated to notDrawn=1 must fail.
**Pixel reproduction (separate, numeric):** the clip frame whose film_t is nearest 78 s vs the film's
own 78 s frame (ffmpeg): mean |Δluma| whole-frame and over the left-elevation crop. Reproduces if
both are within 10× the §MAXQ_FRAME_BUDGET noise floor (RMS 0.21). If it does NOT reproduce, the
symptom depends on bake history or environment and the clip must start before topout.

### §BME.8 — 2026-09-04 — ROOT CAUSE FOUND AND MEASURED: dlod.js "restored" 24,992 instances to ZERO matrices it had captured after the Time Machine zeroed them
**Instrument that found it:** the full-film §SDC census (`cli_silent_bake.js --tap`, 2,937 frames, the
film's own DB and path). Per-frame, per-class: `visible` (scene graph) · `inFrustum` · `drawn` (GPU
draw list). Verdict on the render: `notDrawnTotal=2` over 2,937 frames (two IfcRailing slots on the
frustum edge) — **the renderer draws everything the scene graph shows.** The loss is upstream:
- `IfcPlate` visible 2050 → **1081 at frame 718 and never again higher, to frame 2936 (Day 310/310)**;
  `IfcMember` 6206 → 1885; `IfcFurniture` 201 → 22; `IfcWindow` 131 → 85. The lost ones are exactly
  the **InstancedMesh** representation (`imPlaced` 969 → 0 for plates, 4321 → 0 members, 179 → 0
  furniture, frames 712–718 = film 47.5–47.9 s — the user's "0:47–0:55"). BatchedMesh slots untouched.
  **"Selective within a set" = same class, two representations; only the instanced half died.**
- The §-line that fired there: `§DLOD_TICK … imHid=3337 imVis=21676` (frame 714) → `imHid=21 imVis=24992`
  (frame 718): dlod.js's per-instance frustum culler "restored" 24,992 instances into view.
- What it restored: `m._origMatrix`, captured by `_buildRefs()` — which ran at **`§DLOD_REFS built
  instanced=2872 imInstances=25013` at log line 658, AFTER `§MAXQ_FRAME i=0`** and after
  `tmActivateForBake` had zero-scaled every unplaced instance (cursor at day 0). So `_origMatrix` = a
  zero-scale matrix for essentially every instance; every later "restore" wrote zero. Instances that
  never left the frustum after TM placed them survived; every one that left and came back is gone.
- Why the refs were late: `dlodEnable()` (streaming end) marks refs dirty and calls `dlodTick()`, but
  the tick returns BEFORE `_buildRefs()` when the camera is idle. A CLI page never moves the camera
  until the bake's own frame 0 — by then TM owns the matrices. **An interactive bake (every
  `BIM_MaxQ_Hospital_*.mp4` before this) had navigated first, so its refs held real matrices.** That
  is the whole of "before this it was not an issue": the defective film is the first CLI silent bake
  of Hospital. Nothing in #1604–#1659 caused it; dlod.js last changed 2026-08-05.
- The fight is two-way (S258 landmine, `project_dlod_geometry_swap_landmine.md`): TM's own lazy save
  (`_savedInstanceMatrices`, time_machine.js ~1601) reads CURRENT matrices, so an instance dlod.js had
  zeroed before TM's first pass would be saved as zero by TM too.
**FIX (§DLOD_TM_OWNERSHIP): one owner of instance matrices at a time.** TM activation
(`_finishActivate`, the single point both the pill and `tmActivateForBake` reach) calls
`A.dlodDisable('time-machine')` first — dlod.js restores its own hides while `_origMatrix` is still
real, then stands down; `dlodEnable()` refuses while `app._tmOn` (`§DLOD_SKIP_TM`); `dlodTick()` is
gated on `!app._tmOn`; TM `deactivate()` re-enables after `restoreVisibility(true)`.
**Witness:** `viewer/tests/witness_dlod_tm_ownership.js` — the CLI's exact ordering (idle camera →
TM on at day 0 → first camera move → cursor to end → camera out of and back into view); asserts every
placed instance holds a non-zero matrix at the end and the `§DLOD_DISABLE reason=time-machine` line
was emitted. RED before the fix, GREEN after; red control via witness_kit.
**Retractions from this session (do not resurrect):** (1) `§SDC_BOUNDS_STALE stale=14138 worstM=62`
(first tap run) was the tap scanning the VERTEX range, which includes vertices the index never
references; the index-range recomputation three actually uses (`witness_bm_bounds_cull.js`) measured
**stale=0, wronglyCulled=0** at all seven recorded poses. (2) The first two clipped runs (`--clip
0.394:0.402`) showed a Reveal slot at u=0.40 for two unrelated reasons: the bake loop fed the Reveal
its clip-local `_tn` (fixed, §CPE_CLIP_REVEAL_FILM_T), and run B reused run A's Chromium profile, whose
service worker served the pre-fix `cinema_maxq.js` (a fresh `--profile` per run from now on).

### §BME.9 — 2026-09-04 SESSION CLOSE — RESUME HERE
**State:** root cause measured and named (§BME.8: dlod.js ↔ Time Machine matrix ownership, CLI-bake
ordering). Fix + instruments on **bim-ootb PR #1660** (`test/staged-draw-census`, commit 7eafe999,
sw v1139). **Deliberately NOT armed for auto-merge.** Worktree pruned; re-create from the branch.
**What is proven (§-log, primary evidence):** full-film census `scratchpad/full_census.log` of this
session (not persisted — re-run if needed, ~52 min): `§DLOD_REFS built … imInstances=25013` at log
line 658 AFTER `§MAXQ_FRAME i=0`; `§DLOD_TICK … imHid=21 imVis=24992` at frame 718; `§SDC_CLASS`
`IfcPlate imPlaced 969→0`, `IfcMember 4321→0`, `IfcFurniture 179→0` frames 712–718, still 0 at
frame 2936; `notDrawnTotal=2/2937 frames` on the render side. GREEN run of the ownership witness on
the fixed tree: `§DLOD_DISABLE(time-machine)=1`, refs never rebuilt under TM.
**What is NOT yet proven — do these, in order, before merging #1660:**
1. Make `viewer/tests/witness_dlod_tm_ownership.js` go RED on unfixed main. Its far/near pass did
   not evaluate the culler (main.js animate loop self-parks, §IDLE_GATE; `markDirty()` alone did not
   wake it headless). Drive it the way `tour.js:1636` does after each camera set:
   `A._dlodFrame = -1; A.dlodTick();` — then `ROOT=~/bim-ootb LOG=/tmp/dto_red.log node viewer/tests/witness_dlod_tm_ownership.js`
   must print `lost>0` for IfcPlate/IfcMember/IfcFurniture, and the worktree run `lost=0`.
2. The user's ask, verbatim: *"after it is solved, do a silent bake of Hospital_silent.db"*. From the
   PR worktree, FRESH `--profile` (a reused Chromium profile's service worker served stale JS this
   session):
   `node cli_silent_bake.js --db Hospital_silent_local --gpu real --tap viewer/tests/tap_staged_draw_census.js --out ~/Downloads/Hospital_silent_bake_2026-09-05.mp4 --log ~/Downloads/Hospital_silent_bake_2026-09-05.log --profile /tmp/silent-bake-profile-fresh-$$`
   (`buildings/Hospital_silent_local.db` → symlink to `~/Downloads/Hospital_silent.db` in the worktree).
   Pass = `§SDC_CLASS i=2936 cls=IfcPlate … imPlaced=` **≥ 969** (the pre-loss value) and
   `§DLOD_SKIP_TM`/`§DLOD_DISABLE reason=time-machine` present; no `§DLOD_TICK` line after
   `§MAXQ_FRAME i=0`. Then `python3 scratchpad/tap_analyze.py <out>_tap.json` (script lost with the
   scratchpad — 40 lines, re-derive from §BME.7's row schema) or just grep the lines above.
3. Merge #1660 (`gh pr merge 1660 --auto --squash`), then deploy per `feedback_deployment.md`.
**Open threads found on the way (not blocking):** (a) the 53 batched slots the TM delta path leaves
hidden at the end cursor (`§DVS_END_DELTA_VS_FULL delta: missing=53 (B=41 I=12) | full: 0`,
IfcColumn/IfcBeam/IfcSlab) — real, separate, unowned; (b) `§CPE_STATS_TAIL` uses the clip-local `_tn`
as u (log says "u=0.364" in a 0.394–0.402 clip) — cosmetic in clip mode only; (c) the 178
IfcCurtainWall / 24 IfcRoof / 31 IfcStair with no geometry still occupy programme time (§BME.3).

### §BME.10 — 2026-09-04 (later) — ITEM 1 CLOSED: the ownership witness is RED on main and GREEN on the fix
**§BME.9 item 1 is done.** `viewer/tests/witness_dlod_tm_ownership.js` now judges. It could not
before, and the reason was TWO instrument defects, not one — the second is worth keeping because it
is the defect's own signature and would be re-derived otherwise:

1. **The culler never ran.** main.js's animate loop self-parks when idle (§IDLE_GATE) and
   `markDirty()` alone did not wake it headless. `flyTo()` now drives it directly after every camera
   set, the way `tour.js:1636` (`_scrubAfterJump`) does: `A._dlodFrame = -1; A.dlodTick();`.
2. **The near pose looked away from where the refs actually are.** `_buildRefs()` (dlod.js:54)
   reads each instance's world position out of the matrix it finds — and at TM day 0 every unplaced
   instance carries `makeScale(0,0,0)` (time_machine.js:628), translation **(0,0,0)**. So the whole
   ref set collapses onto the **WORLD ORIGIN** with a metadata radius, and the restore-to-zero fires
   only when the origin re-enters the frustum. The film's frame-1170 pose (`[-25,6.32,-3.02] →
   [-44.61,2.67,-1.56]`) has the origin *behind* the camera — that is the entire reason the first
   RED attempt read 25013/25013 non-zero and looked like a passing tree. `poseA` is now
   `[120,80,120] → (0,0,0)`; `poseFar` `[900,600,900] → [1200,0,1200]` keeps the origin behind.

**MEASURED — the pair (§-log, primary evidence):**

| run | tree | §DTO_TM_DAY0 | §DTO_PASS out→back | worst classes lost | §DLOD_DISABLE(tm) | verdict |
|---|---|---|---|---|---|---|
| RED | `ROOT=/home/red1/bim-ootb` @ `2ac311ac` (unfixed main) | `nonZero=0/25013 tmOn=true dlodDisableLines=0` | `0/25013 → 0/25013` | IfcMember 5242 · IfcPlate 1130 · IfcFurniture 179 · IfcWindow 46 (**22 classes, 25,013 instances**) | 0 | `§WITNESS_DLOD_TM_OWNERSHIP pass=3 fail=1 ran=22` |
| GREEN | `/tmp/wt-dlod-tm` @ `9eb1f120` (§DLOD_TM_OWNERSHIP) | `dlodEnabled=false dlodDisableLines=1` | `25013/25013 → 25013/25013` | every class `lost=0` | 1 | `§WITNESS_DLOD_TM_OWNERSHIP pass=4 fail=0 ran=22` |

Red control passed in both runs — the witness can fail. On the RED run the precondition line fires
verbatim as it did in the film: `§DLOD_REFS built instanced=2872 imInstances=25013` **after** TM
zeroed them. On the GREEN run those refs are never built at all under TM (only the mid-stream
`imInstances=2753` set, captured before TM existed).
Logs: `/tmp/dto_red2.log`, `/tmp/dto_green.log`. Commit `9eb1f120` on `test/staged-draw-census`.

**PR #1660 was `DIRTY`/`CONFLICTING` on arrival** — synced, not redone (`git merge origin/main`;
the only conflict was `sw.js`'s version-comment block, resolved by keeping BOTH sides' notes and
taking `CACHE_VERSION = 'v1141'` above main's v1140). Merge commit `74f41526`.

### §BME.11 — 2026-09-04 — ITEM 2 CLOSED: the re-bake is complete at Day 310/310. §BAKE_MISSING_ELEMENTS IS SOLVED
`~/Downloads/Hospital_silent_bake_2026-09-05.mp4` (67.3 MB, 2,937 frames, 48m45s wall, commit
`9eb1f120`, sw v1141, fresh `--profile`, `--tap tap_staged_draw_census.js`). Log
`~/Downloads/Hospital_silent_bake_2026-09-05.log`, tap `..._tap.json` (76,714 rows, 2,937 frames).

**The four classes the user reported are now WHOLE at the last frame** — batched half + instanced
half adds up to the DB's own count, exactly, for all four:

| class | batched visible @2936 | instanced `imPlaced` @2936 | sum | DB total | the defective film |
|---|---|---|---|---|---|
| IfcPlate | 1081 | **1130** | **2211** | 2211 ✓ | 1081 + **0** |
| IfcMember | 1885 | **5242** | **7127** | 7127 ✓ | 1885 + **0** |
| IfcFurniture | 22 | **179** | **201** | 201 ✓ | 22 + **0** |
| IfcWindow | 85 | **46** | **131** | 131 ✓ | 85 + **0** |

`imPlaced` reaches its maximum at frames 607–669 and **holds it to frame 2936** — no collapse at
712–718, which is where 24,992 instances died last time. Render side: `notDrawnTotal=2` over 2,937
frames (the same two IfcRailing slots on the frustum edge, unchanged) and `countShortTotal=0`.

**The ownership hand-off is visible at both ends of the film, and that is the mechanism proof:**
- line 335 `[DLOD] §DLOD_DISABLE reason=time-machine` — *before* frame 0, so `_buildRefs()` never runs
  on TM's zero matrices. Between line 335 and line 38844 there is **not one `§DLOD_TICK` and not one
  `§DLOD_REFS`** in a 38,000-line log.
- line 38844 `§TIME_MACHINE OFF — restored` → 38850 `§DLOD_REFS built instanced=2872
  imInstances=25013` → 38851 `§DLOD_TICK … imHid=0 imVis=25013`. dlod.js takes the matrices back
  only once they are real, and its first tick hides **nothing**. Compare the defective run's
  `imHid=21 imVis=24992` — 24,992 "restored" to zero.

**PR #1660 is MERGED and LIVE** — main `fcd4720c` (2026-09-04 16:41, squash), and the deployed
`viewer/sw.js` at red1oon.github.io returns `CACHE_VERSION = 'v1141'`. §BME.9 items 1, 2 and 3 are
all closed. The `§CLI_BAKE_LOG_TS` follow-up (every bake-log line timestamped, user ask) went out
separately on `chore/bake-log-timestamps` off fresh `origin/main`, since #1660 was already squashed.

### §BME.12 — 2026-09-04 — HHS Office "missing wall slab": NOT the §BME.8 defect, and NOT reproduced. One real but too-small defect found on the way
> **USER, 2026-09-04:** *"Even in HHS Office, it is missing a wall slab on its right side, ground floor."*
> They supplied their live console log (red1oon.github.io, `HHS_Office_Federated_extracted.db`,
> `§BUILD_VERSION v1141`) — a plain load, no bake.

**RULED OUT FIRST, from their own log — this is not what #1660 fixed.** Their session ran **no Time
Machine** (no `§TIME_MACHINE`, no `§DLOD_DISABLE reason=time-machine`), and §DLOD_TM_OWNERSHIP only
bites when TM owns the matrices. Their build already contains the fix (v1141 = main `fcd4720c`).
Their log also rules out a streaming loss outright: `§CONTRACT_CHECK batch=3677 instanced=3162
merged=0 guidMap=6839 streamed=6839 orphans=0` — every element IS in the scene.

**MEASURED on HHS this session (new witness + the existing batched owner), all on `fcd4720c`:**

| question | instrument | result |
|---|---|---|
| is any element absent from the scene? | their `§CONTRACT_CHECK` | 6,839/6,839, orphans=0 |
| is any batched slot left invisible at load? | `witness_dlod_cull_soundness.js` (new, §DCS_BM) | **3,704 slots, invisibleAtLoad=0** |
| are the batched bounds stale (three's per-slot cull)? | `witness_bm_bounds_cull.js`, 36-pose ring | `§BM_BOUNDS_STALE bm=97 geoms=3704 **stale=0** worstM=0` |
| does the batched cull drop anything that is really in view? | same, 36 poses | `WRONGLY_CULLED` **0–2 per pose** (frustum-edge slivers), `wronglyDrawn=0` |
| does dlod's own sphere contain what it culls on? | `witness_dlod_cull_soundness.js` (new) | **RED: 357 / 3,135 instances outside** — see below |
| do the walls/slabs even have geometry? | DB | every `IfcWallStandardCase` 148 / `IfcSlab` 83 / `IfcWall` 12 / `IfcCovering` 43 resolves; 0 unresolved hashes |
| any degenerate or misplaced wall/slab? | DB | none (no zero extent, nothing >200 m off); Level 1 holds 75 of them, z −0.1…3.6 |
| is the runtime DB patch implicated? | `buildings/patches/HHS_Office_Federated_extracted.db.sql` | it writes only `spatial_structure` (109), `rel_aggregates` (2,120), `storey_walkable_raster` (4) — **no geometry, no transforms** |

**The one real defect found — §DCS, undersized cull spheres.** `dlod.js:75-81` culls an instance on
`centre = the instance matrix translation`, `radius = sqrt(bx²+by²+bz²)*0.5` from
`element_transforms.bbox_*`. On HHS that sphere does **not contain** the geometry actually drawn at
**357 of 3,135** instances, because the transform centre is not the geometry's centre — measured
centre offsets up to **0.56 m**:

| class | instances | outside sphere | worst overrun |
|---|---|---|---|
| IfcDoor | 91 | **87** | 0.31 m |
| IfcPlate | 396 | 210 | 0.13 m |
| IfcFlowFitting | 564 | 26 | 0.09 m |
| IfcBuildingElementProxy | 500 | 14 | **0.55 m** (sphere 1.09 m vs 1.64 m needed) |
| IfcWallStandardCase | 9 | 9 | 0.22 m |
| IfcMember | 1177 | 11 | 0.08 m |

`§WITNESS_DLOD_CULL_SOUNDNESS pass=4 fail=1 ran=27`, red control passed. **This is real — it can clip
an element at the frustum edge — but at ≤0.55 m it cannot delete a wall**, and only **9** of HHS's
148 `IfcWallStandardCase` are instanced at all (the rest are batched, which dlod never touches).
Do not close the user's report with it.

**⛔ BLOCKED on one datum, and it is a NUMBER, not a look.** Every pose-independent invariant passes,
so the next instrument has to judge the *specific* view. The viewer already emits the camera in its
share hash (`§HASH_PARSE keys=bld,cx,cy,cz,tx,ty,tz`, `quickShare` / `buildShareUrl`) — **the share
URL of the view with the missing wall** is a coordinate, and a per-GUID drawn census at that exact
pose then decides it without anyone judging a picture. That is the one open question.

### §BME.13 — 2026-09-04 — HHS: #1631 §DUCT_SILHOUETTE CLEARED by A/B; extraction is complete; two broken geometries found (not walls)
User asked which recent change caused it, to weigh dropping it. Answer: **no recent change is
implicated, and there is nothing to drop.**

**#1631 §DUCT_SILHOUETTE (2026-09-02) — CLEARED.** It was the only recent change that rewrites
vertex data, and it runs at `scene.js:1934` on every streamed geometry with no class gate (HHS:
`considered=3269 refined=113 addedVerts=103158`). A/B on the same load, refinement forced off via
`evaluateOnNewDocument` — **identical integrity numbers both ways**:
`geometries=3369 NaN=0 zeroTri=0 badIndex=4 badSphere=0`. Do not revert it; the cost (faceted duct
silhouettes return) buys nothing.

**Extraction is complete — the source IFCs prove it.** `internal/UNMERGED/opensourceBIM_HHS_Office_*`
(architect + construction, the federated pair) against `HHS_Office_Federated_extracted.db`:

| class | architect | construction | source total | in DB |
|---|---|---|---|---|
| IfcWallStandardCase | 112 | 36 | 148 | **148** ✓ |
| IfcWall | 0 | 12 | 12 | **12** ✓ |
| IfcSlab | 75 | 8 | 83 | **83** ✓ |
| IfcCurtainWall | 33 | 0 | 33 | **33** ✓ |

Not one wall or slab was lost between the IFC and the DB.

**Two genuinely broken geometries, found on the way — real, and NOT walls.** Their index buffer
references vertices that do not exist, so those elements cannot draw correctly. Present with
refinement off too, so this is a DB/extraction defect, not code:
- `771efc5271499502` — pos.count **474**, idx.count 2748, **max index 29804**. Used by **6
  `IfcBuildingElementProxy` "CCTV Camera (Paxton10 Mini Bullet, CORE series)"**, Levels 1/2/3, MEP.
- `8be27af97ecbf86e` — pos.count **24**, idx.count 120, **max index 26000**. Used by **1
  `IfcEnergyConversionDevice` "Photovoltaic Module (NBS generic)"**, Roof Level, MEP.

That is 7 elements, all MEP fixtures. Worth its own fix; it is not the user's wall.

**Standing conclusion: the HHS report is not reproduced and not attributed.** Every pose-independent
invariant passes (§BME.12), the data is complete, and the only recent geometry-touching change is
cleared. The open question is unchanged and is a coordinate, not a look: **the share URL of the view
with the missing wall** (`§HASH_PARSE keys=bld,cx,cy,cz,tx,ty,tz`).

**USER, 2026-09-04 (session close on this lane):** *"the issue with Hospital is now solved, and i am
truly happy with the bake result, and we shall use that as the baseline to proceed"* ·
*"Clinic in OCI is now solved.. no more boxed non glass panels"* · the HHS right-side ground-floor
wall stays open. **Baseline for every later comparison = `Hospital_silent_bake_2026-09-05.mp4`
(§BME.11), not the 09-04 film.**

### §LIGHT_TRUTH_AUDIT (2026-09-27)
READ-ONLY code audit, tree /tmp/wt-meter (bim-ootb fix/meter-one-rule @fc8b07f6 = look @808f578f + §METER_ONE_RULE). Judged
against §LIGHT_ONE_SCALE L1/L2/L3 (+L1a cove). No render, no browser: every number below is read from code or computed from
code constants; no screenshot was used. Units: scene "units" = three.js physical-light units; the one calibration is
§SOURCED_LIGHT_CALIB `luxPerUnit = 100000 / calibSunI` = 100000 / 4.4 = 22,727 lx per unit (effects.js:4274-4280).

**PATH TRACED (daytime still, default URL, Night mode OFF before the press, desktop Chrome + WebGPU).**
scene.js:3238 Alt+S → effects.js:5947 `toggleStillRefineUI` → 5980 `startStillRefine` → 5582 `_applyPhotoStaging` (4075):
fog/HDRI save 4172-4185 · sky visible 4212 · env boost 4245 · shadows 4246 · CALIB 4266-4290 · `toggleNightMode` 4312-4336 (tools.js:1586;
saves day lights 1593, sets moonlight, then 4315-4318 restores them ×PHOTO_* scales) · §STILL_GLOW 4346-4375 · §STILL_BASE 4382-4386 ·
§ALBEDO_SRGB 4407-4431 · SkyPortal 4435 · GlassFresnel 4437 · SourcedLight.stage 4438 (sourced_light.js:1068: zones, sky field,
lamps, IR, cove, then **§METER 1131** and §LUX_CHECK) · fog/ground re-assert 4471-4487 · CAM_LIGHT 4501 · shadow fit. Back in
startStillRefine: lamps re-updated at the still budget 5605-5620 (AFTER the meter) → TAA 16 → `_finishStillRefine` → N8AO fold
4831 (SSGI off: effects_gi_poc.js:541) → gi_still.js bounce (keydown listener gi_still.js:935, gate 925-933: desktop + navigator.gpu +
three r186 — the viewer loads r186, lib/three.core.min.js — so LIVE on red1's desktop, OFF on phones / no WebGPU).
Tone curve: ACESFilmic, set once (scene.js:125), applied by the composer's output; float render targets (meter, glass env, IR share)
bypass it (three: tone mapping only on the default framebuffer). Nothing in the Alt+S path changes the operator.

**Exposure actually applied** = 0.45 (scene.js:132) → 0.8 (tools.js:1606 moonlight) → 0.45 × 0.85 × 1.0 = **0.3825** (effects.js:4318)
× &stillexp 1 (4428) → §METER: `base × (Ein/Eout)^(-D)`, |stops| ≤ 10 (sourced_light.js:1250-1252).

#### A. The value table

Verdicts: TRUE / UNSOURCED / INCONSISTENT / DOUBLE-COUNT / NO-OP (identity, delete) / NOT LIVE. "Law" = the §LIGHT_ONE_SCALE clause it breaks (— = none).

| # | value | file:line | live? (chain) | source in code | effect on brightness / colour | verdict | law | truthful replacement |
|---|---|---|---|---|---|---|---|---|
| **EXPOSURE / TONE** |||||||||
| 1 | toneMapping = ACESFilmic | scene.js:125 | LIVE (never changed on the path) | "crisp vibrant like Bonsai/Autodesk" (taste); ACES itself is the Academy RRT/ODT | the one tone curve | TRUE (one curve) | — | keep; but see #57 (light added after it) |
| 2 | toneMappingExposure 0.45 | scene.js:132 | LIVE: saved as `_nightSaved.exposure` tools.js:1595 → effects.js:4318 | "deliberate… overexposure memory" | sets the absolute level of every still (meter is relative to it) | UNSOURCED | L3 | no fixed base: exposure = K / L_frame (reflected-light meter equation, ISO 2720 K = 12.5) or key/L_avg (Reinhard 2002, key 0.18) |
| 3 | PHOTO_EXPOSURE_SCALE 0.85 | effects.js:2478 | **LIVE**: 4318, inside `if (!_photoNightWasOn …)` 4312 = the default | "slightly underexposed — materials in little light" (the old dusk photoshoot) | −0.23 stop on every still | UNSOURCED (mood, flag 1) | L1/L3 | delete |
| 4 | PHOTO_EXPOSURE_LIFT 1.0 | 2487 | LIVE 4318, identity | — | none | NO-OP | — | delete |
| 5 | &stillexp / APP._stillExpMul, default 1 | 4427-4428 | LIVE, identity by default | dial | none by default | NO-OP (dial) | L3 if ≠1 | delete or debug-only |
| 6 | meter base = the exposure at stage time (0.3825) | sourced_light.js:1234 | LIVE | none | a view with Ein = Eout is shown at 0.3825, i.e. the whole meter is anchored to #2 × #3 | INCONSISTENT | L3 | anchor = the meter equation (#2 replacement), not a carried number |
| 7 | Eout = sun·sinElev + lum(hemi.sky)·hemi.I | 1226-1232 | LIVE (read after §STILL_BASE, so hemi = 1.234) | "the scene's own outdoor light on a horizontal surface" | 4.4·0.707 + 0.760·1.234 = **4.05 units = 92 klx** at 45° | TRUE (matches rendered sun+hemi; ambient is 0 in the still so its omission is consistent). Minor: uses `sun.position.normalize()` not (pos − target); target moved to bbox centre (effects.js:3447) but pos is 5000 m out → <1 % | — | keep |
| 8 | meter hides sky (`o === A._sky`), glass (transparent opacity<0.95), MeshBasic, ShaderMaterial, sprites, points, lines | 1154-1157 | LIVE | "incident light … sky / lamp glows / glass hidden" | (a) the sky never pulls exposure down → sky/sun side blows when exposure opens; (b) glazing removed ⇒ lamp-lit rooms BEHIND curtain walls (≈0.5 % of sun, EN 500 lx vs 100 klx) are metered as bare surfaces; log-average weights them heavily (30 % such pixels ≈ −2.2 stops of Ein) ⇒ exterior opened ⇒ pale facade/sky | INCONSISTENT | L3 ("light reaching the eye") | meter what the eye receives: the rendered frame's luminance incl. sky and glass (reflected-light meter), or an incident meter that stops at the glass |
| 9 | D = CIECAM02 degree of adaptation, `1-(1/3.6)e^((-LA-42)/92)`, LA = 0.2·Ein_lux/π | 1246-1249 | LIVE (adapt='ciecam02' default) | CIE 159:2004 eq. 7.4 | outdoors LA ≈ 1,000-6,000 cd/m² ⇒ D = 1.000: **full normalisation** — every view is re-exposed to Eout. All-shade view (Ein 0.755, row 19) ⇒ ×5.4 = **+2.4 stops**, exposure 2.05 | INCONSISTENT: D is the degree of CHROMATIC (von Kries white-point) adaptation, not luminance adaptation; the source is cited for a job it does not do | L3 | a luminance-adaptation law (e.g. Ferwerda et al. 1996, SIGGRAPH "A model of visual adaptation for realistic image synthesis") or the photographic meter (#2) |
| 10 | METER_MAX_STOPS 10 | 1151 | LIVE | none | clamp | UNSOURCED (minor) | L3 | camera/eye dynamic range from a cited figure, or drop |
| 11 | metermode 'avg' log-average | 1188-1199 | LIVE | Reinhard 2002 eq. 1 | — | TRUE | — | keep |
| **SUN** |||||||||
| 12 | sun 4.4, colour 0xfff0dd | scene.js:207; restored effects.js:4315 (×1.0), 4326 colour | LIVE | 4.4 = TM balance; mapped to 100 klx by #14 | direct term | 4.4 TRUE as the unit (L1 single calibration). Colour 0xfff0dd UNSOURCED (warm tint, raw hex used as linear, no CCT/model) | L1 (colour) | sun colour from the same sky model as the sky (e.g. Preetham sun colour at that elevation) |
| 13 | sun elevation 45° / az 180 (or TM's) | scene.js:358 | LIVE; Alt+S no longer moves it (dusk mood off, 4213) | user/TM | — | TRUE | — | keep |
| 14 | CALIB_SUN_LUX 100000, CALIB_LAMP_LUX 500 | effects.js:4274 | LIVE | Wikipedia "Lux" (Schlyter); EN 12464-1 office | the one calibration | TRUE | — | keep |
| 15 | CALIB_H 2.5 m | 4274 | LIVE (calibMul 4283; superseded in rooms by §LAMP_EN #42, still governs lamps in no room) | none | lamp base level | UNSOURCED (minor) | L1 | lamp flux from data |
| 16 | PHOTO_SUN_INTENSITY/AMBIENT/HEMI_SCALE 1.0 | 2477, 2791, 2774 | LIVE 4315-4317, identity | — | none | NO-OP | — | delete |
| 17 | PHOTO_SUN_COLOR 0xffa55c / AMBIENT 0x8a6a55 / HEMI 0x6a5a7a, PHOTO_SKY_DRAMA uniforms | 2463-2465, 4217-4227, 4321-4324 | NOT LIVE (only `APP._photoDuskMood = true`) | dusk mood | — | NOT LIVE (mood) | L1 | delete |
| 18 | PHOTO_SUN_ELEVATION 6° as the day/dusk threshold | 2503 → 4349 | LIVE (window glow / lamp decision only) | "Preetham near-black cutoff" | decides glow on/off | UNSOURCED | — | a cited twilight definition (sun < 0° / civil −6°) |
| **SKY / FILL — the full chain to a SHADED EXTERIOR surface** |||||||||
| 19 | hemi 0.617, sky 0xb0c4de, ground 0x8b7355 | scene.js:213 | LIVE | k-fit to a wall-contrast target (witness_wall_side_light_floor), not a sky model | the ONLY sky light on a shaded exterior surface (with #20, #22) | UNSOURCED (as sky physics) | L1 | sky + ground terms from one clear-sky model (sun/sky split for the elevation) |
| 20 | &sky dial 2.0 on hemi → 1.234 | effects.js:4384-4386 | LIVE | red1 eye pick ("hit it now") | horizontal sky E = 0.760·1.234 = 0.938 u = **21.3 klx**; DHI/DNI = 0.938/4.4 = **0.213**; diffuse fraction DHI/GHI = 0.23 | UNSOURCED — but the RESULT lands inside the code's own cited source: Wikipedia "Lux", "full daylight (not direct sun) 10,000–25,000 lx" vs "direct sunlight 32,000–100,000 lx" ⇒ 0.10–0.25. **The horizontal sky is not weak** | L1 | derive, don't dial (value can stay near 21 klx) |
| 21 | hemi GROUND half = fixed 0x8b7355 × 1.234 → upward light 0.463·1.234 = 0.571 u | scene.js:213 via slHemi sourced_light.js:145 | LIVE | none | on a vertical shaded wall (three's w = 0.5, F = Gd = 1): sky half 0.469 + ground half 0.286 = **0.755 u (17 klx)**. Physical ground half = 0.5·ρg·Eg with the ground's own ρg 0.36 (#49) and sunlit Eg 4.05 ⇒ 0.73 ⇒ total 1.20 u: render = **0.63× physical (−0.67 stop)** when the ground in front is sunlit; when it lies in the building's shadow (Eg = 0.938) physical = 0.64 u and the render is slightly HIGH | INCONSISTENT (ground-reflected light not derived from the ground's albedo nor its sun/shadow state). Isotropic sky also overstates a wall facing away from the sun on a clear sky (Perez et al. 1990, Solar Energy 44(5), anisotropic model) — opposite sign | L1/L2 | groundColor·I = ρg × (sun·sinE × unshadowed fraction + E_sky) |
| 22 | slHemi / slSkyKeep: sky half × F, ground half × Gd; outside fragments F = 1 | sourced_light.js:137, 145-149 | LIVE | geometry (sky-view field) | indoors: sky scaled by the measured sky view | TRUE (derived) | — | keep |
| 23 | indoorSky 0 for UNKNOWN fragments (solid column above) | 1094, 137 | LIVE | "principle 1" | wall feet / ceiling strips lose ALL sky | INCONSISTENT (unknown ≠ covered) — blotch candidate, §B | L2 | treat unknown as the nearest known cell's F |
| 24 | ambient 0.386 × &base 0 = 0 | scene.js:203; effects.js:4383-4386 | LIVE (= 0) | red1 ruling | removes a sourceless fill | TRUE | — | delete the light |
| 25 | matte IBL: SFR_MATTE_ENV_I 0 | effects.js:2877, 2928-2934 | LIVE | §SUN_FILL_RATIO (IBL is unshadowed) | sky counted once (by hemi) on matte | TRUE (prevents a double count) | — | keep |
| 26 | glossy IBL = HDRI **belfast_sunset**_puresky × PHOTO_ENVMAP_BOOST 2.0 | 3953, 4185; 2667 → 2961 | LIVE on roughness ≤0.5 / metal >0.3 (2955-2959) | "tuned 2.2→3.2→4.5→3.0→2.0" | a SUNSET sky in a noon still, radiance in the HDRI's own units ×2 — a third sky model | UNSOURCED + INCONSISTENT | L1 | env = PMREM of the sky that lights the scene, intensity 1 |
| 27 | PHOTO_METAL_ROUGHNESS_SCALE 0.4 | 2715 → 2965 | LIVE (metal >0.3) | "tighter/brighter highlight" | brighter speculars | UNSOURCED | L1 | delete (roughness is data) |
| 28 | room probe (one interior cube capture) for all glossy | 4013-4040 | LIVE | heuristic "35 % up" | exterior glossy reflect an interior point | INCONSISTENT (low impact) | L2 | per-camera capture (GLASS_ENV already does this for glass) |
| 29 | Sky background: Preetham, EE 1000, ×0.04, `pow(tex, 1/(1.2+1.2·sunfade))`; turbidity 4 / rayleigh 2 / mie 0.005 / g 0.8 | lib/Sky.js:124, 268; scene.js:253-256; visible effects.js:4212 | LIVE (tone-mapped with the scene exposure) | three example shader | the sky SEEN is a different model from the sky that LIGHTS (#19-21) and from the reflected sky (#26); not in the lux calibration; excluded from the meter (#8) ⇒ blows when exposure opens | INCONSISTENT + UNSOURCED | L1/L3 | one sky model in the one calibration; hemi, IBL and background all from it |
| 30 | lensflare toneMapped=false | 4232, 4236 | LIVE when the sun is in frame | "keep glare independent of the exposure cut" | additive sprite past the tone curve | UNSOURCED | L3 | delete (or bloom from real sun radiance) |
| 31 | fog 0xc9a878, density ≤ 0.00006 | 4472-4473 | LIVE in daylight (not dusk-gated) | "warm hazy dusk horizon" | warm tan haze, constant radiance independent of light/exposure; meter drops fog (1172) | UNSOURCED (mood, flag 1) — small (<1 % at 1 km) | L1 | aerial perspective from the sky model, or delete |
| 32 | sky portals | sky_portal.js:87 | NOT LIVE (retired while the sky field is on) | — | — | NOT LIVE | — | — |
| 33 | §SKY_OCCLUSION | sky_occlusion.js:42 | NOT LIVE (opt-in &skyocc=) | — | — | NOT LIVE | — | — |
| 34 | day IR = V12 `R/(A(1−R))` × hemi colour, R_BRE 0.5 | light_zones.js:461, 784-790; sourced_light.js:466-468 | LIVE (zone fragments only) | BRE ADF flux balance (Sumpner) | interreflected daylight indoors | TRUE (R = 0.5 is BRE's stated average) | — | keep; see #47 |
| 35 | lamp IR k = R/(1−R) = 1 × mean direct lamp E | sourced_light.js:433, 457-462 | LIVE | flux balance | per-zone UNIFORM fill | TRUE (formula) — uniform per zone ⇒ blotch §B | — | keep formula |
| **LAMPS** (on indoors by day; outside too since &lampsout default 1, 4362) |||||||||
| 36 | NIGHT_LIGHT_INTENSITY 2.0 × calibMul | tools.js:1308; effects.js:4283-4284 | LIVE | calib divides the base out | fixture = 0.087 u ⇒ 500 lx at 2.5 m | TRUE (via #14) | — | keep |
| 37 | _nightPLScaleStill 0.5 (§STAGED_PL_CUT) | tools.js:1100 → effects.js:4262, 5611 → tools.js:2226 | LIVE | "too bright… reduce" (look) | halves every lamp AFTER the calibration; §LAMP_EN re-normalises lamps in rooms, but **lamps in no room stay at 250 lx** (half the cited 500) | UNSOURCED + INCONSISTENT with #14 | L1 | delete |
| 38 | lamp decay 1.5 (&lampdecay) | effects.js:4266 → tools.js:2350 / `_lampData.decay` | LIVE | §FLOOR_WASH eye pick | point source is inverse-square (2); calibrated at 2.5 m only: 1.41× too bright at 5 m, 2× at 10 m | UNSOURCED | L1/L2 | decay 2 + a photometric distribution |
| 39 | lamp range 25 m window `(1−(d/R)^4)^2` | 4290 | LIVE | perf | cut-off | UNSOURCED (small) | — | keep as perf, log it |
| 40 | lamps are omni point lights | tools.js:2226 path; sourced_light.js lamp loop 220-235 | LIVE | none | ceilings lit as much as floors (a recessed downlight emits ~0 upward) ⇒ bright/pale ceilings | INCONSISTENT with the EN working-plane calibration | L2 | cosine / IES-LDT distribution per fixture type |
| 41 | §LAMP_EN: per-room scale to prEN 12464-1 rows, cap at P90 | sourced_light.js:499-583 | LIVE | prEN 12464-1 (2019) | rooms meet EN | TRUE; P90 cap UNSOURCED (small) | — | keep |
| 42 | lamp colours NIGHT_WARM 0xffdca8 "~2900 K" / rect 0xffffff | tools.js:1110, 1263 | LIVE | red1 shape ruling | hex used as linear (ColorManagement off) ⇒ not the stated CCT | UNSOURCED (colour; shape rule = red1) | L1 | chromaticity from a CCT (data or catalogue) |
| 43 | fixture emissive 0xffe4b5 × 0.3 | tools.js:1375 | LIVE whenever lamps are on | "reduced 0.8→0.65→0.45→0.3" | glow not tied to lumens; not metered (override material) | UNSOURCED | L1 | luminaire luminance = flux / (π·area) in the one calibration |
| 44 | window glow 0xfff8ec × 0.55 | tools.js:1376 → 0 at effects.js:4366 | NOT LIVE by day | — | — | NOT LIVE | — | — |
| 45 | CAM_LIGHT 3 / 4 m | effects.js:381 → 0 at 4501-4502 (calib + sourced, default) | NOT LIVE | — | — | NOT LIVE | — | — |
| **COVE (L1a)** |||||||||
| 46 | TRIM_LUX_VOID 100, COVE_UNKNOWN_LUX 100, colour 0xffe4b5 | sourced_light.js:896 | LIVE | "EN circulation row via secondary summaries" | level of the added glow | red1 EXCEPTION (§COVE_NO_STRIP: "need not be accurate") — not counted UNSOURCED | — | — |
| 47 | cove QUALIFICATION: `lv = room ? (EN row ∥ 100) : 100; df = max(0, lv − existingE); if (!(df > 0.5)) continue;` | 994-998 (coveBuild), existingE = luxRows 797-818 | LIVE | watchdog gate | **no test for lamps = 0 or sky = 0**: any zone below its level is topped up — lit rooms whose §LAMP_EN scale hit the P90 cap, lamp-less rooms with some sky, voids next to lit rooms. existingE = sky share + lamp direct + LAMP IR, but **omits DAY IR** (ircAll × hemi, which the IR texture carries, #34) ⇒ in sky-lit zones the cove re-adds light the day IR already delivers | INCONSISTENT (breaks L1a) + DOUBLE-COUNT (day IR) | L1a/L2 | qualify only `lamps == 0 && Fwp == 0 && lampIR == 0`; existingE must include day IR |
| 47a | §COVE_IR: adds R/(1−R) × cove direct, direct = deficit × (1−R) | 974-985 | LIVE | flux balance | cove direct + its IR = deficit exactly | TRUE (no self double count); gi_still's max(IR, SSGI) rule (gi_still.js:526, irMaxU 630) counts cove IR once | — | keep |
| 47b | how many Hospital cove zones HAVE lamps or sky | — | — | — | total: 848 zones, **376 qualified** (room 223, void 140, crevice 2, shaft 11) — this file, §COVE_NO_STRIP result | **INCONCLUSIVE**: no § line prints the lamps/F of qualified zones (§COVE_LIGHT_ZONE = top 8, §LUX_CHECK = largest 8 + 20 FAIL rows) | — | add at 998: `§COVE_QUAL withLamps= withSky= withDayIR= neither=` — "neither" is the count L1a allows |
| **MATERIALS / ALBEDO** |||||||||
| 48 | IFC colours used as LINEAR (ColorManagement.enabled = false; &srgbfix default OFF) | loader.js:145; effects.js:4409 | LIVE | §ALBEDO_SRGB (fact stated in code) | every flat albedo brighter than authored: 0.5 used as 0.5 (true linear 0.214, **×2.3**), 0.8 → ×1.3; textures with colorSpace sRGB ARE decoded ⇒ flat vs textured materials disagree; mid-tones compress toward white = pale, low contrast | INCONSISTENT (red1's 2026-09-27 ruling covers CHROMA of intact colours, not this scale) | L2 | decode authored sRGB to linear (the §ALBEDO_SRGB switch) |
| 49 | ground: 'earth' map × gain 2.3 (GROUND_TEX_AVG_LUM 0.155 measured on paved) = 0.36 "dry concrete" | effects.js:2801-2802, 4151-4153, 4487 | LIVE | concrete 0.25-0.40 (cited in comment); map is EARTH | ground albedo | INCONSISTENT (concrete albedo on a soil texture) | L2 | albedo of the material actually shown (site data or the texture's own measured mean) |
| 50 | ground wetness 0.5 | 3821 → 3888-3899 (uPuddleActive = 1 during a still, 3904) | LIVE | "wetness override auto-applied" (look) | roughness 0.95→0.515, diffuse ×0.86, **metalness 0.425 over the whole ground** ⇒ diffuse albedo 0.36 → ≈0.18 + sun glints: a sunny still rendered as wet ground | UNSOURCED (mood) | L1/L2 | 0 unless weather data says wet |
| 51 | puddles (PHOTO_PUDDLE_COUNT 6, random seed) | 3785, 4123-4126 | LIVE | look | random wet patches | UNSOURCED (mood) | L1 | delete |
| 52 | glass Schlick F0 0.04 / GLASS_BODY 0.08 | glass_fresnel.js:10 | LIVE | F0 = n 1.5 glass (TRUE); body = red1 start value | glazing | F0 TRUE; body UNSOURCED (small) | — | body from the IFC transmittance |
| 53 | concrete triplanar strength 0.55, tile 4 m | streaming.js:1392-1393 | LIVE (still-only triplanar) | look | low-frequency albedo variation | UNSOURCED (texture look) — blotch candidate §B | — | measured texture scale / off |
| **POST (after the meter and/or after the tone curve)** |||||||||
| 54 | N8AO over the WHOLE beauty: screenSpaceRadius, aoRadius 32 px, distanceFalloff 0.2, intensity 4, samples 8, denoise 5 / 7, 24 frames | effects.js:4911-4912, 4930-4950; fold 4831 | LIVE | n8ao README ranges; retuned by eye (§PHOTO_AO_*) | darkens direct sun + lamps too; world radius grows with depth (see §B) | UNSOURCED + INCONSISTENT (AO is visibility of AMBIENT/indirect light only — Zhukov et al. 1998 obscurances; Jimenez et al. 2016 GTAO applies it to indirect diffuse) + DOUBLE-COUNT (the sky field F and IR already encode that occlusion) | L2 | delete, or world-space radius applied to indirect terms only |
| 55 | §SUN_SHADOW_RESTORE: blend AO-composited colour back to the pre-AO colour near detected sun-shadow edges, kernel 4 px × kScale ≤ 4 | 4982-4990 | LIVE | patch for #54's blur | AO present/absent halos at shadow edges | UNSOURCED | L2 | goes away with #54 |
| 56 | gi_still composite `out = C·(1−0.55+0.55·AO) + max(0, recv·GI·1.0 − C·IRshare)`; C = the app's FINISHED frame (tone-mapped, sRGB-decoded); recv = hue at fixed albedo **0.5**; giIntensity **10**; ao 0.55; 8 passes, slices 3, steps 16 | gi_still.js:482, 452, 526, 616, 723 | LIVE (desktop WebGPU) | "not measured data" (says so, 476-481); dials by eye | adds light AFTER exposure and ACES and after the meter; every dark pixel receives bounce as if its albedo were 0.5 ⇒ shade lifted toward mid-grey = flat/pale; a SECOND AO on top of #54 | INCONSISTENT (L2/L3) + UNSOURCED + DOUBLE-COUNT (AO ×2) | L2/L3 | bounce in scene-linear radiance, before exposure, from real albedo (G-buffer), counted once against IR |
| 57 | sun PCF radius 1.5 texels, per cascade (slice.R), CSM_BLEND 0.1 | effects.js:3592-3593, 3140, 3264 | LIVE | §STILL_SHADOW_EDGE ("2R = 3 texels") | penumbra width = 1.5 × each cascade's texel | UNSOURCED | L2 | penumbra from the sun's angular diameter 0.53° (w ≈ 0.0093 × occluder-receiver distance) |
| **ORDER / FIRST PRESS / DIFFERS** |||||||||
| 58 | lamps at the METER are built during staging with the NAV near-fade floor 0.3 (tools.js:1089; data path tools.js:2225); the still floor 1.0 is set only after staging (effects.js:5610) and the lamps re-built | effects.js:4312 vs 5605-5620; meter sourced_light.js:1131 | LIVE every press | — | the meter reads a different lamp set from the one rendered (near-camera lamps up to 3.3× dimmer at meter time; §LAMP_EN re-normalises each data version so room means match, the within-room shape does not) | INCONSISTENT | L3 | build lamps at the still budget BEFORE SourcedLight.stage |
| 59 | HDRI first press: `_hdriEnvMap` null → glossy keep the procedural sky until the async load lands | 4185, 3944-3967 | first press only | — | first still's glossy reflections differ from the second's | INCONSISTENT (first-press) | — | await the HDRI (or delete it, #26) |
| 60 | Night mode already ON before Alt+S: restore block skipped (4312) ⇒ sun 0.15 moonlight, exposure 0.8 — while calibSunI = `_nightSaved.sunI` 4.4 (4275) | 4275, 4312 | only if the user had Night on | — | lamps calibrated to a 4.4 sun, scene sun 0.15; Eout uses 0.15 | INCONSISTENT | L1 | one sun value for calib, render and meter |
| 61 | inside-only / outside-only terms | — | — | — | IR, cove, sky-field F < 1: zone fragments only; unknown fragments sky 0 (#23); shadow-fit props only for an outside camera; lamps on both sides (lampsout 1); meter: one rule, inside only logged (1238) | TRUE except #23 | — | — |

**COUNT: 26 LIVE rows carry UNSOURCED** (#2, 3, 10, 12-colour, 15, 18, 19, 20, 26, 27, 29, 30, 31, 37, 38, 39, 41-cap, 42, 43, 50, 51, 52-body, 53, 54, 56, 57); NO-OP rows to delete: #4, 5, 16; NOT LIVE: #17, 32, 33, 44, 45; red1 exception: #46.

#### B. TOP-5 — "pale-bright outside" and "night-dark shade side"

1. **§METER D = CIECAM02 → full normalisation** (sourced_light.js:1246-1251). Outdoors D = 1.000, so every view is re-exposed until
   its metered light equals Eout. All-shade view: Ein 0.755 / Eout 4.05 ⇒ +2.4 stops (exposure 0.3825 → 2.05); the unmetered sky
   (#29) and any sunlit edge ride the same +2.4 stops ⇒ pale/blown. Before fc8b07f6 the outside branch applied 0 stops ⇒ the same
   view at 0.3825 = "night" (…1790468614025: p50 48). **Both symptoms are one rule**: no adaptation, then total adaptation, and D is
   a chromatic-adaptation factor, not a luminance one.
2. **The meter excludes sky and glass** (1154-1157). The sky never pulls the exposure down; curtain walls are removed so the
   lamp-lit rooms behind them (≈0.5 % of sun) drag the log-average down ⇒ the exterior of a glazed building (Hospital, Terminal)
   is opened up ⇒ pale. Not "the light reaching the eye".
3. **The absolute anchor is a mood number**: base = 0.45 (scene.js:132) × PHOTO_EXPOSURE_SCALE 0.85 "slightly underexposed"
   (effects.js:2478, live via 4318) = 0.3825. Every exposure is a multiple of it; with the v1457 outside branch it WAS the shade
   view's exposure.
4. **gi_still bounce added after the tone curve** (gi_still.js:526) with receiver albedo fixed at 0.5 (482) and giIntensity 10
   (723): shade pixels get bounce as if mid-grey regardless of their real albedo or their real incident light, on the
   display-referred frame, unmetered ⇒ shade lifted and flattened (pale), plus a second AO (0.55) on top of N8AO.
5. **Flat IFC albedos used as linear** (loader.js:145, §ALBEDO_SRGB off at effects.js:4409): mid-greys ×2.3, whites ×1.3 ⇒
   compressed, pale surfaces everywhere, while textured materials are decoded correctly.

Just outside the five: **#21 hemi ground half** — the SKY term red1 asked about. The full chain to a shaded exterior surface is:
hemi only (sky half 0.469 u × F=1 + ground half 0.286 u × Gd) — ambient 0 (#24), matte IBL 0 (#25), IR/cove zone-only (not
exterior), portals retired (#32), plus the gi_still screen-space bounce (#56, only from surfaces on screen). Horizontal sky is
21.3 klx, DHI/DNI 0.213 — inside the cited 0.10-0.25 (Wikipedia "Lux"), so the sky is NOT weak; the ground-reflected half is
0.63× physical when the ground in front is sunlit (−0.67 stop), smaller than #1-#5 (≥1.2 stops each). #50 wet ground (diffuse
0.36 → 0.18 + sun glints) is seventh.

#### C. INDOOR BLOTCH FORMULAS (red1: "the blotches may need more realistic formulas"; …1790468672505: soft mid-tone patches, no black)

| rank | term | file:line | formula as coded | basis | realistic formula |
|---|---|---|---|---|---|
| 1 | N8AO | effects.js:4911-4912, 4930-4950 | screen-space radius 32 px ⇒ world radius r = 32 × 2·d·tan(fov/2) / H_px (grows linearly with depth d: a far wall gets a large dark band, a near one a thin line); AO^intensity 4 with distanceFalloff 0.2; 8 samples, denoise 5 samples / 7 px, 24-frame accumulate; multiplies the WHOLE beauty | n8ao README "16-64 px"; retuned by eye three times (§PHOTO_AO_TUNE/DARK/SCALE/EDGE) | AO as visibility of indirect light only, world-space radius (GTAO, Jimenez 2016); here F + IR already carry it ⇒ remove |
| 2 | gi_still AO + bounce | gi_still.js:452, 482, 526, 616, 723 | AO blend `1−0.55+0.55·AO` (second AO); bounce = recv(hue × 0.5) × SSGI × 1.0, SSGI 3 slices × 16 steps, radius 12, 8 passes + temporal filter; on the tone-mapped frame | eye dials; 0.5 stated "not measured" | one indirect pass in scene-linear radiance with real albedo; enough slices/steps for convergence (or path-traced), counted once vs IR |
| 3 | per-zone flat terms | sourced_light.js:176 (IR: `texelFetch(uSLIr, zone)`), 499-583 (§LAMP_EN per-room scale), cove per zone | IR is ONE value per zone (nearest, no spatial interpolation); lamp scale jumps room to room; ⇒ steps where zones meet (doorways, zone splits of one visible space) | flux balance gives the zone MEAN only | IR varying with position (per-cell radiosity or form-factor gather), or interpolate across open zone boundaries |
| 4 | sky field F / Gd / cove stencil | sourced_light.js:108-121 (8-texel trilinear, texels of another zone or SOLID rejected, weights renormalised), CELL 0.5 m light_zones.js:15; unknown fragments sky 0 (137, 1094) | at every zone or solid boundary the stencil drops texels ⇒ 0.5 m-cell steps; wall feet / ceiling strips with a solid column above read "unknown" ⇒ lose all sky | Greger et al. 1998 irradiance volume (the interpolation is cited; the rejection + unknown=0 rule is not) | keep trilinear, fall back to the nearest known F instead of 0 for unknown; finer cell where it steps |
| 5 | sun PCF per cascade | effects.js:3592-3593, 3264 (L.shadow.radius = slice.R), CSM_BLEND 0.1 at 3140 | penumbra = 1.5 × cascade texel (world width changes per cascade), 10 % blend between cascades | §STILL_SHADOW_EDGE | penumbra w = d_occluder→receiver × tan(0.53°) ≈ 0.0093·d (sun angular diameter ≈ 0.53°): PCSS-style, independent of cascade |
| 6 | concrete triplanar | streaming.js:1392-1393 | strength 0.55, tile 4 m, contrast 1.1× | look | the albedo texture's own variation — a blotch by design; confirm with &concrete=0 before blaming lighting |
| 7 | lamps | effects.js:4266 (decay 1.5), omni | broad overlapping pools, ceiling lit like floor | eye pick | decay 2 + photometric distribution (#38, #40) |

**Witness plan for C (no build here):** the §-lines that already isolate each term — §PHOTO_AO (N8AO has no URL dial — STILL_AO_ENABLED is a const at effects.js:4857, so its A/B needs a one-line switch; &ao / APP._stillAo is gi_still's AO, not N8AO),
§GI_STILL giterm/aoloss modes (gi_still.js:506-510), §IRC_MAX share, §SKY_VIEW_FIELD SKY_STEP readback (uSLParams.w = 6),
§STILL_SHADOW_RADIUS — one A/B per term at the …1790468672505 pose, reported as the patch's L change, ranks by the number.
