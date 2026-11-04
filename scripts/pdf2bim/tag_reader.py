# Implements prompts/PDF2BIM_VECTOR_PROBE.md §36 — which of these candidate strings is drawn in this tag cell? Compares ink with ink, in mm. Never reads a string from nothing. Imported, not run.
import math,collections
CLAMP=18.0; STEP=4.3; BUCKET=18.0   # mm: how far a stroke can be off before it just counts as absent; the drawing's own 0.12 pt grid at 1:100
class Cell:
    def __init__(s,ink):
        s.ink=ink; s.D={}; s.c={}; s.g=collections.defaultdict(list)
        for p in ink: s.g[(int(p[0]//BUCKET),int(p[1]//BUCKET))].append(p)
    def d(s,x,y):
        k=(round(x/2),round(y/2)); v=s.D.get(k)
        if v is not None: return v
        i,j=int(x//BUCKET),int(y//BUCKET); b=CLAMP
        for a in range(i-1,i+2):
            for c in range(j-1,j+2):
                for p in s.g.get((a,c),()):
                    e=math.hypot(p[0]-x,p[1]-y)
                    if e<b: b=e
        s.D[k]=b; return b
    def cost(s,ch,x,A):
        k=(ch,x); v=s.c.get(k)
        if v: return v
        X=x*STEP; best=None
        for i,pts in enumerate(A[ch]):
            for dy in (-STEP,0,STEP):
                f=sum(s.d(X+a,b+dy) for a,b in pts)/len(pts)
                if best is None or f<best[0]: best=(f,i,dy)
        s.c[k]=best; return best
def score(cell,st,A):
    "mm: the string placed glyph by glyph where it fits best, template to ink plus ink to template. None if a character has no sample: unjudgeable, not a bad score."
    if not cell.ink or any(not A.get(c) for c in st): return None
    F={x:(0.0,[]) for x in range(0,36)}
    for ch in st:
        N={}
        for x,(c0,path) in F.items():
            f,i,dy=cell.cost(ch,x,A); pts=A[ch][i]; w=max(a for a,b in pts); e=c0+f; np=path+[(x*STEP,pts,dy)]
            for adv in range(1,6):
                nx=x+round(w/STEP)+adv
                if nx not in N or e<N[nx][0]: N[nx]=(e,np)
        F=N
    c,p=min(F.values(),key=lambda v:v[0]); placed=[(x+a,b+dy) for x,pts,dy in p for a,b in pts]; pm=Cell(placed)
    x0=p[0][0]; x1=max(a for a,b in placed); rv=[pm.d(a,b) for a,b in cell.ink if x0-4<=a<=x1+4]
    return c/len(st)+(sum(rv)/len(rv) if rv else CLAMP)
def choose(ink,cands,A,read_max,margin,suffix='sqm'):
    "the candidate drawn here, or None: dict(value,score,next,next_score,unjudgeable)"
    C=Cell(ink); r=[(score(C,c+suffix,A),c) for c in cands]; un=[c for s_,c in r if s_ is None]; kn=sorted(x for x in r if x[0] is not None)
    if not kn: return dict(value=None,score=None,next=None,next_score=None,unjudgeable=un)
    nx=kn[1] if len(kn)>1 else (None,None); ok=not un and kn[0][0]<=read_max and (nx[0] is None or nx[0]-kn[0][0]>=margin)   # a candidate that cannot be judged blocks the read: the winner might only be winning because the true string was never scored (§36, measured)
    return dict(value=kn[0][1] if ok else None,best=kn[0][1],score=round(kn[0][0],2),next=nx[1],next_score=None if nx[0] is None else round(nx[0],2),unjudgeable=un)
