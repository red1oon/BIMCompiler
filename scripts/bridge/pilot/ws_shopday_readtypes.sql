-- §SHOPDAY-RUN-1 (admin lane, D6 config rows; idempotent). Read-only WS types the fresh-client comparison needs that did not exist
-- (ad_client, ad_org, warehouse, locator, BP location, sequences, price list version/prices, acct defaults, ...). Owned by SYSTEM (client 0), so
-- any client's role can be granted them (ws_shopday_grant.sql). Same shape as ws_changelog_read.sql (Read, all non-virtual columns). Restart after apply.
SET search_path=adempiere;
DO $$
DECLARE d record; tid int; t int; c record;
BEGIN
  FOR d IN SELECT * FROM (VALUES
      ('QueryADClient','AD_Client'),
      ('QueryADOrg','AD_Org'),
      ('QueryADOrgInfo','AD_OrgInfo'),
      ('QueryMWarehouse','M_Warehouse'),
      ('QueryMLocator','M_Locator'),
      ('QueryCBPartnerLocation','C_BPartner_Location'),
      ('QueryCLocation','C_Location'),
      ('QueryGLCategory','GL_Category'),
      ('QueryADSequence','AD_Sequence'),
      ('QueryMPriceListVersion','M_PriceList_Version'),
      ('QueryMProductPrice','M_ProductPrice'),
      ('QueryCPaymentTerm','C_PaymentTerm'),
      ('QueryCBPGroup','C_BP_Group'),
      ('QueryMProductCategory','M_Product_Category'),
      ('QueryCAcctSchemaDefault','C_AcctSchema_Default'),
      ('QueryCAcctSchemaGL','C_AcctSchema_GL'),
      ('QueryCAcctSchemaElement','C_AcctSchema_Element'),
      ('QueryCBank','C_Bank'),
      ('QueryCCalendar','C_Calendar'),
      ('QueryCElement','C_Element'),
      ('QueryADUserRoles','AD_User_Roles'),
      ('QueryADRoleOrgAccess','AD_Role_OrgAccess'),
      ('QueryCValidCombination','C_ValidCombination'),
      ('QueryCTaxAcct','C_Tax_Acct'),
      ('QueryCBPCustomerAcct','C_BP_Customer_Acct'),
      ('QueryCBPVendorAcct','C_BP_Vendor_Acct'),
      ('QueryMDiscountSchema','M_DiscountSchema'),
      ('QueryMProductAcct','M_Product_Acct'),
      ('QueryMWarehouseAcct','M_Warehouse_Acct'),
      ('QueryCBankAccountAcct','C_BankAccount_Acct')) AS v(val,tbl) LOOP
    IF EXISTS (SELECT 1 FROM ws_webservicetype WHERE value=d.val) THEN CONTINUE; END IF;
    t := (SELECT ad_table_id FROM ad_table WHERE tablename=d.tbl);
    IF t IS NULL THEN RAISE NOTICE 'skip % (no AD_Table)', d.val; CONTINUE; END IF;
    tid := nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceType')::int,'N'::varchar);
    INSERT INTO ws_webservicetype(ad_client_id,ad_org_id,created,createdby,updated,updatedby,isactive,name,value,
        ws_webservice_id,ws_webservicemethod_id,ws_webservicetype_id,ws_webservicetype_uu,ad_table_id,description)
    VALUES (0,0,now(),100,now(),100,'Y',d.val,d.val,50001,50028,tid,gen_random_uuid(),t,'Bridge: read '||d.tbl);
    INSERT INTO ws_webservicetypeaccess(ad_client_id,ad_org_id,ad_role_id,created,createdby,updated,updatedby,isactive,isreadwrite,ws_webservicetype_id,ws_webservicetypeaccess_uu)
    VALUES (11,0,102,now(),100,now(),100,'Y','N',tid,gen_random_uuid());
    INSERT INTO ws_webservice_para(ad_client_id,ad_org_id,constantvalue,created,createdby,isactive,parametername,parametertype,updated,updatedby,ws_webservice_para_id,ws_webservicetype_id,ws_webservice_para_uu)
    SELECT 0,0,v.cv,now(),100,'Y',v.pn,v.pt,now(),100,
           nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebService_Para')::int,'N'::varchar),tid,gen_random_uuid()
    FROM (VALUES ('TableName','C',d.tbl),('Action','C','Read'),('RecordID','F',NULL),('Filter','F',NULL)) AS v(pn,pt,cv);
    FOR c IN SELECT ad_column_id FROM ad_column WHERE ad_table_id=t AND isactive='Y' AND columnsql IS NULL LOOP
      INSERT INTO ws_webservicefieldoutput(ad_client_id,ad_column_id,ad_org_id,created,createdby,isactive,updated,updatedby,ws_webservicefieldoutput_id,ws_webservicetype_id,ws_webservicefieldoutput_uu)
      VALUES (0,c.ad_column_id,0,now(),100,'Y',now(),100,
        nextidfunc((SELECT ad_sequence_id FROM ad_sequence WHERE name='WS_WebServiceFieldOutput')::int,'N'::varchar),tid,gen_random_uuid());
    END LOOP;
  END LOOP;
END $$;
SELECT count(*) AS shopday_read_types FROM ws_webservicetype WHERE description LIKE 'Bridge: read %' AND ad_client_id=0;
