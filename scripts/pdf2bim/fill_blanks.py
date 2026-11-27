#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §35 — a weak-sighted reader: the template says what to expect and where, this reads K, the grid dimensions and the schedule sizes from the sheets and compares. Writes the dictionary every later stage reads. Witness: witness_variant.sh.
# Usage: fill_blanks.py <svg dir> <rosetta.json> <template.json> <pdf> <out rosetta.effective.json> <out template.effective.json>
import re,sys,json,math,collections,os,statistics,copy,subprocess
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import type_template as TT
sd,rj,tj,pdf,outj,outt=sys.argv[1:7]; R=json.load(open(rj)); T=TT.load(tj); RU=T['ruler']; S=T['sheets']; log=lambda *a:print('§FILL',*a,flush=True); gx,gy=R['grid']['x'],R['grid']['y']
W=TT.words(pdf,S['plan']); top=TT.top_row(W,gx); left=TT.left_col(W,gy)
if len(top)!=len(gx) or len(left)!=len(gy): log('VACUOUS grid labels read x',sorted(top),'y',sorted(left)); sys.exit(1)
sc=[int(m.group(1)) for i,w in enumerate(W) if w[0].lower()=='scale' and i+1<len(W) for m in [re.fullmatch(r'1:(\d+)',W[i+1][0])] if m]; PS=collections.Counter(sc).most_common(1)[0][0] if sc else RU['printed_scale']   # §40: the sheet's own printed scale
KP=25.4/72*PS; log('printed scale 1:%d%s means %.2f mm/pt; labels x %d y %d'%(PS,'' if sc else ' (template: none printed)',KP,len(top),len(left)))
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
unit=RU['grid_module_mm']
if pitch: K0=RU['window_module_pitch_mm']/statistics.median(pitch)
else: K0=KP; log('no window modules on this plan: the scale is the printed one, %.2f'%KP)   # §40: the modules were one drafter's ruler
span=max(xs)-min(xs); over=round(span*K0/unit)*unit; K1=round(over/span,2)
log('window modules',len(mods),'pitch pairs',len(pitch),'median pitch pt',round(statistics.median(pitch),2) if pitch else None,'K0',round(K0,2),'overall',over,'K',K1)
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
# ---- §40: the drafter's style on this sheet, in mm. Later stages use what is read here
SS=RU['style_search']; PL=TT.stroked_paths(os.path.join(sd,'p%s.svg'%S['plan'])); fm=RU['plan_frame_margin_mm']/K; FR=(min(xs)-fm,max(xs)+fm,min(ys)-fm,max(ys)+fm); seg={}
for q in PL:
    for a_,b_ in zip(q['pts'],q['pts'][1:]):
        if not(FR[0]<=min(a_[0],b_[0]) and max(a_[0],b_[0])<=FR[1] and FR[2]<=min(a_[1],b_[1]) and max(a_[1],b_[1])<=FR[3]): continue
        o_='H' if abs(a_[1]-b_[1])<=.05 else ('V' if abs(a_[0]-b_[0])<=.05 else None)
        if o_ and math.dist(a_,b_)*K>=SS['long_line_mm']: seg.setdefault((o_,q['pen']),[]).append((round(a_[1] if o_=='H' else a_[0],2),min(a_[0],b_[0]) if o_=='H' else min(a_[1],b_[1]),max(a_[0],b_[0]) if o_=='H' else max(a_[1],b_[1])))
byp=collections.Counter(); gaps=collections.defaultdict(collections.Counter)
for (o_,pn),L in seg.items():
    L=sorted(L)
    for i,u in enumerate(L):
        for v in L[i+1:]:
            g=(v[0]-u[0])*K
            if g>SS['wall_pair_mm'][1]: break
            ov=min(u[2],v[2])-max(u[1],v[1])
            mid=(u[0]+v[0])/2; axes=[x0+vv/K for vv in ngx.values()] if o_=='V' else [y0+vv/K for vv in ngy.values()]
            if g>=SS['wall_pair_mm'][0] and ov*K>=SS['long_line_mm'] and min(abs(mid-q_) for q_ in axes)*K<=SS['wall_on_axis_mm']: byp[pn]+=ov*K; gaps[pn][round(g/10)*10]+=ov*K   # the preset's walls stand on the grid axes: other double lines (drains, roof edges) do not
if byp:
    pw=byp.most_common(1)[0][0]; tw=gaps[pw].most_common(1)[0][0]; RU['wall_pen_mm']=round(pw*K,2); RU['wall_half_mm']=tw/2; RU['wall_thick_mm']=tw; log('style: wall pen %.3f pt = %.2f mm, thickness %s, from %d m of paired long lines; pens %s'%(pw,pw*K,tw,byp[pw]/1000,{k:round(v/1000) for k,v in byp.items()}))
else: RU['wall_half_mm']=50; RU['wall_thick_mm']=100; log('FINDING no paired long lines read: the template wall stays')
cir=[]
for q in PL:
    if len(q['pts'])>=4 and math.dist(q['pts'][0],q['pts'][-1])<.3 and abs((q['x1']-q['x0'])-(q['y1']-q['y0']))<.3: cir.append(((q['x0']+q['x1'])/2,(q['y0']+q['y1'])/2,(q['x1']-q['x0'])/2))
ins=[c[2]*K for c in cir for w in list(top.values())+list(left.values()) if math.hypot(c[0]-w[1],c[1]-w[2])<=c[2] and SS['bubble_radius_mm'][0]<=c[2]*K<=SS['bubble_radius_mm'][1]]
if ins:
    rb=statistics.median(ins); RU['bubble_radius_mm']=[round(rb*.9),round(rb*1.1)]; log('style: grid bubble radius %.0f mm from %d of them'%(rb,len(ins)))
else: log('FINDING no circle holds a grid label: the template bubble stays')
sm=[c[2]*K for c in cir for w in W if w[0]=='A' and math.hypot(c[0]-w[1],c[1]-w[2])<=c[2] and w not in top.values()]
if sm: rm_=statistics.median(sm); RU['section_marker_radius_mm']=[round(rm_*.9),round(rm_*1.1)]; log('style: section marker radius %.0f mm from %d'%(rm_,len(sm)))
apen=collections.Counter(); a0_,a1_=SS['arc_mm']
for q in PL:
    if len(q['pts'])>=2 and math.dist(q['pts'][0],q['pts'][-1])>3:
        w_,h_=q['x1']-q['x0'],q['y1']-q['y0']; r_=max(w_,h_)
        if a0_<=r_*K<=a1_ and abs(w_-h_)<=.08*r_ and abs(math.dist(q['pts'][0],q['pts'][-1])-r_*math.sqrt(2))<=.08*r_ and FR[0]<=q['x0'] and q['x1']<=FR[1] and FR[2]<=q['y0'] and q['y1']<=FR[3]: apen[q['pen']]+=1
if apen: pd_=apen.most_common(1)[0][0]; RU['door_arc']['pen_mm']=[round(pd_*K*.6,1),round(pd_*K*1.4,1)]; log('style: door arc pen %.3f pt from %s'%(pd_,dict(apen)))
wch,nm_,nf_=TT.window_symbols(PL,T,K,FR,RU['wall_thick_mm']); log('style: window symbols',nm_,'modules',nf_,'frames ->',len(wch),'chains')
T['door_system']['depth_mm']=T['window_system']['depth_mm']=RU['wall_thick_mm']   # §40: a family is as deep as this drawing's wall
json.dump(T,open(outt,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
# ---- the dictionary every later stage reads
E=copy.deepcopy(R); E['sheet']['mm_per_pt_fitted']=K; E['grid']['x']=ngx; E['grid']['y']=ngy; E['grid']['overall_mm']=[max(ngx.values()),max(ngy.values())]; E['schedule_sizes_mm'].update(ns)
for k,v in ns.items():   # §39: the family follows the size the sheet states
    E['library_binding'][k]=dict(E['library_binding'][k],family='LCSSU_%s_%dx%d%s'%(k,v[0],v[1],'' if RU['wall_thick_mm']==100 else 'd%d'%RU['wall_thick_mm']),lib_size=v)
json.dump(E,open(outj,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
log('RESULT K',K,'x',ngx,'y',ngy,'wrote',outj)
