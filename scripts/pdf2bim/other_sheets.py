#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §30 — Witnesses W-S1, W-S2, W-S3, W-S4, W-S7, W-S8. Issue: what do p2, p3, p7, p8 state, and do they agree with themselves, with the dictionary and with p1? A disagreement is a FINDING, never adjusted. Discovery only: nothing here enters the IFC.
# Usage: other_sheets.py <outdir> <rosetta.json> <pdf>      writes <outdir>/other/electrical.json
import re,sys,json,math,os,subprocess,collections
O,rj,pdf=sys.argv[1:4]; R=json.load(open(rj)); K=R['sheet']['mm_per_pt_fitted']; gx,gy=R['grid']['x'],R['grid']['y']; res={}
def say(n,v,msg): res[n]=v; print('§S',n,v,msg,flush=True)
def load(p):
    o=[]
    for m in re.finditer(r'<path ([^>]*?)/>',open(os.path.join(O,'svg','p%d.svg'%p)).read()):
        a=m.group(1)
        if ' d="' not in a or 'stroke="' not in a: continue
        sw=re.search(r'stroke-width="([\d.]+)"',a); t=re.search(r'transform="matrix\(([^)]*)\)"',a); M=[float(x) for x in t.group(1).split(',')] if t else [1,0,0,1,0,0]
        dd=re.search(r' d="([^"]*)"',a).group(1); n=[float(v) for v in re.findall(r'-?[\d.]+',dd)]
        o.append((float(sw.group(1)) if sw else 0,'C' in dd,[(M[0]*n[i]+M[2]*n[i+1]+M[4],M[1]*n[i]+M[3]*n[i+1]+M[5]) for i in range(0,len(n)-1,2)]))
    return o
def words(p):
    b=subprocess.run(['pdftotext','-f',str(p),'-l',str(p),'-bbox',pdf,'-'],capture_output=True,text=True,check=True).stdout
    return [(w[4],(float(w[0])+float(w[2]))/2,(float(w[1])+float(w[3]))/2) for w in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>',b)]
def bb(pts): xs=[q[0] for q in pts];ys=[q[1] for q in pts]; return min(xs),min(ys),max(xs),max(ys)
def circles(P):
    o=[]
    for sw,c,pts in P:
        if c and len(pts)>=4 and math.dist(pts[0],pts[-1])<.3:
            a,b,c2,d=bb(pts)
            if abs((c2-a)-(d-b))<.4: o.append(((a+c2)/2,(b+d)/2,(c2-a)/2))
    return o
def anchor(p,P,W):
    B={}
    for cx,cy,r in circles(P):
        if 9<=r<=11:
            for w in W:
                if w[0] in list(gx)+list(gy) and math.hypot(w[1]-cx,w[2]-cy)<=r: B[w[0]]=(cx,cy)
    return B
SH={}
for p in (2,3):
    P=load(p);W=words(p);B=anchor(p,P,W); n=len(B)
    if n==0: say('W-S1 p%d'%p,'VACUOUS','no grid bubble read'); continue
    xA,y5=B['A'][0],B['5'][1]; rx={k:round((B[k][0]-xA)*K-gx[k],1) for k in gx if k in B}; ry={k:round((B[k][1]-y5)*K-gy[k],1) for k in gy if k in B}; m=max(abs(v) for v in list(rx.values())+list(ry.values()))
    SH[p]=dict(P=P,W=W,xA=xA,y5=y5,X=lambda x,xA=xA:(x-xA)*K,Y=lambda y,y5=y5:(y-y5)*K)
    say('W-S1 p%d'%p,'PASS' if n==10 and m<=10 else 'WRONG','bubbles %d/10, worst residual %.1f mm vs dictionary %s %s'%(n,m,rx,ry))
def room_at(x,y,grow=0):
    if grow:
        exact=room_at(x,y,0)      # a point strictly inside one room is that room; the tolerance only serves points on a wall line
        if exact: return exact
    for r in R['rooms']:
        if not r.get('x') or not r.get('y'): continue
        a,b=gx[r['x'][0]],gx[r['x'][1]]; c,d=gy[r['y'][0]],gy[r['y'][1]]
        if a-grow<=x<=b+grow and c-grow<=y<=d+grow: return r['name']
    return 'ANJUNG' if gy['2']-grow<=y<=gy['1']+200 and gx['C']-grow<=x<=gx['D']+grow else None
# ---- W-S2 p2 symbols vs the QTY table
E=R['electrical_p2']; S=SH.get(2)
if S:
    W=S['W']; col=[w for w in W if re.fullmatch(r'[\d/]+',w[0]) and 620<=w[1]<=660]; rows_=collections.defaultdict(list)   # the QTY column: "1/4/2" comes as separate words on one row
    for w in col: rows_[round(w[2]/3)].append(w)
    qty=[(''.join(x[0] for x in sorted(v,key=lambda q:q[1])),) for k,v in sorted(rows_.items())]
    Q=dict(zip(E['qty_order_in_table'],[w[0] for w in qty])); print('§S QTY column as read',Q)
    inplan=lambda x,y:-1200<=S['X'](x)<=gx['E']+1200 and -1200<=S['Y'](y)<=gy['1']+1200; C=[c for c in circles(S['P']) if inplan(c[0],c[1])]
    def circ(r):
        d={}
        for x,y,q in C:
            if abs(q-r)<.06: d[(round(x*2)/2,round(y*2)/2)]=(S['X'](x),S['Y'](y))
        return list(d.values())
    def curve(wh):
        d={}
        for sw,c,pts in S['P']:
            if not c: continue
            a,b,c2,e=bb(pts); w,h=sorted((c2-a,e-b))
            if abs(w-wh[0])<.06 and abs(h-wh[1])<.06 and inplan((a+c2)/2,(b+e)/2): d[(round((a+c2)),round((b+e)))]=(S['X']((a+c2)/2),S['Y']((b+e)/2))
        return list(d.values())
    F={'ceiling_light':circ(E['plan_symbol_pt']['ceiling_light']['circle_r']),'ceiling_fan':circ(E['plan_symbol_pt']['ceiling_fan']['circle_r']),'switch':circ(E['plan_symbol_pt']['switch']['circle_r']),'power_outlet':curve(E['plan_symbol_pt']['power_outlet']['curve_wh']),'wall_light':curve(E['plan_symbol_pt']['wall_light']['curve_wh'])}
    want={'ceiling_light':Q.get('ceiling_light'),'ceiling_fan':Q.get('ceiling_fan'),'power_outlet':Q.get('power_outlet'),'wall_light':Q.get('wall_light'),'switch':str(sum(int(x) for x in Q.get('switches_1_4_2','0').split('/')))}
    bad=0
    for k,v in F.items():
        rooms=collections.Counter(room_at(x,y,60) for x,y in v); ok=want[k] is not None and int(want[k])==len(v); bad+=(not ok)
        say('W-S2 '+k,'VACUOUS' if not v else ('PASS' if ok else 'FINDING'),'drawn %d vs table %s | by room %s'%(len(v),want[k],dict(rooms)))
    os.makedirs(os.path.join(O,'other'),exist_ok=True); json.dump({k:[[round(a),round(-b)] for a,b in v] for k,v in F.items()},open(os.path.join(O,'other','electrical.json'),'w'),indent=1)
# ---- W-S3 roof: sheet ends, ridge, pitch
S=SH.get(3)
if S:
    V=collections.Counter(); H=collections.Counter()   # the roofing ribs are many parallel lines: their shared end coordinates are the sheet ends
    for sw,c,pts in S['P']:
        if c: continue
        for a,b in zip(pts,pts[1:]):
            if abs(a[0]-b[0])<.1 and abs(a[1]-b[1])>40: V[(round(S['Y'](min(a[1],b[1]))),round(S['Y'](max(a[1],b[1]))))]+=1
            if abs(a[1]-b[1])<.1 and abs(a[0]-b[0])>150: H[(round(S['X'](min(a[0],b[0]))),round(S['X'](max(a[0],b[0]))),round(S['Y'](a[1])))]+=1
    # the ribs stop at the ridge: the north half and the south half are two rows, each read on its own (the porch ribs run past grid 2 and past the south eave: excluded by stopping short of grid 1)
    nh=[(k,v) for k,v in V.most_common() if k[0]<0 and gy['5']<k[1]<gy['2']]; sh=[(k,v) for k,v in V.most_common() if gy['5']<k[0]<gy['2'] and gy['2']<k[1]<gy['1']]
    north=-nh[0][0][0] if nh else None; south=sh[0][0][1]-gy['2'] if sh else None; nr=(nh[0][1] if nh else 0,sh[0][1] if sh else 0)
    ridge=sorted(k for k in H if k[0]<-500 and k[1]>gx['E']+500 and gy['5']<k[2]<gy['2']); ys=sorted({k[2] for k in ridge}); W_=[k for k in ridge]; west=-min(k[0] for k in W_) if W_ else None; east=(max(k[1] for k in W_)-gx['E']) if W_ else None
    rc=(ys[0]+ys[-1])/2 if ys else None
    sides=dict(north=north,south=south,west=west,east=east)
    if rc is None: say('W-S3 ridge','VACUOUS','no ridge lines')
    else: say('W-S3 ridge','PASS' if abs(rc-gy['3'])<=30 else 'WRONG','ridge cap rows %s mm below grid 5, centre %.0f vs grid 3 %d'%(ys,rc,gy['3']))
    ok=all(v is not None and abs(v-750)<=15 for v in sides.values())
    say('W-S3 eaves','FINDING' if ok else 'WRONG','sheets end from the AXIS %s (ribs %s): = 700 printed + the 50 mm from axis to outer wall face; sections print 750. Measures where the sheets end, not the drafter\'s intent'%(sides,nr))
P6=load(6); Sl=collections.Counter()
for sw,c,pts in P6:
    if c: continue
    for a,b in zip(pts,pts[1:]):
        dx,dy=b[0]-a[0],b[1]-a[1]; L=math.hypot(dx,dy)
        if a[1]>320 and L>25 and abs(dx)>1 and abs(dy)>5: Sl[round(math.degrees(math.atan2(abs(dy),abs(dx))),1)]+=L
if not Sl: say('W-S3 pitch','VACUOUS','no sloping lines on section B-B')
else:
    deg,L=Sl.most_common(1)[0]; printed=[w[0] for w in words(3) if '25' in w[0]]
    say('W-S3 pitch','PASS' if abs(deg-R['roof']['pitch_deg'])<=.3 and printed else 'WRONG','longest sloping run on B-B %.1f deg (%d pt) vs printed %s x%d'%(deg,L,printed[:1],len(printed)))
    run=3100+750; rise=math.tan(math.radians(deg))*run; print('§S W-S3 derived, drawn values only: ridge z 4.872, run %d mm at %.1f deg falls %.0f mm: eaves z %.3f m (not in the IFC)'%(run,deg,rise,4.872-rise/1000))
# ---- W-S4 floor step on A-A vs printed room tags
mf=re.search(r'W-C5 A-A FFL level line y ([\d.]+)',open(os.path.join(O,'logs','09b_section_emit.log'),encoding='utf-8').read()); yf=float(mf.group(1)) if mf else None; A6=anchor(6,P6,words(6)).get('A')
step=[(min(a[0],b[0]),max(a[0],b[0]),a[1]) for sw,c,pts in P6 if yf and A6 and not c and sw>=3 for a,b in zip(pts,pts[1:]) if abs(a[1]-b[1])<.1 and yf+.5<a[1]<yf+3 and abs(a[0]-b[0])>20 and abs(a[0]-b[0])<(gx['C']/K) and A6[0]-10<=min(a[0],b[0]) and max(a[0],b[0])<=A6[0]+gx['E']/K+10]   # inside this section's A..E: the title block has lines at the same y
tags={r['name']:r.get('ffl_from_agl') for r in R['rooms'] if r.get('ffl_from_agl')}; vals=sorted({float(v) for v in tags.values()})
if not step: say('W-S4','VACUOUS','no step line on section A-A')
else:
    a,b,y=step[0]; dp=(y-yf)*K; da=(a-A6[0])*K; db=(b-A6[0])*K
    say('W-S4','FINDING' if abs(dp-50)<=10 and abs(db-gx['B'])<=100 and abs(da)<=100 else 'WRONG','a line %.0f mm below FFL spans x %.0f..%.0f mm = A..B, the two wet rooms; printed tags differ by %.0f (%s). The IFC slab is flat at 0.15. Also: tags read %s FFL from AGL, sections dimension 150'%(dp,da,db,vals[-1]-vals[0],vals,vals[-1]))
# ---- W-S7 p7 fixture words vs the p1 SYMBOLS table
W=words(7); pl=R['plumbing_p7']; lb=pl['legend_box_pt']; W=[w for w in W if not(lb[0]<=w[1]<=lb[2] and lb[1]<=w[2]<=lb[3])]; ym=pl['cold_water_diagram_y_max_pt']; cold=[w for w in W if w[2]<ym]; san=[w for w in W if w[2]>=ym]
ct=lambda L,t:sum(1 for w in L if w[0]==t); T=R['plan_symbols']['typ_units']
got={'tap':(ct(cold,'tap'),T['tap']),'wc':(ct(cold,'wc'),T['water closet (seating)']),'shower':(ct(cold,'sh'),T['shower']),'sink':(ct(cold,'sink'),T['aluminium kitchen sink']),'basin':(ct(cold,'basin'),T['basin']),'floor trap':(ct(san,'ft'),T['floor trap']),'gully trap':(ct(san,'gt'),T['gully trap'])}
if not sum(v[0] for v in got.values()): say('W-S7','VACUOUS','no fixture word read')
for k,(a,b) in got.items(): say('W-S7 '+k,'PASS' if a==b else 'FINDING','p7 drawn %d vs p1 table %d'%(a,b))
print('§S W-S7 NTS: %d pipe labels and %d items enter the dictionary YELLOW, topology only'%(len(pl['pipes_read']),len(pl['items_read'])))
# ---- W-S8 p8 locations vs plan
T8=' '.join(w[0] for w in words(8)).upper(); L=R['schedule_locations_p8']; miss=[n for k,v in L.items() if not k.startswith('_') for n in v for t in [n.split()[-1]] if t not in T8]
if miss: say('W-S8 text','WRONG','names not on p8: %s'%miss)
d=open(os.path.join(O,'typed','plan.dxf')).read().split('\n'); ents=[]; i=0; on=False
while i<len(d)-1:
    if d[i]=='2' and d[i+1]=='ENTITIES': on=True
    if on and d[i]=='0' and d[i+1] in('LINE',):
        j=i+2; g=[]
        while d[j]!='0': g.append((d[j],d[j+1])); j+=2
        g=dict(g)
        if g.get('8')=='A-GLAZ': ents.append(tuple(float(g[k]) for k in ('10','20','11','21')))
    i+=2
items=[]
for q in range(0,len(ents),4):
    xs=[v for a in ents[q:q+4] for v in (a[0],a[2])]; ys=[v for a in ents[q:q+4] for v in (a[1],a[3])]; wd=max(max(xs)-min(xs),max(ys)-min(ys)); c={600:'W3',1200:'W2',1800:'W1'}[min((600,1200,1800),key=lambda w:abs(w-wd))]; items.append((c,(min(xs)+max(xs))/2,-(min(ys)+max(ys))/2,100))
for m in re.finditer(r'door arc r \d+ at \((-?\d+), (-?\d+)\) nearest tag (D\d)',open(os.path.join(O,'logs','09_to_std.log')).read()): items.append((m.group(3),float(m.group(1)),-float(m.group(2)),0))
if not items: say('W-S8','VACUOUS','no opening judged')
else:
    wrong=[];seen=collections.defaultdict(list)
    for c,x,y,gr in items:
        r=room_at(x,y,gr); seen[c].append(r)
        if r not in L[c]: wrong.append((c,round(x),round(-y),r))
    cover=[(c,n) for c,v in L.items() if not c.startswith('_') for n in v if n not in seen[c]]
    say('W-S8','PASS' if not wrong and not cover else 'FINDING','%d openings judged, %s; outside the p8 location %s; p8 location with no opening %s'%(len(items),dict(seen),wrong,cover))
print('§S SUMMARY',json.dumps(collections.Counter(res.values())),'FINDING = the drawing disagrees with itself or with the model; reported, never adjusted')
