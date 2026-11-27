// ⚠ DO NOT REMOVE — Scope: FACTS of the THAI cut of Film 5 "Trust and the thin pipe" (spec: prompts/TEAMWORK_FRAMEWORK.md §37, §42.8; Chapter 3 replaced because FL-8 §16.0a / §36.1 "⚠ SUPERSEDED" withdrew it).
// Wraps ../facts5.js (English, not edited): the same 57 facts, same frozen sources, same cross-checks (a mismatch throws there). Adds three things, none of which types a number:
//  (1) CITE REMAP — the English cut cited line numbers of the frozen copies as they stood on 2026-10-26; the prompt file and the logs have moved since. Every cited line is re-found by its exact TEXT in the live file
//      and the cite is rewritten to the live line number; a line that cannot be found is reported (§TH_REMAP_MISSING) and the recorder fails if a card cites it.
//  (2) SUP — three frozen lines of the prompt file (inputs/sup_lines.tsv: FL-8 §16.0a, the §36.1 ⚠ SUPERSEDED note, the §37/§38 film direction) that the replacement card is built from, and TRACE: every claim of that card
//      is tied to a phrase that must occur literally in one of those lines (§SUP_TRACE; a claim whose phrase is missing throws).
//  (3) INPUTS for the Thai sources card: thin_derive.log is no longer a source of any shown number, so it is dropped; the SUP excerpt is added.
// Read the log after every run: §TH_REMAP_*, §SUP_*.
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const X = require('../facts5.js').build();
const ROOT = path.join(__dirname, '../../../..');
const LIVE = { tf: path.join(ROOT, 'prompts/TEAMWORK_FRAMEWORK.md'), pt: path.join(ROOT, 'build/comm/logs/witness_comm_plantrust.log'), ho: path.join(ROOT, 'build/scriptor/hosts.log'), td: path.join(ROOT, 'build/scriptor/witness_thin_derive.log') };
const NAME = { tf: 'TEAMWORK_FRAMEWORK.md', pt: 'build/comm/logs/witness_comm_plantrust.log', ho: 'build/scriptor/hosts.log', td: 'build/scriptor/witness_thin_derive.log' };
const LINE0 = { tf: 4017, pt: 0, ho: 0, td: 0 };
const sha = b => crypto.createHash('sha256').update(b).digest('hex').slice(0, 16);
const LOG = X.LOG.slice(); const say = s => { LOG.push(s); };
const liveLines = {}; Object.keys(LIVE).forEach(k => { try { liveLines[k] = fs.readFileSync(LIVE[k], 'utf8').split('\n'); } catch (e) { liveLines[k] = null; } });
const frozenLines = k => X.ALLTEXT[k].split('\n');
const missing = {};
function mapLine(k, n) {                                           // frozen line number -> live line number, found by exact text; closest wins when the text occurs more than once
  const fl = frozenLines(k)[n - LINE0[k] - 1], lv = liveLines[k]; if (fl === undefined || !fl.trim() || !lv) return null;
  let best = null; lv.forEach((t, i) => { if (t === fl && (best === null || Math.abs(i + 1 - n) < Math.abs(best - n))) best = i + 1; }); return best; }
const keyOf = {}; Object.keys(NAME).forEach(k => { keyOf[NAME[k]] = k; });
const RE = /(TEAMWORK_FRAMEWORK\.md|build\/comm\/logs\/witness_comm_plantrust\.log|build\/scriptor\/hosts\.log|build\/scriptor\/witness_thin_derive\.log)(:| line )(\d+)/g;
let nRemap = 0, nSame = 0;
function fix(s) { return s.replace(RE, (all, f, sep, n) => { const k = keyOf[f], m = mapLine(k, +n); if (m === null) { missing[f + ':' + n] = 1; return f + sep + n + '(frozen copy only)'; } nRemap++; if (m === +n) nSame++; return f + sep + m; }); }
function walk(o) { if (typeof o === 'string') return fix(o); if (Array.isArray(o)) return o.map(walk); if (o && typeof o === 'object') { Object.keys(o).forEach(k => { o[k] = walk(o[k]); }); return o; } return o; }
if (!X.__th) {                                                     // idempotent: build() hands out shared objects
  walk(X.SRC); walk(X.D); X.__th = true;
  say(`§TH_REMAP cites_rewritten_to_live_line_numbers=${nRemap} unchanged=${nSame} missing=${Object.keys(missing).length}${Object.keys(missing).length ? ' [' + Object.keys(missing).join(' ') + ']' : ''}`);
  Object.keys(missing).forEach(m => say(`§TH_REMAP_MISSING ${m} (the frozen line's text is not in the live file any more; a card that cites it must fail)`)); }

// ---------- SUP: three frozen lines of the prompt file ----------
const supRaw = fs.readFileSync(path.join(__dirname, 'inputs/sup_lines.tsv'), 'utf8').split('\n').filter(Boolean).map(l => { const i = l.indexOf('\t'); return { n0: +l.slice(0, i), text: l.slice(i + 1) }; });
const supBy = { fl8: supRaw.find(x => /^- \*\*FL-8 UPS/.test(x.text)), superseded: supRaw.find(x => /^\*\*⚠ SUPERSEDED 2026-10-26 by FL-8/.test(x.text)), direction: supRaw.find(x => /^\*\*§37 \/ §38 FILM DIRECTION/.test(x.text)) };
Object.keys(supBy).forEach(k => { if (!supBy[k]) throw new Error('§SUP_FAIL frozen line missing: ' + k); });
const SUP = {}; let supSame = true;
Object.keys(supBy).forEach(k => { const lv = liveLines.tf; let best = null; if (lv) lv.forEach((t, i) => { if (t === supBy[k].text && (best === null || Math.abs(i + 1 - supBy[k].n0) < Math.abs(best - supBy[k].n0))) best = i + 1; });
  if (best === null) { supSame = false; say(`§SUP_LIVE ${k} frozen at line ${supBy[k].n0} is NOT in the live prompt file any more`); }
  SUP[k] = { n: best === null ? supBy[k].n0 : best, n0: supBy[k].n0, text: supBy[k].text }; say(`§SUP_LINE ${k} frozen_line=${supBy[k].n0} live_line=${best} identical_text_in_live=${best !== null} chars=${supBy[k].text.length}`); });
// TRACE: [id, what the Thai card / narration says, which source line, phrase that must occur literally]
const TRACE = [
  ['T1', 'แนวคิดให้เครื่องอื่นคำนวณผลเอง ถูกแทนที่แล้ว', 'superseded', /SUPERSEDED 2026-10-26 by FL-8 \(UPS\)/],
  ['T1b', 'ถูกถอน (WITHDRAWN)', 'superseded', /as if every peer would derive — WITHDRAWN/],
  ['T2', 'HQ (สำนักงานใหญ่) ดำเนินการ Complete และลงบัญชีเพียงครั้งเดียว: only the processor completes and posts', 'superseded', /only the processor completes and posts/],
  ['T2b', 'the processor is the HQ/server role; runs the DocAction once (Complete + posting)', 'fl8', /The PROCESSOR \(the HQ\/server role\) receives the declaration, authors the document, runs the DocAction \*\*once\*\* \(Complete \+ posting\)/],
  ['T3', 'เครื่องที่จุดขายเพียงแจ้งรายการ: the station declares', 'superseded', /the station declares and receives replenishment/],
  ['T3b', 'the point of action (the POS station) only DECLARES', 'fl8', /The point of action \(the POS station\) only DECLARES/],
  ['T3c', 'รับกลับเฉพาะสิ่งที่ต้องใช้: returns only what the station needs', 'fl8', /returns only what the station needs/],
  ['T4', 'เอกสารแต่ละใบมีผู้ดำเนินการ DocAction เพียงคนเดียว', 'fl8', /Every document has exactly ONE DocAction executor, named by the plan/],
  ['T4b', 'one DocAction executor per document', 'superseded', /with one DocAction executor per document/],
  ['T4c', 'no other device runs completeIt / posting', 'fl8', /No other device runs completeIt \/ posting for it/],
  ['T5', 'ภาพยนตร์เรื่องหลังจะแสดงให้เห็นว่าทำงานจริง: the next film is the working UPS flow', 'direction', /The NEXT film is a \*\*finishing demo\*\*/],
  ['T5b', 'the WORKING UPS flow', 'direction', /the WORKING UPS flow/],
  ['T6', 'Chapter 3 "a second device can work the results out" is superseded by FL-8', 'direction', /Chapter 3 \("a second device can work the results out"\) is superseded by FL-8/]];
let tbad = 0;
TRACE.forEach(([id, claim, src, re]) => { const ok = re.test(SUP[src].text); if (!ok) tbad++; say(`§SUP_TRACE ${id} ${ok ? 'FOUND' : 'MISSING'} in ${src} (TEAMWORK_FRAMEWORK.md line ${SUP[src].n}) <- ${claim}`); });
say(`§SUP_TRACE_DONE claims=${TRACE.length} not_found=${tbad} ${tbad ? 'FAIL' : 'PASS'}`);
{ const ctl = /a phrase nobody wrote/.test(SUP.fl8.text); say(`§SUP_TRACE_CONTROL a planted phrase that is not in the source is ${ctl ? 'NOT detected FAIL' : 'detected (not found) PASS'}`); if (ctl) tbad++; }
if (tbad) throw new Error('§SUP_FAIL a claim of the replacement card has no source phrase');
X.SUP = SUP; X.LOG = LOG;

// ---------- INPUTS for the Thai sources card ----------
const supSha = sha(fs.readFileSync(path.join(__dirname, 'inputs/sup_lines.tsv')));
const liveSame = k => liveLines[k] ? liveLines[k].join('\n') === X.ALLTEXT[k] || liveLines[k].join('\n') + '\n' === X.ALLTEXT[k] : false;
X.INPUTS = X.INPUTS.filter(i => i.key !== 'td').map(i => {
  if (i.key === 'tf') { const lv = liveLines.tf, fl = frozenLines('tf').filter(t => t.trim()); const found = fl.filter(t => lv && lv.indexOf(t) >= 0).length;
    return Object.assign({}, i, { liveNow: found === fl.length ? 'same' : 'DIFFERS', note: '', found, of: fl.length }); }
  return Object.assign({}, i, { liveNow: liveSame(i.key) ? 'same' : 'DIFFERS', note: '' }); });
X.INPUTS.push({ key: 'sup', frozen: 'th/inputs/sup_lines.tsv', source: 'TEAMWORK_FRAMEWORK.md (สามบรรทัดที่การ์ดตอนที่ 3 ใช้)', sha16: supSha, liveNow: supSame ? 'same' : 'DIFFERS', note: ' (บรรทัด ' + [SUP.fl8.n, SUP.superseded.n, SUP.direction.n].join(', ') + ')' });
X.INPUTS.forEach(i => say(`§TH_INPUT ${i.key} frozen=${i.frozen} sha16=${i.sha16} live_now=${i.liveNow}${i.of ? ' lines_still_in_live=' + i.found + '/' + i.of : ''}`));
X.TEXT_USED = { tf: X.ALLTEXT.tf, pt: X.ALLTEXT.pt, ho: X.ALLTEXT.ho, sup: supRaw.map(x => x.text).join('\n') };       // the sources whose digits may appear on screen (thin_derive.log is no longer one)
function build() { return X; }
module.exports = { build, TRACE, liveLines, frozenLines, LINE0, NAME, keyOf, supRaw };
if (require.main === module) { LOG.forEach(l => console.log(l)); console.log(`§TH_FACTS_DONE facts=${Object.keys(X.F).length} cites_remapped=${nRemap} sup_trace=${TRACE.length} PASS`); }
