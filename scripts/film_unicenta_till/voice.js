// ⚠ DO NOT REMOVE — Scope: the VOICE text of a caption (prompts/POS_PLUGIN_LOCAL_FIRST.md §34.G; owner 2026-11-05: "ERP is pronounced as single syllable when it should be E-R-P", "pronunciation with A-I and E-R-P").
// The caption keeps the written acronym; the voice text SPELLS the letters. One table, per acronym, per language (the rule is stated in §34.G). Acronyms never spoken in any beat (SODA, EODA, SQL, WASM, HQ, MQ alone) are caption-only; guard.js G6 refuses an uppercase token left in a voice.
'use strict';
const LET = (lang, s) => s.split('').join(lang === 'ms' ? '-' : ' ');   // en/zh: "E R P" (measured by faster-whisper, out/acr); ms: "E-R-P" (PLAYBOOK C Malay: "A-I")
const RULES = [['ERP', l => LET(l, 'ERP')], ['AI', l => LET(l, 'AI')], ['POS', l => LET(l, 'POS')], ['ActiveMQ', l => 'Active' + (l === 'ms' ? '-' : ' ') + LET(l, 'MQ')], ['M.I.T.', l => l === 'en' ? 'M.I.T.' : LET(l, 'MIT')]];
const voiceOf = (txt, lang) => RULES.reduce((t, [k, f]) => t.split(new RegExp('(?<![A-Za-z])' + k.replace(/\./g, '\\.') + '(?![A-Za-z])')).join(f(lang)), txt);
const spokenAcr = txt => RULES.map(([k]) => [k, (txt.match(new RegExp('(?<![A-Za-z])' + k.replace(/\./g, '\\.') + '(?![A-Za-z])', 'g')) || []).length]);
module.exports = { voiceOf, RULES, spokenAcr };
