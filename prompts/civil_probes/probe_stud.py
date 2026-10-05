import sqlite3, numpy as np, collections
db=sqlite3.connect('/home/red1/Downloads/JALAN JELAPANG IFC/JELAPANG_AFTER.db')
P=np.array(db.execute("select t.center_x,t.center_y from element_psets p join element_transforms t using(guid) where p.name='01_Component_Name' and p.value='ROAD STUD'").fetchall())

D=np.hypot(P[:,None,0]-P[None,:,0],P[:,None,1]-P[None,:,1]); i=np.argsort(D,1)[:,:5]; d=np.take_along_axis(D,i,1)
print('n',len(P)); 
for k in range(1,5): print('nn%d'%k, np.percentile(d[:,k],[5,25,50,75,95]).round(2))
h=collections.Counter(np.round(d[:,1]).astype(int)); print(sorted(h.items())[:40])
# components at link 1.5 m
n=len(P); par=list(range(n))
def f(a):
    while par[a]!=a: par[a]=par[par[a]]; a=par[a]
    return a
for a in range(n):
    for b in np.where(D[a]<1.5)[0]:
        ra,rb=f(a),f(b)
        if ra!=rb: par[ra]=rb
comp=collections.defaultdict(list)
for a in range(n): comp[f(a)].append(a)
sz=sorted(len(v) for v in comp.values()); print('components',len(comp),'sizes',collections.Counter(sz))
# gap between components: nearest distance from each comp to another
cs=list(comp.values()); gaps=[]
for k,c in enumerate(cs):
    m=np.ones(n,bool); m[c]=False
    gaps.append(D[np.ix_(c,np.where(m)[0])].min())
print('gap to next group pct', np.percentile(gaps,[0,25,50,75,100]).round(1))
for c in cs[:5]:
    q=P[c]; print(len(c), 'extent', (q.max(0)-q.min(0)).round(1))
