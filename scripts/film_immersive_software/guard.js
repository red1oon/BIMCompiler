// ⚠ DO NOT REMOVE — film "CH 0 · Immersive Software" (prompts/FILM_IMMERSIVE_SOFTWARE.md): §FILM_GUARD. Resolves every fact the narration speaks from the REAL sources (out/facts.json from the real
// pages and the CLI, out/shots.log from the real VS Code, the witness logs copied into out/) and FAILS if one is not as stated, if a shoot step reported an error, if a picture is missing, if a prior-art row's
// text is not found where it says (check P), or if the narration says something the pictures do not show (not-said list). READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process'), N = require('./narr.js'), OUT = path.join(__dirname, 'out');
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8')), SH = fs.readFileSync(path.join(OUT, 'shots.log'), 'utf8');
const shot = name => { const ls = SH.split('\n').filter(l => l.startsWith('§FILM_SHOT name=' + name + ' ')); return ls.length ? ls[ls.length - 1] : ''; };
const shotNum = (l, k) => { const m = new RegExp(' ' + k + '=(\\d+)').exec(l); return m ? m[1] : null; };
const lineOf = at => (/:(\d+)$/.exec(at || '') || [])[1] || null, T = F.targets;
const vb = shot('v_bar'), vw = shot('v_wall');
const facts = {
  'index.keys': String(F.index.keys), 'page.installed_keys': String(F.page.installedKeys),
  'bar.line': lineOf(T.bar.at) === shotNum(vb, 'line') ? lineOf(T.bar.at) : 'N', 'bar.prov': T.bar.prov, 'truss.stations': String(F.cli.truss.stations),
  'bar.v_link_matches': (T.bar.vOpened || [])[0] === T.bar.link && vb.indexOf(JSON.stringify(T.bar.link)) >= 0 ? 'Y' : 'N',
  'wall.first_run_failed': F.firstRun.failedH2 && F.firstRun.wrongWall ? 'Y' : 'N', 'wall.old_unstamped': T.wallOld && T.wallOld.unstamped && !T.wallOld.key ? 'Y' : 'N',
  'bodies': String(F.cli.bodies), 'inserts': F.cli.inserts === F.page.inserts ? String(F.cli.inserts) : 'N',
  'wall.line': lineOf(T.wall.at) === shotNum(vw, 'line') && (T.wall.vOpened || [])[0] === T.wall.link ? lineOf(T.wall.at) : 'N' };
let bad = 0; const L = m => console.log('§FILM_GUARD ' + m);
N.beats.forEach(b => (b.says || []).forEach(([k, want, word]) => { const got = facts[k], ok = String(got) === want; if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + b.id + ' says "' + word + '" <- ' + k + ' expected ' + want + ' got ' + got); }));
const must = [
  ['the bar line in VS Code is the stamp the tooltip named', /D\.P\.trace\(\\?'dxf2section:bar/.test(vb) || /dxf2section:bar/.test(vb)],
  ['the wall line in VS Code is the wall-line stamp', /dxf2bim_import:wall-line/.test(vw)],
  ['every body and every insert traced (CLI)', F.cli.untraced === 0 && F.cli.insertsUntraced === 0],
  ['the OLD tree is main minus the one stamp (commit +edit)', /\+edit$/.test(F.commits.old) && F.commits.old.replace('+edit', '') === F.commits.new],
  ['no page error in any session', F.page.errors.length === 0], ['no shoot step reported an error', !/§FILM_ERROR/.test(SH)],
  ['the memory was measured after a forced GC in both sessions', F.memory.withOverlay.gc && F.memory.without.gc && F.memory.withOverlay.used > 0 && F.memory.without.used > 0],
  ['credentials: MIT licence, both PRs merged, the paper states its priority date', F.credentials.licence === 'MIT License' && /^MERGED/.test(F.credentials.pr3043) && /^MERGED/.test(F.credentials.pr3047) && /^\d{4}-\d\d-\d\d$/.test(F.credentials.paperPriority || '')],
  ['the witness lines on the card are PASS lines from the logs copied into out/', /VERDICT PASS/.test(F.mainVerdicts.hover) && /VERDICT PASS/.test(F.mainVerdicts.trace) &&
    fs.readFileSync(path.join(OUT, 'witness_hover_main.log'), 'utf8').indexOf(F.mainVerdicts.hover) >= 0 && fs.readFileSync(path.join(OUT, 'witness_trace_main.log'), 'utf8').indexOf(F.mainVerdicts.trace) >= 0],
  ['every picture the cards need exists', ['stills/v_bar.png', 'stills/v_wall.png', 'pages/new_converted.png', 'pages/new_bar.png', 'pages/new_wall.png', 'pages/old_wall.png'].every(f => fs.existsSync(path.join(OUT, f)))]];
must.forEach(([t, ok]) => { if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + t); });
// P prior art: a repo row = the text ON the cited line (git show of origin/main); a web row = the text inside the copy fetched into out/prior/ (tags stripped)
const PA = require('./priorart.json');
const readWhere = w => { try {
  if (w.saved) { let s = fs.readFileSync(path.join(__dirname, w.saved), 'utf8'); if (/\.html?$/.test(w.saved)) s = s.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' '); return s; }
  const root = w.repo === 'bim-ootb' ? path.join(os.homedir(), 'bim-ootb') : path.join(__dirname, '..', '..'), ref = w.repo === 'bim-ootb' ? 'origin/main' : 'origin/master';
  return cp.execFileSync('git', ['-C', root, 'show', ref + ':' + w.path], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n')[w.line - 1]; } catch (e) { return null; } };
PA.items.forEach(it => { const t = readWhere(it.where), ok = t != null && t.indexOf(it.where.text) >= 0; if (!ok) bad++;
  L((ok ? 'OK   ' : 'FAIL ') + 'prior art "' + it.name + '" <- ' + (it.where.saved || it.where.repo + ':' + it.where.path + ':' + it.where.line) + (ok ? '' : ' text not found: ' + it.where.text)); });
// not-said: the film must not claim what the pictures do not show
const said = N.beats.map(b => b.text || '').join(' ');
[[/\blive\b|real.?time/i, 'the page pictures are taken, not streamed'], [/every user|all users|nobody else/i, 'the claim is only that the shipped Modeller never loads it'], [/faster|speed/i, 'no speed was measured']].forEach(([re, why]) => {
  const hit = re.test(said); if (hit) bad++; L((hit ? 'FAIL ' : 'OK   ') + 'not said: ' + why); });
L('VERDICT ' + (bad ? 'FAIL ' + bad : 'PASS')); process.exit(bad ? 1 : 0);
