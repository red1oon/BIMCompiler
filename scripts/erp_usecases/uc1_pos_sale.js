// UC-1 — POS cash sale on GardenWorld: New POS Order (Joe Block, HQ) + line (product x qty) + Complete => ONE signed group writes shipment + invoice + stock + postings.
// Spec: prompts/NINJAEXCEL_TEMPLATE_ENGINE.md §UC-SET. Gestures: bim-ootb erp/tests/poc_depth_cycle_live.js:42-72 (DEPTH lane, read-only reuse). Returns §-fact values; throws if the sale does not complete.
'use strict';
module.exports = {
  id: 'UC-1', title: 'POS cash sale (Joe Block, HQ)',
  async enter(h, o) {
    o = o || {}; const qty = o.qty || 1, prod = o.product || /Mulch/, pg = h.pg, NEWB = '#idmp-toolbar [data-tb="new"]';
    await h.openWindow(143);                                                                      // Sales Order
    await h.hc(NEWB); await pg.waitForSelector('#idmp-inline-mount .cfrow'); await pg.waitForTimeout(600);
    await h.pick('c_doctypetarget_id', /^POS Order/); await h.pick('c_bpartner_id', /Joe Block/); await h.pick('ad_org_id', /^HQ/);
    await h.hc('#idmp-toolbar [title^="Save"]'); await pg.waitForTimeout(1800);
    await h.hc('#idmp-tabstrip .idmp-adtab[title="TabLevel 1 · C_OrderLine"]'); await pg.waitForTimeout(1200);
    await h.hc(NEWB); await pg.waitForTimeout(900); await h.pick('m_product_id', prod); await pg.waitForTimeout(800);
    await pg.fill(h.F('qtyentered'), String(qty)); await pg.locator(h.F('qtyentered')).first().blur().catch(() => {}); await pg.waitForTimeout(600);
    await h.hc('#idmp-toolbar [title^="Save"]'); await pg.waitForTimeout(2000);
    await h.hc('#idmp-tabstrip .idmp-adtab[title="TabLevel 0 · C_Order"]'); await pg.waitForTimeout(1000);
    await h.hc('#idmp-toolbar [data-tb="toggle"]'); await pg.waitForTimeout(900);
    const n0 = h.logs.length; await h.hc('[data-doc-action="CO"]'); await pg.waitForTimeout(4500);
    const da = h.logs.slice(n0).filter(l => /§MODEL-DOCACTION table=c_order/.test(l)).pop() || '';
    if (!/ok=true status=CO/.test(da)) throw new Error('UC-1: sale did not complete: ' + da.slice(0, 160));
    const fa = await h.tip('SELECT COUNT(*) AS n, ROUND(SUM(amtacctdr),2) AS dr, ROUND(SUM(amtacctcr),2) AS cr FROM fact_acct WHERE fact_acct_id<0 OR record_id<0');
    return { completed: 'CO', newFactLines: fa[0].n, newDebit: fa[0].dr, newCredit: fa[0].cr, docaction: da.slice(0, 140) };
  }
};
