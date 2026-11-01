#!/usr/bin/env node
// ⚠ DO NOT REMOVE — Scope: TEAMWORK_FRAMEWORK.md §45.15 film facts. Every {{fact}} in script_en.md comes from ONE named § line in a persisted log; a fact
// that does not resolve is printed MISSING and the run exits 1 (an unresolved fact blocks the film). Nothing here computes a new number beyond unit rounding.
// Run: node scripts/film_network_erp/resolve.js > scripts/film_network_erp/resolve.log ; writes facts.resolved.json beside it.
'use strict';
const fs = require('fs'), path = require('path');
const B = path.join(__dirname, '..', '..', 'build', 'scriptor'), S = path.join(B, 'sme100_20261102'), T = path.join(B, 'beat10_20261102');
const rd = f => fs.readFileSync(f, 'utf8'), line = (f, re) => { const l = rd(f).split('\n').find(x => re.test(x)); return l || null; };
const F = {}, SRC = {}, miss = [];
function fact(k, file, re, pick) { try { const l = line(file, re); if (!l) throw new Error('no line ' + re); const v = pick(l); if (v == null || v === '' || (typeof v === 'number' && !isFinite(v))) throw new Error('empty'); F[k] = v; SRC[k] = path.relative(path.join(__dirname, '..', '..'), file) + ' :: ' + l.slice(0, 160); } catch (e) { miss.push(k + ' (' + e.message + ')'); } }
const m = (re, l, i) => { const x = re.exec(l); return x ? x[i || 1] : null; };
const sme100 = path.join(S, 'sme_n100_retry.log'), a12 = path.join(S, 'a1a2_n100_retry.log'), fit = path.join(S, 'fit.log'), pre = path.join(S, 'sme_n100.log'), o2c = path.join(T, 'time_o2c.log');
fact('users_max', sme100, /^§STAR-DONE engine /, l => Number(m(/N=(\d+)/, l)) + Number(m(/M=(\d+)/, l)));
fact('burst_s', sme100, /^§SME-HEADER /, l => Number(m(/"burst_ms":(\d+)/, l)) / 1000);
fact('a1_received', a12, /^§A1 N=100/, l => Number(m(/received (\d+)/, l)));
fact('a1_reference', a12, /^§A1 N=100/, l => Number(m(/vs reference (\d+)/, l)));
fact('a1_lost', sme100, /^§SME-VISITS /, l => JSON.parse(l.replace(/^§SME-VISITS /, '')).lost.length);
fact('a1_retried', sme100, /^§STAR-DONE /, () => rd(sme100).split('\n').filter(x => /^§PIPE-RETRY /.test(x)).length);
fact('a1_before_lost', pre, /^§SME-VISITS /, l => JSON.parse(l.replace(/^§SME-VISITS /, '')).lost.length);
fact('a1_devices', sme100, /^§SME-VISITS /, l => JSON.parse(l.replace(/^§SME-VISITS /, '')).devices);
fact('a2_acc', a12, /^§A2 N=100/, l => Number(m(/accepted\/refused (\d+)\//, l)));
fact('feel_bb', fit, /^§FEEL .*`broadband`/, l => m(/ 100:([\d.]+)s/, l));
fact('feel_4g', fit, /^§FEEL .*`4g`/, l => m(/ 100:([\d.]+)s/, l));
fact('feel_poor', fit, /^§FEEL .*`poor`/, l => m(/ 100:([\d.]+)s/, l));
fact('holdout_min', fit, /^§FIT-DONE/, () => Math.min.apply(null, rd(fit).split('\n').filter(x => /^§EXTRAP .* N=500 /.test(x) && !/RANGE|UNTRUSTED/.test(x)).map(x => Number(m(/band ±(\d+)%/, x)))));
fact('holdout_max', fit, /^§FIT-DONE/, () => Math.max.apply(null, rd(fit).split('\n').filter(x => /^§EXTRAP .* N=500 /.test(x) && !/RANGE|UNTRUSTED/.test(x)).map(x => Number(m(/band ±(\d+)%/, x)))));
fact('untrusted_n', fit, /^§FIT-DONE/, () => rd(fit).split('\n').filter(x => /^§EXTRAP .*UNTRUSTED/.test(x)).length);
fact('catchup_1000', fit, /^§EXTRAP edge\.roster_visit_requests_p50 /, l => m(/N=1000 (\d+)/, l));
fact('cliff_shared', fit, /^§CLIFF shared token, 5 pm burst content/, l => m(/N <= (\d+)/, l));
fact('cliff_shared_hi', fit, /^§CLIFF shared token, 5 pm burst points/, l => m(/N <= (\d+)/, l));
fact('cliff_perdev', fit, /^§CLIFF per-device token, own requests/, l => Number(m(/N <= (\d+)/, l)).toLocaleString('en-US'));
fact('o2c_match', o2c, /^§LVL-VERDICT /, () => rd(o2c).split('\n').filter(x => /^§SCN O2C\d-\S+ MATCH/.test(x)).length);
fact('o2c_steps', o2c, /^§LVL-VERDICT /, l => Number(m(/completed_both_sides=\d+\/(\d+)/, l)));
fact('legacy_step_ms_4g', o2c, /^§LVL-PROFILE 4g /, l => m(/legacy >= (\d+) ms vs twin/, l));
fact('legacy_step_ms_poor', o2c, /^§LVL-PROFILE poor /, l => m(/legacy >= (\d+) ms vs twin/, l));
fact('twin_step_ms', o2c, /^§LVL-PROFILE 4g /, l => m(/vs twin (\d+) ms/, l));
fact('legacy_java_mb', o2c, /^§LVL-SERVERS /, l => m(/java RSS=(\d+) MB/, l));
fact('legacy_pg_mb', o2c, /^§LVL-SERVERS /, l => Math.round(Number(m(/postgres ([\d.]+)MiB/, l))));
fact('fit_points', fit, /^§FIT-HEADER /, l => m(/users=([\d,]+)/, l).split(',').join(', '));
fact('holdout_n', fit, /^§HOLDOUT edge\.roster_visit_requests_p50 /, l => m(/predict (\d+):/, l));
fact('extrap_n', fit, /^§EXTRAP edge\.roster_visit_requests_p50 /, l => m(/N=(\d+) \d+ requests/, l));
fact('catchup_err', fit, /^§EXTRAP edge\.roster_visit_requests_p50 /, l => m(/band ±(\d+)%/, l));
fact('legacy_servers', o2c, /^§LVL-SERVERS /, l => m(/legacy needs (\d+) server processes/, l));
const med = path.join(T, 'lvl_median.log');   // §45.15b apple for apple: medians of the sql.js runs, legacy without its per-call login
fact('t_twin', med, /^§LVL-MEDIAN twin=/, l => m(/twin=(\d+)/, l));
fact('l_nl_lan', med, /^§LVL-MEDIAN nl_lan=/, l => m(/nl_lan=(\d+)/, l));
fact('l_nl_4g', med, /^§LVL-MEDIAN nl_4g=/, l => m(/nl_4g=(\d+)/, l));
fact('l_nl_poor', med, /^§LVL-MEDIAN nl_poor=/, l => m(/nl_poor=(\d+)/, l));
fact('l_4g_lo', med, /^§LVL-MEDIAN nl_4g=/, l => m(/range=(\d+)\.\./, l));
fact('l_4g_hi', med, /^§LVL-MEDIAN nl_4g=/, l => m(/\.\.(\d+)/, l));
fact('l_runs', med, /^§LVL-MEDIAN-VERDICT MEASURED/, l => m(/runs=(\d+)/, l));
console.log('§FACTS resolved=' + Object.keys(F).length + ' missing=' + miss.length + (miss.length ? ' ' + JSON.stringify(miss) : ''));
Object.keys(F).forEach(k => console.log('§FACT ' + k + '=' + F[k] + '  ← ' + SRC[k]));
// every {{fact}} used in the storyboard must exist
const used = Array.from(new Set((rd(path.join(__dirname, 'script_en.md')).replace(/<!--[\s\S]*?-->/g, '').match(/\{\{(\w+)\}\}/g) || []).map(x => x.slice(2, -2)))), unk = used.filter(k => !(k in F));
console.log('§FACTS-USED storyboard=' + used.length + ' unresolved=' + unk.length + (unk.length ? ' ' + JSON.stringify(unk) : ''));
fs.writeFileSync(path.join(__dirname, 'facts.resolved.json'), JSON.stringify({ facts: F, sources: SRC }, null, 1));
process.exit(miss.length || unk.length ? 1 : 0);
