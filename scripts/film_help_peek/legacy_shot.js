// ⚠ DO NOT REMOVE — v3 (§19.22): the SHOT TAB is now Invoice (Customer) tab 263 (CFG below), not Shipment 257 / Sales Order 186: legacy's ZK keeps a tab's context-help text in a static cache that never expires (MCtxHelpMsg.java:51), and v1/v2 shot those two tabs, so they would show OLD wording (ticks, 'When it refuses', a file name) beside the v3 film. A tab nobody shot before shows the current text; hasOurs below requires the v3 wording ('You need these first', 'What can stop Complete').
// ⚠ DO NOT REMOVE — SCOPE: film "Read from legacy's own code" beat 8 (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.20; owner OK 2026-11-24: "apply, shoot, remove"; adapted from film_ctxhelp_cms/legacy_shot.js §19.18). READ THE LOG after every run.
//   On the SHARED legacy pilot (docker postgres `idempiere_pilot`, ZK on :8088): (0) refuse unless the pilot is as measured clean (our UUIDs absent, 0 links); (1) apply bim-ootb's
//   erp/legacy/local_sql/postgresql/*_KernelERP_ContextHelp.sql in ONE committed transaction (as RUN_SyncDB would run it); (2) shoot legacy's OWN How To panel on a Sales Order (ZK, headless,
//   GardenAdmin); (3) ALWAYS remove our rows by their UUIDs, reset the links and restore the two sequences and the targets' Updated stamps; (4) witness the pilot back: counts, sequences,
//   stamps equal the snapshot. Never touches the oracle DB `idempiere`. READ out/legacy.log. Usage: node legacy_shot.js <bim-ootb main tree>
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const TREE = path.resolve(process.argv[2]), OUT = path.join(__dirname, process.env.OUTD || 'out'), PAGES = path.join(OUT, 'pages'), DB = 'idempiere_pilot', ZK = process.env.ZK || 'http://localhost:8088/webui/';
if (DB === 'idempiere') throw new Error('never the oracle DB');
const LOG = [], L = (m) => { LOG.push(m); console.log(m); }, save = () => fs.writeFileSync(path.join(OUT, 'legacy.log'), LOG.join('\n') + '\n');
const psql = (sql) => { const r = spawnSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'adempiere', '-d', DB, '-At', '-F', '|', '-v', 'ON_ERROR_STOP=1'], { input: 'SET search_path=adempiere;\n' + sql, encoding: 'utf8', maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error('psql: ' + String(r.stderr).split('\n').filter((x) => /ERROR/.test(x)).join(' | ').slice(0, 300)); return r.stdout.split('\n').filter((x) => x && x !== 'SET'); };
const T = JSON.parse(fs.readFileSync(path.join(TREE, 'erp', 'legacy', 'ctxhelp_targets.json'), 'utf8')), SQLF = path.join(TREE, 'erp', T.file);
const huu = T.targets.map((t) => "'" + t.huu + "'").join(','), muu = T.targets.map((t) => "'" + t.muu + "'").join(',');
const tabs = T.targets.filter((t) => t.kind === 'T').map((t) => t.id), procs = T.targets.filter((t) => t.kind === 'P').map((t) => t.id);
const state = () => { const r = psql("SELECT (SELECT count(*) FROM AD_CtxHelp) || '|' || (SELECT count(*) FROM AD_CtxHelpMsg) || '|' || (SELECT count(*) FROM AD_CtxHelpMsg_Trl) || '|' || (SELECT count(*) FROM AD_Tab WHERE AD_CtxHelp_ID IS NOT NULL) || '|' || (SELECT count(*) FROM AD_Process WHERE AD_CtxHelp_ID IS NOT NULL) || '|' || (SELECT count(*) FROM AD_CtxHelp WHERE AD_CtxHelp_UU IN (" + huu + "));" +
  "SELECT Name || '|' || CurrentNext FROM AD_Sequence WHERE Name IN ('AD_CtxHelp','AD_CtxHelpMsg') AND IsTableID='Y' ORDER BY Name;" +
  "SELECT 'T' || AD_Tab_ID || '|' || Updated FROM AD_Tab WHERE AD_Tab_ID IN (" + tabs.join(',') + ") UNION ALL SELECT 'P' || AD_Process_ID || '|' || Updated FROM AD_Process WHERE AD_Process_ID IN (" + procs.join(',') + ') ORDER BY 1;');
  const c = r[0].split('|').map(Number); return { helps: c[0], msgs: c[1], trl: c[2], tabLinks: c[3], procLinks: c[4], ours: c[5], seq: r.slice(1, 3).join(' '), stamps: r.slice(3).join(';') }; };
const CFG = { table: 'C_Order', tab: 294, head: 'Purchase Order', own: /Order Header/ };   // the tab nobody opened in ZK since the server started: its text is read at the FIRST open, so the target must not be opened before the apply (neutral login below)
const F = { db: DB, script: T.file, cfg: { table: CFG.table, tab: CFG.tab } };
(async () => {
  const s0 = state(); F.before = { helps: s0.helps, msgs: s0.msgs, trl: s0.trl, tabLinks: s0.tabLinks, procLinks: s0.procLinks, seq: s0.seq };
  L('§LEGACY_STATE before ' + JSON.stringify(F.before) + ' ours=' + s0.ours);
  if (s0.ours !== 0 || s0.tabLinks !== 0 || s0.procLinks !== 0) { L('§LEGACY_REFUSED the pilot is not clean (our rows or links present): nothing applied'); save(); process.exit(3); }
  let shotOk = false, removed = false;
  try {
    const tid = Number(psql("SELECT AD_Table_ID FROM AD_Table WHERE TableName='" + CFG.table + "';")[0]); F.tableId = tid;
    const rec = psql("SELECT C_Order_ID || '|' || DocumentNo FROM C_Order WHERE AD_Client_ID=11 AND IsSOTrx='N' AND IsActive='Y' AND DocStatus='CO' ORDER BY C_Order_ID DESC LIMIT 1;")[0].split('|'); F.order = { id: Number(rec[0]), no: rec[1] };
    const { chromium } = require(process.env.PW || path.join(os.homedir(), 'bim-ootb', 'tests', 'node_modules', 'playwright'));
    const br = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
    const WIN = 620;   // the height of the crop the cards show (cards.js `lower`), in screenshot pixels
    try {
      // legacy's own ZK page, headless on the CPU: login GardenAdmin, the role page's OK, then zoom to a completed customer shipment (Shipment (Customer), header tab 257)
      const newPage = async () => { const page = await (await br.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 })).newPage();
        await page.goto(ZK + 'index.zul', { waitUntil: 'load', timeout: 90000 }); await page.waitForTimeout(6000);
        const tb = page.locator('input.z-textbox:visible'); await tb.nth(0).fill('GardenAdmin'); await tb.nth(1).fill('GardenAdmin'); await page.click('button.login-btn.btn-ok'); await page.waitForTimeout(6000);
        for (let i = 0; i < 3; i++) { const ok = page.locator('button.btn-ok:visible'); if (await ok.count()) { await ok.first().click(); await page.waitForTimeout(6000); } else break; } return page; };
      const helpTxt = (page) => page.evaluate(() => Array.from(document.querySelectorAll('.help-content')).map((e) => e.innerText).join('\n---\n'));
      const waitTxt = async (page, re, n) => { let t = ''; for (let i = 0; i < (n || 40); i++) { t = await helpTxt(page); if (re.test(t)) return t; await page.waitForTimeout(1000); } return t; };
      // geometry of the panel's scroll box, and of the elements a still must show, all measured in the page (never placed by hand)
      const measure = (page, must) => page.evaluate((must) => { const e = Array.from(document.querySelectorAll('.help-content')).find((x) => /Order Header/.test(x.innerText)); if (!e) return null; const R = (b) => ({ x: Math.round(b.x * 1.5), y: Math.round(b.y * 1.5), w: Math.round(b.width * 1.5), h: Math.round(b.height * 1.5) });
        let sc = null; for (let p = e; p && p !== document.body; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.overflowY !== 'visible' && p.scrollHeight > p.clientHeight + 2 && p.clientHeight > 100) { sc = p; break; } }
        const find = (sp) => { let els = Array.from(e.querySelectorAll(sp.sel)); if (sp.text) els = els.filter((x) => x.textContent.trim().indexOf(sp.text) === 0); const x = els[sp.nth || 0]; return x ? (sp.block ? (x.closest('p,ul,li') || x) : x) : null; };
        return { box: sc ? R(sc.getBoundingClientRect()) : null, scrolled: sc ? sc.scrollTop : null, must: (must || []).map((m) => { const x = find(m); return { text: m.text || m.sel, rect: x ? R(x.getBoundingClientRect()) : null }; }) }; }, must);
      const scrollTo = (page, sp, align) => page.evaluate(([sp, align]) => { const e = Array.from(document.querySelectorAll('.help-content')).find((x) => /Order Header/.test(x.innerText)); let els = Array.from(e.querySelectorAll(sp.sel)); if (sp.text) els = els.filter((x) => x.textContent.trim().indexOf(sp.text) === 0); const x = els[sp.nth || 0]; (sp.block ? (x.closest('p,ul,li') || x) : x).scrollIntoView({ block: align }); return !!x; }, [sp, align]);
      // one still: scroll, measure, check every must-show element lies inside the crop window, shoot. align 'start' crops the top WIN px of the scroll box, 'end' the bottom WIN px.
      const still = async (page, name, sp, align, must) => { await scrollTo(page, sp, align); await page.waitForTimeout(900); const m = await measure(page, must), box = m && m.box;
        const crop = box ? { x: box.x, y: align === 'end' ? box.y + box.h - Math.min(WIN, box.h) : box.y, w: box.w, h: Math.min(WIN, box.h) } : null;
        const inside = crop && m.must.every((q) => q.rect && q.rect.y >= crop.y - 2 && q.rect.y + q.rect.h <= crop.y + crop.h + 2); await page.screenshot({ path: path.join(PAGES, name + '.png') });
        const o = { file: 'pages/' + name + '.png', crop, box, must: m && m.must, inside: !!inside }; L('§LEGACY_SHOT ' + name + ' ' + JSON.stringify({ crop, inside: !!inside, must: m && m.must.map((q) => q.text + '@' + (q.rect ? q.rect.y + '+' + q.rect.h : 'none')) })); return o; };
      let page = await newPage();   // logged in BEFORE the apply; a 'before' shot of legacy's panel is NOT taken: legacy's MCtxHelpMsg cache (MCtxHelpMsg.java:51, never expires) keeps a tab's text from an earlier apply after its rows are removed, so a before picture could not be trusted (§LEGACY_CACHE below)
      L('§LEGACY_CACHE legacy keeps a tab\'s context-help text in a static cache that never expires (MCtxHelpMsg.java:51); no before-picture is taken, and the panel picture below may be served from an earlier apply of the same script; the rows themselves are proved by §LEGACY_LOOKUP and the counts');
      psql('BEGIN;\n' + fs.readFileSync(SQLF, 'utf8') + '\nCOMMIT;'); const s1 = state(); F.applied = { helps: s1.helps, msgs: s1.msgs, trl: s1.trl, tabLinks: s1.tabLinks, procLinks: s1.procLinks, seq: s1.seq };
      L('§LEGACY_APPLIED ' + JSON.stringify(F.applied));
      const look = psql("SELECT h.AD_CtxHelp_UU || '|' || length(m.MsgText) FROM AD_Tab t JOIN AD_CtxHelp h ON h.AD_CtxHelp_ID=t.AD_CtxHelp_ID JOIN AD_CtxHelpMsg m ON m.AD_CtxHelp_ID=h.AD_CtxHelp_ID AND m.AD_Client_ID=0 WHERE t.AD_Tab_ID=294;")[0] || '';
      F.lookup257 = { uu: look.split('|')[0], len: Number(look.split('|')[1]), ours: look.split('|')[0] === T.targets.find((t) => t.kind === 'T' && t.id === CFG.tab).huu }; L('§LEGACY_LOOKUP tab=257 ' + JSON.stringify(F.lookup257));
      // AFTER: the same session first (reload of the record), a fresh login if legacy's server kept the old window
      await page.goto(ZK + 'index.zul?Action=Zoom&AD_Table_ID=' + tid + '&Record_ID=' + F.order.id, { waitUntil: 'load', timeout: 90000 }); await page.waitForTimeout(5000);
      let txt = await waitTxt(page, /What Complete does/, 25); F.reloadSame = /What Complete does/.test(txt);
      if (!F.reloadSame) { L('§LEGACY_STALE the same ZK session did not show the new topic; fresh login'); await page.context().close(); page = await newPage(); await page.goto(ZK + 'index.zul?Action=Zoom&AD_Table_ID=' + tid + '&Record_ID=' + F.order.id, { waitUntil: 'load', timeout: 90000 }); await page.waitForTimeout(5000); txt = await waitTxt(page, /What Complete does/, 40); }
      F.zk = { panel: txt.slice(0, 7000), hasOwn: /Order Header/.test(txt), hasOurs: /You need these first/.test(txt) && /What Complete does/.test(txt) && /What can stop Complete/.test(txt), title: await page.title(), fresh: !F.reloadSame };
      F.zk.shots = {
        top: await still(page, 'legacy_ship_a', { sel: 'b', text: 'Before you start.', block: true }, 'start', [{ sel: 'b', text: 'Before you start.', block: true }, { sel: 'b', text: 'Do it.', block: true }]),
        complete: await still(page, 'legacy_ship_b', { sel: 'b', text: 'What Complete does.', block: true }, 'start', [{ sel: 'b', text: 'What Complete does.', block: true }]) };
      const q = await page.evaluate(() => { const e = Array.from(document.querySelectorAll('.help-content')).find((x) => /Order Header/.test(x.innerText)); const p = Array.from(e.querySelectorAll('p')).find((x) => /^What can stop Complete/.test(x.textContent.trim())); return p ? p.textContent : ''; });
      F.zk.more = (/and (\d+) more/.exec(q) || []).slice(1); F.zk.ticks = (txt.match(/✓/g) || []).length;
      F.zk.shots.tail = await (async () => { const sp = { sel: 'p', text: 'What can stop Complete', block: true }; await page.evaluate(() => { const e = Array.from(document.querySelectorAll('.help-content')).find((x) => /Order Header/.test(x.innerText)); const p = Array.from(e.querySelectorAll('p')).find((x) => /^What can stop Complete/.test(x.textContent.trim())); p.scrollIntoView({ block: 'end' }); }); await page.waitForTimeout(900);
        const m = await measure(page, [sp]), box = m.box, crop = { x: box.x, y: box.y + box.h - WIN, w: box.w, h: WIN }, r = m.must[0].rect, inside = r.y + r.h <= crop.y + crop.h + 2; await page.screenshot({ path: path.join(PAGES, 'legacy_ship_d.png') });
        L('§LEGACY_SHOT legacy_ship_d ' + JSON.stringify({ crop, paragraph_bottom: r.y + r.h, window_bottom: crop.y + crop.h, tail_inside: inside })); return { file: 'pages/legacy_ship_d.png', crop, box, inside }; })();
      shotOk = F.zk.hasOwn && F.zk.hasOurs && Object.values(F.zk.shots).every((x) => x.crop && x.inside);
      L('§LEGACY_ZK ' + JSON.stringify({ hasOwn: F.zk.hasOwn, hasOurs: F.zk.hasOurs, fresh_login: F.zk.fresh, more: F.zk.more, ticks_in_panel: F.zk.ticks, stills_inside: Object.fromEntries(Object.entries(F.zk.shots).map(([k, v]) => [k, v.inside])), title: F.zk.title, order: F.order, table: tid }) + ' panel="' + txt.replace(/\s+/g, ' ').slice(0, 300) + '"');
    } finally { await br.close(); }
  } catch (e) { L('§LEGACY_ERROR ' + (e && e.stack || e).toString().slice(0, 600)); }
  finally {
    // (3) remove: ours only (by UUID), links only where they hold OUR help, sequences and stamps back to the snapshot
    try {
      const seqs = s0.seq.split(' ').map((x) => x.split('|')), stamps = s0.stamps.split(';').map((x) => x.split('|'));
      psql('BEGIN;\n' +
        'UPDATE AD_Tab SET AD_CtxHelp_ID=NULL WHERE AD_CtxHelp_ID IN (SELECT AD_CtxHelp_ID FROM AD_CtxHelp WHERE AD_CtxHelp_UU IN (' + huu + '));\n' +
        'UPDATE AD_Process SET AD_CtxHelp_ID=NULL WHERE AD_CtxHelp_ID IN (SELECT AD_CtxHelp_ID FROM AD_CtxHelp WHERE AD_CtxHelp_UU IN (' + huu + '));\n' +
        'DELETE FROM AD_CtxHelpMsg_Trl WHERE AD_CtxHelpMsg_ID IN (SELECT AD_CtxHelpMsg_ID FROM AD_CtxHelpMsg WHERE AD_CtxHelpMsg_UU IN (' + muu + '));\n' +
        'DELETE FROM AD_CtxHelpMsg WHERE AD_CtxHelpMsg_UU IN (' + muu + ');\nDELETE FROM AD_CtxHelp WHERE AD_CtxHelp_UU IN (' + huu + ');\n' +
        seqs.map(([n, v]) => "UPDATE AD_Sequence SET CurrentNext=" + Number(v) + " WHERE Name='" + n + "' AND IsTableID='Y';").join('\n') + '\n' +
        stamps.map(([k, v]) => 'UPDATE ' + (k[0] === 'T' ? 'AD_Tab' : 'AD_Process') + " SET Updated='" + v + "' WHERE " + (k[0] === 'T' ? 'AD_Tab_ID' : 'AD_Process_ID') + '=' + Number(k.slice(1)) + ';').join('\n') + '\nCOMMIT;');
      removed = true;
    } catch (e) { L('§LEGACY_REMOVE_ERROR ' + e.message); }
    const s2 = state(); F.after = { helps: s2.helps, msgs: s2.msgs, trl: s2.trl, tabLinks: s2.tabLinks, procLinks: s2.procLinks, seq: s2.seq, ours: s2.ours };
    const back = removed && s2.helps === s0.helps && s2.msgs === s0.msgs && s2.trl === s0.trl && s2.tabLinks === s0.tabLinks && s2.procLinks === s0.procLinks && s2.seq === s0.seq && s2.stamps === s0.stamps && s2.ours === 0;
    F.back = back; L('§LEGACY_STATE after ' + JSON.stringify(F.after) + ' stamps_equal=' + (s2.stamps === s0.stamps) + ' -> pilot back to its snapshot: ' + back);
    fs.writeFileSync(path.join(OUT, 'legacy.json'), JSON.stringify(F, null, 1));
    L('§LEGACY_VERDICT ' + (back && shotOk ? 'PASS' : (back ? 'FAIL shot' : 'FAIL NOT RESTORED'))); save(); process.exit(back && shotOk ? 0 : 1);
  }
})();
