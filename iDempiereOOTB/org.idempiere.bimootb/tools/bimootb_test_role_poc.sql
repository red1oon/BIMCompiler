-- TEST FIXTURE, LOCAL PILOT ONLY (never in the 2Pack): a GardenWorld role "BIM Push Test" for GardenAdmin that includes GardenWorld Admin (102, for the CAPEX dashboard's reads)
-- but NOT, by default, the master role "BIM OOTB Push" — so the BIMOOTB_* push must be refused until the include is added (prompts/BIM_OOTB_LEGACY_IDEMPIERE_INTEGRATION.md §8 W-PLUGIN-INSTALL negative).
SET search_path=adempiere;
DO $$
DECLARE tr int;
BEGIN
  SELECT ad_role_id INTO tr FROM ad_role WHERE ad_client_id=11 AND name='BIM Push Test';
  IF tr IS NULL THEN
    CREATE TEMP TABLE _r AS SELECT * FROM ad_role WHERE ad_role_id=102;
    tr := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='AD_Role' AND istableid='Y')::int,'N'::varchar);
    UPDATE _r SET ad_role_id=tr, name='BIM Push Test', description='test fixture: GardenWorld Admin + (optionally) the BIM OOTB Push master role', created=now(), updated=now(), ad_role_uu=gen_random_uuid();
    INSERT INTO ad_role SELECT * FROM _r; DROP TABLE _r;
    CREATE TEMP TABLE _o AS SELECT * FROM ad_role_orgaccess WHERE ad_role_id=102;
    UPDATE _o SET ad_role_id=tr, created=now(), updated=now(), ad_role_orgaccess_uu=gen_random_uuid();
    INSERT INTO ad_role_orgaccess SELECT * FROM _o; DROP TABLE _o;
    INSERT INTO ad_user_roles(ad_user_id,ad_role_id,ad_client_id,ad_org_id,isactive,created,createdby,updated,updatedby,ad_user_roles_uu) VALUES (101,tr,11,0,'Y',now(),100,now(),100,gen_random_uuid());
    INSERT INTO ad_role_included(ad_role_id,included_role_id,ad_client_id,ad_org_id,isactive,seqno,created,createdby,updated,updatedby,ad_role_included_uu) VALUES (tr,102,11,0,'Y',10,now(),100,now(),100,gen_random_uuid());
  END IF;
  RAISE NOTICE 'BIM Push Test role id=%', tr;
END $$;
