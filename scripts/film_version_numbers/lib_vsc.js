// ⚠ DO NOT REMOVE — SCOPE: film 6 "CH 0 · Browser version numbers, done for you" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 6). The shared shooting kit for shoot.js (and the smoke test): a private virtual display (Xvfb, never the owner's real one, DBus hidden), the REAL VS Code on it (throwaway
// --user-data-dir / --extensions-dir, Code Facts installed from the AFTER tree's own sources with node devtools/vscode/pack.js, --disable-gpu, presentation settings only), the extension-host driver (ext_driver.js), the Electron DevTools port (to read the editor's OWN
// pixel rectangles: a button, a row, a panel), and a headless Chrome on the CPU for the Viewer. Every function logs a §SHOOT line to out/shoot.log. READ that log after every run. No process of anyone else is touched: everything started here is stopped by its PID.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process'), http = require('http');
const puppeteer = require(path.join(os.homedir(), 'bim-compiler', 'node_modules', 'puppeteer'));
const OUT = path.join(__dirname, 'out'), CACHE = path.join(os.homedir(), '.cache', 'film_version_numbers'), BIN = process.env.VSCODE_BIN || '/snap/code/current/usr/share/code/code';
const DISP = process.env.FILM_DISPLAY || ':97', DRV_PORT = +(process.env.FILM_DRIVER_PORT || 8751), DBG_PORT = +(process.env.FILM_DEBUG_PORT || 9341);
const sleep = ms => new Promise(r => setTimeout(r, ms)), log = m => { fs.appendFileSync(path.join(OUT, 'shoot.log'), '§SHOOT ' + m + '\n'); console.log('§SHOOT ' + m); };
const procs = [];   // everything we start, killed by PID at the end
const spawn = (cmd, args, opts) => { const p = cp.spawn(cmd, args, opts); procs.push(p); return p; };
const stopAll = () => { for (const p of procs.splice(0)) { try { process.kill(p.pid, 'SIGTERM'); } catch (e) { /* gone */ } } };
process.on('exit', stopAll);
const env = Object.assign({}, process.env, { DISPLAY: DISP, CUDA_VISIBLE_DEVICES: '' }); delete env.DBUS_SESSION_BUS_ADDRESS; delete env.ELECTRON_RUN_AS_NODE;

async function xvfb(w, h) {
  const p = spawn('Xvfb', [DISP, '-screen', '0', w + 'x' + h + 'x24', '-nolisten', 'tcp'], { stdio: 'ignore' }); await sleep(1500);
  if (p.exitCode !== null) throw new Error('Xvfb ' + DISP + ' did not start (display in use?)'); log('xvfb display=' + DISP + ' size=' + w + 'x' + h + ' pid=' + p.pid); return p; }

// the profile: presentation settings only (zoom, fonts, no telemetry, no popups, quiet UI), written to the throwaway user-data-dir
const SETTINGS = (promptRc) => ({
  'window.zoomLevel': 0, 'workbench.startupEditor': 'none', 'workbench.tips.enabled': false, 'workbench.enableExperiments': false, 'telemetry.telemetryLevel': 'off', 'update.mode': 'none', 'extensions.autoUpdate': false, 'extensions.autoCheckUpdates': false,
  'security.workspace.trust.enabled': false, 'editor.minimap.enabled': false, 'editor.fontSize': 15, 'editor.lineHeight': 22, 'editor.renderLineHighlight': 'none', 'editor.occurrencesHighlight': 'off', 'editor.selectionHighlight': false, 'editor.cursorBlinking': 'solid',
  'editor.guides.indentation': false, 'editor.bracketPairColorization.enabled': false, 'editor.hover.delay': 200, 'workbench.editor.enablePreview': false, 'breadcrumbs.enabled': false, 'workbench.layoutControl.enabled': false, 'window.commandCenter': false,
  'workbench.colorTheme': 'Default Dark Modern', 'terminal.integrated.fontSize': 15, 'terminal.integrated.lineHeight': 1.15, 'terminal.integrated.gpuAcceleration': 'off', 'terminal.integrated.cursorBlinking': false, 'terminal.integrated.enablePersistentSessions': false,
  'terminal.integrated.defaultProfile.linux': 'film', 'terminal.integrated.profiles.linux': { film: { path: 'bash', args: ['--noprofile', '--rcfile', promptRc] } }, 'terminal.integrated.tabs.enabled': false, 'terminal.integrated.showExitAlert': false,
  'git.openRepositoryInParentFolders': 'never', 'git.autofetch': false, 'git.autoRepositoryDetection': true, 'git.enableSmartCommit': false, 'git.confirmSync': false, 'scm.diffDecorations': 'all', 'scm.showHistoryGraph': false, 'scm.graph.visibility': 'hidden', 'chat.disableAIFeatures': true, 'chat.commandCenter.enabled': false, 'workbench.secondarySideBar.defaultVisibility': 'hidden',
  'diffEditor.renderSideBySide': false, 'diffEditor.ignoreTrimWhitespace': false, 'explorer.confirmDragAndDrop': false, 'files.autoSave': 'off', 'editor.wordWrap': 'off', 'workbench.statusBar.visible': true, 'problems.decorations.enabled': true });

function prepProfile(workDir) {
  const user = path.join(CACHE, 'vsc', 'user'), ext = path.join(CACHE, 'vsc', 'ext'), rc = path.join(CACHE, 'vsc', 'prompt.rc');
  fs.mkdirSync(path.join(user, 'User'), { recursive: true }); fs.mkdirSync(ext, { recursive: true });
  const si = '/snap/code/current/usr/share/code/resources/app/out/vs/workbench/contrib/terminal/common/scripts/shellIntegration-bash.sh';
  fs.writeFileSync(rc, "PS1='$ '\nHISTFILE=/dev/null\nHISTSIZE=0\nexport NO_COLOR=1 GIT_PAGER=cat PAGER=cat\n" + (fs.existsSync(si) ? '[ -f "' + si + '" ] && . "' + si + '"\n' : ''));
  fs.writeFileSync(path.join(user, 'User', 'settings.json'), JSON.stringify(SETTINGS(rc), null, 1));
  return { user, ext, rc }; }

// Code Facts: packed from the AFTER tree's own sources by its own packer, installed into the THROWAWAY extensions dir only (never the owner's profile)
function installCodeFacts(afterTree, prof) {
  const dist = path.join(CACHE, 'vsix'); fs.mkdirSync(dist, { recursive: true });
  const r = cp.spawnSync('node', [path.join(afterTree, 'devtools', 'vscode', 'pack.js'), '--out', dist], { cwd: afterTree, encoding: 'utf8' }); log('pack exit=' + r.status + ' ' + (r.stdout || '').trim().split('\n').pop().slice(0, 200));
  const vsix = fs.readdirSync(dist).filter(f => /^code-facts-.*\.vsix$/.test(f)).map(f => path.join(dist, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0]; if (!vsix) throw new Error('no .vsix packed');
  const i = cp.spawnSync(path.join(path.dirname(BIN), 'bin', 'code'), ['--extensions-dir', prof.ext, '--user-data-dir', prof.user, '--install-extension', vsix], { env, encoding: 'utf8', timeout: 180000 }); log('install exit=' + i.status + ' ' + ((i.stdout || '') + (i.stderr || '')).trim().split('\n').slice(-2).join(' | ').slice(0, 240));
  return vsix; }

// start the real VS Code on `folder`, window `w`x`h` at 0,0, driver + DevTools port; returns { drv, rects, still, close }
async function vscode(folder, w, h, opts) {
  opts = opts || {}; const prof = prepProfile(folder);
  // the window's size and place, as the editor itself restores it (presentation only)
  fs.rmSync(path.join(prof.user, 'User', 'globalStorage'), { recursive: true, force: true }); fs.rmSync(path.join(prof.user, 'User', 'workspaceStorage'), { recursive: true, force: true });   // a fresh window state every run: the editor keeps toggles (Do Not Disturb) there, and a toggle must not flip back
  fs.mkdirSync(path.join(prof.user, 'User', 'globalStorage'), { recursive: true });
  fs.writeFileSync(path.join(prof.user, 'User', 'globalStorage', 'storage.json'), JSON.stringify({ windowsState: { lastActiveWindow: { folder: 'file://' + folder, uiState: { mode: 1, x: 0, y: 0, width: w, height: h } }, openedWindows: [] } }));
  const args = ['--no-sandbox', '--disable-gpu', '--disable-workspace-trust', '--skip-welcome', '--skip-release-notes', '--disable-updates', '--remote-debugging-port=' + DBG_PORT, '--extensions-dir=' + prof.ext, '--user-data-dir=' + prof.user, '--extensionDevelopmentPath=' + path.join(__dirname, 'dummy_ext'), '--extensionTestsPath=' + path.join(__dirname, 'ext_driver.js'), folder];
  const p = spawn('nice', ['-n', '19', 'ionice', '-c3', BIN].concat(args), { env: Object.assign({}, env, { FILM_DRIVER_PORT: String(DRV_PORT) }), stdio: 'ignore' }); log('vscode start folder=' + folder + ' window=' + w + 'x' + h + ' pid=' + p.pid);
  const post = (url, body) => new Promise((res, rej) => { const rq = http.request({ host: '127.0.0.1', port: DRV_PORT, path: url, method: 'POST', timeout: 600000 }, r => { let d = ''; r.on('data', x => { d += x; }); r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(new Error('bad driver reply: ' + d.slice(0, 200))); } }); }); rq.on('error', rej); rq.end(JSON.stringify(body || {})); });
  for (let i = 0; i < 240; i++) { try { await post('/do', { code: 'return 1' }); break; } catch (e) { await sleep(500); if (i === 239) throw new Error('the driver did not come up'); } }
  const drv = async code => { const r = await post('/do', { code }); if (!r.ok) throw new Error('driver: ' + r.err); return r.r; };
  log('vscode driver up version=' + await drv('return vscode.version'));
  let cdp = null; const page = async () => { if (cdp) return cdp; const br = await puppeteer.connect({ browserURL: 'http://127.0.0.1:' + DBG_PORT, defaultViewport: null }); const pgs = await br.pages(); cdp = pgs.find(x => /workbench/.test(x.url())) || pgs[0]; return cdp; };
  const rects = async fnSrc => { const pg = await page(); return pg.evaluate('(' + fnSrc + ')()'); };   // DOM rectangles of the editor's own layout (device px == still px: zoom level 0, scale 1)
  let n = 0; const still = async name => { const f = path.join(OUT, 'stills', name + '.png'); fs.mkdirSync(path.dirname(f), { recursive: true });
    const r = cp.spawnSync('import', ['-window', 'root', '-crop', w + 'x' + h + '+0+0', '+repage', f], { env, encoding: 'utf8' }); if (r.status !== 0) throw new Error('import failed: ' + r.stderr); n++; return { name, bytes: fs.statSync(f).size }; };
  const close = async () => { try { await post('/quit', {}); } catch (e) { /* gone */ } await sleep(1500); try { process.kill(p.pid, 'SIGTERM'); } catch (e) { /* gone */ } };
  return { drv, rects, still, close, prof, pid: p.pid, win: (x, y, ww, hh) => cp.spawnSync('bash', ['-c', 'for w in $(xdotool search --onlyvisible --class code); do xdotool windowsize $w ' + ww + ' ' + hh + ' windowmove $w ' + x + ' ' + y + '; done'], { env }) }; }

// the Viewer in a headless Chrome on the CPU: a fresh profile (so its service worker starts empty), requests to hosts other than localhost refused, building DBs refused
async function viewer(url, tag) {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'film6-viewer-' + (tag || 'v') + '-'));
  const br = await puppeteer.launch({ headless: true, userDataDir: prof, args: ['--no-sandbox', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=1200,700'] });
  const pg = await br.newPage(); await pg.setViewport({ width: 1200, height: 700, deviceScaleFactor: 1.6 }); await pg.setRequestInterception(true); const blocked = new Set();
  pg.on('request', rq => { let u; try { u = new URL(rq.url()); } catch (e) { return rq.continue(); } if (u.protocol.startsWith('http') && u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') { blocked.add(u.hostname); return rq.abort(); } rq.continue(); });
  pg.on('pageerror', () => {}); const konsole = []; pg.on('console', m => { const t = m.text(); if (/§SW|§BUILD_VERSION|§SWUPDATE/.test(t)) konsole.push(t.slice(0, 200)); });
  const text = () => pg.evaluate(() => { const t = [document.body.innerText]; document.querySelectorAll('[placeholder]').forEach(e => { const v = e.getAttribute('placeholder'); if (v) t.push(v); }); return t.join('\n'); });   // what the page shows: its text and the placeholders of its inputs (no tooltips)
  const goto = async () => { await pg.goto(url, { waitUntil: 'load', timeout: 120000 }); await sleep(4000); };
  return { pg, br, text, goto, konsole, blocked, close: async () => { await br.close(); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) { /* tmp */ } } }; }

// the Viewer state the film shows: the Menu pill, then the Help pill: the real Help panel (command list, search box). Coordinates are css px of the 1200x700 window (measured 2026-11-23 on fc2f8216).
const hasText = async (pg, re) => /./.test('x') && re.test(((await pg.evaluate(() => document.body.innerText).catch(() => '')) || '').toLowerCase());
const openPanel = async (pg, y, re) => { for (let i = 0; i < 3; i++) { if (await hasText(pg, re)) return true; await pg.mouse.click(1160, 660); await sleep(1400); if (await hasText(pg, re)) return true; await pg.mouse.click(1164, y); await sleep(2200); if (await hasText(pg, re)) return true; } return false; };   // the menu may be open already (the Viewer remembers it): look first, click only when the panel is not there
const openHelp = pg => openPanel(pg, 187, /find \/ navigate/);
const openSettings = pg => openPanel(pg, 234, /pill icons/);
// the building state: the local HHS Office DB (bim-ootb buildings/, 75 MB, no network) loaded; ready when the status line says DONE
const waitBuilding = async pg => { for (let i = 0; i < 120; i++) { const t = await pg.evaluate(() => document.body.innerText).catch(() => ''); if (/building\(s\) rendered/.test(t)) { await sleep(1500); return true; } await sleep(1000); } return false; };
const openTM = async pg => { await waitBuilding(pg); await pg.keyboard.press('t'); await sleep(2500); };   // the Time Machine panel: its status line says what it is doing
const openWH = async pg => { await waitBuilding(pg); await pg.keyboard.press('w'); await sleep(2500); };   // World History panel: one row per opened building, edit, ...
module.exports = { openWH, openTM, waitBuilding, openSettings, openHelp, OUT, CACHE, sleep, log, spawn, stopAll, xvfb, vscode, viewer, installCodeFacts, prepProfile, DISP };
