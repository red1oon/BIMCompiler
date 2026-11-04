#!/usr/bin/env python3
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §40 — W-2D. Issue: on a drawing in another hand, is the house in the IFC the house in the generator's table, which the chain never reads? Reads the IFC's triangles. Run WITHOUT -I.
# Usage: witness_second.py <outdir> <truth.json>
import sys,os,re,json,math,ifcopenshell
import ifcopenshell.util.placement as PL
O,tj=sys.argv[1:3]; T=json.load(open(tj)); fails=0; TOL=10
def say(n,c,m):
    global fails
    if c is None: print('§2D',n,'FINDING',m,flush=True); return
    if not c: fails+=1
    print('§2D',n,'PASS' if c else 'WRONG',m,flush=True)
if not os.path.exists(os.path.join(O,'tbkltn_p1.ifc')): say('IFC',False,'no IFC written'); print('§2D RESULT fails',fails); sys.exit(0)
f=ifcopenshell.open(os.path.join(O,'tbkltn_p1.ifc')); rd=lambda n:open(os.path.join(O,'logs',n),encoding='utf-8').read() if os.path.exists(os.path.join(O,'logs',n)) else ''
def bb(e):
    M=PL.get_local_placement(e.ObjectPlacement); o=[]
    for r in e.Representation.Representations:
        for it in r.Items:
            if it.is_a()=='IfcTriangulatedFaceSet':
                for x,y,z in it.Coordinates.CoordList: o.append(tuple(float(M[i][0]*x+M[i][1]*y+M[i][2]*z+M[i][3]) for i in range(3)))
    return [min(p[i]*1000 for p in o) for i in range(3)],[max(p[i]*1000 for p in o) for i in range(3)]
GX,GY=T['grid_x'],T['grid_y']; h=T['wall']/2; FFL,BM=T['ffl'],T['beam']
W=[bb(e) for e in f.by_type('IfcWall')]; low=[b for b in W if b[1][2]<=FFL+BM+1]; x0=min(b[0][0] for b in low); x1=max(b[1][0] for b in low); y1=max(b[1][1] for b in low); y0=min(b[0][1] for b in low); ztop=max(b[1][2] for b in low); zb=min(b[0][2] for b in low)
say('T1 wall envelope and thickness',abs(x0+h)<=TOL and abs(x1-GX['E']-h)<=TOL and abs(y1-h)<=TOL and abs(y0+GY['2']+h)<=TOL,'x %.0f..%.0f y %.0f..%.0f (table x %.0f..%.0f y %.0f..%.0f)'%(x0,x1,y0,y1,-h,GX['E']+h,-GY['2']-h,h))
say('T2 FFL and beam',abs(zb-FFL)<=TOL and abs(ztop-FFL-BM)<=TOL,'walls z %.0f..%.0f (table %d..%d)'%(zb,ztop,FFL,FFL+BM))
R=[bb(e) for e in f.by_type('IfcRoof')]; rz=max(b[1][2] for b in R) if R else None; want=FFL+BM+T['ridge_above_beam']; say('T3 roof',bool(R) and len(R)==4 and abs(rz-want)<=TOL,'%d planes, top %s (table %d)'%(len(R),rz and round(rz),want))
rmx=max(b[1][0] for b in R); rmn=min(b[0][0] for b in R); say('T4 eaves',abs(rmn+T['eaves'])<=TOL and abs(rmx-GX['E']-T['eaves'])<=TOL,'roof x %.0f..%.0f'%(rmn,rmx))
def where(t,ax,l,c): return (c,-GY[l]) if ax=='x' else (GX[l],-c)
for cls,pre in (('IfcDoor','D'),('IfcWindow','W')):
    B=[bb(e) for e in f.by_type(cls)]; want=[o for o in T['openings'] if o[0][0]==pre]; used=set(); bad=[]
    for t,ax,l,c in want:
        px,py=where(t,ax,l,c); best=None
        for i,(a,b) in enumerate(B):
            if i in used: continue
            d=math.hypot((a[0]+b[0])/2-px,(a[1]+b[1])/2-py)
            if best is None or d<best[0]: best=(d,i)
        if best is None: bad.append((t,l,c,'none')); continue
        used.add(best[1]); a,b=B[best[1]]; wd=max(b[0]-a[0],b[1]-a[1]); ht=b[2]-a[2]; dp=min(b[0]-a[0],b[1]-a[1]); z0=a[2]; W_,H_=T['sizes'][t]; s=0 if pre=='D' else T['sills'][t]
        if best[0]>TOL or abs(wd-W_)>TOL or abs(ht-H_)>TOL or abs(z0-FFL-s)>TOL or abs(dp-T['wall'])>TOL: bad.append((t,l,c,'off %.0f w %.0f h %.0f z0 %.0f d %.0f'%(best[0],wd,ht,z0,dp)))
    say('T5 '+cls+': each at its place, size, height, wall-deep',len(B)==len(want) and not bad,'%d of %d, wrong %s'%(len(B),len(want),bad[:4]))
L=rd('06b_read_rooms.log'); rm={m.group(2):(m.group(1),m.group(3)) for m in re.finditer(r'^§ROOM (\w+) printed (\S+) cell \S+ .*?\| (.+?) \|',L,re.M)}; rm={m.group(3):(m.group(1),m.group(2)) for m in re.finditer(r'^§ROOM (\w+) printed (\S+) cell \S+ .*?\| (.+?) \|',L,re.M)}; wrongr=[(n,a,rm.get(n)) for n,a in T['rooms'] if not rm.get(n) or rm[n][0]!='READ' or abs(float(rm[n][1])-a)>.005]
say('T6 rooms: every printed area read and equal to its cell',not wrongr and len(rm)==10,'%d rooms, wrong %s'%(len(rm),wrongr[:3]))
FI=rd('00_fill_blanks.log')+rd('03b_infer_type.log')+rd('08_elev_emit.log')+rd('09b_section_emit.log'); d=re.findall(r'^§INFER (\S+) DEFAULT',FI,re.M); say('T7 DEFAULT on what the sheet does state',None if d else True,'DEFAULT %s'%sorted(set(d)))
ver=re.search(r'§LIB accepted (\d+) .*?verdict (\S+)',rd('11_lib_probe.log')); blk=re.search(r'§LIB blocking (\d+) (\{.*?\})',rd('11_lib_probe.log')); say('T8 it qualifies',ver and ver.group(2)=='qualifies','verdict %s, blocking %s %s, accepted %s'%(ver and ver.group(2),blk and blk.group(1),blk and blk.group(2)[:90],ver and ver.group(1)))
print('§2D RESULT fails',fails)
