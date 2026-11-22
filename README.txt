CHAI & CIGARETTES — VERSION 3 DESIGN REFRESH

Replace these five files in the repository root:
index.html, styles.css, app.js, manifest.json, sw.js

What changed:
- Complete visual redesign: graphite, white and teal palette.
- More compact dashboard and cleaner count cards.
- Clearer hierarchy and tap targets.
- Custom, concise Undo confirmation: owner, item and amount only.
- V3 service-worker cache name to refresh the app assets.

Data:
- app.js intentionally retains localStorage key chaiCigarettesData_v1.
- Existing local records on the same iPhone/browser should remain.
- Do not clear Safari website data. Export a JSON backup before making major browser changes.
- GitHub Pages hosting does not sync records between devices.
