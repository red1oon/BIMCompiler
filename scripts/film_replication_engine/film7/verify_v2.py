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
# (a) cards gate: EXACTLY two cards, the opening chapter card first and the closing card last (owner's exception); any other card fails
def gate(items):
    names = [i[1] for i in items]; kinds = [i[0] for i in items]; cards = [n for n, k in zip(names, kinds) if k == 'card']
    return cards == ['part2', 'closing_card'] and kinds[0] == 'card' and kinds[-1] == 'card' and names[0] == 'part2' and names[-1] == 'closing_card' and all(k == 'beat' for k in kinds[1:-1])
chk('cards-gate-real', gate(ad.ITEMS), f'cards={[i[1] for i in ad.ITEMS if i[0] == "card"]}')
mid = list(ad.ITEMS); mid.insert(5, ('card', 'extra', {}))
chk('mutant-middle-card-fails', not gate(mid), 'a card in the middle is rejected')
ext = list(ad.ITEMS) + [('card', 'extra', {})]; chk('mutant-third-card-fails', not gate(ext), 'a third card at the end is rejected')
sw = list(ad.ITEMS); sw[0], sw[-1] = sw[-1], sw[0]; chk('mutant-swapped-cards-fails', not gate(sw), 'cards in the wrong positions are rejected')
chk('mutant-no-opening-fails', not gate(ad.ITEMS[1:]), 'missing opening card is rejected')
chk('only-real-screens', all(i[2]['image'][0] in ('shot', 'two') for i in ad.ITEMS if i[0] == 'beat'), 'beat images: shot/two of real captures only')
chk('card-segments-only-two', sorted(n[:-4] for n in os.listdir(f'{B}/seg') if re.match(r'(part2|closing_card|title|ch\d|limits|closing)', n)) == ['closing_card', 'part2'], 'seg dir')
chk('closing-text-verbatim', beats_v2.CLOSING_TEXT == 'A healthy ERP is one that you can take out.' and ' '.join([ad.ITEMS[-1][2]['l1'], ad.ITEMS[-1][2]['l2']]) == beats_v2.CLOSING_TEXT, beats_v2.CLOSING_TEXT)
# (b) legacy screen == witnessed figures
F = json.load(open(f'{B}/facts7.resolved.json')); t = open(f'{B}/rec/legacy_result.txt').read(); money = lambda s: round(float(s.replace(',', '')) * 100)
def net(acct):
    m = re.search(acct + r'_[A-Za-z \-]+? ([\d,]+\.\d\d) ([\d,]+\.\d\d) (?=\d{5}_)', t); return (money(m.group(1)) - money(m.group(2))) if m else None
chk('legacy-bank-equals-witness', net('11100') == money(F['ido_bank_total']['value']), f"screen net={net('11100')} cents vs §IDO-SOURCE {F['ido_bank_total']['value']}")
chk('legacy-ar-equals-witness', net('12110') == money(F['ido_ar_total']['value']), f"screen net={net('12110')} cents vs §IDO-SOURCE {F['ido_ar_total']['value']}")
tw = open(f'{B}/twin2.log').read(); m = re.search(r'RV_OpenItem: (\d+) open item\(s\).*?grandtotal openamt .*? ([\d.]+) ([\d.]+) 100 ', tw)
chk('aging-screen-equals-witness', bool(m) and m.group(1) == '1' and money(m.group(3)) == money(F['ido_ar_in']['value']), f"open items screen: count={m and m.group(1)} openamt={m and m.group(3)} vs §MIG-OPEN AR {F['ido_ar_in']['value']}")
ol = open(f'{B}/order.log').read(); c = lambda s: round(float(s) * 100)
bm = re.search(r'ORDER books-after-mpay \[\{"dr":([\d.]+),"cr":([\d.]+)', ol); bl = re.search(r'ORDER books-legs \[\{"dr":([\d.]+),"cr":([\d.]+)', ol); ba = re.search(r'ORDER books-after-cycle \[\{"dr":([\d.]+),"cr":([\d.]+)', ol)
chk('books-continuity', bool(bm and bl and ba) and c(bm.group(1)) == c(bm.group(2)) and c(bl.group(1)) == c(bl.group(2)) and c(ba.group(1)) == c(ba.group(2)) and c(bm.group(1)) + c(bl.group(1)) == c(ba.group(1)) and 'books-arith OK' in ol, f"books after the moved payment {bm and bm.group(1)} + the sale's legs {bl and bl.group(1)} == books after the cycle {ba and ba.group(1)}; every total dr=cr; same tenant, same run")
chk('moved-payment-asserts', F['mpay_paid']['value'] == 'Y', f"moved invoice paid via the window, amount {F['mpay_amt']['value']}")
chk('sale-cycle-asserts', F['ord_inv_total']['value'] == F['ord_total']['value'] == F['ord_pay_amt']['value'] and F['ord_inv_paid']['value'] == 'Y', f"order {F['ord_total']['value']} == invoice {F['ord_inv_total']['value']} == payment {F['ord_pay_amt']['value']}; invoice paid={F['ord_inv_paid']['value']}; books dr=cr={F['ord_books']['value']}")
sys.argv = ['verify7.py', B]
try: runpy.run_path(os.path.join(HERE, 'verify7.py'), run_name='__main__')
except SystemExit as e: rc = e.code
else: rc = 0
print(f"§FILM-MA-V2-EXTRA judged={j} failed={f}"); sys.exit(1 if (f or rc) else 0)
