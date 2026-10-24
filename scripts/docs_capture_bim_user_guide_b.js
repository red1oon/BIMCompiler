#!/usr/bin/env node
// ⚠ DO NOT REMOVE — docs capture for docs/BIMUserGuide.md, PART B: the toolbar drawers (Duplex) —
// World History, Page History, Inspect, Camera/View, Palette (Display options), Settings, Save/Open, Share, Fly Tour bar.
// Spec: prompts/DOCS_GUIDE_REFRESH.md. Read the log after every run — exit code is not evidence.
// Env: OUT (png dir) · GPU=sw|real (default sw) · LOG
'use strict';
const path = require('path');
const L = require('./docs_capture_lib.js');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.env.OUT || path.join(ROOT, 'docs', 'img', 'viewer'));
const LOG = process.env.LOG || '/tmp/docs_capture_bim_user_guide_b.log';

(async () => {
  const c = await L.start({ out: OUT, log: LOG, report: path.join(ROOT, 'scripts', 'docs_reports', 'docs_capture_bim_user_guide_b.report.json'), gpu: process.env.GPU || 'sw', w: 1440, h: 900 });
  const { page, log, report, shot, sleep } = c;
  const step = (k, v) => { report.steps[k] = v; log('§DOCS_' + k + ' ' + JSON.stringify(v).slice(0, 1200)); };
  const mclick = async (sel) => { const xy = await page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, sel); if (!xy) throw new Error('mclick: no ' + sel); await page.mouse.click(xy[0], xy[1]); };
  const railOpen = async () => { const closed = await page.evaluate(() => getComputedStyle(document.getElementById('mobile-pill')).display === 'none'); if (closed) await mclick('#mobile-trigger'); await sleep(1200); };
  // ids of visible, id-bearing containers (fixed/absolute) — diff before/after a click to find what a pill opened
  const visIds = () => page.evaluate(() => Array.from(document.body.querySelectorAll('*')).filter(e => { if (!e.id) return false; const s = getComputedStyle(e), r = e.getBoundingClientRect(); return (s.position === 'fixed' || s.position === 'absolute') && r.width > 80 && r.height > 40 && r.width < 1300 && s.display !== 'none' && s.visibility !== 'hidden'; }).map(e => e.id));
  const opened = async (label, action, settle) => {
    const before = new Set(await visIds());
    await action(); await sleep(settle || 1800);
    const now = await visIds();
    const fresh = now.filter(x => !before.has(x));
    step('opened_' + label, fresh);
    return fresh;
  };
  const text = (id) => page.evaluate((i) => { const e = document.getElementById(i); return e ? e.innerText.replace(/\s+/g, ' ').trim().slice(0, 500) : null; }, id);
  // drawers = distinct containers of visible .bim-drawer-row buttons → [{id, rows:[id|label]}]
  const drawers = () => page.evaluate(() => { const g = new Map(); Array.from(document.querySelectorAll('.bim-drawer-row')).filter(e => e.getBoundingClientRect().width > 0).forEach(e => { const p = e.parentElement; if (!g.has(p)) g.set(p, []); g.get(p).push(e.id.replace('drawer-row-', '') + '|' + e.textContent.trim()); }); return Array.from(g.values()); });
  const tagDrawerWith = (rowSel, mark) => page.evaluate((s, m) => { const r = document.querySelector(s); if (!r || r.getBoundingClientRect().width === 0) return false; r.parentElement.setAttribute('data-docs', m); return true; }, rowSel, mark);
  const panels = () => page.evaluate(() => Array.from(document.querySelectorAll('.bim-panel')).filter(e => e.getBoundingClientRect().width > 0).map(e => e.id + '|' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)));
  // close every open panel the way a user does: drawers by tapping their master pill again, others by their ×.
  // (Escape does NOT close the drawers — measured 2026-10-24: they stack and toggle each other.)
  const closeAll = async () => {
    for (let i = 0; i < 6; i++) {
      const open = await page.evaluate(() => Array.from(document.querySelectorAll('.bim-panel')).filter(e => e.id && e.getBoundingClientRect().width > 0).map(e => e.id));
      if (!open.length) return;
      const id = open[0];
      if (/-drawer-panel$/.test(id)) { await railOpen(); const sel = '#pill-' + id.replace('-drawer-panel', ''); if (await page.$(sel)) await mclick(sel); }
      else { const x = await page.$('#' + id + ' .bim-panel-close'); if (x) await x.click(); else await page.keyboard.press('Escape'); }
      await sleep(700);
    }
    log('§DOCS_CLOSEALL_INCOMPLETE ' + JSON.stringify(await panels()));
  };
  try {
    step('loaded', await c.openBuilding('Duplex_extracted.db'));
    await sleep(3000);
    await railOpen();

    // ── World History (drawer row) — guide: card with Whole / This page toggle, day nav, one entry per action
    await mclick('#pill-navigate'); await sleep(1200);
    const wh = await opened('worldhistory', () => mclick('#drawer-row-worldhist'));
    step('worldHistoryText', await text('whole-hist-panel'));
    if (await page.$('#whole-hist-card')) await shot('pill-world-history', '#whole-hist-card');
    await closeAll();

    // ── Page History (Z)
    await railOpen(); await mclick('#pill-navigate'); await sleep(1200);
    await opened('pagehistory', () => mclick('#drawer-row-docHist'));
    step('pageHistoryBar', await page.evaluate(() => { const b = document.getElementById('universal-hist-btns'); return b ? { display: getComputedStyle(b).display, w: Math.round(b.getBoundingClientRect().width), html: b.innerHTML.replace(/style="[^"]*"/g, '').slice(0, 300) } : null; }));
    if (await page.$('#universal-hist-btns')) await shot('pill-page-history', '#universal-hist-btns');
    await closeAll();

    // ── Inspect drawer
    await railOpen();
    await mclick('#pill-inspect'); await sleep(1500);
    step('inspectDrawers', await drawers()); step('inspectPanels', await panels());
    await shot('pill-inspect-drawer', '#inspect-drawer-panel');
    await closeAll();
    step('afterClose_inspect', await drawers());

    // ── Camera / View drawer
    await railOpen();
    await mclick('#pill-camview'); await sleep(1500);
    step('camviewDrawers', await drawers()); step('camviewPanels', await panels());
    const camRow = await page.evaluate(() => { const r = Array.from(document.querySelectorAll('.bim-drawer-row')).find(e => e.getBoundingClientRect().width > 0 && /Precision|Reset Camera|Auto-Pivot/i.test(e.textContent)); return r ? '#' + r.id : null; });
    step('camviewRowSel', camRow);
    await shot('pill-camview-drawer', '#camview-drawer-panel');
    await closeAll();

    // ── Palette (Display options)
    await railOpen();
    const pal = await opened('palette', () => mclick('#pill-palette'));
    step('paletteText', await page.evaluate(() => { const hit = Array.from(document.querySelectorAll('body *')).find(e => e.children.length === 0 && /^(Night|Ambience)/i.test(e.textContent.trim()) && e.getBoundingClientRect().width > 0); if (!hit) return null; let p = hit; while (p && p !== document.body) { const s = getComputedStyle(p); if (s.position === 'fixed' || s.position === 'absolute') { p.setAttribute('data-docs', 'palette'); return { id: p.id, text: p.innerText.replace(/\s+/g, ' ').slice(0, 500) }; } p = p.parentElement; } return null; }));
    step('paletteButtons', await page.evaluate(() => Array.from(document.querySelectorAll('#sunglass-slider-panel button, #sunglass-slider-panel [title], #sunglass-slider-panel .bim-drawer-row')).filter(e => e.getBoundingClientRect().width > 0).map(e => (e.id || '') + '|' + (e.title || '') + '|' + e.textContent.trim().slice(0, 30))));
    if (await page.$('[data-docs=palette]')) await shot('pill-display-options', '[data-docs=palette]');
    await closeAll();

    // ── Settings
    await railOpen();
    await mclick('#pill-settings'); await sleep(3000);
    step('settingsPanels', await panels());
    step('settingsText', await page.evaluate(() => { const ps = Array.from(document.querySelectorAll('.bim-panel')).filter(e => e.getBoundingClientRect().width > 0 && /Pill|Cache|Rate|JSON/i.test(e.innerText)); if (!ps.length) return null; ps[0].setAttribute('data-docs', 'settings'); return { id: ps[0].id, text: ps[0].innerText.replace(/\s+/g, ' ').slice(0, 800) }; }));
    step('settingsHeaders', await page.evaluate(() => Array.from(document.querySelectorAll('#settings-panel *')).filter(e => e.children.length <= 2 && /^(▶|▼)?\s*(Pill Icons|Edit Project JSON|5D Rate Pack|Cache Info)/i.test(e.textContent.trim()) && e.getBoundingClientRect().width > 0).map(e => e.tagName + '#' + e.id + '|' + e.textContent.trim().slice(0, 40))));
    if (await page.$('[data-docs=settings]')) await shot('pill-settings-panel', '[data-docs=settings]');
    // collapse Pill Icons first so the JSON hub shot matches the guide's (Pill Icons collapsed, JSON expanded)
    const pi = await page.evaluate(() => { const h = Array.from(document.querySelectorAll('#settings-panel *')).find(e => e.children.length <= 2 && /^[▶▼]?\s*Pill Icons$/i.test(e.textContent.trim()) && e.getBoundingClientRect().width > 0); if (!h) return false; h.setAttribute('data-docs', 'pihdr'); return true; });
    if (pi) { await mclick('[data-docs=pihdr]'); await sleep(1200); }
    // Edit Project JSON section
    const hdr = await page.evaluate(() => { const h = Array.from(document.querySelectorAll('#settings-panel *')).find(e => e.children.length <= 2 && /Edit Project JSON/i.test(e.textContent.trim()) && e.getBoundingClientRect().width > 0); if (!h) return false; h.setAttribute('data-docs', 'jsonhdr'); return true; });
    step('jsonHeaderFound', hdr);
    if (hdr) {
      await mclick('[data-docs=jsonhdr]'); await sleep(2000);
      step('jsonHub', await page.evaluate(() => { const p = document.getElementById('settings-panel'); const t = p.innerText.replace(/\s+/g, ' '); const i = t.indexOf('Edit Project JSON'); return t.slice(i, i + 700); }));
      await shot('pill-settings-json-hub', '#settings-panel');
    }
    await closeAll();

    // ── Share preview
    await railOpen();
    const sh = await opened('share', () => mclick('#pill-share'), 3000);
    // the card = the overlay's IMG + DIV children (the overlay itself is a full-screen backdrop): clip to their union
    const box = await page.evaluate(() => { const ov = document.getElementById('share-preview-overlay'); if (!ov) return null; const rs = Array.from(ov.children).map(e => e.getBoundingClientRect()).filter(r => r.width > 0); if (!rs.length) return null; const x0 = Math.min(...rs.map(r => r.x)), y0 = Math.min(...rs.map(r => r.y)), x1 = Math.max(...rs.map(r => r.x + r.width)), y1 = Math.max(...rs.map(r => r.y + r.height)); return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, text: ov.innerText.replace(/\s+/g, ' ').slice(0, 400), kids: Array.from(ov.children).map(e => e.tagName) }; });
    step('shareBox', box);
    if (box) { const f = path.join(OUT, 'pill-share-preview.png'); await page.screenshot({ path: f, clip: { x: Math.max(0, box.x - 20), y: Math.max(0, box.y - 20), width: box.w + 40, height: box.h + 40 } }); log('§DOCS_SHOT ' + f); }
    await closeAll();

    await c.finish(true);
  } catch (e) { log('§DOCS_FAIL ' + (e && e.stack || e)); await c.finish(false); process.exitCode = 1; }
})();
