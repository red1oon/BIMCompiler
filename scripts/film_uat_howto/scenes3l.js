// ⚠ DO NOT REMOVE — film "UAT, hands on" PART III, B4 to a LEGACY iDempiere (prompts/FILM_UAT_GUIDE.md §5.18 L4). READ THE LOG (§FILM_*).
// The same B4 as r1-r3, but the Viewer is opened FROM the iDempiere (/bimootb, the BIM OOTB plugin, prepL.sh): its › ERP pushes to that iDempiere (same origin: the browser
// refuses the call from any other site, measured §5.18 L1), the password is asked in the Viewer's own window, and open ↗ is that iDempiere's Project (bim-ootb #3383).
// Every expected value is the guide's Confirm text or the push's own § line; table reads are declared B:READ.
'use strict';
module.exports = (S, PREP, D, H) => {
  const fs = require('fs'), path = require('path'), { OMNIBOX } = H;
  const LURL = 'localhost:8108/bimootb/viewer/viewer.html?blank=1&erpUser=GardenAdmin&erpClient=11&erpRole=102&erpOrg=11&erpWarehouse=103';
  const until = async (fn, ms, arg) => { for (let i = 0; i < (ms || 30000) / 250; i++) { const v = await D.page.evaluate(fn, arg).catch(() => null); if (v) return v; await D.sleep(250); } return null; };
  const status = () => D.page.evaluate(() => { const s = document.getElementById('status'); return s ? s.textContent : ''; });
  const AREA = D.screenBox(760, 560, 400, 240, 'the model area');
  H.LURL = LURL;

  // ---------------- l0: the Viewer opened from the iDempiere, then the Shed's .db (as B2.9)
  PREP.l0 = async () => {   // not filmed: one tab, the Shed's .db in Downloads (as r0)
    await H.oneTab(); const src = process.env.SHED_DB; if (!src || !fs.existsSync(src)) throw new Error('SHED_DB not set (the pack reference/SHED_extracted.db)');
    fs.copyFileSync(src, path.join(D.dlDir(), 'SHED_extracted.db')); D.log('§FILM_PREP l0 SHED_extracted.db bytes=' + fs.statSync(src).size);
  };
  S.l0 = async () => {
    D.cue('l0_start'); await D.aimClick(OMNIBOX, { label: 'the address bar' }); await D.key('ctrl+a', 'select what is in the bar'); D.cue('l0_url'); await D.type(LURL); await D.key('Return', 'open the Viewer from iDempiere');
    D.fastStart('the Viewer loads'); await D.waitUrl(/8108\/bimootb\/viewer\/viewer\.html/, 90000);
    await D.page.waitForFunction('window.APP && typeof window.APP.openModelDb === "function"', null, { timeout: 240000 }); await D.sleep(2500); D.fastEnd();
    const tgt = await D.page.evaluate(() => window.APP && window.APP.LEGACY_ERP ? JSON.stringify(window.APP.LEGACY_ERP) : null);   // B:READ (declared): the Viewer's own push target
    D.check(/"via":"served"/.test(tgt || '') && /8108/.test(tgt || ''), 'bl_viewer_served_by_idempiere', tgt);
    D.cue('l0_viewer'); await D.aimClick(AREA, { label: 'the model area (focus)' }); await D.sleep(500);
    D.cue('l0_ctrlo'); await D.key('ctrl+o', 'Open Building');
    const ok = await D.pick(['Downloads'], async (R) => { const f = await D.findText(t => /extracted\.db$/.test(t), R); if (!f) return false; await D.aim(D.screenBox(f.x - 60, f.y - 4, f.w + 70, f.h + 8, 'SHED_extracted.db'), { label: 'SHED_extracted.db' }); await D.click({ label: 'SHED_extracted.db' }); await D.sleep(700); }, 'the Viewer database');
    if (!ok) return;
    D.fastStart('the building opens'); let st = '';
    for (let i = 0; i < 360 && !/DONE/.test(st); i++) { st = await status(); if (!/DONE/.test(st)) await D.sleep(500); }
    D.fastEnd(); D.check(/DONE — SHED 511 elements/.test(st), 'bl_viewer_done_511', JSON.stringify(st.slice(0, 120)));   // guide B2.9: 'DONE — SHED 511 elements'
    D.cue('l0_done', { status: st.slice(0, 120) }); await D.sleep(2000); D.cue('l0_end');
  };

  // ---------------- l1: B4.1 the same Find steps as r1
  S.l1 = async () => { await S.r1(); };

  // ---------------- l2: B4.2 › ERP: the local Project Order, then the Viewer's own sign-in window for the iDempiere, the password, Push -> the status line names the iDempiere project
  S.l2 = async () => {
    const sel = await D.page.evaluate(() => ((document.getElementById('find-selected') || {}).innerText || '').replace(/\s+/g, ' '));   // B4.1's own figure: the group's USD amount, as the panel shows it
    const g = /USD\s*([\d,]+(?:\.\d+)?)/.exec(sel); H.lgroup = g ? Number(g[1].replace(/,/g, '')) : null; D.log('§FILM_NOTE l2 the group: ' + JSON.stringify(sel.slice(0, 120)) + ' usd=' + H.lgroup);
    D.cue('l2_start'); await D.aim('#find-erp-btn', { label: '› ERP' }); D.cue('l2_push'); await D.click({ label: '› ERP' });
    const form = await until(() => { const f = [...document.querySelectorAll('form')].find(x => /Sign in to iDempiere/.test(x.innerText)); return f ? f.innerText.replace(/\s+/g, ' ').slice(0, 200) : null; }, 90000);
    D.check(!!form && /8108/.test(form), 'bl_signin_window_names_the_idempiere', JSON.stringify(form));
    const pre = await D.page.evaluate(() => [...document.querySelectorAll('form input[type=text]')].map(i => i.value + (i.readOnly ? '(ro)' : '')).join('|'));   // B:READ (declared): the prefilled context
    D.check(pre === 'GardenAdmin(ro)|11(ro)|102(ro)|11(ro)|103(ro)', 'bl_signin_prefilled_readonly', pre);
    D.cue('l2_signin'); await D.aimClick('form input[type=password]', { label: 'Password' }); await D.type('GardenAdmin');
    await D.aim(D.page.locator('form button[type=submit]', { hasText: 'Push' }).first(), { label: 'Push' }); D.cue('l2_pushpw'); await D.click({ label: 'Push' });
    // a password typed in a page brings Chrome's own windows, as at the iDempiere log in (change list item 7, §5.16 find 5): the breach warning's OK, then 'Save password?' No thanks
    await D.sleep(2500); await H.chromePwWarn('after the Viewer sign-in'); await H.savePw('l2');
    D.fastStart('the Project Order goes to iDempiere'); let st = '';
    for (let i = 0; i < 600 && !/iDempiere Project #\d+|failed/.test(st); i++) { st = await status(); if (!/iDempiere Project #\d+|failed/.test(st)) await D.sleep(200); }
    D.fastEnd(); const m = /iDempiere Project #(\d+) · created (\{.*\})/.exec(st);
    D.check(!!m, 'bl_pushed_to_idempiere', JSON.stringify(st.slice(0, 200)));
    if (m) { const cr = JSON.parse(m[2]); D.check(cr.projects === 1 && cr.lines >= 1, 'bl_created_one_project_with_its_line', m[2]); D.log('§FILM_STATE legacy.project=' + m[1]); }
    const href = await D.page.evaluate(() => { const a = document.getElementById('find-erp-open'); return a ? a.getAttribute('href') : null; });   // B:READ (declared): where open ↗ goes
    D.check(!!m && href === 'http://localhost:8108/webui/index.zul?Action=Zoom&TableName=C_Project&Record_ID=' + m[1], 'bl_open_link_is_the_idempiere_project', href);
    D.cue('l2_end', { status: st.slice(0, 160) }); await D.sleep(3000);
  };

  // ---------------- l3: open ↗ -> that iDempiere's log in -> the Project window on SHED
  S.l3 = async () => {
    D.cue('l3_start'); const before = D.pages().length; await D.aim('#find-erp-open', { label: 'open ↗' }); await D.click({ label: 'open ↗' });
    for (let i = 0; i < 80 && D.pages().length === before; i++) await D.sleep(250);
    D.fastStart('iDempiere opens'); const ok = await D.waitUrl(/8108\/webui/, 60000); if (!ok) { D.fastEnd(); return; }
    await D.page.waitForFunction(() => document.querySelectorAll('input.z-textbox').length >= 2, null, { timeout: 90000 }); D.fastEnd(); await D.sleep(1200);
    D.cue('l3_login'); await H.loginForm('l3');
    D.fastStart('the Project window opens');
    const v = await until(() => { const e = [...document.querySelectorAll('[instancename]')].find(x => /^C_Project\d*Value$/.test(x.getAttribute('instancename')) && x.getBoundingClientRect().width > 0); const i = e && (e.matches('input') ? e : e.querySelector('input')); return i && i.value ? i.value : null; }, 120000);
    D.fastEnd();
    const pa = await D.page.evaluate(() => { const e = [...document.querySelectorAll('[instancename]')].find(x => /^C_Project\d*PlannedAmt$/.test(x.getAttribute('instancename')) && x.getBoundingClientRect().width > 0); const i = e && (e.matches('input') ? e : e.querySelector('input')); return i ? i.value : null; });
    const nm = await D.page.evaluate(() => { const e = [...document.querySelectorAll('[instancename]')].find(x => /^C_Project\d*Name$/.test(x.getAttribute('instancename')) && x.getBoundingClientRect().width > 0); const i = e && (e.matches('input') ? e : e.querySelector('input')); return i ? i.value : null; });
    D.check(v === 'SHED' && /SHED/.test(nm || ''), 'bl_idempiere_project_shed', JSON.stringify({ value: v, name: nm }));   // the note: the project SHED in your iDempiere's Project window
    D.check(!!pa && H.lgroup != null && Math.abs(Number(String(pa).replace(/,/g, '')) - Math.round(H.lgroup * 100) / 100) < 0.005, 'bl_idempiere_planned_amount_is_the_group', JSON.stringify(pa) + ' group USD ' + H.lgroup);   // as B4.4: the planned amount of the group you clicked
    D.cue('l3_project', { value: v, planned: pa }); await D.sleep(4000); D.cue('l3_end');
  };
};
