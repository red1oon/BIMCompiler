#!/usr/bin/env python3
# ⚠ DO NOT REMOVE — writes PROVENANCE7.md: each fact the film shows or says -> the § line it was read from (this session's logs), and the beats that use it. usage: provenance7.py <builddir>
import sys, re, json, os
import beats7
B = sys.argv[1]; F = json.load(open(f'{B}/facts7.resolved.json')); use = {}
for kind, name, d in beats7.ITEMS:
    if kind != 'beat': continue
    txt = ' '.join([d['short'], d['detail'], d.get('strip', '')] + (d['image'][1] if d['image'][0] == 'card' else []))
    for f in set(re.findall(r'\{(?:fact:)?([a-z0-9_]+)\}', txt)): use.setdefault(f, []).append(name)
L = ['# PROVENANCE — film "Migrating Legacy Accounting" (EN)', '', 'Every number on a card or in the voice is `{fact:id}` in `beats7.py`, resolved by `facts7_resolve.js` from a log line written in the session that built the film', '(`/tmp/count_logs/mig_*.log` from `erp/tests/run_migration_lane.sh` SLOW=1 + `witness_migration_trade.js`; `record.log` from `record7.js`). Stills are the REAL page, numbers inside them are the page\'s own.', '',
     '| fact | value | beats | source (file:line) | § line |', '|---|---|---|---|---|']
for f, v in sorted(F.items()):
    if f in use: L.append(f"| {f} | {v['value']} | {', '.join(sorted(use[f]))} | {v['src']} | `{v['line'][:150].replace('|','/')}` |")
L += ['', '## Non-numeric facts (names, treatments) — cited spec text, not log values', '- Source-table names (Odoo account.move.line, iDempiere Fact_Acct, SAP JournalEntries, BC G/L Entry), amount-left fields (amount_residual, DocTotal minus PaidToDate, Remaining Amt. (LCY), invoiceOpen) and bank treatments: spec §1/§2 of prompts/FILM_NARRATION.md (branch prompts/film-migrating-accounting), each from the MIGRATE_INSTALL_TENANT.md spec sections it cites.',
      '- Books card (beat `books`): `odoo_books` and `odoo_tb_sum` lines of record.log (Fact_Acct of the tenant read back after Process).',
      '- ALPHA label: spec §3 rule 2; `§SBO-CONN verdict=INCONCLUSIVE` in mig_sapbc_open.log.', '- Stills: record.log `§FILMREC SHOT` lines (page rects beside each png).']
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), os.environ.get('PROV_FILE', 'PROVENANCE7.md')), 'w').write('\n'.join(L) + '\n'); print('§FILM-MA-PROV facts=%d' % len([f for f in F if f in use]))
