# BIM OOTB — Frictionless BIM. Two DBs. One browser. Zero install.
# Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
# SPDX-License-Identifier: MIT
"""
model_db.py: one model DB, either schema (bim-ootb prompts/DXF2BIM_MODELLER_LANE.md §L1.6 P0).

Node extractor (scripts/extractIFC2DB.js): element_world_bbox, component_geometries, rel_fills_host(opening_guid,
host_guid, filling_guid, ...), element_pset_common. Old Python schema: elements_rtree (joined on elements_meta.id),
base_geometries, rel_fills_host(element_guid, host_guid). connect() adds per-connection TEMP views with one shape:
    m_bbox(guid, minX, maxX, minY, maxY, minZ, maxZ)
    m_geom(geometry_hash, vertices, faces, vertex_count, face_count)
    m_fills(filling_guid, host_guid, opening_guid)       -- filling rows only
    m_openings(opening_guid, host_guid, filling_guid)    -- every void row (Node schema; empty on the old one)
    m_psets(guid, pset, name, value, source)             -- empty when the DB has no element_pset_common
"""
import sqlite3


def _tables(con):
    return {r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type IN ('table','view')")}


def _cols(con, t):
    return [r[1] for r in con.execute(f'PRAGMA table_info("{t}")')]


def schema(con):
    t = _tables(con)
    return 'node' if 'element_world_bbox' in t else ('old' if 'elements_rtree' in t else 'none')


def connect(path):
    con = sqlite3.connect(path)
    t = _tables(con)
    if 'element_world_bbox' in t:
        con.execute('CREATE TEMP VIEW m_bbox AS SELECT guid, minX, maxX, minY, maxY, minZ, maxZ FROM main.element_world_bbox')
    elif 'elements_rtree' in t:
        con.execute('CREATE TEMP VIEW m_bbox AS SELECT m.guid AS guid, r.minX AS minX, r.maxX AS maxX, r.minY AS minY, '
                    'r.maxY AS maxY, r.minZ AS minZ, r.maxZ AS maxZ FROM main.elements_meta m JOIN main.elements_rtree r ON r.id = m.id')
    else:
        raise RuntimeError(f'{path}: no element_world_bbox (Node extractor) and no elements_rtree; re-extract with scripts/extractIFC2DB.js')
    if 'base_geometries' in t:
        con.execute('CREATE TEMP VIEW m_geom AS SELECT geometry_hash, vertices, faces, vertex_count, face_count FROM main.base_geometries')
    else:
        con.execute('CREATE TEMP VIEW m_geom AS SELECT geometry_hash, vertices, faces, length(vertices) / 12 AS vertex_count, '
                    'length(faces) / 12 AS face_count FROM main.component_geometries')
    fc = _cols(con, 'rel_fills_host') if 'rel_fills_host' in t else []
    if 'filling_guid' in fc:
        con.execute('CREATE TEMP VIEW m_fills AS SELECT filling_guid, host_guid, opening_guid FROM main.rel_fills_host '
                    'WHERE filling_guid IS NOT NULL')
        con.execute('CREATE TEMP VIEW m_openings AS SELECT opening_guid, host_guid, filling_guid FROM main.rel_fills_host')
    elif 'element_guid' in fc:
        con.execute('CREATE TEMP VIEW m_fills AS SELECT element_guid AS filling_guid, host_guid, NULL AS opening_guid '
                    'FROM main.rel_fills_host')
        con.execute("CREATE TEMP VIEW m_openings AS SELECT NULL AS opening_guid, NULL AS host_guid, NULL AS filling_guid WHERE 0")
    else:
        con.execute("CREATE TEMP VIEW m_fills AS SELECT NULL AS filling_guid, NULL AS host_guid, NULL AS opening_guid WHERE 0")
        con.execute("CREATE TEMP VIEW m_openings AS SELECT NULL AS opening_guid, NULL AS host_guid, NULL AS filling_guid WHERE 0")
    if 'element_pset_common' in t:
        con.execute('CREATE TEMP VIEW m_psets AS SELECT guid, pset, name, value, source FROM main.element_pset_common')
    else:
        con.execute("CREATE TEMP VIEW m_psets AS SELECT NULL AS guid, NULL AS pset, NULL AS name, NULL AS value, NULL AS source WHERE 0")
    return con
