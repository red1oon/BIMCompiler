// ⚠ DO NOT REMOVE — Scope: narration TSV for "uniCenta POS, reborn" (prompts/POS_PLUGIN_LOCAL_FIRST.md §34), the film6 fit format (id, start, end, source, short, detail "F: .. | M: .."). Text = narr.js (script_en.md verbatim).
// LIVE column: the facts a beat speaks that the recording re-derives (§TILLFILM_FACT) are named in the source column as "LIVE:<key>"; the rest as "<key>@<log>".
// Usage: node tsv.js measure <workDir>            cue 0 / end 999 (to measure each line's spoken length)
//        node tsv.js build <workDir> <timeline.json>   cues from the assembled timeline (assemble.js: measured segment starts)
'use strict';
const fs = require('fs'), path = require('path'), N = require('./narr.js');
const R = JSON.parse(fs.readFileSync(path.join(__dirname, 'out', 'facts.resolved.json'), 'utf8'));
const [mode, a1, a2] = process.argv.slice(2); const work = path.resolve(a1); fs.mkdirSync(work, { recursive: true });
const TL = mode === 'build' ? JSON.parse(fs.readFileSync(a2, 'utf8')) : null;
const src = b => b.facts.map(k => R[k].live ? 'LIVE:' + k : k + '@' + path.basename(R[k].src)).join(',') || '(no figures)';
const rows = N.beats.filter(b => b.text).map(b => { let s = 0, e = 999; if (TL) { const x = TL.find(t => t.id === b.id); if (!x && process.env.PARTIAL) return null; if (!x) throw new Error('timeline lacks ' + b.id); s = x.start; e = x.end; }
  const t = b.text.replace(/\s+/g, ' ').trim(); return [b.id, s.toFixed(3), e.toFixed(3), 'script_en.md ' + b.id + ' ' + src(b), t, t].join('\t'); }).filter(Boolean);
fs.writeFileSync(path.join(work, 'narration_en.tsv'), rows.join('\n') + '\n');
console.log('§TSV mode=' + mode + ' narrated=' + rows.length + ' beats=' + N.beats.length);
