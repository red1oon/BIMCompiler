# ⚠ DO NOT REMOVE — WORK ORDER SCOPE
Machine-level (not code) bug: Chrome's GPU process crash-loops after the tab sits idle.
Third distinct cause on this machine, joining the two in
[[project_machine_chrome_firefox_gpu_launchers]] (launcher flags; driver/kernel version
mismatch). Read the log after every run — exit code is not evidence.

## Symptom
Load a building, leave idle. GPU process dies and never recovers — every respawn hits
the same failure, unlike a one-off crash-and-restart.

## Root cause (proven via journalctl, 2026-08-05)
```
14:57:11  GL_CONTEXT_LOST_KHR: Context has been lost
14:57:11  Restarting GPU process due to unrecoverable error
14:57:24  SharedContextState context lost via EXT_robustness, GL_GUILTY_CONTEXT_RESET_KHR
14:57:24  Restarting GPU process due to unrecoverable error   <- retry, same failure
14:57:43  same again                                          <- crash loop, never recovers
```
`/proc/driver/nvidia/gpus/*/power` showed `Runtime D3 status: Enabled (fine-grained)`,
`nvidia-smi` showed the card parked at `P8`, 3.3W. NVIDIA runtime power management
auto-suspends the GPU when idle; on this machine it fails to cleanly wake, resetting any
live WebGL context and dropping the GPU process into a crash loop with no self-recovery.

**Ruled out:** driver/kernel mismatch (nvidia-smi + `/proc/driver/nvidia/version` both
595.84, in sync); reintroduced launcher flags (both `google-chrome*.desktop` files plain,
no PRIME/Vulkan/sandbox flags). The `MESA-LOADER dri_gbm.so Permission denied` line in the
log is a red herring — fires on every GPU-process start including successful ones, Chrome
falls through to the NVIDIA-native GBM path regardless.

## Likely trigger: this project's own idle-render gate
`prompts/archive/IDLE_RENDER_GATE.md` (shipped 2026-06-04) added on-demand desktop
rendering — the viewer parks at **0 GPU frames** when idle (`§IDLE_GATE park`), replacing
the old always-render-at-60fps loop. Before that gate, the GPU never went truly idle, so
NVIDIA's D3 auto-suspend never had a window to trigger. After it, an idle tab gives the
GPU enough true-idle time to drop into D3 — and that's the state this machine can't wake
cleanly from. Not confirmed causal (would need to check if the crash reproduces with the
gate temporarily disabled), but the timing fits and it's the only code change that
altered GPU idle behavior on this machine.

## Fix applied (2026-08-05)
`sudo nvidia-smi -pm 1` — enables persistence mode, non-destructive, no reboot, reverts
with `sudo nvidia-smi -pm 0`. Verified: `nvidia-smi --query-gpu=persistence_mode,pstate`
went `Disabled,P8` -> `Enabled,P5`.

**Made permanent same day, systemd oneshot (not by editing the packaged unit — Ubuntu's
`nvidia-persistenced.service` ships with `--no-persistence-mode` baked into its
`ExecStart`, so patching that file would just get reverted by the next driver-package
update):**
- New unit `/etc/systemd/system/nvidia-pm-persist.service` — `Type=oneshot`,
  `ExecStart=/usr/bin/nvidia-smi -pm 1`, `RemainAfterExit=yes`,
  `After=nvidia-persistenced.service` + `Requisite=`, `WantedBy=multi-user.target`.
- Enabled: `sudo systemctl enable --now nvidia-pm-persist.service`. `systemctl is-enabled`
  / `is-active` both confirmed. Survives reboot without any manual step.
- To revert: `sudo systemctl disable --now nvidia-pm-persist.service && sudo rm
  /etc/systemd/system/nvidia-pm-persist.service && sudo systemctl daemon-reload`.

Note: `nvidia-smi` can still report `pstate=P8` between polls (idle clock state) and
`/proc/driver/nvidia/gpus/*/power` still shows `Runtime D3 status: Enabled` — persistence
mode does not disable D3 as a capability, it keeps a client attached to the kernel module
so the device is never fully released/reinitialized, which is the actual step that was
failing on wake. Pstate cycling on its own is not evidence of a regression.

## Connection to the 2026-07-19 bake-pause fix
`cinema_maxq.js:340-389` (`§MAXQ_WAKELOCK`/`§MAXQ_HIDDEN_PAUSE`) already made a
background-tab movie bake pause cleanly instead of losing frames when the tab is hidden
(rAF fully freezes in a hidden tab, confirmed by probe — not just throttled). That fix
holds a *screen* wake lock, which does not touch the discrete GPU's runtime power state.
During a long paused stretch (rAF frozen, nothing rendering), the GPU can still drop into
D3 exactly as diagnosed above, and on this machine can fail to wake cleanly when the tab
returns to visible — which reads as "the bake died" rather than "the bake resumed", even
though the pause logic itself worked correctly. This fix is the missing layer underneath
that one, not a duplicate of it — no code change needed in `cinema_maxq.js`.

## Witness (must pass before DONE)
- Load a large building (e.g. LTU_AHouse, Terminal), leave idle 60s+ past the point
  `§IDLE_GATE park` fires. Expected: no `GL_CONTEXT_LOST_KHR` / no GPU-process restart
  loop in `journalctl --user -f` (or system journal) during the idle window.
- `nvidia-smi --query-gpu=persistence_mode,pstate --format=csv,noheader` stays
  `Enabled,P5` (or higher, never idle-drops to P8) while idle.

## 2026-08-06 — Persistence-mode fix FAILED; PCI-D3 root cause REFUTED by kernel evidence

### (a) Fix confirmed NOT sufficient
`nvidia-pm-persist.service` active continuously since 2026-08-05 17:34:26
(`systemctl status`: "Persistence mode is already Enabled"; `nvidia-smi
--query-gpu=persistence_mode,pstate` → `Enabled, P8`). Crash loop recurred anyway —
`journalctl --user -b 0`:
```
Aug 06 11:22:17 / 11:22:29 / 11:22:42  SharedContextState context lost via EXT_robustness,
                                       GL_GUILTY_CONTEXT_RESET_KHR → GPU process exited, exit_code=8704
Aug 06 11:44:32 / 11:44:46 / 11:45:13  same signature, same loop
```
Also found in the same journal sweep, predating the doc: identical loops Aug 04 14:19,
15:52–15:53, 18:54, 22:21 (all `exit_code=8704`). Boot is 2026-08-02 03:44 — every listed
timestamp (Aug 04–06) is within this boot; nothing predates journal coverage
(persistent journal, 1.5G, confirmed via `journalctl --disk-usage`).

### (b) Kernel-log audit REFUTES the PCIe-D3-wake-failure diagnosis
Full-boot `journalctl -k -b 0` grep for `NVRM|Xid|pcieport|AER|runtime.?pm|d3cold`:
- **Zero** GPU Xid, AER, pcieport-error, or runtime-PM lines at ANY of the ~12 crash-loop
  timestamps (Aug 04 14:19/15:52/18:54/22:21; Aug 05 01:49/14:00/14:07/14:10/14:26/14:27/
  14:57/16:39; Aug 06 11:22/11:44). A real GPU hang/reset or D3 wake failure logs an
  NVRM Xid — this machine DOES produce them when real faults occur (see below), so the
  absence is meaningful, not a logging gap.
- Only 2 Xids the whole boot: `Xid 31` MMU faults from Chrome's video-decode thread
  (`name=av:h264:df0`), Aug 02 16:35:21 and Aug 04 18:33:32, both at the same address
  `0x1_20d7e000` — a separate, repeatable decode bug, NOT coincident with any crash loop.
- **`/sys/bus/pci/devices/0000:01:00.0/power/runtime_suspended_time` = 0** — the GPU has
  NEVER been runtime-suspended this entire boot. `power/control` = `on`,
  `runtime_status` = `active`. The device cannot have entered PCI D3 at crash time.
- Conclusion: the `GL_GUILTY_CONTEXT_RESET_KHR` is generated in the **userspace GL layer**
  (NVIDIA GL driver robustness reporting inside Chrome's GPU process, ANGLE-on-OpenGL,
  driver 595.84, Chrome 151.0.7922.71) with no kernel-visible GPU fault. The 2026-08-05
  "fails to wake from D3" root cause is **wrong as stated** — the GPU never left D0.

### Other angles checked (all read-only)
- **Thermal: ruled out.** `nvidia-smi -q -d PERFORMANCE`: HW/SW Thermal Slowdown counters
  0 µs for the whole boot; 72 °C at P0 under load at check time.
- **Suspend/resume: partial correlation only.** Both Aug 06 loops follow the 04:31→11:14:48
  s2idle resume (same resume where the r8169 ethernet NIC logged `Unable to change power
  state from D3cold to D0` — this machine's s2idle resume is demonstrably flaky at the PCI
  level, just not for the GPU). But ALL Aug 04–05 loops occurred with no suspend since
  Aug 02 11:35 — resume is an aggravator at most, not the common factor.
- **Crashpad:** `~/.config/google-chrome/Crash Reports/completed/` has dumps (one at
  Aug 04 14:19 coincides with a loop); `.meta` files are 48-byte stubs, `strings` on the
  `.dmp` confirms `gpu-process` + `ANGLE (... RTX 4060 ... OpenGL 4.5.0 NVIDIA 595.84)`
  but no extractable reason string.
- Driver params (`/proc/driver/nvidia/params`): `DynamicPowerManagement: 3` (default),
  `EnableS0ixPowerManagement: 0`, `PreserveVideoMemoryAllocations: 1`, GSP firmware on
  (`EnableGpuFirmware: 18`). `xe` module loaded but 0 users — i915 drives the iGPU.
- Web search: no known-issue match for 595.84 idle context resets; documented
  NVIDIA `GL_GUILTY_CONTEXT_RESET_KHR` cases come WITH kernel MMU-fault lines, unlike here.

### (c) Proposed next fix — NOT applied, needs user confirmation
Since the fault line now points at the ANGLE-on-OpenGL robustness path inside Chrome's GPU
process, the discriminating experiment is to switch that path out. Zero-risk, no reboot,
fully reversible:
```
google-chrome --use-angle=vulkan
```
(or persistently: `chrome://flags` → "Choose ANGLE graphics backend" → Vulkan → relaunch).
Then re-run the witness below. If the idle crash disappears → confirmed userspace-GL/ANGLE
robustness issue; keep the flag (add to `~/.local/share/applications/google-chrome.desktop`
Exec line) and optionally file against the NVIDIA 595.84 GL driver. If it persists under
Vulkan too → the driver core is implicated regardless of API; next candidate would be a
driver version change, NOT power-management tuning (that lead is dead). Secondary
discriminator, also read-only: open the same viewer in Firefox, idle 10+ min — different GL
stack, isolates Chrome-specific vs driver-wide.
The previously floated `NVreg_DynamicPowerManagement=0x00` modprobe.d edit is now
**poorly motivated** — `runtime_suspended_time=0` proves the GPU never runtime-suspends
anyway — do not bother with it.

## 2026-08-06 (cont'd) — Vulkan A/B run, two prior causes re-checked, launcher switched
Ran the §(c) A/B test above rather than leave it as a user TODO.

**Vulkan idle test:** isolated `--user-data-dir` Chrome, `--use-angle=vulkan`, loaded
`Terminal_extracted.db` via the standing sandbox (`localhost:8399`), left purely idle (no
interaction) 20 minutes. No crash signature. **Weak evidence only** — no confirmed
baseline for how reliably the default GL backend crashes under pure idle within any
bounded window (historical gaps ranged ~7 min to hours), so this doesn't distinguish
"Vulkan fixed it" from "idle alone wasn't going to trigger it in this particular window
anyway." The user's own real-session log (below) shows the crash during/after active
interaction, not necessarily pure idle — `§IDLE_GATE`-idle may not be the operative
trigger condition at all.

**Real-session evidence from the user, same day:** console dump showed the live
`CONTEXT_LOST_WEBGL` → `§WEBGL_CONTEXT_LOST` banner firing, then on reload:
`THREE.WebGLRenderer: A WebGL context could not be created... GL_VENDOR = Disabled,
GL_RENDERER = Disabled, Sandboxed = yes... BindToCurrentSequence failed` →
`§INIT_VIEWER_ERROR`. Re-checked both prior causes from
`[[project_machine_chrome_firefox_gpu_launchers]]` against this specific incident:
driver/kernel module version match cleanly (`nvidia-smi` and `/proc/driver/nvidia/version`
both `595.84`); `~/.local/share/applications/google-chrome*.desktop` carried no
reintroduced PRIME/Vulkan/webgpu flags (still plain, as of the check before this
session's edit below). Neither prior cause explains this incident — most likely a reload
landing mid-crash-loop (GPU process caught between restart attempts), i.e. a symptom of
the same still-unexplained root cause above, not a third cause.

**Retraction:** briefly flagged the viewer's own `§FPS_MODE mean=4242.6 max=8208.9` log
lines as a possible "uncapped rendering / no vsync" trigger — wrong, self-caught same
session. `_fpsSample()` (`viewer/main.js:670-687` in bim-ootb) computes `dt` in
**milliseconds** between rendered frames; the values are frame TIMES, not frame rates
despite the `FPS_MODE` tag. `mean=4242.6` = ~4.2s between frames, normal for an
on-demand/idle-park renderer. `mean=2006720.6` is a real ~33-minute gap spanning a
hidden-tab period, not a numeric artifact. No uncapped-rendering lead here — do not
re-chase this.

**Action taken:** `~/.local/share/applications/google-chrome.desktop`'s three `Exec=`
lines (main, new-window action, new-private-window action) now carry `--use-angle=vulkan`,
per the user's explicit request to stop asking them to run manual GPU tests — normal daily
Chrome usage (launched via the taskbar/app-launcher icon) is now the real-world A/B test,
since the idle-only test above can't substitute for it. Requires a FULL Chrome quit (every
window closed, not just the active one) for the new launch flag to take effect. **Revert:**
remove ` --use-angle=vulkan` from the three `Exec=` lines in that file.

## 2026-08-06 (cont'd) — "how did the 2026-07-13 fix break back?" answered
User correctly recalled the launcher-flags bug was already fixed 2026-07-13 and asked why
it would recur. It didn't — the `.desktop` fix held (verified clean before today's edit).
Found the real gap: **`~/.bashrc:127`** carried `alias chrome-gpu="__NV_PRIME_RENDER_OFFLOAD=1
__GLX_VENDOR_LIBRARY_NAME=nvidia __VK_LAYER_NV_optimus=NVIDIA_only google-chrome
--enable-unsafe-webgpu --enable-features=Vulkan"` — the exact PRIME-offload combo identified
as the confirmed culprit in `[[project_machine_chrome_firefox_gpu_launchers]]`, never cleaned
up when the `.desktop` files were fixed. Any terminal launch via that alias would silently
reintroduce the July bug. **Removed** (2026-08-06) — replaced with a dated comment explaining
why; this machine's desktop session runs directly on the NVIDIA GPU (no iGPU fallback), so
PRIME offload was never actually needed. Sibling `alias bonsai` (Blender, same PRIME-offload
pattern) left untouched — different app, not implicated, out of scope. Exhaustively checked
for other reintroduction points: no `/etc/opt/chrome` or `/etc/chromium` managed policy, no
`/etc/chrome-flags.conf`, no other `google-chrome*.desktop` anywhere on the filesystem besides
the two already known (`/usr/share/applications` stock, `~/.local/share/applications` user
override) — the bashrc alias was the only other door.

This is a SEPARATE fact from the still-open idle/active-use crash-loop this doc otherwise
tracks — the July bug (fails on every load, 100% of the time) and today's bug (works fine,
degrades after some time) are different failure shapes that happen to converge on a similar-
looking `GL_VENDOR=Disabled`/`Sandboxed=yes` error string once Chrome's GPU process gives up,
which is why they read as "the same issue" from the outside.

## 2026-08-06 (cont'd) — Vulkan flag STILL wasn't active; wrong `.desktop` file edited
Two more real-session pastes from the user after the flag was supposedly set: one showed
`§RENDERER_CAPS ... OpenGL 4.5.0` (proves default GL backend, not Vulkan); the next showed
a NEW error shape, `WebGL: A WebGL context could not be created. Reason: Web page caused
context loss and was blocked` — this is Chrome's own per-page anti-abuse throttle (blocks
further context creation after repeated context losses in a short window), a downstream
symptom of the same still-unexplained crash loop, not a new bug. `journalctl` confirmed a
fresh `GL_GUILTY_CONTEXT_RESET_KHR`/GPU-process-exit at 23:40:27, ~1 min before the browser
process that produced this log started (23:41:42) — same signature as ever, still no flag:
`/proc/<pid>/cmdline` showed plain `/opt/google/chrome/chrome`, no `--use-angle=vulkan`.

Root cause of the flag never taking: **`gsettings get org.gnome.shell favorite-apps`** shows
the taskbar/dock icon is pinned to **`google-chrome-gpu.desktop`**, not `google-chrome.desktop`
— the file edited earlier in this doc's 2026-08-06 session. `google-chrome.desktop` is only
the xdg default-browser handler (used when clicking a link from another app); the actual
pinned launcher was untouched the whole time. Confirmed via full search: `XDG_DATA_DIRS`
resolution order checked, only two `google-chrome*.desktop` files exist system-wide (as
already noted above), and the dock favorite is explicitly `google-chrome-gpu.desktop`.
**Fixed:** its `Exec=` line now also carries `--use-angle=vulkan`. Both files are consistent
now. Killed the stale plain session (`pkill -f /opt/google/chrome/chrome`, aliased as
`chrome-quit` in `~/.bashrc`) so the next taskbar launch is a genuinely fresh, flagged
process. **Still unverified** — next real-session log paste should show a Vulkan driver
string in `§RENDERER_CAPS`, not `OpenGL 4.5.0`, to confirm the flag is finally live.

## Status
⏳ OPEN — root cause still not identified (userspace Chrome/ANGLE/NVIDIA GL layer, ruled
out: PCI D3, kernel-level fault, thermal, driver/kernel mismatch, launcher-flag
contamination, bashrc alias). `--use-angle=vulkan` set on BOTH launcher `.desktop` files as
of 2026-08-06 (the taskbar-pinned `google-chrome-gpu.desktop` was the one actually missing
it until just now) — still completely unverified in practice; every real-session log so far
has shown the default GL backend still active. `nvidia-pm-persist.service` left in place —
harmless, confirmed not the fix. Next step: confirm `§RENDERER_CAPS` shows a Vulkan string
on the next fresh launch before drawing any conclusion about whether Vulkan helps at all.
