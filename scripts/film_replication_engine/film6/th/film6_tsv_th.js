// ⚠ DO NOT REMOVE — Scope: THAI narration TSV + beat plan of Film 6 (Thai cut), from th/script6_th.md + the RESOLVED facts (../facts6.resolved.json) + the same visual table as ../film6_tsv.js (English, untouched). Every spoken number is {fact:id} spelled in THAI words; §NUM_CHECK re-reads the text with an INDEPENDENT Thai-number reader
// and requires every number it finds to equal a fact it requested (count per value, as Film 1 Thai). No digit, no '?', and no number word anywhere (also not inside another word) is allowed. Self-tests: hand table + round trip 0..99,999 (writer and reader are separate code). Read the log after every run (logs/tsv6_th_*.log).
// Usage:  node film6_tsv_th.js measure <outDir>   |   node film6_tsv_th.js build <outDir> <film.log>
'use strict';
const fs = require('fs'), path = require('path');
const [mode, dir, filmLog] = process.argv.slice(2); fs.mkdirSync(dir, { recursive: true });
const X = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'facts6.resolved.json'), 'utf8'));
const D = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
function below1e6(n) {                                                      // 1..999,999 in Thai words
  const pl = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'], s = String(n).split('').map(Number).reverse(); let r = '';
  for (let i = s.length - 1; i >= 0; i--) { const d = s[i]; if (!d) continue;
    if (i === 0) r += (d === 1 && s.length > 1 ? 'เอ็ด' : D[d]);              // ...1 after a tens/hundreds digit is เอ็ด (11 สิบเอ็ด, 21 ยี่สิบเอ็ด, 101 ร้อยเอ็ด)
    else if (i === 1) r += d === 1 ? 'สิบ' : d === 2 ? 'ยี่สิบ' : D[d] + 'สิบ';  // 10 สิบ (not หนึ่งสิบ), 20 ยี่สิบ
    else r += D[d] + pl[i]; }
  return r; }
const w = n => { n = Math.round(n); if (n === 0) return D[0]; return n >= 1e6 ? w(Math.floor(n / 1e6)) + 'ล้าน' + (n % 1e6 ? below1e6(n % 1e6) : '') : below1e6(n); };
// ---- independent reader: Thai number words -> value (used for the round trip and for the NUM_CHECK on the produced text) ----
const TOK = [['ศูนย์', 0], ['หนึ่ง', 1], ['สอง', 2], ['สาม', 3], ['สี่', 4], ['ห้า', 5], ['หก', 6], ['เจ็ด', 7], ['แปด', 8], ['เก้า', 9], ['ยี่', 2], ['เอ็ด', 1], ['สิบ', 10], ['ร้อย', 100], ['พัน', 1000], ['หมื่น', 10000], ['แสน', 100000], ['ล้าน', 1e6]];
const TOKRE = new RegExp(TOK.map(t => t[0]).sort((a, b) => b.length - a.length).join('|'), 'g'), TV = Object.fromEntries(TOK);
function readRun(tokens) { let total = 0, pend = null, million = 0;
  for (const t of tokens) { const v = TV[t];
    if (t === 'ล้าน') { million = (million + total + (pend === null ? 0 : pend)) * 1e6; total = 0; pend = null; }
    else if (v >= 10) { total += (pend === null ? 1 : pend) * v; pend = null; }
    else { pend = v; } }
  return million + total + (pend === null ? 0 : pend); }
function scan(text) {                                                       // numbers in a Thai text: maximal runs of number tokens with nothing in between (no space, no other letter)
  const runs = []; let m, last = -1, cur = [];
  TOKRE.lastIndex = 0;
  while ((m = TOKRE.exec(text)) !== null) { if (m.index === last && cur.length) cur.push(m[0]); else { if (cur.length) runs.push(cur); cur = [m[0]]; } last = m.index + m[0].length; }
  if (cur.length) runs.push(cur); return runs.map(readRun); }
{ // self-test 1: hand table of correct Thai readings (written from the language, not from the function)
  const HAND = { 0: 'ศูนย์', 1: 'หนึ่ง', 2: 'สอง', 10: 'สิบ', 11: 'สิบเอ็ด', 12: 'สิบสอง', 20: 'ยี่สิบ', 21: 'ยี่สิบเอ็ด', 22: 'ยี่สิบสอง', 30: 'สามสิบ', 31: 'สามสิบเอ็ด', 93: 'เก้าสิบสาม', 100: 'หนึ่งร้อย', 101: 'หนึ่งร้อยเอ็ด', 110: 'หนึ่งร้อยสิบ', 111: 'หนึ่งร้อยสิบเอ็ด', 120: 'หนึ่งร้อยยี่สิบ', 121: 'หนึ่งร้อยยี่สิบเอ็ด', 169: 'หนึ่งร้อยหกสิบเก้า',
    1000: 'หนึ่งพัน', 1500: 'หนึ่งพันห้าร้อย', 2300: 'สองพันสามร้อย', 3500: 'สามพันห้าร้อย', 5000: 'ห้าพัน', 10000: 'หนึ่งหมื่น', 27600: 'สองหมื่นเจ็ดพันหกร้อย', 100000: 'หนึ่งแสน', 1000000: 'หนึ่งล้าน' };
  let bad = 0; Object.keys(HAND).forEach(k => { if (w(+k) !== HAND[k]) { bad++; console.log(`§TH_NUM_SELFTEST ${k}: function says ${w(+k)} but the hand table says ${HAND[k]}  WRONG`); } });
  // self-test 2: round trip 0..99999 through the independent reader (writer and reader are separate code)
  let rt = 0; for (let k = 0; k < 100000; k++) if (scan(w(k))[0] !== k || scan(w(k)).length !== 1) { rt++; if (rt <= 5) console.log(`§TH_NUM_SELFTEST round trip ${k}: wrote ${w(k)} read ${JSON.stringify(scan(w(k)))}  WRONG`); }
  console.log(`§TH_NUM_SELFTEST hand_table=${Object.keys(HAND).length} wrong=${bad} round_trip_0_99999 wrong=${rt} ${bad || rt ? 'FAIL' : 'PASS'}`); if (bad || rt) process.exit(2); }

const USED = {}, CALLS = {}, PER = {}; let CUR = null;
function factWords(id) { const f = X[id]; if (!f) throw new Error('unknown fact ' + id); if (f.status !== 'now') throw new Error('fact not resolved: ' + id + ' (' + f.status + ')'); const v = f.value; if (!/^-?\d+$/.test(v)) throw new Error('fact is not an integer: ' + id + '=' + v);
  const a = Math.abs(Number(v)); (PER[CUR] = PER[CUR] || []).push(a); USED[id] = Number(v); CALLS[a] = (CALLS[a] || 0) + 1; return (Number(v) < 0 ? 'ลบ' : '') + w(a); }
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
const text = fs.readFileSync(path.join(__dirname, 'script6_th.md'), 'utf8').split('\n');
const secs = {}; let cur = null; const order = [];
text.forEach(l => { const h = /^## (\S+)\./.exec(l); if (h) { cur = h[1]; secs[cur] = []; order.push(cur); return; } if (!cur) return; const m = /^(F|M):\s+(.*)$/.exec(l); if (m) secs[cur].push([m[1], m[2]]); });
const beats = [];
order.forEach(sec => { const turns = secs[sec]; const groups = []; turns.forEach(([who, t]) => { if (who === 'F' || !groups.length) groups.push([]); groups[groups.length - 1].push([who, t]); });
  if (groups.length !== VIS[sec].length) throw new Error(`section ${sec}: ${groups.length} Q/A groups but ${VIS[sec].length} visuals`);
  groups.forEach((g, i) => { const id = SECNAME[sec] + '_' + i; CUR = id; const det = g.map(([who, t]) => { t = t.replace(/\{claim:[^}]+\}/g, '').replace(/\{fact:([^}]+)\}/g, (m, k) => factWords(k)).replace(/\s+/g, ' ').trim(); return who + ': ' + t; }).join(' | ');
    beats.push({ id, sec, vis: VIS[sec][i], detail: det }); });
  if (sec === '0') beats.push({ id: 's0_earlier', sec, vis: { k: 'card', c: 'earlier' }, detail: null, silentHold: 4.0 }); });
const speakable = beats.filter(b => b.detail);
// ---- §NUM_CHECK (Thai): numbers read from the produced text by the independent reader == facts requested, by value and count ----
function check(rows, log) { const sc = {}; let n = 0; rows.forEach(r => { scan(r.detail).forEach(v => { sc[v] = (sc[v] || 0) + 1; n++; }); }); let bad = 0;
  Object.keys(sc).forEach(v => { if (sc[v] !== (CALLS[v] || 0)) { bad++; if (log) console.log(`§NUM_CHECK value ${v}: spoken ${sc[v]} times, requested ${CALLS[v] || 0}  WRONG (${rows.filter(r => scan(r.detail).includes(+v)).map(r => r.id).join(',')})`); } });
  Object.keys(CALLS).forEach(v => { if (!sc[v]) { bad++; if (log) console.log(`§NUM_CHECK value ${v}: requested but not found in the spoken text  WRONG`); } });
  rows.forEach(r => { if (/\d/.test(r.detail)) { bad++; if (log) console.log('§NUM_CHECK digit in narration of ' + r.id + '  WRONG'); } if (/\?/.test(r.detail)) { bad++; if (log) console.log('§NUM_CHECK question mark in the Thai narration of ' + r.id + '  WRONG (tonal language: statements)'); } }); return { bad, n }; }
const main = check(speakable, true);
{ const c1 = check(speakable.map(r => ({ id: r.id, detail: r.detail.replace('สี่สิบแปด', 'สี่สิบเก้า') })), false), c2 = check(speakable.map((r, i) => ({ id: r.id, detail: i === 0 ? 'F: สามเซิร์ฟเวอร์' + r.detail.slice(r.detail.indexOf(' | ')) : r.detail })), false);
  console.log(`§NUM_CHECK_CONTROL number word changed (สี่สิบแปด -> สี่สิบเก้า): ${c1.bad > 0 ? 'detected' : 'NOT DETECTED'} · an invented spoken number added: ${c2.bad > 0 ? 'detected' : 'NOT DETECTED'}`); if (!(c1.bad > 0 && c2.bad > 0)) { console.log('§NUM_CHECK INCONCLUSIVE (a control did not detect)'); process.exit(3); } }
console.log(`§NUM_CHECK numbers_spoken=${main.n} facts_used=${Object.keys(USED).length} not_in_facts=${main.bad} ${main.bad ? 'FAIL' : 'PASS'}`); Object.keys(USED).forEach(k => console.log(`§NUM_USED ${k}=${USED[k]} <- ${X[k].log || X[k].witness}`)); if (main.bad) process.exit(2);
// ---- cues ----
const cues = {}, ids = []; let endT = null;
if (mode === 'build') { fs.readFileSync(filmLog, 'utf8').split('\n').forEach(l => { const m = /§FILM_CUE beat=\S+ id=(\S+) t=([\d.]+)/.exec(l); if (m) { cues[m[1]] = +m[2]; ids.push(m[1]); } const d = /§FILM_DONE .* dur=([\d.]+)s/.exec(l); if (d) endT = +d[1]; });
  if (ids.join() !== beats.map(b => b.id).join()) throw new Error('beat order in film.log differs from the plan:\n' + ids.join() + '\n' + beats.map(b => b.id).join()); }
const SRC = (b) => { const f = [...b.detail.matchAll(/./g)] && null; return 'script6.md section ' + b.sec + '; facts: ' + (b.facts || []).join(','); };
const rows = speakable.map(b => { const i = beats.findIndex(x => x.id === b.id); let a = 0, e = 999; if (mode === 'build') { a = cues[b.id]; const nx = beats[i + 1]; e = nx ? cues[nx.id] : endT; }
  const keys = [...(script6FactsOf(b) || [])]; return [b.id, a.toFixed(2), e.toFixed(2), 'script6.md §' + b.sec + (keys.length ? ' facts ' + keys.join(',') : ' (no figures)'), b.detail.split(' | ')[0], b.detail].join('\t'); });
function script6FactsOf(b) { const sec = secs[b.sec]; const ks = new Set(); (text.join('\n').match(new RegExp('## ' + b.sec.replace('.', '\\.') + '\\. [\\s\\S]*?(?=\\n## |$)')) || [''])[0].split('\n').forEach(l => { if (/^(F|M):/.test(l)) (l.match(/\{fact:([^}]+)\}/g) || []).forEach(m => ks.add(m.slice(6, -1))); }); return ks; }
fs.writeFileSync(path.join(dir, 'narration_th.tsv'), rows.join('\n') + '\n'); fs.writeFileSync(path.join(dir, 'facts_th.json'), JSON.stringify({ perBeat: PER, facts_used: USED }, null, 1)); fs.writeFileSync(path.join(dir, 'plan6.json'), JSON.stringify({ beats: beats.map(b => ({ id: b.id, sec: b.sec, vis: b.vis, speaks: !!b.detail, silentHold: b.silentHold || null, words: b.detail ? b.detail.split(/\s+/).length : 0 })) }, null, 1));
console.log(`§FILM_TSV mode=${mode} rows=${rows.length} beats=${beats.length} out=${path.join(dir, 'narration_th.tsv')}`);
