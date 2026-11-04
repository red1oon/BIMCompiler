#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §19 — Witness: W-P6 (openings from GEOMETRY vs the PDF's own schedule)
# Usage: openings_p1.py <svg> <rosetta.json> <pdf> <template.json>
import re,sys,json,math,collections,subprocess,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import type_template as TT
svgf,rj,pdf,tj=sys.argv[1:5]; T=TT.load(tj); R=json.load(open(rj)); log=lambda *a:print('§PDF',*a,flush=True); K=R['sheet']['mm_per_pt_fitted']
svg=open(svgf).read(); paths=[]
for m in re.finditer(r'<path ([^>]*?)/>',svg):
    a=m.group(1)
    if 'stroke="' not in a: continue
    sw=float(re.search(r'stroke-width="([\d.]+)"',a).group(1))
    t=re.search(r'transform="matrix\(([^)]*)\)"',a); M=[float(x) for x in t.group(1).split(',')] if t else [1,0,0,1,0,0]
    dd=re.search(r' d="([^"]*)"',a).group(1); curve='C' in dd
    tk=re.findall(r'[MLC]|-?[\d.]+',dd); pts=[];i=0;c=None
    while i<len(tk):
        if tk[i] in 'MLC': c=tk[i];i+=1;continue
        n=3 if c=='C' else 1; x,y=map(float,tk[i+2*(n-1):i+2*n]); i+=2*n; pts.append((M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5]))
    paths.append((sw,pts,curve))
FX0,FX1,FY0,FY1=TT.plan_frame(TT.words(pdf,TT.page_of(svgf)),R,T); IN=lambda xs,ys:FX0<=min(xs) and max(xs)<=FX1 and FY0<=min(ys) and max(ys)<=FY1
# ---- windows: chains of 100 x 500 mm closed rects at 600 mm pitch (measured §19)
mods=[]
for sw,p,cv in paths:
    if len(p)==5 and math.dist(p[0],p[-1])<0.05:
        xs=[q[0] for q in p];ys=[q[1] for q in p];w=max(xs)-min(xs);h=max(ys)-min(ys); a,b=sorted((w*K,h*K))
        if IN(xs,ys) and abs(a-100)<=15 and abs(b-500)<=25: mods.append(('H' if w>h else 'V',(min(xs)+max(xs))/2,(min(ys)+max(ys))/2))
mods=list({(o,round(x,1),round(y,1)) for o,x,y in mods})
log('W-P6 window modules (100x500 mm closed rects)',len(mods))
chains=[]
for o in 'HV':
    ax=collections.defaultdict(list)
    for oo,x,y in mods:
        if oo==o: ax[round(y if o=='H' else x)].append(x if o=='H' else y)   # round() groups an axis
    for k,v in sorted(ax.items()):
        v.sort(); cur=[v[0]]
        for a in v[1:]:
            if abs((a-cur[-1])*K-600)<=60: cur.append(a)
            else: chains.append((o,k,cur)); cur=[a]
        chains.append((o,k,cur))
win=[]
for o,k,c in chains:
    wmm=len(c)*600; cen=(c[0]+c[-1])/2
    cls={600:'W3',1200:'W2',1800:'W1'}.get(wmm,'?%d'%wmm); win.append((cls,o,k,round(cen,1),wmm)); log('W-P6 window chain',cls,'axis',o,k,'modules',len(c),'width_mm',wmm,'centre',round(cen,1))
log('W-P6 windows from geometry',dict(collections.Counter(w[0] for w in win)),'schedule W1 1, W2 4, W3 2 ->',
    'MATCH' if collections.Counter(w[0] for w in win)=={'W1':1,'W2':4,'W3':2} else 'DIFF')
# ---- doors: quarter-circle swing arcs, radius = door width
arcs=[]
for sw,p,cv in paths:
    if cv and len(p)>=2 and math.dist(p[0],p[-1])>3:   # Bezier endpoints only: a quarter circle spans r x r and its chord is r*sqrt2
        xs=[q[0] for q in p];ys=[q[1] for q in p];w=max(xs)-min(xs);h=max(ys)-min(ys)
        if IN(xs,ys) and 15<=max(w,h)<=30 and abs(w-h)<=0.08*max(w,h) and abs(math.dist(p[0],p[-1])-max(w,h)*math.sqrt(2))<=0.08*max(w,h):
            arcs.append((round(max(w,h)*K),round((min(xs)+max(xs))/2,1),round((min(ys)+max(ys))/2,1),sw,len(p)))
arcs=sorted(set(arcs)); log('W-P6 quarter-circle arcs',len(arcs),arcs)
dk=collections.Counter('D1/D2(900)' if abs(a[0]-900)<=60 else 'D3(750)' if abs(a[0]-750)<=60 else '?%d'%a[0] for a in arcs)
log('W-P6 doors from geometry',dict(dk),'schedule 900-wide D1 2 + D2 3 = 5, 750 D3 2 ->','MATCH' if dk.get('D1/D2(900)')==5 and dk.get('D3(750)')==2 else 'DIFF')

# ---- bind each arc to its nearest D tag; radius vs schedule width
bb=subprocess.run(['pdftotext','-f',TT.page_of(svgf),'-l',TT.page_of(svgf),'-bbox',pdf,'-'],capture_output=True,text=True,check=True).stdout
TG=[(w[4],(float(w[0])+float(w[2]))/2,(float(w[1])+float(w[3]))/2) for w in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>',bb) if re.fullmatch(r'D\d',w[4]) and float(w[0])<445]
SZ=R['schedule_sizes_mm']; offs=collections.defaultdict(list); bound=collections.Counter()
# parameter-free one-to-one assignment: closest (tag,arc) pairs first; an arc left over is not a schedule door
pairs=sorted((math.dist((a[1],a[2]),(g[1],g[2])),ti,ai) for ti,g in enumerate(TG) for ai,a in enumerate(arcs))
ut=set();ua=set()
for d,ti,ai in pairs:
    if ti in ut or ai in ua: continue
    ut.add(ti);ua.add(ai); t=TG[ti][0]; r=arcs[ai][0]
    log('W-P6 bind tag',t,'at',(round(TG[ti][1]),round(TG[ti][2])),'<-> arc r',r,'mm at',(arcs[ai][1],arcs[ai][2]),'dist_pt',round(d,1),'schedule_width',SZ[t][0],'offset_mm',SZ[t][0]-r)
    offs[t].append(SZ[t][0]-r); bound[t]+=1
for ai,a in enumerate(arcs):
    if ai not in ua: log('W-P6 UNBOUND arc r',a[0],'mm at',(a[1],a[2]),'sw',a[3],'-> not a schedule door (YELLOW: bathroom fixture swing?)')
log('W-P6 doors bound by geometry',dict(sorted(bound.items())),'schedule D1 2, D2 3, D3 2 ->','MATCH' if dict(bound)=={'D1':2,'D2':3,'D3':2} else 'DIFF')
log('W-P6 radius offset (nominal width - arc radius) per class',{k:sorted(set(v)) for k,v in offs.items()})
