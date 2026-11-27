-- §SD16 (admin lane, D6 config rows; idempotent). WS types for the customer-return documents of the shop day (spec prompts/SQLiteIDEMPIERE.md §SD16.4):
--   read:  QueryMRMA / QueryMRMALine / QueryMRMAType            (Read, every non-virtual column; SYSTEM-owned, role 102 read)
--   write: Bridge_createData_M_RMAType (master), Bridge_createData_M_RMA, Bridge_createData_M_RMALine  (whitelist = every non-virtual column, the Pilot_* precedent)
--          Bridge_setDocAction_M_RMA (free docAction: CO, VO, ...)
-- Role access: GardenWorld Admin (102) here; the new client's Admin role inherits role 102's types through ws_shopday_grant.sql. Restart the server after applying.
SET search_path=adempiere;
DO $$
DECLARE d record; tid int; t int; col record;
BEGIN
  FOR d IN SELECT * FROM (VALUES
      ('QueryMRMA','M_RMA','queryData'), ('QueryMRMALine','M_RMALine','queryData'), ('QueryMRMAType','M_RMAType','queryData'),
      ('Bridge_createData_M_RMAType','M_RMAType','createData'), ('Bridge_createData_M_RMA','M_RMA','createData'), ('Bridge_createData_M_RMALine','M_RMALine','createData'),
      ('Bridge_setDocAction_M_RMA','M_RMA','setDocAction')) AS v(val,tbl,m) LOOP
    IF EXISTS (SELECT 1 FROM ws_webservicetype WHERE value=d.val) THEN CONTINUE; END IF;
    t := (SELECT ad_table_id FROM ad_table WHERE tablename=d.tbl);
    IF t IS NULL THEN RAISE NOTICE 'skip % (no AD_Table)', d.val; CONTINUE; END IF;
    tid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceType')::int,'N'::varchar);
    INSERT INTO ws_webservicetype(ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,ad_table_id,description)
    VALUES (0,0,now(),100,now(),100,'Y',d.val,d.val,50001,(SELECT ws_webservicemethod_id FROM ws_webservicemethod WHERE value=d.m),tid,gen_random_uuid(),t,'Bridge: '||d.m||' '||d.tbl);
    INSERT INTO ws_webservicetypeaccess(ad_client_id,ad_org_id,ad_role_id,created,createdby,updated,updatedby,isactive,isreadwrite,ws_webservicetype_id,ws_webservicetypeaccess_uu)
    VALUES (11,0,102,now(),100,now(),100,'Y',CASE d.m WHEN 'queryData' THEN 'N' ELSE 'Y' END,tid,gen_random_uuid());
    IF d.m = 'queryData' THEN
      INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
      SELECT 0,0,v.cv,now(),100,'Y',v.pn,v.pt,now(),100,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid()
      FROM (VALUES ('TableName','C',d.tbl),('Action','C','Read'),('RecordID','F',NULL),('Filter','F',NULL)) AS v(pn,pt,cv);
      FOR col IN SELECT ad_column_id FROM ad_column WHERE ad_table_id=t AND isactive='Y' AND columnsql IS NULL LOOP
        INSERT INTO ws_webservicefieldoutput(ad_client_id,ad_column_id,ad_org_id,created,createdby,isactive,updated,updatedby,ws_webservicefieldoutput_id,ws_webservicetype_id,ws_webservicefieldoutput_uu)
        VALUES (0,col.ad_column_id,0,now(),100,'Y',now(),100,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldOutput')::int,'N'::varchar),tid,gen_random_uuid());
      END LOOP;
    ELSIF d.m = 'createData' THEN
      INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
      SELECT 0,0,v.cv,now(),100,'Y',v.pn,v.pt,now(),100,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid()
      FROM (VALUES ('TableName','C',d.tbl),('RecordID','F',NULL),('Action','C','Create')) AS v(pn,pt,cv);
      INSERT INTO ws_webservicefieldinput(ad_client_id,ad_org_id,ad_column_id,ws_webservicetype_id,ad_reference_id,ws_webservicefieldinput_id,ws_webservicefieldinput_uu,createdby,updatedby)
      SELECT 0,0,c.ad_column_id,tid,c.ad_reference_id,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldInput')::int,'N'::varchar),gen_random_uuid(),100,100
      FROM ad_column c WHERE c.ad_table_id=t AND c.isactive='Y' AND c.columnsql IS NULL AND c.ad_reference_id<>28;
    ELSE
      INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
      SELECT 0,0,v.cv,now(),100,'Y',v.pn,v.pt,now(),100,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid()
      FROM (VALUES ('tableName','C',d.tbl),('recordID','F',NULL),('docAction','F',NULL)) AS v(pn,pt,cv);
    END IF;
  END LOOP;
END $$;
SELECT value FROM ws_webservicetype WHERE value IN ('QueryMRMA','QueryMRMALine','QueryMRMAType','Bridge_createData_M_RMAType','Bridge_createData_M_RMA','Bridge_createData_M_RMALine','Bridge_setDocAction_M_RMA') ORDER BY 1;
