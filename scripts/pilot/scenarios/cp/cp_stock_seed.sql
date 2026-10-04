-- FORK E fixtures: cp_ DRAFT parents (pilot DB only) so detail-tab callouts can run (a processed parent makes GridTable read-only).
DELETE FROM m_inout WHERE m_inout_id IN (1005106,1005108);
CREATE TEMP TABLE t1 AS SELECT * FROM m_inout WHERE m_inout_id IN (106,108);
UPDATE t1 SET m_inout_id=m_inout_id+1005000, docstatus='DR', docaction='CO', processed='N', posted='N', isapproved='N', m_inout_uu=gen_random_uuid(), documentno='CP-'||(m_inout_id+1005000);
INSERT INTO m_inout SELECT * FROM t1;
DELETE FROM m_movement WHERE m_movement_id=1005100;
CREATE TEMP TABLE t2 AS SELECT * FROM m_movement WHERE m_movement_id=100;
UPDATE t2 SET m_movement_id=1005100, docstatus='DR', docaction='CO', processed='N', posted='N', isapproved='N', m_movement_uu=gen_random_uuid(), documentno='CP-1005100';
INSERT INTO m_movement SELECT * FROM t2;
DELETE FROM m_requisition WHERE m_requisition_id=1005100;
CREATE TEMP TABLE t3 AS SELECT * FROM m_requisition WHERE m_requisition_id=100;
UPDATE t3 SET m_requisition_id=1005100, docstatus='DR', docaction='CO', processed='N', isapproved='N', m_requisition_uu=gen_random_uuid(), documentno='CP-1005100';
INSERT INTO m_requisition SELECT * FROM t3;
DELETE FROM gl_journal WHERE gl_journal_id=1005100;
DELETE FROM gl_journalbatch WHERE gl_journalbatch_id=1005100;
CREATE TEMP TABLE t4 AS SELECT * FROM gl_journalbatch WHERE gl_journalbatch_id=100;
UPDATE t4 SET gl_journalbatch_id=1005100, docstatus='DR', docaction='CO', processed='N', isapproved='N', gl_journalbatch_uu=gen_random_uuid(), documentno='CP-1005100';
INSERT INTO gl_journalbatch SELECT * FROM t4;
CREATE TEMP TABLE t5 AS SELECT * FROM gl_journal WHERE gl_journal_id=100;
UPDATE t5 SET gl_journal_id=1005100, gl_journalbatch_id=1005100, docstatus='DR', docaction='CO', processed='N', posted='N', isapproved='N', gl_journal_uu=gen_random_uuid(), documentno='CP-1005100';
INSERT INTO gl_journal SELECT * FROM t5;
SELECT 'io', m_inout_id, docstatus, processed FROM m_inout WHERE m_inout_id IN (1005106,1005108)
UNION ALL SELECT 'mv', m_movement_id, docstatus, processed FROM m_movement WHERE m_movement_id=1005100
UNION ALL SELECT 'req', m_requisition_id, docstatus, processed FROM m_requisition WHERE m_requisition_id=1005100
UNION ALL SELECT 'glb', gl_journalbatch_id, docstatus, processed FROM gl_journalbatch WHERE gl_journalbatch_id=1005100
UNION ALL SELECT 'gl', gl_journal_id, docstatus, processed FROM gl_journal WHERE gl_journal_id=1005100;
-- cost adjustment draft (M_Inventory, doctype 200004 Cost Adjustment, CostingMethod A, USD)
DELETE FROM m_inventory WHERE m_inventory_id=1005200;
CREATE TEMP TABLE t6 AS SELECT * FROM m_inventory WHERE m_inventory_id=100;
UPDATE t6 SET m_inventory_id=1005200, c_doctype_id=200004, costingmethod='A', c_currency_id=100, docstatus='DR', docaction='CO', processed='N', posted='N', isapproved='N', m_inventory_uu=gen_random_uuid(), documentno='CP-1005200';
INSERT INTO m_inventory SELECT * FROM t6;
SELECT 'inv', m_inventory_id, docstatus, processed FROM m_inventory WHERE m_inventory_id=1005200;
DELETE FROM m_inventory WHERE m_inventory_id=1005201; CREATE TEMP TABLE t7 AS SELECT * FROM m_inventory WHERE m_inventory_id=1005200; UPDATE t7 SET m_inventory_id=1005201, costingmethod='S', m_inventory_uu=gen_random_uuid(), documentno='CP-1005201'; INSERT INTO m_inventory SELECT * FROM t7;
-- customer-return draft (M_InOut C+, RMA 100) for CalloutInOut.rmaLine
DELETE FROM m_inout WHERE m_inout_id=1005109;
CREATE TEMP TABLE t8 AS SELECT * FROM m_inout WHERE m_inout_id=108;
UPDATE t8 SET m_inout_id=1005109, movementtype='C+', c_doctype_id=149, m_rma_id=100, c_order_id=NULL, docstatus='DR', docaction='CO', processed='N', posted='N', isapproved='N', m_inout_uu=gen_random_uuid(), documentno='CP-1005109';
INSERT INTO m_inout SELECT * FROM t8;
