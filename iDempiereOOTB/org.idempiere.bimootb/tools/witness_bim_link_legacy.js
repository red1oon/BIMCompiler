#!/usr/bin/env node
// Copyright (c) 2025-2026 Redhuan D. Oon
// SPDX-License-Identifier: MIT
// ⚠ DO NOT REMOVE — W-BIM-LINK-LEGACY. Spec: prompts/BIM_OOTB_LEGACY_IDEMPIERE_INTEGRATION.md §8.10 items 1, 3, 5 (owner 2026-11-26 "no red pill, just link back"; "as long it does not
//   impact the present given UATGuide process"). TEST INSTANCE ONLY (:8108, ~/idempiere-bimdoc): every phase starts from the database backup and ends restored, server stopped.
// THE ISSUES it proves or disproves:
//   upgrade  — a site that already applied 2Pack_13.1.0 gets ONLY 2Pack_13.1.1 when the new bundle replaces the old one (bundle version unchanged: Incremental2PackActivator goes by the
//              pack FILE version): the column, the field, the whitelist row exist, tab 200500 inactive.
//   guide    — the published UAT Guide still passes AS WRITTEN on the new build: the UAT's OWN instruments (instruments/L.js: LA1-LA4, L1-L3, read-only) measure and the UAT's OWN judge
//              (UATDryRun.judgeStep over the manifest/spec_L checks, literal guide text) decides; a clean install applies 13.1.0 then 13.1.1.
//   link     — after L2's push: C_Project.BIM_ViewerURL == <the served Viewer's origin+path>?db=<A.DB_URL>; the ZK Project window shows "BIM Model", its text read-only, its <a> target=_blank
//              with href == the value; no BIM tab; GET of the link answers 200 text/html with db == A.DB_URL. Falsifier: the whitelist row removed -> a push carrying the link is refused
//              and the link check FAILS (it must).
// Usage: UAT_DIR=<the UAT dry-run folder> node witness_bim_link_legacy.js <upgrade|guide> --old <old bundles dir> --ootb <bim-ootb checkout> [--src branch|master]
//   --src branch (default): LA1 builds THIS checkout's committed iDempiereOOTB (git archive HEAD) the guide's way; --src master: the UAT's own LA1 (published BIMCompiler master).
// Writes the legacy half of §BIM_LINK_TWIN to $TWIN_OUT and, with $TWIN_KERNEL (the Kernel witness's json), prints the §BIM_LINK_TWIN line. READ the log (out dir/witness.log) after every run.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const argv = process.argv.slice(2), flag = n => { const i = argv.indexOf('--' + n); return i < 0 ? null : argv[i + 1]; };
const MODE = argv[0], OLD = flag('old'), OOTB = flag('ootb') || path.join(os.homedir(), 'bim-ootb'), SRC = flag('src') || 'branch';
process.env.UAT_WT = OOTB;   // the UAT's "your bim-ootb copy" = the bim-ootb under test (read by its lib/ctx.js at require time)
const UAT = process.env.UAT_DIR || '';
const HERE = path.resolve(__dirname, '..'), REPO = path.resolve(HERE, '..', '..');
const INST = path.join(os.homedir(), 'idempiere-bimdoc'), SRV = path.join(INST, 'server'), BASE = 'http://localhost:8108';
const BI = path.join(SRV, 'configuration', 'org.eclipse.equinox.simpleconfigurator', 'bundles.info');
const DB = 'idempiere_bimdoc', BAK = process.env.BAK_DB || 'idempiere_bimdoc_bimlink_bak';
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'wbimlinkl-' + MODE + '-')), LOG = path.join(OUT, 'witness.log');
const S = m => { console.log(m); fs.appendFileSync(LOG, m + '\n'); };
let judged = 0, fails = 0;
const check = (id, ok, detail) => { judged++; if (!ok) fails++; S('§W_BIM_LINK_LEGACY ' + (ok ? 'PASS' : 'FAIL') + ' ' + id + ' ' + detail); return ok; };
const sh = (c, o) => { const r = cp.spawnSync('bash', ['-c', c], Object.assign({ encoding: 'utf8', maxBuffer: 1 << 28, timeout: 900000 }, o || {})); return { rc: r.status, out: (r.stdout || '') + (r.stderr || '') }; };
const psql = (sql, db) => { const r = cp.spawnSync('docker', ['exec', '-i', 'postgres', 'psql', '-U', 'adempiere', '-d', db || DB, '-v', 'ON_ERROR_STOP=1', '-qtA'], { input: (db === 'postgres' ? '' : 'SET search_path=adempiere;\n') + sql, encoding: 'utf8' }); if (r.status !== 0) throw new Error('psql ' + (r.stderr || '').slice(0, 300)); return (r.stdout || '').trim(); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const listening = () => /:8108 /.test(sh('ss -ltn').out);
async function stop() { sh('sh ' + INST + '/stop.sh'); for (let i = 0; i < 120 && listening(); i++) await sleep(1000); if (listening()) throw new Error(':8108 still listening'); }
async function start() { sh('sh ' + INST + '/start.sh'); for (let i = 0; i < 160; i++) { const c = sh("curl -s -o /dev/null -w '%{http_code}' " + BASE + '/webui/').out.trim(); if (c === '200') return i * 3; await sleep(3000); } throw new Error(':8108 not up'); }
const asFound = path.join(OUT, 'bundles.info.as_found');
const ours = n => /^org\.idempiere\.bimootb(\.viewer)?_13\.1\.0\./.test(n);
function uninstall() { fs.writeFileSync(BI, fs.readFileSync(BI, 'utf8').split('\n').filter(l => !/^org\.idempiere\.bimootb/.test(l)).join('\n')); fs.readdirSync(path.join(SRV, 'plugins')).filter(ours).forEach(n => fs.rmSync(path.join(SRV, 'plugins', n), { recursive: true, force: true })); }
function install(dir) {
  const add = fs.readdirSync(dir).filter(ours).map(n => { sh('cp -r ' + JSON.stringify(path.join(dir, n)) + ' ' + JSON.stringify(path.join(SRV, 'plugins')) + '/'); return n.slice(0, n.lastIndexOf('_')) + ',' + n.slice(n.lastIndexOf('_') + 1) + ',plugins/' + n + '/,4,true'; });
  const t = fs.readFileSync(BI, 'utf8'); fs.writeFileSync(BI, t + (t.endsWith('\n') ? '' : '\n') + add.join('\n') + '\n'); return add;
}
function restoreDb() { psql("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='" + DB + "'", 'postgres'); psql('DROP DATABASE ' + DB, 'postgres'); psql('CREATE DATABASE ' + DB + ' TEMPLATE ' + BAK, 'postgres'); }
const pkgs = () => psql("SELECT coalesce(string_agg(pk_version || ':' || pk_status, ', ' ORDER BY pk_version),'') FROM ad_package_imp WHERE name='org.idempiere.bimootb'");
async function waitPack(v, secs) { for (let i = 0; i < secs / 3; i++) { if (new RegExp(v.replace(/\./g, '\\.') + ':Completed successfully').test(pkgs())) return true; await sleep(3000); } return false; }
const U = { col: 'aef1e7cc-a955-48e6-be87-fa681932f9fd', el: 'c31edb07-16a8-4ad7-adbf-91c6b3deb47d', fld: 'afdbdfb4-2439-4884-998f-e0413adab19c', ws: '2231a3b8-75ed-4fd9-bc8a-a9865cd2dab6', tab: 'b1a00100-0001-4000-8000-000000000001' };
const dictState = () => JSON.parse(psql(`SELECT json_build_object(
  'column', (SELECT columnname FROM ad_column WHERE ad_column_uu='${U.col}'), 'reference', (SELECT ad_reference_id FROM ad_column WHERE ad_column_uu='${U.col}'),
  'length', (SELECT fieldlength FROM ad_column WHERE ad_column_uu='${U.col}'), 'columnUU', (SELECT ad_column_uu FROM ad_column WHERE ad_column_uu='${U.col}'),
  'element', (SELECT name FROM ad_element WHERE ad_element_uu='${U.el}'), 'elementUU', (SELECT ad_element_uu FROM ad_element WHERE ad_element_uu='${U.el}'),
  'readonly', (SELECT isreadonly FROM ad_field WHERE ad_field_uu='${U.fld}'), 'seqno', (SELECT seqno FROM ad_field WHERE ad_field_uu='${U.fld}'),
  'fieldUU', (SELECT ad_field_uu FROM ad_field WHERE ad_field_uu='${U.fld}'), 'tab', (SELECT ad_tab_id FROM ad_field WHERE ad_field_uu='${U.fld}'),
  'after', (SELECT c2.columnname FROM ad_field f JOIN ad_field f2 ON f2.ad_tab_id=f.ad_tab_id AND f2.isdisplayed='Y' AND f2.seqno<f.seqno JOIN ad_column c2 ON c2.ad_column_id=f2.ad_column_id WHERE f.ad_field_uu='${U.fld}' ORDER BY f2.seqno DESC LIMIT 1),
  'physical', (SELECT count(*) FROM information_schema.columns WHERE table_schema='adempiere' AND table_name='c_project' AND column_name='bim_viewerurl'),
  'wsInput', (SELECT count(*) FROM ws_webservicefieldinput i JOIN ws_webservicetype t ON t.ws_webservicetype_id=i.ws_webservicetype_id WHERE t.value='BIMOOTB_Create_C_Project' AND i.ad_column_id=(SELECT ad_column_id FROM ad_column WHERE ad_column_uu='${U.col}')),
  'bimTabActive', (SELECT isactive FROM ad_tab WHERE ad_tab_uu='${U.tab}'))`));
function dictChecks(tag, d) {
  check(tag + '.dict', d.column === 'BIM_ViewerURL' && Number(d.reference) === 40 && Number(d.length) === 2000 && d.element === 'BIM Model' && d.readonly === 'Y' && Number(d.tab) === 157 && d.after === 'Description' && Number(d.physical) === 1,
    'column/element/field as spec (URL 40, 2000, "BIM Model", read-only, tab 157 after Description, physical column): ' + JSON.stringify(d));
  check(tag + '.whitelist', Number(d.wsInput) === 1, 'BIMOOTB_Create_C_Project whitelists BIM_ViewerURL (rows=' + d.wsInput + ')');
  check(tag + '.bimtab', d.bimTabActive === 'N', 'the retired BIM tab 200500 is inactive (IsActive=' + d.bimTabActive + ')');
}
function finish(code) { S('§W_BIM_LINK_LEGACY_VERDICT ' + (!judged ? 'INCONCLUSIVE' : fails ? 'FAIL' : 'PASS') + ' judged=' + judged + ' fails=' + fails + ' mode=' + MODE + ' log=' + LOG); process.exit(code != null ? code : (!judged || fails ? 1 : 0)); }

// LA1 for a commit not yet on master: the guide's command, on THIS checkout's committed iDempiereOOTB, measured with the same fields as the UAT's own LA1 (instruments/L.js)
function la1Branch(ctx) {
  const src = fs.mkdtempSync(path.join(os.tmpdir(), 'wbimlink-src-')), out = fs.mkdtempSync(path.join(os.tmpdir(), 'wbimlink-bundles-')); ctx.tmp.push(src, out);
  const commit = sh('git -C ' + REPO + ' rev-parse HEAD').out.trim(); ctx.head({ compilerCommit: commit, compilerSource: 'branch ' + sh('git -C ' + REPO + ' rev-parse --abbrev-ref HEAD').out.trim() });
  sh('git -C ' + REPO + ' archive ' + commit + ' iDempiereOOTB | tar x -C ' + src);
  const r = ctx.sh('LA1', 'build the two bundles: build_bundle_poc.sh <iDempiere>/server <bim-ootb copy> <an empty folder>', 'bash ' + path.join(src, 'iDempiereOOTB/org.idempiere.bimootb/tools/build_bundle_poc.sh') + ' ' + SRV + ' ' + OOTB + ' ' + out, { logFile: 'LA1_build_bundle.log', timeout: 900000 });
  const ls = r.out.split('\n').map(l => l.trim()).filter(Boolean), dirs = fs.readdirSync(out).sort(); ctx.state.bundles = out;
  ctx.measure('LA1', 'build_bundle_poc.sh output (last line) + the folder it filled', { build_rc: r.rc, last_line: (ls[ls.length - 1] || '').slice(0, 400), out_folders: dirs.join(','), out_folder_count: dirs.length, compiler_commit: commit });
  return out;
}

// the ZK Project window as the user sees it after a log in: the "BIM Model" field's text box and button (Urlbox: Textbox + A, Urlbox.java:67-68), and the window's tab names
async function zkField(pid) {
  if (!pid) return null;
  const puppeteer = require(path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer')), Z = require(path.join(UAT, 'lib', 'zk.js'));
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'wbimlink-zk-'));
  const br = await puppeteer.launch({ headless: 'new', userDataDir: prof, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=1440,900'] });
  try {
    const ep = await br.newPage(); await ep.setViewport({ width: 1440, height: 900 });
    await ep.goto(BASE + '/webui/index.zul?Action=Zoom&TableName=C_Project&Record_ID=' + Number(pid), { waitUntil: 'load', timeout: 120000 });
    await ep.waitForFunction(() => [...document.querySelectorAll('input.z-textbox')].filter(e => e.getBoundingClientRect().width > 0).length >= 2, { timeout: 120000 });
    const ins = []; for (const e of await ep.$$('input.z-textbox')) if (await e.boundingBox()) ins.push(e); await ins[0].type('GardenAdmin'); await ins[1].type('GardenAdmin');
    const sr = await ep.evaluateHandle(() => { const c = [...document.querySelectorAll('.z-checkbox')].find(e => /Select Role/.test(e.innerText || '') && e.getBoundingClientRect().width > 0); if (!c) return null; const i = c.querySelector('input'); return i && i.checked ? null : (c.querySelector('label') || i); });
    const se = sr.asElement(); if (se) await ep.evaluate(el => el.click(), se);
    await ep.click('button.btn-ok'); await Z.idle(ep, 3000); await Z.role(ep, 'HQ', 'HQ');
    for (let i = 0; i < 240; i++) { const ok = await ep.evaluate(() => [...document.querySelectorAll('[instancename]')].some(x => /^C_Project\d*Value$/.test(x.getAttribute('instancename')) && x.getBoundingClientRect().width > 0)); if (ok) break; await sleep(500); }
    await sleep(1500);
    return await ep.evaluate(() => {
      const ed = [...document.querySelectorAll('[instancename]')].find(x => /^C_Project\d*BIM_ViewerURL$/.test(x.getAttribute('instancename')) && x.getBoundingClientRect().width > 0);
      const box = ed ? (ed.closest('.editor-box') || ed) : null, inp = box ? (box.matches('input') ? box : box.querySelector('input')) : null, a = box ? (box.querySelector('a') || (box.parentElement && box.parentElement.querySelector('a.editor-button'))) : null;
      const label = [...document.querySelectorAll('.z-label, label, span')].some(e => (e.textContent || '').trim() === 'BIM Model' && e.getBoundingClientRect().width > 0);
      const tabs = [...document.querySelectorAll('li.z-tab, .adwindow-breadcrumb a, .z-a')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.textContent || '').trim()).filter(Boolean).slice(0, 40);
      const ic = a ? a.querySelector('i, img') : null;
      return { found: !!ed, instancename: ed && ed.getAttribute('instancename'), boxClass: box && String(box.className).slice(0, 80), label, value: inp ? inp.value : null, readonly: inp ? (inp.readOnly || inp.disabled) : null, inputClass: inp ? inp.className : null,
        target: a ? a.getAttribute('target') : null, href: a ? a.getAttribute('href') : null, aClass: a ? String(a.className).slice(0, 80) : null, icon: ic ? String(ic.className || ic.getAttribute('src') || '').slice(0, 80) : '', tabs, bimTab: tabs.includes('BIM') };
    });
  } finally { await br.close().catch(() => {}); fs.rmSync(prof, { recursive: true, force: true }); }
}

(async () => {
  S('§W_BIM_LINK_LEGACY start mode=' + MODE + ' src=' + SRC + ' ootb=' + OOTB + ' (' + sh('git -C ' + OOTB + ' rev-parse --short HEAD').out.trim() + ') compiler=' + sh('git -C ' + REPO + ' rev-parse --short HEAD').out.trim() + ' out=' + OUT);
  if (Number(psql("SELECT count(*) FROM pg_database WHERE datname='" + BAK + "'", 'postgres')) !== 1) { S('§W_BIM_LINK_LEGACY refused: no backup database ' + BAK); return finish(2); }
  if (MODE === 'guide' && !fs.existsSync(path.join(UAT, 'instruments', 'L.js'))) { S('§W_BIM_LINK_LEGACY refused: UAT_DIR does not hold instruments/L.js'); return finish(2); }
  await stop(); fs.copyFileSync(BI, asFound); uninstall(); restoreDb();
  S('§W_BIM_LINK_LEGACY precondition server=stopped bundles.info bimootb lines=0 db=' + DB + ' restored from ' + BAK + ' pkgs=' + (pkgs() || 'none'));
  const tmp = [];
  try {
    if (MODE === 'upgrade') {
      if (!OLD) throw new Error('--old <the published 13.1.0 bundles> is required');
      S('§BIM_LINK_UPGRADE install old ' + install(OLD).join(' | ')); S('§BIM_LINK_UPGRADE up after ' + await start() + 's');
      const a = await waitPack('13.1.0', 240); S('§BIM_LINK_UPGRADE old bundle pkgs=' + pkgs());
      check('U.base', a && !/13\.1\.1/.test(pkgs()), 'the published bundle applied 13.1.0 only: ' + pkgs());
      await stop(); uninstall();
      const built = la1Branch({ tmp, head: () => {}, state: {}, measure: () => {}, sh: (id, t, c) => { const r = sh(c); S('§BIM_LINK_UPGRADE build rc=' + r.rc + ' ' + r.out.trim().split('\n').slice(-1)[0].slice(0, 300)); return r; } });
      S('§BIM_LINK_UPGRADE install new ' + install(built).join(' | ')); S('§BIM_LINK_UPGRADE up after ' + await start() + 's');
      const b = await waitPack('13.1.1', 240), p = pkgs(); S('§BIM_LINK_UPGRADE new bundle pkgs=' + p);
      check('U.update', b && (p.match(/13\.1\.0:Completed/g) || []).length === 1, 'the new bundle applied 13.1.1 and did NOT re-apply 13.1.0: ' + p);
      dictChecks('U', dictState());
    } else if (MODE === 'guide') {
      const ctxm = require(path.join(UAT, 'lib', 'ctx.js')), L = require(path.join(UAT, 'instruments', 'L.js')), G = require(path.join(UAT, 'lib', 'guide.js'));
      const { manifest } = require(path.join(UAT, 'manifest.js')), { judgeStep } = require(path.join(UAT, 'UATDryRun.js'));
      const ctx = ctxm.make(OUT, 'bimlink-' + MODE, {}); S('§BIM_LINK_GUIDE UAT ctx raw.log=' + ctx.raw + ' guide sha=' + G.sha().slice(0, 16) + ' UAT_WT=' + ctx.cfg.WT);
      const defs = manifest(G.text()), gsteps = G.steps(), ids = ['LA1', 'LA2', 'LA3', 'LA4', 'L1', 'L2', 'L3'];
      let dbUrl = null, servedPath = null;
      for (const id of ids) {
        try {
          if (id === 'LA1' && SRC === 'branch') la1Branch(ctx); else await L.steps[id](ctx);
          if (id === 'LA2') S('§BIM_LINK_GUIDE after LA2 pkgs=' + pkgs());
          if (id === 'L2' && ctx.state.l) { const v = await ctx.state.l.pg.evaluate(() => ({ db: window.APP.DB_URL, path: location.origin + location.pathname })); dbUrl = v.db; servedPath = v.path; }
        } catch (e) { ctx.fail(id, 'witness_bim_link_legacy', e); S('§BIM_LINK_GUIDE ' + id + ' instrument error ' + String(e && e.message || e).slice(0, 300)); }
      }
      const M = {}; fs.readFileSync(ctx.raw, 'utf8').split('\n').filter(l => l.startsWith('§UATM ')).forEach(l => { const o = JSON.parse(l.slice(6)); M[o.id] = Object.assign(M[o.id] || {}, o); });
      for (const id of ids) {
        const def = defs.find(d => d.id === id), r = judgeStep(def, M[id], gsteps.find(s => s.id === id));
        check('G.' + id, r.verdict === 'PASS', 'UAT judge: ' + r.verdict + (r.why ? ' (' + r.why + ')' : '') + ' ' + JSON.stringify((r.checks || []).map(c => ({ k: c.name, ok: c.ok, exp: String(c.expected).slice(0, 60), act: String(c.actual).slice(0, 110) }))));
      }
      const p = pkgs(); check('G.packs', /13\.1\.0:Completed/.test(p) && /13\.1\.1:Completed/.test(p), 'a clean install applied both packs: ' + p);
      const d = dictState(); dictChecks('G', d);
      const pid = (M.L2 || {}).status_project_id || null;
      const stored = pid ? psql('SELECT coalesce(bim_viewerurl,\'\') FROM c_project WHERE c_project_id=' + Number(pid)) : null, expect = servedPath && dbUrl ? servedPath + '?db=' + encodeURIComponent(dbUrl) : null;
      check('K.store', !!stored && stored === expect, 'C_Project ' + pid + '.BIM_ViewerURL=' + stored + ' expected=' + expect + ' (A.DB_URL=' + dbUrl + ')');
      let get = null; try { const r = await fetch(stored, { signal: AbortSignal.timeout(20000) }); get = { status: r.status, type: r.headers.get('content-type'), db: new URL(stored).searchParams.get('db') }; } catch (e) { get = { error: e.message }; }
      check('K.get', !!get && get.status === 200 && /^text\/html/.test(get.type || '') && get.db === dbUrl, 'GET the link: ' + JSON.stringify(get));
      const zk = await zkField(pid); S('§BIM_LINK_ZK ' + JSON.stringify(zk));
      check('K.zk.shown', !!zk && zk.label === true && zk.found, 'the ZK Project window shows "BIM Model": label=' + (zk && zk.label) + ' editor=' + (zk && zk.found));
      check('K.zk.readonly', !!zk && zk.readonly === true, 'its text is read-only (readonly=' + (zk && zk.readonly) + ' class=' + (zk && zk.inputClass) + ')');
      check('K.zk.button', !!zk && zk.target === '_blank' && zk.href === stored, 'its button is <a target=_blank href=value> (target=' + (zk && zk.target) + ', href==value ' + (zk && zk.href === stored) + ')');
      check('K.zk.value', !!zk && zk.value === stored, 'its text == the stored link');
      check('K.zk.nobimtab', !!zk && zk.bimTab === false, 'no tab named BIM in the window (' + JSON.stringify(zk && zk.tabs) + ')');
      const twin = Object.assign({ side: 'legacy', value: stored, valueShape: /^https?:\/\/[^?]+\/viewer\/viewer\.html\?db=[^&]+$/.test(stored || '') ? '<origin>/<path>/viewer.html?db=<enc db>' : 'OTHER', db: dbUrl, renderer: zk && { readonly: zk.readonly, button: !!zk.href, target: zk.target, hrefIsValue: zk.href === stored, icon: zk.icon } }, d);
      fs.writeFileSync(process.env.TWIN_OUT || path.join(OUT, 'twin_legacy.json'), JSON.stringify(twin, null, 1)); S('§BIM_LINK_TWIN_LEGACY ' + JSON.stringify(twin));
      if (process.env.TWIN_KERNEL && fs.existsSync(process.env.TWIN_KERNEL)) {
        const k = JSON.parse(fs.readFileSync(process.env.TWIN_KERNEL, 'utf8')), keys = ['column', 'reference', 'length', 'columnUU', 'element', 'elementUU', 'readonly', 'seqno', 'fieldUU', 'tab', 'after', 'bimTabActive', 'valueShape'];
        const diff = keys.filter(x => String(k[x]) !== String(twin[x])), rk = ['readonly', 'button', 'target', 'hrefIsValue'].filter(x => String((k.renderer || {})[x]) !== String((twin.renderer || {})[x]));
        S('§BIM_LINK_TWIN ' + (diff.length || rk.length ? 'DIFFER' : 'SAME') + ' ' + keys.map(x => x + '=' + twin[x] + (diff.includes(x) ? '|kernel=' + k[x] : '')).join(' ') + ' renderer=' + JSON.stringify(twin.renderer) + (rk.length ? ' kernelRenderer=' + JSON.stringify(k.renderer) : '') + ' legacyValue=' + twin.value + ' kernelValue=' + k.value);
        check('T.twin', !diff.length && !rk.length, 'legacy == Kernel on ' + keys.length + ' dictionary/value keys + 4 renderer keys' + (diff.length || rk.length ? ' DIFF ' + diff.concat(rk).join(',') : ''));
      }
      // falsifier: the whitelist row removed -> a push of a project carrying the link is refused, its link is not stored (the K.store rule cannot pass)
      psql("DELETE FROM ws_webservicefieldinput WHERE ws_webservicefieldinput_uu='" + U.ws + "'"); await stop(); await start();
      const RP = require(path.join(OOTB, 'viewer', 'erp_rest_push.js')), PL = require(path.join(OOTB, 'viewer', 'erp_push_plan.js'));
      const fv = 'BIMLINK_FALSIFIER', flink = (servedPath || BASE + '/bimootb/viewer/viewer.html') + '?db=' + encodeURIComponent('falsifier.db'); let ferr = null, fr = null;
      try { fr = await RP.pushProjectOrder({ baseUrl: BASE, serviceTypes: PL.bimootbServiceTypes(), login: { user: 'GardenAdmin', pass: 'GardenAdmin', lang: 'en_US', clientId: 11, roleId: 102, orgId: 11, warehouseId: 103, stage: 0 } },
        { building: fv, name: 'BIM: ' + fv, fields: [{ column: 'BIM_ViewerURL', val: flink }], phases: [] }); } catch (e) { ferr = String(e && e.message || e); }
      const fstored = psql("SELECT coalesce(max(bim_viewerurl),'') FROM c_project WHERE value='" + fv + "'");
      S('§BIM_LINK_FALSIFIER push result=' + JSON.stringify(fr) + ' error=' + (ferr || '-').slice(0, 300) + ' stored="' + fstored + '"');
      check('F.whitelist', fstored !== flink && !!ferr, 'without the whitelist row the link cannot reach legacy (the K.store rule FAILS as it must): stored="' + fstored + '" error=' + (ferr || 'none').slice(0, 200));
      ctx.tmp.forEach(t => tmp.push(t));
    } else throw new Error('mode must be upgrade or guide');
  } catch (e) { fails++; S('§W_BIM_LINK_LEGACY ERROR ' + (e && e.stack || e)); }
  finally {
    await stop().catch(e => S('§W_BIM_LINK_LEGACY stop failed ' + e.message)); uninstall(); fs.copyFileSync(asFound, BI); restoreDb();
    tmp.forEach(t => fs.rmSync(t, { recursive: true, force: true }));
    S('§W_BIM_LINK_LEGACY restored server=' + (listening() ? 'LISTENING' : 'stopped') + ' bundles.info sha=' + sh('sha256sum ' + BI).out.slice(0, 16) + ' plugin folders=' + fs.readdirSync(path.join(SRV, 'plugins')).filter(n => /^org\.idempiere\.bimootb/.test(n)).length + ' db pkgs=' + (pkgs() || 'none') + ' c_project=' + psql('SELECT count(*) FROM c_project'));
  }
  return finish();
})();
