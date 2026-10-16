// zsumm.js <prefix> [names]: per pose EV100 of every §METER line, p50/le15/ge250, §GLARE, stagingTotal, programs, plus Z lines
const f = require('fs'), S = '/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad/', [pfx, ...names] = process.argv.slice(2);
const list = names.length ? names : f.readdirSync(S).filter(n => n.startsWith(pfx + '_') && n.endsWith('.log') && !/_(lum|zpatch|esc|darkcls|darkapp)\.log$/.test(n)).map(n => n.slice(pfx.length + 1, -4));
for (const n of list) { let a, r, z, e; try { a = JSON.parse(f.readFileSync(S + pfx + '_' + n + '.log')); r = JSON.parse(f.readFileSync(S + pfx + '_' + n + '_lum.log')).result; } catch (x) { console.log(pfx, n, 'MISSING', x.message); continue; }
  try { z = JSON.parse(f.readFileSync(S + pfx + '_' + n + '_zpatch.log')).result; } catch (x) {} try { e = JSON.parse(f.readFileSync(S + pfx + '_' + n + '_esc.log')).lines; } catch (x) {}
  const L = a.lines || [], g = re => L.filter(l => re.test(l)), ev = g(/§METER camera/).map(l => (l.match(/EV100=([\d.]+)/) || [])[1]), gl = ((g(/§GLARE/)[0] || '').match(/(PASS|FAIL) black_exterior=(\d+) junction_zone_flip=(\d+) covered_open_side_black=(\d+)/) || []).slice(1).join('/');
  const stg = ((g(/§STILL_STAGE_MS/)[0] || '').match(/stagingTotal=(\d+)/) || [])[1], pe = a.guard ? a.guard.pageError : '?';
  console.log(pfx, n, a.verdict === 'DONE' ? '' : a.verdict, 'EV100', ev.join(' -> '), '| p50', r.comp.p50, 'le15', r.comp.le15pct + '%', 'ge250', r.comp.ge250pct + '%', '| GLARE', gl, 'pageErr', pe, 'stage', stg, 'programs', r.programs, ((g(/§GI_STILL result/)[0] || '').match(/compositeMean=[\d.]+/) || [''])[0]);
  if (z) console.log('    patch', JSON.stringify(z.patch), 'SUNLIT', JSON.stringify(z.SUNLIT), 'shadedSide', JSON.stringify(z.shadedSide));
  g(/§ALBEDO_SRGB|§GROUND_HALF|§CAM_TORCH|§AO_INDIRECT|§GI_RECEIVER_ALBEDO|§SUN_PENUMBRA/).forEach(l => console.log('    ' + l.slice(0, 260)));
  (e || []).forEach(l => console.log('    esc: ' + l.slice(0, 200))); }
