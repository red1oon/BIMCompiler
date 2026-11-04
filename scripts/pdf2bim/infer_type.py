#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §33 — fills the type template's blanks from the sheets. Orientation is presumed (template views); only dimensions and positions are read. Witness: W-T1, W-T4, W-T5.
# Usage: infer_type.py <svg dir> <rosetta.json> <template.json> <pdf> <out inferred.json>
import re,sys,json,math,collections,os,statistics
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import type_template as TT
sd,rj,tj,pdf,outj=sys.argv[1:6]; R=json.load(open(rj)); T=TT.load(tj); K=R['sheet']['mm_per_pt_fitted']; gx,gy=R['grid']['x'],R['grid']['y']; B=T['blanks']; BR,_=TT.radii(T,K); log=lambda *a:print('§INFER',*a,flush=True); V={}
log('type',T['type_name'],'| orientation presumed, structure preset: only the blanks are read')
def load(page):
    o=[]
    for m in re.finditer(r'<path ([^>]*?)/>',open(os.path.join(sd,'p%s.svg'%page)).read()):
        a=m.group(1)
        if 'stroke="' not in a or ' d="' not in a: continue
        t=re.search(r'transform="matrix\(([^)]*)\)"',a); M=[float(x) for x in t.group(1).split(',')] if t else [1,0,0,1,0,0]
        dd=re.search(r' d="([^"]*)"',a).group(1); tk=re.findall(r'[MLC]|-?[\d.]+',dd); pts=[];i=0;c=None
        while i<len(tk):
            if tk[i] in 'MLC': c=tk[i];i+=1;continue
            n=3 if c=='C' else 1; x,y=map(float,tk[i+2*(n-1):i+2*n]); i+=2*n; pts.append((M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5]))
        sw=re.search(r'stroke-width="([\d.]+)"',a)
        o.append(dict(pts=pts,curve='C' in dd,pen=TT.pen(float(sw.group(1)),M) if sw else None))
    return o
def segs(P,straight=True):
    for p in P:
        if straight and p['curve']: continue
        yield from zip(p['pts'],p['pts'][1:])
def circles(P,W,labels):
    "grid bubbles: a stroked circle holding a grid label in the text layer"
    o=[]
    for p in P:
        pts=p['pts']
        if not p['curve'] or len(pts)<4 or math.dist(pts[0],pts[-1])>=.3: continue
        xs=[q[0] for q in pts];ys=[q[1] for q in pts];wd=max(xs)-min(xs);ht=max(ys)-min(ys)
        if abs(wd-ht)<.4 and BR[0]<=wd/2<=BR[1]:
            c=((min(xs)+max(xs))/2,(min(ys)+max(ys))/2); o+=[(w,c,wd/2) for w in W if w[0] in labels and math.hypot(w[1]-c[0],w[2]-c[1])<=wd/2]
    return o
# ---- elevations: the view's beam, floor and ground lines are the only long lines at the template's two spacings (searched +-20% wide, so a wrong template still finds the sheet's lines and says FINDING)
S=T['sheets']; views={k:dict(v) for k,v in T['views'].items() if not k.startswith('_')}; PG={}; dB=[]; dG=[]
for sh in sorted({v['sheet'] for v in views.values()}):
    P=PG[sh]=load(sh); W=TT.words(pdf,sh); H=collections.defaultdict(float)
    for p in P:
        for a,b in zip(p['pts'],p['pts'][1:]):
            if abs(a[1]-b[1])<.15 and abs(a[0]-b[0])>0: H[round((a[1]+b[1])/2,1)]+=abs(a[0]-b[0])
    L=sorted(y for y,l in H.items() if l*K>=T['ruler']['long_line_mm']); nb,ng=B['beam_above_ffl']['nominal'],B['ffl_above_ground']['nominal']; cand=[]
    for y in L:
        for f in L:
            for g in L:
                d1,d2=(f-y)*K,(g-f)*K
                if abs(d1-nb)<=.2*nb and abs(d2-ng)<=.2*ng: cand.append((abs(d1-nb)+abs(d2-ng),y,f,g))
    here=[k for k,v in views.items() if v['sheet']==sh]; got=[]
    for c in sorted(cand):
        if all(abs(c[1]-q[1])>abs(c[3]-c[1]) for q in got): got.append(c)
        if len(got)==len(here): break
    if len(got)!=len(here): log('VACUOUS sheet',sh,'views wanted',len(here),'line triples found',len(got)); sys.exit(1)
    got.sort(key=lambda c:c[1]); rows={'upper':got[0],'lower':got[-1]}
    B6=circles(P,W,set(gx)|set(gy))
    for k in here:
        v=views[k]; c=rows[v['row']]; v['beam'],v['floor_line'],v['ground_line']=c[1],c[2],c[3]; dB.append((c[2]-c[1])*K); dG.append((c[3]-c[2])*K)
        labs=gx if 'X' in v['haxis'] else gy; above=[q for q in B6 if q[0][0] in labs and q[1][1]<c[1]]; row=max(q[1][1] for q in above)   # the label row nearest above this view's beam
        inrow=[q for q in above if abs(q[1][1]-row)<=q[2]]; first=min(inrow,key=lambda q:q[0][1]); v['ox']=round(first[0][1],1); v['label_row']=round(row,2); v['labels_read']=len(inrow)
        log('view',k,'p%s'%sh,v['row'],'beam',v['beam'],'floor',v['floor_line'],'ground',v['ground_line'],'first label',first[0][0],'ox',v['ox'],'labels',len(inrow),'of',len(labs))
V['beam_above_ffl']=TT.decide('beam_above_ffl',statistics.median(dB),B['beam_above_ffl'],'%d views'%len(dB))
V['ffl_above_ground']=TT.decide('ffl_above_ground',statistics.median(dG),B['ffl_above_ground'],'%d views'%len(dG))
# ---- side elevations: the top of the highest straight line at the roof's pitch
pitch=R['roof']['pitch_deg']; tops=[]
for k,v in views.items():
    if 'Y' not in v['haxis']: continue
    t=[v['beam']-min(a[1],b[1]) for a,b in segs(PG[v['sheet']]) if math.hypot(a[0]-b[0],a[1]-b[1])>20 and abs(a[0]-b[0])>2 and abs(a[1]-b[1])>2 and abs(math.degrees(math.atan2(abs(a[1]-b[1]),abs(a[0]-b[0])))-pitch)<=1 and v['label_row']<min(a[1],b[1]) and max(a[1],b[1])<v['ground_line']]
    if t: tops.append(max(t)*K)
V['ridge_above_beam']=TT.decide('ridge_above_beam',statistics.median(tops) if tops else None,B['ridge_above_beam'],'%d side views'%len(tops))
# ---- roof plan: the sheet ribs stop at the eaves; between the two rib groups lies the ridge
P3=load(S['roof']); W3=TT.words(pdf,S['roof']); B3={q[0][0]:q[1] for q in circles(P3,W3,set(gx)|set(gy))}; ey=None; ridge=None
if 'A' in B3 and '5' in B3:
    xA,y5=B3['A'][0],B3['5'][1]; Yr=lambda y:(y-y5)*K; RV=collections.Counter()
    for a,b in segs(P3):
        if abs(a[0]-b[0])<.1 and abs(a[1]-b[1])>40: RV[(round(Yr(min(a[1],b[1]))/5)*5,round(Yr(max(a[1],b[1]))/5)*5)]+=1
    nn=[k for k,v in RV.most_common() if k[0]<0 and k[1]<gy['2']]; ss=[k for k,v in RV.most_common() if gy['5']<k[0]<gy['2'] and k[1]>gy['2']]
    if nn and ss: ey=(-nn[0][0]+ss[0][1]-gy['2'])/2; ridge=(nn[0][1]+ss[0][0])/2; log('roof ribs: north end',-nn[0][0],'south end',ss[0][1]-gy['2'],'ridge between',nn[0][1],ss[0][0])
V['eaves_from_axis']=TT.decide('eaves_from_axis',ey,B['eaves_from_axis'],'p%s ribs'%S['roof'])
ax=T['preset']['roof']['main_ridge_axis']; log('main ridge presumed on axis',ax,'at',gy[ax],'| ribs put it at',ridge,'FINDING: not on the presumed axis' if ridge is not None and abs(ridge-gy[ax])>25 else '')
# ---- plan: the wall pen's paired lines
W1=TT.words(pdf,S['plan']); P1=load(S['plan']); HL=collections.defaultdict(list); VL=collections.defaultdict(list)
for p in P1:
    if p['pen'] is None or not TT.is_wall_pen(p['pen'],T,K): continue
    for a,b in zip(p['pts'],p['pts'][1:]):
        if abs(a[1]-b[1])<=.25 and abs(a[0]-b[0])>.25: HL[round((a[1]+b[1])/2,1)].append((min(a[0],b[0]),max(a[0],b[0])))
        elif abs(a[0]-b[0])<=.25 and abs(a[1]-b[1])>.25: VL[round((a[0]+b[0])/2,1)].append((min(a[1],b[1]),max(a[1],b[1])))
nt=B['wall_thickness']['nominal']; gaps=[]
for L_ in (HL,VL):
    ks=sorted(L_)
    for i,a in enumerate(ks):
        for b in ks[i+1:]:
            g=(b-a)*K
            if g>1.3*nt: break
            if g>=.7*nt and any(min(s[1],t[1])-max(s[0],t[0])>=5 for s in L_[a] for t in L_[b]): gaps.append(g)
V['wall_thickness']=TT.decide('wall_thickness',statistics.median(gaps) if gaps else None,B['wall_thickness'],'%d paired lines'%len(gaps))
# ---- front elevation: the porch floor line sits between the floor line and the ground line
porch=[k for k,v in views.items() if k==T['preset']['roof']['porch_on_face']][0]; v=views[porch]; HH=collections.defaultdict(lambda:[1e9,-1e9])
for a,b in segs(PG[v['sheet']]):
    if abs(a[1]-b[1])<.1 and abs(a[0]-b[0])>30 and v['floor_line']<a[1]<v['ground_line']: e=HH[round((v['floor_line']-a[1])*K/5)*5]; e[0]=min(e[0],a[0],b[0]); e[1]=max(e[1],a[0],b[0])
cn=[k for k in HH if abs(-k-V['ffl_above_ground']['value'])>B['ffl_above_ground']['tol_mm']]; st=-min(cn,key=lambda k:abs(-k-B['porch_step_below_ffl']['nominal'])) if cn else None   # the line nearest the ruler's value that is not the ground line itself
V['porch_step_below_ffl']=TT.decide('porch_step_below_ffl',st,B['porch_step_below_ffl'],'%s lines between floor and ground %s'%(porch,sorted(HH)))
json.dump(dict(type_name=T['type_name'],template=T,views=views,values=V),open(outj,'w'),indent=1)
log('RESULT',{k:r['status'] for k,r in V.items()},'wrote',outj)
