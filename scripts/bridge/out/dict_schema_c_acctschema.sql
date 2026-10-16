-- dict_diff SCHEMA patch for c_acctschema (spec §37; generated from legacy values; ALTERs are guarded by dict_diff.applyPatch; never deletes/drops)
ALTER TABLE c_acctschema ADD COLUMN isactive;
ALTER TABLE c_acctschema ADD COLUMN name;
ALTER TABLE c_acctschema ADD COLUMN costinglevel;
ALTER TABLE c_acctschema ADD COLUMN isallownegativeposting;
ALTER TABLE c_acctschema ADD COLUMN autoperiodcontrol;
ALTER TABLE c_acctschema ADD COLUMN period_openhistory;
ALTER TABLE c_acctschema ADD COLUMN period_openfuture;
ALTER TABLE c_acctschema ADD COLUMN backdateday;
UPDATE c_acctschema SET isactive='Y', name='Second Schema GardenWorld Euro', costinglevel='C', isallownegativeposting='Y', autoperiodcontrol='Y', period_openhistory=10000, period_openfuture=100, backdateday=NULL WHERE c_acctschema_id=200000;
UPDATE c_acctschema SET isactive='Y', name='GardenWorld US/A/US Dollar', costinglevel='C', isallownegativeposting='Y', autoperiodcontrol='Y', period_openhistory=10000, period_openfuture=100, backdateday=NULL WHERE c_acctschema_id=101;
INSERT INTO c_acctschema(c_acctschema_id,c_currency_id,taxcorrectiontype,ispostifclearingequal,costingmethod,m_costtype_id,commitmenttype,isactive,name,costinglevel,isallownegativeposting,autoperiodcontrol,period_openhistory,period_openfuture,backdateday) SELECT 1009800,100,'B','Y','A',100,'N','N','CP Copy Target','C','Y','Y',10000,100,NULL WHERE NOT EXISTS (SELECT 1 FROM c_acctschema WHERE c_acctschema_id=1009800);
