-- PILOT-ONLY (idempiere_pilot, local copy). Spec: prompts/SQLiteIDEMPIERE.md §33 (S12 void). Idempotent.
-- Registers a stock setDocAction WS type with a FREE docAction (the stock 'CompleteOrder' type fixes docAction='CO'),
-- so the Bridge can perform the doc-actions a normal user performs in the ZK window (VO, RC, CL, ...) on C_Order.
-- This file IS the proposal text for the legacy admin. Restart the server (stop.sh; start.sh) after applying.
SET search_path=adempiere;
DO $$
DECLARE d record; tid int;
BEGIN
  FOR d IN SELECT * FROM (VALUES ('BridgeDocActionCOrder','C_Order')) AS v(val,tbl) LOOP
    IF EXISTS (SELECT 1 FROM ws_webservicetype WHERE value=d.val) THEN CONTINUE; END IF;
    tid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceType')::int,'N'::varchar);
    INSERT INTO ws_webservicetype(ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,name,value,
        ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,ad_table_id,description)
    VALUES (11,0,now(),100,now(),100,'Y',d.val,d.val,50001,
        (SELECT ws_webservicemethod_id FROM ws_webservicemethod WHERE value='setDocAction'),tid,gen_random_uuid(),
        (SELECT ad_table_id FROM ad_table WHERE tablename=d.tbl),'Bridge: doc-action on '||d.tbl);
    INSERT INTO ws_webservicetypeaccess(ad_client_id,ad_org_id,ad_role_id,created,createdby,updated,updatedby,isactive,isreadwrite,ws_webservicetype_id,ws_webservicetypeaccess_uu)
    VALUES (11,0,102,now(),100,now(),100,'Y','Y',tid,gen_random_uuid());
    INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
    SELECT 11,0,v.cv,now(),100,'Y',v.pn,v.pt,now(),100,
           nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid()
    FROM (VALUES ('tableName','C',d.tbl),('recordID','F',NULL),('docAction','F',NULL)) AS v(pn,pt,cv);
  END LOOP;
END $$;

-- 2026-10-09 (spec §40, S8): BridgeCreateOrder = the stock 'createOrderRecord' (createData on C_Order, same parameters, same input columns)
-- PLUS DateOrdered and DateAcct as inputs — a normal user keys these dates in the Sales Order window; the stock type does not accept them
-- ("input column DateOrdered not allowed"). Idempotent. Role 102. Restart the server after applying.
DO $$
DECLARE tid int; src int;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM ws_webservicetype WHERE value='BridgeCreateOrder') THEN
    src := (SELECT ws_webservicetype_id FROM ws_webservicetype WHERE value='createOrderRecord');
    tid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceType')::int,'N'::varchar);
    INSERT INTO ws_webservicetype(ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,ad_table_id,description)
    SELECT 11,0,now(),100,now(),100,'Y','BridgeCreateOrder','BridgeCreateOrder',ws_webservice_id,ws_webservicemethod_id,tid,gen_random_uuid(),ad_table_id,'Bridge: createOrderRecord + DateOrdered/DateAcct'
    FROM ws_webservicetype WHERE ws_webservicetype_id=src;
    INSERT INTO ws_webservicetypeaccess(ad_client_id,ad_org_id,ad_role_id,created,createdby,updated,updatedby,isactive,isreadwrite,ws_webservicetype_id,ws_webservicetypeaccess_uu)
    VALUES (11,0,102,now(),100,now(),100,'Y','Y',tid,gen_random_uuid());
    INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
    SELECT 11,0,p.constantvalue,now(),100,'Y',p.parametername,p.parametertype,now(),100,
           nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid()
    FROM ws_webservice_para p WHERE p.ws_webservicetype_id=src;
    INSERT INTO ws_webservicefieldinput(ad_client_id,ad_column_id,ad_org_id,created,createdby,isactive,updated,updatedby,ws_webservicefieldinput_id,ws_webservicetype_id,ws_webservicefieldinput_uu)
    SELECT 11,c.ad_column_id,0,now(),100,'Y',now(),100,
           nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldInput')::int,'N'::varchar),tid,gen_random_uuid()
    FROM ad_column c WHERE c.ad_column_id IN (SELECT ad_column_id FROM ws_webservicefieldinput WHERE ws_webservicetype_id=src)
       OR (c.ad_table_id=(SELECT ad_table_id FROM ad_table WHERE tablename='C_Order') AND c.columnname IN ('DateOrdered','DateAcct'));
  END IF;
END $$;

-- 2026-10-09 (spec §44, TAX): BridgeCreateOrderLine = the stock 'CreateOrderLine' + C_Tax_ID as input (a normal user picks the line Tax in the
-- Sales Order window; legacy derives a tax only when C_Tax_ID=0, MOrderLine.java:866-867). Same cloning pattern as BridgeCreateOrder. Idempotent.
DO $$
DECLARE tid int; src int; d record;
BEGIN
  FOR d IN SELECT * FROM (VALUES ('CreateOrderLine','BridgeCreateOrderLine','C_OrderLine',ARRAY['C_Tax_ID'])) AS v(srcval,newval,tbl,extra) LOOP
    IF EXISTS (SELECT 1 FROM ws_webservicetype WHERE value=d.newval) THEN CONTINUE; END IF;
    src := (SELECT ws_webservicetype_id FROM ws_webservicetype WHERE value=d.srcval);
    tid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceType')::int,'N'::varchar);
    INSERT INTO ws_webservicetype(ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,ad_table_id,description)
    SELECT 11,0,now(),100,now(),100,'Y',d.newval,d.newval,ws_webservice_id,ws_webservicemethod_id,tid,gen_random_uuid(),ad_table_id,'Bridge: '||d.srcval||' + '||array_to_string(d.extra,',')
    FROM ws_webservicetype WHERE ws_webservicetype_id=src;
    INSERT INTO ws_webservicetypeaccess(ad_client_id,ad_org_id,ad_role_id,created,createdby,updated,updatedby,isactive,isreadwrite,ws_webservicetype_id,ws_webservicetypeaccess_uu)
    VALUES (11,0,102,now(),100,now(),100,'Y','Y',tid,gen_random_uuid());
    INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
    SELECT 11,0,p.constantvalue,now(),100,'Y',p.parametername,p.parametertype,now(),100,
           nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid()
    FROM ws_webservice_para p WHERE p.ws_webservicetype_id=src;
    INSERT INTO ws_webservicefieldinput(ad_client_id,ad_column_id,ad_org_id,created,createdby,isactive,updated,updatedby,ws_webservicefieldinput_id,ws_webservicetype_id,ws_webservicefieldinput_uu)
    SELECT 11,c.ad_column_id,0,now(),100,'Y',now(),100,
           nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldInput')::int,'N'::varchar),tid,gen_random_uuid()
    FROM ad_column c WHERE c.ad_column_id IN (SELECT ad_column_id FROM ws_webservicefieldinput WHERE ws_webservicetype_id=src)
       OR (c.ad_table_id=(SELECT ad_table_id FROM ad_table WHERE tablename=d.tbl) AND c.columnname = ANY(d.extra));
  END LOOP;
END $$;

-- 2026-10-09 (spec §44): BridgeCreateOrder also takes DeliveryViaRule (header field a user sets; with 'P' Pickup legacy's tax lookup uses the
-- WAREHOUSE location as bill-to, Tax.java:550-553). Idempotent: inserted only when missing.
INSERT INTO ws_webservicefieldinput(ad_client_id,ad_column_id,ad_org_id,created,createdby,isactive,updated,updatedby,ws_webservicefieldinput_id,ws_webservicetype_id,ws_webservicefieldinput_uu)
SELECT 11,c.ad_column_id,0,now(),100,'Y',now(),100,
       nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldInput')::int,'N'::varchar),t.ws_webservicetype_id,gen_random_uuid()
FROM ws_webservicetype t, ad_column c
WHERE t.value='BridgeCreateOrder' AND c.ad_table_id=(SELECT ad_table_id FROM ad_table WHERE tablename='C_Order') AND c.columnname='DeliveryViaRule'
  AND NOT EXISTS (SELECT 1 FROM ws_webservicefieldinput i WHERE i.ws_webservicetype_id=t.ws_webservicetype_id AND i.ad_column_id=c.ad_column_id);
