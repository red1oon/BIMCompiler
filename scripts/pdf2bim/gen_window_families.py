#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §34 — writes migration CL007: the type's window families, generated from the p8 schedule. Deterministic: same inputs -> same bytes. Witness: witness_windows.py.
# Usage: gen_window_families.py <rosetta.json> <template.json> > migration/CL007_low_cost_window_families.sql
import sys,json,struct,hashlib
R=json.load(open(sys.argv[1])); T=json.load(open(sys.argv[2])); W=T['window_system']; SZ=R['schedule_sizes_mm']; F=W['frame_face_mm']/1000; P=W['pane_mm']/1000; D=W['depth_mm']/1000
TRI=[(0,2,1),(0,3,2),(4,5,6),(4,6,7),(0,1,5),(0,5,4),(1,2,6),(1,6,5),(2,3,7),(2,7,6),(3,0,4),(3,4,7)]   # a box, outward faces
def box(x0,x1,y0,y1,z0,z1): return [(x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0),(x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)]
def mesh(w,h,n):
    "centred, X width, Y depth, Z height: head and sill run the full width, jambs and mullions between them, one pane per panel"
    hw,hh,hd=w/2,h/2,D/2; b=[box(-hw,hw,-hd,hd,hh-F,hh),box(-hw,hw,-hd,hd,-hh,-hh+F),box(-hw,-hw+F,-hd,hd,-hh+F,hh-F),box(hw-F,hw,-hd,hd,-hh+F,hh-F)]
    clear=(w-2*F-(n-1)*F)/n; x=-hw+F
    for i in range(n):
        b.append(box(x,x+clear,-P/2,P/2,-hh+F,hh-F)); x+=clear
        if i<n-1: b.append(box(x,x+F,-hd,hd,-hh+F,hh-F)); x+=F
    V=[];I=[]
    for q in b:
        o=len(V); V+=q; I+=[(a+o,c+o,d+o) for a,c,d in TRI]
    return V,I
def along_y(V): return [(-y,x,z) for x,y,z in V]   # the same window on a wall running along Y; a quarter turn keeps the winding
def blob(V,I):
    v=struct.pack('<%df'%(3*len(V)),*[c for p in V for c in p]); f=struct.pack('<%di'%(3*len(I)),*[c for t in I for c in t]); return v,f,hashlib.sha256(v).hexdigest()[:16]
print("-- CL007: the 'Low cost single storey unit' window families, generated from the p8 schedule by scripts/pdf2bim/gen_window_families.py. DO NOT hand-edit: regenerate.\n-- Spec: prompts/PDF2BIM_VECTOR_PROBE.md §34. Overall size and panels: p8 schedule. Depth: the plan's 100 mm modules. Frame face and pane thickness: template defaults, YELLOW. Blades not modelled.\n-- Data only, append-only, idempotent: INSERT OR IGNORE. Applies to library/component_library.db (never commit the binary: this script is the change).\nBEGIN TRANSACTION;")
o=0
for k in ('W1','W2','W3'):
    w,h=SZ[k]; ty=W['types'][k]; fid='LCSSU_%s_%dx%d'%(k,w,h)
    desc='%s %d×%dmm %s. Generated from the p8 schedule; frame profile is a default.'%(k,w,h,ty['text'])
    print("INSERT OR IGNORE INTO ad_opening_family (family_id,family_name,opening_type,ifc_class,default_width_mm,default_height_mm,is_fire_rated,description,is_active,depth_mm) VALUES ('%s','Low cost %s %d panel %dx%dmm','WINDOW','IfcWindow',%d,%d,0,'%s',1,%d);"%(fid,k,ty['panels'],w,h,w,h,desc.replace("'","''"),W['depth_mm']))
    V,I=mesh(w/1000,h/1000,ty['panels']); ref='%s: %d x %d generated'%(k,w,h)
    for VV in (V,along_y(V)):
        v,f,hh=blob(VV,I); o+=1
        print("INSERT OR IGNORE INTO component_geometries (geometry_hash,vertices,faces,normals,vertex_count,face_count) VALUES ('%s',x'%s',x'%s',NULL,%d,%d);"%(hh,v.hex(),f.hex(),len(VV),len(I)))
        print("INSERT OR IGNORE INTO ad_geometry_map (building_type,element_ref,ifc_class,storey,ordinal,geometry_hash,source,provenance) VALUES ('Low cost single storey unit','%s','IfcWindow','Generated',%d,'%s','p8 schedule, gen_window_families.py','PARAMETRIC');"%(ref,o,hh))
print('COMMIT;')
