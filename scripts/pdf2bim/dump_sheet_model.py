#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §41 — the sheet model every stage reads, as JSON, taken from the same pdftocairo SVG and pdftotext boxes the Python chain reads, in file order, numbers unrounded. Issue: the JS rules must see exactly what the Python rules see, so a byte difference in the sheets can only be a rule's.
# Usage: dump_sheet_model.py <svg dir> <pdf> <out.json>
import re,sys,json,subprocess,os
sd,pdf,out=sys.argv[1:4]; M={'pages':{}}
for f in sorted(os.listdir(sd),key=lambda n:int(re.search(r'\d+',n).group())):
    p=re.search(r'p(\d+)\.svg',f).group(1); paths=[]
    for m in re.finditer(r'<path ([^>]*?)/>',open(os.path.join(sd,f)).read()):
        a=m.group(1)
        if 'stroke="' not in a or ' d="' not in a: continue
        t=re.search(r'transform="matrix\(([^)]*)\)"',a); s=re.search(r'stroke-width="([\d.]+)"',a); c=re.search(r'stroke="rgb\(([^)]*)\)"',a)
        paths.append(dict(d=re.search(r' d="([^"]*)"',a).group(1),m=[float(x) for x in t.group(1).split(',')] if t else [1,0,0,1,0,0],sw=float(s.group(1)) if s else None,col=c.group(1) if c else None))
    b=subprocess.run(['pdftotext','-f',p,'-l',p,'-bbox',pdf,'-'],capture_output=True,text=True,check=True).stdout
    M['pages'][p]=dict(paths=paths,words=[[w[4],float(w[0]),float(w[1]),float(w[2]),float(w[3])] for w in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>',b)])
json.dump(M,open(out,'w'),separators=(',',':')); print('§MODEL pages',len(M['pages']),'paths',{k:len(v['paths']) for k,v in M['pages'].items()},'wrote',out)
