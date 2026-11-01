#!/usr/bin/env node
// ⚠ DO NOT REMOVE — Scope: TEAMWORK_FRAMEWORK.md §45.15b. The median of N time_o2c runs (twin on sql.js/WASM), so a film number is not one noisy run.
// A run counts only if its verdict is MEASURED 6/6 AND all six §SCN O2C lines MATCH; otherwise the median is INCONCLUSIVE. Prints median [min..max].
// Run: node scripts/bridge/lvl_median.js build/scriptor/beat10_20261102/time_o2c_wasm{1,2,3}.log > .../lvl_median.log
'use strict';
const fs = require('fs'), files = process.argv.slice(2), runs = [];
const num = (t, re) => { const m = re.exec(t); return m ? Number(m[1]) : null; };
files.forEach(f => { const t = fs.readFileSync(f, 'utf8'), match = (t.match(/^§SCN O2C\d-\S+ MATCH/gm) || []).length, ok = /§LVL-VERDICT MEASURED completed_both_sides=6\/6/.test(t) && match === 6 && /§LVL-ENGINE twin=sql\.js/.test(t);
  runs.push({ f, ok, match, overhead: num(t, /§LVL-OVERHEAD .* median=([\d.]+) ms/), twin: num(t, /§LVL-PROFILE-NOLOGIN 4g .* vs twin (\d+) ms/),
    nl_lan: num(t, /§LVL-PROFILE-NOLOGIN lan .*>= (\d+) ms/), nl_4g: num(t, /§LVL-PROFILE-NOLOGIN 4g .*>= (\d+) ms/), nl_poor: num(t, /§LVL-PROFILE-NOLOGIN poor .*>= (\d+) ms/),
    raw_4g: num(t, /§LVL-PROFILE 4g .*per document step: legacy >= (\d+) ms/) }); console.log('§LVL-RUN ' + f.split('/').pop() + ' ok=' + ok + ' match=' + match + '/6'); });
const good = runs.filter(r => r.ok);
if (good.length < files.length || good.length < 3) { console.log('§LVL-MEDIAN-VERDICT INCONCLUSIVE good_runs=' + good.length + '/' + files.length + ' (need every run 6/6 MATCH on sql.js, and at least 3)'); process.exit(2); }
const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
['twin', 'nl_lan', 'nl_4g', 'nl_poor', 'raw_4g', 'overhead'].forEach(k => { const v = good.map(r => r[k]); console.log('§LVL-MEDIAN ' + k + '=' + Math.round(med(v)) + ' range=' + Math.round(Math.min(...v)) + '..' + Math.round(Math.max(...v)) + ' runs=' + v.length); });
console.log('§LVL-MEDIAN-VERDICT MEASURED runs=' + good.length + ' (twin on sql.js; legacy per document = server ms of its writes minus the per-call login, plus one round trip each)');
