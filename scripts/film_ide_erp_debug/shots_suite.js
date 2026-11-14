// # ⚠ DO NOT REMOVE — SCOPE: film 3 (prompts/FILM_IDE_ERP_DEBUG.md), the half that runs INSIDE the real VS Code, on the OLD tree (the bug). What VS Code itself reports is logged as a §FILM_SHOT line; those
// lines are the only source of the film's numbers. Nothing is staged: the hover reads a REAL stamped log made by a real run of the witness (before.log), F12 is the editor's own Go to Definition, and the fix is TYPED
// into ws_kernel.js one key at a time with the editor's own `type` command (two fragments cut from the OLD line, each found in the merged file by plan.js). The file is saved and the witness is run again (after.log).
// Read shots.log after every run.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const vscode = require('vscode');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const STEPS = (process.env.FILM_STEPS || 'all').split(','), want = k => STEPS.indexOf('all') >= 0 || STEPS.indexOf(k) >= 0;
const OUT = process.env.FILM_OUT, PLAN = JSON.parse(process.env.FILM_PLAN), ROOT = PLAN.old, SEC = '§';
const log = l => fs.appendFileSync(path.join(OUT, 'shots.log'), l + '\n');
const hoverText = hs => (hs || []).map(h => (Array.isArray(h.contents) ? h.contents : [h.contents]).map(c => (typeof c === 'string' ? c : (c && c.value) || '')).join('\n')).join('\n');
async function shoot(name, facts) {
  await vscode.commands.executeCommand('notifications.clearAll').then(() => {}, () => {}); await sleep(250);
  const req = path.join(OUT, 'shoot.req'); fs.writeFileSync(req, name);
  for (let i = 0; i < 100 && fs.existsSync(req); i++) await sleep(100);
  log(SEC + 'FILM_SHOT name=' + name + ' ' + Object.keys(facts || {}).map(k => k + '=' + JSON.stringify(facts[k])).join(' '));
}
async function open(rel, line, col) {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(ROOT, rel)));
  const ed = await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.One });
  ed.selection = new vscode.Selection(line - 1, col, line - 1, col);
  ed.revealRange(new vscode.Range(line - 1, 0, line - 1, 0), vscode.TextEditorRevealType.InCenter); await sleep(700); return ed;
}
const relOf = p => path.relative(ROOT, p);
async function tidy() { for (const c of ['notifications.clearAll', 'workbench.action.closeSidebar', 'workbench.action.closeAuxiliaryBar', 'workbench.action.closePanel']) await vscode.commands.executeCommand(c).then(() => {}, () => {}); }
async function hoverShot(name, rel, line, col) {
  const ed = await open(rel, line, col); await vscode.commands.executeCommand('editor.action.showHover'); await sleep(2500);
  const hov = await vscode.commands.executeCommand('vscode.executeHoverProvider', ed.document.uri, ed.selection.active), raw = hoverText(hov);
  const last = (raw.split('\n').find(l => l.startsWith('last value')) || '').trim().slice(0, 260);
  await shoot(name, { file: relOf(ed.document.uri.fsPath), line: line, last, hover: raw.replace(/\s+/g, ' ').trim().slice(0, 1500) });
  return last;
}
exports.run = async function () {
  try {
    const ext = vscode.extensions.getExtension('bim-devtools.x0-navigator'), api = await ext.activate(), fresh = await api.whenFresh();
    log(SEC + 'FILM_X0 active=' + ext.isActive + ' fresh=' + JSON.stringify(fresh && fresh.line) + ' vscode=' + vscode.version); await tidy();
    // 2. F12 on the call of env(): the editor's own Go to Definition (waits until the language service answers: it starts slowly on a big folder)
    let ed = await open(PLAN.kernel, PLAN.call.line, PLAN.call.col);   // FIRST file opened: the language service answers F12 only then (measured: after opening the witness file first it never answered in 120 s)
    if (want('f')) {
      let defs = [], t0 = Date.now();
      while (Date.now() - t0 < 120000) { defs = await vscode.commands.executeCommand('vscode.executeDefinitionProvider', ed.document.uri, ed.selection.active) || []; if (defs.length) break; await sleep(2000); }
      log(SEC + 'FILM_DEFS count=' + defs.length + ' waited_ms=' + (Date.now() - t0) + ' at=' + defs.map(d => relOf((d.uri || d.targetUri).fsPath) + ':' + ((d.range || d.targetSelectionRange || d.targetRange).start.line + 1)).join(','));
      await shoot('f1_call', { file: PLAN.kernel, line: PLAN.call.line, text: ed.document.lineAt(PLAN.call.line - 1).text.trim().slice(0, 80) });
      await vscode.commands.executeCommand('editor.action.revealDefinition'); await sleep(2000); ed = vscode.window.activeTextEditor;
      const dl = ed.selection.active.line + 1;
      await shoot('f2_landed', { file: relOf(ed.document.uri.fsPath), line: dl, text: ed.document.lineAt(dl - 1).text.trim().slice(0, 80), expectLine: PLAN.def.line });
    }
    // 1. the hover on the tag: the REAL stamped log (before.log, written by shoot.sh from a real run of the witness on this very tree)
    if (want('h1')) await hoverShot('h1_tag_before', PLAN.tagPlace.rel, PLAN.tagPlace.line, PLAN.tagPlace.col);
    if (!want('t')) { fs.writeFileSync(path.join(OUT, 'done.fix'), 'x'); return; }
    // 3. the fix, typed. Fragment i: select the old text on its line, delete it, type the new text key by key; stills at the start, half way and the end.
    ed = await open(PLAN.kernel, PLAN.frags[0].line, 0);
    for (let i = 0; i < PLAN.frags.length; i++) {
      const F = PLAN.frags[i], ln = F.line - 1, txt = ed.document.lineAt(ln).text, c0 = txt.indexOf(F.old);
      if (c0 < 0) throw new Error('fragment ' + i + ' not on line ' + F.line + ' any more (typed state moved the text)');
      ed.selection = new vscode.Selection(ln, c0, ln, c0 + F.old.length); ed.revealRange(new vscode.Range(ln, 0, ln, 0), vscode.TextEditorRevealType.InCenter);
      await vscode.commands.executeCommand('deleteLeft'); await sleep(500);
      await shoot('t' + i + 'a_deleted', { line: F.line, typed: 0, of: F.neu.length });
      let typed = 0; const marks = [Math.floor(F.neu.length / 2), F.neu.length];
      for (const ch of F.neu) { await vscode.commands.executeCommand('type', { text: ch }); typed++; await sleep(35);
        if (marks.indexOf(typed) >= 0) { await sleep(200); await shoot('t' + i + (typed === F.neu.length ? 'c_typed' : 'b_half'), { line: F.line, typed, of: F.neu.length, text: ed.document.lineAt(ln).text.trim().slice(0, 160) }); } }
    }
    await ed.document.save(); await sleep(600);
    const after = ed.document.getText().split('\n'); log(SEC + 'FILM_TYPED lines=' + PLAN.frags.map(f => f.line).join(',') + ' fragments_in_file=' + PLAN.frags.every(f => after.some(l => l.indexOf(f.neu) >= 0)) + ' old_gone=' + PLAN.frags.every(f => !after.some(l => l.indexOf(f.old) >= 0)));
    await shoot('s1_saved', { file: PLAN.kernel, saved: !ed.document.isDirty });
    // 4. the witness again on the edited tree (a real run, its log stamped by shoot.sh)
    fs.writeFileSync(path.join(OUT, 'run_after.req'), 'x'); for (let i = 0; i < 4000 && fs.existsSync(path.join(OUT, 'run_after.req')); i++) await sleep(100);
  } catch (e) { log(SEC + 'FILM_ERROR ' + String(e && e.stack || e).replace(/\n/g, ' | ')); }
  fs.writeFileSync(path.join(OUT, 'done.fix'), 'x');
};
