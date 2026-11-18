#!/usr/bin/env bash
# ⚠ DO NOT REMOVE — film 4 "CH 0 · From an empty folder to a witnessed dev setup": fetches the pages the prior-art rows quote into out/prior/ (guard.js check P reads those copies; they are not committed).
# One plain GET each, no cookies, nothing about this project sent. Usage: ./fetch_prior.sh      READ the byte counts it prints.
set -eu; cd "$(dirname "$0")"; mkdir -p out/prior
node -e "for (const i of require('./priorart.json').items) console.log(i.where.saved.replace(/^out\/prior\//, '') + ' ' + i.where.url)" | while read -r f u; do
  curl -sL -m 60 -A "film-prior-art-fetch" -o "out/prior/$f" "$u"; echo "§PRIOR_FETCH $f $(wc -c < "out/prior/$f") bytes <- $u"; done
