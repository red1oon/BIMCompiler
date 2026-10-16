// ⚠ DO NOT REMOVE — SANDBOX marking tool for the Free Farmhouse set (SPEC §30-§33). Work: Jay Osborne, "American Farmhouse", CC BY-SA
// (https://www.freefarmhouse.com). The DXF is NOT in this repository and must not be committed; pass its path. Writes a MARKED COPY outside the project.
// Proposes markings ONLY from evidence in the file; refuses when ambiguous. Read the log after every run.
// Usage: node tests/dxf2bim/farm_mark.js <path/to/American Farmhouse 2021-03-01.dxf> <out/marked.dxf>
'use strict';
const fs = require('fs'), path = require('path');
const DxfParser = require(path.join(__dirname, '../../deploy/dev/dxf-parser.js'));
const MK = require(path.join(__dirname, '../../deploy/dev/dxf2marks.js'));
const [,, src, out] = process.argv;
const txt = fs.readFileSync(src, 'utf8'), d = new DxfParser().parseSync(txt);
const say = s => console.log(s); let refused = false;
const PLAN = [1632, 6375, 2448, 6903], ELEV = [0, 5319, 816, 5847];            // sheet regions from the BORDER 11X17 inserts (816 x 528 in frames)
const IN = 0.0254;
const inR = (l, r) => l.vertices.every(v => v.x >= r[0] && v.x <= r[2] && v.y >= r[1] && v.y <= r[3]);
const lines = r => d.entities.filter(e => e.type === 'LINE' && inR(e, r));
const clean = t => (t || '').replace(/\\P/g, ' | ').replace(/\{\\[^;]*;/g, '').replace(/[{}]/g, '').replace(/\\[A-Za-z]/g, '').trim();
const ftin = s => { const m = /([+-]?)(\d+)'-(\d+)"/.exec(s); return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 12 + Number(m[3])) : null; };   // inches

// ---- plan: outer wall faces = the longest axis-aligned layer-1 lines at the extremes ----
const Lp = lines(PLAN).filter(l => l.layer === '1');
const longV = Lp.filter(l => Math.abs(l.vertices[0].x - l.vertices[1].x) < 0.01).map(l => ({ x: l.vertices[0].x, len: Math.abs(l.vertices[1].y - l.vertices[0].y), y0: Math.min(l.vertices[0].y, l.vertices[1].y), y1: Math.max(l.vertices[0].y, l.vertices[1].y) })).filter(l => l.len >= 150);
const longH = Lp.filter(l => Math.abs(l.vertices[0].y - l.vertices[1].y) < 0.01).map(l => ({ y: l.vertices[0].y, x0: Math.min(l.vertices[0].x, l.vertices[1].x), x1: Math.max(l.vertices[0].x, l.vertices[1].x) }));
const west = longV.slice().sort((a, b) => a.x - b.x)[0];                                       // single 192 in line = west face
say('plan west face candidate: x=' + west.x + ' spans y ' + west.y0 + '..' + west.y1 + ' (len ' + west.len + ')');
const southY = Math.min(...longH.filter(l => l.x1 - l.x0 >= 50).map(l => l.y)), northY = west.y1;
// east face: a vertical layer-1 line at x = west.x + width where width comes from the south wall segments' overall extent
const southSegs = longH.filter(l => Math.abs(l.y - southY) < 0.01);
const eastX = Math.max(...southSegs.map(l => l.x1)), westX = Math.min(...southSegs.map(l => l.x0));
const eastLines = Lp.filter(l => Math.abs(l.vertices[0].x - l.vertices[1].x) < 0.01 && Math.abs(l.vertices[0].x - eastX) < 0.01);
if (westX !== west.x || !eastLines.length) { say('REFUSE: plan faces disagree (south wall x ' + westX + '..' + eastX + ', west line ' + west.x + ', east lines ' + eastLines.length + ')'); refused = true; }
const width = eastX - westX, depth = northY - southY;
say('plan faces: west x=' + westX + ' east x=' + eastX + ' (width ' + width + ' in = ' + width / 12 + "') south y=" + southY + ' north y=' + northY + ' (depth ' + +depth.toFixed(2) + ' in)');

// ---- elevation: wall faces = layer-1 vertical lines whose separation equals the plan width (unique pair) ----
const Le = lines(ELEV).filter(l => l.layer === '1' && Math.abs(l.vertices[0].x - l.vertices[1].x) < 0.01);
const xs = [...new Set(Le.map(l => +l.vertices[0].x.toFixed(2)))].sort((a, b) => a - b), pairs = [];
for (const a of xs) for (const b of xs) if (b > a && Math.abs((b - a) - width) <= 0.01) pairs.push([a, b]);
say('elevation layer-1 vertical x candidates=' + xs.length + ' pairs separated by the plan width (' + width + '): ' + JSON.stringify(pairs));
// evidence rule: a wall face continues below the 1st floor level line into the foundation; roof edges do not. Keep pairs where BOTH lines reach below the floor line.
const floorY = Math.min(...lines(ELEV).filter(l => l.layer === '3' && /CENTER/i.test(l.lineType || '') && Math.abs(l.vertices[0].y - l.vertices[1].y) < 0.01).map(l => l.vertices[0].y));
const reachesBelow = x => Le.some(l => Math.abs(l.vertices[0].x - x) < 0.01 && Math.min(l.vertices[0].y, l.vertices[1].y) < floorY - 5);
const wallPairs = pairs.filter(([a, b]) => reachesBelow(a) && reachesBelow(b));
say('  floor level line y=' + floorY.toFixed(3) + '; pairs whose both lines reach below it (foundation): ' + JSON.stringify(wallPairs));
if (wallPairs.length !== 1) { say('REFUSE: ' + wallPairs.length + ' candidate wall-face pairs (need exactly 1)'); refused = true; }
pairs.length = 0; wallPairs.forEach(p => pairs.push(p));

// ---- exclusion regions: runs of equally spaced (3.5 in) parallel layer-1 lines = decking/boards, not walls (SPEC §34 X1) ----
const Vs = Lp.filter(l => Math.abs(l.vertices[0].x - l.vertices[1].x) < 0.01).map(l => ({ x: l.vertices[0].x, y0: Math.min(l.vertices[0].y, l.vertices[1].y), y1: Math.max(l.vertices[0].y, l.vertices[1].y) }));
const grp = {}; Vs.forEach(l => { const k = l.y0.toFixed(0) + '/' + l.y1.toFixed(0); (grp[k] = grp[k] || []).push(l); });   // lines with (nearly) the same extent
const runs = []; Object.values(grp).forEach(g => { g.sort((a, b) => a.x - b.x); let cur = [g[0]]; for (let i = 1; i < g.length; i++) { if (Math.abs(g[i].x - g[i - 1].x - 3.5) <= 0.01) cur.push(g[i]); else { if (cur.length >= 3) runs.push(cur); cur = [g[i]]; } } if (cur.length >= 3) runs.push(cur); });
const zones = []; runs.forEach(r => { const y0 = Math.min(...r.map(l => l.y0)), y1 = Math.max(...r.map(l => l.y1)), z = zones.find(q => Math.abs(q.y0 - y0) < 8 && Math.abs(q.y1 - y1) < 8); const xs = r.map(l => l.x); if (z) { z.x0 = Math.min(z.x0, ...xs); z.x1 = Math.max(z.x1, ...xs); z.n += r.length; z.runs++; } else zones.push({ y0, y1, x0: Math.min(...xs), x1: Math.max(...xs), n: r.length, runs: 1 }); });
// size each zone from ALL layer-1 vertical lines whose extent lies inside the zone's y-range (decking boards and the rim beams around them), not from the boards only
zones.forEach(z => { const inside = Vs.filter(l => l.y0 >= z.y0 - 8 && l.y1 <= z.y1 + 2); z.x0 = Math.min(z.x0, ...inside.map(l => l.x)); z.x1 = Math.max(z.x1, ...inside.map(l => l.x)); z.n = inside.length; });
const excludes = zones.map(z => [z.x0 - 2, z.y0 - 2, z.x1 + 2, z.y1 + 0.2].map(v => +v.toFixed(2)));
say('decking runs: ' + runs.length + ' runs, ' + runs.reduce((n, r) => n + r.length, 0) + ' lines in ' + zones.length + ' zones -> @EXCLUDE ' + JSON.stringify(excludes));
// the exclusion rectangles must not swallow any wall-face line end: check the outer faces stay outside
const faceYs = [southY, northY], bad = excludes.filter(r => faceYs.some(y => y >= r[1] && y <= r[3]));
if (bad.length) { say('REFUSE: an exclusion rectangle covers a wall face line: ' + JSON.stringify(bad)); refused = true; }

// ---- levels: level text (feet-inches) paired with the nearest CENTER-linetype horizontal line on layer 3 ----
const T = d.entities.filter(e => (e.type === 'MTEXT' || e.type === 'TEXT') && e.position && e.position.x >= ELEV[0] && e.position.x <= ELEV[2] && e.position.y >= ELEV[1] && e.position.y <= ELEV[3]).map(e => ({ t: clean(e.text), p: e.position }));
const levelTexts = T.filter(x => /^\+\d+'-\d+"/.test(x.t)).map(x => ({ inches: ftin(x.t), y: x.p.y, t: x.t }));
const centerLines = lines(ELEV).filter(l => l.layer === '3' && /CENTER/i.test(l.lineType || '') && Math.abs(l.vertices[0].y - l.vertices[1].y) < 0.01).map(l => l.vertices[0].y);
const zs = levelTexts.map(lt => { const near = centerLines.map(y => ({ y, dy: Math.abs(y - lt.y) })).sort((a, b) => a.dy - b.dy)[0];
  say('  level text ' + JSON.stringify(lt.t) + ' (' + lt.inches + ' in) y=' + lt.y + ' -> nearest CENTER line y=' + near.y + ' (dy ' + near.dy.toFixed(2) + ')'); return { inches: lt.inches, y: near.y, dy: near.dy }; });
if (zs.length < 2 || zs.some(z => z.dy > 6)) { say('REFUSE: level pairing ambiguous'); refused = true; }

// ---- elevation openings (SPEC §36 O1): horizontal extent from the drawing, vertical extent from the PRINTED dimension strings ----
const Y_FLOOR = Math.min(...zs.map(z => z.y));                                                    // 1st floor level line (z = 0)
const rowAt = rel => lines(ELEV).filter(l => Math.abs(l.vertices[0].y - l.vertices[1].y) < 0.01 && Math.abs((l.vertices[0].y - Y_FLOOR) - rel) < 0.05).map(l => [Math.min(l.vertices[0].x, l.vertices[1].x), Math.max(l.vertices[0].x, l.vertices[1].x)]).sort((a, b) => a[0] - b[0]);
const row60 = rowAt(60), faceW = pairs[0][0], faceE = pairs[0][1];
const sidingGaps = []; { let cur = faceW; row60.forEach(sg => { if (sg[0] > cur + 1 && sg[0] < faceE) sidingGaps.push([cur, sg[0]]); cur = Math.max(cur, sg[1]); }); }
const openingGaps = sidingGaps.filter(g => g[1] - g[0] >= 20);                                     // trim/corner gaps are 4-5.5 in; openings are >= 20 in
const tallVerticalsAt = x => lines(ELEV).some(l => Math.abs(l.vertices[0].x - l.vertices[1].x) < 0.01 && Math.abs(l.vertices[0].x - x) < 0.02 && Math.abs(Math.min(l.vertices[0].y, l.vertices[1].y) - Y_FLOOR) < 2 && Math.abs(l.vertices[1].y - l.vertices[0].y) > 80);
// sill and window height from the drawing's own vertical DIMENSION entities: one starting at the floor line (floor -> sill), the next starting at that sill (sill -> head)
const dimsE = d.entities.filter(e => e.type === 'DIMENSION' && e.linearOrAngularPoint1 && e.linearOrAngularPoint2 && e.middleOfText && e.middleOfText.x >= ELEV[0] && e.middleOfText.x <= ELEV[2] && e.middleOfText.y >= ELEV[1] && e.middleOfText.y <= ELEV[3])
  .map(e => ({ h: e.handle, y1: e.linearOrAngularPoint1.y - Y_FLOOR, y2: e.linearOrAngularPoint2.y - Y_FLOOR, m: Number(e.actualMeasurement) }));
const dSill = dimsE.filter(q => Math.abs(q.y1) < 0.5 && q.y2 > 6 && Math.abs((q.y2 - q.y1) - q.m) < 0.1), dHead = dSill.length === 1 ? dimsE.filter(q => Math.abs(q.y1 - dSill[0].y2) < 0.5 && q.y2 > q.y1 && Math.abs((q.y2 - q.y1) - q.m) < 0.1) : [];
say('vertical dimensions in the elevation: ' + JSON.stringify(dimsE.map(q => [q.h, +q.y1.toFixed(1), +q.y2.toFixed(1), +q.m.toFixed(2)])));
if (dSill.length !== 1 || dHead.length !== 1) { say('REFUSE: floor->sill / sill->head dimensions not unique (' + dSill.length + ', ' + dHead.length + ')'); refused = true; }
const SILL = dSill.length ? Math.round(dSill[0].y2) : 0, WIN_TOP = dHead.length ? Math.round(dHead[0].y2) : 0, WIN_H = WIN_TOP - SILL;
say('window vertical extent from DIMENSION entities ' + (dSill[0] && dSill[0].h) + ' (floor->' + SILL + ' in) and ' + (dHead[0] && dHead[0].h) + ' (' + SILL + '->' + WIN_TOP + ' in)');
// door height from the leaf lines: the inner vertical lines (6 in inside the casing) that start at the floor line
const doorTop = gp => { const xs = [gp[0] + 6, gp[1] - 6]; const tops = lines(ELEV).filter(l => Math.abs(l.vertices[0].x - l.vertices[1].x) < 0.01 && xs.some(x => Math.abs(l.vertices[0].x - x) < 0.02) && Math.abs(Math.min(l.vertices[0].y, l.vertices[1].y) - Y_FLOOR) < 2).map(l => Math.max(l.vertices[0].y, l.vertices[1].y) - Y_FLOOR); return tops.length ? Math.round(Math.max(...tops)) : null; };
const openMarks = [];
openingGaps.forEach(gp => {
  const isDoor = tallVerticalsAt(gp[0]) && tallVerticalsAt(gp[1]);
  const dh = isDoor ? doorTop(gp) : null; if (isDoor && dh === null) { say('REFUSE: door leaf lines not found'); refused = true; }
  const kind = isDoor ? 'door' : 'window', y0 = isDoor ? 0 : SILL, y1 = isDoor ? dh : SILL + WIN_H;
  openMarks.push('@OPENING=' + kind + ',' + gp[0] + ',' + +(Y_FLOOR + y0).toFixed(3) + ',' + gp[1] + ',' + +(Y_FLOOR + y1).toFixed(3));
  say('  opening ' + kind + ': h ' + gp[0].toFixed(2) + '..' + gp[1].toFixed(2) + ' (' + (gp[1] - gp[0]).toFixed(2) + ' in, siding gap' + (isDoor ? ' with casing lines from the floor line' : '') + '), z ' + y0 + '..' + y1 + ' in above the 1st floor [' + (isDoor ? 'door leaf lines ' + dh + ' in high' : 'DIMENSION entities: sill ' + SILL + ' in, head ' + WIN_TOP + ' in') + ']');
});
{ const rowsWithGap = []; for (let rel = 6; rel <= 96; rel += 6) { const rw = rowAt(rel), has = rw.some(sg => sg[0] <= 273 + 0.5 && sg[1] >= 273 - 0.5) && rw.some(sg => sg[0] <= 315 + 0.5 && sg[1] >= 315 - 0.5) && !rw.some(sg => sg[0] < 290 && sg[1] > 298); if (has) rowsWithGap.push(rel); }
  say('  evidence note: siding rows broken by the left window gap are at rel y ' + JSON.stringify(rowsWithGap) + ' (the gap spans rows ' + Math.min(...rowsWithGap) + '..' + Math.max(...rowsWithGap) + ', i.e. about 18..96 in), while the drawing\'s own dimension entities give ' + SILL + '..' + WIN_TOP + ' in: a one-course (6 in) disagreement, not resolved; the marks use the dimension entities'); }
if (openMarks.length !== 3) { say('REFUSE: expected 3 openings in the south elevation (2 windows + door), found ' + openMarks.length); refused = true; }

if (refused) { say('REFUSED: no marked copy written'); process.exit(1); }
// ---- marks ----
const [ew, ee] = pairs[0];
const P = (t, x, y) => ({ text: t, x: x, y: y });
const px = PLAN[0] + 5, py = PLAN[1] + 5, ex = ELEV[0] + 5, ey = ELEV[1] + 5;
const marks = [
  P('@REGION=' + PLAN.join(','), PLAN[0], PLAN[1]), P('@SET=FARM', px, py), P('@VIEW=PLAN', px, py), P('@NAME=1ST FLOOR PLAN', px, py), P('@UNITS=in', px, py), P('@LEVEL=0', px, py),
  ...excludes.map(r => P('@EXCLUDE=' + r.join(','), r[0], r[1])), P('@GRIDX=WEST_FACE', westX, py), P('@GRIDX=EAST_FACE', eastX, py), P('@GRIDY=SOUTH_FACE', px, southY), P('@GRIDY=NORTH_FACE', px, northY),
  P('@REGION=' + ELEV.join(','), ELEV[0], ELEV[1]), P('@SET=FARM', ex, ey), P('@VIEW=ELEV', ex, ey), P('@NAME=SOUTH ELEVATION', ex, ey), P('@UNITS=in', ex, ey), P('@FACE=minY', ex, ey), P('@HAXIS=+X', ex, ey),
  P('@GRIDH=WEST_FACE', ew, ey), P('@GRIDH=EAST_FACE', ee, ey)];
zs.forEach(z => marks.push(P('@Z=' + +(z.inches * IN).toFixed(6), ex, z.y)));
openMarks.forEach(t => marks.push(P(t, ex, ey)));
fs.writeFileSync(out, MK.writeMarks(txt, marks));
say('marks written: ' + marks.length + ' -> ' + out);
say('HAXIS=+X is the sign that makes both face pairs agree: plan x = h + ' + (westX - ew) + ' (west) / ' + (eastX - ee) + ' (east)');
