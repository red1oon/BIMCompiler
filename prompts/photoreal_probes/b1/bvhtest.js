// unit check: three-mesh-bvh 0.8.0 indirect BVH on NON-indexed geometry — raycast faceIndex = original triangle, shapecast any-hit works
const P = new Float32Array([ -1,5,-1, 1,5,-1, 0,5,1,   -1,10,-1, 1,10,-1, 0,10,1,   9,0,9, 10,0,9, 9,0,10 ]);
const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.computeBoundsTree({ indirect: true, maxLeafTris: 1 });
const ray = new THREE.Ray(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)), hp = new THREE.Vector3();
const hs = g.boundsTree.raycast(ray, THREE.DoubleSide).map(h => [h.faceIndex, +h.distance.toFixed(2)]).sort((a, b) => a[1] - b[1]);
const any = g.boundsTree.shapecast({ intersectsBounds: b => ray.intersectsBox(b) ? 1 : 0, intersectsTriangle: t => ray.intersectTriangle(t.a, t.b, t.c, false, hp) !== null });
ray.origin.set(9.2, -1, 9.2); const hs2 = g.boundsTree.raycast(ray, THREE.DoubleSide).map(h => h.faceIndex);
ray.origin.set(50, 0, 50); const none = g.boundsTree.shapecast({ intersectsBounds: b => ray.intersectsBox(b) ? 1 : 0, intersectsTriangle: t => ray.intersectTriangle(t.a, t.b, t.c, false, hp) !== null });
return { hs, any, hs2, none, indexAfter: !!g.index, expect: 'hs=[[0,5],[1,10]] any=true hs2=[2] none=false' };
