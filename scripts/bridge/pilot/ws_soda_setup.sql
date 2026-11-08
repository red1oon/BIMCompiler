-- PILOT-ONLY (idempiere_pilot). Spec: bim-compiler prompts/POS_PLUGIN_LOCAL_FIRST.md §28.2 P6 (owner pre-authorised pilot WS types 2026-10-13: "You can inject any new type needed for WS"). Idempotent. Restart the server (stop.sh; start.sh) after applying.
-- Gives the Bridge the writes an administrator makes in the ZK windows for the SODA receipt parity cycle, WebService configuration only (no business row is written here):
--   Bridge_createData_C_DocType        Document Type window (an in-transit Material Movement type)
--   Bridge_createData/updateData_M_Replenish   Replenish window (a rule WITH a source warehouse)
--   Bridge_updateData_M_MovementLineConfirm    Move Confirmation lines tab (Confirmed / Scrapped qty)
--   BridgeDocActionMovement / BridgeDocActionMovementConfirm   Document Action bar (PR, CO ...) on M_Movement / M_MovementConfirm (free docAction, as BridgeDocActionCOrder)
SET search_path=adempiere;
DO $$
DECLARE d record; tid int; t int; m text; mid int;
BEGIN
  FOR d IN SELECT * FROM (VALUES ('C_DocType','createData'),('M_Replenish','createData'),('M_Replenish','updateData'),('M_MovementLineConfirm','updateData')) AS v(tbl,meth) LOOP
    t := (SELECT ad_table_id FROM ad_table WHERE tablename=d.tbl);
    IF t IS NULL THEN RAISE NOTICE 'skip % (no AD_Table)', d.tbl; CONTINUE; END IF;
    m := d.meth;
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
  FOR d IN SELECT * FROM (VALUES ('BridgeDocActionMovement','M_Movement'),('BridgeDocActionMovementConfirm','M_MovementConfirm')) AS v(val,tbl) LOOP
    IF EXISTS (SELECT 1 FROM ws_webservicetype WHERE value=d.val) THEN CONTINUE; END IF;
    tid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceType')::int,'N'::varchar);
    INSERT INTO ws_webservicetype(ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,ad_table_id,description)
    VALUES (11,0,now(),100,now(),100,'Y',d.val,d.val,50001,(SELECT ws_webservicemethod_id FROM ws_webservicemethod WHERE value='setDocAction'),tid,gen_random_uuid(),(SELECT ad_table_id FROM ad_table WHERE tablename=d.tbl),'Bridge: doc-action on '||d.tbl);
    INSERT INTO ws_webservicetypeaccess(ad_client_id,ad_org_id,ad_role_id,created,createdby,updated,updatedby,isactive,isreadwrite,ws_webservicetype_id,ws_webservicetypeaccess_uu)
    VALUES (11,0,102,now(),100,now(),100,'Y','Y',tid,gen_random_uuid());
    INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
    SELECT 11,0,v.cv,now(),100,'Y',v.pn,v.pt,now(),100,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid()
    FROM (VALUES ('tableName','C',d.tbl),('recordID','F',NULL),('docAction','F',NULL)) AS v(pn,pt,cv);
  END LOOP;
END $$;
SELECT value FROM ws_webservicetype WHERE value IN ('Bridge_createData_C_DocType','Bridge_createData_M_Replenish','Bridge_updateData_M_Replenish','Bridge_updateData_M_MovementLineConfirm','BridgeDocActionMovement','BridgeDocActionMovementConfirm') ORDER BY 1;

