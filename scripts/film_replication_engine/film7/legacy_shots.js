#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film7 v2: stills of the LEGACY iDempiere web UI (GardenWorld client only, read only: only opens windows / views, writes nothing). READ the log; exit code is not evidence.
// Run: node legacy_shots.js <outdir> [url]. Headless Chromium --disable-gpu. Prints §FILMREC LEGACY lines (what was reached / not reached).
'use strict';
const { chromium } = require('/home/red1/bim-ootb/tests/node_modules/playwright');
const path = require('path');
const OUT = process.argv[2], URL = process.argv[3] || 'http://localhost:8088/webui/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--disable-gpu'] }), c = await b.newContext({ viewport: { width: 1920, height: 1080 } }), p = await c.newPage();
  await p.goto(URL, { timeout: 90000 }); await sleep(6000);
  const inputs = await p.$$('input.z-textbox'); console.log('§FILMREC LEGACY login inputs=' + inputs.length);
  await inputs[0].fill('GardenAdmin'); await inputs[1].fill('GardenAdmin'); await p.keyboard.press('Enter'); await sleep(5000);
  await p.screenshot({ path: path.join(OUT, 'zk_step1.png') });
  console.log('§FILMREC LEGACY body ' + (await p.innerText('body')).replace(/\s+/g, ' ').slice(0, 300));
  await b.close();
})().catch((e) => { console.log('§FILMREC LEGACY CRASH ' + e.message.slice(0, 200)); process.exit(1); });
