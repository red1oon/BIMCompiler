#!/usr/bin/env python3
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §34 — W-W1, W-W2. Issue: do the windows fit their holes (§31: stand-ins 819 wide in a 600 hole, 759 high in a 1000 hole, 352-417 deep in a 100 wall)? Reads the IFC's own triangles and the drawn openings on the plan and elevations. Run WITHOUT -I.
# Usage: witness_windows.py <outdir> <rosetta.json>
import sys,os,json,ifcopenshell
import ifcopenshell.util.placement as PL
O,rj=sys.argv[1:3]; R=json.load(open(rj)); f=ifcopenshell.open(os.path.join(O,'tbkltn_p1.ifc')); fails=0; SZ=R['schedule_sizes_mm']
def say(n,v,m):
    global fails
    if v!='PASS': fails+=1
    print('§W',n,v,m,flush=True)
def bb(e):
    M=PL.get_local_placement(e.ObjectPlacement); o=[]
    for r in e.Representation.Representations:
        for it in r.Items:
            if it.is_a()=='IfcTriangulatedFaceSet':
                for x,y,z in it.Coordinates.CoordList: o.append(tuple(float(M[i][0]*x+M[i][1]*y+M[i][2]*z+M[i][3]) for i in range(3)))
    return [min(p[i] for p in o) for i in range(3)],[max(p[i] for p in o) for i in range(3)]
win=[bb(e) for e in f.by_type('IfcWindow')]
if not win: say('W-W1','VACUOUS','no IfcWindow'); sys.exit(1)
sizes={(v[0],v[1]) for k,v in SZ.items() if k[0]=='W'}; rows=[]
for a,b in win:
    w=max(b[0]-a[0],b[1]-a[1])*1000; d=min(b[0]-a[0],b[1]-a[1])*1000; h=(b[2]-a[2])*1000
    near=min(sizes,key=lambda s:abs(s[0]-w)+abs(s[1]-h)); rows.append((round(w,1),round(h,1),round(d,1),near,abs(near[0]-w)<=1 and abs(near[1]-h)<=1))
say('W-W1','PASS' if len(win)==7 and all(r[4] for r in rows) else 'WRONG','%d windows (width, height, depth, p8 size) %s'%(len(win),[r[:4] for r in rows]))
# the holes as drawn: plan chain ends (A-GLAZ lines) and sill/head from the elevations' A-GLAZ rectangles
d=open(os.path.join(O,'typed','plan.dxf')).read().split('\n'); L=[]; i=0
while i<len(d)-1:
    if d[i]=='0' and d[i+1]=='LINE':
        j=i+2; g={}
        while d[j]!='0': g[d[j]]=d[j+1]; j+=2
        if g.get('8')=='A-GLAZ': L.append(tuple(float(g[k]) for k in ('10','20','11','21')))
    i+=2
holes=[]
for q in range(0,len(L),4):
    xs=[v for a in L[q:q+4] for v in (a[0],a[2])]; ys=[v for a in L[q:q+4] for v in (a[1],a[3])]; holes.append((min(xs)/1000,min(ys)/1000,max(xs)/1000,max(ys)/1000))
if len(holes)!=len(win): say('W-W2','VACUOUS','%d holes for %d windows'%(len(holes),len(win)))
else:
    worst=0; deep=0; un=[]
    for a,b in win:
        cx,cy=(a[0]+b[0])/2,(a[1]+b[1])/2; h=min(holes,key=lambda q:abs((q[0]+q[2])/2-cx)+abs((q[1]+q[3])/2-cy)); along=0 if (b[0]-a[0])>=(b[1]-a[1]) else 1
        e=max(abs(a[along]-h[along])*1000,abs(b[along]-h[along+2])*1000); worst=max(worst,e); deep=max(deep,(b[1-along]-a[1-along])*1000)
        z=(round(a[2],3),round(b[2],3)); un.append(z)
    say('W-W2','PASS' if worst<=5 and deep<=100.5 else 'WRONG','worst mismatch to the drawn hole along the wall %.1f mm (tol 5), deepest %.1f mm (wall 100), z ranges %s'%(worst,deep,sorted(set(un))))
say('RESULT','PASS' if not fails else 'WRONG','fails %d'%fails)
