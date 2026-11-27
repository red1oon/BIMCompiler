// ⚠ DO NOT REMOVE — film "One line" (§24): ONE real screen for the "full of screens" beat: the live ERP's Sales Order window, opened headless on the CPU (--disable-gpu) by the page's own
// deep link (?login=&window=&record=). The tab and field counts shown on the card are read from the page's own § line, not typed. Writes out/shots/erp_so.png + out/shots.json. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const puppeteer = require(process.env.PUPPETEER_PATH || path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const URL = 'https://red1oon.github.io/bim-ootb/erp/idempiere.html?login=GardenAdmin&window=143&record=100', out = path.join(__dirname, 'out', 'shots'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1920,1080'] }), p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080 });
  const log = []; p.on('console', m => { const t = m.text(); if (/§IDEMPIERE/.test(t)) log.push(t); });
  await p.goto(URL, { waitUntil: 'load', timeout: 120000 });
  const t0 = Date.now(); while (Date.now() - t0 < 90000 && !log.some(l => /§IDEMPIERE-DEEPLINK record=100 landed/.test(l))) await new Promise(r => setTimeout(r, 500));
  await p.waitForFunction(() => document.querySelectorAll('input, select').length > 25, { timeout: 60000, polling: 500 });   // the form's fields are drawn (a landed record is not yet a drawn form)
  const drawn = await p.evaluate(() => document.querySelectorAll('input, select').length); console.log('§SHOT form controls drawn=' + drawn);
  await new Promise(r => setTimeout(r, 1500)); await p.screenshot({ path: path.join(out, 'erp_so.png') }); await b.close();
  const w = /§IDEMPIERE window=(.+?)\(143\) tabs=(\d+)/.exec(log.join('\n')), f = /§IDEMPIERE tab=Order table=C_Order rows=\d+ fields=(\d+)/.exec(log.join('\n'));
  if (!w || !f) { console.log('§SHOT_FAIL the page did not print its window and field lines'); process.exit(1); }
  fs.writeFileSync(path.join(__dirname, 'out', 'shots.json'), JSON.stringify({ url: URL, window: w[1], tabs: +w[2], fields: +f[1] }, null, 1));
  console.log('§SHOT erp_so.png window=' + w[1] + ' tabs=' + w[2] + ' fields=' + f[1] + ' landed=' + log.some(l => /DEEPLINK record=100 landed/.test(l)));
})().catch(e => { console.error('§SHOT_FAIL ' + (e && e.stack || e)); process.exit(1); });
