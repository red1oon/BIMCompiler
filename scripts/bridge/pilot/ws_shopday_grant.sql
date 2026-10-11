-- §SHOPDAY-RUN-1 R1.4 (admin lane, D6 config rows; idempotent). Grants the NEW client's Admin role the same WS types the GardenWorld
-- Admin (role 102) holds, plus the PeriodStatus runProcess type. Usage:
--   docker exec -i postgres psql -U postgres -d idempiere_pilot -v ON_ERROR_STOP=1 -v rname="'ShopDayTest Admin'" < ws_shopday_grant.sql ; restart server
SET search_path=adempiere;
BEGIN;
CREATE TEMP TABLE g ON COMMIT DROP AS SELECT ad_role_id, ad_client_id FROM ad_role WHERE name=:rname AND ad_client_id>11;
DELETE FROM ws_webservicetypeaccess WHERE ad_role_id IN (SELECT ad_role_id FROM g);
INSERT INTO ws_webservicetypeaccess (ad_client_id,ad_org_id,ad_role_id,createdby,updatedby,ws_webservicetype_id,ws_webservicetypeaccess_uu)
 SELECT g.ad_client_id,0,g.ad_role_id,100,100,t.ws_webservicetype_id,gen_random_uuid()
 FROM g, (SELECT ws_webservicetype_id FROM ws_webservicetypeaccess WHERE ad_role_id=102 UNION SELECT 1200002) t;
SELECT ad_role_id, count(*) AS granted FROM ws_webservicetypeaccess WHERE ad_role_id IN (SELECT ad_role_id FROM g) GROUP BY 1;
COMMIT;
