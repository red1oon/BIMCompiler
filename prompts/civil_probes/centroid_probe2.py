import sqlite3, sys, math, numpy as np
name, meta, geo = sys.argv[1], sys.argv[2], sys.argv[3]
m=sqlite3.connect(meta); g=sqlite3.connect(geo)
cols=[r[1] for r in m.execute("pragma table_info(element_transforms)")]
tr=m.execute("select guid,center_x,center_y,center_z,rotation_x,rotation_y,rotation_z,bbox_x,bbox_y,bbox_z from element_transforms").fetchall()
src = g if g.execute("select count(*) from sqlite_master where name='element_instances'").fetchone()[0] else m
inst=dict(src.execute("select guid,geometry_hash from element_instances").fetchall())
cache={}; shift=[]; size=[]; over=[]; rotxy=0; nog=0
for guid,cx,cy,cz,rx,ry,rz,bx,by,bz in tr:
    if (rx or 0)!=0 or (ry or 0)!=0: rotxy+=1
    h=inst.get(guid)
    if h not in cache:
        r=g.execute("select vertices from component_geometries where geometry_hash=?",(h,)).fetchone() if h else None
        cache[h]=None if (not r or r[0] is None or len(r[0])==0) else np.frombuffer(r[0],dtype=np.float32).reshape(-1,3).astype(float)
    a=cache[h]
    if a is None: nog+=1; continue
    c,s=math.cos(rz or 0),math.sin(rz or 0)
    x=a[:,0]*c-a[:,1]*s; y=a[:,0]*s+a[:,1]*c; z=a[:,2]
    tmin=np.array([x.min(),y.min(),z.min()]); tmax=np.array([x.max(),y.max(),z.max()])
    half=np.array([bx or 0,by or 0,bz or 0])/2
    shift.append(np.abs((tmin+tmax)/2).max())
    size.append(np.abs((tmax-tmin)-2*half).max())
    over.append(np.maximum(np.maximum(-half-tmin, tmax-half),0).max())
S,Z,O=map(np.array,(shift,size,over))
f=lambda A:f">1cm={int((A>0.01).sum())} >25cm={int((A>0.25).sum())} >1m={int((A>1).sum())} max={A.max():.2f}"
print(f"{name}: n={len(tr)} judged={len(O)} no_geom={nog} rotXY!=0:{rotxy}\n  SHIFT(centre≠box mid) {f(S)}\n  SIZE(stored≠mesh)    {f(Z)}\n  OVERHANG(true box outside index box) {f(O)}")
