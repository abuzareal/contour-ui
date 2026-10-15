# Styling and embedding

0.5 adds an isolated CSS path. Existing `styles.css`, `tokens.css`, `reset.css` and generic component classes remain compatibility mode; importing them still exposes global rules. They are not silently converted into isolated CSS. Choose one style path per component tree.

## First use with system fonts

```tsx
import { Button } from "@abuzareal/contour-ui";
import "@abuzareal/contour-ui/scoped.css";
export function FirstControl() {
  return (
    <div className="contour-root">
      <Button variant="accent">Continue</Button>
    </div>
  );
}
```

No fonts or reset import is needed. `scoped.css` defines only prefixed component hooks/tokens and scope defaults, not page width, section offsets or a site shell. `minimal-reset.css` is optional global box-sizing/body margin/form-font normalization. The original `reset.css` remains the legacy reset/layout compatibility path. Applications own section scroll margins, page-width/site-shell/split-layout/section-intro recipes and their typography/layout. Their old rules remain available through the original styles/reset imports.

Import foreign CSS first, isolated Contour styles next, and deliberate application overrides last. Components emit `contour-*` hooks **and** their old classes. Isolated CSS targets only prefixed hooks; old generic `.button/.card/.tabs/.menu/.mono` rules are not defined by it. A host rule targeting a generic compatibility class on the same Contour element can still compete; put Contour CSS after it or narrow that host rule. This is CSS isolation by names and scopes, not Shadow DOM, arbitrary hostile-selector immunity or a reset of the entire host application.

## Themes without document ownership

```tsx
import { useState } from "react";
import { ThemeScope, ThemeToggle, Button } from "@abuzareal/contour-ui";
export function EmbeddedControls() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  return (
    <ThemeScope theme={theme} onThemeChange={setTheme}>
      <ThemeToggle animate={false} />
      <Button>Scoped action</Button>
      <ThemeScope theme="dark">
        <Button>Dark surface</Button>
      </ThemeScope>
    </ThemeScope>
  );
}
```

`ThemeScope` is a controlled div with `data-contour-theme`, a native ref and native attributes/children. Adjacent/nested light and dark scopes inherit typography/consumer overrides but set semantic color values and color-scheme locally. Omitting `onThemeChange` makes scoped ThemeToggle controls disabled/read-only. Scoped useTheme/ThemeToggle updates only the caller's state; it does not write storage, metadata or the document root and uses an instant transition. Caller-owned persistence can use an application-specific key; do not share a document key across embedded apps accidentally. Plain `[data-contour-theme]` controls CSS only; use ThemeScope for scoped React theme controls.

Without ThemeScope, the original useTheme remains document-owned: root `data-theme`, theme-color metadata, `aa-theme` storage, same-window theme events, cross-tab storage, system preference fallback and optional document view transition. `themeBootstrapScript` retains that legacy pre-paint behavior. The isolated entries omit document-wide view-transition animation rules; an application choosing animated root transitions must provide their CSS (the legacy aggregate supplies its original rules). Embedding does not require invoking it. An application must explicitly choose root ownership; a scope does not sandbox independent root hooks outside it. Storage failures remain tolerated.

Default body/modal portals carry the trigger's variables, direction and font across the DOM move, including theme changes. Native modal portals stay in the browser's top layer. See [overlay container rules](OVERLAYS.md).

## Public tokens and precedence

[The shipped token schema](dist/tokens.json) / `@abuzareal/contour-ui/tokens.json` records each canonical name, semantic role, category, light/dark values, legacy alias and compatibility status. `tokens/schema.json` is the authored source; `npm run build:styles` generates isolated tokens and component CSS. Generated outputs are checked for drift. Schema categories cover color/status, typography, spacing, shape, motion, elevation and layer ordering. Manual semantic review remains necessary; generation does not prove contrast or usability.

Old `--bg/--fg/--acid/--surface/--font-sans/...` names map to `--contour-bg/--contour-fg/--contour-acid/--contour-surface/--contour-font-sans/...`. The old stylesheet keeps the old values/overrides; isolated styles use the new names. Migrate overrides alongside imports. Do not import both aggregates as a migration shortcut. Known old classes retain prefixed aliases; unknown caller classes are preserved. Exact whole-class-attribute comparisons/snapshots need updating for the added aliases; use class membership selectors. `buttonClassName` and `ccx` include both hook forms; `cx` continues to combine arbitrary strings/IDs without prefixing.

Defaults use low-specificity token selectors. Consumer properties on a theme scope override inherited defaults. A nested explicit theme resets themeable semantic colors; set overrides on that nested scope if wanted there. Non-theme constants such as fonts/spacing inherit. Put root/scoped overrides after Contour imports; inline custom properties on an explicit scope win at that element. Customize documented part classes/props; state/ARIA/native behavior remains component-owned. Geometry variables such as progress and tab-indicator coordinates are internal, not design tokens.

Header/focus-band/about/experience/expertise/work/footer values are legacy application/product tokens and remain only in the legacy token file. The isolated schema excludes them. Marquee uses reusable inverse-surface/accent tokens rather than inheriting a page focus-band recipe. Avatar marks, banner accents, depth bases and feedback outlines also inherit scoped theme roles. The isolated inverse accent uses the existing banner olive in dark surfaces; the legacy page-specific ticker color remains unchanged. Porting a consumer means moving those values and page/layout recipes into that application, not removing its styling from the library without a migration.

## Fonts, density and localization

System fonts are the isolated default. Import **one** of `fonts-latin.css` or `fonts.css` after the styles to opt into DM Sans, Space Grotesk and DM Mono. The Latin entry uses packaged relative assets; the original entry keeps Fontsource's broader available character coverage. Neither promises every writing system; fallback fonts still matter. Custom fonts override the three `--contour-font-*` properties on the relevant scope. Fontsource packages still install in this release; optional browser loading is different from optional installation.

Comfortable sizes remain the current contract. Compact density is deferred: no concrete application target/long-content requirement justified another size matrix, and compressed targets could reduce usability. Button sizes remain available; do not invent a global compact mode from demo CSS.

Caller content/labels remain application-owned. New local overrides cover Button loadingLabel; Alert dismissLabel; Breadcrumbs label; Tag removeLabel; Avatar statusLabel/initials; ThemeToggle darkLabel/lightTitle/darkTitle; ToastProvider label/dismissLabel; Pagination previousLabel/nextLabel/pageLabel/formatPage; Switch requiredMessage; CountUp formatValue; DataTable column compare. Existing Dialog closeButtonProps aria-label, Spinner/Stepper labels and Slider format remain usable. Native validation messages follow the browser locale. Field-counter defaults, formatIndex and default initials/typeahead/binary table sorting are not a locale engine; use caller formatters/comparators where provided and visible caller instructions when defaults are unsuitable. No global translation or date library is installed.

Promoted forms, horizontal Tabs/SegmentedControl, pagination icons, menu placement and text alignment are checked in RTL; the keyboard helper accepts an optional direction while retaining LTR defaults. CSS uses logical inline spacing/borders where applicable. Coordinate-driven tab indicators remain physical measurements. No universal RTL promise is made for experimental 3D/effects or application scenes.

Forced-color rules preserve focus, selected control outlines, radio marks, invalid field borders and floating panel boundaries. Production emulation checks both themes and focus; they do not certify every Windows theme or manual screen-reader workflow. Branded paper/ink/lime colors, outlines, typography and depth are retained by compatibility mode and by the isolated branded-font recipe; system-font first use is an intentional option.

## Version and reproduction

Reference version **0.6.2**. A source version does not establish publication; check the npm registry for availability. [Versioned source](https://github.com/abuzareal/contour-ui/tree/v0.6.2/src) and [emitted type inventory](PUBLIC-API.md) describe this contract; tag links resolve after release. [Report Styles 0.6.2](https://github.com/abuzareal/contour-ui/issues/new?template=bug_report.yml&component=Styles&version=0.6.2), using the [public minimal reproduction](examples/reproduction) and synthetic data.
