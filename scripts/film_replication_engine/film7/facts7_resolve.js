#!/usr/bin/env node
// ⚠ DO NOT REMOVE — film7 fact resolver. Every number the film shows or says is read HERE from a log line written THIS session (log mtime >= cutoff). READ the §FILM-MA-FACT lines.
// usage: node facts7_resolve.js <builddir> <cutoff-epoch-s>  -> facts7.resolved.json {id:{value,src,line}}; exit 2 on any missing / stale fact.
'use strict';
const fs = require('fs'), path = require('path');
const B = process.argv[2], CUT = Number(process.argv[3]), LOGS = '/tmp/count_logs', spec = JSON.parse(fs.readFileSync(path.join(__dirname, 'facts7_spec.json'), 'utf8')).facts, out = {}; let bad = 0;
for (const f of spec) {
  const p = f.file === 'record' ? path.join(B, 'record.log') : f.file === 'term' ? path.join(B, 'term', 'term_sap.txt') : f.file === 'prep' ? path.join(B, 'prep.log') : path.join(LOGS, f.file);
  if (!fs.existsSync(p)) { console.log('§FILM-MA-FACT MISSING-LOG ' + f.id + ' ' + p); bad++; continue; }
  const mt = fs.statSync(p).mtimeMs / 1000; if (mt < CUT) { console.log('§FILM-MA-FACT STALE ' + f.id + ' ' + f.file + ' mtime<cutoff'); bad++; continue; }
  const lines = fs.readFileSync(p, 'utf8').split('\n'), re = new RegExp(f.re); let hit = -1, m;
  for (let i = 0; i < lines.length; i++) { m = re.exec(lines[i].replace(/^\s+/, f.re.startsWith('^') ? '' : '')); if (m) { hit = i; break; } }
  if (hit < 0) { console.log('§FILM-MA-FACT NOTFOUND ' + f.id + ' ' + f.file); bad++; continue; }
  out[f.id] = { value: m[1], kind: f.kind, src: path.basename(p) + ':' + (hit + 1), line: lines[hit].trim().slice(0, 200) };
  console.log('§FILM-MA-FACT ' + f.id + '=' + m[1] + ' src=' + out[f.id].src);
}
fs.writeFileSync(path.join(B, 'facts7.resolved.json'), JSON.stringify(out, null, 1));
console.log('§FILM-MA-FACTS resolved=' + Object.keys(out).length + ' missing=' + bad); process.exit(bad ? 2 : 0);
