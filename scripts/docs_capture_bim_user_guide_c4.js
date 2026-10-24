#!/usr/bin/env node
// ⚠ DO NOT REMOVE — docs capture for docs/BIMUserGuide.md, PART C4: Hospital — Room → Path: ≈ Level 1 R35 → ≈ Level 4 R8 (guide: 124.69 m, 3 doors, 1 stair, polyPts 19,
// zero §PATH_LEGAL_DETOUR_FAIL).
// Replaces the retired Parts axis (§ROOM_LENS_TAXONOMY 2026-07-15, nf_trees.js:466). Spec: prompts/DOCS_GUIDE_REFRESH.md.
// Read the log after every run — exit code is not evidence.
'use strict';
const path = require('path');
const L = require('./docs_capture_lib.js');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.env.OUT || path.join(ROOT, 'docs', 'img', 'viewer'));
const LOG = process.env.LOG || '/tmp/docs_capture_bim_user_guide_c4.log';

(async () => {
  const c = await L.start({ out: OUT, log: LOG, report: path.join(ROOT, 'scripts', 'docs_reports', 'docs_capture_bim_user_guide_c4.report.json'), gpu: process.env.GPU || 'sw', w: 1440, h: 900 });
  const { page, log, report, shot, sleep } = c;
  const step = (k, v) => { report.steps[k] = v; log('§DOCS_' + k + ' ' + JSON.stringify(v).slice(0, 2000)); };
  const mclick = async (sel) => { const xy = await page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, sel); if (!xy) throw new Error('mclick: no ' + sel); await page.mouse.click(xy[0], xy[1]); };
  const pollFor = async (label, fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) { log('§DOCS_WAIT ' + label + ' ok after ' + (Date.now() - t0) + 'ms'); return true; } await sleep(500); } log('§DOCS_WAIT ' + label + ' TIMEOUT ' + ms + 'ms'); return false; };
  const findShown = () => { const f = document.getElementById('find-panel'); return !!f && f.getBoundingClientRect().width > 0; };
  const railOpen = async () => { const closed = await page.evaluate(() => getComputedStyle(document.getElementById('mobile-pill')).display === 'none'); if (closed) await mclick('#mobile-trigger'); await sleep(1200); };
  const axisLabel = () => page.evaluate(() => { const b = document.getElementById('find-axis-toggle'); return b ? b.textContent.replace(/\s+/g, ' ').trim() : null; });
  const goAxis = async (prefix) => { for (let i = 0; i < 7; i++) { const l = await axisLabel(); if (l && l.indexOf(prefix) === 0) return l; await mclick('#find-axis-toggle'); await sleep(2500); } return null; };
  const tree = () => page.evaluate(() => { const t = document.getElementById('find-tree'); return t ? t.innerText.replace(/\n+/g, ' | ').slice(0, 1400) : null; });
  // tag the smallest element inside #find-panel whose own text starts with `t`
  const tagText = (t, mark) => page.evaluate((txt, m) => { const els = Array.from(document.querySelectorAll('#find-panel *')).filter(e => e.getBoundingClientRect().width > 0 && e.innerText && e.innerText.trim().replace(/\s+/g, ' ').indexOf(txt) === 0 && e.children.length <= 6); els.sort((a, b) => a.innerText.length - b.innerText.length); if (!els[0]) return false; els[0].setAttribute('data-docs', m); return els[0].innerText.replace(/\s+/g, ' ').slice(0, 60); }, t, mark);
  const panelText = () => page.evaluate(() => { const t = document.getElementById('find-tree'); const r = document.getElementById('find-results'); return { tree: t ? t.innerText.replace(/\n+/g, ' | ').slice(0, 1600) : null, results: r ? r.innerText.replace(/\n+/g, ' | ').slice(0, 600) : null }; });
  const clickRoom = async (label) => { const ok = await page.evaluate((lab) => { const rows = Array.from(document.querySelectorAll('#find-tree .find-tree-row, #find-tree div, #find-tree button')).filter(e => e.getBoundingClientRect().height > 0 && e.children.length <= 4 && new RegExp('^≈? ?' + lab.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\b| ·|$)').test(e.innerText.replace(/\s+/g, ' ').trim())); rows.sort((a, b) => a.innerText.length - b.innerText.length); if (!rows[0]) return false; rows[0].setAttribute('data-docs', 'pick'); rows[0].scrollIntoView({ block: 'center' }); return rows[0].innerText.replace(/\s+/g, ' ').trim().slice(0, 80); }, label); if (!ok) return false; await mclick('[data-docs=pick]'); await page.evaluate(() => document.querySelector('[data-docs=pick]')?.removeAttribute('data-docs')); return ok; };
  try {
    step('loaded', await c.openBuilding((process.env.BUILDING || 'Hospital') + '_extracted.db', '', { loadMs: 3600000, stallMs: 3600000 }));
    await sleep(6000);
    await railOpen(); await mclick('#pill-navigate'); await sleep(1200); await mclick('#drawer-row-find');
    await pollFor('find-open', findShown, 300000); await sleep(2000);
    step('roomAxis', await goAxis('3/'));
    await sleep(3000);
    const pb = await page.evaluate(() => { const b = Array.from(document.querySelectorAll('#find-panel button')).find(e => e.textContent.trim() === 'Path' && e.getBoundingClientRect().width > 0); if (!b) return false; b.setAttribute('data-docs', 'pathbtn'); return true; });
    step('pathBtnFound', pb);
    await mclick('[data-docs=pathbtn]'); await sleep(4000);
    step('pathStart', await panelText());
    // Path-mode rows are not .find-tree-row: match by text — smallest element inside #find-tree whose text starts with the prefix
    // regex picker: smallest element inside #find-tree whose text matches; logs how many candidates there were
    const pickRe = async (reSrc, scope) => { const info = await page.evaluate((src, sc) => { const re = new RegExp(src); const els = Array.from(document.querySelectorAll(sc + ' option')).filter(e => e.innerText && re.test(e.innerText.replace(/\s+/g, ' ').trim())); els.sort((x, y) => x.innerText.length - y.innerText.length); const e = els[0]; if (!e) return { found: false, total: document.querySelectorAll('#find-tree *').length }; e.setAttribute('data-docs', 'pick'); e.scrollIntoView({ block: 'center' }); return { found: true, n: els.length, tag: e.tagName, text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 90) }; }, reSrc, scope || '#find-tree'); if (!info.found) return info; await sleep(500); const isOpt = await page.evaluate(() => { const o = document.querySelector('[data-docs=pick]'); if (o && o.tagName === 'OPTION') { const s = o.closest('select'); s.value = o.value; s.dispatchEvent(new Event('change', { bubbles: true })); return { select: s.id || s.className, options: s.options.length }; } return null; }); info.viaSelect = isOpt; if (!isOpt) await mclick('[data-docs=pick]'); await page.evaluate(() => document.querySelector('[data-docs=pick]')?.removeAttribute('data-docs')); return info; };
    step('pickFrom', await pickRe(process.env.FROM_RE || '^[≈⚠] Level 1 R\\d+ ', '#find-path-from')); await sleep(5000);
    step('afterFrom', await panelText());
    step('pickTo', await pickRe(process.env.TO_RE || '^[≈⚠] Level 4 R\\d+ ', '#find-path-to'));
    // the Path sub-mode needs an explicit "Find Path" tap after From and To are chosen
    const fp = await page.evaluate(() => { const b = Array.from(document.querySelectorAll('#find-panel button')).find(e => /^Find Path$/i.test(e.textContent.trim()) && e.getBoundingClientRect().width > 0); if (!b) return false; b.setAttribute('data-docs', 'findpath'); return true; });
    step('findPathButton', fp);
    if (fp) { await mclick('[data-docs=findpath]'); }
    await pollFor('route-card', () => /\d+(\.\d+)?\s?m\b/.test((document.getElementById('find-panel') || {}).innerText || '') && /door|stair/i.test((document.getElementById('find-panel') || {}).innerText || ''), 240000);
    await sleep(8000);
    step('routeText', await page.evaluate(() => { const p = document.getElementById('find-panel'); const lines = p.innerText.split('\n').map(s => s.trim()).filter(Boolean); const i = lines.findIndex(s => /Find Path/i.test(s)); return lines.slice(i < 0 ? 0 : i, (i < 0 ? 0 : i) + 24); }));
    step('panelAfterRoute', await page.evaluate(() => { const p = document.getElementById('find-panel'); const t = p.innerText.replace(/\s+/g, ' '); const m = t.match(/[^|]{0,120}(doors?|stairs?)[^|]{0,160}/i); return { selects: Array.from(p.querySelectorAll('select')).map(s => (s.id || s.className) + ':' + s.options.length + ':' + (s.options[s.selectedIndex] ? s.options[s.selectedIndex].text.slice(0, 40) : '')), routeLine: m ? m[0] : null, head: t.slice(0, 400) }; }));
    await shot('find-room-path-hospital-page');
    await shot('find-room-path-hospital-panel', '#find-panel');
    await c.finish(true);
  } catch (e) { log('§DOCS_FAIL ' + (e && e.stack || e)); await c.finish(false); process.exitCode = process.exitCode || 1; }
})();
