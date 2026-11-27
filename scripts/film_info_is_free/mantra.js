// ⚠ DO NOT REMOVE — film "Information is Free": the mantra, read from the SPEC (prompts/FILM_INFORMATION_IS_FREE.md §1, the fenced block under "Primary source"), never retyped. cards.js renders these lines; guard.js compares the rendered DOM text to a fresh parse.
'use strict';
const fs = require('fs'), path = require('path');
exports.parse = () => { const t = fs.readFileSync(path.join(__dirname, '../../prompts/FILM_INFORMATION_IS_FREE.md'), 'utf8'), m = /## 1\. The mantra[^\n]*\n[\s\S]*?```\n([\s\S]*?)\n```/.exec(t); if (!m) throw new Error('mantra block not found in the spec'); return m[1].split('\n'); };
