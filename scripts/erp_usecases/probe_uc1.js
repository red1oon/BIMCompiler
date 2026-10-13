// probe: what does UC-1 do to the Trial Balance? Runs the report engine (via NinjaReport + withTipDb) BEFORE and AFTER one sale, in one browser session, and prints account sets. usage: node probe_uc1.js <bim-ootb root>
const fs = require('fs'), path = require('path'); const H = require('./harness'); const uc = require('./uc1_pos_sale');
(async () => { const root = path.resolve(process.argv[2]); const h = await H.open(root); await h.login();
  const tpl = fs.readFileSync(path.join(root, 'erp/ninja_tb_sample.xlsx')).toString('base64');
  const runTB = (from, to) => h.pg.evaluate(async ({ tpl, from, to }) => {
    await new Promise((ok, no) => { if (window.NinjaReport) return ok(); const s = document.createElement('script'); s.src = 'ninja_report.js'; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
    await new Promise((ok, no) => { if (window.XLSX) return ok(); const s = document.createElement('script'); s.src = 'xlsx.mini.min.js'; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
    const o = await NinjaReport.run({ db: window.__idmpDb, template: Uint8Array.from(atob(tpl), c => c.charCodeAt(0)), from, to, base: '', XLSX: window.XLSX, withDb: fn => window.__crud.withTipDb(fn) });
    const ws = o.model.Sheets.Output, rows = []; for (let r = 6; r < 200; r++) { const a = ws['A' + r]; if (!a || !/^\d+$/.test(String(a.v))) break; rows.push([String(a.v), ws['B' + r].v, ws['C' + r].v, ws['D' + r].v, ws['E' + r].v]); } return { rows, facts: o.facts }; }, { tpl, from, to });
  const y = new Date().getFullYear();
  const b = await runTB('2003-01-01', y + '-12-31'); console.log('BEFORE accounts=' + b.rows.length + ' stmts=' + b.facts.statements);
  const r = await uc.enter(h, {}); console.log('UC-1', JSON.stringify(r));
  const a = await runTB('2003-01-01', y + '-12-31'); console.log('AFTER accounts=' + a.rows.length);
  const bs = new Set(b.rows.map(x => x[0])); console.log('NEW accounts: ' + a.rows.filter(x => !bs.has(x[0])).map(x => x[0] + ' ' + x[1]).join(' | '));
  const tipAcc = await h.tip('SELECT e.value v, e.name n, ROUND(SUM(a.amtacctdr),2) dr, ROUND(SUM(a.amtacctcr),2) cr, p.startdate sd FROM fact_acct a JOIN c_elementvalue e ON e.c_elementvalue_id=a.account_id LEFT JOIN c_period p ON p.c_period_id=a.c_period_id WHERE a.fact_acct_id<0 GROUP BY 1,2,5');
  console.log('TIP postings ' + JSON.stringify(tipAcc)); console.log('errs=' + JSON.stringify(h.errs.slice(0, 3)));
  await h.close(); })().catch(e => { console.log('ERR', e.stack); process.exit(1); });
