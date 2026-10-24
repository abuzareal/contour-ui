# Changelog

Changes to the published `@abuzareal/contour-ui` package. Version headings refer to package versions, not catalogue or application versions. Consumer projects pin their own version and update separately.

## 0.6.4

- Update the public Next.js starter and framework verification fixtures to Next 16.4.3.

- Refresh the jsdom test dependency lock to patched undici 8.12.3.

- Update development tooling and public Vite starter/reproduction manifests to patched Vite 8.3.5.

- Avatar recovers from failed image loads with initials and retries when its source changes.
- SegmentedControl keeps a keyboard entry point when its controlled value is no longer in the options, without selecting a replacement for the application.
- Toast dismissal stays paused until hover, keyboard focus and background-tab conditions have all cleared. Returning gives the user a fresh reading period.

## 0.6.3

Documentation and adoption patch candidate. Publish 54 authored core component guides with one canonical human-authored dataset and 17 executable family examples; complete the 39 previously shared-only PAGE contracts without adding new components. Expand emitted metadata to 56 existing component exports, including class constructors, native inherited props and explicit source defaults; guard declaration/default/source/example drift. The catalogue consumes its own exact published release and is not silently upgraded by this source. No runtime API, dependency, token or CSS changes; optional/deferred capabilities and manual/external evidence remain out of scope/pending. Source version headings do not establish npm publication.

## 0.6.2

Compatible Tooltip correction. A closed portalled tooltip now uses native hidden state so fallback right/bottom positioning cannot enlarge a standards-mode document. Opening still uses collision-aware placement; Escape/blur close it and accessible descriptions remain linked. No public API, dependency, token or theme changes. Production regressions cover both legacy/scoped styles, light/dark, LTR/RTL and narrow/desktop viewports. Source version headings do not establish npm publication.

## 0.6.1

Compatible source corrections; npm publication was verified on 14 October 2026. Restore print theme/disclosures on repeated events or unmount, cancel delayed hash alignment after unmount, preserve delimiter-containing scroll-spy IDs, and close an open Combobox on Tab without cancelling native traversal or changing selection. Add hook/helper/optional-entry references, emitted prop/example drift checks, JavaScript onboarding and migration/history material. Correct the open Combobox background hiding with a labelled non-modal popup, keeping Base UI selection/navigation/positioning parts. Strict whole-document accessibility scans now pass in selected Chromium/WebKit fixtures; the unmodified upstream composition remains a separate failing diagnostic. Add visual QA without excluding axe rules. Manual screen-reader checks remain pending; no universal accessibility claim is made.

## 0.6.0

Add allowed-value selection and public adoption material. This heading records source work, not npm publication.

- Add single-select Combobox backed by pinned Base UI 1.9.0, with stable string IDs, controlled/default selection and query, visible input refs/native form association, missing-value validation, translated status strings, loading/error/retry and Contour theme/layer/native-dialog integration. Existing native controls and overlay APIs remain compatible; Base UI adds installed dependency cost that is disclosed and measured.
- Add semantic Table with caption, native table ref/props and scroll-region part access. DataTable reuses the presentation frame while retaining its existing scalar/local-sort contract. TanStack Table 9.3.1/Store 0.11.2 stay application/development dependencies for a copyable controlled remote recipe.
- Publish executable async search, destructive Dialog confirmation and input composition recipes with cancellation/stale-response guards and truthful failures. Record explicit NumberField, adornment, password and Text/Heading scope decisions rather than speculative new exports.
- Ship independent pinned Vite/Next starters, an existing-app path, providers/forms/navigation/optional-feature guidance, script hash/nonce CSP integration and a public minimal reproduction. Add documentation coverage/issue links, copied-source checks and candidate-versus-registry starter verification.
- Keep existing production size budgets; introduce separate measured Combobox journeys. Expand same-archive React 18/19, package/declaration, browser, starter and CI gates. Manual screen-reader/physical device evidence and private catalogue changes remain separate.

See COMBOBOX.md, RECIPES.md, GETTING-STARTED.md, FOUNDATION.md and DOCS.md. This is an additive 0.x release, not a declaration of 1.0 readiness.

## 0.5.0

Combined overlay, styling and size work. This heading records source work, not npm publication.

- Shared owner-document topmost dismissal and matching paint order for nested/sibling/portaled layers; cancellation, outside focus, ancestor visibility, native backdrop priority and cleanup are covered by regressions. Mobile-menu dismissal cooperates with the same registry.
- Popover/Menu/Tooltip gain collision-aware placement, bounded scrolling, RTL and CSS-zoom handling via Floating UI DOM 1.8.0. Default body/native-modal portals escape clipping and carry theme values/direction. Default DOM placement changes ancestor selectors; use direct part hooks or portal=false for a deliberate local integration. Public refs/state callbacks and void useDismiss remain compatible.
- Hoverable/persistent supplemental tooltips retain descriptions/names and Escape suppression. Public button renderTrigger and focus policies avoid nested controls; native Dialog preserves focus/scroll/lifecycle behavior and accepts explicit initial focus.
- Add isolated scoped.css, prefixed classes/tokens, controlled ThemeScope, minimal-reset.css, token JSON generation, forced-color states, logical RTL layouts and configurable internal labels/formatters. Legacy globals, branded fonts and application-layout compatibility remain; no consumer migration is performed. Compact density is deferred pending a concrete need.
- Add measured Vite/Next Button/settings/table fixtures, selected-icon comparison, actual network/install/archive categories, selective CSS entries and reviewed regression budgets. System fonts make no font requests; Fontsource/Lucide install costs are retained and disclosed. Three.js/Lenis remain optional and absent from core fixtures.

See OVERLAYS.md, STYLING.md and SIZE.md for migration, behavior, measurements and evidence boundaries. Independent applications/site versions are not upgraded by this package release.

## 0.4.0

Native forms and tested application recipes. This heading records source work, not npm publication.

- Switch supports name/form/value, defaultChecked and native required validation through a checkbox backing; checked submits, unchecked/disabled omit. The native ref remains a button and onChange remains boolean.
- Slider supports native name/form/defaultValue, reset, input attributes and formatted native sanitized values; onChange remains numeric. RadioGroup supports caller name/form/defaultValue, required/disabled and per-option native input props/refs; onChange remains a string value.
- Native reset and cancellation work with external owners. Controlled TextField/TextArea/SelectField/Checkbox DOM values now remain aligned with their parent state after native reset, including the select-first-option regression. Controlled values remain parent-owned; defaults for these controls are captured on mount. Checkbox accepts caller IDs and preserves descriptions/validity/indeterminate/ref behavior.
- Ship version-qualified 0.3.0 manual submission guidance and copyable native/React Hook Form recipes. Tested field/service errors, real pending/success states, retry, duplicate-submit prevention, reset/cancel/unmount and stale-result cleanup. RHF is example-only; no new runtime dependency, CSS/theme change or overlay rewrite.

Existing controlled JSX calls remain compatible. Add names only when native submission is intended; unchecked Switch values are omitted rather than serialized as false. Use Controller for value callbacks; native registered fields retain native events. See [FORMS.md](FORMS.md) for copyable sources, reset/registration details and service responsibilities. Independent consumer updates require an exact version/lockfile change and validation.

## 0.3.0

Native refs and focused composition APIs for existing components. This heading records source work, not npm publication.

- Button/IconButton/DepthButton/ThemeToggle, ExternalLink, Checkbox, Slider and Switch forward their native targets on React 18/19. Existing native field refs remain; callback refs stay stable across ordinary prop updates and support React 19 cleanup.
- Dialog, Tabs and Popover accept native root props and typed props/refs for existing parts. Custom IDs preserve relationships; internal state/ARIA/classes remain intact. Caller handlers can prevent default selection/toggle/dismissal, while native dialog cancel remains prop-controlled.
- Tabs retain ID-based focus/refs on reorder and remeasure the underline when root/list customization changes. Existing controlled/default state, menu disabled items/typeahead/stable IDs and focus return remain supported.
- Publish native anchor and pinned Next Link recipes, preserving ordinary/canceled/middle-click navigation without nesting interactive elements or adding Button polymorphism. No runtime dependency or CSS/theme/form contract change is introduced.

Existing JSX calls remain valid. Render components through React; newly ref-enabled exports are forwardRef components rather than plain callable functions. Named Switch/Slider/RadioGroup submission, overlay positioning/nesting corrections and CSS isolation remain separate work. See [COMPOSITION.md](COMPOSITION.md).

```sh
npm install @abuzareal/contour-ui@0.3.0 --save-exact
```

Use that command after registry availability is verified; update the exact pin/lockfile and validate your app.

## 0.2.1

A baseline contract release with compatible Checkbox ARIA and clipboard lifecycle fixes. Export names, prop types, visual defaults, dependencies and optional peer boundaries are unchanged from 0.2.0.

- Checkbox preserves caller-supplied validation attributes and associates its description and error with the native input.
- Clipboard feedback ignores writes that settle after unmount or after a newer copy request. No reset timer is created for an obsolete result.

- Publish the complete public-export and maturity register, including runtime/type-only distinctions, ownership, intended use, documentation destinations, known limits and scoped verification references.
- Publish architecture, adoption scope, environment/support evidence, dependency/size explanations and compatibility/deprecation rules.
- Clarify native form/ref limitations, local overlay behavior, inherited CSS/theme contracts and experimental/legacy APIs. Disclosure exposes defaultOpen; controlled open state belongs to Popover and DropdownMenu.
- Include both reference documents in the verified npm archive. Existing 0.2.0 consumers need no API or style migration; update the exact package pin and lockfile to receive the documents.

```sh
npm install @abuzareal/contour-ui@0.2.1 --save-exact
```

Publication is not established by this source heading. Verify npm availability; the catalogue's installed and hosted versions are separate.

## 0.2.0

- TextField, TextArea and SelectField expose native refs while retaining React 18/19 compatibility. Caller-supplied aria-invalid is preserved when no component error overrides it.
- Uncontrolled field counters and textarea height follow native form reset, including external form association and canceled resets. A browser task waits for the native reset default action, and native input keeps counters current when an edit repeats the pre-reset value.
- Tabs adds activeTabId/onTabChange; Popover and DropdownMenu add open/defaultOpen/onOpenChange. Existing uncontrolled defaults remain.
- DropdownMenu skips disabled items, opens from ArrowUp/ArrowDown, supports label typeahead and accepts stable item ids.
- Three stages release resources after partial initialization failure; setup can register disposal immediately. ObjectStudy reflows paused scenes on resize instead of arranging every animation frame.
- Interactive modules retain client boundaries; ESM export targets also provide a default condition for framework dynamic-module resolution. A pinned packed Next.js App Router fixture checks the candidate. Latin font assets use relative packaged URLs with their licenses for webpack compatibility.
- Contributor setup and issue/PR templates are portable. Release checks reuse one archive across compatibility consumers and publish that verified archive without rerunning source lifecycle gates.

These changes are absent from 0.1.2. A separate Next.js fixture mode covers lazy Three.js; Lenis, alternate-bundler and wider framework support remain outside these checks.

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
