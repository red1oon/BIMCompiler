// # ⚠ DO NOT REMOVE — SCOPE: film 4 v4 "CH 0 · From an empty folder to a witnessed dev setup" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 4), the half that runs INSIDE the real VS Code, opened on the DOWNLOAD (facts.js) with the
// arguments `node scripts/setup.js --open` printed (setup's own throwaway extensions + user-data folders; Code Facts was installed there BY setup.js). For every row of out/facts.json `vsc` it does the real thing in the editor
// (explorer + the repo's .vscode, the Extensions view, the Run Task menu, a snippet expanding, the F5 launch menu, a hover, a saved edit that is then undone), asks shoot.sh for a still, and logs a §FILM_SHOT line with what the
// EDITOR itself reports (task labels from the task API, launch targets from the configuration API, the expanded snippet's first line, the hover text its providers computed). The film's numbers come from those lines, never from
// this script. Read shots.log after every run.
'use strict';
const fs = require('fs'), path = require('path'), vscode = require('vscode');
const sleep = ms => new Promise(r => setTimeout(r, ms)), OUT = process.env.FILM_OUT, WORK = process.env.FILM_WORK, SEC = '§';
const log = l => fs.appendFileSync(path.join(OUT, 'shots.log'), l + '\n');
const hoverText = hs => (hs || []).map(h => (Array.isArray(h.contents) ? h.contents : [h.contents]).map(c => (typeof c === 'string' ? c : (c && c.value) || '')).join(' ')).join(' | ').replace(/\s+/g, ' ').trim();
async function shoot(name, facts) {
  await vscode.commands.executeCommand('notifications.clearAll').then(() => {}, () => {}); await sleep(300);
  const req = path.join(OUT, 'shoot.req'); fs.writeFileSync(req, name); for (let i = 0; i < 100 && fs.existsSync(req); i++) await sleep(100);
  log(SEC + 'FILM_SHOT name=' + name + ' ' + JSON.stringify(facts));
}
async function open(file, line, col) {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(WORK, file))), ed = await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.One });
  ed.selection = new vscode.Selection(line - 1, col || 0, line - 1, col || 0); ed.revealRange(new vscode.Range(line - 1, 0, line - 1, 0), vscode.TextEditorRevealType.InCenter); await sleep(900); return ed;
}
const fire = c => { vscode.commands.executeCommand(c).then(() => {}, () => {}); };   // a command that opens a pick list answers only when something is picked: do not wait for it
exports.run = async function () {
  try {
    const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
    for (const c of ['workbench.action.closeAuxiliaryBar', 'workbench.action.closePanel']) await vscode.commands.executeCommand(c).then(() => {}, () => {});
    const ext = vscode.extensions.getExtension('bim-devtools.code-facts'); if (!ext) throw new Error('Code Facts is not installed in setup.js\'s extensions folder');
    const api = await ext.activate(), fresh = await api.whenFresh(); log(SEC + 'FILM_CODEFACTS installed=true active=' + ext.isActive + ' version=' + ext.packageJSON.version + ' from=' + (ext.extensionPath.indexOf(path.join('.setup', 'vscode-ext')) >= 0 ? 'setup-extensions-folder' : ext.extensionPath) + ' fresh=' + JSON.stringify(fresh && fresh.line) + ' vscode=' + vscode.version);
    await vscode.commands.executeCommand('workbench.view.explorer').then(() => {}, () => {});
    for (const row of F.vsc) {
      const facts = { kind: row.kind };
      if (row.kind === 'dir') {                       // the explorer, with the repo's own .vscode folder open, tasks.json in the editor
        const u = vscode.Uri.file(path.join(WORK, row.file)); await vscode.commands.executeCommand('revealInExplorer', u).then(() => {}, () => {}); const ed = await open(row.file, row.line, 0);
        facts.file = row.file; facts.line = row.line; facts.text = ed.document.lineAt(0).text.trim().slice(0, 120); await sleep(700);
        facts.vscode_dir = fs.readdirSync(path.join(WORK, '.vscode')).sort().join(',');
      }
      if (row.kind === 'ext') {                       // the Extensions view, installed only
        await vscode.commands.executeCommand('workbench.view.extensions').then(() => {}, () => {}); await vscode.commands.executeCommand('workbench.extensions.search', '@installed').then(() => {}, () => {}); await sleep(3500);
        facts.installed = vscode.extensions.all.filter(e => !e.packageJSON.isBuiltin && e.extensionPath.indexOf(path.join('.setup', 'vscode-ext')) >= 0).map(e => e.id + '@' + e.packageJSON.version).join(','); facts.active = ext.isActive;
      }
      if (row.kind === 'tasks') {                     // the Run Task menu, and the labels the task API gives for the workspace
        await vscode.commands.executeCommand('workbench.view.explorer').then(() => {}, () => {});
        const ts = await vscode.tasks.fetchTasks(); facts.labels = ts.filter(t => t.source === 'Workspace').map(t => t.name); facts.count = facts.labels.length;
        fire('workbench.action.tasks.runTask'); await sleep(2200);
      }
      if (row.kind === 'snippet') {                   // a witness snippet: the prefix, the suggestion, the expansion
        const doc = await vscode.workspace.openTextDocument({ language: 'javascript', content: '' }), ed = await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.One });
        await ed.edit(b => b.insert(new vscode.Position(0, 0), row.prefix)); ed.selection = new vscode.Selection(0, row.prefix.length, 0, row.prefix.length); await sleep(500);
        fire('editor.action.triggerSuggest'); await sleep(2500); facts.prefix = row.prefix; facts.step = 'suggest list'; await shoot('s_snip_suggest', { kind: 'snippet', prefix: row.prefix, step: 'suggest' });
        await vscode.commands.executeCommand('acceptSelectedSuggestion').then(() => {}, () => {}); await sleep(1500);
        let first = doc.lineAt(0).text; facts.via = 'suggest';
        if (first.indexOf('#!/usr/bin/env node') !== 0) {   // the suggestion list put another word first: insert the same snippet by name (its row in witness.code-snippets)
          await ed.edit(b => b.delete(new vscode.Range(0, 0, doc.lineCount, 0))); await vscode.commands.executeCommand('editor.action.insertSnippet', { name: 'Witness (contract.js skeleton)' }).then(() => {}, () => {}); await sleep(1500); first = doc.lineAt(0).text; facts.via = 'insertSnippet by name'; }
        facts.first_line = first.trim().slice(0, 80); facts.lines = doc.lineCount; facts.unedited_fails = /FAIL|empty population/i.test(doc.getText());
        ed.revealRange(new vscode.Range(0, 0, 0, 0), vscode.TextEditorRevealType.AtTop); await sleep(500);
      }
      if (row.kind === 'launch') {                    // F5: the launch menu, and the targets the configuration API gives
        const cfg = vscode.workspace.getConfiguration('launch', vscode.Uri.file(WORK)).get('configurations') || []; facts.targets = cfg.map(c => c.name); facts.count = cfg.length;
        fire('workbench.action.debug.selectandstart'); await sleep(2200);
      }
      if (row.kind === 'hover' || row.kind === 'replace' || row.kind === 'insert' || row.kind === 'select' || row.kind === 'pre' || row.kind === 'tokensel') {
        await vscode.commands.executeCommand('workbench.action.closeQuickOpen').then(() => {}, () => {});
        const doc0 = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(WORK, row.file))), text0 = doc0.lineAt(row.kind === 'insert' ? row.after - 1 : row.line - 1).text, col = row.find ? Math.max(0, text0.indexOf(row.find)) + 2 : 0;
        const ed = await open(row.file, row.line, col); Object.assign(facts, { file: row.file, line: row.line });
        const tokR = () => { const t = ed.document.lineAt(row.line - 1).text, c0 = t.indexOf(row.find); return new vscode.Range(row.line - 1, c0, row.line - 1, c0 + row.find.length); };
        if (row.kind === 'pre') { const far = row.line - 1 + (row.far || 6); ed.selection = new vscode.Selection(far, 0, far, 0); await sleep(900); facts.state = 'caret at line ' + (far + 1) + ' col 1, no selection, no hover'; }   // the view does not move: only the caret does
        if (row.kind === 'tokensel') { const r = tokR(); ed.selection = new vscode.Selection(r.start, r.end); await sleep(900); facts.state = 'token selected'; facts.token = row.find; facts.sel_text = ed.document.getText(r); }
        if (row.kind === 'hover') { await vscode.commands.executeCommand('editor.action.showHover'); await sleep(3500); facts.hover = hoverText(await vscode.commands.executeCommand('vscode.executeHoverProvider', ed.document.uri, ed.selection.active)).slice(0, 400); }
        if (row.kind === 'replace') { const ln = ed.document.lineAt(row.line - 1), nt = ln.text.replace(new RegExp(row.re.replace(/\?/g, '\\?')), row.to) /* row.re is the sed pattern: its ? is a literal */; facts.before = ln.text.trim().slice(0, 160);
          await ed.edit(b => b.replace(ln.range, nt)); await ed.document.save(); ed.selection = new vscode.Selection(row.line - 1, 0, row.line - 1, nt.length); await sleep(700); facts.saved = !ed.document.isDirty; }
        if (row.kind === 'insert') { const at = new vscode.Position(row.after, 0); await ed.edit(b => b.insert(at, row.text + '\n')); await ed.document.save(); ed.selection = new vscode.Selection(row.line - 1, 0, row.line - 1, row.text.length);
          ed.revealRange(new vscode.Range(row.line - 1, 0, row.line - 1, 0), vscode.TextEditorRevealType.InCenter); await sleep(700); facts.saved = !ed.document.isDirty; }
        if (row.kind === 'select') { ed.selection = new vscode.Selection(row.line - 1, 0, row.line - 1, ed.document.lineAt(row.line - 1).text.length); await sleep(500); }
        facts.text = ed.document.lineAt(row.line - 1).text.trim().slice(0, 200); await shoot(row.name, facts);
        if (row.kind === 'replace') { const ln = ed.document.lineAt(row.line - 1); await ed.edit(b => b.replace(ln.range, text0)); await ed.document.save(); log(SEC + 'FILM_UNDO name=' + row.name + ' restored=' + (ed.document.lineAt(row.line - 1).text === text0)); }
        if (row.kind === 'insert') { await ed.edit(b => b.delete(new vscode.Range(row.after, 0, row.after + 1, 0))); await ed.document.save(); log(SEC + 'FILM_UNDO name=' + row.name + ' restored=' + (ed.document.lineCount > row.after)); }
        continue;
      }
      await shoot(row.name, facts);
      if (row.kind === 'tasks' || row.kind === 'launch') await vscode.commands.executeCommand('workbench.action.closeQuickOpen').then(() => {}, () => {});
      if (row.kind === 'snippet') await vscode.commands.executeCommand('workbench.action.revertAndCloseActiveEditor').then(() => {}, () => {});   // the untitled scratch buffer goes without a save prompt
    }
  } catch (e) { log(SEC + 'FILM_ERROR ' + String(e && e.stack || e).replace(/\n/g, ' | ')); }
  fs.writeFileSync(path.join(OUT, 'done.fix'), 'x');
};
