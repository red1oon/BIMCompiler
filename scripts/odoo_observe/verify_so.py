# ⚠ DO NOT REMOVE — RPC verdict for so_flow.js: newest SO must be done: delivered, invoiced, invoice paid. READ THE LOG.
from rpc import ex
so=ex('sale.order','search_read',[[]],{'fields':['name','state','invoice_status','delivery_count','invoice_ids','amount_total'],'order':'id desc','limit':1})[0]
print('§ODOO_SO',so)
pk=ex('stock.picking','search_read',[[['sale_id','=',so['id']]]],{'fields':['name','state']}) if 'id' in so else []
inv=ex('account.move','read',[so['invoice_ids']],{'fields':['name','state','payment_state','amount_total']})
print('§ODOO_PICK',pk if pk else ex('stock.picking','search_read',[[['origin','=',so['name']]]],{'fields':['name','state']}))
print('§ODOO_INV',inv)
ok=so['state']=='sale' and all(p['state']=='done' for p in ex('stock.picking','search_read',[[['origin','=',so['name']]]],{'fields':['state']})) and inv and all(i['state']=='posted' and i['payment_state'] in('paid','in_payment') for i in inv)
print('§ODOO_VERDICT','PASS' if ok else 'WRONG')
