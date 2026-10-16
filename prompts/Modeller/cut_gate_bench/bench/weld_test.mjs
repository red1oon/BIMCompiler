import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import fs from 'fs';

const meshes = JSON.parse(fs.readFileSync('meshes.json', 'utf8'));
const m = meshes[0];

function buildGeometry(v, f) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3));
  g.setIndex(new THREE.BufferAttribute(new Uint32Array(f), 1));
  g.computeVertexNormals();
  return g;
}
function boxGeometry(c1, c2) {
  const dx = c2[0] - c1[0], dy = c2[1] - c1[1], dz = c2[2] - c1[2];
  const g = new THREE.BoxGeometry(dx, dy, dz);
  g.translate((c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2, (c1[2] + c2[2]) / 2);
  return g;
}

function edgeCheck(positions, index, quant = 1e4) {
  const idx = index || null;
  const triCount = idx ? idx.length / 3 : positions.length / 9;
  const getV = (i) => { const vi = idx ? idx[i] : i; return [positions[vi * 3], positions[vi * 3 + 1], positions[vi * 3 + 2]]; };
  const pkey = (p) => Math.round(p[0] * quant) + ',' + Math.round(p[1] * quant) + ',' + Math.round(p[2] * quant);
  const undirCount = new Map();
  for (let t = 0; t < triCount; t++) {
    const p0 = getV(t * 3), p1 = getV(t * 3 + 1), p2 = getV(t * 3 + 2);
    const k0 = pkey(p0), k1 = pkey(p1), k2 = pkey(p2);
    for (const [a, b] of [[k0, k1], [k1, k2], [k2, k0]]) {
      const uk = a < b ? a + '>' + b : b + '>' + a;
      undirCount.set(uk, (undirCount.get(uk) || 0) + 1);
    }
  }
  let nonPaired = 0;
  for (const [, cnt] of undirCount) if (cnt !== 2) nonPaired++;
  return nonPaired;
}

const wallGeo = buildGeometry(m.vertices, m.faces);
const cutGeo = boxGeometry(m.cutbox.c1, m.cutbox.c2);
const wallBrush = new Brush(wallGeo);
const cutBrush = new Brush(cutGeo);
wallBrush.updateMatrixWorld(); cutBrush.updateMatrixWorld();
const ev = new Evaluator(); ev.attributes = ['position', 'normal'];
const res = ev.evaluate(wallBrush, cutBrush, SUBTRACTION);

console.log('raw output nonPaired (pre-weld):', edgeCheck(res.geometry.attributes.position.array, res.geometry.index ? res.geometry.index.array : null));

const welded = mergeVertices(res.geometry.clone(), 1e-5);
console.log('welded verts:', welded.attributes.position.count, 'raw verts:', res.geometry.attributes.position.count);
console.log('welded output nonPaired:', edgeCheck(welded.attributes.position.array, welded.index ? welded.index.array : null));

// also weld the INPUT for comparison
const weldedIn = mergeVertices(wallGeo.clone(), 1e-5);
console.log('welded INPUT verts:', weldedIn.attributes.position.count, 'raw INPUT verts:', wallGeo.attributes.position.count);
console.log('welded INPUT nonPaired:', edgeCheck(weldedIn.attributes.position.array, weldedIn.index ? weldedIn.index.array : null));
