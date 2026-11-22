# ⚠ DO NOT REMOVE — film "UAT, hands on" PART III (prompts/FILM_UAT_GUIDE.md §5.16): the PLAN, same shape as plan.py (FILM_PLAN=plan3 selects it in compose.py).
# B4 (the model to the ERP), chapter C (every document by hand: the first of each kind at normal speed, each repeat its own scene at x16, §5.17), chapter D (the dashboard).
# 'strip' = the guide's OWN words (compose.py stops the build on a strip not found in docs/CapexUATGuide.md). The repeat scenes and their spoken quantities are built from the
# guide's own chapter C table, parsed here as scenes3.js parses it (never retyped). Numbers spoken elsewhere are only ones the take measured (§FILM_CHECK lines). READ THE LOGS.
import os, re
MD = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'docs', 'CapexUATGuide.md'), encoding='utf8').read()
sec = MD[MD.index('## C · ERP'):MD.index('### C1 ·')]
def doc(t):
    m = re.search(r'([\d,]+)\s+(M3|KG|M2)\s+(PWD-[\d.]+)', t or ''); return dict(qty=m.group(1), uom=m.group(2), product=m.group(3)) if m else None
def part(rx, t):
    m = re.search(rx, t); return doc(m.group(1)) if m else None
PLAN, PROD = [], {}
for l in sec.split('\n'):
    c = [x.strip() for x in l.split('|')]
    if l.startswith('| TD_'): PLAN.append(dict(project=c[1], name=c[2], co=part(r'complete:\s*([^;]+)', c[4]), dr=part(r'leave in Draft:\s*([^;]+)', c[4]), far=c[5], issue=doc(c[6])))
    if l.startswith('| PWD-'): PROD[c[1]] = c[2]
UNIT = dict(M3='cubic metres', KG='kilograms', M2='square metres')
def say(d): return '%s %s of %s' % (d['qty'], UNIT[d['uom']], PROD[d['product']].lower().replace('rc 1:2:4', 'concrete'))
RCV, INV = re.compile('Received|Half paid|Paid in full'), re.compile('Half paid|Paid in full')
C11 = '**Purchase Order** window, **New**'; C12 = '**Document Action ▸ Complete ▸ OK** on the orders the table marks *complete*; leave the others as they are'
C21 = '**Material Receipt** window, **New**'; C31 = '**Purchase Invoice and Credit/Debit Note** window, **New**'; C32 = '**Payment and Receipt** window, **New**'
C41 = 'Press **Set Project Type**, choose **Work Order (Job)**, **OK**'; C42 = 'Menu **Project Management ▸ Issue to Project**'; C43 = '**Project (Lines/Issues)** window, find the project, tab **Issues**'
SP = 16   # §5.17: repeats x16 (was x8)
IDLE_X, IDLE_KEEP = 24, 0.3   # §5.17: waits x24, 0.3 s real time at each end (compose defaults x8, 0.8 s)
CAMERA = 'smooth'   # §5.18 L6: the eased camera (compose default 'old', so Parts I and II rebuild unchanged)
def rep(sid, chip, strip, bid, text): return dict(id=sid, chip=chip, strip=strip, span=(sid + '_start', sid + '_end'), speed=SP, beats=[(bid, sid + '_start', text)])

SCENES = [
  dict(id='r0', chip='B2.9', strip='In the blank Viewer press **Ctrl+O** (Open Building) and choose the `.db`', span=('s8_start', 's8_end'), speed=SP, beats=[
    ('r0a', 's8_start', "Part three starts where part one ended: the Shed, open in the Viewer."),
    ('r0b', 'click:Home', "Control O opens the file window: Home, then Downloads, then the Shed's file.")]),   # §5.16 (4): rc1 silence 10.8 s
  dict(id='r1', chip='B4.1', strip='Open the **Find** panel and click one group of parts in its list (for example a column type)', span=('r1_start', 'r1_end'), beats=[
    ('r1a', 'r1_type',  "Press F for the Find panel, and look for the columns."),
    ('r1b', 'r1_group', "Click one group. The panel shows its cost, and a button: ERP.")]),
  dict(id='r2', chip='B4.2 · B4.3', strip='Press **› ERP**', span=('r2_start', 'r2_end'), beats=[
    ('r2a', 'r2_push',  "Press it. The status line reads: Project Order, one line, saved."),
    ('r2b', 'r2_again', "Press it again: zero lines. The order is keyed by the model's name, so nothing is added twice.")]),
  dict(id='r3', chip='B4.4', strip='Click **open ↗**. On the Kernel ERP sign-in page choose **GardenAdmin**, then **Log In**', span=('r3_start', 'r3_end'), beats=[
    ('r3a', 'r3_signin',   "Open it. On the sign-in page, choose GardenAdmin, and log in."),
    ('r3b', 'r3_project',  "The project is SHED, with the planned amount of the group you clicked."),
    ('r3c', 'r3_taskline', "Phase and Task hold one record each. The line sits under Task Line, with the same amount.")]),
  # §5.18 L4 (owner 2026-11-22: "Show the workings on film and UATGuide with a note if the ERP side is legacy"): B4 again, with the Viewer served by a legacy iDempiere (the BIM OOTB plugin)
  dict(id='l0', chip='B4 · L1', strip="Open **your iDempiere**`/bimootb/viewer/viewer.html?blank=1&erpUser=GardenAdmin&erpClient=11&erpRole=102&erpOrg=11&erpWarehouse=103`", span=('l0_start', 'l0_end'), speed=SP, beats=[   # sped: B2.9 again (r0 shows it)
   
    ('l0a', 'l0_url',   "If your ERP is a legacy iDempiere, your administrator first installs the BIM OOTB plugin: step A5. Then the Viewer comes from your iDempiere. Type its address, slash bimootb, with your user and ids."),
    ('l0b', 'l0_ctrlo', "Then open the Shed's file, as before.")]),
  dict(id='l1', chip='B4.1', strip='Open the **Find** panel and click one group of parts in its list (for example a column type)', span=('r1_start', 'r1_end'), speed=SP, beats=[   # sped: B4.1 again (r1 shows it)
    ('l1a', 'r1_group', "The same group of parts, at the same cost.")]),
  dict(id='l2', chip='B4 · L2', strip='press **› ERP**, type your iDempiere password in the window *Sign in to iDempiere*, and press **Push**', span=('l2_start', 'l2_end'), beats=[
    ('l2a', 'l2_push',   "Press ERP. A window asks you to sign in to your iDempiere. Your user and ids are already filled in."),
    ('l2b', 'l2_pushpw', "Type the password, and push. Chrome shows its own password windows: OK, then no thanks."),
    ('l2c', 'l2_end',    "The status line names the new iDempiere project: one project, one phase, one task, one line.")]),
  dict(id='l3', chip='B4 · L3', strip='Click **open ↗** and log in to your iDempiere', span=('l3_start', 'l3_end'), speed=8, beats=[   # sped x8: the iDempiere log in again (c0 shows it at normal speed); the line holds the Project window
   
    ('l3a', 'l3_start',   "Open it, and log in to iDempiere."),
    ('l3a2', 'l3_login',  "Your user and password, and tick Select Role."),   # §5.18 L8: rc5 silence 8.02 s here
    ('l3a3', 'l3_role',   "Then the role window: choose HQ, and press OK."),
    ('l3b', 'l3_project', "The Project window opens on SHED, with the planned amount of the group you clicked.")]),
  dict(id='c0', chip='C', strip='ERP: the hands-on exercise (Project Mgmt Accounting, as GardenWorld Admin)', span=('c0_start', 'c0_end'), beats=[
    ('c0a', 'c0_start', "Chapter C is done in your iDempiere. Log in as GardenAdmin, and tick Select Role."),
    ('c0b', 'c0_role',  "Choose the organization HQ, and HQ Warehouse. Without them, an order will not save."),
    # §5.16 (4): rc1 silence 29.3 s = the wait from OK (role) to Chrome's Save password? (no event inside it): three lines between the two events
    ('c0b2', 'at:click:OK (role)|c0_savepw|0.2',  "The role window closes, and iDempiere opens its Home tab."),
    ('c0b3', 'at:click:OK (role)|c0_savepw|0.47', "HQ and HQ Warehouse stay with this login, for every document of chapter C."),
    ('c0b4', 'at:click:OK (role)|c0_savepw|0.74', "The Home tab's CAPEX goals are read at the very end, in D9."),
    ('c0c', 'c0_savepw', "Chrome asks to save the password. Say no thanks, or it takes your next keys.")]),
]
first = dict(c1=True, c1d=True, c2=True, c31=True, c32=True, c41=True, c42=True, c43=True)
def once(k):
    v = first[k]; first[k] = False; return v
for r in PLAN:   # C1: one order per row and kind, in the guide's table order
    for kind in ('co', 'dr'):
        d = r[kind]
        if not d: continue
        sid = 'c1_%s_%s' % (r['project'], kind)
        if kind == 'co' and once('c1'):
            SCENES.append(dict(id=sid, chip='C1.1 · C1.2', strip=C11, span=(sid + '_start', sid + '_end'), beats=[
              ('c1a', sid + '_start',    "Type the window's name in the search box: Purchase Order. Press New."),
              ('c1b', sid + '_new',      "Business partner, Seed Farm. Price list, Purchase. Warehouse, HQ. And the project. Save."),
              ('c1c', sid + '_line',     "On the PO Line tab, New. The product, and the quantity from the table. Leave the price alone. Save."),
              ('c1d', sid + '_totals',   "The price is the product's standard cost, rounded to the cent, and the total is quantity times price."),
              ('c1e', sid + '_complete', "Document Action, Complete, OK. The status reads Completed.")]))
        elif kind == 'dr' and once('c1d'):
            SCENES.append(dict(id=sid, chip='C1.2', strip=C12, span=(sid + '_start', sid + '_end'), speed=SP, beats=[
              ('c1f', sid + '_start', "The second order, %s, is made the same way, and left as it is: Drafted. The repeats now play at sixteen times the speed." % say(d))]))
        else: SCENES.append(rep(sid, 'C1.1' if kind == 'dr' else 'C1.1 · C1.2', C11, 'c1_%d' % len(SCENES), "%s: %s, %s." % (r['name'], say(d), 'completed' if kind == 'co' else 'left in draft')))
for r in PLAN:
    if r['co'] and RCV.search(r['far']):
        sid = 'c2_' + r['project']
        if once('c2'): SCENES.append(dict(id=sid, chip='C2.1', strip=C21, span=(sid + '_start', sid + '_end'), beats=[
              ('c2a', sid + '_start',    "Now the goods arrive. Material Receipt, New. The vendor, the order, and the project. Save."),
              ('c2b', sid + '_line',     "On the Receipt Line tab, New, and pick the Order Line. Product, quantity and locator fill in."),
              ('c2c', sid + '_complete', "Save, go back to the header, and complete it.")]))
        else: SCENES.append(rep(sid, 'C2.1', C21, 'c2_%d' % len(SCENES), "%s: the receipt of %s." % (r['name'], say(r['co']))))
for r in PLAN:
    if r['co'] and INV.search(r['far']):
        sid = 'c31_' + r['project']
        if once('c31'): SCENES.append(dict(id=sid, chip='C3.1', strip=C31, span=(sid + '_start', sid + '_end'), beats=[
              ('c3a', sid + '_start',    "The vendor's invoice. Purchase Invoice, New. Target document type: AP Invoice."),
              ('c3b', sid + '_from',     "Press Create lines from, choose the order, tick its line."),
              ('c3c', sid + '_complete', "Complete it. Its grand total equals the order's.")]))
        else: SCENES.append(rep(sid, 'C3.1', C31, 'c31_%d' % len(SCENES), "%s: its invoice." % r['name']))
for r in PLAN:
    if r['co'] and INV.search(r['far']):
        sid = 'c32_' + r['project']; half = 'Half paid' in r['far']
        if once('c32'): SCENES.append(dict(id=sid, chip='C3.2', strip=C32, span=(sid + '_start', sid + '_end'), beats=[
              ('c4a', sid + '_start',    "Then the payment. Payment and Receipt, New. Document type: AP Payment."),
              ('c4b', sid + '_new',      "This window lists customers. Type the vendor's search key, and in the Info window set Vendor to Yes."),
              ('c4c', sid + '_complete', "Choose the invoice: the amount fills in. Bank account, tender type Check. Save, and complete.")]))
        else: SCENES.append(rep(sid, 'C3.2', C32, 'c32_%d' % len(SCENES), "%s: %s." % (r['name'], 'half paid. On the invoice, Paid stays unticked, and the other half is open' if half else 'paid in full. On the invoice, Paid is ticked')))
for r in PLAN:
    if r['issue']:
        sid = 'c41_' + r['project']
        if once('c41'): SCENES.append(dict(id=sid, chip='C4.1', strip=C41, span=(sid + '_start', sid + '_end'), beats=[
              ('c5a', sid + '_start', "Material can be issued only to a Work Order project. Open the Project window, and look the project up."),
              ('c5b', sid + '_found', "Press Set Project Type, choose Work Order, Job, and OK."),
              ('c5c', sid + '_ok',    "Then set Line Level to Phase, and save: the Phase tab shows, and the phases are still there.")]))
        else: SCENES.append(rep(sid, 'C4.1', C41, 'c41_%d' % len(SCENES), "%s becomes a work order." % r['name']))
for r in PLAN:
    if r['issue']:
        sid = 'c42_' + r['project']
        if once('c42'): SCENES.append(dict(id=sid, chip='C4.2', strip=C42, span=(sid + '_start', sid + '_end'), beats=[
              ('c6a', sid + '_start', "Issue to Project. The project, the locator, the product, the quantity, and today's date."),
              ('c6b', sid + '_ok',    "Leave the other three empty. OK. The message says: Created one.")]))
        else: SCENES.append(rep(sid, 'C4.2', C42, 'c42_%d' % len(SCENES), "%s: %s issued." % (r['name'], say(r['issue']))))
NAMED = re.findall(r'\*(TD_[A-Z]+)\* [\d,.]+ × [\d.]+ = \*\*[\d,.]+\*\*', [l for l in MD.split('\n') if l.startswith('| C4.4 |')][0])
for p in NAMED:
    sid = 'c43_' + p; r = [x for x in PLAN if x['project'] == p][0]
    if once('c43'): SCENES.append(dict(id=sid, chip='C4.3 · C4.4', strip=C43, span=(sid + '_start', sid + '_end'), beats=[
          ('c7a', sid + '_issues',  "Project, Lines and Issues: the Issues tab holds one line, with the product and the quantity."),
          ('c7b', sid + '_balance', "And in the Project window, Project Balance rose by quantity times standard cost.")]))
    else: SCENES.append(rep(sid, 'C4.3 · C4.4', C43, 'c43_%d' % len(SCENES), "%s: one issue line, and its balance." % r['name']))
SCENES += [
  dict(id='c5', chip='C5.1', strip='Set **Invoice Rule** to *None* (the project\'s own rule; without it Save is refused: *Fill mandatory fields: Invoice Rule*), tick **Complete**, **Save**', span=('c5_TD_DEPOT_start', 'c5_TD_DEPOT_end'), beats=[
    ('c8a', 'c5_TD_DEPOT_start', "Last in chapter C: tick a phase. Project window, North Depot, the Phase tab."),
    ('c8b', 'c5_TD_DEPOT_phase', "Open the next phase that is not ticked. Here the tab shows one phase as a form, so: Next record."),   # §5.19 N2
    ('c8c', 'c5_TD_DEPOT_rule',  "Set Invoice Rule to None, the project's own rule. Without it, Save is refused."),
    ('c8d', 'c5_TD_DEPOT_tick',  "Tick Complete, and save. It stays ticked: two of four.")]),
  dict(id='d0', chip='D', strip='BRIDGE_BASE=http://<your-idempiere>:<port> node capex/tools/legacy_snapshot.js', span=('d0_start', 'd0_end'), beats=[
    ('d0a', 'd0_start', "Chapter D. The dashboard reads a file that a small job writes from your iDempiere. Run it in a terminal, in your copy of the repository. On a server that is not this computer, add your user and password: the Developer's note has the full line."),
    ('d0b', 'd0_done',  "A line counts what it read: fourteen projects, and nothing unavailable.")]),
  dict(id='d1', chip='D1 · D5', strip='Read **Total Projects** and **Active Projects**', span=('d1_start', 'd1_end'), beats=[
    ('d1a', 'd1_start', "Open the dashboard page, with source equals legacy."),
    ('d1b', 'd1_tiles', "Total Projects, fourteen. Active Projects, fourteen."),
    ('d1c', 'd1_panel', "Click the number. The side panel lists the projects behind it, and its row count is the figure.")]),
  dict(id='d2', chip='D2', strip='Read **Approved Budget**', span=('d2_start', 'd2_end'), beats=[
    ('d2a', 'd2_panel',   "Approved Budget is the sum of the planned amounts. Click it, and add the Approved column yourself."),
    ('d2b', 'd2_erp',     "ERP, on a project, opens that project in iDempiere."),
    ('d2c', 'd2_planned', "Planned Amount there is the same figure. Close the tab.")]),
  dict(id='d2b', chip='D2b', strip='Read the **Budget** tile (Within / Over / Not started)', span=('d2b_start', 'd2b_end'), beats=[
    ('d3a', 'd2b_start', "The Budget tile: seven within, two over, five not started."),
    ('d3b', 'd2b_over',  "Click Over. Car Park and Data Hall have spent more than their plan.")]),
  dict(id='d3', chip='D3', strip='Read **Actual Cost** (Spent)', span=('d3_start', 'd3_end'), beats=[
    ('d4a', 'd3_start', "Actual Cost rose by what you issued in chapter C: forty-three percent of plan."),
    ('d4b', 'd3_panel', "Click it, and add the Spent column. Each project's Spent is its Project Balance in iDempiere.")]),
  dict(id='d4', chip='D4', strip='Open **Procurement Risks** in the left menu', span=('d4_start', 'd4_end'), beats=[
    ('d5a', 'd4_start',  "Procurement Risks, in the left menu."),
    ('d5b', 'd4_openpo', "Open purchase orders: the five you left Drafted.")]),
]
STG = dict(TD_SUBSTATION='Ordered', TD_DATAHALL='Received', TD_BRIDGE='Invoiced', TD_RIVERSIDE='Paid', TD_SCHOOL='Paid')   # checked against the guide's D4 row by scenes3d.js (G.stages); a wrong word here FAILS the take's own d4_* check names
for i, p in enumerate(['TD_SUBSTATION', 'TD_DATAHALL', 'TD_BRIDGE', 'TD_RIVERSIDE', 'TD_SCHOOL']):
    sid = 'd4_' + p; nm = [x for x in PLAN if x['project'] == p][0]['name']; strip = 'the **Supply chain** card shows that project\'s order at the stage you took it to'
    if i == 0: SCENES.append(dict(id=sid, chip='D4', strip=strip, span=(sid + '_start', sid + '_end'), beats=[
          ('d6a', sid + '_start', "Now a project's own page. Click a number, then the project in the panel."),
          ('d6b', sid + '_chain', "Its Procurement tab shows the order at the stage you took it to. %s: %s only." % (nm, STG[p]))]))
    else: SCENES.append(rep(sid, 'D4', strip, 'd6_%d' % i, "%s: %s." % (nm, STG[p])))
SCENES += [
  dict(id='d5', chip='D5 · D6', strip='On the project page of *TD_RIVERSIDE*, open the tabs', span=('d5_start', 'd5_end'), beats=[
    ('d7a', 'd5_page',     "Riverside Tower. Overview: the approved amount, and five phases."),
    ('d7b', 'd5_schedule', "The Schedule tab draws the five phase bars, the first three complete.")]),
  dict(id='d7', chip='D7', strip='Open **ƒ formula** under a tile', span=('d7_start', 'd7_end'), beats=[
    ('d8a', 'd7_formula', "Under every tile, formula shows how the figure is calculated: the same measure your iDempiere holds.")]),
  dict(id='d8', chip='D8', strip='Change **Layout** (top bar) to *Executive* and **Skin** to *Dark*, then back to *Classic* and *Light*', span=('d8_start', 'd8_end'), beats=[
    ('d9a', 'd8_start',     "Layout, Executive: fewer tiles, new labels, the same figures."),
    ('d9b', 'd8_dark',      "Skin, Dark. Then back to Classic, and Light.")]),
  # §5.17 (owner 2026-11-22: "Perhaps need no refresh"): D9 starts on the Home tab after the new log in; the log out, log in and the 30-minute wait are not shown
  dict(id='d9', chip='D9', strip='Log in to iDempiere again and read the **Home** tab', span=('click:No thanks', 'd9_end'), beats=[
    ('d10a', 'click:No thanks', "Last: iDempiere's own Home tab, after a new log in."),
    ('d10b5', 'at:d9_savepw|d9_goals|0.45', "Ten orders, four receipts, three invoices, three payments, nine issues: every one by hand."),
    ('d10c', 'd9_goals', "The CAPEX goals show the same counts as the dashboard tiles."),
    ('d10d', 'at:d9_goals|d9_end|0.5', "A goal with a target shows a percent of the target that A2 installed. So Actual Cost reads zero percent here: that is expected.")]),   # §5.19 N6
]
TITLE = dict(kicker='UAT GUIDE · HANDS ON · PART III', line1='From the model to the money', line2='orders, receipts, issues, the dashboard', note='Every click is real: the real browser, your own iDempiere.')
CLOSING = dict(line1='Every document made by hand, every figure checked:', line2='do, confirm, tick.', credit='Voice: Kokoro (local) · key sounds: eklee, CC BY 3.0 · click: GNOME')
if __name__ == '__main__':
    ids = [b[0] for s in SCENES for b in s['beats']]; assert len(ids) == len(set(ids)), 'beat ids repeat'
    print('§PLAN3 scenes=%d beats=%d sped=%d strips_missing=%s' % (len(SCENES), len(ids), sum(1 for s in SCENES if s.get('speed')), [s['id'] for s in SCENES if s['strip'] not in MD]))
    print(' '.join(s['id'] for s in SCENES))
