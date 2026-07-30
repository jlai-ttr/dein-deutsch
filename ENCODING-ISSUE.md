# Sheet Encoding Issue
The Sheet source tabs use UTF-8 (correct German umlauts: ä ö ü ß).
But after migration, `vocab_master` tab shows `lAsen` instead of `lösen`, `heiA?en` instead of `heißen`.

## Root cause
Google Sheets API returns UTF-8 by default. But when writing via `values.update`, if the destination cell was already populated with text in a different encoding (e.g., from previous runs with latin-1 or cp1252), the new write doesn't replace it cleanly. Or our encoding pipe is broken somewhere.

## Fix needed
Re-run migration after:
1. Clearing `vocab_master` tab completely (cells formatted as plain text, not auto-converted)
2. Re-issuing the write with explicit `valueInputOption: 'RAW'` (which we already do)
3. Verify by reading back

Most likely cause: **the existing Sheet was created with a non-UTF-8 default**. The new tabs (vocab_master + wort_des_tages) should be UTF-8 since they're new.

Quick test: open the Sheet, click cell A2 in vocab_master, check if "lösen" displays correctly or shows as "lAsen". If "lAsen" → encoding is broken at the cell level.