// §SHOPDAY-RUN-1 R1.1 -- SD-00 legacy side: InitialClientSetup via the stock run_process op as SuperUser (system WS role 1200001).
// Facts are the SHARED input of both sides (shopday_facts.js). Usage: node shopday_sd00_legacy.js [run]   (default = dry description)
'use strict';
const ad = require('./ad_client'), F = require('./shopday_facts');
(async () => {
  const sys = ad.cfgFromEnv(); sys.login = F.systemLogin;
  const before = await ad.query(sys, 'QueryADClient', `Name='${F.client.name}'`).catch(e => 'NO_READ_TYPE ' + e.message.slice(0, 80));
  console.log('§SD00 pre-existing client lookup:', JSON.stringify(before));
  const r = await ad.runProcess(sys, 'Bridge_RunProcess_InitialClientSetup', F.setupParams());
  console.log('§SD00 run_process ok=' + r.ok + ' error=' + r.error + '\n§SD00 summary=' + JSON.stringify(r.summary) + '\n§SD00 logs=' + JSON.stringify(r.logs).slice(0, 3000));
  process.exit(r.ok ? 0 : 1);
})().catch(e => { console.log('§SD00 FAULT ' + e.message); process.exit(2); });
