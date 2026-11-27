#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §12 — Witness: W-P6 (tag counts vs the PDF's own schedule), template-matcher step 0.
# Usage: type_checklist.py <pdf> <plan_page> <schedule_page> <type.json>   (all marking formats come from the JSON)
import re,sys,subprocess,collections,json
pdf,pp,sp,tj=sys.argv[1:5]
def log(*a): print('§PDF',*a,flush=True)
T=json.load(open(tj)); SC=T['schedule']; TAGS=T['tags']
TAGRE='|'.join('(?:%s)'%t['pattern'] for t in TAGS)
VOCRE=TAGRE+'|'+'|'.join('(?:%s)'%p for p in T['vocabulary_unclassified']['patterns'])
clsof=lambda k:next((t['id'] for t in TAGS if re.fullmatch(t['pattern'],k)),None)
log('TYPE',T['type'],'tags',[(t['id'],t['pattern'],t['ifc']) for t in TAGS])
run=lambda *c:subprocess.run(c,capture_output=True,text=True,check=True).stdout
# EXPECTED (exact): schedule page text layer. blocks: REFERENCES a b c ... UNITS n NOS n NOS ...
lay=run('pdftotext','-layout','-f',sp,'-l',sp,pdf,'-')
exp={}; refs=None
for ln in lay.splitlines():
    m=re.match(r'\s*'+SC['refs_label']+r'\s+((?:(?:'+TAGRE+r')\s*)+)',ln)
    if m: refs=m.group(1).split(); continue
    m=re.match(r'\s*'+SC['units_label']+r'\s+((?:\d+\s*'+SC['units_suffix']+r'\s*)+)',ln)
    if m and refs:
        n=[int(x) for x in re.findall(r'(\d+)\s*'+SC['units_suffix'],m.group(1))]
        if len(n)==len(refs): exp.update(zip(refs,n))
        refs=None
log('SCHEDULE expected',exp,'' if exp else 'INCONCLUSIVE(VACUOUS no schedule parsed)')
# FOUND: tag words on plan page, legend column removed (column of >=4 vocabulary words sharing x within 3pt = legend, derived not assumed)
bb=run('pdftotext','-f',pp,'-l',pp,'-bbox',pdf,'-')
W=[(w[4],(float(w[0])+float(w[2]))/2,(float(w[1])+float(w[3]))/2) for w in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>',bb)]
voc=lambda t:re.fullmatch(VOCRE,t)
V=[w for w in W if voc(w[0])]
col=collections.defaultdict(list)
for w in V: col[round(w[1]/T['legend']['x_tol_pt'])].append(w)
legend={id(w) for c in col.values() if len(c)>=T['legend']['min_column_words'] for w in c}
found=collections.Counter(w[0] for w in V if id(w) not in legend and re.fullmatch(TAGRE,w[0]))
leg=collections.Counter(w[0] for w in V if id(w) in legend and re.fullmatch(TAGRE,w[0]))
log('PLAN tags found (legend column excluded)',dict(sorted(found.items())),'legend entries',dict(sorted(leg.items())))
# ---- tag-collision variants (JSON `variants`): a tag is reclassified when the geometry the key states is next to it
import math,os,tempfile
TAGPOS=[w for w in V if id(w) not in legend and re.fullmatch(TAGRE,w[0])]
var=[(t,v) for t in TAGS for v in t.get('variants',[])]
if var:
    sv=os.path.join(tempfile.mkdtemp(),'p.svg'); subprocess.run(['pdftocairo','-svg','-f',pp,'-l',pp,pdf,sv],check=True)
    svg=open(sv).read(); rects=[]
    for m in re.finditer(r'<path ([^>]*?)/>',svg):
        a=m.group(1)
        if 'stroke="' not in a: continue
        tm=re.search(r'transform="matrix\(([^)]*)\)"',a); M=[float(x) for x in tm.group(1).split(',')] if tm else [1,0,0,1,0,0]
        tk=re.findall(r'[MLC]|-?[\d.]+',re.search(r' d="([^"]*)"',a).group(1)); pts=[];i=0;c=None
        while i<len(tk):
            if tk[i] in 'MLC': c=tk[i];i+=1;continue
            n=3 if c=='C' else 1; x,y=map(float,tk[i+2*(n-1):i+2*n]); i+=2*n; pts.append((M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5]))
        if len(pts) in(4,5) and math.dist(pts[0],pts[-1])<0.05:
            xs=[q[0] for q in pts];ys=[q[1] for q in pts]; rects.append(((min(xs)+max(xs))/2,(min(ys)+max(ys))/2,(max(xs)-min(xs))*25.4/72*100,(max(ys)-min(ys))*25.4/72*100))
    log('VARIANT closed 4/5-point rectangles on plan page',len(rects))
    reclass=collections.Counter(); keep=collections.Counter(); moved=[]
    for t,cx,cy in TAGPOS:
        hit=None
        for tg,v in var:
            if t in v['applies_to']:
                g=v['geometry']; w0,h0=g['closed_rect_mm']; tol=g['tol_mm']
                for r in rects:
                    if sorted((abs(r[2]-w0)<=tol and abs(r[3]-h0)<=tol, abs(r[2]-h0)<=tol and abs(r[3]-w0)<=tol))[1] and math.dist((cx,cy),(r[0],r[1]))<=g['max_dist_pt']:
                        hit=(v['id'],round(math.dist((cx,cy),(r[0],r[1])),1)); break
        if hit: reclass[(t,hit[0])]+=1; moved.append((t,round(cx),round(cy),hit))
        else: keep[t]+=1
    log('VARIANT reclassified',dict((f'{a}->{b}',n) for (a,b),n in reclass.items()),moved)
    found=keep   # tags remaining as the base class
    if not reclass: log('VARIANT NO-OP: no tag reclassified')
for k in sorted(set(exp)|set(found)|set(leg)):
    e=exp.get(k); f=found.get(k,0)
    st='GREEN' if e==f else ('LEGEND_ONLY(0 on plan, not a schedule item)' if e is None and f==0 else 'YELLOW:not_in_schedule' if e is None else 'YELLOW:count_mismatch')
    log('MATCH',k,clsof(k),'schedule',e,'plan',f,'legend',leg.get(k,0),st)
cls=lambda d:collections.Counter(); 
by=lambda d:{t['id']:sum(v for k,v in d.items() if clsof(k)==t['id']) for t in TAGS}
log('TOTAL by class schedule',by(exp),'plan',by(found),'columns' if var else '',dict((f'{a}',n) for (a,_),n in reclass.items()) if var else '')
