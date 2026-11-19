// ⚠ DO NOT REMOVE — film "UAT, hands on: where to click" (prompts/FILM_UAT_GUIDE.md §5): the SCENES, each one take of the real desktop. READ THE LOG (§FILM_*).
// usage: node scenes.js <outDir> <home> s1 [s2 …]      (the desktop must be up: desk.sh)
// Each scene: cue at its start, real pointer + keys, and a CHECK that the click had its effect (a file landed, a page opened, a list filled). A FAIL means re-take, never cut around it.
'use strict';
const D = require('./drv.js'), fs = require('fs'), path = require('path');
const GUIDE = 'https://red1oon.github.io/BIMCompiler/CapexUATGuide/';
// Chrome's own toolbar is not in any page's DOM: its address bar was MEASURED once from a calibration frame of this desktop (probe1.png: the bar spans x 130-1705, y 52-84)
const BACK = D.screenBox(14, 53, 28, 28, 'the Back button');   // measured on the same frame: the toolbar arrow at x 28, y 67
const OMNIBOX = D.screenBox(300, 54, 700, 28, 'the address bar');
const S = {}, PREP = {};
PREP.s5 = async () => { await PREP.s3(); };
PREP.s8 = async () => { await PREP.oneTab(); await D.page.goto('https://red1oon.github.io/bim-ootb/index.html'); await D.sleep(1500); await D.page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }); await PREP.s3(); };   // a re-take sees the front door as a first visit (the pill picture), as the fresh build does
PREP.s4 = async () => { await PREP.s3(); await D.filesLaunch(D.dlDir()); };
PREP.oneTab = async () => { const ps = D.pages(); for (const p of ps.slice(1)) await p.close().catch(() => {}); D.page = ps[0]; await D.page.bringToFront(); await D.sleep(500); };
PREP.s3 = async () => { if (!/CapexUATGuide/.test(D.page.url())) { await D.page.goto(GUIDE); await D.page.waitForLoadState('load'); await D.sleep(1500); } };   // a re-take starts on the guide (not filmed)
PREP.s1 = async () => { await D.page.goto('about:blank'); await D.sleep(800); };   // setup before the take (not filmed): a blank tab

S.s1 = async () => {   // the guide, and its PDF into Downloads
  D.cue('s1_start');
  await D.aimClick(OMNIBOX, { label: 'the address bar' }); await D.key('ctrl+a', 'select what is in the bar');
  D.cue('s1_type'); await D.type(GUIDE.replace('https://', '')); await D.key('Return', 'open the page');
  await D.page.waitForLoadState('load'); await D.page.waitForSelector('a.md-button--primary'); await D.sleep(1500);
  D.cue('s1_page', { title: await D.page.title() });
  await D.aim('a.md-button--primary', { label: '⬇ Download the PDF' }); await D.sleep(500); D.cue('s1_click');
  await D.click({ label: '⬇ Download the PDF' });
  const f = await D.waitFile(/^CapexUATGuide.*\.pdf$/, 60000); D.check(!!f && f.bytes === 4795915, 'pdf_landed', f ? f.name + ' ' + f.bytes : 'none');
  D.cue('s1_landed'); await D.sleep(2500);
  D.cue('s1_ctrlj'); await D.key('ctrl+j', 'show the downloads'); await D.waitUrl(/chrome:\/\/downloads/); await D.sleep(1200);
  const shown = await D.page.evaluate(() => { const m = document.querySelector('downloads-manager'); const items = m && m.shadowRoot ? [...m.shadowRoot.querySelectorAll('downloads-item')] : []; return items.map(i => (i.shadowRoot && i.shadowRoot.querySelector('#name') || {}).textContent || ''); }).catch(() => []);
  D.check(shown.some(n => /CapexUATGuide/.test(n)), 'downloads_page_lists_pdf', JSON.stringify(shown));
  D.cue('s1_list'); await D.sleep(3500); D.cue('s1_end');
};

const HOME_DL = () => D.dlDir(), XQmin = w => { try { D.X('windowminimize', w); } catch (e) { } };
S.s2 = async () => {   // a link that IS a file: the test-data pack (keep it zipped)
  D.cue('s2_start'); await D.key('ctrl+w', 'close the downloads tab'); await D.waitUrl(/CapexUATGuide/); await D.sleep(600);
  const L = 'a[href*="CAPEXTestData.zip"]';
  D.fastStart('scroll to What you need'); await D.moveTo(960, 600); await D.scrollInto(L, 260); D.fastEnd();
  D.cue('s2_table'); await D.sleep(1500);
  await D.aim(L, { label: 'the test-data pack link' }); D.cue('s2_click'); await D.click({ label: 'the test-data pack link' });
  const f = await D.waitFile(/CAPEXTestData\.zip$/, 60000); D.check(!!f && f.bytes === 14144, 'testdata_zip_landed', f ? f.name + ' ' + f.bytes : 'none');
  D.cue('s2_landed'); await D.sleep(3500); D.cue('s2_end');
};
S.s3 = async () => {   // a link that is a PAGE: the products script opens GitHub; the file is behind 'Download raw file'
  D.cue('s3_start'); const L = 'a[href*="CONSTRUCTION-PRODUCTS.sql"]'; await D.scrollInto(L, 260);
  await D.aim(L, { label: 'the products-script link' }); D.cue('s3_click'); await D.click({ label: 'the products-script link' });
  await D.page.waitForURL(/github\.com\/.*CONSTRUCTION-PRODUCTS\.sql/, { timeout: 60000 }); await D.page.waitForLoadState('load'); await D.sleep(2500);
  const html = fs.readdirSync(HOME_DL()).filter(n => /\.sql$/.test(n)).length; D.check(html === 0, 'link_opened_a_page_not_a_file', 'sql files in Downloads=' + html + ' url=' + D.page.url());
  D.cue('s3_page'); await D.sleep(2500);
  const B = '[data-testid="download-raw-button"]';   // GitHub's 'Download raw file' (an icon beside Raw; measured: it carries no aria-label, only this test id)
  await D.aim(B, { label: 'Download raw file', dur: 1.0 }); D.cue('s3_raw'); await D.sleep(900); await D.click({ label: 'Download raw file' });
  const f = await D.waitFile(/CONSTRUCTION-PRODUCTS.*\.sql$/, 60000); D.check(!!f && f.bytes > 1000, 'sql_landed', f ? f.name + ' ' + f.bytes : 'none');
  D.cue('s3_landed'); await D.sleep(2500);
  D.cue('s3_back'); await D.key('Escape', 'close the download list'); await D.aimClick(BACK, { label: 'Back' }); await D.waitUrl(/CapexUATGuide/); await D.sleep(1500); D.cue('s3_end');
};
S.s4 = async () => {   // the reference pack: download it, then open it in Files: opening the zip extracts it; inside are the sheets
  D.cue('s4_start'); const L = 'a[href*="Shed_UAT_pack"]';
  await D.scrollInto(L, 260); await D.aim(L, { label: 'the reference pack link' }); D.cue('s4_click'); await D.click({ label: 'the reference pack link' });
  const f = await D.waitFile(/^Shed_UAT_pack_20261115\.zip$/, 90000); D.check(!!f && f.bytes === 567159, 'pack_landed', f ? f.name + ' ' + f.bytes : 'none');
  D.cue('s4_landed'); await D.sleep(2000);
  D.cue('s4_files'); const win = await D.files(); if (!win) return; await D.sleep(1200); const FR = D.filesGeo;   // OCR reads inside the Files window only
  const z = await D.findText(/Shed_UAT/, FR); if (!z) return;
  await D.aim(D.screenBox(z.x, z.y - 58, z.w, 52, 'the pack zip icon'), { label: 'the pack zip' }); D.cue('s4_open'); await D.click({ n: 2, label: 'the pack zip (double-click)' });
  let ok = false; const ex = path.join(HOME_DL(), 'Shed_UAT_pack_20261115');
  for (let i = 0; i < 60 && !ok; i++) { await D.sleep(500); ok = fs.existsSync(path.join(ex, 'marked')) && fs.readdirSync(path.join(ex, 'marked')).filter(n => /_marked\.dxf$/.test(n)).length === 9; }
  D.check(ok, 'pack_extracted', ex + ' marked=' + (fs.existsSync(path.join(ex, 'marked')) ? fs.readdirSync(path.join(ex, 'marked')).length : 0));
  D.cue('s4_extracted'); await D.sleep(1800);
  const fo = await D.findText(/Shed_UAT/, FR, 10); // the new folder (the zip's label wraps the same way; the folder is the one WITHOUT .zip under it)
  const all = fo ? fo : null; if (!all) return;
  await D.aim(D.screenBox(all.x, all.y - 58, all.w, 52, 'the extracted folder'), { label: 'the extracted folder' }); D.cue('s4_into'); await D.click({ n: 2, label: 'the extracted folder (double-click)' });
  const m = await D.findText(/^marked/, FR, 12); D.check(!!m, 'folder_shows_marked', m ? 'at ' + m.x + ',' + m.y : '');
  D.cue('s4_inside'); await D.sleep(1500);
  if (m) { await D.aim(D.screenBox(m.x, m.y - 58, m.w, 52, 'the marked folder'), { label: 'marked' }); await D.click({ n: 2, label: 'marked (double-click)' }); }
  const n9 = await D.findText(/_marked/, FR, 12); D.check(!!n9, 'marked_folder_open', n9 ? n9.t : '');
  D.cue('s4_marked'); await D.sleep(4000); D.cue('s4_end'); XQmin(win); await D.sleep(800);
};

const MOD = { ready: () => D.page.waitForFunction('window.__sceneReady===true && window.DxfImportUI && window.A && window.A.scene', null, { timeout: 240000 }) };
S.s5 = async () => {   // B2.1: the Modeller, all nine marked sheets through the OS file window
  D.cue('s5_start');
  const toc = D.page.locator('.md-sidebar--secondary a', { hasText: 'B0 · From the drawings' }).first();
  await D.aim(toc, { label: 'contents: B0' }); D.cue('s5_toc'); await D.click({ label: 'contents: B0' }); await D.sleep(1800);
  const link = D.page.locator('a[href*="modeller/modeller.html"]').first(); await D.aim(link, { label: 'the Modeller link' }); await D.click({ label: 'the Modeller link' });
  D.fastStart('the Modeller loads'); await D.waitUrl(/modeller\/modeller\.html/, 60000); await MOD.ready(); await D.sleep(1500); D.fastEnd();
  D.cue('s5_modeller'); await D.sleep(1200);
  await D.aimClick('#b-open', { label: 'Open' }); await D.sleep(600);
  await D.aim('#m-open-panel .mo-row[data-key="__dxf"]', { label: 'Open 2D drawings (.dxf)…' }); D.cue('s5_row'); await D.click({ label: 'Open 2D drawings (.dxf)…' });
  D.cue('s5_dialog');
  const ok = await D.pick(['Downloads', t => /^Shed_UAT_pack_2026111\d$/.test(t), 'marked'], async () => { await D.key('ctrl+a', 'select all nine'); await D.sleep(900); }, 'the nine marked sheets');
  if (!ok) return;
  D.fastStart('the sheets are read'); await D.page.waitForFunction(n => window.DxfMetaEditor && window.DxfMetaEditor.state.sheets.length === n && !window.DxfMetaEditor.state.busy && window.DxfMetaEditor.state.verdict, 9, { timeout: 300000, polling: 300 }); await D.sleep(1500); D.fastEnd();
  const title = await D.page.$eval('#dxf-panel .ip-title', e => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => '');
  D.check(/9 SHEETS/.test(title), 'panel_title_9_sheets', JSON.stringify(title));   // guide B2.1: 'titled 9 SHEETS'
  D.cue('s5_loaded'); await D.sleep(4000); D.cue('s5_end');
};
S.s6 = async () => {   // B2.5 + B2.6: Complete the building, Convert; then fold the panels and look around (B2.4, B2.7)
  D.cue('s6_start');
  await D.aim('#dxf-complete', { label: 'Complete the building' }); await D.click({ label: 'Complete the building' }); await D.sleep(1200);
  const ck = await D.page.$eval('#dxf-complete', e => e.checked); D.check(ck, 'complete_ticked', String(ck)); D.cue('s6_ticked');
  await D.page.waitForFunction(() => { const b = document.getElementById('dxf-convert'); return b && !b.disabled; }, null, { timeout: 60000 }); await D.sleep(2500);
  await D.aim('#dxf-convert', { label: 'Convert' }); D.cue('s6_convert'); await D.click({ label: 'Convert' });
  D.fastStart('converting'); let line = '';
  for (let i = 0; i < 600 && !line; i++) { const t = await D.page.$eval('#dxf-status', e => e.innerText).catch(() => ''); const m = /Converted: \d+ elements[^\n]*/.exec(t); if (m) line = m[0]; else await D.sleep(500); }
  D.fastEnd(); D.check(/Converted: 511 elements/.test(line), 'converted_511', JSON.stringify(line));   // guide B2.6: 'Converted: 511 elements'
  D.cue('s6_converted', { line }); await D.sleep(4500);
  await D.aimClick('#dxf-fold', { label: 'fold the 2D Drawings panel' }); await D.sleep(700);
  if (await D.page.$('#dm-close')) { await D.aimClick('#dm-close', { label: 'close Drawing metadata' }); await D.sleep(700); }
  await D.moveTo(900, 640); D.cue('s6_orbit'); await D.drag(1250, 600, 2.2); await D.sleep(600); await D.drag(1000, 700, 1.6); await D.sleep(2500); D.cue('s6_end');
};
S.s7 = async () => {   // B2.8: Export -> Viewer database (.db), into Downloads
  D.cue('s7_start');
  await D.aimClick('#b-export', { label: 'Export' }); await D.page.waitForSelector('#m-export-panel .me-row[data-key="vdb"]', { state: 'visible' }); await D.sleep(600);
  await D.aim('#m-export-panel .me-row[data-key="vdb"]', { label: 'Viewer database (.db)' }); D.cue('s7_click'); await D.click({ label: 'Viewer database (.db)' });
  const f = await D.waitFile(/\.db$/, 120000); D.check(!!f && f.bytes > 100000, 'db_landed', f ? f.name + ' ' + f.bytes : 'none');
  D.cue('s7_landed'); await D.sleep(3500); D.cue('s7_end');
};

const AREA = D.screenBox(760, 560, 400, 240, 'the model area');   // the middle of the Viewer's canvas: a click there focuses the model, as a person does before a shortcut key
S.s8 = async () => {   // B2.9: front door -> red pill -> Buildings / IFC -> Blank Viewer -> Ctrl+O -> the .db
  D.cue('s8_start');
  const toc = D.page.locator('.md-sidebar--secondary a', { hasText: 'B2b · Convert' }).first(); await D.aimClick(toc, { label: 'contents: B2b' }); await D.sleep(1800);
  const fd = D.page.locator('a[href$="bim-ootb/index.html"]', { hasText: 'front door' }).first(); await D.scrollInto(fd, 220); await D.aim(fd, { label: 'the front door link' }); D.cue('s8_link'); await D.click({ label: 'front door' });
  await D.waitUrl(/bim-ootb\/index\.html/, 60000); await D.page.waitForSelector('.hot.red', { state: 'visible', timeout: 60000 }); await D.sleep(2500); D.cue('s8_front');
  // the red pill: the hotspot is a box over the picture; the pill itself sits at 73.5 % across, 43 % down it (measured on this desktop's frame fd.png)
  await D.aim('.hot.red', { fx: 0.735, fy: 0.43, label: 'the red pill' }); await D.click({ label: 'the red pill' }); await D.sleep(2500);
  await D.aimClick('.por-ic[title="Buildings / IFC"]', { label: 'Buildings / IFC' }); await D.sleep(2200);
  await D.aim(D.page.locator('.hub-card', { hasText: 'Blank Viewer' }).first(), { label: 'Blank Viewer · Open your own .db file' }); D.cue('s8_card'); await D.click({ label: 'Blank Viewer' });
  D.fastStart('the Viewer loads'); await D.waitUrl(/viewer\/viewer\.html/, 90000); await D.page.waitForFunction('window.APP && typeof window.APP.openModelDb === "function"', null, { timeout: 240000 }); await D.sleep(2500); D.fastEnd();
  D.cue('s8_viewer'); await D.aimClick(AREA, { label: 'the model area (focus)' }); await D.sleep(500);
  D.cue('s8_ctrlo'); await D.key('ctrl+o', 'Open Building');
  const ok = await D.pick(['Downloads'], async (R) => { const f = await D.findText(t => /extracted\.db$/.test(t), R); if (!f) return false; await D.aim(D.screenBox(f.x - 60, f.y - 4, f.w + 70, f.h + 8, 'SHED_extracted.db'), { label: 'SHED_extracted.db' }); await D.click({ label: 'SHED_extracted.db' }); await D.sleep(700); }, 'the Viewer database');
  if (!ok) return;
  D.fastStart('the building opens'); let st = '';
  for (let i = 0; i < 360 && !/DONE/.test(st); i++) { st = await D.page.evaluate(() => (window.APP && window.APP.status ? window.APP.status.textContent : '')); if (!/DONE/.test(st)) await D.sleep(500); }
  D.fastEnd(); D.check(/DONE — SHED 511 elements/.test(st), 'viewer_done_511', JSON.stringify(st.slice(0, 120)));   // guide B2.9: 'DONE — SHED 511 elements'
  D.cue('s8_done', { status: st.slice(0, 120) }); await D.sleep(2500);
  await D.moveTo(900, 640); await D.drag(1200, 600, 2.0); await D.sleep(1500);
  // copy the status line NOW (it changes once Find runs): three clicks select it, Ctrl+C copies it
  await D.aim('#status', { label: 'the status line' }); D.cue('s8_copy'); await D.click({ n: 3, label: 'the status line (triple-click)' }); await D.key('ctrl+c', 'copy'); await D.sleep(1500); D.cue('s8_end');
};
// Chrome's tab strip is not in any page: the two tabs' boxes were MEASURED on this desktop's frame v1.png (tab 1 x 56-280, tab 2 x 290-516, y 10-40)
const TAB1 = D.screenBox(70, 12, 190, 26, 'tab 1'), TAB2 = D.screenBox(305, 12, 190, 26, 'tab 2');
const tabTo = async (box, rx) => { await D.aimClick(box, { label: box.name }); await D.sleep(900); const ok = await D.waitUrl(rx, 8000); D.check(ok, 'tab_shown ' + rx, 'window title "' + D.shownTitle() + '"'); };
const CHECK = /capex\/uat\/check\.html/;
S.s10 = async () => {   // B5.2 (box 4): the Run Checker in the first tab, the status line pasted
  D.cue('s10_start'); await tabTo(TAB1, /bim-ootb\/index\.html|CapexUATGuide/);
  for (let i = 0; i < 4 && !/CapexUATGuide/.test(D.page.url()); i++) { await D.aimClick(BACK, { label: 'Back' }); await D.sleep(1500); }   // the front door keeps its own history steps
  D.check(/CapexUATGuide/.test(D.page.url()), 'back_to_guide', D.page.url());
  const toc = D.page.locator('.md-sidebar--secondary a', { hasText: 'B5 · Mark your run' }).first(); await D.aimClick(toc, { label: 'contents: B5' }); await D.sleep(1800);
  const ln = D.page.locator('a[href*="capex/uat/check.html"]').first(); await D.scrollInto(ln, 220); await D.aim(ln, { label: 'the UAT Run Checker link' }); await D.click({ label: 'UAT Run Checker' });
  await D.waitUrl(CHECK, 60000); await D.page.waitForSelector('#vline', { state: 'visible', timeout: 60000 }); await D.sleep(1500); D.cue('s10_checker');
  await D.scrollInto('#vline', 200); await D.aimClick('#vline', { label: 'box 4' }); D.cue('s10_paste'); await D.key('ctrl+v', 'paste');
  const v = await D.page.$eval('#vline', e => e.value); D.check(/DONE — SHED 511 elements/.test(v), 'box4_pasted', JSON.stringify(v.slice(0, 100)));
  D.cue('s10_pasted'); await D.sleep(3500); D.cue('s10_end');
};
S.s9 = async () => {   // B3.1: the Find panel, 'total cost'
  D.cue('s9_start'); await tabTo(TAB2, /viewer\/viewer\.html/); await D.aimClick(AREA, { label: 'the model area (focus)' }); await D.sleep(400);
  await D.key('f', 'the Find panel');
  for (let i = 0; i < 40; i++) { if (await D.page.evaluate(() => { const p = document.getElementById('find-panel'); return !!(p && p.getBoundingClientRect().width > 0); })) break; await D.sleep(300); }
  await D.aim('#find-name', { label: 'the Find box' }); await D.click({ label: 'the Find box' }); D.cue('s9_type'); await D.type('total cost'); await D.key('Return', 'ask');
  let t = ''; for (let i = 0; i < 120 && !/USD\s*[\d,]+/.test(t); i++) { t = await D.page.evaluate(() => (document.getElementById('nlp-toast') || {}).innerText || ''); if (!/USD/.test(t)) await D.sleep(500); }
  const line = t.split('\n')[0]; D.check(/USD 96,839 \(RM 372,457\) — total building cost/.test(t), 'total_cost_line', JSON.stringify(line));   // guide B3.1
  D.cue('s9_cost', { line }); await D.sleep(3000);
  await D.aim('#nlp-toast', { fy: 0.2, label: 'the answer' }); D.cue('s9_copy'); await D.click({ n: 3, label: 'the answer (triple-click)' }); await D.key('ctrl+c', 'copy'); await D.sleep(1500); D.cue('s9_end');
};

S.s11 = async () => {   // B5.1 + B5.2: box 5 pasted, box 1 the pack's zip, box 3 the database
  D.cue('s11_start'); await tabTo(TAB1, CHECK);
  await D.aimClick('#cline', { label: 'box 5' }); await D.key('ctrl+v', 'paste'); const c = await D.page.$eval('#cline', e => e.value);
  D.check(/USD 96,839 \(RM 372,457\) — total building cost/.test(c), 'box5_pasted', JSON.stringify(c.slice(0, 100))); D.cue('s11_pasted'); await D.sleep(1500);
  await D.scrollInto('#pack', 200); await D.aim('#pack', { label: 'box 1' }); D.cue('s11_box1'); await D.click({ label: 'box 1' });
  let ok = await D.pick(['Downloads'], async (R) => { const f = await D.findText(t => /pack_2026111\d\.zip$/.test(t), R); if (!f) return false; await D.aim(D.screenBox(f.x - 60, f.y - 4, f.w + 70, f.h + 8, 'the pack zip'), { label: 'Shed_UAT_pack_20261115.zip' }); await D.click({ label: 'the pack zip' }); await D.sleep(700); }, 'box 1: the pack');
  if (!ok) return;
  let intact = ''; for (let i = 0; i < 60 && !/Pack intact/.test(intact); i++) { intact = await D.page.evaluate(() => document.body.innerText); if (!/Pack intact/.test(intact)) await D.sleep(500); }
  const il = (/Pack intact: 19 files checked[^\n]*/.exec(intact) || [''])[0]; D.check(!!il, 'pack_intact_19', JSON.stringify(il.slice(0, 100))); D.cue('s11_intact'); await D.sleep(2500);   // guide B5.1
  await D.scrollInto('#db', 200); await D.aim('#db', { label: 'box 3' }); await D.click({ label: 'box 3' });
  ok = await D.pick(['Downloads'], async (R) => { const f = await D.findText(t => /extracted\.db$/.test(t), R); if (!f) return false; await D.aim(D.screenBox(f.x - 60, f.y - 4, f.w + 70, f.h + 8, 'SHED_extracted.db'), { label: 'SHED_extracted.db' }); await D.click({ label: 'SHED_extracted.db' }); await D.sleep(700); }, 'box 3: the database');
  D.cue('s11_box3'); await D.sleep(2500); D.cue('s11_end');
};
S.s12 = async () => {   // B5.3 + B5.4: Mark my run, Download result
  D.cue('s12_start');
  await D.page.waitForFunction(() => { const g = document.getElementById('go'); return !!g && !g.disabled; }, null, { timeout: 90000 });
  await D.scrollInto('#go', 200); await D.aim('#go', { label: 'Mark my run' }); D.cue('s12_go'); await D.click({ label: 'Mark my run' });
  await D.page.waitForFunction(() => document.querySelectorAll('#rows tr').length >= 4, null, { timeout: 90000 }); await D.sleep(1200);
  const rows = await D.page.evaluate(() => [...document.querySelectorAll('#rows tr')].map(r => r.innerText.replace(/\s+/g, ' ').trim())); const body = await D.page.evaluate(() => document.body.innerText);
  D.log('§FILM_ROWS ' + JSON.stringify(rows)); const run = (/PARTIAL PASS|\bPASS\b|FAIL/.exec(body.split('Your run')[1] || body) || [''])[0];
  D.check(rows.some(r => /B0\.9/.test(r) && /NOT GIVEN/.test(r)) && /PARTIAL PASS/.test(body), 'run_partial_pass_b09_not_given', 'run=' + run);   // guide B5.3: skipped B00 and B0 -> B0.9 NOT GIVEN, PARTIAL PASS
  D.cue('s12_marked'); await D.scrollInto('#rows', 160); await D.sleep(4500);
  await D.scrollInto('#dl', 200); await D.aim('#dl', { label: 'Download result (uat_result.json)' }); D.cue('s12_dl'); await D.click({ label: 'Download result' });
  const f = await D.waitFile(/uat_result.*\.json$/, 60000); let j = null; try { j = JSON.parse(fs.readFileSync(f.path, 'utf8')); } catch (e) { }
  D.check(!!j, 'result_saved_valid_json', f ? f.name : 'none'); D.cue('s12_saved'); await D.sleep(3500); D.cue('s12_end');
};

// §5.12 scene s13: iDempiere Pack In through its window (guide A3.1, second option), on the shared test instance :8108 (its database copied before the take and restored after, not filmed)
const IDEMP = 'localhost:8108/webui/';
PREP.s13 = async () => {   // set-up, not filmed: the test-data zip in the fresh Downloads (scene s2 shows that download), from the guide's own link
  await PREP.oneTab(); await D.page.goto(GUIDE); await D.page.waitForLoadState('load');
  const href = await D.page.$eval('a[href*="CAPEXTestData.zip"]', a => a.href); const r = await D.page.request.get(href); const b = await r.body();
  fs.writeFileSync(path.join(D.dlDir(), href.split('/').pop()), b); D.log('§FILM_PREP s13 test-data zip ' + href.split('/').pop() + ' bytes=' + b.length);
};
const vis = sel => D.page.locator(sel + ':visible').first();
const textOf = async sel => D.page.evaluate(s => [...document.querySelectorAll(s)].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.innerText || e.value || '').trim()).join(' | '), sel);
// §5.12 take-1 cause: Chrome's own window 'Change your password' (the demo password GardenAdmin is in a known data breach) covers the page and takes the clicks.
// A tester sees it too, so the film shows it: OCR finds the window's heading, the pointer clicks its OK. Called after the login OK and after the role OK (it can come at either).
const chromePwWarn = async (when) => {
  for (let i = 0; i < 6; i++) {
    const head = await D.findText(t => t === 'Change', D.screenBox(700, 180, 560, 120, 'Chrome window heading'), 2, true);
    if (!head) { await D.sleep(1000); continue; }
    let ok = await D.findText(t => /^[O0]K\.?$/i.test(t), D.screenBox(head.x + 200, head.y + 60, 400, 180, 'Chrome window OK'), 3, true);
    if (!ok) {   // white on orange is not always read (take 2, 2026-11-20): place it from the heading, as measured on the recorded frame (heading 755,240 -> OK centre 1130,357)
      ok = { x: head.x + 375 - 18, y: head.y + 117 - 10, w: 36, h: 20 }; D.log('§FILM_OCR_DERIVED Chrome OK from heading at=' + [head.x, head.y].join(',') + ' -> ' + [ok.x, ok.y, ok.w, ok.h].join(',')); }
    D.cue('s13_chrome_warn'); await D.aim(D.screenBox(ok.x - 24, ok.y - 10, ok.w + 48, ok.h + 20, 'OK (Chrome)'), { label: 'OK (Chrome: Change your password)' }); await D.click({ label: 'OK (Chrome)' }); await D.sleep(1500);
    const gone = !(await D.findText(t => t === 'Change', D.screenBox(700, 180, 560, 120, 'Chrome window heading'), 2, true)); D.check(gone, 'chrome_password_window_closed', when); return gone;
  }
  D.log('§FILM_NOTE no Chrome password window ' + when); return true;
};
S.s13 = async () => {
  D.cue('s13_start');
  await D.key('ctrl+t', 'a new tab'); await D.sleep(1200); await D.usePage(/^(about:blank|chrome:\/\/new-tab-page|chrome:\/\/newtab)/); await D.page.bringToFront();
  await D.aimClick(OMNIBOX, { label: 'the address bar' }); await D.type(IDEMP); await D.key('Return', 'open iDempiere');
  await D.waitUrl(/8108\/webui/, 60000); await D.page.waitForFunction(() => document.querySelectorAll('input.z-textbox').length >= 2, null, { timeout: 90000 }); await D.sleep(1500);
  const boxes = D.page.locator('input.z-textbox'); D.check(await boxes.count() >= 2, 'login_form', 'boxes=' + await boxes.count()); D.cue('s13_login');
  await D.aimClick(boxes.nth(0), { label: 'User' }); await D.type('GardenAdmin');
  await D.aimClick(boxes.nth(1), { label: 'Password' }); await D.type('GardenAdmin');
  await D.aimClick(vis('button.btn-ok'), { label: 'OK (log in)' }); await D.sleep(4000);
  await chromePwWarn('after log in');
  // the role window comes on some logins and not on others (take 3: straight to Home): wait for whichever comes, press the role OK only when it is there
  const which = await D.page.waitForFunction(() => document.querySelector('input.z-bandbox-input[placeholder="Alt+G"]') ? 'home' : (/Select Role/.test((document.querySelector('.login-box-header-txt') || {}).innerText || '') ? 'role' : null), null, { timeout: 60000 }).then(h => h.jsonValue());
  D.log('§FILM_NOTE after log in: ' + which);
  if (which === 'role') { D.check(true, 'role_window_shown', 'Select Role'); await D.sleep(1500); await D.aimClick(vis('button.btn-ok'), { label: 'OK (role)' }); await D.sleep(2500); await chromePwWarn('after role'); }
  const sb = 'input.z-bandbox-input[placeholder="Alt+G"]'; await D.page.waitForSelector(sb + ':visible', { timeout: 90000 }); D.check(true, 'search_box_shown'); await D.sleep(2500);
  await D.aimClick(vis(sb), { label: 'the search box' }); await D.type('Pack In'); await D.sleep(2500);
  const item = D.page.locator('.z-listitem:visible', { hasText: /^\s*Pack In\s*$/ }).first(); D.check(await item.count() === 1, 'search_lists_pack_in', await textOf('.z-listitem'));
  await D.aimClick(item, { label: 'Pack In (search result)' });
  await D.page.waitForSelector('button.form-button:visible', { timeout: 60000 }); await D.sleep(2500); D.check(/PackIn/.test(await textOf('button.form-button')), 'packin_window_open', await textOf('button.form-button')); D.cue('s13_window'); await D.sleep(2000);
  await D.aimClick(vis('a.toolbar-button[title^="New"]'), { label: 'New' }); await D.sleep(2500);
  const nm = vis('input.idempiere-mandatory.z-textbox'); D.check(await nm.count() === 1 && (await nm.inputValue()) === '', 'name_box_empty_mandatory');
  await D.aimClick(nm, { label: 'Name' }); await D.type('CAPEX test data');
  await D.aimClick(vis('a.toolbar-button[title^="Save Changes"]'), { label: 'Save' }); await D.sleep(3000);
  const st = await D.page.evaluate(() => document.body.innerText); D.check(/Record saved/.test(st), 'record_saved', /Record saved/.test(st) ? 'Record saved' : 'no Record saved'); D.cue('s13_saved');
  await D.aimClick(vis('a.toolbar-button[title^="Attachment"]'), { label: 'Attachment (paperclip)' }); await D.sleep(2500);
  const load = D.page.locator('.z-window button.img-btn[title^="Load"]:visible').first();   // icon-only button: its word is the tooltip (title) await load.waitFor({ state: 'visible', timeout: 30000 });
  await D.aimClick(load, { label: 'Load' });
  const ok = await D.pick(['Downloads'], async (R) => { const f = await D.findText(t => /CAPEXTestData\.zip$/.test(t), R); if (!f) return false; await D.aim(D.screenBox(f.x - 60, f.y - 4, f.w + 70, f.h + 8, 'the test-data zip'), { label: 'the test-data zip' }); await D.click({ label: 'the test-data zip' }); }, 'the test-data zip');
  if (!ok) return; await D.sleep(3000);
  const named = await D.page.evaluate(() => [...document.querySelectorAll('.z-window')].filter(w => w.getBoundingClientRect().width > 0 && /Attachment/.test(w.innerText)).map(w => w.innerText + ' ' + [...w.querySelectorAll('input,select,option')].map(i => i.value || i.textContent).join(' ')).join(' ')); D.check(/CAPEXTestData\.zip/.test(named), 'attachment_names_zip', JSON.stringify(named.slice(0, 160)));
  await D.aimClick(D.page.locator('.z-window button.btn-ok:visible').last(), { label: 'OK (attachment)' }); await D.sleep(2500); D.cue('s13_attached'); await D.sleep(2000);
  await D.aimClick(vis('button.form-button'), { label: 'PackIn' }); await D.sleep(2500);
  const pok = D.page.locator('.z-window button.txt-btn.btn-ok:visible').first(); await pok.waitFor({ state: 'visible', timeout: 30000 }); D.check(true, 'process_dialog_shown', JSON.stringify((await textOf('.z-window')).slice(-80)));
  await D.aimClick(pok, { label: 'OK (run Pack In)' });
  let msg = ''; for (let i = 0; i < 150 && !/Processed=/.test(msg); i++) { msg = await D.page.evaluate(() => [...document.querySelectorAll('textarea')].map(t => t.value).filter(Boolean).join(' / ')); if (!/Processed=/.test(msg)) await D.sleep(1000); }
  const line = (/Processed=\d+ Un-Resolved=\d+/.exec(msg) || [''])[0]; D.check(/Processed=\d+ Un-Resolved=0/.test(line), 'packin_processed_unresolved_0', JSON.stringify(line));
  D.cue('s13_done', { line }); await D.sleep(4000); D.cue('s13_end');
};

(async () => {
  const [out, home, ...which] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  await D.init(home, path.join(out, 'scenes.log'));
  for (const s of which) {
    D.log('§FILM_SCENE ' + s + ' begin');
    if (PREP[s]) await PREP[s]();
    await D.recStart(path.join(out, s + '.mkv'));
    const f0 = D.fails();
    try { await S[s](); } catch (e) { D.check(false, s + '_threw', e.message.split('\n')[0]); }
    await D.recStop();
    // a failed scene leaves the desktop in its state (full take 2026-11-19: s5's file window stayed open through s6 and s7, both then failed on it; §5.9).
    // A FAIL is a re-take anyway, so stop here: close a file window left open, name the scene to re-take, do not spend the rest of the take on scenes that cannot pass.
    if (D.fails() > f0) { try { if (D.win('^(Open File|Select files)')) await D.key('Escape', 'close the file window left open'); } catch (e) { }   // the display itself may be gone (full take s8)
      D.log('§FILM_STOP first failed scene=' + s + ' (re-take from ' + s + ' with its PREP; the scenes after it were not run)'); break; }
  }
  D.log('§FILM_SCENES_VERDICT ' + (D.fails() ? 'FAIL fails=' + D.fails() : 'PASS') + ' scenes=' + which.join(','));
  await D.close(); process.exit(D.fails() ? 1 : 0);
})();
