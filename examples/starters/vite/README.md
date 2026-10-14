# Contour + Vite

Copy this folder into a new directory. Node 22.12 or newer is required. Direct dependencies are pinned; `npm install` creates the application's own lockfile. Commit that lockfile and use `npm ci` for later installs.

```sh
npm install --strict-peer-deps
npm run dev
npm run build
npm run preview
```

Uses Contour 0.6.1, React/React DOM 18.3.1, TypeScript 5.9.3 and Vite 8.3.2. No aliases, workspace links, optional peers, font download, private catalogue or provider are required. Scoped CSS includes tokens and component families without the legacy global reset. The application owns the small body/layout stylesheet. Optional branded fonts: import `@abuzareal/contour-ui/fonts-latin.css` once.

The Vite config inserts the exact released theme bootstrap before the application, with a calculated CSP script hash. Keep the placeholder in index.html; recalculate through the build after upgrades. Script execution is restricted; style attributes are allowed because popup positioning and some components use inline styles. Extend connect-src intentionally for your service/development socket. An HTTP CSP header may replace this meta policy if it contains the same hash. See the package GETTING-STARTED.md for embedded themes and optional features.

Run against the registry after the release is published. Release candidates are tested with the verified npm archive in a disposable copy; an unpublished candidate version will not install from npm yet.
