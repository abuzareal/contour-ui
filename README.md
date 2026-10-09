# Contour UI

React components and CSS tokens for interfaces with paper and ink surfaces, a lime accent, and light and dark themes. Contour started as the shared UI in a personal portfolio; it now supplies components to the portfolio, its catalogue, Atmos, and Orbit.

Use it when you want this visual style with typed controls, feedback, navigation, and motion. Applications own their layouts, data, validation, and workflows. Three.js scenes and smooth scrolling are separate, optional entries.

[Live catalogue](https://contour.abuzr.in/) · [npm package](https://www.npmjs.com/package/@abuzareal/contour-ui) · [Maintainer](https://github.com/abuzareal)

This source checkout targets **0.2.0**. Package publication and application upgrades are separate; check the npm registry for release availability and each application's manifest for its installed version. Catalogue examples include application patterns as well as package components. Check the exports below before treating an example as an importable component.

## Install

Use an existing React application with a bundler that resolves package CSS imports. Contour ships ESM and TypeScript declarations. The package declares Node.js 22 or newer; repository tooling uses Vite 8, which needs Node.js 22.12+ or 24+.

```sh
npm install @abuzareal/contour-ui@0.2.0 --save-exact
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

**0.2.0** adds native field refs, controlled tabs and disclosure state, menu keyboard improvements, native reset synchronization, Three.js lifecycle fixes and a tested Next.js App Router integration. Existing uncontrolled defaults and React 18/19 support remain. `fonts-latin.css`, introduced in 0.1.2, now uses packaged relative font URLs for webpack resolution. `CHANGELOG.md` is included in the package archive and [npm's Code view](https://www.npmjs.com/package/@abuzareal/contour-ui?activeTab=code); it contains the upgrade details for each version.

```sh
npm install @abuzareal/contour-ui@0.2.0 --save-exact
```

Commit your manifest and lockfile, run your application's checks, and review both themes, dialogs, forms, and motion before deploying. Version 0.1.1 includes a document scroll lock for dialogs and drawers. Review any app-level lock before removing it, including nested dialogs and short screens. Package publication doesn't update deployed consumers automatically.

The package and [source repository](https://github.com/abuzareal/contour-ui) are public under MIT. Report reproducible defects in the [issue tracker](https://github.com/abuzareal/contour-ui/issues); use [SECURITY.md](SECURITY.md) for private vulnerability reporting. Public users can inspect code, CSS, declarations and release documents through GitHub or npm.

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

`validate` checks types, lint, builds, Node/component tests, dialog and Three.js browser behavior, and archive contents. `test:compat` builds packed React 18/19 consumers and compiles the source with React 19 types. `test:consumer` checks one packed consumer, with optional peers absent. `test:optional` verifies strict `/three` and `/scroll` declarations and builds their imports with explicit peers and Three.js types. The compatibility gate runs both checks and verifies the Latin font assets. Compatibility runs need registry access for clean installs.

`src/` owns components, hooks, helpers, and public entries. `styles/` owns CSS. `tests/` owns regressions and browser checks; `scripts/` owns builds and package/consumer checks. `dist/` is generated. `RELEASING.md` in the source checkout and package archive covers validation and publication.

MIT licensed. Fontsource fonts and dependencies retain their own licenses.

## APIs added in 0.2.0

Version 0.2.0 adds native refs to TextField, TextArea and SelectField; synchronizes uncontrolled counters and auto-resize after native form reset; adds controlled Tabs (`activeTabId`, `onTabChange`) and disclosures (`open`, `defaultOpen`, `onOpenChange`); and adds disabled menu items, stable item ids and typeahead. These additions are absent from 0.1.2. Switching a field/disclosure between controlled and uncontrolled ownership during its lifetime is unsupported.

Existing uncontrolled calls remain valid. Use a native ref to focus a field or integrate a form controller; controlled tabs and disclosures require the caller to update the selected id or open state:

```tsx
import { useRef, useState } from "react";
import { Button, Popover, Tabs, TextField } from "@abuzareal/contour-ui";

export function AccountControls() {
  const input = useRef<HTMLInputElement>(null);
  const [activeTabId, setActiveTabId] = useState("details");
  const [open, setOpen] = useState(false);

  return (
    <>
      <TextField ref={input} label="Name" name="name" />
      <Button onClick={() => input.current?.focus()}>Focus name</Button>
      <Tabs
        label="Account"
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        tabs={[
          { id: "details", label: "Details", content: <p>Account details</p> },
          {
            id: "settings",
            label: "Settings",
            content: <p>Account settings</p>,
          },
        ]}
      />
      <Popover trigger="Help" title="Help" open={open} onOpenChange={setOpen}>
        <p>Account help</p>
      </Popover>
    </>
  );
}
```

Interactive module boundaries retain `use client` in the built package. The pinned Next.js App Router consumer checks the packed 0.2.0 archive. Follow [Next.js setup](NEXTJS.md) for the pinned Next.js 16.4.0 / React 19.3.0 pair. Pure URL/theme-bootstrap helpers remain usable from the server. A separate fixture mode checks lazy optional Three.js loading and navigation cleanup. Lenis integration, other Next versions and alternate bundlers remain separate compatibility questions.

Custom `useThreeStage` setup can register disposal through `context.onDispose?.(cleanup)` immediately after acquiring each resource, including resources allocated before setup returns. Registered resources are released on failed initialization and unmount; avoid also disposing the same resource in `StageScene.dispose`. A stage may implement `resize()` to reflow after aspect changes while motion is paused.

## Compatibility boundaries

Styles are global, not a scoped CSS engine. Existing class names such as `.field` and `.menu` can collide with host CSS. Import Contour styles before deliberate application overrides; keep application selectors area-prefixed. The optional reset and fonts affect the document. Tokens use root `data-theme`; `useTheme` retains the legacy `aa-theme` local-storage key for compatibility. A multi-library page must decide which system owns its root theme.

Menus and popovers remain local panels without portals or collision detection; use them where the container can accommodate their content. No submenu or arbitrary trigger-composition contract is claimed. BrandMark and page/editorial helpers preserve existing identity and layout assumptions; they are optional exports rather than universal primitives. Do not copy private internals or deep-import them.

For contribution setup and review expectations, see [CONTRIBUTING.md](CONTRIBUTING.md). Contour currently provides React components; no Vue, Svelte or Angular adapter is included.
