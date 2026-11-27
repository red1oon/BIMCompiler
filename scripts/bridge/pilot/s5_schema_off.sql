-- PILOT-ONLY: restore after S5 (spec §43) — the same statement ws_test_access.sql applies for every other witness. Idempotent.
SET search_path=adempiere;
UPDATE c_acctschema SET isactive='N' WHERE c_acctschema_id=1009800 AND name='CP Copy Target';
