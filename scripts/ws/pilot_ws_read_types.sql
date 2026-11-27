SET search_path=adempiere;
-- ⚠ DO NOT REMOVE - pilot copy DB ONLY. Adds ONE new readData service type 'ReadWSBPartner' (id 910001) + role 102 access + params + output columns, so W-WS-DIFF-READ can compare a SUCCESSFUL read_data (existing ReadBPartner stays ungranted for the denial case; a new type avoids the server's 60-minute role-access cache).
-- Owner authorisation 2026-10-13 (inject any new WS type in the pilot). Idempotent: deletes then re-inserts id 910001. The twin's equivalent rows: erp/tests/fixtures/ws_read_types.sqlite.sql (same ids, same columns).
DELETE FROM ws_webservicefieldoutput WHERE ws_webservicetype_id = 910001;
DELETE FROM ws_webservice_para WHERE ws_webservicetype_id = 910001;
DELETE FROM ws_webservicetypeaccess WHERE ws_webservicetype_id = 910001;
DELETE FROM ws_webservicetype WHERE ws_webservicetype_id = 910001;
INSERT INTO ws_webservicetype (ad_client_id,ad_org_id,ad_table_id,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,created,createdby,updated,updatedby)
  VALUES (11,0,291,'Y','ReadWSBPartner','ReadWSBPartner',50001,50027,910001,gen_random_uuid(),now(),100,now(),100);
INSERT INTO ws_webservicetypeaccess (ad_client_id,ad_org_id,ad_role_id,createdby,updatedby,ws_webservicetype_id,ws_webservicetypeaccess_uu) VALUES (11,0,102,100,100,910001,gen_random_uuid());
INSERT INTO ws_webservice_para (ad_client_id,ad_org_id,constantvalue,parametername,parametertype,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu,createdby,updatedby)
  VALUES (11,0,'C_BPartner','TableName','C',910011,910001,gen_random_uuid(),100,100),(11,0,'','RecordID','F',910012,910001,gen_random_uuid(),100,100),(11,0,'Read','Action','C',910013,910001,gen_random_uuid(),100,100);
INSERT INTO ws_webservicefieldoutput (ad_client_id,ad_org_id,ad_column_id,ws_webservicetype_id,ws_webservicefieldoutput_id,ws_webservicefieldoutput_uu,createdby,updatedby)
  SELECT 11,0,c.ad_column_id,910001,910100+row_number() over (order by c.ad_column_id),gen_random_uuid(),100,100 FROM ad_column c
  WHERE c.ad_table_id=291 AND c.columnname IN ('C_BPartner_ID','AD_Client_ID','IsActive','Value','Name','IsCustomer','IsVendor','TaxID','SO_CreditLimit');
