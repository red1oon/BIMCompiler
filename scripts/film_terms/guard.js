// ⚠ DO NOT REMOVE — Scope: the film's build gate ("Terms you can check"). Exit 0 only if ALL hold: (1) facts.resolved.json is fresh (sha256 of every source log/doc equals what was resolved) and the resolver FAILS on a planted missing fact; (2) every digit token on every card is a resolved fact value (or a listed structural row index) and a planted token is detected; (3) OPEN terms are never shown green, the last two cards carry no green at all, and a planted green is detected; (4) no banned word on any card or in the narration; (5) every spoken number is a fact (tsv.js §NUM_CHECK). A control that does not detect = INCONCLUSIVE (exit 3), never PASS. READ THE LOG: out/guard.log.
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..', '..'); const R = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts.resolved.json'), 'utf8')), X = R.facts, Cards = require('./cards.js'), CB = Cards.build(X);
let fail = 0, incon = 0; const out = []; const say = s => { out.push(s); console.log(s); };
// (1) freshness + resolver control
let stale = 0; Object.entries(R.sources).forEach(([f, h]) => { const p = path.join(ROOT, f); if (!fs.existsSync(p) || crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex') !== h) { stale++; say('§FACTS_STALE ' + f); } });
say(`§FACTS_FRESH sources=${Object.keys(R.sources).length} stale=${stale} ${stale ? 'FAIL' : 'PASS'}`); if (stale) fail++;
{ const sp = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts.spec.json'), 'utf8')); sp.facts[0].regex = 'ZZZ_THIS_LINE_DOES_NOT_EXIST'; const tmp = path.join(__dirname, 'out', 'spec_control.json'); fs.writeFileSync(tmp, JSON.stringify(sp));
  const r = cp.spawnSync('node', [path.join(__dirname, 'resolve.js')], { env: Object.assign({}, process.env, { SPEC: tmp, RESOLVED_OUT: path.join(__dirname, 'out', 'resolved_control.json') }), encoding: 'utf8' }); fs.unlinkSync(tmp);
  const ok = r.status === 3 && /MISSING/.test(r.stdout); say(`§FACTS_CONTROL a fact whose log line is not found makes the build fail: ${ok ? 'detected PASS' : 'NOT DETECTED'}`); if (!ok) incon++; }
// (2) on-screen numbers
const strip = h => h.replace(/<div class="src">[\s\S]*?<\/div>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ');
const allowed = new Map(); Object.entries(X).forEach(([k, f]) => { (String(f.value).match(/\d+(?:\.\d+)?/g) || []).forEach(m => { if (!allowed.has(m)) allowed.set(m, 'fact ' + k); }); });
for (let i = 1; i <= Number(X.d20_pos.value); i++) if (!allowed.has(String(i))) allowed.set(String(i), 'row index of the legacy table (1..d20_pos)');
const digits = (id, t) => (t.match(/\d+(?:\.\d+)?/g) || []).filter(m => !allowed.has(m)).map(m => id + ':' + m);
let n = 0; const unknown = []; Object.entries(CB).forEach(([k, c]) => { const t = strip(c.html); n += (t.match(/\d+(?:\.\d+)?/g) || []).length; unknown.push(...digits('card:' + k, t)); });
say(`§ONSCREEN_NUMBERS cards=${Object.keys(CB).length} tokens=${n} not_a_fact=${unknown.length} ${n === 0 ? 'INCONCLUSIVE' : unknown.length ? 'FAIL ' + unknown.join(' ') : 'PASS'}`); if (!n) incon++; else if (unknown.length) fail++;
{ const planted = digits('planted', 'Visit 12345678 sends'); const ok = planted.length === 1; say(`§ONSCREEN_NUMBERS_CONTROL a planted token (12345678) is ${ok ? 'detected PASS' : 'NOT detected'}`); if (!ok) incon++; }
// (3) open never green
const GREEN = /(class="[^"]*\b(ok|gd|gdc)\b[^"]*")|--gd/;
function openGreen(cards) { const bad = []; cards.runner && (cards.runner.html.match(/<tr[\s\S]*?<\/tr>/g) || []).forEach(r => { if (/>OPEN</.test(r) && GREEN.test(r)) bad.push('runner row ' + strip(r).slice(0, 40)); }); ['notpromised', 'govern'].forEach(k => { const h = cards[k].html.replace(/<style[\s\S]*?<\/style>/g, ''); if (GREEN.test(h)) bad.push('card ' + k + ' carries green'); }); return bad; }
const og = openGreen(CB); const openRows = (CB.runner.html.match(/<tr[\s\S]*?<\/tr>/g) || []).filter(r => />OPEN</.test(r)).length;
say(`§OPEN_NEVER_GREEN open_rows_on_runner_card=${openRows} green_on_open_or_last_cards=${og.length} ${openRows === 0 ? 'INCONCLUSIVE' : og.length ? 'FAIL ' + og.join('; ') : 'PASS'}`); if (!openRows) incon++; else if (og.length) fail++;
{ const pl = JSON.parse(JSON.stringify(CB)); pl.runner.html = pl.runner.html.replace('chip open', 'chip ok'); const d1 = openGreen(pl).length > 0; const pl2 = JSON.parse(JSON.stringify(CB)); pl2.notpromised.html = pl2.notpromised.html.replace('class="bx am"', 'class="bx gd"'); const d2 = openGreen(pl2).length > 0;
  say(`§OPEN_NEVER_GREEN_CONTROL an OPEN row planted green: ${d1 ? 'detected' : 'NOT DETECTED'} · green planted on the not-promised card: ${d2 ? 'detected' : 'NOT DETECTED'}`); if (!(d1 && d2)) incon++; }
// (4) words
const BAN = ['jelapang', 'mutant', 'mutants', 'witness', 'witnesses', 'witnessed', 'upcaster', 'genesis', 'novel', 'unique', 'revolutionary', 'breakthrough', 'first of its kind', 'world first', 'never before', 'blockchain', 'llm', 'ai', 'terminal', 'npm', 'node', 'git', 'exit code', 'server', 'sync', 'async', 'toolchain'];
const re = w => new RegExp('(^|[^A-Za-z_])' + w.replace(/ /g, '\\s+') + '($|[^A-Za-z_])', 'i');
const texts = Object.entries(CB).map(([k, c]) => ['card:' + k, strip(c.html)]); const srcs = Object.entries(CB).map(([k, c]) => ['src:' + k, (/<div class="src">([\s\S]*?)<\/div>/.exec(c.html) || [, ''])[1]]);
const tsvf = path.join(__dirname, 'out', 'work', 'narration_en.tsv'); let spoken = 0; if (fs.existsSync(tsvf)) fs.readFileSync(tsvf, 'utf8').split('\n').filter(Boolean).forEach(l => { const p = l.split('\t'); texts.push(['spoken:' + p[0], p[5]]); spoken++; });
texts.push(...srcs);
let hits = 0; texts.forEach(([id, t]) => BAN.forEach(w => { if (re(w).test(t)) { if (w === 'database' ) return; hits++; say(`§WORDS_HIT ${id} "${w}"`); } }));
const ctl = re('jelapang').test('the Jelapang road') && !re('ai').test('said') && re('server').test('a server here'); say(`§WORDS_CONTROL a planted banned word is ${ctl ? 'detected' : 'NOT DETECTED'}`); if (!ctl) incon++;
say(`§WORDS texts=${texts.length} spoken_rows=${spoken} hits=${hits} ${!spoken ? 'INCONCLUSIVE (no narration TSV yet)' : hits ? 'FAIL' : 'PASS'}`); if (!spoken) incon++; else if (hits) fail++;
// (5) spoken numbers
{ const r = cp.spawnSync('node', [path.join(__dirname, 'tsv.js'), 'measure', path.join(__dirname, 'out', 'work')], { encoding: 'utf8' }); const l = (r.stdout.match(/^§NUM_CHECK .*$/gm) || []).join(' || '); say(l || '§NUM_CHECK missing'); const ok = r.status === 0 && /§NUM_CHECK numbers_spoken=\d+ facts_used=\d+ not_in_facts=0 PASS/.test(r.stdout); if (!ok) fail++; else say('§NUM_CHECK_CONTROL ' + (r.stdout.match(/^§NUM_CHECK_CONTROL (.*)$/m) || [, '?'])[1]); }
const verdict = fail ? 'FAIL' : incon ? 'INCONCLUSIVE' : 'PASS'; say(`§GUARD ${verdict} fail=${fail} inconclusive=${incon} — ${verdict === 'PASS' ? 'every on-screen and spoken number traced to a frozen log line; open terms never green; no banned word' : 'see lines above'}`);
fs.writeFileSync(path.join(__dirname, 'out', 'guard.log'), out.join('\n') + '\n'); process.exit(fail ? 1 : incon ? 3 : 0);
