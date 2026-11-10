# ⚠ DO NOT REMOVE — Scope guard
# Scope: a LIGHT, REST-only bridge from the BIM OOTB viewer (any demo IFC, e.g. Hospital) to a REAL,
#   EXTERNAL, legacy classic iDempiere server (v12-class, ZK UI, Java/OSGi, its own Postgres) —
#   NOT bim-ootb's own browser-native idempiere.html renderer, which is what every sibling lane
#   (BIM_TO_PROJECT.md / BIM_ERP_FOLD.md / BIM_TO_ERP.md / BIM_EMBED_WINDOW_SESSION.md /
#   BIM_ERP_ROUNDTRIP_RETHINK.md) targets. Those lanes' fold ENGINE is reused verbatim; only the
#   persistence layer changes, from local sql.js writes to REST calls against a live host.
# NON-NEGOTIABLE: EXTRACT/COMPILE ONLY — never invent a phase/date/rate/line/product. Money+qty via
#   site/bigdecimal.js. Write footprint is LOCKED (§3) — do not add C_Order/PO/BPartner/GL writes
#   without a new explicit user decision. Spec-first; §-log first; read the log before conclusions.
#   EXPLICIT GO before touching any REAL server — everything here is DEMO-target until told otherwise.
# Read first: prompts/BIM_TO_PROJECT.md (the engine this reuses), viewer/find_erp_push.js +
#   viewer/proj_fold.js (the local fold this reworks the persistence of), docs/internal/
#   IDEMPIERE_RENDERER_SPEC.md (the pill-bar precedent §5 borrows), prompts/done/iDempiereOOTB.md
#   (SUPERSEDED heavier OSGi-plugin approach — kept for reference only, not the active plan).

---

# Integrate BIM OOTB/ERP to legacy iDempiere

> **SCOPE NOTE 2026-11-11 (so nobody reads §0 below as a ban on every Java plugin).** The 2026-09-09 rule "no Java OSGi plugin" is the rule for THIS lane: the PUSH bridge (BIM selection -> Project Order over REST). It stands. Separately, the **BIM Document** module (drawings and model files filed against a project, with revisions) IS a Java OSGi plugin on a real iDempiere, by the owner's ruling of 2026-11-11 (a 2Pack is metadata only; model classes, the document action and the processes live in the component's `src`): `iDempiereOOTB/org.idempiere.bimdocument/`, spec `ERP_IDEMPIERE_UX_PARITY.md` §BIMDOC-LEGACY, installed and witnessed on the local test instance. The CAPEX dashboard (TASK 1, bim-ootb `prompts/CAPEX_DASHBOARD.md` ▶ RESUME HERE) is neither: no plugin, read-only web-service types.

## §0 Why this lane, and why it's small

User directive (2026-09-09): keep it minimal — no Java OSGi plugin, no server-side build, no touching
a real client's production data yet. This is a **demo/showcase** lane: any existing IFC (Hospital etc.)
stands in for a real building. The existing browser-native engine (`proj_fold.js`, already witnessed —
[[project_bim_to_project]]) already knows how to derive a Project/Phase/Task/Line + cost fold from a
BIM selection. The ONLY new work is: (a) let that fold write to a REAL external iDempiere over its
stock REST webservices instead of a local sql.js copy, and (b) two small deep-links closing the loop
back to the viewer. Nothing about the viewer, the Modeller, or the fold math changes.

Kazi Farms' actual present state (no IFC yet, generic rate templates, Modeller still WIP) is
EXPLICITLY OUT OF SCOPE for this lane — see [[project_sysnova_kazifarms_bim_scoping]] for that
separate, real-client track. This lane proves the mechanism on a demo building.

## §1 The user journey (five steps, as dictated)

1. **Setup, local.** Unzip the BIM OOTB suite (curated from `bim-ootb` main — app code only, ~218MB
   uncompressed / ~64MB zipped, no test/dev/IFC-source bulk) onto any static web server — no database,
   no Java, no build step. Serve at `localhost/index.html` — no HTTPS cert needed, Service Workers
   allow plain `http://localhost` (only a real public domain would require HTTPS).
2. **Drop IFC — or pick a demo building.** The landing page (`index.html`) already fetches any
   catalog building (Hospital etc.) straight from the live OCI bucket (`index.html:466 _prodBase`) —
   confirmed 2026-09-09, this is why the zip does NOT need to bundle a demo building's DB. Needs
   outbound HTTPS from wherever the zip is hosted to `objectstorage.ap-kulai-2.oraclecloud.com`; a
   fully offline demo would instead need their own dropped IFC. Full existing Viewer capability
   applies unchanged either way (3D, Find panel, 4D/5D, Time Machine — nothing new here).
3. **Export to their ERP.** Find panel `› ERP` button — REWORKED to push over REST (§3) to a
   configured live iDempiere base URL, instead of the local OPFS/`ad_seed.db` copy.
4. **Examine their Project Order.** The `open ↗` deep-link REWORKED (§4) to open the REAL server's
   classic ZK window for that record — not `../erp/idempiere.html`.
5. **Their own Dashboard.** From iDempiere the user navigates, in their own existing UI, to whatever
   dashboard already reads their iDempiere data (for Kazi Farms specifically this is the live CAPEX
   PMO dashboard — [[project_sysnova_kazifarms_bim_scoping]] — but for THIS lane it's just "their
   dashboard," unspecified). **Reciprocal pill:** that dashboard gets one link/button back into the
   BIM OOTB viewer for the same project — mirrored on bim-ootb's own pill-bar pattern
   (`docs/internal/IDEMPIERE_RENDERER_SPEC.md` §2, `pills.json`/`pill_builder.js`) — "the same as our
   ERP red pill pick up at the viewer."

## §2 Component split — reuse / new / theirs

| Piece | Status | Owner |
|---|---|---|
| Viewer (3D, Find, 4D/5D, Time Machine) | REUSE, unchanged | already shipped |
| Fold math (phase/task/line/cost derivation) | REUSE, unchanged | `viewer/proj_fold.js` |
| Persistence: local sql.js write → REST call | NEW | this lane, §3 |
| `open ↗` deep-link target | NEW (small) | this lane, §4 |
| Viewer boot-param `?building=&record=` auto-load | NEW (small) | this lane, §4.2 |
| REST webservices enabled + reachable + CORS | THEIRS to confirm/toggle | §5 cheatsheet |
| Dashboard "BIM" pill/button | THEIRS to add | §5 cheatsheet |

## §3 REST push — the locked write footprint

Reuses `proj_fold.js`'s existing find-or-create sequence and idempotency (natural-key, 2nd run = +0),
swapping direct SQL for `ADInterface` REST calls (`create_data` / `query_data` / `update_data` —
`org.idempiere.webservices`, stock in any classic iDempiere, no plugin needed).

**Writes allowed (confirmed 2026-09-09):**
- `M_Product` / `M_Product_Category` — find-or-create, per IFC-type/BOQ line. New Product creation is
  explicitly ALLOWED for this demo ("we allow for injecting such data for now").
- `C_Project` → `C_ProjectPhase` → `C_ProjectTask` → `C_ProjectLine` — the Project Order, same shape
  `proj_fold.js` already builds locally.

**Writes excluded — do not add without a new explicit decision:**
- `C_BPartner` creation (Project doesn't require one; skip entirely).
- `C_Order`/PO generation (proj_fold.js's local version has this gated on a supplier — OFF here).
- Any GL/Fact_Acct posting.

**Wire contract — verified from real iDempiere source, not assumed** (`org.idempiere.webservices`
`ModelADService.java` + `idempiere-schema.xsd`, `~/idempiere-dev-setup`):
- Base URL: `<host>/ADInterface/services/rest/model_adservice/{create_data|query_data|update_data}`.
- **Stateless per-call auth, resolved** — no login/session step exists at this layer. Every call's
  body carries `ADLoginRequest{user,pass,lang,ClientID,RoleID,OrgID,WarehouseID,stage}` alongside the
  `ModelCRUD` payload; the server re-verifies it each request (`ModelADServiceImpl` re-reads
  `req.getModelCRUDRequest().getADLoginRequest()` in every method). So the only real "auth" decision
  is where these 7 fields are typed/stored client-side (Settings field vs prompt-once) — not a
  protocol choice.
- Request body per call: `ModelCRUDRequest{ ModelCRUD{serviceType,TableName,RecordID,Filter,Action
  (Create|Read|Update|Delete|CreateUpdate),DataRow{field[]}}, ADLoginRequest{...} }`; each `field` is
  `<field column="X"><val>Y</val></field>`. Response: `StandardResponse{IsError,RecordID,Error}` for
  create/update, `WindowTabData{DataSet{DataRow[]},RowCount,Success,Error}` for query.
- Use `application/xml` bodies, not JSON — the endpoint accepts both, but the JSON form is an
  XMLBeans→JSON auto-conversion with unverified attribute/element key conventions; XML is
  unambiguous straight from the XSD and removes a whole class of guesswork we can't test here.
- `serviceType` in each `ModelCRUD` must match the `WS_WebServiceType.Value` registered per §5 #2.

**Testing without a reachable real server:** verify against a small mock server that speaks the same
`ADInterface` JSON contract (asserts the right calls/payloads fire, right sequence, right idempotency)
— that is the extent of proof available here. Real verification happens once pointed at an actual box.

## §4 Deep-links (both directions)

### §4.1 Viewer → their iDempiere ("examine their Project Order")
Replace `find_erp_push.js`'s `../erp/idempiere.html?client=garden&window=130&record=<pid>` with the
classic ZK zoom-URL pattern against the configured live base URL:
```
<liveBaseUrl>/webui?Action=Zoom&AD_Window_ID=130&Record_ID=<pid>
```
(Verify exact param names against the target's `org.adempiere.ui.zk` zoom-URL handler before wiring —
pattern needs confirming against a real instance, not assumed.)

### §4.2 Their Dashboard → viewer ("the red pill")
Viewer gains a boot-time URL-param handler (does not exist today — check on start):
```
index.html?building=<name>&record=<C_Project_ID>
```
On presence, auto-load that building and skip the landing picker — mirrors the pill-bar's
"one URL, one destination" contract. This is the ONLY new viewer-side code this direction needs;
everything else in §4.2 is on their side (§5).

## §5 CHEATSHEET — What to touch in your iDempiere and Dashboard

Kept deliberately minimal — this is a showcase, not a hardening pass.

**On their iDempiere (legacy v12):**
1. Confirm `org.idempiere.webservices` is active (System Admin → System Info, or `felix:lb` in the
   OSGi console). It ships with core iDempiere — nothing to install.
2. **Register a `WS_WebServiceType` + field whitelist per table** (Window: "Web Service Type" /
   "Web Service Field Input") for `M_Product`, `M_Product_Category`, `C_Project`, `C_ProjectPhase`,
   `C_ProjectTask`, `C_ProjectLine` — one per table, whitelisting exactly the columns this push
   writes (§3). VERIFIED from `ModelADServiceImpl.scanFields`: an unregistered column throws
   `"Web service type X: input column Y not allowed"` — this is NOT optional, and it's real AD
   configuration work (no code), done once via the iDempiere UI.
3. One role/user with write access to those tables via webservices. Reuse an existing role for the
   demo; no new security model needed.
4. CORS: allow the origin the BIM OOTB viewer is served from, on whatever sits in front of the
   webservices servlet (iDempiere's own filter, or their reverse proxy). One header rule.
5. No schema change, no plugin install, no restart beyond applying #4.

**On their Dashboard:**
1. One button/pill on a Project's card, shown when it's BIM-linked (tag it "BIM: <building>",
   matching `proj_fold.js`'s existing naming convention).
2. Point it at `<viewer-url>/index.html?building=<name>&record=<C_Project_ID>` (§4.2), new tab.
3. Done — no data plumbing on their side, the viewer loads itself.

## §6 Explicitly out of scope for this lane
- Kazi Farms' real production data, their actual (missing) IFC, generic-vs-real rate templates —
  all deferred to [[project_sysnova_kazifarms_bim_scoping]].
- The Modeller / 2D-DXF-to-3D pipeline (still WIP per the SYSNOVA quote) — irrelevant here since the
  demo uses an existing IFC.
- Any Java OSGi plugin (`org.idempiere.bimootb`) — that path is SUPERSEDED by this REST-only approach
  for this lane; the plugin skeleton stays as-is, untouched, for whoever picks up the embedded-iframe
  UX separately.

## §7 Reference files
- `viewer/find_erp_push.js` — `_pushToErp`, `_ensureErpDb`, the `open ↗` link builder (§3/§4.1 target).
- `viewer/proj_fold.js` — `foldProjectOrder`, the fold math being retargeted, not rewritten.
- `docs/internal/IDEMPIERE_RENDERER_SPEC.md` §2 — the pill-bar precedent for §4.2.
- `prompts/done/iDempiereOOTB.md` §4/§6 — the original (unbuilt) REST-flow design; §6 auth pattern
  (session-token vs login) is the same open question as §3's here.
- [[project_bim_to_project]] · [[project_sysnova_kazifarms_bim_scoping]]

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*

## §8 PLUGIN RENEWAL — "Installing BIM to iDempiere" (owner 2026-11-03; spec, written before code)
**Owner, verbatim:** *"Even though the last film claims the Dashboard needs no plugin, the BIM Viewer export to ERP Project Order does need one. It supposedly done months ago. Recall and update it anew.
It be for another film 'Installing BIM to iDempiere'"* · and the same day: *"at the legacy side, all changes, add-on be following its convention ie as a plugin or migration script if there is no
processes"* · *"we do things adhoc as POC first, quick and dirty. But once proven or clearer, we evolve to convention"*.
**This reverses §0/§5/§6's "no plugin" for the INSTALL, not for the push.** The push stays the stock REST web services (`viewer/erp_rest_push.js`, PROVEN on the local pilot: bim-ootb
`prompts/CAPEX_DASHBOARD.md` §5.4 — HHS 302/302 rows MATCH). What §5 made an administrator do by hand (types + field whitelists, a role, a CORS rule, a dashboard link) is what the plugin ships.
**Recall — what exists (`iDempiereOOTB/org.idempiere.bimootb`, May 2026, never installed):** `BIMTabPanelFactory` (IADTabPanelFactory, OSGi DS) + `BIMTabPanel` (ADTabpanel + ZK Iframe, URL read from
`C_Project.Description`, postMessage writes `C_Project.Name`) + `migration/postgresql/202605010001_BIM_Tab.sql` (a "BIM" AD_Tab on window 130, AD_TabType 'BIM'). Spec: `prompts/done/iDempiereOOTB.md`.
**Measured in the iDempiere 13 source (`~/idempiere-dev-setup/idempiere`):**
- Plugin data convention = `Bundle-Activator: org.adempiere.plugin.utils.Incremental2PackActivator` + `META-INF/2Pack_<version>.zip`, each applied once and recorded in `AD_Package_Imp`
  (`Incremental2PackActivator.java:105-135`). The 2Pack is made with iDempiere's own Pack Out from a configured instance.
- Web contexts = `Web-ContextPath:` in the bundle MANIFEST + `WEB-INF/web.xml` (as `org.idempiere.webservices` → `/ADInterface`, `org.adempiere.ui.zk` → `/webui`).
- WS types: `AD_Client_ID IN (0,?)` (`AbstractService.java:240`, IDEMPIERE-3394) — System-level types serve every tenant. Access: the login role OR a role it includes (`:72-75`, `AD_Role_Included`);
  `AD_Role.IsMasterRole` exists (pilot: 0 master roles today).
- No CORS support anywhere in `org.idempiere.webservices` — hence same-origin below.
**The renewed plugin `org.idempiere.bimootb` 13.1.0 — four parts:**
- **P1 setup data as a 2Pack** (`META-INF/2Pack_13.1.0.zip`, Pack Out from the local pilot of what is already PROVEN there): the push's System-level WS types (read + create per table:
  C_Project, C_ProjectPhase, C_ProjectTask, C_ProjectLine, M_Product, M_Product_Category, C_UOM — today client-11 ad-hoc rows from bim-ootb `capex/tools/ws_capex_{readtypes,writetypes}.sql`) +
  one System master role "BIM OOTB Push" holding all their access + the BIM AD_Tab (the May migration's row moves into the 2Pack: one install mechanism). The CAPEX dashboard's own rows (PA measure,
  its read types) are a SEPARATE module and stay out.
- **P2 the viewer, same origin:** `Web-ContextPath: bimootb` serving the app-only viewer (as the 2026-09-09 SYSNOVA zip: no building bulk; buildings stream as today). The push then calls
  `/ADInterface` on its own origin — no CORS rule, no proxy. The viewer's push base URL defaults to its own origin when served under `/bimootb`.
- **P3 the BIM tab, renewed:** iframe → `/bimootb/viewer/viewer.html?db=<C_Project.Description "BIM src db=">&record=<C_Project_ID>` (the link-back §ZOOM_LINKBACK already stores;
  `config.js` reads `db` + `record` — the `building=` form of §4.2 is the landing page's). No URL typed by hand.
- **P4 the admin's whole job:** drop the jar in `plugins/` (or Felix console), restart; include "BIM OOTB Push" in the push user's role (one record). Nothing else.
**Witness W-PLUGIN-INSTALL (on a pilot WITHOUT the ad-hoc types — a fresh copy, never the shared pilot DB):** before/after: bundle ACTIVE (felix `lb`), `AD_Package_Imp` row org.idempiere.bimootb 13.1.0
"Completed successfully", the WS types present at client 0, the master role + its access rows, the BIM tab on window 130; `GET /bimootb/viewer/viewer.html` 200; then the HHS push from that origin →
`shed_twin.js` PASS with no cheatsheet step done by hand. Negative: without the role include → the push is refused ("Login role does not have access …"). Uninstall recipe stated.
**Build order:** (1) Pack Out on the pilot (types re-made at client 0 first, on a COPY) · (2) bundle: POC = `javac` against the pilot's own `plugins/*.jar` + `jar` (quick and dirty, owner's staging);
convention = the Tycho/Maven build `pom.xml` already in the skeleton · (3) a fresh pilot copy (second DB + server port) · (4) install + W-PLUGIN-INSTALL · (5) film storyboard (bim-compiler
`prompts/FILM_NARRATION.md` PLAYBOOK) — ⛔ not recorded until the owner OKs the storyboard.

### §8.1 RESULT 2026-11-03 — P3 tab renewed; P1 setup rows PROVEN on the local pilot (POC stage); logs read (scratch, not committed)
- **P3:** `BIMTabPanel.java` renewed (viewer = SysConfig `BIMOOTB_VIEWER_URL`, default `/bimootb/viewer/viewer.html`; db = the push link-back `BIM src db=` in Description, else
  `BIMOOTB_BUILDINGS_BASE` + Value + `_extracted.db`; iframe `?db=&record=&embedded=true` — the viewer reads all three, `viewer/config.js:28-35`). Compiles: `javac --release 17` against the pilot's
  `plugins/` jars (org.adempiere.base, org.adempiere.ui.zk dir bundle, zk/zul/zcommon/zweb) = exit 0. The May skeleton compiled too, unchanged.
- **Found:** AD_TabType (reference 200117) lists only FORM, SORT — the May tab's 'BIM' was never a registered value; `Extensions.java:395-412` routes custom types through IADTabPanelFactory,
  so the fix is a list entry `BIM` (EntityType U), shipped in the 2Pack. Tab 200500 already exists on the pilot and in `pilot_snap` (the May migration reached their source DB).
- **P1 POC** `iDempiereOOTB/org.idempiere.bimootb/tools/bimootb_setup_poc.sql` (pilot only, idempotent): 14 System-level types `BIMOOTB_Query_<T>` / `BIMOOTB_Create_<T>` cloned from the
  push types the CAPEX twin proved (whitelists the same size: C_Project 7 in / 48 out … M_Product 67 / 69), master role "BIM OOTB Push" (client 0, IsMasterRole=Y) with 14 access rows,
  SysConfig ×2, AD_Ref_List 'BIM'. Pilot before→after: types BIMOOTB_* 0→14, ws access 515→529, master roles 0→1, sysconfig 0→2, AD_TabType list 2→3.
- **Proof (fixture `tools/bimootb_test_role_poc.sql`: role "BIM Push Test" 1200003 for GardenAdmin, includes 102 only):** bim-ootb `capex/tools/shed_twin.js` with `BRIDGE_SVC=bimootb BRIDGE_ROLE=1200003`
  on a scratch HHS fold (Value HHS_PLUGIN_POC, fresh UUs) → refused: `Login role does not have access to the service type 'BIMOOTB_Query_C_Project'` (negative, as `AbstractService.java:72-75`).
  Include "BIM OOTB Push" (1200002) → still refused until a server restart: the verdict is cached per (role, type) in `s_RoleAccessCache` (`:213`, 60 min) keyed to WS_WebServiceTypeAccess,
  not AD_Role_Included — **the install guide must say "restart or System Admin › Cache Reset after including the role".** After restart: `§SHED_PUSH projectId=1000009 created phases=6 tasks=16
  lines=45` · `§SHED_TWIN_VERDICT PASS tiles(match=16 diff=0 inconclusive=3) rows(match=302 diff=0)`.
- **Next:** Pack Out (AD_Process 50004, `org.adempiere.pipo2.PackOutProcess`: an AD_Package_Exp + Data detail lines → `<java.io.tmpdir>/packout<user>/<name>.zip`) of exactly these rows → the plugin's
  `META-INF/2Pack_13.1.0.zip`; P2 web context; bundle jar; install on a SECOND instance made from `pilot_snap` (CREATE DATABASE … TEMPLATE, own port) — deletes are refused here, so a clean DB is the
  only honest install test.

### §8.2 RESULT 2026-11-03 — the 2Pack made by iDempiere's own Pack Out; logs read
- `tools/bimootb_packout_poc.sql` (pilot only): AD_Package_Exp "org.idempiere.bimootb" 13.1.0 (#1000000), five Data lines (role; types `;WS_WebService_Para;WS_WebServiceFieldInput;
  WS_WebServiceFieldOutput;WS_WebServiceTypeAccess`; SysConfig; the AD_TabType value; the tab) + a System runProcess type for AD_Process 50004.
- Run via stock `run_process` as SuperUser: role 0 is refused ("role not allowed for this user" — role 0 RoleType `SS`; WS accepts only NULL/`WS`, `AbstractService.java:70`) → the bridge lane's
  System WS role 1200001. `§PACKOUT ok=true summary="Exported=5 File=/tmp/packout100/org.idempiere.bimootb.zip"` (19,131 bytes).
- Content == the pilot rows: AD_Role 1 · WS_WebServiceType 14 · WS_WebService_Para 49 (7×4 query + 7×3 create) · FieldInput 124 (7+11+8+5+7+67+19) · FieldOutput 232 (48+31+27+20+18+69+19) ·
  TypeAccess 14 · AD_SysConfig 2 · AD_Ref_List 1 · AD_Tab 1; the Pack Out helper type is NOT in it (0).
- Plugin: `META-INF/2Pack_13.1.0.zip` = that file; MANIFEST 13.1.0, `Bundle-Activator: org.adempiere.plugin.utils.Incremental2PackActivator`, `Require-Bundle … org.adempiere.plugin.utils`;
  `Bundle-ActivationPolicy: lazy` REMOVED (lazy would apply the 2Pack only when a class first loads = the first BIM-tab open, not at install).
- **Next:** P2 (web context + the viewer files — assembled at build time from bim-ootb, never committed here), the bundle jar, the second instance from `pilot_snap`, W-PLUGIN-INSTALL.

### §8.3 RESULT + FINDING 2026-11-03 — bundle built, installed on a clean instance; legacy REFUSED the 2Pack on a real rule; logs read
- **P2 + bundle:** `Web-ContextPath: bimootb`, `Jetty-Environment: ee8`, `Eclipse-BundleShape: dir` (as `org.idempiere.webservices`), `WEB-INF/web.xml` (javaee 4.0 header as org.adempiere.ui.zk's).
  `tools/build_bundle_poc.sh` (javac + copy; the viewer set is a RULE: viewer/ minus tests/ and buildings/, plus every `../erp|common|modeller|capex/` file the viewer code references, minus
  `erp/idempiere.html`; the service worker's PRECACHE list is NOT the app — it lacks the lazy Find bundle and erp_rest_push.js): `§BIMOOTB_BUNDLE files=523 viewer=501 siblings=22 bytes=80,126,282 classes=3`.
- **Clean instance:** `~/idempiere-bimplugin` (copy of the pilot server; DB `idempiere_bimplugin` = `CREATE DATABASE … TEMPLATE pilot_snap`; :8098/:8454; its own stop.sh pattern — the copied one
  matched `[i]dempiere-pilot` and would have stopped the MAIN pilot: fixed before first start). Installed by one `bundles.info` line. Before: BIMOOTB types 0, master role 0, sysconfig 0.
- **The activator ran the 2Pack at start** (`Incremental2PackActivator.packIn: Installing org.idempiere.bimootb /META-INF/2Pack_13.1.0.zip`) and legacy refused it, all-or-nothing
  (types still 0; AD_Package_Imp "Import Failed"): `MWebServicePara.saveError: Type Free not allowed for parameter Filter (security issue)` — `MWebServicePara.beforeSave :114-121`, IDEMPIERE-1784.
- **What it means (bigger than the plugin):** every query type we made by SQL on the pilot (CAPEX `ws_capex_readtypes.sql`, `ws_capex_writetypes.sql` QueryCUOM, `ws_capex_patypes.sql`, the bridge
  lane's, and the BIMOOTB clones) carries a FREE `Filter` parameter that iDempiere forbids when the type is made the proper way (window or 2Pack). The push's find-or-create
  (`viewer/erp_rest_push.js findOrCreate` → `<Filter>Value='…'</Filter>`) and the twin tools' reads depend on it. The pilot accepted it only because SQL skipped the model's save rule.
- **iDempiere's own safe way (source):** `ModelADServiceImpl.queryData :1495-1512` — every DataRow field the query type whitelists as an INPUT field becomes a bound condition (`col LIKE ?` for
  CHAR columns, `col=?` otherwise); a `Filter` param may only be Constant (`validateParameter :307-338`) and is parsed with `@…@` from the request (`:1515-1516`).
- **FIX SPEC (next, before any code):** (1) `erp_rest_push.findOrCreate` finds by DataRow key fields (`{column, val}` natural key: Value / Name / parent id / product / task) — no Filter;
  ⚠ CHAR keys go through `LIKE ?`, so `_` and `%` in a key are wildcards: the client then keeps only rows whose key EQUALS the value (exact post-filter, logged if a LIKE extra was dropped);
  (2) query types: no Filter param; their key columns whitelisted as INPUT fields; (3) the mock in `tests/poc_erp_rest_push.js` enforces both rules (refuses a Free Filter type, binds DataRow keys)
  so it can no longer pass what legacy refuses; (4) re-make the pilot types the proper way (POC SQL → then through the model: a 2Pack PackIn on the pilot itself proves the rows pass the model), re-run
  the CAPEX twins (HHS, SHED) green, re-Pack-Out, re-install on the clean instance → W-PLUGIN-INSTALL; (5) the CAPEX read path (`adapters.loadLegacy`, `shed_twin legacyQuery`) moves to DataRow keys too.

### §8.4 RESULT 2026-11-03 — W-PLUGIN-INSTALL on a clean instance: PASS (push side); logs read
- **Fix landed first:** bim-ootb #2558 (lookups by DataRow key fields, no Filter; pilot query types' Filter → Constant `1=1`, keys whitelisted) + here `tools/bimootb_setup_poc.sql` the same for the 7
  BIMOOTB_ query types (pilot: free Filter 7→0, key inputs 0→11). Pilot push through the plugin types (role 1200003): `created +0`, `§SHED_TWIN_VERDICT PASS rows(match=302 diff=0)`.
- **2Pack re-made by Pack Out:** `Exported=5`; Filter params 7, free 0, all Constant `1=1`; FieldInput 135 (= 124 + 11 keys); the rest unchanged.
- **Two bundles (layout change):** a web bundle that `Require-Bundle`s org.adempiere.ui.zk failed to start its context (`ClassNotFoundException: org.idempiere.ui.zk.websocket.ServerPushEndPoint` — Jetty's
  websocket initialiser found ZK's endpoint through the dependency; `metadata-complete="true"` did not help). So, as iDempiere separates them: `org.idempiere.bimootb` = tab classes + 2Pack (requires ZK);
  `org.idempiere.bimootb.viewer` = static `/bimootb` (requires nothing; `Web-ContextPath`, `Jetty-Environment: ee8`, `Eclipse-BundleShape: dir`). `tools/build_bundle_poc.sh` builds both
  (`files=522 viewer=500 siblings=22 bytes=79,749,521 classes=3`).
- **Clean instance** (`idempiere_bimplugin` = TEMPLATE pilot_snap, :8098), install = 2 `bundles.info` lines + restart. `Incremental2PackActivator.packIn: … 2Pack_13.1.0.zip installed`; AD_Package_Imp 13.1.0
  "Completed successfully" (the earlier "Import Failed" row stays as history). After: BIMOOTB types 14, their inputs 135, access 14, master role 1, SysConfig 2, AD_TabType list 3 (was 0/0/0/0/0/2).
  `GET /bimootb/viewer/viewer.html` 200 text/html · `erp_rest_push.js` 200 text/javascript · `/bimootb/erp/ad_seed.db` 200 (27,193,344 bytes) · `sql-wasm.wasm` 200 application/wasm.
- **Push, the admin's one step:** role 102 without the include → `Login role does not have access to the service type 'BIMOOTB_Query_C_Project'`, 0 projects. Include "BIM OOTB Push" (here id 1000009)
  in 102 + restart → `§SHED_PUSH projectId=1000001 created={"categories":3,"products":19,"projects":1,"phases":6,"tasks":16,"lines":45,"uoms":2}`; legacy == the SQLite fold: PlannedAmt 4996320.807 both,
  6/16/45 both, the six phase dates identical (2026-11-01 → 2026-12-24 = the 4D programme).
- **Not judged here:** the twin's tiles/rows step stops at `Service type QueryCProjectPhase not configured` — those read types are the CAPEX DASHBOARD module's (bim-ootb `capex/`), not this plugin's;
  the clean instance has only the plugin, as intended. A dashboard module 2Pack is that lane's job. Also not done: the BIM tab opened in ZK (needs a browser), the film storyboard.
- **Install guide facts (for the film):** drop 2 folders in `plugins/` + 2 `bundles.info` lines (or Felix install) → restart → include "BIM OOTB Push" in the pushing user's role → restart or Cache Reset.

## §8.5 FILM STORYBOARD v1 — "Installing BIM to iDempiere" (owner 2026-11-03: "It be for another film 'Installing BIM to iDempiere'") — ⛔ DO NOT RECORD until the owner OKs this storyboard
**Layout:** bim-compiler `prompts/FILM_NARRATION.md` ▶ PLAYBOOK C (before/after in the first 25 s; show, then prove; one real event; roadmap card "not built yet"; plain silent chapter cards 3.6 s;
no persistent tags; bottom 230 px empty; F asks, M answers in plain words). Addendum rule: **the product AS SHIPPED** — nothing fixed while preparing is a story beat (the Free-Filter and two-bundle
findings of §8.3/§8.4 are NOT in the film). Every number from a `§` line of the RECORDING run, not from this table. Test servers only, said on screen ("test server", GardenWorld demo data).
| # | beat (~s) | picture | voice (EN draft) | facts from the run |
|---|---|---|---|---|
| T | 0-4 | title card (dual colour): "Installing BIM to iDempiere" | — | — |
| 1 | 4-25 | BEFORE: a stock iDempiere test server, Project window, no BIM anywhere + a plain card of the old checklist (web-service types, field lists, a role, a CORS rule, a link: "five jobs by hand") → AFTER: the same server with the plugin: the viewer opens at `/bimootb` | F: "Can my iDempiere take a building model?" M: "Before: five setup jobs by hand. After: one plugin, the way iDempiere installs its own packs." | the §5 cheatsheet items; `GET /bimootb/viewer/viewer.html 200` |
| C1 | card | "One plugin · the iDempiere way" | — | — |
| 2 | 25-45 | plain card: two folders → "BIM tab + setup pack" / "the viewer"; inside the pack: N web-service types, one role, settings | M: "Inside: a setup pack made by iDempiere's own Pack Out, and the viewer itself — served by your iDempiere, so nothing else to host." | 2Pack content counts (§8.4 style) |
| 3 | 45-70 | the install: 2 folders + 2 lines, restart (terminal card) → the server log line "… installed" → iDempiere's Pack In record "Completed successfully" (ZK) | F: "How long does it take?" M: "Copy two folders, add two lines, restart." | `Incremental2PackActivator … installed`; AD_Package_Imp status |
| 4 | 70-90 | the ONE admin step: Role window › Included Roles › "BIM OOTB Push" (ZK); then restart / Cache Reset; the refusal message if skipped, shown once | F: "And if I forget that step?" M: "Then the push is politely refused — it says which access is missing." | the refusal text; the include row |
| C2 | card | "From model to Project Order" | — | — |
| 5 | 90-120 | the viewer at `/bimootb` (same server): an office building (HHS, 6,839 elements) → its 4D programme → Find › ERP → **the order lands in iDempiere's Project window** (phases, tasks, lines) | M: "The model brings its own programme: about eight weeks [from the run], six phases. One click, and the Project Order is in iDempiere — typed by nobody." | `§SHED_PUSH created …`, the phase dates, PlannedAmt (example rates, editable) |
| 6 | 120-135 | proof, side by side A/B: the model's numbers vs iDempiere's (amount, counts, six dates) | F: "Is it exactly the same?" M: "Same amount, same 45 lines, same dates — checked, not eyeballed." | fold vs legacy compare lines |
| 7 | 135-148 | the BIM tab in that Project opens the same model, for that project | M: "And from the project, the BIM tab opens its model." | `§BIM_TAB C_Project_ID=… db=…` (server log) |
| R | card | Roadmap · not built yet: the standard Maven build; the CAPEX dashboard as its own pack; a link back from the viewer to the iDempiere window | — | — |
| E | end card | sponsor SYSNOVA UK/Bangladesh · RED1's vision · built with Claude Code + GitHub guardrails · WITNESSed · MIT | — | — |
**⛔ PREREQUISITES before recording (each a spec + witness, none built):**
- **P5 — the viewer's own push to iDempiere (beat 5 is NOT possible today):** Find › ERP folds into the viewer's local ERP store only; `viewer/erp_rest_push.js` is not loaded by `viewer.html`, and the
  plan builder (fold rows → `{phases, tasks, lines, …}`) lives only in the node tool `capex/tools/shed_twin.js`. Needed: (a) the plan builder moved into ONE shared module the viewer and the tool both
  use; (b) when the viewer runs under `/bimootb` (or a configured iDempiere base URL), Find › ERP folds locally as today THEN pushes that plan to the server it came from with the plugin's
  `BIMOOTB_*` types, logged `§PROJ_PUSH_LEGACY …`; credentials: the logged-in iDempiere user's own (never a stored password) — ⛔ how the viewer gets them inside the ZK session is the open design
  question (read iDempiere's session/token options in source before proposing); (c) witness = the same compare as §8.4 from the viewer's code path.
- **P7 — the BIM tab opened for real** (ZK headless, software GL): `§BIM_TAB` line + the iframe URL loading the viewer for that project's DB.
- ZK screenshots by headless Chrome `--disable-gpu` against the TEST instance only (:8098) — the owner's go for the recording.
**Open for the owner:** OK this storyboard · build P5 first (it is the film's core beat) · language set (EN first, then the PLAYBOOK set?).

## §8.6 SPEC P5 — the viewer's own Find › ERP push lands in iDempiere (owner 2026-11-03: "Build P5 first") — written before code
**Measured:** Find › ERP (`viewer/find_erp_push.js _pushToErp`) folds into the viewer's local ERP store only; `viewer/erp_rest_push.js` is not loaded by `viewer.html`; the plan builder (fold rows →
`{building, name, fields, phases:[{tasks, lines}]}`) exists only inline in `capex/tools/shed_twin.js`. Stock web services take user + password on EVERY call (`ADLoginRequest` = user, pass, lang,
ClientID, RoleID, OrgID, WarehouseID, stage — no token; `AbstractService.java:118-121` `Login.getClients(user, pass, …)`); a ZK session cannot be reused by the WS servlet.
**Decision (A — stock):** the viewer asks for the user's own iDempiere password ONCE per tab, keeps it in memory only (never localStorage/IndexedDB/URL/log), and pushes through the plugin's
`BIMOOTB_*` types exactly as the proven node path. The BIM tab passes the NON-secret login context from the ZK session (`erpUser`, `erpClient`, `erpRole`, `erpOrg`, `erpWarehouse` URL params,
from `Env.getCtx()`), so inside the tab only the password is asked. (B, not built: hand the plan to the tab's Java side over the existing postMessage bridge and write it with the ZK session — no
second sign-in, but a second push implementation; kept as an option.)
**Build (bim-ootb):**
1. `viewer/erp_push_plan.js` (UMD, browser + node): `planFromDb(db, projectValue)` → `{plan, notes}` — MOVED from `shed_twin.js` (sql.js API only), plus `bimootbServiceTypes()` (the
   `BIMOOTB_Query_/Create_<Table>` map of `shed_twin`'s `BRIDGE_SVC=bimootb`). `shed_twin.js` calls both; its inline copies go (deletion budget stated in the PR).
2. Target: `A.LEGACY_ERP = { base }` — `location.origin` when the viewer is served under `/bimootb/`, else a `?erp=<base>` param (http(s)://localhost or https only); none → today's behaviour,
   logged `§PROJ_PUSH_LEGACY skip=no-target`.
3. After the local fold succeeds, `_pushToErp` builds the plan from the SAME store (`planFromDb(db, building)`), asks for the password if not in memory (a small viewer dialog; user/client/role/org
   prefilled from the URL params, editable when absent), then `ErpRestPush.pushProjectOrder({baseUrl, login, serviceTypes: bimootbServiceTypes()}, plan)`. Logs
   `§PROJ_PUSH_LEGACY base=… project=… projectId=… created=…` / `§PROJ_PUSH_LEGACY_ERR …` (never the password); status text + the existing sfx. A refused login clears the remembered password.
4. `viewer.html` loads `erp_rest_push.js` + `erp_push_plan.js`; `sw.js` precaches both + version bump.
**Witness W-VIEWER-PUSH-LEGACY (headless node, the REAL `_pushToErp` as `capex/tests/witness_find_push_4d.js` drives it; the dialog stubbed to return a password; target = the local pilot, role
"BIM Push Test"):** a NEW project Value → legacy == the local fold (PlannedAmt, phase/task/line counts, the six phase dates); a 2nd push `created +0`; no target → `skip=no-target` and no WS call;
a wrong password → refused, 0 rows created, the message shown, password forgotten; the password string never appears in any captured log line. Break: `BREAK=1` expects one more line → FAIL.
Regression: `witness_find_push_4d`, `poc_erp_rest_push`, the HHS + SHED twins (`shed_twin.js` now on the shared builder) PASS +0.
**Plugin side (bim-compiler, this lane):** `BIMTabPanel` adds the five `erp*` params from `Env.getCtx()`; rebuild + reinstall on the test instance.

### §8.7 RESULT 2026-11-03 — P5 built: the viewer's own push lands in iDempiere; logs read
- **bim-ootb #2561 (merged):** `viewer/erp_push_plan.js` (`planFromDb`, `bimootbServiceTypes`, `legacyTarget`) — the plan builder MOVED from `capex/tools/shed_twin.js` (−25/+4 there); `A.LEGACY_ERP`
  (+ `A.LEGACY_ERP_CTX` = the five `erp*` params); `find_erp_push._pushLegacy` after the local fold (password in a closure only, scrubbed from every log string, forgotten on any failure);
  viewer.html loads both modules; sw v1676. W-VIEWER-PUSH-LEGACY on the pilot `PASS judged=24 fail=0` (BREAK=1 → FAIL); regressions unchanged (W-FP4D 5/5, poc_erp_rest_push PASS, W-FOLD1 11/11,
  HHS twin 302/302 +0, SHED twin 109/109 +0) — bim-ootb `prompts/CAPEX_DASHBOARD.md §5.10`.
- **Here:** `BIMTabPanel.erpLoginParams()` passes `erpUser/erpClient/erpRole/erpOrg/erpWarehouse` from `Env.getCtx()` (Env.java:77-125); compiles (javac 17 vs the pilot jars).
- **Clean instance (plugin only, :8098), both bundles rebuilt from bim-ootb e3ef3a85:** `/bimootb/viewer/viewer.html` 200 and loads `erp_push_plan.js` + `erp_rest_push.js`; served `find_erp_push.js` has
  `_pushLegacy`. The SAME witness pointed at it (`PILOT_BASE=http://localhost:8098`, role 102 = GardenWorld Admin with "BIM OOTB Push" included; a temp copy with only the role id as env, not
  committed): `§PROJ_PUSH_LEGACY base=http://localhost:8098 … projectId=1000002 created={…"projects":1,"phases":6,"tasks":16,"lines":45}` → 2nd push `+0` → `skip=no-target` → `skip=no-credentials`
  → `§W_VPL_VERDICT PASS judged=24 fail=0`.
- **Still needs a browser (owner's go, headless Chrome `--disable-gpu`, test instance only):** the shipped password dialog (`_askLoginDom`); the viewer opened AT `/bimootb` (same origin, the target rule
  `served under /bimootb/ → location.origin`); the BIM tab in ZK (P7 / film beat 7). Then the film recording itself (§8.5, owner OK of the storyboard pending).

### §8.8 RESULT 2026-11-03 — the browser checks (owner "Go"; headless Chrome, software GL `--use-gl=swiftshader`, TEST instance :8098 only); logs read
- **Browser flags:** `--disable-gpu` turns WebGL OFF in this Chrome ("GL_VENDOR = Disabled") and the viewer's renderer fails before boot; the project's film tool flags (`--use-gl=swiftshader
  --disable-gpu-sandbox`, + `--enable-unsafe-swiftshader`) give software WebGL with no GPU — use those.
- **Found + fixed — the bundle was missing files:** the page 404'd 21 `../hr_bim_asset/*.js`; the build's sibling rule named four folders → now ANY `../<dir>/` the viewer references (minus `buildings/`
  and `erp/idempiere.html`): `files=546 viewer=500 siblings=46`, 0 misses. Also a build-script slip: the loop's last `[ -f ] && echo` was false → `set -e` ended the script BEFORE the copy (a bundle of
  only META-INF/WEB-INF shipped once, 404 at `/bimootb`) — now `if … fi`, and the build line `§BIMOOTB_BUNDLE` must print.
- **B1 PASS:** at `/bimootb/viewer/viewer.html` `APP.LEGACY_ERP = {"base":"http://localhost:8098","via":"served"}`, ErpPushPlan/ErpRestPush/ProjFold present, `LEGACY_ERP_CTX` from the URL. (The viewer's
  own boot-time building load does not finish headless — the SAME on a plain static server of the same checkout, so not the bundle; the check loads the building with the page's own sql.js.)
- **B2 PASS after a real fix:** first run refused by legacy (`null value in column "c_taxcategory_id"`: the viewer's store opened without the ERP's boot overlays) → bim-ootb #2563 (CAPEX §5.11).
  Then the REAL dialog: prefilled read-only `User=GardenAdmin | Client ID=11 | Role ID=102 | Org ID=11 | Warehouse ID=103`, password typed, `§PROJ_PUSH_LEGACY base=http://localhost:8098 … projectId=1000003`,
  legacy == local fold (7 phases / 10 tasks / 16 lines, 383827.36788 — the find-or-create also resumed cleanly after the earlier partial failure), dialog removed, password in 0 of 697 log lines.
- **B3 NOT PASSED — two findings:** (1) opening the Project window threw `org/zkoss/zk/ui/event/EventListener` (NoClassDefFound): the tab bundle required org.adempiere.ui.zk but not ZK itself →
  now `Require-Bundle … zcommon, zk, zul, zweb` (10.0.1), as iDempiere's own org.idempiere.printformat.editor does; the error is gone. (2) The BIM tab is still not in the window: no element named
  "BIM" exists; level-0 peers are listed in the breadcrumb popup (`CompositeADTabbox.java:815-835`). The May tab has **0 AD_Field rows**, so even shown it could not read Value/Description
  (`GridTable.createSelectSql :376` builds no SELECT without fields). **Next:** give tab 200500 its fields through the dictionary (key C_Project_ID hidden, Value, Name, Description read-only),
  re-Pack-Out, reinstall, re-run B3 — and push the link-back Description (`BIM src db=`) with the plan so the tab opens a building that exists (today legacy Description stays empty → the tab would use
  `BIMOOTB_BUILDINGS_BASE` + Value, a file the bundle does not carry).

## §8.9 ▶ RESUME (2026-11-03, end of session) — this lane = TASK 2 only
**Owner:** the plugin is ONLY for the BIM Viewer → ERP Project Order; the CAPEX dashboard is TASK 1, built separately on our SQLite WASM framework (bim-ootb `prompts/CAPEX_DASHBOARD.md` ▶ RESUME HERE,
§5.13). Shared resume, machine state and landmines: that RESUME block. **Next here:** B3 (§8.8 — tab 200500 gets its AD_Field rows; the push carries the link-back Description; re-Pack-Out; reinstall on
`~/idempiere-bimplugin`; re-run B3 headless), then the film storyboard §8.5 (⛔ owner OK + language set). **Film wording (owner correction):** the plugin IS needed for the push; what needs no change is
iDempiere's code and tables — never say "nothing to install".
