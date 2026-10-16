// §CUT_GATE_BENCH_CSG — candidate A benchmark: three-bvh-csg Evaluator/Brush/SUBTRACTION against every
// one of the 50 real (non-box) Duplex wall meshes that the live worker's _insertCutBox refuses today.
// Scratch test harness ONLY — no app code. Reads bench/meshes.json (exported read-only from the live
// OCI geo db). Per-element §-log line + aggregate summary, written to a log file (Log Mandate).
const fs = require('fs');
const path = require('path');
const THREE = require('three');
const { Evaluator, Brush, SUBTRACTION, INTERSECTION } = require('three-bvh-csg');

const meshes = JSON.parse(fs.readFileSync(path.join(__dirname, 'meshes.json'), 'utf8'));

function buildGeometry(vertsArr, facesArr) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertsArr), 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint32Array(facesArr), 1));
  geo.computeVertexNormals();
  return geo;
}

function boxGeometry(c1, c2) {
  const dx = c2[0] - c1[0], dy = c2[1] - c1[1], dz = c2[2] - c1[2];
  const geo = new THREE.BoxGeometry(dx, dy, dz);
  geo.translate((c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2, (c1[2] + c2[2]) / 2);
  return geo;
}

// signed tetrahedron-sum volume of an INDEXED triangle mesh (origin-referenced tetrahedra) — standard
// divergence-theorem volume formula, sign-independent of winding consistency for the abs() we report,
// but we ALSO report the raw signed value so a winding defect (negative) is visible, not silently abs'd.
function signedVolume(positions, index) {
  let vol = 0;
  const getV = (i) => {
    const vi = index ? index[i] : i;
    return [positions[vi * 3], positions[vi * 3 + 1], positions[vi * 3 + 2]];
  };
  const triCount = index ? index.length / 3 : positions.length / 9;
  for (let t = 0; t < triCount; t++) {
    const [p1, p2, p3] = [getV(t * 3), getV(t * 3 + 1), getV(t * 3 + 2)];
    // v1 . (v2 x v3) / 6
    const cx = p2[1] * p3[2] - p2[2] * p3[1];
    const cy = p2[2] * p3[0] - p2[0] * p3[2];
    const cz = p2[0] * p3[1] - p2[1] * p3[0];
    vol += (p1[0] * cx + p1[1] * cy + p1[2] * cz) / 6;
  }
  return vol;
}

// watertight/manifold check via edge-pairing, keyed by QUANTIZED VERTEX POSITION not raw buffer index —
// three-bvh-csg's Evaluator output is an UNWELDED triangle soup (every triangle owns its own 3 verts,
// no shared indices even where positions coincide), so an index-keyed pairing would report every edge
// as unpaired regardless of real topology. Position-keyed pairing is the correct, mesh-representation-
// independent test: every undirected edge (by position) must be used by EXACTLY 2 triangles, and the
// DIRECTED edge must appear once in each direction (consistent winding) across those 2 uses.
function edgeManifoldCheck(positions, index, quant = 1e5) {
  const idx = index || null;
  const triCount = idx ? idx.length / 3 : positions.length / 9;
  const getV = (i) => {
    const vi = idx ? idx[i] : i;
    return [positions[vi * 3], positions[vi * 3 + 1], positions[vi * 3 + 2]];
  };
  const pkey = (p) => Math.round(p[0] * quant) + ',' + Math.round(p[1] * quant) + ',' + Math.round(p[2] * quant);
  const dirCount = new Map();   // "pa>pb" -> count
  const undirCount = new Map(); // "min>max" -> count
  for (let t = 0; t < triCount; t++) {
    const p0 = getV(t * 3), p1 = getV(t * 3 + 1), p2 = getV(t * 3 + 2);
    const k0 = pkey(p0), k1 = pkey(p1), k2 = pkey(p2);
    const edges = [[k0, k1], [k1, k2], [k2, k0]];
    for (const [a, b] of edges) {
      const dk = a + '>' + b;
      dirCount.set(dk, (dirCount.get(dk) || 0) + 1);
      const uk = a < b ? a + '>' + b : b + '>' + a;
      undirCount.set(uk, (undirCount.get(uk) || 0) + 1);
    }
  }
  let nonPaired = 0, inconsistentWinding = 0;
  for (const [uk, cnt] of undirCount) {
    if (cnt !== 2) { nonPaired++; continue; }
    const [a, b] = uk.split('>');
    const fwd = dirCount.get(a + '>' + b) || 0;
    const rev = dirCount.get(b + '>' + a) || 0;
    if (!(fwd === 1 && rev === 1)) inconsistentWinding++;
  }
  return { totalEdges: undirCount.size, nonPaired, inconsistentWinding, watertight: nonPaired === 0 && inconsistentWinding === 0 };
}

const evaluator = new Evaluator();
evaluator.attributes = ['position', 'normal'];

const results = [];
let totalMs = 0;
const log = (s) => { console.log(s); };

log('=== §CUT_GATE_BENCH_CSG — candidate A (three-bvh-csg SUBTRACTION) vs 50 real Duplex wall meshes ===');
const _tbcVer = JSON.parse(fs.readFileSync(path.join(__dirname, 'node_modules/three-bvh-csg/package.json'), 'utf8')).version;
const _threeVer = JSON.parse(fs.readFileSync(path.join(__dirname, 'node_modules/three/package.json'), 'utf8')).version;
log('three-bvh-csg version: ' + _tbcVer + '  three version: ' + _threeVer);

for (const m of meshes) {
  const t0 = process.hrtime.bigint();
  let outcome = { guid: m.guid, name: m.name, inTris: m.ntris };
  try {
    const wallGeo = buildGeometry(m.vertices, m.faces);
    const cutGeo = boxGeometry(m.cutbox.c1, m.cutbox.c2);
    const wallBrush = new Brush(wallGeo);
    const cutBrush = new Brush(cutGeo);
    wallBrush.updateMatrixWorld(); cutBrush.updateMatrixWorld();

    const resultBrush = evaluator.evaluate(wallBrush, cutBrush, SUBTRACTION);
    const t1 = process.hrtime.bigint();
    const ms = Number(t1 - t0) / 1e6;
    totalMs += ms;

    const outGeo = resultBrush.geometry;
    const outPos = outGeo.attributes.position.array;
    const outIdx = outGeo.index ? outGeo.index.array : null;
    const outTris = outIdx ? outIdx.length / 3 : outPos.length / 9;

    const volIn = signedVolume(m.vertices, m.faces);
    const volOut = signedVolume(outPos, outIdx);

    // intersection volume (wall ∩ cutbox) for the arithmetic integrity check: volOut ≈ volIn - volIntersect
    const intersectBrush = evaluator.evaluate(wallBrush, cutBrush, INTERSECTION);
    const iGeo = intersectBrush.geometry;
    const volIntersect = signedVolume(iGeo.attributes.position.array, iGeo.index ? iGeo.index.array : null);

    const manifold = edgeManifoldCheck(outPos, outIdx);
    const inputManifold = edgeManifoldCheck(m.vertices, m.faces);   // control: is the INPUT itself watertight?
    const expectedVol = volIn - volIntersect;
    const volErr = Math.abs(volOut - expectedVol);
    const volErrRel = expectedVol !== 0 ? volErr / Math.abs(expectedVol) : volErr;

    outcome = {
      guid: m.guid, name: m.name, inTris: m.ntris, outTris,
      ms: +ms.toFixed(3),
      volIn: +volIn.toFixed(6), volOut: +volOut.toFixed(6), volIntersect: +volIntersect.toFixed(6),
      volErrRel: +volErrRel.toFixed(6),
      watertight: manifold.watertight, nonPaired: manifold.nonPaired, inconsistentWinding: manifold.inconsistentWinding,
      inputWatertight: inputManifold.watertight, inputNonPaired: inputManifold.nonPaired,
      success: true,
    };
    log('§BENCH_A ' + m.guid + ' "' + m.name + '" inTris=' + m.ntris + ' outTris=' + outTris +
        ' ms=' + outcome.ms + ' volIn=' + outcome.volIn + ' volOut=' + outcome.volOut +
        ' volErrRel=' + outcome.volErrRel + ' watertight=' + manifold.watertight +
        ' nonPaired=' + manifold.nonPaired + ' badWind=' + manifold.inconsistentWinding +
        ' inputWatertight=' + inputManifold.watertight + ' inputNonPaired=' + inputManifold.nonPaired);
  } catch (e) {
    const t1 = process.hrtime.bigint();
    const ms = Number(t1 - t0) / 1e6;
    totalMs += ms;
    outcome = { guid: m.guid, name: m.name, inTris: m.ntris, ms: +ms.toFixed(3), success: false, error: String(e && e.message || e) };
    log('§BENCH_A ' + m.guid + ' "' + m.name + '" FAILED ms=' + outcome.ms + ' error=' + outcome.error);
  }
  results.push(outcome);
}

const successes = results.filter(r => r.success);
const failures = results.filter(r => !r.success);
const watertightOk = successes.filter(r => r.watertight);
const volOk = successes.filter(r => r.volErrRel < 1e-3);
const worst = successes.slice().sort((a, b) => b.ms - a.ms)[0];

log('');
log('=== §BENCH_A_SUMMARY ===');
log('total elements: ' + results.length);
log('success: ' + successes.length + '  failed: ' + failures.length);
log('watertight output: ' + watertightOk.length + '/' + successes.length);
log('volume-integrity (relErr<1e-3): ' + volOk.length + '/' + successes.length);
log('total wall-clock ms (all 50): ' + totalMs.toFixed(2));
log('mean ms/element: ' + (totalMs / results.length).toFixed(3));
if (worst) log('worst element: ' + worst.guid + ' "' + worst.name + '" ' + worst.ms + 'ms (inTris=' + worst.inTris + ')');
if (failures.length) {
  log('FAILURE LIST:');
  failures.forEach(f => log('  ' + f.guid + ' "' + f.name + '" — ' + f.error));
}
const volBad = successes.filter(r => r.volErrRel >= 1e-3);
if (volBad.length) {
  log('VOLUME-INTEGRITY FAILURES:');
  volBad.forEach(f => log('  ' + f.guid + ' volErrRel=' + f.volErrRel));
}
const nonWatertight = successes.filter(r => !r.watertight);
if (nonWatertight.length) {
  log('NON-WATERTIGHT OUTPUTS:');
  nonWatertight.forEach(f => log('  ' + f.guid + ' nonPaired=' + f.nonPaired + ' badWind=' + f.inconsistentWinding));
}

fs.writeFileSync(path.join(__dirname, 'bench_result.json'), JSON.stringify({ results, totalMs, successes: successes.length, failures: failures.length, watertightOk: watertightOk.length, volOk: volOk.length }, null, 1));
log('wrote bench_result.json');
