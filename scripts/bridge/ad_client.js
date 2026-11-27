// Bridge transport: iDempiere ADInterface (stock WebServices), JSON form. Spec: prompts/SQLiteIDEMPIERE.md §2/§12.
// Stateless login per call (login fields ride in every request). No plugin-specific code lives here.
'use strict';
const PATH = '/ADInterface/services/rest/model_adservice/';

function cfgFromEnv(env = process.env) {
  const base = env.BRIDGE_BASE || 'http://localhost:8088';
  const local = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(base);
  // P11: no credential defaults except for the localhost pilot (GardenWorld seed login)
  if (!local && !(env.BRIDGE_USER && env.BRIDGE_PASS)) throw new Error('§CFG BRIDGE_USER/BRIDGE_PASS required for non-localhost base');
  return {
    base,
    login: {
      user: env.BRIDGE_USER || 'GardenAdmin', pass: env.BRIDGE_PASS || 'GardenAdmin', lang: 'en_US',
      ClientID: +(env.BRIDGE_CLIENT || 11), RoleID: +(env.BRIDGE_ROLE || 102),
      OrgID: +(env.BRIDGE_ORG || 11), WarehouseID: +(env.BRIDGE_WH || 103), stage: 0,
    },
  };
}

// method: query_data | create_data | update_data | read_data | set_docaction | run_process
// typed failure: kind = NOT_SENT (provably never reached the server) | AMBIGUOUS (may have been processed) | AUTH | FAULT
function bridgeError(kind, msg) { const e = new Error(msg); e.kind = kind; return e; }
const NOT_SENT_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ECONNRESET_BEFORE']);

async function post(cfg, path, payload, timeoutMs = 30000) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), timeoutMs);
  let res, txt;
  try {
    res = await fetch(cfg.base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload), signal: ac.signal });
    txt = await res.text();
  } catch (e) {
    const code = e.cause && e.cause.code;
    const never = NOT_SENT_CODES.has(code) || /bad port/i.test(String(e.cause && e.cause.message));
    throw bridgeError(never ? 'NOT_SENT' : 'AMBIGUOUS', `§AD_NET ${code || e.name}: ${e.message}`);
  } finally { clearTimeout(t); }
  let j; try { j = JSON.parse(txt); } catch { throw bridgeError('AMBIGUOUS', `§AD_HTTP ${res.status} non-JSON: ${txt.slice(0, 200)}`); }
  return j;
}

// Composite = ONE server transaction (verified on pilot: failure ⇒ @IsRolledBack, nothing persisted). operations: [{TargetPort, ModelCRUD|ModelSetDocAction|ModelRunProcess}]
async function composite(cfg, serviceType, operations) {
  const j = await post(cfg, '/ADInterface/services/rest/composite_service/composite_operation',
    { CompositeRequest: { ADLoginRequest: cfg.login, serviceType, operations: { operation: operations } } });
  if (j.status === '500' || j.message) throw bridgeError('FAULT', `§AD_FAULT composite: ${j.message}`);
  const r = [].concat((j.CompositeResponses && j.CompositeResponses.CompositeResponse && j.CompositeResponses.CompositeResponse.StandardResponse) || []);
  const bad = r.find(x => x['@IsError']);
  if (bad && /Error log(ging )?in/i.test(bad.Error || '')) throw bridgeError('AUTH', `§AD_AUTH ${bad.Error}`);
  return { ok: !bad, rolledBack: r.some(x => x['@IsRolledBack']), error: bad && bad.Error, ids: r.map(x => x['@RecordID']).filter(x => x != null), raw: r };
}

// Stock set_docaction as its own server transaction, classified like composite (NOT_SENT | AMBIGUOUS | AUTH | FAULT); spec §D7. ok=false carries the server's text.
async function docAction(cfg, serviceType, tableName, recordID, action) {
  const j = await post(cfg, PATH + 'set_docaction', { ModelSetDocActionRequest: { ModelSetDocAction: { serviceType, tableName, recordID, docAction: action }, ADLoginRequest: cfg.login } });
  if (j.status === '500' || j.message) throw bridgeError('FAULT', `§AD_FAULT set_docaction: ${j.message}`);
  const sr = j.StandardResponse || {};
  if (sr['@IsError'] && /Error log(ging )?in/i.test(sr.Error || '')) throw bridgeError('AUTH', `§AD_AUTH ${sr.Error}`);
  return { ok: !sr['@IsError'], error: sr['@IsError'] ? sr.Error : null, raw: sr };
}

// Stock run_process (ModelRunProcess). params = {Column: value}; recordId -> AD_Record_ID. Returns {ok, error, summary, raw}. Spec §SHOPDAY-RUN-1.
async function runProcess(cfg, serviceType, params, recordId) {
  const field = Object.entries(params || {}).map(([k, v]) => ({ '@column': k, val: String(v) }));
  if (recordId != null) field.push({ '@column': 'AD_Record_ID', val: String(recordId) });   // Process.runProcess reads the record id from the ParamValues field AD_Record_ID (Process.java:236-258)
  const body = { serviceType, ParamValues: { field } };
  if (recordId != null) body.AD_Record_ID = recordId;
  const j = await post(cfg, PATH + 'run_process', { ModelRunProcessRequest: { ModelRunProcess: body, ADLoginRequest: cfg.login } }, 300000);
  if (j.status === '500' || j.message) throw bridgeError('FAULT', `§AD_FAULT run_process: ${j.message}`);
  const r = j.RunProcessResponse || {};
  if (r['@IsError'] && /Error log(ging )?in/i.test(r.Error || '')) throw bridgeError('AUTH', `§AD_AUTH ${r.Error}`);
  return { ok: !r['@IsError'], error: r['@IsError'] ? r.Error : null, summary: r.Summary, logs: r.LogInfo, raw: r };
}

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

module.exports = { cfgFromEnv, runProcess, call, rows, query, composite, docAction, bridgeError };
