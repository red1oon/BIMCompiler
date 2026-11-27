# ⚠ DO NOT REMOVE — film "UAT, hands on: where to click" (prompts/FILM_UAT_GUIDE.md §5): the PLAN the composer and the narration share.
# Each scene = one take (scenes.js). 'strip' = the guide's OWN words for that action (typed in the top strip, checked against docs/CapexUATGuide.md by compose.py: a
# strip that is not a substring of the guide stops the build). 'beats' = the instructor's lines, each spoken AFTER the cue it names (its action is on screen first).
# 'span' = the take from cue to cue that is shown. Numbers in the lines are only ones the take measured (its §FILM_DL / §FILM_CHECK lines), never typed here.
SCENES = [
  dict(id='s1', chip='The guide', strip='⬇ Download the PDF', span=('s1_start', 's1_end'), beats=[
    ('b1a', 's1_page',   "Type the guide's address, and press Enter."),
    ('b1b', 's1_landed', "Press Download the P.D.F. Your browser saves it in Downloads."),
    ('b1c', 's1_list',   "Control J shows your downloads, any time."),
  ]),
  dict(id='s2', chip='What you need', strip='The test-data pack', span=('s2_start', 's2_end'), beats=[
    ('b2a', 's2_table',  "Under What you need, each item has a link."),
    ('b2b', 's2_landed', "This link is a file: the test data. Keep it zipped. Pack In takes the zip as it is."),
  ]),
  dict(id='s3', chip='What you need', strip='The construction-products script (10 materials at standard cost)', span=('s3_start', 's3_end'), beats=[
    ('b3a', 's3_page',   "This link opens a page, not a file."),
    ('b3b', 's3_landed', "The file is behind this button: Download raw file."),
    ('b3c', 's3_end',    "Then press Back, to return to the guide."),
  ]),
  dict(id='s4', chip='What you need', strip='The **reference pack** (to mark your run, chapter B5)', span=('s4_start', 's4_end'), beats=[
    ('b4a', 's4_landed', "The reference pack. This one, you unzip."),
    ('b4b', 's4_extracted', "Open it in your Files app. On Windows, right-click it, and choose Extract All."),
    ('b4c', 's4_marked', "Inside, the nine marked sheets. You open these in the Modeller."),
  ]),
  dict(id='s5', chip='B2.1', strip='📂 Open → Open 2D drawings (.dxf)…', span=('s5_start', 's5_end'), beats=[
    ('b5a', 's5_toc',    "The contents list, on the right, jumps to any chapter."),
    ('b5b', 's5_dialog', "Open, then Open 2D drawings. Your computer's file window opens."),
    ('b5c', 's5_loaded', "Go into the marked folder. Control A selects all nine. Then press Open."),
  ]),
  dict(id='s6', chip='B2.5 · B2.6', strip='Press **Convert**', span=('s6_start', 's6_end'), beats=[
    ('b6a', 's6_ticked',    "Tick Complete the building."),
    ('b6b', 's6_converted', "Press Convert. The status line counts what was built."),
    ('b6c', 's6_orbit',     "Fold the panels away, and drag to look around."),
  ]),
  dict(id='s7', chip='B2.8', strip='Export → Viewer database (.db)', span=('s7_start', 's7_end'), beats=[
    ('b7a', 's7_landed', "Export, then Viewer database. The file lands in Downloads."),
  ]),
  dict(id='s8', chip='B2.9', strip='In the blank Viewer press **Ctrl+O** (Open Building) and choose the `.db`', span=('s8_start', 's8_end'), beats=[
    ('b8a', 's8_front',  "Open the front door. On a first visit, click the red pill."),
    ('b8b', 's8_viewer', "Then Buildings, and Blank Viewer."),
    ('b8c', 's8_done',   "Press Control O, and choose your database. The status line says done."),
    ('b8d', 's8_copy',   "Copy that line now. Click it three times, then press Control C."),
  ]),
  dict(id='s10', chip='B5.2', strip="in box **4** paste the Viewer's status line from B2.9", span=('s10_start', 's10_end'), beats=[
    ('b10a', 's10_checker', "In the first tab, go back to the guide, and open the Run Checker."),
    ('b10b', 's10_pasted',  "Click box four, and press Control V."),
  ]),
  dict(id='s9', chip='B3.1', strip='Find panel: `total cost`', span=('s9_start', 's9_end'), beats=[
    ('b9a', 's9_cost', "Back in the Viewer, press F, and type total cost."),
    ('b9b', 's9_copy', "Copy the answer the same way."),
  ]),
  dict(id='s11', chip='B5.1', strip="In box **1** choose the pack's `.zip`", span=('s11_start', 's11_end'), beats=[
    ('b11a', 's11_pasted', "Paste it in box five."),
    ('b11b', 's11_intact', "In box one, choose the pack's zip. The checker says the pack is intact."),
    ('b11c', 's11_box3',   "In box three, choose your database."),
  ]),
  dict(id='s12', chip='B5.3 · B5.4', strip='Press **Download result (uat_result.json)** and attach the file to this sign-off', span=('s12_start', 's12_end'), beats=[
    ('b12a', 's12_marked', "Press Mark my run. You skipped B zero, so box two stays empty, and the run reads partial pass."),
    ('b12b', 's12_saved',  "Download the result, and attach it to your sign-off."),
  ]),
  dict(id='s13', chip='A3.1', strip='use the **Pack In** window logged in as GardenWorld Admin (choose the zip, then run it)', span=('s13_start', 's13_end'), beats=[   # §5.12
    ('b13a', 's13_window',   "In iDempiere, any window opens from the search box. Type its name: Pack In."),
    ('b13b', 's13_attached', "Press New, give it a name, and save. The paper clip attaches the test-data zip."),
    ('b13c', 's13_done',     "Press Pack In, then OK. The message counts what was processed, and nothing is left unresolved.")]),
]
TITLE = dict(kicker='UAT GUIDE · HANDS ON', line1='Where to click', line2='the first steps, shown', note='Every click is real: the real browser, the real file windows.')
CLOSING = dict(line1='The rest of the guide works the same way:', line2='do, confirm, tick.', credit='Voice: Kokoro (local) · key sounds: eklee, CC BY 3.0 · click: GNOME')
