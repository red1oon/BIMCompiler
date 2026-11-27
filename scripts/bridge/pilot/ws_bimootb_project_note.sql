-- PILOT-ONLY config rows (owner standing authorisation 2026-10-13: "You can inject any new type needed for WS. We are to follow exact L&F of legacy at least in shape and context.").
-- WO-11 (bim-compiler prompts/MOBILE_PERF.md): after a Project Order push the legacy C_Project.Note must hold the same GUID set as the Kernel's (TWIN CARDINAL RULE).
-- Legacy refuses any input column its web-service type does not whitelist (ModelADServiceImpl "input column X not allowed"), and the BIMOOTB_* family has only Query_* and Create_*:
--   (a) Note as an allowed input on BIMOOTB_Create_C_Project                  (WS_WebServiceFieldInput, UU 32ae876e-...)
--   (b) Note as an output of BIMOOTB_Query_C_Project                         (WS_WebServiceFieldOutput; already present in 2Pack_13.1.0 with UU 88539d03-...; inserted only if missing)
--   (c) BIMOOTB_Update_C_Project, updateData on C_Project, input = Note only (WS_WebServiceType + Para x3 + FieldInput + TypeAccess for the master role "BIM OOTB Push")
-- Same shape as the 13.1.0 family (System level, client 0, role access through the master role "BIM OOTB Push") and as ws_shopday_masters.sql. Idempotent: a second run changes nothing
-- (§BIMOOTB_NOTE_SETUP prints the row counts). Config rows only: no schema change, no new column. Apply with psql to the PILOT database, then restart the pilot (stop.sh, start.sh).
SET search_path=adempiere;
DO $$
DECLARE tc int; tq int; tu int; col int; role int; n int := 0; wid int;
BEGIN
  SELECT ws_webservicetype_id INTO tc FROM ws_webservicetype WHERE value='BIMOOTB_Create_C_Project';
  SELECT ws_webservicetype_id INTO tq FROM ws_webservicetype WHERE value='BIMOOTB_Query_C_Project';
  IF tc IS NULL OR tq IS NULL THEN RAISE EXCEPTION 'BIMOOTB_Create_/Query_C_Project missing: install 2Pack_13.1.0 first'; END IF;
  SELECT ad_column_id INTO col FROM ad_column WHERE columnname='Note' AND ad_table_id=(SELECT ad_table_id FROM ad_table WHERE tablename='C_Project');
  SELECT ad_role_id INTO role FROM ad_role WHERE ad_client_id=0 AND name='BIM OOTB Push';
  IF col IS NULL OR role IS NULL THEN RAISE EXCEPTION 'C_Project.Note column or role "BIM OOTB Push" missing'; END IF;

  -- (a) Create_C_Project accepts Note
  IF NOT EXISTS (SELECT 1 FROM ws_webservicefieldinput WHERE ws_webservicetype_id=tc AND ad_column_id=col) THEN
    wid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldInput' AND istableid='Y')::int,'N'::varchar);
    INSERT INTO ws_webservicefieldinput(ad_client_id,ad_org_id,created,createdby,isactive,updated,updatedby,ws_webservicefieldinput_id,ws_webservicetype_id,ad_column_id,ws_webservicefieldinput_uu)
    VALUES (0,0,now(),100,'Y',now(),100,wid,tc,col,'32ae876e-f87e-4d04-b8ef-ce61e6f4bd07'); n := n + 1;
  END IF;

  -- (b) Query_C_Project returns Note (so the old value can be read for the union)
  IF NOT EXISTS (SELECT 1 FROM ws_webservicefieldoutput WHERE ws_webservicetype_id=tq AND ad_column_id=col) THEN
    wid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldOutput' AND istableid='Y')::int,'N'::varchar);
    INSERT INTO ws_webservicefieldoutput(ad_client_id,ad_org_id,created,createdby,isactive,updated,updatedby,ws_webservicefieldoutput_id,ws_webservicetype_id,ad_column_id,ws_webservicefieldoutput_uu)
    VALUES (0,0,now(),100,'Y',now(),100,wid,tq,col,'88539d03-f1fc-4982-b374-e1bf5a384987'); n := n + 1;
  END IF;

  -- (c) BIMOOTB_Update_C_Project: the family's update type, Note its one input
  SELECT ws_webservicetype_id INTO tu FROM ws_webservicetype WHERE value='BIMOOTB_Update_C_Project';
  IF tu IS NULL THEN
    tu := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceType')::int,'N'::varchar);
    INSERT INTO ws_webservicetype(ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,name,value,description,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,ad_table_id)
    VALUES (0,0,now(),100,now(),100,'Y','BIMOOTB_Update_C_Project','BIMOOTB_Update_C_Project','BIM OOTB push (org.idempiere.bimootb)',50001,
            (SELECT ws_webservicemethod_id FROM ws_webservicemethod WHERE value='updateData'),tu,'23332c27-c46f-4760-a7fa-b39466f00591',
            (SELECT ad_table_id FROM ad_table WHERE tablename='C_Project')); n := n + 1;
    INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
    SELECT 0,0,v.cv,now(),100,'Y',v.pn,v.pt,now(),100,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para' AND istableid='Y')::int,'N'::varchar),tu,v.uu::uuid
    FROM (VALUES ('TableName','C','C_Project','75b6ef32-8d4b-4d62-8549-58c4434e425d'),('RecordID','F',NULL,'8598b083-2bc3-4dc1-9c8f-063af1ded34f'),('Action','C','Update','bd4e2ac4-82a4-4fda-8eaa-2827d999e598')) AS v(pn,pt,cv,uu);
    wid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldInput' AND istableid='Y')::int,'N'::varchar);
    INSERT INTO ws_webservicefieldinput(ad_client_id,ad_org_id,created,createdby,isactive,updated,updatedby,ws_webservicefieldinput_id,ws_webservicetype_id,ad_column_id,ws_webservicefieldinput_uu)
    VALUES (0,0,now(),100,'Y',now(),100,wid,tu,col,'15562e47-0cfa-4fdc-8b9f-511773093097');
    INSERT INTO ws_webservicetypeaccess(ad_client_id,ad_org_id,ad_role_id,created,createdby,updated,updatedby,isactive,isreadwrite,ws_webservicetype_id,ws_webservicetypeaccess_uu)
    VALUES (0,0,role,now(),100,now(),100,'Y','Y',tu,gen_random_uuid());
  END IF;
  RAISE NOTICE '§BIMOOTB_NOTE_SETUP rows_added=% create_note_input=% query_note_output=% update_type=% update_inputs=% update_paras=% update_access=%', n,
    (SELECT count(*) FROM ws_webservicefieldinput WHERE ws_webservicetype_id=tc AND ad_column_id=col),
    (SELECT count(*) FROM ws_webservicefieldoutput WHERE ws_webservicetype_id=tq AND ad_column_id=col),
    tu, (SELECT count(*) FROM ws_webservicefieldinput WHERE ws_webservicetype_id=tu),
    (SELECT count(*) FROM ws_webservice_para WHERE ws_webservicetype_id=tu), (SELECT count(*) FROM ws_webservicetypeaccess WHERE ws_webservicetype_id=tu);
END $$;
