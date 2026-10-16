// sandbox.js — the fixture, shared by poc4d.js. Row-for-row identical to Poc4D.java's Sandbox.
// Each HELL row reproduces a NAMED, MEASURED defect; see the Java twin for the citations.
'use strict';
const e = (cls, name, storey, cx, cy, cz, bx, by, bz) => ({ cls, name, storey, cx, cy, cz, bx, by, bz });
const id = (r, pre) => r.map((x, i) => Object.assign(x, { guid: pre + String(i).padStart(3, '0') }));

const hell = () => id([
  e('IfcFooting','Footing L1','L1', 0,0,-0.50, 4.0,4.0,1.00),
  e('IfcColumn','Column L1','L1', -1.8,0,1.50, 0.4,0.4,3.00),
  e('IfcSlab','Slab L1','L1', 0,0,3.10, 4.0,4.0,0.20),
  e('IfcWallStandardCase','Wall lower L1','L1', 0,-1.9,-0.50, 4.0,0.2,1.00),
  e('IfcWallStandardCase','Wall upper L1','L1', 0,-1.9,1.50, 4.0,0.2,3.00),
  e('IfcWallStandardCase','Wall N L1','L1', 0,1.9,1.50, 4.0,0.2,3.00),
  e('IfcWallStandardCase','Wall E L1','L1', 1.9,0,1.50, 0.2,4.0,3.00),
  e('IfcWallStandardCase','Wall W L1','L1', -1.9,0,1.50, 0.2,4.0,3.00),
  e('IfcDoor','Door L1','L1', 0,-1.9,1.05, 0.9,0.2,2.10),
  e('IfcFlowSegment','Duct L1','L1', 0,0,2.75, 3.0,0.3,0.30),
  e('IfcFlowTerminal','Light L1','L1', 0.8,0.8,2.92, 0.6,0.6,0.06),
  e('IfcCovering','Floor fin L1','L1', 0,0,0.02, 4.0,4.0,0.02),
  e('IfcColumn','Column L2','L2', -1.8,0,4.80, 0.4,0.4,3.00),
  e('IfcSlab','Slab L2','L2', 0,0,6.30, 4.0,4.0,0.20),
  e('IfcWallStandardCase','Wall S L2','L2', 0,-1.9,4.80, 4.0,0.2,3.00),
  e('IfcFlowSegment','Duct L2','L2', 0,0,5.95, 3.0,0.3,0.30),
  e('IfcCovering','Floor fin L2','L2', 0,0,3.22, 4.0,4.0,0.02),
  e('IfcBuildingElementProxy','Unlevelled proxy',null, 1.5,1.5,2.00, 0.3,0.3,1.00),
  e('IfcFlowSegment','Riser L1-L2','L1', 1.7,1.7,3.10, 0.2,0.2,6.40),
  e('IfcBuildingElementProxy','Orphan','L2', 3.6,3.6,5.00, 0.2,0.2,0.40)
], 'SBX');

// COHERENT — the same building modelled correctly: a floor slab sits at its level's DATUM (walls
// stand ON it). The hell fixture puts it at the ceiling, so it is really the level above's floor
// wearing this level's label — §GANTT_STOREY_Z reassigned=2120. Proves the model reaches 0
// violations AND 0 defects on coherent input; without that, "0 violations" would only mean the
// failures had been renamed.
const coherent = () => id([
  e('IfcFooting','Footing L1','L1', 0,0,-0.50, 4.0,4.0,1.00),
  e('IfcSlab','Floor slab L1','L1', 0,0,0.10, 4.0,4.0,0.20),
  e('IfcColumn','Column L1','L1', -1.8,0,1.90, 0.4,0.4,3.40),
  e('IfcWallStandardCase','Wall lower L1','L1', 0,-1.9,0.70, 4.0,0.2,1.00),
  e('IfcWallStandardCase','Wall upper L1','L1', 0,-1.9,2.40, 4.0,0.2,2.40),
  e('IfcWallStandardCase','Wall N L1','L1', 0,1.9,1.90, 4.0,0.2,3.40),
  e('IfcWallStandardCase','Wall E L1','L1', 1.9,0,1.90, 0.2,4.0,3.40),
  e('IfcDoor','Door L1','L1', 0,-1.9,1.25, 0.9,0.2,2.10),
  e('IfcFlowSegment','Duct L1','L1', 0,0,3.30, 3.0,0.3,0.30),
  e('IfcFlowTerminal','Light L1','L1', 0.8,0.8,3.52, 0.6,0.6,0.06),
  e('IfcCovering','Floor fin L1','L1', 0,0,0.22, 4.0,4.0,0.04),
  e('IfcSlab','Floor slab L2','L2', 0,0,3.70, 4.0,4.0,0.20),
  e('IfcColumn','Column L2','L2', -1.8,0,5.50, 0.4,0.4,3.40),
  e('IfcWallStandardCase','Wall S L2','L2', 0,-1.9,5.50, 4.0,0.2,3.40),
  e('IfcFlowSegment','Duct L2','L2', 0,0,6.90, 3.0,0.3,0.30),
  e('IfcCovering','Floor fin L2','L2', 0,0,3.82, 4.0,4.0,0.04),
  e('IfcBuildingElementProxy','Unlevelled proxy',null, 1.5,1.5,2.00, 0.3,0.3,1.00),
  e('IfcFlowSegment','Riser L1-L2','L1', 1.7,1.7,3.60, 0.2,0.2,7.00),
  e('IfcBuildingElementProxy','Orphan','L2', 3.6,3.6,5.00, 0.2,0.2,0.40)
], 'COH');

module.exports = { hell, coherent };
