-- Revert of the ExpenseReportMaker 2Pack that a mis-pointed clone server wrote into idempiere_pilot at 2026-10-12 20:38:15-16.
SET search_path=adempiere;
BEGIN;
CREATE TEMP TABLE imp AS SELECT ad_package_imp_id FROM ad_package_imp WHERE created > '2026-10-12 20:30' AND name='ExpenseReportMaker';
DELETE FROM ad_process_para_trl WHERE ad_process_para_id IN (SELECT ad_process_para_id FROM ad_process_para WHERE ad_process_id=1000000);
DELETE FROM ad_process_para WHERE ad_process_id=1000000;
DELETE FROM ad_process_trl WHERE ad_process_id=1000000;
DELETE FROM ad_process_access WHERE ad_process_id=1000000;
DELETE FROM ad_treenodemm WHERE ad_tree_id=10 AND node_id IN (1000003,1000004) AND created > '2026-10-12 20:30';
DELETE FROM ad_menu_trl WHERE ad_menu_id IN (1000003,1000004);
DELETE FROM ad_menu WHERE ad_menu_id IN (1000003,1000004) AND created > '2026-10-12 20:30';
DELETE FROM ad_process WHERE ad_process_id=1000000 AND created > '2026-10-12 20:30';
DELETE FROM ad_attachment WHERE ad_attachment_id=1000002 AND created > '2026-10-12 20:30';
DELETE FROM ad_package_imp_detail WHERE ad_package_imp_id IN (SELECT ad_package_imp_id FROM imp);
DELETE FROM ad_package_imp_proc WHERE created > '2026-10-12 20:30';
DELETE FROM ad_package_imp_inst WHERE created > '2026-10-12 20:30';
DELETE FROM ad_package_imp WHERE ad_package_imp_id IN (SELECT ad_package_imp_id FROM imp);
DELETE FROM ad_package_exp_detail WHERE created > '2026-10-12 20:30';
DELETE FROM ad_package_exp WHERE created > '2026-10-12 20:30' AND name='Reporter';
SELECT 'remaining 2pack rows' k, (SELECT count(*) FROM ad_process WHERE ad_process_id=1000000)+(SELECT count(*) FROM ad_menu WHERE ad_menu_id IN (1000003,1000004))+(SELECT count(*) FROM ad_package_imp WHERE created>'2026-10-12 20:30')+(SELECT count(*) FROM ad_package_exp WHERE created>'2026-10-12 20:30') n;
COMMIT;
-- Sequence counters consumed by the 2Pack. Applied 2026-10-13 with the user's "yes". Each value = (max existing id)+1, verified before.
UPDATE ad_sequence SET currentnext=1000003 WHERE name='AD_Menu' AND ad_client_id=0 AND currentnext=1000005;
UPDATE ad_sequence SET currentnext=1000002 WHERE name='AD_Attachment' AND ad_client_id=0 AND currentnext=1000003;
UPDATE ad_sequence SET currentnext=1000000 WHERE name='AD_Process' AND ad_client_id=0 AND currentnext=1000001;
UPDATE ad_sequence SET currentnext=1000000 WHERE name='AD_Process_Para' AND ad_client_id=0 AND currentnext=1000003;
UPDATE ad_sequence SET currentnext=1000000 WHERE name='AD_Package_Exp' AND ad_client_id=0 AND currentnext=1000001;
UPDATE ad_sequence SET currentnext=1000000 WHERE name='AD_Package_Exp_Detail' AND ad_client_id=0 AND currentnext=1000002;
