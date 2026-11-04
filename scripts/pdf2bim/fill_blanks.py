#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §35 — a weak-sighted reader: the template says what to expect and where, this reads K, the grid dimensions and the schedule sizes from the sheets and compares. Writes the dictionary every later stage reads. Witness: witness_variant.sh.
# Usage: fill_blanks.py <svg dir> <rosetta.json> <template.json> <pdf> <out rosetta.effective.json>
import re,sys,json,math,collections,os,statistics,copy,subprocess
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import type_template as TT
sd,rj,tj,pdf,outj=sys.argv[1:6]; R=json.load(open(rj)); T=TT.load(tj); RU=T['ruler']; S=T['sheets']; log=lambda *a:print('§FILL',*a,flush=True); gx,gy=R['grid']['x'],R['grid']['y']
W=TT.words(pdf,S['plan']); top=TT.top_row(W,gx); left=TT.left_col(W,gy)
if len(top)!=len(gx) or len(left)!=len(gy): log('VACUOUS grid labels read x',sorted(top),'y',sorted(left)); sys.exit(1)
KP=25.4/72*RU['printed_scale']; log('printed scale 1:%d means %.2f mm/pt; labels x %d y %d'%(RU['printed_scale'],KP,len(top),len(left)))
xs=sorted(w[1] for w in top.values()); ys=sorted(w[2] for w in left.values()); m=RU['plan_frame_margin_mm']/KP
# ---- the ruler: closed window modules, 1:5, at the module pitch
mods=[]; ms,ml=RU['window_module_mm']; sv=open(os.path.join(sd,'p%s.svg'%S['plan'])).read()
for mt in re.finditer(r'<path ([^>]*?)/>',sv):
    a=mt.group(1)
    if 'stroke="' not in a or ' d="' not in a: continue
    t=re.search(r'transform="matrix\(([^)]*)\)"',a); M=[float(x) for x in t.group(1).split(',')] if t else [1,0,0,1,0,0]
    dd=re.search(r' d="([^"]*)"',a).group(1)
    if 'C' in dd: continue
    n=[float(v) for v in re.findall(r'-?[\d.]+',dd)]; p=[(M[0]*n[i]+M[2]*n[i+1]+M[4],M[1]*n[i]+M[3]*n[i+1]+M[5]) for i in range(0,len(n)-1,2)]
    if len(p)!=5 or math.dist(p[0],p[-1])>=.05: continue
    X=[q[0] for q in p];Y=[q[1] for q in p]; w,h=max(X)-min(X),max(Y)-min(Y); a_,b_=sorted((w*KP,h*KP))
    if min(xs)-m<=min(X) and max(X)<=max(xs)+m and min(ys)-m<=min(Y) and max(Y)<=max(ys)+m and abs(a_-ms)<=.25*ms and abs(b_-ml)<=.25*ml: mods.append(('H' if w>h else 'V',round((min(X)+max(X))/2,1),round((min(Y)+max(Y))/2,1)))
mods=sorted(set(mods)); pitch=[]; g=collections.defaultdict(list)
for o,x,y in mods: g[(o,round(y if o=='H' else x))].append(x if o=='H' else y)
want=RU['window_module_pitch_mm']/KP
for v in g.values():
    v.sort(); pitch+=[b-a for a,b in zip(v,v[1:]) if abs(b-a-want)<=.3*want]
if not pitch: log('VACUOUS no window module pairs: modules',len(mods),'the scale cannot be read'); sys.exit(1)
K0=RU['window_module_pitch_mm']/statistics.median(pitch); unit=RU['grid_module_mm']
span=max(xs)-min(xs); over=round(span*K0/unit)*unit; K1=round(over/span,2)
log('window modules',len(mods),'pitch pairs',len(pitch),'median pitch pt',round(statistics.median(pitch),2),'K0',round(K0,2),'overall',over,'K',K1)
kb=dict(nominal=R['sheet']['mm_per_pt_fitted'],tol_mm=.05)
if abs(K1-kb['nominal'])<=kb['tol_mm']: K=kb['nominal']; print('§INFER K READ value',K,'measured',K1,'nominal',kb['nominal'],'tol',kb['tol_mm'],'| window modules + overall span',flush=True)
else: K=K1; print('§INFER K FINDING value',K,'measured',K1,'nominal',kb['nominal'],'tol',kb['tol_mm'],'| window modules + overall span',flush=True)
# ---- the grid: label distance x K, compared with what was expected
tol=RU['grid_tol_mm']; ngx={}; ngy={}
x0=min(w[1] for w in top.values()); y0=min(w[2] for w in left.values())
for k,nom in gx.items(): ngx[k]=TT.decide('grid_x_'+k,(top[k][1]-x0)*K,dict(nominal=nom,tol_mm=tol),'label distance x K',module=unit)['value']
for k,nom in gy.items(): ngy[k]=TT.decide('grid_y_'+k,(left[k][2]-y0)*K,dict(nominal=nom,tol_mm=tol),'label distance x K',module=unit)['value']
if [k for k,_ in sorted(ngx.items(),key=lambda q:q[1])]!=list(gx) or [k for k,_ in sorted(ngy.items(),key=lambda q:q[1])]!=list(gy): log('WRONG the labels are not in the expected order: x',ngx,'y',ngy); sys.exit(1)
# ---- the schedule: each SIZE row reads left to right under its REFERENCES row
Wp=TT.words(pdf,S['schedule']); sizes={}; seen=set(); RF=[w for w in Wp if re.fullmatch(r'[DW]\d',w[0])]
for w0 in RF:
    refs=sorted((w for w in RF if abs(w[2]-w0[2])<=2),key=lambda w:w[1])
    if len(refs)<2 or refs[0] in seen: continue
    seen.add(refs[0]); yr=refs[0][2]; below=sorted((w for w in Wp if w[0]=='SIZE' and w[2]>yr),key=lambda w:w[2])
    if not below: continue
    txt=' '.join(w[0] for w in sorted((w for w in Wp if abs(w[2]-below[0][2])<=3),key=lambda w:w[1])); f=re.findall(r'(\d{3,4})\s*MM\s*X\s*(\d{3,4})\s*MM',txt,re.I)
    if len(f)==len(refs):
        for r_,(a,b) in zip(refs,f): sizes[r_[0]]=[int(a),int(b)]
    else: log('FINDING schedule row',txt[:80],'sizes',len(f),'references',len(refs))
ns={}; SZ=R['schedule_sizes_mm']
for k in [q for q in SZ if re.fullmatch(r'[DW]\d',q)]:
    if k not in sizes: ns[k]=SZ[k]; print('§INFER schedule_%s DEFAULT value'%k,SZ[k],'measured None nominal',SZ[k],'tol 0 | not on the sheet',flush=True); continue
    st='READ' if sizes[k]==SZ[k] else 'FINDING'; ns[k]=sizes[k]; print('§INFER schedule_%s %s value'%(k,st),sizes[k],'measured',sizes[k],'nominal',SZ[k],'tol 0 | p%s SIZE row'%S['schedule'],flush=True)
# ---- the dictionary every later stage reads
E=copy.deepcopy(R); E['sheet']['mm_per_pt_fitted']=K; E['grid']['x']=ngx; E['grid']['y']=ngy; E['grid']['overall_mm']=[max(ngx.values()),max(ngy.values())]; E['schedule_sizes_mm'].update(ns)
json.dump(E,open(outj,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
log('RESULT K',K,'x',ngx,'y',ngy,'wrote',outj)
