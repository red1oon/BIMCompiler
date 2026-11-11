#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film7 v2: a REAL terminal capture of the SAP B1 agent. READ the log; exit code is not evidence.
// What runs: the shipped erp/sap_agent/agent.js CLI (`node agent.js --url <mock> --company TESTDB --user manager --cutover D --openfile ...`, password via SAP_PASSWORD as the agent asks)
// against the TEST Service Layer mock (tests/sap_sl_open_mock.js, rows supplied by us: ALPHA, never a real SAP). Its stdout/stderr, byte for byte, are rendered into a terminal-styled page and screenshot (headless, no GPU).
// BC has NO program (Excel package read by the form), so there is no BC terminal screen. Run: node term_shot.js <erp-tree-root> <outdir>
'use strict';
const path = require('path'), fs = require('fs'), cp = require('child_process');
const { chromium } = require('/home/red1/bim-ootb/tests/node_modules/playwright');
const ROOT = process.argv[2], OUT = process.argv[3]; fs.mkdirSync(OUT, { recursive: true });
const ERP = path.join(ROOT, 'erp'), CUT = '2026-11-10';
(async () => {
  const SAPX = JSON.parse(fs.readFileSync(path.join(ERP, 'tests/fixtures/sapbc_open/sap_rows.json'), 'utf8')), MOCK = require(path.join(ERP, 'tests/sap_sl_open_mock.js')), mk = await MOCK.start(SAPX);
  const args = [path.join(ERP, 'sap_agent/agent.js'), '--url', mk.url, '--company', 'TESTDB', '--user', 'manager', '--cutover', CUT, '--out', 'sap_export.json', '--openfile', 'sap_open.json'];
  const r = await new Promise((res) => { const c = cp.spawn('node', args, { cwd: OUT, env: Object.assign({}, process.env, { SAP_PASSWORD: 'mock' }) }); let o = ''; c.stdout.on('data', (d) => (o += d)); c.stderr.on('data', (d) => (o += d)); c.on('close', (code) => res({ code, o })); });
  const calls = mk.calls.slice(); mk.close();
  const ro = calls.every((c) => /^GET /.test(c) || /^POST \/b1s\/v1\/(Login|Logout|CompanyService_GetAdminInfo)$/.test(c));
  console.log('§FILMREC TERM sap_agent rc=' + r.code + ' lines=' + r.o.split('\n').length + ' sl_calls=' + calls.length + ' read_only_calls=' + ro);
  fs.writeFileSync(path.join(OUT, 'term_sap.txt'), r.o);
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const cmd = 'SAP_PASSWORD=****  node sap_agent/agent.js --url http://127.0.0.1:PORT --company TESTDB --user manager --cutover ' + CUT + ' --out sap_export.json --openfile sap_open.json';
  const html = '<html><body style="margin:0;background:#0f172a"><div style="position:absolute;left:110px;top:100px;font:bold 42px DejaVu Sans;color:#7dd3fc">SAP Business One · the agent reads the test Service Layer</div>' +
    '<div style="position:absolute;right:90px;top:98px;font:bold 32px DejaVu Sans;color:#FF6B78">ALPHA · test-supplied ledger</div>' +
    '<pre style="position:absolute;left:110px;top:175px;width:1700px;height:640px;overflow:hidden;margin:0;padding:18px;background:#0b0f17;border:2px solid #334155;border-radius:10px;font:22px/30px DejaVu Sans Mono;color:#e2e8f0;white-space:pre-wrap">' +
    '<span style="color:#7dd3fc">$ ' + esc(cmd) + '</span>\n' + esc(r.o.split('\n').filter((l) => l.trim()).join('\n')) + '</pre></body></html>';
  fs.writeFileSync(path.join(OUT, 'term_sap.html'), html);
  const b = await chromium.launch({ args: ['--disable-gpu'] }), pg = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  await pg.goto('file://' + path.join(OUT, 'term_sap.html')); await pg.screenshot({ path: path.join(OUT, 'term_sap.png') }); await b.close();
  console.log('§FILMREC SHOT term_sap.png');
})().catch((e) => { console.log('§FILMREC TERM CRASH ' + e.message.slice(0, 200)); process.exit(1); });
