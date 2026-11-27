// summ.js <prefix> [names...]: one line per pose from <prefix>_<name>.log + _lum.log
const f = require('fs'), S = '/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad/', [pfx, ...names] = process.argv.slice(2);
const list = names.length ? names : f.readdirSync(S).filter(n => n.startsWith(pfx + '_') && n.endsWith('.log') && !/_lum\.log$/.test(n)).map(n => n.slice(pfx.length + 1, -4));
for (const n of list) { let a, r; try { a = JSON.parse(f.readFileSync(S + pfx + '_' + n + '.log')); r = JSON.parse(f.readFileSync(S + pfx + '_' + n + '_lum.log')).result; } catch (e) { console.log(pfx, n, 'MISSING', e.message); continue; }
  const ln = a.lines || [], g = re => ln.filter(l => re.test(l)), m = g(/§METER/), gl = ((g(/§GLARE/)[0] || '').match(/(PASS|FAIL) black_exterior=(\d+) junction_zone_flip=(\d+) covered_open_side_black=(\d+)/) || []).slice(1).join('/'), cm = ((g(/§GI_STILL result/)[0] || '').match(/compositeMean=[\d.]+/) || [''])[0];
  const fl = ((g(/^§FAULT /)[0] || '').match(/§FAULT (\w+) unlit=[\d\/]+/) || [''])[0];
  console.log(pfx, n, cm, 'GLARE', gl, fl, '| p5/50/95', r.comp.p5 + '/' + r.comp.p50 + '/' + r.comp.p95, 'le15', r.comp.le15pct + '%', 'ge250', r.comp.ge250pct + '%', 'exp', r.exposure, 'verdict', a.verdict);
  m.forEach(x => console.log('    ' + x.slice(0, 480))); g(/§COVE_QUAL/).forEach(x => console.log('    ' + x.slice(0, 300))); }
