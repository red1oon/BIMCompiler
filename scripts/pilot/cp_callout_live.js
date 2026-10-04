// ⚠ DO NOT REMOVE — scope: W-CP-CALLOUT-LIVE (prompts/ERP_IDEMPIERE_UX_PARITY.md §CP). The SAME field changes a user types,
// through OUR PAGE (bim-ootb erp/idempiere.html in headless Chromium, --disable-gpu, no screenshots) and through REAL iDempiere
// (oracle bundle, pilot server). Header-tab New only (a line case needs a parent selected — the engine witness
// cp_callout_oracle.js covers lines). Per step it compares the columns the ORACLE's callouts derived in that step against
// (a) our GridTab row (__crud.calloutTab().snapshot()) and (b) the visible form field, when the column is on the form.
// The New row itself (defaults + dataNew fan) is reported, not judged: defaults are another lane.
// usage: node cp_callout_live.js <cases.json> [--only a,b] [--log file]     Read the log after every run.
'use strict';
process.env.PILOT_OOTB = process.env.CP_OOTB || '/tmp/wt-callouts';
const fs = require('fs'), http = require('http');
const O = require('./pilot_ours');
const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const logFile = args.includes('--log') ? args[args.indexOf('--log') + 1] : null;
const out = []; function L(s) { out.push(s); console.log(s); }
function oracle(req) {
  return new Promise((res, rej) => { const body = Buffer.from(JSON.stringify(req));
    const r = http.request({ host: '127.0.0.1', port: 8097, method: 'POST', path: '/', headers: { 'Content-Length': body.length } }, (resp) => {
      let d = ''; resp.on('data', c => d += c); resp.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); });
    r.on('error', rej); r.write(body); r.end(); });
}
function norm(v) {
  if (v === null || v === undefined || v === '') return null;
  const s = String(v);
  if (/^-?\d+(\.\d+)?$/.test(s)) return String(Number(s));
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}
(async () => {
  let cases = JSON.parse(fs.readFileSync(args.find(a => a.endsWith('.json')), 'utf8')).filter(c => !c.parents || !c.parents.length).filter(c => !c.id);
  if (only) cases = cases.filter(c => only.includes(c.name));
  const today = new Date().toISOString().slice(0, 10);
  const o = await O.start();
  const tot = { cases: 0, steps: 0, judged: 0, match: 0, notOnForm: 0, cols: 0, colsMatch: 0 };
  try {
    for (const c of cases) {
      tot.cases++;
      const ref = await oracle({ op: 'callout', window: c.window, tab: c.tab, ctx: { date: today }, steps: c.steps });
      if (!ref.ok) { L('§CP-LIVE ' + c.name + ' ORACLE-ERROR ' + ref.error); continue; }
      await O.openWin(o, c.window); const n0 = o.LOG.length; await O.clickNew(o);
      const fan = o.since(n0, /§CALLOUT-NEW/).pop() || '(no §CALLOUT-NEW line)';
      L('§CP-LIVE-NEW ' + c.name + ' ' + fan.slice(0, 300));
      let prev = Object.assign({}, ref.afterNew);
      for (let i = 0; i < c.steps.length; i++) {
        const st = c.steps[i], rs = ref.steps[i]; tot.steps++;
        const derived = Object.keys(rs.fields).filter(k => norm(rs.fields[k]) !== norm(prev[k]) && k !== st.set);
        prev = rs.fields;
        const n1 = o.LOG.length;
        const how = await O.setField(o, st.set.toLowerCase(), st.value);
        if (!/^ok/.test(how)) { tot.notOnForm++; L('§CP-LIVE-STEP ' + c.name + ' #' + i + ' set ' + st.set + '=' + st.value + ' NOT-JUDGED (' + how + ') refDerived=[' + derived.join(',') + ']'); continue; }
        await o.page.waitForTimeout(300);
        const snap = await o.page.evaluate(() => { const t = window.__crud && window.__crud.calloutTab && window.__crud.calloutTab(); return t ? t.snapshot() : null; });
        const form = await O.readForm(o);
        const lcForm = {}; Object.keys(form).forEach(k => { lcForm[k.toLowerCase()] = form[k]; });
        const diffs = [];
        derived.forEach(k => {
          tot.cols++;
          const r = norm(rs.fields[k]), g = snap ? norm(snap[k]) : 'NO-GRIDTAB', f = Object.prototype.hasOwnProperty.call(lcForm, k.toLowerCase()) ? norm(lcForm[k.toLowerCase()]) : undefined;
          const ok = r === g && (f === undefined || f === r);
          if (ok) tot.colsMatch++; else diffs.push(k + ':ref=' + r + ',grid=' + g + (f === undefined ? ',form=(not on form)' : ',form=' + f));
        });
        tot.judged++; if (!diffs.length) tot.match++;
        const chg = o.since(n1, /§CALLOUT-(CHANGE|MSG|UNPORTED|EXCEPTION)/).map(s => s.slice(0, 200)).join(' || ');
        L('§CP-LIVE-STEP ' + c.name + ' #' + i + ' set ' + st.set + '=' + st.value + ' refDerived=[' + derived.join(',') + '] ' + (diffs.length ? 'DIFF [' + diffs.join(' ; ') + ']' : 'MATCH') + ' page=' + chg);
      }
    }
  } finally { await o.close(); }
  L('§CP-LIVE-SUMMARY cases=' + tot.cases + ' steps=' + tot.steps + ' judged=' + tot.judged + ' match=' + tot.match + ' notOnForm=' + tot.notOnForm + ' derivedCols=' + tot.cols + ' colsMatch=' + tot.colsMatch + ' pageErrors=' + o.ERRS.length + (o.ERRS.length ? ' ' + JSON.stringify(o.ERRS.slice(0, 3)) : ''));
  if (logFile) fs.writeFileSync(logFile, out.join('\n') + '\n');
})().catch(e => { L('§CP-LIVE-FATAL ' + (e && e.stack || e)); if (logFile) fs.writeFileSync(logFile, out.join('\n') + '\n'); process.exit(2); });
