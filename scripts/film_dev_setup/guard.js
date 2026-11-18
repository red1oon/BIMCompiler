// ⚠ DO NOT REMOVE — film 4 v2 "CH 0 · From an empty folder to a witnessed dev setup" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 4): §FILM_GUARD. Resolves every fact the narration speaks INDEPENDENTLY from the RAW logs
// (out/from_scratch.log, out/cmd_*.log, out/shots.log, and the .vscode/ files of the download), never from facts.json, and FAILS if one is not as stated, if a command exited non-zero, if the editor reported an error or did not restore a
// file, if a picture is missing, if a typed line is not the Developer Guide's line, if a prior-art row's text is not found where it says (check P), or if the narration says something the pictures do not show (not-said list). READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), N = require('./narr.js'), OUT = path.join(__dirname, 'out');
const R = f => { try { return fs.readFileSync(path.join(OUT, f), 'utf8'); } catch (e) { return ''; } }, g = (t, re, i) => { const m = re.exec(t); return m ? m[i || 1] : null; };
const WORK = path.join(os.homedir(), '.cache', 'film_dev_setup2', 'dl', 'bim-ootb-main');
const SC = R('from_scratch.log'), SH = R('shots.log'), c = (id, n) => R('cmd_' + id + '_' + n + '.log');
const shotJ = name => { const ls = SH.split('\n').filter(l => l.startsWith('§FILM_SHOT name=' + name + ' ')); if (!ls.length) return {}; try { return JSON.parse(ls[ls.length - 1].slice(('§FILM_SHOT name=' + name + ' ').length)); } catch (e) { return {}; } };
const jsonc = t => { let o = '', i = 0, str = false; while (i < t.length) { const ch = t[i]; if (str) { o += ch; if (ch === '\\') o += t[++i]; else if (ch === '"') str = false; i++; } else if (ch === '"') { str = true; o += ch; i++; } else if (ch === '/' && t[i + 1] === '/') { while (i < t.length && t[i] !== '\n') i++; } else if (ch === '/' && t[i + 1] === '*') { i += 2; while (i < t.length && !(t[i] === '*' && t[i + 1] === '/')) i++; i += 2; } else { o += ch; i++; } } return JSON.parse(o.replace(/,(\s*[}\]])/g, '$1')); };
const V = f => { try { return jsonc(fs.readFileSync(path.join(WORK, '.vscode', f), 'utf8')); } catch (e) { return null; } };
const tasksJ = (V('tasks.json') || { tasks: [] }).tasks.map(t => t.label), launchJ = ((V('launch.json') || { configurations: [] }).configurations || []).map(x => x.name);
const hov = shotJ('b2_hover'), edit = shotJ('b4_edit'), prv = shotJ('b5_proves'), tsk = shotJ('s_tasks'), snp = shotJ('s_snip'), lch = shotJ('s_launch'), ext = shotJ('s_ext'), vdir = shotJ('s_vscodedir');
const b11 = c('b1', 1), b10 = c('b1', 0), sess = g(c('b7', 1), /(§X0_SESSION .*)/) || '', man3 = c('b4', 3), yn = x => (x ? 'Y' : 'N');
const x0line = g(c('b3', 1), /written at (\S+:\d+)/), hovline = g(hov.hover || '', /written at \[([^\]]+)\]/);
const facts = {
  'fetch.files': g(b10, /§FETCH commit=\w+ files=(\d+)/), 'setup.steps': g(b11, /§SETUP steps=(\d+)/), 'setup.ok': g(b11, /§SETUP steps=\d+ ok=(\d+)/), 'setup.gaps': g(b11, /§SETUP steps=\d+ ok=\d+ gaps=(\d+)/),
  'setup.opened': yn(/§SETUP_OPEN launched=Y/.test(b11) && /§OPEN_STILL geometry=19\d\dx10\d\d\+0\+0 /.test(b11) && /verdict=PASS/.test(b11)),
  'x0.installed_active': yn(/§FILM_X0 installed=true active=true version=\S+ from=setup-extensions-folder/.test(SH) && /§SETUP_VSC .* x0=installed /.test(b11) && /x0-navigator/.test(ext.installed || '') && ext.active === true),
  'tasks.count': (tsk.count === tasksJ.length && tsk.labels && tsk.labels.slice().sort().join('|') === tasksJ.slice().sort().join('|') && +g(b11, /§SETUP_VSC .* tasks=(\d+)/) === tasksJ.length) ? String(tasksJ.length) : 'N',
  'snippet.expanded': yn(/^#!\/usr\/bin\/env node/.test(snp.first_line || '') && snp.lines > 5 && /"prefix": "witness"/.test(fs.existsSync(path.join(WORK, '.vscode/witness.code-snippets')) ? fs.readFileSync(path.join(WORK, '.vscode/witness.code-snippets'), 'utf8') : '')),
  'launch.count': (lch.count === launchJ.length && (lch.targets || []).join('|') === launchJ.join('|')) ? String(launchJ.length) : 'N',
  'vscode_dir.has': yn(['tasks.json', 'launch.json', 'witness.code-snippets', 'extensions.json'].every(f => (vdir.vscode_dir || '').split(',').includes(f))),
  'hover.writes': g(hov.hover || '', /· (\d+) writes/), 'hover.reads': g(hov.hover || '', /· (\d+) reads/),
  'x0.same_line': yn(x0line && x0line === hovline && g(c('b3', 1), /· (\d+) writes/) === g(hov.hover || '', /· (\d+) writes/) && g(c('b3', 1), /· (\d+) reads/) === g(hov.hover || '', /· (\d+) reads/)),
  'manifest.red': g(c('b4', 1), /§MANIFEST_CHECK .* verdict=(\w+)/), 'manifest.red_names_line': yn(new RegExp('§MANIFEST_FAIL modeller/modeller\\.html:' + edit.line + ' ').test(c('b4', 1)) && /node scripts\/gen_manifest\.js --write modeller/.test(c('b4', 1)) && /arc_editable\.js\?v=99/.test(edit.text || '')),
  'manifest.green': g(man3, /§MANIFEST_CHECK .* verdict=(\w+)/), 'manifest.identical': g(man3, /identical=(\d+)\//), 'manifest.deps': g(man3, /deps_declared=(\d+)/),
  'proof.modules': g(c('b5', 1), /modules=(\d+)/), 'proof.proven': g(c('b5', 1), /proven=(\d+)/), 'proof.named_only': g(c('b5', 1), /named_only=(\d+)/), 'proof.unproven': g(c('b5', 1), /unproven=(\d+)/), 'proof.bad_before': g(c('b5', 1), /bad_paths=(\d+)/), 'proof.bad_after': g(c('b5', 3), /bad_paths=(\d+)/),
  'session.minutes': g(sess, /minutes=(\d+)/), 'session.tokens_out': g(sess, /tokens_out=(\d+)/), 'session.prs': g(sess, /prs=(\d+)/), 'session.load_nothing': yn(/ load=- /.test(sess + ' ') && /no change to what users load/.test(c('b7', 1))) };
let bad = 0; const L = m => console.log('§FILM_GUARD ' + m);
N.beats.forEach(b => (b.says || []).forEach(([k, want, word]) => { const got = facts[k], ok = String(got) === want; if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + b.id + ' says "' + word + '" <- ' + k + ' expected ' + want + ' got ' + got); }));
const exits = fs.readdirSync(OUT).filter(f => /^cmd_[a-z0-9]+_\d+\.log$/.test(f)).map(f => [f, g(R(f), /§CMD_EXIT (\d+)/)]);
const pngs = ['s_open', 's_vscodedir', 's_ext', 's_tasks', 's_snip_suggest', 's_snip', 's_launch', 'b2_hover', 'b4_edit', 'b5_header', 'b5_proves', 'b7_session'].map(n => 'stills/' + n + '.png');
const guide = (() => { try { return fs.readFileSync(path.join(__dirname, '..', '..', 'docs', 'DeveloperGuide.md'), 'utf8'); } catch (e) { return ''; } })();
const F = (() => { try { return JSON.parse(R('facts.json')); } catch (e) { return null; } })();
const must = [
  ['the from-scratch witness ran 5/5, passed, and its setup step passed (the named gaps are its)', /§FROM_SCRATCH steps_ran=5\/5 gaps=\d+ .* verdict=PASS/.test(SC) && /§FROM_SCRATCH_S5_SETUP exit=0 §SETUP steps=4 ok=4 gaps=0 verdict=PASS/.test(SC)],
  ['the fetch was the real tarball: a 40-hex commit read from its own header, more than a thousand files', /§FETCH commit=[0-9a-f]{40} files=\d{4,} /.test(b10) && /§CMD_EXIT 0/.test(b10)],
  ['the editor opened on the download with the arguments setup.js printed (§SETUP_NEXT), and the commit is the fetched one', /§FILM_TREE work=\S+ commit=([0-9a-f]{8}) setup_next_args_match=Y/.test(SH) && F && SH.indexOf('commit=' + F.fetch.commit.slice(0, 8)) >= 0],
  ['every typed command exited 0 (' + exits.length + ' logs)', exits.length >= 12 && exits.every(([f, e]) => e === '0')],
  ['the typed lines are the Developer Guide\'s own lines (step 0 and setup.js --open)', F && guide.indexOf(F.fetch.typed.split(' && ')[0]) >= 0 && guide.indexOf('node scripts/setup.js --open') >= 0],
  ['the editor reported no error', !/§FILM_ERROR/.test(SH)],
  ['the editor hover (the add-on installed by setup.js) names the field, the line and the counts', /\*\*APP\.camera\*\* written at \[viewer\/grid_views\.js:\d+\]/.test(hov.hover || '')],
  ['the edits shown were undone in the editor and the download hashes the same before and after the driver ran', (SH.match(/§FILM_UNDO name=\S+ restored=true/g) || []).length === 2 && (() => { const a = g(SH, /§FILM_WS_HASH before (\w+)/), z = g(SH, /§FILM_WS_HASH after (\w+)/); return !!a && a === z; })()],
  ['the version the editor shows is exactly what the typed sed made', (() => { const sed = c('b4', 0), m = /\$ sed -i 's\/([^/]+)\/([^/]+)\//.exec(sed); return !!m && edit.before && edit.before.replace(new RegExp(m[1].replace(/\?/g, '\\?')), m[2]) === edit.text; })()],
  ['the proof header the editor shows is the line the typed sed inserted', prv.text === '// PROVES: modeller/missing_file.js' && /sed -i '\/\^\\\/\\\/ PROVES:\/a \/\/ PROVES: modeller\/missing_file\.js'/.test(c('b5', 2))],
  ['the session figures come from a transcript named on the command line', /--transcript \$T/.test(c('b7', 1)) && /§X0_SESSION id=/.test(sess)],
  ['the last card\'s CI figures are counts from the download (witness files, fast tier, excluded)', +(c('close', 1).split('\n')[1] || 0) > 100 && /\d+ in the fast tier, \d+ excluded/.test(c('close', 2))],
  ['setup.js wrote exactly one file outside .setup/ and node_modules/: the packed add-on (the tree grew by one, and that file is the .vsix)', !!F && F.ws_after_setup.files === F.fetch.files + 1 && fs.existsSync(path.join(WORK, 'devtools/vscode/dist/x0-navigator-0.1.0.vsix'))],
  ['every picture the cards need exists', pngs.every(f => fs.existsSync(path.join(OUT, f)))],
  ['credentials: MIT licence line and every PR merged (from facts, read from GitHub at facts time)', !!F && /MIT/.test(F.credentials.licence) && Object.values(F.credentials.prs).every(x => /^MERGED/.test(x))]];
must.forEach(([t, ok]) => { if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + t); });
// P prior art: the text must be in the copy fetched into out/prior/ (tags stripped)
const PA = require('./priorart.json'), strip = h => h.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ');
PA.items.forEach(it => { let t = null; try { t = strip(fs.readFileSync(path.join(__dirname, it.where.saved), 'utf8')); } catch (e) { /* missing */ } const ok = t != null && t.indexOf(it.where.text) >= 0; if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + 'prior art "' + it.name + '" <- ' + it.where.saved + (ok ? '' : ' text not found: ' + it.where.text)); });
const said = N.beats.map(b => b.text || '').join(' ');
[[/faster|slower|speed/i, 'no speed was measured'], [/\bfirst\b|\bonly tool\b|nobody/i, 'no claim of being first'], [/every user|all users/i, 'no claim about all users'], [/\bsafe\b|\bsecure\b/i, 'nothing here measures safety']].forEach(([re, why]) => {
  const hit = re.test(said); if (hit) bad++; L((hit ? 'FAIL ' : 'OK   ') + 'not said: ' + why); });
L('VERDICT ' + (bad ? 'FAIL ' + bad : 'PASS')); process.exit(bad ? 1 : 0);
