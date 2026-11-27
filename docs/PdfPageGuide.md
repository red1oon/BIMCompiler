# PDF page: open a report and read it as a sheet

*For anyone who gets reports as PDFs: an owner, a bookkeeper, a site clerk. No ERP, no code, nothing to install.*

A report in a PDF is a picture of a sheet. This page opens that picture on your own computer, lets you search it like any reader, and, when it has a table, **reads it back as a sheet and checks that the columns add up.**

**Open it:** [red1oon.github.io/bim-ootb/pdf/](https://red1oon.github.io/bim-ootb/pdf/) (a prototype, open source). The page says it itself: *Nothing is uploaded: the file stays on this device.* Your PDF is read with the browser's own file reader.

## Read as sheet

Four steps:

1. **Open a PDF.** Press *Open a PDF* and choose the file (or drop it on the page). It is drawn on screen, page by page.
2. **Find and jump.** Type a word in *Find text* to see how many times it appears and on which pages. If the PDF has an outline, click an entry to jump to it.
3. **Read as sheet.** Press *Read as sheet*. The table on the page you are looking at appears as a grid, every figure in the cell it was printed in. Point at a cell: a box lights on the page where that figure came from.
4. **Take it away.** Press *Download .xlsx*. You get a spreadsheet file with the same cells; where the report printed a total, the file holds a real sum formula over its rows, not a pasted number. The page also keeps working with the network switched off, once it has been opened online one time.

## What the verdict words mean

The line above the grid says one of three things:

| It says | It means |
|---|---|
| **Page N adds up** | Every total the page printed equals the sum of the rows above it, in every column that has one. |
| **Page N does NOT add up** | A printed total differs from the sum of its rows. The line names the cell, the figure printed and the figure the rows give. One changed digit is enough to trigger it. |
| **Page N was not judged** | The page has no total row to check, so nothing was judged. This is never shown as "adds up". |

Two other messages: a file that is not a PDF, or is damaged, is refused in words and nothing is drawn; a locked PDF asks for its password.

## Limits (stated plainly)

- **One page at a time:** the page you are looking at is the page that is read.
- **Simple tables:** a header row and columns of figures read well. Merged, centred or wrapped cells are only partly rebuilt: in our test set, 3 of 5 report layouts are rebuilt and 2 are not.
- **No scans:** a PDF that is only a picture has no text to read. The page tells you it has no text.
- **A PDF written by a program** (a report, a statement) works best.
- No claim is made about many users at once, about speed on very large files, or about e-invoice compliance.
- Changing a figure and getting the same PDF back is **not built yet**.

*Built with pdf.js (Apache-2.0) and SheetJS, both open source and used unmodified.*
