// ⚠ DO NOT REMOVE — set configs shared by the sandbox scripts (moved here verbatim, not copied: the scripts import them).
// DX: rosetta_dx_shell.js (Duplex marked set). FARM: farm_heights.js (Farmhouse, CC BY-SA, file not in repo). JSCAD: t8_sandbox.js (SANDBOX seed).
// Values are unchanged from their scripts; their comments there still state the source of each value.
'use strict';
const IN = 0.0254;
// ---- DX (rosetta_dx_shell.js): ONE source, deploy/dev/dxf2shell_config.js (also copied verbatim into the Modeller import) ----
const _DX = require('../../deploy/dev/dxf2shell_config.js');
const DX_MAP_PLAN = _DX.MAP_PLAN, DX_MAP_ELEV = _DX.MAP_ELEV, DX_MAP_LEVL = _DX.MAP_LEVL, DX_MAP_ROOF = _DX.MAP_ROOF, DX_CFG = _DX.CFG;
const FARM_MAP = { version: 1, rules: [{ match: 'exact', pattern: '1', type: 'wallline' }].concat(['0', '2', '3', '5', 'A-TEXTx', 'A-DIMSx', 'A-LINK', 'A-SYMB', 'L-PLNT', 'A-ELEC', 'A-TEXT', '0-NPLT', 'A-DIMS'].map(l => ({ match: 'exact', pattern: l, type: 'ignore' }))) };
const FARM_CFG = { version: 1, units: 'in', snap_tol: 0.0005, wall_mode: 'pair', wall: { height_from_elevation: true, pair_thicknesses: [3.5 * IN], pair_tol: 0.0005, pair_min_overlap: 12 * IN, pair_join_gap: 3.5 * IN } };
// ---- JSCAD (t8_sandbox.js) ----
const JSCAD_MAP = { version: 1, rules: [          // SANDBOX seed: human choice from layer names seen in the file
  { match: 'suffix', pattern: 'A-WALL', type: 'wall' }, { match: 'suffix', pattern: 'A-OPENING', type: 'opening' },
  { match: 'suffix', pattern: 'S-SLAB', type: 'slab' },
  { match: 'exact', pattern: 'A-DIMS-1', type: 'ignore' }, { match: 'exact', pattern: 'A-NOTE', type: 'ignore' },
  { match: 'exact', pattern: 'A-TEXT', type: 'ignore' }, { match: 'exact', pattern: 'ANNTEXT', type: 'ignore' },
  { match: 'exact', pattern: 'Defpoints', type: 'ignore' }, { match: 'exact', pattern: '0', type: 'ignore' } ] };
const JSCAD_CFG = { version: 1, units: 'in', snap_tol: 0.0127, host_tol: 0.15, wall: { thickness: 0.2, height: 3.0, base: 0.0 }, slab: { thickness: 0.2, level: 0.0 },
  opening: { door: { height: 2.1 }, rect: { sill: 0.9, height: 1.2 } } }; // SANDBOX values (snap_tol = 0.5 in)
module.exports = { DX: { MAP_PLAN: DX_MAP_PLAN, MAP_ELEV: DX_MAP_ELEV, MAP_LEVL: DX_MAP_LEVL, MAP_ROOF: DX_MAP_ROOF, CFG: DX_CFG },
  FARM: { MAP: FARM_MAP, CFG: FARM_CFG }, JSCAD: { MAP: JSCAD_MAP, CFG: JSCAD_CFG } };
// ---- L2 qualify settings (DXF2BIM_MODELLER_LANE §L2.1); each value names its source, none is read from a drawing ----
const DX_QUALIFY = _DX.QUALIFY;   // §13: moved verbatim to deploy/dev/dxf2shell_config.js
module.exports.DX.QUALIFY = DX_QUALIFY;
// Farmhouse / jscad: tolerances as DX (same stated sources); dims layer = the layer holding the DIMENSION entities (SANDBOX seed, human choice from layer names,
// as the maps above). Grid layers are NOT stated for these drawings (they have no grid layer): qualify reports QF:setting_missing.
module.exports.FARM.QUALIFY = { tol: DX_QUALIFY.tol, grid: DX_QUALIFY.grid, layers: { dims: ['A-DIMSx'] } };
module.exports.JSCAD.QUALIFY = { tol: DX_QUALIFY.tol, grid: DX_QUALIFY.grid, layers: { dims: ['A-DIMS-1'] } };
// ---- STD: the L1 standard set (2D_Layout/python/std2d.py), lane spec L2.3: §13 moved verbatim to deploy/dev/dxf2shell_config.js (copied into the Modeller) ----
module.exports.STD = _DX.STD;
