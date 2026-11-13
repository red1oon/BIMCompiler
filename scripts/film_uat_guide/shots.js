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
  await p.emulateMedia({ media: 'screen' });
  // rc3: the guide's own diagrams, each centred in the page as a reader scrolling would see it (the page itself, not the image file)
  const DIAG = ['uat_b1_sheet_0_floor_plan', 'uat_b1_sheet_3_beam_layout', 'uat_b1_sheet_4_foundation_layout', 'uat_b1_nine_opened', 'uat_b1_arranged', 'uat_b1_arranged_top', 'uat_b2_convert_button', 'uat_b2_converted'], seen = [];
  for (const k of DIAG) { const y = await p.evaluate(k => { const e = document.querySelector('img[src*="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(), y = Math.max(0, window.scrollY + r.top - (window.innerHeight - r.height) / 2); window.scrollTo(0, y); return Math.round(y); }, k);
    if (y == null) continue; await p.waitForTimeout(350); await p.screenshot({ path: path.join(OUT, 'site_' + k + '.png') }); seen.push(k + '@' + y); }
  console.log('§FILM_SHOT site_diagrams=' + seen.length + ' of ' + DIAG.length + ' ' + JSON.stringify(seen));
  // rc3: the prize, the dashboard on the guide's sample data, in its two layouts and two skins (the numbers must be the same in all four)
  const DASH = 'https://red1oon.github.io/bim-ootb/capex/index.html?snapshot=sample/pilot_snapshot.json&source=legacy&today=2026-11-04', flats = {};
  const dp = await b.newPage({ viewport: { width: 1600, height: 708 }, deviceScaleFactor: 1.2 });
  for (const [th, sk] of [['classic', 'light'], ['classic', 'dark'], ['executive', 'light'], ['executive', 'dark']]) {
    await dp.goto(DASH + '&theme=' + th + '&skin=' + sk + '&film=' + Date.now(), { waitUntil: 'load' }); await dp.waitForFunction(() => window.__capex && window.__capex.rendered, null, { timeout: 60000 }); await dp.waitForTimeout(900);
    const r = await dp.evaluate(() => ({ flat: window.__capex.flat, pa: window.__capex.pa, skin: document.body.getAttribute('data-skin') })); flats[th + '_' + sk] = JSON.stringify(r.flat);
    await dp.screenshot({ path: path.join(OUT, 'dash_' + th + '_' + sk + '.png') });
    console.log('§FILM_SHOT dashboard theme=' + th + ' skin=' + sk + ' body_skin=' + r.skin + ' pa=' + JSON.stringify(r.pa) + ' total_projects=' + r.flat.total_projects + ' approved_budget=' + r.flat.approved_budget + ' health=' + JSON.stringify(r.flat.health)); }
  const same = Object.values(flats).every(v => v === Object.values(flats)[0]);
  console.log('§FILM_SHOT dashboard looks=' + Object.keys(flats).length + ' numbers_same_in_all=' + same);
  if (!same || seen.length !== DIAG.length) { console.log('§FILM_SHOT FAIL a diagram is missing or the numbers differ between looks'); await b.close(); process.exit(1); }
  const title = await p.title();
  console.log('§FILM_SHOT url=' + URL + ' title=' + JSON.stringify(title) + ' button=' + JSON.stringify(box) + ' pageerrors=' + errs.length + ' print_pdf_kb=' + Math.round(fs.statSync(path.join(OUT, 'print.pdf')).size / 1024));
  await b.close(); process.exit(box && !errs.length ? 0 : 1);
})().catch(e => { console.log('§FILM_SHOT FAIL ' + (e && e.stack || e)); process.exit(1); });
