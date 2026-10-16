-- §BILLBOARD_NAME_ELEMENT — BIM OOTB facade NAME PLATE, Terminal (TerminalMerged)
-- Spec: bim-compiler prompts/PHOTOREAL_STILL_RENDER.md §BILLBOARD_NAME_ELEMENT
--       (supersedes §BILLBOARD_BUILDING_NAME, which had NO DB row at all).
-- Companion: terminal_billboard.sql (the 8x4 panel) + terminal_billboard_floodlights.sql.
--
-- WHY THIS FILE EXISTS. The first pass of the building-name plate was a pure THREE.Mesh built from
-- a config file — presentation dressing with no DB row, so it could never be quantified, costed,
-- or bound to a schedule, and it rendered from frame 0 of a Time Machine buildup regardless of the
-- playback cursor. The panel BODY belongs in the DB exactly like the billboard panel does; only the
-- lettering on its face stays a runtime quad (a font raster is not geometry — same split as
-- §BILLBOARD_ART).
--
-- ── PLACEMENT IS EXTRACTED, NOT CHOSEN ───────────────────────────────────────────────────────────
-- Host wall (the SAME wall the user picked live for the billboard):
--   guid 317rFPKoL6eO76U6ttKqzG, center_x 150.022938218902, bbox_x 0.15011265873909,
--                                center_y -34.5991588724087, bbox_y 10.8401651382446
--   outer face x = 150.022938218902 + 0.15011265873909/2 = 150.097994548271545
-- Billboard panel BB0BIMOOTBSIGN000001A: center (150.348, -34.6, 23.61), bbox (0.4, 8.0, 4.0).
-- Standoff convention re-derived FROM that shipped panel (not assumed):
--   outer_face + thickness/2 + 0.05  ->  150.097994548 + 0.2 + 0.05 = 150.347995 vs stored 150.348
--   (delta 5.5e-6 m, i.e. the panel SQL's own rounding). Convention confirmed.
--
--   plate center_x = 150.097994548271545 + 0.1/2 + 0.05 = 150.19799454827157
--   plate center_y = -34.6 + (8.0/2 + 0.05 + 1.2/2)     = -29.95        ("right" = +Y, see below)
--   plate center_z = 23.61                              (same as the panel: one composition)
--
-- "Right" is DERIVED: the facade faces +X (established by terminal_billboard.sql), so for a viewer
-- facing -X, right = (Fy,-Fx) applied to facing (-1,0) gives (0,1) = +Y.
--
-- CHOSEN, with no real antecedent, and said so plainly (same category as the floodlights' chosen
-- 0.3m bracket housing): thickness 0.1 m. Width 1.2 m and height 4.0 m are derived — the panel is
-- centred on a 10.8402 m wall and is 8.0 m wide, leaving 1.4201 m of margin each side; 4.0 m is the
-- panel's own bbox_z.
--
-- CLEARANCES, all computed and asserted by the witness, none eyeballed:
--   plate spans y [-30.5500, -29.3500]; wall right edge -29.179076  -> 0.170924 m clear
--   gap to the panel's right edge (-30.6)                           -> 0.050000 m (the intended gap)
--   plate inner face x 150.147994548 vs wall outer face 150.097994548 -> standoff 0.050000000 m (>0)
--   vs floodlights BB0BIMOOTBFLOOD000003/4 (center_y -30.3, center_x 151.548, center_z 21.31/25.91,
--     0.3 m housings): Y ranges DO overlap by 0.30 m, but overlapX = -1.1500 and overlapZ = -0.1500
--     -> AABB collision = FALSE on both. X and Z are what separate them.
--
-- ── GEOMETRY: DECODED FROM THE SHIPPED PANEL AND RESCALED, NOT HAND-DERIVED ──────────────────────
-- The panel's blob (bimootb_bb_8x4_v1) was decoded, each vertex normalised by the panel's own
-- half-extents (0.2, 4.0, 2.0) — every component came out exactly +/-1 within 1e-6, i.e. a true
-- sign-pattern box — and rescaled by this plate's half-extents (0.05, 0.6, 2.0). The 12-triangle
-- INDEX blob below is the panel's, byte-for-byte identical, reused verbatim. Measured:
--   verts=24 tris=12 vbytes=288 fbytes=144
--   src bbox extent = 0.400000, 8.000000, 4.000000   (== the panel's stored bbox)
--   dst bbox extent = 0.100000, 1.200000, 4.000000   (== this plate's stored bbox)
-- Reusing proven topology instead of deriving a new box is deliberate: the original billboard SQL
-- records a real 3 mm wall-penetration near-miss in exactly this area, caught only because the
-- witness checked exact stored values instead of rounded ones.
--
-- Format, unchanged from terminal_billboard.sql and confirmed against viewer/scene.js
-- A.blobToGeometry (Float32Array over vertices, Uint32Array over faces, IFC->three swap done in the
-- loader, no scale factor — element_transforms supplies position + rotation ONLY):
--   * vertices = raw little-endian float32 xyz triples, OBJECT SPACE, centred on origin, REAL METRES
--   * faces    = raw little-endian uint32 triangle indices, 0-based
-- Note: 0.6 is not exactly representable in float32 (stored 0.60000002384), so the decoded Y extent
-- is 1.2000000476837158 against a stored bbox_y of 1.2. That is float32 storage, not an error — the
-- witness gate uses a 1e-5 m tolerance for this reason, NOT exact equality.
--
-- ── SCOPE OF THIS FILE ──────────────────────────────────────────────────────────────────────────
-- This file adds the ELEMENT only (4 rows) and applies to ANY Terminal_Hi-family DB, including ones
-- with no 4D tables. The SCHEDULE binding lives in the companion file
-- terminal_billboard_nameplate_4d.sql, which requires tasks/task_elements/kernel_ops and is applied
-- ONLY to TerminalHi4D.db. They are split deliberately: running this file against a DB without the
-- 4D tables must not error, and must not create empty schedule tables that would change how
-- time_machine.js's _cap probe behaves.
--
-- Idempotent: INSERT OR REPLACE on all four rows, so re-running changes nothing.
-- To remove: DELETE FROM <each table> WHERE guid='BB0BIMOOTBNAME000001A'
--            (and DELETE FROM component_geometries WHERE geometry_hash='bimootb_np_1p2x4_v1').

INSERT OR REPLACE INTO component_geometries (geometry_hash, vertices, faces, building)
VALUES ('bimootb_np_1p2x4_v1', x'cdcc4cbd9a9919bf00000040cdcc4c3d9a9919bf00000040cdcc4c3d9a99193f00000040cdcc4cbd9a99193f00000040cdcc4c3d9a9919bf000000c0cdcc4cbd9a9919bf000000c0cdcc4cbd9a99193f000000c0cdcc4c3d9a99193f000000c0cdcc4c3d9a9919bf00000040cdcc4c3d9a9919bf000000c0cdcc4c3d9a99193f000000c0cdcc4c3d9a99193f00000040cdcc4cbd9a9919bf000000c0cdcc4cbd9a9919bf00000040cdcc4cbd9a99193f00000040cdcc4cbd9a99193f000000c0cdcc4cbd9a99193f00000040cdcc4c3d9a99193f00000040cdcc4c3d9a99193f000000c0cdcc4cbd9a99193f000000c0cdcc4c3d9a9919bf00000040cdcc4cbd9a9919bf00000040cdcc4cbd9a9919bf000000c0cdcc4c3d9a9919bf000000c0', x'0200000003000000000000000000000001000000020000000600000007000000040000000400000005000000060000000a0000000b0000000800000008000000090000000a0000000e0000000f0000000c0000000c0000000d0000000e000000120000001300000010000000100000001100000012000000160000001700000014000000140000001500000016000000', 'TerminalMerged');

-- ifc_class IfcBuildingElementProxy: same as the panel, and the class the 5D rate table already
-- prices (viewer/rates.js:41 IfcBuildingElementProxy {rate:850, unit:'EA'} — CIDB 2024 RM). No new
-- rate category is invented; this row costs RM 850 through the SHIPPED table, nothing else needed.
-- material_rgba is set explicitly (the panel's own dark-hoarding body colour) so it does NOT fall
-- back to STD_MAT's IfcBuildingElementProxy teal, and so the light lettering reads on it.
INSERT OR REPLACE INTO elements_meta (guid, ifc_class, element_name, storey, discipline, material_name, material_rgba, building)
VALUES ('BB0BIMOOTBNAME000001A', 'IfcBuildingElementProxy', 'BIM_OOTB_NamePlate:Facade_1200x4000:1', 'Aras 04', 'ARC', 'BIM OOTB Signage', '0.055,0.065,0.090,1.000', 'TerminalMerged');

-- center_x carries FULL precision (150.19799454827157), not a rounded display value — see the
-- §Traps note in PHOTOREAL_STILL_RENDER.md: using a rounded 150.02 for the panel once put it 3 mm
-- inside its host wall.
INSERT OR REPLACE INTO element_transforms (guid, center_x, center_y, center_z, rotation_x, rotation_y, rotation_z, bbox_x, bbox_y, bbox_z)
VALUES ('BB0BIMOOTBNAME000001A', 150.19799454827157, -29.95, 23.61, 0.0, 0.0, 0.0, 0.1, 1.2, 4.0);

INSERT OR REPLACE INTO element_instances (guid, geometry_hash) VALUES ('BB0BIMOOTBNAME000001A', 'bimootb_np_1p2x4_v1');
