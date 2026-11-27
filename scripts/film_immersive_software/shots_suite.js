// # ⚠ DO NOT REMOVE — SCOPE: film "CH 0 · Immersive Software" (prompts/FILM_IMMERSIVE_SOFTWARE.md), the half that runs INSIDE the real VS Code (NEW tree). For each link the overlay's V key made in the
// real page (out/facts.json targets.*.vOpened, a vscode://file/<path>:<line> URL), the editor opens that file at that line and selects it; a still is taken and a §FILM_SHOT line records what the editor itself
// shows on that line. The film's numbers come from those lines, never from this script. Read shots.log after every run.
'use strict';
const fs = require('fs'), path = require('path'), vscode = require('vscode');
const sleep = ms => new Promise(r => setTimeout(r, ms)), OUT = process.env.FILM_OUT, SEC = '§';
const log = l => fs.appendFileSync(path.join(OUT, 'shots.log'), l + '\n');
async function shoot(name, facts) {
  await vscode.commands.executeCommand('notifications.clearAll').then(() => {}, () => {}); await sleep(300);
  const req = path.join(OUT, 'shoot.req'); fs.writeFileSync(req, name); for (let i = 0; i < 100 && fs.existsSync(req); i++) await sleep(100);
  log(SEC + 'FILM_SHOT name=' + name + ' ' + Object.keys(facts).map(k => k + '=' + JSON.stringify(facts[k])).join(' '));
}
exports.run = async function () {
  try {
    const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8'));
    for (const c of ['workbench.action.closeSidebar', 'workbench.action.closeAuxiliaryBar', 'workbench.action.closePanel']) await vscode.commands.executeCommand(c).then(() => {}, () => {});
    for (const k of ['bar', 'wall']) {
      const link = (F.targets[k].vOpened || [])[0] || '', m = /^vscode:\/\/file(\/.+):(\d+)$/.exec(link);
      if (!m) { log(SEC + 'FILM_ERROR no V link for ' + k + ': ' + link); continue; }
      const file = m[1], line = +m[2], doc = await vscode.workspace.openTextDocument(vscode.Uri.file(file));
      const ed = await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.One });
      ed.selection = new vscode.Selection(line - 1, 0, line - 1, doc.lineAt(line - 1).text.length);
      ed.revealRange(new vscode.Range(line - 1, 0, line - 1, 0), vscode.TextEditorRevealType.InCenter); await sleep(1500);
      await shoot('v_' + k, { link, file: path.basename(file), line, text: doc.lineAt(line - 1).text.trim().slice(0, 200) });
    }
  } catch (e) { log(SEC + 'FILM_ERROR ' + String(e && e.stack || e).replace(/\n/g, ' | ')); }
  fs.writeFileSync(path.join(OUT, 'done.fix'), 'x');
};
