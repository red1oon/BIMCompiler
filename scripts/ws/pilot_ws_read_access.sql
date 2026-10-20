SET search_path=adempiere;
-- ⚠ DO NOT REMOVE - pilot copy DB ONLY (idempiere_pilot, never idempiere). Grants role 102 (GardenAdmin) the existing read/query web-service types so the W-WS-DIFF-READ witness (bim-compiler prompts/ERP_WS_API.md S1) can ask legacy the same questions it asks ours.
-- Owner authorisation 2026-10-13: "You can inject any new type needed for WS" (pilot config rows). Idempotent.
INSERT INTO ws_webservicetypeaccess (ad_client_id, ad_org_id, ad_role_id, createdby, updatedby, ws_webservicetype_id, ws_webservicetypeaccess_uu)
SELECT 11, 0, 102, 100, 100, t.ws_webservicetype_id, gen_random_uuid()
FROM ws_webservicetype t JOIN ws_webservicemethod m USING (ws_webservicemethod_id)
WHERE m.value IN ('queryData', 'readData', 'getList') AND t.ws_webservicetype_id IN (200005, 200003)
  AND NOT EXISTS (SELECT 1 FROM ws_webservicetypeaccess a WHERE a.ws_webservicetype_id = t.ws_webservicetype_id AND a.ad_role_id = 102);
