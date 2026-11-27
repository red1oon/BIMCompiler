-- §SHOPDAY-RUN-1 R1.1 (admin lane, D6 config rows; idempotent). The WS login accepts only roles with RoleType NULL/'WS'
-- (AbstractService.java:71,116); System Administrator (role 0) is 'SS', so SuperUser (100) gets a dedicated system-level WS role
-- cloned from role 0 and access to the InitialClientSetup WS type. Restart the server after applying.
SET search_path=adempiere;
BEGIN;
DELETE FROM ws_webservicetypeaccess WHERE ad_role_id=1200001;
DELETE FROM ad_user_roles WHERE ad_role_id=1200001;
DELETE FROM ad_process_access WHERE ad_role_id=1200001;
DELETE FROM ad_role_orgaccess WHERE ad_role_id=1200001;
DELETE FROM ad_role WHERE ad_role_id=1200001;
CREATE TEMP TABLE r ON COMMIT DROP AS SELECT * FROM ad_role WHERE ad_role_id=0;
UPDATE r SET ad_role_id=1200001, name='Bridge System WS', description='Shop-day bridge: system-level WS role (clone of System Administrator)',
  roletype='WS', ad_role_uu=gen_random_uuid(), created=now(), updated=now();
INSERT INTO ad_role SELECT * FROM r;
INSERT INTO ad_role_orgaccess (ad_role_id,ad_org_id,ad_client_id,createdby,updatedby,ad_role_orgaccess_uu) VALUES (1200001,0,0,100,100,gen_random_uuid());
INSERT INTO ad_user_roles (ad_user_id,ad_role_id,ad_client_id,ad_org_id,createdby,updatedby,ad_user_roles_uu) VALUES (100,1200001,0,0,100,100,gen_random_uuid());
INSERT INTO ad_process_access (ad_process_id,ad_role_id,ad_client_id,ad_org_id,createdby,updatedby,isreadwrite,ad_process_access_uu) VALUES (53161,1200001,0,0,100,100,'Y',gen_random_uuid());
INSERT INTO ws_webservicetypeaccess (ad_client_id,ad_org_id,ad_role_id,createdby,updatedby,ws_webservicetype_id,ws_webservicetypeaccess_uu)
 VALUES (0,0,1200001,100,100,1200001,gen_random_uuid());
-- read-only look-ups the harness needs as System (resolve the new client / its roles by natural key)
INSERT INTO ws_webservicetypeaccess (ad_client_id,ad_org_id,ad_role_id,createdby,updatedby,ws_webservicetype_id,ws_webservicetypeaccess_uu)
 SELECT 0,0,1200001,100,100,ws_webservicetype_id,gen_random_uuid() FROM ws_webservicetype WHERE value IN ('QueryADClient','QueryADRole','QueryADOrg','QueryADUser') ON CONFLICT DO NOTHING;
SELECT ad_role_id,name,roletype FROM ad_role WHERE ad_client_id=0;
COMMIT;
