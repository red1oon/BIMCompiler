// ⚠ DO NOT REMOVE -- SD-00 witness (prompts/SQLiteIDEMPIERE.md §SHOPDAY-RUN-1 R1.2-R1.4). READ THE LOG: §SD00_* lines; exit code is not evidence.
//  §SD00_LOGIN   normal-user WS login for the new client + negative control (a role without access is refused)            [R1.4]
//  §SD00_CROSS   template extracted from legacy client A, instantiated with the facts of client B, vs legacy's REAL client B,
//                id-free row multisets per table (the determinism proof: the SQLite side == a legacy run for facts it never saw)  [R1.2]
//  §SD00_WS      the SQLite shop db built from the template vs the stock WS read path (dict_diff natural keys, as the new admin)    [R1.3]
//  §SD00_NEG     a corrupted cell + a deleted row in a scratch copy are both detected by the cross compare
//  §SD00_VERDICT PASS only if judged>0, no diff, negative control flipped; DIFF otherwise; INCONCLUSIVE when nothing judged (never PASS on empty)
// Needs both throwaway clients on the pilot (shopday_sd00_legacy.js, SHOPDAY_FACTS=2 for the second).
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const Database = require('better-sqlite3');
const ad = require('./ad_client'), D = require('./dict_diff'), F = require('./shopday_facts'), T = require('./client_template');
const specs = require('./dict_spec_sd00.json');
const log = console.log;
const login = (role, user, cid) => { const c = ad.cfgFromEnv(); c.login = { user, pass: user, lang: 'en_US', ClientID: cid, RoleID: role, OrgID: cid, WarehouseID: cid, stage: 0 }; return c; };
const idOf = name => { const r = T.pg(`select ad_client_id from ad_client where name='${name}'`)[0]; return r ? +r : null; };
(async () => {
  let bad = 0, judged = 0;
  const idA = idOf(F.SETS[1].name), idB = idOf(F.SETS[2].name);
  if (!idA || !idB) { log(`§SD00_VERDICT INCONCLUSIVE (clients missing on legacy: A=${idA} B=${idB})`); process.exit(1); }
  const ids = F.resolveIds();   // target client = F.client (set 1 unless SHOPDAY_CLIENT overrides the name)
  // R1.4 login + negative control
  const cfg = login(ids.adminRoleId, F.adminUser, ids.clientId);
  let nUser = 0, negOk = false;
  try { nUser = (await ad.query(cfg, 'QueryCDocType', 'C_DocType_ID>0')).length; } catch (e) { log('§SD00_LOGIN admin FAIL ' + e.message.slice(0, 120)); }
  try { await ad.query(login(ids.userRoleId, F.normalUser, ids.clientId), 'QueryCDocType', 'C_DocType_ID>0'); } catch (e) { negOk = /does not have access/.test(e.message); }
  const okL = nUser > 0 && negOk; if (!okL) bad++; judged++;
  log(`§SD00_LOGIN client=${ids.clientId} adminRole=${ids.adminRoleId} doctypes_visible=${nUser} negative_control_user_role_refused=${negOk} ${okL ? 'PASS' : 'FAIL'}`);
  // R1.2 cross
  const fA = F.templateFacts(1, idA), fB = F.templateFacts(2, idB);
  const tplA = T.extract(idA), tplB = T.extract(idB);
  const inst = T.instantiate(tplA, fA, fB);
  const DROP = /^(datelastrun|datenextrun|datepasswordchanged|datelastlogin)$/;   // run-time clocks (accounting processor, logins), not setup facts
  const cmp = T.compareTemplates(inst, tplB, DROP);
  log(`§SD00_FK unresolved_fk_columns=${cmp.unresolved.length} ${cmp.unresolved.join(',')}`);
  let tabBad = 0, tabs = 0, rows = 0;
  for (const r of cmp) {
    tabs++; rows += r.b || 0;
    const nb = (r.onlyLocal || []).length + (r.onlyLegacy || []).length + (r.only ? 1 : 0);
    if (nb) tabBad++;
    log(`§SD00_CROSS ${r.table} instantiated=${r.a} legacy=${r.b} onlyLocal=${(r.onlyLocal || []).length} onlyLegacy=${(r.onlyLegacy || []).length}${r.only ? ' only-' + r.only : ''} ${r.b === 0 ? 'VACUOUS' : nb ? 'DIFF' : 'SAME'}`);
    for (const x of (r.onlyLocal || []).slice(0, 3)) log(`§SD00_DIFF ${r.table} onlyLocal: ${x.slice(0, 400)}`);
    for (const x of (r.onlyLegacy || []).slice(0, 3)) log(`§SD00_DIFF ${r.table} onlyLegacy: ${x.slice(0, 400)}`);
  }
  judged += rows > 0 ? 1 : 0; if (tabBad) bad++;
  log(`§SD00_CROSS_SUMMARY tables=${tabs} diff_tables=${tabBad} legacy_rows=${rows} (A=${idA} ${fA.name} -> B=${idB} ${fB.name}) ${rows === 0 ? 'INCONCLUSIVE' : tabBad ? 'DIFF' : 'SAME'}`);
  // negative control on the cross compare
  { const c2 = JSON.parse(JSON.stringify(inst)); const t = c2.tables.c_doctype; t.rows[0][t.cols.findIndex(c => c.toLowerCase() === 'name')] += 'X'; c2.tables.c_period.rows.pop();
    const n2 = T.compareTemplates(c2, tplB, DROP).filter(r => (r.onlyLocal || []).length + (r.onlyLegacy || []).length).map(r => r.table);
    const ok = n2.includes('c_doctype') && n2.includes('c_period'); if (!ok) bad++; log(`§SD00_NEG corrupted c_doctype.name + dropped a c_period row => detected in [${n2.join(',')}] ${ok ? 'PASS' : 'FAIL'}`); }
  // R1.3 shop db (target client = A, the real one) vs stock WS reads
  const tplT = T.extract(ids.clientId), file = path.join(os.tmpdir(), `shopday-${process.pid}.db`); fs.rmSync(file, { force: true });
  const db = new Database(file); const nrows = T.fold(tplT, db);
  log(`§SD00_SHOPDB folded ${Object.keys(tplT.tables).length} tables ${nrows} rows -> ${file}`);
  let wsJudged = 0, wsDiff = 0;
  for (const sp of specs) {
    const ss = D.scopeSpec(sp, ids.clientId, { natural: true, newClient: true });
    try {
      const L = await D.discover(cfg, ss), r = D.compare(L, db, ss), nb = r.changed.length + r.onlyLegacy.length + r.onlyLocal.length + (r.missingCols || []).length;
      log(`§SD00_WS ${sp.table} legacy=${r.legacy} local=${r.local} changed=${r.changed.length} onlyLegacy=${r.onlyLegacy.length} onlyLocal=${r.onlyLocal.length} missingCols=${(r.missingCols || []).length} ${r.legacy === 0 ? 'VACUOUS' : nb ? 'DIFF' : 'SAME'}`);
      if (r.legacy === 0) continue; wsJudged++; if (nb) { wsDiff++; for (const c of r.changed.slice(0, 3)) log(`§SD00_DIFF ${sp.table} [${c.id}] ${c.col}: legacy=${JSON.stringify(c.legacy)} local=${JSON.stringify(c.local)}`); }
    } catch (e) { wsDiff++; log(`§SD00_WS ${sp.table} ERROR ${e.message.slice(0, 120)}`); }
  }
  judged += wsJudged ? 1 : 0; if (wsDiff) bad++;
  log(`§SD00_WS_SUMMARY tables=${specs.length} judged=${wsJudged} diff=${wsDiff}`);
  fs.rmSync(file, { force: true });
  log(`§SD00_VERDICT ${judged === 0 ? 'INCONCLUSIVE' : bad ? 'DIFF' : 'PASS'} parts_judged=${judged} parts_bad=${bad}`);
})().catch(e => { log('§SD00_VERDICT INCONCLUSIVE FAULT ' + e.stack.slice(0, 300)); process.exit(2); });
