# Posting-Preview — deploy-staging copies (canonical home = bim-ootb/erp)
Durable backup of the bim-ootb-side Posting-Preview lane (worktree /tmp/wt-preview is ephemeral).
Spec + # DONE: prompts/POSTING_PREVIEW_PANEL.md · memory: project_posting_preview.md
- erp_preview.js              → bim-ootb/erp/erp_preview.js  (the seam; sql.js facade + gate + reuse AcctsPosted)
- poc_posting_preview.js      → bim-ootb/erp/tests/  (5-§ witness, dual-db: ad_seed gate + glassbowl derive)
- poc_preview_demo.js         → bim-ootb/erp/tests/  (5-§ witness, SINGLE merged preview_demo.db — live load path)
- make_preview_demo_db.js     → regen preview_demo.db = glassbowl_data.db + ad_role(from ad_full.db)
Also needs (already in scripts/, durable): doc_poster.js, post_resolver.js (UMD tail).
Run witnesses: cd bim-ootb/erp && NODE_PATH=../node_modules node tests/poc_posting_preview.js  (exit 0, all 5 §)
DEPLOY is GO-gated (§9): ship preview_demo.db + mount openPreview into crud_overlay E3 + pill + sw bump off fresh origin/main.
