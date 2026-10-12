-- Clone only (idempiere_laos). Process 1300002 = the Laos fork build (ExpenseReportFork bundle); WS type Bridge_RunProcess_ExpenseReportFork.
SET search_path=adempiere;
BEGIN;
DELETE FROM ws_webservicetypeaccess WHERE ws_webservicetype_id=1300102;
DELETE FROM ws_webservice_para WHERE ws_webservicetype_id=1300102;
DELETE FROM ws_webservicetype WHERE ws_webservicetype_id=1300102;
DELETE FROM ad_process_access WHERE ad_process_id=1300002;
DELETE FROM ad_process_para WHERE ad_process_id=1300002;
DELETE FROM ad_process WHERE ad_process_id=1300002;
INSERT INTO ad_process (ad_process_id,ad_client_id,ad_org_id,createdby,updatedby,value,name,accesslevel,entitytype,isreport,classname,ad_process_uu)
 VALUES (1300002,0,0,100,100,'ExpenseReportFork','ExpenseReport Laos fork','3','U','N','org.my.process.ExpenseReportFork',gen_random_uuid());
INSERT INTO ad_process_para (ad_process_para_id,ad_client_id,ad_org_id,createdby,updatedby,name,ad_process_id,seqno,ad_reference_id,columnname,fieldlength,ismandatory,entitytype,ad_process_para_uu) VALUES
 (1300021,0,0,100,100,'DateFrom',1300002,10,15,'DateFrom',7,'N','U',gen_random_uuid()),
 (1300022,0,0,100,100,'DateTo',1300002,20,15,'DateTo',7,'N','U',gen_random_uuid()),
 (1300023,0,0,100,100,'File_Directory',1300002,30,10,'File_Directory',255,'N','U',gen_random_uuid());
INSERT INTO ad_process_access (ad_process_id,ad_role_id,ad_client_id,ad_org_id,createdby,updatedby,isreadwrite,ad_process_access_uu) VALUES (1300002,102,11,0,100,100,'Y',gen_random_uuid());
INSERT INTO ws_webservicetype (ad_client_id,ad_org_id,ad_table_id,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,created,createdby,updated,updatedby)
 VALUES (0,0,NULL,'Y','Bridge_RunProcess_ExpenseReportFork','Bridge_RunProcess_ExpenseReportFork',50001,50022,1300102,gen_random_uuid(),now(),100,now(),100);
INSERT INTO ws_webservice_para (ad_client_id,ad_org_id,constantvalue,parametername,parametertype,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu,createdby,updatedby) VALUES
 (0,0,'1300002','AD_Process_ID','C',1300121,1300102,gen_random_uuid(),100,100),(0,0,'','AD_Menu_ID','F',1300122,1300102,gen_random_uuid(),100,100),(0,0,'','AD_Record_ID','F',1300123,1300102,gen_random_uuid(),100,100);
INSERT INTO ws_webservicetypeaccess (ad_client_id,ad_org_id,ad_role_id,createdby,updatedby,ws_webservicetype_id,ws_webservicetypeaccess_uu) VALUES (11,0,102,100,100,1300102,gen_random_uuid());
COMMIT;
