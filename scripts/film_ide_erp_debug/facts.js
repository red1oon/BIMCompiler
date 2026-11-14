// ⚠ DO NOT REMOVE — SCOPE: film 3 (prompts/FILM_IDE_ERP_DEBUG.md). The facts of the film, none typed by hand: for the OLD and the NEW tree of bim-ootb (the commits before and after #3010) it runs the kernel at 00:30 local in
// Asia/Kuala_Lumpur (kernel_run.js: order -> ship -> invoice), then opens the REAL ERP page (NEW tree's erp/idempiere.html) on each kernel database, deep-linked to that invoice (?window=167&record=<id>), headless on the CPU,
// and reads the form's own fields (page_shot.js). Check P: the page's Date Invoiced equals the kernel's own row, in both states. Check B: OLD is the 12th (the UTC day), NEW the 13th (the local day). The page is OPENED on
// data the kernel wrote earlier: it is not linked live. Writes out/facts.json and prints `§FACTS …` lines. Usage: node facts.js <OLD tree> <NEW tree>      READ out/facts.log: exit code is not evidence.
'use strict';
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const OLD = path.resolve(process.argv[2]), NEW = path.resolve(process.argv[3]), OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const L = m => console.log('§FACTS ' + m), TZ = 'Asia/Kuala_Lumpur', WIN = '167', USER = '100';
const run = (script, args, env) => { const r = spawnSync(process.execPath, [path.join(__dirname, script)].concat(args), { env: Object.assign({}, process.env, env || {}), encoding: 'utf8', timeout: 280000, stdio: ['ignore', 'pipe', 'pipe'] }); return r; };
const grab = (r, tag) => { const m = new RegExp('^' + tag + ' (.*)$', 'm').exec(r.stdout || ''); if (!m) { L('FAIL ' + tag + ' missing: ' + String(r.stderr || r.stdout).slice(0, 300)); process.exit(1); } return JSON.parse(m[1]); };
const out = { made: new Date().toISOString(), tz: TZ, commits: { old: spawnSync('git', ['-C', OLD, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim(), neu: spawnSync('git', ['-C', NEW, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim() }, states: {} };
for (const [id, tree] of [['old', OLD], ['new', NEW]]) {
  const db = path.join(OUT, 'kernel_' + id + '.db'), png = path.join(OUT, 'page_' + id + '.png');
  const k = grab(run('kernel_run.js', [tree, db], { TZ }), 'KR_RESULT');
  if (!k.invoice || !k.steps.order || !k.steps.ship || !k.steps.invoice) { L('FAIL ' + id + ' the kernel did not make an invoice ' + JSON.stringify(k.errors)); process.exit(1); }
  const p = grab(run('page_shot.js', [NEW, db, USER, WIN, png], { PS_RECORD: String(k.invoice.c_invoice_id) }), 'PS_RESULT');
  const f = p.fields || {}, pageDate = f['Date Invoiced'], rowDay = String(k.invoice.dateinvoiced).slice(0, 10);
  out.states[id] = { commit: out.commits[id === 'old' ? 'old' : 'neu'], localDay: k.localDay, utcDay: k.utcDay, sessionDay: k.sessionDay, kernelInvoice: k.invoice, page: { png: path.relative(__dirname, png), docNo: f['Document No'], dateInvoiced: pageDate, dateOrdered: f['Date Ordered'], grandTotal: f['Grand Total'], status: f['Status'], errors: p.pageErrors }, same: pageDate === rowDay };
  L('state ' + id + ' commit=' + out.states[id].commit + ' tz=' + TZ + ' local_clock=' + k.local + ' sessionDay=' + k.sessionDay + ' kernel_row.dateinvoiced=' + k.invoice.dateinvoiced + ' kernel_row.created=' + k.invoice.created + ' page.docNo=' + f['Document No'] + ' page.dateInvoiced=' + pageDate + ' page.grandTotal=' + f['Grand Total'] + ' pageErrors=' + p.pageErrors.length + ' same=' + (pageDate === rowDay ? 'Y' : 'N'));
}
const o = out.states.old, n = out.states.new;
const P = o.same && n.same && !o.page.errors.length && !n.page.errors.length;
const B = o.page.dateInvoiced === o.utcDay && o.page.dateInvoiced !== o.localDay && n.page.dateInvoiced === n.localDay;
out.checks = { P, B }; fs.writeFileSync(path.join(OUT, 'facts.json'), JSON.stringify(out, null, 1));
L('CHECK_P page == kernel row in both states: ' + (P ? 'PASS' : 'FAIL')); L('CHECK_B OLD invoice is on the UTC day (' + o.utcDay + ') not the local day (' + o.localDay + '), NEW on the local day: ' + (B ? 'PASS' : 'FAIL'));
L('VERDICT ' + (P && B ? 'PASS' : 'FAIL')); process.exit(P && B ? 0 : 1);
