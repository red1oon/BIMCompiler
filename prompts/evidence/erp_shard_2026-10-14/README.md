# Evidence — ERP large-client shard exercise, 2026-10-14
Local `build/erp/logs/` is gitignored (and `docs/internal/` ignores non-markdown), so the logs the spec (`docs/internal/ERP_SHARD_GENERATOR.md` §9–§15) cites are copied here. Plain text, read-only record.
- `runs/` — one file per run (`*.log.txt` = the original `*.log`; `fid_*` fidelity, `split*`/`shard_write*` split+writer, `load_*` host load, `phone_*`/`range_*` browser proxy + real phone via demo-server logs, `migrate_*` loader, `bloat10r_build.log` bed).
- `helpers/` — throw-away probes used for specific findings (`mk.js` slim-schema open-cost test, `tap*.js` puppeteer tap of the demo page, `pgq.sql` PG-side timings, `wide.sql` wide-numeric scan).
- Scratch DATA (not in git, ~37 GB): `/home/red1/erp_shard_bed/` — see `prompts/ERP_LARGE_CLIENT_SHARDING.md` for the file list and how to rebuild.
