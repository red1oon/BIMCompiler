package org.kernel.bim.test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import org.eclipse.osgi.framework.console.CommandInterpreter;
import org.eclipse.osgi.framework.console.CommandProvider;

/** OSGi console command "bimdocwitness": runs W-BIMDOC-LEGACY inside the live server (the model layer needs the OSGi runtime). A TEST bundle: install it on a test instance only. */
public class BimDocWitnessCommand implements CommandProvider
{
	public void _bimdocwitness (CommandInterpreter ci)
	{
		ByteArrayOutputStream buf = new ByteArrayOutputStream();
		try (PrintStream ps = new PrintStream (buf, true, "UTF-8"))
		{
			WBimDocumentLegacy.run (ps);
		}
		catch (Throwable t)
		{
			ci.println ("§W-BIMDOC-LEGACY ERROR " + t);
		}
		try { ci.print (buf.toString ("UTF-8")); } catch (Exception e) { ci.println (String.valueOf (e)); }
	}

	@Override
	public String getHelp ()
	{
		return "\tbimdocwitness - run W-BIMDOC-LEGACY (BIM Document model + processes) on this server's database; rolls back\n";
	}
}
