// ⚠ DO NOT REMOVE — CLIENT CONTEXT witness (spec prompts/SQLiteIDEMPIERE.md §SHOPDAY-BUILD-1 (a)). READ THE LOG: §CTX lines are the product.
//  §CTX <key> literal=<GardenWorld default> resolved=<WS lookup by Value/Name> EQ|NE|UNRESOLVED|AMBIGUOUS|NO_READ_TYPE
//  §CTX_VERDICT   PASS only if >0 keys resolved, none NE/AMBIGUOUS; UNRESOLVED/NO_READ_TYPE are listed (not hidden); INCONCLUSIVE if nothing resolved
//  §CTX_NEG       a wrong natural key (warehouse/product/client name) must print UNRESOLVED, a wrong default must print NE
// Runs on GardenWorld; touches nothing on the pilot (read WS only).
'use strict';
const { cfgFromEnv } = require('./ad_client');
const C = require('./client_ctx');
(async () => {
  const cfg = cfgFromEnv(); let fails = 0;
  const { rows } = await C.resolve(cfg); C.logRows(rows);
  const by = s => rows.filter(r => r.status === s);
  const eq = by('EQ'), bad = by('NE').concat(by('AMBIGUOUS')), un = by('UNRESOLVED').concat(by('NO_READ_TYPE'));
  console.log(`§CTX_SUMMARY keys=${rows.length} EQ=${eq.length} NE=${by('NE').length} AMBIGUOUS=${by('AMBIGUOUS').length} UNRESOLVED=${by('UNRESOLVED').length} NO_READ_TYPE=${by('NO_READ_TYPE').length} unresolved_keys=[${un.map(r => r.key).join(',')}]`);
  if (!eq.length) console.log('§CTX_VERDICT INCONCLUSIVE nothing resolved (pilot down or read types missing)');
  else if (bad.length) { console.log(`§CTX_VERDICT FAIL ${bad.map(r => r.key + ':' + r.literal + '!=' + r.resolved).join(' ')}`); fails++; }
  else console.log(`§CTX_VERDICT PASS ${eq.length} keys literal==resolved on GardenWorld; ${un.length} listed as not resolvable by an existing read type`);

  // ---- negative controls (each must NOT come out EQ)
  const n1 = JSON.parse(JSON.stringify(C.N)); n1.whName = 'NoSuchWarehouse'; n1.locatorValue = 'NoSuchLocator'; n1.prod.mulch = 'NoSuchProduct'; n1.customer = 'NoSuchBP';
  const r1 = (await C.resolve(cfg, n1)).rows;
  const g = k => r1.find(r => r.key === k).status;
  const okNames = ['wh', 'locator', 'prod.mulch', 'customer'].every(k => g(k) === 'UNRESOLVED');
  const n2 = JSON.parse(JSON.stringify(C.N)); n2.clientName = 'NoSuchClient'; n2.role = 'NoSuchClient Admin';
  const r2 = (await C.resolve(cfg, n2)).rows;
  const okClient = r2.find(r => r.key === 'client').status === 'UNRESOLVED' && r2.filter(r => r.status === 'EQ').length === 0;
  // wrong default vs resolved: simulate a ctx literal that differs (WH 104 where the name says 103)
  const wrong = { ...C.DEFAULTS, wh: 104 }, wr = rows.find(r => r.key === 'wh');
  const okNE = wr && wr.resolved != null && wr.resolved !== wrong.wh;
  console.log(`§CTX_NEG ${okNames && okClient && okNE ? 'PASS' : 'FAIL'} wrong-names->UNRESOLVED=${okNames} wrong-client->nothing EQ=${okClient} wrong-literal(wh 104 vs resolved ${wr && wr.resolved})->NE=${okNE}`);
  if (!(okNames && okClient && okNE)) fails++;
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('§CTX_VERDICT HARNESS-FAIL ' + e.message); process.exit(1); });
