/******************************************************************************
 * Copyright (C) 2025-2026 Redhuan D. Oon <red1org@gmail.com>                 *
 * SPDX-License-Identifier: GPL-2.0-only                                      *
 *****************************************************************************/
package org.kernel.bim.model;

import java.sql.ResultSet;

import org.adempiere.base.IModelFactory;
import org.compiere.model.PO;
import org.compiere.util.Env;

/** Gives iDempiere the model class of the BIM_Document table (OSGI-INF/org.kernel.bim.BIMDocumentModelFactory.xml). */
public class BIMDocumentModelFactory implements IModelFactory
{
	@Override
	public Class<?> getClass (String tableName)
	{
		return I_BIM_Document.Table_Name.equals (tableName) ? MBIMDocument.class : null;
	}

	@Override
	public PO getPO (String tableName, int Record_ID, String trxName)
	{
		return I_BIM_Document.Table_Name.equals (tableName) ? new MBIMDocument (Env.getCtx(), Record_ID, trxName) : null;
	}

	@Override
	public PO getPO (String tableName, ResultSet rs, String trxName)
	{
		return I_BIM_Document.Table_Name.equals (tableName) ? new MBIMDocument (Env.getCtx(), rs, trxName) : null;
	}

	@Override
	public PO getPO (String tableName, String Record_UU, String trxName)
	{
		return I_BIM_Document.Table_Name.equals (tableName) ? new MBIMDocument (Env.getCtx(), Record_UU, trxName) : null;
	}
}
