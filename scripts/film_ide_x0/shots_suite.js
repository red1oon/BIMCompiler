// # ⚠ DO NOT REMOVE — SCOPE: the film "Editing Real Code" (prompts/CODE_ARCHITECTURE_DESIGN.md §F.9 Part 2), the half that
// runs INSIDE the real VS Code. It performs each storyboard state with real editor commands, asks shoot.sh for a still, and
// logs what VS Code itself reports for that state as a §FILM_SHOT line (file, line, hover text): the numbers the narration may use.
// Nothing is staged: the BEFORE run has no X0 Navigator (an empty extension), the AFTER run has it. Read shots.log after every run.
'use strict';
const fs = require('fs');
const path = require('path');
const vscode = require('vscode');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const OUT = process.env.FILM_OUT, MODE = process.env.FILM_MODE, PLAN = JSON.parse(process.env.FILM_PLAN);
const SEC = '§';
const log = l => fs.appendFileSync(path.join(OUT, 'shots.log'), l + '\n');
const hoverText = hs => (hs || []).map(h => (Array.isArray(h.contents) ? h.contents : [h.contents])
  .map(c => (typeof c === 'string' ? c : (c && c.value) || '')).join(' ')).join(' | ').replace(/\s+/g, ' ').trim();

async function shoot(name, facts) {
  await vscode.commands.executeCommand('notifications.clearAll').then(() => {}, () => {});   // editor pop-ups are not the subject
  await sleep(250);
  const req = path.join(OUT, 'shoot.req');
  fs.writeFileSync(req, name);
  for (let i = 0; i < 100 && fs.existsSync(req); i++) await sleep(100);     // shoot.sh takes the still and removes the request
  log(SEC + 'FILM_SHOT name=' + name + ' mode=' + MODE + ' ' + Object.keys(facts || {}).map(k => k + '=' + JSON.stringify(facts[k])).join(' '));
}
async function open(file, line, col) {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(file));
  const ed = await vscode.window.showTextDocument(doc, { preview: false });
  ed.selection = new vscode.Selection(line - 1, col, line - 1, col);
  ed.revealRange(new vscode.Range(line - 1, 0, line - 1, 0), vscode.TextEditorRevealType.InCenter);
  await sleep(700);
  return ed;
}
const rel = p => path.relative(PLAN.root, p);
async function facts(ed) {
  const pos = ed.selection.active;
  const defs = await vscode.commands.executeCommand('vscode.executeDefinitionProvider', ed.document.uri, pos);
  const hov = await vscode.commands.executeCommand('vscode.executeHoverProvider', ed.document.uri, pos);
  return { file: rel(ed.document.uri.fsPath), line: pos.line + 1, text: ed.document.lineAt(pos.line).text.trim().slice(0, 90),
    defs: (defs || []).map(d => rel((d.uri || d.targetUri).fsPath) + ':' + ((d.range || d.targetSelectionRange || d.targetRange).start.line + 1)),
    hover: hoverText(hov).slice(0, 400) };
}
async function tidy() {
  for (const c of ['notifications.clearAll', 'workbench.action.closeSidebar', 'workbench.action.closeAuxiliaryBar', 'workbench.action.closePanel']) {
    await vscode.commands.executeCommand(c).then(() => {}, () => {});
  }
}

// Wait until VS Code's own JavaScript support answers a question it CAN answer (a local function call).
async function builtinReady() {
  const p = PLAN.probe, t0 = Date.now();
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(p.file));
  let to = null;
  while (Date.now() - t0 < 150000) {
    const d = await vscode.commands.executeCommand('vscode.executeDefinitionProvider', doc.uri, new vscode.Position(p.line - 1, p.col));
    if (d && d.length) { to = rel((d[0].uri || d[0].targetUri).fsPath) + ':' + ((d[0].range || d[0].targetSelectionRange || d[0].targetRange).start.line + 1); break; }
    await sleep(1500);
  }
  log(SEC + 'FILM_BUILTIN_READY mode=' + MODE + ' ready=' + (to ? 'Y' : 'N') + ' seconds=' + Math.round((Date.now() - t0) / 100) / 10 + ' probe=' + p.name + '() resolved_to=' + to);
}

async function before() {
  await tidy();
  await builtinReady();
  // the intro: the plain editor, the project's folders open in the Explorer
  let intro = await open(PLAN.sceneFile, 1, 0);
  await vscode.commands.executeCommand('workbench.view.explorer');
  await vscode.commands.executeCommand('workbench.files.action.collapseExplorerFolders').then(() => {}, () => {});
  await vscode.commands.executeCommand('workbench.files.action.focusFilesExplorer').then(() => {}, () => {});
  await vscode.commands.executeCommand('list.focusFirst').then(() => {}, () => {});
  await sleep(1500);
  await shoot('i1_explorer', { file: rel(intro.document.uri.fsPath), folders: fs.readdirSync(PLAN.root, { withFileTypes: true }).filter(e => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules').length });
  await tidy();
  const d = PLAN.def;
  let ed = await open(d.file, d.line, d.col);
  await shoot('b1_line', await facts(ed));
  const f = await facts(ed);
  await vscode.commands.executeCommand('editor.action.revealDefinition');
  await sleep(900);
  const a = vscode.window.activeTextEditor;
  await shoot('b2_f12_nothing', { asked_on: f.file + ':' + f.line, builtin_defs: f.defs.length,
    after_file: rel(a.document.uri.fsPath), after_line: a.selection.active.line + 1, moved: rel(a.document.uri.fsPath) !== f.file || a.selection.active.line + 1 !== f.line });
  await sleep(2500);
  await vscode.commands.executeCommand('workbench.action.findInFiles', { query: PLAN.searchQuery, triggerSearch: true, isRegex: false, isCaseSensitive: true, filesToInclude: 'viewer' });
  await sleep(9000);
  await vscode.commands.executeCommand('notifications.clearAll');
  await shoot('b3_search_tests_only', { query: PLAN.searchQuery, in: 'viewer', lines_counted_by_node: PLAN.searchHits, files: PLAN.searchFiles, all_in_tests: PLAN.searchAllInTests });
}

async function after() {
  const ext = vscode.extensions.getExtension('bim-devtools.x0-navigator');
  const api = await ext.activate();
  const fresh = await api.whenFresh();
  log(SEC + 'FILM_X0 active=' + ext.isActive + ' fresh=' + JSON.stringify(fresh && fresh.line) + ' gen_ms=' + (fresh && fresh.ms) + ' vscode=' + vscode.version);
  await tidy();
  const d = PLAN.def;
  let ed = await open(d.file, d.line, d.col);
  await vscode.commands.executeCommand('editor.action.showHover'); await sleep(3000);
  await shoot('a1_hover', await facts(ed));
  await vscode.commands.executeCommand('editor.action.revealDefinition'); await sleep(1500);
  ed = vscode.window.activeTextEditor;
  await shoot('a2_jumped', { file: rel(ed.document.uri.fsPath), line: ed.selection.active.line + 1, text: ed.document.lineAt(ed.selection.active.line).text.trim().slice(0, 90) });

  const p = PLAN.phantom;
  ed = await open(p.file, p.line, p.col);
  await vscode.commands.executeCommand('editor.action.showHover'); await sleep(1500);
  await shoot('p1_phantom', await facts(ed));

  ed = await open(PLAN.scratch, 1, PLAN.scratchFieldCol);
  await vscode.commands.executeCommand('editor.action.showHover'); await sleep(1500);
  await shoot('u1_unknown', await facts(ed));

  const t = PLAN.tag;
  ed = await open(t.file, t.line, t.col);
  await vscode.commands.executeCommand('editor.action.showHover'); await sleep(2500);
  await shoot('t1_tag', await facts(ed));
  ed = await open(PLAN.scratch, 2, PLAN.scratchTagCol);
  await vscode.commands.executeCommand('editor.action.showHover'); await sleep(1500);
  await shoot('t2_fake_tag', await facts(ed));

  // §F.12 first versions, BEFORE the code is edited (so the checks run on a clean tree)
  ed = await open(PLAN.sceneFile, 1, 0);
  await vscode.commands.executeCommand('workbench.view.explorer');
  await vscode.commands.executeCommand('workbench.files.action.collapseExplorerFolders').then(() => {}, () => {});
  await vscode.commands.executeCommand('workbench.files.action.focusFilesExplorer').then(() => {}, () => {});
  await vscode.commands.executeCommand('list.focusFirst').then(() => {}, () => {});
  await vscode.commands.executeCommand('x0RunShip.focus').then(() => {}, () => {});
  const chk = await vscode.commands.executeCommand('x0Navigator.shipCheck');
  await sleep(1800);
  await shoot('r1_check', { lines: chk.length, syntax: chk.find(l => /SHIP_SYNTAX/.test(l)), audit: chk.find(l => /SHIP_AUDIT/.test(l)), last: chk[chk.length - 1] });
  await vscode.commands.executeCommand('workbench.output.action.clearOutput').then(() => {}, () => {});
  ed = await open(PLAN.sceneFile, 1, 0);
  const costLines = await vscode.commands.executeCommand('x0Navigator.costIfDeployed');
  await sleep(1800);
  await shoot('r2_cost', { status: api.statusText(ed.document), viewer: costLines.find(l => /DEPLOY_COST app=viewer/.test(l)), apps: costLines.filter(l => /DEPLOY_COST app=/.test(l)).length });
  await tidy();
  if (PLAN.lens) {
    ed = await open(PLAN.lens.file, PLAN.lens.line, 2);
    await sleep(2500);
    const cl = await vscode.commands.executeCommand('vscode.executeCodeLensProvider', ed.document.uri, 200);
    const mine = (cl || []).filter(l => l.command && l.command.command === 'x0Navigator.openLogLine');
    await shoot('r3_lens', { file: rel(PLAN.lens.file), line: PLAN.lens.line, lenses: mine.length, title: mine[0] ? mine[0].command.title : null, lens_line: mine[0] ? mine[0].range.start.line + 1 : null });
  }

  // The one real event: move the write one line down, save, ask again.
  const w = PLAN.write;                                        // the file:line the index gave for the field
  ed = await open(w.file, w.line, 0);
  await shoot('e0_write_before', { file: rel(w.file), line: w.line, text: ed.document.lineAt(w.line - 1).text.trim().slice(0, 90) });
  await ed.edit(b => b.insert(new vscode.Position(w.line - 1, 0), ed.document.lineAt(w.line - 1).text.match(/^\s*/)[0] + '// a new line added above (film: the code moves)\n'));
  await ed.document.save();
  ed.selection = new vscode.Selection(w.line, 0, w.line, 0);
  await sleep(700);
  await shoot('e1_write_moved', { file: rel(w.file), now_line: w.line + 1, text: ed.document.lineAt(w.line).text.trim().slice(0, 90), saved: !ed.document.isDirty });
  ed = await open(d.file, d.line, d.col);
  const tAsk = Date.now();
  await vscode.commands.executeCommand('editor.action.showHover'); await sleep(900);
  const stale = await facts(ed);
  await shoot('e2_right_after_save', stale);
  let now = stale, waited = 0;
  for (let i = 0; i < 30 && !/written at/.test(now.hover); i++) { await sleep(1000); now = await facts(ed); }
  waited = Math.round((Date.now() - tAsk) / 100) / 10;
  await vscode.commands.executeCommand('editor.action.showHover'); await sleep(1500);
  await shoot('e3_knows_new_line', Object.assign({ seconds_after_first_ask: waited, refresh_runs: api.refreshRuns() }, await facts(ed)));

  // The log stamp: run the repo's own task on a witness, open the saved log, put the cursor on line 1.
  const wit = PLAN.witness;
  ed = await open(wit, 1, 0);
  const tasks = await vscode.tasks.fetchTasks();
  const task = tasks.find(x => /^Run this witness/.test(x.name));
  let exit = 'no-task';
  if (task) {
    const done = new Promise(r => { const s = vscode.tasks.onDidEndTaskProcess(e => { if (e.execution.task.name === task.name) { s.dispose(); r(e.exitCode); } }); });
    await vscode.tasks.executeTask(task);
    exit = await Promise.race([done, sleep(90000).then(() => 'timeout')]);
  }
  await sleep(500);
  await tidy();
  const logFile = path.join(PLAN.root, 'logs', path.basename(wit, '.js') + '.log');
  ed = await open(logFile, 1, 0);
  ed.selection = new vscode.Selection(0, 0, 0, ed.document.lineAt(0).text.length);
  await vscode.commands.executeCommand('editor.action.toggleWordWrap').then(() => {}, () => {});
  await sleep(800);
  await shoot('l1_log_stamp', { task: task ? task.name : null, exit, log: rel(logFile), line1: ed.document.lineAt(0).text.slice(0, 200), last: ed.document.lineAt(Math.max(0, ed.document.lineCount - 2)).text.slice(0, 160) });
}

exports.run = async function () {
  try { await (MODE === 'before' ? before() : after()); } catch (e) { log(SEC + 'FILM_ERROR mode=' + MODE + ' ' + String(e && e.stack || e).replace(/\n/g, ' | ')); }
  fs.writeFileSync(path.join(OUT, 'done.' + MODE), 'x');
};
