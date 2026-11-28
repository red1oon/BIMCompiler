# PDF, Sheet history and File it: your own files, checked and remembered

*For anyone who works from PDFs and spreadsheets: an owner, a bookkeeper, a site clerk. No ERP, no code, nothing to install.*

Three small pages that work on **your own files, on your own device**. Each page says it itself: your file is not uploaded anywhere. They are prototypes and open source.

| To do this | Go to | Type in the address bar |
|---|---|---|
| Open a PDF, change its text or a number right on the page, see whether the totals still add up, take the PDF or a spreadsheet away | **PDF** | [red1oon.github.io/bim-ootb/pdf](https://red1oon.github.io/bim-ootb/pdf/) |
| Give any spreadsheet a memory: who changed what, go back, merge two copies | **Sheet history** | [red1oon.github.io/bim-ootb/history](https://red1oon.github.io/bim-ootb/history/) |
| File an invoice workbook into real books | **File it** | [red1oon.github.io/bim-ootb/file-it](https://red1oon.github.io/bim-ootb/file-it/) |

**One way round:** each page has the same row at the top, **PDF · Sheet history · File it**. The page you are on is in bold; click either of the others to go there. Your file does not travel by itself: open it again on the next page (for example, the `.xlsx` the PDF page gave you, on Sheet history).

**No file of your own to hand?** Each page has a sample: *Try a sample report* (PDF), *Try a sample workbook* (Sheet history), *Get a sample invoice* (File it).

Older, longer addresses (on our films and in the Excel menu) still work and open the same pages.

## 1. PDF: open a file and look at it

1. **Open a PDF.** Press *Open a PDF* and choose the file (or drop it on the page), or press *Try a sample report*. The page is drawn on screen exactly as the file has it, page by page. The line in the top bar says the file name and how many pages it has (or "no text (a scan)" when the file is only a picture).
2. **Find and jump.** Type a word in *Find text* to see how many times it appears and on which pages. If the PDF has an outline, click an entry to jump to it.
3. **A PDF with a password** asks for it: "This PDF is locked. Type its password." A file that is not a PDF, or is damaged, is refused in words and nothing is drawn.

The page keeps working with the network switched off, once it has been opened online one time. On a phone the pages are laid out again when you turn it.

## 2. PDF: change text or a number right on the page

The idea: **the page you see is the page you edit.** Where the page can safely write your change back, you change it where it stands. Everywhere else the page leaves the original alone and tells you why.

1. **Change it.** Double-click a word or a number on the page (on a touch screen, tap it). A small box opens with the text in it. Type the change and press **Enter**; **Escape** cancels. Hover over a spot to see what it offers: "Double-click (or tap) to change this number" or "Double-click (or tap) to change this text".
2. **Only that spot changes.** The page rewrites that one piece of text **inside the same PDF**. The picture, the logo, the other text, the rest of the file stay as they were. The line in the top bar tells you what happened, for example `D10 is now "499.09". Page 1 does NOT add up: …` and ends with "Ctrl+Z undoes it."
3. **Take it away.** *Download PDF* (it becomes available after your first change) hands you your PDF with the change in it, as `<name>_edited.pdf`. *Download .xlsx* gives the table as a spreadsheet, as `<name>_page1.xlsx`: where the report printed a total, the file holds a real sum formula over its rows, not a pasted number.

A number you type is printed like the rest of its column: the same number of decimals, the same thousands commas. The page refuses, in words, rather than guess. The line in the top bar then says "… was not changed:" and the reason, for example a letter typed into a figure (`12O.50` with a letter O: a cell that holds a number takes a number only), a number with more decimals than its column prints (`1.234` is not rounded for you), a text or number too wide for its box, or a letter the report's font does not have and no other font can show.

### "Locked": what it means

Some spots on the page are **Locked**. Hover over one, or tap it, and the top bar says why, starting with "Locked:". Nothing is changed and nothing is lost. These are the reasons you will actually meet:

| You see | Why |
|---|---|
| **Thai text** (and Lao, Arabic, Hebrew, Khmer, Myanmar, Tibetan and the Indian scripts) | "Locked: Thai text: its letters are shaped by the font and no standard PDF font has them …". The page cannot write these letters back, so they stay exactly as printed. The sample report has Thai headings, so you will meet this on the sample. |
| **A picture** | "Locked: a picture: its pixels are kept exactly as they are (text inside a picture is pixels, not editable)". |
| **The hidden text of a scan** | A scanned page often carries invisible text under the picture so you can search it. "Locked: this text is not drawn (the hidden text of a scanned page): changing it would not change what the page shows". |
| **A turned page** | "Locked: page 1 is turned (/Rotate 90): writing back on a turned page is not in this cut". All the text of that page is locked. |
| **A PDF the page cannot write back yet** | "Locked: this PDF cannot be written back in place: …" and the reason, for example "this PDF keeps its cross-reference in a stream (PDF 1.5+)", which is a newer way of storing the file's own index. You can still look, find and read it; every text on it is locked. |

Other reasons are said the same way, for example "the text is rotated or skewed". If you tap an empty spot, the page says "Nothing to edit here: drawings and pictures stay exactly as they are."

### Totals are marked on the page

If the page has a table with totals, each total is marked **on the page** while you work:

- A green mark with a tick: the total equals the sum of the rows above it.
- A red mark that says, for example, `rows 40,393.44, gap 1.00`: the rows add up to 40,393.44 and the printed total differs by 1.00. **A gap means the printed total and its rows disagree**, whether by a typing slip, an edit, or a report that never added up.

Try it on the sample: change the Debit figure on the *Accounts Receivable - Trade* line from 498.09 to 499.09. The total under that column is marked red with the gap of 1.00. Put 498.09 back (or press Undo) and the mark turns green again.

Click a total to see its formula in the top bar (for example `D28 = SUM(D6:D26) = 40,392.44, as printed.`) and to light up the rows it adds. With a mouse, **drag across some numbers** to see their sum and count (`Sum … · count …`); a finger scrolls the page instead, so drag-sum is for the mouse.

### The red "font not same" box

A PDF often carries only the letters it printed. If your new text needs a letter the original font does not have, the page does not refuse and does not guess silently. It writes your text in the closest font it can find (another face of the same family in the file, otherwise a standard font such as Helvetica) and puts a **red box on the page** that says `font not same: <old font> → <new font>`, with an **Accept** button.

- **Accept** keeps the new font and takes the red box away.
- **Undo** (below) puts the old text back.
- The red box is only on your screen. It is never written into the PDF. *Download PDF* lists every place where the font is not the same.

If no font can show the letter at all, the change is refused and the letter is named.

### Undo and Redo

Press **Ctrl+Z** (**Cmd+Z** on a Mac) or the *Undo* button; **Ctrl+Shift+Z** or *Redo* puts it back. The buttons are for phones, which have no keyboard. Undo puts back the earlier file exactly as it was.

Undo keeps earlier copies of your file only up to a memory limit. If you go back far enough the page says: "Undo stops here: the earlier copies of this file were let go to save memory. The History still lists every change." The history (section 5) still lists every change and every undo.

## 3. PDF: the grid, the second way to work

Press **Show grid** and the table on the page you are looking at appears as a grid beside the page, every figure in the cell it was printed in. Point at a cell: a box lights on the page where that figure came from. Double-click a number in the grid (on a touch screen, tap it) to change it, as on the page.

The grid also gives the verdict on the page's totals in words:

| It says | It means |
|---|---|
| **Page N adds up** | Every total the page printed equals the sum of the rows above it, in every column that has one. |
| **Page N does NOT add up** | A printed total differs from the sum of its rows. The line names the cell, the figure printed and the figure the rows give. One changed digit is enough to trigger it. |
| **Page N was not judged** | The page has no total row to check, so nothing was judged. This is never shown as "adds up". |

*Download .xlsx* works with or without the grid open.

## 4. A report printed by the ERP

The ERP has an **Excel Report** pill. It runs a report from a report workbook and can print it as a PDF. That PDF opens on the PDF page like any other file, and you can edit it there.

1. In the ERP, press the **Excel Report** pill. Pick one of the two sample reports (*sample report: Thai trial balance (opening, movement, closing)* or *sample report: Thai sales register (grows as you sell)*), or drop a report workbook of your own (one with the sheets Input, Process, Output and BACKUP).
2. Set the *From* and *To* dates and press **Run report**. It says "Report ready", with how many queries it ran, how long it took and how many formulas it holds.
3. Press **Download PDF**. (The first time, the page loads the fonts it needs, then the file is handed to you.) *download …_report.xlsx* gives the same report as a spreadsheet.
4. On the PDF page, press *Open a PDF* and choose that file. Change a number: the totals are marked on the page exactly as in section 2.

Three things you may notice in a printed report:

- **`####`** in a cell: the number is too wide for its column. The report prints `#` signs, as a spreadsheet does, instead of a different, shorter-looking number.
- **Page breaks:** a long report runs over several pages. The cut falls between rows, never through one, and no page is taller than 14,400 points (200 inches). The heading row is not repeated on the later pages.
- **A line under the report** such as "2 characters in 1 cell (中文) have no font in this PDF and are left blank." The PDF carries fonts for Thai, Lao and the usual Western letters; a character from any other script (Chinese, for example) has no font, so it is left blank and counted. The line tells you how many characters and in how many cells.

## 5. The history inside your file

Every change is recorded: the cell, the value before, the value after, and when. An undo is recorded too, as a change of its own.

- **On the PDF page:** under *History* on the left, type a cell (for example `D10`) and press *Story*, or click a cell on the page (with a mouse) or in the grid, to see every value it has had. The history starts with your first change or when you press *Show grid*.
- **It travels inside the file.** The PDF you download carries its history as an attachment inside the PDF; the `.xlsx` carries it in a hidden sheet. Open either one again later, on any device, and the history is picked up and continues.
- **Text outside a table** (a heading, a sentence) is recorded too. In the `.xlsx` it sits on an extra tab called `_door_text`, which you can see.
- **Tampering is named.** If someone edits the history by hand, the page says which entry was changed. If someone changed a number in the PDF without recording it, the page names the cell, the printed figure and the figure the history holds. In both cases the old history is not continued; a new one starts and says what was found.

## 6. Sheet history: any spreadsheet gets a memory

Works on any `.xlsx`, from Excel, WPS or the PDF page. No add-in, no spreadsheet program needed.

1. **Open a workbook (.xlsx)** and type **your name**. Or press *Try a sample workbook*: a small order sheet that already carries three stamps by two people, so you can see steps and a cell's story at once. (It is a typed name, not a signature: anyone can type any name.)
2. **Stamp.** The page lists what changed since the last stamp; *Stamp* records it inside the workbook. Press *Download the workbook* to keep it.
3. **Go back.** Pick any step to see the sheet as it was then; *Download this version* gives you that copy.
4. **The story of a cell.** Click a cell to see every value it has had, who stamped it and when.
5. **Merge another copy.** Two people worked on two copies? Open the other copy. Edits on different cells are combined. Where both changed the same cell you see both values and both names and choose; nothing is overwritten for you.

The page lists its own limits under *What to know*: if someone deletes the hidden history sheet the history is gone and cannot be noticed; cell colours and widths are not kept in the downloaded copy.

## 7. File it: an invoice workbook into the books

1. **Open a workbook (.xlsx)** whose invoice cells are marked, or press **Get a sample invoice** to try one. Marking the cells of your own invoice layout is not built yet: a workbook without them is opened, and the page says so and points you to the sample.
2. Press **File it.** The books check that it adds up, file it as a real invoice with its accounting entries, and hand the workbook back with the document number and a signed ledger line inside. *Download the workbook* to keep it.
3. **Open in the ERP** shows the same invoice in the ERP's own Invoice window, with its lines and its accounting entries. Opening it again, or reloading, never files it twice.

Everything runs in this browser tab on the **GardenWorld demo books**, one fixed demo login. The first open downloads the books engine (about 11 MB over the network): use Wi-Fi. It has not yet been tried on a real phone.

## Limits (stated plainly)

- **PDF: the page editor covers page 1 only.** Later pages are shown, found and read, but their text is not offered for editing on the page. *Show grid* reads the page you are looking at.
- **PDF: some files cannot be written back yet.** A PDF that keeps its index in a stream (PDF 1.5+), an encrypted PDF and a page that is turned cannot be changed: the page shows them and locks their text, saying why. Text that a PDF draws from a reusable block (a "form") is not offered either.
- **PDF: Thai stays locked.** Thai (and the other shaped scripts) can be read, found and exported to a spreadsheet, but not retyped on the page.
- **PDF: drag-sum is mouse only.** On a touch screen a finger scrolls the page.
- **PDF: undo has a memory limit.** After many large steps the oldest ones can no longer be undone; the page says so, and the history still lists every change.
- **PDF: simple tables.** A header row and columns of figures read well. Merged, centred or wrapped cells are only partly rebuilt: in our test set, 3 of 5 report layouts are rebuilt and 2 are not.
- **PDF: no scans.** A PDF that is only a picture has no text to read; the page says so. A PDF written by a program (a report, a statement) works best.
- **PDF: any change breaks a digital signature.** The edited file is a revision of the original, not the signed original.
- **The `_door_text` tab.** Text changed outside a table goes into an extra visible tab of the `.xlsx` called `_door_text`. If you change text in that tab, nothing checks it against the PDF.
- **File it files only the sample layout.** A workbook of your own with marked cells is not built yet (see section 7).
- **Checked in:** the rewritten PDF has been checked in two independent PDF readers (poppler and pdf.js), not yet in Acrobat, Preview or Chrome's own viewer. The Excel and WPS menus are not proven in the real programs: the Excel menu has not been run in real Excel, and the WPS menu has not been shown working in real WPS.
- **WPS and your name:** when WPS saves a workbook it writes your computer's user name into the file's properties (*last modified by*). Keep that in mind before sending the file on.
- **The ERP report:** running it offline is not claimed. The heading row is not repeated on later pages (section 4).
- No claim is made about many users at once, about speed on very large files, or about e-invoice compliance.

*Built with pdf.js (Apache-2.0) and SheetJS, both open source and used unmodified. Report PDFs are written with PDFKit (MIT); the report fonts are open source (SIL OFL).*
