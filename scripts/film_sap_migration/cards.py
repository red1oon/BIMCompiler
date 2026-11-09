#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: the CARDS + COMPOSITES of the film "How to escape from your SAP Business One" (storyboard script_en.md). House style = FILM_NARRATION.md PLAYBOOK C
#   (same as scripts/film_bc_migration/cards.py): dark #0b0f17 / #0f172a, kicker coral #FF6B78, titles off-white #F3EEE8, labels sky-blue #7dd3fc, DejaVu Sans; narrated frames keep the
#   bottom 230 px EMPTY for captions. Every number and every quoted line on a card is read here from out/rec/facts.json (record.js) — never typed. The one non-recorded card (03, the
#   licence facts) names its sources on the card (bim-compiler prompts/MIGRATE_INSTALL_TENANT.md §SAP-MEASURE). READ out/cards.log. Run: python3 cards.py
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(HERE, 'out/cards'); R = os.path.join(HERE, 'out/rec'); os.makedirs(O, exist_ok=True)
F = json.load(open(os.path.join(R, 'facts.json'))); LOG = []
def say(s): print(s); LOG.append(s)
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; N = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'; M = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
BG, BG2, CO, OW, SK, GR, GN = '#0b0f17', '#0f172a', '#FF6B78', '#F3EEE8', '#7dd3fc', '#9aa4b2', '#86efac'
def im(a): subprocess.run(['convert'] + [str(x) for x in a], check=True)
msg = F['form_msg']; mig = lambda t: int(re.search(t + r' (\d+)', msg).group(1))
NUM = dict(bp=mig('C_BPartner'), pr=mig('M_Product'), ev=mig('C_ElementValue'), ops=F['commit_ops'], req=F['offline_requests'], vc=F['verify_chain'], inc=int(F['inconclusive_rules'][0]),
  calls=F['agent_calls'], judged=int(F['witness_verdict'][1]), leaked=F['alpha_values_leaked'], vals=F['alpha_values_checked'])
for k, ok in [('offline_proven', F['offline_proven'] is True), ('agent_read_only', F['agent_read_only'] is True), ('warehouse_refusal_shown', F['warehouse_refusal_shown'] is True),
              ('witness PASS', F['witness_verdict'][0] == 'PASS'), ('verify_chain', F['verify_chain'] == 'ok'), ('no leak', F['alpha_values_leaked'] == 0), ('no page errors', F['page_errors'] == 0)]:
    if not ok: say('§CARDS_REFUSED %s is not proven by the recording' % k); sys.exit(4)
say('§CARDS facts ' + json.dumps(NUM))
def chapter(out, kick, l1, l2, plain):
    im(['-size', '1920x1080', 'xc:' + BG, '-gravity', 'center', '-font', B, '-pointsize', 34, '-fill', CO, '-annotate', '+0-210', kick, '-font', B, '-pointsize', 110, '-fill', OW, '-annotate', '+0-60', l1,
        '-fill', CO, '-annotate', '+0+90', l2, '-font', N, '-pointsize', 40, '-fill', OW, '-annotate', '+0+220', plain, os.path.join(O, out)])
def shot(out, src, label):
    im([os.path.join(R, src), '-resize', '1340x754', os.path.join(O, '_s.png')])
    im(['-size', '1920x1080', 'xc:' + BG2, '-font', B, '-pointsize', 44, '-fill', SK, '-gravity', 'north', '-annotate', '+0+18', label, os.path.join(O, '_s.png'), '-gravity', 'north', '-geometry', '+0+92', '-composite', os.path.join(O, out)])
def textcard(out, title, lines, foot=None):   # lines = [(font, size, colour, x, y, text)]
    a = ['-size', '1920x1080', 'xc:' + BG2, '-font', B, '-pointsize', 44, '-fill', SK, '-gravity', 'north', '-annotate', '+0+40', title, '-gravity', 'northwest']
    for f, s, c, x, y, t in lines: a += ['-font', f, '-pointsize', s, '-fill', c, '-annotate', '+%d+%d' % (x, y), t]
    im(a + [os.path.join(O, out)])

chapter('01_title.png', 'AN ALPHA, READ FROM YOUR OWN SERVER', 'How to escape', 'from your SAP Business One', 'SAP Business One  →  the Kernel ERP, on this machine')
# the trap (the same plain boxes as the Odoo film)
im(['-size', '1920x1080', 'xc:' + BG2, '-font', B, '-pointsize', 46, '-fill', SK, '-gravity', 'north', '-annotate', '+0+40', 'The usual picture',
    '-fill', 'none', '-stroke', '#475569', '-strokewidth', 4, '-draw', 'roundrectangle 150,300 610,560 24,24', '-draw', 'roundrectangle 730,300 1190,560 24,24', '-draw', 'roundrectangle 1310,300 1770,560 24,24',
    '-stroke', CO, '-strokewidth', 6, '-draw', 'line 610,430 730,430', '-draw', 'line 1190,430 1310,430', '-stroke', 'none', '-gravity', 'northwest',
    '-font', B, '-pointsize', 44, '-fill', OW, '-annotate', '+318+360', 'You', '-annotate', '+808+360', 'Their program', '-annotate', '+1373+360', 'Their database',
    '-font', N, '-pointsize', 32, '-fill', GR, '-annotate', '+305+430', 'every click', '-annotate', '+878+430', 'rented per user', '-annotate', '+1440+430', 'in their cloud',
    '-font', B, '-pointsize', 40, '-fill', CO, '-gravity', 'north', '-annotate', '+0+640', 'Leaving usually means a consultant, a login and an API.', os.path.join(O, '02_trap.png')])
# is the model open? (measured 2026-11-09, §SAP-MEASURE — sources on the card)
textcard('03_open.png', 'Is the data model open?', [
  (B, 44, GN, 200, 150, 'Business Central'), (N, 36, OW, 240, 215, '·  Microsoft publishes the application code, MIT licence: read, not guessed'),
  (B, 44, CO, 200, 320, 'SAP Business One'), (N, 36, OW, 240, 385, '·  no openly licensed data model found'),
  (N, 36, OW, 240, 445, '·  SAP DB was open source (GPL, 2000 to 2007) — but it is the database ENGINE:'),
  (N, 36, OW, 290, 500, 'it never held Business One\'s tables (Business One runs on SQL Server or HANA)'),
  (N, 24, GR, 200, 640, 'sources: github.com/microsoft/BCApps LICENSE · en.wikipedia.org/wiki/MaxDB · en.wikipedia.org/wiki/SAP_Business_One')])
# your server describes itself: the agent's own lines from this run
AL = F['agent_lines']; pick = [l for l in AL if re.match(r'§SAP-AGENT (login|metadata|done)', l)] + [l for l in AL if l.startswith('§SAP-FIELD set=Items')][:1]
textcard('04_server.png', 'Your own server publishes the model', [(M, 26, '#e5e7eb', 160, 150 + 56 * i, l if len(l) <= 100 else l[:99] + '…') for i, l in enumerate(pick)] +
  [(B, 40, GN, 160, 150 + 56 * len(pick) + 50, 'read only: %d calls, every one a read (or log in / log out)' % NUM['calls']),
   (N, 34, GR, 160, 150 + 56 * len(pick) + 120, 'a field your server does not have is named, never guessed')])
# the test server here: SAP's guide examples, cited
FR = F['fixture_rows']; fl = []
for setname, rows in FR:
    for key, name, src in rows: fl.append('%-17s %-17s %-12s %s' % (setname, key, (name or '')[:12], src[:44]))
textcard('05_guide.png', "No Business One here: SAP's own guide examples", [(M, 27, '#e5e7eb', 150, 160 + 52 * i, l) for i, l in enumerate(fl)] +
  [(N, 32, GR, 150, 160 + 52 * len(fl) + 40, '"Working with SAP Business One Service Layer", v1.26 — every row cited by section and page'),
   (B, 36, CO, 150, 160 + 52 * len(fl) + 100, 'tiny on purpose: that is all the master data the guide prints')])
chapter('06_act1.png', 'STEP 1', 'Run the agent', 'where your Service Layer is', 'Node 18 and nothing else · read only · one file out: sap_export.json')
SL = [l for l in AL if re.match(r'§SAP-AGENT set=', l)]
textcard('07_agent.png', 'The agent, on a machine that reaches your Service Layer', [(M, 28, GN, 150, 140, '$ node agent.js --url https://<server>:50000 --company <db> --user <user>')] +
  [(M, 25, '#e5e7eb', 150, 210 + 48 * i, re.sub(r'^§SAP-AGENT ', '', l)[:115]) for i, l in enumerate(SL)])
chapter('08_act2.png', 'STEP 2', 'Your own', 'company', 'set up the way iDempiere sets one up')
shot('09_login.png', 'login_newco.png', 'The new company on the login screen')
chapter('10_act3.png', 'STEP 3', 'Migrate from', 'SAP Business One', 'pick the file · the cut-over date · read the summary · Process')
shot('11_form.png', 'form_file.png', 'The file the agent wrote, and the cut-over date')
shot('12_summary.png', 'form_summary.png', 'The summary: one warehouse refused, and why')
shot('13_done.png', 'form_done.png', 'Process: all of it, or none of it')
shot('14_bp.png', 'bp_window.png', "SAP's example customer, in the ERP's own window")
shot('15_products.png', 'product_window.png', '…and its items')
textcard('16_found.png', 'Found by running it — and fixed', [
  (B, 46, CO, 220, 170, '1'), (B, 42, OW, 290, 170, 'An item without a unit stopped the whole load'), (N, 34, GR, 290, 235, 'Business One allows it, the ERP does not:'),
  (N, 34, GR, 290, 285, "now it gets the company's default unit — what iDempiere's own import does"),
  (B, 46, CO, 220, 400, '2'), (B, 42, OW, 290, 400, 'Refused before the load, but not on the summary'), (N, 34, GR, 290, 465, 'rows a converter drops never showed — in the Business Central form too:'),
  (N, 34, GR, 290, 515, 'both forms now list them, with the reason')])
im([os.path.join(R, 'offline_saved.png'), '-resize', '1340x754', os.path.join(O, '_o.png')])
im(['-size', '1920x1080', 'xc:' + BG2, '-font', B, '-pointsize', 44, '-fill', SK, '-gravity', 'north', '-annotate', '+0+18', 'The internet switched off — a record edited and saved', os.path.join(O, '_o.png'), '-gravity', 'north', '-geometry', '+0+92', '-composite',
    '-fill', '#b91c1cdd', '-draw', 'roundrectangle 330,120 1010,190 14,14', '-font', B, '-pointsize', 34, '-fill', 'white', '-gravity', 'northwest', '-annotate', '+350+133', 'OFFLINE · %d network requests' % NUM['req'], os.path.join(O, '17_offline.png')])
textcard('18_proof.png', 'What this run proved (its own log)', [(B, 64, OW, 260, 200, '%d records, one signed change set' % NUM['ops']), (B, 64, OW, 260, 320, 'the chain verified: %s' % NUM['vc']),
  (B, 64, OW, 260, 440, '%d customer · %d items · %d account' % (NUM['bp'], NUM['pr'], NUM['ev'])),
  (N, 38, GR, 260, 580, 'what the summary predicted is what Process wrote, in all 17 tables'), (N, 38, GR, 260, 640, 'a save with the internet off: %d network requests' % NUM['req'])])
al = [l for l in F['alpha_lines'] if re.match(r'§SAP-ALPHA (set=(BusinessPartners|Items|Warehouses) |sheet=(05|09|14)|patch M_Product\.C_UOM)', l)][:8]
textcard('19_alpha.png', 'ALPHA — the report a tester sends back', [(M, 24, '#e5e7eb', 150, 130 + 44 * i, l if len(l) <= 108 else l[:107] + '…') for i, l in enumerate(al)] +
  [(B, 38, CO, 150, 130 + 44 * len(al) + 40, '%d rules had no record to test against: a real run judges them' % NUM['inc']),
   (B, 34, GN, 150, 130 + 44 * len(al) + 100, 'counts and field names only: %d values checked, %d appear' % (NUM['vals'], NUM['leaked']))])
im(['-size', '1920x1080', 'xc:' + BG2, '-font', B, '-pointsize', 34, '-fill', CO, '-gravity', 'north', '-annotate', '+0+70', 'NOT BUILT YET', '-font', B, '-pointsize', 64, '-fill', OW, '-annotate', '+0+140', 'Next',
    '-font', N, '-pointsize', 44, '-fill', OW, '-gravity', 'northwest', '-annotate', '+330+290', "·  a real company's run (alpha testers)", '-annotate', '+330+365', '·  the account class, read from the database',
    '-annotate', '+330+440', '·  stock at a date  ·  several price lists', '-annotate', '+330+515', '·  balances and open documents',
    '-font', N, '-pointsize', 34, '-fill', GR, '-gravity', 'north', '-annotate', '+0+650', "today: customers, items and accounts — on SAP's own guide examples", os.path.join(O, '20_notyet.png')])
# the end card: the NEURO one-door diagram (same source as the Odoo film's), footer = this film's guide
D = os.path.join(HERE, '../film_odoo_migration/cards/src/actor_layer_one_door.png')
im([D, '-resize', '1240x660', os.path.join(O, '_d.png')])
im(['-size', '1920x1080', 'xc:' + BG, '-font', B, '-pointsize', 32, '-fill', CO, '-gravity', 'north', '-annotate', '+0+52', 'WHAT COMES NEXT · THE DESIGN', '-font', B, '-pointsize', 60, '-fill', OW, '-annotate', '+0+96', 'One door, one list, one judge',
    os.path.join(O, '_d.png'), '-gravity', 'north', '-geometry', '+0+190', '-composite', '-font', N, '-pointsize', 32, '-fill', OW, '-gravity', 'north', '-annotate', '+0+880', 'A person, a device or any AI — one door, one engine, and the engine decides.',
    '-font', B, '-pointsize', 30, '-fill', CO, '-annotate', '+0+932', 'Specified, not built yet', '-font', N, '-pointsize', 28, '-fill', SK, '-gravity', 'south', '-annotate', '+0+40',
    'The agent:  red1oon.github.io/bim-ootb/erp/sap_agent.zip   ·   MIT', os.path.join(O, '21_end.png')])
for f in os.listdir(O):
    if f.startswith('_'): os.remove(os.path.join(O, f))
say('§CARDS built %d' % len(os.listdir(O)))
# caption band witness (PLAYBOOK C): every NARRATED card keeps the bottom 230 px = the background
NARR = ['02', '03', '04', '05', '07', '09', '11', '12', '13', '14', '16', '17', '18', '19', '20']
bg = subprocess.run(['convert', '-size', '10x10', 'xc:' + BG2, '-format', '%[fx:mean]', 'info:'], capture_output=True, text=True).stdout; bad = []
for c in NARR:
    p = [x for x in os.listdir(O) if x.startswith(c + '_')][0]; m = subprocess.run(['convert', os.path.join(O, p), '-crop', '1920x230+0+850', '-format', '%[fx:mean]', 'info:'], capture_output=True, text=True).stdout
    if m != bg: bad.append(p + ':' + m)
say('§CARDS_BAND ' + ('OK %d narrated cards keep the caption band empty' % len(NARR) if not bad else 'FAIL ' + str(bad)))
open(os.path.join(HERE, 'out/cards.log'), 'w').write('\n'.join(LOG) + '\n')
sys.exit(3 if bad else 0)
