-- BIMDOC-DOCTYPES (bim-compiler prompts/ERP_IDEMPIERE_UX_PARITY.md FB6, ruled 2026-11-10): four C_DocType rows under DocBaseType BIM — Drawing, Model, Specification, Report — each with its own number sequence.
-- Client 11 (GardenWorld, the test/demo client; a born tenant gets its own through the same four INSERTs with its client id). Ids sit in the plugin's band (9541600+). Applied by scripts/legacy_bimdoc_refresh.sh after the pack is in.
-- NOT decided here (FB6 left it open): what becomes of a pre-existing single "BIM Document" type; this script never touches an existing row. Restore: DELETE FROM C_DocType WHERE C_DocType_ID BETWEEN 9541611 AND 9541614; DELETE FROM AD_Sequence WHERE AD_Sequence_ID BETWEEN 9541601 AND 9541604;
SELECT register_migration_script('202611121100_BIMDOC-DOCTYPES.sql') FROM dual;

INSERT INTO AD_Sequence (AD_Sequence_ID,AD_Client_ID,AD_Org_ID,IsActive,Created,CreatedBy,Updated,UpdatedBy,Name,Description,IsAutoSequence,IncrementNo,StartNo,CurrentNext,CurrentNextSys,IsAudited,IsTableID,Prefix,StartNewYear,AD_Sequence_UU)
SELECT v.id,11,0,'Y',NOW(),100,NOW(),100,v.nm,'BIM Document numbers: '||v.nm,'Y',1,1000,1000,10000000,'N','N',v.pfx,'N',v.uu::uuid
FROM (VALUES (9541601,'BIM Drawing','DWG-','5a0c3e1e-0b7d-4c1e-9f3a-b1d000000001'),(9541602,'BIM Model','MDL-','5a0c3e1e-0b7d-4c1e-9f3a-b1d000000002'),(9541603,'BIM Specification','SPC-','5a0c3e1e-0b7d-4c1e-9f3a-b1d000000003'),(9541604,'BIM Report','RPT-','5a0c3e1e-0b7d-4c1e-9f3a-b1d000000004')) AS v(id,nm,pfx,uu)
WHERE NOT EXISTS (SELECT 1 FROM AD_Sequence s WHERE s.AD_Sequence_ID=v.id);

INSERT INTO C_DocType (C_DocType_ID,AD_Client_ID,AD_Org_ID,IsActive,Created,CreatedBy,Updated,UpdatedBy,Name,PrintName,DocBaseType,IsSOTrx,IsDefault,DocNoSequence_ID,IsDocNoControlled,GL_Category_ID,DocumentCopies,IsCreateCounter,IsDefaultCounterDoc,IsIndexed,DocSubTypeSO,C_DocType_UU)
SELECT v.id,11,0,'Y',NOW(),100,NOW(),100,v.nm,v.nm,'BIM','N','N',v.seq,'Y',(SELECT MIN(GL_Category_ID) FROM GL_Category WHERE AD_Client_ID=11),1,'N','N','N',NULL,v.uu::uuid
FROM (VALUES (9541611,'BIM Drawing',9541601,'5a0c3e1e-0b7d-4c1e-9f3a-b1d000000011'),(9541612,'BIM Model',9541602,'5a0c3e1e-0b7d-4c1e-9f3a-b1d000000012'),(9541613,'BIM Specification',9541603,'5a0c3e1e-0b7d-4c1e-9f3a-b1d000000013'),(9541614,'BIM Report',9541604,'5a0c3e1e-0b7d-4c1e-9f3a-b1d000000014')) AS v(id,nm,seq,uu)
WHERE NOT EXISTS (SELECT 1 FROM C_DocType d WHERE d.C_DocType_ID=v.id);
