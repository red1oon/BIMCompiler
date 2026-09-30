# Modeller — First Steps (10 minutes, no experience needed)
*[← Back to the **Modeller guide**](ModellerGuide.md) · [Home](index.md)*

One small job, start to finish: **open a building, click one wall, nudge it, undo it, save.**
Use a desktop browser (Chrome or Edge). Every step below was run by a script against the live site
and the numbers quoted are what the app itself reported.

---

### Step 1 — Open the Modeller

Go to **[red1oon.github.io/bim-ootb/modeller/modeller.html](https://red1oon.github.io/bim-ootb/modeller/modeller.html)**.
You should see an empty dark grid, a row of round buttons down the right edge, and the word *history*
with a slider along the bottom.

![The Modeller just opened: empty grid, round buttons on the right, history slider at the bottom](img/modeller/first-steps-step1-app-open.png)

### Step 2 — Click the folder button (Open)

On the right edge, click the **folder** button (**📂 Open**). A list called **OPEN A BUILDING** appears.

![The Open list, with the folder button highlighted on the right](img/modeller/first-steps-step2-open-panel.png)

### Step 3 — Click **Duplex**

Click **Duplex · wall-bearing**. Wait about 15–20 seconds. The house appears on the grid and its parts
list fills the **Outliner** on the left. (The app reported 196 building elements.)

![Duplex loaded: Outliner on the left, the house on the grid](img/modeller/first-steps-step3-duplex-loaded.png)

### Step 4 — Click Fit

Click the **square-corners** button (**Fit**), or press **F**. The whole house is now centred in view
(all 196 elements on screen).

![After Fit: the whole Duplex centred on the grid](img/modeller/first-steps-step4-fit.png)

### Step 5 — Click one wall

Click the long **low wall along the bottom edge** of the house. It turns light blue and the status line
at the bottom-left says `selected feature #…`. Exactly one thing is selected.

![One wall selected: highlighted light blue](img/modeller/first-steps-step5-wall-selected.png)

> Tip: pick a wall with no door or window in it for your first try. A wall that carries a door takes the
> door with it when it moves, and that is more than one step to undo.

### Step 6 — Click the Move button

Click the **four-arrow** button (**Move**). Three coloured arrows and a yellow ring appear on the wall.
The **red arrow** moves it sideways (X).

![The Move handles on the selected wall: red X arrow, green, blue, and the yellow ring](img/modeller/first-steps-step6-move-gizmo.png)

### Step 7 — Drag the red arrow a little

Press on the **red arrow**, drag it a short way along its own direction, and let go. The wall slides.
The status line reads something like `moved #82 Δ(0.42,0.00,0.00) verify=true`. The move snaps to the grid,
so it can differ slightly from how far you dragged. (You may also see `ORANGE` — a soft "a neighbour is now close"
note, not an error.)

![After the drag: the wall has moved along the red arrow](img/modeller/first-steps-step7-moved.png)

### Step 8 — Undo it

Press **Ctrl + Z**. The wall jumps back to exactly where it was and the status line says `undo #…`.
(The history slider at the bottom moves one notch left; you can also drag it.)

![After Ctrl+Z: the wall is back and the history slider has stepped back](img/modeller/first-steps-step8-undone.png)

### Step 9 — Click Save

Click the **floppy-disk** button at the top of the right-hand column (**Save**).

![The Save button, top of the right-hand column](img/modeller/first-steps-step9-save-button.png)

The app checks the model for clashes, then writes a snapshot. After a few seconds the status line reads
**`Saved — v0 (1 version)`**. (The snapshot was about 150 KB.)

![The status line after Save](img/modeller/first-steps-step9-saved.png)

**That is the whole loop:** open → select → tool → drag → undo → save. Next: the full [Modeller guide](ModellerGuide.md)
covers every other tool.
