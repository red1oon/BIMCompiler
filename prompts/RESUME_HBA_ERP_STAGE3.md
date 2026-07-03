# ⚠ DO NOT REMOVE — RESUME: HBA ERP-governed display, Stage 3 (render read-through-lens) + live smoke
# Scope: wire the HBA panes/drawers to READ the seeded iDempiere data THROUGH the AD_InfoWindow lenses; then a
# live headless-Chrome smoke of the async governance path. Read the log after every run. Honour until DONE.
# Model: Fable5 (execution, well-specified) per [[feedback_model_allocation_mastermind_vs_execution]].

## Where the lane stands (all MERGED to bim-ootb main, 2026-07-03)
- **Stage 1** (#621) — real seed rows in `erp/ad_seed.db`: M_Warehouse 990000 `HHS_Office_Federated`, 14
  M_Locator, C_BPartner 1001/1002 + AD_User 1/2, HR_* physical tables + payroll rows (gross 5200/net 4234),
  Ninja C_Attendance + `ad_infowindow 7600000` lens.
- **Stage 2** (#622, Opus) — compile layer reads real rows via an injected sync `erpQuery` seam with
  byte-identical literal fallback. `viewer/hba_lens.js` `_ensureErpGovern`→`_regovern` lazy-loads ad_seed.db →
  `A.erpQuery` and re-compiles the governed specs. Produces: `A._hbaPayrollSpec` (_governed), `A._hbaTenancySpec`
  (warehouse 990000), `A._hbaAttendanceSpec` (C_Attendance rows).
- **§BOM-ERP-CENTERED** (#626, Opus) — BIM BOM LIVES in native `pp_product_bom`/`pp_product_bomline` (seeded by
  `scripts/seed_hba_bom.js` from real IFC `rel_contained_in_space`; `AD_Ref_List 'B'`; `ad_infowindow 7700000`
  BOM lens). `ad_bom.readBom(erpQuery)` is the lens read; `_regovern` produces `A._hbaBomSpec` (13 assemblies).
- Doctrine: `prompts/WATCHDOG_BIM_ERP_SOURCE_OF_TRUTH.md` — ERP AD table = authority, BIM/Java output =
  migration source. hr_bim_asset suite **38/38 green**. ad_seed.db is the authority; panes are lenses.

## ⛔ PREREQUISITE — do this BEFORE item 1 (watchdog finding, 2026-07-03, verified live against docker `idempiere` DB)
**`C_Attendance` is not a real iDempiere table.** `SELECT tablename FROM ad_table WHERE name ILIKE
'%ATTENDANCE%'` → **0 rows** against the live `postgres`-container `idempiere` schema. Stage 1's "Ninja-staged
C_Attendance" was invented, not extracted — a PRIME RULE violation already shipped in #621/#622. Building
Stage 3's Presence lens on top of it would cement a fictitious table into the read path.

**Real native equivalent: `S_Resource` + `S_ResourceAssignment`** (the "Mary Consultant" GardenWorld pattern —
a literal seeded row, `s_resource_id=100, value=Mary, name="Mary Consultant", m_warehouse_id=103`, sitting
unused in the same DB). Field mapping, all verified via `\d` against the live schema:
| Attendance need | Native column |
|---|---|
| check-in/check-out | `S_ResourceAssignment.assigndatefrom` / `assigndateto` (NULL `assigndateto` = open session) |
| hours worked | `.qty` |
| approval / maker-checker | `.isconfirmed` |
| person identity | `S_Resource.ad_user_id` → real `AD_User` (consistent with how `ad_payroll.js`/`models.js` already resolve employees — C_Attendance's direct C_BPartner FK was a separate, inconsistent join path) |
| building/location | `S_Resource.m_warehouse_id` → same `M_Warehouse` FK `ad_tenancy.js` already resolves HHS onto (990000) |
| shift schedule | `S_ResourceType` day-of-week + time-slot flags — attendance had no schedule model before |
| billable fallout | `S_TimeExpenseLine.s_resourceassignment_id` → `C_OrderLine`/`C_InvoiceLine` (free, matches the Mary-Consultant demo pattern) |

**0. Retarget the seed + compile layer onto the real tables** before wiring any pane:
   - Re-seed Stage 1's attendance rows as `S_Resource` (per employee, `ad_user_id` + `m_warehouse_id`) +
     `S_ResourceAssignment` (per session) instead of the invented `C_Attendance` — same script
     (`scripts/seed_hba_erp.js`), same idempotent/self-witnessing discipline.
   - `hr_bim_asset/ad_attendance.js`: `compileAttendance` reads/writes `S_ResourceAssignment` rows, resolves
     employee via `S_Resource.ad_user_id`, keeps the honest-open (NULL `assigndateto`)/honest-skip behavior.
   - New/updated witness proves the retarget, not just a rename: assert the real `S_Resource`/`S_ResourceAssignment`
     FK chain resolves, `isconfirmed` reads correctly, and the old `C_Attendance` path is gone (no residual
     reference). RED-before (current `C_Attendance` reads) / GREEN-after.
   - This is additive/isolated to the attendance slice — does NOT touch payroll, tenancy, or the BOM lane
     (those already resolve on `AD_User`/`M_Warehouse` correctly and are unaffected).

## Stage 3 — DO (each item: spec → implement → §-log witness → mark DONE)
1. **Presence drawer reads the (retargeted) S_ResourceAssignment lens.** `viewer/hba_lens.js
   openPresenceDrawer` currently folds `attendance.js`'s raw op-log. Retarget it to read the governed
   `S_Resource`/`S_ResourceAssignment` rows (via `A.erpQuery`, mirroring the `ad_infowindow` JOIN pattern —
   add a new InfoWindow if 7600000 was defined against C_Attendance). Keep the honest-open (NULL checkout) +
   fly-to-zone.
2. **NEW BOM pane off `A._hbaBomSpec`.** Add a FAMILY drawer entry (like `tenancy`/`payslip`) → a pane that
   renders `ad_bom.readBom` assemblies→components (room = assembly, contained elements = lines, QtyBOM). Detect
   gates on `A._hbaBomSpec.assemblies.length`. Mirror `viewer/hba_tenancy.js` structure. Deep-link each row via
   the existing `erpLink` idiom if a real AD_Window exists (else omit — don't fabricate).
3. **Spot-check every pane** consumes `A._hba*Spec` (governed) not a residual literal once `_regovern` runs.
4. **LIVE headless-Chrome smoke (the one node can't cover).** Open `viewer/viewer.html` on HHS, wait for
   `§HBA_GOVERN on … warehouse=990000 C_Attendance=7/7 BOM=13 assemblies`, assert 0 console errors + the panes
   render the governed data. This is the real-user-path gate ([[feedback_test_real_user_path_not_seams]]).

## Open flags (not blocking Stage 3)
- §P11 deep-link windows **53042 / 316 / 53036** have NO `AD_Window` rows in ad_seed.db — those deep-links
  can't render in the browser ERP until seeded (Stage-1 leftover).
- Deferred audit (watchdog Q2): `library/component_library.db`, `library/archive/building_BOM.db` for other
  Java-owned stores that could shadow an AD table — flag only if a session's scope touches them.
- Q1 (watchdog): whether to promote the ERP-centered rule to a formal `docs/` doctrine file peer to
  `WalkerDoctrine.md` — still undecided, re-raise if the pattern recurs.

## Full spec + closeouts
`prompts/RESUME_HBA_ERP_GOVERNED_DISPLAY.md` (bim-ootb-side; §STAGE1-DONE / §STAGE2-DONE / §BOM-ERP-CENTERED).
Memory: [[project_hba_erp_governed_display]] · doctrine [[project_erp_one_base_doctrine]].
Witnesses to keep green: `node hr_bim_asset/tests/witness_*.js` (38 files). Re-seed if ad_seed.db is rebuilt:
`node scripts/seed_hba_erp.js` then `node scripts/seed_hba_bom.js` (both idempotent, self-witnessing).
