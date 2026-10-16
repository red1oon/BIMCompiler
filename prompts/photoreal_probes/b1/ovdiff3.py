import re,collections
S='/tmp/claude-1000/-home-red1-bim-compiler/cdf78573-99d9-42cf-92e2-f64ba3732e60/scratchpad/'
def lines(f):
    L=[re.sub(r'^\[con\] ','',re.sub(r'^\S+ \+\s*[\d.]+s ','',l.rstrip('\n'))) for l in open(S+f,errors='replace')]
    i=max(k for k,l in enumerate(L) if l.startswith('§CLI_BAKE_SW_PURGE')); return L[i+1:]   # only the page the bake actually ran
OV=re.compile(r'^(§CLASH_\w*|§MEASURE_\w*|§FINDINGS_\w*|§HUD_\w*|§CPE_REVEAL\w*|§CPE_TAIL\w*|§LOADPATH_\w*|§ROOM_TITLE\w*|§CAPTION\w*|§LABEL\w*|§FLYTHRU_\w*|§RULE_FIL\w*|§RULE_FINDINGS\w*|§BILLBOARD\w*|§STOREY_REVEAL\w*|§FILM_BOXES\w*|§SLAB_BEAT\w*|§LINEAR_BEAT\w*|§INDOOR_BEATS\w*|§FLYOUT_BEATS\w*|§ESCAPE_ROUTE\w*|§LEDGER_TICKER\w*)')
def T(l): l=re.sub(r'\b(\w*[mM]s|msPerPair|secs?|elapsed|time|wall\w*)=[0-9.]+(ms)?','\\1=_',l); l=re.sub(r'in [0-9.]+ms','in _ms',l); return l
EXCL=('§LOADPATH_PIXEL_DIAG_PRE_HUD','§CLASH_MEM')
def ovl(L): return [T(l) for l in L if OV.match(l) and not l.startswith(EXCL)]
A,B=lines('film_law_v2.log'),lines('film_law_base.log')
for X,Y,n in [(A,B,'A2-B1')]:
    x,y=ovl(X),ovl(Y); cx=collections.Counter(re.match(r'(§\w+)',l).group(1) for l in x); cy=collections.Counter(re.match(r'(§\w+)',l).group(1) for l in y)
    dif=sum(1 for p,q in zip(x,y) if p!=q)+abs(len(x)-len(y))
    print(n,'overlay lines',len(x),len(y),'tags',len(cy),'countDiff',{k:(cx[k],cy[k]) for k in set(cx)|set(cy) if cx[k]!=cy[k]},'lineDiffs',dif)
    for p,q in [(p,q) for p,q in zip(x,y) if p!=q][:3]: print('   A:',p[:220]); print('   B:',q[:220])
    px=[l for l in X if l.startswith('§LOADPATH_PIXEL_DIAG_PRE_HUD')][:1]; py=[l for l in Y if l.startswith('§LOADPATH_PIXEL_DIAG_PRE_HUD')][:1]
    print('  excluded §LOADPATH_PIXEL_DIAG_PRE_HUD (scene pixels sampled BEFORE the HUD = exposure-dependent):', px[0][:110] if px else None, '|', py[0][:110] if py else None)
print('tags judged:', sorted(set(re.match(r'(§\w+)',l).group(1) for l in ovl(B))))
