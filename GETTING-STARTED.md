# Adopt Contour — 0.6.4

Use [the standalone Vite starter](examples/starters/vite), [Next App Router starter](examples/starters/next), or add one component to an existing app. Each folder is public and independent; no private catalogue source, repository aliases, provider stack or application layout is required. Direct dependencies are exact; generate and commit your application's lockfile, then use npm ci. Candidate source requires an archive until its matching version is published.

## Existing application

```sh
npm install --save-exact @abuzareal/contour-ui@0.6.4
```

Install matching react/react-dom versions in the supported ranges (^18.3.1 or ^19.0.0). React 18.3.1, 19.0.0 and 19.3.0 have independent packed consumer checks; a peer range is not a claim of every framework configuration. Native form/overlay APIs are client interactions. Use the library's emitted declarations instead of a copied API from an old catalogue.

```tsx
import { Button, ThemeScope } from "@abuzareal/contour-ui";
import "@abuzareal/contour-ui/scoped.css";
export function EmbeddedAction() {
  return (
    <ThemeScope theme="light">
      <Button onClick={() => console.log("Local action")}>Continue</Button>
    </ThemeScope>
  );
}
```

This fixed light scope is intentional: it does not own the host document theme/storage. To let ThemeToggle change it, supply controlled theme and onThemeChange to ThemeScope. A fixed scope without a callback disables its toggle. No document bootstrap is needed for a deterministic embedded scope. Keep your router, reset and fonts. scoped.css supplies tokens and all prefixed component styles; selective entry imports are documented in [SIZE.md](SIZE.md). The opt-in minimal-reset.css and legacy reset.css have different scopes; do not import a global reset accidentally. System fonts work without fonts.css/fonts-latin.css. Native button/anchor form roles remain intact.

## Providers, forms and navigation

Button, fields, Combobox, Table, Dialog, Popover and ordinary controls work without a provider. Dialog/Popover open state belongs to the caller. **ToastProvider** is required only around useToast consumers; mount one owner for the part of the app that needs its queue. ThemeScope is an optional embedded-theme boundary, not a universal installation requirement. No Base UI provider or table engine is required to consume Combobox. Direction/theme is inherited into its portal.

The [native/RHF form recipes](FORMS.md) use the actual files in examples/forms. Native name/form/required/disabled/reset contracts remain native; RadioGroup/Slider/Switch differences are documented there. React Hook Form is an application dependency only for the RHF recipe; it is absent from core consumers. Application adapters own cross-field validation, parsed data, persistence, pending/error/retry and server validation. The [new recipes](RECIPES.md) add async selection, safe confirmation and remote tables without turning them into hidden services.

Use Button for actions and native anchors or the router's Link for navigation. [COMPOSITION.md](COMPOSITION.md#native-and-router-links) has executable anchor/Next examples using buttonClassName("secondary"). Keep href/to, modified clicks, context menus and ref forwarding; never nest an anchor in a button. The Vite starter uses a native hash link; the Next starter uses Next Link with ordinary client navigation. Other router adapters need their own tested ref/anchor contract; do not infer universal support.

## Document theme and CSP

For a document-owned theme, import themeBootstrapScript/themeColors from the **pure server-safe** `@abuzareal/contour-ui/theme-bootstrap` subpath. Inject that exact script before the first paint. It reads aa-theme only for light/dark, falls back to the system preference, sets html[data-theme] and updates an existing theme-color meta. themeColors is light #f2f3ee / dark #0f100d. Blocked storage falls back without throwing; useTheme's root behavior owns document attributes/storage and follows system changes when there is no stored choice. It is not an arbitrary persisted settings provider. ThemeToggle's accessible name is constant (“Dark theme” by default); aria-pressed expresses state and title describes the next action.

Hash **the exact script bytes** with SHA-256 and authorize that hash in script-src, or use a cryptographically random per-request nonce on the bootstrap and framework scripts. Do not copy a stale hash across versions or reuse/cache a nonce. The actual [Vite config](examples/starters/vite/vite.config.ts) calculates and inserts the hash; [Next proxy](examples/starters/next/proxy.ts) and [layout](examples/starters/next/app/layout.tsx) carry a new nonce through server rendering. Next's nonce setup is dynamic, not static export/ISR/shared-cache output. Both paths are production browser checks, not merely snippets. Only the html attribute touched before hydration uses suppressHydrationWarning in Next.

Production scripts do not require unsafe-inline/unsafe-eval in these starters. **Inline styles are allowed** for library geometry and host styles; this is a restricted script policy, not a claim that every CSS directive can be nonce-only. Configure font/image/service origins deliberately. Root bootstrap does not initialize independent ThemeScope state; choose a deterministic scope or derive initial state explicitly in your app. Do not hide arbitrary hydration mismatches.

## Optional features

Core imports require neither Three.js nor Lenis. Opt in only for a real product need:

```sh
npm install --save-exact three@0.186.1
# Only for the optional scrolling recipe:
npm install --save-exact lenis@1.3.26
```

Copy [LazyScene.tsx](examples/optional/LazyScene.tsx) and [optional.css](examples/optional/optional.css). It imports /three only after “Load 3D study”, gives the host a real block size, retains useful static artwork outside SceneBoundary/Suspense, and passes both app pause and system reduced-motion state. SceneBoundary hides failed scenes; it has no fallback prop and cannot manufacture a visual replacement. Sculpture/ObjectStudy are decorative scene components; product meaning stays in adjacent DOM content. The optional entry includes the public scene APIs/types; use [PUBLIC-API.md](PUBLIC-API.md) for their exact experimental contracts.

useThreeStage captures setup/cameraDistance once per mount. setup receives scene/camera/renderer and optional onDispose registration. Register cleanup immediately after every owned GPU allocation, including resources created before setup can throw. A returned StageScene supplies update, rest, dispose and optional resize. Do not double-dispose the same resource through both onDispose and dispose. The stage caps pixel ratio at 1.75, observes sizing, stops unnecessary hidden/offscreen animation and redraws a still pose when paused. The caller owns stable setup inputs, meaningful sizing, lazy boundaries, static fallback and content. Unavailable WebGL/partial setup must leave useful DOM content. No physical GPU/device coverage is implied by headless fixtures.

Copy [OptionalSmoothScroll.tsx](examples/optional/OptionalSmoothScroll.tsx) and [SmoothScrollOwner.tsx](examples/optional/SmoothScrollOwner.tsx) only after installing Lenis. The lazy owner imports lenis/dist/lenis.css and calls /scroll's useSmoothScroll once. Native scroll works until opt-in. Reduced motion disables/unmounts that owner; unmount destroys Lenis. Do not mount multiple RAF/scroll owners, fight native focus/hash restoration or silently enable smooth motion for users who requested reduction. This recipe is for the Vite/client integration; Next Lenis is **unverified**.

## Framework boundaries and reproduction

Supported evidence names the exact pair: Next 16.4.3 App Router, React/React DOM 19.3.0, webpack production build, plus its separate optional lazy Three fixture. Turbopack, Pages Router, Next Lenis, static nonce export and arbitrary third-party modal interoperability are not promoted to supported configurations. Vite starter pins 8.3.2 with React 18.3.1. Server-safe helper imports, client directives, declarations and hydration are checked independently; SSR rendering alone does not prove hydration.

Copy [the public reproduction folder](examples/reproduction), reduce it to the failing interaction, and include exact package/browser versions and keyboard steps. Its [issue link](https://github.com/abuzareal/contour-ui/issues/new?template=bug_report.yml&title=Integration%200.6.4%3A%20&component=Integration&version=0.6.4) contains version/component, not private data. Report only synthetic records and public reproducible source. [Documentation coverage and limits](DOCS.md).

## JavaScript and TypeScript examples

Copy [SettingsForm.jsx](examples/onboarding/SettingsForm.jsx) for a JavaScript React app or [SettingsForm.tsx](examples/onboarding/SettingsForm.tsx) for TypeScript. Render SettingsForm after importing scoped.css; both inspect the same native FormData locally, reset defaults/output and focus the native name input. Neither saves data or needs a provider. The JSX is generated by stripping types from the TSX source, not a second hand-maintained example; it contains no TypeScript syntax. Bring your own React entry/router and server validation. See MIGRATION.md for upgrades and older contracts.
