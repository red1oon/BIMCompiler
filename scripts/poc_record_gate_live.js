// W-RECORD-GATE-LIVE (T-0 item 4, prompts/RESUME_ERP_T0_TRUTH_MAINTENANCE.md) — prove the LIVE CRUD write
// path (crud_overlay.js commitCrud) now consults ad_access.js's gateRecord (canView AccessLevel + org/client
// scope, W-ACCESS-HARDEN-proven headless) before sealing an UPDATE, not just owner/CAS.
// CASES (real seed data, non-invent — c_bpartner spans multiple clients in ONE table, verified via sqlite
// before writing this witness; c_order was tried first but EVERY client-12 order fails an unrelated
// pre-existing beforeSave invariant, MOrder.warehouseMandatory — masking this gate, named not chased —
// c_bpartner has no ad_modelval hook at all, isolating exactly the new gate): logged in as GardenUser
// (role 1300103, client 13, orgs {1300011,1350000,1350001,1350007}):
//   REJECT — c_bpartner 1200001 "Gemini Furniture" belongs to client 12 (the Odoo-migrated tenant) — role
//            1300103's clients set is {13} only (buildRole: clients=[role.ad_client_id]) → gateRecord
//            returns wrong-client. The write must be blocked BEFORE the seal (toast, no §CRUD-PERSIST).
//   PASS   — c_bpartner 1300112 "Standard" belongs to client 13 (the role's OWN tenant) — same edit, same
//            role, must still commit (regression: the new gate must not block in-scope writes).
// Run: ERP_ROOT=/tmp/wt-uibridge/erp node scripts/poc_record_gate_live.js   (default ROOT=~/bim-ootb/erp)
const { chromium } = require(process.env.HOME + '/bim-ootb/tests/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.ERP_ROOT || path.join(process.env.HOME, 'bim-ootb', 'erp');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.db': 'application/octet-stream', '.wasm': 'application/wasm', '.css': 'text/css' };
const server = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/idempiere.html';
  fs.readFile(path.join(ROOT, p), (e, b) => {
    if (e) { r.writeHead(404); r.end('404'); return; }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); r.end(b);
  });
});
(async () => {
  await new Promise(r => server.listen(0, r)); const port = server.address().port;
  const br = await chromium.launch(); const pg = await br.newContext().then(c => c.newPage());
  const logs = [];
  pg.on('console', m => { const t = m.text(); if (t.indexOf('§CRUD-GATE') === 0 || t.indexOf('§CRUD-PERSIST') === 0 || t.indexOf('§ACTOR') === 0) { logs.push(t); console.log('  ' + t); } });
  pg.on('pageerror', e => console.log('ERR ' + String(e).slice(0, 160)));
  let pass = true; const fail = m => { pass = false; console.log('  ✗ ' + m); };

  // login=1300102 (exact numeric user id, not the "GardenUser" name substring): the seed carries TWO users
  // named "GardenUser" (102 unbanded/client 11/role 103, 1300102 banded/client 13/role 1300103) — a name
  // match picks the first (id 102) and lands on the WRONG role for this witness. 1300102's only active role
  // is 1300103, verified via sqlite before writing this witness.
  // window=123&record=1300112 (Business Partner "Standard", own client): a WARM-UP deep-link — idempiere.html
  // only registers a table's AD-folded CRUD spec (registerFolded) the first time its window renders
  // (buildForm/canInline), so window.__crud.update('c_bpartner',...) below would otherwise no-op
  // "not in crud_ops" on a fresh session (verified: a direct call with no prior navigation silently skips).
  // This landing record is IN scope (client 13) — the warm-up itself proves nothing about the gate.
  await pg.goto(`http://localhost:${port}/idempiere.html?login=1300102&window=123&record=1300112`, { waitUntil: 'networkidle' });
  await pg.waitForFunction(() => window.APP && window.APP.roleId === 1300103 && typeof window.APP.gateRecordFor === 'function', { timeout: 20000 });
  console.log('  logged in: ' + (logs.find(t => t.indexOf('§ACTOR') === 0) || '(no §ACTOR line)'));
  await pg.waitForTimeout(500);

  const editSave = async (id) => {
    logs.length = 0;
    await pg.evaluate((rid) => window.__crud.update('c_bpartner', rid), id);
    await pg.waitForSelector('#cfSave', { timeout: 15000 });
    const orig = await pg.$eval('[data-col="name2"]', e => e.value).catch(() => '');
    const nv = orig === 'record-gate-witness' ? 'record-gate-witness-2' : 'record-gate-witness';
    await pg.fill('[data-col="name2"]', nv);
    // c_bpartner's modal is tall (~140 fields, no scroll container) — #cfSave sits below the viewport and
    // Playwright's real-mouse click (even force:true) still requires an in-viewport target; dispatch the
    // click event directly instead (same handler crud_overlay.js:425 wired, no mouse simulation needed).
    await pg.$eval('#cfSave', e => e.click());
    await pg.waitForTimeout(500);
  };

  // ── REJECT: c_bpartner 1200001 "Gemini Furniture", client 12 (Odoo tenant) — outside role 1300103's client scope ──
  console.log('— REJECT case: c_bpartner 1200001 "Gemini Furniture" (client 12) — role 1300103 is client 13 only');
  await editSave(1200001);
  const rejectLine = logs.find(t => t.indexOf('§CRUD-GATE') === 0);
  console.log('  ' + (rejectLine || '(no §CRUD-GATE line)'));
  if (!rejectLine || rejectLine.indexOf('verdict=REJECT') < 0) fail('no REJECT verdict logged');
  if (rejectLine && rejectLine.indexOf('reason=wrong-client') < 0) fail('REJECT fired but wrong reason: ' + rejectLine);
  if (logs.some(t => t.indexOf('§CRUD-PERSIST') === 0)) fail('a commit happened despite the reject');
  // NOTE: the modal closes OPTIMISTICALLY right after applyOp() fires (saveForm:612-613 — the SAME timing
  // the pre-existing owner/CAS gate's REJECT rides; verified by reading the code, not asserted blind) — a
  // toast carries the real verdict, not a form-stays-open signal. Don't assert stillOpen here; the load-
  // bearing proof is no §CRUD-PERSIST + the REJECT reason, same convention poc_crud_ownergate.js uses.

  // ── PASS: c_bpartner 1300112 "Standard", client 13 (the role's own tenant) — same edit must still commit ──
  console.log('— PASS case: c_bpartner 1300112 "Standard" (client 13, own tenant) — must still commit');
  await editSave(1300112);
  const persistLine = logs.find(t => t.indexOf('§CRUD-PERSIST') === 0);
  console.log('  ' + (persistLine || '(no §CRUD-PERSIST line)'));
  if (!persistLine) fail('in-scope write did not commit — the new gate over-blocked');
  if (logs.some(t => t.indexOf('§CRUD-GATE') === 0 && t.indexOf('REJECT') > 0)) fail('the in-scope write was rejected by the new gate');

  console.log(pass
    ? '🟢 W-RECORD-GATE-LIVE PASS — commitCrud now consults gateRecordFor: out-of-client write REJECTED before the seal, in-scope write still commits'
    : '🔴 W-RECORD-GATE-LIVE FAIL');
  await br.close(); server.close(); process.exit(pass ? 0 : 2);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(1); });
