DELETE FROM c_invoice WHERE c_invoice_id IN (1009103,1009104);
CREATE TEMP TABLE t AS SELECT * FROM c_invoice WHERE c_invoice_id IN (103,104);
UPDATE t SET c_invoice_id=c_invoice_id+1009000, docstatus='DR', docaction='CO', processed='N', posted='N', ispaid='N', isapproved='N', c_invoice_uu=gen_random_uuid(), documentno='CP-'||(c_invoice_id+1009000), c_order_id=NULL, grandtotal=0, totallines=0;
INSERT INTO c_invoice SELECT * FROM t;
SELECT c_invoice_id, issotrx, docstatus, processed, m_pricelist_id, c_bpartner_location_id FROM c_invoice WHERE c_invoice_id IN (1009103,1009104);
