# ⚠ DO NOT REMOVE — RPC verdict for po_flow.js: newest PO purchased, receipt done, bill posted. READ THE LOG.
from rpc import ex
po=ex('purchase.order','search_read',[[]],{'fields':['name','state','invoice_status','invoice_ids','amount_total','picking_ids'],'order':'id desc','limit':1})[0]
print('§ODOO_PO',po)
pk=ex('stock.picking','read',[po['picking_ids']],{'fields':['name','state']})
inv=ex('account.move','read',[po['invoice_ids']],{'fields':['name','state','payment_state','amount_total','move_type']})
print('§ODOO_PICK',pk); print('§ODOO_BILL',inv)
ok=po['state']=='purchase' and pk and all(x['state']=='done' for x in pk) and inv and all(i['state']=='posted' and i['move_type']=='in_invoice' for i in inv)
print('§ODOO_VERDICT','PASS' if ok else 'WRONG')
