/*
 * BIM OOTB — iDempiere BIM Tab
 * Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
 * SPDX-License-Identifier: MIT
 *
 * Implementing iDempiereOOTB.md §3.5 — Witness: W-BIM-TAB
 *
 * Custom IADTabpanel that embeds the BIM OOTB viewer in an Iframe.
 * Extends ADTabpanel so all GridTab lifecycle (save, refresh, query)
 * is handled by the superclass against C_Project.
 *
 * RENEWED 2026-11-03 (bim-compiler prompts/BIM_OOTB_LEGACY_IDEMPIERE_INTEGRATION.md §8 P3): no URL is typed by hand.
 *   viewer  = SysConfig BIMOOTB_VIEWER_URL (default /bimootb/viewer/viewer.html — the plugin's own web context, same origin as /ADInterface)
 *   db      = the push's link-back in C_Project.Description ("BIM src db=<url>", find_erp_push.js §ZOOM_LINKBACK), else
 *             SysConfig BIMOOTB_BUILDINGS_BASE + C_Project.Value + "_extracted.db" (the CAPEX dashboard's BIM-link rule)
 *   iframe  = viewer?db=<db>&record=<C_Project_ID>&embedded=true   (viewer config.js reads db + record)
 * On IFC drop, the viewer sends a postMessage with the IFC filename; the ZK bridge writes C_Project.Name (unchanged).
 */
package org.idempiere.bimootb;

import java.util.logging.Level;

import org.adempiere.webui.adwindow.ADTabpanel;
import org.adempiere.webui.util.ZKUpdateUtil;
import org.compiere.util.CLogger;
import org.zkoss.zk.ui.event.Event;
import org.zkoss.zk.ui.event.EventListener;
import org.zkoss.zk.ui.util.Clients;
import org.zkoss.zul.Div;
import org.zkoss.zul.Iframe;

public class BIMTabPanel extends ADTabpanel {

    private static final long serialVersionUID = 1L;
    private static final CLogger log = CLogger.getCLogger(BIMTabPanel.class);

    private Iframe iframe;

    @Override
    public void createUI() {
        super.createUI();

        String viewerUrl = getViewerUrl();
        String dbUrl = getBuildingDbUrl();

        if (viewerUrl == null || dbUrl == null) {
            Div instructions = new Div();
            instructions.setStyle(
                "padding: 40px; text-align: center; font-size: 14px; color: #666;"
                + " background: #f9f9f9; border: 1px dashed #ccc; border-radius: 8px;"
                + " margin: 20px;");
            instructions.setSclass("bim-instructions");
            org.zkoss.zul.Label label = new org.zkoss.zul.Label(
                "No BIM model is linked to this project. Push it from the BIM viewer (Find \u203a ERP), "
                + "or set the System Configurator value BIMOOTB_BUILDINGS_BASE.");
            instructions.appendChild(label);
            this.appendChild(instructions);
            return;
        }

        // Build iframe URL with embedded params
        String sep = viewerUrl.contains("?") ? "&" : "?";
        int recordId = getGridTab().getRecord_ID();
        String iframeUrl = viewerUrl + sep
            + "db=" + java.net.URLEncoder.encode(dbUrl, java.nio.charset.StandardCharsets.UTF_8)
            + "&record=" + recordId + "&embedded=true";

        iframe = new Iframe(iframeUrl);
        ZKUpdateUtil.setWidth(iframe, "100%");
        ZKUpdateUtil.setHeight(iframe, "800px");
        iframe.setStyle("border: none; min-height: 600px;");

        this.appendChild(iframe);

        installMessageBridge();

        log.info("§BIM_TAB C_Project_ID=" + recordId + " viewer=" + viewerUrl + " db=" + dbUrl);
    }

    /** Viewer page: SysConfig BIMOOTB_VIEWER_URL, default the plugin's own web context. */
    private String getViewerUrl() {
        String v = org.compiere.model.MSysConfig.getValue("BIMOOTB_VIEWER_URL", "/bimootb/viewer/viewer.html",
            org.compiere.util.Env.getAD_Client_ID(org.compiere.util.Env.getCtx()));
        return (v == null || v.trim().isEmpty()) ? null : v.trim();
    }

    /** Building db: the push's link-back ("BIM src db=<url>" in Description), else BIMOOTB_BUILDINGS_BASE + Value + "_extracted.db"; null when neither. */
    private String getBuildingDbUrl() {
        Object desc = getGridTab().getValue("Description");
        if (desc != null) {
            String d = desc.toString().trim();
            if (d.startsWith("BIM src db=")) { String u = d.substring("BIM src db=".length()).trim(); if (!u.isEmpty()) return u; }
        }
        String base = org.compiere.model.MSysConfig.getValue("BIMOOTB_BUILDINGS_BASE", null,
            org.compiere.util.Env.getAD_Client_ID(org.compiere.util.Env.getCtx()));
        Object value = getGridTab().getValue("Value");
        if (base == null || base.trim().isEmpty() || value == null) return null;
        String b = base.trim();
        return b + (b.endsWith("/") ? "" : "/") + value.toString().trim() + "_extracted.db";
    }

    /**
     * Install the postMessage bridge between the Iframe (viewer) and ZK.
     *
     * Viewer sends:
     *   window.parent.postMessage({
     *       type: 'BIM_IFC_LOADED',
     *       name: 'Block_A.ifc',
     *       elementCount: 12345
     *   }, '*')
     *
     * The JS listener on the ZK desktop receives it and forwards to the
     * server as a ZK event. The server-side handler writes C_Project.Name.
     */
    private void installMessageBridge() {
        // Server-side: listen for the custom event on the iframe widget
        iframe.addEventListener("onBIMMessage", new EventListener<Event>() {
            @Override
            public void onEvent(Event event) throws Exception {
                try {
                    Object rawData = event.getData();
                    if (rawData == null) return;
                    String data = rawData.toString();
                    String ifcName = extractJsonField(data, "name");
                    if (ifcName != null && !ifcName.isEmpty()) {
                        // Strip .ifc extension for cleaner project name
                        if (ifcName.toLowerCase().endsWith(".ifc"))
                            ifcName = ifcName.substring(0, ifcName.length() - 4);
                        getGridTab().setValue("Name", ifcName);
                        getGridTab().dataSave(false);
                        log.info("BIM IFC loaded, C_Project.Name set to: " + ifcName);
                    }
                } catch (Exception e) {
                    log.log(Level.WARNING, "Error handling BIM message", e);
                }
            }
        });

        // Client-side: inject JS that relays postMessage to ZK server
        String iframeUuid = iframe.getUuid();
        Clients.evalJavaScript(
            "window.addEventListener('message', function(e) {"
            + "  if (e.data && e.data.type === 'BIM_IFC_LOADED') {"
            + "    var wgt = zk.$('#" + iframeUuid + "');"
            + "    if (wgt) {"
            + "      zAu.send(new zk.Event(wgt, 'onBIMMessage',"
            + "        JSON.stringify(e.data), {toServer:true}));"
            + "    }"
            + "  }"
            + "});"
        );
    }

    /**
     * Extract a string value from a JSON string without a JSON library.
     * Looks for "field":"value" pattern.
     */
    private String extractJsonField(String json, String field) {
        String key = "\"" + field + "\":\"";
        int start = json.indexOf(key);
        if (start < 0) return null;
        start += key.length();
        int end = json.indexOf("\"", start);
        if (end < 0) return null;
        return json.substring(start, end);
    }
}
