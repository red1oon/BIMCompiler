// ⚠ DO NOT REMOVE — scope: W-CP-CALLOUT-ORACLE (prompts/ERP_IDEMPIERE_UX_PARITY.md §CP). Drives the SAME field changes
// through REAL iDempiere (oracle bundle on the pilot server, scripts/pilot/oracle — DB idempiere_pilot, never idempiere)
// and through OUR callout engine (bim-ootb erp/ad_callout.js + erp/callouts/*.js over erp/ad_seed.db), then diffs EVERY
// field of the row after every step. Both sides start from the oracle's own row (afterNew/afterOpen) and the oracle's
// login context, so the diff isolates callout logic. Read the log after every run — exit code is not evidence.
// usage: node cp_callout_oracle.js <cases.json> [--off] [--only name,name] [--log file]
//   --off = vacuity control: our callout classes unregistered → steps that the oracle derives MUST diff.
'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), os = require('os');
const cfg = require('./pilot_cfg');
const OOTB = process.env.CP_OOTB || '/tmp/wt-callouts';
const args = process.argv.slice(2);
const OFF = args.includes('--off');
const NEWMODE = args.includes('--new');   // W-CP-NEW: judge the New row (GridField.getDefault + dataNew fan) from an EMPTY row, not the steps
const only = (args[args.indexOf('--only') + 1] && args.includes('--only')) ? args[args.indexOf('--only') + 1].split(',') : null;
const logFile = args.includes('--log') ? args[args.indexOf('--log') + 1] : null;
const out = [];
function L(s) { out.push(s); console.log(s); }

function oracle(req) {
  return new Promise((res, rej) => {
    const body = Buffer.from(JSON.stringify(req));
    const r = http.request({ host: '127.0.0.1', port: 8097, method: 'POST', path: '/', headers: { 'Content-Length': body.length } }, (resp) => {
      let d = ''; resp.on('data', c => d += c); resp.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(new Error('oracle bad json ' + d.slice(0, 300))); } });
    });
    r.on('error', rej); r.setTimeout(600000); r.write(body); r.end();
  });
}

async function engine() {
  const initSqlJs = require(os.homedir() + '/bim-ootb/tests/node_modules/sql.js');
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(path.join(OOTB, 'erp/ad_seed.db')));
  // the page applies erp/patches/ad_seed.db.sql on EVERY load (idempiere.html §AD-SEED-PATCH, same split + per-statement run) —
  // the witness must judge the DB the page actually runs on, not the raw seed.
  { const pf = path.join(OOTB, 'erp/patches/ad_seed.db.sql'); let ok = 0, fail = 0;
    if (fs.existsSync(pf)) fs.readFileSync(pf, 'utf8').split(/;\s*\n/).forEach(st => { st = st.replace(/^\s*--[^\n]*\n?/gm, '').trim(); if (!st) return; try { db.run(st); ok++; } catch (e) { fail++; } });
    L('§AD-SEED-PATCH (witness) statements=' + ok + ' failed=' + fail); }
  const A = require(path.join(OOTB, 'erp/ad_callout.js'));
  const query = (sql, params) => {
    const st = db.prepare(sql), rows = [];
    try {
      if (params && params.length) st.bind(params.map(v => v === undefined ? null : v));
      const cols = st.getColumnNames();
      while (st.step()) { const v = st.get(), o = {}; cols.forEach((c, i) => { o[String(c).toLowerCase()] = v[i]; }); rows.push(o); }
    } finally { st.free(); }
    return rows;
  };
  A.bind(query, { log: (s) => L(s) });
  const dir = path.join(OOTB, 'erp/callouts');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort((a, b) => (a === 'support.js' ? -1 : b === 'support.js' ? 1 : a < b ? -1 : 1));
  files.forEach(f => require(path.join(dir, f)));
  if (A.RUNTIME.registerSqlFunctions) A.RUNTIME.registerSqlFunctions((name, fn) => db.create_function(name, fn));
  // AD_Message + AD_Element (en_US) — the text Msg.getMsg/translate return (cached once from the pilot DB, read-only)
  const cache = path.join(os.homedir(), '.cache/pilot/ad_msg_en.json');
  let msgs;
  if (fs.existsSync(cache)) msgs = JSON.parse(fs.readFileSync(cache, 'utf8'));
  else {
    msgs = {};
    cfg.psql("select value, msgtext from ad_message where isactive='Y'").forEach(r => { msgs[r[0]] = r[1]; });
    cfg.psql("select columnname, name from ad_element where isactive='Y'").forEach(r => { msgs['element:' + r[0]] = r[1]; });
    fs.mkdirSync(path.dirname(cache), { recursive: true }); fs.writeFileSync(cache, JSON.stringify(msgs));
  }
  A.Msg.load(msgs);
  return { A, query, files };
}

// mirrorRow — put a ref-only (cp_ seed) row into the in-memory bundle copy so model reads (MPayment.get…) see it, as the
// page's tip shadow would. Columns the bundle table lacks are dropped; nothing is written to disk. Additive (fork D).
function mirrorRow(query, table, row, quiet) {
  try {
    const cols = query('PRAGMA table_info(' + table + ')').map(r => r.name);
    if (!cols.length) { L('§CP-MIRROR ' + table + ' absent from bundle — not mirrored'); return; }
    const lc = {}; Object.keys(row).forEach(k => { lc[k.toLowerCase()] = row[k]; });
    const use = cols.filter(c => Object.prototype.hasOwnProperty.call(lc, c.toLowerCase()));
    query('INSERT OR REPLACE INTO ' + table + ' (' + use.join(',') + ') VALUES (' + use.map(() => '?').join(',') + ')', use.map(c => { const v = lc[c.toLowerCase()]; return v === undefined ? null : v; }));
    if (!quiet) L('§CP-MIRROR ' + table + ' cols=' + use.length);
  } catch (e) { L('§CP-MIRROR ' + table + ' FAILED ' + e.message); }
}
function norm(v) {
  if (v === null || v === undefined || v === '') return null;
  const s = String(v);
  if (/^-?\d+(\.\d+)?$/.test(s)) { const n = s.replace(/^(-?\d+)\.?0*$/, '$1').replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); return n === '-0' ? '0' : n; }
  if (/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?/.test(s)) return s.slice(0, 19).length === 10 ? s + ' 00:00:00' : s.slice(0, 19);
  if (s === 'true') return 'Y'; if (s === 'false') return 'N';
  return s;
}
function diffRows(ref, ours) {
  const d = [];
  Object.keys(ref).forEach(k => { const a = norm(ref[k]), b = norm(ours[k]); if (a !== b) d.push(k + ':ref=' + a + ',ours=' + b); });
  return d;
}

(async () => {
  const casesFile = args.find(a => a.endsWith('.json'));
  let cases = JSON.parse(fs.readFileSync(casesFile, 'utf8'));
  if (only) cases = cases.filter(c => only.includes(c.name));
  const { A, query, files } = await engine();
  L('§CP-ENGINE ootb=' + OOTB + ' classFiles=' + files.length + ' classes=' + A.registeredNames().length + (OFF ? ' MODE=OFF(vacuity)' : ''));
  if (OFF) Object.keys(A.CLASSES).forEach(k => { if (k !== 'org.compiere.model.CalloutEngine' && k !== 'CalloutEngine') delete A.CLASSES[k]; else A.CLASSES[k] = function () {}; });
  if (OFF && A.COLUMN_CALLOUTS) Object.keys(A.COLUMN_CALLOUTS).forEach(k => { delete A.COLUMN_CALLOUTS[k]; });   // @Callout/IColumnCallout too (fork D)
  // Sequence STATE, not logic: MSequence.getPreliminaryNo reads AD_Sequence.CurrentNext — start ours from the oracle's counters
  // (same principle as the parent-row mirror) so DocumentNo diffs can only come from the callout/MSequence code path.
  const seqRows = (await oracle({ op: 'sql', sql: "SELECT * FROM AD_Sequence WHERE IsTableID='N' AND AD_Client_ID IN (0," + cfg.CLIENT_ID + ")" })).rows || [];
  seqRows.forEach(r => mirrorRow(query, 'AD_Sequence', r, true));
  const seqNo = (await oracle({ op: 'sql', sql: 'SELECT n.* FROM AD_Sequence_No n JOIN AD_Sequence s ON s.AD_Sequence_ID=n.AD_Sequence_ID WHERE s.AD_Client_ID IN (0,' + cfg.CLIENT_ID + ')' })).rows || [];
  seqNo.forEach(r => mirrorRow(query, 'AD_Sequence_No', r, true));
  L('§CP-MIRROR-SEQ ad_sequence=' + seqRows.length + ' ad_sequence_no=' + seqNo.length);
  let tot = { cases: 0, steps: 0, stepsMatch: 0, fieldsDiff: 0, oracleErr: 0, vacuous: 0 };
  for (const c of cases) {
    tot.cases++;
    const date = c.date || '2026-10-04';
    const ref = await oracle({ op: 'callout', openQuery: c.openQuery != null ? !!c.openQuery : !(c.parents && c.parents.length) && !c.id, window: c.window, tab: c.tab, parents: c.parents || [], id: c.id, ctx: Object.assign({ date }, c.ctx || {}), steps: c.steps });   // ZK opens a header window on its query → AD_Window.IsSOTrx stays in ctx (without it Sales Invoice ran IsSOTrx=N)
    if (!ref.ok) { tot.oracleErr++; L('§CP-CASE ' + c.name + ' ORACLE-ERROR ' + ref.error + ' ' + String(ref.stack || '').split('\n').slice(0, 4).join(' | ')); continue; }
    const rctx = await oracle({ op: 'ctx', ctx: Object.assign({ date }, c.ctx || {}) });
    // our ctx = the oracle's login context (globals only) — isolates callout logic from login-default porting
    const ctx = new A.Ctx();
    Object.keys(rctx.ctx).forEach(k => { if (!/^\d+\|/.test(k)) ctx.setProperty(k, rctx.ctx[k]); });
    const windowNo = 1;
    if (NEWMODE) {
      if (c.id || !ref.afterNew) { tot.vacuous = (tot.vacuous || 0) + 1; continue; }
      if (c.parents && c.parents.length) { /* line New: judged after the parent setup below */ } else {
      // ours starts exactly as the page does: login globals + AD_Window.IsSOTrx in the window ctx, an EMPTY row, dataNew fan
      const w = query('SELECT IsSOTrx AS s FROM AD_Window WHERE AD_Window_ID=?', [c.window])[0];
      if (w && w.s != null) ctx.setProperty(windowNo + '|IsSOTrx', String(w.s));
      const tabsN = query("SELECT AD_Tab_ID AS id FROM AD_Tab WHERE AD_Window_ID=? AND IsActive='Y' ORDER BY SeqNo", [c.window]);
      const tabN = A.openTab(tabsN[c.tab].id, { ctx, windowNo, tabNo: c.tab });
      // a window opened on its query: the oracle's current row stays in the WINDOW ctx (GridTable.dataNew :2134) — load it first, as the page does
      if (ref.currentBeforeNew && !OFF) { tabN.load(ref.currentBeforeNew, false); tot.newFromCurrent = (tot.newFromCurrent || 0) + 1; }
      if (OFF) tabN.load({}, false); else { tabN.load({}, true); tabN.dataNewCallouts(); }   // --off: no GridField.getDefault → must DIFF
      const ours = tabN.snapshot();
      const skip = /^(Created|Updated|CreatedBy|UpdatedBy)$|_UU$/;
      const d = diffRows(Object.fromEntries(Object.entries(ref.afterNew).filter(([k]) => !skip.test(k))), ours);
      tot.newCols = (tot.newCols || 0) + Object.keys(ref.afterNew).filter(k => !skip.test(k)).length; tot.newDiff = (tot.newDiff || 0) + d.length;
      tot.newCases = (tot.newCases || 0) + 1; if (!d.length) tot.newMatch = (tot.newMatch || 0) + 1;
      L('§CP-NEW ' + c.name + ' window=' + c.window + ' cols=' + Object.keys(ref.afterNew).length + (d.length ? ' DIFF ' + d.length + ' [' + d.join(' ; ') + ']' : ' MATCH') + ' defaulted=' + Object.keys(tabN.lastDefaults || {}).length);
      continue;
      }
    }
    // the oracle window context right after New (keys the dataNew callout fan set, e.g. OrderType/HasCharges) — mirrored
    if (ref.ctxAfterNew && !NEWMODE) Object.keys(ref.ctxAfterNew).forEach(k => ctx.setProperty(windowNo + "|" + k, ref.ctxAfterNew[k]));
    // c.mirror: [{table, where}] — reference rows the callout READS (M_Cost, C_DepositBatch …) that exist only in idempiere_pilot
    for (const m of (c.mirror || [])) {
      const rows = (await oracle({ op: 'sql', sql: 'SELECT * FROM ' + m.table + ' WHERE ' + m.where })).rows || [];
      rows.forEach(r => mirrorRow(query, m.table, r, true));
      L('§CP-MIRROR-CASE ' + c.name + ' ' + m.table + ' rows=' + rows.length);
    }
    const tabs = query("SELECT AD_Tab_ID AS id FROM AD_Tab WHERE AD_Window_ID=? AND IsActive='Y' ORDER BY SeqNo", [c.window]);
    let parent = null;
    for (const p of (c.parents || [])) {
      const pt = A.openTab(tabs[p.tab].id, { ctx, windowNo, tabNo: p.tab, parentTab: parent });
      const key = pt.getKeyColumnName();
      // p.from==='ref': a cp_ draft row that exists only in idempiere_pilot (scenarios/cp/*_seed.sql) — read it from the oracle
      const row = p.from === 'ref'
        ? ((await oracle({ op: 'sql', sql: 'SELECT * FROM ' + pt.getTableName() + ' WHERE ' + key + '=' + Number(p.id) })).rows || [])[0]
        : query('SELECT * FROM ' + pt.getTableName() + ' WHERE ' + key + '=?', [p.id])[0];
      if (!row) { L('§CP-CASE ' + c.name + ' INCONCLUSIVE parent ' + pt.getTableName() + ' ' + p.id + ' not in ad_seed.db'); parent = 'MISSING'; break; }
      if (p.from === 'ref') mirrorRow(query, pt.getTableName(), row);   // the page would read a session row through the tip; mirror it in-memory (never saved)
      pt.load(row, false); pt.updateWindowContext = false; parent = pt;
    }
    if (parent === 'MISSING') continue;
    const tab = A.openTab(tabs[c.tab].id, { ctx, windowNo, tabNo: c.tab, parentTab: parent });
    if (NEWMODE) {   // line New: same parents as the steps path, then an EMPTY child row through dataNew
      const skip = /^(Created|Updated|CreatedBy|UpdatedBy)$|_UU$/;
      if (OFF) tab.load({}, false); else { tab.load({}, true); tab.dataNewCallouts(); }
      const ours = tab.snapshot();
      const d = diffRows(Object.fromEntries(Object.entries(ref.afterNew).filter(([k]) => !skip.test(k))), ours);
      tot.newCols = (tot.newCols || 0) + Object.keys(ref.afterNew).filter(k => !skip.test(k)).length; tot.newDiff = (tot.newDiff || 0) + d.length;
      tot.newCases = (tot.newCases || 0) + 1; if (!d.length) tot.newMatch = (tot.newMatch || 0) + 1;
      L('§CP-NEW ' + c.name + ' window=' + c.window + ' tab=' + c.tab + ' (line) cols=' + Object.keys(ref.afterNew).length + (d.length ? ' DIFF ' + d.length + ' [' + d.join(' ; ') + ']' : ' MATCH') + ' defaulted=' + Object.keys(tab.lastDefaults || {}).length);
      continue;
    }
    const start = ref.afterNew || ref.afterOpen;
    tab.load(start, !c.id, { noDefaults: true });   // the oracle's afterNew is already GridTable.dataNew's result — never re-default it
    const d0 = diffRows(start, tab.snapshot());
    if (d0.length) L('§CP-START ' + c.name + ' load-diff=' + d0.join(' '));
    for (let i = 0; i < (c.steps || []).length; i++) {
      const st = c.steps[i], rs = ref.steps[i];
      tab.trace = []; tab.msgs = [];
      const before = tab.snapshot();
      tab.setValue(st.set, st.value);
      const ours = tab.snapshot();
      const d = diffRows(rs.fields, ours);
      const refChanged = Object.keys(rs.fields).filter(k => norm(rs.fields[k]) !== norm(before[k]) && k !== st.set);
      tot.steps++; tot.fieldsDiff += d.length; if (!d.length) tot.stepsMatch++;
      if (!refChanged.length) tot.vacuous++;
      const msgRef = (rs.msgs || []).join(' | '), msgOurs = tab.msgs.join(' | ');
      L('§CP-STEP ' + c.name + ' #' + i + ' set ' + st.set + '=' + st.value + ' refDerived=[' + refChanged.join(',') + '] ' +
        (d.length ? 'DIFF ' + d.length + ' [' + d.join(' ; ') + ']' : 'MATCH') +
        ' msgRef="' + msgRef + '" msgOurs="' + msgOurs + '"' + (msgRef !== msgOurs ? ' MSG-DIFF' : '') +
        ' traceRef=[' + (rs.trace || []).join(',') + '] traceOurs=[' + tab.trace.join(',') + ']');
    }
  }
  if (NEWMODE) L('§CP-NEW-SUMMARY cases=' + (tot.newCases || 0) + ' match=' + (tot.newMatch || 0) + ' cols=' + (tot.newCols || 0) + ' colDiffs=' + (tot.newDiff || 0) + ' fromCurrentRow=' + (tot.newFromCurrent || 0) + ' skipped(line/open cases)=' + (tot.vacuous || 0) + ' verdict=' + (!tot.newCases ? 'INCONCLUSIVE' : tot.newMatch === tot.newCases ? 'PASS' : 'DIFF'));
  L('§CP-SUMMARY cases=' + tot.cases + ' steps=' + tot.steps + ' match=' + tot.stepsMatch + ' fieldDiffs=' + tot.fieldsDiff +
    ' oracleErr=' + tot.oracleErr + ' stepsWithNoRefDerive=' + tot.vacuous + (OFF ? ' MODE=OFF' : '') +
    ' unported=' + JSON.stringify(A.RUNTIME.stats().unported));
  if (logFile) fs.writeFileSync(logFile, out.join('\n') + '\n');
})().catch(e => { L('§CP-FATAL ' + (e && e.stack || e)); if (logFile) fs.writeFileSync(logFile, out.join('\n') + '\n'); process.exit(2); });
