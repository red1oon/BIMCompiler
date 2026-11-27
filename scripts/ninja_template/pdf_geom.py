#!/usr/bin/env python3
# pdf_geom.py <pdf> -> JSON {page:[w,h], words:[{t,x0,y0,x1,y1,font,size}], rects:[{x0,y0,x1,y1,fill,stroke}], lines:[{x0,y0,x1,y1,lw,color}]}  (origin = TOP-left, points). Numeric extraction only, no rasterising.
import sys, json
from pdfminer.high_level import extract_pages
from pdfminer.layout import LTChar, LTRect, LTLine, LTCurve, LTTextContainer, LTTextLine, LTFigure, LTAnno
def col(c):
    if c is None: return None
    try: return [round(float(x),3) for x in (c if isinstance(c,(list,tuple)) else [c])]
    except Exception: return None
out={'page':None,'words':[],'rects':[],'lines':[]}
for page in extract_pages(sys.argv[1]):
    H=page.height; out['page']=[round(page.width,3),round(H,3)]
    def walk(o):
        if isinstance(o,LTChar): chars.append(o)
        elif isinstance(o,LTRect): out['rects'].append({'x0':round(o.x0,3),'y0':round(H-o.y1,3),'x1':round(o.x1,3),'y1':round(H-o.y0,3),'fill':bool(o.fill),'stroke':bool(o.stroke),'lw':round(o.linewidth,3),'fc':col(o.non_stroking_color),'sc':col(o.stroking_color)})
        elif isinstance(o,LTLine): out['lines'].append({'x0':round(o.x0,3),'y0':round(H-o.y1,3),'x1':round(o.x1,3),'y1':round(H-o.y0,3),'lw':round(o.linewidth,3),'sc':col(o.stroking_color)})
        elif isinstance(o,LTCurve):
            d={'x0':round(o.x0,3),'y0':round(H-o.y1,3),'x1':round(o.x1,3),'y1':round(H-o.y0,3),'lw':round(o.linewidth,3),'sc':col(o.stroking_color),'curve':True,'fill':bool(o.fill),'stroke':bool(o.stroke),'fc':col(o.non_stroking_color)}
            (out['rects'] if o.fill and not o.stroke else out['lines']).append(d)
        if hasattr(o,'__iter__') and not isinstance(o,LTChar):
            for c in o: walk(c)
    chars=[]; walk(page)
    # words = runs of chars on the same baseline without a gap > 0.5*size
    chars.sort(key=lambda c:(round(H-c.y1,1),c.x0)); cur=None
    for c in chars:
        if c.get_text().isspace():
            if cur: out['words'].append(cur); cur=None
            continue
        item={'t':c.get_text(),'x0':round(c.x0,3),'y0':round(H-c.y1,3),'x1':round(c.x1,3),'y1':round(H-c.y0,3),'font':c.fontname.split('+')[-1],'size':round(c.size,2)}
        if cur and abs(cur['y0']-item['y0'])<0.5 and -0.5<=item['x0']-cur['x1']<c.size*0.4: cur['t']+=item['t']; cur['x1']=item['x1']
        else:
            if cur: out['words'].append(cur)
            cur=item
    if cur: out['words'].append(cur)
import subprocess, re, html
try:
    x=subprocess.run(['pdftotext','-bbox',sys.argv[1],'-'],capture_output=True,text=True,timeout=300).stdout
    out['words']=[{'t':html.unescape(m.group(5)),'x0':float(m.group(1)),'y0':float(m.group(2)),'x1':float(m.group(3)),'y1':float(m.group(4)),'font':'','size':round(float(m.group(4))-float(m.group(2)),2)} for m in re.finditer(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>',x)]
except Exception as e:
    sys.stderr.write('pdftotext failed: %s\n'%e)
print(json.dumps(out))
