/******************************************************************************
 * Copyright (C) 2025-2026 Redhuan D. Oon <red1org@gmail.com>                 *
 * SPDX-License-Identifier: GPL-2.0-only                                      *
 *****************************************************************************/
package org.kernel.bim.process;

import java.security.MessageDigest;
import java.util.Locale;
import java.util.Properties;

import org.compiere.model.MAttachment;
import org.compiere.model.MAttachmentEntry;
import org.kernel.bim.model.I_BIM_Document;
import org.kernel.bim.model.MBIMDocument;

/** The attached file of a BIM Document: the entry whose name ends in the document's file kind (DXF, IFC, PDF). Nothing is invented: no entry, no file. */
final class BIMDocumentAttachment
{
	private BIMDocumentAttachment () {}

	/** The entry of the row's kind, or null (no file kind, no attachment, or no entry of that kind). */
	static MAttachmentEntry entryOf (Properties ctx, MBIMDocument doc, String trxName)
	{
		if (doc.getFileKind() == null || doc.getFileKind().isEmpty())
			return null;
		MAttachment att = MAttachment.get (ctx, I_BIM_Document.Table_ID, doc.get_ID(), doc.get_UUID(), trxName);
		if (att == null)
			return null;
		String ext = "." + doc.getFileKind().toLowerCase (Locale.ROOT);
		for (MAttachmentEntry e : att.getEntries())
			if (e.getName() != null && e.getName().toLowerCase (Locale.ROOT).endsWith (ext))
				return e;
		return null;
	}

	/** Lower-case hex SHA-256 of the bytes: the fingerprint the register carries. */
	static String sha256 (byte[] data) throws Exception
	{
		byte[] d = MessageDigest.getInstance ("SHA-256").digest (data);
		StringBuilder sb = new StringBuilder();
		for (byte b : d)
			sb.append (String.format ("%02x", b));
		return sb.toString();
	}
}
