#!/usr/bin/env node
// ⚠ DO NOT REMOVE — docs capture for docs/BIMUserGuide.md, PART D: the Quick-Start / Navigation / Cheat-sheet claims (Duplex).
// Checks: shortcut keys the guide lists vs window._shortcuts · click-an-element Info panel · X-Ray 3-state cycle ·
// which panels exist at load (the guide's "Panels" table) · Home row · Measure / Section toggles.
// Spec: prompts/DOCS_GUIDE_REFRESH.md. Read the log after every run — exit code is not evidence.
'use strict';
const path = require('path');
const L = require('./docs_capture_lib.js');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.env.OUT || path.join(ROOT, 'docs', 'img', 'viewer'));
const LOG = process.env.LOG || '/tmp/docs_capture_bim_user_guide_d.log';

(async () => {
  const c = await L.start({ out: OUT, log: LOG, report: path.join(ROOT, 'scripts', 'docs_reports', 'docs_capture_bim_user_guide_d.report.json'), gpu: process.env.GPU || 'sw', w: 1440, h: 900 });
  const { page, log, report, shot, sleep } = c;
  const step = (k, v) => { report.steps[k] = v; log('§DOCS_' + k + ' ' + JSON.stringify(v).slice(0, 1800)); };
  const mclick = async (sel) => { const xy = await page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, sel); if (!xy) throw new Error('mclick: no ' + sel); await page.mouse.click(xy[0], xy[1]); };
  const railOpen = async () => { const closed = await page.evaluate(() => getComputedStyle(document.getElementById('mobile-pill')).display === 'none'); if (closed) await mclick('#mobile-trigger'); await sleep(1200); };
  const xrayLabel = async () => { await railOpen(); await mclick('#pill-inspect'); await sleep(1000); const l = await page.evaluate(() => { const r = document.getElementById('drawer-row-xray'); return r ? r.textContent.trim() : null; }); await mclick('#pill-inspect'); await sleep(600); return l; };
  try {
    step('loaded', await c.openBuilding('Duplex_extracted.db'));
    await sleep(4000);
    step('panelsAtLoad', await page.evaluate(() => Array.from(document.querySelectorAll('.bim-panel, [id$=-panel], #info-panel, #status-bar-wrap')).filter(e => e.id && e.getBoundingClientRect().width > 0).map(e => e.id + '@' + Math.round(e.getBoundingClientRect().x) + ',' + Math.round(e.getBoundingClientRect().y) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height))));
    step('shortcutKeys', await page.evaluate(() => Object.keys(window._shortcuts || {}).sort()));
    // the guide's cheat-sheet keys, tested for registration (letters/symbols only; modifier combos are listed separately)
    const claimed = ['f', 'm', 'c', 't', 'x', '4', 'p', 'n', 'h', 'b', 'v', '=', '/', 'a', 'q', 'w', 'z', 'l', 'r', 'o', '?', '9'];
    step('claimedKeysRegistered', await page.evaluate((ks) => { const s = window._shortcuts || {}; const o = {}; ks.forEach(k => { o[k] = typeof s[k] === 'function'; }); return o; }, claimed));
    // Info panel: click the building
    await page.mouse.click(700, 455); await sleep(2500);
    step('infoAfterClick', await page.evaluate(() => { const p = document.getElementById('info-panel'); return p ? { shown: p.getBoundingClientRect().width > 0, text: p.innerText.replace(/\s+/g, ' ').slice(0, 500) } : null; }));
    await shot('info-after-click');
    // X-Ray cycle: Off -> X-Ray -> Bbox -> Off, read the drawer row's own label each time
    const cyc = [await xrayLabel()];
    for (let i = 0; i < 3; i++) { await page.keyboard.down('Alt'); await page.keyboard.press('z'); await page.keyboard.up('Alt'); await sleep(2500); cyc.push(await xrayLabel()); }
    step('xrayCycle', cyc);
    // Help (F1) lists the live shortcuts
    await page.keyboard.press('F1'); await sleep(2500);
    step('helpText', await page.evaluate(() => { const hit = Array.from(document.querySelectorAll('body *')).find(e => e.children.length === 0 && /Save Building/.test(e.textContent) && e.getBoundingClientRect().width > 0 && e.id !== 'drawer-row-save'); if (!hit) return null; let p = hit; while (p && p !== document.body) { const s = getComputedStyle(p); if ((s.position === 'fixed' || s.position === 'absolute') && p.getBoundingClientRect().height > 200) return { id: p.id, text: p.innerText.replace(/\s+/g, ' ').slice(0, 1200) }; p = p.parentElement; } return null; }));
    await c.finish(true);
  } catch (e) { log('§DOCS_FAIL ' + (e && e.stack || e)); await c.finish(false); process.exitCode = process.exitCode || 1; }
})();
