-- §SHOPDAY-RUN-1 (admin lane, D6 config row; idempotent): allow M_PriceList_ID as an input column of the stock Bridge order type BridgeCreateOrder (whitelist row only).
-- Why: on a fresh client the first sales order without an explicit price list dies in legacy with "MPriceList pl is null" (MOrder.setM_PriceList_ID, G-SD6); the shop-day
-- driver then sends the list explicitly. Restart after apply.
SET search_path=adempiere;
INSERT INTO ws_webservicefieldinput(ad_client_id,ad_org_id,ad_column_id,ws_webservicetype_id,ad_reference_id,ws_webservicefieldinput_id,ws_webservicefieldinput_uu,createdby,updatedby)
SELECT 0,0,c.ad_column_id,t.ws_webservicetype_id,c.ad_reference_id,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldInput')::int,'N'::varchar),gen_random_uuid(),100,100
FROM ws_webservicetype t, ad_column c JOIN ad_table tb ON tb.ad_table_id=c.ad_table_id
WHERE t.value='BridgeCreateOrder' AND tb.tablename='C_Order' AND c.columnname='M_PriceList_ID'
  AND NOT EXISTS (SELECT 1 FROM ws_webservicefieldinput f WHERE f.ws_webservicetype_id=t.ws_webservicetype_id AND f.ad_column_id=c.ad_column_id);
SELECT count(*) AS orderpl_rows FROM ws_webservicefieldinput f JOIN ws_webservicetype t USING(ws_webservicetype_id) JOIN ad_column c USING(ad_column_id) WHERE t.value='BridgeCreateOrder' AND c.columnname='M_PriceList_ID';
