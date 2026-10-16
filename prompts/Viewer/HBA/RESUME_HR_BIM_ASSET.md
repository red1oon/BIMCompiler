# ⚠ DO NOT REMOVE — Scope & Discipline

**Scope:** Design spec for a **local-first, kernel-based HR + RegTech app** that runs standalone
(its own seed, no `ad_full`/ERP suite required) and integrates to ERP only via two **dotted lines**:
GL-account posting and `C_BPartner.isEmployee`. Three pillars: (1) Glass-box Payroll core,
(2) Mobile signed-edge (check-in / access / signing), (3) Malaysian RegTech (E-Invoice/MyInvois +
LHDN income-tax/PCB + EPF) framed as a **privacy-first counter-proposal**, free demo only.

**Status:** ALPHA FRAMEWORK BUILT + WITNESSED 2026-06-30, in **bim-ootb `hr_bim_asset/`** only. See §RESUME below.

**Discipline (PRIME DIRECTIVE — Deterministic · Non-invent · Extract):**
- **Regulatory facts are a NON-INVENT GATE.** No LHDN/EPF/PCB/MyInvois threshold, deadline, field
  schema, rate table, or validation rule may be implemented until SOURCED + CITED (see §RESEARCH GATE).
  A value with no statutory source is a FINDING, never a guess.
- This is a **demonstrator + policy counter-proposal**, NOT a certified/compliant production filer.
  It complies to *international accounting standards (IFRS/MFRS)* for the books and **advocates** a
  privacy-preserving alternative to government — it makes **no** claim of LHDN certification.
- **DISCLAIMER IS LOAD-BEARING (§DISCLAIMER):** every important screen and every generated output
  (payslip, invoice, report, export, print) MUST carry the **locale-aware** watermark
  **`CONTOH — TIDAK RASMI`** (MS) / **`SAMPLE — NOT OFFICIAL`** (EN). Witnessed criterion, not a footnote.
- Read the log after every run. Honour this block until the spec is DONE.

---

## ▶ SESSION CLOSEOUT 2026-07-02b — §P10a + §P10b DONE — NEW SESSION START HERE

**This session shipped BOTH §P10a (UX/data-model triage) and §P10b (IoT/CCTV/ERP-link/draggable) in full** —
see the two spec sections above for the design; below is what's ACTUALLY BUILT + WITNESSED (`bim-ootb`
`lane/hr-overlay`, worktree `/tmp/wt-hr`). **33 witness files, GREEN, zero regression** (full suite re-run
after every change). Live chromium smoke (`cdp_shot.js` against the extended `demo/fm_panel.html`): 8/8 lenses
available, `§SMOKE after-occ-click drawer-present=true | presence-drawer=true | tenancy-pane=true | iot-pane=true
| search-results=1 | jsErrors=0` — screenshot confirms the IoT/CCTV pane + Presence roster render.

**§P10a shipped:**
1. **Rename** — pill + drawer header → **"Human-Asset"** (`panels.js:1159`, `hba_lens.js`). Internal id `hbaFM`
   unchanged (witness stability).
2. **Deliberate close** — `openFamilyDrawer` refactored to a persistent container + `_renderRows`/`_clear`
   inner rebuild; a row click activates+re-renders IN PLACE (drawer never removed by it); an explicit **✕**
   button (or re-tapping the pill) is the only close.
3. **AD_User primary identity** — `models.js` `MODELS.Official` (9 records: EMP001/EMP002 with REAL
   `c_bpartner_id` 1001/1002 from `ad_payroll.js`; BP-TEN-1/5/6 + EMP-1..EMP-4 with `c_bpartner_id:null` — no
   real BPartner backs them, honest gap) + `ad_tenancy.toUserRow`. `models.officialByName(code)` — honest
   `null` on miss, never fabricated.
4. **`ad_tenancy.compileBuilding(buildingName, rooms, leases, strata)`** — the whole-building AD compile
   (Warehouse/Locator/Product/Subscription), skip-non-room honesty, derived `units`.
5. **`viewer/hba_tenancy.js`** (NEW pane) — party resolves through `Official` (name+phone, not a bare code);
   row click → `flyToZone` (the "Find↔FM link"). FAMILY 7→8 (`tenancy` pane entry).
6. **Presence roster** — `openPresenceDrawer` (session list via `attendance.sessions`, name resolved via
   `Official`, honest bare-code miss on overflow identities); row click → `flyToZone`.
7. **Smart search** — top `<input>` in the drawer, Room name/storey (`A._hbaRooms`) + `Official` name/phone/
   email; honest "No match." — explicitly redundant with Find's own (private, unexported) index.
8. **`flyToZone(A, guid)`** — ONE shared camera fly-to primitive (Tenancy pane + Presence roster + search all
   route through it); returns `{flew, guid, center}` synchronously (witnessable without a real THREE/camera),
   performs the real browser lerp when `camera`/`controls`/`THREE` are present.

**§P10b shipped (mid-session user request — sensor mockup + CCTV mockup + ERP billing + draggable panels):**
1. **`hr_bim_asset/iot.js`** (NEW engine) — 6 sensors (temp/boiler pressure/sound/dust/solar/electrical),
   DETERMINISTIC 24h synthetic series (sin curve + fixed offset table, never `Math.random`/`Date.now`); compiles
   onto REAL `c_order`/`c_orderline`/`c_uom` columns (verified `ad_full.db` PRAGMA — see §P10b-CHECK); new
   `C_UOM` rows created on demand for the missing physical units (°C/bar/dB/µg/m³/W/m²/kWh), same precedent as
   `ad_tenancy.js`'s `toWarehouseRow`.
2. **`viewer/hba_iot.js`** (NEW pane) — opens as a SUPPLEMENT to the existing `maintenance` tint lens (same
   dual-action pattern as Presence): 6 Chart.js sensor charts, a 2×3 CCTV MOCKUP grid (canvas scanline +
   "MOCK FEED" caption, **no invented video/GIF, no external URL fetch**), the ERP billing table
   (`iot.billingLines()`).
3. **`viewer/hba_draggable.js`** (NEW shared utility) — `HbaDraggable.enable(pane, handle)`, pointer-event
   drag-follow clamped to the viewport; retrofit into ALL 5 panes (`hba_dashboard.js`, `hba_payslip.js`,
   `hba_leave.js`, `hba_tenancy.js`, `hba_iot.js`) — one line added to each `mount()`.

**Witnesses (NEW):** `witness_p10a.js` (24/24 — AD_User/compileBuilding/rename/close/roster/search),
`witness_tenancy_pane.js` (10/10), `witness_p10b.js` (22/22 — iot engine/pane/draggable). **Updated:**
`witness_family.js` (F1/F7 → FAMILY 8 entries, tenancy re-added as a PANE not a lens — de-conflate still holds
at the lens layer). Demo: `demo/fm_panel.html` extended with a real asset guid + tenancy spec (all 8 lenses now
demo-available, was 7 max before). `viewer.html` gained 5 script tags (`ad_tenancy.js`, `iot.js`,
`hba_draggable.js`, `hba_tenancy.js`, `hba_iot.js`); `hba_lens.js` cache-bumped `?v=3`→`?v=4`.

**Not yet done (flag, don't silently drop):** live Playwright/deploy smoke of the drag mechanics in the REAL
in-app viewer (witnessed here via `cdp_shot.js` against the standalone demo page + a stub-DOM node witness for
the pointer math, not the full 3D viewer); the Tenancy/IoT/Presence panes all default-mount at the SAME
`top:54px;right:12px` anchor so opening several at once stacks them (exactly what dragging is for — not a bug,
but worth a smarter default cascade-offset if this becomes a real workflow, not just a POC).

**What shipped (the whole §CRITICAL "Compile not Model" arc, closed end-to-end this session):**
`ad_payroll.js` (payroll → `hr_process`/`hr_movement`/`hr_concept*` + leave-seam) · `occupancy.js`
`toResourceAssignmentRow()` (→ `s_resourceassignment`) · `models.js` `toAssetRow()` (→ `a_asset`) ·
`ad_tenancy.js` (Tenancy+Strata → `M_Warehouse`/`M_Locator`/`M_Product`/`C_Subscription`, WMS-address corrected).
Full detail in `§CRITICAL` below — read it before touching any of these files again.

**P7 ✅ DONE 2026-07-02 (`viewer/hba_payslip.js`, `W-HBA-PAYSLIP 9/9`).** The payslip UI pane, mirroring
`hba_dashboard.js`'s additive/host-injected/mount-unmount pattern: employee picker + gross/net KPIs + per-concept
line trace, watermarked — renders `ad_payroll.js`'s already-witnessed `payslip()` reader, no new schema. Added
`ad_payroll.demoSpec()` (the SAME EMP001/EMP002 baseline already accepted by `witness_ad_payroll.js` AD1, reused
not reinvented) seeded in `hba_lens.js bindStoreysFromModel` alongside occupancy/attendance/request — payroll has
no spatial guid to resolve (unlike Occupancy/Asset), so it seeds unconditionally once a building has rooms.
FAMILY grew 5→6 entries (`witness_family.js` F1/F7 updated); pane routing generalized to an id→global registry
(`dash`/`payslip`) instead of one hardcoded pane name. **Live chromium smoke** (`cdp_shot.js` against
`hr_bim_asset/demo/fm_panel.html`): FM drawer → Payslip pane → employee reselect (real click path), `§HBA_PAYSLIP`
log matches the rendered numbers (EMP001 net=4234, EMP002 net=2870), 0 console errors, screenshot confirms both
watermarks + the FM pill highlighted. `viewer.html` gained 3 script tags: `rules.js` (was missing entirely —
`ad_payroll.js` needs it), `ad_payroll.js`, `hba_payslip.js`.

**P8 ✅ DONE 2026-07-02 (`viewer/hba_leave.js`, `W-HBA-LEAVE-PANE 11/11`).** The Leave UI pane, same pattern as
P7 — employee picker + taken/unpaid/per-type-balance KPIs + chain-integrity line + per-entry paid/unpaid
statement, watermarked — renders `leave.js`'s already-witnessed `summary()` reader (balance = REPLAY, never a
stored number), no new schema. Added `leave.demoLog(emp)` (the SAME accrue/take schedule already accepted by
`witness_leave.js` L0-L9, reused per-employee). FAMILY grew 6→7 entries. **Live chromium smoke**: FM drawer →
Leave pane → employee reselect, `§HBA_LEAVE_PANE` log matches the rendered statement (unpaid=4, annual
balance=-3, chain verifies), 0 console errors.

**PM_Property↔M_Warehouse check ✅ DONE 2026-07-02 (`ad_tenancy.js` `propertyUnits`, `W-HBA-AD-TENANCY` 12→15/15).**
`PM_Property` is COVERED by the Building=M_Warehouse mapping already established (`toWarehouseRow`, AD-TEN0) —
no separate table. `units` → derive via `propertyUnits(warehouseId, locatorRows)` (COUNT the real M_Locator rows,
never a stored duplicate). `manager` → a **genuine native gap** (grepped every table in `ad_full.db`, no
manager-shaped column exists anywhere) — the nearest native mechanism is an access-control chain
(`ad_user.c_bpartner_id` → `ad_user_orgaccess(ad_user_id,ad_org_id)` → `m_warehouse.ad_org_id`), which is a role
assignment, not a "who manages this building" business fact — flagged (AD-TEN6), not built (no live engine needs
it). `models.js`'s `PropertyManagement` demo record kept unchanged (alpha-existence proof, same as Strata's).

**What's still open:**
1. **⛔ BLOCKED (needs a design decision, not a fact) — Find↔FM linking.** The doc that introduces this
   (`docs/HRBIMAssetGuide.md` §Future roadmap addendum, bim-compiler repo) explicitly frames it as *"two
   directions under consideration, **not yet built**"* — extending the Viewer's Find search index to cover
   HR_BIM_Asset records (tenant name/lease number/ticket ID) and deep-linking a search hit into the FM drawer
   pre-scoped to that record. This is NOT a same-shape additive-pane task like P7/P8: it touches Find's search
   index (a shared, non-HBA-owned surface), not just an HBA-additive file. Per the Spec-First rule, this needs
   a written spec (what does Find index, what does "deep-link into FM" mean operationally, does it apply to a
   single building or the multi-building portfolio note in the same addendum) BEFORE any implementation —
   **the one question:** does the user want that spec written now, or is this genuinely a "someday" roadmap
   note to leave alone until asked? Not started, correctly not attempted without that answer.
2. **P9 — §RESEARCH GATE.** Still explicitly paused (user 2026-07-02) — do not start without being asked.
3. **The Building/Warehouse/Locator/Subscription model is SPECCED, not yet seeded into a live pane or `ad_full.db`
   itself** — `ad_tenancy.js`'s compile functions are witnessed in isolation (pure row-shape proofs); nothing
   writes them into a real sqlite db or wires a viewer pane yet. That's the natural next build step if this
   pillar continues.

## ▶ §P10 SPEC — Tenancy AD-compile pane + Find↔FM spatial link (2026-07-02, user GO)

User re-scoped the two opens in one breath: *"Find to FM small matter — just a link"* (deep spec ceremony
retired; it's a wiring slice) + *"yes check the WMS usage in 1. Building map to warehouse ABL, 3. and 4"*
(verify the native semantics BEFORE seeding live). Spec-first, this section gates the implementation.

### §P10-CHECK — WMS usage verified vs REAL iDempiere (falsifiable; re-run these if in doubt)
Sources: `~/idempiere-dev-setup/idempiere` `org.compiere.model/{X_M_Locator,MLocator,X_M_Product}.java` +
`build/erp/ad_full.db` PRAGMA/rows. Findings:
1. **Building→M_Warehouse + ABL ✓.** `X_M_Locator` documents X="Aisle (X)", Y="Bin (Y)", Z="Level" — free-text
   dimension addresses. Aisle→block/wing, Level→storey is the native idiom. **CORRECTION adopted:** native
   locators default UNUSED dimensions to `'0'` (`MLocator` constructor `setXYZ("0","0","0")`; every real GW row
   shows `'0'`) — `toLocatorRow` emitted `null`/absent; now emits `'0'` + `isdefault:'N'` (a room locator is
   never the warehouse default). ⚠ `MLocator.get()` COALESCES by (warehouse,X,Y,Z) — two rooms on one storey
   share an ABL address, so locator identity must ride on `value`=guid (it does); never create via the
   combination-lookup. Witness AD-TEN1 updated to assert the SOURCED `'0'` default (supersedes the old
   "honestly null" reading — same non-invent intent, now aligned to what the native engine itself writes).
2. **unit→M_Product.m_locator_id ✓ unchanged.** Plain "Warehouse Locator" default-storage pointer, zero engine
   logic in MProduct — a fixed unit "stored at" its room is semantically exact.
3. **lease/strata→C_Subscription ✓ schema-exact, engine-DORMANT in core iDempiere.** Only generated `X_/I_`
   classes exist — NO process advances `paiduntildate`/`isdue` or writes `C_Subscription_Delivery`. Our
   `paiduntildate=null` honest gap IS the native reality; `C_Subscription_Delivery` is the natural child table
   if recurrence is ever animated.

### §P10-BUILD (P7/P8 additive pattern, all edits in /tmp/wt-hr on lane/hr-overlay)
1. **Engine** `ad_tenancy.js` (additive): apply the `'0'`/`isdefault` correction; new
   `compileBuilding(buildingName, rooms, leases, strata)` → `{warehouse, locators, products, subscriptions,
   skipped, units, _watermark}`. Per room → locator+product; lease→subscription(MONTHLY_RENT, party=tenant);
   strata→subscription(QUARTERLY_STRATA_FEE, party=owner); a record whose `unit_guid` is NOT a real room is
   SKIPPED into `skipped[]` (never fabricate a locator); `units` DERIVED via `propertyUnits`. Subscriptions
   wrapped `{row, unit_guid, kind, storey}` — the AD row stays column-pure; the wrapper is VIEW trace.
2. **Seed** `hba_lens.js bindStoreysFromModel` (same gate as P7/P8): `A._hbaTenancySpec = compileBuilding(...)`
   from the REAL room set + `models.js` Tenancy/Strata records; `§HBA_TEN` log.
3. **Pane** `viewer/hba_tenancy.js` (`HBATenancyPane`, mirrors `hba_leave.js`): watermark; KPI chips
   (Warehouse · Units-derived · Leases · Strata); per-subscription rows (ref · party · unit+storey · cadence ·
   start→renewal · paid-until honest "—"); skipped-count footer when non-empty.
4. **§FIND-FM-LINK (the "just a link"):** each row click → fly the camera to the unit's room centroid —
   centroid via the avatars idiom (`zoneMeshGuids`+`guidTargets` over `A.guidMap`+`_hbaRoomMembers`), flight
   via the `navigate_find` idiom (direction-preserving ease lerp of `camera.position`+`controls.target`).
   `§HBA_TEN_LINK guid=… center=(…)` log; honest no-op (logged) when the room has no rendered members.
5. **FAMILY 7→8**: `{kind:'pane', id:'tenancy', label:'Tenancy / AD'}` + `PANE_GLOBALS.tenancy`; drawer icon
   self-contained. `viewer.html` gains `ad_tenancy.js` + `hba_tenancy.js` script tags.
6. **Witnesses:** `witness_ad_tenancy.js` AD-TEN1 updated ('0' default) + AD-TEN7 (compileBuilding: counts,
   derived units, skip-non-room, both types, watermark, column-pure rows); NEW `witness_tenancy_pane.js`
   (W-HBA-TEN-PANE: off=no-DOM, data-gate, mount KPIs match compile, row click captures the fly target ≈ stub
   centroid, unmount zero-residue, watermark); `witness_family.js` 7→8 entries. Live chromium smoke
   (`cdp_shot.js` HHS): FM drawer → Tenancy → row click → camera moves, `§HBA_TEN_LINK`, jsErrors=0, shot.

---

## ▶ §P10a — UX/data-model triage (user 2026-07-02, post-first-use feedback), folded into §P10-BUILD

User tried the drawer live and filed 3 findings + a design brief ("triage as a system designer, suggest more
elegant presentation + data modelling"). Resolved by dialogue, then re-confirmed point-by-point. This section
supersedes the plain version of §P10-BUILD above — build the ENRICHED version below, not the bare one.

**1. Naming — "Human-Asset".** The pill already showed a decent label (`FM / Operate`, `panels.js:1159`) but
its icon is literally named `fmCockpit` — a stray, unpromoted name. User's replacement: **"Human-Asset"**
(captures People+Asset in one phrase, matches the module's own name `hr_bim_asset/`). Change the DISPLAY text
only — pill `name:` (`panels.js:1159`) and drawer header (`hba_lens.js:354`). Keep the internal id `hbaFM` and
all function/global names unchanged (29 witness files + `demo/fm_panel.html` reference them) — renaming those
is a mechanical, unrelated-risk refactor the user didn't ask for.

**2. Close = deliberate ✕ only.** Bug, not a preference: `hba_lens.js:373` currently does
`activateLens(A, e); d.remove();` on EVERY row click — selecting a lens always kills the drawer as a side
effect. Fix: row click activates the lens/pane and RE-RENDERS the row list in place (updated highlight/●on
badges) — the drawer element itself is never removed by a row click. Add one explicit **✕** button in the
header; it (and re-tapping the pill, which already toggles via `familyActive()`) are the only two ways to
close. `openFamilyDrawer` is refactored into a persistent-container + `_renderRows()` inner function so a
row click can refresh without a remove/recreate flicker.

**3. AD_User is the primary identity; C_BPartner only for HR/Payroll; scope = spatial only, not ERP financials.**
Verified against `build/erp/ad_full.db PRAGMA table_info(ad_user)`: the REAL native `ad_user` table already
carries `name`/`email`/`phone`/`phone2` AND an optional (nullable) `c_bpartner_id` — so "AD_User with or without
a BPartner link" is not a workaround, it's the native shape. Decision:
- New `MODELS.Official` (`models.js`, table `AD_User`) — one row per person the FAMILY drawer needs to name:
  the 2 payroll employees (`EMP001`/`EMP002`) and the 3 demo tenants (`BP-TEN-1/5/6`). Fields: `ad_user_id`,
  `name`, `email`, `phone`, `c_bpartner_id`. **`c_bpartner_id` populated ONLY where a real link already exists
  in this codebase** — `ad_payroll.js`'s `EMP001→1001`/`EMP002→1002` (HR/Payroll IS involved) — and left `null`
  for the tenant rows (no real `C_BPartner` row backs a bare `BP-TEN-*` label in this demo set; forcing one
  would be invention — same discipline already applied to `PropertyManagement.manager`, AD-TEN6). Compiles via
  a new `ad_tenancy.toUserRow(person)` → the literal native `ad_user` shape.
- **Scope wall (the "avoid clutter/redundancy" ask):** every Viewer-side HBA surface (lenses + panes) shows
  ONLY data that resolves to a spatial element in THIS building — occupant identity for a room, asset location,
  a lease's unit+party+cadence. It does **not** attempt portfolio-wide financial rollups (aggregate rent
  roll across buildings, GL postings, invoice aging) — those belong on a **separate ERP-side Dashboard**
  (out of scope for this Viewer work; noted as a FUTURE surface, not built here, not invented a shape for here).
  This is a scope boundary, not a feature to build now.

**4. Presence → a side drawer of persons, click-to-zoom.** Today "Presence" only tints room density (a color,
no names). New: clicking the Presence row ALSO opens a second small drawer beside the FM drawer, listing every
`attendance.sessions(log)` entry for the current period (person via `MODELS.Official` lookup by name-match on
the attendance `employee` id — e.g. `EMP001`; zone = room name/storey) with in/out time; row click flies the
camera to that person's zone. Reuses the SAME fly-to primitive as §P10-BUILD point 4 (below) — build it ONCE
as `flyToZone(A, guid)` in `hba_lens.js`, call it from both the Tenancy pane row-click and the Presence-drawer
row-click (no duplicate camera code).

**5. Top smart search — Room No / `AD_User` phone, borrowing Find's Storey/Room facets, OK to be redundant.**
A single `<input>` at the top of the FM drawer (below the header, above rows) filtering across: `A._hbaRooms`
(room name/storey — already populated by `bindStoreysFromModel`, the exact data Find's own Storey/Room tree
reads) + `MODELS.Official` (name/email/phone). On a room match → `flyToZone`; on a person match with an open
attendance session → `flyToZone` to their current zone. **Explicitly redundant with Find's own index** (Find's
tree lives in a private closure inside `navigate_find.js` and isn't exported — true reuse isn't mechanically
available) — user accepted the duplication for this POC ("ok to be redundant, just for convenience and early
showcasing").

### §P10a-BUILD (execution order — extends §P10-BUILD, same files + 2 new ones)
1. `models.js` — add `MODELS.Official` (5 records, watermarked for free by the existing stamp loop).
2. `ad_tenancy.js` — add `toUserRow(person)`.
3. `panels.js:1159` — pill `name: 'Human-Asset'` (id/fn/isActive unchanged).
4. `hba_lens.js` — header text → `'Human-Asset'`; `openFamilyDrawer` refactor (persistent container, ✕ button,
   row click no longer removes); `flyToZone(A, guid)` shared helper; `openPresenceDrawer(A)` (person list +
   row-click→flyToZone); search `<input>` wired to the same filter+flyToZone path; FAMILY 7→8
   (`{kind:'pane', id:'tenancy', label:'Tenancy / AD'}`, per §P10-BUILD point 5).
5. `viewer/hba_tenancy.js` (NEW, per §P10-BUILD points 2-3) — built AD_User-aware from the start: party column
   resolves through `MODELS.Official` to show name+email+phone, not a bare `BP-TEN-1` code.
6. `viewer.html` — add `ad_tenancy.js` + `hba_tenancy.js` script tags (per §P10-BUILD point 5).
7. **Witnesses:** extend `witness_family.js` (header text, ✕-only close, row click keeps drawer, FAMILY 7→8);
   NEW `witness_ad_user.js` (toUserRow shape, c_bpartner_id populated iff HR/Payroll-linked, watermark); NEW
   `witness_tenancy_pane.js` (per §P10-BUILD point 6, AD_User party display); NEW `witness_presence_drawer.js`
   (session list, person-name resolution, flyToZone target capture, honest no-op when a zone has no rendered
   members); NEW `witness_smart_search.js` (room-name match, phone match, no-match honest empty). Live chromium
   smoke (`cdp_shot.js` HHS, extends the existing `fm_panel.html` harness): drawer opens, ✕ closes, row click
   keeps it open, Presence drawer lists + zooms, search finds a room by name and a person by phone digit,
   0 console errors, screenshot.

---

## ▶ §P10b — IoT sensor mockup + CCTV mockup + ERP C_Order billing link + draggable panels (user 2026-07-02)

User, mid-§P10a build: clicking **Assets/IoT** should pop a 24h sensor-reading mockup (temperature, boiler
pressure, sound, dust, solar-panel output, electrical) — reference cited: the RiverIoT/Federation pattern in
IfcOpenShell/Bonsai (an external inspiration for the SHAPE of the idea, not a library dependency here) — plus a
6-camera CCTV mockup panel, an ERP link projecting each sensor reading as a **billable `C_Order`/`C_OrderLine`**
row (product=sensor, qty+UOM=the reading), and **every HBA pane becomes draggable**. Explicitly labeled a
**mockup** by the user — no real IoT hardware, no real video feed; the discipline that still applies is
**non-invent on the SHAPE**: reuse the REAL native AD tables for the ERP-link half, and be honest that the
sensor readings themselves are synthetic/demo (same CONTOH/SAMPLE watermark as every other HBA demo record).

### §P10b-CHECK — native shapes verified (`build/erp/ad_full.db` PRAGMA table_info, falsifiable)
- `c_orderline`: `c_order_id · line · c_bpartner_id · m_product_id · c_uom_id · qtyordered · priceactual ·
  linenetamt` — a sensor reading compiles cleanly onto this (product=the sensor, qty=the reading, uom=the
  physical unit) — SAME pattern as `ad_tenancy.toSubscriptionRow`, no new table.
- `c_order`: header carries `documentno · docstatus · issotrx` — ONE order per building/period groups the
  sensor lines (mirrors `toWarehouseRow`'s "one row per building, created since the demo building has none yet").
- `c_uom`: existing rows cover `Each/Hour/Day/Litre/...` but **NOT** the physical units these 6 sensors need
  (°C, bar, dB, µg/m³, W/m², kWh) — a genuine dictionary gap, same treatment as `M_Warehouse`/`C_SubscriptionType`
  being CREATED on demand in `ad_tenancy.js` (the established precedent: extend the native dictionary with the
  missing master row, never bolt on a parallel unit system). New `C_UOM` rows are compiled, not invented ad hoc.

### §P10b-BUILD
1. **`hr_bim_asset/iot.js`** (NEW engine, additive): `SENSORS` catalog — 6 entries `{key, label, uom_name,
   uom_symbol, baseline, amplitude}` (temp °C, boiler pressure bar, sound dB, dust µg/m³, solar W/m², electrical
   kWh). `demoSeries(assetGuid, hours)` — DETERMINISTIC synthetic 24-hourly-point series per sensor (a smooth
   sinusoid + a fixed per-hour offset table, NOT `Math.random()` — reproducible, watermarked, explicitly a
   MOCKUP series, never claimed as a real telemetry read). `toUomRow(sensorKey, seedId)` / `toOrderRow(building,
   period, seedId)` / `toOrderLineRow(sensor, reading, c_order_id, m_product_id, c_uom_id, line, seedId)` — the
   native compile functions (mirrors `ad_tenancy.js`'s pattern exactly, same file-header discipline).
   `billingLines(assetGuid, series)` — the reading-at-latest-hour compiled to one `C_OrderLine` PER sensor,
   wrapped `{row, sensor, reading}` (column-pure `row`, wrapper = view trace, same convention as
   `ad_tenancy.compileBuilding`'s subscription wrapper).
2. **`viewer/hba_iot.js`** (NEW pane, mirrors `hba_leave.js`): mounts on the `maintenance` FAMILY entry's row
   click (Assets/IoT already tints the model — kind:'lens' — this ADDS a supplementary pane, same dual-action
   pattern already built for Presence in §P10a point 4: tint stays, richer detail opens alongside). 3 sections:
   (a) 6 small `Chart.js` line charts (reuses the ALREADY-BUNDLED `viewer/lib/chart.umd.min.js`, same engine
   `hba_dashboard.js` already uses — no new charting dependency), one per sensor, 24 hourly points, watermarked;
   (b) a 2×3 CCTV MOCKUP grid — 6 tiles, each a small `<canvas>` with a **clearly-labeled placeholder pattern**
   (moving scanline + "CAM n · MOCK FEED" caption) — **no invented video/GIF asset, no external URL fetch**
   (PRIME RULE: never fetch/guess a URL); honest that there is no real camera; (c) the ERP billing table —
   `iot.billingLines()` rendered as sensor · latest reading+uom · `C_OrderLine` qty/uom/priceactual/linenetamt ·
   a "Billable" badge, with the compiled `C_Order.documentno` shown as the grouping header.
3. **`viewer/hba_draggable.js`** (NEW tiny shared utility, additive): `HbaDraggable.enable(paneEl, handleEl)` —
   pointer-down on `handleEl` switches the pane from its fixed `right/top` anchor to a `left/top` drag-follow
   (clamped to the viewport), pointer-up releases; returns a `disable()` fn. Pure DOM, zero THREE/viewer-core
   coupling. Retrofit into the 5 existing panes' header (`hba_dashboard.js`, `hba_payslip.js`, `hba_leave.js`,
   the new `hba_tenancy.js`, the new `hba_iot.js`) — one `HbaDraggable.enable(pane, head)` call added to each
   `mount()`, everything else about those files unchanged.
4. **FAMILY entry:** `maintenance`'s `detail` text gains "— click opens sensor charts + CCTV mockup + billing";
   no new FAMILY row (IoT reuses the existing Assets/IoT entry — the pane opens as a side effect of that same
   click, same convention as Presence's roster).
5. **Witnesses:** NEW `witness_iot.js` (SENSORS shape, deterministic series — same input → same output, twice —
   toOrderLineRow/toOrderRow/toUomRow native-column shape, billingLines wrapper, watermark on every output);
   NEW `witness_iot_pane.js` (off=no-DOM, data-gate on a real asset guid, mount renders 6 charts + 6 CCTV tiles
   + N billing rows, unmount zero-residue); NEW `witness_draggable.js` (enable binds pointer handlers, a
   simulated pointerdown→pointermove→pointerup sequence moves the pane's left/top, disable removes the
   handlers — stub DOM + stub pointer events, no real browser needed for the mechanics). Live chromium smoke
   extends `fm_panel.html`: IoT pane opens with 6 rendered charts + 6 CCTV tiles + billing rows, drag the
   Tenancy pane by its header moves it, 0 console errors, screenshot.

**Follow-up fix (2026-07-02, doc-screenshot session):** `demo/fm_panel.html` never loaded
`viewer/lib/chart.umd.min.js` — `window.Chart` was undefined, so EVERY chart in the demo (Dashboard's bar/
doughnut/trend AND IoT's 6 line charts) silently no-op'd (`if (G.Chart)` guard) and rendered as blank boxes.
Fixed: added the script tag. Also fixed `hba_iot.js`'s per-sensor chart wrapper — a label `<div>` was sharing
the SAME `position:relative` box Chart.js measures for `responsive` sizing (the canvas's own box must hold
ONLY the canvas, per `hba_dashboard.js`'s existing convention) — split into an outer label box + an inner
canvas-only box. Both fixes verified live (`hr_bim_asset/tests/live/cdp_shot.js`): all 6 sensor curves now
render. Doc screenshots `docs/img/hba_iot_sensors.png` + `hba_iot_cctv.png` published to `HRBIMAssetGuide.md`
§"Spot equipment that needs service" (bim-compiler repo, via `safe_gh_deploy.sh`).

---

## ▶ §P10c — QUEUED, NOT STARTED (user 2026-07-02, do in a NEW session)

**User ask:** *"add some audio effects to the IoT panel, so each bar movement has own tone."* Not scoped or
built this session — spec it here for the next one.

**Reading of the ask (to confirm/refine next session, don't just start coding):** the IoT pane's 6 sensor line
charts move as new values come in (currently they're static 24h snapshots — no live "bar movement" yet, so
this ties to a FUTURE live-update tick, not the current one-shot render). Per-sensor, a value change should
play its own tone — plausible mapping: each of the 6 `SENSORS` gets a distinct pitch/timbre (e.g. by
`sensor.key`), the tone's pitch or volume scaled by the reading's delta or its position in-range (baseline vs
amplitude), fired via the Web Audio API (`AudioContext` — no external audio asset, no fetched sample,
consistent with the CCTV mockup's "generate, don't fetch" discipline). Needs an explicit mute/volume control
(a pane full of sensors chiming is real user-hostile without one) and must be OFF by default (opt-in, like
every other HBA additive surface) — the existing `HbaDraggable`-style shared-utility pattern
(`hr_bim_asset/iot.js` for the tone-mapping math, a new `viewer/hba_audio.js`?) is probably the right shape,
mirroring how `flyToZone`/`HbaDraggable` were built as ONE shared primitive reused across panes rather than
per-pane copies — reuse across future audio-bearing panes if any.

**Open questions for the user before building (Spec-First — write the spec section proper before code):**
1. Does "bar movement" mean the pane needs a LIVE tick (values changing over time in front of the user), or
   is a tone-per-sensor-on-open/on-hover/on-click enough for this mockup? (No live-tick engine exists yet —
   the current series is a static 24h snapshot rendered once.)
2. Per-sensor tone design — pick from a scale, or literally map the reading value to a frequency (sonification)?
3. Mute/volume default and control placement (pane header? a global HBA audio toggle?).

---

## ▶ §P10d — QUEUED, NOT STARTED (user 2026-07-02, do in a NEW session)

**1. The live-vs-branch gap — CHECKED, here's the honest state.** User asked *"Is the feature working online in
GH?"* Checked both halves separately (they're two different sites):
- **`bim-compiler` docs site** (`https://red1oon.github.io/BIMCompiler/HRBIMAssetGuide/`) — **LIVE, confirmed**:
  page 200, the new "IoT sensor + CCTV cockpit" section text present, both screenshots 200 (`img/hba_iot_sensors.png`
  / `img/hba_iot_cctv.png`).
- **`bim-ootb` GH Pages** (`https://red1oon.github.io/bim-ootb/hr_bim_asset/demo/fm_panel.html`) — **200, but
  STALE**: `curl`'d the live HTML and it still reads **"FM / Operate"**, not "Human-Asset" — i.e. GH Pages
  serves `bim-ootb`'s `main` branch, and this whole arc (§P10-BUILD/§P10a/§P10b/the chart-load fix) lives ONLY
  on **`lane/hr-overlay`**, never merged. **The actual interactive feature (the real viewer, the real demo
  page) is NOT live for any real user right now** — only the documentation (static text + screenshots) is.
  **Next session: confirm with the user whether `lane/hr-overlay` should merge to `main`** (this repo's normal
  release path — check `~/bim-ootb`'s branch-protection/PR flow before merging solo) before calling this
  genuinely "live."

**2. Swap the CCTV mockup for a real still — `~/Pictures/Screenshots/contacam.jpeg`.** User supplied a real
image (verified present: `652x666` JPEG, 118KB, a ContaCam capture — i.e. actual CCTV-monitoring-software
output, not a stock photo) to use **in place of** the placeholder canvas-scanline tiles, **in BOTH places**:
- **The live viewer** (`viewer/hba_iot.js` `renderCctvTile` — currently a pure-canvas scanline+caption mockup,
  zero image asset) — swap to render this JPEG (as a `background-image` or drawn into the canvas via
  `drawImage`), still captioned "MOCKUP — NO REAL FEED" (it's a real photo, not a real feed of THIS building —
  don't blur that line). Needs the asset copied into `hr_bim_asset/` or `viewer/` (check the project's asset
  convention — `viewer/lib/` holds bundled libs, is there an `img/`/`assets/` folder already for viewer-local
  images?) and referenced by a relative path, not a hardcoded `~/Pictures` path (that's a local-machine path,
  won't resolve for anyone else — copy it into the repo).
- **The doc guide** (`docs/img/hba_iot_cctv.png`) — recapture the CCTV-grid screenshot with the swapped tile so
  the published guide shows the same thing the live viewer now does.
**Not done this session per explicit user instruction ("do it next session").** No code/asset changes made yet
— this section is the pointer + the located source file, not the implementation.

---

## ▶▶▶ CRITICAL — READ FIRST (2026-07-02): "Compile not Model" — HBA reinvented tables that already exist

**User doctrine restated (2026-07-02):** *"No invention outside the iDempiere AD."* Our hallmark vs. the outside
BIM/ERP world is **Compile, not Model** — a compiled BIM element lands as a row in the SAME dictionary the ERP
already runs on (Product/BPartner/Document), not a parallel schema glued on by an integration/ETL step (which is
what Autodesk↔Procore↔Yardi↔Workday do to each other). **This gates P7/P8 below — do not build a view on an
invented schema when the native table is sitting unused one folder over.**

### What was checked, and how (falsifiable — re-run these if in doubt)
Verified against **real iDempiere source** (`~/idempiere-dev-setup/idempiere`, actual upstream git history —
migration SQL under `migration/i*/postgresql/*.sql`, generated model classes under
`org.adempiere.base/src/org/eevolution/model/`) **and** this project's own compiled
**`build/erp/ad_full.db`** (`sqlite3 build/erp/ad_full.db "PRAGMA table_info(<table>);"` / `.tables` / `SELECT count(*)`).
Not assumed from the spec's prose — the spec's prose was WRONG on one load-bearing claim (below).

### Finding 1 — the vision doc's core premise is FALSE, and needs correcting
`§VISION` says *"iDempiere/ADempiere never shipped real Payroll, so there is no incumbent to merely match."*
**False.** iDempiere ships a full native HR/Payroll dictionary (the eEvolution contribution, present in upstream
history back to early migrations): `hr_employee`, `hr_contract`, `hr_department`, `hr_job`,
`hr_concept`/`hr_concept_category` (= pay elements/rules), `hr_payroll` (= the run), `hr_payrollconcept`,
**`hr_movement`** (= the calculated pay line), `hr_process` (= the run document, docstatus/docaction/posted),
`hr_concept_acct` (= the GL account mapping), `hr_period`/`hr_year`. **All 19 tables are already present, right
now, in this project's own `build/erp/ad_full.db`** (and `internal/ad_full_idempiere_gardenworld.db`) — **0 rows**,
dormant. `C_BPartner.isemployee` is likewise REAL (col present, `TEXT`, confirmed via a genuine `AD_Val_Rule`
migration `migration/i5.1/postgresql/201709181100_Ticket_1008477.sql` referencing `SELECT IsEmployee FROM
C_BPartner`). **The corrected, SHARPER pitch:** not "no incumbent has payroll" (falsifiable, wrong) but *"iDempiere
carries a two-decade-old native HR/Payroll dictionary that is functionally dormant everywhere it's deployed — no
engine runs it, no UI surfaces it. We're first to activate those exact tables with a signed, glass-box,
deterministic-replay engine, and first to compile a real building's geometry straight into that same dictionary."*
Any doc asserting the old claim (`docs/SpatialERPIntegration.md`, `docs/HRBIMAssetGuide.md`, this file's own
`§VISION`) needs this correction before further public use — flagged, not yet edited (ask first, these are
deployed/live docs).

### Finding 2 — table-by-table: HBA's invented shape → the native AD table it should compile into instead

| HBA invented shape (`hr_bim_asset/*`) | Native AD table (verified columns) | Notes |
|---|---|---|
| `documents` (`doc_type=PAYRUN`), lifecycle draft→calculate→approve→post | **`hr_process`** — `hr_payroll_id`, `hr_period_id`, `docstatus`, `docaction`, `documentno`, `posted`, `processed`, `c_doctype_id` | This IS the PAYRUN doc, natively, with real doc-lifecycle columns HBA's version doesn't even have (docaction/docstatus workflow). |
| `document_lines` (one payslip/employee: base/ADD/SUB elements + `.trace`) | **`hr_movement`** — `c_bpartner_id`, `hr_concept_id`, `hr_concept_category_id`, `amount`, `qty`, `accountsign`, `servicedate`, `validfrom/to`, `hr_process_id` | The calculated line. `accountsign` ('+'/'-') **is** HBA's `side: ADD/SUB` — already a native column, not something to invent. |
| pay-element rule (`elements[]`: `kind` FIXED/%/FORMULA, `side`) | **`hr_concept`** (`accountsign`, `type`, `columntype`, `value`, `ispaid`, `isreceipt`) grouped by **`hr_concept_category`** | `hr_concept_category.hr_concept_acct` even points at the GL mapping row directly. |
| formula evaluation (`rules.js` `evalRule`, JSON-declarative, produces `.trace`) | **`hr_payrollconcept.ad_rule_id`** (an `AD_Rule` script object) | Native iDempiere evaluates via an opaque AD_Rule script — HBA's declarative JSON-rule-with-trace is a GENUINE improvement (glass-box, auditable) worth KEEPING as the execution engine, while the concept's *identity/category/account* still compiles into `hr_concept`/`hr_concept_acct`. Don't throw this part out. |
| GL post (`glFor()` hand-rolled Dr/Cr) | **`hr_concept_acct`** — `hr_revenue_acct`, `hr_expense_acct`, `c_acctschema_id`, `isbalancing` | The dotted GL line already has a native mapping table; `glFor` should read/write through it, not invent its own account-string convention. |
| Employee (`party.base`/`party.ctx`) | **`hr_employee`** (`c_bpartner_id`, `hr_department_id`, `hr_job_id`, `hr_payroll_id`, `startdate/enddate`) + **`hr_contract`** (`c_bpartner_id`, `validfrom/validto`, `netdays`) | Contract term is `hr_contract.validfrom/validto`, not a generic `p.term` bolted onto every profile. |
| Occupancy `models.js` (`assignment_no`/`s_resource`/`resource_product`/`party`/`assign_from`/`assign_to`/`qty`) | **`s_resourceassignment`** (real cols: `s_resource_id`, `name`, `description`, `assigndatefrom`, `assigndateto`, `qty`, `isconfirmed`) + **`s_resource`** (`value`, `name`, `s_resourcetype_id`, `isavailable`, `chargeableqty`, `percentutilization`) | Field names are close paraphrases, not the real columns, and live in a separate `hr_seed.db` that never touches `ad_full.db`. **11 real `s_resource` rows and 2 real `s_resourceassignment` rows already exist** in `ad_full.db` today (stock 2003 GardenWorld demo content — "Fertilizer Plant," "Garden Layout" — not this project's buildings, but proof the table is live, not just schema). |
| Room ↔ Resource conceptual link (spec said "Room = S_Resource IS-A M_Product") | **REVERSED from what the spec says**: `m_product.s_resource_id` is the real FK (Product → Resource), confirmed by grepping every table for the column. Combined with the **BOM PRINCIPLE** (a BIM element already compiles to an `M_Product` row) — **a room's bookable-resource identity should hang off the SAME compiled Product row**, no separate `bim_guid` field needed on a hand-rolled Occupancy shape at all. |
| ⚠ **genuine native gap, not an HBA invention**: `s_resourceassignment` carries **no party/tenant column** at all (verified — full column list has none). | — | The booking record is pure calendar (dates/qty/confirmed); "who" leased/booked it natively lives on the **commercial document** (`C_Order`/`C_Invoice.c_bpartner_id`), not on the resource assignment. HBA's `party` field on Occupancy isn't reinventing a wheel here — it's filling a real native gap, but it belongs on the ORDER/INVOICE side, not bolted onto `s_resourceassignment`. |
| Tenancy (`HR_Lease`: unit/tenant/rent/term) as an invented `documents doc_type=RENTRUN` | **`c_recurring`** (`recurringtype`, `c_order_id`, `c_invoice_id`, `frequencytype`, `frequency`, `runsmax`, `datenextrun`) + **`c_subscription`**/`c_subscriptiontype` + `c_orderpayschedule`/`c_invoicepayschedule` | Native recurring-billing off a base `C_Order`/`C_Invoice` — a lease is just an Order with a `C_Recurring` header generating periodic invoices. **No RENTRUN/FEERUN doc-type needs inventing** — profile #2 (tenancy) and #4 (strata) both collapse into this ONE native mechanism, differing only by which BPartner/product they recur against. `c_recurring` has **1 real row already** in `ad_full.db`. |
| `PM_Asset` (`bim_guid`↔`iot_device`↔`operator`/`vendor`/`personnel`↔`pm_cycle`↔`next_due`) | **`a_asset`** (Fixed Asset module, 20 sibling tables) — has `m_product_id` (direct!), `c_bpartner_id`, `lease_bpartner_id`, `leaseterminationdate`, `lastmaintenencedate`/`nextmaintenencedate`, `isowned`, `a_asset_group_id` + **`a_asset_product`** (asset↔product join) | Already carries **3 real rows** in `ad_full.db`. Because `a_asset.m_product_id` links directly to a Product, and a BIM element already compiles to a Product (BOM PRINCIPLE), **the asset↔BIM link is already native — no separate `bim_guid` field needed.** This single table covers most of Pillar-4's §7D asset/maintenance ambition already. |
| `PM_Property`/`PM_Strata_Parcel` (hand-rolled) | Not yet matched to a native table — **NOT VERIFIED**, flagged as an open item, do not assume invented-is-necessary without checking (e.g. `C_BPartner_Location`/`M_Locator`/a dedicated strata concept may or may not exist natively). | Lower priority than Payroll/Occupancy/Asset above — check before building, don't build then check. |

### What HBA got RIGHT and should keep (the genuine differentiator, not reinvention)
- **The signed op-log (W-SIGN) over every domain** — no native AD table is tamper-evident or replay-verifiable;
  this is real, additive value sitting *on top of* the native rows, not competing with them.
- **The declarative JSON rule + `.trace`** (`rules.js`) — strictly better than opaque `AD_Rule` scripts for the
  glass-box story; keep it as the *execution engine* for `hr_concept`/`hr_payrollconcept`, not as a schema.
- **The guid↔mesh spatial binding** (`binding.js`) — genuinely new; no native AD table carries a BIM guid or mesh
  reference anywhere (grepped every table for `s_resource_id` reverse-refs and for any guid-shaped column — none
  found). This is the actual moat, unchanged by this finding.

### Revised priority (supersedes the P7/P8/P9 order below until this is resolved)
- **P7-PRE ✅ DONE 2026-07-02 (`hr_bim_asset/ad_payroll.js`, `W-HBA-AD-PAYROLL 13/13`).** New module compiles
  payroll into native `hr_process` (the run) / `hr_movement` (one row per employee×concept) / `hr_concept`+
  `hr_concept_category` (pay-element identity, `accountsign` IS the native ADD/SUB column) / `hr_concept_acct`
  (GL mapping — `epf_payable`/`pcb_payable` resolved per-concept, not a hardcoded profile string) / `hr_contract`
  term-scoping. Kept ON TOP (genuinely ours, not invented, not native either): the declarative `rules.js`
  FIXED/RATE/BRACKET rule + `.trace` as the execution engine (native iDempiere only offers an opaque `ad_rule_id`
  script here), and the signed op-log (W-SIGN) wrapping every `hr_process`/`hr_movement` write. **W-HBA-AD-PAYROLL
  13/13**: AD0×2 = the NON-INVENT GATE itself (every emitted row's keys ⊆ an INDEPENDENTLY-sourced real-column
  list, captured fresh via `PRAGMA table_info` — not imported from the implementation, so it can't grade its own
  homework) · AD1 arithmetic identical to the already-accepted `witness_run.js` demo baseline (EMP001 gross=5200
  net=4234, reused not reinvented) · AD2 `accountsign` native · AD3 GL balances Dr=Cr=8400 through the
  `hr_concept_acct` lookup · AD4/AD5 signed+tamper-evident · AD6/AD7 deterministic replay==live · AD8 `hr_contract`
  term-scoping (lapsed contract → honestly excluded) · AD9 `payslip()` reader (groups movements per employee,
  watermarked, trace-carrying) — **this is what P7's view will render off**, not a new schema. `connectors.js`'s
  header comment (the wrong "PAYRUN→documents/PAYSLIP→document_lines" mapping) corrected in place. Full existing
  suite re-run **zero regression** (18 files, all still green). `engine.js`'s generic payroll profile
  intentionally left in place (untouched) — `witness_leave.js` still depends on it; retiring it is a follow-up
  once Leave (P8) is itself native-checked, not bundled into this slice.
- **P-OCC-RETRO ✅ DONE 2026-07-02 (`occupancy.js` `toResourceAssignmentRow()`, `W-HBA-AD-OCC 4/4`).** The signed
  ASSIGN/RELEASE/UNAVAIL op-log + REPLAY availability engine (21/21, already sound) is UNCHANGED — added a
  projection of an ASSIGN op onto the real `s_resourceassignment` columns (`s_resource_id`/`assigndatefrom`/
  `assigndateto`/`qty`/`isconfirmed`). Confirmed `s_resourceassignment` has **no native party/tenant column at
  all** — `party` is carried alongside for the caller to thread onto `C_Order`/`C_Invoice.c_bpartner_id` instead
  (a real native gap, not an HBA omission). Also fixed `models.js`'s decorative Occupancy demo record to the
  real column names (was a hand-paraphrased shape) and corrected the backwards FK claim ("Room IS-A M_Product" →
  the real FK is `m_product.s_resource_id`, Product→Resource).
- **P-ASSET-RETRO ✅ DONE 2026-07-02 (`models.js` `toAssetRow()`, `W-HBA-AD-ASSET 4/4`).** Projects the `PM_Asset`
  demo record onto real `a_asset` columns (`m_product_id`=the asset's `bim_guid` directly — the BOM PRINCIPLE
  means a BIM element already compiles to a Product, so no separate guid column is needed; `c_bpartner_id`,
  `isowned`, `nextmaintenencedate`). Honest gap: `a_asset` has ONE `c_bpartner_id`, not three — `vendor`/
  `personnel` are carried outside the row (`_vendor`/`_personnel`), never forced into a column that can't hold
  all three parties. `timeline.js`'s shipped consumption (`W-HBA-TIMELINE 7/7`, merged into the 4D editor) is
  UNTOUCHED — this is an additive projection, not a replacement.
- **P8 (Leave) ✅ VERIFIED, NOT GATED (2026-07-02)** — searched upstream iDempiere + this project's own
  `ad_full.db` for any `HR_Leave`/`Vacation`/`Absence`-shaped table: **none exists, anywhere.** `leave.js` is
  genuinely novel, not a reinvention — proceed on it same as before, no native retarget needed. Its payroll feed
  is now closed onto the native shape too: `ad_payroll.js` gained an `UNPAID_LEAVE` concept + `emp.extra[]` (the
  honest feed-point for a per-employee-per-period deduction computed elsewhere) — `W-HBA-AD-PAYROLL` AD10 proves
  `leave.leaveDeduction()`'s output lands as a real `hr_movement` row, GL still balances. **`W-HBA-AD-PAYROLL` now
  15/15.**
- **P9 (Research Gate)** — unchanged, still paused per user 2026-07-02.
- **Tenancy + Strata (`§PILLAR 4` profiles #2/#4) ✅ DONE 2026-07-02 (`hr_bim_asset/ad_tenancy.js`,
  `W-HBA-AD-TENANCY 12/12`).** User design review (2 rounds) corrected the model twice before landing:

  1. **`c_recurring` was the WRONG table** — it's a header that POINTS AT an existing `C_Order`/`C_Invoice`
     (needs one to pre-exist). The right native table is **`C_Subscription`** (`c_bpartner_id`=party,
     `m_product_id`=the leased unit — itself already a compiled BIM element per the BOM PRINCIPLE,
     `c_subscriptiontype_id`=frequency, `startdate`/`paiduntildate`/`renewaldate`/`isdue`) — **self-contained,
     no Order/Invoice pre-req.** `C_InvoicePaySchedule`/`C_OrderPaySchedule`/`C_PaymentTerm` remain correct for
     the OTHER already-distinguished case (purchase-with-terms), not rental.
  2. **`M_Locator.X/Y/Z` are NOT Cartesian coordinates** (first-pass mistake, caught by user WMS review) —
     verified against `ad_full.db`'s own `AD_Element` dictionary: `X`="Aisle (X)", `Y`="Bin (Y)", `Z`="Level (Z)"
     — the classic WMS bin-address triple (e.g. `02-B-03` = aisle/row, bin/rack-section, level/shelf-height).
     Aisle+Bin are horizontal, Level is vertical — so **Level maps onto a building's storey** (floors stack
     vertically; the fixture's real extracted `room.storey` field, e.g. `"Level 1"`), **Aisle maps onto a
     block/wing** (real when a building has one; honestly `null` for HHS's single tower — never guessed), and
     **Bin has no building-side analog** (left unset, not forced). The room's real geometry (precise position)
     stays authoritative on the BIM/viewer side, joined back only by guid (`m_locator.value`) — this AD record
     is a WMS-style business ADDRESS for ERP-side lookup, not a duplicate coordinate store.
  3. **Strata needs NO new table** — it is the IDENTICAL `C_Subscription` mechanism as Tenancy: same
     `c_bpartner_id` (owner instead of tenant), same `m_product_id` (the same unit), just a different native
     `C_SubscriptionType` row (`QUARTERLY_STRATA_FEE`, frequency=3, vs `MONTHLY_RENT`, frequency=1).
     `PM_Strata_Parcel` retires entirely — `toSubscriptionRow(record, m_product_id, subscriptionType, seedId)`
     serves both profiles.

  **"Building" precedent (verified, not hypothetical):** `build/erp/bim_embed.js` §B4 ("the framework proof")
  already attaches a standard `AD_Attachment` row (table 254, `ad_table_id=190` M_Warehouse, `record_id=103`,
  title `"HQ Warehouse (Terminal model)"`) pointing at the compiled Terminal viewer — i.e. `M_Warehouse` is
  ALREADY used as "a Building" in this exact repo. `M_Product.m_locator_id` is a real column, so
  **Product(unit) → Locator(room, WMS address) → Warehouse(building)** is wired natively, schema-only.
  Declaring the BIM-set attachment on a new HHS warehouse row stays `bim_embed.js`'s job (ERP-side, when ERP
  co-loads) — not reimplemented in HBA, per the "dotted lines only" doctrine.

  **The model, shipped:**
  | Concept | Native AD row |
  |---|---|
  | Building | ONE `M_Warehouse` row per building (new — HHS has none yet, unlike GardenWorld/Terminal) |
  | Room / leasable unit | `M_Locator` (WMS address: `z`=real storey, `x`=block-when-real) + `M_Product` (`m_locator_id` link) |
  | Lease (tenant) | `C_Subscription` (`c_bpartner_id`=tenant, type=`MONTHLY_RENT`) |
  | Strata (owner) | `C_Subscription` (`c_bpartner_id`=owner, type=`QUARTERLY_STRATA_FEE`) — same table, same function |
  | Rent/fee received | **honest gap, isolated to one field:** `paiduntildate` stays `null` until a real `C_Invoice`/`C_Payment` exists (the one remaining Order-engine dependency) |
  `W-HBA-AD-TENANCY 12/12`: non-invent gate (3 tables) · WMS-address correctness (level=storey, no fabricated
  coordinates) · Product→Locator→Warehouse chain · self-contained subscription (no Order/Invoice FK) · honest
  `paiduntildate` gap · Strata same-shape + different-role/type proof. Zero regression across the full 22-file
  HBA suite. `WM_DeliverySchedule` (a user-recalled Red1 WMS plugin) was searched for on this machine
  (`~/Projects/red1_plugins/`, whole home) — not found, no Bitbucket remote configured anywhere; not factored in,
  flagged rather than guessed at.

---

## ▶▶ NEXT SESSION — "Demonstrate a true Spatial ERP" (user 2026-07-01)

> The mission distilled (user, 2026-07-01): **demonstrate a TRUE Spatial ERP** — ERP/operate records living ON
> the building geometry, found spatially, with a **delightful UI where a user finds things easily and there is no
> redundancy**. Everything below serves that. **Branch `lane/hr-overlay` (worktree `/tmp/wt-hr`), 18 witnesses
> GREEN, all pushed.**

### STANDING RULES this work is judged by (do NOT regress)
1. **WHITEBOX-FIRST (user directive).** The §-log / witness must TELL you the truth — never rely on visually
   eyeballing a screenshot. A driver `§DIAG` line caught `roomsInGuidMap=0` and `tintedMeshes=0` before any
   image was opened. Add a `§`-log/witness for every claim; screenshots are *confirmation*, not verification.
   The reusable live-3D harness is `hr_bim_asset/tests/live/cdp_shot.js` (zero-dep CDP driver; serve the worktree
   with `python3 -m http.server 8099`, drive the REAL viewer, print `§DIAG`).
2. **DEMO-DATA RICHNESS STANDARD (user directive).** The seed must be **well-populated and meaningful** so the
   panel/dashboard/lenses *present richly* — NOT the current sparse look (dashboard showed only Level-1 populated,
   "8 rooms / 38% / 3 tickets"; lenses said "no data"). **Acceptance bar:** multiple storeys populated; occupancy
   shows a real mix (occupied/expiring/vacant/unavailable); presence shows varied headcounts; class shows a
   residential/commercial/office mix; ≥1 asset; ticket-aging spread across buckets. Non-invent (real guids,
   watermarked sample values), but RICH.
3. **Serve localhost; deploy only when happy** (user). The public docs site is already live; re-deploy via
   `safe_gh_deploy.sh` only after the screens meet the standard.

### BACKLOG (priority order) — work to zero
- **P1 — INSTANCED-TINT (the live lens actually paints). ✅ DONE+LIVE 2026-07-01 — `tintedMeshes=19` on HHS
  (was 0), `emissiveOnly=0` ⇒ ALL 19 are instanced/batched per-slot tints.** TWO root causes, both fixed (the
  prompt's "just the `_N` suffix" diagnosis was incomplete):
  1. **`hr_bim_asset/overlay.js applyOverlay` drove `setTint` from `allGuids() ∩ linked`** — but `plan.linked` is
     ROOM guids and a room is NOT a rendered guid, so the intersection was EMPTY → `setTint` never fired for any
     room → 0 paint. The synthetic witnesses MASKED this (they put the room guid AS a rendered mesh value). FIX:
     iterate `plan.linked` directly (`port.setTint(zone)`), letting the port resolve zone→members; ghost the rest.
  2. **`viewer/hba_lens.js buildMeshPort` bare-id lookup** missed instanced/batched members keyed `<meshId>_<N>`
     and tinted whole-mesh `emissive` (no per-instance). FIX: new pure `binding.guidTargets()` reverse-indexes the
     `_N` suffix → `{meshId, slot}`; the port tints whole-mesh via emissive, per-slot via `setColorAt` (+ restore).
  Whitebox witness `tests/witness_meshport.js` **W-HBA-MESHPORT 8/8** (drives the REAL port + applyOverlay through
  stub InstancedMesh/BatchedMesh; M6 = the un-rendered-room gap the synthetics missed) + LIVE harness GREEN
  (`§DIAG2 … tintedMeshes=19`) + real lens-applied screenshot (cyan occupancy tints across HHS). Witness mocks in
  `witness_{view,presence}.js` made faithful (setTint no-ops an unresolved zone, like the real port). Closes #2b.
- **P2 — RICH DEMO DATA (the richness standard). ✅ CORE DONE+LIVE 2026-07-01 (occupancy + presence).** The old
  `occupancy.demoSeed`/`attendance.demoSeed` hard-coded only `g[0..4]` → only Level 1 populated (the sparse look).
  Rewrote both to spread a DETERMINISTIC, index-cycled MIX across EVERY room (g[0..4] behave identically → existing
  witnesses preserved): occupancy cycles occupied→expiring→vacant→occupied+renovation-blackout→assigned-then-
  released; presence spreads varied headcount bands over i≥3 (g0=3/g1=1 kept). LIVE on HHS (`§RICH`): **3 storeys
  populated** (util Level 1:0.71 / 2:0.92 / 3:0.33, was only L1), occupancy lens **lit 4→11 rooms** across all
  levels, **tintedMeshes 19→77**, 2026-03 mix occ8/vac3/unavail3, presence 11 zones / 3 storeys / 6 bands [1-6].
  Also added **`request.demoSeed`** (varied-age OPEN tickets → ALL 4 dashboard SLA buckets) wired into
  `bindStoreysFromModel` (`§HBA_REQ`); LIVE: **7 tickets, buckets {<1d:2,1-3d:1,3-7d:2,>7d:2}** (was empty). Gated
  on the REAL ROOM set (spatial_structure — available at seed time; the rendered-mesh set still streams then).
  Witness `tests/witness_richdemo.js` **W-HBA-RICHDEMO 9/9** (all storeys populated · 4-state mix · varied presence
  · ticket buckets all 4 · ticket non-invent · real guids · deterministic). Existing witnesses updated for the
  richer counts (O3/O4b/O6b/O9, dashboard D2). **RESIDUAL (carried forward):** class is a correct 3-way mix
  (office/commercial/residential) but only on the 3 leased units (class is a unit-level lease/strata attribute by
  design — spreading to all rooms = a `classRows` semantics change, decide if wanted); assets=1 (meets ≥1). ⇒ P2
  acceptance bar MET (occupancy/presence/ticket-aging multi-storey rich); only the optional class-spread remains.
- **P3 — PREP SAMPLE GW DATA. ✅ DONE+LIVE 2026-07-01 (user chose "aisles as zones").** GardenWorld
  (`buildings/warehouse_gardenworld.db`, 60KB, 26 elements) has **NO `spatial_structure`/`rel_contained_in_space`**
  → zero IfcSpace rooms. Added **§AISLE-ZONES fallback** to `hba_lens.js bindStoreysFromModel`: a building with no
  IfcSpace rooms groups its elements by the real `elements_meta.storey` (SITE/AISLE_A/B/C) → AISLE-as-ZONE (zone =
  the aisle, whose floor-slab guid is a real rendered element; members = the element guids in that aisle — all
  EXTRACTED, non-invent; SITE skipped). The spatial_structure query is now try-wrapped so a room-less db doesn't
  abort. LIVE on GW: `§HBA_AISLE 3 aisle-zones (A=5/B=9/C=11 members)`, occupancy lit 2, presence 2 zones, 2
  tickets; FM drawer greys Unit-class/Assets (wake-aware, no data) — correct. Fixture `fixtures/gw_aisles.json`
  (extracted) + witness `tests/witness_gw_aisles.js` **W-HBA-GW-AISLES 6/6** (aisles resolve · paint · occupancy
  mix · presence+tickets · non-invent). ⚠ LOCAL-SERVE NOTE: the viewer fetches `buildings/X` relative to
  `viewer/`; HHS is silently rescued by the OCI-prod retry (`W-DB-404-OCI-RETRY`) but GW isn't on OCI → for a local
  GW smoke pass `?db=../buildings/warehouse_gardenworld.db`. HHS remains the richer sample; GW = the fast loop.
- **P4 — NEWBIE GUIDE REWRITE. ✅ DONE 2026-07-01 (NOT deployed — "deploy when happy").** Rewrote
  **`docs/HRBIMAssetGuide.md`** (lives in the **bim-compiler** repo, in the mkdocs nav as "HR / Tenancy / Operate
  Module") from reference-style into a **task-oriented manual**: *Getting started* (numbered open→pill→drawer→
  toggle), *Common tasks* (occupancy/presence/assets/class/dashboard step-by-step), *Aisle-zones* section for
  room-less warehouses (GW), *lens reference* (exact colour legends + watermark), *Under the hood* (signed op-log
  · records · guid→members binding · `S_Resource` occupancy ledger · the periodic RUN engine + 4 profiles),
  *Troubleshooting* table ("no pill = no operate data", "greyed = no data"). Uses the REAL lens-applied
  screenshots `img/hba_occupancy_live.png` (HHS, 3 storeys) + `img/hba_gardenworld_aisles.png` (warehouse
  aisle-zones). All image/cross-link refs verified. Committed on bim-compiler branch **`docs/hba-guide-rewrite`**
  (pushed); **NOT gh-deployed** — review + `safe_gh_deploy.sh` when happy.
- **P5 — ERP INTEGRATION / SPATIAL-ERP DOC. ✅ DONE+DEPLOYED 2026-07-01.** New **`docs/SpatialERPIntegration.md`**
  (bim-compiler): "One Building, One Log, Three Surfaces" — the shared substrate (one model + one signed
  `kernel_ops` log), the three no-overlap surfaces (Viewer=spatial/where · ERP=money+docs/how-much · HR=people/who),
  the find-everything-no-clutter UX (one FM pill not six · wake-aware greying · records on geometry), one lease
  threaded through all three, the non-invent guid join, boots-standalone/lights-up-with-ERP. Added to mkdocs nav
  (Go Deeper) + reciprocal cross-link from `SpatialERP_OOTB.md`. Reuses the real lens screenshots. On branch
  `docs/hba-guide-rewrite` (pushed). **DEPLOYED LIVE** via `scripts/safe_gh_deploy.sh` (guard PASS, blessed benign
  `.nojekyll`; live 184→198 files, superset): P4+P5 both live 200 — `https://red1oon.github.io/BIMCompiler/
  HRBIMAssetGuide/` + `/SpatialERPIntegration/` (+ images 200), all 7 canaries 200.
- **P6 — AVATAR LOD "WOW". ✅ DONE+LIVE 2026-07-01.** Pure engine `hr_bim_asset/avatars.js` (avatarPlan folds
  `attendance.sessions` → one avatar per present person per RESOLVED zone, count==presenceByZone headcount,
  ring-placed around the zone centroid · avatarLOD: >30m dot / 12–30m mini / ≤12m full · avatarTip = watermarked
  card {name=AD_User, image=`C_BPartner.image` PLANNED field, null till sourced}). Browser renderer
  `viewer/hba_avatars.js` (additive, host-injected): one scene Group of Sprites (canvas person/dot glyph),
  centroids from rendered member meshes (reuses §REAL-BIND guidTargets, instanced/batched aware), LOD on camera
  'change', mousemove-raycast → the person's card, nearest-full auto-labels on approach. Wired to the presence
  toggle in hba_lens.js (mount on-presence / unmount on any clear → zero residue). W-HBA-AVATARS 6/6. LIVE HHS:
  §HBA_AVATARS **34 avatars over 10 zones**, screenshot = blue people standing in rooms, ringed where several share
  one. Non-invent (no check-in → no avatar). **ROADMAP P1-P6 ALL COMPLETE.**
- **P4-REVISIT + DASHBOARD FIX (user: "screenshots must tell the detail flow; if no-data, review to get them").**
  Found+fixed a REAL bug: `viewer/viewer.html` never loaded Chart.js (the local `lib/chart.umd.min.js`, already
  precached in sw.js) → the FM Dashboard KPI tiles rendered but the 3 canvases were **BLANK**. Added the script →
  LIVE `chartLib=true`, dashboard now renders rich (3-storey utilisation bar · 4-bucket ticket-aging doughnut ·
  12-month availability trend). Recaptured the full **detail-flow screenshot set** on live HHS (drawer · occupancy
  · **presence avatars** · rich dashboard · GW aisles) and rewrote `docs/HRBIMAssetGuide.md` with a shot at every
  task step + a Presence-avatars walkthrough. **REDEPLOYED LIVE** (guard PASS, blessed intentional image
  replacement + `.nojekyll`): guide + all 5 images 200 on gh-pages.
- **REGRESSION (user: "check if u break any other features or panes").** Live driver on HHS after P1–P6:
  avatars mount 34 → unmount 0 (scene 724→725→724, group removed, **residue=false**); occupancy tint 77→0, scene
  back to base; switch presence→occupancy clears avatars; core features intact (HBALens/DashPane/Avatars/dbQuery/
  collectMeshes/camera/controls); **jsErrors=0**. All changes additive + gated — nothing else broken.
- **P7 — PAYSLIP UI VIEW ⛔ OPEN (user 2026-07-01: "payroll proper" is the next gap).** Engine is DONE+witnessed
  (§PILLAR 1 shape: `documents doc_type=PAYRUN` draft→calculate→approve→post, `document_lines`=one payslip/employee,
  `W-HBA-ALPHA` E1–E8 incl. E8-gl-balanced Dr=8400 Cr=8400) but **no view was ever built** — §PILLAR 1's own spec
  says it needs "...+ one new payslip view," never delivered. Every other module (Occupancy/Presence/Dashboard) got
  a viewer pane+pill; payroll never did. **Scope:** a payslip pane (same additive/host-injected/data-gated pattern
  as `hba_dashboard.js`) rendering the glass-box trace — every line (base/allowance/tax/EPF/SOCSO/net) click-through
  to the `kernel_op` that produced it (the Glassbowl thesis). **Not blocked on §RESEARCH GATE below** — render
  against the EXISTING demo pay-element rates (already computing E8's Dr=8400/Cr=8400), watermarked
  `CONTOH — TIDAK RASMI`/`SAMPLE — NOT OFFICIAL` same as every other output. Witness pattern: `witness_payslip.js`
  mirroring `witness_dashpane.js` (mount/unmount zero-residue, real trace assertions, watermark present).
- **P8 — LEAVE UI SURFACE ⛔ OPEN.** Engine DONE+witnessed (`leave.js`, `W-HBA-LEAVE 13/13`: ACCRUAL=signed op,
  BALANCE=replay, feeds payroll via `leaveDeduction`) but flagged open since 2026-06-30: "the engine + payroll feed
  are node-witnessed; no panel wired." **Scope:** a leave pane/pill (balance display + accrual history + request
  action) on the same FM-family drawer pattern as Occupancy/Presence. Also not blocked on §RESEARCH GATE.
- **P9 — §RESEARCH GATE ⛔ OPEN (prerequisite for REAL statutory numbers only, not for P7/P8 UI).** §PILLAR 3's
  own checklist (line ~533) has **all 7 items unchecked** — current PCB (income-tax withholding) brackets, EPF/
  SOCSO/EIS contribution rate tables, MyInvois mandate thresholds/format, whether LHDN legally requires clearance
  vs. an attestation model is reachable, governing IFRS/MFRS clauses, PDPA constraints. Doc says outright: "Until
  filled, Pillar 3 stays DESIGN-ONLY." **Scope:** a research-only session (WebSearch/deep-research, NOT code) that
  sources + cites each item; only once cited can real statutory brackets replace the demo pay-element rates P7
  renders. Flag to the user that regulatory compliance design needs professional verification before any public
  claim — do not assert compliance on the project's behalf.
- **⛔ STILL BLOCKED (unchanged, not actionable standalone):** ERP/HR dotted-line integration (agreement/product/AR
  · attendance/access) — lights up only once ERP/HR are loaded together; swap the connector stubs then.

---

## §RESUME — new-session handoff (2026-06-30)

> **▶ NEW SESSION START HERE.** Branch `lane/hr-overlay` (worktree `/tmp/wt-hr`), all pushed (tip `b8a2223`),
> suite GREEN (**14 witnesses**, see below). Shipped: real-guid binding (#1), viewer wire (#2), derived PM 4D
> timeline (#4c), real storey derivation, §WATERMARK 19/19, **T&A slice-1/2** (check-in + presence lens),
> **Leave/Absence**, **T&A access**, **Room Occupancy / Availability** (iDempiere Resource-Assignment),
> **R_Request / ticket** workflow, the **occupancy dashboard** (Chart.js over pivot), and its **viewer pane +
> pills wired** (additive, zero-impact). User Guides (bim-compiler `docs/ERPUserGuide.md` + `BIMUserGuide.md`)
> updated + **DEPLOYED live** to gh-pages (canaries 200).
> **▶ LIVE BROWSER SMOKE ✅ DONE** (`hr_bim_asset/tests/smoke_hba.html`, headless Chrome): the dashboard pane +
> charts render REAL replayed data (util 21%, availability 'occupied'), watermark, KPIs; OFF=no DOM, ON mounts one
> overlay (3 sized canvases), OFF zero-residue, 0 console errors; standalone demo page renders too. **It caught 3
> real browser-only bugs node missed** (fixed `dc563d1`): connectors `var crypto` aliased the read-only global
> window.crypto → threw at load; the signed-op engines weren't IIFE-wrapped → top-level helpers (`_signed`/`_ops`/…)
> leaked to GLOBALS and the last-loaded file clobbered them (occupancy.availability ran request._ops → every room
> 'vacant'); Chart created on a DETACHED pane → blank. **LESSON:** any HBA engine file loaded as a browser
> `<script>` MUST be IIFE-wrapped; node module-isolation hides these — keep a live browser smoke. Full-viewer
> in-app load (3D + building stream) is the only thing not yet observed (heavy/flaky headless; pane+engine proven).
> **▶ THEN — pick a Phase-F differentiator or a new UI surface:**
> -1. ✅ **DONE — R_Request / ticket** (`request.js`, **W-HBA-REQ 15/15**) + **occupancy dashboard**
>    (`dashboard.js`, **W-HBA-DASH 7/7**, demo `demo/occupancy_dashboard.html`). The ticket is a SIGNED status
>    FSM (OPEN→ASSIGN→START→RESOLVE→CLOSE/REOPEN; illegal transition → REFUSE) threaded to the SHARED room/asset
>    guid; `effect()` emits its occupancy op (maintenance→UNAVAIL) closing the Request↔occupancy loop. `aging`/
>    `myWork` = SLA + deskless-queue views. The dashboard = pure Chart.js config builders over `occupancy.pivot()`
>    + `request.aging()` (per-storey bar · availability trend stacked-bar · ticket-aging doughnut + KPIs), rendered
>    by the ALREADY-BUNDLED `viewer/lib/chart.umd.min.js`. **VIEWER UI WIRED ✅** (`viewer/hba_dashboard.js`,
>    **W-HBA-DASHPANE 8/8**): the dashboard is an **EXTRA, ADDITIVE pane** (own overlay div + canvases, host-
>    injected, imports nothing) + two data-gated pills in `panels.js` (`hbaOccupancy` lens · `hbaDash` pane).
>    OFF = no DOM (pixel-identical); ON mounts one overlay; OFF removes it + destroys its charts (zero residue) —
>    never touches the 3D scene, other panels, or `sw.js`. `hba_lens.js` seeds a watermarked demonstrator
>    occupancy ledger from the model's real rooms so the lens + pane light up. **Open (live-3D, like #2b):
>    observe the pane/pills in a real browser (Playwright/deploy smoke) — node-witnessed via stub DOM + Chart.**
> 0. ✅ **DONE — Room Occupancy / Availability** (`occupancy.js`, **W-HBA-OCC 21/21**; AD model `Occupancy` =
>    `S_ResourceAssignment`, Room=`S_Resource` IS-A `M_Product`). Signed `ASSIGN`/`RELEASE`/`UNAVAIL`
>    (S_ResourceUnAvailable blackout) op-log → `availability(room,period)` by **REPLAY** (occupied/vacant/
>    expiring/unavailable; early-release + blackout honored; vacancy = absence of an op). `pivot()` = the
>    dashboard graph data (room×period matrix + per-storey + per-period utilization) — populates HHS across the
>    14 REAL rooms. Rides the EXISTING MeshPort seam via `overlay.computeOccupancy` + `viewer/hba_lens.js`
>    `occupancy` mode. **REQUEST RELATION:** `linkRequest` maps an R_Request to its availability effect over the
>    shared room guid (move-in→ASSIGN · move-out→RELEASE · maintenance→UNAVAIL). **Open:** the R_Request/ticket
>    workflow engine (later slice); a Chart.js dashboard pane over `pivot()` (lib already bundled — UI wiring only).
> 1. ✅ **DONE — T&A slice-2 viewer presence lens** (`overlay.computePresence` + `viewer/hba_lens.js` `presence`
>    mode, **W-HBA-PRES 14/14**). `attendance.presenceByZone` headcount folds to a blue density ladder (1→low /
>    2-4→med / 5+→high) that RIDES the EXISTING `applyOverlay` MeshPort seam — zero new viewer-core; one-mode,
>    restore-on-off, render-side non-invent gate (un-located zone → un-linked, never tinted). Sourced from the
>    host-injected signed log `A._hbaAttendanceLog`. **✅ PILL WIRED 2026-07-01 (W-HBA-PRESPANE 10/10, see §T&A
>    SLICE-2 PILL):** data-gated `hbaPresence` pill (Lucide `footprints`) in `panels.js` + gate seed
>    `HbaAttendance.demoSeed`; actor-/building-class-agnostic — serves a tenant checking into a residential/
>    commercial/office unit (PP8). **Remaining open sub-item (like #2b): live 3D browser smoke.**
> 2. ✅ **DONE — Leave/Absence** (`leave.js`, **W-HBA-LEAVE 13/13**). The three primitives: ACCRUAL = a signed
>    op (C.sign/verifyChain) · BALANCE = a REPLAY of the op-log (Σ ACCRUE − Σ TAKE, carry-forward via asOf, may
>    overdraw — honest) · FEEDS PAYROLL = `leaveDeduction` splits an over-drawn/LWP take into unpaid days →
>    a FIXED SUB element on the already-witnessed pay run (net 3000→2600, GL still balanced). No unpaid days →
>    no phantom line; tamper-evident; deterministic; watermarked summary. **Open: a leave UI surface** (the
>    engine + payroll feed are node-witnessed; no panel wired).
> 3. ✅ **DONE — T&A access** (`access.js`, **W-HBA-ACCESS 13/13**). A grantor mints a SIGNED capability token
>    scoped to REAL zone(s) for a time window; a door reader VERIFIES it OFFLINE (pure crypto + a local trust
>    anchor + a local revocation set, no network/db). Phantom-zone grant → REFUSE; forged scope → bad-signature;
>    out-of-scope/early/expired/wrong-holder/untrusted-grantor/revoked → honest DENY; a forged revoke is ignored
>    (can't deny by forgery). Watermarked pass. **Open: the physical reader/turnstile (hardware integration, not
>    a build) + a grant/verify UI surface.**
>
> **▶ NEXT OPEN (no NEXT BITE remaining):** Phase-F differentiators (per §VISION/§MARKET TRIAGE) or a UI surface
> for leave/access/presence. ⛔ Still user-gated: #2b live 3D browser smoke · #3-ERP dotted lines (ERP must load)
> · #4(a/b) a real external P6/MSP plan + building.
> ⛔ Still need a USER decision/dependency: #2b live 3D browser smoke · #3 ERP dotted lines (ERP must load) ·
> #4(a/b) import a real external P6/MSP plan (which plan, which building).

**Module = HR_BIM_Asset** (NOT "Payroll" — payroll is just RUN profile #1). Lives in **bim-ootb ONLY**:
`hr_bim_asset/` + this spec in `bim-ootb/prompts/`. Worktree `/tmp/wt-hr`, branch `lane/hr-overlay`. ZERO
bim-compiler work (EXCEPT the user-directed ERP/Viewer User-Guide doc updates 2026-06-30, deployed via
`safe_gh_deploy.sh`). Witness: `for w in run view bind wire timeline watermark attendance presence leave access
occupancy request dashboard dashpane presspane class family realbind; do node hr_bim_asset/tests/witness_$w.js;
done` — W-HBA: ALPHA 18 · VIEW 13 · BIND 11 · WIRE 10 · TIMELINE 7 · WATERMARK 9 (19/19 surfaces) · ATTEND 8 ·
PRES 14 · LEAVE 13 · ACCESS 13 · OCC 21 · REQ 15 · DASH 7 · DASHPANE 8 · **PRESPANE 10** · **CLASS 9** ·
**FAMILY 8** · **REALBIND 6**. (18 witnesses, all GREEN.) Demos: `demo/occupancy_dashboard.html`,
`demo/fm_panel.html`. Live-3D whitebox harness: `tests/live/cdp_shot.js` (see §NEXT-SESSION rule 1).

### §FM-FAMILY — group HBA lenses under one wake-aware "FM/Operate" pill ✅ DONE 2026-07-01 (`W-HBA-FAMILY 8/8`)
**User concern (2026-07-01):** *clutter / conflate / losing the plot* — the HBA pills had grown to **6**
(Tenancy·IoT·Occupancy·Presence·Class·Dashboard) on an already-~35-pill bar, and Tenancy ≈ Occupancy conflated.
**Decision (user):** "Group + de-conflate." Done:
- **Group 6 → 1.** `viewer/panels.js` now carries ONE data-gated `hbaFM` pill (Lucide `building-2`) →
  `HBALens.openFamilyDrawer(A)`. The drawer + per-lens icons live in `viewer/hba_lens.js` (the additive HBA
  module) so panels.js (the conflict-magnet, Teams-adjacent) stays minimal. The 6 old pills + their 5 icon defs
  were removed.
- **De-conflate.** Tenancy folded into Occupancy (occupancy = the op-log superset incl. lease status). The
  `'tenancy'` engine mode still exists (back-compat + witnesses) but is no longer a separate surface. Family =
  **Occupancy · Presence · Unit class · Assets/IoT · Dashboard** (5 distinct questions).
- **Wake-aware.** `availableLenses(A)` (pure, witnessed) drives both the pill gate (`familyHasData` → pill shows
  iff ≥1 lens has data) and per-entry greying in the drawer (enabled-if-data, else greyed "no data"). Proven live:
  the `demo/fm_panel.html` screenshot shows Occupancy/Presence/Class/Dashboard enabled, **Assets/IoT greyed** (no
  asset guid in HHS). **The plot, restated in the drawer header:** *one model, lenses each answering one question,
  off one signed op-log.*
**Witness W-HBA-FAMILY 8/8** (`witness_family.js`): de-conflate (no standalone tenancy) · wake-aware greying ·
gate · activateLens routing (lens→toggle / pane→dashboard) · one-pill-in-source. Updated `witness_presspane` PP6
+ `witness_class` C7 to the family wiring. **Browser smoke + screenshot:** `demo/fm_panel.html` (headless Chrome,
0 errors). **Open (like #2b):** the drawer entries actually tinting the live 3D model.

**⚠ COORDINATION (user 2026-07-01):** another active session — the **Teams overlay** lane (`lane/teams-overlay`,
worktree `/tmp/wt-redpill`) — also targets **HHS** for its overlay + Find-panel lens. Verified NO collision:
Teams keeps everything in `teams/` (self-mounts its own `teams_pill.js`, does NOT touch `viewer/panels.js`) and
paints DOM dots (`dot_layer.js`), while HBA tints **mesh emissive** via the MeshPort + adds pills to `panels.js`.
Different seams → they coexist on HHS at runtime; no git conflict. **Keep it that way:** HBA pills stay additive
in `panels.js` (on any future merge, KEEP BOTH lanes' additions — panels.js is the conflict magnet); HBA overlays
stay on the emissive MeshPort with restore-on-off; never grab Teams' DOM nodes.

**DONE + witnessed:**
- Generic RUN engine — payroll · tenancy · strata · maintenance (ONE engine). **W-HBA-ALPHA 18/18.**
- 4 AD models, singular demo records (Tenancy/PropertyManagement/Strata/Asset); Asset = bim_guid↔iot + operator/vendor/personnel + schedule.
- Spatial view (`overlay.js`+`lens.js`): 2 Find flaticon lenses (Tenancy=`users` blue-band · IoT=`cpu` · word-on-hover), storey density-dots, click→zoom→dummy→IFC-popup. Zero-impact (MeshPort/ScenePort seams). **W-HBA-VIEW 13/13.**
- Watermark CONTOH/SAMPLE on every output. §BINDING (guid join + bim_orders_overlay inject). §CROSS-APP (Viewer·ERP·HR spine).
- **NEXT#2 ✅ DONE 2026-06-30 — viewer wire-in (`viewer/hba_lens.js` + `W-HBA-WIRE 9/9`).** Two DATA-GATED pill
  icons in `viewer/panels.js` (`hbaTenancy`/`hbaIot`, `users`/`cpu` Lucide added to ICONS) — `pill:false` until
  `hba_lens.js` detects a real binding in the loaded building, then flips + `A._buildPill()` (the whwalk precedent).
  `hba_lens.js` (additive, host-injected, imports nothing) binds the WITNESSED overlay engine to the scene via a
  real **MeshPort over `A.guidMap`** (emissive tint, reused from `nlp.js`); toggle-off restores every material
  (zero residue). HBA engine made browser-safe (guarded `require` → `self.Hba*` globals) + loaded in `viewer.html`.
  ZERO new shared-file risk beyond the sanctioned 2-icon touch; `sw.js` untouched (§OPS). **Remaining = live 3D
  Playwright/deploy smoke (NEXT#2b)** — §-log value-verification done, browser render not yet observed.
- **NEXT#1 ✅ DONE 2026-06-30 — real-guid binding (`binding.js` + `fixtures/hhs_rooms.json` + `W-HBA-BIND 9/9`).**
  Demo lease `L-0001` + strata parcel now reference REAL HHS IfcSpace rooms (`RM_Level_1_1` ≈ Level 1 R1 /
  `RM_Level_1_2`), extracted into a provenance-stamped fixture (14 real rooms, src sha16 6498f86f, occupancy
  from `rel_contained_in_space`). `binding.resolveGuid`/`bindRecords` = the **non-invent JOIN gate**: a guid
  lights a unit ONLY when it resolves to a real mesh; a fabricated guid is honestly **un-linked**, never tinted
  (proven by `overlay.computeOverlay(..,{knownGuids})` gating 2→1). `Connectors.resolveGuid` = the MeshPort seam
  (swap fixture→`APP.guidMap` to go live). Fixture re-built by `fixtures/build_hhs_rooms.js`.

**DEMO BUILDING:** `HHS_Office_Federated` (73MB, 6871 elems; HAS rooms — `rel_contained_in_space`, rooms
`RM_Level_1_*`) copied into `bim-ootb/buildings/` (gitignore `!` exception) — **GH-served, NOT OCI**. Landing
`index.html`: HHS entry carries `gh:'https://red1oon.github.io/bim-ootb/'`; `openBuilding` uses it → loads from
GH bim-ootb. Other buildings untouched (OCI `_prodBase`).

**NEXT (in order):**
1. ✅ DONE — see §RESUME above (real-guid binding + W-HBA-BIND 9/9).
2. ✅ DONE — see §RESUME above (viewer wire-in + W-HBA-WIRE 9/9). Icons data-gated, MeshPort over `A.guidMap`,
   `sw.js` untouched. **Sub-item NEXT#2b open:** live 3D Playwright/deploy smoke (observe the tint in a browser).
3. ⛔ BLOCKED (external dependency): ERP/HR dotted lines (agreement/product/AR · attendance/access) — light up only
   when ERP/HR are loaded; swap the connector stubs then. Not actionable standalone.
4. PARTIAL — TimeMachine.Editor 4D Gantt: premise was false (HHS 4D tables EMPTY); editor already shipped on
   mainline (#504–#521). **(c) ✅ DONE** — HBA-native derived PM schedule (`timeline.js`, W-HBA-TIMELINE 7/7,
   foldable by the merged editor). **(a)/(b) ⛔** still need a user decision (which real external plan/building).

**▶ NEXT HR TARGET (spec review 2026-06-30) — Time & Attendance: signed · spatial · offline check-in (§PILLAR 2).**
The triage's own pick: §MARKET TRIAGE rates **T&A ★★★★★ "T1 moat"** (offline + signed non-repudiable + spatial),
the deskless/construction strategic cut. It is the highest-fit, lowest-new-primitive next target because it
**reuses what tenancy just shipped**: the guid→element binding (`resolveGuid`/`meshIdForGuid`) becomes the
**spatial scope** of a check-in (Site→Building→Floor→zone), the storey derivation gives the zones, the connector's
**W-SIGN** (`sign`/`verifyChain`) signs each presence `kernel_op`, and the density-dots overlay becomes a live
**headcount-by-zone** presence lens. It closes the loop the spec describes — *check-in (signed, spatial, offline)
→ timesheet/leave (edge ops) → deterministic pay run (payroll = profile #1, already witnessed) → payslip back in
pocket*. Honest boundary (§PILLAR 2): the ONLY external piece is physical door hardware (reader/turnstile) — an
integration, not a build; every software primitive already exists. **Follow-on:** Leave/Absence (★★★★ T1 —
accrual=op, balance=replay, feeds payroll). Anti-scope reminder: T3 (ATS/LMS/benefits) stays OUT (§MARKET TRIAGE).

**⛔ TimeMachine.Editor (4D Gantt) — premise CORRECTED 2026-06-30 (non-invent):** earlier note claimed "HHS
carries 4D data." FALSE — HHS has the 4D SCHEMA (`tasks`/`task_sequences`/`task_elements`/`schedules`) but **ZERO
rows** (verified `sqlite3 … SELECT count(*)`). There is no extracted schedule to show. The TM editor + P6/MSP
importers **already exist and are MERGED on mainline** (`§SE-1..4` + PRs #504–#521: CPM, drag-Gantt, cross-surface
sync, P6/MSP/XER import, auto-bind) — NOT HBA-lane work; the TM "Schedule Editor" button already opens
`schedule_editor.html?db=<current DB_URL>`. A live 4D demo therefore needs a REAL schedule, which cannot be
INVENTED: either (a) import the one real plan in the repo `tests/fixtures/Hospital_GW_Programme(.bound).xer`
(GardenWorld-bound, not HHS), or (b) the user supplies a real P6/MSP plan, or (c) the HBA-native path: derive a
maintenance timeline from PM_Asset `next_due`/`pm_cycle` (the witnessed `maintenance` RUN profile = derived, not
invented). **(c) ✅ DONE 2026-06-30 — `timeline.js` + `W-HBA-TIMELINE 7/7`:** derives a PM schedule in the
viewer's OWN 4D schema (schedules·tasks·task_elements·task_sequences) so the merged editor folds it with ZERO
editor edits; due dates = next_due stepped by pm_cycle, tasks = milestones (duration 0, day floored — only the
real datum asserted), bound to the demo asset's REAL HHS guid (`04i7…` IfcFlowTerminal); uninterpretable cadence
→ honest skip; deterministic. Viewer accessor `HBALens.maintenanceSchedule(A)` filters to assets bound in the
loaded building (W-HBA-WIRE W8). **⛔ STILL OPEN (a)/(b) — ONE DECISION (cannot extract): for a schedule from
EXTERNAL/observed plans, which real schedule on which building?** (a) import repo P6 `Hospital_GW_Programme.xer`,
or (b) user supplies a plan. The DERIVED-PM path needs no such decision and is shipped.

---

## §VISION — why HR is the *higher* fruit (and a market angle)

iDempiere/ADempiere never shipped real Payroll, so there is **no incumbent to merely match** — this
defines the bar. HR ticks a big box in ERP proposals AND would be the **first kernel local-first HR
app**. It is reachable because it is *mostly seed data on the kernel we already have*, not a new engine.

The differentiator across all three pillars is the **same privacy lever**: the single most sensitive
datasets in any economy — payroll comp, and now every business's transaction ledger — never leave the
device. That is a story cloud-HR (Workday/ADP/BambooHR) and a government clearance-server **structurally
cannot tell.**

---

## §DISCLAIMER — `CONTOH — TIDAK RASMI` watermark (applies to ALL pillars)

The whole app is a **demonstrator**, not for official use. This is enforced visually, not just stated:

- **Mandate:** every important screen and every generated/exported/printed artifact (payslip, e-invoice,
  GL report, attestation, data export, PDF/print view) renders a **locale-aware** watermark —
  **`CONTOH — TIDAK RASMI`** (MS) / **`SAMPLE — NOT OFFICIAL`** (EN), so it reads for both the Malaysian
  RegTech demo and outside markets. One string per active locale; default EN when locale is unset.
  Applies on mobile edge surfaces (check-in/access/sign receipts) too.
- **Persistence:** the watermark must survive screenshot, print, and PDF export — render it into the
  artifact, not as a dismissible overlay. It is **not user-removable**.
- **Acceptance (witnessed, per `docs/TestArchitecture.md`):** a `§WATERMARK` whitebox check asserts the
  marker is present on every output-class surface (count of important screens == count carrying the mark;
  any miss = FAIL). Wiring/render presence may be Playwright-checked secondarily; value/coverage is the §-log.
- **Rationale:** the watermark is the visible half of the legal boundary in §DO-NOT-REMOVE and §PILLAR-3
  positioning — it makes "demonstrative, not official" impossible to mistake on any captured output.

---

## §ARCHETYPE — Payroll-first, NOT HRIS-first or Talent-first

| Archetype | Shape | Kernel fit |
|---|---|---|
| HRIS/Core-HR first (BambooHR) | employee records, org chart, forms | Weak — forms over state, low compute, doesn't tick the box buyers mean |
| **Payroll-first (ADP)** | the engine that *pays people*: gross→net, statutory, GL post | **PERFECT** — deterministic compute, doc-as-event, GL-integrated, privacy-critical |
| Talent-first (recruit/appraise/learn) | workflow + social + collaboration | Worst — cloud-collaborative by nature, fights local-first single-tab |

The user's own integration constraint (**GL posting + `C_BPartner.isEmployee`**) is *exactly and only*
payroll's seam → payroll-first is confirmed by the data, not preference.

---

## §PILLAR 1 — Glass-box Payroll core

### Why it delights (cloud HR can't match)
1. **Privacy as architecture** — comp data runs in the tab, never leaves the device.
2. **Glass-box payslip** — every line (base/allowance/tax/EPF/SOCSO/net) **traces to the rule op** that
   produced it (the Glassbowl thesis on a payslip). Kills the #1 payroll support ticket.
3. **Safe editable statutory rules** — change a rate → §0.5 decision table → **dry-run next run → diff →
   commit** (§0.4/§0.6). iDempiere/SAP need a consultant + redeploy.
4. **Deterministic re-run** — re-run last month → bit-identical (`replay-hash == live-hash`). Auditor's dream.

### Shape on the existing 5-table kernel (no new primitives)
- `items` — employees (`isEmployee` extension) + **pay elements** (each a rule: fixed / %-of-base / formula / statutory bracket)
- `documents` — the **Pay Run** (`doc_type=PAYRUN`), lifecycle `draft → calculate → approve → post`
- `document_lines` — one **payslip** per employee; calculate = run element rules deterministically, every step a `kernel_op`
- `journal` — on POST emit postings (Dr wages, Cr net-pay-payable, Cr statutory payables) = the dotted GL line, reusing `postJournal`
- **payslip = the trace** — same lineage walk Glassbowl does for `Order→Invoice→Payment`

This is the existing kernel + decision-table engine + op-log, pointed at an **`hr_seed.db`** + one new
payslip view. Small surface, big checkbox.

---

## §PILLAR 2 — Mobile signed-edge (the special market angle)

Mobile flips HR from a back-office **module** to an **edge product** — where local-first/offline/signed
is the only thing that works. Every edge action is one shape: **an employee, on a phone, emitting a
signed `kernel_op` that survives no-signal and reconciles later.** Every primitive already exists:

| Edge action | On the kernel | Proven by |
|---|---|---|
| Check-in / attendance | signed, time-stamped presence op; phone = the time clock | `kernel_ops` + W-SIGN |
| Door / site access | signed **capability token** the reader verifies *offline* | W-OWNER/CAS + W-SIGN (§0.20 secured axis) |
| Signing (payslip ack, leave, safety brief, permit-to-work) | sealed signature op in the chain | W-SIGN (`sealChain`/`verifyChain`/`setSigner`) |
| Payslip in pocket | glass-box payslip view, offline, never leaves device | the Glassbowl trace |
| Sync | edge op-log folds through the **dumb facilitator** when online | DistributedERP §6 |

→ The HR edge app is the **first real-world consumer of the secured-distributed doctrine** outside ERP docs.

### The MOAT — fuse the edge with the BIM spatial model
No generic HR vendor has the building:
- Check-in is **spatial** — "Site → Building A → Floor 3" via existing containers (§0.1), not "I'm at work."
- Access control **maps to spatial zones** — who's allowed where is a query over the model, not a separate ACL.
- **Site-presence analytics on real geometry** — headcount-by-zone, who-was-where-when, safety/induction
  compliance per area — off the op-log (§0.6), rendered on the modeller's geometry.
- Granularity today = floor/building (solid); finer room-zone sharpens **for free** as the IfcSpace/datum
  recovery in the SDG spine lands (`rel_adjacency`/`datum_plane`).

### Construction context = the killer fit
Sites have poor/no connectivity, transient labor, real safety/access stakes → offline-first signed
check-in + spatial access solves a genuine pain the cloud-HR incumbents can't (no server assumption, no building).

### Honest boundary
Software primitives (issue/verify signed credentials, offline op-log, sync, spatial model) all EXIST.
The one external piece is **physical door hardware** (reader/turnstile via QR-on-phone / BLE / NFC) — an
**integration/partner edge, not a build**. State it as a clean integration line in any proposal.

### The closed loop
`check-in (signed, spatial, offline) → timesheet/leave (edge ops) → deterministic pay run (glass-box) →
payslip back in the same pocket (signed ack) → GL post (dotted line)`. One signed, replayable,
offline-capable chain from clock-in to net pay; privacy holds the whole way.

### §T&A SLICE-1 — the signed spatial check-in engine ✅ DONE 2026-06-30 (`attendance.js`, W-HBA-ATTEND 8/8)
Engine shipped: `checkIn`/`checkOut` (signed, spatial-gated → honest REFUSE on un-located zone) · `sessions`
(in→out pairs, OPEN on unmatched) · `timesheet` (hours/employee+zone, tamper-evident, watermarked) ·
`presenceByZone` (headcount → density overlay) · `fingerprint` (replay==live). Reuses W-SIGN + binding +
watermark; deterministic. §WATERMARK coverage now 19/19 (incl the timesheet). **NEXT T&A slices:** viewer presence
lens (reuse density dots) · access = signed capability over a zone · then Leave/Absence. Original spec ↓.
**Scope:** the engine half of Pillar 2 — an employee emits a **signed presence `kernel_op`** at a **real
spatial zone**, foldable offline into a **timesheet** + a **headcount-by-zone** presence count. Module
`hr_bim_asset/attendance.js` (`HbaAttendance`), reusing what tenancy shipped: `Connectors.sign`/`verifyChain`
(W-SIGN), `binding.resolveGuid` (spatial gate), the storey/zone derivation, the watermark. **No viewer/door
hardware in this slice** (that's a later integration). Pure + deterministic — caller supplies `ts` (no Date.now).
**NON-INVENT gates:** zone must resolve to a REAL building guid → else honest **REFUSE** (never a faked presence);
session hours computed from REAL in/out `ts` pairs; an unmatched check-in = an honest **OPEN** session, never a
fabricated end. **Witness claims (W-HBA-ATTEND — write the test, then implement):**
- A1 check-in to a REAL zone → a signed presence op; the chain `verifyChain` is OK.
- A2 check-in to a non-existent zone → **REFUSE** (no op, honest).
- A3 amend a signed presence param → `verifyChain` **breaks** (tamper-evident).
- A4 `timesheet(ops, period)` folds in→out pairs → correct hours per employee/zone (deterministic).
- A5 check-in with no check-out → an **OPEN** session (no fabricated finish).
- A6 `presenceByZone` → headcount per REAL zone (the spatial moat; feeds the density overlay).
- A7 deterministic — same ops → identical timesheet fingerprint (replay == live).
- A8 every receipt/output carries the CONTOH/SAMPLE watermark (§DISCLAIMER).
Follow-on slices: viewer presence lens (reuse density dots) · access = signed capability over a zone · Leave/Absence.

### §T&A SLICE-2 PILL — viewer presence-lens pill wire-in ✅ DONE 2026-06-30 (`W-HBA-PRESPANE`)
**Scope:** the LAST open sub-item of presence (#1 in §RESUME) — the engine + `presence` lens-mode + `computePresence`
seam were already node-witnessed (W-HBA-PRES 14/14), but **no pill icon was wired** (panels.js untouched that
slice). This wires it following the EXACT data-gated pattern of `hbaTenancy`/`hbaIot`/`hbaOccupancy`/`hbaDash`:
- **Seed parity (non-invent):** the gate auto-seeds `A._hbaOccupancyLog` so the Occupancy lens lights on a
  building that carries rooms — presence had NO equivalent, so the pill could never light. Add
  `HbaAttendance.demoSeed(rooms, period)` = a deterministic, SIGNED (`verifyChain`-OK) check-in log over the
  model's REAL room guids for the QUERIED period (ts derived from the host-supplied `period`, no `Date.now`),
  producing honest headcounts (zone0→3 present/med band · zone1→1/low · rest→0, vacancy from absence). The gate
  injects it parallel to occupancy.
- **Gate entry:** add `hbaPresence: detect(A, 'presence')` to the `on` map so the icon flips on ONLY when a
  located check-in resolves to a real mesh in THIS building (no data → no icon).
- **panels.js pill:** one ADDITIVE action `hbaPresence` (Lucide `footprints` icon), `pill:false` until the gate
  flips it, `fn → HBALens.toggle(A, 'presence')`, `isActive → HBALens.isActive('presence')`. Reuses the SAME
  MeshPort seam (zero new viewer-core); one-mode-at-a-time; toggle-off restores every material (zero residue).
**Witness claims (W-HBA-PRESPANE — write the test, then implement):**
- PP1 `demoSeed(rooms, period)` → a SIGNED check-in log; `verifyChain` OK; `presenceByZone` gives the expected
  headcounts over the REAL zones (deterministic — same inputs → identical log).
- PP2 data-gate: `detect('presence')` is FALSE with no attendance log / on a building whose zones aren't present,
  and flips TRUE once the seed is injected over a real-guid building (icon shows / honestly absent → no clutter).
- PP3 `toggle('presence')` ON tints ONLY the meshes of present zones (density band), other meshes untouched.
- PP4 toggle OFF restores every touched material (emissive→0), lens inactive (zero residue / zero-impact).
- PP5 non-invent: a check-in to a zone ABSENT from `guidMap` → `unlinked`, never tinted.
- PP6 static wiring: `panels.js` registers an `hbaPresence` action whose `fn` calls `HBALens.toggle(.,'presence')`,
  and `hba_lens.js` gate `on` map includes `hbaPresence` (proves the pill exists + is data-gated).
- PP7 watermark: the timesheet folded from the seeded log carries the CONTOH/SAMPLE disclaimer (§DISCLAIMER).
- PP8 **actor- & building-class-agnostic** (user 2026-07-01): the SAME presence/occupancy primitive serves a
  TENANT checking into a **residential / commercial / office** unit, not just an employee at a site. The op's
  actor is just a party id (employee OR tenant BP); the lens keys on the room GUID — the IfcSpace CLASS is a
  label on the space, never hardcoded in the lens. Proven: a tenant-party check-in lights presence (headcount=2)
  AND a tenant move-in (ASSIGN) lights occupancy=occupied over the same unit guid.
  → **Occupancy lens** = unit availability by tenant move-in/out (assign/release, W-HBA-OCC) · **Presence lens**
  = live "who's-in-the-unit-now" headcount from signed check-ins (this slice). Both already serve tenants across
  building classes; nothing class-specific to build for the lens itself.
**W-HBA-PRESPANE 10/10 PASS.** Witness file `hr_bim_asset/tests/witness_presspane.js`; add `presspane` to the
suite loop. **Open (like #2b):** observe the pill/tint in a real browser (live-3D smoke) — node-witnessed via
stub DOM here.

### §CLASS — color/filter units by building-use class ✅ DONE 2026-07-01 (`W-HBA-CLASS 9/9`)
**Decision (user 2026-07-01):** "Yes — color/filter by class." **Non-invent finding:** HHS carries NO real
IfcSpace use-class — every `IfcSpace` is `object_type='COMPILED'`, `predefined_type='INTERNAL'`, generic names.
So class CANNOT be extracted from this model; the honest source is the **seed column** the chosen option
anticipated. Built:
- `models.js` — added a declared `unit_class` field to Tenancy + **3 demonstrator leases** over REAL HHS room
  guids: `L-0001` office (RM_Level_1_1) · `L-0002` commercial (RM_Level_1_3) · `L-0003` residential
  (RM_Level_1_4). DECLARED business data (CONTOH/SAMPLE watermark), real guids — NOT a geometric claim.
- `overlay.js` — `CLASS` palette (residential/commercial/office + grey unclassified) + `computeClassOverlay`
  (color by class; `classFilter` = the FILTER facet → tint ONLY one class; same plan shape → reuses MeshPort).
- `viewer/hba_lens.js` — `classRows`/`classOf` resolver (PRIORITY: real model `predefined_type` → declared
  `unit_class` → `unclassified`, never guessed; HHS falls to declared) + `'class'` lens mode + `hbaClass`
  data-gate + a model→use-class map from `predefined_type` (only genuine IfcSpaceTypeEnum counts).
- `panels.js` — additive data-gated `hbaClass` pill (Lucide `layers`), `fn → HBALens.toggle(A,'class')`.
**Witness W-HBA-CLASS 9/9** (`hr_bim_asset/tests/witness_class.js`): resolver priority (model wins over declared;
strata→unclassified; unreferenced unit untouched) · palette color + deterministic · classFilter tints one class ·
gate (unresolved→unlinked) · toggle restore (zero residue) · data-gate · static wiring · declared field +
watermark. **NOTE:** adding 2 leases updated `witness_view` V1 + `witness_bind` B5 (were hardcoded to "exactly 1
lease" → now assert against the real record count). **Filter UX:** the engine takes `A._hbaClassFilter`; a class
dropdown/chip in the pill UI is a later browser bite. **Open (like #2b):** observe the class colors in a live 3D
browser.

---

## §PILLAR 3 — Malaysian RegTech: E-Invoice + LHDN tax/EPF (privacy-first counter-proposal)

Overlaps ERP.POS (e-invoice) and Pillar 1 (income-tax/PCB + EPF). **Free demo only**; goal = groundswell.

### The thesis: clearance model → attestation model
National e-invoicing (MyInvois et al.) uses a **clearance model**: every invoice streamed to the central
platform, validated live, stamped before legal issue. Two structural costs: (a) the central server buckles
at national scale ("govt cannot execute — too massive a burden"); (b) the state sees every transaction line
of every business, live — surveillance as a side effect.

**Counter-proposal = our secured-distributed doctrine aimed at the regulator** (1:1 mapping, all already witnessed):

| Clearance model (today) | Local-first counter-proposal | Built as |
|---|---|---|
| Every invoice streamed to central server | Invoice **signed locally**, tamper-evident, non-repudiable | W-SIGN sealed chain |
| Gov validates & stores all line data | Gov = **signature-verifier + audit-sampler** | dumb facilitator (DistributedERP §6) |
| Real-time total disclosure | **Selective disclosure** — prove the legally-required commitment, withhold the rest; *further info-giving is user-controlled* | owner/CAS capability model |
| Trust = the platform saw it | Trust = **deterministic replay on audit-on-demand** | replay-hash == live-hash |
| Books = whatever was submitted | IFRS/MFRS books reconciled locally | accounting-as-reconciler (§8) |

**One-line pitch to government:** *don't be a real-time clearing house for the whole economy — make each
taxpayer a self-custodied, cryptographically-attesting node, and reduce the state's job from "ingest every
invoice" to "verify signatures + sample audits."* Same integrity guarantee, a fraction of the server load,
privacy preserved.

### Positioning
- **Free, demo only.** A demonstrator + **policy counter-proposal**, NOT a certified LHDN filer.
- Complies to **international accounting standards (IFRS/MFRS)** for the books; **advocates** the
  privacy-preserving model to government; makes **no** compliance/certification claim.
- Strategy = build a **ground-swell** that pressures a more consumer-friendly mandate **without compromising
  legal commitment** (the books are correct and provable; only the *disclosure mechanism* is the proposal).

### ⚠ §RESEARCH GATE — RECLASSIFIED AS MOCKUP/STUB (user decision 2026-07-03)
**Pillar 3 is a demo mockup, not a real filer.** Do not keep sinking research passes into lawyer-grade
closure of every box — user call 2026-07-03: build it as a **stub**, with every regulatory value/rule
clearly labeled non-authoritative, behind a seam that lets a later interested party (accountant, Malaysian
tax lawyer, MyInvois-integration partner) drop in the real mapping without a design change. Concretely:
- Any PCB bracket, EPF/SOCSO/EIS rate, or MFRS clause used in code = a **placeholder constant**, name-tagged
  `MOCK_` or equivalent, sourced from whatever partial citation exists below (never invented from nothing),
  with a single obvious injection point (config/table) for a real professional to overwrite later.
- The clearance-vs-self-attestation legal question (box 3) does **not** block building the demo — the
  counter-proposal's *mechanism* (local signing, selective disclosure, replay-hash audit) can be built and
  demonstrated on mock data; the legal question only matters if/when this moves toward a real compliance claim.
- The 2 research passes below stay as reference — useful partial citations for the stub's placeholder
  values — but the gate is no longer a blocker for Pillar 3 coding work. Second pass was interrupted by a
  session-limit mid-run; one bonus finding survived: a fetched Finance Act text
  (`myttx.customs.gov.my/wp-content/uploads/2024/02/WJW23%EF%80%A21341-BI.pdf`) contains what reads as
  **Income Tax Act 1967 §82C(1)** — "a person shall, in a year of assessment, issue an electronic invoice for
  each transaction..." (3-0 confirmed) — a real statutory citation for the mock's "e-invoice issuance is a
  codified duty" placeholder, though the deeper clearance-vs-attestation legal question this box asked was
  never resolved and is now explicitly out of scope for the stub.

**First deep-research pass run 2026-07-03** (105-agent fan-out, 23 primary/secondary sources fetched, 81
claims extracted, 25 adversarially verified 3-vote — 21 confirmed / 4 refuted). Result: 2 of 7 fully sourced,
5 have real gaps. Full transcript in this session's workflow journal (`wf_5ac9fdc0-8f1`).

- [~] **1. MyInvois mandate current state** — PARTIAL. The widely-repeated phase grid (Phase 1 >RM100m from
      1 Aug 2024; Phase 2 RM25–100m from 1 Jan 2025; Phase 3 RM5–25m from 1 Jul 2025; Phase 4 RM1–5m from
      1 Jan 2026) is corroborated by *multiple independent secondary sources* (vatcalc.com, ifca.asia,
      cleartax.com, goldsoft.com.my) but a claim asserting it as a primary-source fact was explicitly
      **REFUTED (0-3)** — the cited LHDN page could not be confirmed to state it, and a direct FAQ-PDF fetch
      surfaced a conflicting fragment ("1 September 2023... RM25 million") suspected to be an extraction
      artifact. A "RM1m turnover = total exemption" claim was also **REFUTED (1-2)**. → Re-fetch
      `hasil.gov.my/en/e-invoice/implementation-of-e-invoicing-in-malaysia/e-invoice-implementation-timeline/`
      fresh before quoting exact dates anywhere design-facing.
- [x] **2. E-Invoice format & transport** — CONFIRMED, high confidence, 9/9 claims 3-0. UBL 2.1-based,
      JSON or XML, two channels (MyInvois Portal manual entry / REST API for ERP integration). API's Submit
      Documents call does only synchronous structural validation + returns a submission ID; full validation
      is async via separate Get Submission/Get Document Details polling (~3-5s interval). "Invoice" is the
      primary document type; v1.0 ≈ v1.1 minus signature validation (v1.0 slated for deprecation). Sources:
      `sdk.myinvois.hasil.gov.my` (official LHDN SDK, primary), `sdk.myinvois.hasil.gov.my/einvoicingapi/02-submit-documents/`,
      `sdk.myinvois.hasil.gov.my/documents/invoice-v1-0/`.
- [ ] **3. LHDN legal proof-of-issue (load-bearing)** — STILL OPEN, the single highest-risk gap for the
      whole counter-proposal. Confirmed (3-0): LHDN's official FAQ (#34) describes near-real-time validation
      (<2s typical) + mandatory Unique Identifier Number assignment before an invoice is valid/shareable
      (72h cancel/reissue window) — operationally a Continuous Transaction Control (CTC) pre-clearance model,
      same family as France/Italy/Poland. **But no claim in this pass answers the actual legal question** —
      whether Malaysian *statute* (Income Tax Act 1967 as amended / the e-Invoice-enabling Finance Act
      provisions) strictly *mandates* clearance, or whether a deferred/self-attestation alternative is
      legally reachable. A claim that real-time validation applies uniformly across B2B/B2C/B2G was
      **REFUTED (1-2)** — B2C consolidated e-Invoices are typically batched/periodic, not per-transaction —
      so even the operational picture has an unresolved nuance. Needs either a direct read of the statutory
      text or a qualified Malaysian tax lawyer's opinion before this pillar's core thesis can be called sourced.
- [~] **4. PCB (Potongan Cukai Bulanan)** — PARTIAL, structure confirmed high-confidence (5/5 claims 3-0),
      numeric brackets NOT yet pulled. Officially Kaedah 3, Income Tax (Deduction from Remuneration) Rules
      1994. For YA2026 the MTD *formula* is unchanged — only relief line-items on Forms TP1(2026)/TP3(2026)
      changed (7 Budget-2026 relief items: vaccination, parent/grandparent medical, childcare, life/education/
      medical insurance, learning-disability treatment, tourism admission, EV-charging/CCTV). Resident
      employees use 1 of 5 formula categories (Normal, Additional, Returning Expert, Knowledge Workers in
      Specified Region, C-Suite non-citizen residents); non-resident/unknown-residency = flat 30%, no
      brackets/relief. Sources: `hasil.gov.my/media/arvlrzh5/spesifikasi-kaedah-pengiraan-berkomputer-pcb-2026.pdf`
      (official LHDN 2026 spec PDF), `hasil.gov.my/majikan/pembayaran-pcb/`. **GAP:** the actual progressive
      rate-bracket/threshold table (Category 1/2/3 numeric schedule) still needs a direct pull from the
      e-Jadual PCB or the full spec PDF's rate tables — not yet verified.
- [~] **5. EPF (KWSP) + SOCSO/EIS (PERKESO)** — PARTIAL, and EPF is a full gap. SOCSO/EIS monthly wage
      ceiling confirmed (3-0, high confidence): raised RM5,000→RM6,000 effective 1 Oct 2024, with a 6-month
      enforcement grace period through 31 Mar 2025 (source: `perkeso.gov.my/en/rate-of-contribution.html` +
      PERKESO Employers Circular No. 3/2024). But PERKESO's own page does **not** display the %-rate
      breakdown inline — only links out to Act 4 (SOCSO) / Act 800 (EIS) PDFs, which were not fetched. The
      commonly-quoted ~1.75%/0.5% (SOCSO Cat 1) and ~0.2%/0.2% (EIS) figures are secondary-source only, **not
      primary-confirmed**. **EPF/KWSP contribution rates were not researched at all this pass** — genuine
      full gap, need a direct pull of KWSP's official Third Schedule rate table.
- [ ] **6. IFRS/MFRS** — STILL OPEN, substantively unanswered. The only document actually fetched under the
      MFRS 15 URL (`masb.org.my/pdf_file/MFRS%2015.pdf`) is a single-page MASB staff FAQ (explicitly
      disclaimed as staff views, not Board views) on one narrow property-sale timing question (¶35(c)) — not
      the standard itself. No 5-step revenue-recognition model, no disclosure requirements, no IFRS-15
      convergence statement was verified. The full standard (reachable via an embedded link, not resolved
      this pass) still needs to be pulled and read before any "books reconciled locally" claim can cite MFRS 15.
- [x] **7. PDPA Malaysia** — CONFIRMED, high confidence (3/3 claims 3-0), and favorable to the design.
      Section 129 (cross-border transfer) amended by the Personal Data Protection (Amendment) Act 2024
      (passed Dewan Rakyat 16 Jul 2024, Dewan Negara 31 Jul 2024, gazetted 17 Oct 2024, effective 1 Apr 2025):
      **deletes** the old Minister-gazetted country whitelist entirely, replacing it with a controller
      self-assessed two-limb adequacy test (destination law "substantially similar" to PDPA, or "adequate...
      at least equivalent" protection) via a self-assessed Transfer Impact Assessment (valid up to 3 years) —
      no pre-approval required. Source: JPDP (Dept. of Personal Data Protection) consultation paper
      `pdp.gov.my/.../JPDP-FSB-241001-Cross-Border-PCP-ENG-TC.pdf`, cross-corroborated by Mayer Brown, Rödl &
      Partner, HSF Kramer, CMS, Allen & Gledhill. This directly supports a local-first/selective-disclosure
      design: no whitelist pre-clearance, self-assessed adequacy gives design latitude for local processing.

> **Net (superseded by the stub decision above):** boxes 2 and 7 are sourced enough to build against as-is.
> Boxes 1, 4, 5 are partially sourced — good enough for a labeled placeholder value. Boxes 3 and 6 are
> genuinely open and NOT worth another research pass for a mockup — stub them and move on.
> **Legal note (unchanged):** if this ever moves beyond mockup toward a real compliance claim, every value
> must be verified by a qualified professional first — do not assert compliance on the project's behalf.

---

## §FOLDER — where it lives (DECIDED + REVISED 2026-06-30)

**ALL work lives in `bim-ootb` ONLY — ZERO work in bim-compiler** (user 2026-06-30: "no work in other repo").
A **peer module**, separate from Viewer / Modeller / ERP / Teams — NOT a sub-folder of any. Built directly in
bim-ootb (no compiler-first scaffold-then-port step), mirroring the `teams` overlay convention.

| Repo | Folder | Sits beside | Notes |
|---|---|---|---|
| **bim-ootb** (the ONLY repo for HR) | **`hr_bim_asset/`** (top-level module) | `viewer/`, modeller, `teams/`, erp | isolated worktree `/tmp/wt-hr` branch `lane/hr-overlay` off origin/main; spec lives in `bim-ootb/prompts/`; own SW scope (never touch shared `sw.js`); no icon wired until told |
| ~~bim-compiler~~ | — | — | **NONE.** No `build/hr/`, no witnesses, no seed. Superseded. |

- **Name = `HR_BIM_Asset`** (user 2026-06-30: "no longer Payroll"). Payroll is just RUN **profile #1** of the
  generic engine (payroll · tenancy · strata · maintenance). The module = HR + BIM + Asset operate-phase fusion.
- **Own seed, independent** — `hr_seed.db` built from SQL, gitignored, its OWN stamped copy per
  [[feedback_modeller_gh_vs_viewer_oci_data]] (Viewer=OCI stream, Modeller=GH-pages, ERP=ad_full → HBA is a
  **fourth independent seed**; never shared).
- **Dotted lines only** — GL-post + `isEmployee` adapters light up *only when ERP is also loaded*; HR boots
  and runs a full cycle with zero ERP/`ad_full`/other suite present.

---

## §OPS — friction-avoidance (DECIDED 2026-06-30; architect is NOT a git admin)

Studied the repo's 20 documented git/deploy landmines (Explore sweep, 2026-06-30). HR is architected so
THREE of the four friction clusters **cannot arm** — and the rest is git hygiene the assistant runs
silently. The architect sees ZERO admin work.

| Cluster | Landmines | HR choice → eliminated |
|---|---|---|
| **OCI deploy** (MIME `--content-type`, no Cache-Control `?v=`, edge-cache rename, bucket mix-up, blind overwrite, stale snapshot) | #10–#17 | **GitHub Pages, NEVER OCI.** Seed is small sql.js (modeller/teams profile), not a streamed building DB → no OCI need. MIME inferred, deploy = `git push`, no flags/bumps/bucket-SOP. Whole cluster N/A. |
| **Shared-tree git** (branch-hop dirty, edit `~/bim-ootb`, stale-checkout-as-canon) | #6,#7,#8 | **Own worktree `/tmp/wt-hr` off fresh `origin/main`, branch `lane/hr-overlay`** (teams/redpill template). Never touch shared checkout (hook-blocked). |
| **`sw.js` conflict magnet** | #4 | **Own sw scope (or none v1); NEVER edit the shared `sw.js`.** Additive peer module = no shared-line conflict. |
| **LFS / large files** | #18,#19,#20 | **Seed-from-SQL, not blobs.** `hr_seed.db` gitignored + built from `migration/hr_*.sql` (source of truth); never LFS; scoped `git add`, never `git add -A`. |
| **Docs wipe** | #1 | HR doc pages (if any) ONLY via `scripts/safe_gh_deploy.sh` (W-DEPLOY-GUARD). Never bare `mkdocs gh-deploy`. |
| **Universal git hygiene** | #2,#3,#5 | **Assistant handles SILENTLY:** one-PR-one-push → verify landed on `origin/main` → fresh branch after any squash-merge; never leave committed-but-unpushed; `git diff --stat` before staging. Never surfaced to the architect. |

**Result:** HR is the cleanest-deploying module in the repo — `git push` to a GH-Pages module, no OCI, no
MIME flags, no cache bumps, no bucket/snapshot/rollback dance. See [[feedback_lane_git_handle_silently]].

---

## §STANDALONE + DOTTED LINES (the integration contract)
- Ships its **own `hr_seed.db`** (employees, elements, statutory tables, pay runs) + its **own 5-table
  instance** → boots and runs a full cycle with **zero ERP / zero `ad_full` / zero other suite loaded**.
- When ERP *is* present, two **adapters** (not hard deps) light up: (1) payroll/e-invoice journal ops →
  shared `fact_acct`/GL; (2) HR employees ↔ `C_BPartner WHERE isEmployee='Y'` (one identity). The app
  never *requires* them.

---

## §TARGET — small long-tail DIY users, with ability to scale

**Who:** the long tail the giants **can't profitably serve** — solo operators, small contractors doing
their own labor payroll, SME owners priced out of consultants and enterprise HCM. This is the ERP
long-tail doctrine (§0.19 dormant/self-activating; §13 shard-by-gravity) pointed at HR. Canonical first
user = a **small builder** doing their own site check-in + labor payroll, in the browser, offline, free
(the deskless-construction cut and the DIY long-tail cut on the same person).

**Why the framework is built for DIY-small (removes every long-tail barrier):**
| DIY barrier | Removed by |
|---|---|
| setup / IT / server | zero-install PWA — open a browser |
| consultant to configure | batteries-included presets (§0.9) + Excel-authored decision tables (§0.5) — owner edits own rules, no code |
| "why is my pay this?" | glass-box payslip explains itself |
| unjustifiable subscription | free demo (CONTOH/SAMPLE watermark) |
| poor/no connectivity | offline-true |
| privacy fear of a tiny vendor | never leaves the device |

**Scale = the SAME engine, nothing to migrate (gravitational, on existing rails):**
- 1→N employees = same `PAYRUN` doc, more lines
- 1→N sites/floors = `containers` (Site→Building→Floor) already recursive (§0.1)
- 1→multi-entity/group = more containers + journals, same shape
- solo device→team/distributed = op-log sync via the dumb facilitator (DistributedERP §6); shard by
  gravity as the log grows (§13 — op-log mass = the LOD metric)
- dormant cells self-activate (§0.19) — solo touches Payroll+Leave; T&A/access/multi-site light up *as
  they grow*, nothing to install, nothing to re-platform

**Positioning line:** *start as a solo, scale to a site, scale to a group — same tab, same op-log, nothing
to migrate.* The giants make you buy big and shrink to fit; we start at zero and grow without a replatform.

---

## §MARKET TRIAGE — fit vs the field, and where we set a *higher* standard

**Strategic cut:** own the **deskless / frontline / edge** workforce (construction first — home turf),
NOT enterprise desk-HCM. Desk-HCM (Workday/SuccessFactors/BambooHR/Personio) is cloud-collaborative,
content-heavy, integration-rich — we'd be a worse clone. Deskless (~80% of the global workforce;
incumbents Deputy/Connecteam/When-I-Work) is underserved AND still cloud-dependent, no cryptographic
integrity, no spatial model — exactly our framework's gap to fill.

**Triage (HR capability × framework fit × our better-standard angle × tier):**

| Capability | Archetype | Fit | Better standard | Tier |
|---|---|---|---|---|
| Payroll | ADP/Gusto/Talenox | ★★★★★ | glass-box trace + private + deterministic re-run | **T1 flagship** |
| Time & Attendance | Deputy/Connecteam | ★★★★★ | offline + signed non-repudiable + spatial | **T1 moat** |
| Leave/Absence | every HRIS | ★★★★ | accrual=op, balance=replay, feeds payroll | **T1** |
| Compliance/e-Sign (cert/permit/safety/ack) | DocuSign+LMS | ★★★★ | signed chain tamper-evident; construction safety | **T1** |
| People analytics | Workday/Visier | ★★★★ | free from op-log, temporal axis snapshots lack | **T1** |
| Core HR / employee master | BambooHR | ★★★ | table-stakes spine, no decisive edge | T2 |
| Onboarding/offboarding | Rippling | ★★★ | task-docs + signed steps | T2 |
| Compensation planning | Workday | ★★★ | comp-data privacy, enterprise-y | T2 |
| Expense claims | Concur | ★★★ | reuses POS/GL (`S_TimeExpense`→GL mapped) | T2 |
| Recruitment/ATS | Greenhouse/Deel | ★☆ | external multi-party, cloud-collaborative | **T3 don't** |
| Learning/LMS | Cornerstone | ★☆ | content delivery, not our strength | **T3 don't** |
| Benefits marketplace | Rippling/Gusto | ★☆ | carrier integrations, server-side | **T3 don't** |
| Performance/360/engagement | Lattice/CultureAmp | ★★ | collaborative/subjective, low determinism (anon-survey = possible novel privacy take, park) | **T3 defer** |

**Flagship = T1 only:** Payroll + T&A + Leave + Compliance-sign + Analytics — all offline, all private,
deskless/construction-positioned. T2 = opportunistic spine. **T3 = explicit anti-scope** (building it makes
us a worse Rippling and dilutes the moat).

**The 8 better-standard levers (cross-cutting, *why* T1 beats incumbents):** (1) explainability/glass-box,
(2) privacy-by-architecture, (3) offline-true, (4) cryptographic integrity, (5) deterministic replay,
(6) spatial fusion, (7) safely-editable rules (decision-table+dry-run), (8) analytics-for-free (op-log,
temporal). Levers **4/5/6 + the privacy half of 2** are ones cloud incumbents **structurally cannot match**
without abandoning their server model — that is where "better standard," not "parity," lives.

> Vendor references are stable archetypes (positioning, not current feature claims). **Current-feature /
> pricing specifics are a research item** (non-invent) — verify before any public comparison is published.

---

## §PILLAR 4 — Tenancy management (the kernel, a third time) — MODEL DEFINED 2026-06-30

User insight: with BIM (the model) + HR (party/recurring/signed-edge) + ERP (AR money cycle), **tenancy
falls out of reuse, not new build.** It overlaps ERP's payment-order cycle (rent = AR/O2C) and extends HR.

**Convergence:** BIM supplies the **leasable unit**; HR supplies **party + recurring-run + signed-edge**;
ERP supplies the **money cycle**.

**Model (reuse existing primitives, invent nothing):**
| Entity | = existing primitive | Notes |
|---|---|---|
| Unit (leasable) | BIM `container` (Site→Building→Floor→Unit) | carries real area/floor/location — the WHERE |
| Tenant / Landlord | party = `C_BPartner` (`isTenant`, mirror of `isEmployee`) | HR's party machinery |
| Lease | `documents` row (`doc_type=LEASE`), `draft→sign→active→renew/terminate` | term `[start,end]`, rent, deposit, escalation; **signed** (W-SIGN) = contract-as-event |
| Rent Run | **the payroll engine inverted** — `RENTRUN` doc, 1 invoice-line per *active* lease | same deterministic decision-table engine; cash-IN not cash-OUT |
| Money cycle | ERP **AR** — `C_Invoice(ARI)→C_Payment(ARR)→allocation→journal` | the GL dotted line extends to full AR |
| Access / occupancy | HR signed mobile-edge | tenant check-in/door to leased unit, spatially scoped to the BIM container |

**Keystone — Payroll and Rent are ONE engine:** a generic *periodic RUN* `(period × parties × element-rules)
→ signed lines → GL post`, direction-agnostic (cash-OUT=payroll, cash-IN/AR=rent). The engine is built ONCE
(`hr/engine.js` `runPeriod` + profiles); payroll = profile #1, tenancy = profile #2. The ONLY new concept
tenancy adds = **lease term + escalation + occupancy** (a decision-table over the lease; payroll has none).

**Moat:** lease the ACTUAL geometry — rent/m², vacancy-by-floor, occupancy heatmaps off the op-log + model.
Yardi/AppFolio/Buildium treat a unit as a DB row; nobody else has the building.

**Folder:** likely a peer `tenancy/` module reusing `hr/engine.js` (the shared RUN core) — decide when built;
the engine stays profile-generic so neither app forks it.

### §SPATIAL-VIEW (user 2026-06-30) — tenancy as an overlay on the model
Commercial OR residential: render the BIM model and **color each unit by lease status** (occupied / vacant /
expiring), rent, or tenant — the same overlay mechanism the viewer/Outliner already uses for disciplines/clash.
Vacancy-by-floor, rent/m², occupancy heatmaps lit on the ACTUAL geometry. This is the moat made visible —
Yardi/AppFolio have a row, not a model.

### §7D (user 2026-06-30) — the OPERATE phase = a true 7D BIM
Closes the dimension ladder: 3D model · 4D time · 5D cost (via BOM) → **7D = operate/facilities/lifecycle.**
- **Asset PM = RUN profile #3** — `period × assets × task-rules → signed work orders → GL` (same periodic
  engine as payroll #1 / rent #2). An **asset = a BIM element** (the MEP/equipment `disc_walker` already places).
- **Security maintenance** = the signed mobile-edge over spatial zones (who-may-enter = a signed capability) +
  security systems maintained as assets (a PM run).
- **The operate phase = periodic-RUN engine + signed-edge + spatial overlay**, all on ONE op-log + ONE model.
  → The generic RUN now serves THREE profiles: **payroll · tenancy · maintenance** (cash-out / cash-in / cost).
  The spatial view is the 7D cockpit that renders tenancy / maintenance-due / access overlays on one building.

### §ALPHA-MODELS (user 2026-06-30) — define the AD models, seed SINGULAR records, demo the feature
Directive: don't full-build — define each as a **new AD-defined model** with at least ONE record so we can
DEMO (alpha) "we have this." Delights BIM users (their model becomes the FM cockpit). Models:
- **Tenancy** (`HR_Lease`) — unit(bim_guid) · tenant · rent · term · deposit
- **Property Management** (`PM_Property`) — building(guid) · units · manager
- **Strata Title / Ownership** (`PM_Strata_Parcel`) — parcel · owner · share_units · maint_fee · sinking_fund
  → **RUN profile #4 `strata`** (charge OWNERS, cash-IN; sibling of tenancy)
- **Asset / Equipment** (`PM_Asset`) — **`bim_guid` ↔ `iot_device`** link · category · pm_cycle → the **7D Viewer
  overlay** seam (devices/IoT/equipment rendered on the model; live telemetry later).
All records carry the CONTOH/SAMPLE watermark (alpha). AD-shaped so they compile into the ERP AD when present
(dotted line), but seed standalone. RUN engine now serves **payroll · tenancy · strata · maintenance**.

---

## §CROSS-APP — HR_BIM_Asset threads Viewer + ERP + HR over BIM (user 2026-06-30)

HR_BIM_Asset is NOT one app — it is a **thin spine that cuts through three apps**, each contributing one facet
over the shared BIM model + signed op-log. A **tenancy** is the worked example that exercises all three:

| App | Contributes | Entities / connector dotted-line |
|---|---|---|
| **Viewer** (building — NOW) | the **SPATIAL view** — unit on the model · occupancy lens (2-head flaticon, blue active-band, word-on-hover) · storey **population-density dots** · click→zoom→**human dummy**→IFC-style popup · IoT/asset overlay | the WHERE rendered; reuses `navigate_engine` zoom+popup, `panels.js` `A.icon` |
| **ERP** | the **DEAL + MONEY** — Tenancy **agreement** (lease `documents` row) · **product** = rental / purchase / unit-type / **parking** (`M_Product` catalog; deal-type rental vs purchase) · **accounting** (AR: `C_Invoice→C_Payment→allocation→GL`) | `doc_poster` GL · `M_Product` · `C_Invoice/C_Payment` |
| **HR** | the **PEOPLE + ACCESS** — tenant **details** (party = `C_BPartner`) · **clock in/out** (attendance, signed-edge) · **security card** (access = signed capability over the unit's spatial zone) | `C_BPartner` · `kernel_ops` signed check-in · W-SIGN access token |

**BIM** underneath = the unit/space/asset geometry. The **signed op-log is the shared spine** all three write
to. ONE lease threads all three: the unit *(Viewer/BIM)* ← agreement + product + AR *(ERP)* ← tenant + access +
attendance *(HR)*. Each app stays its OWN module (§FOLDER); HBA is the thin spine that **references** each via the
connector dotted-lines — it does NOT absorb them.

**Build order:** Viewer spatial slice NOW (alpha, this commit); ERP agreement/product/AR and HR
details/attendance/access wire in when those dotted lines go live (swap the relevant connector stubs).

**Product Dashboard — installments (user 2026-06-30):** for products *purchased* on payment terms, the product
table's **Dashboard graph view** plots the **installment schedule** (paid vs outstanding over time). Reuses ERP
§0.7 self-graphing + `C_OrderPaySchedule`/`C_InvoicePaySchedule` (already mapped to `document_lines`) — a graph,
not a new engine. So: **rental → periodic RUN · purchase → installment plan**, both off the same op-log.

---

## §BINDING — how tenancy data maps to the model + gets injected (user 2026-06-30)

Q: does the blue band come on "when tenancy detected", and how do we inject/map the data like Items↔ProjectOrder?

**Activation (two states):** the Tenancy lens **icon appears only when ≥1 lease binds to a guid in THIS building**
(the join hits) = "detected"; no data → no icon (no clutter). The **blue band = the user toggling the lens ON**.
Detection gates the icon; the band is the on-state.

**Mapping key = `guid` — identical to Items↔ProjectOrder:**
- A lease carries `unit_guid` = the **IfcSpace (room) guid** — the SAME `e.room` handle the Outliner already
  derives from `rel_contained_in_space` (`viewer/bom_tree.js`). No IfcSpace → bind to the unit-container/storey
  guid (honest floor-level fallback).
- The viewer **already exposes `APP.guidMap`** — but it is keyed **`meshId→guid`** (the GUIDS ARE THE VALUES;
  instanced meshes carry a `_N` slot suffix on the key — verified against `viewer/streaming.js` +
  `ghostglass.js`/`picking.js`, 2026-06-30; the earlier "guid→mesh" here was inverted). So the `MeshPort` real
  impl is a VALUE reverse-lookup: `lease.unit_guid → scan guidMap values → meshId → tint/dummy`. Built as
  `binding.meshIdForGuid` / `Connectors.resolveGuid(guid, APP.guidMap)` (W-HBA-BIND B8/B9). Nothing new to render-plumb.

**Injection = the bim_orders_overlay delta-band pattern (reuse, don't reinvent):** `erp/bim_orders_overlay.js`
binds ERP docs to BIM via a **high-PK band (`≥ BIM_BASE`)** in a separate db (`bim_project_orders.db`), overlaid
onto the live `ad_seed.db` at boot (authoritative clear-then-insert; base never stale). HBA does the SAME — tenancy/
asset records (HR_Lease/PM_*) sit in an **HBA band**, overlaid at boot so leases surface in the standard AD windows
AND drive the lens. Standalone (no ERP): the lens reads the HBA seed directly. A lease = another bridge doc keyed
by the unit guid.

**NON-INVENT:** a demo lease must reference a **real IfcSpace guid** from the building → the join hits, the unit
lights up; a non-matching guid makes the lens **honestly show un-linked** (never fabricates a binding).
Detection = the join hits. Connector REAL seams: `resolveGuid → APP.guidMap` · `injectData → bim_orders_overlay
band-overlay` · `persist → OPFS HBA db`.

---

## §NEXT (spec-first order)
1. Spec the `PAYRUN` doc lifecycle + element-rule decision-table shape (Pillar 1) — witness the
   glass-box payslip trace + deterministic re-run (`replay-hash`).
2. Spec the signed-edge op envelope (check-in/access/sign) reusing W-SIGN/CAS (Pillar 2).
3. **Run the §RESEARCH GATE** (Pillar 3) — source every regulatory fact, THEN spec the attestation/selective-disclosure proof.
4. Free-demo packaging + groundswell positioning page (after 1–3 have witnesses).

Companion: `docs/ERP.md §0.3` (product-scope decision — add a pointer here when this leaves design-only).
Doctrine: DistributedERP.md §6 (dumb facilitator), §8 (accounting-as-reconciler), §0.20 (secured axis / W-SIGN).

---

## §P10d — DONE + LIVE (2026-07-02, this session)

Both queued items shipped and verified live on GH Pages (`https://red1oon.github.io/bim-ootb/`):

1. **lane/hr-overlay → main merge.** Surfaced a real collision doing it: PR #592 (merged 2026-07-01, a
   DIFFERENT session) had independently built the SAME `hr_bim_asset/`+`viewer/hba_*.js` module under the same
   filenames — `lane/hr-overlay` branched from `ce52497`, which predates `18437e1` (#592), so it never saw that
   merge. `git merge` produced add/add conflicts on ~10 files. Verified file-by-file (line counts + content
   diff) that `lane/hr-overlay` was a STRICT SUPERSET everywhere (same design, later/more-complete continuation,
   e.g. `panels.js`'s pill label "FM / Operate"→"Human-Asset" rename) — resolved via `git merge origin/main -X
   ours` (keep lane's content), full `hr_bim_asset` witness suite re-verified green after, shipped as PR #609.
   **Lesson for next time a branch shows unexpected add/add conflicts against main: check `git merge-base
   --is-ancestor <the-other-PR-commit> <branch-point>` before assuming it's a simple two-line conflict — it may
   be two independent lineages of the same feature.**
2. **CCTV real still.** `viewer/hba_cctv_still.jpg` (user's ContaCam capture) replaces the procedural-only
   mockup tiles — sliced into 6 distinct crops (source is itself a multi-cam dashboard screenshot), dimmed,
   scanline overlay, diagonal "STUB READY" watermark.

**Also shipped same session (PR #611, follow-up after live-testing found real bugs):**
- IoT sensors: replaced the 6 Chart.js line charts with **animated horizontal bars** (style extracted from the
  local `~/IfcOpenShell/src/bonsai/bonsai/bim/module/federation/river/equipment_operators.py` `draw_callback_px`
  — the actual RiverIoT/Federation reference the original `hr_bim_asset/iot.js` header already cited but never
  implemented), one distinct colour per sensor (`SENSOR_COLORS` in `viewer/hba_iot.js`), running value at each
  bar's leading edge, loops the 24h deterministic series. `tick(pt)` is the stub seam for real sensor wiring later.
- Billing table: dropped the "reading" column (`viewer/hba_iot.js` §c) — it duplicated the bar's live value
  AND the qty column (same number, shown 3x). Table now carries only qty(+unit) + net.
- Clicking a sensor bar OR a presence-roster row now actually flies the camera + drops a self-restoring gold
  highlight pulse on the real bound element. Root cause of "doesn't zoom": `HBALens.flyToZone` (`viewer/hba_lens.js`)
  matched mesh targets via `o.userData.guid`, which only ever finds REGULAR (non-instanced) meshes. HHS_Office_Federated
  renders most geometry as instanced/batched groups (§INSTANCED-TINT's `_N` slot suffix) — the exact same class
  of bug `buildMeshPort`'s `setTint` was already fixed for (see M6 in `witness_meshport.js`). `flyToZone` now
  reuses `HBA().B.guidTargets()` + `getMatrixAt()`/`matrixWorld` the same way `setTint` does.
- `viewer/pill_builder.js`: `btn.title` was hardcoded to `act.id` (e.g. every pill's tooltip showed its internal
  id, not its label) — fixed to `act.name || act.id`. Affects EVERY pill in the toolbar, not just Human-Asset.

Deploy chain used: PR (not direct push — `main` has required-status-checks branch protection,
`enforce_admins:true`) → `gh pr merge --auto --squash` → GH Actions `deploy-pages.yml`. **Squash-merge trap hit
live**: after #609 squash-merged, `lane/hr-overlay`'s remaining local commits could NOT be PR'd again directly
(diffing against squashed main re-shows the WHOLE original diff, ~2800 lines, not just the new commit) — the fix
was `git worktree add -b fix/hba-p10d-followup /tmp/... origin/main` (fresh off `main`) + `git cherry-pick
<the-one-new-commit>`, exactly per CLAUDE.md's "start the follow-up off fresh origin/main" rule. `lane/hr-overlay`
itself is now fully superseded (safe to delete, left alone this session).

---

## ▶ §P11 — QUEUED, NOT STARTED (user 2026-07-02, do in a NEW session)

User, after using the live deploy: **"make zoom to the iDempiere.html from dashboard when we hover over a
Resource or Employee Payroll as all are modelled with real underlying AD. Make it balanced."** + **"IoT sensors
still not zoomed to the Order/Line to indicate that its a doc ready ops for mgmt billing follow up."** + "This
can all be put into the user guide too."

**Reading of the ask:** a cross-app deep-link from the Viewer's HBA panes into the real iDempiere ERP UI,
wherever a pane shows a record that is genuinely backed by a real AD table row (per the "Compile not Model"
doctrine — see `▶▶▶ CRITICAL` block below — everything in this module already compiles onto real AD tables, so
this is just SURFACING an existing real PK, not inventing a new link):
1. **Dashboard → iDempiere**: hovering/clicking a Resource row or an Employee Payroll line in `hba_dashboard.js`
   / `hba_payslip.js` should deep-link to that record's real iDempiere window (open in a new tab/link, not a
   navigation-away — matches the existing pattern, see below).
2. **"Balanced"** — apply the SAME treatment consistently across entity types (Resource, Employee/Payroll,
   presumably also Tenancy/Occupancy/Asset where each already compiles to a real row) — not a one-off on a
   single pane. Audit which `hba_*.js` panes already show a real AD PK (most do, per the `ad_*.js` compile
   functions) and wire the SAME link affordance on all of them for consistency.
3. **IoT billing → C_Order/C_OrderLine**: `viewer/hba_iot.js` §c (the billing table, just simplified this
   session) shows real `c_order`/`c_orderline` shaped rows (`hr_bim_asset/iot.js billingLines()`) but has NO
   click-through yet — add one, so clicking a billing row deep-links to that order/line in iDempiere, visibly
   signaling "this is a real billable document ready for management's billing follow-up", not just a mockup
   number.
4. **Doc it** in `docs/HRBIMAssetGuide.md` once built (screenshots too, matching the existing guide format).

**The exact precedent to reuse (found this session, do NOT reinvent the link mechanism):**
`viewer/navigate_find.js` (`_surfaceExistingOrder`, ~line 1069-1088) already does exactly this kind of deep-link
for BIM→Project: an anchor tag (`elErpOpen`, `#find-erp-open`) whose `href` is set to
`'../erp/idempiere.html?client=garden&window=130&record=' + encodeURIComponent(pid)` (window `130` = the
GardenWorld Project window; `record` = the real `C_Project_ID`). The HBA panes need the SAME URL shape with the
right `window=<AD_Window_ID>` per entity type (Resource/HR window, Payroll/HR_Movement or payslip window,
C_Order window for billing) + the real PK each `ad_*.js` compile function already produces — look up the actual
`AD_Window_ID` values for each window from `build/erp/ad_full.db` (`SELECT AD_Window_ID, Name FROM AD_Window`)
before wiring, never guess the window number.

**Not started this session** — user explicitly closed for a new session before scoping/implementing this.

---

## ▶ §P11 — ✅ DONE + LIVE 2026-07-02 (bim-ootb PR #614, merged to main `5a83955`)

Shipped exactly as specced above, plus a mid-build user extension ("Payslip, Leave can zoom into the ERP side
also" — Payslip was already in scope; Leave was the new ask, triaged and added). `hba_lens.js` gained a shared
`erpLink(windowId, record)` builder + `AD_WINDOWS` constant (RESOURCE=236, PAYROLL_MOVEMENT=53042,
SUBSCRIPTION=316, ORDER=143, PAYROLL_CONCEPT=53036 — every id looked up from `build/erp/ad_full.db`, none
guessed), reused by all 5 panes:
- **Dashboard** — each real room now compiles a native `S_Resource` header row (`occupancy.js` new
  `toResourceTypeRow`/`toResourceRow`/`compileResources` — an on-demand "Room" `S_ResourceType` since this
  repo's only real types are Consultant/Plants/Work Center, same on-demand-dictionary precedent as
  `C_UOM`/`M_Warehouse`). A new "Resources" list under the charts links each room → window 236.
- **Payslip** — `ad_payroll.js payslip()` now surfaces the real `hr_movement_id` per line → window 53042.
- **Leave** — verified (again) it has NO native AD table anywhere in iDempiere. Rather than invent one, an
  unpaid entry links to the REAL `hr_concept_id` (UNPAID_LEAVE, already compiled+witnessed by
  W-HBA-AD-PAYROLL) it feeds into on payroll → window 53036 (Payroll Concept Catalog) — the honest "what this
  actually compiles onto", not a fabricated leave-record window.
- **Tenancy** — existing `c_subscription_id` → window 316, alongside (not replacing) the existing flyToZone
  row-click.
- **IoT billing** — existing `c_order_id` → window 143 ("ready for management billing follow-up", per the
  user's second ask).

**Witnessed:** new `witness_erp_deeplink.js` (19/19 — window-id ground truth independently re-sourced from
`ad_full.db`, URL shape, S_Resource non-invent gate, real-PK passthrough on every pane's compile source, the
Leave→concept link target). Full 34-file HBA node suite re-run, **zero regression**. Live chromium smoke
(`cdp_shot.js` against `demo/fm_panel.html`, `fm_panel.html` also gained `A._hbaResourceSpec` seeding so the
Dashboard link has data): opened all 5 panes, confirmed real `href`s render with the correct window/record
pairs, 0 console errors, 5 screenshots captured.

**Docs: DONE.** `docs/HRBIMAssetGuide.md` (bim-compiler repo) gained: a "Jump straight to the ERP record"
explainer (the pattern + the window/table reference table) plus — since they'd never been documented at all —
new "Payroll — payslip" / "Leave — balance & statement" / "Tenancy — AD compile" sections, each with a fresh
screenshot. Not done: recapturing the intro `hba_fm_drawer.png` screenshot against a live 8-lens HHS session
(still shows the old 5-lens drawer) — flagged inline in the guide with a footnote instead of a stale/misleading
silent gap.

## 🔎 2026-07-02 NIGHT — watchdog quality-review pass (independent re-read, no code changes)

Mechanism is solid, plainly: `erpLink()`/`AD_WINDOWS` (`hba_lens.js:453-469`) and all 5 panes use the identical
defensive idiom (null-check the real PK AND null-check `HBALens.erpLink` exists before appending the `<a>`) —
a missing/unresolved record never produces a dead link, matches the guide's claim verbatim. No TODO/FIXME
anywhere. Four small gaps, sized and assigned (per [[feedback_model_allocation_mastermind_vs_execution]]):

1. **Hardcoded `client=garden` tenant string** (`hba_lens.js:468`, inherited unchanged from `navigate_find.js`'s
   precedent) + the 5 numeric `AD_Window_ID`s in `AD_WINDOWS` are coupled to this one demo tenant/schema with
   no re-validation if it ever changes. Not urgent (single-tenant demo today) but worth a one-line comment
   flagging the coupling so a future multi-tenant session doesn't get silently misroutes. **Assign: Fable5.**
2. **`docs/img/hba_iot_billing_link.png` under-shows its own claim** — the billing table always renders 6 rows
   (`hr_bim_asset/iot.js:74-87`, one per sensor) but the screenshot is cropped to show only 4 (Solar/Electrical
   cut off), which could wrongly read as "only 4 of 6 sensors bill." **Assign: Fable5** (recapture scrolled to
   show all 6, or caption "first four shown").
3. **No mobile/narrow-viewport story anywhere** — all 5 panes use fixed pixel widths (`hba_payslip.js:75`
   width:340px, `hba_tenancy.js:39` width:380px) anchored `right:12px`, no `@media` query found in any
   `hba_*.js`, and it's never stated as an explicit desktop-only non-goal in this spec — it's just silent. On a
   phone-width viewport these panes will overflow. **Assign: Sonnet first** (is mobile actually in scope for
   this feature, or should the spec just say "desktop-only" and close the gap that way) **→ Fable5** to either
   write the non-goal note, or (if in scope) hand a real responsive pass to **Opus** (5 panes need consistent
   cross-file layout treatment, more than a one-file mechanical fix).
4. **Three screenshots (`hba_payslip.png`, `hba_leave.png`, `hba_tenancy.png`) show a near-empty 3D backdrop**
   behind the drawer (bare wireframe quad, no visible building), and "Human-Asset" header text is partially
   occluded by the pane in 2 of 3 — legible and functionally fine, but could read as "the model failed to
   load" to a first-time viewer. **Assign: Fable5** (recapture with a populated scene, or reposition the pane).

The Leave "indirect link" (→ payroll concept, not a native table) reads clearly on a first pass in the guide —
explained twice, framed as honesty not inconsistency. **No fix needed there.**

## ▶ 2026-07-03 — NEW THREAD: ERP-governed display (research done, decision pending)

User proposed a further convention: pane DISPLAY data (not just the §P11 deep-link target) should be derived
from a real iDempiere AD chain — HHS↔`M_Warehouse` (Name/Value), personnel↔`C_BPartner`↔`AD_User`, presence↔
`C_Attendance` etc. Full research (live-verified against `ad_full.db`'s real schema + `ad_seed.db`'s real rows,
not assumed), implications, 3 open design questions, and a staged Fable5/Opus/Sonnet plan are in the dedicated
spec: **`prompts/RESUME_HBA_ERP_GOVERNED_DISPLAY.md`**. Headline finding: `HR_Employee` has zero rows anywhere
in this codebase — this is a seed-data-authoring gap before it's a code-wiring gap. Do not start Stage 1 there
until §OPEN-QUESTIONS resolves. (Lane later shipped as native `S_Resource`/`S_ResourceAssignment` — see
`project_hba_erp_governed_display.md` in memory; §OPEN-QUESTIONS were resolved by that redesign.)

## ▶ 2026-07-04 — NEW THREAD: "Construction" window + Person bidirectional link-through + Leave-as-Resource
### (QUEUED, NOT STARTED — spec only, per user instruction; do not implement without a follow-up session)

Three gaps surfaced during the 2026-07-04 watchdog docs-QA pass (user review of the HBA/Teams/POS guides "from a
user's POV" — a direction check, not a correctness pass). Both confirmed against the real code/schema, not
assumed. Both are genuinely unbuilt — this section is the spec, the backlog entry, and the non-invent grounding
for whoever picks it up next.

### A. "Construction" — a second native AD_Window over M_Warehouse (not a rename, not a new table)

**The observation (user):** a Building currently compiles onto `M_Warehouse` (`docs/HRBIMAssetGuide.md` — "a
unit is a `M_Locator` + `M_Product` under a `M_Warehouse`-as-building"). The only real window over that table
today is native iDempiere window **139 "Warehouse and Locators"** (confirmed: `sqlite3 ad_full.db "SELECT
ad_window_id, name FROM AD_Window WHERE name LIKE '%Warehouse%'"` → `139|Warehouse and Locators`, the only hit).
That's warehouse-industry language leaking through into what is conceptually a **construction/building**
context — the compile target (`M_Warehouse`) is correct per doctrine (ERP-one-base, real-table-not-invented),
but the *window a user actually opens* still reads as a storage-facility screen, not a building one.

**The proposed fix — NOT a rename of window 139, a second window:** iDempiere's own real dictionary already
does exactly this pattern for other tables — confirmed: `C_BPartner` alone has **10** distinct native windows
over the one table (`Business Partner`, `Vendor Details`, `Customer`, `Payroll Employee`, `Business Partner
Info`, …). Adding a new `AD_Window` (+ its own `AD_Tab` rows) over `M_Warehouse`, named **"Construction"**, is
the *same established iDempiere convention* — not inventing a new mechanism. Window 139 stays untouched (any
existing user/report that opens it sees the same thing it always has); "Construction" is an additional,
role-appropriate lens on the identical `M_Warehouse` row.

**"...with further corresponding BIM model tabs" (user):** the new window's value-add over plain 139 is
extra tabs that pull in the BIM-side facts already compiled elsewhere in this module — e.g. a rooms/BOM tab
(reusing the existing `hba_bom.js` compile, §BOM above), an occupancy/utilisation tab (reusing `Dashboard`'s
`S_Resource` fold), maybe a presence/headcount tab. None of these would be new compiles — they'd be the
*existing* HBA panes' data, surfaced as native AD tabs instead of (or alongside) the additive floating panes.

**Open questions for whoever specs this properly (Sonnet-with-user first, per
[[feedback_model_allocation_mastermind_vs_execution]] — this is a data-model/UX call, not mechanical coding):**
1. Does "Construction" replace the additive floating panes (Tenancy/BOM/Dashboard) as the primary UI, or
   coexist as a second door onto the same facts (like Presence/Payslip/Leave do today)?
2. Which BIM-sourced facts get their own **tab** (native AD grid) vs. stay a **floating pane** (richer/visual,
   e.g. the 3D-camera-fly-to row click) — those are different UI shapes, not just a relabel.
3. Real `AD_Window`/`AD_Tab` seed rows need minting into `ad_seed.db` (or wherever this demo's dictionary
   additions live) with real, looked-up-not-guessed IDs, same discipline as every other window in this module.

### B. Person — the one HBA entity with no bidirectional click-through

**The observation (user):** "does a click-thru show up in ERP (true power of our singular kernel), and later
vice versa" — i.e. does Person deep-link BIM→ERP the same way every other entity in this module does, and does
ANY entity deep-link back ERP→BIM?

**Confirmed against the real code (`viewer/hba_avatars.js`, `viewer/hba_lens.js`):**
- Every other HBA pane's row carries a real **"open ↗"** deep-link into its native AD window — Dashboard→
  `S_Resource` (236), Payslip→`HR_Movement` (53042), Leave→`HR_Concept` (53036), Tenancy→`C_Subscription`
  (316), IoT→`C_Order` (143). **Presence does not** — `hba_avatars.js` only produces a hover card (name · room
  · since when), no `erpLink()` call, no `AD_WINDOWS` entry for a person/employee record at all. Person is the
  one entity in the whole module that doesn't compile bidirectionally through the kernel like its siblings.
- **No reverse direction exists anywhere in this module, for any entity** — grepped `viewer/*.js` +
  `erp/*.js` for a "jump from an open ERP record back into the 3D model" pattern (fly-to triggered *from* the
  ERP side) and found none. Today the arrow only ever points BIM → ERP.

**Proposed next steps (spec-first, do not implement without a fresh session + user sign-off on shape):**
1. **Forward (Presence → ERP):** give the Presence hover card (and/or the existing Presence roster drawer row)
   an `open ↗` into the real employee/party record — likely `AD_User` or `C_BPartner` (whichever the
   check-in's `employee` field actually resolves to via `MODELS.Official`, per the existing non-invent
   resolution already used for the name). No new `AD_Window` needed if a suitable one already exists in the
   dictionary (check first — don't assume one needs minting).
2. **Reverse (ERP → BIM), genuinely new territory:** from an open Business Partner / Employee window in
   `erp/idempiere.html`, a way to jump back to "where is this person right now / where do they work" — a
   fly-to into the loaded building, reusing `HBALens.flyToZone` from the other side. This has no precedent
   anywhere in the codebase yet — it needs its own small spec (what triggers it — a button on the BPartner
   form? only when a Viewer tab is already open in the same session? cross-tab/cross-window messaging?) before
   any code. Treat as a new capability, not a wire-up of something half-built.

### C. Leave should ALSO mark the person unavailable as a Resource (S_ResourceUnAvailable) — not payroll-only

**The observation (user):** "Leave is the unavailable status of the person as a Product/Resource? — the same
way ResourceAssignment models Mary Consultant." I.e. shouldn't a Leave `TAKE` also show up as the person being
an *unavailable resource*, the same way a room's maintenance blackout does — not just a payroll deduction?

**Confirmed, and the fit is exact:**
- The person-as-`S_Resource` identity already exists — Stage 3's "Mary Consultant" pattern (`ad_attendance.js`)
  gives every employee a real `S_Resource` row, with attendance sessions as `S_ResourceAssignment` children.
- A room's maintenance/renovation blackout is modeled as a real **`S_ResourceUnAvailable`** row
  (`occupancy.js` — "an UNAVAIL is the S_ResourceUnAvailable blackout", `s_resource_id` + `datefrom`/`dateto`
  + `description`). Verified in `ad_full.db`: `S_ResourceUnAvailable` is **tab 416 "Unavailability"**, a CHILD
  TAB of window **236 "Resource"** — the exact same window Dashboard's `open ↗` already deep-links into. No
  new window needed at all.
- `leave.js` today is a fully separate, self-contained signed op-log (`ACCRUE`/`TAKE`, `cls:'LEAVE'`) that only
  ever reaches payroll (unpaid days become an `HR_Concept` line, per Payslip's compile). It has **zero code
  path** into `S_Resource`/`S_ResourceAssignment`/`S_ResourceUnAvailable` — a person on leave is invisible to
  anything that reads resource availability (scheduling, an Occupancy-style "who's free" query), even though
  the identical native mechanism for exactly that already exists and is already wired up for rooms.

**Proposed next step (spec-first, needs a design pass before code):** on a `TAKE` op (or on payroll close,
whichever is the more honest trigger point — see open question 1), also emit a signed `S_ResourceUnAvailable`
row: `s_resource_id` = the employee's existing `S_Resource` (already resolved via the same `MODELS.Official`
join `ad_attendance.js`/`ad_payroll.js` use), `datefrom`/`dateto` = the leave range, `description` = leave
type (e.g. "Annual leave", "Unpaid leave"). This is additive to the payroll feed, not a replacement — Leave
still needs its own paid/unpaid balance replay for payroll; this just ALSO surfaces the same fact as a
resource-availability record, the same way a room's blackout does.

**Open questions for whoever specs this properly:**
1. Trigger point — emit the `S_ResourceUnAvailable` row at `TAKE` time (immediate, matches the room UNAVAIL
   pattern exactly) or only once the leave is approved/processed (payroll-period-close time)? Rooms don't have
   an approval step; leave usually does — this may not be a pure 1:1 copy of the room pattern.
2. Does this change what the **Presence** lens shows during a person's leave (e.g. should Presence/Dashboard
   grey out or explicitly flag someone on leave, the same way a room shows "unavailable · maintenance")? That's
   a real UX question, not just a data-model one.
3. Same non-invent discipline as everywhere else: a `TAKE` whose employee doesn't resolve to a real `S_Resource`
   must be honestly skipped, never fabricate one.

Neither A, B, nor C is started. Log here, not in `MEMORY.md`'s per-session churn, so the next session that
touches HBA finds this without re-deriving it.

## ▶ 2026-07-04b — A/B/C ✅ ALL DONE (the fresh Sonnet-with-user design pass + build this section asked for)

The design pass happened first (AskUserQuestion, 4 questions covering the real forks left open above), THEN
implementation, in `/tmp/wt-hba-a2c` off fresh `origin/main`, branch `lane/hba-construction-clickthru`, bim-ootb
PR **#645** (pushed, not yet merged — this repo's normal PR flow, `main` has required-status-checks).

**Design answers that shaped the build (supersede the open questions above):**
- A coexists with the floating panes (doesn't replace them). "Further BIM model tabs" was a misreading —
  Construction is purely an **iDempiere-side** AD_Window; the Viewer-side click-through is the actual ask,
  answered as "in Find, at a storey/room, zoom to iDempiere."
- C: don't invent a new Viewer panel — the blackout must show up in the **standard iDempiere Resource
  Schedule** (native tab 416 under window 236). This session's Leave-side scope = click-through only.
- B: forward link only (Presence → AD_User). Reverse (ERP record flying back into the 3D model) explicitly
  deferred — genuinely new mechanism, no precedent anywhere in the codebase, needs its own spec.

**A — "Construction" AD_Window.** `scripts/seed_hba_construction.js` (NEW): proto-clones window 139's
AD_Window + all 5 AD_Tab rows + all 60 AD_Field rows under a new id band (`CONSTR_BASE=7,800,000`), Name→
'Construction', window 139 byte-identical/untouched. Idempotent (2nd run = 0 additions), self-witnessed (10
checks: tab/field/column parity, `ad_parser.js getWindow()`'s own query resolves it — no manifest edit needed
since it's a brand-new id). `hba_lens.js AD_WINDOWS.CONSTRUCTION=7800000`. `navigate_find.js` gained a second
shared link element (`#find-construction-open`, mirrors the existing `#find-erp-open` Project-link pattern)
+ `_surfaceConstructionLink(guid,label)`, wired into both `_roomSelect`/`_roomGroupSelect` — building-grain
honestly (every room/storey in one building shares the same warehouse record; HBA absent → honest no-op,
never fabricates a warehouse id). Live smoke `viewer/tests/poc_construction_link_live.js` (NEW, Playwright,
real HHS_Office_Federated + Find's Room-lens axis toggle + a real tree-row click): 8/8, confirms
`window=7800000&record=990000` (the real seeded warehouse id), 0 pageerrors.

**B — Presence forward link.** `viewer/hba_lens.js openPresenceDrawer`: each roster row (was a `<button>`,
now a `<div>` so a nested `<a>` is valid) gains an "open ↗" to `AD_WINDOWS.USER=108` (AD_User), record=
`official.ad_user_id` (always populated on every real `MODELS.Official` row, unlike the nullable
`c_bpartner_id`) — `stopPropagation()` so the link doesn't also trigger the row's `flyToZone`. Witnessed:
`witness_erp_govern_wire.js` WIRE6 (+1, 9/9 total). Live smoke (below, shared file with C): 9/9.

**C — Leave-as-Resource.** NEW `hr_bim_asset/ad_leave.js`: `toUnavailableRow(takeOp, s_resource_id, seedId)`
projects a signed `TAKE` op onto the real `S_ResourceUnAvailable` columns (datefrom=the TAKE's own date,
dateto=datefrom+(days-1), pure arithmetic on the supplied ts — never `Date.now()`); `compileLeaveUnavailability`
+ `readUnavailability` (lens read, mirrors `ad_attendance.readPresence`'s JOIN shape). `scripts/seed_hba_erp.js`
extended (§8, before the self-witness block): seeds 6 real rows (EMP001/EMP002 × 3 demoLog TAKE ops each),
proto-cloned from the stock row (id=100 "Training class") for exact column parity; self-witness confirms the
JOIN through Resource↔AD_User is lossless (6/6). `viewer/hba_leave.js renderStatement` gained a "Resource ↗"
link to `AD_WINDOWS.RESOURCE=236`, record=`A._hbaEmpResourceMap[empId]` — a NEW standalone export off
`hba_lens.js _regovern` (the same real-row-sourced map `_hbaAttendanceSpec` already builds internally, now
also exposed for reuse); honest no-link when ungoverned (no ERP db loaded → no map → no fabricated id).
Witnessed: `witness_ad_leave.js` (NEW, 10/10 — non-invent gate, date-range math, honest-skip, determinism) +
`witness_leave_pane.js` LP5b-d (+3, 13/13 total — absent-when-ungoverned, present-with-correct-href-when-
governed). Live smoke `viewer/tests/poc_presence_leave_link_live.js` (NEW, Playwright, `fm_panel.html`): 9/9 —
Presence roster's 3 rows all link to `window=108`, Leave pane's "Resource ↗" links to `window=236&record=
990109` (EMP001), 0 pageerrors.

**Regression:** full 41-file HBA node witness suite (was 40 baseline + `witness_ad_leave.js`) — zero failures
throughout the build, checked after every file edit.

**Docs:** `docs/HRBIMAssetGuide.md` updated — the "Jump straight to the ERP record" table gained Leave→Resource
and Presence→AD_User rows; new paragraphs in the Presence, Leave, and Tenancy sections explaining the
Construction window / Resource-Unavailable / forward-link additions. **Not done:** no new screenshots this
session (the 3 additions are click-through mechanics, not new visual panes — flagged rather than silently
skipped, matching this doc's own established convention for partial doc passes).

**Genuinely still open (not started, not this session's scope):**
1. ~~B's reverse direction has zero precedent~~ **CORRECTED same-day, see §2026-07-04c below** — it exists
   (`erp/zoom_across.js`), just not wired for HBA's tables yet. Do NOT re-search for it; the finding + the exact
   spec for finishing it is §2026-07-04c.
2. Recapture `hba_fm_drawer.png`-style screenshots for the 3 new affordances (Construction link, Presence
   open↗, Leave Resource↗) if this guide gets a fresh screenshot pass.
3. bim-ootb PR #645 needs a human merge decision (branch protection + required status checks on `main`).

---

## ▶ 2026-07-04c — SPEC, READY TO BUILD NEXT SESSION: close the Zoom Across loop for HBA entities

**User verdict (2026-07-04, same-day follow-up):** confirmed this is a genuine "wow" — real reasons, not
politeness: it reuses an existing, already-tested abstraction (no new mechanism, unlike the multi-grain idea
below that was correctly killed); it's small (two additive wires, not a subsystem); it completes the
bidirectional round-trip the whole A/B/C thread has been circling (BIM↔ERP, precise both ways, for Person/
Room/Tenant/Resource, not just the one-way links shipped today). **Do not re-derive any of the findings below
— they were checked against the real code this session, not assumed. Just build it.**

### §BACKGROUND — two design mistakes made and corrected in this same session, don't repeat them
1. **Multi-grain priority chain for Find's room tap (subscription → product/locator → building) — REJECTED.**
   Considered, then killed: it makes the SAME gesture (tapping a room) produce 3 different, unpredictable
   outcomes depending on invisible backend data (does this room have a lease? does it have its own compiled
   Product?), it's redundant with the Tenancy pane's ALREADY-CORRECT per-room subscription link, and it barely
   fires (3 tenant records in the whole demo). **Do not resurrect this.** Find's Room-lens tap stays
   building-grain only (→ Construction window, `hba_lens.js`/`navigate_find.js`, already shipped PR #645).
2. **Locator-grain deep-link ("why not just link to this room's own M_Locator row?") — genuinely hard, not
   worth it.** `M_Locator` has NO top-level `AD_Window` of its own — it's only a CHILD TAB (178) of window
   139/Construction. `erp/idempiere.html`'s `_landOnRecord(rid)` (the function `?window=&record=` deep-links
   into) ONLY ever searches whichever tab is CURRENTLY ACTIVE (the header/main tab) — there is no `&tab=`
   param, no child-tab switching, no "wait for lazy-loaded child rows then match" logic anywhere in the app.
   Building that would be genuinely new plumbing (open window → land on parent row → switch to child tab →
   wait for it to load → match the child row) — a real, non-trivial addition, unlike the trivial guid→locator
   *data* lookup itself (`A._hbaTenancySpec.locators.find(l => l.value === guid)` is one line). **Not in scope
   next session either** — flag if it ever becomes worth it, don't build it opportunistically.

### §THE REAL MECHANISM — already built, verified this session, just under-populated
`erp/zoom_across.js` — a generic, surface-agnostic registry:
```
ZoomAcross.register({ id, label, available(ctx)->bool, launch(ctx) })
ZoomAcross.targets(ctx) -> the destinations whose available(ctx) is true
```
Its own header: "GENERALISES iDempiere's native Zoom-Across (record → related WINDOW) to record → related
SURFACE (the BIM Viewer now; the Modeller etc. later)." `erp/idempiere.html` already registers a live `'viewer'`
destination (search `if (window.ZoomAcross) window.ZoomAcross.register({ id: 'viewer'`) whose `launch(ctx)`
opens `../viewer/viewer.html?db=...&bld=...&find=<scope>&home=<erp-url>` — this IS the red pill ("Zoom Across")
the user recalled building earlier. **Two concrete gaps, both small, both additive:**

**Gap 1 — `_zoomScope(ctx)` (erp/idempiere.html, ~line 4470) only recognizes 3 table names today:**
`c_project` (→ `{bld: Value, find: null}`), `c_projectline` (→ `{bld, find: <ifc_class via M_Product join>}`),
`pp_order` (→ `{bld, find: null, tm: {order}}`, TimeMachine mode). **None of today's HBA tables are wired in.**
Extend with more `if (tn === '...')` branches, reusing the identical return shape + the SAME registered
destination/launch (no new registration, no new URL scheme):

| Table (`ctx.tab.tableName`) | `bld` | `find` | Notes / honesty caveats |
|---|---|---|---|
| `m_warehouse` | `Value` column (already = the building name, per `ad_tenancy.toWarehouseRow`) | `null` | Trivial — same shape as `c_project`'s branch. Lands on the building, no finer scope (a Warehouse record isn't finer than that). |
| `c_subscription` | via `m_product_id` → `SELECT Value FROM M_Product WHERE M_Product_ID=?` → the room's guid → then join `M_Product.m_locator_id → M_Locator.m_warehouse_id → M_Warehouse.Value` for `bld` | the room's guid (from the M_Product join) | `C_Subscription` itself carries NO guid column (column-pure row, per `toSubscriptionRow`) — the guid only exists in `ad_tenancy.js`'s compile-time WRAPPER (`{row, unit_guid,...}`), never persisted. From the ERP DB alone you must re-derive it via the M_Product join — exactly the same join shape `c_projectline`'s branch already does for `M_Product_ID`. Real SQL work, but a proven pattern, not a new one. |
| `s_resource` | via `m_warehouse_id` → `M_Warehouse.Value` | `Value` column IF it's a room (guid-shaped) — **ambiguous**, see caveat | `S_Resource.Value` holds EITHER a room guid (`occupancy.toResourceRow`) OR an employee code like `"EMP001"` (`ad_attendance.toPersonResourceRow`) — same column, two different meanings depending on which compile path made the row. Disambiguate via `ad_user_id IS NOT NULL` (a person) vs NULL (a room) before deciding what `find` means. |
| `s_resourceunavailable` | via `s_resource_id` → same resolution as `s_resource` above | same as above | One extra join hop (`S_ResourceUnAvailable.s_resource_id → S_Resource`), then identical to the `s_resource` branch. |
| `ad_user` | via the person's `S_Resource` (`ad_user_id` FK) → `m_warehouse_id` → `M_Warehouse.Value` | **HONEST GAP, do not invent**: this person's CURRENT zone/room is NOT a column on any AD table — it's a BIM-side view-trace fact (`ad_attendance.js` compileAttendance's `spatial` array, keyed by `s_resourceassignment_id`, explicitly documented as "never a fabricated FK" — see `hr_bim_asset/ad_attendance.js` header). From the ERP DB alone, an `AD_User` record can only resolve to "their building," never "their exact room right now." Ship `find: null` for this table honestly; do NOT fabricate a zone lookup that doesn't exist. |

**Gap 2 — the Viewer never reads the `find=` param at all.** Checked `viewer/config.js` (the file that reads
every other launch param into `A.*`: `A.DB_URL`, `A.RECORD_ID = _params.get('record')`, `A.HOME_URL =
_params.get('home')`, etc.) — there is NO `_params.get('find')` anywhere. So even the ALREADY-WORKING
`c_projectline` reverse path today only ever lands you on the right BUILDING, never the right ELEMENT — the
loop was half-built and silently dropped its own finer scope. **This is the one wire that actually delivers
"vice versa, precisely"** — without it, Gap 1's work only gets you building-grain (which the Construction link
already does from the Viewer→ERP direction). Fix: read `A.FIND_GUID = _params.get('find')` in `config.js`
(mirroring the existing `RECORD_ID`/`HOME_URL` pattern), then on boot (after streaming completes, same
readiness gate `hba_lens.js`'s own `_poll` already uses — `A.guidMap` populated + `A.streaming` false), if
`A.FIND_GUID` is set: open Find (`A.openFindPanel`), then either fly directly to that guid (if it resolves to
a rendered mesh — reuse `HBALens.flyToZone`/the `_roomSelect`-style centroid logic already built for rooms) or
select it in the Find tree if it's a non-mesh identifier (an employee code isn't a guid, so `s_resource`'s
Value≠guid case needs a different resolution path — probably: look up that employee's OPEN attendance
session's zone client-side via `A._hbaAttendanceLog`/`ad_attendance.js`'s own reader, the SAME BIM-side fact
`ad_user`'s ERP-side branch above honestly couldn't reach — i.e. the fine landing for a PERSON may need to
happen viewer-side using data ERP-side never had, not ERP-side passing a precise `find` value at all).

### §BUILD ORDER (spec-first, witness after each step, same discipline as A/B/C)
1. Extend `_zoomScope()` with the `m_warehouse`/`c_subscription`/`s_resource`/`s_resourceunavailable`/`ad_user`
   branches per the table above (idempiere.html). Node/Playwright witness per table (mirror `poc_zoom_across.js`'s
   existing shape — gate-true, correct `bld`/`find`, gate-false on an unrelated table).
2. Wire `A.FIND_GUID` in `config.js` + the boot-time consumption (open Find + resolve/fly) in whichever file
   owns Viewer boot sequencing (likely `main.js`, alongside the existing `wizard`/`diffdb` boot-param handling
   pattern already there). Live smoke: launch from an ERP `s_resource`/`c_subscription` record, confirm the
   Viewer lands on the SAME room/element, not just the building — this is the actual "vice versa" proof, not
   just a URL shape assertion.
3. Full existing suite (HBA's 41 node witnesses + `zoom_across`'s own existing witnesses) — zero regression,
   same discipline as every prior HBA session.
4. Doc: `docs/HRBIMAssetGuide.md` gets a new "Jump back from ERP into the model" section once built (screenshot
   pass optional per the existing convention of flagging rather than skipping).

**Not in scope even after this:** the Locator child-tab drill-down (§BACKGROUND point 2) and the AD_User exact-
zone problem's ERP-side half (genuinely unsolvable from the AD dictionary alone, per the table above) — both
correctly flagged as honest gaps, not silently invented workarounds.

## ▶ 2026-07-04c ✅ BUILT — the reverse Zoom Across loop is CLOSED (bim-ootb `lane/hba-construction-clickthru`, PR #645)

Built exactly per §BUILD ORDER above, plus two discovered-and-fixed prerequisites the spec didn't anticipate
(both logged, not silently smoothed over):

1. **`_zoomScope()` extended** (erp/idempiere.html) with all 5 branches from the Gap-1 table — m_warehouse,
   c_subscription, s_resource (room+person disambiguation via `ad_user_id`), s_resourceunavailable, ad_user
   (honest `find:null`). Same {bld,find} shape, same registered `'viewer'` destination — zero new mechanism.
2. **Discovery: `C_Subscription`/`C_SubscriptionType` had ZERO physical rows anywhere** — `ad_tenancy.
   compileBuilding()` only ever compiled them in memory; the Tenancy pane's existing "open ↗" link (window 316)
   was pointing at a fabricated in-memory id with no real row behind it. Fixed by extending
   `scripts/seed_hba_erp.js` §9 (mirrors the HR_Process/HR_Movement activation pattern exactly): minted the 2
   real `C_SubscriptionType` rows, minted real `C_BPartner` rows for the 4 tenant/owner party codes (BP-TEN-1/5/6,
   BP-OWN-1 — closing a second honest gap, AD_User.c_bpartner_id, along the way), persisted all 4 real
   `C_Subscription` rows via the already-witnessed `compileBuilding()` output. Self-witnessed (`SUB-JOIN-LOSSLESS`)
   and idempotent (2nd run = 0 additions).
3. **Discovery: window 316 "Subscription" itself was silently dead** — real in upstream `ad_full.db` (Name=
   "Subscription", Tab 621 + 12 fields already active in `ad_seed.db`) but IsActive='N' in stock iDempiere AND
   entirely absent from `ad_seed.db`'s curated 374-window extract (vs 458 in the full dictionary) — `getWindow()`
   requires a live `AD_Window` row, so the Tenancy pane's own forward link has been dead since it shipped.
   Fixed: activated the real extracted row (byte-for-byte from `ad_full.db`, IsActive flipped Y) — same
   "activate a dormant native window" precedent as the whole HR_Process/HR_Movement mission. Witnessed
   (`WINDOW316-LIVE`).
4. **`A.FIND_GUID` wired** (`viewer/config.js` `?find=` param) and consumed on boot (`viewer/hba_lens.js
   _consumeFindGuid`, called from the existing `_poll` readiness gate): a rendered guid flies directly via
   `flyToZone`; a bare employee code with no rendered mesh resolves via that person's OPEN attendance-session
   zone (`A._hbaAttendanceLog`) and flies there instead; neither path fabricates a position — an unresolvable
   code is logged, never dropped silently.
5. **Witnesses, all GREEN, zero regression**: `hr_bim_asset/tests/witness_find_guid.js` (5/5, new) +
   `erp/tests/poc_zoom_across_hba.js` (17/17, new, live Playwright — real click-through per table incl. a
   real child-tab switch for `s_resourceunavailable`) + `viewer/tests/poc_find_guid_live.js` (15/15, new, live
   Playwright against the REAL `HHS_Office_Federated_extracted.db` — asserts the ACTUAL live `camera.controls.
   target` matches the logged centroid, not just a log line) + full existing 42-file HBA node suite + existing
   `poc_zoom_across.js`/`poc_construction_link_live.js`/`poc_presence_leave_link_live.js` all still green.
   **The `poc_find_guid_live.js` run is the actual "vice versa, precisely" proof**: `?find=EMP001` independently
   cross-checked against `HbaAttendance.sessions()` resolves to `RM_Level_1_1`, and the live camera really lands
   there (target within 0.05 of the logged centroid) — not just the building.
6. **Docs**: `docs/HRBIMAssetGuide.md` gained the "Jump back from ERP into the model" section (after "Jump
   straight to the ERP record"), with the same table shape as the rest of the guide.

**Still correctly out of scope** (per §BACKGROUND, unchanged): the Locator child-tab drill-down, and the
AD_User exact-zone problem's ERP-side half. **PR #645 needs a human merge** (branch protection + required
status checks on bim-ootb `main`, per this repo's normal flow) — not yet merged as of this session's close.

---

## ▶ 2026-07-04d — LOD400 sourcing POC ✅ DONE (bim-ootb PR #651); rest QUEUED for a NEW session: IoT/CCTV zoom+highlight, USD/RM costing, real Product+Order click-through

**User ask (verbatim intent):** clicking a CCTV tile or a sensor should zoom the camera to that device AND
tint its mesh orange (the same highlight idiom `flyToZone`'s pulse already uses elsewhere); the billing table
should show costs in USD/RM (not a bare unlabeled number); clicking a billing line should zoom to the real
`C_Order`/`C_OrderLine` record in iDempiere; the cameras/sensors themselves should also compile as real
`M_Product` rows in iDempiere, same as every other compiled BIM element. Also asked: **where would LOD400
geometry for CCTV cameras and sensors come from?**

### §LOD400-CHECK — answered this session (don't re-search, the finding is below)
**Genuine gap, checked exhaustively, nothing found:** `library/component_library.db` (23,888 `component_definitions`
+ mesh geometry) has an `IfcSensor`/SENSOR component *type* (id 13) but **zero** mesh rows under it — no
temperature/pressure/sound/dust/solar/electrical-meter geometry anywhere. **Zero** matches for "camera"/"cctv"/
"security" in any field, in this db or anywhere in either repo (`bim-compiler`, `bim-ootb`) — no `.glb/.gltf/
.obj/.fbx/.blend/.stl` asset named camera/cctv/sensor exists. `ERP.db`'s `ad_element_mep` carries one
`IfcSensor` classification row (`SMOKE_DETECTOR`, NFPA 72 placement rule) — a placement RULE, not geometry.
The **closest real precedent** is `IfcAlarm`/type_id 11 (smoke/heat detectors, ~20 real mesh rows, e.g.
`jkrME18_fir-al_smoke detector`) — same wall/ceiling-mount small-box form factor a CCTV dome/box camera or a
wall sensor would need, and the same category `component_library.db` already knows how to hold. `docs/internal/
WalkerDoctrine.md` §2 confirms LOD400 swap-in is explicitly a documented **future "finish state"** (POC uses
primitive boxes) — this isn't a surprise gap, it's the same known boundary applied to a new device class.
**Two honest paths for next session, pick one before building:** (a) source/purchase or model 6-8 real LOD400
meshes (camera dome/box, thermostat, pressure gauge, sound-level meter, dust sensor, solar panel, electrical
meter) and add them to `component_library.db` under new component_types — real work, not a mock; (b) ship a
primitive-box placeholder per device (small labeled cube/cylinder at the device's real bound position) as the
interim shape, same discipline as every other "primitive now, LOD400 later" element in this codebase — cheaper,
consistent with the Walker Doctrine's own POC convention, and unblocks the click/zoom/highlight/Product work
below without waiting on asset sourcing.

### §LOD400-POC ✅ DONE 2026-07-04 (bim-ootb PR #651, branch `lane/iot-lod400-poc`) — option (a) chosen, and it's real

**Path (a) above is genuinely viable — 4 of 6 device types found FREE, unmodified, real geometry, no login
wall.** Fetched from **NBS Source** (`source.thenbs.com`, the same library option (a) named) and saved to
**`bim-ootb/IFC/LOD/`** (a NEW subfolder, deliberately distinct from `IFC/`'s per-building-ARC-only convention
— these are standalone component objects, not buildings):

| Device | File | Real IFC classification |
|---|---|---|
| CCTV camera | `CCTV_Paxton10MiniBulletCamera_CORE.ifc` | `IfcBuildingElementProxyType`, `IfcExportType='CAMERA'` (~900 geometry entities) |
| Temperature/env sensor | `Sensor_Aico_Ei1025_TempHumidityCO2.ifc` | `IfcSensorType`, `.TEMPERATURESENSOR.` |
| Solar | `Solar_NBS_PhotovoltaicModule.ifc` | `IfcEnergyConversionDevice` |
| Electrical | `Electrical_Bender_LINETRAXX_PEM353_PowerMeter.ifc` | `IfcFlowInstrumentType` |

**Still genuinely not found (don't invent a stand-in mesh):** boiler pressure gauge, sound-level meter,
dust/PM2.5 sensor — widen the manufacturer search (Siemens/Danfoss/Honeywell BIM portals) next session, or
fall back to option (b)'s primitive box for just these two.

**The reusable fetch recipe (don't re-derive):** NBS Source product pages embed a normalized cache blob in
the raw HTML — `"__typename":"DigitalObject","format":"IFC"` referencing a `DigitalObjectFile-<id>` record
that resolves to `"assetId":"<uuid>"`. The real file is a plain unauthenticated GET:
`https://asset.source.thenbs.com/api/<assetId>` → raw `.ifc` (STEP/ISO-10303-21), `Content-Type: text/plain`.
**Must use a real browser User-Agent** — NBS Source 403s a bare `WebFetch`-style bot signature; a plain `curl
-A "Mozilla/5.0 ..."` works fine, no account, no payment. Full detail + provenance: `IFC/LOD/README.md`
(bim-ootb, same branch).

**Next session — placement into HHS_Office_Federated as sample data (NOT done yet, this POC only proves the
objects are real+fetchable):**
1. Pick real bind positions for each device inside `HHS_Office_Federated` — reuse `models.js Asset` records'
   pattern (e.g. `AHU-03`'s `bim_guid` already binds one IoT-linked element; the camera/sensor/solar/electrical
   objects need their OWN new bound positions, honestly chosen — a real room/wall/roof location, not a random
   coordinate).
2. Parse each `IFC/LOD/*.ifc` (real geometry, small files) and transform its local geometry into
   `HHS_Office_Federated`'s coordinate frame at the chosen bind position — this is real IFC-parsing/geometry-
   transform pipeline work (reuse whatever this repo's existing IFC→extracted-db compile step already does for
   a single element, don't hand-roll a new one).
3. Insert as new `elements_meta`/geometry rows in `HHS_Office_Federated_extracted.db` (or a clearly-labeled
   sample/demo overlay db, if writing into the canonical extracted db directly isn't the right call — decide
   before building, per Spec-First) with real new guids.
4. Wire those new guids into `models.js Asset` records / `iot.js`'s per-device compile (today ALL 6 sensors
   share ONE asset's guid — AHU-03 — this is the fix that gives each device its own real position) so
   `flyToZone`/the orange-highlight work (§BUILD ORDER point 3 below) has a REAL per-device target, not the
   shared placeholder.
5. Witness: a live Playwright smoke that the new elements actually render, resolve via `A.guidMap`, and
   `flyToZone` lands the camera on each one individually (not all landing on the same AHU-03 spot).

### §PRODUCT-PERSISTENCE-CHECK — same bug class as this session's C_Subscription fix, confirmed present
`hr_bim_asset/iot.js billingLines()`'s `m_product_id` is a **sequential in-memory mint** (`++prodSeq`, 1/2/3…)
— never a real seeded `M_Product` row, same "compiled but never persisted" gap this session found and fixed
for `C_Subscription`/`C_SubscriptionType`. Fixing the user's ask #4 ("Product of those cams/devices also in
iDempiere") means: seed one real `M_Product` row per device (Value=a stable device id, e.g. `IOT-AHU03-TEMP`
matching `models.js Asset.iot_device` already in use — reuse, don't invent a new id scheme), `m_locator_id`
pointing at the SAME room/asset locator the bound BIM element already resolves to (mirrors `ad_tenancy.
toProductRow`'s exact pattern), then `toOrderLineRow` reads the REAL seeded `m_product_id` via `erpQuery`
match-or-create (the same `_one(erpQuery,...)` idiom `ad_tenancy.js` already uses) instead of minting one.
Real window to click into: **`AD_WINDOWS.PRODUCT = 140`** ("Product", verified active in `ad_seed.db` —
add this id to the shared registry alongside `RESOURCE`/`ORDER`/etc., `viewer/hba_lens.js:556`).

### §CURRENCY-CHECK — USD/RM already real, no invention needed, just wire it
`C_Order`/`C_OrderLine` both carry a real `c_currency_id` column (verified `ad_full.db` PRAGMA — already true,
just unused by `iot.js` today). **Better still: MYR↔USD conversion is ALREADY seeded** —
`scripts/seed_fin_currency.js` (a different feature, CIDB construction costing) already extracted a real
`C_Currency` MYR row (id 301, ISO 4217 458, `CurSymbol`='RM') + a real `C_Conversion_Rate` row against the
accounting-schema currency (USD, id 100) from a sourced CIDB exchange-rate pack. `iot.js toOrderLineRow`'s
flat `priceactual = 0.5` (no currency, no sourced rate) should instead: set `c_currency_id` to MYR (the natural
"local site cost" currency for a building's utility/security spend), and the billing pane display BOTH the RM
line amount AND its USD equivalent via that SAME already-seeded conversion rate (never a second invented rate).

### §BUILD ORDER for next session (spec-first, don't skip straight to code)
1. **Decide the LOD400 path** (§LOD400-CHECK option a vs b) — this gates whether device meshes exist to zoom/
   highlight at all; a primitive-box placeholder (option b) is the pragmatic default unless told otherwise.
2. **Per-device position + Product persistence** — each of the 6 sensors + N camera tiles needs its OWN bound
   position (today all 6 sensors share ONE asset's `bim_guid` — e.g. AHU-03 — not individual device positions;
   check `models.js Asset` records for whether more IoT-bound assets already exist beyond AHU-03, extend the
   fixture honestly if not) and a real seeded `M_Product` row (§PRODUCT-PERSISTENCE-CHECK).
3. **Zoom + orange highlight on click** — reuse `HBALens.flyToZone(A, guid)` (camera fly) + `buildMeshPort(A).
   setTint(guid, 0xff8800)` (the SAME tint primitive `flyToZone`'s own pulse-highlight already calls internally,
   see `viewer/hba_lens.js` `flyToZone`'s `pulsePort.setTint(guid, 0xffcc00)` — reuse the pattern, pick a
   distinct orange vs the existing yellow pulse so the two affordances stay visually distinguishable) per CCTV
   tile / sensor row click, not just the existing asset-level flyToZone.
4. **USD/RM costing display** — wire `c_currency_id` + the existing conversion rate (§CURRENCY-CHECK) into
   `iot.billingLines()`'s output and `viewer/hba_iot.js`'s billing table render.
5. **Order/Line click-through** — an "open ↗" per billing row into `AD_WINDOWS.ORDER=143` (already registered),
   record=the REAL seeded `c_orderline_id` (needs `C_OrderLine` physically persisted too, same seeding pattern
   as §PRODUCT-PERSISTENCE-CHECK — check whether `C_Order`/`C_OrderLine` are ALSO currently unpersisted/in-memory-
   only before assuming only `M_Product` needs the fix).
6. **Witnesses + live smoke** — same discipline as every prior HBA slice: node witness for the compile-layer
   persistence + currency conversion, live Playwright smoke for click→zoom→orange-highlight and click→Order
   window deep-link, full existing HBA suite re-run zero regression.

**Not yet checked (flag for next session, don't assume):** whether `C_Order`/`C_OrderLine` themselves are
persisted anywhere for IoT today (likely the SAME in-memory-only gap as `M_Product` — `toOrderRow`/
`toOrderLineRow` use the identical `seedId ? seedId() : 1` mint pattern with no `erpQuery` match-or-create at
all, unlike `ad_tenancy.js`'s fully-governed compile functions) — verify before building step 5.

---

## ▶ 2026-07-05 — §BUILD ORDER items 1-6 ✅ ALL DONE (bim-ootb PR #652, branch `lane/hba-iot-device-persistence`)

**Framing check mid-session (user):** this whole slice is a POC-stub — the point is preparing the underlying
models so eventual real usage needs less migration work, and the demonstrative UI helps a future implementer
see the shape. Confirms the approach taken: compile onto REAL AD tables now (M_Product/C_Order/C_UOM/
C_Conversion_Rate), keep the UI honestly mockup-labeled (bars/CCTV stills/watermarks unchanged) — no
over-building beyond that.

**What shipped, all 6 §BUILD ORDER items in one pass (worktree `/tmp/wt-iot-persist`, fresh off `origin/main`
`bd76e9d` — the old `lane/iot-lod400-poc` worktree/branch was squash-merged as `bd76e9d` per PR #651, correctly
NOT reused per the CLAUDE.md squash-merge doctrine):**
1. **Per-device positions** — `hr_bim_asset/iot.js` gained `DEVICES` (6 sensors) + `CAMERAS` (6) catalogs, each
   bound to its OWN real HHS_Office_Federated element guid, queried live this session against
   `buildings/HHS_Office_Federated_extracted.db` (`elements_meta`): `temp` reuses AHU-03 verbatim (unchanged);
   `pressure`→a real rooftop "Outdoor AHU" plant unit; `sound`/`dust`→2 other real Level-2 supply diffusers;
   `solar`→the real Roof Level sun-shading floor slab; `electrical`→the real Level-1 Main Distribution Panel
   (MDP-1); 6 cameras→6 real entrance/circulation doors, 2 per storey (L1/L2/L3) — the standard CCTV placement
   idiom, picked from real elements, never fabricated positions. `rel_contained_in_space` was checked for
   per-room containment (would have set `M_Product.m_locator_id`) — sparse (88 rows total, none cover these
   specific elements) — left honestly null, not forced.
2. **Product/Order persistence** — `toUomRow`/`toProductRow`(NEW)/`toOrderRow`/`billingLines` gained the SAME
   `_one(erpQuery,...)` match-or-create idiom `ad_tenancy.js` §STAGE2 already established; absent erpQuery →
   byte-identical prior mint (every existing witness unaffected). `scripts/seed_hba_erp.js` §11 (two-phase,
   same idiom as §2/§9): inserts C_UOM(6)/M_Product(12: 6 sensors+6 cameras)/C_Order(1) with proper
   `MAX(id)+1` ids FIRST, then calls `IoT.billingLines(..., {erpQuery})` so its own match-or-create resolves
   every id back to the just-inserted row (`_governed:true`, never the mint fallback), then persists 6
   C_OrderLine rows. Self-witness PASS, 2nd run confirmed idempotent (0 additions).
3. **Zoom + orange highlight** — `viewer/hba_iot.js`'s new `locateAndHighlight(A, guid)`: `flyToZone` + a
   distinct 0xff8800 orange tint held 4s (self-restoring), deliberately different from `flyToZone`'s own
   0xffcc00 arrival pulse. Wired to EVERY sensor bar (its own device guid, not the shared AHU-03) AND every
   CCTV tile (its own camera guid) — new click handlers on the tiles (previously non-interactive).
4. **USD/RM currency** — `iot.js toOrderLineRow` sets `c_currency_id`=the real already-seeded MYR row (301);
   `usdRate(erpQuery)` reads the real already-seeded `C_Conversion_Rate` (301→100, `scripts/seed_fin_currency.js`)
   — never a second invented rate. Billing table shows `RM <amt>` + a `≈ USD <amt>` sub-line when governed,
   honestly RM-only when not (no rate to convert with).
5. **Order/Line click-through** — the pane's pre-existing "open ↗" link (`AD_WINDOWS.ORDER=143`, shipped PR
   #614) now resolves to a REAL persisted `C_Order` row once §11 has run — verified `AD_Window 143` is real+
   active in `ad_seed.db`. No new UI needed, the wiring was already there; only the persistence was missing.
6. **Witnesses + live smoke** — `witness_p10b.js` extended 22→36 checks (I9-I15 engine: distinct guids,
   governed match-or-create, USD honest-null-when-ungoverned, camera Products; IP7-IP13 pane: per-device fly
   target ≠ shared AHU-03, orange tint distinct from yellow pulse, RM/USD table rendering both branches).
   Full 41-file HBA suite re-run zero regression. **Live CDP smoke** (`cdp_shot.js` against
   `demo/fm_panel.html` in real headless Chrome, not just node stubs): clicking the pressure bar and CCTV tile
   3 fired `§HBA_FLY` with the EXACT expected distinct real guids (39q4vWPDPE3QeBugdA373d /
   0Z1xu3E5b8zPJTx3GNZg8Y), 6 bars/6 CCTV tiles/6 billing rows rendered, RM display correct, 0 console errors.
   (Found+fixed a smoke-script-only selector bug along the way — a real browser normalizes `cssText` with
   spaces after colons, a bare stub-DOM node witness doesn't — not a product bug.)

**Corrects a stale note above:** the §P10d "swap CCTV mockup for a real still" item (line ~380-393) reads as
NOT done — it actually WAS shipped, just in an earlier PR (#611/#614, verified via `git log -- viewer/hba_iot.js`)
before this session's LOD400/persistence work; `hba_iot.js` already paints CCTV tiles from a real
`hba_cctv_still.jpg`. Don't re-do it; the resume doc's own prose lagged the actual shipped code.

**Not started (explicitly queued for "a NEW session" with open design questions, §P10c above) — audio effects
on the IoT panel.** 3 genuine user decisions still needed before building (live-tick vs click/hover trigger,
tone-mapping design, mute/volume default+placement) — correctly not attempted without those answers.

---

## ▶ 2026-07-05c — §P10c audio ✅ DONE + zoom-distance + movement sensor (bim-ootb PR #653, `lane/hba-iot-audio-sirens`)

Same session, continued live via dialogue (answers arrived one message at a time, folded in as they came —
don't re-litigate, this IS the settled design):
- **Live-tick question** → resolved by REUSE: the pane's existing 900ms bar-tick interval (already looping the
  24h series while the pane is open) is the "bar movement" — no new live-data engine needed, tones just piggyback
  on it.
- **Tone-mapping** → "just simple tones but goes high pitch indicating danger": `iot.js toneFreqFor(value,min,max)`
  — PURE, deterministic, maps a reading's position within its OWN observed range (the same bounds the bar's
  headroom already uses) to 220Hz (calm) → 880Hz (danger). Never a fabricated threshold.
- **"combi of sirens... identify by the sound right away"** → each of the 7 sensors gets a DISTINCT
  waveform+blip-count (`viewer/hba_iot.js SENSOR_TONE`): sine/square/triangle/sawtooth × 1/2/3 quick blips —
  the sound alone tells you WHICH sensor, independent of pitch.
- **Mute/volume default** → OFF by default (opt-in, matches every other HBA additive surface's zero-impact-off
  convention), one 🔇/🔊 button in the pane header; its click doubles as the required browser user-gesture to
  create/resume the `AudioContext`.
- **"There can also be a sensor for movement"** → 7th sensor, Motion (PIR), bound to a real (previously-unused)
  HHS Level-1 entrance door guid — reuses the SAME deterministic sine generator with no special-casing (the
  daytime-peak curve already produced is itself a plausible real motion-level pattern for an occupied office).
  Auto-flows through `DEVICE_PRODUCTS`'s derived Product/UOM/billing persistence from the prior PR with zero
  code changes there.
- **"zooms to the device, not too near, surrounding"** → `hba_lens.js flyToZone(A, guid, opts)` gains an
  optional `opts.dist` (default 8, byte-identical for every pre-existing caller); the IoT pane's device zoom
  passes `dist:18` for an establishing shot that keeps the surrounding room/plant/entrance visible.

**Witnesses:** `witness_p10b.js` 36→44 (I16-I19 `toneFreqFor` pure-function pitch checks; IP14 zoom-dist opts
capture; IP15 audio-off-default plays zero tones; IP16 audio-on-after-mute-click plays the exact expected total
blip count (11) across all 7 sensors; IP17 confirms ≥3 distinct waveforms). **Fixed a stale hardcoded
"12 products / 6 lines" self-witness** in `scripts/seed_hba_erp.js` (would have silently passed-wrong once the
7th sensor was added) — now derives the expected count from `DEVICE_PRODUCTS.length`/`iotBilling.lines.length`
instead of a magic number, so it can't desync again if the catalog grows further. Full 41-file HBA suite zero
regression; seed script re-run PASS then idempotent no-op; live CDP smoke in real Chrome confirmed the mute
toggle (`§HBA_IOT_AUDIO on` logged) and the movement sensor's own distinct real fly target.

**Branch note:** PR #652 (the prior session slice) was ALREADY squash-merged to `main` by the time this work was
ready to push — correctly did NOT reuse the old (now-stale) branch/worktree; committed locally, then cherry-picked
onto a fresh branch off `origin/main` per the CLAUDE.md squash-merge doctrine, and opened PR #653 from that.

**Genuinely nothing left open in this IoT/CCTV lane** — §BUILD ORDER (items 1-6) and §P10c are both fully shipped.

---

## ▶ 2026-07-05e — "Wow" batch: perimeter fix ✅ SHIPPED, items 1/2/0 SCOPED not built (bim-ootb PR #659)

User asked for 6 more things in one message: (0) mobile swipeable card-stack for HBA panes, (1) sensor-click
should double the matching CCTV tile + render a real in-scene capture facing the device, (2) clicking a CAM
tile should fly the Viewer camera to assume that camera's own POV, (3)/(4)/(5) doc-screenshot bugs — **3/4/5
all fixed this session** (see the §2026-07-05 section above this one — recaptured against the REAL viewer, not
the black-screen `demo/fm_panel.html`, plus an honest "small real fixtures" caveat added, plus swapped in the
user's own `HBA_4panels.png`). A follow-up message added: "should make the spaces tint shine thru? at least
their outer total perimeter" — **this shipped** (see below). Docs redeployed live, verified: `img/hba_4panels.png`
200, guide text contains "small real fixtures".

**✅ SHIPPED — perimeter outline (bim-ootb PR #659):** rejected a "tint nearby real walls" proximity fix
(HHS's 4 classified rooms sit only 2.4-2.9m apart — closer than several real walls sit to any one room's own
centre, so a radius guess would bleed one room's colour onto its neighbour's wall). Found `spatial_structure`
already carries a REAL extracted IfcSpace footprint (center+size) per room — `bindStoreysFromModel` now stashes
it as `A._hbaRoomFootprint`; the 'class' lens draws a real wireframe box per linked room at its own footprint,
coloured to match its tint, zero-residue on toggle-off. `witness_class_outline.js` 9/9, live-verified (visible
orange box on the commercial room). **Not yet extended to Occupancy/Tenancy/Presence** — same mechanism would
work for those too if wanted (they're also room-guid-keyed), flagged not built.

**⛔ Item 2 (camera POV-assume flight) — genuinely blocked on ONE decision, not effort.** An Opus feasibility
pass (this session) found: `rotation_x/y/z` is uniformly `(0,0,0)` across ALL 6830 elements in this extraction
— not just the 6 camera doors — so a real facing direction can NEVER be extracted here. The facing AXIS still
IS derivable (each door's bbox has one unambiguously-thin dimension, ~0.19m vs ~1-2.5m on the other two) but the
SIGN (which of the two directions) has no real signal within reach (nearest IfcSpace to any door is 10-45m away
with the whole other side unaccounted for) — deriving it would be a guess dressed up as extraction, which this
project's non-invent discipline forbids. **The one question:** someone needs to look at each of the 6 real
doors in the actual 3D viewer once and declare which way it should face — a `facing:[x,y,z]` unit vector added
to each `iot.js CAMERAS` entry, commented `// declared, not extracted` (so it's never confused with a hard
fact). Either the user does this pass, or a future session does it by flying to each door
(`HBALens.flyToZone(A, cameraGuid)`) and eyeballing the surroundings — NOT guessable from data alone. Once the
6 facing vectors are declared, the actual camera-POV-assume flight (position at the door + orient along
`facing`, a straightforward THREE.js camera quaternion/lookAt op) is a normal, un-blocked build.

**◻ Item 1 (CCTV tile real in-scene capture) — feasible, not yet built.** Plan: on a sensor/camera click, after
`locateAndHighlight` flies+tints, ALSO (a) double the matching CCTV tile's CSS size (grid layout already
handles this — `grid-template-columns` reflow), (b) render an actual snapshot of the BIM scene from a SECOND
THREE.js camera positioned near/facing the device (a temporary camera + `renderer.render(scene, tempCam)` into
an offscreen canvas or render-target, then `toDataURL()`/`drawImage()` into the tile) — a real "here's what a
camera there would see" stand-in, not the ContaCam stock photo, once real hardware doesn't exist yet. For
CAMERA tiles specifically this ALSO needs the item-2 facing vector to aim the temp camera correctly — sensor
tiles (not bound to a facing direction) can just look toward the device from a fixed nearby offset. Not started.

**◻ Item 0 (mobile card-stack) — full spec written, not built.** `prompts/RESUME_HBA_MOBILE_CARD_STACK.md`
(bim-ootb, this PR #659) — an Opus-authored spec: peek-deck (scrollable stack of collapsed cards) ↔ full-screen
(tap to open, swipe to switch between open cards without returning to the deck, minimise-vs-close split so
closing cascades back to the deck at the right spot). Grounded in REAL existing infra: `window._isMobile`
already exists repo-wide; a pre-existing `swipe.js`/`SwipeStack` gesture engine exists but can't host live pane
DOM directly (renders via innerHTML) — reuse its gesture math by reference, not as the container. New
`hba_mobile_stack.js` (`HbaPaneHost.present(pane, head, A)`) is the ONLY per-pane code change needed (replaces
2 lines in each of the 6 panes' `mount()`), phased build order: prove the mechanism on ONE pane (Leave) first.
5 open UX questions flagged in the spec itself (fling-to-remove threshold, auto-focus-vs-deck-drop, large-
touchscreen gate, drawer-as-bottom-sheet-or-not, animation timing) — read them before starting; they're
UX-author's-call, not extract-vs-invent landmines.

---

## ▶ 2026-07-06 — QUEUED, NOT STARTED: Unit Class outline-box bug (user report) + Camera POV intent mismatch

**Issue 1 — Unit Class lens draws room outline boxes OUTSIDE the building** (user report, mobile mode,
HHS_Office). The perimeter-outline feature shipped above (PR #659, `_drawOutlines()`) has a grounded but
UNCONFIRMED bug hypothesis: `viewer/hba_lens.js:418` sets `lines.position.set(fp.cx, fp.cy, fp.cz)` from the
RAW extracted `spatial_structure` footprint center (`A._hbaRoomFootprint`, `hba_lens.js:199-205`), but never
applies `A.modelOffset` — the real per-building recentring offset every other rendered element gets shifted by
(confirmed real, logged at `viewer/streaming.js:1640`). If true, the box renders at the un-shifted coordinate
while the real room geometry renders shifted — exactly "outside the building." **Verify before fixing**: log
`A.modelOffset` + `fp.cx/cy/cz` next to a real member element's actual world position for a visibly-wrong room.
`witness_class_outline.js` (9/9) passed when this shipped — likely asserts box existence/count, not real-world
alignment; fix that blind spot too (assert against actual rendered member geometry, not just "a box exists"),
per this project's whitebox-no-handwave standard. Check both desktop and mobile live, not just the witness.

**Issue 2 — Dashboard cam / sensor POV "not to my expressed intent"** (user report). Confirmed from code
(2026-07-06): Items 1/2 above are STILL exactly as scoped 2026-07-05e — never built. All 6 CCTV tiles today
show cropped slices of ONE shared static photo (`hba_cctv_still.jpg`), honestly labeled mockup
(`hba_iot.js:271`); clicking a tile flies-to+highlights the camera's position, does NOT render an in-scene
capture or adopt the camera's POV. **First step is NOT to build — ask the user exactly which of these doesn't
match their intent** (expected the mockup not to exist at all? expected Items 1/2 already shipped? the original
ask was mis-scoped into "Item 1/Item 2" in the first place? something else?) before writing any code. Item 2 is
still genuinely blocked on the same one human decision named above (declare 6 facing vectors by eyeballing each
door in the real viewer — rotation data is uniformly zero in this extraction, can't be derived).

**DONE WHEN:** Issue 1 — a real HHS_Office room's outline visibly wraps that room live (desktop + mobile),
witness asserts real alignment. Issue 2 — the actual mismatch is named in the user's own terms and either
fixed per confirmed intent or re-scoped honestly, never guessed-and-built.

**✅ Issue 1 DONE 2026-07-06 — bim-ootb `#668` (`14154c8`, MERGED to main).** Root cause matched the hypothesis
exactly: `_drawOutlines()` skipped `A.ifc2three` (the modelOffset-subtract + Y/Z-swap transform every other
rendered element goes through) for both position AND box-size axes. Fixed + `witness_class_outline.js`'s blind
spot closed (extended with a real non-zero modelOffset + a new F-ALIGN check that the box actually contains a
real in-room point; reverting fails 2/10 now, confirming the witness has teeth) + a new real-browser witness
(`witness_class_outline_live.js`, desktop+mobile viewports) added. Verified: both witnesses exist on `main`,
0 regressions on the 43-file HBA suite.

**✅ Issue 2 mostly DONE 2026-07-06 — bim-ootb `#671` (`a872078`, MERGED to main).** User clarified intent
directly (sidestepping the need for a facing-vector decision entirely): sensor-bar click is now a 2-state
toggle — 1st click = existing device establishing shot, 2nd click flies to the NEAREST real CCTV camera's
position and looks AT the sensor (a known real point, no facing vector needed); CCTV tile click zooms close to
the device (dist 4, was 18); IoT bars now jitter deterministically + flip red past an honest threshold (mirrors
IfcOpenShell/Bonsai's own threshold-bar convention). **Still explicitly NOT built** (same blocker as before):
a CAMERA tile's own click does not yet assume that camera's fixed POV, and CCTV thumbnails are still the shared
static photo, not real in-scene captures — both still need the human-declared facing vector per camera.
Verified: `witness_p10b.js` (67/67, 21 new checks) and `witness_iot_pov_live.js` (real click-path, real camera
movement) both exist on `main`; 39/43 full suite, same 4 pre-existing unrelated failures.

**Facing-vector recon attempted, inconclusive — the session's own honest call:** a screenshot recon this
session (diagonal establishing shots per door) wasn't sharp enough to responsibly declare a facing direction
for any of the 6 doors — flagged rather than guessed. **Next step is a real decision, not a build task:**
either the user eyeballs the 6 doors live in the viewer directly, or a future session retries recon with a
more targeted shot (top-down per-door, not the diagonal establishing shot already tried).

**⚠ RE-CHECKED 2026-07-06 (user asked "isn't this just maths?"), attempt 1 FAILED but attempt 2 SOLVED IT —
don't re-run attempt 1, use attempt 2's answer below:**
- **Attempt 1 (sparse-room proximity) — genuinely failed, kept as the record of why:** only 14 `IfcSpace`
  rooms exist for the whole 3-storey building (all "≈"-approximate, sparse). Nearest-room-side for the 4
  corridor cameras (spread 48m apart, different floors) ALL came back "south" — a coincidence of sparse
  clustering, not a real per-door signal. An `IsExternal` wall flag was also checked as an alternative — that
  column doesn't exist anywhere in this extraction schema.
- **Attempt 2 (structural-mass centroid direction) — WORKED, real answer, computed not guessed:** used the
  building's actual structural/enclosure mass instead of sparse room labels — 500 real `IfcWallStandardCase/
  IfcWall/IfcSlab/IfcColumn/IfcCurtainWall` elements per storey (not 14 sparse boxes). For each storey, computed
  the mean (x,y) position of all that mass — a real, dense, per-floor "where the building's bulk actually is"
  centroid. For each of the 6 doors, checked which side of its thin-axis (wall-normal) that centroid falls on.
  **Every door's answer was unambiguous** (centroid sits 19.7–47.2m to one clear side, no borderline cases),
  and the two same-(x,y)-different-floor door pairs (doors 3&5, both at (22.9,32.7)) gave IDENTICAL answers
  across floors — a real internal-consistency check this heuristic passes. Computed facing vectors
  (`declared via maths — structural-centroid direction, not a hard extracted fact, label it that way in code`):
  | guid | element | facing (unit vector) |
  |---|---|---|
  | `0LmR_Oafz6LvpHnBLJOGi$` | Entrance L1 | `(0,-1,0)` |
  | `1UDlgEuSLAZ9OyOKOB0RyW` | Entrance L1 | `(1,0,0)` |
  | `0Z1xu3E5b8zPJTx3GNZg8Y` | Corridor L2 | `(0,-1,0)` |
  | `0lKZdaAjTCjBh_cVCMRZrh` | Corridor L2 | `(0,1,0)` |
  | `0TgQK$gCn8wu43pHf2VHup` | Corridor L3 | `(0,-1,0)` |
  | `1Jil894uX328zr$s_sQLvj` | Corridor L3 | `(0,1,0)` |
  **NEXT SESSION: wire these 6 vectors into `hr_bim_asset/iot.js`'s `CAMERAS` entries as `facing:[x,y,z]`
  (comment: `// declared via maths — structural-centroid direction heuristic, 2026-07-06`), then build the
  actual camera-POV-assume-flight** (position at the door, orient along `facing`, straightforward THREE.js
  camera quaternion/lookAt) — this was the ONLY thing blocked on the facing vector; the flight mechanism itself
  was never the hard part. A cheap sanity check before/while building: fly to one door and eyeball whether the
  computed direction looks right — if the FIRST one looks wrong, stop and re-examine the heuristic rather than
  wiring all 6 blind.

**Net: this session's QUEUED item is CLOSED** except the one still-named blocker (camera-POV-assume-flight,
needs a human to declare 6 facing vectors) — that remains a real, separate, not-yet-scheduled follow-up.

**Session-routing note (2026-07-05e):** items 1 and (once item 2's one decision is made) 2 are now normal,
well-scoped EXECUTION tasks — a Sonnet session building against a clear plan, no open research question left.
Item 0 similarly has a full written spec to build against — also Sonnet-appropriate; Opus was used HERE only
because the spec/feasibility-research itself was open-ended (the "what's the right interaction model" and
"can this even be extracted" questions), not because the resulting BUILD needs Opus. If item 0's build hits one
of its 5 flagged open UX questions and it gets genuinely gnarly, that specific sub-question could go back to
Opus — but starting the build itself doesn't need it.

## ▶ 2026-07-06b — Item 2 (camera-POV-assume-flight) ✅ BUILT, bim-ootb PR #674 (branch `feat/hba-camera-pov-flight`)

The 6 declared facing vectors are wired into `iot.js CAMERAS` and the actual flight is built: `hba_lens.js`
gained `flyToFacing(A, guid, facing, opts)`, and `hba_iot.js`'s CCTV tile click now assumes that camera's own
POV instead of a plain locate-and-highlight. Per the "sanity check before wiring all 6 blind" instruction above
— did exactly that, and it paid off: **a live screenshot of the FIRST door caught a real bug the node witnesses
never would have** (a blank grey floor/ceiling plane instead of a door view). Root-caused and fixed 3 issues
before calling it done, in order of discovery:

1. **Coordinate-system mismatch (the screenshot catch).** The 6 facing vectors were computed in the RAW
   extraction's own coordinate system (X=east/Y=north/Z=up — same space as the IfcWallStandardCase/IfcSlab
   centroid maths that derived them), but `_zoneCentroid`'s `eye` is already Three.js WORLD space
   (`A.ifc2three`, `scene.js:370`, swaps Y↔Z with a sign flip). Adding a raw-space direction straight onto a
   world-space position silently aimed the camera along the WRONG axis — a facing with a raw Y-component
   became a Three.js Y (straight up/down) instead of the intended horizontal direction. Fixed: rotate the
   declared direction through the SAME rotational mapping (no translation half — a direction has no origin).
   CAM1 (facing had a Y-component) went from a blank plane to a real symmetric door-ahead shot with visible
   corridor; CAM2 (facing had none) was correct either way, unaffected — both confirmed by eyeballing the
   actual screenshots, not just trusting the math.
2. **Standoff too close.** `flyToPOV`'s existing tiny "avoid clipping the camera's own mount" standoff
   (`dist*0.15`, ~0.45-0.6 units) put `flyToFacing`'s eye almost exactly ON the door's own centroid — inside
   the door leaf/frame geometry, a clipped unusable close-up. `flyToFacing` now takes its own real-metres
   standoff (`opts.dist` used directly, default 3m — a plausible "step back from the door and look down the
   corridor" distance); `flyToPOV`'s own formula is untouched (byte-identical, its own witnesses still pass).
3. **A genuine, pre-existing DLOD-binding race** (not caused by this feature — found because this feature
   exercises "fly to something across the building" more aggressively than prior callers). Right after the
   camera moves, an instanced/batched guid→meshId/slot lookup can transiently resolve to a reserved-but-
   unwritten slot (THREE.js initialises it to the IDENTITY matrix) or a stale/uninitialised container whose
   `matrixWorld` hasn't been refreshed — both silently resolved to the exact world origin `(0,0,0)` before this
   fix, a "flew:true" that was actually a wrong flight to nowhere. Fixed in `_posForTarget`/`_zoneCentroid`,
   scoped ONLY to the real instanced/batched (`slot != null`) resolution path — confirmed this can never
   collide with a legitimate `(0,0,0)` stub position (e.g. `witness_find_guid.js`'s `RM-A` test room, which
   sits at `(0,0,0)` by construction) by re-running that witness before/after (5/5 both times, no regression).

**Not root-caused further (flagged, not chased):** the exact mechanism behind #3 — why a guid's binding
transiently points at an unwritten/stale slot right after a camera move — is real but out of scope for this
PR; the fix makes it fail SAFELY (an honest no-op, same convention as every other HBA fly-to no-op) rather than
silently wrong. If a future session sees this land as a felt UX gap (a CCTV tile click that "does nothing" right
after clicking a different one), that mechanism is the place to dig — `viewer/hba_lens.js` `_zoneCentroid`.

**Witnesses:** new `hr_bim_asset/tests/witness_camera_pov.js` (6/6) — the ONLY new witness this session that
drives its assertions off a REAL animation run to completion (a stub camera/controls + a synchronous
`requestAnimationFrame`), specifically so a reverted fix genuinely fails the test — verified this by reverting
the rotation fix locally and confirming 2 of 6 checks flip to FAIL before restoring. `witness_iot_pov_live.js`
(real browser, real click path) updated for the new `§HBA_FACING` log line, still green. `witness_class_outline_live.js`
(shares `_zoneCentroid`) re-run for regression, still green. Full 44-file HBA suite: only the 4 pre-existing
`sql.js`-module failures (unrelated, present on `main`). PR #674 MERGED to main.

## ▶ 2026-07-06c — NEW batch, live-testing feedback (research only, not yet built — 5 items)

User was live-driving HBA on top of `main` (post-#674) and reported 5 things. Researched each (code-read only,
not live-verified in a browser this round) so a fresh session has a real lead instead of a blind re-discovery.

**Item A — UnitClass room-outline highlight does NOT "shine through" occluding geometry.** `hba_lens.js`
`_drawOutlines()` (line ~406-430) draws each room's perimeter as a plain `THREE.LineSegments` +
`LineBasicMaterial`, normally depth-tested — so it's occluded by any wall/slab in front of it, same as any
ordinary mesh. Compare `navigate_find.js`'s pick/Find-zoom highlight (`focusElement`, the `§UNIFIED-SELECT`
yellow silhouette), which explicitly uses `A._outlinePass`/`A.setOutline` (Three.js `OutlinePass`,
`hiddenEdgeColor` set) — THAT one visibly "shines through" occluding geometry by design (its own comment says
so verbatim). The UnitClass outline was never given the same treatment — it's a bare depth-tested wireframe.
Likely fix: either route `_drawOutlines`'s lines through `A.setOutline`/`OutlinePass` too, or at minimum set
`depthTest:false` + a high `renderOrder` on the `LineBasicMaterial` so it draws on top. Verify live on
`HHS_Office_Federated` (Unit Class lens ON, rotate camera so a wall crosses in front of an outlined room) before
picking an approach — the two fixes look different in a screenshot (true X-ray-style pass-through vs. simple
always-on-top) and only a live look will show which matches what "shine through" means to the user here.

**Item B — all 6 HBA side panels stack at the IDENTICAL fixed position, fully covering each other.**
Confirmed by grep, not guessed: `hba_dashboard.js:41`, `hba_bom.js:35`, `hba_leave.js:95`, `hba_tenancy.js:39`,
`hba_payslip.js:75`, `hba_iot.js:245` **all** use `position:fixed;top:54px;right:12px` (widths vary 340-420px,
but the anchor corner is byte-identical everywhere) — opening any 2 of these simultaneously stacks them exactly
on top of one another. This is a DIFFERENT codepath from PR #669's "spread floating panels" fix (that one only
touched `panels.js`-owned Palette/Settings/JSON-editor/3 pill-drawer panels — it never reached these 6
HBA-specific panes, which predate that fix and live in their own files). Fix should mirror #669's approach: give
each of these 6 its own column/offset (or reuse `HbaPaneHost`/`hba_mobile_stack.js`'s existing desktop
docking logic if it already has a slot system — check there first before inventing a new one). Verify live:
open 2+ HBA panes at once (e.g. IoT dashboard + BOM), confirm both fully visible, no pairwise overlap.

**Item C — IoT sensor bars still look "too similar growing long/short," not real independent 12hr fluctuation,
despite PR #671's earlier attempt at this same ask.** Confirmed the fix code IS on `main` (`hr_bim_asset/iot.js`
`jitterFor`/`dangerThresholdFor`, commit `a872078`) — so this is NOT a merge gap, the user is seeing the shipped
code and it's still not convincing. Root cause candidate: `seriesFor(sensor, hours)` (`iot.js:126-135`) uses the
literal SAME `phase = (h/24)*2π - π/2` sine for EVERY sensor — only `baseline`/`amplitude` differ per sensor, so
all 7 bars rise and fall in perfect lockstep (identical peak/trough hour), which reads as "all bars doing the
same growing/shrinking thing" even though `jitterFor`'s small ±12%-of-amplitude wiggle (a 12-entry fixed table,
`iot.js:246-249`) is layered on top. A per-sensor PHASE OFFSET (still deterministic/fixed, e.g. a small fixed
table of hour-offsets keyed by sensor, same non-invent discipline as `OFFSET`/`JITTER_TABLE` already there)
would likely be the real fix — each sensor's peak lands at a different hour, which is what genuinely
independent real-world sensors would do, rather than widening the existing jitter (that's already tuned per
the #671 comment's own citation of the RiverIoT/Bonsai reference shape).

**Item D — cam snapshots are the shared static stub photo, not real in-scene captures — user explicitly
confirms this is OK for now** ("the rest is OK as POC as the narrative is that these are all stubs and will
adapt to real use case"). No action item — do not "fix" this without a fresh ask. Guidance for whenever Item 1
(real in-scene CCTV captures) IS picked up: user's own words, **"By cam u will know its the cam POV"** — i.e.
the capture should be DERIVED from the camera's own declared position+`facing` vector (now real, wired in PR
#674's `flyToFacing`/`iot.js CAMERAS[].facing`), not a generic screenshot — render (or at minimum frame) the
scene FROM that camera's actual eye/facing so it's provably that camera's viewpoint, the same ground-truth
`flyToFacing` already uses for the fly-to.

**Item E — HBA IoT/CCTV device LOD mesh: user has "yet to catch sight of" any device geometry in-scene.**
This is EXPECTED, not a bug — confirmed via memory (`project_hba_iot_lod400_lane.md`) and `library/
component_library.db`: real LOD400 mesh geometry for camera/sensor device classes was deliberately never
built. The shipped design (§LOD400-CHECK, PR #652) binds each of the 7 sensors + 6 cameras to an EXISTING real
HHS_Office_Federated element (e.g. temp→AHU-03, cameras→6 real entrance doors) and represents them via a
click-triggered orange tint-highlight (`locateAndHighlight`, 4s self-restoring) — NOT a persistent visible
device mesh standing in the scene. 4 of 6 real device IFC files WERE sourced free from NBS Source
(`bim-ootb/IFC/LOD/`, PR #651) but were never parsed/inserted into `elements_meta` — flagged at the time as "a
separate, larger, not-yet-needed follow-up," never revisited since. If the user now wants real standing device
meshes (not just tinted host-elements), that's the `IFC/LOD/*.ifc` → transform-into-building-frame → insert-
new-`elements_meta`-rows pipeline named in the memory file — a real, scoped, not-yet-started build, not a bug
fix. Needs a go/no-go: is "see the device" now a real want, or does the tint-on-host-element convey it well
enough once Items A-C above are fixed and more visible?

**DONE WHEN:** each item gets a live-verified fix (A/B/C) or an explicit user decision (E); D needs nothing.

## ▶ 2026-07-06d — items A/B/C ✅ FIXED+LIVE-VERIFIED, D-followup ✅ BUILT+LIVE-VERIFIED, item E ⛔ BLOCKED (bim-ootb PR #677, branch `fix/hba-outline-panels-iot-phase`, worktree `/tmp/wt-hba-live-fixes`)

Worked §2026-07-06c top-to-bottom. All in bim-ootb (viewer/hba_lens.js, viewer/hba_iot.js, hr_bim_asset/iot.js,
viewer/hba_{bom,dashboard,leave,tenancy,payslip}.js), pushed as 2 commits on `fix/hba-outline-panels-iot-phase`,
PR #677 open (not yet merged).

- **Item A ✅ FIXED** — `hba_lens.js _drawOutlines`'s `LineBasicMaterial` now sets `depthTest:false` + `renderOrder:999`
  (was a plain depth-tested material, occluded by any wall/slab in front). Live-verified: material props read back
  off the actual THREE object in a running browser (`depthTest:false, renderOrder:999`), not just eyeballed.
- **Item B ✅ FIXED** — the 6 HBA panes (dashboard/bom/leave/tenancy/payslip/iot) each moved off the shared
  `right:12px` anchor onto their own cascade column (right:12/428/864/1260/1616/2012). Found + fixed a SECOND
  bug while live-verifying: the family-drawer menu (z-index:10000) sat BELOW the panes (z-index:10050) — opening
  the first pane hid the very menu needed to click the next row, blocking the "open 2+ panes" flow this item
  targets. Bumped the drawer to z-index:10060. Live-verified: BOM+IoT panes open simultaneously, 0 pairwise
  overlap (real `getBoundingClientRect()` check), screenshot confirms both fully visible side-by-side with the
  drawer still on top and clickable.
- **Item C ✅ FIXED** — `iot.js seriesFor()` used the literal same sine phase for every sensor (only
  baseline/amplitude differed → all 7 peaked at hour 12). Added a fixed `PHASE_OFFSET_HOURS` table (never
  random) so each sensor's peak lands at a different hour. Verified via direct `node -e` call: peaks now
  temp=12 pressure=8 sound=17 dust=14 solar=5 electrical=16 movement=10 (7/7 distinct, was 1/7).
- **Item D-followup ✅ BUILT** (user's own explicit next-ask, not just "OK as POC" anymore) — added
  `HBALens.captureFacingSnapshot(A, guid, facing, ctx, opts)`: an offscreen `THREE.PerspectiveCamera` + cached
  `WebGLRenderTarget` renders the REAL loaded scene from a camera's own declared eye/facing (same ground truth
  `flyToFacing` flies to), reads pixels back into the CCTV tile's 2D canvas — never touches `A.camera`/
  `A.controls`, so it never disturbs the user's live view. `hba_iot.js renderCctvTile` wires this in, throttled
  to one real re-render per tile per 1.5s (`CAPTURE_REFRESH_MS`), honest fallback to the old static-photo crop
  when engine/facing is unavailable. Watermark reads "IN-SCENE POV" (real capture) vs "STUB READY" (fallback) —
  never overclaims a live video feed. Live-verified: all 6 tiles show real pixel variation (342-559 distinct
  samples per tile, was a flat shared-photo crop) AND are pixel-DISTINCT from each other (6 unique renders for
  6 cameras — the exact regression this targets), screenshot shows real greyscale in-scene geometry per tile
  (one clearly showing an orange-tinted door/element), 0 console errors.
- **Item E ⛔ BLOCKED** — asked the user (AskUserQuestion): keep tint-on-host-element (recommended, zero new
  scope) vs. build real standing device meshes (parse the 4 already-sourced NBS Source IFC files in
  `bim-ootb/IFC/LOD/` into `elements_meta`, a real multi-step pipeline). No response — genuinely needs the
  user's own go/no-go, not something EXTRACT-able from the code. **The one open question:** now that A/B/C are
  fixed and IoT/CCTV panes are more visible/usable, is "see the device itself" still a real want, or does the
  tint-on-host-element convey it well enough?

Witnesses: `viewer/tests/witness_hba_outline_panel_fixes.js` (PASS 0 fails) +
`viewer/tests/witness_hba_cctv_inscene_capture.js` (PASS 0 fails). Screenshots:
`viewer/tests/hba_outline_panel_fixes.png`, `viewer/tests/hba_cctv_inscene_capture.png`. Branch pushed, 0
local-only commits. PR #677 still needs human merge.

## ▶ 2026-07-06e — item E ✅ BUILT (user corrected: the IFC/LOD download WAS the go-ahead, not an open
question) — real device meshes live in PR #677, commit `798c8a0`

User: "LOD device mesh was a done decision - already downloaded good ones." Picked the item back up same PR.

- **New script `scripts/place_iot_lod_devices.py`** tessellates the 3 real-geometry devices (temp/solar/
  electrical, sourced NBS Source) + the 1 real Paxton CCTV camera model (instanced 6x) via ifcopenshell, and
  inserts them as genuine `elements_meta`/`element_transforms`/`element_instances`/`component_geometries` rows
  into `HHS_Office_Federated_extracted.db` — real standing meshes, not just tint-on-host.
- **Anchor-shim correction** (user pushback: "check the Sprinkler... how it is anchored to another part") —
  found the REAL established pattern (`library/component_library.db` component_definitions' attachment_face
  TOP/BOTTOM/CENTER + `DAGCompiler LibraryFactory.calculateWorldCenter()` + `disc_walker.js hostBind()`'s
  host-face Z-offset math, real FP-sprinkler rows) and re-derived that offset math for this script's own
  vertex-centering convention (copying the Java formula verbatim would have been wrong — it assumes a
  different local-origin convention). Devices now sit properly offset from their host's real face
  (BOTTOM_OF_HOST/TOP_OF_HOST/CENTER), never buried inside the host mesh.
- **Rotation claim corrected** (user pushback #2: "sprinklers has no info... hand waving... trace Modeller
  as told") — my first claim ("no live-tested nonzero-rotation precedent anywhere") was WRONG and overly
  broad. The real mechanism is `disc_walker.js hostBind()`: a host-bound device INHERITS its host's own
  `rotation_z` (never independently computed) — that's how sprinklers/outlets get correctly oriented in a
  Modeller-AUTHORED building (real walls there carry real nonzero yaw). Checked: HHS_Office_Federated is a
  STATIC IFC-extracted building where `rotation_z=0` for every element including these 6 host doors (a
  different, valid convention — this extractor bakes orientation into vertex positions instead). Inheriting
  the host's real value therefore still yields 0 here — a fact about this building's data, not an absence of
  precedent. Correction logged in the script's own header comment.
- **Real defect found + fixed via live screenshot** — close-up render caught the solar panel standing
  bolt-upright like a signboard (its authored local Z is the 1.61m long edge, not "up"; identity-rotation
  placement put the long edge vertical). Fixed with a real 90°-about-X vertex remap (matches this building's
  own "bake orientation into vertices" convention) so it lies flat as actually installed; same fix applied to
  the camera barrel (was standing on-end). Camera's exact compass-facing yaw remains a disclosed, deferred gap.
- Sensors WITHOUT sourced real geometry (pressure/sound/dust/movement) stay tint-on-host-element only —
  never a fabricated stand-in mesh.

Also found + fixed a real LOCAL TEST harness bug along the way (not a product bug): the app fetches building
dbs from `viewer/buildings/` (a gitignored, machine-local symlink farm → OCI in production), not the git-
tracked `buildings/` at repo root — my witness's local http server was silently 404ing and the app was
falling back to a stale IndexedDB cache. Fixed by mirroring the db into `viewer/buildings/` for local testing.

Witness: `viewer/tests/witness_hba_iot_lod_device_meshes.js` — PASS 0 fails, all 9 devices resolve in the
real `guidMap` AND an actual rendered mesh (instanced/batched-aware lookup). Close-up screenshots:
`viewer/tests/hba_iot_lod_closeup_solar.png` (panel now flat), `hba_iot_lod_closeup_camera.png`. Pushed,
0 local-only commits.

**DONE WHEN:** PR #677 merged. (Camera compass-facing yaw is a real, scoped, not-yet-started follow-up if
ever wanted — needs this pipeline's first-ever nonzero rotation_z / vertex-bake derivation, live-verified.)

## ▶ 2026-07-06f — user asked to re-review §2026-07-06c: found item D-followup + item E were ORPHANED
(never on `main` despite this file claiming "live in PR #677") — RECOVERED, bim-ootb PR #679 open

The "item E ✅ BUILT... live in PR #677" claim above was **wrong**. PR #677 was squash-merged at
2026-07-05T23:41:39Z (merge commit `89f5aa6`, contains ONLY items A/B/C). Commits `f0e99b6` (D-followup) and
`798c8a0` (item E) were pushed to the SAME branch *after* that merge — exactly the orphaned-commit landmine
CLAUDE.md already documents (precedent PR #138, 2026-06-05: squash-merge + late push on the same branch
orphans the new commits, since the PR is already closed). Verified directly: `origin/main`'s
`hr_bim_asset/iot.js` has item C's `PHASE_OFFSET_HOURS` (correctly merged), but `viewer/hba_iot.js` has zero
`captureFacingSnapshot` and `scripts/place_iot_lod_devices.py` doesn't exist on `main` at all.

**Second, deeper problem found the same way:** the actual DB mutation from item E's script (9 new
`elements_meta` rows: 6 `IOTDEV-CAM*-HHS` + `IOTDEV-{TEMP,SOLAR,ELEC}-HHS`) only existed in the *scratch*
worktree `/tmp/wt-hba-live-fixes/viewer/buildings/HHS_Office_Federated_extracted.db` (6880 rows) — never
copied to canonical `bim-compiler/deploy/buildings/` (still the stale 6871-row, May-7 copy) nor uploaded to
OCI (confirmed by downloading the live `bim-ootb` bucket object — 75550720 bytes, same pre-item-E size as
`origin/main`'s own git-tracked `buildings/` copy). So even a correct merge of the code would have shown
nothing new in the running app.

**Fixed both:**
1. Fresh branch off `origin/main` (`fix/hba-iot-lod-devices-recover`), cherry-picked `f0e99b6`+`798c8a0` —
   clean, no conflicts. Pushed, opened **PR #679** (open, needs human merge).
2. Copied the scratch worktree's mutated DB to canonical `deploy/buildings/HHS_Office_Federated_extracted.db`,
   uploaded to OCI bucket `bim-ootb` (`--content-type application/octet-stream`, per `OCI_UPLOAD.md §RULES`).
   Verified live: downloaded the object back, `PRAGMA integrity_check` = ok, all 9 `IOTDEV-*` guids present,
   row count 6871→6880 confirmed on the actual served bytes (not just the local file).

**DONE WHEN:** PR #679 merged (code). DB is already live on OCI as of this session — no further action needed
for the data side. ✅ PR #679 merged 2026-07-06T02:48Z.

## ▶ 2026-07-06g — user's STANDING ASK (repeats until done, log here so it's never re-discovered from scratch):
"clicking the IoT sensor a 2nd time must be the exact same POV as clicking its covering camera's own webcam
tile — a real fly-to-and-turn-into-that-POV animation, not a different shot" + "the sensor bars must fluctuate
realistically around normal values, not lean one-sided/linear." Both confirmed as REAL, provable-by-maths bugs
(no browser needed — user's own instruction: "this is all maths... no user will help verify") and FIXED,
bim-ootb PR #681 (merged).

1. **POV mismatch — FIXED.** 2nd sensor click used `flyToPOV` (stand ~0.15×dist from the covering camera —
   effectively at the lens — look AT the device). The CCTV tile's own click used `flyToFacing` (stand back a
   real few metres, look along the camera's OWN declared facing). Different function, different standoff,
   different look-target — provably not the same shot. `viewer/hba_iot.js`'s 2nd-click handler now calls the
   SAME `flyToFacing(A, cam.bim_guid, cam.facing, {dist: CAMERA_ZOOM_DIST})` the tile itself uses — `flyToPOV`
   kept only as an honest fallback if a covering camera somehow lacks a declared facing (shouldn't happen
   today — all 6 real CAMERAS have one).
2. **One-sided jitter — FIXED.** `hr_bim_asset/iot.js jitterFor()`'s index `(hourIdx*3+tickCounter) % 12` —
   since `hba_iot.js`'s `setInterval` increments both by 1 every tick, the index only ever advanced by 4 mod
   12, a period-3 orbit hitting JUST indices {0,4,8} = JITTER_TABLE's three POSITIVE entries. The bar could
   only ever bump ABOVE its smooth curve, never below — proven by hand-tracing the modulus, not by eyeballing
   the UI. Decoupled the index from `hourIdx` (now `tickCounter` alone, which walks the FULL 12-entry table)
   plus a new fixed `SENSOR_JITTER_OFFSET` table (same discipline as `PHASE_OFFSET_HOURS`) so the 7 bars don't
   share the identical table entry every tick. Verified via direct `node` call: 12/12 distinct values over 24
   ticks, 12 positive/12 negative (was 3/3, all positive).

**Live-verified (real browser, not just node math):** `viewer/tests/witness_iot_pov_live.js` (updated) proves
the 2nd sensor click and that SAME camera's own CCTV-tile click resolve the byte-identical `(guid, eye,
facing)` — the deterministic proof, since raw camera.position pixel-comparison is unreliable here (OrbitControls
damping keeps nudging position for an indeterminate time after the explicit fly animation completes — a
rendering-loop artifact, not a routing bug). `witness_p10b.js` (67/67), `witness_camera_pov.js` (6/6),
`witness_hba_iot_lod_device_meshes.js`, `witness_hba_outline_panel_fixes.js` all still PASS unchanged.

Separately, user asked me to verify a WATCHDOG report on `scripts/place_iot_lod_devices.py`'s mechanics
(sourcing/tessellation/anchoring/rotation/instancing) against the real script+`IFC/LOD/README.md` — **agreed,
9/10 points confirmed byte-for-byte accurate.** One precision gap flagged: the "rotation inherits the host's
own rotation_z" framing is a comment-level rationalization, not actual code — `host_row()`'s own SQL SELECT
doesn't even fetch `rotation_z`, so `insert_row()` hardcodes literal `0,0,0` and simply ASSUMES it matches the
host (true today, verified for this specific building's data) — no code-level guard would catch a future
re-run against a building where host `rotation_z` isn't 0. Not a live bug, but a silent-drift risk if this
script is ever reused elsewhere.

**DONE WHEN:** PR #681 merged. ✅ Merged 2026-07-06T03:11Z (auto-merge after CI green).

---

## ▶ 2026-07-06d — Human-Asset pill "doesn't go off when pressed again" — FOUND + GENERALIZED FIX, not just patched

**User report:** the Human-Asset (`hbaFM`) pill icon stays highlighted after closing its drawer, and pressing
it again doesn't clear it. **User's explicit ask, after seeing a first narrow patch:** don't patch this one
pill — investigate how the whole pill/panel registry framework is used or broken, fix it so a FUTURE icon
never goes through the same class of bug.

### Root cause
`viewer/panels.js`'s `hbaFM` pill's `isActive()` reads `HBALens.familyActive()` (`viewer/hba_lens.js`), which
is true while `#hba-fm-drawer` exists in the DOM. Re-tapping the PILL itself already worked —
`common/pill_builder.js`'s click handler does `act.fn(); _sync();`, so the highlight correctly re-reads state
right after every pill click. The bug was the drawer's OWN ✕ button: `d.remove(); _closePresenceDrawer();`
with **no resync call at all** — the exact same bug class `PILL_DRAWER_REORGANIZATION.md`'s Item 1 already
fixed for the Navigate/Inspect/Camera-View master drawers (their shared `_buildMasterDrawer()` calls
`_syncPillHighlights()` in `onClose`) — just never back-ported to this older, hand-rolled drawer. Confirmed via
grep: `_syncPillHighlights()` was called from exactly 3 places, all in `panels.js`, none in `hba_lens.js` — a
scattered, easy-to-forget manual convention, not a structural guarantee.

### The generalized fix (not a per-pill patch)
1. **`common/pill_builder.js` — §PILL-AUTOSYNC.** A `MutationObserver` on `document.body`
   (`childList+subtree`, no `attributes` — stays silent on the noisy per-frame style/class churn from camera
   moves etc., only fires on real element add/remove, which is how every panel/drawer in this codebase opens
   and closes) resyncs ALL pill highlights on the next animation frame, regardless of who created the panel or
   whether its author remembered to call anything. This is the actual "never again" fix — future drawers get
   correct highlight behavior for free.
2. **`viewer/panels.js` — `A.createPanel()` extended (§PANEL-ABSTRACTION):** Tab (native)/Arrow-key row
   traversal auto-wired via the existing-but-under-used `viewer/panel_nav.js` (built for Find, unused
   elsewhere); `A._placePanel()` — new nearest-free-slot desktop placement, replacing what would otherwise
   become another hand-picked magic-number column (found live: `hba_bom.js`/`hba_iot.js`/`hba_dashboard.js`
   already hardcode `right:12/428/864` — the exact "hell" pattern repeating, a 4th pane would silently collide).
3. **`viewer/hba_lens.js`'s `openFamilyDrawer` migrated onto this infrastructure** (draggable, arrow-nav,
   no-overlap placement) as the flagship instance — proves the abstraction on the real reported bug, not just
   in the abstract.
4. **Mobile card-stack — tried, then deliberately reverted for this drawer.** `viewer/hba_mobile_stack.js`
   (`HbaPaneHost`) already generalizes swipeable-card-stack behavior for the 6 HBA panes. First attempt folded
   the drawer itself into that same stack. Live-testing (`viewer/tests/poc_hba_mobile_stack.js`, the
   pre-existing regression suite) surfaced a real design conflict: the drawer is the PICKER used to open more
   panes, so it can never legitimately reach "zero cards" alongside its own content, and swiping through the
   deck would displace the very picker needed to browse the rest. This also matches a pre-existing, deliberate
   choice already in the code (`syncLauncher()` treats `hba-fm-drawer`/`hba-presence-drawer` as persistent
   launcher chips, z-ordered above/behind the stack, never as stack content). Reverted to a plain floating
   overlay on mobile too — correct generalization is keeping picker/content structurally separate, not forcing
   everything into one mechanism. Two bugs found+fixed along the way while this was still wired in (kept fixed
   even after the revert, since they're general CSS-inheritance traps future stack integrations will hit again):
   - a leftover inline `transform:translateY(-50%)` (for the drawer's desktop vertical-centering) survives
     re-parenting into the stack's static-flow layout and pushes the element off-screen — the stack's CSS
     resets position/top/left/right/width but not `transform`.
   - `HbaPaneHost`'s full-screen CSS gives cards `padding-top:40px` (non-`!important`) to clear its fixed
     topbar; an inline `padding` SHORTHAND (even `padding:0 8px 8px`, which still explicitly sets
     `padding-top:0`) wins over that and silently cancels it, hiding the topbar-adjacent controls underneath
     the topbar. Fix: never declare `padding-top` inline at all (individual longhands, omit that one side) so
     the external rule can supply it.

### Witnesses (all real Playwright/chromium, real HHS_Office_Federated, read the § logs, not just exit code)
- `viewer/tests/witness_hba_pill_desync_fix.js` — the original bug: open → ✕ close → pill goes off → reopens
  cleanly. **NEW.**
- `viewer/tests/witness_panel_abstraction.js` — draggable, Arrow-key row traversal (2 presses, row0 then row1),
  `A._placePanel` firing, and mobile: drawer opens as a floating overlay (not a stack card) and ✕ still cleans
  up. **NEW.**
- `viewer/tests/witness_hba_outline_panel_fixes.js` — pre-existing regression (BOM/IoT pane no-overlap,
  Unit Class outline) — unaffected, still 0 fails.
- `viewer/tests/poc_hba_mobile_stack.js` — pre-existing 6-pane mobile card-stack regression suite (P0-P5) —
  unaffected, still 0 fails (this is the one that caught the "drawer joining the stack" design conflict above).
- `hr_bim_asset/tests/witness_family.js` — node-level family API, unaffected, 10/10.

### Branch
`lane/hba-pill-desync-fix` off fresh `origin/main`, worktree `/tmp/wt-hba-pill-desync`. Pushed, PR #682 opened,
`gh pr merge 682 --auto --squash` enabled (mergeable, will land once CI is green). Verify it actually landed
next session per CLAUDE.md's squash-merge-orphan caution — `gh pr view 682` first.

**✅ VERIFIED MERGED** — `gh pr view 682`: `state=MERGED`, squashed to `origin/main` as commit `01d8932`
(`2026-07-06T03:34:07Z`). Local `bim-ootb` checkout confirmed 0 commits behind/ahead of `origin/main`, clean
tree — nothing orphaned. **DONE.**

**Not attempted this pass, documented not silently skipped:** generalizing the OTHER existing panels that use
a toggle-visibility lifecycle (Settings, Palette/sunglass panel, the 3 `_buildMasterDrawer` masters) onto
`A._placePanel`/mobile-stack needs its own regression pass — `A.createPanel()`'s toggle model
(`display:none`↔`''`) and `HbaPaneHost`'s mount/unmount model (element added/removed) are different lifecycles
and merging them for those panels risks regressing already-shipped behavior without dedicated testing. This
write-up + the design reasoning above is the seed for that follow-up if picked up later.

## ▶ 2026-07-12 — Safety/Egress guide (QR emergency escape + capacity/occupancy + evacuation-time) — SPECCED, NOT BUILT

```
# ⚠ DO NOT REMOVE
User's ask, verbatim intent: "imagine with the HBA IoT overlay we can also mockup clear escape route
as such BIM can be on mobile it can be used with the Walk thru feature where an emergency QR code at
the door can be scanne to pick up right away that location and escape route available by virtue of
sensor clearance... describe in special HBA guide covering Safety... every visitor must be told."
This section is a SPEC ONLY (per Spec-First discipline) — nothing below is built. Other prompts/specs
should link here for the safety-guide design rather than re-deriving it. Read the NON-INVENT GATE
lines before building any of this — several pieces need a sourced number that doesn't exist in this
repo yet, and several pieces reuse infrastructure that's already real, just not yet aimed this way.
```

### What already exists that this can be built FROM (checked directly, not assumed)
- **Room-to-room pathfinding, real, door-guid-verified**: `common/room_graph.js` (§7 of
  `prompts/Viewer/FindRooms/VIEWER_FIND_PANEL_ROOM_ACCURACY.md`) — Dijkstra over a real
  shared-door adjacency graph, already surfaced as a Find-panel "Path" mode. **Status: real code, on
  bim-ootb branch `feat/room-pathfind-graph`, committed locally only, NOT pushed/merged.** This is
  the exact substrate an escape-route feature needs — reuse it, don't rebuild a second graph.
- **Guid-deep-link-by-URL, already shipped and proven**: the Zoom-Across mechanism
  (`viewer/config.js A.FIND_GUID` + `hba_lens.js _consumeFindGuid`, §2026-07-04c above) already
  lands a page directly on a given guid's zone from a URL parameter. A door-side QR code encoding
  `.../viewer.html?find=<door-or-zone-guid>` is a small, precedented extension of infrastructure that
  already exists — not a new mechanism.
- **A "safety brief" acknowledgment already has a named slot**: the signed-edge chain table (line
  ~932 above) already lists "safety brief" alongside payslip-ack/leave/permit-to-work as a
  `sealChain`/`verifyChain`-style signed op. Never wired to a real UI, but the mechanism a visitor
  "must be told and acknowledge" safety info through already exists in the kernel op-log, not a new
  invention.
- **Occupied/vacant, live, today**: HBA Presence's "open attendance session resolves to a zone"
  signal (§2026-07-04c) already answers occupied-vs-vacant for staff, no new data needed.
- **7 IoT sensor types exist, but NONE are fire/smoke/gas detection** (`iot.js`
  temp/pressure/sound/dust/solar/electrical/motion-PIR, §2026-07-04d/2026-07-05c above) — "escape
  route available by virtue of sensor clearance" needs either a genuinely new sensor type (mocked the
  same deterministic way the existing 7 are, clearly labeled MOCKUP, bound to a real element like the
  others) or an honest note that no current sensor answers "is this corridor clear of smoke/fire"
  — don't silently repurpose e.g. the dust sensor as a smoke proxy without saying so.

### NON-INVENT GATE — the two numbers this needs that are NOT yet sourced in this repo
1. **Occupant-load factor (people per m², by space type)** — DIFFERENT from the UBBL bedroom-minimum-
   area figures already found+verified (`prompts/UBBL_RULES_RECON.md`, 9.3/6.5/11 m² — those are
   room-SIZE minimums for habitability, By-Law 42). Egress capacity needs the separate occupant-LOAD
   table (UBBL By-Law 40/Means-of-Escape schedule, or a Fire Certificate schedule) — not yet located
   or sourced from Bomba/KPKT. **User's resolution this session: "pick the most universal one, or
   follow the country locale JSON."** Checked for an existing locale-keyed standards file first (per
   that instruction) — no such JSON exists (`deploy/*/locales/` is UI text/currency i18n only, a
   different thing). What DOES already exist and fits the ask: `library/component_library.db`'s
   `ad_jurisdiction_codes`(jurisdiction, code_id) → `ad_code_requirement`(clause, element_type,
   space_type, qty_per_area, ...) schema — already populated with 23 real US rows (NEC_2020/
   NFPA_13/IPC_2021), with a `UBBL_FIRE` Malaysia jurisdiction row present but 0-populated. This is
   the real "country locale" mechanism, a DB table not a JSON file — **recommend**: populate it
   properly (element_type='OCCUPANT_LOAD', qty_per_area = the sourced factor, space_type = room type)
   using NFPA 101 Table 7.3.1.2 (a real, internationally-referenced, genuinely "most universal"
   occupant-load-factor table) as the default row when no Malaysia-specific figure is sourced, with a
   Malaysia-specific row added once verified from Bomba/KPKT the same way the room-area figures were
   — don't invent a number for either jurisdiction, cite before populating.
2. **Door/stair CLEAR width vs total leaf/flight width** — real evacuation-time formulas (see below)
   need effective egress width, not raw geometry bbox width. Not yet checked whether the extracted
   `element_transforms` bbox for `IfcDoor`/`IfcStair` already represents clear width or needs a
   standard deduction — verify against real data before computing anything, don't assume.

### "Mins to clear the building, by floor" — real standard concept, not this project's invention
User's own framing: "i wonder if safety stds do need or we are prior art... i am just imagining
things." Answered directly: this is a well-established fire-engineering concept — **Required Safe
Egress Time (RSET)**, computed from occupant load ÷ effective egress width × a standard flow-rate
constant (SFPE Handbook / NFPA 101 / BS 9999 methods), typically done per floor/stair. **Not
something this project invents or is "prior art" for as a concept** — engineers already do this as a
one-off design-time calculation. What WOULD be a genuine differentiator: computing it **continuously,
live, from real extracted BIM geometry (real door/stair widths already in `element_transforms`) and
real-time HBA occupancy telemetry** instead of a static design-time assumption — most real-world RSET
calcs use assumed/worst-case occupancy, not live sensor-fed numbers. That automation angle is real
and not something located elsewhere in this repo or field — but it is gated on both NON-INVENT items
above being sourced first; do not compute or display a "minutes to clear" number until they are.

### UI — capacity as an icon, not a label (folds into the Outliner-friendly-naming discussion)
Per the same-session Outliner/taxonomy discussion (bim-compiler conversation, not yet its own doc):
user wants capacity shown as a grey person-silhouette avatar, an occupied count overlain in blue, and
a `×N` compact notation for multiples — consistent with this project's existing icon-not-label
convention for the Viewer facet axis (`viewer/panels.js` `ICONS` registry — Storey `layers`/Disc
`wrench`/Material `contrast`/Tenancy `users`/IoT `cpu`/Team `share`, per
`project_teams_people_dimension_architecture` memory's UI-consistency pass). A capacity/occupancy
badge is a natural new `ICONS` entry (e.g. a person-glyph + count), not a new UI pattern — reuse the
registry, don't invent a second icon mechanism.

### Open questions before this can move from spec to build
1. Is a genuinely new "smoke/fire" mock sensor wanted (same deterministic-mockup discipline as the
   existing 7), or should escape-route "clearance" stay purely topological (the room graph only, no
   sensor-conditioning) until real detection hardware/data exists?
2. Who sources the Malaysia occupant-load figure (Bomba/KPKT), and is the NFPA 101 universal default
   acceptable to ship as a labeled fallback in the meantime, clearly marked as non-Malaysia-specific?
3. Where does the QR code itself get generated/printed from — a Viewer admin tool, a static per-door
   export, something else? Not yet designed.

### DONE WHEN (for a future build session — not this one)
Nothing here is started. A future session picks ONE slice (e.g. "QR-to-Find-panel landing" alone is
buildable today with zero new sourcing, since it only reuses existing `FIND_GUID` deep-linking) rather
than attempting the full escape-route+capacity+RSET stack in one pass.
