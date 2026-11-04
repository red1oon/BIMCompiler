# Implements prompts/PDF2BIM_VECTOR_PROBE.md §33 — the ruler template: the fill rule and what several stages share. Imported, not run.
import json,math,os,re,subprocess
def load(path):
    return json.load(open(path,encoding='utf-8'))
def decide(name,measured,blank,where='',module=None):
    """§33 fill rule. Within tolerance = READ, the nominal; outside = FINDING, the measured value (the sheet wins); nothing measured = DEFAULT, the nominal, stated."""
    n,tol=blank['nominal'],blank['tol_mm']
    if measured is None: rec=dict(value=n,status='DEFAULT',measured=None)
    elif abs(measured-n)<=tol: rec=dict(value=n,status='READ',measured=round(measured,1))
    else:
        mod=module or blank.get('module_mm')
        rec=dict(value=round(measured/mod)*mod if mod else round(measured),status='FINDING',measured=round(measured,1))
    print('§INFER',name,rec['status'],'value',rec['value'],'measured',rec['measured'],'nominal',n,'tol',tol,'|',where,flush=True)
    return rec
def radii(T,K):
    "bubble and section-marker radius bands in points at this sheet's scale: the ruler holds them in mm, so they follow a differently fitted print (§35)"
    b,s=T['ruler']['bubble_radius_mm'],T['ruler']['section_marker_radius_mm']; return (b[0]/K,b[1]/K),(s[0]/K,s[1]/K)
def page_of(svg):
    return re.search(r'p(\d+)\.svg',svg).group(1)
def words(pdf,page):
    b=subprocess.run(['pdftotext','-f',str(page),'-l',str(page),'-bbox',pdf,'-'],capture_output=True,text=True,check=True).stdout
    return [(w[4],(float(w[0])+float(w[2]))/2,(float(w[1])+float(w[3]))/2) for w in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>',b)]
def _line(W,labels,ax):
    "the words on one line of the sheet holding the most distinct labels (ties: nearest the page's edge). The same characters also sit in section markers, tables and title blocks: only the whole row is the grid's"
    best=None
    for w in W:
        if w[0] not in labels: continue
        g=[q for q in W if q[0] in labels and abs(q[ax]-w[ax])<=2]; n=len({q[0] for q in g})
        if best is None or n>best[0] or (n==best[0] and w[ax]<best[1]): best=(n,w[ax],g)
    if best is None: return {}
    o={}
    for q in sorted(best[2],key=lambda q:abs(q[ax]-best[1]),reverse=True): o[q[0]]=q
    return o
def top_row(W,gx):
    "the grid's letters, label -> word"
    return _line(W,set(gx),2)
def left_col(W,gy):
    "the grid's numbers, label -> word"
    return _line(W,set(gy),1)
def plan_frame(W,R,T):
    "the plan's page region: the grid's label box plus the ruler's margin (replaces typed page coordinates)"
    K=R['sheet']['mm_per_pt_fitted']; gx,gy=R['grid']['x'],R['grid']['y']; m=T['ruler']['plan_frame_margin_mm']/K
    xs=[w[1] for w in top_row(W,gx).values()]; ys=[w[2] for w in left_col(W,gy).values()]
    return min(xs)-m,max(xs)+m,min(ys)-m,max(ys)+m
def is_wall_pen(p,T,K):
    "the wall pen, in mm so it follows a differently fitted print (§35)"
    return abs(p*K-T['ruler']['wall_pen_mm'])<=1.5
def pen(sw,M):
    "a stroke's real width in page points: a PDF writer may scale its coordinates and stroke width against each other"
    return round(sw*math.hypot(M[0],M[1]),3)
# ---- room tags (§36): the hairline 2x2 boxes on the plan, and the ink of a tag's area cell
def stroked_paths(svg):
    "every stroked path on a sheet: real pen, page-space points, bbox"
    o=[]
    for m in re.finditer(r'<path ([^>]*?)/>',open(svg).read()):
        a=m.group(1)
        if 'stroke="' not in a or ' d="' not in a: continue
        t=re.search(r'transform="matrix\(([^)]*)\)"',a); M=[float(x) for x in t.group(1).split(',')] if t else [1,0,0,1,0,0]
        s=re.search(r'stroke-width="([\d.]+)"',a); tk=re.findall(r'[MLCZ]|-?[\d.]+',re.search(r' d="([^"]*)"',a).group(1)); p=[];i=0;c=None
        while i<len(tk):
            if tk[i] in 'MLCZ': c=tk[i];i+=1;continue
            n=3 if c=='C' else 1; x,y=float(tk[i+2*n-2]),float(tk[i+2*n-1]); i+=2*n; p.append((M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5]))
        if p:
            X=[q[0] for q in p];Y=[q[1] for q in p]; o.append(dict(pts=p,pen=pen(float(s.group(1)),M) if s else 1,x0=min(X),x1=max(X),y0=min(Y),y1=max(Y)))
    return o
def room_tags(P,T,K,frame=None):
    "the tag boxes, each with its divider: [dict(x0,x1,y0,y1,xm)]. xm None when no divider is drawn. In the ruler's mm, so a fitted print changes nothing."
    RT=T['ruler']['room_tag']; bw,bh=RT['box_mm']; tol=RT['box_tol']; hair=RT['hair_pen_mm_max']; o=[]
    for b in P:
        if len(b['pts'])!=5 or math.dist(b['pts'][0],b['pts'][-1])>=.05 or b['pen']*K>hair: continue
        if abs((b['x1']-b['x0'])*K-bw)>tol*bw or abs((b['y1']-b['y0'])*K-bh)>tol*bh: continue
        if frame and not (frame[0]<=b['x0'] and b['x1']<=frame[1] and frame[2]<=b['y0'] and b['y1']<=frame[3]): continue
        d=[q for q in P if len(q['pts'])==2 and q['pen']*K<=hair and q['x1']-q['x0']<.02 and b['x0']<q['x0']<b['x1'] and q['y0']<=b['y0']+.5 and q['y1']>=b['y1']-.5]
        o.append(dict(x0=b['x0'],x1=b['x1'],y0=b['y0'],y1=b['y1'],xm=d[0]['x0'] if d else None))
    return sorted(o,key=lambda b:(b['y0'],b['x0']))
def cell_ink(P,cell,T,K,step=.06):
    "sampled ink of one tag cell in mm from its top-left corner; a line crossing the cell counts as ink too (overprint)"
    a,b_,c,d=cell; lo,hi=T['ruler']['room_tag']['ink_pen_mm']; o=[]
    for p in P:
        if not lo<=p['pen']*K<=hi or p['x1']<a or p['x0']>b_ or p['y1']<c or p['y0']>d: continue
        for u,v in zip(p['pts'],p['pts'][1:]):
            n=max(1,int(math.dist(u,v)/step))
            for i in range(n+1):
                x,y=u[0]+(v[0]-u[0])*i/n,u[1]+(v[1]-u[1])*i/n
                if a<=x<=b_ and c<=y<=d: o.append(((x-a)*K,(y-c)*K))
    return o
def plan_origin(pdf,R,T):
    "grid A and grid 5 in page points, from the plan's own label row and column"
    W=words(pdf,T['sheets']['plan']); return top_row(W,R['grid']['x'])['A'][1],left_col(W,R['grid']['y'])['5'][2]
def room_extent(r,R):
    "a room's preset cell at this drawing's grid, mm: (x0,x1,y0,y1). x is None for a room with no grid line on that axis (the porch)."
    gx,gy=R['grid']['x'],R['grid']['y']; return (gx[r['x'][0]],gx[r['x'][1]]) if 'x' in r else None,(gy[r['y'][0]],gy[r['y'][1]])
def assign_tags(B,R,xa,y5,K):
    "room name -> the tags whose centre lies in its preset cell, and the tags in no cell"
    o={r['name']:[] for r in R['rooms']}; stray=[]
    for b in B:
        cx,cy=((b['x0']+b['x1'])/2-xa)*K,((b['y0']+b['y1'])/2-y5)*K; b['cx'],b['cy']=cx,cy; hit=[r['name'] for r in R['rooms'] for ex,ey in [room_extent(r,R)] if (ex is None or ex[0]<=cx<=ex[1]) and ey[0]<=cy<=ey[1]]
        if hit:
            for n in hit: o[n].append(b)
        else: stray.append(b)
    return o,stray
def area_cell(b):
    return (b['xm'],b['x1'],b['y0'],(b['y0']+b['y1'])/2)
def load_glyphs(T,tj,drop=None):
    "char -> [sample points]. drop = a room name whose own samples are left out (§36 W-A3)"
    d=load(os.path.join(os.path.dirname(os.path.abspath(tj)),T['ruler']['room_tag']['glyphs']))
    return {c:[[tuple(p) for p in s['pts']] for s in v if s['tag']!=drop] for c,v in d['samples'].items()}
def porch_width(emit_log):
    "the centre distance of the two column rectangles this run read, or None"
    c=[float(m) for m in re.findall(r'W-C4 column rect .*? centre \((-?[\d.]+), -?[\d.]+\)',open(emit_log,encoding='utf-8').read())]
    return abs(c[1]-c[0]) if len(c)==2 else None
