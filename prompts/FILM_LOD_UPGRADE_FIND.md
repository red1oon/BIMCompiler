# ⚠ DO NOT REMOVE
SCOPE: ONE film. The Palm Jebel Ali Mosque (PJAM; name released by the owner 2026-11-18) on canvas: first the Modeller's own LOD feature (layer split drawn per layer), then the Viewer's Find panel locating each kind of added work and flying to it. House style: `prompts/FILM_NARRATION.md` (split screen, typed line + REAL key sounds, voice after return, two-colour cover card, last card with prior art + credentials + guide link, lower frame cropped/zoomed to the part that changes). Read the log after every run; the exit code is not evidence. Films are never pushed; only scripts and this file are.

## Owner brief (2026-11-18, verbatim)
*"Do a film, showing the Jebel mosque on canvas and how the Find can locate the added work, smoothly navigating to each. Ensure illustration is clear or zoom into frame for legibility of the Find panel. Show first the Modeller side, feature that upgrades LOD. Fix any gaps before that. Ask other sessions to give way if you need the GPU."*

## Gaps to close BEFORE any capture (each: measure, fix or record, § line)
- **G1, one DB with all the added work.** Today it is spread over `JPAM.db` (220 layer parts + 150 connection parts), `JPAM_rebar.db` (306 beam bar sets) and `JPAM_gussets.db` (1 gusset joint, 3 parts). Build `JPAM_film.db` = JPAM.db + the rebar and gusset rows, with `upgrade_changes` merged and renumbered. Witnesses: IDENT (no original row changed) and COUNTS (= 220 + 150 + rebar sets + 3), on a copy.
- **G2, the Modeller shows the upgrade.** Measure which DB the Modeller draws per layer: §LAYER-GATE needs `component_geometry_layers` (`modeller/arc_editable.js:119-145`). Open the candidate in the real Modeller (headless) and read its §LAYER-GATE / per-layer lines: how many hosts were drawn as layers? If the Modeller cannot show the upgrade on PJAM, that is a gap to report with the measured reason. Do not fake it with the Viewer.
- **G3, Find terms that hit each kind**, measured as the panel's own SQL (`viewer/nf_panel_search.js:363`) on JPAM_film.db:

  | Term | Finds |
  |---|---|
  | `layer` | 220 layer parts |
  | `Fin plate` | 50 fin plates |
  | `bolt assemblies` | 50 bolt groups |
  | `fillet welds` | 50 weld groups |
  | (rebar name term, to be read from the rebar set names) | the beam bar sets |
  | (gusset name term, to be read) | the 1 gusset joint |

  Find returns at most 50 rows. Each kind's first hit is the one flown to.
- **G4, fly-to and the parts view.** Clicking a Find row flies to that element (read its § line). The parts view (bim-ootb #3223) hides the hosts that have parts, so layer pieces are visible (`§PARTS_VIEW hostsHidden=88 partsShown=220` expected on load).
- **G5, legibility.** Capture at device scale 2. Each Find beat is cropped/zoomed to the Find panel + result list, then to the flown-to element.

## Beats (each typed line is the Find text, typed with real key sounds; voice after Enter)
1. Cover card: `LOD 400 UPGRADE  ·  CH 1` / "Finding the added work" / "Palm Jebel Ali Mosque · rule-based detail on the author's own model".
2. Modeller: the mosque opened; per-layer walls (if G2 passes; else the measured gap is stated on a card, not hidden).
3. Viewer: the whole mosque. Find `layer`: 220, fly to one wall's layers (parts view on).
4. Find `Fin plate`: 50, fly to a joint under the roof.
5. Find the rebar term: fly to one beam's bars.
6. Find the gusset term: the 1 joint built. A card states that 56 of 57 brace ends were refused, and why (from `§GUS_COUNTS`).
7. Last card: prior art read, credentials (#3219, #3223, #910, #919, #924, §9 PR, witness verdicts from the logs), key-sound credit, guide link (checked `§FILM_GUIDE`).

Wording: "configuration only, capacity not checked" wherever steel joints are on screen.

## GPU rule
Before any GPU render, message the busy peer sessions to give way. Run `nvidia-smi` before and log it. Never render beside a live user bake. Software GL (swiftshader) is the fallback.
