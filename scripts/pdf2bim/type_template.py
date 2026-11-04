# Implements prompts/PDF2BIM_VECTOR_PROBE.md §33 — the ruler template: the fill rule and what several stages share. Imported, not run.
import json,math,re,subprocess
def load(path):
    return json.load(open(path,encoding='utf-8'))
def decide(name,measured,blank,where=''):
    """§33 fill rule. Within tolerance = READ, the nominal; outside = FINDING, the measured value (the sheet wins); nothing measured = DEFAULT, the nominal, stated."""
    n,tol=blank['nominal'],blank['tol_mm']
    if measured is None: rec=dict(value=n,status='DEFAULT',measured=None)
    elif abs(measured-n)<=tol: rec=dict(value=n,status='READ',measured=round(measured,1))
    else: rec=dict(value=round(measured),status='FINDING',measured=round(measured,1))
    print('§INFER',name,rec['status'],'value',rec['value'],'measured',rec['measured'],'nominal',n,'tol',tol,'|',where,flush=True)
    return rec
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
def pen(sw,M):
    "a stroke's real width in page points: a PDF writer may scale its coordinates and stroke width against each other"
    return round(sw*math.hypot(M[0],M[1]),3)
