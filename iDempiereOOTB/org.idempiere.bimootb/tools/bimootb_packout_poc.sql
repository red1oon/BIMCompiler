-- POC, LOCAL PILOT ONLY: what iDempiere's own Pack Out needs to build the plugin's META-INF/2Pack_13.1.0.zip (prompts/BIM_OOTB_LEGACY_IDEMPIERE_INTEGRATION.md §8 P1).
-- PackOutProcess (AD_Process 50004) exports ONLY rows of the logged-in client (GenericPOElementHandler.java:150-151) → run as System (client 0, role 0).
-- A Data line = AD_Table + "<select>;<child table>;…" (children exported under each parent, :213-229). Order: role first (the type access rows point at it).
SET search_path=adempiere;
DO $$
DECLARE tid int; pid int; ln int := 0; d record;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM ws_webservicetype WHERE value='BIMOOTB_RunProcess_PackOut') THEN
    tid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceType')::int,'N'::varchar);
    INSERT INTO ws_webservicetype(ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,description)
    VALUES (0,0,now(),100,now(),100,'Y','BIMOOTB_RunProcess_PackOut','BIMOOTB_RunProcess_PackOut',50001,(SELECT ws_webservicemethod_id FROM ws_webservicemethod WHERE value='runProcess'),tid,gen_random_uuid(),'POC: run Pack Out to build the bimootb 2Pack (pilot only)');
    INSERT INTO ws_webservicetypeaccess(ad_client_id,ad_org_id,ad_role_id,created,createdby,updated,updatedby,isactive,isreadwrite,ws_webservicetype_id,ws_webservicetypeaccess_uu)
    VALUES (0,0,0,now(),100,now(),100,'Y','Y',tid,gen_random_uuid());
    INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
    SELECT 0,0,v.cv,now(),100,'Y',v.pn,v.pt,now(),100,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid()
    FROM (VALUES ('AD_Process_ID','C','50004'),('AD_Menu_ID','C','0'),('AD_Record_ID','F',NULL)) AS v(pn,pt,cv);
  END IF;
  SELECT ad_package_exp_id INTO pid FROM ad_package_exp WHERE ad_client_id=0 AND name='org.idempiere.bimootb' AND pk_version='13.1.0';
  IF pid IS NULL THEN
    pid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='AD_Package_Exp' AND istableid='Y')::int,'N'::varchar);
    INSERT INTO ad_package_exp(ad_package_exp_id,ad_client_id,ad_org_id,isactive,created,createdby,updated,updatedby,name,pk_version,description,instructions,isexportdictionaryentity,isincludeorganizationid,processing,ad_package_exp_uu)
    VALUES (pid,0,0,'Y',now(),100,now(),100,'org.idempiere.bimootb','13.1.0','BIM OOTB: the viewer push''s web-service types, the BIM OOTB Push master role, settings, the BIM tab',
      'Include the role "BIM OOTB Push" in the role of the user who pushes from the viewer, then restart or Cache Reset.','N','N','N',gen_random_uuid());
    FOR d IN SELECT * FROM (VALUES
        ('AD_Role',        'SELECT * FROM AD_Role WHERE AD_Client_ID=0 AND Name=''BIM OOTB Push'''),
        ('WS_WebServiceType','SELECT * FROM WS_WebServiceType WHERE AD_Client_ID=0 AND Value LIKE ''BIMOOTB\_%'' AND Value<>''BIMOOTB_RunProcess_PackOut'';WS_WebService_Para;WS_WebServiceFieldInput;WS_WebServiceFieldOutput;WS_WebServiceTypeAccess'),
        ('AD_SysConfig',   'SELECT * FROM AD_SysConfig WHERE AD_Client_ID=0 AND Name LIKE ''BIMOOTB\_%'''),
        ('AD_Ref_List',    'SELECT * FROM AD_Ref_List WHERE AD_Reference_ID=200117 AND Value=''BIM'''),
        ('AD_Tab',         'SELECT * FROM AD_Tab WHERE AD_Tab_UU=''b1a00100-0001-4000-8000-000000000001''')) AS v(tbl,sqlst)
    LOOP
      ln := ln + 10;
      INSERT INTO ad_package_exp_detail(ad_package_exp_detail_id,ad_package_exp_id,ad_client_id,ad_org_id,isactive,created,createdby,updated,updatedby,line,type,ad_table_id,sqlstatement,processing,ad_package_exp_detail_uu)
      VALUES (nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='AD_Package_Exp_Detail' AND istableid='Y')::int,'N'::varchar),pid,0,0,'Y',now(),100,now(),100,ln,'D',
        (SELECT ad_table_id FROM ad_table WHERE tablename=d.tbl),d.sqlst,'N',gen_random_uuid());
    END LOOP;
  END IF;
  RAISE NOTICE 'AD_Package_Exp_ID=%', pid;
END $$;
