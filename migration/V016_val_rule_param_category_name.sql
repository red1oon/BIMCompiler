-- V016: restore the category filter on AD_Val_Rule_Param (library/validation.db).
-- Implementing prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md §6.1 — Witness: W-ORDER-REJECT-COVERAGE V1_legal_kitchen.
-- V002 seeded name='bom_category'. PlacementValidatorImpl reads 'm_product_category_id' since the S68 rename.
-- DV017 renamed ad_val_rule_param.param_name in ERP.db, a different table, so this one never changed and every
-- rule loaded as a wildcard: a legal kitchen was blocked by UBBL_BEDROOM_MIN_AREA.
-- Idempotent.

UPDATE AD_Val_Rule_Param
   SET name = 'm_product_category_id'
 WHERE name = 'bom_category';
