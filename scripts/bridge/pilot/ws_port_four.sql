-- PILOT-ONLY. bim-compiler prompts/VOCAB_MESSAGE_CATALOG.md §19.21 PORT SPEC (2026-11-25; owner: 'WS types on the pilot pre-authorised', memory feedback_ws_types_and_legacy_lf_authorised).
-- The four document classes the twin did not have (MRequisition, MInOutConfirm, MDepositBatch, MBankTransfer) are judged against REAL iDempiere: the scenario is made on the pilot through its own WebServices,
-- the same generator as ws_nc2_periodcontrol.sql: Bridge_createData_<T> / Bridge_updateData_<T> (header-only writes, whitelist = every non-virtual column) and a doc-action type with a FREE docAction
-- (BridgeDocAction<T>, the ws_docaction.sql shape) so CO / CL / VO / RE / RC / RA can each be run as a user does in the window. Idempotent. Role 102. Restart the server after applying (~/idempiere-pilot/stop.sh; start.sh).
SET search_path=adempiere;
DO $$
DECLARE d record; tid int; t int; m text; mid int;
BEGIN
  FOR d IN SELECT * FROM (VALUES ('M_Requisition'),('M_RequisitionLine'),('C_DepositBatch'),('C_DepositBatchLine'),('C_BankTransfer'),('M_InOutConfirm'),('M_InOutLineConfirm'),('M_InOutLine'),('M_MovementLine')) AS v(tbl) LOOP
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
  -- the free-action doc-action types (the ws_docaction.sql shape)
  FOR d IN SELECT * FROM (VALUES ('BridgeDocActionRequisition','M_Requisition'),('BridgeDocActionInOutConfirm','M_InOutConfirm'),('BridgeDocActionDepositBatch','C_DepositBatch'),('BridgeDocActionBankTransfer','C_BankTransfer')) AS v(val,tbl) LOOP
    IF EXISTS (SELECT 1 FROM ws_webservicetype WHERE value=d.val) THEN CONTINUE; END IF;
    tid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceType')::int,'N'::varchar);
    INSERT INTO ws_webservicetype(ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,ad_table_id,description)
    VALUES (11,0,now(),100,now(),100,'Y',d.val,d.val,50001,50021,tid,gen_random_uuid(),(SELECT ad_table_id FROM ad_table WHERE tablename=d.tbl),'Bridge: doc-action on '||d.tbl);
    INSERT INTO ws_webservicetypeaccess(ad_client_id,ad_org_id,ad_role_id,created,createdby,updated,updatedby,isactive,isreadwrite,ws_webservicetype_id,ws_webservicetypeaccess_uu)
    VALUES (11,0,102,now(),100,now(),100,'Y','Y',tid,gen_random_uuid());
    INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
    SELECT 11,0,v.cv,now(),100,'Y',v.pn,v.pt,now(),100,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid()
    FROM (VALUES ('tableName','C',d.tbl),('recordID','F',NULL),('docAction','F',NULL)) AS v(pn,pt,cv);
  END LOOP;
END $$;
SELECT count(*) AS port_four_types FROM ws_webservicetype WHERE value LIKE 'BridgeDocAction%' OR value ~ '^Bridge_(create|update)Data_(M_Requisition|C_DepositBatch|C_BankTransfer|M_InOutConfirm|M_InOutLineConfirm|M_InOutLine|M_MovementLine)';
