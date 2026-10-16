// run_usecases.js — STANDARD GARDENWORLD USE-CASE SET, runner + RESET PROOF (spec: prompts/NINJAEXCEL_TEMPLATE_ENGINE.md §UC-SET). CPU only, headless.
// Issues it proves/disproves (each its own §UC_* line):
//   PUSH   after entering K sales through the real UI, the Sales Register has exactly K more rows than the baseline (the list was PUSHED down), its total rose by exactly the sum of the K new invoices' GrandTotal
//          (independent SQL on the tip), and its COUNT formula equals the row count;
//   BOOKS  the Trial Balance of the same session still balances (debit = credit) and its movement rose by exactly the new postings' debit total;
//   RESET  a FRESH session (new browser context = empty op-log, GardenWorld reloaded from ad_seed.db) reproduces the baseline reports exactly: same register rows+total, same trial balance.
// Verdict INCONCLUSIVE (never PASS) when no sale completed or the baseline was empty. usage: node run_usecases.js <bim-ootb root> [K=3]   env NEG=1 (baseline perturbed -> RESET must FAIL)
const fs = require('fs'), path = require('path'); const H = require('./harness'); const UC = [require('./uc1_pos_sale')];
const root = path.resolve(process.argv[2]), K = Number(process.argv[3] || 3), Y = new Date().getFullYear();
const tpl = (f) => fs.readFileSync(path.join(root, 'erp', f)).toString('base64');
async function reports(h) {
  return h.pg.evaluate(async ({ tb, reg, y }) => {
    const ld = (s) => new Promise((ok, no) => { const e = document.createElement('script'); e.src = s; e.onload = ok; e.onerror = no; document.head.appendChild(e); });
    if (!window.NinjaReport) await ld('ninja_report.js'); if (!window.XLSX) await ld('xlsx.mini.min.js');
    const run = async (b64, from, to) => NinjaReport.run({ db: window.__idmpDb, template: Uint8Array.from(atob(b64), c => c.charCodeAt(0)), from, to, base: '', XLSX: window.XLSX, withDb: fn => window.__crud.withTipDb(fn) });
    const rd = (m, cols) => { const ws = m.Sheets.Output, rows = []; for (let r = 6; r < 5000; r++) { const a = ws['A' + r]; if (!a || a.v === '' || a.v == null) break; rows.push(cols.map(c => (ws[c + r] || {}).v)); } return rows; };
    const T = await run(tb, '2003-01-01', y + '-12-31'), G = await run(reg, '2002-01-01', y + '-12-31');
    const trows = rd(T.model, ['A', 'B', 'C', 'D', 'E']), grows = rd(G.model, ['A', 'B', 'C', 'D']);
    const find = (m, lab) => { const ws = m.Sheets.Output; for (let r = 6; r < 5000; r++) { const a = ws['A' + r]; if (a && a.v === lab) return r; } return -1; };
    const tr = find(T.model, 'รวม'), gr = find(G.model, 'รวม'); const tw = T.model.Sheets.Output, gw = G.model.Sheets.Output;
    return { tb: { rows: trows, n: trows.length, debit: tw['D' + tr].v, credit: tw['E' + tr].v, totalsRow: tr }, reg: { rows: grows, n: grows.length, total: gw['D' + gr].v, count: gw['D' + (gr + 2)].v, totalFormula: gw['D' + gr].f, totalsRow: gr }, ms: [T.facts.runMs, G.facts.runMs] };
  }, { tb: tpl('ninja_tb_sample.xlsx'), reg: tpl('ninja_register_sample.xlsx'), y: Y });
}
const near = (a, b) => Math.abs(a - b) < 0.005; const J = (o) => JSON.stringify(o);
(async () => {
  const bad = []; let done = 0, newInv = 0, newDebit = 0;
  // ── session A: baseline, enter, re-run
  const A = await H.open(root); await A.login(); const base = await reports(A);
  console.log(`§UC_BASELINE register.rows=${base.reg.n} register.total=${base.reg.total.toFixed(2)} tb.accounts=${base.tb.n} tb.debit=${base.tb.debit.toFixed(2)} tb.credit=${base.tb.credit.toFixed(2)} ms=${base.ms.join('/')}`);
  const results = [];
  for (let i = 1; i <= K; i++) { const r = await UC[0].enter(A, { qty: i }); results.push(r); done++; console.log(`§UC_ENTER ${UC[0].id} sale=${i}/${K} qty=${i} newFactLines=${r.newFactLines}`); }
  const inv = await A.tip("SELECT COUNT(*) AS n, ROUND(SUM(grandtotal),2) AS t FROM c_invoice WHERE c_invoice_id<0 AND docstatus='CO' AND issotrx='Y'"); newInv = inv[0].n;
  const fa = await A.tip('SELECT ROUND(SUM(amtacctdr),2) AS dr, ROUND(SUM(amtacctcr),2) AS cr FROM fact_acct WHERE fact_acct_id<0 OR record_id<0'); newDebit = fa[0].dr;
  const aft = await reports(A);
  console.log(`§UC_AFTER register.rows=${aft.reg.n} register.total=${aft.reg.total.toFixed(2)} register.count=${aft.reg.count} register.totalFormula=${aft.reg.totalFormula} tb.debit=${aft.tb.debit.toFixed(2)} tb.credit=${aft.tb.credit.toFixed(2)} tipInvoices=${newInv} tipInvoiceTotal=${inv[0].t} tipPostedDebit=${newDebit}`);
  if (done === 0 || base.reg.n === 0) { console.log('§UC_VERDICT INCONCLUSIVE (nothing entered or empty baseline)'); await A.close(); return; }
  if (aft.reg.n !== base.reg.n + K) bad.push(`PUSH rows ${base.reg.n} -> ${aft.reg.n}, expected +${K}`);
  if (newInv !== K) bad.push(`tip invoices ${newInv} != ${K}`);
  if (!near(aft.reg.total - base.reg.total, inv[0].t)) bad.push(`PUSH total delta ${(aft.reg.total - base.reg.total).toFixed(2)} != tip invoices ${inv[0].t}`);
  if (aft.reg.count !== aft.reg.n) bad.push(`PUSH count ${aft.reg.count} != rows ${aft.reg.n}`);
  if (aft.reg.totalFormula !== `SUM(D6:D${aft.reg.totalsRow - 1})`) bad.push(`PUSH total range ${aft.reg.totalFormula}`);
  if (!near(aft.tb.debit, aft.tb.credit)) bad.push(`BOOKS tb debit ${aft.tb.debit} != credit ${aft.tb.credit}`);
  if (!near(aft.tb.debit - base.tb.debit, newDebit)) bad.push(`BOOKS tb movement delta ${(aft.tb.debit - base.tb.debit).toFixed(2)} != posted ${newDebit}`);
  console.log(`§UC_PUSH rowsBefore=${base.reg.n} rowsAfter=${aft.reg.n} pushed=${aft.reg.n - base.reg.n} totalDelta=${(aft.reg.total - base.reg.total).toFixed(2)} booksBalanced=${near(aft.tb.debit, aft.tb.credit)} tbMovementDelta=${(aft.tb.debit - base.tb.debit).toFixed(2)}`);
  await A.close();                                                                             // ── RESET: the session is thrown away
  const B = await H.open(root); await B.login(); const rst = await reports(B); await B.close();
  const baseRef = process.env.NEG === '1' ? { ...base, reg: { ...base.reg, total: base.reg.total + 1 } } : base;
  const same = rst.reg.n === baseRef.reg.n && near(rst.reg.total, baseRef.reg.total) && J(rst.reg.rows) === J(baseRef.reg.rows) && J(rst.tb.rows) === J(baseRef.tb.rows) && near(rst.tb.debit, baseRef.tb.debit);
  console.log(`§UC_RESET fresh.register.rows=${rst.reg.n} fresh.register.total=${rst.reg.total.toFixed(2)} fresh.tb.debit=${rst.tb.debit.toFixed(2)} identicalToBaseline=${same}`);
  if (!same) bad.push('RESET fresh session differs from the baseline');
  console.log(`§UC_SET useCases=${UC.map(u => u.id).join('+')} sales=${done} mismatches=${bad.length}`); bad.forEach(b => console.log('   ' + b));
  console.log('§UC_VERDICT ' + (bad.length ? 'FAIL' : 'PASS'));
})().catch(e => { console.log('§UC_ERROR', e.stack); process.exit(1); });
