# Public documentation contract and coverage

For Contour 0.6.1, the public package/repository is an independent source of installation, API, recipe and reproduction material. The separate catalogue can describe an older installed release; its visual demos are not proof that this source version is installed there. Catalogue editing and per-component website promotion are separate work.

## Contract for a promoted guide

Every promoted stable component page must contain: purpose and when not to use; public imports and executable TSX; emitted prop types, defaults and inherited native props; anatomy/parts; controlled/default state; native ref target; name/form/required/disabled/reset behavior; keyboard/focus/dismissal; CSS classes/tokens/state selectors; loading/empty/error/long content; RTL/localization; exact version/source; limitations and a version/component issue link with a public reproduction. Mark an item inapplicable with a reason rather than omitting it. A recipe is not a component export. An automated accessibility check is not a manual assistive-technology report.

[Combobox](COMBOBOX.md) is the new full component guide. [Table and application recipes](RECIPES.md) share a guide because Table is a native presentation frame and each recipe owns a different application workflow. [GETTING-STARTED.md](GETTING-STARTED.md) covers standalone/embedded setup, providers by need, theme/bootstrap/CSP, navigation and optional features. [PUBLIC-API.md](PUBLIC-API.md) inventories every runtime/type export with versioned source and status; types without runtime values are not missing components.

## Source and drift checks

Displayed recipe links point to the actual shipped TSX modules, not a second copy. Packed tests copy those files into fresh React 18/19 consumers, compile with strict declarations and exercise behavior. Complete TSX fences in Combobox/onboarding references also compile. Starters are copied from the archive, installed independently and production-tested; final registry mode runs after publication. Source tags/issue versions match package.json; candidate tag links become available at publication. New release changes must update public guide labels, README, declarations and changelog together.

The coverage register below maps public UI components to an explicit shared reference or dedicated guide. “Shared; promotion pending” means discovery/type coverage exists but a full component page has not been completed. It is a **documentation gap**, not an absent export or claim of stable-page completeness. Hook/helper/type coverage is retained in the complete PUBLIC-API register; optional entry setup/lifecycle is shared with GETTING-STARTED. The package's check:docs script compares the component list with source exports, requires guide targets and compiles advertised copyable source through the release gates.

<!-- component-coverage:start -->

| Component        | Public reference                         | Coverage                       |
| ---------------- | ---------------------------------------- | ------------------------------ |
| Alert            | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| Avatar           | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| Badge            | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| BrandMark        | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| Breadcrumbs      | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| Button           | [COMPOSITION.md](COMPOSITION.md)         | Shared; promotion pending      |
| Card             | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| Checkbox         | [FORMS.md](FORMS.md)                     | Shared; promotion pending      |
| Combobox         | [COMBOBOX.md](COMBOBOX.md)               | New component contract covered |
| CountUp          | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| DataTable        | [RECIPES.md](RECIPES.md)                 | Shared; promotion pending      |
| DepthButton      | [COMPOSITION.md](COMPOSITION.md)         | Shared; promotion pending      |
| Dialog           | [OVERLAYS.md](OVERLAYS.md)               | Shared; promotion pending      |
| Disclosure       | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| Divider          | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| DropdownMenu     | [OVERLAYS.md](OVERLAYS.md)               | Shared; promotion pending      |
| EmptyState       | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| ExternalLink     | [COMPOSITION.md](COMPOSITION.md)         | Shared; promotion pending      |
| Field            | [FORMS.md](FORMS.md)                     | Shared; promotion pending      |
| FlipCard         | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| GitHubIcon       | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| IconButton       | [COMPOSITION.md](COMPOSITION.md)         | Shared; promotion pending      |
| Kbd              | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| LinkedInIcon     | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| Magnetic         | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| Marquee          | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| Pagination       | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| Popover          | [OVERLAYS.md](OVERLAYS.md)               | Shared; promotion pending      |
| ProgressBar      | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| RadioGroup       | [FORMS.md](FORMS.md)                     | Shared; promotion pending      |
| Reveal           | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| RevealHeading    | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| SceneBoundary    | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| ScrollProgress   | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| SectionLabel     | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| SegmentedControl | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| SelectField      | [FORMS.md](FORMS.md)                     | Shared; promotion pending      |
| Skeleton         | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| Slider           | [FORMS.md](FORMS.md)                     | Shared; promotion pending      |
| Spinner          | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| Stat             | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| Stepper          | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| Switch           | [FORMS.md](FORMS.md)                     | Shared; promotion pending      |
| Table            | [RECIPES.md](RECIPES.md)                 | New component contract covered |
| Tabs             | [COMPOSITION.md](COMPOSITION.md)         | Shared; promotion pending      |
| Tag              | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| TextArea         | [FORMS.md](FORMS.md)                     | Shared; promotion pending      |
| TextField        | [FORMS.md](FORMS.md)                     | Shared; promotion pending      |
| ThemeScope       | [GETTING-STARTED.md](GETTING-STARTED.md) | Shared; promotion pending      |
| ThemeToggle      | [GETTING-STARTED.md](GETTING-STARTED.md) | Shared; promotion pending      |
| TiltCard         | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| Timeline         | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| ToastProvider    | [PUBLIC-API.md](PUBLIC-API.md)           | Shared; promotion pending      |
| Tooltip          | [OVERLAYS.md](OVERLAYS.md)               | Shared; promotion pending      |

<!-- component-coverage:end -->

## Remaining promotion work

The original website per-component pages, search/pattern discovery, legacy URL preservation, full website prop-page generation and versioned website archives remain separate work. A bounded emitted-declaration prototype and drift gate now live in PROP-REFERENCE.md and docs/prop-metadata.json; REFERENCE.md maps all symbols and style/data paths. Existing shared guides must be audited against this contract before each component is promoted. Manual screen-reader/physical device evidence is tracked separately from automated fixture results. This register deliberately leaves those gaps visible.

## Library reference work

[HOOKS.md](HOOKS.md), [HELPERS.md](HELPERS.md) and [THREE.md](THREE.md) document non-component contracts and lifecycle ownership. [PROP-REFERENCE.md](PROP-REFERENCE.md) audits the nine historical guides and explains generated versus authored metadata. [MIGRATION.md](MIGRATION.md) preserves version-specific contracts and upgrade/rollback steps; [MODELS.md](MODELS.md) distinguishes package/source/company documentation models. [SUPPORT.md](SUPPORT.md) records automated/manual results and failures. Full PAGE website promotion remains separate.

JavaScript and TypeScript onboarding use the same source contract: scripts/build-onboarding.mjs strips types into the shipped JSX example and check:onboarding detects drift. The examples are copied from the actual archive for strict TS/build checks and exercised as independent browser journeys. No private workspace guidance is required to consume them.
