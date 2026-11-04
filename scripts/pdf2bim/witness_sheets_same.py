#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §33 W-T4 — are two sets of typed sheets the same drawing? Entity by entity, not byte by byte: a PDF rewritten by Ghostscript moves its TEXT boxes against its lines (fonts re-embedded, measured below), so text gets a stated tolerance and everything else is held to rounding.
# Usage: witness_sheets_same.py <typed A> <typed B>
import sys,os,glob,collections
A,B=sys.argv[1:3]; TOL_LINE=.3; TOL_TEXT=30
def ents(f):
    d=open(f).read().split('\n'); o=[]; i=0; on=False
    while i<len(d)-1:
        if d[i]=='2' and d[i+1]=='ENTITIES': on=True
        if on and d[i]=='0' and d[i+1] not in ('SECTION','ENDSEC','EOF'):
            t=d[i+1]; g=[]; j=i+2
            while j<len(d)-1 and d[j]!='0': g.append((d[j],d[j+1])); j+=2
            o.append((t,g)); i=j; continue
        i+=2
    return o
def split(g):
    "strings and numbers apart; a code's number is a coordinate unless it counts something"
    s=[];n=[]
    for c,v in g:
        try: n.append((c,float(v)))
        except ValueError: s.append((c,v))
    return tuple(s),n
fails=0; worst=collections.Counter(); seen=0; moved=[]
for fa in sorted(glob.glob(os.path.join(A,'*.dxf'))):
    fn=os.path.basename(fa); fb=os.path.join(B,fn)
    if not os.path.exists(fb): print('§SAME missing',fn); fails+=1; continue
    ea,eb=ents(fa),ents(fb); seen+=len(ea); ga=collections.defaultdict(list); gb=collections.defaultdict(list)
    for t,g in ea: ga[(t,)+split(g)[0]].append(split(g)[1])
    for t,g in eb: gb[(t,)+split(g)[0]].append(split(g)[1])
    if {k:len(v) for k,v in ga.items()}!={k:len(v) for k,v in gb.items()}: print('§SAME',fn,'different entities: only A',[k[:3] for k in ga if len(ga[k])!=len(gb.get(k,[]))][:6],'only B',[k[:3] for k in gb if len(gb[k])!=len(ga.get(k,[]))][:6]); fails+=1; continue
    for k in ga:
        text=k[0]=='TEXT' and ('8','A-ANNO-NOTE') in k[1:]; tol=TOL_TEXT if text else TOL_LINE; used=set()
        for n in ga[k]:
            best=None
            for ix,m in enumerate(gb[k]):
                if ix in used or len(m)!=len(n) or [c for c,_ in m]!=[c for c,_ in n]: continue
                d=max((abs(p[1]-q[1]) for p,q in zip(n,m)),default=0)
                if best is None or d<best[0]: best=(d,ix)
            if best is None: print('§SAME',fn,'no partner for',k[:3]); fails+=1; continue
            used.add(best[1]); cl='text' if text else 'other'; worst[cl]=max(worst[cl],best[0])
            if best[0]>tol: print('§SAME',fn,k[:3],'moved',round(best[0],2),'over tolerance',tol); fails+=1
if not seen: print('§SAME VACUOUS no entities read'); sys.exit(1)
print('§SAME',seen,'entities, worst difference mm: annotation text',round(worst['text'],1),'(tol %s), everything else'%TOL_TEXT,round(worst['other'],2),'(tol %s)'%TOL_LINE)
print('§SAME','PASS' if not fails else 'WRONG','mismatches',fails)
