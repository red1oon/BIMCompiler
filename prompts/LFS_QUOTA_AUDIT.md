# ⚠ DO NOT REMOVE — SCOPE: repo hygiene lane — LFS quota (§1-§5), the two-tree map (§6), workspace/IDE (§7)

**Why this file exists.** The user hit GitHub's LFS gigabyte limit *again* after the 2026-08-19
release-archive fix, and asked: *"i still get GH's LFS gigabyte limit which means something is still
taking up lots of quota. Check and advice."* This is the measurement that answered it, plus the
cleanup that was authorised and applied. **Every number here was measured on 2026-09-01, not
estimated.** Read the log/commands before re-deriving anything.

---

## §1 THE MEASUREMENT — where the quota actually goes

Method: enumerate every blob reachable from **remote** refs, keep the ones small enough to be an LFS
pointer, parse `oid`/`size` out of each pointer, dedupe by oid. That is exactly the set GitHub
stores and bills.

```bash
git rev-list --remotes --objects \
 | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' \
 | awk '$1=="blob" && $3<300 {print $2}' \
 | git cat-file --batch --buffer \
 | awk '/^oid sha256:/{o=$2} /^size /{if(o){print o,$2;o=""}}' | sort -u
```

| repo | unique LFS objects on remote refs | storage |
|---|---|---|
| **bim-compiler** | 303 | **8.53 GB** |
| bim-ootb | 6 | 0.78 GB |
| | | **≈ 9.3 GB against a 1 GB free quota** |

⚠ The GitHub LFS quota is **per ACCOUNT**, not per repo — the two repos share one 1 GB allowance
(and one 1 GB/month bandwidth allowance). So bim-ootb being "clean" was never the whole picture.

### Where bim-compiler's 8.53 GB is
| path | unique bytes | note |
|---|---|---|
| `library/component_library.db` | **5.76 GB — 68 % of the total** | **32 versions × ~180 MB.** One file. Every commit that touched it pushed a whole new blob; LFS stores each one forever. |
| `deploy/dev/buildings/*` | 1.45 GB | LTU_AHouse + Terminal `extracted`/`geo`/`meta`. **All six verified live on OCI** (HTTP 200) — a pure duplicate of what the viewer already fetches. |
| `backup/db_snapshot_20260323_014819/*` | 1.19 GB | A backup directory committed into git. Long since removed from HEAD — **still billed**. |
| everything else | ~0.13 GB | |

### The cause
`bim-compiler/.gitattributes` carried a blanket **`*.db filter=lfs`** rule. It pulled **59 DBs
(1.79 GB) into HEAD** and directly contradicted `CLAUDE.md`'s DB POLICY, which bans binary `.db`
commits *outright and unconditionally, regardless of LFS quota status*. The policy was written; the
already-tracked files were never removed, and the rule kept catching new ones.

---

## §2 CLEARED OF BLAME — the bim-ootb daily release tarballs

The 2026-08-19 `export-ignore` guard in `bim-ootb/.gitattributes` **works**. Verified without
spending more bandwidth, by comparing GitHub's tarball against a local `git archive` of the same tag:

| | bytes |
|---|---|
| GitHub `v1.57.0` source tarball | 95,036,194 |
| local `git archive --format=tar.gz v1.57.0` | 95,040,305 |
| `mesh.db` / `*_geo.db` entries inside the archive | **0** |

The two agree to 0.004 %, and the LFS paths are absent — so the archive carries **no LFS content**
and downloads of it bill **no LFS bandwidth**. The 95 MB is ordinary non-LFS binaries committed
straight into bim-ootb: `buildings/HHS_Office_Federated_extracted.db` 72 MB,
`modeller/Ifc4_Revit_extracted.db` 38 MB, `erp/ad_seed.db` 26 MB, `modeller/Terminal_meta.db` 18 MB,
`modeller/lib/kernel/occt-wasm.wasm` 21 MB. Regular egress, not LFS — a separate (smaller) concern.

**Do not re-open the release-cron theory.** It is measured closed.

---

## §3 ⛔ THE THING TO UNDERSTAND BEFORE ANY CLEANUP

**Deleting files from HEAD frees nothing.** GitHub bills every LFS object *ever pushed*, keeps it
after the file leaves HEAD (the 1.19 GB `backup/` snapshot proves this — gone from HEAD for months,
still counted), and offers **no self-serve purge**. Only a history rewrite plus a GitHub Support
ticket actually reclaims storage.

So the work splits in two, and only the first half is cheap:
1. **Stop the growth** — remove the LFS rules and untrack the DBs. Done, §4.
2. **Reclaim the 8.53 GB** — history rewrite + support ticket, or pay. Not done, §5.

---

## §4 ✅ APPLIED 2026-09-01 (user authorised: *"OK"*) — growth stopped

1. **`.gitattributes` rewritten** — all three LFS rules removed (`*.db`,
   `library/component_library.db`, `DAGCompiler/lib/input/Hospital_extracted.db`), replaced by a
   comment block stating the ban and pointing here.
2. **59 DBs untracked** with `git rm --cached` — **files kept on disk**, verified 59/59 still
   present after the operation. Nothing was deleted from the working tree.
3. **`.gitignore`**: repo-wide `*.db` / `*.db-wal` / `*.db-shm`, with `!migration/*.sql` and
   `!**/patches/*.sql` kept explicit — the SQL patch path is how DB content is *supposed* to travel.

Safety checks run before committing:
- `actions/checkout@v4` in `.github/workflows/ci.yml` defaults to `lfs: false` and no workflow reads
  any of the 59 paths → **CI unaffected**.
- The six largest (`LTU_AHouse_extracted/geo/meta`, `Terminal_extracted/geo/meta`) all return
  **HTTP 200 from OCI** `…/b/bim-ootb/o/buildings/` → nothing becomes unreachable.
- 11 other tracked `.db` paths are **0 bytes** (empty placeholders) and were left tracked; a
  `.gitignore` entry never untracks an already-tracked file, so they are unaffected either way.

**Effect: HEAD goes from 1.79 GB of LFS content to 0. The historical 8.53 GB is untouched.**

---

## §5 ⛔ OPEN — reclaiming the 8.53 GB. Needs a decision, not more measurement

| option | what it costs | what it gets back |
|---|---|---|
| **(a) pay** — one $5/month data pack | $5/mo, zero risk, zero downtime | 50 GB storage + 50 GB bandwidth; the 8.53 GB simply fits |
| **(b) rewrite** — `git lfs migrate export --everything`, force-push every ref, then a GitHub Support ticket to purge the orphaned objects | force-push across a repo with **1411 commits ahead of master on the live branch**, many worktrees, and concurrent sessions; every clone/worktree must be re-cloned | the full 8.53 GB, eventually |

**Recommendation: (a) now that §4 has stopped the growth.** (b) is the highest-risk operation this
project has ever contemplated — a force-push of all refs while other terminals hold worktrees on the
same repo — and it still is not self-service: the purge needs Support either way. Revisit (b) only
if the repo must genuinely become small, and only from a quiet moment with every worktree accounted
for (`git worktree list`, `ahead`/`dirty` both 0).

**Secondary, unrelated to LFS:** bim-ootb ships 95 MB source tarballs *daily* (§2) because real
binaries are committed to it directly. That is ordinary bandwidth, currently unmetered against the
LFS quota, and out of scope here — but the same DB POLICY applies to it and the same `.gitignore`
treatment would shrink every future archive.

---

## §6 THE TREE MAP — what lives where, and the one overlap that surprises people

Measured 2026-09-14. Added because a session lost a round searching bim-ootb for a
prompt that lives here (`MEP_CLASH_REVEAL_MOVIE.md`), and then nearly recommended
deleting `deploy/dev` as a stale mirror. It is not one. Read this before any
cross-repo cleanup.

**Roles, as they actually are:**

| tree | role | evidence |
|---|---|---|
| **bim-ootb** | the product — all shipping code | 1,591 non-lib `.js`; last commit 2026-09-13 |
| **bim-compiler** | the lab + the publication | `prompts/` 996, `scripts/` 651, `docs/` 506 (→ `red1oon.github.io/BIMCompiler`), `migration/`+`DAGCompiler/`+`BIM_COBOL/` 898 |
| **OCI bucket** | the DBs | §4 — LFS rules removed, 59 DBs untracked, served from `…/b/bim-ootb/o/buildings/` |
| **`idempiere-dev-setup/`** | the comparison baseline | 1,427,147 Java LOC; the denominator in every ratio claim |

**Two repos is correct. Do not merge them.** The roles are genuinely different and
both are active.

**The overlap, measured:**

| | |
|---|---:|
| same `.js` filename in both repos | **267** |
| byte-identical | 153 |
| **diverged — same name, different content** | **114** |
| of the 267, under `deploy/` | **196** (dev 132, live 42, sandbox 22) |
| under `build/erp` | 45 |

**⛔ `deploy/dev` is a SOURCE, not a snapshot.** `scripts/minify_viewer.sh` sets
`SRC="deploy/dev"`, and `deploy/OCI_UPLOAD.md` rule 5 states *"Local `deploy/dev/`
→ bucket `sandbox/`"*. It is the sandbox deployment tree. **Do not "clean" it as
duplication.** The same caution applies to `build/erp`: those 45 files are an input
to `scripts/measure_bloat.js`'s dedup union, so removing them silently changes the
**38.9×** figure published in `docs/MigrateComparisonPaper.md`.

### §6.1 ⛔ THE FINDING — there are TWO production paths, from two different sources

Measured 2026-09-14, and this supersedes the "is it stale?" framing:

| tree | files | last touched | status |
|---|---:|---|---|
| `deploy/dev` | 403 | **2026-09-01** | **PRODUCTION.** `OCI_UPLOAD.md` rule 5 + its bucket table: `deploy/dev/` → `bim-ootb-live` bucket `sandbox/*.js`, described there as *"PRODUCTION — viewer code ONLY"* |
| `deploy/live` | 104 | 2026-08-04 | older lineage; **not named** in the current upload rules |
| `deploy/sandbox` | 27 | 2026-05-19 | dead, 4 months untouched |

**So bim-ootb is not the single source of shipping code.** The viewer a user sees
depends on which URL they open:

- `red1oon.github.io/bim-ootb/` → GitHub Pages, built from **bim-ootb** (`deploy-pages.yml`), current to 2026-09-13
- the OCI `bim-ootb-live` bucket → built from **`deploy/dev`**, current to 2026-09-01

Classified against bim-ootb (`.js` with a counterpart): **143 identical, 27 pure
stale (safe to refresh), 103 FORKED** — the fork side holds lines bim-ootb does not
have, e.g. `deploy/live/navigate.js` +1,397, `deploy/live/measure.js` +907,
`deploy/dev/tests/specs/17-find-navigate.spec.js` +55 including a whole test for
Issue S275 that exists nowhere else.

**⛔ Therefore: do NOT regenerate `deploy/` from bim-ootb.** It would delete work
that exists only there. And do not merge it back wholesale either — 103 files each
need a look, and some of the "unique" lines are old code bim-ootb has since
rewritten rather than genuine features.

**The decision, and it is one question, not 103:** should there be one production
path or two? If one, pick it and make the other a build output. If two, write down
which is canonical and put the refresh on a cadence, so a fix lands in both. Until
that is answered, a bug fixed in bim-ootb is not fixed for OCI users, and every
`grep` returns two versions with no way to tell which ships.

**Cheap and safe meanwhile** (no decision needed): archive `deploy/sandbox` (dead
since May) and `deploy/live` (not in the upload rules), which removes 131 of the
196 name collisions and shrinks the problem to `deploy/dev` alone.

---

## §7 WORKSPACE / IDE — the cheap half of the two-tree problem

The drift in §6 needs a decision. **Searching across the trees does not** — that is
a tooling fix, and it removes most of the daily cost.

**Committed: `bim.code-workspace`** (repo root). Three folders in one window —
bim-ootb, bim-compiler, idempiere-dev-setup — so one search box covers all three
and "where does X live" stops costing a round. Search excludes are set for
`deploy/`, `**/lib/`, `node_modules`, `*.min.js`, `**/archive/` and `build/` so the
196 `deploy/` collisions do not pollute results; they remain **openable**, just not
returned by a default search.

**On the editor choice, honestly:** VS Code is the right pick here, but know what
it does and does not buy.

| | |
|---|---|
| **buys** | multi-root search across all three trees; a real JS editor; integrated git; runs the witnesses in a terminal beside the code |
| **does NOT buy** | go-to-definition. With 1,684 plain `<script>` files, zero `import`/`export`, and the object written `A.x` but read `APP.x` (§14 of `bim-ootb/internal/CodeScrapBook.md`), **no IDE can follow a call.** WebStorm is no better; the limitation is the architecture, not the editor |

The substitute for go-to-definition already exists: `bim-ootb/internal/APP_SURFACE.md`,
generated by `scripts/gen_app_surface.js` — 1,098 fields with their production
definition as `file:line`. **Keep it open in a tab. That is the symbol table.**

Install: `sudo snap install --classic code`, then open `bim.code-workspace`.

---

# ⚠ §GH-DEPLOY-DELETES-GLASSBOWL — READ BEFORE ANY `mkdocs gh-deploy` (found 2026-09-18)

**Deploying the docs site right now silently deletes a live 94 KB runtime asset and breaks the Glass
Bowl demo.** This is a direct, unnoticed consequence of the LFS cleanup this file documents.

**What happened.** `0daef3b36` ("drop blanket `*.db` LFS rule, untrack 59 DBs") untracked
`docs/glassbowl_data.db` along with the other 58. Correct for the quota, and correct per CLAUDE.md's DB
policy — but that file is not a build input nobody reads: it is **fetched at runtime by five published
files**, `glassbowl.html`, `glassbowl_gravity.html`, `crud_overlay.js`, `report_overlay.js` and `sw.js`
(which precaches it). It is live today — `https://red1oon.github.io/BIMCompiler/glassbowl_data.db`
returns **HTTP 200, 94,208 bytes**, real SQLite, sha1 `e1fb334d6bfe1655518056d16154f4a9b6e1895b`.

**Why nobody has noticed.** It survives only because no deploy has run since. `mkdocs gh-deploy`
force-pushes the built site over `gh-pages`, and **neither** `master` **nor** `fable/meshdb-livewire`
builds this file — it is in no source tree. So the next deploy from ANY branch, by anyone, removes it.

**Measured 2026-09-18, master @ `325e61956` vs live `gh-pages`** — built site and live tree are 290
files each, and a deploy would delete exactly two:

| file | verdict |
|---|---|
| `.nojekyll` | harmless — `gh-deploy` recreates it (a plain `mkdocs build` does not) |
| `glassbowl_data.db` | **the landmine** — live, referenced by 5 built files, in no source tree |

Nothing else is lost; the consolidation in #106 is otherwise byte-clean against what is live.

**Do NOT "fix" this with `git add -f docs/glassbowl_data.db`.** That was tried and reverted while
writing this. `.gitattributes` states binary `.db` commits are "banned OUTRIGHT and UNCONDITIONALLY",
and `.gitignore:152`'s `*.db` is what removed it — forcing past both is exactly the bypass the policy
names. It is 94 KB, so the LFS quota is not the objection; the policy is.

## The two sanctioned routes — pick one before the next deploy

1. **OCI**, per `deploy/OCI_UPLOAD.md §RULES` — upload the file, re-point the five consumers at the
   bucket URL. Matches how every other binary DB reaches a consumer, and how `*_geo.db` already works
   for the Modeller. Preferred: it is the policy's own answer, and it survives every future deploy.
2. **A `.sql` patch + self-heal loader**, per the same policy — heavier here, since the consumers want
   a ready SQLite file rather than a schema migration.

**Interim, if a deploy must happen first:** restore the file onto `gh-pages` immediately after
deploying (the bytes are already in that branch's history at the sha above). `gh-pages` is published
build output, not source, so this preserves the live state exactly rather than introducing a new tracked
binary — but it is a manual step that must be repeated on EVERY deploy until route 1 or 2 lands, which
is precisely the kind of step that gets forgotten. Treat it as a stopgap, not a fix.

**Status 2026-09-18:** the site consolidation (#106) is merged and master is ready to deploy; the deploy
itself has NOT been run, and should not be until this row is resolved. The live ModellerGuide therefore
still carries the stale "hosted doors and windows ride, never distort" text that #1706 reversed.
