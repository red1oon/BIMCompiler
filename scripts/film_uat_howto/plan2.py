# ⚠ DO NOT REMOVE — film "UAT, hands on" PART II (prompts/FILM_UAT_GUIDE.md §5.14, §5.15): the PLAN, same shape as plan.py (FILM_PLAN=plan2 selects it in compose.py).
# The raw sheets marked by hand (B0.1-B0.9), Arrange (B2.3), and the run marked PASS (B5) on the tester's own copies. A3.1 Pack In (s13) comes first, as in the guide.
# 'strip' = the guide's OWN words (compose.py stops the build on a strip not found in docs/CapexUATGuide.md). Numbers spoken are only ones the take measured (§FILM_CHECK lines).
SCENES = [
  dict(id='s13', chip='A3.1', strip='use the **Pack In** window logged in as GardenWorld Admin (choose the zip, then run it)', span=('s13_start', 's13_end'), beats=[   # §5.12, recorded take 5
    ('b13a', 's13_window',   "In iDempiere, any window opens from the search box. Type its name: Pack In."),
    ('b13b', 's13_attached', "Press New, give it a name, and save. The paper clip attaches the test-data zip."),
    ('b13c', 's13_done',     "Press Pack In, then OK. The message counts what was processed, and nothing is left unresolved.")]),
  dict(id='p1', chip='B0.1', strip='**📂 Open → Open 2D drawings (.dxf)…** and select **all nine** sheets exported in B00', span=('p1_start', 'p1_end'), beats=[
    ('q1a', 'p1_link',   "This time, start from the drawings as drawn: the pack's sheets folder."),
    ('q1b', 'p1_badge',  "Select all nine, and open them. The badge reads Blocked: the sheets carry no settings yet."),
    ('q1c', 'p1_yellow', "All defaults lists thirty-four yellow rows: what the Modeller read from the files.")]),
  dict(id='p2', chip='B0.2 · B0.2b', strip='In **All defaults**, press **Accept stated + read**', span=('p2_start', 'p2_end'), beats=[
    ('q2a', 'p2_113',  "Press Accept stated and read. The list grows to one hundred and thirteen."),
    ('q2b', 'p2_done', "Then Accept all. No yellow rows are left, and eight sheets now have a role.")]),
  dict(id='p3', chip='B0.3', strip='In its **Set** field replace `BUILD-NAME` with **SHED** and press Enter', span=('p3_start', 'p3_end'), beats=[
    ('q3a', 'p3_done', "In a card's Set field, type SHED, and press Enter. All nine sheets follow.")]),
  dict(id='p4', chip='B0.4 · B0.4b', strip='Open **Layers**. Under each heading, pick the meaning of each CAD layer from its list', span=('p4_start', 'p4_end'), beats=[
    ('q4a', 'p4_layers',    "Open Layers. Pick what each CAD layer means, from its list, as the guide's table says."),
    ('q4b', 'p4_qualifies', "Where a layer means something on one sheet only, the small arrow types it sheet by sheet. The badge now reads Qualifies."),
    ('q4c', 'p4_done',      "Accept all: the fourteen sizes the Modeller assumes.")]),
  dict(id='p5', chip='B0.5', strip='Open **Body heights**.', span=('p5_start', 'p5_end'), beats=[
    ('q5a', 'p5_done', "Open Body heights. Type the footing, and the beam, and add each one.")]),
  dict(id='p6', chip='B0.6', strip='Under **Level datums (@Z)**, type the height `0.6096` in the first box', span=('p6_start', 'p6_end'), beats=[
    ('q6a', 'p6_card', "On each elevation, and on the section, add the plinth level, where it is drawn."),
    ('q6b', 'p6_done', "Five cards, five new level rows. The badge still reads Qualifies.")]),
  dict(id='p7', chip='B0.7', strip='Drag a box from above row A to below row D that holds both lines and the small break marks beside them', span=('p7_start', 'p7_end'), beats=[
    ('q7a', 'p7_tool', "Open Exclude areas. Choose the beam layout, and press Exclude area."),
    ('q7b', 'p7_zoom', "Zoom with the wheel, and drag with the right button, to the expansion joint."),
    ('q7c', 'p7_box',  "Drag a box round the two close lines. One exclude row is written.")]),
  dict(id='p8', chip='B0.8 · B0.9', strip='Press **Save marked copies** (at the foot of the panel)', span=('p8_start', 'p8_end'), beats=[
    ('q8a', 'p8_badge', "The badge reads Qualifies, with no yellow rows."),
    ('q8b', 'p8_saved', "Press Save marked copies. Nine new files land in Downloads.")]),
  dict(id='p9', chip='B2.1 · B2.3', strip='Press **Arrange** in the panel to watch them move into place', span=('p9_start', 'p9_end'), beats=[
    ('q9a', 'p9_loaded',   "Reload the page, and open your nine copies: click the first, then Shift click the last."),
    ('q9b', 'p9_arranged', "Press Arrange, and watch each sheet move into place: forty-six steps.")]),
  dict(id='s6', chip='B2.5 · B2.6', strip='Press **Convert**', span=('s6_start', 's6_end'), beats=[
    ('q10a', 's6_converted', "From here, as in part one. Convert: five hundred and eleven elements.")]),
  dict(id='s7', chip='B2.8', strip='Export → Viewer database (.db)', span=('s7_start', 's7_end'), beats=[]),
  dict(id='s8', chip='B2.9', strip='In the blank Viewer press **Ctrl+O** (Open Building) and choose the `.db`', span=('s8_start', 's8_end'), beats=[
    ('q11a', 's8_done', "Export the database, and open it in the Viewer. Copy the status line.")]),
  dict(id='s10', chip='B5.2', strip="in box **4** paste the Viewer's status line from B2.9", span=('s10_start', 's10_end'), beats=[]),
  dict(id='s9', chip='B3.1', strip='Find panel: `total cost`', span=('s9_start', 's9_end'), beats=[
    ('q12a', 's9_cost', "Paste it in the Run Checker. Then ask the Viewer for the total cost, and copy it.")]),
  dict(id='p11', chip='B5.1 · B5.2', strip='In box **2** select your nine `…_marked.dxf` from B0.9 (all at once)', span=('s11_start', 'p11_end'), beats=[
    ('q13a', 's11_intact', "Fill boxes one, three and five, as in part one."),
    ('q13b', 'p11_end',    "This time, box two gets your nine marked copies.")]),
  dict(id='p12', chip='B5.3 · B5.4', strip='Your run reads **PASS** when all four pass', span=('p12_start', 'p12_end'), beats=[
    ('q14a', 'p12_marked', "Mark my run. Your marks equal the answer key, mark for mark. Every row passes, and so does the run."),
    ('q14b', 'p12_saved',  "Download the result, and attach it to your sign-off.")]),
]
TITLE = dict(kicker='UAT GUIDE · HANDS ON · PART II', line1='From the drawings as drawn', line2='mark them, arrange them, pass', note='Every click is real: the real browser, the real file windows.')
CLOSING = dict(line1='Your own marks, checked mark for mark:', line2='do, confirm, tick.', credit='Voice: Kokoro (local) · key sounds: eklee, CC BY 3.0 · click: GNOME')
