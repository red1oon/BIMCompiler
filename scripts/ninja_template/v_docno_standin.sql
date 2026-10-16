-- STAND-IN for the customer-only view v_docno (real definition unknown, not in repo/log). Shape taken from the template SQL:
--   c.table_id = a.ad_table_id AND c.doc_id = a.record_id ; columns used: DocumentNo, DocName, Description.
-- Built from real document tables of the local clone ONLY (idempiere_clone). Replace with the customer definition when received.
SET search_path=adempiere;
CREATE OR REPLACE VIEW v_docno AS
 SELECT 318 AS table_id, i.c_invoice_id AS doc_id, i.documentno, dt.name AS docname, i.description FROM c_invoice i LEFT JOIN c_doctype dt ON dt.c_doctype_id=i.c_doctype_id
 UNION ALL SELECT 335, p.c_payment_id, p.documentno, dt.name, p.description FROM c_payment p LEFT JOIN c_doctype dt ON dt.c_doctype_id=p.c_doctype_id
 UNION ALL SELECT 224, j.gl_journal_id, j.documentno, dt.name, j.description FROM gl_journal j LEFT JOIN c_doctype dt ON dt.c_doctype_id=j.c_doctype_id
 UNION ALL SELECT 319, io.m_inout_id, io.documentno, dt.name, io.description FROM m_inout io LEFT JOIN c_doctype dt ON dt.c_doctype_id=io.c_doctype_id
 UNION ALL SELECT 259, o.c_order_id, o.documentno, dt.name, o.description FROM c_order o LEFT JOIN c_doctype dt ON dt.c_doctype_id=o.c_doctype_id;
