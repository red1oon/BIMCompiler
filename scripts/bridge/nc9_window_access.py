#!/usr/bin/env python3
"""§NC-9 witness W-NC9-ACCESS: windows reachable from the menu for a role, LEGACY (pilot psql) vs TWIN (the menu tree the UI shows, from a W-WINDOW-SWEEP log).
legacy = ad_window_access(role, active) ∩ windows with an ACTIVE action='W' ad_menu row; twin = sweep windows whose menu leaf exists in the role's tree (not NOLEAF).
usage: nc9_window_access.py <sweep.log> [role=102]   prints §NC9 lines, exit 1 on any difference. INCONCLUSIVE (exit 2) when a side is empty."""
import re, subprocess, sys
log, role = sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 102
def pg(q): return subprocess.check_output(['docker','exec','postgres','psql','-U','postgres','-d','idempiere_pilot','-tAF|','-c','set search_path=adempiere;'+q]).decode().split('\n')
acc = {int(x) for x in pg(f"select w.ad_window_id from ad_window w join ad_window_access a on a.ad_window_id=w.ad_window_id and a.ad_role_id={role} and a.isactive='Y' where w.isactive='Y'") if x.strip().isdigit()}
menu = {int(x) for x in pg("select distinct ad_window_id from ad_menu where action='W' and isactive='Y' and ad_window_id is not null") if x.strip().isdigit()}
legacy = acc & menu
txt = open(log).read()
noleaf = {int(m.group(1)) for m in re.finditer(r'§SWEEP win=(\d+) "[^"]*" NOLEAF', txt)}
twin = {int(m.group(1)) for m in re.finditer(r'§SWEEP win=(\d+) ', txt)} - noleaf
print(f'§NC9 role={role} legacy_access_rows={len(acc)} legacy_menu_reachable={len(legacy)} (inactive-menu windows {len(acc-menu)}) twin_tree={len(twin)}')
print(f'§NC9 legacy_only={sorted(legacy-twin)[:20]} n={len(legacy-twin)} twin_only={sorted(twin-legacy)[:20]} n={len(twin-legacy)}')
if not legacy or not twin: print('§NC9 VERDICT INCONCLUSIVE'); sys.exit(2)
ok = legacy == twin
print(f'§NC9 VERDICT {"PASS" if ok else "FAIL"} windows accessible {len(twin & legacy)} of {len(legacy)} (denominator: legacy role access from the dictionary)')
sys.exit(0 if ok else 1)
