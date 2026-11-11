# ⚠ DO NOT REMOVE
Scope: the film **"Command Line ERP"** (owner, 2026-11-11: *"Do the film 'Command Line ERP' - Light weight hands-on only ERP that talks to AI, Email, devices. Runs off Kernel ERP and legacy iDempiere."* then, on the question what to do about email and devices, which are not built: *"Just use that one page One Door diagram which explains the caveat. It is the concept that is important and this is a prototype poc."*). English only (owner: no Thai now). Read **every log under `scripts/film_command_line_erp/out/` after every run**; an exit code is not evidence. Spec first; the film is built only from real runs.

# FILM — Command Line ERP

## What it may and may not say (PRIME RULE: extract, do not invent)
- **Shown live, from real runs (every number and every answer on screen is read from `out/facts.json`, written by `facts.js`):** the person at a terminal (`mis.js` list, pointer, buttons, the one door line each key runs); a new record by form (the dry run asks only for what the engine cannot fill); an edit that sends only the changed column; a delete the engine refuses in its own words; a CSV preview and load; an AI's write held as a claim until a person confirms it; the same door asking legacy iDempiere (`legacy.status`, `erp.compare` of an order against the real one).
- **Email, phone, device:** NOT built. They appear only on the One Door page, which says "planned, not built" in the diagram's own words (`docs/figs/one_door.svg`: Mailbox, Phone, Device). The voice says so in one sentence, and the end card says "prototype". The film never shows an email, a phone or a device doing anything. (Contract §0.9: email as an actor is specified, not built; Teamwork's post box is a relay, not an actor.)
- **"Runs off Kernel ERP and legacy iDempiere":** the `mis.*` verbs run on the Kernel ERP (the twin). The same door also asks the legacy server (`legacy.status`, `erp.compare`, `legacy.query`). The film does NOT say a `mis.*` write goes to the legacy server.
- **No proof talk in the voice** (owner, 2026-11-10: say "check", never "witness"), no "first/novel", no private client name, no "JELAPANG".

## Beats (target 2:30 to 3:15; two voices as in "From AI to Human": F asks, M explains)
| id | picture | facts spoken (from facts.json) |
|---|---|---|
| title | "Command Line ERP", kicker, "a prototype" | – |
| intro | "Before windows there was a prompt." | – |
| list | a real `mis.js --plain` screen: rows, the pointer, the buttons | `list.total` (records of the kind) |
| keys | the line a key will run, printed on the screen | `keys.lines` (door lines the session ran) |
| new | form: asks only what the engine cannot fill; the one line; the engine's fill count | `new.mandatory`, `new.filled` |
| edit | Edit form; only the changed column is sent | `edit.changed` |
| delete | the engine refuses, in its words; a Y/N popup precedes any delete | – |
| load | CSV preview: rows, ok, rejected; `.ok.csv` loads | `load.rows`, `load.ok`, `load.rejected` |
| ai | `--actor ai mis.new …` → claim; a person confirms; it is written | `ai.status` |
| legacy | `legacy.status` UP; `erp.compare` twin order vs legacy order | `legacy.verdict`, `compare.match`, `compare.diff` |
| onedoor | the One Door page, with "planned, not built" kept | `onedoor.built`, `onedoor.planned` |
| light | measured: size of the screen core and the driver, no dependency, runs in a terminal | `light.coreLines`, `light.driverLines` |
| close | "A prompt, a pointer, one door. Prototype. Open source." + the guide URL | – |

## Checks that replace a human viewing (PRIMAL LAW; each can say NO-OP / VACUOUS / INCONCLUSIVE)
- **G guard** (`guard.js`): every spoken figure is in `facts.json` with that value and its word is in the beat's text; no proof talk. INCONCLUSIVE if nothing was judged.
- **H honesty** (`guard.js`): the narration never says an email, phone or device *does* something: the words email/mail/phone/device appear only in beat `onedoor`, and that beat's text contains "not built".
- **C cards** (`cards.js` log): no card overflows (`overflow_px=0`), the bottom 230 px stay free for captions (PLAYBOOK C).
- **S frames** (`record.js`): frames on the encoded file equal the frames planned (`§FILM_DONE … planned`).
- **A fit** (the fit log): every voice slice fits its beat (DETAIL ok, none WRONG).
- **L loudness** (mux log): two-pass loudnorm to the target, silences listed.
- **F facts live** (`facts.js`): every command ran with `status` as expected (a refusal where the beat shows a refusal); any other status stops the build.

## Build
`OOTB=<bim-ootb main> COMPILER=<this checkout> OUTMP4=~/Videos/Command_Line_ERP_EN_rc1.mp4 scripts/film_command_line_erp/build.sh` (CPU only, no GPU, no paid call; the voice is the local Kokoro). Needs the legacy stack UP (read only: this film never refreshes it; the shared test instance belongs to another session's work) and legacy order 50981 for the compare.

## STATUS
2026-11-11: spec written; building.
