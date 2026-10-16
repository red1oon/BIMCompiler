# ⚠ DO NOT REMOVE — Night mode + fixture lighting: settings, costs, and the calculations
**Scope:** every light source the viewer creates from BIM data — night-mode point lights, the
night material glow, and the Alt+S still's §PHOTO_EMBER/§PHOTO_BLOOM layer. **Read the log after
every run.** Honour until DONE.

**Why this file exists (created 2026-07-27):** the user asked for "the prompts/# on it [that] has
the setting and calcn" after warning *"be careful as we have lighting hell before too.. ie over
shot.. too many lamps cost RAM too"*. **There was no such file.** Every setting and every reason
lived only in `§S277d` comments inside `viewer/tools.js`, which is why the same ground was re-walked
twice. This is now the record. Update it whenever a constant below changes.

---

## The constants, and what each one is actually protecting
`viewer/tools.js`, top of the night-mode block:

| constant | value | what it protects / why |
|---|---|---|
| `A._nightMaxLights` | **12** | NAVIGATION budget. Every three.js point light costs per-fragment work on **every lit material, every frame**, with no distance culling in the forward renderer. 12 is what a 60fps orbit carries. |
| `A._nightMaxLightsStill` | **48** | FROZEN-STILL budget. A still renders once and then sits there, so the 60fps budget does not apply. Raised by `startStillRefine`, **restored on teardown** — if it is not handed back, the 4x set follows the user into their next orbit and the frame rate goes with it. |
| `NIGHT_LIGHT_INTENSITY` | 8.0 | Candela-ish. Illuminance falls as `intensity / d^decay`. |
| `NIGHT_LIGHT_DECAY` | 1.5 | Between linear (1) and quadratic (2) — reaches further than physics, deliberately. |
| `NIGHT_LIGHT_RANGE` | 0 | Infinite; no artificial cutoff, so overhang/doorway/corridor spillover survives. |
| `A._nightNearFadeFloor` | **0.3** | NAVIGATION anti-blowout: a light AT the eye runs at 30%. |
| `A._nightNearFadeFloorStill` | **1.0** | STILL: no proximity penalty (see §NIGHT_NEAR_FADE below). |

### The RAM question — measured, not assumed
**Night point lights cost almost no RAM.** They never set `castShadow` (only `A.sun` does, tools.js:710),
so **no shadow map is allocated per light** — a shadow-casting point light would allocate a cube map
each, which is where the "too many lamps cost RAM" intuition comes from, and that is exactly what is
NOT happening here. Per-light cost is a handful of shader uniforms.
**The real cost is GPU shader work, not memory:** per-fragment lighting on every lit material, plus a
**shader recompile whenever the light COUNT changes** (which is why the count is switched once at
still-start and once at teardown, never per frame).
**If lighting hell returns, suspect the count and the intensity, not RAM** — and check the still
actually handed its 48 back.

---

## §NIGHT_GLOW_CLASS_GATE — the bug that made the Clinic pitch black (fixed 2026-07-27)
User: *"In Night mode, these were not identified, thus the Alt-s also didn't pick it up nor alt-c"*,
reporting `M_Troffer Light - Parabolic Rectangular`.

The gate read:
```sql
ifc_class='IfcLightFixture' OR LOWER(element_name) LIKE '%light%' OR ...
```
and controlled only whether to widen `_nightGlowClasses` to `IfcFlowTerminal`. It mixes two
questions. The Clinic **has** 1105 name-matching lights but **zero** `IfcLightFixture` — so the gate
returned true, the widening was SKIPPED, the glow class list stayed `['IfcLightFixture']`, and
**nothing glowed at all, at any distance**. Having named lights disabled the fallback that would
have caught them. Now the gate tests for the CLASS only, since the class list is all it controls.

## §NIGHT_FIXTURE_VOCAB — 961 power sockets were light sources
The point-light POSITIONS query took every `IfcFlowTerminal`. On the Clinic that is 961
`M_Duplex Receptacle` and 236 `M_Lighting Switches` as well as the real luminaires. The user had
asked for a `'light'` filter a month earlier; it existed in that query **only as a test, never as
the selector**. Now name-filtered with the shared vocabulary.

## §NIGHT_NEAR_FADE — the lights nearest the camera were the weakest
User: *"They dont catch even lights right near to cam"*. `intensity = 8.0 * (0.3 + 0.7*min(1,dist/15))`
means a light AT the camera runs at 30% — the dimmest in the scene, by design, added to fix "inside
too bright". Exactly backwards for an interior shot. Kept for navigation, lifted to 1.0 for the still.

## §NIGHT_LIGHT_MIX — colour by fitting type
User: *"if we can have a mix of amber, and bluish etc"*. One flat `0xffe4b5` for every fixture makes a
building read as one lamp repeated N times. Derived from the fitting, not randomised:
`cool 0xdce8ff` (troffer/batten/T8/low-bay), `warm 0xffdca8` (downlight/sconce/pendant/surface),
`exit 0x9bffc0` (exit/keluar/signage), `amber 0xffe4b5` fallback. **Where the model STATES the
temperature it wins** — Terminal's families carry `cw`/`ww` in the name, and stated data outranks a
type convention.

---

## The luminaire vocabulary — the one rule every path must share
Three consumers now select luminaires (night positions, night glow, §PHOTO_EMBER). They must agree.
- **NOT by `ifc_class`** — Terminal/Hospital use `IfcLightFixture`, the Clinic uses `IfcFlowTerminal`.
  Keying on the class finds ZERO in the Clinic.
- **NOT by a bare `%light%`** — that matches `M_Lighting Switches` (236) and `M_Lighting and
  Appliance Panelboard` (28). Measured on the Clinic: **1105 naive matches -> 841 real luminaires**.
- **Include:** light, troffer, downlight, luminaire, lamp, sconce, pendant.
- **Exclude:** switch, receptacle, panelboard, socket, outlet.

Verified per family on the Clinic (all mapped to `MeshStandardMaterial` with an emissive channel):
`Troffer Rectangular 443 · Troffer Square 158 · Downlight 147 · Pendant 70 · Surface 11 · Sconce 8 ·
Signage 4`.

## Related, and NOT to be re-derived
- **`rel_contained_in_space` has NO ELEC rows** (ACMV/ARC/STR only). Group fixtures to rooms by
  POSITION, via `element_transforms` against the space's `center_*`/`size_*`.
- **The Clinic is 5 federated models**; `A.streamBuilding()` must be called ONE AT A TIME, waiting
  for the guid count to settle, or only one lands.
- **Use `A.ifc2three(x,y,z)`** for DB->world. Three attempts to reinvent that mapping put a probe
  camera outside the building and inside walls.
- **Emissive alone is invisible** (measured 56.13 -> 56.13 mean luminance). Bloom is not an
  increment on glow, it is the half that makes glow exist. See PHOTOREAL_STILL_RENDER.md §PHOTO_EMBER.
- **`toneMappingExposure = 0.45` is the DAY value and stays.** The lift belongs in the photoshoot
  (`PHOTO_EXPOSURE_LIFT`), because raising the renderer default brightens day navigation — and the
  user recalls overexposure trouble from doing exactly that.

## Measured result of the 2026-07-27 batch
Night still vs night nav, Clinic, same Alt+C pose: **mean luminance 61.77 -> 103.17 (+67%)**,
hot pixels 1.289% -> 2.323%. Stills: `~/Pictures/Screenshots/ember/night_{1_nav,2_still}.png`.

## Open
- The near-fade is still 0.3 in NAVIGATION — correct there, but it means walking a corridor at night
  is dimmer than the still of the same spot. Judge before changing; it is anti-blowout, not an oversight.
- 48 lights across 841 fixtures still leaves rooms unlit. Raising it is a measured decision, not a
  dial: check shader-recompile stalls and per-frame cost on the biggest building before moving it.

---

# ⓘ SUPERSEDED — was the 2026-07-27 handover. Kept for the §THE BLOCKER analysis only.
**The live handover is the LAST section of this file (2026-07-28). Do not start here.**
`A._emberEnabled = false` in `viewer/effects.js` — still true, ember is still disarmed.

## What is live on `main` right now (keep — these fix real bugs)
| § | what it fixes | proof |
|---|---|---|
| §NIGHT_GLOW_CLASS_GATE | the Clinic lit **nothing at all** before it | `fixtures=841 source=IFC+fallback` |
| §NIGHT_FIXTURE_VOCAB | 961 receptacles + 236 switches were light sources | 1105 naive → 841 real |
| §NIGHT_LIGHT_MIX / §NIGHT_MIX_RATIO | colour by fitting type + a 20/20 blue/amber share | amber 20.1%, blue 17.7%, deterministic |
| §MAXQ_HIDDEN_PAUSE | a backgrounded tab silently ruining bakes | witness 6/6, RED 0/6 |

## What is OFF, and why (do not simply re-enable)
`§PHOTO_EMBER`, `§PHOTO_BLOOM`, `PHOTO_EXPOSURE_LIFT` (2.2→1.0), and the 48-light still boost — one
look, judged together. User, live on Hospital: **black rectangles and lit wall panels.**

## §THE BLOCKER — per-material emissive cannot work at this scale
Their own log is the entire diagnosis:
```
§PHOTO_EMBER lit 1216 luminaires -> 1216 guidMap hits, 86 meshes, 7 materials
```
**Seven materials for 1216 luminaires in a 63,182-element building.** Batched and instanced meshes
share ONE material across everything they draw. So:
- setting `emissive` on those 7 lit **walls, beams and railings** — everything else drawn with them;
- `toneMapped=false` on a material shared by a **transparent** panel renders it **pure black** —
  those are the black rectangles, not a bloom artifact.

An exclusivity guard (`§PHOTO_EMBER_EXCLUSIVE`, in the code, working) skips any material shared with
a non-luminaire. Measured on the Clinic: **6 materials → 4 applied, 2 skipped.** It cuts the damage
**and simultaneously proves the approach is a dead end** — the same sharing that causes the collateral
is what the fixtures themselves are drawn with, so a correct guard also starves most fixtures of glow.
**This needs a different mechanism, not a better filter.** Do not spend the next session tuning it.

### Mechanisms worth evaluating instead (none tried yet)
1. **Additive glow sprites/quads at fixture positions.** Decoupled from the geometry entirely, so
   material sharing becomes irrelevant — the collateral problem disappears by construction. Positions
   are already computed and correct (`A._nightFixtures` + `A.ifc2three`, 841/1216 verified). Bloom
   picks them up. This is the strongest candidate and the cheapest.
2. **Per-instance emissive via a custom attribute** on InstancedMesh/BatchedMesh, injected through
   the existing `onBeforeCompile` hook that triplanar already uses. Precise, but touches the hot
   material path that Layer 3 depends on.
3. **A dedicated luminaire mesh layer** — clone luminaire geometry into its own mesh with its own
   material at stage time, restore on teardown. Simple, costs geometry.

## Also unresolved
- **`§PHOTO_BLOOM` has never been judged on its own.** The user has not seen it work — it shipped
  attached to a broken ember. `viewer/lib/BloomPass.js` is written, wired before `OutputPass`, and
  measured harmless. Judge it against emissive that actually lands.
- **AO does not reduce cost — it adds it.** User asked "is it really using occlusion to lessen its
  burden?" No: `§PHOTO_AO done frames=24 totalMs=635 avgRenderMs=23.8`. AO is shading, not culling.
  **The `o` key is `toggleDlodNav` (DLOD), which IS the culling system** — that is the one that hides
  distant/small geometry to save cost. AO and DLOD are unrelated; do not conflate them again.
- Night NAVIGATION is dimmer than a still of the same spot (0.3 near-fade, correct as anti-blowout).

## How to verify anything here
Rig `/tmp/wt-turn` on port 8403, buildings symlinked (Clinic included).
`PORT=8403 node probe_night_still.js` — night mode + Alt+S, reports lights nav/still/restored and
every `§PHOTO_EMBER` / `§NIGHT_*` line. `probe_mix.js` checks the colour ratio and its determinism.
**Test on Hospital, not only the Clinic** — the Clinic's 33-element collateral read as a footnote and
is exactly why this shipped broken; Hospital is where the same ratio becomes a broken render.

---

# §PHOTO_GLOW_SPRITE — the replacement mechanism (spec written 2026-07-27, before any code)

Taking mechanism **1** from §THE BLOCKER's list: *additive glow sprites at fixture positions*. Chosen
over per-instance attributes (2) and a cloned luminaire layer (3) because it is the only one of the
three where **the collateral problem cannot occur by construction** — it never touches a scene
material, so material sharing becomes irrelevant rather than merely guarded against.

## The claim this must prove or disprove — W-GLOW-SPRITE
> A luminaire reads as a light source in the frozen still, on **Hospital** as well as the Clinic,
> **without any scene material being modified** — therefore with zero lit walls, zero lit beams,
> and zero blacked-out transparent panels.

Three numbers decide it, all read programmatically, none by looking at the picture:
1. **`materialsMutated = 0`** — asserted, not assumed: the probe snapshots `emissive`,
   `emissiveIntensity` and `toneMapped` of every scene material before staging and diffs after.
   Any non-zero value fails the run outright. This is the entire point of the mechanism; a glow that
   works but still touches materials has not solved the blocker.
2. **`sprites == fixtures`** — every luminaire the vocabulary finds gets a sprite. The dead end being
   replaced could only reach 4 materials of 6 on the Clinic; the count here must be all of them.
3. **mean luminance / hot-pixel share, still vs. the same pose with sprites suppressed.** A glow that
   does not move these is decoration that is not reaching the frame (`probe_ember_clinic.js`'s own
   rule, kept). Gated on (1) and (2) so it can never print a pass with nothing staged.

## The mechanism
ONE `THREE.Points` object, built at still-start, removed and disposed at teardown.
- **One draw call for every fixture in the building.** This is why the light *count* budget
  (`_nightMaxLights` 12 / 48) does not apply to it — those are per-fragment lighting costs on every
  lit material; a Points cloud is a single additive pass with no lighting term at all.
- **Per-fixture colour** via a vertex-colour attribute, taken from `p.__color` — the same
  §NIGHT_LIGHT_MIX value the point light at that fixture already uses, so the sprite and the light
  agree instead of being two independent colour decisions.
- **`toneMapped = false` is safe here** and is not safe on a scene material: this material is drawn
  by nothing but the sprites. That asymmetry is exactly what made the old approach black out
  transparent panels.
- **`depthTest = true`, `depthWrite = false`** — a lamp behind a wall must not shine through it, and
  two overlapping halos must not occlude each other.

## The constants, and what each protects
| constant | value | why |
|---|---|---|
| `GLOW_SPRITE_SIZE` | 1.1 m | Halo diameter in world units (`sizeAttenuation`), sized against a 0.6x1.2m troffer — the halo reads as light *around* the fitting, not as a second fitting. |
| `GLOW_GAIN` | 3.0 | Linear-space multiplier on the vertex colour. Peak sprite radiance ~3.0 against `BloomPass` `threshold: 1.0` — above the threshold on purpose, since a value at or below it is invisible to bloom and we are back to "emissive alone moved 56.13 → 56.13". |
| `GLOW_EYE_OFFSET` | 0.15 m | Toward the camera. **Not a fudge:** the DB gives a fixture's *centre*, and the glow leaves its visible face, which is nearer the eye than its centre by roughly half its thickness. Without it the fitting's own geometry wins the depth test against a sprite sitting inside it and the glow is invisible. Computed once at still-start — the still is frozen, so once is exact. |

## Known limitation, stated up front
`THREE.Points` sprites are culled by their **centre**, so a halo whose fixture is just off-screen pops
out rather than fading at the frame edge. At 1.1 m it is a fringe artifact. If it reads on a real
still, mechanism 3 (a billboarded `InstancedMesh` quad) is the upgrade — same positions, same colours,
same staging, more geometry.

## What stays OFF
`§PHOTO_EMBER` stays disarmed (`A._emberEnabled = false`). This is a replacement, not an addition —
if both were on, neither's contribution would be attributable. `§PHOTO_BLOOM` is REQUIRED by this
mechanism and is enabled with it (it has still never been judged on its own; it now gets judged
against emission that actually lands).

---

# ⛔ HOW THIS FEATURE IS TESTED — user directive, 2026-07-27. Read before writing any probe.
**Do NOT test lighting by having the AI look at it — no vision, no screenshots, no luminance
measurement — at an early juncture. Only after the USER has established the baseline.**
User, verbatim: *"i will test with one look, leave that to me. U get all the intended elements
correct"* and *"STOP TESTING THAT WAY, JUST GET THOSE RIGHT ELEMENTS COUNTED"*.

The division of labour is fixed:
- **The AI's job is the DATA:** are the right elements selected, counted, and applied, and is nothing
  else touched. All of that is answerable from the DB and from object state — `sqlite3` against
  `buildings/*.db` answers the selection question in **seconds**, with no browser at all.
- **The USER's job is the LOOK.** One glance establishes the baseline. Until that baseline exists
  there is nothing for a pixel measurement to be measured against, so building one is waste.

What this rule cost when it was not followed, this session: an Alt+S fold is ~90s under SwiftShader,
a 3-fold run ~6 min, a 21-pose raycast scan ~10 min, and several of those runs were then discarded
because the *probe* was wrong (camera aimed at a floor, frames shot mid-stream, the wrong snapshot
used as baseline). The counting question that actually mattered — exit signs missing from the
vocabulary — was answered by one `sqlite3` query over five buildings in under a second, and it is
the only defect the pixel runs never found.

---

# §PHOTO_GLOW_SPRITE — RESULT (2026-07-27, same day as the spec above)

## It is a NIGHT-MODE feature, not an Alt+S feature
Changed mid-session on the user's instruction (*"it has Night or just night mode is enough.. see if
those 'lights' are activated"*). The sprites now stage when **night mode goes on**, with nothing else
pressed. There is no budget reason to have hidden them behind Alt+S: the 12/48 light caps exist
because each point light costs per-fragment work on every lit material every frame, and this is ONE
additive draw call whether the building holds 12 fixtures or 1216. Only **bloom** stays still-only —
that is 7 extra full-screen draws and it does have a 60fps cost.

## §NIGHT_NAME_NOT_CLASS — why luminaires kept going missing
User: *"anything that has 'light' name"*, *"i dunno why we keep missing 'light' in names"*, *"LIGHT!!!"*.
**The answer is the `ifc_class` gate.** The selector used to read

```sql
WHERE ifc_class IN ('IfcLightFixture','IfcFlowTerminal','IfcElectricAppliance') AND <name words> AND NOT <accessories>
```

and any luminaire filed under a different class was dropped without trace. The class was never doing
useful work: inside those three classes, **every family the name vocabulary rejects is a receptacle,
diffuser, sink, grab bar, mirror, data outlet or sprinkler** — checked family-by-family on all five
shipped buildings. The NAME was always the selector; the class was only ever hiding things.

Removing it adds exactly **12** elements across all five buildings — 9 real, 3 substring accidents:

| added | class | family | verdict |
|---|---|---|---|
| 9 | `IfcAlarm` | `jkrME_fir-al_Flashing Light_Red & Green` (Terminal) | **real** — a lit fixture the class gate hid |
| 1 | `IfcBuildingElementProxy` | `Life_Flight_Helicopter` (Hospital) | accident — "f**light**" |
| 2 | `IfcWindow` | `M_Skylight` (Duplex) | accident — "sky**light**" |

So `flight` and `skylight` join the exclusion list. Those two are the price of selecting on the name,
and it is the right price: the class gate cost 9 real fixtures plus every future model that files a
luminaire somewhere unexpected.

## §NIGHT_EXIT_SIGNS — 100 exit signs were dark
`A.nightLightColor` has carried an `exit 0x9bffc0` branch for exit/keluar/signage since
§NIGHT_LIGHT_MIX — but those words were never in the **selector**, so the branch could not fire.
Exactly the bug class as the `'light'` filter that "existed in that query only as a test, never as
the selector". Adding `exit sign` / `keluar` / `signage`: **Clinic +43, Hospital +57**, others
unchanged (their signs already carry the word "Light"). **Zero false positives** — every element
matching those three words in all five DBs is already in a luminaire class. `exit sign`, not bare
`exit`, which would reach exit corridors and exit doors.

## §GLOW_EXIT_SOFT — a sign is not a troffer
User: *"exit signs should have soft appropriate lighting"*. Exit signs get `GLOW_EXIT_GAIN 0.9` and
`GLOW_EXIT_SIZE 0.40` (a ~0.44m halo against the luminaires' 1.1m). **0.9 is deliberately below the
bloom threshold of 1.0** — that is what makes it soft: the sign glows but never blooms, while the
luminaires at gain 3.0 do. Per-fixture size needs a one-line `onBeforeCompile` patch
(`gl_PointSize = size * aSize`) because `PointsMaterial.size` is one uniform for the whole cloud —
worth it to keep everything in ONE object and one draw call.

## THE LIST — every family selected, all five shipped buildings (884/1272/823/14/410)
| Clinic — 884 | Hospital — 1272 | Terminal — 823 |
|---|---|---|
| 443 `M_Troffer Light - Parabolic Rectangular` | 1151 `M_Plain Recessed Lighting Fixture` | 354 `E_Light_2 X 28W_Recessed_MPRL_LED T8 cw` |
| 158 `M_Troffer Light - Parabolic Square` | 57 `Exit Sign Ceiling Based` | 179 `E_Light_Emergency_V1` |
| 147 `M_Downlight - Recessed Can` | 52 `M_Pendant Light - Linear - 2 Lamp` | 96 `E_Light_1 X 28W_Surface_LED T8_V1` |
| 70 `M_Pendant Light - Linear` | 12 `M_Pendant Light - Hemisphere` | 66 `E_Light_100W_Low Bay_V1` |
| 35 `Exit Sign - Ceiling_Mount_Single` | | 39 `E_Light_1 X 14W_Surface_LED T8_V1` |
| 11 `M_Surface Mounted Light` | | 38 `E_Light_Keluar Emergency_V1` |
| 8 `M_Sconce Light - Sphere` | | 20 `E_Light_1 X 28W_Wall_LED T8_Weatherproof_V1` |
| 6 `Exit Sign - Ceiling_Mount_Double Face` | | 14 `E_Light_2 X 14W_Recessed_MPRL_LED T8 cw` |
| 4 `Lighted Signage` | | 9 `jkrME_fir-al_Flashing Light_Red & Green` *(IfcAlarm)* |
| 2 `Exit Sign - End Mount - Double Face` | | 8 `E_Light_1 X 28W_Wall_LED T8_V1` |

| Duplex — 14 | HHS_Office_Federated — 410 |
|---|---|
| 8 `M_Pendant Light - Hemisphere` | 195 `M_Plain Recessed Lighting Fixture` |
| 6 `M_Sconce Light - Sphere` | 84 `M_Pendant Light - Linear - 2 Lamp` |
| | 66 `M_Sconce Light - Flat Round` |
| | 65 `M_Pendant Light - Disk` |

Classes carrying luminaires, for the record: Clinic `IfcFlowTerminal`, Hospital `IfcLightFixture`,
Terminal `IfcLightFixture` + `IfcAlarm`, Duplex `IfcFlowTerminal`, HHS `IfcFlowTerminal`. Five
buildings, three different classes — which is the second reason the class gate had to go.

## Staging, verified on Clinic and Hospital (`probe_glow_night.js`, before the vocabulary widened)
| | Clinic | Hospital |
|---|---|---|
| sprites applied in night mode, no Alt+S | 841 of 841 | 1215 of 1215 |
| sprites after night OFF | 0 | 0 |
| **scene materials mutated** | **0** | **0** |
| scene meshes sharing the sprite material | **0** | **0** |

## Why the wall panels cannot light up now
User, twice: *"it must avoid the mistake of lighting up wall panels."* The lit panels and the black
rectangles were **a changed `emissive` and a flipped `toneMapped`** on a material shared with
non-luminaires. The witness snapshots `emissive`, `emissiveIntensity` and `toneMapped` for every
scene material before staging and diffs after: **0 changed, on both buildings.** Nothing is filtered,
guarded or tuned — there is no code path that writes a scene material at all, and the sprite cloud's
own material is shared with **0** scene meshes. `toneMapped=false` is safe on it for that reason and
was never safe on a shared one.

## Also proven, then dropped as not worth the cost
One earlier run did measure pixels (Clinic, night, difference image): **25,425 px brightened, mean
delta 52.8, max 242, hot pixels 0.629% → 1.211%**, and a depthTest-off control changed 173,815 px —
i.e. the cloud draws, and with depth on, lamps in other rooms are correctly occluded rather than
shining through walls. Kept as a record; **not** the standing witness. Per the user: *"you need not
test that way.. by measuring light.. just whether those elements are included and applied"* — pixel
measurement needs a camera with lamps in line of sight, and finding one costs a raycast search plus
~90s per fold, for a question inclusion + application already answers.

## Landmines found on the way — do NOT re-derive these
- **The Alt+C path flies at the wrong storey height for the Clinic.** `probe_glow_diag.js` scanned
  all 21 poses: `clearLOS = 0` across the ENTIRE interior band t=0.15..0.60, 100-200 fixtures in
  frustum each. Any lighting verdict measured from an Alt+C pose on this building is measuring an
  empty room. Separate defect, not investigated here.
- **`A.ifc2three` returns a plain `{x,y,z}`, not a `THREE.Vector3`.** No `.distanceTo`, no
  `.clone`. Cost one probe crash.
- **Aiming at the centroid of NEARBY fixtures points the camera at the floor** — lamps surround you,
  so their centroid is roughly under your own feet. Measured as an exactly-0-pixel difference.
- **A single-model DB (Hospital) never triggers a stream-gated settle-wait.** A probe that only waits
  after `streamBuilding()` shoots mid-stream, and reported a frame getting 35% DARKER with additive
  sprites on — physically impossible, and it would have been read as a result. Settle unconditionally.
- **Diff the post-night-OFF material snapshot against the DAY snapshot, not the night one**, or night
  mode restoring its own glow materials reads as a sprite failure.

## Rejected on cost, with the measurement that rejected it
A per-sprite raycast placing each glow on its fitting's visible face. More precise, and it would
recover the whole ≤0.8m fitting-occluded group. **Raycasting batched meshes measured at roughly
50ms/ray** — 841 fixtures is a tens-of-seconds stall at still-start and Hospital's 1216 is worse.
Took the zero-cost constant instead: `GLOW_EYE_OFFSET` 0.15 → **0.30**, chosen off the occlusion-gap
histogram (115 sprites occluded by ≤0.05m, 188 cumulative by ≤0.3m, ~286 by ≤0.8m, against thousands
at 1.5m+ that are lamps behind WALLS and must stay hidden). 0.30 clears most of the fitting group
without reaching into the architecture band.

## Still open
- The per-point clipping limitation is unaddressed: `THREE.Points` clips a sprite by its CENTRE, so a
  halo whose fixture is just off-screen pops rather than fading at the frame edge. The upgrade is a
  billboarded `InstancedMesh` quad — same positions, same colours, same staging, more geometry.
- `§PHOTO_BLOOM` still has not been judged on its own by the user.

---

# ▶▶ NEXT SESSION — START HERE. Written 2026-07-28 at session close.
**Everything above is background. Some of it describes code that was REVERTED — this section is
the authority on what is actually live.**

## What is live on `main` (v866) — keep
| § | what it does | numbers |
|---|---|---|
| `§PHOTO_GLOW_SPRITE` | ONE additive `THREE.Points` cloud at fixture positions, staged by **night mode** (not Alt+S) | 1 draw call for the whole building |
| `§GLOW_EMIT_DOWN` | drops each sprite to the fitting's emitting FACE using real `bbox_z`, THEN nudges toward the eye | troffer 0.19m, downlight 0.22m, pendant-linear 0.889m |
| `§NIGHT_NAME_NOT_CLASS` | selection is `ifc_class='IfcLightFixture' OR <name words>`, a UNION | the class gate was ANDed and hid luminaires filed elsewhere |
| `§NIGHT_EXIT_SIGNS` | `exit sign`/`keluar`/`signage` added to the vocabulary | Clinic +43, Hospital +57 |
| `§NIGHT_ROLE_EXCLUDE` | rejects by role class + `clamp`/`alarm`/`detector`/`sprinkler`/`flight`/`skylight` | Terminal 823→814 (9 `IfcAlarm` beacons) |
| `§GLOW_EXIT_SOFT` | exit signs gain 0.9 (under the bloom threshold), size x0.40 | a sign glows, a troffer blooms |
| `§NIGHT_MIX_WHITE` | 20/20/60 amber/blue/**flat white** | colour values only |

**Counts: Clinic 884 · Hospital 1272 · Terminal 814 · Duplex 14 · HHS 410.**

**THE INVARIANT, and it is the whole reason this approach works: the sprite cloud owns its own
material, shared with NOTHING. Verified — the diff against main adds ZERO writes to any scene
material (`.transparent`, `.opacity`, `.depthWrite`, `.emissive`, `.toneMapped`). Every regression
this session came from giving that property away. Do not give it away.**

## OFF, deliberately
`A._bloomOff = true` (bloom overshot) · `A._nightStillBoost` unset (48 lights made Alt+S heavy,
§STILL_REFINE 4496→6560ms) · `§PHOTO_EMBER` still disarmed.

## ⛔ THE JOB: the translucent cover
User: *"that cover supposed to be translucent"* + *"translucent must not have own source of light but
allow light thru if it is against light"*.

**§NIGHT_DIFFUSER was built for this and REVERTED — it was the black boxes.** It forced `emissive`
to black, set `transparent`, cleared `depthWrite` on luminaire materials. Hospital has FIVE luminaire
materials; it took all five, so all **1151 `M_Plain Recessed Lighting Fixture`** panels became dark
translucent rectangles in a dark ceiling.

**Why it failed, and the design constraint for the retry:** the user's physics is right — a diffuser
TRANSMITS, it does not EMIT — but it was implemented as *remove the emissive*, with nothing ever
placed BEHIND the cover to shine through. A diffuser with no source behind it is a dark panel.
**Both halves are required:**
1. a light source INSIDE the housing (the sprite cannot serve — `§GLOW_EMIT_DOWN` puts it at the
   emitting face, in FRONT of the cover), and
2. a cover that transmits it (`transparent` + `depthWrite:false` so the source behind survives the
   depth test).

**The material-sharing problem is solved and the solution is worth recovering:** `A._matCache` is
keyed `rgba|ifcClass|matVariant` (streaming.js), so materials are shared only by same-colour
same-class elements — NOT by everything a batched mesh draws, which is what the old ember guard
wrongly measured at mesh level. Measured exclusivity: Hospital `_default|IfcLightFixture` 1151/1151
exclusive ✅; Clinic `0.384,0.384,0.384|IfcFlowTerminal` 601/601 ✅; Clinic
`0.920,0.900,0.850|IfcFlowTerminal` 1974 total / 384 luminaires ❌ (shared with 1590 grab bars,
receptacles, diffuser grilles — the Clinic authors ONE material, `≈ Off-White`, across 20 families;
`material_name` does not separate them either).
`§LUM_VARIANT` solved that by returning `'lum'` from `A._entourageVariant()` so luminaires split into
their own material by NAME at load time — the same mechanism RPC people/trees use, no DB change, no
invented colour. **It was reverted with the rest, not because it was wrong.** Recover it from
git history (`fix/night-diffuser-bloom`) if the retry needs it.

## ⚠ Two process traps that cost this session ~6 test rounds — check BOTH before believing a log
1. **`sw.js` CACHE_VERSION + the `?v=` pins in `viewer/viewer.html`.** `viewer.html` pins each module
   (`tools.js?v=31`, `effects.js?v=3`, `streaming.js?v=56`); an edited file keeps its OLD url and is
   served from cache. ~12 commits shipped without bumping either, and the user's logs were read as
   evidence about the CODE when they were evidence about the CACHE. **`§BUILD_VERSION` in the log is
   the ground truth for which build is running.**
2. **Auto-merge squashes a PREFIX of a branch and orphans the rest** — happened three times (#1058
   took 1 of 5 commits, #1059 took 6 of 9). **Verify a merge by CONTENT** (`git show
   origin/main:<file> | grep -c <marker>`), never by PR state or commit list.

## Testing rule (user directive, still standing)
See §HOW THIS FEATURE IS TESTED above. The AI's job is the DATA — selected / counted / applied /
nothing else touched, answerable from `sqlite3` in seconds. **The look is the user's.** No AI vision,
no luminance probes, until the user has established a baseline.

---

# §TRANSLUCENT_COVER — THE CALCULATION (2026-07-28, before any code)
**Question asked: "calculate and discuss if it is worth it."** Every number below is from
`sqlite3` over the five shipped `*_extracted.db` and from reading `origin/main:viewer/streaming.js`.
No code was written for this section.

## 1. There is no cover. There is only the whole fixture.
`element_instances` is `guid PRIMARY KEY` → **one geometry per element, one material per element**,
and `component_geometries` stores `vertices`+`faces` with **no material groups**. Verified: every
Hospital `IfcLightFixture` and every Clinic troffer resolves to exactly 1 component (1272/1272,
601/601). So `transparent+opacity` cannot reach "the cover" — it reaches the housing, the back and
the reflector at the same time, because they are the same six faces of the same mesh.

What that mesh actually is:
| family | building | n | verts / tris | what frosting it does |
|---|---|---|---|---|
| `M_Plain Recessed Lighting Fixture` | Hospital | **1151 (90% of its luminaires)** | **34 / 12** — a BOX | the ceiling gets a see-through rectangle onto the void behind it |
| `M_Troffer Light - Parabolic Rect/Sq` | Clinic | 601 | 868 / 424, 476 / 224 | real louvers, but they go 55% transparent WITH the cover — a ghost, not a lit lens |
| `M_Pendant Light - Linear` | Clinic | 50 | 1584 / 766 | hangs free; nothing behind it to see through to |
| `M_Downlight - Recessed Can` | Clinic | ~147 | 446 / 220 | can + trim, one material |

**A 12-triangle box has no inside and no cover.** §NIGHT_DIFFUSER's failure was not only "no source
behind it" — it is that on 1151 of Hospital's 1272 fixtures there is nothing a diffuser could be
distinguished FROM. That is the same mechanism as the black rectangles, reached from the other side.

## 2. Interior depth exists, so half #1 is buildable — it just does not need the cover
`bbox_z` of selected luminaires: Clinic 0.10–2.00 (avg 0.266) · Hospital 0.15–1.25 (avg 0.182) ·
Terminal 0.045–0.62 (avg 0.14) · Duplex 0.40–0.675 · HHS 0.146–1.727. **0 fixtures below 20mm on any
building** — a second sprite ring at `bbox_z/2` behind the face is geometrically well-defined.
But the cover would be `depthWrite:false`, so that inner sprite is **not depth-culled by the cover
either way** — the same pixels can be had by moving the existing sprite, with no material write at
all. The cover contributes nothing to the light; it only makes the body see-through.

## 3. Coverage under the exclusivity gate, measured per building
| building | luminaires | on EXCLUSIVE material keys (would frost) | on SHARED keys (must skip) |
|---|---|---|---|
| Hospital | 1272 | **1272** (`_default\|IfcLightFixture` 1151/1151 + 4 more keys) | 0 |
| Terminal | 814 | **814** (6 keys, all pure) | 0 |
| Clinic | 884 | **736** | **148** — `0.920,0.900,0.850\|IfcFlowTerminal` is 1974 elements, 1826 of them not lights |
| HHS | 410 | 0 | **410** — `_default\|IfcFlowTerminal` 725 total, 315 others |
| Duplex | 14 | 0 | **14** — `\|IfcFlowTerminal` 105 total, 91 others |
| **total** | **3394** | **2822 (83%)** | **572 (17%)** |
`§LUM_VARIANT` (67 reverted lines, recoverable) takes this to 3394/3394 and makes it STRUCTURAL
rather than a per-building measurement. That part of the reverted work is sound and worth keeping.

## 4. ⚠ LANDMINE the reverted design did not account for — the DB key is not the draw-level key
`streaming.js:1028` buckets BatchedMesh by **`storey|disc|rgba|matVariant` — `ifc_class` is NOT in
the bucket key** — and `streaming.js:1086` then takes the bucket's material from
`items[0].el.ifcClass`. So one material object can be handed to a bucket holding several classes.
`_buildExclusiveLumKeys()` scans `elements_meta` GROUP BY `rgba, ifc_class` and cannot see this.
Simulated bucket composition (single-instance hashes, the BatchedMesh path):
- HHS `Level 1..3|MEP|_default`: 337 luminaires bucketed with **1657 ducts, pipes and diffusers**.
- Duplex `Unknown|MEP|`: 5 luminaires bucketed with **566 pipes/elbows/tees**.
- Clinic `Unknown|ELEC|0.920,0.900,0.850`: 46 luminaires with 8 others (receptacles, AHU, chiller).
- Hospital / Terminal: **1251 and 814 luminaires are InstancedMesh groups, 0 non-luminaires** — clean.
On the shipped five the DB gate happens to skip all three mixed cases for another reason (their rgba
key is shared anyway), so the old code was **lucky, not correct**. Any retry must scan at draw level.

## 5. The cost, stated
- 171 reverted lines to recover (`4af5927` 104 + `ffaff11` 67) + the inside-source half + a
  draw-level exclusivity scan to replace §4's DB-level one ≈ one full session.
- It spends **THE INVARIANT** (§NEXT SESSION: "the sprite cloud owns its own material, shared with
  NOTHING… every regression this session came from giving that property away").
- The look is the user's to judge (standing directive), so every iteration is a user round-trip. The
  previous attempt cost ~6 test rounds, one 204-line revert, and shipped a live regression.

## 6. VERDICT — not worth it as specified. Build §GLOW_LENS_QUAD instead.
Scored:
| | translucent cover | §GLOW_LENS_QUAD |
|---|---|---|
| fixtures it can reach | 2822/3394, or 3394 with §LUM_VARIANT | **3394/3394, every building** |
| scene materials written | 5+ per building | **0 — invariant intact** |
| draw calls added | 0 (reuses the batch) | **1** (one InstancedMesh) |
| gets "the fixture body reads as lit" | no — it reads as see-through | **yes — the lens IS the glow** |
| new failure mode | see-through box over a dark plenum = the black rectangles again | per-quad orientation must follow `rotation_*` |
| effort | ~1 session + user rounds | ~1 session, no material risk |

**§GLOW_LENS_QUAD:** replace the round `THREE.Points` halo (`GLOW_SPRITE_SIZE = 1.1` m, one scalar,
always a square) with an **instanced quad sized `bbox_x × bbox_y`** at the emitting face, oriented by
the stored `rotation_*`. A lit 600×1200 troffer seen from below IS a 0.6×1.2m rectangle of light —
that is the thing the user is asking to see, and it is reachable without touching one scene material.
Data is complete for it: **0 of 3394 luminaires have a null or zero `bbox_x`/`bbox_y`** (Clinic avg
0.78×0.66, Hospital 0.85×0.72, Terminal 0.63×0.65, Duplex 0.47×0.56, HHS 0.82×0.70). It also closes
the known §Still-open defect — `THREE.Points` clips a sprite by its CENTRE, so halos pop at the frame
edge; a quad does not.

**Keep from the reverted branch:** `§LUM_VARIANT` only, and only if a later job needs per-luminaire
materials. **Do not recover `§NIGHT_DIFFUSER`** — §1 is why, and it is a data fact, not a tuning one.

## §GLOW_LENS_QUAD SHIPPED (2026-08-07) — as verdicted above, still-render only
User directive that scoped it: *"only for the render, such realism will be a wow. while night fly
thru it is OK, we got alt-g noise"* — i.e. build exactly the §6 verdict above, do not touch live
navigation/night-mode's round sprite at all.

`bim-ootb` branch `fix/glow-lens-quad-stillonly` (on top of `fix/mep-material-classfix`),
`/tmp/wt-mep-material-classfix`. `tools.js` `_loadNightFixtures`/`_nightFixtureWorldPositions`
extended to carry `bbox_x`/`bbox_y`/`rotation_z` (previously only `bbox_z`). `effects.js` adds
`_glowLensOn`/`_glowLensOff` — an `InstancedMesh` of quads, each sized to its own fixture's
`bbox_x × bbox_y` and yawed by `rotation_z`, called ONLY from `startStillRefine`/
`_teardownStillRefine` (swaps with the round sprite, never stacks). Exit signs excluded on purpose,
stay on the round `§GLOW_EXIT_SOFT` treatment. Only `rotation_z` (yaw) applied, not a full 3-axis
tilt — stated simplification, no shipped luminaire is tilted off-horizontal.

Syntax-checked (`node -c`). **Not yet witnessed on real data** — per this doc's own standing
testing rule (§Testing rule above), that's a user round-trip: point Alt+S at a building with a
troffer close to camera and confirm the rectangle fits, not an AI vision check.

**Not addressed, separate issue:** "overly blue metal" (user, same screenshot round) — traced to
`PHOTO_ENVMAP_BOOST = 3.0` (`effects.js:2455`, triples every material's env-reflection strength
during Alt+S), independent of both this fix and the material class-name fix. No data pulled yet on
the actual HDRI colour or which classes it hits hardest — flagged, not fixed.

## §SESSION HANDOFF (2026-08-07, end of session) — READ THIS FIRST in the next session

**Branch:** `bim-ootb` `fix/glow-lens-quad-stillonly`, currently checked out onto a throwaway merge
branch `test/localhost-combined-v2` in worktree `/tmp/wt-mep-material-classfix` (also carries the
unrelated material class-name fix, `fix/mep-material-classfix`, as its base — see
`PHOTOREAL_STILL_RENDER.md`'s own SHIPPED note for that one). `test/localhost-combined-v2` also has
`wt/cpe-dpr-verify` merged in for local browsing convenience only — **do not carry that merge into
any real PR**, it's other sessions' unrelated in-progress work. The real work to eventually PR is on
`fix/glow-lens-quad-stillonly` alone (or a clean rebase of it).

### ⚠ THE ONE THING TO DO FIRST — verify the cache fix actually worked
Near end of session, found (live, in this session's own testing) that `effects.js`/`tools.js`/
`streaming.js` are all in `sw.js`'s `PRECACHE_ASSETS`, which its own `isNetworkFirst()` routes to
**cache-first**, not network-first (line ~292-294 — precached files are explicitly excluded from the
network-first branch). This means every edit made to those three files THIS ENTIRE SESSION was very
likely served stale to the browser during testing — confirmed by a console log showing
`§PHOTO_GLOW_SPRITE` staging in live nav on a `localhost:8410` origin, which the actual committed
source (verified by `grep`, same commit chain) does not call anymore (`§GLOW_SPRITE_NAV_OFF` removed
that call several commits earlier). **This is the exact trap this doc's own §Testing rule /
"process traps" section already named from a prior session — walked into it again before catching
it, this time on the SW's PRECACHE routing specifically, not the simpler `?v=` pin staleness that
section describes.**

Fix applied same session: `CACHE_VERSION` bumped `v959`→`v960` in `sw.js`, plus `effects.js?v=11→12`,
`streaming.js?v=59→60`, `tools.js?v=32→33` in `viewer.html`. **Not yet confirmed this actually fixed
it** — next session's first job: hard-refresh / unregister the old SW, reload, confirm
`§BUILD_VERSION v960` in the console, and re-verify from there. Every finding below this line about
"what the user saw" should be treated as **possibly against stale code** until that's confirmed.

### What actually shipped this session, in order (re-verify each once the cache is confirmed fresh)
1. Material class-name fix (`streaming.js` `TRIPLANAR_MAT`) — separate feature, documented in
   `PHOTOREAL_STILL_RENDER.md`, believed solid (syntax-checked, logically independent of the cache
   issue since it's a still-render texture pass, less iterated-on this session).
2. `§GLOW_LENS_QUAD` — still-render lens quad, sized/oriented to real fixture bbox+rotation_z.
3. Found + fixed: quad skipped synthetic-sourced fixtures; exit-sign glow regression (still gave
   exits no glow at all); the round-sprite eye-offset nudge caused visible misalignment on an
   angled/corridor view (user: "misalignment", `FitUpstairs.png`) — first "fix" attempt used the
   wrong magnitude (dumped the full 0.3m onto one axis instead of splitting it), made it WORSE, was
   reverted, tried again smaller (0.03m straight down) — **this second attempt is the one now
   sitting in the code, unverified against fresh-cache reality.**
4. User: **"remove all them, return to PL days"** — round sprite + quad both fully disabled at one
   point (real point lights only). Then reversed again ("the PLs with those quads will be perfect")
   once the misalignment was understood as one small fixable nudge, not a fundamental flaw.
5. Final 5-piece rework (user go-ahead, all in one commit `751de1a`):
   - Nav stays 24 PLs, greedy-with-4m-min-spacing selection (spreads down a corridor instead of
     clustering at the camera).
   - Quad restored for real named fixtures only (clearance fix from point 3).
   - Room-fallback tier 2 (`§NIGHT_ROOM_FALLBACK`, any real overhead element in a room lacking a
     named light — was already in the code from earlier in the session) — PL only, quad explicitly
     gated OFF for it (`p.__guid == null && !p.__presentation` → skip).
   - New tier 3, `§NIGHT_CEILING_PLANT` — only if tiers 1+2 together found NOTHING: one point per
     storey (real centroid + near-top Z, not a 15m grid), tagged `presentation: true`, gets BOTH
     quad and PL. Explicitly user-sanctioned as presentation-layer only (same category as
     ground/sky), not asserted as real IFC data — his own framing, not one I invented.
   - Still/baking light selection switched from a flat 50-cap to frustum-culled (`§NIGHT_STILL_FRUSTUM`
     in `tools.js` `_nightUpdateLights`) — everything actually in the camera's view gets a PL, sanity
     ceiling 200. `cinema_maxq.js` already calls `A.startStillRefine()` per baked frame, so movie
     baking gets this for free, no separate wiring needed — confirmed by grep, not assumed.

### Open, unresolved at session end
- **The cache-fix verification above — do this first, everything else depends on it being real.**
- User's last message before handoff: "quads are not fit downstairs as in png" — i.e. even
  disregarding the cache confusion, `FitUpstairs.png` itself showed good fit upstairs but NOT
  downstairs in the SAME screenshot — meaning the misalignment may not be fully explained by the
  eye-offset nudge alone, or there's a second contributing factor not yet found. Don't assume the
  0.03m clearance fix is sufeicient — re-derive from fresh evidence once cache is confirmed clean.
- "Overly blue metal" (`PHOTO_ENVMAP_BOOST`) — still untouched, flagged only.
- `§NIGHT_STILL_FRUSTUM`'s 200-fixture sanity ceiling and the `THREE.Frustum` construction are
  syntax-checked but not witnessed against a real wide-shot building — worth a real check once the
  cache issue is confirmed resolved.

## §GLOW_LENS_NO_DOUBLE_YAW — the second cause, found and fixed (2026-08-07, next session)

**Cache-fix (job 1 above) — confirmed at the file/server level, not yet witnessed in a live
browser session** (user paused Chrome tool use for this session — "Use Chrome only when
finalised"). Evidence gathered instead: `sw.js` `CACHE_VERSION='v961'` (bumped again this session,
was `v960`), `viewer.html` pins match (`effects.js?v=13`, `streaming.js?v=60`, `tools.js?v=33`),
worktree tree is clean at commit `df66d2d` + this session's uncommitted fix on top, and
`curl -sI localhost:8410/viewer/sw.js` serves that same file byte-for-byte. **Still open:** an
actual browser load confirming `§BUILD_VERSION v961` in-console — do this first, in Chrome, next
time Chrome use is authorized.

**The "quads not fit downstairs" open item — root cause found, NOT the eye-offset nudge.** Per
`docs/internal` / `RESUME_DISC_WALKER_ENVELOPE_BOUND.md`'s documented convention and confirmed by
direct query against `Terminal_extracted.db`: `element_transforms.bbox_x`/`bbox_y` are the
**WORLD-frame AABB** (rotation already baked in) for ordinary elements — proven by the SAME
physical fixture (`E_LFixture_EmergencyLight_EL3`) reporting `bbox_x`/`bbox_y` **swapped** between
its `rotation_z=+pi/2` instances (0.168 x 0.419) and its `rotation_z=pi` instances (0.419 x 0.168).

`effects.js` `_glowLensOn()` treated `(bbox_x,bbox_y)` as the fixture's LOCAL (unrotated) size and
then applied `rotation_z` as an EXTRA yaw on top — a double-rotation. Numeric witness (old vs new,
computed from the real DB rows, no rendering/screenshot involved):

```
rz=-3.1416  true=(0.419,0.168)  OLD_drawn=(0.419,0.168) err=0.000m  NEW_drawn=(0.419,0.168) err=0.000m
rz=-1.5708  true=(0.168,0.419)  OLD_drawn=(0.419,0.168) err=0.355m  NEW_drawn=(0.168,0.419) err=0.000m
rz=+0.0000  true=(0.419,0.081)  OLD_drawn=(0.419,0.081) err=0.000m  NEW_drawn=(0.419,0.081) err=0.000m
rz=+1.5708  true=(0.168,0.419)  OLD_drawn=(0.419,0.168) err=0.355m  NEW_drawn=(0.168,0.419) err=0.000m
```

At `rotation_z` = 0 or pi (a no-op yaw either way) the bug is invisible — explains why the fit
looked fine wherever it did. At `rotation_z` = +-pi/2 the quad's width/depth land on the wrong
world axis — a 0.355m footprint error for this fixture type, visibly "not fitting" from any angled
view. This is orientation-independent of camera position, unlike the eye-offset nudge theory —
consistent with the user's screenshot showing good fit on one storey and bad fit on another in the
SAME frame (a nudge-magnitude bug would not do that; a per-fixture rotation-dependent bug would).

**Coverage check — is dropping the yaw an approximation or exact?** Queried `rotation_z` for every
real luminaire across all 4 buildings with fixture rotation data: **0 of 823+1282+32+443 fixtures**
have a rotation off the 90-degree grid. So `q = qFace` only (no yaw) is **exact, zero residual
error**, not a compromise — every shipped fixture's rotation is an exact multiple of pi/2, where
the world AABB IS the true rotated rectangle (no bounding-box inflation).

**Fix applied**, `viewer/effects.js` `_glowLensOn()`: removed `qYaw`/`q.premultiply(qYaw)` entirely,
`q` is now `qFace` only. `p.__rz` (tools.js:1383) is now unused by this consumer — left in place,
harmless, still documents the source column. `sw.js` bumped `v960`->`v961`, `viewer.html`
`effects.js?v=12`->`?v=13`. Syntax-checked (`node --check`) — passes. Full numeric witness log:
`/tmp/claude-1000/-home-red1-bim-compiler/40c46350-a01a-4838-91e5-99c13e82add1/scratchpad/glow_lens_no_double_yaw_witness.log`
(scratchpad — copy out before it's cleaned up if this needs to survive long-term).

**Not yet done:** live-browser/log-based re-verification of the ACTUAL rendered quads (per
FUNDAMENTAL LAW: `§`-tagged log values + numeric object state, never a screenshot) once Chrome use
is reauthorized — the DB-level math above proves the fix is correct against the data, but the full
pipeline (query -> `A._nightFixtureWorldPositions()` -> `_glowLensOn()` -> actual `InstancedMesh`
matrices) hasn't been asserted end-to-end this session. Suggest a `§GLOW_LENS_QUAD_VERIFY` log line
in `_glowLensOn()` that dumps computed world corner extents per quad for a spot-checked GUID, then
compare programmatically against `bbox_x`/`bbox_y` from the DB — same pattern as this witness, run
inside the real app instead of standalone Python.

Uncommitted at end of session — sitting in `/tmp/wt-mep-material-classfix`,
`fix/glow-lens-quad-stillonly` branch (via the `test/localhost-combined-v2` throwaway merge, same
as job 1). Commit message drafted, not yet run — next session's call whether to commit as one or
split cache-bump/quad-fix into two commits.

## §GLOW_TRUE_BOTTOM — the ACTUAL cause of "quad not fitting downstairs" (2026-08-07, same session)

User re-tested with the `§GLOW_LENS_NO_DOUBLE_YAW` fix live (confirmed `§BUILD_VERSION v961` in
console) on Hospital and reported the quad **still** doesn't fit downstairs. That's real signal,
not stale cache: Hospital's 1282 luminaires are **100% `rotation_z=0`** (queried directly), so the
double-yaw fix above is a genuine, separately-proven bug (proven on Terminal, which DOES have
rotated fixtures) but provably **cannot** be what Hospital's symptom is showing — the yaw fix is a
no-op wherever rotation_z=0. Root cause was elsewhere. Per user directive this session ("No AI
visual... use WITNESS logging" / "quad map to element xyz... matter of setting up logging to
return GIGO") — found via DB + extraction source code only, zero rendering/screenshots.

**Root cause, `DAGCompiler/python/extractIFCtoDB.py:2314`:** `element_transforms.center_z` is
stored as the raw IFC placement-origin translation (`mat4[:3,3]` from the object's own placement
matrix) — NOT the bbox midpoint. `bbox_z` (line 2318) is the full world AABB height
(`maxXYZ[2]-minXYZ[2]`). The viewer's drop formula in `tools.js` (`§GLOW_EMIT_DOWN`,
`p.__drop = bbox_z/2 + 0.12`) assumed `center_z` sits at the bbox midpoint, so that `center_z -
bbox_z/2` lands on the true bottom face. **That's only true when a fixture's authored mesh happens
to be symmetric about its own placement origin.** Most Revit families are NOT — a pendant's origin
is typically at the ceiling attach point, with most of the mesh hanging below it; even flush
fixtures aren't perfectly centered.

**Numeric witness** (pulled real mesh vertices from `Hospital_geo.db` `component_geometries`,
decoded local Z min/max, computed true world bottom = `center_z + local_min_z`, compared against
both the OLD formula and the NEW fix — full log:
`/tmp/claude-1000/-home-red1-bim-compiler/40c46350-a01a-4838-91e5-99c13e82add1/scratchpad/glow_true_bottom_witness.log`):

```
Pendant Linear (Level 1, the reported "downstairs" fixture family):
  TRUE bottom=170.6814  OLD=170.3955 (err -286mm)  NEW=170.6514 (err -30mm, by-design clearance)
Plain Recessed (Level 2 — thought "fine", actually also wrong, just less visually obvious):
  TRUE bottom=174.5878  OLD=174.4634 (err -124mm)  NEW=174.5578 (err -30mm, by-design clearance)
Pendant Hemisphere (Level 2, third family checked):
  TRUE bottom=173.6628  OLD=173.3908 (err -272mm)  NEW=173.6328 (err -30mm, by-design clearance)
```

**Every fixture type was wrong**, not just Level 1's — the error is smaller for flush/recessed
fixtures (thin mesh, small mismatch) and much larger for suspended pendants (mesh mostly below its
own origin), which is exactly why Level 1 (the ONLY level using `M_Pendant Light - Linear`) looked
visibly broken while other levels (mostly `M_Plain Recessed`) looked closer to right without
actually being exact.

**Fix, no schema/migration needed** — the true data already ships: `element_instances.geometry_hash`
(already in both the monolithic and split `_meta.db`, confirmed via direct query) points at
`component_geometries.vertices` in `_geo.db`, and by the time night mode runs, the fixture's mesh
is normally already decoded into `A.meshCache[ghash]` (same `THREE.BufferGeometry`, same
IFC-Z-is-local-Y convention as `A.blobToGeometry` already uses — confirmed by reading that function
directly, not assumed). `tools.js` `_loadNightFixtures()`: added `i.geometry_hash` to the SELECT
(`LEFT JOIN element_instances i`). `_nightFixtureWorldPositions()`: `p.__drop` now reads
`-A.meshCache[f.ghash].boundingBox.min.y + 0.03` when the mesh is cached (exact, real geometry),
falling back to the old heuristic only when it isn't (mesh not streamed yet, or a synthetic
room-fallback/ceiling-plant fixture with no `geometry_hash` at all). `0.03` reuses
`GLOW_LENS_CLEARANCE`'s already-established value from `effects.js` (same physical purpose —
clearing the fixture's own depth test — not a new invented number.

`sw.js` bumped `v961`->`v962`, `viewer.html` `tools.js?v=33`->`?v=34`. Syntax-checked, both files
pass `node --check`. Uncommitted, same worktree/branch as the other two fixes this session.

**Not yet done:** live confirmation that `A.meshCache[ghash]` is actually populated by the time
`_loadNightFixtures` runs in the real page load order (plausible — geometry streams in before a
user manually toggles night mode — but not asserted this session, no browser used per user
directive). Suggest a one-line `§GLOW_TRUE_BOTTOM_COVERAGE` log counting how many of the staged
fixtures used the real-mesh path vs the fallback, next time browser/log verification is
authorized — that number should be close to 100% for a fully-streamed building.

Brightness: user reported "too bright" twice this session. `NIGHT_LIGHT_INTENSITY` 8.0->6.5->4.5,
`emissiveIntensity` (fixture glow) 0.8->0.65->0.45, ~44% down from original on both. `GLOW_GAIN`
(bloom trigger on the lens quad) left untouched — cutting it below 1.0 disables bloom entirely,
a different behavior change, not a brightness tweak. Not yet confirmed acceptable by the user.

## §NIGHT_LIGHT_CHURN — the real hiccup source, found via user's A/B, fixed same session (2026-08-08)

User's controlled test ("when lighting is off, its smooth") pinned it: `A._nightUpdateLights()`
(`tools.js`) was wired to `A.controls`'s `'change'` event on every 5m of camera travel, and on
every firing it disposed ALL active `THREE.PointLight`s and rebuilt them from scratch (up to 24)
— light add/remove churns three.js's per-material light-uniform list, this doc's own §RAM section
already flags that as the expensive part. Explains "hiccups now and then" (fires per 5m, reads as
periodic), "nothing to do with the tour" (fires on any navigation), and "smooth when off" (listener
isn't attached) all at once. Fixed below — reuse in place, dispose/create only the delta.

## §GLOW_LENS_BUILDUP_GATE — quads flooding the canvas during Alt+C movies (2026-08-08)

User report: "During alt-c movie making, the scene on canvas is flooded with lighting quads" —
clarified: they're "supposed to appear under 4D schedule after light fixtures are present." User
first thought this was already fixed the night before ("maybe it was localhost") — traced and it
genuinely wasn't: two separate gate-fix branches (PR bim-ootb#1235 `fix/night-glow-buildup-gate`,
and a duplicate-titled commit on `fix/glow-lens-quad-stillonly`) existed but neither ever reached
`origin/main`, and by the time either was written main had already replaced the mechanism they
targeted (`§GLOW_LENS_QUAD`'s round-sprite predecessor removed, "real point lights only").

Root cause found by reading current `origin/main` directly, not by resurrecting either stale
branch: `§GLOW_BUILDUP_GATE` (the round-sprite gate, `_glowOn()` in `effects.js`) **is already
merged and correct** — it filters through `A._tmIsVisible(guid)`. But `§GLOW_LENS_QUAD`'s
`_glowLensOn()` (the still-render quad, added in a later commit) was never wired to the same
filter — it builds its `InstancedMesh` straight from `A._nightFixtureWorldPositions()` with no
Time Machine check. `cinema_maxq.js` calls `stopStillRefine()`/`startStillRefine()` every single
baked frame during an Alt+C buildup bake (confirmed by reading the frame loop, not assumed), so
`_glowLensOn()` staged every fixture's quad in the FINISHED building on every frame regardless of
how much was actually built yet — exactly the reported flood.

**Fix (bim-ootb PR #1260, `fix/glow-buildup-gate-v2`, auto-merge armed):** ported the identical
`p.__guid == null || A._tmIsVisible(p.__guid)` filter line into `_glowLensOn()`. No restage/
subscribe wiring needed — the quad already rebuilds fresh every baked frame via the existing
teardown/restart cycle, unlike the round sprite (which persists across ticks during a live Alt+S
and needs `A._tmVisSubscribe` to restage mid-stream).

Witnessed: `tests/witness_glow_buildup_gate.js` extended V5-V8, same exact-substring-extraction-
from-shipped-source pattern as the existing V1-V4, run against real `TerminalHi4D.db` kernel_ops
(818 real `IfcLightFixture` elements): 0 quads before any fixture is scheduled, exact partial
match mid-buildup, full quads once built, unchanged outside a buildup. 8/9 gates pass — `G0` fails
pre-existing and unrelated (stale exact-match regex against `tools.js`'s SQL shape from before
`bbox_x`/`bbox_y`/`rotation_z`/`geometry_hash` were added for other work; guid-threading itself is
proven live by every other gate). `sw.js` `CACHE_VERSION` v972→v973, `viewer.html`
`effects.js?v=14→15`.

**CLOSED (2026-08-08):** PR #1260 MERGED to `origin/main` (both CI checks SUCCESS, verified via
`gh pr view` — not assumed from auto-merge armed). User confirmed live: "works in LTU baking."
Superseded predecessor PR bim-ootb#1235 (`fix/night-glow-buildup-gate`, the stale/conflicting
branch this bug was originally traced to) closed without merging, comment cross-links #1260.
Worktree `/tmp/wt-glow-buildup-gate2` and branch `fix/glow-buildup-gate-v2` pruned post-merge
(0 ahead, 0 dirty). Nothing left open on this item.

## §BAKE_INTERIOR_LIGHTS — a movie bake had NO fixture lighting at all (2026-08-12)

User: *"Night mode usually solves this PL well, when Fly or handsfree… during baking, there are no
PLs shining at the lighting"* — interiors dark through the film, the exterior beat at the end fine.

### Measured FIRST, on a real headless Duplex MaxQ bake of unpatched `main` (28 frames, swiftshader)

| frame | `§NIGHT_STILL_LIGHTS` | `A._nightLights.length` | scene point-light intensity sum |
|---|---|---|---|
| 0 | raised to **18** lights | 18 | 127.39 |
| 1 | raised to **0** lights | 0 | 82.39 |
| 2 … 27 | never logged again | **0** | 82.39 |

`127.39 − 82.39 = 45.00 = 18 × NIGHT_LIGHT_INTENSITY (2.5)` — every fixture light, exactly, gone for
the whole remainder of the film. Probe: `probe_bake_lighting.js` (live `page.evaluate` census of
`THREE.PointLight`s, not a screenshot).

### Two defects; it is the PAIR that made it permanent
- **(a) frustum-only selection, hard floor of zero.** `_nightUpdateLights`'s `§NIGHT_STILL_FRUSTUM`
  branch selected only fixtures whose *centre* is inside the view frustum. A wide establishing beat —
  or an interior lit by the troffers directly overhead/behind the eye — selects zero and every light
  is disposed.
- **(b) the re-arm gates read that selection's OUTPUT.** `§NIGHT_STILL_LIGHTS` and
  `_teardownStillRefine` both asked `A._nightLights.length` before calling the selector. Once (a)
  produced 0, nothing could call it again — a **self-latching zero**.

Navigation never takes the frustum branch (`§NIGHT_STILL_BOOST_GATE_FIX`), which is precisely why
Fly/handsfree stayed lit while the bake went dark — one mechanism, both halves of the report.

### Interior vs exterior is structural, not coincidence
Same run: `§MOVIE_SHADOW_TM sun=4.400 ambient=0.785 hemi=1.257 fill=2.042`, and staging enables sun
shadow casting (`§PHOTO_SHADOW`). An interior surface is shadow-occluded from the sun and lit by the
2.042 uniform fill **plus these point lights**; an exterior surface gets 4.400 + 2.042 = 6.44. Losing
the point lights costs an exterior almost nothing and an interior everything that is not flat fill.

### The fix (bim-ootb PR #1327, `fix/bake-interior-lighting`)
1. `tools.js` **§NIGHT_PICK_NEAREST** — the nav nearest-to-aim + `§NIGHT_SPREAD` pick extracted
   verbatim; the still/bake branch now **tops the frustum set up** to `A._nightMaxLightsStill` (50,
   already the sanctioned still count) with that same rule. No new constant, nav unchanged.
2. `tools.js` **§BAKE_FRUSTUM_STALE** — refresh `camera.matrixWorld`/`matrixWorldInverse` before the
   frustum: the bake moves the camera and calls `startStillRefine()` before any render of that pose,
   so the cull ran against the previous frame's view.
3. `tools.js` **§BAKE_LIGHT_BUILDUP_GATE** — the identical `p.__guid == null ||
   A._tmIsVisible(p.__guid)` line the sprite (#1235/#1260) and lens quad already use, now on the
   ILLUMINATION. The baseline run logged `§PHOTO_GLOW_SPRITE_GATE 0/18 fixtures placed yet` while 18
   point lights shone from those same unplaced fittings — the light was the one system ignoring the
   schedule. TM's own predicate hides an unscheduled element's mesh
   (`time_machine.js` `showReal = (isRecent || isPlaced)`), so the light now matches the mesh.
4. `effects.js` — both re-arm gates read INPUTS (`A._nightMode` + `A._nightFixtures.length`); the
   boost moved into `_stillNightLightBoost()` and runs **after** `_applyPhotoStaging()` (staging is
   what turns night mode on, so bake frame 0 and every session's first Alt+S used to run at the nav
   budget with the 0.3 near-fade penalty).
5. `effects.js` (perf) — during a MaxQ bake with staging kept, the still budget is no longer handed
   back per frame: the light set was rebuilt **twice per captured frame**, and a change in light
   COUNT is the three.js shader recompile `§NIGHT_LIGHT_CHURN` named as the expensive part.
6. **§BAKE_LIGHTS** — new numeric witness line, both per bake frame (`cinema_maxq.js`, `§CPE_BUILDUP`
   cadence) and on every change of the selection answer (`tools.js`):
   `placedFixtures=P/F inFrustum=V activePL=L mode=… budget=… nearFadeFloor=… plIntensitySum=… sun=… fill=…`

Witness: bim-ootb `tests/witness_bake_interior_lights.js` — real headless bake, gates on numbers only
(`G-BL-LATCH`, `G-BL-TRACK`, `G-BL-GATE`, `G-BL-RISE`, `G-BL-LIVE`, `G-BL-NAV`; `BASE=1` for the RED
side). **7/7 PASS on this branch** (real headless Duplex bake, 28 frames, buildup on):
`G-BL-LATCH lastFrame=27 placedFixtures=18/18 activePL=18` (baseline: 0);
`G-BL-TRACK selections=47 placedButDark=0 litMoreThanPlaced=0`;
`G-BL-RISE placed 14,18,18,4,…,12,…,18` with an **identical** active series;
`G-BL-LIVE 263 samples night-on with placed fixtures, 0 with zero point lights`;
`G-BL-NAV mode=all nightLights=14/14 budget=30 floor=0.3` (nav rule intact).
Final frame `plIntensitySum=45` — exactly the 45.00 the baseline lost at frame 1.

### OPEN, measured, NOT decided here — fixtures read weaker in a bake than in Night Mode
Not a bug; a consequence of the two lighting environments, stated with the arithmetic so nobody
re-derives it:

| | non-directional fill (ambient+hemi) | exposure | a PL's own contribution | PL vs fill |
|---|---|---|---|---|
| Night Mode nav | 0.28 | 0.80 | `2.5 / d^1.5` | ≈ **8.9×** the fill |
| Photo/MaxQ staging | 2.042 | 0.383 | same `2.5 / d^1.5` | ≈ **1.2×** the fill |

So a fitting "pops" ~7.3× more in Night Mode than in a bake, at the same `NIGHT_LIGHT_INTENSITY`.
If the user wants the luminaires to READ in the film, the levers are a still-specific intensity or a
lower staged fill — both are user calls with a history of "too bright" (intensity was cut
8.0→6.5→4.5→2.5 across 2026-07/08), so nothing was changed here on our own authority.

## §STAGED_PL_CUT — the "still-specific intensity" user call ARRIVED and SHIPPED (2026-08-16, bim-ootb PR #1389)
The open question this file's §BAKE arithmetic ended on ("the levers are a still-specific intensity
or a lower staged fill — both are user calls") was decided by the user 2026-08-16: staged lighting
"too bright … reduce PLs or intensity. As it also wipe out the ground slab shadow play during
alt-c movie baking." Shipped as `A._nightPLScale` (tools.js) — 0.5× on every night PL's intensity,
set by `_applyPhotoStaging` BEFORE `toggleNightMode` builds the ~200 fixture lights, reset
unconditionally at un-staging. **Nav Night Mode byte-identical** (the 8.0→…→2.0 tuning history
stays untouched). Two placement traps found by the witness, recorded so nobody re-trips them:
(1) the §NIGHT_STILL_LIGHTS boost branch does NOT fire on the Hospital staging path (gate needs
`A._nightLights` populated before it runs) — hooks placed only there silently do nothing;
(2) a camera move never un-stages (it only restarts accumulation, §STILL_REFINE_RESTART) — teardown
hooks must sit in `_removePhotoStaging`/`stopStillRefine`, and witnesses must exit via
`stopStillRefine(true,false)`, not by moving the camera. Witness numbers: staged scale=0.5, night-PL
intensity sum exactly halved (400→200, photo-prop lights untouched), exit restores plScale=1.0,
nav budget 30 intact. Related same-day context: §TRINORM_LINEAR (PHOTOREAL_STILL_RENDER.md) made
all triplanar surfaces brighter, which is likely why "too bright" resurfaced now.
