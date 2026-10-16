import re,sys
S='/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad/'
TAGS=['§SOURCED_LIGHT_CALIB','§METER','§METER_HIST','§LUX_CHECK','§LUX_CHECK_CAM','§COVE_LIGHT','§LAMP_EN','§TONEMAPPING']
def norm(l): return re.sub(r'\b(ms|readMs|buildMs|passMs|marchMs|t|secs|facesMs|uploadMs|elapsed)=[0-9.]+','\\1=_',l)
def pick(f):
    out=[]
    for l in open(S+f):
        l=l.rstrip('\n')
        m=re.match(r'(§[A-Z_]+)',l)
        if not m: continue
        t=m.group(1)
        if any(t==x or (x=='§LAMP_EN' and t.startswith('§LAMP_EN')) or (x=='§COVE_LIGHT' and t.startswith('§COVE_LIGHT')) for x in TAGS): out.append(norm(l))
    return out
for b in ['hospital','clinic','terminal']:
    a=pick('law_8634_%s.txt'%b); c=pick('law_8635_%s.txt'%b)
    same = a==c
    print(b,'lines',len(a),len(c),'IDENTICAL' if same else 'DIFF')
    if not same:
        import difflib
        for d in list(difflib.unified_diff(a,c,lineterm='',n=0))[:12]: print('   ',d[:300])
    law=[l for l in open(S+'law_8635_%s.txt'%b) if l.startswith('§LIGHT_LAW')]
    for l in law[:4]: print('   ',l.strip()[:260])
    mets=[l for l in open(S+'law_8635_%s.txt'%b) if l.startswith('§METER camera')]
    for l in mets: print('    METER', re.search(r'exposure=[0-9.]+',l).group(0))
