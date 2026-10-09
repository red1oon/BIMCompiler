-- PILOT-ONLY (idempiere_pilot, local copy). Registers read-only WS types the SQLite Bridge needs to track
-- AD_ChangeLog via ADInterface queryData. Spec: prompts/SQLiteIDEMPIERE.md §4/§12. Idempotent.
-- Role: GardenWorld Admin (102), read-only. This file IS the proposal text for the legacy admin. Restart/cache-reset after apply.
--   QueryChangeLog : AD_ChangeLog (all columns)       QueryADColumn : AD_Column (id, name, table)
--   QueryADTable   : AD_Table (id, name)
--   QueryCOrder / QueryCOrderLine : read-back of pushed documents (M1 verify)
--   QueryCDocType / QueryCTax / QueryMPriceList : dictionary rows for dict_diff (SQLite seed vs legacy)
--   QueryCInvoice(+Line) / QueryMInOut(+Line) / QueryStorage / QueryFactAcct : read-only comparison inputs for the parallel-run reconcile (M3)
--   Query{MProduct,CAcctSchema,CPeriod,CPeriodControl,CYear,ADSysConfig,CConversionRate,COrderTax,CInvoiceTax,CBPartner,CTaxCategory} : dict_diff + S8/tax/Euro scenarios
--   Query{ADWindow,ADTab,ADField,ADColumnAll,ADMenu,ADMessage,ADRefList,ADValRule,ADProcess,ADProcessPara} : look-and-feel parity (AD metadata dict_diff)
SET search_path=adempiere;
DO $$
DECLARE d record; tid int; t int; c record;
BEGIN
  FOR d IN SELECT * FROM (VALUES
      ('QueryChangeLog','AD_ChangeLog',NULL::text[]),
      ('QueryADColumn','AD_Column',ARRAY['AD_Column_ID','ColumnName','AD_Table_ID']),
      ('QueryADTable','AD_Table',ARRAY['AD_Table_ID','TableName']),
      ('QueryCOrder','C_Order',NULL::text[]),
      ('QueryCOrderLine','C_OrderLine',NULL::text[]),
      ('QueryCInvoice','C_Invoice',NULL::text[]),
      ('QueryCInvoiceLine','C_InvoiceLine',NULL::text[]),
      ('QueryMInOut','M_InOut',NULL::text[]),
      ('QueryMInOutLine','M_InOutLine',NULL::text[]),
      ('QueryStorage','M_Storage',NULL::text[]),
      ('QueryFactAcct','Fact_Acct',NULL::text[]),
      ('QueryCDocType','C_DocType',NULL::text[]),
      ('QueryCTax','C_Tax',NULL::text[]),
      ('QueryMPriceList','M_PriceList',NULL::text[]),
      ('QueryMProdCatAcct','M_Product_Category_Acct',NULL::text[]),
      ('QueryMCostElement','M_CostElement',NULL::text[]),
      ('QueryMCost','M_Cost',NULL::text[]),
      -- 2026-10-09 (spec §37): dict_diff composite keys/ALTER generator, S8 periods, tax, Euro schema, S13 credit, L&F parity (AD metadata)
      ('QueryMProduct','M_Product',NULL::text[]),
      ('QueryCAcctSchema','C_AcctSchema',NULL::text[]),
      ('QueryCPeriod','C_Period',NULL::text[]),
      ('QueryCPeriodControl','C_PeriodControl',NULL::text[]),
      ('QueryCYear','C_Year',NULL::text[]),
      ('QueryADSysConfig','AD_SysConfig',NULL::text[]),
      ('QueryCConversionRate','C_Conversion_Rate',NULL::text[]),
      ('QueryCOrderTax','C_OrderTax',NULL::text[]),
      ('QueryCInvoiceTax','C_InvoiceTax',NULL::text[]),
      ('QueryCBPartner','C_BPartner',NULL::text[]),
      ('QueryCTaxCategory','C_TaxCategory',NULL::text[]),
      ('QueryADWindow','AD_Window',NULL::text[]),
      ('QueryADTab','AD_Tab',NULL::text[]),
      ('QueryADField','AD_Field',NULL::text[]),
      ('QueryADColumnAll','AD_Column',NULL::text[]),
      ('QueryADMenu','AD_Menu',NULL::text[]),
      ('QueryADMessage','AD_Message',NULL::text[]),
      ('QueryADRefList','AD_Ref_List',NULL::text[]),
      ('QueryADValRule','AD_Val_Rule',NULL::text[]),
      ('QueryADProcess','AD_Process',NULL::text[]),
      ('QueryADProcessPara','AD_Process_Para',NULL::text[]),
      ('QueryMMovement','M_Movement',NULL::text[]),
      ('QueryMMovementLine','M_MovementLine',NULL::text[]),
      -- §57 payment model + §58-§61 next models (read-only)
      ('QueryCPayment','C_Payment',NULL::text[]),
      ('QueryCAllocationHdr','C_AllocationHdr',NULL::text[]),
      ('QueryCAllocationLine','C_AllocationLine',NULL::text[]),
      ('QueryMInventory','M_Inventory',NULL::text[]),
      ('QueryMInventoryLine','M_InventoryLine',NULL::text[]),
      ('QueryAAsset','A_Asset',NULL::text[]),
      ('QueryAAssetAddition','A_Asset_Addition',NULL::text[]),
      ('QueryADepreciationEntry','A_Depreciation_Entry',NULL::text[]),
      ('QueryADepreciationExp','A_Depreciation_Exp',NULL::text[]),
      ('QueryADepreciationWorkfile','A_Depreciation_Workfile',NULL::text[]),
      ('QueryAAssetAcct','A_Asset_Acct',NULL::text[]),
      ('QueryAAssetGroupAcct','A_Asset_Group_Acct',NULL::text[]),
      ('QueryADepreciation','A_Depreciation',NULL::text[]),
      -- §63: the login role's approve-own-doc flag (an AD default of A_Depreciation_Entry.IsApproved)
      ('QueryADRole','AD_Role',ARRAY['AD_Role_ID','Name','IsCanApproveOwnDoc'])) AS v(val,tbl,cols) LOOP
    IF EXISTS (SELECT 1 FROM ws_webservicetype WHERE value=d.val) THEN CONTINUE; END IF;
    t := (SELECT ad_table_id FROM ad_table WHERE tablename=d.tbl);
    tid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceType')::int,'N'::varchar);
    INSERT INTO ws_webservicetype(ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,name,value,
        ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,ad_table_id,description)
    VALUES (11,0,now(),100,now(),100,'Y',d.val,d.val,50001,50028,tid,gen_random_uuid(),t,'Bridge: read '||d.tbl);
    INSERT INTO ws_webservicetypeaccess(ad_client_id,ad_org_id,ad_role_id,created,createdby,updated,updatedby,isactive,isreadwrite,ws_webservicetype_id,ws_webservicetypeaccess_uu)
    VALUES (11,0,102,now(),100,now(),100,'Y','N',tid,gen_random_uuid());
    INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
    SELECT 11,0,v.cv,now(),100,'Y',v.pn,v.pt,now(),100,
           nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid()
    FROM (VALUES ('TableName','C',d.tbl),('Action','C','Read'),('RecordID','F',NULL),('Filter','F',NULL)) AS v(pn,pt,cv);
    FOR c IN SELECT ad_column_id FROM ad_column WHERE ad_table_id=t AND isactive='Y'
             AND columnsql IS NULL      -- virtual (SQL) columns are not in the table: WS query fails on them (found by M3: 'DocBaseType not found in ResultSet')
             AND (d.cols IS NULL OR columnname = ANY(d.cols)) LOOP
      INSERT INTO ws_webservicefieldoutput(ad_client_id,ad_column_id,ad_org_id,created,createdby,isactive,updated,updatedby,ws_webservicefieldoutput_id,ws_webservicetype_id,ws_webservicefieldoutput_uu)
      VALUES (11,c.ad_column_id,0,now(),100,'Y',now(),100,
        nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldOutput')::int,'N'::varchar),tid,gen_random_uuid());
    END LOOP;
  END LOOP;
END $$;
