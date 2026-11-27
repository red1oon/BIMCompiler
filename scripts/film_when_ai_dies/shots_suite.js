// ⚠ DO NOT REMOVE — SCOPE: film "When AI Dies" (prompts/FILM_WHEN_AI_DIES.md), the half that runs INSIDE the real VS Code (1.146, the bim-ootb tree opened, X0 Navigator loaded from source, "chat.disableAIFeatures": true).
// For each of the five questions the editor is DRIVEN (VS Code's own commands: Find All References, the hover, a save, the Bump button, Context for this file) and a still is taken at each step by shoot.sh;
// every §FILM_SHOT line records what the editor itself reported at that step (counts, the hover's text, the diagnostic's message, the button's lines and timings). The film's numbers come from those lines, never from this script.
// Whatever it edits (a Date.now() line, a comment line, the Bump write) is taken back before it ends and the tree is checked clean (§FILM_RESTORE). READ shots.log after every run.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), vscode = require('vscode');
const sleep = ms => new Promise(r => setTimeout(r, ms)), OUT = process.env.FILM_OUT, TREE = process.env.FILM_TREE, SEC = '§', SETTINGS = process.env.FILM_SETTINGS;
const log = l => fs.appendFileSync(path.join(OUT, 'shots.log'), l + '\n');
const J = v => JSON.stringify(v);
const git = args => cp.spawnSync('git', args, { cwd: TREE, encoding: 'utf8' });
const hoverText = hs => (hs || []).map(h => (Array.isArray(h.contents) ? h.contents : [h.contents]).map(c => (typeof c === 'string' ? c : (c && c.value) || '')).join('\n')).join('\n---\n');
async function shoot(name, facts) {
  await vscode.commands.executeCommand('notifications.clearAll').then(() => {}, () => {});
  const req = path.join(OUT, 'shoot.req'); fs.writeFileSync(req, name); const t0 = Date.now(); for (let i = 0; i < 200 && fs.existsSync(req); i++) await sleep(50);
  log(SEC + 'FILM_SHOT name=' + name + ' still_ms=' + (Date.now() - t0) + ' json=' + J(facts || {}));
}
async function open(file, line0, col) {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(file)), ed = await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.One });
  const p = new vscode.Position(line0, col || 0); ed.selection = new vscode.Selection(p, p); ed.revealRange(new vscode.Range(p, p), vscode.TextEditorRevealType.InCenter); await sleep(900); return { doc, ed };
}
const clean = () => { const s = git(['status', '--porcelain', '-uno']).stdout.trim(); return s; };
exports.run = async function () {
  try {
    for (const c of ['workbench.action.closeSidebar', 'workbench.action.closeAuxiliaryBar', 'workbench.action.closePanel']) await vscode.commands.executeCommand(c).then(() => {}, () => {});
    await vscode.commands.executeCommand('notifications.toggleDoNotDisturbMode').then(() => {}, () => {});
    await vscode.commands.executeCommand('workbench.action.toggleFullScreen').then(() => {}, () => {}); await sleep(1500);
    const ext = vscode.extensions.getExtension('bim-devtools.x0-navigator'), api = await ext.activate();
    const fresh = await Promise.race([api.whenFresh(), sleep(90000).then(() => 'timeout')]); log(SEC + 'FILM_FRESH ' + (fresh === 'timeout' ? 'timeout' : 'ok'));
    log(SEC + 'FILM_START clean=' + J(clean() === ''));
    // ── before: the setting, in the profile's own settings.json
    { const txt = fs.readFileSync(SETTINGS, 'utf8').split('\n'), i = txt.findIndex(l => l.indexOf('"chat.disableAIFeatures"') >= 0);
      const { doc } = await open(SETTINGS, Math.max(0, i), 0); const ed = vscode.window.activeTextEditor; ed.selection = new vscode.Selection(i, 0, i, doc.lineAt(i).text.length);
      const non = vscode.extensions.all.filter(e => !e.packageJSON.isBuiltin).map(e => e.id), aiLike = vscode.extensions.all.filter(e => /copilot|claude|gemini|codeium|tabnine|cursor|chatgpt|openai|anthropic/i.test(e.id)).map(e => e.id);
      await shoot('before', { setting: vscode.workspace.getConfiguration('chat').get('disableAIFeatures'), line: i + 1, text: doc.lineAt(i).text.trim(), non_builtin_extensions: non, ai_named_extensions: aiLike, vscode: vscode.version }); }
    // ── q1: Find All References on a field of the shared object
    { const f = path.join(TREE, 'viewer/cost_panel.js'), doc0 = await vscode.workspace.openTextDocument(vscode.Uri.file(f)), lines = doc0.getText().split('\n');
      const i = lines.findIndex(l => /\bAPP\.db\b/.test(l)), col = lines[i].indexOf('APP.db') + 'APP.'.length + 1;
      const { doc, ed } = await open(f, i, col);
      const pos = new vscode.Position(i, col), defs = await vscode.commands.executeCommand('vscode.executeDefinitionProvider', doc.uri, pos), refs = await vscode.commands.executeCommand('vscode.executeReferenceProvider', doc.uri, pos);
      const dloc = (defs || []).map(l => { const u = l.uri || l.targetUri, r = l.range || l.targetSelectionRange; return path.relative(TREE, u.fsPath) + ':' + (r.start.line + 1); });
      const rfiles = new Set((refs || []).map(l => l.uri.fsPath));
      await vscode.commands.executeCommand('editor.action.goToReferences'); await sleep(2500);
      await shoot('q1_refs', { field: 'APP.db', at: path.relative(TREE, f) + ':' + (i + 1), text: lines[i].trim().slice(0, 120), places: (refs || []).length, files: rfiles.size, definitions: dloc });
      await vscode.commands.executeCommand('closeReferenceSearch').then(() => {}, () => {}); await sleep(300); }
    // ── q2: the line the ERP hover's Alt+n opened (recorded by erp_shot.js in the real page)
    { const E = JSON.parse(fs.readFileSync(path.join(OUT, 'erp.json'), 'utf8')), m = /^vscode:\/\/file(\/.+):(\d+)$/.exec(E.openedLink || '');
      if (!m) log(SEC + 'FILM_ERROR no vscode link from the ERP page: ' + E.openedLink);
      else { const line = +m[2], { doc } = await open(m[1], line - 1, 0); const ed = vscode.window.activeTextEditor; ed.selection = new vscode.Selection(line - 1, 0, line - 1, doc.lineAt(line - 1).text.length);
        await shoot('q2_line', { link: E.openedLink.replace(TREE, '<bim-ootb>'), file: path.relative(TREE, m[1]), line, text: doc.lineAt(line - 1).text.trim().slice(0, 160) }); } }
    // ── q3: the §TAG hover: the last provable value, its log and commit; and the grey line above
    const gate = path.join(TREE, 'viewer/schedule_gate.js');
    { const doc0 = await vscode.workspace.openTextDocument(vscode.Uri.file(gate)), lines = doc0.getText().split('\n'), i = lines.findIndex(l => /console\.log\(.§HOSTED_BEFORE_HOST /.test(l) || (l.indexOf('§HOSTED_BEFORE_HOST') >= 0 && /console\.log/.test(l)));
      const col = lines[i].indexOf('§HOSTED_BEFORE_HOST') + 4, { doc, ed } = await open(gate, i, col);
      await sleep(1500); const hs = await vscode.commands.executeCommand('vscode.executeHoverProvider', doc.uri, new vscode.Position(i, col)), ht = hoverText(hs);
      const lenses = (await vscode.commands.executeCommand('vscode.executeCodeLensProvider', doc.uri, 500) || []).filter(l => l.command && l.command.command === 'x0Navigator.openLogLine' && l.range.start.line === i).map(l => l.command.title);
      await vscode.commands.executeCommand('editor.action.showHover'); await sleep(1800);
      await shoot('q3_hover', { tag: SEC + 'HOSTED_BEFORE_HOST', at: path.relative(TREE, gate) + ':' + (i + 1), last_value_line: (/last value[^\n]*/.exec(ht) || [''])[0], spec_places: (ht.match(/prompts\/[^\s)]+\.md:\d+/g) || []).length, lens: lenses }); }
    // ── q4: a clock call typed into a core file: the warning, its reason, and what to call instead
    { const { doc, ed } = await open(gate, 1027, 0), lines0 = doc.getText().split('\n'), at = lines0.findIndex(l => /var _hc = _hostPairs/.test(l)), indent = (/^\s*/.exec(lines0[at]) || [''])[0];
      await ed.edit(e => e.insert(new vscode.Position(at, 0), indent + 'var filmNow = Date.now();\n')); await doc.save(); await sleep(1500);
      const dg = vscode.languages.getDiagnostics(doc.uri).filter(d => String(d.code).startsWith('x0.core-pure'));
      const col = indent.length + 'var filmNow = '.length + 2, p = new vscode.Position(at, col); ed.selection = new vscode.Selection(p, p); ed.revealRange(new vscode.Range(p, p), vscode.TextEditorRevealType.InCenter); await sleep(600);
      await vscode.commands.executeCommand('editor.action.showHover'); await sleep(1800);
      await shoot('q4_warn', { file: path.relative(TREE, gate), line: at + 1, typed: 'Date.now()', diagnostics: dg.length, code: dg[0] ? String(dg[0].code) : '', message: dg[0] ? dg[0].message : '', severity: dg[0] ? dg[0].severity : null });
      await vscode.commands.executeCommand('closeReferenceSearch').then(() => {}, () => {});
      await ed.edit(e => e.delete(new vscode.Range(at, 0, at + 1, 0))); await doc.save(); await sleep(1500);
      const after = vscode.languages.getDiagnostics(doc.uri).filter(d => String(d.code).startsWith('x0.core-pure')).length;
      log(SEC + 'FILM_RESTORE step=q4 warnings_after_removal=' + after + ' file_equals_HEAD=' + J(git(['diff', '--quiet', 'HEAD', '--', 'viewer/schedule_gate.js']).status === 0)); }
    // ── q5: the Bump button: a viewer file with one comment line added; press (checking) → ✓ → press (writes)
    { const f = path.join(TREE, 'viewer/cost_panel.js'), { doc, ed } = await open(f, 66, 0); const lines0 = doc.getText().split('\n');
      await ed.edit(e => e.insert(new vscode.Position(0, 0), '// film: one line changed, feature complete\n')); await doc.save(); await sleep(1500);
      const w = vscode.languages.getDiagnostics(doc.uri).filter(d => d.code === 'x0.bump');
      ed.revealRange(new vscode.Range(60, 0, 60, 0), vscode.TextEditorRevealType.InCenter); await sleep(600);
      await shoot('q5_idle', { file: 'viewer/cost_panel.js', bump_warning: w.length, message: w[0] ? w[0].message : '' });
      const t0 = Date.now(); let ended = null; const p1 = Promise.resolve(vscode.commands.executeCommand('x0Navigator.bumpButton')).then(r => { ended = Date.now() - t0; return r; });
      await sleep(Number(process.env.FILM_CHECK_DELAY || 250)); const sh0 = Date.now() - t0; await shoot('q5_checking', { delay_ms: sh0 }); const shAt = Date.now() - t0; const during = ended === null;
      const lines1 = await p1; await sleep(500);
      log(SEC + 'FILM_SHOT_TIMING name=q5_checking press_to_still_ms=' + shAt + ' check_ended_ms=' + ended + ' during_check=' + (during ? 'Y' : 'N'));
      await shoot('q5_ready', { lines: (lines1 || []).filter(l => /^§BUMP/.test(l)) });
      const lines2 = await vscode.commands.executeCommand('x0Navigator.bumpButton'); await sleep(800);
      const changed = git(['status', '--porcelain', '-uno']).stdout.trimEnd().split('\n').filter(Boolean).map(s => s.slice(3)).filter(x => x !== 'viewer/cost_panel.js');
      const swp = path.join(TREE, 'viewer/sw.js'), swDoc = await vscode.workspace.openTextDocument(vscode.Uri.file(swp)), swLines = swDoc.getText().split('\n'), k = swLines.findIndex(l => /^\s*(const|var|let)\s+CACHE_VERSION\b/.test(l));
      await open(swp, k, 0); const e2 = vscode.window.activeTextEditor; e2.selection = new vscode.Selection(k, 0, k, swDoc.lineAt(k).text.length);
      await shoot('q5_written', { lines: (lines2 || []).filter(l => /^§BUMP/.test(l)), files_written_besides_edit: changed, cache_line: swDoc.lineAt(k).text.trim(), cache_line_no: k + 1 });
      // take everything back: the edit, then every file the write touched
      await vscode.window.showTextDocument(doc); await vscode.commands.executeCommand('workbench.action.files.revert').then(() => {}, () => {}); await vscode.commands.executeCommand('workbench.action.closeAllEditors');
      git(['checkout', '--', '.']); await sleep(500);
      log(SEC + 'FILM_RESTORE step=q5 tree_clean=' + J(clean() === '')); }
    // ── passenger: Context for this file, opened beside the code
    { await vscode.commands.executeCommand('workbench.action.closePanel').then(() => {}, () => {}); const { doc } = await open(gate, 1028, 0); await vscode.commands.executeCommand('x0Navigator.contextForFile'); await sleep(2500);
      const clip = await vscode.env.clipboard.readText(), md = vscode.window.visibleTextEditors.filter(e => e.document.languageId === 'markdown' && e.document.getText().startsWith('# Context for'));
      await shoot('passenger', { file: 'viewer/schedule_gate.js', block_lines: clip.split('\n').length, sections: (clip.match(/^## .*/gm) || []), clipboard_equals_doc: md.length === 1 && md[0].document.getText() === clip, first_line: clip.split('\n')[0].replace(TREE, '<bim-ootb>') }); }
    log(SEC + 'FILM_END clean=' + J(clean() === ''));
  } catch (e) { log(SEC + 'FILM_ERROR ' + String(e && e.stack || e).replace(/\n/g, ' | ')); }
  fs.writeFileSync(path.join(OUT, 'done.fix'), 'x');
};
