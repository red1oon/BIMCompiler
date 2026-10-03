// W-FLYAROUND_ARC maths, CPU: extract _arcPlan from effects.js and check endpoints, direction, overshoot, ease.
const src = require('fs').readFileSync('/tmp/wt-fastbake/viewer/effects.js', 'utf8');
const body = src.slice(src.indexOf('  function _arcPlan('), src.indexOf('  A.cinemaPathPlan = function('));
const _arcPlan = eval('(' + body.trim() + ')');
const A = { cam: [10, 5, 0], tgt: [0, 0, 0] }, B = { cam: [1, 6, 13], tgt: [1, 0, 1] };   // B: 90 deg ccw-ish, other target
for (const dir of ['short', 'cw']) {
  const P = _arcPlan(40, { a: A, b: B, sec: 40, overshootDeg: 15, dir });
  const p0 = P.poseAt(0), p1 = P.poseAt(1), v0 = Math.hypot(P.poseAt(0.001).x - p0.x, P.poseAt(0.001).z - p0.z), vm = Math.hypot(P.poseAt(0.501).x - P.poseAt(0.5).x, P.poseAt(0.501).z - P.poseAt(0.5).z);
  console.log(dir, 'naturalTotal', P.naturalTotal, 'start', JSON.stringify(p0, (k, v) => typeof v === 'number' ? +v.toFixed(2) : v), 'speedRatio start/mid', (v0 / vm).toFixed(4));
}
