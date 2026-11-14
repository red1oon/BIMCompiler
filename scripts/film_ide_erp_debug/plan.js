// ⚠ DO NOT REMOVE — SCOPE: film 3 (prompts/FILM_IDE_ERP_DEBUG.md). Finds the REAL places and the REAL texts the VS Code half visits, in the OLD tree (the bug) and the NEW tree (the merged fix, bim-ootb #3010), and prints
// one JSON line. Nothing is typed by hand into the film: the text typed on camera is cut from the OLD line and must be found in the NEW file; if any is missing, the plan FAILS. Usage: node plan.js <OLD tree> <NEW tree>
'use strict';
const fs = require('fs'), path = require('path');
const OLD = path.resolve(process.argv[2]), NEW = path.resolve(process.argv[3]);
const rd = (root, rel) => fs.readFileSync(path.join(root, rel), 'utf8').split('\n');
const KER = 'erp/ws_kernel.js', WIT = 'erp/tests/witness_replay_clock.js', TAG = '§REPLAY_CLOCK_SESSION_DAY';
const fail = m => { console.error('plan: ' + m); process.exit(1); };
const find = (lines, re, from) => { for (let i = from || 0; i < lines.length; i++) { const m = re.exec(lines[i]); if (m) return { line: i + 1, col: m.index, text: lines[i] }; } return null; };
const ko = rd(OLD, KER), kn = rd(NEW, KER), wo = rd(OLD, WIT);
const def = find(ko, /function env\(s\)/), call = find(ko, /= env\(session\)/), body = find(ko, /day = d\.toISOString\(\)\.slice\(0, 10\)/);
const tag = find(wo, /say\('  §REPLAY_CLOCK_SESSION_DAY/);
if (!def || !call || !body || !tag) fail('a place was not found def=' + !!def + ' call=' + !!call + ' body=' + !!body + ' tag=' + !!tag);
// the two fragments the fix replaces: [old text, new text]; the new text must be in the merged file, the old text in the buggy one
const F = [['const d = new Date(clock), day = d.toISOString().slice(0, 10);', 'const st = A.Env.stamp(clock);'],
           ["date: day + ' 00:00:00', now: d.toISOString().slice(0, 19).replace('T', ' ')", "date: st.day + ' 00:00:00', now: st.now"]];
const frags = F.map(([o, n]) => { const lo = find(ko, new RegExp(o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))); const ln = kn.findIndex(l => l.indexOf(n) >= 0) + 1;
  if (!lo) fail('old fragment not in the buggy file: ' + o); if (!ln) fail('new fragment not in the merged file: ' + n); return { old: o, neu: n, line: lo.line, col: lo.text.indexOf(o), newLine: ln }; });
console.log(JSON.stringify({ old: OLD, neu: NEW, kernel: KER, witness: WIT, tag: TAG, tagPlace: { rel: WIT, line: tag.line, col: tag.text.indexOf(TAG) + 3 }, call: { line: call.line, col: call.text.indexOf('env(session)') + 1 }, def: { line: def.line, text: def.text.trim().slice(0, 60) }, frags }));
