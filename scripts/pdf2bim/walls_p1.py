#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §18 — Witness: W-P5 (wall pairs on the verified grid), W-P6b (openings = gaps)
# Usage: walls_p1.py <svg> <rosetta.json> <pdf> <template.json>
import re,sys,json,math,collections,subprocess,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import type_template as TT
svgf,rj,pdf,tj=sys.argv[1:5]; WP=TT.load(tj)['ruler']['wall_pen_pt']; R=json.load(open(rj)); log=lambda *a:print('§PDF',*a,flush=True)
svg=open(svgf).read(); segs=[]
for m in re.finditer(r'<path ([^>]*?)/>',svg):
    a=m.group(1)
    if 'stroke="' not in a: continue
    t=re.search(r'transform="matrix\(([^)]*)\)"',a); M=[float(x) for x in t.group(1).split(',')] if t else [1,0,0,1,0,0]
    if TT.pen(float(re.search(r'stroke-width="([\d.]+)"',a).group(1)),M)!=WP: continue
    tk=re.findall(r'[MLC]|-?[\d.]+',re.search(r' d="([^"]*)"',a).group(1)); pts=[];i=0;c=None
    while i<len(tk):
        if tk[i] in 'MLC': c=tk[i];i+=1;continue
        n=3 if c=='C' else 1; x,y=map(float,tk[i+2*(n-1):i+2*n]); i+=2*n; pts.append((M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5]))
    segs+=list(zip(pts,pts[1:]))
TOL=0.25
def merge(iv):
    iv.sort(); out=[list(iv[0])]
    for a,b in iv[1:]:
        if a<=out[-1][1]+0.02: out[-1][1]=max(out[-1][1],b)
        else: out.append([a,b])
    return out
H=collections.defaultdict(list); V=collections.defaultdict(list)
for p,q in segs:
    if abs(p[1]-q[1])<=TOL and abs(p[0]-q[0])>TOL: H[round((p[1]+q[1])/2,1)].append((min(p[0],q[0]),max(p[0],q[0])))
    elif abs(p[0]-q[0])<=TOL and abs(p[1]-q[1])>TOL: V[round((p[0]+q[0])/2,1)].append((min(p[1],q[1]),max(p[1],q[1])))
lines={('H',k):merge(v) for k,v in H.items()}; lines.update({('V',k):merge(v) for k,v in V.items()})
log('W-P5 sw3 raw segments',len(segs),'distinct lines',len(lines),'(H',len(H),'V',len(V),')')
# pair lines: same orientation, gap 2.0..3.6 pt (~72-130 mm), overlapping extent
K=R['sheet']['mm_per_pt_fitted']; pairs=[]
for o in 'HV':
    ks=sorted(k for (oo,k) in lines if oo==o)
    for i,a in enumerate(ks):
        for b in ks[i+1:]:
            if b-a>3.6: break
            if b-a<2.0: continue
            for s in lines[(o,a)]:
                for t in lines[(o,b)]:
                    lo,hi=max(s[0],t[0]),min(s[1],t[1])
                    if hi-lo>=5: pairs.append((o,round((a+b)/2,2),round(b-a,2),round(lo,1),round(hi,1)))
pairs.sort()
th=collections.Counter(round(p[2]*K/10)*10 for p in pairs)
log('W-P5 wall pairs',len(pairs),'thickness_mm histogram',dict(sorted(th.items())),'total_length_m',round(sum(p[4]-p[3] for p in pairs)*K/1000,2))
# grid snap using label text positions
W=TT.words(pdf,TT.page_of(svgf)); gx=R['grid']['x']; gy=R['grid']['y']; x0=TT.top_row(W,gx)['A'][1]; y0=TT.left_col(W,gy)['5'][2]
GX={k:x0+v/K for k,v in gx.items()}; GY={k:y0+v/K for k,v in gy.items()}
rows=[]
for o,c,g,lo,hi in pairs:
    ax=GX if o=='V' else GY
    k,pos=min(ax.items(),key=lambda kv:abs(kv[1]-c)); rows.append((o,k,round(c-pos,2),g,lo,hi))
off=collections.defaultdict(list)
for o,k,d,g,lo,hi in rows: off[(o,k)].append(d)
for key in sorted(off): log('W-P5 axis',key,'pairs',len(off[key]),'centre_offset_pt',sorted(set(off[key])))
on=sum(1 for r in rows if abs(r[2])<=1.5); log('W-P5 pairs within 1.5pt of a grid axis',on,'of',len(rows))
# openings: gaps along a wall axis between merged pair extents (>= 300 mm)
gaps=[]
byax=collections.defaultdict(list)
for o,k,d,g,lo,hi in rows: byax[(o,k)].append((lo,hi))
for key,iv in byax.items():
    m=merge(sorted(iv))
    for (a,b),(c,d) in zip(m,m[1:]):
        if (c-a-(b-a))*0+ (c-b)*K>=300: gaps.append((key,round(b,1),round(c,1),round((c-b)*K)))
log('W-P6b opening candidates (gaps >=300 mm in wall pairs)',len(gaps)); [log('W-P6b gap',g) for g in sorted(gaps)]
log('W-P6b expected openings from schedule: doors 7 + windows 7 (columns excluded) = 14; found',len(gaps),'NOT EQUAL: see classes' if len(gaps)!=14 else 'EQUAL')
