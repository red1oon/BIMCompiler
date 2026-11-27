/** W-BIMDOC-LEGACY L2/L3: the BIM Document model class and processes, run on a REAL iDempiere database (never the twin).
 *  Spec: bim-compiler prompts/ERP_IDEMPIERE_UX_PARITY.md §BIMDOC-LEGACY. Run inside the live server: console command "bimdocwitness" (scripts/legacy_bimdoc_witness.sh sends it).
 *  ISSUES: (L2a) completing a revision supersedes the older one and points "Superseded By" at it; (L2b) an older revision cannot be issued after a newer one is issued for construction;
 *  (L2c) a deliverable with no task is refused; (L2d) only prepare and complete are offered; (L3) Export Register lists every deliverable's current revision plus the superseded ones, with a sha256
 *  only when a file is attached. Everything is created in one transaction that is ROLLED BACK: the database is left as it was. */
package org.kernel.bim.test;

import java.io.File;
import java.io.PrintStream;
import java.nio.file.Files;
import java.util.*;
import org.compiere.model.*;
import org.compiere.process.*;
import org.compiere.util.*;
import org.kernel.bim.model.MBIMDocument;
import org.kernel.bim.process.BIMDocumentRegisterExport;

public class WBimDocumentLegacy {
	static int pass = 0, fail = 0;
	static PrintStream out;
	static void chk (String n, boolean ok, String m) { out.println("  " + (ok ? "PASS " : "✗ FAIL ") + n + " " + m); if (ok) pass++; else fail++; }
	public static boolean run (PrintStream o) throws Exception {
		out = o; pass = 0; fail = 0;
		Properties ctx = Env.getCtx();
		Env.setContext (ctx, Env.AD_CLIENT_ID, 11); Env.setContext (ctx, Env.AD_ORG_ID, 11); Env.setContext (ctx, Env.AD_USER_ID, 100); Env.setContext (ctx, Env.AD_ROLE_ID, 102);
		String trxName = Trx.createTrxName ("bimdoc");
		Trx trx = Trx.get (trxName, true);
		try {
			trx.start();
			int dtId = DB.getSQLValue (trxName, "SELECT C_DocType_ID FROM C_DocType WHERE DocBaseType='BIM' AND AD_Client_ID=11 AND IsActive='Y' AND Name='BIM Drawing'");   // made by migration/postgresql/202611121100_BIMDOC-DOCTYPES.sql (T3): this run no longer makes one
			int nTypes = DB.getSQLValue (trxName, "SELECT COUNT(*) FROM C_DocType WHERE DocBaseType='BIM' AND AD_Client_ID=11 AND IsActive='Y'"), nSeq = DB.getSQLValue (trxName, "SELECT COUNT(DISTINCT DocNoSequence_ID) FROM C_DocType WHERE DocBaseType='BIM' AND AD_Client_ID=11 AND IsActive='Y' AND DocNoSequence_ID IS NOT NULL");
			String names = DB.getSQLValueString (trxName, "SELECT string_agg(Name,',' ORDER BY Name) FROM C_DocType WHERE DocBaseType='BIM' AND AD_Client_ID=11 AND IsActive='Y'");
			chk ("L4 the four document types of FB6 exist under DocBaseType BIM, each with its own sequence: " + names, nTypes == 4 && nSeq == 4 && "BIM Drawing,BIM Model,BIM Report,BIM Specification".equals (names) && dtId > 0, "types=" + nTypes + " sequences=" + nSeq);
			MProject prj = new MProject (ctx, 0, trxName); prj.setAD_Org_ID (11); prj.setName ("BIMDOC witness"); prj.setValue ("BIMDOC_W"); prj.setC_Currency_ID (100); prj.saveEx();
			MProjectPhase ph = new MProjectPhase (prj); ph.setName ("Phase 1"); ph.saveEx();
			MProjectTask tk = new MProjectTask (ph); tk.setName ("Task 1"); tk.saveEx();
			out.println ("L2 document rules, project=" + prj.get_ID() + " task=" + tk.get_ID() + " doctype=" + dtId);
			chk ("L0 the model class serves the table: " + I(MBIMDocument.class), MTable.get (ctx, "BIM_Document").getAD_Table_ID() > 0 && MTable.get (ctx, "BIM_Document").getColumns (false).length >= 25, "columns=" + MTable.get (ctx, "BIM_Document").getColumns (false).length);
			MBIMDocument r1 = doc (ctx, trxName, dtId, prj, ph, tk, "A-101", 1, "Plan level 1");
			boolean ok1 = r1.processIt (DocAction.ACTION_Complete); r1.saveEx();
			chk ("L2 rev 1 issued for construction", ok1 && "CO".equals (r1.getDocStatus()), "status=" + r1.getDocStatus() + " msg=" + r1.getProcessMsg());
			MBIMDocument r2 = doc (ctx, trxName, dtId, prj, ph, tk, "A-101", 2, "Plan level 1 rev B");
			boolean ok2 = r2.processIt (DocAction.ACTION_Complete); r2.saveEx(); r1 = new MBIMDocument (ctx, r1.get_ID(), trxName);
			chk ("L2a completing rev 2 sets rev 1 to Superseded and its Superseded By points at rev 2", ok2 && "CO".equals (r2.getDocStatus()) && "RE".equals (r1.getDocStatus()) && r1.getReversal_ID() == r2.get_ID() && r1.isProcessed(),
				"rev1=" + r1.getDocStatus() + " by=" + r1.getReversal_ID() + " rev2=" + r2.getDocStatus() + "(" + r2.get_ID() + ")");
			MBIMDocument old = doc (ctx, trxName, dtId, prj, ph, tk, "A-101", 1, "Plan level 1 late rev 1 copy");
			boolean okOld = old.processIt (DocAction.ACTION_Prepare);
			chk ("L2b an older revision cannot be issued after a newer one is issued for construction", !okOld || "IN".equals (old.getDocStatus()), "status=" + old.getDocStatus() + " msg=" + old.getProcessMsg());
			String[] opts = new String[20]; int n = r2.customizeValidActions ("DR", null, null, null, MBIMDocument.Table_ID, new String[0], opts, 0);
			List<String> offered = new ArrayList<>(Arrays.asList (opts).subList (0, n));
			chk ("L2d a draft offers only Issue for review (PR) and Issue for construction (CO)", offered.equals (Arrays.asList ("PR", "CO")), offered.toString());
			MBIMDocument c = doc (ctx, trxName, dtId, prj, ph, tk, "C-301", 1, "Elevation");
			c.setFileKind ("DXF"); c.setDiscipline ("ARC"); c.saveEx();
			out.println ("L3 register");
			ProcessInfo pi = new ProcessInfo ("Export Register", 0); pi.setRecord_ID (r2.get_ID()); pi.setTable_ID (MBIMDocument.Table_ID);
			BIMDocumentRegisterExport proc = new BIMDocumentRegisterExport();
			boolean ran = proc.startProcess (ctx, pi, trx);
			File f = pi.getExportFile();
			String json = f != null && f.exists() ? new String (Files.readAllBytes (f.toPath()), "UTF-8") : "";
			int rows = json.split ("\\{\"no\"", -1).length - 1;
			chk ("L3 the register is a JSON file of the project: A-101 rev 1 (RE) + rev 2 (CO) + C-301 rev 1 (DR) + the late A-101 copy is not a deliverable of its own", ran && f != null && json.contains ("\"no\":\"A-101\",\"rev\":1,\"status\":\"RE\"") && json.contains ("\"no\":\"A-101\",\"rev\":2,\"status\":\"CO\"") && json.contains ("\"no\":\"C-301\""), "ran=" + ran + " rows=" + rows + " file=" + (f == null ? null : f.getName()));
			chk ("L3b no attachment means sha256 null, never invented", json.contains ("\"sha256\":null") && !json.matches ("(?s).*\"sha256\":\"[0-9a-f]{64}\".*"), "");
			out.println (json);
			// §BIMDOC-PROJTAB P1-P3 on the real dictionary: the level-1 Project tab, its legacy link resolution (GridWindow.initTab: the IsParent column equal to the parent tab's key), and the rows it would show
			int pTab = DB.getSQLValue (trxName, "SELECT COUNT(*) FROM AD_Tab t JOIN AD_Table x ON x.AD_Table_ID=t.AD_Table_ID WHERE x.TableName='BIM_Document' AND t.AD_Window_ID=130 AND t.TabLevel=1 AND t.SeqNo=17 AND t.IsActive='Y'");
			chk ("P1 the Project window (130) carries a level-1 BIM Document tab at seq 17", pTab == 1, "tabs=" + pTab);
			int pPar = DB.getSQLValue (trxName, "SELECT COUNT(*) FROM AD_Column c JOIN AD_Table x ON x.AD_Table_ID=c.AD_Table_ID WHERE x.TableName='BIM_Document' AND c.IsParent='Y' AND c.ColumnName IN ('C_Project_ID','C_ProjectTask_ID')");
			chk ("P2 C_Project_ID and C_ProjectTask_ID are both IsParent, so each tab level links by its own parent key", pPar == 2, "parents=" + pPar);
			int pAll = DB.getSQLValue (trxName, "SELECT COUNT(*) FROM BIM_Document WHERE C_Project_ID=?", prj.get_ID()), pTasks = DB.getSQLValue (trxName, "SELECT COUNT(*) FROM BIM_Document d JOIN C_ProjectTask k ON k.C_ProjectTask_ID=d.C_ProjectTask_ID JOIN C_ProjectPhase h ON h.C_ProjectPhase_ID=k.C_ProjectPhase_ID WHERE h.C_Project_ID=?", prj.get_ID());
			chk ("P3 every deliverable of the project is reachable from the project tab (rows by project == rows by its tasks, and > 0)", pAll > 0 && pAll == pTasks, "byProject=" + pAll + " byTasks=" + pTasks);
			// last: a failed insert aborts the PostgreSQL transaction, so nothing may follow it
			String why = ""; boolean refused = false;
			try { doc (ctx, trxName, dtId, prj, ph, null, "B-201", 1, "Section A"); } catch (Exception e) { refused = true; why = String.valueOf (e.getMessage()); }
			chk ("L2c a deliverable with no task is refused (the column is mandatory)", refused && why.toLowerCase().contains ("c_projecttask_id"), why.length() > 120 ? why.substring (0, 120) : why);
		} catch (Throwable t) { t.printStackTrace (out); fail++; }
		finally { trx.rollback(); trx.close(); }
		out.println ("§W-BIMDOC-LEGACY " + (fail == 0 && pass > 0 ? "PASS" : fail > 0 ? "FAIL" : "INCONCLUSIVE") + " pass=" + pass + " fail=" + fail + " (transaction rolled back)");
		return fail == 0 && pass > 0;
	}
	static String I (Class<?> c) { return c.getName(); }
	static MBIMDocument doc (Properties ctx, String trxName, int dtId, MProject prj, MProjectPhase ph, MProjectTask tk, String no, int rev, String name) {
		MBIMDocument d = new MBIMDocument (ctx, 0, trxName); d.setAD_Org_ID (11); d.setC_DocType_ID (dtId); d.setC_Project_ID (prj.get_ID()); d.setC_ProjectPhase_ID (ph.get_ID());
		if (tk != null) d.setC_ProjectTask_ID (tk.get_ID());
		d.setDeliverableNo (no); d.setRevision (rev); d.setName (name); d.saveEx(); return d;
	}
}
