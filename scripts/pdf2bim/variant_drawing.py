#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §35 — makes a drawing the chain has never seen, from this PDF's own vector paths and text, warped at one seam and written as a new PDF. A test instrument: its output is never a model input outside a witness. Written text is calibrated in a second pass so each word's box centre lands where it should.
# Usage: variant_drawing.py <svg dir> <rosetta.json> <inferred.json> <pdf> <out.pdf> Z|B|H
import re,sys,json,os,subprocess
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import type_template as TT
sd,rj,ij,pdf,out,mode=sys.argv[1:7]; R=json.load(open(rj)); I=json.load(open(ij)); K=R['sheet']['mm_per_pt_fitted']; gx,gy=R['grid']['x'],R['grid']['y']; T=I['template']; V=I['views']; S=T['sheets']; PAGES=range(1,9)
BAY=600; SEAM=7725; TALL=300; SEAMZ=2700   # §35: the end bay's only stretch free of doors and windows on every sheet; above the high window's head
d_=BAY/K; h_=TALL/K
def bbox_words(f,p):
    b=subprocess.run(['pdftotext','-f',str(p),'-l',str(p),'-bbox',f,'-'],capture_output=True,text=True,check=True).stdout
    return [(float(a),float(b_),float(c),float(d),t) for a,b_,c,d,t in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>',b)]
def load(p):
    o=[]
    for m in re.finditer(r'<path ([^>]*?)/>',open(os.path.join(sd,'p%d.svg'%p)).read()):
        a=m.group(1)
        if 'stroke="' not in a or ' d="' not in a: continue
        t=re.search(r'transform="matrix\(([^)]*)\)"',a); M=[float(x) for x in t.group(1).split(',')] if t else [1,0,0,1,0,0]
        sw=re.search(r'stroke-width="([\d.]+)"',a); w=TT.pen(float(sw.group(1)),M) if sw else 1
        c=re.search(r'stroke="rgb\(([\d.]+)%, *([\d.]+)%, *([\d.]+)%\)"',a); col=[float(v)/100 for v in c.groups()] if c else [0,0,0]
        tk=re.findall(r'[MLCZ]|-?[\d.]+',re.search(r' d="([^"]*)"',a).group(1)); seq=[];i=0;cmd=None
        while i<len(tk):
            if tk[i] in 'MLCZ':
                cmd=tk[i];i+=1
                if cmd=='Z': seq.append(('Z',[]))
                continue
            n=3 if cmd=='C' else 1; v=[float(x) for x in tk[i:i+2*n]]; i+=2*n; seq.append((cmd,[(M[0]*v[j]+M[2]*v[j+1]+M[4],M[1]*v[j]+M[3]*v[j+1]+M[5]) for j in range(0,2*n,2)]))
        o.append((w,col,seq))
    return o
def warp_of(p):
    "page point -> page point, for this mode"
    if mode=='Z': return (lambda x,y:(x,y)),'no warp'
    W=TT.words(pdf,p)
    if mode=='B':
        if p in (S['plan'],S['electrical'],S['roof']):
            xa=TT.top_row(W,gx)['A'][1]; sx=xa+SEAM/K; return (lambda x,y:(x+d_ if x>sx else x,y)),'plan-like, seam x %.1f'%sx
        if p==S['sections']:
            row=sorted(w for w in W if w[0]=='A'); xa=min((w for w in W if w[0]=='A'),key=lambda w:w[2])[1]; ymid=(min(w[2] for w in W if w[0] in gx)+min(w[2] for w in W if w[0] in gy and w[2]>200))/2; yB=min(w[2] for w in W if w[0] in gy and w[2]>200)-15; sx=xa+SEAM/K
            return (lambda x,y:(x+d_ if (x>sx and y<yB) else x,y)),'A-A only, seam x %.1f, above y %.1f'%(sx,yB)
        if p==S['elevations_a']:
            fr,re_=V['FRONT'],V['REAR']; sf=fr['ox']+SEAM/K; sr=re_['ox']+(gx['E']-SEAM)/K; mid=(re_['ground_line']+fr['label_row'])/2-12; lab=[(w[1],w[0]) for w in W if w[0] in gx and abs(w[2]-re_['label_row'])<12]; xD=[x for x,n in lab if n=='D'][0]; xE=[x for x,n in lab if n=='E'][0]
            def f(x,y):
                if y>mid: return (x+d_ if x>sf else x,y)
                if abs(y-re_['label_row'])<=13: return (x+d_ if x>(xD+xE)/2 else x,y)   # REAR's bubbles run A..E over mirrored content (§22): each stays on its own axis
                return (x+d_ if x>sr else x,y)
            return f,'FRONT seam x %.1f, REAR seam x %.1f, rows split at y %.1f'%(sf,sr,mid)
        return (lambda x,y:(x,y)),'not this mode'
    if mode=='H':
        rows=[(v['beam'],v['floor_line'],v['label_row']) for k,v in V.items() if v['sheet']==p]
        if rows:
            rows.sort(); bands=[]
            for i,(b,fl,lr) in enumerate(rows):
                top=rows[i-1][1]+6 if i else -1e9; bands.append((top,fl-SEAMZ/K,b))
            def f(x,y):
                for top,sy,b in bands:
                    if top<y<sy: return (x,y-h_)
                return (x,y)
            return f,'elevation bands %s'%[(round(a,1),round(c,1)) for a,c,_ in bands]
        return (lambda x,y:(x,y)),'not this mode'
pages={}; notes={}
for p in PAGES:
    f,n=warp_of(p); pages[p]=(load(p),[(a,b,c,d_0,t) for a,b,c,d_0,t in bbox_words(pdf,p)],f); notes[p]=n; print('§VAR p%d %s paths %d words %d'%(p,n,len(pages[p][0]),len(pages[p][1])))
info=subprocess.run(['pdfinfo','-f','1','-l','1',pdf],capture_output=True,text=True).stdout; ms=re.search(r'Page\s+1 size:\s+([\d.]+) x ([\d.]+)',info); rot=re.search(r'Page\s+1 rot:\s+(\d+)',info)
PW,PH=float(ms.group(1)),float(ms.group(2))
if rot and rot.group(1) in('90','270'): PW,PH=PH,PW
PW+=d_+40; PH+=40; OY=0   # room for the warp; a warp upward stays on the page by the margin
import html
def esc(t): return html.unescape(t).encode('latin-1','replace').decode('latin-1').replace('\\','\\\\').replace('(','\\(').replace(')','\\)')
def write(fn,adj):
    objs=[]; kids=[]
    def add(s): objs.append(s); return len(objs)
    font=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'); parent_slot=add('')
    for p in PAGES:
        P,Wd,f=pages[p]; c=['1 J 1 j']; lw=None;col=None
        Y=lambda y:PH-20-y
        for w,cl,seq in P:
            if w!=lw: c.append('%.4f w'%w); lw=w
            if cl!=col: c.append('%.3f %.3f %.3f RG'%tuple(cl)); col=cl
            s=[]
            for cmd,pts in seq:
                q=[f(*pt) for pt in pts]
                if cmd=='M': s.append('%.3f %.3f m'%(q[0][0]+20,Y(q[0][1])))
                elif cmd=='L': s.append('%.3f %.3f l'%(q[0][0]+20,Y(q[0][1])))
                elif cmd=='C': s.append('%.3f %.3f %.3f %.3f %.3f %.3f c'%(q[0][0]+20,Y(q[0][1]),q[1][0]+20,Y(q[1][1]),q[2][0]+20,Y(q[2][1])))
                elif cmd=='Z': s.append('h')
            c.append(' '.join(s)+' S')
        c.append('0 g')
        for i,(a,b,cc,dd,t) in enumerate(Wd):
            cx,cy=f((a+cc)/2,(b+dd)/2); sz=max(1.0,(dd-b)/1.15); ax,ay,tz=adj.get((p,i),(0,0,100))
            c.append('BT /F1 %.3f Tf %.1f Tz %.3f %.3f Td (%s) Tj ET'%(sz,tz,cx+20+ax,Y(cy)+ay,esc(t)))
        cont='\n'.join(c); st=add('<< /Length %d >>\nstream\n%s\nendstream'%(len(cont.encode('latin-1','replace')),cont))
        kids.append(add('<< /Type /Page /Parent %d 0 R /MediaBox [0 0 %.2f %.2f] /Contents %d 0 R /Resources << /Font << /F1 %d 0 R >> >> >>'%(parent_slot,PW,PH,st,font)))
    objs[parent_slot-1]='<< /Type /Pages /Kids [%s] /Count %d >>'%(' '.join('%d 0 R'%k for k in kids),len(kids))
    root=add('<< /Type /Catalog /Pages %d 0 R >>'%parent_slot); o=b'%PDF-1.4\n'; xr=[]
    for i,s in enumerate(objs,1): xr.append(len(o)); o+=('%d 0 obj\n%s\nendobj\n'%(i,s)).encode('latin-1','replace')
    x=len(o); o+=('xref\n0 %d\n0000000000 65535 f \n'%(len(objs)+1)).encode()+b''.join(('%010d 00000 n \n'%v).encode() for v in xr)+('trailer << /Size %d /Root %d 0 R >>\nstartxref\n%d\n%%%%EOF\n'%(len(objs)+1,root,x)).encode(); open(fn,'wb').write(o)
write(out,{}); adj={}; worst=0
for p in PAGES:
    got=bbox_words(out,p); P,Wd,f=pages[p]; used=set()
    for i,(a,b,cc,dd,t) in enumerate(Wd):   # a word can move in the writer's order: match by text + nearest
        cx,cy=f((a+cc)/2,(b+dd)/2); best=None
        for j,g in enumerate(got):
            if j in used or g[4]!=t: continue
            e=abs((g[0]+g[2])/2-20-cx)+abs((g[1]+g[3])/2-20-cy)
            if best is None or e<best[0]: best=(e,j,(g[0]+g[2])/2-20-cx,(g[1]+g[3])/2-20-cy)
        if best:
            used.add(best[1]); g=got[best[1]]; tz=100*(cc-a)/max(.01,g[2]-g[0]); adj[(p,i)]=(-best[2]+((g[2]-g[0])-(cc-a))/2,best[3],tz)
write(out,adj)
for p in PAGES:
    got=bbox_words(out,p); P,Wd,f=pages[p]; miss=0
    for i,(a,b,cc,dd,t) in enumerate(Wd):
        cx,cy=f((a+cc)/2,(b+dd)/2); c=[abs((g[0]+g[2])/2-20-cx)+abs((g[1]+g[3])/2-20-cy) for g in got if g[4]==t]
        if c: worst=max(worst,min(c))
        else: miss+=1
    if miss: print('§VAR p%d words lost by the writer %d'%(p,miss))
print('§VAR mode',mode,'wrote',out,'page',round(PW),round(PH),'worst word centre after calibration pt',round(worst,3))
