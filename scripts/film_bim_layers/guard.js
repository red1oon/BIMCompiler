// ⚠ DO NOT REMOVE — film 3 "CH 0 · Immersive Software: a body's history" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 3): §FILM_GUARD. Resolves every fact the narration speaks from the REAL sources (out/facts.json from the real
// pages and the CLI, out/shots.log from the real VS Code, the witness logs copied into out/) and FAILS if one is not as stated, if a shoot step reported an error, if a picture is missing, if a prior-art row's
// text is not found where it says (check P), or if the narration says something the pictures do not show (not-said list). READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process'), N = require('./narr.js'), OUT = path.join(__dirname, 'out');
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8')), SH = fs.readFileSync(path.join(OUT, 'shots.log'), 'utf8');
const shot = name => { const ls = SH.split('\n').filter(l => l.startsWith('§FILM_SHOT name=' + name + ' ')); return ls.length ? ls[ls.length - 1] : ''; };
const shotNum = (l, k) => { const m = new RegExp(' ' + k + '=(\\d+)').exec(l); return m ? m[1] : null; };
const lineOf = at => (/:(\d+)$/.exec(at || '') || [])[1] || null, T = F.targets;
const vc = shot('v_col'), vw = shot('v_wall'), W = F.witness;
const items = (t, n) => (((t.layers || [])[n - 1] || {}).items || []).map(i => i.text);
const top = items(T.col, 3).find(x => /^top /.test(x)) || '', topN = Number((/^top (\S+)/.exec(top) || [])[1]);
const cutsW = items(T.wall, 4).filter(x => / GEOM_CUT /.test(x));
const barW = items(T.bar, 3).find(x => /^w /.test(x)) || '';
const facts = {
  'index.keys': String(F.index.keys), 'index.defaults': String(F.index.defaults), 'page.installed_keys': F.page.installedKeys === F.index.keys && F.page.installedDefaults === F.index.defaults ? String(F.page.installedKeys) : 'N',
  'col.layers': (T.col.layers || []).length === 6 && (T.col.counts || []).length === 6 ? '6' : 'N', 'col.top_m': isFinite(topN) ? topN.toFixed(1) : 'N',
  'col.top_source': (/^top \S+  (\S+)/.exec(top) || [])[1], 'col.default_key': (/  ([a-z_]+\.[a-z_.]+)  modeller\/element_defaults\.json:\d+$/.exec(top) || [])[1],
  'col.key3_opens_row': T.col.keyPressed === '3' && (T.col.opened || [])[0] && /element_defaults\.json:(\d+)$/.test(T.col.opened[0]) && vc.indexOf(JSON.stringify('"column.top_under_beam": {')) >= 0 && lineOf(T.col.opened[0]) === shotNum(vc, 'line') ? 'Y' : 'N',
  'wall.cuts': String(cutsW.length), 'wall.door_gaps': String(cutsW.filter(x => /door-gap:/.test(x)).length), 'wall.holds': String(cutsW.filter(x => /holds #\d+/.test(x)).length),
  'wall.joined': T.wall.guid === F.wallGuid && /\+/.test(T.wall.handle || '') ? 'Y' : 'N',
  'wall.key1_opens_builder': T.wall.keyPressed === '1' && (T.wall.opened || [])[0] === T.wall.link && /dxf2bim_import:wall-line/.test(vw) && lineOf(T.wall.at) === shotNum(vw, 'line') ? 'Y' : 'N',
  'bar.width_default_unrecorded': /^w \S+  default  \(which default is not recorded on the body\)$/.test(barW) ? 'Y' : 'N',
  'bar.key3_opens_nothing': T.bar.keyPressed === '3' && (T.bar.opened || []).length === 0 && !((T.bar.layers || [])[2] || { items: [] }).items.some(i => i.link) ? 'Y' : 'N',
  'witness.not_recorded': String(W.notRecorded), 'witness.linked': String(W.linked) };
let bad = 0; const L = m => console.log('§FILM_GUARD ' + m);
N.beats.forEach(b => (b.says || []).forEach(([k, want, word]) => { const got = facts[k], ok = String(got) === want; if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + b.id + ' says "' + word + '" <- ' + k + ' expected ' + want + ' got ' + got); }));
const must = [
  ['the page tooltip counts are the six layers the hover logged', ['col', 'wall', 'bar'].every(k => T[k].hoverLine.indexOf(' layers=' + T[k].counts.join(',')) > 0)],
  ['every tooltip shown lies inside the page', ['col', 'wall', 'bar'].every(k => T[k].tipInView)],
  ['the lower band (480 px, centred as cards.js centres it) holds the whole tooltip and the cursor', ['col', 'wall', 'bar'].every(k => { const t = T[k], cy = t.tip.y + t.tip.h / 2, y0 = Math.max(0, Math.min(600, Math.round(cy - 240)));
    return t.tip.y >= y0 && t.tip.y + t.tip.h <= y0 + 480 && t.point.y >= y0 && t.point.y <= y0 + 480; })],
  ['every body and every insert traced (CLI)', F.cli.untraced === 0 && F.cli.insertsUntraced === 0],
  ['no page error in any session', F.page.errors.length === 0], ['no shoot step reported an error', !/§FILM_ERROR/.test(SH)],
  ['the memory was measured after a forced GC in both sessions', F.memory.withOverlay.gc && F.memory.without.gc && F.memory.withOverlay.used > 0 && F.memory.without.used > 0],
  ['credentials: MIT licence, the three PRs merged, the paper states its priority date', F.credentials.licence === 'MIT License' && ['pr3043', 'pr3047', 'pr3064'].every(k => /^MERGED/.test(F.credentials[k])) && /^\d{4}-\d\d-\d\d$/.test(F.credentials.paperPriority || '')],
  ['the witness lines quoted are in the logs copied into out/', /VERDICT PASS/.test(W.blVerdict) && /VERDICT PASS/.test(W.dhVerdict) && [W.blVerdict, W.l3, W.l3def, W.l4].every(x => fs.readFileSync(path.join(OUT, 'witness_bim_layers_main.log'), 'utf8').indexOf(x) >= 0) &&
    [W.dhVerdict, W.h2b].every(x => fs.readFileSync(path.join(OUT, 'witness_dxf_hover.log'), 'utf8').indexOf(x) >= 0)],
  ['every picture the cards need exists', ['stills/v_col.png', 'stills/v_wall.png', 'pages/new_converted.png', 'pages/new_col.png', 'pages/new_wall.png', 'pages/new_bar.png'].every(f => fs.existsSync(path.join(OUT, f)))]];
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
[[/\blive\b|real.?time/i, 'the page pictures are taken, not streamed'], [/every user|all users|nobody else/i, 'the claim is only that the shipped Modeller never loads it'], [/faster|speed/i, 'no speed was measured'],
  [/\bedit(s|ed)?\b|\bmoved?\b/i, 'the film makes no edit: layer five is not shown working on the page'], [/\bfirst\b|\bonly tool\b|nobody/i, 'no claim of being first (three quick searches, not a survey)']].forEach(([re, why]) => {
  const hit = re.test(said); if (hit) bad++; L((hit ? 'FAIL ' : 'OK   ') + 'not said: ' + why); });
L('VERDICT ' + (bad ? 'FAIL ' + bad : 'PASS')); process.exit(bad ? 1 : 0);
