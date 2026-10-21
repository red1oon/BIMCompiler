# ⚠ DO NOT REMOVE — scope: Product Attributes (M_AttributeSet / M_Attribute / M_AttributeValue) and their INSTANCES (M_AttributeSetInstance, M_AttributeInstance, Lot / Serial No / Guarantee Date, the *MA material-allocation tables) on the SQLite ERP twin, judged against legacy iDempiere. READ THE LOG after every run.
Started 2026-10-22 on the owner's word ("now ProductAttribute and its Instance handling ... build a new prompts/# dedicated to it").

## 1. Rules this lane lives under (no new ones invented)
- **TWIN CARDINAL RULE** (CLAUDE.md): the twin equals legacy, look & feel included; a difference is fixed on the twin side.
- **Legacy is never changed** (prompts/ERP_FRIENDLY_OPS_LENS.md §62): no legacy code, oracle bundle or pilot config change. Ordinary use of legacy (the existing oracle ops, the parallel run) is allowed. Where legacy cannot be run for a case, port from the source as designed, mark it NOTED-AS-DESIGNED, and judge the twin's quantities and books by accounting practice.
- **AD-LAYER LAW** (CLAUDE.md): one generic mechanism, X of N measured from the dictionary, no per-window code; deletion budget stated.
- **Legacy vocabulary only** - never an invented label (ERP_FRIENDLY_OPS_LENS.md §65.6 retraction).
- **Owner, 2026-10-22:** "need not triage it to death, just fairly coherent on the twin side with proper explanation" - explain consequences, don't open a lane per finding.

## 2. Where legacy keeps it (to be read, file:line, by the study)
Model: MAttributeSet, MAttribute, MAttributeValue, MAttributeSetInstance (incl. getDescription, setDescription, create, the Lot/SerNo controls MLotCtl/MSerNoCtl), MAttributeInstance, MAttributeSetExclude, MLot, MLotCtl, MSerNoCtl; the *LineMA tables (MInOutLineMA, MMovementLineMA, MInventoryLineMA, MProductionLineMA ...) and MStorageOnHand by ASI; material policy (FiFo/LiFo) checkMaterialPolicy in MInOut/MMovement/MInventory; mandatory-ASI rules (IDEMPIERE-1770 isASIMandatoryFor / M_AttributeSet.MandatoryType). UI: WPAttributeDialog / WPAttributeEditor (zkwebui), the PAttribute column type (AD_Reference 35), InfoPAttribute panel. Source: ~/idempiere-dev-setup/idempiere/.

## 3. Method
1. **Measure, X of N:** from ad_seed.db, every AD column of reference PAttribute (35) and every *MA table; for each: does the twin render the attribute editor, create/reuse an instance, carry it through the document, write storage by ASI, and post/cost by ASI the way legacy does. N from the dictionary.
2. **Oracle:** pilot GardenWorld (client 11) - 3 attribute sets, 519 instances, 4 products with an attribute set, 0 M_Lot rows (read 2026-10-22). Use existing `makedoc`/`postdoc` ops; no pilot config change (a case needing a new attribute set = NOTED-AS-DESIGNED, twin-only).
3. **Gap list** below (`AS-n`, each: what legacy does with file:line, what the twin does, consequence in plain words), then close them top to bottom, each with a witness RED -> GREEN and a break.
4. **Known named refusals already in the twin** (start here): model_movement.js "mandatory-ASI validation (IDEMPIERE-1770)"; Doc_Movement / Doc_InOut "batch-lot without MA"; any other `ASI`/`attributesetinstance` named refusal grep finds.

## 4. Gap list
(filled by the study)

## 5. Status
- [x] File written (session 9, 2026-10-22).
- [ ] Study + X of N measurement.
