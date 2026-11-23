// ⚠ DO NOT REMOVE — SCOPE: film 6 PROMO "CH 0 · Built to be read" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 6 PROMO SPEC). READ out/shoot.log after every run: exit code is not evidence. Usage: node shoot.js   (ONE VS Code session on the AFTER tree shoots every scene: hook, 1 read = run, 2 the editor knows, 3 refused, 4 proven).
// The REAL VS Code (throwaway profile, Code Facts installed from the AFTER tree's own sources) on a private virtual display, driven through the extension API (ext_driver.js), shot with the X server's own `import`; and, in the `after` scene, the REAL Viewer of the AFTER tree
// served from a localhost port of our own, in a headless Chrome on the CPU with its service worker ON. Every typed line goes into VS Code's OWN terminal panel, key by key (a still per two characters), and is logged as §FILM_TYPED (guard.js compares it with the line facts.js ran).
// Rectangles the pointer and the amber pulse need are read from the editor's own layout (Electron DevTools port: DOM boxes in device px == still px), never eyeballed; pointer.py re-derives the token ones from the pixels. Nothing is edited outside the throwaway trees; each tree's hash is logged before and after (§FILM_TREE).
// GPU rule: refuses to start while a `node cli_silent_bake` runs. Writes out/stills/*.png, out/shoot.log, and merges its beats into out/scene.json (the contract cards.js reads). The `after` scene writes the §HARM line (the DOM text of the Viewer before the edit, after save + reload, after the press + reload).
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), http = require('http');
const K = require('./lib_vsc.js'), TY = require('./typed.js'), { sleep, log, OUT } = K, H = TY.H;
const which = 'after';
const bake = cp.spawnSync('pgrep', ['-f', '^node cli_silent_bake'], { encoding: 'utf8' }).stdout.trim(); if (bake) { console.log('§SHOOT REFUSED a GPU bake is running (pid ' + bake.split('\n')[0] + '): wait'); process.exit(3); }
const TREE = TY.TREES[which], PORT = +(process.env.FILM_PORT || 8641), pad = n => String(n).padStart(3, '0');
const treeHash = dir => { const a = cp.spawnSync('bash', ['-c', 'cd ' + dir + ' && { git rev-parse HEAD; git status --short; git diff HEAD; } | sha1sum | cut -c1-12'], { encoding: 'utf8' }).stdout.trim(); return a; };
fs.mkdirSync(path.join(OUT, 'stills'), { recursive: true });
const sceneFile = path.join(OUT, 'scene.json'), SCENE = { beats: {}, hash: {} };
const save = () => fs.writeFileSync(sceneFile, JSON.stringify(SCENE, null, 1));

// ---- the page-side helper: the box (device px) of the first visible occurrence of a text, searched under a CSS scope. Returned as {x,y,w,h} or null.
const RECT_FN = `function(){}`;   // placeholder (kept for documentation): each call below builds its own expression
const rectOfText = (vs, text, scope, nth) => vs.rects(`function(){ const T=${JSON.stringify(text)}, S=${JSON.stringify(scope || 'body')}, N=${nth || 0}; let k=0; for (const root of document.querySelectorAll(S)) { const w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while((n=w.nextNode())){ const i=n.nodeValue.indexOf(T); if(i<0) continue; const r=document.createRange(); r.setStart(n,i); r.setEnd(n,i+T.length); const b=r.getBoundingClientRect(); if(b.width<1||b.height<1) continue; if(k++<N) continue; return {x:Math.round(b.left),y:Math.round(b.top),w:Math.round(b.width),h:Math.round(b.height)}; } } return null; }`);
const rectOfSel = (vs, sel, filterText) => vs.rects(`function(){ const F=${JSON.stringify(filterText || '')}; for (const e of document.querySelectorAll(${JSON.stringify(sel)})) { if (F && (e.textContent||'').indexOf(F)<0 && (e.getAttribute('aria-label')||'').indexOf(F)<0) continue; const b=e.getBoundingClientRect(); if(b.width<1||b.height<1) continue; return {x:Math.round(b.left),y:Math.round(b.top),w:Math.round(b.width),h:Math.round(b.height)}; } return null; }`);
const union = rs => { rs = rs.filter(Boolean); if (!rs.length) return null; const x0 = Math.min(...rs.map(r => r.x)), y0 = Math.min(...rs.map(r => r.y)), x1 = Math.max(...rs.map(r => r.x + r.w)), y1 = Math.max(...rs.map(r => r.y + r.h)); return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; };

// ---- the terminal: open it, type a line key by key (a still per two characters), wait until the shell has no child, take the answer still
const termOpen = async vs => { await vs.drv(`await vscode.commands.executeCommand('workbench.action.terminal.new'); await sleep(3000); const t = vscode.window.activeTerminal; globalThis.__pid = await t.processId; return __pid`); log('terminal open shell_pid=' + await vs.drv('return globalThis.__pid')); };
const busy = async vs => { const pid = await vs.drv('return globalThis.__pid'); return cp.spawnSync('pgrep', ['-P', String(pid)], { encoding: 'utf8' }).stdout.trim() !== ''; };
const termRect = vs => rectOfSel(vs, '.part.panel');
async function typeCmd(vs, id, text, o) {
  o = o || {}; fs.appendFileSync(path.join(OUT, 'shoot.log'), '§FILM_TYPED id=' + id + ' text=' + JSON.stringify(text) + '\n');
  await vs.drv(`await vscode.commands.executeCommand('workbench.action.terminal.focus'); await sleep(400)`);
  const start = id + '_k000'; await vs.still(start); const keys = [];
  for (let i = 2; i <= text.length + 1; i += 2) { const chunk = text.slice(i - 2, i); await vs.drv(`vscode.window.activeTerminal.sendText(${JSON.stringify(chunk)}, false); await sleep(110)`); const nm = id + '_k' + pad(i); await vs.still(nm); keys.push(nm); }
  await vs.drv(`vscode.window.activeTerminal.sendText('', true)`); await sleep(120); const ret = id + '_ret'; await vs.still(ret);
  const t0 = Date.now(); const running = []; let n = 0; await sleep(500);
  while (await busy(vs)) { if (Date.now() - t0 > 900000) throw new Error('command ' + id + ' still running after 15 min'); if (o.runShots && n < o.runShots && (Date.now() - t0) > 1500 * (n + 1)) { const nm = id + '_run' + n; await vs.still(nm); running.push(nm); n++; } await sleep(400); }
  await sleep(700); const ans = id + '_ans'; await vs.still(ans); log('typed ' + id + ' keys=' + keys.length + ' secs=' + ((Date.now() - t0) / 1000).toFixed(1));
  return { kind: 'type', id, text, start, keys, ret, ans, running: running.length ? running : null, first: !!o.first, label: o.label || '' }; }


const sha8 = b => require('crypto').createHash('sha256').update(b).digest('hex').slice(0, 8);
const httpGet = url => new Promise((res, rej) => http.get(url, r => { const c = []; r.on('data', d => c.push(d)); r.on('end', () => res({ status: r.statusCode, body: Buffer.concat(c) })); }).on('error', rej));
(async () => {
  const t0 = Date.now(); fs.appendFileSync(path.join(OUT, 'shoot.log'), '§SHOOT promo tree=' + TREE + ' started ' + new Date().toISOString() + '\n');
  const MIN = '/tmp/wt-film6-min/site', PORT_MIN = PORT + 2; if (!fs.existsSync(path.join(MIN, H.file))) throw new Error('run facts.js first (the minified copy is made there)');
  SCENE.hash.after_before = treeHash(TREE); log('§FILM_TREE after before ' + SCENE.hash.after_before);
  await K.xvfb(1920, 1080); { const prof0 = K.prepProfile(TREE); K.installCodeFacts(TREE, prof0); }   // Code Facts, packed from the AFTER tree's own sources, into the THROWAWAY extensions folder only (the display must be up)
  const vs = await K.vscode(TREE, 1920, 850, {}); SCENE.vscode = await vs.drv('return vscode.version');
  await vs.drv(`await vscode.commands.executeCommand('notifications.toggleDnd').then(()=>{},()=>{}); await vscode.commands.executeCommand('notifications.clearAll').then(()=>{},()=>{})`);   // no toast in any frame (a project-wide-JS hint covered the corner in the first run)
  { const _still = vs.still, toastUp = () => rectOfSel(vs, '.notifications-toasts .notification-toast'); vs.still = async n => { for (let k = 0; k < 6; k++) { await vs.drv(`await vscode.commands.executeCommand('notifications.clearAll').then(()=>{},()=>{}); await sleep(250)`); if (!(await toastUp())) break; if (k === 5) log('§TOAST_LEFT a notification is still up in ' + n); } return _still(n); }; }   // check: no notification toast in a frame (the project-wide-JS hint arrives late, once)
  log('§FILM_CODEFACTS ' + JSON.stringify(await vs.drv(`const ext = vscode.extensions.getExtension('bim-devtools.code-facts'); if (!ext) return { installed: false }; const api = await ext.activate(), fresh = await api.whenFresh(); return { installed: true, active: ext.isActive, version: ext.packageJSON.version, from: ext.extensionPath.indexOf('film_version_numbers') >= 0 ? 'throwaway-extensions-folder' : ext.extensionPath, fresh: fresh && fresh.line }`)));
  let V = null, V2 = null; const srvs = [];
  try {
    const items = {}, beat = (id, label) => (items[id] = { layout: 'full', label, items: [] });
    const win = async h => { vs.win(0, 0, 1920, h); await sleep(1800); };
    await win(850);
    const calm = () => vs.drv(`for (const c of ['notifications.clearAll','workbench.action.closeAuxiliaryBar']) await vscode.commands.executeCommand(c).then(()=>{},()=>{}); await sleep(300)`);
    const cmd = c => vs.drv(`await vscode.commands.executeCommand(${JSON.stringify(c)}).then(()=>{},()=>{}); await sleep(500)`);
    const openFile = (file, line, col) => vs.drv(`const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(${JSON.stringify(path.join(TREE, '/'))} + ${JSON.stringify(file)})); const ed = await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.One }); const p = new vscode.Position(${line - 1}, ${col || 0}); ed.selection = new vscode.Selection(p, p); ed.revealRange(new vscode.Range(p, p), vscode.TextEditorRevealType.InCenter); await sleep(900); return doc.lineAt(${line - 1}).text.length`);
    const caretTo = (line, col) => vs.drv(`const ed = vscode.window.activeTextEditor; const p = new vscode.Position(${line - 1}, ${col}); ed.selection = new vscode.Selection(p, p); await sleep(700)`);
    const selectTok = async (line, text, nth) => { const r = await vs.drv(`const ed = vscode.window.activeTextEditor; const t = ed.document.lineAt(${line - 1}).text; let c0 = -1; for (let k = 0; k <= ${nth || 0}; k++) c0 = t.indexOf(${JSON.stringify(text)}, c0 + 1); if (c0 < 0) return null; ed.selection = new vscode.Selection(${line - 1}, c0, ${line - 1}, c0 + ${text.length}); await sleep(700); return c0`); if (r == null) throw new Error('token ' + text + ' not on line ' + line); return r; };
    const selRect = () => rectOfSel(vs, '.monaco-editor .selected-text');   // the editor's OWN selection box = the token's real rectangle
    const lineOf = (file, re) => { const L = fs.readFileSync(path.join(TREE, file), 'utf8').split('\n'); const i = L.findIndex(l => re.test(l)); if (i < 0) throw new Error('no line ' + re + ' in ' + file); return i + 1; };
    const X = H.file, S0 = H.old, S1 = H.new, src0 = fs.readFileSync(path.join(TREE, X), 'utf8'), at = src0.indexOf(H.litOld) + 1; if (at < 1 || src0.split(H.litOld).length !== 2) throw new Error('the example literal is not exactly once in ' + X);
    const pre0 = src0.slice(0, at).split('\n'), line = pre0.length, col0 = pre0[pre0.length - 1].length; let pre = 0; while (pre < S0.length && S0[pre] === S1[pre]) pre++; let suf = 0; while (suf < S0.length - pre && S0[S0.length - 1 - suf] === S1[S1.length - 1 - suf]) suf++; const ins = S1.slice(pre, S1.length - suf), insCol = col0 + pre;
    log('edit: ' + X + ':' + line + ' insert ' + JSON.stringify(ins) + ' at col ' + insCol);
    // ---- servers: the AFTER tree, and the deploy-minified copy of the one file
    srvs.push(K.spawn('node', [path.join(TREE, 'scripts', '_fast_static_server.js'), String(PORT), TREE], { stdio: 'ignore' }), K.spawn('node', [path.join(TREE, 'scripts', '_fast_static_server.js'), String(PORT_MIN), MIN], { stdio: 'ignore' })); await sleep(1000);

    // ================= HOOK: the repo opening in VS Code (the cover card is laid over this still)
    await calm(); await cmd('workbench.view.explorer'); await openFile(X, 1, 0); await vs.drv(`await vscode.commands.executeCommand('workbench.files.action.collapseExplorerFolders').then(()=>{},()=>{}); await sleep(800)`); await cmd('workbench.view.explorer');
    for (let k = 0; k < 30; k++) { if (await rectOfSel(vs, '.notifications-toasts .notification-toast')) break; await sleep(1000); }   // the TypeScript server raises its one hint late: wait for it, then the still wrapper clears it
    await vs.still('h0'); const BH = beat('cover', 'the repo, opened in VS Code'); BH.items.push({ kind: 'still', still: 'h0', label: 'bim-ootb in VS Code', frames: null });

    // ================= 1 read = run: package.json (no bundler, no build script), then panels.js at the Settings heading; the inset is the same place in the copy the browser receives
    const B1 = beat('s1', 'the file you read is the file that runs');
    await openFile('package.json', 1, 0); await cmd('workbench.view.explorer'); await sleep(600); await vs.still('s1_pkg');
    B1.items.push({ kind: 'still', still: 's1_pkg', label: 'package.json: no bundler among its dependencies, no build script', frames: 30 });
    // the raw file, as the browser gets it from our own server (identical bytes), and the deploy's minified copy (names kept)
    const rawLocal = await httpGet('http://localhost:' + PORT + '/' + X), rawMin = await httpGet('http://localhost:' + PORT_MIN + '/' + X), fileBytes = fs.readFileSync(path.join(TREE, X)), minBytes = fs.readFileSync(path.join(MIN, X));
    fs.appendFileSync(path.join(OUT, 'shoot.log'), '§SAME_BYTES file=' + X + ' dev_server_status=' + rawLocal.status + ' dev_sha=' + sha8(rawLocal.body) + ' file_sha=' + sha8(fileBytes) + ' same=' + (sha8(rawLocal.body) === sha8(fileBytes) ? 'Y' : 'N') + ' published_copy_status=' + rawMin.status + ' published_sha=' + sha8(rawMin.body) + ' minified_sha=' + sha8(minBytes) + ' same_as_minified=' + (sha8(rawMin.body) === sha8(minBytes) ? 'Y' : 'N') + ' bytes_src=' + fileBytes.length + ' bytes_published=' + rawMin.body.length + '\n');
    V2 = await K.viewer('http://localhost:' + PORT_MIN + '/' + X, 'raw'); await V2.pg.goto('http://localhost:' + PORT_MIN + '/' + X, { waitUntil: 'load' }); await V2.pg.addStyleTag({ content: 'pre, body { white-space: pre !important; word-break: normal !important; }' }); await sleep(1500);   // presentation only: the long minified lines are not wrapped mid-word
    const NEEDLE = 'section:"' + S0 + '"'; const findMin = () => V2.pg.evaluate((NEEDLE, S) => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const i = n.nodeValue.indexOf(NEEDLE); if (i >= 0) { const j = i + 'section:"'.length, rg = document.createRange(); rg.setStart(n, j); rg.setEnd(n, j + S.length); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(rg); const b = rg.getBoundingClientRect(); window.scrollTo(window.scrollX + b.left - 150, window.scrollY + b.top - 110); const b2 = rg.getBoundingClientRect(); return { x: b2.left, y: b2.top, w: b2.width, h: b2.height, ctx: n.nodeValue.slice(Math.max(0, i - 50), i + NEEDLE.length + 70) }; } } return null; }, NEEDLE, S0);
    const insetMin = await findMin(); if (!insetMin) throw new Error('the heading ' + NEEDLE + ' is not in the published copy'); await sleep(500); const rMin = await findMin();
    const clipOf = (r, off) => ({ x: Math.max(0, Math.min(1200 - 420, r.x - 40)) + ((off && off.x) || 0), y: Math.max(0, Math.min(700 - 200, r.y - 80)) + ((off && off.y) || 0), width: 420, height: 200 });   // `off` = the page's scroll offsets (a screenshot clip is in page coordinates)
    const off2 = await V2.pg.evaluate(() => ({ x: scrollX, y: scrollY })), cl2 = clipOf(rMin, off2); await V2.pg.screenshot({ path: path.join(OUT, 'stills', 's1_inset.png'), clip: cl2 }); const s1r = { x: Math.round((rMin.x + off2.x - cl2.x) * 1.6), y: Math.round((rMin.y + off2.y - cl2.y) * 1.6), w: Math.round(rMin.w * 1.6), h: Math.round(rMin.h * 1.6) };
    log('s1 inset (published copy) context=' + JSON.stringify(insetMin.ctx) + ' rect=' + JSON.stringify(s1r)); await V2.close(); V2 = null;
    await vs.drv(`await vscode.commands.executeCommand('revealInExplorer', vscode.Uri.file(${JSON.stringify(path.join(TREE, X))})); await sleep(1500)`); const rowP = await rectOfSel(vs, '.explorer-viewlet .monaco-list-row', 'panels.js'); await vs.still('s1_pre');
    const hl = lineOf(X, /section: 'Pill Icons'/); await openFile(X, hl, 0); await selectTok(hl, S0); await cmd('workbench.view.explorer'); await vs.still('s1_post'); const tokR = await selRect(); log('s1 explorer row panels.js rect=' + JSON.stringify(rowP) + ' heading rect=' + JSON.stringify(tokR));
    B1.items.push({ kind: 'ptr', id: 's1_row', pre: 's1_pre', post: 's1_post', target: rowP, view: 's1_inset', viewKind: 'browser', viewPulse: s1r, pulse: tokR, label: 'open viewer/panels.js: the same lines the browser receives, whitespace stripped', frames: null });

    // ================= 2 the editor knows: a Code Facts hover on a shared name, one on a § tag
    const B2 = beat('s2', 'Code Facts: hover any name or tag');
    const hoverTry = async (file, cands, nm) => { for (const [re, tok, nth] of cands) { let ln; try { ln = lineOf(file, re); } catch (e) { continue; }
        await openFile(file, ln, 0); await cmd('workbench.view.explorer'); const far = Math.min(ln + 8, 10); await caretTo(Math.max(1, ln - 0) === 1 ? 2 : 1, 0); await sleep(500); const pre = nm + '_pre'; await vs.still(pre);
        const c0 = await selectTok(ln, tok, nth); const sel = nm + '_sel'; await vs.still(sel); const tr = await selRect();
        const h = await vs.drv(`const ed = vscode.window.activeTextEditor; const p = new vscode.Position(${ln - 1}, ${c0 + 2}); ed.selection = new vscode.Selection(p, p); await sleep(400); await vscode.commands.executeCommand('editor.action.showHover'); await sleep(3500); const hs = await vscode.commands.executeCommand('vscode.executeHoverProvider', ed.document.uri, p); return (hs || []).map(h => (Array.isArray(h.contents) ? h.contents : [h.contents]).map(c => (typeof c === 'string' ? c : (c && c.value) || '')).join(' ')).join(' | ').replace(/\\s+/g, ' ').trim().slice(0, 500)`);
        log('§HOVER ' + nm + ' file=' + file + ':' + ln + ' token=' + JSON.stringify(tok) + ' text=' + JSON.stringify(h)); if (!h) continue; const post = nm + '_hover'; await vs.still(post); await cmd('closeParameterHints'); return { pre, sel, post, target: tr, text: h, file, ln, tok }; } return null; };
    const hv1 = await hoverTry('viewer/grid_views.js', [[/A\.camera = cam;/, 'camera', 0], [/A\.camera = _origCamera;/, 'camera', 0], [/pos: A\.camera\.position/, 'camera', 0], [/fov: A\.camera\.fov/, 'camera', 0]], 's2a');
    if (!hv1) throw new Error('no Code Facts hover on A.camera (viewer/grid_views.js)');
    B2.items.push({ kind: 'ptr', id: 's2_name', pre: hv1.pre, sel: hv1.sel, post: hv1.post, target: hv1.target, selectDiff: true, label: 'hover a shared name: where it is written, who reads it', frames: 90, hover: hv1.text });
    const hv2 = await hoverTry('scripts/bump.js', [[/§BUMP_DONE/, '§BUMP_DONE', 0], [/§BUMP_CODE/, '§BUMP_CODE', 0], [/§BUMP_CHECK/, '§BUMP_CHECK', 0], [/§BUMP /, '§BUMP', 0]], 's2b');
    if (!hv2) throw new Error('no Code Facts hover on a § tag in scripts/bump.js');
    B2.items.push({ kind: 'ptr', id: 's2_tag', pre: hv2.pre, sel: hv2.sel, post: hv2.post, target: hv2.target, selectDiff: true, label: 'hover a § tag: what it means, what prints it', frames: null, hover: hv2.text });

    // ================= 3 refused: the edit, the warning, Bump, the diff, the app offers the update
    const ctl = () => V.pg.evaluate(() => !!navigator.serviceWorker.controller), shows = async () => { const t = (await V.text()).toLowerCase(); return t.indexOf(S1.toLowerCase()) >= 0 ? 'NEW' : t.indexOf(S0.toLowerCase()) >= 0 ? 'OLD' : 'NEITHER'; };
    V = await K.viewer('http://localhost:' + PORT + '/viewer/viewer.html', 'film'); const reload = async w => { await V.pg.reload({ waitUntil: 'load', timeout: 120000 }); await sleep(w || 4500); await K.openSettings(V.pg); };
    await V.goto(); await K.openSettings(V.pg); await V.pg.evaluate(async () => { await navigator.serviceWorker.ready; }); await sleep(3000); await reload(); const controller = await ctl();
    const vcrop = async (name, S) => { let r = null; for (let k = 0; k < 20 && !r; k++) { r = await V.pg.evaluate(S => { let best = null; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const i = n.nodeValue.indexOf(S); if (i >= 0) { const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + S.length); const b = rg.getBoundingClientRect(); if (b.width > 0 && (!best || n.nodeValue.trim() === S)) best = { x: b.left, y: b.top, w: b.width, h: b.height }; } } if (best) return best; const e = document.getElementById('swUpdateToast'); if (e && (e.textContent || '').indexOf(S) >= 0) { const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; } return null; }, S); if (!r) await sleep(500); } if (!r) throw new Error('inset: ' + S + ' not in the page (text: ' + JSON.stringify((await V.text()).slice(0, 120)) + ')');
      const cl = clipOf(r); await V.pg.screenshot({ path: path.join(OUT, 'stills', name + '.png'), clip: cl }); return { name, rect: { x: Math.round((r.x - cl.x) * 1.6), y: Math.round((r.y - cl.y) * 1.6), w: Math.round(r.w * 1.6), h: Math.round(r.h * 1.6) } }; };
    const sh0 = await shows(); const v0 = await vcrop('i_old0', S0); log('viewer before the edit: shows=' + sh0 + ' controller=' + (controller ? 'Y' : 'N') + ' rect=' + JSON.stringify(v0.rect));
    const sw0 = +/CACHE_VERSION = 'v(\d+)'/.exec(fs.readFileSync(path.join(TREE, 'viewer', 'sw.js'), 'utf8'))[1];
    const B3 = beat('s3', 'edit, warning, Bump, the app offers the update');
    await cmd('workbench.view.explorer'); await openFile(X, line, insCol); await sleep(600); const kstart = 's3_k000'; await vs.still(kstart); const keys = [];
    for (let i = 0; i < ins.length; i += 2) { const chunk = ins.slice(i, i + 2); await vs.drv(`await vscode.commands.executeCommand('type', { text: ${JSON.stringify(chunk)} }); await sleep(110)`); const nm = 's3_k' + pad(i + 2); await vs.still(nm); keys.push(nm); }
    fs.appendFileSync(path.join(OUT, 'shoot.log'), '§FILM_TYPED id=s3_edit text=' + JSON.stringify(ins) + '\n');
    const sv = await vs.drv(`const ed = vscode.window.activeTextEditor; await ed.document.save(); await sleep(1800); return { saved: !ed.document.isDirty, text: ed.document.lineAt(${line - 1}).text }`); log('saved=' + sv.saved + ' line now: ' + sv.text.trim().slice(0, 120)); const ret = 's3_ret'; await vs.still(ret);
    await reload(); const afterSave = await shows(); const v1 = await vcrop('i_old1', S0); log('viewer after save + reload: shows=' + afterSave + ' rect=' + JSON.stringify(v1.rect)); await vs.still('s3_ans');
    B3.items.push({ kind: 'type', id: 's3_edit', text: ins, start: kstart, keys, ret, ans: 's3_ans', view: 'i_old0', viewAns: 'i_old1', viewPulse: v1.rect, term: null, first: true, label: 'type the fix, Ctrl+S: saved. The app, reloaded, still shows the old words' });
    await openFile(X, 1, 0); await vs.drv(`await vscode.commands.executeCommand('editor.action.showHover'); await sleep(2200)`);
    const warn = await vs.drv(`return vscode.languages.getDiagnostics(vscode.window.activeTextEditor.document.uri).map(d => d.source + ': ' + d.message.slice(0, 200))`); log('§BUMP_WARN diagnostics=' + JSON.stringify(warn)); await vs.still('s3_warn');
    B3.items.push({ kind: 'still', still: 's3_warn', view: 'i_old1', label: 'Code Facts warns on line 1: the saved edit is not in the cache version yet', frames: null });
    await vs.drv(`await vscode.commands.executeCommand('closeParameterHints').then(()=>{},()=>{}); await vscode.commands.executeCommand('editor.action.hideHover').then(()=>{},()=>{}); await sleep(300)`);
    const btn = () => rectOfSel(vs, '.statusbar-item', 'Bump'), btnText = () => vs.rects(`function(){ for (const e of document.querySelectorAll('.statusbar-item')) { const t=(e.textContent||'').trim(); if (t.indexOf('Bump')>=0) return t; } return null; }`);
    await openFile(X, line, insCol); await vs.drv(`await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup')`); const r1 = await btn(); log('status bar Bump rect=' + JSON.stringify(r1) + ' text=' + JSON.stringify(await btnText())); if (!r1) throw new Error('no Bump button'); await vs.still('s3_pre1');
    vs.drv(`vscode.commands.executeCommand('codeFacts.bumpButton')`).catch(() => {}); await sleep(1500); await vs.still('s3_checking'); const tc0 = Date.now(); let st = await btnText(), gd = 0; while (st && !/✓|✗/.test(st) && gd++ < 900) { await sleep(1000); st = await btnText(); }
    log('press 1 (check): button text ' + JSON.stringify(st) + ' after ' + Math.round((Date.now() - tc0) / 1000) + ' s'); await vs.still('s3_ready'); if (!/✓/.test(st || '')) throw new Error('the Bump check did not pass: ' + st);
    const r2 = await btn() || r1; vs.drv(`vscode.commands.executeCommand('codeFacts.bumpButton')`).catch(() => {}); await sleep(2500); let st2 = await btnText(), g2 = 0; while (st2 && /sync|writing|✓/.test(st2) && g2++ < 120) { await sleep(1000); st2 = await btnText(); } await sleep(1500); await vs.still('s3_written'); log('press 2 (write): button text ' + JSON.stringify(st2));
    const sw1 = +/CACHE_VERSION = 'v(\d+)'/.exec(fs.readFileSync(path.join(TREE, 'viewer', 'sw.js'), 'utf8'))[1]; log('viewer/sw.js CACHE_VERSION ' + sw0 + ' -> ' + sw1);
    B3.items.push({ kind: 'ptr', id: 's3_press1', pre: 's3_pre1', post: 's3_checking', target: r1, view: 'i_old1', label: 'press Bump: the check runs in the background', frames: null });
    B3.items.push({ kind: 'still', still: 's3_ready', view: 'i_old1', label: 'the check passed: Bump has a tick', frames: null });
    B3.items.push({ kind: 'ptr', id: 's3_press2', pre: 's3_ready', post: 's3_written', target: r2, view: 'i_old1', label: 'press it again: the new numbers are written', frames: null });
    // what the press wrote: the Source Control list and the diff of the page that loads the file
    await cmd('workbench.view.scm'); await vs.drv(`await vscode.commands.executeCommand('git.openChange', vscode.Uri.file(${JSON.stringify(path.join(TREE, 'viewer/viewer.html'))})); await sleep(3500)`); await vs.still('s3_diff');
    const Fx = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8')), code = Fx.press.viewerTag.code, codeR = await rectOfText(vs, code, '.editor-container'); log('diff of viewer/viewer.html: new code ' + code + ' rect=' + JSON.stringify(codeR));
    B3.items.push({ kind: 'pulse', id: 's3_diff', still: 's3_diff', rect: codeR, view: 'i_old1', label: 'the press wrote the new code into the page that loads the file (and the cache version)', frames: null, w: 2 });
    // the app: reload -> still old; the app offers the update; tap; the new words
    await reload(5500); const afterPress1 = await shows(); const vA = await vcrop('i_old2', S0);
    let toast = await V.pg.evaluate(() => !!document.getElementById('swUpdateToast')); for (let k = 0; k < 60 && !toast; k++) { await sleep(1000); toast = await V.pg.evaluate(() => !!document.getElementById('swUpdateToast')); }
    log('viewer after the press + reload: shows=' + afterPress1 + ' toast=' + (toast ? 'Y' : 'N') + ' sw_console=' + JSON.stringify(V.konsole.slice(-4)));
    let vT = null, afterTap = '-', via = 'reload'; if (toast) { vT = await vcrop('i_toast', 'Update ready'); await V.pg.evaluate(() => document.getElementById('swUpdateToast').click()); await sleep(5000); await K.openSettings(V.pg); afterTap = await shows(); via = 'toast'; } else { await reload(5500); afterTap = await shows(); via = 'second-reload'; }
    const vN = await vcrop('i_new', S1); log('viewer after the update: shows=' + afterTap + ' via=' + via + ' rect=' + JSON.stringify(vN.rect)); const newOk = afterPress1 === 'NEW' || afterTap === 'NEW';
    B3.items.push({ kind: 'still', still: 's3_diff', view: 'i_old2', label: 'the app reloaded after the press: still the old words', frames: null });
    if (vT) B3.items.push({ kind: 'pulse', id: 's3_toast', still: 's3_diff', view: 'i_toast', viewRect: vT.rect, label: 'the app offers the update: Update ready, tap to refresh', frames: null, w: 1 });
    B3.items.push({ kind: 'pulse', id: 's3_new', still: 's3_diff', view: 'i_new', viewRect: vN.rect, label: 'after the refresh: the new words', frames: null, w: 2 });
    fs.appendFileSync(path.join(OUT, 'shoot.log'), '§HARM file=' + X + ' old=' + JSON.stringify(S0) + ' new=' + JSON.stringify(S1) + ' controller=' + (controller ? 'Y' : 'N') + ' before_edit_shows=' + sh0 + ' after_save_reload_shows=' + afterSave + ' old_after_reload=' + (afterSave === 'OLD' ? 'Y' : 'N') + ' new_after_reload=' + (afterSave === 'NEW' ? 'Y' : 'N') + ' after_press_reload_shows=' + afterPress1 + ' toast=' + (toast ? 'Y' : 'N') + ' after_tap_shows=' + afterTap + ' new_after_press=' + (newOk ? 'Y' : 'N') + ' via=' + via + ' sw_before=' + sw0 + ' sw_after=' + sw1 + '\n');
    await V.close(); V = null;
    // the tree goes back to clean (not part of the film); the editor follows the disk
    const rs = cp.spawnSync('bash', ['-c', 'cd ' + TREE + ' && git checkout -- . && git status --short | wc -l'], { encoding: 'utf8' }).stdout.trim(); log('restore: git status --short lines=' + rs); await sleep(2000);

    // ================= 4 proven: the new checks on the OLD tree, then on the new tree, in VS Code's terminal panel
    const B4 = beat('s4', 'the witness: red on the old code, green on the new');
    await cmd('workbench.view.explorer'); await openFile('scripts/tests/witness_manifest_roundtrip.js', 1, 0); await termOpen(vs); await sleep(1500); const tr4 = await termRect(vs); log('terminal panel rect=' + JSON.stringify(tr4));
    const c0 = await typeCmd(vs, 's4_0', TY.T.s4_0, { first: true, label: 'the six new checks, run on the code before the change', runShots: 2 }); c0.term = tr4; c0.hold = 14; { const rs0 = []; for (let k = 0; k < 6; k++) rs0.push(await rectOfText(vs, 'ok=N', '.xterm', k)); c0.pulse = union(rs0); } B4.items.push(c0);
    const c1 = await typeCmd(vs, 's4_1', TY.T.s4_1, { first: false, label: 'the same witness on the new code', runShots: 2 }); c1.term = tr4; c1.pulse = await rectOfText(vs, 'claims=' + Fx.s4.claims + ' red=' + Fx.s4.red, '.xterm'); B4.items.push(c1);
    for (const id of Object.keys(items)) SCENE.beats[id] = items[id];
    SCENE.display = K.DISP; SCENE.hash.after_end = treeHash(TREE); if (SCENE.hash.after_end !== SCENE.hash.after_before) log('FAIL §FILM_TREE after hash changed ' + SCENE.hash.after_before + ' -> ' + SCENE.hash.after_end); else log('§FILM_TREE after == before ' + SCENE.hash.after_end);
    save();
  } finally { cp.spawnSync('bash', ['-c', 'cd ' + TREE + ' && git checkout -- .']);   // whatever happened, the throwaway tree goes back to clean
    if (V) await V.close().catch(() => {}); if (V2) await V2.close().catch(() => {}); await vs.close(); for (const p of srvs) try { process.kill(p.pid); } catch (e) { /* gone */ } K.stopAll(); }
  log('§FILM_SHOOT scene=promo secs=' + Math.round((Date.now() - t0) / 1000) + ' stills=' + fs.readdirSync(path.join(OUT, 'stills')).length);
})().catch(e => { console.error('§SHOOT FAIL ' + (e && e.stack || e)); fs.appendFileSync(path.join(OUT, 'shoot.log'), '§SHOOT FAIL ' + String(e && e.stack || e).replace(/\n/g, ' | ') + '\n'); K.stopAll(); process.exit(1); });
