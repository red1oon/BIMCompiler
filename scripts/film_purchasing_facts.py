#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — Scope: the numbers on the parity card of the film "Purchasing and Stock Replenishment" (scripts/film_erp_purchasing.js).
# Every number is READ from a persisted witness log under build/erp/logs_* (PRIMAL LAW §5: run once, persist, read forever); a log that is missing or does not carry
# the expected summary line prints NOT_VERIFIED, never a guessed value. READ the printed §PURCH_FACT lines.
# usage: film_purchasing_facts.py <out.json>
import re, sys, json, os
B = os.path.expanduser('~/bim-compiler/build/erp')
def rd(p):
    try: return open(os.path.join(B, p), encoding='utf-8', errors='replace').read()
    except OSError: return None
def m(p, rx, g=1):
    t = rd(p); r = re.search(rx, t) if t else None
    return r.group(g) if r else None
F = {}
t = rd('logs_matchpo/w_post_matchpo_GREEN.log')
if t and 'WPO-SUMMARY PASS' in t:
    n = len(re.findall(r'§WPO doc=\S+ \S+ \S+ EQUAL', t)); tot = len(re.findall(r'§WPO doc=', t)); F['matchpo'] = [n, tot]
F['movement_facts'] = m('logs_movpost/w_post_movement_GREEN.log', r'twin accounting on (\d+) fact sets: unbalanced schemas=0 unbalanced \(schema,org\)=0 value-not-conserved lines=0')
t = rd('logs_inventory/w_inventory_GREEN.log'); r = re.search(r'§INV-SUMMARY PASS judged=(\d+) pass=(\d+) fail=0', t or '')
if r: F['inventory'] = [int(r.group(2)), int(r.group(1))]
t = rd('logs_replenish/w_replenish_GREEN.log'); r = re.search(r'§RRD-SUMMARY PASS break=none judged=(\d+) pass=(\d+) fail=0', t or '')
if r: F['replenish'] = [int(r.group(2)), int(r.group(1))]
for key, p, rx in [('confirm', 'logs_confirmui/reg_witness_movement_confirm.log', r'§MVC-SUMMARY verdict=PASS judged=(\d+) pass=(\d+) fail=0'),
                   ('confirm_ui', 'logs_confirmui/w_mcu_GREEN.log', r'§MCU-SUMMARY PASS judged=(\d+) fails=0'),
                   ('procpara', 'logs_confirmui/w_rpd_GREEN.log', r'§RPD-SUMMARY PASS judged=(\d+) fails=0'),
                   ('createfrom', 'logs_confirmui/reg_witness_createfrom_infowin.log', r'§CFIW-SUMMARY PASS judged=(\d+) fails=0')]:
    t = rd(p); r = re.search(rx, t or '')
    if r: F[key] = [int(r.group(2)), int(r.group(1))] if r.lastindex == 2 else [int(r.group(1)), int(r.group(1))]
if F.get('movement_facts'): F['movement_facts'] = int(F['movement_facts'])
for k in ['matchpo', 'movement_facts', 'inventory', 'replenish', 'confirm', 'confirm_ui', 'procpara', 'createfrom']:
    print('§PURCH_FACT %s=%s' % (k, json.dumps(F[k]) if k in F else 'NOT_VERIFIED'))
json.dump(F, open(sys.argv[1], 'w'))
