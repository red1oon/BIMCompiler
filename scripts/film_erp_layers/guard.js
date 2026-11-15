// ⚠ DO NOT REMOVE — film 2 "CH 0 · Immersive Software: the ERP field" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 2): §FILM_GUARD. Resolves every fact the narration speaks from the REAL sources
// (out/facts.json from the real pages and the witness logs, out/shots.log from the real VS Code) and FAILS if one is not as stated, if a picture is missing, if a prior-art row's text is not found where
// it says (check P), or if the narration says something the pictures do not show (not-said list). READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), N = require('./narr.js'), OUT = path.join(__dirname, process.env.OUTD || 'out');
const F = JSON.parse(fs.readFileSync(path.join(OUT, 'facts.json'), 'utf8')), SH = fs.readFileSync(path.join(OUT, 'shots.log'), 'utf8');
const shot = name => { const ls = SH.split('\n').filter(l => l.startsWith('§FILM_SHOT name=' + name + ' ')); return ls.length ? ls[ls.length - 1] : ''; };
const lineOf = at => (/:(\d+)$/.exec(at || '') || [])[1] || null, vd = shot('v_doctype'), vt = shot('v_date'), cb = F.doctype.callout || {};
const facts = {
  'index.entries': String(F.index.entries), 'doctype.layers': String(F.doctype.layers),
  'doctype.callout_line': lineOf(cb.at) && new RegExp(' line=' + lineOf(cb.at) + ' ').test(vd) ? lineOf(cb.at) : 'N', 'doctype.callout_legacy': cb.legacy,
  'doctype.alt1_opens_callout': F.doctype.alt1OpensCallout && /prototype\.docType/.test(vd) ? 'Y' : 'N',
  'red.false_unported': String(F.red.falseUnported), 'fix.false_unported': String(F.fix.falseUnported),
  'old.dateacct_unported': F.dateOld.unported ? 'Y' : 'N', 'new.dateacct_line_found': F.dateNew.alt1Opens && /prototype\.dateAcct/.test(vt) ? 'Y' : 'N',
  'fix.unported': String(F.fix.unported), 'fix.fields': String(F.fix.fields) };
let bad = 0; const L = m => console.log('§FILM_GUARD ' + m);
N.beats.forEach(b => (b.says || []).forEach(([k, want, word]) => { const got = facts[k], ok = String(got) === want; if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + b.id + ' says "' + word + '" <- ' + k + ' expected ' + want + ' got ' + got); }));
const must = [['the red run FAILED E2b and the run on main PASSED', F.red.failed && /VERDICT PASS/.test(F.fix.verdict)],
  ['the logs the cards quote are copied into out/', fs.readFileSync(path.join(OUT, 'witness_red_run.log'), 'utf8').indexOf(F.red.line) >= 0 && fs.readFileSync(path.join(OUT, 'witness_main.log'), 'utf8').indexOf(F.fix.e2line) >= 0],
  ['every key the tooltip showed on main opened its line (E4 wrong_or_dead=0)', /wrong_or_dead=0$/.test(F.fix.keys)],
  ['credentials: MIT licence, every PR merged, the paper states its priority date', F.credentials.licence === 'MIT License' && F.credentials.prs.length > 0 && F.credentials.prs.every(p => /^MERGED/.test(p.state)) && /^\d{4}-\d\d-\d\d$/.test(F.credentials.paperPriority || '')],
  ['no shoot step reported an error', !/§FILM_ERROR/.test(SH)], ['memory measured after a forced GC in both sessions', F.memory.withOverlay.gc && F.memory.without.gc],
  ['every picture exists', ['stills/v_doctype.png', 'stills/v_date.png', F.doctype.png, F.dateNew.png, F.dateOld.png].every(f => fs.existsSync(path.join(OUT, f)))]];
must.forEach(([t, ok]) => { if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + t); });
const PA = require('./priorart.json');
const readWhere = w => { try { if (w.saved) { let s = fs.readFileSync(path.join(__dirname, w.saved), 'utf8'); if (/\.html?$/.test(w.saved)) s = s.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' '); return s; }
  return fs.readFileSync(w.file.replace(/^~/, os.homedir()), 'utf8').split('\n')[w.line - 1]; } catch (e) { return null; } };
PA.items.forEach(it => { const t = readWhere(it.where), ok = t != null && t.indexOf(it.where.text) >= 0; if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + 'prior art "' + it.name + '" <- ' + (it.where.saved || it.where.file + ':' + it.where.line) + (ok ? '' : ' text not found: ' + it.where.text)); });
const said = N.beats.map(b => b.text || '').join(' ');
[[/\blive\b|real.?time|实时|直播/i, 'the page pictures are taken, not streamed'], [/every user|all users|nobody else|所有用户|每个用户/i, 'the claim is only that the shipped ERP never loads it'], [/faster|speed|更快|速度/i, 'no speed was measured']].forEach(([re, why]) => {
  const hit = re.test(said); if (hit) bad++; L((hit ? 'FAIL ' : 'OK   ') + 'not said: ' + why); });
L('VERDICT ' + (bad ? 'FAIL ' + bad : 'PASS')); process.exit(bad ? 1 : 0);
