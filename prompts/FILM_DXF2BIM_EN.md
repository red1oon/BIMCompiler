# ⚠ DO NOT REMOVE
SCOPE: the ENGLISH narrated demo film "DXF2BIM: 2D drawings to a BIM model in the Modeller" (FILM_PLAN §10, user 2026-10-16: "Do English first").
Read the log after every run (recorder `film.log` + `film.page.log`, fitter `fit*/fit_en.log`, mux output): exit code is not evidence.
Every spoken number comes from a § line of THIS run or a named facts/ log line (PRIME rule, FILM_NARRATION.md §2). No "first", no "only".
Neutral naming: no client name anywhere. Media, DXF and DB files stay local (`~/Videos/dxf2bim_film_work/`); this repo gets the TSV, the
recorder, the sheet renderer and the facts mapping. Honour this block until the film is delivered.

# §FILM-DXF2BIM-EN — spec (2026-10-16, written before the recorder)

## Sources
- Playbook: `FILM_NARRATION.md` §PLAYBOOK (two voices, Kokoro af_heart / am_michael, burned subtitles, TSV `id lang source SHORT DETAIL`,
  measure → BEAT_MIN → record → `film_narration_poly.py` → `film_narration_mux.py` with `MUSIC_WAV`), §8 card anatomy + music bed.
- Storyboard: FILM_PLAN.md §10 (+ §4b, §6: neutral naming, Farmhouse credit). Lane results: bim-ootb `prompts/DXF2BIM_MODELLER_LANE.md` L1-L4.
- Code filmed: bim-ootb `feat/dxf2bim-editor` (PR #2067, L4 editor, open) = main + L4; BIMCompiler master `be1dcda91`.

## Facts chain (re-run fresh before the take; every log copied to `~/Videos/dxf2bim_film_work/facts/`, mapped in `film_dxf2bim_facts.md`)
`std2d.py --door-ops` → `mark_dx_set.js std <door_ops>` (+ old profile) → `DXSET=std rosetta_dx_shell.js` (+ old) → `rosetta_qualify.js` →
`test_std2d.py --ifc Duplex_ARC.ifc --old-dir <old DXF> --door-ops` → bim-ootb witnesses `witness_dxf_import_node` (std), `witness_dxf_convert`
(std), `witness_dxf_meta_editor` with `DXF2BIM_BC=<this worktree>`. Plus `t8_sandbox.js` on the jscad sample and a units probe (chapter 7).

## Picture (one recorder, `scripts/film_dxf2bim_modeller.js`, CPU SwiftShader, 1920x1080, no GPU lock)
| # | beat | on screen | issue it would expose |
|---|---|---|---|
| 0 | c1 | title card over the Modeller (the Duplex loads behind it) | — |
| 1 | d01 | Duplex resident, stepped orbit | film claims a model the page did not load (§ARC-SEED-WIRE fact) |
| 2 | s01-s03 | the 8 std sheets drawn by ezdxf (`film_dxf2bim_render_sheets.py`), grid bubbles / DIMENSION extents / door ARCs highlighted from DXF entities | overlay that is not in the drawing (each overlay item is a DXF entity handle) |
| 3 | i01-i02 | real chooser row "Open 2D drawings (.dxf)…", 8 marked std sheets, the sheets on the canvas | import shown that the page did not do (§DXF-IMPORT, canvas count) |
| 4 | e01-e02 | Drawing metadata editor: a sheet card with "from model", verdict chip | verdict on screen ≠ the gate (fact read from DxfMetaEditor.state) |
| 5 | v01-v02 | real Convert click, converted building, IFC counts from the C2 witness | convert claimed without ops (op-log before/after fact) |
| 6 | r01-r04 | the RAW set (= std2d output, asserted byte-equal to the marked set minus DXF2BIM-MARK), red blanks, the GF sheet filled by real clicks, the other 7 behind a card (cut), the verdict after | a fill that the editor cannot do, or a "green" the drawings do not support |
| 7 | o01-o03 | typed cards: others (SPEC §2 wording), blind to size (jscad units probe), what we adapted (SPEC §35) | prior-art claim beyond SPEC §2 |
| 8 | l01, n01, end | limits, next, credits (Farmhouse: Jay Osborne, freefarmhouse.com, CC BY-SA) | an unstated limit |
Pages switch only under a card (the same card put on both pages in one tick). Waits that show a spinner are cut (`§FILM_JUMP`). Orbits and sheet
zooms are STEPPED: one state, one screencast frame, placed 1/24 s apart (SwiftShader draws a frame in ~0.4 s; real-time drags stutter); the
wall time is removed like a cut (`§FILM_STEP`).

## Decision recorded during the build (finding, not a workaround)
The raw std set CANNOT reach "Qualifies" through the L4 editor today: door heights come from an elevation or a `@SCHEDULE` marking, and the
editor has no way to enter a schedule (its tag vocabulary reads `@SCHEDULE` from markings only). Measured (module, Node): std set minus
`@SCHEDULE` → blocked 28 (`GAP:no_elevation_height` 14 on A-DOOR + `GAP:no_host_cut` 14). The film therefore shows the fill, the remaining 14
door items, and Convert staying off ("a height is never made up"); "a door schedule in the editor" is named as next. Not hidden, not faked.

## Acceptance (FILM_PLAN §7 + the user's list)
§NARR_FIT all DETAIL, 0 SHORT/SKIP; §NARR_TONE 0 WRONG · frames == silent master · −16 to −17 LUFS · longest silence (silencedetect −40 dB, 2 s)
≤ ~7 s · no hard screen change < 1.5 s apart (ffmpeg scene 0.12) · 0 black frames (blackdetect) · contact sheet read frame by frame (UI legible,
no toast over content) · grep of subtitles + card text for client names / "first" / "only" = 0.

## RESULT (2026-10-16): delivered `~/Videos/DXF2BIM_Demo_EN_1920x1080_24fps_2026-10-16.mp4` (274.7 s, local, not in git)
Take 11 (`scripts/film_dxf2bim_modeller.js`, BEAT_MIN `prompts/film_dxf2bim_beat_min.json`), 0 page errors, 134 cursor clicks. Assembly
`prompts/film_dxf2bim_assemble.sh` (Kokoro fit + boxed subtitles + ducked music bed). Facts: `prompts/film_dxf2bim_facts.md`.
- §NARR_FIT 21/21 DETAIL, 0 SHORT/SKIP; §NARR_TONE 0 WRONG · frames 6593 == silent master 6593 · −17.0 LUFS · silencedetect (−40 dB, 2 s): one
  5.8 s tail after the last line; longest gap between spoken lines 6.4 s · 0 black frames · 4 hard screen changes (scene 0.12), none closer than 1.5 s ·
  grep subtitles + card text: "first" 0, "only" 0, client name 0 · contact sheet (1 frame / 3 s) read: UI legible, the language toast was removed on sight.
- Retakes 1-10 fixed: slow real-pointer glides (overlay-drawn glide, then one real move + click), busy-page waits (cut), out-of-order screencast
  frames (placed by arrival time), stale frame of a newly cast page (dropped), hard changes on fades (every fade/orbit/zoom stepped at 24 fps).
- Capture: live UI from the CDP screencast (event-driven, ~2-10 fps, resampled to constant 24 fps); orbits, sheet zooms and fades stepped at 24 fps.
- Not claimed: the raw set does NOT reach "Qualifies" (no door-schedule entry in the editor; 14 doors stay blocking); fills need the LOCAL library
  subset; L4 editor is PR #2067 (open), filmed from its branch; page C restores no op-log (fresh browser context per Modeller page).

## v2 RESYNC (2026-10-16, lead review; NO re-record: take 11's silent master kept) -> `~/Videos/DXF2BIM_Demo_EN_1920x1080_24fps_2026-10-16_v2_resync.mp4`
Found: on the late Modeller page the screencast delivered frames ~4-5 s after the DOM change, so paper cards o02/o03/l01/n01 appeared 3.97-4.87 s
after their logged beat; their narration started while the previous card was up. Fitter turn subtitles also overlapped by up to 0.13 s (17 places).
Fix (`prompts/film_dxf2bim_resync.py`): `cue` re-cues every card beat to max(beat t, first frame where its card is visible, measured from the
frames); `check` clips subtitle overlaps and reports §SYNC_OVERLAP (audio max 0.000 s, subtitles 0.130 -> 0.000 s) and §SYNC_LEAD (worst lead
+0.00 s: no card narration starts before its card). o02 and n01 trimmed (numbers kept) to fit the shifted rooms; 21/21 DETAIL (n01 x1.011), 0 WRONG.
Re-measured: frames 6593 == master, -17.1 LUFS, one 5.8 s tail silence, longest gap between lines 6.4 s, 0 black frames, 4 hard changes none < 1.5 s,
grep first/only/client 0. Left as is (needs a re-record): a click ripple drawn over the "Seven more sheets" card (~2:42) is in the recorded frames
(a click on the editor behind the card; the ripple layer sits above the card).
