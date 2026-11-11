#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film7 v2: stills of the LEGACY iDempiere web UI (GardenWorld client only, read only: only opens windows / views, writes nothing). READ the log; exit code is not evidence.
// Run: node legacy_shots.js <outdir> [url]. Headless Chromium --disable-gpu. Prints §FILMREC LEGACY lines (what was reached / not reached).
'use strict';
const { chromium } = require('/home/red1/bim-ootb/tests/node_modules/playwright');
const path = require('path'), fs = require('fs');
const OUT = process.argv[2], URL = process.argv[3] || 'http://localhost:8088/webui/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--disable-gpu'] }), c = await b.newContext({ viewport: { width: 1920, height: 1080 } }), p = await c.newPage();
  await p.goto(URL, { timeout: 90000 }); await sleep(6000);
  const inputs = await p.$$('input.z-textbox'); console.log('§FILMREC LEGACY login inputs=' + inputs.length);
  await inputs[0].fill('GardenAdmin'); await inputs[1].fill('GardenAdmin'); await p.keyboard.press('Enter'); await sleep(5000);
  await p.screenshot({ path: path.join(OUT, 'zk_step1.png') });
  await p.locator('button:has-text("OK")').first().click({ timeout: 20000 }).catch((e) => console.log('§FILMREC LEGACY ok-click ' + e.message.slice(0, 80))); await sleep(9000);
  await p.screenshot({ path: path.join(OUT, 'zk_step2.png') });
  console.log('§FILMREC LEGACY after-ok ' + (await p.innerText('body')).replace(/\s+/g, ' ').slice(0, 500));
  const txt = async () => (await p.innerText('body')).replace(/\s+/g, ' ');
  // 1 · Account Viewer ("Account Info" on the home screen): read only, a viewer of Fact_Acct
  await p.waitForSelector('text="Account Info"', { timeout: 40000 }).catch((e) => console.log('§FILMREC LEGACY no-home ' + e.message.slice(0, 60)));
  await p.locator('text="Account Info"').first().click({ timeout: 10000 }).catch((e) => console.log('§FILMREC LEGACY accinfo-click ' + e.message.slice(0, 60))); await p.waitForSelector('select', { timeout: 30000 }).catch(() => {}); await sleep(2000);
  await p.screenshot({ path: path.join(OUT, 'legacy_account_viewer_a.png') }); console.log('§FILMREC LEGACY viewer ' + (await txt()).slice(0, 700));
  // query: summarise by Account (read only), run it, show the result
  const sel = p.locator('select').nth(4); // first "Sort by" select (0 = accounting schema)
  const opts = await p.$$eval('select', (ss) => ss.map((x) => Array.prototype.map.call(x.options, (o) => o.text).slice(0, 12)));
  console.log('§FILMREC LEGACY selects ' + JSON.stringify(opts.map((o) => o.slice(0, 6))));
  await sel.selectOption({ label: 'Account' }).catch((e) => console.log('§FILMREC LEGACY sortby ' + e.message.slice(0, 80)));
  await p.mouse.click(1567, 306); await sleep(800);
  await p.locator('button:has(i.z-icon-refresh), .z-button >> nth=-1').last().click({ timeout: 5000 }).catch((e) => console.log('§FILMREC LEGACY refresh ' + e.message.slice(0, 80))); await sleep(6000);
  await p.screenshot({ path: path.join(OUT, 'legacy_account_viewer_b.png') }); { const t = await txt(); fs.writeFileSync(path.join(OUT, 'legacy_result.txt'), t); console.log('§FILMREC LEGACY result chars=' + t.length); }
  for (const [acct, nm] of [['11100_Checking Account', 'legacy_bank'], ['12110_Accounts Receivable - Trade', 'legacy_ar']]) {
    const ok = await p.evaluate((a) => { const rows = Array.prototype.slice.call(document.querySelectorAll('tr, .z-listitem')).filter((r) => new RegExp('^' + a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+[\\d,]+\\.\\d\\d\\s+[\\d,]+\\.\\d\\d$').test(r.innerText.replace(/\s+/g, ' ').trim())); const r = rows[0]; if (!r) return false; r.scrollIntoView({ block: 'center' }); return r.innerText.replace(/\s+/g, ' ').trim(); }, acct);
    await sleep(800); await p.screenshot({ path: path.join(OUT, nm + '.png') }); console.log('§FILMREC LEGACY ' + nm + ' row=' + JSON.stringify(ok));
  }
  await b.close();
})().catch((e) => { console.log('§FILMREC LEGACY CRASH ' + e.message.slice(0, 200)); process.exit(1); });
