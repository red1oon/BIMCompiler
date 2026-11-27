-- PILOT-ONLY. Spec §63 (Q-FA answered): the asset GROUP use life is set the way a legacy user does — through the stock WebServices,
-- as a normal user (role 102). WebService configuration only (D6): one updateData type on A_Asset_Group_Acct, whitelisted to the 4 use-life
-- fields. This file IS the admin proposal text. Idempotent. Restart the server after applying. The update itself is
-- scripts/bridge/pilot/fa_group_life.js (set|restore|show) — never direct SQL.
SET search_path=adempiere;
DO $$
DECLARE tid int; t int;
BEGIN
  IF EXISTS (SELECT 1 FROM ws_webservicetype WHERE value='BridgeUpdateAssetGroupAcct') THEN RETURN; END IF;
  t := (SELECT ad_table_id FROM ad_table WHERE tablename='A_Asset_Group_Acct');
  tid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceType')::int,'N'::varchar);
  INSERT INTO ws_webservicetype(ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,ad_table_id,description)
  VALUES (11,0,now(),100,now(),100,'Y','BridgeUpdateAssetGroupAcct','BridgeUpdateAssetGroupAcct',50001,(SELECT ws_webservicemethod_id FROM ws_webservicemethod WHERE value='updateData'),tid,gen_random_uuid(),t,'Bridge: updateData on A_Asset_Group_Acct (use life only)');
  INSERT INTO ws_webservicetypeaccess(ad_client_id,ad_org_id,ad_role_id,created,createdby,updated,updatedby,isactive,isreadwrite,ws_webservicetype_id,ws_webservicetypeaccess_uu)
  VALUES (11,0,102,now(),100,now(),100,'Y','Y',tid,gen_random_uuid());
  INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
  SELECT 11,0,v.cv,now(),100,'Y',v.pn,v.pt,now(),100,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid()
  FROM (VALUES ('TableName','C','A_Asset_Group_Acct'),('RecordID','F',NULL),('Action','C','Update')) AS v(pn,pt,cv);
  INSERT INTO ws_webservicefieldinput(ad_client_id,ad_column_id,ad_org_id,created,createdby,isactive,updated,updatedby,ws_webservicefieldinput_id,ws_webservicetype_id,ws_webservicefieldinput_uu)
  SELECT 11,c.ad_column_id,0,now(),100,'Y',now(),100,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldInput')::int,'N'::varchar),tid,gen_random_uuid()
  FROM ad_column c WHERE c.ad_table_id=t AND c.columnname IN ('UseLifeMonths','UseLifeYears','UseLifeMonths_F','UseLifeYears_F');
END $$;
