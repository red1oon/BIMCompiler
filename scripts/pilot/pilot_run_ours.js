// ⚠ DO NOT REMOVE — scope: ERP parallel-run pilot; read the log after every run.
// pilot_run_ours.js <scenario.json> <out.json> — run the SAME scenario steps through OUR ERP's UI (pilot_ours.js) and dump the
// op-log delta (every signed op our ERP wrote) + per-step field set results. Fields the form cannot take are reported, not faked.
'use strict';
const fs = require('fs'), O = require('./pilot_ours');
(async () => {
  const sc = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); const out = { steps: [], ops: [], fieldGaps: [], errs: [] };
  const o = await O.start(); const ids = {};
  try {
    out.ops0 = 0;   // fresh browser context = empty IndexedDB op-log
    for (const [i, s] of sc.steps.entries()) {
     try {
      const ui = s.ui || {}; const n0 = o.LOG.length; const st = { n: i, op: s.op, table: s.table, as: s.as };
      if (s.op === 'create') {
        await O.openWin(o, ui.window);
        if (ui.tab) {   // detail tab: select the parent record in the master grid first, then the tab
          await o.page.evaluate((pid) => { const tr = [...document.querySelectorAll('.idmp-grid tbody tr[data-ad-record]')].find(x => Number(x.getAttribute('data-ad-record')) === pid); if (tr) tr.click(); }, ids[ui.parent]);
          await o.page.waitForTimeout(900);
          await o.page.click('#idmp-tabstrip >> text=' + ui.tab); await o.page.waitForTimeout(900);
        }
        await O.clickNew(o);
        const res = {}; const order = Object.keys(s.fields);
        // user-entry order: FK drivers first (bpartner/doctype/product) so callouts run, then the rest override; relational keys skipped
        const drivers = ['c_bpartner_id', 'c_doctypetarget_id', 'm_product_id'];
        const keys = order.map(k => k.toLowerCase()); const seq = drivers.filter(d => keys.includes(d)).concat(keys.filter(k => !drivers.includes(k)));
        for (const k of seq) {
          const orig = order.find(x => x.toLowerCase() === k); let v = s.fields[orig];
          if (typeof v === 'string' && v[0] === '@') {
            if (v.slice(1) === ui.parent) { res[k] = 'PARENT-LINK(auto)'; continue; }   // master->detail FK is supplied by the window
            const lid = ids[v.slice(1)]; res[k] = lid == null ? 'LINK-UNRESOLVED' : await O.setField(o, k, lid); continue;   // cross-doc link: only if the form offers the field
          }
          if (/^ad_client_id$/.test(k)) continue;
          res[k] = await O.setField(o, k, v);
        }
        st.fieldResults = res; Object.entries(res).forEach(([k, v]) => { if (/NO-FIELD|NO-OPTION|READONLY|LINK-UNRESOLVED/.test(v)) out.fieldGaps.push({ step: i, table: s.table, col: k, why: v }); });
        st.formBeforeSave = await O.readForm(o);
        await O.save(o);
        const sel = o.last(n0, /§CRUD-CREATE-SEL table=/); const m = /id=(-?\d+)/.exec(sel); ids[s.as] = m ? Number(m[1]) : null;
        st.persist = o.last(n0, /§CRUD-PERSIST/).slice(0, 200); st.validate = o.since(n0, /§CRUD validate/).slice(-2);
      } else if (s.op === 'docaction') {
        await O.openWin(o, ui.window);
        await o.page.evaluate((id) => { const tr = [...document.querySelectorAll('.idmp-grid tbody tr[data-ad-record]')].find(x => Number(x.getAttribute('data-ad-record')) === id); if (tr) tr.click(); }, ids[s.ref]);
        await o.page.waitForTimeout(900);
        st.actions = await o.page.$$eval('[data-doc-action]', e => e.map(x => x.getAttribute('data-doc-action')));
        if (!st.actions.includes(s.action)) { st.result = 'ACTION-NOT-OFFERED'; }
        else { await o.page.click('[data-doc-action="' + s.action + '"]'); await o.page.waitForTimeout(3500); st.result = 'clicked'; }
      }
      st.logs = o.LOG.slice(n0).filter(l => /^§(CRUD|SO-|GL-POST|FS|RECEIPT|INVOICE|DOCNO|AD-DOCFSM|FANOUT)/.test(l)).map(l => l.slice(0, 300));
      out.steps.push(st); console.log('§PILOT-OURS-STEP n=' + i + ' op=' + s.op + ' table=' + s.table + ' id=' + ids[s.as || s.ref] + ' ' + (st.result || '') + ' fieldGaps=' + (out.fieldGaps.filter(g => g.step === i).map(g => g.col + ':' + g.why).join(',') || 'none'));
     } catch (e) { out.steps.push({ n: i, op: s.op, table: s.table, error: e.message.split('\n')[0] }); console.log('§PILOT-OURS-STEP n=' + i + ' op=' + s.op + ' table=' + s.table + ' INCONCLUSIVE step-error=' + e.message.split('\n')[0].slice(0, 160)); }
    }
    await o.page.waitForTimeout(1500);
    const all = await O.allOps(o); out.ops = Array.isArray(all) ? all.slice(out.ops0) : all;
    out.errs = o.ERRS; out.ids = ids;
  } catch (e) { out.fatal = e.message; console.log('§PILOT-OURS FATAL ' + e.message); }
  fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
  console.log('§PILOT-OURS-RUN ops=' + (Array.isArray(out.ops) ? out.ops.length : out.ops) + ' pageerrors=' + out.errs.length + ' fatal=' + (out.fatal || 'no'));
  await o.close();
})();
