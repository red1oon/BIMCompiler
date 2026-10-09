#!/bin/sh
# P3 gate: the layer files must contain no app words. SQL "ORDER BY" is excluded. Exit 1 on a hit.
cd "$(dirname "$0")"
hits=$(grep -n -i -E "product|price|stock|asset|ticket|c_bpartner|m_product|c_order|orderline|\border\b" store.js doc_writer.js pusher.js ad_client.js changelog_tracker.js replay.js reconcile.js dict_diff.js | grep -v -i "order by" | grep -v -E "^[a-z_.]+:[0-9]+:\s*//")
if [ -n "$hits" ]; then echo "§GENERICITY FAIL"; echo "$hits"; exit 1; fi
echo "§GENERICITY PASS (8 layer files, no app words)"
