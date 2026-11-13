# Film "Editing Real Code, part 2: It said dead. It was alive." — pipeline

Spec and storyboard: `prompts/CODE_ARCHITECTURE_DESIGN.md` §F.18. Layout rules: `prompts/FILM_NARRATION.md` PLAYBOOK C.

1. Two bim-ootb worktrees: one at the commit before the index fix (`7b030057`), one at today's `main`.
2. `./shoot.sh <old worktree> <new worktree> <bim-compiler root>` runs the real VS Code once on each (private virtual display,
   `--disable-gpu`, temp profile). `plan.js` compares the two indexes and derives every place and count; `shots_suite.js` drives the
   editor and logs what VS Code reports (`out/shots.log`); `mcp_ask.js` asks the repo's real local facts server two questions.
   One file in the new worktree is edited on camera and restored afterwards.
3. `python3 build.py <out.mp4>` reads the facts from `out/shots.log`, FAILS if a spoken number or a shown state no longer matches
   (`§FILM_GUARD`), draws the cards, measures the voice, holds each still for its speech, fits and muxes. Log: `out/build.log`.

Needs: VS Code, Xvfb, ImageMagick, ffmpeg, and the narration tools under `~/.local/share/film_narration/`. No model is called.
The film file is never committed.
