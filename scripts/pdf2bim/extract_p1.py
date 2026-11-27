#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §2 — Witness: W-P1, W-P2, W-P3
# Usage: extract_p1.py <pdf> <page> <outdir>   (stdlib + poppler only)
import re,sys,math,subprocess,collections,os
pdf,page,out=sys.argv[1],sys.argv[2],sys.argv[3]; os.makedirs(out,exist_ok=True)
def log(*a): print('§PDF',*a,flush=True)
svgf=f'{out}/p{page}.svg'
subprocess.run(['pdftocairo','-svg','-f',page,'-l',page,pdf,svgf],check=True)
# ---- W-P1 text
bb=subprocess.run(['pdftotext','-f',page,'-l',page,'-bbox',pdf,'-'],capture_output=True,text=True,check=True).stdout
words=re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>',bb)
plain=subprocess.run(['pdftotext','-f',page,'-l',page,pdf,'-'],capture_output=True,text=True,check=True).stdout.split()
cb=collections.Counter(''.join(w[4] for w in words)); cp=collections.Counter(''.join(plain))
# word COUNT differs legitimately: letter-spaced title text (LEMBAGA ARKITEK MALAYSIA) is 1 char/word in -bbox mode (measured 2026-11-03)
v='INCONCLUSIVE(VACUOUS 0 words)' if not words else ('PASS' if cb==cp else 'WRONG chars_diff=%s'%dict((cb-cp)+(cp-cb)))
log('W-P1 words_bbox',len(words),'words_plain',len(plain),'chars',sum(cb.values()),sum(cp.values()),v)
# ---- parse segments
svg=open(svgf).read(); segs=[]
for m in re.finditer(r'<path ([^>]*?)/>',svg):
    a=m.group(1)
    if 'stroke="' not in a: continue
    sw=float(re.search(r'stroke-width="([\d.]+)"',a).group(1))
    t=re.search(r'transform="matrix\(([^)]*)\)"',a); M=[float(x) for x in t.group(1).split(',')] if t else [1,0,0,1,0,0]
    toks=re.findall(r'[MLC]|-?[\d.]+',re.search(r' d="([^"]*)"',a).group(1)); pts=[];i=0;c=None
    while i<len(toks):
        if toks[i] in 'MLC': c=toks[i];i+=1;continue
        n=3 if c=='C' else 1; x,y=map(float,toks[i+2*(n-1):i+2*n]); i+=2*n
        pts.append((M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5]))
    for p,q in zip(pts,pts[1:]): segs.append((sw,p,q))
L=lambda s:math.dist(s[1],s[2])
tot=sum(map(L,segs)); log('PARSE segments',len(segs),'ink_pt',round(tot,1))
# ---- W-P2 collinear merge (H/V only; tol = 0.25pt, gap tol = 0.02pt (0.5 bridged +821pt ink, W-P2 WRONG) — both logged)
TOL,GAP=0.25,0.02
buckets=collections.defaultdict(list); rest=[]
for s in segs:
    (x1,y1),(x2,y2)=s[1],s[2]
    if abs(y1-y2)<=TOL and abs(x1-x2)>TOL: buckets[(s[0],'H',round((y1+y2)/2/TOL))].append((min(x1,x2),max(x1,x2),(y1+y2)/2))
    elif abs(x1-x2)<=TOL and abs(y1-y2)>TOL: buckets[(s[0],'V',round((x1+x2)/2/TOL))].append((min(y1,y2),max(y1,y2),(x1+x2)/2))
    else: rest.append(s)
merged=[]; before_union=0
for (sw,o,_),iv in buckets.items():
    iv.sort(); cur=list(iv[0][:2]); pos=iv[0][2]; n=1
    for a,b,p in iv[1:]:
        if a<=cur[1]+GAP: cur[1]=max(cur[1],b)
        else: merged.append((sw,o,cur[0],cur[1],pos)); cur=[a,b]; pos=p
    merged.append((sw,o,cur[0],cur[1],pos))
def union(iv):
    t=0;e=None
    for a,b,_ in sorted(iv):
        if e is None or a>e: t+=b-a;e=b
        elif b>e: t+=b-e;e=b
    return t
hv_union=sum(union(iv) for iv in buckets.values())
hv_before=sum(b-a for iv in buckets.values() for a,b,_ in iv); hv_after=sum(m[3]-m[2] for m in merged)
nhv=sum(len(v) for v in buckets.values())
log('W-P2 hv_segments',nhv,'->',len(merged),'diag_untouched',len(rest),
    'len_before',round(hv_before,1),'len_after',round(hv_after,1),
    'union_before',round(hv_union,1),'NO-OP' if len(merged)==nhv else ('PASS' if hv_after<=hv_union*1.001+0 else 'WRONG(bridging added %.1fpt ink)'%(hv_after-hv_union)))
log('W-P2 note: before-sum counts overlaps twice; conservation is judged against union_before (growth >0.1% = gap bridging invented ink)')
log('W-P2 long_hv>=30pt',sum(1 for m in merged if m[3]-m[2]>=30),'was',sum(1 for iv in buckets.values() for a,b,_ in iv if b-a>=30))
# ---- W-P3 hatch regions: micro-segment ink density on CELL grid, Otsu threshold
CELL=10; dens=collections.Counter()
for s in segs:
    if L(s)<3: dens[(int(s[1][0]//CELL),int(s[1][1]//CELL))]+=L(s)
vals=sorted(dens.values()); 
def otsu(v):
    h=collections.Counter(int(x) for x in v); best=(0,0); T=sum(h.values()); sm=sum(k*c for k,c in h.items()); wb=sb=0
    for t in range(0,max(h)+1):
        wb+=h.get(t,0); 
        if not wb or wb==T: continue
        sb+=t*h.get(t,0); mb=sb/wb; mf=(sm-sb)/(T-wb); var=wb*(T-wb)*(mb-mf)**2
        if var>best[0]: best=(var,t)
    return best[1]
thr=otsu(vals) if vals else 0
hot={c for c,d in dens.items() if d>thr}
seen=set(); regions=[]
for c in hot:
    if c in seen: continue
    st=[c]; seen.add(c); r=[]
    while st:
        x,y=st.pop(); r.append((x,y))
        for d in ((1,0),(-1,0),(0,1),(0,-1)):
            n=(x+d[0],y+d[1])
            if n in hot and n not in seen: seen.add(n); st.append(n)
    regions.append(r)
regions.sort(key=len,reverse=True)
inhot=lambda s:(int(s[1][0]//CELL),int(s[1][1]//CELL)) in hot
rem=sum(L(s) for s in segs if L(s)<3 and inhot(s))
log('W-P3 cell',CELL,'pt otsu_thr',thr,'hot_cells',len(hot),'regions',len(regions),
    'removed_ink_pt',round(rem,1),'pct',round(100*rem/tot,1))
for r in regions[:12]:
    xs=[c[0]*CELL for c in r]; ys=[c[1]*CELL for c in r]
    log('W-P3 region cells',len(r),'bbox',(min(xs),min(ys),max(xs)+CELL,max(ys)+CELL))
log('W-P3', 'INCONCLUSIVE(no region)' if not regions else 'MEASURED (judge regions vs known wall hatch only via W-P5/W-P7)')
# ---- W-P4 grid: axis labels (single A-E letter / 1-5 digit words) -> long merged H/V line through the label
lab=[(w[4],(float(w[0])+float(w[2]))/2,(float(w[1])+float(w[3]))/2) for w in words if re.fullmatch(r'[A-E1-5]',w[4])]
log('W-P4 single-char axis-like labels',len(lab),sorted((l[0],round(l[1]),round(l[2])) for l in lab))
LMIN=30; TOLX=4
def cands(l):
    t,cx,cy=l
    if t.isalpha(): return [m for m in merged if m[1]=='V' and abs(m[4]-cx)<=TOLX and m[3]-m[2]>=LMIN]
    return [m for m in merged if m[1]=='H' and abs(m[4]-cy)<=TOLX and m[3]-m[2]>=LMIN]
hits={}
for l in sorted(lab):
    cs=cands(l); best=max(cs,key=lambda m:m[3]-m[2]) if cs else None
    log('W-P4 label',l[0],'at',(round(l[1],1),round(l[2],1)),'cands',len(cs),'best',None if not best else (best[0],best[1],round(best[4],2),round(best[2],1),round(best[3],1)))
# ---- W-P4b grid from stroke-width class 3 (measured: the labelled A/E and 2/5 axes are sw=3)
MM_PT=25.4/72*100      # 1:100 sheet scale printed on the page, A4 pt -> mm
g=[m for m in merged if m[0]==3.0 and m[3]-m[2]>=LMIN]
gv=sorted(set(round(m[4],1) for m in g if m[1]=='V')); gh=sorted(set(round(m[4],1) for m in g if m[1]=='H'))
log('W-P4b sw3 long lines V_x',gv,'H_y',gh)
def spac(v,name):
    if len(v)<2: log('W-P4b',name,'INCONCLUSIVE(<2 lines)'); return
    d=[round((b-a)*MM_PT) for a,b in zip(v,v[1:])]
    log('W-P4b',name,'spacings_mm@1:100',d,'sum',sum(d),'overall',round((v[-1]-v[0])*MM_PT),'self_consistent',sum(d)==round((v[-1]-v[0])*MM_PT) or abs(sum(d)-round((v[-1]-v[0])*MM_PT))<=len(d))
spac(gv,'X(A..E)'); spac(gh,'Y(1..5)')
# bind labels: each letter/number label (top/left bubble) -> nearest sw3 line within 6pt along its axis
for t,cx,cy in sorted(lab):
    if t.isalpha() and cy<100: ax=gv; c=cx
    elif t.isdigit() and cx<100: ax=gh; c=cy
    else: continue
    n=min(ax,key=lambda a:abs(a-c)) if ax else None
    log('W-P4b bind',t,'label',round(c,1),'nearest_sw3_line',n,'offset',None if n is None else round(abs(n-c),1),'BOUND' if n is not None and abs(n-c)<=6 else 'UNBOUND')
