-- dict_diff patch for c_acctschema (generated from legacy values; review before applying; never deletes)
INSERT INTO c_acctschema(c_acctschema_id,c_currency_id,taxcorrectiontype,ispostifclearingequal,costingmethod,m_costtype_id,commitmenttype) SELECT 1009800,100,'B','Y','A',100,'N' WHERE NOT EXISTS (SELECT 1 FROM c_acctschema WHERE c_acctschema_id=1009800);
