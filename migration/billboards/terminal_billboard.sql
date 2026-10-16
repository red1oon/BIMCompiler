-- §BILLBOARD_INJECT — BIM OOTB facade billboard, Terminal (TerminalMerged)
-- Spec: bim-compiler prompts/PHOTOREAL_STILL_RENDER.md §FACADE_SIGNAGE.
-- A REAL element, not presentation dressing: pickable, quantifiable, shadow-casting, and it
-- survives a save/export like any other BIM object.
--
-- PLACEMENT IS EXTRACTED, NOT CHOSEN. The user picked the host wall live in the viewer:
--   §PICK IfcWall "Basic Wall:A_Wall_Ext_150mm_BrickPlaster_V1:1156998" ARC Aras 04
--   guid 317rFPKoL6eO76U6ttKqzG, centre (150.02, -34.60, 23.61), rot 0,0,0, bbox 0.15 x 10.84 x 6.56
-- The wall plane faces +X (the building spans x 86.4..150.3, so x-max is outward). The panel is
-- centred on the host wall and stands 0.05m proud of the wall's exact outer face
-- exact outer face 150.0980 (from the DB, NOT the rounded display value) plus a 0.05m standoff.
--
-- GEOMETRY CONVENTION, verified against real rows before writing (component_geometries
-- 1238e2650c3be94e: local extents 2.100 x 2.100 x 0.750 == its elements' bbox_x/y/z exactly):
--   * vertices = raw little-endian float32 xyz triples, OBJECT SPACE, centred on origin, REAL METRES
--   * faces    = raw little-endian uint32 triangle indices, 0-based
--   * element_transforms supplies position + rotation ONLY — there is no scale factor
-- Panel: 8.0m wide (IFC Y) x 4.0m tall (IFC Z) x 0.4m thick (IFC X); 24 verts, 12 tris.
--
-- Idempotent: INSERT OR REPLACE on all four rows, so re-running changes nothing.
-- To remove: DELETE FROM <each table> WHERE guid='BB0BIMOOTBSIGN000001A' (and the geometry hash).

INSERT OR REPLACE INTO component_geometries (geometry_hash, vertices, faces, building)
VALUES ('bimootb_bb_8x4_v1', x'cdcc4cbe000080c000000040cdcc4c3e000080c000000040cdcc4c3e0000804000000040cdcc4cbe0000804000000040cdcc4c3e000080c0000000c0cdcc4cbe000080c0000000c0cdcc4cbe00008040000000c0cdcc4c3e00008040000000c0cdcc4c3e000080c000000040cdcc4c3e000080c0000000c0cdcc4c3e00008040000000c0cdcc4c3e0000804000000040cdcc4cbe000080c0000000c0cdcc4cbe000080c000000040cdcc4cbe0000804000000040cdcc4cbe00008040000000c0cdcc4cbe0000804000000040cdcc4c3e0000804000000040cdcc4c3e00008040000000c0cdcc4cbe00008040000000c0cdcc4c3e000080c000000040cdcc4cbe000080c000000040cdcc4cbe000080c0000000c0cdcc4c3e000080c0000000c0', x'0200000003000000000000000000000001000000020000000600000007000000040000000400000005000000060000000a0000000b0000000800000008000000090000000a0000000e0000000f0000000c0000000c0000000d0000000e000000120000001300000010000000100000001100000012000000160000001700000014000000140000001500000016000000', 'TerminalMerged');

INSERT OR REPLACE INTO elements_meta (guid, ifc_class, element_name, storey, discipline, material_name, material_rgba, building)
VALUES ('BB0BIMOOTBSIGN000001A', 'IfcBuildingElementProxy', 'BIM_OOTB_Billboard:Facade_8000x4000:1', 'Aras 04', 'ARC', 'BIM OOTB Signage', '0.055,0.065,0.090,1.000', 'TerminalMerged');
-- rgba is set explicitly so it does NOT fall back to STD_MAT's IfcBuildingElementProxy teal.

INSERT OR REPLACE INTO element_transforms (guid, center_x, center_y, center_z, rotation_x, rotation_y, rotation_z, bbox_x, bbox_y, bbox_z)
VALUES ('BB0BIMOOTBSIGN000001A', 150.3480, -34.6000, 23.6100, 0.0, 0.0, 0.0, 0.4, 8.0, 4.0);

INSERT OR REPLACE INTO element_instances (guid, geometry_hash) VALUES ('BB0BIMOOTBSIGN000001A', 'bimootb_bb_8x4_v1');
