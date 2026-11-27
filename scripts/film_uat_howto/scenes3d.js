// ⚠ DO NOT REMOVE — film "UAT, hands on" PART III (prompts/FILM_UAT_GUIDE.md §5.16): chapter D, the read job in a terminal (d0) and the dashboard checks D1-D9. READ THE LOG (§FILM_*).
// Plugged in by scenes3.js (same S / PREP maps, driver and helpers). Every expected figure is parsed from the guide's own chapter D rows (docs/CapexUATGuide.md), never retyped;
// the dashboard's selectors are the UAT Dry Run's (instruments/D.js). A figure read from the page's own text is what the tester reads; a table read is tagged B:READ.
'use strict';
module.exports = (S, PREP, D, H) => {
  const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
  const { zk, sql, find, num, r2, MD, OMNIBOX } = H;
  const WEBPORT = process.env.FILM_WEBPORT || '8191', OOTB = process.env.OOTB_COPY || '/tmp/wt-film-ootb-f2', DASH = 'localhost:' + WEBPORT + '/capex/index.html?source=legacy', SNAP = path.join(OOTB, 'capex', 'legacy_snapshot.json');
  const row = k => (MD.split('\n').find(l => l.indexOf('| ' + k + ' |') === 0) || '');
  const G = {}; { let m;   // the guide's own figures
    m = /\*\*(\d+)\*\* and \*\*(\d+)\*\*/.exec(row('D1')) || []; G.total = +m[1]; G.active = +m[2];
    G.approved = (/\*\*USD ([\d,.]+)\*\*/.exec(row('D2')) || [])[1];
    m = /\*\*Within (\d+), Over (\d+), Not started (\d+)\*\*/.exec(row('D2b')) || []; G.within = +m[1]; G.over = +m[2]; G.notstarted = +m[3];
    G.overRows = []; const rx = /\*(TD_[A-Z]+)\* \((?:Spent )?([\d,.]+) against (?:a plan of )?([\d,.]+)\)/g; while ((m = rx.exec(row('D2b')))) G.overRows.push({ project: m[1], spent: m[2], plan: m[3] });
    G.approvedBdt = (/\*\*(BDT [\d,.]+ \(USD [\d,]+\))\*\*/.exec(row('D2')) || [])[1];   // D2 rev (r): 'and **BDT 15,342,507.97 (USD 127,854)**' (SHED, the Bangladesh pack)
    G.spentBdt = (/\*\*(BDT [\d,.]+ \(USD [\d,]+\))\*\*/.exec(row('D3')) || [])[1];   // D3: '**BDT 0.00 (USD 0)**'
    G.homeApproved = (/\*CAPEX Approved Budget\* ([\d,]+)/.exec(row('D9')) || [])[1];   // D9: 'CAPEX Approved Budget 4,668'
    G.spent = (/\*\*USD ([\d,.]+)\*\*/.exec(row('D3')) || [])[1]; G.pct = String(Math.round(100 * num(G.spent) / num(G.approved)));   // §5.33: D3 (rev (r)) says each tile has its own % of plan but no longer states it: the USD tile's percent is the guide's two USD figures divided (D3's Spent over D2's Approved), rounded
    m = /the (\d+) you left Drafted, \*\*USD ([\d,.]+)\*\*/.exec(row('D4')) || []; G.openN = +m[1]; G.openAmt = m[2];
    G.stages = []; const st = /\(([^()]*Ordered[^()]*Paid)\)/.exec(row('D4')); if (st) st[1].split(',').forEach(part => { const stage = (/(Ordered|Received|Invoiced|Paid)\s*$/.exec(part.trim()) || [])[1]; (part.match(/TD_[A-Z]+/g) || []).forEach(p => G.stages.push({ project: p, stage: stage.toLowerCase() })); });
    m = /\*(TD_[A-Z]+)\*.*Approved \*\*([\d,.]+)\*\*, (\d+) phases.*first (\d+) \*Complete\*/.exec(row('D6')) || []; G.d6 = { project: m[1], approved: m[2], phases: +m[3], complete: +m[4] };
    G.execLabel = (/becomes \*([^*]+)\*/.exec(row('D8')) || [])[1]; }
  H.G = G;
  const until = async (fn, ms, arg) => { for (let i = 0; i < (ms || 30000) / 250; i++) { const v = await D.page.evaluate(fn, arg).catch(() => null); if (v) return v; await D.sleep(250); } return null; };
  const txt = sel => D.page.evaluate(s => { const e = document.querySelector(s); return e ? e.innerText.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const tile = k => txt('[data-drill="' + k + '"], [data-tile="' + k + '"]');
  const panel = () => D.page.evaluate(() => { const p = document.getElementById('drill'); if (!p || p.hidden) return null; const n = p.querySelector('.dn');
    return { n: n ? Number(n.getAttribute('data-drill-n')) : -1, head: (p.querySelector('.dhead b') || {}).innerText, rows: [...p.querySelectorAll('tbody tr')].map(r => { const c = [...r.children].map(x => x.innerText.replace(/\s+/g, ' ').trim()); return { v: (r.querySelector('a.open') || {}).textContent, cur: c[1], approved: c[2], spent: c[3], budget: c[8] }; }) }; });
  const sum = (rows, k) => r2(rows.filter(r => r.cur === 'USD').reduce((a, r) => a + num(r[k]), 0));
  const drill = async (sel, label) => { await D.aimClick(sel, { label }); return until(() => { const p = document.getElementById('drill'); return p && !p.hidden; }, 8000).then(panel); };
  const closePanel = async () => { if (await panel()) { await D.aimClick('#drillClose', { label: '× (close the panel)' }); await D.sleep(600); } };
  const state = k => H.ST()['d.' + k];

  // ---------------- d0: the read job, typed in a terminal in the served copy of the repository (the guide's own line)
  // The terminal is GNOME Terminal in its OWN private session bus (as the Files app in drv.js), never the owner's; it starts slowly (26 s measured), so PREP starts it and minimises it.
  const TERM = { x: 120, y: 500, w: 1680, h: 540 }; let termWin = null;
  PREP.d0 = async () => {
    await H.onIdemp(); try { fs.unlinkSync(SNAP); } catch (e) { }   // not filmed: no snapshot left from an earlier run, so the file the scene finds is the one its own command wrote
    const code = await new Promise(r => require('http').get('http://localhost:' + WEBPORT + '/capex/index.html', x => { x.resume(); r(x.statusCode); }).on('error', () => r(0))); if (code !== 200) throw new Error('the served copy is not up: python3 -m http.server ' + WEBPORT + ' in ' + OOTB + ' (A1.1/A1.2)');
    const find1 = () => { try { return D.X('search', '--class', 'gnome-terminal').trim().split('\n').filter(Boolean).pop(); } catch (e) { return null; } };
    termWin = find1();
    if (!termWin) { const env = Object.assign({}, D.ENV, { HOME: D.home, GSK_RENDERER: 'cairo', LIBGL_ALWAYS_SOFTWARE: '1' }); delete env.XDG_RUNTIME_DIR; delete env.WAYLAND_DISPLAY;
      const sh = '/usr/libexec/gnome-terminal-server --app-id org.film.Term & sleep 2; gnome-terminal --app-id org.film.Term --zoom=1.5 --geometry=118x16 --working-directory=' + OOTB + " -- env PS1='bim-ootb$ ' bash --norc --noprofile; wait";
      spawn('dbus-run-session', ['--', 'bash', '-c', sh], { env, detached: true, stdio: 'ignore' }).unref();
      for (let i = 0; i < 300 && !termWin; i++) { await D.sleep(300); try { termWin = D.X('search', '--onlyvisible', '--class', 'gnome-terminal').trim().split('\n').filter(Boolean).pop(); } catch (e) { } } }
    if (!termWin) throw new Error('the terminal did not open in 90 s');
    await D.sleep(1500); try { D.X('windowminimize', termWin); } catch (e) { } D.log('§FILM_PREP d0 terminal window=' + termWin + ' cwd=' + OOTB + ' snapshot removed');
  };
  S.d0 = async () => {
    D.cue('d0_start'); D.X('windowactivate', '--sync', termWin); D.X('windowmove', termWin, TERM.x, TERM.y); D.X('windowsize', termWin, TERM.w, TERM.h); await D.sleep(1500);
    await D.aimClick(D.screenBox(TERM.x + 200, TERM.y + 200, 800, 200, 'the terminal'), { label: 'the terminal' });
    const line = 'BRIDGE_BASE=http://localhost:8108 node capex/tools/legacy_snapshot.js';   // guide, chapter D: BRIDGE_BASE=http://<your-idempiere>:<port> node capex/tools/legacy_snapshot.js
    D.check(MD.indexOf('BRIDGE_BASE=http://<your-idempiere>:<port> node capex/tools/legacy_snapshot.js') > 0, 'd0_line_is_the_guides');
    D.cue('d0_type'); await D.type(line, 70); await D.key('Return', 'run the read job'); D.fastStart('the read job runs');
    for (let i = 0; i < 240 && !fs.existsSync(SNAP); i++) await D.sleep(500); await D.sleep(1500); D.fastEnd();
    const R = D.screenBox(TERM.x, TERM.y, TERM.w, TERM.h, 'the terminal');
    const p = await D.findText(t => /^projects=\d+$/.test(t), R, 6, true), u = await D.findText(t => /^unavailable=\[\]?$/.test(t), R, 6, true);
    D.check(!!p && p.t === 'projects=' + G.total, 'd0_line_projects_on_screen', p ? p.t : 'not read');   // guide: '§DASH_LEGACY_SNAPSHOT … projects=14 … unavailable=[]'
    // the line is longer than the terminal is wide: where it wraps right after 'unavailable=[' (rehearsal 2026-11-20) the ']' starts the next row; that reading is accepted only at the
    // terminal's right edge, and the file read below is what says the list is empty
    const wrapped = !!u && u.t === 'unavailable=[' && u.x + u.w > TERM.x + TERM.w - 120;
    D.check(!!u && (u.t === 'unavailable=[]' || wrapped), 'd0_line_unavailable_empty_on_screen', u ? u.t + (wrapped ? ' (wrapped at the right edge, x=' + (u.x + u.w) + ')' : '') : 'not read');
    let j = {}; try { j = JSON.parse(fs.readFileSync(SNAP, 'utf8')); } catch (e) { }   // B:READ (declared): the file the job wrote
    D.check((j.projects || []).length === G.total && (j.unavailable || ['?']).length === 0, 'd0_snapshot_file B:READ', 'projects=' + (j.projects || []).length + ' unavailable=' + JSON.stringify(j.unavailable) + ' orders=' + (j.orders || []).length + ' issues=' + (j.issues || []).length);
    if (p) await D.aim(D.screenBox(p.x - 6, p.y - 4, p.w + 12, p.h + 8, p.t), { label: p.t });
    D.cue('d0_done', { line: p ? p.t : '' }); await D.sleep(3000); D.cue('d0_end');
  };

  // ---------------- d1: D1 (+ D5's first half): the dashboard page; Total Projects and Active Projects; the number clicked, the panel's row count
  const openDash = async () => { await D.aimClick(D.screenBox(1500, 54, 200, 28, 'Chrome (its toolbar)'), { label: 'the browser' }); await D.key('ctrl+t', 'a new tab'); await D.sleep(1200); await D.usePage(/^(about:blank|chrome:\/\/new-tab-page|chrome:\/\/newtab)/); await D.page.bringToFront();
    await D.aimClick(OMNIBOX, { label: 'the address bar' }); await D.type(DASH); await D.key('Return', 'open the dashboard'); await D.waitUrl(/capex\/index\.html\?source=legacy/, 60000);
    return until(() => { const e = document.querySelector('[data-drill="total_projects"] [data-flat]'); return e && /\d/.test(e.innerText); }, 60000); };
  const onDash = async () => { if (!/capex\/index\.html/.test(D.page.url())) { await D.usePage(/capex\/index\.html/); await D.page.bringToFront(); await D.sleep(800); } };   // a re-take on its own (not filmed)
  const home = async () => { await closePanel(); if (!(await D.page.locator('[data-drill="total_projects"]:visible').count())) { const b = D.page.locator('#view a, #view button', { hasText: /^‹ Dashboard$/ }).first(); if (await b.count()) await D.aimClick(b, { label: '‹ Dashboard' }); else await D.aimClick('[data-view="dashboard"]', { label: 'Dashboard (left menu)' }); await until(() => !!document.querySelector('[data-drill="total_projects"] [data-flat]'), 15000); await D.sleep(800); } };
  S.d1 = async () => {
    D.cue('d1_start'); const ok = await openDash(); if (!D.check(!!ok, 'd1_dashboard_shown')) return; await D.sleep(2500);
    const tp = await tile('total_projects'), ap = await tile('active_projects'); D.cue('d1_tiles');
    D.check(new RegExp('\\b' + G.total + '\\b').test(tp), 'd1_total_projects_' + G.total, JSON.stringify(tp)); D.check(new RegExp('\\b' + G.active + '\\b').test(ap), 'd1_active_projects_' + G.active, JSON.stringify(ap));
    await D.aim('[data-drill="total_projects"] [data-flat]', { label: 'Total Projects ' + G.total }); await D.sleep(1500);
    const p = await drill('[data-drill="total_projects"] [data-flat]', 'the number (Total Projects)'); D.cue('d1_panel');
    D.check(!!p && p.n === G.total && p.rows.length === G.total, 'd1_panel_row_count_is_the_figure', p ? 'rows=' + p.rows.length + ' count=' + p.n : 'no panel');   // guide D1: 'its row count is the figure'
    D.check(!!p && p.rows.some(r => r.v === G.d6.project), 'd5_panel_lists_projects', p ? p.rows.map(r => r.v).join(',') : '');
    H.stSet('d.total', String(G.total)); await D.sleep(2500); D.cue('d1_end');
  };
  PREP.d1 = async () => { for (const pg of D.pages()) if (/capex\/index\.html/.test(pg.url())) await pg.close().catch(() => {}); await H.onIdemp(); };
  // ---------------- d2: D2 Approved Budget; the panel's Approved column added; ERP ↗ on a project: iDempiere's Project window, Planned Amount
  S.d2 = async () => {
    D.cue('d2_start'); await home(); const ab = await tile('approved_budget'); D.check(ab.replace(/\s/g, '').indexOf('USD' + G.approved) >= 0, 'd2_approved_budget_tile', JSON.stringify(ab));
    D.check(!!G.approvedBdt && ab.replace(/\s/g, '').indexOf(G.approvedBdt.replace(/\s/g, '')) >= 0, 'd2_approved_budget_bdt_tile', JSON.stringify(ab) + ' guide ' + G.approvedBdt);   // D2: the Bangladesh pack's own figure, with the USD bracket
    await D.aim('[data-drill="approved_budget"] [data-flat]', { label: 'Approved Budget' }); await D.sleep(1200);
    const p = await drill('[data-drill="approved_budget"] [data-flat]', 'the number (Approved Budget)'); if (!D.check(!!p, 'd2_panel_opened')) return; D.cue('d2_panel');
    D.check(sum(p.rows, 'approved') === num(G.approved), 'd2_panel_approved_column_adds_up', 'sum of ' + p.rows.filter(r => r.cur === 'USD').length + ' USD rows = ' + sum(p.rows, 'approved') + ' (guide ' + G.approved + ')');
    const pr = G.d6.project, r = p.rows.find(x => x.v === pr), tr = D.page.locator('#drill tbody tr', { has: D.page.locator('a.open', { hasText: new RegExp('^' + pr + '$') }) }).first();
    await D.scrollIn(tr, '#drill', 40).catch(() => {}); const before = D.pages().length; D.cue('d2_erp'); await D.aimClick(tr.locator('a.erp'), { label: 'ERP ↗ (' + pr + ')' });
    for (let i = 0; i < 80 && D.pages().length === before; i++) await D.sleep(250);
    D.fastStart('iDempiere opens the Project window'); await D.usePage(/Action=Zoom/);   // two tabs are titled 'iDempiere' now: the new one is known by its address
    const inst = await until(() => { const e = [...document.querySelectorAll('[instancename]')].find(x => x.getBoundingClientRect().width > 0 && /^C_Project\d+PlannedAmt$/.test(x.getAttribute('instancename'))); return e ? e.getAttribute('instancename') : null; }, 90000); D.fastEnd();
    if (!D.check(!!inst, 'd2_project_window_opened_by_erp_link')) return; await zk.idle(1500);
    const pv = await zk.val(await zk.inst('C_Project', 'Value')), pa = await zk.val(inst); await zk.reveal(zk.f(inst)); await D.aim(zk.f(inst), { label: 'Planned Amount ' + pa }); D.cue('d2_planned', { planned: pa });
    D.check(pv === pr && num(pa) === num(r.approved), 'd2_planned_amount_equals_panel', pv + ' Planned Amount ' + pa + ' panel Approved ' + r.approved);
    const ps = num(sql("select coalesce(sum(ph.plannedamt),0) from c_projectphase ph join c_project p on p.c_project_id=ph.c_project_id where p.value='" + pr + "'"));   // B:READ (declared): the Phase tab's Planned Amount column added
    D.check(ps === num(pa), 'd2_equals_sum_of_phase_planned B:READ', 'phases ' + ps + ' project ' + pa);
    await D.sleep(2500); await D.key('ctrl+w', 'close this tab'); await D.sleep(1200); await D.waitUrl(/capex\/index\.html/, 15000); D.cue('d2_end');
  };
  // ---------------- d2b: D2b the Budget tile: Within / Over / Not started; the Over row clicked: the two projects, Spent against Approved
  S.d2b = async () => {
    D.cue('d2b_start'); await home(); const t = await tile('budget_status');
    D.check(new RegExp('Within\\D*' + G.within + '\\D+Over\\D*' + G.over + '\\D+Not Started\\D*' + G.notstarted + '\\b', 'i').test(t), 'd2b_within_over_notstarted', JSON.stringify(t.slice(0, 120)) + ' (guide ' + [G.within, G.over, G.notstarted].join('/') + ')');
    await D.aim('[data-tile="budget_status"]', { label: 'Budget Status' }); await D.sleep(1500);
    const p = await drill('[data-drill="budget:over"] b, [data-drill="budget:over"]', 'Over Budget (its number)'); if (!D.check(!!p, 'd2b_panel_opened')) return; D.cue('d2b_over');
    for (const g of G.overRows) { const r = p.rows.find(x => x.v === g.project); D.check(!!r && num(r.spent) === num(g.spent) && num(r.approved) === num(g.plan), 'd2b_over_' + g.project, r ? 'Spent ' + r.spent + ' Approved ' + r.approved + ' (guide ' + g.spent + ' against ' + g.plan + ')' : 'not in the panel: ' + p.rows.map(x => x.v).join(',')); }
    D.check(p.rows.length === G.over, 'd2b_over_rows', 'rows=' + p.rows.length); await D.sleep(3000); await closePanel(); D.cue('d2b_end');
  };
  // ---------------- d3: D3 Actual Cost (Spent): the tile, its percentage of plan, the panel's Spent column added
  S.d3 = async () => {
    D.cue('d3_start'); await home(); const t = await tile('actual_cost'), f = t.replace(/\s/g, '');
    D.check(f.indexOf('USD' + G.spent) >= 0, 'd3_actual_cost_tile', JSON.stringify(t)); D.check(!!G.spentBdt && f.indexOf(G.spentBdt.replace(/\s/g, '')) >= 0, 'd3_actual_cost_bdt_tile', JSON.stringify(t) + ' guide ' + G.spentBdt); D.check(new RegExp('USD' + G.pct + '(\\.\\d+)?%').test(f), 'd3_percent_of_plan_' + G.pct, JSON.stringify(t));
    { const bp = Math.round(100 * num((/BDT ([\d,.]+)/.exec(G.spentBdt) || [])[1]) / num((/BDT ([\d,.]+)/.exec(G.approvedBdt) || [])[1])); D.check(new RegExp('BDT' + bp + '(\\.\\d+)?%').test(f), 'd3_bdt_percent_of_plan_' + bp, JSON.stringify(t)); }   // each tile has its own % of plan (D3)
    await D.aim('[data-drill="actual_cost"] [data-flat]', { label: 'Actual Cost' }); await D.sleep(1200);
    const p = await drill('[data-drill="actual_cost"] [data-flat]', 'the number (Actual Cost)'); if (!D.check(!!p, 'd3_panel_opened')) return; D.cue('d3_panel');
    // the panel prints each project's Spent to the cent while Project Balance holds 4 decimals (find C4.4): the column a tester adds can differ from the tile by the rounding,
    // at most half a cent a row. Within that bound the check passes and the difference is a FIND for the change list.
    const ss = sum(p.rows, 'spent'), tol = r2(0.005 * p.rows.filter(r => num(r.spent) > 0).length);
    D.check(Math.abs(ss - num(G.spent)) <= tol, 'd3_panel_spent_column_adds_up', 'sum = ' + ss + ' (guide ' + G.spent + ', rounding bound ' + tol + ')');
    if (ss !== num(G.spent)) find('D3_spent_column_rounding', 'adding the panel\'s Spent column gives ' + ss + ', the tile reads ' + G.spent + ': each row is rounded to the cent, Project Balance holds 4 decimals');
    const bal = num(sql("select coalesce(sum(projectbalanceamt),0) from c_project where value like 'TD\\_%'"));   // B:READ (declared): Project Balance of the 12 test projects (C4.4)
    D.check(r2(bal) === num(G.spent), 'd3_equals_project_balances B:READ', 'sum of Project Balance = ' + bal); await D.sleep(3000); await closePanel(); D.cue('d3_end');
  };
  // ---------------- d4: D4 Procurement Risks (left menu): the open purchase orders; then one scene per project: its page, Procurement tab, the Supply chain stage
  S.d4 = async () => {
    D.cue('d4_start'); await closePanel(); await D.aimClick('[data-view="procurement"]', { label: 'Procurement Risks (left menu)' }); await D.sleep(2000);
    const t = await txt('[data-drill="proc:openpo"]'); D.cue('d4_openpo'); const m = /(\d+)\s*·\s*USD\s*([\d,.]+)/.exec(t) || [];
    // B:READ (declared): the Grand Total of the film's own Drafted orders, as each Purchase Order window showed it in chapter C
    const dr = num(sql("select coalesce(sum(o.grandtotal),0) from c_order o join c_project p on p.c_project_id=o.c_project_id where p.value like 'TD\\_%' and o.issotrx='N' and o.docstatus='DR'"));
    D.check(+m[1] === G.openN, 'd4_open_orders_count_' + G.openN, JSON.stringify(t));
    D.check(num(m[2]) === r2(dr), 'd4_open_orders_amount_is_the_drafted_orders_total', 'page ' + m[2] + ' drafted orders ' + dr + ' (guide ' + G.openAmt + ')');
    if (num(m[2]) !== num(G.openAmt)) find('D4_open_orders_amount', 'Open purchase orders reads USD ' + m[2] + ' after chapter C by hand (the order window rounds the price to 2 decimals, find C1.1); the guide says ' + G.openAmt);
    await D.aim('[data-drill="proc:openpo"]', { label: 'Open purchase orders' }); await D.sleep(3500); D.cue('d4_end');
  };
  const projPage = async (pr) => {   // the dashboard, a number clicked, the project's name in the panel clicked: its page
    if (!(await D.page.locator('[data-drill="total_projects"]:visible').count())) { await D.aimClick('[data-view="dashboard"]', { label: 'Dashboard (left menu)' }); await until(() => !!document.querySelector('[data-drill="total_projects"] [data-flat]'), 15000); await D.sleep(800); }
    await closePanel(); const p = await drill('[data-drill="total_projects"] [data-flat]', 'the number (Total Projects)'); if (!p) return false;
    const a = D.page.locator('#drill a.open', { hasText: new RegExp('^' + pr + '$') }).first(); await D.scrollIn(a, '#drill', 40).catch(() => {}); await D.aimClick(a, { label: pr + ' (in the panel)' });
    return !!(await until(v => /#project\//.test(location.hash) && !!document.querySelector('[data-tab]') && document.getElementById('view').innerText.indexOf(v) >= 0, 15000, pr)); };
  const chainScene = (g) => async () => {
    const id = 'd4_' + g.project; D.cue(id + '_start', { project: g.project, stage: g.stage }); if (!D.check(await projPage(g.project), id + '_page_opened')) return;
    await D.aimClick('[data-tab="procurement"]', { label: 'Procurement (tab)' }); await D.sleep(1500); D.cue(id + '_chain');
    const rows = await D.page.evaluate(() => [...document.querySelectorAll('.card tr[data-order]')].map(r => ({ order: r.getAttribute('data-order'), stage: r.getAttribute('data-stage'), text: r.innerText.replace(/\s+/g, ' ').trim() })));
    const co = H.ST()['order.' + g.project + '.co'], mine = rows.find(r => String(r.order) === String(co) || r.text.indexOf(String(co)) >= 0) || rows.find(r => r.stage === g.stage);
    D.check(!!mine && mine.stage === g.stage, id + '_stage_' + g.stage, JSON.stringify(rows.map(r => r.text.slice(0, 90))) + ' completed order ' + co);   // guide D4
    const tr = D.page.locator('.card tr[data-stage="' + g.stage + '"]').first(); if (await tr.count()) await D.aim(tr, { label: g.project + ': ' + g.stage }); await D.sleep(2500); D.cue(id + '_end');
  };
  for (const g of G.stages) { S['d4_' + g.project] = chainScene(g); PREP['d4_' + g.project] = onDash; }
  H.chainScenes = G.stages.map(g => 'd4_' + g.project);
  // ---------------- d5: D5 + D6: a number, the panel, a project: its page; Overview (Approved, phases); Schedule (the phase bars, the first ones Complete)
  S.d5 = async () => {
    const g = G.d6; D.cue('d5_start'); if (!D.check(await projPage(g.project), 'd5_project_page_opened')) return; D.cue('d5_page');
    await D.aimClick('[data-tab="overview"]', { label: 'Overview (tab)' }); await D.sleep(1200); const ov = (await txt('#view')).replace(/USD\s*/g, 'USD');
    D.check(ov.indexOf('ApprovedUSD' + g.approved) >= 0 || new RegExp('Approved\\s*USD' + g.approved.replace('.', '\\.')).test(ov), 'd6_overview_approved_' + g.approved, JSON.stringify(ov.slice(ov.indexOf('Approved'), ov.indexOf('Approved') + 60)));
    D.check(new RegExp('\\b' + g.phases + ' phases').test(ov), 'd6_overview_' + g.phases + '_phases'); D.cue('d5_overview'); await D.sleep(2500);
    await D.aimClick('[data-tab="schedule"]', { label: 'Schedule (tab)' }); await D.sleep(1500);
    const bars = await D.page.evaluate(() => [...document.querySelectorAll('rect.pbar')].map(x => x.getAttribute('data-status')));
    D.check(bars.length === g.phases, 'd6_schedule_' + g.phases + '_bars', JSON.stringify(bars)); D.check(bars.slice(0, g.complete).every(s => /complete/i.test(s)) && bars.filter(s => /complete/i.test(s)).length === g.complete, 'd6_first_' + g.complete + '_complete', JSON.stringify(bars));
    const b = D.page.locator('rect.pbar').first(); if (await b.count()) await D.aim(b, { label: 'the first phase bar' }); D.cue('d5_schedule'); await D.sleep(3000); D.cue('d5_end');
  };
  // ---------------- d7: D7 ƒ formula under a tile
  S.d7 = async () => {
    D.cue('d7_start'); await home(); const s = '[data-drill="total_projects"] details summary'; await D.aimClick(s, { label: 'ƒ formula (Total Projects)' }); await D.sleep(1000);
    const f = await txt('[data-drill="total_projects"] details'), open = await D.page.evaluate(() => document.querySelector('[data-drill="total_projects"] details').open);
    D.check(open && /C_Project/.test(f), 'd7_formula_shown', JSON.stringify(f)); D.cue('d7_formula', { formula: f.slice(0, 120) }); await D.sleep(3500);
    await D.aimClick(s, { label: 'ƒ formula (close)' }); await closePanel(); D.cue('d7_end');
  };
  // ---------------- d8: D8 Layout -> Executive, Skin -> Dark, then back to Classic and Light: the same figures
  const nums = () => D.page.evaluate(() => { const o = {}; document.querySelectorAll('[data-drill]').forEach(e => { o[e.getAttribute('data-drill')] = (e.innerText.match(/\d[\d,]*(\.\d+)?/g) || [''])[0]; }); return o; });
  const sel = id => D.page.evaluate(i => { const s = document.getElementById(i); return s.options[s.selectedIndex].text; }, id);
  const pick = async (id, text, label) => { await D.pickSelect('#' + id, text, label); await D.sleep(1200); const v = await sel(id); return D.check(v === text, 'd8_' + id + '_reads_' + text, JSON.stringify(v)); };
  S.d8 = async () => {
    D.cue('d8_start'); await home(); const n0 = await nums();
    if (!(await pick('fTheme', 'Executive', 'Layout'))) return; D.cue('d8_executive'); const ex = (await txt('#view')).replace(/USD\s*/g, 'USD '), n1 = await nums();
    D.check(!!G.approvedBdt && ex.replace(/USD /g, 'USD').replace(/\s/g, '').indexOf(G.approvedBdt.replace(/USD /g, 'USD').replace(/\s/g, '')) >= 0, 'd8_executive_bdt_figure', G.approvedBdt + ' on the page');
    D.check(ex.indexOf(G.approved) >= 0 && ex.indexOf(G.spent) >= 0, 'd8_executive_same_figures', G.approved + ' and ' + G.spent + ' on the page: ' + (ex.indexOf(G.approved) >= 0) + '/' + (ex.indexOf(G.spent) >= 0));
    D.check(ex.indexOf(G.execLabel) >= 0, 'd8_executive_relabelled_' + G.execLabel.replace(/\s+/g, '_')); const same = Object.keys(n1).filter(k => n0[k] !== undefined && n0[k] !== n1[k]);
    D.check(Object.keys(n1).length > 0 && Object.keys(n1).length < Object.keys(n0).length && !same.length, 'd8_fewer_tiles_same_numbers', 'classic ' + Object.keys(n0).length + ' executive ' + Object.keys(n1).length + ' changed=' + JSON.stringify(same)); await D.sleep(2500);
    if (!(await pick('fSkin', 'Dark', 'Skin'))) return; const bg1 = await D.page.evaluate(() => getComputedStyle(document.body).backgroundColor); D.cue('d8_dark'); await D.sleep(2500);
    if (!(await pick('fTheme', 'Classic', 'Layout'))) return; if (!(await pick('fSkin', 'Light', 'Skin'))) return; const bg2 = await D.page.evaluate(() => getComputedStyle(document.body).backgroundColor), n2 = await nums();
    D.check(bg1 !== bg2, 'd8_look_changes', 'dark ' + bg1 + ' light ' + bg2); D.check(JSON.stringify(n2) === JSON.stringify(n0), 'd8_classic_shows_them_all_again', 'tiles ' + Object.keys(n2).length); await D.sleep(2000); D.cue('d8_end');
  };
  for (const k of ['d2', 'd2b', 'd3', 'd4', 'd5', 'd7', 'd8']) PREP[k] = onDash;
  // ---------------- d9: D9 log in to iDempiere again; the Home tab's CAPEX goals show the dashboard's counts
  const goals = async () => ((await zk.body()).match(/CAPEX [A-Za-z() ]+: ?[^ ]+/g) || []);
  S.d9 = async () => {
    // the iDempiere tab is found where a person finds it: its title in Chrome's tab strip, read off the screen (the browser's own page list is not in strip order)
    D.cue('d9_start'); const tt = await D.findText(t => /^iDempiere$/.test(t), D.screenBox(0, 0, 1700, 46, 'the tab strip'), 4, true); if (!D.check(!!tt, 'd9_idempiere_tab_read', tt ? 'at ' + tt.x + ',' + tt.y : 'not read')) return;
    await D.aimClick(D.screenBox(tt.x - 10, tt.y - 8, tt.w + 40, tt.h + 16, 'the iDempiere tab'), { label: 'the iDempiere tab' }); await D.sleep(900); if (!(await D.waitUrl(/8108\/webui/, 10000))) return;
    // guide D9: Home goals are recalculated only when older than 30 minutes; the film logged in at c0 (§FILM_HOME_OPENED), chapter C and D took longer than that
    const t0 = Number(H.ST()['home.opened'] || 0), age = t0 ? Math.round((D.now() - t0) / 60) : -1; D.log('§FILM_D9_HOME_AGE minutes=' + age + ' (guide: older than 30 -> just log in again)');
    let lo = D.page.locator('a:visible, button:visible, .z-toolbarbutton:visible, .z-menuitem:visible', { hasText: /^\s*Log Out\s*$/ }).first();
    if (!(await lo.count())) { const up = D.page.locator('.desktop-user-panel:visible .z-toolbarbutton, .desktop-user-panel:visible a, .desktop-user-panel:visible .z-label').first(); await D.aimClick(up, { label: 'the user name (top right)' }); await D.sleep(1200); lo = D.page.locator('a:visible, button:visible, .z-toolbarbutton:visible, .z-menuitem:visible', { hasText: /^\s*Log Out\s*$/ }).first(); }
    if (!D.check(await lo.count() > 0, 'd9_log_out_found')) return; D.cue('d9_logout'); await D.aimClick(lo, { label: 'Log Out' }); await D.sleep(1500);
    // Log Out asks nothing: the log in form comes straight back (measured 2026-11-20; an 'OK' pressed here would be the form's own, with the boxes Chrome filled in)
    await D.page.waitForFunction(() => document.querySelectorAll('input.z-textbox').length >= 2 && !document.querySelector('input.z-bandbox-input[placeholder="Alt+G"]'), null, { timeout: 60000 }); await D.sleep(1500); D.cue('d9_login');
    await H.loginForm('d9'); D.fastStart('the Home tab loads its goals'); let g = []; for (let k = 0; k < 80 && !g.length; k++) { g = await goals(); if (!g.length) await D.sleep(500); } await D.sleep(4000); g = await goals(); D.fastEnd();
    D.log('§FILM_D9_GOALS ' + JSON.stringify(g)); const tot = g.find(x => /^CAPEX Total Projects/.test(x)) || '', act = g.find(x => /^CAPEX Active Projects/.test(x)) || '';
    D.check(new RegExp(':\\s*' + G.total + '$').test(tot), 'd9_home_total_projects_equals_tile', JSON.stringify(tot) + ' tile ' + G.total);
    if (act) D.check(new RegExp(':\\s*' + G.active + '$').test(act), 'd9_home_active_projects_equals_tile', JSON.stringify(act) + ' tile ' + G.active);
    const apg = g.find(x => /^CAPEX Approved Budget/.test(x)) || ''; if (G.homeApproved) D.check(new RegExp(':\\s*' + G.homeApproved.replace(',', ',?') + '$').test(apg), 'd9_home_approved_budget_as_guide', JSON.stringify(apg) + ' guide ' + G.homeApproved);   // D9: 4,668 (the login's currency, USD; SHED's BDT stays on the dashboard)
    const gl = D.page.locator('.z-label:visible, a:visible, span:visible', { hasText: /^CAPEX Total Projects/ }).first(); if (await gl.count()) await D.aim(gl, { label: 'CAPEX Total Projects (Home)' }); D.cue('d9_goals'); await D.sleep(4000); D.cue('d9_end');
  };
  PREP.d9 = async () => {};
  H.dScenes = ['d0', 'd1', 'd2', 'd2b', 'd3', 'd4'].concat(H.chainScenes, ['d5', 'd7', 'd8', 'd9']);
};
