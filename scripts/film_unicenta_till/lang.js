// ⚠ DO NOT REMOVE — Scope: language + directories of the film pipeline (prompts/POS_PLUGIN_LOCAL_FIRST.md §34.G). FILM_LANG=en (default) | zh | ms.
// SHARED = out/ (facts.resolved.json, pdf crops, rec/ = the recorded clips: the product's own UI, the same in every language). OUT = this language's cards/asm/work/logs (en: out/, zh: out_zh/, ms: out_ms/).
'use strict';
const path = require('path'), LANG = ['zh', 'ms'].includes(process.env.FILM_LANG) ? process.env.FILM_LANG : 'en', SHARED = path.join(__dirname, 'out');
module.exports = { LANG, SHARED, OUT: LANG === 'en' ? SHARED : path.join(__dirname, 'out_' + LANG) };
