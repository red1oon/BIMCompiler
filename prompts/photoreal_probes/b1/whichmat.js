// which object carries the material whose colour staging changed (vs __matSnap)
const A = window.APP, snap = window.__matSnap || {}, out = [];
A.scene.traverse(o => { if (!o.material) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m && m.color && (m.uuid in snap) && snap[m.uuid] !== m.color.getHex()) out.push({ obj: o.name || o.type, isGround: o === A.ground, cls: o.userData && o.userData.ifcClass, before: snap[m.uuid].toString(16), after: m.color.getHexString(), map: !!m.map, mapName: m.map && (m.map.name || (m.map.image && m.map.image.src || '').slice(-40)) }); }); });
return out.slice(0, 5);
