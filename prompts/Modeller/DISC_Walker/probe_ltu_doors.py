import sqlite3, math, sys
DB=sys.argv[1] if len(sys.argv)>1 else '/home/red1/bim-ootb/buildings/LTU_AHouse_extracted.db'
tag=sys.argv[2] if len(sys.argv)>2 else 'LTU'
c=sqlite3.connect(DB)
def rows(cls):
    return c.execute("""SELECT m.guid,m.element_name,m.element_type,m.storey,
                        t.center_x,t.center_y,t.center_z,t.bbox_x,t.bbox_y,t.bbox_z,t.rotation_z
                        FROM elements_meta m JOIN element_transforms t ON t.guid=m.guid
                        WHERE m.ifc_class=?""",(cls,)).fetchall()
doors=rows('IfcDoor'); ops=rows('IfcOpeningElement'); wins=rows('IfcWindow')
print(f"§LTUDOOR_1 {tag} doors={len(doors)} openings={len(ops)} windows={len(wins)}")

# door width proxy: max horizontal bbox extent
import statistics as st
w=[max(d[7],d[8]) for d in doors]; h=[d[9] for d in doors]
if w:
    print(f"§LTUDOOR_2 {tag} door bbox maxHoriz median={st.median(w):.2f}m p10={sorted(w)[len(w)//10]:.2f} p90={sorted(w)[9*len(w)//10]:.2f} | height median={st.median(h):.2f}m")
    print(f"§LTUDOOR_3 {tag} doors with maxHoriz<0.6m = {sum(1 for x in w if x<0.6)}/{len(w)}  (a real door leaf is >=0.7m)")

# co-location: opening whose centre is within tol of a door centre
if ops:
    from collections import defaultdict
    grid=defaultdict(list)
    CELL=1.0
    for o in ops:
        grid[(int(o[4]//CELL),int(o[5]//CELL),int(o[6]//CELL))].append(o)
    def near(d,tol):
        best=None
        cx,cy,cz=d[4],d[5],d[6]
        for dx in(-1,0,1):
            for dy in(-1,0,1):
                for dz in(-1,0,1):
                    for o in grid[(int(cx//CELL)+dx,int(cy//CELL)+dy,int(cz//CELL)+dz)]:
                        dist=math.dist((cx,cy,cz),(o[4],o[5],o[6]))
                        if dist<=tol and (best is None or dist<best[0]): best=(dist,o)
        return best
    for tol in (0.3,0.6,1.0):
        hit=sum(1 for d in doors if near(d,tol))
        print(f"§LTUDOOR_4 {tag} doors with an IfcOpeningElement centre within {tol}m = {hit}/{len(doors)} ({100*hit/len(doors):.1f}%)")
    # matched opening dimensions
    m=[near(d,1.0) for d in doors]; m=[x[1] for x in m if x]
    if m:
        ow=[max(o[7],o[8]) for o in m]; oh=[o[9] for o in m]
        print(f"§LTUDOOR_5 {tag} matched-opening maxHoriz median={st.median(ow):.2f}m height median={st.median(oh):.2f}m  n={len(m)}")
    # windows too, to show openings are not door-specific
    hw=sum(1 for d in wins if near(d,1.0))
    print(f"§LTUDOOR_6 {tag} windows with an opening within 1.0m = {hw}/{len(wins)}")
    unmatched=len(ops)-len(set(id(x) for x in m))
    print(f"§LTUDOOR_7 {tag} openings NOT matched to any door = ~{len(ops)-len(m)} of {len(ops)}")
