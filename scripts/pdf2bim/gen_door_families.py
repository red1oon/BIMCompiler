#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §38 — writes migration CL008: the type's door families, generated from the p8 schedule. Deterministic: same inputs -> same bytes. Witness: witness_doors.py.
# Usage: gen_door_families.py <rosetta.json> <template.json> [tags] > migration/CL008_low_cost_door_families.sql
import sys,json,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from family_mesh import TRI,box,along_y,blob
R=json.load(open(sys.argv[1])); T=json.load(open(sys.argv[2])); W=T['door_system']; SZ=R['schedule_sizes_mm']; F=W['frame_face_mm']/1000; L=W['leaf_mm']/1000; D=W['depth_mm']/1000
def mesh(w,h):
    "centred, X width, Y depth, Z height: the size is the frame's outside (p4). Head and 2 jambs, the shut leaf between the jambs and down to the floor"
    hw,hh,hd=w/2,h/2,D/2; b=[box(-hw,hw,-hd,hd,hh-F,hh),box(-hw,-hw+F,-hd,hd,-hh,hh-F),box(hw-F,hw,-hd,hd,-hh,hh-F),box(-hw+F,hw-F,-L/2,L/2,-hh,hh-F)]
    V=[];I=[]
    for q in b:
        o=len(V); V+=q; I+=[(a+o,c+o,d+o) for a,c,d in TRI]
    return V,I
print("-- CL008: the 'Low cost single storey unit' door families, generated from the p8 schedule by scripts/pdf2bim/gen_door_families.py. DO NOT hand-edit: regenerate.\n-- Spec: prompts/PDF2BIM_VECTOR_PROBE.md §38. Overall size: p8 schedule, the frame's outside on p4. Frame face: read on p4. Depth: the plan's 100 mm wall. Leaf thickness: template default, YELLOW. Knob, lock, swing and finish not modelled.\n-- Data only, append-only, idempotent: INSERT OR IGNORE. Applies to library/component_library.db (never commit the binary: this script is the change).\nBEGIN TRANSACTION;")
o=0
for k in (sys.argv[3].split(',') if len(sys.argv)>3 else ('D1','D2','D3')):   # §39: only these tags
    w,h=SZ[k]; dt='' if W['depth_mm']==100 else 'd%d'%W['depth_mm']; lab=k+dt; fid='LCSSU_%s_%dx%d%s'%(k,w,h,dt); desc='%s %d×%dmm %s. Generated from the p8 schedule; leaf thickness is a default.'%(lab,w,h,W['types'][k]['text']); ref='%s: %d x %d generated'%(lab,w,h)
    print("INSERT OR IGNORE INTO ad_opening_family (family_id,family_name,opening_type,ifc_class,default_width_mm,default_height_mm,is_fire_rated,description,is_active,depth_mm) VALUES ('%s','Low cost %s %dx%dmm','DOOR','IfcDoor',%d,%d,0,'%s',1,%d);"%(fid,k,w,h,w,h,desc.replace("'","''"),W['depth_mm']))
    V,I=mesh(w/1000,h/1000)
    if len(sys.argv)>3: o=w*100000+h*10   # §39: a run's own family must not collide with a committed row's ordinal: the map's key would make INSERT OR IGNORE drop its mesh rows, silently
    for VV in (V,along_y(V)):
        v,f,hh=blob(VV,I); o+=1
        print("INSERT OR IGNORE INTO component_geometries (geometry_hash,vertices,faces,normals,vertex_count,face_count) VALUES ('%s',x'%s',x'%s',NULL,%d,%d);"%(hh,v.hex(),f.hex(),len(VV),len(I)))
        print("INSERT OR IGNORE INTO ad_geometry_map (building_type,element_ref,ifc_class,storey,ordinal,geometry_hash,source,provenance) VALUES ('Low cost single storey unit','%s','IfcDoor','Generated',%d,'%s','p8 schedule, gen_door_families.py','PARAMETRIC');"%(ref,o,hh))
print('COMMIT;')
