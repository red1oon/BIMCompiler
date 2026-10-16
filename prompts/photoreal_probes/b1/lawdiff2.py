import re,itertools
S='/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad/'
TAGS=('§SOURCED_LIGHT_CALIB','§METER','§METER_HIST','§LUX_CHECK','§LUX_CHECK_CAM','§COVE_LIGHT','§LAMP_EN','§TONEMAPPING')
def norm(l): l=re.sub(r'\b(\w*[mM]s)=[0-9.]+','\\1=_',l); return re.sub(r'\(types \d+\)','(types _)',l)
def pick(f):
    out=[]
    for l in open(S+f):
        m=re.match(r'(§[A-Z_0-9]+)',l)
        if m and m.group(1).startswith(TAGS) and not m.group(1).startswith('§METER_ADAPT_X'): out.append(norm(l.rstrip('\n')))
    return out
def cmp(x,y):
    a,b=pick(x),pick(y); d=[i for i,(p,q) in enumerate(zip(a,b)) if p!=q]
    return len(a),len(b),d,a,b
for bld in ['hospital','clinic','terminal']:
    runs={'A1':'law_8634_%s.txt'%bld,'A2':'law_8634_%s_r2.txt'%bld,'B1':'law_8635_%s.txt'%bld,'B2':'law_8635_%s_r2.txt'%bld}
    for p,q in [('A1','A2'),('B1','B2'),('A1','B1'),('A2','B2'),('A1','B2'),('A2','B1')]:
        try: na,nb,d,a,b=cmp(runs[p],runs[q])
        except Exception as e: print(bld,p,q,'ERR',e); continue
        tags=sorted(set(re.match(r'(§[A-Z_0-9]+)',a[i]).group(1) for i in d)) if d else []
        print(bld,p,'vs',q,'lines',na,nb,'identical' if (na==nb and not d) else 'differ '+str(len(d))+' '+','.join(tags))
