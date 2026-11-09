// # ⚠ DO NOT REMOVE — SCRIPTED CLIENT, NO AI (W-BIM-MCP M3 label). Speaks MCP over stdio (newline-delimited JSON-RPC 2.0) to a server given on the command line:
// initialize -> notifications/initialized -> tools/list, then prints ONE JSON line {server, tools:[{name, description, inputs}]} to stdout. Nothing is decided here.
'use strict';
const { spawn } = require('child_process');
const p = spawn(process.argv[2], process.argv.slice(3), { stdio: ['pipe', 'pipe', 'inherit'] });
p.on('exit', c => { if (!done) { console.error('§MCP_MENU FAIL server exited ' + c + ' before answering'); process.exit(1); } });
let buf = '', id = 0, done = false; const wait = new Map();
p.stdout.on('data', d => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i); buf = buf.slice(i + 1); if (!l.trim()) continue; const m = JSON.parse(l); if (m.id != null && wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } } });
const rpc = (method, params) => new Promise(res => { const i = ++id; wait.set(i, res); p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: i, method, params }) + '\n'); });
(async () => {
  const init = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'scripted-client-no-ai', version: '1' } });
  p.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  const tl = await rpc('tools/list', {});
  const tools = tl.result.tools.map(t => ({ name: t.name, description: t.description, inputs: Object.fromEntries(Object.entries((t.inputSchema || {}).properties || {}).map(([k, v]) => [k, v.description || v.type])) }));
  console.log(JSON.stringify({ client: 'scripted client, no AI', server: init.result.serverInfo, toolCount: tools.length, tools }));
  done = true; p.stdin.end(); setTimeout(() => process.exit(0), 200);
})().catch(e => { console.error('§MCP_MENU FAIL ' + e.message); process.exit(1); });
