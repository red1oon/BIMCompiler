// ⚠ DO NOT REMOVE — SCOPE: film 6 "CH 0 · Browser version numbers, done for you" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 6). READ out/shoot.log after every run: exit code is not evidence. Usage: node shoot.js diff|before|after   (one scene per VS Code session; run them one at a time).
// The REAL VS Code (throwaway profile, Code Facts installed from the AFTER tree's own sources) on a private virtual display, driven through the extension API (ext_driver.js), shot with the X server's own `import`; and, in the `after` scene, the REAL Viewer of the AFTER tree
// served from a localhost port of our own, in a headless Chrome on the CPU with its service worker ON. Every typed line goes into VS Code's OWN terminal panel, key by key (a still per two characters), and is logged as §FILM_TYPED (guard.js compares it with the line facts.js ran).
// Rectangles the pointer and the amber pulse need are read from the editor's own layout (Electron DevTools port: DOM boxes in device px == still px), never eyeballed; pointer.py re-derives the token ones from the pixels. Nothing is edited outside the throwaway trees; each tree's hash is logged before and after (§FILM_TREE).
// GPU rule: refuses to start while a `node cli_silent_bake` runs. Writes out/stills/*.png, out/shoot.log, and merges its beats into out/scene.json (the contract cards.js reads). The `after` scene writes the §HARM line (the DOM text of the Viewer before the edit, after save + reload, after the press + reload).
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), http = require('http');
const K = require('./lib_vsc.js'), TY = require('./typed.js'), { sleep, log, OUT } = K, H = TY.H;
const which = process.argv[2]; if (!['diff', 'before', 'after'].includes(which)) { console.error('usage: node shoot.js diff|before|after'); process.exit(1); }
const bake = cp.spawnSync('pgrep', ['-f', '^node cli_silent_bake'], { encoding: 'utf8' }).stdout.trim(); if (bake) { console.log('§SHOOT REFUSED a GPU bake is running (pid ' + bake.split('\n')[0] + '): wait'); process.exit(3); }
const TREE = TY.TREES[which], PORT = +(process.env.FILM_PORT || 8641), pad = n => String(n).padStart(3, '0');
const treeHash = dir => { const a = cp.spawnSync('bash', ['-c', 'cd ' + dir + ' && { git rev-parse HEAD; git status --short; git diff HEAD; } | sha1sum | cut -c1-12'], { encoding: 'utf8' }).stdout.trim(); return a; };
fs.mkdirSync(path.join(OUT, 'stills'), { recursive: true });
const sceneFile = path.join(OUT, 'scene.json'), SCENE = fs.existsSync(sceneFile) ? JSON.parse(fs.readFileSync(sceneFile, 'utf8')) : { beats: {}, hash: {} };
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

(async () => {
  const t0 = Date.now(); fs.appendFileSync(path.join(OUT, 'shoot.log'), '§SHOOT scene=' + which + ' tree=' + TREE + ' started ' + new Date().toISOString() + '\n');
  const sh = TY.SHA; log('tree ' + which + ' head=' + cp.spawnSync('git', ['rev-parse', '--short=8', 'HEAD'], { cwd: TREE, encoding: 'utf8' }).stdout.trim());
  SCENE.hash[which + '_before'] = treeHash(TREE); log('§FILM_TREE ' + which + ' before ' + SCENE.hash[which + '_before']);
  const afterPrev = which === 'after';
  await K.xvfb(1920, 1080); const vs = await K.vscode(TREE, 1920, which === 'after' ? 500 : 850, {}); SCENE.vscode = await vs.drv('return vscode.version');
  let viewerCtl = null, srv = null;
  try {
    const items = {};   // beat id -> { layout, label, items: [] }
    const beat = (id, layout, label) => (items[id] = { layout, label, items: [] });
    // the VS Code window size per layout (the display is 1920x1080; the window sits at 0,0)
    const win = async h => { vs.win(0, 0, 1920, h); await sleep(1800); const g = cp.spawnSync('bash', ['-c', 'for w in $(xdotool search --onlyvisible --class code); do xdotool getwindowgeometry $w | tr "\n" " "; echo; done'], { env: Object.assign({}, process.env, { DISPLAY: K.DISP }), encoding: 'utf8' }).stdout.trim().replace(/\s+/g, ' '); log('window resized to 1920x' + h + ': ' + g.slice(0, 300)); };
    await win(which === 'after' ? 500 : 850);
    // the editor's chrome we do not want in a frame: notifications, the welcome/walkthrough, the side bar unless a beat needs it
    const calm = async () => { await vs.drv(`for (const c of ['notifications.clearAll','workbench.action.closeAuxiliaryBar']) await vscode.commands.executeCommand(c).then(()=>{},()=>{}); await sleep(300)`); };
    const openFile = async (file, line, col, column) => vs.drv(`const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(${JSON.stringify(path.join(TREE, '/'))} + ${JSON.stringify(file)})); const ed = await vscode.window.showTextDocument(doc, { preview: false, viewColumn: ${'vscode.ViewColumn.' + (column || 'One')}, preserveFocus: false }); const p = new vscode.Position(${line - 1}, ${col || 0}); ed.selection = new vscode.Selection(p, p); ed.revealRange(new vscode.Range(p, p), vscode.TextEditorRevealType.InCenter); await sleep(900); return doc.lineAt(${line - 1}).text.length`);

    if (which === 'diff') {
      // ================= CH 1 the pain: Source Control of the staged #3302, one diff opened by the pointer, then three typed lines in the terminal
      await calm(); await vs.drv(`await vscode.commands.executeCommand('workbench.action.closePanel').then(()=>{},()=>{}); await vscode.commands.executeCommand('workbench.view.scm'); await sleep(3500)`);
      const B1 = beat('b1', 'full', 'Source Control: the commit #3302, staged in a throwaway tree');
      const pre = 'b1_scm0'; await vs.still(pre);
      const row = await rectOfSel(vs, '.scm-view .monaco-list-row', 'index.html'); log('b1 scm row index.html rect=' + JSON.stringify(row));
      await vs.drv(`await vscode.commands.executeCommand('git.openChange', vscode.Uri.file(${JSON.stringify(path.join(TREE, 'index.html'))})); await sleep(3500)`); await vs.still('b1_diff');
      const count = await vs.drv(`const g = vscode.extensions.getExtension('vscode.git'); const api = g.exports.getAPI(1); const r = api.repositories[0]; return r ? r.state.indexChanges.length : -1`);
      log('§SCM_COUNT staged=' + count + ' (the film says the commit has 31 files)');
      const tok = await rectOfText(vs, 'locale_loader.js?v=15', '.editor-container');
      B1.items.push({ kind: 'ptr', id: 'b1_row', pre, post: 'b1_diff', target: row, label: 'point at index.html in the list of changes: its diff opens', pulse: tok ? { x: tok.x, y: tok.y, w: tok.w, h: tok.h } : null, frames: null });
      beat('b1n', 'full', 'the same commit, in the terminal panel');
      await vs.drv(`await vscode.commands.executeCommand('workbench.action.closeSidebar').then(()=>{},()=>{})`);
      await vs.drv(`await vscode.commands.executeCommand('workbench.action.closePanel').then(()=>{},()=>{}); await sleep(300)`); await termOpen(vs); await sleep(1500);
      const tr = await termRect(vs); log('terminal panel rect=' + JSON.stringify(tr));
      for (let i = 0; i < 3; i++) { const it = await typeCmd(vs, 'b1n_' + i, TY.T['b1n_' + i], { first: i === 0, label: 'in the terminal panel of VS Code' }); it.term = tr;
        if (i === 0) it.pulse = await rectOfText(vs, '31 files changed', '.xterm'); if (i === 1) { const rs = []; for (let k = 0; k < 8; k++) rs.push(await rectOfText(vs, 'locale_loader.js', '.xterm', k)); it.pulse = union(rs); }
        items.b1n.items.push(it); }
    }

    if (which === 'before') {
      // ================= CH 1b the miss: the BEFORE tree; the grep typed, then two editors side by side
      await calm(); await vs.drv(`await vscode.commands.executeCommand('workbench.action.closeSidebar').then(()=>{},()=>{}); await vscode.commands.executeCommand('workbench.action.closePanel').then(()=>{},()=>{})`);
      const B = beat('b1b', 'full', 'the BEFORE tree: bim-ootb at e4fa52fe');
      const F5 = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8')).b1b;
      await openFile('index.html', F5.indexLine, 0, 'One'); await openFile('viewer/viewer.html', F5.viewerLine, 0, 'Two'); await sleep(800);   // index.html left, viewer/viewer.html right
      await termOpen(vs); await sleep(1200); const tr = await termRect(vs);
      const it = await typeCmd(vs, 'b1b_0', TY.T.b1b_0, { first: true, label: 'the same file, named by two pages' }); it.term = tr; B.items.push(it);
      // the pointer visits each number: caret away -> token selected (pointer.py re-derives each rectangle from these two stills)
      const toks = [['import_db_builder.js?v=11', 'index.html', 0, 'the landing page asks for 11'], ['import_db_builder.js?v=12', 'viewer/viewer.html', 1, 'the viewer page asks for 12']];
      for (const [tx, file, grp, lab] of toks) {
        const ln = file === 'index.html' ? F5.indexLine : F5.viewerLine;
        // focus that editor group, caret at line start (token not selected), still; then select the token, still
        await vs.drv(`const g = ${grp}; await vscode.commands.executeCommand(g === 0 ? 'workbench.action.focusFirstEditorGroup' : 'workbench.action.focusSecondEditorGroup'); await sleep(500); const ed = vscode.window.activeTextEditor; const p = new vscode.Position(${ln - 1}, 0); ed.selection = new vscode.Selection(p, p); ed.revealRange(new vscode.Range(p, p), vscode.TextEditorRevealType.InCenter); await sleep(700)`);
        const pre = 'b1b_p' + grp + '_pre'; await vs.still(pre);
        const info = await vs.drv(`const ed = vscode.window.activeTextEditor; const t = ed.document.lineAt(${ln - 1}).text, c0 = t.indexOf(${JSON.stringify(tx)}); ed.selection = new vscode.Selection(${ln - 1}, c0, ${ln - 1}, c0 + ${JSON.stringify(tx).length - 2}); await sleep(700); return { c0, file: ed.document.uri.fsPath.replace(${JSON.stringify(TREE + '/')}, '') }`);
        const sel = 'b1b_p' + grp + '_sel'; await vs.still(sel);
        const rect = await rectOfText(vs, tx, '.view-lines'), rect2 = rect || await rectOfText(vs, tx, '.view-lines');
        log('b1b token ' + tx + ' in ' + info.file + ' rect=' + JSON.stringify(rect2));
        B.items.push({ kind: 'ptr', id: 'b1b_' + grp, pre, post: sel, target: rect2, selectDiff: true, label: lab, pulse: rect2, frames: grp === 0 ? 60 : null, rest: grp === 0 ? undefined : undefined });
      }
    }

    if (which === 'after') {
      // ================= CH 2 the harm, CH 3 one press, CH 4 the code, CH 5 why ours. The AFTER tree is served on a port of our own; the Viewer (service worker ON) is read in the DOM before the edit, after save + reload, after the press + reload.
      const X = H.file, base = TY.base, S0 = H.old, S1 = H.new, src0 = fs.readFileSync(path.join(TREE, X), 'utf8'), at = src0.indexOf(H.litOld) + 1; if (at < 1 || src0.split(H.litOld).length !== 2) throw new Error('the example literal is not exactly once in ' + X);
      const before = src0.slice(0, at).split('\n'), line = before.length, col0 = before[before.length - 1].length;
      let pre = 0; while (pre < S0.length && S0[pre] === S1[pre]) pre++; let suf = 0; while (suf < S0.length - pre && S0[S0.length - 1 - suf] === S1[S1.length - 1 - suf]) suf++; const ins = S1.slice(pre, S1.length - suf), insCol = col0 + pre; if (S0.slice(0, pre) + ins + S0.slice(S0.length - suf) !== S1) throw new Error('the edit is not one insertion');
      log('edit: ' + X + ':' + line + ' insert ' + JSON.stringify(ins) + ' at col ' + insCol + ' (' + JSON.stringify(S0) + ' -> ' + JSON.stringify(S1) + ')');
      srv = K.spawn('node', [path.join(TREE, 'scripts', '_fast_static_server.js'), String(PORT), TREE], { stdio: 'ignore' }); await sleep(900);
      const V = await K.viewer('http://localhost:' + PORT + '/viewer/viewer.html', 'film'); viewerCtl = V;
      const ctl = () => V.pg.evaluate(() => !!navigator.serviceWorker.controller), shows = async () => { const t = (await V.text()).toLowerCase(); return t.indexOf(S1.toLowerCase()) >= 0 ? 'NEW' : t.indexOf(S0.toLowerCase()) >= 0 ? 'OLD' : 'NEITHER'; };
      const reload = async w => { await V.pg.reload({ waitUntil: 'load', timeout: 120000 }); await sleep(w || 4500); await K.openSettings(V.pg); };   // the Viewer state the film shows: its Settings panel
      await V.goto(); await K.openSettings(V.pg); await V.pg.evaluate(async () => { await navigator.serviceWorker.ready; }); await sleep(3000); await reload(); const controller = await ctl();
      // the Viewer crop: a 1920x350 band of the REAL page around the string (the page is drawn at 1.6x device scale in a 1200 css px wide window: the same real pixels, larger text)
      const vcrop = async name => { const r = await V.pg.evaluate(S => { const out = { x: 0, y: 0, w: 0, h: 0, found: false }; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const i = n.nodeValue.indexOf(S); if (i >= 0) { const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + S.length); const b = rg.getBoundingClientRect(); if (b.width > 0) return { x: b.left, y: b.top, w: b.width, h: b.height, found: true, kind: 'text' }; } }
          for (const e of document.querySelectorAll('[title],[placeholder],[aria-label],[alt]')) { if (['title', 'placeholder', 'aria-label', 'alt'].some(a => (e.getAttribute(a) || '').indexOf(S) >= 0)) { const b = e.getBoundingClientRect(); if (b.width > 0) return { x: b.left, y: b.top, w: b.width, h: b.height, found: true, kind: 'attribute' }; } } return out; }, globalThis.__want || S0);
        const DSF = 1.6, vh = 350 / DSF, vw = 1920 / DSF, cy = r.found ? r.y + r.h / 2 : 100, y0 = Math.max(0, Math.min(700 - vh, cy - vh / 2));
        await V.pg.screenshot({ path: path.join(OUT, 'stills', name + '.png'), clip: { x: 0, y: y0, width: vw, height: vh } });
        return { name, found: r.found, kind: r.kind, rect: r.found ? { x: Math.round(r.x * DSF), y: Math.round((r.y - y0) * DSF), w: Math.round(r.w * DSF), h: Math.round(r.h * DSF) } : null }; };
      globalThis.__want = S0; const v0 = await vcrop('b2_v0'); const sh0 = await shows(); log('viewer before the edit: shows=' + sh0 + ' controller=' + (controller ? 'Y' : 'N') + ' string_found=' + v0.found + ' (' + v0.kind + ') rect=' + JSON.stringify(v0.rect) + ' konsole=' + JSON.stringify(V.konsole.slice(0, 3)));
      const sw0 = +/CACHE_VERSION = 'v(\d+)'/.exec(fs.readFileSync(path.join(TREE, 'viewer', 'sw.js'), 'utf8'))[1];
      await calm(); await vs.drv(`await vscode.commands.executeCommand('workbench.action.closeSidebar').then(()=>{},()=>{}); await vscode.commands.executeCommand('workbench.action.closePanel').then(()=>{},()=>{})`); await win(500);
      // ---- CH 2: the edit is typed in the editor (a still per two characters), saved with Ctrl+S, the Viewer reloaded
      const B2 = beat('b2', 'split', 'the edit, saved; the Viewer reloaded');
      await openFile(X, line, insCol); await sleep(600); const kstart = 'b2_k000'; await vs.still(kstart); const keys = [];
      for (let i = 0; i < ins.length; i += 2) { const chunk = ins.slice(i, i + 2); await vs.drv(`await vscode.commands.executeCommand('type', { text: ${JSON.stringify(chunk)} }); await sleep(110)`); const nm = 'b2_k' + pad(i + 2); await vs.still(nm); keys.push(nm); }
      fs.appendFileSync(path.join(OUT, 'shoot.log'), '§FILM_TYPED id=b2_edit text=' + JSON.stringify(ins) + '\n');
      const lineText = await vs.drv(`const ed = vscode.window.activeTextEditor; await ed.document.save(); await sleep(1800); return { saved: !ed.document.isDirty, text: ed.document.lineAt(${line - 1}).text }`); log('saved=' + lineText.saved + ' line now: ' + lineText.text.trim().slice(0, 120));
      const ret = 'b2_ret'; await vs.still(ret);
      await reload(); const afterSave = await shows(); globalThis.__want = S0; const v1 = await vcrop('b2_v1'); log('viewer after save + reload: shows=' + afterSave + ' rect=' + JSON.stringify(v1.rect)); const ans = 'b2_ans'; await vs.still(ans);
      B2.items.push({ kind: 'type', id: 'b2_edit', text: ins, start: kstart, keys, ret, ans, view: 'b2_v0', viewAns: 'b2_v1', viewPulse: v1.rect, term: null, first: true, label: 'type the fix, Ctrl+S: saved' });
      // ---- CH 3: the warning on line 1, the status-bar Bump button (check, then write), the files it wrote, the Viewer reloaded
      const B3 = beat('b3', 'split', 'Code Facts: the warning, the Bump button'); await openFile(X, 1, 0); await vs.drv(`await vscode.commands.executeCommand('editor.action.showHover'); await sleep(2200)`);
      const warn = await vs.drv(`return vscode.languages.getDiagnostics(vscode.window.activeTextEditor.document.uri).map(d => d.source + ': ' + d.message.slice(0, 160))`); log('§BUMP_WARN diagnostics=' + JSON.stringify(warn));
      await vs.still('b3_warn'); B3.items.push({ kind: 'still', still: 'b3_warn', view: 'b2_v1', label: 'Code Facts warns on line 1: the saved edit is not in the cache version yet' });
      await vs.drv(`await vscode.commands.executeCommand('closeParameterHints').then(()=>{},()=>{}); await vscode.commands.executeCommand('hideSuggestWidget').then(()=>{},()=>{}); await sleep(300)`);
      const btn = async () => rectOfSel(vs, '.statusbar-item', 'Bump'), btnText = () => vs.rects(`function(){ for (const e of document.querySelectorAll('.statusbar-item')) { const t=(e.textContent||'').trim(); if (t.indexOf('Bump')>=0) return t; } return null; }`);
      const r1 = await btn(); log('status bar Bump button rect=' + JSON.stringify(r1) + ' text=' + JSON.stringify(await btnText())); if (!r1) throw new Error('the Bump button is not in the status bar');
      await vs.drv(`vscode.commands.executeCommand('workbench.action.closeActiveEditor').then(()=>{},()=>{})`).catch(() => {}); await openFile(X, line, insCol); await sleep(500); await vs.drv(`await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup')`);
      await vs.still('b3_pre1');
      vs.drv(`vscode.commands.executeCommand('codeFacts.bumpButton')`).catch(() => {}); await sleep(1500); await vs.still('b3_checking'); const tCheck0 = Date.now(); let st = await btnText(), guard = 0;
      while (st && !/✓|✗/.test(st) && guard++ < 900) { await sleep(1000); st = await btnText(); }   // the check runs in the background (witnesses of the changed file, budget 10 min)
      log('press 1 (check) button text: ' + JSON.stringify(st) + ' after ' + Math.round((Date.now() - tCheck0) / 1000) + ' s'); await vs.still('b3_ready'); if (!/✓/.test(st || '')) throw new Error('the Bump check did not pass: ' + st);
      const r2 = await btn(); vs.drv(`vscode.commands.executeCommand('codeFacts.bumpButton')`).catch(() => {}); await sleep(2500); let st2 = await btnText(), g2 = 0; while (st2 && /sync|writing|✓/.test(st2) && g2++ < 120) { await sleep(1000); st2 = await btnText(); }
      await sleep(1500); await vs.still('b3_written'); log('press 2 (write) button text: ' + JSON.stringify(st2));
      const sw1 = +/CACHE_VERSION = 'v(\d+)'/.exec(fs.readFileSync(path.join(TREE, 'viewer', 'sw.js'), 'utf8'))[1]; log('viewer/sw.js CACHE_VERSION ' + sw0 + ' -> ' + sw1);
      B3.items.push({ kind: 'ptr', id: 'b3_press1', pre: 'b3_pre1', post: 'b3_checking', target: r1, view: 'b2_v1', label: 'press Bump: the check runs in the background' });
      B3.items.push({ kind: 'still', still: 'b3_ready', view: 'b2_v1', label: 'the check passed: Bump has a tick' });
      B3.items.push({ kind: 'ptr', id: 'b3_press2', pre: 'b3_ready', post: 'b3_written', target: r2 || r1, view: 'b2_v1', label: 'press it again: the numbers are written' });
      await vs.drv(`await vscode.commands.executeCommand('workbench.action.terminal.new'); await sleep(3000); const t = vscode.window.activeTerminal; globalThis.__pid = await t.processId; return globalThis.__pid`); await sleep(1500); const tr = await termRect(vs);
      const stat = await typeCmd(vs, 'b3_0', TY.T.b3_0, { first: false, label: 'which files the press wrote' }); stat.term = tr;
      await reload(5500); const afterPress1 = await shows(); globalThis.__want = S0; const vA = await vcrop('b3_v1'); await vs.still('b3_end');
      let toast = await V.pg.evaluate(() => !!document.getElementById('swUpdateToast')); for (let k = 0; k < 60 && !toast; k++) { await sleep(1000); toast = await V.pg.evaluate(() => !!document.getElementById('swUpdateToast')); }   // the new worker installs in the background, then the Viewer offers its update
      log('viewer after the press + reload: shows=' + afterPress1 + ' toast=' + (toast ? 'Y' : 'N') + ' sw_console=' + JSON.stringify(V.konsole.slice(-4)));
      let vT = null, afterTap = '-', via = 'reload'; if (toast) { await vs.still('b3_end2'); const tr0 = await V.pg.evaluate(() => { const b = document.getElementById('swUpdateToast').getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; }); vT = { name: 'b3_v2', rect: { x: Math.round(tr0.x * 1.6), y: 0, w: Math.round(tr0.w * 1.6), h: Math.round(tr0.h * 1.6) } };
        const cy = tr0.y + tr0.h / 2, y0 = Math.max(0, Math.min(700 - 350 / 1.6, cy - 350 / 1.6 / 2)); await V.pg.screenshot({ path: path.join(OUT, 'stills', 'b3_v2.png'), clip: { x: 0, y: y0, width: 1200, height: 350 / 1.6 } }); vT.rect.y = Math.round((tr0.y - y0) * 1.6);
        await V.pg.evaluate(() => document.getElementById('swUpdateToast').click()); await sleep(5000); await K.openSettings(V.pg); afterTap = await shows(); via = 'toast'; }
      else { await reload(5500); afterTap = await shows(); via = 'second-reload'; }
      globalThis.__want = S1; const vN = await vcrop('b3_v3'); log('viewer after the update: shows=' + afterTap + ' via=' + via + ' rect=' + JSON.stringify(vN.rect)); const newOk = afterPress1 === 'NEW' || afterTap === 'NEW';
      B3.items.push(stat); stat.view = 'b2_v1'; stat.viewAns = 'b2_v1'; stat.viewPulse = null;
      B3.items.push({ kind: 'still', still: 'b3_end', view: vA.name, label: 'press Bump, reload the Viewer: it still shows the old words', frames: null });
      if (vT) B3.items.push({ kind: 'pulse', id: 'b3_toast', still: 'b3_end2', view: vT.name, viewRect: vT.rect, label: 'the Viewer offers its update', frames: null, w: 1 });
      B3.items.push({ kind: 'pulse', id: 'b3_new', still: 'b3_end', view: vN.name, viewRect: vN.rect, label: 'the new words', frames: null, w: 2 });
      fs.appendFileSync(path.join(OUT, 'shoot.log'), '§HARM file=' + X + ' old=' + JSON.stringify(S0) + ' new=' + JSON.stringify(S1) + ' controller=' + (controller ? 'Y' : 'N') + ' before_edit_shows=' + sh0 + ' after_save_reload_shows=' + afterSave + ' old_after_reload=' + (afterSave === 'OLD' ? 'Y' : 'N') + ' new_after_reload=' + (afterSave === 'NEW' ? 'Y' : 'N') + ' after_press_reload_shows=' + afterPress1 + ' toast=' + (toast ? 'Y' : 'N') + ' after_tap_shows=' + afterTap + ' new_after_press=' + (newOk ? 'Y' : 'N') + ' via=' + via + ' sw_before=' + sw0 + ' sw_after=' + sw1 + '\n');
      // ---- CH 4: the code is the file's fingerprint; a code typed by hand is refused
      await win(850); await sleep(1500); const B4 = beat('b4', 'full', 'viewer/viewer.html at the tag of ' + base);
      const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8')), vt = F.press.viewerTag, code = vt.code;
      await vs.drv(`await vscode.commands.executeCommand('workbench.action.closePanel').then(()=>{},()=>{})`); await openFile('viewer/viewer.html', vt.line, 0); await vs.drv(`await vscode.commands.executeCommand('workbench.action.terminal.focus').then(()=>{},()=>{}); await sleep(100); await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup')`);
      const tokTxt = base + '?v=' + code, prE = 'b4_pre'; await vs.drv(`const ed = vscode.window.activeTextEditor; const p = new vscode.Position(${vt.line - 1}, 0); ed.selection = new vscode.Selection(p, p); await sleep(500)`); await vs.still(prE);
      await vs.drv(`const ed = vscode.window.activeTextEditor; const t = ed.document.lineAt(${vt.line - 1}).text, c0 = t.indexOf(${JSON.stringify(tokTxt)}); ed.selection = new vscode.Selection(${vt.line - 1}, c0, ${vt.line - 1}, c0 + ${tokTxt.length}); await sleep(700)`); await vs.still('b4_sel');
      const tokR = await rectOfText(vs, tokTxt, '.view-lines'), codeR = await rectOfText(vs, code, '.view-lines'); log('b4 token ' + tokTxt + ' rect=' + JSON.stringify(tokR) + ' code rect=' + JSON.stringify(codeR));
      B4.items.push({ kind: 'ptr', id: 'b4_tok', pre: prE, post: 'b4_sel', target: tokR, selectDiff: true, label: 'the tag in viewer/viewer.html: ?v= and eight letters and digits', pulse: codeR, frames: 60 });
      await vs.drv(`await vscode.commands.executeCommand('workbench.action.terminal.focus'); await sleep(900)`); const tr4 = await termRect(vs);
      const c0 = await typeCmd(vs, 'b4_0', TY.T.b4_0, { first: true, label: 'the file\'s own fingerprint' }); c0.term = tr4; c0.pulse = union([await rectOfText(vs, code, '.xterm')]); B4.items.push(c0);
      const c1 = await typeCmd(vs, 'b4_1', TY.T.b4_1(code, TY.BAD_CODE), { first: false, label: 'a code typed by hand: the check refuses', runShots: 2 }); c1.term = tr4; B4.items.push(c1);
      // restore the tree (not part of the film): the VS Code buffers follow the disk
      const rs = cp.spawnSync('bash', ['-c', 'cd ' + TREE + ' && git checkout -- . && git status --short | wc -l'], { encoding: 'utf8' }).stdout.trim(); log('restore: git status --short lines=' + rs); await sleep(1500);
      // ---- CH 5 why ours: the Explorer, scripts/bump.js
      await vs.drv(`await vscode.commands.executeCommand('workbench.action.closePanel').then(()=>{},()=>{}); await vscode.commands.executeCommand('workbench.view.explorer'); await sleep(1500)`);
      const B5 = beat('b5', 'full', 'no bundler config in the tree: one script, scripts/bump.js'); await vs.drv(`const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(${JSON.stringify(path.join(TREE, 'package.json'))})); await vscode.window.showTextDocument(doc, { preview: false }); await sleep(1200)`);
      await vs.still('b5_pre'); await vs.drv(`await vscode.commands.executeCommand('revealInExplorer', vscode.Uri.file(${JSON.stringify(path.join(TREE, 'scripts/bump.js'))})); await sleep(1800)`); await vs.still('b5_pre2');
      const rowB = await rectOfSel(vs, '.explorer-viewlet .monaco-list-row', 'bump.js'); log('b5 explorer row bump.js rect=' + JSON.stringify(rowB));
      await openFile('scripts/bump.js', 1, 0); await vs.drv(`await vscode.commands.executeCommand('revealInExplorer', vscode.Uri.file(${JSON.stringify(path.join(TREE, 'scripts/bump.js'))})); await sleep(1200)`); await vs.still('b5_post');
      B5.items.push({ kind: 'ptr', id: 'b5_row', pre: 'b5_pre2', post: 'b5_post', target: rowB, label: 'no webpack, rollup, vite or esbuild file in the tree: one script, scripts/bump.js', frames: null });
      await V.close(); viewerCtl = null;
    }
    for (const id of Object.keys(items)) SCENE.beats[id] = items[id];
    SCENE.display = K.DISP; SCENE.hash[which + '_end'] = treeHash(TREE); if (SCENE.hash[which + '_end'] !== SCENE.hash[which + '_before']) log('FAIL §FILM_TREE ' + which + ' hash changed ' + SCENE.hash[which + '_before'] + ' -> ' + SCENE.hash[which + '_end']); else log('§FILM_TREE ' + which + ' after == before ' + SCENE.hash[which + '_end']);
    save();
  } finally { if (viewerCtl) await viewerCtl.close().catch(() => {}); await vs.close(); if (srv) try { process.kill(srv.pid); } catch (e) { /* gone */ } K.stopAll(); }
  log('§FILM_SHOOT scene=' + which + ' secs=' + Math.round((Date.now() - t0) / 1000) + ' stills=' + fs.readdirSync(path.join(OUT, 'stills')).length);
})().catch(e => { console.error('§SHOOT FAIL ' + (e && e.stack || e)); fs.appendFileSync(path.join(OUT, 'shoot.log'), '§SHOOT FAIL ' + String(e && e.stack || e).replace(/\n/g, ' | ') + '\n'); K.stopAll(); process.exit(1); });
