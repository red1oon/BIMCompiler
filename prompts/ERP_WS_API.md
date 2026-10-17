# ⚠ DO NOT REMOVE — scope: offer the Kernel ERP through the SAME web-service API as legacy iDempiere (ADInterface), so existing integrations - AI ones included - work by changing the base URL; plus the published "prompt advisory" for users. READ THE LOG after every run. Spec first: nothing below is built yet.
Started 2026-10-17 on the owner's word ("offer ours with such WS API as legacy has it ... we publish a doc for users that can easily take that and becomes a 'prompt advisory'" - "Agree").

## 1. Rules this lives under
- **TWIN CARDINAL RULE:** same operations, same results, same books. A request that legacy accepts must give the same records/status/postings here; one legacy refuses is refused here. Divergence is fixed on our side.
- **One write path:** every write is the model's `.save()` / `processIt()` then ONE signed op group (`erp/model_layer.js`, `crud_overlay` commit). The API adds NO write logic (ERP_FRIENDLY_OPS_LENS.md §8 integrity contract applies: `§EVENT_SEQ` of an API call equals the UI gesture's).
- **No AI inside the runtime.** An AI is an integrator calling the API like any other; its calls carry its own delegated identity. Nothing AI-related is added to the engine (positioning, project_positioning_no_ai_inside).
- **Local-first / no server of record:** the service is a headless Node instance of the same kernel (the engine every witness already runs), holding and verifying its own signed history. A browser page cannot accept inbound calls, so it is not the host.
- **AD-LAYER LAW:** type rows, column whitelist and role access are read from the dictionary (`ws_webservicetype`, `ws_webservicefieldinput`, `ws_webservicetypeaccess`), never a per-table list in code.

## 2. The legacy contract to match (read before building; cite file:line when each op is ported)
Source: `~/idempiere-dev-setup/idempiere/org.idempiere.webservices` (`ModelADServiceImpl`) and the REST plugin `org.idempiere.rest.api`. Operations: `create_data`, `update_data`, `read_data`, `query_data`, `delete_data`, `create_update_data`, `set_docaction`, `run_process`, `get_list`, `get_attachment`... Access: login -> role/client/org -> per-service `WS_WebServiceType` row (method, table, filter) + `WS_WebServiceFieldInput` whitelist + `WS_WebServiceTypeAccess` role grant. The pilot already drives it: `scripts/pilot/pilot_ref.js` (post `create_data` ... `parseStd`), `pilot_ws_setup.js` (type rows ids 900000+). Owner authorisation 2026-10-13: new WS type rows in the PILOT copy may be injected without asking.

## 3. Build order (each slice: spec line -> port -> witness RED-first -> mark done)
1. **S1 SOAP ADInterface, read side:** login (role/client/org) + `query_data` + `read_data` + `get_list`. Witness W-WS-DIFF-READ: the SAME requests sent to real iDempiere (pilot) and to ours; diff the response records and error texts. 
2. **S2 write side:** `create_data`, `update_data`, `delete_data`, `create_update_data` via `.save()`; refusals (whitelist, role, validators) identical. W-WS-DIFF-WRITE reuses `pilot_ref.js` scenarios (c2..c7 under `scripts/pilot/scenarios`) pointed at our endpoint: records, DocStatus, `fact_acct` equal; `§EVENT_SEQ` equal to the UI path.
3. **S3 `set_docaction` + `run_process`:** only processes that have a verbatim port (`erp/processes/*.js`); an unported one answers like legacy would for a missing class, never a faked success.
4. **S4 REST face (JSON), the AI-friendly door:** the idempiere-rest paths (`/api/v1/auth/tokens`, `/models/{table}`, `/processes/{slug}`...) over the same engine; token = a delegated key tied to role+client. Same witnesses against the REST plugin on the pilot if it is installed there, else against the SOAP results.
5. **S5 delegated-identity keys + audit:** every op group carries the caller's actor; revoke = key off; the op-log shows who wrote what.
Verdicts print `INCONCLUSIVE`, never PASS, when a diff compared zero records or a path was not exercised.

## 4. The "prompt advisory" (user doc)
`docs/ERP_AI_ADVISORY.md`, published through `scripts/safe_gh_deploy.sh` (never bare `mkdocs gh-deploy`). Contents: how to connect (URL, login, key); each operation with the exact request/response taken from a witness run; safety rules for the AI (read first, propose drafts not completes unless told, honour the column whitelist, report a refusal verbatim, never invent ids/document numbers); a paste-in prompt block with placeholders; 3-4 worked recipes (summarise open invoices, draft a PO from an email, reconcile a payment list) each with the calls and what the AI must NOT do; stated limits (same API as legacy iDempiere; no AI inside). **The doc cannot lie:** every snippet in it is executed by a witness against a running instance (`W-WS-ADVISORY`); a snippet that stops working turns the witness red. Written only after S2.

## 5. Coordination
Touches the shared write path read-only. New files only: `erp/ws_server.js` (headless host), `erp/ws_adinterface.js`, `scripts/ws/*`. Tell the ERP-depth session (`bim-compiler-fc`, owns model_layer/model_post/crud_overlay `_resolveOpRefs`) before S2; do not edit those files from this lane.

## 6. Status
- [x] Spec (this file).
- [ ] S1 .. S5, advisory doc. Open question already answered by owner: SOAP first (the pilot driver speaks it, so the diff witness is nearly free), REST on top.
