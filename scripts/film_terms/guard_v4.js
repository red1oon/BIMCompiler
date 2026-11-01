// ⚠ DO NOT REMOVE — Scope: build gate for the DEVELOPER cut v4. Exit 0 only if ALL hold: (1) facts.resolved.v4.json fresh (sha256 of every source, incl. repo_facts.log, PR texts, repro log) and the resolver FAILS on a planted missing fact; (2) every digit on every card is a fact value, except (a) URLs, (b) the text inside code panels, (c) the two pinned commit hashes, each only because (3)-(4) verify them; planted token detected; (3) EVERY on-screen code line equals `git show <pin>:<file> | sed -n '<l>p'` run live now, equals the §REPO_EXCERPT line in build/scriptor/film_v4/repo_facts.log, and is present in the card HTML; control: a ONE-CHARACTER change is caught; both pins exist as commits; (4) the commands on the last card are lines of the frozen developers-page snapshot (sha256 logged) and each option shown appears in that page; (5) developer banned-word list (hype only, below), word-boundary, with controls; (6) the 'cannot' card (limits) carries no green, planted green detected; (7) every spoken number is a fact (tsv_v4.js). A control that does not detect = INCONCLUSIVE (exit 3). READ THE LOG: out_v4/guard.log.
// DEVELOPER BANNED WORDS (hype and claims only; technical words such as witness, mutant, node, git, server, sync are ALLOWED here): jelapang, novel, unique, revolutionary, breakthrough, first of its kind, world first, never before, blockchain, llm, genesis, game-changing, seamless, ai.
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..'), O = path.join(__dirname, 'out_v4'), OOT = path.join(require('os').homedir(), 'bim-ootb');
const R = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts.resolved.v4.json'), 'utf8')), X = R.facts, Cards = require('./cards_v4.js'), CB = Cards.build(X);
let fail = 0, incon = 0; const out = []; const say = s => { out.push(s); console.log(s); };
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
let stale = 0; Object.entries(R.sources).forEach(([f, h]) => { const p = path.join(ROOT, f); if (!fs.existsSync(p) || sha(p) !== h) { stale++; say('§FACTS_STALE ' + f); } });
say(`§FACTS_FRESH sources=${Object.keys(R.sources).length} stale=${stale} ${stale ? 'FAIL' : 'PASS'}`); if (stale) fail++;
{ const sp = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts.spec.v4.json'), 'utf8')); sp.facts[0].regex = 'ZZZ_THIS_LINE_DOES_NOT_EXIST'; const tmp = path.join(O, 'spec_control.json'); fs.writeFileSync(tmp, JSON.stringify(sp));
  const r = cp.spawnSync('node', [path.join(__dirname, 'resolve.js')], { env: Object.assign({}, process.env, { SPEC: tmp, RESOLVED_OUT: path.join(O, 'resolved_control.json') }), encoding: 'utf8' }); fs.unlinkSync(tmp);
  const ok = r.status === 3 && /MISSING/.test(r.stdout); say(`§FACTS_CONTROL a fact whose log line is not found makes the build fail: ${ok ? 'detected PASS' : 'NOT DETECTED'}`); if (!ok) incon++; }
// ---- (3) code excerpts
const PIN = Cards.PIN, repoDir = repo => repo === 'bim-ootb' ? OOT : ROOT;
const gitLine = (repo, pin, file, l) => cp.spawnSync('git', ['-C', repoDir(repo), 'show', pin + ':' + file], { encoding: 'utf8' }).stdout.split('\n')[l - 1];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const logTxt = fs.readFileSync(path.join(ROOT, 'build/scriptor/film_v4/repo_facts.log'), 'utf8'); const RF = {}; logTxt.split('\n').forEach(l => { const m = /^§REPO_EXCERPT (\S+)@(\S+) (\S+):(\d+) (.*)$/.exec(l); if (m) RF[m[1] + '|' + m[3] + '|' + m[4]] = m[5]; });
const codeHtml = CB.code.html; let exBad = 0; const same = (a, b) => a === b;
Cards.EX.forEach(([repo, file, line]) => { const live = (gitLine(repo, PIN[repo], file, line) || '').replace(/^ +/, ''), logd = RF[repo + '|' + file + '|' + line];
  const eq = live !== '' && same(live, logd) && codeHtml.includes(esc(logd)); if (!eq) { exBad++; say(`§EXCERPT_MISMATCH ${repo}@${PIN[repo]} ${file}:${line}`); } });
say(`§EXCERPTS on_screen=${Cards.EX.length} equal_to_git_show_and_repo_facts=${Cards.EX.length - exBad} mismatched=${exBad} ${exBad ? 'FAIL' : 'PASS'}`); if (exBad) fail++;
{ const [repo, file, line] = Cards.EX[0], live = (gitLine(repo, PIN[repo], file, line) || '').replace(/^ +/, ''), altered = live.replace('UNCONTROLLED', 'UNCONTROLLEd'); const caught = altered !== live && !(codeHtml.includes(esc(altered))) ; say(`§EXCERPTS_CONTROL a one-character change ('UNCONTROLLED' -> 'UNCONTROLLEd') in the first excerpt is ${caught ? 'detected PASS' : 'NOT DETECTED'}`); if (!caught) incon++; }
{ const pins = Object.entries(PIN).map(([r, p]) => `${r} ${p} ${cp.spawnSync('git', ['-C', repoDir(r), 'cat-file', '-t', p], { encoding: 'utf8' }).stdout.trim()}`); const ok = pins.every(x => /commit$/.test(x)); say(`§PINS ${pins.join(' · ')} ${ok ? 'PASS' : 'FAIL'}`); if (!ok) fail++; }
// ---- (4) commands from the page
const snap = path.join(O, 'cap', 'developers_snapshot.html'); const snapTxt = fs.readFileSync(snap, 'utf8').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ');
const preLines = ((/<pre>([\s\S]*?)<\/pre>/.exec(fs.readFileSync(snap, 'utf8')) || [, ''])[1]).replace(/&amp;/g, '&').split('\n').filter(Boolean);
{ const shown = (/<div class="code" style="font-size:25px">([\s\S]*?)<\/div>/.exec(CB.close.html) || [, ''])[1].split('\n').map(s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')); const optShown = ['--browser 0', '--only id,id', '--fresh 1', '--json file', '--logs dir']; const bad = [...shown.filter(l => !preLines.includes(l)), ...optShown.filter(o => !snapTxt.includes(o))];
  say(`§COMMANDS shown=${shown.length} options=${optShown.length} snapshot_sha256=${sha(snap).slice(0, 12)} not_in_page=${bad.length} ${bad.length || !shown.length ? 'FAIL ' + bad.join(' | ') : 'PASS'}`); if (bad.length || !shown.length) fail++;
  const c = shown.concat(['rm -rf /']).filter(l => !preLines.includes(l)).length === 1; say(`§COMMANDS_CONTROL a planted command that is not on the page is ${c ? 'detected PASS' : 'NOT DETECTED'}`); if (!c) incon++; }
// ---- (2) digits
const strip = h => h.replace(/<div class="src">[\s\S]*?<\/div>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<div class="code"[^>]*>[\s\S]*?<\/div>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ');
const URL_RE = /https?:\/\/[^\s<]+|github\.com\/red1oon\/[\w-]+/g, PINS = Object.values(PIN);
const allowed = new Set(); Object.values(X).forEach(f => { (String(f.value).match(/\d+(?:\.\d+)?/g) || []).forEach(m => allowed.add(m)); });
const clean = t => { PINS.forEach(p => { t = t.split(p).join(' '); }); return t.replace(URL_RE, ' '); };
const digits = (id, t) => (clean(t).match(/\d+(?:\.\d+)?/g) || []).filter(m => !allowed.has(m)).map(m => id + ':' + m);
let n = 0; const unknown = []; Object.entries(CB).forEach(([k, c]) => { const t = strip(c.html); n += (clean(t).match(/\d+(?:\.\d+)?/g) || []).length; unknown.push(...digits('card:' + k, t)); });
say(`§ONSCREEN_NUMBERS cards=${Object.keys(CB).length} tokens=${n} not_a_fact=${unknown.length} (code panels and URLs excluded; pins checked above) ${n === 0 ? 'INCONCLUSIVE' : unknown.length ? 'FAIL ' + unknown.join(' ') : 'PASS'}`); if (!n) incon++; else if (unknown.length) fail++;
{ const ok = digits('p', 'Visit 12345678 sends').length === 1 && digits('p', 'at ' + PINS[0]).length === 0 && digits('p', 'at ' + PINS[0].slice(0, 5) + '9').length >= 0; say(`§ONSCREEN_NUMBERS_CONTROL a planted token (12345678) is ${ok ? 'detected PASS' : 'NOT detected'}`); if (!ok) incon++; }
// ---- (6) green
const GREEN = /(class="[^"]*\b(ok|gd|gdc)\b[^"]*")|--gd|class="gdt"/;
const greenOn = c => ['cannot'].filter(k => GREEN.test(c[k].html.replace(/<style[\s\S]*?<\/style>/g, '')));
{ const g = greenOn(CB); say(`§NO_GREEN_ON_LIMIT_CARD cannot green=${g.length} ${g.length ? 'FAIL' : 'PASS'}`); if (g.length) fail++; const pl = JSON.parse(JSON.stringify(CB)); pl.cannot.html = pl.cannot.html.replace('class="bx am"', 'class="bx gd"'); const d = greenOn(pl).length > 0; say(`§NO_GREEN_CONTROL a planted green on the limits card: ${d ? 'detected' : 'NOT DETECTED'}`); if (!d) incon++; }
// ---- (5) words
const BAN = ['jelapang', 'novel', 'unique', 'revolutionary', 'breakthrough', 'first of its kind', 'world first', 'never before', 'blockchain', 'llm', 'genesis', 'game-changing', 'seamless', 'ai'];
const re = w => new RegExp('(^|[^A-Za-z_])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+') + '($|[^A-Za-z_])', 'i');
const texts = Object.entries(CB).map(([k, c]) => ['card:' + k, strip(c.html)]); Object.entries(CB).forEach(([k, c]) => texts.push(['src:' + k, (/<div class="src">([\s\S]*?)<\/div>/.exec(c.html) || [, ''])[1]]));
const tsvf = path.join(O, 'work', 'narration_en.tsv'); let spoken = 0; if (fs.existsSync(tsvf)) fs.readFileSync(tsvf, 'utf8').split('\n').filter(Boolean).forEach(l => { const p = l.split('\t'); texts.push(['spoken:' + p[0], p[5]]); spoken++; });
let hits = 0; texts.forEach(([id, t]) => BAN.forEach(w => { if (re(w).test(t)) { hits++; say(`§WORDS_HIT ${id} "${w}"`); } }));
{ const ok = re('revolutionary').test('a revolutionary tool') && !re('ai').test('said') && re('ai').test('no ai here') && !re('ai').test('GitHub'); say(`§WORDS_CONTROL a planted hype word is caught; 'ai' only as a word: ${ok ? 'detected PASS' : 'NOT DETECTED'}`); if (!ok) incon++; }
say(`§WORDS texts=${texts.length} spoken_rows=${spoken} hits=${hits} developer_ban_list=${BAN.length} words ${!spoken ? 'INCONCLUSIVE (no narration TSV yet)' : hits ? 'FAIL' : 'PASS'}`); if (!spoken) incon++; else if (hits) fail++;
// ---- (7) spoken numbers
{ const r = cp.spawnSync('node', [path.join(__dirname, 'tsv_v4.js'), 'measure', path.join(O, 'work')], { encoding: 'utf8' }); const l = (r.stdout.match(/^§NUM_CHECK .*$/gm) || []).join(' || '); say(l || '§NUM_CHECK missing'); const ok = r.status === 0 && /§NUM_CHECK numbers_spoken=\d+ facts_used=\d+ not_in_facts=0 PASS/.test(r.stdout); if (!ok) fail++; else say('§NUM_CHECK_CONTROL ' + (r.stdout.match(/^§NUM_CHECK_CONTROL (.*)$/m) || [, '?'])[1]); }
say(`§PENDING_STATE G2=${process.env.G2 === 'pass' ? 'pass' : 'pending (fresh clone FAILED, patched re-run shown, not another machine)'} G3=${process.env.G3 === '1' ? 'on' : 'off (dashed slot, no figure)'} GC=${process.env.GC === '1' ? 'on (git-aware cache numbers)' : 'off (numbers of the cache before the git fix)'}`);
const verdict = fail ? 'FAIL' : incon ? 'INCONCLUSIVE' : 'PASS'; say(`§GUARD ${verdict} fail=${fail} inconclusive=${incon} — ${verdict === 'PASS' ? 'every on-screen figure traced to a frozen log; every code line equals the pinned commit; commands equal the page; no hype word; limits carry no green' : 'see lines above'}`);
fs.writeFileSync(path.join(O, 'guard.log'), out.join('\n') + '\n'); process.exit(fail ? 1 : incon ? 3 : 0);
