#!/usr/bin/env node
// ⚠ DO NOT REMOVE — docs capture for docs/BIMUserGuide.md, PART C3: Terminal — Room axis Storey / Type, the SUSPECT_NO_DOOR pick ('Aras 02 R3'),
// and the STAIRWELL-STACK numbers the guide quotes (59 rooms → 40 rooms, 73 rects; INTERNAL 30 / INTERNAL_SMALL 15 / SUSPECT_OPEN 22 / SUSPECT_NO_DOOR 6).
// Replaces the retired Parts axis (§ROOM_LENS_TAXONOMY 2026-07-15, nf_trees.js:466). Spec: prompts/DOCS_GUIDE_REFRESH.md.
// Read the log after every run — exit code is not evidence.
'use strict';
const path = require('path');
const L = require('./docs_capture_lib.js');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.env.OUT || path.join(ROOT, 'docs', 'img', 'viewer'));
const LOG = process.env.LOG || '/tmp/docs_capture_bim_user_guide_c3.log';

(async () => {
  const c = await L.start({ out: OUT, log: LOG, report: path.join(ROOT, 'scripts', 'docs_reports', 'docs_capture_bim_user_guide_c3.report.json'), gpu: process.env.GPU || 'sw', w: 1440, h: 900 });
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
    step('loaded', await c.openBuilding('Terminal_extracted.db', '&ghost=1', { loadMs: 2700000 }));
    await sleep(5000);
    await railOpen(); await mclick('#pill-navigate'); await sleep(1200); await mclick('#drawer-row-find');
    await pollFor('find-open', findShown, 300000); await sleep(2000);
    step('roomAxis', await goAxis('3/'));
    await sleep(3000);
    step('roomStoreyTree', await tree());
    // Type sub-mode
    const tb = await page.evaluate(() => { const b = Array.from(document.querySelectorAll('#find-panel button')).find(e => e.textContent.trim() === 'Type' && e.getBoundingClientRect().width > 0); if (!b) return false; b.setAttribute('data-docs', 'typebtn'); return true; });
    step('typeBtnFound', tb);
    await mclick('[data-docs=typebtn]'); await sleep(4000);
    step('roomTypeTree', await tree());
    await shot('find-room-type-terminal', '#find-panel');
    // expand SUSPECT_NO_DOOR and list its rooms
    step('noDoorToggle', await page.evaluate(() => { const r = document.querySelector('#find-tree [data-find-parent="SUSPECT_NO_DOOR"]'); const t = r && r.querySelector('span[title="Expand"], span[title="Collapse"]'); if (!t) return false; t.setAttribute('data-docs', 'nd'); return r.innerText.replace(/\s+/g, ' '); }));
    await mclick('[data-docs=nd]'); await sleep(2500);
    step('noDoorRooms', await page.evaluate(() => Array.from(document.querySelectorAll('#find-tree .find-tree-row')).filter(e => e.getBoundingClientRect().height > 0 && /^≈|R\d+/.test(e.innerText.trim())).map(e => e.innerText.replace(/\s+/g, ' ').trim()).slice(0, 12)));
    const pick = await page.evaluate(() => { const rows = Array.from(document.querySelectorAll('#find-tree .find-tree-row')).filter(e => e.getBoundingClientRect().height > 0 && /Aras 02 R3/.test(e.innerText)); const r = rows[0] || null; if (!r) return null; r.setAttribute('data-docs', 'room'); return r.innerText.replace(/\s+/g, ' ').trim(); });
    step('arasPick', pick);
    if (pick) { await mclick('[data-docs=room]'); await sleep(6000); await shot('find-room-suspect-no-door-terminal-page'); }
    await c.finish(true);
  } catch (e) { log('§DOCS_FAIL ' + (e && e.stack || e)); await c.finish(false); process.exitCode = process.exitCode || 1; }
})();
