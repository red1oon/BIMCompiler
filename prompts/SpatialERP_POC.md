/**
 * BIM OOTB — Frictionless BIM. Two DBs. One browser. Zero install.
 * Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
 * SPDX-License-Identifier: MIT
 */

# ⚠ DO NOT REMOVE — Scope guard
# Scope: Spatial ERP OOTB — doc_engine.js + category_registry + Construction ERP POC.
#        Browser-only. No server. No iDempiere dependency.
#        Replaces prompts/done/iDempiereOOTB.md — same iDempiere AD thinking,
#        zero iDempiere infrastructure.
#        Requirement source: ~/Downloads/Idempiere Construction ERP.pptx (Sysnova / Kazi Farms Group)
# Read the log after every run. Exit code is not evidence.
# Spec-first: implement only what is described in a § section below.

---

# Spatial ERP OOTB — Construction ERP POC

## Goal

Prove that a Construction ERP — land lead management, FAR planning, BOQ,
project financial control — runs entirely in the browser using SQLite WASM
+ Three.js, with zero server dependency.

The POC domain is **Construction** (land acquisition → development planning →
BOQ → project execution) because:
1. The architect provides IFC — **the 3D view already exists** in BIM OOTB
2. The BOQ engine already exists (boq_charts.html, rates.js)
3. The land plot is the spatial container, the building is the BOM
4. FAR (Floor Area Ratio) is inherently spatial — building volume / plot area
5. The workflow (Lead → Screen → FAR → BOQ → Approve) maps to doc_status

**Requirement source:** Sysnova (Part of Kazi Farms Group) — "Construction ERP
on iDempiere" presentation. Real stakeholders, real workflow, real data fields.

**POC success = one device, all roles: Land team creates lead with plot location
→ Architect sees FAR view with IFC building on plot → Engineering sees BOQ
auto-computed from IFC → Management approves/rejects → role band switches
between all 6 stakeholder perspectives.**

**Full spec:** `docs/SpatialERP_OOTB.md`

---

## §0. What This Replaces

`prompts/done/iDempiereOOTB.md` planned an OSGi plugin embedding BIM OOTB inside
iDempiere (Iframe in ZK, postMessage bridge, C_Project tab, Java handlers).
That approach required iDempiere server (JVM + PostgreSQL + OSGi bundle).

This prompt achieves the **same ERP semantics** with:
- SQLite WASM (sql.js) in browser
- kernel_ops (already built — commit, undo, redo, replay)
- Three.js + BIM OOTB viewer (already built — IFC rendering, BOQ, 5D)
- Same viewer (deploy/dev/index.html), extended with doc_engine.js

**Build order: core engine FIRST, then UI, then domain data.**

---

## §0b. Core Engine Architecture — Build This First

```
┌─────────────────────────────────────────────────────────────────┐
│                     BROWSER (same for all roles)                │
├─────────────────┬──────────────────────────┬────────────────────┤
│   Adapters      │     Handlers             │   Core             │
│   (UI skin)     │  (domain logic plugins)  │  (immutable)       │
├─────────────────┼──────────────────────────┼────────────────────┤
│ ThreeScene ★    │ LeadCreate  (Land)       │ kernel_ops ★       │
│ SwipeCardStack  │ FARCalc     (Architect)  │ StateMachine       │
│ RoleBand        │ BOQGenerate (Eng/BOQ)    │ JournalEngine      │
│ RoleFilter      │ Approve     (Mgmt)       │ SpatialIndex ★     │
│ QRGateway ★     │ SalesView   (Sales)      │ CategoryRegistry   │
│                 │ LegalClose  (Legal)      │                    │
│  ★ = already    │                          │  ★ = already       │
│    exists       │                          │    exists          │
└─────────────────┴──────────────────────────┴────────────────────┘
                              │
                              ▼
                    SQLite WASM (.db file — 9 tables)
```

### Build priority:

| Priority | Component | File | Depends on |
|---|---|---|---|
| **P0** | Table creation (6 new tables) | `doc_engine.js` | Nothing |
| **P0** | StateMachine (pure function) | `doc_engine.js` | Tables |
| **P0** | JournalEngine (auto-post) | `doc_engine.js` | StateMachine |
| **P0** | kernel_ops user_tag | `kernel_ops.js` | Nothing |
| **P1** | CategoryRegistry reader | `category_loader.js` | Tables |
| **P1** | Construction seed data | `construction.db` | Tables + Registry |
| **P2** | Construction handlers | `handlers/construction.js` | Core + seed data |
| **P3** | SwipeCardStack | `swipe.js` | Registry + handlers |
| **P3** | RoleBand | `role_band.js` | project_metadata |
| **P4** | Integration test | test file | All above |

**P0 must work headless** (no UI) with unit tests proving state transitions
and journal posting before any card is rendered.

---

## §1. Requirement — Sysnova Construction ERP

### §1.1 The business flow (from pptx)

```
Land Lead Management lifecycle:

Lead Creation → Screening → FAR Planning → Sales Visibility
    → BOQ → Negotiation → Approval / Rejection → Closure
```

### §1.2 Stakeholders and roles

| Role | Responsibility | OOTB mode | OOTB scope |
|---|---|---|---|
| **LAND** (Land/Business Dev) | Lead creation, negotiation, full access | `full` | All leads |
| **ARCH** (Architect/Planning) | FAR & development comments, FAR only | `operator` | FAR fields + IFC |
| **ENGR** (Engineering/BOQ) | Cost estimation only | `operator` | BOQ tab only |
| **SALE** (Sales) | Planning review, read-only, NO owner info | `readonly` | No landowner data |
| **MGMT** (Management) | Approval authority, full access | `full` | All leads |
| **LEGL** (Legal) | Post-approval processing | `operator` | Approved leads only |

### §1.3 Functional requirements (from pptx)

**Lead Creation:**
- Lead Code (auto-generated)
- Land Type (Freehold / Leasehold)
- Land Size (Katha)
- Lead Source
- Location details: Plot, Road, Block, Sector, Area
- Facing (East/West/North/South)
- Road Width

**Landowner Information (Confidential — hidden from Sales):**
- Owner Name, Contact Person, Mobile, Email, Address
- Rule: Sales users shall NOT have visibility

**Activity Management:**
- Meeting date, Follow-up date, Activity type, Notes, Attachments

**FAR Calculation & Development Planning:**
- FAR value
- Developable area, Saleable area
- Number of storeys
- Units per floor, Total units
- Parking, Basement

**Development Sales:**
- Sales Price per unit
- Comments

**BOQ:**
- Cost per SF
- Comments
- Links to IFC-derived BOQ (existing boq_charts.html)

**Financial Management:**
- Project cost report, WIP statement
- Budget vs actual, Revenue recognition
- Progress billing (RA Bills), Retention

**Project Phases:** Foundation, Civil Structure, Electrical, Plumbing, Finishing

---

## §2. iDempiere Mapping — AD in SQLite

Every iDempiere concept from the Sysnova pptx maps to browser-side:

| iDempiere (pptx shows) | Browser equivalent |
|---|---|
| Lead Info window (custom table) | `documents` with `doc_type='LAND_LEAD'` |
| Lead Activity tab | `kernel_ops` with `op_type='LEAD_ACTIVITY'` |
| Development Plan window | `documents` with `doc_type='DEV_PLAN'`, linked to lead |
| Development Sales Price tab | `document_lines` with price + comments |
| Development BOQ window | `document_lines` with cost_per_sf + IFC BOQ link |
| C_Project (ABC Construction) | `containers` root — the project |
| Project Phases (Foundation, Civil...) | `containers` children — phases as sub-containers |
| AD_Role (Land Team, Sales, etc.) | `?mode=` + role band + `metadata` field hiding |
| DocStatus workflow | `doc_engine.js` StateMachine |
| Financial reports | `journal` queries (SUM debit, credit GROUP BY account) |

---

## §3. Schema — The Nine Tables

Same five data tables + registry from SpatialERP_OOTB.md §4.
Construction-specific data lives in `metadata` JSON, not new columns.

### §3.1 New tables (created by doc_engine.js on first load)

```sql
-- §TAB_CONTAINERS — spatial hierarchy: Site → Building → Phase → Floor
CREATE TABLE IF NOT EXISTS containers (
    id          TEXT PRIMARY KEY,
    parent_id   TEXT REFERENCES containers(id),
    name        TEXT NOT NULL,
    category    TEXT NOT NULL,       -- SITE, BUILDING, PHASE, FLOOR, PLOT
    geometry_id TEXT,                -- FK to component_geometries (IFC model)
    x REAL DEFAULT 0, y REAL DEFAULT 0, z REAL DEFAULT 0,
    metadata    TEXT DEFAULT '{}'    -- JSON: land_size, facing, far_value, etc.
);

-- §TAB_ITEMS — things in containers: elements, fixtures, materials
CREATE TABLE IF NOT EXISTS items (
    id           TEXT PRIMARY KEY,
    container_id TEXT REFERENCES containers(id),
    product_ref  TEXT,
    name         TEXT,
    qty          REAL DEFAULT 1,
    geometry_id  TEXT,
    x REAL DEFAULT 0, y REAL DEFAULT 0, z REAL DEFAULT 0,
    metadata     TEXT DEFAULT '{}'
);

-- §TAB_DOCUMENTS — leads, dev plans, BOQs, POs, invoices
CREATE TABLE IF NOT EXISTS documents (
    id          TEXT PRIMARY KEY,
    doc_type    TEXT NOT NULL,       -- LAND_LEAD, DEV_PLAN, DEV_BOQ, PURCHASE_ORDER...
    doc_status  TEXT DEFAULT 'DRAFT',
    created     TEXT NOT NULL,
    completed   TEXT,
    description TEXT,
    metadata    TEXT DEFAULT '{}'    -- JSON: all lead fields, landowner info, etc.
);

-- §TAB_DOC_LINES — BOQ lines, sales prices, phase costs
CREATE TABLE IF NOT EXISTS document_lines (
    id           TEXT PRIMARY KEY,
    doc_id       TEXT REFERENCES documents(id),
    item_id      TEXT,
    container_id TEXT,
    qty          REAL,
    unit_price   REAL,
    metadata     TEXT DEFAULT '{}'
);

-- §TAB_JOURNAL — auto-generated on document completion
CREATE TABLE IF NOT EXISTS journal (
    id        TEXT PRIMARY KEY,
    doc_id    TEXT REFERENCES documents(id),
    line_id   TEXT,
    account   TEXT NOT NULL,         -- LAND_COST, CONSTRUCTION_WIP, REVENUE, RETENTION
    debit     REAL DEFAULT 0,
    credit    REAL DEFAULT 0,
    timestamp TEXT NOT NULL
);

-- §TAB_REGISTRY — AD for construction categories
CREATE TABLE IF NOT EXISTS category_registry (
    category        TEXT PRIMARY KEY,
    domain          TEXT,
    json_schema     TEXT,
    default_geometry TEXT,
    actions         TEXT,             -- JSON: allowed actions per category
    heatmap_rule    TEXT,
    label_template  TEXT
);
```

### §3.2 Existing tables (unchanged)

- `kernel_ops` — commit, undo, redo, replay (add `user_tag` column)
- `component_geometries` — IFC 3D shapes
- `project_metadata` — domain config, roles, colours

---

## §4. Construction Seed Data — construction.db

### §4.1 Containers — site/plot/building/phases

```sql
-- §SEED_CONTAINERS
-- The site container — top level
INSERT INTO containers VALUES ('site_gulshan', NULL, 'Gulshan-1 Site', 'SITE', NULL,
    0,0,0, '{"area":"Gulshan-1","city":"Dhaka"}');

-- The land plot — spatial object on the site
INSERT INTO containers VALUES ('plot_60', 'site_gulshan', 'Plot 60, Road 2, Block 4', 'PLOT', NULL,
    60,2,0, '{"plot_no":60,"road_no":2,"block_no":4,"sector":3,"road_width":20,"facing":"East"}');

-- The building — this is where the IFC goes
-- geometry_id links to the architect's IFC model once imported
INSERT INTO containers VALUES ('bldg_test', 'plot_60', 'Proposed Development', 'BUILDING', NULL,
    0,0,0, '{"storeys":40,"far_value":10000,"dev_area":20,"saleable_area":100,"basement_area":2,"total_units":50,"units_per_floor":4,"parking":30}');

-- Project phases (from Sysnova pptx: Foundation, Civil, Electrical, Plumbing, Finishing)
INSERT INTO containers VALUES ('phase_found',  'bldg_test', 'Foundation',      'PHASE', NULL, 0,0,0, '{"sequence":10,"std_phase":"Foundation_Construction"}');
INSERT INTO containers VALUES ('phase_civil',  'bldg_test', 'Civil Structure', 'PHASE', NULL, 0,0,0, '{"sequence":20,"std_phase":"Civil_Structure_Construction"}');
INSERT INTO containers VALUES ('phase_elec',   'bldg_test', 'Electrical',      'PHASE', NULL, 0,0,0, '{"sequence":30,"std_phase":"Electrical_Construction"}');
INSERT INTO containers VALUES ('phase_plumb',  'bldg_test', 'Plumbing',        'PHASE', NULL, 0,0,0, '{"sequence":40,"std_phase":"Plumbing_Construction"}');
INSERT INTO containers VALUES ('phase_finish', 'bldg_test', 'Finishing',       'PHASE', NULL, 0,0,0, '{"sequence":50,"std_phase":"Finishing_Construction"}');
```

### §4.2 Documents — the land lead (main document)

```sql
-- §SEED_LEAD — matches pptx Lead Info screen exactly
INSERT INTO documents VALUES ('LEAD-1000000', 'LAND_LEAD', 'DRAFT', '2026-05-13', NULL,
    'Test lead — Gulshan-1 Plot 60',
    '{
        "lead_code": "1000000",
        "land_type": "Freehold",
        "land_size_katha": 10.0,
        "lead_source": "Others",
        "plot_no": 60, "road_no": 2, "block_no": 4, "sector": 3,
        "area": "Gulshan-1", "facing": "East", "road_width": 20,
        "owner_name": "CONFIDENTIAL — Mr. Rahman",
        "contact_person": "test contact",
        "phone": "0986533223",
        "email": "",
        "address": "",
        "user_contact": "Azmir",
        "container_ref": "plot_60"
    }');

-- §SEED_DEV_PLAN — linked to the lead
INSERT INTO documents VALUES ('DEV-1000000', 'DEV_PLAN', 'DRAFT', '2026-05-13', NULL,
    'Development Plan for LEAD-1000000',
    '{
        "lead_ref": "LEAD-1000000",
        "far_value": 10000.0,
        "total_dev_area": 20.0,
        "total_saleable_area": 100.0,
        "num_storeys": 40,
        "total_units": 50,
        "units_per_floor": 4,
        "total_parking": 30,
        "total_basement_area": 2.0,
        "container_ref": "bldg_test"
    }');
```

### §4.3 Document lines — sales price + BOQ

```sql
-- §SEED_SALES_PRICE
INSERT INTO document_lines VALUES ('SP-001', 'DEV-1000000', NULL, 'bldg_test',
    1, 2000.00, '{"type":"sales_price","comment":"testttt"}');

-- §SEED_BOQ
INSERT INTO document_lines VALUES ('BOQ-001', 'DEV-1000000', NULL, 'bldg_test',
    1, 2300.00, '{"type":"cost_per_sf","comment":"eofuweofowef"}');
```

### §4.4 Category Registry (AD)

```sql
-- §SEED_REGISTRY
INSERT INTO category_registry VALUES ('SITE',     'CONSTRUCTION', NULL, NULL,
    '["CreateLead","ViewLeads","ViewPnL"]',
    '{"field":"active_leads","red_above":10}',
    '{name}');

INSERT INTO category_registry VALUES ('PLOT',     'CONSTRUCTION', NULL, 'plot_3d',
    '["CreateLead","EditLead","ViewFAR","LinkIFC"]',
    '{"field":"lead_status","red_value":"REJECTED"}',
    'Plot {metadata.plot_no} — {metadata.area}');

INSERT INTO category_registry VALUES ('BUILDING', 'CONSTRUCTION', NULL, NULL,
    '["ViewIFC","ComputeBOQ","EditFAR","ApprovePlan"]',
    '{"field":"doc_status","amber_value":"DRAFT","red_value":"REJECTED"}',
    '{name} ({metadata.storeys}F)');

INSERT INTO category_registry VALUES ('PHASE',    'CONSTRUCTION', NULL, NULL,
    '["ViewProgress","AddCost","CompleteMilestone"]',
    '{"field":"pct_complete","red_below":20,"green_above":80}',
    '{name} — Seq {metadata.sequence}');
```

### §4.5 Project Metadata — roles from Sysnova pptx

```sql
-- §SEED_META — maps exactly to pptx Role Based Access Control slide
INSERT INTO project_metadata VALUES ('domain', 'CONSTRUCTION');
INSERT INTO project_metadata VALUES ('roles',
    '["LAND","ARCH","ENGR","SALE","MGMT","LEGL"]');
INSERT INTO project_metadata VALUES ('role_labels',
    '{"LAND":"Land Team","ARCH":"Architect","ENGR":"BOQ Team","SALE":"Sales","MGMT":"Management","LEGL":"Legal"}');
INSERT INTO project_metadata VALUES ('role_colours',
    '{"LAND":"#1565c0","ARCH":"#7b1fa2","ENGR":"#e65100","SALE":"#2e7d32","MGMT":"#b71c1c","LEGL":"#00838f"}');
INSERT INTO project_metadata VALUES ('role_modes',
    '{"LAND":"full","ARCH":"operator","ENGR":"operator","SALE":"readonly","MGMT":"full","LEGL":"operator"}');
INSERT INTO project_metadata VALUES ('role_scopes',
    '{"LAND":"*","ARCH":"far","ENGR":"boq","SALE":"no_owner","MGMT":"*","LEGL":"approved_only"}');
INSERT INTO project_metadata VALUES ('accounts',
    '["LAND_ACQUISITION","CONSTRUCTION_WIP","REVENUE","RETENTION","PROFESSIONAL_FEES"]');
INSERT INTO project_metadata VALUES ('confidential_fields',
    '["owner_name","contact_person","phone","email","address"]');
```

---

## §5. State Machine — Lead Lifecycle

The Sysnova workflow maps to an **extended** state machine. The base 5-state
machine handles all doc_types. The LAND_LEAD has domain-specific status labels:

```
Lead Created (DRAFT)
    ↓ screen
Screening (IN_PROGRESS)
    ↓ plan_far
FAR Planning (IN_PROGRESS — sub-status: FAR)
    ↓ submit_approval
Management Approval (IN_PROGRESS — sub-status: APPROVAL)
    ↓ approve / reject
        → approve → BOQ (IN_PROGRESS — sub-status: BOQ)
                        ↓ negotiate
                     Negotiation (IN_PROGRESS — sub-status: NEGOTIATION)
                        ↓ close
                     Approved / Closure (COMPLETED)
        → reject → Rejected (VOIDED)
```

Implementation: the base StateMachine handles DRAFT → IN_PROGRESS → COMPLETED / VOIDED.
The sub-statuses (FAR, APPROVAL, BOQ, NEGOTIATION) are stored in
`documents.metadata.sub_status` — the state machine doesn't know about them.
Handlers advance the sub_status via commitOp.

```javascript
// §STATE_LEAD_TRANSITIONS
// The base machine sees: DRAFT → IN_PROGRESS → COMPLETED or VOIDED
// The handlers manage sub_status progression within IN_PROGRESS:
//
// handler: screenLead(db, leadId)
//   → sets metadata.sub_status = 'SCREENING'
//   → transition(db, leadId, 'start')  // DRAFT → IN_PROGRESS
//   → commitOp(db, 'LEAD_SCREEN', {lead_id, screened_by})
//
// handler: planFAR(db, leadId, farData)
//   → sets metadata.sub_status = 'FAR'
//   → creates DEV_PLAN document linked to lead
//   → commitOp(db, 'FAR_PLAN', {lead_id, far_value, dev_area, ...})
//
// handler: submitApproval(db, leadId)
//   → sets metadata.sub_status = 'APPROVAL'
//   → commitOp(db, 'SUBMIT_APPROVAL', {lead_id, submitted_by})
//
// handler: approve(db, leadId)
//   → sets metadata.sub_status = 'BOQ'
//   → commitOp(db, 'LEAD_APPROVE', {lead_id, approved_by})
//
// handler: reject(db, leadId, reason)
//   → transition(db, leadId, 'void')  // → VOIDED
//   → commitOp(db, 'LEAD_REJECT', {lead_id, reason})
//
// handler: generateBOQ(db, leadId)
//   → reads IFC-derived element data from extracted .db
//   → creates document_lines with costs from rates.js
//   → sets metadata.sub_status = 'NEGOTIATION'
//   → commitOp(db, 'BOQ_GENERATE', {lead_id, total_cost, line_count})
//
// handler: closeLead(db, leadId)
//   → transition(db, leadId, 'complete')  // → COMPLETED
//   → JournalEngine posts: debit LAND_ACQUISITION, credit CASH
//   → commitOp(db, 'LEAD_CLOSE', {lead_id, final_price})
```

---

## §6. Role-Based Field Visibility

The Sysnova pptx specifies: **"Sales users shall NOT have visibility"** on
landowner information. This is handled by `?mode=` and `confidential_fields`:

```javascript
// §FIELD_FILTER
// When rendering a document card:
// 1. Read current role from role_band
// 2. Read role_scopes from project_metadata
// 3. Read confidential_fields from project_metadata
// 4. If role scope says "no_owner":
//    → strip confidential_fields from displayed metadata
//    → owner_name, phone, email, address → hidden
//
// No server enforcement — this is UI filtering (same as ?mode= pattern).
// The .db contains all data. Filtered views are convenience, not security.
// For true security: generate per-role .db extracts (same as customer QR pattern).
```

| Role | Sees lead fields | Sees owner info | Sees FAR | Sees BOQ | Can approve |
|---|---|---|---|---|---|
| LAND | All | Yes | Yes | Yes | No |
| ARCH | Location only | No | **Yes (edit)** | No | No |
| ENGR | Location + FAR | No | Yes (read) | **Yes (edit)** | No |
| SALE | Location + FAR + Sales Price | **No** | Yes (read) | No | No |
| MGMT | All | Yes | Yes | Yes | **Yes** |
| LEGL | Approved leads only | Yes | Yes | Yes | No |

---

## §7. The Spatial Correlation — IFC Meets ERP

This is where BIM OOTB + Spatial ERP fuse. The architect provides an IFC file.
The existing viewer renders it. The ERP layer wraps documents around it.

### §7.1 The connection

```
Architect provides: residential_project.ifc
    ↓
BIM OOTB viewer: imports → extracts → renders 3D scene
    ↓
Spatial ERP: the 3D building IS the container 'bldg_test'
    ↓
BOQ handler: reads elements_meta from extracted .db
    → auto-populates document_lines with quantities + rates
    ↓
FAR calculation: reads bbox from element_transforms
    → computes total floor area / plot area
    ↓
Phase mapping: IFC disciplines (ARC, STR, MEP) → project phases
    → Foundation = STR ground floor elements
    → Electrical = ELEC discipline elements
    → Plumbing = PLB discipline elements
    ↓
Heatmap: phases colour-coded by completion %
    → Foundation 100% (green), Civil 60% (amber), Finishing 0% (red)
```

### §7.2 BOQ from IFC (already exists)

The viewer's `boq_charts.html` already computes:
```sql
SELECT m.discipline, m.ifc_class, m.storey, COUNT(*) as qty
FROM elements_meta m
GROUP BY m.discipline, m.ifc_class, m.storey
```

With rates from `rates.js` (CIDB Malaysia 2024, or custom template).

The BOQ handler just copies this into `document_lines`:

```javascript
// §HANDLER_BOQ_GENERATE
// Reads the existing QTO computation from the loaded .db
// Creates document_lines under the DEV_PLAN document:
//   line per (discipline, ifc_class, storey) with qty, rate, total
// Links to the building container
// This is the SAME data boq_charts.html shows — just persisted as ERP lines
```

### §7.3 FAR from geometry (new computation)

```javascript
// §HANDLER_FAR_CALC
// FAR = Total Floor Area / Plot Area
// Total Floor Area: SUM of slab areas per storey (from element_transforms bbox)
// Plot Area: from container metadata (land_size_katha × 720 sq ft per katha)
//
// Or: read from architect's input in DEV_PLAN metadata
// The IFC provides the truth — architect's estimate can be validated against it
```

---

## §7b. Two HTML Files, Two Concerns

The ERP layer is **document-centric, not spatial**. No redundant 3D scene.
The spatial experience stays in BIM OOTB. Two HTML files, clean separation:

### erp.html — Universal Document Engine (NEW)

Standalone HTML. **No Three.js.** Pure document handling with TikTok swipe UX.
This is the common foundation for ALL future ERP document handling — construction,
F&B, WMS, back office. Any domain where you swipe through documents.

```
┌──────────────────────────────┐
│  [ENGR] BOQ Team   [QR] [<>]│  Role band
├──────────────────────────────┤
│                              │
│  ┌────────────────────────┐  │
│  │  Lead: LEAD-1000000    │  │  Swipe card — document-centric
│  │  Gulshan-1, Plot 60    │  │  No 3D thumbnail. Just data.
│  │  10 Katha, Freehold    │  │  Clean, fast, phone-first.
│  │                        │  │
│  │  Status: ⬤ SCREENING   │  │  Colour dot = status
│  │  FAR: 10,000           │  │
│  │  BOQ: RM 2,300/SF      │  │
│  │                        │  │
│  │  [ Approve ] [ Reject ]│  │  Action buttons per role
│  └────────────────────────┘  │
│                              │
│  ← swipe →  (next document)  │
│  ↑ swipe ↑  (drill into FAR) │
│  ↓ swipe ↓  (back to list)   │
│                              │
│  [ Open in BIM ] ← link out  │  Opens index.html with same .db
└──────────────────────────────┘
```

**What erp.html contains:**
- `sql.js` (loads the same `.db` from OCI or IndexedDB)
- `doc_engine.js` (StateMachine + JournalEngine)
- `category_loader.js` (registry reader)
- `swipe.js` (card stack + gestures)
- `role_band.js` (role switcher + QR share)
- `handlers/construction.js` (or fnb.js, wms.js — domain handlers)
- **No scene.js. No Three.js. No WebGL.**

**What this means:** erp.html works on ANY device, even a $50 phone with no
GPU. It's a card swipe app that happens to read a SQLite database. The 3D
experience is optional — open BIM OOTB when you need spatial context.

### index.html — BIM OOTB Spatial Scene (EXISTING)

The existing viewer. IFC geometry, 3D scene, measure tool, clash detection.
When the user needs to connect a document to a spatial element, the
**Measure tool pattern** extends to become an ERP overlay panel.

### The Measure Tool Pattern — ERP in BIM

`measure.js` already demonstrates the pattern:
- User activates Measure tool → panel opens over the 3D scene
- User clicks element → panel shows measurement data
- Panel overlays the scene, doesn't replace it

**"Measure for ERP" follows the same pattern:**

```
┌──────────────────────────────────────────┐
│   BIM OOTB 3D Scene                      │
│                                          │
│   IFC building rendered                  │
│                                    ┌─────┤
│                                    │ ERP │
│   User clicks an IfcWall ─────────►│     │
│                                    │Tag  │
│                                    │Lead │
│                                    │Snag │
│                                    │BOQ  │
│                                    │Phase│
│                                    │     │
│                                    └─────┤
│   [Measure] [X-Ray] [Clash] [ERP]       │  ← new toolbar button
└──────────────────────────────────────────┘
```

The [ERP] toolbar button opens a side panel (same as Measure panel).
Click any element → panel shows:
- Which BOQ line this element belongs to
- Which phase (Foundation, Civil, Electrical...)
- Cost for this element type
- Linked documents (lead, snag, PO)
- Action: [Tag] [Link to Lead] [Add Snag] [Mark Complete]

Each action is a `commitOp` — logged in kernel_ops, visible in erp.html.

### The bridge is the .db

```
erp.html                         index.html
(document swipe)                 (3D spatial scene)
     │                                │
     │     SAME .db on OCI            │
     │  ◄─────────────────────────►   │
     │     Same containers            │
     │     Same documents             │
     │     Same kernel_ops            │
     │                                │
     │  Lead created in erp.html      │
     │  → .db updated                 │
     │  → index.html loads same .db   │
     │    → plot coloured by status   │
     │                                │
     │  Element tagged in index.html  │
     │  → kernel_op committed         │
     │  → erp.html loads same .db     │
     │    → BOQ line shows tag        │
```

No postMessage. No WebSocket. No API. **The `.db` file on OCI is the
integration layer.** Both HTML files read the same file. Changes by one
are visible to the other on next load (or if sharing IndexedDB, instantly).

### Desktop God Mode

Two browser tabs side by side:
- Left: `index.html?db=construction.db` (3D scene, IFC, measure)
- Right: `erp.html?db=construction.db` (document swipe, role band, approval)

Both read the same `.db`. The manager sees the building AND the documents.

### Mobile

One app at a time:
- On-site foreman: opens `erp.html` on phone → swipes through phases, marks completion
- Architect at desk: opens `index.html` on laptop → reviews IFC, uses [ERP] panel to tag elements
- Management in meeting: opens `erp.html` on tablet → swipes leads, approves/rejects

The `[Open in BIM]` button on erp.html cards links out to `index.html` with
the same `.db` and `?scope=` — for when you need spatial context.

### Same repo, lazy-loaded

All ERP files live in the BIM OOTB repo (`deploy/dev/`). Nothing is separate.
Users see the full product — BIM + ERP — in one place.

**Lazy-load pattern (same as measure.js):**
- `measure.js` loads only when user clicks [Measure]
- `erp_panel.js` loads only when user clicks [ERP]
- `erp.html` is a standalone entry point that loads the same modules

```
deploy/dev/
  index.html          ← BIM viewer. [ERP] button lazy-loads erp_panel.js
  erp.html            ← Standalone document swipe. Loads same modules.
  doc_engine.js       ← Core: StateMachine + JournalEngine
  category_loader.js  ← Registry reader
  erp_panel.js        ← The panel UI (swipe cards + role band)
                         Loaded by BOTH index.html and erp.html
  swipe.js            ← Card stack + gestures (used by erp_panel.js)
  role_band.js        ← Role switcher + QR (used by erp_panel.js)
  handlers/
    construction.js   ← Lead lifecycle + BOQ + FAR handlers
    fnb.js            ← (future) restaurant handlers
    wms.js            ← (future) warehouse handlers
  measure.js          ← Already exists. Same lazy-load pattern.
  boq_charts.html     ← Already exists. Same standalone pattern.
```

**Two entry points, same modules:**

| Entry | When | What loads |
|---|---|---|
| `erp.html` | Mobile user, document-only, no 3D needed | sql.js + doc_engine + erp_panel + swipe + role_band + handler |
| `index.html` → [ERP] button | Desktop user, wants 3D + documents | Same modules, lazy-loaded into panel overlay |

**Why this works:** The user sees one product with everything in it.
The foreman opens `erp.html` on their phone. The architect opens `index.html`
and clicks [ERP] when they need document context. Same data, same modules,
same role band — two ways in.

### Why this separation wins

| Concern | erp.html (standalone) | index.html + [ERP] panel |
|---|---|---|
| Primary UX | Document swipe (TikTok) | 3D spatial + document overlay |
| Three.js | **None** — pure DOM + CSS | Full WebGL scene |
| Device requirement | Any phone, any browser | GPU-capable device |
| Domain-agnostic | **Yes** — same cards for any domain | Construction/BIM spatial |
| Foundation for | All future ERP document handling | Spatial tagging, element linking |
| File size | Tiny (~50KB + sql.js WASM) | Large (Three.js + IFC geometry) |
| Same modules? | **Yes** — doc_engine, swipe, role_band | **Yes** — lazy-loaded on [ERP] tap |

---

## §8. POC Demo Flow — All Roles, One Device

```
1. Open construction.db in viewer
   Role band: [LAND] (blue) — "Land Team"
   3D view: site plan. Plot 60 shown as a rectangle on the map.
   Plot is grey (no lead yet... wait, seed data has DRAFT lead).
   Plot card shows: "Plot 60 — 10 Katha — Freehold — Gulshan-1"
       ↓
2. Tap Plot 60 → Lead card shows all fields (owner info visible to LAND).
   Tap [Screen]. Lead transitions DRAFT → IN_PROGRESS (Screening).
   commitOp: LEAD_SCREEN. Plot goes amber.
       ↓
3. Tap [<>] → switch to ARCH (purple) — "Architect"
   Scope filters to FAR fields only.
   Tap Plot 60 → Card shows land info + FAR section.
   Owner info HIDDEN (Architect = no owner visibility).
   Tap [LinkIFC] → drop architect's IFC file → building renders on plot.
   Tap [EditFAR] → FAR value auto-computed from IFC geometry.
   commitOp: FAR_PLAN. Sub-status → FAR.
       ↓
4. Tap [<>] → switch to ENGR (orange) — "BOQ Team"
   Scope filters to BOQ tab only.
   Tap building → Card shows IFC element summary.
   Tap [ComputeBOQ] → handler reads elements_meta + rates.js
   → document_lines auto-populated: IfcWall RM 285/M2 × 245 = RM 69,825...
   commitOp: BOQ_GENERATE. Sub-status → NEGOTIATION.
   Card shows total cost: RM 2,300/SF × total SF.
       ↓
5. Tap [<>] → switch to SALE (green) — "Sales"
   Owner info HIDDEN. FAR + BOQ visible (read-only).
   Sales sees: Plot location, FAR, total cost, sales price per unit.
   Cannot edit. Cannot approve. Can review.
       ↓
6. Tap [<>] → switch to MGMT (red) — "Management"
   Full access. ALL fields visible including owner.
   Reviews: lead info, FAR, BOQ, sales price.
   Tap [Approve] or [Reject].
   If approve → commitOp: LEAD_APPROVE. Sub-status → BOQ.
   If reject → transition to VOIDED. Lead card goes red.
       ↓
7. Tap [<>] → switch to LEGL (teal) — "Legal"
   Scope: approved leads only. Sees the approved lead.
   Processes post-approval paperwork.
   Tap [Close] → transition to COMPLETED.
   Journal auto-posts: debit LAND_ACQUISITION, credit CASH.
       ↓
8. Tap [<>] → back to LAND (blue)
   Plot 60 goes green (lead completed).
   Building rendered on plot with phases colour-coded.
   Project financial view: journal entries visible.
   kernel_ops: full audit trail of every step by every role.
       ↓
9. Tap [QR] → generates link for ARCH role.
   Hand to architect friend. They see FAR view + IFC.
   Same viewer. Same .db. Different perspective.
       ↓
   POC COMPLETE.
```

---

## §9. Implementation Order

| Step | Section | Deliverable | Verify |
|---|---|---|---|
| 1 | §3.1 | `doc_engine.js` — CREATE TABLE + StateMachine + JournalEngine | **DONE 2026-05-13** 31/31 tests pass |
| 2 | §4 | `construction_seed.sql` — seed data (containers, documents, registry) | **DONE 2026-05-13** 21 tests (T11-T20), idempotent |
| 3 | §5 | Lead lifecycle handlers (screen, planFAR, approve, reject, close) | **DONE 2026-05-13** 27 tests (T21-T31), full audit trail |
| 4 | §7.2 | BOQ handler — reads IFC elements, creates document_lines | §-log: BOQ lines match boq_charts |
| 5 | §7.3 | FAR handler — computes from IFC geometry or manual input | §-log: FAR value computed |
| 6 | §6 | Role-based field filtering (confidential_fields hidden for SALE) | §-log: owner info hidden per role |
| 7 | §12b | SwipeCardStack + RoleBand + ERPPanel + erp.html (P3 UI) | **DONE 2026-05-13** 155 tests (T0-T19), role switch, card render, reversal, XSS, §-log audit |
| 7b | §16 | Journal reversal (`journalReverse`) + stress test (100K docs, 1M ops) + gap tracker | **DONE 2026-05-13** 21 stress tests, 255 total. G1-G9 closed, G10-G18 open. |
| 8 | §8 | End-to-end demo flow | All 9 steps complete on one device |
| 9 | — | Upload construction.db to OCI dev bucket | Accessible via viewer URL |

---

## §10. Files — What Gets Created / Modified

### New files

| File | Lines (est.) | What |
|---|---|---|
| `deploy/dev/doc_engine.js` | ~100 | Core: StateMachine + JournalEngine + table creation |
| `deploy/dev/category_loader.js` | ~30 | Registry reader |
| `deploy/dev/erp_panel.js` | ~150 | ERP panel UI: card renderer + status display. Lazy-loaded by [ERP] button in toolbar, same as measure.js pattern. |
| `deploy/dev/swipe.js` | ~150 | Card stack + touch gestures (used by erp_panel.js) |
| `deploy/dev/role_band.js` | ~80 | Role switcher + QR share (used by erp_panel.js) |
| `deploy/dev/handlers/construction.js` | ~200 | Lead lifecycle + BOQ + FAR handlers |
| `deploy/dev/erp.html` | ~80 | Standalone document-only entry. No Three.js. Loads same modules. For mobile/document-only users. |
| `deploy/dev/buildings/construction.db` | seed data | The POC database |
| `deploy/dev/tests/test_doc_engine.js` | ~80 | Unit tests for core engine |

### Modified files

| File | Change |
|---|---|
| `deploy/dev/main.js` | Load doc_engine.js, category_loader.js. Init tables on DB load. |
| `deploy/dev/kernel_ops.js` | Add user_tag column (idempotent ALTER). |
| `deploy/dev/index.html` | Add [ERP] icon to toolbar (lazy-loads erp_panel.js on tap). Include doc_engine.js. |
| `deploy/dev/tools.js` | Register [ERP] toolbar button alongside Measure, X-Ray, Clash. |

### NOT modified

- `deploy/live/*` — Production — NEVER touch
- `deploy/dev/scene.js` — Three.js scene untouched
- `deploy/dev/measure.js` — Measure tool untouched (pattern to follow, not modify)
- `deploy/dev/boq_charts.html` — BOQ engine reused as-is by handlers
- `deploy/dev/rates.js` — Rate templates reused as-is
- `deploy/dev/share.js` — QR/share reused by role_band.js

---

## §11. Logging Principle — §-tagged Debug First

**Every function logs its entry, key values, and exit.** This is the primary
verification mechanism. Playwright is secondary (wiring checks only).
See `docs/TestArchitecture.md` §Browser Testing.

```javascript
// §DOC_ENGINE Every module follows this pattern:

function transition(db, docId, event) {
    console.log('§DOC_TRANSITION enter doc=' + docId + ' event=' + event);
    var doc = db.exec("SELECT doc_status FROM documents WHERE id=?", [docId]);
    var current = doc[0].values[0][0];
    console.log('§DOC_TRANSITION current_status=' + current);

    // ... transition logic ...

    console.log('§DOC_TRANSITION result doc=' + docId + ' from=' + current + ' to=' + newStatus);
    return { new_status: newStatus, side_effects: effects };
}

// §JOURNAL_POST enter doc=INV-001 lines=3 total_debit=35.00
// §HANDLER_LEAD_SCREEN enter lead=LEAD-1000000 screened_by=Azmir
// §HANDLER_BOQ_GENERATE enter lead=LEAD-1000000 elements=245 total=RM69825
// §CATEGORY_LOADER getCategory cat=PLOT actions=["CreateLead","EditLead","ViewFAR"]
// §ROLE_BAND switch from=LAND to=ARCH scope=far mode=operator
// §SWIPE drill container=plot_60 children=1 (bldg_test)
```

**Rules:**
- Every `§` tag is unique and grep-able
- Log values, not just "entering function X"
- Log BEFORE and AFTER state for mutations
- Log counts (line_count, element_count, total_amount)
- A test that passes without `§`-log evidence is not a test
- Read the log before conclusions. Exit code is not evidence.

---

## §12. erp.html — UX Design Spec

### Visual language — dark theme, card-first

Same dark theme as BIM OOTB (`#1e1e1e` background, `#eee` text).
Same font stack (`system-ui, sans-serif`). Same border style (`1px solid #444`).
The user should feel they're in the same product, not a different app.

### Share link pattern (reuse share.js)

Each document card has a [Share] button that generates a link:

```
erp.html?db=construction.db&doc=LEAD-1000000&role=SALE
```

The recipient opens it → erp.html loads → shows that specific lead → filtered
by SALE role (no owner info visible). Same share channels as BIM OOTB:
- Copy Link (clipboard)
- WhatsApp (pre-composed message)
- Email (pre-composed subject + body)

The share.js `copyLink`, `sendWhatsApp`, `sendEmail` functions are reused
directly — they just take a URL string.

**Role-specific sharing (from role band [QR] button):**
- LAND shares to ARCH: `?doc=LEAD-1000000&role=ARCH` (FAR context only)
- ENGR shares to MGMT: `?doc=LEAD-1000000&role=MGMT` (full view for approval)
- MGMT shares to LEGL: `?doc=LEAD-1000000&role=LEGL` (post-approval)

### Card anatomy

```
┌─────────────────────────────────────┐
│  ⬤ SCREENING          LEAD-1000000 │  Status dot (colour) + doc ID
├─────────────────────────────────────┤
│                                     │
│  Plot 60, Road 2, Block 4          │  Location (always visible)
│  Gulshan-1 · East facing           │
│  10 Katha · Freehold               │  Land summary
│                                     │
│  ┌───────────────────────────────┐  │
│  │ FAR: 10,000    Storeys: 40   │  │  Key metrics bar
│  │ Units: 50      Parking: 30   │  │  (from DEV_PLAN metadata)
│  └───────────────────────────────┘  │
│                                     │
│  BOQ: RM 2,300/SF                   │  Cost headline
│  Total: RM 23,000,000              │
│                                     │
│  ┌─────┐ ┌─────────┐ ┌──────┐     │
│  │Share│ │ Approve  │ │Reject│     │  Action buttons (role-dependent)
│  └─────┘ └─────────┘ └──────┘     │
│                                     │
│  Azmir · 13 May 2026 · 3 activities│  Footer: who, when, activity count
└─────────────────────────────────────┘
```

### Swipe sub-cards (drill into a lead)

Swipe UP on a lead card → drills into tabs:

```
← FAR ─── BOQ ─── Phases ─── Journal ─── Activity →
```

Each tab is a horizontal swipe page:
- **FAR:** development plan fields, saleable area, basement, parking
- **BOQ:** cost lines (discipline × ifc_class × storey), total per phase
- **Phases:** Foundation (green 100%), Civil (amber 60%), Electrical (red 0%)
- **Journal:** debit/credit entries, running totals
- **Activity:** meeting notes, follow-ups, attachments (from kernel_ops)

### Walk mode parallel

BIM OOTB walk mode = first-person spatial navigation through the building.
ERP walk mode = **first-person document navigation through the lead lifecycle.**

The user "walks through" the lead stages:
```
Lead Created → [swipe] → Screening → [swipe] → FAR → [swipe] → BOQ → [swipe] → Approval
```

Each swipe is a stage. The card shows what happens at that stage, who acts,
what changed. It's a timeline, experienced as a walk. The `kernel_ops` log
IS the walk path — replay the ops chronologically and each one is a step.

---

## §12b. P3 UI Implementation Spec — Build Order

**Prerequisite:** P0-P2 done (79/79 tests). Engine works headless.
**Goal:** 4 files that render the engine in a browser. Offline-first.
**Constraint:** No Three.js. No server. pointerup not click. Touch ≥ 44px.
**Pattern:** Same dark theme as BIM OOTB. Same sw.js precache.

### File 1: `role_band.js` (~80 lines)

Fixed header bar. Reads `project_metadata` for roles/colours/labels.

```
┌──────────────────────────────────────────┐
│  ⬤ [LAND] Land Team        [QR] [<>]    │
└──────────────────────────────────────────┘
```

**API:**
```javascript
RoleBand.init(db, containerEl)
  // §ROLE_BAND init — reads roles, colours, labels from project_metadata
  // Renders bar with current role name + colour dot + QR + switch buttons
  // Default role = first in list (LAND) or from URL ?role=

RoleBand.switchRole(direction)
  // §ROLE_BAND switch from=LAND to=ARCH scope=far mode=operator
  // Cycles through roles. Fires 'role-changed' CustomEvent on document.
  // Event detail: { role, scope, mode, colour, label }

RoleBand.currentRole()
  // Returns { role, scope, mode, colour, label }
```

**Events:** `pointerup` on [<>] cycles role. `pointerup` on [QR] calls
`share.js` with `erp.html?db=...&doc=...&role=CURRENT`.

**Offline:** No fetch. Reads from in-memory db only.

### File 2: `swipe.js` (~150 lines)

Card stack with touch gestures. Pure DOM, no library.

**API:**
```javascript
SwipeStack.init(containerEl, cards, onAction)
  // §SWIPE init count=N
  // Renders card stack. Top card visible, others stacked behind.
  // cards = [{ id, html, actions }]

SwipeStack.setCards(cards)
  // Replace card stack (on role change or filter)

SwipeStack.onSwipe(direction, callback)
  // LEFT/RIGHT = next/prev document
  // UP = drill into sub-cards (FAR, BOQ, Phases, Journal, Activity)
  // DOWN = back to list
```

**Gesture impl:**
- `pointerdown` → record start x,y
- `pointermove` → translate card, opacity fade at edges
- `pointerup` → if dx > 80px → swipe left/right. If dy > 80px → drill/back.
  Else snap back (CSS transition 200ms).
- Threshold: 80px or 30% of card width, whichever is smaller.

**Card HTML:** Generated by `erp_panel.js` using `CategoryLoader.renderLabel`
and doc metadata. swipe.js is dumb — it just moves DOM nodes.

**Offline:** Pure DOM manipulation. No fetch.

### File 3: `erp_panel.js` (~150 lines)

Renders document cards from DB data. Connects role filtering.

**API:**
```javascript
ERPPanel.init(db)
  // §ERP_PANEL init
  // 1. DocEngine.ensureTables(db)
  // 2. RoleBand.init(db, headerEl)
  // 3. Load documents from db, filter by role scope
  // 4. Render cards via renderCard()
  // 5. SwipeStack.init(containerEl, cards, handleAction)

ERPPanel.renderCard(doc, role)
  // §ERP_PANEL renderCard doc=LEAD-1000000 role=LAND
  // Returns HTML string for one document card (§12 card anatomy)
  // Reads doc metadata, DEV_PLAN metadata, document_lines
  // Filters confidential_fields if role scope = 'no_owner'
  // Action buttons from CategoryLoader.getCategory(container.category).actions
  // Filtered by role_modes (readonly = no action buttons)

ERPPanel.handleAction(docId, action)
  // §ERP_PANEL action doc=LEAD-1000000 action=approve
  // Maps action string → ConstructionHandlers function
  // Calls handler → refreshes card → plays status transition animation
```

**Role filtering:**
```javascript
// On 'role-changed' event:
// 1. Read role_scopes[role] from project_metadata
// 2. If scope = 'no_owner': strip confidential_fields from card rendering
// 3. If scope = 'approved_only': filter docs to doc_status = 'COMPLETED'
// 4. If scope = 'far': show only FAR-related fields
// 5. If scope = 'boq': show only BOQ-related fields
// 6. If mode = 'readonly': hide action buttons
// 7. SwipeStack.setCards(filtered)
```

**Status colours:**
```javascript
var STATUS_COLOURS = {
  DRAFT: '#888',           // grey
  IN_PROGRESS: '#ff9800',  // amber
  COMPLETED: '#4caf50',    // green
  VOIDED: '#f44336',       // red
  REVERSED: '#9c27b0'      // purple
};
```

**Offline:** Reads db in memory. No fetch.

### File 4: `erp.html` (~80 lines)

Standalone shell. Loads sql.js + ERP modules. No Three.js.

```html
<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Spatial ERP — Construction</title>
  <style>
    /* Dark theme: #1e1e1e bg, #eee text, system-ui font */
    /* Card: #2a2a2a bg, #444 border, 12px radius */
    /* Role band: fixed top, 48px height, role colour bg at 15% opacity */
    /* Swipe container: fills remaining viewport */
    /* Action buttons: 44px min-height, role colour border */
  </style>
</head><body>
  <div id="role-band"></div>
  <div id="swipe-container"></div>
  <div id="status-bar"></div>
  <script src="lib/sql-wasm.js"></script>
  <script src="kernel_ops.js"></script>
  <script src="doc_engine.js"></script>
  <script src="category_loader.js"></script>
  <script src="handlers/construction.js"></script>
  <script src="role_band.js"></script>
  <script src="swipe.js"></script>
  <script src="erp_panel.js"></script>
  <script>
    // Init: load ?db= from URL or default construction seed
    // initSqlJs() → fetch db → ERPPanel.init(db)
    // Register SW for offline
  </script>
</body></html>
```

**DB loading** — same pattern as index.html:
1. Check IndexedDB cache first (offline-first)
2. If miss, fetch from OCI URL
3. On load: `DocEngine.ensureTables(db)` + `ERPPanel.init(db)`

**SW precache** — add to `sw.js` PRECACHE_ASSETS:
```javascript
'erp.html',
'doc_engine.js',
'category_loader.js',
'handlers/construction.js',
'role_band.js',
'swipe.js',
'erp_panel.js',
```

### P3 Test Plan

`tests/test_erp_ui.js` — Playwright spec (~40 tests):
- erp.html loads without Three.js (no WebGL context)
- Role band renders 6 roles with correct colours
- [<>] button cycles roles
- Card renders seed lead with correct fields
- Confidential fields hidden when role=SALE
- Action buttons hidden when mode=readonly
- Swipe left/right changes visible card
- Approve action transitions doc + refreshes card status colour
- Reject action transitions doc to VOIDED (red)
- Journal entries visible after COMPLETED
- Works offline (SW cached, no network)

---

## §13. Boundaries and Constraints

- **No server.** No iDempiere. No PostgreSQL. Browser only.
- **No redundant 3D scene in erp.html.** Document-centric only. Spatial = BIM OOTB.
- **[ERP] is just another toolbar icon.** Same pattern as [Measure]. Lazy-loaded.
- **erp.html is standalone.** For mobile/document-only users who don't need 3D.
- **IFC = the building.** Architect provides IFC → viewer imports → geometry links to container.
- **BOQ reuses existing engine.** `boq_charts.html` + `rates.js` already compute costs.
- **kernel_ops is primary.** Every mutation goes through commitOp.
- **§-tagged logging in every function.** This is the primary debug and verification tool.
- **Confidential fields filtered in UI, not enforced server-side.**
- **Handlers are stateless.** Read → compute → commitOp.
- **Mobile-first.** pointerup not click. Touch targets ≥ 44px.
- **Dark theme.** Consistent with BIM OOTB. No white backgrounds.
- **share.js reused.** Copy Link, WhatsApp, Email — same channels.
- **Never touch deploy/live/.**

---

## §14. What This Unlocks (Post-POC)

| Phase | What | Same core? |
|---|---|---|
| F&B domain | New seed .db: restaurant tables. New handlers. | Yes — same doc_engine.js |
| WMS domain | New seed .db: racks, bins, SKUs. | Yes — new handler only |
| Multi-project | Multiple leads/plots on one site. Portfolio view. | Yes — more containers |
| Cloud relay | Upload .db to OCI. Role-based QR links. | Yes — no code change |
| Full P2P | Lead → approve → PO → GR → Invoice → Payment | Yes — P2P handlers (§10b in spec) |
| iDempiere graduation | Export to C_Project, C_ProjectLine, M_Product | Data migration, not rewrite |

---

## §16. Gap Tracker — Honest Claims vs Open Problems

**Purpose:** This section tracks what is proven by tests and what remains
a claim without evidence. Every gap is a future work item. Close the gap
= write the test. No claim is valid until a test proves it.

### CLOSED gaps (proven by tests)

| # | Claim | Evidence | Closed |
|---|---|---|---|
| G1 | 5-table schema handles all doc_types | 100K docs, 3 doc_types, one `documents` table. `test_stress.js` S2a | 2026-05-13 |
| G2 | kernel_ops = event sourcing + undo | 1M ops inserted, GROUP BY in 0.4s. `test_stress.js` S4a/S5d | 2026-05-13 |
| G3 | Offline-first, no server | `erp.html` loads sql.js WASM, no fetch required. `test_erp_ui.js` T9 | 2026-05-13 |
| G4 | Journal auto-posts on COMPLETED | 1000 lifecycles, 2000 journal entries. `test_stress.js` S6a/S6b | 2026-05-13 |
| G5 | Journal reversal (vs SAP FB08) | `journalReverse()` posts counter-entries, net=0. `test_erp_ui.js` T19a-T19j | 2026-05-13 |
| G6 | Role-based field filtering | SALE hides owner, ARCH hides owner, MGMT sees all. `test_erp_ui.js` T8a-T8g | 2026-05-13 |
| G7 | Scale: 100K docs + 500K lines + 1M ops | 1.6M rows, 179MB, all queries < 1s. `test_stress.js` S1-S9 | 2026-05-13 |
| G8 | XSS safety | HTML-escaped `<script>` and `<img onerror>`. `test_erp_ui.js` T17 | 2026-05-13 |
| G9 | Recursive container hierarchy | 10K containers, 5 levels, CTE in 0.010s. `test_stress.js` S8b | 2026-05-13 |

### OPEN gaps (claims without evidence)

| # | Claim | What's missing | Effort | Priority |
|---|---|---|---|---|
| G10 | P2P lifecycle (PO→GR→Invoice→Payment) | No handlers, no seed data, no tests. SAP's 900 tables exist because P2P has 900 edge cases. | 2-3 sessions | HIGH — must prove `documents.doc_type` handles non-lead doc_types end-to-end |
| G11 | Multi-device sync | `.db` is a single file. Two offline edits = merge conflict. OCI is last-write-wins. Need: CRDT or op-merge strategy on `kernel_ops`. | Research + 2 sessions | HIGH — the offline demo is dishonest without this |
| G12 | Manufacturing BOM explosion | `containers` hierarchy handles spatial BOM (site→building→phase). Not proven for manufacturing BOM (product→assembly→component with qty per). | 1 session | MEDIUM — needs a manufacturing seed + handler |
| G13 | Multi-currency | `journal.debit`/`credit` are bare numbers. No currency column. No exchange rate table. SAP handles 200+ currencies. | 1 session | MEDIUM — add `currency` column + `exchange_rates` table |
| G14 | Audit compliance (SOX/IFRS) | Journal entries are immutable (no UPDATE/DELETE in code). But no constraint enforces it. No period close. No audit report. | 1 session | MEDIUM — add DB trigger or CHECK, period close handler |
| G15 | Browser memory at scale | Stress test runs in Node.js. 179MB DB in a phone browser may hit memory limits. Need: actual phone test with Chrome DevTools. | 1 hour | HIGH — film the phone test |
| G16 | AI agent integration | kernel_ops is a commit log an agent could read/write. But no agent exists. The "AI-native" claim is architecture, not product. | 2 sessions | LOW — nice to have, not core |
| G17 | Second domain (F&B/WMS) | Only construction domain proven. Same engine, but no restaurant.db or warehouse.db. One more domain closes "truly universal" claim. | 1 session | HIGH — the fastest way to prove universality |
| G18 | Real IFC ↔ ERP link | BOQ handler accepts manual `elements` array. Not yet tested with real IFC-extracted element data from `boq_charts.html`. | 1 session | MEDIUM — wire existing BOQ engine |

### How to close a gap

1. Write the spec section (§ number)
2. Write the handler/seed/module
3. Write the test (must name the gap: "Issue: G10 — PO→GR lifecycle")
4. Run the test, read the log
5. Move from OPEN to CLOSED in this table with date

---

## §17. Spatial UI — Data Globe (S257)

### Vision

Traditional ERP presents data as grids and forms. Spatial ERP presents data
as a **living constellation** — records are stars on a rotating globe, coloured
by status, sized by activity, connected by relationships. The user navigates
data the way a pilot navigates space: drag to orbit, zoom to focus, tap to drill.

This is not decoration. It is **information density without information overload**.
A traditional table view of 60 Business Partners shows 60 identical rows.
The globe shows — at a glance — which partners are active (bright cyan, front),
which are incomplete (amber, mid-sphere), which are archived (grey, behind).
The spatial layout *is* the dashboard.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  ad_graph.js (Canvas 2D, 60fps)                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Globe: Fibonacci sphere, perspective projection  │   │
│  │  Nodes: icon + label + glow, z-sorted             │   │
│  │  Edges: relationship lines, depth-faded            │   │
│  │  Input: drag=orbit, scroll=zoom, tap=fly+drill     │   │
│  │  Colour: status/freshness/completeness → spectrum  │   │
│  └──────────────────────────────────────────────────┘   │
│  Data source: any AD_Table via SQLite WASM              │
│  No Three.js dependency (Canvas 2D + math only)         │
└─────────────────────────────────────────────────────────┘
```

### Rendering pipeline

1. **Build**: Query table, classify each record by status (DocStatus,
   IsActive) + date freshness (Updated/Created) + field completeness.
   Score → 0..1 activity. Place on Fibonacci sphere — active at front.
2. **Project**: Each frame, apply globe rotation (rotX, rotY) to each
   node's sphere coords (sx, sy, sz). Perspective divide (focal=600).
   Produces screenX, screenY, screenScale, screenZ.
3. **Sort**: Painter's algorithm — draw far nodes first.
4. **Draw**: Per node — outer glow (radius proportional to activity),
   main disc (colour from classification), white core (for hot nodes),
   icon, label. Alpha fades with depth: front=1.0, back=0.04.
5. **Edges**: Lines between related nodes. Alpha fades with average
   depth. Full mesh for entity view (6-8 nodes), ring for records.

### Interaction model

| Input | Action |
|---|---|
| Drag | Orbit globe (rotY, rotX) |
| Release after drag | Momentum spin, friction decay 0.96 |
| Scroll / pinch | Zoom (adjust sphere radius) |
| Tap node | Fly-to-front (ease-in-out ~0.7s), then drill |
| Tap entity node | Drill → records globe for that table |
| Tap record node | Open window at that specific record |
| Tap empty space | Go back (entity → home) |
| ESC key | Go back |
| Long press | Open info panel (future) |

### Colour classification

| Colour | Meaning | Source |
|---|---|---|
| `#4fc3f7` cyan | Complete / approved / recently updated | DocStatus=CO/CL/AP or activity>0.75 |
| `#7bed9f` green | Active, well-filled | activity 0.55-0.75 |
| `#ffd93d` amber | Partial, older | activity 0.35-0.55 |
| `#ff7043` red | Draft / sparse / stale | DocStatus=DR or activity<0.35 |
| `#555` grey | Archived / inactive | IsActive=N |

Activity score = freshness(Updated date) × 0.4 + field_completeness × 0.6

### Entity icons (Canvas drawn, no images)

| Entity | Icon | Shape |
|---|---|---|
| C_BPartner | person | Head circle + shoulder arc |
| M_Product | product | Box with lid line |
| C_BPartner_Location | location | Map pin |
| M_ProductPrice | price | Circle with $ |
| M_Product_Category | category | Tag pentagon |
| AD_User | contact | Card + head |
| AD_* (system) | table | Grid rows |

### Proven by tests (S257)

- `GRAPH-1..9`: Node creation for both clients, entity drill, system view
- Nodes: 6 GardenWorld entities, 7 system entities, 18-55 records per entity
- Fly-to-front animation, ESC back, view stack

### What this enables (future)

- **3D upgrade**: Replace Canvas 2D with Three.js sprites + OrbitControls
  for true WebGL depth-of-field, bloom, particle trails
- **Live pulse**: kernel_ops commit log drives real-time node brightness —
  a record just edited glows brighter for 30 seconds then fades
- **Relationship edges from AD_Column FK metadata**: auto-detect which
  tables link to which, draw edges accordingly (not just ring/mesh)
- **Record images**: when Product or BPartner has an image URL, render
  it as a textured sprite instead of the icon
- **Mind map mode**: switch from globe to force-directed flat graph,
  drag nodes freely, pin them, group by category
- **Minority Report mode**: gesture-driven (webcam hand tracking) —
  grab a node, flick it to the side to archive, pull it forward to edit

---

## §15. Reference

- `docs/SpatialERP_OOTB.md` — full spec (schema, UX, architecture, P2P, market, **§12 Odoo strategic playbook**)
- `~/Downloads/Idempiere Construction ERP.pptx` — Sysnova source requirement
- `docs/BOMBasedCompilation.md` §1 — iDempiere entity mapping
- `deploy/dev/kernel_ops.js` — existing OpLog
- `deploy/dev/boq_charts.html` — existing BOQ/QTO engine
- `deploy/dev/rates.js` — existing rate templates
- `deploy/dev/share.js` — existing share mechanism
- `prompts/done/iDempiereOOTB.md` — the old approach (OSGi). Superseded.

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
