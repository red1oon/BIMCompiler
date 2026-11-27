-- §30 PRODUCT PICTURES (admin lane, D6 config rows; idempotent; WS types on the pilot pre-authorised by the owner): Bridge_createData_I_Product + Bridge_updateData_I_Product (the import rows) and Bridge_RunProcess_ImportProduct (AD_Process 196),
-- SYSTEM-owned, GardenWorld Admin (102) access, same generator as ws_shopday_masters.sql. Restart the pilot if the new types answer "not found" (WS config is cached).
-- Apply: docker exec -i postgres psql -U postgres -d idempiere_pilot -v ON_ERROR_STOP=1 < ws_icons_import.sql
SET search_path=adempiere;
DO $$
DECLARE d record; tid int; t int; m text; mid int;
BEGIN
  FOR d IN SELECT * FROM (VALUES
      ('I_Product')) AS v(tbl) LOOP
    t := (SELECT ad_table_id FROM ad_table WHERE tablename=d.tbl);
    IF t IS NULL THEN RAISE NOTICE 'skip % (no AD_Table)', d.tbl; CONTINUE; END IF;
    FOREACH m IN ARRAY ARRAY['createData','updateData'] LOOP
      IF EXISTS (SELECT 1 FROM ws_webservicetype WHERE value='Bridge_'||m||'_'||d.tbl) THEN CONTINUE; END IF;
      mid := CASE m WHEN 'createData' THEN 50024 ELSE 50025 END;
      tid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceType')::int,'N'::varchar);
      INSERT INTO ws_webservicetype(ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,ad_table_id,description)
      VALUES (0,0,now(),100,now(),100,'Y','Bridge_'||m||'_'||d.tbl,'Bridge_'||m||'_'||d.tbl,50001,mid,tid,gen_random_uuid(),t,'Bridge: '||m||' '||d.tbl);
      INSERT INTO ws_webservicetypeaccess(ad_client_id,ad_org_id,ad_role_id,created,createdby,updated,updatedby,isactive,isreadwrite,ws_webservicetype_id,ws_webservicetypeaccess_uu)
      VALUES (11,0,102,now(),100,now(),100,'Y','Y',tid,gen_random_uuid());
      INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
      SELECT 0,0,v.cv,now(),100,'Y',v.pn,v.pt,now(),100,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid()
      FROM (VALUES ('TableName','C',d.tbl),('RecordID','F',NULL),('Action','C',CASE m WHEN 'createData' THEN 'Create' ELSE 'Update' END)) AS v(pn,pt,cv);
      INSERT INTO ws_webservicefieldinput(ad_client_id,ad_org_id,ad_column_id,ws_webservicetype_id,ad_reference_id,ws_webservicefieldinput_id,ws_webservicefieldinput_uu,createdby,updatedby)
      SELECT 0,0,c.ad_column_id,tid,c.ad_reference_id,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldInput')::int,'N'::varchar),gen_random_uuid(),100,100
      FROM ad_column c WHERE c.ad_table_id=t AND c.isactive='Y' AND c.columnsql IS NULL AND c.ad_reference_id<>28;
    END LOOP;
  END LOOP;
END $$;

DO $$
DECLARE tid int;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM ws_webservicetype WHERE value='Bridge_RunProcess_ImportProduct') THEN
    tid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceType')::int,'N'::varchar);
    INSERT INTO ws_webservicetype (ad_client_id,ad_org_id,ad_table_id,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,created,createdby,updated,updatedby)
     VALUES (0,0,NULL,'Y','Bridge_RunProcess_ImportProduct','Bridge_RunProcess_ImportProduct',50001,50022,tid,gen_random_uuid(),now(),100,now(),100);
    INSERT INTO ws_webservice_para (ad_client_id,ad_org_id,constantvalue,parametername,parametertype,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu,createdby,updatedby)
     SELECT 0,0,v.cv,v.pn,v.pt,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid(),100,100
     FROM (VALUES ('AD_Process_ID','C','196'),('AD_Menu_ID','F',''),('AD_Record_ID','F','')) v(pn,pt,cv);
    INSERT INTO ws_webservicetypeaccess (ad_client_id,ad_org_id,ad_role_id,createdby,updatedby,ws_webservicetype_id,ws_webservicetypeaccess_uu)
     SELECT 0,0,102,100,100,tid,gen_random_uuid();
  END IF;
END $$;
SELECT value FROM ws_webservicetype WHERE value IN ('Bridge_createData_I_Product','Bridge_updateData_I_Product','Bridge_RunProcess_ImportProduct') ORDER BY 1;
