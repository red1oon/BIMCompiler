// ⚠ DO NOT REMOVE — Scope: builds the narration TSV (FILM_NARRATION.md ▶ PLAYBOOK step 2) and the beat plan of Film 6 from script6.md + the RESOLVED facts (facts6.resolved.json) + the visual table below. Every spoken number is {fact:id} spelled out here; §NUM_CHECK re-reads the finished text
// and requires every number it speaks to equal a fact it requested (counted per value). Digits and unrequested number words fail. Read the log after every run (logs/tsv6_*.log).
// Usage:  node film6_tsv.js measure <outDir>                (rows with cue 0 / end 999, for the fitter's duration measurement)
//         node film6_tsv.js build <outDir> <film.log>       (rows with the §FILM_CUE times of the recorded silent film)
'use strict';
const fs = require('fs'), path = require('path');
const [mode, dir, filmLog] = process.argv.slice(2); fs.mkdirSync(dir, { recursive: true });
const X = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts6.resolved.json'), 'utf8')), CL = JSON.parse(fs.readFileSync(path.join(__dirname, 'claims6.json'), 'utf8'));
const ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' '), TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split(' ');
const w = n => { n = Math.round(n); if (n < 20) return ONES[n]; if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : ''); if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + w(n % 100) : ''); return w(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + w(n % 1000) : ''); };
const USED = {}, CALLS = {};
function factWords(id) { const f = X[id]; if (!f) throw new Error('unknown fact ' + id); if (f.status !== 'now') throw new Error('fact not resolved: ' + id + ' (' + f.status + ')');
  const v = f.value; if (!/^-?\d+$/.test(v)) { if (id === 'so_conflict_msg') return v; throw new Error('fact is not an integer: ' + id + '=' + v); }
  const a = Math.abs(Number(v)); USED[id] = Number(v); CALLS[a] = (CALLS[a] || 0) + 1; return (Number(v) < 0 ? 'minus ' : '') + w(a); }
// ---- visual table: section id -> per-beat visual (index = Q/A group of the section) ----
const VIS = {
  T: [{ k: 'card', c: 'title' }],
  '0': [{ k: 'card', c: 'ch0' }, { k: 'card', c: 'ch0' }, { k: 'card', c: 'ch0' }],
  '0b': [{ k: 'card', c: 'ch0b' }, { k: 'card', c: 'ch0b' }, { k: 'card', c: 'ch0b' }],
  '1': [{ k: 'seq', parts: [{ k: 'card', c: 'ch1', secs: 4 }, { k: 'stage', t: 'ch1' }] }, { k: 'stage', t: 'ch1' }],
  '2': [{ k: 'seq', parts: [{ k: 'card', c: 'ch2', secs: 4 }, { k: 'stage', t: 'ch2' }] }, { k: 'stage', t: 'ch2' }, { k: 'stage', t: 'ch2' }, { k: 'stage', t: 'ch2' }],
  '3': [{ k: 'shots', s: ['home_lens', 'import_window_before', 'process_dialog'] }, { k: 'shots', s: ['import_window_after'] }, { k: 'seq', parts: [{ k: 'card', c: 'ch3', secs: 4 }, { k: 'stage', t: 'ch3a' }] }, { k: 'stage', t: 'ch3a' }, { k: 'stage', t: 'ch3b' }, { k: 'stage', t: 'ch3c' }],
  '4': [{ k: 'seq', parts: [{ k: 'card', c: 'ch4', secs: 4 }, { k: 'stage', t: 'ch4' }] }, { k: 'stage', t: 'ch4' }, { k: 'card', c: 'ch4' }, { k: 'card', c: 'ch4' }, { k: 'card', c: 'ch4' }, { k: 'card', c: 'ch4' }],
  '4c': [{ k: 'card', c: 'ch4c' }, { k: 'card', c: 'ch4c' }, { k: 'card', c: 'ch4c' }],
  '5': [{ k: 'card', c: 'ch5' }],
  '5b': [{ k: 'shots', s: ['menu_tree', 'import_window_after', 'process_dialog', 'wse_doc_action_access', 'recurring_run', 'acct_processor', 'role_wse', 'plugins_user', 'home_103'] }],
  L: [{ k: 'card', c: 'limits' }], W: [{ k: 'card', c: 'why' }], Z: [{ k: 'card', c: 'offer' }]
};
const SECNAME = { T: 't', '0': 's0', '0b': 's0b', '1': 's1', '2': 's2', '3': 's3', '4': 's4', '4c': 's4c', '5': 's5', '5b': 's5b', L: 'sl', W: 'sw', Z: 'sz' };
const text = fs.readFileSync(path.join(__dirname, 'script6.md'), 'utf8').split('\n');
const secs = {}; let cur = null; const order = [];
text.forEach(l => { const h = /^## (\S+)\./.exec(l); if (h) { cur = h[1]; secs[cur] = []; order.push(cur); return; } if (!cur) return; const m = /^(F|M):\s+(.*)$/.exec(l); if (m) secs[cur].push([m[1], m[2]]); });
const beats = [];
order.forEach(sec => { const turns = secs[sec]; const groups = []; turns.forEach(([who, t]) => { if (who === 'F' || !groups.length) groups.push([]); groups[groups.length - 1].push([who, t]); });
  if (groups.length !== VIS[sec].length) throw new Error(`section ${sec}: ${groups.length} Q/A groups but ${VIS[sec].length} visuals`);
  groups.forEach((g, i) => { const id = SECNAME[sec] + '_' + i; const det = g.map(([who, t]) => { t = t.replace(/\{claim:[^}]+\}/g, '').replace(/\{fact:([^}]+)\}/g, (m, k) => factWords(k)).replace(/\s+/g, ' ').trim(); return who + ': ' + t; }).join(' | ');
    beats.push({ id, sec, vis: VIS[sec][i], detail: det }); });
  if (sec === '0') beats.push({ id: 's0_earlier', sec, vis: { k: 'card', c: 'earlier' }, detail: null, silentHold: 4.0 }); });
const speakable = beats.filter(b => b.detail);
// ---- §NUM_CHECK (as film5): every number spoken = a fact requested, counted per value; digits banned ----
const WORDS = {}; ONES.forEach((x, i) => { WORDS[x] = i; }); TENS.forEach((x, i) => { if (i >= 2) WORDS[x] = i * 10; });
function check(rows, log) { const spoken = []; rows.forEach(r => { let total = 0, cur2 = 0, inRun = false; const flush = () => { if (inRun) spoken.push([r.id, total + cur2]); total = 0; cur2 = 0; inRun = false; };
    r.detail.toLowerCase().split(/[\s-]+/).forEach(tk => { const t = tk.replace(/[,.?!:;"]/g, ''); if (WORDS[t] !== undefined || t === 'hundred' || t === 'thousand') { inRun = true; if (t === 'hundred') cur2 = (cur2 || 1) * 100; else if (t === 'thousand') { total += (cur2 || 1) * 1000; cur2 = 0; } else cur2 += WORDS[t]; if (/[,.?!:;]$/.test(tk)) flush(); } else flush(); }); flush(); });
  let bad = 0; const sc = {}; spoken.forEach(([id, v]) => { sc[v] = (sc[v] || 0) + 1; });
  Object.keys(sc).forEach(v => { if (sc[v] !== (CALLS[v] || 0)) { bad++; if (log) console.log(`§NUM_CHECK value ${v}: spoken ${sc[v]} times (${spoken.filter(s => s[1] == v).map(s => s[0]).join(',')}), requested ${CALLS[v] || 0}  WRONG`); } });
  Object.keys(CALLS).forEach(v => { if (!sc[v]) { bad++; if (log) console.log(`§NUM_CHECK value ${v}: requested but not found in the spoken text  WRONG`); } });
  rows.forEach(r => { if (/\d/.test(r.detail)) { bad++; if (log) console.log('§NUM_CHECK digit in narration of ' + r.id + '  WRONG'); } }); return { bad, n: spoken.length }; }
const main = check(speakable, true);
{ const mut = speakable.map(r => ({ id: r.id, detail: r.detail.replace('forty eight', 'forty nine') })), c1 = check(mut, false); const mut2 = speakable.map((r, i) => ({ id: r.id, detail: i === 0 ? 'F: Seven where is the server?' + r.detail.slice(r.detail.indexOf(' | ')) : r.detail })), c2 = check(mut2, false);
  console.log(`§NUM_CHECK_CONTROL number word changed (forty eight -> forty nine): ${c1.bad > 0 ? 'detected' : 'NOT DETECTED'} · an invented spoken number added: ${c2.bad > 0 ? 'detected' : 'NOT DETECTED'}`); if (!(c1.bad > 0 && c2.bad > 0)) { console.log('§NUM_CHECK INCONCLUSIVE (a control did not detect)'); process.exit(3); } }
console.log(`§NUM_CHECK numbers_spoken=${main.n} facts_used=${Object.keys(USED).length} not_in_facts=${main.bad} ${main.bad ? 'FAIL' : 'PASS'}`); Object.keys(USED).forEach(k => console.log(`§NUM_USED ${k}=${USED[k]} <- ${X[k].log || X[k].witness}`)); if (main.bad) process.exit(2);
// ---- cues ----
const cues = {}, ids = []; let endT = null;
if (mode === 'build') { fs.readFileSync(filmLog, 'utf8').split('\n').forEach(l => { const m = /§FILM_CUE beat=\S+ id=(\S+) t=([\d.]+)/.exec(l); if (m) { cues[m[1]] = +m[2]; ids.push(m[1]); } const d = /§FILM_DONE .* dur=([\d.]+)s/.exec(l); if (d) endT = +d[1]; });
  if (ids.join() !== beats.map(b => b.id).join()) throw new Error('beat order in film.log differs from the plan:\n' + ids.join() + '\n' + beats.map(b => b.id).join()); }
const SRC = (b) => { const f = [...b.detail.matchAll(/./g)] && null; return 'script6.md section ' + b.sec + '; facts: ' + (b.facts || []).join(','); };
const rows = speakable.map(b => { const i = beats.findIndex(x => x.id === b.id); let a = 0, e = 999; if (mode === 'build') { a = cues[b.id]; const nx = beats[i + 1]; e = nx ? cues[nx.id] : endT; }
  const keys = [...(script6FactsOf(b) || [])]; return [b.id, a.toFixed(2), e.toFixed(2), 'script6.md §' + b.sec + (keys.length ? ' facts ' + keys.join(',') : ' (no figures)'), b.detail.split(' | ')[0], b.detail].join('\t'); });
function script6FactsOf(b) { const sec = secs[b.sec]; const ks = new Set(); (text.join('\n').match(new RegExp('## ' + b.sec.replace('.', '\\.') + '\\. [\\s\\S]*?(?=\\n## |$)')) || [''])[0].split('\n').forEach(l => { if (/^(F|M):/.test(l)) (l.match(/\{fact:([^}]+)\}/g) || []).forEach(m => ks.add(m.slice(6, -1))); }); return ks; }
fs.writeFileSync(path.join(dir, 'narration_en.tsv'), rows.join('\n') + '\n'); fs.writeFileSync(path.join(dir, 'plan6.json'), JSON.stringify({ beats: beats.map(b => ({ id: b.id, sec: b.sec, vis: b.vis, speaks: !!b.detail, silentHold: b.silentHold || null, words: b.detail ? b.detail.split(/\s+/).length : 0 })) }, null, 1));
console.log(`§FILM_TSV mode=${mode} rows=${rows.length} beats=${beats.length} out=${path.join(dir, 'narration_en.tsv')}`);
