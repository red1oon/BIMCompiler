-- FAMILY A (Copy* processes) cp_ documents, idempiere_pilot ONLY (never idempiere). ids 1009500-1009599.
-- Targets are DRAFT headers with NO lines; each case's preSql re-empties them so a rerun always has work.
-- invoices: targets 1009500/1009501 (copies of GardenWorld 103: BP 117, SO)
DELETE FROM c_invoicetax WHERE c_invoice_id IN (1009500,1009501);
DELETE FROM c_invoiceline WHERE c_invoice_id IN (1009500,1009501);
DELETE FROM c_invoice WHERE c_invoice_id IN (1009500,1009501);
CREATE TEMP TABLE cpa_i AS SELECT * FROM c_invoice WHERE c_invoice_id=103;
UPDATE cpa_i SET c_invoice_id=1009500, docstatus='DR', docaction='CO', processed='N', posted='N', ispaid='N', isapproved='N', c_invoice_uu=gen_random_uuid(), documentno='CP-1009500', c_order_id=NULL, grandtotal=0, totallines=0;
INSERT INTO c_invoice SELECT * FROM cpa_i;
UPDATE cpa_i SET c_invoice_id=1009501, c_invoice_uu=gen_random_uuid(), documentno='CP-1009501';
INSERT INTO c_invoice SELECT * FROM cpa_i;
-- orders: targets 1009500/1009501 (copies of GardenWorld 102: BP 117, SO)
DELETE FROM c_ordertax WHERE c_order_id IN (1009500,1009501);
DELETE FROM c_orderline WHERE c_order_id IN (1009500,1009501);
DELETE FROM c_order WHERE c_order_id IN (1009500,1009501);
CREATE TEMP TABLE cpa_o AS SELECT * FROM c_order WHERE c_order_id=102;
UPDATE cpa_o SET c_order_id=1009500, docstatus='DR', docaction='CO', processed='N', posted='N', isapproved='N', isdelivered='N', isinvoiced='N', c_order_uu=gen_random_uuid(), documentno='CP-1009500', c_doctype_id=0, grandtotal=0, totallines=0;
INSERT INTO c_order SELECT * FROM cpa_o;
UPDATE cpa_o SET c_order_id=1009501, c_order_uu=gen_random_uuid(), documentno='CP-1009501';
INSERT INTO c_order SELECT * FROM cpa_o;
-- GL journal: batches 1009500 (CopyFromJournal target, empty) / 1009501 + journal 1009501 (CopyFromJournalDoc target, no lines)
DELETE FROM gl_journalline WHERE gl_journal_id IN (SELECT gl_journal_id FROM gl_journal WHERE gl_journalbatch_id IN (1009500,1009501));
DELETE FROM gl_journal WHERE gl_journalbatch_id IN (1009500,1009501);
DELETE FROM gl_journalbatch WHERE gl_journalbatch_id IN (1009500,1009501);
CREATE TEMP TABLE cpa_b AS SELECT * FROM gl_journalbatch WHERE gl_journalbatch_id=100;
UPDATE cpa_b SET gl_journalbatch_id=1009500, docstatus='DR', docaction='CO', processed='N', totaldr=0, totalcr=0, gl_journalbatch_uu=gen_random_uuid(), documentno='CP-1009500';
INSERT INTO gl_journalbatch SELECT * FROM cpa_b;
UPDATE cpa_b SET gl_journalbatch_id=1009501, gl_journalbatch_uu=gen_random_uuid(), documentno='CP-1009501';
INSERT INTO gl_journalbatch SELECT * FROM cpa_b;
CREATE TEMP TABLE cpa_j AS SELECT * FROM gl_journal WHERE gl_journal_id=100;
UPDATE cpa_j SET gl_journal_id=1009501, gl_journalbatch_id=1009501, docstatus='DR', docaction='CO', processed='N', posted='N', isapproved='N', totaldr=0, totalcr=0, gl_journal_uu=gen_random_uuid(), documentno='CP-1009501';
INSERT INTO gl_journal SELECT * FROM cpa_j;
-- bank statement: target 1009500 (copy of DR statement 101, no lines); source 1009510 (CO copy of 100) with ONE non-payment line (charge) + ONE payment line
DELETE FROM c_bankstatementline WHERE c_bankstatement_id IN (1009500,1009510);
DELETE FROM c_bankstatement WHERE c_bankstatement_id IN (1009500,1009510);
CREATE TEMP TABLE cpa_s AS SELECT * FROM c_bankstatement WHERE c_bankstatement_id=101;
UPDATE cpa_s SET c_bankstatement_id=1009500, docstatus='DR', docaction='CO', processed='N', posted='N', isapproved='N', beginningbalance=0, endingbalance=0, statementdifference=0, c_bankstatement_uu=gen_random_uuid(), documentno='CP-1009500';
INSERT INTO c_bankstatement SELECT * FROM cpa_s;
CREATE TEMP TABLE cpa_s2 AS SELECT * FROM c_bankstatement WHERE c_bankstatement_id=100;
UPDATE cpa_s2 SET c_bankstatement_id=1009510, c_bankstatement_uu=gen_random_uuid(), documentno='CP-1009510', docstatus='CO', docaction='CL', processed='Y', statementdifference=0, endingbalance=0;
INSERT INTO c_bankstatement SELECT * FROM cpa_s2;
CREATE TEMP TABLE cpa_l AS SELECT * FROM c_bankstatementline WHERE c_bankstatementline_id=100;
UPDATE cpa_l SET c_bankstatementline_id=1009510, c_bankstatement_id=1009510, line=10, c_payment_id=NULL, c_invoice_id=NULL, c_bpartner_id=NULL, c_charge_id=100, stmtamt=100, trxamt=0, chargeamt=100, interestamt=0, description='cp_ charge line', c_bankstatementline_uu=gen_random_uuid(), processed='Y';
INSERT INTO c_bankstatementline SELECT * FROM cpa_l;
UPDATE cpa_l SET c_bankstatementline_id=1009511, line=20, c_payment_id=1000000, stmtamt=100.7, trxamt=100.7, chargeamt=0, c_charge_id=NULL, description='cp_ payment line', c_bankstatementline_uu=gen_random_uuid();
INSERT INTO c_bankstatementline SELECT * FROM cpa_l;
-- product: target 1009500 (copy of 128, which has prices/replenish/bpartner-product/related); fresh value + uuid
DELETE FROM m_productprice WHERE m_product_id=1009500;
DELETE FROM m_replenish WHERE m_product_id=1009500;
DELETE FROM c_bpartner_product WHERE m_product_id=1009500;
DELETE FROM m_relatedproduct WHERE m_product_id=1009500;
DELETE FROM m_product WHERE m_product_id=1009500;
CREATE TEMP TABLE cpa_p AS SELECT * FROM m_product WHERE m_product_id=128;
UPDATE cpa_p SET m_product_id=1009500, value='CP-1009500', name='CP-1009500', m_product_uu=gen_random_uuid(), upc=NULL, sku=NULL;
INSERT INTO m_product SELECT * FROM cpa_p;

-- ===== SOURCE documents with RENUMBERED lines (Line 1010,1020,...): a Line value of 10 collides with the harness's NEW-id mapping
-- (AD_PInstance_Para's SeqNo 10 is a primary-key value of a ref-inserted row, so any ref column equal to 10 is rewritten to NEW) =====
DELETE FROM c_orderline WHERE c_order_id IN (1009590,1009591);
DELETE FROM c_order WHERE c_order_id IN (1009590,1009591);
CREATE TEMP TABLE cpa_so AS SELECT * FROM c_order WHERE c_order_id IN (102,105);
UPDATE cpa_so SET c_order_uu=gen_random_uuid(), documentno='CP-'||(1009590 + CASE c_order_id WHEN 102 THEN 0 ELSE 1 END), c_order_id=1009590 + CASE c_order_id WHEN 102 THEN 0 ELSE 1 END;
INSERT INTO c_order SELECT * FROM cpa_so;
CREATE TEMP TABLE cpa_sol AS SELECT *, row_number() OVER (ORDER BY c_order_id, line) AS rn FROM c_orderline WHERE c_order_id IN (102,105);
UPDATE cpa_sol SET c_orderline_id=1009499+rn, c_orderline_uu=gen_random_uuid(), c_order_id=1009590 + CASE c_order_id WHEN 102 THEN 0 ELSE 1 END, line=line+1000;
ALTER TABLE cpa_sol DROP COLUMN rn;
INSERT INTO c_orderline SELECT * FROM cpa_sol;
DELETE FROM c_invoiceline WHERE c_invoice_id IN (1009590,1009591);
DELETE FROM c_invoice WHERE c_invoice_id IN (1009590,1009591);
CREATE TEMP TABLE cpa_si AS SELECT * FROM c_invoice WHERE c_invoice_id IN (103,106);
UPDATE cpa_si SET c_invoice_uu=gen_random_uuid(), documentno='CP-'||(1009590 + CASE c_invoice_id WHEN 103 THEN 0 ELSE 1 END), c_invoice_id=1009590 + CASE c_invoice_id WHEN 103 THEN 0 ELSE 1 END, c_order_id=NULL;
INSERT INTO c_invoice SELECT * FROM cpa_si;
CREATE TEMP TABLE cpa_sil AS SELECT *, row_number() OVER (ORDER BY c_invoice_id, line) AS rn FROM c_invoiceline WHERE c_invoice_id IN (103,106);
UPDATE cpa_sil SET c_invoiceline_id=1009499+rn, c_invoiceline_uu=gen_random_uuid(), c_invoice_id=1009590 + CASE c_invoice_id WHEN 103 THEN 0 ELSE 1 END, line=line+1000, c_orderline_id=NULL, m_inoutline_id=NULL;
ALTER TABLE cpa_sil DROP COLUMN rn;
INSERT INTO c_invoiceline SELECT * FROM cpa_sil;
UPDATE c_invoiceline SET qtyentered=11, qtyinvoiced=11 WHERE c_invoice_id IN (1009590,1009591) AND (qtyentered=10 OR qtyinvoiced=10);   -- a quantity of 10 collides with the harness NEW-id mapping (ad_pinstance_para SeqNo 10)
DELETE FROM gl_journalline WHERE gl_journal_id IN (1009590,1009591);
DELETE FROM gl_journal WHERE gl_journal_id IN (1009590,1009591);
DELETE FROM gl_journalbatch WHERE gl_journalbatch_id=1009590;
CREATE TEMP TABLE cpa_sb AS SELECT * FROM gl_journalbatch WHERE gl_journalbatch_id=100;
UPDATE cpa_sb SET gl_journalbatch_id=1009590, gl_journalbatch_uu=gen_random_uuid(), documentno='CP-1009590';
INSERT INTO gl_journalbatch SELECT * FROM cpa_sb;
CREATE TEMP TABLE cpa_sj AS SELECT * FROM gl_journal WHERE gl_journal_id IN (100,200000);
UPDATE cpa_sj SET gl_journal_uu=gen_random_uuid(), documentno='CP-'||(1009590 + CASE gl_journal_id WHEN 100 THEN 0 ELSE 1 END), gl_journal_id=1009590 + CASE gl_journal_id WHEN 100 THEN 0 ELSE 1 END, gl_journalbatch_id=1009590;
INSERT INTO gl_journal SELECT * FROM cpa_sj;
CREATE TEMP TABLE cpa_sjl AS SELECT *, row_number() OVER (ORDER BY gl_journal_id, line) AS rn FROM gl_journalline WHERE gl_journal_id IN (100,200000);
UPDATE cpa_sjl SET gl_journalline_id=1009499+rn, gl_journalline_uu=gen_random_uuid(), gl_journal_id=1009590 + CASE gl_journal_id WHEN 100 THEN 0 ELSE 1 END, line=line+1000;
ALTER TABLE cpa_sjl DROP COLUMN rn;
INSERT INTO gl_journalline SELECT * FROM cpa_sjl;
-- bank statement target 1009500 gets ONE inactive line numbered 1000 so the copied line is numbered MAX(Line)+10 = 1010 (never 10)
DELETE FROM c_bankstatementline WHERE c_bankstatementline_id=1009509;
CREATE TEMP TABLE cpa_l0 AS SELECT * FROM c_bankstatementline WHERE c_bankstatementline_id=1009510;
UPDATE cpa_l0 SET c_bankstatementline_id=1009509, c_bankstatement_id=1009500, line=1000, isactive='N', stmtamt=0, trxamt=0, chargeamt=0, c_charge_id=NULL, description='cp_ placeholder (inactive)', c_bankstatementline_uu=gen_random_uuid(), processed='N';
INSERT INTO c_bankstatementline SELECT * FROM cpa_l0;
UPDATE c_bankstatementline SET line=1010 WHERE c_bankstatementline_id=1009510;
UPDATE c_bankstatementline SET line=1020 WHERE c_bankstatementline_id=1009511;
SELECT 'src', (SELECT count(*) FROM c_orderline WHERE c_order_id>=1009590), (SELECT count(*) FROM c_invoiceline WHERE c_invoice_id>=1009590), (SELECT count(*) FROM gl_journalline WHERE gl_journal_id>=1009590);
-- product 1009501 (target) / 1009591 (source with ONE download row only, no prices/replenish/bpartner/related) for the single-key-table CopyProduct case
DELETE FROM m_productdownload WHERE m_product_id IN (1009500,1009501,1009591);
DELETE FROM m_product WHERE m_product_id IN (1009501,1009591);
CREATE TEMP TABLE cpa_p2 AS SELECT * FROM m_product WHERE m_product_id=128;
UPDATE cpa_p2 SET m_product_id=1009501, value='CP-1009501', name='CP-1009501', m_product_uu=gen_random_uuid(), upc=NULL, sku=NULL;
INSERT INTO m_product SELECT * FROM cpa_p2;
UPDATE cpa_p2 SET m_product_id=1009591, value='CP-1009591', name='CP-1009591', m_product_uu=gen_random_uuid();
INSERT INTO m_product SELECT * FROM cpa_p2;
SELECT 'inv', c_invoice_id, docstatus FROM c_invoice WHERE c_invoice_id>=1009500 AND c_invoice_id<1009600
 UNION ALL SELECT 'ord', c_order_id, docstatus FROM c_order WHERE c_order_id>=1009500 AND c_order_id<1009600
 UNION ALL SELECT 'jb', gl_journalbatch_id, docstatus FROM gl_journalbatch WHERE gl_journalbatch_id>=1009500 AND gl_journalbatch_id<1009600
 UNION ALL SELECT 'bs', c_bankstatement_id, docstatus FROM c_bankstatement WHERE c_bankstatement_id>=1009500 AND c_bankstatement_id<1009600
 UNION ALL SELECT 'prod', m_product_id, value FROM m_product WHERE m_product_id=1009500;
