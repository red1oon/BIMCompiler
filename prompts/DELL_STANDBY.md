# ⚠ DO NOT REMOVE — scope: standby/backup machine handoff. Read the log after every run.

# DELL STANDBY: read, take notes, DO NOTHING YET

This Dell is the backup for red1's primary machine (Victus). If red1 later says "resume" or
"the Victus failed", follow the notes below. Until then: save these notes and reply only "noted".
Do not clone, install, push, or upload anything unprompted.

## Repos (GitHub, SSH remotes)
- bim-compiler: git@github.com:red1oon/BIMCompiler.git (default branch: master)
- bim-ootb:     git@github.com:red1oon/bim-ootb.git (default branch: main)
- idempiere-dev-setup (local clone of the legacy iDempiere, used as the oracle)

## Hard rules (from CLAUDE.md, which comes with the repo)
- Read bim-compiler/CLAUDE.md and ~/.claude/CLAUDE.md first. They override defaults.
- GitHub LFS is OFF (quota exhausted until 2026-11-01). Do not enable it; no --no-verify.
  Set this up BEFORE the first clone:
    git config --global filter.lfs.smudge "git-lfs smudge --skip -- %f"
    git config --global filter.lfs.process "git-lfs filter-process --skip"
    git config --global lfs.fetchexclude "*"
  LFS files appear as small pointer stubs. This is expected.
- One clone per repo. Run `git worktree list` before any `git worktree add`.
- Never touch deploy/live/. Dev work goes in deploy/dev/ only.
- Every `oci os object put` needs --content-type. Building DBs are gzip-uploaded with
  --content-encoding gzip. Read deploy/OCI_UPLOAD.md §RULES before any upload.
- DB changes ship as migration scripts plus a self-heal loader. Never commit .db binaries.

## Resume procedure (only when asked)
1. Install: git, git-lfs (skip mode as above), node, java/maven, python3, sqlite3, oci-cli, gh.
2. Auth: ask red1 for the SSH key and `gh auth login`. Ask for the OCI config/key
   (~/.oci/config, oci_api_key.pem), copied over a secure channel, never via git.
3. Clone both repos, `git fetch --all`, list remote branches, read
   prompts/TEAMWORK_FRAMEWORK.md ▶ RESUME HERE and PROGRESS.md "Current State".
4. Restore Claude config and memory. NOT in git. red1 must supply an archive of
   ~/.claude/{CLAUDE.md,settings.json,hooks,skills} and
   ~/.claude/projects/-home-red1-bim-compiler/memory/. Do not recreate them from guesses.
5. Databases are NOT in git. Pull from OCI buckets bim-ootb, bim-ootb-dev, bim-ootb-backup,
   bim-ootb-live (see deploy/OCI_UPLOAD.md). Objects are gzip: `zcat` before sqlite3.
   A _meta.db/_geo.db pair must come from the same build as its _extracted.db.
   Treat build/erp/*.db as regenerable from migration/*.sql and the seed scripts. Verify
   before assuming they are missing.
6. Verify: ./scripts/run_RosettaStones.sh classify_{prefix}.yaml and the §-witness scripts.
   Read the logs, not just the exit code.

## OCI BACKUP (uploaded 2026-10-28, md5-verified after download)
Bucket `bim-ootb-backup`, prefix `victus-backup/2026-10-28/` (MANIFEST.md5 in the same folder):
- `repo_ignored_files.tar.gz` (222 MB): the git-ignored files of bim-compiler. Extract at the repo root.
  Holds library/component_library.db, LOD400.db, disc_patterns.db, *_BOM.db, work_building_*.db,
  deploy/dev/buildings/Duplex_rooms_*.db, build/Duplex_mep_*.db, database/enhanced_federation_GI.db,
  Stacked_Duplex.db, Hospital_new.db, build/erp/*.db and shards/*.db, docs/internal/guidepics,
  docs/glassbowl_data.db, the DISC_Walker miniset DB, .claude/settings.local.json and .claude/hooks.
- `claude_config_memory.tar.gz`: ~/.claude/{CLAUDE.md,settings.json,hooks,skills} plus the project memory dir.
  Extract with `tar -xzf ... -C ~` (review settings.json for machine-specific paths first).
- `projects_small.tar.gz`: ~/Projects/Dubai and ~/Projects/red1_plugins. Extract with `-C ~/Projects`.
- `halal.bundle`: `git clone halal.bundle ~/Projects/halal` (the repo has no remote).
- `ninja_dirty.diff`: uncommitted changes in ~/Projects/org.idempiere.ninja; apply with `git apply` after cloning it.
Fetch: `oci os object get --bucket-name bim-ootb-backup --name victus-backup/2026-10-28/<file> --file <file>`,
then `md5sum -c MANIFEST.md5`.
NOT backed up (too big or regenerable): ~/Projects/ThaiGoldPawn (1.6 GB), halal working files (1.5 GB),
BIM_DB (2.5 GB), internal/UNMERGED (1.4 GB), internal/sources, library/archive (incl. 590 MB sandbox_1M),
output/archive, logs/, venvs, node_modules. The big building DBs already live in the main OCI buckets.
NOT included on purpose: ~/.oci keys, SSH keys, gh auth. red1 supplies those separately.

## KNOWN GAPS (snapshot 2026-10-28). Work NOT on GitHub; do not assume it is there
The Victus had ~33 bim-compiler and ~37 bim-ootb commits on branches with no remote ref
(some may be squash-merged, some are real). Examples: backup/ninja-xtab2-pre-scrub,
resolve/pr91-merge, docs/ninja-excel-report-manual, fix/erp-seed-forms-valrules,
fix/disc-walker-path-legal-*, feat/erp-parity-p2p1-docs (bim-compiler);
demo/parts-combined, dxf2bim-l15-complete, feat/occupant-pathfinder,
test/staged-draw-census (bim-ootb).
Also untracked on the Victus: scripts/film_replication_engine/, scripts/witness_scriptor_scale.js,
and 16 stashes across the two repos.
Outside git: ~/Projects/{Dubai, ThaiGoldPawn, halal, BIM_DB, red1_plugins}. halal has 2 commits, no remote.
The local DBs that had no OCI copy are now in the OCI BACKUP above.
Unpushed git branches are still NOT backed up unless red1 says they were pushed.
If something the docs mention is missing, say so plainly. Do not recreate, invent or guess it.
Ask red1 whether the Victus is reachable. red1 may have closed some gaps since; ask first.
Update or delete this section once the gaps are closed.

## Behaviour
Be concise. Extract, don't invent. Report what is missing instead of papering over it.
