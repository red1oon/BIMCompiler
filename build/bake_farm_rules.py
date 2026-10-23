#!/usr/bin/env python3
# Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
# SPDX-License-Identifier: MIT
# ⚠ DO NOT REMOVE — bake_farm_rules.py: the "Farming Shed" walker reference (bim-ootb prompts/DXF2BIM_FOUNDATION_LANE.md §D62). Read the printed summary after every run.
#
# The rules the Modeller's DISC walk reads for a farm shed, in the SAME format as terminal_rules.db / duplex_rules.db (bake_terminal_rules.py / bake_duplex_rules.py). There is no
# measured farm MEP model, so the placement VALUES are CITED (owner 2026-10-23: "farm reference first"), each row naming its source:
#   ELEC IfcLightFixture          TNAU, Poultry House Construction: lights hung from the ceiling 7-8 ft above ground level; incandescent bulbs every 10 ft
#   FP   IfcFireSuppressionTerminal NFPA 13 light hazard: at most 15 ft between sprinklers, 225 ft2 per sprinkler; deflector 1-12 in below the ceiling.
#                                 Farm sheds are usually exempt from sprinklers (IBC Group U, NFBA; state exemptions): the row is an OPTION, stated in rules_meta.
# MEASURED from the reference shed model (--ref, an extracted db): the floor (slab top) and the ceiling (the lowest roof member's underside) that turn the cited heights into z bands, and
# rule_frame_ref (per class mean centre z) so the walker reconciles another shed's frame by its own measured method (§TE-ARC-DATUM).
# The fixture MESHES are real LOD400 meshes: the sprinkler bound in terminal_rules.db (rule_mesh_binding, the Terminal's geometry), the lamp the component library's pendant
# (`M_Pendant Light - Hemisphere:150W`, the Duplex's geometry; §D64: the Terminal's recessed troffer read as an air-conditioning panel). The walk resolves each from its named source (§D61 / §D64).
# Usage: python3 build/bake_farm_rules.py --ref <shed extracted .db> --terminal <terminal_rules.db> --library <component_library.db> --source-geo Duplex=<Duplex_geo.db> --out <farm_rules.db>
import argparse, hashlib, json, os, sqlite3, sys, datetime

FT = 0.3048
CITED = {
    'ELEC': dict(ifc_class='IfcLightFixture', spacing=10 * FT, area=(10 * FT) ** 2, above_floor=(7 * FT, 8 * FT), below_ceiling=None, library_ref='M_Pendant Light - Hemisphere:150W - 120V:150W - 120V', mesh_source='Duplex',
                 provenance='cited:TNAU Poultry House Construction (agritech.tnau.ac.in): lights hung from the ceiling 7-8 ft above ground level, incandescent bulbs every 10 ft'),
    'FP': dict(ifc_class='IfcFireSuppressionTerminal', spacing=15 * FT, area=225 * FT * FT, above_floor=None, below_ceiling=(12 * 0.0254, 1 * 0.0254),
               provenance='cited:NFPA 13 light hazard (max 15 ft between sprinklers, 225 ft2 per sprinkler; deflector 1-12 in below the ceiling); an option: farm sheds are usually exempt (IBC Group U)'),
}

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--ref', required=True); ap.add_argument('--terminal', required=True); ap.add_argument('--library', required=True); ap.add_argument('--source-geo', action='append', default=[], help='<source>=<its served _geo.db>: a library mesh is taken only if that source serves it'); ap.add_argument('--out', required=True); a = ap.parse_args()
    served = {k: sqlite3.connect(v) for k, v in (x.split('=', 1) for x in a.source_geo)}
    lib = sqlite3.connect(a.library)
    ref, term = sqlite3.connect(a.ref), sqlite3.connect(a.terminal)
    q = lambda c, s, *p: c.execute(s, p).fetchall()
    floor = q(ref, "SELECT MAX(b.maxZ) FROM elements_meta m JOIN element_world_bbox b ON b.guid=m.guid WHERE m.ifc_class='IfcSlab'")[0][0]
    ceiling = q(ref, "SELECT MIN(b.minZ) FROM elements_meta m JOIN element_world_bbox b ON b.guid=m.guid WHERE m.ifc_class IN ('IfcMember','IfcRoof','IfcPlate')")[0][0]
    storey = q(ref, "SELECT storey, COUNT(*) n FROM elements_meta GROUP BY 1 ORDER BY n DESC LIMIT 1")[0][0]
    if floor is None or ceiling is None or ceiling <= floor: sys.exit('§FARM-RULES REFUSED: the reference has no slab top / roof member underside (floor=%s ceiling=%s)' % (floor, ceiling))
    if os.path.exists(a.out): os.remove(a.out)
    out = sqlite3.connect(a.out)
    for (sql,) in q(term, "SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL"): out.execute(sql)   # the SAME schema the walker reads (empty tables it counts at init)
    cols = [r[1] for r in q(term, 'PRAGMA table_info(rule_placement)')]
    rows = []
    for disc, c in CITED.items():
        if c['above_floor']: lo, hi = floor + c['above_floor'][0], floor + c['above_floor'][1]
        else: lo, hi = ceiling - c['below_ceiling'][0], ceiling - c['below_ceiling'][1]
        if c.get('library_ref'):   # a library product: its mesh (the most used hash of that product) and its own measured dims
            if c['mesh_source'] not in served: sys.exit('§FARM-RULES REFUSED: --source-geo %s=<its _geo.db> is needed (the walk resolves the lamp from it)' % c['mesh_source'])
            cand = q(lib, 'SELECT geometry_hash, COUNT(*) n FROM ad_geometry_map WHERE element_ref=? GROUP BY 1 ORDER BY n DESC, geometry_hash', c['library_ref'])
            mb = [r for r in cand if q(served[c['mesh_source']], 'SELECT COUNT(*) FROM component_geometries WHERE geometry_hash=?', r[0])[0][0]][:1]   # the most used hash the source SERVES
            if not mb: sys.exit('§FARM-RULES REFUSED: %s serves none of the %d meshes of %s' % (c['mesh_source'], len(cand), c['library_ref']))
            import struct
            vb = q(lib, 'SELECT vertices FROM component_geometries WHERE geometry_hash=?', mb[0][0])[0][0]; v = struct.unpack('<%df' % (len(vb) // 4), vb)
            bb = [tuple(round(max(v[k::3]) - min(v[k::3]), 4) for k in range(3))]; mprov = 'mesh:component_library.db %s (LOD400, %s geometry)' % (c['library_ref'], c['mesh_source'])
        else:
            mb = q(term, 'SELECT geometry_hash FROM rule_mesh_binding WHERE disc=? AND ifc_class=?', disc, c['ifc_class'])
            bb = q(term, 'SELECT bbox_dx, bbox_dy, bbox_dz FROM rule_placement WHERE disc=? AND ifc_class=? AND bbox_dx IS NOT NULL LIMIT 1', disc, c['ifc_class'])
            mprov = 'mesh:terminal_rules.db rule_mesh_binding (a real LOD400 mesh of the Terminal)'
            if not mb: sys.exit('§FARM-RULES REFUSED: terminal_rules.db binds no mesh for %s/%s' % (disc, c['ifc_class']))
        r = dict(disc=disc, ifc_class=c['ifc_class'], ref_kind='storey', dx=None, dy=None, dz=None, spacing_x_m=round(c['spacing'], 4), spacing_y_m=round(c['spacing'], 4),
                 z_band_lo=round(lo, 4), z_band_hi=round(hi, 4), storey_scope=storey, n_measured=1, src_storey_area_m2=round(c['area'], 4), provenance=c['provenance'], src_guids='',
                 bbox_dx=bb[0][0] if bb else None, bbox_dy=bb[0][1] if bb else None, bbox_dz=bb[0][2] if bb else None)
        out.execute('INSERT INTO rule_placement (%s) VALUES (%s)' % (','.join(k for k in cols if k in r), ','.join('?' for k in cols if k in r)), [r[k] for k in cols if k in r])
        out.execute('INSERT INTO rule_mesh_binding (disc, ifc_class, geometry_hash, n_of, n_total, provenance, src_guids) VALUES (?,?,?,?,?,?,?)',
                    (disc, c['ifc_class'], mb[0][0], 1, 1, mprov, ''))
        rows.append((disc, c['ifc_class'], round(lo, 3), round(hi, 3), round(c['spacing'], 3), mb[0][0]))
    fr = q(ref, "SELECT m.ifc_class, COUNT(*), AVG(t.center_z) FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid GROUP BY 1 HAVING COUNT(*) >= 5 ORDER BY 1")
    for cls, n, mz in fr: out.execute('INSERT INTO rule_frame_ref (ifc_class, n, mean_z, provenance) VALUES (?,?,?,?)', (cls, n, round(mz, 4), 'measured:AVG(center_z):the farm shed reference model'))
    body = json.dumps({'rows': rows, 'frame': [(c, n, round(z, 4)) for c, n, z in fr]}, sort_keys=True)
    sha = hashlib.sha256(body.encode()).hexdigest()[:12]
    meta = {'standard': 'farming-shed', 'version': datetime.date.today().isoformat() + '+' + sha, 'content_sha': sha, 'built_at': datetime.datetime.now().replace(microsecond=0).isoformat(),
            'built_from': 'cited: TNAU poultry house lighting + NFPA 13 light hazard; floor / ceiling / frame measured on a farm shed reference model; meshes: the Terminal sprinkler, the library pendant lamp',
            'source_db': 'farm_rules.db', 'z_datum_offset': '0', 'mesh_sources': 'Terminal,Duplex', 'fp_note': 'farm sheds are usually exempt from sprinklers (IBC Group U); the FP row is an option',
            'reference_floor_z': str(round(floor, 4)), 'reference_ceiling_z': str(round(ceiling, 4))}
    for k, v in meta.items(): out.execute('INSERT INTO rules_meta (key, value) VALUES (?,?)', (k, v))
    out.commit(); out.close()
    print('§FARM-RULES written %s floor=%.3f ceiling=%.3f storey=%s sha=%s' % (a.out, floor, ceiling, storey, sha))
    for r in rows: print('  §FARM-RULE %s/%s band=[%s,%s] spacing=%s mesh=%s' % r)
    print('  §FARM-FRAME %s' % json.dumps([(c, n, round(z, 3)) for c, n, z in fr]))

if __name__ == '__main__': main()
