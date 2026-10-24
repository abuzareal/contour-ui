# Contour + Next App Router

Copy this directory. Use Node 22.12 or newer, then:

```sh
npm install --strict-peer-deps
npm run dev
npm run build
npm start
```

Direct versions: Contour 0.6.4, Next 16.4.3, React/React DOM 19.3.0, TypeScript 7.0.2; webpack explicitly selected. Commit the generated application lockfile and use npm ci afterward. There are no workspace aliases, optional Three/Lenis peers, fonts or required providers. To opt into branded fonts, import `@abuzareal/contour-ui/fonts-latin.css` in app/layout.tsx. Root CSS and route composition belong to the application.

layout.tsx and the page are server components. Demo.tsx owns client state, refs and handlers. The pure theme-bootstrap subpath is server-safe; before-paint script changes only the root theme attribute and theme-color. The root's suppressHydrationWarning is narrowly for this attribute, not a workaround for arbitrary mismatches.

proxy.ts generates a new nonce on every document request, forwards the CSP and nonce to Next and returns the CSP header. The dynamic layout reads that nonce so both bootstrap and framework scripts are authorized. This deliberately requires server rendering; static export/cached shared nonces are not supported. Inline styles remain allowed for library geometry. Production script policy has no unsafe-eval; development adds it for the bundler. Configure additional service origins explicitly. See [Next's CSP guide](https://nextjs.org/docs/app/guides/content-security-policy).

This folder establishes the named App Router/webpack pair only. Turbopack, Pages Router and Next Lenis are unverified. Optional lazy Three is covered separately by the library's optional fixture, not installed here. A release candidate uses an archive only in disposable validation copies; the exact registry installation requires the published release.
