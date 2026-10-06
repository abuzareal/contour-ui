# Changelog

## 0.1.1

- Lock background scrolling while a Dialog or drawer is open. Nested dialogs retain the lock until the last closes; closing or unmounting restores existing document styles and scrollbar space.

- Support React and React DOM 19 alongside 18.3.1, verified with strict clean-consumer installs, declaration checks, production builds, and runtime tests on 18.3.1, 19.0.0, and 19.3.0.
- Preserve flip-card inert faces in both React majors, accept nullable refs in public hooks, and initialize the clipboard timer ref explicitly for React 19 types.
- Let text fields, text areas, and select fields accept caller IDs and retain caller descriptions; keep controlled text counters synchronized with programmatic values.
- Prevent theme buttons from submitting forms, and show final count-up values when IntersectionObserver is unavailable.
- Document direct package imports and retain a repeatable compatibility check before publication.

## 0.1.0

- Extract reusable React components, theme tokens, styling, and optional 3D/scroll entries from the standalone design-system app.
- Synchronize theme controls, tolerate blocked preference storage, and honor system reduced motion for theme changes.
- Reject executable link schemes, preserve tooltip descriptions, make hidden flip-card faces inert, and handle empty tabs and zero-range sliders.
- Ship typed ESM exports, optional font/reset styles, regression tests, and archive-content validation.

This is the first release. The 3D interface is experimental; React 19 compatibility has not been verified.
