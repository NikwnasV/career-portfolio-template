# CareVisit browser demo

This portfolio demo adapts the supplied Java Swing / FlatLaf application into a static browser experience. The original desktop application uses Java 25, Maven and MySQL Connector/J. It has not been converted into a hosted Java application.

## Source-informed behavior

- A scan first looks for the most recent visit with the same barcode. If it is IN, an OUT record is saved using that visit's details.
- Otherwise, a registered card supplies the person's name, role and room and saves an IN record.
- An unregistered barcode opens manual entry, requiring barcode and name. The operator chooses IN or OUT and saves.
- Reusable staff cards can be added, edited or removed. Updating a card affects future IN scans; historic records remain unchanged.
- Current visitors are determined by the latest log record for each barcode.
- Log records can be deleted only within five minutes. Deleting a record recalculates the current-visitor state.
- The table switches between latest history (up to 100 records) and current visitors; CSV exports the displayed records.

## Demo boundaries

All people and cards are synthetic. State is stored only in memory and resets on reload. No original SQL data, database credentials, desktop source files or installation artifacts are included in the public website. The browser UI is adapted for the web rather than a screenshot or a pixel-for-pixel copy of Swing. CSV timestamps are UTC, explicitly stated after export; table timestamps use the browser timezone. Card identifiers are matched exactly in this in-memory adaptation.

The original desktop application remains Java/MySQL. A production web edition would need an authenticated web backend and web UI; changing the database to SQLite alone does not make Swing run in a browser.
