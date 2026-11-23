# ⚠ DO NOT REMOVE — film "UAT, hands on" FILM I (prompts/FILM_UAT_GUIDE.md §5.28): old Parts I + II in one flow, guide rev (j). FILM_PLAN=plan1 selects it in compose.py.
# The scenes are plan.py's s1-s4 (the guide, What you need) then plan2.py's list (A3.1 Pack In, B0 marked by hand, Arrange, Convert, Export, the Viewer, B3.1, B5 with box 2).
# Dropped as repeats: plan.py's s5 (the ready-marked set) and s11/s12 (B5 without box 2). 'strip' = the guide's OWN words (compose.py stops the build on a strip not found).
# Only the lines that pointed at the other part ("as in part one", "the nine marked sheets") are rewritten here, by beat id. READ THE LOGS.
import copy, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import plan, plan2
MD = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'docs', 'CapexUATGuide.md'), encoding='utf8').read()
SCENES = copy.deepcopy([s for s in plan.SCENES if s['id'] in ('s1', 's2', 's3', 's4')] + plan2.SCENES)
NEW = {
  'b4c':  "The folder marked holds the answer key: the nine sheets, marked. You will mark your own copies of the sheets as drawn.",
  'q10a': "Convert: five hundred and eleven elements.",
  'q13a': "Box one, the pack. Box three, your database. Box five, the cost you copied.",
}
for s in SCENES:
    s['beats'] = [(b[0], b[1], NEW.get(b[0], b[2])) + tuple(b[3:]) for b in s['beats']]
for s in SCENES:   # the pack's own folders (sheets, marked, reference: the zip as the guide's link serves it) said when the folder opens
    if s['id'] == 's4': s['beats'].insert(2, ('b4b2', 's4_inside', "Inside: the sheets as drawn, the same sheets marked, and the reference database."))
for k in ('IDLE_X', 'IDLE_KEEP', 'CAMERA', 'SP'):
    if hasattr(plan2, k): globals()[k] = getattr(plan2, k)
TITLE = dict(kicker='UAT GUIDE · HANDS ON · PART I', line1='From the drawings to a priced model', line2='mark them, convert them, check your run', note='Every click is real: the real browser, the real file windows.')
CLOSING = dict(line1='Your own marks, checked mark for mark:', line2='do, confirm, tick.', credit='Voice: Kokoro (local) · key sounds: eklee, CC BY 3.0 · click: GNOME')
if __name__ == '__main__':
    ids = [b[0] for s in SCENES for b in s['beats']]; assert len(ids) == len(set(ids)), 'beat ids repeat'
    used = set(ids); assert all(k in used for k in NEW), 'a rewritten beat id is not in the list'
    print('§PLAN1 scenes=%d beats=%d strips_missing=%s' % (len(SCENES), len(ids), [s['id'] for s in SCENES if s['strip'] not in MD]))
    print(' '.join(s['id'] for s in SCENES))
