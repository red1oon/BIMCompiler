-- §SITE_TASK (bim-compiler prompts/MOBILE_PERF.md WO-25, step 1; idempotent): the Request Type "Site Task" and its Status Category with five statuses, as ordinary rows on the legacy pilot.
-- NO dictionary or schema change; nothing on any other server. The SAME rows with the SAME UUs as bim-ootb erp/patches/site_task.sql (the Kernel); ids 990001.. = the high band the Kernel keeps for its own rows
--   (legacy's own sequences for these tables start at 1000000, so a row created later never meets them).
-- Statuses in SeqNo order: New (default, open) -> Prepared (open) -> On site (open) -> Reported (open) -> Verified (closed, final close). Next_Status_ID follows that order.
--   LEGACY NOTE: MStatus.beforeSave (MStatus.java:268-282) clears Next_Status_ID on a save when TimeoutDays = 0, and RequestProcessor.java:431-437 moves a request on only when TimeoutDays > 0 AND Next_Status_ID > 0:
--   these rows set no timeout, so nothing moves by itself; written here with psql (no beforeSave), a later edit in the legacy window would clear the Next links, the SeqNo order stays.
-- Apply: docker exec -i postgres psql -U postgres -d idempiere_pilot -v ON_ERROR_STOP=1 < site_task_status.sql      (re-runnable)
SET search_path=adempiere;
BEGIN;
INSERT INTO r_statuscategory (r_statuscategory_id, ad_client_id, ad_org_id, isactive, created, createdby, updated, updatedby, name, description, help, isdefault, r_statuscategory_uu)
 SELECT 990001, 11, 0, 'Y', now(), 100, now(), 100, 'Site Task', 'Status of a task done on site (BIM mission)', NULL, 'N', 'bdf15a57-436f-44d1-89f6-3925563cf296'
 WHERE NOT EXISTS (SELECT 1 FROM r_statuscategory WHERE r_statuscategory_id=990001 OR r_statuscategory_uu='bdf15a57-436f-44d1-89f6-3925563cf296');
INSERT INTO r_status (r_status_id, ad_client_id, ad_org_id, isactive, created, createdby, updated, updatedby, name, description, help, isdefault, isopen, isclosed, value, next_status_id, update_status_id, timeoutdays, iswebcanupdate, isfinalclose, seqno, r_statuscategory_id, r_status_uu)
 SELECT v.* FROM (VALUES
  (990001::numeric, 11::numeric, 0::numeric, 'Y'::bpchar, now()::timestamp, 100::numeric, now()::timestamp, 100::numeric, 'New'::varchar, 'Issued from the Project Order, not yet prepared'::varchar, NULL::varchar, 'Y'::bpchar, 'Y'::bpchar, 'N'::bpchar, 'New'::varchar, 990002::numeric, NULL::numeric, NULL::numeric, 'Y'::bpchar, 'N'::bpchar, 10::numeric, 990001::numeric, 'f42d4f70-60e7-42ea-b353-81a290de9552'::uuid),
  (990002, 11, 0, 'Y', now(), 100, now(), 100, 'Prepared', 'In a mission file made at the desktop', NULL, 'N', 'Y', 'N', 'Prepared', 990003, NULL, NULL, 'Y', 'N', 20, 990001, '8c0b1bc3-1cba-4f37-8dd4-ae3d626da1da'),
  (990003, 11, 0, 'Y', now(), 100, now(), 100, 'On site', 'The person on site has started it', NULL, 'N', 'Y', 'N', 'On site', 990004, NULL, NULL, 'Y', 'N', 30, 990001, '6419e9a6-5088-4052-91a6-1f01ec1f8fce'),
  (990004, 11, 0, 'Y', now(), 100, now(), 100, 'Reported', 'The site report reached the office', NULL, 'N', 'Y', 'N', 'Reported', 990005, NULL, NULL, 'Y', 'N', 40, 990001, 'b969cfa5-c2b1-41cb-af6b-fe860afa02b6'),
  (990005, 11, 0, 'Y', now(), 100, now(), 100, 'Verified', 'The office checked the report', NULL, 'N', 'N', 'Y', 'Verified', NULL, NULL, NULL, 'Y', 'Y', 50, 990001, '7019139b-3407-4efd-a42a-a5e012eb0c54')
 ) AS v(r_status_id, ad_client_id, ad_org_id, isactive, created, createdby, updated, updatedby, name, description, help, isdefault, isopen, isclosed, value, next_status_id, update_status_id, timeoutdays, iswebcanupdate, isfinalclose, seqno, r_statuscategory_id, r_status_uu)
 WHERE NOT EXISTS (SELECT 1 FROM r_status s WHERE s.r_status_id=v.r_status_id OR s.r_status_uu=v.r_status_uu);
INSERT INTO r_requesttype (r_requesttype_id, ad_client_id, ad_org_id, isactive, created, createdby, updated, updatedby, name, description, isdefault, isselfservice, duedatetolerance, isemailwhenoverdue, isemailwhendue, isinvoiced, autoduedatedays, confidentialtype, isautochangerequest, isconfidentialinfo, r_statuscategory_id, isindexed, r_requesttype_uu)
 SELECT 990001, 11, 0, 'Y', now(), 100, now(), 100, 'Site Task', 'A task done on site on one element of the model (BIM mission)', 'N', 'N', 7, 'N', 'N', 'N', NULL, 'C', 'N', 'N', 990001, 'Y', 'be7c0c0c-4b1e-4fbb-ac29-3ad08c1d13a9'
 WHERE NOT EXISTS (SELECT 1 FROM r_requesttype WHERE r_requesttype_id=990001 OR r_requesttype_uu='be7c0c0c-4b1e-4fbb-ac29-3ad08c1d13a9');
COMMIT;
SELECT r_status_id, name, isdefault, isopen, isclosed, isfinalclose, seqno, next_status_id, r_status_uu FROM r_status WHERE r_statuscategory_id=990001 ORDER BY seqno;
SELECT r_requesttype_id, name, r_statuscategory_id, r_requesttype_uu FROM r_requesttype WHERE r_requesttype_id=990001;
