-- POC, TEST COPY ONLY (:8108 backed up first): what iDempiere's own Pack Out (AD_Process 50004) needs to build META-INF/2Pack_13.1.1.zip — the BIM link field
-- (bim-compiler prompts/BIM_OOTB_LEGACY_IDEMPIERE_INTEGRATION.md §8.10 item 3). Same pattern as bimootb_packout_poc.sql (§8.2): one AD_Package_Exp + Data lines, run through the stock
-- run_process web service as a System user. PackOutProcess exports ONLY rows of the logged-in client (GenericPOElementHandler.java:150-151) -> client 0.
-- The test copy has no WS-capable System role (role 0 is RoleType SS: refused, AbstractService.java:70), so a TEMPORARY one is made here for SuperUser; the export lines do not select it,
-- and the copy is restored from its backup afterwards.
-- Order: element, column (references the element), field (references the column + tab 157), the WS input row (type BIMOOTB_Create_C_Project from 13.1.0 + the column), tab 200500 IsActive=N.
SET search_path=adempiere;
DO $$
DECLARE tid int; rid int; pid int; ln int := 0; d record;
BEGIN
  SELECT ad_role_id INTO rid FROM ad_role WHERE ad_client_id=0 AND name='BIMLINK PackOut WS (temporary)';
  IF rid IS NULL THEN
    rid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='AD_Role' AND istableid='Y')::int,'N'::varchar);
    INSERT INTO ad_role(ad_role_id,ad_client_id,ad_org_id,isactive,created,createdby,updated,updatedby,name,userlevel,ismanual,isshowacct,ispersonallock,ispersonalaccess,iscanexport,iscanreport,
      iscanapproveowndoc,isaccessallorgs,ischangelog,preferencetype,overwritepricelimit,isuseuserorgaccess,amtapproval,allow_info_account,allow_info_asset,allow_info_bpartner,allow_info_cashjournal,
      allow_info_inout,allow_info_invoice,allow_info_order,allow_info_payment,allow_info_product,allow_info_resource,allow_info_schedule,isdiscountuptolimitprice,isdiscountallowedontotal,ismasterrole,roletype,ad_role_uu)
    SELECT rid,0,0,'Y',now(),100,now(),100,'BIMLINK PackOut WS (temporary)',userlevel,'Y',isshowacct,ispersonallock,ispersonalaccess,iscanexport,iscanreport,iscanapproveowndoc,isaccessallorgs,ischangelog,
      preferencetype,overwritepricelimit,isuseuserorgaccess,amtapproval,allow_info_account,allow_info_asset,allow_info_bpartner,allow_info_cashjournal,allow_info_inout,allow_info_invoice,allow_info_order,
      allow_info_payment,allow_info_product,allow_info_resource,allow_info_schedule,isdiscountuptolimitprice,isdiscountallowedontotal,'N',NULL,gen_random_uuid() FROM ad_role WHERE ad_role_id=0;
    INSERT INTO ad_user_roles(ad_user_id,ad_role_id,ad_client_id,ad_org_id,isactive,created,createdby,updated,updatedby,ad_user_roles_uu) VALUES (100,rid,0,0,'Y',now(),100,now(),100,gen_random_uuid());
    INSERT INTO ad_role_orgaccess(ad_role_id,ad_org_id,ad_client_id,isactive,created,createdby,updated,updatedby,isreadonly,ad_role_orgaccess_uu) VALUES (rid,0,0,'Y',now(),100,now(),100,'N',gen_random_uuid());
    INSERT INTO ad_process_access(ad_process_id,ad_role_id,ad_client_id,ad_org_id,isactive,created,createdby,updated,updatedby,isreadwrite,ad_process_access_uu) VALUES (50004,rid,0,0,'Y',now(),100,now(),100,'Y',gen_random_uuid());
  END IF;
  SELECT ws_webservicetype_id INTO tid FROM ws_webservicetype WHERE value='BIMOOTB_RunProcess_PackOut';
  IF tid IS NULL THEN
    tid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceType')::int,'N'::varchar);
    INSERT INTO ws_webservicetype(ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,description)
    VALUES (0,0,now(),100,now(),100,'Y','BIMOOTB_RunProcess_PackOut','BIMOOTB_RunProcess_PackOut',50001,(SELECT ws_webservicemethod_id FROM ws_webservicemethod WHERE value='runProcess'),tid,gen_random_uuid(),'POC: run Pack Out to build the bimootb 2Pack (test copy only)');
    INSERT INTO ws_webservicetypeaccess(ad_client_id,ad_org_id,ad_role_id,created,createdby,updated,updatedby,isactive,isreadwrite,ws_webservicetype_id,ws_webservicetypeaccess_uu)
    VALUES (0,0,rid,now(),100,now(),100,'Y','Y',tid,gen_random_uuid());
    INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
    SELECT 0,0,v.cv,now(),100,'Y',v.pn,v.pt,now(),100,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid()
    FROM (VALUES ('AD_Process_ID','C','50004'),('AD_Menu_ID','C','0'),('AD_Record_ID','F',NULL)) AS v(pn,pt,cv);
  END IF;
  SELECT ad_package_exp_id INTO pid FROM ad_package_exp WHERE ad_client_id=0 AND name='org.idempiere.bimootb' AND pk_version='13.1.1';
  IF pid IS NULL THEN
    pid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='AD_Package_Exp' AND istableid='Y')::int,'N'::varchar);
    INSERT INTO ad_package_exp(ad_package_exp_id,ad_client_id,ad_org_id,isactive,created,createdby,updated,updatedby,name,pk_version,description,instructions,isexportdictionaryentity,isincludeorganizationid,processing,ad_package_exp_uu)
    VALUES (pid,0,0,'Y',now(),100,now(),100,'org.idempiere.bimootb','13.1.1','BIM OOTB: the BIM link field C_Project.BIM_ViewerURL ("BIM Model", URL, read-only) on the Project tab; the push may write it; the retired BIM tab made inactive',
      'Nothing to do: the BIM Viewer fills the field when it pushes a Project Order.','N','N','N',gen_random_uuid());
    FOR d IN SELECT * FROM (VALUES
        ('AD_Element',  'SELECT * FROM AD_Element WHERE AD_Element_UU=''c31edb07-16a8-4ad7-adbf-91c6b3deb47d'''),
        ('AD_Column',   'SELECT * FROM AD_Column WHERE AD_Column_UU=''aef1e7cc-a955-48e6-be87-fa681932f9fd'''),
        ('AD_Field',    'SELECT * FROM AD_Field WHERE AD_Field_UU=''afdbdfb4-2439-4884-998f-e0413adab19c'''),
        ('WS_WebServiceFieldInput','SELECT * FROM WS_WebServiceFieldInput WHERE WS_WebServiceFieldInput_UU=''2231a3b8-75ed-4fd9-bc8a-a9865cd2dab6'''),
        ('AD_Tab',      'SELECT * FROM AD_Tab WHERE AD_Tab_UU=''b1a00100-0001-4000-8000-000000000001''')) AS v(tbl,sqlst)
    LOOP
      ln := ln + 10;
      INSERT INTO ad_package_exp_detail(ad_package_exp_detail_id,ad_package_exp_id,ad_client_id,ad_org_id,isactive,created,createdby,updated,updatedby,line,type,ad_table_id,sqlstatement,processing,ad_package_exp_detail_uu)
      VALUES (nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='AD_Package_Exp_Detail' AND istableid='Y')::int,'N'::varchar),pid,0,0,'Y',now(),100,now(),100,ln,'D',
        (SELECT ad_table_id FROM ad_table WHERE tablename=d.tbl),d.sqlst,'N',gen_random_uuid());
    END LOOP;
  END IF;
  RAISE NOTICE '§BIMLINK_PACKOUT_SETUP AD_Package_Exp_ID=% ws_role=%', pid, rid;
END $$;
