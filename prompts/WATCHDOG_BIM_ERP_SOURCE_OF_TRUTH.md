# ⚠ DO NOT REMOVE — standing watchdog charge, not a one-off task
# Check this pattern in ANY session touching a Viewer/ERP pane, an HBA-family module, or erp/*.js /
# hr_bim_asset/*.js compile layer. Not a pre-emptive audit mandate — flag if scope naturally touches it.

## The rule
Where a bim-compiler Java/`.db` extraction output AND a real iDempiere AD table could both hold the same
fact, **the ERP AD table is the authority. The BIM/Java output is a migration SOURCE to seed FROM, never a
parallel store the app reads at runtime.**

## Origin (2026-07-03)
User doctrine call, decided live reviewing the HBA `§HBA-ERP-GOV` BOM lane. `hr_bim_asset/ad_bom.js` was
treating `m_bom`/`m_bom_line` (bim-compiler's transient Java output) as a live data source for the Viewer.
User's words: *"the DB or JS maybe deviating, that has to be set right at source... this is for exact mapping
to iDempiere."*

**Decided fix (scoped narrowly, not a full audit first) — ✅ DONE 2026-07-03, bim-ootb PR #626 MERGED
(`lane/hba-bom-erp`, Opus):**
1. ✅ `scripts/seed_hba_bom.js` seeds `pp_product_bom`/`pp_product_bomline` into `ad_seed.db` from the REAL IFC
   extraction (HHS's own `rel_contained_in_space`, 13 rooms/88 lines) + `AD_Ref_List 'B'`=BIM (AD_Reference
   347) + `M_Product` per room (IsBOM=Y)/element (Value=guid). EXACT MAPPING: every AD row PROTO-CLONED from a
   real row of the target table (no deviating enums — `componenttype='CO'`, `bomtype` FK-valid). The ERP is now
   the authority.
2. ✅ `AD_InfoWindow` BOM lens (id 7700000) mirroring the C_Attendance lens pattern.
3. ✅ `ad_bom.js` reframed to seed-builder + `readBom` lens-read; Java `m_bom` demoted to migration-source in
   the header. `viewer/hba_lens.js` `_regovern` reads `A._hbaBomSpec` via the lens.
Witnesses: `W-HBA-BOM-SEED` 6/6 (lens JOIN lossless 88/88, exact-map, idempotent) + `W-HBA-BOM-GOVERNED` 6/6 +
`W-HBA-ERP-GOVERN-WIRE` 5/5; suite 38/38. Side effect: tenancy `toProductRow` product governance completed
(room guid → real seeded M_Product). **The `ad_bom.js`-reads-Java-`m_bom` leak that triggered this watchdog is
closed.** The STANDING RULE above stays active for future modules.

## Open question — NOT settled, don't assume either way
**Q1 (deferred, undecided):** should this become a terse `docs/`-level doctrine file, peer to
`docs/WalkerDoctrine.md` (e.g. "BIM-Extraction-is-ERP-Centered"), so no future session re-introduces a
Java-owned store? The user's reply addressed scope (below) but did not explicitly confirm writing this doc.
Re-raise if this pattern recurs — don't assume it's settled either way.

**Q2 (decided):** fix narrowly now — just the BOM lane, not a full audit of every extraction output first.
**The audit itself was not cancelled, only deferred.** Named candidates still unaudited:
`library/component_library.db` and `library/archive/building_BOM.db` (both bim-compiler). Flag these if a
session's scope naturally touches them; don't go looking pre-emptively.

## How to apply
In any session touching `erp/*.js`, `hr_bim_asset/*.js`, or a Viewer/ERP pane: check whether it reads a
bim-compiler `.db`/Java-pipeline output directly at runtime instead of a seeded `ad_seed.db` AD table. If so,
flag it explicitly using this same frame (ERP-native table = authority, BIM output = migration source only) —
don't treat it as normal just because it works today.

Relates: `docs/internal/IDEMPIERE_2.md` §pivot / the "ERP end-state = ONE iDempiere base" doctrine (same
"one authoritative store, others are migration sources" shape, applied ERP↔ERP there, BIM↔ERP here) and the
"Compile not Model" doctrine this extends. Spec: `prompts/RESUME_HBA_ERP_GOVERNED_DISPLAY.md` §BOM-ERP-CENTERED
(the BOM lane closeout) — Stage-2 done, BOM lane ✅ done (PR #626). Next slice: Stage 3 BOM pane + live smoke.
