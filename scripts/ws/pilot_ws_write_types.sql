SET search_path=adempiere;
-- ⚠ DO NOT REMOVE - pilot copy DB ONLY. W-WS-DIFF-WRITE fixture (bim-compiler prompts/ERP_WS_API.md S2): three NEW web-service types on C_BPartner - create (50024), update (50025), delete (50026) -
-- ids 920001..920003, role 102 access, input/output whitelists. Stock types stay ungranted. Idempotent. The pilot server caches role access 60 min: restart it (~/idempiere-pilot/stop.sh; start.sh) after applying.
-- Owner authorisation 2026-10-13 (inject any new WS type in the pilot). The twin gets the SAME rows by the witness's fixture sync (no hand-copy).
DELETE FROM ws_webservicefieldoutput WHERE ws_webservicetype_id BETWEEN 920001 AND 920003;
DELETE FROM ws_webservicefieldinput WHERE ws_webservicetype_id BETWEEN 920001 AND 920003;
DELETE FROM ws_webservice_para WHERE ws_webservicetype_id BETWEEN 920001 AND 920003;
DELETE FROM ws_webservicetypeaccess WHERE ws_webservicetype_id BETWEEN 920001 AND 920003;
DELETE FROM ws_webservicetype WHERE ws_webservicetype_id BETWEEN 920001 AND 920003;
INSERT INTO ws_webservicetype (ad_client_id,ad_org_id,ad_table_id,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,created,createdby,updated,updatedby) VALUES
 (11,0,291,'Y','WsfCreateBP','WsfCreateBP',50001,50024,920001,gen_random_uuid(),now(),100,now(),100),
 (11,0,291,'Y','WsfUpdateBP','WsfUpdateBP',50001,50025,920002,gen_random_uuid(),now(),100,now(),100),
 (11,0,291,'Y','WsfDeleteBP','WsfDeleteBP',50001,50026,920003,gen_random_uuid(),now(),100,now(),100);
INSERT INTO ws_webservicetypeaccess (ad_client_id,ad_org_id,ad_role_id,createdby,updatedby,ws_webservicetype_id,ws_webservicetypeaccess_uu)
 SELECT 11,0,102,100,100,t,gen_random_uuid() FROM unnest(ARRAY[920001,920002,920003]) t;
INSERT INTO ws_webservice_para (ad_client_id,ad_org_id,constantvalue,parametername,parametertype,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu,createdby,updatedby) VALUES
 (11,0,'C_BPartner','TableName','C',920011,920001,gen_random_uuid(),100,100),(11,0,'','RecordID','F',920012,920001,gen_random_uuid(),100,100),(11,0,'Create','Action','C',920013,920001,gen_random_uuid(),100,100),
 (11,0,'C_BPartner','TableName','C',920021,920002,gen_random_uuid(),100,100),(11,0,'','RecordID','F',920022,920002,gen_random_uuid(),100,100),(11,0,'Update','Action','C',920023,920002,gen_random_uuid(),100,100),
 (11,0,'C_BPartner','TableName','C',920031,920003,gen_random_uuid(),100,100),(11,0,'','RecordID','F',920032,920003,gen_random_uuid(),100,100),(11,0,'Delete','Action','C',920033,920003,gen_random_uuid(),100,100);
INSERT INTO ws_webservicefieldinput (ad_client_id,ad_org_id,ad_column_id,ws_webservicetype_id,ws_webservicefieldinput_id,ws_webservicefieldinput_uu,createdby,updatedby)
 SELECT 11,0,c.ad_column_id,tt.t,920100+row_number() over (order by tt.t,c.ad_column_id),gen_random_uuid(),100,100 FROM ad_column c, unnest(ARRAY[920001,920002]) tt(t)
 WHERE c.ad_table_id=291 AND c.columnname IN ('Value','Name','C_BP_Group_ID','IsCustomer','IsVendor','TaxID','SO_CreditLimit','IsActive');
INSERT INTO ws_webservicefieldoutput (ad_client_id,ad_org_id,ad_column_id,ws_webservicetype_id,ws_webservicefieldoutput_id,ws_webservicefieldoutput_uu,createdby,updatedby)
 SELECT 11,0,c.ad_column_id,tt.t,920200+row_number() over (order by tt.t,c.ad_column_id),gen_random_uuid(),100,100 FROM ad_column c, unnest(ARRAY[920001,920002]) tt(t)
 WHERE c.ad_table_id=291 AND c.columnname IN ('C_BPartner_ID','Value','Name','C_BP_Group_ID','SO_CreditLimit');

-- W-WS-DIFF-PROCESS fixture (S3 run_process): ONE runProcess type per process, the process id fixed by the constant AD_Process_ID parameter (legacy design).
-- 920004 = Product BOM Verify (53229, org.compiere.process.BOMVerify - a verbatim twin port, read-mostly). Restart the pilot server after applying.
DELETE FROM ws_webservice_para WHERE ws_webservicetype_id = 920004;
DELETE FROM ws_webservicetypeaccess WHERE ws_webservicetype_id = 920004;
DELETE FROM ws_webservicetype WHERE ws_webservicetype_id = 920004;
INSERT INTO ws_webservicetype (ad_client_id,ad_org_id,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,created,createdby,updated,updatedby)
  VALUES (11,0,'Y','WsfRunBOMVerify','WsfRunBOMVerify',50001,50022,920004,gen_random_uuid(),now(),100,now(),100);
INSERT INTO ws_webservicetypeaccess (ad_client_id,ad_org_id,ad_role_id,createdby,updatedby,ws_webservicetype_id,ws_webservicetypeaccess_uu) VALUES (11,0,102,100,100,920004,gen_random_uuid());
INSERT INTO ws_webservice_para (ad_client_id,ad_org_id,constantvalue,parametername,parametertype,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu,createdby,updatedby) VALUES
 (11,0,'53229','AD_Process_ID','C',920041,920004,gen_random_uuid(),100,100),(11,0,'','AD_Menu_ID','F',920042,920004,gen_random_uuid(),100,100),(11,0,'','AD_Record_ID','F',920043,920004,gen_random_uuid(),100,100),(11,0,'','DocAction','F',920044,920004,gen_random_uuid(),100,100);

-- W-WS-DIFF-JSON fixture (S4): 920005 = a queryData type on C_BPartner (rows come back as an ARRAY in the JSON binding). Restart the pilot server after applying.
DELETE FROM ws_webservicefieldoutput WHERE ws_webservicetype_id = 920005;
DELETE FROM ws_webservicefieldinput WHERE ws_webservicetype_id = 920005;
DELETE FROM ws_webservice_para WHERE ws_webservicetype_id = 920005;
DELETE FROM ws_webservicetypeaccess WHERE ws_webservicetype_id = 920005;
DELETE FROM ws_webservicetype WHERE ws_webservicetype_id = 920005;
INSERT INTO ws_webservicetype (ad_client_id,ad_org_id,ad_table_id,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,created,createdby,updated,updatedby)
  VALUES (11,0,291,'Y','WsfQueryBP','WsfQueryBP',50001,50028,920005,gen_random_uuid(),now(),100,now(),100);
INSERT INTO ws_webservicetypeaccess (ad_client_id,ad_org_id,ad_role_id,createdby,updatedby,ws_webservicetype_id,ws_webservicetypeaccess_uu) VALUES (11,0,102,100,100,920005,gen_random_uuid());
INSERT INTO ws_webservice_para (ad_client_id,ad_org_id,constantvalue,parametername,parametertype,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu,createdby,updatedby) VALUES
 (11,0,'C_BPartner','TableName','C',920051,920005,gen_random_uuid(),100,100),(11,0,'','RecordID','F',920052,920005,gen_random_uuid(),100,100),(11,0,'','Filter','F',920053,920005,gen_random_uuid(),100,100),(11,0,'Read','Action','C',920054,920005,gen_random_uuid(),100,100);
INSERT INTO ws_webservicefieldinput (ad_client_id,ad_org_id,ad_column_id,ws_webservicetype_id,ws_webservicefieldinput_id,ws_webservicefieldinput_uu,createdby,updatedby)
 SELECT 11,0,c.ad_column_id,920005,920300+row_number() over (order by c.ad_column_id),gen_random_uuid(),100,100 FROM ad_column c WHERE c.ad_table_id=291 AND c.columnname IN ('Value','Name','IsCustomer');
INSERT INTO ws_webservicefieldoutput (ad_client_id,ad_org_id,ad_column_id,ws_webservicetype_id,ws_webservicefieldoutput_id,ws_webservicefieldoutput_uu,createdby,updatedby)
 SELECT 11,0,c.ad_column_id,920005,920400+row_number() over (order by c.ad_column_id),gen_random_uuid(),100,100 FROM ad_column c WHERE c.ad_table_id=291 AND c.columnname IN ('C_BPartner_ID','Value','Name','IsCustomer','SO_CreditLimit','TaxID','Created','Updated');
