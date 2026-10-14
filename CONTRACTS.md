# Architecture, scope and compatibility

Contract version **0.6.0**, reviewed 14 October 2026. Contour is an early 0.x React library with typed controls, paper/ink surfaces, a lime accent, light/dark themes, restrained motion and separate optional depth/scene APIs. The [public API and maturity register](PUBLIC-API.md) lists every exported value, type and stylesheet, its maintainer, status, use and limits.

## Intended adoption scope

Use Contour in React web applications that want its supplied appearance and can use either isolated scoped CSS/themes or the documented legacy global integration. Starting workflows are editable text/native choices, application-owned search/results, scalar locally sorted tables, modal settings and feedback. Existing editorial motion/identity exports remain available within their limits.

The first acceptance workflow is settings/search/table composition: edit a named TextField/SelectField/Checkbox, submit or reset the native form, own pending/error/retry in the app, filter supplied scalar records, change the root theme and open a settings Dialog. The catalogue already has [application patterns](https://contour.abuzr.in/docs/patterns) with local simulated adapters, not a backend. Switch, Slider and RadioGroup have named/external native form and reset contracts since 0.4; their controlled state remains application-owned.

Fetching, response validation, permissions, domain validation, persistence, URL state, server operations and truthful async outcomes belong to the application. A toast or demonstration does not mean data was saved. Apps supply labels, useful content, keyboard paths and accessible compositions.

Current scope includes one allowed-value single-select Combobox and a native Table presentation frame. It excludes multi-select, date/range picker, remote grid, tree, command palette, upload backend, chart/editor engine and non-React adapters. DataTable supports scalar string/number rows and local sorting. Drawer is Dialog placement; banner is Alert layout. New capabilities require a bounded contract, tests, documentation and demonstrated need.

No promise of enterprise completeness, universal embedding, all locales/RTL, every browser/framework or accessibility certification is made. Early 0.x status and experimental limits are adoption information.

## Package and application ownership

| Area                                                                                                          | Owner            |
| ------------------------------------------------------------------------------------------------------------- | ---------------- |
| Reusable controls, semantic tokens, shared theme/motion/browser lifecycle, public APIs and package releases   | contour-ui       |
| Catalogue shell/chapters, executable documentation/source display, discovery, examples and site delivery      | Design-System    |
| Product layouts/routes, domain data/calculations, workflows, requests, validation and product-specific scenes | Each application |

Repositories remain independent. Contour source is public and MIT licensed; catalogue source is currently private while hosted documentation is public. The catalogue's `private: true` prevents npm publication; it is separate from GitHub visibility. Visibility, history/assets/licensing review and CI runner policy are separate decisions.

Catalogue UI/hook/scene compatibility modules intentionally forward public package APIs; they are not copied implementations. Preserve them while callers exist. New integrations can import public exports directly. Editing library source does not update an installed or deployed application.

## Implementation and dependency model

React is the UI runtime. Strict TypeScript/TSX source compiles through `tsc` into ES2022 ESM modules and declarations. The build copies CSS and selected licensed Latin font assets. It does not bundle React or compile the library into a Vite app. Vite serves development/consumer fixtures; Design-System is the Vite application. Consumers can write JavaScript or TypeScript.

| Category                 | Current packages                                                                                                                                                           | Consumer consequence                                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Runtime dependencies     | @base-ui/react 1.9.0 (Combobox); @floating-ui/dom 1.8.0 (positioning); lucide-react; @fontsource-variable/dm-sans; @fontsource-variable/space-grotesk; @fontsource/dm-mono | Install with Contour. Selected imports determine browser output. Font CSS is optional; font installation currently is not. |
| Required peers           | react/react-dom: React 18 (`^18.3.1`) or React 19 (`^19.0.0`)                                                                                                              | App supplies a matching pair; allowed range is broader than individually tested versions.                                  |
| Optional peers           | three: `^0.186.1`; lenis: `^1.3.26`                                                                                                                                        | Core works without either. Install explicitly for the matching optional entry.                                             |
| Development dependencies | TypeScript, Vite, Oxlint, Testing Library, jsdom, Playwright, React/types, table-recipe development adapters and optional peer dev copies                                  | Source authoring/tests/build; not downstream Contour production dependencies.                                              |

Use explicit public paths; deep imports into dist internals are unsupported. CSS is marked as side-effectful to retain imported styles. The archive contains built modules/declarations/assets and release documents, plus public form/adoption/optional recipe sources, standalone starters and a minimal reproduction, with no consumer install scripts or private research. React Hook Form and TanStack Table/Store are example/application dependencies, not Contour runtime dependencies. See FOUNDATION.md for the bounded foundation decision and licensing.

Archive bytes, installed dependency bytes, browser JS/CSS, emitted fonts and actual requested/cached network assets are different measurements. An installed icon collection is not proof all icons download. JavaScript tree shaking does not remove unused aggregate CSS rules automatically. Size claims require version, fixture, tool versions, compression and exclusions; independent component gzip samples cannot be added as an application total.

## Environment and validation policy

| Environment             | Declared or exercised scope                                                                            | Limits                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| React/ReactDOM          | Peer range above; packed matrix exercises 18.3.1, 19.0.0 and 19.3.0                                    | Matching pairs required. Other allowed patches are not individually certified.                                       |
| TypeScript              | Strict source/fixtures; pinned optional/Next fixtures use 5.9.3; React 18 and 19 declarations compiled | No universal older/newer compiler support claim; JS users need no compiler at runtime.                               |
| Node                    | Manifest >=22 for installation/tooling; use 22.12+ or 24+ with current Vite tooling                    | Browser components do not need Node in the browser. Actual runner versions are recorded per check.                   |
| ESM/CSS-capable bundler | Packed Vite consumers exercise imports/declarations/CSS/fonts with no optional peers                   | No CommonJS build or unbundled-browser CSS loader promised.                                                          |
| Next.js                 | Next 16.4.0 / React and ReactDOM 19.3.0, App Router, webpack production build                          | [NEXTJS.md](NEXTJS.md); other versions, Turbopack, Pages Router and Next Lenis remain unverified.                    |
| Optional Three          | Separate consumers and lazy Next mode; explicit Three/types, WebGL, sized host and static fallback     | Experimental API; sampled lifecycle checks do not validate every custom scene/GPU/device.                            |
| Optional scroll         | Separate declaration/build consumer with Lenis and one scroll owner                                    | Caller handles pause/reduced motion; generic Next Lenis integration unverified.                                      |
| Browsers                | Playwright Chromium exercises selected native-dialog/reset/graphics/hydration/catalogue journeys       | Emulation is not a physical device. Chromium/axe is not Firefox/WebKit/Safari or manual VoiceOver/NVDA verification. |

Release gates use one exact archive: types/lint/build, Node/component tests, native-dialog/graphics browser checks, exports/archive inspection, React matrix, optional consumers, pinned Next core/lazy-Three modes and dependency audit. Catalogue has separate required checks/affected journeys. Record checksum, actual environments and passed/failed/skipped/blocked results. Historical results are dated evidence, not a fresh pass; see [RELEASING.md](RELEASING.md).

Interactive modules retain emitted client directives. Server-importable pure helpers do not mean interactive hooks run as Server Components. Keep handlers/state/providers in client boundaries. The bootstrap string has no user interpolation; restrictive CSP requires nonce/hash authorization. A fixture does not certify every deployment/CSP composition.

## Styles, theme and motion

`styles.css` supplies tokens/components/utilities; `tokens.css` supplies tokens alone. Reset and either font stylesheet are optional. Import deliberate app overrides afterward. The legacy aggregate retains global classes such as button/card/menu/mono and --bg/--fg for compatibility. The scoped aggregate and selective families use contour-prefixed classes and semantic tokens; minimal-reset.css is opt-in. Use STYLING.md and SIZE.md to choose imports instead of applying a legacy page reset to an embedded control.

Theme follows root data-theme and legacy aa-theme origin storage. ThemeScope provides a controlled independent subtree with scoped CSS and inherited portal values; its caller owns initial state/persistence. Root useTheme remains document-owned. Optional branded fonts are DM Sans, Space Grotesk and DM Mono. Existing font tokens also permit system fonts. Select Latin or broader coverage intentionally and preserve notices.

Respect system reduced motion and app pause. CSS depth is core; WebGL is separate. Lazy scenes need sized hosts, useful static content outside SceneBoundary, capped rendering cost, no unnecessary hidden/offscreen work and symmetric cleanup. Register owned custom cleanup immediately through onDispose, including failed initialization; avoid double disposal. Mount-captured setup changes need explicit remount.

## Native semantics and known integration limits

Preserve native input/select/details/dialog behavior where appropriate. Future replacements require a written rationale and equivalent labels/descriptions, submission/disabled omission, validation/reset timing, keyboard/focus, modal scroll locking and cleanup, with relevant component/browser checks.

- Actions, ExternalLink, native fields/choices, Dialog and the documented Tabs/Popover parts forward their native targets on React 18/19. Multi-control/presentation wrappers do not imply a singular input ref; see [the composition contract](COMPOSITION.md).
- Checkbox accepts caller IDs while retaining a generated fallback and internal indeterminate behavior alongside the forwarded input ref; caller ARIA validity and descriptions remain composed. Switch/Slider/RadioGroup support named/external form submission and controlled/default/reset behavior; see [the form guide](FORMS.md). Switch refs remain buttons and its checkbox backing submits only while checked; a range has no required constraint.
- Popover/DropdownMenu/Tooltip use collision-aware owner-body/native-dialog portals by default, preserve logical Contour nesting and dismiss one topmost layer. Use portal=false deliberately for inline content. General submenus/third-party modal interoperability are not promised; see OVERLAYS.md.
- Tooltip remains hoverable while pointer/focus is in its trigger/content and supports Escape suppression. Hints remain supplemental/noninteractive; a hover check does not constitute formal accessibility certification.
- Dialog/Tabs/Popover expose typed root and owned-part props/refs; state and ARIA wiring stay protected and caller cancellation composes with internal behavior. The public renderTrigger contract permits one ref-forwarding button where documented; arbitrary root replacement and general polymorphism remain outside the API.
- Disclosure is native details with defaultOpen and required className, not controlled open/onOpenChange. Controlled open state belongs to Popover/DropdownMenu.
- BrandMark/editorial section/heading helpers and selected navigation/print hooks retain inherited page assumptions. They remain supported legacy APIs, not universal product primitives.

Combobox forwards its visible input and Table its native table; their form/state/part boundaries are documented in COMBOBOX.md and RECIPES.md. Documentation promotion and manual assistive-technology verification remain separate work.

## Change, deprecation and migration policy

The public contract includes documented exports/paths, props/events, types, styles/imports/tokens, native/ref/state behavior, visual defaults, theme/storage ownership and support environments. Undocumented private DOM structure is not a customization API; existing global classes used by consumers nevertheless need deliberate migration.

During 0.x, compatible fixes/docs use patch and compatible additions use minor. Incompatible API/type/CSS/token/visual/environment changes require a 0.x minor, explicit release notes and a tested migration. Do not hide narrower props, class/key renames or removals in a patch. Retain aliases/compatibility styles where feasible; document unavoidable changes before upgrade. Legacy status is not formal deprecation or permission to delete.

Formal deprecation identifies replacement/affected versions, marks the API/docs where feasible, and supplies migration guidance; no silent patch removal. After 1.0, incompatible public contracts require a major, additions minor and compatible fixes patch. No fixed support-window or response SLA is promised by this single-maintainer project.

Releases choose an unused version, align manifest/lock/tag/changelog, validate a candidate archive and state material limits. Consumers keep exact pins until the released version is installed, their lockfile updated and relevant checks pass. Package publication does not deploy an application.

1.0 requires settled supported contracts, appropriate docs/evidence, successful outside-use workflows and no known critical/high-impact defect in the promoted scope. Complete stabilization, then rerun final release gates. Deferred component backlog completion is not a prerequisite.

## 0.5 overlay/style/size contract

Default floating portals render in the owner body or active native modal, carrying scoped values/direction. Topmost dismissal, focus customization, closed-ancestor suspension and hover persistence follow OVERLAYS.md. Default portal DOM placement is an explicit 0.x migration; local placement remains available. Stable ref targets and the public void useDismiss return remain unchanged.

Legacy aggregate/reset/tokens/classes remain compatibility mode. Isolated CSS, prefixed schema, controlled ThemeScope, optional minimal reset and measured family entries follow STYLING.md. Product/layout tokens remain legacy/app-owned. Scope persistence is caller-owned; document hooks retain aa-theme behavior. Compact density and a font-install packaging migration were evaluated and deferred with reasons in STYLING.md/SIZE.md. No zero-dependency, universal RTL/AT or production performance claim is added.
