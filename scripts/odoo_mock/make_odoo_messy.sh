#!/usr/bin/env bash
# ⚠ DO NOT REMOVE — builds the scratch Odoo db `odoo_messy` for W-ODOO-MESSY (prompts/MIGRATE_INSTALL_TENANT.md §HARDEN-SPEC). READ THE OUTPUT: one §MESSY line per state.
# A pg_dump copy of odoodemo (the recorded demo fixtures must not drift) + the 8 states of odoo_messy_states.js applied through Odoo's ORM. Re-running drops and rebuilds it.
set -euo pipefail
cd "$(dirname "$0")"
docker exec odoo-db dropdb -U odoo --if-exists odoo_messy
docker exec odoo-db createdb -U odoo odoo_messy
docker exec odoo-db sh -c "pg_dump -U odoo odoodemo | psql -q -U odoo odoo_messy" >/dev/null
docker exec odoo sh -c 'rm -rf /var/lib/odoo/filestore/odoo_messy; cp -r /var/lib/odoo/filestore/odoodemo /var/lib/odoo/filestore/odoo_messy'
for k in M1 M2 M3 M4 M5 M6 M7 M8; do node odoo_messy_states.js "$k"; done
