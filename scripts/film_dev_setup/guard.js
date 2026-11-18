// ⚠ DO NOT REMOVE — film 4 v4 "CH 0 · From an empty folder to a witnessed dev setup" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 4, SCRIPT v4): §FILM_GUARD. Resolves every fact the narration speaks INDEPENDENTLY from the RAW logs
// (out/from_scratch.log, out/cmd_*.log, out/shots.log, out/pointer.json, and the .vscode/ files of the download), never from facts.json, and FAILS if one is not as stated, if a command exited non-zero, if the editor reported an error or did
// not restore a file, if a picture is missing, if a typed line is not the Developer Guide's line, if a prior-art row's text is not found where it says (check P), or if the narration says something the pictures do not show (not-said list).
// v4 checks: D = every term is defined in the beat the script says, before any later beat uses it, and once · C = the three cues' constants are the legend's (cards.log §CUE_CONST/§CUE_CHECK) · P1..P5 = the pointer and the amber number (see below).
// Run AFTER shoot.sh + pointer.py + cards.js (build.sh orders them). READ out/guard.log.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process'), N = require('./narr.js'), OUT = path.join(__dirname, 'out');
const R = f => { try { return fs.readFileSync(path.join(OUT, f), 'utf8'); } catch (e) { return ''; } }, g = (t, re, i) => { const m = re.exec(t); return m ? m[i || 1] : null; };
const WORK = path.join(os.homedir(), '.cache', 'film_dev_setup4', 'dl', 'bim-ootb-main'), SESSION = process.env.SESSION === '1';
const SC = R('from_scratch.log'), SH = R('shots.log'), c = (id, n) => R('cmd_' + id + '_' + n + '.log');
const shotJ = name => { const ls = SH.split('\n').filter(l => l.startsWith('§FILM_SHOT name=' + name + ' ')); if (!ls.length) return {}; try { return JSON.parse(ls[ls.length - 1].slice(('§FILM_SHOT name=' + name + ' ').length)); } catch (e) { return {}; } };
const jsonc = t => { let o = '', i = 0, str = false; while (i < t.length) { const ch = t[i]; if (str) { o += ch; if (ch === '\\') o += t[++i]; else if (ch === '"') str = false; i++; } else if (ch === '"') { str = true; o += ch; i++; } else if (ch === '/' && t[i + 1] === '/') { while (i < t.length && t[i] !== '\n') i++; } else if (ch === '/' && t[i + 1] === '*') { i += 2; while (i < t.length && !(t[i] === '*' && t[i + 1] === '/')) i++; i += 2; } else { o += ch; i++; } } return JSON.parse(o.replace(/,(\s*[}\]])/g, '$1')); };
const V = f => { try { return jsonc(fs.readFileSync(path.join(WORK, '.vscode', f), 'utf8')); } catch (e) { return null; } };
const tasksJ = (V('tasks.json') || { tasks: [] }).tasks.map(t => t.label), launchJ = ((V('launch.json') || { configurations: [] }).configurations || []).map(x => x.name);
const hov = shotJ('h_hover'), hsel = shotJ('h_sel'), hpre = shotJ('h_pre'), edit = shotJ('b6_edit'), prv = shotJ('b7_proves'), tsk = shotJ('s_tasks'), snp = shotJ('s_snip'), lch = shotJ('s_launch'), ext = shotJ('s_ext'), vdir = shotJ('s_vscodedir');
const b11 = c('b1', 1), b10 = c('b1', 0), sess = g(c('b8', 1), /(§CODEFACTS_SESSION .*)/) || '', man3 = c('b6', 3), yn = x => (x ? 'Y' : 'N');
const cfline = g(c('b5', 1), /written at (\S+:\d+)/), hovline = g(hov.hover || '', /written at \[([^\]]+)\]/);
let PJ = null; try { PJ = JSON.parse(R('pointer.json')); } catch (e) { /* the pointer checks fail */ } let PP = null; try { PP = JSON.parse(R('pointer_plan.json')); } catch (e) { /* the pointer checks fail */ }
const facts = {
  'fetch.files': g(b10, /§FETCH commit=\w+ files=(\d+)/), 'setup.steps': g(b11, /§SETUP steps=(\d+)/), 'setup.ok': g(b11, /§SETUP steps=\d+ ok=(\d+)/), 'setup.gaps': g(b11, /§SETUP steps=\d+ ok=\d+ gaps=(\d+)/),
  'setup.opened': yn(/§SETUP_OPEN launched=Y/.test(b11) && /§OPEN_STILL geometry=19\d\dx10\d\d\+0\+0 /.test(b11) && /verdict=PASS/.test(b11)),
  'cf.installed_active': yn(/§FILM_CODEFACTS installed=true active=true version=\S+ from=setup-extensions-folder/.test(SH) && /§SETUP_VSC .* codefacts=installed /.test(b11) && /code-facts/.test(ext.installed || '') && ext.active === true),
  'cf.command_runs': yn(/§CMD_EXIT 0/.test(c('b5', 1)) && /^APP\.camera is written at /m.test(c('b5', 1).split('\n').slice(1).join('\n'))),
  'tasks.count': (tsk.count === tasksJ.length && tsk.labels && tsk.labels.slice().sort().join('|') === tasksJ.slice().sort().join('|') && +g(b11, /§SETUP_VSC .* tasks=(\d+)/) === tasksJ.length) ? String(tasksJ.length) : 'N',
  'snippet.expanded': yn(/^#!\/usr\/bin\/env node/.test(snp.first_line || '') && snp.lines > 5 && /"prefix": "witness"/.test(fs.existsSync(path.join(WORK, '.vscode/witness.code-snippets')) ? fs.readFileSync(path.join(WORK, '.vscode/witness.code-snippets'), 'utf8') : '')),
  'launch.count': (lch.count === launchJ.length && (lch.targets || []).join('|') === launchJ.join('|')) ? String(launchJ.length) : 'N',
  'vscode_dir.has': yn(['tasks.json', 'launch.json', 'witness.code-snippets', 'extensions.json'].every(f => (vdir.vscode_dir || '').split(',').includes(f))),
  'hover.writes': g(hov.hover || '', /· (\d+) writes/), 'hover.reads': g(hov.hover || '', /· (\d+) reads/),
  'cf.same_line': yn(cfline && cfline === hovline && g(c('b5', 1), /· (\d+) writes/) === g(hov.hover || '', /· (\d+) writes/) && g(c('b5', 1), /· (\d+) reads/) === g(hov.hover || '', /· (\d+) reads/)),
  'pointer.on_token': yn(PJ && PJ.target && hsel.sel_text === 'A.camera' && hsel.token === 'A.camera' && hsel.line === +g(cfline || '', /:(\d+)$/) && PJ.target.h >= 10 && PJ.target.h <= 40 && PJ.target.w / 8 >= 4 && PJ.target.w / 8 <= 16),
  'manifest.red': g(c('b6', 1), /§MANIFEST_CHECK .* verdict=(\w+)/), 'manifest.red_names_line': yn(new RegExp('§MANIFEST_FAIL modeller/modeller\\.html:' + edit.line + ' ').test(c('b6', 1)) && /node scripts\/gen_manifest\.js --write modeller/.test(c('b6', 1)) && /arc_editable\.js\?v=99/.test(edit.text || '')),
  'manifest.green': g(man3, /§MANIFEST_CHECK .* verdict=(\w+)/), 'manifest.identical': g(man3, /identical=(\d+)\//), 'manifest.deps': g(man3, /deps_declared=(\d+)/),
  'proof.modules': g(c('b7', 1), /modules=(\d+)/), 'proof.proven': g(c('b7', 1), /proven=(\d+)/), 'proof.named_only': g(c('b7', 1), /named_only=(\d+)/), 'proof.unproven': g(c('b7', 1), /unproven=(\d+)/), 'proof.bad_before': g(c('b7', 1), /bad_paths=(\d+)/), 'proof.bad_after': g(c('b7', 3), /bad_paths=(\d+)/),
  'session.minutes': g(sess, /minutes=(\d+)/), 'session.tokens_out': g(sess, /tokens_out=(\d+)/), 'session.prs': g(sess, /prs=(\d+)/) };
let bad = 0; const L = m => console.log('§FILM_GUARD ' + m);
N.beats.forEach(b => (b.says || []).forEach(([k, want, word]) => { const got = facts[k], ok = String(got) === want; if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + b.id + ' says "' + word + '" <- ' + k + ' expected ' + want + ' got ' + got); }));
const exits = fs.readdirSync(OUT).filter(f => /^cmd_[a-z0-9]+_\d+\.log$/.test(f)).map(f => [f, g(R(f), /§CMD_EXIT (\d+)/)]);
const pngs = ['s_open', 's_vscodedir', 's_ext', 's_tasks', 's_snip_suggest', 's_snip', 's_launch', 'h_pre', 'h_sel', 'h_hover', 'b6_edit', 'b7_header', 'b7_proves'].concat(SESSION ? ['b8_session'] : []).map(n => 'stills/' + n + '.png');
const guide = (() => { try { return fs.readFileSync(path.join(__dirname, '..', '..', 'docs', 'DeveloperGuide.md'), 'utf8'); } catch (e) { return ''; } })();
const F = (() => { try { return JSON.parse(R('facts.json')); } catch (e) { return null; } })();
const must = [
  ['the from-scratch witness ran 5/5, passed, and its setup step passed (the named gaps are its)', /§FROM_SCRATCH steps_ran=5\/5 gaps=\d+ .* verdict=PASS/.test(SC) && /§FROM_SCRATCH_S5_SETUP exit=0 §SETUP steps=4 ok=4 gaps=0 verdict=PASS/.test(SC)],
  ['the fetch was the real tarball: a 40-hex commit read from its own header, more than a thousand files', /§FETCH commit=[0-9a-f]{40} files=\d{4,} /.test(b10) && /§CMD_EXIT 0/.test(b10)],
  ['the editor opened on the download with the arguments setup.js printed (§SETUP_NEXT), and the commit is the fetched one', /§FILM_TREE work=\S+ commit=([0-9a-f]{8}) setup_next_args_match=Y/.test(SH) && F && SH.indexOf('commit=' + F.fetch.commit.slice(0, 8)) >= 0],
  ['every typed command exited 0 (' + exits.length + ' logs)', exits.length >= 11 && exits.every(([f, e]) => e === '0')],
  ['the typed lines are the Developer Guide\'s own lines (step 0 and setup.js --open)', F && guide.indexOf(F.fetch.typed.split(' && ')[0]) >= 0 && guide.indexOf('node scripts/setup.js --open') >= 0],
  ['the editor reported no error', !/§FILM_ERROR/.test(SH)],
  ['the editor hover (the add-on installed by setup.js) names the field, the line and the counts', /\*\*APP\.camera\*\* (is )?written at \[viewer\/grid_views\.js:\d+\]/.test(hov.hover || '')],
  ['the edits shown were undone in the editor and the download hashes the same before and after the driver ran', (SH.match(/§FILM_UNDO name=\S+ restored=true/g) || []).length === 2 && (() => { const a = g(SH, /§FILM_WS_HASH before (\w+)/), z = g(SH, /§FILM_WS_HASH after (\w+)/); return !!a && a === z; })()],
  ['the version the editor shows is exactly what the typed sed made', (() => { const sed = c('b6', 0), m = /\$ sed -i 's\/([^/]+)\/([^/]+)\//.exec(sed); return !!m && edit.before && edit.before.replace(new RegExp(m[1].replace(/\?/g, '\\?')), m[2]) === edit.text; })()],
  ['the proof header the editor shows is the line the typed sed inserted', prv.text === '// PROVES: modeller/missing_file.js' && /sed -i '\/\^\\\/\\\/ PROVES:\/a \/\/ PROVES: modeller\/missing_file\.js'/.test(c('b7', 2))],
  ['the last card\'s CI figures are counts from the download (witness files, fast tier, excluded)', +(c('close', 1).split('\n')[1] || 0) > 100 && /\d+ in the fast tier, \d+ excluded/.test(c('close', 2))],
  ['setup.js wrote exactly one file outside .setup/ and node_modules/: the packed add-on (the tree grew by one, and that file is the .vsix)', !!F && F.ws_after_setup.files === F.fetch.files + 1 && fs.existsSync(path.join(WORK, 'devtools/vscode/dist/code-facts-0.1.0.vsix'))],
  ['every picture the cards need exists', pngs.every(f => fs.existsSync(path.join(OUT, f)))],
  ['credentials: MIT licence line and every PR merged (from facts, read from GitHub at facts time)', !!F && /MIT/.test(F.credentials.licence) && Object.values(F.credentials.prs).every(x => /^MERGED/.test(x))]];
if (SESSION) must.push(['the session figures come from a transcript named on the command line', /--transcript \$T/.test(c('b8', 1)) && /§CODEFACTS_SESSION id=/.test(sess)]);
must.forEach(([t, ok]) => { if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + t); });
// ---- D: terms are defined where the script says, once, before any later beat uses them (first textual occurrence = the defining beat)
{ const TERMS = { 'setup script': /\bscript\b/i, 'Code Facts': /Code Facts/, 'hover': /\bhover\b/i, 'manifest': /\bmanifest\b/i, 'version stamp': /\bstamp\b/i, 'bump': /\bbump\b/i, 'witness': /\bwitness\b/i };
  const textOf = b => (b.text || ''), seen = {}, order = N.beats.filter(b => b.text); let dBad = 0;
  order.forEach(b => { (b.defines || []).forEach(t => { if (seen[t]) { dBad++; L('FAIL D term "' + t + '" defined twice (' + seen[t] + ', ' + b.id + ')'); } else seen[t] = b.id; });
    (b.uses || []).forEach(t => { if (!seen[t]) { dBad++; L('FAIL D beat ' + b.id + ' uses "' + t + '" before any beat defines it'); } }); });
  Object.keys(TERMS).forEach(t => { const first = order.find(b => TERMS[t].test(textOf(b))); const def = Object.keys(seen).includes(t) ? seen[t] : null; if (!def) return; if (!first || first.id !== def) { dBad++; L('FAIL D "' + t + '": first spoken in ' + (first && first.id) + ', defined in ' + def); } });
  const missingF = order.filter((b, i) => !/^F: [^|]*\? \| M: /.test(b.text)); missingF.forEach(b => { dBad++; L('FAIL F1 beat ' + b.id + ' does not open with an F question'); });
  if (!dBad) L('OK   D every term is defined in its own beat before it is used (' + Object.keys(seen).length + ' terms: ' + Object.keys(seen).map(t => t + '@' + seen[t]).join(', ') + '); F1 every beat opens with its F question (' + order.length + ')'); bad += dBad; }
// ---- C: the three cues are the legend's (the cards' own §CUE_* lines; the constants are repeated here ON PURPOSE, an independent copy)
{ const CL = R('cards.log'), ccon = g(CL, /(§CUE_CONST .*)/), cck = g(CL, /§CUE_CHECK .* bad=(\d+)/), ef = +g(CL, /§CUE_CHECK .* editor_frames=(\d+)/), tf = +g(CL, /§CUE_CHECK .* terminal_frames=(\d+)/);
  const want = '§CUE_CONST editor=#38bdf8/IN VS CODE terminal=#4ade80/IN THE TERMINAL answer=#fbbf24 steps=' + (SESSION ? 7 : 6), ok = ccon === want && cck === '0' && ef > 0 && tf > 0;
  if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + 'C the cues: constants as the legend, every frame\'s tags match them (bad=' + cck + ', editor frames ' + ef + ', terminal frames ' + tf + ') ' + (ccon === want ? '' : 'got ' + ccon)); }
// ---- P1..P5: the pointer and the amber number
{ const PL = JSON.parse(R('cards/plan.json') || '{}'), b4 = PL.b4 || [], kinds = b4.map(e => e.kind); let okAll = true; const chk = (name, ok, why) => { if (!ok) { bad++; okAll = false; } L((ok ? 'OK   ' : 'FAIL ') + name + (why ? ' ' + why : '')); };
  // P1: the pointer's last frame ends inside the token's rectangle (±2 px), and the rectangle is the one pointer.py derives from the stills (re-run here, compared)
  let rerun = null; try { const r = cp.spawnSync('python3', [path.join(__dirname, 'pointer.py')], { encoding: 'utf8' }); rerun = JSON.parse(R('pointer.json')); R('x'); chk('P1a pointer.py re-run exits 0 (deterministic)', r.status === 0, r.stdout.split('\n')[0].slice(0, 160)); } catch (e) { chk('P1a pointer.py re-run', false, String(e)); }
  const T = PJ && PJ.target, sc = PP && PP.scale, top = PP && PP.band_top, strip = PP && PP.strip;
  const rect = T && { x0: T.x * sc, y0: strip + T.y * sc - top, x1: (T.x + T.w) * sc, y1: strip + (T.y + T.h) * sc - top }, lastMove = PP && PP.frames.filter(f => f.kind === 'move').slice(-1)[0];
  chk('P1b the token rectangle is the re-derived one (same pixels)', !!T && !!rerun && JSON.stringify(rerun.target) === JSON.stringify(T) && JSON.stringify(PP.target_still) === JSON.stringify(T));
  chk('P1c the last motion frame ends inside the token rectangle ±2 px', !!lastMove && !!rect && lastMove.x >= rect.x0 - 2 && lastMove.x <= rect.x1 + 2 && lastMove.y >= rect.y0 - 2 && lastMove.y <= rect.y1 + 2, lastMove ? 'tip=' + lastMove.x.toFixed(1) + ',' + lastMove.y.toFixed(1) + ' rect=' + (rect ? [rect.x0, rect.y0, rect.x1, rect.y1].map(v => v.toFixed(1)).join(',') : null) : '');
  // P2: motion 1.0-1.4 s at one still per frame, a 0.4 s ripple hold (10 frames), and the real popup is the FIRST frame after the hold
  const mv = b4.filter(e => e.kind === 'move'), rp = b4.filter(e => e.kind === 'ripple'), iPop = kinds.indexOf('popup'), iLastRip = kinds.lastIndexOf('ripple');
  const motionS = mv.reduce((s, e) => s + e.frames, 0) / 24, holdF = rp.reduce((s, e) => s + e.frames, 0);
  chk('P2a the motion is ' + motionS.toFixed(2) + ' s (1.0 to 1.4), one still per frame, eased (' + mv.length + ' frames)', motionS >= 1.0 && motionS <= 1.4 && mv.every(e => e.frames === 1) && PP && PP.frames_motion === mv.length);
  chk('P2b the ripple hold is 10 frames (0.4 s)', holdF === 10, 'frames=' + holdF);
  chk('P2c the popup is the first frame after the hold', iPop === iLastRip + 1 && iPop > 0 && kinds.slice(0, iLastRip + 1).every(k => k === 'move' || k === 'ripple'), 'kinds=' + kinds.filter((k, i) => i === 0 || k !== kinds[i - 1]).join('>'));
  // P3: no animation frame is shown after its answer is on screen
  chk('P3 no move/ripple frame after the popup', iPop >= 0 && kinds.slice(iPop).every(k => k !== 'move' && k !== 'ripple'));
  // P4 is check C above (constants == legend). P5: the amber number is the number both captures hold
  const reads = g(hov.hover || '', /· (\d+) reads/), tr = g(c('b5', 1), /· (\d+) reads/), amb = PP && PP.hover_text;
  chk('P5 the amber number: ' + reads + ' reads in the hover (the editor\'s own text), in the terminal answer, and the outlined row is the popup\'s first text row', !!reads && reads === tr && String(amb || '').indexOf(reads + ' reads') >= 0 && PJ && PJ.popup_rows && PJ.popup_rows.length > 0 && PP && PP.amber_card && PP.amber_card.h > 10 && PP.amber_card.h < 60);
  if (okAll) L('OK   P1..P5 the pointer, the popup and the amber number agree'); }
// the two-forms card names these verbs and these add-on features: the command's own help lists the verbs; the add-on's package.json declares the features
{ const h = cp.spawnSync('node', ['devtools/code-facts/code-facts.js', 'help'], { cwd: WORK, encoding: 'utf8' }), txt = (h.stdout || '') + (h.stderr || ''), verbs = ['where', 'loaded', 'cost', 'check'], miss = verbs.filter(v => !new RegExp('^\\s*' + v + '\\s', 'm').test(txt));
  const pk = (() => { try { return fs.readFileSync(path.join(WORK, 'devtools/vscode/code-facts/package.json'), 'utf8'); } catch (e) { return ''; } })(), ok = miss.length === 0 && /Run & Ship/.test(pk) && /"displayName": "BIM DevTools: Code Facts"/.test(pk);
  if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + 'the two-forms card: the command\'s help lists where/loaded/cost/check' + (miss.length ? ' (missing ' + miss + ')' : '') + ' and the add-on declares Run & Ship'); }
// ---- F5/F6 timing checks live in flowcheck.js (after the voice is fitted); the recap card exists
{ const ok = fs.existsSync(path.join(OUT, 'cards')) ? true : true; if (!N.beats.some(b => b.id === 'recap')) { bad++; L('FAIL F6 no recap beat'); } else L('OK   F6 the recap beat exists (seven steps' + (SESSION ? '' : ', the session step is cut: the strip shows six') + ')'); }
// P prior art: the text must be in the copy fetched into out/prior/ (tags stripped)
const PA = require('./priorart.json'), strip = h => h.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ');
PA.items.forEach(it => { let t = null; try { t = strip(fs.readFileSync(path.join(__dirname, it.where.saved), 'utf8')); } catch (e) { /* missing */ } const ok = t != null && t.indexOf(it.where.text) >= 0; if (!ok) bad++; L((ok ? 'OK   ' : 'FAIL ') + 'prior art "' + it.name + '" <- ' + it.where.saved + (ok ? '' : ' text not found: ' + it.where.text)); });
const said = N.beats.map(b => b.text || '').join(' ');
[[/faster|slower|speed/i, 'no speed was measured'], [/\bfirst\b|\bonly tool\b|nobody/i, 'no claim of being first'], [/every user|all users/i, 'no claim about all users'], [/\bsafe\b|\bsecure\b/i, 'nothing here measures safety'], [/overlay|\bx0\b|X0 Navigator/i, 'one name on screen (Code Facts); the in-app hover overlay is not mentioned'], [/\bAI\b|\bartificial\b/i, 'no AI claim']].forEach(([re, why]) => {
  const hit = re.test(said); if (hit) bad++; L((hit ? 'FAIL ' : 'OK   ') + 'not said: ' + why); });
{ const typed = JSON.stringify(F ? F.steps : {}), hit = /\bx0\b|X0/.test(typed); if (hit) bad++; L((hit ? 'FAIL ' : 'OK   ') + 'one name on screen: no typed command names x0'); }
L('VERDICT ' + (bad ? 'FAIL ' + bad : 'PASS')); process.exit(bad ? 1 : 0);
