// census: triangles per (class, disc) for the OCCLUDERS classes, as boundaryDraws would collect them (instanced x count, batched per instance)
const A = window.APP, OCC = ['IfcMember','IfcBeam','IfcColumn','IfcRailing','IfcStair','IfcStairFlight','IfcBuildingElementProxy','IfcFooting','IfcRamp','IfcRampFlight'];
const cls = new Map(); A.dbQuery("SELECT guid, ifc_class FROM elements_meta WHERE ifc_class IN ('" + OCC.join("','") + "')").forEach(r => cls.set(r[0], r[1]));
const out = {}; const add = (k, n) => { out[k] = (out[k] || 0) + n; };
A.scene.traverse(o => { if (!(o.isMesh || o.isInstancedMesh || o.isBatchedMesh) || !o.geometry) return; if (o === A.ground || o === A._sky || (o.userData && (o.userData.skyPortal || o.userData.excludeFromShadow))) return;
  const g = o.geometry, idx = g.index, full = idx ? idx.count : g.attributes.position.count, disc = (o.userData && o.userData.disc) || '-';
  if (o.isBatchedMesh) { const n = typeof o.instanceCount === 'number' ? o.instanceCount : (o._instanceInfo ? o._instanceInfo.length : 0);
    for (let i = 0; i < n; i++) { const gd = A.guidMap[o.id + '_' + i]; if (!gd || !cls.has(gd)) continue; let rng; try { rng = o.getGeometryRangeAt(o.getGeometryIdAt(i)); } catch (e) { continue; } if (!rng) continue; add(cls.get(gd) + '/' + disc + '/batched', (idx ? rng.indexCount : rng.vertexCount) / 3); } return; }
  const c = o.userData && o.userData.ifcClass; if (!OCC.includes(c)) return; add(c + '/' + disc + (o.isInstancedMesh ? '/inst' : '/mesh'), full / 3 * (o.isInstancedMesh ? o.count : 1)); });
const rows = Object.entries(out).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + Math.round(v));
return { total: Math.round(Object.values(out).reduce((a, b) => a + b, 0)), rows };
