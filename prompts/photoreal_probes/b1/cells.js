// B1 interior-leak guard: named world points -> cell, raw zone value, covered/open/solid, SKY_BIT, F (cell G) and the field read
// with an upward normal. window.__b1pts = [[name, x, y, z], ...] (defaults: the approved-ref camera points + a roofed room each)
const LZ = window.LightZones, Z = LZ.get(); if (!Z || !Z.field) return { err: 'no zones/field' };
const pts = window.__b1pts || [];
const nx = Z.nx, ny = Z.ny, nxy = nx * ny, SOLID = 65535, MASK = 0x3FFF, G = Z.field.G;
return { bld: Z.bld, zones: Z.zones, indoorCells: Z.stats.indoorCells, largestZoneM3: Z.stats.largestZoneM3, largestShare: Z.stats.largestShareOfIndoor, openSky: Z.stats.openSkyCells, solid: Z.stats.solid, capCells: Z.stats.capCells, capSkipped: Z.stats.capSkipped,
  rows: pts.map(p => { const q = { x: p[1], y: p[2], z: p[3] }, raw = LZ.atRaw(q), i = Math.floor((q.x - Z.org.x) / Z.cell), j = Math.floor((q.y - Z.org.y) / Z.cell), k = Math.floor((q.z - Z.org.z) / Z.cell), c = i + j * nx + k * nxy;
    let capH = -1; if (raw !== -1 && raw !== SOLID) for (let jj = j + 1; jj < ny; jj++) if (Z.zone[i + jj * nx + k * nxy] === SOLID) { capH = jj - j; break; }
    const fr = LZ.skyField(q, { x: 0, y: 1, z: 0 });
    return { name: p[0], cell: c, raw, cls: raw === -1 ? 'off' : raw === SOLID ? 'SOLID' : (raw & MASK) === 0 ? 'OPEN' : 'COVERED', zone: raw === -1 || raw === SOLID ? null : raw & MASK, skyBit: raw !== -1 && raw !== SOLID && (raw & 0x4000) ? 1 : 0, Fcell: raw === -1 || raw === SOLID ? null : G[c] / 10000, Fread: fr.F, capCellsAbove: capH }; }) };
