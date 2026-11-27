-- CL006: give the two exact-size library doors a "W x H" pair in their family description so the DXF2BIM importer can bind them
-- Spec: prompts/PDF2BIM_VECTOR_PROBE.md §27. Reader rule: bim-ootb modeller/dxf2bim/dxf2shell.js familyToRef() needs a size pair in ad_opening_family.description whose key equals the
-- ad_geometry_map element_ref pair key (here 'FD1:(PTp01b) 900 x 2100 @PT02' / '... 750 x 2100 @PT02', Terminal, meshes present) AND whose leading token equals the element_ref prefix ('FD1').
-- Data only, append-only, idempotent (guarded by the old text): applying twice changes 0 rows the second time. Applies to library/component_library.db (never commit the binary: this script is the change).
UPDATE ad_opening_family SET description = 'FD1 900×2100mm fire-rated single leaf (thinner frame)'
 WHERE family_id = 'INST_FIRE_DOOR_900' AND description = 'FD1 fire-rated single leaf 900mm (thinner frame)';
UPDATE ad_opening_family SET description = 'FD1 750×2100mm fire-rated single leaf for escape routes'
 WHERE family_id = 'INST_FIRE_DOOR_750' AND description = 'FD1 fire-rated single leaf 750mm for escape routes';
