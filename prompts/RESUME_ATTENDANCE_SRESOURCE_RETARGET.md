# ⚠ DO NOT REMOVE — RESUME: retarget HBA Attendance off the INVENTED C_Attendance onto native S_Resource
# Scope: fix a shipped PRIME-RULE violation BEFORE Stage 3 builds a Presence pane on the fake table. Spec only —
# read the log after every run, honour until DONE. Kernel-tier (silent, load-bearing), not lint.
# BLOCKS: prompts/RESUME_HBA_ERP_STAGE3.md item 1 (Presence drawer read-through-lens) — do this first.

## The finding (watchdog, VERIFIED live against ad_full.db = the iDempiere mirror, 2026-07-03)
**`C_Attendance` is not a real iDempiere table.** `SELECT * FROM AD_Table WHERE TableName LIKE '%ttendance%'`
→ **0 rows** in `ad_full.db`; no physical `c_attendance`. HBA Stage 1 **Ninja-INVENTED** it: `ad_seed.db`
carries `AD_Table 7000000 'C_Attendance'` + a physical `c_attendance` (7 rows) + `ad_infowindow 7600000` lens.
Per the standing doctrine (`prompts/WATCHDOG_BIM_ERP_SOURCE_OF_TRUTH.md`) an invented AD table is the same
class of violation as a Java store shadowing an AD table — **extract, never invent.** The user directed
`C_Attendance` in §Q-RESOLUTION Q3, but that was before the native fit below was known; this supersedes it.

**The real native model — `S_Resource` + `S_ResourceAssignment` — fits attendance better than the invention.**
Verified columns (ad_full.db) + the seeded `Mary Consultant` template (`S_Resource_ID=100, Name='Mary
Consultant', M_Warehouse_ID=103, S_ResourceType_ID=100`):

| Attendance need | Native column | Verified |
|---|---|---|
| person identity | `S_Resource.ad_user_id → AD_User` | ✅ (consistent with ad_payroll/models AD_User path; C_Attendance's direct C_BPartner FK was the inconsistent one) |
| building | `S_Resource.m_warehouse_id → M_Warehouse` (HHS 990000) | ✅ same FK ad_tenancy resolves |
| check-in / check-out | `S_ResourceAssignment.assigndatefrom / assigndateto` (NULL `assigndateto` = OPEN session — the exact semantic ad_attendance.js hand-rolled) | ✅ |
| hours worked | `S_ResourceAssignment.qty` | ✅ |
| approval / maker-checker | `S_ResourceAssignment.isconfirmed` | ✅ (ties into the kernel audit's "self-asserted actor" question) |
| shift schedule | `S_ResourceType.onmonday…/timeslotstart/end/istimeslot` | ✅ (attendance had NO schedule model before) |
| billable fallout | `S_TimeExpenseLine.s_resourceassignment_id → C_OrderLine/C_InvoiceLine` | ✅ attendance becomes invoiceable time — the actual point of the Mary-Consultant pattern |

## The ONE open decision (mastermind/user — everything else is mechanical)
**Q1 — room granularity.** `S_ResourceAssignment` has NO `m_locator_id`/room column (verified). So the native
model is *person @ building, from→to, hours, confirmed, billable* — it does NOT natively carry "in which room."
The invented `C_Attendance` forced an `M_Locator` FK; the native tables don't.
- **Recommendation (accept):** keep the ERP-governed facts (person/time/hours/confirmed/billable) on
  `S_ResourceAssignment`; the **zone/room stays a BIM spatial-overlay fact** keyed by person+timestamp — exactly
  where it always lived (`attendance.js`'s signed op-log `zone` param). This mirrors the BOM-lane boundary
  (pure geometry stays BIM-native, keyed by identity). Presence-by-zone reads the BIM op-log for the room and
  `S_ResourceAssignment` for the governed time — an honest split, more correct than a fabricated room FK.
- Only re-open if the user wants room-level presence to be an ERP fact — then it needs its own real mechanism,
  not a bolt-on column.

## The retarget (once Q1 confirmed — Fable5 execution; the design here is complete)
1. **Retire the invention (seed_hba_erp.js §5/§6/§7).** Ninja-rollback the staged `C_Attendance`
   (`SET IsActive='N' WHERE AD_Table_ID>=7000000` idiom) + drop the physical `c_attendance` + `ad_infowindow
   7600000` + its `ad_infocolumn` rows. Replace with:
   - `S_Resource` one per HBA person (`ad_user_id`=the seeded AD_User 1/2, `m_warehouse_id`=990000,
     `s_resourcetype_id`= a person/consultant type — reuse Mary's type 100 or mint an "Employee" type via the
     SAME idiom occupancy.js already uses for "Room"). Proto-clone from the real `S_Resource 100` row (exact map).
   - `S_ResourceAssignment` one per check-in session (`assigndatefrom`=in, `assigndateto`=out|NULL, `qty`=hours,
     `isconfirmed`), proto-cloned from a real assignment row.
   - a NEW `AD_InfoWindow` lens over `S_ResourceAssignment ⋈ S_Resource ⋈ AD_User ⋈ M_Warehouse` (who/building/
     when/hours/confirmed) — replaces the 7600000 C_Attendance lens.
2. **`hr_bim_asset/ad_attendance.js`** — retarget `compileAttendance` to emit `S_ResourceAssignment` rows (NOT
   C_Attendance). **Likely a big simplification: DELEGATE to `occupancy.js`'s existing witnessed
   `toResourceAssignmentRow`/`toResourceRow`** (already native S_Resource/S_ResourceAssignment for rooms) —
   attendance = the SAME tables with a person-type resource. Don't duplicate the builder.
3. **`viewer/hba_lens.js` `_regovern`** — `A._hbaAttendanceSpec` from the S_ResourceAssignment path + the new lens.
4. **Witnesses** — `witness_ad_attendance.js` (retarget the non-invent gate to real S_ResourceAssignment cols),
   `witness_erp_governed.js` / `witness_erp_govern_wire.js` (the `C_Attendance 7/7` asserts → assignment count),
   the seed self-witness. `witness_ad_occupancy.js` already holds the real S_ResourceAssignment REAL_COLS list —
   reuse it. Keep the full `hr_bim_asset` suite green.

## Impact / files
`scripts/seed_hba_erp.js` (§5-7 rewrite + retire Ninja C_Attendance), `hr_bim_asset/ad_attendance.js`,
`hr_bim_asset/tests/witness_ad_attendance.js` + `witness_erp_governed.js` + `witness_erp_govern_wire.js`,
`viewer/hba_lens.js` (_regovern), the InfoWindow lens rows. Occupancy stays as-is (rooms); attendance JOINS the
same tables with a person resource-type. `ad_seed.db` is re-seeded (idempotent). Ships as a new PR off fresh
origin/main (do NOT reuse merged lane branches).

## Assignment & why now
Design = DONE here (native model verified, only Q1 needs a yes). Execution = **Fable5** once Q1 confirmed;
escalate to Opus only if the delegation-to-occupancy refactor proves entangled. **Do this BEFORE Stage 3** — a
read-through Presence pane built on the fake `C_Attendance` would cement the violation. Bonus unlocked: billable
time via `S_TimeExpenseLine` (future slice). Full lane context: `prompts/RESUME_HBA_ERP_GOVERNED_DISPLAY.md`,
memory [[project_hba_erp_governed_display]], doctrine [[project_erp_one_base_doctrine]] /
`prompts/WATCHDOG_BIM_ERP_SOURCE_OF_TRUTH.md`.
