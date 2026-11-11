#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — v2 verdict: verify7's checks on the v2 beat table PLUS (a) 0 card frames, (b) the legacy Account Viewer figures on screen equal the witnessed §IDO-SOURCE values. usage: verify_v2.py <v2builddir>
import sys, os, re, json, types, runpy
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); B = sys.argv[1]
import beats_v2
ad = types.ModuleType('beats7'); ad.ALPHA = beats_v2.ALPHA; ad.ITEMS = [i for i in beats_v2.ITEMS if not i[2].get('waits')]; sys.modules['beats7'] = ad
j = f = 0
def chk(k, ok, info=''):
    global j, f
    j += 1; f += 0 if ok else 1; print(f"§FILM-MA-CHECK {k} {'OK' if ok else 'FAIL'} {info}")
# (a) no card frames: no card entries, every beat image is a real capture (shot/two of rec/ files), no chapter segment
chk('no-card-entries', all(i[0] == 'beat' for i in ad.ITEMS), f'{len(ad.ITEMS)} entries')
chk('only-real-screens', all(i[2]['image'][0] in ('shot', 'two') for i in ad.ITEMS), 'image kinds shot/two only')
chk('no-card-segments', not any(re.match(r'(title|ch\d|limits|closing)', n) for n in os.listdir(f'{B}/seg')), 'seg dir')
# (b) legacy screen == witnessed figures
F = json.load(open(f'{B}/facts7.resolved.json')); t = open(f'{B}/rec/legacy_result.txt').read(); money = lambda s: round(float(s.replace(',', '')) * 100)
def net(acct):
    m = re.search(acct + r'_[A-Za-z \-]+? ([\d,]+\.\d\d) ([\d,]+\.\d\d) (?=\d{5}_)', t); return (money(m.group(1)) - money(m.group(2))) if m else None
chk('legacy-bank-equals-witness', net('11100') == money(F['ido_bank_total']['value']), f"screen net={net('11100')} cents vs §IDO-SOURCE {F['ido_bank_total']['value']}")
chk('legacy-ar-equals-witness', net('12110') == money(F['ido_ar_total']['value']), f"screen net={net('12110')} cents vs §IDO-SOURCE {F['ido_ar_total']['value']}")
sys.argv = ['verify7.py', B]
try: runpy.run_path(os.path.join(HERE, 'verify7.py'), run_name='__main__')
except SystemExit as e: rc = e.code
else: rc = 0
print(f"§FILM-MA-V2-EXTRA judged={j} failed={f}"); sys.exit(1 if (f or rc) else 0)
