// ⚠ DO NOT REMOVE — scope: CALLOUT/PROCESS ORACLE for the core-callouts lane (bim-compiler prompts/ERP_IDEMPIERE_UX_PARITY.md §CP).
// An OSGi bundle installed into the PILOT iDempiere server (DB idempiere_pilot, NEVER idempiere). It drives the REAL
// GridWindow/GridTab (the same objects ZK's ADTabpanel drives) headless: dataNew → setValue → processFieldChange, with a
// DataStatusListener that mirrors ADTabpanel.dataStatusChanged (org.adempiere.ui.zk .../adwindow/ADTabpanel.java:1692-1712)
// so a callout's mTab.setValue cascades exactly as in the UI. Reads only, except op=process (runs a real SvrProcess).
// Read the log after every run.
package org.bimootb.oracle;

import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;

public class Activator implements BundleActivator {
	private Oracle oracle;
	public void start(BundleContext ctx) throws Exception { oracle = new Oracle(); oracle.start(); }
	public void stop(BundleContext ctx) throws Exception { if (oracle != null) oracle.stop(); }
}
