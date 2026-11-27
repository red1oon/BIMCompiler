SET search_path=adempiere;
-- ⚠ DO NOT REMOVE - pilot copy DB ONLY. W-WS-DIFF-MISC fixture (bim-compiler prompts/ERP_WS_API.md S8): 920006 = createUpdateData type on C_BPartner (key column Value, Action free),
-- 920007 = getList type (AD_Reference_ID + Filter free), and a role 920100 that reaches those types ONLY through AD_Role_Included (-> role 102). Idempotent. Restart the pilot server after applying (role access cache).
-- Owner authorisation 2026-10-13: "You can inject any new type needed for WS" (pilot config rows).
DELETE FROM ws_webservicefieldoutput WHERE ws_webservicetype_id IN (920006,920007);
DELETE FROM ws_webservicefieldinput WHERE ws_webservicetype_id IN (920006,920007);
DELETE FROM ws_webservice_para WHERE ws_webservicetype_id IN (920006,920007);
DELETE FROM ws_webservicetypeaccess WHERE ws_webservicetype_id IN (920006,920007);
DELETE FROM ws_webservicetype WHERE ws_webservicetype_id IN (920006,920007);
INSERT INTO ws_webservicetype (ad_client_id,ad_org_id,ad_table_id,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,created,createdby,updated,updatedby) VALUES
 (11,0,291,'Y','WsfCreateUpdateBP','WsfCreateUpdateBP',50001,50024,920006,gen_random_uuid(),now(),100,now(),100),
 (11,0,NULL,'Y','WsfGetListRef','WsfGetListRef',50001,50023,920007,gen_random_uuid(),now(),100,now(),100);
INSERT INTO ws_webservicetypeaccess (ad_client_id,ad_org_id,ad_role_id,createdby,updatedby,ws_webservicetype_id,ws_webservicetypeaccess_uu)
 SELECT 11,0,102,100,100,t,gen_random_uuid() FROM unnest(ARRAY[920006,920007]) t;
INSERT INTO ws_webservice_para (ad_client_id,ad_org_id,constantvalue,parametername,parametertype,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu,createdby,updatedby) VALUES
 (11,0,'C_BPartner','TableName','C',920061,920006,gen_random_uuid(),100,100),(11,0,'','RecordID','F',920062,920006,gen_random_uuid(),100,100),(11,0,'','Action','F',920063,920006,gen_random_uuid(),100,100),
 (11,0,'','AD_Reference_ID','F',920071,920007,gen_random_uuid(),100,100),(11,0,'','Filter','F',920072,920007,gen_random_uuid(),100,100);
INSERT INTO ws_webservicefieldinput (ad_client_id,ad_org_id,ad_column_id,ws_webservicetype_id,ws_webservicefieldinput_id,ws_webservicefieldinput_uu,createdby,updatedby,isidentifier)
 SELECT 11,0,c.ad_column_id,920006,920500+row_number() over (order by c.ad_column_id),gen_random_uuid(),100,100,CASE WHEN c.columnname='Value' THEN 'Y' ELSE 'N' END FROM ad_column c WHERE c.ad_table_id=291 AND c.columnname IN ('Value','Name','IsVendor','TaxID','C_BP_Group_ID');
INSERT INTO ws_webservicefieldoutput (ad_client_id,ad_org_id,ad_column_id,ws_webservicetype_id,ws_webservicefieldoutput_id,ws_webservicefieldoutput_uu,createdby,updatedby)
 SELECT 11,0,c.ad_column_id,920006,920600+row_number() over (order by c.ad_column_id),gen_random_uuid(),100,100 FROM ad_column c WHERE c.ad_table_id=291 AND c.columnname IN ('C_BPartner_ID','Value','Name','IsVendor','TaxID','C_BP_Group_ID');
INSERT INTO ws_webservicefieldoutput (ad_client_id,ad_org_id,ad_column_id,ws_webservicetype_id,ws_webservicefieldoutput_id,ws_webservicefieldoutput_uu,createdby,updatedby)
 SELECT 11,0,c.ad_column_id,920007,920700+row_number() over (order by c.ad_column_id),gen_random_uuid(),100,100 FROM ad_column c WHERE (c.ad_table_id=104 AND c.columnname IN ('AD_Ref_List_ID','Value','Name')) OR (c.ad_table_id=(SELECT ad_table_id FROM ad_table WHERE tablename='C_SalesRegion') AND c.columnname IN ('C_SalesRegion_ID'));
-- role reaching the types ONLY through AD_Role_Included
DELETE FROM ad_role_included WHERE ad_role_id=920100;
DELETE FROM ad_user_roles WHERE ad_role_id=920100;
DELETE FROM ad_role_orgaccess WHERE ad_role_id=920100;
CREATE TEMP TABLE r1 AS SELECT * FROM ad_role WHERE ad_role_id=102;
UPDATE r1 SET ad_role_id=920100, name='WsfIncluding', ad_role_uu=gen_random_uuid();
INSERT INTO ad_role SELECT * FROM r1 WHERE NOT EXISTS (SELECT 1 FROM ad_role WHERE ad_role_id=920100);   -- sessions may reference it: never delete the role
CREATE TEMP TABLE r2 AS SELECT * FROM ad_role_orgaccess WHERE ad_role_id=102;
UPDATE r2 SET ad_role_id=920100, ad_role_orgaccess_uu=gen_random_uuid();
INSERT INTO ad_role_orgaccess SELECT * FROM r2;
INSERT INTO ad_user_roles (ad_client_id,ad_org_id,ad_role_id,ad_user_id,created,createdby,updated,updatedby,isactive,ad_user_roles_uu) VALUES (11,0,920100,101,now(),100,now(),100,'Y',gen_random_uuid());
INSERT INTO ad_role_included (ad_client_id,ad_org_id,ad_role_id,included_role_id,seqno,created,createdby,updated,updatedby,isactive,ad_role_included_uu) VALUES (11,0,920100,102,10,now(),100,now(),100,'Y',gen_random_uuid());

-- W-WS-DIFF-COMPOSITE fixture (S9): 920008 = a composite type (service CompositeInterface 200001, method composite 200001). Restart the pilot server after applying.
DELETE FROM ws_webservicetypeaccess WHERE ws_webservicetype_id = 920008;
DELETE FROM ws_webservicetype WHERE ws_webservicetype_id = 920008;
INSERT INTO ws_webservicetype (ad_client_id,ad_org_id,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,created,createdby,updated,updatedby)
  VALUES (11,0,'Y','WsfComposite','WsfComposite',200001,200001,920008,gen_random_uuid(),now(),100,now(),100);
INSERT INTO ws_webservicetypeaccess (ad_client_id,ad_org_id,ad_role_id,createdby,updatedby,ws_webservicetype_id,ws_webservicetypeaccess_uu) VALUES (11,0,102,100,100,920008,gen_random_uuid());
