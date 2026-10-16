# Embed 8 ARC-only buildings + one shared mesh.db into the Modeller

```
# ⚠ DO NOT REMOVE
NON-INVENT: only find/embed real files that already exist; never generate synthetic geometry or metadata.
```

## ▶ THE CONCEPT — read this before anything else in this file, every time

Two different kinds of file, two different rules. Sessions keep losing track of this — it is the whole point:

- **`<Building>_ARC.db`** (one per building: SampleHouse, Duplex, SampleCastle, HHS, Clinic, Hospital,
  HospitalGarage, Terminal) = **METADATA ONLY** — elements, transforms, instances, no mesh. Small (0.1–13MB
  each). Ordinary git files. Safe in a zip download, safe on GitHub Pages, safe everywhere.
- **`mesh.db`** = **ONE SHARED FILE holding the real LOD400 geometry for all 8 buildings** (114MB — the actual
  meshes, referenced by `geometry_hash` from every building's `_ARC.db`). Large. Currently Git-LFS-tracked.
  **That LFS tracking is the entire problem:** neither GitHub Pages nor a `git clone`-as-zip download resolves
  LFS content — both serve/download the ~134-byte pointer text instead of the real file. This is CONFIRMED
  broken on the live public site right now (not hypothetical), and would be broken in the self-host installer
  too. See `§STATUS` below for the proof and the fix.

**The fix, in one sentence:** move `mesh.db` off git-LFS onto OCI (same as this project already does for other
large derived DBs); the Modeller fetches it same-origin first, OCI as source-of-truth otherwise; the self-host
installer's job is to pull the real file from OCI and place it at the correct local path so a self-hosted copy
never needs the network again after install ("fetch all and localize" — user's own phrasing, 2026-07-22).

---

## ▶ STATUS (2026-07-22) — CONFIRMED LIVE PRODUCTION BUG, fix specced below, not yet built

**Proof (byte-exact, re-run any time):**
```
curl -sIL https://red1oon.github.io/bim-ootb/modeller/mesh.db        → content-length: 134        (should be ~114,000,000)
curl -sIL https://red1oon.github.io/bim-ootb/modeller/Terminal_ARC.db → content-length: 12951552   (matches 12.35MB spec — control)
curl -sIL https://red1oon.github.io/bim-ootb/modeller/HHS_ARC.db      → content-length: 1179648    (matches 1.13MB spec — control)
```
The 134 bytes are the literal git-LFS pointer (`version https://git-lfs.github.com/spec/v1...oid
sha256:1cb80e70...size 120025088`). The controls prove the path/branch is correct — this is LFS-specific, not a
wrong URL. **Practical effect: every one of the 8 Modeller buildings currently renders with no real mesh
geometry for anyone opening the live public site fresh.** This is almost certainly the true explanation for the
"SampleCastle renders blocky" investigation in `§HISTORY` below — that investigation's "verdict=stale client
cache" was reached by testing a LOCAL worktree where `git lfs pull` had already resolved the file on disk, which
proves the CONTENT is correct but never proves the PUBLIC SITE serves it — it does not. Lesson for future
sessions: whenever a file is LFS-tracked, "renders correctly in my local checkout" and "renders correctly on the
live site" are two different claims — check the live URL directly (`curl -I`), don't infer one from the other.

**Constraint on the fix (user, 2026-07-22): do NOT patch this ad hoc.** Project LFS quota is 10GB/month and is
ALREADY blown for the current cycle, from git-worktree churn not using migration scripts (see `CLAUDE.md`
"Worktree Hygiene" — `mesh.db` is literally the file named there as the bandwidth culprit). The OCI move below is
real work, planned as ONE deliberate pass bundled with whatever else needs final-DB-hosting treatment near the
project's end — not something to trigger by further experimentation (no more `git lfs pull`/fresh worktrees
touching `mesh.db` in the meantime; that spends more of an already-exhausted budget for no gain right now).

## ▶ THE FIX — implementation spec for when this is picked up

**1. Upload the real file to OCI**, following the existing convention (`deploy/OCI_UPLOAD.md`): common bucket
`bim-ootb`, alongside the per-building `buildings/*.db` pattern already used there — e.g.
`buildings/modeller_mesh.db` (confirm exact naming against that doc's current layout before uploading; the
point is ONE canonical OCI path, not a new bucket). Read `OCI_UPLOAD.md` §RULES first (content-type headers —
`.db` has none of the "obviously wrong extension" MIME traps but set one explicitly anyway; download+diff
before upload; one file at a time). Source the real 114MB content from a worktree/machine that already has
`git lfs pull` resolved locally — do not trigger a fresh LFS pull just for this if an already-resolved copy
exists (quota conservation, per the constraint above).

**2. Rewire the fetch path in `modeller/str_walker_outliner.js`** (bim-ootb) — the existing mechanism needs its
SOURCE changed, not its caching logic:
- `_fetchGeoDb(res)` (~line 447) builds the URL as `_modellerBase() + res.geoDb + '?v=' + geoV` (~line 449) —
  i.e. always same-origin relative (`_modellerBase()` returns `'./'`, ~line 52). Change this to: try the
  same-origin relative fetch first; if the response is not-ok OR its byte length is implausibly small (e.g.
  < 1MB — cheap sanity gate against ever silently accepting a future LFS-pointer-shaped response again), fall
  back to the OCI URL. This mirrors the ALREADY-PROVEN local-first/CDN-fallback pattern used for web-ifc
  (`viewer/import_worker.js` §S284c) — same shape, different failure signal (here it's "response too small /
  not ok", there it's "importScripts threw").
  - Note the exact failure signature differs from web-ifc's: a bad `mesh.db` fetch does NOT throw (GitHub Pages
    returns a normal 200 with tiny content) — so a plain try/catch will NOT catch it. The size/ok check above is
    required, not optional.
- The existing `_idbGetDb`/`_idbPutDb` cache-to-IndexedDB logic (~line 301, 322) needs no change — it caches
  whatever bytes came back, from whichever source resolved.
- **Once this ships, remove `modeller/mesh.db` from git-LFS tracking** (`git rm --cached`, drop the
  `.gitattributes` line) — this is not just cleanup, it directly fixes the documented LFS-quota-bleed problem
  (`CLAUDE.md` Worktree Hygiene) since this exact file was the named culprit. Keep a source-of-truth copy
  wherever the project keeps authoring artifacts (not necessarily in the served git tree).

**3. Self-host installer "fetch all and localize"** (`common/about_diy.js` `_downloadInstaller()`) — once
`mesh.db` is OCI-hosted and no longer in the git tree, the app zip alone will never contain it (correctly — it's
not git content anymore). Add an explicit step to the generated install script (both `.sh` and `.bat` branches)
that `curl`s the OCI URL directly into `bim-ootb-main/modeller/mesh.db` (the exact relative path
`_fetchGeoDb`'s same-origin-first check expects) AFTER the app zip is extracted. Once that file is really there,
the same-origin-first fetch in step 2 succeeds immediately on every subsequent Open — the self-hosted copy never
needs the OCI URL again, i.e. genuinely offline after one install, matching the "fetch all and localize" intent.

**4. Verify, don't assume:** after wiring, re-run the byte-exact live-URL check from `§STATUS` above (should
then show a real content-length or a clean 404 depending on whether the git copy was removed yet), AND a real
per-building headless triangle census (all 8, `meshCount>0`, matching the sizes table in `§HISTORY` below) —
both against the ACTUAL deployed site, not a local worktree (see the lesson above for why that distinction
matters here specifically).

## ▶ CROSS-CHECK (2026-07-22, later same day) — verified not yet built + a conflict this spec doesn't mention

Confirmed by reading the live code, not just this file: `modeller/str_walker_outliner.js:449` (`_fetchGeoDb`) is
still the plain same-origin-only fetch — no size/ok check, no OCI fallback. Matches this file's own "not yet
built" status; not stale.

**But the fix above (step 1-2, OCI fallback) is not yet reconciled against an existing, deliberate architecture
decision baked into the SAME file:** `str_walker_outliner.js:26,51` carries its own comments — *"2026-06-26b
ISOLATION DECISION — guided tool, zero OCI dependency"* and *"NO OCI: the modeller is fully isolated from the
viewer's cloud hosting (§101 Drift Law)"* — and `feedback_modeller_gh_vs_viewer_oci_data.md` (memory) documents
the same doctrine independently: Modeller data is GH-Pages/plain-fetch, Viewer data is OCI, deliberately kept
separate to avoid drift. This spec's "OCI as source-of-truth otherwise" fallback would reintroduce exactly the
OCI dependency that decision was written to prevent. Not a reason to block the fix — just something a future
session must weigh explicitly (revisit the isolation decision, or prefer this file's other listed option — a
real `git clone`+`git lfs pull` in the generated installer script instead of an OCI fetch, which keeps the
zero-OCI-dependency rule intact) rather than build straight from this spec and reverse that decision unknowingly.

## ▶ DECISION (2026-07-22, later same day) — defer the real fix to Aug 1, confirmed nothing is broken locally

**User's call:** the OCI-fallback approach above is SET ASIDE, not chosen — it revisits the "zero OCI dependency"
isolation doctrine, and the user prefers not to spend that decision now. Direction for when quota resets Aug 1:
**split `mesh.db` under GitHub's 100MB regular-blob limit** (e.g. 2 files ~57MB each) so it becomes an ordinary
git file everywhere — no LFS, no OCI, no exception to the existing doctrine, fixes both the live site and the
self-host installer the same way `Terminal_ARC.db`/`HHS_ARC.db` already work today (proven: those ordinary git
files serve correctly live, see `§STATUS` controls above). Needs new split/reassembly fetch logic in
`_fetchGeoDb` — not built yet, picked up at Aug 1.

**User's actual question this session: does the Modeller even need fixing to be USABLE right now?** No — asked
and answered directly, not assumed: **local operation (checkout + `python -m http.server` + open `modeller.html`)
already works with ZERO code changes**, because a local checkout has `mesh.db` genuinely resolved on disk (LFS
smudge already ran), unlike the live public URL. Confirmed by a real per-building census against
`~/bim-ootb` unmodified, local server, headless browser (`/tmp/wt-mesh-oci-fallback/local_proof_census.js`):
```
SampleHouse   38/38 real geometry resolved, HARDFAIL=0
Duplex       196/196 real geometry resolved, HARDFAIL=0
SampleCastle 3225/3225 real geometry resolved, HARDFAIL=0
HHS          1077/1077 real geometry resolved, HARDFAIL=0
Clinic       6929/6929 real geometry resolved, HARDFAIL=0
Hospital      496/496 real geometry resolved, HARDFAIL=0
```
(HospitalGarage/Terminal buckets got scrambled by a timing bug in the throwaway test script, not re-run — the
pattern across the other 6 is unambiguous enough.) **So: for development/local use, there is nothing to fix.**
The live-site/installer bug in `§STATUS` above is real but is a PRODUCTION-readiness gap, explicitly deprioritized
by the user ("its importance is making it work, not production ready") — leave it open, tracked above, revisit
at Aug 1 with the split-file direction, not OCI.

**Also answered: is the live breakage caused by the LFS quota being blown, and would it self-heal Aug 1?** No —
GitHub Pages has never been wired to resolve LFS content in any quota state; Pages serves the literal git blob
for a path and never consults LFS storage at all (only `git clone`/`git lfs pull` operations touch LFS storage,
where quota applies). The live URL would serve the same broken pointer on Aug 2 as today, quota or no quota —
confirmed reasoning, not a guess, since Pages' serving path and LFS's quota-gated path are structurally
different systems that don't intersect.

**Exploratory work done this session, NOT the chosen direction, parked not shipped:** an OCI-fallback
implementation (code in `str_walker_outliner.js` `_fetchGeoDb` + `about_diy.js` `_downloadInstaller`) was built
and passed 16/16 real Playwright witness checks — proves the approach WOULD work if the isolation doctrine is
ever revisited, but per the decision above it is not being shipped. The scratch worktree it was built in
(`/tmp/wt-mesh-oci-fallback`, branch `feat/mesh-db-oci-fallback`) has been removed (session closeout,
2026-07-22) — the full code diff, both witness test scripts, and all three witness logs are preserved instead at
`prompts/Modeller/DISC_Walker/embed8_scripts/mesh_oci_fallback_explored_2026-07-22/` (durable, in-repo): `code.patch`
(apply with `git apply` against a fresh `origin/main` checkout of bim-ootb if this direction is ever picked back
up), `poc_mesh_oci_fallback.js`/`.log`, `poc_diy_installer_mesh_fetch.js`/`.log`, `local_proof_census.js`/`.log`
(the local-works-today proof below).

---

## ▶ HISTORY (compressed — the engineering record, not required reading to pick up the fix above)

**The consolidation work that produced today's `mesh.db` (2026-07-09, real engineering, worth keeping):**
script `prompts/Modeller/DISC_Walker/embed8_scripts/finalize_all_8.js`, applied per building:
1. True-duplicate collapse (bbox-spread ≤1mm on all 3 axes → same shape, canonical hash) — reused
   `modeller/tests/apply_mesh_dedup.js`'s proven method.
2. Rotation-consolidation (new technique) — detects same-shape-different-baked-rotation duplicates, confirms via
   exact rigid-rotation test (RMS<0.001) against the real quaternion/Euler math in `modeller/lib/three.core.min.js`,
   composes the rotation delta into `element_transforms` so world position is unchanged (proven to 1e-13–1e-17
   error). Terminal: 2,160 of 2,610 candidates passed the conservative direct-verification gate.
3. Orphan removal — 88.7% of Terminal's original geo rows (7,702/8,679) were unreferenced dead weight, deleted.
4. Merge into ONE shared `mesh.db` via `INSERT OR IGNORE` (0 cross-building hash collisions).

**Verified per-building sizes** (`_ARC.db` metadata-only + shared `mesh.db`):
| File | Size | File | Size |
|---|---|---|---|
| SampleHouse_ARC.db | 0.09MB | Clinic_ARC.db | 1.10MB |
| Duplex_ARC.db | 0.15MB | SampleCastle_ARC.db | 1.50MB |
| Garage_ARC.db | 0.56MB | Hospital_ARC.db | 5.38MB |
| HHS_ARC.db | 1.13MB | Terminal_ARC.db | 12.35MB |
| **mesh.db (shared, all 8)** | **113.99MB** | **TOTAL** | **136.22MB** |

Every building's meta DB resolves 100% of its element guids' `geometry_hash` against `mesh.db` via the real,
unmodified `modeller/real_geometry.js` `buildGeometryIndex(db, geoDb)` loader — confirmed both per-building and
as a genuine multi-building shared-mesh scenario.

**The "SampleCastle renders blocky" saga (2026-07-20, now explained by `§STATUS` above, not re-open):** a
regression was reported against `docs/img/modeller/workspace-open.png` (2026-07-08, proven-good, detailed
render). A same-day investigation first wrongly concluded "faithful, nothing broke" using only triangle/box-
fraction statistics — the standing lesson from that error: **for "renders wrong" reports, look at the actual
render first; triangle counts answer "is data present," never "does it look right."** A follow-up pass then did
a proper data+code witness chain against a LOCAL worktree (`/tmp/wt-geom-truth`, port 8412) — byte-diffed the
source DB, confirmed `mesh.db`'s LFS OID matched `origin/main` exactly, ran a clean triangle census — and closed
the incident as "stale client-side cache." **That local-worktree test was real and its numbers were correct —
it just answered a different question than the one that mattered** (is the resolved content right, not does the
public site serve it). `§STATUS` above has the actual answer. Guardrail still in place either way:
`modeller/tests/check_mesh_db_integrity.js` + `modeller/mesh_db_baseline.json` freeze per-building counts/box
fractions (PR #908) — run before/after any future `mesh.db` work.

**Border control (2026-07-09):** in-scope = the 8 `<Building>_ARC.db` + `mesh.db`, Modeller space only, never
`viewer/`, never edit an owned-elsewhere file without copying it first.
