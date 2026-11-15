# ⚠ DO NOT REMOVE — SCOPE: the film "CH 0 · Immersive Software" (the canvas hover of `prompts/CODE_ARCHITECTURE_DESIGN.md` §F.21): how the hover is set up, then two dramatic moves on the real Modeller, ENGLISH ONLY. Read the log after every run (`out/*.log`): exit code is not evidence. Every number spoken or shown comes from a `§` line in `out/facts.json` / `out/shots.log`; a number that no longer matches FAILS the build (`§FILM_GUARD`). The film file is never committed, only the scripts.

Owner, 2026-11-15: *"Make a film that shows, CH 0 'Immersive Software' - Soverignity begins with visbility in a single window.. how the hover is setup, and show at least 2 dramatic moves to show the point."* then *"last card to indicate the cost in mem, priort art lesson, and project credentials"*.

House style: `prompts/FILM_NARRATION.md` "HOUSE STYLE FOR ALL FUTURE FILMS" (split screen, REAL key sounds from `~/.local/share/film_narration/keys_eklee/`, typing first, voice after the return key, the key-sound credit on the end card). Mechanics copied from `scripts/film_ide_erp_debug/` (film 3: real VS Code on a private virtual display above, the real app page below, `facts.js` → `shoot.sh` → `build.sh`, `guard.js`, `k2.py`, `priorart.json` + guard check P). Scripts: `scripts/film_immersive_software/`.

**Honest framing (on screen):** the hover is a DEV tool, loaded by a bookmarklet into a localhost tab; users of the shipped Modeller never load it. The lower frame is the real Modeller on the real shed drawings (no client name on screen: the sheet names only).

## Beats (the beat ids are the tsv ids)
| id | top (terminal strip / real VS Code) | bottom (real Modeller, headless, CPU) | numbers from |
|---|---|---|---|
| cover | two-tone chapter card: kicker **CH 0**, title **Immersive Software**, sub-line **Sovereignty begins with visibility in a single window** | — | — |
| setup | typed: `node devtools/hover/gen_trace_index.js` → its `§DXF_HOVER_INDEX keys=N` line; then the bookmarklet (shown as typed text, then clicked) → `§DXF_HOVER installed index_keys=N` | Modeller, the 9 shed sheets opened, Convert: the model on the canvas | `facts.json` (the generator's and the page's own lines) |
| move1 "The truss you see 13 times was drawn once" | VS Code opens on **V** at `modeller/dxf2section.js` on the line the tooltip named (the `prov = atCut(n) ? 'derived' : 'assumed'` site), the line visible | the cursor on a truss bar away from cut AA; tooltip `dxf2section:bar · modeller/dxf2section.js:<line> · … assumed` | page `§DXF_HOVER` line; bodies count assumed / stations from the CLI trace run |
| move2 "The body nobody stamped" | VS Code on **V** at `modeller/dxf2bim_import.js:<line>` (the `dxf2bim_import:wall-line` stamp) | FIRST on the OLD tree (slice 2 without the wall-line stamp): the joined wall says *no trace key: the code that built this body has no trace stamp*; THEN on main: the same wall names its line | two page runs; `512 bodies → 511 inserts` from the CLI `§DXF_TRACE` lines |
| close | the LAST card (below) | — | `facts.json` |

**Last card (owner):** (1) **cost in memory**, measured, never estimated: the heap with and without the overlay after Convert (`performance.memory.usedJSHeapSize` after a forced GC, Chromium `--js-flags=--expose-gc`, same page, same sheets), the trace map's entries, the overlay and index file sizes, and the OFF path (one `typeof` test per body; model bytes identical, W-DXF-TRACE T1); (2) **prior art, the lesson**: rows built like film 3's `priorart.json`, every row = a file or page this lane READ (path:line, or the URL fetched), guard check P fails a row whose text is not found there; nothing from memory; (3) **project credentials**: the repos and licence (from the repo's own LICENSE / SPDX lines), the PRs and witness verdict lines of this feature (#3043, #3047; `§DXF_TRACE_W VERDICT PASS`, `§DXF_HOVER_W VERDICT PASS`), the Developer Guide link, the published paper link if its page answers 200. Plus the key-sound credit.

## Build plan (each step has its log)
1. `scripts/film_immersive_software/` copied from `scripts/film_ide_erp_debug/`. Two bim-ootb worktrees: NEW = `origin/main` (has #3047), OLD = NEW with the one `_trace('dxf2bim_import:wall-line', …)` statement removed (the state of slice 2's FIRST, failing witness run). `git worktree list` first.
2. `facts.js`: the generator line; the CLI `--trace` run (bodies, inserts, per-key counts, assumed counts, stations); a headless Modeller page per tree with the overlay, real mouse moves to the two target bodies (found by a sweep, as W-DXF-HOVER does), the tooltip text and the page's `§DXF_HOVER` lines; the memory measurement; file sizes.
3. `shoot.sh`: real VS Code on the virtual display (`--disable-gpu`), opened at each `file:line` the tooltip named; Modeller stills from step 2. All browser/GUI work under `nice -n 19 ionice -c3`, ONE job at a time (2026-11-15: two parallel suites saturated the machine).
4. `build.sh`: `guard.js` (`§FILM_GUARD`, checks every spoken number, check P), `k2.py` (`§K2_VERDICT PASS`), narration after each return key.
5. Output `~/Videos/Immersive_Software_CH0_EN_AFTER_<date>_v1.mp4`, never committed.

## STATUS
2026-11-15: **BUILT, v1, awaiting the owner's review.** `~/Videos/Immersive_Software_CH0_EN_AFTER_2026-11-15_v1.mp4` (1920x1080, 70.9 s, never committed). Pipeline in `scripts/film_immersive_software/`:
`facts.js` (`§FACTS VERDICT PASS`: index `keys=28`; CLI `bodies=512 inserts=511 untraced=0/0 assumed=252`, truss `stations=13 spacing_m=3.048`; three real Modeller sessions via `modeller_shot.js`, 0 page errors;
the bar → `modeller/dxf2section.js:89` `assumed`, the joined wall → `modeller/dxf2bim_import.js:716`, on the OLD tree the same wall *no trace key*; V recorded `vscode://file/…:89` and `…:716`) → `shoot.sh`
(real VS Code opened at those two links, `§FILM_SHOOT stills=2 errors=0`, the editor's own line text logged) → `build.sh` (`§FILM_GUARD VERDICT PASS`, 28 OK incl. check P on 4 prior-art rows; `§CARDS_DONE beats=5 stills=93 too_tall=0`;
voice 3 of 3 `DETAIL`, 0 `WRONG`; `§FILM_DONE frames=1701 planned=1701`; `§K2_VERDICT PASS beats=2 bad=0 audible=True`). Logs: `out/*.log`, `out/facts.json` (committed); pictures, the CLI model output and the fetched pages are ignored.
- **Memory, measured (one run each, forced GC):** heap after Convert with the tool 43.5 MB, without 43.7 MB (−0.2 MB: no measurable cost); the trace 513 entries, 20.6 KB as JSON; overlay 6.4 KB, index 1.6 KB.
- **Found and fixed in the build:** v1's last card ran off the right edge (the card check measured height only); `cards.js` now also fails on any width overflow; the cut was rebuilt before anyone saw it.
- **The wrong guid trap:** the first page session was given a beam pair whose guid contains `+` as "the joined wall"; the joined wall is the ONE insert whose guid is not a body (`facts.js` derives it that way now).
- Rebuild: two bim-ootb worktrees (NEW = `origin/main`, OLD = NEW minus the one `_trace('dxf2bim_import:wall-line', …)` statement), `node devtools/hover/gen_trace_index.js` in each, then `node facts.js <NEW> <OLD> <first-run hover log> <hover log on main> <trace log on main>`, `./shoot.sh <NEW>`, `./build.sh`. The first-run log is committed as `out/witness_hover_first_run.log`.

---

# FILM 2 — "CH 0 · Immersive Software: the ERP field" (owner, 2026-11-15: *"Yes a film to show how ERP uses it and later a remake of the BIM with layers. Prior art?"*)

Same house style and pipeline (copy `scripts/film_immersive_software/` → `scripts/film_erp_layers/`; the Modeller session becomes an ERP page session: GardenWorld login, the Sales Order
window, the overlay `devtools/hover/erp_hover.js` loaded with its bookmarklet's own code; real mouse; the tooltip and the `§ERP_HOVER` lines are the evidence). Source of every number:
W-ERP-HOVER (bim-ootb #3055) and the page session's own lines.

| id | top | bottom (real ERP page) | numbers from |
|---|---|---|---|
| cover | CH 0 · Immersive Software · *the ERP field: every layer at one spot* | — | — |
| setup | typed `node devtools/hover/gen_erp_index.js` → its `§ERP_HOVER_INDEX` line; the bookmarklet; `§ERP_HOVER installed` | the Sales Order window | generator + page lines |
| move1 "One field, many layers" | VS Code on key **1**/**2** at the line the tooltip numbered (the callout method, then the model hook) | hover Target Document Type: dictionary → on change `CalloutOrder.docType` → picker rule → on save hooks / doc action / validators | page `§ERP_HOVER` line; E2 |
| move2 "It says what is missing" | terminal strip: W-ERP-HOVER's E2 line (`fields=12323 … unported=213`) | hover a field whose callout or process is UNPORTED: the tooltip says so, no guessed file | witness log; page |
| close | last card: memory (heap with / without the overlay after the window opens, one run each, forced GC; index size), prior art (rows read: iDempiere `ADTabpanel.java:837` + `WFieldRecordInfo.java:174-179` show the field's ENTITY TYPE, the owner, with `IsShowTechnicalInfOnHelp`, not the code; Odoo developer mode `?debug=1` page; click-to-component README), credentials | — | facts.json |

**Prior art, read 2026-11-15 (for the card; guard check P cites these exact places):** iDempiere's field tooltip adds the Entity Type when the user preference `IsShowTechnicalInfOnHelp` is on
(`org.adempiere.ui.zk/…/adwindow/ADTabpanel.java:837`), and Field Record Info shows `Table.Column='value'` + the entity type (`…/window/WFieldRecordInfo.java:174-179`): the OWNER of a field,
not the code that runs. Odoo's developer mode is a per-session switch (`?debug=1`) whose bug-icon menu shows "technical data, such as a view's field" (docs page, fetched 2026-11-15).
**Lesson for the card:** both name who owns a field; neither lists the code that fires on it in order. That list is what this hover adds, and it can because the twin keeps every layer in a
registry with an owner and a rank.

**FILM 2 STATUS (2026-11-15): BUILT, v1, awaiting the owner's review.** `~/Videos/Immersive_Software_CH0_ERP_Field_EN_AFTER_2026-11-15_v1.mp4` (1920x1080, 78.1 s, never committed). Scripts
`scripts/film_erp_layers/` (`erp_shot.js` = the ERP page session). `§FACTS VERDICT PASS` · `§FILM_SHOOT stills=2 errors=0` (VS Code at `CalloutOrder.js:97` `prototype.docType` and `ad_callout.js:477`
`prototype.dateAcct`) · `§FILM_GUARD VERDICT PASS` · `§CARDS_DONE beats=5 stills=92 too_tall=0` · voice 3/3 `DETAIL` · `§FILM_DONE frames=1874 planned=1874` · `§K2_VERDICT PASS`.
Memory (one run each, forced GC, the Sales Order window open): with the tool 46.1 MB, without 47.0 MB; overlay 15.3 KB, index 65.2 KB (302 registrations).
**Making it found TWO real defects in the merged hover (both fixed, both witnessed red→green):** (1) bim-ootb #3057: v1 read only the layered registry's `describe()` and called
`CalloutEngine.dateAcct` (put in directly, `erp/ad_callout.js:512`) UNPORTED; #3055's `unported=213` was inflated, the truth is 199; new check E2b (red `false_unported=17` → 0); E2b's first
version read the hover's own field and its red run PASSED (blind): rewritten to read the dictionary. (2) bim-ootb #3059: the key map wiped a number after an unlined layer (`[1]` on Target Document
Type opened nothing); E4 now presses every number shown (red `tried=112 wrong_or_dead=9` → 0). Move 2 of the film is defect (1), shown as it happened.

# FILM 3 (later) — the BIM film remade with layers
Waits for a layered BIM tooltip (size sources, pass-through stamps, door cuts, edits after Convert; §F.22 records the BIM answer). Not started.
