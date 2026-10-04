-- cp_ draft parents for the payment-family callout witnesses (idempiere_pilot ONLY). Copies of GardenWorld rows, ids +1009000.
DELETE FROM c_payment WHERE c_payment_id=1009101;
CREATE TEMP TABLE tp AS SELECT * FROM c_payment WHERE c_payment_id=101;
UPDATE tp SET c_payment_id=1009101, docstatus='DR', docaction='CO', processed='N', posted='N', isallocated='N', isreconciled='N', c_payment_uu=gen_random_uuid(), documentno='CP-1009101', c_invoice_id=NULL, c_order_id=NULL, c_charge_id=NULL;
INSERT INTO c_payment SELECT * FROM tp;
DELETE FROM c_payment WHERE c_payment_id=1009100;
CREATE TEMP TABLE tq AS SELECT * FROM c_payment WHERE c_payment_id=101;
UPDATE tq SET c_payment_id=1009100, docstatus='DR', docaction='CO', processed='N', posted='N', isallocated='N', isreconciled='N', c_payment_uu=gen_random_uuid(), documentno='CP-1009100', c_invoice_id=103, c_order_id=NULL, c_charge_id=NULL;
INSERT INTO c_payment SELECT * FROM tq;
DELETE FROM c_payselection WHERE c_payselection_id=1009100;
CREATE TEMP TABLE ts AS SELECT * FROM c_payselection WHERE c_payselection_id=100;
UPDATE ts SET c_payselection_id=1009100, processed='N', processing='N', c_payselection_uu=gen_random_uuid(), name='CP-1009100', paydate='2006-12-15';
INSERT INTO c_payselection SELECT * FROM ts;
SELECT c_payment_id, docstatus, processed FROM c_payment WHERE c_payment_id=1009101;
SELECT c_payselection_id, processed FROM c_payselection WHERE c_payselection_id=1009100;
DELETE FROM c_depositbatch WHERE c_depositbatch_id=1009100;
INSERT INTO c_depositbatch (ad_client_id,ad_org_id,c_bankaccount_id,c_doctype_id,created,createdby,createfrom,datedeposit,datedoc,depositamt,description,docstatus,documentno,isactive,processed,processing,updated,updatedby,c_depositbatch_id,c_depositbatch_uu,docaction,c_currency_id)
 VALUES (11,11,100,(SELECT MIN(c_doctype_id) FROM c_doctype WHERE ad_client_id=11),now(),100,'N','2006-12-15','2006-12-15',75.25,'cp_ deposit batch','DR','CP-1009100','Y','N','N',now(),100,1009100,gen_random_uuid(),'CO',100);
SELECT c_depositbatch_id, depositamt FROM c_depositbatch WHERE c_depositbatch_id=1009100;
