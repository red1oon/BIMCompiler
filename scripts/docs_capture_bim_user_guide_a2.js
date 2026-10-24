#!/usr/bin/env node
// ⚠ DO NOT REMOVE — docs capture for docs/BIMUserGuide.md, PART A2 (Duplex): every documented Find query phrase, Hover Name key,
// closing Find with F / ×, and the Fly Tour scrub bar (guide: beat counter, elapsed/total, ticks, ◀◀ ▶▶, 0.5x/1x/2x, loop).
// Spec: prompts/DOCS_GUIDE_REFRESH.md. Read the log after every run — exit code is not evidence.
'use strict';
const path = require('path');
const L = require('./docs_capture_lib.js');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.env.OUT || path.join(ROOT, 'docs', 'img', 'viewer'));
const LOG = process.env.LOG || '/tmp/docs_capture_bim_user_guide_a2.log';

(async () => {
  const c = await L.start({ out: OUT, log: LOG, report: path.join(ROOT, 'scripts', 'docs_reports', 'docs_capture_bim_user_guide_a2.report.json'), gpu: process.env.GPU || 'sw', w: 1440, h: 900 });
  const { page, log, report, shot, sleep } = c;
  const step = (k, v) => { report.steps[k] = v; log('§DOCS_' + k + ' ' + JSON.stringify(v).slice(0, 1800)); };
  const mclick = async (sel) => { const xy = await page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, sel); if (!xy) throw new Error('mclick: no ' + sel); await page.mouse.click(xy[0], xy[1]); };
  const pollFor = async (label, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) { log('§DOCS_WAIT ' + label + ' ok after ' + (Date.now() - t0) + 'ms'); return true; } await sleep(500); } log('§DOCS_WAIT ' + label + ' TIMEOUT ' + ms + 'ms'); return false; };
  const findShown = () => { const f = document.getElementById('find-panel'); return !!f && f.getBoundingClientRect().width > 0; };
  const railOpen = async () => { const closed = await page.evaluate(() => getComputedStyle(document.getElementById('mobile-pill')).display === 'none'); if (closed) await mclick('#mobile-trigger'); await sleep(1200); };
  const toast = () => page.evaluate(() => { const e = document.getElementById('nlp-toast'); return e && e.getBoundingClientRect().width > 0 ? e.innerText.replace(/\s+/g, ' ').trim().slice(0, 240) : null; });
  const clearBox = async () => { await page.evaluate(() => { const i = document.getElementById('find-name'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); }); await sleep(500); };
  // a phrase goes in through sendCharacter (a real Space keydown is swallowed — §DOCS_SPACE in part A)
  const ask = async (q) => {
    await clearBox();
    await page.evaluate(() => { const e = document.getElementById('nlp-toast'); if (e) { const x = Array.from(e.querySelectorAll('button,span,div')).find(n => n.textContent.trim() === '×' || n.textContent.trim() === '✕'); if (x) x.click(); else e.remove(); } }); await sleep(400);
    await page.click('#find-name');
    for (const ch of q) { if (ch === ' ') await page.keyboard.sendCharacter(' '); else await page.keyboard.type(ch, { delay: 8 }); }
    await sleep(700);
    const before = await toast();
    const hint = await page.evaluate(() => document.getElementById('find-results')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 80));
    await page.keyboard.press('Enter'); await sleep(2500);
    const after = await toast();
    const filtered = await page.evaluate(() => document.getElementById('find-count')?.textContent.trim());
    return { q, hint, toast: after, count: filtered };
  };
  try {
    step('loaded', await c.openBuilding('Duplex_extracted.db'));
    await sleep(4000);
    await railOpen(); await mclick('#pill-navigate'); await sleep(1200); await mclick('#drawer-row-find');
    await pollFor('find-open', findShown, 120000); await sleep(1500);

    const phrases = process.env.PHRASES ? process.env.PHRASES.split('|') : ['count doors', 'how many beams', 'number of windows', 'total cost', 'cost of electrical', 'total area', 'total length of walls', 'total volume of slabs',
      'floor area', 'show electrical', 'list structure', 'what disciplines', 'find door', 'floor 2 beams', 'ground floor doors', 'total doors', 'cost'];
    const res = [];
    for (const q of phrases) { const r = await ask(q); res.push(r); log('§DOCS_PHRASE ' + JSON.stringify(r)); }
    step('phrases', res);
    if (process.env.PHRASES_ONLY) { await c.finish(true); return; }

    // closing: × vs F with the box focused vs F with focus elsewhere
    await clearBox(); await page.click('#find-name');
    await page.keyboard.press('f'); await sleep(800);
    step('fKeyInFocusedBox', { value: await page.evaluate(() => document.getElementById('find-name').value), panelStillOpen: await page.evaluate(findShown) });
    await clearBox();
    await page.mouse.click(700, 400); await sleep(400);          // focus the canvas
    await page.keyboard.press('f'); await sleep(1000);
    step('fKeyFocusOnCanvas', { panelOpen: await page.evaluate(findShown) });
    if (await page.evaluate(findShown)) { await mclick('#find-close'); await sleep(800); }
    step('afterX', { panelOpen: await page.evaluate(findShown) });

    // Hover Name: the guide says the apostrophe key toggles it; the checkbox is in the Find panel
    await page.keyboard.press('f'); await pollFor('find-reopen', findShown, 60000); await sleep(800);
    const cb0 = await page.evaluate(() => document.getElementById('find-hover-name-cb')?.checked);
    await page.mouse.click(700, 400); await page.keyboard.press("'"); await sleep(800);
    step('hoverNameKey', { before: cb0, after: await page.evaluate(() => document.getElementById('find-hover-name-cb')?.checked) });
    await mclick('#find-close'); await sleep(600);

    // Fly Tour: L
    await page.mouse.click(700, 400); await page.keyboard.press('l');
    const tourUp = await pollFor('tour-panel', () => { const p = document.getElementById('tour-scrub-panel'); return !!p && p.getBoundingClientRect().width > 0; }, 120000);
    await sleep(3000);
    step('tourScrub', await page.evaluate(() => { const g = (i) => document.getElementById(i); const p = g('tour-scrub-panel'); if (!p) return null; return { label: g('tour-scrub-label')?.textContent.trim(), time: g('tour-scrub-time')?.textContent.trim(), ticks: g('tour-scrub-ticks')?.children.length, buttons: Array.from(p.querySelectorAll('button')).map(b => b.id.replace('tour-scrub-', '') + '|' + (b.title || b.textContent.trim())), text: p.innerText.replace(/\s+/g, ' ').slice(0, 260) }; }));
    if (tourUp) await shot('fly-tour-scrub-bar', '#tour-scrub-panel');
    step('tourDone', await page.evaluate(() => ({ flyActive: !!(window.APP && window.APP.flyActive) })));
    await c.finish(true);
  } catch (e) { log('§DOCS_FAIL ' + (e && e.stack || e)); await c.finish(false); process.exitCode = process.exitCode || 1; }
})();
