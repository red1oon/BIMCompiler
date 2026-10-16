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
big=[o for o in un if max(o[7],o[8])>=0.8 and o[9]>=1.8]
floors={}
for d in doors: floors.setdefault(d[3],[]).append(d[6]-d[9]/2)
FL={s:st.median(v) for s,v in floors.items()}
print("§ARCH_0 floor levels from door sills:", {s:round(z,2) for s,z in sorted(FL.items(),key=lambda kv:kv[1])})
tot=0
for s,z in sorted(FL.items(),key=lambda kv:kv[1]):
    at=[o for o in big if abs((o[6]-o[9]/2)-z)<0.6]
    tot+=len(at)
    if at:
        ws=[max(o[7],o[8]) for o in at]
        print(f"§ARCH_1 {s} floorZ={z:.2f}  floor-level doorway-sized voids with NO door and NO window = {len(at)}"
              f"  width median={st.median(ws):.2f}m max={max(ws):.2f}m")
    else:
        print(f"§ARCH_1 {s} floorZ={z:.2f}  floor-level doorway-sized voids = 0")
print(f"§ARCH_2 TOTAL floor-level doorless archway candidates on LTU = {tot}  (doc's §SPINE2_OPEN said openThresholdLinks=5)")
# how wide are the very wide ones -> balcony / open front?
wide=[o for o in big if max(o[7],o[8])>=2.0]
print(f"§ARCH_3 unhosted voids >=2.0m wide = {len(wide)}  (widths: {sorted(round(max(o[7],o[8]),1) for o in wide)[-12:]})")
