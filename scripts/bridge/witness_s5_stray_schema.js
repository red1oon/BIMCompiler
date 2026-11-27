// ⚠ DO NOT REMOVE — one-shot S5 witness (spec §43): a stray ACTIVE accounting schema without product-category accounting. Legacy cannot complete an SO
// (MProduct.java:1066-1067 NPE via MOrder.java:1633-1637); SQLite must refuse too (named). Toggles the pilot through the recorded fixture files ONLY and
// ALWAYS restores (finally) + verifies the pilot completes a sale again. Not part of run_all (two server restarts). READ THE LOG.
'use strict';
const { execSync } = require('child_process'), path = require('path');
const log = l => console.log(l);
const HOME = process.env.HOME, PILOT = path.join(__dirname, 'pilot');
const sh = c => execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const psqlFile = f => sh(`docker exec -i postgres psql -U postgres -d idempiere_pilot -v ON_ERROR_STOP=1 < ${path.join(PILOT, f)}`);
const active = () => sh(`docker exec postgres psql -U postgres -d idempiere_pilot -Atc "set search_path=adempiere; select isactive from c_acctschema where c_acctschema_id=1009800"`).trim().split('\n').pop();
function restart() {
  try { sh(`${HOME}/idempiere-pilot/stop.sh`); } catch (e) { /* already down */ }
  sh('sleep 8'); try { sh(`${HOME}/idempiere-pilot/start.sh`); } catch (e) { }
  for (let i = 0; i < 60; i++) { let c = ''; try { c = sh("curl -s -o /dev/null -w '%{http_code}' http://localhost:8088/webui/"); } catch (e) { } if (c === '200') { sh('sleep 10'); return true; } sh('sleep 5'); }
  return false;
}
const m3 = () => sh(`M3_ONLY=S5 node ${path.join(__dirname, 'witness_m3_gap.js')}`);
const pick = (out, tag) => (out.split('\n').find(l => l.startsWith(tag)) || '').slice(0, 900);
let fails = 0; const out = (t, ok, m) => { log(`${t} ${ok ? 'PASS' : 'FAIL'} ${m}`); if (!ok) fails++; };
(async () => {
  let on = '';
  try {
    psqlFile('s5_schema_on.sql'); out('§S5_SETUP', active() === 'Y' && restart(), `schema 1009800 isactive=${active()} (server restarted)`);
    on = m3();
    log(pick(on, '§SCN S5')); log(pick(on, '§SCN_DETAIL S5'));
    const d = pick(on, '§SCN_DETAIL S5');
    out('§S5_LEGACY', /legacy=\{"outcome":"REJECTED"/.test(d), 'legacy cannot complete with the stray schema active');
    out('§S5_SQLITE', /sqlite=\{"outcome":"REJECTED","reason":"no-product-category-acct"/.test(d), 'SQLite refuses with the named reason');
    out('§S5_VERDICT', /^§SCN S5-\S+ MATCH/.test(pick(on, '§SCN S5')), 'same outcome on both sides');
  } finally {
    psqlFile('s5_schema_off.sql'); const r = restart();
    const off = m3(); const d = pick(off, '§SCN_DETAIL S5');
    out('§S5_RESTORED', active() === 'N' && r && /legacy=\{"outcome":"COMPLETED"/.test(d) && /^§SCN S5-\S+ MATCH/.test(pick(off, '§SCN S5')), `schema isactive=${active()}; control sale after restore: ${pick(off, '§SCN S5')}`);
  }
  log(`§S5_WITNESS_VERDICT ${fails ? 'FAIL' : 'PASS'} fails=${fails}`); process.exit(fails ? 1 : 0);
})().catch(e => { log('§S5_WITNESS_VERDICT FAIL exception ' + e.stack); process.exit(2); });
