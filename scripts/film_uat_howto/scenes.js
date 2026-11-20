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
  // §5.15 Part II: the Modeller opened in the guide's own tab (one tab, measured), so a person goes Back to the guide first
  for (let i = 0; i < 3 && !/CapexUATGuide/.test(D.page.url()); i++) { await D.aimClick(BACK, { label: 'Back (to the guide)' }); await D.waitUrl(/CapexUATGuide|modeller/, 15000); await D.sleep(1500); }
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
  await D.aimClick('#cline', { label: 'box 5' }); await D.key('ctrl+a', 'select what is there'); await D.key('ctrl+v', 'paste'); const c = await D.page.$eval('#cline', e => e.value);
  D.check(/USD 96,839 \(RM 372,457\) — total building cost/.test(c), 'box5_pasted', JSON.stringify(c.slice(0, 100))); D.cue('s11_pasted'); await D.sleep(1500);
  await D.scrollInto('#pack', 200); await D.aim('#pack', { label: 'box 1' }); D.cue('s11_box1'); await D.click({ label: 'box 1' });
  let ok = await D.pick(['Downloads'], async (R) => { const f = await D.findText(t => /pack.2026111\d\.zip$/.test(t)   /* §5.15: the zip as the only, selected row reads "pack.20261115.zip" */, R); if (!f) return false; await D.aim(D.screenBox(f.x - 60, f.y - 4, f.w + 70, f.h + 8, 'the pack zip'), { label: 'Shed_UAT_pack_20261115.zip' }); await D.click({ label: 'the pack zip' }); await D.sleep(700); }, 'box 1: the pack');
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

// §5.15 Part II end of the chain: box 2 = the nine copies the tester saved in B0.9, and the run judged PASS on all four rows
S.p11 = async () => {   // B5.1 + B5.2 with box 2: s11 (box 5, box 1, box 3), then box 2 the nine saved copies
  await S.s11(); if (D.fails()) return;
  D.cue('p11_box2'); await D.scrollInto('#marked', 200); await D.aim('#marked', { label: 'box 2' }); await D.click({ label: 'box 2' });
  const ok = await D.pick(['Downloads'], pickNine, 'box 2: the nine saved copies'); if (!ok) return;
  await D.sleep(1500); const n = await D.page.$eval('#marked', e => e.files.length); D.check(n === 9, 'box2_nine_copies', 'files=' + n);   // guide B5.2: 'In box 2 select your nine …_marked.dxf'
  D.cue('p11_end'); await D.sleep(2000);
};
S.p12 = async () => {   // B5.3 + B5.4: Mark my run -> four rows PASS, the run PASS; Download result
  D.cue('p12_start');
  await D.page.waitForFunction(() => { const g = document.getElementById('go'); return !!g && !g.disabled; }, null, { timeout: 90000 });
  await D.scrollInto('#go', 200); await D.aim('#go', { label: 'Mark my run' }); D.cue('p12_go'); await D.click({ label: 'Mark my run' });
  await D.page.waitForFunction(() => document.querySelectorAll('#rows tr').length >= 4 && /Your run/.test((document.getElementById('verdict') || {}).innerText || ''), null, { timeout: 120000 }); await D.sleep(1200);
  const rows = await D.page.evaluate(() => [...document.querySelectorAll('#rows tr')].map(r => r.innerText.replace(/\s+/g, ' ').trim())), v = await D.page.$eval('#verdict', e => e.innerText.trim());
  D.log('§FILM_ROWS ' + JSON.stringify(rows));
  const b09 = rows.find(r => /B0\.9/.test(r)) || ''; D.check(/\bPASS\b/.test(b09) && !/NOT GIVEN|FAIL/.test(b09), 'b53_b09_marked_sheets_pass', JSON.stringify(b09.slice(0, 160)));   // the tester's marks equal the answer key's
  D.check(v === 'Your run: PASS', 'b53_run_pass', JSON.stringify(v));   // guide B5.3: 'Your run reads PASS when all four pass'
  D.cue('p12_marked'); await D.scrollInto('#rows', 160); await D.sleep(4500);
  await D.scrollInto('#dl', 200); await D.aim('#dl', { label: 'Download result (uat_result.json)' }); D.cue('p12_dl'); await D.click({ label: 'Download result' });
  const f = await D.waitFile(/uat_result.*\.json$/, 60000); let j = null; try { j = JSON.parse(fs.readFileSync(f.path, 'utf8')); } catch (e) { }
  D.check(!!j && j.verdict === 'PASS', 'result_saved_verdict_pass', f ? f.name + ' verdict=' + (j && j.verdict) : 'none'); D.cue('p12_saved'); await D.sleep(3500); D.cue('p12_end');
};
// ================= §5.14 / §5.15 PART II: the raw sheets, marked by hand (B0.1-B0.9), then Arrange (B2.3) and a full PASS at B5 =================
// Source of every value: the guide's B0 table and W-UAT-B0 (bim-ootb capex/tests/witness_uat_b0_raw_to_marked.js); the tables below are COPIED from that witness.
const LAYERS = [['plan', 'Col', 'column'], ['plan', 'Fo', 'footing'], ['elev', 'Wall', 'panel'], ['elev', 'Rod', 'fan'], ['elev', 'Dim', 'net'], ['section', 'Fo', 'bar'], ['elev', 'Win', 'door'],
  ['elev', '0', 'column', '1S_ELEV_SOUTH.dxf'], ['plan', 'Dim', 'beam', '3_BEAM_LAYOUT.dxf'], ['plan', 'Rod', 'doorswing', '0_FLOOR_PLAN.dxf']];
const DATUMS = [['1S_ELEV_SOUTH.dxf', '-4446.6'], ['1N_ELEV_NORTH.dxf', '-3895.2'], ['2_ELEV_WEST.dxf', '-4515.7264'], ['7_ELEV_EAST.dxf', '-3766.442'], ['8_SECTION_AA_TRUSS.dxf', '-3726.416']];
const BODYZ = [['footing', '-1.4478', '-1.143'], ['beam', '3.098794', '3.352794']];
const EX_AIM = [-20885, -5610, -20847, -4940], EX_TOL = { x0: [-20908, -20873.6], x1: [-20850.7, -20843.3], y0max: -5577.3, y1min: -4965.3 };
const PACK = 'Shed_UAT_pack_20261115', BODY = '#dm-body';
const dm = {   // the Drawing metadata panel, read from its own text (what the tester reads); roles from the panel state (B:READ: the role words sit inside nine cards)
  chip: () => D.page.$eval('#dm-chip', e => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => ''),
  head: id => D.page.$eval('[data-act="sec"][data-sec="' + id + '"]', e => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => ''),
  yellow: () => D.page.evaluate(() => document.querySelectorAll('#dm-yellows [data-act="confirm"],#dm-yellows [data-act="dconfirm"],#dm-yellows [data-act="defkeep"]').length),
  roles: () => D.page.evaluate(() => { const r = {}; window.DxfMetaEditor.state.sheets.forEach(s => { const m = s.marks.find(q => q.key === 'VIEW'); if (m) r[m.value] = (r[m.value] || 0) + 1; }); return r; }),
  idle: () => D.page.waitForFunction(() => window.DxfMetaEditor && !window.DxfMetaEditor.state.busy && window.DxfMetaEditor.state.verdict, null, { timeout: 120000, polling: 250 }).then(() => D.sleep(700)),
  open: async (id, label) => { const h = '[data-act="sec"][data-sec="' + id + '"]'; const isOpen = await D.page.evaluate(id => !!window.DxfMetaEditor.state.sec[id], id);
    if (!isOpen) { await D.scrollIn(h, BODY); await D.aimClick(h, { label: 'open ' + label }); await dm.idle(); } return D.page.evaluate(id => !!window.DxfMetaEditor.state.sec[id], id); },
  fold: async (id, label) => { const h = '[data-act="sec"][data-sec="' + id + '"]'; if (await D.page.evaluate(id => !!window.DxfMetaEditor.state.sec[id], id)) { await D.scrollIn(h, BODY); await D.aimClick(h, { label: 'fold ' + label }); await dm.idle(); } },
};
PREP.p1 = async () => {   // set-up, not filmed (Part I films the download and the Extract): the pack zip and its extracted folder in the fresh Downloads; the guide open
  await PREP.oneTab(); const src = process.env.PACK_ZIP; if (!src || !fs.existsSync(src)) throw new Error('PACK_ZIP not set (the reference pack zip)');
  fs.copyFileSync(src, path.join(D.dlDir(), PACK + '.zip')); require('child_process').execFileSync('unzip', ['-q', '-o', src, '-d', path.join(D.dlDir(), PACK)]);
  D.log('§FILM_PREP p1 pack ' + PACK + '.zip bytes=' + fs.statSync(src).size + ' sheets=' + fs.readdirSync(path.join(D.dlDir(), PACK, 'sheets')).length);
  await D.page.goto(GUIDE); await D.page.waitForLoadState('load'); await D.sleep(1500);
};
S.p1 = async () => {   // B0.1: the Modeller, the nine RAW sheets (the pack's sheets/, no marks) through the OS file window
  D.cue('p1_start');
  const toc = D.page.locator('.md-sidebar--secondary a', { hasText: 'B0 · From the drawings' }).first();
  await D.aim(toc, { label: 'contents: B0' }); await D.click({ label: 'contents: B0' }); await D.sleep(1800);
  const link = D.page.locator('a[href*="modeller/modeller.html"]').first(); await D.aim(link, { label: 'the Modeller link' }); D.cue('p1_link'); await D.click({ label: 'the Modeller link' });
  D.fastStart('the Modeller loads'); await D.waitUrl(/modeller\/modeller\.html/, 60000); await MOD.ready(); await D.sleep(1500); D.fastEnd();
  await D.aimClick('#b-open', { label: 'Open' }); await D.sleep(600);
  await D.aim('#m-open-panel .mo-row[data-key="__dxf"]', { label: 'Open 2D drawings (.dxf)…' }); D.cue('p1_row'); await D.click({ label: 'Open 2D drawings (.dxf)…' });
  const ok = await D.pick(['Downloads', t => /^Shed_UAT_pack_2026111\d$/.test(t), 'sheets'], async () => { await D.key('ctrl+a', 'select all nine'); await D.sleep(900); }, 'the nine raw sheets');
  if (!ok) return;
  D.fastStart('the sheets are read'); await D.page.waitForFunction(n => window.DxfMetaEditor && window.DxfMetaEditor.state.sheets.length === n && !window.DxfMetaEditor.state.busy && window.DxfMetaEditor.state.verdict, 9, { timeout: 300000, polling: 300 }); await D.sleep(1500); D.fastEnd();
  const chip = await dm.chip(), yh = await dm.head('yellows'), roles = await dm.roles();
  D.check(/^Blocked · \d+$/.test(chip), 'b01_badge_blocked', JSON.stringify(chip));             // guide B0.1: 'The badge reads Blocked with a number'
  D.check(/ALL DEFAULTS 34 yellow/.test(yh), 'b01_all_defaults_34', JSON.stringify(yh));        // guide B0.1: 'All defaults lists 34 yellow rows'
  D.check(Object.keys(roles).length === 0, 'b01_no_sheet_has_a_role', JSON.stringify(roles));  // the raw sheets carry no marks (W-UAT-B0 R0)
  await D.aim('#dm-chip', { label: 'the badge: ' + chip }); D.cue('p1_badge', { chip }); await D.sleep(1800);
  await D.aim('[data-act="sec"][data-sec="yellows"]', { label: 'All defaults: 34 yellow', fx: 0.8 }); D.cue('p1_yellow'); await D.sleep(2500); D.cue('p1_end');
};
S.p2 = async () => {   // B0.2 + B0.2b: Accept stated + read (34 -> 113), then Accept all (113 -> 0)
  D.cue('p2_start'); const b1 = '#dm-yellows [data-act="acceptsr"]';
  await D.scrollIn(b1, BODY); await D.aim(b1, { label: 'Accept stated + read' }); D.cue('p2_sr'); await D.click({ label: 'Accept stated + read' }); await dm.idle();
  const y1 = await dm.head('yellows'); D.check(/ALL DEFAULTS 113 yellow/.test(y1), 'b02_grows_to_113', JSON.stringify(y1));   // guide B0.2
  D.cue('p2_113'); await D.sleep(2200);
  const b2 = '#dm-yellows [data-act="acceptall"]'; await D.scrollIn(b2, BODY); await D.aim(b2, { label: 'Accept all' }); D.cue('p2_all'); await D.click({ label: 'Accept all' }); await dm.idle();
  const n = await dm.yellow(), chip = await dm.chip(), roles = await dm.roles();
  D.check(n === 0, 'b02b_0_yellow', 'yellow=' + n + ' head=' + JSON.stringify(await dm.head('yellows')));            // guide B0.2b: '0 yellow rows'
  D.check(/^Blocked · (48|89)$/.test(chip), 'b02b_badge_blocked_smaller', JSON.stringify(chip));                      // guide B0.2b: 'Blocked with a smaller number (48 or 89)'
  D.check(roles.PLAN === 3 && roles.ELEV === 4 && roles.SECTION === 1, 'b02b_roles_3plan_4elev_1section', JSON.stringify(roles));
  await D.aim('#dm-chip', { label: 'the badge: ' + chip }); D.cue('p2_done', { chip }); await D.sleep(2500); D.cue('p2_end');
};
S.p3 = async () => {   // B0.3: one card's Set field: BUILD-NAME -> SHED, Enter (typing it once fills all nine)
  D.cue('p3_start'); await dm.open('sheets', 'Sheets'); const f = '#dm-f-0-SET';
  await D.scrollIn(f, BODY); await D.aimClick(f, { label: 'Set (first card)' }); await D.key('ctrl+a', 'select BUILD-NAME'); D.cue('p3_type'); await D.type('SHED'); await D.key('Return', 'Enter'); await dm.idle();
  const v = await D.page.evaluate(() => [...Array(9).keys()].map(i => (document.getElementById('dm-f-' + i + '-SET') || {}).value));
  D.check(v.length === 9 && v.every(x => x === 'SHED'), 'b03_every_set_reads_shed', JSON.stringify(v));   // guide B0.3: 'Every sheet's Set reads SHED'
  D.cue('p3_done'); await D.sleep(2000);
  const f1 = '#dm-f-1-SET'; await D.scrollIn(f1, BODY); await D.aim(f1, { label: 'Set (second card): SHED' }); await D.sleep(1800); D.cue('p3_end');
};
S.p4 = async () => {   // B0.4 + B0.4b: Layers, the ten meanings (two through the split arrow), then Accept all (14 -> 0)
  D.cue('p4_start'); await dm.fold('sheets', 'Sheets'); await dm.open('layers', 'Layers'); D.cue('p4_layers');
  for (const [role, L, ui, only] of LAYERS) {
    const key = role + '|' + L, pooledSel = 'select[data-act="layer"][data-role="' + role + '"][data-layer="' + L + '"]:not([data-sheet])', oneSel = only && 'select[data-act="layer"][data-role="' + role + '"][data-layer="' + L + '"][data-sheet="' + only + '"]';
    let sel = pooledSel, how = 'pooled';
    if (only) { const arrow = '[data-act="laysplit"][data-key="' + key + '"]';
      if (await D.page.$(arrow)) { if (!(await D.page.$(oneSel))) { await D.scrollIn(arrow, BODY); await D.aim(arrow, { label: 'Type this layer sheet by sheet (' + key + ')' }); D.cue('p4_split', { key }); await D.click({ label: 'the split arrow' }); await dm.idle(); } sel = oneSel; how = 'one sheet: ' + only; }
      else how = 'pooled (no arrow: the layer is on ' + only + ' only, guide B0.4 table)'; }
    await D.scrollIn(sel, BODY); D.cue('p4_pick', { role, L, ui }); await D.pickSelect(sel, ui, role.toUpperCase() + ' · ' + L); await dm.idle();
    // once set, a layer the template can name shows '<type> · stated' in place of its list (dxf_meta_editor.js renderLayers, measured 2026-11-20): read whichever the row shows
    const row = '[data-layer-row="' + key + (sel === oneSel ? '|' + only : '') + '"]';
    const v = await D.page.evaluate(([sel, row]) => { const s = document.querySelector(sel); if (s) return s.value; const t = document.querySelector(row + ' .dm-tt'); return t ? t.innerText.replace(/ · stated$/, '').trim() : '(no row)'; }, [sel, row]), chip = await dm.chip();
    D.check(v === ui || (ui === 'door' && v === 'elevdoor'),'b04_layer ' + role + ' ' + L + (only ? ' (' + only + ')' : '') + ' = ' + ui, 'value=' + v + ' via ' + how + ' badge=' + JSON.stringify(chip));
    if (role === 'plan' && L === 'Col') D.check(chip === 'Blocked · 1', 'b04_after_plan_col_blocked_1', JSON.stringify(chip));     // guide B0.4
    if (role === 'elev' && L === 'Wall') D.check(chip === 'Qualifies', 'b04_after_elev_wall_qualifies', JSON.stringify(chip));  // guide B0.4
  }
  const yh = await dm.head('yellows'); D.check(/ALL DEFAULTS 14 yellow/.test(yh), 'b04_all_ten_set_14_yellow', JSON.stringify(yh));   // guide B0.4: '14 yellow rows'
  await D.aim('#dm-chip', { label: 'the badge' }); D.cue('p4_qualifies'); await D.sleep(1800);
  const b = '#dm-yellows [data-act="acceptall"]'; await D.scrollIn(b, BODY); await D.aim(b, { label: 'Accept all' }); D.cue('p4_all'); await D.click({ label: 'Accept all' }); await dm.idle();
  const n = await dm.yellow(); D.check(n === 0, 'b04b_0_yellow', 'yellow=' + n);   // guide B0.4b
  D.cue('p4_done'); await D.sleep(2000); D.cue('p4_end');
};
const typeInto = async (sel, text, label) => { await D.scrollIn(sel, BODY); await D.aimClick(sel, { label }); await D.key('ctrl+a', 'select what is there'); await D.type(text); };
S.p5 = async () => {   // B0.5: Body heights, footing and beam (two rows)
  D.cue('p5_start'); await dm.fold('layers', 'Layers'); await dm.open('bodyz', 'Body heights'); D.cue('p5_open');
  for (const [k, z0, z1] of BODYZ) {
    await typeInto('#dm-bz-' + k + '-0', z0, k + ' z0'); await typeInto('#dm-bz-' + k + '-1', z1, k + ' z1');
    const add = '[data-act="bodyzadd"][data-kind="' + k + '"]'; await D.scrollIn(add, BODY); await D.aim(add, { label: 'Add (' + k + ')' }); D.cue('p5_add', { k }); await D.click({ label: 'Add' }); await dm.idle();
  }
  const t = await D.page.evaluate(() => (document.getElementById('dm-body') || {}).innerText || ''), chip = await dm.chip();
  D.check(/@BODYZ=footing,-1\.4478,-1\.143/.test(t) && /@BODYZ=beam,3\.098794,3\.352794/.test(t), 'b05_two_bodyz_rows', JSON.stringify((t.match(/@BODYZ=[^\s]+/g) || [])));   // guide B0.5
  D.check(chip === 'Qualifies', 'b05_badge_still_qualifies', JSON.stringify(chip));
  D.cue('p5_done'); await D.sleep(2000); D.cue('p5_end');
};
S.p6 = async () => {   // B0.6: on each elevation and the section card, Level datums (@Z): 0.6096 at the card's y, Add
  D.cue('p6_start'); await dm.fold('bodyz', 'Body heights'); await dm.open('sheets', 'Sheets');
  for (const [name, y] of DATUMS) {
    const si = await D.page.evaluate(n => window.DxfMetaEditor.state.sheets.findIndex(s => s.name === n), name);   // the card that carries this sheet's name
    const card = '[data-act="card"][data-sheet="' + si + '"]';
    if (!(await D.page.evaluate(si => !!window.DxfMetaEditor.state.open[si], si))) { await D.scrollIn(card, BODY); await D.aimClick(card, { label: 'open card ' + name }); await dm.idle(); }
    D.cue(DATUMS[0][0] === name ? 'p6_card' : 'p6_card_' + name.replace(/\.dxf$/, ''), { sheet: name });   /* cue extras must not use the key 'name' (it overwrote the cue's own name, build rc1) */ await typeInto('#dm-av-' + si + '-Z', '0.6096', name + ' datum height'); await typeInto('#dm-ap-' + si + '-Z', y, name + ' y where drawn');
    const add = '[data-act="add"][data-sheet="' + si + '"][data-group="Z"]'; await D.scrollIn(add, BODY); await D.aim(add, { label: 'Add (' + name + ')' }); await D.click({ label: 'Add' }); await dm.idle();
    const z = await D.page.evaluate(n => window.DxfMetaEditor.state.sheets.find(s => s.name === n).marks.filter(m => m.key === 'Z').map(m => m.value), name);
    D.check(z.filter(v => /^0\.6096\b/.test(String(v))).length === 1 && z.length === 3, 'b06_datum ' + name, JSON.stringify(z));   // guide B0.6: 'a new @Z=0.6096 row beside the two it read itself'
  }
  const chip = await dm.chip(); D.check(chip === 'Qualifies', 'b06_badge_still_qualifies', JSON.stringify(chip));
  D.cue('p6_done'); await D.sleep(2000); D.cue('p6_end');
};
// §5.15 open point 2: where the joint is DRAWN on screen (B:READ: the camera projection of EX_AIM through the sheet's own toWorld, as W-UAT-B0 aims), in SCREEN pixels
const joint = async () => { const o = await D.page.evaluate(() => ({ sx: screenX, sy: screenY, oh: outerHeight, ih: innerHeight, ow: outerWidth, iw: innerWidth }));
  const r = await D.page.evaluate(aim => { const A = window.A, THREE = window.THREE, c = window.DxfImportUI.state.canvas['3_BEAM_LAYOUT.dxf'], rc = A.renderer.domElement.getBoundingClientRect();
    const scr = (x, y) => { const w = c.toWorld(x, y), v = new THREE.Vector3(w[0], w[1], w[2]).project(A.camera); return [rc.left + (v.x + 1) / 2 * rc.width, rc.top + (1 - v.y) / 2 * rc.height]; };
    const pr = document.getElementById('dm-panel').getBoundingClientRect().right; return { a: scr(aim[0], aim[3]), b: scr(aim[2], aim[1]), all: [scr(aim[0], aim[1]), scr(aim[2], aim[1]), scr(aim[2], aim[3]), scr(aim[0], aim[3])], free: [pr + 10, rc.top + 70, rc.right - 10, rc.bottom - 10] }; }, EX_AIM);
  const side = (o.ow - o.iw) / 2, ox = o.sx + side, oy = o.sy + o.oh - o.ih - side, S2 = p => [p[0] + ox, p[1] + oy];
  const all = r.all.map(S2), xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  return { a: S2(r.a), b: S2(r.b), box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], free: [r.free[0] + ox, r.free[1] + oy, r.free[2] + ox, r.free[3] + oy] }; };
S.p7 = async () => {   // B0.7: Exclude areas: 3_BEAM_LAYOUT, Exclude area, zoom (wheel) + pan (right-drag) to the joint between grids 06 and 35, drag the box, leave the tool
  D.cue('p7_start'); await dm.fold('sheets', 'Sheets'); await dm.open('excludes', 'Exclude areas');
  const exs = '[data-act="exsheet"]'; await D.scrollIn(exs, BODY); D.cue('p7_sheet'); await D.pickSelect(exs, '3_BEAM', 'the Exclude areas list');
  const sv = await D.page.$eval(exs, s => s.value); D.check(sv === '3_BEAM_LAYOUT.dxf', 'b07_sheet_chosen', sv);
  const tool = '[data-act="tool"][data-tool="exclude"]'; await D.scrollIn(tool, BODY); await D.aim(tool, { label: 'Exclude area' }); D.cue('p7_tool'); await D.click({ label: 'Exclude area' }); await dm.idle();
  const bt = await D.page.$eval(tool, b => b.innerText.trim()); D.check(bt === 'Drag a box', 'b07_button_reads_drag_a_box', JSON.stringify(bt));   // guide B0.7: '(the button now reads Drag a box)'
  // zoom to the bay: a closed loop of real input. Pan (right-drag: the tool takes the left button only, dxf_meta_editor.js:232) the joint to the middle of the free canvas, one wheel notch, read again
  D.cue('p7_zoom'); D.fastStart('zoom to the joint (wheel + right-drag)'); let j = await joint(), notches = 0, pans = 0;
  for (let i = 0; i < 90; i++) {
    const cx = (j.box[0] + j.box[2]) / 2, cy = (j.box[1] + j.box[3]) / 2, fx = (j.free[0] + j.free[2]) / 2, fy = (j.free[1] + j.free[3]) / 2, h = j.box[3] - j.box[1];
    const inside = j.box[0] > j.free[0] + 40 && j.box[2] < j.free[2] - 40 && j.box[1] > j.free[1] + 30 && j.box[3] < j.free[3] - 30;
    D.log('§FILM_VIEW i=' + i + ' joint=' + j.box.map(Math.round).join(',') + ' h=' + Math.round(h) + ' inside=' + inside + ' notches=' + notches + ' pans=' + pans);
    if (h >= 420 && inside) break;
    if (Math.hypot(cx - fx, cy - fy) > 60 || !inside) { await D.dragFromTo(cx, cy, fx, fy, { button: 3, dur: 0.8, label: 'pan (right-drag)' }); pans++; await D.sleep(600); }
    else { await D.moveTo(fx, fy); await D.wheel(false, h < 250 ? 3 : 1); notches += h < 250 ? 3 : 1; await D.sleep(700); }
    j = await joint();
  }
  D.fastEnd(); const h = j.box[3] - j.box[1]; D.check(h >= 420, 'b07_zoomed_to_joint', 'joint box h=' + Math.round(h) + ' px after notches=' + notches + ' pans=' + pans);
  D.cue('p7_drag'); await D.sleep(1200); await D.dragFromTo(j.a[0], j.a[1], j.b[0], j.b[1], { dur: 1.6, label: 'the exclude box round the joint' }); await dm.idle();
  const ex = await D.page.evaluate(() => { const s = window.DxfMetaEditor.state.sheets.find(q => q.name === '3_BEAM_LAYOUT.dxf'); return s.marks.filter(q => q.key === 'EXCLUDE').map(q => q.value); });
  const v = ex.length === 1 ? ex[0].split(',').map(Number) : [], inTol = v.length === 4 && v[0] > EX_TOL.x0[0] && v[0] < EX_TOL.x0[1] && v[2] > EX_TOL.x1[0] && v[2] < EX_TOL.x1[1] && v[1] < EX_TOL.y0max && v[3] > EX_TOL.y1min;
  const rowT = await D.page.evaluate(() => (document.getElementById('dm-body').innerText.match(/3_BEAM_LAYOUT[^\n]*@EXCLUDE=[^\n]*/) || [''])[0]);
  D.check(inTol, 'b07_one_exclude_inside_tolerance', JSON.stringify(ex) + ' row=' + JSON.stringify(rowT));   // guide B0.7 + W-UAT-B0 R2 tolerance (§5.84)
  D.cue('p7_box'); await D.sleep(2500);
  await D.scrollIn(tool, BODY); await D.aim(tool, { label: 'Drag a box (leave the tool)' }); await D.click({ label: 'Drag a box' }); await dm.idle();
  const off = await D.page.evaluate(() => window.DxfMetaEditor.state.tool); D.check(!off, 'b07_tool_left', String(off));
  D.cue('p7_end');
};
// the saved copies against the pack's answer key, mark for mark (W-UAT-B0 R2's own rule: text + position; @EXCLUDE by the tolerance; @BODYZ over the set)
const marksSame = (dirA, dirB) => { const MOD2 = '/home/red1/bim-ootb/modeller', DxfParser = require(MOD2 + '/lib/dxf-parser.js'), MK = require(MOD2 + '/dxf2bim/dxf2marks.js');
  const marksOf = f => MK.readMarks(new DxfParser().parseSync(fs.readFileSync(f, 'utf8')).entities).map(m => ({ t: m.raw.replace(/\s+@BY=\S+$/, ''), x: Number(m.x.toFixed(2)), y: Number(m.y.toFixed(2)) }));
  const key = m => m.t + ' @' + m.x + ',' + m.y, diffs = [], bzA = [], bzB = [], ex = []; let n = 0;
  fs.readdirSync(dirB).filter(f => /_marked\.dxf$/.test(f)).forEach(f => { const pa = path.join(dirA, f); if (!fs.existsSync(pa)) { diffs.push(f + ' not saved'); return; } n++;
    const a = marksOf(pa), b = marksOf(path.join(dirB, f)), skip = m => /^@(EXCLUDE|BODYZ)=/.test(m.t), ka = a.filter(m => !skip(m)).map(key), kb = b.filter(m => !skip(m)).map(key);
    ka.filter(x => !kb.includes(x)).forEach(x => diffs.push(f + ' extra ' + x)); kb.filter(x => !ka.includes(x)).forEach(x => diffs.push(f + ' missing ' + x));
    bzA.push(...a.filter(m => /^@BODYZ=/.test(m.t)).map(m => m.t)); bzB.push(...b.filter(m => /^@BODYZ=/.test(m.t)).map(m => m.t)); ex.push(...a.filter(m => /^@EXCLUDE=/.test(m.t)).map(m => m.t)); });
  if (JSON.stringify(bzA.sort()) !== JSON.stringify(bzB.sort())) diffs.push('@BODYZ over the set differs');
  return { n, diffs, ex }; };
S.p8 = async () => {   // B0.8 + B0.9: read the badge (Qualifies, 0 yellow); Save marked copies -> nine ..._marked.dxf in Downloads
  D.cue('p8_start'); const chip = await dm.chip(), n0 = await dm.yellow();
  await D.aim('#dm-chip', { label: 'the badge: ' + chip }); D.cue('p8_badge', { chip }); await D.sleep(2000);
  D.check(chip === 'Qualifies' && n0 === 0, 'b08_qualifies_0_yellow', JSON.stringify(chip) + ' yellow=' + n0);   // guide B0.8
  await D.aim('#dm-save', { label: 'Save marked copies' }); D.cue('p8_save'); await D.click({ label: 'Save marked copies' });
  // Chrome may ask once whether the site may download several files (§5.2 scene 6: filmed only if it shows): its Allow is read on the screen
  const nM = () => fs.readdirSync(D.dlDir()).filter(f => /_marked\.dxf$/.test(f) && !/crdownload/.test(f)).length; let asked = false;
  for (let i = 0; i < 60 && nM() < 9; i++) {
    if (!asked && i >= 4) { const al = await D.findText(t => t === 'Allow', D.screenBox(0, 60, 1000, 400, 'Chrome download prompt'), 1, true);
      if (al) { asked = true; D.log('§FILM_NOTE Chrome asked to download multiple files'); D.cue('p8_allow'); await D.aim(D.screenBox(al.x - 20, al.y - 10, al.w + 40, al.h + 20, 'Allow'), { label: 'Allow (Chrome: download multiple files)' }); await D.click({ label: 'Allow' }); } }
    await D.sleep(500); }
  if (!asked) D.log('§FILM_NOTE Chrome did not ask about multiple downloads');
  const names = fs.readdirSync(D.dlDir()).filter(f => /_marked\.dxf$/.test(f)).sort(); D.check(names.length === 9, 'b09_nine_marked_landed', names.join(','));   // guide B0.9
  const note = await D.page.$eval('#dm-note', e => e.innerText).catch(() => ''); D.check(/^Downloaded: /.test(note), 'b09_panel_says_downloaded', JSON.stringify(note.slice(0, 120)));
  const cmp = marksSame(D.dlDir(), path.join(D.dlDir(), PACK, 'marked')); D.check(cmp.n === 9 && cmp.diffs.length === 0, 'b09_marks_equal_answer_key', 'files=' + cmp.n + ' diffs=' + JSON.stringify(cmp.diffs.slice(0, 6)) + ' exclude=' + JSON.stringify(cmp.ex));
  D.cue('p8_saved'); await D.sleep(3000); D.cue('p8_end');
};
// the nine saved copies in the OS file window: click the first, Shift+click the last (p9 and the Run Checker's box 2)
const pickNine = async (R) => {
    // the first row is often misread (take t1g: '0.FAQOR PLAN. marked. dxt'): try it quietly, else place it one row above 1N_ELEV_NORTH (row height from 1N -> 1S, both read at conf >= 90)
    let f0 = await D.findText(t => /^0_FLOOR_PLAN_marked/.test(t), R, 2, true);
    if (!f0) { const a = await D.findText(t => /^1N_ELEV_NORTH_marked/.test(t), R, 3), b = a && await D.findText(t => /ELEV_SOUTH_marked/.test(t), R, 3); if (!a || !b) return false;
      f0 = { x: a.x, y: a.y - (b.y - a.y), w: a.w, h: a.h }; D.check(b.y - a.y > 10 && b.y - a.y < 60, 'first_row_derived', 'row=' + (b.y - a.y) + ' px above 1N_ELEV_NORTH y=' + a.y); D.log('§FILM_OCR_DERIVED 0_FLOOR_PLAN_marked.dxf at=' + [f0.x, f0.y, f0.w, f0.h].join(',')); }
    await D.aim(D.screenBox(f0.x - 40, f0.y - 4, f0.w + 50, f0.h + 8, '0_FLOOR_PLAN_marked.dxf'), { label: '0_FLOOR_PLAN_marked.dxf' }); await D.click({ label: 'the first copy' });
    const f8 = await D.findText(t => /SECTION_AA_TRUSS_marked/.test(t), R); if (!f8) return false;   // read as two words '8' + 'SECTION_AA_TRUSS_marked.dxf' (t1g)
    await D.aim(D.screenBox(f8.x - 40, f8.y - 4, f8.w + 50, f8.h + 8, '8_SECTION_AA_TRUSS_marked.dxf'), { label: '8_SECTION_AA_TRUSS_marked.dxf' });
    D.X('keydown', 'shift'); D.log('§FILM_KEY shift down (select the range)'); await D.click({ label: 'Shift+click the last copy' }); D.X('keyup', 'shift'); D.log('§FILM_KEY shift up'); await D.sleep(900); };
S.p9 = async () => {   // B2.1 + B2.3: reload; the nine SAVED copies (click the first, Shift+click the last: Downloads also holds the zip and its folder); Arrange
  D.cue('p9_start'); await D.key('F5', 'reload the page'); D.fastStart('the Modeller reloads'); await D.sleep(1500); await MOD.ready(); await D.sleep(1500); D.fastEnd();
  await D.aimClick('#b-open', { label: 'Open' }); await D.sleep(600);
  await D.aim('#m-open-panel .mo-row[data-key="__dxf"]', { label: 'Open 2D drawings (.dxf)…' }); D.cue('p9_row'); await D.click({ label: 'Open 2D drawings (.dxf)…' });
  const ok = await D.pick(['Downloads'], pickNine, 'the nine saved copies');
  if (!ok) return;
  D.fastStart('the sheets are read'); await D.page.waitForFunction(n => window.DxfMetaEditor && window.DxfMetaEditor.state.sheets.length === n && !window.DxfMetaEditor.state.busy && window.DxfMetaEditor.state.verdict, 9, { timeout: 300000, polling: 300 }); await D.sleep(1500); D.fastEnd();
  const names = await D.page.evaluate(() => window.DxfMetaEditor.state.sheets.map(s => s.name).sort());
  const title = await D.page.$eval('#dxf-panel .ip-title', e => e.innerText.replace(/\s+/g, ' ').trim()).catch(() => ''), chip = await dm.chip();
  D.check(/9 SHEETS/.test(title) && names.every(n => /_marked\.dxf$/.test(n)), 'b21_nine_saved_copies_open', JSON.stringify(title) + ' ' + names.length + ' _marked');   // guide B2.1
  D.check(chip === 'Qualifies', 'b22_badge_qualifies', JSON.stringify(chip));   // guide B2.2
  D.cue('p9_loaded'); await D.sleep(2500);
  await D.aim('#dxf-arrange', { label: 'Arrange' }); D.cue('p9_arrange'); await D.click({ label: 'Arrange' });
  let first = '', last = '', seen = 0; const t0 = D.now();
  for (let i = 0; i < 1200; i++) { const s = await D.page.$eval('#dxf-status', e => e.innerText).catch(() => ''), m = /Step (\d+)\/(\d+)/.exec(s);
    if (m) { if (!first) first = m[0]; if (m[0] !== last) { last = m[0]; seen++; } if (m[1] === m[2]) break; } await D.sleep(100); }
  D.log('§FILM_ARRANGE first="' + first + '" last="' + last + '" distinct=' + seen + ' sec=' + (D.now() - t0).toFixed(1));
  D.check(last === 'Step 46/46', 'b23_arrange_counts_to_46', 'first=' + first + ' last=' + last + ' distinct=' + seen);   // guide B2.3: 'Step 1/46 … Step 46/46'
  D.cue('p9_arranged'); await D.sleep(4000); D.cue('p9_end');
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
