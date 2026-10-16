// §COVE_NO_STRIP witness: meshes named cove_strip / userData.coveStrip in the scene, program count, GPU programs list size
const A = window.APP; let strip = 0, basic = 0; A.scene.traverse(o => { if (o.name === 'cove_strip' || (o.userData && o.userData.coveStrip)) strip++; });
const info = A.renderer.info; return { stripMeshes: strip, programs: info.programs ? info.programs.length : null, geometries: info.memory.geometries, textures: info.memory.textures };
