# Contour UI

An independent React component library for editorial interfaces: paper and ink surfaces, an acid accent, readable typography, restrained motion, and optional Three.js objects.

**Status:** initial `0.1.0` release. React 18.3 is supported; React 19 and React Server Component execution are not advertised as tested. Interactive components belong in a client boundary in frameworks such as Next.js. The root module can be imported on the server, and basic components can render there.

## Install

```sh
npm install @abuzareal/contour-ui react@18 react-dom@18
```

```tsx
import "@abuzareal/contour-ui/reset.css"; // optional, global reset; omit with an existing reset
import "@abuzareal/contour-ui/fonts.css"; // optional, self-hosted font assets bundled by your app
import "@abuzareal/contour-ui/styles.css";
import {
  Button,
  TextField,
  ToastProvider,
  ThemeToggle,
} from "@abuzareal/contour-ui";

export function App() {
  return (
    <ToastProvider>
      <main data-motion="off">
        <ThemeToggle animate={false} />
        <TextField label="City" placeholder="Pune" />
        <Button variant="accent">Show forecast</Button>
      </main>
    </ToastProvider>
  );
}
```

For an app with its own reset, include equivalent native button/input defaults, border-box sizing, focus outlines, and the `[hidden]` rule. Styles use globally named component classes and `:root` theme tokens; they are not Shadow DOM isolated. Avoid redefining generic classes such as `.card` or `.button` elsewhere.

## Theme and motion setup

All theme toggles read the same document state. Set `data-theme="light"` or `"dark"` on `<html>`. `useTheme(animate)` returns `{ theme, toggle }`; call `toggle(buttonElement)` for a user action. The existing `aa-theme` local-storage key is preserved for compatibility with the original portfolio. Preference storage is origin-local, not shared across different website domains.

To avoid a first-paint theme flash, inject the exported static `themeBootstrapScript` from `@abuzareal/contour-ui/theme-bootstrap` into the HTML head at build time. It has no user-supplied interpolation. A strict Content Security Policy needs the appropriate script hash or nonce; do not enable unsafe inline scripts generally.

Set `data-motion="off"` on your application wrapper when animation is disabled. `useMotionPreference()` tracks the system setting; combine it with your app's pause state. Pass the resulting `motionEnabled` to Three.js scenes and `animate` to theme controls. Reduced motion overrides theme reveal animations even if `animate` is true. No animation is required to operate the UI.

`useToast()` must run below `ToastProvider`. The library does not send messages, collect analytics, fetch application data, or require a service account. Links reject executable URL schemes; application authentication, validation, authorization, and data handling remain the application's responsibility.

## Optional entries

```sh
npm install three@^0.186.1      # only for the /three entry
npm install lenis@^1.3.26      # only for the /scroll entry
```

```tsx
import { lazy, Suspense } from "react";
const Sculpture = lazy(() =>
  import("@abuzareal/contour-ui/three").then((module) => ({
    default: module.Sculpture,
  })),
);

// Provide a sized container and an application-owned static fallback.
<Suspense fallback={<p>Loading preview…</p>}>
  <Sculpture motionEnabled={false} />
</Suspense>;
```

`/three` also exports `ObjectStudy`, `useThreeStage`, geometry/material helpers, and their types. Treat the 3D API as experimental in this initial release. Scene setup functions are captured on mount; remount the scene when its setup configuration changes. Scenes require WebGL and should always have a visible fallback. No Three.js or Lenis imports occur in the core runtime graph.

## Components and typed APIs

The package exports named components and props types. TypeScript declarations are shipped with every entry; editors provide the complete props API.

- Actions: `Button`, `IconButton`, `ExternalLink`, `SegmentedControl`, `ThemeToggle`.
- Forms: `Field`, `TextField`, `TextArea`, `SelectField`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`.
- Navigation: `Tabs`, `Breadcrumbs`, `Pagination`, `Stepper`, `DropdownMenu`.
- Data and layout: `Avatar`, `Badge`, `Card`, `DataTable`, `Disclosure`, `Divider`, `EmptyState`, `Kbd`, `SectionLabel`, `Stat`, `Tag`, `Timeline`.
- Feedback: `Alert`, `ProgressBar`, `Skeleton`, `Spinner`, `ToastProvider`, `useToast`.
- Motion and signature: `BrandMark`, `CountUp`, `DepthButton`, `FlipCard`, `Magnetic`, `Marquee`, `Reveal`, `RevealHeading`, `ScrollProgress`, `TiltCard`, `GitHubIcon`, `LinkedInIcon`.
- Overlays: `Dialog`, `Popover`, `Tooltip`, `SceneBoundary`.

Use visible labels for fields, concise action labels for buttons, accessible labels for icon-only controls, and text alongside status colors. Sortable tables expect scalar string/number row values. Pagination expects a positive integer page count and a page in that range. Flip cards switch through their button; the hidden side is inert.

Global colors, fonts, radii, duration, and spacing variables are in `tokens.css`. Override semantic tokens rather than copying components into your app. `styles.css` includes tokens and component styles; `fonts.css` and `reset.css` are separately opt-in. Do not import catalogue or portfolio CSS into other apps.

## Independent repositories and updates

This repository contains only the library. The catalogue and portfolio remain separate repositories and consume the same published npm version. During first-release validation, a packed archive can be installed locally; replace the archive dependency with the registry version before committing consumer manifests.

```sh
npm install @abuzareal/contour-ui@0.1.0 --save-exact
```

Commit both `package.json` and `package-lock.json`. Dependabot proposes version updates in each consumer repository. Updates reach production after that project's checks, merge, rebuild, and deployment. A registry release does not change deployed applications automatically.

## Development and release

```sh
npm ci --ignore-scripts
npm run validate
npm audit
npm pack --dry-run
```

See `RELEASING.md` for the release checklist, authentication, and trusted-publishing setup. The package ships only built code/styles and release documents, with no consumer installation scripts. The complete-source Git repository contains tests and tooling; those are excluded from the npm archive.

MIT licensed. Font dependencies retain their own font licenses; Lucide, React, Three.js, and Lenis retain their respective licenses.
