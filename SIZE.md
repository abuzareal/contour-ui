# Package and application size

A package archive, installed dependencies and a browser download are different costs. Contour does not claim to be zero-dependency or the lightest library. `scripts/measure-size.mjs` builds public-import Button, settings-form and table journeys in Vite and pinned Next App Router/webpack, loads fresh browser pages, and writes a JSON report. An additional Button-with-ArrowRight fixture measures the incremental selected-icon journey; it is not an isolated icon-function byte count.

```sh
npm run build
CONTOUR_SIZE_OUTPUT=/absolute/path/sizes.json npm run measure:size
CONTOUR_SIZE_OUTPUT=/absolute/path/check.json npm run check:size
```

Set `CONTOUR_ARCHIVE` to the already packed candidate to reuse it. Fixtures install React/React DOM 19.3.0; Next uses 16.4.0, and Vite/Chromium/Node versions are recorded from the running tools. The report names package/source commit/dirty state, archive checksum/files/compressed/unpacked bytes, the fresh dependency lock hash, resolved dependency versions, fixtures, exclusions, raw/gzip file sizes and actual Resource Timing transfers. These are reproducible fixtures, not latency or production-site benchmarks. No React/framework externals are removed from the application totals. Next shared JS is the intersection of actually fetched URLs across the three fresh routes; route-specific JS is listed separately. Server build output is excluded from client bytes.

Raw minified JS/CSS is reported per actual fetched file and by fixture. Gzip level 9 is reported **per file**, never summed and advertised as an application gzip total. Network transfer, encoded body and decoded body measurements are kept separately, including document/RSC resources. CSS/font requests, archive size and library dependency-closure installed file bytes are separate categories. Install counts exclude Next/Vite/development tooling and record React peers separately. Optional Three.js, Lenis and RHF are absent from core fixtures.

## Selective CSS

The 13 October Vite comparison used identical React 19.3.0 journeys against 0.4.0 and the 0.5 candidate. Raw fetched CSS was 34,642 bytes for the old aggregate, 45,881 bytes for the isolated aggregate, and 14,368 / 22,985 / 38,897 bytes for selective Button / settings / table imports. The isolated aggregate grows by 11,239 bytes because it supplies owned defaults, accessibility rules and prefixed hooks. Selective Button CSS saves about 59% against the old aggregate and 69% against the new aggregate; larger compositions save less. Raw application JS grew roughly 2.9–3.7 KB across Vite/Next fixtures for shared dismissal, positioning and styling support. These are whole application totals, not library-only costs. All system-font fixtures made zero font requests. Exact reports and the reviewed gate baseline record tools, dependency versions and per-file compression; these observations are not immutable promises.

`scoped.css` remains the convenient isolated aggregate; existing `styles.css` remains compatibility mode. Optional family entries are:

| Entry            | Controls/patterns                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| actions.css      | Button/IconButton/DepthButton, SegmentedControl, Magnetic, ThemeToggle; required loading Spinner styles |
| forms.css        | Field/TextField/TextArea/SelectField, Checkbox/RadioGroup/Switch/Slider                                 |
| navigation.css   | Tabs, Breadcrumbs, Pagination, Stepper                                                                  |
| data-display.css | Card/Avatar/Badge/Tag/Stat, DataTable/Timeline and value-display patterns                               |
| feedback.css     | Alert, ToastProvider, ProgressBar, Spinner, Skeleton, EmptyState                                        |
| overlays.css     | Tooltip, Popover, DropdownMenu, Dialog/drawers                                                          |
| effects.css      | TiltCard/FlipCard/Marquee and CSS effects                                                               |

Every entry includes the canonical tokens, owned base/accessibility defaults and shared UI styles. Import all families used by a composition; a table page with filters/buttons/pagination needs forms/actions/data-display/navigation. Family imports do not include fonts, page layout or the legacy reset. Shared CSS is resolved/deduplicated by the tested bundlers; import order remains tokens/base before components, application overrides after. Core JS remains named public imports, not unsupported deep paths. Browser fixtures verify selected-family production styling as well as request sizes; size alone is not a styling check.

## Fonts and installed dependencies

System typography is the isolated default; no Fontsource CSS import is needed. Branded typography is explicit: import exactly one of `fonts-latin.css` (relative packaged assets) or `fonts.css` (existing broader Fontsource coverage). Font binaries/licenses and existing broader coverage are retained. Importing both repeats font-face declarations unnecessarily. Custom fonts can override the three documented prefixed font tokens.

The 13 October initial fresh install used Fontsource 5.3.0 packages (approximately 0.93 MB of installed files together), while Lucide 1.56.0 occupied approximately 35.8 MB of installed files. File sizes are logical byte sums, not filesystem allocation. Those values are resolved-install observations, not browser bytes or immutable promises for caret ranges. Exact versions/bytes are in the fixture report. Selected icon code is tree-shaken; compare the plain/icon Button fixture and separate install-tree cost before deciding to replace Lucide. Contour retains Lucide, its license and API; no icons were copied to advertise fewer dependencies.

Font packaging was evaluated against vendoring broader assets or creating another optional package. This release **retains** the three runtime Fontsource dependencies: they keep existing `fonts.css` imports resolvable and its current subset/license behavior intact. Moving them to devDependencies alone would break consumers. Vendoring would move cost into the archive and add coverage/license maintenance; a separate package would require a versioned migration. There is no mandatory-font-install reduction claim in 0.5. Optional browser loading is already verified; revisit installation packaging only with a separately reviewed migration.

Three.js/Lenis stay optional peers behind their entries. Core imports do not install/load them. Existing lazy Next scene and static-fallback guidance remain tested; downloading 3D after opting in is a separate journey, not an omitted core-byte claim.

## Regression policy

`scripts/size-baseline.json` records the actual measured baseline and budgets. The gate allows 10% plus 1,024 bytes on raw fetched JS/CSS totals for deliberate review and chunk/minifier drift, and requires zero font requests in system-font fixtures. Update a baseline only after reviewing a real report and explaining intentional growth; do not automatically ratchet it to pass. Source/package/dependency changes can alter results even with the same components. Release verification and CI use the same packed archive and run this gate. The library-only samples from earlier research are not substituted for these application measurements.
