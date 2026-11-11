#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — film7 v2 builder: reuses build7.py's functions with beats_v2.ITEMS (no cards). usage: build_v2.py <stage|prep> <v2builddir> ; stages as build7. READ the logs.
import sys, os, json, shutil, types
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
STAGE, B2 = sys.argv[1], sys.argv[2]; SRC = os.path.dirname(B2.rstrip('/')) if False else '/home/red1/bim-compiler/build/film_migrating_accounting'
import beats_v2
ad = types.ModuleType('beats7'); ad.ALPHA = beats_v2.ALPHA; ad.ITEMS = [i for i in beats_v2.ITEMS if not i[2].get('waits')]; sys.modules['beats7'] = ad
CROPS = {'legacy_ar.png': '1220x400+225+380', 'legacy_bank.png': '1220x400+225+400', 'twin_trial_balance_run.png': '700x470+790+320', 'term_sap.png': '1740x660+100+170',
         'twin_payment_window_a.png': '800x440+340+60', 'twin_salesorder_window_a.png': '800x440+340+60'}
def prep():
    R = f'{B2}/rec'; os.makedirs(R, exist_ok=True)
    for f in os.listdir(f'{SRC}/rec'): shutil.copy(f'{SRC}/rec/{f}', R)
    for d, names in (('v2', ['legacy_ar.png', 'legacy_bank.png', 'legacy_result.txt']), ('twin', ['twin_trial_balance_run.png', 'twin_payment_window_a.png', 'twin_salesorder_window_a.png']), ('term', ['term_sap.png', 'term_sap.txt'])):
        for n in names: shutil.copy(f'{SRC}/{d}/{n}', R)
    for n, c in CROPS.items(): json.dump({'crop': c}, open(f'{R}/{n[:-4]}.json', 'w'))
    shutil.copy(f'{SRC}/facts7.resolved.json', B2); shutil.copy(f'{SRC}/record.log', B2); print('§FILM-MA-V2 prep ok')
if STAGE == 'prep': prep()
else:
    sys.argv = ['build7.py', STAGE, B2]; import build7
    {'assets': build7.assets, 'measure': build7.measure, 'video': build7.video, 'fit': build7.fit, 'mux': build7.mux}[STAGE]()
