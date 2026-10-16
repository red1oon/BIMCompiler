-- dict_diff SCHEMA patch for c_cashbook_acct (spec §37; generated from legacy values; ALTERs are guarded by dict_diff.applyPatch; never deletes/drops)
ALTER TABLE c_cashbook_acct ADD COLUMN cb_expense_acct;
ALTER TABLE c_cashbook_acct ADD COLUMN cb_differences_acct;
UPDATE c_cashbook_acct SET cb_expense_acct=275, cb_differences_acct=274 WHERE c_cashbook_id=101 AND c_acctschema_id=101;
UPDATE c_cashbook_acct SET cb_expense_acct=294, cb_differences_acct=295 WHERE c_cashbook_id=102 AND c_acctschema_id=101;
UPDATE c_cashbook_acct SET cb_expense_acct=NULL, cb_differences_acct=NULL WHERE c_cashbook_id=102 AND c_acctschema_id=200000;
UPDATE c_cashbook_acct SET cb_expense_acct=NULL, cb_differences_acct=NULL WHERE c_cashbook_id=101 AND c_acctschema_id=200000;
