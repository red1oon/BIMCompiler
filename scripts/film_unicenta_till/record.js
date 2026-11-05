// ⚠ DO NOT REMOVE — Scope: RECORD the real pages of "uniCenta POS, reborn: the SQLite WASM till" (prompts/POS_PLUGIN_LOCAL_FIRST.md §34). Headless Chromium --disable-gpu (CPU only, never the GPU lock), CDP screencast (FILM_NARRATION.md §5 §ERP-FILM),
//   visible cursor, human pace. SEVEN real devices on one dumb folder pipe (harness copied from bim-ootb erp/tests/witness_eoda.js / witness_kds.js / witness_soda_receipt_up.js): head office A, branch admin D, tills T1-T3, kitchen K, restaurant till TR.
//   NO mock screens, NO DOM edits for content (the relay-counter badge is an instrument read-out of the recorder's own request count; it is labelled so). Every number the voice says is printed as §TILLFILM_FACT k=v from the live in-browser DB or the recorder's own count.
//   A beat that cannot be recorded is NAMED (§TILLFILM_BEAT_FAIL / §TILLFILM_BLOCKED) and leaves a hole in the assembly, never a silent skip. READ THE LOG: <outDir>/film.log (beats, facts) and <outDir>/page.log.
// v4 (§34.G): the §38 topology: the REAL erp/branch_relay.py (python3, a child process) is the tills' ONLY pipe (LAN); the branch admin D is the flagged MAIN till (flag seeded in its device store, as a SODA kind-M row sets it) and alone holds the internet pipe (the folder server below). witness_eoda.js is the model.
//   ONLY=b3a,b3b records beat 3 alone (head office A, main till D, tills T1-T3; K and TR are not opened). Beats b4a-b5b of this file still follow the pre-§38 hand-off and were NOT re-recorded for v4 (their v2 clips are reused, SKIPREC).
// Run: ROOT=/tmp/wt-film-ootb node record.js <outDir> [beatmin.json]      env ONLY=b1a,b1b (beats to record; devices still boot), FAST=1 (shorter holds, dry run)
'use strict';
const { chromium } = require('/home/red1/bim-ootb/tests/node_modules/playwright');
const cp = require('child_process'), http = require('http'), fs = require('fs'), os = require('os'), vm = require('vm'), path = require('path'), crypto = require('crypto'), { execFileSync } = require('child_process');
const ROOT = process.env.ROOT || '/tmp/wt-film-ootb', OUT = path.resolve(process.argv[2] || 'out/rec'), FR = path.join(OUT, 'frames'); fs.mkdirSync(FR, { recursive: true });
const MIN = process.argv[3] && fs.existsSync(process.argv[3]) ? JSON.parse(fs.readFileSync(process.argv[3], 'utf8')) : {}, FAST = !!process.env.FAST, ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const B3ONLY = ONLY.length > 0 && ONLY.every(x => /^b3/.test(x)), NOREST = ONLY.length > 0 && ONLY.every(x => /^(b1|b3)/.test(x)), LANREQ = [];   // NOREST: K and TR are not opened (v5: ONLY=b1b and ONLY=b3a,b3b re-record the receipt shots on the §39 receipt)
const LOG = [], PAGELOG = [], say = s => { LOG.push(s); console.log(s); }, sleep = ms => new Promise(r => setTimeout(r, ms)), J = JSON.stringify, subtle = crypto.webcrypto.subtle;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm', '.png': 'image/png', '.css': 'text/css', '.svg': 'image/svg+xml', '.db': 'application/octet-stream' };
const fact = (k, v) => say('§TILLFILM_FACT ' + k + '=' + String(v).replace(/\s+/g, ' ').slice(0, 300));
// ── pipe + signed plan (copied from witness_eoda.js)
const canon = o => (o === null || typeof o !== 'object') ? J(o) : Array.isArray(o) ? '[' + o.map(canon).join(',') + ']' : '{' + Object.keys(o).sort().map(k => J(k) + ':' + canon(o[k])).join(',') + '}';
async function mkKey() { const kp = await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']), j = await subtle.exportKey('jwk', kp.publicKey); return { priv: kp.privateKey, pub: { kty: j.kty, crv: j.crv, x: j.x, y: j.y } }; }
async function signObj(obj, key) { const b = JSON.parse(J(obj)); delete b.sig; delete b.signer; const s = await subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key.priv, new TextEncoder().encode(canon(b))); const o = JSON.parse(J(b)); o.signer = key.pub; o.sig = Buffer.from(s).toString('hex'); return o; }
const loadPlan = (file, g) => { const o = {}; vm.runInNewContext(fs.readFileSync(file, 'utf8'), { window: o, globalThis: o }); return o[g]; };
const planJs = (name, o) => '(function (g) { g.' + name + ' = ' + J(o) + '; })(typeof window !== \'undefined\' ? window : globalThis);\n';
const walk = (d, rel, out) => { if (!fs.existsSync(d)) return out; fs.readdirSync(d).forEach(n => { const p = path.join(d, n), r = rel ? rel + '/' + n : n; if (fs.statSync(p).isDirectory()) walk(p, r, out); else out.push(r); }); return out; };
// ── visible cursor + ripple (headless has no pointer) and the clearly labelled relay read-out
const CURSOR = `(() => { const go = () => { if (document.getElementById('__fc')) return; const c = document.createElement('div'); c.id = '__fc';
  c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;margin:-3px 0 0 -3px;z-index:2147483647;pointer-events:none;background:url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2222%22 height=%2222%22><path d=%22M3 2 L3 18 L7.5 14 L10.5 20.5 L13 19.4 L10.1 13 L16 13 Z%22 fill=%22white%22 stroke=%22black%22 stroke-width=%221.4%22/></svg>") no-repeat';
  document.documentElement.appendChild(c); const at = e => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }; addEventListener('mousemove', at, true);
  addEventListener('mousedown', e => { at(e); const r = document.createElement('div'); r.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:none;border:3px solid #ffb400;border-radius:50%;width:10px;height:10px;left:' + (e.clientX - 5) + 'px;top:' + (e.clientY - 5) + 'px;transition:all .45s ease-out;opacity:1';
    document.documentElement.appendChild(r); requestAnimationFrame(() => { r.style.transform = 'scale(4)'; r.style.opacity = '0'; }); setTimeout(() => r.remove(), 600); }, true); };
  if (document.documentElement) go(); else addEventListener('DOMContentLoaded', go); })();`;

(async () => {
  const PIPEDIR = fs.mkdtempSync(path.join(os.tmpdir(), 'tillfilm-')), REQ = []; let cur = { plans: {} };
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x'), p = decodeURIComponent(u.pathname);
    if (p === '/pipe/list') { const pre = u.searchParams.get('prefix') || ''; res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(J(walk(PIPEDIR, '', []).filter(n => n.indexOf(pre) === 0))); return; }
    if (p.indexOf('/pipe/f/') === 0) { const fp = path.join(PIPEDIR, p.slice(8)); if (fp.indexOf(PIPEDIR) !== 0) { res.writeHead(400); res.end(); return; }
      if (req.method === 'PUT') { const ch = []; req.on('data', c => ch.push(c)); req.on('end', () => { fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, Buffer.concat(ch)); res.writeHead(200); res.end('ok'); }); return; }
      if (!fs.existsSync(fp)) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': 'application/octet-stream' }); fs.createReadStream(fp).pipe(res); return; }
    const over = { '/erp/team_plan.js': cur.plans.office, '/erp/team_plan_pos.js': cur.plans.pos }[p]; if (over) { res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(over); return; }
    const f = path.join(ROOT, p === '/' ? '/erp/idempiere.html' : p); if (f.indexOf(ROOT) !== 0 || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); });
  await new Promise(r => server.listen(0, '127.0.0.1', r)); const base = 'http://127.0.0.1:' + server.address().port, PIPE = base + '/pipe';
  const RPORT = 19000 + Math.floor(Math.random() * 900), RBOX = fs.mkdtempSync(path.join(os.tmpdir(), 'tillfilm-box-')), RELAY = 'http://127.0.0.1:' + RPORT, LAN = RELAY + '/pipe', RELAYERR = [];
  const relayProc = cp.spawn('python3', [path.join(ROOT, 'erp', 'branch_relay.py'), '--port', String(RPORT), '--dir', RBOX, '--bind', '127.0.0.1'], { stdio: ['ignore', 'ignore', 'pipe'] }); relayProc.stderr.on('data', d => RELAYERR.push(String(d)));
  await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('branch relay did not start')), 15000); relayProc.stderr.on('data', d => { if (String(d).indexOf('§RELAY_UP') >= 0) { clearTimeout(t); res(); } }); }); say('§TILLFILM_RELAY branch_relay.py up port=' + RPORT + ' (python3, stdlib; the tills\' only pipe)');
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'] });
  const owner = await mkKey(); cur.plans.office = planJs('TEAM_PLAN', await signObj(loadPlan(path.join(ROOT, 'erp', 'team_plan.js'), 'TEAM_PLAN'), owner)); cur.plans.pos = planJs('TEAM_PLAN_POS', await signObj(loadPlan(path.join(ROOT, 'erp', 'team_plan_pos.js'), 'TEAM_PLAN_POS'), owner));
  const xcfg = encodeURIComponent(Buffer.from(J({ trust: [owner.pub] })).toString('base64')), qsNet = '&team=1&pipe=' + encodeURIComponent(PIPE) + '&xcfg=' + xcfg + '&teamplan=pos&poll=3600';
  const qsBase = '&team=1&pipe=' + encodeURIComponent(LAN) + '&relay=' + encodeURIComponent(RELAY) + '&xcfg=' + xcfg + '&teamplan=pos&poll=3600', qsMain = qsNet + '&lan=' + encodeURIComponent(LAN) + '&relay=' + encodeURIComponent(RELAY);   // tills: the branch relay ONLY; main till D: internet relay + branch relay, routed
  const ICON_HOST = 'objectstorage.ap-kulai-2.oraclecloud.com';
  // ── camera: ONE screencast at a time; frames tagged with the segment they belong to; cuts (pause / segment end) bound every frame's duration
  const EV = []; let CAMDEV = null, SEG = null, T0 = null; const now = () => Date.now() / 1000;
  const cam = {
    async on(d) { if (CAMDEV === d) return; await cam.off(); CAMDEV = d; await d.pg.bringToFront(); await d.cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 1920, maxHeight: 840, everyNthFrame: 1 }); await d.pg.mouse.move(5, 5).catch(() => {}); },
    async off() { if (CAMDEV) { EV.push({ cut: now() }); await CAMDEV.cdp.send('Page.stopScreencast').catch(() => {}); CAMDEV = null; } },
  };
  async function open(name, urlPath, ready) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 630 }, deviceScaleFactor: 4 / 3 }), pg = await ctx.newPage(), logs = []; await ctx.addInitScript(CURSOR);
    pg.on('console', m => { const t = m.text(); logs.push(t); PAGELOG.push('[' + name + '] ' + t); }); pg.on('pageerror', e => { PAGELOG.push('[' + name + '] PAGEERR ' + e.message); say('§TILLFILM_PAGEERR ' + name + ' ' + e.message.slice(0, 160)); });
    await ctx.route('**/*', route => { const u = new URL(route.request().url()); if (u.hostname === ICON_HOST) return route.continue(); if (u.hostname !== '127.0.0.1') return route.abort('blockedbyclient');
      const rq = { dev: name, m: route.request().method(), p: u.pathname, q: u.searchParams.get('prefix') || '' }; if (u.port === String(RPORT) && u.pathname.indexOf('/pipe/') === 0) LANREQ.push(rq); else if (u.pathname.indexOf('/pipe/') === 0) REQ.push(rq); return route.continue(); });
    if (name === 'D') await pg.addInitScript(() => { localStorage.setItem('tilllan.v1:12-MAIN', JSON.stringify({ main: { on: true } })); });
    await pg.addInitScript(() => { const q = new URLSearchParams(location.search).get('xcfg'); if (q) { const c = JSON.parse(atob(q)); window.TEAM_PLAN_TRUST = c.trust; } });
    await pg.goto(base + urlPath, { waitUntil: 'load' }); await pg.waitForFunction(ready, null, { timeout: 280000 });
    const cdp = await ctx.newCDPSession(pg), d = { name, pg, logs, ctx, cdp };
    cdp.on('Page.screencastFrame', f => { if (CAMDEV === d && SEG) { const fn = path.join(FR, String(EV.length).padStart(7, '0') + '.jpg'); fs.writeFileSync(fn, Buffer.from(f.data, 'base64')); EV.push({ fn, ts: f.metadata.timestamp, seg: SEG }); }
      cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
    say('§TILLFILM_DEVICE ' + name + ' booted'); return d;
  };
  const eng = (d, fn, arg) => d.pg.evaluate('(function(){ var W = window.Till ? window.Till.engine() : window.BranchAdmin ? window.BranchAdmin.engine() : window.Kitchen ? window.Kitchen.engine() : window; return (' + fn.toString() + ')(W, ' + J(arg === undefined ? null : arg) + '); })()');
  const T = {
    found: d => eng(d, W => W.TeamSync.found()), join: (d, sp) => eng(d, (W, s) => W.TeamSync.join(s), sp), kid: d => eng(d, async W => (await W.TeamSync.pairState()).device), enrolled: d => eng(d, async W => (await W.TeamSync.pairState()).enrolled),
    approve: (a, kid, role, uu) => eng(a, async (W, x) => { const r = await W.TeamSync.requests(); for (const q of r) if (q.rq.kid === x.kid) { await W.TeamSync.approve(q.rq, x.role, x.uu); return true; } return false; }, { kid, role, uu }),
    visit: d => { let done = false; return Promise.race([eng(d, async W => { const v = await W.TeamSync.visit(); return v && v.replicaIn; }).then(v => { done = true; return v; }), sleep(120000).then(() => { if (!done) say('§TILLFILM_STEP visit on ' + d.name + ' did not return in 120 s'); return null; })]); },
    rows: (d, sql) => eng(d, (W, q) => new Promise(res => { W.__crud.modelRun({ table: 'c_order', timing: 'PROCESS', fn: trx => { try { res(trx.q(q)); } catch (e) { res({ error: String(e && e.message) }); } return { ok: true }; } }, () => {}); }), sql),
  };
  const bridge = async () => { await D.pg.evaluate(() => window.BranchAdmin.lanCollect()).catch(() => {}); };   // §38: the main till mirrors the shared stream and collects over the LAN (witness_eoda.js bridge())
  const visitAll = async (devs, n) => { for (let r = 0; r < (n || 1); r++) { for (const d of devs) { await bridge(); await T.visit(d); } await bridge(); } };
  const mark = () => REQ.length, since = mk => REQ.slice(mk), lane = r => /\/m\/b_/.test(r.p + r.q) ? 'branch' : /\/o\//.test(r.p + r.q) ? 'hub' : 'house';
  // ── human pace
  const hold = ms => sleep(FAST ? Math.min(ms, 250) : ms);
  async function glide(d, sel) { const loc = d.pg.locator(sel).first(); await loc.scrollIntoViewIfNeeded().catch(() => {}); const b = await loc.boundingBox(); if (!b) throw new Error('no box for ' + sel); await d.pg.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: FAST ? 4 : 18 }); await hold(220); }
  async function click(d, sel) { await glide(d, sel); await d.pg.click(sel); await hold(450); }
  async function typeIn(d, sel, txt) { await glide(d, sel); await d.pg.click(sel); await d.pg.fill(sel, ''); for (const ch of String(txt)) { await d.pg.type(sel, ch, { delay: 0 }); await hold(80); } await hold(300); }
  // ── segments
  const beatsDone = [], blocked = [];
  async function segment(id, fn, devForCam) {
    if (ONLY.length && ONLY.indexOf(id) < 0) return; SEG = null; const t = now();
    say('§TILLFILM_BEAT id=' + id + ' t=' + (T0 === null ? '0.00' : (t - T0).toFixed(2))); if (T0 === null) T0 = t;
    try { if (devForCam) await cam.on(devForCam); SEG = id; EV.push({ cut: now(), start: id }); await fn(); await hold(1200); EV.push({ cut: now(), end: id }); SEG = null; beatsDone.push(id); }
    catch (e) { SEG = null; say('§TILLFILM_BEAT_FAIL id=' + id + ' err=' + String(e && e.message || e).split('\n').slice(0, 2).join(' ').slice(0, 300)); EV.push({ cut: now(), end: id, failed: true }); }
  }
  // ═══ setup (OFF camera): head office A, the branch admin D, tills T1-T3, the kitchen K, the restaurant till TR
  say('§TILLFILM_SETUP ROOT=' + ROOT + ' (CPU only, --disable-gpu); seven devices on one folder pipe');
  const A = await open('A', '/erp/idempiere.html?login=GardenAdmin&window=281' + qsNet, () => window.TeamSync && window.__idmpDb && window.__crud && window.__idmpDb.exec('SELECT count(*) FROM ad_table')[0].values[0][0] > 0 && document.querySelector('#idmp-tree') && document.querySelector('#idmp-tree').children.length > 0);
  await A.pg.evaluate(() => window.TeamSync.ready);
  const D = await open('D', '/erp/branch_admin.html?login=50001' + qsMain, () => window.BranchAdmin && window.BranchAdmin.ready);
  const TL = []; for (const lg of [50001, 102, 101]) TL.push(await open('T' + (TL.length + 1), '/erp/till.html?login=' + lg + qsBase, () => window.Till && window.Till.ready));
  const K = NOREST ? null : await open('K', '/erp/kitchen.html?login=50001' + qsBase, () => window.Kitchen && window.Kitchen.ready);
  const TR = NOREST ? null : await open('TR', '/erp/till.html?login=50001&mode=restaurant' + qsBase, () => window.Till && window.Till.ready && window.TillRest);
  const devs = [D].concat(TL, NOREST ? [] : [K, TR]); const space = await T.found(A), org = (await T.rows(A, 'SELECT ad_org_uu AS uu FROM ad_org WHERE ad_org_id=12'))[0];
  for (const d of devs) await T.join(d, space);
  for (let k = 0; k < 10; k++) { for (const d of devs) await T.approve(A, await T.kid(d), 50004, org.uu); await visitAll(devs.concat([A])); const en = []; for (const d of devs) en.push(await T.enrolled(d)); if (en.every(Boolean)) break; await sleep(300); }
  await visitAll(devs.concat([A]), 2); const enr = []; for (const d of devs) enr.push(await T.enrolled(d)); say('§TILLFILM_SETUP enrolled=' + J(enr)); if (!enr.every(Boolean)) throw new Error('devices not enrolled');
  fact('tills', TL.length);
  // the 27 picture URLs through the engine's ordinary product edit (§30.2): model-layer save on EACH till, then the catalog re-read from the DB
  const icons = JSON.parse(fs.readFileSync(path.join(ROOT, 'erp', 'product_icons', 'product_icons.json'), 'utf8')).products; let iconed = 0;
  for (const d of TL.concat(NOREST ? [] : [TR])) { const r = await d.pg.evaluate(async list => { const T = window.Till, E = T.engine(); let n = 0; for (const it of list) { const row = (T.state().prods.filter(p => p.value === it.value)[0]); if (!row) continue;
      const full = await new Promise(res => { E.__crud.modelRun({ table: 'c_order', timing: 'PROCESS', fn: trx => { res(trx.q('SELECT * FROM m_product WHERE m_product_id=' + row.pid)[0]); return { ok: true }; } }, () => {}); }); if (!full) continue;
      await new Promise(res => E.__crud.modelRun({ table: 'm_product', timing: 'SAVE', record: full, id: row.pid, changes: { imageurl: it.url } }, r => { if (!r || !r.ops) return res(); E.__crud.applyOpGroup(r.ops, () => { n++; res(); }); })); }
      const im = await T.rows('SELECT m_product_id AS pid, imageurl AS img FROM m_product WHERE imageurl IS NOT NULL'); T.state().prods.forEach(p => { const x = im.filter(y => String(y.pid) === String(p.pid))[0]; if (x) p.img = x.img; }); return n; }, icons).catch(e => 'ERR ' + e.message); iconed = r; }
  say('§TILLFILM_PICTURES per-till ProductEdit saves=' + iconed + ' of ' + icons.length);
  // ── till helpers
  const pidOf = (d, name) => d.pg.evaluate(n => { const p = window.Till.state().prods.filter(x => x.name === n)[0]; return p ? p.pid : null; }, name);
  async function login(d) { await click(d, '#u1 .u-user:has-text("GardenAdmin")'); await click(d, '#u2 [data-panel="Sales"]'); }
  async function reach(d, name) { const pid = await pidOf(d, name); if (pid == null) throw new Error('no product ' + name); const vis = async () => (await d.pg.$('#products .prod[data-pid="' + pid + '"]')) !== null;
    if (!(await vis())) { const cat = await d.pg.evaluate(id => window.Till.state().prods.filter(p => p.pid === id)[0].cat, pid); if (await d.pg.$('#cats [data-cat-up]')) await click(d, '#cats [data-cat-up]').catch(() => {}); if (await d.pg.$('#cats [data-cat="' + cat + '"]')) await click(d, '#cats [data-cat="' + cat + '"]');
      if (!(await vis())) { const cats = await d.pg.$$eval('#cats [data-cat]', b => b.map(x => x.getAttribute('data-cat'))); for (const c of cats) { await click(d, '#cats [data-cat="' + c + '"]'); if (await vis()) break; if (await d.pg.$('#cats [data-cat-up]')) await click(d, '#cats [data-cat-up]'); } } }
    if (!(await vis())) throw new Error('tile not reachable ' + name); return pid; }
  async function tile(d, name) { const pid = await reach(d, name); await click(d, '#products .prod[data-pid="' + pid + '"]'); }
  async function keys(d, n) { for (const ch of String(n)) await click(d, '#east .key[data-key="' + ch + '"]'); }
  async function payParts(d, parts) { await click(d, '#east .key[data-key="="]'); await d.pg.waitForSelector('#u8.on'); for (const p of parts) { await click(d, '#tabs [data-tab="' + p.tab + '"]'); if (p.amount != null) await typeIn(d, '#tender-amount', p.amount); if (p.ref) { await d.pg.fill('#card-ref', p.ref); await d.pg.fill('#card-auth', p.auth); await hold(300); } if (p !== parts[parts.length - 1]) await click(d, '#addpart'); }
    await click(d, '#pay-ok'); await d.pg.waitForSelector('#u9.on', { timeout: 20000 }); await hold(1800); const key = await d.pg.$eval('#receipt .rf[data-f="Receipt"]', e => e.getAttribute('data-v')); /* v5: standard §39 receipt (42 columns): the raw ticket key is the row's data-v */ await click(d, '#rc-ok'); return key; }
  const tot = d => d.pg.$eval('#t-tot', e => e.textContent);
  const zOf = t => { let ci = -1; t.logs.forEach((l, i) => { if (/^§TILL_CLOSE closed=/.test(l)) ci = i; }); for (let i = ci; i >= 0; i--) { const mm = /^§TILL_Z seq=(\d+) tickets=(\d+) units=\S+ gross=(\S+) net=(\S+) payments=(\d+) bytender=(\{.*?\}) removed=/.exec(t.logs[i]); if (mm) return { tickets: +mm[2], gross: Math.round(+mm[3] * 100), tenders: JSON.parse(mm[6]) }; } return null; };
  const badge = (d, txt) => d.pg.evaluate(t => { let b = document.getElementById('__rc'); if (!b) { b = document.createElement('div'); b.id = '__rc'; b.style.cssText = 'position:fixed;right:10px;top:40px;z-index:2147483000;background:#0b0f17;color:#7dd3fc;border:2px solid #7dd3fc;border-radius:8px;padding:8px 14px;font:700 16px system-ui'; document.body.appendChild(b); } b.textContent = t; }, txt);
  const rcCount = (dev, mk) => since(mk).filter(r => r.dev === dev).length;

  // ═══ b1a: a till you already know
  const T1 = TL[0], T2 = TL[1], T3 = TL[2];
  await segment('b1a', async () => { await hold(1500); await login(T1); const par = await T1.pg.evaluate(() => { const R = window.Till.registry; return R && R.ROWS ? R.ROWS.length : null; }); fact('parity_rows', par);
    const pl = T1.logs.filter(l => /^§TILL_PARITY /.test(l)).pop(); fact('parity_line', pl || '(none printed by the page)'); await hold(1500); }, T1);
  // ═══ b1b: the sample sale by real clicks, split tender
  await segment('b1b', async () => { if (ONLY.length && ONLY.indexOf('b1a') < 0) await login(T1); await keys(T1, 2); await tile(T1, 'Rose Bush'); await tile(T1, 'Hoe 4 ft'); await tile(T1, 'Patio Chair');
    const lines = await T1.pg.evaluate(() => window.Till.state().ticket.lines.map(l => [l.name || l.details, l.qty])); fact('sale_lines', lines.reduce((a, l) => a + Number(l[1]), 0)); fact('sale_lines_detail', J(lines)); const total = await tot(T1); fact('sale_total', total);
    const half = (Number(total) / 2).toFixed(2); const key = await payParts(T1, [{ tab: 'cash', amount: half }, { tab: 'magcard', amount: (Number(total) - Number(half)).toFixed(2), ref: 'TERM-0001', auth: 'A1B2C3' }]); fact('sale_receipt_key', key);
    const dep = T1.logs.filter(l => /^§TILL_DEPOSIT /.test(l)).pop() || ''; fact('deposit_line', dep.slice(0, 200)); }, T1);
  // ═══ b1c: the catalog folds away and opens again (§33.8)
  await segment('b1c', async () => { const has = await T1.pg.$('#catbar'); if (!has) { blocked.push('b1c'); say('§TILLFILM_BLOCKED id=b1c gate=W-TILL-CATALOG-TOGGLE (#catbar absent)'); throw new Error('no #catbar'); }
    const h = () => T1.pg.evaluate(() => ({ south: Math.round(document.getElementById('south').getBoundingClientRect().height), body: !document.getElementById('catbody').hidden }));
    fact('catalog_expanded', J(await h())); await click(T1, '#catbar'); await hold(900); fact('catalog_folded', J(await h())); await click(T1, '#catbar'); await hold(900); fact('catalog_reopened', J(await h())); }, T1);
  // ═══ b2a: the floor map, a table, Send Order, the kitchen card
  let sentRef = null;
  await segment('b2a', async () => { await login(TR); await TR.pg.waitForSelector('#fl-map .place', { timeout: 20000 }); const dr = TR.logs.filter(l => /^§TILL_REST_DRAW/.test(l)).pop() || ''; fact('floor_draw', dr); const m = /chairs=(\d+)/.exec(dr); fact('chairs_drawn', m ? m[1] : 0); if (!m || !+m[1]) { blocked.push('b2a-chairs'); say('§TILLFILM_BLOCKED id=b2a gate=W-REST-FLOOR (no chairs drawn)'); }
    await hold(1800); const place = await TR.pg.$eval('#fl-map .place', e => e.getAttribute('data-place')); await click(TR, '#fl-map [data-place="' + place + '"]'); await TR.pg.waitForSelector('#u3.on', { timeout: 15000 });
    await tile(TR, 'Rose Bush'); await tile(TR, 'Rose Bush'); await tile(TR, 'Hoe 4 ft'); const mk0 = mark(); await click(TR, '#north [data-btn="Send Order"], [data-btn="Send Order"]'); await sleep(2500); sentRef = await TR.pg.evaluate(() => { const k = window.Till.state().kitchen; return k ? JSON.stringify(k).slice(0, 200) : null; }); fact('send_order_state', sentRef);
    await T.visit(TR); await T.visit(K); await K.pg.evaluate(() => window.Kitchen.tick()).catch(() => {}); await K.pg.evaluate(() => window.Kitchen.render()).catch(() => {}); await cam.on(K); await hold(600); await K.pg.mouse.move(700, 300, { steps: 8 }); await K.pg.waitForSelector('.kcard', { timeout: 20000 }); fact('kitchen_cards', (await K.pg.$$('.kcard')).length); await hold(2500); }, TR);
  // ═══ b2b: bump, ready on the till, relay per action, a booking
  await segment('b2b', async () => { await cam.on(K); await click(K, '.kcard button[data-act="D"]'); await sleep(1500); await T.visit(K); await T.visit(TR); await TR.pg.evaluate(() => { window.TillKds.tick(); return window.TillKds.refresh(); }).catch(() => {}); await cam.on(TR); await hold(1500);
    fact('till_ready_notice', TR.logs.filter(l => /§TILL_KITCHEN_NOTICE/.test(l)).slice(-1)[0] || '(none)');
    const c0 = await TR.pg.evaluate(() => Object.assign({}, window.TillRest.counts)); await TR.pg.evaluate(() => { const S = window.Till.state(); for (let i = 0; i < 3; i++) window.Till.addLine(S.prods[i], 1); }); const c1 = await TR.pg.evaluate(() => Object.assign({}, window.TillRest.counts)); fact('tap_deposits', c1.deposits - c0.deposits);
    await click(TR, '#floorbar [data-btn="Tables"]'); await TR.pg.waitForSelector('#fl-map .place'); await sleep(600); const c2 = await TR.pg.evaluate(() => Object.assign({}, window.TillRest.counts)); fact('leave_deposits', c2.deposits - c1.deposits);
    await click(TR, '#fl-res'); await TR.pg.waitForSelector('#reservations'); await typeIn(TR, '#rs-customer', 'Aminah'); await typeIn(TR, '#rs-chairs', '4'); await TR.pg.fill('#rs-date', '2026-11-05T19:00'); await click(TR, '#rs-save'); await TR.pg.waitForSelector('[data-res-in]');
    const pl = await TR.pg.$$eval('#rs-place option', o => o.map(x => x.value).filter(Boolean)); if (pl.length) await TR.pg.selectOption('#rs-place', pl[1] || pl[0]); await click(TR, '[data-res-in]'); await TR.pg.waitForSelector('#u3.on', { timeout: 15000 }); fact('reservation_checked_in', 'true'); await hold(1500); }, K);
  // ═══ b3a (v4, §38 topology): three tills ring on their own localhost, the branch relay is their ONLY pipe (badge: internet requests counted by the recording), each Close Cash; then the MAIN till (D) collects over the branch relay
  const rung = [0, 0, 0]; let dayReq = 0, tillKeys = [], tillZ = [];
  const lanCount = (dev, mk) => LANREQ.slice(mk).filter(r => r.dev === dev).length, BADGE = (d, mk) => 'INTERNET REQUESTS (counted by the recording) · this till: ' + rcCount(d.name, mk.net) + '   ·   BRANCH RELAY (LAN): ' + lanCount(d.name, mk.lan);
  const mk3 = () => ({ net: mark(), lan: LANREQ.length }); let day0 = null;
  await segment('b3a', async () => { day0 = mk3(); const mkDay = day0; if (B3ONLY) await login(T1); await badge(T1, BADGE(T1, mkDay)); await login(T2); await login(T3);
    for (let i = 0; i < 3; i++) { const d = TL[i], n = i === 0 ? 1 : 2; if (i > 0) await cam.on(d); for (let j = 0; j < n; j++) { await tile(d, 'Rose Bush'); if (j % 2 === 0) await tile(d, 'Hoe 4 ft'); await payParts(d, [{ tab: 'cash', amount: await tot(d) }]); rung[i]++; } await sleep(600); await badge(d, BADGE(d, mkDay)); await hold(900); }
    for (let i = 0; i < 3; i++) { const d = TL[i]; await cam.on(d); await d.pg.evaluate(() => window.Till.go('close')); await hold(900); await click(d, '#zclose'); await click(d, '#zconfirm'); await d.pg.waitForFunction(() => /Cash Closed OK/.test(document.querySelector('#zdone').textContent), null, { timeout: 30000 }); await hold(1600); await badge(d, BADGE(d, mkDay)); tillZ.push(zOf(d)); await hold(900); }
    dayReq = since(mkDay.net).filter(r => /^T\d$/.test(r.dev)).length; fact('relay_day', dayReq); fact('tickets_rung', rung.join('+') + '=' + (rung[0] + rung[1] + rung[2])); fact('b3_tickets', rung[0] + rung[1] + rung[2]); fact('till_lan_requests', LANREQ.slice(mkDay.lan).filter(r => /^T\d$/.test(r.dev)).length);
    for (const d of TL) tillKeys.push(await d.pg.evaluate(() => window.Till.state().cfg.tillKey)); fact('till_keys', tillKeys.join(',')); fact('till_z', J(tillZ));
    // the main till collects (its own page: the branch POS admin of the flagged till); the table shows what came over the branch relay
    await cam.on(D); await hold(900); await bridge(); await typeIn(D, '#a-tills', tillKeys.join(', ')); await D.pg.dispatchEvent('#a-tills', 'change'); await sleep(500); await click(D, '#a-refresh'); await bridge(); await hold(2500);
    const cl = D.logs.filter(l => /^§LAN_COLLECT newFiles=/.test(l)); const tot3 = cl.length ? /totalLines=(\d+)/.exec(cl[cl.length - 1]) : null; fact('b3_lines', tot3 ? tot3[1] : 'none'); fact('lan_collect_last', cl.slice(-1)[0] || '(none)'); fact('lan_collect_dup', cl.reduce((a, l) => a + Number((/dupLines=(\d+)/.exec(l) || [0, 0])[1]), 0));
    fact('main_flag', D.logs.filter(l => /^§LAN_ADMIN main=/.test(l)).slice(-1)[0] || '(none)'); await badge(D, 'MAIN TILL · collected over the BRANCH RELAY (LAN) · internet requests by the tills: ' + dayReq); await hold(1500); }, T1);
  // ═══ b3b: the main till's screen (every till's tickets and Z), ONE send to the internet relay
  await segment('b3b', async () => { await bridge(); await cam.on(D); await D.pg.evaluate(() => window.BranchAdmin.render()).catch(() => {}); await hold(2500);
    const scr = await D.pg.$$eval('#a-rows tr', tr => tr.map(r => [].map.call(r.cells, c => c.textContent))); fact('admin_rows', J(scr.map(r => [r[0], r[1], r[2], r[3]]))); const gross = await D.pg.$eval('#t-gross', e => e.textContent); fact('statement_gross', gross);
    const sumZ = tillZ.reduce((a, z) => a + (z ? z.gross : 0), 0); fact('sum_till_z_gross_cents', sumZ); fact('z_equal', String(Math.round(Number(gross) * 100) === sumZ)); await hold(1500);
    const mkS = mark(); await badge(D, 'INTERNET REQUESTS (counted by the recording) · this send: 0'); await click(D, '#a-send'); const t0 = Date.now(); while (Date.now() - t0 < 90000 && !/sent|Sent|EODA/.test(await D.pg.$eval('#a-sendnote', e => e.textContent).catch(() => ''))) await sleep(300);
    await sleep(2000); const hubPuts = since(mkS).filter(r => r.dev === 'D' && r.m === 'PUT' && lane(r) === 'hub').length; await badge(D, 'INTERNET REQUESTS (counted by the recording) · this send: ' + rcCount('D', mkS) + ' (hub-lane puts ' + hubPuts + ')'); fact('eoda_send', hubPuts); fact('send_note', await D.pg.$eval('#a-sendnote', e => e.textContent)); await hold(2500); }, D);
  // ═══ b4a: head office, Branch Day Close in the real menu
  await segment('b4a', async () => { await visitAll([A, D, A]); const ni = await T.rows(A, 'SELECT count(*) AS n FROM i_order'); fact('hq_i_order_rows', ni[0] && ni[0].n); const inst = await A.pg.evaluate(async u => { const r = window.PluginEngine._reg().system; await r.installBundle(u); await r.startBundle('org.kernel.friendly-ops'); return true; }, base + '/erp/plugins/friendly_ops.mjs'); fact('friendly_ops_installed', inst); await cam.on(A); await hold(1500);
    // the menu is role-scoped at LOGIN (idempiere.html buildMenu/SES.scopeMenu): log out and in again through the real login screen so the new head-office process is on the role's menu
    await click(A, '#idmp-switch-btn'); await A.pg.waitForSelector('#idmp-login-clients .idmp-login-user', { timeout: 20000 }); await hold(900); await click(A, '#idmp-login-clients .idmp-login-user:has-text("GardenWorld")'); await A.pg.waitForSelector('#idmp-login-users .idmp-login-user', { timeout: 20000 }); await hold(700); await click(A, '#idmp-login-users .idmp-login-user:has-text("GardenAdmin")');
    await A.pg.waitForSelector('#idmp-login-role', { state: 'visible', timeout: 20000 }); await hold(800); if (await A.pg.$('#idmp-login-org')) await A.pg.selectOption('#idmp-login-org', { label: 'HQ' }).catch(() => {}); await click(A, '#idmp-login-ok'); await A.pg.waitForFunction(() => document.getElementById('idmp-login').style.display === 'none', null, { timeout: 40000 }); await hold(1200); const id = 9534041; for (let i = 0; i < 20 && !(await A.pg.$('#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]')); i++) await sleep(500);
    await A.pg.evaluate(i => { const leaf = document.querySelector('#idmp-tree .idmp-row.leaf[data-menu-id="' + i + '"]'); if (!leaf) throw new Error('menu item ' + i + ' not in the tree'); let n = leaf.parentElement; while (n && n.id !== 'idmp-tree') { if (n.classList && n.classList.contains('idmp-node')) n.classList.add('open'); n = n.parentElement; } leaf.scrollIntoView(); }, id);
    await hold(900); await click(A, '#idmp-tree .idmp-row.leaf[data-menu-id="' + id + '"]'); await A.pg.waitForSelector('[data-proc-run]', { timeout: 30000 }); await hold(1800);
    const dayRow = await T.rows(A, "SELECT DISTINCT substr(dateordered,1,10) AS d FROM i_order WHERE i_isimported='N' LIMIT 1"); const day = dayRow && dayRow[0] && dayRow[0].d; fact('dayclose_businessday', day);
    await A.pg.selectOption('[data-proc-param=AD_Org_ID]', { label: 'Store Central' }).catch(() => {}); await glide(A, '[data-proc-param=BusinessDay]'); await A.pg.fill('[data-proc-param=BusinessDay]', day); await hold(500); await A.pg.selectOption('[data-proc-param=C_BankAccount_ID]', '100').catch(() => {}); await A.pg.selectOption('[data-proc-param=ReplenishmentCreate]', 'POO').catch(() => {}); await A.pg.selectOption('[data-proc-param=C_DocType_ID]', '126').catch(() => {}); await hold(1500);
    fact('dayclose_params', J(await A.pg.$$eval('[data-proc-param]', e => e.map(x => x.getAttribute('data-proc-param') + '=' + (x.value || ''))))); const n0 = PAGELOG.length; await click(A, '[data-proc-run]');
    for (let i = 0; i < 240 && !PAGELOG.slice(n0).some(l => /§DAYCLOSE-(DONE|VERDICT|SUMMARY|STOP|EMPTY)|Branch Day Close (done|STOPPED)/.test(l)); i++) await sleep(500); await hold(3000);
    const txt = await A.pg.$eval('#idmp-content', e => e.innerText).catch(() => ''); fact('dayclose_message', (/Branch Day Close (done|STOPPED)[^\n]*|Nothing to close[^\n]*/.exec(txt) || ['(no result text)'])[0]);
    fact('dayclose_log', PAGELOG.slice(n0).filter(l => /§DAYCLOSE/.test(l)).slice(-5).join(' || ').slice(0, 400)); await hold(2000); }, A);
  // ═══ b5a: the morning batch: ONE price edited at head office, ONE row reaches the tills
  await segment('b5a', async () => { const VER = Number((await T.rows(A, 'SELECT m_pricelist_version_id AS v FROM m_pricelist_version WHERE m_pricelist_id=(SELECT m_pricelist_id FROM c_pos WHERE ad_org_id=12) ORDER BY validfrom DESC, m_pricelist_version_id DESC LIMIT 1'))[0].v);
    const SC = require(path.join(ROOT, 'erp', 'soda_core.js')), cr = (t, f) => ({ op_type: 'CRUD_CREATE', key: t, table: t, verb: 'create', fields: f }), hq1 = ops => eng(A, (W, o) => new Promise(res => { const t = setTimeout(() => res({ committed: false, reason: 'timeout' }), 60000); W.__crud.applyOpGroup(o, r => { clearTimeout(t); res(r); }); }), ops);
    const PQ = 'SELECT m_product_id AS p, pricestd AS s FROM m_productprice WHERE m_pricelist_version_id=' + VER + ' ORDER BY m_product_id'; const pid = await pidOf(T1, 'Rose Bush'); const pr = (await T.rows(A, 'SELECT * FROM m_productprice WHERE m_pricelist_version_id=' + VER + ' AND m_product_id=' + pid))[0];
    const n0 = (await T.rows(A, PQ)).length; fact('prices_total', n0); await cam.on(T1); await T1.pg.evaluate(() => window.Till.go('sales')); await reach(T1, 'Rose Bush'); await hold(1800);
    const before = await T1.pg.$eval('#products .prod[data-pid="' + pid + '"]', e => e.textContent).catch(() => '?'); fact('tile_before', before);
    const stamp = new Date().toISOString().slice(0, 19).replace('T', ' '), np = Number(pr.pricestd) + 2.5;
    const up = await hq1([{ op_type: 'CRUD_UPDATE', key: 'm_productprice', table: 'm_productprice', verb: 'update', id: pr.m_productprice_uu, idCol: 'm_productprice_uu', changes: { pricestd: { old: pr.pricestd, new: np }, updated: { old: pr.updated, new: stamp } } }]); fact('hq_edit_committed', up && up.committed);
    const P = await T.rows(A, 'SELECT * FROM m_productprice WHERE m_pricelist_version_id=' + VER), R = await T.rows(A, 'SELECT * FROM m_product WHERE ad_client_id IN (0,11)'), Tx = await T.rows(A, 'SELECT * FROM c_tax');
    const d = SC.refDelta({ since: '2000-01-01 00:00:00'.length ? new Date(Date.now() - 36e5).toISOString().slice(0, 19).replace('T', ' ') : '', upto: stamp, batchId: 'S-film', seq: 1, client: 11, org: 12, version: VER, prices: P, products: R, taxes: Tx }); fact('soda_rows', J(d.counts));
    await hq1(d.rows.map(r => cr('pos_sodaref', r))); await T.visit(A); await visitAll([D, A, D]); const fr = await D.pg.evaluate(() => window.BranchAdmin.fan()); fact('fan_rows', fr && fr.rows); const snap = []; for (const t of TL) await t.pg.evaluate(() => window.Till.visit()).catch(() => {});
    for (const t of TL) snap.push((await T.rows(t, 'SELECT pricestd AS s FROM m_productprice WHERE m_pricelist_version_id=' + VER + ' AND m_product_id=' + pid))[0]); fact('till_prices_after', J(snap)); await T1.pg.evaluate(async v => { const T = window.Till, S = T.state(); const rr = await T.rows('SELECT p.m_product_id AS pid, pp.pricestd AS price FROM m_product p JOIN m_productprice pp ON pp.m_product_id=p.m_product_id AND pp.m_pricelist_version_id=' + v); S.prods.forEach(p => { const x = rr.filter(y => String(y.pid) === String(p.pid))[0]; if (x) p.price = x.price; }); T.go('sales'); }, VER);
    await reach(T1, 'Rose Bush'); await hold(2200); fact('tile_after', await T1.pg.$eval('#products .prod[data-pid="' + pid + '"]', e => e.textContent).catch(() => '?')); await hold(1500); }, T1);
  // ═══ b5b: receive stock: a short receipt typed on the admin's panel
  await segment('b5b', async () => { const cr = (t, f) => ({ op_type: 'CRUD_CREATE', key: t, table: t, verb: 'create', fields: f }), rowsOf = async (d, q) => { const r = await T.rows(d, q); return Array.isArray(r) ? r : []; };
    const hqW = ops => eng(A, (W, o) => new Promise(res => { const t = setTimeout(() => res({ committed: false, reason: 'timeout' }), 60000); W.__crud.applyOpGroup(o, r => { clearTimeout(t); res(r); }); }), ops);
    const hqDoc = (table, id, act) => eng(A, (W, x) => new Promise(res => { let out = null; W.__crud.modelRun({ table: x.table, timing: 'PROCESS', fn: trx => { const r = W.ModelLayer.processIt(trx, x.table, x.id, x.act); out = { ok: !!r.ok, status: r.status }; return { ok: true }; } }, r => { if (!r || r.ok === false || !r.ops || !r.ops.length) return res({ out, committed: false }); W.__crud.applyOpGroup(r.ops, g => res({ out, committed: !!(g && g.committed) }), r.observed); }); }), { table, id, act });
    const HQL = 101, STL = 102, HQO = 11, STAMP = '2026-11-04 00:00:00', PA = Number((await rowsOf(A, 'SELECT m_product_id AS p FROM m_productprice ORDER BY m_product_id LIMIT 1'))[0].p), base = { ad_client_id: 11, ad_org_id: HQO, isactive: 'Y' };
    const dt = (await rowsOf(A, 'SELECT isintransit FROM c_doctype WHERE c_doctype_id=143'))[0]; if (dt && dt.isintransit !== 'Y') await hqW([{ op_type: 'CRUD_UPDATE', key: 'c_doctype', table: 'c_doctype', verb: 'update', id: 143, changes: { isintransit: { old: dt.isintransit, new: 'Y' } } }]);
    const onhand = async loc => Number((await rowsOf(A, 'SELECT COALESCE(SUM(qtyonhand),0) AS s FROM m_storageonhand WHERE m_locator_id=' + loc + ' AND m_product_id=' + PA))[0].s);
    if ((await onhand(HQL)) < 20) await hqW([cr('m_storageonhand', Object.assign({ m_locator_id: HQL, m_product_id: PA, m_attributesetinstance_id: 0, qtyonhand: 20, datematerialpolicy: STAMP }, base))]);
    const s0 = { src: await onhand(HQL), tgt: await onhand(STL) }; fact('src_before', s0.src); fact('tgt_before', s0.tgt);
    await hqW([cr('m_movement', Object.assign({ documentno: 'FILM-MV-1', movementdate: STAMP, c_doctype_id: 143, docstatus: 'DR', docaction: 'CO', isintransit: 'N', processed: 'N', description: 'film' }, base)), cr('m_movementline', Object.assign({ m_movement_id: { __opRef: 0 }, line: 10, m_product_id: PA, m_locator_id: HQL, m_locatorto_id: STL, movementqty: 5, qtyentered: 5, c_uom_id: 100 }, base))]);
    const mid = (await rowsOf(A, "SELECT m_movement_id AS id FROM m_movement WHERE documentno='FILM-MV-1'"))[0]; await hqDoc('m_movement', mid.id, 'PR'); await hqDoc('m_movement', mid.id, 'CO'); await visitAll([A, D, A, D]);
    await cam.on(D); await D.pg.click('#a-refresh'); await D.pg.waitForFunction(() => !document.getElementById('a-soda-recv').disabled, null, { timeout: 30000 }); await hold(1200); await click(D, '#a-soda-recv'); await D.pg.waitForSelector('#a-recv table.rc tbody tr', { timeout: 15000 }); await hold(2000);
    fact('recv_target', await D.pg.$eval('#a-recv tbody tr', r => r.getAttribute('data-target'))); await typeIn(D, '#a-recv [data-rc-conf]', '3'); await typeIn(D, '#a-recv [data-rc-scr]', '1'); fact('recv_difference', await D.pg.$eval('#a-recv [data-rc-diff]', e => e.textContent)); await hold(1800);
    await click(D, '#rc-confirm'); await sleep(2500); await visitAll([D, A]); await D.pg.evaluate(() => window.BranchAdmin.send(false)).catch(() => {}); await sleep(2500); await visitAll([A, D, A]); await hold(1500);
    fact('recv_confirmed', 3); fact('recv_scrapped', 1); fact('src_after', await onhand(HQL)); fact('tgt_after', await onhand(STL)); fact('apply_log', A.logs.filter(l => /§SODA_APPLY/.test(l)).slice(-1)[0] || '(none)'); }, D);
  await cam.off();
  // ═══ cut each segment's frames into its own mp4 (frame durations bounded by the next frame, a pause or the segment end)
  const segs = {}; EV.forEach((e, i) => { if (e.fn) (segs[e.seg] = segs[e.seg] || []).push({ e, i }); });
  const REC_OF = { b1a: 'know', b1b: 'sale', b1c: 'fold', b2a: 'floor', b2b: 'bump', b3a: 'tills', b3b: 'admin', b4a: 'close', b5a: 'price', b5b: 'receive' };
  for (const [id, list] of Object.entries(segs)) { const failed = EV.some(e => e.end === id && e.failed); if (failed || !list.length) { say('§TILLFILM_SEG id=' + id + ' frames=' + list.length + ' NOT-WRITTEN (failed)'); continue; }
    const lines = []; list.forEach(({ e, i }, k) => { let end = null; for (let j = i + 1; j < EV.length; j++) { const x = EV[j]; if (x.cut) { end = x.cut; break; } if (x.fn) { end = x.ts; break; } } if (end === null || end < e.ts) end = e.ts + 0.04; lines.push(`file '${e.fn}'`, `duration ${Math.max(0.04, Math.min(end - e.ts, 8)).toFixed(4)}`); });
    lines.push(`file '${list[list.length - 1].e.fn}'`); const lf = path.join(OUT, 'frames_' + id + '.txt'); fs.writeFileSync(lf, lines.join('\n') + '\n'); const mp4 = path.join(OUT, 'seg_' + REC_OF[id] + '.mp4');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lf, '-vf', 'fps=24,scale=1920:840:flags=lanczos,pad=1920:1080:0:0:color=0x0f172a,format=yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', mp4]);
    say('§TILLFILM_SEG id=' + id + ' frames=' + list.length + ' dur=' + execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4]).toString().trim() + 's out=' + mp4); }
  say('§TILLFILM_DONE beats_recorded=' + beatsDone.join(',') + ' blocked=' + (blocked.join(',') || 'none') + ' page_errors=' + PAGELOG.filter(l => /PAGEERR/.test(l)).length);
  fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n'); fs.writeFileSync(path.join(OUT, 'page.log'), PAGELOG.join('\n') + '\n'); await browser.close(); server.close(); process.exit(0);
})().catch(e => { console.error(e); fs.writeFileSync(path.join(OUT, 'film.log'), LOG.join('\n') + '\n§TILLFILM_FATAL ' + (e.stack || e) + '\n'); fs.writeFileSync(path.join(OUT, 'page.log'), PAGELOG.join('\n') + '\n'); process.exit(1); });
