# ⚠ DO NOT REMOVE — Film: PDF to BIM, the first building type. Spec first.
# Scope: one narrated English explainer of the row "Open 2D drawings from PDF drawing (.pdf)…" as shipped, with its caveats on screen. Read the log after every run: exit code is not evidence. Honour this block until DONE.
# Owner 2026-11-05: *"So we can cut a film showing PDF to BIM sucessfully? And film shall show the caveats we put in for this first type?"* … *"go"*. Method: `prompts/FILM_NARRATION.md` ▶ PLAYBOOK C. Lane: `prompts/PDF2BIM_VECTOR_PROBE.md` §41-§42.

## 1. Rules for this film
- **Filmed on the LIVE URL, as shipped** (Playbook C: "a bug found and fixed while preparing is NOT a story beat"). Headless, software GL, no GPU, nothing that can touch a live bake.
- **Every number spoken or on a card comes from a `§` log line of this take, or a named log.** `film_guard.py` refuses a digit it cannot find. Numbers in words in the voice, exact on screen.
- **One line carries it:** "It reads what is on the paper, and tells you what it could not."
- **Never said:** first, only, saves hours in Revit, works on any drawing, AI-free as a boast over others. The second drawing is not in this film: this lane wrote it.
- Two voices, F asks what a newcomer would ask, M answers in one or two plain sentences. No jargon: no witness, verdict, gate, rows, DXF family, §. Chapter cards silent, 3.6 s, plain dark. Bottom 230 px free for captions.
- A picture of the model illustrates; it proves nothing. The proof beats show numbers.

## 2. Screenplay (Playbook C order)
| # | Beat | Picture | Claim shown, then proved |
|---|---|---|---|
| 1 | Before | the plan sheet of the PDF, then all 8 sheets | a drawing, flat: nothing to walk through |
| 2 | Idea | one plain card: the PDF, the rules, the model; footnote "no server, no AI, works offline" | |
| 3 | After | the model turning | the whole point in the first 25 s |
| 4 | Open | the real Open panel, the row, the file chosen, the sheets on the canvas | one PDF, no form; seconds from the log |
| 5 | What it read | a table: on the sheet / used | wall height, floor, roof pitch, door and window sizes |
| 6 | What it could not | the panel's accepted rows, plain card of what they are | dimensions the drawing does not draw; its grid lettering; 2 doors wider than their gap: kept and shown, under the type's first-release rule |
| 7 | Convert | the real button, the model appears | element, fill and cut counts from the log |
| 8 | Drawing against model | front elevation beside the model, same view | door on its floor, window in its hole, numbers on screen |
| 9 | Same every time | the IFC exported; two runs, one fingerprint | geometry hash twice |
| 10 | Refusals | a scan refused, a wrong PDF refused, the real words | nothing built |
| 11 | Network cut | status from the cut run | the 7 sheets still read |
| 12 | Caveats | one card, "This first release" | one type; CAD PDFs only; simple doors and windows; plain model; no structure; tested on one real drawing set |
| 13 | Not built yet | one card, labelled so | other building types; a real PDF from another drafter; walls Revit can edit, not tested |
| 14 | Close | the line, then credits | |

## 3. Status
Shots done, film not cut: see §4 ▶ RESUME HERE.

## 4. ▶ RESUME HERE (2026-11-05, stopped by the owner: tokens) — shots done, film NOT cut
**Done:** every product fix the film needed is LIVE (row "from PDF drawing", the acceptance names the type's rule, truthful Convert and IFC status, plain refusals; library ebcea595bea6). All stills and a 240-frame turntable were shot on the live URL by `scripts/film_pdf2bim/shots.js`, software GL.
**Kept outside the repo, not lost with a scratchpad: `~/Videos/pdf2bim_film_work/`:** `shots/` (`b_row`, `d_sheets`, `e_panel`, `f_read`, `g_accepted`, `h_converted`, `i_status`, `j_front`, `k_corner`, `l_rear`, `n_refuse_*`, `o_refuse_*_stat`, `p_cut`, `pdfp-1..8` the PDF's sheets, `turn/f0000..0239.jpg`, `run1.ifc`, `run2.ifc`), `shots.log` + `shots_refuse.log` (the facts), `raster.pdf`, `plumbing_only.pdf`. To re-shoot: `FILM_OUT=<dir> WITNESS_TMP=<dir> PD_TB=<TBKLTN_House.pdf> PD_RASTER=<pdf> PD_WRONG=<pdf> [FILM_ONLY=main,turn,refuse,cut] node scripts/film_pdf2bim/shots.js`.
**To do, in order (`prompts/FILM_NARRATION.md` ▶ PLAYBOOK + PLAYBOOK C):**
1. Write `prompts/film_narration_pdf2bim_en.tsv` from §5 (`id cue end source SHORT DETAIL`, tab-separated). Fit once with wide rooms to read each `detailDur` (`film_narration_fit_kokoro_v3.py <tsv> <tag> 1.15`, venv `~/.local/share/film_narration/venv/bin/python`), then beats = speech + 1 to 3 s, chapter cards 3.6 s silent, and set the cues from measured segment starts.
2. Composites on #0f172a: headings sky-blue #7dd3fc from y >= 95, bottom 230 px empty (witness it: `convert x.png -crop 1920x230+0+850 -format '%[fx:mean]' info:` equals the background). Crop the page's chrome: at 1920 x 1080 about x 250..1840, y 80..840 (read a frame: the outliner's width was estimated). Stills `-loop 1 -tune stillimage` with 0.5 s fades, no zoompan.
3. Front comparison, A/B: p4's FRONT view (page points: x from 246.3, beam y 426.4, floor y 510.1, ground y 514.3; render with pdftocairo at 300 dpi and crop) beside `j_front.png`.
4. A small guard: every digit on a card or in the voice must be in §5's facts, or the build stops.
5. Mux `film_narration_mux.py`; witness in numbers: frames equal the silent picture's, silences >= 4 s no more than about 7 s, ebur128 about -16 LUFS, one contact sheet for layout only.
6. Deliver `~/Videos/LowCostHouse_PDF_to_BIM_narrated_EN_AFTER_<date>_v1.mp4`. English first; other languages only when asked. Keep the original silent film; every output a new name.

## 5. The script (draft, written from the facts; trim to fit, do not add numbers)
**Facts, each from `shots.log` or the chain's logs:** 8 sheets. Read + rules 4,502 ms (`total_ms`). 40 values read. Wall height 3000 (measured 3002.3), floor above ground 150 (150.7), roof 25 degrees, wall 100 (100.4), eaves 750 (747.5), door head 2100 (2099). Doors 900 and 750 x 2100, windows 1800, 1200 x 1000, 600 x 500. 57 accepted = 43 dimension rows + 10 grid-lettering rows + 4 door rows (2 doors, each listed twice, 900 wide in an 820 gap). Convert: 35 elements, 14 fills, 14 cuts. IFC: 13 walls, 7 doors, 7 windows, 4 roof planes, 2 columns, 2 slabs, 14 openings, 112,421 bytes. Doors stand at z 0.150..2.250 on a floor at 0.150. Windows within 1.3 mm of the drawn hole. Network on and network cut: sheets fingerprint 9777a77875302863 both times, model geometry 973f47868068057f both times. Refusals, exact words in `shots_refuse.log`.
| Beat | Picture | Voices |
|---|---|---|
| before | `pdfp-1`, then the 8 sheets | F: What am I looking at? / M: A small house, drawn in CAD, saved as a PDF. Eight sheets. / F: So, flat paper. / M: Flat paper. Normally someone reads it and builds the model again by hand. |
| idea | card: PDF, fixed rules, model; footnote "no server, no AI, works offline" | F: And now? / M: You open the PDF in the Modeller. Fixed rules read the lines on the sheets, and a model comes out. No server, no form to fill in. |
| after | turntable | F: That came from the PDF? / M: From that PDF, on the live site. Walls, doors, windows, floor, pitched roof and the porch. |
| CHAPTER | "Reading the paper" | silent |
| open | `b_row`, `d_sheets` | F: Show me how it opens. / M: Open, then from PDF drawing. Pick the one file. / F: That's all? / M: That's all. Under five seconds on this computer. |
| read | table on the sheet / used, inset `f_read` | F: What did it actually read? / M: Forty values. Walls three thousand high. The floor one hundred and fifty above the ground. A roof at twenty five degrees. Every door and window size from the schedule sheet. / F: Not typed in? / M: Read from this drawing. If the sheet disagrees with what this type expects, the sheet wins, and it says so. |
| could not | counts card, inset `g_accepted` | F: And what could it not read? / M: Fifty seven things, all listed on screen. Forty three are dimensions the drawing doesn't draw. Ten are how it letters its grid. / F: And the last four? / M: Two doors, nine hundred wide, in a gap drawn at eight hundred and twenty. The drawing disagrees with itself, so we keep it and show it. / F: Who accepted all that? / M: A rule for this first release of this building type. It says so, right there. |
| CHAPTER | "Is it right?" | silent |
| convert | `h_converted`, `i_status`, turntable | F: Now the model? / M: Convert. Thirty five elements, with fourteen doors and windows in their openings. |
| compare | A/B: p4 FRONT, `j_front`, numbers | F: Does it match the drawing? / M: Same view. The doors stand on the floor, nine hundred by two thousand one hundred, as scheduled. The windows sit within about a millimetre of their holes. |
| same | `p_cut`, two fingerprints | F: No internet at all? / M: One visit is enough. We cut the network and it still built the house. / F: The same house? / M: The same. Two runs, one fingerprint. |
| refuse | exact words, large, with `o_refuse_*_stat` | F: What if I give it a scan? / M: It says no. A scan has no lines to read, and it won't guess. / F: And some other PDF? / M: No again, in plain words. Nothing is built. |
| CHAPTER | "This first release" | silent |
| caveats | one card | F: So what's the catch? / M: Several. One building type only. CAD PDFs only. Doors and windows are simple shapes at the right sizes, no slats or handles. The model is plain, no roof sheets or trusses. And no structure: this drawing leaves that to the engineer. / F: How many real drawings has it seen? / M: One set. This one. |
| not built | one card, labelled "not built yet" | F: What's next? / M: Other building types. A real drawing from another drafter. And walls you can edit in Revit: we haven't tested that. |
| close | the line, then the end card | F: So, in one line? / M: It reads what is on the paper, and tells you what it could not. |
**Open for the end card:** the project's credit and contact lines: copy them from an existing film's closing card, do not invent them. The refusal of a scan says "vector PDF"; keep the exact words on screen and say "CAD PDF" in the voice.
