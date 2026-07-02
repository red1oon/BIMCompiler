# OCI Object Storage — BIM OOTB Deployment

## ⚠ RULES — READ BEFORE ANY ACTION

1. **NEVER upload without first downloading and diffing the target.** Assume nothing.
2. **NEVER delete without verifying nothing references it.**
3. **One file at a time. Verify after each.**
4. **Landing = `SYSNOVA/index.html`. Viewer = `deploy/dev/index.html`. DO NOT MIX.**
5. **Local `deploy/dev/` → bucket `sandbox/`. Local `SYSNOVA/` → bucket root `index.html`.**
6. **ALWAYS specify `--content-type` on EVERY upload.** OCI does NOT infer MIME from extension.
   - `.js` → `--content-type "application/javascript"` (without this, browser blocks the script with MIME mismatch)
   - `.html` → `--content-type "text/html"`
   - `.json` → `--content-type "application/json"`
   - `.png` → `--content-type "image/png"`
   - `.wasm` → `--content-type "application/wasm"`
   - `.css` → `--content-type "text/css"`
   **Omitting this breaks the viewer.** The browser's `X-Content-Type-Options: nosniff` header blocks scripts served as `application/octet-stream`.

## Strategy

Four OCI buckets as independent silos — each can be opened side by side for instant visual comparison.
If one breaks, compare with the others to spot what's wrong without needing git or logs.

- `bim-ootb-live` — production, users see this
- `bim-ootb-dev` — staging/testing, safe to break
- `bim-ootb-backup` — snapshot before deploy, rollback target
- `bim-ootb-full` — DB download page (older setup)

## Architecture

Single DB per building in the **common bucket `bim-ootb`**. Small buildings use one
`{Name}_extracted.db`. Large buildings (≥15K elements) use split format: `_meta.db` +
`_geo.db` + `_positions.bin`. The viewer auto-detects split mode via HEAD on `_meta.db`.
Landing page loads `manifest.json` from its own bucket, user clicks a building,
viewer downloads the DB from `bim-ootb` (common). Cached in IndexedDB — second visit
is instant. DB is queryable immediately (4D/5D/clash) before meshing starts.

## Buckets

| Bucket | Purpose | Contains |
|--------|---------|----------|
| `bim-ootb` | **COMMON — building databases ONLY** | `buildings/*.db`, `buildings/*.bin`, `manifest.json`, `city_index.db` |
| `bim-ootb-live` | **PRODUCTION — viewer code ONLY** | `index.html` (landing), `sandbox/*.js` (viewer) |
| `bim-ootb-dev` | **STAGING — viewer code ONLY** | Same structure as live, safe to break |
| `bim-ootb-backup` | **SNAPSHOT** — copy of prod taken before each deploy | Copy of `bim-ootb-live` |
| `bim-ootb-full` | **FULL — standalone viewer + DBs** | Self-contained, has its own building DBs |
| `bim-ootb-live2` | **TEST** — fresh bucket for cache isolation testing | Mirror of live |

⚠ **DATABASES GO IN `bim-ootb` ONLY.** Never upload building DBs to `bim-ootb-live` or `bim-ootb-dev`.
Both landing pages set `_prodBase = '.../b/bim-ootb/o/'` — the common bucket. This is the single source
of truth for all building data. The viewer/staging buckets hold code only.

Region: `ap-kulai-2` (Malaysia West 2 Kulai). Always Free tier.

## Live URL

```
https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb-live/o/index.html
```

## Files in bim-ootb-live (CODE ONLY — no databases)

```
index.html                          ← landing page (SYSNOVA branded, manifest-driven)
sandbox/index.html                  ← modular viewer (S209)
sandbox/*.js                        ← ~50 JS modules (viewer, grids, rates, etc.)
sandbox/boq_charts.html             ← 4D/5D analytics (sibling of viewer)
sandbox/mep_report.html             ← MEP Bill of Quantities
sandbox/locales/*.js                ← 18 locale translations
sandbox/rates/*.json                ← 17 country rate templates
manifest.json                       ← 30 archetypes metadata
```

⚠ NO `buildings/` folder here. All building DBs are in `bim-ootb` (common bucket).

## Files in bim-ootb (COMMON — databases only)

```
buildings/
  {Name}_extracted.db               ← single DB (small buildings)
  {Name}_meta.db + _geo.db + _positions.bin  ← split DB (large buildings ≥15K)
  city_index.db                     ← 786 building bboxes for city mode (324KB)
```

## CLI Commands

```bash
# Upload landing page (live = SYSNOVA/index.html as-is)
oci os object put --bucket-name bim-ootb-live \
  --file SYSNOVA/index.html --name index.html \
  --content-type text/html --force

# Upload modular viewer (deploy/live/ has NO banner — upload directly)
oci os object put --bucket-name bim-ootb-live \
  --file deploy/live/index.html --name sandbox/index.html \
  --content-type text/html --force

# Upload JS modules (from deploy/dev/ — working copy)
for f in config scene helpers streaming panels tools picking tour measure sitecam issues walk city main loader diff nlp variation_order import import_db_builder import_worker rates excel sw; do
  oci os object put --bucket-name bim-ootb-live \
    --file "deploy/dev/${f}.js" --name "sandbox/${f}.js" \
    --content-type application/javascript --force
done

# Upload a per-building DB to COMMON bucket (NEVER to bim-ootb-live)
oci os object put --bucket-name bim-ootb \
  --file deploy/buildings/Hospital_extracted.db \
  --name buildings/Hospital_extracted.db --force

# List bucket
oci os object list --bucket-name bim-ootb-live \
  --query 'data[*].{name:name}' --output table
```

## Cost

OCI Always Free tier — no charges, no expiry:
- 20GB Object Storage (we use ~1.5GB)
- 10TB/month outbound (per-building DBs are 0.1-173MB each)
- Exceeding limits = throttled, not billed

Full setup details: `internal/OCI_SETUP.md`

## SYSNOVA Landing Page

### Bucket Landing Arrangement

| Bucket | Landing (`index.html`) | Source file | About box |
|---|---|---|---|
| `bim-ootb-live` | SYSNOVA branded (blue, logo, company footer) | `SYSNOVA/index.html` | Sysnova logo + DIY Downloader |
| `bim-ootb-dev` | SYSNOVA + orange "DEVELOPMENT SITE" banner | `SYSNOVA/index.html` + sed banner | Sysnova logo + DIY Downloader |
| `bim-ootb-full` | DB download page (no viewer) | `deploy/landing.html` | None |
| `bim-ootb-live2` | Test mirror of live | `SYSNOVA/index.html` | Sysnova logo + DIY Downloader |
| `bim-ootb-backup` | Snapshot of live | (copy of live) | Sysnova logo + DIY Downloader |

**⚠ Each bucket keeps its own landing page.** Never replace one with another.
**⚠ NEVER assume bucket structure from memory — ALWAYS download and check before uploading.**
**⚠ NEVER delete any file without first verifying nothing references it.**
`SYSNOVA/index.html` is the single source for all landings. Dev gets a banner injected via sed at upload time.

- `Sysnova.png` must exist in each bucket: root for live/live2/backup, `sandbox/` for dev.
- `deploy/landing.html` (full bucket) has no About box — it's a DB download page only.

## Dev Environment (`bim-ootb-dev`)

Separate bucket for testing changes before production. Zero blast radius.

**Dev URL:**
```
https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb-dev/o/index.html
```

**Local files:** `deploy/dev/` — working copy, always edit here, upload to bucket `sandbox/`.

**Path mapping (local → bucket):**
| Local file | Bucket object name | Why |
|---|---|---|
| `SYSNOVA/index.html` (+ sed banner for dev) | `index.html` | Landing page (root) |
| `deploy/dev/*.js` | `sandbox/*.js` | Viewer JS modules (always `sandbox/` in bucket) |
| `deploy/dev/index.html` | `sandbox/index.html` | Viewer HTML |
| `deploy/dev/boq_charts.html` | `sandbox/boq_charts.html` | Charts page (sandbox/, sibling of viewer) |
| `deploy/dev/mep_report.html` | `sandbox/mep_report.html` | MEP report (sandbox/, sibling of viewer) |
| `deploy/dev/locales/*.js` | `sandbox/locales/*.js` | Locale translations |
| `deploy/dev/rates/*.json` | `sandbox/rates/*.json` | Country rate templates |

**⚠ The bucket has NO `dev/` prefix.** Both dev and prod buckets use `sandbox/` for viewer files.
`deploy/dev/` is the LOCAL working directory — it maps to `sandbox/` in the bucket.
`deploy/live/` is the local PROD snapshot — reference only, do not edit directly.
`SYSNOVA/index.html` is the landing page source — upload directly (live) or with banner (dev).

```bash
# Deploy dev viewer (banner is in the file — upload as-is)
oci os object put --bucket-name bim-ootb-dev --file deploy/dev/index.html --name sandbox/index.html --content-type text/html --force

# Deploy dev viewer JS
oci os object put --bucket-name bim-ootb-dev --file deploy/dev/sitecam.js --name sandbox/sitecam.js --content-type application/javascript --force
oci os object put --bucket-name bim-ootb-dev --file deploy/dev/boq_charts.html --name sandbox/boq_charts.html --content-type text/html --force
oci os object put --bucket-name bim-ootb-dev --file deploy/dev/mep_report.html --name sandbox/mep_report.html --content-type text/html --force
```

**⚠ OCI Cache Rule:** OCI has no `Cache-Control` header. Browsers heuristic-cache aggressively — `curl` sees new content but the browser shows stale, even incognito. **Every deploy must bump `?v=N` in `index.html`** for any changed JS module. For `boq_charts.html`, `tools.js` appends `?v=Date.now()` automatically — but `tools.js` itself needs a `?v=N` bump in `index.html` to take effect. Chain: `index.html` (bump) → `tools.js` (fresh) → downstream (fresh).

### Deploy SOP (dev → production)

Steps 1–4 operate at OCI level. Step 5 syncs back locally so `deploy/live/` stays current.
**⚠ BEFORE ANY UPLOAD: download the target file from bucket, diff against local. NEVER overwrite blind.**

```
Step 1 — TEST        Run the gate. All must pass (exit 0).
                       a) node deploy/dev/tests/whitebox_regression.js   (§-tagged regression SOP)
                       b) node deploy/dev/test_all.js                    (LOCAL GATE — deterministic;
                          syntax, wiring, refactor-location, URL integrity. No network, no Playwright.)
                       c) node deploy/dev/s2XX_test.js                   (feature-specific)
                       NOTE: edit/run tests in deploy/dev/ ONLY — deploy/live/ is the prod snapshot.
Step 2 — MINIFY      Build deploy/min/ from deploy/dev/ (never edit min/ directly)
                       bash scripts/minify_viewer.sh
                       - Output: deploy/min/*.js  (45% smaller, what goes to OCI)
                       - Source: deploy/dev/*.js  (readable, always edit here)
Step 3 — SNAPSHOT    OCI copy: prod → backup  (save current live state)
                       a) sandbox/ prefix: bash scripts/oci_bucket_copy.sh bim-ootb-live bim-ootb-backup sandbox/
                       b) root index.html:  download from prod, upload to backup
Step 4 — DEPLOY      minify_viewer.sh --upload full  OR manual OCI upload from deploy/min/
                       a) sandbox/ JS: bash scripts/minify_viewer.sh --upload full
                          (combines Step 2+4 in one command)
                       b) root index.html:  upload SYSNOVA/index.html directly
                          - Command: oci os object put --bucket-name bim-ootb-live \
                              --file SYSNOVA/index.html --name index.html \
                              --content-type text/html --force
                          One artifact, one location. Durable, git-tracked, survives reboots.
Step 5 — SMOKE       Verify deploy before visual check.
                       a) node deploy/dev/test_all.js --live   (OCI sync + routing + Playwright;
                          drift here is expected until upload completes — confirms it cleared)
                       b) curl checks (all must pass):
                          curl -s -o /dev/null -w "%{http_code}" .../index.html   # must be 200
                          curl -s .../index.html | grep -c "DEV ENVIRONMENT"      # must be 0
                          curl -s .../index.html | grep -c "Drop IFC"             # must be ≥1
                          curl -s .../index.html | grep -c "loadManifest"         # must be ≥1
                       b) Open production URL on phone + desktop. Verify:
                          - NO "DEV ENVIRONMENT" banner visible
                          - Title bar shows "BIM OOTB" not "BIM OOTB — DEV"
                          - Building cards load from manifest
                          - Drop IFC zone visible
Step 6 — COMMIT      git add + commit.
                       - deploy/min/ is regenerated — no need to commit (gitignored or rebuilt on demand)
                       - git add deploy/dev/ SYSNOVA/ && git commit
```

**If broken after Step 4 — ROLLBACK (two commands):**
```bash
# Copy backup → prod (restore pre-deploy state)
bash scripts/oci_bucket_copy.sh bim-ootb-backup bim-ootb-live sandbox/

# Also restore root index.html from backup
TMPDIR=$(mktemp -d) && oci os object get --bucket-name bim-ootb-backup --name index.html --file "$TMPDIR/index.html" && \
  oci os object put --bucket-name bim-ootb-live --name index.html --file "$TMPDIR/index.html" --content-type text/html --force && rm -rf "$TMPDIR"

# Verify
curl -s -o /dev/null -w "%{http_code}" https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb-live/o/sandbox/index.html
curl -s -o /dev/null -w "%{http_code}" https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb-live/o/index.html
# Both must return 200
```
No git involved. Backup bucket IS the known-good version.

**Commands:**
```bash
# Step 1: Tests (local gate — must exit 0 before any upload)
node deploy/dev/tests/whitebox_regression.js
node deploy/dev/test_all.js        # LOCAL GATE (add --live in Step 5 for OCI/Playwright)
node deploy/dev/s211_test.js       # adjust per sprint

# Step 2: Minify dev → min
bash scripts/minify_viewer.sh

# Step 3: Snapshot prod → backup
bash scripts/oci_bucket_copy.sh bim-ootb-live bim-ootb-backup sandbox/

# Step 4: Deploy min → prod  (combines minify+upload in one command)
bash scripts/minify_viewer.sh --upload full
# Root-level files (if changed):
# oci os object copy --bucket-name bim-ootb-dev --source-object-name boq_charts.html \
#   --destination-bucket bim-ootb-live --destination-object-name boq_charts.html

# Step 5: Smoke test — verify BOTH endpoints + cache bust
# Landing:  https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb-live/o/index.html
# Viewer:   https://objectstorage.ap-kulai-2.oraclecloud.com/n/ax3cp6tzwuy2/b/bim-ootb-live/o/sandbox/index.html
# Hard refresh (Ctrl+Shift+R) to bypass browser cache.
# Check on phone too — mobile Safari caches aggressively.

# Step 6: Commit
git add deploy/dev/ SYSNOVA/
git commit -m "[SXXX] Description"

# Rollback (if Step 5 fails):
bash scripts/oci_bucket_copy.sh bim-ootb-backup bim-ootb-live sandbox/
```

**Knowing which version is live:**

The test suite (§13) computes a fingerprint of all sandbox files and compares local vs live.
```
LOCAL  1279e2cd2d5b  ← git: 85f01c6a [S210]
LIVE   6f85aad280c5  ← bim-ootb-live/sandbox/
```
Mismatch = drift. §9b lists exactly which files differ.

**Three buckets = three snapshots:**
- `bim-ootb-dev` = staging (tested, ready to go live)
- `bim-ootb-live` = production (what users see)
- `bim-ootb-backup` = last known-good production (taken before each deploy)

**Disaster scenarios:**
| Scenario | Recovery |
|----------|----------|
| Broken after deploy | `bash scripts/oci_bucket_copy.sh bim-ootb-backup bim-ootb-live sandbox/` |
| Partial copy (network cut) | Re-run the same copy command — idempotent, overwrites all |
| Browser serves stale version | Hard refresh (Ctrl+Shift+R), bump `?v=` query strings |
| Prod bucket lost | Copy from backup: `bash scripts/oci_bucket_copy.sh bim-ootb-backup bim-ootb-live` |
| Both prod + backup lost | All files in git (`deploy/dev/` + `SYSNOVA/`). Re-create bucket, upload from local |

No git restore needed for rollback. Git is the archive, OCI is the deployment layer.

## Building DB Integrity

**Single source of truth:** `/tmp/reextract/` → `deploy/buildings/` → OCI buckets.
All three must have the same file. Never upload from project root or ad-hoc locations.

**No duplication across buckets.** Each building DB exists once per bucket. Do not maintain
separate `_extracted.db` + `_library.db` — single DB only (S242).

**OCI edge cache:** Overwriting an OCI object does NOT invalidate edge cache. If you must
replace a file, rename the object (e.g. `Hospital_extracted.db` → `hospital.db`) and update
the landing page BUILDINGS config. Do not use `?v=` query hacks — they break sw.js.

**Anti-drift checklist (after any DB upload):**
1. Verify `deploy/buildings/{name}.db` matches source
2. Verify OCI Content-Length matches local `stat -c%s`
3. Verify landing page BUILDINGS config points to correct filename
4. If file was overwritten (not new), rename to bust edge cache

**Rules:**
- ALWAYS snapshot before deploy. No exceptions.
- Deploy what was tested. No cherry-picking.
- Rollback = one script: backup → prod. No git, no local files.
- Git commit (Step 5) is for the record, not for recovery.
- Smoke test = landing + viewer + phone. All three.

## PWA Offline Support (S243)

Spec: `prompts/S243_offline_pwa.md`. Branch: `full`. Bucket: `bim-ootb-live`.

**Deploy PWA files:**
```bash
oci os object put --bucket-name bim-ootb-live \
  --file deploy/dev/sw.js --name sandbox/sw.js --content-type "application/javascript" --force
oci os object put --bucket-name bim-ootb-live \
  --file deploy/dev/manifest.webmanifest --name sandbox/manifest.webmanifest --content-type "application/manifest+json" --force
oci os object put --bucket-name bim-ootb-live \
  --file deploy/dev/offline.html --name sandbox/offline.html --content-type "text/html" --force
oci os object put --bucket-name bim-ootb-live \
  --file deploy/dev/icons/icon-192.png --name sandbox/icons/icon-192.png --content-type "image/png" --force
oci os object put --bucket-name bim-ootb-live \
  --file deploy/dev/icons/icon-512.png --name sandbox/icons/icon-512.png --content-type "image/png" --force
```

Bump `CACHE_VERSION` in `sw.js` on every deploy.

## GitHub Pages Mirror (`ootb-dev`)

**URL:** `https://red1oon.github.io/ootb-dev/`

Short-URL alternative to OCI dev bucket. Serves viewer HTML/JS only — building DBs
remain on OCI `bim-ootb` bucket (fetched via absolute OCI URLs in `_prodBase`).

**Repo:** `github.com/red1oon/ootb-dev` (public, MIT)

**Structure:**
```
index.html              ← landing page (copy of deploy/dev/landing.html)
sandbox/index.html      ← viewer
sandbox/*.js            ← all viewer JS modules
sandbox/lib/            ← Three.js, sql-wasm, etc.
sandbox/locales/        ← 18 locale translations
sandbox/rates/          ← 17 country rate templates
```

**No `.db` files.** Buildings load from OCI `bim-ootb` bucket via `_prodBase` URL.

**Deploy:**
```bash
# From /tmp/ootb-dev (or wherever the repo is cloned):
rsync -av --exclude='*.db' --exclude='*.bin' --exclude='*.log' \
  --exclude='test-results/' --exclude='buildings/' --exclude='tests/' \
  deploy/dev/ /tmp/ootb-dev/
cp deploy/dev/landing.html /tmp/ootb-dev/index.html
rsync -av --exclude='*.db' --exclude='*.bin' --exclude='*.log' \
  --exclude='buildings/' deploy/dev/ /tmp/ootb-dev/sandbox/
cd /tmp/ootb-dev && git add -A && git commit -m "[SXXX] sync" && git push
```

**Advantages over OCI dev bucket:**
- Short URL (no `objectstorage.ap-kulai-2...` path)
- Global Fastly CDN (vs single OCI region)
- No MIME type flags needed (GitHub infers correctly)
- No idle-reclaim risk
- Deploys via `git push`

**Limitations:**
- 1GB repo size soft limit (currently ~50MB, no DBs)
- No server-side headers control (but not needed for static viewer)
- GitHub Pages rate-limits at ~100GB/month bandwidth
