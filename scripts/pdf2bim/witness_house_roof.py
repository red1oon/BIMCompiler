#!/usr/bin/env python3
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §32 — Witnesses W-R1..W-R8. Issue: is the house's roof a real pitched roof, with its porch, sitting coherently on the walls? Reads the IFC's own triangles (no geometry engine). Run WITHOUT -I.
# §37: every expected value is this run's, read from its inferred.json, dictionary and logs, never a number typed for one drawing. VACUOUS if they are absent.
# Usage: witness_house_roof.py <outdir> [inferred.json, a doctored copy, for the falsifier]
import sys,os,re,json,math,collections,ifcopenshell
import ifcopenshell.util.placement as PL
O=sys.argv[1]; f=ifcopenshell.open(os.path.join(O,'tbkltn_p1.ifc')); fails=0
IJ=sys.argv[2] if len(sys.argv)>2 else os.path.join(O,'inferred.json'); RJ=os.path.join(O,'rosetta.effective.json')
def rd(n):
    q=os.path.join(O,'logs',n); return open(q,encoding='utf-8').read() if os.path.exists(q) else ''
RL=rd('09c_roof_emit.log'); LL=rd('11_lib_probe.log'); mF=re.search(r'porch roof footprint from p3:.*ridge x ([\d.]+) front y ([\d.]+)',RL); mA=re.search(r'porch apex from p4: z above FFL ([\d.]+) .*eave z ([\d.]+)',RL); mP=re.search(r'roof\.dxf:.*pitch ([\d.]+)',RL); mE=re.search(r'§LIB els \d+ (\{.*?\})',LL)
if not(os.path.exists(IJ) and os.path.exists(RJ) and mF and mA and mP and mE): print('§R VACUOUS the run\'s values are absent:',IJ,RJ,'roof log',bool(mF and mA and mP),'lib log',bool(mE)); print('§R RESULT fails 1'); sys.exit(1)
I=json.load(open(IJ)); R=json.load(open(RJ)); VAL=lambda k:I['values'][k]['value']; gx,gy=R['grid']['x'],R['grid']['y']; FFL,BEAM,RDG,EAV,STEP=VAL('ffl_above_ground'),VAL('beam_above_ffl'),VAL('ridge_above_beam'),VAL('eaves_from_axis'),VAL('porch_step_below_ffl')
TOPZ=(FFL+BEAM+RDG)/1000; WALLTOP=(FFL+BEAM)/1000; X0,X1,YN=-EAV/1000,(max(gx.values())+EAV)/1000,EAV/1000; PR_X,FRONT=float(mF.group(1))/1000,-float(mF.group(2))/1000; PITCH=float(mP.group(1)); EAVE4,PR4=(FFL+float(mA.group(2)))/1000,(FFL+float(mA.group(1)))/1000; PF=(FFL-STEP)/1000; ELS=json.loads(mE.group(1)); NWALL=sum(v for k,v in ELS.items() if k.endswith('/IfcWall')); NGABLE=ELS.get('Roof/IfcWall',0); LOC=R['schedule_locations_p8']; ND=sum(len(v) for k,v in LOC.items() if k[0]=='D'); NW=sum(len(v) for k,v in LOC.items() if k[0]=='W')
print('§R expected top z %.3f, wall top %.3f, x %.3f..%.3f, y %.3f..%.3f, pitch %s, eave %.3f, porch ridge %.3f at x %.3f, porch floor %.3f, walls %d of which rising %d, doors %d, windows %d'%(TOPZ,WALLTOP,X0,X1,FRONT,YN,PITCH,EAVE4,PR4,PR_X,PF,NWALL,NGABLE,ND,NW),flush=True)
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
say('W-R1','PASS' if len(RF)==4 and not boxy and abs(max(zs)-TOPZ)<=.001 else 'WRONG','IfcRoof %d, block-shaped %d, top z %.3f (expected %.3f)'%(len(RF),len(boxy),max(zs),TOPZ))
say('W-R2','PASS' if abs(min(xs)-X0)<=.002 and abs(max(xs)-X1)<=.002 and abs(max(ys)-YN)<=.002 and abs(min(ys)-FRONT)<=.03 else 'WRONG','roof plan x %.3f..%.3f y %.3f..%.3f (expected x %.3f..%.3f y %.3f..%.3f)'%(min(xs),max(xs),min(ys),max(ys),X0,X1,FRONT,YN))
# the top surface: over a plan point, the highest triangle
# (the porch ridge is sampled 3 mm beside its line: on the Modeller's own export two planes meet there with a 1 mm gap at the file's precision, and the point falls in neither; 3 mm at the pitch is 1.4 mm of height, inside W-R4's tolerance)
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
xs_=gx['B']/2000; y1,y2=-gy['3']/3000,-gy['3']/1500; z1,z2=top(xs_,y1),top(xs_,y2); slope=math.degrees(math.atan2(z2-z1,y1-y2)) if z1 and z2 else None
say('W-R3','PASS' if slope and abs(slope-PITCH)<=.05 else 'WRONG','main north slope measured %s deg between two points of the mesh (sheet %s)'%(round(slope,2) if slope else None,PITCH))
eave=top(xs_,YN-.001); pr=top(PR_X-.003,-(gy['1']-500)/1000); ok4=eave and pr and abs(eave-EAVE4)<=.03 and abs(pr-PR4)<=.002
say('W-R4','PASS' if ok4 else 'WRONG','main eave z %.3f vs p4 %.3f; porch ridge z %.3f vs p4 %.3f'%(eave or 0,EAVE4,pr or 0,PR4))
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
    say('W-R6','PASS' if len(C)==2 and all(abs(z[0]-PF)<=.001 and abs(z[1]-WALLTOP)<=.001 for z in zr) and all(u and u>WALLTOP for u in under) else 'WRONG','IfcColumn %d z %s (expected %.3f..%.3f), roof above them %s'%(len(C),zr,PF,WALLTOP,[round(u,3) if u else None for u in under]))
SL=f.by_type('IfcSlab'); zt=sorted(round(max(v[2] for v in verts(e)),3) for e in SL)
say('W-R7','PASS' if len(zt)==2 and abs(zt[0]-PF)<=.001 and abs(zt[1]-FFL/1000)<=.001 else ('VACUOUS' if not SL else 'WRONG'),'IfcSlab tops %s (porch %.3f, main %.3f)'%(zt,PF,FFL/1000))
cnt={c:len(f.by_type(c)) for c in ('IfcWall','IfcDoor','IfcWindow')}
say('W-R8','PASS' if cnt=={'IfcWall':NWALL,'IfcDoor':ND,'IfcWindow':NW} else 'WRONG',str(cnt)+' (importer built %d walls, %d rising; p8 locations %d doors, %d windows)'%(NWALL,NGABLE,ND,NW))
GW=[e for e in f.by_type('IfcWall') if max(v[2] for v in verts(e))>WALLTOP+.01]
if not GW: say('W-R9','VACUOUS','no wall rises above the beam')
else:
    res=[]
    for e in GW:
        vs=verts(e); z0=min(v[2] for v in vs); bad=[v for v in vs if v[2]>z0+1e-6 and (top(v[0],v[1]) is None or abs(top(v[0],v[1])-TH-v[2])>.003)]; res.append((round(z0,3),round(max(v[2] for v in vs),3),len(bad)))
    say('W-R9','PASS' if len(GW)==NGABLE and all(abs(r[0]-WALLTOP)<=.001 and r[2]==0 for r in res) else 'WRONG','gable-end walls (base, peak, corners off the roof underside) %s, expected %d from base %.3f'%(res,NGABLE,WALLTOP))
print('§R RESULT fails',fails)
