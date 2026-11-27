#!/usr/bin/env python3
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §33 W-T3 — one hash of the IFC's geometry: every product's world triangles from the file itself, no geometry engine (ifc_check.py: the engine's bbox is not deterministic). Run WITHOUT -I.
# Usage: geom_hash.py <file.ifc>. The earlier a4c986f267f69a56 came from a method that was never committed and could not be reproduced (2026-11-04); this one replaces it.
import sys,hashlib,ifcopenshell
import ifcopenshell.util.placement as PL
f=ifcopenshell.open(sys.argv[1]); rows=[]
for e in f.by_type('IfcProduct'):
    if not e.Representation: continue
    M=PL.get_local_placement(e.ObjectPlacement); t=[]
    for r in e.Representation.Representations:
        for it in r.Items:
            if it.is_a()=='IfcTriangulatedFaceSet':
                C=[tuple(round(float(M[i][0]*x+M[i][1]*y+M[i][2]*z+M[i][3]),3) for i in range(3)) for x,y,z in it.Coordinates.CoordList]
                t+=[tuple(sorted(C[i-1] for i in q)) for q in it.CoordIndex]
    rows.append((e.is_a(),sorted(t)))
rows.sort(key=repr)
print('§GEOM products',len(rows),'triangles',sum(len(r[1]) for r in rows),'hash',hashlib.sha256(repr(rows).encode()).hexdigest()[:16])
