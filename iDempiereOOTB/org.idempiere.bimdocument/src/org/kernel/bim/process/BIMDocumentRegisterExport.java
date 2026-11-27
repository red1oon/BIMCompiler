/******************************************************************************
 * Copyright (C) 2025-2026 Redhuan D. Oon <red1org@gmail.com>                 *
 * SPDX-License-Identifier: GPL-2.0-only                                      *
 *****************************************************************************/
package org.kernel.bim.process;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

import org.compiere.model.MAttachmentEntry;
import org.compiere.model.MProject;
import org.compiere.model.Query;
import org.compiere.process.SvrProcess;
import org.kernel.bim.model.I_BIM_Document;
import org.kernel.bim.model.MBIMDocument;

/**
 * Export Register: the register of the project of the selected document, as JSON the walkers read
 * ([{no, rev, status, discipline, filekind, sha256, name}], bim-ootb prompts/DISC_WALK_DRAWN_INTEGRATION.md §12a).
 * Every deliverable at its latest revision plus every superseded revision; ordered by number, then revision. A sha256 is the attached
 * file's own digest, null when nothing is attached: never invented. Read only: nothing is changed. Same content as the Kernel-ERP twin's
 * Export Register (W-BIMDOC-LEGACY L3 compares the two).
 */
public class BIMDocumentRegisterExport extends SvrProcess
{
	@Override
	protected void prepare () {}

	@Override
	protected String doIt () throws Exception
	{
		MBIMDocument doc = new MBIMDocument (getCtx(), getRecord_ID(), get_TrxName());
		if (doc.get_ID() <= 0 || doc.getC_Project_ID() <= 0)
			throw new IllegalStateException ("Export Register: the document has no project");
		List<MBIMDocument> all = new Query (getCtx(), I_BIM_Document.Table_Name, "C_Project_ID=? AND IsActive='Y'", get_TrxName())
			.setParameters (doc.getC_Project_ID()).setOrderBy ("DeliverableNo, Revision, BIM_Document_ID").list();
		List<MBIMDocument> rows = new ArrayList<>();
		int latest = 0, superseded = 0;
		for (MBIMDocument d : all)
		{
			boolean isLatest = true;
			for (MBIMDocument e : all)
				if (e.getDeliverableNo().equals (d.getDeliverableNo()) && (e.getRevision() > d.getRevision()
					|| (e.getRevision() == d.getRevision() && e.get_ID() > d.get_ID())))
				{ isLatest = false; break; }
			boolean re = "RE".equals (d.getDocStatus());
			if (isLatest || re)
				rows.add (d);
			if (isLatest) latest++;
			if (re) superseded++;
		}
		StringBuilder json = new StringBuilder ("[");
		for (int i = 0; i < rows.size(); i++)
		{
			MBIMDocument d = rows.get (i);
			MAttachmentEntry entry = BIMDocumentAttachment.entryOf (getCtx(), d, get_TrxName());
			String sha = entry == null || entry.getData() == null ? null : BIMDocumentAttachment.sha256 (entry.getData());
			json.append (i == 0 ? "\n" : ",\n").append ("  {\"no\":").append (q (d.getDeliverableNo()))
				.append (",\"rev\":").append (d.getRevision())
				.append (",\"status\":").append (q (d.getDocStatus()))
				.append (",\"discipline\":").append (q (d.getDiscipline()))
				.append (",\"filekind\":").append (q (d.getFileKind()))
				.append (",\"sha256\":").append (q (sha))
				.append (",\"name\":").append (q (d.getName())).append ("}");
		}
		json.append ("\n]\n");
		MProject project = new MProject (getCtx(), doc.getC_Project_ID(), get_TrxName());
		File out = File.createTempFile ("register_" + (project.getValue() == null ? doc.getC_Project_ID() : project.getValue().replaceAll ("[^A-Za-z0-9_.-]", "_")) + "_", ".json");
		Files.write (out.toPath(), json.toString().getBytes (StandardCharsets.UTF_8));
		getProcessInfo().setExportFile (out);
		getProcessInfo().setExportFileExtension ("json");
		log.info ("§BIMDOC-REGISTER-EXPORT project=" + doc.getC_Project_ID() + " rows=" + rows.size() + " latest=" + latest + " superseded=" + superseded);
		return "Register of project " + project.getValue() + ": " + rows.size() + " rows (" + latest + " current, " + superseded + " superseded)";
	}

	/** A JSON string literal, or null. */
	private static String q (String s)
	{
		if (s == null)
			return "null";
		StringBuilder sb = new StringBuilder ("\"");
		for (char c : s.toCharArray())
		{
			if (c == '"' || c == '\\') sb.append ('\\').append (c);
			else if (c < 0x20) sb.append (String.format ("\\u%04x", (int) c));
			else sb.append (c);
		}
		return sb.append ('"').toString();
	}
}
