// ⚠ DO NOT REMOVE — Scope: layout check of every card of "Think Global, Act Local", all steps shown; prints §LAYOUT card=… overflow lines (text past
// the 1920x930 page, or the source line overlapped) and writes out/layout/<card>.png. Authoring aid; the recorder's own probe is the gate.
'use strict';
const { chromium } = require(require('os').homedir() + '/bim-ootb/tests/node_modules/playwright');
const fs = require('fs'), path = require('path'), Cards = require('./cards.js');
const F = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts.resolved.json'), 'utf8')).facts, C = Cards.build(F), OUT = path.join(__dirname, 'out', 'layout'); fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  const p = await (await b.newContext({ viewport: { width: 1920, height: 930 } })).newPage(); await p.setContent(`<html><head><style>${Cards.CSS}</style></head><body><div id="root"></div></body></html>`);
  for (const k of Object.keys(C)) { await p.evaluate(h => { document.getElementById('root').innerHTML = h; }, C[k].html); await p.waitForTimeout(150);
    const bad = await p.evaluate(() => { const o = []; document.querySelectorAll('#root *').forEach(e => { const r = e.getBoundingClientRect(); if (r.width && (r.right > 1921 || r.bottom > 931)) o.push((e.className || e.tagName) + ' r=' + Math.round(r.right) + ' b=' + Math.round(r.bottom)); });
      const s = document.querySelector('.src'); if (s) { const sr = s.getBoundingClientRect(); document.querySelectorAll('.bx,img,table,svg,.term').forEach(e => { const q = e.getBoundingClientRect(); if (q.bottom > sr.top + 1) o.push('over source: ' + (e.className.baseVal !== undefined ? 'svg' : e.className || e.tagName) + ' b=' + Math.round(q.bottom) + ' src.top=' + Math.round(sr.top)); }); } return o.slice(0, 6); });
    await p.screenshot({ path: path.join(OUT, k + '.png') }); console.log('§LAYOUT card=' + k + ' problems=' + bad.length + (bad.length ? ' ' + bad.join(' | ') : '')); }
  await b.close(); })();
