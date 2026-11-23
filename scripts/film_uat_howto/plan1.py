# ⚠ DO NOT REMOVE — film "UAT, hands on" FILM I (prompts/FILM_UAT_GUIDE.md §5.28): old Parts I + II in one flow, guide rev (j). FILM_PLAN=plan1 selects it in compose.py.
# The scenes are plan.py's s1-s4 (the guide, What you need) then plan2.py's list (A3.1 Pack In, B0 marked by hand, Arrange, Convert, Export, the Viewer, B3.1, B5 with box 2).
# Dropped as repeats: plan.py's s5 (the ready-marked set) and s11/s12 (B5 without box 2). 'strip' = the guide's OWN words (compose.py stops the build on a strip not found).
# Only the lines that pointed at the other part ("as in part one", "the nine marked sheets") are rewritten here, by beat id. READ THE LOGS.
import copy, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import plan, plan2
MD = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'docs', 'CapexUATGuide.md'), encoding='utf8').read()
SCENES = copy.deepcopy([s for s in plan.SCENES if s['id'] in ('s1', 's2', 's3', 's4')] + plan2.SCENES)
NEW = {   # §5.28 independent check (rc4): each line says what its scene shows, in the guide's words; no "this time" (one film now)
  'b2a':  "Under What you need, the files you download are links.",
  'b4a':  "The reference pack. Unzip it, and keep the zip too: box one of the Run Checker takes it.",
  'b4c':  "The folder marked holds the supplied marked copies: the nine sheets, marked. You will mark your own copies of the sheets as drawn.",
  'q1a':  "Start from the drawings as drawn: the pack's sheets folder.",
  'q10a': "Then Convert: five hundred and eleven elements.",
  'q11a': "The building opens in the Viewer. Copy the status line.",
  'q13a': "Box one, the pack: Pack intact. Then box three, your database.",
  'q13b': "Box two gets your nine marked copies.",
  'q14a': "Mark my run. Your marks equal the supplied marked copies, mark for mark, and the run reads PASS.",
}
for s in SCENES:
    s['beats'] = [(b[0], b[1], NEW.get(b[0], b[2])) + tuple(b[3:]) for b in s['beats']]
for s in SCENES:   # the pack's own folders (sheets, marked, reference: the zip as the guide's link serves it) said when the folder opens
    if s['id'] == 's4': s['beats'].insert(2, ('b4b2', 's4_inside', "Inside: the sheets as drawn, the same sheets marked, and the reference database."))
# rc1 (§5.28): silences 10.2 s (s1 end -> s2's table) and 21.2 s (s13's log in, before its first line) broke the 8 s bar: lines for what is on screen there, on the take's own events
ADD = {
  's2':  [('b2_0', 's2_start', "Close the downloads tab, Control W, and scroll down to What you need.")],
  's13': [('b13_0', 's13_login', "A3.1 by its window: log in to iDempiere as GardenAdmin."),
          ('b13_0b', 'click:OK (Chrome)', "Chrome warns about the well-known demo password. Press OK: it is Chrome's window, not iDempiere's."),
          ('b13_0b2', 'at:click:OK (Chrome)|click:OK (role)|0.6', "Then the role window: press OK."),   # rc2: 8.4 s and 8.9 s still silent here
          ('b13_0c', 'click:OK (role)', "The wait for the Home tab is sped up."),
          ('b13_0d', 'at:click:OK (role)|click:the search box|0.6', "iDempiere's Home tab opens.")],
  's6':  [('b6_0', 'click:Complete the building', "Tick Complete the building: the floor slab and the roof.")],
  's7':  [('b7_0', 's7_click', "Export, Viewer database: the Shed's file lands in Downloads.")],
  's8':  [('b8_0', 's8_front', "Open it from the front door: Buildings, IFC, then Blank Viewer, and Control O.")],
  'p11': [('b11_0', 's11_pasted', "Box five, the cost you copied.")],
}
for s in SCENES:
    s['beats'] = ADD.get(s['id'], []) + s['beats']
for k in ('IDLE_X', 'IDLE_KEEP', 'CAMERA', 'SP'):
    if hasattr(plan2, k): globals()[k] = getattr(plan2, k)
IDLE_X, IDLE_KEEP = 16, 0.5   # §5.28 rc3: at the default x8 the wait for iDempiere's Home tab (s13, 150 s of source) still left 10.4 s without a line; Part III uses x24-x32
TITLE = dict(kicker='UAT GUIDE · HANDS ON · PART I', line1='From the drawings to a priced model', line2='mark them, convert them, check your run', note='Every click is real: the real browser, the real file windows.')
CLOSING = dict(line1='Your own marks, checked mark for mark:', line2='do, confirm, tick.', credit='Voice: Kokoro (local) · key sounds: eklee, CC BY 3.0 · click: GNOME')
if __name__ == '__main__':
    ids = [b[0] for s in SCENES for b in s['beats']]; assert len(ids) == len(set(ids)), 'beat ids repeat'
    used = set(ids); assert all(k in used for k in NEW), 'a rewritten beat id is not in the list'
    print('§PLAN1 scenes=%d beats=%d strips_missing=%s' % (len(SCENES), len(ids), [s['id'] for s in SCENES if s['strip'] not in MD]))
    print(' '.join(s['id'] for s in SCENES))
