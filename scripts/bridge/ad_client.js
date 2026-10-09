// Bridge transport: iDempiere ADInterface (stock WebServices), JSON form. Spec: prompts/SQLiteIDEMPIERE.md §2/§12.
// Stateless login per call (login fields ride in every request). No plugin-specific code lives here.
'use strict';
const PATH = '/ADInterface/services/rest/model_adservice/';

function cfgFromEnv(env = process.env) {
  return {
    base: env.BRIDGE_BASE || 'http://localhost:8088',
    login: {
      user: env.BRIDGE_USER || 'GardenAdmin', pass: env.BRIDGE_PASS || 'GardenAdmin', lang: 'en_US',
      ClientID: +(env.BRIDGE_CLIENT || 11), RoleID: +(env.BRIDGE_ROLE || 102),
      OrgID: +(env.BRIDGE_ORG || 11), WarehouseID: +(env.BRIDGE_WH || 103), stage: 0,
    },
  };
}

// method: query_data | create_data | update_data | read_data | set_docaction | run_process
async function call(cfg, method, body) {
  const key = method === 'set_docaction' ? 'ModelSetDocActionRequest' : 'ModelCRUDRequest';
  const payload = { [key]: { ...body, ADLoginRequest: cfg.login } };
  const res = await fetch(cfg.base + PATH + method, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  const txt = await res.text();
  let j; try { j = JSON.parse(txt); } catch { throw new Error(`§AD_HTTP ${res.status} non-JSON: ${txt.slice(0, 200)}`); }
  if (j.status === '500' || j.message) throw new Error(`§AD_FAULT ${method}: ${j.message || txt.slice(0, 200)}`);
  const sr = j.StandardResponse;
  if (sr && sr['@IsError']) throw new Error(`§AD_ERROR ${method}: ${sr.Error}`);
  return j;
}

// WindowTabData -> [{col: val}]  (single DataRow arrives as object, none as absent)
function rows(j) {
  const w = j.WindowTabData;
  if (!w) return [];
  if (w.Error) throw new Error(`§AD_ERROR ${w.Error}`);
  let dr = w.DataSet && w.DataSet.DataRow;
  if (!dr) return [];
  if (!Array.isArray(dr)) dr = [dr];
  return dr.map(r => {
    const o = {};
    for (const f of [].concat(r.field || [])) o[f['@column']] = (f.val && typeof f.val === 'object' && f.val['@nil']) ? null : f.val;
    return o;
  });
}

async function query(cfg, serviceType, filter) {
  const j = await call(cfg, 'query_data', { ModelCRUD: { serviceType, Filter: filter } });
  const total = j.WindowTabData && j.WindowTabData['@TotalRows'];
  const r = rows(j);
  if (total != null && +total !== r.length) throw new Error(`§AD_PAGED total=${total} got=${r.length} — paging not handled`);
  return r;
}

module.exports = { cfgFromEnv, call, rows, query };
