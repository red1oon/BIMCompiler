// ⚠ DO NOT REMOVE — MODEL-AS-DATA witness (spec §54): a SECOND, structurally different model (Inventory Move: M_Movement + lines, doc-action CO)
// runs through legacy_link with a DESCRIPTOR + WS configuration only. The layer files are untouched (git-checked below). READ THE LOG.
//  §MODEL_DATA_ONLY  `git diff` shows no change in the layer files since the commit this witness was written against (frozen adapter)
//  §MODEL_MOVE       submit → drain: ONE composite call; legacy has the movement CO; stock left locator 101 and arrived at 102 (psql oracle)
//  §MODEL_READBACK   the link's own read-back (expect DocStatus=CO) confirmed it; idmap holds header+line ids and legacy's DocumentNo
//  §MODEL_REJECT     a bad line (unknown product) is REJECTED with the server's text and nothing is left on legacy (atomic)
const { execFileSync } = require('child_process');
const { cfgFromEnv } = require('./ad_client');
const { createLink } = require('./legacy_link');
const pg = sql => execFileSync('docker', ['exec', 'postgres', 'psql', '-U', 'postgres', '-d', 'idempiere_pilot', '-Atc', 'set search_path=adempiere; ' + sql]).toString().split('\n').filter(l => l && l !== 'SET');
let fails = 0; const out = (t, ok, m) => { console.log(`${t} ${ok ? 'PASS' : 'FAIL'} ${m}`); if (!ok) fails++; };
const LAYER = 'legacy_link.js ad_client.js store.js doc_writer.js pusher.js changelog_tracker.js replay.js reconcile.js dict_diff.js'.split(' ');

(async () => {
  const cfg = cfgFromEnv(); cfg.login.OrgID = 11; cfg.login.WarehouseID = 103;
  let diff = ''; try { diff = execFileSync('git', ['diff', '--stat', 'HEAD', '--', ...LAYER.map(f => 'scripts/bridge/' + f)], { cwd: require('path').join(__dirname, '..', '..') }).toString().trim(); } catch (e) { diff = 'git-error'; }
  out('§MODEL_DATA_ONLY', diff === '', diff === '' ? `${LAYER.length} layer files have no uncommitted change` : `layer files changed: ${diff}`);

  // the whole "model" = this descriptor (+ pilot/ws_model_movement.sql)
  const D = { move: { composite: 'SyncOrder',
    header: { serviceType: 'BridgeCreateMovement', table: 'M_Movement', fields: { AD_Org_ID: { const: 11 }, C_DocType_ID: { const: 143 }, MovementDate: { path: 'date' }, Description: { path: 'note' } } },
    lines: { serviceType: 'BridgeCreateMovementLine', table: 'M_MovementLine', parent: 'M_Movement_ID', from: 'lines', lineNo: { col: 'Line', step: 10 },
      fields: { AD_Org_ID: { const: 11 }, AD_Client_ID: { const: 11 }, M_Locator_ID: { path: 'from' }, M_LocatorTo_ID: { path: 'to' }, M_Product_ID: { path: 'product' }, MovementQty: { path: 'qty' } } },
    docAction: { serviceType: 'BridgeCompleteMovement', table: 'M_Movement', action: 'CO' },
    expect: { serviceType: 'QueryMMovement', cols: { DocStatus: { const: 'CO' } } } } };
  let bytes = null; const persistence = { load: () => bytes, save: b => { bytes = Uint8Array.from(b); } };
  const link = await createLink({ cfg, persistence, descriptors: D });
  const onhand = loc => +(pg(`select coalesce(sum(qtyonhand),0) from m_storage where m_product_id=137 and m_locator_id=${loc}`)[0]);
  const n0 = +pg('select count(*) from m_movement')[0], a0 = onhand(101), b0 = onhand(102);

  const uid = link.submit('move', { date: '2026-10-09 00:00:00', note: 'bridge model-as-data witness', lines: [{ product: 137, qty: 1, from: 101, to: 102 }] });
  const r = await link.drain();
  const st = link.store.get(uid);
  const mid = (link.store.idmap(uid).find(x => x.tbl === 'M_Movement') || {}).server_id;
  const doc = mid ? pg(`select docstatus, documentno from m_movement where m_movement_id=${mid}`)[0] : '';
  out('§MODEL_MOVE', r.confirmed === 1 && +pg('select count(*) from m_movement')[0] === n0 + 1 && /^CO\|/.test(doc) && onhand(101) === a0 - 1 && onhand(102) === b0 + 1,
    `state=${st.state}${st.error ? ' (' + st.error.slice(0, 120) + ')' : ''} legacy movement ${mid} ${doc} · locator101 ${a0}→${onhand(101)} · locator102 ${b0}→${onhand(102)}`);
  const map = link.store.idmap(uid);
  out('§MODEL_READBACK', st.state === 'CONFIRMED' && map.length === 2 && !!(map.find(x => x.tbl === 'M_Movement') || {}).docno, `idmap=${JSON.stringify(map)}`);

  const n1 = +pg('select count(*) from m_movement')[0];
  const bad = link.submit('move', { date: '2026-10-09 00:00:00', note: 'bad', lines: [{ product: 999999, qty: 1, from: 101, to: 102 }] });
  await link.drain(); const sb = link.store.get(bad);
  out('§MODEL_REJECT', sb.state === 'REJECTED' && /M_Product_ID/.test(sb.error || '') && +pg('select count(*) from m_movement')[0] === n1, `state=${sb.state} (${(sb.error || '').slice(0, 80)}) legacy movements +${+pg('select count(*) from m_movement')[0] - n1}`);
  console.log(`§MODEL_VERDICT ${fails ? 'FAIL' : 'PASS'} fails=${fails}`); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('§MODEL_VERDICT FAIL exception ' + e.stack); process.exit(2); });
