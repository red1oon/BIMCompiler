// ⚠ DO NOT REMOVE — scope: ERP parallel-run pilot harness (prompts/ERP_PARALLEL_RUN_PILOT.md). Customer data NEVER leaves
// this machine; logs carry ids and totals, never names. Read the log after every run — exit code is not evidence.
// pilot_cfg.js — the ONE place the customer DB later becomes a parameter change (env), not new code.
'use strict';
const os = require('os'), cp = require('child_process');
module.exports = {
  PG_CONTAINER: process.env.PILOT_PG_CONTAINER || 'postgres',
  PG_USER: process.env.PILOT_PG_USER || 'adempiere',
  PG_PASS: process.env.PILOT_PG_PASS || 'adempiere',
  PG_DB: process.env.PILOT_PG_DB || 'idempiere_pilot',          // customer DB restore name goes here
  PG_SCHEMA: process.env.PILOT_PG_SCHEMA || 'adempiere',
  CLIENT_ID: Number(process.env.PILOT_CLIENT_ID || 11),         // GardenWorld = 11
  WS_BASE: process.env.PILOT_WS_BASE || 'http://localhost:8088',
  WS_USER: process.env.PILOT_WS_USER || 'GardenAdmin',
  WS_PASS: process.env.PILOT_WS_PASS || 'GardenAdmin',
  WS_ROLE: Number(process.env.PILOT_WS_ROLE || 102),
  WS_ORG: Number(process.env.PILOT_WS_ORG || 11),
  WS_WH: Number(process.env.PILOT_WS_WH || 103),
  OOTB: process.env.PILOT_OOTB || '/tmp/wt-pilot',              // bim-ootb worktree served to the headless browser
  PW: process.env.PW || (os.homedir() + '/bim-ootb/tests/node_modules/playwright'),
  // psql through the docker container. Returns rows as arrays (unaligned, | separated). Never throws silently.
  psql(sql) {
    const r = cp.spawnSync('docker', ['exec', '-i', '-e', 'PGPASSWORD=' + this.PG_PASS, this.PG_CONTAINER, 'psql', '-U', this.PG_USER,
      '-d', this.PG_DB, '-At', '-F', '\u001f', '-v', 'ON_ERROR_STOP=1'], { input: 'SET search_path=' + this.PG_SCHEMA + ';\n' + sql, encoding: 'utf8', maxBuffer: 1 << 28 });
    if (r.status !== 0) throw new Error('psql failed: ' + (r.stderr || '').slice(0, 500));
    return r.stdout.split('\n').filter(l => l.length && !/^SET$/.test(l)).map(l => l.split('\u001f'));
  },
  rowsAsObjects(sql) {   // first column list given by caller through "select ... as x"; uses json for stable shape
    const out = this.psql('select coalesce(json_agg(t),\'[]\'::json) from (' + sql + ') t;');
    return JSON.parse(out[0].join('\u001f'));
  },
};
