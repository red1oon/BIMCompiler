#!/usr/bin/env node
// ⚠ DO NOT REMOVE — docs capture for docs/BIMUserGuide.md, PART A: Quick Start → Find panel (Duplex).
// Spec: prompts/DOCS_GUIDE_REFRESH.md. Each step logs §DOCS_* and writes what the app reported to the JSON
// report; the guide may quote only those values. Read the log after every run — exit code is not evidence.
// Env: OUT (png dir, default docs/img/viewer) · GPU=sw|real (default sw)
'use strict';
const path = require('path');
const L = require('./docs_capture_lib.js');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.env.OUT || path.join(ROOT, 'docs', 'img', 'viewer'));
const LOG = process.env.LOG || '/tmp/docs_capture_bim_user_guide_a.log';

(async () => {
  const c = await L.start({ out: OUT, log: LOG, report: path.join(ROOT, 'scripts', 'docs_reports', 'docs_capture_bim_user_guide_a.report.json'), gpu: process.env.GPU || 'sw', w: 1440, h: 900 });
  const { page, log, report, shot, sleep } = c;
  const step = (k, v) => { report.steps[k] = v; log('§DOCS_' + k + ' ' + JSON.stringify(v).slice(0, 900)); };
  // the smallest visible fixed/absolute ancestor of an element whose text matches — for drawers with no id
  const tagPanel = (txt, mark) => page.evaluate((t, m) => {
    const cands = Array.from(document.querySelectorAll('body *')).filter(e => e.children.length === 0 && e.textContent.trim() === t && e.getBoundingClientRect().width > 0);
    for (const e of cands) {
      let p = e;
      while (p && p !== document.body) {
        const s = getComputedStyle(p), r = p.getBoundingClientRect();
        if ((s.position === 'fixed' || s.position === 'absolute') && r.width > 120 && r.height > 80) { p.setAttribute('data-docs', m); return { id: p.id, w: Math.round(r.width), h: Math.round(r.height) }; }
        p = p.parentElement;
      }
    }
    return null;
  }, txt, mark);
  const mclick = async (sel) => { const xy = await page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, sel); if (!xy) throw new Error('mclick: no ' + sel); await page.mouse.click(xy[0], xy[1]); };
  const pollFor = async (label, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) { log('§DOCS_WAIT ' + label + ' ok after ' + (Date.now() - t0) + 'ms'); return true; } await sleep(500); } log('§DOCS_WAIT ' + label + ' TIMEOUT ' + ms + 'ms'); return false; };
  const findShown = () => { const f = document.getElementById('find-panel'); return !!f && f.getBoundingClientRect().width > 0; };
  const railOpen = async () => { await page.evaluate(() => { const p = document.getElementById('mobile-pill'); const t = document.getElementById('mobile-trigger'); if (p && getComputedStyle(p).display === 'none' && t) t.click(); }); await sleep(800); };
  try {
    // ── Quick Start: the hub (fresh load, ?hub=1 = what the docs' #buildings link does)
    await c.page.goto(L.SITE + '?hub=1', { waitUntil: 'networkidle2', timeout: 120000 });
    await page.waitForFunction(() => document.querySelectorAll('#hub-body .hub-card[data-bld]').length > 10, { timeout: 120000 });
    await sleep(2500);
    step('hub', await page.evaluate(() => ({
      title: (document.querySelector('#hub h1,#hub .hub-title,#hub-body')?.textContent || '').slice(0, 0),
      cards: Array.from(document.querySelectorAll('#hub-body .hub-card[data-bld]')).map(e => ({ b: e.dataset.bld, t: e.querySelector('.mt')?.textContent.trim() })),
      sections: Array.from(document.querySelectorAll('#hub-body .hub-sh')).map(e => e.textContent.trim()),
      extra: Array.from(document.querySelectorAll('#hub-body .hub-card:not([data-bld]) .nm')).map(e => e.textContent.trim()),
      dropHint: document.querySelector('#m-import-zone')?.textContent.trim() })));
    await shot(path.join(process.env.ASSETS || path.join(ROOT, 'docs', 'assets'), 'buildings_page'), '#hub');

    // ── open Duplex (what the card does)
    step('duplexLoaded', await c.openBuilding('Duplex_extracted.db'));
    await sleep(2500);
    step('duplexStatus', await page.evaluate(() => (document.getElementById('status') || document.querySelector('[id*=status]'))?.textContent));

    // ── rail + Navigate icon
    await railOpen();
    step('rail', await page.evaluate(() => Array.from(document.querySelectorAll('#mobile-pill [id^=pill-]')).map(b => b.id.replace('pill-', '') + (b.getBoundingClientRect().width === 0 ? '(hidden)' : ''))));
    { // clip: Navigate button ±1 neighbour each side (the old image is a 208×300 strip of Inspect / Navigate / Open)
      const b = await page.evaluate(() => { const r = document.getElementById('pill-navigate').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
      const f = path.join(OUT, 'find-panel-navigate-icon.png');
      await page.screenshot({ path: f, clip: { x: Math.round(b.x - 104), y: Math.round(b.y - 150), width: 208, height: 300 } }); log('§DOCS_SHOT ' + f);
    }

    // ── Navigate drawer (rail → Navigate pill → rows)
    await mclick('#pill-navigate'); await sleep(1500);
    step('navDrawerRows', await page.evaluate(() => Array.from(document.querySelectorAll('.bim-drawer-row')).filter(e => e.getBoundingClientRect().width > 0).map(e => e.id.replace('drawer-row-', '') + '|' + e.textContent.trim())));
    await shot('find-panel-navigate-drawer', '#navigate-drawer-panel');
    // ── tap the Find / Navigate row (the guide's step 2)
    await mclick('#drawer-row-find');
    const viaRow = await pollFor('find-via-drawer-row', findShown, 90000);
    step('findViaDrawerRow', viaRow);
    if (!viaRow) { await page.keyboard.press('Escape'); await sleep(500); await page.mouse.click(700, 300); await page.keyboard.press('f'); step('findViaKeyFallback', await pollFor('find-via-F', findShown, 90000)); }
    await sleep(1500);
    step('findPanelOpen', await page.evaluate(() => ({
      placeholder: document.getElementById('find-name')?.placeholder,
      focused: document.activeElement?.id,
      chips: Array.from(document.querySelectorAll('#find-chips > *')).map(e => e.textContent.trim()),
      tabs: ['find-mode-find', 'find-mode-ask'].map(i => document.getElementById(i)?.textContent.trim()),
      outlinerBar: document.getElementById('find-outliner-bar')?.textContent.trim().slice(0, 120) })));
    await shot('find-panel-open', '#find-panel');

    // ── NL query: type, check it does not filter, Enter runs it
    // §DOCS_SPACE: a real Space keydown is preventDefault-ed by the panel-focus router (scene.js:3551, §KBD_ROUTE panel=find) —
    // measured below; the phrase is then entered with sendCharacter so the rest of the guide can be walked.
    await page.click('#find-name');
    await page.keyboard.type('a b', { delay: 40 });
    step('spaceKeyInFindBox', { typed: 'a b', value: await page.evaluate(() => document.getElementById('find-name').value) });
    await page.evaluate(() => { const i = document.getElementById('find-name'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); }); await sleep(500);
    await page.keyboard.type('count', { delay: 20 }); await page.keyboard.sendCharacter(' '); await page.keyboard.type('doors', { delay: 20 }); await sleep(1200);
    step('nlTyped', await page.evaluate(() => ({ results: document.getElementById('find-results')?.textContent.trim().slice(0, 200), count: document.getElementById('find-count')?.textContent.trim() })));
    await shot('find-nl-query', '#find-panel');
    const toast = () => page.evaluate(() => { const e = document.getElementById('nlp-toast'); return e && e.getBoundingClientRect().width > 0 ? e.innerText.replace(/\s+/g, ' ').trim().slice(0, 300) : null; });
    await page.keyboard.press('Enter');
    await pollFor('nl-toast', () => { const e = document.getElementById('nlp-toast'); return !!e && e.getBoundingClientRect().width > 0; }, 30000);
    await sleep(800);
    step('nlAnswer', { toast: await toast() });
    await shot('find-nl-answer', '#nlp-toast');
    await shot('find-nl-answer-page');
    // the other two chips (real mouse click on the chip button; the toast text must change)
    for (const q of ['total cost', 'show structure']) {
      await page.evaluate(() => { const i = document.getElementById('find-name'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); }); await sleep(600);
      const before = await toast();
      await page.evaluate((t) => { const ch = Array.from(document.querySelectorAll('#find-chips > button')).find(e => e.textContent.trim().toLowerCase() === t); if (ch) ch.setAttribute('data-docs', 'chip'); }, q);
      await mclick('[data-docs=chip]'); await sleep(300);
      await page.evaluate(() => document.querySelector('[data-docs=chip]').removeAttribute('data-docs'));
      const changed = await pollFor('chip-' + q, () => !!document.getElementById('nlp-toast'), 20000); await sleep(2500);
      step('chip_' + q.replace(' ', '_'), { before, after: await toast(), findResults: await page.evaluate(() => document.getElementById('find-results')?.textContent.trim().slice(0, 200)) });
    }
    await page.evaluate(() => { const i = document.getElementById('find-name'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); }); await sleep(600);

    // ── axis toggle: cycle and read each label
    step('axisBarHtml', await page.evaluate(() => document.getElementById('find-outliner-bar').innerHTML.replace(/style="[^"]*"/g, '').slice(0, 700)));
    const axes = [];
    const axisLabel = () => page.evaluate(() => { const b = Array.from(document.querySelectorAll('#find-outliner-bar button')).find(e => /\d\/\d/.test(e.textContent)); return b ? b.textContent.replace(/\s+/g, ' ').trim() : null; });
    for (let i = 0; i < 8; i++) {
      const lab = await axisLabel(); axes.push(lab);
      if (!lab || (axes.length > 1 && lab === axes[0])) break;
      await page.evaluate(() => { Array.from(document.querySelectorAll('#find-outliner-bar button')).find(e => /\d\/\d/.test(e.textContent)).setAttribute('data-docs', 'axisbtn'); });
      await mclick('[data-docs=axisbtn]'); await sleep(1800);
      await shot('axis-' + (i + 1), '#find-panel');
    }
    step('axes', axes);
    await mclick('#find-close'); await sleep(1000);
    step('findClosedByX', await page.evaluate(() => !(function () { const f = document.getElementById('find-panel'); return !!f && f.getBoundingClientRect().width > 0; })()));
    await finish(true);
  } catch (e) { log('§DOCS_FAIL ' + (e && e.stack || e)); await finish(false); process.exitCode = 1; }
  async function finish(ok) { await c.finish(ok); }
})();
