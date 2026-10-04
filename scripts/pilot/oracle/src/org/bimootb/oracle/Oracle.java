// ⚠ DO NOT REMOVE — scope: CALLOUT/PROCESS ORACLE (see Activator.java). Pilot server only (DB idempiere_pilot).
// Protocol: POST http://127.0.0.1:8097/  body = JSON request, response = JSON. One request at a time.
//   op=callout : {window, tab, parents:[{tab,id}], id?(edit existing row), ctx:{client,org,role,user,wh,date},
//                 steps:[{set:Column, value:v}]}  → {afterNew:{col:val}, steps:[{set,value,msg,fields,trace}], ctxWin:{...}}
//   op=process : {process(AD_Process_ID), recordId?, tableId?, params:[{name, value, valueTo?}], ctx}
//                → {ok, summary, error, logs:[...], pinstance}
//   op=sql     : {sql} read-only SELECT helper (returns rows) — used to stamp reference ids.
// Every value crosses as text for money (BigDecimal.toPlainString), "yyyy-MM-dd HH:mm:ss" for dates, Y/N for booleans.
package org.bimootb.oracle;

import java.io.*;
import java.math.BigDecimal;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.*;

import org.adempiere.base.Core;
import org.adempiere.util.ServerContext;
import org.compiere.model.*;
import org.compiere.process.ProcessInfo;
import org.compiere.process.ProcessInfoParameter;
import org.compiere.process.ProcessInfoLog;
import org.compiere.util.*;
import org.adempiere.util.ProcessUtil;
import org.json.*;

public class Oracle implements Runnable {
	private ServerSocket server;
	private Thread thread;
	private volatile boolean running = true;
	private static int windowSeq = 7000;

	public void start() throws IOException {
		server = new ServerSocket();
		server.bind(new InetSocketAddress(InetAddress.getByName("127.0.0.1"), 8097));
		thread = new Thread(this, "bimootb-oracle");
		thread.setDaemon(true);
		thread.start();
		System.out.println("§ORACLE listening 127.0.0.1:8097");
	}
	public void stop() throws IOException { running = false; if (server != null) server.close(); }

	public void run() {
		while (running) {
			try (Socket s = server.accept()) {
				s.setSoTimeout(600000);
				InputStream in = s.getInputStream();
				String head = readHead(in);
				int len = 0;
				for (String line : head.split("\r\n")) {
					if (line.toLowerCase().startsWith("content-length:")) len = Integer.parseInt(line.substring(15).trim());
				}
				byte[] body = in.readNBytes(len);
				String resp;
				try {
					JSONObject req = new JSONObject(new String(body, StandardCharsets.UTF_8));
					resp = handle(req).toString();
				} catch (Throwable t) {
					StringWriter sw = new StringWriter(); t.printStackTrace(new PrintWriter(sw));
					resp = new JSONObject().put("ok", false).put("error", t.toString()).put("stack", sw.toString()).toString();
				}
				byte[] out = resp.getBytes(StandardCharsets.UTF_8);
				OutputStream os = s.getOutputStream();
				os.write(("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: " + out.length + "\r\nConnection: close\r\n\r\n").getBytes(StandardCharsets.UTF_8));
				os.write(out);
				os.flush();
			} catch (Throwable t) {
				if (running) t.printStackTrace();
			}
		}
	}

	private static String readHead(InputStream in) throws IOException {
		ByteArrayOutputStream b = new ByteArrayOutputStream();
		int c, state = 0;
		while ((c = in.read()) >= 0) {
			b.write(c);
			if ((state == 0 || state == 2) && c == '\r') state++;
			else if ((state == 1 || state == 3) && c == '\n') { state++; if (state == 4) break; }
			else state = 0;
		}
		return b.toString(StandardCharsets.ISO_8859_1);
	}

	private Properties login(JSONObject c) {
		Properties ctx = new Properties();
		int client = c.optInt("client", 11), org = c.optInt("org", 11), role = c.optInt("role", 102), user = c.optInt("user", 101), wh = c.optInt("wh", 103);
		Env.setContext(ctx, Env.AD_CLIENT_ID, client);
		Env.setContext(ctx, Env.AD_ORG_ID, org);
		Env.setContext(ctx, Env.AD_ROLE_ID, role);
		Env.setContext(ctx, Env.AD_USER_ID, user);
		Env.setContext(ctx, Env.M_WAREHOUSE_ID, wh);
		Env.setContext(ctx, Env.LANGUAGE, "en_US");
		Env.setContext(ctx, "#AD_Language", "en_US");
		ServerContext.setCurrentInstance(ctx);
		Timestamp date = c.has("date") ? Timestamp.valueOf(c.getString("date").length() == 10 ? c.getString("date") + " 00:00:00" : c.getString("date")) : null;
		Login login = new Login(ctx);
		String err = login.loadPreferences(new KeyNamePair(org, "org"), new KeyNamePair(wh, "wh"), date, null);
		if (err != null && err.length() > 0) System.out.println("§ORACLE loadPreferences " + err);
		return ctx;
	}

	private JSONObject handle(JSONObject req) throws Exception {
		String op = req.optString("op", "callout");
		Properties ctx = login(req.optJSONObject("ctx") == null ? new JSONObject() : req.getJSONObject("ctx"));
		try {
			if ("callout".equals(op)) return callout(ctx, req);
			if ("process".equals(op)) return process(ctx, req);
			if ("sql".equals(op)) return sql(req);
			if ("ctx".equals(op)) return ctxDump(ctx);
			throw new IllegalArgumentException("unknown op " + op);
		} finally {
			ServerContext.dispose();
		}
	}

	private static JSONObject ctxDump(Properties ctx) {
		JSONObject o = new JSONObject();
		for (String k : ctx.stringPropertyNames()) o.put(k, ctx.getProperty(k));
		return new JSONObject().put("ok", true).put("ctx", o);
	}

	private static final SimpleDateFormat TS = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	static Object toJson(Object v) {
		if (v == null) return JSONObject.NULL;
		if (v instanceof BigDecimal) return ((BigDecimal) v).toPlainString();
		if (v instanceof Timestamp) return TS.format((Timestamp) v);
		if (v instanceof java.util.Date) return TS.format((java.util.Date) v);
		if (v instanceof Boolean) return ((Boolean) v) ? "Y" : "N";
		if (v instanceof Integer || v instanceof Long) return v;
		return v.toString();
	}
	static Object fromJson(GridField f, Object v) {
		if (v == null || v == JSONObject.NULL) return null;
		int dt = f.getDisplayType();
		String s = v.toString();
		if (dt == DisplayType.YesNo) return Boolean.valueOf("Y".equals(s) || "true".equals(s));
		if (DisplayType.isID(dt) || dt == DisplayType.Integer) return s.length() == 0 ? null : Integer.valueOf(new BigDecimal(s).intValue());
		if (DisplayType.isNumeric(dt)) return s.length() == 0 ? null : new BigDecimal(s);
		if (DisplayType.isDate(dt)) return s.length() == 0 ? null : Timestamp.valueOf(s.length() == 10 ? s + " 00:00:00" : s);
		return s;
	}
	static JSONObject snapshot(GridTab t) {
		JSONObject o = new JSONObject();
		for (GridField f : t.getFields()) o.put(f.getColumnName(), toJson(f.getValue()));
		return o;
	}

	// lookupMiss — the editable lookup fields whose current Integer value is NOT in the refreshed, validated list: exactly the
	// fields WTableDirEditor.setValue would reset to null (lookup.refresh() → refreshList, value not selected → setValue(null)).
	// MLookup.getData(mandatory, onlyValidated=true, onlyActive=true, temporary=false, shortlist) is the list the editor shows.
	static JSONArray lookupMiss(GridTab t) {
		JSONArray miss = new JSONArray();
		for (GridField f : t.getFields()) {
			try {
				if (!f.isDisplayed() || f.isReadOnly() || f.getDisplayType() == DisplayType.ID) continue;
				Object v = f.getValue();
				if (!(v instanceof Integer)) continue;
				Lookup lk = f.getLookup();
				if (!(lk instanceof MLookup)) continue;
				MLookup ml = (MLookup) lk;
				ml.refresh();
				boolean in = false;
				for (Object o : ml.getData(f.isMandatory(false), true, true, false, ml.isShortList()))
					if (o instanceof KeyNamePair && ((KeyNamePair) o).getKey() == ((Integer) v).intValue()) { in = true; break; }
				if (!in) miss.put(f.getColumnName());
			} catch (Exception e) { /* a lookup that cannot load is not judged */ }
		}
		return miss;
	}

	private JSONObject callout(Properties ctx, JSONObject req) throws Exception {
		int windowNo = ++windowSeq;
		GridWindow gw = GridWindow.get(ctx, windowNo, req.getInt("window"));
		if (gw == null) throw new IllegalArgumentException("no window " + req.get("window"));
		JSONArray parents = req.optJSONArray("parents");
		if (parents != null) for (int i = 0; i < parents.length(); i++) {
			JSONObject p = parents.getJSONObject(i);
			int ti = p.getInt("tab");
			gw.initTab(ti);
			GridTab pt = gw.getTab(ti);
			pt.setQuery(MQuery.getEqualQuery(pt.getKeyColumnName(), p.getInt("id")));
			pt.query(false);
			if (pt.getRowCount() < 1) throw new IllegalArgumentException("parent tab " + ti + " row " + p.get("id") + " not found");
			pt.setCurrentRow(0, true);
		}
		int ti = req.getInt("tab");
		gw.initTab(ti);
		final GridTab t = gw.getTab(ti);
		final JSONArray trace = new JSONArray();
		final JSONArray msgs = new JSONArray();
		// ADTabpanel.dataStatusChanged:1692-1712 — the UI's cascade, headless.
		t.addDataStatusListener(new DataStatusListener() {
			public void dataStatusChanged(DataStatusEvent e) {
				if (e.isInitEdit()) return;
				int col = e.getChangedColumn();
				if (col < 0) return;
				GridField mField = t.getField(col);
				if (mField != null && (mField.getCallout().length() > 0
						|| Core.findCallout(t.getTableName(), mField.getColumnName()).size() > 0
						|| t.hasDependants(mField.getColumnName()))) {
					trace.put(mField.getColumnName() + "=" + toJson(mField.getValue()));
					String msg = t.processFieldChange(mField);
					if (msg != null && msg.length() > 0) msgs.put(mField.getColumnName() + ":" + msg);
				}
			}
		});
		JSONObject out = new JSONObject().put("ok", true).put("windowNo", windowNo).put("table", t.getTableName());
		if (req.has("id")) {
			t.setQuery(MQuery.getEqualQuery(t.getKeyColumnName(), req.getInt("id")));
			t.query(false);
			if (t.getRowCount() < 1) throw new IllegalArgumentException("row " + req.get("id") + " not found");
			t.setCurrentRow(0, true);
			out.put("afterOpen", snapshot(t));
		} else {
			// openQuery (opt-in): the window opens on its tab query (newest row current), as ZK does, so the window
			// context (e.g. IsSOTrx from AD_Window) is not wiped by an empty current row before New.
			boolean openQuery = req.optBoolean("openQuery", false);
			if (!t.isDetail() && !openQuery) { MQuery q = new MQuery(t.getTableName()); q.addRestriction("1=2"); t.setQuery(q); }
			if (openQuery && !t.isDetail()) { t.query(false, 0, 1); if (t.getRowCount() > 0) t.setCurrentRow(0, true); }
			else t.query(false);
			boolean ok = t.dataNew(false);
			out.put("dataNew", ok);
			out.put("afterNew", snapshot(t));
			out.put("newTrace", new JSONArray(trace.toList()));
			JSONObject cn = new JSONObject();                   // window context right after New (incl. keys the dataNew callout fan set)
			String pre0 = windowNo + "|";
			for (String k : ctx.stringPropertyNames()) if (k.startsWith(pre0)) cn.put(k.substring(pre0.length()), ctx.getProperty(k));
			out.put("ctxAfterNew", cn);
		}
		JSONArray steps = req.optJSONArray("steps");
		JSONArray sOut = new JSONArray();
		if (steps != null) for (int i = 0; i < steps.length(); i++) {
			JSONObject st = steps.getJSONObject(i);
			while (trace.length() > 0) trace.remove(0);
			while (msgs.length() > 0) msgs.remove(0);
			GridField f = t.getField(st.getString("set"));
			if (f == null) { sOut.put(new JSONObject().put("set", st.getString("set")).put("error", "NoField")); continue; }
			Object v = fromJson(f, st.opt("value"));
			String r = t.setValue(f, v);
			sOut.put(new JSONObject().put("set", f.getColumnName()).put("value", toJson(v)).put("setResult", r)
					.put("msgs", new JSONArray(msgs.toList())).put("trace", new JSONArray(trace.toList())).put("fields", snapshot(t))
					.put("lookupMiss", req.optBoolean("lookupMiss", false) ? lookupMiss(t) : new JSONArray()));
		}
		out.put("steps", sOut);
		JSONObject cw = new JSONObject();
		String pre = windowNo + "|";
		for (String k : ctx.stringPropertyNames()) if (k.startsWith(pre)) cw.put(k.substring(pre.length()), ctx.getProperty(k));
		out.put("ctxWin", cw);
		t.dataIgnore();
		Env.clearWinContext(ctx, windowNo);
		return out;
	}

	private JSONObject process(Properties ctx, JSONObject req) throws Exception {
		int procId = req.getInt("process");
		MProcess proc = MProcess.get(ctx, procId);
		int recordId = req.optInt("recordId", 0);
		int tableId = req.optInt("tableId", 0);
		ProcessInfo pi = new ProcessInfo(proc.getName(), procId, tableId, recordId);
		pi.setAD_Client_ID(Env.getAD_Client_ID(ctx));
		pi.setAD_User_ID(Env.getAD_User_ID(ctx));
		pi.setClassName(proc.getClassname());
		MPInstance inst = new MPInstance(ctx, procId, tableId, recordId, null);
		inst.saveEx();
		pi.setAD_PInstance_ID(inst.getAD_PInstance_ID());
		JSONArray ps = req.optJSONArray("params");
		List<ProcessInfoParameter> list = new ArrayList<>();
		if (ps != null) for (int i = 0; i < ps.length(); i++) {
			JSONObject p = ps.getJSONObject(i);
			list.add(new ProcessInfoParameter(p.getString("name"), conv(p.opt("value"), p.optString("type", "")), conv(p.opt("valueTo"), p.optString("type", "")), null, null));
			// AD_PInstance_Para rows, as the UI writes them (ProcessParameterPanel.saveParameters)
			MPInstancePara para = new MPInstancePara(inst, (i + 1) * 10);
			para.setParameterName(p.getString("name"));
			Object v = conv(p.opt("value"), p.optString("type", ""));
			if (v instanceof BigDecimal) para.setP_Number((BigDecimal) v);
			else if (v instanceof Integer) para.setP_Number(new BigDecimal((Integer) v));
			else if (v instanceof Timestamp) para.setP_Date((Timestamp) v);
			else if (v != null) para.setP_String(v.toString());
			para.saveEx();
		}
		pi.setParameter(list.toArray(new ProcessInfoParameter[0]));
		Trx trx = Trx.get(Trx.createTrxName("oracle"), true);
		boolean ok;
		try {
			ok = ProcessUtil.startJavaProcess(ctx, pi, trx, true);
		} finally { trx.close(); }
		JSONArray logs = new JSONArray();
		ProcessInfoLog[] l = pi.getLogs();
		if (l != null) for (ProcessInfoLog x : l) logs.put(new JSONObject().put("id", x.getP_ID()).put("date", toJson(x.getP_Date())).put("number", toJson(x.getP_Number())).put("msg", x.getP_Msg() == null ? JSONObject.NULL : x.getP_Msg()));
		return new JSONObject().put("ok", ok && !pi.isError()).put("summary", pi.getSummary()).put("isError", pi.isError()).put("logs", logs).put("pinstance", inst.getAD_PInstance_ID()).put("classname", proc.getClassname());
	}
	static Object conv(Object v, String type) {
		if (v == null || v == JSONObject.NULL) return null;
		String s = v.toString();
		if ("int".equals(type)) return Integer.valueOf(s);
		if ("num".equals(type)) return new BigDecimal(s);
		if ("date".equals(type)) return Timestamp.valueOf(s.length() == 10 ? s + " 00:00:00" : s);
		if (v instanceof Integer) return v;
		return s;
	}

	private JSONObject sql(JSONObject req) throws Exception {
		String sql = req.getString("sql");
		if (!sql.trim().toLowerCase().startsWith("select")) throw new IllegalArgumentException("read-only");
		JSONArray rows = new JSONArray();
		try (PreparedStatement ps = DB.prepareStatement(sql, null); ResultSet rs = ps.executeQuery()) {
			ResultSetMetaData md = rs.getMetaData();
			while (rs.next()) {
				JSONObject r = new JSONObject();
				for (int i = 1; i <= md.getColumnCount(); i++) r.put(md.getColumnName(i).toLowerCase(), toJson(rs.getObject(i)));
				rows.put(r);
			}
		}
		return new JSONObject().put("ok", true).put("rows", rows);
	}
}
