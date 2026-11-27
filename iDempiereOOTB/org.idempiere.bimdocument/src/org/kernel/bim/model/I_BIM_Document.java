/******************************************************************************
 * Copyright (C) 2025-2026 Redhuan D. Oon <red1org@gmail.com>                 *
 * SPDX-License-Identifier: GPL-2.0-only                                      *
 * Generated from the ERP data-model workbook by erp/tools/xlsx_pack.js,      *
 * in the shape of iDempiere's own generated model classes. DO NOT EDIT.      *
 *****************************************************************************/
package org.kernel.bim.model;

import java.math.BigDecimal;
import java.sql.Timestamp;
import org.compiere.model.MTable;
import org.compiere.util.KeyNamePair;
/** Interface for BIM_Document */
public interface I_BIM_Document
{
    /** TableName=BIM_Document */
    public static final String Table_Name = "BIM_Document";
    /** AD_Table_ID is per database: read from the dictionary, never typed */
    public static final int Table_ID = MTable.getTable_ID(Table_Name);
    KeyNamePair Model = new KeyNamePair(Table_ID, Table_Name);
    /** AccessLevel = 3 */
    BigDecimal accessLevel = BigDecimal.valueOf(3);
    /** Column name AD_Client_ID */
    public static final String COLUMNNAME_AD_Client_ID = "AD_Client_ID";
    public int getAD_Client_ID();
    /** Column name AD_Org_ID */
    public static final String COLUMNNAME_AD_Org_ID = "AD_Org_ID";
    public void setAD_Org_ID (int AD_Org_ID);
    public int getAD_Org_ID();
    /** Column name IsActive */
    public static final String COLUMNNAME_IsActive = "IsActive";
    public void setIsActive (boolean IsActive);
    public boolean isActive();
    /** Column name Created */
    public static final String COLUMNNAME_Created = "Created";
    public Timestamp getCreated();
    /** Column name CreatedBy */
    public static final String COLUMNNAME_CreatedBy = "CreatedBy";
    public int getCreatedBy();
    /** Column name Updated */
    public static final String COLUMNNAME_Updated = "Updated";
    public Timestamp getUpdated();
    /** Column name UpdatedBy */
    public static final String COLUMNNAME_UpdatedBy = "UpdatedBy";
    public int getUpdatedBy();
    /** Column name BIM_Document_ID */
    public static final String COLUMNNAME_BIM_Document_ID = "BIM_Document_ID";
    /** Set BIM Document */
    public void setBIM_Document_ID (int BIM_Document_ID);
    /** Get BIM Document */
    public int getBIM_Document_ID();
    /** Column name BIM_Document_UU */
    public static final String COLUMNNAME_BIM_Document_UU = "BIM_Document_UU";
    /** Set BIM_Document_UU */
    public void setBIM_Document_UU (String BIM_Document_UU);
    /** Get BIM_Document_UU */
    public String getBIM_Document_UU();
    /** Column name C_DocType_ID */
    public static final String COLUMNNAME_C_DocType_ID = "C_DocType_ID";
    /** Set Document Type */
    public void setC_DocType_ID (int C_DocType_ID);
    /** Get Document Type */
    public int getC_DocType_ID();
    /** Column name C_Project_ID */
    public static final String COLUMNNAME_C_Project_ID = "C_Project_ID";
    /** Set Project */
    public void setC_Project_ID (int C_Project_ID);
    /** Get Project */
    public int getC_Project_ID();
    /** Column name C_ProjectPhase_ID */
    public static final String COLUMNNAME_C_ProjectPhase_ID = "C_ProjectPhase_ID";
    /** Set Project Phase */
    public void setC_ProjectPhase_ID (int C_ProjectPhase_ID);
    /** Get Project Phase */
    public int getC_ProjectPhase_ID();
    /** Column name C_ProjectTask_ID */
    public static final String COLUMNNAME_C_ProjectTask_ID = "C_ProjectTask_ID";
    /** Set Project Task */
    public void setC_ProjectTask_ID (int C_ProjectTask_ID);
    /** Get Project Task */
    public int getC_ProjectTask_ID();
    /** Column name DeliverableNo */
    public static final String COLUMNNAME_DeliverableNo = "DeliverableNo";
    /** Set Deliverable No */
    public void setDeliverableNo (String DeliverableNo);
    /** Get Deliverable No */
    public String getDeliverableNo();
    /** Column name Revision */
    public static final String COLUMNNAME_Revision = "Revision";
    /** Set Revision */
    public void setRevision (int Revision);
    /** Get Revision */
    public int getRevision();
    /** Column name Name */
    public static final String COLUMNNAME_Name = "Name";
    /** Set Title */
    public void setName (String Name);
    /** Get Title */
    public String getName();
    /** Column name Discipline */
    public static final String COLUMNNAME_Discipline = "Discipline";
    /** Set Discipline */
    public void setDiscipline (String Discipline);
    /** Get Discipline */
    public String getDiscipline();
    /** Column name FileKind */
    public static final String COLUMNNAME_FileKind = "FileKind";
    /** Set File Kind */
    public void setFileKind (String FileKind);
    /** Get File Kind */
    public String getFileKind();
    /** Column name HoursBudget */
    public static final String COLUMNNAME_HoursBudget = "HoursBudget";
    /** Set Hours Budget */
    public void setHoursBudget (BigDecimal HoursBudget);
    /** Get Hours Budget */
    public BigDecimal getHoursBudget();
    /** Column name DocStatus */
    public static final String COLUMNNAME_DocStatus = "DocStatus";
    /** Set Document Status */
    public void setDocStatus (String DocStatus);
    /** Get Document Status */
    public String getDocStatus();
    /** Column name DocAction */
    public static final String COLUMNNAME_DocAction = "DocAction";
    /** Set Document Action */
    public void setDocAction (String DocAction);
    /** Get Document Action */
    public String getDocAction();
    /** Column name Processed */
    public static final String COLUMNNAME_Processed = "Processed";
    /** Set Processed */
    public void setProcessed (boolean Processed);
    /** Get Processed */
    public boolean isProcessed();
    /** Column name Reversal_ID */
    public static final String COLUMNNAME_Reversal_ID = "Reversal_ID";
    /** Set Superseded By */
    public void setReversal_ID (int Reversal_ID);
    /** Get Superseded By */
    public int getReversal_ID();
    /** Column name OpenInApp */
    public static final String COLUMNNAME_OpenInApp = "OpenInApp";
    /** Set Open in Modeller / Viewer */
    public void setOpenInApp (String OpenInApp);
    /** Get Open in Modeller / Viewer */
    public String getOpenInApp();
    /** Column name ExportRegister */
    public static final String COLUMNNAME_ExportRegister = "ExportRegister";
    /** Set Export Register (JSON) */
    public void setExportRegister (String ExportRegister);
    /** Get Export Register (JSON) */
    public String getExportRegister();
}
