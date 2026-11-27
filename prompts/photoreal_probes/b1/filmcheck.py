import re,sys,statistics as st
# row 2 tolerance 1.1e-3 = the 3-decimal print precision of EV in the log
S='/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad/'
def lines(f):
    try: return [re.sub(r'^\[con\] ','',re.sub(r'^\S+ \+\s*[\d.]+s ','',l.rstrip('\n'))) for l in open(S+f, errors='replace')]
    except FileNotFoundError: return None
A=lines('film_law_new.log'); B=lines('film_law_base.log'); C=lines('film_law_ctl.log')
def fe(L): 
    out=[]
    for l in L or []:
        m=re.search(r'§FILM_EXPOSURE f=(\d+) (.*)',l)
        if m:
            d={'f':int(m.group(1))}; 
            for k,v in re.findall(r'(\w+)=(\[[^\]]*\]|\S+)',m.group(2)): d[k]=v
            out.append(d)
    return out
R={}
a=fe(A); vac=sum(1 for d in a if 'VACUOUS' in str(d)); R[1]=('PASS' if len(a)==90 and vac<=9 else 'FAIL')+' lines=%d vacuous=%d'%(len(a),vac)
ev=[float(d['EV']) for d in a]; tg=[float(d['targetEV']) for d in a]; cap=[d.get('capped') for d in a]
steps=[ev[i]-ev[i-1] for i in range(1,len(ev))]; bad=[i for i,s in enumerate(steps,1) if s>3/15+1.1e-3 or s< -1/15-1.1e-3]; ncap=sum(1 for c in cap if c and c!='-')
R[2]=('FAIL' if bad else ('INCONCLUSIVE (never capped)' if ncap==0 else 'PASS'))+' maxUp=%.4f maxDown=%.4f capped=%d (up %d down %d) violations=%s'%(max(steps),min(steps),ncap,cap.count('up'),cap.count('down'),bad[:5])
ov=[i for i in range(1,len(ev)) if (ev[i]-ev[i-1])*(ev[i]-tg[i])>1e-9 and abs(ev[i]-tg[i])>1e-9 and ((ev[i]-ev[i-1])>0) == (ev[i]>tg[i])]
R[3]=('PASS' if not ov else 'FAIL')+' overshoot frames=%s'%ov[:5]
firsts=[d['f'] for d in a if d.get('first')=='1']; R[4]=('PASS' if firsts==[0] and ev[0]==tg[0] else 'FAIL')+' first=1 at %s, EV0=%s target0=%s'%(firsts,ev[0],tg[0])
lh=set(re.search(r'lawHash=(\w+)',l).group(1) for l in A if '§LIGHT_LAW tag=film' in l); R[6]='film lawHash=%s'%sorted(lh)
par=[l for l in A if '§FILM_PARITY on' in l]; rest=[l for l in A if '§FILM_FILL_RESTORE ambient' in l]; chk=[l for l in A if '§FILM_FILL_CHECK' in l]; drift=[l for l in chk if 'drift=none' not in l]
amb=set(d.get('ambient') for d in a); hemi=set(d.get('hemi') for d in a); sb=[l[:160] for l in A if '§STILL_BASE' in l][:1]
cr=[l for l in (C or []) if '§FILM_FILL_RESTORE' in l or 'fill=restore' in l]
R[7]=('PASS' if par and not rest and chk and not drift and amb=={'0.000'} else 'FAIL')+' parity=%s restoreLines=%d fillCheck=%d drift=%d ambient=%s hemi=%s stillBase=%s | C restore lines=%d'%(par[:1],len(rest),len(chk),len(drift),amb,hemi,sb,len(cr))
camA=[l[:80] for l in A if '§CAM_LIGHT' in l]; camB=[l[:80] for l in (B or []) if '§CAM_LIGHT' in l]; camC=[l[:80] for l in (C or []) if '§CAM_LIGHT' in l]; cl=set(d.get('camLight') for d in a)
R[8]='A %s camLight=%s | B %s | C %s'%(sorted(set(camA)),cl,sorted(set(camB)),sorted(set(camC)))
OV=re.compile(r'^(§CLASH_\w*|§MEASURE_\w*|§FINDINGS_\w*|§HUD_\w*|§CPE_REVEAL\w*|§CPE_TAIL\w*|§LOADPATH_HUD\w*|§ROOM_TITLE\w*|§CAPTION\w*|§LABEL\w*|§FLYTHRU_\w*|§RULE_FINDINGS\w*|§LOADPATH_\w*|§BILLBOARD\w*|§STOREY_REVEAL\w*)')
def ovl(L): return [re.sub(r'\b(\w*ms|secs?|t|elapsed|wall\w*)=[0-9.]+','\\1=_',l) for l in (L or []) if OV.match(l)]
oa,ob=ovl(A),ovl(B)
if B is None: R[9]='INCONCLUSIVE (B not run yet)'
elif not ob: R[9]='INCONCLUSIVE (zero overlay lines in B)'
else:
    import collections; ta=collections.Counter(re.match(r'(§\w+)',l).group(1) for l in oa); tb=collections.Counter(re.match(r'(§\w+)',l).group(1) for l in ob)
    diff=[(x,y) for x,y in zip(oa,ob) if x!=y]
    R[9]=('PASS' if oa==ob else 'FAIL')+' overlay lines A=%d B=%d tags=%s differing=%d first=%s'%(len(oa),len(ob),dict(tb),len(diff)+abs(len(oa)-len(ob)),[ (x[:140],y[:140]) for x,y in diff[:2]])
pr=[int(d['programs']) for d in a]; ms=[float(d['ms']) for d in a]
R[10]=('PASS' if len(set(pr[1:]))==1 else 'FAIL')+' programs f0=%d f1..=%s meanMs(all)=%.1f meanMs(f>=2)=%.1f medianMs=%.1f'%(pr[0],sorted(set(pr[1:])),st.mean(ms),st.mean(ms[2:]),st.median(ms))
off=[l[:140] for l in (C or []) if '§FILM_EXPOSURE off' in l]; cexp=set(d.get('exposure') for d in fe(C))
R[11]=('PASS' if off else ('INCONCLUSIVE (C not run yet)' if C is None else 'FAIL'))+' %s perFrameLinesC=%d expSet=%s'%(off[:1],len(fe(C)),cexp)
sky=[d['f'] for d in a if int(d.get('skyPx',0))>2880]; R['sky']='first frame skyPx>20%%: %s pose=%s %s targetEV=%s'%(sky[:1], a[sky[0]]['cam'] if sky else '-', a[sky[0]]['tgt'] if sky else '-', a[sky[0]]['targetEV'] if sky else '-')
for k in R: print(k, R[k])
