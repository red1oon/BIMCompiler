import json,sys,re
# summ.py <log>... : one row per log from §LIGHT_GRID / _WALL / _OPEN
def js(line,key):
    i=line.index(key)+len(key); d=0
    for j in range(i,len(line)):
        if line[j]=='{': d+=1
        elif line[j]=='}':
            d-=1
            if d==0: return json.loads(line[i:j+1])
print('| log | FLOOR(E +3cm) over/under/jump/medAbs/meanAbs | FLOOR(E25 field height) over/under/jump/meanAbs | WALL over/under/jump/medAbs/meanAbs | WALL vs En over/under/med | OPEN over/under/jump/meanAbs | OPEN underSomething n/over/F1 |')
for f in sys.argv[1:]:
    L=open(f,errors='ignore').read().splitlines()
    g=[l for l in L if l.startswith('§LIGHT_GRID bld')]; w=[l for l in L if l.startswith('§LIGHT_GRID_WALL')]; o=[l for l in L if l.startswith('§LIGHT_GRID_OPEN')]
    if not g: print('|',f,'| MISSING |'); continue
    F=js(g[0],' FLOOR '); W=js(w[0],'n) '); En=js(w[0],'vsEn(normal-hemisphere irradiance)='); O=js(o[0],'F = 1) '); U=js(o[0],'underSomething(upHit<15m)='); F25=js(g[0],'atFieldHeight(E25: truth at p+0.25m)=') if 'atFieldHeight' in g[0] else None; O25=js(o[0],'atFieldHeight(E25)=') if 'atFieldHeight' in o[0] else None
    f25='%d/%d/%d/%.4f'%(F25['skyOver'],F25['skyUnder'],F25['skyJump'],F25['meanAbsDF']) if F25 else '-'
    o25=' E25 %d/%d/%.4f'%(O25['skyOver'],O25['skyUnder'],O25['meanAbsDF']) if O25 else ''
    print(('| %s | %d/%d/%d/%.4f/%.4f | '+f25+' | %d/%d/%d/%.4f/%.4f | %d/%d/%s | %d/%d/%d/%.4f'+o25+' | %d/%d/%d |')%(f.split('/')[-1],F['skyOver'],F['skyUnder'],F['skyJump'],F['medAbsDF'],F['meanAbsDF'],W['skyOver'],W['skyUnder'],W['skyJump'],W['medAbsDF'],W['meanAbsDF'],En['skyOver'],En['skyUnder'],En['medAbsDF'],O['skyOver'],O['skyUnder'],O['skyJump'],O['meanAbsDF'],U['n'],U['skyOver'],U['F1']))
