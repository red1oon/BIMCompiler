import ifcopenshell,ifcopenshell.geom,collections,sys,re
f=ifcopenshell.open(sys.argv[1]); print('§IFC schema',f.schema,'project',f.by_type('IfcProject')[0].Name)
cnt=collections.Counter(e.is_a() for e in f.by_type('IfcBuildingElement')); print('§IFC counts',dict(cnt))
st=ifcopenshell.geom.settings(); st.set('use-world-coords',True); st.set('disable-opening-subtractions',True)   # booleans with many voids are NOT deterministic run to run in this IfcOpenShell (measured: wall zmin 0.0 vs 0.15 on the same file); the bbox must not depend on them
for cls in ('IfcWall','IfcSlab','IfcColumn','IfcDoor','IfcWindow','IfcRoof'):
    mn=[1e9]*3; mx=[-1e9]*3; ok=0; bad=0
    for e in f.by_type(cls):
        try: sh=ifcopenshell.geom.create_shape(st,e); g=sh.geometry; v=tuple(g.verts); ok+=1   # keep the shape alive: reading .verts through the temporary reads freed memory (segfault 2-7 of 16 runs, garbage bboxes: §38)
        except Exception as ex: bad+=1; continue
        for i in range(0,len(v),3):
            for a in range(3): mn[a]=min(mn[a],v[i+a]); mx[a]=max(mx[a],v[i+a])
    print('§IFC bbox (m)',cls,'shapes ok',ok,'failed',bad,[round(x,3) for x in mn],[round(x,3) for x in mx])
# DETERMINISTIC bbox straight from the file: every body here is an IfcTriangulatedFaceSet (no extrusion) -> vertices x placement matrix; no geometry engine
import ifcopenshell.util.placement as PL
for cls in ('IfcWall','IfcSlab','IfcColumn','IfcDoor','IfcWindow','IfcRoof'):
    mn=[1e9]*3; mx=[-1e9]*3; n=0
    for e in f.by_type(cls):
        M=PL.get_local_placement(e.ObjectPlacement)
        for r in (e.Representation.Representations if e.Representation else []):
            for it in r.Items:
                if it.is_a()!='IfcTriangulatedFaceSet': continue
                n+=1
                for c in it.Coordinates.CoordList:
                    x,y,z=c; X=[M[0][0]*x+M[0][1]*y+M[0][2]*z+M[0][3],M[1][0]*x+M[1][1]*y+M[1][2]*z+M[1][3],M[2][0]*x+M[2][1]*y+M[2][2]*z+M[2][3]]
                    for a in range(3): mn[a]=min(mn[a],X[a]); mx[a]=max(mx[a],X[a])
    print('§IFC DIRECT bbox (m)',cls,'facesets',n,[round(float(v),3) for v in mn],[round(float(v),3) for v in mx])
# the storey's walls alone: the gable-end walls rising to the roof (§32) stand on the Roof storey and would hide a change in the plan's envelope
mn=[1e9]*3; mx=[-1e9]*3; n=0
for e in f.by_type('IfcWall'):
    M=PL.get_local_placement(e.ObjectPlacement); P=[]
    for r in (e.Representation.Representations if e.Representation else []):
        for it in r.Items:
            if it.is_a()=='IfcTriangulatedFaceSet':
                for x,y,z in it.Coordinates.CoordList: P.append([M[0][0]*x+M[0][1]*y+M[0][2]*z+M[0][3],M[1][0]*x+M[1][1]*y+M[1][2]*z+M[1][3],M[2][0]*x+M[2][1]*y+M[2][2]*z+M[2][3]])
    if P and max(p[2] for p in P)<=3.1501:
        n+=1
        for p in P:
            for a in range(3): mn[a]=min(mn[a],p[a]); mx[a]=max(mx[a],p[a])
print('§IFC DIRECT bbox (m) StoreyWalls facesets',n,[round(float(v),3) for v in mn],[round(float(v),3) for v in mx])
try:
    import ifcopenshell.validate as V, logging
    class L:
        def __init__(s): s.n=0; s.m=[]
        def set_state(s,*a): pass
        def error(s,m,*a,**k): s.n+=1; s.m.append(' '.join(str(x) for x in (m,)+a)[:400])
        def warning(s,*a,**k): pass
        def info(s,*a,**k): pass
        def debug(s,*a,**k): pass
        def status(s,*a,**k): pass
    l=L(); V.validate(f,l); print('§IFC validate errors',l.n,'by entity + attribute',dict(collections.Counter(' '.join(re.findall(r'=(Ifc\w+)\(|attribute (\w+)\?',t) and [x[0] or x[1] for x in re.findall(r'=(Ifc\w+)\(|attribute (\w+)\?',t)]) for t in l.m)))
except Exception as ex: print('§IFC validate unavailable',repr(ex)[:200])
