-- dict_diff SCHEMA patch for m_costelement (spec §37; generated from legacy values; ALTERs are guarded by dict_diff.applyPatch; never deletes/drops)
ALTER TABLE m_costelement ADD COLUMN name;
ALTER TABLE m_costelement ADD COLUMN isactive;
UPDATE m_costelement SET name='Freight', isactive='Y' WHERE m_costelement_id=101;
UPDATE m_costelement SET name='Fifo', isactive='Y' WHERE m_costelement_id=102;
UPDATE m_costelement SET name='Average PO', isactive='Y' WHERE m_costelement_id=103;
UPDATE m_costelement SET name='Burden', isactive='Y' WHERE m_costelement_id=50000;
UPDATE m_costelement SET name='Labor', isactive='Y' WHERE m_costelement_id=105;
UPDATE m_costelement SET name='Overhead', isactive='Y' WHERE m_costelement_id=50001;
UPDATE m_costelement SET name='Outside Processing', isactive='Y' WHERE m_costelement_id=50002;
UPDATE m_costelement SET name='Material', isactive='Y' WHERE m_costelement_id=100;
UPDATE m_costelement SET name='Average Invoice', isactive='N' WHERE m_costelement_id=104;
