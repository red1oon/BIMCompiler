#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — v2 gate: the cut has 0 illustration-card frames. Judged: beat table has no 'card' entries, no beat uses a generated card image, every screen is a rec/ twin/ legacy/ term: capture. Prints §FILM-MA-NOCARDS PASS|FAIL judged=N.
import beats_v2, re
j = f = 0
for kind, name, d in beats_v2.ITEMS:
    j += 1; ok = kind == 'beat' and re.match(r'(rec/|twin/|legacy:|term:)', d['screen']) is not None
    f += not ok; print(f"§FILM-MA-NOCARDS {name} {'OK' if ok else 'FAIL'} kind={kind} screen={d['screen']}")
print(f"§FILM-MA-NOCARDS {'INCONCLUSIVE' if not j else 'FAIL' if f else 'PASS'} judged={j} failed={f}")
