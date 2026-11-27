-- §SHOPDAY-RUN-1 R1.1/R1.4 (admin lane, D6 config rows; idempotent). Apply:
--   docker exec -i postgres psql -U postgres -d idempiere_pilot -v ON_ERROR_STOP=1 < ws_shopday_system_types.sql ; restart server (WS config is cached)
-- (1) Q4 fix: WS type rows + their children move from client 11 to SYSTEM (client 0). The lookup is AD_Client_ID IN (0,sessionClient)
--     (AbstractService.java:239-244), so client 11 still sees them and a new client's roles can be granted them (access rows per role).
-- (2) runProcess types for the two processes the shop day needs, owned by SYSTEM: InitialClientSetup 53161 (System Administrator role 0
--     gets access here), PeriodStatus 167 (C_Period_Process; per-role access rows are written by ws_shopday_grant.sql for the new client).
SET search_path=adempiere;
BEGIN;
UPDATE ws_webservicetype      SET ad_client_id=0 WHERE ad_client_id=11;
UPDATE ws_webservice_para     SET ad_client_id=0 WHERE ad_client_id=11 AND ws_webservicetype_id IN (SELECT ws_webservicetype_id FROM ws_webservicetype WHERE ad_client_id=0);
UPDATE ws_webservicefieldinput SET ad_client_id=0 WHERE ad_client_id=11 AND ws_webservicetype_id IN (SELECT ws_webservicetype_id FROM ws_webservicetype WHERE ad_client_id=0);
UPDATE ws_webservicefieldoutput SET ad_client_id=0 WHERE ad_client_id=11 AND ws_webservicetype_id IN (SELECT ws_webservicetype_id FROM ws_webservicetype WHERE ad_client_id=0);
DELETE FROM ws_webservice_para WHERE ws_webservicetype_id IN (1200001,1200002);
DELETE FROM ws_webservicetypeaccess WHERE ws_webservicetype_id IN (1200001,1200002);
DELETE FROM ws_webservicetype WHERE ws_webservicetype_id IN (1200001,1200002);
INSERT INTO ws_webservicetype (ad_client_id,ad_org_id,ad_table_id,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,created,createdby,updated,updatedby)
 VALUES (0,0,NULL,'Y','Bridge_RunProcess_InitialClientSetup','Bridge_RunProcess_InitialClientSetup',50001,50022,1200001,gen_random_uuid(),now(),100,now(),100),
        (0,0,NULL,'Y','Bridge_RunProcess_PeriodStatus','Bridge_RunProcess_PeriodStatus',50001,50022,1200002,gen_random_uuid(),now(),100,now(),100);
INSERT INTO ws_webservice_para (ad_client_id,ad_org_id,constantvalue,parametername,parametertype,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu,createdby,updatedby) VALUES
 (0,0,'53161','AD_Process_ID','C',1200001,1200001,gen_random_uuid(),100,100),
 (0,0,'','AD_Menu_ID','F',1200002,1200001,gen_random_uuid(),100,100),
 (0,0,'','AD_Record_ID','F',1200003,1200001,gen_random_uuid(),100,100),
 (0,0,'167','AD_Process_ID','C',1200004,1200002,gen_random_uuid(),100,100),
 (0,0,'','AD_Menu_ID','F',1200005,1200002,gen_random_uuid(),100,100),
 (0,0,'','AD_Record_ID','F',1200006,1200002,gen_random_uuid(),100,100);
INSERT INTO ws_webservicetypeaccess (ad_client_id,ad_org_id,ad_role_id,createdby,updatedby,ws_webservicetype_id,ws_webservicetypeaccess_uu)
 VALUES (0,0,0,100,100,1200001,gen_random_uuid());
COMMIT;
SELECT ad_client_id, count(*) FROM ws_webservicetype GROUP BY 1;
