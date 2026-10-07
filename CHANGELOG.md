# Changelog

Changes to the published `@abuzareal/contour-ui` package. Version headings refer to package versions, not catalogue or application versions. Consumer projects pin their own version and update separately.

## Unreleased

### Documentation

- Reorganize the README around installation, a working React example, CSS setup, supported exports, optional entries, and upgrades.
- Explain the catalogue's version and its application-owned examples, the scope of compatibility checks, and which dependencies consumers install.
- Add practical upgrade guidance and a repeatable release-note format. These documentation edits don't change component behavior.

## 0.1.1

A compatibility and interaction update for apps using React 18.3.1 or React 19.

### Compatibility

- Extend the React and React DOM peer ranges to React 19. The compatibility script checks packed consumers on 18.3.1, 19.0.0, and 19.3.0 and compiles library source against React 19 types.
- Preserve inert flip-card faces in both React majors, accept nullable refs in public hooks, and initialize the clipboard timer ref for React 19 types.

### Fixes

- **Dialog and drawers:** lock background scrolling while open. Nested dialogs retain the lock until the last closes; closing or unmounting restores the document's previous styles and scrollbar space. Dialog content remains scrollable on short screens.
- **TextField, TextArea, SelectField:** accept caller IDs and retain caller `aria-describedby` references alongside field hints and errors.
- **Text counters:** reflect programmatic changes to controlled values.
- **ThemeToggle:** use a button type that doesn't submit an enclosing form.
- **CountUp:** show the final value when IntersectionObserver is unavailable.

### Upgrading from 0.1.0

```sh
npm install @abuzareal/contour-ui@0.1.1 --save-exact
```

Commit `package.json` and `package-lock.json`, then run your app's checks. Review dialogs and drawers on short screens and with nested overlays. If your app has its own background-scroll workaround, test its interaction with the library lock before removing it. Check caller-supplied field IDs/descriptions and controlled counter updates.

React 18.3.1 remains supported; adopting React 19 isn't required. Three.js and Lenis remain optional peers behind `/three` and `/scroll`. The 3D API remains experimental. The compatibility matrix doesn't establish React Server Component support or universal framework compatibility.

### Developer tooling

- Document direct package imports and add a repeatable packed-consumer compatibility check before publication.

## 0.1.0

The first package release, extracted from the portfolio and standalone catalogue.

### Added

- Reusable React components, theme tokens, CSS, and separate optional 3D and smooth-scroll entries.
- Typed ESM exports with font and reset styles available as opt-in imports.
- Regression tests, archive-content checks, and consumer build validation.

### Interaction behavior

- Synchronize theme controls, tolerate blocked preference storage, and respect system reduced motion for theme changes.
- Reject executable link schemes, preserve tooltip descriptions, and make hidden flip-card faces inert.
- Handle empty tab lists and zero-range sliders.

### Compatibility at release

React 18.3.1 was the verified baseline for 0.1.0; React 19 compatibility was added in 0.1.1. The 3D API was introduced as experimental.
