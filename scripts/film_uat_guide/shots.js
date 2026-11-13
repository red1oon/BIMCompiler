#!/usr/bin/env node
// ⚠ DO NOT REMOVE — Scope: prompts/FILM_UAT_GUIDE.md. Two pictures of the LIVE guide page (CPU, no GPU): its top with the Print button ringed (ring placed from the button's own DOM box), and the page's
// own print layout as a PDF (Chrome page.pdf(), what the Print button produces). Read the §FILM_SHOT lines.
// usage: node shots.js <out dir> [url]
'use strict';
const path = require('path'), fs = require('fs'), { chromium } = require(path.join(require('os').homedir(), 'bim-ootb/tests/node_modules/playwright'));
const OUT = path.resolve(process.argv[2]), URL = process.argv[3] || 'https://red1oon.github.io/BIMCompiler/CapexUATGuide/';
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu'] }), p = await b.newPage({ viewport: { width: 1600, height: 708 }, deviceScaleFactor: 1.2 });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto(URL + '?film=' + Date.now(), { waitUntil: 'networkidle' });
  const box = await p.evaluate(() => { const e = document.querySelector('.uat-noprint button'); if (!e) return null; const r = e.getBoundingClientRect(), d = document.createElement('div');
    d.style.cssText = 'position:fixed;z-index:99999;border:4px solid #e8372c;border-radius:10px;box-shadow:0 0 0 6px rgba(232,55,44,.25);pointer-events:none;left:' + (r.left - 8) + 'px;top:' + (r.top - 8) + 'px;width:' + (r.width + 8) + 'px;height:' + (r.height + 8) + 'px'; document.body.appendChild(d); d.id = 'film-ring';
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), text: e.innerText.trim() }; });
  await p.screenshot({ path: path.join(OUT, 'guide_top.png') });
  await p.evaluate(() => { const d = document.getElementById('film-ring'); if (d) d.remove(); });
  await p.emulateMedia({ media: 'print' }); await p.pdf({ path: path.join(OUT, 'print.pdf'), format: 'A4', printBackground: true });
  const title = await p.title();
  console.log('§FILM_SHOT url=' + URL + ' title=' + JSON.stringify(title) + ' button=' + JSON.stringify(box) + ' pageerrors=' + errs.length + ' print_pdf_kb=' + Math.round(fs.statSync(path.join(OUT, 'print.pdf')).size / 1024));
  await b.close(); process.exit(box && !errs.length ? 0 : 1);
})().catch(e => { console.log('§FILM_SHOT FAIL ' + (e && e.stack || e)); process.exit(1); });
