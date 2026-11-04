#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §20 — Witness: W-P12 (emit + round-trip), W-P5b (cell-run walls on grid)
# Usage: emit_dxf_p1.py <svg> <rosetta.json> <pdf> <out.dxf> <template.json>
import re,sys,json,math,collections,subprocess,statistics,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import type_template as TT
svgf,rj,pdf,outf,tj=sys.argv[1:6]; T=TT.load(tj); R=json.load(open(rj)); K=R['sheet']['mm_per_pt_fitted']; log=lambda *a:print('§PDF',*a,flush=True)
svg=open(svgf).read(); P=[]
def bez(p0,c1,c2,p1,t): u=1-t; return tuple(u**3*p0[i]+3*u*u*t*c1[i]+3*u*t*t*c2[i]+t**3*p1[i] for i in (0,1))
for m in re.finditer(r'<path ([^>]*?)/>',svg):
    a=m.group(1)
    if 'stroke="' not in a: continue
    dd=re.search(r' d="([^"]*)"',a).group(1)
    t=re.search(r'transform="matrix\(([^)]*)\)"',a); M=[float(x) for x in t.group(1).split(',')] if t else [1,0,0,1,0,0]
    sw=TT.pen(float(re.search(r'stroke-width="([\d.]+)"',a).group(1)),M)
    tr=lambda x,y:(M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5])
    tk=re.findall(r'[MLC]|-?[\d.]+',dd); pts=[];smp=[];i=0;c=None
    while i<len(tk):
        if tk[i] in 'MLC': c=tk[i];i+=1;continue
        if c=='C':
            v=[float(x) for x in tk[i:i+6]]; i+=6; c1,c2,e=tr(v[0],v[1]),tr(v[2],v[3]),tr(v[4],v[5]); s=pts[-1]
            smp+=[bez(s,c1,c2,e,k/6) for k in range(1,7)]; pts.append(e)
        else:
            x,y=float(tk[i]),float(tk[i+1]); i+=2; pts.append(tr(x,y)); smp.append(pts[-1])
    P.append((sw,pts,smp,'C' in dd))
# ---- grid anchors (text layer) + the wall pen's pair centres give the Y bias
W=TT.words(pdf,TT.page_of(svgf)); FX0,FX1,FY0,FY1=TT.plan_frame(W,R,T); IN=lambda xs,ys:FX0<=min(xs) and max(xs)<=FX1 and FY0<=min(ys) and max(ys)<=FY1
BR,_=TT.radii(T,K); gx,gy=R['grid']['x'],R['grid']['y']; x0=TT.top_row(W,gx)['A'][1]; y5=TT.left_col(W,gy)['5'][2]
hy=sorted({round((p[0][1]+p[1][1])/2,1) for sw,pts,s,cv in P if TT.is_wall_pen(sw,T,K) and len(pts)==2 for p in [pts] if abs(p[0][1]-p[1][1])<.25 and abs(p[0][0]-p[1][0])>30})
cent=[(a+b)/2 for a,b in zip(hy,hy[1:]) if 2<=b-a<=3.6]; bias=statistics.median(min(c-(y5+gy[k]/K) for k in gy for _ in [0]) if False else min((c-(y5+gy[k]/K) for k in gy),key=abs) for c in cent)
y0=y5+bias; log('E0 anchors x0',round(x0,2),'y5_label',round(y5,2),'Y bias',round(bias,2),'pt -> axis5 y',round(y0,2),'from',len(cent),'sw3 H pair centres')
X=lambda x:round((x-x0)*K,1); Y=lambda y:round(-(y-y0)*K,1)
E=[]   # (layer,type,args)
# ---- grid
xmax=gx['E']; ymin=-gy['1']
# §29 W-C3: the sheet's own grid bubbles: a stroked circle holding exactly one text-layer word, centred on the dictionary axis of that word (dxf2qualify gridLines reads a label only as TEXT inside a CIRCLE on the grid layer)
circ=[]
for sw,pts,s_,cv in P:
    if cv and len(pts)>=4 and math.dist(pts[0],pts[-1])<.3:
        xs=[q[0] for q in pts];ys=[q[1] for q in pts];w=max(xs)-min(xs);h=max(ys)-min(ys)
        if abs(w-h)<.3 and BR[0]<=w/2<=BR[1]: circ.append(((min(xs)+max(xs))/2,(min(ys)+max(ys))/2,w/2))
def bubble(label,on_x):
    want=x0+gx[label]/K if on_x else y0+gy[label]/K; c=[q for q in circ if abs((q[0] if on_x else q[1])-want)<=1.5 and any(w[0]==label and math.hypot(w[1]-q[0],w[2]-q[1])<=q[2] for w in W)]
    return min(c,key=lambda q:abs((q[0] if on_x else q[1])-want)) if len(c)>=1 else None
nb=0; BUB={}
for k in gx:
    q=bubble(k,True)
    if q: BUB[k]=(gx[k],Y(q[1]),round(q[2]*K,1)); nb+=1
for k in gy:
    q=bubble(k,False)
    if q: BUB[k]=(X(q[0]),-gy[k],round(q[2]*K,1)); nb+=1
log('W-C3 grid bubbles read',nb,'of',len(gx)+len(gy),{k:(round(v[0]),round(v[1]),v[2]) for k,v in BUB.items()})
for k,v in gx.items(): E.append(('PDF-GRID','LINE',(v,BUB[k][1]-BUB[k][2] if k in BUB else 500,v,ymin-500)))
for k,v in gy.items(): E.append(('PDF-GRID','LINE',(BUB[k][0]+BUB[k][2] if k in BUB else -500,-v,xmax+500,-v)))
# ---- window chains (100x500 mm modules at 600 mm pitch): needed first, the walls are CUT at them (standard form: an opening is a GAP in the wall)
modc=[]
for sw,pts,s_,cv in P:
    if len(pts)==5 and math.dist(pts[0],pts[-1])<.05:
        xs=[q[0] for q in pts];ys=[q[1] for q in pts]; a_,b_=sorted(((max(xs)-min(xs))*K,(max(ys)-min(ys))*K))
        if IN(xs,ys) and abs(a_-100)<=15 and abs(b_-500)<=25: modc.append(('H' if (max(xs)-min(xs))>(max(ys)-min(ys)) else 'V',round((min(xs)+max(xs))/2,1),round((min(ys)+max(ys))/2,1)))
modc=sorted(set(modc)); wchains=[]   # (orient, axis coordinate pt, lo pt, hi pt)
for o_ in 'HV':
    g_=collections.defaultdict(list)
    for oo,x_,y_ in modc:
        if oo==o_: g_[round(y_ if o_=='H' else x_)].append((x_ if o_=='H' else y_, y_ if o_=='H' else x_))
    for kk,v_ in g_.items():
        v_.sort(); cur=[v_[0]]
        for a_ in v_[1:]:
            if abs((a_[0]-cur[-1][0])*K-600)<=60: cur.append(a_)
            else: wchains.append((o_,cur[0][1],cur[0][0]-300/K,cur[-1][0]+300/K)); cur=[a_]
        wchains.append((o_,cur[0][1],cur[0][0]-300/K,cur[-1][0]+300/K))
log('E00 window chains found for wall cutting',len(wchains))
for k,(cx_,cy_,r_) in BUB.items(): E+=[('PDF-GRID','CIRCLE',(cx_,cy_,r_)),('PDF-GRID','TEXT',(cx_,cy_,150,k))]
# ---- walls: (a) sw3 pairs (b) 100 mm cell runs
H=collections.defaultdict(list);V=collections.defaultdict(list)
for sw,pts,s,cv in P:
    if TT.is_wall_pen(sw,T,K) and len(pts)==2:
        p,q=pts
        if abs(p[1]-q[1])<=.25 and abs(p[0]-q[0])>.25: H[round((p[1]+q[1])/2,1)].append((min(p[0],q[0]),max(p[0],q[0])))
        elif abs(p[0]-q[0])<=.25 and abs(p[1]-q[1])>.25: V[round((p[0]+q[0])/2,1)].append((min(p[1],q[1]),max(p[1],q[1])))
def merge(iv,g=0.02):
    iv=sorted(iv); o=[list(iv[0])]
    for a,b in iv[1:]:
        if a<=o[-1][1]+g: o[-1][1]=max(o[-1][1],b)
        else: o.append([a,b])
    return o
walls=[]  # (orient, centre_pt, lo_pt, hi_pt, src)
for orient,D in (('H',H),('V',V)):
    ks=sorted(D)
    for i,a in enumerate(ks):
        for b in ks[i+1:]:
            if b-a>3.6: break
            if b-a<2.0: continue
            for s in merge(D[a]):
                for t in merge(D[b]):
                    lo,hi=max(s[0],t[0]),min(s[1],t[1])
                    if hi-lo>=5: walls.append((orient,(a+b)/2,lo,hi,'sw3pair'))
n_pair=len(walls)
cells={}
for sw,pts,s,cv in P:
    if len(pts)==5 and math.dist(pts[0],pts[-1])<.05:
        xs=[q[0] for q in pts];ys=[q[1] for q in pts];w=max(xs)-min(xs);h=max(ys)-min(ys)
        if IN(xs,ys) and abs(w*K-100)<=12 and abs(h*K-100)<=12: cells[(round((min(xs)+max(xs))/2/.25),round((min(ys)+max(ys))/2/.25))]=((min(xs)+max(xs))/2,(min(ys)+max(ys))/2)
C=list(cells.values()); log('W-P5b 100 mm cells (deduped by centre)',len(C),'(raw count earlier 379+12 incl. nested duplicates)')
def runs(C,orient):
    g=collections.defaultdict(list)
    for x,y in C: g[round(y/.4) if orient=='H' else round(x/.4)].append(x if orient=='H' else y)
    out=[]
    for k,v in g.items():
        v.sort(); cur=[v[0]]
        for a in v[1:]:
            if a-cur[-1]<=3.4: cur.append(a)
            else: out.append((k*.4,cur)); cur=[a]
        out.append((k*.4,cur))
    return [(c,v[0]-1.38,v[-1]+1.38,len(v)) for c,v in out if len(v)>=3]
rh=runs(C,'H'); rv=runs(C,'V'); log('W-P5b cell runs (>=3 cells) H',len(rh),'V',len(rv))
# classify run: on a grid axis?  axis positions in pt
AX={('V',k):x0+v/K for k,v in gx.items()}; AX.update({('H',k):y0+v/K for k,v in gy.items()})
def axis(o,c): k,p=min(((kk[1],p) for kk,p in AX.items() if kk[0]==o),key=lambda kp:abs(kp[1]-c)); return k,round(c-p,2)
off_axis=[]
for o,rr in (('H',rh),('V',rv)):
    for c,lo,hi,n in rr:
        k,d=axis(o,c)
        if abs(d)<=1.5: walls.append((o,c,lo,hi,'cells@'+k))
        else: off_axis.append((o,k,d,round((hi-lo)*K),n))
log('W-P5b runs on a grid axis (<=1.5pt)',len(walls)-n_pair,'| off-axis runs (partitions/other)',len(off_axis),sorted(off_axis)[:12])
# merge duplicates (pair + cells on the same axis/extent) -> wall edges
bymerge=collections.defaultdict(list)
for o,c,lo,hi,src in walls: k,d=axis(o,c); bymerge[(o,k)].append((lo,hi,src))
nwall=0; tot=0
for (o,k),iv in sorted(bymerge.items()):
    cuts=sorted((c0,c1) for oo,cc,c0,c1 in wchains if oo==o and abs(cc-AX[(o,k)])<=1.6)
    pieces=[]
    for lo,hi in merge([(a,b) for a,b,_ in iv],0.8):
        cur=lo
        for c0,c1 in cuts:
            if c1<=cur or c0>=hi: continue
            if c0>cur: pieces.append((cur,c0))
            cur=max(cur,c1)
        if hi>cur: pieces.append((cur,hi))
    for lo,hi in pieces:
        cpt=AX[(o,k)]
        if o=='H':
            y=Y(cpt); vax=[x0+v/K for v in gx.values()]
            def endv(pt,sgn):    # a piece END within 2 pt of a vertical axis ends exactly at that axis +- 50 mm (the cells overshoot by ~1 mm; importer snap_tol is 1 mm)
                for k_,a in zip(gx,vax):
                    if abs(pt-a)<=2.0: return gx[k_]+(50 if pt>a else -50)
                return X(pt)
            xl=endv(lo,-1); xh=endv(hi,+1)
            E.append(('PDF-WALL','LWPOLYLINE',((xl,y-50),(xh,y-50),(xh,y+50),(xl,y+50))))   # standard form: a wall is a closed FOOTPRINT (GAP:wall_not_footprint otherwise)
        else:
            x=X(cpt); hax=[y0+v/K for v in gy.values()]
            def endh(pt):        # vertical piece end near a horizontal axis: axis +- 50 exactly (y up: pt above the axis -> +50)
                for k_,a in zip(gy,hax):
                    if abs(pt-a)<=2.0: return -gy[k_]+(50 if pt<a else -50)
                return Y(pt)
            yl,yh=endh(lo),endh(hi)
            E.append(('PDF-WALL','LWPOLYLINE',((x-50,yl),(x-50,yh),(x+50,yh),(x+50,yl))))
        nwall+=1; tot+=(hi-lo)*K
log('W-P5b wall runs emitted',nwall,'total centreline length m',round(tot/1000,2),'sources',dict(collections.Counter(s for _,_,_,_,s in walls if True) if False else collections.Counter(w[4].split('@')[0] for w in walls)))
# ---- windows: ONE closed rectangle per chain (chain width x wall thickness), standard form; columns (200x300) as before
nw=nc=0
for o_,ac,lo,hi in wchains:
    acs=min((p_ for (oo_,k_),p_ in AX.items() if oo_==o_),key=lambda p_:abs(p_-ac))   # snap the chain to its wall axis: the window must lie exactly in the wall (touches the envelope face)
    if o_=='H': x1,x2,y1,y2=X(lo),X(hi),Y(acs)+50,Y(acs)-50
    else: x1,x2,y1,y2=X(acs)-50,X(acs)+50,Y(lo),Y(hi)
    lay='PDF-WINDOW'; E+=[(lay,'LINE',(x1,y1,x2,y1)),(lay,'LINE',(x2,y1,x2,y2)),(lay,'LINE',(x2,y2,x1,y2)),(lay,'LINE',(x1,y2,x1,y1))]; nw+=1
for sw,pts,s_,cv in P:
    if len(pts)==5 and math.dist(pts[0],pts[-1])<.05:
        xs=[q[0] for q in pts];ys=[q[1] for q in pts]
        if not IN(xs,ys): continue
        a,b=sorted(((max(xs)-min(xs))*K,(max(ys)-min(ys))*K))
        if abs(a-200)<=40 and abs(b-300)<=40:
            x1,x2,y1,y2=X(min(xs)),X(max(xs)),Y(max(ys)),Y(min(ys)); near_w3=any(w[0]=='W3' and math.hypot(w[1]-(min(xs)+max(xs))/2,w[2]-(min(ys)+max(ys))/2)<=20 for w in W)   # §15: the W3 tag sits 14-15 pt from its column; a rectangle with no tag near is not a column (§32)
            lay='PDF-COLUMN' if near_w3 else 'PDF-UNCLASSIFIED'; nc+=1
            E.append((lay,'LWPOLYLINE',((x1,y1),(x2,y1),(x2,y2),(x1,y2)))); log('W-C4 column rect' if near_w3 else 'W-C4 rectangle with no W3 tag, YELLOW, not a column',(x1,y2),(x2,y1),'centre',(round((x1+x2)/2,1),round((y1+y2)/2,1)))
log('E1 window chain rectangles',nw,'(from 100x500 modules)','column rects (200x300 anywhere in plan, incl. unexplained one)',nc)
# ---- door arcs
nd=0; nfix=0; DOORREC=[]
for sw,pts,smp,cv in P:
    if cv and len(pts)>=2 and math.dist(pts[0],pts[-1])>3:
        xs=[q[0] for q in pts];ys=[q[1] for q in pts];w=max(xs)-min(xs);h=max(ys)-min(ys); r=max(w,h)
        if IN(xs,ys) and 15<=r<=30 and abs(w-h)<=.08*r and abs(math.dist(pts[0],pts[-1])-r*math.sqrt(2))<=.08*r:
            cands=[(min(xs),min(ys)),(min(xs),max(ys)),(max(xs),min(ys)),(max(xs),max(ys))]
            c=min(cands,key=lambda q:statistics.pstdev([math.dist(q,s) for s in smp]) if math.dist(q,pts[0])>.8*r and math.dist(q,pts[-1])>.8*r else 9e9)
            cm=(X(c[0]),Y(c[1])); a0=math.degrees(math.atan2(Y(pts[0][1])-cm[1],X(pts[0][0])-cm[0]))%360; a1=math.degrees(math.atan2(Y(pts[-1][1])-cm[1],X(pts[-1][0])-cm[0]))%360
            if abs(((a1-a0)%360)-90)>3: a0,a1=a1,a0
            # standard form (importer snap_tol 1 mm): hinge on a face line of the wall it sits in, and the closed-leaf end meeting a wall piece END. The PDF draws the arc from the leaf's outer edge (hinge a few tens of mm off the
            # wall face) and the frame jambs (~90 mm each side of the leaf) inside the gap, so: hinge -> nearest face of its strip; the piece beyond the leaf end is extended 0-130 mm to the leaf end (the jamb becomes wall)
            rm=round(r*K,1)
            # the PDF draws the CLEAR-opening radius (schedule width minus a ~80 mm frame, measured D1/D2 80, D3 81, §19) and its wall gaps follow TWO conventions: some gaps equal the schedule width (leaf in a framed opening),
            # some equal the clear radius. The importer wants leaf width = arc radius = gap. Try the SCHEDULE width first (p8 text layer, exact); keep the measured radius where the drawn gap only fits that.
            rsch=next((float(w) for w in (R['schedule_sizes_mm']['D1'][0],R['schedule_sizes_mm']['D3'][0]) if 40<=w-rm<=120),rm)
            A0=(round(a0/90)*90)%360; A1=(A0+90)%360; hx0,hy0=cm
            if min(abs(rm-(R['schedule_sizes_mm'][k_][0]-off_)) for k_ in ('D1','D2','D3') for off_ in (0,80))>25:
                E.append(('PDF-FIXTURE-ARC','ARC',(hx0,hy0,rm,A0,A1))); nfix+=1; log('W-C1 arc r',rm,'at',cm,'is no schedule door width: kept on PDF-FIXTURE-ARC, YELLOW (§19), not a door'); continue
            for rr in ([rsch,rm] if rsch!=rm else [rm]):
                hx,hy=hx0,hy0; best=None
                WL=[(i_,e[2]) for i_,e in enumerate(E) if e[0]=='PDF-WALL']
                for ang in (A0,A1):
                    dx,dy=round(math.cos(math.radians(ang))),round(math.sin(math.radians(ang))); ex,ey=hx+rr*dx,hy+rr*dy
                    for i_,w in WL:
                        xs_=[q[0] for q in w]; ys_=[q[1] for q in w]; mnx,mny,mxx,mxy=min(xs_),min(ys_),max(xs_),max(ys_); horiz=(mxx-mnx)>(mxy-mny)
                        if dy==0 and horiz and mny-70<=hy<=mxy+70:
                            gapd=((mnx-ex) if dx>0 else (ex-mxx))      # piece edge beyond the leaf end
                            if -12<=gapd<=130 and (best is None or gapd<best['g']): best=dict(g=gapd,i=i_,w=(mnx,mny,mxx,mxy),dx=dx,dy=dy,ex=ex,ey=ey,face=min((mny,mxy),key=lambda f_:abs(f_-hy)),horiz=True)
                        if dx==0 and (not horiz) and mnx-70<=hx<=mxx+70:
                            gapd=((mny-ey) if dy>0 else (ey-mxy))
                            if -12<=gapd<=130 and (best is None or gapd<best['g']): best=dict(g=gapd,i=i_,w=(mnx,mny,mxx,mxy),dx=dx,dy=dy,ex=ex,ey=ey,face=min((mnx,mxx),key=lambda f_:abs(f_-hx)),horiz=False)
                if best: break
            if best and rr!=rsch: log('E2r door radius kept as drawn',rr,'(the drawn gap fits only the clear opening; schedule width',rsch,'would overshoot the wall piece)')
            if best:
                mnx,mny,mxx,mxy=best['w']
                if best['horiz']:
                    nh=(hx,best['face']); nmnx,nmxx=(best['ex'],mxx) if best['dx']>0 else (mnx,best['ex']); newp=((nmnx,mny),(nmxx,mny),(nmxx,mxy),(nmnx,mxy))
                else:
                    nh=(best['face'],hy); nmny,nmxy=(best['ey'],mxy) if best['dy']>0 else (mny,best['ey']); newp=((mnx,nmny),(mxx,nmny),(mxx,nmxy),(mnx,nmxy))
                E[best['i']]=('PDF-WALL','LWPOLYLINE',tuple((round(q[0],1),round(q[1],1)) for q in newp))
                jamb_done=False
                for i2,w2 in [(i_,e[2]) for i_,e in enumerate(E) if e[0]=='PDF-WALL' and i_!=best['i']]:
                    xs2=[q[0] for q in w2]; ys2=[q[1] for q in w2]; a2,b2,c2,d2=min(xs2),min(ys2),max(xs2),max(ys2)
                    if best['horiz'] and abs((b2+d2)/2-(mny+mxy)/2)<1 and (c2-a2)>(d2-b2):
                        edge=(c2 if best['dx']>0 else a2); gap_=((hx-edge) if best['dx']>0 else (edge-hx))
                        if -12<=gap_<=150:
                            nn=((a2,b2),(hx,b2),(hx,d2),(a2,d2)) if best['dx']>0 else ((hx,b2),(c2,b2),(c2,d2),(hx,d2)); E[i2]=('PDF-WALL','LWPOLYLINE',tuple((round(q[0],1),round(q[1],1)) for q in nn)); log('E2j hinge-side jamb: wall piece extended',round(gap_,1),'mm to the hinge'); jamb_done=True; break
                    if (not best['horiz']) and abs((a2+c2)/2-(mnx+mxx)/2)<1 and (d2-b2)>(c2-a2):
                        edge=(d2 if best['dy']>0 else b2); gap_=((hy-edge) if best['dy']>0 else (edge-hy))
                        if -12<=gap_<=150:
                            nn=((a2,b2),(c2,b2),(c2,hy),(a2,hy)) if best['dy']>0 else ((a2,hy),(c2,hy),(c2,d2),(a2,d2)); E[i2]=('PDF-WALL','LWPOLYLINE',tuple((round(q[0],1),round(q[1],1)) for q in nn)); log('E2j hinge-side jamb: wall piece extended',round(gap_,1),'mm to the hinge'); jamb_done=True; break
                log('E2s door hinge',(round(hx,1),round(hy,1)),'->',(round(nh[0],1),round(nh[1],1)),'| wall piece edge extended by',round(best['g'],1),'mm to the closed-leaf end'); hx,hy=nh
                if not jamb_done:   # hinge side is a perpendicular wall (T junction) <= 150 mm away: a derived pier from that wall face to the hinge, so the gap equals the leaf
                    for i3,w3 in [(i_,e[2]) for i_,e in enumerate(E) if e[0]=='PDF-WALL']:
                        xs3=[q[0] for q in w3]; ys3=[q[1] for q in w3]; a3,b3,c3,d3=min(xs3),min(ys3),max(xs3),max(ys3)
                        if (not best['horiz']) and (c3-a3)>(d3-b3) and a3-1<=best['w'][0] and best['w'][2]<=c3+1:      # vertical door, horizontal wall spanning its strip at the hinge side
                            face=(d3 if best['dy']>0 else b3)           # y up: leaf going up -> hinge side is below (wall's top edge d3); leaf going down -> wall above (its bottom edge b3)
                            gap3=(hy-face) if best['dy']>0 else (face-hy)
                            if 0<gap3<=150:
                                lo3,hi3=sorted((hy,face)); E.append(('PDF-WALL','LWPOLYLINE',((best['w'][0],lo3),(best['w'][2],lo3),(best['w'][2],hi3),(best['w'][0],hi3)))); log('E2k hinge-side pier (T junction) added',round(gap3,1),'mm between the wall face and the hinge'); jamb_done=True; break
                        if best['horiz'] and (d3-b3)>(c3-a3) and b3-1<=best['w'][1] and best['w'][3]<=d3+1:            # horizontal door, vertical wall spanning its strip at the hinge side
                            face=(c3 if best['dx']>0 else a3)
                            gap3=(hx-face) if best['dx']>0 else (face-hx)
                            if 0<gap3<=150:
                                lo3,hi3=sorted((hx,face)); E.append(('PDF-WALL','LWPOLYLINE',((lo3,best['w'][1]),(hi3,best['w'][1]),(hi3,best['w'][3]),(lo3,best['w'][3])))); log('E2k hinge-side pier (T junction) added',round(gap3,1),'mm between the wall face and the hinge'); jamb_done=True; break
            else: log('E2s door NOT snapped (no wall piece edge within 130 mm beyond its closed-leaf end)',(round(hx,1),round(hy,1)),'r',rr)
            E.append(('PDF-DOOR-SWING','ARC',(round(hx,1),round(hy,1),rr,A0,A1))); nd+=1
            if best: DOORREC.append((hx,hy,best['dx'],best['dy'],best['horiz'],best['w']))
for i_ in range(len(DOORREC)):
    for j_ in range(i_+1,len(DOORREC)):
        a_,b_=DOORREC[i_],DOORREC[j_]
        if a_[4]!=b_[4]: continue
        if a_[4]:   # horizontal wall: same hinge y, leaves pointing away from each other, hinges close
            if abs(a_[1]-b_[1])<=1 and a_[2]==-b_[2] and abs(a_[0]-b_[0])<=400 and (a_[0]-b_[0])*a_[2]>0:
                lo_,hi_=sorted((a_[0],b_[0])); t_=a_[5]; E.append(('PDF-WALL','LWPOLYLINE',((lo_,t_[1]),(hi_,t_[1]),(hi_,t_[3]),(lo_,t_[3])))); log('E2p pier between two doors sharing a gap (horizontal wall), x',round(lo_,1),'..',round(hi_,1),'=',round(hi_-lo_,1),'mm')
        else:
            if abs(a_[0]-b_[0])<=1 and a_[3]==-b_[3] and abs(a_[1]-b_[1])<=400 and (a_[1]-b_[1])*a_[3]>0:
                lo_,hi_=sorted((a_[1],b_[1])); t_=a_[5]; E.append(('PDF-WALL','LWPOLYLINE',((t_[0],lo_),(t_[2],lo_),(t_[2],hi_),(t_[0],hi_)))); log('E2p pier between two doors sharing a gap (vertical wall), y',round(lo_,1),'..',round(hi_,1),'=',round(hi_-lo_,1),'mm')
log('E2 door swing arcs emitted',nd,'| non-door arcs kept',nfix)
# ---- tags
nt=0
for t,cx,cy in W:
    if re.fullmatch(r'[DW]\d',t) and FX0<=cx<=FX1 and FY0<=cy<=FY1: E.append(('PDF-TAG','TEXT',(X(cx),Y(cy),150,t))); nt+=1
log('E3 tag texts',nt)
# ---- DXF writer (ASCII R12 style) + own round-trip reader
L=sorted({e[0] for e in E})
o=['0','SECTION','2','HEADER','9','$INSUNITS','70','4','0','ENDSEC','0','SECTION','2','TABLES','0','TABLE','2','LAYER','70',str(len(L))]
for l in L: o+=['0','LAYER','2',l,'70','0','62','7','6','CONTINUOUS']
o+=['0','ENDTAB','0','ENDSEC','0','SECTION','2','ENTITIES']
for lay,ty,a in E:
    o+=['0',ty,'8',lay]
    if ty=='LINE': o+=['10',a[0],'20',a[1],'30','0','11',a[2],'21',a[3],'31','0']
    elif ty=='ARC': o+=['10',a[0],'20',a[1],'30','0','40',a[2],'50',a[3],'51',a[4]]
    elif ty=='LWPOLYLINE': o+=['90',len(a),'70',1]+sum([['10',q[0],'20',q[1]] for q in a],[])
    elif ty=='CIRCLE': o+=['10',a[0],'20',a[1],'30','0','40',a[2]]
    else: o+=['10',a[0],'20',a[1],'30','0','40',a[2],'1',a[3]]
o+=['0','ENDSEC','0','EOF']; open(outf,'w').write('\n'.join(str(x) for x in o)+'\n')
rd=open(outf).read().split('\n'); back=collections.Counter(); i=0; ent=False
while i<len(rd)-1:
    g,v=rd[i],rd[i+1]
    if g=='2' and v=='ENTITIES': ent=True
    if ent and g=='0' and v in('LINE','ARC','TEXT','LWPOLYLINE','CIRCLE'): ty=v
    if ent and g=='8': back[(v,ty)]+=1
    i+=2
want=collections.Counter((l,t) for l,t,a in E)
log('W-P12 round-trip entities written',sum(want.values()),'read back',sum(back.values()),'by layer',dict(sorted(back.items())),'PASS' if back==want else 'WRONG')
# ---- W-P13 closure: every gap between consecutive wall runs on one axis should be an opening (door 750/900, window 600/1200/1800, ±60 mm) or a junction (<=100 mm)
OW=[600,750,900,1200,1800]; unexpl=[]; ng=0
for (o,k),iv in sorted(bymerge.items()):
    m=merge([(a,b) for a,b,_ in iv],0.8)
    log('W-P13 axis',o+k,'runs',len(m),'covered_m',round(sum(b-a for a,b in m)*K/1000,2),'extent_mm',(round((m[0][0]-(x0 if o=='H' else y0))*K),round((m[-1][1]-(x0 if o=='H' else y0))*K)))
    for (a,b),(c,d) in zip(m,m[1:]):
        g=(c-b)*K; ng+=1
        cls=min(OW,key=lambda w:abs(w-g)); ok=abs(cls-g)<=60 or g<=100
        log('W-P13   gap',round(g),'mm ->',cls if abs(cls-g)<=60 else ('junction' if g<=100 else 'UNEXPLAINED'),'' if ok else 'YELLOW')
        if not ok: unexpl.append((o+k,round(g)))
log('W-P13 gaps',ng,'unexplained',len(unexpl),unexpl)
