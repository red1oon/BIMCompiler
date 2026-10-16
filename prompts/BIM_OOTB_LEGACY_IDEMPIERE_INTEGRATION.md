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
