// ⚠ DO NOT REMOVE — film "UAT, hands on" PART III (prompts/FILM_UAT_GUIDE.md §5.16): B4, chapter C (every document by hand), chapter D. READ THE LOG (§FILM_*).
// Plugged into scenes.js's runner (same S / PREP maps, same driver). Selectors for B4 are the UAT Dry Run's (instruments/V.js); every expected value is the guide's Confirm text.
'use strict';
module.exports = (S, PREP, D, H) => {
  const fs = require('fs'), path = require('path');
  const { GUIDE, BACK, OMNIBOX } = H;
  const until = async (fn, ms, arg) => { for (let i = 0; i < (ms || 30000) / 250; i++) { const v = await D.page.evaluate(fn, arg).catch(() => null); if (v) return v; await D.sleep(250); } return null; };

  // ---------------- r0: B2.9 again (sped, Part I/II teach it): the Viewer with the Shed's .db
  PREP.r0 = async () => {   // not filmed: the reference pack's SHED_extracted.db (= the tester's export, 1,257,472 B, Parts I and II) in Downloads; the guide open
    await H.oneTab(); const src = process.env.SHED_DB; if (!src || !fs.existsSync(src)) throw new Error('SHED_DB not set (the pack reference/SHED_extracted.db)');
    fs.copyFileSync(src, path.join(D.dlDir(), 'SHED_extracted.db')); D.log('§FILM_PREP r0 SHED_extracted.db bytes=' + fs.statSync(src).size);
    await D.page.goto(GUIDE); await D.page.waitForLoadState('load'); await D.sleep(1500);
  };
  S.r0 = async () => { await S.s8(); };

  // ---------------- r1: B4.1 the Find panel, one group of parts (a column type): its cost and the › ERP button
  const AREA = D.screenBox(760, 560, 400, 240, 'the model area');
  S.r1 = async () => {
    D.cue('r1_start'); await D.aimClick(AREA, { label: 'the model area (focus)' }); await D.sleep(400); await D.key('f', 'the Find panel');
    await until(() => { const p = document.getElementById('find-panel'); return !!(p && p.getBoundingClientRect().width > 0); }, 15000);
    await D.aimClick('#find-name', { label: 'the Find box' }); await D.key('ctrl+a', 'select what is there'); D.cue('r1_type'); await D.type('column'); await D.key('Return', 'find');
    const n = await until(() => document.querySelectorAll('.find-result-item').length, 20000); D.check(n > 0, 'b41_groups_listed', 'groups=' + n);
    const it = D.page.locator('.find-result-item').first(); await D.aim(it, { label: 'the first column group' }); D.cue('r1_group'); await D.click({ label: 'a group of parts' });
    const ok = await until(() => { const b = document.getElementById('find-erp-btn'), t = (document.getElementById('find-selected') || {}).innerText || ''; return b && b.getBoundingClientRect().width > 0 && /USD\s*[\d,.]+/.test(t) ? t.replace(/\s+/g, ' ').trim() : null; }, 20000);
    D.check(!!ok, 'b41_group_cost_and_erp_button', JSON.stringify((ok || '').slice(0, 120)));   // guide B4.1: 'The panel shows the group's cost and the button › ERP'
    D.cue('r1_end', { selected: (ok || '').slice(0, 120) }); await D.sleep(2500);
  };
  // ---------------- r2: B4.2 + B4.3 › ERP twice
  const status = () => D.page.evaluate(() => { const s = document.getElementById('status'); return s ? s.textContent : ''; });
  const pushRead = async (rx, ms) => { let st = ''; for (let i = 0; i < (ms || 60000) / 150; i++) { st = await status(); if (rx.test(st)) return st; await D.sleep(150); } return st; };
  S.r2 = async () => {
    D.cue('r2_start'); await D.aim('#find-erp-btn', { label: '› ERP' }); D.cue('r2_push'); await D.click({ label: '› ERP' });
    const st1 = await pushRead(/Project Order: \d+ lines/); D.check(/Project Order: 1 lines · contract .*\(saved\)/.test(st1), 'b42_one_line_saved', JSON.stringify(st1.slice(0, 140)));   // guide B4.2
    const link = await until(() => { const a = document.getElementById('find-erp-open'); return a && getComputedStyle(a).display !== 'none' && a.getBoundingClientRect().width > 0 ? a.innerText.trim() : null; }, 20000);
    D.check(/open/.test(link || ''), 'b42_open_link_shown', JSON.stringify(link)); D.cue('r2_saved', { status: st1.slice(0, 140) }); await D.sleep(3000);
    await D.aim('#find-erp-btn', { label: '› ERP (again)' }); D.cue('r2_again'); await D.click({ label: '› ERP again' });
    const st2 = await pushRead(/Project Order: 0 lines/, 40000); D.check(/Project Order: 0 lines/.test(st2), 'b43_zero_lines_keyed_by_name', JSON.stringify(st2.slice(0, 140)));   // guide B4.3
    D.cue('r2_end', { status: st2.slice(0, 140) }); await D.sleep(3000);
  };
  // ---------------- r3: B4.4 open ↗ -> the Kernel ERP sign-in -> GardenAdmin -> Log In -> the project SHED and its tabs
  const tabRows = n => D.page.evaluate(n => { const bt = document.body.innerText.replace(/\s+/g, ' '); if (bt.indexOf(n + ' · 0 records') >= 0) return 0; const g = [...document.querySelectorAll('table.idmp-grid tr[data-i]')].filter(e => e.getBoundingClientRect().width > 0).length; return g || ([...document.querySelectorAll('input')].some(e => e.getBoundingClientRect().width > 0) ? 1 : 0); }, n);
  const amt = () => D.page.evaluate(() => [...document.querySelectorAll('input')].filter(e => e.getBoundingClientRect().width > 0 && (e.getAttribute('data-col') || e.name) === 'plannedamt').map(e => e.value)[0] || '');
  const clickTab = async name => { const t = D.page.locator('.idmp-adtab', { hasText: new RegExp('^\\s*' + name + '\\s*$') }).first(); await D.aimClick(t, { label: 'tab ' + name }); await until(n => [...document.querySelectorAll('.idmp-adtab.active')].some(e => e.innerText.trim() === n), 20000, name); await D.sleep(1800); };
  S.r3 = async () => {
    D.cue('r3_start'); const before = D.pages().length; await D.aim('#find-erp-open', { label: 'open ↗' }); await D.click({ label: 'open ↗' });
    for (let i = 0; i < 80 && D.pages().length === before; i++) await D.sleep(250);
    D.fastStart('the Kernel ERP loads'); const ok = await D.waitUrl(/erp\//, 60000); if (!ok) { D.fastEnd(); return; }
    const users = await until(() => document.querySelectorAll('.idmp-login-user').length, 120000); D.fastEnd(); D.check(users >= 2, 'b44_signin_lists_users', 'entries=' + users); D.cue('r3_signin'); await D.sleep(1500);
    await D.aimClick(D.page.locator('.idmp-login-user', { hasText: 'GardenAdmin' }).first(), { label: 'GardenAdmin' }); await D.sleep(800);
    await D.aim('.idmp-login-actions button.primary', { label: 'Log In' }); D.cue('r3_login'); await D.click({ label: 'Log In' });
    D.fastStart('the project window opens'); await until(() => document.querySelectorAll('.idmp-adtab').length > 0 && [...document.querySelectorAll('input')].some(e => (e.getAttribute('data-col') || e.name) === 'value' && e.value), 120000); D.fastEnd();
    const f = await D.page.evaluate(() => { const o = {}; document.querySelectorAll('input').forEach(e => { const k = e.getAttribute('data-col') || e.name; if (k && e.getBoundingClientRect().width > 0) o[k] = e.value; }); return o; });
    D.check(f.value === 'SHED' && /BIM: SHED/.test(f.name || ''), 'b44_project_shed', JSON.stringify({ value: f.value, name: f.name }));   // guide B4.4: 'the project SHED (BIM: SHED)'
    const pa = f.plannedamt || ''; D.check(/\d/.test(pa) && Number(String(pa).replace(/,/g, '')) > 0, 'b44_planned_amount', JSON.stringify(pa)); D.cue('r3_project', { planned: pa }); await D.sleep(2500);
    const T = {};
    await clickTab('Project Line'); T.pl = await tabRows('Project Line');
    await clickTab('Phase'); T.ph = await tabRows('Phase'); await clickTab('Phase Line'); T.phl = await tabRows('Phase Line');
    await clickTab('Task'); T.tk = await tabRows('Task'); await clickTab('Task Line'); T.tkl = await tabRows('Task Line'); const la = await amt(); D.cue('r3_taskline', { amount: la });
    D.check(T.ph === 1 && T.tk === 1, 'b44_phase_and_task_one_record', JSON.stringify(T));
    D.check(T.tkl >= 1 && T.pl === 0 && T.phl === 0, 'b44_line_under_task_line_only', JSON.stringify(T));   // guide B4.4: Task Line holds it; Project Line and Phase Line read 0 records
    D.check(Number(String(la).replace(/,/g, '')) === Number(String(pa).replace(/,/g, '')), 'b44_task_line_same_planned_amount', 'task line ' + la + ' project ' + pa);
    await D.sleep(3000); D.cue('r3_end');
  };

  // ================= chapter C: the plan is the guide's own table (docs/CapexUATGuide.md, chapter C), parsed here, never retyped
  const MD = fs.readFileSync(path.join(__dirname, '..', '..', 'docs', 'CapexUATGuide.md'), 'utf8');
  const sec = MD.slice(MD.indexOf('## C · ERP'), MD.indexOf('### C1 ·'));
  const doc = t => { const m = /([\d,]+)\s+(M3|KG|M2)\s+(PWD-[\d.]+)/.exec(t || ''); return m ? { qty: m[1].replace(/,/g, ''), uom: m[2], product: m[3] } : null; };
  const PLAN = sec.split('\n').filter(l => /^\| TD_/.test(l)).map(l => { const c = l.split('|').map(x => x.trim());   // | Project | Name | Phases | Purchase orders | How far | Issue |
    const po = c[4] || ''; return { project: c[1], name: c[2], co: doc((/complete:\s*([^;]+)/.exec(po) || [])[1]), dr: doc((/leave in Draft:\s*([^;]+)/.exec(po) || [])[1]), far: c[5], issue: doc(c[6]) }; });
  const PROD = {}; sec.split('\n').filter(l => /^\| PWD-/.test(l)).forEach(l => { const c = l.split('|').map(x => x.trim()); PROD[c[1]] = { name: c[2], uom: c[3], cost: c[4] }; });
  H.PLAN = PLAN; H.PROD = PROD;

  // ZK (iDempiere) by what a person sees: a field is found by its column (iDempiere's own test attribute instancename="<Table><tab index><Column>"), a button by its tooltip
  // a ZK form scrolls inside its own panel (the order header: 513 px shown of 805, measured 2026-11-20): before the pointer goes to a field, the wheel over that panel brings it
  // fully into view, as a person scrolls (never a script scroll). The panel is the field's nearest scrolling ancestor.
  const reveal = async (loc) => { for (let i = 0; i < 25; i++) {
      const r = await loc.evaluate(e => { const a = e.getBoundingClientRect(); let sc = e.parentElement; while (sc && !(sc.scrollHeight > sc.clientHeight + 4 && /(auto|scroll)/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement;
        if (!sc) return { ok: true }; const q = sc.getBoundingClientRect(); return { ok: a.top >= q.top + 2 && a.bottom <= q.bottom - 2, down: a.bottom > q.bottom - 2, cx: q.left + q.width / 2, cy: q.top + q.height / 2, edge: sc.scrollTop <= 0 && a.top < q.top || sc.scrollTop >= sc.scrollHeight - sc.clientHeight - 1 && a.bottom > q.bottom }; }).catch(() => ({ ok: true }));
      if (r.ok) return; if (r.edge) { D.log('§FILM_NOTE reveal: the panel is at its end, the field stays partly hidden'); return; }
      const o = await D.page.evaluate(() => ({ sy: screenY, oh: outerHeight, ih: innerHeight, sx: screenX })); const m = D.mouse(), px = o.sx + r.cx, py = o.sy + o.oh - o.ih + r.cy;
      if (Math.hypot(m.x - px, m.y - py) > 200) await D.moveTo(px, py); await D.wheel(r.down, 2); await D.sleep(350); } };
  const zAim = async (loc, opt) => { await reveal(loc); return D.aimClick(loc, opt); };
  const zk = {
    idle: async (ms) => { await D.sleep(ms || 400); for (let i = 0; i < 200; i++) { const busy = await D.page.evaluate(() => !!(window.zAu && zAu.processing && zAu.processing()) || !!document.querySelector('.z-loading-indicator, .z-apply-loading-indicator')).catch(() => false); if (!busy) break; await D.sleep(200); } await D.sleep(300); },
    f: inst => D.page.locator('[instancename="' + inst + '"]:visible').first(),
    input: inst => D.page.locator('[instancename="' + inst + '"]:visible input').first(),
    val: inst => D.page.evaluate(i => { const e = [...document.querySelectorAll('[instancename="' + i + '"]')].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const n = e.tagName === 'INPUT' ? e : e.querySelector('input,textarea'); return n ? (n.type === 'checkbox' ? n.checked : n.value) : e.innerText; }, inst),
    text: async (inst, t, label) => { await zAim(zk.input(inst), { label: label || inst }); await D.key('ctrl+a', 'select what is there'); await D.type(t); await D.key('Tab', 'next field'); await zk.idle(800); },
    // a list (combobox): its arrow, then the item with that text, both by pointer
    combo: async (inst, t, label) => { const box = typeof inst === 'string' ? D.page.locator('[instancename="' + inst + '"]:visible').first() : inst, rx = t instanceof RegExp ? t : new RegExp('^\\s*' + t.replace(/[.()*+?]/g, '\\$&') + '\\s*$');
      const cur = await box.locator('input').first().inputValue().catch(() => ''); if (rx.test(cur)) { D.log('§FILM_NOTE ' + (label || inst) + ' already reads ' + JSON.stringify(cur) + ' (the default)'); await reveal(box); await D.aim(box, { label: (label || inst) + ': ' + cur }); return true; }
      // the list's arrow, then the item; a long list (14 projects) is scrolled with the wheel over it until the item shows (typing into a ZK list field does not open it, and
      // iDempiere clears text that is not an item: measured 2026-11-20)
      zk._typed = null; await zAim(box.locator('.z-combobox-button').first(), { label: (label || inst) + ' (list)' });
      await zk.idle(600);
      let item = null; for (let i = 0; i < 32 && !item; i++) { const h = await D.page.evaluateHandle(rxs => { const r = new RegExp(rxs.s, rxs.f); return [...document.querySelectorAll('.z-combobox-popup .z-comboitem')].find(e => e.getBoundingClientRect().width > 0 && r.test(e.textContent.replace(/[\u00a0\s]+/g, ' '))) || null;   /* items carry non-breaking spaces (measured: 'AP Payment') */ }, { s: rx.source, f: rx.flags });
        item = await h.asElement(); if (!item) await D.sleep(250); }
      if (item) {
        // an item below the list's visible part (the list shows 200 px; TD_WAREHOUSE sat at 316 px, 2026-11-20): Down, as a keyboard user does, until the field shows it, then Enter
        const shown = await item.evaluate(e => { const p = e.closest('.z-combobox-popup'), a = e.getBoundingClientRect(), q = p.getBoundingClientRect(); return a.top >= q.top + 1 && a.bottom <= q.bottom - 1; });
        if (!shown) { let v = ''; for (let k = 0; k < 40 && !rx.test(v); k++) { await D.key('Down', 'next item'); await D.sleep(250); v = await box.locator('input').first().inputValue().catch(() => ''); }
          await D.key('Return', 'choose ' + v.slice(0, 30)); await zk.idle(800); const v2 = await box.locator('input').first().inputValue().catch(() => '');
          if (!rx.test(v2)) { D.check(false, 'zk_combo ' + (label || inst), 'value after Down/Enter ' + JSON.stringify(v2)); return false; } return true; }
        const bb = await item.boundingBox(), o = await D.page.evaluate(() => ({ sx: screenX, sy: screenY, oh: outerHeight, ih: innerHeight, ow: outerWidth, iw: innerWidth })), side = (o.ow - o.iw) / 2;
        await D.aimClick(D.screenBox(o.sx + side + bb.x, o.sy + o.oh - o.ih - side + bb.y, bb.width, bb.height, String(t)), { label: String(t) }); await zk.idle(800);
        const v = await box.locator('input').first().inputValue().catch(() => ''); if (!rx.test(v)) { D.check(false, 'zk_combo ' + (label || inst), 'value after the click ' + JSON.stringify(v)); return false; } return true; }
      if (!item) { D.log('§FILM_ZK_LISTS open=' + JSON.stringify(await D.page.evaluate(() => [...document.querySelectorAll('.z-combobox-popup')].filter(p => getComputedStyle(p).display !== 'none').map(p => [...p.querySelectorAll('.z-comboitem')].slice(0, 3).map(e => e.textContent).join('|') + ' n=' + p.querySelectorAll('.z-comboitem').length))) + ' value=' + JSON.stringify(await box.locator('input').first().inputValue().catch(() => '')));
        await D.key('Escape', 'close the list'); D.check(false, 'zk_combo ' + inst, 'no item "' + t + '"'); return false; }
      return false; },
    comboTyped: async (inst, prefix, rx, label) => { zk._typed = prefix; return zk.combo(inst, rx, label); },
    // a search field (a name or a key typed, then Tab: iDempiere looks it up; an Info window opens only when it is not unique)
    search: async (inst, t, label) => { await zAim(zk.input(inst), { label: label || inst }); await D.key('ctrl+a', 'select what is there'); await D.type(t); await D.key('Tab', 'look it up'); await zk.idle(1500);
      const info = await D.page.evaluate(() => [...document.querySelectorAll('.z-window')].some(w => w.getBoundingClientRect().width > 0 && /Info/.test((w.querySelector('.z-window-header') || {}).innerText || '')));
      if (!info) return true;
      // the typed text is not unique (an invoice number): iDempiere's Info window lists the matches; the row that carries the text is clicked, then OK
      D.log('§FILM_NOTE an Info window opened for ' + inst); const iw = D.page.locator('.z-window:visible').filter({ has: D.page.locator('.z-window-header', { hasText: 'Info' }) }).last();
      const rowI = iw.locator('.z-listitem:visible', { hasText: t }).first(); for (let i = 0; i < 12 && !(await rowI.count()); i++) await D.sleep(250);
      if (!(await rowI.count())) { const rq = iw.locator('button[title^="ReQuery"], button[title^="Refresh"]').first(); if (await rq.count()) { await zAim(rq, { label: 'ReQuery (Info)' }); await zk.idle(2500); } for (let i = 0; i < 16 && !(await rowI.count()); i++) await D.sleep(250); }
      if (!(await rowI.count())) {   // the BP Info of a sales-side window filters Vendor = No (measured by the statement log: bp.IsVendor = 'N'), which hides every vendor: set it to Yes
        const iv = iw.locator('[instancename="IsVendor"]').first();
        if (await iv.count() && (await iv.locator('input').inputValue().catch(() => '')) === 'No') { D.log('§FILM_FIND C3.2_info_vendor_no the Business Partner Info of the Payment window opens with Vendor = No; set to Yes to list the vendor');
          await zk.combo(iv, 'Yes', 'Vendor (Info)'); const rq3 = iw.locator('button[title^="ReQuery"], button[title^="Refresh"]').first(); if (await rq3.count()) { await zAim(rq3, { label: 'ReQuery (Info)' }); await zk.idle(2500); } for (let i = 0; i < 16 && !(await rowI.count()); i++) await D.sleep(250); } }
      if (!(await rowI.count())) {   // the Payment window is a sales-side window: its Invoice Info opens with 'Sales Transaction' ticked, which hides a vendor invoice (measured 2026-11-20)
        const so = iw.locator('.z-checkbox:visible', { hasText: 'Sales Transaction' }).first();
        if (await so.count() && await so.locator('input').isChecked().catch(() => false)) { D.log('§FILM_FIND C3.2_info_sales_transaction the Invoice Info opens with Sales Transaction ticked; unticked to list the vendor invoice');
          await zAim(so.locator('input, label').first(), { label: 'untick Sales Transaction' }); await zk.idle(800); const rq2 = iw.locator('button[title^="ReQuery"], button[title^="Refresh"]').first(); if (await rq2.count()) { await zAim(rq2, { label: 'ReQuery (Info)' }); await zk.idle(2500); } for (let i = 0; i < 16 && !(await rowI.count()); i++) await D.sleep(250); } }
      if (!(await rowI.count())) { D.check(false, 'zk_info_row ' + inst, 'no row with ' + t); return false; }
      await zAim(rowI, { label: t + ' (Info row)' }); await zk.idle(600); await zAim(iw.locator('button.btn-ok').first(), { label: 'OK (Info)' }); await zk.idle(1500); return true; },
    btn: (title) => D.page.locator('a.toolbar-button[title^="' + title + '"]:visible').first(),
    tool: async (title, label) => { await zAim(zk.btn(title), { label: label || title }); await zk.idle(1500); },
    tab: async (name) => { await zAim(D.page.locator('li.z-tab:visible', { hasText: new RegExp('^\\s*' + name + '\\s*$') }).first(), { label: 'tab ' + name }); await zk.idle(1500); },
    msg: () => D.page.evaluate(() => [...document.querySelectorAll('.z-notification, .z-window .z-label, .adwindow-status, .z-messagebox')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()).join(' | ').slice(0, 300)),
    body: () => D.page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')),
    open: async (name) => { const sb = 'input.z-bandbox-input[placeholder="Alt+G"]'; await D.aimClick(D.page.locator(sb + ':visible').first(), { label: 'the search box' }); await D.key('ctrl+a', 'select what is there'); await D.type(name); await D.sleep(2500);
      const item = D.page.locator('.z-listitem:visible', { hasText: new RegExp('^\\s*' + name.replace(/[()]/g, '\\$&') + '\\s*$') }).first(); D.check(await item.count() === 1, 'search_lists ' + name);
      await D.aimClick(item, { label: name + ' (search result)' }); await zk.idle(3000); },
  };
  // the field of <Table>.<Column> on screen now (iDempiere numbers the window in the attribute: <Table><windowNo><Column>)
  zk.inst = async (table, col) => { const i = await D.page.evaluate(([t, c]) => { const e = [...document.querySelectorAll('[instancename]')].find(x => x.getBoundingClientRect().width > 0 && new RegExp('^' + t + '\\d+' + c + '$').test(x.getAttribute('instancename'))); return e ? e.getAttribute('instancename') : null; }, [table, col]); if (!i) throw new Error('no field ' + table + '.' + col + ' on screen'); return i; };
  zk.saved = async (what) => { await zk.tool('Save Changes', 'Save'); const t = await zk.body(); const ok = /Record saved|Saved/.test(t) && !/Error|mandatory|Fill mandatory/i.test(await zk.msg()); D.check(ok, 'saved ' + what, JSON.stringify((await zk.msg()).slice(0, 160))); return ok; };
  zk.docAction = async (action, label) => {   // Document Action -> its list: the action -> OK (C1.2, C2.1, C3.1, C3.2)
    await zAim(D.page.locator('button.form-button:visible', { hasText: 'Document Action' }).first(), { label: 'Document Action' }); await zk.idle(1500);
    const dlg = D.page.locator('.z-window:visible', { hasText: 'Document Action' }).last(); const cb = dlg.locator('.z-combobox').first();
    if (await cb.count()) { const cur = await cb.locator('input').inputValue().catch(() => ''); if (cur !== action) { await D.aimClick(cb.locator('.z-combobox-button'), { label: 'the action list' }); await zk.idle(600); await D.aimClick(D.page.locator('.z-combobox-popup:visible .z-comboitem', { hasText: new RegExp('^\\s*' + action + '\\s*$') }).first(), { label: action }); await zk.idle(600); } }
    await D.aimClick(dlg.locator('button.btn-ok').first(), { label: 'OK (' + (label || action) + ')' }); await zk.idle(4000); };
  zk.status = async table => zk.val(await zk.inst(table, 'DocStatus'));
  // a Locator field is read-only with a button: its Locator dialog's first list holds the locators (measured: Fertilizer ... Default HQ Locator ...), then OK
  zk.locator = async (inst, name) => { await zAim(D.page.locator('[instancename="' + inst + '"]:visible button').first(), { label: 'Locator (its button)' }); await zk.idle(2000);
    const w = D.page.locator('.z-window:visible', { hasText: 'Create New Record' }).last(); if (!(await zk.combo(w.locator('.z-combobox').first(), name, 'Locator (list)'))) return false;
    await zAim(w.locator('button.img-btn[title^="OK"]').first(), { label: 'OK (Locator)' }); await zk.idle(1500); const v = await zk.val(inst); return D.check(v === name, 'locator_set ' + inst, JSON.stringify(v)); };
  zk.parent = async (name) => { await D.aimClick(D.page.locator('.adwindow-breadcrumb a:visible', { hasText: new RegExp('^\\s*' + name + '\\s*$') }).first(), { label: name + ' (breadcrumb)' }); await zk.idle(1500); };
  // B:READ, declared: the price list's own precision, the rule iDempiere's order window applies to a line price (measured 2026-11-20: Purchase PricePrecision=2, 68.1167 -> 68.12)
  const sql = q => require('child_process').execFileSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'adempiere', '-d', 'idempiere_bimdoc', '-v', 'ON_ERROR_STOP=1', '-qtA'], { input: 'set search_path=adempiere;\n' + q, encoding: 'utf8' }).trim().split('\n').pop();
  H.sql = sql; const PREC = {}; const precOf = pl => PREC[pl] !== undefined ? PREC[pl] : (PREC[pl] = Number(sql("select priceprecision from m_pricelist where name='" + pl + "' and ad_client_id=11")));
  const FINDS = H.FINDS = []; const find = (key, text) => { if (FINDS.some(f => f.key === key)) return; FINDS.push({ key, text }); D.log('§FILM_FIND ' + key + ' ' + text); };
  H.zk = zk; zk.reveal = reveal; zk.aim = zAim;
  const num = v => Number(String(v || '').replace(/,/g, ''));
  const r2 = x => Math.round(x * 100) / 100;
  // ---------------- c1: C1.1 + C1.2, one purchase order per scene (the plan's row and kind); Complete where the table says so
  const VENDOR = 'Seed Farm Inc.', VENDOR_KEY = 'SeedFarm';   // the guide's vendor; its search key read from the Business Partner window (A4.1)
  // the document numbers the windows gave (read off each window's Document No field), kept in the desk's home so a scene re-taken on its own still knows them (not filmed)
  const stFile = () => path.join(D.home, 'p3_state.json'), ST = () => { try { return JSON.parse(fs.readFileSync(stFile(), 'utf8')); } catch (e) { return {}; } };
  const stSet = (k, v) => { const o = ST(); o[k] = v; fs.writeFileSync(stFile(), JSON.stringify(o, null, 1)); D.log('§FILM_STATE ' + k + '=' + v); };
  H.ST = ST; H.stSet = stSet;
  const poScene = (row, kind) => async () => {
    const id = 'c1_' + row.project + '_' + kind, sp = row[kind]; D.cue(id + '_start', { project: row.project, kind, qty: sp.qty, product: sp.product });
    const isOpen = await D.page.locator('li.z-tab:visible', { hasText: /Purchase Order/ }).count();
    if (!isOpen) await zk.open('Purchase Order'); else if (await D.page.locator('.adwindow-breadcrumb a:visible', { hasText: /^\s*Purchase Order\s*$/ }).count()) await zk.parent('Purchase Order');
    await zk.tool('New', 'New'); D.cue(id + '_new');
    await zk.search(await zk.inst('C_Order', 'C_BPartner_ID'), VENDOR, 'Business Partner');
    await zk.combo(await zk.inst('C_Order', 'M_PriceList_ID'), 'Purchase', 'Price List');
    await zk.combo(await zk.inst('C_Order', 'M_Warehouse_ID'), 'HQ Warehouse', 'Warehouse');
    await zk.comboTyped(await zk.inst('C_Order', 'C_Project_ID'), row.project, new RegExp('^\\s*' + row.project + '_'), 'Project');
    const hv = {}; for (const c of ['C_BPartner_ID', 'M_PriceList_ID', 'M_Warehouse_ID', 'C_Project_ID', 'C_DocTypeTarget_ID']) hv[c] = await zk.val(await zk.inst('C_Order', c));
    if (!D.check(/Seed Farm/.test(hv.C_BPartner_ID) && hv.M_PriceList_ID === 'Purchase' && hv.M_Warehouse_ID === 'HQ Warehouse' && hv.C_Project_ID.indexOf(row.project + '_') === 0 && hv.C_DocTypeTarget_ID === 'Purchase Order', 'c11_header ' + row.project, JSON.stringify(hv))) return;   // a wrong header is not saved: re-take
    if (!(await zk.saved('order header ' + row.project))) return;
    await zk.tab('PO Line'); await zk.tool('New', 'New (line)'); D.cue(id + '_line');
    await zk.search(await zk.inst('C_OrderLine', 'M_Product_ID'), sp.product, 'Product');
    await zk.text(await zk.inst('C_OrderLine', 'QtyEntered'), sp.qty, 'Quantity');
    const price = await zk.val(await zk.inst('C_OrderLine', 'PriceActual')); if (!(await zk.saved('order line ' + row.project))) return;
    // guide C1.1: 'The line price is the product's standard cost'. The window rounds it to the Purchase list's precision (legacy iDempiere is the oracle): the check is iDempiere's rule,
    // and where it differs from the guide's figure the difference is a FIND for the change list (the guide's 68.1167 / 1,975.38 hold for the dry run's web-service path only)
    const cost = num(PROD[sp.product].cost), pp = precOf('Purchase'), exp = Math.round(cost * Math.pow(10, pp)) / Math.pow(10, pp);
    D.check(num(price) === exp, 'c11_line_price_is_standard_cost_at_list_precision ' + sp.product, 'price=' + price + ' = ' + cost + ' at ' + pp + ' decimals (guide ' + PROD[sp.product].cost + ')');
    if (exp !== cost) find('C1.1_price_precision', 'the order window prices a line at the Purchase list precision (' + pp + ' decimals): ' + sp.product + ' ' + cost + ' -> ' + exp + '; the guide says ' + PROD[sp.product].cost);
    await zk.parent('Purchase Order'); const tl = await zk.val(await zk.inst('C_Order', 'TotalLines')), gt = await zk.val(await zk.inst('C_Order', 'GrandTotal')), want = r2(num(sp.qty) * exp);
    D.check(num(tl) === want && num(gt) === want, 'c11_totals ' + row.project, 'total lines ' + tl + ' grand ' + gt + ' = ' + sp.qty + ' x ' + exp + ' = ' + want);   // guide C1.1: Total Lines = qty x price = Grand Total (tax 0)
    if (want !== r2(num(sp.qty) * cost)) find('C1.1_total_' + row.project + '_' + kind, row.project + ' ' + kind + ': total ' + want + ' (guide arithmetic ' + sp.qty + ' x ' + cost + ' = ' + r2(num(sp.qty) * cost) + ')');
    D.cue(id + '_totals', { total: tl });
    stSet('order.' + row.project + '.' + kind, await zk.val(await zk.inst('C_Order', 'DocumentNo'))); if (kind === 'co') stSet('ordertotal.' + row.project, String(num(gt)));
    if (kind === 'co') { D.cue(id + '_complete'); await zk.docAction('Complete'); const st = await zk.status('C_Order'); D.check(st === 'Completed', 'c12_completed ' + row.project, JSON.stringify(st)); }
    else { const st = await zk.status('C_Order'); D.check(st === 'Drafted', 'c12_left_drafted ' + row.project, JSON.stringify(st)); }
    D.cue(id + '_end'); await D.sleep(1500);
  };
  const onIdemp = async () => { if (!/8108\/webui/.test(D.page.url())) { await D.usePage(/8108\/webui/); await D.page.bringToFront(); await D.sleep(800); } };   // a re-take on its own (not filmed): the iDempiere tab in front
  H.onIdemp = onIdemp;
  for (const row of PLAN) for (const kind of ['co', 'dr']) if (row[kind]) { S['c1_' + row.project + '_' + kind] = poScene(row, kind); PREP['c1_' + row.project + '_' + kind] = onIdemp; }
  // ---------------- c2: C2.1, one material receipt per completed order whose 'How far' is Received / Half paid / Paid in full (Create lines from the order)
  const RCV = /Received|Half paid|Paid in full/, INV = /Half paid|Paid in full/;
  const onhand = pr => num(sql("select coalesce(sum(s.qtyonhand),0) from m_storageonhand s join m_product p on p.m_product_id=s.m_product_id join m_locator l on l.m_locator_id=s.m_locator_id where p.value='" + pr + "' and l.value='Default HQ Locator'"));   // B:READ (declared): the Storage per Product window's figure
  const stdcost = pr => sql("select coalesce(max(c.currentcostprice),0) from m_cost c join m_product p on p.m_product_id=c.m_product_id join m_costelement e on e.m_costelement_id=c.m_costelement_id where p.value='" + pr + "' and e.costelementtype='M' and e.costingmethod='S'");   // B:READ (declared): the Product window's Costs tab
  const openWin = async (name) => { const crumb = D.page.locator('.adwindow-breadcrumb a:visible', { hasText: new RegExp('^\\s*' + name + '\\s*$') }); const tab = D.page.locator('li.z-tab:visible', { hasText: new RegExp('^\\*?\\s*' + name) });
    if (await crumb.count()) await zk.parent(name); else if (await tab.count()) { await zAim(tab.first(), { label: name + ' (its tab)' }); await zk.idle(1500); } else await zk.open(name); };
  const createFrom = async (dlgText, docno, what) => {   // the Create lines from dialog: its Order list -> the order, the line ticked, its own button
    await zAim(D.page.locator('button.form-button:visible', { hasText: 'Create lines from' }).first(), { label: 'Create lines from' }); await zk.idle(2500);
    const w = D.page.locator('.z-window:visible', { hasText: dlgText }).last(); if (!(await w.count())) { D.check(false, what + '_dialog_opened', dlgText); return false; }
    if (!(await zk.combo(w.locator('[instancename="C_Order_ID"]').first(), new RegExp('^\\s*' + docno + '_'), 'Order'))) return false;
    await zk.idle(2000); const row1 = w.locator('.z-listitem:visible').first();
    for (let i = 0; i < 12 && !(await row1.count()); i++) await D.sleep(250);
    if (!(await row1.count())) { const rq = w.locator('button.img-btn[title^="ReQuery"]').first(); if (await rq.count()) { await zAim(rq, { label: 'ReQuery' }); await zk.idle(2500); } for (let i = 0; i < 16 && !(await row1.count()); i++) await D.sleep(250); }
    if (!(await row1.count())) { D.check(false, what + '_line_listed', 'no line under order ' + docno); return false; }
    const cb = row1.locator('.z-listitem-checkable, input[type=checkbox], .z-checkbox').first();
    await zAim(cb, { label: 'tick the line' }); await zk.idle(800);
    const okb = w.locator('button.txt-btn:visible').filter({ hasText: /Create lines from/ }).first(); await zAim(okb, { label: 'Create lines from (run)' }); await zk.idle(3000);
    const still = await D.page.locator('.z-window:visible', { hasText: dlgText }).count(); D.check(still === 0, what + '_dialog_closed'); return still === 0; };
  const recScene = (row) => async () => {
    const id = 'c2_' + row.project, d = row.co, docno = ST()['order.' + row.project + '.co']; D.cue(id + '_start', { project: row.project, order: docno });
    if (!D.check(!!docno, 'c21_order_known ' + row.project, String(docno))) return;
    const oh0 = onhand(d.product), sc0 = stdcost(d.product);
    await openWin('Material Receipt'); await zk.tool('New', 'New'); D.cue(id + '_new');
    await zk.search(await zk.inst('M_InOut', 'C_BPartner_ID'), VENDOR, 'Business Partner');
    await zk.search(await zk.inst('M_InOut', 'C_Order_ID'), docno, 'Order');
    const ho = await zk.val(await zk.inst('M_InOut', 'C_Order_ID')); D.check(String(ho).indexOf(docno) === 0, 'c21_header_order ' + row.project, JSON.stringify(ho));
    await zk.comboTyped(await zk.inst('M_InOut', 'C_Project_ID'), row.project, new RegExp('^\\s*' + row.project + '_'), 'Project');
    if (!(await zk.saved('receipt header ' + row.project))) return;
    // OWNER 2026-11-20 ('Enter the line by hand'): on this iDempiere 13 build 'Create lines from' lists no lines (its Info Window query binds the Locator's id to the Order
    // criterion, measured by the statement log: v.C_Order_ID = 101 with 101 the locator). So the line is entered on the Receipt Line tab: the header's Order first (its Order Line list
    // offers that order's lines), then the line's Order Line; iDempiere fills product and quantity from it.
    D.cue(id + '_line'); await zk.tab('Receipt Line'); await zk.tool('New', 'New (line)');
    await zk.combo(await zk.inst('M_InOutLine', 'C_OrderLine_ID'), new RegExp('^\\s*' + docno + '_'), 'Order Line');
    await zk.idle(1500); let pq = await zk.val(await zk.inst('M_InOutLine', 'QtyEntered')); const pr = await zk.val(await zk.inst('M_InOutLine', 'M_Product_ID')), loc = await zk.val(await zk.inst('M_InOutLine', 'M_Locator_ID'));
    if (num(pq) !== num(d.qty)) { D.log('§FILM_NOTE the line quantity read ' + pq + ' after the Order Line; typed ' + d.qty); await zk.text(await zk.inst('M_InOutLine', 'QtyEntered'), d.qty, 'Quantity'); pq = await zk.val(await zk.inst('M_InOutLine', 'QtyEntered')); }
    D.check(loc === 'Default HQ Locator', 'c21_locator_default_hq ' + row.project, JSON.stringify(loc));   // guide C2.1: 'check the Locator is Default HQ Locator'
    D.check(num(pq) === num(d.qty) && (String(pr).indexOf(PROD[d.product].name) >= 0 || String(pr).indexOf(d.product) >= 0), 'c21_line_product_qty ' + row.project, pr + ' x ' + pq);
    if (!(await zk.saved('receipt line ' + row.project))) return;
    await zk.parent('Material Receipt'); D.cue(id + '_complete'); await zk.docAction('Complete'); const st = await zk.status('M_InOut');
    D.check(st === 'Completed', 'c21_completed ' + row.project, JSON.stringify(st)); stSet('receipt.' + row.project, await zk.val(await zk.inst('M_InOut', 'DocumentNo')));
    const oh1 = onhand(d.product), sc1 = stdcost(d.product);
    D.check(r2(oh1 - oh0) === num(d.qty), 'c21_onhand_rose ' + row.project, d.product + ' ' + oh0 + ' -> ' + oh1);   // guide C2.1: 'on-hand quantity rose'
    D.check(sc1 === sc0, 'c21_standard_cost_unchanged ' + row.project, d.product + ' ' + sc0 + ' -> ' + sc1);   // guide C2.1: 'its Standard cost did not change'
    D.cue(id + '_end'); await D.sleep(1500); };
  // ---------------- c3: C3.1 the vendor invoice (Create lines from the order) and C3.2 its payment, for 'Half paid' and 'Paid in full'
  const invScene = (row) => async () => {
    const id = 'c31_' + row.project, d = row.co, docno = ST()['order.' + row.project + '.co']; D.cue(id + '_start', { project: row.project, order: docno });
    if (!D.check(!!docno, 'c31_order_known ' + row.project, String(docno))) return;
    await openWin('Purchase Invoice and Credit/Debit Note'); await zk.tool('New', 'New'); D.cue(id + '_new');
    const dt = await zk.inst('C_Invoice', 'C_DocTypeTarget_ID'); await zk.combo(dt, 'AP Invoice', 'Target Document Type');
    await zk.search(await zk.inst('C_Invoice', 'C_BPartner_ID'), VENDOR, 'Business Partner');
    await zk.comboTyped(await zk.inst('C_Invoice', 'C_Project_ID'), row.project, new RegExp('^\\s*' + row.project + '_'), 'Project');
    if (!(await zk.saved('invoice header ' + row.project))) return;
    D.cue(id + '_from'); if (!(await createFrom('Create lines from Invoice', docno, 'c31 ' + row.project))) return;
    const gt = await zk.val(await zk.inst('C_Invoice', 'GrandTotal')), og = num(ST()['ordertotal.' + row.project] || 0) || r2(num(d.qty) * Math.round(num(PROD[d.product].cost) * Math.pow(10, precOf('Purchase'))) / Math.pow(10, precOf('Purchase')));
    D.cue(id + '_complete'); await zk.docAction('Complete'); const st = await zk.status('C_Invoice');
    D.check(st === 'Completed', 'c31_completed ' + row.project, JSON.stringify(st)); D.check(num(gt) === og, 'c31_grand_total_equals_order ' + row.project, 'invoice ' + gt + ' order ' + og);   // guide C3.1: 'its Grand Total equals the order's'
    stSet('invoice.' + row.project, await zk.val(await zk.inst('C_Invoice', 'DocumentNo'))); stSet('invoicetotal.' + row.project, String(num(gt)));
    D.cue(id + '_end'); await D.sleep(1500); };
  const payScene = (row) => async () => {
    const id = 'c32_' + row.project, inv = ST()['invoice.' + row.project], tot = num(ST()['invoicetotal.' + row.project] || 0), half = /Half paid/.test(row.far); D.cue(id + '_start', { project: row.project, invoice: inv });
    if (!D.check(!!inv && tot > 0, 'c32_invoice_known ' + row.project, inv + ' ' + tot)) return;
    await openWin('Payment and Receipt'); await zk.tool('New', 'New'); D.cue(id + '_new');
    await zk.combo(await zk.inst('C_Payment', 'C_DocType_ID'), 'AP Payment', 'Document Type');
    // the Payment window looks a partner up by its Search Key and, being sales-side, its Info shows no vendor (measured: Like 'SEED FARM INC.%' on Value, Vendor = No): the vendor's key is typed
    await zk.search(await zk.inst('C_Payment', 'C_BPartner_ID'), VENDOR_KEY, 'Business Partner (its search key)'); D.log('§FILM_FIND C3.2_bp_by_search_key the Payment window finds the vendor by its search key SeedFarm, not by its name');
    const bpv = await zk.val(await zk.inst('C_Payment', 'C_BPartner_ID')); if (!D.check(/Seed Farm/.test(bpv), 'c32_vendor_set ' + row.project, JSON.stringify(bpv))) return;
    await zk.search(await zk.inst('C_Payment', 'C_Invoice_ID'), inv, 'Invoice');
    const pa0 = await zk.val(await zk.inst('C_Payment', 'PayAmt')); D.check(num(pa0) === tot, 'c32_amount_fills_in ' + row.project, 'pay ' + pa0 + ' invoice ' + tot);   // guide C3.2: 'the amount fills in'
    const ba = await zk.inst('C_Payment', 'C_BankAccount_ID'); await zk.combo(ba, /MoneyBank/, 'Bank Account'); await zk.combo(await zk.inst('C_Payment', 'TenderType'), 'Check', 'Tender type');
    const want = half ? r2(tot / 2) : tot; if (half) { D.cue(id + '_half'); await zk.text(await zk.inst('C_Payment', 'PayAmt'), want.toFixed(2), 'Payment amount (half)'); }
    if (!(await zk.saved('payment ' + row.project))) return;
    D.cue(id + '_complete'); await zk.docAction('Complete'); const st = await zk.status('C_Payment'); D.check(st === 'Completed', 'c32_completed ' + row.project, JSON.stringify(st));
    // B:READ (declared): the invoice's Paid tick and open amount, as the invoice window shows them
    const ip = sql("select ispaid from c_invoice where documentno='" + inv + "' and ad_client_id=11 and issotrx='N'"), op = num(sql("select invoiceopen(c_invoice_id, 0) from c_invoice where documentno='" + inv + "' and ad_client_id=11 and issotrx='N'"));
    D.check(half ? ip === 'N' && op === r2(tot - want) : ip === 'Y' && op === 0, 'c32_invoice_paid_state ' + row.project, 'paid=' + ip + ' open=' + op + ' (' + row.far + ')');   // guide C3.2
    D.cue(id + '_end'); await D.sleep(1500); };
  for (const row of PLAN) if (row.co && INV.test(row.far || '')) { S['c32_' + row.project] = payScene(row); PREP['c32_' + row.project] = async () => onIdemp(); }
  H.payScenes = PLAN.filter(r => r.co && INV.test(r.far || '')).map(r => 'c32_' + r.project);
  for (const row of PLAN) if (row.co && INV.test(row.far || '')) { S['c31_' + row.project] = invScene(row); PREP['c31_' + row.project] = async () => onIdemp(); }
  H.invScenes = PLAN.filter(r => r.co && INV.test(r.far || '')).map(r => 'c31_' + r.project);
  for (const row of PLAN) if (row.co && RCV.test(row.far || '')) { S['c2_' + row.project] = recScene(row); PREP['c2_' + row.project] = async () => onIdemp(); }
  H.recScenes = PLAN.filter(r => r.co && RCV.test(r.far || '')).map(r => 'c2_' + r.project);
  // ---------------- c4: C4.1 Set Project Type -> Work Order (Job); C4.2 Issue to Project; C4.3 the Issues tab; C4.4 Project Balance (one scene per project with an issue)
  const lookup = async (key) => { await zk.tool('Lookup Record', 'Lookup Record'); const w = D.page.locator('.z-window:visible').filter({ hasText: 'Lookup Record' }).last();
    const vf = w.locator('input[instancename="Value"], [instancename="Value"] input').first(); await zAim(vf, { label: 'Search Key' }); await D.key('ctrl+a', 'select what is there'); await D.type(key); await zAim(w.locator('button.img-btn[title^="OK"]').first(), { label: 'OK (Lookup)' }); await zk.idle(2500);
    const v = await zk.val(await zk.inst('C_Project', 'Value')); D.check(v === key, 'lookup_found ' + key, JSON.stringify(v)); return v === key; };
  // OK on a process dialog, then its result as iDempiere writes it: the process panel keeps it after '**' (measured: '** Created 1'); a dialog that closes leaves it in the window's status
  const procOk = async (label) => { const dlg = D.page.locator('.z-window:visible').filter({ has: D.page.locator('button.btn-ok') }).last(); const h = await dlg.elementHandle();
    await zAim(dlg.locator('button.btn-ok').first(), { label: 'OK (' + label + ')' }); await zk.idle(4000);
    // ZK replaces the panel when the process has run: the result is looked up afresh in whichever visible window now carries the '**' line
    let m = ''; for (let i = 0; i < 24; i++) { const a = await D.page.evaluate(() => [...document.querySelectorAll('.z-window')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ')).filter(t => /\*\*/.test(t)).pop() || ''), b = await zk.msg();
      m = ((/\*\*\s*(.*)$/.exec(a) || [])[1] || '') + ' | ' + b; if (/\*\*/.test(a) || /\bOK\b/.test(b)) break; await D.sleep(300); } void h; return m.slice(0, 400); };
  const gridRows = () => D.page.evaluate(() => [...document.querySelectorAll('tr.adtab-grid.z-row, .adtab-grid tr.z-row')].filter(e => e.getBoundingClientRect().width > 0).length);
  const phaseTab = async (project) => {   // on the Project window showing the project: Line Level to Phase if needed, Save, then the Phase tab
    const ll = await zk.inst('C_Project', 'ProjectLineLevel'), v = await zk.val(ll);
    if (v !== 'Phase') { find('C5.1_line_level', 'the pack projects have Line Level = Project, so the Project window hides the Phase tab; Line Level set to Phase (' + project + ')'); await zk.combo(ll, 'Phase', 'Line Level'); if (!(await zk.saved('line level ' + project))) return false; }
    await zk.tab('Phase'); await zk.idle(1500); return true; };
  const typeScene = (row) => async () => {
    const id = 'c41_' + row.project; D.cue(id + '_start', { project: row.project });
    await openWin('Project'); if (!(await lookup(row.project))) return; D.cue(id + '_found');
    await zAim(D.page.locator('button.form-button:visible', { hasText: 'Set Project Type' }).first(), { label: 'Set Project Type' }); await zk.idle(2500);
    const dlg = D.page.locator('.z-window:visible').filter({ has: D.page.locator('button.btn-ok') }).last(); const cb = dlg.locator('.z-combobox').first();
    if (!(await zk.combo(cb, /^\s*Work Order \(Job\)/, 'Project Type'))) return;
    D.cue(id + '_ok'); const m = await procOk('Set Project Type'); D.log('§FILM_MSG ' + id + ' ' + JSON.stringify(m.slice(-200)));
    const cat = sql("select coalesce(projectcategory,'') || '|' || coalesce((select name from c_projecttype t where t.c_projecttype_id=p.c_projecttype_id),'') from c_project p where value='" + row.project + "'");   // B:READ (declared)
    const ph = num(sql("select count(*) from c_projectphase ph join c_project p on p.c_project_id=ph.c_project_id where p.value='" + row.project + "'"));
    D.check(/\bOK\b/.test(m) || /^W\|Work Order/.test(cat), 'c41_message_ok ' + row.project, JSON.stringify(m.slice(-120)) + ' category|type=' + cat);   // guide C4.1: 'The message says OK'
    D.check(/^W\|/.test(cat) && ph > 0, 'c41_work_order_phases_kept ' + row.project, 'category|type=' + cat + ' phases=' + ph);   // guide C4.1: phases still there
    // OWNER 2026-11-20 ('Set Line Level first'): the pack's projects carry Line Level = Project, and the Phase tab shows only for Phase or Task (AD_Tab display logic): Line Level -> Phase, Save
    if (await phaseTab(row.project)) { const n = await gridRows(); D.check(n === ph, 'c41_phase_tab_lists_phases ' + row.project, 'rows=' + n + ' phases=' + ph); }
    D.cue(id + '_end'); await D.sleep(1500); };
  const today = () => { const d = new Date(); return String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0') + '/' + d.getFullYear(); };   // the date as this login shows dates (MM/DD/YYYY, read off the receipt's Movement Date)
  const issueScene = (row) => async () => {
    const id = 'c42_' + row.project, d = row.issue; D.cue(id + '_start', { project: row.project, qty: d.qty, product: d.product });
    const bal0 = num(sql("select projectbalanceamt from c_project where value='" + row.project + "'")), n0 = num(sql("select count(*) from c_projectissue i join c_project p on p.c_project_id=i.c_project_id where p.value='" + row.project + "'"));
    await zk.open('Issue to Project'); D.cue(id + '_open');
    const P = n => D.page.locator('[instancename="' + n + '"]:visible').first();
    await zk.comboTyped(P('C_Project_ID'), row.project, new RegExp('^\\s*' + row.project + '_'), 'Project');
    await zk.locator('M_Locator_ID', 'Default HQ Locator');
    await zk.search('M_Product_ID', d.product, 'Product');
    await zk.text('MovementQty', d.qty, 'Movement Quantity'); await zk.text('MovementDate', today(), 'Movement Date (today)');
    const pv = {}; for (const n of ['C_Project_ID', 'M_Locator_ID', 'M_Product_ID', 'MovementQty', 'MovementDate', 'M_InOut_ID', 'S_TimeExpense_ID', 'C_ProjectLine_ID']) pv[n] = await zk.val(n);
    if (!D.check(pv.C_Project_ID.indexOf(row.project + '_') === 0 && pv.M_Locator_ID === 'Default HQ Locator' && String(pv.M_Product_ID).indexOf(d.product) >= 0 && num(pv.MovementQty) === num(d.qty) && !pv.M_InOut_ID && !pv.S_TimeExpense_ID && !pv.C_ProjectLine_ID, 'c42_parameters ' + row.project, JSON.stringify(pv))) return;   // guide C4.2: the three left empty
    D.cue(id + '_ok'); const m = await procOk('Issue to Project'); D.log('§FILM_MSG ' + id + ' ' + JSON.stringify(m.slice(-200)));
    D.check(/Created\s*=?\s*1\b|\b1\s*Created/i.test(m), 'c42_message_created_1 ' + row.project, JSON.stringify(m.slice(-160)));   // guide C4.2: 'The message says Created 1'
    // B:READ (declared) for every project; C4.3 / C4.4 show the windows for the guide's three named projects
    const n1 = num(sql("select count(*) from c_projectissue i join c_project p on p.c_project_id=i.c_project_id where p.value='" + row.project + "'")), bal1 = num(sql("select projectbalanceamt from c_project where value='" + row.project + "'")), want = r2(num(d.qty) * num(PROD[d.product].cost));
    D.check(n1 === n0 + 1, 'c43_one_issue_line ' + row.project, n0 + ' -> ' + n1); D.check(r2(bal1 - bal0) === want, 'c44_balance_rose_qty_x_standard_cost ' + row.project, bal0 + ' -> ' + bal1 + ' (' + d.qty + ' x ' + PROD[d.product].cost + ' = ' + want + ')');
    D.cue(id + '_end'); await D.sleep(1500); };
  // C4.3 + C4.4 shown in the windows for the projects whose figures the guide's C4.4 gives (parsed: '*TD_X* q × c = **v**')
  const c44row = (MD.split('\n').find(l => /^\| C4\.4 \|/.test(l)) || ''), NAMED = []; let mm; const rxN = /\*(TD_[A-Z]+)\* ([\d,.]+) × ([\d.]+) = \*\*([\d,.]+)\*\*/g; while ((mm = rxN.exec(c44row))) NAMED.push({ project: mm[1], qty: mm[2], cost: mm[3], bal: mm[4] });
  H.NAMED = NAMED;
  const showScene = (nm) => async () => {
    const id = 'c43_' + nm.project, row = PLAN.find(r => r.project === nm.project); D.cue(id + '_start', { project: nm.project });
    await openWin('Project (Lines/Issues)'); if (!(await lookup(nm.project))) return; await zk.tab('Issues'); D.cue(id + '_issues');
    const rows = await D.page.evaluate(() => [...document.querySelectorAll('.adtab-grid .z-row, .z-grid .z-row, tr.z-row')].filter(e => e.getBoundingClientRect().width > 0).map(r => r.innerText.replace(/\s+/g, ' ')).filter(t => /PWD-/.test(t)));
    const one = rows.length ? rows[0] : JSON.stringify(await D.page.evaluate(() => [...document.querySelectorAll('[instancename]')].filter(e => e.getBoundingClientRect().width > 0 && /C_ProjectIssue\d+(M_Product_ID|MovementQty|DocStatus|Processed)$/.test(e.getAttribute('instancename'))).map(e => e.getAttribute('instancename').replace(/^C_ProjectIssue\d+/, '') + '=' + ((e.querySelector('input') || e).value || (e.querySelector('input[type=checkbox]') || {}).checked))));
    D.check(one.indexOf(row.issue.product) >= 0 && new RegExp('\\b' + row.issue.qty.replace(/\B(?=(\d{3})+(?!\d))/g, ',?') + '\\b').test(one), 'c43_issue_line_product_qty ' + nm.project, one.slice(0, 200));   // guide C4.3: one issue line with the product and quantity
    D.cue(id + '_balance'); await openWin('Project'); if (!(await lookup(nm.project))) return; const b = await zk.val(await zk.inst('C_Project', 'ProjectBalanceAmt')); await zk.reveal(zk.f(await zk.inst('C_Project', 'ProjectBalanceAmt'))); await D.aim(zk.f(await zk.inst('C_Project', 'ProjectBalanceAmt')), { label: 'Project Balance ' + b });
    D.check(r2(num(b)) === num(nm.bal), 'c44_project_balance ' + nm.project, b + ' (guide ' + nm.qty + ' x ' + nm.cost + ' = ' + nm.bal + ')');   // guide C4.4 (the guide prints the product rounded to cents)
    if (num(b) !== num(nm.bal)) find('C4.4_balance_decimals', 'Project Balance shows the exact product with 4 decimals (' + nm.project + ' ' + b + '); the guide prints it rounded (' + nm.bal + ')');
    D.cue(id + '_end'); await D.sleep(2000); };
  for (const nm of NAMED) { S['c43_' + nm.project] = showScene(nm); PREP['c43_' + nm.project] = async () => onIdemp(); }
  H.showScenes = NAMED.map(n => 'c43_' + n.project);
  for (const row of PLAN) if (row.issue) { S['c42_' + row.project] = issueScene(row); PREP['c42_' + row.project] = async () => onIdemp(); }
  H.issueScenes = PLAN.filter(r => r.issue).map(r => 'c42_' + r.project);
  for (const row of PLAN) if (row.issue) { S['c41_' + row.project] = typeScene(row); PREP['c41_' + row.project] = async () => onIdemp(); }
  H.typeScenes = PLAN.filter(r => r.issue).map(r => 'c41_' + r.project);
  // ---------------- c5: C5.1 tick the next phase on TD_DEPOT (the guide's example), Save
  const C5 = ((/\| C5\.1 \|.*?\*(TD_[A-Z]+)\*/.exec(MD) || [])[1]) || 'TD_DEPOT';
  S.c5 = async () => {
    const id = 'c5_' + C5; D.cue(id + '_start', { project: C5 }); const t0 = num(sql("select count(*) from c_projectphase ph join c_project p on p.c_project_id=ph.c_project_id where p.value='" + C5 + "' and ph.iscomplete='Y'")), tot = num(sql("select count(*) from c_projectphase ph join c_project p on p.c_project_id=ph.c_project_id where p.value='" + C5 + "'"));
    const next = sql("select ph.name from c_projectphase ph join c_project p on p.c_project_id=ph.c_project_id where p.value='" + C5 + "' and ph.iscomplete='N' order by ph.seqno limit 1");   // B:READ (declared): which row is the next unticked one
    await openWin('Project'); if (!(await lookup(C5))) return; if (!(await phaseTab(C5))) return; D.cue(id + '_phase');
    const r = D.page.locator('tr.adtab-grid.z-row:visible', { hasText: next }).first(); if (await r.count()) { await zAim(r, { label: 'phase ' + next }); await zk.idle(800); await zk.tool('Grid Toggle', 'Grid Toggle (form view)'); }
    const cx = zk.f(await zk.inst('C_ProjectPhase', 'IsComplete')); const nm = await zk.val(await zk.inst('C_ProjectPhase', 'Name'));
    if (!D.check(nm === next, 'c51_row_is_next_phase', JSON.stringify(nm) + ' next=' + next)) return;
    await zAim(cx.locator('input, label').first(), { label: 'Complete' }); await zk.idle(600); D.cue(id + '_tick'); if (!(await zk.saved('phase ' + next))) return;
    const t1 = num(sql("select count(*) from c_projectphase ph join c_project p on p.c_project_id=ph.c_project_id where p.value='" + C5 + "' and ph.iscomplete='Y'"));
    D.check(t1 === t0 + 1, 'c51_phase_stays_ticked ' + C5, t0 + ' -> ' + t1 + ' of ' + tot);   // guide C5.1: 'The phase stays ticked (for TD_DEPOT 2 of 4 now)'
    D.cue(id + '_end'); await D.sleep(2000); };
  PREP.c5 = async () => onIdemp();
  H.poScenes = PLAN.flatMap(r => ['co', 'dr'].filter(k => r[k]).map(k => 'c1_' + r.project + '_' + k));
  // ---------------- c0: log in to iDempiere as GardenWorld Admin (a new tab), as Part II s13 does; Chrome's own password window is pressed OK (change list item 7)
  PREP.c0 = async () => {   // not filmed: no iDempiere session left from an earlier attempt (a fresh profile has none): its tabs closed, its cookie cleared
    for (const p of D.pages()) if (/8108\/webui/.test(p.url())) await p.close().catch(() => {});
    const ck = (await D.page.context().cookies()).filter(c => /localhost/.test(c.domain) && String(c.port || '') !== 'x'); await D.page.context().clearCookies({ domain: 'localhost' }).catch(async () => { await D.page.context().clearCookies(); });
    D.page = D.pages()[D.pages().length - 1]; await D.page.bringToFront(); D.log('§FILM_PREP c0 iDempiere tabs closed, cookies for localhost cleared (' + ck.length + ')'); };
  S.c0 = async () => {
    D.cue('c0_start'); D.log('§FILM_PLAN ' + JSON.stringify(PLAN)); D.log('§FILM_PROD ' + JSON.stringify(PROD)); await D.key('ctrl+t', 'a new tab'); await D.sleep(1200); await D.usePage(/^(about:blank|chrome:\/\/new-tab-page|chrome:\/\/newtab)/); await D.page.bringToFront();
    await D.aimClick(OMNIBOX, { label: 'the address bar' }); await D.type(H.IDEMP); await D.key('Return', 'open iDempiere');
    await D.waitUrl(/8108\/webui/, 60000); await D.page.waitForFunction(() => document.querySelectorAll('input.z-textbox').length >= 2, null, { timeout: 90000 }); await D.sleep(1500);
    const boxes = D.page.locator('input.z-textbox'); await D.aimClick(boxes.nth(0), { label: 'User' }); await D.key('ctrl+a', 'select what is there'); await D.type('GardenAdmin'); await D.aimClick(boxes.nth(1), { label: 'Password' }); await D.key('ctrl+a', 'select what is there'); await D.type('GardenAdmin');   // ctrl+a: a box Chrome filled in is replaced, not appended to
    // §5.16 find: with the default Organization '*' a purchase order refuses to save ('Fill mandatory fields: Organization, Warehouse', measured 2026-11-20); the guide names no
    // organization, so the film ticks Select Role and chooses HQ and HQ Warehouse, as the UAT Dry Run's login did (lib/zk.js role(pg,'HQ','HQ')). Change list item, appended.
    const sr = D.page.locator('.z-checkbox:visible', { hasText: 'Select Role' }).first(); const on = await sr.locator('input').isChecked().catch(() => false);
    if (!on) { await D.aimClick(sr.locator('label, input').first(), { label: 'Select Role' }); await D.sleep(500); }
    D.check(await sr.locator('input').isChecked().catch(() => false), 'c0_select_role_ticked');
    await D.aimClick(D.page.locator('button.btn-ok:visible').first(), { label: 'OK (log in)' }); await D.sleep(4000); await H.chromePwWarn('after log in');
    await D.page.waitForFunction(() => document.querySelectorAll('span.z-combobox').length >= 4, null, { timeout: 60000 }); await D.sleep(1200); D.cue('c0_role');
    const cbs = D.page.locator('span.z-combobox:visible'); await zk.combo(cbs.nth(2), 'HQ', 'Organization'); await zk.combo(cbs.nth(3), /^\s*HQ/, 'Warehouse');
    const rv = await D.page.evaluate(() => [...document.querySelectorAll('span.z-combobox')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.querySelector('input').value));
    D.check(rv[2] === 'HQ' && /^HQ/.test(rv[3] || ''), 'c0_role_org_hq_warehouse_hq', JSON.stringify(rv));
    const which = await D.page.waitForFunction(() => document.querySelector('input.z-bandbox-input[placeholder="Alt+G"]') ? 'home' : (/Select Role/.test((document.querySelector('.login-box-header-txt') || {}).innerText || '') ? 'role' : null), null, { timeout: 60000 }).then(h => h.jsonValue());
    if (which === 'role') { await D.sleep(1500); await D.aimClick(D.page.locator('button.btn-ok:visible').first(), { label: 'OK (role)' }); await D.sleep(2500); await H.chromePwWarn('after role'); }
    await D.page.waitForSelector('input.z-bandbox-input[placeholder="Alt+G"]:visible', { timeout: 90000 }); D.check(true, 'c0_home_shown', which);
    // Chrome's own 'Save password?' bubble (top right) stays open after the login and takes the keys and clicks meant for the page (measured 2026-11-20: a typed project went
    // nowhere): the film presses its 'No thanks', read on the screen, as a tester would
    for (let i = 0; i < 6; i++) { const nt = await D.findText(t => /^thanks$/i.test(t), D.screenBox(1000, 60, 920, 420, 'Chrome Save password bubble'), 2, true);
      if (!nt) { if (i >= 2) { D.log('§FILM_NOTE no Chrome Save password bubble'); break; } await D.sleep(1000); continue; }
      D.cue('c0_savepw'); await D.aim(D.screenBox(nt.x - 40, nt.y - 8, nt.w + 50, nt.h + 16, 'No thanks'), { label: 'No thanks (Chrome: Save password?)' }); await D.click({ label: 'No thanks' }); await D.sleep(1200);
      const gone = !(await D.findText(t => /^thanks$/i.test(t), D.screenBox(1000, 60, 920, 420, 'Chrome Save password bubble'), 2, true)); D.check(gone, 'chrome_save_password_bubble_closed'); break; } D.log('§FILM_HOME_OPENED t=' + D.now().toFixed(0) + ' (D9: Home goals recalculate only when older than 30 min)');
    D.cue('c0_home'); await D.sleep(2500); D.cue('c0_end');
  };
};
