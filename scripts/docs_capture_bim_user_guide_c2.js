#!/usr/bin/env node
// ⚠ DO NOT REMOVE — docs capture for docs/BIMUserGuide.md, PART C2: HHS Office — Room axis (Storey / Type / Path sub-modes),
// room highlight, and the Phase axis (is the timeline generator reachable?).
// Replaces the retired Parts axis (§ROOM_LENS_TAXONOMY 2026-07-15, nf_trees.js:466). Spec: prompts/DOCS_GUIDE_REFRESH.md.
// Read the log after every run — exit code is not evidence.
'use strict';
const path = require('path');
const L = require('./docs_capture_lib.js');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.env.OUT || path.join(ROOT, 'docs', 'img', 'viewer'));
const LOG = process.env.LOG || '/tmp/docs_capture_bim_user_guide_c2.log';

(async () => {
  const c = await L.start({ out: OUT, log: LOG, report: path.join(ROOT, 'scripts', 'docs_reports', 'docs_capture_bim_user_guide_c2.report.json'), gpu: process.env.GPU || 'sw', w: 1440, h: 900 });
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
  try {
    step('loaded', await c.openBuilding('HHS_Office_Federated_extracted.db', '', { loadMs: 2400000 }));
    await sleep(4000);
    await railOpen(); await mclick('#pill-navigate'); await sleep(1200); await mclick('#drawer-row-find');
    await pollFor('find-open', findShown, 120000); await sleep(1500);

    // ── Room axis, Storey sub-mode (default)
    step('roomAxis', await goAxis('3/5'));
    await sleep(2000);
    step('roomSubToggle', await page.evaluate(() => Array.from(document.querySelectorAll('#find-panel button')).filter(e => /^(Storey|Type|Path)$/.test(e.textContent.trim()) && e.getBoundingClientRect().width > 0).map(e => e.id + '|' + e.textContent.trim() + '|' + e.className)));
    step('roomStoreyTree', await tree());
    await shot('find-room-storey-hhs', '#find-panel');
    // expand Level 2 and pick the first room
    step('treeHtml', await page.evaluate(() => document.getElementById('find-tree').innerHTML.replace(/style="[^"]*"/g, '').replace(/\s+/g, ' ').slice(0, 900)));
    // the expand toggle is the ▸ span (title="Expand") of the row carrying data-find-parent="Level 2"
    step('level2Toggle', await page.evaluate(() => { const r = document.querySelector('#find-tree [data-find-parent="Level 2"]'); const t = r && r.querySelector('span[title="Expand"], span[title="Collapse"]'); if (!t) return false; t.setAttribute('data-docs', 'lvl2'); return r.innerText.replace(/\s+/g, ' '); }));
    await mclick('[data-docs=lvl2]'); await sleep(2500);
    step('level2Expanded', await tree());
    const rooms = await page.evaluate(() => Array.from(document.querySelectorAll('#find-tree [class*=room], #find-tree .find-acc-row, #find-tree div')).filter(e => e.getBoundingClientRect().width > 0 && e.children.length === 0 && /^[^|]{2,40}$/.test(e.textContent.trim())).slice(0, 12).map(e => e.textContent.trim()));
    step('level2Leaves', rooms);
    await shot('find-room-level2-hhs', '#find-panel');
    // click the first Level 2 room row → the app X-rays the model and boxes that room (guide: "Room highlight")
    step('roomRowClick', await page.evaluate(() => { const rows = Array.from(document.querySelectorAll('#find-tree .find-tree-row')).filter(e => /≈ Level 2 R\d+/.test(e.innerText) && e.getBoundingClientRect().height > 0); if (!rows.length) return { rows: 0 }; rows[0].setAttribute('data-docs', 'room'); return { rows: rows.length, first: rows[0].innerText.replace(/\s+/g, ' ') }; }));
    if (await page.$('[data-docs=room]')) { await mclick('[data-docs=room]'); await sleep(5000); await shot('find-room-highlight-page'); step('highlightStatus', await page.evaluate(() => (document.getElementById('status') || document.querySelector('[id*=status]'))?.textContent)); }

    // ── Type sub-mode
    const typeBtn = await page.evaluate(() => { const b = Array.from(document.querySelectorAll('#find-panel button')).find(e => e.textContent.trim() === 'Type' && e.getBoundingClientRect().width > 0); if (!b) return false; b.setAttribute('data-docs', 'typebtn'); return true; });
    step('typeBtnFound', typeBtn);
    if (typeBtn) {
      await mclick('[data-docs=typebtn]'); await sleep(3500);
      step('roomTypeTree', await tree());
      await shot('find-room-type-hhs', '#find-panel');
    }
    // ── Path sub-mode
    const pathBtn = await page.evaluate(() => { const b = Array.from(document.querySelectorAll('#find-panel button')).find(e => e.textContent.trim() === 'Path' && e.getBoundingClientRect().width > 0); if (!b) return false; b.setAttribute('data-docs', 'pathbtn'); return true; });
    if (pathBtn) { await mclick('[data-docs=pathbtn]'); await sleep(3000); step('roomPathTree', await tree()); await shot('find-room-path-hhs', '#find-panel'); }

    // ── Phase axis: is the timeline generator reachable? (HHS said "Timeline unavailable (generator not loaded)")
    step('phaseAxis', await goAxis('5/5'));
    const t0 = Date.now(); let ph = null;
    for (let i = 0; i < 90; i++) { ph = await tree(); if (ph && !/unavailable|generating/i.test(ph)) break; await sleep(1000); }
    step('phaseTree', { afterMs: Date.now() - t0, tree: ph });
    await shot('find-axis-phase-hhs', '#find-panel');
    // reopen: the app's own log says "generator running async; reopen to load" — does a second visit show the timeline?
    step('phaseLeave', await goAxis('1/5')); await sleep(1500);
    step('phaseReturn', await goAxis('5/5')); await sleep(6000);
    step('phaseTreeReopened', await tree());
    await shot('find-axis-phase-reopened-hhs', '#find-panel');
    await c.finish(true);
  } catch (e) { log('§DOCS_FAIL ' + (e && e.stack || e)); await c.finish(false); process.exitCode = process.exitCode || 1; }
})();
