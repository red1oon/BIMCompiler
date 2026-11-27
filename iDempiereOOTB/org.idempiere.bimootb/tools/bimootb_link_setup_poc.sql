-- POC, TEST COPY ONLY (:8108 backed up first): the dictionary rows of the BIM link field, made on a configured copy so iDempiere's own Pack Out can build META-INF/2Pack_13.1.1.zip
-- (bim-compiler prompts/BIM_OOTB_LEGACY_IDEMPIERE_INTEGRATION.md §8.10 items 1 + 3). Run AFTER 2Pack_13.1.0 is installed (it makes BIMOOTB_Create_C_Project and tab 200500). Idempotent.
-- The UUs below are the identity of these rows everywhere (legacy Pack In and the Kernel overlay, bim-ootb erp/ad_bim_link_overlay.js): never change them.
-- Made by SQL like §8.1's setup rows; the Pack In on a CLEAN copy then proves they pass the model (§8.3 lesson).
SET search_path=adempiere;
DO $$
DECLARE eid int; cid int; fid int; tid int; wid int;
BEGIN
  SELECT ad_element_id INTO eid FROM ad_element WHERE ad_element_uu='c31edb07-16a8-4ad7-adbf-91c6b3deb47d';
  IF eid IS NULL THEN
    eid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='AD_Element' AND istableid='Y')::int,'N'::varchar);
    INSERT INTO ad_element(ad_element_id,ad_client_id,ad_org_id,isactive,created,createdby,updated,updatedby,columnname,entitytype,name,printname,description,help,ad_element_uu)
    VALUES (eid,0,0,'Y',now(),100,now(),100,'BIM_ViewerURL','U','BIM Model','BIM Model','The BIM model this project was pushed from: opens it in the BIM Viewer',
      'Written by the BIM Viewer when it pushes this Project Order (Find > ERP): the address of that Viewer with the model''s database. Read-only. The button opens it in a new tab.','c31edb07-16a8-4ad7-adbf-91c6b3deb47d');
  END IF;
  SELECT ad_column_id INTO cid FROM ad_column WHERE ad_column_uu='aef1e7cc-a955-48e6-be87-fa681932f9fd';
  IF cid IS NULL THEN
    cid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='AD_Column' AND istableid='Y')::int,'N'::varchar);
    INSERT INTO ad_column(ad_column_id,ad_client_id,ad_org_id,isactive,created,updated,createdby,updatedby,name,description,help,version,entitytype,columnname,ad_table_id,ad_reference_id,fieldlength,
      iskey,isparent,ismandatory,isupdateable,isidentifier,seqno,istranslated,isencrypted,isselectioncolumn,ad_element_id,issyncdatabase,isalwaysupdateable,isallowlogging,isallowcopy,ad_column_uu)
    VALUES (cid,0,0,'Y',now(),now(),100,100,'BIM Model','The BIM model this project was pushed from: opens it in the BIM Viewer',
      'Written by the BIM Viewer when it pushes this Project Order (Find > ERP): the address of that Viewer with the model''s database. Read-only. The button opens it in a new tab.',
      0,'U','BIM_ViewerURL',(SELECT ad_table_id FROM ad_table WHERE tablename='C_Project'),40,2000,'N','N','N','Y','N',0,'N','N','N',eid,'Y','N','Y','N','aef1e7cc-a955-48e6-be87-fa681932f9fd');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='adempiere' AND table_name='c_project' AND column_name='bim_viewerurl') THEN
    ALTER TABLE c_project ADD COLUMN bim_viewerurl VARCHAR(2000) DEFAULT NULL;
  END IF;
  SELECT ad_field_id INTO fid FROM ad_field WHERE ad_field_uu='afdbdfb4-2439-4884-998f-e0413adab19c';
  IF fid IS NULL THEN
    fid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='AD_Field' AND istableid='Y')::int,'N'::varchar);
    INSERT INTO ad_field(ad_field_id,ad_client_id,ad_org_id,isactive,created,createdby,updated,updatedby,name,description,help,iscentrallymaintained,ad_tab_id,ad_column_id,isdisplayed,displaylength,
      isreadonly,seqno,issameline,isheading,isfieldonly,isencrypted,entitytype,seqnogrid,isdisplayedgrid,xposition,numlines,columnspan,isquickentry,isdefaultfocus,isquickform,ad_field_uu)
    VALUES (fid,0,0,'Y',now(),100,now(),100,'BIM Model','The BIM model this project was pushed from: opens it in the BIM Viewer',
      'Written by the BIM Viewer when it pushes this Project Order (Find > ERP): the address of that Viewer with the model''s database. Read-only. The button opens it in a new tab.',
      'Y',157,cid,'Y',60,'Y',65,'N','N','N','N','U',65,'Y',1,1,5,'N','N','N','afdbdfb4-2439-4884-998f-e0413adab19c');
  END IF;
  SELECT ws_webservicetype_id INTO tid FROM ws_webservicetype WHERE value='BIMOOTB_Create_C_Project';
  IF tid IS NULL THEN RAISE EXCEPTION 'BIMOOTB_Create_C_Project missing: install 2Pack_13.1.0 first'; END IF;
  IF NOT EXISTS (SELECT 1 FROM ws_webservicefieldinput WHERE ws_webservicefieldinput_uu='2231a3b8-75ed-4fd9-bc8a-a9865cd2dab6') THEN
    wid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldInput' AND istableid='Y')::int,'N'::varchar);
    INSERT INTO ws_webservicefieldinput(ad_client_id,ad_org_id,created,createdby,isactive,updated,updatedby,ws_webservicefieldinput_id,ws_webservicetype_id,ad_column_id,ws_webservicefieldinput_uu)
    VALUES (0,0,now(),100,'Y',now(),100,wid,tid,cid,'2231a3b8-75ed-4fd9-bc8a-a9865cd2dab6');
  END IF;
  UPDATE ad_tab SET isactive='N', updated=now(), updatedby=100 WHERE ad_tab_uu='b1a00100-0001-4000-8000-000000000001' AND isactive='Y';
  RAISE NOTICE '§BIMLINK_SETUP element=% column=% field=% wsinput=(type %) tab200500=%', eid, cid, fid, tid, (SELECT isactive FROM ad_tab WHERE ad_tab_uu='b1a00100-0001-4000-8000-000000000001');
END $$;
