\timing on
SELECT ad_window_id FROM adempiere.ad_window WHERE name='Sales Order' AND ad_client_id=0 LIMIT 1;
SELECT ad_tab_id FROM adempiere.ad_tab WHERE ad_window_id=(SELECT ad_window_id FROM adempiere.ad_window WHERE name='Sales Order' AND ad_client_id=0 LIMIT 1) ORDER BY seqno;
SELECT count(*) FROM adempiere.ad_field WHERE ad_tab_id=186;
SELECT * FROM adempiere.c_order WHERE c_order_id=(SELECT c_order_id FROM adempiere.c_orderline OFFSET 3000000 LIMIT 1);
SELECT count(*) FROM (SELECT * FROM adempiere.c_orderline WHERE c_order_id=(SELECT c_order_id FROM adempiere.c_orderline OFFSET 3000000 LIMIT 1)) x;
SELECT * FROM adempiere.fact_acct WHERE fact_acct_id=(SELECT fact_acct_id FROM adempiere.fact_acct OFFSET 5000000 LIMIT 1);
