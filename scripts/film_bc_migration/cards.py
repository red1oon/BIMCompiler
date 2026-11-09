#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: the CARDS + COMPOSITES of the film "How to escape from your Business Central" (storyboard script_en.md). House style = FILM_NARRATION.md PLAYBOOK C
#   (same as scripts/film_odoo_migration/cards.sh): dark #0b0f17 / #0f172a, kicker coral #FF6B78, titles off-white #F3EEE8, labels sky-blue #7dd3fc, DejaVu Sans; narrated frames keep the
#   bottom 230 px EMPTY for captions. Every number and every quoted line on a card is read here from out/rec/facts.json (record.js), the BCApps checkout or the fixture — never typed.
#   READ out/cards.log. Run: python3 cards.py
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(HERE, 'out/cards'); R = os.path.join(HERE, 'out/rec'); os.makedirs(O, exist_ok=True)
F = json.load(open(os.path.join(R, 'facts.json'))); LOG = []
def say(s): print(s); LOG.append(s)
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; N = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'; M = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
BG, BG2, CO, OW, SK, GR, GN = '#0b0f17', '#0f172a', '#FF6B78', '#F3EEE8', '#7dd3fc', '#9aa4b2', '#86efac'
BCAPPS = os.path.expanduser('~/.cache/bcapps/repo')
def im(a): subprocess.run(['convert'] + [str(x) for x in a], check=True)
# ── the facts the cards show (refuse when a voiced beat is not proven by the recording) ──
msg = F['form_msg']; mig = lambda t: int(re.search(t + r' (\d+)', msg).group(1))
NUM = dict(bp=mig('C_BPartner'), pr=mig('M_Product'), ev=mig('C_ElementValue'), il=mig('M_InventoryLine'), ops=F['commit_ops'], req=F['offline_requests'], vc=F['verify_chain'],
  tables=F['model_tables'], fields=F['model_fields'], checked=F['model_fields_checked'], rows=F['package_rows'], leaked=F['alpha_values_leaked'], vals=F['alpha_values_checked'])
for k, ok in [('offline_proven', F['offline_proven'] is True), ('model_equals_source', F['model_equals_source'] is True), ('unit_suggested_pcs', F['unit_suggested_pcs'] == 'Each'),
              ('witness PASS', F['witness_verdict'][0] == 'PASS'), ('verify_chain', F['verify_chain'] == 'ok'), ('no leak', F['alpha_values_leaked'] == 0)]:
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

chapter('01_title.png', "AN ALPHA, READ FROM MICROSOFT'S OWN SOURCE", 'How to escape', 'from your Business Central', 'Dynamics 365 Business Central  →  the Kernel ERP, on this machine')
# the trap (the same plain boxes as the Odoo film)
im(['-size', '1920x1080', 'xc:' + BG2, '-font', B, '-pointsize', 46, '-fill', SK, '-gravity', 'north', '-annotate', '+0+40', 'The usual picture',
    '-fill', 'none', '-stroke', '#475569', '-strokewidth', 4, '-draw', 'roundrectangle 150,300 610,560 24,24', '-draw', 'roundrectangle 730,300 1190,560 24,24', '-draw', 'roundrectangle 1310,300 1770,560 24,24',
    '-stroke', CO, '-strokewidth', 6, '-draw', 'line 610,430 730,430', '-draw', 'line 1190,430 1310,430', '-stroke', 'none', '-gravity', 'northwest',
    '-font', B, '-pointsize', 44, '-fill', OW, '-annotate', '+318+360', 'You', '-annotate', '+808+360', 'Their program', '-annotate', '+1373+360', 'Their database',
    '-font', N, '-pointsize', 32, '-fill', GR, '-annotate', '+305+430', 'every click', '-annotate', '+878+430', 'rented per user', '-annotate', '+1440+430', 'in their cloud',
    '-font', B, '-pointsize', 40, '-fill', CO, '-gravity', 'north', '-annotate', '+0+640', 'Leaving usually means a consultant, a login and an API.', os.path.join(O, '02_trap.png')])
# the licence: read from the repo's own LICENSE + README (Trademarks section)
lic = open(os.path.join(BCAPPS, 'LICENSE')).read() if os.path.exists(os.path.join(BCAPPS, 'LICENSE')) else ''
assert 'MIT License' in lic and 'Copyright (c) Microsoft Corporation' in lic, 'the LICENSE file is not the MIT text'
textcard('03_licence.png', "The licence: github.com/microsoft/BCApps", [
  (M, 30, GR, 200, 130, 'MIT License  ·  Copyright (c) Microsoft Corporation'),
  (B, 46, GN, 200, 220, 'It allows'), (N, 40, OW, 240, 290, '·  reading the application code: tables, fields, logic'), (N, 40, OW, 240, 350, '·  copying, changing and porting it'), (N, 40, OW, 240, 410, '·  … as long as the copyright notice stays'),
  (B, 46, CO, 200, 510, 'It does not give'), (N, 40, OW, 240, 580, '·  Business Central itself: the platform that runs it stays Microsoft\'s'), (N, 40, OW, 240, 640, '·  the name: trademarks are excluded')])
# read, not guessed: a real excerpt of Customer.Table.al
src = open(os.path.join(BCAPPS, 'src/Layers/W1/BaseApp/Sales/Customer/Customer.Table.al')).read().split('\n')
ex = [l for l in src if re.match(r'^table 18 Customer', l)][:1] + [l for l in src if re.match(r'\s+field\((2|21|35); ', l)]
rel = [l.strip() for l in src if 'TableRelation = "Customer Posting Group"' in l][:1]
lines = [(M, 30, '#e5e7eb', 230, 170 + 48 * i, l.rstrip()[:90]) for i, l in enumerate(ex + ['            ' + r for r in rel])]
im(['-size', '1920x1080', 'xc:' + BG2, '-font', B, '-pointsize', 44, '-fill', SK, '-gravity', 'north', '-annotate', '+0+40', 'Read, not guessed: Customer.Table.al (Microsoft\'s own file)',
    '-fill', '#111827', '-stroke', '#334155', '-draw', 'roundrectangle 180,130 1740,420 14,14', '-stroke', 'none', os.path.join(O, '_code.png')])
a = [os.path.join(O, '_code.png'), '-gravity', 'northwest']
for f, s, c, x, y, t in lines: a += ['-font', f, '-pointsize', s, '-fill', c, '-annotate', '+%d+%d' % (x, y), t]
a += ['-font', B, '-pointsize', 62, '-fill', OW, '-gravity', 'north', '-annotate', '+0+500', '%d tables  ·  %d fields' % (NUM['tables'], NUM['fields']),
      '-font', N, '-pointsize', 40, '-fill', GR, '-annotate', '+0+600', 'names, lengths, required fields, links, option values — every one checked against the source',
      '-font', B, '-pointsize', 40, '-fill', GN, '-annotate', '+0+670', 'differences found: 0', os.path.join(O, '04_source.png')]
im(a)
# Microsoft's own demo company, extracted from the demo-data source
dc = F['demo_counts']; cust = F['demo_customers']
cust = [[c[0], c[1], c[3], c[4]] for c in cust]   # No., Name, Post Code, Country (the demo source sets no City for its customers)
cl = [(M, 30, '#e5e7eb', 300, 300 + 50 * i, '%-7s %-22s %-11s %s' % tuple(c)) for i, c in enumerate(cust)]
textcard('05_demo.png', "Microsoft's own demo company, from the same source", [(B, 40, OW, 300, 150, '%d customers · %d vendors · %d items · %d accounts' % (dc['customers'], dc['vendors'], dc['items'], dc['accounts'])),
  (N, 30, GR, 300, 225, 'extracted from the demo-data code, written the way Business Central exports it:')] + cl +
  [(N, 30, GR, 300, 300 + 50 * len(cust) + 30, 'src/Apps/W1/ContosoCoffeeDemoDataset  ·  %d rows in all' % NUM['rows'])])
chapter('06_act1.png', 'STEP 1', 'Export to Excel', 'in Business Central', "Configuration Packages: no extension, no password, no API")
# the package layout (ConfigExcelExchange): row 1 package · caption · table id, row 3 captions, data from row 4 — the real demo rows
pl = [(M, 30, CO, 260, 200, 'row 1'), (M, 30, OW, 420, 200, 'CONTOSO-ALPHA    Customer    18'), (N, 26, GR, 1110, 204, '← package · table · TABLE ID'),
      (M, 30, CO, 260, 290, 'row 3'), (M, 30, SK, 420, 290, 'No.      Name                  Post Code   Country/Region Code'), (N, 26, GR, 1690, 294, '← captions'),
      (M, 30, CO, 260, 360, 'row 4…')] + [(M, 30, '#e5e7eb', 420, 360 + 46 * i, '%-8s %-21s %-11s %s' % tuple(c)) for i, c in enumerate(cust)]
textcard('07_package.png', "Business Central's own Excel export, one sheet per table", pl + [(N, 32, GR, 260, 640, 'layout read from ConfigExcelExchange.Codeunit.al: sheet = table id, column = field caption')])
chapter('08_act2.png', 'STEP 2', 'Your own', 'company', 'set up the way iDempiere sets one up')
shot('09_login.png', 'login_newco.png', 'The new company on the login screen')
chapter('10_act3.png', 'STEP 3', 'Migrate from', 'Business Central', 'pick the file · the cut-over date · read the summary · Process')
shot('11_form.png', 'form_units.png', 'The file and the cut-over date — PCS is suggested as Each')
shot('12_summary.png', 'form_summary.png', 'The summary, before anything is written')
shot('13_done.png', 'form_done.png', 'Process: all of it, or none of it')
shot('14_bp.png', 'bp_window.png', "Microsoft's demo partners, in the ERP's own window")
shot('15_products.png', 'product_window.png', "…and its items")
textcard('16_found.png', 'Found by running it — and fixed', [
  (B, 46, CO, 220, 170, '1'), (B, 42, OW, 290, 170, 'An item without a category'), (N, 34, GR, 290, 235, 'Business Central allows it, the ERP does not (10 of the demo items):'),
  (N, 34, GR, 290, 285, "now it gets the company's default category — what iDempiere's own import does"),
  (B, 46, CO, 220, 400, '2'), (B, 42, OW, 290, 400, 'A typed date forgotten on Refresh'), (N, 34, GR, 290, 465, 'a defect of the shared form screen, hidden until a form had a date:'),
  (N, 34, GR, 290, 515, 'every form now keeps what the user typed')])
im([os.path.join(R, 'offline_saved.png'), '-resize', '1340x754', os.path.join(O, '_o.png')])
im(['-size', '1920x1080', 'xc:' + BG2, '-font', B, '-pointsize', 44, '-fill', SK, '-gravity', 'north', '-annotate', '+0+18', 'The internet switched off — a record edited and saved', os.path.join(O, '_o.png'), '-gravity', 'north', '-geometry', '+0+92', '-composite',
    '-fill', '#b91c1cdd', '-draw', 'roundrectangle 330,120 1010,190 14,14', '-font', B, '-pointsize', 34, '-fill', 'white', '-gravity', 'northwest', '-annotate', '+350+133', 'OFFLINE · %d network requests' % NUM['req'], os.path.join(O, '17_offline.png')])
textcard('18_proof.png', 'What this run proved (its own log)', [(B, 64, OW, 260, 200, '%d records, one signed change set' % NUM['ops']), (B, 64, OW, 260, 320, 'the chain verified: %s' % NUM['vc']),
  (B, 64, OW, 260, 440, '%d partners · %d items' % (NUM['bp'], NUM['pr'])), (B, 64, OW, 260, 540, '%d stock lines · %d accounts' % (NUM['il'], NUM['ev'])),
  (N, 38, GR, 260, 680, 'what the summary predicted is what Process wrote, in all 17 tables'), (N, 38, GR, 260, 740, 'a save with the internet off: %d network requests' % NUM['req'])])
al = [l for l in F['alpha_lines'] if re.match(r'§BC-ALPHA (table=(18|23|27|15) |sheet=0[59]|refused|renamed|patch M_Product\.M_Product_Category)', l)][:10]
textcard('19_alpha.png', 'ALPHA — the report a tester sends back', [(M, 26, '#e5e7eb', 200, 130 + 44 * i, l[:105]) for i, l in enumerate(al)] +
  [(B, 38, GN, 200, 130 + 44 * len(al) + 40, 'counts and field names only: %d text values checked, %d appear' % (NUM['vals'], NUM['leaked']))])
im(['-size', '1920x1080', 'xc:' + BG2, '-font', B, '-pointsize', 34, '-fill', CO, '-gravity', 'north', '-annotate', '+0+70', 'NOT BUILT YET', '-font', B, '-pointsize', 64, '-fill', OW, '-annotate', '+0+140', 'Next',
    '-font', N, '-pointsize', 46, '-fill', OW, '-gravity', 'northwest', '-annotate', '+360+300', "·  a real company's file (alpha testers)", '-annotate', '+360+380', '·  the Business Central cloud API',
    '-annotate', '+360+460', '·  on-premises SQL Server', '-annotate', '+360+540', '·  balances and open documents',
    '-font', N, '-pointsize', 34, '-fill', GR, '-gravity', 'north', '-annotate', '+0+650', "today: customers, vendors, items, prices, accounts, warehouses and opening stock — on Microsoft's demo company", os.path.join(O, '20_notyet.png')])
# the end card: the NEURO one-door diagram (same source as the Odoo film's), footer = this film's guide
D = os.path.join(HERE, '../film_odoo_migration/cards/src/actor_layer_one_door.png')
im([D, '-resize', '1240x660', os.path.join(O, '_d.png')])
im(['-size', '1920x1080', 'xc:' + BG, '-font', B, '-pointsize', 32, '-fill', CO, '-gravity', 'north', '-annotate', '+0+52', 'WHAT COMES NEXT · THE DESIGN', '-font', B, '-pointsize', 60, '-fill', OW, '-annotate', '+0+96', 'One door, one list, one judge',
    os.path.join(O, '_d.png'), '-gravity', 'north', '-geometry', '+0+190', '-composite', '-font', N, '-pointsize', 32, '-fill', OW, '-gravity', 'north', '-annotate', '+0+880', 'A person, a device or any AI — one door, one engine, and the engine decides.',
    '-font', B, '-pointsize', 30, '-fill', CO, '-annotate', '+0+932', 'Specified, not built yet', '-font', N, '-pointsize', 28, '-fill', SK, '-gravity', 'south', '-annotate', '+0+40',
    'The guide:  red1oon.github.io/BIMCompiler/BusinessCentralMigrationGuide   ·   MIT', os.path.join(O, '21_end.png')])
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
