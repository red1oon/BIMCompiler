/******************************************************************************
 * Copyright (C) 2025-2026 Redhuan D. Oon <red1org@gmail.com>                 *
 * SPDX-License-Identifier: GPL-2.0-only                                      *
 *****************************************************************************/
package org.kernel.bim.process;

import java.io.File;
import java.nio.file.Files;

import org.compiere.model.MAttachmentEntry;
import org.compiere.process.SvrProcess;
import org.kernel.bim.model.MBIMDocument;

/**
 * Open (on the server): the attached file of the document's kind is offered as a download, and its sha256 is shown. The Kernel-ERP twin
 * puts the file in the browser's file store and opens the Modeller or Viewer; a server process has no browser store, so here the user opens
 * the downloaded file in the app (bim-compiler prompts/ERP_IDEMPIERE_UX_PARITY.md §BIMDOC-LEGACY). Refuses at once what the twin refuses:
 * no document, no file kind, no attachment of that kind. Read only.
 */
public class BIMDocumentOpen extends SvrProcess
{
	@Override
	protected void prepare () {}

	@Override
	protected String doIt () throws Exception
	{
		MBIMDocument doc = new MBIMDocument (getCtx(), getRecord_ID(), get_TrxName());
		if (doc.get_ID() <= 0)
			throw new IllegalStateException ("Open: no document");
		if (doc.getFileKind() == null || doc.getFileKind().isEmpty())
			throw new IllegalStateException ("Open: the document has no file kind");
		MAttachmentEntry entry = BIMDocumentAttachment.entryOf (getCtx(), doc, get_TrxName());
		if (entry == null || entry.getData() == null)
			throw new IllegalStateException ("Open: no attached " + doc.getFileKind() + " file");
		String name = entry.getName().replaceAll ("[\\\\/:]", "_");
		File dir = Files.createTempDirectory ("bimdoc_").toFile();
		File out = new File (dir, name);
		Files.write (out.toPath(), entry.getData());
		getProcessInfo().setExportFile (out);
		String ext = name.contains (".") ? name.substring (name.lastIndexOf ('.') + 1) : "";
		if (!ext.isEmpty())
			getProcessInfo().setExportFileExtension (ext);
		String sha = BIMDocumentAttachment.sha256 (entry.getData());
		log.info ("§BIMDOC-OPEN id=" + doc.get_ID() + " kind=" + doc.getFileKind() + " file=" + name + " size=" + entry.getData().length + " sha256=" + sha.substring (0, 12));
		return name + " (" + entry.getData().length + " bytes, sha256 " + sha + ")";
	}
}
