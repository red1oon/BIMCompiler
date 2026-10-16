# ⚠ DO NOT REMOVE — SESSION: "Seam Identity Audit — one thing, named two ways"
# Model tier: **OPUS** (well-scoped but nontrivial, multi-file, sustained reasoning). NOT Fable —
#   Fable is mechanical execution; this needs judgement about whether two names mean the same thing.
#   See memory feedback_model_allocation_mastermind_vs_execution.md for the tiers.
# Scope: find every place where TWO OR MORE call sites independently construct the SAME identity
#   (a cache key, a url, a guid, a storey id, a phase token, a localStorage key, an IDB key) and
#   nothing enforces that they agree. **PASS 1 = LIST ONLY, FIX NOTHING** (see the ⛔ block below) —
#   comb to exhaustion, chase each to root cause, cluster by shared cause. Pass 2 does the refactor.
# PRIME RULE: EXTRACT ONLY. Every finding cites file:line and the two divergent constructions.
#   No speculative smells, no lint, no style opinions. Read the log after every run.
# Witness-led — but NOT in this pass: pass 2's fixes each ship a PURE test that FAILS on the old code
#   (the divergence assertion). Pass 1 writes no tests either.

## §WHY THIS SESSION EXISTS — the bug that named the pattern (2026-07-30)
The Viewer cached each building in IndexedDB **keyed on the raw url string**. Two entry points built
two different strings for the same 251MB file:

| entry point | file:line | string |
|---|---|---|
| Landing hub card | `index.html:489` | `<prodBase>buildings/Hospital_extracted.db` |
| ERP red pill | `erp/idempiere.html:4716` | `../buildings/Hospital_extracted.db` |

Result: opening from the landing cached it; red-pilling across missed, 404'd, re-downloaded the full
251MB, and wrote a SECOND copy under the other key. ~2 minutes of user wait, every single click, half
a gigabyte per building. **Live for months. Zero tests failed. Nothing in the log said "wrong key".**

The tell was there and unread: the landing's green "cached" badge matched on the **filename stem**
(`index.html:528`) while the fetch matched on the **whole url** (`scene.js` `cachedFetch`). Two
different notions of "is this building cached" in one repo, 40 lines apart in behaviour. A third
call site (`A._checkCache`, feeding `streaming.js`'s size probe) had a fourth. Fixed 2026-07-30 —
see `prompts/HISTORY_PERSIST_RECALL.md` §VERIFY-FIRST ITEM 1 for the full post-mortem.

**The generalisable defect:** an identity is CONSTRUCTED at N call sites instead of DERIVED from one
pure function. Nothing fails loudly; you just silently do the work twice. This audit hunts that shape.

## §THE LENS (per memory feedback_audit_landmines_not_lint.md — landmines, not lint)
Weight every finding by **blast radius × silence**. This bug scored high on both: whole-building
re-download (radius), and a log line that looked NORMAL (`§CACHE_MISS_READ`) rather than wrong
(silence). Do NOT report doc drift, naming style, dead code, or anything that announces itself the
first time a user hits it. A latent divergence that costs bandwidth/time forever outranks a hundred
cosmetic issues.

Rank each finding: `radius (who/what breaks, at what scale) × silence (why no log/test catches it)`.

## §METHOD — mechanical, then judged
1. **Enumerate identity constructions.** For each identity family below, grep every construction site
   across `viewer/`, `erp/`, `modeller/`, `landing`/`index.html`, and the tests:
   - IndexedDB / cache keys (`objectStore(...).put/get`, `idbPut`, `idbGet`)
   - `localStorage`/`sessionStorage` key strings (`pwa_last_db`, `bim.hist.tree.*`, `bim.universalHist.*`)
   - building/db URLs (`?db=`, `_extracted.db`, `buildings/`, `PROD_BASE`, `_prodBase`, `gh` overrides)
   - element/room identity (guid ↔ mesh id ↔ instance row ↔ `spatial_structure` id)
   - schedule/phase tokens (`Description` splits, phase names, gantt band keys)
   - `BroadcastChannel` channel names + message `type` strings across viewer/erp/landing
2. **For each family, ask the one question:** is there ONE pure function that returns this identity,
   and does every site call it? If N sites each build it inline → **FINDING**.
3. **Prove divergence before claiming it.** Construct the identity from two real call sites with the
   same real input and show the strings differ. A finding without that comparison is a guess — drop it.
4. **Judge blast radius.** Divergence that is harmless (two names that never meet) is NOT a finding.
   The bug above mattered because both paths hit the same store. Say why the two paths meet.

## ⛔ PASS 1 IS LIST-ONLY — DO NOT FIX ANYTHING (user directive 2026-07-30)
**"make it comb deeper and chase issues till listed, not act upon yet, until we can review causes in one
more pass for refactoring opportunities."**

This session **writes zero production code.** No fixes, no pure-function extractions, no witnesses, no
PR. Touch only this file. The reason is deliberate: fixing findings one at a time hides the fact that
several of them are the SAME root cause and want ONE refactor, not five patches. Today's cache-key bug
had four call sites with three different notions of "is this cached" — patched individually that is
three fixes; seen together it is one missing pure function. **Pass 2 (a separate session, after the
user reviews this list) decides the refactor.** Anyone who starts editing code in pass 1 destroys the
only thing pass 1 is for.

If a finding looks trivially fixable — still don't. Write it down and keep combing.

## §DELIVERABLE — an exhaustive ranked list, chased to root cause
Append to THIS file as a dated section. **Comb to exhaustion — there is no finding cap.** Do not stop
at the interesting ones; the value is a complete list the refactor pass can pattern-match over.

Per finding:
- **The identity** — what one thing is being named.
- **Every construction site** (not just two) — `file:line` + the ACTUAL string/value each produces for
  the same real input. Show them side by side.
- **Where the paths meet** — the shared store/comparison that makes the divergence bite. If they never
  meet, say so and mark it `HARMLESS` rather than dropping it (pass 2 may still want it unified).
- **Radius × silence** — who breaks, at what scale, and why no log line or test catches it today.
- **Root cause, one line** — e.g. "no pure function owns this key", "two modules each re-derive the
  filename convention", "the writer and the reader were written in different sessions".
- **Suspected shared cause** — cross-reference other findings you think share a root. This is the raw
  material for pass 2; guess freely here, it costs nothing and is the whole point.

Then two summary sections:
- **§CLEAN** — every identity family you checked and found genuinely single-sourced. A clean family is a
  real result; it stops the next session re-walking it.
- **§CLUSTERS** — your grouping of the findings by shared root cause, with a one-line note on the
  refactor each cluster is pointing at. Do not design the refactor; just name what it would touch.

## §GUARDRAILS
- **Note, don't apply, the folding guard.** Where you propose that two names SHOULD fold, also name the
  case that must NOT fold. Today's fix had to keep `deploy/dev/buildings/Terminal_extracted.db` and
  `deploy/buildings/Terminal_extracted.db` distinct — same filename, different bytes. A folding rule
  without its NOT-folded counter-case trades a re-download for wrong geometry. Record the counter-case
  alongside the finding so pass 2 inherits it.
- **Prove divergence, don't assume it.** Two names that differ only in a variable you didn't resolve is
  not a finding. Resolve it or mark it `UNVERIFIED` explicitly.
- No new memory files (that's a Sonnet synthesis pass) — findings go in this file.

---

# PASS 1 RESULT — 2026-07-30 (LIST ONLY, zero production code touched)

**Scope combed:** `~/bim-ootb` @ `origin/main` `84d9878` (read via `git grep origin/main` — no worktree, no
checkout, no LFS pull). Families 1–6 of §METHOD across `index.html`, `import_own.js`, `LargeCity.html`,
`viewer/`, `modeller/`, `erp/`, `common/`, `teams/`, `hr_bim_asset/`, `geomapping/`, and the test trees.
**Real values were extracted, not guessed** — `elements_meta.building` read from the actual shipped DBs in
`~/bim-ootb/buildings/`. 18 findings. Ranked by `radius × silence`.

**The structural headline, stated once:** `bim_ootb_cache` / store `dbs` is a **single flat namespace with
ten independent writers, eight key conventions, six value types, three inventory notions and four
DB-version conventions.** Findings F1–F6 are all that one store. The 2026-07-30 `cacheKey` fix made
`scene.js` canonical and left the other nine writers on raw urls — so it did not close the seam, it moved
it, and in two places (F1c, F3) it opened a new one.

---

## F1 — `bim_ootb_cache/dbs` key: canonical in `scene.js`, RAW url in every other module
**Rank: 1 (radius: whole-building re-downloads + duplicate 100–250MB blobs · silence: total)**

**The identity:** "the IndexedDB key under which this building's bytes live."

**Every construction site**, for one real input — Hospital opened from the landing hub, i.e.
`url = https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb/o/buildings/Hospital_extracted.db`:

| # | site | key it produces |
|---|---|---|
| 1 | `viewer/scene.js:791` `cachedFetch` | `buildings/Hospital_extracted.db` |
| 2 | `viewer/scene.js:614` `_checkCache` | `buildings/Hospital_extracted.db` (+ raw-url legacy probe) |
| 3 | `viewer/city.js:443,449` | `<prodBase>buildings/Hospital_extracted.db` (raw) |
| 4 | `viewer/boq_charts.html:733,754` | `?db=` param verbatim (raw) |
| 5 | `viewer/clash_report.html:88` | raw url |
| 6 | `viewer/kernel_ops.js:149` | raw `APP.DB_URL` |
| 7 | `modeller/kernel_ops.js:134` | raw `APP.DB_URL` |
| 8 | `erp/kernel_ops.js:142` | raw `dbUrl` **plus** a second key `dbUrl + '::tip'` (`erp/kernel_ops.js:139`) |
| 9 | `modeller/str_walker_outliner.js:334,355` | raw url **including `?v=N`** (`./Hospital_ARC.db?v=1`) |
| 10 | `modeller/disc_walker.js:143,149` | raw url (`./terminal_rules.db`) |
| 11 | `modeller/routewalker.js:1390,1402` | `'rw_' + url` (own namespace) |
| 12 | `viewer/import.js:553–556,568–569`, `import_own.js:115–116,149,161,181,400–402,715–717` | `import://…` (see F5/F6) |
| 13 | `viewer/dlod_nav.js:1185` | `'occlStruct:' + activeBuilding + ':' + OCCL_STRUCT_V` |
| 14 | `viewer/time_machine.js:4312` `_cacheKey` | `[v<N>:]<prefix>:<activeBuilding|'unknown'>` |
| 15 | `viewer/materialize.js:61` | `import://<safe>/<safe>_extracted.db` |
| 16 | `index.html:522,534` (the green badge) | reads `dbs.getAllKeys()`, matches by **stem substring** |

**Where the paths meet:** one store, one origin (`red1oon.github.io/bim-ootb/` serves `viewer/`, `modeller/`,
`erp/` and the landing — same IndexedDB database). Sites 1–2 write/read `buildings/X`; sites 3–10 write/read
the full url. Same bytes, two keys, both resident.

**F1c — the fix's own re-key actively breaks the raw-url readers.** `viewer/scene.js:834–835` does
`delete(url)` after re-keying a legacy entry to `buildings/X`. So the first time the Viewer opens a building
that the Modeller/ERP/city layer had cached, that entry is *moved out from under them* — they miss forever
after, with no fallback (`_checkCache` has the legacy probe; nobody else does).

**Radius × silence:** every miss is a full re-download (Hospital 251MB, LTU_AHouse ~250MB) plus a duplicate
IDB copy. Nothing logs "wrong key" — sites 3–10 log a plain miss or nothing at all, and `scene.js` logs
`§CACHE_MISS_READ`, which reads as normal.

**Root cause, one line:** `db_resolve.cacheKey()` was introduced as a *pure function* but wired into exactly
one caller; the other nine were never migrated.

**Folding guard / counter-case:** K3 must stay — `/deploy/` and `/modeller/` paths keep their full path
(`deploy/dev/buildings/Terminal_extracted.db` ≠ `deploy/buildings/Terminal_extracted.db`). Additionally
**`<prodBase>modeller/Hospital_geo.db` must NOT fold onto `<prodBase>buildings/Hospital_geo.db`** — verified
distinct: `modeller/str_walker_outliner.js:49` `GEO_BASE` points at `o/modeller/`, and those are the small
ARC-only geo files (§GEO-SERVED, 2026-07-30), not the viewer's full geo. Same filename, different bytes.

**Suspected shared cause:** F2, F3, F4, F5, F6 — all "the shared cache store has no owner."

---

## F2 — four modules still open the shared cache DB at hardcoded **version 1** (canonical is 2)
**Rank: 2 (radius: all caching dead in those modules · silence: one `console.warn` or nothing)**

**The identity:** "the version at which `bim_ootb_cache` is opened."

| convention | sites |
|---|---|
| `open(name, 2)` + store guards + **VersionError fallback** (canonical) | `viewer/scene.js:529–548` (`A.openCacheDB`), `import_own.js:74`, `LargeCity.html:149` |
| `open(name)` — versionless, "whatever's stored" (the documented correct idiom) | `viewer/kernel_ops.js:141`, `modeller/kernel_ops.js:126`, `modeller/str_walker_outliner.js:302,329,350`, `modeller/disc_walker.js:135`, `modeller/bonsai_oplog.js:84`, `modeller/modeller.html:4641`, `index.html:516` |
| **`open(name, 1)` — hardcoded, no fallback** | `viewer/boq_charts.html:725,745`, `viewer/clash_report.html:80`, `erp/kernel_ops.js:133`, `modeller/routewalker.js:1384` |

**Where the paths meet:** the same IndexedDB database. Once `scene.js` has run once in a profile the store
is at v2 (or higher — `str_walker_outliner.js:307` does `open(name, v+1)`), so every `open(name, 1)` fires
`onerror` with `VersionError`, permanently, for that profile.

**Proven consequences:**
- `viewer/boq_charts.html:748` → `resolve(null)` → `fetchDbBuffer` skips IDB entirely and **always** network-fetches
  the whole building DB for 4D/5D charts. It then logs `§CHARTS_DB_SOURCE source=oci …`, which looks correct.
  Its own comment at line 741 — *"OCI URLs: IDB first (scene.js wrote it), then network"* — documents an
  assumption that is false on two counts at once (this, and F1).
- `erp/kernel_ops.js:135` → `§KRN_PERSIST_ERR open failed` → the ERP op-log **never survives a refresh**.
  `modeller/kernel_ops.js:118–122` and `viewer/kernel_ops.js:135` carry a written post-mortem of this exact
  bug ("drifted BELOW scene.js's v2 → the edit was silently never persisted") — the ERP copy never got it.
- `erp/kernel_ops.js:134` also calls `createObjectStore('dbs')` **unguarded** (no `.contains()` check),
  unlike every other site — a `ConstraintError` waiting on any upgrade where the store already exists.

**Root cause, one line:** three copies of `kernel_ops.js` and two standalone HTML pages each re-derive
"how to open the cache DB" instead of calling `APP.openCacheDB()`.

**Suspected shared cause:** F1, F11.

---

## F3 — `viewer/city.js` reads the cache under one key and writes it under another, 200 lines apart
**Rank: 3 (radius: the whole S285 city bbox layer silently renders nothing · silence: a "skipped" counter)**

**The identity:** "the cache key for archetype `<X>`'s `_extracted.db`."

| site | value (city launched from `LargeCity.html:394`, i.e. `bldbase=<prodBase>buildings/`) |
|---|---|
| `viewer/city.js:443` → `:449` `objectStore('dbs').get(dbUrl)` | `<prodBase>buildings/Hospital_extracted.db` |
| `viewer/city.js:645` → `A.cachedFetch(extUrl)` | `buildings/Hospital_extracted.db` |
| `viewer/city.js:660` → `A._checkCache(metaUrl)` | `buildings/Hospital_meta.db` |

**Where the paths meet:** the same store, the same module, the same archetype. The bbox layer at :443 is
explicitly **cache-only** ("never fetches", :442) — so once `cachedFetch` is the only writer and it writes
canonical, the raw-url `get` at :449 can never hit.

**Radius × silence:** every archetype falls into `if (!cachedBuf) { _skippedArch++; continue; }` (:455).
The single log line is `[S285] §CITY_BBOX individual=0 … skippedArch=<N> meshes=0` (:539) — a normal-looking
counter, not an error. The city renders empty and nothing says why.

**Root cause, one line:** the migration to `cacheKey` touched `cachedFetch`/`_checkCache` and missed the one
direct `objectStore('dbs').get()` in the same file.

**Suspected shared cause:** F1 (same root, and this is the cleanest single-file proof of it).

---

## F4 — the cache **inventory** is `timestamps`, the cache **content** is `dbs`, and 10 of 13 writers only write `dbs`
**Rank: 4 (radius: the 80-entry cap is unenforceable, `dbs` grows unbounded · silence: total)**

**The identity:** "what is currently in the building cache."

Three separate answers, all live:
1. `viewer/scene.js:565–572` `_evictOldest` enumerates **`timestamps`.getAllKeys()** — that is the list the
   `A._MAX_CACHE_ENTRIES = 80` cap is measured against and the list eviction picks from.
2. `index.html:522` `_markCachedBuildings` enumerates **`dbs`.getAllKeys()**.
3. `viewer/city.js:449`, `boq_charts.html:733` etc. probe **`dbs`** by exact key.

**Writers that maintain BOTH stores:** `viewer/scene.js:811,833,907`, `viewer/time_machine.js:4348–4350`,
`LargeCity.html:212–213`.
**Writers that write `dbs` ONLY (no `timestamps` row):** `import_own.js:165,166,184,405,720`,
`viewer/import.js:560–563,572–573`, `viewer/materialize.js:61`, `modeller/str_walker_outliner.js:355`,
`modeller/disc_walker.js:149`, `modeller/kernel_ops.js:134`, `viewer/kernel_ops.js:149`,
`erp/kernel_ops.js:142`, `modeller/routewalker.js:1402`, `viewer/dlod_nav.js:1207`.

**Where the paths meet:** `_evictOldest` deletes from `dbs` using keys it got from `timestamps`. Anything in
`dbs` with no `timestamps` row is **invisible to the cap and never evicted** — so `dbs` can hold hundreds of
MB of imports, resident DBs, op-log snapshots and occlusion structs while the cap believes it is under 80.
Conversely the LRU can never reclaim that space when quota runs out; the quota-abort path
(`_evictOldest(cacheDb, forceN)`) can only drop timestamped entries.

**Radius × silence:** IDB quota exhaustion — which surfaces as `§CACHE_SKIP`/`QuotaExceededError` on a
*different* building than the one hogging the space. Nothing enumerates `dbs` to report the discrepancy.

**Root cause, one line:** "write to the cache" is a two-store operation that only one module knows about.

**Folding guard / counter-case:** `dbs` legitimately holds non-DB values (`time_machine` JSON,
`dlod_nav` occlusion structs, `erp/kernel_ops` `::tip` hashes) — a unification must keep them evictable
*separately* from a 250MB building blob, not treat all entries as equal-cost.

**Suspected shared cause:** F1, F2.

---

## F5 — the monolith `import://` url is built two ways for the same record
**Rank: 5 (radius: duplicate full-size import blobs + a dead-ended open · silence: both paths log success)**

**The identity:** "the `import://` url for imported project `<key>`'s monolith DB."

| site | value for `key = 'Clinic_ARC.ifc'` |
|---|---|
| `import_own.js:161–166` (landing "Open") | `import://Clinic_ARC.ifc/v0` (written to **both** `dbUrl` and `libUrl` — the same string) |
| `viewer/import.js:568–573` (viewer "My imports") | `import://Clinic_ARC.ifc/extracted` **and** `import://Clinic_ARC.ifc/library` |

**Where the paths meet:** the same `bim_ootb_cache/dbs` store, the same project record in
`bim_ootb_imports/buildings` (identical DB name + store name in both files:
`import_own.js:28–29` and `viewer/import.js:39–40`), the same `record.versions[0].db` bytes.

**Radius × silence:** opening a monolith import from the landing and then from the viewer writes the same
buffer twice more under different keys (imports are routinely 100MB+), and neither path can ever hit the
other's entry — each re-materialises from the heavy `bim_ootb_imports` record every single time. Logs:
`[S274] §OPEN_PROJECT_MONOLITH` and `[S274] §IMPORT_OPEN_MONOLITH` — both cheerful, neither mentions that a
duplicate was just written. `cacheKey` K1 deliberately returns `import://` verbatim, so nothing folds them.

**Root cause, one line:** two IFC importers were written in different sessions against the same store and
neither knew the other's url convention.

**Folding guard / counter-case:** `import://<k>/<k>_meta.db`, `…_geo.db` and `…_extracted.db` must stay
distinct — they are three different files of one project (`viewer/import.js:553–556`).

---

## F6 — `import://` filename shape differs between the importers and `materialize.js`
**Rank: 6 (radius: a materialised design is unreachable by any other import path · silence: total)**

**The identity:** "the filename component of an `import://` url."

| site | value for `Clinic_ARC.ifc` |
|---|---|
| `import_own.js:115` / `viewer/import.js:553` | `import://Clinic_ARC.ifc/Clinic_ARC_extracted.db` — `.ifc` **stripped** before the suffix |
| `viewer/materialize.js:38–39` | `import://Clinic_ARC.ifc/Clinic_ARC.ifc_extracted.db` — `.ifc` **kept**, plus `[^A-Za-z0-9_.-] → '_'` sanitisation the importers do not apply |
| `import_own.js:391` (single-file import) | project key = raw `file.name`, **unsanitised** |
| `viewer/import.js:277,364` / `import_own.js:694` (multi-file) | project key = `_commonPrefix(stems).replace(/[_\-]+$/,'') + '.ifc'` |

**Where the paths meet:** the same store and the same `?db=import://…` viewer entry point. A design
materialised out of `doc_canvas`/`materialize` therefore lands under a key no importer or import-list UI
constructs, and a single-file import of `My House (v2).ifc` lands under a key `materialize` would sanitise.

**Radius × silence:** the multi-file vs single-file key divergence in `import_own.js` alone means dropping
`Clinic_ARC.ifc` + `Clinic_HVAC.ifc` yields key `Clinic.ifc`, while dropping `Clinic_ARC.ifc` on its own
yields `Clinic_ARC.ifc` — two records, no cross-reference. No log names the key convention used.

**Root cause, one line:** three call sites each re-implement `stem(key) + suffix` instead of one
`importUrl(key, part)`.

---

## F7 — "which building is this" is the **filename stem** on one side and `elements_meta.building` on the other
**Rank: 7 (radius: every per-building persisted setting · silence: total — both values are plausible strings)**

**The identity:** the building's name.

Extracted from the real shipped DBs (`~/bim-ootb/buildings/`, `SELECT building, COUNT(*) FROM elements_meta
GROUP BY building ORDER BY c DESC`) — this is measured, not assumed:

| building | filename stem (`index.html:467`, `?bld=`, `?db=` url) | `A.activeBuilding` (`viewer/streaming.js:1971`) |
|---|---|---|
| Hospital | `Hospital` | `Hospital` ✅ |
| LTU_AHouse | `LTU_AHouse` | `LTU_AHouse` ✅ |
| Duplex | `Duplex` | **`Ifc2x3_Duplex_Federated`** |
| Terminal | `Terminal` | **`TerminalMerged`** |
| Clinic | `Clinic` | **`Clinic_Plumbing_IFC2x3`** — and it is one of *three* federated sub-models (Plumbing 6585, HVAC 3704, Architectural 2620); which one wins is decided by `ORDER BY c DESC`, i.e. by element count |

**Every construction site:**
- stem side: `index.html:467` `BUILDINGS` map + `data-bld`, `index.html:496` url, `erp/idempiere.html:4724,4741`
  `?bld=`, `LargeCity.html:109–136`, `modeller/str_walker_outliner.js:51–58` resident `key`.
- `elements_meta` side: `viewer/streaming.js:1971` (split path) and `:2141` (single-DB fallback, first key of
  `A.buildingCentres`), `viewer/city.js:783,952` (city path — sets it to the *city index* building name).

**Where the paths meet:** `A.activeBuilding` is the scope key for **every** per-building persisted setting:
`viewer/grid_overlay.js:730` `bim_saved_sections_<b>`, `viewer/measure.js:604` `bim-clash-statuses-<b>`,
`viewer/section_cut.js:793` `<b>:sectionCuts`, `viewer/viewer.html:703` `<b>:scissors_bookmarks`,
`viewer/cinema_path_editor.js:856` (IDB `bim_ootb_cinema_paths`), `viewer/dlod_nav.js:1185`
`occlStruct:<b>:<v>`, `viewer/time_machine.js:4314` gantt/JSON caches, `viewer/bom_extract.js:289`
(`keyPath: 'building'`). Meanwhile the *hub card*, the *ERP red pill* and the *Modeller resident list* all
address the same building by its stem.

**Radius × silence:** anything that changes which sub-model has the most elements (a re-extraction, a
discipline added) silently renames `A.activeBuilding` for Clinic and orphans every saved section cut, clash
status, bookmark and cinema path for that building. `viewer/navigate_find.js:728–730` already documents the
mess in a comment — *"the raw elements_meta.building column, confirmed messy/inconsistent per-building"* —
and works around it locally rather than fixing the identity.

**F7b — four different "unknown building" sentinels.** `'default'` (`grid_overlay.js:730`,
`measure.js:604`, `viewer.html:702`), `'bld'` (`section_cut.js:798,819,826`), `'building'`
(`cinema_path_editor.js:856`), `'unknown'` (`time_machine.js:4314`). Harmless while the prefixes differ, but
it means "no building loaded" is four different buckets.

**F7c — `?bld=` is write-only.** `erp/idempiere.html:4724,4741` sets it; `viewer/main.js:24` echoes it out to
the embedding host as `{type:'bim:ready', bld}`. **No production code reads `params.get('bld')` to set
anything** (grep: only test URLs). So the ERP and the embedding host agree on `Duplex` while the viewer
internally is `Ifc2x3_Duplex_Federated`.

**Root cause, one line:** the viewer derives the building name from *data* while every caller names it by
*file*, and nothing reconciles them.

**Folding guard / counter-case:** Clinic's three `elements_meta.building` values are **real and must not
collapse** — they are separate federated discipline models. A single building identity must sit *above*
them, not replace them.

**Suspected shared cause:** F8, F14.

---

## F8 — "what class of building is this" is computed three ways from two different source strings
**Rank: 8 (radius: MEP rule-DB routing — a Walker-Doctrine surface · silence: no log names the classifier)**

**The identity:** residential vs complex.

| # | site | source string | rule |
|---|---|---|---|
| 1 | `viewer/navigate_find.js:731–737` `_buildingClass()` | `A.DB_URL` (the `?db=` filename) | complex = terminal/clinic/hospital/hhs; residential = duplex/samplehouse/samplecastle; else `null` |
| 2 | `modeller/building_parts_outliner.js:79–86` `_buildingClass()` | `window.__dwName` | **byte-identical lists**, different source |
| 3 | `modeller/modeller.html:4626–4629` `_dwRules(nm)` | `window.__dwName` | regex `/duplex\|sample.?house\|sample.?castle\|schependomlaan\|(^\|[^A-Z])(SH\|DX\|SC)([^A-Z]\|$)/i` → `duplex_rules.db`, **else `terminal_rules.db`** |

**Proven divergences (same input, different answer):**
- `Schependomlaan` → #3 says residential (`duplex_rules.db`); #1 and #2 say `null` (unclassed).
- Any `SH`/`DX`/`SC`-coded name → #3 residential; #1/#2 unclassed.
- Any building not on either list (Jesse, FZKHaus, AC90_Jasmin, Molio, HITOS…) → #1/#2 `null`, but #3
  **defaults to `terminal_rules.db`** — the exact hazard `CLAUDE.md` §Walker Doctrine warns about
  ("`dwInit` DEFAULTS to `terminal_rules.db`… a residential caller MUST pass `duplex_rules.db`").

**Where the paths meet:** the same opened building. #3 selects the rules DB the MEP walk is measured
against; #1/#2 gate whether PLANT_ROOM is offered for it. A building can therefore be walked with
Terminal rules while both UIs treat it as unclassed/residential.

**Radius × silence:** wrong rules DB = wrong measured placement rows for a whole discipline walk. The only
log is `§PARTS_CLASS_GATE type=PLANT_ROOM buildingClass=<x>` (`navigate_find.js:3174`) — which reports #1's
answer only, and never #3's.

**Root cause, one line:** `config/building_taxonomy.yaml`'s `building_classes` was ported into JS three
times instead of once.

**Folding guard / counter-case:** #3's `terminal_rules.db` default must **not** become `null`/"unclassed" —
per WalkerDoctrine, Terminal is the LOD400 reference and the legitimate fallback for a complex; the fix is
to make the class explicit, not to remove the default.

**Suspected shared cause:** F7 (both are "the building's name/class, two sources").

---

## F9 — `A.DB_URL` resolution is re-implemented verbatim in the schedule editor
**Rank: 9 (radius: the editor opens a different building than the viewer · silence: a copy that drifts)**

**The identity:** "which DB url is this page for."

| site | expression |
|---|---|
| `viewer/config.js:15–28` | `BLANK_MODE ? '' : (params.get('db') \|\| localStorage.pwa_last_db \|\| (ociBase ? ociBase+'Duplex_extracted.db' : 'buildings/Duplex_extracted.db'))` |
| `viewer/schedule_editor_ui.js:32–38` `resolveDbUrl()` | the same expression **minus the `BLANK_MODE` branch** — and its own comment says `// ── DB resolution (config.js parity) ───` |

**Where the paths meet:** both feed the same building + the same signed schedule ops. **Proven divergence:**
with `?blank=1`, `config.js` yields `''` (empty scene) and `resolveDbUrl()` yields the resumed
`pwa_last_db` or the Duplex default — the editor authors ops against a building the viewer isn't showing.

**Root cause, one line:** a copy made "for parity" with no mechanism to keep parity.

**F9b — `UNVERIFIED`, flagged for pass 2.** Both sites default, when hosted on OCI, to
`<ociBase>Duplex_extracted.db` — **no `buildings/` segment** — while `index.html:496` builds
`<prodBase>buildings/<db>`. Two consequences if the bucket-root object does not exist: the fetch 404s, and
`db_resolve.ociRetryUrl` R4 (`/(^|\/)buildings\//`) declines to retry, so boot dead-ends. Also
`cacheKey` K4 returns it verbatim, so it can never share a key with the landing's form. **Not confirmed** —
resolving it needs a live HEAD against the OCI bucket root, which this pass did not do.

---

## F10 — `ad_seed_v16` is a bump-in-lockstep literal at 9 sites, and one test is still on `v13`
**Rank: 10 (radius: a whole ERP surface reads/writes the wrong seed blob forever · silence: total)**

**The identity:** the ERP seed blob's key in `erp_cache/blobs`.

Nine literal `'ad_seed_v16'` occurrences with no shared constant: `erp/erp.html:280,321`,
`erp/idempiere.html:761,802,866,875,1068`, `erp/system_monitor.js:296`, `erp/bim_orders_overlay.js:42`
(comment). `erp/idempiere.html:666` even documents the coupling in prose —
*"── IndexedDB cache (shares 'ad_seed_v16' with erp.html) ──"*.

**Proven divergence:** `erp/tests/poc_client12_resident.js:42` still reads **`'ad_seed_v13'`**. It can never
observe the blob production writes, so its "client 12 is resident" assertion is GIGO — it proves nothing
either way, which is exactly the failure `CLAUDE.md` §Standing Rules ("tests expose issues") exists to
prevent.

**Where the paths meet:** one `erp_cache/blobs` store, four production files + the test.

**Radius × silence:** a `v17` bump means nine hand-edits; miss one and that surface silently keeps
reading/writing the previous blob — the seed and the overlay diverge with no error. The `v13` test is
already proof the pattern fails in practice.

**Root cause, one line:** a version-stamped identity with no single owning constant.

**Folding guard / counter-case:** the version *must* stay in the key — that is how a schema change
invalidates stale blobs. The fix is one exported constant, not removing the version.

---

## F11 — `kernel_ops.js` exists three times and only two copies got the IDB fix
**Rank: 11 (radius: ERP op-log persistence · silence: one `console.warn`)**

`erp/kernel_ops.js` (918 lines), `modeller/kernel_ops.js` (610), `viewer/kernel_ops.js` (~610).
`diff modeller viewer` = 75 changed lines; `diff erp modeller` = 528; `diff erp viewer` = 493.

**The identity being triplicated:** the op-log's IDB persist contract (cache-DB open convention, the persist
key, and the `op_type` token vocabulary written into the shared `kernel_ops` table inside a building DB).

- `viewer/kernel_ops.js:141` and `modeller/kernel_ops.js:126`: versionless open, with the post-mortem comment.
- `erp/kernel_ops.js:133`: `open('bim_ootb_cache', 1)`, unguarded `createObjectStore`, **plus** a second key
  convention `dbUrl + '::tip'` (`:139`) that neither other copy writes or reads.
- `erp/kernel_ops.js:14–16` carries `PLUGIN_*` `op_type` values the other two copies' schemas do not list.

**Where the paths meet:** all three write `kernel_ops` rows into the *same* building `.db` files and persist
them into the *same* `bim_ootb_cache/dbs` store. A building edited in the Modeller and reopened in the ERP
is reading the other copy's log.

**Root cause, one line:** the module was forked per app instead of shared from `common/`.

**Suspected shared cause:** F2 (the v1-vs-v2 half of this is F2's fourth site).

---

## F12 — `viewer/sw.js` `PRECACHE_ASSETS` is a hand-maintained second copy of viewer.html's script list
**Rank: 12 (radius: offline/PWA gaps · silence: an offline miss on a `.js` returns an empty 503)**

**The identity:** "which assets does the viewer need."

`viewer/viewer.html` loads **144** non-CDN scripts; `viewer/sw.js` `PRECACHE_ASSETS` lists **119** entries.
**53 scripts loaded by viewer.html are absent from `PRECACHE_ASSETS`** (query strings normalised out first —
`viewer/sw.js:339,364` do `request.url.split('?')[0]`, so the `?v=N` suffixes are *not* the cause). The
absent set is dominated by whole feature families: all 21 `../hr_bim_asset/*`, all 10 `hba_*`, all 5
`../common/*` (`about_diy`, `history_bar`, `history_tap`, `pill_builder`, `whole_history`), the 3
`../erp/*` (`ad_docfsm`, `bigdecimal`, `kernel_ops`), the 4 `proj_*`, both `vo_*`, both `whatif*`,
plus `universal_history.js`, `share.js`, `sfx.js`, `connect_scene.js`, `lib/chart.umd.min.js`.

**Where the paths meet:** the install-time precache vs the runtime `<script src>` fetches. Runtime caching
(`viewer/sw.js:344`) does back-fill these on a first online load, so this is an offline *first-run* and
*post-purge* gap rather than a permanent one — which is precisely why it has stayed invisible.

**Radius × silence:** `viewer/sw.js:351` — on an offline cache miss for a `.js` it returns
`new Response('', { status: 503 })`. An empty body, not an exception: the feature simply does not exist that
session, with no console error naming the file.

**Root cause, one line:** the dependency list is stated twice, in two languages, with no generator.

**Folding guard / counter-case:** the two lists are **not** meant to be equal — `PRECACHE_ASSETS`
legitimately also carries html/css/wasm/locale assets that are not `<script src>` tags. The invariant is
*superset*, not *equality*.

**Suspected shared cause:** none — standalone, and the only finding here that is config drift rather than a
runtime key.

---

## F13 — the green "cached" badge matches by **stem prefix**, not by key
**Rank: 13 (radius: cosmetic, one wrong badge · silence: total, but the badge IS the silence-breaker for F1)**

`index.html:532–534`:
```
var stem = bld.db.replace(/_extracted\.db$/,'').replace(/\.db$/,'');
var hit = keyStr.indexOf('/'+stem+'_') >= 0 || keyStr.indexOf('/'+bld.db) >= 0;
```
**Proven false positive:** with only `Hospital_3_extracted.db` cached, the key string contains
`buildings/Hospital_3_extracted.db`, which contains `/Hospital_` — so the **Hospital** card greens too.
Same shape for any `<X>` / `<X>_<n>` pair in the `BUILDINGS` map (`Hospital`/`Hospital_3`,
`HospitalGarage`/`HospitalGarage_2`).

**Also:** because it enumerates `dbs` (F4 inventory #2) it greens on *any* writer's key — including the raw-url
entries the viewer can no longer read (F1). So the badge says "cached" for exactly the buildings the viewer
will re-download. That is the F1 tell, still unread, one more time.

**Root cause, one line:** the badge asks "does any key look like this building" instead of
"is `cacheKey(url)` present."

**Folding guard / counter-case:** split builds legitimately cache `*_meta.db`/`*_geo.db`/`*_positions.db`
and no `*_extracted.db` (the comment at `:533` says so) — an exact-key check must accept any of the three,
not just the monolith.

---

## F14 — a clash pair is `a|b` in storage and `a~b` in the deep link, and neither is order-normalised
**Rank: 14 (radius: saved clash statuses orphan on re-detection · silence: statuses just read as 'New')**

| site | encoding |
|---|---|
| `viewer/measure.js:616` `A._clashPairKey` | `guidA + '\|' + guidB` — the localStorage status key |
| `viewer/measure.js:800` | `'#clash=' + c[0] + '~' + c[1]` — the share/deep-link hash, parsed at `viewer/main.js:993` |

**Order sensitivity:** `_clashPairKey(A,B) !== _clashPairKey(B,A)`, and nothing sorts the pair. The clash
list is rebuilt from scratch at `viewer/clash_matrix.js:315`, `viewer/measure.js:449,814,918`,
`viewer/issues.js:175` and `viewer/main.js:1016` — five independent producers of `A._currentClashes`. Any
producer that emits a pair in the opposite order to the one that saved the status reads back `''` → the
status renders as `New` and the reviewer's Reviewed/Resolved/Accepted decision is silently gone.

**Where the paths meet:** `A._clashStatuses`, persisted to `bim-clash-statuses-<activeBuilding>` — which is
also scoped by F7's ambiguous building name.

**Root cause, one line:** an unordered pair is being used as an ordered key.

**Folding guard / counter-case:** the *display* order (which element is A and which is B) is meaningful in
the clash panel — only the storage key should normalise, not the row.

---

## F15 — the Modeller caches resident DBs with `?v=N` **in the key** and never busts the old one
**Rank: 15 (radius: one orphaned IDB copy per version bump, forever · silence: no log, no eviction)**

`modeller/str_walker_outliner.js:662` builds `url = './' + res.db + '?v=' + res.v` and `:498`
`url = geoBase + res.geoDb + '?v=' + (res.geoV || res.v)`; both are passed **verbatim** to `_idbPutDb(url, buf)`
(`:355`). Because these are not `buildings/` urls, `cacheKey` K4 would return them verbatim too — so the
query string is part of the identity.

Bumping `v: 1 → 2` (or `geoV: 3 → 4`) in the `RESIDENTS` table (`:51–58`) therefore writes a **new** entry and
leaves the old one resident. There is no eviction path: these entries have no `timestamps` row (F4), so
`_evictOldest` cannot see them.

**Contrast — the one place this was handled:** `modeller/modeller.html:4630–4655` `_dwBustStaleRulesCache`
exists precisely for this, gated on `window.__dwRulesVer` (`:4635`, currently `'v22'`), and explicitly
deletes the two rules keys. Nothing equivalent exists for the eight residents' `_ARC.db`/`_geo.db`.

**Root cause, one line:** cache-busting was solved once, for two keys, by hand — not made a property of the key.

---

## F16 — `bim_ootb_cache` / `dbs` / `bim_ootb_imports` / `buildings` are string literals in 6+ files
**Rank: 16 (HARMLESS today — all agree — but it is the substrate every finding above sits on)**

`A.CACHE_DB_NAME`/`A.CACHE_STORE` are properly named constants at `viewer/scene.js:463–464`, and
`viewer/dlod_nav.js:1190,1193,1207` correctly reads them via `app.CACHE_STORE || 'dbs'`. Everyone else
re-types the literals: `import_own.js:28–29,70–71`, `viewer/import.js:39–41`, `LargeCity.html:149,152`,
`erp/kernel_ops.js:133,138`, `modeller/kernel_ops.js:126,134`, `viewer/kernel_ops.js:141,149`,
`modeller/str_walker_outliner.js:302,329,350`, `modeller/disc_walker.js:135,143,149`,
`modeller/routewalker.js:1384,1390`, `modeller/bonsai_oplog.js:84,89,103` (store `oplog_fallback`),
`modeller/modeller.html:4641,4646`, `index.html:516,522`, `viewer/boq_charts.html:725,745`,
`viewer/clash_report.html:80,88`.

Marked `HARMLESS` per §DELIVERABLE — every literal currently matches. Recorded because pass 2 cannot
unify F1/F2/F4 without touching this exact set of files.

---

## F17 — `bim_history` and `bim_4d` channel names are duplicated literals
**Rank: 17 (HARMLESS today · a rename in one file silently kills cross-tab sync)**

- `'bim_history'`: `common/history_bar.js:77` (`_cfg.channel`) and `common/whole_history.js:28` (`CH`) —
  two independent literals for one bus, in two files that talk to each other.
- `'bim_4d'`: `viewer/main.js:310`, `viewer/boq_charts.html:777,796,1632`, `viewer/schedule_sync.js:11`
  (`CHANNEL`) — four literals.
- `'connect:v1'` (`viewer/connect_scene.js:144`) and `'bim_erp'` (`erp/ad_ui.js:2696,2757`) are
  single-module and fine.

**Message-`type` tokens on `bim_4d`:** `viewer/main.js` handles ten types; only five have a production
sender. `4D_PLAY`, `4D_PAUSE`, `4D_RESUME`, `4D_SEEK`, `4D_RESOURCES`, `4D_RESOURCES_HIDE` and
`4D_HIGHLIGHT_ALL` have handlers and **no sender anywhere outside `tests/test_s253_real_db.js:454`**.
Recorded as protocol surface, not reported as a finding — per §THE LENS, dead code is out of scope.

---

## F18 — `disc_walker` builds the rules-DB key from a caller-supplied base; the buster hardcodes `'./'`
**Rank: 18 (CLEAN TODAY — recorded because the log lies if it ever stops being true)**

- Write key: `modeller/disc_walker.js:171` `url = (baseUrl || '../modeller/') + file`.
- Evict key: `modeller/modeller.html:4647` `os.delete('./terminal_rules.db'); os.delete('./duplex_rules.db')`.

**Verified:** every caller passes `'./'` — `modeller.html:3503,4674` and the five modeller witnesses. So the
keys agree and §DW-RULES-BUST works. **But** `disc_walker`'s own default is `'../modeller/'`, and an IDB
`delete` on a missing key *succeeds* — so `tx.oncomplete` fires and
`§DW-RULES-BUST evicted stale rules DBs for v22` (`:4648`) prints **whether or not anything was evicted**.
The day a caller uses the default, users keep stale rules DBs and the log still says they were evicted.

**Root cause, one line:** the log reports transaction success as if it were eviction success.

---

# §CLEAN — families walked and found genuinely single-sourced

Recorded so the next session does not re-walk them.

1. **`db_resolve.cacheKey` / `ociRetryUrl` themselves** (`viewer/db_resolve.js`) — one pure function each,
   fully specced, node+browser exported. The function is clean; only its *adoption* is not (F1).
2. **`scene.js`'s own cache path** — `cachedFetch` (`:791`), `_checkCache` (`:614`) and the LRU write
   (`:907`) all use the canonical key and all maintain `timestamps`. Internally consistent.
3. **`A._clashPairKey`** (`viewer/measure.js:616`) — one function, called at all seven status sites
   (`clash_report.js:121,122,151,176,480`, `measure.js:855,874,1048`). The key *construction* is
   single-sourced; the order-normalisation and the second `~` encoding are the defect (F14), not duplication.
4. **`elements_meta.storey`** — the storey identity is read from one column everywhere
   (`analysis_sidecar`, `bom_extract`, `clash_snag`, `decoder`, `diff`, `doc_canvas`, `export_5d`,
   `foreign_schedule`, `grid_overlay`, `hba_lens`, `import`, `lib/room_walker`, `measure`). `streaming.js`'s
   `'_'` sentinel (`:1240,1418,1596,1773`) is an internal batch-key encoding that is decoded back to `''`
   at every read site — symmetric, no leak.
5. **`foreign_schedule.parseBindToken`** (`viewer/foreign_schedule.js:49–59`) — one regex, one parser, and
   **no writer** anywhere in the repo (the `@DISC:IfcClass[:storey]` token is authored by the planner in the
   XER/PMXML, not generated by us). An inbound convention with a single parse point.
6. **`teams/`, `hr_bim_asset/`, `geomapping/`** — zero `indexedDB.open` and zero `localStorage` keys across
   all three trees. Pure overlays over the viewer's state; nothing to diverge.
7. **`viewer/sw.js` query normalisation** — `request.url.split('?')[0]` at both `:339` and `:364`. The
   `?v=N` suffixes in `viewer.html` are correctly not part of the SW cache identity. (Checked explicitly
   because it looked like a 144-vs-119 mismatch; it is not the cause of F12.)
8. **`A.PROD_BASE` / `_prodBase`** — the OCI base string itself is identical at all four sites
   (`index.html:466`, `viewer/config.js:21`, `LargeCity.html:102`, `modeller/str_walker_outliner.js:49`
   with the deliberate `o/modeller/` suffix). Duplicated literals, but no divergence, and `config.js:19`
   documents the coupling.
9. **`viewer/bom_extract.js` BOM cache** — `keyPath: 'building'` on both put (`:289`) and get (`:315`),
   one store (`bim_ootb_bom`), one writer, one reader. Inherits F7's ambiguity in *what* the building is
   called, but adds no divergence of its own.
10. **`erp_cache/blobs`** — one DB name, one store name, one key convention across `erp.html`,
    `genesis.html`, `idempiere.html`, `system_monitor.js`. The only defect is the un-constanted version
    literal (F10), not the store identity.

---

# §CLUSTERS — grouped by shared root cause

**C1 — "the shared building cache has no owner." (F1, F2, F3, F4, F5, F6, F15, F16 — 8 of 18)**
One IndexedDB store, `bim_ootb_cache/dbs`, written by ten modules across four apps, with eight key
conventions, six value types, three inventory notions and four version conventions. The 2026-07-30
`cacheKey` fix proved the right shape (one pure function) and then wired it into one caller.
*What a refactor would touch (not a design — just the surface):* `viewer/db_resolve.js` (grow it into the
single cache facade: key, open, get, put+timestamp, evict), and the ten writers listed in F4. The hard part
is not the key — it is that `dbs` is being used as five different caches at once, so a single eviction
policy is wrong for it. **Inherited counter-cases:** K3 (`/deploy/`, `/modeller/` verbatim), `o/modeller/`
geo ≠ `o/buildings/` geo (F1), `_meta`/`_geo`/`_extracted` of one import stay distinct (F5), non-DB values
must stay separately evictable (F4).

**C2 — "the building has two names, and the code picked whichever was nearest." (F7, F8, F13, F14-scope)**
Filename stem (what every *caller* uses) vs `elements_meta.building` (what the *viewer* derives), with
Duplex/Terminal/Clinic measured as divergent and Clinic additionally data-dependent. Everything
per-building — saved sections, clash statuses, section cuts, bookmarks, cinema paths, occlusion structs,
gantt caches, BOM cache, PLANT_ROOM gating, MEP rules routing — is scoped by one or the other.
*What a refactor would touch:* one `A.buildingId` established at load (probably from the url stem, which is
the stable side and is what `navigate_find.js:727–730` already chose deliberately), the eight scope-key
builders in F7, and the three classifiers in F8. **Inherited counter-case:** Clinic's three
`elements_meta.building` values are real federated sub-models — the building identity must sit *above*
them, never replace them.

**C3 — "the module was forked, and only some copies got the fix." (F2, F9, F11)**
`kernel_ops.js` ×3, `config.js`'s DB resolution ×2, the cache-open idiom ×4 conventions. In each case one
copy carries a written post-mortem of a bug the other copy still has.
*What a refactor would touch:* `common/` — the repo already has the right home for shared modules and uses
it for `history_bar`, `whole_history`, `pill_builder`, `about_diy`, `hallway_backbone`.

**C4 — "the fact is stated twice, by hand, in two languages." (F10, F12, F16, F17)**
`ad_seed_v16` ×9, `PRECACHE_ASSETS` vs `<script src>` (53 drifted), the store-name literals, the channel
names. All are "a list that must agree with another list, maintained by remembering."
*What a refactor would touch:* one exported constant each for the version/store/channel identities; for
F12, a generator or a CI assertion (viewer.html's script set ⊆ PRECACHE_ASSETS) rather than a hand-merge.

**C5 — "the log reports the operation, not the outcome." (F18, and the silence half of F1, F3, F4)**
`§DW-RULES-BUST` prints "evicted" on transaction success with zero deletions. `§CITY_BBOX skippedArch=N`
prints a counter where a total miss deserves an error. `§CHARTS_DB_SOURCE source=oci` prints the *fallback*
as if it were the plan. `§CACHE_MISS_READ` reads as routine. Not a code cluster — a **logging-contract**
cluster, and the reason all of C1 stayed invisible for months. Worth its own decision in pass 2: a §-line
that reports a fallback/no-op should be visually distinct from one that reports the intended path.

---

## Coverage boundary (what pass 1 did NOT reach)
- **`erp/` shard/tenant key families** beyond `ad_seed_v16` — `erp/crud_overlay.js` `SIDE_KEY`/
  `MIGRATE_MARKER_KEY`, `erp/erp_signer.js` `KEY_ID`, `erp/plugin_overlay.js` `IDB_KEY`,
  `erp/img_store.js`, `erp/kanban_host.js` vs `erp/kanban_lens.html` (two copies of the same
  open/get/put pair — likely a C3 member, not opened).
- **`erp/erp_picker.js:227`** `'erp_chain_' + _sel` and `erp_recent_windows` — not chased.
- **`modeller/save_catalog.js`** `DB_NAME`/`STORE`/`key` — not chased.
- **guid ↔ mesh-id ↔ instance-row** identity: `userData.guid` appears at 82 sites and
  `userData.instanceBuilding`/`isMerged`/`isBatched` suggest at least three addressing schemes for one
  element. Enumerated but **not resolved** — this is the one §METHOD family still owing a pass.
- The `archive/` tree was excluded throughout (`archive/gallery.html` carries an older copy of the
  `BUILDINGS` map and the `import://` shapes — dead, listed here only so pass 2 does not rediscover it).

**Pass 1 wrote zero production code, added no tests, created no memory files, and touched only this file.**

---

## ⚠ CORRECTION to C1 — 2026-07-30, user challenge: "Viewer / Modeller are different seams"

**The user is right, and C1 as written was loose.** "One cache facade" must not be read as "one keyspace."

**Viewer and Modeller do NOT load the same building files** — verified, not assumed:

| | Viewer | Modeller |
|---|---|---|
| metadata | `<prodBase>buildings/Hospital_extracted.db` (63,415 elements, all disciplines) | `./Hospital_ARC.db?v=1` (ARC-only, `str_walker_outliner.js:56`) |
| geometry | `<prodBase>buildings/Hospital_geo.db` (full) | `<prodBase>modeller/Hospital_geo.db?v=3` (small ARC-only, `GEO_BASE` `:49`, §GEO-SERVED 2026-07-30) |

Same stem, different bytes, different purpose. **These must stay separate keys** — folding them is the
wrong-geometry failure the §GUARDRAILS counter-case exists to prevent. F1's counter-case already said this;
C1's one-line summary did not, and that is the line pass 2 would have read.

**What they genuinely share, and must agree on:**
1. **The container, not the contents** — one IndexedDB database, one store, one version, one eviction
   policy, one inventory. F2 (four modules on v1 vs v2) and F4 (`timestamps` vs `dbs`) bite *regardless* of
   whose files are inside. A Modeller write that skips `timestamps` breaks the Viewer's cap, and a Viewer
   `open(name, 2)` breaks an ERP `open(name, 1)` — neither has anything to do with sharing a building.
2. **`kernel_ops`** — the op-log is written *into* a building `.db`. A building edited in the Modeller and
   opened in the Viewer must read the same table and the same `op_type` vocabulary. F11 stands.

**So C1 splits in two:**
- **C1a — the container contract** (open / version / key-normalisation / timestamp / evict). Shared by all
  four apps. This is the real refactor.
- **C1b — per-app keyspaces**, deliberately distinct, sitting *on top of* C1a. Viewer `buildings/…`,
  Modeller `modeller/…`, imports `import://…`, ERP `ad_seed…`. **A pass-2 change that merges these is a
  regression, not a fix.**

The three live breakages (F2 boq_charts/ERP, F3 city.js, F4 unbounded `dbs`) are **all C1a**. None of them
require Viewer and Modeller to share a single byte.

---

## §F2 CLOSED — 2026-07-31 (fixed, live, user-reviewed)

User reported the exact live symptom unprompted ("4D/5D charts re-downloading the whole building on
every open, and ERP edits not surviving a refresh") — traced straight to F2 above; code confirmed the
finding was still exactly as described (blame: `boq_charts.html:725/745` last touched 2026-06-16/05-23,
`erp/kernel_ops.js:133` 2026-07-03 — latent for weeks, not a regression from a recent change).

**Fix:** `viewer/boq_charts.html` drops the hardcoded version (`indexedDB.open('bim_ootb_cache')` — the
same versionless idiom the table above already calls canonical). `erp/kernel_ops.js` mirrors
`viewer/kernel_ops.js`'s proven fix: `APP.openCacheDB()` when present, else the same versionless
fallback. bim-ootb PR #1106 (squash-merged `origin/main` 2026-07-30T22:42:42Z).

**Witnessed, not just argued** (per this project's whitebox rule — code+maths, no screenshot):
- `tests/witness_idb_cache_version_drift.js` — `fake-indexeddb`, no browser: seeds the shared DB at v2
  (scene.js's canonical opener), proves the OLD hardcoded `open(name,1)` throws `VersionError` (matches
  the reported bug exactly) and the NEW versionless open succeeds + reads back the cached entry. PASS.
- `tests/witness_offline_meta_db_cache_hit.js` (PR #1109, squash-merged 2026-07-31T13:51:28Z) — followed
  up on "does offline mode still work after this fix" by extracting `peekDbCache`/`fetchDbBuffer`
  **verbatim** from the live file and running them against a cache seeded the way `scene.js` really
  writes it. Confirms both scenarios boq_charts.html's own comment promises ("meta OR full"): meta.db-only
  cached → hit on meta key; whole `_extracted.db` cached (no split) → hit on full key; `fetchDbBuffer`'s
  cache-hit path never reaches its own network fallback. PASS, all 3 sub-scenarios.

**Key-consistency check (relevant to F1, NOT reopening it):** confirmed `viewer/tools.js:377` passes the
raw `?db=` query string through to `boq_charts.html` unrewritten, and both `viewer/streaming.js:1676`
(the writer) and `boq_charts.html`'s own `_metaUrl` derivation (the reader) apply the identical
`_extracted.db`→`_meta.db` string replace on that same raw string — so this specific meta/full caching
path does NOT hit F1's raw-url-vs-canonical-key drift. F1 itself is untouched and still open.

**Still open, untouched by this fix:** F1, F3–F18. Pass-1's "fix nothing" directive no longer holds
blanket — this was a targeted, user-reviewed exception for the two live-reported symptoms; the rest of
the list is still fix-nothing-until-reviewed.
