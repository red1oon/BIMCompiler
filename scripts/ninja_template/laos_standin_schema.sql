-- STAND-IN Laos custom tables for the local clone idempiere_laos ONLY. Real definitions unknown: columns = exactly those the
-- MOES_sofp/MOES_cashflow Process-sheet SQL references (witness/W13.log, W14). No invented values: gl_journal* are EMPTY;
-- ad_orgposition name columns are copied from real ad_org rows, position columns left NULL.
SET search_path=adempiere;
CREATE TABLE IF NOT EXISTS ad_orgposition (ad_orgposition_id numeric(10) PRIMARY KEY, ad_org_id numeric(10), name varchar(120), name2 varchar(120), name3 varchar(120), name4 varchar(120), name5 varchar(120),
  orgname1 varchar(120), orgname2 varchar(120), orgname3 varchar(120), position1 varchar(120), position2 varchar(120), position3 varchar(120), position4 varchar(120), position5 varchar(120), orglocation varchar(120));
INSERT INTO ad_orgposition (ad_orgposition_id,ad_org_id,name,orgname1,orgname2,orgname3)
 SELECT ad_org_id, ad_org_id, name, name, name, name FROM ad_org WHERE ad_client_id=11 ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS gl_journalref (gl_journalref_id numeric(10) PRIMARY KEY, gl_journal_id numeric(10), amount numeric, ref_no varchar(60));
CREATE TABLE IF NOT EXISTS gl_journalpay (gl_journalpay_id numeric(10) PRIMARY KEY, gl_journal_id numeric(10), gl_journalref_id numeric(10), amount numeric, ref_no varchar(60), datetreasury timestamp);
CREATE TABLE IF NOT EXISTS gl_journalpay_pd (gl_journalpay_pd_id numeric(10) PRIMARY KEY, gl_journal_id numeric(10), gl_journalref_id numeric(10), amount numeric, ref_no varchar(60), datetreasury timestamp);
CREATE TABLE IF NOT EXISTS gl_journalpay_r (gl_journalpay_r_id numeric(10) PRIMARY KEY, gl_journal_id numeric(10), gl_journalref_id numeric(10), amount numeric, ref_no varchar(60), datetreasury timestamp);
