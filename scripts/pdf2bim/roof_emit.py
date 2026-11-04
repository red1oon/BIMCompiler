#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §32 — the roof and the porch read from p3 (footprints), p4 + p6 (heights), written into the typed sheets in the importer's form (bim-ootb §L36). Witness: witness_house_roof.py.
# Usage: roof_emit.py <p3.svg> <p4.svg> <p6.svg> <rosetta.json> <pdf> <typed dir>
import re,sys,json,math,collections,subprocess,os
s3,s4,s6,rj,pdf,out=sys.argv[1:7]; R=json.load(open(rj)); K=R['sheet']['mm_per_pt_fitted']; gx,gy=R['grid']['x'],R['grid']['y']; log=lambda *a:print('§ROOF',*a,flush=True); PITCH=R['roof']['pitch_deg']; tan=math.tan(math.radians(PITCH))
def load(f):
    o=[]
    for m in re.finditer(r'<path ([^>]*?)/>',open(f).read()):
        a=m.group(1)
        if ' d="' not in a or 'stroke="' not in a: continue
        t=re.search(r'transform="matrix\(([^)]*)\)"',a); M=[float(x) for x in t.group(1).split(',')] if t else [1,0,0,1,0,0]
        dd=re.search(r' d="([^"]*)"',a).group(1); n=[float(v) for v in re.findall(r'-?[\d.]+',dd)]
        o.append(('C' in dd,[(M[0]*n[i]+M[2]*n[i+1]+M[4],M[1]*n[i]+M[3]*n[i+1]+M[5]) for i in range(0,len(n)-1,2)]))
    return o
def words(p):
    b=subprocess.run(['pdftotext','-f',str(p),'-l',str(p),'-bbox',pdf,'-'],capture_output=True,text=True,check=True).stdout
    return [(w[4],(float(w[0])+float(w[2]))/2,(float(w[1])+float(w[3]))/2) for w in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>',b)]
def bubbles(P,W,ok):
    B={}
    for c,pts in P:
        if c and len(pts)>=4 and math.dist(pts[0],pts[-1])<.3:
            xs=[q[0] for q in pts];ys=[q[1] for q in pts];r=(max(xs)-min(xs))/2
            if 9<=r<=11 and abs((max(xs)-min(xs))-(max(ys)-min(ys)))<.4:
                cx,cy=(min(xs)+max(xs))/2,(min(ys)+max(ys))/2
                for w in W:
                    if w[0] in ok and math.hypot(w[1]-cx,w[2]-cy)<=r and ok(w,cy) if callable(ok) else False: B[w[0]]=(cx,cy)
    return B
def segs(P):
    for c,pts in P:
        if not c:
            for a,b in zip(pts,pts[1:]): yield a,b
# ---- p3: footprints
P3=load(s3); W3=words(3); B3={}
for c,pts in P3:
    if c and len(pts)>=4 and math.dist(pts[0],pts[-1])<.3:
        xs=[q[0] for q in pts];ys=[q[1] for q in pts];r=(max(xs)-min(xs))/2
        if 9<=r<=11 and abs((max(xs)-min(xs))-(max(ys)-min(ys)))<.4:
            cx,cy=(min(xs)+max(xs))/2,(min(ys)+max(ys))/2
            for w in W3:
                if w[0] in list(gx)+list(gy) and math.hypot(w[1]-cx,w[2]-cy)<=r: B3[w[0]]=(cx,cy)
xA,y5=B3['A'][0],B3['5'][1]; X=lambda x:(x-xA)*K; Y=lambda y:(y-y5)*K
V=collections.Counter(); H=collections.Counter()
for a,b in segs(P3):
    if abs(a[0]-b[0])<.1 and abs(a[1]-b[1])>40: V[(round(Y(min(a[1],b[1]))/5)*5,round(Y(max(a[1],b[1]))/5)*5)]+=1
    if abs(a[1]-b[1])<.1 and abs(a[0]-b[0])>40 and Y(a[1])>gy['2']+800 and Y(a[1])<gy['1']+800 and 0<X(min(a[0],b[0])) and X(max(a[0],b[0]))<gx['E']:   # inside the building: the notes table beside the plan has long lines at the same y
        H[(round(X(min(a[0],b[0]))/5)*5,round(X(max(a[0],b[0]))/5)*5)]+=1
north=[k for k,v in V.most_common() if k[0]<0 and k[1]<gy['2']][0]; south=[k for k,v in V.most_common() if gy['5']<k[0]<gy['2'] and k[1]>gy['2']][0]
EAVE=750
log('main sheet ends from p3 ribs: north',-north[0],'south',south[1]-gy['2'],'-> axis +-',EAVE,'(W-S3)')
T2=H.most_common(2); nr=[v for k,v in T2]; px0=min(k[0] for k,v in T2); px1=max(k[1] for k,v in T2); pc=(px0+px1)/2   # the ribs stop at the ridge cap: two groups, one each side of the ridge
front=max(round(Y(max(a[1],b[1]))) for a,b in segs(P3) if abs(a[0]-b[0])<.1 and abs(X(a[0])-px0)<=40 and Y(max(a[1],b[1]))>gy['1'] and Y(max(a[1],b[1]))<gy['1']+1500 and abs(a[1]-b[1])>6)
log('porch roof footprint from p3: ribs x',px0,px1,'n',nr,'ridge x',pc,'front y',front)
# ---- p4: heights (front elevation: beam 426.4 pt = 3000 above FFL, §22, W-E1)
P4=load(s4); ox,beam=246.3,426.4; XF=lambda x:(x-ox)*K; ZF=lambda y:(beam-y)*K+3000
sl=[]
for a,b in segs(P4):
    dx,dy=b[0]-a[0],b[1]-a[1]
    if math.hypot(dx,dy)>20 and abs(dx)>2 and abs(dy)>2 and 300<a[1]<520 and 300<b[1]<520:
        q=sorted([(XF(a[0]),ZF(a[1])),(XF(b[0]),ZF(b[1]))],key=lambda t:-t[1]); sl.append((q[0][1],q[0][0],q[1][0],q[1][1],math.degrees(math.atan2(abs(dy),abs(dx)))))
if not sl: log('VACUOUS: no sloped line on the front elevation'); sys.exit(0)
ap=max(sl); apex=round(ap[0]); widthP4=2*abs(ap[2]-ap[1])
log('porch apex from p4: z above FFL',apex,'slope deg',round(ap[4],1),'gable x',round(ap[1]-abs(ap[2]-ap[1])),round(ap[1]+abs(ap[2]-ap[1])),'eave z',round(ap[3]))
HH=collections.defaultdict(lambda:[1e9,-1e9])
for a,b in segs(P4):
    if abs(a[1]-b[1])<.1 and abs(a[0]-b[0])>30 and 340<a[1]<520:
        k=round(ZF(a[1])/5)*5; e=HH[k]; e[0]=min(e[0],XF(min(a[0],b[0]))); e[1]=max(e[1],XF(max(a[0],b[0])))
fl=HH.get(-100); log('porch floor line p4: z -100, x',[round(v) for v in fl] if fl else None)
log('FINDING porch width: p3',px1-px0,'p4',round(widthP4),'difference',round(widthP4-(px1-px0)),'(p3 used: the plan gives footprints)')
meet=gy['3']+(4722-apex)/tan; drawn=4865
log('FINDING valley join on the porch ridge: rule y',round(meet),'p3 drawn y',drawn,'difference',round(drawn-meet),'(the height is not adjusted to fit)')
# ---- p6 B-B: how far the porch floor runs
P6=load(s6); W6=words(6); yf=None
m=re.search(r'W-C5 B-B FFL level line y ([\d.]+)',open(os.path.join(os.path.dirname(out.rstrip('/')),'logs','09b_section_emit.log'),encoding='utf-8').read()); yf=float(m.group(1)) if m else None
xb=[]
for c,pts in P6:
    if c and len(pts)>=4 and math.dist(pts[0],pts[-1])<.3:
        xs=[q[0] for q in pts];ys=[q[1] for q in pts];r=(max(xs)-min(xs))/2
        if 9<=r<=11:
            cx,cy=(min(xs)+max(xs))/2,(min(ys)+max(ys))/2
            for w in W6:
                if w[0]=='5' and math.hypot(w[1]-cx,w[2]-cy)<=r and cy>250: xb.append(cx)
ends=[]
for a,b in segs(P6):
    if yf and xb and abs(a[1]-b[1])<.1 and abs(a[0]-b[0])>6 and abs((yf-a[1])*K+100)<=8: ends+= [ (min(a[0],b[0])-xb[0])*K,(max(a[0],b[0])-xb[0])*K ]
pend=round(max(ends)) if ends else None; log('porch floor line p6 B-B: south end y',pend,'from',len(ends)//2,'segments')
if not (fl and pend): log('VACUOUS: the porch floor is not stated on both sheets: not written'); pf=None
else: pf=(round(fl[0]),round(fl[1]),pend)
# ---- write: roof sheet
def tail_insert(path,lines):
    d=open(path).read().split('\n'); j=max(k for k in range(len(d)-1) if d[k]=='ENDSEC' and d[k-1]=='0'); open(path,'w').write('\n'.join(d[:j-1]+lines+d[j-1:]))
lw=lambda lay,pts,extra=[]:['0','LWPOLYLINE','8',lay,'90',str(len(pts)),'70','1']+extra+sum([['10',str(x),'20',str(y)] for x,y in pts],[])
rect=lambda x0,y0,x1,y1:[(x0,y0),(x1,y0),(x1,y1),(x0,y1)]
line=lambda lay,a,b,z:['0','LINE','8',lay,'10',str(a[0]),'20',str(a[1]),'30',str(z),'11',str(b[0]),'21',str(b[1]),'31',str(z)]
mk=lambda t,x,y:['0','TEXT','8','DXF2BIM-MARK','10',str(x),'20',str(y),'30','0','40','150','1',t+' @BY=model']
W=gx['E']; S=gy['2']; ridgeZ=4872; rz=gy['3']; pz=apex+150
roof=lw('A-ROOF-GABLE',rect(-EAVE,-(S+EAVE),W+EAVE,EAVE))+line('A-ROOF-RIDGE',(-EAVE,-rz),(W+EAVE,-rz),ridgeZ)+lw('A-ROOF-GABLE',rect(pc-(px1-px0)/2,-front,pc+(px1-px0)/2,-rz))+line('A-ROOF-RIDGE',(pc,-front),(pc,-rz),pz)+mk('@PITCH=%s'%PITCH,-3000,-6000)
# gable ends the elevations draw closed above the beam (p5 both sides, p4 the porch): walls rising to the roof. Thickness = the plan's 100 mm walls (W-P5). The porch one stands on the column line, between the columns' outer faces (§15)
TW=100; roof+=lw('A-WALL-GABLE',rect(-TW/2,-(S+TW/2),TW/2,TW/2))+lw('A-WALL-GABLE',rect(W-TW/2,-(S+TW/2),W+TW/2,TW/2))+lw('A-WALL-GABLE',rect(3250.3,-gy['1']-TW/2,6650.8,-gy['1']+TW/2))
tail_insert(os.path.join(out,'roof.dxf'),roof)
log('roof.dxf: gables 2, ridge z',ridgeZ,pz,'pitch',PITCH)
# ---- write: plan: floor pieces (the main slab keeps its ring and its section thickness; the porch states its own), columns
p=[]
D=R['floor_buildup']['depth_mm']; xs0,xs1=50,W-50; ys0,ys1=-(S-50),-50
if pf: p+=lw('A-FLOR-OTLN',rect(xs0,ys0,xs1,ys1),['38','150','39',str(D)])+lw('A-FLOR-OTLN',rect(pf[0],-pf[2],pf[1],-(S+50)),['38','50','39',str(D)])
p+=mk('@BODYZ=column,0.05,3.15',-3000,-6300)
tail_insert(os.path.join(out,'plan.dxf'),p)
log('plan.dxf: floor pieces',2 if pf else 0,'porch',pf,'columns z 0.05..3.15')
