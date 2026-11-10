/******************************************************************************
 * Copyright (C) 2025-2026 Redhuan D. Oon <red1org@gmail.com>                 *
 * SPDX-License-Identifier: GPL-2.0-only                                      *
 * Same shape as iDempiere's generated model classes (GenerateModel).         *
 *****************************************************************************/
package org.kernel.bim.model;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.util.Properties;
import org.compiere.model.I_Persistent;
import org.compiere.model.PO;
import org.compiere.model.POInfo;
import org.compiere.util.Env;
/** Generated-shape Model for BIM_Document */
@org.adempiere.base.Model(table="BIM_Document")
public class X_BIM_Document extends PO implements I_BIM_Document, I_Persistent
{
	private static final long serialVersionUID = 20261111L;

	/** Standard Constructor */
	public X_BIM_Document (Properties ctx, int BIM_Document_ID, String trxName)
	{
		super (ctx, BIM_Document_ID, trxName);
	}
	/** Standard Constructor */
	public X_BIM_Document (Properties ctx, int BIM_Document_ID, String trxName, String ... virtualColumns)
	{
		super (ctx, BIM_Document_ID, trxName, virtualColumns);
	}
	/** Standard Constructor */
	public X_BIM_Document (Properties ctx, String BIM_Document_UU, String trxName)
	{
		super (ctx, BIM_Document_UU, trxName);
	}
	/** Load Constructor */
	public X_BIM_Document (Properties ctx, ResultSet rs, String trxName)
	{
		super (ctx, rs, trxName);
	}
	/** AccessLevel @return 3 - Client - Org */
	protected int get_AccessLevel()
	{
		return accessLevel.intValue();
	}
	/** Load Meta Data */
	protected POInfo initPO (Properties ctx)
	{
		return POInfo.getPOInfo (ctx, Table_ID, get_TrxName());
	}
	public String toString()
	{
		return new StringBuilder ("X_BIM_Document[").append(get_ID()).append(",DeliverableNo=").append(getDeliverableNo()).append(",Revision=").append(getRevision()).append("]").toString();
	}
	/** Set BIM Document */
	public void setBIM_Document_ID (int v)
	{
		if (v < 1)
			set_ValueNoCheck (COLUMNNAME_BIM_Document_ID, null);
		else
			set_ValueNoCheck (COLUMNNAME_BIM_Document_ID, Integer.valueOf(v));
	}
	/** Get BIM Document */
	public int getBIM_Document_ID()
	{
		Integer ii = (Integer)get_Value(COLUMNNAME_BIM_Document_ID);
		if (ii == null)
			 return 0;
		return ii.intValue();
	}
	/** Set BIM_Document_UU */
	public void setBIM_Document_UU (String v)
	{
		set_Value (COLUMNNAME_BIM_Document_UU, v);
	}
	/** Get BIM_Document_UU */
	public String getBIM_Document_UU()
	{
		return (String)get_Value(COLUMNNAME_BIM_Document_UU);
	}
	/** Set Document Type */
	public void setC_DocType_ID (int v)
	{
		if (v < 1)
			set_Value (COLUMNNAME_C_DocType_ID, null);
		else
			set_Value (COLUMNNAME_C_DocType_ID, Integer.valueOf(v));
	}
	/** Get Document Type */
	public int getC_DocType_ID()
	{
		Integer ii = (Integer)get_Value(COLUMNNAME_C_DocType_ID);
		if (ii == null)
			 return 0;
		return ii.intValue();
	}
	/** Set Project */
	public void setC_Project_ID (int v)
	{
		if (v < 1)
			set_Value (COLUMNNAME_C_Project_ID, null);
		else
			set_Value (COLUMNNAME_C_Project_ID, Integer.valueOf(v));
	}
	/** Get Project */
	public int getC_Project_ID()
	{
		Integer ii = (Integer)get_Value(COLUMNNAME_C_Project_ID);
		if (ii == null)
			 return 0;
		return ii.intValue();
	}
	/** Set Project Phase */
	public void setC_ProjectPhase_ID (int v)
	{
		if (v < 1)
			set_Value (COLUMNNAME_C_ProjectPhase_ID, null);
		else
			set_Value (COLUMNNAME_C_ProjectPhase_ID, Integer.valueOf(v));
	}
	/** Get Project Phase */
	public int getC_ProjectPhase_ID()
	{
		Integer ii = (Integer)get_Value(COLUMNNAME_C_ProjectPhase_ID);
		if (ii == null)
			 return 0;
		return ii.intValue();
	}
	/** Set Project Task */
	public void setC_ProjectTask_ID (int v)
	{
		if (v < 1)
			set_Value (COLUMNNAME_C_ProjectTask_ID, null);
		else
			set_Value (COLUMNNAME_C_ProjectTask_ID, Integer.valueOf(v));
	}
	/** Get Project Task */
	public int getC_ProjectTask_ID()
	{
		Integer ii = (Integer)get_Value(COLUMNNAME_C_ProjectTask_ID);
		if (ii == null)
			 return 0;
		return ii.intValue();
	}
	/** Set Deliverable No */
	public void setDeliverableNo (String v)
	{
		set_Value (COLUMNNAME_DeliverableNo, v);
	}
	/** Get Deliverable No */
	public String getDeliverableNo()
	{
		return (String)get_Value(COLUMNNAME_DeliverableNo);
	}
	/** Set Revision */
	public void setRevision (int v)
	{
		if (v < 1)
			set_Value (COLUMNNAME_Revision, null);
		else
			set_Value (COLUMNNAME_Revision, Integer.valueOf(v));
	}
	/** Get Revision */
	public int getRevision()
	{
		Integer ii = (Integer)get_Value(COLUMNNAME_Revision);
		if (ii == null)
			 return 0;
		return ii.intValue();
	}
	/** Set Title */
	public void setName (String v)
	{
		set_Value (COLUMNNAME_Name, v);
	}
	/** Get Title */
	public String getName()
	{
		return (String)get_Value(COLUMNNAME_Name);
	}
	/** Set Discipline */
	public void setDiscipline (String v)
	{
		set_Value (COLUMNNAME_Discipline, v);
	}
	/** Get Discipline */
	public String getDiscipline()
	{
		return (String)get_Value(COLUMNNAME_Discipline);
	}
	/** Set File Kind */
	public void setFileKind (String v)
	{
		set_Value (COLUMNNAME_FileKind, v);
	}
	/** Get File Kind */
	public String getFileKind()
	{
		return (String)get_Value(COLUMNNAME_FileKind);
	}
	/** Set Hours Budget */
	public void setHoursBudget (BigDecimal v)
	{
		set_Value (COLUMNNAME_HoursBudget, v);
	}
	/** Get Hours Budget */
	public BigDecimal getHoursBudget()
	{
		BigDecimal bd = (BigDecimal)get_Value(COLUMNNAME_HoursBudget);
		if (bd == null)
			 return Env.ZERO;
		return bd;
	}
	/** Set Document Status */
	public void setDocStatus (String v)
	{
		set_Value (COLUMNNAME_DocStatus, v);
	}
	/** Get Document Status */
	public String getDocStatus()
	{
		return (String)get_Value(COLUMNNAME_DocStatus);
	}
	/** Set Document Action */
	public void setDocAction (String v)
	{
		set_Value (COLUMNNAME_DocAction, v);
	}
	/** Get Document Action */
	public String getDocAction()
	{
		return (String)get_Value(COLUMNNAME_DocAction);
	}
	/** Set Processed */
	public void setProcessed (boolean v)
	{
		set_Value (COLUMNNAME_Processed, Boolean.valueOf(v));
	}
	/** Get Processed */
	public boolean isProcessed()
	{
		Object oo = get_Value(COLUMNNAME_Processed);
		if (oo != null) 
		{
			 if (oo instanceof Boolean) 
				 return ((Boolean)oo).booleanValue(); 
			return "Y".equals(oo);
		}
		return false;
	}
	/** Set Superseded By */
	public void setReversal_ID (int v)
	{
		if (v < 1)
			set_Value (COLUMNNAME_Reversal_ID, null);
		else
			set_Value (COLUMNNAME_Reversal_ID, Integer.valueOf(v));
	}
	/** Get Superseded By */
	public int getReversal_ID()
	{
		Integer ii = (Integer)get_Value(COLUMNNAME_Reversal_ID);
		if (ii == null)
			 return 0;
		return ii.intValue();
	}
	/** Set Open in Modeller / Viewer */
	public void setOpenInApp (String v)
	{
		set_Value (COLUMNNAME_OpenInApp, v);
	}
	/** Get Open in Modeller / Viewer */
	public String getOpenInApp()
	{
		return (String)get_Value(COLUMNNAME_OpenInApp);
	}
	/** Set Export Register (JSON) */
	public void setExportRegister (String v)
	{
		set_Value (COLUMNNAME_ExportRegister, v);
	}
	/** Get Export Register (JSON) */
	public String getExportRegister()
	{
		return (String)get_Value(COLUMNNAME_ExportRegister);
	}
}
