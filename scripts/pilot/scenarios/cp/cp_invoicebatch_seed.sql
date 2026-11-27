-- cp_ fixture (pilot DB only): one open AP invoice batch for CalloutInvoiceBatch witness
DELETE FROM c_invoicebatchline WHERE c_invoicebatch_id=1009342;
DELETE FROM c_invoicebatch WHERE c_invoicebatch_id=1009342;
INSERT INTO c_invoicebatch (c_invoicebatch_id, ad_client_id, ad_org_id, createdby, updatedby, documentno, datedoc, issotrx, salesrep_id, c_currency_id, c_conversiontype_id, c_invoicebatch_uu)
VALUES (1009342, 11, 11, 100, 100, 'CP-1009342', '2026-09-15', 'N', 100, 100, 114, gen_random_uuid());
SELECT c_invoicebatch_id, documentno, issotrx FROM c_invoicebatch WHERE c_invoicebatch_id=1009342;
