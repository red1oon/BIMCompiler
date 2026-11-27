#!/usr/bin/env node
// ⚠ DO NOT REMOVE — Scope: prompts/TEAMWORK_FRAMEWORK.md §45.15a (beat 10 of the film "Network ERP without an Apps and Database server!"). MEASUREMENT ONLY.
// ISSUE IT PROVES OR DISPROVES: "the twin does the same document locally with no network in its path, while legacy pays a server call and a round trip per
//   action". Same documents both sides: the parallel run's order-to-cash cycle (cycle_o2c.js via witness_m3_gap.js, loaded UNCHANGED, M3_ONLY=O2C).
// Legacy side: every web-service request (fetch to the pilot) counted and timed, split into DOCUMENT WRITES (create/update/composite/doc-action/process)
//   and the witness's COMPARISON READS (query/read) — only writes count toward a step's cost. Twin side: the local step's wall time.
// Maths per §45.14 link profile: legacy step = Σ write server ms + write round trips × round trip (a LOWER bound for the human legacy UI); twin step = local ms.
// Needs the pilot (~/idempiere-pilot/start.sh, :8088) + the docker postgres. READ THE LOG: node scripts/bridge/time_o2c.js > log 2>&1
'use strict';
const path = require('path'), cp = require('child_process');
const NET = require(path.join(__dirname, '..', 'sme100_net.js'));
const now = () => Number(process.hrtime.bigint() / 1000n) / 1000;
let CUR = null, OVERHEAD = null; const REC = {}, OUTCOME = {};
const slot = (side, step) => { const k = side + ':' + step; return REC[k] || (REC[k] = { side, step, ms: 0, calls: 0, write_n: 0, write_ms: 0, write_bytes: 0, read_n: 0, read_ms: 0, methods: {} }); };
// 1. fetch: classify every legacy WS request by its method (the last path segment of the ADInterface JSON endpoint)
const _fetch = globalThis.fetch;
globalThis.fetch = async function (url, init) {
  const u = String(url), m = (/\/([a-z_]+)\/?$/.exec(u.split('?')[0]) || [])[1] || 'other', t0 = now(), res = await _fetch(url, init), txt = await res.text(), ms = now() - t0;
  if (CUR && CUR.side === 'legacy') { const s = slot('legacy', CUR.step), isRead = /^(query_data|read_data|get_list)$/.test(m);
    s.methods[m] = (s.methods[m] || 0) + 1; if (isRead) { s.read_n++; s.read_ms += ms; } else { s.write_n++; s.write_ms += ms; s.write_bytes += (init && init.body ? Buffer.byteLength(init.body) : 0) + txt.length; } }
  return new Response(txt, { status: res.status, headers: res.headers });
};
// 2. the cycle: wrap each scenario's legacy/local function with a timer (the module itself is not edited)
const cyc = require.resolve('./cycle_o2c'), orig = require(cyc);
require.cache[cyc].exports = function (X) { if (process.env.LVL_PROBE && X.acctSetupOf) { const a0 = X.acctSetupOf; X.acctSetupOf = function (pid) { const r = a0(pid); console.log('§LVL-PROBE acctSetupOf pid=' + pid + ' missing=' + JSON.stringify(r)); return r; }; }
  const o = orig(X), sc = o.scenario;
  o.scenario = function (step, i) { const s = sc(step, i), L = s.legacy, Lo = s.local, id = s.id;
    s.legacy = async function (f) { CUR = { side: 'legacy', step: id }; const t = now(); try { const r = await L(f); OUTCOME['legacy:' + id] = r && r.outcome; return r; } finally { slot('legacy', id).ms += now() - t; CUR = null; } };
    s.local = async function (f) { CUR = { side: 'local', step: id }; const t = now(); try { const r = await Lo(f); OUTCOME['local:' + id] = r && r.outcome; return r; } finally { slot('local', id).ms += now() - t; CUR = null; } };
    return s; };
  return o; };
// 3. at exit: per step, per profile, the servers
process.on('exit', function () {
  const steps = Object.keys(REC).filter(k => k.startsWith('legacy:')).map(k => REC[k].step).filter(id => /^O2C\d+-/.test(id));
  console.log('§LVL-HEADER §45.15a steps=' + steps.length + ' (legacy writes = document operations; reads = the witness comparing keys, NOT counted) profiles=' + JSON.stringify(NET.PROFILES));
  let both = 0, lw = 0, lms = 0, lrt = 0, loc = 0;
  steps.forEach(id => { const L = REC['legacy:' + id], S = REC['local:' + id] || { ms: null }, okL = OUTCOME['legacy:' + id], okS = OUTCOME['local:' + id], done = okL === 'COMPLETED' && okS === 'COMPLETED';
    if (done) { both++; lw += L.write_n; lms += L.write_ms; loc += S.ms; }
    console.log('§LVL-STEP ' + id + ' legacy=' + okL + ' twin=' + okS + ' legacy_writes=' + L.write_n + ' legacy_write_server_ms=' + L.write_ms.toFixed(1) + ' legacy_reads(compare,not counted)=' + L.read_n + ' twin_local_ms=' + (S.ms == null ? 'n/a' : S.ms.toFixed(1)) + ' methods=' + JSON.stringify(L.methods)); });
  ['lan', 'broadband', '4g', 'poor'].forEach(pf => { const P = NET.PROFILES[pf];
    if (OVERHEAD != null) console.log('§LVL-PROFILE-NOLOGIN ' + pf + ' (rtt ' + P.rtt + ' ms) legacy per document without the per-call login: >= ' + (both ? ((lms - lw * OVERHEAD + lw * P.rtt) / both).toFixed(0) : 'n/a') + ' ms (' + lw + ' writes, login overhead ' + OVERHEAD.toFixed(1) + ' ms each removed) vs twin ' + (both ? (loc / both).toFixed(0) : 'n/a') + ' ms');
    console.log('§LVL-PROFILE ' + pf + ' (rtt ' + P.rtt + ' ms) over the ' + both + ' completed steps: legacy >= ' + ((lms + lw * P.rtt) / 1000).toFixed(2) + ' s (' + lw + ' writes × ' + P.rtt + ' ms + ' + (lms / 1000).toFixed(2) + ' s server) · twin ' + (loc / 1000).toFixed(2) + ' s local, 0 round trips in the path · per document step: legacy >= ' + (both ? ((lms + lw * P.rtt) / both).toFixed(0) : 'n/a') + ' ms vs twin ' + (both ? (loc / both).toFixed(0) : 'n/a') + ' ms'); });
  try { const jv = cp.execSync("ps -eo pid,rss,args | grep -i '[i]dempiere' | grep -i java | awk '{s+=$2} END {print s}'", { encoding: 'utf8' }).trim(), pg = cp.execSync("docker stats --no-stream --format '{{.Name}} {{.MemUsage}}' 2>/dev/null | grep -i postgres", { encoding: 'utf8' }).trim();
    console.log('§LVL-SERVERS legacy needs 2 server processes: iDempiere java RSS=' + (jv ? Math.round(Number(jv) / 1024) + ' MB' : 'n/a') + ' · postgres container ' + (pg || 'n/a') + ' — twin: 0 server processes (SQLite in the page)'); } catch (e) { console.log('§LVL-SERVERS n/a ' + e.message); }
  console.log('§LVL-VERDICT ' + (both > 0 && both === steps.length ? 'MEASURED' : both > 0 ? 'PARTIAL' : 'INCONCLUSIVE') + ' completed_both_sides=' + both + '/' + steps.length);
});
if (process.env.LVL_PROBE) { const DPm = require('../doc_poster'), d0 = DPm.derivePostings; DPm.derivePostings = function (db, doc, sch) { const d = d0.apply(this, arguments); if (d && d.absent && d.absent.length) console.log('§LVL-PROBE derivePostings ' + doc.table + ':' + doc.id + ' schema=' + sch + ' absent=' + JSON.stringify(d.absent).slice(0, 300)); return d; }; }
process.env.M3_ONLY = process.env.M3_ONLY || 'O2C';
// §45.15b apple-for-apple: (1) the engine of the SQLite side; (2) legacy's per-call overhead — every WS request carries an ADLoginRequest (ad_client.js:77),
//   so a do-nothing call (a query that returns 0 rows) is timed and reported; the human legacy UI logs in once per session, not per document.
(async () => {
  if (process.env.M3_SQLJS === '1') { const initSqlJs = require(require('os').homedir() + '/bim-ootb/tests/node_modules/sql.js'); global.__SQLJS = await initSqlJs(); console.log('§LVL-ENGINE twin=sql.js (SQLite compiled to WebAssembly, the browser engine)'); }
  else console.log('§LVL-ENGINE twin=better-sqlite3 (native SQLite)');
  const AD = require('./ad_client'), cfg = AD.cfgFromEnv(), ms = [];
  for (let i = 0; i < 12; i++) { const t = now(); await _fetchRaw(cfg); ms.push(now() - t); }
  const s = ms.slice(2).sort((a, b) => a - b); OVERHEAD = s[Math.floor(s.length / 2)];
  console.log('§LVL-OVERHEAD legacy do-nothing WS call (login + a 0-row query) median=' + OVERHEAD.toFixed(1) + ' ms over ' + s.length + ' calls (first 2 discarded as warm-up) all=' + JSON.stringify(ms.map(x => +x.toFixed(1))));
  require('./witness_m3_gap.js');
})();
async function _fetchRaw(cfg) { return require('./ad_client').call(cfg, 'query_data', { ModelCRUD: { serviceType: 'QueryCOrder', Filter: 'C_Order_ID=-1' } }); }
