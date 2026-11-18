// # ⚠ DO NOT REMOVE — SCOPE: film 4 "CH 0 · From an empty folder to a witnessed dev setup" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 4), the half that runs INSIDE the real VS Code, opened on WORK (the copy of the
// download) with X0 Navigator INSTALLED from the .vsix the film built (a throwaway --extensions-dir; the owner's profile is not touched). For every row of out/facts.json `vsc`: open the file at the line,
// do what the row says (hover / select / the SAME edit the typed command made, saved, then undone), ask shoot.sh for a still, and log a §FILM_SHOT line with what the EDITOR itself shows on that line
// (and the hover text it computed). The film's numbers come from those lines, never from this script. Read shots.log after every run.
'use strict';
const fs = require('fs'), path = require('path'), vscode = require('vscode');
const sleep = ms => new Promise(r => setTimeout(r, ms)), OUT = process.env.FILM_OUT, WORK = process.env.FILM_WORK, SEC = '§';
const log = l => fs.appendFileSync(path.join(OUT, 'shots.log'), l + '\n');
const hoverText = hs => (hs || []).map(h => (Array.isArray(h.contents) ? h.contents : [h.contents]).map(c => (typeof c === 'string' ? c : (c && c.value) || '')).join(' ')).join(' | ').replace(/\s+/g, ' ').trim();
async function shoot(name, facts) {
  await vscode.commands.executeCommand('notifications.clearAll').then(() => {}, () => {}); await sleep(300);
  const req = path.join(OUT, 'shoot.req'); fs.writeFileSync(req, name); for (let i = 0; i < 100 && fs.existsSync(req); i++) await sleep(100);
  log(SEC + 'FILM_SHOT name=' + name + ' ' + Object.keys(facts).map(k => k + '=' + JSON.stringify(facts[k])).join(' '));
}
async function open(file, line, col) {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(WORK, file))), ed = await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.One });
  ed.selection = new vscode.Selection(line - 1, col || 0, line - 1, col || 0); ed.revealRange(new vscode.Range(line - 1, 0, line - 1, 0), vscode.TextEditorRevealType.InCenter); await sleep(900); return ed;
}
exports.run = async function () {
  try {
    const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
    for (const c of ['workbench.action.closeSidebar', 'workbench.action.closeAuxiliaryBar', 'workbench.action.closePanel']) await vscode.commands.executeCommand(c).then(() => {}, () => {});
    const ext = vscode.extensions.getExtension('bim-devtools.x0-navigator'); if (!ext) throw new Error('X0 Navigator is not installed in this --extensions-dir');
    const api = await ext.activate(), fresh = await api.whenFresh(); log(SEC + 'FILM_X0 installed=true active=' + ext.isActive + ' version=' + ext.packageJSON.version + ' fresh=' + JSON.stringify(fresh && fresh.line) + ' vscode=' + vscode.version);
    for (const row of F.vsc) {
      const doc0 = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(WORK, row.file))), text0 = doc0.lineAt(row.action === 'insert' ? row.after - 1 : row.line - 1).text, col = row.find ? Math.max(0, text0.indexOf(row.find)) + 2 : 0;
      let ed = await open(row.file, row.line, col), facts = { file: row.file, line: row.line, action: row.action };
      if (row.action === 'hover') { await vscode.commands.executeCommand('editor.action.showHover'); await sleep(3500); facts.hover = hoverText(await vscode.commands.executeCommand('vscode.executeHoverProvider', ed.document.uri, ed.selection.active)).slice(0, 400); }
      if (row.action === 'replace') { const ln = ed.document.lineAt(row.line - 1), nt = ln.text.replace(new RegExp(row.re.replace(/\?/g, '\\?')), row.to)   /* row.re is the sed pattern: its ? is a literal */; facts.before = ln.text.trim().slice(0, 160);
        await ed.edit(b => b.replace(ln.range, nt)); await ed.document.save(); ed.selection = new vscode.Selection(row.line - 1, 0, row.line - 1, nt.length); await sleep(700); facts.saved = !ed.document.isDirty; }
      if (row.action === 'insert') { const at = new vscode.Position(row.after, 0); await ed.edit(b => b.insert(at, row.text + '\n')); await ed.document.save(); ed.selection = new vscode.Selection(row.line - 1, 0, row.line - 1, row.text.length); ed.revealRange(new vscode.Range(row.line - 1, 0, row.line - 1, 0), vscode.TextEditorRevealType.InCenter); await sleep(700); facts.saved = !ed.document.isDirty; }
      if (row.action === 'select') { ed.selection = new vscode.Selection(row.line - 1, 0, row.line - 1, ed.document.lineAt(row.line - 1).text.length); await sleep(500); }
      facts.text = ed.document.lineAt(row.line - 1).text.trim().slice(0, 200); await shoot(row.name, facts);
      if (row.action === 'replace') { const ln = ed.document.lineAt(row.line - 1); await ed.edit(b => b.replace(ln.range, text0)); await ed.document.save(); log(SEC + 'FILM_UNDO name=' + row.name + ' restored=' + (ed.document.lineAt(row.line - 1).text === text0)); }
      if (row.action === 'insert') { await ed.edit(b => b.delete(new vscode.Range(row.after, 0, row.after + 1, 0))); await ed.document.save(); log(SEC + 'FILM_UNDO name=' + row.name + ' restored=' + (ed.document.lineCount > row.after)); }
    }
  } catch (e) { log(SEC + 'FILM_ERROR ' + String(e && e.stack || e).replace(/\n/g, ' | ')); }
  fs.writeFileSync(path.join(OUT, 'done.fix'), 'x');
};
