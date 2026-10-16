-- §RENDER_FINISH — designate the Terminal hall mirror, WITHOUT destroying real BIM data.
-- Spec: bim-compiler prompts/PHOTOREAL_STILL_RENDER.md §HALL_MIRROR.
--
-- The user picked the host wall live in the viewer:
--   §PICK IfcWall "Basic Wall:S_Wall_Shear_RC_250mm_V1:1571018" ARC GROUND FLOOR LEVEL
--   guid 3KSdAIhOT1geLkw0k5NDJx, centre (148.08, -29.15, 8.11), rot_z 0,
--   bbox 3.83 x 0.25 x 16.00 — a slender full-height blade, face normal along +/-Y.
--
-- WHY A NEW TABLE AND NOT material_name. That wall's material_name is
-- 'Concrete - Cast-in-Place Concrete - 45 MPa' — real specification data, read by
-- bom_extract.js and the Material lens. A mirror is a RENDER finish, not a change of
-- structural material; overwriting the spec to carry a render flag would corrupt a real
-- quantity fact to buy a visual effect. So the designation gets its own additive table and
-- every existing column is left exactly as the model authored it.
--
-- WHY IN THE DB AT ALL, rather than a hardcoded guid in the viewer: §HALL_MIRROR established
-- that Terminal already NAMES its reflective surfaces (A_Floor_Tile_Procelain_300x300_V1 vs
-- A_Floor_CementRender_V1 vs A_Floor_Tile_nonslip_V1). Reflectivity therefore belongs in the
-- data, and the renderer should obey the data rather than carry a list of magic guids. This
-- table is that same layer: auto-populated where the model already states a finish, and
-- user-designated where it does not.

CREATE TABLE IF NOT EXISTS render_finishes (
  guid   TEXT PRIMARY KEY,   -- elements_meta.guid
  finish TEXT NOT NULL,      -- 'mirror' | 'polished' | 'matte'
  source TEXT,               -- 'user-pick' | 'name:<pattern>' — provenance, never guessed
  note   TEXT
);

INSERT OR REPLACE INTO render_finishes (guid, finish, source, note) VALUES
  ('3KSdAIhOT1geLkw0k5NDJx', 'mirror', 'user-pick',
   'Terminal hall feature blade, 3.83m x 16.0m, face normal +/-Y. Designated by the user in the viewer.');

-- Auto-designate what the model itself already states: porcelain floor = polished.
-- 'nonslip' and 'CementRender' are deliberately NOT included — a non-slip floor must never
-- become a mirror, and the model is what says which is which.
INSERT OR REPLACE INTO render_finishes (guid, finish, source, note)
SELECT guid, 'polished', 'name:Procelain', element_name
FROM elements_meta
WHERE ifc_class='IfcSlab' AND element_name LIKE '%Procelain%';
