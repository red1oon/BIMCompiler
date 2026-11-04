#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §17 — Witness: W-P4 (G1), W-P7 (R1). Usage: rosetta_verify.py <pdf> <rosetta.json>
import re,sys,json,subprocess
pdf,rj=sys.argv[1:3]; R=json.load(open(rj)); log=lambda *a:print('§PDF',*a,flush=True)
bb=subprocess.run(['pdftotext','-f','1','-l','1','-bbox',pdf,'-'],capture_output=True,text=True,check=True).stdout
W=[(w[4],(float(w[0])+float(w[2]))/2,(float(w[1])+float(w[3]))/2) for w in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>',bb)]
gx,gy=R['grid']['x'],R['grid']['y']
top=[w for w in W if w[0] in gx and w[2]<100]; lef=[w for w in W if w[0] in gy and w[1]<100]
log('G1 labels found x',len(top),'y',len(lef), 'INCONCLUSIVE(vacuous)' if not top or not lef else '')
def fit(pos,dim,name):
    ks=sorted(pos); u=[pos[k][0] for k in ks]; d=[dim[k] for k in ks]
    kmm=(d[-1]-d[0])/(u[-1]-u[0]); res=[round(u[i]+(d[i]-d[0])/kmm-pos[ks[i]][0] if False else (d[i]-d[0])/kmm-(u[i]-u[0]),2) for i in range(len(ks))]
    log('G1',name,'mm/pt',round(kmm,3),'residual_pt',dict(zip(ks,res)),'MAXabs',max(abs(r) for r in res),'PASS' if max(abs(r) for r in res)<=0.6 else 'WRONG')
    return kmm
px={w[0]:(w[1],) for w in top}; py={w[0]:(w[2],) for w in lef}
kx=fit(px,gx,'X'); ky=fit(py,gy,'Y')
log('G1 scale agreement X vs Y',round(kx,3),round(ky,3),'PASS' if abs(kx-ky)/kx<0.005 else 'WRONG')
for r in R['rooms']:
    xs=(gx[r['x'][1]]-gx[r['x'][0]]) if 'x' in r else r['x_mm']; ys=gy[r['y'][1]]-gy[r['y'][0]]
    a=xs*ys/1e6; p=r['printed_sqm']
    log('R1',r['name'],'dx',xs,'dy',ys,'area',round(a,2),'printed',p,'MATCH' if p is not None and abs(a-p)<0.005 else ('NO_PRINTED_READ' if p is None else 'MISMATCH'))
