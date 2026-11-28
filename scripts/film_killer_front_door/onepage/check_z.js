// ⚠ DO NOT REMOVE — film "PDF and Excel are killer apps — ONE PAGE": check Z (house style 5): the picture of the lower frame at each step differs from the step before by a measured share of pixels; a step that changes nothing says NO-OP.
// For every typed step of every beat: the still of its return key (the state before) against the still that shows the answer (the state after), the lower frame only (1920 x 537 at y=312), ImageMagick compare -metric AE. Can say NO-OP and INCONCLUSIVE. Usage: node check_z.js <cards dir>. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const dir = path.resolve(process.argv[2] || 'out/cards'), plan = JSON.parse(fs.readFileSync(path.join(dir, 'plan.json'), 'utf8')); let n = 0, noop = 0;
Object.keys(plan).forEach(id => { const st = plan[id]; st.forEach((x, i) => { if (x.key !== 'r') return; const a = st[i], b = st[i + 1]; if (!b) return;
  const crop = (f) => ['(', path.join(dir, f), '-crop', '1920x537+0+312', '+repage', ')'];
  const r = cp.spawnSync('compare', ['-metric', 'AE'].concat(crop(a.file).slice(1, -1).slice(0, 0), [path.join(dir, a.file), path.join(dir, b.file)]), { encoding: 'utf8' });
  const c1 = path.join('/tmp', 'z_a_' + process.pid + '.png'), c2 = path.join('/tmp', 'z_b_' + process.pid + '.png');
  cp.spawnSync('convert', [path.join(dir, a.file), '-crop', '1920x537+0+312', '+repage', c1]); cp.spawnSync('convert', [path.join(dir, b.file), '-crop', '1920x537+0+312', '+repage', c2]);
  const g = cp.spawnSync('compare', ['-metric', 'AE', c1, c2, 'null:'], { encoding: 'utf8' }), ae = parseFloat((g.stderr || '0').split(/\s/)[0]) || 0, share = ae / (1920 * 537); n++;
  if (ae === 0) noop++; console.log('§Z beat=' + id + ' step=' + a.file + '->' + b.file + ' changed_pixels=' + ae + ' share=' + (share * 100).toFixed(2) + '%' + (ae === 0 ? ' NO-OP' : '')); fs.unlinkSync(c1); fs.unlinkSync(c2); }); });
console.log('§Z_VERDICT ' + (n === 0 ? 'INCONCLUSIVE' : noop ? 'FAIL' : 'PASS') + ' steps=' + n + ' no_op=' + noop); process.exit(n === 0 ? 2 : noop ? 1 : 0);
