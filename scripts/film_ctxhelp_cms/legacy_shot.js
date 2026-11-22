// ⚠ DO NOT REMOVE — SCOPE: film "The container legacy gave us, filled" beat 7 (bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.18; owner 2026-11-22: "Apply, shoot, remove").
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
const F = { db: DB, script: T.file };
(async () => {
  const s0 = state(); F.before = { helps: s0.helps, msgs: s0.msgs, trl: s0.trl, tabLinks: s0.tabLinks, procLinks: s0.procLinks, seq: s0.seq };
  L('§LEGACY_STATE before ' + JSON.stringify(F.before) + ' ours=' + s0.ours);
  if (s0.ours !== 0 || s0.tabLinks !== 0 || s0.procLinks !== 0) { L('§LEGACY_REFUSED the pilot is not clean (our rows or links present): nothing applied'); save(); process.exit(3); }
  let shotOk = false, removed = false;
  try {
    psql('BEGIN;\n' + fs.readFileSync(SQLF, 'utf8') + '\nCOMMIT;'); const s1 = state(); F.applied = { helps: s1.helps, msgs: s1.msgs, trl: s1.trl, tabLinks: s1.tabLinks, procLinks: s1.procLinks, seq: s1.seq };
    L('§LEGACY_APPLIED ' + JSON.stringify(F.applied));
    const look = psql("SELECT h.AD_CtxHelp_UU || '|' || length(m.MsgText) FROM AD_Tab t JOIN AD_CtxHelp h ON h.AD_CtxHelp_ID=t.AD_CtxHelp_ID JOIN AD_CtxHelpMsg m ON m.AD_CtxHelp_ID=h.AD_CtxHelp_ID AND m.AD_Client_ID=0 WHERE t.AD_Tab_ID=186;")[0] || '';
    F.lookup186 = { uu: look.split('|')[0], len: Number(look.split('|')[1]), ours: look.split('|')[0] === T.targets.find((t) => t.kind === 'T' && t.id === 186).huu }; L('§LEGACY_LOOKUP tab=186 ' + JSON.stringify(F.lookup186));
    const rec = psql("SELECT C_Order_ID || '|' || DocumentNo FROM C_Order WHERE AD_Client_ID=11 AND IsSOTrx='Y' AND IsActive='Y' ORDER BY C_Order_ID DESC LIMIT 1;")[0].split('|'); F.order = { id: Number(rec[0]), no: rec[1] };
    // legacy's own ZK page, headless on the CPU: login GardenAdmin, the role page's OK, then zoom to the order (Sales Order window, its header tab)
    const { chromium } = require(process.env.PW || path.join(os.homedir(), 'bim-ootb', 'tests', 'node_modules', 'playwright'));
    const br = await chromium.launch({ headless: true, args: ['--disable-gpu'] }), page = await (await br.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 })).newPage();
    try {
      await page.goto(ZK + 'index.zul?Action=Zoom&AD_Table_ID=259&Record_ID=' + F.order.id, { waitUntil: 'load', timeout: 90000 }); await page.waitForTimeout(6000);
      const tb = page.locator('input.z-textbox:visible'); await tb.nth(0).fill('GardenAdmin'); await tb.nth(1).fill('GardenAdmin'); await page.click('button.login-btn.btn-ok'); await page.waitForTimeout(6000);
      for (let i = 0; i < 3; i++) { const ok = page.locator('button.btn-ok:visible'); if (await ok.count()) { await ok.first().click(); await page.waitForTimeout(6000); } else break; }
      let txt = ''; for (let i = 0; i < 40; i++) { txt = await page.evaluate(() => Array.from(document.querySelectorAll('.help-content')).map((e) => e.innerText).join('\n---\n')); if (/1 · Sales Order/.test(txt)) break; await page.waitForTimeout(1000); }
      F.zk = { panel: txt.slice(0, 1500), hasOwn: /Order Header/.test(txt), hasOurs: /1 · Sales Order/.test(txt), title: await page.title() };
      await page.screenshot({ path: path.join(PAGES, 'legacy_so.png') });
      const r = await page.evaluate(() => { const e = Array.from(document.querySelectorAll('.help-content')).find((x) => /1 · Sales Order/.test(x.innerText)); const p = e && (e.closest('.z-panel') || e.parentElement); if (!p) return null; const b = p.getBoundingClientRect(); return { x: Math.round(b.x * 1.5), y: Math.round(b.y * 1.5), w: Math.round(b.width * 1.5), h: Math.round(b.height * 1.5) }; });
      F.zk.rect = r; shotOk = F.zk.hasOwn && F.zk.hasOurs && !!r; L('§LEGACY_ZK ' + JSON.stringify({ hasOwn: F.zk.hasOwn, hasOurs: F.zk.hasOurs, rect: r, title: F.zk.title, order: F.order }) + ' panel="' + txt.replace(/\s+/g, ' ').slice(0, 300) + '"');
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
