import sqlite3, math, statistics as st
from collections import defaultdict, Counter
DB='/home/red1/bim-ootb/buildings/LTU_AHouse_extracted.db'
c=sqlite3.connect(DB)
def rows(cls):
    return c.execute("""SELECT m.guid,m.element_name,m.element_type,m.storey,
        t.center_x,t.center_y,t.center_z,t.bbox_x,t.bbox_y,t.bbox_z
        FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid WHERE m.ifc_class=?""",(cls,)).fetchall()
ops=rows('IfcOpeningElement'); doors=rows('IfcDoor'); wins=rows('IfcWindow')
CELL=1.0
def build(items):
    g=defaultdict(list)
    for o in items: g[(int(o[4]//CELL),int(o[5]//CELL),int(o[6]//CELL))].append(o)
    return g
def near(g,p,tol):
    cx,cy,cz=p[4],p[5],p[6]
    for dx in(-1,0,1):
        for dy in(-1,0,1):
            for dz in(-1,0,1):
                for o in g[(int(cx//CELL)+dx,int(cy//CELL)+dy,int(cz//CELL)+dz)]:
                    if math.dist((cx,cy,cz),(o[4],o[5],o[6]))<=tol: return o
    return None
gd,gw=build(doors),build(wins)
un=[o for o in ops if not near(gd,o,1.0) and not near(gw,o,1.0)]
print(f"§LTUOPEN_1 openings={len(ops)}  door-hosted={sum(1 for o in ops if near(gd,o,1.0))}  window-hosted={sum(1 for o in ops if near(gw,o,1.0))}  UNHOSTED={len(un)}")
w=[max(o[7],o[8]) for o in un]; h=[o[9] for o in un]
print(f"§LTUOPEN_2 unhosted maxHoriz median={st.median(w):.2f}m p90={sorted(w)[9*len(w)//10]:.2f}m | height median={st.median(h):.2f}m p90={sorted(h)[9*len(h)//10]:.2f}m")
big=[o for o in un if max(o[7],o[8])>=0.8 and o[9]>=1.8]
print(f"§LTUOPEN_3 unhosted that are DOORWAY-SIZED (>=0.8m wide AND >=1.8m tall) = {len(big)}/{len(un)}   <- candidate doorless archways")
small=sum(1 for o in un if max(o[7],o[8])<0.4)
print(f"§LTUOPEN_4 unhosted tiny (<0.4m, MEP penetration shaped) = {small}/{len(un)}")
print("§LTUOPEN_5 unhosted by storey:", dict(Counter(o[3] for o in un).most_common(8)))
print("§LTUOPEN_6 doorway-sized-unhosted by storey:", dict(Counter(o[3] for o in big).most_common(8)))
nm=Counter((o[2] or o[1] or '?') for o in big).most_common(8)
print("§LTUOPEN_7 doorway-sized-unhosted names:", nm)
# floor-level check for the balcony hypothesis: bottom of opening vs storey min door bottom
by=defaultdict(list)
for d in doors: by[d[3]].append(d[6]-d[9]/2)
for s,v in sorted(by.items()):
    fl=st.median(v)
    ub=[o for o in big if o[3]==s and abs((o[6]-o[9]/2)-fl)<0.5]
    print(f"§LTUOPEN_8 {s}: floorZ~{fl:.2f}  doorway-sized unhosted AT floor level = {len(ub)}")
