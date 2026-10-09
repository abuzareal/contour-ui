# Next.js App Router integration

This guide describes **Contour 0.2.0**. npm 0.1.2 does not include the client directives, native refs or relative Latin font files described here. Check npm for release availability before installing. The fixture pins Next 16.4.0 with React/React DOM 19.3.0, uses the webpack production build, and consumes an npm archive. It does not establish every Next version, Turbopack, Pages Router, scroll entries or hosting platform. A separate optional mode checks a lazy Three.js scene with SSR disabled and disposal on navigation.

In `app/layout.tsx`, load CSS once:

```tsx
import "@abuzareal/contour-ui/styles.css";
import "@abuzareal/contour-ui/fonts-latin.css"; // Optional; use your own fonts if preferred.
import { themeBootstrapScript } from "@abuzareal/contour-ui/theme-bootstrap";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

The narrowly scoped hydration suppression handles the root theme attribute changed before hydration; do not use it to hide arbitrary mismatch errors. A restrictive CSP requires a nonce or hash for the bootstrap script. `reset.css` is optional and global; decide whether your host reset already supplies equivalent defaults, visible focus and a `[hidden]` rule.

A client component owns event handlers, state and providers:

```tsx
"use client";
import { useState } from "react";
import { TextField, Button } from "@abuzareal/contour-ui";

export default function SearchForm() {
  const [query, setQuery] = useState("");
  return (
    <form>
      <TextField
        label="Search"
        name="query"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <Button type="submit">Search</Button>
    </form>
  );
}
```

Provide real submission behavior in the application. Toast consumers need ToastProvider; dialogs need application-owned open/onClose. Keep function props inside client boundaries. A server component can pass serializable props to a package client component or import pure `safeHref`; a client directive does not remove normal server prerendering.

Run `npm run test:next` to rebuild and consume the candidate archive. The fixture checks server imports/prerendering, hydration, CSS/fonts, refs, native resets, dialog dismissal/focus, toast, tabs, theme persistence and client navigation without Three.js/Lenis installed. Run `CONTOUR_NEXT_OPTIONAL=1 node scripts/test-next.mjs` for the separate lazy `/three` route; ordinary consumers still require neither optional peer. Compatibility evidence applies to the fixture's exact pair and local runtime, not deployment.
