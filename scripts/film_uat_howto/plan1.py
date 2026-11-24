# ⚠ DO NOT REMOVE — film "UAT, hands on" FILM I (prompts/FILM_UAT_GUIDE.md §5.28, §5.29): old Parts I + II in one flow. §5.29: guide rev (o), B0 on the PRE-FILLED panel (defaults are CHECKED, one layer is set), the steps read from the downloaded PDF (owner rule 2026-11-24). FILM_PLAN=plan1 selects it in compose.py.
# The scenes are plan.py's s1-s4 (the guide, What you need) then plan2.py's list (A3.1 Pack In, B0 marked by hand, Arrange, Convert, Export, the Viewer, B3.1, B5 with box 2).
# Dropped as repeats: plan.py's s5 (the ready-marked set) and s11/s12 (B5 without box 2). 'strip' = the guide's OWN words (compose.py stops the build on a strip not found).
# Only the lines that pointed at the other part ("as in part one", "the nine marked sheets") are rewritten here, by beat id. READ THE LOGS.
import copy, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import plan, plan2
MD = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'docs', 'CapexUATGuide.md'), encoding='utf8').read()
SCENES = copy.deepcopy([s for s in plan.SCENES if s['id'] in ('s1', 's2', 's3', 's4')] + plan2.SCENES)
ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(); TENS = 'x x twenty thirty forty fifty sixty seventy eighty ninety'.split()
def W(n):   # a figure the guide holds, spoken in words (never typed in a line: the line is built from the guide's own number)
    n = int(n)
    if n < 20: return ONES[n]
    if n < 100: return TENS[n // 10] + ('-' + ONES[n % 10] if n % 10 else '')
    return ONES[n // 100] + ' hundred' + (' and ' + W(n % 100) if n % 100 else '')
def G(row, rx):
    m = __import__('re').search(r'^\| %s \|.*$' % __import__('re').escape(row), MD, __import__('re').M); r = m.group(0) if m else ''
    f = __import__('re').search(rx, r); return f.group(1) if f else None
Y1, Y2, Y3, Y4 = G('B0.1', r'lists \*\*(\d+)\*\* yellow'), G('B0.2', r'to \*\*(\d+)\*\* yellow'), G('B0.2b', r'leaves \*\*(\d+)\*\* yellow'), G('B0.4', r'shows \*\*(\d+)\*\* yellow')
SETN = G('B0.3', r'reads \*\*(\w+)\*\* on all nine'); ARR = G('B2.3', r'Step 1/46 … Step (\d+)/\d+')
assert all([Y1, Y2, Y3, Y4, SETN]), 'a B0 figure is not in the guide'
# §5.29: the B0 scenes on the pre-filled panel (guide rev (o)): the take CHECKS each default; the one value keyed in is the ELEV layer 0 (B0.4). Strips are the guide's own words (compose checks them in the guide AND the PDF).
REPL = {
  'p1': dict(chip='B0.1', strip='select **all nine** sheets exported in B00', span=('p1_start', 'p1_end'), beats=[
    ('q1a', 'p1_pdf',    "From here on, the steps are read in the P.D.F. you downloaded. Control F finds B zero point one."),
    ('q1e', 'p1_link',   "Its link opens the Modeller."),
    ('q1d', 'p1_row',    "Open, then Open 2D drawings. In the file window, go into the pack's sheets folder."),
    ('q1b', 'p1_badge',  "Select all nine, and open them. The badge reads Blocked: the sheets carry no settings yet."),
    ('q1c', 'p1_yellow', "All defaults lists %s yellow rows: what the Modeller read from the files." % W(Y1))]),
  'p2': dict(chip='B0.2 · B0.2b', strip='In **All defaults**, press **Accept stated + read**', span=('p2_start', 'p2_end'), beats=[
    ('q2a', 'p2_grown', "Press Accept stated and read. The list grows to %s." % W(Y2)),
    ('q2c', 'p2_first', "Then Accept all. %s rows are left: the defaults that follow from the ones just taken." % W(Y3).capitalize()),
    ('q2b', 'p2_done',  "Press it once more. No yellow rows are left, the badge reads Qualifies, and eight sheets now have a role.")]),
  'p3': dict(chip='B0.3', strip='In **Sheets**, open any card and check its **Set** field', span=('p3_start', 'p3_end'), beats=[
    ('q3a', 'p3_field', "B zero point three. In any card, the Set field already reads %s, on all nine sheets. Check it. Nothing to type." % SETN)]),
  'p4': dict(chip='B0.4 · B0.4b', strip="Open **Layers** and check each layer's meaning against the table below", span=('p4_start', 'p4_end'), beats=[
    ('q4a', 'p4_layers',    "Open Layers. Nine of the ten layers are already set. Each row says it was read from the drawing, and by which rule."),
    ('q4d', 'p4_check_4',   "Check each one against the guide's table. Nothing is typed."),
    ('q4e', 'p4_split',     "One layer no drawing decides: the elevation's layer zero. The small arrow types it sheet by sheet. Pick column, on the south elevation only."),
    ('q4b', 'p4_qualifies', "%s yellow rows are left, and the badge reads Qualifies." % W(Y4).capitalize()),
    ('q4c', 'p4_done',      "Accept all: no yellow rows.")]),
  'p5': dict(chip='B0.5', strip='Open **Body heights** and check its two rows against the drawings', span=('p5_start', 'p5_end'), beats=[
    ('q5a', 'p5_open',      "Open Body heights. Two rows, both read from the drawings, each naming its rule."),
    ('q5b', 'p5_row_footing', "Check both against the drawings. Nothing is typed.")]),
  'p6': dict(chip='B0.6', strip='In **Sheets**, open each elevation and the section card in turn', span=('p6_start', 'p6_end'), beats=[
    ('q6a', 'p6_card', "B zero point six. On each elevation, and on the section, the plinth level is already there, at the y where it is drawn."),
    ('q6b', 'p6_done', "Five cards, five level rows, nothing typed. The badge still reads Qualifies.")]),
  'p7': dict(chip='B0.7', strip='Open **Exclude areas** and check its row', span=('p7_start', 'p7_end'), beats=[
    ('q7a', 'p7_row',  "B zero point seven. The exclude row for the beam layout is already there."),
    ('q7b', 'p7_zoom', "Zoom with the wheel, and drag with the right button, to the expansion joint."),
    ('q7c', 'p7_box',  "The box holds both close lines. Nothing is dragged.")]),
  's10': dict(chip='B5.2', strip="in box **4** paste the Viewer's status line from B2.9", span=('s10_start', 's10_end'), beats=[
    ('q11d', 's10_start',   "Now go back to the first tab, and press Back until the P.D.F. shows."),
    ('q11e', 's10_pdf',     "Control F finds B five point one. Its link opens the Run Checker. It compares your run with the run this guide was proven on, stage by stage. It reads your files in your browser: nothing is uploaded."),   # guide B5 intro words
    ('q11b', 's10_checker', "The Run Checker."),
    ('q11c', 's10_pasted',  "Click box four, and press Control V.")]),
}
SCENES = [dict(REPL[s['id']], id=s['id']) if s['id'] in REPL else s for s in SCENES]
for s_ in SCENES:   # §5.29: the strip must also be found in the PDF's text (compose.py FILM_GUIDE_PDF); s13's old words are split by the PDF's link text there
    if s_['id'] == 's13': s_['strip'] = 'window logged in as GardenWorld Admin (choose the zip, then run it)'
NEW = {   # §5.28 independent check (rc4): each line says what its scene shows, in the guide's words; no "this time" (one film now)
  'b2a':  "Control F finds the test-data file, under What you need. The files you download are links.",
  'b4a':  "The reference pack. Unzip it, and keep the zip too: box one of the Run Checker takes it.",
  'b4c':  "The folder marked holds the supplied marked copies: the nine sheets, marked. You will mark your own copies of the sheets as drawn.",
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
  's2':  [('b2_0', 's2_close_tabs', "From here on, the guide is the P.D.F. you downloaded. Close the web page."),
          ('b2_0b', 's2_openpdf', "Control O opens a file: choose the P.D.F. in Downloads. Chrome shows it.")],
  's13': [('b13_0', 's13_login', "A3.1 by its window: log in to iDempiere as GardenAdmin."),
          ('b13_0b', 'click:OK (Chrome)', "Chrome warns about the well-known demo password. Press OK: it is Chrome's window, not iDempiere's."),
          ('b13_0b2', 'at:click:OK (Chrome)|click:OK (role)|0.6', "Then the role window: press OK."),   # rc2: 8.4 s and 8.9 s still silent here
          ('b13_0c', 'click:OK (role)', "The wait for the Home tab is sped up."),
          ('b13_0d', 'at:click:OK (role)|click:the search box|0.6', "iDempiere's Home tab opens.")],
  's6':  [('b6_0', 'click:Complete the building', "Tick Complete the building: the floor slab and the roof.")],
  's7':  [('b7_0', 's7_click', "Export, Viewer database: the Shed's file lands in Downloads.")],
  's8':  [('b8_p', 's8_pdf', "Back in the P.D.F., B two point nine says: open the front door."),
          ('b8_0', 's8_front', "Open it from the front door: Buildings, IFC, then Blank Viewer, and Control O.")],
  'p11': [('b11_0', 's11_pasted', "Box five, the cost you copied.")],
}
for s in SCENES:
    s['beats'] = ADD.get(s['id'], []) + s['beats']
# §5.30 (owner 2026-11-25: "Need not narrate trivial actions ... Look out thruout so we save time narrating and can speed up"): EVERY line of Film I read against one test: does it say what to do next, where to look, or the one result a step's Confirm hangs on?
# DROPPED = it only restates what the screen plainly shows, or is a browser trick (the take still CHECKS what they stood next to: Processed=225 Un-Resolved=0, the role window, the Home tab). SHORT = the same line, cut to what the tester needs.
# A span left without a line plays sped up by the idle rule (compose.py §5.11, x16, 0.5 s real time kept at each end); the PDF reopen is a declared fast span (x3) under one short line.
DROP = {'b1c', 'b3c', 'b13_0b', 'b13_0b2', 'b13_0c', 'b13_0d', 'q5b', 'q11b', 'b2_0b'}
SHORT = {
  'b1b':  "Press Download the P.D.F. It saves to Downloads.",
  'b2_0': "Open the downloaded P.D.F. from Downloads.",
  'b2a':  "Control F finds the test-data file under What you need.",
  'b2b':  "This link is a file: keep it zipped. Pack In takes the zip as it is.",
  'b4b2': "Inside: the sheets as drawn, the sheets marked, the reference database.",
  'b4c':  "Marked holds the supplied copies. You will mark your own.",
  'b13c': "Press Pack In, then OK.",
  'q1a':  "The steps are in the P.D.F. Control F finds B zero point one.",
  'q1c':  "All defaults lists %s yellow rows." % W(Y1),
  'q3a':  "B zero point three. The Set field already reads %s, on all nine sheets. Nothing to type." % SETN,
  'q4a':  "Nine of the ten layers are already set, each read from the drawing.",
  'q4d':  "Check each against the guide's table.",
  'q5a':  "Open Body heights. Two rows, both read from the drawings.",
  'b8_p': "B two point nine: open the front door.",
  'q11d': "Back to the P.D.F.",
  'q11e': "B five point one: its link opens the Run Checker. It reads your files in your browser: nothing is uploaded.",
}
for s in SCENES:
    s['beats'] = [(b[0], b[1], SHORT.get(b[0], b[2])) + tuple(b[3:]) for b in s['beats'] if b[0] not in DROP]
# §5.30 (owner: "When PDF is opened, it should be view full width, so need not keep zooming in and out"): the camera holds zoom 1.0 while a scene shows the downloaded PDF (the page fills the width, its text is readable as it is); (cue, cue) in the take
CAMERA_FLAT = {'s2': [('s2_start', 's2_end')], 's3': [('s3_start', 's3_click'), ('s3_back', 's3_end')], 's4': [('s4_start', 's4_landed')], 'p1': [('p1_start', 'p1_link')], 's8': [('s8_start', 's8_link')], 's10': [('s10_start', 's10_checker')]}
for k in ('IDLE_X', 'IDLE_KEEP', 'CAMERA', 'SP'):
    if hasattr(plan2, k): globals()[k] = getattr(plan2, k)
FAST_IDLE_WINS = True   # §5.30: inside a declared fast span (the PDF reopen) the waits play at the idle speed, not at x3
CAMERA = 'smooth'   # §5.29 (b), owner 2026-11-24 "zooming smooth, not jumpy or swinging": plan2 has no CAMERA, so Film I was built on compose's 'old' camera; the eased one is gated by §COMP_CAMERA_VERDICT
IDLE_X, IDLE_KEEP = 16, 0.5   # §5.28 rc3: at the default x8 the wait for iDempiere's Home tab (s13, 150 s of source) still left 10.4 s without a line; Part III uses x24-x32
TITLE = dict(kicker='UAT GUIDE · HANDS ON · PART I', line1='From the drawings to a priced model', line2='mark them, convert them, check your run', note='Every click is real: the real browser, the real file windows.')
CLOSING = dict(line1='Your own marks, checked mark for mark:', line2='do, confirm, tick.', credit='Voice: Kokoro (local) · key sounds: eklee, CC BY 3.0 · click: GNOME')
if __name__ == '__main__':
    ids = [b[0] for s in SCENES for b in s['beats']]; assert len(ids) == len(set(ids)), 'beat ids repeat'
    used = set(ids); assert all(k in used or k in DROP for k in list(NEW) + list(SHORT)), 'a rewritten beat id is not in the list'
    print('§PLAN1 scenes=%d beats=%d strips_missing=%s' % (len(SCENES), len(ids), [s['id'] for s in SCENES if s['strip'] not in MD]))
    print(' '.join(s['id'] for s in SCENES))
