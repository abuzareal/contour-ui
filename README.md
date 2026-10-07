# Contour UI

React components and CSS tokens for interfaces with paper and ink surfaces, a lime accent, and light and dark themes. Contour started as the shared UI in a personal portfolio; it now supplies components to the portfolio, its catalogue, Atmos, and Orbit.

Use it when you want this visual style with typed controls, feedback, navigation, and motion. Applications own their layouts, data, validation, and workflows. Three.js scenes and smooth scrolling are separate, optional entries.

[Live catalogue](https://contour.abuzr.in/) · [npm package](https://www.npmjs.com/package/@abuzareal/contour-ui) · [Maintainer](https://github.com/abuzareal)

The catalogue currently uses **0.1.1**; this release is **0.1.2**. Catalogue examples include application patterns as well as package components. Check the exports below before treating an example as an importable component.

## Install

Use an existing React application with a bundler that resolves package CSS imports. Contour ships ESM and TypeScript declarations. The package declares Node.js 22 or newer; repository tooling uses Vite 8, which needs Node.js 22.12+ or 24+.

```sh
npm install @abuzareal/contour-ui@0.1.2 --save-exact
```

Your app must provide matching `react` and `react-dom` versions: **18.3.1 or React 19**. The compatibility script covers 18.3.1, 19.0.0, and 19.3.0; it doesn't establish support for every framework or React Server Component setup. Put interactive components inside a client boundary when your framework requires one.

## First component

Import the styles once in your application entry. Import components directly from the package; no generated files or local re-exports are needed.

```tsx
import { useState } from "react";
import "@abuzareal/contour-ui/reset.css";
import "@abuzareal/contour-ui/fonts.css";
import "@abuzareal/contour-ui/styles.css";
import { Button, TextField, ThemeToggle } from "@abuzareal/contour-ui";

export default function App() {
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("");

  return (
    <main data-motion="off">
      <ThemeToggle animate={false} />
      <TextField
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <Button variant="accent" onClick={() => setSavedName(name)}>
        Save locally
      </Button>
      <p role="status">{savedName && `Saved for this session: ${savedName}`}</p>
    </main>
  );
}
```

This example keeps the value in React state until the component unmounts. To persist it or send it to a server, add that behavior in your app.

`Button` and ordinary controls need no provider. Toasts require `ToastProvider` around components that call `useToast()`.

### Optional Latin fonts

`fonts-latin.css`, added in 0.1.2, keeps DM Sans, Space Grotesk, and DM Mono while loading only Latin WOFF2 files. Use it instead of `fonts.css` for Latin text; keep `fonts.css` when the additional character sets are needed. Existing font imports continue to work.

```tsx
import "@abuzareal/contour-ui/fonts-latin.css";
```

## Styles and customization

| Import            | Purpose                                                                                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `styles.css`      | Required for the supplied appearance: tokens, component styles, and utilities.                                                                     |
| `reset.css`       | Optional global reset. Omit it if your app already has equivalent native-control defaults, border-box sizing, focus styles, and a `[hidden]` rule. |
| `fonts-latin.css` | Optional Latin-only WOFF2 fonts, available since 0.1.2. Use instead of `fonts.css`, not alongside it.                                              |
| `fonts.css`       | Optional self-hosted Space Grotesk, DM Sans, and DM Mono via Fontsource. Your bundler emits the font assets.                                       |
| `tokens.css`      | Tokens alone, for an app that supplies its own component styles. Already included by `styles.css`.                                                 |

Override semantic tokens after importing the styles:

```css
:root {
  --font-sans: system-ui, sans-serif;
  --font-display: system-ui, sans-serif;
}

:root[data-theme="dark"] {
  --bg: #111411;
  --fg: #edf0e8;
}
```

Styles use global component classes and document-level theme tokens. Scope your application's classes to avoid collisions with names such as `.card` and `.button`. Contour's CSS isn't isolated with Shadow DOM or CSS Modules.

The three Fontsource packages and `lucide-react` are direct dependencies. Omitting `fonts.css` keeps its font assets out of your application's bundle; the font packages still install. React and React DOM are peers. Three.js and Lenis are optional peers. Development tools aren't installed as Contour's consumer dependencies; tests and tooling are excluded from the npm archive.

## Theme and motion

Set `data-theme="light"` or `"dark"` on `<html>`. `ThemeToggle` and `useTheme(animate)` read the same document state. The hook returns `{ theme, toggle }`; call `toggle(buttonElement)` from a user action. Preferences use the `aa-theme` local-storage key and are local to the site's origin.

For theme selection before first paint, inject `themeBootstrapScript` from `@abuzareal/contour-ui/theme-bootstrap` into the HTML head at build time. The exported string has no user interpolation. With a strict Content Security Policy, authorize that script with a nonce or hash.

`useMotionPreference()` returns whether the user prefers reduced motion. Combine it with your app's pause state, set `data-motion="off"` on the app wrapper when needed, and pass `motionEnabled` to scenes and `animate` to theme controls. System reduced motion also disables the theme reveal.

## Components

| Area                        | Public exports                                                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actions                     | `Button`, `IconButton`, `ExternalLink`, `SegmentedControl`, `ThemeToggle`                                                                                       |
| Forms                       | `Field`, `TextField`, `TextArea`, `SelectField`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`                                                                   |
| Navigation                  | `Tabs`, `Breadcrumbs`, `Pagination`, `Stepper`, `DropdownMenu`                                                                                                  |
| Data and layout             | `Avatar`, `Badge`, `Card`, `DataTable`, `Disclosure`, `Divider`, `EmptyState`, `Kbd`, `SectionLabel`, `Stat`, `Tag`, `Timeline`                                 |
| Feedback                    | `Alert`, `ProgressBar`, `Skeleton`, `Spinner`, `ToastProvider`, `useToast`                                                                                      |
| Motion and identity         | `BrandMark`, `CountUp`, `DepthButton`, `FlipCard`, `Magnetic`, `Marquee`, `Reveal`, `RevealHeading`, `ScrollProgress`, `TiltCard`, `GitHubIcon`, `LinkedInIcon` |
| Overlays and scene fallback | `Dialog`, `Popover`, `Tooltip`, `SceneBoundary`                                                                                                                 |

The root entry also exports theme, motion, clipboard, dismissal, navigation, and browser-lifecycle hooks plus utility functions. Check `src/index.ts` in a source checkout or `dist/index.d.ts` in the installed package for the complete API. Component declarations describe their props.

Use visible field labels, accessible names for icon buttons, and text alongside status colors. `DataTable` sorts scalar string/number values; `Pagination` expects a positive integer page count and a page within that range. Flip cards use a button and make the hidden face inert.

Props support varies between components. Don't assume every export forwards DOM refs, accepts arbitrary native attributes, supports router `asChild` composition, or integrates with form libraries through refs. Verify the relevant type before adopting it.

## Optional scenes and scrolling

Core imports don't load Three.js or Lenis. Install either only if you use its entry:

```sh
npm install three@^0.186.1 # @abuzareal/contour-ui/three
npm install lenis@^1.3.26 # @abuzareal/contour-ui/scroll
# TypeScript consumers of /three also need the matching declarations:
npm install -D @types/three@^0.186.0
```

`/scroll` exports `useSmoothScroll`. `/three` exports `Sculpture`, `ObjectStudy`, `useThreeStage`, geometry/material helpers, and associated types. CSS depth controls such as `TiltCard` and `FlipCard` are core exports and don't require Three.js.

```tsx
import { lazy, Suspense } from "react";
import { SceneBoundary } from "@abuzareal/contour-ui";

const Sculpture = lazy(() =>
  import("@abuzareal/contour-ui/three").then((module) => ({
    default: module.Sculpture,
  })),
);

export function Preview() {
  return (
    <div>
      <p>Three interlocking links, shown in a WebGL preview when available.</p>
      <SceneBoundary>
        <Suspense fallback={<p>Loading preview…</p>}>
          <Sculpture motionEnabled={false} />
        </Suspense>
      </SceneBoundary>
    </div>
  );
}
```

Give scenes a sized container and a usable static fallback. `SceneBoundary` hides a scene on failure; it doesn't supply fallback content, so keep that content outside the boundary. The 3D API is experimental. Stage setup functions are captured on mount; remount a scene when its setup configuration changes. WebGL availability is a runtime requirement for scenes.

## Release notes and upgrades

**0.1.2** adds the optional `fonts-latin.css` export, clearer setup documentation, and links to the Contour UI documentation site. Component APIs and runtime dependencies remain unchanged from 0.1.1. React 19 support and the interaction fixes from 0.1.1 are retained. `CHANGELOG.md` is included in the package archive and [npm's Code view](https://www.npmjs.com/package/@abuzareal/contour-ui?activeTab=code); it contains the upgrade details for each version.

```sh
npm install @abuzareal/contour-ui@0.1.2 --save-exact
```

Commit your manifest and lockfile, run your application's checks, and review both themes, dialogs, forms, and motion before deploying. Version 0.1.1 includes a document scroll lock for dialogs and drawers. Review any app-level lock before removing it, including nested dialogs and short screens. Package publication doesn't update deployed consumers automatically.

The package is public under MIT. The source repository and its issue tracker currently require collaborator access. Public users can inspect the distributed code, CSS, declarations, and release documents through npm. Contact the [maintainer](https://github.com/abuzareal) for support; see `SECURITY.md` in the package for vulnerability reporting guidance.

## Develop this library

From a source checkout:

```sh
npm ci --ignore-scripts
npx playwright install chromium
npm run validate
npm run test:compat
npm audit
npm pack --dry-run
```

`validate` checks types, lint, builds, Node/component tests, dialog browser behavior, and archive contents. `test:compat` builds packed React 18/19 consumers and compiles the source with React 19 types. `test:consumer` checks one packed consumer, with optional peers absent. `test:optional` verifies strict `/three` and `/scroll` declarations and builds their imports with explicit peers and Three.js types. The compatibility gate runs both checks and verifies the Latin font assets. Compatibility runs need registry access for clean installs.

`src/` owns components, hooks, helpers, and public entries. `styles/` owns CSS. `tests/` owns regressions and browser checks; `scripts/` owns builds and package/consumer checks. `dist/` is generated. `RELEASING.md` in the source checkout and package archive covers validation and publication.

MIT licensed. Fontsource fonts and dependencies retain their own licenses.
