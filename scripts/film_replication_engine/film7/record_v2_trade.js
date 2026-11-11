#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film7 "Migrating Legacy Accounting" (EN) RECORD step. READ out/record.log after EVERY run (exit code is not evidence). Scope: drive the SHIPPED idempiere.html (headless Chromium,
//   --disable-gpu, no GPU lock) through the four migration forms and write stills of the REAL page + `§FILMREC FACT k=v src=...` lines read from the page's own logs / the tenant's rows. Never typed numbers.
//   Odoo: full path (pick file, summary, Process, period gate, refusal naming the amount, recovery, repeat). iDempiere / SAP B1 / BC: pick + summary + Process of the open-balance file the SHIPPED readers wrote (prep7.js).
//   SAP + BC = ALPHA (test-supplied ledger). Method model: bim-ootb erp/tests/witness_migration_journey.js (helper region reused). Run: node record7.js <erp-tree-root> <outdir> <indir>
'use strict';
var path = require('path'), http = require('http'), fs = require('fs'), url = require('url');
var ROOT = process.argv[2], OUT = process.argv[3], IN = process.argv[4], FIXD = path.join(ROOT, 'erp/tests/fixtures/odoo_export_2026-11-10'), TMP = fs.mkdtempSync(path.join(require('os').tmpdir(), 'f7-'));
var MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm', '.png': 'image/png', '.css': 'text/css', '.svg': 'image/svg+xml' };
function reqPw() { try { return require('playwright'); } catch (e) { return require('/home/red1/bim-ootb/tests/node_modules/playwright'); } }
fs.mkdirSync(OUT, { recursive: true });
var J = JSON.stringify, FACTS = {};
function say(s) { console.log(s); }
function fact(k, v, src) { FACTS[k] = v; say('§FILMREC FACT ' + k + '=' + J(v) + (src ? ' src=' + String(src).slice(0, 240) : '')); }
var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
var cents = function (v) { return Math.round(Number(v || 0) * 100); }, money = function (c) { return (c / 100).toFixed(2); };
var EXP = JSON.parse(fs.readFileSync(path.join(FIXD, 'odoo_export.json'), 'utf8')), CUT = EXP.manifest.cutover;
var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
var FORMS = { odoo: { id: 9542001, cls: 'org.kernel.odoo.MigrateFromOdoo' }, bc: { id: 9543001, cls: 'org.kernel.bc.MigrateFromBC' }, sap: { id: 9544001, cls: 'org.kernel.sap.MigrateFromB1' }, ido: { id: 9545001, cls: 'org.kernel.idempiere.MigrateFromIdempiere' } };
(async function () {
  var OCV = await import(url.pathToFileURL(path.join(ROOT, 'erp', 'plugins', 'odoo_migrate_convert.mjs')).href), VARS = OCV.TEMPLATE.variables, CLR = { AR: VARS.AR_CLEARING, AP: VARS.AP_CLEARING, BANK: VARS.BANK_CLEARING };
  var server = http.createServer(function (req, res) {
    var u = new URL(req.url, 'http://x'), p = decodeURIComponent(u.pathname), f = path.join(ROOT, p === '/' ? '/erp/idempiere.html' : p);
    if (f.indexOf(ROOT) !== 0 || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  await new Promise(function (r) { server.listen(0, '127.0.0.1', r); });
  var base = 'http://127.0.0.1:' + server.address().port, browser = await reqPw().chromium.launch({ args: ['--disable-gpu'] });
  var ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } }), logs = [], errs = [];
  try { await ctx.clock.setFixedTime(new Date(CUT + 'T09:00:00')); } catch (e) { say('§JRN-CLOCK not fixed: ' + e.message); }   // the page's "today" = the cut-over day, so the witness does not age
  async function open() {
    var pg = await ctx.newPage(); pg.on('console', function (m) { logs.push(m.text()); }); pg.on('pageerror', function (e) { errs.push(e.message); });
    await pg.goto(base + '/erp/idempiere.html?lang=en_US', { waitUntil: 'load' });
    await pg.waitForFunction(function () { return !!window.__idmpDb && document.querySelector('#idmp-login-clients') && document.querySelector('#idmp-login-clients').children.length > 0; }, null, { timeout: 120000 });
    await sleep(2500); return pg;
  }
  async function login(pg, client, user, role) {
    var clickNm = function (sel, nm) { return pg.evaluate(function (a) { var el = Array.prototype.slice.call(document.querySelectorAll(a[0])).filter(function (r) { var n = r.querySelector('.nm'); return n && n.textContent.trim() === a[1]; })[0]; if (el) el.click(); return !!el; }, [sel, nm]); };
    if (!await clickNm('#idmp-login-clients .idmp-login-user', client)) throw new Error('login: no company "' + client + '" on the login screen');
    await pg.waitForSelector('#idmp-login-users .idmp-login-user', { timeout: 15000 });
    if (!await clickNm('#idmp-login-users .idmp-login-user', user)) throw new Error('login: no user "' + user + '"'); await pg.waitForSelector('#idmp-login-step2:visible');
    if (role != null) { try { await pg.selectOption('#idmp-login-role', String(role)); } catch (e) {} }
    await pg.evaluate(function () { document.getElementById('idmp-login-ok').click(); });
    await pg.waitForFunction(function () { return document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0 && document.getElementById('idmp-login').style.display === 'none'; }, null, { timeout: 60000 }); await sleep(1500);
  }
  function dupScan(pg) { return pg.evaluate(function () { var out = []; var ts = window.__idmpDb.exec("SELECT name FROM sqlite_master WHERE type='table'")[0].values.map(function (v) { return v[0]; });
    ts.forEach(function (t) { try { var cols = window.__idmpDb.exec('PRAGMA table_info(' + t + ')')[0].values.map(function (v) { return v[1]; }), pk = t + '_id'; if (cols.indexOf(pk) < 0) return;
      var r = window.__idmpDb.exec('SELECT count(*), count(DISTINCT ' + pk + ') FROM ' + t)[0].values[0]; if (r[0] !== r[1]) out.push(t + ':' + r[0] + '/' + r[1]); } catch (e) {} }); return out; }); }
  async function sw(pg, client, user, role) { await pg.evaluate(function () { document.getElementById('idmp-switch-btn').click(); }); await pg.waitForSelector('#idmp-login-clients .idmp-login-user', { timeout: 20000 }); await sleep(1200); await login(pg, client, user, role); await sleep(2500); }
  // read the tenant's rows back: ModelLayer.run over the tip (bundle + this session's committed op groups), the same read OFL uses
  function Q(pg, sql, p) { return pg.evaluate(function (a) { return new Promise(function (res) { window.__crud.modelRun({ table: 'c_bpartner', timing: 'PROCESS', fn: function (trx) { try { res(trx.q(a[0], a[1] || [])); } catch (e) { res({ err: String(e.message) }); } return { ok: true }; } }, function () {}); }); }, [sql, p || []]); }
  async function N1(pg, sql, p) { var r = await Q(pg, sql, p); return Array.isArray(r) && r[0] ? r[0].n : r; }
  async function snap(pg, C) { var o = {}; for (var t of ['c_bpartner', 'm_product', 'c_elementvalue', 'i_gljournal', 'i_invoice', 'i_bankstatement', 'gl_journalbatch', 'gl_journal', 'c_invoice', 'fact_acct', 'c_charge', 'c_bankstatement']) o[t] = await N1(pg, 'SELECT count(*) AS n FROM ' + t + ' WHERE ad_client_id=?', [C]); return o; }
  function openForm(pg, id) { return pg.evaluate(function (id) { var lf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); if (!lf) return false; var n = lf.parentElement; while (n && n.id !== 'idmp-tree') { if (n.style) n.style.display = ''; n = n.parentElement; } lf.click(); return true; }, id || 9542001); }
  var FORM = '[data-gform="org.kernel.odoo.MigrateFromOdoo"]', ANS = { 'Unit: Units': 'Each', 'Unit: Days': 'Day', 'Unit: Hours': 'Hour' };
  async function pick(pg, file) {   // pick the file(s), answer the units, Refresh; returns the summary rows
    await pg.setInputFiles('[data-gform-param="Files"]', file);
    await pg.waitForFunction(function () { return document.querySelectorAll('[data-gform-row]').length > 10; }, null, { timeout: 60000 }).catch(function () {});
    return pg.evaluate(function (A) { var asked = []; document.querySelectorAll('[data-gform-row]').forEach(function (tr) { var it = tr.children[1] && tr.children[1].innerText.trim(), inp = tr.querySelector('[data-gform-cell="erpunit"]'); if (inp) { asked.push(it); if (A[it]) inp.value = A[it]; } }); return asked; }, ANS);
  }
  async function refresh(pg) {
    var mark = logs.length; await pg.click(FORM + ' [data-gform-refresh]');
    await pg.waitForFunction(function () { return !Array.prototype.some.call(document.querySelectorAll('[data-gform-row]'), function (t) { return /Answer the unit/.test(t.innerText); }); }, null, { timeout: 90000 }).catch(function () {});
    for (var i = 0; i < 120 && !logs.slice(mark).some(function (l) { return /§[A-Z]+-FORM summary/.test(l); }); i++) await sleep(500);
    await sleep(800);
    var sum = logs.slice(mark).filter(function (l) { return /§[A-Z]+-FORM summary/.test(l); }).pop() || '';
    var rows = await pg.evaluate(function () { return Array.prototype.map.call(document.querySelectorAll('[data-gform-row]'), function (tr) { var c = Array.prototype.map.call(tr.children, function (td) { return td.innerText.trim(); }); return { item: c[1], odoo: c[2], infile: c[3], will: c[6], already: c[7], refused: c[8], reason: c[9] }; }); });
    return { sum: sum, rows: rows };
  }
  async function runProc(pg) {   // press Process; wait until stage 1 AND stage 2 are settled; returns the form message and the shipped lines
    var mark = logs.length; await pg.click(FORM + ' [data-gform-run]');
    for (var i = 0; i < 480; i++) { var L = logs.slice(mark);
      if (L.some(function (l) { return /§AD-FORM-GENERIC run class=org\.kernel\.[a-z]+\.Migrate[A-Za-z0-9]+ ok=false/.test(l); })) break;
      if (L.some(function (l) { return /§AD-FORM-GENERIC (commit-after|after) class=org\.kernel\.[a-z]+\.Migrate[A-Za-z0-9]+ ok=false/.test(l); })) break;
      if (L.some(function (l) { return /§AD-FORM-GENERIC commit-after class=org\.kernel\.[a-z]+\.Migrate[A-Za-z0-9]+/.test(l); })) break;
      await sleep(500); }
    await sleep(1500);
    var msg = await pg.evaluate(function () { var m = document.querySelector('[data-gform-msg]'); return m ? { t: m.innerText, c: m.className } : { t: '', c: '' }; });
    var L = logs.slice(mark);
    return { msg: msg.t, cls: msg.c, run: L.filter(function (l) { return /§AD-FORM-GENERIC run class=org\.kernel\.[a-z]+/.test(l); }).pop() || '', commit: L.filter(function (l) { return /§AD-FORM-GENERIC commit class=org\.kernel\.[a-z]+/.test(l); }).pop() || '',
      after: L.filter(function (l) { return /§AD-FORM-GENERIC after class=org\.kernel\.[a-z]+/.test(l); }).pop() || '', ver: L.filter(function (l) { return /^§MIG-VERIFY/.test(l); }).pop() || '', dbg: L.filter(function (l) { return /IMPORT_GLJ|§PROC-(SQL|UNPORTED)|MODEL-(ERR|WARN)|Invalid CurrencyType|ConversionType|PeriodClosed|Period Closed/.test(l); }).slice(0, 60), mig: L.filter(function (l) { return /^§MIG-(TB|CLEAR|OPEN|BANK|OPENBAL)/.test(l); }) };
  }
  function show(tag, r) { say('§JRN-' + tag + ' msg=' + J(String(r.msg).slice(0, 420)) + ' | ' + String(r.run).slice(0, 200) + ' | ' + String(r.after).slice(0, 260)); (r.mig || []).forEach(function (l) { say('   shipped> ' + l.slice(0, 260)); }); if (r.ver) say('   shipped> ' + r.ver); (r.dbg || []).forEach(function (l) { say('   trxlog> ' + l.slice(0, 300)); }); }
  function wf(name, data) { var f = path.join(TMP, name); fs.writeFileSync(f, JSON.stringify(data)); return f; }
  async function books(pg, C) {   // the tenant's books, read back, by account value (ALL Fact_Acct of the tenant)
    var fa = await Q(pg, 'SELECT ev.value AS v, SUM(f.amtacctdr) AS dr, SUM(f.amtacctcr) AS cr FROM fact_acct f JOIN c_elementvalue ev ON ev.c_elementvalue_id=f.account_id WHERE f.ad_client_id=? GROUP BY ev.value', [C]), o = {}, sum = 0;
    (Array.isArray(fa) ? fa : []).forEach(function (r) { o[r.v] = cents(r.dr) - cents(r.cr); sum += o[r.v]; }); return { by: o, sum: sum };
  }
  async function docs(pg, C) { return Q(pg, 'SELECT i.documentno AS no, i.docstatus AS s, i.posted AS p, i.ispaid AS paid, i.grandtotal AS t, dt.docbasetype AS b FROM c_invoice i JOIN c_doctype dt ON dt.c_doctype_id=i.c_doctype_id WHERE i.ad_client_id=?', [C]); }

  async function shot(pg, name) {   // the REAL screen (full viewport); scrolled so the thing the beat talks about is inside it
    await pg.evaluate(function (mode) { var e = null;
      if (mode === 'msg') e = document.querySelector('[data-gform-msg]');
      else if (mode === 'problem') e = Array.prototype.slice.call(document.querySelectorAll('[data-gform-row]')).filter(function (t) { return /⚠/.test(t.innerText); })[0];
      else e = document.querySelector('[data-gform] h3');
      if (e) e.scrollIntoView({ block: mode === 'msg' ? 'end' : mode === 'problem' ? 'center' : 'start' }); }, /(done|refused|refusal|recovered|repeat)$/.test(name) ? 'msg' : /period_gate/.test(name) ? 'problem' : 'top');
    await sleep(700);
    var rc = await pg.evaluate(function () { var r = function (e) { if (!e) return null; var b = e.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }; };
      var prob = Array.prototype.slice.call(document.querySelectorAll('[data-gform-row]')).filter(function (t) { return /⚠/.test(t.innerText); })[0];
      return { pane: r(document.querySelector('[data-gform]')), msg: r(document.querySelector('[data-gform-msg]')), prob: r(prob) }; });
    fs.writeFileSync(path.join(OUT, name + '.json'), J(rc));
    await pg.screenshot({ path: path.join(OUT, name + '.png') }); say('§FILMREC SHOT ' + name + '.png ' + J(rc)); }
  async function unitsAndRefresh(pg) { await pg.evaluate(function (A) { document.querySelectorAll('[data-gform-row]').forEach(function (tr) { var it = tr.children[1] && tr.children[1].innerText.trim(), inp = tr.querySelector('[data-gform-cell="erpunit"]'); if (inp && !inp.value) inp.value = A[it] || 'Each'; }); }, ANS); return refresh(pg); }
  async function pickAny(pg, files, cutover) { await pg.setInputFiles('[data-gform-param="Files"]', files); await sleep(2500); if (cutover) { var c = await pg.$('[data-gform-param="Cutover"]'); if (c) await c.fill(cutover); } }

  try {
    try { var oc = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 }), op = await oc.newPage();
      await op.goto('http://localhost:8069/web/login'); await op.fill('#login', 'admin'); await op.fill('#password', 'admin'); await op.click('button[type=submit]'); await op.waitForURL(/\/(web|odoo)/, { timeout: 60000 });
      await op.goto('http://localhost:8069/web#action=base.action_partner_form'); await op.waitForSelector('.o_kanban_record', { timeout: 60000 }); await sleep(2500);
      await op.screenshot({ path: path.join(OUT, 'odoo_src_customers.png') });
      fact('odoo_src_customer_cards', await op.$$eval('.o_kanban_record:not(.o_kanban_ghost)', function (a) { return a.length; }), 'odoo DOM (localhost:8069 Customers)');
      await oc.close(); } catch (e) { say('§FILMREC DROP odoo_src_customers ' + e.message.slice(0, 120)); }

    var pg = await open(); await login(pg, 'System', 'System', 0);
    async function birthTenant(name, admin, dateAcct) { return pg.evaluate(async function (a) { var b = window.Genesis.birthTenant({ clientName: a[0], currencyId: 100, currencyIso: 'USD', currencyPrecision: 2, adminUser: a[1], dateAcct: a[2], countryId: 100 }); return await window.idmpInstallGenesis(b); }, [name, admin, dateAcct]); }
    var T = await birthTenant('iDempiere Co', 'idAdmin', CUT), rr = await Q(pg, "SELECT ad_role_id AS r FROM ad_role WHERE ad_client_id=? AND name LIKE '%Admin'", [T.clientId]), role = rr[0].r;
    await pg.evaluate(function () { window.PluginRelease.open(); }); await pg.waitForSelector('#pr-osgi table.oc-t', { timeout: 15000 }); await sleep(800);
    for (var id of ['org.idempiere.ninja.migrate', 'org.kernel.idempiere.migrate']) { if (await pg.$('[data-oc-start="' + id + '"]')) { await pg.click('[data-oc-start="' + id + '"]'); await sleep(2500); } }
    await pg.evaluate(function () { var x = document.querySelector('[data-pr-close]'); if (x) x.click(); }); await sleep(500);
    FORM = '[data-gform="' + FORMS.ido.cls + '"]'; await sw(pg, 'iDempiere Co', 'idAdmin', role); await openForm(pg, FORMS.ido.id); await pg.waitForSelector(FORM + ' [data-gform-param="Files"]', { timeout: 20000 });
    await pickAny(pg, path.join(IN, 'idempiere_open.json'), null); await unitsAndRefresh(pg); await runProc(pg);
    // ---- generic window-edit driver (the way a user does): New, fill fields by AD column, Save, doc action; every step logged ----
    var W = '#idmp-content';
    async function setCol(col, want, mode) {   // like a user: Playwright selectOption / fill / check on the real control
      var sel = W + ' [data-col="' + col + '"]:not(span)', info = await pg.evaluate(function (a) { var e = document.querySelector(a); return e ? { tag: e.tagName, type: e.type, opts: e.tagName === 'SELECT' ? Array.prototype.map.call(e.options, function (x) { return [x.value, x.text]; }) : null } : null; }, sel);
      if (!info) return 'NOFIELD';
      if (info.tag === 'SELECT') { var o = info.opts.filter(function (x) { return mode === 'first' ? x[0] !== '' : (x[1].indexOf(want) >= 0 || x[0] === want); })[0]; if (!o) return 'NOOPT ' + J(info.opts.slice(0, 8)); await pg.selectOption(sel, o[0]); await sleep(700); return 'SEL ' + o[1] + ' now=' + await pg.$eval(sel, function (e) { return e.value; }); }
      if (info.type === 'checkbox') { await pg.setChecked(sel, !!want); return 'CHK'; } await pg.fill(sel, String(want)); await pg.press(sel, 'Tab'); await sleep(500); return 'VAL ' + await pg.$eval(sel, function (e) { return e.value; });
    }
    async function tb(prefix) { var ok = await pg.evaluate(function (p) { var b = Array.prototype.slice.call(document.querySelectorAll('#idmp-content button')).filter(function (x) { return (x.getAttribute('title') || '').indexOf(p) === 0; })[0]; if (!b) return false; b.click(); return true; }, prefix); await sleep(2500); return ok; }
    async function status() { return pg.evaluate(function () { var t = []; document.querySelectorAll('.idmp-toast, [class*=toast], [class*=status], #idmp-status').forEach(function (e) { var x = (e.innerText || '').trim(); if (x) t.push(x.slice(0, 200)); }); return t.slice(-4); }); }
    var TC = T.clientId, rowsOf = async function (sql, p) { return Q(pg, sql, p || [TC]); };
    var inv0 = await rowsOf("SELECT c_invoice_id AS id, documentno AS no, grandtotal AS t, ispaid AS paid, c_bpartner_id AS bp FROM c_invoice WHERE ad_client_id=? AND docstatus='CO' ORDER BY c_invoice_id");
    say('§FILMREC TRADE invoices-before ' + J(inv0)); var pay0 = await rowsOf('SELECT count(*) AS n FROM c_payment WHERE ad_client_id=?'); say('§FILMREC TRADE payments-before ' + J(pay0));
    await openForm(pg, 235); await sleep(5000); await pg.screenshot({ path: path.join(OUT, 'trade_00_payment_window.png') });
    say('§FILMREC TRADE new ' + await tb('New'));
    say('§FILMREC TRADE doctype ' + await setCol('c_doctype_id', 'AR Receipt'));
    say('§FILMREC TRADE bp ' + await setCol('c_bpartner_id', 'C&W')); await sleep(1500);
    say('§FILMREC TRADE invoice ' + await setCol('c_invoice_id', '200002')); await sleep(1500);
    say('§FILMREC TRADE payamt ' + await setCol('payamt', '161.12')); say('§FILMREC TRADE bank ' + await setCol('c_bankaccount_id', '5678')); await sleep(1000);
    say('§FILMREC TRADE payamt-after-invoice ' + await pg.evaluate(function () { var e = document.querySelector('#idmp-content input[data-col="payamt"]'); return e && e.value; }));
    await pg.screenshot({ path: path.join(OUT, 'trade_01_payment_filled.png') });
    say('§FILMREC TRADE save ' + await tb('Save (')); say('§FILMREC TRADE status ' + J(await status()));
    logs.filter(function (l) { return /§AD-MODELVAL|Mandatory|§MODEL-ERR|§SAVE/.test(l); }).slice(-6).forEach(function (l) { say('§FILMREC TRADE pagelog ' + l.slice(0, 400)); });
    await pg.screenshot({ path: path.join(OUT, 'trade_02_payment_saved.png') });
    say('§FILMREC TRADE docstatus-options ' + await pg.evaluate(function () { var e = document.querySelector('#idmp-content select[data-col="docstatus"]'); return e ? Array.prototype.map.call(e.options, function (x) { return x.value + '=' + x.text; }).join(' ; ') + ' cur=' + e.value + ' disabled=' + e.disabled : 'none'; }));
    say('§FILMREC TRADE complete-set ' + await setCol('docstatus', 'CO')); say('§FILMREC TRADE save2 ' + await tb('Save (')); say('§FILMREC TRADE status2 ' + J(await status()));
    await pg.screenshot({ path: path.join(OUT, 'trade_03_payment_completed.png') });
    say('§FILMREC TRADE payments-after ' + J(await rowsOf('SELECT documentno AS no, docstatus AS s, payamt AS amt, isallocated AS alloc, posted AS p, c_invoice_id AS inv FROM c_payment WHERE ad_client_id=?')));
    say('§FILMREC TRADE invoice-after ' + J(await rowsOf("SELECT documentno AS no, ispaid AS paid FROM c_invoice WHERE ad_client_id=? AND c_invoice_id IN (SELECT c_invoice_id FROM c_invoice WHERE ad_client_id=?)", [TC, TC])));
  } catch (e) { say('§FILMREC CRASH ' + (e && e.stack || e)); process.exitCode = 1; }
  await browser.close(); server.close();
})();
