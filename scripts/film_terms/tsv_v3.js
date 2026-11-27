// ⚠ DO NOT REMOVE — Scope: builds the narration TSV (FILM_NARRATION.md ▶ PLAYBOOK step 2) and plan.json from script_en.md + facts.resolved.json. Every spoken number is {fact:id} spelled out in words here; §NUM_CHECK re-reads the finished text and requires every number it speaks to equal a fact it requested (counted per value). Digits and unrequested number words FAIL (exit 2). Controls prove the check can fail. READ THE LOG: out/tsv_*.log.
// Usage: node tsv.js measure <outDir>   (cue 0 / end 999)      node tsv.js build <outDir> <film.log>   (cues from the recorded §FILM_CUE)
'use strict';
const fs = require('fs'), path = require('path');
const [mode, dir, filmLog] = process.argv.slice(2); fs.mkdirSync(dir, { recursive: true });
const X = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts.resolved.v3.json'), 'utf8')).facts;
const ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' '), TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split(' ');
const w = n => { n = Math.round(n); if (n < 20) return ONES[n]; if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : ''); if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + w(n % 100) : ''); return w(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + w(n % 1000) : ''); };
const USED = {}, CALLS = {};
function factWords(id) { const f = X[id]; if (!f || f.status !== 'now') throw new Error('fact not resolved: ' + id); if (!/^\d+$/.test(f.value)) throw new Error('fact is not an integer: ' + id + '=' + f.value); const a = Number(f.value); USED[id] = a; CALLS[a] = (CALLS[a] || 0) + 1; return w(a); }
const beats = []; let cur = null;
const CARDS = ['hook', 'how', 'private', 'gaps', 'light', 'promises', 'limits', 'tryit'];
const cond = s => s.replace(/<<(G2P|G2|G3):\s*(.*?)>>/g, (_, k, x) => ((k === 'G3' && process.env.G3 === '1') || (k === 'G2' && process.env.G2 === 'pass') || (k === 'G2P' && process.env.G2 !== 'pass')) ? x : '');
fs.readFileSync(path.join(__dirname, 'script_en_v3_public.md'), 'utf8').split('\n').forEach(l => { const h = /^## (\d+) \|/.exec(l); if (h) { cur = { id: 'b' + h[1], card: CARDS[+h[1] - 1], turns: [], facts: [] }; beats.push(cur); return; } const m = /^(F|M):\s+(.*)$/.exec(l); if (m && cur) { const body = cond(m[2]); (body.match(/\{fact:([^}]+)\}/g) || []).forEach(x => cur.facts.push(x.slice(6, -1))); cur.turns.push(m[1] + ': ' + body.replace(/\{fact:([^}]+)\}/g, (_, k) => factWords(k)).replace(/\s+/g, ' ').trim()); } });
beats.forEach(b => { b.detail = b.turns.join(' | '); });
const WORDS = {}; ONES.forEach((x, i) => { WORDS[x] = i; }); TENS.forEach((x, i) => { if (i >= 2) WORDS[x] = i * 10; });
function check(rows, log) { const spoken = []; rows.forEach(r => { let total = 0, c2 = 0, inRun = false; const flush = () => { if (inRun) spoken.push([r.id, total + c2]); total = 0; c2 = 0; inRun = false; };
    r.detail.toLowerCase().split(/[\s-]+/).forEach(tk => { const t = tk.replace(/[,.?!:;"]/g, ''); if (WORDS[t] !== undefined || t === 'hundred' || t === 'thousand') { inRun = true; if (t === 'hundred') c2 = (c2 || 1) * 100; else if (t === 'thousand') { total += (c2 || 1) * 1000; c2 = 0; } else c2 += WORDS[t]; if (/[,.?!:;]$/.test(tk)) flush(); } else flush(); }); flush(); });
  let bad = 0; const sc = {}; spoken.forEach(([id, v]) => { sc[v] = (sc[v] || 0) + 1; });
  Object.keys(sc).forEach(v => { if (sc[v] !== (CALLS[v] || 0)) { bad++; if (log) console.log(`§NUM_CHECK value ${v}: spoken ${sc[v]} times (${spoken.filter(s => s[1] == v).map(s => s[0]).join(',')}), requested ${CALLS[v] || 0}  WRONG`); } });
  Object.keys(CALLS).forEach(v => { if (!sc[v]) { bad++; if (log) console.log(`§NUM_CHECK value ${v}: requested but not found in the spoken text  WRONG`); } });
  rows.forEach(r => { if (/\d/.test(r.detail)) { bad++; if (log) console.log('§NUM_CHECK digit in narration of ' + r.id + '  WRONG'); } }); return { bad, n: spoken.length }; }
const main = check(beats, true);
{ const c1 = check(beats.map(r => ({ id: r.id, detail: r.detail.replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen)\b/, 'seventeen') })), false), c2 = check(beats.map((r, i) => ({ id: r.id, detail: i === 0 ? r.detail + ' Eighty clients.' : r.detail })), false);
  console.log(`§NUM_CHECK_CONTROL a spoken number changed (first number word -> seventeen): ${c1.bad > 0 ? 'detected' : 'NOT DETECTED'} · an invented spoken number added: ${c2.bad > 0 ? 'detected' : 'NOT DETECTED'}`); if (!(c1.bad > 0 && c2.bad > 0)) { console.log('§NUM_CHECK INCONCLUSIVE (a control did not detect)'); process.exit(3); } }
console.log(`§NUM_CHECK numbers_spoken=${main.n} facts_used=${Object.keys(USED).length} not_in_facts=${main.bad} ${main.bad ? 'FAIL' : 'PASS'}`); Object.keys(USED).forEach(k => console.log(`§NUM_USED ${k}=${USED[k]} <- ${X[k].log}`)); if (main.bad) process.exit(2);
const cues = {}, ids = []; let endT = null;
if (mode === 'build') { fs.readFileSync(filmLog, 'utf8').split('\n').forEach(l => { const m = /§FILM_CUE beat=(\S+) t=([\d.]+)/.exec(l); if (m) { cues[m[1]] = +m[2]; ids.push(m[1]); } const d = /§FILM_DONE .* dur=([\d.]+)s/.exec(l); if (d) endT = +d[1]; });
  if (ids.join() !== beats.map(b => b.id).join()) throw new Error('beat order in film.log differs from the script'); }
const rows = beats.map((b, i) => { let a = 0, e = 999; if (mode === 'build') { a = cues[b.id]; e = beats[i + 1] ? cues[beats[i + 1].id] : endT; } return [b.id, a.toFixed(2), e.toFixed(2), 'script_en_v3_public.md ' + b.id + (b.facts.length ? ' facts ' + [...new Set(b.facts)].join(',') : ' (no figures)'), b.turns[0], b.detail].join('\t'); });
fs.writeFileSync(path.join(dir, 'narration_en.tsv'), rows.join('\n') + '\n'); fs.writeFileSync(path.join(dir, 'plan.json'), JSON.stringify({ beats: beats.map(b => ({ id: b.id, card: b.card, words: b.detail.split(/\s+/).length })) }, null, 1));
console.log(`§FILM_TSV mode=${mode} rows=${rows.length} out=${path.join(dir, 'narration_en.tsv')}`);
