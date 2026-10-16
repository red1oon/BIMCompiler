// FIELD_DIRS weights, copied from light_zones.js (CIE overcast cos-weighted, nearest-direction partition of the plane y=1, |x|,|z|<=6)
var D = [[0, 0]]; for (var dx = -2; dx <= 2; dx++) for (var dz = -2; dz <= 2; dz++) if (dx || dz) D.push([dx, dz]);
[4, 6].forEach(function (k) { [[k, 0], [-k, 0], [0, k], [0, -k], [k, k], [k, -k], [-k, k], [-k, -k]].forEach(function (q) { D.push(q); }); });
var U = D.map(function (q) { var l = Math.sqrt(q[0] * q[0] + 1 + q[1] * q[1]); return [q[0] / l, 1 / l, q[1] / l]; }), W = new Float64Array(D.length), st = 0.05, tot = 0;
for (var x = -6 + st / 2; x < 6; x += st) for (var z = -6 + st / 2; z < 6; z += st) {
  var r = Math.sqrt(x * x + 1 + z * z), ux = x / r, uy = 1 / r, uz = z / r, best = -2, bi = 0;
  for (var i = 0; i < U.length; i++) { var dd = ux * U[i][0] + uy * U[i][1] + uz * U[i][2]; if (dd > best) { best = dd; bi = i; } }
  var w = uy * (1 + 2 * uy) * st * st / (r * r * r); W[bi] += w; tot += w; }
var rows = D.map((q, i) => ({ d: q.join(','), w: +(W[i] / tot).toFixed(4), elev: +(Math.asin(U[i][1]) * 180 / Math.PI).toFixed(1) }));
var zen = rows.find(r => r.d === '0,0').w, strip = rows.filter(r => r.d.split(',')[0] === '0').reduce((a, r) => a + r.w, 0), pos = rows.filter(r => +r.d.split(',')[0] > 0).reduce((a, r) => a + r.w, 0);
console.log('total dirs', D.length, 'zenith w', zen.toFixed(4), 'dx=0 strip', strip.toFixed(4), 'dx>0 half', pos.toFixed(4));
console.log(rows.sort((a, b) => b.w - a.w).slice(0, 12).map(r => r.d + ':' + r.w).join('  '));
// truncation: the plane square |x|,|z|<=6 covers elevations >= ~6.7 deg at the corners; what fraction of the true CIE cos-weighted hemisphere lies outside it?
var inside = 0, all = 0, s2 = 0.01;
for (var ex = -60; ex < 60; ex += s2) for (var ez = -60; ez < 60; ez += s2) { var xx = ex + s2 / 2, zz = ez + s2 / 2, rr = Math.sqrt(xx * xx + 1 + zz * zz), w2 = (1 / rr) * (1 + 2 / rr) * s2 * s2 / (rr * rr * rr); all += w2; if (Math.abs(xx) <= 6 && Math.abs(zz) <= 6) inside += w2; }
console.log('weight of the |x|,|z|<=6 square vs the whole hemisphere (approx to 60):', (inside / all).toFixed(4), ' analytic total 7pi/3=', (7 * Math.PI / 3).toFixed(3), 'numeric', all.toFixed(3));
