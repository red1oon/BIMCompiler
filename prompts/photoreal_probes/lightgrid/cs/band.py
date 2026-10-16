# mid-scale (0.5-2 m) floor mottle: on the 8 px floor grid, band = |blur(r=2 cells) - blur(r=8 cells)| / blur(r=8), floor points only,
# same element; reports p50 / p90 of the band for Lu (app) and Lf (final)
import json,sys,statistics as st
COLS=188
def rows(f):
  l=[x for x in open(f,errors='ignore') if x.startswith('§LEAK_GRID')]
  return {r['g'][0]:r for r in json.loads(l[0].split(' ',1)[1])['rows'] if r['k']=='floor'} if l else None
def blur(L,i,rad,key):
  x,y=i%COLS,i//COLS; v=[]
  for dy in range(-rad,rad+1):
    for dx in range(-rad,rad+1):
      q=L.get((y+dy)*COLS+x+dx)
      if q and q['cls']==L[i]['cls'] and 0<=x+dx<COLS: v.append(q[key])
  return (sum(v)/len(v),len(v)) if v else (None,0)
for f in sys.argv[1:]:
  L=rows(f)
  if not L: print(f,'NO GRID'); continue
  out=[f.split('_h')[-1].replace('.log',''),'floorPts',len(L)]
  for key in ('Lu','Lf'):
    b=[]
    for i in L:
      s,ns=blur(L,i,2,key); l,nl=blur(L,i,8,key)
      if ns>=15 and nl>=150: b.append(abs(s-l)/max(1,l))
    out+=[key,'n',len(b),'band p50',round(st.median(b),4),'p90',round(sorted(b)[int(.9*len(b))],4)]
  print(*out)
