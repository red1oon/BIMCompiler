-- PILOT-ONLY (idempiere_pilot, local copy). Registers a read-only WS type QueryChangeLog on AD_ChangeLog
-- so the SQLite Bridge can read the change log via ADInterface queryData. Spec: prompts/SQLiteIDEMPIERE.md §4.
-- Idempotent. Role: GardenWorld Admin (102). Do NOT apply to a real server; give it to the admin as a proposal.
SET search_path=adempiere;
DO $$
DECLARE tid int; t int := (SELECT ad_table_id FROM ad_table WHERE tablename='AD_ChangeLog'); c record;
BEGIN
  SELECT ws_webservicetype_id INTO tid FROM ws_webservicetype WHERE value='QueryChangeLog';
  IF tid IS NULL THEN
    tid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceType')::int,'N'::varchar);
    INSERT INTO ws_webservicetype(ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,name,value,
        ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,ad_table_id,description)
    VALUES (11,0,now(),100,now(),100,'Y','QueryChangeLog','QueryChangeLog',50001,50028,tid,gen_random_uuid(),t,'Bridge: read AD_ChangeLog');
    INSERT INTO ws_webservicetypeaccess(ad_client_id,ad_org_id,ad_role_id,created,createdby,updated,updatedby,isactive,isreadwrite,ws_webservicetype_id,ws_webservicetypeaccess_uu)
    VALUES (11,0,102,now(),100,now(),100,'Y','N',tid,gen_random_uuid());
    INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
    SELECT 11,0,v.cv,now(),100,'Y',v.pn,v.pt,now(),100,
           nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid()
    FROM (VALUES ('TableName','C','AD_ChangeLog'),('Action','C','Read'),('RecordID','F',NULL),('Filter','F',NULL)) AS v(pn,pt,cv);
    FOR c IN SELECT ad_column_id FROM ad_column WHERE ad_table_id=t AND isactive='Y' LOOP
      INSERT INTO ws_webservicefieldoutput(ad_client_id,ad_column_id,ad_org_id,created,createdby,isactive,updated,updatedby,ws_webservicefieldoutput_id,ws_webservicetype_id,ws_webservicefieldoutput_uu)
      VALUES (11,c.ad_column_id,0,now(),100,'Y',now(),100,
        nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldOutput')::int,'N'::varchar),tid,gen_random_uuid());
    END LOOP;
  END IF;
END $$;
