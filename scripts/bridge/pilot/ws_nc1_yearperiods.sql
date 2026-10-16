-- §NC-1 (admin lane, D6 config rows; idempotent; user-authorised 2026-10-13: "You can inject any new type needed for WS").
-- runProcess type for AD_Process 100 (C_Year Create Periods, org.compiere.process.YearCreatePeriods), SYSTEM-owned like Bridge_RunProcess_PeriodStatus.
-- Apply: docker exec -i postgres psql -U postgres -d idempiere_pilot -v ON_ERROR_STOP=1 < ws_nc1_yearperiods.sql ; restart server (WS config is cached)
-- Per-role access: GardenWorld Admin 102 + System 0 here; a new client's Admin role is granted by ws_shopday_grant.sql-style insert (t.ws_webservicetype_id 1200003).
SET search_path=adempiere;
BEGIN;
DELETE FROM ws_webservice_para WHERE ws_webservicetype_id=1200003;
DELETE FROM ws_webservicetypeaccess WHERE ws_webservicetype_id=1200003;
DELETE FROM ws_webservicetype WHERE ws_webservicetype_id=1200003;
INSERT INTO ws_webservicetype (ad_client_id,ad_org_id,ad_table_id,isactive,name,value,ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,created,createdby,updated,updatedby)
 VALUES (0,0,NULL,'Y','Bridge_RunProcess_YearCreatePeriods','Bridge_RunProcess_YearCreatePeriods',50001,50022,1200003,gen_random_uuid(),now(),100,now(),100);
INSERT INTO ws_webservice_para (ad_client_id,ad_org_id,constantvalue,parametername,parametertype,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu,createdby,updatedby) VALUES
 (0,0,'100','AD_Process_ID','C',1200007,1200003,gen_random_uuid(),100,100),
 (0,0,'','AD_Menu_ID','F',1200008,1200003,gen_random_uuid(),100,100),
 (0,0,'','AD_Record_ID','F',1200009,1200003,gen_random_uuid(),100,100);
INSERT INTO ws_webservicetypeaccess (ad_client_id,ad_org_id,ad_role_id,createdby,updatedby,ws_webservicetype_id,ws_webservicetypeaccess_uu)
 SELECT 0,0,r,100,100,1200003,gen_random_uuid() FROM (VALUES (0),(102)) v(r);
COMMIT;
SELECT value FROM ws_webservicetype WHERE ws_webservicetype_id=1200003;
