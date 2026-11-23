#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — scope: the cards of "Bake of 3 projects" (owner 2026-11-23: "Card should be the colorful 2 tone CH usual. Last card can be the usual prior art and credentials").
# House style = FILM_NARRATION.md PLAYBOOK C, copied from scripts/film_sap_migration/cards.py chapter(): dark #0b0f17, kicker coral #FF6B78, two-tone title
#   (line 1 off-white #F3EEE8, line 2 coral), one plain line, DejaVu Sans. Every number is read from facts.json (written by montage.py from the bake logs).
# Names (owner): JKR -> "A local Malaysian building project" (never named); Jebel may be named; Shed -> "SYSNOVA Poultry Barn project".
# End card sources: prior art = bim-compiler prompts/PRIOR_ART_BIM_FILM_2026-09-27.md (Table 1 + §(b)) and docs/4DGenerator.md §2.2-2.3; licence = bim-ootb LICENSE.
import json, os, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__)); F = json.load(open(os.path.join(D, 'facts.json')))
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; N = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG, BG2, CO, OW, SK, GR = '#0b0f17', '#0f172a', '#FF6B78', '#F3EEE8', '#7dd3fc', '#9aa4b2'
def im(a): subprocess.run(['convert'] + [str(x) for x in a], check=True)
def chapter(cid, kick, l1, l2, plain):
    p = os.path.join(D, 'card_%s.png' % cid)
    im(['-size', '1920x1080', 'xc:' + BG, '-gravity', 'center', '-font', B, '-pointsize', 34, '-fill', CO, '-annotate', '+0-210', kick, '-font', B, '-pointsize', 110, '-fill', OW, '-annotate', '+0-60', l1,
        '-fill', CO, '-annotate', '+0+90', l2, '-font', N, '-pointsize', 40, '-fill', OW, '-annotate', '+0+220', plain, p]); print('§CARD written ' + p)
n = lambda v: '{:,}'.format(v); x0 = F[F['order'][0]]
chapter('title', '4D BUILD-UP  ·  THREE BAKES', 'Bake of', '3 projects', 'One viewer build, one schedule template, nothing customised')
NAME = {'Shed': ('SYSNOVA', 'Poultry Barn project'), 'JKR': ('A local Malaysian', 'building project'), 'Jebel': ('Jebel', 'Palm Jebel Ali Mosque')}
for i, k in enumerate(F['order']):
    x = F[k]; l1, l2 = NAME[k]
    chapter(k, 'CHAPTER %d' % (i + 1), l1, l2, '%s pieces  ·  %d tasks  ·  %d working days, generated from the model' % (n(x['pieces']), x['tasks'], x['days']))
# end card: prior art + credits
p = os.path.join(D, 'card_end.png'); L = []
def t(f, s, c, x, y, s_): L.extend(['-font', f, '-pointsize', s, '-fill', c, '-annotate', '+%d+%d' % (x, y), s_])
t(B, 34, CO, 160, 90, 'PRIOR ART  (search of 2026-09-27)')
rows = [('Synchro 4D (Bentley)', 'model-based scheduling: tasks from an element order a person selects'),
        ('Navisworks TimeLiner', 'the film plays a schedule built elsewhere and linked to the model by hand'),
        ('Fuzor', 'AI-assisted linking to an imported P6 / MS Project schedule'),
        ('ALICE Technologies', 'optimises over human-written recipes, not from the bare model'),
        ('Location-Based Scheduling', 'Line of Balance: the established method this order follows')]
for i, (a, b) in enumerate(rows):
    t(B, 36, OW, 160, 160 + 70 * i, a); t(N, 28, GR, 700, 166 + 70 * i, b)
t(B, 34, SK, 160, 540, 'Here: the schedule comes from the model itself, in the browser, and stays editable.')
t(B, 34, CO, 160, 650, 'CREDITS')
cred = ['Viewer: bim-ootb  ·  MIT licence  ·  Redhuan D. Oon',
        'Build %s  ·  schedule template v%s  ·  the same for all three' % (x0['commit'], x0['tpl']),
        'Models: SYSNOVA Poultry Barn  ·  Jebel  ·  a local Malaysian building project',
        'Voice: synthetic (Kokoro, run locally)']
for i, c in enumerate(cred): t(N, 34, OW, 160, 720 + 62 * i, c)
im(['-size', '1920x1080', 'xc:' + BG2, '-gravity', 'northwest'] + L + [p]); print('§CARD written ' + p)
