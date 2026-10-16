# BIM OOTB — Frictionless BIM. Two DBs. One browser. Zero install.
# Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
# SPDX-License-Identifier: MIT
#!/usr/bin/env python3
"""
drawing_writer_dxf.py — DXF output for 2D architectural drawings.

Reads the compiled BIM database (output.db) and writes professional DXF files
using ezdxf. Coordinates are in model-space mm (no PAPER_FACTOR scaling).

Spec: 2D_ARCHITECTURAL_LAYOUT.md §14
Witnesses: W-2D-ROUNDTRIP (partial — DXF exists for overlay diff)

Usage:
    python3 drawing_writer_dxf.py ../input/SH_extracted.db --all          # DXF + SVG proof
    python3 drawing_writer_dxf.py ../input/SH_extracted.db --floor-plan   # single view DXF
    python3 drawing_writer_dxf.py ../input/SH_extracted.db --floor-plan --proof  # single + SVG

Output:
    DXF → output/DXF/{PREFIX}_{VIEW}_{ts}.dxf   (open in FreeCAD, QCAD, AutoCAD, LibreCAD)
    SVG → output/SVG/{PREFIX}_{VIEW}_{ts}.svg    (proof render for visual QA)
    Log → output/DXF/log_{PREFIX}_{VIEW}_{ts}.txt (per-view diagnostic log)
"""

import sys
import os
import math
import sqlite3
import argparse
import datetime
from typing import List, Tuple, Optional

import ezdxf
from ezdxf.enums import TextEntityAlignment

# Add parent dir so we can import section_cut and drawing_writer helpers
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from section_cut import section_cut as run_section_cut, parse_vertices_blob, parse_faces_blob
from collections import namedtuple
from drawing_writer import (
    read_elements, derive_grids, snap_grids, detect_levels, _convex_hull_2d,
    roof_silhouette, generate_dimensions, format_dim,
    DimString, GridLine, SNAP_MODULE,
    DIM_OFFSET_1, DIM_OFFSET_2,
    infer_rooms, find_host_wall, _get_room_side_ew, _get_room_side_ns,
    read_drawing_metadata,
    DrawingInventionError,
)

# §15.2 Grid dimension triage
GridBay = namedtuple('GridBay', ['label1', 'label2', 'dist_m', 'paper_mm', 'tier'])

# ─────────────────────────────────────────────────────────────────
# CONSTANTS — only unit conversions and DB-sourced elevations here.
# All formatting (line weights, text heights, colors, styles) comes
# from drawing_template.json at runtime per spec §1 R4.
# ─────────────────────────────────────────────────────────────────

SCALE       = 100     # 1:100 drawing scale
MM          = 1000.0  # world metres × MM → model-space mm

# Level markers — DB-sourced reference elevations (metres)
APRON_Z = -0.100    # concrete apron
GRD_Z   = -0.250    # natural ground

# ─────────────────────────────────────────────────────────────────
# §23 P0a: Hatch patterns extracted from Bonsai bim/data/assets/patterns.svg
# Only line-based patterns are convertible; concrete/wood use complex SVG
# paths (Bezier curves) — those fall back to solid fill.
# ─────────────────────────────────────────────────────────────────
_BONSAI_HATCH_PATTERNS = {
    # Bonsai id="brick" (rotate 45°, 3×3 cell, 2 vertical lines at x=1,x=2)
    # ezdxf format: [angle, (base_x,base_y), (delta_x,delta_y), [dash_items]]
    'BRICK': [
        [45.0, (0.0, 0.0), (0.0, 3.0), []],   # line family 1: 45°, 3-unit spacing
        [45.0, (0.0, 1.0), (0.0, 3.0), []],   # line family 2: offset 1 unit
    ],
    # Bonsai id="earth" (6×6 cell, H+V lines in quadrant pattern → cross-hatch)
    'EARTH': [
        [0.0,  (0.0, 0.0), (0.0, 2.0), []],    # horizontal lines, 2-unit spacing
        [90.0, (0.0, 0.0), (0.0, 2.0), []],    # vertical lines, 2-unit spacing
    ],
}

# elements_meta.material_name keyword → hatch pattern name
# Lowercase first token before comma is matched.
_MATERIAL_TO_PATTERN = {
    'brick': 'BRICK',
    'earth': 'EARTH',
    # concrete, wood, insulation: Bonsai SVG paths not convertible → solid fill
}

# §23 P0c: Bonsai annotation types (from bim/module/drawing/decoration.py objecttype)
# mapped to our §21 ann_type classification.
_BONSAI_ANN_TYPE_MAP = {
    'DIMENSION':      'DIM',
    'ANGLE':          'DIM',
    'RADIUS':         'DIM',
    'DIAMETER':       'DIM',
    'TEXT':           'TEXT',
    'TEXT_LEADER':    'TEXT',
    'PLAN_LEVEL':     'TEXT',
    'SECTION_LEVEL':  'TEXT',
    'GRID':           'GRID',
    'FILL_AREA':      'HATCH',
    'BATTING':        'HATCH',
    'STAIR_ARROW':    'OTHER',
    'BREAKLINE':      'OTHER',
    'SYMBOL':         'OTHER',
    'FALL':           'OTHER',
    'REVISION_CLOUD': 'OTHER',
    'HIDDEN_LINE':    'OTHER',
    'ELEVATION':      'OTHER',
    'SECTION':        'OTHER',
    'MISC':           'OTHER',
    'NOTDEFINED':     'OTHER',
}


def _hex_to_aci(hex_color: str) -> int:
    """Map template hex color to nearest DXF ACI (AutoCAD Color Index).
    Spec §8: all colors from template colors.*"""
    _MAP = {
        '#000000': 7,    # black (ACI 7 = black on dark bg, white on light)
        '#4488CC': 5,    # blue/cyan → ACI 5
        '#AAAAAA': 9,    # grey → ACI 9
        '#888888': 8,    # grey → ACI 8
        '#CCCCCC': 254,  # light grey → ACI 254
        '#F0F0F0': 254,  # very light grey
        '#FFFFFF': 7,    # white
    }
    return _MAP.get(hex_color, 7)


def _linestyle_to_dxf(style_name: str) -> str:
    """Map template line_styles name to DXF linetype name.
    Spec §4.3: grid line style from template grid.line_style."""
    _MAP = {
        'solid':    'CONTINUOUS',
        'dashed':   'HIDDEN',
        'dash_dot': 'DASHDOT',
        'dotted':   'DOT',
        'center':   'CENTER',
    }
    return _MAP.get(style_name, 'CONTINUOUS')


def _build_layers(tpl: dict) -> list:
    """Build AIA layer table from template colors and line styles.
    Spec §1 R4 + §8: layer colors from template, not hardcoded."""
    colors = tpl.get('colors', {})
    ls = tpl.get('line_styles', {})
    grid_style = _linestyle_to_dxf(ls.get('grid_line', 'dash_dot'))
    return [
        ('A-WALL-FULL', _hex_to_aci(colors.get('wall', '#000000')),       'CONTINUOUS'),
        ('A-WALL-PRTN', _hex_to_aci(colors.get('wall', '#000000')),       'CONTINUOUS'),
        ('A-WALL-PATT', _hex_to_aci(colors.get('column_fill', '#CCCCCC')),'CONTINUOUS'),
        ('A-GLAZ',      _hex_to_aci(colors.get('glass', '#4488CC')),      'CONTINUOUS'),
        ('A-DOOR',      _hex_to_aci(colors.get('wall', '#000000')),       'CONTINUOUS'),
        ('A-ROOF',      _hex_to_aci(colors.get('wall', '#000000')),       'CONTINUOUS'),
        ('A-GRID',      _hex_to_aci(colors.get('grid', '#888888')),       grid_style),
        ('A-ANNO-DIMS', _hex_to_aci(colors.get('dimension', '#000000')),  'CONTINUOUS'),
        ('A-ANNO-TEXT',  _hex_to_aci(colors.get('label', '#000000')),     'CONTINUOUS'),
        ('A-FURN',      _hex_to_aci(colors.get('furniture', '#AAAAAA')),  'CONTINUOUS'),
        ('A-ELEV-WALL', _hex_to_aci(colors.get('wall', '#000000')),      'CONTINUOUS'),
        ('A-ELEV-LEVL', _hex_to_aci(colors.get('dimension', '#000000')), 'CONTINUOUS'),
        ('A-TTLB',      _hex_to_aci(colors.get('wall', '#000000')),      'CONTINUOUS'),
        ('A-ANNO-LEVL', _hex_to_aci(colors.get('dimension', '#000000')), 'CONTINUOUS'),
        ('A-ANNO-SECT', _hex_to_aci(colors.get('dimension', '#000000')), 'HIDDEN'),
    ]


def _inward_offset_hull(hull, thickness_m):
    """§1 R8: Shared cross-section thickness — inward-offset a convex hull.
    Used by wall section-cut (floor plan) and roof slab (roof plan).

    hull: list of (x, y) CCW-ordered convex hull points (world metres).
    thickness_m: inward offset distance in metres.
    Returns: list of (x, y) points forming the inner boundary, or [] if
    the offset collapses (thickness ≥ half the smallest dimension).
    """
    import math as _m
    n = len(hull)
    if n < 3 or thickness_m <= 0:
        return list(hull)

    # Compute inward-offset edges (each edge shifted inward by thickness)
    edges = []  # list of (px, py, nx, ny) — point on offset line + normal
    for i in range(n):
        x0, y0 = hull[i]
        x1, y1 = hull[(i + 1) % n]
        dx, dy = x1 - x0, y1 - y0
        length = _m.hypot(dx, dy)
        if length < 1e-9:
            continue
        # Inward normal for CCW hull: rotate edge 90° clockwise
        nx, ny = dy / length, -dx / length
        # Offset point
        edges.append((x0 + nx * thickness_m, y0 + ny * thickness_m,
                       x1 + nx * thickness_m, y1 + ny * thickness_m))

    if len(edges) < 3:
        return []

    # Intersect consecutive offset edges to get inner hull vertices
    inner = []
    for i in range(len(edges)):
        ax0, ay0, ax1, ay1 = edges[i]
        bx0, by0, bx1, by1 = edges[(i + 1) % len(edges)]
        # Line-line intersection
        dax, day = ax1 - ax0, ay1 - ay0
        dbx, dby = bx1 - bx0, by1 - by0
        denom = dax * dby - day * dbx
        if abs(denom) < 1e-12:
            continue  # parallel edges — skip
        t = ((bx0 - ax0) * dby - (by0 - ay0) * dbx) / denom
        ix = ax0 + t * dax
        iy = ay0 + t * day
        inner.append((ix, iy))

    return inner if len(inner) >= 3 else []


def _hexagon_pts(cx: float, cy: float, r: float) -> list:
    """Return 6 vertices of a flat-top hexagon centered at (cx, cy) with radius r.
    Spec §7.3: annotation_tags.shape = 'hexagon'. Matches archive SVG hexagons."""
    pts = []
    for i in range(6):
        angle = math.radians(60 * i + 30)  # flat-top: offset by 30°
        pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    return pts


def _draw_tag_shape(msp, shape: str, cx: float, cy: float, r: float,
                    layer: str, lw: int):
    """§7.3g / §23 P0b: Draw tag shape using Bonsai symbol BLOCKs.
    Falls back to procedural drawing if block not found."""
    # §23 P0b: map shape name to Bonsai-extracted BLOCK name
    _SHAPE_TO_BLOCK = {
        'circle': 'DOOR_TAG',
        'hexagon': 'WINDOW_TAG',
    }
    block_name = _SHAPE_TO_BLOCK.get(shape)
    doc = msp.doc if hasattr(msp, 'doc') else None
    if block_name and doc and block_name in doc.blocks:
        msp.add_blockref(block_name, insert=(cx, cy),
                         dxfattribs={'layer': layer, 'xscale': r, 'yscale': r})
        _log(f"  §RENDER TAG block={block_name} at ({cx:.1f},{cy:.1f})")
        return
    # Procedural fallback
    if shape == 'circle':
        msp.add_circle((cx, cy), r, dxfattribs={'layer': layer, 'lineweight': lw})
    elif shape == 'diamond':
        pts = [(cx, cy + r), (cx + r, cy), (cx, cy - r), (cx - r, cy)]
        msp.add_lwpolyline(pts, close=True, dxfattribs={'layer': layer, 'lineweight': lw})
    else:  # hexagon (default)
        pts = _hexagon_pts(cx, cy, r)
        msp.add_lwpolyline(pts, close=True, dxfattribs={'layer': layer, 'lineweight': lw})


def _triage_grid_dims(grids: list, scale: int, crowding_threshold_mm: float = 15.0):
    """§15.2: Classify each bay dimension as INLINE or PANEL.

    Returns:
        inline_dims: list of GridBay — show dim text in drawing
        panel_dims:  list of GridBay — suppress inline text, list in panel only
    """
    inline_dims = []
    panel_dims = []
    for axis in ('x', 'y'):
        axis_grids = sorted([g for g in grids if g.axis == axis],
                            key=lambda g: g.position)
        for i in range(len(axis_grids) - 1):
            g1 = axis_grids[i]
            g2 = axis_grids[i + 1]
            dist_m = g2.position - g1.position
            paper_mm = dist_m * 1000 / scale
            bay = GridBay(g1.label, g2.label, dist_m, paper_mm, tier=2)
            if paper_mm >= crowding_threshold_mm:
                inline_dims.append(bay)
                _log(f"§TRIAGE {axis.upper()}: {g1.label}-{g2.label} = "
                     f"{int(dist_m*1000)}mm ({paper_mm:.1f}mm@1:{scale}) → INLINE")
            else:
                panel_dims.append(bay)
                _log(f"§TRIAGE {axis.upper()}: {g1.label}-{g2.label} = "
                     f"{int(dist_m*1000)}mm ({paper_mm:.1f}mm@1:{scale}) → PANEL")
        # Overall tier-1 is always INLINE (forced)
        if len(axis_grids) >= 2:
            g_first = axis_grids[0]
            g_last = axis_grids[-1]
            total_m = g_last.position - g_first.position
            total_mm = total_m * 1000 / scale
            _log(f"§TRIAGE {axis.upper()}: OVERALL = {int(total_m*1000)}mm "
                 f"({total_mm:.1f}mm@1:{scale}) → INLINE (forced)")
    n_panel = len(panel_dims)
    if n_panel > 0:
        labels = ', '.join(f'{b.label1}-{b.label2}' for b in panel_dims)
        _log(f"§TRIAGE PANEL: {n_panel} bay(s) listed ({labels})")
    else:
        _log("§TRIAGE PANEL: 0 bays — all dims shown in drawing")
    return inline_dims, panel_dims


def _add_bubble_hatch(msp, cx: float, cy: float, r: float):
    """§4.5c: Solid white hatch behind grid bubble circle so label is readable.
    Drawn BEFORE the circle outline so the outline renders on top.
    Uses 36-point polyline approximation of the circle boundary."""
    hatch = msp.add_hatch(color=7)          # ACI 7 = white
    hatch.dxf.layer = 'A-GRID'
    hatch.set_solid_fill(color=7)
    pts = [(cx + r * math.cos(i * math.pi / 18),
            cy + r * math.sin(i * math.pi / 18))
           for i in range(36)]
    hatch.paths.add_polyline_path(pts, is_closed=True)


def _draw_grid_bubble(msp, cx: float, cy: float, r: float, label: str,
                      txt_h: float, bubble_lw: int):
    """Draw one grid bubble: white hatch + circle + centred label.
    Reused across floor plan, roof plan, and elevation code paths.
    """
    _add_bubble_hatch(msp, cx, cy, r)
    msp.add_circle((cx, cy), r,
                   dxfattribs={'layer': 'A-GRID', 'lineweight': bubble_lw})
    msp.add_text(label,
                 dxfattribs={'layer': 'A-ANNO-TEXT', 'height': txt_h}
                 ).set_placement((cx, cy),
                                 align=TextEntityAlignment.MIDDLE_CENTER)


def _add_wall_hatch(msp, pts, material_name=''):
    """§5.1f / §23 P0a: HATCH fill for wall section-cut polygon.
    Uses material-based pattern (from Bonsai patterns.svg) when known,
    falls back to solid black fill.  ACI 0 = BYBLOCK = black."""
    mat_key = (material_name or '').lower().split(',')[0].strip()
    pat_name = _MATERIAL_TO_PATTERN.get(mat_key)
    pat_def = _BONSAI_HATCH_PATTERNS.get(pat_name) if pat_name else None

    hatch = msp.add_hatch()
    hatch.dxf.layer = 'A-WALL-PATT'
    if pat_def:
        hatch.set_pattern_fill(pat_name, definition=pat_def, scale=1.0)
        hatch.dxf.color = 0   # black pattern lines
    else:
        hatch.set_solid_fill(color=0)
    hatch.paths.add_polyline_path(pts, is_closed=True)
    return pat_name  # None → solid, else pattern used


def _lw(tpl: dict, key: str) -> int:
    """Read line weight from template, return DXF lineweight integer.
    Spec §1 R4: all line weights from template line_weights.*"""
    return int(tpl.get('line_weights', {}).get(key, 0.18) * 100)


def _txt_h(tpl: dict, section: str, key: str, fallback: float = 2.5) -> float:
    """Read text height (paper mm) from template section.
    Spec §7.3: all annotation placement from template."""
    return tpl.get(section, {}).get(key, fallback)

# ─────────────────────────────────────────────────────────────────
# DOC SETUP
# ─────────────────────────────────────────────────────────────────

def _new_doc(tpl: dict, scale: int = SCALE) -> ezdxf.document.Drawing:
    """Create a new DXF R2010 document with template-driven layers and dimstyle.
    Spec §1 R4: template governs all formatting."""
    doc = ezdxf.new('R2010')

    # Units: mm
    doc.header['$INSUNITS'] = 4
    doc.header['$LTSCALE'] = scale / 100.0
    doc.header['$MEASUREMENT'] = 1  # metric

    # Load standard linetypes from template line_styles
    doc.linetypes.add('CENTER',  [1.2, 0.8, -0.2, 0.0, -0.2], description='Center __ . __ . __')
    doc.linetypes.add('HIDDEN',  [0.6, 0.4, -0.2], description='Hidden -- -- -- --')
    doc.linetypes.add('DASHDOT', [0.6, 0.4, -0.2, 0.0, -0.2], description='Dash dot __.__.__')

    # AIA layers — colors and linetypes from template (§8)
    for name, color, ltype in _build_layers(tpl):
        if ltype not in ('CONTINUOUS',):
            try:
                doc.layers.add(name=name, color=color, linetype=ltype)
            except Exception:
                doc.layers.add(name=name, color=color)
        else:
            doc.layers.add(name=name, color=color)

    # ARCH_JKR dimstyle — all values from template dimensions.* (§6.3)
    tpl_dims = tpl.get('dimensions', {})
    try:
        # §I-41 fix: create ARCHTICK block BEFORE referencing it in dimstyle
        # to avoid ezdxf handle conflict when auto-creating the block later
        from ezdxf import ARROWS
        ARROWS.create_block(doc.blocks, 'ARCHTICK')
        ds = doc.dimstyles.new('ARCH_JKR')
        ds.dxf.dimscale = scale
        ds.dxf.dimtxt   = tpl_dims.get('text_height_mm', 2.5)
        ds.dxf.dimblk   = 'ARCHTICK'    # 45° tick per template terminator=tick
        ds.dxf.dimexo   = tpl_dims.get('extension_gap_mm', 2.0)
        ds.dxf.dimexe   = tpl_dims.get('extension_overshoot_mm', 2.0)
        ds.dxf.dimdle   = 0.0
        ds.dxf.dimgap   = 1.0
    except Exception:
        pass

    # §23 P0b: Tag symbol BLOCKs extracted from Bonsai bim/data/assets/symbols.svg
    # Each block is at unit scale (radius=1); scale at insertion via xscale/yscale.
    _lw_sym = int(tpl.get('annotation_tags', {}).get('block_stroke_mm', 0.25) * 100)
    _log(f"§VALUE key=annotation_tags.block_stroke_mm value={_lw_sym/100:.2f} "
         f"dxf_lw={_lw_sym} was=hardcoded_0.25 src=template §I-43")

    # DOOR_TAG: circle r=1, horizontal divider, two text zones (Bonsai id="door-tag")
    blk = doc.blocks.new(name='DOOR_TAG')
    blk.add_circle((0, 0), 1, dxfattribs={'lineweight': _lw_sym})
    blk.add_line((-1, 0), (1, 0), dxfattribs={'lineweight': _lw_sym})

    # WINDOW_TAG: hexagon (Bonsai id="window-tag", matches our existing hexagon shape)
    blk = doc.blocks.new(name='WINDOW_TAG')
    hex_pts = _hexagon_pts(0, 0, 1)
    blk.add_lwpolyline(hex_pts, close=True, dxfattribs={'lineweight': _lw_sym})

    # SECTION_ARROW: filled triangle pointing up (Bonsai id="section-arrow")
    blk = doc.blocks.new(name='SECTION_ARROW')
    blk.add_lwpolyline([(-1, 0), (0, 1.414), (1, 0)], close=True,
                        dxfattribs={'lineweight': _lw_sym})

    # ELEVATION_TAG: circle + horizontal divider (Bonsai id="elevation-tag")
    blk = doc.blocks.new(name='ELEVATION_TAG')
    blk.add_circle((0, 0), 1, dxfattribs={'lineweight': _lw_sym})
    blk.add_line((-1, 0), (1, 0), dxfattribs={'lineweight': _lw_sym})

    return doc


def _mh(metres: float) -> float:
    """Convert metres to DXF model-space mm."""
    return metres * MM


# ─────────────────────────────────────────────────────────────────
# TEMPLATE LOADER
# ─────────────────────────────────────────────────────────────────

import json

def _load_template() -> dict:
    """Load drawing_template.json — user-editable drawing CSS."""
    tpl_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                            '..', 'drawing_template.json')
    if os.path.exists(tpl_path):
        with open(tpl_path) as f:
            return json.load(f)
    return {}


def _build_schedule(elements: dict) -> list:
    """Build door & window schedule rows from elements.
    Groups openings by size, returns list of dicts for the schedule table.
    Spec §7.2: archive has JADUAL PINTU & TINGKAP in title block."""
    from collections import defaultdict
    doors = elements.get('doors', [])
    windows = elements.get('windows', [])

    # Group doors by size (width × height in mm, rounded)
    door_groups = defaultdict(list)
    for i, d in enumerate(doors, 1):
        w_mm = round(d.width_x * 1000)
        h_mm = round((d.max_z - d.min_z) * 1000) if hasattr(d, 'max_z') else round(d.width_y * 1000)
        key = (w_mm, h_mm)
        door_groups[key].append(f'D{i}')

    win_groups = defaultdict(list)
    for i, w in enumerate(windows, 1):
        w_mm = round(w.width_x * 1000)
        h_mm = round((w.max_z - w.min_z) * 1000) if hasattr(w, 'max_z') else round(w.width_y * 1000)
        key = (w_mm, h_mm)
        win_groups[key].append(f'W{i}')

    rows = []
    for (w_mm, h_mm), tags in sorted(door_groups.items(), key=lambda x: x[1][0]):
        tag_str = tags[0] if len(tags) == 1 else f'{tags[0]}-{tags[-1]}'
        desc = 'EXTDBL FLUSH' if w_mm > 1500 else 'INTSGL'
        rows.append({'tag': tag_str, 'size': f'{w_mm}\u00d7{h_mm}',
                     'desc': desc, 'qty': f'{len(tags)} No.'})
    for (w_mm, h_mm), tags in sorted(win_groups.items(), key=lambda x: x[1][0]):
        tag_str = tags[0] if len(tags) == 1 else f'{tags[0]}-{tags[-1]}'
        rows.append({'tag': tag_str, 'size': f'{w_mm}\u00d7{h_mm}',
                     'desc': 'SGL PLAIN', 'qty': f'{len(tags)} No.'})
    return rows


def _infer_building_identity(db_path: str):
    """§A spec: infer (building_type, building_name) from extracted DB.
    Source: spatial_structure WHERE type='IfcBuilding' → name.
    Fallback: db stem → known map per §5.3c."""
    _TYPE_MAP = {
        'DX_EXTRACTED': 'DUPLEX RESIDENTIAL',
        'IFC2X3_DUPLEX_EXTRACTED': 'DUPLEX RESIDENTIAL',
        'SH_EXTRACTED': 'SINGLE STOREY RESIDENTIAL',
        'IFC4_SAMPLEHOUSE_EXTRACTED': 'SINGLE STOREY RESIDENTIAL',
    }
    _NAME_MAP = {
        'DX_EXTRACTED': 'Ifc4 Duplex',
        'IFC2X3_DUPLEX_EXTRACTED': 'Ifc4 Duplex',
        'SH_EXTRACTED': 'Ifc4 Sample House',
        'IFC4_SAMPLEHOUSE_EXTRACTED': 'Ifc4 Sample House',
    }
    stem = os.path.splitext(os.path.basename(db_path))[0].upper()
    bld_type = _TYPE_MAP.get(stem, '')
    bld_name = _NAME_MAP.get(stem, '')
    try:
        conn = sqlite3.connect(db_path)
        row = conn.execute(
            "SELECT name FROM spatial_structure WHERE type='IfcBuilding' LIMIT 1"
        ).fetchone()
        conn.close()
        if row and row[0]:
            bld_name = row[0].replace('_', ' ')  # W5: strip underscores from IFC names
    except Exception:
        pass
    return bld_type, bld_name


def _draw_grid_legend_panel(msp, x_grids, y_grids, x0, x1, bot_y, height,
                             scale, lbl_h, leg_row_h, lw_thin, lw_med, lw_bold,
                             panel_bays=None):
    """§C / §15.3: Draw GRID REFERENCE legend at bottom of title block panel.
    If panel_bays is empty, shows 'ALL DIMS SHOWN IN DRAWING'.
    If panel_bays is provided, shows only those bays (crowded ones)."""
    # Draw bounding box line at top of legend zone
    msp.add_line((x0, bot_y + height), (x1, bot_y + height),
                 dxfattribs={'layer': 'A-TTLB', 'lineweight': lw_bold})

    pw = x1 - x0
    cx = (x0 + x1) / 2
    hdr_h = lbl_h * 1.2

    y = bot_y + height

    # Section header
    y -= leg_row_h
    msp.add_text('GRID REFERENCE',
                 dxfattribs={'layer': 'A-TTLB', 'height': hdr_h}
                 ).set_placement((cx, y), align=TextEntityAlignment.MIDDLE_CENTER)
    y -= leg_row_h * 0.5
    msp.add_line((x0, y), (x1, y), dxfattribs={'layer': 'A-TTLB', 'lineweight': lw_med})

    # §15.3: if no panel bays, show single-line message
    if panel_bays is not None and len(panel_bays) == 0:
        y -= leg_row_h
        msp.add_text('ALL DIMS SHOWN IN DRAWING',
                     dxfattribs={'layer': 'A-TTLB', 'height': lbl_h}
                     ).set_placement((cx, y), align=TextEntityAlignment.MIDDLE_CENTER)
        return

    # Build set of panel bay keys for filtering when panel_bays provided
    _pbay_keys = (frozenset((b.label1, b.label2) for b in panel_bays)
                  if panel_bays else None)

    def _axis_block(axis_label, grid_list):
        nonlocal y
        y -= leg_row_h
        msp.add_text(axis_label,
                     dxfattribs={'layer': 'A-TTLB', 'height': lbl_h}
                     ).set_placement((x0 + pw * 0.04, y),
                                     align=TextEntityAlignment.LEFT)
        total_m = 0.0
        shown = 0
        for i in range(len(grid_list) - 1):
            g1 = grid_list[i]
            g2 = grid_list[i + 1]
            dist = g2.position - g1.position
            total_m += dist
            # §15.3: when panel_bays provided, only show panel bays
            if _pbay_keys and (g1.label, g2.label) not in _pbay_keys:
                continue
            y -= leg_row_h
            msp.add_text(f'{g1.label} - {g2.label}',
                         dxfattribs={'layer': 'A-TTLB', 'height': lbl_h}
                         ).set_placement((x0 + pw * 0.06, y),
                                         align=TextEntityAlignment.LEFT)
            msp.add_text(format_dim(dist),
                         dxfattribs={'layer': 'A-TTLB', 'height': lbl_h}
                         ).set_placement((x1 - pw * 0.04, y),
                                         align=TextEntityAlignment.RIGHT)
            shown += 1
        if shown > 0 or not _pbay_keys:
            y -= leg_row_h
            msp.add_text('TOTAL:',
                         dxfattribs={'layer': 'A-TTLB', 'height': lbl_h}
                         ).set_placement((x0 + pw * 0.06, y),
                                         align=TextEntityAlignment.LEFT)
            msp.add_text(format_dim(total_m),
                         dxfattribs={'layer': 'A-TTLB', 'height': lbl_h}
                         ).set_placement((x1 - pw * 0.04, y),
                                         align=TextEntityAlignment.RIGHT)
        y -= leg_row_h * 0.5
        msp.add_line((x0, y), (x1, y),
                     dxfattribs={'layer': 'A-TTLB', 'lineweight': lw_thin})

    if len(x_grids) >= 2:
        _axis_block('HORIZONTAL (X)', x_grids)
    if len(y_grids) >= 2:
        _axis_block('VERTICAL (Y)', y_grids)




def _draw_sheet_layout(doc, msp, tpl, bld_min_x, bld_max_x, bld_min_y, bld_max_y,
                       drawing_title='', drawing_no='', scale=SCALE, schedule_rows=None,
                       view_type='plan', building_type='', building_name='', grids=None,
                       panel_bays=None):
    """Draw sheet border, white background, title block panel, north arrow.

    All values from drawing_template.json — no hardcoded layout.

    Rules (from ISO 128 + JKR Malaysian practice):
      R1: White background — paper is white, all drawing on top
      R2: Sheet border — rectangle at margin boundaries, bold line (0.7mm)
      R3: Content area — left of title block, building centered within
      R4: Title block — right-side panel, vertical separator, field rows
          Fields: label column (30%) | value column (70%), bottom-up order
          Header text centered near top of panel
      R5: North arrow — triangle + "N" label, top-right of content area
      R6: All layout dimensions from drawing_template.json, user-editable
    """
    paper = tpl.get('paper', {})
    pw = paper.get('width_mm', 420) * scale   # paper mm → model-space mm

    # §7.1a: Fitted paper height — short and wide, sleek (spec §7.1a)
    if paper.get('fitted', True):
        tpl_grid = tpl.get('grid', {})
        tpl_dims = tpl.get('dimensions', {})
        bld_h_mm = (bld_max_y - bld_min_y) / scale  # model → paper mm
        # §I-29: bubble at FAR END beyond tier_1 dim.
        # ann_top = tier_1_offset + grid_extend + bubble_diameter  (§7.1a formula)
        _t1 = tpl_dims.get('tier_1_offset_mm', DIM_OFFSET_2)
        ann_top = (_t1
                   + tpl_grid.get('extend_beyond_building_mm', 20)
                   + tpl_grid.get('bubble_radius_mm', 4.0) * 2)
        ann_bot = (tpl_grid.get('extend_beyond_building_mm', 20)
                   + tpl_grid.get('bubble_radius_mm', 4.0) * 2)
        margin_top_mm = paper.get('margins', {}).get('top', 10)
        margin_bot_mm = paper.get('margins', {}).get('bottom', 10)
        extra_bot_mm = paper.get('fitted_extra_bottom_mm', 0)
        fitted_h = margin_top_mm + ann_top + bld_h_mm + ann_bot + margin_bot_mm + extra_bot_mm
        fitted_h = max(paper.get('fitted_min_height_mm', 150),
                       min(paper.get('fitted_max_height_mm', 250), fitted_h))
        _log(f"§7.1a paper_height={fitted_h:.0f}mm fitted=True "
             f"(bld={bld_h_mm:.0f}mm ann_top={ann_top:.0f}mm ann_bot={ann_bot:.0f}mm)")
        ph = fitted_h * scale
    else:
        ph = paper.get('height_mm', 297) * scale
    ml = paper.get('margins', {}).get('left', 25) * scale
    mt = paper.get('margins', {}).get('top', 10) * scale
    mr = paper.get('margins', {}).get('right', 10) * scale
    mb = paper.get('margins', {}).get('bottom', 10) * scale
    tb_w = paper.get('title_block_width_mm', 120) * scale
    bw = int(paper.get('border_weight_mm', 0.7) * 100)  # mm → DXF lineweight

    # Center building in content area (left of title block)
    content_w = pw - ml - mr - tb_w
    content_h = ph - mt - mb
    bld_w = bld_max_x - bld_min_x
    bld_h = bld_max_y - bld_min_y

    # Sheet origin: X centered, Y positioned by annotation zone when fitted
    sheet_x = bld_min_x - ml - max(0, (content_w - bld_w) / 2)
    if paper.get('fitted', True):
        # §7.1a: position building with annotation_bottom below (asymmetric zones)
        tpl_grid_sl = tpl.get('grid', {})
        ann_bot_mm = (tpl_grid_sl.get('extend_beyond_building_mm', 15)
                      + tpl_grid_sl.get('bubble_radius_mm', 4.0) * 2)
        extra_bot_mm = paper.get('fitted_extra_bottom_mm', 0)
        sheet_y = bld_min_y - mb - (ann_bot_mm + extra_bot_mm) * scale
    else:
        sheet_y = bld_min_y - mb - max(0, (content_h - bld_h) / 2)

    sx0 = sheet_x
    sy0 = sheet_y
    sx1 = sheet_x + pw
    sy1 = sheet_y + ph

    # White background rectangle (layer 0, color 7=white)
    bg_pts = [(sx0, sy0), (sx1, sy0), (sx1, sy1), (sx0, sy1)]
    bg = msp.add_lwpolyline(bg_pts, close=True,
                            dxfattribs={'layer': '0', 'color': 7, 'lineweight': -1})

    # Sheet border
    bx0 = sx0 + ml
    by0 = sy0 + mb
    bx1 = sx1 - mr
    by1 = sy1 - mt
    border_pts = [(bx0, by0), (bx1, by0), (bx1, by1), (bx0, by1)]
    msp.add_lwpolyline(border_pts, close=True,
                       dxfattribs={'layer': 'A-TTLB', 'lineweight': bw})

    # Title block panel — vertical line separating content from panel
    tb_left = bx1 - tb_w
    msp.add_line((tb_left, by0), (tb_left, by1),
                 dxfattribs={'layer': 'A-TTLB', 'lineweight': bw})

    # Line weights for title block — thin for minor rows, medium for required rows
    lw_tb      = _lw(tpl, 'dimension_line')   # 0.18mm — minor separators
    tb_tpl = tpl.get('title_block', {})
    lw_tb_med  = int(tb_tpl.get('section_break_mm', 0.35) * 100)
    lw_tb_bold = int(tb_tpl.get('outer_frame_mm', 0.50) * 100)
    _log(f"§VALUE key=title_block.section_break_mm value={lw_tb_med/100:.2f} "
         f"dxf_lw={lw_tb_med} was=hardcoded_0.35 src=template §I-43")
    _log(f"§VALUE key=title_block.outer_frame_mm value={lw_tb_bold/100:.2f} "
         f"dxf_lw={lw_tb_bold} was=hardcoded_0.50 src=template §I-43")

    # Title block layout from template
    title_block = tpl.get('title_block', {})
    label_ratio = title_block.get('label_column_ratio', 0.30)
    lbl_h = title_block.get('font_height_label_mm', 2.0) * scale
    val_h = title_block.get('font_height_value_mm', 3.0) * scale
    hdr_h = val_h * 1.3   # header text — larger than value text

    # §7.2: Read field rows from 2d_title_block DB (authoritative: per-row sizing + bold flag)
    db_rows = _read_2d_db_title()
    # Build lookup: field_name → DB row metadata
    db_meta = {r['field_name']: r for r in db_rows}
    # Merge template fields (order + key/label/default) with DB metadata
    tpl_fields = title_block.get('fields', [])
    # Key-name mapping: template key matches DB field_name
    merged = []
    for f in tpl_fields:
        key = f.get('key', '')
        db = db_meta.get(key, {})
        merged.append({
            'key':       key,
            'label':     f.get('label', db.get('label_text', key)),
            'default':   f.get('default', db.get('default_value', '') or ''),
            'lbl_size':  (db.get('label_size') or 2.0) * scale,
            'val_size':  (db.get('value_size') or 3.0) * scale,
            'required':  bool(db.get('is_required', 0)),
        })
    n_fields = len(merged)

    panel_h = by1 - by0
    jkr_zone = hdr_h * 4   # space for JKR header text at top of panel
    # §A: building identity block height
    bld_type_h = title_block.get('font_height_building_type_mm', 5.0) * scale
    bld_name_h = title_block.get('font_height_building_name_mm', 3.0) * scale
    _has_id = bool(building_type or building_name)
    id_zone = (bld_type_h + bld_name_h) * 2.0 if _has_id else 0.0
    header_zone = jkr_zone + id_zone  # total reserved at top of panel
    # §C: grid reference legend height
    _x_grids = sorted([g for g in (grids or []) if g.axis == 'x'],
                      key=lambda g: g.position)
    _y_grids = sorted([g for g in (grids or []) if g.axis == 'y'],
                      key=lambda g: g.position)
    n_x_bays = max(0, len(_x_grids) - 1)
    n_y_bays = max(0, len(_y_grids) - 1)
    leg_row_h = lbl_h * 1.5
    _has_leg = bool(grids and (n_x_bays + n_y_bays) > 0)
    legend_h = (n_x_bays + n_y_bays + 7) * leg_row_h if _has_leg else 0.0
    # §F3 fix: pre-compute schedule height so field rows don't overlap with schedule rows
    sch_row_h = lbl_h * 3.5
    sch_hdr_h = lbl_h * 2.5
    sch_total_h = (sch_hdr_h + (1 + len(schedule_rows)) * sch_row_h) if schedule_rows else 0.0
    row_h = (panel_h - header_zone - legend_h - sch_total_h) / max(n_fields, 1)

    hx = tb_left + tb_w / 2   # panel horizontal centre

    # Header — bold large text + thick underline
    header = title_block.get('header', '')
    if header:
        hy = by1 - jkr_zone / 2

        # §14.2: JKR logo in header zone (left side, text shifts right)
        logo_file = title_block.get('logo_file', 'jkr.png')
        logo_w_mm = title_block.get('logo_width_mm', 15.0)
        logo_h_mm = title_block.get('logo_height_mm', 12.0)
        logo_w = logo_w_mm * scale
        logo_h = logo_h_mm * scale
        logo_gap = title_block.get('logo_gap_mm', 2.0) * scale
        logo_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                 '..', 'input', logo_file)
        logo_inserted = False
        if os.path.exists(logo_path):
            try:
                from PIL import Image as _PILImage
                _pil_img = _PILImage.open(logo_path)
                _px_w, _px_h = _pil_img.size
                _pil_img.close()
                image_def = doc.add_image_def(logo_path,
                                              size_in_pixel=(_px_w, _px_h))
                logo_x = tb_left + logo_gap
                logo_y = hy - logo_h / 2
                msp.add_image(insert=(logo_x, logo_y),
                              size_in_units=(logo_w, logo_h),
                              image_def=image_def,
                              dxfattribs={'layer': 'A-TTLB'})
                logo_inserted = True
                _log(f"§I-07 JKR logo inserted w={logo_w_mm}mm h={logo_h_mm}mm "
                     f"layer=A-TTLB src=template.title_block.logo_file")
            except Exception as _img_err:
                _log(f"§WARN JKR logo raster insert failed ({_img_err}); "
                     f"using placeholder — manual step required")
        else:
            _log(f"§WARN JKR logo file not found: {logo_path}; skipping logo")

        if not logo_inserted and os.path.exists(logo_path):
            # Fallback: placeholder rectangle + "JKR LOGO" text
            _pl_x0 = tb_left + logo_gap
            _pl_y0 = hy - logo_h / 2
            _pl_pts = [(_pl_x0, _pl_y0), (_pl_x0 + logo_w, _pl_y0),
                       (_pl_x0 + logo_w, _pl_y0 + logo_h), (_pl_x0, _pl_y0 + logo_h)]
            msp.add_lwpolyline(_pl_pts, close=True,
                               dxfattribs={'layer': 'A-TTLB', 'lineweight': lw_tb})
            msp.add_text('JKR LOGO',
                         dxfattribs={'layer': 'A-TTLB', 'height': lbl_h}
                         ).set_placement((_pl_x0 + logo_w / 2, hy),
                                         align=TextEntityAlignment.MIDDLE_CENTER)
            logo_inserted = True
            _log(f"§RENDER TITLE_BLOCK jkr_logo placeholder "
                 f"w={logo_w_mm}mm h={logo_h_mm}mm src=template.title_block.logo_file")

        # §14.2: Shift header text right if logo was placed
        text_cx = hx
        if logo_inserted:
            text_left = tb_left + logo_gap + logo_w + logo_gap
            text_cx = (text_left + bx1) / 2

        # Two lines if header contains whitespace — split at natural break
        words = header.split()
        if len(words) > 3:
            mid = len(words) // 2
            line1 = ' '.join(words[:mid])
            line2 = ' '.join(words[mid:])
            msp.add_text(line1,
                         dxfattribs={'layer': 'A-TTLB', 'height': hdr_h}
                         ).set_placement((text_cx, hy + hdr_h * 0.5),
                                         align=TextEntityAlignment.MIDDLE_CENTER)
            msp.add_text(line2,
                         dxfattribs={'layer': 'A-TTLB', 'height': hdr_h}
                         ).set_placement((text_cx, hy - hdr_h * 0.5),
                                         align=TextEntityAlignment.MIDDLE_CENTER)
        else:
            msp.add_text(header,
                         dxfattribs={'layer': 'A-TTLB', 'height': hdr_h}
                         ).set_placement((text_cx, hy), align=TextEntityAlignment.MIDDLE_CENTER)
        # Thick line under JKR header (above identity block or schedule)
        msp.add_line((tb_left, by1 - jkr_zone),
                     (bx1,     by1 - jkr_zone),
                     dxfattribs={'layer': 'A-TTLB', 'lineweight': lw_tb_bold})

    # §A: Building identity block (below JKR header, above schedule)
    if _has_id:
        id_top = by1 - jkr_zone
        id_bot = id_top - id_zone
        if building_type:
            ty_y = id_bot + id_zone * 0.65
            msp.add_text(building_type,
                         dxfattribs={'layer': 'A-TTLB', 'height': bld_type_h}
                         ).set_placement((hx, ty_y),
                                         align=TextEntityAlignment.MIDDLE_CENTER)
        if building_name:
            ny_y = id_bot + id_zone * 0.28
            msp.add_text(building_name,
                         dxfattribs={'layer': 'A-TTLB', 'height': bld_name_h}
                         ).set_placement((hx, ny_y),
                                         align=TextEntityAlignment.MIDDLE_CENTER)
        msp.add_line((tb_left, id_bot), (bx1, id_bot),
                     dxfattribs={'layer': 'A-TTLB', 'lineweight': lw_tb_med})

    # Door & window schedule (between header+identity block and field rows)
    if schedule_rows:
        sch_top = by1 - header_zone  # below header zone (includes id_zone)
        sch_small = lbl_h * 0.9      # small text for descriptions
        # Schedule title
        sch_y = sch_top
        msp.add_line((tb_left, sch_y), (bx1, sch_y),
                     dxfattribs={'layer': 'A-TTLB', 'lineweight': lw_tb})
        sch_title = tpl.get('title_block', {}).get('schedule_header',
                                                    'DOOR & WINDOW SCHEDULE')
        msp.add_text(sch_title,
                     dxfattribs={'layer': 'A-TTLB', 'height': sch_small,
                                 'color': 8}
                     ).set_placement((hx, sch_y - sch_hdr_h * 0.8),
                                     align=TextEntityAlignment.MIDDLE_CENTER)
        sch_y -= sch_hdr_h
        msp.add_line((tb_left, sch_y), (bx1, sch_y),
                     dxfattribs={'layer': 'A-TTLB', 'lineweight': lw_tb})
        # Column positions (TAG | SIZE | DESCRIPTION | QTY)
        col_x = [tb_left + 4 * scale,
                 tb_left + tb_w * tb_tpl.get('internal_ratio', 0.18),
                 tb_left + tb_w * 0.43,
                 tb_left + tb_w * 0.82]
        # Column headers
        for label, cx in zip(['TAG', 'SIZE', 'DESCRIPTION', 'QTY'], col_x):
            msp.add_text(label,
                         dxfattribs={'layer': 'A-TTLB', 'height': sch_small}
                         ).set_placement((cx, sch_y - sch_row_h * 0.5),
                                         align=TextEntityAlignment.LEFT)
        sch_y -= sch_row_h
        msp.add_line((tb_left, sch_y), (bx1, sch_y),
                     dxfattribs={'layer': 'A-TTLB', 'lineweight': lw_tb,
                                 'color': 8})
        # Data rows
        for row in schedule_rows:
            vals = [row['tag'], row['size'], row['desc'], row['qty']]
            heights = [lbl_h, lbl_h, sch_small, lbl_h]
            for val, cx, th in zip(vals, col_x, heights):
                msp.add_text(val,
                             dxfattribs={'layer': 'A-TTLB', 'height': th}
                             ).set_placement((cx, sch_y - sch_row_h * 0.5),
                                             align=TextEntityAlignment.LEFT)
            sch_y -= sch_row_h
        msp.add_line((tb_left, sch_y), (bx1, sch_y),
                     dxfattribs={'layer': 'A-TTLB', 'lineweight': lw_tb,
                                 'color': 8})

    # Field rows — bottom up, DB-driven formatting
    y_cursor = by0 + legend_h   # §C: legend occupies bottom slice
    div_x = tb_left + tb_w * label_ratio
    prev_required = False
    for field in reversed(merged):
        req = field['required']
        # Thick separator above required rows (and above first row always)
        row_lw = lw_tb_med if req else lw_tb
        msp.add_line((tb_left, y_cursor), (bx1, y_cursor),
                     dxfattribs={'layer': 'A-TTLB', 'lineweight': row_lw})
        msp.add_line((div_x, y_cursor), (div_x, y_cursor + row_h),
                     dxfattribs={'layer': 'A-TTLB', 'lineweight': lw_tb})
        label_x = tb_left + tb_w * label_ratio / 2
        label_y = y_cursor + row_h / 2
        display_label = field['label']
        msp.add_text(display_label,
                     dxfattribs={'layer': 'A-TTLB', 'height': field['lbl_size']}
                     ).set_placement((label_x, label_y),
                                     align=TextEntityAlignment.MIDDLE_CENTER)
        value = field['default']
        if field['key'] == 'DRAWING_TITLE' and drawing_title:
            value = drawing_title
        if field['key'] == 'DRAWING_NO' and drawing_no:
            value = drawing_no
        # W2: sync BUILDING TYPE field with identity block value
        if (field['key'] == 'BUILDING_TYPE' and building_type
                and title_block.get('sync_building_type_field', True)):
            value = building_type
        # §14.1: SCALE field shows "1:N" format
        if field['key'] == 'SCALE':
            value = f'1:{scale}'
        # §I-10: REVISION_NO — default "0" if no value from DB
        if field['key'] == 'REVISION_NO':
            if not value:
                value = '0'
            _log(f"§RENDER TITLE_BLOCK revision_no value={value} "
                 f"src=2d_title_block.default_value")
        if value:
            value_x = div_x + (tb_w * (1 - label_ratio)) / 2
            msp.add_text(value,
                         dxfattribs={'layer': 'A-TTLB', 'height': field['val_size']}
                         ).set_placement((value_x, label_y),
                                         align=TextEntityAlignment.MIDDLE_CENTER)
        y_cursor += row_h
        prev_required = req

    # §C / §15.3: Grid reference legend at bottom of panel
    if _has_leg:
        _draw_grid_legend_panel(msp, _x_grids, _y_grids,
                                tb_left, bx1, by0, legend_h,
                                scale, lbl_h, leg_row_h,
                                lw_tb, lw_tb_med, lw_tb_bold,
                                panel_bays=panel_bays)

    # North arrow — §5.0b: plans only, not elevations
    if view_type in ('plan', 'roof_plan'):
        na = tpl.get('north_arrow', {})
        na_size = na.get('size_mm', 8) * scale
        na_font = na.get('font_height_mm', 3.0) * scale
        na_width_ratio = na.get('width_ratio', 0.33)
        _log(f"§VALUE north_arrow.size_mm={na.get('size_mm', 8)} (from template)")
        _log(f"§VALUE north_arrow.width_ratio={na_width_ratio} (from template)")
        # §7.3f: Placement from template north_arrow.placement if it has
        # x_from_right_mm / y_from_bottom_mm keys; else fall back to default.
        na_placement = na.get('placement', {})
        if isinstance(na_placement, dict) and 'x_from_right_mm' in na_placement:
            x_from_right = na_placement['x_from_right_mm'] * scale
            y_from_bottom = na_placement.get('y_from_bottom_mm', na_size * 3) * scale
            na_x = bx1 - tb_w - x_from_right
            na_y = by0 + y_from_bottom
        else:
            # Default: top-right of content area, offset by arrow size from edges
            na_x = tb_left - na_size * 2
            na_y = by1 - na_size * 3
        na_half_w = na_size * na_width_ratio
        tri_pts = [(na_x, na_y + na_size),
                   (na_x - na_half_w, na_y),
                   (na_x + na_half_w, na_y)]
        msp.add_lwpolyline(tri_pts, close=True,
                           dxfattribs={'layer': 'A-ANNO-TEXT', 'lineweight': lw_tb})
        msp.add_text(na.get('label', 'N'),
                     dxfattribs={'layer': 'A-ANNO-TEXT', 'height': na_font}
                     ).set_placement((na_x, na_y + na_size + na_font),
                                     align=TextEntityAlignment.MIDDLE_CENTER)
        _log(f"§RENDER NORTH_ARROW shape=triangle size={na.get('size_mm', 8)}mm "
             f"width_ratio={na_width_ratio} at ({na_x:.0f},{na_y:.0f}) "
             f"src=template.north_arrow")

    # Scale text — §5.0 universal sheet furniture
    scale_str = tpl.get('paper', {}).get('scale', '1:100')
    scale_txt_h = tpl.get('title_block', {}).get('font_height_value_mm', 3.0) * scale
    scale_color = _hex_to_aci(tpl.get('colors', {}).get('scale_text', '#888888'))
    scale_x = (bx0 + tb_left) / 2
    scale_y = by0 + scale_txt_h * 3
    msp.add_text(f'scale {scale_str}',
                 dxfattribs={'layer': 'A-ANNO-TEXT',
                             'height': scale_txt_h, 'color': scale_color}
                 ).set_placement((scale_x, scale_y),
                                 align=TextEntityAlignment.MIDDLE_CENTER)

    # Scale bar — §5.0 conditional (not schedule)
    tpl_sb = tpl.get('scale_bar', {})
    sb_divs = tpl_sb.get('divisions', [0, 1, 2, 5])
    sb_unit = tpl_sb.get('unit', 'm')
    sb_bar_h = tpl_sb.get('bar_height_mm', 2.0) * scale
    sb_font_h = tpl_sb.get('font_height_mm', 2.0) * scale
    sb_y = scale_y - scale_txt_h * 2
    # W1 fix: 1 metre = MM model-space mm (not 1000/scale which was 100× too small)
    sb_scale_factor = MM  # model-space mm per real-world metre
    sb_stagger = tpl_sb.get('label_stagger', True)
    total_extent = (sb_divs[-1] - sb_divs[0]) * sb_scale_factor
    sb_x0 = scale_x - total_extent / 2
    for i in range(len(sb_divs) - 1):
        x_start = sb_x0 + (sb_divs[i] - sb_divs[0]) * sb_scale_factor
        x_end = sb_x0 + (sb_divs[i + 1] - sb_divs[0]) * sb_scale_factor
        fill_color = 7 if i % 2 == 0 else 0
        msp.add_solid(
            [(x_start, sb_y), (x_end, sb_y),
             (x_start, sb_y + sb_bar_h), (x_end, sb_y + sb_bar_h)],
            dxfattribs={'layer': 'A-ANNO-DIMS', 'color': fill_color})
    for idx, d in enumerate(sb_divs):
        lx = sb_x0 + (d - sb_divs[0]) * sb_scale_factor
        label = f'{d}{sb_unit}' if d == sb_divs[-1] else str(d)
        # stagger: even-index labels above bar, odd below (prevents overlap)
        y_off = sb_font_h * 0.8 if (not sb_stagger or idx % 2 == 0) else -(sb_bar_h + sb_font_h * 1.5)
        msp.add_text(label,
                     dxfattribs={'layer': 'A-ANNO-DIMS', 'height': sb_font_h}
                     ).set_placement((lx, sb_y - y_off),
                                     align=TextEntityAlignment.MIDDLE_CENTER)


# ─────────────────────────────────────────────────────────────────
# DIAGNOSTIC LOG
# ─────────────────────────────────────────────────────────────────

_LOG_LINES: List[str] = []
_LOG_VIEW: str = ''       # §16.2: current view name for per-view log files
_LOG_VIEW_LINES: List[str] = []  # lines for the current view only

def _log(msg: str):
    """Append a diagnostic line (printed + buffered for log file)."""
    print(msg)
    _LOG_LINES.append(msg)
    _LOG_VIEW_LINES.append(msg)


def _start_view_log(view_name: str):
    """§16.2: Begin a new per-view log section."""
    global _LOG_VIEW
    _LOG_VIEW = view_name
    _LOG_VIEW_LINES.clear()


def _flush_view_log(out_dir: str, prefix: str):
    """§16.2: Write per-view log file: output/log_{PREFIX}_{VIEW}_{ts}.txt"""
    if not _LOG_VIEW_LINES or not _LOG_VIEW:
        return
    ts = datetime.datetime.now().strftime('%Y%m%d_%H%M')
    log_name = f'log_{prefix}_{_LOG_VIEW}_{ts}.txt'
    log_path = os.path.join(out_dir, log_name)
    os.makedirs(out_dir, exist_ok=True)
    with open(log_path, 'w') as f:
        for line in _LOG_VIEW_LINES:
            f.write(line + '\n')
    _log(f"  Per-view log → {log_path}")


def _set_bimsrc(entity, **kwargs):
    """Write BIMSRC xdata for BIM round-trip provenance. See spec §20.5."""
    groups = []
    for k, v in kwargs.items():
        if isinstance(v, float):
            groups += [(1000, k), (1040, v)]
        elif isinstance(v, int):
            groups += [(1000, k), (1070, v)]
        else:
            groups.append((1000, f'{k}:{v}'))
    try:
        entity.set_xdata('BIMSRC', groups)
    except Exception as e:
        _log(f'§XDATA BIMSRC WARN: {e}')


def _audit_dxf(doc, out_dxf: str, view_type: str):
    """Audit a generated DXF and log key metrics for hands-free verification.

    Checks:
      - Entity counts by type
      - Model-space extents (bounding box)
      - Text heights vs model extent (visibility ratio)
      - GUID xdata count
      - Annotation sanity: text_height / model_width should be 1-5%
    """
    msp = doc.modelspace()
    counts = {}
    min_x = min_y = float('inf')
    max_x = max_y = float('-inf')
    text_entries = []          # (text_str, x, y, height)
    guid_count = 0
    guid_set = set()
    # Track geometry-only extent (LWPOLYLINE on wall/elev layers)
    geo_min_x = geo_min_y = float('inf')
    geo_max_x = geo_max_y = float('-inf')

    for e in msp:
        t = e.dxftype()
        counts[t] = counts.get(t, 0) + 1
        if t == 'LWPOLYLINE':
            layer = e.dxf.layer
            for pt in e.get_points(format='xy'):
                min_x = min(min_x, pt[0])
                max_x = max(max_x, pt[0])
                min_y = min(min_y, pt[1])
                max_y = max(max_y, pt[1])
                # Building geometry layers only (not grid/anno)
                if layer.startswith('A-WALL') or layer in (
                        'A-DOOR', 'A-GLAZ', 'A-FURN',
                        'A-ELEV-WALL', 'A-ROOF'):
                    geo_min_x = min(geo_min_x, pt[0])
                    geo_max_x = max(geo_max_x, pt[0])
                    geo_min_y = min(geo_min_y, pt[1])
                    geo_max_y = max(geo_max_y, pt[1])
            try:
                xd = e.get_xdata('BIMGUID')
                if xd:
                    guid_count += 1
                    for tag in xd:
                        if tag[0] == 1000:
                            guid_set.add(tag[1])
            except Exception:
                pass
        elif t == 'LINE':
            min_x = min(min_x, e.dxf.start.x, e.dxf.end.x)
            max_x = max(max_x, e.dxf.start.x, e.dxf.end.x)
            min_y = min(min_y, e.dxf.start.y, e.dxf.end.y)
            max_y = max(max_y, e.dxf.start.y, e.dxf.end.y)
        elif t == 'TEXT':
            txt = e.dxf.text
            h = e.dxf.height
            ix, iy = e.dxf.insert.x, e.dxf.insert.y
            text_entries.append((txt, ix, iy, h))

    width_mm = max_x - min_x if max_x > min_x else 1
    height_mm = max_y - min_y if max_y > min_y else 1
    geo_w = geo_max_x - geo_min_x if geo_max_x > geo_min_x else 0
    geo_h = geo_max_y - geo_min_y if geo_max_y > geo_min_y else 0

    _log(f"  AUDIT [{view_type}] {os.path.basename(out_dxf)}")
    _log(f"    Entities: {dict(sorted(counts.items()))}")
    _log(f"    Total extent: {width_mm:.0f} x {height_mm:.0f} mm  "
         f"({width_mm/1000:.1f} x {height_mm/1000:.1f} m)")
    _log(f"    Building extent: {geo_w:.0f} x {geo_h:.0f} mm  "
         f"({geo_w/1000:.1f} x {geo_h/1000:.1f} m)")
    if width_mm > 0 and height_mm > 0 and geo_w > 0:
        fill_pct = (geo_w * geo_h) / (width_mm * height_mm) * 100
        _log(f"    Building fill: {fill_pct:.0f}% of drawing area")

    text_heights = [h for _, _, _, h in text_entries]
    if text_entries:
        avg_h = sum(text_heights) / len(text_heights)
        ratio = avg_h / width_mm * 100
        _log(f"    Text: {len(text_entries)} entities, "
             f"avg height {avg_h:.0f}mm, "
             f"visibility ratio {ratio:.1f}% of width")
        # Log actual text content for traceability
        for txt, tx, ty, th in text_entries[:8]:  # first 8 only
            _log(f"      \"{txt}\" at ({tx:.0f},{ty:.0f}) h={th:.0f}")
        if len(text_entries) > 8:
            _log(f"      ... and {len(text_entries) - 8} more")
        if ratio < 0.5:
            _log(f"    !! FAIL: text invisible (ratio {ratio:.2f}% < 0.5%)")
        elif ratio > 10:
            _log(f"    !! FAIL: text oversized (ratio {ratio:.1f}% > 10%)")
        else:
            _log(f"    OK: text proportional")
    else:
        _log(f"    Text: NONE")

    # Check DIMENSION entities for text overlap (doubled text bug)
    dim_count = counts.get('DIMENSION', 0)
    if dim_count > 0:
        _log(f"    Dimensions: {dim_count} entities")

    if guid_count > 0:
        _log(f"    GUID xdata: {guid_count} polylines, "
             f"{len(guid_set)} unique GUIDs")

    # ── Verdict ──
    has_geometry = counts.get('LWPOLYLINE', 0) + counts.get('LINE', 0) > 0
    text_ok = True
    detail_parts = []

    if not has_geometry:
        detail_parts.append("NO GEOMETRY")
        text_ok = False

    total_entities = sum(counts.values())
    detail_parts.append(f"{total_entities} entities")
    detail_parts.append(f"bldg {geo_w/1000:.1f}x{geo_h/1000:.1f}m")

    if text_entries:
        avg_h = sum(text_heights) / len(text_heights)
        ratio = avg_h / width_mm * 100
        if ratio < 0.5:
            detail_parts.append(f"TEXT INVISIBLE ({ratio:.2f}%)")
            text_ok = False
        elif ratio > 10:
            detail_parts.append(f"TEXT OVERSIZED ({ratio:.1f}%)")
            text_ok = False
        else:
            detail_parts.append(f"text {ratio:.1f}%")
    else:
        detail_parts.append("no text")

    if guid_count > 0:
        detail_parts.append(f"{len(guid_set)} GUIDs")

    # ── Composition checks (visual issues not caught by entity counts) ──
    composition_warns = []
    is_plan = 'FLOOR' in view_type or 'PLAN' in view_type
    is_elev = 'ELEV' in view_type

    if width_mm > 0 and height_mm > 0 and geo_w > 0:
        fill_ratio = (geo_w * geo_h) / (width_mm * height_mm)
        if fill_ratio < 0.20:
            composition_warns.append(
                f"Building occupies {fill_ratio*100:.0f}% of drawing — "
                f"annotations dominate, building too small")

    if is_elev:
        # Check for excessive empty space below ground line
        grd_y = 0  # GRD. LEVEL at y=0 in model space
        below_grd = abs(min_y - grd_y) if min_y < grd_y else 0
        total_v = height_mm
        _tpl = _load_template()
        grd_thresh = _tpl.get('elevation', {}).get('ground_threshold_ratio', 0.25)
        if total_v > 0 and below_grd / total_v > grd_thresh:
            composition_warns.append(
                f"Empty space below ground: {below_grd:.0f}mm = "
                f"{below_grd/total_v*100:.0f}% of drawing height")

        # Check if building is less than 40% of vertical extent
        if geo_h > 0 and geo_h / total_v < 0.40:
            composition_warns.append(
                f"Building height {geo_h:.0f}mm = "
                f"{geo_h/total_v*100:.0f}% of drawing height — "
                f"grid+dim overhead squeezes building")

    if is_plan and geo_h > geo_w * 2.5:
        composition_warns.append(
            f"Building aspect {geo_w/1000:.1f}x{geo_h/1000:.1f}m — "
            f"multi-storey overlap? Consider per-storey plans")

    if composition_warns:
        _log(f"    ── Composition Warnings ──")
        for w in composition_warns:
            _log(f"      !! {w}")

    ok = has_geometry and text_ok
    _VERDICTS.append((view_type, ok, ", ".join(detail_parts)))

    # ── TBLKLTN completeness check (post-process) ──
    # Reads 2D_metadata.db as the reference spec for a professional drawing.
    # Compares DXF actual counts against metadata-defined expectations.
    # Like Rosetta Stone: expected vs actual, quantitative, per feature.
    _log(f"    ── TBLKLTN Completeness (vs 2D.db) ──")
    is_plan = 'FLOOR' in view_type
    is_roof = 'ROOF' in view_type
    is_elev = 'ELEV' in view_type
    text_strs = [e[0] for e in text_entries]

    # Read metadata reference counts
    meta = _read_metadata_ref()

    features = []  # (name, have: bool, actual, expected_desc)
    if is_plan:
        n_poly = counts.get('LWPOLYLINE', 0)
        n_grid = counts.get('LINE', 0)
        n_circ = counts.get('CIRCLE', 0)
        n_furn = sum(1 for e in msp if e.dxftype() == 'LWPOLYLINE'
                     and e.dxf.layer == 'A-FURN')
        n_arcs = sum(1 for e in msp if e.dxftype() == 'ARC'
                     and e.dxf.layer == 'A-DOOR')
        n_wall_fill = sum(1 for e in msp if e.dxf.layer == 'A-WALL-PATT'
                          and e.dxftype() in ('HATCH', 'LWPOLYLINE', 'SOLID'))
        n_ttlb_texts = sum(1 for e in msp if e.dxftype() == 'TEXT'
                           and e.dxf.layer == 'A-TTLB')
        n_scalebar = sum(1 for e in msp if e.dxftype() == 'SOLID'
                         and e.dxf.layer == 'A-ANNO-DIMS')
        has_north = any(t == 'N' for t in text_strs)
        dim_texts = [t for t in text_strs if t.isdigit() and len(t) >= 3]
        tag_texts = [t for t in text_strs
                     if t.startswith(('D', 'W')) and any(c.isdigit() for c in t)]
        grid_labels_found = [t for t in text_strs if len(t) == 1 and (t.isalpha() or t.isdigit())]
        features = [
            ("Wall section polylines",   n_poly > 5,          str(n_poly),     ">5 from section cut"),
            ("Grid lines",               n_grid >= 2,         str(n_grid),     f"≥2 per {meta['grid_axes']} axes"),
            ("Grid bubbles",             n_circ >= 2,         str(n_circ),     f"2× per grid line, r={meta['bubble_r']}mm"),
            ("Grid labels",              len(grid_labels_found) >= 4,
                                                              f"{len(grid_labels_found)} ({','.join(sorted(set(grid_labels_found)))})",
                                                              f"A-{meta['grid_alpha_max']}, 1-{meta['grid_num_max']}"),
            ("GUID xdata",               guid_count >= 5,     str(guid_count), f"≥5 ARC elements"),
            ("Furniture bboxes",          n_furn > 0,          str(n_furn),     "1 per BELOW element"),
            ("Bay dimensions",            len(dim_texts) >= 2,
                                                              str(len(dim_texts)), "1 per grid bay"),
            ("Room labels",               any(t in meta['room_types'] for t in text_strs)
                                          or any('RUANG' in t or 'BILIK' in t for t in text_strs),
                                                              str(sum(1 for t in text_strs if 'RUANG' in t or 'BILIK' in t)),
                                                              f"need: {', '.join(meta['room_types'][:5])}"),
            ("Room areas (m²)",           any('m²' in t or 'm2' in t for t in text_strs),
                                                              str(sum(1 for t in text_strs if 'm²' in t)),
                                                              "per room from spatial data"),
            ("Door swing arcs",           n_arcs >= 3,         str(n_arcs),
                                                              f"{meta['door_symbols']} symbols in 2d_drawing_symbol"),
            ("Wall fill / hatch",         n_wall_fill >= 5,    str(n_wall_fill),
                                                              f"{meta['wall_styles']} styles in 2d_drawing_style"),
            ("Door/window tags",          len(tag_texts) >= 3,
                                                              str(len(tag_texts)), f"tags: {meta['tag_types']}"),
            ("North arrow",               has_north,           "yes" if has_north else "no",
                                                              "NORTH_ARROW in 2d_drawing_symbol"),
            ("Drawing title",             any('PLAN' in t.upper() or 'PELAN' in t.upper() for t in text_strs),
                                                              "yes",           f"'{meta['plan_title']}'"),
            ("Title block",               n_ttlb_texts >= 5,   str(n_ttlb_texts),
                                                              f"{meta['title_fields']} fields in 2d_title_block"),
            ("Scale bar",                 n_scalebar >= 2,     str(n_scalebar),
                                                              "standard bar 0-1-2-5m"),
            ("JKR logo (IMAGE entity)",   counts.get('IMAGE', 0) >= 1,
                                                              str(counts.get('IMAGE', 0)),
                                                              "jkr.png raster in title block"),
        ]
    elif is_elev:
        face_key = view_type.split()[-1].lower() if len(view_type.split()) > 1 else 'front'
        elev_title = meta.get(f'elev_{face_key}_title', f'{face_key.upper()} ELEVATION')
        n_solid = counts.get('SOLID', 0)
        # Level label texts: code renders "GRD. LVL  ±N.NNN" — check for LVL or LEVEL in text
        level_labels = [t for t in text_strs if 'LVL' in t or 'LEVEL' in t]
        grid_labels_found = [t for t in text_strs if len(t) == 1 and (t.isalpha() or t.isdigit())]
        has_glaz_poly = any(e.dxf.layer == 'A-GLAZ' for e in msp if e.dxftype() == 'LWPOLYLINE')
        has_louvre = (not has_glaz_poly) or any(e.dxf.layer == 'A-GLAZ'
                                                 for e in msp if e.dxftype() == 'LINE')
        has_roof_sil = any(e.dxf.layer == 'A-ROOF' for e in msp if e.dxftype() == 'LWPOLYLINE')
        has_grd_line = any(e.dxf.layer == 'A-ELEV-LEVL' for e in msp if e.dxftype() == 'LINE')
        # Bay dims rendered as LINE+TEXT (not DIMENSION entities)
        elev_dim_texts = [t for t in text_strs if t.isdigit() and len(t) >= 3]
        n_ttlb_elev = sum(1 for e in msp if e.dxftype() == 'TEXT' and e.dxf.layer == 'A-TTLB')
        features = [
            ("Element outlines",          counts.get('LWPOLYLINE', 0) >= 3,
                                                              str(counts.get('LWPOLYLINE', 0)), "walls+doors+windows"),
            ("Grid lines",                counts.get('LINE', 0) >= 3,
                                                              str(counts.get('LINE', 0)), "1 per grid on face"),
            ("Grid bubbles",              counts.get('CIRCLE', 0) >= 2,
                                                              str(counts.get('CIRCLE', 0)), "1 per grid"),
            ("Grid labels",               len(grid_labels_found) >= 2,
                                                              f"{len(grid_labels_found)} ({','.join(sorted(set(grid_labels_found)))})",
                                                              "matching grid axis"),
            ("Level markers (tick)",       counts.get('LINE', 0) >= 3,
                                                              str(counts.get('LINE', 0)), f"≥{meta['level_count']} 45° ticks, A-ELEV-LEVL"),
            ("Level labels",              len(level_labels) >= 3,
                                                              f"{len(level_labels)} ({', '.join(level_labels[:3])}...)",
                                                              f"{meta['level_count']} from ad_level_marker"),
            ("Bay dimensions",            len(elev_dim_texts) > 0,
                                                              str(len(elev_dim_texts)), "1 per grid bay (LINE+TEXT)"),
            ("Ground line",               has_grd_line,        "yes" if has_grd_line else "no", "A-ELEV-LEVL layer"),
            ("Window louvres",            has_louvre,           "yes" if has_louvre else "no",  "A-GLAZ layer lines"),
            ("Roof silhouette",           has_roof_sil,        "yes" if has_roof_sil else "no", "A-ROOF layer polyline"),
            ("Drawing title",             any(face_key.upper() in t.upper() for t in text_strs),
                                                              "yes" if any(face_key.upper() in t.upper() for t in text_strs) else "no",
                                                              f"'{elev_title}'"),
            ("Title block",               n_ttlb_elev >= 5,    str(n_ttlb_elev),
                                                              f"{meta['title_fields']} fields in 2d_title_block"),
            ("JKR logo (IMAGE entity)",   counts.get('IMAGE', 0) >= 1,
                                                              str(counts.get('IMAGE', 0)),
                                                              "jkr.png raster in title block"),
        ]
    elif is_roof:
        # §5.3: Roof plan features — excludes floor-plan-only checks (rooms, furniture, doors)
        n_poly_r = counts.get('LWPOLYLINE', 0)
        n_circ_r = counts.get('CIRCLE', 0)
        has_roof_outline = any(e.dxf.layer in ('A-ROOF', 'A-WALL')
                               for e in msp if e.dxftype() == 'LWPOLYLINE')
        # Ridge can be text ('RIDGE','RABUNG','ROOF LEVEL','EAVE') or A-ROOF LINE (dashed ridge)
        has_ridge_line = any(e.dxf.layer == 'A-ROOF' for e in msp if e.dxftype() == 'LINE')
        has_ridge = (any('RIDGE' in t or 'RABUNG' in t or 'EAVE' in t for t in text_strs)
                     or has_ridge_line)
        # Flat roof: no ridge expected — pass automatically if "FLAT ROOF"/"BUMBUNG" present
        has_flat_marker = any('FLAT' in t or 'BUMBUNG' in t for t in text_strs)
        if has_flat_marker:
            has_ridge = True
        dim_texts_r = [t for t in text_strs if t.isdigit() and len(t) >= 3]
        grid_labels_r = [t for t in text_strs if len(t) == 1 and (t.isalpha() or t.isdigit())]
        n_ttlb_r = sum(1 for e in msp if e.dxftype() == 'TEXT' and e.dxf.layer == 'A-TTLB')
        has_north_r = any(t == 'N' for t in text_strs)
        features = [
            ("Roof outline",              has_roof_outline,    str(n_poly_r),   "§5.3 hull LWPOLYLINE A-ROOF/A-WALL"),
            ("Grid lines",                counts.get('LINE', 0) >= 2,
                                                              str(counts.get('LINE', 0)), "dash-dot grids"),
            ("Grid bubbles",              n_circ_r >= 2,       str(n_circ_r),   "1 per grid line"),
            ("Grid labels",               len(grid_labels_r) >= 2,
                                                              f"{len(grid_labels_r)} ({','.join(sorted(set(grid_labels_r)))})",
                                                              "A–D / 1–3"),
            ("Bay dimensions",            len(dim_texts_r) >= 2,
                                                              str(len(dim_texts_r)), "1 per grid bay"),
            ("Ridge/label text",          has_ridge,           "yes" if has_ridge else "no",
                                                              "RIDGE from 2d_level_marker"),
            ("North arrow",               has_north_r,         "yes" if has_north_r else "no",
                                                              "NORTH_ARROW in 2d_drawing_symbol"),
            ("Drawing title",             any('ROOF' in t.upper() for t in text_strs),
                                                              "yes" if any('ROOF' in t.upper() for t in text_strs) else "no",
                                                              "'ROOF PLAN'"),
            ("Title block",               n_ttlb_r >= 5,       str(n_ttlb_r),
                                                              f"{meta['title_fields']} fields in 2d_title_block"),
            ("JKR logo (IMAGE entity)",   counts.get('IMAGE', 0) >= 1,
                                                              str(counts.get('IMAGE', 0)),
                                                              "jkr.png raster in title block"),
        ]

    have = sum(1 for _, h, _, _ in features if h)
    for name, present, actual, expected in features:
        tag = "HAVE" if present else "MISS"
        _log(f"      [{tag}] {name}: actual={actual}, ref={expected}")
    pct = have * 100 // len(features) if features else 0
    _log(f"    Score: {have}/{len(features)} features ({pct}%)")
    if _VERDICTS and _VERDICTS[-1][0] == view_type:
        v, o, d = _VERDICTS[-1]
        _VERDICTS[-1] = (v, o, d + f", completeness {have}/{len(features)} ({pct}%)")


def _read_metadata_ref() -> dict:
    """Read 2D.db (2d_* tables) and return reference counts for TBLKLTN comparison.
    This is the spec's truth — what a professional drawing must have."""
    meta_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                             '..', 'lib', 'input', '2D.db')
    ref = {
        'grid_axes': 2, 'bubble_r': 4.0,
        'grid_alpha_max': 'D', 'grid_num_max': '3',
        'room_types': [], 'door_symbols': 0, 'wall_styles': 0,
        'tag_types': '', 'plan_title': 'FLOOR PLAN',
        'title_fields': 0, 'level_count': 0,
    }
    if not os.path.exists(meta_path):
        _log(f"    (2D.db not found at {meta_path})")
        return ref
    try:
        conn = sqlite3.connect(meta_path)
        cur = conn.cursor()
        # Room labels
        cur.execute("SELECT DISTINCT label_text FROM [2d_room_label] WHERE language='EN'")
        ref['room_types'] = [r[0] for r in cur.fetchall()]
        # Door/window symbols
        cur.execute("SELECT COUNT(*) FROM [2d_drawing_symbol] WHERE view_type='PLAN' "
                    "AND (symbol_code LIKE 'DOOR%' OR symbol_code LIKE 'WINDOW%')")
        ref['door_symbols'] = cur.fetchone()[0]
        # Wall styles
        cur.execute("SELECT COUNT(*) FROM [2d_drawing_style] WHERE view_type='PLAN' "
                    "AND element_match LIKE '%Wall%'")
        ref['wall_styles'] = cur.fetchone()[0]
        # Annotation tags
        cur.execute("SELECT tag_prefix FROM [2d_annotation_tag]")
        ref['tag_types'] = ', '.join(r[0] for r in cur.fetchall())
        # Drawing titles
        cur.execute("SELECT drawing_title FROM [2d_drawing_type] WHERE drawing_code='FLOOR_PLAN'")
        row = cur.fetchone()
        if row: ref['plan_title'] = row[0]
        for face in ('front', 'rear', 'left', 'right'):
            cur.execute("SELECT drawing_title FROM [2d_drawing_type] WHERE drawing_code=?",
                        (f'{face.upper()}_ELEV',))
            row = cur.fetchone()
            if row: ref[f'elev_{face}_title'] = row[0]
        # Title block
        cur.execute("SELECT COUNT(*) FROM [2d_title_block]")
        ref['title_fields'] = cur.fetchone()[0]
        # Level markers
        cur.execute("SELECT COUNT(*) FROM [2d_level_marker]")
        ref['level_count'] = cur.fetchone()[0]
        # Grid style
        cur.execute("SELECT bubble_radius FROM [2d_grid_style] LIMIT 1")
        row = cur.fetchone()
        if row: ref['bubble_r'] = row[0]
        conn.close()
    except Exception as e:
        _log(f"    (2D.db read failed: {e})")
    return ref


def _read_2d_db_levels() -> dict:
    """Read level markers and reference elevations from 2D.db.
    Returns dict with 'level_labels' mapping (code→display_text),
    'level_elevations' mapping (code→z), and 'roof_labels' dict."""
    result = {
        'level_labels': {},     # e.g. 'FFL' → 'GRD. FLOOR LEVEL'
        'level_elevations': {}, # e.g. 'GRD' → -0.15
        'roof_labels': {'ridge': 'RABUNG / RIDGE', 'eave': 'CUCURAN / EAVE'},
    }
    for try_path in [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'input', '2D.db'),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib', 'input', '2D.db'),
    ]:
        if os.path.exists(try_path):
            try:
                conn = sqlite3.connect(try_path)
                cur = conn.cursor()
                cur.execute("SELECT level_code, display_text, typical_z FROM [2d_level_marker]")
                for code, text, z in cur.fetchall():
                    # Map DB codes to detect_levels() codes
                    key = code.replace('_LEVEL', '').replace('_FLOOR', '')
                    if 'GRD_FLOOR' in code or 'GRD_FLOOR' in code:
                        key = 'FFL'
                    elif 'GRD' in code:
                        key = 'GRD'
                    elif 'APRON' in code:
                        key = 'APRON'
                    elif 'BEAM' in code or 'CEILING' in code:
                        key = 'CLG'
                    elif 'ROOF' in code or 'RIDGE' in code:
                        key = 'RIDGE'
                    elif 'SILL' in code:
                        key = 'SILL'
                    elif 'HEAD' in code:
                        key = 'HEAD'
                    elif 'EAVE' in code:
                        key = 'EAVE'
                    elif 'FIRST' in code:
                        key = 'CLG'
                    result['level_labels'][key] = text
                    result['level_elevations'][key] = z
                # Read roof labels from 2d_drawing_part if available
                try:
                    cur.execute("SELECT part_code, description FROM [2d_drawing_part] "
                                "WHERE part_code IN ('RIDGE_LINE','ROOF_OUTLINE')")
                    for pc, desc in cur.fetchall():
                        if 'RIDGE' in pc:
                            result['roof_labels']['ridge'] = result['level_labels'].get('RIDGE', 'RABUNG / RIDGE')
                        # eave stays as default
                except Exception:
                    pass
                conn.close()
                _log(f"§3.2 2D.db: {len(result['level_labels'])} level markers loaded")
            except Exception as e:
                _log(f"§3.2 2D.db read failed: {e}")
            break
    return result


def _read_2d_db_title() -> list:
    """Read 2d_title_block rows from 2D.db.
    Returns list of dicts: field_name, label_text, field_order,
    label_size, value_size, is_required, default_value."""
    rows = []
    for try_path in [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'input', '2D.db'),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib', 'input', '2D.db'),
    ]:
        if os.path.exists(try_path):
            try:
                conn = sqlite3.connect(try_path)
                conn.row_factory = sqlite3.Row
                cur = conn.cursor()
                cur.execute(
                    "SELECT field_name, label_text, field_order, "
                    "label_size, value_size, is_required, default_value "
                    "FROM [2d_title_block] WHERE profile_id='JKR_Malaysian' "
                    "ORDER BY field_order"
                )
                rows = [dict(r) for r in cur.fetchall()]
                conn.close()
                _log(f"§3.2 2D.db: {len(rows)} title block rows loaded")
            except Exception as e:
                _log(f"§3.2 2d_title_block read failed: {e}")
            break
    return rows


# ─────────────────────────────────────────────────────────────────
# DXF→PROOF RENDERER (§10.0 R6, R7)
# Reads DXF entities back and renders to paper-scale SVG/PNG.
# Bypasses ezdxf rendering — writes SVG directly from entity data.
# ─────────────────────────────────────────────────────────────────

# ACI color index → hex
_ACI_HEX = {
    0: '#000000', 1: '#FF0000', 2: '#FFFF00', 3: '#00FF00',
    4: '#00FFFF', 5: '#0000FF', 6: '#FF00FF', 7: '#000000',
    8: '#888888', 9: '#AAAAAA', 254: '#CCCCCC',
}


def _render_proof(dxf_path: str, svg_path: str, png_path: str = None):
    """Read DXF, transform to paper-scale, write SVG. §9.6 R1: SVG only."""
    doc = ezdxf.readfile(dxf_path)
    msp = doc.modelspace()
    tpl = _load_template()
    sc = int(tpl.get('paper', {}).get('scale', '1:100').split(':')[1])

    # §proof_render: template-driven visibility — separation of concern
    proof_cfg = tpl.get('proof_render', {})
    _SKIP_ENTITY_TYPES = set(proof_cfg.get('skip_entity_types', ['HATCH']))
    _SKIP_PROOF_LAYERS = set(proof_cfg.get('skip_layers', ['A-WALL-FULL']))
    _FURN_FILL = proof_cfg.get('furniture_fill', 'none')
    _BOLD_MIN_H = proof_cfg.get('bold_text_min_height_mm', 3.0)  # paper mm threshold for bold

    # §proof_render: Use paper boundary (layer '0' background rect) as the canvas.
    # This prevents level markers / grid extensions from expanding the SVG beyond
    # the intended paper size (seen on wide buildings like DX LEFT elevation).
    _SKIP_LAYERS = {'0'} | _SKIP_PROOF_LAYERS  # skip background + template-driven layers
    paper_x0 = paper_y0 = float('inf')
    paper_x1 = paper_y1 = float('-inf')
    for e in msp:
        if e.dxf.layer == '0' and e.dxftype() == 'LWPOLYLINE':
            for pt in e.get_points(format='xy'):
                paper_x0 = min(paper_x0, pt[0]); paper_y0 = min(paper_y0, pt[1])
                paper_x1 = max(paper_x1, pt[0]); paper_y1 = max(paper_y1, pt[1])

    # Fallback: derive paper extent from geometry entities if no bg rect found
    if paper_x0 == float('inf'):
        for e in msp:
            if e.dxf.layer in _SKIP_LAYERS:
                continue
            if e.dxftype() == 'LWPOLYLINE':
                for pt in e.get_points(format='xy'):
                    paper_x0 = min(paper_x0, pt[0]); paper_y0 = min(paper_y0, pt[1])
                    paper_x1 = max(paper_x1, pt[0]); paper_y1 = max(paper_y1, pt[1])
        pad = max(paper_x1 - paper_x0, paper_y1 - paper_y0) * 0.03
        paper_x0 -= pad; paper_y0 -= pad; paper_x1 += pad; paper_y1 += pad

    gx0, gy0, gx1, gy1 = paper_x0, paper_y0, paper_x1, paper_y1

    # Paper-space transform: model mm → paper mm (based on paper boundary, not entity extents)
    pw = (gx1 - gx0) / sc
    ph = (gy1 - gy0) / sc
    ox = -gx0 / sc  # offset so gx0 maps to x=0
    oy = gy1 / sc    # offset so gy1 maps to y=0 (Y flip)

    def px(mx): return mx / sc + ox
    def py(my): return -my / sc + oy

    # Layer → color/weight/linetype mapping from DXF layers
    layer_colors = {}
    layer_weights = {}
    layer_linetypes = {}
    for layer in doc.layers:
        aci = layer.color
        layer_colors[layer.dxf.name] = _ACI_HEX.get(aci, '#000000')
        # DXF lineweight is in 1/100 mm; -1 = default
        lw = getattr(layer.dxf, 'lineweight', -1)
        layer_weights[layer.dxf.name] = max(lw, 18) / 100.0  # mm
        layer_linetypes[layer.dxf.name] = getattr(layer.dxf, 'linetype', 'CONTINUOUS')

    # §proof_render: override layer colors from template (exact hex, no ACI roundtrip loss)
    # ACI is lossy: #4488CC → ACI5 → #0000FF. Template is the authoritative source.
    tpl_colors = tpl.get('colors', {})
    _TPL_LAYER_COLORS = {
        'A-WALL-FULL': tpl_colors.get('wall',      '#000000'),
        'A-WALL-PRTN': tpl_colors.get('wall',      '#000000'),
        'A-WALL-PATT': tpl_colors.get('wall',      '#000000'),
        'A-GLAZ':      tpl_colors.get('glass',     '#4488CC'),
        'A-DOOR':      tpl_colors.get('wall',      '#000000'),
        'A-FURN':      tpl_colors.get('furniture', '#AAAAAA'),
        'A-GRID':      tpl_colors.get('grid',      '#888888'),
        'A-ANNO-DIMS': tpl_colors.get('dimension', '#000000'),
        'A-ANNO-TEXT': tpl_colors.get('dimension', '#000000'),
        'A-ELEV-WALL': tpl_colors.get('wall',      '#000000'),
        'A-ELEV-LEVL': tpl_colors.get('dimension', '#000000'),
        'A-ROOF':      tpl_colors.get('wall',      '#000000'),
        'A-TTLB':      tpl_colors.get('wall',      '#000000'),
    }
    layer_colors.update(_TPL_LAYER_COLORS)

    # §4.5: DASHDOT → stroke-dasharray [4,1,1,1] in paper mm
    # Values are already paper-mm — no scaling needed (px/py handles model→paper)
    def _dasharray(layer_name, entity=None):
        # Check entity-level linetype first, then layer
        lt = 'CONTINUOUS'
        if entity:
            elt = getattr(entity.dxf, 'linetype', None)
            if elt and elt != 'ByLayer' and elt != 'BYLAYER':
                lt = elt
            else:
                lt = layer_linetypes.get(layer_name, 'CONTINUOUS')
        else:
            lt = layer_linetypes.get(layer_name, 'CONTINUOUS')
        if lt == 'DASHDOT':
            return ' stroke-dasharray="4,1,1,1"'
        if lt in ('HIDDEN', 'DASHED'):
            return ' stroke-dasharray="6,2"'
        if lt == 'CENTER':
            return ' stroke-dasharray="8,2,2,2"'
        if lt == 'DOT':
            return ' stroke-dasharray="1,1"'
        return ''

    svg_lines = []
    svg_lines.append(f'<?xml version="1.0" encoding="UTF-8"?>')
    svg_lines.append(f'<svg xmlns="http://www.w3.org/2000/svg" '
                     f'viewBox="0.00 0.00 {pw:.2f} {ph:.2f}" '
                     f'width="{int(pw*3)}" height="{int(ph*3)}" '
                     f'style="background:#FFFFFF">')
    # §proof_render guard: clipPath at paper boundary — no entity can bleed outside
    svg_lines.append(f'<defs>')
    svg_lines.append(f'  <style>text {{ font-family: "Arial", "Helvetica", sans-serif; }}</style>')
    svg_lines.append(f'  <clipPath id="paper"><rect x="0" y="0" width="{pw:.2f}" height="{ph:.2f}"/></clipPath>')
    svg_lines.append(f'</defs>')
    # §10.0 R5: explicit white background rect
    svg_lines.append(f'<rect width="100%" height="100%" fill="#FFFFFF"/>')
    svg_lines.append(f'<g clip-path="url(#paper)">')

    # Render each entity
    for e in msp:
        layer = e.dxf.layer
        if layer in _SKIP_LAYERS:
            continue
        # §proof_render: skip DXF-only entity types (e.g. HATCH = CAD fill only)
        if e.dxftype() in _SKIP_ENTITY_TYPES:
            continue
        color = layer_colors.get(layer, '#000000')
        weight = layer_weights.get(layer, tpl.get('line_weights', {}).get('fallback', 0.18))
        # Override color from entity if set
        ec = getattr(e.dxf, 'color', 256)
        if ec != 256 and ec in _ACI_HEX:
            color = _ACI_HEX[ec]
        # Override lineweight from entity if set
        elw = getattr(e.dxf, 'lineweight', -1)
        if elw > 0:
            weight = elw / 100.0

        if e.dxftype() == 'LWPOLYLINE':
            pts = list(e.get_points(format='xy'))
            if len(pts) < 2:
                continue
            points_str = ' '.join(f'{px(p[0]):.3f},{py(p[1]):.3f}' for p in pts)
            is_closed = e.closed  # e.close is a method; e.closed is the boolean
            fill = 'none'
            # Wall fill layer: solid black fill
            if layer == 'A-WALL-PATT':
                fill = '#000000'
                color = '#000000'
            elif layer == 'A-FURN':
                fill = _FURN_FILL  # §proof_render.furniture_fill from template
            # §I-26: open polylines use <polyline> (no auto-close); closed use <polygon>
            # §GUARD: for hull layers (A-ROOF), warn if closed polygon's first≠last
            # — closing a convex hull silhouette invents geometry not in the data
            if is_closed and layer == 'A-ROOF':
                if len(pts) >= 2:
                    _fp = (px(pts[0][0]), py(pts[0][1]))
                    _lp = (px(pts[-1][0]), py(pts[-1][1]))
                    _svg_gap = ((_fp[0]-_lp[0])**2 + (_fp[1]-_lp[1])**2)**0.5
                    if _svg_gap > 0.5:  # >0.5px gap → closing segment invents geometry
                        svg_lines.append(
                            f'<!-- §WARN A-ROOF polygon_invents_segment '
                            f'gap={_svg_gap:.2f}px first=({_fp[0]:.2f},{_fp[1]:.2f}) '
                            f'last=({_lp[0]:.2f},{_lp[1]:.2f}) '
                            f'fix: use close=False in DXF writer -->')
                svg_lines.append(
                    f'<polygon points="{points_str}" stroke="{color}" '
                    f'stroke-width="{weight:.3f}" fill="{fill}" '
                    f'stroke-linejoin="round"/>')
            else:
                svg_lines.append(
                    f'<polyline points="{points_str}" stroke="{color}" '
                    f'stroke-width="{weight:.3f}" fill="none" '
                    f'stroke-linejoin="round"/>')

        elif e.dxftype() == 'LINE':
            da = _dasharray(layer)
            svg_lines.append(
                f'<line x1="{px(e.dxf.start.x):.3f}" y1="{py(e.dxf.start.y):.3f}" '
                f'x2="{px(e.dxf.end.x):.3f}" y2="{py(e.dxf.end.y):.3f}" '
                f'stroke="{color}" stroke-width="{weight:.3f}"{da}/>')

        elif e.dxftype() == 'CIRCLE':
            svg_lines.append(
                f'<circle cx="{px(e.dxf.center.x):.3f}" cy="{py(e.dxf.center.y):.3f}" '
                f'r="{e.dxf.radius/sc:.3f}" stroke="{color}" '
                f'stroke-width="{weight:.3f}" fill="#FFFFFF"/>')

        elif e.dxftype() == 'ARC':
            cx, cy = px(e.dxf.center.x), py(e.dxf.center.y)
            r = e.dxf.radius / sc
            sa = math.radians(e.dxf.start_angle)
            ea = math.radians(e.dxf.end_angle)
            # SVG arc: Y is flipped, so negate angles
            x1 = cx + r * math.cos(sa)
            y1 = cy - r * math.sin(sa)
            x2 = cx + r * math.cos(ea)
            y2 = cy - r * math.sin(ea)
            # Determine sweep
            da = (e.dxf.end_angle - e.dxf.start_angle) % 360
            large = 1 if da > 180 else 0
            svg_lines.append(
                f'<path d="M {x1:.3f},{y1:.3f} A {r:.3f},{r:.3f} 0 {large},0 '
                f'{x2:.3f},{y2:.3f}" stroke="{color}" '
                f'stroke-width="{weight:.3f}" fill="none"/>')

        elif e.dxftype() == 'TEXT':
            txt = e.dxf.text
            h = e.dxf.height / sc
            ix = px(e.dxf.insert.x)
            iy = py(e.dxf.insert.y)
            rot = getattr(e.dxf, 'rotation', 0)
            anchor = 'middle'
            # Check alignment
            align = e.get_align_enum() if hasattr(e, 'get_align_enum') else None
            if align and 'CENTER' in str(align):
                anchor = 'middle'
                try:
                    ap = e.dxf.align_point
                    ix, iy = px(ap.x), py(ap.y)
                except Exception:
                    pass
            transform = ''
            if rot:
                transform = f' transform="rotate({-rot},{ix:.3f},{iy:.3f})"'
            fw = ' font-weight="bold"' if h >= _BOLD_MIN_H else ''
            svg_lines.append(
                f'<text x="{ix:.3f}" y="{iy:.3f}" font-size="{h:.2f}" '
                f'fill="{color}" text-anchor="{anchor}" '
                f'dominant-baseline="central"{fw}{transform}>'
                f'{txt.replace("&","&amp;").replace("<","&lt;")}</text>')

        elif e.dxftype() == 'SOLID':
            # Filled quadrilateral (scale bar segments, level markers)
            pts = []
            for attr in ('vtx0', 'vtx1', 'vtx2', 'vtx3'):
                v = getattr(e.dxf, attr, None)
                if v:
                    pts.append((px(v.x), py(v.y)))
            if len(pts) >= 3:
                # SOLID vertex order: 0,1,3,2 (not 0,1,2,3)
                if len(pts) == 4:
                    pts = [pts[0], pts[1], pts[3], pts[2]]
                points_str = ' '.join(f'{p[0]:.3f},{p[1]:.3f}' for p in pts)
                fill_c = _ACI_HEX.get(ec, '#000000') if ec != 256 else color
                svg_lines.append(
                    f'<polygon points="{points_str}" fill="{fill_c}" '
                    f'stroke="{fill_c}" stroke-width="0.1"/>')

        elif e.dxftype() == 'DIMENSION':
            # Dimension entities are complex; skip for now (bay dims
            # rendered as LINE+TEXT entities in floor plan)
            pass

    svg_lines.append('</g>')  # close clip-path group
    svg_lines.append('</svg>')
    svg_str = '\n'.join(svg_lines)

    with open(svg_path, 'w') as f:
        f.write(svg_str)

    # §9.6 R1: SVG proof only, no PNG


_VERDICTS: List[Tuple[str, bool, str]] = []  # (view, pass, detail)

def _write_log(out_dir: str):
    """Flush buffered log lines + summary to a diagnostic text file."""
    if not _LOG_LINES:
        return
    log_path = os.path.join(out_dir, 'dxf_diagnostic.txt')
    stamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Build summary
    summary = []
    summary.append("")
    summary.append("=" * 60)
    summary.append("SUMMARY — read this section only")
    summary.append("=" * 60)
    n_pages = len(_VERDICTS)
    passes = sum(1 for _, ok, _ in _VERDICTS if ok)
    fails  = sum(1 for _, ok, _ in _VERDICTS if not ok)
    summary.append(f"Pages processed: {n_pages}")
    summary.append("")
    for view, ok, detail in _VERDICTS:
        tag = "PASS" if ok else "FAIL"
        summary.append(f"  [{tag}] {view}: {detail}")
    summary.append("")
    if fails == 0:
        summary.append(f"RESULT: ALL {passes}/{n_pages} VIEWS PASS — spec tests passed")
    else:
        summary.append(f"RESULT: {fails} FAIL / {passes} PASS out of {n_pages} pages — fix failures first")
    summary.append("  !! STILL OPEN: inspect SVG/DXF visually — tests prove spec compliance, NOT visual correctness !!")
    summary.append("  !! Problems visible in SVG but not caught by tests must be added to OPEN_ISSUES.txt !!")
    summary.append("SCRIPT AUTO-DELETED OLDER GENERATIONS — only 2 kept per view (DXF + SVG)")

    # Permanent open issues — printed every run until the file is empty
    _issues_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                                'OPEN_ISSUES.txt')
    if os.path.exists(_issues_path):
        with open(_issues_path) as _f:
            issues = [l.rstrip() for l in _f if l.strip() and not l.startswith('#')]
        if issues:
            summary.append("")
            summary.append("!! OPEN ISSUES — still unresolved (edit OPEN_ISSUES.txt to clear) !!")
            for iss in issues:
                summary.append(f"  {iss}")

    with open(log_path, 'w') as f:
        f.write(f"DXF Diagnostic — {stamp}\n")
        f.write("=" * 60 + "\n\n")
        for line in _LOG_LINES:
            f.write(line + "\n")
        for line in summary:
            f.write(line + "\n")

    # Print summary to console too
    for line in summary:
        print(line)
    print(f"  Diagnostic log → {log_path}")


# ─────────────────────────────────────────────────────────────────
# FLOOR PLAN
# ─────────────────────────────────────────────────────────────────

_STOREY_CODES = ['GF', 'FF', '2F', '3F', '4F', '5F']
_STOREY_TITLES = {
    'GF': 'GROUND FLOOR PLAN',
    'FF': 'FIRST FLOOR PLAN',
    '2F': '2ND FLOOR PLAN',
    '3F': '3RD FLOOR PLAN',
    '4F': '4TH FLOOR PLAN',
    '5F': '5TH FLOOR PLAN',
}


def _detect_floor_storeys(db_path: str) -> list:
    """Return [(name, floor_z)] for habitable storeys sorted by elevation.

    Excludes Roof, T/FDN and any storey that contains only structural elements
    (no walls/doors/windows/furniture). Spec §E storey_filter.
    """
    conn = sqlite3.connect(db_path)
    rows = conn.execute("""
        SELECT m.storey, MIN(r.minZ) AS floor_z
        FROM elements_meta m
        JOIN elements_rtree r ON m.id = r.id
        WHERE m.storey IS NOT NULL
          AND m.ifc_class IN ('IfcWall', 'IfcWallStandardCase', 'IfcPlate',
                               'IfcDoor', 'IfcWindow', 'IfcFurnishingElement')
        GROUP BY m.storey
        ORDER BY floor_z
    """).fetchall()
    conn.close()
    # Exclude storeys whose name suggests non-habitable levels
    excluded = {'Roof', 'T/FDN', 'Unknown'}
    return [(r[0], float(r[1])) for r in rows if r[0] not in excluded]


def write_floor_plan_dxf(db_path: str, out_dxf: str, scale: int = SCALE,
                         storey_name: str = None, storey_floor_z: float = 0.0,
                         drawing_title: str = 'FLOOR PLAN', drawing_no: str = 'A-01'):
    """Generate floor plan DXF from compiled output.db.

    Coordinates in model-space mm (no PAPER_FACTOR).
    Spec: 2D_ARCHITECTURAL_LAYOUT.md §5.1, §2 Process
    """
    # §16.2: start per-view log (storey suffix for multi-storey buildings)
    _suf = ('_' + storey_name.replace(' ', '').replace('/', '')) if storey_name else ''
    _start_view_log(f'FLOOR{_suf}')
    _log(f"§ENTRY write_floor_plan_dxf(db_path={db_path}, out_dxf={out_dxf}, scale={scale}, "
         f"storey_name={storey_name!r}, storey_floor_z={storey_floor_z})")
    _log(f"§I-27 floor plan title={drawing_title!r} sheet={drawing_no!r} storey={storey_name!r}")

    # ── §2 Step 1: LOAD TEMPLATE ──
    tpl = _load_template()
    tpl_paper = tpl.get('paper', {})
    tpl_grid  = tpl.get('grid', {})
    tpl_dims  = tpl.get('dimensions', {})
    tpl_tags  = tpl.get('annotation_tags', {})
    tpl_rooms = tpl.get('room_labels', {})
    tpl_na    = tpl.get('north_arrow', {})
    # §2.1: load 2D.db at Step 1 (not Step 6)
    meta = read_drawing_metadata()
    _log(f"§2.1 Template loaded: paper={tpl_paper.get('size','?')}, "
         f"scale={tpl_paper.get('scale','?')}, "
         f"line_weights={len(tpl.get('line_weights',{}))} entries, "
         f"2D.db={'loaded' if meta else 'not found'}")

    # §16.4: VALUE events for all governing constants
    _log(f"§VALUE scale={scale} (from template)")
    _log(f"§VALUE paper_w={tpl_paper.get('width_mm', 420)}mm (from template.paper.width_mm)")
    _log(f"§VALUE tb_width={tpl_paper.get('title_block_width_mm', 120)}mm (from template.paper.title_block_width_mm)")
    _log(f"§VALUE grid_ext={tpl_grid.get('extend_beyond_building_mm', 20)}mm (from template.grid.extend_beyond_building_mm)")
    _log(f"§VALUE bubble_r={tpl_grid.get('bubble_radius_mm', 4.0)}mm (from template.grid.bubble_radius_mm)")
    _log(f"§VALUE tier1_offset={tpl_dims.get('tier_1_offset_mm', 12)}mm (from template.dimensions.tier_1_offset_mm)")
    _log(f"§VALUE tier2_offset={tpl_dims.get('tier_2_offset_mm', 6)}mm (from template.dimensions.tier_2_offset_mm)")
    _log(f"§VALUE cut_z={storey_floor_z + 1.2:.2f}m (floor_z={storey_floor_z:.2f}m + 1.2m per §5.1a)")
    _log(f"§VALUE crowding_threshold={tpl_grid.get('crowding_threshold_mm', 15.0)}mm (from template.grid.crowding_threshold_mm)")

    # Line weights from template §1 R4
    lw_wall_ext = _lw(tpl, 'wall_exterior_cut')   # 0.50mm → 50
    lw_wall_int = _lw(tpl, 'wall_partition_cut')   # 0.35mm → 35
    lw_opening  = _lw(tpl, 'window_frame')         # 0.25mm → 25
    lw_glass    = _lw(tpl, 'glass_glazing')        # 0.18mm → 18
    lw_furn     = _lw(tpl, 'furniture')             # 0.15mm → 15
    lw_dim      = _lw(tpl, 'dimension_line')        # 0.18mm → 18
    lw_grid     = _lw(tpl, 'grid_line')             # 0.18mm → 18

    # Text heights from template §7.3 (paper mm)
    txt_dim   = tpl_dims.get('text_height_mm', 2.5)
    txt_room  = tpl_rooms.get('name_font_height_mm', 3.5)
    txt_area  = tpl_rooms.get('area_font_height_mm', 2.5)
    txt_tag   = tpl_tags.get('font_height_mm', 2.0)
    txt_title = tpl.get('title_block', {}).get('font_height_value_mm', 3.0) * 1.5

    # Colors from template §8
    tpl_colors = tpl.get('colors', {})
    scale_color = _hex_to_aci(tpl_colors.get('scale_text', tpl_colors.get('grid', '')))

    # ── §2 Step 2: QUERY DB ──
    elements = read_elements(db_path)
    walls    = elements['walls']
    doors    = elements['doors']
    windows  = elements['windows']
    furniture = elements['furniture']
    columns  = [e for e in elements.get('other', []) if e.ifc_class == 'IfcColumn']
    _log(f"§2.2 DB loaded: {len(walls)} walls, {len(doors)} doors, "
         f"{len(windows)} windows, {len(furniture)} furniture, {len(columns)} columns")

    # §E storey_filter: restrict elements to target storey when generating per-storey plans
    if storey_name:
        def _is_target_storey(e):
            return not e.storey or e.storey == storey_name
        walls     = [e for e in walls     if _is_target_storey(e)]
        doors     = [e for e in doors     if _is_target_storey(e)]
        windows   = [e for e in windows   if _is_target_storey(e)]
        furniture = [e for e in furniture if _is_target_storey(e)]
        columns   = [e for e in columns   if _is_target_storey(e)]
        _log(f"§STOREY_FILTER storey={storey_name!r}: {len(walls)} walls, "
             f"{len(doors)} doors, {len(windows)} windows, "
             f"{len(furniture)} furniture after filter")

    if not walls:
        print("No walls — skipping floor plan DXF", file=sys.stderr)
        return

    doc = _new_doc(tpl, scale)
    doc.appids.new('BIMGUID')
    doc.appids.new('BIMSRC')
    msp = doc.modelspace()

    # ARC ifc_classes eligible for GUID xdata (roundtrip scope)
    _ARC_CLASSES = {'IfcWall', 'IfcWallStandardCase', 'IfcSlab',
                    'IfcDoor', 'IfcWindow', 'IfcPlate'}

    # §20: BIMSRC xdata counters
    n_bimsrc_wall = n_bimsrc_grid = n_bimsrc_dim = n_bimsrc_room = 0

    # ── §2 Step 5: SECTION CUT ──
    cut_z = storey_floor_z + 1.2  # spec §5.1: storey_elevation + 1.2m
    cut_results = run_section_cut(db_path, cut_z=cut_z)
    # §E storey_filter: after section cut, filter results to target storey
    # (prevents Level 1 walls — which straddle a Level 2 cut_z — appearing on Level 2 plan)
    if storey_name:
        cut_results = [es for es in cut_results
                       if not es.storey or es.storey == storey_name]
    n_cut   = sum(1 for es in cut_results if es.category == 'CUT')
    n_below = sum(1 for es in cut_results if es.category == 'BELOW')
    n_above = sum(1 for es in cut_results if es.category == 'ABOVE')
    _log(f"§2.5 Section cut Z={cut_z:.2f}m storey={storey_name or 'all'}: "
         f"{n_cut} CUT, {n_below} BELOW, {n_above} ABOVE")

    # §23 P0a: material lookup for hatch patterns
    _mat_conn = sqlite3.connect(db_path)
    _mat_cur = _mat_conn.cursor()
    _mat_cur.execute("SELECT guid, material_name FROM elements_meta "
                     "WHERE material_name IS NOT NULL AND material_name != ''")
    _material_by_guid = {r[0]: r[1] for r in _mat_cur.fetchall()}
    _mat_conn.close()
    _hatch_counts = {}  # pattern_name → count

    cut_count = 0
    lw_hatch = _lw(tpl, 'hatch_line')
    for es in cut_results:
        if es.category != 'CUT' or not es.contours:
            continue
        if es.ifc_class in ('IfcWall', 'IfcWallStandardCase'):
            layer = ('A-WALL-FULL'
                     if 'Ext' in (es.element_name or '')
                     else 'A-WALL-PRTN')
            lw = lw_wall_ext if 'Ext' in (es.element_name or '') else lw_wall_int
        elif es.ifc_class in ('IfcPlate',):
            layer, lw = 'A-GLAZ', lw_glass
        elif es.ifc_class == 'IfcDoor':
            layer, lw = 'A-DOOR', lw_opening
        elif es.ifc_class == 'IfcWindow':
            layer, lw = 'A-GLAZ', lw_opening
        elif es.ifc_class == 'IfcColumn':
            # §5.1b: IfcColumn — bold with gray fill, per 2d_drawing_style
            layer, lw = 'A-WALL-FULL', lw_wall_ext
        else:
            layer, lw = 'A-WALL-PRTN', lw_wall_int

        for contour in es.contours:
            pts = [(_mh(p[0]), _mh(p[1])) for p in contour.points]
            if len(pts) >= 2:
                # §5.1: Wall outline (stroke)
                pl = msp.add_lwpolyline(pts, close=True,
                                        dxfattribs={'layer': layer, 'lineweight': lw})
                if es.ifc_class in _ARC_CLASSES and es.guid:
                    pl.set_xdata('BIMGUID', [(1000, es.guid)])
                # §20.3.1: BIMSRC xdata on wall entities
                _set_bimsrc(pl, type='wall', ifc_class=es.ifc_class,
                            element_name=es.element_name or '',
                            storey=es.storey or '',
                            pos_x=float(es.bbox_2d[0]), pos_y=float(es.bbox_2d[1]))
                n_bimsrc_wall += 1
                # §5.1: Wall solid fill on A-WALL-PATT (SVG ref: fill=COL_WALL)
                # stroke-width must match wall weight (0.50 ext / 0.35 int) — archive uses 0.500
                if es.ifc_class in ('IfcWall', 'IfcWallStandardCase'):
                    msp.add_lwpolyline(pts, close=True,
                                       dxfattribs={'layer': 'A-WALL-PATT',
                                                   'lineweight': lw})
                    # §23 P0a: material-based hatch (Bonsai pattern or solid fallback)
                    _wall_mat = _material_by_guid.get(es.guid, '')
                    _used_pat = _add_wall_hatch(msp, pts, material_name=_wall_mat)
                    _hatch_counts[_used_pat or 'solid'] = _hatch_counts.get(
                        _used_pat or 'solid', 0) + 1
                _log(f"  WRITE wall guid={es.guid} layer={layer} pts={len(pts)}")
                cut_count += 1

    # §23 P0a: log hatch pattern summary
    _hatch_summary = ', '.join(f'{k}: {v} walls' for k, v in sorted(_hatch_counts.items()))
    _log(f"§HATCH {_hatch_summary}")

    # ── BELOW elements: bounding box on A-FURN ──
    # Skip structural/slab classes + MEP (I-11: MEP belongs on MEP pages only)
    _BELOW_SKIP = frozenset({'IfcSlab', 'IfcRoof', 'IfcFoundation', 'IfcFooting',
                             'IfcFlowTerminal', 'IfcFlowSegment', 'IfcFlowFitting',
                             'IfcFlowController'})
    for es in cut_results:
        if es.category != 'BELOW':
            continue
        if es.ifc_class in _BELOW_SKIP:
            continue
        bx0, by0, bx1, by1 = es.bbox_2d
        pts = [(_mh(bx0), _mh(by0)), (_mh(bx1), _mh(by0)),
               (_mh(bx1), _mh(by1)), (_mh(bx0), _mh(by1))]
        furn_pl = msp.add_lwpolyline(pts, close=True,
                           dxfattribs={'layer': 'A-FURN', 'lineweight': lw_furn})
        # §3.3: GUID xdata on furniture bbox
        furn_guid = es.guid or es.element_name or 'FURN'
        try:
            furn_pl.set_xdata('BIMGUID', [(1000, furn_guid)])
        except Exception:
            pass
        _log(f"  WRITE furn {es.element_name} layer=A-FURN")

    # ── §5.1: Door swing arcs + window symbols (ported from SVG writer) ──
    arc_count = 0
    win_sym_count = 0
    for opening in doors + windows:
        host = find_host_wall(opening, walls)
        if not host:
            continue

        if host.is_ew_wall or host.width_y < host.width_x:
            # Opening in E-W wall
            if opening.ifc_class == 'IfcWindow':
                # §5.1: double parallel lines + glass center line in wall opening
                ox = _mh(opening.min_x)
                ow = _mh(opening.width_x)
                wall_cy = _mh(host.center_y)
                wall_hw = _mh(host.width_y) * 0.3
                msp.add_line((ox, wall_cy - wall_hw), (ox + ow, wall_cy - wall_hw),
                             dxfattribs={'layer': 'A-GLAZ', 'lineweight': lw_opening})
                msp.add_line((ox, wall_cy + wall_hw), (ox + ow, wall_cy + wall_hw),
                             dxfattribs={'layer': 'A-GLAZ', 'lineweight': lw_opening})
                msp.add_line((ox, wall_cy), (ox + ow, wall_cy),
                             dxfattribs={'layer': 'A-GLAZ', 'lineweight': lw_glass})
                win_sym_count += 1
            elif opening.ifc_class == 'IfcDoor':
                # §5.1: door leaf line + quarter-arc swing
                door_w = _mh(opening.width_x)
                hinge_x = _mh(opening.min_x)
                hinge_y = _mh(host.center_y)
                # Leaf line (horizontal from hinge)
                msp.add_line((hinge_x, hinge_y), (hinge_x + door_w, hinge_y),
                             dxfattribs={'layer': 'A-DOOR', 'lineweight': lw_opening})
                # Arc: swing direction from furniture clustering
                room_side = _get_room_side_ew(host, furniture)
                if room_side == 'south':
                    # Swing south: arc from 0 to -90 (CW)
                    msp.add_arc((hinge_x, hinge_y), door_w,
                                start_angle=-90, end_angle=0,
                                dxfattribs={'layer': 'A-DOOR', 'lineweight': lw_opening})
                else:
                    # Swing north: arc from 0 to 90 (CCW)
                    msp.add_arc((hinge_x, hinge_y), door_w,
                                start_angle=0, end_angle=90,
                                dxfattribs={'layer': 'A-DOOR', 'lineweight': lw_opening})
                arc_count += 1
        else:
            # Opening in N-S wall
            if opening.ifc_class == 'IfcWindow':
                oy = _mh(opening.min_y)
                oh = _mh(opening.width_y)
                wall_cx = _mh(host.center_x)
                wall_hw = _mh(host.width_x) * 0.3
                msp.add_line((wall_cx - wall_hw, oy), (wall_cx - wall_hw, oy + oh),
                             dxfattribs={'layer': 'A-GLAZ', 'lineweight': lw_opening})
                msp.add_line((wall_cx + wall_hw, oy), (wall_cx + wall_hw, oy + oh),
                             dxfattribs={'layer': 'A-GLAZ', 'lineweight': lw_opening})
                msp.add_line((wall_cx, oy), (wall_cx, oy + oh),
                             dxfattribs={'layer': 'A-GLAZ', 'lineweight': lw_glass})
                win_sym_count += 1
            elif opening.ifc_class == 'IfcDoor':
                door_h = _mh(opening.width_y)
                hinge_x = _mh(host.center_x)
                hinge_y = _mh(opening.min_y)
                msp.add_line((hinge_x, hinge_y), (hinge_x, hinge_y + door_h),
                             dxfattribs={'layer': 'A-DOOR', 'lineweight': lw_opening})
                room_side = _get_room_side_ns(host, furniture)
                if room_side == 'east':
                    msp.add_arc((hinge_x, hinge_y), door_h,
                                start_angle=0, end_angle=90,
                                dxfattribs={'layer': 'A-DOOR', 'lineweight': lw_opening})
                else:
                    msp.add_arc((hinge_x, hinge_y), door_h,
                                start_angle=90, end_angle=90 + 90,
                                dxfattribs={'layer': 'A-DOOR', 'lineweight': lw_opening})
                arc_count += 1
    _log(f"§5.1 Door swing arcs: {arc_count}, Window symbols: {win_sym_count}")

    # ── §2 Step 3: DETECT ALIGNMENT (grid lines) ──
    # §4.2a: columns + walls. §4.2d: labels from template (skip I)
    grids = snap_grids(derive_grids(walls, columns=columns, template=tpl))
    # §4.5d: detailed grid logging (start/end/radius) done in the drawing loop below

    all_elems = walls + doors + windows + furniture
    bld_min_x = min(e.min_x for e in all_elems) * MM
    bld_max_x = max(e.max_x for e in all_elems) * MM
    bld_min_y = min(e.min_y for e in all_elems) * MM
    bld_max_y = max(e.max_y for e in all_elems) * MM

    grid_ext   = tpl_grid.get('extend_beyond_building_mm', 15) * scale
    bubble_r   = tpl_grid.get('bubble_radius_mm', 4.0) * scale
    bubble_lw  = int(tpl_grid.get('bubble_stroke_mm', 0.25) * 100)
    grid_gap   = tpl_dims.get('extension_gap_mm', 2.0) * scale
    tag_size   = tpl_tags.get('size_mm', 4.0) * scale
    txt_grid_h = tpl_grid.get('label_font_height_mm', 3.0) * scale
    # §I-29: bubble must be beyond tier_1 dim. tier_1 = DIM_OFFSET_2 from building edge.
    _t1_model = DIM_OFFSET_2 * scale   # tier-1 overall dim offset (model mm)
    _t2_model = DIM_OFFSET_1 * scale   # tier-2 bay dim offset (model mm)

    for g in grids:
        pos = g.position * MM
        if g.axis == 'x':
            # §I-29: grid line extends from short bottom extension to beyond tier_1+bubble
            x0 = pos; y0 = bld_min_y - grid_ext - bubble_r * 2
            x1 = pos; y1 = bld_max_y + _t1_model + grid_ext + bubble_r * 2
            grid_line = msp.add_line((x0, y0), (x1, y1),
                         dxfattribs={'layer': 'A-GRID', 'lineweight': lw_grid})
            # §3.3: GUID xdata on grid line
            try:
                grid_line.set_xdata('BIMGUID', [(1000, f'GRID:{g.label}')])
            except Exception:
                pass
            # §20.3.2: BIMSRC xdata on grid line
            src_str = ','.join(g.source_guids) if g.source_guids else ''
            _set_bimsrc(grid_line, type='GRID', label=g.label, axis=g.axis,
                        pos=float(g.position), source_guids=src_str,
                        intent_param=f'position_{g.axis}')
            n_bimsrc_grid += 1
            _log(f"§2.3 Grid {g.label} axis={g.axis} pos={g.position:.3f}m "
                 f"start=({x0:.0f},{y0:.0f}) end=({x1:.0f},{y1:.0f}) r={bubble_r:.0f}"
                 f" src=[{src_str}]")
            _log(f"  WRITE grid label={g.label} layer=A-GRID")
            # Top bubble: beyond tier_1 dim. Bottom bubble: short extension, no dims.
            cy_top = bld_max_y + _t1_model + grid_ext + bubble_r
            cy_bot = bld_min_y - grid_ext - bubble_r
            for cy in (cy_top, cy_bot):
                _draw_grid_bubble(msp, pos, cy, bubble_r, g.label, txt_grid_h, bubble_lw)
                _log(f"§RENDER BUBBLE layer=A-GRID r={bubble_r/scale:.1f}mm "
                     f"at ({pos:.0f},{cy:.0f}) src=template.grid.bubble_radius_mm")
        else:
            # §I-29: y-axis dims to left → left bubble beyond tier_1; right bubble short
            x0 = bld_min_x - _t1_model - grid_ext - bubble_r * 2; y0 = pos
            x1 = bld_max_x + grid_ext + bubble_r * 2; y1 = pos
            grid_line = msp.add_line((x0, y0), (x1, y1),
                         dxfattribs={'layer': 'A-GRID', 'lineweight': lw_grid})
            # §3.3: GUID xdata on grid line
            try:
                grid_line.set_xdata('BIMGUID', [(1000, f'GRID:{g.label}')])
            except Exception:
                pass
            # §20.3.2: BIMSRC xdata on grid line
            src_str = ','.join(g.source_guids) if g.source_guids else ''
            _set_bimsrc(grid_line, type='GRID', label=g.label, axis=g.axis,
                        pos=float(g.position), source_guids=src_str,
                        intent_param=f'position_{g.axis}')
            n_bimsrc_grid += 1
            _log(f"§2.3 Grid {g.label} axis={g.axis} pos={g.position:.3f}m "
                 f"start=({x0:.0f},{y0:.0f}) end=({x1:.0f},{y1:.0f}) r={bubble_r:.0f}"
                 f" src=[{src_str}]")
            _log(f"  WRITE grid label={g.label} layer=A-GRID")
            cx_left  = bld_min_x - _t1_model - grid_ext - bubble_r
            cx_right = bld_max_x + grid_ext + bubble_r
            for cx in (cx_right, cx_left):
                _draw_grid_bubble(msp, cx, pos, bubble_r, g.label, txt_grid_h, bubble_lw)
    # §I-29 proof: bubble beyond tier_1 dim beyond tier_2 dim beyond building edge
    _log(f"§GRID_BUBBLE_Y FLOOR x-axis: bubble={DIM_OFFSET_2 + grid_ext/scale + bubble_r/scale:.0f}mm "
         f"tier_1={DIM_OFFSET_2:.0f}mm tier_2={DIM_OFFSET_1:.0f}mm building_edge=0 "
         f"(bubble>t1>t2>edge: {DIM_OFFSET_2 + grid_ext/scale + bubble_r/scale > DIM_OFFSET_2 > DIM_OFFSET_1 > 0})")

    # ── §2 Step 4: COMPUTE DIMENSIONS ──
    dims = generate_dimensions(grids)
    # §6.1 I-23: log suppressed tier-2 axes (single-bay axes have no bay dim entry)
    _x_grids = [g for g in grids if g.axis == 'x']
    _y_grids = [g for g in grids if g.axis == 'y']
    if len(_x_grids) == 2:
        _log(f"§I-23 FLOOR tier-2 suppressed x-axis: single bay {_x_grids[0].label}→{_x_grids[-1].label}")
    if len(_y_grids) == 2:
        _log(f"§I-23 FLOOR tier-2 suppressed y-axis: single bay {_y_grids[0].label}→{_y_grids[-1].label}")
    # §15.2: triage grid dims — PANEL bays suppress inline text
    crowding_mm = tpl.get('grid', {}).get('crowding_threshold_mm', 15.0)
    _inline_bays, _panel_bays = _triage_grid_dims(grids, scale, crowding_mm)
    _panel_keys = frozenset((b.label1, b.label2) for b in _panel_bays)
    dim_count = 0
    tick_len = tpl_dims.get('tick_half_length_mm', 1.5) * scale
    # §6.3a: tick angle from template (default 45°)
    tick_angle = math.radians(tpl_dims.get('tick_angle_deg', 45))
    # §6.1 I-24: one tick per endpoint per dim row — track drawn positions to suppress duplicates
    _drawn_ticks: set = set()  # (round(dim_row), round(pos)) per axis
    _ticks_skipped = 0
    tick_dx = tick_len * math.cos(tick_angle)
    tick_dy = tick_len * math.sin(tick_angle)
    txt_h    = tpl_dims.get('text_height_mm', 2.5) * scale
    _log(f"§RENDER DIM_TICK angle={tpl_dims.get('tick_angle_deg', 45)}° "
         f"len={tpl_dims.get('tick_half_length_mm', 1.5)}mm "
         f"src=template.dimensions.tick_angle_deg")

    for d in dims:
        s = d.start * MM
        e = d.end * MM
        off = d.offset * scale
        _log(f"§2.4 Dim {d.axis} {d.start:.3f}→{d.end:.3f} = {d.text}mm")

        # §15.2: suppress dim text for PANEL bays (line + tick still drawn)
        _is_panel = (d.from_label, d.to_label) in _panel_keys

        # §6.3c: extension_gap_mm from template — extension line starts DIM_GAP
        # away from the grid position (not touching the grid line).
        dim_gap = tpl_dims.get('extension_gap_mm', 2.0) * scale
        if d.axis == 'x':
            # §B: dim measured from building edge; bubble is outermost beyond grid_ext
            dim_y = bld_max_y + off
            dim_line_e = msp.add_line((s, dim_y), (e, dim_y),
                         dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            # Extension lines: start just above building top, end at dim_y + overshoot
            msp.add_line((s, bld_max_y + dim_gap), (s, dim_y + dim_gap),
                         dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            msp.add_line((e, bld_max_y + dim_gap), (e, dim_y + dim_gap),
                         dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            # §6.1 I-24: one tick per endpoint per dim row — skip if already drawn at this pos
            for tx in (s, e):
                _tk = (round(dim_y, 2), round(tx, 2))
                if _tk not in _drawn_ticks:
                    _drawn_ticks.add(_tk)
                    msp.add_line((tx - tick_dx, dim_y - tick_dy),
                                 (tx + tick_dx, dim_y + tick_dy),
                                 dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
                else:
                    _ticks_skipped += 1
            if not _is_panel:
                mid_x = (s + e) / 2
                msp.add_text(d.text,
                             dxfattribs={'layer': 'A-ANNO-DIMS', 'height': txt_h}
                             ).set_placement((mid_x, dim_y + txt_h * 0.3),
                                             align=TextEntityAlignment.MIDDLE_CENTER)
            # §20.3.3: BIMSRC xdata on dimension line
            _set_bimsrc(dim_line_e, type='DIM', axis=d.axis,
                        from_grid=d.from_label, to_grid=d.to_label,
                        dist=float(d.end - d.start))
            n_bimsrc_dim += 1
            _log(f"  WRITE dim {d.text} layer=A-DIMS{' (PANEL-suppressed)' if _is_panel else ''}")
        else:
            # §B: dim measured from building edge (left); bubble outermost left
            dim_x = bld_min_x - off
            dim_line_e = msp.add_line((dim_x, s), (dim_x, e),
                         dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            # Extension lines: start just left of building, end at dim_x - overshoot
            msp.add_line((bld_min_x - dim_gap, s), (dim_x - dim_gap, s),
                         dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            msp.add_line((bld_min_x - dim_gap, e), (dim_x - dim_gap, e),
                         dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            # §6.1 I-24: one tick per endpoint per dim row — skip if already drawn at this pos
            for ty in (s, e):
                _tk = (round(dim_x, 2), round(ty, 2))
                if _tk not in _drawn_ticks:
                    _drawn_ticks.add(_tk)
                    msp.add_line((dim_x - tick_dx, ty - tick_dy),
                                 (dim_x + tick_dx, ty + tick_dy),
                                 dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
                else:
                    _ticks_skipped += 1
            if not _is_panel:
                mid_y = (s + e) / 2
                msp.add_text(d.text,
                             dxfattribs={'layer': 'A-ANNO-DIMS', 'height': txt_h,
                                         'rotation': 90}
                             ).set_placement((dim_x - txt_h * 0.3, mid_y),
                                             align=TextEntityAlignment.MIDDLE_CENTER)
            # §20.3.3: BIMSRC xdata on dimension line
            _set_bimsrc(dim_line_e, type='DIM', axis=d.axis,
                        from_grid=d.from_label, to_grid=d.to_label,
                        dist=float(d.end - d.start))
            n_bimsrc_dim += 1
            _log(f"  WRITE dim {d.text} layer=A-DIMS")
        dim_count += 1
    _log(f"§I-24 FLOOR tick dedup: {_ticks_skipped} duplicate ticks suppressed at shared endpoints")

    # ── §2 Step 6: INFER ROOMS ──
    room_labels_meta = meta.get('room_labels', {}) if meta else {}
    rooms = infer_rooms(furniture, walls)
    room_count = 0
    room_h = txt_room * scale
    area_h = txt_area * scale

    # §I-47: Load finish codes from 2D.db 2d_finish_type
    _show_finish = tpl.get('room_labels', {}).get('show_finish_codes', False)
    _finish_floor = _finish_wall = None
    if _show_finish:
        for _try_db in [
            os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'input', '2D.db'),
            os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib', 'input', '2D.db'),
        ]:
            if os.path.exists(_try_db):
                _fc_db = sqlite3.connect(_try_db)
                _fc_cur = _fc_db.cursor()
                try:
                    _fc_cur.execute("SELECT type_code FROM [2d_finish_type] "
                                    "WHERE category='FLOOR' ORDER BY finish_id LIMIT 1")
                    _fr = _fc_cur.fetchone()
                    if _fr:
                        _finish_floor = _fr[0]
                    _fc_cur.execute("SELECT type_code FROM [2d_finish_type] "
                                    "WHERE category='WALL' ORDER BY finish_id LIMIT 1")
                    _wr = _fc_cur.fetchone()
                    if _wr:
                        _finish_wall = _wr[0]
                except Exception:
                    pass
                _fc_db.close()
                break
    _finish_h = tpl.get('room_labels', {}).get('finish_code_font_height_mm', 2.0) * scale
    _finish_offset = tpl.get('room_labels', {}).get('finish_code_offset_below_name_mm', 3.5) * scale

    for room_type, cx, cy, area in rooms:
        rx = _mh(cx)
        ry = _mh(cy)
        label_info = room_labels_meta.get(room_type, {})
        label_text = label_info.get('label_text', room_type)
        _log(f"§2.6 Room {room_type} at ({cx:.2f},{cy:.2f}) area={area:.1f}m²")

        # Vertical layout: name → finish codes → area (stacked below each other)
        _name_y = ry + room_h * 0.5
        _area_y = ry - area_h * 0.8
        _finish_str = None

        if _show_finish and _finish_floor and _finish_wall:
            _finish_str = f"{_finish_floor} | {_finish_wall}"
            # Insert finish codes between name and area
            _fc_y = _name_y - _finish_offset
            _area_y = _fc_y - _finish_offset  # push area down
            msp.add_text(_finish_str,
                         dxfattribs={'layer': 'A-ANNO-TEXT', 'height': _finish_h}
                         ).set_placement((rx, _fc_y),
                                         align=TextEntityAlignment.MIDDLE_CENTER)
            _log(f"§FINISH_CODE room={room_type} floor={_finish_floor} "
                 f"wall={_finish_wall} display='{_finish_str}' "
                 f"at=({rx/scale:.1f},{_fc_y/scale:.1f})mm "
                 f"between_name_and_area=({_name_y/scale:.1f},{_area_y/scale:.1f})mm "
                 f"src=2d_finish_type.category=FLOOR/WALL")

        room_txt = msp.add_text(label_text,
                     dxfattribs={'layer': 'A-ANNO-TEXT',
                                 'height': room_h}
                     ).set_placement((rx, _name_y),
                                     align=TextEntityAlignment.MIDDLE_CENTER)
        # §3.3: GUID xdata on room label text
        try:
            room_txt.set_xdata('BIMGUID', [(1000, f'ROOM:{room_type}')])
        except Exception:
            pass
        # §20.3.4: BIMSRC xdata on room label
        _set_bimsrc(room_txt, type='ROOM', room_type=room_type,
                    pos_x=float(cx), pos_y=float(cy), area=float(area))
        n_bimsrc_room += 1
        msp.add_text(f'{area:.1f} m\u00b2',
                     dxfattribs={'layer': 'A-ANNO-TEXT',
                                 'height': area_h}
                     ).set_placement((rx, _area_y),
                                     align=TextEntityAlignment.MIDDLE_CENTER)
        room_count += 1

    # ── Door / window tags — §7.3 annotation_tags.* ──
    tag_count = 0
    tag_r = tag_size / 2
    tag_lw = int(tpl_tags.get('stroke_mm', 0.18) * 100)
    tag_txt_h = txt_tag * scale

    d_num = 0
    for opening in doors:
        host = find_host_wall(opening, walls)
        if not host:
            continue
        d_num += 1
        tag_label = f'D{d_num}'
        tcx, tcy = _mh(opening.center_x), _mh(opening.center_y)

        if host.is_ew_wall or host.width_y < host.width_x:
            tcy -= _mh(host.width_y / 2) + tag_r + grid_gap
        else:
            tcx += _mh(host.width_x / 2) + tag_r + grid_gap

        # §7.3g: tag shape from template annotation_tags.shape
        _draw_tag_shape(msp, tpl_tags.get('shape', 'hexagon'),
                        tcx, tcy, tag_r, 'A-ANNO-TEXT', tag_lw)
        msp.add_text(tag_label,
                     dxfattribs={'layer': 'A-ANNO-TEXT',
                                 'height': tag_txt_h}
                     ).set_placement((tcx, tcy),
                                     align=TextEntityAlignment.MIDDLE_CENTER)
        tag_count += 1

    w_num = 0
    for opening in windows:
        host = find_host_wall(opening, walls)
        if not host:
            continue
        w_num += 1
        tag_label = f'W{w_num}'
        tcx, tcy = _mh(opening.center_x), _mh(opening.center_y)

        if host.is_ew_wall or host.width_y < host.width_x:
            tcy += _mh(host.width_y / 2) + tag_r + grid_gap
        else:
            tcx -= _mh(host.width_x / 2) + tag_r + grid_gap

        # §7.3g: tag shape from template annotation_tags.shape
        _draw_tag_shape(msp, tpl_tags.get('shape', 'hexagon'),
                        tcx, tcy, tag_r, 'A-ANNO-TEXT', tag_lw)
        msp.add_text(tag_label,
                     dxfattribs={'layer': 'A-ANNO-TEXT',
                                 'height': tag_txt_h}
                     ).set_placement((tcx, tcy),
                                     align=TextEntityAlignment.MIDDLE_CENTER)
        tag_count += 1

    # ── §I-42: Text overlap collision avoidance ──
    # Collect all annotation texts, detect overlapping bboxes, nudge vertically
    _anno_texts = [e for e in msp if e.dxftype() == 'TEXT'
                   and e.dxf.layer == 'A-ANNO-TEXT']
    _overlap_count = 0
    if len(_anno_texts) > 1:
        # Build approximate bboxes: (cx, cy, half_w, half_h, entity)
        _text_bboxes = []
        for _te in _anno_texts:
            _th = _te.dxf.height
            _txt = _te.dxf.text if hasattr(_te.dxf, 'text') else ''
            _tw = _th * len(_txt) * 0.6  # approximate width
            _ip = _te.dxf.insert
            _cx, _cy = float(_ip[0]), float(_ip[1])
            _text_bboxes.append((_cx, _cy, _tw / 2, _th / 2, _te))
        # O(n²) overlap detection — fine for <100 labels
        for i in range(len(_text_bboxes)):
            cx1, cy1, hw1, hh1, e1 = _text_bboxes[i]
            for j in range(i + 1, len(_text_bboxes)):
                cx2, cy2, hw2, hh2, e2 = _text_bboxes[j]
                # Check AABB overlap
                if (abs(cx1 - cx2) < hw1 + hw2 and abs(cy1 - cy2) < hh1 + hh2):
                    # Nudge the second text downward by the overlap amount + gap
                    _nudge = (hh1 + hh2) - abs(cy1 - cy2) + hh2 * 0.5
                    _new_y = cy2 - _nudge if cy2 <= cy1 else cy2 + _nudge
                    e2.dxf.insert = (cx2, _new_y, 0)
                    _text_bboxes[j] = (cx2, _new_y, hw2, hh2, e2)
                    _overlap_count += 1
        if _overlap_count > 0:
            _log(f"§I-42 TEXT_OVERLAP: {_overlap_count} overlaps resolved by vertical nudge")

    # ── §I-46: Section cut markers ──
    _sec_cfg = tpl.get('section_markers', {})
    _sec_lw = int(_sec_cfg.get('line_weight_mm', 0.18) * 100)
    _sec_label_sz = _sec_cfg.get('label_size_mm', 3.0) * scale
    _sec_extend = _sec_cfg.get('extend_beyond_m', 1.0)
    _sec_bubble_r = tpl_grid.get('bubble_radius_mm', 4.0) * scale
    for _sec in _sec_cfg.get('sections', []):
        _sid = _sec.get('id', '')
        _saxis = _sec.get('axis', 'y')
        if _saxis == 'y':
            # Horizontal cut at building Y midpoint
            _sy = (bld_min_y + bld_max_y) / 2.0
            _sx0 = bld_min_x - _mh(_sec_extend)
            _sx1 = bld_max_x + _mh(_sec_extend)
            # Dashed section line
            msp.add_line((_sx0, _sy), (_sx1, _sy),
                         dxfattribs={'layer': 'A-ANNO-SECT', 'lineweight': _sec_lw,
                                     'linetype': 'HIDDEN'})
            # Circled labels at each end
            for _end_x, _arrow_rot in [(_sx0, 270), (_sx1, 90)]:
                msp.add_circle((_end_x, _sy), _sec_bubble_r,
                               dxfattribs={'layer': 'A-ANNO-SECT', 'lineweight': _sec_lw})
                msp.add_text(_sid,
                             dxfattribs={'layer': 'A-ANNO-SECT', 'height': _sec_label_sz}
                             ).set_placement((_end_x, _sy),
                                             align=TextEntityAlignment.MIDDLE_CENTER)
                # Section arrow INSERT
                msp.add_blockref('SECTION_ARROW', (_end_x, _sy - _sec_bubble_r - _sec_label_sz * 0.5),
                                 dxfattribs={'layer': 'A-ANNO-SECT',
                                             'xscale': _sec_label_sz,
                                             'yscale': _sec_label_sz,
                                             'rotation': _arrow_rot})
            _log(f"§SECTION_MARKER id={_sid}-{_sid} axis=y "
                 f"pos={_sy/MM:.1f}m midpoint_of=({bld_min_y/MM:.1f},{bld_max_y/MM:.1f})m "
                 f"extent=({_sx0/MM:.1f},{_sx1/MM:.1f})m "
                 f"extend_beyond={_sec_extend}m src=template")
        else:
            # Vertical cut at building X midpoint
            _sx = (bld_min_x + bld_max_x) / 2.0
            _sy0 = bld_min_y - _mh(_sec_extend)
            _sy1 = bld_max_y + _mh(_sec_extend)
            msp.add_line((_sx, _sy0), (_sx, _sy1),
                         dxfattribs={'layer': 'A-ANNO-SECT', 'lineweight': _sec_lw,
                                     'linetype': 'HIDDEN'})
            for _end_y, _arrow_rot in [(_sy0, 0), (_sy1, 180)]:
                msp.add_circle((_sx, _end_y), _sec_bubble_r,
                               dxfattribs={'layer': 'A-ANNO-SECT', 'lineweight': _sec_lw})
                msp.add_text(_sid,
                             dxfattribs={'layer': 'A-ANNO-SECT', 'height': _sec_label_sz}
                             ).set_placement((_sx, _end_y),
                                             align=TextEntityAlignment.MIDDLE_CENTER)
                msp.add_blockref('SECTION_ARROW', (_sx - _sec_bubble_r - _sec_label_sz * 0.5, _end_y),
                                 dxfattribs={'layer': 'A-ANNO-SECT',
                                             'xscale': _sec_label_sz,
                                             'yscale': _sec_label_sz,
                                             'rotation': _arrow_rot})
            _log(f"§SECTION_MARKER id={_sid}-{_sid} axis=x "
                 f"pos={_sx/MM:.1f}m midpoint_of=({bld_min_x/MM:.1f},{bld_max_x/MM:.1f})m "
                 f"extent=({_sy0/MM:.1f},{_sy1/MM:.1f})m "
                 f"extend_beyond={_sec_extend}m src=template")

    # ── §2 Step 7: RENDER sheet layout ──
    schedule = _build_schedule({**elements,
                                'doors': doors, 'windows': windows,
                                'walls': walls, 'furniture': furniture})
    bld_type, bld_name = _infer_building_identity(db_path)
    _draw_sheet_layout(doc, msp, tpl, bld_min_x, bld_max_x, bld_min_y, bld_max_y,
                       drawing_title=drawing_title, drawing_no=drawing_no,
                       scale=scale, schedule_rows=schedule,
                       building_type=bld_type, building_name=bld_name, grids=grids,
                       panel_bays=_panel_bays)

    # §20: BIMSRC summary
    _log(f'§XDATA SUMMARY: {n_bimsrc_wall} walls {n_bimsrc_grid} grids '
         f'{n_bimsrc_dim} dims {n_bimsrc_room} rooms tagged')

    # ── §2 Step 8: VERIFY ──
    _log(f"§2.8 Floor plan: {cut_count} cut polylines, {len(grids)} grids, "
         f"{dim_count} dims, {room_count} rooms, {tag_count} tags")
    _log(f"§EXIT write_floor_plan_dxf: {cut_count} walls, {dim_count} dims, "
         f"{room_count} rooms, {tag_count} tags")
    # §R7 bounds check — every entity in modelspace, report min/max, warn if outside viewBox
    _all_x, _all_y = [], []
    for _e in msp:
        try:
            if hasattr(_e.dxf, 'insert'):
                _all_x.append(_e.dxf.insert.x); _all_y.append(_e.dxf.insert.y)
            elif hasattr(_e.dxf, 'start'):
                _all_x += [_e.dxf.start.x, _e.dxf.end.x]
                _all_y += [_e.dxf.start.y, _e.dxf.end.y]
            elif hasattr(_e.dxf, 'center'):
                _all_x.append(_e.dxf.center.x); _all_y.append(_e.dxf.center.y)
        except Exception:
            pass
    if _all_x:
        _bx0, _bx1 = min(_all_x) / scale, max(_all_x) / scale
        _by0, _by1 = min(_all_y) / scale, max(_all_y) / scale
        _pw = tpl_paper.get('width_mm', 420)  # paper mm
        if tpl_paper.get('fitted', True):
            _bld_h_mm = (bld_max_y - bld_min_y) / scale
            _t1b = tpl_dims.get('tier_1_offset_mm', DIM_OFFSET_2)
            _ann_top = (_t1b + tpl_grid.get('extend_beyond_building_mm', 20)
                        + tpl_grid.get('bubble_radius_mm', 4.0) * 2)
            _ann_bot = (tpl_grid.get('extend_beyond_building_mm', 20)
                        + tpl_grid.get('bubble_radius_mm', 4.0) * 2)
            _ph = (tpl_paper.get('margins', {}).get('top', 10) + _ann_top
                   + _bld_h_mm + _ann_bot + tpl_paper.get('margins', {}).get('bottom', 10))
            _ph = max(tpl_paper.get('fitted_min_height_mm', 150),
                      min(tpl_paper.get('fitted_max_height_mm', 250), _ph))
        else:
            _ph = tpl_paper.get('height_mm', 297)
        _warn = ' WARN: y_min outside viewBox' if _by0 < -1.0 else ''
        _warn += ' WARN: y_max outside viewBox' if _by1 > _ph + 1.0 else ''
        _warn += ' WARN: x_min outside viewBox' if _bx0 < -1.0 else ''
        _warn += ' WARN: x_max outside viewBox' if _bx1 > _pw + 1.0 else ''
        _log(f"§BOUNDS x=({_bx0:.1f},{_bx1:.1f})mm y=({_by0:.1f},{_by1:.1f})mm "
             f"viewBox=({_pw:.1f},{_ph:.1f})mm{_warn}")
    doc.saveas(out_dxf)
    _log(f"  → {out_dxf}")
    # §16.2: flush per-view log
    _prefix = os.path.basename(db_path).replace('_extracted.db', '').upper()
    _flush_view_log(os.path.dirname(out_dxf), _prefix)
    _audit_dxf(doc, out_dxf, "FLOOR PLAN")


# ─────────────────────────────────────────────────────────────────
# ELEVATION
# ─────────────────────────────────────────────────────────────────

def write_elevation_dxf(db_path: str, face: str, out_dxf: str,
                        scale: int = SCALE):
    """Generate elevation DXF — spec §5.2, §6.2.
    All formatting from drawing_template.json. All data from DB."""

    # ── §2 Step 1: LOAD TEMPLATE ──
    tpl = _load_template()
    tpl_grid = tpl.get('grid', {})
    tpl_dims = tpl.get('dimensions', {})
    tpl_lm   = tpl.get('level_markers', {})
    _log(f"§2.1 Elevation {face}: template loaded")

    # Line weights from template §1 R4
    lw_wall_ext = _lw(tpl, 'wall_exterior_cut')
    lw_wall_int = _lw(tpl, 'wall_partition_cut')
    lw_opening  = _lw(tpl, 'window_frame')
    lw_glass    = _lw(tpl, 'glass_glazing')
    lw_dim      = _lw(tpl, 'dimension_line')
    lw_grid     = _lw(tpl, 'grid_line')
    lw_border   = _lw(tpl, 'border')

    # Text heights from template (paper mm)
    txt_dim   = tpl_dims.get('text_height_mm', 2.5)
    txt_grid  = tpl_grid.get('label_font_height_mm', 3.0)
    txt_level = tpl_lm.get('font_height_mm', 2.5)

    # Grid geometry from template
    bubble_r   = tpl_grid.get('bubble_radius_mm', 4.0) * scale
    bubble_lw  = int(tpl_grid.get('bubble_stroke_mm', 0.25) * 100)
    grid_gap   = tpl_dims.get('extension_gap_mm', 2.0) * scale
    tick_len   = tpl_dims.get('tick_half_length_mm', 1.5) * scale
    tick_angle = math.radians(tpl_dims.get('tick_angle_deg', 45))
    tick_dx = tick_len * math.cos(tick_angle)
    tick_dy = tick_len * math.sin(tick_angle)

    # Dimension tier offsets from template §6.1
    # Tier 2 = bay (inner, closer to building), Tier 1 = overall (outer)
    tier_2_off = tpl_dims.get('tier_2_offset_mm', 18) * scale
    tier_1_off = tpl_dims.get('tier_1_offset_mm', 26) * scale

    # ── §2 Step 2: QUERY DB ──
    elements = read_elements(db_path)
    walls    = elements['walls']
    doors    = elements['doors']
    windows  = elements['windows']
    roofs    = elements['roofs']
    slabs    = elements['slabs']

    if not walls:
        return

    _log(f"§2.2 DB loaded: {len(walls)} walls, {len(doors)} doors, "
         f"{len(windows)} windows, {len(roofs)} roofs")

    # ── §12a.1 Face classification — derive from apparent_width, not face name ──
    tpl_elev = tpl.get('elevation', {})
    _aspect_thresh = tpl_elev.get('_aspect_ratio_threshold', 1.2)
    _bld_x_ext = max(e.max_x for e in walls) - min(e.min_x for e in walls)
    _bld_y_ext = max(e.max_y for e in walls) - min(e.min_y for e in walls)
    _face_app_w = _bld_x_ext if face in ('front', 'rear') else _bld_y_ext
    _other_w    = _bld_y_ext if face in ('front', 'rear') else _bld_x_ext
    _aspect     = max(_face_app_w, _other_w) / max(min(_face_app_w, _other_w), 0.001)
    is_form_face = (_face_app_w > _other_w) and (_aspect >= _aspect_thresh)
    _face_class  = 'form_face' if is_form_face else 'annotation_face'
    _log(f"§FACE_CLASS face={face} apparent_width={_face_app_w:.1f}m "
         f"other={_other_w:.1f}m aspect={_aspect:.2f} class={_face_class}")
    # Zone widths from template — §12a.2 / §12a.4
    # §I-39 fix: form_face gets narrower level zone (was 0 → suppressed markers)
    _lv_w  = (tpl_elev.get('form_face_level_zone_width_mm', 20) if is_form_face
              else tpl_elev.get('level_zone_width_mm', 30))
    _ht_w  = (tpl_elev.get('form_face_height_zone_width_mm', 0) if is_form_face
              else tpl_elev.get('height_zone_width_mm', 22))
    _tb_w  = tpl.get('paper', {}).get('title_block_width_mm', 120)
    _ml    = tpl.get('paper', {}).get('margins', {}).get('left', 25)
    _mr    = tpl.get('paper', {}).get('margins', {}).get('right', 10)
    _pw    = tpl.get('paper', {}).get('width_mm', 420)
    _cnt_w = _pw - _ml - _mr - _lv_w - _ht_w - _tb_w
    # §ZONE_LAYOUT logged after face_elems selected (needs h-range to compute sheet_x)

    # Mirror sign: rear and right viewers see the horizontal axis reversed
    if face == 'front':
        h_of  = lambda e: (e.min_x, e.max_x)
        h_sign = 1
        bld_min_y = min(e.min_y for e in walls)
        face_elems = [e for e in walls + doors + windows
                      if e.min_y < bld_min_y + 1.0]
    elif face == 'rear':
        h_of  = lambda e: (-e.max_x, -e.min_x)
        h_sign = -1
        bld_max_y = max(e.max_y for e in walls)
        face_elems = [e for e in walls + doors + windows
                      if e.max_y > bld_max_y - 1.0]
    elif face == 'left':
        h_of  = lambda e: (e.min_y, e.max_y)
        h_sign = 1
        bld_min_x = min(e.min_x for e in walls)
        face_elems = [e for e in walls + doors + windows
                      if e.min_x < bld_min_x + 1.0]
    else:  # right
        h_of  = lambda e: (-e.max_y, -e.min_y)
        h_sign = -1
        bld_max_x = max(e.max_x for e in walls)
        face_elems = [e for e in walls + doors + windows
                      if e.max_x > bld_max_x - 1.0]

    v_of = lambda e: (e.min_z, e.max_z)

    # ── §12a.2 Zone constants — derived from face_elems h-range + template ──
    # Use walls/doors/windows only (stable, no displaced slab contamination)
    _fe_hmin = min(h_of(e)[0] for e in face_elems) if face_elems else 0.0
    _fe_hmax = max(h_of(e)[1] for e in face_elems) if face_elems else 0.0
    ext = 0.5  # m extension each side (duplicated here for zone calc; also used below)
    _cnt_w_full_ms  = (_pw - _ml - _mr - _tb_w) * scale   # same formula as _draw_sheet_layout
    _fe_bld_w_ms    = _mh(_fe_hmax + ext) - _mh(_fe_hmin - ext)
    _centering_ms   = max(0.0, (_cnt_w_full_ms - _fe_bld_w_ms) / 2.0)
    _sheet_x_ms     = _mh(_fe_hmin - ext) - _ml * scale - _centering_ms
    # Absolute zone boundaries in model-space mm
    _x_lv_left_ms   = _sheet_x_ms + _ml * scale
    _x_lv_right_ms  = _x_lv_left_ms  + _lv_w * scale
    _x_cnt_left_ms  = _x_lv_right_ms
    _x_cnt_right_ms = _x_cnt_left_ms + _cnt_w * scale
    _x_ht_right_ms  = _x_cnt_right_ms + _ht_w * scale
    _x_tb_ms        = _sheet_x_ms + (_pw - _mr - _tb_w) * scale
    # Paper-space mm equivalents (for logging — always == template constants)
    _zp = lambda ms: ms / scale  # model-space mm → paper mm
    _log(f"§ZONE_LAYOUT face={face} level_w={_lv_w}mm content_w={_cnt_w:.0f}mm "
         f"height_w={_ht_w}mm tb_w={_tb_w}mm "
         f"x_level=({_zp(_x_lv_left_ms):.0f},{_zp(_x_lv_right_ms):.0f}) "
         f"x_content=({_zp(_x_cnt_left_ms):.0f},{_zp(_x_cnt_right_ms):.0f}) "
         f"x_height=({_zp(_x_cnt_right_ms):.0f},{_zp(_x_ht_right_ms):.0f}) "
         f"x_tb=({_zp(_x_tb_ms):.0f},{_zp(_sheet_x_ms + _pw*scale):.0f})")

    # ── §I-35: Load elevation drawing styles from 2d_drawing_style ──
    _elev_styles: dict = {}
    for _try_db in [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'input', '2D.db'),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib', 'input', '2D.db'),
    ]:
        if os.path.exists(_try_db):
            _db2d = sqlite3.connect(_try_db)
            for _r in _db2d.execute(
                    "SELECT element_match, stroke_color, stroke_weight "
                    "FROM [2d_drawing_style] WHERE view_type='ELEVATION'"):
                # element_match may be 'IfcWall:Ext' — key by IFC class prefix
                _cls_key = _r[0].split(':')[0]
                _elev_styles[_cls_key] = {'stroke': _r[1], 'lw': _r[2]}
            _db2d.close()
            break
    for _cls in ('IfcWall', 'IfcWindow', 'IfcDoor', 'IfcPlate', 'IfcSlab', 'IfcRoof'):
        if _cls in _elev_styles:
            _s = _elev_styles[_cls]
            _log(f"§STYLE ifc={_cls} view=ELEVATION stroke={_s['stroke']} "
                 f"lw={_s['lw']} src=2d_drawing_style")
        else:
            _log(f"§STYLE_MISS ifc={_cls} view=ELEVATION — using layer default")

    doc = _new_doc(tpl, scale)
    msp = doc.modelspace()

    # ── §2 Step 7: RENDER — wall/door/window outlines ──
    # §12a.2 / §I-33: OOB guard — skip elements entirely outside content zone
    _drawn_h_ms: list = []
    for e in face_elems:
        hh = h_of(e)
        vv = v_of(e)
        h0, h1 = _mh(hh[0]), _mh(hh[1])
        v0, v1 = _mh(vv[0]), _mh(vv[1])
        # OOB: entirely left of zone or entirely right of zone
        if h1 < _x_cnt_left_ms - 5 * scale or h0 > _x_cnt_right_ms + 5 * scale:
            _log(f"§SKIP_OOB face={face} elem={e.ifc_class} "
                 f"guid={getattr(e, 'guid', '?')} "
                 f"h_range=({h0/scale:.1f},{h1/scale:.1f})mm "
                 f"zone=({_zp(_x_cnt_left_ms):.0f},{_zp(_x_cnt_right_ms):.0f})mm — skipped")
            continue
        _drawn_h_ms.extend([h0, h1])
        pts = [(h0, v0), (h1, v0), (h1, v1), (h0, v1)]

        if e.ifc_class in ('IfcWall', 'IfcPlate'):
            if 'Glazed' in (e.name or '') or 'Curtain' in (e.name or ''):
                # IfcPlate curtain wall — use A-CURT (not A-GLAZ) so louvre check
                # only triggers for true IfcWindow elements
                layer, lw = 'A-CURT', lw_glass
            else:
                layer, lw = 'A-ELEV-WALL', lw_wall_ext
        elif e.ifc_class == 'IfcWindow':
            layer, lw = 'A-GLAZ', lw_opening
            # §5.2: louvre lines evenly spaced by window height
            win_h = v1 - v0
            n_louvres = max(1, int(win_h / (txt_dim * scale)) - 1)
            for li in range(1, n_louvres + 1):
                lv = v0 + li * (win_h / (n_louvres + 1))
                msp.add_line((h0, lv), (h1, lv),
                             dxfattribs={'layer': 'A-GLAZ', 'lineweight': lw_dim})
        elif e.ifc_class == 'IfcDoor':
            layer, lw = 'A-DOOR', lw_opening
        else:
            layer, lw = 'A-ELEV-WALL', lw_wall_int

        msp.add_lwpolyline(pts, close=True,
                           dxfattribs={'layer': layer, 'lineweight': lw})

    # §12a.2: BLD_RANGE — log actual paper-space x of drawn content
    if _drawn_h_ms:
        _bld_h_min_ms = min(_drawn_h_ms)
        _bld_h_max_ms = max(_drawn_h_ms)
        _fit = ('IN_ZONE' if (_bld_h_min_ms >= _x_cnt_left_ms - scale and
                              _bld_h_max_ms <= _x_cnt_right_ms + scale)
                else 'OVERFLOW')
        _log(f"§BLD_RANGE face={face} "
             f"paper_x=({_zp(_bld_h_min_ms):.1f},{_zp(_bld_h_max_ms):.1f})mm "
             f"zone=({_zp(_x_cnt_left_ms):.0f},{_zp(_x_cnt_right_ms):.0f})mm fit={_fit}")

    # ── §I-53: Door/window tags on elevations ──
    _etag_cfg = tpl.get('annotation_tags', {})
    _elev_tag_r = _etag_cfg.get('size_mm', 4.0) / 2.0 * scale
    _elev_tag_lw = int(_etag_cfg.get('stroke_mm', 0.18) * 100)
    _elev_tag_txt_h = _etag_cfg.get('font_height_mm', 2.0) * scale
    _elev_tag_count = 0
    # Number doors/windows in same order as floor plan (all doors then all windows)
    _d_num = 0
    for _de in doors:
        _d_num += 1
        # Check if this door is on this face
        if _de not in face_elems:
            continue
        _dt_h = (h_of(_de)[0] + h_of(_de)[1]) / 2.0
        _dt_v = (_mh(_de.min_z) + _mh(_de.max_z)) / 2.0
        _dt_label = f'D{_d_num}'
        msp.add_blockref('DOOR_TAG', (_mh(_dt_h), _dt_v),
                         dxfattribs={'layer': 'A-ANNO-TEXT',
                                     'xscale': _elev_tag_r,
                                     'yscale': _elev_tag_r})
        msp.add_text(_dt_label,
                     dxfattribs={'layer': 'A-ANNO-TEXT', 'height': _elev_tag_txt_h}
                     ).set_placement((_mh(_dt_h), _dt_v),
                                     align=TextEntityAlignment.MIDDLE_CENTER)
        _elev_tag_count += 1
        _log(f"§ELEV_TAG face={face} tag={_dt_label} "
             f"at=({_mh(_dt_h)/scale:.1f},{_dt_v/scale:.1f})mm type=door "
             f"centroid_of=h({h_of(_de)[0]:.2f},{h_of(_de)[1]:.2f})m "
             f"v({_de.min_z:.2f},{_de.max_z:.2f})m block=DOOR_TAG")

    _w_num = 0
    for _we in windows:
        _w_num += 1
        if _we not in face_elems:
            continue
        _wt_h = (h_of(_we)[0] + h_of(_we)[1]) / 2.0
        _wt_v = (_mh(_we.min_z) + _mh(_we.max_z)) / 2.0
        _wt_label = f'W{_w_num}'
        msp.add_blockref('WINDOW_TAG', (_mh(_wt_h), _wt_v),
                         dxfattribs={'layer': 'A-ANNO-TEXT',
                                     'xscale': _elev_tag_r,
                                     'yscale': _elev_tag_r})
        msp.add_text(_wt_label,
                     dxfattribs={'layer': 'A-ANNO-TEXT', 'height': _elev_tag_txt_h}
                     ).set_placement((_mh(_wt_h), _wt_v),
                                     align=TextEntityAlignment.MIDDLE_CENTER)
        _elev_tag_count += 1
        _log(f"§ELEV_TAG face={face} tag={_wt_label} "
             f"at=({_mh(_wt_h)/scale:.1f},{_wt_v/scale:.1f})mm type=window "
             f"centroid_of=h({h_of(_we)[0]:.2f},{h_of(_we)[1]:.2f})m "
             f"v({_we.min_z:.2f},{_we.max_z:.2f})m block=WINDOW_TAG")

    _log(f"§ELEV_TAGS face={face} count={_elev_tag_count}")

    # ── Roof silhouette — §5.2: convex hull of roof projected onto face ──
    # §I-33: pass h_bounds so roof_silhouette() filters displaced mesh vertices
    # (local-coord slab verts) BEFORE computing the convex hull — post-hull
    # filtering leaves a degenerate polyline when OOB verts are the hull corners.
    _h_bounds = (_fe_hmin - 2 * ext, _fe_hmax + 2 * ext)
    _sil_result = roof_silhouette(db_path, face, h_bounds=_h_bounds)
    if isinstance(_sil_result, tuple) and len(_sil_result) == 3:
        hull, slab_thickness_m, _sil_oob = _sil_result
    elif isinstance(_sil_result, tuple):
        hull, slab_thickness_m = _sil_result
        _sil_oob = None
    else:
        hull, slab_thickness_m, _sil_oob = _sil_result, 0.0, None
    # Log §SKIP_OOB if displaced raw vertices were filtered before hull computation
    if _sil_oob and _sil_oob['n_oob'] > 0:
        _log(f"§SKIP_OOB face={face} elem=IfcSlab guid={_sil_oob['guid']} "
             f"h_range=(OOB) zone=({_zp(_x_cnt_left_ms):.0f},{_zp(_x_cnt_right_ms):.0f})mm "
             f"— {_sil_oob['n_oob']} displaced raw vertices filtered before hull")
    if hull:
        # §12a.2: entire hull outside zone → skip
        _hull_h_ms = [_mh(h) for h, z in hull]
        _hull_hmin_ms, _hull_hmax_ms = min(_hull_h_ms), max(_hull_h_ms)
        if (_hull_hmax_ms < _x_cnt_left_ms - 5 * scale or
                _hull_hmin_ms > _x_cnt_right_ms + 5 * scale):
            _log(f"§SKIP_OOB face={face} elem=roof_silhouette "
                 f"h_range=({_zp(_hull_hmin_ms):.1f},{_zp(_hull_hmax_ms):.1f})mm "
                 f"zone=({_zp(_x_cnt_left_ms):.0f},{_zp(_x_cnt_right_ms):.0f})mm — skipped")
            hull = []
    if hull:
        # §I-26 fix 1: open polyline avoids spurious vertical closing segment
        pts = [(_mh(h), _mh(z)) for h, z in hull]
        # §GUARD: detect if close=True would invent a non-data segment
        first_h, last_h = pts[0][0], pts[-1][0]
        first_z, last_z = pts[0][1], pts[-1][1]
        _close_dist = ((first_h - last_h) ** 2 + (first_z - last_z) ** 2) ** 0.5
        if _close_dist > 1.0:  # > 1mm model-space gap → closing would invent geometry
            _log(f"§WARN hull_close_SUPPRESSED: first=({first_h:.1f},{first_z:.1f}) "
                 f"last=({last_h:.1f},{last_z:.1f}) gap={_close_dist:.1f}mm — "
                 f"close=True would draw {_close_dist:.1f}mm imaginary segment")
        msp.add_lwpolyline(pts, close=False,
                           dxfattribs={'layer': 'A-ROOF', 'lineweight': lw_wall_ext})
        _log(f"§I-26 Roof silhouette: {len(hull)} pts, open polyline, "
             f"gap={_close_dist:.1f}mm (no invented close segment)")
        # §I-26 fix 2: inner face (slab bottom) — outer hull shifted down by slab thickness
        if slab_thickness_m > 0.05:
            inner_pts = [(_mh(h), _mh(z - slab_thickness_m)) for h, z in hull]
            msp.add_lwpolyline(inner_pts, close=False,
                               dxfattribs={'layer': 'A-ROOF', 'lineweight': lw_wall_int})
            _log(f"§I-26 Inner slab face: thickness={slab_thickness_m:.3f}m "
                 f"({int(slab_thickness_m*1000)}mm) src=mesh_edge_Z_span")
        else:
            _log(f"§WARN slab_thickness_MISSING: thickness={slab_thickness_m:.3f}m — "
                 f"inner face not drawn (no shell thickness from DB mesh)")

    # ── §I-48: Roof profile — fascia line at eave level ──
    if hull and len(hull) >= 2:
        _eave_overhang = tpl.get('roof', {}).get('eave_overhang_mm', 700)
        _roof_zs = [z for h, z in hull]
        _eave_z = min(_roof_zs)  # eave = lowest Z of roof mesh
        _roof_h_min = min(h for h, z in hull)
        _roof_h_max = max(h for h, z in hull)
        # Fascia extends to overhang distance beyond roof edges
        _fascia_h0 = _mh(_roof_h_min) - _eave_overhang * scale / MM
        _fascia_h1 = _mh(_roof_h_max) + _eave_overhang * scale / MM
        # Clamp to content zone
        _fascia_h0 = max(_x_cnt_left_ms, _fascia_h0)
        _fascia_h1 = min(_x_cnt_right_ms, _fascia_h1)
        msp.add_line((_fascia_h0, _mh(_eave_z)),
                     (_fascia_h1, _mh(_eave_z)),
                     dxfattribs={'layer': 'A-ROOF', 'lineweight': lw_wall_int})
        _ridge_z = max(_roof_zs)
        _log(f"§ROOF_PROFILE face={face} eave_z={_eave_z:.3f}m "
             f"from=min(hull_z,[{min(_roof_zs):.3f}..{max(_roof_zs):.3f}]) "
             f"ridge_z={_ridge_z:.3f}m "
             f"roof_h=({_roof_h_min:.2f},{_roof_h_max:.2f})m "
             f"fascia_extent=({_fascia_h0/scale:.1f},{_fascia_h1/scale:.1f})mm "
             f"overhang={_eave_overhang}mm hull_pts={len(hull)} src=roof_mesh+template")

    # ── Ground + FFL lines ──
    all_vis = face_elems + roofs + slabs
    if not all_vis:
        doc.saveas(out_dxf)
        return

    # §12a.2: Use face_elems (walls/doors/windows) for ground line extent —
    # avoids displaced slab inflation of the bounding box (§I-33 / §I-32)
    h_min_m = _fe_hmin
    h_max_m = _fe_hmax
    # ext already set in zone block above

    # ── Level data from 2D.db (§3.2b, §4.3c, §5.2c) ──
    db_levels = _read_2d_db_levels()
    level_labels = db_levels['level_labels']
    apron_z = db_levels['level_elevations'].get('APRON', APRON_Z)
    grd_z   = db_levels['level_elevations'].get('GRD', GRD_Z)

    # §12a.2 / §I-32: Clamp ground/FFL lines to content zone (never bleed into title block)
    _grd_left_ms  = max(_x_cnt_left_ms,  _mh(h_min_m - ext))
    _grd_right_ms = min(_x_cnt_right_ms, _mh(h_max_m + ext))
    _grd_overflow = max(0.0, (_mh(h_max_m + ext) - _x_cnt_right_ms) / scale)
    # GRD. LEVEL line — boldest (border weight)
    msp.add_line((_grd_left_ms, _mh(grd_z)),
                 (_grd_right_ms, _mh(grd_z)),
                 dxfattribs={'layer': 'A-ELEV-LEVL', 'lineweight': lw_border})
    # FFL line — medium
    _ffl_left_ms  = max(_x_cnt_left_ms,  _mh(h_min_m - 0.3))
    _ffl_right_ms = min(_x_cnt_right_ms, _mh(h_max_m + 0.3))
    msp.add_line((_ffl_left_ms, 0.0),
                 (_ffl_right_ms, 0.0),
                 dxfattribs={'layer': 'A-ELEV-LEVL', 'lineweight': lw_wall_int})
    _log(f"§GROUND_LINE face={face} "
         f"x_start={_zp(_grd_left_ms):.0f}mm x_end={_zp(_grd_right_ms):.0f}mm "
         f"zone_right={_zp(_x_cnt_right_ms):.0f}mm overflow={_grd_overflow:.1f}mm")

    # ── Level markers — §5.2, §3.2: text + triangle on left side ──
    levels = detect_levels(elements)
    levels = sorted(levels + [('APRON', apron_z), ('GRD', grd_z)],
                    key=lambda lv: lv[1])
    # Deduplicate: skip any level within 10mm of the previous (e.g. FFL=0.0 + APRON=0.0)
    _LEV_TOL = 0.01  # m
    _deduped = []
    for _lbl, _lz in levels:
        if _deduped and abs(_lz - _deduped[-1][1]) < _LEV_TOL:
            continue
        _deduped.append((_lbl, _lz))
    levels = _deduped

    # ── §12a.3/§12a.4: Level marker rendering — ALL elevation faces (§I-39 fix) ──
    marker_x = _mh(h_min_m - ext - 0.5)
    txt_h = txt_level * scale
    min_gap = txt_level * 3 * scale

    # Pre-compute border left so level text can be clamped inside border (fixes L01/T02)
    _elev_bld_h0 = _mh(h_min_m - ext)
    _elev_bld_h1 = _mh(h_max_m + ext)
    _elev_ml = tpl.get('paper', {}).get('margins', {}).get('left', 25) * scale
    _elev_mr = tpl.get('paper', {}).get('margins', {}).get('right', 10) * scale
    _elev_tb = tpl.get('paper', {}).get('title_block_width_mm', 120) * scale
    _elev_pw = tpl.get('paper', {}).get('width_mm', 420) * scale
    _elev_content_w = _elev_pw - _elev_ml - _elev_mr - _elev_tb
    _elev_bld_w = _elev_bld_h1 - _elev_bld_h0
    _elev_centering = max(0.0, (_elev_content_w - _elev_bld_w) / 2.0)
    _elev_border_left = _elev_bld_h0 - _elev_centering
    _lv_txt_clear = tpl_lm.get('font_height_mm', 2.5) * scale

    label_ys = []
    for lbl, lz in levels:
        ly = _mh(lz)
        if label_ys and ly - label_ys[-1] < min_gap:
            ly = label_ys[-1] + min_gap
        label_ys.append(ly)

    # §4.3d/§5.2b/§I-32: level line spans content zone — clamped to x_content_right
    level_line_left  = max(_x_lv_left_ms, _mh(h_min_m - ext))
    level_line_right = min(_x_cnt_right_ms, _mh(h_max_m + ext))
    level_lw = _lw(tpl, 'dimension_line')

    _level_marker_count = 0
    for (lbl, lz), label_ly in zip(levels, label_ys):
        true_ly = _mh(lz)
        msp.add_line((level_line_left, true_ly),
                     (level_line_right, true_ly),
                     dxfattribs={'layer': 'A-ANNO-LEVL', 'lineweight': level_lw,
                                 'linetype': 'HIDDEN'})
        msp.add_line((level_line_right - tick_dx, true_ly - tick_dy),
                     (level_line_right + tick_dx, true_ly + tick_dy),
                     dxfattribs={'layer': 'A-ANNO-LEVL', 'lineweight': level_lw})
        if abs(label_ly - true_ly) > _mh(0.05):
            msp.add_line((marker_x - _mh(1.6), true_ly),
                         (marker_x - _mh(1.6), label_ly),
                         dxfattribs={'layer': 'A-ANNO-LEVL', 'lineweight': lw_dim})
        # §I-44: Triangle level symbol — ▽ (down) for z>=0, △ (up) for z<0
        _sym_size = tpl_lm.get('symbol_size_mm', 3.0) * scale  # model-space units
        _sym_lw = int(tpl_lm.get('symbol_line_weight_mm', 0.18) * 100)
        _sym_half = _sym_size / 2.0
        _sym_cx = marker_x - _mh(0.3)  # just left of marker line
        if lz >= 0.0:
            # ▽ triangle_down: apex at bottom
            _tri_pts = [(_sym_cx - _sym_half, label_ly + _sym_half),
                        (_sym_cx + _sym_half, label_ly + _sym_half),
                        (_sym_cx, label_ly - _sym_half)]
            _sym_name = 'triangle_down'
        else:
            # △ triangle_up: apex at top
            _tri_pts = [(_sym_cx - _sym_half, label_ly - _sym_half),
                        (_sym_cx + _sym_half, label_ly - _sym_half),
                        (_sym_cx, label_ly + _sym_half)]
            _sym_name = 'triangle_up'
        msp.add_lwpolyline(_tri_pts, close=True,
                           dxfattribs={'layer': 'A-ANNO-LEVL', 'lineweight': _sym_lw})
        _log(f"§LEVEL_SYMBOL code={lbl} z={lz:.3f} symbol={_sym_name} "
             f"rule={'z>=0.0→down' if lz >= 0.0 else 'z<0.0→up'} "
             f"at=({_sym_cx/scale:.1f},{label_ly/scale:.1f})mm "
             f"size={tpl_lm.get('symbol_size_mm', 3.0):.1f}mm src=template")

        # §12a.3 I-34: display_text verbatim from 2d_level_marker, not synthesised
        display_text = level_labels.get(lbl, lbl)
        sign = '+' if lz >= 0 else ''
        label_str = f"{display_text}  {sign}{lz:.3f}"
        _log(f"§LEVEL_MARKER code={lbl} display_text='{display_text}' z={lz:.3f}m "
             f"src=2d_level_marker (NOT synthesised)")
        txt_offset = tpl_lm.get('text_right_offset_m', 0.8)
        _txt_anchor_pref = marker_x - _mh(txt_offset)
        _est_txt_w = txt_h * len(label_str) * 0.6
        _min_anchor = _elev_border_left + _lv_txt_clear + _est_txt_w
        _txt_anchor = max(_txt_anchor_pref, _min_anchor)
        msp.add_text(label_str,
                     dxfattribs={'layer': 'A-ANNO-LEVL', 'height': txt_h}
                     ).set_placement((_txt_anchor, label_ly),
                                     align=TextEntityAlignment.MIDDLE_RIGHT)
        _level_marker_count += 1
        _log(f"§LEVEL_DRAW code={lbl} y={_zp(true_ly):.1f}mm "
             f"x_line=({_zp(level_line_left):.0f},{_zp(level_line_right):.0f})mm "
             f"tick_at={_zp(level_line_right):.0f}mm "
             f"label_at={_txt_anchor/scale:.0f}mm")

    # Hard-fail rule 3: §6.2 requires level markers on all elevation sheets
    if _level_marker_count == 0:
        raise DrawingInventionError(
            f"§HARD_FAIL LEVEL_MARKERS_MISSING: face={face} has 0 level markers. "
            f"§6.2 requires level markers on all elevation sheets.")

    # ── §2 Step 3: Grid lines on elevation ──
    grid_axis = 'x' if face in ('front', 'rear') else 'y'
    columns = [e for e in elements.get('other', []) if e.ifc_class == 'IfcColumn']
    elev_grids = snap_grids(derive_grids(walls, columns=columns, template=tpl))
    face_grids_raw = [g for g in elev_grids if g.axis == grid_axis]
    face_grids = sorted(
        [type('G', (), {'label': g.label, 'position': g.position * h_sign})()
         for g in face_grids_raw],
        key=lambda g: g.position)

    v_max_m = max(v_of(e)[1] for e in all_vis)
    grid_above = _mh(v_max_m + 2.0)
    txt_grid_h = txt_grid * scale
    # §I-29: top bubble beyond tier_1 dim. Dims sit between grid_above and bubble.
    _elev_bub_cy  = grid_above + tier_1_off + bubble_r + grid_gap  # top bubble centre
    # §12a.5 I-31: bottom bubble below ground line
    _elev_bub_bot = _mh(grd_z - 0.2) - grid_gap - bubble_r        # bottom bubble centre

    for g in face_grids:
        gx = _mh(g.position)
        _log(f"§2.3 Grid {g.label} at {g.position:.3f}m")
        # Grid line spans both bubbles (§12a.5: bot bubble edge → top bubble edge)
        msp.add_line((gx, _elev_bub_bot - bubble_r),
                     (gx, _elev_bub_cy + bubble_r),
                     dxfattribs={'layer': 'A-GRID', 'lineweight': lw_grid})
        _draw_grid_bubble(msp, gx, _elev_bub_cy, bubble_r, g.label, txt_grid_h, bubble_lw)
        _log(f"§GRID_BUBBLE face={face} grid={g.label} end=top "
             f"cx={gx/scale:.1f} cy={_elev_bub_cy/scale:.1f} r={bubble_r/scale:.1f} src=2d_grid_style")
        _draw_grid_bubble(msp, gx, _elev_bub_bot, bubble_r, g.label, txt_grid_h, bubble_lw)
        _log(f"§GRID_BUBBLE face={face} grid={g.label} end=bot "
             f"cx={gx/scale:.1f} cy={_elev_bub_bot/scale:.1f} r={bubble_r/scale:.1f} src=2d_grid_style")
    _log(f"§GRID_BUBBLE_Y ELEV: top_cy={_elev_bub_cy/scale:.1f}mm bot_cy={_elev_bub_bot/scale:.1f}mm "
         f"tier_1_y={(grid_above + tier_1_off)/scale:.1f}mm "
         f"grid_above={grid_above/scale:.1f}mm "
         f"(bubble>t1>t2>grid_above: {_elev_bub_cy > grid_above + tier_1_off > grid_above + tier_2_off > grid_above})")

    # ── §6.1 Bay dimensions — tier 2 between grid_above and bubble (§I-29) ──
    dim_txt_h = txt_dim * scale
    if len(face_grids) >= 2:
        dim_y = grid_above + tier_2_off  # §I-29: dim BELOW bubble
        # §6.1 I-24: one tick per endpoint — skip if already drawn at this (dim_y, x)
        _elev_drawn_ticks: set = set()
        # §6.1 I-23: only draw bay dims when more than 1 bay (suppress tier-2 = tier-1)
        if len(face_grids) > 2:
            for i in range(len(face_grids) - 1):
                xa = _mh(face_grids[i].position)
                xb = _mh(face_grids[i + 1].position)
                bay_mm = abs(face_grids[i + 1].position - face_grids[i].position) * 1000
                snapped = round(bay_mm / SNAP_MODULE) * SNAP_MODULE
                _log(f"§2.4 Bay dim {face_grids[i].label}→{face_grids[i+1].label} = {int(snapped)}mm")
                # §H: manual tick pattern — consistent with floor/roof plan dims
                mid_x = (xa + xb) / 2
                msp.add_line((xa, dim_y), (xb, dim_y),
                             dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
                ext_bot = grid_above + grid_gap
                for tx in (xa, xb):
                    msp.add_line((tx, ext_bot), (tx, dim_y + grid_gap),
                                 dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
                    _tk = (round(dim_y, 2), round(tx, 2))
                    if _tk not in _elev_drawn_ticks:
                        _elev_drawn_ticks.add(_tk)
                        msp.add_line((tx - tick_dx, dim_y - tick_dy),
                                     (tx + tick_dx, dim_y + tick_dy),
                                     dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
                msp.add_text(str(int(snapped)),
                             dxfattribs={'layer': 'A-ANNO-DIMS', 'height': dim_txt_h}
                             ).set_placement((mid_x, dim_y - dim_txt_h * 2.5),
                                             align=TextEntityAlignment.MIDDLE_CENTER)

    # ── §I-37: Load dimension style from 2d_dimension_style ──
    _dim_unit_suffix = ''
    for _try_db in [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'input', '2D.db'),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib', 'input', '2D.db'),
    ]:
        if os.path.exists(_try_db):
            _db2d = sqlite3.connect(_try_db)
            _drow = _db2d.execute(
                "SELECT unit FROM [2d_dimension_style] LIMIT 1").fetchone()
            if _drow:
                _dim_unit_suffix = _drow[0] or ''
            _db2d.close()
            break

    # ── §6.2 Height dimension chain (right side) — annotation_face only (§I-36) ──
    if not is_form_face:
      _tpl_p = tpl.get('paper', {})
      _ml_mm = _tpl_p.get('margins', {}).get('left', 25)
      _mr_mm = _tpl_p.get('margins', {}).get('right', 10)
      _pw_mm = _tpl_p.get('width_mm', 420)
      _tb_w_mm = _tpl_p.get('title_block_width_mm', 120)
      _content_w = (_pw_mm - _ml_mm - _mr_mm - _tb_w_mm) * scale
      _bld_w = _mh(h_max_m + ext) - _mh(h_min_m - ext)
      _sheet_x = _mh(h_min_m - ext) - _ml_mm * scale - max(0, (_content_w - _bld_w) / 2)
      _tb_left_model = _sheet_x + _pw_mm * scale - _mr_mm * scale - _tb_w_mm * scale
      _panel_gap = tpl_dims.get('panel_clearance_mm', 5.0) * scale
      _dim_right_max = _tb_left_model - _panel_gap - tier_1_off

      height_levels = [(lbl, lz) for lbl, lz in levels if lbl not in ('APRON', 'GRD')]
      height_levels = sorted(height_levels, key=lambda x: x[1])

      if len(height_levels) >= 2:
        h_dim_x_base = min(_mh(h_max_m + ext + 0.5), _dim_right_max)

        # Tier 2: individual height diffs (inner)
        h_dim_x = h_dim_x_base + tier_2_off
        for i in range(len(height_levels) - 1):
            z0 = _mh(height_levels[i][1])
            z1 = _mh(height_levels[i + 1][1])
            diff_mm = abs(height_levels[i + 1][1] - height_levels[i][1]) * 1000
            snapped = round(diff_mm / SNAP_MODULE) * SNAP_MODULE
            _log(f"§2.4 Height {height_levels[i][0]}→{height_levels[i+1][0]} = {int(snapped)}mm")
            msp.add_line((h_dim_x, z0), (h_dim_x, z1),
                         dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            msp.add_line((_mh(h_max_m + ext), z0), (h_dim_x, z0),
                         dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            msp.add_line((_mh(h_max_m + ext), z1), (h_dim_x, z1),
                         dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            for tz in (z0, z1):
                msp.add_line((h_dim_x - tick_dx, tz - tick_dy),
                             (h_dim_x + tick_dx, tz + tick_dy),
                             dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            mid_z = (z0 + z1) / 2
            _span_fmt = str(int(snapped)) + _dim_unit_suffix
            msp.add_text(_span_fmt,
                         dxfattribs={'layer': 'A-ANNO-DIMS', 'height': dim_txt_h,
                                     'rotation': 90}
                         ).set_placement((h_dim_x + dim_txt_h * 0.3, mid_z),
                                         align=TextEntityAlignment.MIDDLE_CENTER)
            _log(f"§HEIGHT_DIM span={height_levels[i][0]}→{height_levels[i+1][0]} "
                 f"delta={int(snapped)}mm fmt='{_span_fmt}' "
                 f"unit={_dim_unit_suffix or 'mm'} src=2d_dimension_style")

        # Tier 1: overall height (outer)
        h_dim_x2 = h_dim_x_base + tier_1_off
        z_bot = _mh(height_levels[0][1])
        z_top = _mh(height_levels[-1][1])
        total_mm = abs(height_levels[-1][1] - height_levels[0][1]) * 1000
        total_snapped = round(total_mm / SNAP_MODULE) * SNAP_MODULE
        msp.add_line((h_dim_x2, z_bot), (h_dim_x2, z_top),
                     dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
        msp.add_line((h_dim_x, z_bot), (h_dim_x2, z_bot),
                     dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
        msp.add_line((h_dim_x, z_top), (h_dim_x2, z_top),
                     dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
        for tz in (z_bot, z_top):
            msp.add_line((h_dim_x2 - tick_dx, tz - tick_dy),
                         (h_dim_x2 + tick_dx, tz + tick_dy),
                         dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
        mid_z = (z_bot + z_top) / 2
        _total_fmt = str(int(total_snapped)) + _dim_unit_suffix
        msp.add_text(_total_fmt,
                     dxfattribs={'layer': 'A-ANNO-DIMS', 'height': dim_txt_h,
                                 'rotation': 90}
                     ).set_placement((h_dim_x2 + dim_txt_h * 0.3, mid_z),
                                     align=TextEntityAlignment.MIDDLE_CENTER)
        _log(f"§HEIGHT_DIM span={height_levels[0][0]}→{height_levels[-1][0]} "
             f"delta={int(total_snapped)}mm fmt='{_total_fmt}' "
             f"unit={_dim_unit_suffix or 'mm'} src=2d_dimension_style (tier-1 total)")

    # ── §5.0: Sheet furniture (border, title block, north arrow) ──
    _face_dt = {
        'front': ('FRONT ELEVATION', 'A-02'),
        'rear':  ('REAR ELEVATION',  'A-03'),
        'left':  ('LEFT ELEVATION',  'A-04'),
        'right': ('RIGHT ELEVATION', 'A-05'),
    }
    dt_title, dt_no = _face_dt.get(face, ('ELEVATION', ''))
    # Bounding box in model-space mm for sheet layout
    bld_h0 = _mh(h_min_m - ext)
    bld_h1 = _mh(h_max_m + ext)
    bld_v0 = _mh(min(lz for _, lz in levels)) if levels else 0
    bld_v1 = _mh(max(lz for _, lz in levels)) if levels else _mh(3.5)
    bld_type, bld_name = _infer_building_identity(db_path)
    _draw_sheet_layout(doc, msp, tpl, bld_h0, bld_h1, bld_v0, bld_v1,
                       drawing_title=dt_title, drawing_no=dt_no, scale=scale,
                       view_type='elevation',
                       building_type=bld_type, building_name=bld_name)

    # ── §2 Step 8: VERIFY ──
    _log(f"§2.8 Elevation {face} ({_face_class}): {len(face_elems)} elements, "
         f"{len(face_grids)} grids")
    doc.saveas(out_dxf)
    _log(f"  → {out_dxf}")
    _audit_dxf(doc, out_dxf, f"ELEVATION {face.upper()}")


# ─────────────────────────────────────────────────────────────────
# ROOF MESH HULL — §5.3, §1 R1 (no invention)
# ─────────────────────────────────────────────────────────────────

def _mesh_hulls(db_path, ifc_class):
    """§1 R8: Shared mesh-to-hull extraction for any element type.
    Returns (outer_hull, inner_hull, thickness_m).
    outer_hull: XY convex hull of all mesh vertices.
    inner_hull: outer_hull offset inward by slab thickness (§1 R8 shared code).
    thickness_m: measured from mesh edge Z-range at boundary vertices.
    """
    conn = sqlite3.connect(db_path)
    rows = conn.execute("""
        SELECT bg.vertices, bg.vertex_count
        FROM elements_meta m
        JOIN element_instances ei ON m.guid = ei.guid
        JOIN base_geometries bg   ON ei.geometry_hash = bg.geometry_hash
        WHERE m.ifc_class = ?
    """, (ifc_class,)).fetchall()
    conn.close()

    all_verts = []
    for vert_blob, vertex_count in rows:
        if vert_blob is None:
            continue
        verts = parse_vertices_blob(vert_blob, vertex_count)
        all_verts.append(verts)

    if not all_verts:
        _log(f"§DATA {ifc_class} mesh: 0 vertices — no mesh data")
        return ([], [], 0.0)

    import numpy as np
    combined = np.concatenate(all_verts)
    all_xy = [(float(x), float(y)) for x, y in combined[:, :2]]
    outer_hull = _convex_hull_2d(all_xy)

    if len(outer_hull) < 3:
        return ([], [], 0.0)

    # Measure slab thickness from boundary vertex Z-range
    # At each hull edge midpoint, find nearby vertices and measure Z span
    thicknesses = []
    for verts in all_verts:
        y_min, y_max = float(verts[:, 1].min()), float(verts[:, 1].max())
        x_min, x_max = float(verts[:, 0].min()), float(verts[:, 0].max())
        for edge_val, axis in [(y_min, 1), (y_max, 1), (x_min, 0), (x_max, 0)]:
            edge_verts = verts[abs(verts[:, axis] - edge_val) < 0.01]
            if len(edge_verts) >= 2:
                z_span = float(edge_verts[:, 2].max() - edge_verts[:, 2].min())
                if z_span > 0.01:
                    thicknesses.append(z_span)

    thickness_m = min(thicknesses) if thicknesses else 0.0
    inner_hull = _inward_offset_hull(outer_hull, thickness_m) if thickness_m > 0.01 else []

    n_verts = len(all_xy)
    _log(f"§DATA {ifc_class} mesh: {n_verts} vertices, thickness={thickness_m:.3f}m")
    _log(f"§DATA outer hull: {len(outer_hull)} pts, inner hull: {len(inner_hull)} pts")
    return (outer_hull, inner_hull, thickness_m)


# ─────────────────────────────────────────────────────────────────
# ROOF PLAN — §5.3, §9.6 R4
# ─────────────────────────────────────────────────────────────────

def write_roof_plan_dxf(db_path: str, out_dxf: str, scale: int = SCALE):
    """Generate roof plan DXF — top-down view of roof with ridge, slope arrows,
    overhang dimensions, and grids. Ported from drawing_writer.py draw_roof_plan.

    §5.3: Bay grids same as floor plan. Ridge line dashed. Slope arrows
    from ridge toward eave. Eave overhang dimensions.
    """
    from section_cut import section_cut as run_section_cut
    tpl = _load_template()
    elements = read_elements(db_path, storey_filter=None)
    walls = elements['walls']
    roofs = elements['roofs']

    if not roofs:
        _log("§5.3 Roof plan: no roof elements found (§5.3a rules 1-3 all failed), skipping")
        return

    # ── Template reads ──
    tpl_grid = tpl.get('grid', {})
    tpl_dims = tpl.get('dimensions', {})
    tpl_lw   = tpl.get('line_weights', {})
    lw_wall  = int(tpl_lw.get('wall_exterior_cut', 0.50) * 100)
    lw_part  = int(tpl_lw.get('wall_partition_cut', 0.35) * 100)
    lw_grid  = int(tpl_lw.get('grid_line', 0.18) * 100)
    lw_dim   = int(tpl_lw.get('dimension_line', 0.18) * 100)
    lw_glaz  = int(tpl_lw.get('glass', 0.25) * 100)

    _log(f"§2.1 Roof plan: template loaded")

    # ── Roof extent ──
    roof_min_x = min(r.min_x for r in roofs)
    roof_max_x = max(r.max_x for r in roofs)
    roof_min_y = min(r.min_y for r in roofs)
    roof_max_y = max(r.max_y for r in roofs)
    roof_min_z = min(r.min_z for r in roofs)
    roof_max_z = max(r.max_z for r in roofs)

    # §5.3b: flat roof detection — pitched if Z-span > 0.5m
    is_flat = (roof_max_z - roof_min_z) <= 0.5
    _log(f"§5.3b roof_type={'FLAT' if is_flat else 'PITCHED'} "
         f"z_span={roof_max_z - roof_min_z:.3f}m")

    # ── Building footprint from walls ──
    all_walls = elements['walls']
    if all_walls:
        bld_min_x = min(w.min_x for w in all_walls)
        bld_max_x = max(w.max_x for w in all_walls)
        bld_min_y = min(w.min_y for w in all_walls)
        bld_max_y = max(w.max_y for w in all_walls)
    else:
        bld_min_x, bld_max_x = roof_min_x, roof_max_x
        bld_min_y, bld_max_y = roof_min_y, roof_max_y

    # ── Create DXF ──
    doc = _new_doc(tpl, scale)
    msp = doc.modelspace()

    txt_h = tpl_dims.get('text_height_mm', 2.5) * scale

    # ── Building footprint reference (dashed, grid layer) ──
    bf_pts = [(_mh(bld_min_x), _mh(bld_min_y)), (_mh(bld_max_x), _mh(bld_min_y)),
              (_mh(bld_max_x), _mh(bld_max_y)), (_mh(bld_min_x), _mh(bld_max_y))]
    msp.add_lwpolyline(bf_pts, close=True,
                       dxfattribs={'layer': 'A-GRID', 'lineweight': lw_grid})

    # ── Roof outline: mesh hull (§1 R1 — no bbox invention, §1 R8 shared) ──
    outer_hull, inner_hull, _thickness = _mesh_hulls(db_path, 'IfcRoof')
    if len(outer_hull) >= 3:
        outer_pts = [(_mh(x), _mh(y)) for x, y in outer_hull]
        msp.add_lwpolyline(outer_pts, close=True,
                           dxfattribs={'layer': 'A-ROOF', 'lineweight': lw_wall})
        _log(f"§RENDER ROOF_OUTER hull={len(outer_pts)} pts src=base_geometries.vertices")
    else:
        # Fallback: only if no mesh data at all (not an excuse to invent)
        _log("§WARN ROOF_OUTER no mesh data — skipping outline (R1: no invention)")

    if len(inner_hull) >= 3:
        inner_pts = [(_mh(x), _mh(y)) for x, y in inner_hull]
        msp.add_lwpolyline(inner_pts, close=True,
                           dxfattribs={'layer': 'A-ROOF', 'lineweight': lw_part})
        _log(f"§RENDER ROOF_INNER hull={len(inner_pts)} pts src=base_geometries.vertices")

    db_levels = _read_2d_db_levels()

    if is_flat:
        # §5.3b FLAT ROOF: parapet walls outline, skylights, drains, label
        # Parapet walls from "Roof" storey — draw as bold inner rectangle
        parapet_walls = [e for e in elements['walls']
                         if e.storey and 'Roof' in e.storey]
        if parapet_walls:
            pw_min_x = min(w.min_x for w in parapet_walls)
            pw_max_x = max(w.max_x for w in parapet_walls)
            pw_min_y = min(w.min_y for w in parapet_walls)
            pw_max_y = max(w.max_y for w in parapet_walls)
            pw_pts = [(_mh(pw_min_x), _mh(pw_min_y)), (_mh(pw_max_x), _mh(pw_min_y)),
                      (_mh(pw_max_x), _mh(pw_max_y)), (_mh(pw_min_x), _mh(pw_max_y))]
            msp.add_lwpolyline(pw_pts, close=True,
                               dxfattribs={'layer': 'A-ROOF', 'lineweight': lw_part})
            _log(f"§5.3b parapet bbox: "
                 f"X={pw_min_x:.2f}-{pw_max_x:.2f} Y={pw_min_y:.2f}-{pw_max_y:.2f}")

        # Skylights — IfcWindow in Roof storey
        roof_windows = [e for e in elements['windows']
                        if e.storey and 'Roof' in e.storey]
        for w in roof_windows:
            cx, cy = _mh(w.center_x), _mh(w.center_y)
            hw, hh = _mh(w.width_x / 2), _mh(w.width_y / 2)
            # Rectangle + cross = skylight symbol
            sk_pts = [(cx - hw, cy - hh), (cx + hw, cy - hh),
                      (cx + hw, cy + hh), (cx - hw, cy + hh)]
            msp.add_lwpolyline(sk_pts, close=True,
                               dxfattribs={'layer': 'A-GLAZ', 'lineweight': lw_glaz})
            msp.add_line((cx - hw, cy - hh), (cx + hw, cy + hh),
                         dxfattribs={'layer': 'A-GLAZ', 'lineweight': lw_glaz})
            msp.add_line((cx + hw, cy - hh), (cx - hw, cy + hh),
                         dxfattribs={'layer': 'A-GLAZ', 'lineweight': lw_glaz})
        _log(f"§5.3b skylights: {len(roof_windows)}")

        # Roof drains — IfcFlowFitting in Roof storey / Unknown at top-Z
        drains = [e for e in elements['other']
                  if 'Drain' in (e.name or '') and e.max_z >= roof_min_z]
        tpl_roof_drain = tpl.get('roof_plan', {})
        _dr_mm = tpl_roof_drain.get('drain_symbol_radius_mm', 2.0)
        _log(f"§VALUE roof_plan.drain_symbol_radius_mm={_dr_mm} (from template)")
        for d in drains:
            cx, cy = _mh(d.center_x), _mh(d.center_y)
            dr = _dr_mm * scale
            _log(f"§RENDER DRAIN_SYMBOL r={_dr_mm}mm at ({cx:.0f},{cy:.0f}) "
                 f"src=template.roof_plan.drain_symbol_radius_mm")
            msp.add_circle((cx, cy), dr,
                           dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            msp.add_line((cx - dr, cy), (cx + dr, cy),
                         dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            msp.add_line((cx, cy - dr), (cx, cy + dr),
                         dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
        _log(f"§5.3b drains: {len(drains)}")

        # Flat roof label at centroid
        flat_label = 'BUMBUNG RATA / FLAT ROOF'
        mid_x = _mh((roof_min_x + roof_max_x) / 2)
        mid_y = _mh((roof_min_y + roof_max_y) / 2)
        msp.add_text(flat_label,
                     dxfattribs={'layer': 'A-ANNO-TEXT', 'height': txt_h}
                     ).set_placement((mid_x, mid_y), align=TextEntityAlignment.MIDDLE_CENTER)

    else:
        # §5.3b PITCHED ROOF: ridge line, slope arrows, eave labels
        ridge_y = (roof_min_y + roof_max_y) / 2
        try:
            ridge_cut = run_section_cut(db_path, cut_z=roof_max_z - 0.1)
            for se in ridge_cut:
                if se.ifc_class == 'IfcRoof' and se.contours:
                    all_pts = [p for c in se.contours for p in c.points]
                    if all_pts:
                        ridge_y = sum(p[1] for p in all_pts) / len(all_pts)
                    break
        except Exception:
            pass
        _log(f"§5.3 Ridge Y={ridge_y:.3f}m, roof Z={roof_max_z:.3f}m")

        # Ridge line (dashed)
        msp.add_line((_mh(roof_min_x), _mh(ridge_y)),
                     (_mh(roof_max_x), _mh(ridge_y)),
                     dxfattribs={'layer': 'A-ROOF', 'lineweight': lw_part,
                                 'linetype': _linestyle_to_dxf(
                                     tpl.get('line_styles', {}).get('ridge_line', 'dashed'))})
        ridge_label = db_levels['level_labels'].get('RIDGE', 'RABUNG / RIDGE')
        eave_label  = db_levels['level_labels'].get('EAVE', 'CUCURAN / EAVE')
        rdg_mid_x = _mh((roof_min_x + roof_max_x) / 2)
        msp.add_text(ridge_label,
                     dxfattribs={'layer': 'A-ANNO-TEXT', 'height': txt_h}
                     ).set_placement((rdg_mid_x, _mh(ridge_y) + txt_h * 1.5),
                                     align=TextEntityAlignment.MIDDLE_CENTER)
        eave_mid_x = rdg_mid_x
        msp.add_text(eave_label,
                     dxfattribs={'layer': 'A-ANNO-TEXT', 'height': txt_h}
                     ).set_placement((eave_mid_x, _mh(roof_max_y) + txt_h * 2),
                                     align=TextEntityAlignment.MIDDLE_CENTER)
        msp.add_text(eave_label,
                     dxfattribs={'layer': 'A-ANNO-TEXT', 'height': txt_h}
                     ).set_placement((eave_mid_x, _mh(roof_min_y) - txt_h * 2),
                                     align=TextEntityAlignment.MIDDLE_CENTER)

        # Slope arrows — one per grid bay, ridge toward eave
        columns = [e for e in elements.get('other', []) if e.ifc_class == 'IfcColumn']
        grids_for_arrows = snap_grids(derive_grids(all_walls, columns=columns, template=tpl))
        x_grids = sorted([g for g in grids_for_arrows if g.axis == 'x'],
                         key=lambda g: g.position)
        n_bays = max(len(x_grids) - 1, 1)
        roof_w_mm = _mh(roof_max_x - roof_min_x)
        arrow_spacing = roof_w_mm / (n_bays + 1)
        tpl_roof = tpl.get('roof_plan', {})
        _ah_mm = tpl_roof.get('slope_arrow_head_mm', 1.5)
        _ah_ratio = tpl_roof.get('slope_arrow_aspect_ratio', 1.5)
        arrow_head = _ah_mm * scale
        _log(f"§VALUE roof_plan.slope_arrow_head_mm={_ah_mm} (from template)")
        _log(f"§VALUE roof_plan.slope_arrow_aspect_ratio={_ah_ratio} (from template)")
        for i in range(1, n_bays + 1):
            ax = _mh(roof_min_x) + arrow_spacing * i
            n_start = _mh(ridge_y) + 5 * scale
            n_end   = _mh(ridge_y) + (_mh(roof_max_y) - _mh(ridge_y)) * 0.6
            msp.add_line((ax, n_start), (ax, n_end),
                         dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            msp.add_solid([(ax, n_end), (ax - arrow_head, n_end - arrow_head * _ah_ratio),
                           (ax + arrow_head, n_end - arrow_head * _ah_ratio)],
                          dxfattribs={'layer': 'A-ANNO-DIMS'})
            s_start = _mh(ridge_y) - 5 * scale
            s_end   = _mh(ridge_y) - (_mh(ridge_y) - _mh(roof_min_y)) * 0.6
            msp.add_line((ax, s_start), (ax, s_end),
                         dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            msp.add_solid([(ax, s_end), (ax - arrow_head, s_end + arrow_head * _ah_ratio),
                           (ax + arrow_head, s_end + arrow_head * _ah_ratio)],
                          dxfattribs={'layer': 'A-ANNO-DIMS'})
            _log(f"§RENDER SLOPE_ARROW head={_ah_mm}mm ratio={_ah_ratio} "
                 f"at ({ax:.0f},{n_end:.0f}) "
                 f"src=template.roof_plan.slope_arrow_head_mm+aspect_ratio")

    # ── Grids (§4.4: same bay grids as floor plan) — shared by both roof types ──
    columns = [e for e in elements.get('other', []) if e.ifc_class == 'IfcColumn']
    grids = snap_grids(derive_grids(all_walls, columns=columns, template=tpl))

    # ── Overhang dimensions (pitched only — flat has no eave overhang) ──
    if not is_flat:
      overhang_n = (roof_max_y - bld_max_y) * 1000
      overhang_s = (bld_min_y - roof_min_y) * 1000
      overhang_e = (roof_max_x - bld_max_x) * 1000
      overhang_w = (bld_min_x - roof_min_x) * 1000
      _log(f"§5.3 Overhang N={overhang_n:.0f} S={overhang_s:.0f} "
           f"E={overhang_e:.0f} W={overhang_w:.0f} mm")

      snap = tpl_dims.get('snap_module_mm', 100)
      dim_off = tpl_dims.get('tier_2_offset_mm', 18) * scale
      # North overhang (right side, vertical dim)
      if overhang_n > 50:
          dim_x = _mh(roof_max_x) + dim_off
          y_wall = _mh(bld_max_y)
          y_eave = _mh(roof_max_y)
          msp.add_line((dim_x, y_wall), (dim_x, y_eave),
                       dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
          val = int(round(overhang_n / snap) * snap)
          msp.add_text(str(val),
                       dxfattribs={'layer': 'A-ANNO-DIMS', 'height': txt_h, 'rotation': 90}
                       ).set_placement(
                           (dim_x + txt_h, (y_wall + y_eave) / 2),
                           align=TextEntityAlignment.MIDDLE_CENTER)
      # South overhang
      if overhang_s > 50:
          dim_x = _mh(roof_max_x) + dim_off
          y_wall = _mh(bld_min_y)
          y_eave = _mh(roof_min_y)
          msp.add_line((dim_x, y_eave), (dim_x, y_wall),
                       dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
          val = int(round(overhang_s / snap) * snap)
          msp.add_text(str(val),
                       dxfattribs={'layer': 'A-ANNO-DIMS', 'height': txt_h, 'rotation': 90}
                       ).set_placement(
                           (dim_x + txt_h, (y_eave + y_wall) / 2),
                           align=TextEntityAlignment.MIDDLE_CENTER)
      # East overhang
      if overhang_e > 50:
          dim_y = _mh(roof_max_y) + dim_off
          x_wall = _mh(bld_max_x)
          x_eave = _mh(roof_max_x)
          msp.add_line((x_wall, dim_y), (x_eave, dim_y),
                       dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
          val = int(round(overhang_e / snap) * snap)
          msp.add_text(str(val),
                       dxfattribs={'layer': 'A-ANNO-DIMS', 'height': txt_h}
                       ).set_placement(
                           ((x_wall + x_eave) / 2, dim_y + txt_h),
                           align=TextEntityAlignment.MIDDLE_CENTER)
      # West overhang
      if overhang_w > 50:
          dim_y = _mh(roof_max_y) + dim_off
          x_eave = _mh(roof_min_x)
          x_wall = _mh(bld_min_x)
          msp.add_line((x_eave, dim_y), (x_wall, dim_y),
                       dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
          val = int(round(overhang_w / snap) * snap)
          msp.add_text(str(val),
                       dxfattribs={'layer': 'A-ANNO-DIMS', 'height': txt_h}
                       ).set_placement(
                           ((x_eave + x_wall) / 2, dim_y + txt_h),
                           align=TextEntityAlignment.MIDDLE_CENTER)

    # ── Grid rendering ──
    grid_ext = tpl_grid.get('extend_beyond_building_mm', 15) * scale
    bubble_r = tpl_grid.get('bubble_radius_mm', 4.0) * scale
    bubble_lw = int(tpl_grid.get('bubble_stroke_mm', 0.25) * 100)
    txt_grid_h = tpl_grid.get('label_font_height_mm', 3.0) * scale
    grid_gap = tpl_dims.get('extension_gap_mm', 2.0) * scale

    # Use roof extent for grid line boundaries
    r_min_x = _mh(roof_min_x)
    r_max_x = _mh(roof_max_x)
    r_min_y = _mh(roof_min_y)
    r_max_y = _mh(roof_max_y)
    # §I-29: bubble beyond tier_1 dim
    _t1r = DIM_OFFSET_2 * scale

    for g in grids:
        pos = g.position * MM
        if g.axis == 'x':
            msp.add_line((pos, r_min_y - grid_ext - bubble_r * 2),
                         (pos, r_max_y + _t1r + grid_ext + bubble_r * 2),
                         dxfattribs={'layer': 'A-GRID', 'lineweight': lw_grid})
            for cy in (r_max_y + _t1r + grid_ext + bubble_r,
                       r_min_y - grid_ext - bubble_r):
                _draw_grid_bubble(msp, pos, cy, bubble_r, g.label, txt_grid_h, bubble_lw)
        else:
            msp.add_line((r_min_x - _t1r - grid_ext - bubble_r * 2, pos),
                         (r_max_x + grid_ext + bubble_r * 2, pos),
                         dxfattribs={'layer': 'A-GRID', 'lineweight': lw_grid})
            for cx in (r_max_x + grid_ext + bubble_r,
                       r_min_x - _t1r - grid_ext - bubble_r):
                _draw_grid_bubble(msp, cx, pos, bubble_r, g.label, txt_grid_h, bubble_lw)
    _log(f"§2.3 Roof grids: {len(grids)}")

    # ── Bay dimensions ──
    dims = generate_dimensions(grids)
    # §15.2: triage grid dims for roof plan
    crowding_mm = tpl.get('grid', {}).get('crowding_threshold_mm', 15.0)
    _roof_inline, _roof_panel = _triage_grid_dims(grids, scale, crowding_mm)
    _roof_panel_keys = frozenset((b.label1, b.label2) for b in _roof_panel)
    tick_len = tpl_dims.get('tick_half_length_mm', 1.5) * scale
    tick_angle = math.radians(tpl_dims.get('tick_angle_deg', 45))
    tick_dx = tick_len * math.cos(tick_angle)
    tick_dy = tick_len * math.sin(tick_angle)
    # §6.1 I-24: one tick per endpoint per dim row
    _roof_drawn_ticks: set = set()
    for d in dims:
        s = d.start * MM
        e = d.end * MM
        off = d.offset * scale
        _is_panel = (d.from_label, d.to_label) in _roof_panel_keys
        if d.axis == 'x':
            # §B: dim from building edge; bubble outermost
            dim_y = r_max_y + off
            msp.add_line((s, dim_y), (e, dim_y),
                         dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            for tx in (s, e):
                _tk = (round(dim_y, 2), round(tx, 2))
                if _tk not in _roof_drawn_ticks:
                    _roof_drawn_ticks.add(_tk)
                    msp.add_line((tx - tick_dx, dim_y - tick_dy), (tx + tick_dx, dim_y + tick_dy),
                                 dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            if not _is_panel:
                msp.add_text(d.text,
                             dxfattribs={'layer': 'A-ANNO-DIMS', 'height': txt_h}
                             ).set_placement(((s + e) / 2, dim_y + txt_h),
                                             align=TextEntityAlignment.MIDDLE_CENTER)
        else:
            # §B: dim from building left edge; bubble outermost left
            dim_x = r_min_x - off
            msp.add_line((dim_x, s), (dim_x, e),
                         dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            for ty in (s, e):
                _tk = (round(dim_x, 2), round(ty, 2))
                if _tk not in _roof_drawn_ticks:
                    _roof_drawn_ticks.add(_tk)
                    msp.add_line((dim_x - tick_dx, ty - tick_dy), (dim_x + tick_dx, ty + tick_dy),
                                 dxfattribs={'layer': 'A-ANNO-DIMS', 'lineweight': lw_dim})
            if not _is_panel:
                msp.add_text(d.text,
                             dxfattribs={'layer': 'A-ANNO-DIMS', 'height': txt_h,
                                         'rotation': 90}
                             ).set_placement((dim_x - txt_h, (s + e) / 2),
                                             align=TextEntityAlignment.MIDDLE_CENTER)

    # ── Sheet layout ──
    bld_type, bld_name = _infer_building_identity(db_path)
    _draw_sheet_layout(doc, msp, tpl, r_min_x, r_max_x, r_min_y, r_max_y,
                       drawing_title='ROOF PLAN', drawing_no='A-06', scale=scale,
                       building_type=bld_type, building_name=bld_name, grids=grids,
                       panel_bays=_roof_panel)

    _log(f"§2.8 Roof plan: {len(roofs)} roof(s), {len(grids)} grids, "
         f"type={'FLAT' if is_flat else 'PITCHED'}")
    doc.saveas(out_dxf)
    _log(f"  → {out_dxf}")
    _audit_dxf(doc, out_dxf, "ROOF PLAN")


# ─────────────────────────────────────────────────────────────────
# MEP PLAN  (§D stub — S159)
# ─────────────────────────────────────────────────────────────────

# §I-21: lookup symbol_code from 2d_drawing_symbol via template keyword_to_symbol map.
# Longest-match wins (sorted descending by key length).
def _lookup_symbol_code(element_name: str, tpl: dict) -> str | None:
    """Return symbol_code from template.mep.keyword_to_symbol or None if no match."""
    mapping = tpl.get('mep', {}).get('keyword_to_symbol', {})
    low = (element_name or '').lower()
    for kw in sorted(mapping, key=len, reverse=True):
        if kw in low:
            return mapping[kw]
    return None


# Keyword classifiers for IfcFlowTerminal element_name
def _classify_mep(element_name: str, tpl: dict) -> str:
    """Return 'ELECTRICAL', 'PLUMBING', or 'MEP' (general).
    Keywords read from tpl['mep']['electrical_keywords'] / ['plumbing_keywords'].
    """
    tpl_mep = tpl.get('mep', {})
    elec_kw = tpl_mep.get('electrical_keywords',
                          ['light', 'fan', 'switch', 'outlet', 'telephone', 'power',
                           'socket', 'panel', 'meter', 'luminaire', 'lamp'])
    plmb_kw = tpl_mep.get('plumbing_keywords',
                          ['water closet', 'sink', 'shower', 'basin', 'bath',
                           'drain', 'trap', 'toilet', 'bidet', 'urinal',
                           'pipe', 'plumbing'])
    low = element_name.lower()
    if any(k in low for k in elec_kw):
        return 'ELECTRICAL'
    if any(k in low for k in plmb_kw):
        return 'PLUMBING'
    return 'MEP'


def _draw_mep_symbol(msp, cx: float, cy: float, discipline: str,
                     r: float, lw: int, tpl: dict, symbol_code: str | None = None):
    """Draw a geometric symbol for an MEP terminal at model (cx, cy).
    §I-21: when symbol_code is set, draw per-code geometry (§14.3, §17.2).
    Fallback: discipline-level generic shape from template.mep.symbols.
    """
    tpl_mep = tpl.get('mep', {})
    sym_def = tpl_mep.get('symbols', {}).get(discipline,
              {'shape': 'circle_dot', 'layer': 'A-MEP-PLMB'})
    layer = sym_def.get('layer', 'A-MEP-PLMB')
    inner_dot_r_factor = tpl_mep.get('inner_dot_radius_factor', 0.25)

    if symbol_code == 'CEILING_FAN':
        # §14.3: asterisk — 6 lines at 30° intervals through centre
        _log(f"§RENDER MEP_SYMBOL code=CEILING_FAN shape=asterisk6 r={r/SCALE:.2f}mm "
             f"layer={layer} at ({cx:.0f},{cy:.0f}) src=2d_drawing_symbol+template.mep.keyword_to_symbol")
        for i in range(6):
            angle = math.radians(i * 30)
            msp.add_line((cx + r * math.cos(angle), cy + r * math.sin(angle)),
                         (cx - r * math.cos(angle), cy - r * math.sin(angle)),
                         dxfattribs={'layer': layer, 'lineweight': lw})
    elif symbol_code == 'CEILING_LIGHT':
        # Circle with centre dot
        _log(f"§RENDER MEP_SYMBOL code=CEILING_LIGHT shape=circle_dot r={r/SCALE:.2f}mm "
             f"layer={layer} at ({cx:.0f},{cy:.0f}) src=2d_drawing_symbol+template.mep.keyword_to_symbol")
        msp.add_circle((cx, cy), r, dxfattribs={'layer': layer, 'lineweight': lw})
        msp.add_circle((cx, cy), r * inner_dot_r_factor,
                       dxfattribs={'layer': layer, 'lineweight': lw})
    elif symbol_code in ('SWITCH_1G', 'SWITCH_2G', 'SWITCH_3G'):
        # Line segment with small filled circle at one end (standard switch symbol)
        _log(f"§RENDER MEP_SYMBOL code={symbol_code} shape=switch_line r={r/SCALE:.2f}mm "
             f"layer={layer} at ({cx:.0f},{cy:.0f}) src=2d_drawing_symbol+template.mep.keyword_to_symbol")
        msp.add_line((cx, cy), (cx + r, cy + r),
                     dxfattribs={'layer': layer, 'lineweight': lw})
        msp.add_circle((cx, cy), r * 0.2,
                       dxfattribs={'layer': layer, 'lineweight': lw})
    elif symbol_code == 'POWER_POINT':
        # Circle with cross (standard power outlet)
        _log(f"§RENDER MEP_SYMBOL code=POWER_POINT shape=circle_cross r={r/SCALE:.2f}mm "
             f"layer={layer} at ({cx:.0f},{cy:.0f}) src=2d_drawing_symbol+template.mep.keyword_to_symbol")
        msp.add_circle((cx, cy), r, dxfattribs={'layer': layer, 'lineweight': lw})
        msp.add_line((cx - r, cy), (cx + r, cy),
                     dxfattribs={'layer': layer, 'lineweight': lw})
        msp.add_line((cx, cy - r), (cx, cy + r),
                     dxfattribs={'layer': layer, 'lineweight': lw})
    elif symbol_code in ('ELEC_METER', 'FUSE_BOARD', 'WALL_LIGHT',
                         'WC_SEAT', 'KITCHEN_SINK', 'BASIN',
                         'SHOWER', 'FLOOR_TRAP', 'GULLY_TRAP', 'TAP'):
        # Generic circle_dot for remaining library symbols — distinguishable from UNKNOWN
        _log(f"§RENDER MEP_SYMBOL code={symbol_code} shape=circle_dot r={r/SCALE:.2f}mm "
             f"layer={layer} at ({cx:.0f},{cy:.0f}) src=2d_drawing_symbol+template.mep.keyword_to_symbol")
        msp.add_circle((cx, cy), r, dxfattribs={'layer': layer, 'lineweight': lw})
        msp.add_circle((cx, cy), r * inner_dot_r_factor,
                       dxfattribs={'layer': layer, 'lineweight': lw})
    else:
        # Fallback: discipline-level generic shape — symbol not in 2d_drawing_symbol
        shape = sym_def.get('shape', 'circle_dot')
        _log(f"§RENDER MEP_SYMBOL code=FALLBACK shape={shape} r={r/SCALE:.2f}mm "
             f"layer={layer} at ({cx:.0f},{cy:.0f}) src=template.mep.symbols.{discipline}")
        if shape == 'circle_cross':
            msp.add_circle((cx, cy), r, dxfattribs={'layer': layer, 'lineweight': lw})
            msp.add_line((cx - r, cy), (cx + r, cy),
                         dxfattribs={'layer': layer, 'lineweight': lw})
            msp.add_line((cx, cy - r), (cx, cy + r),
                         dxfattribs={'layer': layer, 'lineweight': lw})
        else:
            msp.add_circle((cx, cy), r, dxfattribs={'layer': layer, 'lineweight': lw})
            msp.add_circle((cx, cy), r * inner_dot_r_factor,
                           dxfattribs={'layer': layer, 'lineweight': lw})


def write_mep_plan_dxf(db_path: str, discipline: str, out_dxf: str,
                       scale: int = SCALE,
                       drawing_title: str = None, drawing_no: str = None):
    """§D stub: MEP plan — floor plan background + flow terminal symbols + legend.
    discipline = 'PLUMBING' | 'ELECTRICAL' | 'MEP'
    Spec: S159 §D.
    Sources: elements_meta + elements_rtree (positions), drawing_template.json (style).
    """
    tpl  = _load_template()
    conn = sqlite3.connect(db_path)
    cur  = conn.cursor()

    doc = _new_doc(tpl, scale)
    msp = doc.modelspace()
    lw_wall  = _lw(tpl, 'wall_partition_cut')
    tpl_mep  = tpl.get('mep', {})
    _lw_mep_mm = tpl_mep.get('terminal_line_weight_mm', 0.18)
    lw_mep   = int(_lw_mep_mm * 100)
    _sym_r_mm = tpl_mep.get('terminal_symbol_radius_mm', 2.5)
    sym_r    = _sym_r_mm * scale  # symbol radius in model-space mm
    txt_h    = tpl.get('dimensions', {}).get('text_height_mm', 2.5) * scale
    _log(f"§VALUE mep.terminal_symbol_radius_mm={_sym_r_mm} (from template)")
    _log(f"§VALUE mep.terminal_line_weight_mm={_lw_mep_mm} (from template)")

    # ── Background: walls ──
    walls = read_elements(db_path)['walls']
    for w in walls:
        pts = [(_mh(w.min_x), _mh(w.min_y)), (_mh(w.max_x), _mh(w.min_y)),
               (_mh(w.max_x), _mh(w.max_y)), (_mh(w.min_x), _mh(w.max_y))]
        msp.add_lwpolyline(pts, close=True,
                           dxfattribs={'layer': 'A-WALL-FULL', 'lineweight': lw_wall})

    if not walls:
        _log(f"MEP plan: no walls — empty sheet")
        doc.saveas(out_dxf)
        conn.close()
        return

    bld_min_x = min(w.min_x for w in walls)
    bld_max_x = max(w.max_x for w in walls)
    bld_min_y = min(w.min_y for w in walls)
    bld_max_y = max(w.max_y for w in walls)

    # §I-21: load 2d_drawing_symbol library (symbol_code → symbol_name, width_mm)
    _2d_db_candidates = [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'input', '2D.db'),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lib', 'input', '2D.db'),
    ]
    _2d_db_path = next((p for p in _2d_db_candidates if os.path.exists(p)), None)
    _lib_conn = sqlite3.connect(_2d_db_path) if _2d_db_path else None
    _lib_cur  = _lib_conn.cursor() if _lib_conn else None
    if _lib_cur:
        _lib_cur.execute("SELECT symbol_code, symbol_name, width_mm FROM [2d_drawing_symbol]")
        _sym_lib = {row[0]: {'name': row[1], 'width_mm': row[2] or _sym_r_mm * 2}
                    for row in _lib_cur.fetchall()}
        _lib_conn.close()
        _log(f"§I-21 symbol library loaded: {len(_sym_lib)} entries from 2d_drawing_symbol "
             f"src={_2d_db_path}")
    else:
        _sym_lib = {}
        _log(f"§I-21 symbol library: 2D.db not found — all terminals will FALLBACK")

    # ── MEP terminals from elements_rtree — §17.7 footprint LWPOLYLINE ──
    cur.execute("""
        SELECT m.guid, m.element_name, r.minX, r.maxX, r.minY, r.maxY
        FROM elements_meta m JOIN elements_rtree r ON m.id = r.id
        WHERE m.ifc_class = 'IfcFlowTerminal'
    """)
    rows = cur.fetchall()

    # Legend keyed by element_name prefix → {name, count}
    legend_items = {}   # discipline → {name_key: {'name': str, 'count': int}}
    fallback_count = 0
    elem_count = 0
    for guid, name, minX, maxX, minY, maxY in rows:
        disc = _classify_mep(name or '', tpl)
        if discipline != 'MEP' and disc != discipline:
            continue
        sym_def = tpl_mep.get('symbols', {}).get(disc,
                  tpl_mep.get('symbols', {}).get('MEP', {'layer': 'A-MEP-PLMB'}))
        layer = sym_def.get('layer', 'A-MEP-PLMB')
        cx = (minX + maxX) / 2
        cy = (minY + maxY) / 2
        w_m = maxX - minX
        h_m = maxY - minY
        # §17.7: use IFC footprint bbox → LWPOLYLINE. Fallback if degenerate.
        _min_dim_m = 0.01  # 10mm minimum footprint to be meaningful
        if w_m >= _min_dim_m or h_m >= _min_dim_m:
            mx0, mx1 = _mh(minX), _mh(maxX)
            my0, my1 = _mh(minY), _mh(maxY)
            pts = [(mx0, my0), (mx1, my0), (mx1, my1), (mx0, my1)]
            poly = msp.add_lwpolyline(pts, dxfattribs={'layer': layer, 'lineweight': lw_mep})
            poly.close(True)
            _log(f"§SYMBOL_FOOTPRINT guid={guid} element='{name}' "
                 f"bbox=({w_m*1000:.0f}×{h_m*1000:.0f}mm) layer={layer} "
                 f"at ({_mh(cx):.0f},{_mh(cy):.0f})")
        else:
            # Degenerate bbox — fall back to circle
            msp.add_circle((_mh(cx), _mh(cy)), sym_r,
                           dxfattribs={'layer': layer, 'lineweight': lw_mep})
            _log(f"§SYMBOL_FALLBACK guid={guid} element='{name}' reason=no_rtree "
                 f"(w={w_m*1000:.0f}mm h={h_m*1000:.0f}mm < {_min_dim_m*1000:.0f}mm threshold)")
            fallback_count += 1
        # Legend: key by name prefix (up to first ':')
        name_key = (name or 'Unknown').split(':')[0].strip()
        disc_legend = legend_items.setdefault(disc, {})
        if name_key not in disc_legend:
            disc_legend[name_key] = {'name': name_key, 'count': 0}
        disc_legend[name_key]['count'] += 1
        elem_count += 1

    _log(f"§D MEP plan discipline={discipline}: {elem_count} terminals drawn, "
         f"{fallback_count} SYMBOL_FALLBACK (no_rtree)")

    # §17.3 P5: IfcFlowSegment rendering — thin lines along major bbox axis
    _lw_seg_mm = tpl_mep.get('segment_line_weight_mm', 0.13)
    lw_seg = int(_lw_seg_mm * 100)
    _log(f"§VALUE mep.segment_line_weight_mm={_lw_seg_mm} (from template)")
    cur.execute("""
        SELECT m.guid, m.element_name, m.ifc_class,
               r.minX, r.maxX, r.minY, r.maxY
        FROM elements_meta m JOIN elements_rtree r ON m.id = r.id
        WHERE m.ifc_class = 'IfcFlowSegment'
    """)
    seg_rows = cur.fetchall()
    conn.close()
    seg_count = 0
    for guid, name, ifc_class, minX, maxX, minY, maxY in seg_rows:
        disc = _classify_mep(name or '', tpl)
        if discipline != 'MEP' and disc != discipline:
            continue
        sym_def = tpl_mep.get('symbols', {}).get(disc, {'layer': 'A-MEP-PLMB'})
        layer = sym_def.get('layer', 'A-MEP-PLMB')
        # Orient by long axis: draw thin line between bbox long-axis endpoints
        dx = maxX - minX
        dy = maxY - minY
        if dx >= dy:
            # Horizontal run
            x1, y1 = _mh(minX), _mh((minY + maxY) / 2)
            x2, y2 = _mh(maxX), _mh((minY + maxY) / 2)
        else:
            # Vertical run
            x1, y1 = _mh((minX + maxX) / 2), _mh(minY)
            x2, y2 = _mh((minX + maxX) / 2), _mh(maxY)
        msp.add_line((x1, y1), (x2, y2),
                     dxfattribs={'layer': layer, 'lineweight': lw_seg})
        _log(f"§RENDER SEGMENT layer={layer} src=guid:{guid} "
             f"({x1:.0f},{y1:.0f})→({x2:.0f},{y2:.0f})")
        seg_count += 1
    _log(f"§D MEP segments: {seg_count} flow segments drawn")

    # ── §I-21 Legend: symbol_name from 2d_drawing_symbol, qty from count ──
    _tpl_syms = tpl_mep.get('symbols', {})
    legend_rows = []
    for disc, sym_codes in sorted(legend_items.items()):
        legend_rows.append({'tag': '', 'size': '', 'desc': f'── {disc} ──', 'qty': ''})
        for code, entry in sorted(sym_codes.items())[:10]:
            sym = _tpl_syms.get(disc, {}).get('legend_char', '\u25cf')
            _log(f"§LEGEND code={code} name='{entry['name']}' qty={entry['count']} "
                 f"src=2d_drawing_symbol")
            legend_rows.append({'tag': sym, 'size': '', 'desc': entry['name'],
                                 'qty': str(entry['count'])})

    # ── Sheet layout (no door/window schedule; use MEP legend rows) ──
    title = drawing_title if drawing_title else f'{discipline} LAYOUT'
    sheet_no = drawing_no if drawing_no else ('E-01' if discipline == 'ELECTRICAL' else 'M-01')
    _log(f"§I-28 MEP plan title={title!r} sheet={sheet_no!r} src={'page_json' if drawing_title else 'hardcoded'}")
    bld_type, bld_name = _infer_building_identity(db_path)
    _draw_sheet_layout(doc, msp, tpl,
                       _mh(bld_min_x), _mh(bld_max_x),
                       _mh(bld_min_y), _mh(bld_max_y),
                       drawing_title=title, drawing_no=sheet_no, scale=scale,
                       schedule_rows=legend_rows,
                       building_type=bld_type, building_name=bld_name)
    doc.saveas(out_dxf)
    _log(f"  → {out_dxf}")


# ─────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────

def _svg_fingerprint(svg_path: str) -> dict:
    """Extract a white-box fingerprint from an SVG for comparison.
    §9.6 R5/R6: entity counts, text content, grid labels, grid positions.
    Items 1.5, 9.5b, 9.5c: also extract grid line x/y positions."""
    import re
    if not os.path.exists(svg_path):
        return {}
    with open(svg_path) as f:
        content = f.read()
    fp = {}
    fp['lines'] = len(re.findall(r'<line ', content))
    fp['rects'] = len(re.findall(r'<rect ', content))
    fp['circles'] = len(re.findall(r'<circle', content))
    fp['texts'] = len(re.findall(r'<text ', content))
    fp['polygons'] = len(re.findall(r'<polygon', content))
    fp['paths'] = len(re.findall(r'<path', content))
    fp['dasharrays'] = len(re.findall(r'stroke-dasharray', content))
    # Extract all text content
    text_vals = re.findall(r'>([^<]+)</text>', content)
    fp['text_set'] = sorted(set(text_vals))
    # Grid labels: single-char texts A-Z or 1-9
    fp['grid_labels'] = sorted(set(t for t in text_vals
                                    if len(t) <= 2 and t != 'N'
                                    and (t.isalpha() or t.isdigit())))
    # Dimension values: pure digit texts
    fp['dim_values'] = sorted(set(t for t in text_vals if t.isdigit()))
    # §1.5/9.5b/9.5c: Grid line positions — extract x1 from dash-array lines.
    # Vertical grids (x-axis): x1==x2 (same x), varying y.
    # Horizontal grids (y-axis): y1==y2 (same y), varying x.
    grid_x_positions = []
    grid_y_positions = []
    for m in re.finditer(
            r'<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"[^/]*/?>',
            content):
        x1 = round(float(m.group(1)), 1)
        y1 = round(float(m.group(2)), 1)
        x2 = round(float(m.group(3)), 1)
        y2 = round(float(m.group(4)), 1)
        # Only collect from dash-array lines (grid lines)
        # Find the full element to check for stroke-dasharray
        start = m.start()
        end = m.end()
        snippet = content[max(0, start - 5):end + 50]
        if 'stroke-dasharray' not in snippet:
            continue
        if abs(x1 - x2) < 0.5:       # vertical line → x-axis grid
            grid_x_positions.append(x1)
        elif abs(y1 - y2) < 0.5:     # horizontal line → y-axis grid
            grid_y_positions.append(y1)
    fp['grid_x_positions'] = sorted(set(grid_x_positions))
    fp['grid_y_positions'] = sorted(set(grid_y_positions))
    return fp


def _compare_fingerprints(current: dict, reference: dict) -> tuple:
    """Compare two SVG fingerprints. Returns (score, total, details).
    §9.6 R5: archive regression check.
    Items 1.5, 9.5b, 9.5c: also compare grid line x/y positions."""
    if not current or not reference:
        return 0, 0, ['no data to compare']
    checks = 0
    matched = 0
    details = []

    # Grid labels
    checks += 1
    if current.get('grid_labels') == reference.get('grid_labels'):
        matched += 1
        details.append(f'  GRID_LABELS: MATCH {current["grid_labels"]}')
    else:
        details.append(f'  GRID_LABELS: DIFFER current={current.get("grid_labels")} '
                       f'archive={reference.get("grid_labels")}')

    # Dimension values
    checks += 1
    if current.get('dim_values') == reference.get('dim_values'):
        matched += 1
        details.append(f'  DIM_VALUES: MATCH {current["dim_values"]}')
    else:
        details.append(f'  DIM_VALUES: DIFFER current={current.get("dim_values")} '
                       f'archive={reference.get("dim_values")}')

    # Entity counts — dasharray count (grid rendering)
    checks += 1
    if current.get('dasharrays', 0) == reference.get('dasharrays', 0):
        matched += 1
        details.append(f'  DASHDOT_COUNT: MATCH {current["dasharrays"]}')
    else:
        details.append(f'  DASHDOT_COUNT: DIFFER current={current.get("dasharrays")} '
                       f'archive={reference.get("dasharrays")}')

    # Circle count (grid bubbles)
    checks += 1
    if current.get('circles', 0) == reference.get('circles', 0):
        matched += 1
        details.append(f'  CIRCLE_COUNT: MATCH {current["circles"]}')
    else:
        details.append(f'  CIRCLE_COUNT: DIFFER current={current.get("circles")} '
                       f'archive={reference.get("circles")}')

    # Text count
    checks += 1
    if current.get('texts', 0) == reference.get('texts', 0):
        matched += 1
        details.append(f'  TEXT_COUNT: MATCH {current["texts"]}')
    else:
        details.append(f'  TEXT_COUNT: DIFFER current={current.get("texts")} '
                       f'archive={reference.get("texts")}')

    # §1.5/9.5b: Grid X positions (vertical grid lines) within 1mm tolerance
    cur_gx = current.get('grid_x_positions', [])
    ref_gx = reference.get('grid_x_positions', [])
    if cur_gx or ref_gx:
        checks += 1
        # Match if same count and each position within 1.0 unit (paper mm)
        gx_match = (len(cur_gx) == len(ref_gx) and
                    all(abs(a - b) <= 1.0 for a, b in zip(sorted(cur_gx), sorted(ref_gx))))
        if gx_match:
            matched += 1
            details.append(f'  GRID_X_POS: MATCH {cur_gx}')
        else:
            details.append(f'  GRID_X_POS: DIFFER current={cur_gx} archive={ref_gx}')

    # §9.5c: Grid Y positions (horizontal grid lines) within 1mm tolerance
    cur_gy = current.get('grid_y_positions', [])
    ref_gy = reference.get('grid_y_positions', [])
    if cur_gy or ref_gy:
        checks += 1
        gy_match = (len(cur_gy) == len(ref_gy) and
                    all(abs(a - b) <= 1.0 for a, b in zip(sorted(cur_gy), sorted(ref_gy))))
        if gy_match:
            matched += 1
            details.append(f'  GRID_Y_POS: MATCH {cur_gy}')
        else:
            details.append(f'  GRID_Y_POS: DIFFER current={cur_gy} archive={ref_gy}')

    return matched, checks, details


def _prune_generations(folder: str, view: str, ext: str, keep: int = 2) -> int:
    """§9.6 R3: keep only 2 generations per view. Remove oldest. Returns count deleted."""
    import glob as _glob
    pattern = os.path.join(folder, f'{view}_*.{ext}')
    files = sorted(_glob.glob(pattern))  # oldest first (timestamp sort)
    removed = 0
    while len(files) > keep:
        os.remove(files.pop(0))
        removed += 1
    return removed


def _prev_file(folder: str, view: str, ext: str) -> str:
    """Find previous generation file (second-newest) for a view."""
    import glob as _glob
    pattern = os.path.join(folder, f'{view}_*.{ext}')
    files = sorted(_glob.glob(pattern))
    if len(files) >= 2:
        return files[-2]
    return ''


# §9.6 R2: short view names
_VIEW_SHORT = {
    'floor_plan': 'FLOOR',
    'roof_plan': 'ROOF',
    'front': 'FRONT',
    'rear': 'REAR',
    'left': 'LEFT',
    'right': 'RIGHT',
}

# §9.6 R5: archive filename map (archive uses long names)
_ARCHIVE_MAP = {
    'FLOOR': 'floor_plan',
    'ROOF': 'roof_plan',
}


def main():
    parser = argparse.ArgumentParser(
        description='Generate professional DXF architectural drawings from BIM database.\n'
                    'Output: DXF R2010, model-space mm, AIA layers, ISO 128 line weights.')
    parser.add_argument('db_path', help='Path to compiled .db file (output.db)')
    parser.add_argument('--floor-plan', action='store_true',
                        help='Generate floor plan DXF')
    parser.add_argument('--elevation', metavar='FACE',
                        help='Generate elevation DXF: front|rear|left|right')
    parser.add_argument('--all', action='store_true',
                        help='Generate all drawings (floor + roof + 4 elevations) + SVG proof')
    parser.add_argument('--proof', action='store_true',
                        help='Convert DXF→SVG proof renders (implied by --all)')
    parser.add_argument('--scale', type=int, default=100,
                        help='Drawing scale denominator (default 100 = 1:100)')
    parser.add_argument('--std', action='store_true',
                        help='Standard 2D set from the model (lane spec §L1): grid from wall axes, '
                             'chained DIMENSION strings, levels; output/STD/{PREFIX}_*_std.dxf, no timestamp')
    parser.add_argument('--png', action='store_true', help='with --std: render FLOOR_GF + FRONT PNGs')
    args = parser.parse_args()

    if args.std:
        # §L1: deterministic standard set (std2d.py); never overwrites the timestamped sets
        from std2d import write_std_set
        out_std = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'output', 'STD')
        r = write_std_set(args.db_path, os.path.normpath(out_std), png=args.png)
        for v, pth in r['paths'].items():
            print(f'{v}: {pth}')
        print(f"gaps={len(r['gaps'])} (read output/STD/log_*_std.txt)")
        return

    if not os.path.exists(args.db_path):
        print(f"Database not found: {args.db_path}", file=sys.stderr)
        sys.exit(1)

    # §3.0a: convention check — DB should be in input/ directory
    db_abs = os.path.abspath(args.db_path)
    if os.sep + 'input' + os.sep not in db_abs:
        print(f"WARNING: DB not in input/ directory (convention §3.0a): {args.db_path}",
              file=sys.stderr)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir   = os.path.normpath(os.path.join(script_dir, '..'))
    out_dir    = os.path.join(base_dir, 'output')
    dxf_dir    = os.path.join(out_dir, 'DXF')
    svg_dir    = os.path.join(out_dir, 'SVG')
    os.makedirs(dxf_dir, exist_ok=True)
    os.makedirs(svg_dir, exist_ok=True)
    stem = os.path.splitext(os.path.basename(args.db_path))[0]
    # Project prefix: "SH_extracted" → "SH", "DX_extracted" → "DX"
    proj = stem.split('_')[0].upper()
    ts = datetime.datetime.now().strftime('%Y%m%d_%H%M')

    # §3.0b / §9.6 R7: Read master page table from {PREFIX}_2D.json
    input_dir = os.path.join(base_dir, 'input')
    page_json = None
    if os.path.isdir(input_dir):
        for jf in sorted(os.listdir(input_dir)):
            if jf.endswith('_2D.json'):
                jf_path = os.path.join(input_dir, jf)
                with open(jf_path) as _jf:
                    _plan = json.load(_jf)
                    if _plan.get('db', '').replace('.db', '').replace('_extracted', '') in stem:
                        page_json = _plan
                        break

    # Build page list from JSON (--all) or CLI args (single view)
    _FILE_TO_FACE = {'FRONT': 'front', 'REAR': 'rear', 'LEFT': 'left', 'RIGHT': 'right'}
    if args.all and page_json:
        # §3.0b: iterate pages by status=DONE from master table
        pages_todo = [p for p in page_json['pages'] if p['status'] in ('DONE', 'STUB')]
    elif args.all:
        # Fallback if no JSON found: legacy hardcoded list
        pages_todo = [
            {'file': 'FLOOR', 'type': 'plan',      'sheet': 'A-01'},
            {'file': 'FRONT', 'type': 'elevation',  'sheet': 'A-02'},
            {'file': 'REAR',  'type': 'elevation',  'sheet': 'A-03'},
            {'file': 'LEFT',  'type': 'elevation',  'sheet': 'A-04'},
            {'file': 'RIGHT', 'type': 'elevation',  'sheet': 'A-05'},
            {'file': 'ROOF',  'type': 'plan',        'sheet': 'A-06'},
        ]
    else:
        pages_todo = []
        if args.floor_plan:
            pages_todo.append({'file': 'FLOOR', 'type': 'plan', 'sheet': 'A-01'})
        if args.elevation:
            face = args.elevation
            short = _VIEW_SHORT.get(face, face.upper())
            pages_todo.append({'file': short, 'type': 'elevation', 'sheet': ''})
    if not pages_todo:
        pages_todo = [{'file': 'FLOOR', 'type': 'plan', 'sheet': 'A-01'}]  # default

    _LOG_LINES.clear()
    _VERDICTS.clear()
    _log(f"DXF generation: {stem} (scale 1:{args.scale})")
    _log(f"  Source: {args.db_path}")
    _log(f"  Output: {out_dir}/DXF/ and {out_dir}/SVG/")
    _log(f"  Timestamp: {ts}")
    if page_json:
        _log(f"  Master page table: {len(pages_todo)} DONE pages from {page_json.get('project','?')}_2D.json")
    else:
        _log(f"  Master page table: not found, using CLI args")

    # §9.6 R2: single-term filenames with timestamp
    generated = {}  # short_name → (dxf_path, svg_path)

    for page in pages_todo:
        short = page['file']
        ptype = page.get('type', 'plan')
        dxf_path = os.path.join(dxf_dir, f'{proj}_{short}_{ts}.dxf')

        if short == 'FLOOR':
            # §E: multi-storey — one floor plan per habitable storey
            _storeys = _detect_floor_storeys(args.db_path)
            if len(_storeys) <= 1:
                # Single-storey building (e.g. SH): generate as before
                write_floor_plan_dxf(args.db_path, dxf_path, scale=args.scale)
                generated[short] = dxf_path
            else:
                # Multi-storey: generate FLOOR_GF, FLOOR_FF, etc.
                for _idx, (_sname, _sz) in enumerate(_storeys):
                    _scode = _STOREY_CODES[_idx] if _idx < len(_STOREY_CODES) else f'{_idx+1}F'
                    _short = f'FLOOR_{_scode}'
                    _sp = os.path.join(dxf_dir, f'{proj}_{_short}_{ts}.dxf')
                    _stitle = _STOREY_TITLES.get(_scode, f'{_scode} FLOOR PLAN')
                    _sno = f'A-01-{_scode}'
                    _log(f"§STOREY_PLAN storey={_sname!r} code={_scode} floor_z={_sz:.2f}m "
                         f"title={_stitle!r} sheet={_sno!r} → {_sp}")
                    write_floor_plan_dxf(args.db_path, _sp, scale=args.scale,
                                         storey_name=_sname, storey_floor_z=_sz,
                                         drawing_title=_stitle, drawing_no=_sno)
                    generated[_short] = _sp
            continue
        elif short == 'ROOF':
            write_roof_plan_dxf(args.db_path, dxf_path, scale=args.scale)
        elif ptype == 'elevation':
            face = _FILE_TO_FACE.get(short, short.lower())
            write_elevation_dxf(args.db_path, face, dxf_path, scale=args.scale)
        elif ptype == 'mep':
            # §D: MEP plan — discipline from file key (PLUMBING, ELECTRICAL, MEP)
            disc = short.upper() if short.upper() in ('PLUMBING', 'ELECTRICAL') else 'MEP'
            _mep_title = page.get('title')   # from DX_2D.json §12.2
            _mep_no    = page.get('sheet')   # e.g. M-01-GF
            write_mep_plan_dxf(args.db_path, disc, dxf_path, scale=args.scale,
                               drawing_title=_mep_title, drawing_no=_mep_no)
        else:
            _log(f"  SKIP {short}: no generator for type={ptype}")
            continue
        generated[short] = dxf_path

    # §9.6 R1: DXF→SVG (no PNG)
    if args.proof or args.all:
        for short, dxf_path in generated.items():
            if not os.path.exists(dxf_path):
                continue
            svg_path = os.path.join(svg_dir, f'{proj}_{short}_{ts}.svg')
            try:
                _render_proof(dxf_path, svg_path)
                _log(f"DXF→SVG → {svg_path}")
            except Exception as e:
                _log(f"DXF→SVG failed for {short}: {e}")
                import traceback
                traceback.print_exc()

    # §9.6 R3: prune to 2 generations per view (current prefix naming)
    for short in generated:
        removed_dxf = _prune_generations(dxf_dir, f'{proj}_{short}', 'dxf', keep=2)
        removed_svg = _prune_generations(svg_dir, f'{proj}_{short}', 'svg', keep=2)
        if removed_dxf or removed_svg:
            _log(f"§PRUNE {proj}_{short}: script deleted {removed_dxf} old DXF, {removed_svg} old SVG")
    # §9.6 R3b: also prune orphan un-prefixed files (pre-prefix naming convention)
    for short in generated:
        removed_dxf = _prune_generations(dxf_dir, short, 'dxf', keep=0)
        removed_svg = _prune_generations(svg_dir, short, 'svg', keep=0)
        if removed_dxf or removed_svg:
            _log(f"§PRUNE orphan {short}: script deleted {removed_dxf} un-prefixed DXF, {removed_svg} un-prefixed SVG")

    # §9.6 R6: Visible change detection (vs previous generation)
    _log("")
    _log("── VISIBLE CHANGE DETECTION ──")
    any_change = False
    change_details = []
    for short in generated:
        cur_svg = os.path.join(svg_dir, f'{proj}_{short}_{ts}.svg')
        prev_svg = _prev_file(svg_dir, f'{proj}_{short}', 'svg')
        cur_fp = _svg_fingerprint(cur_svg)
        prev_fp = _svg_fingerprint(prev_svg) if prev_svg else {}
        if not prev_fp:
            change_details.append(f'  {short}: no previous — first run')
            any_change = True
        else:
            diffs = []
            for key in ('lines', 'circles', 'texts', 'polygons', 'dasharrays'):
                c = cur_fp.get(key, 0)
                p = prev_fp.get(key, 0)
                if c != p:
                    diffs.append(f'{key}:{p}→{c}')
            if cur_fp.get('grid_labels') != prev_fp.get('grid_labels'):
                diffs.append(f'grids:{prev_fp.get("grid_labels")}→{cur_fp.get("grid_labels")}')
            if diffs:
                any_change = True
                change_details.append(f'  {short}: CHANGED — {", ".join(diffs)}')
            else:
                change_details.append(f'  {short}: identical to prev')
    for d in change_details:
        _log(d)
    _log(f"VISIBLE CHANGE: {'YES' if any_change else 'NO'}")

    # §9.6 R5: Archive regression check (FLOOR + ROOF only)
    _log("")
    _log("── ARCHIVE REGRESSION CHECK ──")
    archive_dir = os.path.join(base_dir, 'archive')
    archive_stem = page_json.get('building', stem) if page_json else stem
    for short in ('FLOOR', 'ROOF'):
        cur_svg = os.path.join(svg_dir, f'{proj}_{short}_{ts}.svg')
        archive_suffix = _ARCHIVE_MAP.get(short, short.lower())
        archive_svg = os.path.join(archive_dir, f'{archive_stem}_{archive_suffix}.svg')
        if not os.path.exists(archive_svg):
            _log(f"  {short}: archive not found at {archive_svg}")
            continue
        cur_fp = _svg_fingerprint(cur_svg)
        arc_fp = _svg_fingerprint(archive_svg)
        matched, total, details = _compare_fingerprints(cur_fp, arc_fp)
        for d in details:
            _log(d)
        prev_svg = _prev_file(svg_dir, f'{proj}_{short}', 'svg')
        prev_fp = _svg_fingerprint(prev_svg) if prev_svg else {}
        prev_matched = 0
        if prev_fp:
            prev_matched, _, _ = _compare_fingerprints(prev_fp, arc_fp)
        better = matched >= prev_matched if prev_fp else True
        _log(f"  ARCHIVE CHECK [{short}]: {matched}/{total} — Better: {'YES' if better else 'NO'}")

    _write_log(out_dir)


if __name__ == '__main__':
    main()
