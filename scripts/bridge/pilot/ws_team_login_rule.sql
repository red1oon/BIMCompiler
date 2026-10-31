-- TEAMWORK §48.11c piece 6 / §48.11d: legacy sets #AD_User_Value at login through its own Login-event rule (ModelValidationEngine.loginComplete :263-300), so the
-- twin's loginContext (#AD_User_Value = AD_User.Value) has the same variable on the legacy side. Data only, no Java.
BEGIN;
INSERT INTO adempiere.ad_rule (ad_client_id, ad_org_id, ad_rule_id, accesslevel, created, createdby, description, entitytype, eventtype, isactive, name, ruletype, script, updated, updatedby, value, ad_rule_uu)
SELECT 0, 0, s.currentnext, '4', now(), 100, 'LOCAL NUMBERING station key: #AD_User_Value = AD_User.Value of the login user (TEAMWORK §48.11c)', 'U', 'L', 'Y',
       'Team station user value', 'S',
       'import org.compiere.util.Env' || chr(10) || 'import org.compiere.model.MUser' || chr(10) ||
       'def u = MUser.get(A_Ctx, A_AD_User_ID)' || chr(10) ||
       'Env.setContext(A_Ctx, "#AD_User_Value", (u == null || u.getValue() == null) ? "" : u.getValue())' || chr(10) || 'return ""',
       now(), 100, 'groovy:TeamStationUserValue', gen_random_uuid()
FROM adempiere.ad_sequence s WHERE s.name='AD_Rule' AND s.istableid='Y'
  AND NOT EXISTS (SELECT 1 FROM adempiere.ad_rule WHERE value='groovy:TeamStationUserValue');
UPDATE adempiere.ad_sequence SET currentnext=currentnext+1 WHERE name='AD_Rule' AND istableid='Y' AND EXISTS (SELECT 1 FROM adempiere.ad_rule WHERE value='groovy:TeamStationUserValue' AND ad_rule_id=currentnext);
COMMIT;
SELECT ad_rule_id, value, eventtype, ruletype FROM adempiere.ad_rule WHERE value='groovy:TeamStationUserValue';
