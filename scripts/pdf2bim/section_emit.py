#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §29 — Witness: W-C5. Reads the floor build-up from the two sections on p6 (FFL level line -> the sheet's only chromatic line, note G8 membrane) and the cut from the plan's section markers,
# then writes the importer's SECTION sheet (S-SLAB rect: dictionary floor_buildup, status YELLOW). Writes NOTHING if either section disagrees: the row stays stated rather than filled by a guess.
# Usage: section_emit.py <p6.svg> <p1.svg> <rosetta.json> <pdf> <typed outdir> <inferred.json>
import re,sys,json,math,subprocess,collections,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import type_template as TT
sv6,sv1,rj,pdf,out,ij=sys.argv[1:7]; R=json.load(open(rj)); I=json.load(open(ij)); FG=I['values']['ffl_above_ground']['value']; BH=I['values']['beam_above_ffl']['value']; K=R['sheet']['mm_per_pt_fitted']; log=lambda *a:print('§PDF',*a,flush=True); DEPTH=R['floor_buildup']['depth_mm']; TOL=10
def paths(f):
    o=[]
    for m in re.finditer(r'<path ([^>]*?)/>',open(f).read()):
        a=m.group(1)
        if 'stroke="' not in a or ' d="' not in a: continue
        col=[float(v) for v in re.findall(r'[\d.]+',re.search(r'stroke="rgb\(([^)]*)\)"',a).group(1))] if 'stroke="rgb' in a else [0,0,0]
        t=re.search(r'transform="matrix\(([^)]*)\)"',a); M=[float(x) for x in t.group(1).split(',')] if t else [1,0,0,1,0,0]
        dd=re.search(r' d="([^"]*)"',a).group(1); n=[float(v) for v in re.findall(r'-?[\d.]+',dd)]
        o.append((col,'C' in dd,[(M[0]*n[i]+M[2]*n[i+1]+M[4],M[1]*n[i]+M[3]*n[i+1]+M[5]) for i in range(0,len(n)-1,2)]))
    return o
def words(p):
    b=subprocess.run(['pdftotext','-f',str(p),'-l',str(p),'-bbox',pdf,'-'],capture_output=True,text=True,check=True).stdout
    return [(w[4],(float(w[0])+float(w[2]))/2,(float(w[1])+float(w[3]))/2) for w in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>',b)]
def circles(P,W,rmin,rmax):
    o=[]
    for col,cv,pts in P:
        if not cv or len(pts)<4 or math.dist(pts[0],pts[-1])>=.3: continue
        xs=[q[0] for q in pts];ys=[q[1] for q in pts];r=(max(xs)-min(xs))/2
        if abs((max(xs)-min(xs))-(max(ys)-min(ys)))<.3 and rmin<=r<=rmax:
            c=((min(xs)+max(xs))/2,(min(ys)+max(ys))/2); o+=[(w[0],c[0],c[1],r) for w in W if math.hypot(w[1]-c[0],w[2]-c[1])<=r]
    return o
P6=paths(sv6); W6=words(TT.page_of(sv6)); gx=R['grid']['x']; gy=R['grid']['y']; BR,MR=TT.radii(I['template'],K); B6=circles(P6,W6,BR[0],BR[1])
sections={'A-A':{k:(x,y) for k,x,y,r in B6 if k in gx},'B-B':{k:(x,y) for k,x,y,r in B6 if k in gy}}   # letters head the cut along X, numbers the cut along Y
# horizontal segments of each section's band, by y: level lines are the long dash-dot rows (many dashes on one y); the membrane is the chromatic row
res={}
for name,bub in sections.items():
    if len(bub)<2: log('W-C5',name,'VACUOUS: grid bubbles read',len(bub)); continue
    ys=[v[1] for v in bub.values()]; xs=[v[0] for v in bub.values()]; yb=max(ys); lv=collections.defaultdict(list); ch=collections.defaultdict(list)
    for col,cv,pts in P6:
        if cv: continue
        chromatic=max(col)-min(col)>20
        for p,q in zip(pts,pts[1:]):
            if abs(p[1]-q[1])<.1 and abs(p[0]-q[0])>.3 and yb<p[1]<yb+260:
                if chromatic: ch[round(p[1],1)].append((min(p[0],q[0]),max(p[0],q[0])))
                else: lv[round(p[1],1)].append((min(p[0],q[0]),max(p[0],q[0])))
    if not ch: log('W-C5',name,'VACUOUS: no chromatic line'); continue
    ym=max(ch,key=lambda y:len(ch[y])); levels=sorted(y for y,s_ in lv.items() if len(s_)>=50 and min(a for a,b in s_)<min(xs)-10 and max(b for a,b in s_)>max(xs)+10)   # a level line is a long dash-dot row running PAST the outer grid bubbles (a hatch row in a tiled wall has as many dashes but stays inside the building)
    above=[y for y in levels if y<ym-.5]
    if not above: log('W-C5',name,'VACUOUS: no level line above the membrane; rows',levels); continue
    yf=max(above); d=(ym-yf)*K; ok=abs(d-DEPTH)<=TOL
    res[name]=dict(ok=ok,d=d,yf=yf,ym=ym,x=(min(a for a,b in ch[ym]),max(b for a,b in ch[ym])),bub=bub)
    log('W-C5',name,'FFL level line y',yf,'membrane y',ym,'dashes',len(ch[ym]),'x',round(res[name]['x'][0],1),round(res[name]['x'][1],1),'depth mm',round(d,1),'vs drawn',DEPTH,'PASS' if ok else 'WRONG')
if len(res)<2 or not all(v['ok'] for v in res.values()):
    log('W-C5 RESULT no section sheet written: the two sections do not both state the build-up (slab_no_underside stays stated)'); sys.exit(0)
# the cut: the plan's section marker bubbles (radius below the grid bubbles'), the label on both ends of one horizontal line; anchored as emit_dxf_p1 anchors the plan
P1=paths(sv1); W1=words(TT.page_of(sv1)); M1=[c for c in circles(P1,W1,MR[0],MR[1]) if c[0]=='A']
y5=TT.left_col(W1,gy)['5'][2]
cb=[q for q in circles(P1,W1,BR[0],BR[1]) if q[0]=='5']; y0=cb[0][2] if cb else y5
if len(M1)!=2 or abs(M1[0][2]-M1[1][2])>.1: log('W-C5 RESULT no section sheet written: section marker A not found on both ends',M1); sys.exit(0)
cut=round(-(M1[0][2]-y0)*K); A=res['A-A']; xA=A['bub']['A'][0]; hmin,hmax=round((A['x'][0]-xA)*K,1),round((A['x'][1]-xA)*K,1)
log('W-C5 cut from the plan markers: A at',[(round(m[1],1),round(m[2],1)) for m in M1],'-> Y',cut,'mm | grid residuals mm',{k:round((v[0]-xA)*K-gx[k],1) for k,v in A['bub'].items()},'| slab h',hmin,hmax)
tx=lambda x,y,t:['0','TEXT','8','DXF2BIM-MARK','10',str(x),'20',str(y),'30','0','40','150','1',t+' @BY=user']
rect=['0','LWPOLYLINE','8','S-SLAB','90','4','70','1']+sum([['10',str(x),'20',str(y)] for x,y in ((hmin,-DEPTH),(hmax,-DEPTH),(hmax,0),(hmin,0))],[])
o=['0','SECTION','2','ENTITIES']+rect; yc=round((A['yf']-A['bub']['A'][1])*K,1); rb=round(max(r for k,x,y,r in B6 if k in A['bub'])*K,1)
for k,v in A['bub'].items():   # the section's own grid bubbles, read above
    h=gx[k]; o+=['0','LINE','8','A-GRID','10',str(h),'20',str(-DEPTH),'30','0','11',str(h),'21',str(yc-rb),'31','0','0','CIRCLE','8','A-GRID','10',str(h),'20',str(yc),'30','0','40',str(rb),'0','TEXT','8','A-GRID','10',str(h),'20',str(yc),'30','0','40','150','1',k]
for n,m in enumerate(('@SET=STD','@VIEW=SECTION','@NAME=SECTION A-A','@UNITS=mm','@HAXIS=+X','@CUT=Y,%d'%cut)): o+=tx(-3000,-1000-300*n,m)
for k,v in gx.items(): o+=tx(v,-600,'@GRIDH=%s'%k)
for z,y in ((0,-DEPTH),(FG/1000,0),((FG+BH)/1000,BH)): o+=tx(-1500,y,'@Z=%s'%z)
o+=['0','ENDSEC','0','EOF']; f=os.path.join(out,'section_aa.dxf'); open(f,'w').write('\n'.join(o)+'\n')
log('W-C5 RESULT wrote',f,'S-SLAB top z',FG/1000,'bottom z 0 (floor build-up, YELLOW: dictionary floor_buildup)')
