import json,sys,statistics as st
COLS=157
def rows(f):
  l=[x for x in open(f,errors='ignore') if x.startswith('§LEAK_GRID')]
  if not l: return None
  return {r['g'][0]:r for r in json.loads(l[0].split(' ',1)[1])['rows'] if r['k']=='floor'}
def mot(L,key):
  rel=[]
  for i,r in L.items():
    x,y=i%COLS,i//COLS; nb=[]
    for dy in range(-2,3):
      for dx in range(-2,3):
        if dx==0 and dy==0: continue
        q=L.get((y+dy)*COLS+x+dx)
        if q and q['cls']==r['cls'] and q['zone']==r['zone'] and 0<=x+dx<COLS: nb.append(q[key])
    if len(nb)>=16:
      m=sum(nb)/len(nb); rel.append(abs(r[key]-m)/max(1,m))
  return rel
for f in sys.argv[1:]:
  L=rows(f)
  if not L: print(f.split('/')[-1],'NO GRID'); continue
  out=[f.split('_m')[-1].replace('.log',''),'floorPts',len(L),'Lu median',st.median([r['Lu'] for r in L.values()])]
  for key in ('Lu','Lf'):
    rel=mot(L,key); out+=[key+' n',len(rel),'relResid p50',round(st.median(rel),4),'p90',round(sorted(rel)[int(.9*len(rel))],4),'>0.05',sum(1 for x in rel if x>0.05)]
  print(*out)
