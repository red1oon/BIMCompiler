// ⚠ DO NOT REMOVE — Scope: "Think Global, Act Local" rc4 (NEURO_SYMBOLIC_ORDER_CONTRACT.md §18). A SCRIPTED STAND-IN FOR AN AI (owner 2026-11-08: mock an AI
// proposal in a sandbox, no model calls). It sends brief G4 (evidence/brief_G4.json) through the REAL connector (the live bim_mcp.js copy) to the REAL app:
// read the grid, compute 13 - bay by arithmetic, try the shift. The connector's own call log (BIM_MCP_LOG) is the evidence: evidence/session_calls.jsonl.
// Nothing here is an AI and the film says so. Usage: node mock_session.js [path/to/bim_mcp.js]. Prints §MOCK lines. READ THE LOG.
'use strict';
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const SRV = process.argv[2] || path.join(require('os').homedir(), '.local', 'share', 'bim_proposer', 'bim_mcp.js');
const LOG = path.join(__dirname, 'evidence', 'session_calls.jsonl'), B = JSON.parse(fs.readFileSync(path.join(__dirname, 'evidence', 'brief_G4.json'), 'utf8'));
fs.rmSync(LOG, { force: true });
const p = spawn(process.execPath, [SRV], { env: Object.assign({}, process.env, { BIM_MCP_LOG: LOG }), stdio: ['pipe', 'pipe', 'inherit'] }), wait = {}; let buf = '', id = 0;
p.stdout.on('data', d => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i); buf = buf.slice(i + 1); if (l.trim()) { const m = JSON.parse(l); if (wait[m.id]) { wait[m.id](m); delete wait[m.id]; } } } });
const rpc = (method, params) => new Promise((res) => { const k = ++id; wait[k] = res; p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: k, method, params }) + '\n'); });
(async () => {
  await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'film_mock_session (a script, not an AI)', version: '1' } });
  p.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  const [a, b] = B.goal[0] ? [B.goal[0].a, B.goal[0].b] : ['gx5', 'gx6'], target = B.goal[0].target;
  const lr = await rpc('tools/call', { name: 'bim_lines', arguments: { building: B.building } }), lj = JSON.parse(lr.result.content[0].text);
  const pos = (k) => lj.model.lines.filter(l => l.id === k)[0].pos, bay = +(pos(b) - pos(a)).toFixed(3), move = +(target - bay).toFixed(3);
  console.log('§MOCK brief=' + B.id + ' "' + B.text + '" ' + a + '=' + pos(a) + ' ' + b + '=' + pos(b) + ' bay=' + bay + ' -> shift ' + b + ' by ' + move);
  const sr = await rpc('tools/call', { name: 'bim_try_shift', arguments: { building: B.building, line: b, move } }), sj = JSON.parse(sr.result.content[0].text), e0 = sj.edits[0];
  console.log('§MOCK result stopped=' + !!e0.stopped_by_gate + ' reason=' + e0.reason);
  p.stdin.end(); p.on('close', () => { const n = fs.readFileSync(LOG, 'utf8').trim().split('\n').length; console.log('§MOCK done log_lines=' + n + ' -> evidence/session_calls.jsonl ' + (n === 3 && e0.stopped_by_gate ? 'OK' : 'CHECK')); });
})().catch(e => { console.log('§MOCK FAIL ' + (e && e.stack || e)); process.exit(1); });
