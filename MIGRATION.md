# Upgrades and older contracts

Use the exact released package version and its declarations. A Git branch, catalogue label or successful local build does not identify what your application installed. Keep the previous lockfile available, review API/type/style/theme/visual changes, install an exact published version, run the application's checks and compare real form/overlay journeys before deployment. Publishing Contour does not upgrade a consumer.

## Release history access

| Version boundary             | Inspect the immutable source                                            | Main contract change                                                                                                     |
| ---------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 0.2.0 baseline               | [README](https://github.com/abuzareal/contour-ui/blob/v0.2.0/README.md) | Earlier native fields and wrapper limits; do not project later ref/form/portal contracts backwards.                      |
| 0.2.1 baseline documentation | [README](https://github.com/abuzareal/contour-ui/blob/v0.2.1/README.md) | Explicit architecture, dependency, compatibility and maturity contract.                                                  |
| 0.3.0 API                    | [README](https://github.com/abuzareal/contour-ui/blob/v0.3.0/README.md) | Native refs/attributes and typed owned parts; inspect the actual released component, not a generic polymorphic API.      |
| 0.4.0 forms                  | [README](https://github.com/abuzareal/contour-ui/blob/v0.4.0/README.md) | Named custom-control submission, defaults/reset and native/RHF recipes.                                                  |
| 0.5.0 overlays/styles        | [README](https://github.com/abuzareal/contour-ui/blob/v0.5.0/README.md) | Default portals/collision/layer semantics and isolated prefixed CSS/theme scope; legacy style paths retained.            |
| 0.6.0 additions              | [README](https://github.com/abuzareal/contour-ui/blob/v0.6.0/README.md) | Combobox, semantic Table, application recipes and standalone starters. No general grid/NumberField/PasswordInput export. |

An old guide remains tied to its version. To inspect the emitted declarations/CSS of an older version, use `npm pack @abuzareal/contour-ui@VERSION --ignore-scripts` in a disposable directory and inspect the archive without running application code. Tagged source retains authored documentation available at that release; do not invent an older guide URL when it did not exist. No indefinite hosted website archive/SLA is promised. Current website routes and migration of its own installed release are separate catalogue work.

## Refs and forms

Before native ref support, some components needed an application-specific wrapper; do not copy that workaround into a current application automatically. The current public targets are documented in COMPOSITION.md and FORMS.md. For example, `const input = useRef<HTMLInputElement>(null)` and `<TextField ref={input} ... />` target the native input; a wrapper div is not the form-registration target. Switch remains a button ref with a backing successful control, not an HTMLInputElement ref.

The shipped [ManualSettingsForm-0.3.0.tsx](examples/forms/ManualSettingsForm-0.3.0.tsx) preserves the old application-assembled payload path. [NativeSettingsForm.tsx](examples/forms/NativeSettingsForm.tsx) and [HookFormSettingsForm.tsx](examples/forms/HookFormSettingsForm.tsx) are the current copied-and-tested contracts. Add name/form/value deliberately and verify checked-only omission, required validation, disabled fields, form.reset(), controlled state and error focus. Do not retain both old manually appended values and new named backing controls, producing duplicate submissions. Server validation/authorization remains necessary.

## CSS and theme

Before: importing legacy styles.css/reset.css supplies global component/reset rules and unprefixed classes. For an embedded current control, choose scoped.css or selective families and opt into minimal-reset only if required. Legacy paths remain available for an intentional gradual migration; changing imports alone does not port application overrides.

Before an override might use `.card .popover-panel`. Default portaled content is no longer a DOM descendant of that card. After migration, attach a scoped application class through the documented panelProps/class hook and style that class; do not depend on private DOM ancestry. `portal={false}` preserves inline placement where supported but restores ancestor clipping constraints. Exercise native-dialog top-layer placement, viewport edges and one-layer Escape in the final app.

Before root useTheme/bootstrap owns the whole document and aa-theme preference. After embedding, controlled ThemeScope owns an independent subtree and optional onThemeChange; it needs no document bootstrap. Do not mount document-theme owners merely to style one card. Preserve semantic token names, import order and font choice from STYLING.md; system fonts need no font stylesheet. Review any app-specific aliases before removing old reset/layout assumptions.

## Rollout and rollback

1. Record the application's old package/lock version and affected routes; read the destination release's CHANGELOG, CONTRACTS and limits.
2. Install the exact published package with --save-exact; retain a real registry install rather than a workspace link.
3. Compile declarations, lint/build and exercise forms, refs, overlays, styling/theme and optional scenes actually used. Verify narrow/long content and keyboard behavior. Compare runtime support with SUPPORT.md.
4. Commit manifest/lockfile and required composition changes together. Deploy only with authorization, then verify hosted version/content separately.
5. If rollback is needed, restore the previous exact package/lock and compatible application composition together; do not unpublish or overwrite an existing library version.

The 0.6.1 work is intended as compatible lifecycle/documentation corrections. Its publication state and support evidence must be checked before installation; a candidate version in source is not an npm release. No universal screen-reader or framework certification is added by these migration instructions.

## Version and reproduction

Reference version **0.6.4**. A source version does not establish publication; check the npm registry for availability. [Versioned source](https://github.com/abuzareal/contour-ui/tree/v0.6.4/src) and [emitted type inventory](PUBLIC-API.md) describe this contract; tag links resolve after release. [Report Migration 0.6.4](https://github.com/abuzareal/contour-ui/issues/new?template=bug_report.yml&component=Migration&version=0.6.4), using the [public minimal reproduction](examples/reproduction) and synthetic data.
