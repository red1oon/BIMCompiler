// ⚠ DO NOT REMOVE — film 4 "CH 0 · From an empty folder to a witnessed dev setup" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 4): §FILM_GUARD. Resolves every fact the narration speaks INDEPENDENTLY from the RAW logs
// (out/from_scratch.log, out/pages.log, out/cmd_*.log, out/shots.log), never from facts.json, and FAILS if one is not as stated, if a command exited non-zero, if the editor reported an error or did not restore a file,
// if a picture is missing, if a prior-art row's text is not found where it says (check P), or if the narration says something the pictures do not show (not-said list). READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), N = require('./narr.js'), OUT = path.join(__dirname, 'out');
const R = f => { try { return fs.readFileSync(path.join(OUT, f), 'utf8'); } catch (e) { return ''; } }, g = (t, re, i) => { const m = re.exec(t); return m ? m[i || 1] : null; };
const SC = R('from_scratch.log'), PG = R('pages.log'), SH = R('shots.log'), c = (id, n) => R('cmd_' + id + '_' + n + '.log'), gap = R('cmd_b4_gap.log');
const shot = name => { const ls = SH.split('\n').filter(l => l.startsWith('§FILM_SHOT name=' + name + ' ')); return ls.length ? ls[ls.length - 1] : ''; };
const hov = shot('b2_hover'), b3 = shot('b3_where'), b4 = shot('b4_edit'), b5 = shot('b5_proves');
const sess = g(c('b7', 1), /(§X0_SESSION .*)/) || '', offLine = (/§PAGES offline .*/.exec(PG) || [''])[0], saveLine = (/§PAGES save .*/.exec(PG) || [''])[0], man5 = c('b4', 5);
const yn = x => (x ? 'Y' : 'N'), s4 = p => (new RegExp('§FROM_SCRATCH_S4 page=' + p.replace(/\//g, '\\/') + ' .*').exec(SC) || [''])[0];
const facts = {
  'scratch.files': g(SC, /§FROM_SCRATCH_S2 files=(\d+)/), 'scratch.mb': g(SC, /§FROM_SCRATCH_S2 files=\d+ mb=(\d+)/),
  'scratch.erp_mod_failed': String(+g(s4('erp/idempiere.html'), /http_fail=(\d+)/) + +g(s4('erp/idempiere.html'), /console_errors=(\d+)/) + +g(s4('modeller/modeller.html'), /http_fail=(\d+)/) + +g(s4('modeller/modeller.html'), /console_errors=(\d+)/)),
  'scratch.viewer_online': yn(/outside_hosts=\[[^\]]*objectstorage[^\]]*\]/.test(s4('viewer/viewer.html')) && /1,118\/1,118/.test(s4('viewer/viewer.html'))),
  'offline.saved': yn(/§SAVE_DONE mode=download/.test(saveLine) && +g(saveLine, /bytes=(\d+)/) > 1e6 && /"key": "Control\+s"/.test(R('pages.json'))),
  'offline.blocked_only_counter': yn(/blocked=\{"gc\.zgo\.at":\d+\}/.test(offLine)), 'offline.opened': yn(/text="[^"]*\d,\d+\/\d,\d+/.test(offLine) && /errors=0/.test(offLine)),
  'ext.installed': yn(/successfully installed/i.test(c('b2', 2)) && /§CMD_EXIT 0/.test(c('b2', 2))), 'hover.writes': g(hov, /· (\d+) writes/), 'hover.reads': g(hov, /· (\d+) reads/),
  'x0.where_line': (g(c('b3', 1), /written at viewer\/grid_views\.js:(\d+)/) === g(b3, / line=(\d+)/)) ? g(c('b3', 1), /written at viewer\/grid_views\.js:(\d+)/) : 'N', 'x0.bytes': g(c('b3', 2), /· (\d+) bytes/), 'x0.how': (g(c('b3', 2), /viewer → ([^·]+) ·/) || '').trim(),
  'x0.tag_no_spec': yn(/no spec found/.test(c('b3', 3)) && /not searched: bim-compiler/.test(c('b3', 3))),
  'zip.needs_npm': yn(/Cannot find module '[^']*node_modules\/espree'/.test(gap)), 'zip.needs_git': yn(/not a git repository/.test(gap) && /git ls-files/.test(gap)),
  'manifest.red': g(c('b4', 3), /§MANIFEST_CHECK .* verdict=(\w+)/), 'manifest.red_names_line': yn(/§MANIFEST_FAIL modeller\/modeller\.html:290 /.test(c('b4', 3)) && /node scripts\/gen_manifest\.js --write modeller/.test(c('b4', 3)) && / line=290 /.test(b4) && /arc_editable\.js\?v=99/.test(b4)),
  'manifest.identical': g(man5, /identical=(\d+)\//), 'manifest.deps': g(man5, /deps_declared=(\d+)/),
  'proof.modules': g(c('b5', 1), /modules=(\d+)/), 'proof.proven': g(c('b5', 1), /proven=(\d+)/), 'proof.named_only': g(c('b5', 1), /named_only=(\d+)/), 'proof.unproven': g(c('b5', 1), /unproven=(\d+)/), 'proof.bad_before': g(c('b5', 1), /bad_paths=(\d+)/), 'proof.bad_after': g(c('b5', 3), /bad_paths=(\d+)/),
  'ci.files': (c('b6', 1).split('\n')[1] || '').trim(), 'ci.tier': g(c('b6', 2), /\n(\d+) in the fast tier/), 'ci.excluded': g(c('b6', 2), /, (\d+) excluded/),
  'session.minutes': g(sess, /minutes=(\d+)/), 'session.tokens_out': g(sess, /tokens_out=(\d+)/), 'session.prs': g(sess, /prs=(\d+)/), 'session.load_nothing': yn(/ load=- /.test(sess) && /no change to what users load/.test(c('b7', 1))) };
let bad = 0; const L = m => console.log('§FILM_GUARD ' + m);
N.beats.forEach(b => (b.says || []).forEach(([k, want, word]) => { const got = facts[k], ok = String(got) === want; if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + b.id + ' says "' + word + '" <- ' + k + ' expected ' + want + ' got ' + got); }));
const exits = fs.readdirSync(OUT).filter(f => /^cmd_b\d_\d+\.log$/.test(f)).map(f => [f, g(R(f), /§CMD_EXIT (\d+)/)]);
const pngs = ['b2_hover', 'b3_where', 'b4_edit', 'b5_header', 'b5_proves', 'b6_ci', 'b7_session'].map(n => 'stills/' + n + '.png').concat(['pages/modeller.png', 'pages/erp.png', 'pages/viewer.png', 'pages/offline.png']);
const must = [
  ['the from-scratch witness ran 5/5 and passed', /§FROM_SCRATCH steps_ran=5\/5 gaps=\d+ .* verdict=PASS/.test(SC)], ['the pages run passed (three apps ready, Save Building by Ctrl+S, offline open)', /§PAGES VERDICT PASS/.test(PG)],
  ['every typed command exited 0 (' + exits.length + ' logs)', exits.length >= 17 && exits.every(([f, e]) => e === '0')],
  ['the editor reported no error and X0 was installed from the .vsix', !/§FILM_ERROR/.test(SH) && /§FILM_X0 installed=true active=true/.test(SH)],
  ['the editor hover (installed add-on) names the field, the line and the counts', /\*\*APP\.camera\*\* written at \[viewer\/grid_views\.js:\d+\]/.test(hov)],
  ['the edits shown were undone in the editor and WORK is clean', (SH.match(/§FILM_UNDO name=\S+ restored=true/g) || []).length === 2 && !/§FILM_WS_CHANGED/.test(SH)],
  ['the proof header the editor shows is the line the typed sed inserted', /text="\/\/ PROVES: modeller\/missing_file\.js"/.test(b5) && /sed -i '\/\^\\\/\\\/ PROVES:\/a \/\/ PROVES: modeller\/missing_file\.js'/.test(c('b5', 2))],
  ['the saved building opens offline with the outside host blocked and the OCI host not asked', !/oraclecloud/.test(offLine)],
  ['the session figures come from a transcript named on the command line', /--transcript \$T/.test(c('b7', 1)) && /§X0_SESSION id=/.test(sess)],
  ['every picture the cards need exists', pngs.every(f => fs.existsSync(path.join(OUT, f)))],
  ['credentials: MIT licence line and every PR merged (from facts, read from GitHub at facts time)', (() => { try { const F = JSON.parse(R('facts.json')); return /MIT/.test(F.credentials.licence) && Object.values(F.credentials.prs).every(x => /^MERGED/.test(x)); } catch (e) { return false; } })()]];
must.forEach(([t, ok]) => { if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + t); });
// P prior art: the text must be in the copy fetched into out/prior/ (tags stripped)
const PA = require('./priorart.json'), strip = h => h.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ');
PA.items.forEach(it => { let t = null; try { t = strip(fs.readFileSync(path.join(__dirname, it.where.saved), 'utf8')); } catch (e) { /* missing */ } const ok = t != null && t.indexOf(it.where.text) >= 0; if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + 'prior art "' + it.name + '" <- ' + it.where.saved + (ok ? '' : ' text not found: ' + it.where.text)); });
const said = N.beats.map(b => b.text || '').join(' ');
[[/faster|slower|speed/i, 'no speed was measured'], [/\bfirst\b|\bonly tool\b|nobody/i, 'no claim of being first'], [/every user|all users/i, 'no claim about all users'], [/\bsafe\b|\bsecure\b/i, 'nothing here measures safety']].forEach(([re, why]) => {
  const hit = re.test(said); if (hit) bad++; L((hit ? 'FAIL ' : 'OK   ') + 'not said: ' + why); });
L('VERDICT ' + (bad ? 'FAIL ' + bad : 'PASS')); process.exit(bad ? 1 : 0);
