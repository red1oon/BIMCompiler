# PDF, Sheet history and File it: your own files, checked and remembered

*For anyone who works from PDFs and spreadsheets: an owner, a bookkeeper, a site clerk. No ERP, no code, nothing to install.*

Three small pages that work on **your own files, on your own device**. Each page says it itself: your file is not uploaded anywhere. They are prototypes and open source.

| To do this | Go to | Type in the address bar |
|---|---|---|
| Open a PDF report, read it as a sheet, check it adds up, change a number | **PDF** | [red1oon.github.io/bim-ootb/pdf](https://red1oon.github.io/bim-ootb/pdf/) |
| Give any spreadsheet a memory: who changed what, go back, merge two copies | **Sheet history** | [red1oon.github.io/bim-ootb/history](https://red1oon.github.io/bim-ootb/history/) |
| File an invoice workbook into real books | **File it** | [red1oon.github.io/bim-ootb/file-it](https://red1oon.github.io/bim-ootb/file-it/) |

**One way round:** each page has the same row at the top, **PDF · Sheet history · File it**. The page you are on is in bold; click either of the others to go there. Your file does not travel by itself: open it again on the next page (for example, the `.xlsx` the PDF page gave you, on Sheet history).

Older, longer addresses (on our films and in the Excel menu) still work and open the same pages.

## 1. PDF: read a report as a sheet

1. **Open a PDF.** Press *Open a PDF* and choose the file (or drop it on the page). It is drawn on screen, page by page.
2. **Find and jump.** Type a word in *Find text* to see how many times it appears and on which pages. If the PDF has an outline, click an entry to jump to it.
3. **Read as sheet.** Press *Read as sheet*. The table on the page you are looking at appears as a grid, every figure in the cell it was printed in. Point at a cell: a box lights on the page where that figure came from.
4. **Take it away.** Press *Download .xlsx*. You get a spreadsheet file with the same cells; where the report printed a total, the file holds a real sum formula over its rows, not a pasted number.

The page keeps working with the network switched off, once it has been opened online one time.

### What the verdict words mean

| It says | It means |
|---|---|
| **Page N adds up** | Every total the page printed equals the sum of the rows above it, in every column that has one. |
| **Page N does NOT add up** | A printed total differs from the sum of its rows. The line names the cell, the figure printed and the figure the rows give. One changed digit is enough to trigger it. |
| **Page N was not judged** | The page has no total row to check, so nothing was judged. This is never shown as "adds up". |

A file that is not a PDF, or is damaged, is refused in words and nothing is drawn; a locked PDF asks for its password.

## 2. PDF: change a number and get the same PDF back

1. In the sheet, **double-click a number** (on a touch screen, tap it). Type the new number and press **Enter**. **Escape** cancels.
2. The page rewrites that number **in the same PDF, in its own box**. Nothing else on the page moves. The verdict line checks again at once: change one row and not its total, and it says *does NOT add up* and names the total.
3. Press **Download PDF**. You get your PDF with the new number in it, the same layout, the same file otherwise.

The page refuses, in words, rather than guess: text that is not a number (`abc`), a number with more decimals than its column prints (`1.234` is not rounded for you), or a number too wide for its box.

**A limit to know:** a PDF often carries only the digits it printed. If your new number needs a digit the report's bold font never used, the page writes it in the regular face of the same font and says so; if no face of that font has the digit, the change is refused and named.

## 3. The history inside your file

Every change is recorded: the cell, the value before, the value after, and when.

- **On the PDF page:** under *History* on the left, type a cell (for example `D10`) and press *Story*, or click a cell in the sheet, to see every value it has had.
- **It travels inside the file.** The PDF you download carries its history as an attachment inside the PDF; the `.xlsx` carries it in a hidden sheet. Open either one again later, on any device, and the history is picked up and continues.
- **Tampering is named.** If someone edits the history by hand, the page says which entry was changed. If someone changed a number in the PDF without recording it, the page names the cell, the printed figure and the figure the history holds. In both cases the old history is not continued; a new one starts and says what was found.

## 4. Sheet history: any spreadsheet gets a memory

Works on any `.xlsx`, from Excel, WPS or the PDF page. No add-in, no spreadsheet program needed.

1. **Open a workbook (.xlsx)** and type **your name**. (It is a typed name, not a signature: anyone can type any name.)
2. **Stamp.** The page lists what changed since the last stamp; *Stamp* records it inside the workbook. Press *Download the workbook* to keep it.
3. **Go back.** Pick any step to see the sheet as it was then; *Download this version* gives you that copy.
4. **The story of a cell.** Click a cell to see every value it has had, who stamped it and when.
5. **Merge another copy.** Two people worked on two copies? Open the other copy. Edits on different cells are combined. Where both changed the same cell you see both values and both names and choose; nothing is overwritten for you.

The page lists its own limits under *What to know*: if someone deletes the hidden history sheet the history is gone and cannot be noticed; cell colours and widths are not kept in the downloaded copy.

## 5. File it: an invoice workbook into the books

1. **Open a workbook (.xlsx)** whose invoice cells are marked, or press **Get a sample invoice** to try one.
2. Press **File it.** The books check that it adds up, file it as a real invoice with its accounting entries, and hand the workbook back with the document number and a signed ledger line inside. *Download the workbook* to keep it.
3. **Open in the ERP** shows the same invoice in the ERP's own Invoice window, with its lines and its accounting entries. Opening it again, or reloading, never files it twice.

Everything runs in this browser tab on the **GardenWorld demo books**, one fixed demo login. The first open downloads the books engine (about 34 MB): use Wi-Fi. It has not yet been tried on a real phone.

## Limits (stated plainly)

- **PDF: one page at a time** is read, the one you are looking at.
- **PDF: simple tables.** A header row and columns of figures read well. Merged, centred or wrapped cells are only partly rebuilt: in our test set, 3 of 5 report layouts are rebuilt and 2 are not.
- **PDF: no scans.** A PDF that is only a picture has no text to read; the page says so. A PDF written by a program (a report, a statement) works best.
- **Checked in:** the rewritten PDF has been checked in two independent PDF readers (poppler and pdf.js), not yet in Acrobat, Preview or Chrome's own viewer. The Excel menu has not been run in real Excel.
- **WPS and your name:** when WPS saves a workbook it writes your computer's user name into the file's properties (*last modified by*). Keep that in mind before sending the file on.
- No claim is made about many users at once, about speed on very large files, or about e-invoice compliance.

*Built with pdf.js (Apache-2.0) and SheetJS, both open source and used unmodified.*
