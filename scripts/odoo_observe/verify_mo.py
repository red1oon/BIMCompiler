# Verdict for prompts/ERP_FRIENDLY_OPS_LENS.md §14: reads the MO by RPC, never from the screen.
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from rpc import ex
mid = int(sys.argv[1])
mo = ex('mrp.production', 'read', [[mid]], {'fields': ['name', 'state', 'product_qty', 'qty_produced', 'origin', 'procurement_group_id', 'move_raw_ids', 'move_finished_ids']})[0]
print('§ODOO_MO', mo['name'], 'state=' + mo['state'], 'qty=%s produced=%s' % (mo['product_qty'], mo['qty_produced']))
sib = ex('mrp.production', 'search_read', [[['procurement_group_id', '=', mo['procurement_group_id'][0]], ['id', '!=', mid]]], {'fields': ['name', 'state', 'product_qty']}) if mo['procurement_group_id'] else []
print('§ODOO_BACKORDERS n=%d %s' % (len(sib), [(x['name'], x['state'], x['product_qty']) for x in sib]))
fails = []
for kind, ids in (('raw', mo['move_raw_ids']), ('finished', mo['move_finished_ids'])):
    for mv in ex('stock.move', 'read', [ids], {'fields': ['product_id', 'state', 'product_uom_qty', 'quantity']}):
        print('§ODOO_MOVE', kind, mv['product_id'][1], 'state=' + mv['state'], 'demand=%s qty=%s' % (mv['product_uom_qty'], mv['quantity']))
        want = mo['product_qty'] if kind == 'finished' else mv['product_uom_qty']
        if mv['state'] != 'done' or want <= 0 or abs(mv['quantity'] - want) > 1e-6: fails.append(kind)
if mo['state'] != 'done': fails.append('state')
if abs(mo['qty_produced'] - mo['product_qty']) > 1e-6: fails.append('qty_produced')
if sib: fails.append('backorder')
print('§ODOO_VERDICT', 'PASS' if not fails else 'WRONG ' + ','.join(fails))
