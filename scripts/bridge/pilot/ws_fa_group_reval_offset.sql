-- PILOT-ONLY, NOT YET APPLIED. Spec §D8: lets the existing type BridgeUpdateAssetGroupAcct also write A_Reval_Cost_Offset_Acct (WebService configuration only, D6 —
-- one more whitelisted input column on a type that already exists). This file IS the admin proposal text. Idempotent. Restart the server after applying.
-- The value itself is then set/restored through the WS by scripts/bridge/pilot/fa_group_reval_offset.js (set|restore|show) — never direct SQL.
SET search_path=adempiere;
DO $$
DECLARE tid int; t int; c int;
BEGIN
  tid := (SELECT ws_webservicetype_id FROM ws_webservicetype WHERE value='BridgeUpdateAssetGroupAcct');
  t := (SELECT ad_table_id FROM ad_table WHERE tablename='A_Asset_Group_Acct');
  c := (SELECT ad_column_id FROM ad_column WHERE ad_table_id=t AND columnname='A_Reval_Cost_Offset_Acct');
  IF tid IS NULL OR c IS NULL THEN RAISE EXCEPTION 'type or column missing'; END IF;
  IF EXISTS (SELECT 1 FROM ws_webservicefieldinput WHERE ws_webservicetype_id=tid AND ad_column_id=c) THEN RETURN; END IF;
  INSERT INTO ws_webservicefieldinput(ad_client_id,ad_column_id,ad_org_id,created,createdby,isactive,updated,updatedby,ws_webservicefieldinput_id,ws_webservicetype_id,ws_webservicefieldinput_uu)
  VALUES (11,c,0,now(),100,'Y',now(),100,nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldInput')::int,'N'::varchar),tid,gen_random_uuid());
END $$;
