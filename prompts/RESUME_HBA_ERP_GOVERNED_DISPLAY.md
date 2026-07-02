<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — RESEARCH SPEC: ERP-governed display for HBA (HHS pilot)

**Scope:** research + design only. No code changes have been made against this spec yet. Do not implement
until §OPEN-QUESTIONS below is resolved (Sonnet+user dialogue) — this is Stage 0 work, not Stage 1+.

**Status: ✅ STAGE 1 DONE (2026-07-03, Fable5) — see §STAGE1-DONE at the bottom. Stage 2 (compile-layer, Opus) is next.**
Original research status when this spec was written: 🔎 RESEARCH DONE, DECISION PENDING (2026-07-03). Investigated with a read-only Explore agent
against `~/bim-ootb` + direct sqlite queries against `build/erp/ad_full.db` (the real iDempiere AD dictionary)
and `~/bim-ootb/erp/ad_seed.db` (the seed data currently loaded). Every claim below is cited file:line or a
live query result — nothing invented, per PRIME RULE.

## §CONVENTION — what's being proposed (user, 2026-07-02/03)

> "All data models that has ERP connection to be governing its display" — for HHS specifically: the building
> exists in `M_Warehouse` (matched by Name and Value), HR Payroll has a `C_BPartner` record linked through
> `AD_User`, which exists in `C_Attendance` etc.

Restated precisely: **pane DISPLAY data (not just the deep-link target) should be derived from a real,
queryable iDempiere AD relational chain — building→warehouse, person→BPartner→user, presence/payroll→their
real AD tables — instead of a JS literal fixture that merely has the same shape.**

This is the natural next step of the existing "Compile not Model" doctrine
([[project_hba_compile_not_model]]) — §P10d/§P11 made the LINK real (deep-links resolve to genuine
`AD_Window_ID`s sourced from `ad_full.db`). This proposal makes the DESTINATION DATA real too, not just the
address you jump to.

**One correction to the stated chain, verified live against `ad_full.db`'s `AD_Column` dictionary:** the real
FK direction is **`AD_User.C_BPartner_ID → C_BPartner`** (AD_User references the partner), not "C_BPartner has
an AD_User" — doesn't change the intent, matters for anyone writing the join.

## §EVIDENCE — current state, extracted not assumed (Explore agent + live sqlite, 2026-07-03)

**1. HHS payroll/leave/personnel data today is a JS literal that mimics AD row *shape* only — not a query.**
- `hr_bim_asset/ad_payroll.js:179-184` `demoSpec()` hardcodes `c_bpartner_id: 1001/1002` for `EMP001`/`EMP002`
  — no query, no `C_BPartner` table read.
- `hr_bim_asset/leave.js:110-124` `demoLog()` reuses the same two names with a hand-authored accrue/take
  schedule — pure signed op-log replay, no ERP source.
- `hr_bim_asset/models.js:91-99` `Official.records` — 7 of 9 rows have `c_bpartner_id: null`; the only two
  with an id (1001/1002) don't correspond to any queried row anywhere (`grep -rn "FROM C_BPartner"` in
  `hr_bim_asset/`/`viewer/` = zero hits).
- **Live-verified: `HR_Employee` has ZERO rows in `ad_full.db`, and the table doesn't even exist in
  `~/bim-ootb/erp/ad_seed.db`.** There is no real employee master data anywhere in this codebase today. This
  is the actual blocker — a data-authoring gap, not a wiring gap.

**2. `M_Warehouse` binding exists as a *pattern*, not as a live binding for HHS.**
- `hr_bim_asset/ad_tenancy.js:66-70` `toWarehouseRow(buildingName, seedId)` **mints a brand-new row every
  compile** (`{m_warehouse_id:1, value:buildingName, name:buildingName}`) — never queries/matches an existing
  warehouse. Re-running the compile twice would not be guaranteed to reproduce the same id if this ever moved
  off the hardcoded `1` — a latent violation of the project's own "compile is deterministic" discipline used
  everywhere else (e.g. GeoMapping's W-GEOMAP-TIER1).
- Real `M_Warehouse` rows DO exist in `~/bim-ootb/erp/ad_seed.db` — live-queried: ids 103/104/50000-50008,
  names "HQ Warehouse", "Furniture", "Store North/South/East/West", etc. **None named HHS.** No code path
  reads this table for building resolution (`grep "FROM M_Warehouse"` = zero hits repo-wide).
- `M_Warehouse` columns confirmed (live schema query): `Value`, `Name`, `AD_Org_ID`, `AD_Client_ID`,
  `C_Location_ID` — the Name/Value pair the user described is real and present.
- The cited precedent ("on-demand dictionary … C_UOM/M_Warehouse" from §P11) is the same mint-a-new-row idiom
  used by `hr_bim_asset/occupancy.js:201-203` `toResourceTypeRow()` and `hr_bim_asset/iot.js:14,50`
  `toUomRow` — all three ADD a row when the dictionary lacks a fit; **none look one up by Name/Value match
  first.** That match-first step is exactly what's missing for real governance.

**3. `AD_User`/`C_Attendance` — one exists with zero relevant use, the other doesn't exist at all.**
- `AD_User` real rows exist and are genuinely queried, but only for the login/session UI
  (`viewer/idmp_session.js:22-34`) — unrelated to HHS occupants. For HBA, `AD_User` is only the *shape* of
  `models.js:82-100` `Official`, compiled via `ad_tenancy.js:105-113` `toUserRow` (a column-pure passthrough
  of the fixture — nothing queried).
- **`C_Attendance` does not exist as a table anywhere — not in the codebase (`grep -rn "C_Attendance"` = zero
  hits) and not in iDempiere's real AD dictionary either** (live-queried `AD_Table` for `%ttendance%` = zero
  rows; the actual HR table family is `HR_Employee`, `HR_Contract`, `HR_Department`, `HR_Job`, `HR_Payroll`,
  `HR_Movement`, `HR_Concept*`, `HR_Period`, `HR_Year`, `HR_Process`, `HR_List*`). **This is the exact same
  situation Leave was in before §P11** — no native table — which was solved by honestly linking to the closest
  REAL construct (`HR_Concept` "UNPAID_LEAVE") instead of inventing one. Attendance needs the same treatment;
  see §OPEN-QUESTIONS Q3.
- "Who is where" today is modeled entirely BIM-side: `hr_bim_asset/attendance.js:19-37` is a self-signed
  op-log (`cls:'ATTEND'`) keyed by bare string ids (`EMP-1`..`EMP-4`), gated only on a mesh-guid check
  (`attendance.js:32`), never on any `C_BPartner`/`AD_User` FK.

**4. No building↔AD-entity resolution exists anywhere — only a name string carried forward, never matched.**
- `viewer/hba_lens.js:266-268`: uses `A.buildingName` (the model's own name, "honest fallback, never
  invented") but never matches it against existing AD data — `toWarehouseRow` just writes it onto a
  freshly-minted row with a hardcoded id.
- No fuzzy/exact-match query against `M_Warehouse`, `AD_Org`, or `AD_Client` exists anywhere (`ad_table_map.js`,
  `ad_graph.js`, `erp_search.js` checked — none implement building-name resolution).
- Closest existing Name/Value dictionary lookup: `viewer/proj_fold.js:234` / `viewer/vo_fold.js:154`
  (`SELECT C_UOM_ID FROM C_UOM WHERE X12DE355=?`) — an exact lookup on a fixed enum column, structurally much
  simpler than fuzzy building-name matching and not reused for buildings today.

**5. Real transactional tables ARE already used correctly in one place — worth preserving as the model.**
`HR_Movement` (already the link target for Payslip lines per §P11, `hr_movement_id`) has real columns
`C_BPartner_ID`, `HR_Concept_ID`, `HR_Department_ID`, `HR_Job_ID`, `Amount`, `Qty`, `ServiceDate` (live schema
query) — structurally the right table for a real payroll movement. The gap isn't the target table choice, it's
that no real `HR_Movement` ROWS exist yet — the id used today is borrowed for the deep-link, not backed by an
actual queried transaction.

## §IMPLICATIONS — what this actually costs, thought through before any code

1. **This is fundamentally a seed-data-authoring task, not a refactor.** `HR_Employee` has zero rows anywhere.
   Real governance requires someone to author real `HR_Employee`/`C_BPartner`/`AD_User`/`HR_Movement`/
   `M_Warehouse` rows for HHS — a genuine "create the proper seed data model" deliverable (your own phrasing),
   separate from and prior to any compile-layer code change.
2. **Identity-key stability is the crux design risk.** `toWarehouseRow` mints fresh every compile with a
   hardcoded id. Making it a real lookup needs a durable key: is the match key the BIM-extracted building
   Name string as-is (fragile — could shift on re-extraction), or a deliberately-assigned stable `Value`/Code
   set once and pinned (durable-ID pattern used correctly by the real `M_Warehouse` rows already in
   `ad_seed.db`, e.g. `Value='HQ'`)? This is an open call, see Q1.
3. **Scope of "real personnel" needs a decision.** Do HHS's two demo people (EMP001/EMP002) become the SAME
   two people, just now backed by real seeded `HR_Employee`/`C_BPartner`/`AD_User` rows (display stays
   identical, only the data path underneath changes) — or does closing this gap imply a larger real headcount?
   See Q2.
4. **Attendance has no real AD table to govern by — same fork Leave already resolved.** Either find the
   closest real construct it should honestly compile onto (if any exists), or accept presence/occupancy stays
   a legitimate BIM-native signal (unlike Leave, which has a real payroll consequence, "who's in this room
   right now" is arguably not an accounting transaction at all). See Q3.
5. **BOM PRINCIPLE (WHAT/HOW/WHERE never merge) already roughly holds in the current code and should be
   preserved, not collapsed, during migration** — `ad_tenancy.js`/`ad_payroll.js`/`leave.js` are already a
   separate compile layer from the `hba_*.js` render layer, which just consumes `A._hba*Spec`/`A._hba*Log`.
   The migration should replace the compile layer's INPUT (real query vs literal) without touching the render
   layer's contract, keeping the blast radius contained.
6. **Every current HBA witness pins the synthetic literals** (`witness_ad_payroll.js`, `witness_leave.js`,
   `witness_ad_tenancy.js`, `witness_p10a.js`, `witness_tenancy_pane.js`, `witness_payslip.js`,
   `witness_leave_pane.js`) — real-data governance breaks their ground truth by design. Rewriting these is
   part of the deliverable, not an afterthought.

## §OPEN-QUESTIONS — needs YOUR call before Stage 1 starts (Sonnet dialogue, not delegated)

- **Q1 — identity key for building↔M_Warehouse matching:** pin a durable `Value`/Code once (robust, matches
  how the real seed rows already work) vs. match on the live-extracted building Name each time (simpler, but
  fragile against re-extraction drift)?
- **Q2 — personnel scope:** re-seed the SAME two demo people as real rows (minimal, display-identical), or is
  this the moment to seed a more representative HHS headcount?
- **Q3 — what does Attendance really compile onto?** No real AD table exists. Options: (a) find the nearest
  legitimate real construct if one exists and honestly link to it (Leave's precedent), (b) declare presence/
  occupancy BIM-native by design (not an ERP-governed pillar at all) and only require `C_BPartner`/`AD_User`
  identity linkage for WHO, not a governed WHERE/WHEN table.

### §Q-RESOLUTION (2026-07-03) — Q1/Q2 proposed-and-unopposed, Q3 USER-DIRECTED (overrides Sonnet's original proposal)

- **Q1 → durable Value/Code, pinned once.** Proposed via AskUserQuestion (no response — AFK), not objected to
  since. Matches the durable-ID pattern the real `M_Warehouse` seed rows already use (`Value='HQ'` etc.) and
  the project's own "compile is deterministic" discipline used elsewhere (GeoMapping W-GEOMAP-TIER1).
- **Q2 → same 2 demo people (EMP001/EMP002), now backed by real rows.** Proposed, not objected to. Minimal
  blast radius — display stays pixel-identical, only the compile-layer INPUT moves from literal to queried.
  ⚠ **Dependency surfaced by the Q3 design below:** `attendance.js demoSeed()` today seeds 4 bare ids
  (`EMP-1..EMP-4`), not 2 — Stage 1 must either extend the 2-person Payroll roster to cover whichever ids
  Attendance demos, or re-scope Attendance's demo seed down to `EMP001`/`EMP002`. Pick the latter (re-scope
  Attendance, don't grow Payroll) to keep Q2 minimal — **flag as a Stage 1 task, not a silent scope creep.**
- **Q3 → RESOLVED by explicit user direction (2026-07-03), supersedes Sonnet's original "BIM-native, no AD
  table" proposal.** User: *"should be in iDempiere is the convention fundamental... I propose C_Attendance as
  under HR_Payroll model with lookup to C_BPartner"* — then extended twice more: *"Same with Warehouse — all
  data must exist in iDempiere, their extension is via child tables and Info Window format, JOIN with other
  data to produce panels anywhere"* and *"any info panel in BIM has to be just a lens from such source."*
  Full design in **§DESIGN-ATTENDANCE** below — grounded via a 3-round Explore-agent research pass (10 numbered
  findings, live `PRAGMA table_info` dumps + repo greps, not assumed).

## §DESIGN-ATTENDANCE — C_Attendance as a child-table + AD_InfoWindow lens (resolved 2026-07-03)

**Governing precedent, verified live (not assumed):**
- `ad_full.db` (1076 tables) is a **read-only mirror of real iDempiere** — no code path anywhere `INSERT`s a
  new table into it. The only proven "stage a genuinely new AD table" mechanism in this codebase is **Ninja
  Mode** (`build/erp/ninja_stage.js:16-23`), which stages into the simplified `ad_seed.db`: deterministic ids
  from `NINJA_BASE = 7000000` (`+0`=tables, `+100000`=windows, `+200000`=tabs, `+300000`=fields,
  `+400000`=menus, `+500000`=columns), rollback = `SET IsActive='N' WHERE id >= NINJA_BASE`. Worked precedent:
  `scripts/poc_ninja_callout.js:76-78` (`AST_Asset`), `scripts/poc_asset_status.js:39-44` (`ACME_Asset`) — both
  bootstrap real `AD_Table`/`AD_Column`/`AD_Tab`/`AD_Field` rows, not a bare CREATE TABLE.
- **`HR_Process` is the real native PARENT** — its own columns already carry `hr_employee_id` + `c_bpartner_id`
  + `hr_period_id` + `hr_department_id` on one row (live `PRAGMA table_info`, verified) — i.e. it's already
  structurally a per-employee-per-period header, exactly the "Warehouse"-equivalent role for this design.
- **`HR_Movement` is the proven CHILD-of-`HR_Process` template** — pairs `hr_process_id` + `c_bpartner_id` on
  one row, the exact shape a new attendance child table needs. `M_Locator`(`m_warehouse_id`)/`M_Product`
  (`m_locator_id`) is the parallel, already-implemented (`ad_tenancy.js:80-90`) precedent for "child row mints
  with the parent's real PK set" — same idiom, different family.
- **`AD_InfoWindow`/`AD_InfoColumn` are REAL native tables** (17/198 rows in `ad_full.db`, schema confirmed:
  `ad_infowindow.fromclause/whereclause/otherclause/orderbyclause`, `ad_infocolumn.selectclause/columnname`)
  but **completely unused anywhere in this codebase** — no code builds or renders one today (only hit:
  `poc_ad_displaylogic.js:5,22`, an unrelated enum-string mention). This is the genuine, unused native "lens"
  mechanism the user is pointing at — building one here is a first, not a copy of an existing pattern.
- **Building-BOM alignment — now speced (see §DESIGN-BOM-COMPILE below), was flagged tangential, promoted to a
  full design per user direction 2026-07-03** ("align to present bom ie `pp_product_bom`/`pp_product_bomline`,
  and this project's own `X_M_BOM.java`/`X_M_BOMLine.java`").

**The concrete shape (execution-ready for Fable5):**

| Role | Table | Key columns |
|---|---|---|
| Parent (header) | `HR_Process` (real, existing) | `hr_process_id` (PK), `hr_employee_id`, `c_bpartner_id`, `hr_period_id`, `hr_department_id` |
| Child (NEW, Ninja-staged) | **`C_Attendance`** | `c_attendance_id` (PK) · `hr_process_id` FK→`HR_Process` · `c_bpartner_id` FK→`C_BPartner` (user's explicit "lookup to C_BPartner," reuses `hr_movement`'s exact FK shape) · `m_locator_id` FK→`M_Locator` (the spatial "where," reuses the already-minted room Locator from `ad_tenancy.js`, chains onward to `M_Warehouse` for the building) · `servicedate` (the day) · `checkintime`/`checkouttime` (nullable — preserves `attendance.js`'s existing honest `open:true` unmatched-checkin semantics) · `qty` (hours present, DERIVED not stored-independently, mirrors `hr_movement.qty`) · `description` · standard system columns (`ad_client_id`, `ad_org_id`, `isactive`, `created(by)`, `updated(by)`, `c_attendance_uu`) — every column present on every real AD table |
| Lens (NEW, Ninja-staged) | `AD_InfoWindow` row + `AD_InfoColumn` rows | `fromclause`: `C_Attendance ATT JOIN HR_Process P ON ATT.HR_Process_ID=P.HR_Process_ID JOIN C_BPartner BP ON ATT.C_BPartner_ID=BP.C_BPartner_ID JOIN M_Locator L ON ATT.M_Locator_ID=L.M_Locator_ID JOIN M_Warehouse W ON L.M_Warehouse_ID=W.M_Warehouse_ID` — columns: `BP.Name` (who), `W.Name`/`L.Value` (where — building/room), `ATT.ServiceDate`/`CheckInTime`/`CheckOutTime` (when), `P.HR_Period_ID` (period) |

**Naming-convention note (flag, not a blocker):** Ninja's own worked precedent uses a short vendor/module
prefix (`AST_`, `ACME_`) rather than the bare `C_` reserved in real iDempiere for shipped/core tables. The user
named it `C_Attendance` explicitly, twice, deliberately choosing the native-style prefix ("should be in
iDempiere is the convention fundamental") — honored as given, not silently renamed to `HBA_Attendance`. Its
Ninja-staged `ad_table_id` still comes from the same `NINJA_BASE≥7,000,000` range regardless of name prefix.

**Compile-layer module (house-styled per `ad_tenancy.js`/`ad_payroll.js` convention — §FILES-TOUCHED
citations: header block + non-invent design-decision comment, IIFE + dual-export, `to<Entity>Row(record, ...,
seedId)` column-pure builders, injected `seedId` closure never `Date.now`/random, `compile<Thing>(...)`
orchestrator ending `W.stamp(out,'en')`):**
- **NEW `hr_bim_asset/ad_attendance.js`** — `toAttendanceRow(session, hr_process_id, c_bpartner_id,
  m_locator_id, seedId)` + `compileAttendance(sessions, processMap, partnerMap, locatorMap)`. SOURCE =
  `attendance.js`'s already-witnessed `sessions(log, period)` reader (unchanged) — this module's whole job is
  resolving `attendance.js`'s bare `EMP-n` ids to real `c_bpartner_id`/`m_locator_id` at compile time, exactly
  closing the gap flagged in §EVIDENCE point 3 above.
- Ninja-staging itself (the `AD_Table`/`AD_Column`/`AD_InfoWindow`/`AD_InfoColumn` bootstrap rows) is a
  **separate, one-time seed step** — follow `ninja_stage.js`'s existing bootstrap sequence exactly (§bootstrap
  code cited above), assigning the **next free id in the current registry** (check `ninja_stage.js`'s live
  allocation at implementation time — do not hardcode a specific id here without verifying no collision).

## §DESIGN-BOM-COMPILE — compiling the BIM recipe tree onto real `pp_product_bom`/`pp_product_bomline`

**Governing precedent, verified live (2nd Explore-agent pass, 5 numbered findings, `bim-compiler` repo):**
- No `M_ProductBOM` table exists in modern iDempiere. The real, **live, non-dormant** MRP pair is
  `pp_product_bom` (25 cols, header, FK `m_product_id`=the assembly's own Product) / `pp_product_bomline`
  (32 cols, child, FK `pp_product_bom_id`→header + own `m_product_id`=child Product, `qtybom`=quantity,
  `line`=sequence) — confirmed via live `ad_full.db` schema. **Unlike `HR_Process`/`HR_Movement` (0 rows,
  dormant), these tables already carry 7/21 REAL demo rows** (a furniture-assembly fixture — `PatioSet`→
  `PChair`/`PBackLeg`/etc, `pp_product_bomline` rows `100-102` etc) — proof the MRP engine mechanism itself
  is live, not a schema no one has ever exercised. Our compile ADDS rows for actual compiled buildings; it
  does not touch this existing fixture data.
- **Genuinely good fit, no honest-gap needed:** `pp_product_bom` carries **no doc-lifecycle columns at all**
  (no `docstatus`/`docaction`/`processed` — only a bare `processing` flag, confirmed via full column dump) —
  a static BIM recipe needs no workflow/approval handling, unlike `C_Subscription`'s `paiduntildate` gap or
  any `C_Order`-family document. This is the cleanest fit found across the whole ERP-governed-display thread.
- **This project's `X_M_BOM.java`/`X_M_BOMLine.java`** (`ORMSandbox/.../po/`) are POJOs over a wholly separate
  custom schema — canonical DDL in `library/schema_snapshot_bom.sql:1055-1150` (the actual per-run
  `{PREFIX}_BOM.db` files are transient build artifacts, deleted every run by `scripts/rebuild_erp.sh:355`).
  Header `m_bom`: `bom_id`(TEXT natural key), `bom_type` CHECK-constrained to `BUILDING/FLOOR/ROOM/SET/ITEM`
  (correction: not `UNIT` as first assumed), `target_ifc_class`, `group_by`, `origin_x/y/z`, `aabb_*_mm`. Line
  `m_bom_line`: `child_product_id`(TEXT, FK into the **BIM-internal component catalog**, see landmine below),
  `qty`, `role`, plus placement-only fields (`dx/dy/dz`, `rotation_rule`, `z_rule`, `anchor_face`,
  `layout_strategy`, `material_name/rgba`, `storey`). Walked recursively by
  `DAGCompiler/.../bom/walker/BOMWalker.java:122-165` (depth-first, `MAX_DEPTH=20` cycle guard); visitors like
  `PlacementCollectorVisitor` flatten it into a parent-tagged list of leaf placements with summed world
  offsets — that flattened-with-parent-context shape is the natural read source for a JS compile function,
  same idiom as `ad_tenancy.js` reading a flat `rooms[]` array.
- ⚠ **Landmine, load-bearing: TWO different "M_Product" tables exist, do not conflate them.**
  `m_bom_line.child_product_id` FKs into **`library/component_library.db`'s own internal `M_Product(product_id
  TEXT)`** (the BIM geometry/finish catalog `BOMWalker` reads via a separate `compConn`) — this is **not** the
  real AD dictionary's `m_product` table (`ad_full.db`, `m_product_id` INTEGER PK) that `pp_product_bom`/
  `pp_product_bomline`/`ad_tenancy.js`'s `toProductRow` actually FK into. A compile function must resolve the
  BIM catalog's TEXT product id → a real AD `m_product_id` via the SAME mint-or-match-by-guid idiom
  `ad_tenancy.js` already uses for rooms — never treat the catalog id as if it were already an AD id.
- **FK shape confirmed compatible, no mismatch:** `pp_product_bom.m_product_id`/`pp_product_bomline.m_product_id`
  are ordinary FKs into the real `m_product` table — the SAME table `ad_tenancy.js:87-89 toProductRow` already
  writes one row into per room (`m_product_id` keyed by `room.guid`). **A room-as-parent BOM header and its
  furniture-as-children BOM lines can reuse exactly the Product identities the Tenancy compile already mints**
  — no separate identity scheme needed, confirmed by live-joining every existing seed row.

**The concrete shape:**

| Role | Table | Key columns |
|---|---|---|
| BIM source (existing, unchanged, transient per-run artifact) | `m_bom`/`m_bom_line` (`library/schema_snapshot_bom.sql`, walked by `BOMWalker.java`) | header: `bom_id`, `bom_type`(BUILDING/FLOOR/ROOM/SET/ITEM), geometry (`origin_x/y/z`, `aabb_*_mm`) — line: `child_product_id`(BIM-catalog TEXT id), `qty`, placement fields |
| Parent (compile target, REAL table, already live) | `pp_product_bom` | `pp_product_bom_id`(PK, mint) · `m_product_id` FK→`M_Product` (the PARENT element's own AD Product row — reuse `ad_tenancy.js toProductRow`'s mint-or-match, keyed by the element's guid) · `value`/`name` (from `bom_id`/`bom_name`) · `bomtype`/`bomuse` (mapped from `bom_type` — **AD_Reference values not yet verified, see open item below, do not hardcode from the 'A'-only seed sample**) · `c_uom_id` |
| Child (compile target, REAL table, already live) | `pp_product_bomline` | `pp_product_bomline_id`(PK, mint) · `pp_product_bom_id` FK→header · `m_product_id` FK→`M_Product` (the CHILD element's own AD Product row, same minting idiom) · `qtybom`(=`m_bom_line.qty`) · `line`(=sequence/ordinal) · `componenttype`(mapped from `component_type`) |
| BIM-only geometry (no AD column exists — stays a view-trace wrapper, never forced into a fabricated column) | — | `origin_x/y/z`, `aabb_width/depth/height_mm`, `dx/dy/dz`, `rotation_rule`, `z_rule`, `anchor_face`, `layout_strategy`, `material_name/rgba`, `storey`, `verb_ref`, `host_element_ref` — same wrapper convention as `ad_tenancy.compileBuilding`'s subscription wrapper (`{row, ...viewTrace}`) |

**Items resolved by a 3rd verification pass (2026-07-03, user-directed):**

1. **`bomtype` → RESOLVED, user's proposal `'B'` (BIM) is clean.** `pp_product_bom.bomtype`'s real
   `AD_Reference_ID=17` (List) → `AD_Reference_Value_ID=347` ("M_BOM Type", `ValidationType='L'`). Live
   `AD_Ref_List` rows for 347: `A`=Current Active, `C`=Product Configure, `F`=Future, `K`=Make-To-Kit,
   `M`=Maintenance, `O`=Make-To-Order, `P`=Previous, `R`=Repair, `S`=Previous/Spare — **no `B`, and no
   `AD_Val_Rule` gates the column** (checked all 5 real `AD_Column` rows named BOMType — `AD_Val_Rule_ID` null
   on every one). Adding `AD_Ref_List` row `B`="BIM" is the same "extend the dictionary with a missing master
   value" idiom already used for `C_UOM`/`M_Warehouse` (structurally an `AD_Ref_List` insert rather than a
   plain master-table insert, but equally low-risk — no schema change, nothing to satisfy).
   ⚠ **Accepted tradeoff, not a blocker:** several native manufacturing engines hardcode `BOMType='A'` checks
   literally (`RollUpCosts.java` costing rollup, `MPPProductBOM.java` default-BOM lookup, `MProduction.java`/
   `MProductionPlan.java` production explosion) — a `BOMType='B'` row is **invisible** to costing/MRP/
   production-explosion by design. This is correct for our case (a BIM recipe is a structural/spatial fact,
   not a manufacturing plan) — flagging it so it's a deliberate choice, not a surprise if someone later expects
   a BIM BOM to show up in a costing rollup. If that's ever wanted, the fix is a MIRRORED `'A'` row, not
   changing what `'B'` means.
   `bomuse` — not yet separately re-checked against its own `AD_Ref_List`; same low-risk idiom applies, verify
   at implementation time the same way (don't assume it mirrors `bomtype`'s enum).
2. **File/repo placement — still the one genuinely open fork.** Every other compile module in this thread
   (`ad_tenancy.js`, `ad_payroll.js`, `ad_attendance.js`) lives in `hr_bim_asset/` (bim-ootb, JS, viewer-side).
   `m_bom`/`m_bom_line` are produced by **this repo's** (`bim-compiler`) Java pipeline (`DAGCompiler`/
   `BOMWalker`) into `library/*_BOM.db`. **Recommend (a) JS in `hr_bim_asset/`** (e.g. `ad_bom.js`, reading the
   already-built `library/*_BOM.db` output) for consistency — every AD-shape compile so far is JS, and
   `pp_product_bom` rows are consumed by the SAME viewer panes as Tenancy/Payroll/Attendance. Low-risk/
   reversible either way (it's a read-only compile over already-produced data) — **Fable5 can proceed with (a)
   as the default and this doesn't need to block execution**, unlike Q1-Q3 which changed what gets displayed.
3. **Leaf→Product→ProductCategory minting — RESOLVED: ALREADY BUILT, not a Java-days aspiration.**
   `IFCtoBOM/src/main/java/com/bim/ifctobom/ProductRegistrar.java` already mints one real `M_Product` row per
   distinct LEAF extraction element (`ensureProductCatalog():57-129`, grouped by product id — one per leaf, not
   per room) and backfills `M_Product_Category_ID` from the leaf's `ifc_class` (`:112-126`, `UPDATE M_Product
   SET M_Product_Category_ID = (SELECT ... FROM M_Product_Category WHERE IFC_Class = M_Product.ifc_class)`,
   cited in-code to `DISC_VALIDATION_DB_SRS.md §6.4`, witness `W-DISC-CAT`). **The BOM compile module does NOT
   need to mint child Product rows itself — reuse `ProductRegistrar`'s output directly**, same as the parent
   room row already minted by `ad_tenancy.js toProductRow`. One caveat: `M_Product_Category.IFC_Class` is a
   **bolt-on column, not in the pristine `ad_full.db` mirror** — added via `migration/S62_001_product_category_
   fp.sql:21` + `migration/DV015_move_m_product.sql:15` onto the runtime `ERP.db`. Real and already working,
   just worth knowing it's a project extension, not stock iDempiere, if this is ever cross-checked against a
   fresh `ad_full.db` pull.

**Compile-layer module (file placement per item 2 above — default to (a) unless redirected):**
`toBomRow(bomNode, m_product_id, seedId)` / `toBomLineRow(lineNode, pp_product_bom_id, child_m_product_id,
seedId)` + `compileBom(bomTree, productResolver)` orchestrator, same house style as `ad_tenancy.js`/
`ad_attendance.js` (column-pure builders, `W.stamp(...)` at the end). SOURCE = a `BOMWalker`-style
flattened parent-tagged read of `library/*_BOM.db`; `productResolver` = a lookup that resolves the BIM
catalog's `child_product_id` (TEXT, `component_library.db`) to the real AD `m_product_id` already minted by
`ProductRegistrar.java`/`ad_tenancy.js toProductRow` for that same guid — never mint a competing identity.

## §DESIGN-RESOURCE-AVAILABILITY — S_Resource governs availability too, gap found (2026-07-03)

User asked whether `S_Resource` availability is likewise iDempiere-governed. Verified: **yes, genuinely, via a
real (if simple) native engine** — `S_Resource.IsAvailable` (`AD_Reference_ID=20` Yes/No, real dictionary
column) is read by `~/idempiere-dev-setup/idempiere org.compiere.model.ScheduleUtil.getBaseInfo()`(:578) as a
master on/off gate, then `getAssignmentSlots()`(:100) layers `S_ResourceUnavailable` blackout ranges +
`S_ResourceAssignment` bookings on top to build real `MAssignmentSlot[]` — this backs the native
`WSchedule`/`InfoAssignmentPanel`/`InfoSchedule` UI. Not decorative — a real scheduling engine consumes it.
`PercentUtilization`/`ChargeableQty` columns exist in the dictionary but **no native engine consumes them
anywhere in the source tree** — currently inert columns available for us to populate meaningfully.

**Gap found, not yet closed:** `hr_bim_asset/occupancy.js toResourceRow()` hardcodes `isavailable: 'Y'`
**unconditionally for every room**, never consulting the already-witnessed (21/21) ASSIGN/RELEASE/UNAVAIL
signed-replay `availability()` engine's actual state. `percentutilization`/`chargeableqty` are never referenced
at all (zero grep hits), despite `occupancy.js pivot()`(:113-114) already computing an equivalent `utilization`
number per room that could feed `percentutilization` directly — the compile-time value already exists, it's
just not threaded onto the AD row. **Fix, folded into Stage 2 below:** `toResourceRow()` reads the replayed
`availability(log, roomGuid)` result and sets real `isavailable`/`percentutilization` instead of the current
hardcoded constant — a small, well-scoped, non-invent-safe change (the source data already exists and is
already witnessed; this only threads it onto the right columns).

## §STAGED-PLAN — Q1-Q3 now resolved (§Q-RESOLUTION), execution-ready — assignment per
[[feedback_model_allocation_mastermind_vs_execution]]

- **Stage 0 — ✅ DONE 2026-07-03.** Q1/Q2 proposed-and-unopposed, Q3 user-directed + fully designed in
  §DESIGN-ATTENDANCE. Nothing below was blocked on further dialogue as of this writing.
- **Stage 1 — ✅ DONE 2026-07-03 (Fable5) — bim-ootb PR #621 `lane/hba-erp-governed`, W-HBA-ERP-SEED 7/7.
  See §STAGE1-DONE below for the witness log + the two facts that corrected this spec's assumptions.**
  1. Author real `M_Warehouse` (HHS row, `Value`/Code per Q1 — pin once, don't re-derive from Name).
  2. Author `HR_Employee`/`C_BPartner`/`AD_User` for `EMP001`/`EMP002` only (Q2) — re-scope
     `attendance.js demoSeed()` from its current 4 bare ids (`EMP-1..EMP-4`) down to these same 2, per the
     dependency flagged in §Q-RESOLUTION.
  3. Author enough `HR_Movement`/`HR_Payroll`/`HR_Concept` rows to back a real payslip (unchanged from the
     original Stage 1 scope).
  4. **NEW:** Ninja-stage `C_Attendance` (`AD_Table`+`AD_Column` bootstrap, next free id ≥ `NINJA_BASE`) +
     its `AD_InfoWindow`/`AD_InfoColumn` lens rows, per §DESIGN-ATTENDANCE's exact column/JOIN spec. Follow
     `ninja_stage.js`'s existing bootstrap sequence — do not hand-roll a different pattern.
  5. Author `C_Attendance` rows for `EMP001`/`EMP002`'s existing demo sessions, resolving `attendance.js`'s
     bare ids to the real `c_bpartner_id`/`m_locator_id` minted in steps 1-2.
- **Stage 2 — compile-layer rewrite. Opus.** `ad_tenancy.js` (`toWarehouseRow` → match-or-create by Value, not
  blind mint), `ad_payroll.js` (`demoSpec` → real `HR_Employee`/`C_BPartner` join), `models.js`
  (`Official.records`/`officialByName` → real `AD_User` join), `leave.js` (unchanged — P8 already verified
  Leave has no native table and correctly stays on `HR_Concept`, not part of this thread),
  **NEW `hr_bim_asset/ad_attendance.js`** (per §DESIGN-ATTENDANCE — `toAttendanceRow`/`compileAttendance`
  resolving `attendance.js` sessions onto the new `C_Attendance` child rows), **NEW `hr_bim_asset/ad_bom.js`**
  (per §DESIGN-BOM-COMPILE — `toBomRow`/`toBomLineRow`/`compileBom`), `occupancy.js` (real identity binding,
  **plus §DESIGN-RESOURCE-AVAILABILITY's fix**: `toResourceRow()` threads the already-witnessed
  `availability()` replay result into real `isavailable`/`percentutilization` instead of the current
  hardcoded `'Y'`). Multi-file, real regression risk, careful non-invent discipline (every displayed field
  must trace to a queried row).
- **Stage 3 — render-layer spot-check. Fable5.** `viewer/hba_*.js` panes already just consume `A._hba*Spec`/
  `A._hba*Log` — confirm no residual hardcoded display strings slip through once the compile layer changes.
  **NEW:** `viewer/hba_lens.js`'s Presence drawer (§P10a point 4) should read through the new `C_Attendance`→
  `AD_InfoWindow` lens instead of `attendance.js`'s raw op-log directly, once Stage 2 lands.
- **Stage 4 — witness rewrite. Fable5.** Replace EMP001/EMP002/BP-TEN-* ground truth in the 7 witnesses listed
  above with assertions against the new real seed rows. **NEW:** `witness_ad_attendance.js` — non-invent gate
  (`C_Attendance` row keys ⊆ independently-sourced real+Ninja-staged column list, same pattern as
  `W-HBA-AD-PAYROLL`'s AD0), InfoWindow JOIN resolves to the same rows the pane renders, honest gap handling
  (open checkout, unresolved zone) preserved.

## §FILES-TOUCHED (compiled from the Explore agent's citation list, for Stage 2 planning)

`hr_bim_asset/ad_tenancy.js`, `ad_payroll.js`, `leave.js`, `models.js`, `occupancy.js`, `attendance.js`,
`viewer/hba_lens.js:180-276` (the seeding gate block — every `if (!A._hba*Spec ...)` becomes a real DB read
keyed off a resolved warehouse/org id instead of `rooms.length`), `viewer/hba_payslip.js`, `hba_leave.js`,
`hba_tenancy.js`, `hba_dashboard.js`, `hba_iot.js`, `hba_avatars.js` (read-only consumers, Stage 3 spot-check
only), `hr_bim_asset/fixtures/hhs_rooms.json`/`hhs_room_members.json` (current sole real HHS binding surface —
room guids — needs a parallel per-room `m_locator_id` persisted from Stage 1, not regenerated per session),
plus the 7 witnesses named in §IMPLICATIONS point 6.

**NEW (from §DESIGN-ATTENDANCE, 2026-07-03):** `build/erp/ninja_stage.js` (bootstrap the `C_Attendance`
table/columns + `AD_InfoWindow`/`AD_InfoColumn` lens rows — Stage 1), NEW `hr_bim_asset/ad_attendance.js`
(Stage 2), `viewer/hba_lens.js`'s Presence drawer (Stage 3 retarget onto the InfoWindow lens), NEW
`witness_ad_attendance.js` (Stage 4). See `scripts/poc_ninja_callout.js`/`scripts/poc_asset_status.js` as the
literal worked examples of the Ninja bootstrap sequence to follow.

## §STAGE1-DONE — executed 2026-07-03 (Fable5) · bim-ootb PR #621 (`lane/hba-erp-governed`, auto-merge armed)

**Deliverables (all in bim-ootb, per the Stage-1 handoff: Q1=`Value='HHS_Office_Federated'`, Q2=EMP001/EMP002
only, compile-layer untouched):**
- `scripts/seed_hba_erp.js` — idempotent, deterministic, self-witnessing seed into `erp/ad_seed.db`:
  `M_Warehouse` 990000 (Q1 pinned Value) · 14 `M_Locator` rows (X/Y/Z = real room centers from
  `hhs_rooms.json`) · `C_BPartner` 1001/1002 + `AD_User` 1/2 (ids/emails/phones verbatim from
  `ad_payroll.demoSpec()`/`models.js Official` — Stage 2 stays display-identical) · `HR_*` physical tables
  (real `ad_full.db` column sets) with rows extracted by RUNNING `AdPayroll.runPeriod` (gross=5200/net=4234
  land from the engine) + 2 `HR_Employee` rows · Ninja-staged `C_Attendance` (real `stageModels`, ids at
  7,000,000; range verified empty first) · `ad_infowindow` 7600000 + 7 `ad_infocolumn` rows with
  §DESIGN-ATTENDANCE's exact JOIN · 7 `C_Attendance` rows folded from `demoSeed` sessions (open → NULL
  checkout/qty).
- `hr_bim_asset/attendance.js` `demoSeed` re-scoped to EMP001/EMP002 (§Q-RESOLUTION Q2 dependency), movement
  expressed as honest multi-session in→out pairs across 3 storeys.
- `hr_bim_asset/fixtures/hhs_room_locators.json` — the persisted guid→`m_locator_id` map (§FILES-TOUCHED item).

**Witness:** `W-HBA-ERP-SEED` 7/7 PASS in-script — NINJA-DICT, LENS-JOIN-LOSSLESS (7/7 rows through
`C_Attendance→HR_Process→C_BPartner→M_Locator→M_Warehouse`), LENS-WAREHOUSE, LENS-IDENTITY, LENS-HONEST-OPEN,
PAYSLIP-DB==ENGINE, HR-EMPLOYEE-EXISTS. Idempotent 2nd run = 0 additions. hr_bim_asset suite 33/33 files green
after the witness re-pins below; `ad_seed`-reading node tests: 3 reds verified PRE-EXISTING on the pristine DB
(`poc_bim_overlay`, `probe_roundtrip`, `audit_db_integrity`) — not caused by the seed.

**Two facts that corrected this spec (verified live, worth knowing for Stage 2):**
1. `ad_seed.db`'s `AD_Table` DICTIONARY already lists all `HR_*` tables (53086 HR_Employee, 53102 HR_Movement…)
   — what was missing was the PHYSICAL data tables (now created with the real `ad_full.db` column sets). The
   spec's "table doesn't even exist" was true of the physical layer only.
2. `ad_infowindow`/`ad_infocolumn` had NO physical tables in `ad_seed.db` either (only `ad_infowindow_access`)
   — created likewise. Also: the §P11 deep-link windows 53042/316/53036 have no `AD_Window` rows in
   `ad_seed.db` (only 143/236 exist) — those deep-links can't render in the browser ERP until their dictionary
   rows are seeded. NOT Stage-1 scope; flag for Stage 3's render spot-check.

**Accepted tradeoff (flagged, not silent):** with a 2-person real roster the max presence band is `med` —
`witness_richdemo` R4 re-pinned bands ≥3→≥2 (mathematically capped), `witness_presspane` PP1 zone0 3→2,
`witness_p10a` P3 EMP-1→EMP001. The §RICH-DEMO many-people variety returns only when real headcount does —
that is the ERP-governed point.

## Non-invent / process notes

Every fact above was extracted from a live file read or a live sqlite query against the real dictionary/seed
DBs — no schema or row content was assumed. If this spec is picked up cold, re-verify the `HR_Employee` row
count and the `M_Warehouse` seed rows haven't changed before trusting the "zero rows" / "no HHS warehouse"
claims — this is a fast-moving repo (see [[feedback_dont_relitigate_settled_doctrine]] for why re-verification
before trusting a stale status note is the house discipline here, not paranoia).
