-- §SHOPDAY-RUN-1 (admin lane, D6 config rows; idempotent). Generic header-only WRITE types for the masters a fresh client's day creates (SD-02..SD-05):
-- Bridge_createData_<Table> / Bridge_updateData_<Table>, owned by SYSTEM (client 0), whitelist = every non-virtual column (the Pilot_* precedent, pilot_ws_setup.js).
-- Business rows are then created through the WS as the new client's normal user. Never run pilot_ws_setup.js (it deletes every type id >= 900000).
-- Role access: GardenWorld Admin (102) here; the new client's Admin role via ws_shopday_grant.sql. Restart after apply.
SET search_path=adempiere;
DO $$
DECLARE d record; tid int; t int; m text; mid int;
BEGIN
  FOR d IN SELECT * FROM (VALUES
      ('C_Location'),
      ('C_BPartner'),
      ('C_BPartner_Location'),
      ('C_Bank'),
      ('C_BankAccount'),
      ('C_TaxCategory'),
      ('C_Tax'),
      ('M_Product_Category'),
      ('M_Product'),
      ('M_PriceList'),
      ('M_PriceList_Version'),
      ('M_ProductPrice'),
      ('C_AcctSchema'),
      ('M_CostElement')) AS v(tbl) LOOP
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
SELECT count(*) AS shopday_write_types FROM ws_webservicetype WHERE value LIKE 'Bridge\_%Data\_%';
