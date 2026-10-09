-- PILOT-ONLY test fixture: let role 102 (GardenWorld Admin) use the stock order WS types so witnesses can generate
-- real change-log traffic as a legitimate WS client. Idempotent. Restart server / reset cache after applying.
SET search_path=adempiere;
INSERT INTO ws_webservicetypeaccess(ad_client_id,ad_org_id,ad_role_id,created,createdby,updated,updatedby,isactive,isreadwrite,ws_webservicetype_id,ws_webservicetypeaccess_uu)
SELECT 11,0,102,now(),100,now(),100,'Y','Y',t.ws_webservicetype_id,gen_random_uuid()
FROM ws_webservicetype t WHERE t.value IN ('createOrderRecord','CreateOrderLine','CompleteOrder')
AND NOT EXISTS (SELECT 1 FROM ws_webservicetypeaccess a WHERE a.ws_webservicetype_id=t.ws_webservicetype_id AND a.ad_role_id=102);

-- Pilot copy carries a leftover accounting schema 'CP Copy Target' (1009800) with no M_Product_Category_Acct rows;
-- CompleteOrder NPEs in costing (MProductCategoryAcct pca null) with it active. Deactivate for witnesses (reversible; a
-- clean importiDempiere restores the seed).
UPDATE c_acctschema SET isactive='N' WHERE c_acctschema_id=1009800 AND name='CP Copy Target';
