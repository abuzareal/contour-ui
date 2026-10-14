# Reviewed visual baselines

Four open-picker/control fixtures: light/dark at390/1440px, Chromium153.0.8010.12, Playwright1.63.0, reviewed14October2026. macOS (`darwin`) and Ubuntu GitHub Actions (`linux`) retain separate baselines. No screenshot threshold or accessibility assertion was changed.

The fixture imports Latin font assets, but scoped components retain their default semantic system-font tokens. Native font metrics/rasterization differ by OS, including the paragraph wrap at390px and intrinsic button width. The initial Linux run against Mac screenshots failed; its four stable captures and diffs were reviewed before adding the Linux set. Container/popup geometry, labels, colors, focus and long-option wrapping remain intact. An open popup intentionally overlaps subsequent form content.

Use the same browser/OS as the baseline. [Playwright's visual-comparison guidance](https://playwright.dev/docs/test-snapshots) explains platform differences. Future changes require image review; do not auto-update snapshots, increase tolerance or mask controls to obtain a pass. A new platform needs its own reviewed baseline. Pixel checks cover these four fixtures only; functional, geometry, whole-document axe and manual screen-reader checks remain separate.
