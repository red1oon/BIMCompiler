-- FORK B (CalloutOrder witness) cp_ DRAFT parents, idempiere_pilot ONLY. Copies of GardenWorld orders 102 (SO) / 104 (PO), ids +1009100.
DELETE FROM c_orderline WHERE c_order_id IN (1009202,1009204);
DELETE FROM c_order WHERE c_order_id IN (1009202,1009204);
CREATE TEMP TABLE tco AS SELECT * FROM c_order WHERE c_order_id IN (102,104);
UPDATE tco SET c_order_id=c_order_id+1009100, docstatus='DR', docaction='CO', processed='N', posted='N', isapproved='N', isdelivered='N', isinvoiced='N', c_order_uu=gen_random_uuid(), documentno='CP-'||(c_order_id+1009100), c_doctype_id=0, grandtotal=0, totallines=0;
INSERT INTO c_order SELECT * FROM tco;
SELECT c_order_id, issotrx, docstatus, processed, c_doctypetarget_id, c_bpartner_id, m_pricelist_id, dateordered FROM c_order WHERE c_order_id IN (1009202,1009204);
