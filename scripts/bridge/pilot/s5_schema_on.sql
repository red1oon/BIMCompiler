-- PILOT-ONLY one-shot fixture for scenario S5 (spec §43): re-activate the leftover accounting schema 'CP Copy Target' (1009800, no product-category
-- accounting rows) so the legacy behaviour can be measured. ALWAYS followed by s5_schema_off.sql (the S5 witness runs it in `finally`) + a server restart.
SET search_path=adempiere;
UPDATE c_acctschema SET isactive='Y' WHERE c_acctschema_id=1009800 AND name='CP Copy Target';
