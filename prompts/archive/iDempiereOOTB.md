/**
 * BIM OOTB — Frictionless BIM. Two DBs. One browser. Zero install.
 * Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
 * SPDX-License-Identifier: MIT
 */

# ⚠ DO NOT REMOVE — Scope guard
# Scope: iDempiere OSGi plugin that launches BIM OOTB HTML viewer
#        inside a ZK UI tab and creates C_OOTB records from IFC drop.
# Read the log after every run. Exit code is not evidence.
# Spec-first: implement only what is described in a § section below.

---

# iDempiere OOTB Plugin — BIM OOTB in ZK Tab

## Context: iDempiere ZK UI Architecture (studied from source)

This prompt was written with direct analysis of the iDempiere codebase at
`/home/red1/idempiere-dev-setup/idempiere/`. Key findings that inform this design:

### ZK Embedding capability
ZK supports `org.zkoss.zul.Iframe` and `org.zkoss.zul.Html` components.
From `TabbedDesktop.java:207`:
```java
Iframe iframe = new Iframe(url);
addWin(iframe, title, closeable);
```
From `DashboardController.java:833`:
```java
Iframe iframe = new Iframe();
iframe.setSclass("dashboard-report-iframe");
iframe.setContent(media);
```
This is how BIM OOTB viewer is hosted inside iDempiere — as a ZK Iframe tab
in the AD_Window, or as a standalone ZK Form (AD_Form).

### AD Metadata (Application Dictionary)
Every window, tab, field is driven by:
```
AD_Window → AD_Tab → AD_Field → AD_Column → AD_Table
```
Key classes: `MWindow`, `MTab`, `MField`, `GridField`, `WebEditorFactory`
The plugin must register its own AD_Window (C_OOTB) via migration SQL.

### REST layer (existing, usable)
`org.idempiere.webservices` exposes JAX-RS at:
```
POST /ADInterface/services/rest/model_adservice/create_data
POST /ADInterface/services/rest/model_adservice/query_data
POST /ADInterface/services/rest/model_adservice/read_data
```
The HTML viewer communicates back to iDempiere via these endpoints.
Authentication: existing ADLoginRequest XML/JSON pattern.

### OSGi Plugin structure
New bundle: `org.idempiere.bimootb`
```
org.idempiere.bimootb/
├── META-INF/MANIFEST.MF          (OSGi bundle header)
├── OSGI-INF/
│   └── bimootb.xml               (DS component declaration)
├── WEB-INF/
│   ├── web.xml                   (servlet config)
│   └── src/org/idempiere/bimootb/
│       ├── BIMOOTBActivator.java  (bundle activator)
│       ├── BIMOOTBForm.java       (ZK Form — hosts the Iframe)
│       └── BIMOOTBServlet.java    (serves static BIM OOTB HTML)
├── web/
│   ├── bimootb.html              (BIM OOTB viewer — adapted)
│   └── bimootb.js                (viewer JS — adapted from deploy/dev/)
└── migration/
    └── 202601010001_C_OOTB.sql   (table + AD registration)
```

---

## §1. Data Model — C_OOTB Table

### §1.1 Table definition

```sql
-- migration/202601010001_C_OOTB.sql
-- APPEND ONLY — never modify existing migrations

CREATE TABLE C_OOTB (
    C_OOTB_ID        NUMERIC(10)  NOT NULL,
    AD_Client_ID     NUMERIC(10)  NOT NULL,
    AD_Org_ID        NUMERIC(10)  NOT NULL,
    IsActive         CHAR(1)      NOT NULL DEFAULT 'Y',
    Created          TIMESTAMP    NOT NULL DEFAULT NOW(),
    CreatedBy        NUMERIC(10)  NOT NULL,
    Updated          TIMESTAMP    NOT NULL DEFAULT NOW(),
    UpdatedBy        NUMERIC(10)  NOT NULL,

    -- Identity
    Name             VARCHAR(120) NOT NULL,         -- IFC filename or user label
    Description      VARCHAR(255),

    -- IFC source
    IFC_FileName     VARCHAR(255),                  -- original filename dropped
    IFC_FileSize     NUMERIC(10),                   -- bytes
    IFC_Schema       VARCHAR(20),                   -- IFC2X3, IFC4, IFC4X3

    -- BIM DB references (stored in IndexedDB; record points to the key)
    BIM_DB_Key       VARCHAR(255),                  -- IndexedDB key for output.db
    BIM_Library_Key  VARCHAR(255),                  -- IndexedDB key for library.db
    Element_Count    NUMERIC(10),                   -- total elements extracted
    Storey_Count     NUMERIC(5),

    -- ERP linkage
    C_BPartner_ID    NUMERIC(10),                   -- owner / client
    C_Project_ID     NUMERIC(10),                   -- linked project
    M_Product_ID     NUMERIC(10),                   -- primary product / building type

    -- Status
    Status           CHAR(2) NOT NULL DEFAULT 'DR', -- DR=Draft, PR=Processing, AC=Active, CL=Closed

    CONSTRAINT C_OOTB_PK PRIMARY KEY (C_OOTB_ID)
);

-- AD_Sequence
INSERT INTO AD_Sequence (AD_Sequence_ID, AD_Client_ID, AD_Org_ID, IsActive,
    Created, CreatedBy, Updated, UpdatedBy, Name, Description,
    VFormat, IncrementNo, StartNo, CurrentNext, CurrentNextSys, IsTableID)
VALUES (nextval('AD_Sequence_Seq'), 0, 0, 'Y', NOW(), 100, NOW(), 100,
    'C_OOTB', 'BIM OOTB Model Record', NULL, 1, 1000000, 1000000, 50000, 'Y');
```

### §1.2 AD_Window registration

```sql
-- Register C_OOTB as an AD_Window so it appears in iDempiere menu
-- (use Application Dictionary → Window, Tabs & Fields in iDempiere UI
--  or insert directly — follow iDempiere migration conventions)

-- Minimal: one window, one tab, key fields visible
-- Full field list mirrors C_OOTB columns above
-- DisplayLogic on BIM_DB_Key: @Status@='AC'  (only show when active)
```

---

## §2. OSGi Bundle — BIMOOTBForm.java

### §2.1 Purpose

A ZK AD_Form that opens as a tab in iDempiere's tabbed desktop.
It renders an `<Iframe>` pointing to `bimootb.html` served by `BIMOOTBServlet`.
Context (current C_OOTB_ID, AD_Session token) is passed as URL parameters.

### §2.2 BIMOOTBForm.java spec

```java
/*
 * BIM Intent Compiler — DAGCompiler Pipeline
 * Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
 * SPDX-License-Identifier: MIT
 */
package org.idempiere.bimootb;

// Extends AbstractADWindowContent pattern from ZK source study:
// org.adempiere.ui.zk/WEB-INF/src/org/adempiere/webui/adwindow/ADWindowContent.java

public class BIMOOTBForm extends AbstractForm {
    // § FORM_INIT
    // Build an Iframe pointing to:
    //   /bimootb/bimootb.html?session={ADSession}&record={C_OOTB_ID}&mode={mode}
    // mode = "viewer"  — show existing model
    // mode = "import"  — show drop zone for new IFC
    //
    // Iframe fills 100% of available tab space
    // No ZK components needed beyond the Iframe wrapper

    // § FORM_POSTMESSAGE_LISTENER
    // Listen for window.postMessage from the iframe:
    //   { type: "OOTB_RECORD_CREATED", C_OOTB_ID: 123456 }
    //   { type: "OOTB_STATUS_UPDATE",  status: "AC", elementCount: 122456 }
    // On OOTB_RECORD_CREATED: refresh the C_OOTB AD_Window tab
    // On OOTB_STATUS_UPDATE:  update status bar
}
```

### §2.3 MANIFEST.MF

```
Bundle-SymbolicName: org.idempiere.bimootb
Bundle-Version: 1.0.0
Bundle-Activator: org.idempiere.bimootb.BIMOOTBActivator
Web-ContextPath: bimootb
Require-Bundle: org.adempiere.ui.zk,
 org.adempiere.base,
 org.idempiere.webservices
```

---

## §3. BIM OOTB HTML Viewer — bimootb.html

### §3.1 Adaptation from deploy/dev/index.html

The existing BIM OOTB viewer (`deploy/dev/index.html`) is adapted for
iDempiere embedding. Key changes:

```
1. URL parameter handling:
   const params = new URLSearchParams(location.search)
   const sessionToken = params.get('session')   // iDempiere AD session
   const recordId     = params.get('record')    // C_OOTB_ID (null = new import)
   const mode         = params.get('mode')      // 'viewer' | 'import'

2. IFC drop creates C_OOTB record via REST:
   POST /ADInterface/services/rest/model_adservice/create_data
   TableName: C_OOTB
   Fields: Name, IFC_FileName, IFC_FileSize, IFC_Schema, Status='PR'

3. After extraction completes, update the record:
   POST .../update_data
   Fields: BIM_DB_Key, Element_Count, Storey_Count, Status='AC'

4. Populate C_BPartner, M_Product from extracted IFC metadata:
   IfcSite.Name       → lookup C_BPartner by name → set C_BPartner_ID
   IfcBuilding.Name   → lookup M_Product by name  → set M_Product_ID
   (use query_data to search; if not found, create new)

5. PostMessage back to ZK parent:
   window.parent.postMessage({ type: 'OOTB_RECORD_CREATED',
                                C_OOTB_ID: newId }, '*')
```

### §3.2 IFC metadata extraction for ERP linkage

From `import_worker.js` (already proven in S220):
```javascript
// § IFC_META_EXTRACT
// After web-ifc parses the IFC file:
const sites    = webIfc.GetLineIDsWithType(modelID, WebIFC.IFCSITE)
const buildings= webIfc.GetLineIDsWithType(modelID, WebIFC.IFCBUILDING)
const siteName = getStringAttr(sites[0],     'Name')   // → C_BPartner
const bldgName = getStringAttr(buildings[0], 'Name')   // → M_Product
const schema   = webIfc.GetModelSchema(modelID)         // IFC2X3/IFC4
const elCount  = webIfc.GetAllLines(modelID).size()
```

---

## §4. ERP Data Flow — IFC Drop → C_OOTB → C_BPartner → M_Product

### §4.1 Sequence

```
User opens BIM OOTB Form in iDempiere
   ↓ mode=import
Browser shows IFC drop zone (existing deploy/dev UI)
   ↓ user drops residential_project.ifc
import_worker.js parses IFC via web-ifc (S220 proven)
   ↓ § IFC_META_EXTRACT
Extract: IfcSite.Name="Kazi Farm", IfcBuilding.Name="Block A", schema=IFC4
   ↓ § CREATE_OOTB_RECORD
POST create_data → C_OOTB { Name="Block A", Status='PR', IFC_FileName=... }
→ returns C_OOTB_ID = 1001234
   ↓ § LOOKUP_OR_CREATE_BPARTNER
POST query_data → C_BPartner WHERE Name ILIKE '%Kazi Farm%'
→ found: C_BPartner_ID = 50678
→ not found: POST create_data → C_BPartner { Name="Kazi Farm" }
   ↓ § LOOKUP_OR_CREATE_PRODUCT
POST query_data → M_Product WHERE Name ILIKE '%Block A%' AND M_Product_Category.Name='Building'
→ found or created
   ↓ § LOOKUP_OR_CREATE_CATEGORY
M_Product_Category: 'Building', 'Residential', 'Commercial', 'Industrial'
derived from IfcBuilding.ObjectType or IfcProject.Name prefix
   ↓
Extraction runs (existing import_worker.js pipeline)
   ↓ § UPDATE_OOTB_RECORD
POST update_data → C_OOTB {
    C_BPartner_ID, M_Product_ID,
    BIM_DB_Key, Element_Count, Storey_Count,
    Status='AC'
}
   ↓ § POSTMESSAGE_DONE
window.parent.postMessage({ type:'OOTB_RECORD_CREATED', C_OOTB_ID:1001234 })
   ↓
ZK parent refreshes C_OOTB AD_Window — user sees new record
```

### §4.2 M_Product_Category mapping

| IFC attribute | M_Product_Category | Notes |
|---|---|---|
| IfcBuilding.ObjectType contains 'Residential' | Residential Building | |
| IfcBuilding.ObjectType contains 'Commercial' | Commercial Building | |
| IfcBuilding.ObjectType contains 'Industrial' | Industrial Building | |
| IfcBuilding.ObjectType contains 'Hospital' | Healthcare Building | |
| None of above | Building | fallback |

---

## §5. C_OOTB AD_Window — Key Fields

The iDempiere window for C_OOTB has two tabs:

**Tab 1: Model Info**
```
Name            (String, required)
Status          (List — AD_Ref_List: DR/PR/AC/CL)
IFC_FileName    (String, readonly after save)
IFC_Schema      (String, readonly)
Element_Count   (Integer, readonly)
Storey_Count    (Integer, readonly)
C_BPartner_ID   (Search — Info BPartner panel)
C_Project_ID    (Search — Info Project panel)
M_Product_ID    (Search — Info Product panel)
```

**Tab 2: BIM Viewer** (custom ZK tab)
```
BIMOOTBForm iframe — mode=viewer, loads the 3D model
Links to C_OOTB_ID — shows the stored BIM_DB_Key model
```

Button: **Open BIM Viewer** — launches BIMOOTBForm in a new desktop tab
Button: **Re-import IFC** — re-opens drop zone for this record (mode=import&record=ID)

---

## §6. REST Authentication Pattern

The HTML viewer authenticates to iDempiere REST using the session cookie
passed as a URL parameter. The existing `ADLoginRequest` pattern from
`CompiereService.java` is reused:

```javascript
// § REST_AUTH
// Option A (preferred): pass existing ZK session token via URL param
// ZK parent injects: ?session=<AD_Session.WebSession>
// Viewer adds to every REST call header: X-AD-Session: <token>

// Option B (fallback): user enters credentials in a mini login form
// POST /ADInterface/services/rest/model_adservice/login
// { UserName, Password, ClientID, RoleID, OrgID }
// Returns session token for subsequent calls
```

---

## §7. Implementation Order

Follow spec-first rule — implement in this order, one § at a time:

| Order | Section | Deliverable | Verify |
|---|---|---|---|
| 1 | §1.1 | C_OOTB table migration SQL | `psql -c "\d C_OOTB"` |
| 2 | §1.2 | AD_Window registration | Appears in iDempiere menu |
| 3 | §2.3 | OSGi bundle manifest + activator | Bundle starts in Felix console |
| 4 | §2.2 | BIMOOTBForm.java — Iframe only | Tab opens, shows blank page |
| 5 | §3.1 | bimootb.html URL param handling | `?mode=import` shows drop zone |
| 6 | §4.1 steps 1-3 | IFC drop → create_data → C_OOTB | Record appears in DB |
| 7 | §4.1 steps 4-5 | C_BPartner + M_Product lookup/create | Linked in C_OOTB record |
| 8 | §4.1 steps 6-7 | Extraction runs + update_data | Status='AC', counts populated |
| 9 | §4.1 step 8 | postMessage → ZK refresh | Window refreshes to new record |
| 10 | §5 | BIM Viewer tab | 3D model loads from BIM_DB_Key |

---

## §8. Known constraints and boundaries

- **Never touch deploy/sandbox/** — production. All dev work to deploy/dev/ only.
- The ZK iframe boundary means: viewer JS cannot call ZK Java directly.
  All communication is via postMessage (viewer→ZK) and URL params (ZK→viewer).
- `BIM_DB_Key` stores the IndexedDB key used in the browser's local storage.
  It is a string pointer, not the DB content itself — the DB lives in the browser.
  For server-side persistence, a future step exports the SQLite DB to a file server.
- iDempiere REST requires authentication — the session token approach (§6 Option A)
  is cleaner than re-login, but depends on ZK parent injecting the token correctly.
- M_Product creation should check for duplicates by Name + Category before creating.
  Use `query_data` with exact match first, fuzzy match second.
- IFC_Schema detection: use `webIfc.GetModelSchema(modelID)` from web-ifc.
  Values: 'IFC2X3', 'IFC4', 'IFC4X3' — store verbatim in C_OOTB.IFC_Schema.

---

## §9. Reference files

- `deploy/dev/index.html` — BIM OOTB viewer (adapt for embedding)
- `deploy/dev/import_worker.js` — IFC extraction pipeline (reuse §IFC_META_EXTRACT)
- `deploy/dev/scene.js` — blobToGeometry() — core rendering pipeline
- `deploy/dev/main.js` — viewer orchestration
- `/home/red1/idempiere-dev-setup/idempiere/org.adempiere.ui.zk/WEB-INF/src/org/adempiere/webui/desktop/TabbedDesktop.java` — Iframe tab pattern
- `/home/red1/idempiere-dev-setup/idempiere/org.adempiere.ui.zk/WEB-INF/src/org/adempiere/webui/desktop/DashboardController.java` — Iframe content pattern
- `/home/red1/idempiere-dev-setup/idempiere/org.idempiere.webservices/WEB-INF/src/org/idempiere/adinterface/ModelADServiceImpl.java` — REST CRUD implementation
- `internal/NewUI_iDempiere.md` — full iDempiere SPA architecture analysis
- `internal/licensing.md` — IP position and valuation context

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
