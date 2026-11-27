// ⚠ DO NOT REMOVE — Scope: prints how often each glossary term (glossary_th.js) is used on screen (cards6_th.js, stage6_th.js, shot_captions_th.json) and in speech (the narration tsv). A term used 0 times in both is dead glossary; speech-only / screen-only are flagged. Read the log: §TH_GLOSSARY_USE.
// usage: node gloss_use_th6.js <narration_th.tsv>
const fs = require('fs'), path = require('path'); const G = require('./glossary_th.js');
const screen = ['cards6_th.js', 'stage6_th.js', 'stage6_th.html', 'shot_captions_th.json'].map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const speech = fs.readFileSync(process.argv[2], 'utf8').split('\n').map(l => l.split('\t')[5] || '').join('\n');
const cnt = (t, x) => t.split(x).length - 1; let dead = 0, only = 0; const terms = G.map(g => g[1].split(' / ')[0]).filter(x => !/^ออฟไลน์/.test(x)).concat(['ออฟไลน์', 'ออนไลน์']);
terms.forEach(x => { const a = cnt(screen, x), b = cnt(speech, x); if (!a && !b) dead++; else if (!a || !b) only++; console.log(`§TH_GLOSSARY_USE ${x} screen=${a} speech=${b}${!a && !b ? ' DEAD' : !a ? ' speech-only' : !b ? ' screen-only' : ''}`); });
console.log(`§TH_GLOSSARY terms=${terms.length} dead=${dead} one-sided=${only}`);
