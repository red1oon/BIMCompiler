#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §39 — which of this run's families the library export holds, and the SQL for those it lacks. Generating is not publishing: this writes a local file. Read the log.
# Usage: family_stage.py <rosetta.effective.json> <template.json> <lib dir> <out families_new.sql>
import sys,json,os,subprocess,gzip
rj,tj,lib,out=sys.argv[1:5]; R=json.load(open(rj)); B=R['library_binding']; here=os.path.dirname(os.path.abspath(__file__))
def rd(p):
    b=open(p,'rb').read(); return json.loads(gzip.decompress(b) if b[:2]==b'\x1f\x8b' else b)
L=rd(os.path.join(lib,'latest.json')); key=[v for k,v in L.items() if isinstance(v,str) and v.endswith('index.json')] or [L.get('index') or (L.get('sha')+'/index.json' if L.get('sha') else '')]; idx=rd(os.path.join(lib,key[0])); have={f['family_id'] for f in idx['rows']['ad_opening_family']}
miss={'D':[],'W':[]}
for k in sorted(q for q in B if q[0] in 'DW' and q[1:].isdigit()):
    g=B[k]['family'] not in have; print('§FAM',k,B[k]['family'],'GENERATED' if g else 'LIBRARY',flush=True)
    if g: miss[k[0]].append(k)
o=''
for kind,gen in (('D','gen_door_families.py'),('W','gen_window_families.py')):
    if miss[kind]: o+=subprocess.run([sys.executable,'-I',os.path.join(here,gen),rj,tj,','.join(miss[kind])],capture_output=True,text=True,check=True).stdout
open(out,'w',encoding='utf-8').write(o); print('§FAM RESULT generated',miss['D']+miss['W'],'wrote' if o else 'nothing to write',out if o else '','| NOT on the live library until a publish is decided' if o else '',flush=True)
