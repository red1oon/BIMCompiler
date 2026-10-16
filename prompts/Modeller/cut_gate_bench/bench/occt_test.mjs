import { OcctKernel } from './occt/index.mjs';

const t0 = Date.now();
const kernel = await OcctKernel.init();
console.log('init ms', Date.now() - t0);

const box = kernel.makeBox(1, 0.15, 2.6);
const mesh = kernel.tessellate(box);
console.log('box tris', mesh.triangleCount);

// time a single box-cut (mirrors GEOM_CUT: kernel.cut(wallBox, voidBox))
function timeCut(n) {
  const t1 = Date.now();
  for (let i = 0; i < n; i++) {
    const wallBox = kernel.makeBox(4.5, 0.15, 2.6);
    const voidBox = kernel.makeBoxFromCorners({ x: 1, y: -0.1, z: 0.8 }, { x: 2, y: 0.25, z: 2.0 });
    const cutResult = kernel.cut(wallBox, voidBox);
    kernel.release(voidBox);
    kernel.release(cutResult);
  }
  return Date.now() - t1;
}

const single = timeCut(1);
console.log('single box-cut ms (cold)', single);
const n50 = timeCut(50);
console.log('50 box-cuts total ms', n50, 'mean ms/cut', (n50 / 50).toFixed(3));
// worst-case fan-out for candidate B: 7 layers (party wall) x 50 elements = 350 box-cuts
const n350 = timeCut(350);
console.log('350 box-cuts (7-layer x 50 elements worst-case fan-out) total ms', n350, 'mean ms/cut', (n350 / 350).toFixed(3));

// REAL building-scale number: the ACTUAL 184 per-layer box-cuts needed to cover all 50 Duplex
// refusing wall-class elements under candidate B (sum of component_geometry_layers rows per element,
// from classify_result.json — every layer gets the SAME void box cut through it).
const n184 = timeCut(184);
console.log('184 box-cuts (REAL total layer-rows across the 50 Duplex refusals) total ms', n184, 'mean ms/cut', (n184 / 184).toFixed(3));
