// # ⚠ DO NOT REMOVE — SCOPE: the film "Editing Real Code 2" (prompts/CODE_ARCHITECTURE_DESIGN.md §F.18), the half that runs
// INSIDE the real VS Code. Two runs: OLD = X0 Navigator and the tree as they were before bim-ootb #2974, NEW = today's.
// Each state is reached with real editor commands; what VS Code itself reports is logged as a §FILM_SHOT line, and those
// lines are the only source of the film's numbers. Nothing is staged. Read shots.log after every run.
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const vscode = require('vscode');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const OUT = process.env.FILM_OUT, MODE = process.env.FILM_MODE, PLAN = JSON.parse(process.env.FILM_PLAN);
const ROOT = MODE === 'old' ? PLAN.old : PLAN.neu;
const SEC = '§';
const log = l => fs.appendFileSync(path.join(OUT, 'shots.log'), l + '\n');
const hoverText = hs => (hs || []).map(h => (Array.isArray(h.contents) ? h.contents : [h.contents])
  .map(c => (typeof c === 'string' ? c : (c && c.value) || '')).join(' ')).join(' | ').replace(/\s+/g, ' ').trim();

async function shoot(name, facts) {
  await vscode.commands.executeCommand('notifications.clearAll').then(() => {}, () => {});
  await sleep(250);
  const req = path.join(OUT, 'shoot.req');
  fs.writeFileSync(req, name);
  for (let i = 0; i < 100 && fs.existsSync(req); i++) await sleep(100);
  log(SEC + 'FILM_SHOT name=' + name + ' mode=' + MODE + ' ' + Object.keys(facts || {}).map(k => k + '=' + JSON.stringify(facts[k])).join(' '));
}
async function open(rel, line, col) {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(ROOT, rel)));
  const ed = await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.One });
  ed.selection = new vscode.Selection(line - 1, col, line - 1, col);
  ed.revealRange(new vscode.Range(line - 1, 0, line - 1, 0), vscode.TextEditorRevealType.InCenter);
  await sleep(700);
  return ed;
}
const relOf = p => path.relative(ROOT, p);
async function facts(ed) {
  const pos = ed.selection.active;
  const defs = await vscode.commands.executeCommand('vscode.executeDefinitionProvider', ed.document.uri, pos);
  const hov = await vscode.commands.executeCommand('vscode.executeHoverProvider', ed.document.uri, pos);
  return { file: relOf(ed.document.uri.fsPath), line: pos.line + 1, text: ed.document.lineAt(pos.line).text.trim().slice(0, 90),
    defs: (defs || []).map(d => relOf((d.uri || d.targetUri).fsPath) + ':' + ((d.range || d.targetSelectionRange || d.targetRange).start.line + 1)),
    hover: hoverText(hov).slice(0, 300),
    // the hover's own "last value" line, taken from the raw text (one line of it), not from the flattened copy above
    last: ((hov || []).map(h => (Array.isArray(h.contents) ? h.contents : [h.contents]).map(c => (typeof c === 'string' ? c : (c && c.value) || '')).join('\n')).join('\n')
      .split('\n').find(l => l.startsWith('last value')) || '').trim().slice(0, 220) };
}
async function tidy() {
  for (const c of ['notifications.clearAll', 'workbench.action.closeSidebar', 'workbench.action.closeAuxiliaryBar', 'workbench.action.closePanel']) {
    await vscode.commands.executeCommand(c).then(() => {}, () => {});
  }
}
async function hoverShot(name, rel, line, col, extra) {
  const ed = await open(rel, line, col);
  await vscode.commands.executeCommand('editor.action.showHover'); await sleep(2500);
  const f = await facts(ed);
  await shoot(name, Object.assign(f, extra || {}));
  return f;
}
async function start() {
  const ext = vscode.extensions.getExtension('bim-devtools.x0-navigator');
  const api = await ext.activate();
  const fresh = await api.whenFresh();
  log(SEC + 'FILM_X0 mode=' + MODE + ' active=' + ext.isActive + ' fresh=' + JSON.stringify(fresh && fresh.line) + ' vscode=' + vscode.version);
  await tidy();
}

// OLD: the tool as it was. It calls a live field dead.
async function old() {
  await start();
  const d = PLAN.dead;
  await hoverShot('o1_said_dead', d.rel, d.line, d.col);
}

async function neu() {
  await start();
  // the same line, today: written at …, and Go to Definition lands there
  const d = PLAN.dead;
  let ed = await open(d.rel, d.line, d.col);
  await vscode.commands.executeCommand('editor.action.showHover'); await sleep(2500);
  await shoot('n1_alive', await facts(ed));
  await vscode.commands.executeCommand('editor.action.revealDefinition'); await sleep(1500);
  ed = vscode.window.activeTextEditor;
  await shoot('n2_jumped', { file: relOf(ed.document.uri.fsPath), line: ed.selection.active.line + 1, text: ed.document.lineAt(ed.selection.active.line).text.trim().slice(0, 90) });

  // the third answer: PHANTOM? with the line to read, then that line
  const u = PLAN.unsure;
  await hoverShot('q1_not_sure', u.rel, u.line, u.col);
  ed = await open(PLAN.unsureSite.file, PLAN.unsureSite.line, 4);
  await shoot('q2_the_line', { file: PLAN.unsureSite.file, line: PLAN.unsureSite.line, text: ed.document.lineAt(PLAN.unsureSite.line - 1).text.trim().slice(0, 110) });

  // one file, one page: the command, as a user runs it; the page opens beside the code and is copied
  await vscode.commands.executeCommand('workbench.action.closeAllEditors'); await sleep(400);
  ed = await open(PLAN.contextRel, 1, 0);
  const text = await vscode.commands.executeCommand('x0Navigator.contextForFile');
  await sleep(1800);
  const clip = await vscode.env.clipboard.readText();
  const sect = t => { const i = text.indexOf('## ' + t); const j = text.indexOf('\n## ', i + 3); return i < 0 ? '' : text.slice(i, j < 0 ? undefined : j); };
  await shoot('c1_context', { file: PLAN.contextRel, lines: text.split('\n').length, copied: clip === text,
    beside: vscode.window.visibleTextEditors.filter(e => e.document.languageId === 'markdown').length,
    fields: (sect('APP fields').match(/^- `/gm) || []).length, tags: (sect('The § tags it prints').match(/^- line /gm) || []).length,
    load: (sect('How it reaches a user').split('\n').find(l => l.startsWith('- ')) || 'not loaded at start').slice(0, 90) });
  await vscode.commands.executeCommand('workbench.action.closeAllEditors'); await sleep(400);

  // why is there no value? three states of one line: no stamped log · a real log just made · the file edited afterwards
  const L = PLAN.lens;
  const lineText = fs.readFileSync(path.join(ROOT, L.rel), 'utf8').split('\n')[L.line - 1];
  const col = lineText.indexOf(L.tag) + 3;
  await hoverShot('v1_no_log', L.rel, L.line, col);
  // a REAL saved log: the repo's own stamper, then the repo's own generator (its index goes to a scratch folder)
  fs.mkdirSync(path.join(ROOT, 'logs'), { recursive: true });
  const stamp = cp.execFileSync('node', ['scripts/log_stamp.js', 'node scripts/gen_app_surface.js'], { cwd: ROOT, encoding: 'utf8' });
  const run = cp.execFileSync('node', ['scripts/gen_app_surface.js'], { cwd: ROOT, encoding: 'utf8', env: Object.assign({}, process.env, { APPSURF_OUT: path.join(OUT, 'appsurf'), ELECTRON_RUN_AS_NODE: '' }) });
  fs.writeFileSync(path.join(ROOT, 'logs', 'gen_app_surface.log'), stamp + run);
  log(SEC + 'FILM_REAL_LOG ' + (stamp + run).trim().replace(/\n/g, ' | '));
  await sleep(1200);
  await vscode.commands.executeCommand('workbench.action.closeAllEditors'); await sleep(300);
  await hoverShot('v2_value', L.rel, L.line, col);
  // the printing file is edited and saved: the value must be withdrawn
  ed = await open(L.rel, L.line, 0);
  await ed.edit(b => b.insert(new vscode.Position(L.line - 1, 0), '// a line added after the log was saved (film)\n'));
  await ed.document.save();
  await sleep(900);
  await vscode.commands.executeCommand('workbench.action.closeAllEditors'); await sleep(300);
  await hoverShot('v3_edited', L.rel, L.line + 1, col, { saved: true });
}

exports.run = async function () {
  try { await (MODE === 'old' ? old() : neu()); } catch (e) { log(SEC + 'FILM_ERROR mode=' + MODE + ' ' + String(e && e.stack || e).replace(/\n/g, ' | ')); }
  fs.writeFileSync(path.join(OUT, 'done.' + MODE), 'x');
};
