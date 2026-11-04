#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §21 — adds @VIEW=PLAN + @GRIDX/@GRIDY marks (from the Rosetta grid) to the emitted plan DXF. Usage: add_plan_marks.py <in.dxf> <rosetta.json> <out.dxf>
import sys,json
src,rj,dst=sys.argv[1:4]; R=json.load(open(rj)); d=open(src).read().split('\n')
mk=lambda x,y,t:['0','TEXT','8','DXF2BIM-MARK','10',str(x),'20',str(y),'30','0','40','150','1',t]
M=mk(-3000,-1000,'@VIEW=PLAN @BY=user')
for k,v in R['grid']['x'].items(): M+=mk(v,600,'@GRIDX=%s @BY=user'%k)
for k,v in R['grid']['y'].items(): M+=mk(-600,-v,'@GRIDY=%s @BY=user'%k)
j=max(k for k in range(len(d)-1) if d[k]=='ENDSEC' and d[k-1]=='0'); open(dst,'w').write('\n'.join(d[:j-1]+M+d[j-1:]))
