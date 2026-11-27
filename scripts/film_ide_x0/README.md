# Film "Editing Real Code" — pipeline

Spec and storyboard: `prompts/CODE_ARCHITECTURE_DESIGN.md` §F.9 Part 2. Layout rules: `prompts/FILM_NARRATION.md` PLAYBOOK C.

1. `./shoot.sh <a throw-away bim-ootb worktree> <bim-compiler root>` runs the real VS Code twice on a private virtual display
   (Xvfb, `--disable-gpu`, temp profile): BEFORE without X0 Navigator, AFTER with it. `plan.js` finds the real places from the
   repo's own index; `shots_suite.js` drives the editor and logs what VS Code reports for every still (`out/shots.log`).
   One file in the worktree is edited on camera and restored afterwards.
2. `python3 build.py <out.mp4>` reads the facts from `out/shots.log`, FAILS if a spoken number no longer matches
   (`§FILM_GUARD`), draws the cards, measures the voice, holds each still for its speech (pictures change when the spoken
   turn starts), fits and muxes. Log: `out/build.log`. Voices: Kokoro, local CPU.

Needs: VS Code, Xvfb, ImageMagick, ffmpeg, and the narration tools under `~/.local/share/film_narration/`.
