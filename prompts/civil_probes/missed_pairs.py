import sqlite3, sys, math, numpy as np
name, db, pairs = sys.argv[1], sys.argv[2], [p.split('x') for p in sys.argv[3].split(',')]
m=sqlite3.connect(db)
rows=m.execute("select t.guid,m.discipline,t.center_x,t.center_y,t.center_z,t.rotation_z,t.bbox_x,t.bbox_y,t.bbox_z,i.geometry_hash from element_transforms t join elements_meta m using(guid) join element_instances i using(guid)").fetchall()
cache={}; D={}
for guid,d,cx,cy,cz,rz,bx,by,bz,h in rows:
    if h not in cache:
        r=m.execute("select vertices from component_geometries where geometry_hash=?",(h,)).fetchone()
        cache[h]=np.frombuffer(r[0],dtype=np.float32).reshape(-1,3).astype(float) if r and r[0] else None
    a=cache[h]
    if a is None: continue
    c,s=math.cos(rz or 0),math.sin(rz or 0)
    x=a[:,0]*c-a[:,1]*s; y=a[:,0]*s+a[:,1]*c; z=a[:,2]
    ctr=np.array([cx,cy,cz]); half=np.array([bx,by,bz])/2
    D.setdefault(d,[]).append((ctr-half,ctr+half,ctr+[x.min(),y.min(),z.min()],ctr+[x.max(),y.max(),z.max()]))
def ov(amin,amax,bmin,bmax):
    return np.all((amin[:,None,:]<=bmax[None,:,:])&(bmin[None,:,:]<=amax[:,None,:]),axis=2)
for A,B in pairs:
    if A not in D or B not in D: print(f"{name} {A}x{B}: VACUOUS"); continue
    a=[np.array(z) for z in zip(*D[A])]; b=[np.array(z) for z in zip(*D[B])]
    idx=0; tru=0; missed=0; extra=0
    for k in range(0,len(a[0]),500):
        sl=slice(k,k+500)
        I=ov(a[0][sl],a[1][sl],b[0],b[1]); T=ov(a[2][sl],a[3][sl],b[2],b[3])
        idx+=I.sum(); tru+=T.sum(); missed+=(T&~I).sum(); extra+=(I&~T).sum()
    print(f"{name} {A}x{B}: n={len(a[0])}x{len(b[0])} index-box pairs={idx} true-box pairs={tru} MISSED(true overlap, index says apart)={missed} phantom(index overlap, true apart)={extra}")
