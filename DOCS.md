# Public documentation contract and coverage

For Contour 0.6.4, the public package/repository is an independent source of installation, API, recipe and reproduction material. The separate catalogue can describe an older installed release; its visual demos are not proof that this source version is installed there. Catalogue editing and per-component website promotion are separate work.

## Contract for a promoted guide

Every promoted stable component page must contain: purpose and when not to use; public imports and executable TSX; emitted prop types, defaults and inherited native props; anatomy/parts; controlled/default state; native ref target; name/form/required/disabled/reset behavior; keyboard/focus/dismissal; CSS classes/tokens/state selectors; loading/empty/error/long content; RTL/localization; exact version/source; limitations and a version/component issue link with a public reproduction. Mark an item inapplicable with a reason rather than omitting it. A recipe is not a component export. An automated accessibility check is not a manual assistive-technology report.

[Combobox](COMBOBOX.md) is the new full component guide. [Table and application recipes](RECIPES.md) share a guide because Table is a native presentation frame and each recipe owns a different application workflow. [GETTING-STARTED.md](GETTING-STARTED.md) covers standalone/embedded setup, providers by need, theme/bootstrap/CSP, navigation and optional features. [PUBLIC-API.md](PUBLIC-API.md) inventories every runtime/type export with versioned source and status; types without runtime values are not missing components.

## Source and drift checks

Displayed recipe links point to the actual shipped TSX modules, not a second copy. Packed tests copy those files into fresh React 18/19 consumers, compile with strict declarations and exercise behavior. Complete TSX fences in Combobox/onboarding references also compile. Starters are copied from the archive, installed independently and production-tested; final registry mode runs after publication. Source tags/issue versions match package.json; candidate tag links become available at publication. New release changes must update public guide labels, README, declarations and changelog together.

The coverage register below maps every core UI component to its authored public contract and runnable family example. Optional scene exports retain their experimental shared reference. Catalogue delivery, manual assistive-technology evidence and stable API maturity remain separate from authored guide coverage. Hook/helper/type coverage is retained in the complete PUBLIC-API register; optional entry setup/lifecycle is shared with GETTING-STARTED. The package's check:docs script compares the component list with source exports, requires guide targets and compiles advertised copyable source through the release gates.

<!-- component-coverage:start -->

| Component | Public reference | Coverage |
| --- | --- | --- |
| Alert | [Component guide](COMPONENT-GUIDES.md#alert) | Authored public contract; catalogue release is separate |
| Avatar | [Component guide](COMPONENT-GUIDES.md#avatar) | Authored public contract; catalogue release is separate |
| Badge | [Component guide](COMPONENT-GUIDES.md#badge) | Authored public contract; catalogue release is separate |
| BrandMark | [Component guide](COMPONENT-GUIDES.md#brandmark) | Authored public contract; catalogue release is separate |
| Breadcrumbs | [Component guide](COMPONENT-GUIDES.md#breadcrumbs) | Authored public contract; catalogue release is separate |
| Button | [Component guide](COMPONENT-GUIDES.md#button) | Authored public contract; catalogue release is separate |
| Card | [Component guide](COMPONENT-GUIDES.md#card) | Authored public contract; catalogue release is separate |
| Checkbox | [Component guide](COMPONENT-GUIDES.md#checkbox) | Authored public contract; catalogue release is separate |
| Combobox | [Component guide](COMPONENT-GUIDES.md#combobox) | Authored public contract; catalogue release is separate |
| CountUp | [Component guide](COMPONENT-GUIDES.md#countup) | Authored public contract; catalogue release is separate |
| DataTable | [Component guide](COMPONENT-GUIDES.md#datatable) | Authored public contract; catalogue release is separate |
| DepthButton | [Component guide](COMPONENT-GUIDES.md#depthbutton) | Authored public contract; catalogue release is separate |
| Dialog | [Component guide](COMPONENT-GUIDES.md#dialog) | Authored public contract; catalogue release is separate |
| Disclosure | [Component guide](COMPONENT-GUIDES.md#disclosure) | Authored public contract; catalogue release is separate |
| Divider | [Component guide](COMPONENT-GUIDES.md#divider) | Authored public contract; catalogue release is separate |
| DropdownMenu | [Component guide](COMPONENT-GUIDES.md#dropdownmenu) | Authored public contract; catalogue release is separate |
| EmptyState | [Component guide](COMPONENT-GUIDES.md#emptystate) | Authored public contract; catalogue release is separate |
| ExternalLink | [Component guide](COMPONENT-GUIDES.md#externallink) | Authored public contract; catalogue release is separate |
| Field | [Component guide](COMPONENT-GUIDES.md#field) | Authored public contract; catalogue release is separate |
| FlipCard | [Component guide](COMPONENT-GUIDES.md#flipcard) | Authored public contract; catalogue release is separate |
| GitHubIcon | [Component guide](COMPONENT-GUIDES.md#githubicon) | Authored public contract; catalogue release is separate |
| IconButton | [Component guide](COMPONENT-GUIDES.md#iconbutton) | Authored public contract; catalogue release is separate |
| Kbd | [Component guide](COMPONENT-GUIDES.md#kbd) | Authored public contract; catalogue release is separate |
| LinkedInIcon | [Component guide](COMPONENT-GUIDES.md#linkedinicon) | Authored public contract; catalogue release is separate |
| Magnetic | [Component guide](COMPONENT-GUIDES.md#magnetic) | Authored public contract; catalogue release is separate |
| Marquee | [Component guide](COMPONENT-GUIDES.md#marquee) | Authored public contract; catalogue release is separate |
| Pagination | [Component guide](COMPONENT-GUIDES.md#pagination) | Authored public contract; catalogue release is separate |
| Popover | [Component guide](COMPONENT-GUIDES.md#popover) | Authored public contract; catalogue release is separate |
| ProgressBar | [Component guide](COMPONENT-GUIDES.md#progressbar) | Authored public contract; catalogue release is separate |
| RadioGroup | [Component guide](COMPONENT-GUIDES.md#radiogroup) | Authored public contract; catalogue release is separate |
| Reveal | [Component guide](COMPONENT-GUIDES.md#reveal) | Authored public contract; catalogue release is separate |
| RevealHeading | [Component guide](COMPONENT-GUIDES.md#revealheading) | Authored public contract; catalogue release is separate |
| SceneBoundary | [Component guide](COMPONENT-GUIDES.md#sceneboundary) | Authored public contract; catalogue release is separate |
| ScrollProgress | [Component guide](COMPONENT-GUIDES.md#scrollprogress) | Authored public contract; catalogue release is separate |
| SectionLabel | [Component guide](COMPONENT-GUIDES.md#sectionlabel) | Authored public contract; catalogue release is separate |
| SegmentedControl | [Component guide](COMPONENT-GUIDES.md#segmentedcontrol) | Authored public contract; catalogue release is separate |
| SelectField | [Component guide](COMPONENT-GUIDES.md#selectfield) | Authored public contract; catalogue release is separate |
| Skeleton | [Component guide](COMPONENT-GUIDES.md#skeleton) | Authored public contract; catalogue release is separate |
| Slider | [Component guide](COMPONENT-GUIDES.md#slider) | Authored public contract; catalogue release is separate |
| Spinner | [Component guide](COMPONENT-GUIDES.md#spinner) | Authored public contract; catalogue release is separate |
| Stat | [Component guide](COMPONENT-GUIDES.md#stat) | Authored public contract; catalogue release is separate |
| Stepper | [Component guide](COMPONENT-GUIDES.md#stepper) | Authored public contract; catalogue release is separate |
| Switch | [Component guide](COMPONENT-GUIDES.md#switch) | Authored public contract; catalogue release is separate |
| Table | [Component guide](COMPONENT-GUIDES.md#table) | Authored public contract; catalogue release is separate |
| Tabs | [Component guide](COMPONENT-GUIDES.md#tabs) | Authored public contract; catalogue release is separate |
| Tag | [Component guide](COMPONENT-GUIDES.md#tag) | Authored public contract; catalogue release is separate |
| TextArea | [Component guide](COMPONENT-GUIDES.md#textarea) | Authored public contract; catalogue release is separate |
| TextField | [Component guide](COMPONENT-GUIDES.md#textfield) | Authored public contract; catalogue release is separate |
| ThemeScope | [Component guide](COMPONENT-GUIDES.md#themescope) | Authored public contract; catalogue release is separate |
| ThemeToggle | [Component guide](COMPONENT-GUIDES.md#themetoggle) | Authored public contract; catalogue release is separate |
| TiltCard | [Component guide](COMPONENT-GUIDES.md#tiltcard) | Authored public contract; catalogue release is separate |
| Timeline | [Component guide](COMPONENT-GUIDES.md#timeline) | Authored public contract; catalogue release is separate |
| ToastProvider | [Component guide](COMPONENT-GUIDES.md#toastprovider) | Authored public contract; catalogue release is separate |
| Tooltip | [Component guide](COMPONENT-GUIDES.md#tooltip) | Authored public contract; catalogue release is separate |

<!-- component-coverage:end -->

## Authored guide and catalogue scope

All 54 existing core components have an authored public contract in COMPONENT-GUIDES.md, maintained from docs/component-guides.json. Each links an exact executable TSX family under examples/catalogue. Props/defaults/overloads, purpose, anatomy, state, native forms/ref, keyboard, styling, edge states, localization and explicit limits are checked independently of export discovery. The private catalogue consumes its own exact published package; a new source guide does not silently update that website. Optional scene exports retain THREE.md. Manual screen-reader, physical device and outside developer results are still separate evidence gates, not completed by these pages.

## Library reference work

[HOOKS.md](HOOKS.md), [HELPERS.md](HELPERS.md) and [THREE.md](THREE.md) document non-component contracts and lifecycle ownership. [PROP-REFERENCE.md](PROP-REFERENCE.md) audits the nine historical guides and explains generated versus authored metadata. [MIGRATION.md](MIGRATION.md) preserves version-specific contracts and upgrade/rollback steps; [MODELS.md](MODELS.md) distinguishes package/source/company documentation models. [SUPPORT.md](SUPPORT.md) records automated/manual results and failures. Catalogue delivery follows an explicit compatible release and actual consumer checks.

JavaScript and TypeScript onboarding use the same source contract: scripts/build-onboarding.mjs strips types into the shipped JSX example and check:onboarding detects drift. The examples are copied from the actual archive for strict TS/build checks and exercised as independent browser journeys. No private workspace guidance is required to consume them.
