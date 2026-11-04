#!/usr/bin/env python3 -I
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §36 — rooms on THIS drawing: each preset room's cell at this run's grid, its tag found in it, the printed area compared with what is expected there. Writes the rooms into the effective dictionary. Read the log.
# Usage: read_rooms.py <plan.svg> <rosetta.json> <template.json> <pdf> <06_emit log> <out rosetta.effective.json>
import sys,json,os,copy
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import type_template as TT, tag_reader as TR
svg,rj,tj,pdf,elog,outj=sys.argv[1:7]; R=json.load(open(rj)); T=TT.load(tj); RT=T['ruler']['room_tag']; K=R['sheet']['mm_per_pt_fitted']; gx,gy=R['grid']['x'],R['grid']['y']; log=lambda *a:print('§ROOMS',*a,flush=True)
P=TT.stroked_paths(svg); xa,y5=TT.plan_origin(pdf,R,T); W=TT.words(pdf,T['sheets']['plan']); B=TT.room_tags(P,T,K,TT.plan_frame(W,R,T)); log('tags found',len(B),'rooms preset',len(R['rooms']))
if not B: log('VACUOUS no tag box on the plan')
A,stray=TT.assign_tags(B,R,xa,y5,K)
for b in stray: log('FINDING a tag in no preset cell at mm',round(b['cx']),round(b['cy']))
G=TT.load_glyphs(T,tj); pw=TT.porch_width(elog); nom=[r.get('printed_nominal',r['printed_sqm']) for r in R['rooms']]; n=dict(READ=0,FINDING=0,DEFAULT=0)
for r,nv in zip(R['rooms'],nom):
    ex,ey=TT.room_extent(r,R); dy=ey[1]-ey[0]
    if ex is not None: dx=ex[1]-ex[0]
    else: dx=TT.decide('room_width_'+r['name'].replace(' ','_'),pw,dict(nominal=r['x_mm'],tol_mm=T['ruler']['grid_tol_mm']),'the two A-COLS column centres',module=T['ruler']['grid_module_mm'])['value']; r['x_mm']=dx
    cell='%.2f'%(dx*dy/1e6); tags=A[r['name']]; st='DEFAULT'; val=None; note=''
    if len(tags)!=1: note='FINDING cell holds %d tags'%len(tags); log(note,'|',r['name'])
    elif tags[0]['xm'] is None: note='no divider in the tag'
    else:
        b=tags[0]; cands={'%.2f'%v for v in nom if v is not None}|{cell}
        xs=[(a,c) for a in gx.values() for c in gx.values() if a<c and a<=b['cx']<=c]; ys=[(a,c) for a in gy.values() for c in gy.values() if a<c and a<=b['cy']<=c]
        rect={'%.2f'%((x[1]-x[0])*(y[1]-y[0])/1e6):(x,y) for x in xs for y in ys}; cands|=set(rect)
        c=TR.choose(TT.cell_ink(P,TT.area_cell(b),T,K),sorted(cands),G,RT['read_max_mm'],RT['margin_mm'])
        note='best %s %s next %s %s candidates %d'%(c.get('best'),c.get('score'),c.get('next'),c.get('next_score'),len(cands))
        if c['value'] is not None:
            val=float(c['value']); st='READ' if c['value']==cell else 'FINDING'
            if st=='FINDING' and c['value'] in rect: note+=' also fits the grid rectangle %s x %s'%rect[c['value']]
    n[st]+=1; r['printed_nominal']=nv; r['printed_sqm']=val; r['printed_status']=st; r['cell_sqm']=float(cell)
    print('§ROOM',st,'printed',val,'cell',cell,'dx',dx,'dy',dy,'|',r['name'],'|',note,flush=True)
    print('§PDF R1',r['name'],'area',cell,'printed',val,'MATCH' if st=='READ' else ('MISMATCH' if st=='FINDING' else 'NOT_MADE_OUT'),flush=True)
json.dump(R,open(outj,'w',encoding='utf-8'),ensure_ascii=False,indent=1); log('RESULT',n,'stray',len(stray),'wrote',outj)
