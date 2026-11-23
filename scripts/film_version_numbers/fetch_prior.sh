#!/usr/bin/env bash
# ⚠ DO NOT REMOVE — film 5 "CH 0 · One list writes every page": fetches, at build time, the pages the prior-art rows quote into out/prior/ (guard.js check P reads those copies; they are not committed) and checks the guide link (§FILM_GUIDE).
# One plain GET each, no cookies, nothing about this project sent. Usage: ./fetch_prior.sh      READ the byte counts it prints.
set -eu; cd "$(dirname "$0")"; mkdir -p out/prior
node -e "for (const i of require('./priorart.json').items) console.log(i.where.saved.replace(/^out\/prior\//, '') + ' ' + i.where.url)" | while read -r f u; do
  curl -sL -m 60 -A "film-prior-art-fetch" -o "out/prior/$f" "$u"; echo "§PRIOR_FETCH $f $(wc -c < "out/prior/$f") bytes <- $u"; done
# the guide link: HTTP 200 and the anchor id present in the fetched page (HOUSE STYLE: ALWAYS GIVE A GUIDE LINK)
GU=$(node -e "console.log(JSON.parse(require('fs').readFileSync('out/facts.json','utf8')).guide.url)"); PAGE="${GU%%#*}"; ANCH="${GU##*#}"
CODE=$(curl -sL -m 60 -A "film-prior-art-fetch" -o out/prior/guide.html -w '%{http_code}' "$PAGE"); if grep -q "id=\"$ANCH\"" out/prior/guide.html; then AN=Y; else AN=N; fi
echo "§FILM_GUIDE url=$GU http=$CODE anchor=$AN"
