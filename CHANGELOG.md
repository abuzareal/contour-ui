# Changelog

Changes to the published `@abuzareal/contour-ui` package. Version headings refer to package versions, not catalogue or application versions. Consumer projects pin their own version and update separately.

## 0.1.2 — 2026-10-07

An optional font-loading entry and clearer setup documentation. Component APIs and runtime dependencies are unchanged from 0.1.1.

### Added

- `fonts-latin.css`: load Latin WOFF2 files for the three system typefaces. The existing `fonts.css` retains full character coverage.

### Documentation

- Clarify installation, CSS import order, public exports, optional dependencies, and upgrade guidance.
- Pair live examples with their source code on the documentation site. Site navigation, theme transitions, responsive layouts, and the homepage specimen were refined; these site changes do not alter package component APIs.

### Compatibility

- React 18 and 19 remain supported. Three.js and Lenis remain optional. Packed optional-entry checks cover strict TypeScript declarations and production builds.

### Upgrading from 0.1.1

```sh
npm install @abuzareal/contour-ui@0.1.2 --save-exact
```

No component changes are required. To use the smaller Latin font set, replace your `fonts.css` import with `@abuzareal/contour-ui/fonts-latin.css`. Keep the existing import for additional character coverage. Update your manifest and lockfile and check your application's rendered text.

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
