#!/usr/bin/env python3
# Implements prompts/PDF2BIM_VECTOR_PROBE.md §38 — W-D1..W-D5. Issue: do the house's doors fit: their p8 size, on their floor (§31: 5 floated 38 mm), inside a 100 mm wall (FD1 stood 150 deep), with heights read from the sheet and not typed back from the schedule? Reads the IFC's own triangles. Run WITHOUT -I.
# Usage: witness_doors.py <outdir> <rosetta.json> <scripts dir>
import sys,os,re,json,subprocess,tempfile,ifcopenshell
import ifcopenshell.util.placement as PL
O,rj,S=sys.argv[1:4]; S=os.path.abspath(S); R=json.load(open(rj)); f=ifcopenshell.open(os.path.join(O,'tbkltn_p1.ifc')); fails=0; SZ=R['schedule_sizes_mm']; I=json.load(open(os.path.join(O,'inferred.json'))); FFL=I['values']['ffl_above_ground']['value']/1000; WALL=I['values']['wall_thickness']['value']
def say(n,v,m):
    global fails
    if v not in('PASS','FINDING'): fails+=1
    print('§D',n,v,m,flush=True)
rd=lambda n:open(os.path.join(O,'logs',n),encoding='utf-8').read() if os.path.exists(os.path.join(O,'logs',n)) else ''
def bb(e):
    M=PL.get_local_placement(e.ObjectPlacement); o=[]
    for r in e.Representation.Representations:
        for it in r.Items:
            if it.is_a()=='IfcTriangulatedFaceSet':
                for x,y,z in it.Coordinates.CoordList: o.append(tuple(float(M[i][0]*x+M[i][1]*y+M[i][2]*z+M[i][3]) for i in range(3)))
    return [min(p[i] for p in o) for i in range(3)],[max(p[i] for p in o) for i in range(3)]
D=[bb(e) for e in f.by_type('IfcDoor')]; want=sum(len(v) for k,v in R['schedule_locations_p8'].items() if k[0]=='D'); sizes={tuple(v) for k,v in SZ.items() if k[0]=='D'}; rows=[]
if not D: say('W-D1','VACUOUS','no IfcDoor'); print('§D RESULT fails',fails); sys.exit(1)
for a,b in D:
    w=max(b[0]-a[0],b[1]-a[1])*1000; d=min(b[0]-a[0],b[1]-a[1])*1000; h=(b[2]-a[2])*1000; near=min(sizes,key=lambda s:abs(s[0]-w)+abs(s[1]-h)); rows.append(dict(w=round(w,1),h=round(h,1),d=round(d,1),near=near,z0=round(a[2],3),z1=round(b[2],3),ok=abs(near[0]-w)<=1 and abs(near[1]-h)<=1))
say('W-D1','PASS' if len(D)==want and all(r['ok'] for r in rows) else 'WRONG','%d doors (p8 locations %d), (width, height) %s, schedule %s'%(len(D),want,sorted({(r['w'],r['h']) for r in rows}),sorted(sizes)))
off=[r for r in rows if abs(r['z0']-FFL)>.001 or abs(r['z1']-FFL-r['near'][1]/1000)>.001]
say('W-D2','PASS' if not off else 'WRONG','every door on its floor: FFL %.3f, z %s, off %d (the §31 float was 0.188..2.288)'%(FFL,sorted({(r['z0'],r['z1']) for r in rows}),len(off)))
deep=max(r['d'] for r in rows); say('W-D3','PASS' if deep<=WALL+.5 else 'WRONG','deepest door %.1f mm, wall %s'%(deep,WALL))
m=re.search(r'§LIB fillGaps \d+ (\[.*)',rd('11_lib_probe.log')); dw=[g for g in json.loads(m.group(1)) if g.get('kind')=='door'] if m and m.group(1).rstrip().endswith(']') else None
if dw is None: say('W-D4','VACUOUS','the fill rows could not be read')
else:
    badh=[g for g in dw if abs(g.get('delta_h',0))>.005]; wide=[g for g in dw if abs(g.get('delta_w',0))>.005]
    say('W-D4','WRONG' if badh else ('FINDING' if wide else 'PASS'),'doors wider than their drawn gap %s (the drawing\'s own disagreement, kept), height rows %d'%([(g['type_id'],g['delta_w']) for g in wide],len(badh)))
hd=re.findall(r'^§INFER door_head_above_ffl (\w+) value (\S+) measured (\S+)',rd('08_elev_emit.log'),re.M); ff=re.findall(r'^§INFER door_frame_face (\w+) value (\S+) measured (\S+)',rd('08_elev_emit.log'),re.M); mk=re.search(r'§PDF S3 .*',rd('09_to_std.log'))
if not hd: say('W-D5','VACUOUS','no door head read from any elevation')
else:
    # the falsifier: a template stating another door height must give the sheet's value and FINDING, or the reading is only a copy of the template
    J=json.loads(json.dumps(I)); J['template']['blanks']['door_head_above_ffl']['nominal']=2400; t=tempfile.mkdtemp(); ij=os.path.join(t,'inferred.json'); json.dump(J,open(ij,'w')); T=I['template']['sheets']
    pdf=os.environ.get('PDF2BIM_PDF_USED') or ''; r=subprocess.run([sys.executable,'-I',os.path.join(S,'elev_emit.py'),os.path.join(O,'svg','p%s.svg'%T['elevations_a']),os.path.join(O,'svg','p%s.svg'%T['elevations_b']),os.path.join(O,'p1_extracted.dxf'),rj,t,pdf,ij],capture_output=True,text=True,cwd=O).stdout
    h2=re.findall(r'^§INFER door_head_above_ffl (\w+) value (\S+) measured (\S+)',r,re.M); ok=bool(hd); fals=bool(h2) and all(s=='FINDING' and abs(float(v)-float(me))<=50 for s,v,me in h2)
    say('W-D5','PASS' if ok and fals else ('NO-OP' if not h2 else 'WRONG'),'door heads read %s, frame faces %s, mark: %s | template says 2400: %s'%(hd,ff,mk.group(0)[-50:] if mk else None,h2))
print('§D RESULT fails',fails)
