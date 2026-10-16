#!/usr/bin/env python3
"""
Unified extraction tool for BIM Compiler.

Handles both Layer 1 (LOD400 → component_library.db) and
Layer 3 (Rosetta reference → reference/rosetta/*.db).

Sources: .ifc files (tessellates via ifcopenshell) or .db files (pre-tessellated).

Usage:
  # Layer 3: Extract Rosetta reference from IFC
  python3 tools/extract.py --to reference  source.ifc  -o reference/rosetta/out.db

  # Layer 3: Extract Rosetta reference from pre-tessellated DB (federation)
  python3 tools/extract.py --to reference  database/enhanced_federation_GI.db \
      -o reference/rosetta/terminal.db \
      --exclude IfcPlate,IfcOpeningElement

  # Layer 1: Extract LOD400 geometry to component library from DB
  python3 tools/extract.py --to library  database/enhanced_federation_GI.db

  # Layer 1: Extract LOD400 geometry to component library from IFC
  python3 tools/extract.py --to library  source.ifc --classes IfcFurniture,IfcDoor

  # Filter by discipline (DB sources only)
  python3 tools/extract.py --to reference  federation.db -o out.db --discipline ARC,STR
"""

import argparse
import hashlib
import os
import sqlite3
import struct
import sys

import numpy as np

# ---------------------------------------------------------------------------
# Geometry helpers
# ---------------------------------------------------------------------------

def geometry_hash(vertices_blob, faces_blob):
    """SHA256-based 16-char hash of centered geometry."""
    return hashlib.sha256(vertices_blob + faces_blob).hexdigest()[:16]


def parse_vertices_blob(blob):
    """Parse float32 vertex blob → numpy (N,3)."""
    n = len(blob) // 12
    verts = np.zeros((n, 3), dtype=np.float32)
    for i in range(n):
        x, y, z = struct.unpack('<fff', blob[i*12:(i+1)*12])
        verts[i] = [x, y, z]
    return verts


# ---------------------------------------------------------------------------
# IFC helpers (only imported when needed)
# ---------------------------------------------------------------------------

# Revit exports its reference PLANES (Ceiling, Top-of-Steel, etc.) as IfcBuildingStorey, so MEP/STR
# elements land on "Level 2 Ceiling" / "Level 2 TOS" instead of the real "Level 2" — polluting the
# spatial tree with junk sibling storeys (Hospital: ~26% of elements). Normalize to the base level.
# Deterministic: strip a known reference-plane suffix; otherwise return the name unchanged. Extend the
# list from evidence (SELECT DISTINCT storey ...), never guess a level that isn't in the data.
# Reference-plane qualifiers appear as a SUFFIX ("Level 2 Ceiling") OR a PREFIX ("Ceiling Level 01",
# seen in Terminal) OR bare ("Ceiling"). Strip in any position; a bare qualifier → "Unknown" (no level).
REF_LEVEL_TOKENS = ("Ceiling", "TOS", "T.O.S.", "Top of Steel", "Soffit")


def normalize_storey(name):
    """Map a Revit reference-plane storey name to its base building level. Idempotent."""
    if not name:
        return name
    s = str(name).strip()
    changed = True
    while changed:
        changed = False
        low = s.lower()
        for tok in REF_LEVEL_TOKENS:
            t = tok.lower()
            if low == t:
                s = ""; changed = True; break
            if low.endswith(" " + t):
                s = s[:-(len(t) + 1)].strip(); changed = True; break
            if low.startswith(t + " "):
                s = s[len(t) + 1:].strip(); changed = True; break
    return s if s else "Unknown"


# §STOREY_AGGREGATE_INHERIT (2026-09-04) — user, on the HHS ground-floor front wall reading as
# missing: "we broke something in translating that element". Half right, and this is the half.
# The GEOMETRY translated fine (it draws in every bake, which applies no storey filter). What was
# lost is the STOREY TAG, and it was lost for a schema reason, not a per-building one:
#
#   IFC does not contain an aggregated part in the spatial structure. IfcRelContainedInSpatialStructure
#   points at the WHOLE; the parts hang off it by IfcRelAggregates and INHERIT its containment.
#
# Reading only ContainedInStructure therefore returns "Unknown" for every part of a decomposed
# element. MEASURED before this fix, and it is fleet-wide, not an HHS quirk — 100% in both:
#   Hospital  178 IfcCurtainWall + 31 IfcStair + 24 IfcRoof  ->  9,457 children, 9,457 Unknown
#   HHS        33 IfcCurtainWall +  8 IfcStair               ->  2,120 children, 2,120 Unknown
# Downstream that is invisible until something filters by storey: viewer/panels.js:700
# _storeyVisible is an EXACT match, so "show Level 1" drops every curtain-wall panel while the
# correctly-tagged IfcWallStandardCase stay — the ground floor keeps its solid walls and loses its
# glazed front. Full trace: bim-ootb buildings/HHS_Office_Federated_ANALYSIS.md.
#
# The remedy is the schema's own rule and nothing else: walk up IfcRelAggregates when containment
# is silent. No class list, no storey name, no tuned constant — a part takes its whole's storey.
# scripts/compile_rooms.py's §STOREY-Z (nearest per-storey wall-z anchor) stays as the GEOMETRIC
# fallback for elements that have neither containment nor an aggregate parent; it is not replaced.
def get_storey_for_element(element, _depth=0):
    """Walk IFC containment to find spatial segment name.

    Supports both building and infrastructure IFCs:
    - IfcBuildingStorey (IFC2x3/IFC4) — returns storey name
    - IfcFacilityPart (IFC4X3) — returns facility part name
      (IfcRoadPart, IfcBridgePart, IfcRailwayPart)

    §STOREY_AGGREGATE_INHERIT: when the element itself is not contained (it is a PART of a
    decomposed element — a curtain-wall panel, a stair flight, a roof slab), inherit the storey of
    the whole it belongs to, recursively. Depth-capped so a malformed cyclic aggregate cannot spin.

    See docs/InfrastructureAnalysis.md for the pipeline impact chain.
    """
    SPATIAL_CONTAINERS = ("IfcBuildingStorey", "IfcFacilityPart")
    SPATIAL_ANY = ("IfcBuildingStorey", "IfcFacilityPart", "IfcBuilding", "IfcSite",
                   "IfcSpace", "IfcFacility", "IfcProject")
    try:
        for rel in element.ContainedInStructure:
            container = rel.RelatingStructure
            if any(container.is_a(t) for t in SPATIAL_CONTAINERS):
                return normalize_storey(container.Name)
            if hasattr(container, "Decomposes"):
                for dec in container.Decomposes:
                    if any(dec.RelatingObject.is_a(t) for t in SPATIAL_CONTAINERS):
                        return normalize_storey(dec.RelatingObject.Name)
    except (AttributeError, TypeError):
        pass
    # §STOREY_AGGREGATE_INHERIT — containment was silent; take the whole's storey.
    if _depth < 8:
        try:
            for dec in element.Decomposes:
                parent = getattr(dec, "RelatingObject", None)
                if parent is None:
                    continue
                if any(parent.is_a(t) for t in SPATIAL_CONTAINERS):
                    return normalize_storey(parent.Name)   # aggregated straight into a storey
                if any(parent.is_a(t) for t in SPATIAL_ANY):
                    continue                                # a spatial parent that names no storey
                storey = get_storey_for_element(parent, _depth + 1)
                if storey != "Unknown":
                    return storey
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


def _rgba_from_surface_style(style):
    """Extract RGBA string from IfcSurfaceStyle → IfcSurfaceStyleRendering."""
    try:
        for ss in (style.Styles or []):
            if ss.is_a("IfcSurfaceStyleRendering"):
                c = ss.SurfaceColour
                t = float(ss.Transparency) if ss.Transparency else 0.0
                return f"{float(c.Red):.3f},{float(c.Green):.3f},{float(c.Blue):.3f},{1.0 - t:.3f}"
    except (AttributeError, TypeError):
        pass
    return None


def _rgba_from_styled_item(item):
    """Extract RGBA string from IfcStyledItem or a shape item with StyledByItem.

    Handles both IFC2x3 (IfcSurfaceStyle direct) and IFC4
    (IfcPresentationStyleAssignment wrapper).
    """
    try:
        styled = item if item.is_a("IfcStyledItem") else None
        if not styled:
            for si in (getattr(item, "StyledByItem", None) or []):
                styled = si; break
        if not styled:
            return None
        for style in (styled.Styles or []):
            if style.is_a("IfcSurfaceStyle"):
                rgba = _rgba_from_surface_style(style)
                if rgba:
                    return rgba
            # IFC4: IfcPresentationStyleAssignment wraps actual styles
            if style.is_a("IfcPresentationStyleAssignment"):
                for inner in (style.Styles or []):
                    if inner.is_a("IfcSurfaceStyle"):
                        rgba = _rgba_from_surface_style(inner)
                        if rgba:
                            return rgba
    except (AttributeError, TypeError):
        pass
    return None


def get_material_rgba(elem):
    """Extract dominant surface RGBA from an IFC element.

    Walk order:
      1. HasAssociations → IfcRelAssociatesMaterial → material HasRepresentation
      2. elem.Representation items → IfcStyledItem
    Returns "R,G,B,A" string (0.0–1.0) or None.
    """
    # Path 1: via material association representation
    try:
        for assoc in (elem.HasAssociations or []):
            if not assoc.is_a("IfcRelAssociatesMaterial"):
                continue
            mat = assoc.RelatingMaterial
            if mat.is_a("IfcMaterialLayerSetUsage"):
                mat = mat.ForLayerSet
            if mat.is_a("IfcMaterialLayerSet") and mat.MaterialLayers:
                mat = mat.MaterialLayers[0].Material
            if not mat or not mat.is_a("IfcMaterial"):
                continue
            for mdr in (getattr(mat, "HasRepresentation", None) or []):
                for rep in (mdr.Representations or []):
                    for item in (rep.Items or []):
                        rgba = _rgba_from_styled_item(item)
                        if rgba:
                            return rgba
    except (AttributeError, TypeError):
        pass
    # Path 2: direct element representation styled items (including MappedRepresentation)
    try:
        if elem.Representation:
            for rep in elem.Representation.Representations:
                for item in rep.Items:
                    rgba = _rgba_from_styled_item(item)
                    if rgba:
                        return rgba
                    # IFC4: MappedRepresentation — follow into mapping source
                    if item.is_a("IfcMappedItem"):
                        try:
                            for sub in item.MappingSource.MappedRepresentation.Items:
                                rgba = _rgba_from_styled_item(sub)
                                if rgba:
                                    return rgba
                        except (AttributeError, TypeError):
                            pass
    except (AttributeError, TypeError):
        pass
    return None


def get_material_name(elem):
    """Extract primary material name from IfcRelAssociatesMaterial."""
    try:
        for assoc in (elem.HasAssociations or []):
            if not assoc.is_a("IfcRelAssociatesMaterial"):
                continue
            mat = assoc.RelatingMaterial
            if mat.is_a("IfcMaterialLayerSetUsage"):
                mat = mat.ForLayerSet
            if mat.is_a("IfcMaterialLayerSet"):
                return mat.LayerSetName or (
                    mat.MaterialLayers[0].Material.Name if mat.MaterialLayers else None)
            if mat.is_a("IfcMaterial"):
                return mat.Name
            if mat.is_a("IfcMaterialList") and mat.Materials:
                return mat.Materials[0].Name
    except (AttributeError, TypeError):
        pass
    return None


# ---------------------------------------------------------------------------
# Reference schema (Layer 3: Rosetta)
# ---------------------------------------------------------------------------

REFERENCE_SCHEMA = """
    CREATE TABLE IF NOT EXISTS spatial_structure (
        guid TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT,
        parent_guid TEXT,
        object_type TEXT,
        predefined_type TEXT,
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
        material_rgba TEXT
    );
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
        transform_source TEXT
    );
    CREATE TABLE IF NOT EXISTS rel_contained_in_space (
        element_guid TEXT,
        space_guid TEXT,
        PRIMARY KEY (element_guid, space_guid)
    );
    CREATE TABLE IF NOT EXISTS rel_fills_host (
        element_guid TEXT PRIMARY KEY,
        host_guid TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rel_aggregates (
        parent_guid TEXT NOT NULL,
        child_guid TEXT NOT NULL,
        PRIMARY KEY (parent_guid, child_guid)
    );
"""

# ---------------------------------------------------------------------------
# Authority table loader — reads ad_ifc_class_map from ERP.db.
# Falls back to hardcoded defaults if DB is unavailable.
# Adding a new IFC type = one INSERT into ERP.db, zero code changes.
# See migration/DV005_ifc_class_map.sql for the schema and seed data.
# ---------------------------------------------------------------------------

def _load_ifc_class_map():
    """Load IFC class extraction maps from ERP.db authority table."""
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                           "library", "ERP.db")
    classes, disciplines, categories, attachments = [], {}, {}, {}
    try:
        conn = sqlite3.connect(db_path)
        rows = conn.execute(
            "SELECT ifc_class, discipline, category, attachment_face "
            "FROM ad_ifc_class_map WHERE is_active = 1 ORDER BY ifc_class"
        ).fetchall()
        conn.close()
        if rows:
            for ifc_class, discipline, category, attachment in rows:
                classes.append(ifc_class)
                disciplines[ifc_class] = discipline
                categories[ifc_class] = category
                attachments[ifc_class] = attachment
            print(f"  [extract] Loaded {len(rows)} IFC class mappings from ERP.db")
            return classes, disciplines, categories, attachments
    except (sqlite3.OperationalError, FileNotFoundError):
        pass
    return None  # fall back to hardcoded


_loaded = _load_ifc_class_map()

# Default IFC classes for reference extraction (fallback if DB unavailable).
# See docs/InfrastructureAnalysis.md §2.3 for the infrastructure entity census.
REFERENCE_CLASSES = _loaded[0] if _loaded else [
    # ── Building elements ──
    "IfcFurnishingElement", "IfcFurniture",
    "IfcDoor", "IfcWindow",
    "IfcFlowTerminal", "IfcFlowSegment", "IfcFlowFitting",
    "IfcWall", "IfcWallStandardCase", "IfcSlab", "IfcColumn",
    "IfcStairFlight", "IfcRailing", "IfcRoof",
    "IfcPlate", "IfcMember", "IfcBeam",
    "IfcFireSuppressionTerminal", "IfcLightFixture",
    "IfcAirTerminal", "IfcPipeFitting", "IfcDuctFitting",
    "IfcPipeSegment", "IfcDuctSegment",
    "IfcValve", "IfcAlarm", "IfcElectricAppliance",
    "IfcSensor", "IfcController", "IfcFlowController",
    "IfcReinforcingBar", "IfcBuildingElementProxy",
    "IfcSanitaryTerminal", "IfcRampFlight",
    "IfcCovering",
    "IfcCourse", "IfcSurfaceFeature", "IfcEarthworksFill",
    "IfcGeographicElement", "IfcSign", "IfcTrackElement",
    "IfcRail", "IfcFooting", "IfcElementAssembly",
    "IfcDiscreteAccessory", "IfcChimney",
]

# Discipline inference from IFC class (fallback if DB unavailable).
DISCIPLINE_MAP = _loaded[1] if _loaded else {
    "IfcFlowTerminal": "MEP", "IfcFlowSegment": "MEP", "IfcFlowFitting": "MEP",
    "IfcPipeSegment": "MEP", "IfcPipeFitting": "MEP",
    "IfcDuctSegment": "MEP", "IfcDuctFitting": "MEP",
    "IfcValve": "MEP", "IfcFlowController": "MEP",
    "IfcSanitaryTerminal": "MEP",
    "IfcFireSuppressionTerminal": "FP", "IfcAlarm": "FP",
    "IfcSensor": "FP", "IfcController": "FP",
    "IfcLightFixture": "ELEC", "IfcElectricAppliance": "ELEC",
    "IfcAirTerminal": "ACMV",
    "IfcColumn": "STR", "IfcBeam": "STR", "IfcMember": "STR",
    "IfcReinforcingBar": "STR", "IfcFooting": "STR",
    "IfcElementAssembly": "STR", "IfcDiscreteAccessory": "STR",
    "IfcCourse": "ROAD", "IfcSurfaceFeature": "ROAD",
    "IfcEarthworksFill": "GEO", "IfcGeographicElement": "LAND",
    "IfcSign": "SIGN", "IfcTrackElement": "RAIL", "IfcRail": "RAIL",
}


# §FLOWTERM-REFINE: IfcFlowTerminal is the ABSTRACT supertype that IFC2x3/generic exporters emit
# for sprinklers, light fixtures, air diffusers AND sanitary fixtures alike — the flat
# "IfcFlowTerminal → MEP" rule then dumps ALL of them into MEP, so e.g. sprinklers never appear under
# the FP discipline in the Find panel (user). When the class is this catch-all, disambiguate by the
# element's NAME keyword to the discipline the specific subtype would have carried. Deterministic
# keyword match — no invention; unmatched terminals keep the MEP default.
_FLOWTERM_NAME_DISC = (
    (("sprinkler", "fire suppression", "fire protection", "firefight"), "FP"),
    (("light", "luminaire", "lamp", "downlight", "spotlight"),          "ELEC"),
    (("receptacle", "socket", "outlet", "switch", "panelboard", "panel board"), "ELEC"),
    (("diffuser", "grille", "register", "air terminal", "supply air", "return air", "exhaust"), "ACMV"),
    (("lavatory", "water closet", "urinal", "sink", "basin", "shower",
      "toilet", "wc", "sanitary", "bidet", "faucet", "tap"),           "MEP"),
)

def infer_discipline(ifc_class, name=None):
    if ifc_class == "IfcFlowTerminal" and name:
        low = name.lower()
        for keys, disc in _FLOWTERM_NAME_DISC:
            if any(k in low for k in keys):
                return disc
    return DISCIPLINE_MAP.get(ifc_class, "ARC")


# ---------------------------------------------------------------------------
# Library schema (Layer 1: LOD400)
# ---------------------------------------------------------------------------

LIBRARY_SCHEMA = """
    CREATE TABLE IF NOT EXISTS component_types (
        id INTEGER PRIMARY KEY,
        ifc_class TEXT NOT NULL,
        category TEXT NOT NULL,
        discipline TEXT NOT NULL,
        UNIQUE(ifc_class, category)
    );
    CREATE TABLE IF NOT EXISTS component_definitions (
        id INTEGER PRIMARY KEY,
        type_id INTEGER REFERENCES component_types(id),
        name TEXT NOT NULL,
        geometry_hash TEXT NOT NULL,
        local_min_x REAL, local_max_x REAL,
        local_min_y REAL, local_max_y REAL,
        local_min_z REAL, local_max_z REAL,
        attachment_face TEXT NOT NULL,
        up_axis TEXT DEFAULT 'Z',
        forward_axis TEXT DEFAULT 'Y',
        orientation TEXT,
        default_rotation REAL DEFAULT 0,
        vertex_count INTEGER,
        face_count INTEGER,
        instance_count INTEGER DEFAULT 1,
        UNIQUE(name, geometry_hash)
    );
    CREATE TABLE IF NOT EXISTS component_geometries (
        geometry_hash TEXT PRIMARY KEY,
        vertices BLOB NOT NULL,
        faces BLOB NOT NULL,
        normals BLOB,
        vertex_count INTEGER NOT NULL,
        face_count INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS placement_rules (
        id INTEGER PRIMARY KEY,
        component_id INTEGER REFERENCES component_definitions(id),
        host_type TEXT,
        offset_from_host REAL,
        grid_spacing REAL,
        clearance_radius REAL
    );
"""

CATEGORY_MAP = _loaded[2] if _loaded else {
    "IfcFireSuppressionTerminal": "SPRINKLER", "IfcLightFixture": "LIGHT",
    "IfcAirTerminal": "DIFFUSER", "IfcPipeFitting": "PIPE_FITTING",
    "IfcDuctFitting": "DUCT_FITTING", "IfcColumn": "COLUMN",
    "IfcBeam": "BEAM", "IfcMember": "MEMBER", "IfcFurniture": "FURNITURE",
    "IfcFurnishingElement": "FURNITURE", "IfcValve": "VALVE",
    "IfcAlarm": "ALARM", "IfcElectricAppliance": "APPLIANCE",
    "IfcSensor": "SENSOR", "IfcController": "CONTROLLER",
    "IfcDoor": "DOOR", "IfcWindow": "WINDOW", "IfcStairFlight": "STAIR",
    "IfcRailing": "RAILING", "IfcFlowTerminal": "FIXTURE",
    "IfcPipeSegment": "PIPE_SEGMENT", "IfcDuctSegment": "DUCT_SEGMENT",
    "IfcBuildingElementProxy": "PROXY",
    "IfcCourse": "PAVEMENT_LAYER", "IfcSurfaceFeature": "ROAD_MARKING",
    "IfcEarthworksFill": "EARTHWORK", "IfcGeographicElement": "LANDSCAPE",
    "IfcSign": "SIGNAGE", "IfcTrackElement": "TRACK_ELEMENT",
    "IfcRail": "RAIL", "IfcFooting": "FOOTING",
    "IfcElementAssembly": "ASSEMBLY", "IfcDiscreteAccessory": "ACCESSORY",
    "IfcChimney": "CHIMNEY",
}

ATTACHMENT_MAP = _loaded[3] if _loaded else {
    "IfcFireSuppressionTerminal": "TOP", "IfcLightFixture": "TOP",
    "IfcAirTerminal": "TOP", "IfcColumn": "BOTTOM", "IfcBeam": "ENDS",
    "IfcMember": "ENDS", "IfcFurniture": "BOTTOM", "IfcFurnishingElement": "BOTTOM",
    "IfcDoor": "BOTTOM", "IfcWindow": "SIDE", "IfcStairFlight": "BOTTOM",
    "IfcRailing": "BOTTOM", "IfcAlarm": "TOP",
    "IfcCourse": "BOTTOM", "IfcSurfaceFeature": "TOP",
    "IfcEarthworksFill": "BOTTOM", "IfcGeographicElement": "BOTTOM",
    "IfcSign": "BOTTOM", "IfcTrackElement": "BOTTOM",
    "IfcRail": "BOTTOM", "IfcFooting": "BOTTOM",
    "IfcElementAssembly": "BOTTOM", "IfcChimney": "BOTTOM",
}


def detect_orientation(vertices, ifc_class):
    """Detect orientation from geometry shape."""
    x_span = vertices[:, 0].max() - vertices[:, 0].min()
    y_span = vertices[:, 1].max() - vertices[:, 1].min()
    z_span = vertices[:, 2].max() - vertices[:, 2].min()
    if ifc_class == "IfcColumn":
        return "VERTICAL"
    if ifc_class == "IfcBeam":
        return "HORIZONTAL"
    if z_span > max(x_span, y_span) * 1.5:
        return "VERTICAL"
    if z_span < min(x_span, y_span) * 0.5:
        return "HORIZONTAL"
    return "MIXED"


# ---------------------------------------------------------------------------
# Source: IFC file (tessellate via ifcopenshell)
# ---------------------------------------------------------------------------

def extract_from_ifc_to_reference(ifc_path, conn, classes, exclude, guid_prefix=None):
    """Tessellate IFC → reference schema."""
    import ifcopenshell
    import ifcopenshell.geom

    ifc_file = ifcopenshell.open(ifc_path)

    # Spatial structure — buildings and infrastructure (IFC4X3)
    # See docs/InfrastructureAnalysis.md §4.1 for the hierarchy mapping.
    print("  Extracting spatial structure...")

    # ── Buildings (IFC2x3/IFC4/IFC4X3) ──
    for b in ifc_file.by_type("IfcBuilding"):
        conn.execute(
            "INSERT OR IGNORE INTO spatial_structure (guid, type, name) VALUES (?, 'IfcBuilding', ?)",
            (b.GlobalId, b.Name))
    buildings = ifc_file.by_type("IfcBuilding")
    for s in ifc_file.by_type("IfcBuildingStorey"):
        parent = buildings[0].GlobalId if buildings else None
        # §STOREY_DATUM (2026-08-27) — IfcBuildingStorey.Elevation is THE level datum, and until now
        # it was never extracted. viewer/schedule_gate.js deriveStoreyMergeMap() reads
        # spatial_structure.elevation and has therefore NEVER RUN on any shipped building (measured
        # 2026-08-27: 0 of 4 DBs carry the column). Its failure prints as §S18_STOREY_MERGE_FAIL
        # "no elevation data, bands unmerged", whose wording implies older DBs simply predate a
        # fixed extractor -- there was no fixed extractor, the column was never written. Consequence
        # measured on Terminal: 6 declared storeys, 22 scheduled bands, and "06 ROOF LEVEL" -- named
        # by 10 elements -- collecting 10,950. Elevation is read verbatim off the IFC; a storey that
        # declares none stores NULL (absent is reported as absent, never inferred here).
        _elev = getattr(s, "Elevation", None)
        try:
            _elev = float(_elev) if _elev is not None else None
        except (TypeError, ValueError):
            _elev = None
        conn.execute(
            "INSERT OR IGNORE INTO spatial_structure (guid, type, name, parent_guid, elevation) "
            "VALUES (?, 'IfcBuildingStorey', ?, ?, ?)", (s.GlobalId, s.Name, parent, _elev))

    # ── Infrastructure facilities (IFC4X3): IfcRoad, IfcBridge, IfcRailway ──
    FACILITY_TYPES = ["IfcRoad", "IfcBridge", "IfcRailway"]
    for ftype in FACILITY_TYPES:
        try:
            for fac in ifc_file.by_type(ftype):
                predef = getattr(fac, "PredefinedType", None)
                conn.execute(
                    "INSERT OR IGNORE INTO spatial_structure "
                    "(guid, type, name, parent_guid, predefined_type) "
                    "VALUES (?, ?, ?, NULL, ?)",
                    (fac.GlobalId, ftype, fac.Name, predef))
                # Extract facility parts (segments) as children
                try:
                    for rel in fac.IsDecomposedBy:
                        for part in rel.RelatedObjects:
                            if part.is_a("IfcFacilityPart"):
                                part_predef = getattr(part, "PredefinedType", None)
                                conn.execute(
                                    "INSERT OR IGNORE INTO spatial_structure "
                                    "(guid, type, name, parent_guid, predefined_type) "
                                    "VALUES (?, ?, ?, ?, ?)",
                                    (part.GlobalId, part.is_a(), part.Name,
                                     fac.GlobalId, part_predef))
                except (AttributeError, TypeError):
                    pass
        except RuntimeError:
            pass  # IFC4X3 types not in this file's schema

    # ── Spaces (rooms / functional zones) ──
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
        conn.execute(
            "INSERT OR IGNORE INTO spatial_structure "
            "(guid, type, name, parent_guid, object_type, predefined_type) "
            "VALUES (?, 'IfcSpace', ?, ?, ?, ?)",
            (sp.GlobalId, sp.Name or sp.LongName, parent_guid, obj_type, predef))
    conn.commit()

    # Elements
    settings = ifcopenshell.geom.settings()
    settings.set(settings.USE_WORLD_COORDS, True)
    settings.set(settings.WELD_VERTICES, True)

    existing = {r[0] for r in conn.execute("SELECT geometry_hash FROM base_geometries")}
    next_id = (conn.execute("SELECT COALESCE(MAX(id),0) FROM elements_meta").fetchone()[0]) + 1
    imported = failed = 0

    active_classes = [c for c in classes if c not in exclude]
    for cls in active_classes:
        try:
            elements = ifc_file.by_type(cls)
        except RuntimeError:
            continue
        for elem in elements:
            try:
                shape = ifcopenshell.geom.create_shape(settings, elem)
                geo = shape.geometry
                verts = np.array(geo.verts, dtype=np.float64).reshape(-1, 3)
                faces = np.array(geo.faces, dtype=np.int32).reshape(-1, 3)
                if len(verts) < 3 or len(faces) < 1:
                    raise ValueError("degenerate")

                minXYZ = verts.min(axis=0)
                maxXYZ = verts.max(axis=0)
                center = (minXYZ + maxXYZ) / 2.0
                v_centered = (verts - center).astype(np.float32)
                vblob = v_centered.tobytes()
                fblob = faces.astype(np.int32).tobytes()
                ghash = geometry_hash(vblob, fblob)

                if ghash not in existing:
                    conn.execute(
                        "INSERT OR IGNORE INTO base_geometries "
                        "(geometry_hash, vertices, faces, vertex_count, face_count) "
                        "VALUES (?,?,?,?,?)", (ghash, vblob, fblob, len(v_centered), len(faces)))
                    existing.add(ghash)

                eid = next_id; next_id += 1
                guid = f"{guid_prefix}_{elem.GlobalId}" if guid_prefix else elem.GlobalId
                name = getattr(elem, "Name", None)
                storey = get_storey_for_element(elem)
                discipline = infer_discipline(cls, name)  # §FLOWTERM-REFINE: name disambiguates IfcFlowTerminal
                elem_type = None
                try:
                    for rel in elem.IsDefinedBy:
                        if rel.is_a("IfcRelDefinesByType"):
                            elem_type = rel.RelatingType.Name; break
                except (AttributeError, TypeError):
                    pass
                mat_name = get_material_name(elem)
                mat_rgba = get_material_rgba(elem)

                conn.execute(
                    "INSERT OR IGNORE INTO elements_meta "
                    "(id,guid,discipline,ifc_class,element_name,element_type,storey,material_name,material_rgba) "
                    "VALUES (?,?,?,?,?,?,?,?,?)",
                    (eid, guid, discipline, cls, name, elem_type, storey, mat_name, mat_rgba))
                conn.execute(
                    "INSERT OR IGNORE INTO elements_rtree (id,minX,maxX,minY,maxY,minZ,maxZ) "
                    "VALUES (?,?,?,?,?,?,?)",
                    (eid, float(minXYZ[0]), float(maxXYZ[0]), float(minXYZ[1]), float(maxXYZ[1]),
                     float(minXYZ[2]), float(maxXYZ[2])))
                conn.execute("INSERT OR IGNORE INTO element_instances (guid,geometry_hash) VALUES (?,?)", (guid, ghash))
                conn.execute(
                    "INSERT OR IGNORE INTO element_transforms (guid,center_x,center_y,center_z,transform_source) "
                    "VALUES (?,?,?,?,'ifc_extract')", (guid, float(center[0]), float(center[1]), float(center[2])))
                space = get_space_for_element(elem)
                if space:
                    conn.execute("INSERT OR IGNORE INTO rel_contained_in_space VALUES (?,?)", (guid, space.GlobalId))
                imported += 1
            except Exception:
                failed += 1
    conn.commit()

    # Helper: apply guid_prefix if set
    def _guid(raw): return f"{guid_prefix}_{raw}" if guid_prefix else raw

    # R21: Extract IfcRelVoidsElement + IfcRelFillsElement chain
    # Maps doors/windows to their host walls via intermediate IfcOpeningElement.
    # Chain: Wall ←(IfcRelVoidsElement)← OpeningElement ←(IfcRelFillsElement)← Door/Window
    fills_count = 0
    try:
        # Step 1: OpeningElement → host wall (IfcRelVoidsElement)
        opening_to_host = {}
        for rel in ifc_file.by_type("IfcRelVoidsElement"):
            try:
                host = rel.RelatingBuildingElement
                opening = rel.RelatedOpeningElement
                if host and opening:
                    opening_to_host[opening.GlobalId] = _guid(host.GlobalId)
            except (AttributeError, TypeError):
                pass

        # Step 2: Door/Window → OpeningElement (IfcRelFillsElement)
        for rel in ifc_file.by_type("IfcRelFillsElement"):
            try:
                opening = rel.RelatingOpeningElement
                filling = rel.RelatedBuildingElement
                if opening and filling and opening.GlobalId in opening_to_host:
                    host_guid = opening_to_host[opening.GlobalId]
                    conn.execute(
                        "INSERT OR IGNORE INTO rel_fills_host (element_guid, host_guid) "
                        "VALUES (?, ?)", (_guid(filling.GlobalId), host_guid))
                    fills_count += 1
            except (AttributeError, TypeError):
                pass

        conn.commit()
        if fills_count > 0:
            print(f"    R21: {fills_count} door/window→host mappings from IfcRelVoidsElement chain")
    except RuntimeError:
        pass  # IFC schema may not have these types

    # R22: Extract IfcRelAggregates — parent-child decomposition
    # Maps assembly parents (curtain wall, stair, etc.) to their child elements.
    agg_count = 0
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
                        "VALUES (?, ?)", (_guid(parent.GlobalId), _guid(child.GlobalId)))
                    agg_count += 1
            except (AttributeError, TypeError):
                pass
        conn.commit()
        if agg_count > 0:
            print(f"    R22: {agg_count} parent→child decomposition mappings from IfcRelAggregates")
    except RuntimeError:
        pass  # IFC schema may not have these types

    print(f"    Imported: {imported}, Failed: {failed}")
    return imported


def extract_from_ifc_to_library(ifc_path, lib_conn, classes, exclude):
    """Tessellate IFC → library schema."""
    import ifcopenshell
    import ifcopenshell.geom

    ifc_file = ifcopenshell.open(ifc_path)
    settings = ifcopenshell.geom.settings()
    settings.set(settings.USE_WORLD_COORDS, False)  # local coords for library
    settings.set(settings.WELD_VERTICES, True)

    active_classes = [c for c in classes if c not in exclude]
    imported = 0

    for cls in active_classes:
        category = CATEGORY_MAP.get(cls, cls.replace("Ifc", "").upper())
        discipline = infer_discipline(cls)
        lib_conn.execute(
            "INSERT OR IGNORE INTO component_types (ifc_class, category, discipline) VALUES (?,?,?)",
            (cls, category, discipline))
        type_id = lib_conn.execute(
            "SELECT id FROM component_types WHERE ifc_class=? AND category=?", (cls, category)).fetchone()[0]

        try:
            elements = ifc_file.by_type(cls)
        except RuntimeError:
            continue
        for elem in elements:
            try:
                shape = ifcopenshell.geom.create_shape(settings, elem)
                geo = shape.geometry
                verts = np.array(geo.verts, dtype=np.float64).reshape(-1, 3)
                faces = np.array(geo.faces, dtype=np.int32).reshape(-1, 3)
                if len(verts) < 3 or len(faces) < 1:
                    continue
                center = (verts.min(axis=0) + verts.max(axis=0)) / 2.0
                v_centered = (verts - center).astype(np.float32)
                vblob = v_centered.tobytes()
                fblob = faces.astype(np.int32).tobytes()
                ghash = geometry_hash(vblob, fblob)

                local_min = v_centered.min(axis=0)
                local_max = v_centered.max(axis=0)
                name = getattr(elem, "Name", None) or f"{cls}_{ghash[:8]}"
                if ':' in name:
                    name = name.split(':')[0]
                attachment = ATTACHMENT_MAP.get(cls, "CENTER")
                orientation = detect_orientation(v_centered, cls)

                lib_conn.execute(
                    "INSERT OR IGNORE INTO component_geometries "
                    "(geometry_hash, vertices, faces, normals, vertex_count, face_count) "
                    "VALUES (?,?,?,NULL,?,?)", (ghash, vblob, fblob, len(v_centered), len(faces)))
                lib_conn.execute(
                    "INSERT OR IGNORE INTO component_definitions "
                    "(type_id, name, geometry_hash, "
                    "local_min_x, local_max_x, local_min_y, local_max_y, local_min_z, local_max_z, "
                    "attachment_face, orientation, vertex_count, face_count, instance_count) "
                    "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1)",
                    (type_id, name, ghash,
                     float(local_min[0]), float(local_max[0]),
                     float(local_min[1]), float(local_max[1]),
                     float(local_min[2]), float(local_max[2]),
                     attachment, orientation, len(v_centered), len(faces)))
                imported += 1
            except Exception:
                continue
    lib_conn.commit()
    print(f"    Imported: {imported} unique components")
    return imported


# ---------------------------------------------------------------------------
# Source: pre-tessellated DB (federation or any extracted DB)
# ---------------------------------------------------------------------------

def extract_from_db_to_reference(src_path, conn, classes, exclude, disciplines):
    """Copy filtered elements from pre-tessellated DB → reference schema."""
    src = sqlite3.connect(src_path)

    # Build class filter
    active_classes = [c for c in classes if c not in exclude]
    placeholders = ",".join("?" * len(active_classes))

    # Build discipline filter
    disc_filter = ""
    disc_params = []
    if disciplines:
        disc_placeholders = ",".join("?" * len(disciplines))
        disc_filter = f" AND em.discipline IN ({disc_placeholders})"
        disc_params = list(disciplines)

    # Copy spatial structure — handle both reference schema (type/name/parent_guid)
    # and federation schema (building/storey/space per element guid)
    print("  Copying spatial structure...")
    src_cols = [r[1] for r in src.execute("PRAGMA table_info(spatial_structure)")]
    storey_map = {}

    if "type" in src_cols:
        # Reference-style: hierarchical (type, name, parent_guid)
        try:
            # §STOREY_DATUM — carry `elevation` through the split when the source has it; the
            # fallbacks below drop to progressively older schemas, so an older source still copies.
            try:
                for row in src.execute("SELECT guid, type, name, parent_guid, object_type, predefined_type, elevation FROM spatial_structure"):
                    conn.execute(
                        "INSERT OR IGNORE INTO spatial_structure (guid, type, name, parent_guid, object_type, predefined_type, elevation) "
                        "VALUES (?,?,?,?,?,?,?)", row)
            except sqlite3.OperationalError:
                for row in src.execute("SELECT guid, type, name, parent_guid, object_type, predefined_type FROM spatial_structure"):
                    conn.execute(
                        "INSERT OR IGNORE INTO spatial_structure (guid, type, name, parent_guid, object_type, predefined_type) "
                        "VALUES (?,?,?,?,?,?)", row)
        except sqlite3.OperationalError:
            for row in src.execute("SELECT guid, type, name, parent_guid FROM spatial_structure"):
                conn.execute(
                    "INSERT OR IGNORE INTO spatial_structure (guid, type, name, parent_guid) "
                    "VALUES (?,?,?,?)", row)
        # Build storey map from hierarchy
        try:
            for guid, storey in src.execute(
                    "SELECT ss_elem.guid, ss_storey.name "
                    "FROM spatial_structure ss_elem "
                    "JOIN spatial_structure ss_storey ON ss_elem.parent_guid = ss_storey.guid "
                    "WHERE ss_storey.type = 'IfcBuildingStorey'"):
                storey_map[guid] = storey
        except sqlite3.OperationalError:
            pass
    elif "storey" in src_cols:
        # Federation-style: flat (guid → building, storey, space)
        # Reconstruct hierarchy: unique buildings + storeys → spatial_structure
        buildings = set()
        storeys = set()
        for row in src.execute("SELECT DISTINCT building FROM spatial_structure WHERE building IS NOT NULL"):
            buildings.add(row[0])
        for row in src.execute("SELECT DISTINCT storey FROM spatial_structure WHERE storey IS NOT NULL AND storey != ''"):
            storeys.add(normalize_storey(row[0]))  # fold Revit reference planes into base level
        bld_guid = "BUILDING_0"
        for b in buildings:
            conn.execute(
                "INSERT OR IGNORE INTO spatial_structure (guid, type, name) VALUES (?, 'IfcBuilding', ?)",
                (bld_guid, b))
        for s in sorted(storeys):
            s_guid = f"STOREY_{s.replace(' ', '_')}"
            conn.execute(
                "INSERT OR IGNORE INTO spatial_structure (guid, type, name, parent_guid) "
                "VALUES (?, 'IfcBuildingStorey', ?, ?)", (s_guid, s, bld_guid))
        # Build storey map from flat table
        for guid, storey in src.execute("SELECT guid, storey FROM spatial_structure WHERE storey IS NOT NULL AND storey != ''"):
            storey_map[guid] = normalize_storey(storey)
    conn.commit()

    # Copy elements with filters
    print("  Copying elements...")
    query = f"""
        SELECT em.id, em.guid, em.discipline, em.ifc_class,
               em.element_name, em.element_type, em.storey
        FROM elements_meta em
        WHERE em.ifc_class IN ({placeholders})
        {disc_filter}
        ORDER BY em.id
    """
    params = active_classes + disc_params

    existing_geo = set()
    next_id = 1
    imported = 0

    for _, guid, discipline, ifc_class, name, elem_type, storey in src.execute(query, params):
        # Get bounding box
        bbox = src.execute(
            "SELECT minX, maxX, minY, maxY, minZ, maxZ FROM elements_rtree WHERE id=?", (_,)).fetchone()
        if not bbox:
            continue

        # Get geometry hash
        gi = src.execute("SELECT geometry_hash FROM element_instances WHERE guid=?", (guid,)).fetchone()
        ghash = gi[0] if gi else None

        # Resolve storey from spatial_structure if NULL
        if not storey or storey == "":
            storey = storey_map.get(guid)
        storey = normalize_storey(storey)  # fold Revit reference planes (Ceiling/TOS) into base level

        eid = next_id; next_id += 1
        conn.execute(
            "INSERT OR IGNORE INTO elements_meta (id,guid,discipline,ifc_class,element_name,element_type,storey) "
            "VALUES (?,?,?,?,?,?,?)", (eid, guid, discipline, ifc_class, name, elem_type, storey))
        conn.execute(
            "INSERT OR IGNORE INTO elements_rtree (id,minX,maxX,minY,maxY,minZ,maxZ) "
            "VALUES (?,?,?,?,?,?,?)", (eid,) + bbox)

        if ghash:
            conn.execute("INSERT OR IGNORE INTO element_instances (guid,geometry_hash) VALUES (?,?)", (guid, ghash))
            if ghash not in existing_geo:
                geo = src.execute(
                    "SELECT vertices, faces, vertex_count, face_count FROM base_geometries WHERE geometry_hash=?",
                    (ghash,)).fetchone()
                if geo:
                    conn.execute(
                        "INSERT OR IGNORE INTO base_geometries (geometry_hash, vertices, faces, vertex_count, face_count) "
                        "VALUES (?,?,?,?,?)", (ghash,) + geo)
                existing_geo.add(ghash)

        # Transforms
        tx = src.execute(
            "SELECT center_x, center_y, center_z FROM element_transforms WHERE guid=?", (guid,)).fetchone()
        if tx:
            conn.execute(
                "INSERT OR IGNORE INTO element_transforms (guid,center_x,center_y,center_z,transform_source) "
                "VALUES (?,?,?,?,'db_copy')", (guid,) + tx)

        imported += 1

    conn.commit()

    # R21: Copy rel_fills_host if source DB has it
    fills_count = 0
    try:
        src2 = sqlite3.connect(src_path)
        src2.execute("SELECT 1 FROM rel_fills_host LIMIT 1")
        for row in src2.execute("SELECT element_guid, host_guid FROM rel_fills_host"):
            conn.execute(
                "INSERT OR IGNORE INTO rel_fills_host (element_guid, host_guid) VALUES (?, ?)", row)
            fills_count += 1
        conn.commit()
        src2.close()
        if fills_count > 0:
            print(f"    R21: Copied {fills_count} door/window→host mappings")
    except sqlite3.OperationalError:
        pass  # source DB doesn't have the table yet

    # R22: Copy rel_aggregates if source DB has it
    agg_count = 0
    try:
        src3 = sqlite3.connect(src_path)
        src3.execute("SELECT 1 FROM rel_aggregates LIMIT 1")
        for row in src3.execute("SELECT parent_guid, child_guid FROM rel_aggregates"):
            conn.execute(
                "INSERT OR IGNORE INTO rel_aggregates (parent_guid, child_guid) VALUES (?, ?)", row)
            agg_count += 1
        conn.commit()
        src3.close()
        if agg_count > 0:
            print(f"    R22: Copied {agg_count} parent→child decomposition mappings")
    except sqlite3.OperationalError:
        pass  # source DB doesn't have the table yet

    print(f"    Imported: {imported} elements, {len(existing_geo)} unique geometries")
    return imported


def extract_from_db_to_library(src_path, lib_conn, classes, exclude, disciplines):
    """Copy filtered components from pre-tessellated DB → library schema."""
    src = sqlite3.connect(src_path)

    active_classes = [c for c in classes if c not in exclude]
    placeholders = ",".join("?" * len(active_classes))

    disc_filter = ""
    disc_params = []
    if disciplines:
        disc_placeholders = ",".join("?" * len(disciplines))
        disc_filter = f" AND em.discipline IN ({disc_placeholders})"
        disc_params = list(disciplines)

    query = f"""
        SELECT ei.geometry_hash, COUNT(*) as instance_count,
               MIN(em.element_type) as element_type,
               MIN(em.discipline) as discipline,
               MIN(em.element_name) as element_name,
               MIN(em.ifc_class) as ifc_class
        FROM elements_meta em
        JOIN element_instances ei ON em.guid = ei.guid
        WHERE em.ifc_class IN ({placeholders})
        {disc_filter}
        GROUP BY ei.geometry_hash
        ORDER BY instance_count DESC
    """
    params = active_classes + disc_params

    imported = 0
    for ghash, inst_count, elem_type, discipline, elem_name, ifc_class in src.execute(query, params):
        category = CATEGORY_MAP.get(ifc_class, ifc_class.replace("Ifc", "").upper())
        disc = infer_discipline(ifc_class)
        lib_conn.execute(
            "INSERT OR IGNORE INTO component_types (ifc_class, category, discipline) VALUES (?,?,?)",
            (ifc_class, category, disc))
        type_id = lib_conn.execute(
            "SELECT id FROM component_types WHERE ifc_class=? AND category=?", (ifc_class, category)).fetchone()[0]

        geo = src.execute(
            "SELECT vertices, faces, vertex_count, face_count FROM base_geometries WHERE geometry_hash=?",
            (ghash,)).fetchone()
        if not geo:
            continue
        vblob, fblob, vc, fc = geo
        normals = src.execute(
            "SELECT normals FROM base_geometries WHERE geometry_hash=?", (ghash,)).fetchone()
        normals_blob = normals[0] if normals and normals[0] else None

        vertices = parse_vertices_blob(vblob)
        local_min = vertices.min(axis=0)
        local_max = vertices.max(axis=0)

        name = elem_type or elem_name or f"{ifc_class}_{ghash[:8]}"
        if ':' in name:
            name = name.split(':')[0]
        attachment = ATTACHMENT_MAP.get(ifc_class, "CENTER")
        orientation = detect_orientation(vertices, ifc_class)

        lib_conn.execute(
            "INSERT OR IGNORE INTO component_geometries "
            "(geometry_hash, vertices, faces, normals, vertex_count, face_count) "
            "VALUES (?,?,?,?,?,?)", (ghash, vblob, fblob, normals_blob, vc, fc))
        lib_conn.execute(
            "INSERT OR REPLACE INTO component_definitions "
            "(type_id, name, geometry_hash, "
            "local_min_x, local_max_x, local_min_y, local_max_y, local_min_z, local_max_z, "
            "attachment_face, orientation, vertex_count, face_count, instance_count) "
            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (type_id, name, ghash,
             float(local_min[0]), float(local_max[0]),
             float(local_min[1]), float(local_max[1]),
             float(local_min[2]), float(local_max[2]),
             attachment, orientation, vc, fc, inst_count))
        imported += 1

    lib_conn.commit()
    src.close()
    print(f"    Imported: {imported} unique components")
    return imported


# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

def print_summary(conn, target):
    """Print extraction summary."""
    if target == "reference":
        meta_count = conn.execute("SELECT COUNT(*) FROM elements_meta").fetchone()[0]
        geo_count = conn.execute("SELECT COUNT(*) FROM base_geometries").fetchone()[0]
        storey_count = conn.execute(
            "SELECT COUNT(*) FROM spatial_structure WHERE type='IfcBuildingStorey'").fetchone()[0]
        # Include infrastructure facility parts in segment count
        segment_count = conn.execute(
            "SELECT COUNT(*) FROM spatial_structure WHERE type LIKE 'Ifc%Part'").fetchone()[0]
        space_count = conn.execute(
            "SELECT COUNT(*) FROM spatial_structure WHERE type='IfcSpace'").fetchone()[0]
        print(f"\n  Elements:    {meta_count}")
        print(f"  Geometries:  {geo_count}")
        print(f"  Storeys:     {storey_count}")
        if segment_count > 0:
            print(f"  Segments:    {segment_count}  (infrastructure facility parts)")
        print(f"  Spaces:      {space_count}")
    else:
        comp_count = conn.execute("SELECT COUNT(*) FROM component_definitions").fetchone()[0]
        type_count = conn.execute("SELECT COUNT(*) FROM component_types").fetchone()[0]
        print(f"\n  Component defs: {comp_count}")
        print(f"  Type categories: {type_count}")

    print("\n  By IFC class:")
    table = "elements_meta" if target == "reference" else \
        "component_definitions cd JOIN component_types ct ON cd.type_id = ct.id"
    col = "ifc_class" if target == "reference" else "ct.ifc_class"
    for cls, cnt in conn.execute(
            f"SELECT {col}, COUNT(*) FROM {table} GROUP BY {col} ORDER BY COUNT(*) DESC"):
        print(f"    {cls:<35} {cnt:>6}")

    if target == "reference":
        # Discipline breakdown
        print("\n  By discipline:")
        for disc, cnt in conn.execute(
                "SELECT discipline, COUNT(*) FROM elements_meta GROUP BY discipline ORDER BY COUNT(*) DESC"):
            print(f"    {disc:<10} {cnt:>6}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Unified BIM extraction tool (Layer 1: LOD400 library, Layer 3: Rosetta reference)")
    parser.add_argument("source", help="Source .ifc file or .db file")
    parser.add_argument("--to", required=True, choices=["reference", "library"],
                        help="Target: 'reference' (Rosetta spatial) or 'library' (LOD400 component)")
    parser.add_argument("-o", "--output", help="Output path (required for --to reference)")
    parser.add_argument("--classes", help="Comma-separated IFC classes to include (default: all)")
    parser.add_argument("--exclude", default="", help="Comma-separated IFC classes to exclude")
    parser.add_argument("--discipline", help="Comma-separated disciplines to include (DB sources only)")
    parser.add_argument("--guid-prefix", metavar="DISC",
                        help="Prefix all GUIDs with DISC_ (use when merging multi-discipline IFCs)")
    parser.add_argument("--append", action="store_true",
                        help="Append to existing output DB instead of replacing it")
    args = parser.parse_args()

    source = args.source
    target = args.to
    is_ifc = source.lower().endswith(".ifc")
    is_db = source.lower().endswith(".db")

    if not is_ifc and not is_db:
        print("ERROR: source must be .ifc or .db file")
        sys.exit(1)
    if not os.path.exists(source):
        print(f"ERROR: {source} not found")
        sys.exit(1)

    # Parse filters
    classes = args.classes.split(",") if args.classes else REFERENCE_CLASSES
    exclude = set(args.exclude.split(",")) if args.exclude else set()
    disciplines = args.discipline.split(",") if args.discipline else None
    guid_prefix = args.guid_prefix
    append_mode = args.append

    # Resolve output path
    if target == "reference":
        if not args.output:
            print("ERROR: --to reference requires -o <output.db>")
            sys.exit(1)
        out_path = args.output
        os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
        if not append_mode and os.path.exists(out_path):
            os.remove(out_path)
        conn = sqlite3.connect(out_path)
        conn.executescript(REFERENCE_SCHEMA)
        conn.commit()
    else:
        out_path = args.output or "library/component_library.db"
        conn = sqlite3.connect(out_path)
        conn.executescript(LIBRARY_SCHEMA)
        conn.commit()

    # Banner
    src_name = os.path.basename(source)
    print(f"\n{'='*60}")
    print(f"  EXTRACT: {src_name}")
    print(f"  Target:  {target} → {out_path}")
    if exclude:
        print(f"  Exclude: {', '.join(exclude)}")
    if disciplines:
        print(f"  Disciplines: {', '.join(disciplines)}")
    if guid_prefix:
        print(f"  GUID prefix: {guid_prefix}_")
    if append_mode:
        print(f"  Mode:    APPEND (existing DB preserved)")
    print(f"{'='*60}")

    # Dispatch
    if is_ifc and target == "reference":
        extract_from_ifc_to_reference(source, conn, classes, exclude, guid_prefix)
    elif is_ifc and target == "library":
        extract_from_ifc_to_library(source, conn, classes, exclude)
    elif is_db and target == "reference":
        extract_from_db_to_reference(source, conn, classes, exclude, disciplines)
    elif is_db and target == "library":
        extract_from_db_to_library(source, conn, classes, exclude, disciplines)

    print_summary(conn, target)
    conn.close()

    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"\n  Written to: {out_path} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
