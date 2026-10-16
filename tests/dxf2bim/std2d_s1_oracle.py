# Oracle for witness_std2d_s1.js: dumps std2d.py's plan section contours (section_cut.py, the exact call write_plan makes) as JSON.
# Usage: python3 std2d_s1_oracle.py <Node model DB> <out.json>
import sys, os, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../2D_Layout/python'))
import std2d
from section_cut import section_cut

class L:
    def __call__(self, m): pass
    def gap(self, *a): pass

db, out = sys.argv[1], sys.argv[2]
model = std2d.load_model(db, L())
res = {}
for st in std2d.plan_storeys(model):
    cz = st['elev'] + std2d.CUT_OFFSET
    cut = [c for c in section_cut(db, cut_z=cz) if c.category == 'CUT' and c.ifc_class in std2d.PLAN_CUT_CLASSES]
    res[repr(cz)] = {c.guid: dict(cls=c.ifc_class, contours=[dict(outer=ct.is_outer, pts=[list(p) for p in ct.points]) for ct in c.contours]) for c in cut}
json.dump(dict(cut_z=res), open(out, 'w'))
print('storeys', len(res), 'elements', sum(len(v) for v in res.values()))
