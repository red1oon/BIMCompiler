#!/usr/bin/env node
// probe_s30_sortkey.js — the measurement §S27.R and §S28.R BOTH said was missing (2026-08-19).
// STUDY ONLY. Nothing in viewer/ changes.
//
// ⚠ DO NOT REMOVE — read the log after every run; exit code is not evidence.
//
// THE ONE QUESTION: §S28.7's Lane A claims ordering can come from a plain sort
//     key = (bandRank, seq, base_z, guid)
// with physics demoted to a max() clock. That LITERAL key has never been run. probe_s26 measured a
// DIFFERENT key — (bandRank, phaseRank, depth, bz, guid) WITH host/carrier band inheritance — which
// contains the phase order §S28.1 outlawed plus two components Lane A drops. So Lane A's numbers
// were inherited from an instrument that does not measure it.
//
// What this does: order elements by the literal key, then run the pre-#1242 clock —
//     start(e) = max( end of every already-placed element that supports e , crew slot )
// — and score with the SHIPPED judges, called the way the working probe calls them:
//     ScheduleGate.auditFloating(keep, schedMap)   <- ORIGINAL elements (base_z/top_z), NOT remapped
// Two false zeros were produced during this session by getting that wrong (bz/tz field names, and
// omitting s/e so every duration was 0). Both are asserted against below.
//
// Baseline = the live CPM path measured in the same run, so the comparison is exact.
// Usage: node scripts/probe_s30_sortkey.js   [ONLY=Duplex_extracted] [KEY=seqfirst|zfirst]
'use strict';
const fs = require('fs'), path = require('path');
const R = process.env.OOTB || path.join(require('os').homedir(), 'bim-ootb');
const initSqlJs = require(path.join(R, 'modeller', 'lib', 'sql-wasm.js'));
const SG  = require(path.join(R, 'viewer', 'schedule_gate.js'));
const SA  = require(path.join(R, 'viewer', 'schedule_author.js'));
const CPM = require(path.join(R, 'viewer', 'cpm_schedule.js'));
const FLEET = (process.env.ONLY || 'Terminal_meta,Hospital_meta,Clinic_meta,LTU_AHouse_meta,Duplex_extracted,HHS_Office_Federated_extracted,JKR_extracted').split(',');
const KEY = process.env.KEY || 'seqfirst';     // seqfirst = the LITERAL §S28.7 key; zfirst = (band, base_z, seq)
const SHIFT_HOURS = 24, DAY = 86400000, SHIFT_MS = SHIFT_HOURS * 3600 * 1000;
const EPS = SG.EPS, GAP = SG.GAP, BAND_M = 3;
function toProductive(t){ if(t<=0) return 0; const d=Math.floor(t/DAY), r=t-d*DAY; return d*SHIFT_MS+(r<SHIFT_MS?r:SHIFT_MS); }
function toWall(p){ if(p<=0) return 0; const d=Math.floor(p/SHIFT_MS), r=p-d*SHIFT_MS; return d*DAY+r; }

async function run(SQL, RT, bld) {
  const p = path.join(R, 'buildings', bld + '.db');
  if (!fs.existsSync(p)) { console.log('§S30_SKIP ' + bld); return null; }
  const db = new SQL.Database(fs.readFileSync(p));
  const elements = SA._buildScheduleElements(db, RT.SEQUENCE_RULES, { laborRates: RT.LABOR_RATES,
    rates: RT.RATES, nameOverrides: RT.SEQUENCE_NAME_OVERRIDES, defaultRule: RT.SEQUENCE_DEFAULT });
  db.close();
  const maxCrews = {};
  for (const r in RT.LABOR_RATES) if (RT.LABOR_RATES[r].max_crews) maxCrews[r] = RT.LABOR_RATES[r].max_crews;
  // §S30.3 confound separation: NOCREW=1 lifts capacity on BOTH engines, so queueing delay cannot
  // mask a gate the sort failed to enforce. Whatever float survives is ORDERING, not waiting.
  if (process.env.NOCREW === '1') for (const r in maxCrews) maxCrews[r] = 1e6;
  const els = elements.map(it => Object.assign({}, it, { bz: it.base_z, tz: it.top_z }));
  let q = console.log; console.log = () => {};
  const raw = SG.computeSchedule(els, 0, 1, maxCrews, SHIFT_HOURS);
  console.log = q;
  const keep = elements.filter(e => raw[e.guid]);            // ORIGINAL objects — what the judge needs
  const items = els.filter(e => raw[e.guid]).map(e => ({ guid: e.guid, cls: e.cls, seq: e.seq,
    phase: e.phase, storey: e.storey, x0: e.x0, x1: e.x1, y0: e.y0, y1: e.y1, bz: e.bz, tz: e.tz,
    s: raw[e.guid].start, e: raw[e.guid].end, resource: e.resource, installSecs: e.installSecs }));
  const n = items.length;

  // ── baseline: the live CPM path, same run ──────────────────────────────────────────────────────
  q = console.log; console.log = () => {};
  const cpm = CPM.run(items, { maxCrews });
  console.log = q;
  const cpmT = cpm && cpm.ok ? cpm.solution.times : null;
  if (!cpmT) { console.log('§S30_ERR ' + bld + ' CPM failed'); return null; }

  // ── the LITERAL §S28.7 sort key ───────────────────────────────────────────────────────────────
  const rawBand = new Int32Array(n), seen = [];
  for (let i = 0; i < n; i++) { const b = Math.floor(items[i].bz / BAND_M); rawBand[i] = b; if (seen.indexOf(b) < 0) seen.push(b); }
  seen.sort((a, b) => a - b);
  const rk = {}; seen.forEach((b, r) => { rk[b] = r; });
  const band = new Int32Array(n);
  for (let i = 0; i < n; i++) band[i] = rk[rawBand[i]];
  const order = items.map((_, i) => i).sort((a, b) => {
    if (band[a] !== band[b]) return band[a] - band[b];
    if (KEY === 'zfirst') { if (items[a].bz !== items[b].bz) return items[a].bz - items[b].bz;
                            if (items[a].seq !== items[b].seq) return items[a].seq - items[b].seq; }
    else                  { if (items[a].seq !== items[b].seq) return items[a].seq - items[b].seq;
                            if (items[a].bz !== items[b].bz) return items[a].bz - items[b].bz; }
    return String(items[a].guid) < String(items[b].guid) ? -1 : 1;
  });

  // ── the clock: support = every REAL support already placed (the judge's own predicate) ─────────
  // §S26.6 C1 guard: scan is GLOBAL (all elements), not a partial placement grid; a support that
  // sorts LATER cannot be max()'d against and is COUNTED, never silently skipped.
  const G = CPM.contactGraph(items);
  const pos = new Int32Array(n); order.forEach((idx, r) => { pos[idx] = r; });
  const DUR = new Float64Array(n);
  for (let i = 0; i < n; i++) DUR[i] = Math.round((items[i].installSecs || 120) * 1000);
  const st = new Float64Array(n), en = new Float64Array(n);
  const crew = {}; let backwardSupports = 0, lateSupportEls = 0;
  for (let r = 0; r < n; r++) {
    const i = order[r], T = items[i], list = G.contacts[i] || [];
    let gate = 0, sawLate = false;
    for (let k = 0; k < list.length; k++) {
      const j = list[k], S = items[j];
      const bearing  = S.bz < T.bz - EPS && S.tz >= T.bz - GAP;
      const embedded = S.bz <= T.bz + EPS && S.tz >= T.tz - EPS;
      if (!(bearing || embedded)) continue;
      if (pos[j] < r) { if (en[j] > gate) gate = en[j]; }
      else { backwardSupports++; sawLate = true; }          // COUNTED, per C1
    }
    if (sawLate) lateSupportEls++;
    const res = T.resource || '_D', cap = maxCrews[res] || 1;
    const slots = crew[res] || (crew[res] = new Float64Array(cap));
    let bi = 0; for (let c = 1; c < cap; c++) if (slots[c] < slots[bi]) bi = c;
    const start = Math.max(gate, slots[bi]);
    const end = toWall(toProductive(start) + DUR[i]) + (start - toWall(toProductive(start)));
    st[i] = start; en[i] = start + Math.max(DUR[i], end - start);
    slots[bi] = en[i];
  }

  // ── score with the SHIPPED judges, correct call convention ────────────────────────────────────
  function floatOf(times) {
    const m = {}; items.forEach((o, i) => { m[o.guid] = { start: times[i].s, end: times[i].e }; });
    const qq = console.log; console.log = () => {};
    try { return SG.auditFloating(keep, m); } finally { console.log = qq; }
  }
  const sortT = items.map((_, i) => ({ s: st[i], e: en[i] }));
  const fCpm = floatOf(cpmT), fSort = floatOf(sortT);
  // guard against this session's own two false zeros
  const durOk = (items[0].e - items[0].s) > 0 && DUR[0] > 0;
  const judgeLive = fCpm > 0 || fSort > 0;
  const msCpm = Math.max(...cpmT.map(t => t.e)) / DAY, msSort = Math.max(...en) / DAY;
  console.log('§S30 ' + bld + ' n=' + n + ' KEY=' + KEY +
    ' | float CPM=' + fCpm + ' SORT=' + fSort + (fSort <= fCpm ? '  PASS' : '  FAIL(+' + (fSort - fCpm) + ')') +
    ' | makespanD CPM=' + msCpm.toFixed(1) + ' SORT=' + msSort.toFixed(1) +
    ' | backwardSupports=' + backwardSupports + ' onEls=' + lateSupportEls +
    ' (' + (100 * lateSupportEls / n).toFixed(1) + '%)' +
    ' | crew=' + (process.env.NOCREW==='1'?'LIFTED':'capped') + ' | durOk=' + durOk + ' judgeCanFail=' + judgeLive);
  return { bld, n, fCpm, fSort, msCpm, msSort, backwardSupports, lateSupportEls };
}

(async () => {
  const SQL = await initSqlJs({ wasmBinary: fs.readFileSync(path.join(R, 'modeller', 'lib', 'sql-wasm.wasm')) });
  const src = fs.readFileSync(path.join(R, 'viewer', 'rates.js'), 'utf8');
  const RT = (new Function(src + '\nreturn {SEQUENCE_RULES,SEQUENCE_DEFAULT,SEQUENCE_NAME_OVERRIDES,LABOR_RATES,RATES};'))();
  const all = [];
  for (const b of FLEET) { const r = await run(SQL, RT, b); if (r) all.push(r); }
  const better = all.filter(r => r.fSort <= r.fCpm).length;
  console.log('§S30_VERDICT KEY=' + KEY + ' NOCREW=' + (process.env.NOCREW||'0') + ' buildings=' + all.length + ' floatNoWorseThanCPM=' + better + '/' + all.length +
    ' — PROBE ONLY, viewer/ unchanged');
  console.log('§S30_TABLE ' + JSON.stringify(all.map(r => [r.bld, r.fCpm + '->' + r.fSort,
    r.msCpm.toFixed(0) + 'd->' + r.msSort.toFixed(0) + 'd', (100 * r.lateSupportEls / r.n).toFixed(1) + '%'])));
})().catch(e => { console.error('§S30_ERROR ' + (e && e.stack || e)); process.exit(2); });
