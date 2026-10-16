#!/usr/bin/env python3
# POC: does the AUTHORED IFC data actually solve the midair election?
# Shortest possible test. No new physics. Read the log.
import sys, ifcopenshell
F = sys.argv[1]
TARGET = "2O2Fr$t4X7Zf8NOew3FNhv"          # the traced floating wall (4D_BAR_MODEL trace)
ELECTED = "1hOSvn6df7F8_7GcBWlRqU"          # IfcSlab 3m ABOVE it — what the shipped pool elects
f = ifcopenshell.open(F)
print(f"§POC_FILE {F.split('/')[-1]}  schema={f.schema}")

# ── 1. CONNECTIVITY COVERAGE ────────────────────────────────────────────────
for t in ("IfcRelConnectsElements","IfcRelConnectsPathElements","IfcRelConnectsWithRealizingElements"):
    try: n = len(f.by_type(t))
    except: n = 0
    print(f"§POC_REL {t:38} n={n}")

# ── 2. LoadBearing COVERAGE (the property the pool proxy stands in for) ─────
prods = f.by_type("IfcBuildingElement")
lb_true = lb_false = lb_absent = 0
lb_by_cls = {}
for p in prods:
    val = None
    for rel in getattr(p, "IsDefinedBy", []) or []:
        if not rel.is_a("IfcRelDefinesByProperties"): continue
        pset = rel.RelatingPropertyDefinition
        if not pset.is_a("IfcPropertySet"): continue
        for pr in pset.HasProperties or []:
            if pr.Name == "LoadBearing" and hasattr(pr, "NominalValue") and pr.NominalValue is not None:
                val = bool(pr.NominalValue.wrappedValue)
    if val is True:  lb_true += 1
    elif val is False: lb_false += 1
    else: lb_absent += 1; continue
    c = p.is_a()
    d = lb_by_cls.setdefault(c, [0,0]); d[0 if val else 1] += 1
tot = len(prods)
print(f"§POC_LOADBEARING elements={tot} true={lb_true} false={lb_false} absent={lb_absent} "
      f"coverage={100.0*(lb_true+lb_false)/tot:.1f}%")
for c in sorted(lb_by_cls, key=lambda k:-sum(lb_by_cls[k])):
    print(f"    {c:28} loadBearing=True:{lb_by_cls[c][0]:5}  False:{lb_by_cls[c][1]:5}")

# ── 3. THE DECISIVE TEST — what does the IFC say about the traced pair? ─────
def lb(g):
    try: p = f.by_guid(g)
    except: return None, None
    v = None
    for rel in getattr(p, "IsDefinedBy", []) or []:
        if rel.is_a("IfcRelDefinesByProperties"):
            ps = rel.RelatingPropertyDefinition
            if ps.is_a("IfcPropertySet"):
                for pr in ps.HasProperties or []:
                    if pr.Name == "LoadBearing" and getattr(pr,"NominalValue",None) is not None:
                        v = bool(pr.NominalValue.wrappedValue)
    return p.is_a(), v
tc, tv = lb(TARGET); ec, ev = lb(ELECTED)
print(f"§POC_TRACED   target  {TARGET} cls={tc} LoadBearing={tv}")
print(f"§POC_TRACED   elected {ELECTED} cls={ec} LoadBearing={ev}")
