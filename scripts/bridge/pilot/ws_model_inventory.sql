-- PILOT-ONLY. Spec §59: model Physical Inventory (M_Inventory + M_InventoryLine) added as DATA — WebService configuration only (D6), no layer code.
-- This file IS the admin proposal text for the model. Idempotent. Role 102. Restart the server after applying.
SET search_path=adempiere;
DO $$
DECLARE d record; tid int; t int;
BEGIN
  FOR d IN SELECT * FROM (VALUES
     ('BridgeCreateInventory',     'createData',  'M_Inventory',     ARRAY['AD_Org_ID','C_DocType_ID','M_Warehouse_ID','MovementDate','Description']),
     ('BridgeCreateInventoryLine', 'createData',  'M_InventoryLine', ARRAY['AD_Org_ID','AD_Client_ID','M_Inventory_ID','M_Locator_ID','M_Product_ID','QtyBook','QtyCount','InventoryType','Line']),
     ('BridgeCompleteInventory',   'setDocAction','M_Inventory',     NULL::text[])
  ) AS v(val,method,tbl,cols) LOOP
    IF EXISTS (SELECT 1 FROM ws_webservicetype WHERE value=d.val) THEN CONTINUE; END IF;
    t := (SELECT ad_table_id FROM ad_table WHERE tablename=d.tbl);
    tid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceType')::int,'N'::varchar);
    INSERT INTO ws_webservicetype(ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,ad_table_id,description)
    VALUES (11,0,now(),100,now(),100,'Y',d.val,d.val,50001,(SELECT ws_webservicemethod_id FROM ws_webservicemethod WHERE value=d.method),tid,gen_random_uuid(),t,'Bridge: '||d.method||' on '||d.tbl);
    INSERT INTO ws_webservicetypeaccess(ad_client_id,ad_org_id,ad_role_id,created,createdby,updated,updatedby,isactive,isreadwrite,ws_webservicetype_id,ws_webservicetypeaccess_uu)
    VALUES (11,0,102,now(),100,now(),100,'Y','Y',tid,gen_random_uuid());
    IF d.method = 'createData' THEN
      INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
      SELECT 11,0,v.cv,now(),100,'Y',v.pn,v.pt,now(),100,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid()
      FROM (VALUES ('TableName','C',d.tbl),('RecordID','F',NULL),('Action','C','CreateUpdate')) AS v(pn,pt,cv);
      INSERT INTO ws_webservicefieldinput(ad_client_id,ad_column_id,ad_org_id,created,createdby,isactive,updated,updatedby,ws_webservicefieldinput_id,ws_webservicetype_id,ws_webservicefieldinput_uu)
      SELECT 11,c.ad_column_id,0,now(),100,'Y',now(),100,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldInput')::int,'N'::varchar),tid,gen_random_uuid()
      FROM ad_column c WHERE c.ad_table_id=t AND c.columnname = ANY(d.cols);
    ELSE
      INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
      SELECT 11,0,v.cv,now(),100,'Y',v.pn,v.pt,now(),100,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid()
      FROM (VALUES ('tableName','C',d.tbl),('recordID','F',NULL),('recordIDVariable','F',NULL),('docAction','C','CO')) AS v(pn,pt,cv);
    END IF;
  END LOOP;
END $$;
