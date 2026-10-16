#!/usr/bin/env python3
"""
DAGCompiler Reference DB Extractor — full extraction from IFC source.

Creates a complete reference DB from an IFC file in ONE pass:
  - Spatial structure (buildings, storeys, spaces)
  - Element geometry (tessellated meshes, bounding boxes, transforms)
  - Materials and colours (from IfcRelAssociatesMaterial + IfcSurfaceStyle)

Uses the unified reference_schema.sql (material columns from the start).
Replaces the need for separate extract.py + material_extractor.py steps.

Also supports populating I_Element_Extraction with material columns.

Usage:
  # Full extraction: IFC → new reference DB (geometry + materials)
  python3 DAGCompiler/python/extractIFCtoDB.py \
      --ifc DAGCompiler/lib/input/SampleHouse.ifc \
      -o DAGCompiler/lib/input/SampleHouse_extracted.db

  # S168: Full extraction with library mode (BLOBs → library, hashes → extracted)
  python3 DAGCompiler/python/extractIFCtoDB.py \
      --ifc DAGCompiler/lib/input/SampleHouse.ifc \
      -o DAGCompiler/lib/input/SampleHouse_extracted.db \
      --library library/component_library.db \
      --building-type Ifc4_SampleHouse

  # Populate I_Element_Extraction material columns from enriched reference DB
  python3 DAGCompiler/python/extract.py \
      --populate-placement \
      --ref DAGCompiler/lib/input/SampleHouse_extracted.db \
      --library library/component_library.db \
      --building-type SampleHouse

  # Enrich existing DB with materials only (no geometry re-extraction)
  python3 DAGCompiler/python/extract.py \
      --enrich \
      --ifc DAGCompiler/lib/input/SampleHouse.ifc \
      --ref DAGCompiler/lib/input/SampleHouse_extracted.db

  # Dry-run (report only)
  python3 DAGCompiler/python/extract.py \
      --ifc DAGCompiler/lib/input/SampleHouse.ifc \
      -o out.db --dry-run
"""

import argparse
import hashlib
import math
import os
import datetime as _dt
import sqlite3
import struct

# S173: Log level — FINE enables detailed proofs, INFO is summary only.
LOG_LEVEL = os.environ.get("BIM_LOG_LEVEL", "FINE").upper()
FINE = LOG_LEVEL == "FINE"
# §LODHELL-FIX-1: number of §PROOF checks that FAILED in the last extract_reference() call. main() turns a
# non-zero value into a non-zero exit status so a red gate actually stops a pipeline.
LAST_PROOF_FAIL = 0
import sys
import time

import numpy as np


# ---------------------------------------------------------------------------
# S171: Extract world placement matrix from IFC ObjectPlacement chain
# (no tessellation — pure IFC data traversal)
# ---------------------------------------------------------------------------

def _placement_matrix(elem):
    """Return 4x4 world transform matrix from IfcLocalPlacement chain."""
    mat = np.eye(4, dtype=np.float64)
    placement = getattr(elem, 'ObjectPlacement', None)
    placements = []
    while placement and placement.is_a('IfcLocalPlacement'):
        placements.append(placement)
        placement = placement.PlacementRelTo
    # Apply from root to leaf (outermost first)
    for p in reversed(placements):
        rp = p.RelativePlacement
        if rp is None:
            continue
        local = np.eye(4, dtype=np.float64)
        loc = rp.Location
        if loc:
            coords = list(loc.Coordinates)
            if len(coords) == 2:
                coords.append(0.0)
            local[0, 3] = coords[0]
            local[1, 3] = coords[1]
            local[2, 3] = coords[2]
        axis = getattr(rp, 'Axis', None)
        ref_dir = getattr(rp, 'RefDirection', None)
        if axis and axis.DirectionRatios:
            z = np.array(list(axis.DirectionRatios)[:3], dtype=np.float64)
            z = z / max(np.linalg.norm(z), 1e-12)
        else:
            z = np.array([0, 0, 1], dtype=np.float64)
        if ref_dir and ref_dir.DirectionRatios:
            x = np.array(list(ref_dir.DirectionRatios)[:3], dtype=np.float64)
            x = x / max(np.linalg.norm(x), 1e-12)
        else:
            x = np.array([1, 0, 0], dtype=np.float64)
        y = np.cross(z, x)
        y = y / max(np.linalg.norm(y), 1e-12)
        x = np.cross(y, z)
        x = x / max(np.linalg.norm(x), 1e-12)
        local[:3, 0] = x
        local[:3, 1] = y
        local[:3, 2] = z
        mat = mat @ local
    return mat


# ---------------------------------------------------------------------------
# Reference DB schema (unified — includes material columns)
# ---------------------------------------------------------------------------

REFERENCE_SCHEMA = """
CREATE TABLE IF NOT EXISTS spatial_structure (
    guid TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT,
    parent_guid TEXT,
    object_type TEXT,
    predefined_type TEXT,
    -- IfcSpace footprint AABB (room qualification: habitable area = size_x*size_y, height = size_z).
    -- Spaces are non-geometric in the iterator (no body mesh) but DO carry a Representation solid;
    -- we tessellate it once here for the AABB only. NULL for Building/Storey (no own footprint).
    center_x REAL, center_y REAL, center_z REAL,
    size_x REAL, size_y REAL, size_z REAL,
    -- §S21 (prompts/4D_GANTT_TM_REFACTOR.md, bim-ootb 4D lane): IfcBuildingStorey.Elevation, a
    -- plain IFC attribute, EXTRACTED not inferred (§PATHS NOT TO TAKE #7). Unit-corrected by
    -- unit_scale (the same factor already computed for logging above) since this is a raw
    -- attribute read, not geometry — geom.iterator() only auto-converts tessellated geometry.
    -- NULL for Building/Space (no own elevation). Matches the schema §S18 (bim-compiler PR #83)
    -- shipped for extractIFC2DB.js/Clinic — same column name, same convention, second extractor.
    elevation REAL
);
CREATE TABLE IF NOT EXISTS elements_meta (
    id INTEGER PRIMARY KEY,
    guid TEXT UNIQUE NOT NULL,
    discipline TEXT NOT NULL,
    ifc_class TEXT NOT NULL,
    element_name TEXT,
    element_type TEXT,
    storey TEXT,
    material_name TEXT,
    material_rgba TEXT,
    -- §KUL001: the Viewer's centres query (viewer/streaming.js) is
    --   SELECT m.building, COUNT(*), AVG(t.center_*) ... GROUP BY m.building
    -- Without this column it throws `no such column: m.building`, §CENTRES_RESULT rows=0,
    -- §BOOTSTRAP centres=0, and A.startStreaming() takes a SILENT early return: the DB loads,
    -- logs its full size, and renders NOTHING. Reads like a size/perf bug and is neither.
    -- The browser importer has always written it (viewer/import_db_builder.js:38,48); this
    -- extractor did not, which is why CLI-built DBs opened blank.
    building TEXT,
    -- §ANCHOR (RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §START HERE OPEN 1, USER-APPROVED 2026-07-30):
    -- 1 = a VOID-CONSUMED host persisted as a non-rendered logical anchor. UNMISTAKABLE by design
    -- (the user's binding condition): is_anchor=1 here AND transform_source='void_anchor' on its
    -- element_transforms row. Anchors have NO element_instances row (nothing to render), are NOT in
    -- elements_rtree (never pickable), and are excluded from every extractor count and §PROOF gate.
    is_anchor INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS project_metadata (key TEXT PRIMARY KEY, value TEXT);
CREATE VIRTUAL TABLE IF NOT EXISTS elements_rtree USING rtree(
    id, minX, maxX, minY, maxY, minZ, maxZ
);
CREATE TABLE IF NOT EXISTS base_geometries (
    geometry_hash TEXT PRIMARY KEY,
    vertices BLOB,
    faces BLOB,
    vertex_count INTEGER,
    face_count INTEGER
);
CREATE TABLE IF NOT EXISTS element_instances (
    guid TEXT PRIMARY KEY,
    geometry_hash TEXT,
    FOREIGN KEY (geometry_hash) REFERENCES base_geometries(geometry_hash)
);
CREATE TABLE IF NOT EXISTS element_transforms (
    guid TEXT PRIMARY KEY,
    center_x REAL,
    center_y REAL,
    center_z REAL,
    rotation_x REAL DEFAULT 0,
    rotation_y REAL DEFAULT 0,
    rotation_z REAL DEFAULT 0,
    -- AABB full extent (maxK-minK), same source as elements_rtree — the bbox substrate the STR walker +
    -- cross-edge derivation read (previously backfilled post-hoc by scripts/backfill_bbox.py; now native).
    bbox_x REAL,
    bbox_y REAL,
    bbox_z REAL,
    transform_source TEXT
);
CREATE TABLE IF NOT EXISTS port_elements (
    port_guid TEXT PRIMARY KEY,
    element_guid TEXT NOT NULL,
    flow_direction TEXT,
    local_x REAL,
    local_y REAL,
    local_z REAL
);
CREATE TABLE IF NOT EXISTS port_connections (
    port_a_guid TEXT NOT NULL,
    port_b_guid TEXT NOT NULL,
    PRIMARY KEY (port_a_guid, port_b_guid)
);
CREATE TABLE IF NOT EXISTS rel_contained_in_space (
    element_guid TEXT,
    space_guid TEXT,
    PRIMARY KEY (element_guid, space_guid)
);
CREATE TABLE IF NOT EXISTS rel_aggregates (
    parent_guid TEXT NOT NULL,
    child_guid TEXT NOT NULL,
    PRIMARY KEY (parent_guid, child_guid)
);
-- Path B (§PATHB / SPATIAL_DEPENDENCY_GRAPH.md): the void/fill chain, recovered verbatim from
-- IfcRelVoidsElement (host→opening) composed with IfcRelFillsElement (opening→filling). One row per
-- opening that voids a host; filling_guid NULL = open void (no door/window). provenance is always
-- 'ifc:recovered' — NON-INVENT, we copy authored relations and derive nothing here.
CREATE TABLE IF NOT EXISTS rel_fills_host (
    opening_guid TEXT PRIMARY KEY,
    host_guid TEXT,
    filling_guid TEXT,
    host_class TEXT,
    filling_class TEXT,
    provenance TEXT DEFAULT 'ifc:recovered'
);
-- abuts edge (SPATIAL_DEPENDENCY_GRAPH.md): the first DERIVED measured edge. Two elements ABUT if they
-- share a face — measured from AABBs: faces within tol on ONE axis (the touch axis) AND a real overlap on
-- the other two. DERIVED, never recovered/guessed: provenance carries the measure ('derived:face-touch').
-- One row per unordered pair (a_guid < b_guid). gap_mm = |signed gap| at the touching face; contact_m2 =
-- the shared-face contact patch (the two non-touch overlaps multiplied) — a measured fold quantity.
CREATE TABLE IF NOT EXISTS rel_adjacency (
    a_guid TEXT,
    b_guid TEXT,
    touch_axis TEXT,
    gap_mm REAL,
    contact_m2 REAL,
    provenance TEXT DEFAULT 'derived:face-touch',
    PRIMARY KEY (a_guid, b_guid, touch_axis)
);
-- anchored-to edge (SPATIAL_DEPENDENCY_GRAPH.md): a DERIVED edge from element → DATUM plane. Datums are
-- NOT recovered (a bridge has no IfcGrid, no storeys) — they EMERGE by measure: a datum on an axis is a
-- coordinate where ≥min_support element FACES align within tol (a gridline, a storey plane, a pier station).
-- NON-INVENT: zero class names, no template grid; the cadence of the real geometry defines the datums.
CREATE TABLE IF NOT EXISTS datum_plane (
    datum_id INTEGER PRIMARY KEY,
    axis TEXT,
    coord REAL,
    support_count INTEGER,
    provenance TEXT DEFAULT 'derived:cadence'
);
CREATE TABLE IF NOT EXISTS rel_anchored (
    element_guid TEXT,
    datum_id INTEGER,
    axis TEXT,
    offset_mm REAL,
    provenance TEXT DEFAULT 'derived:cadence-snap',
    PRIMARY KEY (element_guid, datum_id)
);
-- spans edge (SPATIAL_DEPENDENCY_GRAPH.md): a DERIVED edge — an element SPANS two datums when its bbox
-- reaches from near one datum to near another on an axis (a girder between piers, a slab across gridlines).
-- The fold rule: the element stretches between the two datums with its cross-section sizes HELD. DERIVED
-- from datum_plane geometry, NON-INVENT, grep-clean. One row per (element, axis); datum_lo < datum_hi.
CREATE TABLE IF NOT EXISTS rel_spans (
    element_guid TEXT,
    axis TEXT,
    datum_lo_id INTEGER,
    datum_hi_id INTEGER,
    span_m REAL,
    provenance TEXT DEFAULT 'derived:bbox-spans-datums',
    PRIMARY KEY (element_guid, axis)
);
CREATE TABLE IF NOT EXISTS surface_styles (
    style_name TEXT PRIMARY KEY,
    surface_r REAL, surface_g REAL, surface_b REAL,
    transparency REAL DEFAULT 0.0,
    specular_r REAL, specular_g REAL, specular_b REAL,
    specular_ratio REAL,
    specular_exponent REAL,
    reflectance_method TEXT DEFAULT 'NOTDEFINED',
    side TEXT DEFAULT 'BOTH',
    source TEXT
);
CREATE TABLE IF NOT EXISTS material_layers (
    layer_set_name TEXT NOT NULL,
    sequence INTEGER NOT NULL,
    material_name TEXT,
    thickness_m REAL,
    is_ventilated INTEGER DEFAULT 0,
    PRIMARY KEY (layer_set_name, sequence)
);
-- §LOD400-ENVELOPE (prompts/RESUME_MODELLER_LOD400_REAL_GEOMETRY.md) — the MISSING LINK.
-- material_layers is keyed by layer_set_name alone, and get_material_for_element() collapsed an element's
-- whole IfcMaterialLayerSetUsage down to one material NAME string, so nothing recorded WHICH element is
-- built of WHICH layers. Without this edge a 7-layer cavity wall is indistinguishable from a blank box and
-- ships as an envelope — the fallback the NO-FALLBACK rule forbids. Pure extraction, no computation.
CREATE TABLE IF NOT EXISTS rel_material_layer_set (
    element_guid TEXT PRIMARY KEY,
    layer_set_name TEXT,
    layer_count INTEGER,
    total_thickness_m REAL,
    layer_set_direction TEXT,
    direction_sense TEXT,
    offset_from_reference_line REAL,
    provenance TEXT DEFAULT 'ifc:IfcMaterialLayerSetUsage'
);
-- §LOD400-LAYERS-REAL (prompts/RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §THE FIX item 2, CALL MADE
-- 2026-07-30: option (b)) — per-layer slab index into the layered mesh stored behind geometry_hash.
-- The mesh a multi-layer element's hash resolves is a CONCATENATION of N layer slabs, compiled by
-- slicing the authored envelope solid at the authored cumulative layer thicknesses (see
-- compile_layer_geometry()). One row per layer: faces[face_start : face_start+face_count] is that
-- layer's slab. Rows list the layers this instance's own BODY actually carries: an authored layer
-- clipped away by authored geometry (e.g. a party wall's half-space trim handing the neighbour-side
-- finishes to the neighbour's body) has NO row — an absent seq, announced as §LAYER-CLIP (user
-- exception ruling 2026-07-31: honest whole-layer subsets are LOD400; the no-fallback rule bans
-- invented content). face_count MUST be > 0 on every row that exists (row 33: an empty row is a
-- lie). Lives in the SAME store as the mesh blobs (component_geometries in library mode, this DB's
-- base_geometries otherwise).
CREATE TABLE IF NOT EXISTS component_geometry_layers (
    geometry_hash TEXT,
    layer_seq INTEGER,
    material_name TEXT,
    thickness_m REAL,
    face_start INTEGER,
    face_count INTEGER,
    PRIMARY KEY (geometry_hash, layer_seq)
);
"""


# Default IFC classes for reference extraction
# Non-geometric IFC types — no 3D body, skip tessellation entirely.
# All other IfcProduct subclasses with a Representation are extracted.
NON_GEOMETRIC_CLASSES = {
    "IfcDistributionPort",    # logical connection points, no mesh
    "IfcGrid",                # reference grid lines, 2D only
    "IfcGridAxis",
    "IfcSpace",               # spatial container, no body
    "IfcZone",
    "IfcSpatialZone",
    "IfcAnnotation",          # 2D annotations
    "IfcVirtualElement",      # abstract boundary
    "IfcRelSpaceBoundary",
    "IfcBuildingStorey",      # spatial container
    "IfcBuilding",
    "IfcSite",
    "IfcProject",
    "IfcExternalSpatialElement",
}

# REFERENCE_CLASSES kept for backwards compatibility with callers that pass classes=
# The extraction loop now defaults to all IfcProduct — see extract_reference().
REFERENCE_CLASSES = None  # Deprecated: extraction now uses blacklist, not whitelist

# Discipline inference from IFC class
DISCIPLINE_MAP = {
    "IfcFlowTerminal": "MEP", "IfcFlowSegment": "MEP", "IfcFlowFitting": "MEP",
    "IfcPipeSegment": "MEP", "IfcPipeFitting": "MEP",
    "IfcDuctSegment": "MEP", "IfcDuctFitting": "MEP",
    "IfcValve": "MEP", "IfcFlowController": "MEP",
    "IfcSanitaryTerminal": "MEP",
    "IfcFireSuppressionTerminal": "FP", "IfcAlarm": "FP",
    "IfcSensor": "FP", "IfcController": "FP",
    "IfcLightFixture": "ELEC", "IfcElectricAppliance": "ELEC",
    "IfcCableSegment": "ELEC", "IfcCableFitting": "ELEC",
    "IfcCableCarrierSegment": "ELEC", "IfcCableCarrierFitting": "ELEC",
    "IfcDistributionControlElement": "ELEC", "IfcElectricDistributionBoard": "ELEC",
    "IfcElectricMotor": "ELEC", "IfcElectricGenerator": "ELEC",
    "IfcAirTerminal": "ACMV",
    "IfcPump": "MECH", "IfcFan": "MECH", "IfcUnitaryEquipment": "MECH",
    "IfcHeatExchanger": "MECH", "IfcBoiler": "MECH", "IfcChiller": "MECH",
    "IfcCoolingTower": "MECH", "IfcCompressor": "MECH", "IfcMotorConnection": "MECH",
    "IfcSprayTerminal": "FP",
    "IfcColumn": "STR", "IfcBeam": "STR", "IfcMember": "STR",
    "IfcPlate": "STR", "IfcReinforcingBar": "STR",
    # IFC4X3 Infrastructure disciplines
    "IfcGeographicElement": "GIS",
    "IfcRoad": "ROAD", "IfcRoadPart": "ROAD", "IfcKerb": "ROAD", "IfcPavement": "ROAD",
    "IfcRailway": "RAIL", "IfcRailwayPart": "RAIL", "IfcRail": "RAIL", "IfcTrackElement": "RAIL",
    "IfcBridge": "BRIDGE", "IfcBridgePart": "BRIDGE",
    "IfcTunnel": "TUNNEL", "IfcTunnelPart": "TUNNEL",
    "IfcMarineFacility": "MARINE", "IfcMarinePart": "MARINE",
    "IfcAlignment": "INFRA", "IfcLinearElement": "INFRA", "IfcLinearPositioningElement": "INFRA",
    "IfcEarthworksCut": "INFRA", "IfcEarthworksFill": "INFRA", "IfcEarthworksObstacle": "INFRA",
    "IfcCivilElement": "INFRA", "IfcFacility": "INFRA", "IfcFacilityPart": "INFRA",
}


def infer_discipline(ifc_class):
    return DISCIPLINE_MAP.get(ifc_class, "ARC")


# ---------------------------------------------------------------------------
# Geometry helpers
# ---------------------------------------------------------------------------

def geometry_hash(vertices_blob, faces_blob):
    """SHA256-based 16-char hash of centered geometry."""
    return hashlib.sha256(vertices_blob + faces_blob).hexdigest()[:16]


def decompose_iterator_matrix(mat_flat):
    """ONE implementation of the iterator-matrix → (center, Euler) decomposition (S173 math, factored
    out VERBATIM from the S172 iterator loop — do not re-derive it elsewhere). Input is the flat
    column-major 4x4 from ifcopenshell `shape.transformation.matrix`. Returns
    (mat4, rot3, center, rot_x, rot_y, rot_z). Used by the normal geometry path AND the §ANCHOR
    void-consumed path so both persist the SAME placement truth; P4 ROT_TRUTH checks this math at
    the event on every normally-imported element.
    """
    mat4 = np.array(mat_flat, dtype=np.float64).reshape(4, 4).T
    rot3 = mat4[:3, :3]
    center = mat4[:3, 3]
    sy = math.sqrt(rot3[0, 0]**2 + rot3[1, 0]**2)
    if sy > 1e-6:
        rot_x = math.atan2(rot3[2, 1], rot3[2, 2])
        rot_y = math.atan2(-rot3[2, 0], sy)
        rot_z = math.atan2(rot3[1, 0], rot3[0, 0])
    else:
        rot_x = math.atan2(-rot3[1, 2], rot3[1, 1])
        rot_y = math.atan2(-rot3[2, 0], sy)
        rot_z = 0.0
    return mat4, rot3, center, rot_x, rot_y, rot_z


def boolean_depth(item, depth=0, _visited=None):
    """Count max IfcBooleanResult chain depth in a representation item."""
    if _visited is None:
        _visited = set()
    eid = item.id()
    if eid in _visited:
        return depth
    _visited.add(eid)
    if item.is_a("IfcBooleanResult"):
        return max(
            boolean_depth(item.FirstOperand, depth + 1, _visited),
            boolean_depth(item.SecondOperand, depth + 1, _visited),
        )
    if item.is_a("IfcMappedItem"):
        try:
            for sub in item.MappingSource.MappedRepresentation.Items:
                d = boolean_depth(sub, depth, _visited)
                if d > depth:
                    depth = d
        except Exception:
            pass
    return depth


def element_boolean_depth(elem):
    """Return max boolean chain depth across all representations of an element."""
    try:
        if not elem.Representation:
            return 0
        max_d = 0
        for rep in elem.Representation.Representations:
            for item in rep.Items:
                d = boolean_depth(item)
                if d > max_d:
                    max_d = d
        return max_d
    except Exception:
        return 0


def bbox_from_placement(elem):
    """ILLEGAL FALLBACK — parametric box generation is a no-invent violation.

    If the tessellation engine cannot produce geometry for an element, that
    element must be SKIPPED, not replaced with a synthetic 1×1×1 box.
    A fake box in the library corrupts downstream consumers (viewer, BOM,
    spatial queries) and violates the EXTRACT-OR-COMPILE-ONLY prime rule.
    """
    guid = getattr(elem, 'GlobalId', '?')
    cls = elem.is_a() if hasattr(elem, 'is_a') else type(elem).__name__
    raise RuntimeError(
        f"§ILLEGAL_PARAMETRIC_FALLBACK: {cls} guid={guid} — "
        f"tessellation failed and bbox_from_placement is banned. "
        f"Add to NON_GEOMETRIC_CLASSES if this type has no mesh, "
        f"or fix the IFC source."
    )


# ---------------------------------------------------------------------------
# IFC spatial helpers
# ---------------------------------------------------------------------------

def get_storey_for_element(element):
    """Walk IFC containment to find storey name."""
    try:
        for rel in element.ContainedInStructure:
            container = rel.RelatingStructure
            if container.is_a("IfcBuildingStorey"):
                return container.Name
            if hasattr(container, "Decomposes"):
                for dec in container.Decomposes:
                    if dec.RelatingObject.is_a("IfcBuildingStorey"):
                        return dec.RelatingObject.Name
    except (AttributeError, TypeError):
        pass
    return "Unknown"


def get_space_for_element(element):
    """Find the IfcSpace containing this element (if any)."""
    try:
        for rel in element.ContainedInStructure:
            container = rel.RelatingStructure
            if container.is_a("IfcSpace"):
                return container
    except (AttributeError, TypeError):
        pass
    return None


# ---------------------------------------------------------------------------
# IFC Material extraction
# ---------------------------------------------------------------------------

def get_material_for_element(element):
    """Extract material name from IFC element via IfcRelAssociatesMaterial."""
    try:
        for rel in element.HasAssociations:
            if rel.is_a("IfcRelAssociatesMaterial"):
                mat = rel.RelatingMaterial
                if mat.is_a("IfcMaterial"):
                    return mat.Name
                elif mat.is_a("IfcMaterialLayerSetUsage"):
                    ls = mat.ForLayerSet
                    if ls and ls.LayerSetName:
                        return ls.LayerSetName
                    if ls and ls.MaterialLayers:
                        for layer in ls.MaterialLayers:
                            if layer.Material:
                                return layer.Material.Name
                elif mat.is_a("IfcMaterialLayerSet"):
                    if mat.LayerSetName:
                        return mat.LayerSetName
                    if mat.MaterialLayers:
                        for layer in mat.MaterialLayers:
                            if layer.Material:
                                return layer.Material.Name
                elif mat.is_a("IfcMaterialList"):
                    if mat.Materials:
                        return mat.Materials[0].Name
                elif mat.is_a("IfcMaterialConstituentSet"):
                    if hasattr(mat, 'Name') and mat.Name:
                        return mat.Name
                    if mat.MaterialConstituents:
                        for c in mat.MaterialConstituents:
                            if c.Material:
                                return c.Material.Name
                elif mat.is_a("IfcMaterialProfileSetUsage"):
                    ps = mat.ForProfileSet
                    if ps and hasattr(ps, 'Name') and ps.Name:
                        return ps.Name
                    if ps and ps.MaterialProfiles:
                        for mp in ps.MaterialProfiles:
                            if mp.Material:
                                return mp.Material.Name
    except (AttributeError, TypeError):
        pass
    return None


def get_colour_for_element(element):
    """Extract RGBA colour from IFC element via representation style chain.

    Walks: IfcProduct.Representation -> IfcRepresentationItem
           -> IfcStyledItem -> IfcPresentationStyleAssignment/IfcSurfaceStyle
           -> IfcSurfaceStyleRendering -> IfcColourRgb + Transparency
    """
    try:
        if not element.Representation:
            return None
        for rep in element.Representation.Representations:
            for item in rep.Items:
                colour = _extract_colour_from_item(item)
                if colour:
                    return colour
                # Check mapped items
                if item.is_a("IfcMappedItem"):
                    mapped_rep = item.MappingSource.MappedRepresentation
                    for sub_item in mapped_rep.Items:
                        colour = _extract_colour_from_item(sub_item)
                        if colour:
                            return colour
    except (AttributeError, TypeError):
        pass
    return None


def _extract_colour_from_item(item):
    try:
        if not hasattr(item, 'StyledByItem') or not item.StyledByItem:
            return None
        for styled in item.StyledByItem:
            if not styled.is_a("IfcStyledItem"):
                continue
            for style_select in styled.Styles:
                colour = _extract_colour_from_style(style_select)
                if colour:
                    return colour
    except (AttributeError, TypeError):
        pass
    return None


def _extract_colour_from_style(style_select):
    try:
        if style_select.is_a("IfcSurfaceStyle"):
            return _extract_colour_from_surface_style(style_select)
        if style_select.is_a("IfcPresentationStyleAssignment"):
            for s in style_select.Styles:
                if s.is_a("IfcSurfaceStyle"):
                    colour = _extract_colour_from_surface_style(s)
                    if colour:
                        return colour
    except (AttributeError, TypeError):
        pass
    return None


def _extract_colour_from_surface_style(surface_style):
    try:
        for ss in surface_style.Styles:
            if ss.is_a("IfcSurfaceStyleRendering") or ss.is_a("IfcSurfaceStyleShading"):
                colour = ss.SurfaceColour
                if colour and colour.is_a("IfcColourRgb"):
                    r = float(colour.Red)
                    g = float(colour.Green)
                    b = float(colour.Blue)
                    transparency = 0.0
                    if hasattr(ss, 'Transparency') and ss.Transparency is not None:
                        transparency = float(ss.Transparency)
                    alpha = 1.0 - transparency
                    return f"{r:.3f},{g:.3f},{b:.3f},{alpha:.3f}"
    except (AttributeError, TypeError):
        pass
    return None


# ---------------------------------------------------------------------------
# Rich surface style + material layer extraction
# ---------------------------------------------------------------------------

def extract_surface_styles(ifc_file, source_tag="EXTRACTED"):
    """Extract all IfcSurfaceStyle → surface_styles rows.

    Returns list of dicts ready for DB insertion.
    One row per unique style name (instanced, not per-element).
    """
    rows = []
    seen = set()
    for style in ifc_file.by_type('IfcSurfaceStyle'):
        name = style.Name
        if not name or name in seen:
            continue
        for ss in style.Styles:
            if ss.is_a('IfcSurfaceStyleRendering'):
                sc = ss.SurfaceColour
                if not sc or not sc.is_a('IfcColourRgb'):
                    continue
                row = {
                    'style_name': name,
                    'surface_r': float(sc.Red),
                    'surface_g': float(sc.Green),
                    'surface_b': float(sc.Blue),
                    'transparency': float(ss.Transparency) if ss.Transparency is not None else 0.0,
                    'reflectance_method': ss.ReflectanceMethod if ss.ReflectanceMethod else 'NOTDEFINED',
                    'side': style.Side if style.Side else 'BOTH',
                    'source': source_tag,
                    'specular_r': None, 'specular_g': None, 'specular_b': None,
                    'specular_ratio': None, 'specular_exponent': None,
                }
                # Specular colour: either IfcNormalisedRatioMeasure (ratio) or IfcColourRgb
                spec = ss.SpecularColour
                if spec is not None:
                    if hasattr(spec, 'wrappedValue'):
                        row['specular_ratio'] = float(spec.wrappedValue)
                    elif hasattr(spec, 'Red'):
                        row['specular_r'] = float(spec.Red)
                        row['specular_g'] = float(spec.Green)
                        row['specular_b'] = float(spec.Blue)
                # Specular highlight (exponent)
                highlight = ss.SpecularHighlight
                if highlight is not None:
                    if hasattr(highlight, 'wrappedValue'):
                        row['specular_exponent'] = float(highlight.wrappedValue)
                rows.append(row)
                seen.add(name)
                break  # one rendering per style name
            elif ss.is_a('IfcSurfaceStyleShading') and name not in seen:
                # Shading-only style (no specular data)
                sc = ss.SurfaceColour
                if not sc or not sc.is_a('IfcColourRgb'):
                    continue
                row = {
                    'style_name': name,
                    'surface_r': float(sc.Red),
                    'surface_g': float(sc.Green),
                    'surface_b': float(sc.Blue),
                    'transparency': float(ss.Transparency) if hasattr(ss, 'Transparency') and ss.Transparency is not None else 0.0,
                    'reflectance_method': 'NOTDEFINED',
                    'side': style.Side if style.Side else 'BOTH',
                    'source': source_tag,
                    'specular_r': None, 'specular_g': None, 'specular_b': None,
                    'specular_ratio': None, 'specular_exponent': None,
                }
                rows.append(row)
                seen.add(name)
                break
    return rows


def _length_unit_scale(ifc_file):
    """Authored length unit → metres. LayerThickness/OffsetFromReferenceLine are stored in the
    file's own unit (SampleCastle: millimetres, scale 0.001) — the *_m columns must be metres."""
    import ifcopenshell.util.unit as _ifcunit
    return float(_ifcunit.calculate_unit_scale(ifc_file, "LENGTHUNIT"))


def extract_material_layers(ifc_file):
    """Extract all IfcMaterialLayerSet → material_layers rows.

    Returns list of dicts ready for DB insertion. thickness_m is converted from the file's own
    length unit to metres (§LOD400-LAYERS-REAL fix 2026-07-30: raw source units were stored before,
    which was only correct for metre-unit files like Duplex; SampleCastle is mm).
    """
    scale = _length_unit_scale(ifc_file)
    rows = []
    seen = set()
    for layer_set in ifc_file.by_type('IfcMaterialLayerSet'):
        name = layer_set.LayerSetName
        if not name or name in seen:
            continue
        seen.add(name)
        for seq, layer in enumerate(layer_set.MaterialLayers):
            mat_name = layer.Material.Name if layer.Material else None
            thickness = float(layer.LayerThickness) * scale if layer.LayerThickness is not None else None
            is_vent = 1 if (hasattr(layer, 'IsVentilated') and layer.IsVentilated) else 0
            rows.append({
                'layer_set_name': name,
                'sequence': seq,
                'material_name': mat_name,
                'thickness_m': thickness,
                'is_ventilated': is_vent,
            })
    return rows


def extract_rel_material_layer_set(ifc_file):
    """§LOD400-ENVELOPE — extract the element→layer-set edge from IfcMaterialLayerSetUsage.

    Implementing prompts/RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §LOD400-LAYERS-EXTRACT
    Witness: W-LOD400-ENVELOPE

    Verbatim from the source, nothing derived: the layer set an element declares, how many layers it has,
    their summed thickness, and the placement data (LayerSetDirection / DirectionSense /
    OffsetFromReferenceLine) that §LOD400-LAYERS-REAL needs to slice the envelope along the authored axis.
    An element carrying a bare IfcMaterialLayerSet (no usage) is recorded too, with placement fields NULL.
    total_thickness_m / offset_from_reference_line are converted from the file's own length unit to
    metres (§LOD400-LAYERS-REAL fix 2026-07-30 — see extract_material_layers).
    """
    scale = _length_unit_scale(ifc_file)
    rows = []
    for rel in ifc_file.by_type('IfcRelAssociatesMaterial'):
        mat = rel.RelatingMaterial
        if mat is None:
            continue
        if mat.is_a('IfcMaterialLayerSetUsage'):
            ls = mat.ForLayerSet
            direction = getattr(mat, 'LayerSetDirection', None)
            sense = getattr(mat, 'DirectionSense', None)
            offset = getattr(mat, 'OffsetFromReferenceLine', None)
        elif mat.is_a('IfcMaterialLayerSet'):
            ls, direction, sense, offset = mat, None, None, None
        else:
            continue
        if ls is None or not ls.MaterialLayers:
            continue
        layers = ls.MaterialLayers
        total = 0.0
        for lay in layers:
            if lay.LayerThickness is not None:
                total += float(lay.LayerThickness) * scale
        for obj in rel.RelatedObjects:
            guid = getattr(obj, 'GlobalId', None)
            if not guid:
                continue
            rows.append({
                'element_guid': guid,
                'layer_set_name': ls.LayerSetName,
                'layer_count': len(layers),
                'total_thickness_m': total,
                'layer_set_direction': direction,
                'direction_sense': sense,
                'offset_from_reference_line':
                    float(offset) * scale if offset is not None else None,
            })
    return rows


def write_rel_material_layer_set(conn, rows):
    """Write rel_material_layer_set rows to DB (§LOD400-ENVELOPE)."""
    for r in rows:
        conn.execute(
            "INSERT OR REPLACE INTO rel_material_layer_set "
            "(element_guid, layer_set_name, layer_count, total_thickness_m, "
            "layer_set_direction, direction_sense, offset_from_reference_line) "
            "VALUES (?,?,?,?,?,?,?)",
            (r['element_guid'], r['layer_set_name'], r['layer_count'],
             r['total_thickness_m'], r['layer_set_direction'],
             r['direction_sense'], r['offset_from_reference_line']))
    conn.commit()


def write_surface_styles(conn, styles):
    """Write surface_styles rows to DB."""
    for s in styles:
        conn.execute(
            "INSERT OR REPLACE INTO surface_styles "
            "(style_name, surface_r, surface_g, surface_b, transparency, "
            "specular_r, specular_g, specular_b, specular_ratio, specular_exponent, "
            "reflectance_method, side, source) "
            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (s['style_name'], s['surface_r'], s['surface_g'], s['surface_b'],
             s['transparency'], s['specular_r'], s['specular_g'], s['specular_b'],
             s['specular_ratio'], s['specular_exponent'],
             s['reflectance_method'], s['side'], s['source']))
    conn.commit()


def write_material_layers(conn, layers):
    """Write material_layers rows to DB."""
    for l in layers:
        conn.execute(
            "INSERT OR REPLACE INTO material_layers "
            "(layer_set_name, sequence, material_name, thickness_m, is_ventilated) "
            "VALUES (?,?,?,?,?)",
            (l['layer_set_name'], l['sequence'], l['material_name'],
             l['thickness_m'], l['is_ventilated']))
    conn.commit()


# ---------------------------------------------------------------------------
# §LOD400-LAYERS-REAL — compile per-layer slab geometry from authored layer sets
# Implementing prompts/RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §THE FIX item 2 (CALL MADE 2026-07-30:
# option (b) — ONE layered mesh per element behind the existing geometry_hash + a per-layer index
# table). Witness: scripts/witness_lod400_envelope.py.
#
# COMPILATION FROM AUTHORED DATA, zero invention: every number below comes from
# rel_material_layer_set (LayerSetDirection / DirectionSense / OffsetFromReferenceLine /
# total_thickness_m) joined to material_layers (per-layer thickness_m, material_name), applied to the
# authored envelope solid the tessellator produced. Anything missing or ambiguous REFUSES that element
# loudly (§LAYER-REFUSE, counted) — never a guess, never a default (feedback_no_invent_rules).
#
# Slicing mechanism (stated per spec): OCC booleans are NOT available in this environment (no
# pythonocc; ifcopenshell 0.8.4 exposes no python-level boolean API), so the slice is a plane-clip of
# the tessellated closed solid — Sutherland-Hodgman clip of side triangles against the two layer
# planes, plus caps built from the mesh's own cross-section loops (edge-key-chained, watertight-exact)
# triangulated by GEOS constrained Delaunay (shapely ≥2.1, hole-aware, no Steiner points, area-exact).
# Every slab is then PROVEN: welded, watertight, extent along the layer axis == authored thickness,
# and the slab volumes re-sum to the envelope volume — any miss is a loud refusal, because a
# wrong-but-silent slice is worse than a loud refusal.
# ---------------------------------------------------------------------------

LAYER_TOL = 5e-4        # m (0.5 mm) — boundary/extent alignment tolerance (stated, tight)
LAYER_SUM_TOL = 1e-6    # m — authored per-layer thicknesses must re-sum to authored total
LAYER_VOL_RTOL = 1e-4   # relative — slab volumes must re-sum to the envelope volume
_LAYER_AXIS = {"AXIS1": 0, "AXIS2": 1, "AXIS3": 2}


class LayerRefusal(Exception):
    """§LAYER-REFUSE — authored data missing/ambiguous for a deterministic slice. Never guess."""


def _weld_mesh(verts, faces, decimals=9):
    """Weld vertices by rounded coordinate (1e-9 m — far below LAYER_TOL, far above FP noise)."""
    v = np.round(np.asarray(verts, dtype=np.float64), decimals)
    uq, inv = np.unique(v, axis=0, return_inverse=True)
    f = inv[np.asarray(faces, dtype=np.int64)]
    keep = (f[:, 0] != f[:, 1]) & (f[:, 1] != f[:, 2]) & (f[:, 2] != f[:, 0])
    return uq, f[keep]


def _mesh_signed_volume(verts, faces):
    """Divergence-theorem signed volume. Positive when winding is outward (CCW seen from outside)."""
    a = verts[faces[:, 0]]
    b = verts[faces[:, 1]]
    c = verts[faces[:, 2]]
    return float(np.einsum("ij,ij->i", a, np.cross(b, c)).sum() / 6.0)


def _assert_watertight(faces, what):
    """Every undirected edge must be shared by exactly 2 triangles, else the solid is open."""
    edges = {}
    for tri in faces:
        i0, i1, i2 = int(tri[0]), int(tri[1]), int(tri[2])
        for i, j in ((i0, i1), (i1, i2), (i2, i0)):
            k = (i, j) if i < j else (j, i)
            edges[k] = edges.get(k, 0) + 1
    bad = sum(1 for n in edges.values() if n != 2)
    if bad:
        raise LayerRefusal(f"{what} not watertight ({bad}/{len(edges)} edges not shared by exactly 2 faces)")


def _orient_coherently(verts, faces):
    """Normalize triangle winding to a coherent, outward orientation.

    Some source envelope tessellations carry MIXED winding (measured on Duplex: party wall
    03847df201d733a4, a ~21 m³ solid whose signed volume came out -2.08 because face contributions
    cancel). Edge-count watertightness passes but volume accounting and cap orientation break.
    This propagates one orientation across shared edges (BFS), verifies the result is orientable,
    then flips each closed component so its signed volume is positive (outward normals). Pure
    normalization of OUR OWN triangle vertex order — the solid itself is untouched. Refuses
    (never guesses) on non-manifold, non-orientable, or nested-component (cavity) input.
    """
    nf = len(faces)
    edge_map = {}
    for fi in range(nf):
        a, b, c = int(faces[fi][0]), int(faces[fi][1]), int(faces[fi][2])
        for i, j in ((a, b), (b, c), (c, a)):
            key = (i, j) if i < j else (j, i)
            edge_map.setdefault(key, []).append((fi, i < j))
    flip = np.zeros(nf, dtype=bool)
    seen = np.zeros(nf, dtype=bool)
    comp_id = np.full(nf, -1, dtype=np.int64)
    ncomp = 0
    for seed in range(nf):
        if seen[seed]:
            continue
        stack = [seed]
        seen[seed] = True
        comp_id[seed] = ncomp
        while stack:
            fi = stack.pop()
            a, b, c = int(faces[fi][0]), int(faces[fi][1]), int(faces[fi][2])
            for i, j in ((a, b), (b, c), (c, a)):
                key = (i, j) if i < j else (j, i)
                pair = edge_map[key]
                if len(pair) != 2:
                    raise LayerRefusal("envelope not edge-manifold during winding normalization")
                fwd_i = (i < j)
                for (fj, fwd_j) in pair:
                    if fj == fi or seen[fj]:
                        continue
                    # coherent neighbours traverse a shared edge in OPPOSITE directions
                    flip[fj] = ((fwd_i ^ bool(flip[fi])) == fwd_j)
                    seen[fj] = True
                    comp_id[fj] = ncomp
                    stack.append(fj)
        ncomp += 1
    out = faces.copy()
    out[flip] = out[flip][:, [0, 2, 1]]
    # orientability proof: every undirected edge must now be traversed once each way
    dirs = {}
    for fi in range(nf):
        a, b, c = int(out[fi][0]), int(out[fi][1]), int(out[fi][2])
        for i, j in ((a, b), (b, c), (c, a)):
            key = (i, j) if i < j else (j, i)
            dirs.setdefault(key, []).append(i < j)
        # (verified below in one pass)
    for key, dd in dirs.items():
        if len(dd) != 2 or dd[0] == dd[1]:
            raise LayerRefusal("envelope surface is non-orientable — cannot normalize winding")
    if ncomp > 1:
        boxes = []
        for ci in range(ncomp):
            used = np.unique(out[comp_id == ci])
            boxes.append((verts[used].min(axis=0), verts[used].max(axis=0)))
        for ci in range(ncomp):
            for cj in range(ncomp):
                if ci != cj and np.all(boxes[ci][0] >= boxes[cj][0] - 1e-9) \
                        and np.all(boxes[ci][1] <= boxes[cj][1] + 1e-9):
                    raise LayerRefusal("nested closed components (internal cavity?) — ambiguous "
                                       "orientation, refusing")
    for ci in range(ncomp):
        mask = comp_id == ci
        if _mesh_signed_volume(verts, out[mask]) < 0:
            sub = out[mask]
            out[mask] = sub[:, [0, 2, 1]]
    return out


def _cross_section_loops(verts, faces, k, c):
    """Closed cross-section loops of a watertight mesh at plane axis_k = c.

    Intersection points are keyed by the mesh EDGE they lie on (canonical i<j order), so segments from
    the two triangles sharing an edge chain bit-identically. Returns loops as lists of 3D points.
    """
    s = verts[:, k] - c
    if np.any(np.abs(s) < 1e-7):
        raise LayerRefusal(f"mesh vertex lies on interior cut plane axis{k}={c:.6f} (ambiguous cut)")
    pos = s > 0
    pts = {}
    adj = {}
    for tri in faces:
        keys = []
        for i, j in ((int(tri[0]), int(tri[1])), (int(tri[1]), int(tri[2])), (int(tri[2]), int(tri[0]))):
            if pos[i] != pos[j]:
                key = (i, j) if i < j else (j, i)
                if key not in pts:
                    i0, j0 = key
                    t = s[i0] / (s[i0] - s[j0])
                    pts[key] = verts[i0] + t * (verts[j0] - verts[i0])
                keys.append(key)
        if len(keys) == 2:
            adj.setdefault(keys[0], []).append(keys[1])
            adj.setdefault(keys[1], []).append(keys[0])
        elif len(keys) != 0:
            raise LayerRefusal(f"degenerate plane crossing at axis{k}={c:.6f} (triangle cut on {len(keys)} edges)")
    loops = []
    visited = set()
    for start in adj:
        if start in visited:
            continue
        if len(adj[start]) != 2:
            raise LayerRefusal(f"non-manifold cross-section at axis{k}={c:.6f} (cut-edge degree != 2)")
        loop = [start]
        visited.add(start)
        prev, cur = None, start
        while True:
            nbrs = adj[cur]
            if len(nbrs) != 2:
                raise LayerRefusal(f"non-manifold cross-section at axis{k}={c:.6f} (cut-edge degree != 2)")
            nxt = nbrs[0] if nbrs[0] != prev else nbrs[1]
            if nxt == start:
                break
            if nxt in visited:
                raise LayerRefusal(f"cross-section loop chaining failed at axis{k}={c:.6f}")
            loop.append(nxt)
            visited.add(nxt)
            prev, cur = cur, nxt
        if len(loop) >= 3:
            loops.append([pts[key] for key in loop])
    if not loops:
        raise LayerRefusal(f"no cross-section at interior plane axis{k}={c:.6f} (disjoint envelope body?)")
    return loops


def _cap_triangles(loops, k, c, ccw):
    """Triangulate the cross-section (even-odd loop nesting → shells with holes) at plane axis_k=c.

    Uses GEOS constrained Delaunay (shapely ≥2.1): hole-aware, no Steiner points (cap boundary verts
    stay exactly the loop points, so caps weld watertight against the clipped side triangles), and the
    triangulated area is asserted equal to the polygon area. Winding: with u=(k+1)%3, v=(k+2)%3
    (cyclic), a CCW-in-(u,v) triangle has normal +axis_k; ccw=True requests that orientation.
    """
    import shapely
    from shapely.geometry import Polygon

    from shapely.geometry import Point

    u, v = (k + 1) % 3, (k + 2) % 3
    rings2d = [[(float(p[u]), float(p[v])) for p in lp] for lp in loops]
    polys = [Polygon(r) for r in rings2d]
    for pg in polys:
        if not pg.is_valid or pg.area <= 1e-12:
            raise LayerRefusal(f"invalid/degenerate cross-section loop at axis{k}={c:.6f}")
    n = len(polys)
    # Even-odd nesting depth. Test a BOUNDARY vertex of loop i against ring j — a representative
    # (interior) point of a hole-less ring can land inside a nested hole and misclassify the shell
    # as a hole (measured on Duplex wall 1e0b18680430915f: outer 25.3 m² + 11.7 m² opening → both
    # loops reported depth 1 and the cap came out EMPTY). Manifold cross-section loops are disjoint,
    # so a boundary vertex is strictly inside or outside every other ring.
    depth = [0] * n
    pts0 = [Point(rings2d[i][0]) for i in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j and polys[j].contains(pts0[i]):
                depth[i] += 1
    tris2d = []
    for si in range(n):
        if depth[si] % 2 != 0:
            continue  # a hole ring — consumed by its shell below
        holes = [rings2d[j] for j in range(n)
                 if j != si and depth[j] == depth[si] + 1 and polys[si].contains(pts0[j])]
        pg = Polygon(rings2d[si], holes=holes)
        if not pg.is_valid:
            raise LayerRefusal(f"cross-section polygon invalid at axis{k}={c:.6f} (self-intersection)")
        cdt = shapely.constrained_delaunay_triangles(pg)
        got = sum(g.area for g in cdt.geoms)
        if abs(got - pg.area) > 1e-9 + 1e-6 * pg.area:
            raise LayerRefusal(f"cap triangulation area mismatch at axis{k}={c:.6f} "
                               f"({got:.9f} vs {pg.area:.9f} m²)")
        for g in cdt.geoms:
            tris2d.append(list(g.exterior.coords)[:3])
    verts3d = []
    tris = []
    for t2 in tris2d:
        (x0, y0), (x1, y1), (x2, y2) = t2
        area2 = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0)
        if area2 == 0.0:
            continue
        if (area2 > 0) != ccw:
            t2 = [t2[0], t2[2], t2[1]]
        base = len(verts3d)
        for (x, y) in t2:
            p = [0.0, 0.0, 0.0]
            p[k] = c
            p[u] = x
            p[v] = y
            verts3d.append(p)
        tris.append((base, base + 1, base + 2))
    return verts3d, tris


def _clip_poly_halfspace(poly, k, c, keep_ge):
    """Sutherland-Hodgman clip of a 3D polygon against axis_k >= c (keep_ge) or axis_k <= c."""
    out = []
    n = len(poly)
    for i in range(n):
        p, q = poly[i], poly[(i + 1) % n]
        sp = (p[k] - c) if keep_ge else (c - p[k])
        sq = (q[k] - c) if keep_ge else (c - q[k])
        if sp >= 0:
            out.append(p)
            if sq < 0:
                out.append(p + (sp / (sp - sq)) * (q - p))
        elif sq >= 0:
            out.append(p + (sp / (sp - sq)) * (q - p))
    return out


def _slice_slab(verts, faces, k, lo, hi, ymin, ymax, vol_sign):
    """One layer slab = mesh ∩ {lo <= axis_k <= hi}, capped at interior planes, welded, watertight.

    The envelope's own outer faces close the slab at lo==body-min / hi==body-max; caps are built only
    at planes strictly inside the body. vol_sign = sign of the envelope's signed volume, used to
    orient cap windings outward.
    """
    sv = []
    st = []
    vk = verts[:, k]
    fmin = vk[faces].min(axis=1)
    fmax = vk[faces].max(axis=1)
    inside = (fmin >= lo - 1e-12) & (fmax <= hi + 1e-12)
    for tri in faces[inside]:
        base = len(sv)
        sv.extend((verts[tri[0]], verts[tri[1]], verts[tri[2]]))
        st.append((base, base + 1, base + 2))
    crossing = (~inside) & (fmax > lo) & (fmin < hi)
    for tri in faces[crossing]:
        poly = [verts[tri[0]].copy(), verts[tri[1]].copy(), verts[tri[2]].copy()]
        poly = _clip_poly_halfspace(poly, k, lo, True)
        if len(poly) >= 3:
            poly = _clip_poly_halfspace(poly, k, hi, False)
        if len(poly) >= 3:
            base = len(sv)
            sv.extend(poly)
            for t in range(1, len(poly) - 1):
                st.append((base, base + t, base + t + 1))
    for c, upper in ((lo, False), (hi, True)):
        if ymin + LAYER_TOL < c < ymax - LAYER_TOL:
            ccw = (upper == (vol_sign > 0))
            cv, ct = _cap_triangles(_cross_section_loops(verts, faces, k, c), k, c, ccw)
            base = len(sv)
            sv.extend(np.asarray(cv, dtype=np.float64))
            st.extend((a + base, b + base, d + base) for (a, b, d) in ct)
    if not st:
        raise LayerRefusal(f"empty slab in [{lo:.4f},{hi:.4f}] on axis {k} despite body coverage")
    slab_v, slab_f = _weld_mesh(np.asarray(sv, dtype=np.float64), np.asarray(st, dtype=np.int64))
    _assert_watertight(slab_f, f"layer slab [{lo:.4f},{hi:.4f}]")
    return slab_v, slab_f


def _layer_intervals(off, sense, thicknesses, ymin, ymax, guid, axis_vals=None):
    """Authored layer intervals along the layer axis + coverage classification against the body span.

    Two deterministic anchorings, both pure authored data (measured on Duplex 2026-07-30):
      ABSOLUTE — boundaries b_j = OffsetFromReferenceLine ± cumsum(thickness). Valid when BOTH body
        faces land on authored boundaries (±LAYER_TOL). The body may cover a contiguous WHOLE-layer
        subset (party walls: an authored half-space clip trims the neighbour-side finish layers,
        whose material belongs to the neighbour's body). A clipped-away layer gets NO index row —
        the remaining slabs are the element's own real material and ship as LOD400 (user exception
        ruling 2026-07-31: the no-fallback rule bans invented content, not honest whole-layer
        subsets). An empty ROW is still forbidden (face_count>0 on every row that exists, row 33).
      RELATIVE — body extent == authored total (±LAYER_TOL): boundaries anchor at the body face the
        DirectionSense stacks from (MlsBase). Needed where the exporter left the usage offset at the
        reference geometry while placing the body elsewhere in the local frame (Duplex ceilings:
        offset=0, body at z≈2.6, extent==total).
    Anything matching neither is REFUSED. Returns list of (lo, hi, covered) per layer sequence.
    """
    sign = 1.0 if sense == "POSITIVE" else -1.0
    cum = np.concatenate([[0.0], np.cumsum(thicknesses)])

    def classify(bounds):
        # Snap boundaries onto the body's own float32 face coordinates when within LAYER_TOL —
        # the authored numbers are float64-exact while the mesh is float32; without the snap the
        # body's outer face falls a half-ULP outside its own slab and gets clipped into FP-noise.
        bounds = np.where(np.abs(bounds - ymin) < LAYER_TOL, ymin, bounds)
        bounds = np.where(np.abs(bounds - ymax) < LAYER_TOL, ymax, bounds)
        # Nudge an INTERIOR boundary off any mesh vertex sitting exactly on it (edge-keyed loop
        # chaining needs a clean cut). The nudge is bounded by LAYER_TOL/2 — inside the stated
        # tolerance the whole compilation operates under — and the slab extent + volume proofs
        # still verify the result; if no clean cut exists within the bound, the mode is invalid
        # and the element is refused, never guessed.
        if axis_vals is not None:
            for bi in range(len(bounds)):
                b = bounds[bi]
                if b == ymin or b == ymax or np.min(np.abs(axis_vals - b)) >= 1e-7:
                    continue
                for step in range(1, int(LAYER_TOL / 2 / 1e-6) + 1):
                    cands = [b + step * 1e-6, b - step * 1e-6]
                    hit = next((cd for cd in cands
                                if np.min(np.abs(axis_vals - cd)) >= 1e-7), None)
                    if hit is not None:
                        bounds[bi] = hit
                        break
                else:
                    return None
        ivals = []
        for j in range(len(thicknesses)):
            lo, hi = sorted((bounds[j], bounds[j + 1]))
            if hi <= ymin + LAYER_TOL or lo >= ymax - LAYER_TOL:
                ivals.append((lo, hi, False))          # wholly outside the body
            elif lo >= ymin - LAYER_TOL and hi <= ymax + LAYER_TOL:
                ivals.append((lo, hi, True))           # wholly inside the body
            else:
                return None                            # partial-layer coverage — ambiguous
        if not any(cov for (_, _, cov) in ivals):
            return None
        return ivals

    if off is not None:
        b_abs = off + sign * cum
        if min(abs(b_abs - ymin)) < LAYER_TOL and min(abs(b_abs - ymax)) < LAYER_TOL:
            ivals = classify(b_abs)
            if ivals is not None:
                return ivals
    extent = ymax - ymin
    total = float(cum[-1])
    if abs(extent - total) < LAYER_TOL:
        anchor = ymin if sense == "POSITIVE" else ymax
        ivals = classify(anchor + sign * cum)
        if ivals is not None:
            return ivals
    raise LayerRefusal(
        f"body span [{ymin:.4f},{ymax:.4f}] (extent {extent:.4f}) does not align with the authored "
        f"layer set (total {total:.4f}, offset {off}, sense {sense}) under absolute OR relative "
        f"anchoring — guid={guid}")


def compile_layer_geometry(conn, geo_conn=None):
    """§LOD400-LAYERS-REAL main entry: rewrite every multi-layer element's envelope mesh as N
    concatenated layer slabs + component_geometry_layers index rows (option (b), CALL MADE 2026-07-30).

    Dedup safety: a geometry_hash may be shared by several guids. The hash is rewritten IN PLACE only
    when every sharer carries the identical layer set; otherwise the layered variant is SPLIT to a new
    content hash and only the matching guids are repointed — one element's layers never leak onto
    another. Returns (compiled_elements, refusals, already_layered_hashes).
    """
    store = geo_conn if geo_conn is not None else conn
    blob_table = "component_geometries" if geo_conn is not None else "base_geometries"
    store.execute("""CREATE TABLE IF NOT EXISTS component_geometry_layers (
        geometry_hash TEXT, layer_seq INTEGER, material_name TEXT, thickness_m REAL,
        face_start INTEGER, face_count INTEGER, PRIMARY KEY (geometry_hash, layer_seq))""")

    elems = conn.execute("""
        SELECT r.element_guid, i.geometry_hash, r.layer_set_name, r.layer_count,
               r.total_thickness_m, r.layer_set_direction, r.direction_sense,
               r.offset_from_reference_line
        FROM rel_material_layer_set r
        JOIN element_instances i ON i.guid = r.element_guid
        WHERE r.layer_count > 1""").fetchall()
    already = {h for (h,) in store.execute(
        "SELECT DISTINCT geometry_hash FROM component_geometry_layers")}

    by_hash = {}
    for row in elems:
        by_hash.setdefault(row[1], []).append(row)

    refusals = []
    compiled_elems = 0
    compiled_hashes = 0
    total_slabs = 0
    n_already = 0

    def refuse(guid, ghash, reason):
        refusals.append((guid, ghash, reason))
        print(f"  §LAYER-REFUSE guid={guid} hash={ghash} — {reason}")

    for ghash, members in sorted(by_hash.items()):
        if ghash in already:
            n_already += 1
            continue
        sharers = [g for (g,) in conn.execute(
            "SELECT guid FROM element_instances WHERE geometry_hash = ?", (ghash,))]
        sigs = {}
        for (guid, _h, lsn, lc, tot, direction, sense, off) in members:
            sigs.setdefault((lsn, lc, tot, direction, sense, off), []).append(guid)
        plain = [g for g in sharers if g not in {m[0] for m in members}]
        in_place = (len(sigs) == 1 and not plain)

        row = store.execute(
            f"SELECT vertices, faces FROM {blob_table} WHERE geometry_hash = ?", (ghash,)).fetchone()
        if row is None or row[0] is None or row[1] is None:
            for (guid, *_rest) in members:
                refuse(guid, ghash, f"no mesh blob in {blob_table} for this hash")
            continue
        env_v64 = np.frombuffer(row[0], dtype=np.float32).reshape(-1, 3).astype(np.float64)
        env_f = np.frombuffer(row[1], dtype=np.int32).reshape(-1, 3)

        for (lsn, lc, tot, direction, sense, off), guids in sorted(sigs.items()):
            try:
                if direction not in _LAYER_AXIS:
                    raise LayerRefusal(f"LayerSetDirection missing/unknown ({direction!r})")
                if sense not in ("POSITIVE", "NEGATIVE"):
                    raise LayerRefusal(f"DirectionSense missing/unknown ({sense!r})")
                if tot is None or tot <= 0:
                    raise LayerRefusal(f"authored total thickness missing/zero ({tot!r})")
                lay_rows = conn.execute(
                    "SELECT sequence, material_name, thickness_m FROM material_layers "
                    "WHERE layer_set_name = ? ORDER BY sequence", (lsn,)).fetchall()
                if len(lay_rows) != lc:
                    raise LayerRefusal(f"material_layers has {len(lay_rows)} rows for set {lsn!r} "
                                       f"but the authored usage declares layer_count={lc}")
                if any(t is None or t <= 0 for (_s, _m, t) in lay_rows):
                    raise LayerRefusal(f"a layer thickness is missing/zero in set {lsn!r}")
                thicknesses = [float(t) for (_s, _m, t) in lay_rows]
                if abs(sum(thicknesses) - float(tot)) > LAYER_SUM_TOL:
                    raise LayerRefusal(f"authored layer thicknesses sum {sum(thicknesses):.6f} != "
                                       f"authored total {tot:.6f} for set {lsn!r}")

                verts, faces = _weld_mesh(env_v64, env_f)
                _assert_watertight(faces, "envelope")
                faces = _orient_coherently(verts, faces)
                env_vol = _mesh_signed_volume(verts, faces)
                if abs(env_vol) < 1e-12:
                    raise LayerRefusal("envelope has zero volume")
                k = _LAYER_AXIS[direction]
                ymin = float(verts[:, k].min())
                ymax = float(verts[:, k].max())
                ivals = _layer_intervals(off, sense, thicknesses, ymin, ymax, guids[0],
                                         axis_vals=np.unique(verts[:, k]))

                buf_v = []
                buf_f = []
                layer_rows_out = []
                vol_sum = 0.0
                face_cursor = 0
                vert_cursor = 0
                clipped = []
                for seq, ((lo, hi, covered), (_s, mat, th)) in enumerate(zip(ivals, lay_rows)):
                    if not covered:
                        # User exception ruling 2026-07-31 (row 33 addendum): a whole layer the
                        # authored geometry clips away (e.g. a half-space trim handing that layer
                        # to the neighbour wall's body) is LEGIT — the slabs that remain are the
                        # wall's own real material, not a fallback. The no-fallback rule bans
                        # INVENTED/substituted content, not fewer parts than the type list. So:
                        # NO row for this layer (an empty row is still a lie — face_count>0 holds
                        # on every row that exists), announced loudly below, never invented.
                        clipped.append(seq)
                        continue
                    slab_v, slab_f = _slice_slab(verts, faces, k,
                                                 max(lo, ymin), min(hi, ymax),
                                                 ymin, ymax, 1.0 if env_vol > 0 else -1.0)
                    ext = float(slab_v[:, k].max() - slab_v[:, k].min())
                    if abs(ext - float(th)) > LAYER_TOL:
                        raise LayerRefusal(f"slab {seq} extent {ext:.4f} != authored layer "
                                           f"thickness {th:.4f} (set {lsn!r})")
                    svol = _mesh_signed_volume(slab_v, slab_f)
                    if svol * env_vol <= 0:
                        raise LayerRefusal(f"slab {seq} signed volume {svol:.6e} inverted vs "
                                           f"envelope {env_vol:.6e}")
                    vol_sum += svol
                    buf_v.append(slab_v)
                    buf_f.append(slab_f + vert_cursor)
                    layer_rows_out.append((seq, mat, float(th), face_cursor, len(slab_f)))
                    face_cursor += len(slab_f)
                    vert_cursor += len(slab_v)
                if abs(vol_sum - env_vol) > max(1e-9, LAYER_VOL_RTOL * abs(env_vol)):
                    raise LayerRefusal(f"slab volumes sum {vol_sum:.9f} != envelope volume "
                                       f"{env_vol:.9f} m³ — the slice lost or invented material")

                if not layer_rows_out:
                    raise LayerRefusal(
                        f"every layer of set {lsn!r} lies outside the body — nothing to compile")
                new_vblob = np.vstack(buf_v).astype(np.float32).tobytes()
                new_fblob = np.vstack(buf_f).astype(np.int32).tobytes()
                v_count = len(new_vblob) // 12
                f_count = len(new_fblob) // 12
                if clipped:
                    print(f"  §LAYER-CLIP guid={guids[0]}{' (+%d sharer)' % (len(guids)-1) if len(guids)>1 else ''} "
                          f"set={lsn!r}: layers {clipped} clipped away by authored geometry — outside "
                          f"this element's own body [{ymin:.4f},{ymax:.4f}]; rows omitted (the "
                          f"{len(layer_rows_out)} remaining slabs are the element's real material)")

                if in_place:
                    write_hash = ghash
                    store.execute(f"UPDATE {blob_table} SET vertices=?, faces=?, "
                                  f"vertex_count=?, face_count=? WHERE geometry_hash=?",
                                  (new_vblob, new_fblob, v_count, f_count, ghash))
                    if geo_conn is not None:
                        conn.execute("UPDATE base_geometries SET vertex_count=?, face_count=? "
                                     "WHERE geometry_hash=?", (v_count, f_count, ghash))
                else:
                    write_hash = geometry_hash(new_vblob, new_fblob)
                    if geo_conn is not None:
                        store.execute("INSERT OR IGNORE INTO component_geometries "
                                      "(geometry_hash, vertices, faces, normals, vertex_count, face_count) "
                                      "VALUES (?,?,?,NULL,?,?)",
                                      (write_hash, new_vblob, new_fblob, v_count, f_count))
                        conn.execute("INSERT OR IGNORE INTO base_geometries "
                                     "(geometry_hash, vertices, faces, vertex_count, face_count) "
                                     "VALUES (?,NULL,NULL,?,?)", (write_hash, v_count, f_count))
                    else:
                        conn.execute("INSERT OR IGNORE INTO base_geometries "
                                     "(geometry_hash, vertices, faces, vertex_count, face_count) "
                                     "VALUES (?,?,?,?,?)",
                                     (write_hash, new_vblob, new_fblob, v_count, f_count))
                    qmarks = ",".join("?" * len(guids))
                    conn.execute(f"UPDATE element_instances SET geometry_hash=? "
                                 f"WHERE guid IN ({qmarks})", [write_hash] + guids)
                    print(f"  §LAYER-SPLIT hash {ghash} shared by mixed layer sets — {len(guids)} "
                          f"element(s) repointed to layered hash {write_hash}")

                store.execute("DELETE FROM component_geometry_layers WHERE geometry_hash=?",
                              (write_hash,))
                store.executemany("INSERT INTO component_geometry_layers "
                                  "(geometry_hash, layer_seq, material_name, thickness_m, "
                                  "face_start, face_count) VALUES (?,?,?,?,?,?)",
                                  [(write_hash, seq, mat, th, fs, fc)
                                   for (seq, mat, th, fs, fc) in layer_rows_out])
                compiled_elems += len(guids)
                compiled_hashes += 1
                total_slabs += sum(1 for r in layer_rows_out if r[4] > 0)
            except LayerRefusal as exc:
                for guid in guids:
                    refuse(guid, ghash, str(exc))

        # a split that repointed every sharer leaves the envelope blob orphaned — drop it
        if not in_place:
            left = conn.execute("SELECT COUNT(*) FROM element_instances WHERE geometry_hash=?",
                                (ghash,)).fetchone()[0]
            if left == 0:
                store.execute(f"DELETE FROM {blob_table} WHERE geometry_hash=?", (ghash,))
                if geo_conn is not None:
                    conn.execute("DELETE FROM base_geometries WHERE geometry_hash=?", (ghash,))

    conn.commit()
    if geo_conn is not None:
        geo_conn.commit()
    print(f"  §LOD400-SLICE compiled {compiled_elems} element(s) / {compiled_hashes} hash(es) into "
          f"{total_slabs} layer slabs (every row face_count>0 — row 33); "
          f"refused={len(refusals)}; already-layered={n_already}")
    return compiled_elems, refusals, n_already


def verify_layer_geometry(conn, geo_conn=None):
    """Cross-check the layered store against the authored tables. Any inconsistency is a loud,
    counted §LAYER-VERIFY-FAIL — this is the falsification surface the witness attacks (delete one
    material_layers row: the 7-layer usage must hard-fail, never silently ship 6 slabs)."""
    store = geo_conn if geo_conn is not None else conn
    blob_table = "component_geometries" if geo_conn is not None else "base_geometries"
    fails = 0

    def bad(guid, reason):
        nonlocal fails
        fails += 1
        print(f"  §LAYER-VERIFY-FAIL guid={guid} — {reason}")

    for (guid, ghash, lsn, lc, tot) in conn.execute("""
            SELECT r.element_guid, i.geometry_hash, r.layer_set_name, r.layer_count,
                   r.total_thickness_m
            FROM rel_material_layer_set r
            JOIN element_instances i ON i.guid = r.element_guid
            WHERE r.layer_count > 1""").fetchall():
        lay = conn.execute("SELECT sequence, material_name, thickness_m FROM material_layers "
                           "WHERE layer_set_name=? ORDER BY sequence", (lsn,)).fetchall()
        if len(lay) != lc:
            bad(guid, f"material_layers has {len(lay)} rows for set {lsn!r} but authored "
                      f"layer_count={lc} — refusing to ship {len(lay)} slabs as {lc} layers")
            continue
        if any(t is None for (_s, _m, t) in lay):
            bad(guid, f"NULL thickness in set {lsn!r}")
            continue
        if abs(sum(t for (_s, _m, t) in lay) - (tot or 0.0)) > LAYER_SUM_TOL:
            bad(guid, f"layer thicknesses sum {sum(t for (_s,_m,t) in lay):.6f} != authored total "
                      f"{tot} for set {lsn!r}")
            continue
        idx = store.execute("SELECT layer_seq, material_name, thickness_m, face_start, face_count "
                            "FROM component_geometry_layers WHERE geometry_hash=? ORDER BY layer_seq",
                            (ghash,)).fetchall()
        if not idx:
            bad(guid, f"hash {ghash} carries no layer rows, authored layer_count={lc} — "
                      f"element still ships as an envelope")
            continue
        if len(idx) > lc:
            bad(guid, f"hash {ghash} carries {len(idx)} layer rows, MORE than authored "
                      f"layer_count={lc}")
            continue
        # Rows may be a SUBSET of the authored set (clipped-away layers have no row — user
        # exception ruling 2026-07-31), but every row that exists must MATCH the authored layer
        # at its sequence and carry real geometry.
        authored = {aseq: (amat, ath) for (aseq, amat, ath) in lay}
        ok = True
        cursor = 0
        for (seq, mat, th, fs, fc) in idx:
            if fc is None or fc <= 0:
                # Row 33 falsification surface: re-introducing an empty row must go RED here.
                bad(guid, f"layer {seq} ({mat!r}) has face_count={fc} — an empty slab is a "
                          f"refusal, not a row (row 33)")
                ok = False
                break
            if seq not in authored:
                bad(guid, f"layer row seq={seq} does not exist in authored set {lsn!r}")
                ok = False
                break
            amat, ath = authored[seq]
            if abs(th - ath) > 1e-9 or (mat or "") != (amat or ""):
                bad(guid, f"layer row {seq} ({mat!r},{th}) != authored ({amat!r},{ath})")
                ok = False
                break
            if fs != cursor:
                bad(guid, f"face ranges do not tile: layer {seq} starts at {fs}, expected {cursor}")
                ok = False
                break
            cursor += fc
        if not ok:
            continue
        frow = store.execute(f"SELECT face_count FROM {blob_table} WHERE geometry_hash=?",
                             (ghash,)).fetchone()
        if frow is None or frow[0] != cursor:
            bad(guid, f"layer face ranges sum {cursor} != stored face_count "
                      f"{frow[0] if frow else 'MISSING'} for hash {ghash}")
    return fails


def compile_layers_cli(ref_db, library_db=None):
    """--compile-layers: compile (idempotent — already-layered hashes are skipped) + verify an
    EXISTING extracted DB. Non-zero exit on any refusal or verify failure."""
    print(f"§LOD400-LAYERS-REAL compile+verify  ref={ref_db}  library={library_db or '(blobs in ref)'}")
    conn = sqlite3.connect(ref_db)
    geo = sqlite3.connect(library_db) if library_db else None
    try:
        _n, refusals, _already = compile_layer_geometry(conn, geo)
        fails = verify_layer_geometry(conn, geo)
        conn.commit()
        if geo is not None:
            geo.commit()
    finally:
        conn.close()
        if geo is not None:
            geo.close()
    if refusals or fails:
        print(f"  §LOD400-SLICE GATE RED: {len(refusals)} refusal(s), {fails} verify failure(s) — "
              f"envelopes/inconsistencies must be fixed at source, never shipped silently")
        return 1
    print("  §LOD400-SLICE GATE GREEN: every multi-layer element resolves compiled layer slabs")
    return 0


# ---------------------------------------------------------------------------
# Full extraction: IFC -> reference DB (geometry + materials in one pass)
# ---------------------------------------------------------------------------

def _infer_product_type(ifc_class):
    """Map IFC class to product_type for M_Product."""
    TYPE_MAP = {
        "IfcDoor": "DOOR", "IfcWindow": "WINDOW",
        "IfcWall": "WALL", "IfcWallStandardCase": "WALL",
        "IfcSlab": "SLAB", "IfcColumn": "COLUMN", "IfcBeam": "BEAM",
        "IfcRoof": "ROOF", "IfcStair": "STAIR", "IfcStairFlight": "STAIR",
        "IfcRailing": "RAILING", "IfcCovering": "ELEMENT",
        "IfcFurnishingElement": "ELEMENT", "IfcFurniture": "ELEMENT",
        "IfcBuildingElementProxy": "ELEMENT",
    }
    return TYPE_MAP.get(ifc_class, "ELEMENT")


def _product_id_from_dims(ifc_class, width, depth, height):
    """Derive M_Product.product_id from class + dimensions (mm)."""
    ptype = _infer_product_type(ifc_class)
    short = ptype
    if ifc_class.startswith("IfcDoor"):
        short = "DOOR_INT" if width < 1.0 else "DOOR_EXT"
    w_mm = int(round(width * 1000))
    d_mm = int(round(depth * 1000))
    h_mm = int(round(height * 1000))
    return f"{short}_{w_mm}x{d_mm}x{h_mm}"


def _infer_attachment_face(ifc_class):
    """Derive attachment_face from IFC class — how the element tacks to its host."""
    FACE_MAP = {
        "IfcDoor": "SIDE", "IfcWindow": "SIDE",           # tack to wall face
        "IfcWall": "FLOOR", "IfcWallStandardCase": "FLOOR",
        "IfcSlab": "FLOOR", "IfcRoof": "FLOOR",
        "IfcColumn": "FLOOR", "IfcBeam": "FLOOR",
        "IfcStair": "FLOOR", "IfcStairFlight": "FLOOR",
        "IfcRailing": "FLOOR",
        "IfcFurnishingElement": "FLOOR", "IfcFurniture": "FLOOR",
        "IfcCovering": "TOP",                              # ceiling covering
        "IfcFlowTerminal": "TOP", "IfcAirTerminal": "TOP", # sprinkler, diffuser
        "IfcLightFixture": "TOP",                          # pendant light
        "IfcSanitaryTerminal": "FLOOR",
        "IfcPipeSegment": "CENTER", "IfcPipeFitting": "CENTER",
        "IfcDuctSegment": "CENTER", "IfcDuctFitting": "CENTER",
    }
    return FACE_MAP.get(ifc_class, "CENTER")


def _open_library(library_path):
    """Open component_library.db and ensure target tables exist."""
    lib = sqlite3.connect(library_path, timeout=30)
    lib.execute("PRAGMA journal_mode=WAL")  # allow concurrent reads
    lib.execute("PRAGMA busy_timeout=30000")  # wait up to 30s for lock
    # component_geometries — must already exist (sacred DB, append-only)
    # I_Geometry_Map, M_Product — must already exist
    # Verify tables exist
    tables = {r[0] for r in lib.execute(
        "SELECT name FROM sqlite_master WHERE type='table'")}
    for t in ("component_geometries", "I_Geometry_Map", "M_Product"):
        if t not in tables:
            raise RuntimeError(
                f"component_library.db missing table '{t}' — "
                f"run schema migration first")
    return lib


def is_void_consumed(elem, settings):
    """§LODHELL-FIX-1 (RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §LODHELL-FIX) — Witness: W-LODHELL-CLASSIFY.

    An element can tessellate to NOTHING for two completely different reasons, and the extractor used to
    report both as `§ILLEGAL_PARAMETRIC_FALLBACK` ("fix your IFC"):

      (a) VOID-CONSUMED — the element has a perfectly good body, and its OWN authored IfcRelVoidsElement
          openings subtract 100% of it. Measured on SampleCastle 2026-07-27: `kozijn` window-frame walls
          are a 1.210 x 0.114 x 1.850 m strip whose opening is 1.210 x 0.342 x 1.850 m — same width and
          height, thicker. The empty result is geometrically CORRECT; the window that fills the void is
          what carries the visible geometry (74/74 fillings verified present). Not a failure.
      (b) a real defect — no body, or an empty body with nothing voiding it.

    Classified from authored data only: does a `Body` representation ITEM tessellate on its own (bypassing
    the openings), and does the element declare any opening? No thresholds, no proximity, nothing inferred.

    Returns, for (a), the pre-boolean Body ITEM's LOCAL bbox extent as a truthy 3-tuple
    (ext_x, ext_y, ext_z) in metres — §ANCHOR (USER-APPROVED 2026-07-30) persists it instead of
    throwing the already-computed tessellation away (captured from THIS call, never a second
    tessellation). Returns None for (b)/anything else, so `if is_void_consumed(...)` keeps its
    original truthiness semantics.
    """
    import ifcopenshell.geom          # module-level import is deferred in this file (see caller at :1047)
    try:
        if not getattr(elem, 'HasOpenings', None):
            return None
        rep = getattr(elem, 'Representation', None)
        if not rep:
            return None
        for sub in rep.Representations:
            if sub.RepresentationIdentifier != 'Body':
                continue
            for item in sub.Items:
                try:
                    shp = ifcopenshell.geom.create_shape(settings, item)
                    geo = shp.geometry if hasattr(shp, 'geometry') else shp
                    if len(geo.verts) >= 9:      # >= 3 vertices
                        _iv = np.array(geo.verts, dtype=np.float64).reshape(-1, 3)
                        _ext = _iv.max(axis=0) - _iv.min(axis=0)
                        return (float(_ext[0]), float(_ext[1]), float(_ext[2]))
                except Exception:
                    continue
    except (AttributeError, TypeError):
        return None
    return None


def extract_rel_fills_host(ifc_file, conn):
    """§PATHB (SPATIAL_DEPENDENCY_GRAPH.md Phase 1): recover the void/fill chain.

    The `hosted-by` edge, RECOVERED from authored relations — never proximity-guessed:
      IfcRelVoidsElement: RelatingBuildingElement (host) → RelatedOpeningElement (opening)
      IfcRelFillsElement: RelatingOpeningElement (opening) → RelatedBuildingElement (filling)
    Compose on the shared opening GUID → filling → opening → host. One row per opening that
    voids a host; filling_guid NULL = open void. NON-INVENT: copies authored relations, derives
    nothing (the relative host-ride transform is derivable later from element_transforms).

    Returns (rows_written, rows_with_filling).
    """
    rows = 0
    filled = 0
    try:
        # opening_guid → host element (from Voids)
        host_of_opening = {}
        for rel in ifc_file.by_type("IfcRelVoidsElement"):
            try:
                host = rel.RelatingBuildingElement
                opening = rel.RelatedOpeningElement
                if not opening or not hasattr(opening, 'GlobalId'):
                    continue
                host_of_opening[opening.GlobalId] = host
            except (AttributeError, TypeError):
                pass
        # opening_guid → filling element (from Fills)
        filling_of_opening = {}
        for rel in ifc_file.by_type("IfcRelFillsElement"):
            try:
                opening = rel.RelatingOpeningElement
                filling = rel.RelatedBuildingElement
                if not opening or not hasattr(opening, 'GlobalId'):
                    continue
                filling_of_opening[opening.GlobalId] = filling
            except (AttributeError, TypeError):
                pass
        # One row per opening that voids a host (filling optional)
        for opening_guid, host in host_of_opening.items():
            if not host or not hasattr(host, 'GlobalId'):
                continue
            filling = filling_of_opening.get(opening_guid)
            filling_guid = filling.GlobalId if (filling and hasattr(filling, 'GlobalId')) else None
            filling_class = filling.is_a() if filling else None
            conn.execute(
                "INSERT OR IGNORE INTO rel_fills_host "
                "(opening_guid, host_guid, filling_guid, host_class, filling_class, provenance) "
                "VALUES (?, ?, ?, ?, ?, 'ifc:recovered')",
                (opening_guid, host.GlobalId, filling_guid, host.is_a(), filling_class))
            rows += 1
            if filling_guid:
                filled += 1
        conn.commit()
    except RuntimeError:
        pass  # IFC schema may not have these relation types
    return rows, filled


def _face_touch(a, b, tol, min_overlap):
    """Is the AABB pair (a,b) a FACE-TOUCH? Returns (touch_axis, gap_m, contact_m2) or None.

    Pure geometry — references NO IFC class. a,b are (minX,maxX,minY,maxY,minZ,maxZ).
    Face-touch on axis k ⇔ the opposing faces on k are within `tol` (small gap or small
    interpenetration) AND the boxes genuinely overlap on the OTHER two axes (≥ min_overlap each).
    The touch axis is the one with the smallest |overlap| (closest to a back-to-back face).
    Corner/edge grazes (two axes near-zero) and deep clashes (no axis near-zero) are excluded.
    """
    # signed overlap per axis: >0 interpenetrate, =0 touch, <0 gap
    ov = []
    for k in range(3):
        lo = max(a[2 * k], b[2 * k])
        hi = min(a[2 * k + 1], b[2 * k + 1])
        ov.append(hi - lo)
    # pick the touch axis = axis whose |overlap| is smallest (the back-to-back face)
    axis = min(range(3), key=lambda k: abs(ov[k]))
    if abs(ov[axis]) > tol:
        return None                       # faces not within tol on the closest axis → not adjacent
    others = [k for k in range(3) if k != axis]
    if ov[others[0]] < min_overlap or ov[others[1]] < min_overlap:
        return None                       # no real shared face (corner/edge graze) → not a face-touch
    contact = ov[others[0]] * ov[others[1]]
    return "XYZ"[axis], abs(ov[axis]), contact


def derive_adjacency(conn, tol=0.03, min_overlap=0.02):
    """§ABUTS (SPATIAL_DEPENDENCY_GRAPH.md): derive the `abuts` edge from MEASURED face-touch.

    Reads the pristine AABBs (elements_meta ⋈ elements_rtree), writes one rel_adjacency row per
    unordered face-touching pair. DERIVED, NON-INVENT: every edge is a measured face contact, stamped
    provenance='derived:face-touch'; NO proximity radius, NO class whitelist (grep-clean of class names).
    Uses the rtree to fetch only spatially-near candidates (scales past O(n²) on large buildings).

    Returns rows written.
    """
    rows = 0
    try:
        elems = conn.execute("""
            SELECT m.guid, r.id, r.minX, r.maxX, r.minY, r.maxY, r.minZ, r.maxZ
            FROM elements_meta m JOIN elements_rtree r ON m.id = r.id
        """).fetchall()
        box = {}    # id → (guid, aabb tuple)
        for guid, rid, x0, x1, y0, y1, z0, z1 in elems:
            box[rid] = (guid, (x0, x1, y0, y1, z0, z1))
        seen = set()
        for rid, (guid_a, a) in box.items():
            # rtree candidates: any element whose AABB comes within `tol` of a's expanded AABB
            cand = conn.execute("""
                SELECT id FROM elements_rtree
                WHERE maxX >= ? AND minX <= ? AND maxY >= ? AND minY <= ? AND maxZ >= ? AND minZ <= ?
            """, (a[0] - tol, a[1] + tol, a[2] - tol, a[3] + tol, a[4] - tol, a[5] + tol)).fetchall()
            for (rid_b,) in cand:
                if rid_b == rid or rid_b not in box:
                    continue
                guid_b, b = box[rid_b]
                if guid_a == guid_b:
                    continue
                lo, hi = (guid_a, guid_b) if guid_a < guid_b else (guid_b, guid_a)
                if (lo, hi) in seen:
                    continue
                ft = _face_touch(a, b, tol, min_overlap)
                if ft is None:
                    continue
                touch_axis, gap_m, contact = ft
                seen.add((lo, hi))
                conn.execute(
                    "INSERT OR IGNORE INTO rel_adjacency "
                    "(a_guid, b_guid, touch_axis, gap_mm, contact_m2, provenance) "
                    "VALUES (?, ?, ?, ?, ?, 'derived:face-touch')",
                    (lo, hi, touch_axis, round(gap_m * 1000, 3), round(contact, 6)))
                rows += 1
        conn.commit()
    except sqlite3.OperationalError:
        pass  # elements_rtree absent (non-geometric ref DB)
    return rows


def derive_datums_and_anchors(conn, tol=0.05, min_support=3):
    """§ANCHORED (SPATIAL_DEPENDENCY_GRAPH.md): derive datum planes + the `anchored-to` edge by MEASURE.

    A datum on an axis is a coordinate where the FACES (min & max box faces) of ≥min_support DISTINCT
    elements align within `tol` — i.e. a gridline, a storey plane, or a bridge pier station, EMERGENT from
    the real cadence, never a recovered IfcGrid (the bridge has none) and never a template. Each supporting
    element gets a rel_anchored edge to the datum (closest face → signed offset). NON-INVENT, grep-clean of
    class names: pure geometry. Greedy tol-bounded 1-D clustering caps each datum's spread at `tol` (no chaining
    into a smeared pseudo-plane).

    Returns (n_datums, n_anchors).
    """
    rows = conn.execute("""
        SELECT m.guid, r.minX, r.maxX, r.minY, r.maxY, r.minZ, r.maxZ
        FROM elements_meta m JOIN elements_rtree r ON m.id = r.id
    """).fetchall()
    if not rows:
        return 0, 0
    box = {g: (x0, x1, y0, y1, z0, z1) for g, x0, x1, y0, y1, z0, z1 in rows}
    n_datums = 0
    n_anchors = 0
    datum_id = 0
    for ax in range(3):
        # candidate faces: both the min and the max box face of every element on this axis
        cand = []
        for g, b in box.items():
            cand.append((b[2 * ax], g))
            cand.append((b[2 * ax + 1], g))
        cand.sort()
        # greedy clustering bounded to spread ≤ tol (prevents chaining across a gradient)
        i = 0
        while i < len(cand):
            start = cand[i][0]
            j = i
            while j < len(cand) and cand[j][0] - start <= tol:
                j += 1
            group = cand[i:j]
            i = j
            guids = {g for _, g in group}
            if len(guids) < min_support:
                continue
            coord = sum(c for c, _ in group) / len(group)
            datum_id += 1
            conn.execute(
                "INSERT INTO datum_plane (datum_id, axis, coord, support_count, provenance) "
                "VALUES (?, ?, ?, ?, 'derived:cadence')",
                (datum_id, "XYZ"[ax], round(coord, 6), len(guids)))
            n_datums += 1
            for g in guids:
                b = box[g]
                faces = (b[2 * ax], b[2 * ax + 1])
                off = min((f - coord for f in faces), key=abs)   # closest face → signed offset
                conn.execute(
                    "INSERT OR IGNORE INTO rel_anchored (element_guid, datum_id, axis, offset_mm, provenance) "
                    "VALUES (?, ?, ?, ?, 'derived:cadence-snap')",
                    (g, datum_id, "XYZ"[ax], round(off * 1000, 3)))
                n_anchors += 1
    conn.commit()
    return n_datums, n_anchors


def derive_spans(conn, tol=0.05):
    """§SPANS (SPATIAL_DEPENDENCY_GRAPH.md): derive the `spans` edge — element stretches between two datums.

    An element SPANS on an axis when its min face is near one datum AND its max face is near a DIFFERENT
    datum (both within tol) — its bbox reaches across the datum interval (a girder between piers, a slab
    across gridlines). Reuses datum_plane (must be populated first by derive_datums_and_anchors). NON-INVENT,
    grep-clean: pure geometry. span_m = the HELD extent; the fold rule stretches it between the two datums.

    Returns rows written.
    """
    datums = {0: [], 1: [], 2: []}
    for did, ax, co in conn.execute("SELECT datum_id, axis, coord FROM datum_plane"):
        datums["XYZ".index(ax)].append((did, co))
    if not any(datums.values()):
        return 0
    rows = conn.execute("""
        SELECT m.guid, r.minX, r.maxX, r.minY, r.maxY, r.minZ, r.maxZ
        FROM elements_meta m JOIN elements_rtree r ON m.id = r.id
    """).fetchall()
    n = 0
    for guid, *b in rows:
        for ax in range(3):
            lo_face, hi_face = b[2 * ax], b[2 * ax + 1]
            lo = min(datums[ax], key=lambda d: abs(d[1] - lo_face), default=None)
            hi = min(datums[ax], key=lambda d: abs(d[1] - hi_face), default=None)
            if lo is None or hi is None:
                continue
            if abs(lo[1] - lo_face) > tol or abs(hi[1] - hi_face) > tol or lo[0] == hi[0]:
                continue
            d_lo, d_hi = (lo, hi) if lo[1] <= hi[1] else (hi, lo)
            conn.execute(
                "INSERT OR IGNORE INTO rel_spans (element_guid, axis, datum_lo_id, datum_hi_id, span_m, provenance) "
                "VALUES (?, ?, ?, ?, ?, 'derived:bbox-spans-datums')",
                (guid, "XYZ"[ax], d_lo[0], d_hi[0], round(hi_face - lo_face, 6)))
            n += 1
    conn.commit()
    return n


def extract_reference(ifc_path, output_path, classes=None, exclude=None,
                      dry_run=False, library_path=None, building_type=None,
                      skip_normalize=False):
    """Full extraction from IFC to reference DB with geometry + materials.

    Extracts ALL IfcProduct subclasses that have a Representation, except
    known non-geometric types (NON_GEOMETRIC_CLASSES blacklist).
    The `classes` parameter is kept for backwards compatibility but ignored
    when None — the blacklist approach is always used by default.

    S168: When library_path is set, mesh BLOBs go to component_library.db
    and _extracted.db/base_geometries stores hashes only (NULL BLOBs).
    """
    import ifcopenshell
    import ifcopenshell.geom

    if exclude is None:
        exclude = []
    # Merge caller-supplied exclude with the global blacklist
    skip_classes = NON_GEOMETRIC_CLASSES | set(exclude)

    print(f"\n{'='*70}")
    print(f"§EXTRACT START")
    print(f"{'='*70}")
    print(f"  §IFC        {ifc_path}")
    ifc_file = ifcopenshell.open(ifc_path)
    ifc_size_mb = os.path.getsize(ifc_path) / (1024 * 1024)
    print(f"  §IFC        {ifc_size_mb:.1f} MB, schema {ifc_file.schema}")

    # S173: geom.iterator() returns metres natively (applies unit_scale
    # internally), regardless of the IFC file's native length unit.
    # No manual scaling needed. unit_scale is read for logging only.
    import ifcopenshell.util.unit as _ifcunit
    unit_scale = _ifcunit.calculate_unit_scale(ifc_file, "LENGTHUNIT")
    print(f"  §UNIT_SCALE {unit_scale} (iterator returns metres — no manual scaling)")

    # S168: Derive building_type from IFC filename if not provided
    if building_type is None:
        building_type = os.path.splitext(os.path.basename(ifc_path))[0]
        # Strip common suffixes
        for suffix in ("_extracted", "_merged", "_federated"):
            building_type = building_type.replace(suffix, "")

    print(f"  §BUILDING   {building_type}")
    # §KUL001: the label the Viewer groups by. The two existing residents use the T0_<name> form
    # (LTU_AHouse -> T0_LTU_AHouse x125,698; Terminal -> T0_Terminal x48,428), so match it rather
    # than invent a third convention. Written into elements_meta.building on every row below, and
    # mirrored into project_metadata, so a CLI-extracted DB opens in the Viewer with no post-process.
    _building_label = building_type if building_type.startswith("T0_") else "T0_" + building_type
    print(f"  §BUILDING_LABEL {_building_label}  (elements_meta.building, Viewer centres key)")
    print(f"  §OUTPUT     {output_path}")
    print(f"  §COORDS     LOCAL (USE_WORLD_COORDS=False, tack point = IFC origin)")

    # S168: Open component library for mesh BLOB storage
    lib_conn = None
    if library_path and not dry_run:
        lib_conn = _open_library(library_path)
        print(f"  §LIBRARY    {library_path} (WAL mode, BLOBs here, hashes in output)")
    else:
        print(f"  §LIBRARY    none (legacy mode — BLOBs in output DB)")

    if dry_run:
        print("  [DRY RUN] Scanning elements...")
    else:
        # Create fresh DB with unified schema
        if os.path.exists(output_path):
            os.remove(output_path)
        conn = sqlite3.connect(output_path)
        conn.executescript(REFERENCE_SCHEMA)

    # Spatial structure
    print("  Extracting spatial structure...")
    if not dry_run:
        buildings = ifc_file.by_type("IfcBuilding")
        for b in buildings:
            conn.execute(
                "INSERT OR IGNORE INTO spatial_structure (guid, type, name) "
                "VALUES (?, 'IfcBuilding', ?)", (b.GlobalId, b.Name))
        # §S21: real IfcBuilding->IfcBuildingStorey parentage via .Decomposes (the same
        # IFCRELAGGREGATES relation already walked for IfcSpace->IfcBuildingStorey below, and
        # already walked project-wide into rel_aggregates further down this function) — replaces
        # the "parent = buildings[0]" blind assignment, which silently collapsed EVERY storey onto
        # the first IfcBuilding in file order whenever a file declares more than one (§DIAGNOSIS's
        # "federated name soup" on Terminal). EXTRACT ONLY, no inference (§PATHS NOT TO TAKE #7):
        # if a storey has no real .Decomposes parent, parent_guid stays NULL rather than guessing.
        for s in ifc_file.by_type("IfcBuildingStorey"):
            parent = None
            try:
                for rel in s.Decomposes:
                    if rel.RelatingObject.is_a("IfcBuilding"):
                        parent = rel.RelatingObject.GlobalId
                        break
            except (AttributeError, TypeError):
                pass
            elevation = None
            if s.Elevation is not None:
                try:
                    elevation = float(s.Elevation) * unit_scale
                except (TypeError, ValueError):
                    pass
            conn.execute(
                "INSERT OR IGNORE INTO spatial_structure (guid, type, name, parent_guid, elevation) "
                "VALUES (?, 'IfcBuildingStorey', ?, ?, ?)", (s.GlobalId, s.Name, parent, elevation))
        _n_storeys = len(ifc_file.by_type("IfcBuildingStorey"))
        _n_storey_elev = sum(1 for s in ifc_file.by_type("IfcBuildingStorey") if s.Elevation is not None)
        _n_storey_parent = 0
        for s in ifc_file.by_type("IfcBuildingStorey"):
            try:
                if any(rel.RelatingObject.is_a("IfcBuilding") for rel in s.Decomposes):
                    _n_storey_parent += 1
            except (AttributeError, TypeError):
                pass
        print(f"  §S21_SPATIAL_STRUCTURE buildings={len(buildings)} storeys={_n_storeys} "
              f"storeysWithElevation={_n_storey_elev} storeysWithRealParent={_n_storey_parent}")
        # IfcSpace footprint AABB — tessellate the space solid ONCE (world coords) for its bounding box.
        # Enables habitable-AABB room qualification + per-room door proximity (SPATIAL_DEPENDENCY_GRAPH
        # room/storey design). World-coord AABB is normalized later alongside element_transforms.
        space_settings = ifcopenshell.geom.settings()
        space_settings.set(space_settings.USE_WORLD_COORDS, True)
        n_space_geom = 0
        for sp in ifc_file.by_type("IfcSpace"):
            parent_guid = None
            try:
                for rel in sp.Decomposes:
                    if rel.RelatingObject.is_a("IfcBuildingStorey"):
                        parent_guid = rel.RelatingObject.GlobalId
                        break
            except (AttributeError, TypeError):
                pass
            obj_type = getattr(sp, "ObjectType", None)
            predef = getattr(sp, "PredefinedType", None)
            cx = cy = cz = sx = sy = sz = None
            try:
                shp = ifcopenshell.geom.create_shape(space_settings, sp)
                v = shp.geometry.verts            # flat [x,y,z, x,y,z, ...]
                if v:
                    xs, ys, zs = v[0::3], v[1::3], v[2::3]
                    minx, maxx = min(xs), max(xs)
                    miny, maxy = min(ys), max(ys)
                    minz, maxz = min(zs), max(zs)
                    cx, cy, cz = (minx + maxx) / 2, (miny + maxy) / 2, (minz + maxz) / 2
                    sx, sy, sz = maxx - minx, maxy - miny, maxz - minz
                    n_space_geom += 1
            except Exception:
                pass                              # space without a usable Representation → AABB stays NULL
            conn.execute(
                "INSERT OR IGNORE INTO spatial_structure "
                "(guid, type, name, parent_guid, object_type, predefined_type, "
                "center_x, center_y, center_z, size_x, size_y, size_z) "
                "VALUES (?, 'IfcSpace', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (sp.GlobalId, sp.Name or sp.LongName, parent_guid, obj_type, predef,
                 cx, cy, cz, sx, sy, sz))
        if n_space_geom:
            print(f"  §SPACE-AABB: {n_space_geom} IfcSpace footprints tessellated (habitable area/height)")
        conn.commit()

    # Geometry settings — S169: LOCAL coords for canonical mesh deduplication.
    # World placement comes from shape.transformation matrix.
    settings = ifcopenshell.geom.settings()
    settings.set(settings.USE_WORLD_COORDS, False)
    settings.set(settings.WELD_VERTICES, True)

    # §LODHELL-FIX-2 (2026-07-27) — the "Tier 2: no boolean operations" fallback that used to be declared
    # here (`settings_no_bool` with DISABLE_BOOLEAN_RESULT, plus BOOL_DEPTH_THRESHOLD = 3) is DELETED, not
    # disabled. It was unreferenced dead code, and it must never be revived, for two measured reasons:
    #   1. It does not work. On ifcopenshell 0.8.4.post1, DISABLE_BOOLEAN_RESULT=True (setting readback
    #      confirmed True) still returns verts=0 faces=0 at PRODUCT level for the SampleCastle `kozijn`
    #      walls — the exact elements it was supposed to rescue.
    #   2. It would be WRONG even if it worked. An element whose body is fully removed by its own authored
    #      IfcRelVoidsElement opening is CORRECT as empty (see is_void_consumed()). Re-tessellating it
    #      without booleans resurrects an uncut wall the author deliberately voided and presents it as real
    #      geometry — inventing content, and a direct violation of the no-fake-LOD doctrine
    #      (docs/internal/WalkerDoctrine.md §11).
    # Full evidence: prompts/RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §LODHELL-ROOTCAUSE FINDING 3.

    existing_hashes = set()
    next_id = 1
    imported = failed = simplified = bbox_fallback = 0
    # §LODHELL-FIX-1: empty-tessellation elements whose OWN authored opening consumed the whole body.
    # Expected, correct output — tracked and reported separately, never counted as a failure.
    void_consumed = 0
    void_guids = []
    # §ANCHOR (USER-APPROVED 2026-07-30): void-consumed hosts whose already-computed placement + pre-boolean
    # extent get persisted as non-rendered logical anchors. NEVER counted in `imported` — own counter only.
    anchors = 0
    anchor_rows = []
    mat_found = rgba_found = 0
    lib_geo_new = lib_igm_new = lib_prod_new = 0  # S168 counters
    ordinal_counter = {}  # S168: (ifc_class, storey) → next ordinal

    # ── S172: Geometry iterator (replaces per-element create_shape) ──────
    # The iterator has built-in C++ dedup, instancing, and caching.
    # It processes all elements in one pass, returning geometry + transform.
    import math

    t_iter_start = time.time()
    exclude_list = list(skip_classes)
    iterator = ifcopenshell.geom.iterator(settings, ifc_file, exclude=exclude_list)

    if not iterator.initialize():
        print("  §ITER WARNING: iterator.initialize() returned False — falling back")
        iterator = None

    # Build GUID→element lookup for metadata extraction
    guid_to_elem = {}
    for elem in ifc_file.by_type("IfcProduct"):
        guid_to_elem[elem.GlobalId] = elem

    # S173: Running stats for debug summary
    _cx_min = _cy_min = _cz_min = float('inf')
    _cx_max = _cy_max = _cz_max = float('-inf')
    _vmax_global = 0.0
    _rot_ok = _rot_fail = 0

    if iterator:
        print(f"  §ITER using geometry iterator (v{ifcopenshell.version}, built-in dedup)")
        while True:
            shape = iterator.get()
            elem = guid_to_elem.get(shape.guid)
            if elem is None:
                if not iterator.next():
                    break
                continue

            cls = shape.type  # IFC class
            try:
                geo = shape.geometry
                verts = np.array(geo.verts, dtype=np.float64).reshape(-1, 3)
                faces = np.array(geo.faces, dtype=np.int32).reshape(-1, 3)

                rot_x = rot_y = rot_z = 0.0

                if len(verts) < 3 or len(faces) < 1:
                    # §LODHELL-FIX-1: an empty tessellation is NOT automatically a defect — classify it
                    # against the element's own authored openings before crying wolf (is_void_consumed()).
                    _anchor_ext = is_void_consumed(elem, settings)
                    if _anchor_ext:
                        void_consumed += 1
                        void_guids.append((shape.guid, cls, getattr(elem, 'Name', None)))
                        # §ANCHOR (RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §START HERE OPEN 1,
                        # USER-APPROVED 2026-07-30): stop DISCARDING what is already computed. The
                        # iterator's shape carries the host's world placement for free, and
                        # is_void_consumed() just tessellated the pre-boolean Body ITEM to classify —
                        # keep both (pure extract, zero defaults). Rows are flushed AFTER the loop so
                        # normal elements keep bit-identical ids vs pre-anchor extractions.
                        try:
                            _, _, _a_c, _a_rx, _a_ry, _a_rz = decompose_iterator_matrix(
                                list(shape.transformation.matrix))
                            anchor_rows.append((shape.guid, cls, elem,
                                                (float(_a_c[0]), float(_a_c[1]), float(_a_c[2])),
                                                _a_rx, _a_ry, _a_rz, _anchor_ext))
                        except Exception as _aexc:
                            # Loud, named skip — this element simply stays absent (pre-anchor behaviour).
                            print(f"  §ANCHOR-SKIP {cls} {shape.guid} — placement unavailable "
                                  f"({_aexc}); host persists nothing")
                        if not iterator.next():
                            break
                        continue
                    # S185: parametric fallback is illegal — abort extraction
                    raise RuntimeError(
                        f"§ILLEGAL_PARAMETRIC_FALLBACK {cls} guid={shape.guid} — "
                        f"verts={len(verts)} faces={len(faces)}. "
                        f"Tessellation produced no geometry. "
                        f"Add to NON_GEOMETRIC_CLASSES or fix IFC source.")
                else:
                    # S173: iterator returns metres natively — no scaling
                    vblob = verts.astype(np.float32).tobytes()
                    fblob = faces.astype(np.int32).tobytes()

                    # Transform from iterator (4x4 column-major in v0.8) — decomposition factored to
                    # decompose_iterator_matrix() (§ANCHOR shares it; math unchanged, P4 still checks it)
                    mat_flat = list(shape.transformation.matrix)
                    mat4, rot3, center, rot_x, rot_y, rot_z = decompose_iterator_matrix(mat_flat)

                    # World-space bbox (from original verts + original centre)
                    local_min = verts.min(axis=0)
                    local_max = verts.max(axis=0)
                    corners = np.array([
                        [local_min[0], local_min[1], local_min[2]],
                        [local_max[0], local_min[1], local_min[2]],
                        [local_min[0], local_max[1], local_min[2]],
                        [local_max[0], local_max[1], local_min[2]],
                        [local_min[0], local_min[1], local_max[2]],
                        [local_max[0], local_min[1], local_max[2]],
                        [local_min[0], local_max[1], local_max[2]],
                        [local_max[0], local_max[1], local_max[2]],
                    ])
                    world_corners = (rot3 @ corners.T).T + mat4[:3, 3]
                    minXYZ = world_corners.min(axis=0)
                    maxXYZ = world_corners.max(axis=0)

                    # S173: ROTATION TRUTH — at the event, compare Euler→matrix vs original rot3
                    if FINE:
                        a, b, c = rot_x, rot_y, rot_z
                        R_recon = np.array([
                            [math.cos(b)*math.cos(c), math.sin(a)*math.sin(b)*math.cos(c)-math.cos(a)*math.sin(c), math.cos(a)*math.sin(b)*math.cos(c)+math.sin(a)*math.sin(c)],
                            [math.cos(b)*math.sin(c), math.sin(a)*math.sin(b)*math.sin(c)+math.cos(a)*math.cos(c), math.cos(a)*math.sin(b)*math.sin(c)-math.sin(a)*math.cos(c)],
                            [-math.sin(b),             math.sin(a)*math.cos(b),                                      math.cos(a)*math.cos(b)]
                        ])
                        rot_err = np.abs(R_recon - rot3).max()
                        if rot_err > 1e-6:
                            _rot_fail += 1
                            if _rot_fail <= 3:
                                print(f"    §ROT_FAIL {shape.guid[:16]} err={rot_err:.6f} "
                                      f"euler=({rot_x:.4f},{rot_y:.4f},{rot_z:.4f})")
                        else:
                            _rot_ok += 1

                # S173: track running stats + log first 3 elements for diagnostics
                _vmax_local = np.abs(verts).max() if len(verts) > 0 else 0.0
                if _vmax_local > _vmax_global:
                    _vmax_global = _vmax_local
                _cx_min = min(_cx_min, float(center[0]))
                _cx_max = max(_cx_max, float(center[0]))
                _cy_min = min(_cy_min, float(center[1]))
                _cy_max = max(_cy_max, float(center[1]))
                _cz_min = min(_cz_min, float(center[2]))
                _cz_max = max(_cz_max, float(center[2]))

                if FINE and imported < 3:
                    print(f"    §SAMPLE[{imported}] {cls} "
                          f"centre=({float(center[0]):.2f},{float(center[1]):.2f},{float(center[2]):.2f})m "
                          f"vmax={_vmax_local:.3f}m "
                          f"bbox=[{float(minXYZ[0]):.2f},{float(maxXYZ[0]):.2f}]x"
                          f"[{float(minXYZ[1]):.2f},{float(maxXYZ[1]):.2f}]x"
                          f"[{float(minXYZ[2]):.2f},{float(maxXYZ[2]):.2f}]")

                ghash = geometry_hash(vblob, fblob)

                guid = shape.guid
                name = getattr(elem, "Name", None)
                storey = get_storey_for_element(elem)
                discipline = infer_discipline(cls)
                elem_type = None
                try:
                    for rel in elem.IsDefinedBy:
                        if rel.is_a("IfcRelDefinesByType"):
                            elem_type = rel.RelatingType.Name
                            break
                except (AttributeError, TypeError):
                    pass

                material_name = get_material_for_element(elem)
                material_rgba = get_colour_for_element(elem)
                if material_name:
                    mat_found += 1
                if material_rgba:
                    rgba_found += 1

                # S173: progress every 5000 elements (FINE only)
                if FINE and imported > 0 and imported % 5000 == 0:
                    elapsed = time.time() - t_iter_start
                    print(f"    §PROGRESS {imported:,} elements  "
                          f"{elapsed:.0f}s  {imported/max(elapsed,0.01):.0f} elem/s  "
                          f"fail={failed}")

                if not dry_run:
                    # Vertex/face counts — derive from BLOB size (always correct)
                    v_count = len(vblob) // 12   # float32 * 3 = 12 bytes/vertex
                    f_count = len(fblob) // 12   # int32 * 3  = 12 bytes/face

                    if ghash not in existing_hashes:
                        # S173: spot-check vertex scale for first 5 new hashes (FINE only)
                        if FINE and len(existing_hashes) < 5 and v_count > 3:
                            _sv = np.frombuffer(vblob, dtype=np.float32).reshape(-1, 3)
                            _vmax = np.abs(_sv).max()
                            print(f"    §MESH_SCALE hash={ghash[:12]} "
                                  f"vc={v_count} vmax={_vmax:.3f}m "
                                  f"centre=({float(center[0]):.2f},{float(center[1]):.2f},{float(center[2]):.2f})m "
                                  f"unit_scale={unit_scale}")

                        if lib_conn:
                            # S168: BLOBs → component_library.db
                            rc = lib_conn.execute(
                                "INSERT OR IGNORE INTO component_geometries "
                                "(geometry_hash, vertices, faces, normals, "
                                "vertex_count, face_count) "
                                "VALUES (?,?,?,NULL,?,?)",
                                (ghash, vblob, fblob, v_count, f_count))
                            if rc.rowcount > 0:
                                lib_geo_new += 1
                                # S169: component_definitions — UFB + local bounds
                                local_min = np.frombuffer(vblob, dtype=np.float32).reshape(-1, 3).min(axis=0)
                                local_max = np.frombuffer(vblob, dtype=np.float32).reshape(-1, 3).max(axis=0)
                                attach = _infer_attachment_face(cls)
                                lib_conn.execute(
                                    "INSERT OR IGNORE INTO component_definitions "
                                    "(name, geometry_hash, "
                                    "local_min_x, local_max_x, "
                                    "local_min_y, local_max_y, "
                                    "local_min_z, local_max_z, "
                                    "attachment_face, up_axis, forward_axis, "
                                    "vertex_count, face_count, instance_count) "
                                    "VALUES (?,?,?,?,?,?,?,?,?,'Z','Y',?,?,1)",
                                    (elem_type or name or cls,
                                     ghash,
                                     float(local_min[0]), float(local_max[0]),
                                     float(local_min[1]), float(local_max[1]),
                                     float(local_min[2]), float(local_max[2]),
                                     attach, v_count, f_count))
                            # Hash-only in _extracted.db (NULL BLOBs)
                            conn.execute(
                                "INSERT OR IGNORE INTO base_geometries "
                                "(geometry_hash, vertices, faces, "
                                "vertex_count, face_count) "
                                "VALUES (?,NULL,NULL,?,?)",
                                (ghash, v_count, f_count))
                        else:
                            # Legacy mode: BLOBs in _extracted.db
                            conn.execute(
                                "INSERT OR IGNORE INTO base_geometries "
                                "(geometry_hash, vertices, faces, "
                                "vertex_count, face_count) "
                                "VALUES (?,?,?,?,?)",
                                (ghash, vblob, fblob, v_count, f_count))
                        existing_hashes.add(ghash)

                    eid = next_id
                    next_id += 1
                    conn.execute(
                        "INSERT OR IGNORE INTO elements_meta "
                        "(id, guid, discipline, ifc_class, element_name, element_type, "
                        "storey, material_name, material_rgba, building) "
                        "VALUES (?,?,?,?,?,?,?,?,?,?)",
                        (eid, guid, discipline, cls, name, elem_type, storey,
                         material_name, material_rgba, _building_label))
                    conn.execute(
                        "INSERT OR IGNORE INTO elements_rtree "
                        "(id, minX, maxX, minY, maxY, minZ, maxZ) "
                        "VALUES (?,?,?,?,?,?,?)",
                        (eid, float(minXYZ[0]), float(maxXYZ[0]),
                         float(minXYZ[1]), float(maxXYZ[1]),
                         float(minXYZ[2]), float(maxXYZ[2])))
                    conn.execute(
                        "INSERT OR IGNORE INTO element_instances (guid, geometry_hash) "
                        "VALUES (?,?)", (guid, ghash))
                    conn.execute(
                        "INSERT OR IGNORE INTO element_transforms "
                        "(guid, center_x, center_y, center_z, "
                        "rotation_x, rotation_y, rotation_z, bbox_x, bbox_y, bbox_z, transform_source) "
                        "VALUES (?,?,?,?,?,?,?,?,?,?,'ifc_extract')",
                        (guid, float(center[0]), float(center[1]), float(center[2]),
                         float(rot_x), float(rot_y), float(rot_z),
                         float(maxXYZ[0]) - float(minXYZ[0]),
                         float(maxXYZ[1]) - float(minXYZ[1]),
                         float(maxXYZ[2]) - float(minXYZ[2])))
                    space = get_space_for_element(elem)
                    if space:
                        conn.execute(
                            "INSERT OR IGNORE INTO rel_contained_in_space VALUES (?,?)",
                            (guid, space.GlobalId))

                    # S168: Write I_Geometry_Map + M_Product to library
                    if lib_conn:
                        storey_norm = storey or "Unknown"
                        key = (cls, storey_norm)
                        ordinal = ordinal_counter.get(key, 1)
                        ordinal_counter[key] = ordinal + 1

                        element_ref = f"{elem_type or name or cls}"
                        rc = lib_conn.execute(
                            "INSERT OR IGNORE INTO I_Geometry_Map "
                            "(building_type, element_ref, ifc_class, storey, "
                            "ordinal, geometry_hash, source, provenance) "
                            "VALUES (?,?,?,?,?,?,?,?)",
                            (building_type, element_ref, cls, storey_norm,
                             ordinal, ghash, building_type, "EXTRACTED"))
                        if rc.rowcount > 0:
                            lib_igm_new += 1

                        # M_Product from bbox dimensions
                        width = float(maxXYZ[0] - minXYZ[0])
                        depth = float(maxXYZ[1] - minXYZ[1])
                        height = float(maxXYZ[2] - minXYZ[2])
                        prod_id = _product_id_from_dims(cls, width, depth, height)
                        prod_type = _infer_product_type(cls)
                        rc = lib_conn.execute(
                            "INSERT OR IGNORE INTO M_Product "
                            "(product_id, product_type, width, depth, height, "
                            "ifc_class, extracted_from, building_type, "
                            "source_element_ref) "
                            "VALUES (?,?,?,?,?,?,?,?,?)",
                            (prod_id, prod_type, width, depth, height,
                             cls, "IFC_EXTRACTION", building_type, element_ref))
                        if rc.rowcount > 0:
                            lib_prod_new += 1

                imported += 1

                # S170: batch-commit every 1000 elements to release write lock
                if imported % 1000 == 0 and not dry_run:
                    conn.commit()
                    if lib_conn:
                        lib_conn.commit()

            except Exception as exc:
                failed += 1
                # §LODHELL-FIX-1: print EVERY real failure. The old `if failed <= 5` cap hid 60 of 65
                # events on SampleCastle — a genuine geometry loss would have been invisible among them.
                print(f"  §FAIL {cls} {getattr(elem, 'GlobalId', '?')}: {exc}")

            if not iterator.next():
                break

        t_iter_elapsed = time.time() - t_iter_start
        print(f"  §ITER done: {imported:,} elements in {t_iter_elapsed:.1f}s "
              f"({imported/max(t_iter_elapsed,0.01):.0f} elem/s)")
        # §LODHELL-FIX-1: expected output, so a summary + sample rather than one line per element.
        if void_consumed:
            print(f"  §VOID-CONSUMED {void_consumed} elements fully removed by their own authored "
                  f"IfcRelVoidsElement opening (correct — the filling element carries the geometry)")
            for _g, _c, _n in void_guids[:5]:
                print(f"    §VOID-CONSUMED {_c} {_g} name={_n}")
            if void_consumed > 5:
                print(f"    … {void_consumed - 5} more (full list is the rel_fills_host host set)")

        # ── §ANCHOR flush (RESUME_MODELLER_LOD400_REAL_GEOMETRY.md §START HERE OPEN 1, USER-APPROVED
        # 2026-07-30 with ONE binding condition: anchors must be UNMISTAKABLE and excluded from every
        # count/pick/audit). Persist each void-consumed host's already-computed world placement + the
        # pre-boolean Body ITEM's LOCAL extent as ONE elements_meta row (is_anchor=1) + ONE
        # element_transforms row (transform_source='void_anchor'). Deliberately NO element_instances
        # row (no geometry hash — nothing to render) and NO elements_rtree row (never pickable).
        # bbox_x/y/z here are the ITEM's LOCAL extent (the box the Modeller's invisible anchor mesh is
        # built from, oriented by rotation_*) — NOT the world AABB the normal path stores; the
        # 'void_anchor' transform_source is what tells a consumer which convention a row uses.
        # Everything below is EXTRACTED (placement matrix + authored body tessellation) — zero defaults.
        if anchor_rows and not dry_run:
            for _a_guid, _a_cls, _a_elem, _a_ctr, _a_rx, _a_ry, _a_rz, _a_ext in anchor_rows:
                _a_name = getattr(_a_elem, 'Name', None)
                _a_storey = get_storey_for_element(_a_elem)
                _a_disc = infer_discipline(_a_cls)
                _a_type = None
                try:
                    for _rel in _a_elem.IsDefinedBy:
                        if _rel.is_a("IfcRelDefinesByType"):
                            _a_type = _rel.RelatingType.Name
                            break
                except (AttributeError, TypeError):
                    pass
                _a_mat = get_material_for_element(_a_elem)
                _a_rgba = get_colour_for_element(_a_elem)
                _a_eid = next_id
                next_id += 1
                conn.execute(
                    "INSERT OR IGNORE INTO elements_meta "
                    "(id, guid, discipline, ifc_class, element_name, element_type, "
                    "storey, material_name, material_rgba, building, is_anchor) "
                    "VALUES (?,?,?,?,?,?,?,?,?,?,1)",
                    (_a_eid, _a_guid, _a_disc, _a_cls, _a_name, _a_type, _a_storey,
                     _a_mat, _a_rgba, _building_label))
                conn.execute(
                    "INSERT OR IGNORE INTO element_transforms "
                    "(guid, center_x, center_y, center_z, "
                    "rotation_x, rotation_y, rotation_z, bbox_x, bbox_y, bbox_z, transform_source) "
                    "VALUES (?,?,?,?,?,?,?,?,?,?,'void_anchor')",
                    (_a_guid, _a_ctr[0], _a_ctr[1], _a_ctr[2],
                     float(_a_rx), float(_a_ry), float(_a_rz),
                     _a_ext[0], _a_ext[1], _a_ext[2]))
                anchors += 1
                print(f"  §ANCHOR {_a_cls} {_a_guid} name={_a_name} "
                      f"centre=({_a_ctr[0]:.3f},{_a_ctr[1]:.3f},{_a_ctr[2]:.3f})m "
                      f"extent=({_a_ext[0]:.3f},{_a_ext[1]:.3f},{_a_ext[2]:.3f})m")
            print(f"  §ANCHOR persisted anchors={anchors} void-consumed hosts as non-rendered logical "
                  f"anchors (is_anchor=1, transform_source='void_anchor'; no element_instances/rtree "
                  f"rows — excluded from imported/geometry totals and every §PROOF gate)")
        elif anchor_rows and dry_run:
            print(f"  §ANCHOR dry-run: {len(anchor_rows)} anchors would be persisted (skipped)")
        # S173: Pre-normalize coordinate summary (FINE only)
        if FINE and imported > 0:
            cx_span = _cx_max - _cx_min
            cy_span = _cy_max - _cy_min
            cz_span = _cz_max - _cz_min
            print(f"  §PRE_NORM centre X=[{_cx_min:.2f},{_cx_max:.2f}] "
                  f"Y=[{_cy_min:.2f},{_cy_max:.2f}] "
                  f"Z=[{_cz_min:.2f},{_cz_max:.2f}]")
            print(f"  §PRE_NORM span=({cx_span:.1f}, {cy_span:.1f}, {cz_span:.1f})m  "
                  f"vmax_global={_vmax_global:.3f}m")

    if not dry_run:
        conn.commit()
        if lib_conn:
            lib_conn.commit()

    # S169: Normalize building origin — subtract centroid so building is near (0,0,0)
    # Fixes georeferenced IFC files (UTM/national grid) that place elements at 100K+ metres
    # S173: SKIP when called from merge script — merge does its own post-merge normalization.
    # Per-discipline normalization destroys inter-discipline alignment.
    if skip_normalize:
        print(f"  §NORMALIZE skip (--skip-normalize: merge script handles post-merge normalization)")
    elif not dry_run and imported > 0:
        # §ANCHOR: anchors must not SHIFT the centroid (offset stays bit-identical to a pre-anchor
        # extraction) — but the offset UPDATE below applies to ALL rows including anchors, so anchors
        # land in the same normalized building frame as everything else.
        row = conn.execute("""
            SELECT AVG(center_x), AVG(center_y), MIN(center_z)
            FROM element_transforms
            WHERE COALESCE(transform_source,'') <> 'void_anchor'
        """).fetchone()
        if row and row[0] is not None:
            ox, oy, oz = row[0], row[1], row[2]
            # Only normalize if significantly far from origin (> 100m)
            if abs(ox) > 100 or abs(oy) > 100 or abs(oz) > 100:
                print(f"  §NORMALIZE origin far from (0,0,0): centroid=({ox:.1f}, {oy:.1f}, {oz:.1f})")
                print(f"  §NORMALIZE subtracting offset to re-center building at origin")
                conn.execute("""
                    UPDATE element_transforms
                    SET center_x = center_x - ?,
                        center_y = center_y - ?,
                        center_z = center_z - ?
                """, (ox, oy, oz))
                conn.execute("""
                    UPDATE elements_rtree
                    SET minX = minX - ?, maxX = maxX - ?,
                        minY = minY - ?, maxY = maxY - ?,
                        minZ = minZ - ?, maxZ = maxZ - ?
                """, (ox, ox, oy, oy, oz, oz))
                # IfcSpace footprint AABB shares the element frame → apply the same offset (size invariant)
                conn.execute("""
                    UPDATE spatial_structure
                    SET center_x = center_x - ?, center_y = center_y - ?, center_z = center_z - ?
                    WHERE center_x IS NOT NULL
                """, (ox, oy, oz))
                # Store offset for IFC round-trip export
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS site_normalization (
                        key TEXT PRIMARY KEY, value REAL
                    )
                """)
                conn.execute("INSERT OR REPLACE INTO site_normalization VALUES ('offset_x', ?)", (ox,))
                conn.execute("INSERT OR REPLACE INTO site_normalization VALUES ('offset_y', ?)", (oy,))
                conn.execute("INSERT OR REPLACE INTO site_normalization VALUES ('offset_z', ?)", (oz,))
                conn.commit()
                # Verify
                vrow = conn.execute("""
                    SELECT AVG(center_x), AVG(center_y), MIN(center_z)
                    FROM element_transforms
                    WHERE COALESCE(transform_source,'') <> 'void_anchor'
                """).fetchone()
                print(f"  §NORMALIZE offset=({ox:.1f}, {oy:.1f}, {oz:.1f}) stored in site_normalization")
                print(f"  §NORMALIZE after: centroid=({vrow[0]:.1f}, {vrow[1]:.1f}, {vrow[2]:.1f}) — should be near (0,0,0)")
            else:
                print(f"  §NORMALIZE skip — centroid=({ox:.1f}, {oy:.1f}, {oz:.1f}) already near origin")

        # §KUL001: project_metadata — the Viewer reads true_north_angle from it and logged
        # `no such table: project_metadata` on every CLI-extracted DB. Same shape the browser
        # importer writes (viewer/import_db_builder.js:28).
        conn.execute("CREATE TABLE IF NOT EXISTS project_metadata (key TEXT PRIMARY KEY, value TEXT)")
        for _k, _v in (("project_name", building_type),
                       ("building_name", _building_label),
                       ("source_file", os.path.basename(ifc_path)),
                       ("import_date", _dt.datetime.now(_dt.timezone.utc)
                                          .strftime("%Y-%m-%dT%H:%M:%S.000Z")),
                       ("true_north_angle", "0")):
            conn.execute("INSERT OR REPLACE INTO project_metadata (key,value) VALUES (?,?)", (_k, _v))
        conn.commit()
        _bn = conn.execute("SELECT COUNT(*) FROM elements_meta WHERE building IS NOT NULL").fetchone()[0]
        _bt = conn.execute("SELECT COUNT(*) FROM elements_meta").fetchone()[0]
        print(f"  §BUILDING_COL {_bn}/{_bt} rows carry building={_building_label}; "
              f"project_metadata rows={conn.execute('SELECT COUNT(*) FROM project_metadata').fetchone()[0]}")

    # Extract IfcRelAggregates — parent-child decomposition
    agg_count = 0
    if not dry_run:
        try:
            for rel in ifc_file.by_type("IfcRelAggregates"):
                try:
                    parent = rel.RelatingObject
                    if not parent or not hasattr(parent, 'GlobalId'):
                        continue
                    for child in rel.RelatedObjects:
                        if not child or not hasattr(child, 'GlobalId'):
                            continue
                        conn.execute(
                            "INSERT OR IGNORE INTO rel_aggregates (parent_guid, child_guid) "
                            "VALUES (?, ?)", (parent.GlobalId, child.GlobalId))
                        agg_count += 1
                except (AttributeError, TypeError):
                    pass
            conn.commit()
        except RuntimeError:
            pass  # IFC schema may not have these types
    if agg_count > 0:
        print(f"  IfcRelAggregates: {agg_count} parent→child decomposition mappings")

    # ── §PATHB: recover the void/fill chain into rel_fills_host ─────────────
    if not dry_run:
        fills_rows, fills_filled = extract_rel_fills_host(ifc_file, conn)
        if fills_rows > 0:
            print(f"  §PATHB rel_fills_host: {fills_rows} host edges recovered "
                  f"({fills_filled} with a door/window filling, "
                  f"{fills_rows - fills_filled} open voids)")

    # ── §ABUTS: derive the face-touch adjacency edge from measured AABBs ────
    if not dry_run:
        adj_rows = derive_adjacency(conn)
        if adj_rows > 0:
            print(f"  §ABUTS rel_adjacency: {adj_rows} face-touch edges derived "
                  f"(measured shared-face contact, provenance=derived:face-touch)")

    # ── §ANCHORED: derive datum planes + the anchored-to edge from face cadence ──
    if not dry_run:
        n_datums, n_anchors = derive_datums_and_anchors(conn)
        if n_datums > 0:
            print(f"  §ANCHORED datum_plane: {n_datums} datums emerged from cadence, "
                  f"{n_anchors} anchored-to edges (provenance=derived:cadence)")

    # ── §SPANS: derive the spans edge (element bbox straddles two datums) ────
    if not dry_run:
        span_rows = derive_spans(conn)
        if span_rows > 0:
            print(f"  §SPANS rel_spans: {span_rows} span edges derived "
                  f"(element stretches between two datums, provenance=derived:bbox-spans-datums)")

    # Extract rich surface styles + material layers
    source_tag = f"EXTRACTED:{os.path.basename(ifc_path)}"
    styles = extract_surface_styles(ifc_file, source_tag)
    layers = extract_material_layers(ifc_file)
    lsu_rows = extract_rel_material_layer_set(ifc_file)
    if not dry_run:
        write_surface_styles(conn, styles)
        write_material_layers(conn, layers)
        write_rel_material_layer_set(conn, lsu_rows)
        multi = sum(1 for r in lsu_rows if (r['layer_count'] or 0) > 1)
        print(f"  §LOD400-LAYERS rel_material_layer_set: {len(lsu_rows)} element→layer-set edges "
              f"({multi} multi-layer) — provenance=ifc:IfcMaterialLayerSetUsage")

    # ── §LOD400-LAYERS-REAL: compile per-layer slabs from the authored layer sets ──────────
    # Runs BEFORE the §PROOF block so P10 measures the compiled state. Refused elements keep
    # their envelope and keep the gate RED (exit non-zero) — the remedy is fixing the source,
    # never softening the gate.
    if not dry_run and imported > 0:
        compile_layer_geometry(conn, lib_conn)

    # ── S173: PROOF BLOCK — self-checking summary ──────────────────────────
    # Each check prints PASS/FAIL with evidence. Read this block only.
    print(f"\n  {'─'*60}")
    # §ANCHOR: anchors are their OWN count — never folded into elements/imported (binding condition).
    print(f"  §PROOF {os.path.basename(ifc_path)}  elements={imported}  "
          f"failed={failed}  void_consumed={void_consumed}  bbox_fallback={bbox_fallback}  "
          f"anchors={anchors}")
    print(f"  {'─'*60}")

    _proof_pass = 0
    _proof_fail = 0

    def _check(name, ok, evidence):
        nonlocal _proof_pass, _proof_fail
        tag = "PASS" if ok else "FAIL"
        if ok:
            _proof_pass += 1
        else:
            _proof_fail += 1
        print(f"    {tag:4s}  {name:20s}  {evidence}")

    if not dry_run and imported > 0:
        # P1: SCALE — coordinates in metres (span 1-500m for real buildings)
        # §ANCHOR: anchor rows excluded so the gate's evidence is bit-identical to a pre-anchor run
        # (binding condition: anchors affect NO gate).
        cr = conn.execute("""
            SELECT MIN(center_x), MAX(center_x),
                   MIN(center_y), MAX(center_y),
                   MIN(center_z), MAX(center_z)
            FROM element_transforms
            WHERE COALESCE(transform_source,'') <> 'void_anchor'
        """).fetchone()
        span_x = abs(cr[1]-cr[0])
        span_y = abs(cr[3]-cr[2])
        span_z = abs(cr[5]-cr[4])
        span = max(span_x, span_y, span_z)
        _check("SCALE",
               0.5 < span < 500,
               f"span=({span_x:.1f},{span_y:.1f},{span_z:.1f})m  "
               f"X=[{cr[0]:.1f},{cr[1]:.1f}] Y=[{cr[2]:.1f},{cr[3]:.1f}] Z=[{cr[4]:.1f},{cr[5]:.1f}]")

        # P2: MESH_SCALE — vertex BLOBs in metres (vmax < 200m)
        _check("MESH_SCALE",
               0.001 < _vmax_global < 500,
               f"vmax_global={_vmax_global:.3f}m  unit_scale={unit_scale}")

        # P3: DEDUP — geometry deduplication working
        unique_hashes = conn.execute(
            "SELECT COUNT(DISTINCT geometry_hash) FROM element_instances").fetchone()[0]
        total_instances = conn.execute(
            "SELECT COUNT(*) FROM element_instances").fetchone()[0]
        reuse = total_instances / max(unique_hashes, 1)
        _check("DEDUP",
               unique_hashes > 0,
               f"{unique_hashes} hashes / {total_instances} instances  reuse={reuse:.1f}x")

        # P4: ROT_TRUTH — Euler→matrix matches original IFC matrix (checked at event)
        _check("ROT_TRUTH",
               _rot_fail == 0 and _rot_ok > 0,
               f"{_rot_ok} ok, {_rot_fail} fail  "
               f"(Euler decompose→reconstruct vs IFC iterator matrix)")

        # P5: FAIL_RATE — extraction failures below 1%.
        # §LODHELL-FIX-1: `failed` now excludes VOID-CONSUMED elements (see is_void_consumed) — those are a
        # correct authored outcome, and counting them kept this check permanently red on SampleCastle
        # (65/3648 = 1.78%), which is exactly how a REAL loss would have gone unnoticed.
        fail_pct = (failed / max(imported + failed, 1)) * 100
        _check("FAIL_RATE",
               fail_pct < 1.0,
               f"{failed}/{imported+failed} ({fail_pct:.2f}%)")

        # P9: VOID_CONSUMED — a fully-voided host is only correct if the thing that voided it is FILLED by
        # an element that DOES have geometry. A consumed host whose filling is also missing is a genuine
        # hole in the model — this is the check that would catch a real loss hiding behind the classifier.
        # (Open voids — filling_guid NULL, an authored hole with no door/window — are legitimate.)
        try:
            orphan = conn.execute("""
                SELECT COUNT(*) FROM rel_fills_host r
                WHERE r.filling_guid IS NOT NULL
                  AND NOT EXISTS (SELECT 1 FROM element_instances i WHERE i.guid = r.filling_guid)
            """).fetchone()[0]
            total_fills = conn.execute(
                "SELECT COUNT(*) FROM rel_fills_host WHERE filling_guid IS NOT NULL").fetchone()[0]
        except sqlite3.OperationalError:
            orphan, total_fills = 0, 0
        _check("VOID_CONSUMED",
               orphan == 0,
               f"{void_consumed} hosts consumed by own opening; "
               f"{total_fills - orphan}/{total_fills} fillings have geometry, {orphan} orphaned")

        # P10: LOD400_ENVELOPE — §LOD400-ENVELOPE, user directive 2026-07-29/30 ("the NO FALLBACK rule must
        # never be broken.. simple throws exception and hard fail"). An element the SOURCE authored as N
        # material layers, shipped as ONE undifferentiated solid, is an ENVELOPE FALLBACK: non-LOD400
        # content presented as the element's real geometry. Fidelity is owed to what the source authored,
        # NOT to whatever the tessellator handed back — "GIGO" is not a defence when the layers are right
        # there in the file. A red §PROOF exits non-zero (see main()), so this gate has teeth by design:
        # it must stay RED until §LOD400-LAYERS-REAL ships per-layer geometry. Do NOT soften it to a
        # warning, do NOT add a threshold, do NOT add a per-building exemption.
        # §LOD400-LAYERS-REAL: an element is an envelope only if its (current) hash resolves NO
        # compiled per-layer index rows at all. Rows may be FEWER than the authored layer_count
        # (user exception ruling 2026-07-31: a layer clipped away by authored geometry has no row;
        # the remaining slabs are the element's own real material — honest whole-layer subsets are
        # LOD400, the no-fallback rule bans INVENTED content). Compiled elements pass; refused
        # elements keep firing — that is the gate doing its job, not a bug.
        try:
            _lay_store = lib_conn if lib_conn else conn
            _layered = dict(_lay_store.execute(
                "SELECT geometry_hash, COUNT(*) FROM component_geometry_layers "
                "GROUP BY geometry_hash").fetchall())
            _multi = conn.execute("""
                SELECT r.element_guid, r.layer_count, r.layer_set_name, i.geometry_hash
                FROM rel_material_layer_set r
                JOIN element_instances i ON i.guid = r.element_guid
                WHERE r.layer_count > 1
                ORDER BY r.layer_count DESC
            """).fetchall()
            multi_total = conn.execute(
                "SELECT COUNT(*) FROM rel_material_layer_set WHERE layer_count > 1").fetchone()[0]
            _offenders = [(g, n, s) for (g, n, s, h) in _multi if not _layered.get(h)]
            envelope = len(_offenders)
            worst = _offenders[:5]
        except sqlite3.OperationalError:
            envelope, multi_total, worst = 0, 0, []
        if envelope:
            print(f"  §ILLEGAL_LOD_FALLBACK {envelope} element(s) authored MULTI-LAYER are shipped as a "
                  f"single envelope solid — non-LOD400 content standing in for real geometry.")
            for g, n, name in worst:
                print(f"      §ILLEGAL_LOD_FALLBACK guid={g} layers={n} set={name!r}")
            print(f"      → fix at source: §LOD400-LAYERS-REAL (slice the envelope along the authored "
                  f"LayerSetDirection at the authored thicknesses). Never render the envelope as real.")
        _check("LOD400_ENVELOPE",
               envelope == 0,
               f"{envelope}/{multi_total} multi-layer elements shipped as an envelope solid")

        # P6: MATERIALS — some materials found
        _check("MATERIALS",
               mat_found > 0 or rgba_found > 0,
               f"{mat_found} names, {rgba_found} rgba, {len(styles)} styles, {len(layers)} layers")

    # P7: LIBRARY — writes succeeded (when using library mode)
    if lib_conn and not dry_run:
        total_geo = lib_conn.execute(
            "SELECT COUNT(*) FROM component_geometries").fetchone()[0]
        total_igm = lib_conn.execute(
            "SELECT COUNT(*) FROM I_Geometry_Map").fetchone()[0]
        _check("LIBRARY",
               lib_geo_new > 0 or total_geo > 0,
               f"+{lib_geo_new} new hashes, +{lib_igm_new} mappings  "
               f"totals: {total_geo} geo, {total_igm} map")

        # P8: LIBRARY_SCALE — spot-check vertex scale in library
        sample = lib_conn.execute("""
            SELECT vertices, vertex_count FROM component_geometries
            WHERE vertices IS NOT NULL AND vertex_count > 3
            ORDER BY RANDOM() LIMIT 5
        """).fetchall()
        lib_scale_ok = True
        worst_vmax = 0.0
        for vblob, vc in sample:
            if vblob:
                sv = np.frombuffer(vblob, dtype=np.float32).reshape(-1, 3)
                vm = np.abs(sv).max()
                if vm > worst_vmax:
                    worst_vmax = vm
                if vm > 500:
                    lib_scale_ok = False
        _check("LIBRARY_SCALE",
               lib_scale_ok,
               f"spot-check {len(sample)} meshes  worst_vmax={worst_vmax:.3f}m")

        # NOTE: RECONSTRUCT + IFC_TRUTH proofs run at LOAD TIME (stress_blender_test.py)
        # not here — extraction has the IFC so it can't fail here.

        lib_conn.close()

    print(f"  {'─'*60}")
    print(f"  §PROOF RESULT: {_proof_pass} PASS, {_proof_fail} FAIL")
    print(f"  {'─'*60}")
    # §LODHELL-FIX-1: a red §PROOF must FAIL THE RUN. Before this, the block printed FAIL and the process
    # still exited 0 — verified 2026-07-27 on SampleCastle (P5 FAIL, exit 0), which is why a permanently
    # red gate was tolerated for weeks. main() reads this and sets the exit status.
    global LAST_PROOF_FAIL
    LAST_PROOF_FAIL = _proof_fail

    # Summary by class — §ANCHOR rows excluded (binding condition: anchors are never folded into the
    # extractor's geometry totals; they get their own one-line count instead).
    if not dry_run:
        rows = conn.execute(
            "SELECT ifc_class, COUNT(*) FROM elements_meta WHERE COALESCE(is_anchor,0)=0 "
            "GROUP BY ifc_class ORDER BY COUNT(*) DESC"
        ).fetchall()
        print(f"\n  By IFC class:")
        for cls, cnt in rows:
            print(f"    {cls:40s} {cnt}")
        if anchors:
            print(f"    (+{anchors} §ANCHOR rows — non-rendered void-consumed hosts, not geometry)")

        # Summary by discipline
        rows = conn.execute(
            "SELECT discipline, COUNT(*) FROM elements_meta WHERE COALESCE(is_anchor,0)=0 "
            "GROUP BY discipline ORDER BY COUNT(*) DESC"
        ).fetchall()
        print(f"\n  By discipline:")
        for disc, cnt in rows:
            print(f"    {disc:15s} {cnt}")

        # Material summary
        rows = conn.execute(
            "SELECT material_name, COUNT(*), material_rgba FROM elements_meta "
            "WHERE material_name IS NOT NULL AND COALESCE(is_anchor,0)=0 "
            "GROUP BY material_name ORDER BY COUNT(*) DESC"
        ).fetchall()
        if rows:
            print(f"\n  Materials ({len(rows)} distinct):")
            for mat, cnt, rgba in rows[:15]:
                rgba_str = f"  rgba={rgba}" if rgba else ""
                print(f"    {mat:45s} {cnt:4d}{rgba_str}")
            if len(rows) > 15:
                print(f"    ... and {len(rows) - 15} more")

        sz = os.path.getsize(output_path) / (1024 * 1024)
        conn.close()
        print(f"\n  Written to: {output_path} ({sz:.1f} MB)")

    return imported


# ---------------------------------------------------------------------------
# Enrich existing DB with materials only (no geometry re-extraction)
# ---------------------------------------------------------------------------

def enrich_reference_db(ifc_path, ref_db_path, dry_run=False):
    """Add materials from IFC to existing reference DB (ALTER TABLE if needed)."""
    import ifcopenshell

    print(f"Opening IFC: {ifc_path}")
    ifc_file = ifcopenshell.open(ifc_path)

    conn = sqlite3.connect(ref_db_path)

    # Ensure material columns exist
    cols = {row[1] for row in conn.execute("PRAGMA table_info(elements_meta)")}
    if "material_name" not in cols:
        if not dry_run:
            conn.execute("ALTER TABLE elements_meta ADD COLUMN material_name TEXT")
            print("  Added material_name column")
    if "material_rgba" not in cols:
        if not dry_run:
            conn.execute("ALTER TABLE elements_meta ADD COLUMN material_rgba TEXT")
            print("  Added material_rgba column")
        conn.commit()

    # Build GUID -> IFC element lookup
    guid_to_ifc = {}
    for elem in ifc_file:
        if hasattr(elem, 'GlobalId'):
            guid_to_ifc[elem.GlobalId] = elem

    rows = conn.execute("SELECT id, guid FROM elements_meta").fetchall()
    print(f"  Reference DB has {len(rows)} elements")

    matched = mat_found = rgba_found = 0
    updates = []

    for eid, guid in rows:
        ifc_elem = guid_to_ifc.get(guid)
        if not ifc_elem:
            continue
        matched += 1
        material_name = get_material_for_element(ifc_elem)
        rgba = get_colour_for_element(ifc_elem)
        if material_name:
            mat_found += 1
        if rgba:
            rgba_found += 1
        if material_name or rgba:
            updates.append((material_name, rgba, guid))

    print(f"  GUID matched: {matched}/{len(rows)}")
    print(f"  Material names: {mat_found}, RGBA colours: {rgba_found}")

    if dry_run:
        for mat, rgba, guid in updates[:10]:
            print(f"    {guid}: material={mat}, rgba={rgba}")
    else:
        for mat, rgba, guid in updates:
            conn.execute(
                "UPDATE elements_meta SET material_name = ?, material_rgba = ? "
                "WHERE guid = ?", (mat, rgba, guid))
        conn.commit()
        print(f"  Wrote {len(updates)} material updates.")

    conn.close()
    return len(updates)


# ---------------------------------------------------------------------------
# Populate I_Element_Extraction with material data
# ---------------------------------------------------------------------------

def populate_placement_materials(ref_db_path, library_db_path, building_type, dry_run=False):
    """Copy material_name/material_rgba from reference DB to I_Element_Extraction."""
    ref_conn = sqlite3.connect(ref_db_path)
    lib_conn = sqlite3.connect(library_db_path)

    # Ensure placement table has material columns
    cols = {row[1] for row in lib_conn.execute("PRAGMA table_info(I_Element_Extraction)")}
    if "material_name" not in cols and not dry_run:
        lib_conn.execute("ALTER TABLE I_Element_Extraction ADD COLUMN material_name TEXT")
        print("  Added material_name column to I_Element_Extraction")
    if "material_rgba" not in cols and not dry_run:
        lib_conn.execute("ALTER TABLE I_Element_Extraction ADD COLUMN material_rgba TEXT")
        print("  Added material_rgba column to I_Element_Extraction")

    # Check reference DB has material columns
    ref_cols = {row[1] for row in ref_conn.execute("PRAGMA table_info(elements_meta)")}
    if "material_name" not in ref_cols:
        print("  ERROR: Reference DB has no material_name column. Run extraction first.")
        ref_conn.close()
        lib_conn.close()
        return 0

    def normalize_storey(s):
        if not s or s.strip() == "":
            return "Unknown"
        return s.strip()

    # Get reference elements ordered for ordinal assignment (same as placement_extractor)
    ref_elements = ref_conn.execute("""
        SELECT m.guid, m.ifc_class, m.storey, m.material_name, m.material_rgba,
               r.minX, r.minY, r.minZ
        FROM elements_meta m
        JOIN elements_rtree r ON m.id = r.id
        ORDER BY m.ifc_class, m.storey, r.minX, r.minY, r.minZ
    """).fetchall()

    # Assign 1-based ordinals (matching placement_extractor convention)
    ordinal_counter = {}
    ref_lookup = {}
    for guid, ifc_class, storey, mat_name, mat_rgba, minX, minY, minZ in ref_elements:
        storey_norm = normalize_storey(storey)
        key = (ifc_class, storey_norm)
        ordinal = ordinal_counter.get(key, 1)
        ordinal_counter[key] = ordinal + 1
        ref_lookup[(ifc_class, storey_norm, ordinal)] = (mat_name, mat_rgba)

    # Read placement entries
    placements = lib_conn.execute("""
        SELECT rowid, ifc_class, storey, ordinal
        FROM I_Element_Extraction
        WHERE building_type = ? AND is_active = 1
    """, (building_type,)).fetchall()

    updates = []
    for rowid, ifc_class, storey, ordinal in placements:
        storey_norm = normalize_storey(storey)
        mat = ref_lookup.get((ifc_class, storey_norm, ordinal))
        if mat and (mat[0] or mat[1]):
            updates.append((mat[0], mat[1], rowid))

    print(f"  Placements for {building_type}: {len(placements)}")
    print(f"  Material matches: {len(updates)}")

    if dry_run:
        for mat_name, mat_rgba, rowid in updates[:10]:
            print(f"    rowid={rowid}: material={mat_name}, rgba={mat_rgba}")
    else:
        for mat_name, mat_rgba, rowid in updates:
            lib_conn.execute(
                "UPDATE I_Element_Extraction SET material_name = ?, material_rgba = ? "
                "WHERE rowid = ?", (mat_name, mat_rgba, rowid))
        lib_conn.commit()
        print(f"  Wrote {len(updates)} material updates to I_Element_Extraction.")

    ref_conn.close()
    lib_conn.close()
    return len(updates)


# ---------------------------------------------------------------------------
# Enrich existing DB with surface_styles + material_layers only
# ---------------------------------------------------------------------------

def enrich_styles_only(ifc_path, ref_db_path, dry_run=False):
    """Add surface_styles + material_layers to existing reference DB."""
    import ifcopenshell

    print(f"Opening IFC: {ifc_path}")
    ifc_file = ifcopenshell.open(ifc_path)

    conn = sqlite3.connect(ref_db_path)

    # Ensure tables exist
    conn.execute("""CREATE TABLE IF NOT EXISTS surface_styles (
        style_name TEXT PRIMARY KEY,
        surface_r REAL, surface_g REAL, surface_b REAL,
        transparency REAL DEFAULT 0.0,
        specular_r REAL, specular_g REAL, specular_b REAL,
        specular_ratio REAL, specular_exponent REAL,
        reflectance_method TEXT DEFAULT 'NOTDEFINED',
        side TEXT DEFAULT 'BOTH', source TEXT)""")
    conn.execute("""CREATE TABLE IF NOT EXISTS material_layers (
        layer_set_name TEXT NOT NULL, sequence INTEGER NOT NULL,
        material_name TEXT, thickness_m REAL, is_ventilated INTEGER DEFAULT 0,
        PRIMARY KEY (layer_set_name, sequence))""")
    conn.commit()

    source_tag = f"EXTRACTED:{os.path.basename(ifc_path)}"
    styles = extract_surface_styles(ifc_file, source_tag)
    layers = extract_material_layers(ifc_file)

    print(f"  Surface styles: {len(styles)}")
    for s in styles[:10]:
        spec_info = ""
        if s['specular_exponent'] is not None:
            spec_info = f" exp={s['specular_exponent']}"
        elif s['specular_ratio'] is not None:
            spec_info = f" ratio={s['specular_ratio']}"
        print(f"    {s['style_name']:40s} t={s['transparency']:.2f} {s['reflectance_method']}{spec_info}")
    if len(styles) > 10:
        print(f"    ... and {len(styles) - 10} more")

    print(f"  Material layers: {len(layers)}")
    for l in layers:
        vent = " [VENTILATED]" if l['is_ventilated'] else ""
        thick = f" {l['thickness_m']*1000:.0f}mm" if l['thickness_m'] else ""
        print(f"    {l['layer_set_name']:45s} #{l['sequence']} {l['material_name']}{thick}{vent}")

    if not dry_run:
        write_surface_styles(conn, styles)
        write_material_layers(conn, layers)
        print(f"  Written to: {ref_db_path}")

    conn.close()
    return len(styles), len(layers)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="DAGCompiler Reference DB Extractor — IFC to reference DB with materials")
    parser.add_argument("--ifc", help="IFC source file path")
    parser.add_argument("-o", "--output", help="Output reference DB path (for full extraction)")
    parser.add_argument("--ref", help="Existing reference DB path (for --enrich or --populate-placement)")
    parser.add_argument("--enrich", action="store_true",
                        help="Enrich existing DB with materials only (no geometry)")
    parser.add_argument("--populate-placement", action="store_true",
                        help="Copy materials from reference DB to I_Element_Extraction")
    parser.add_argument("--library", help="Component library DB path (S168: mesh BLOBs go here during extraction)")
    parser.add_argument("--building-type", help="Building type key (auto-derived from IFC filename if omitted)")
    parser.add_argument("--styles-only", action="store_true",
                        help="Enrich existing DB with surface_styles + material_layers only")
    parser.add_argument("--compile-layers", action="store_true",
                        help="§LOD400-LAYERS-REAL: compile+verify per-layer slabs on an EXISTING "
                             "extracted DB (--ref, optional --library). Non-zero exit on any "
                             "refusal or authored-vs-compiled inconsistency.")
    parser.add_argument("--exclude", help="Comma-separated IFC classes to exclude")
    parser.add_argument("--skip-normalize", action="store_true",
                        help="Skip centroid normalization (merge script does its own)")
    parser.add_argument("--dry-run", action="store_true", help="Report only, no writes")
    args = parser.parse_args()

    exclude = args.exclude.split(",") if args.exclude else []

    if args.compile_layers:
        if not args.ref:
            print("ERROR: --compile-layers requires --ref (and --library when blobs live there)")
            sys.exit(1)
        sys.exit(compile_layers_cli(args.ref, args.library))
    elif args.styles_only:
        if not args.ifc or not args.ref:
            print("ERROR: --styles-only requires --ifc and --ref")
            sys.exit(1)
        enrich_styles_only(args.ifc, args.ref, args.dry_run)
    elif args.populate_placement:
        if not args.ref or not args.library or not args.building_type:
            print("ERROR: --populate-placement requires --ref, --library, and --building-type")
            sys.exit(1)
        populate_placement_materials(args.ref, args.library, args.building_type, args.dry_run)
    elif args.enrich:
        if not args.ifc or not args.ref:
            print("ERROR: --enrich requires --ifc and --ref")
            sys.exit(1)
        enrich_reference_db(args.ifc, args.ref, args.dry_run)
    elif args.ifc and args.output:
        extract_reference(args.ifc, args.output, exclude=exclude,
                          dry_run=args.dry_run,
                          library_path=args.library,
                          building_type=args.building_type,
                          skip_normalize=args.skip_normalize)
        # §LODHELL-FIX-1: red §PROOF ⇒ non-zero exit. Exit code is not evidence on its own (Log Mandate),
        # but a gate that can never fail the run is not a gate at all.
        if LAST_PROOF_FAIL > 0:
            print(f"  §PROOF gate FAILED ({LAST_PROOF_FAIL} check(s)) — read the log above")
            sys.exit(1)
    else:
        print("ERROR: Must specify either:")
        print("  --ifc FILE -o OUTPUT       Full extraction (geometry + materials)")
        print("  --enrich --ifc FILE --ref DB   Enrich existing DB with materials")
        print("  --populate-placement --ref DB --library DB --building-type TYPE")
        sys.exit(1)


if __name__ == "__main__":
    main()
