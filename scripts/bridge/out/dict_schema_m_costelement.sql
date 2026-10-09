-- dict_diff SCHEMA patch for m_costelement (spec §37; generated from legacy values; ALTERs are guarded by dict_diff.applyPatch; never deletes/drops)
ALTER TABLE m_costelement ADD COLUMN name;
UPDATE m_costelement SET name='Freight' WHERE m_costelement_id=101;
UPDATE m_costelement SET name='Fifo' WHERE m_costelement_id=102;
UPDATE m_costelement SET name='Average PO' WHERE m_costelement_id=103;
UPDATE m_costelement SET name='Burden' WHERE m_costelement_id=50000;
UPDATE m_costelement SET name='Labor' WHERE m_costelement_id=105;
UPDATE m_costelement SET name='Overhead' WHERE m_costelement_id=50001;
UPDATE m_costelement SET name='Outside Processing' WHERE m_costelement_id=50002;
UPDATE m_costelement SET name='Material' WHERE m_costelement_id=100;
UPDATE m_costelement SET name='Average Invoice' WHERE m_costelement_id=104;
