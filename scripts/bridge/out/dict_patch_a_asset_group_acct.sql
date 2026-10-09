-- dict_diff patch for a_asset_group_acct (generated from legacy values; review before applying; never deletes)
UPDATE a_asset_group_acct SET uselifeyears='5.000000000000' WHERE a_asset_group_acct_id=200002;
UPDATE a_asset_group_acct SET uselifemonths=60 WHERE a_asset_group_acct_id=200002;
UPDATE a_asset_group_acct SET uselifeyears='5.000000000000' WHERE a_asset_group_acct_id=200005;
UPDATE a_asset_group_acct SET uselifemonths=60 WHERE a_asset_group_acct_id=200005;
UPDATE a_asset_group_acct SET uselifeyears_f='5.000000000000' WHERE a_asset_group_acct_id=200005;
UPDATE a_asset_group_acct SET uselifemonths_f=60 WHERE a_asset_group_acct_id=200005;
