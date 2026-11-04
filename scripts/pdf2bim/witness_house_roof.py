#!/usr/bin/env python3
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §32 — Witnesses W-R1..W-R8. Issue: is the house's roof a real pitched roof, with its porch, sitting coherently on the walls? Reads the IFC's own triangles (no geometry engine). Run WITHOUT -I.
# Usage: witness_house_roof.py <outdir>
import sys,os,math,collections,ifcopenshell
import ifcopenshell.util.placement as PL
O=sys.argv[1]; f=ifcopenshell.open(os.path.join(O,'tbkltn_p1.ifc')); fails=0
def say(n,v,m):
    global fails
    if v!='PASS': fails+=1
    print('§R',n,v,m,flush=True)
def verts(e):
    M=PL.get_local_placement(e.ObjectPlacement); o=[]
    for r in e.Representation.Representations:
        for it in r.Items:
            if it.is_a()=='IfcTriangulatedFaceSet':
                for x,y,z in it.Coordinates.CoordList: o.append((float(M[0][0]*x+M[0][1]*y+M[0][2]*z+M[0][3]),float(M[1][0]*x+M[1][1]*y+M[1][2]*z+M[1][3]),float(M[2][0]*x+M[2][1]*y+M[2][2]*z+M[2][3])))
    return o
def tris(e):
    M=PL.get_local_placement(e.ObjectPlacement); o=[]
    for r in e.Representation.Representations:
        for it in r.Items:
            if it.is_a()=='IfcTriangulatedFaceSet':
                C=[(float(M[0][0]*x+M[0][1]*y+M[0][2]*z+M[0][3]),float(M[1][0]*x+M[1][1]*y+M[1][2]*z+M[1][3]),float(M[2][0]*x+M[2][1]*y+M[2][2]*z+M[2][3])) for x,y,z in it.Coordinates.CoordList]
                o+=[(C[a-1],C[b-1],C[c-1]) for a,b,c in it.CoordIndex]
    return o
RF=f.by_type('IfcRoof')
if not RF: say('W-R1','VACUOUS','no IfcRoof'); sys.exit(1)
V=[v for e in RF for v in verts(e)]; xs=[v[0] for v in V]; ys=[v[1] for v in V]; zs=[v[2] for v in V]
boxy=[e for e in RF if len(verts(e))<=8]
say('W-R1','PASS' if len(RF)==4 and not boxy and abs(max(zs)-4.872)<=.001 else 'WRONG','IfcRoof %d, block-shaped %d, top z %.3f'%(len(RF),len(boxy),max(zs)))
say('W-R2','PASS' if abs(min(xs)+.75)<=.002 and abs(max(xs)-10.65)<=.002 and abs(max(ys)-.75)<=.002 and abs(min(ys)+9.144)<=.03 else 'WRONG','roof plan x %.3f..%.3f y %.3f..%.3f'%(min(xs),max(xs),min(ys),max(ys)))
# the top surface: over a plan point, the highest triangle
T=[t for e in RF for t in tris(e)]
def top(x,y):
    best=None
    for a,b,c in T:
        d=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
        if abs(d)<1e-9: continue
        w0=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/d; w1=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/d; w2=1-w0-w1
        if w0>=-1e-9 and w1>=-1e-9 and w2>=-1e-9:
            z=w0*a[2]+w1*b[2]+w2*c[2]; best=z if best is None or z>best else best
    return best
z1,z2=top(1,-1),top(1,-2); slope=math.degrees(math.atan2(z2-z1,1)) if z1 and z2 else None
say('W-R3','PASS' if slope and abs(slope-25)<=.05 else 'WRONG','main north slope measured %s deg between two points of the mesh'%(round(slope,2) if slope else None))
eave=top(1,.749); pr=top(4.945,-8.0); ok4=eave and pr and abs(eave-3.060)<=.03 and abs(pr-4.182)<=.002
say('W-R4','PASS' if ok4 else 'WRONG','main eave z %.3f vs p4 3.060; porch ridge z %.3f vs p4 4.182'%(eave or 0,pr or 0))
# no wall top pokes through: over every wall's top corners, the roof underside is at or above the wall top
TH=0.0254; poke=[]; W=f.by_type('IfcWall'); nW=0
for e in W:
    vs=verts(e); zt=max(v[2] for v in vs)
    for v in vs:
        if abs(v[2]-zt)<1e-6:
            t=top(v[0],v[1]); nW+=1
            if t is None or t-TH<zt-1e-3: poke.append((round(v[0],2),round(v[1],2),round(zt,2),None if t is None else round(t,3)))
say('W-R5','VACUOUS' if not nW else ('PASS' if not poke else 'WRONG'),'%d wall top corners judged, poking through %d %s'%(nW,len(poke),poke[:4]))
C=f.by_type('IfcColumn')
if not C: say('W-R6','VACUOUS','no IfcColumn')
else:
    B=[verts(e) for e in C]; zr=[(round(min(v[2] for v in b),3),round(max(v[2] for v in b),3)) for b in B]; under=[top(sum(v[0] for v in b)/len(b),sum(v[1] for v in b)/len(b)) for b in B]
    say('W-R6','PASS' if len(C)==2 and all(z==(.05,3.15) for z in zr) and all(u and u>3.15 for u in under) else 'WRONG','IfcColumn %d z %s, roof above them %s'%(len(C),zr,[round(u,3) if u else None for u in under]))
SL=f.by_type('IfcSlab'); zt=sorted(round(max(v[2] for v in verts(e)),3) for e in SL)
say('W-R7','PASS' if zt==[.05,.15] else ('VACUOUS' if not SL else 'WRONG'),'IfcSlab tops %s (porch 0.05, main 0.15)'%zt)
cnt={c:len(f.by_type(c)) for c in ('IfcWall','IfcDoor','IfcWindow')}
say('W-R8','PASS' if cnt=={'IfcWall':50,'IfcDoor':7,'IfcWindow':7} else 'WRONG',str(cnt)+' (47 + 3 gable-end walls)')
GW=[e for e in f.by_type('IfcWall') if max(v[2] for v in verts(e))>3.16]
if not GW: say('W-R9','VACUOUS','no wall rises above the beam')
else:
    res=[]
    for e in GW:
        vs=verts(e); z0=min(v[2] for v in vs); bad=[v for v in vs if v[2]>z0+1e-6 and (top(v[0],v[1]) is None or abs(top(v[0],v[1])-TH-v[2])>.003)]; res.append((round(z0,3),round(max(v[2] for v in vs),3),len(bad)))
    say('W-R9','PASS' if len(GW)==3 and all(r[0]==3.15 and r[2]==0 for r in res) else 'WRONG','gable-end walls (base, peak, corners off the roof underside) %s'%res)
print('§R RESULT fails',fails)
