import sqlite3, math, numpy as np, collections
db=sqlite3.connect('/home/red1/Downloads/JALAN JELAPANG IFC/JELAPANG_AFTER.db')
def world(guid):
    cx,cy,cz,rz,h=db.execute("select t.center_x,t.center_y,t.center_z,t.rotation_z,i.geometry_hash from element_transforms t join element_instances i using(guid) where guid=?",(guid,)).fetchone()
    a=np.frombuffer(db.execute("select vertices from component_geometries where geometry_hash=?",(h,)).fetchone()[0],dtype=np.float32).reshape(-1,3).astype(float)
    c,s=math.cos(rz or 0),math.sin(rz or 0)
    x=a[:,0]*c-a[:,1]*s; y=a[:,0]*s+a[:,1]*c
    return np.c_[x+cx,y+cy,a[:,2]+cz]
road=[r[0] for r in db.execute("select guid from elements_meta where discipline='ROAD'")]
rv={}
for gd in road: rv[gd]=world(gd)
rbox={gd:(v[:,0].min(),v[:,0].max(),v[:,1].min(),v[:,1].max()) for gd,v in rv.items()}
signs=db.execute("select m.guid,(select value from element_psets p where p.guid=m.guid and p.name='17_Code'),(select value from element_psets p where p.guid=m.guid and p.name='16_Name') from elements_meta m where discipline='SIGNAGE'").fetchall()
out=[]
for gd,code,name in signs:
    v=world(gd); z0,z1=v[:,2].min(),v[:,2].max()
    # horizontal extent per 5cm slice along the sign's principal plan axis
    xy=v[:,:2]-v[:,:2].mean(0); u,s_,vt=np.linalg.svd(xy,full_matrices=False); ax=vt[0]
    t=xy@ax
    W=t.max()-t.min()
    bins=np.arange(z0,z1+0.05,0.05); widths=[]
    for b in bins:
        m=(v[:,2]>=b)&(v[:,2]<b+0.05)
        widths.append(t[m].max()-t[m].min() if m.sum()>1 else 0)
    widths=np.array(widths)
    face=np.where(widths>=0.5*W)[0]
    fb=bins[face[0]] if len(face) else None
    sx,sy=v[:,0].mean(),v[:,1].mean()
    best=None
    for rg,(x0,x1,y0,y1) in rbox.items():
        if x0-15<sx<x1+15 and y0-15<sy<y1+15:
            rvv=rv[rg]; d=np.hypot(rvv[:,0]-sx,rvv[:,1]-sy); i=d.argmin()
            if best is None or d[i]<best[0]: best=(d[i],rvv[i,2],rg)
    out.append((code,name,round(W,2),round(z1-z0,2),fb,best))
cnt=collections.Counter()
for code,name,W,H,fb,best in out:
    if best is None or fb is None: cnt['nojudge']+=1; continue
    hgt=fb-best[1]
    cnt['lt1.5' if hgt<1.5 else 'lt1.8' if hgt<1.8 else 'lt2.2' if hgt<2.2 else 'ge2.2']+=1
print(cnt)
for o in sorted(out,key=lambda o:(o[0] or ''))[:40]:
    code,name,W,H,fb,best=o
    print(code,'|',name,'| W',W,'H',H,'| face_bottom_above_road', None if (fb is None or best is None) else round(fb-best[1],2),'| road_dist', None if best is None else round(best[0],2))
