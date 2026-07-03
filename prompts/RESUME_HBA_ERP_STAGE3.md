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
**`C_Attendance` is not a real iDempiere table.** `SELECT * FROM AD_Table WHERE TableName LIKE '%ttendance%'`
→ **0 rows** in `ad_full.db`; no physical `c_attendance` in the real dictionary. HBA Stage 1 **invented** it:
`ad_seed.db` carries `AD_Table 7000000 'C_Attendance'` + a physical `c_attendance` (7 rows) + `ad_infowindow
7600000` lens — a PRIME RULE violation already shipped in #621/#622. Building Stage 3's Presence pane on top
of it would cement a fictitious table into the read path. Per `WATCHDOG_BIM_ERP_SOURCE_OF_TRUTH.md`, an
invented AD table is the same violation class as a Java store shadowing an AD table. (The user directed
`C_Attendance` in an earlier §Q-RESOLUTION Q3, but that predates the native fit below — this supersedes it.)

**Real native equivalent: `S_Resource` + `S_ResourceAssignment`** — the "Mary Consultant" GardenWorld pattern,
a literal seeded row (`S_Resource_ID=100, Name='Mary Consultant', M_Warehouse_ID=103, S_ResourceType_ID=100`)
sitting unused in the same DB. Field mapping, all verified live against the schema:

| Attendance need | Native column | Verified |
|---|---|---|
| person identity | `S_Resource.ad_user_id → AD_User` | ✅ consistent with how `ad_payroll.js`/`models.js` already resolve employees — C_Attendance's direct C_BPartner FK was the inconsistent path |
| building | `S_Resource.m_warehouse_id → M_Warehouse` (HHS 990000) | ✅ same FK `ad_tenancy.js` resolves onto |
| check-in/check-out | `S_ResourceAssignment.assigndatefrom`/`assigndateto` (NULL `assigndateto` = OPEN session — the exact semantic `ad_attendance.js` hand-rolled) | ✅ |
| hours worked | `S_ResourceAssignment.qty` | ✅ |
| approval / maker-checker | `S_ResourceAssignment.isconfirmed` | ✅ ties into the kernel audit's "self-asserted actor" question |
| shift schedule | `S_ResourceType.onmonday…/timeslotstart/end/istimeslot` | ✅ attendance had NO schedule model before |
| billable fallout | `S_TimeExpenseLine.s_resourceassignment_id → C_OrderLine/C_InvoiceLine` | ✅ attendance becomes invoiceable time — the actual point of the Mary-Consultant pattern |

**The ONE open decision (mastermind/user — everything else below is mechanical): room granularity.**
`S_ResourceAssignment` has NO `m_locator_id`/room column (verified) — the native model is *person @ building,
from→to, hours, confirmed, billable*; it does not natively carry "in which room." The invented `C_Attendance`
forced an `M_Locator` FK; the native tables don't.
- **Recommendation (accept unless told otherwise):** keep the ERP-governed facts (person/time/hours/confirmed/
  billable) on `S_ResourceAssignment`; the **zone/room stays a BIM spatial-overlay fact**, keyed by
  person+timestamp — exactly where it already lives (`attendance.js`'s signed op-log `zone` param). Mirrors
  the BOM-lane boundary (pure geometry stays BIM-native, keyed by identity). Presence-by-zone reads the BIM
  op-log for the room and `S_ResourceAssignment` for the governed time — an honest split, not a fabricated FK.
- Only re-open if room-level presence must become an ERP fact — that needs its own real mechanism, not a
  bolt-on column.

**0. Retarget the seed + compile layer onto the real tables** before wiring any pane (design is done here;
execution = Fable5 once the room-granularity call is confirmed; escalate to Opus only if delegating to
`occupancy.js` proves entangled):
   - **Retire the invention** (`scripts/seed_hba_erp.js` §5-7): Ninja-rollback the staged `C_Attendance`
     (`SET IsActive='N' WHERE AD_Table_ID>=7000000` idiom), drop the physical `c_attendance` table + the
     `ad_infowindow 7600000` lens + its `ad_infocolumn` rows.
   - **Replace with**: `S_Resource` one per HBA person (`ad_user_id`=seeded AD_User 1/2, `m_warehouse_id`=990000,
     `s_resourcetype_id`=reuse Mary's type 100 or mint an "Employee" type via the same idiom `occupancy.js`
     already uses for "Room" — proto-clone from the real `S_Resource 100` row, exact map) + `S_ResourceAssignment`
     one per check-in session (`assigndatefrom`=in, `assigndateto`=out|NULL, `qty`=hours, `isconfirmed`,
     proto-cloned from a real assignment row) + a NEW `AD_InfoWindow` lens over
     `S_ResourceAssignment ⋈ S_Resource ⋈ AD_User ⋈ M_Warehouse` replacing 7600000.
   - **`hr_bim_asset/ad_attendance.js`**: retarget `compileAttendance` to emit `S_ResourceAssignment` rows
     (NOT `C_Attendance`). **Likely a big simplification — DELEGATE to `occupancy.js`'s existing witnessed
     `toResourceAssignmentRow`/`toResourceRow`** (already native S_Resource/S_ResourceAssignment for rooms):
     attendance is the SAME tables with a person-type resource. Don't duplicate the builder.
   - **`viewer/hba_lens.js` `_regovern`**: `A._hbaAttendanceSpec` from the S_ResourceAssignment path + the new lens.
   - **Witnesses** prove the retarget, not just a rename: `witness_ad_attendance.js` (real S_Resource/
     S_ResourceAssignment FK chain resolves, `isconfirmed` reads, old `C_Attendance` path gone — RED-before/
     GREEN-after), `witness_erp_governed.js`/`witness_erp_govern_wire.js` (the `C_Attendance 7/7` asserts →
     assignment count). `witness_ad_occupancy.js` already holds the real S_ResourceAssignment REAL_COLS list —
     reuse it. Keep the full `hr_bim_asset` suite green.
   - Additive/isolated to the attendance slice — does NOT touch payroll, tenancy, or the BOM lane (those
     already resolve on `AD_User`/`M_Warehouse` correctly). Ships as a new PR off fresh origin/main (do NOT
     reuse merged lane branches). Impact files: `scripts/seed_hba_erp.js`, `hr_bim_asset/ad_attendance.js`,
     its 3 witnesses, `viewer/hba_lens.js` (_regovern), the InfoWindow lens rows.

## Stage 3 — DO (each item: spec → implement → §-log witness → mark DONE)
1. **Presence drawer reads the (retargeted) S_ResourceAssignment lens** — once the room-granularity call
   above is confirmed. `viewer/hba_lens.js openPresenceDrawer` currently folds `attendance.js`'s raw op-log.
   Retarget it to read the governed `S_Resource`/`S_ResourceAssignment` rows (via `A.erpQuery`, mirroring the
   `ad_infowindow` JOIN pattern, off the new InfoWindow replacing 7600000). Keep the honest-open (NULL
   checkout) + fly-to-zone (the zone itself stays the BIM op-log fact, per the room-granularity call).
2. **NEW BOM pane off `A._hbaBomSpec`.** Add a FAMILY drawer entry (like `tenancy`/`payslip`) → a pane that
   renders `ad_bom.readBom` assemblies→components (room = assembly, contained elements = lines, QtyBOM). Detect
   gates on `A._hbaBomSpec.assemblies.length`. Mirror `viewer/hba_tenancy.js` structure. Deep-link each row via
   the existing `erpLink` idiom if a real AD_Window exists (else omit — don't fabricate).
3. **Spot-check every pane** consumes `A._hba*Spec` (governed) not a residual literal once `_regovern` runs.
4. **LIVE headless-Chrome smoke (the one node can't cover).** Open `viewer/viewer.html` on HHS, wait for
   `§HBA_GOVERN on … warehouse=990000 C_Attendance=7/7 BOM=13 assemblies` (log line naming may shift once the
   attendance retarget lands — update the wait-string accordingly), assert 0 console errors + the panes
   render the governed data. This is the real-user-path gate ([[feedback_test_real_user_path_not_seams]]).

## Open flags (not blocking Stage 3)
- §P11 deep-link windows **53042 / 316 / 53036** have NO `AD_Window` rows in ad_seed.db — those deep-links
  can't render in the browser ERP until seeded (Stage-1 leftover).
- Deferred audit (watchdog): `library/component_library.db`, `library/archive/building_BOM.db` for other
  Java-owned stores that could shadow an AD table — flag only if a session's scope touches them.
- Doctrine-promotion question (watchdog): whether to promote the ERP-centered rule to a formal `docs/`
  doctrine file peer to `WalkerDoctrine.md` — still undecided, re-raise if the pattern recurs.

## Full spec + closeouts
`prompts/RESUME_HBA_ERP_GOVERNED_DISPLAY.md` (bim-ootb-side; §STAGE1-DONE / §STAGE2-DONE / §BOM-ERP-CENTERED).
Memory: [[project_hba_erp_governed_display]] · doctrine [[project_erp_one_base_doctrine]].
Witnesses to keep green: `node hr_bim_asset/tests/witness_*.js` (38 files). Re-seed if ad_seed.db is rebuilt:
`node scripts/seed_hba_erp.js` then `node scripts/seed_hba_bom.js` (both idempotent, self-witnessing).
