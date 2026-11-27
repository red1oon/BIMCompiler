-- POC, LOCAL PILOT ONLY (owner staging: "adhoc as POC first ... once proven ... evolve to convention"). prompts/BIM_OOTB_LEGACY_IDEMPIERE_INTEGRATION.md §8 P1.
-- Makes, at System level (client 0), the rows the plugin's 2Pack will carry, so Pack Out can export them:
--   14 WS types BIMOOTB_* = clones of the push types PROVEN by the CAPEX twin (bim-ootb capex/tools/shed_twin.js pushCfg), with their params + field whitelists;
--   master role "BIM OOTB Push" (IsMasterRole=Y) holding access to all 14; SysConfig BIMOOTB_VIEWER_URL / BIMOOTB_BUILDINGS_BASE; AD_Ref_List 'BIM' on AD_TabType (reference 200117).
-- Idempotent (skips what exists). Restore: deactivate (IsActive='N') the rows named BIMOOTB_* / "BIM OOTB Push" — never needed on a fresh DB.
SET search_path=adempiere;
DO $$
DECLARE src record; nid int; rid int;
BEGIN
  -- master role
  SELECT ad_role_id INTO rid FROM ad_role WHERE ad_client_id=0 AND name='BIM OOTB Push';
  IF rid IS NULL THEN
    CREATE TEMP TABLE _r AS SELECT * FROM ad_role WHERE ad_role_id=0;
    rid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='AD_Role' AND istableid='Y')::int,'N'::varchar);
    UPDATE _r SET ad_role_id=rid, name='BIM OOTB Push', description='Web-service access for the BIM OOTB viewer push (org.idempiere.bimootb). Include it in the role of the user who pushes.',
      ismasterrole='Y', ismanual='Y', created=now(), updated=now(), createdby=100, updatedby=100, ad_role_uu=gen_random_uuid();
    INSERT INTO ad_role SELECT * FROM _r; DROP TABLE _r;
  END IF;
  -- the 14 types
  FOR src IN SELECT t.ws_webservicetype_id AS sid, v.nv FROM ws_webservicetype t JOIN (VALUES
      ('QueryCProject','BIMOOTB_Query_C_Project'),('BridgeCreateCProject','BIMOOTB_Create_C_Project'),
      ('QueryCProjectPhase','BIMOOTB_Query_C_ProjectPhase'),('BridgeCreateCProjectPhase','BIMOOTB_Create_C_ProjectPhase'),
      ('QueryCProjectTask','BIMOOTB_Query_C_ProjectTask'),('BridgeCreateCProjectTask','BIMOOTB_Create_C_ProjectTask'),
      ('QueryCProjectLine','BIMOOTB_Query_C_ProjectLine'),('BridgeCreateCProjectLine','BIMOOTB_Create_C_ProjectLine'),
      ('QueryMProduct','BIMOOTB_Query_M_Product'),('Bridge_createData_M_Product','BIMOOTB_Create_M_Product'),
      ('QueryMProductCategory','BIMOOTB_Query_M_Product_Category'),('Bridge_createData_M_Product_Category','BIMOOTB_Create_M_Product_Category'),
      ('QueryCUOM','BIMOOTB_Query_C_UOM'),('BridgeCreateCUOM','BIMOOTB_Create_C_UOM')) AS v(ov,nv) ON v.ov=t.value
  LOOP
    IF EXISTS (SELECT 1 FROM ws_webservicetype WHERE value=src.nv) THEN CONTINUE; END IF;
    nid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceType')::int,'N'::varchar);
    CREATE TEMP TABLE _t AS SELECT * FROM ws_webservicetype WHERE ws_webservicetype_id=src.sid;
    UPDATE _t SET ws_webservicetype_id=nid, ad_client_id=0, ad_org_id=0, value=src.nv, name=src.nv, description='BIM OOTB push (org.idempiere.bimootb)', created=now(), updated=now(), ws_webservicetype_uu=gen_random_uuid();
    INSERT INTO ws_webservicetype SELECT * FROM _t; DROP TABLE _t;
    CREATE TEMP TABLE _p AS SELECT * FROM ws_webservice_para WHERE ws_webservicetype_id=src.sid;
    UPDATE _p SET ws_webservice_para_id=nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar), ws_webservicetype_id=nid, ad_client_id=0, ad_org_id=0, ws_webservice_para_uu=gen_random_uuid();
    INSERT INTO ws_webservice_para SELECT * FROM _p; DROP TABLE _p;
    CREATE TEMP TABLE _i AS SELECT * FROM ws_webservicefieldinput WHERE ws_webservicetype_id=src.sid;
    UPDATE _i SET ws_webservicefieldinput_id=nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldInput')::int,'N'::varchar), ws_webservicetype_id=nid, ad_client_id=0, ad_org_id=0, ws_webservicefieldinput_uu=gen_random_uuid();
    INSERT INTO ws_webservicefieldinput SELECT * FROM _i; DROP TABLE _i;
    CREATE TEMP TABLE _o AS SELECT * FROM ws_webservicefieldoutput WHERE ws_webservicetype_id=src.sid;
    UPDATE _o SET ws_webservicefieldoutput_id=nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldOutput')::int,'N'::varchar), ws_webservicetype_id=nid, ad_client_id=0, ad_org_id=0, ws_webservicefieldoutput_uu=gen_random_uuid();
    INSERT INTO ws_webservicefieldoutput SELECT * FROM _o; DROP TABLE _o;
    INSERT INTO ws_webservicetypeaccess(ad_client_id,ad_org_id,ad_role_id,created,createdby,updated,updatedby,isactive,isreadwrite,ws_webservicetype_id,ws_webservicetypeaccess_uu)
    VALUES (0,0,rid,now(),100,now(),100,'Y','Y',nid,gen_random_uuid());
  END LOOP;
  -- settings (System level; a tenant may override per client)
  IF NOT EXISTS (SELECT 1 FROM ad_sysconfig WHERE name='BIMOOTB_VIEWER_URL') THEN
    INSERT INTO ad_sysconfig(ad_sysconfig_id,ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,name,value,description,entitytype,configurationlevel,ad_sysconfig_uu)
    VALUES (nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='AD_SysConfig' AND istableid='Y')::int,'N'::varchar),0,0,now(),100,now(),100,'Y','BIMOOTB_VIEWER_URL','/bimootb/viewer/viewer.html','BIM OOTB viewer page used by the Project window BIM tab','U','C',gen_random_uuid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM ad_sysconfig WHERE name='BIMOOTB_BUILDINGS_BASE') THEN
    INSERT INTO ad_sysconfig(ad_sysconfig_id,ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,name,value,description,entitytype,configurationlevel,ad_sysconfig_uu)
    VALUES (nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='AD_SysConfig' AND istableid='Y')::int,'N'::varchar),0,0,now(),100,now(),100,'Y','BIMOOTB_BUILDINGS_BASE','/bimootb/buildings/','Where the BIM tab finds <C_Project.Value>_extracted.db when the push left no link-back','U','C',gen_random_uuid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM ad_ref_list WHERE ad_reference_id=200117 AND value='BIM') THEN
    INSERT INTO ad_ref_list(ad_ref_list_id,ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,value,name,description,ad_reference_id,entitytype,ad_ref_list_uu)
    VALUES (nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='AD_Ref_List' AND istableid='Y')::int,'N'::varchar),0,0,now(),100,now(),100,'Y','BIM','BIM','BIM OOTB viewer tab (org.idempiere.bimootb BIMTabPanelFactory)',200117,'U',gen_random_uuid());
  END IF;
END $$;

-- §8.3 FIX (2026-11-03): legacy refuses a FREE Filter param on save (MWebServicePara.beforeSave :114-121, IDEMPIERE-1784) — the 2Pack import failed on it.
-- (a) the Filter param of every BIMOOTB_ query type becomes Constant '1=1' (a no-op; Constant passes the rule; a NULL constant would NPE in ModelADServiceImpl.validateParameter);
-- (b) finds go by DataRow key fields (ModelADServiceImpl.queryData: whitelisted INPUT columns become bound `col LIKE ?` / `col=?`), so each query type whitelists its natural key as input.
DO $$
DECLARE k record;
BEGIN
  UPDATE ws_webservice_para p SET parametertype='C', constantvalue='1=1', updated=now()
   FROM ws_webservicetype t WHERE t.ws_webservicetype_id=p.ws_webservicetype_id AND t.value LIKE 'BIMOOTB\_Query\_%' AND p.parametername='Filter' AND p.parametertype<>'C';
  FOR k IN SELECT * FROM (VALUES
      ('BIMOOTB_Query_C_Project','C_Project','Value'),
      ('BIMOOTB_Query_C_ProjectPhase','C_ProjectPhase','C_Project_ID'),('BIMOOTB_Query_C_ProjectPhase','C_ProjectPhase','Name'),
      ('BIMOOTB_Query_C_ProjectTask','C_ProjectTask','C_ProjectPhase_ID'),('BIMOOTB_Query_C_ProjectTask','C_ProjectTask','Name'),
      ('BIMOOTB_Query_C_ProjectLine','C_ProjectLine','C_ProjectPhase_ID'),('BIMOOTB_Query_C_ProjectLine','C_ProjectLine','M_Product_ID'),('BIMOOTB_Query_C_ProjectLine','C_ProjectLine','C_ProjectTask_ID'),
      ('BIMOOTB_Query_M_Product','M_Product','Value'),
      ('BIMOOTB_Query_M_Product_Category','M_Product_Category','Name'),
      ('BIMOOTB_Query_C_UOM','C_UOM','X12DE355')) AS v(tv,tbl,col)
  LOOP
    INSERT INTO ws_webservicefieldinput(ad_client_id,ad_column_id,ad_org_id,created,createdby,isactive,updated,updatedby,ws_webservicefieldinput_id,ws_webservicetype_id,ws_webservicefieldinput_uu)
    SELECT 0,c.ad_column_id,0,now(),100,'Y',now(),100,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldInput')::int,'N'::varchar),t.ws_webservicetype_id,gen_random_uuid()
      FROM ws_webservicetype t JOIN ad_table tb ON tb.tablename=k.tbl JOIN ad_column c ON c.ad_table_id=tb.ad_table_id AND c.columnname=k.col
     WHERE t.value=k.tv AND NOT EXISTS (SELECT 1 FROM ws_webservicefieldinput f WHERE f.ws_webservicetype_id=t.ws_webservicetype_id AND f.ad_column_id=c.ad_column_id);
  END LOOP;
END $$;
