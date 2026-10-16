-- §BILLBOARD_FLOODLIGHTS — four corner floodlights aimed at the billboard centre.
-- Spec: bim-compiler prompts/PHOTOREAL_STILL_RENDER.md §FACADE_SIGNAGE.
--
-- THE POINT OF DOING IT THIS WAY: these are real IfcLightFixture elements, so the ENTIRE
-- shipped night-lighting pipeline adopts them with ZERO new render code —
--   * §NIGHT_NAME_NOT_CLASS selects them (ifc_class='IfcLightFixture'), no vocabulary change;
--   * §PHOTO_GLOW_SPRITE gives each a glow sprite inside its existing ONE draw call;
--   * the night point-light pass ranks them by distance against the standing 12-nav / 48-still
--     budget (NIGHT_AND_FIXTURE_LIGHTING.md §constants), so they light up when the camera is
--     actually looking at the sign and cost nothing when it is not.
-- No new light objects are created by us, and no new budget category is introduced.
--
-- Positions are DERIVED from the panel's own row, not typed in: corner = panel centre
-- +/- (half-size + 0.30m overshoot), on a 1.00m bracket arm out from the display face.
-- 'Floodlight' contains 'light' and does not contain the excluded token 'flight', so the
-- §NIGHT_FIXTURE_VOCAB include/exclude rules pass it as a real luminaire.
--
-- rotation is left 0: a point light is omnidirectional, so aim is not stored. If these are
-- ever upgraded to real SpotLights, the aim vector is derivable at render time as
-- (panel centre - lamp position) — no DB change needed.

INSERT OR REPLACE INTO component_geometries (geometry_hash, vertices, faces, building)
VALUES ('bimootb_flood_300_v1', x'9a9919be9a9919be9a99193e9a99193e9a9919be9a99193e9a99193e9a99193e9a99193e9a9919be9a99193e9a99193e9a99193e9a9919be9a9919be9a9919be9a9919be9a9919be9a9919be9a99193e9a9919be9a99193e9a99193e9a9919be9a99193e9a9919be9a99193e9a99193e9a9919be9a9919be9a99193e9a99193e9a9919be9a99193e9a99193e9a99193e9a9919be9a9919be9a9919be9a9919be9a9919be9a99193e9a9919be9a99193e9a99193e9a9919be9a99193e9a9919be9a9919be9a99193e9a99193e9a99193e9a99193e9a99193e9a99193e9a99193e9a9919be9a9919be9a99193e9a9919be9a99193e9a9919be9a99193e9a9919be9a9919be9a99193e9a9919be9a9919be9a9919be9a99193e9a9919be9a9919be', x'0200000003000000000000000000000001000000020000000600000007000000040000000400000005000000060000000a0000000b0000000800000008000000090000000a0000000e0000000f0000000c0000000c0000000d0000000e000000120000001300000010000000100000001100000012000000160000001700000014000000140000001500000016000000', 'TerminalMerged');

INSERT OR REPLACE INTO elements_meta (guid, ifc_class, element_name, storey, discipline, material_name, material_rgba, building)
VALUES ('BB0BIMOOTBFLOOD000001', 'IfcLightFixture', 'BIM_OOTB_Floodlight:Billboard_Corner_1:1', 'Aras 04', 'ELEC', 'Luminaire - Exterior Floodlight', '0.180,0.185,0.195,1.000', 'TerminalMerged');
INSERT OR REPLACE INTO element_transforms (guid, center_x, center_y, center_z, rotation_x, rotation_y, rotation_z, bbox_x, bbox_y, bbox_z)
VALUES ('BB0BIMOOTBFLOOD000001', 151.5480, -38.9000, 21.3100, 0.0, 0.0, 0.0, 0.3, 0.3, 0.3);
INSERT OR REPLACE INTO element_instances (guid, geometry_hash) VALUES ('BB0BIMOOTBFLOOD000001', 'bimootb_flood_300_v1');

INSERT OR REPLACE INTO elements_meta (guid, ifc_class, element_name, storey, discipline, material_name, material_rgba, building)
VALUES ('BB0BIMOOTBFLOOD000002', 'IfcLightFixture', 'BIM_OOTB_Floodlight:Billboard_Corner_2:2', 'Aras 04', 'ELEC', 'Luminaire - Exterior Floodlight', '0.180,0.185,0.195,1.000', 'TerminalMerged');
INSERT OR REPLACE INTO element_transforms (guid, center_x, center_y, center_z, rotation_x, rotation_y, rotation_z, bbox_x, bbox_y, bbox_z)
VALUES ('BB0BIMOOTBFLOOD000002', 151.5480, -38.9000, 25.9100, 0.0, 0.0, 0.0, 0.3, 0.3, 0.3);
INSERT OR REPLACE INTO element_instances (guid, geometry_hash) VALUES ('BB0BIMOOTBFLOOD000002', 'bimootb_flood_300_v1');

INSERT OR REPLACE INTO elements_meta (guid, ifc_class, element_name, storey, discipline, material_name, material_rgba, building)
VALUES ('BB0BIMOOTBFLOOD000003', 'IfcLightFixture', 'BIM_OOTB_Floodlight:Billboard_Corner_3:3', 'Aras 04', 'ELEC', 'Luminaire - Exterior Floodlight', '0.180,0.185,0.195,1.000', 'TerminalMerged');
INSERT OR REPLACE INTO element_transforms (guid, center_x, center_y, center_z, rotation_x, rotation_y, rotation_z, bbox_x, bbox_y, bbox_z)
VALUES ('BB0BIMOOTBFLOOD000003', 151.5480, -30.3000, 21.3100, 0.0, 0.0, 0.0, 0.3, 0.3, 0.3);
INSERT OR REPLACE INTO element_instances (guid, geometry_hash) VALUES ('BB0BIMOOTBFLOOD000003', 'bimootb_flood_300_v1');

INSERT OR REPLACE INTO elements_meta (guid, ifc_class, element_name, storey, discipline, material_name, material_rgba, building)
VALUES ('BB0BIMOOTBFLOOD000004', 'IfcLightFixture', 'BIM_OOTB_Floodlight:Billboard_Corner_4:4', 'Aras 04', 'ELEC', 'Luminaire - Exterior Floodlight', '0.180,0.185,0.195,1.000', 'TerminalMerged');
INSERT OR REPLACE INTO element_transforms (guid, center_x, center_y, center_z, rotation_x, rotation_y, rotation_z, bbox_x, bbox_y, bbox_z)
VALUES ('BB0BIMOOTBFLOOD000004', 151.5480, -30.3000, 25.9100, 0.0, 0.0, 0.0, 0.3, 0.3, 0.3);
INSERT OR REPLACE INTO element_instances (guid, geometry_hash) VALUES ('BB0BIMOOTBFLOOD000004', 'bimootb_flood_300_v1');
