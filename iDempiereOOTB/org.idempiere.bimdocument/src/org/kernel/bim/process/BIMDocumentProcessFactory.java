/******************************************************************************
 * Copyright (C) 2025-2026 Redhuan D. Oon <red1org@gmail.com>                 *
 * SPDX-License-Identifier: GPL-2.0-only                                      *
 *****************************************************************************/
package org.kernel.bim.process;

import org.adempiere.base.IProcessFactory;
import org.compiere.process.ProcessCall;

/** Gives iDempiere the two BIM Document process classes by the class names the dictionary rows carry. */
public class BIMDocumentProcessFactory implements IProcessFactory
{
	@Override
	public ProcessCall newProcessInstance (String className)
	{
		if (BIMDocumentRegisterExport.class.getName().equals (className))
			return new BIMDocumentRegisterExport();
		if (BIMDocumentOpen.class.getName().equals (className))
			return new BIMDocumentOpen();
		return null;
	}
}
