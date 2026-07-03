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

**Decided fix (scoped narrowly, not a full audit first):**
1. Seed `pp_product_bom`/`pp_product_bomline` into `ad_seed.db` from a compiled building's real elements
   (reusing `ProductRegistrar`'s `M_Product` ids) + add the `AD_Ref_List 'B'` value — the ERP becomes the
   authority.
2. An `AD_InfoWindow` lens row for the BOM JOIN, mirroring the `C_Attendance` lens pattern from HBA Stage 1/2.
3. `ad_bom.js` reframed to seed-builder + lens-read only; Java `m_bom` explicitly marked migration-source,
   not a live dependency.

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
"Compile not Model" doctrine this extends. Spec: `prompts/RESUME_HBA_ERP_GOVERNED_DISPLAY.md` (bim-ootb) —
Stage-2-done, this BOM lane is the next slice.
