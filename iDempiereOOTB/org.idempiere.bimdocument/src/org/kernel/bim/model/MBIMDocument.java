/******************************************************************************
 * Copyright (C) 2025-2026 Redhuan D. Oon <red1org@gmail.com>                 *
 * SPDX-License-Identifier: GPL-2.0-only                                      *
 *****************************************************************************/
package org.kernel.bim.model;

import java.io.File;
import java.math.BigDecimal;
import java.sql.ResultSet;
import java.util.List;
import java.util.Properties;

import org.compiere.model.Query;
import org.compiere.process.DocAction;
import org.compiere.process.DocOptions;
import org.compiere.process.DocumentEngine;

/**
 * BIM Document: one deliverable (a sheet or a model file) under a project task, with a revision and a state a firm prints in a title block.
 * The document rules are the Kernel-ERP twin's (erp/plugins/bim_document.mjs docAction), ported, not re-invented (TWIN RULE):
 *   Draft (DR) -> Issued for review (IP) -> Issued for construction (CO); Superseded (RE) is set on the older revision when a newer one is completed.
 * Only prepare (Issue for review) and complete (Issue for construction) are offered; void, close, reverse and re-activate are not (the twin's FAMILY flags).
 * Spec: bim-compiler prompts/ERP_IDEMPIERE_UX_PARITY.md §BIMDOC-LEGACY. Witness: W-BIMDOC-LEGACY.
 */
public class MBIMDocument extends X_BIM_Document implements DocAction, DocOptions
{
	private static final long serialVersionUID = 20261111L;

	/** Process message (shown to the user when prepare or complete says Invalid) */
	private String m_processMsg = null;
	/** Set by prepareIt() so completeIt() does not prepare twice */
	private boolean m_justPrepared = false;

	public MBIMDocument (Properties ctx, int BIM_Document_ID, String trxName)
	{
		super (ctx, BIM_Document_ID, trxName);
		if (BIM_Document_ID == 0)
		{
			setDocStatus (STATUS_Drafted);
			setDocAction (ACTION_Complete);
			setProcessed (false);
			setRevision (1);
		}
	}

	public MBIMDocument (Properties ctx, int BIM_Document_ID, String trxName, String... virtualColumns)
	{
		super (ctx, BIM_Document_ID, trxName, virtualColumns);
	}

	public MBIMDocument (Properties ctx, String BIM_Document_UU, String trxName)
	{
		super (ctx, BIM_Document_UU, trxName);
	}

	public MBIMDocument (Properties ctx, ResultSet rs, String trxName)
	{
		super (ctx, rs, trxName);
	}

	/** The other active revisions of the same deliverable (same project and deliverable no), this row excluded. */
	private List<MBIMDocument> siblings ()
	{
		return new Query (getCtx(), Table_Name, "C_Project_ID=? AND DeliverableNo=? AND BIM_Document_ID<>? AND IsActive='Y'", get_TrxName())
			.setParameters (getC_Project_ID(), getDeliverableNo(), get_ID())
			.setOrderBy ("Revision, BIM_Document_ID")
			.list ();
	}

	// ----------------------------------------------------------------- DocAction

	@Override
	public boolean processIt (String processAction) throws Exception
	{
		m_processMsg = null;
		DocumentEngine engine = new DocumentEngine (this, getDocStatus());
		return engine.processIt (processAction, getDocAction());
	}

	@Override
	public boolean unlockIt () { return true; }

	@Override
	public boolean invalidateIt ()
	{
		setDocAction (ACTION_Prepare);
		return true;
	}

	/** Issue for review. Invalid when the deliverable has no number or title, hangs under no task, or a newer revision is already issued for construction. */
	@Override
	public String prepareIt ()
	{
		m_processMsg = null;
		if (getDeliverableNo() == null || getDeliverableNo().trim().isEmpty() || getName() == null || getName().trim().isEmpty())
		{
			m_processMsg = "A deliverable needs its number and its title";
			return DocAction.STATUS_Invalid;
		}
		if (getC_ProjectTask_ID() <= 0)
		{
			m_processMsg = "A deliverable hangs under a project task";
			return DocAction.STATUS_Invalid;
		}
		for (MBIMDocument o : siblings())
		{
			if (STATUS_Completed.equals (o.getDocStatus()) && o.getRevision() >= getRevision())
			{
				m_processMsg = "Revision " + o.getRevision() + " of " + getDeliverableNo() + " is already Issued for construction";
				return DocAction.STATUS_Invalid;
			}
		}
		m_justPrepared = true;
		if (!ACTION_Complete.equals (getDocAction()))
			setDocAction (ACTION_Complete);
		return DocAction.STATUS_InProgress;
	}

	@Override
	public boolean approveIt () { return false; }

	@Override
	public boolean rejectIt () { return false; }

	/**
	 * Issue for construction. Every older revision of the deliverable that is Issued for construction or for review becomes Superseded (RE),
	 * "Superseded By" (Reversal_ID) names this revision, and it is closed to further action. The count before and after is logged
	 * (§BIMDOC-CHAIN), the same line the twin writes.
	 */
	@Override
	public String completeIt ()
	{
		if (!m_justPrepared)
		{
			String status = prepareIt();
			if (!DocAction.STATUS_InProgress.equals (status))
				return status;
		}
		m_justPrepared = false;
		int before = issuedInProject (null, null);
		java.util.Set<Integer> nowSuperseded = new java.util.HashSet<>();
		for (MBIMDocument o : siblings())
		{
			boolean live = STATUS_Completed.equals (o.getDocStatus()) || STATUS_InProgress.equals (o.getDocStatus());
			if (!live || o.getRevision() >= getRevision())
				continue;
			o.setDocStatus (STATUS_Reversed);
			o.setReversal_ID (get_ID());
			o.setProcessed (true);
			o.setDocAction (ACTION_None);
			o.saveEx (get_TrxName());
			nowSuperseded.add (o.get_ID());
			log.info ("§BIMDOC-SUPERSEDE deliverable=" + getDeliverableNo() + " old=" + o.get_ID() + "(rev " + o.getRevision() + ") by=" + get_ID()
				+ "(rev " + getRevision() + ") old.docstatus=RE reversal_id=" + get_ID());
		}
		setProcessed (true);
		setDocAction (ACTION_None);
		log.info ("§BIMDOC-ISSUED id=" + get_ID() + " deliverable=" + getDeliverableNo() + " rev=" + getRevision() + " status=CO superseded=" + nowSuperseded.size());
		// this row is still in progress in the database until the engine stores CO: count it as issued, as the twin does
		int after = issuedInProject (get_ID(), nowSuperseded);
		log.info ("§BIMDOC-CHAIN project=" + getC_Project_ID() + " deliverable=" + getDeliverableNo() + " issued-before=" + before
			+ " issued-after=" + after + " delta=" + (after - before));
		return DocAction.STATUS_Completed;
	}

	/**
	 * Deliverables of the project whose CURRENT (latest) revision is Issued for construction: the rule of the Project window's
	 * computed "issued" columns. {@code asCompleted} treats that row as completed, {@code asSuperseded} treats those rows as superseded.
	 */
	private int issuedInProject (Integer asCompleted, java.util.Set<Integer> asSuperseded)
	{
		List<MBIMDocument> all = new Query (getCtx(), Table_Name, "C_Project_ID=? AND IsActive='Y'", get_TrxName())
			.setParameters (getC_Project_ID()).list ();
		int n = 0;
		for (MBIMDocument d : all)
		{
			boolean latest = true;
			for (MBIMDocument e : all)
				if (e.getDeliverableNo().equals (d.getDeliverableNo()) && (e.getRevision() > d.getRevision()
					|| (e.getRevision() == d.getRevision() && e.get_ID() > d.get_ID())))
				{ latest = false; break; }
			boolean done = STATUS_Completed.equals (d.getDocStatus());
			if (asCompleted != null && d.get_ID() == asCompleted)
				done = true;
			if (asSuperseded != null && asSuperseded.contains (d.get_ID()))
				done = false;
			if (latest && done)
				n++;
		}
		return n;
	}

	@Override
	public boolean voidIt () { m_processMsg = "A deliverable is superseded by a newer revision, not voided"; return false; }

	@Override
	public boolean closeIt () { return false; }

	@Override
	public boolean reverseCorrectIt () { return false; }

	@Override
	public boolean reverseAccrualIt () { return false; }

	@Override
	public boolean reActivateIt () { return false; }

	@Override
	public String getDocumentNo ()
	{
		return getDeliverableNo() + "-" + getRevision();
	}

	@Override
	public String getSummary ()
	{
		return getDeliverableNo() + " rev " + getRevision() + " - " + getName();
	}

	@Override
	public String getDocumentInfo () { return getSummary(); }

	@Override
	public File createPDF () { return null; }

	@Override
	public String getProcessMsg () { return m_processMsg; }

	@Override
	public int getDoc_User_ID () { return getCreatedBy(); }

	@Override
	public int getC_Currency_ID () { return 0; }

	@Override
	public BigDecimal getApprovalAmt () { return BigDecimal.ZERO; }

	@Override
	public String getDocAction ()
	{
		return super.getDocAction();
	}

	/** Only Issue for review (PR) and Issue for construction (CO) are offered, as the twin's document family allows. */
	@Override
	public int customizeValidActions (String docStatus, Object processing, String orderType, String isSOTrx,
		int AD_Table_ID, String[] docAction, String[] options, int index)
	{
		int i = 0;
		if (STATUS_Drafted.equals (docStatus) || STATUS_Invalid.equals (docStatus))
		{
			options[i++] = ACTION_Prepare;
			if (STATUS_Drafted.equals (docStatus))
				options[i++] = ACTION_Complete;
		}
		else if (STATUS_InProgress.equals (docStatus))
			options[i++] = ACTION_Complete;
		return i;
	}
}
