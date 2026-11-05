import re,sys,collections
svg=open(sys.argv[1]).read(); paths=[]
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
    paths.append((sw,pts))
small=[]
for sw,p in paths:
    xs=[q[0] for q in p];ys=[q[1] for q in p];w=max(xs)-min(xs);h=max(ys)-min(ys)
    if 1.5<=max(w,h)<=9 and len(p)>=4: small.append((sw,p,min(xs),min(ys),w,h))
print('small multi-point paths',len(small))
sig=collections.Counter()
for sw,p,x0,y0,w,h in small:
    sig[(sw,tuple((round(q[0]-x0,1),round(q[1]-y0,1)) for q in p))]+=1
print('distinct',len(sig),'top multiplicities',[c for _,c in sig.most_common(25)])
# where are they
print('by sw',collections.Counter(s[0] for s in small))
# cluster small paths into char rows: group by proximity (gap<=1.2pt) union-find on bboxes
n=len(small); par=list(range(n))
def f(i):
    while par[i]!=i: par[i]=par[par[i]]; i=par[i]
    return i
cells=collections.defaultdict(list)
for i,(sw,p,x0,y0,w,h) in enumerate(small): cells[(int(x0//6),int(y0//6))].append(i)
for (cx,cy),ids in cells.items():
    for dx in (-1,0,1):
        for dy in (-1,0,1):
            for i in ids:
                for j in cells.get((cx+dx,cy+dy),[]):
                    if i<j:
                        a=small[i];b=small[j]
                        if a[2]-1.2<=b[2]+b[4] and b[2]-1.2<=a[2]+a[4] and a[3]-1.2<=b[3]+b[5] and b[3]-1.2<=a[3]+a[5]: par[f(i)]=f(j)
cl=collections.defaultdict(list)
for i in range(n): cl[f(i)].append(i)
rows=[]
for ids in cl.values():
    if len(ids)<3: continue
    x0=min(small[i][2] for i in ids);x1=max(small[i][2]+small[i][4] for i in ids)
    y0=min(small[i][3] for i in ids);y1=max(small[i][3]+small[i][5] for i in ids)
    if 2<=(y1-y0)<=7 and (x1-x0)>=6: rows.append((round(x0),round(y0),round(x1-x0,1),round(y1-y0,1),len(ids)))
print('char-row-like clusters',len(rows)); print(sorted(rows,key=lambda r:(r[1],r[0]))[:60])
