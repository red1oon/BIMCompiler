# ⚠ DO NOT REMOVE
SCOPE: the MALAY version of the DXF2BIM demo film (user 2026-10-17: "Do a Malay version of the film"). English spec + sources: PR #192
(`prompts/FILM_DXF2BIM_EN.md`). Read every log after every run. Every spoken number = the English facts mapping (same ids, same sources column).
Neutral naming; no "pertama"/"satu-satunya" claims. Media stays local.

# §FILM-DXF2BIM-MS (2026-10-17)
- Narration: `prompts/film_narration_dxf2bim_modeller_ms.tsv` (same 21 ids, sources and turn order as the English v2 TSV; numbers spelled out in
  Malay; app terms kept as users say them: Modeller, Convert, Open 2D drawings, Qualifies, from model, IFC, DXF, grid). Voices: Edge TTS ms-MY Yasmin (F) /
  Osman (M) via `film_narration_fit_edge.py` (the script text is SENT TO MICROSOFT; clips cached in ~/.local/share/film_narration/cache_edge/).
- Cards and film overlays in Malay: `prompts/film_dxf2bim_cards_ms.json` (chapter + prior-art/limits/credits cards, sheet badges, the r03 rows, the
  end card), read by `scripts/film_dxf2bim_modeller.js` via `CARDS_JSON`. The app UI stays English.
- Why a fresh take and not a splice: chapter cards are drawn over live, dimmed footage, so the English text is baked into frames whose clean
  underlay does not exist; Malay also runs ~10-15% longer than the English rooms. One fresh CPU take with Malay cards and Malay BEAT_MIN
  (`prompts/film_dxf2bim_beat_min_ms.json`) was made instead.
- Recorder changes made for this take (also apply to English): a frame is accepted for a newly cast page / a stepped state only if it was
  composited after the change (screencast swap timestamp, measured to be the same clock as Date.now); a card beat is logged only when a frame
  after the card change has arrived (`§FILM_VISIBLE`); the opaque cards of chapters 7-8 run on a light page (the Modeller page delayed frames by
  seconds). Post-fix logged in the take: two stale frames of the newly cast raw-drawing page (no card, between two card frames) dropped from the
  concat list (`§FILM_POSTFIX`), durations given to the frame before; frame count unchanged.
- Assembly: `prompts/film_dxf2bim_assemble_ms.sh` (re-cue card beats to the visible card, fit, boxed subtitles, §SYNC checks, ducked music, mux).

## RESULT (2026-10-17): `~/Videos/DXF2BIM_Demo_MS_1920x1080_24fps_2026-10-17.mp4` (330.0 s) + `~/Videos/DXF2BIM_Demo_MS_720p_preview.mp4` (17.6 MB)
21/21 DETAIL, 0 SHORT/SKIP; §NARR_TONE 0 WRONG (yes/no questions rise, e.g. "Dilukis dengan tangan?" +3.2 st) · frames 7921 == master ·
-16.3 LUFS · one 5.3 s tail silence; longest gap between lines 6.1 s · §SYNC_OVERLAP audio 0.000 s, subtitles 0.130 -> 0.000 s · §SYNC_LEAD worst
+0.00 s · 0 black frames · 4 hard changes, none < 1.5 s · mux fontselect DejaVu Sans · grep subtitles + cards: pertama 0, satu-satunya 0, client name 0.
Not claimed: as English (raw set does not qualify; library local; editor PR #2067 open), plus: UI labels English; voices synthetic (cloud).
