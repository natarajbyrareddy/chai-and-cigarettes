CHAI & CIGARETTES — FIRST BUILD

Files:
- index.html
- styles.css
- app.js
- manifest.json
- sw.js

Features in this first build:
- My count and group count kept separate
- Cigarette entries by brand and current unit price
- Half chai (0.5) and full chai (1.0)
- Consumption-based expense recording
- Price changes apply only to new entries
- Daily and monthly dashboard totals
- Recent history and basic monthly/yearly report
- JSON export and restore
- PWA service worker for offline use after first successful load

IMPORTANT DATA NOTE:
This build stores records in this browser on this device. GitHub Pages hosting does not sync data between devices. Export JSON backups regularly. The "packet details" fields are a reference note only in this first build; packet purchase itself is not counted as an expense. Cigarette expense is counted when a cigarette is recorded as consumed/purchased for the group.

DEPLOY:
1. Create a GitHub repository named chai-and-cigarettes.
2. Upload all five files to the repository root.
3. In repository Settings > Pages, choose Deploy from a branch.
4. Select main and /(root), then Save.
5. Open the published Pages URL on iPhone in Safari.
6. Share > Add to Home Screen.

For a fully reliable iPhone PWA, open the site once while online before using offline.
