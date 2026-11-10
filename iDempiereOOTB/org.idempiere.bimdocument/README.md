# org.idempiere.bimdocument — BIM Document for a real iDempiere server

OSGi component (Java). The dictionary rows (table, columns, lists, window, tabs, menu, process rows) are NOT here: they come as a 2Pack (metadata only).
This bundle holds what a pack cannot: the model classes and the process classes.

| File | What |
|---|---|
| `src/org/kernel/bim/model/I_BIM_Document.java`, `X_BIM_Document.java` | the interface and the generated-shape persistent class of table `BIM_Document` |
| `src/org/kernel/bim/model/MBIMDocument.java` | the model class and the DocAction: Draft, Issued for review, Issued for construction, Superseded. Ported from the Kernel-ERP twin (`bim-ootb erp/plugins/bim_document.mjs`), not re-invented |
| `src/org/kernel/bim/model/BIMDocumentModelFactory.java` | tells iDempiere which class serves the table |
| `src/org/kernel/bim/process/BIMDocumentRegisterExport.java` | Export Register: JSON the walkers read |
| `src/org/kernel/bim/process/BIMDocumentOpen.java` | Open: the attachment as a download, with its sha256 |
| `src/org/kernel/bim/process/BIMDocumentProcessFactory.java` | tells iDempiere which class serves each process |

Class names are the ones the twin's dictionary rows already carry (`org.kernel.bim.process.BIMDocumentOpen`, `...BIMDocumentRegisterExport`), so one pack serves both.
Spec: bim-compiler `prompts/ERP_IDEMPIERE_UX_PARITY.md` §BIMDOC-LEGACY. Witness: W-BIMDOC-LEGACY (a real legacy server).
Build: Tycho like `org.idempiere.bimootb` (`pom.xml`, parent in `~/idempiere-dev-setup`). Compile check against a server's jars: `javac -cp "<server>/plugins/*.jar" $(find src -name '*.java')`.
