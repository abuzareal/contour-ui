# Contributing to Contour UI

Contour is a styled React library. The catalogue is a separate application at [contour.abuzr.in](https://contour.abuzr.in/). Domain workflows and product scenes belong in applications; reusable controls, semantic tokens and shared browser lifecycles belong here.

Start with an issue describing the user task, current behavior and a small reproduction. For a new component, describe its stable props, native semantics, keyboard behavior, failure/empty states and why existing exports cannot compose the result. Do not include secrets or private application data. Report security concerns through [SECURITY.md](SECURITY.md).

Use Node 22.12+ or 24+, then `npm ci --ignore-scripts`. Install Chromium once with `npx playwright install chromium`. Run `npm run validate` for types, lint, build, component and browser regressions, and archive checks. Run `npm run test:compat` for packed React 18/19 consumers and source declarations; run `npm run test:next` for the pinned App Router fixture. Compatibility installs need network access. The core fixture must work without Three.js or Lenis. Optional entries have separate consumers.

Keep strict types and validate untrusted data before use. Components own presentation and nearby state; hooks own subscriptions and browser lifecycles; helpers own pure calculations. Use native controls, linked labels/errors, visible focus and explicit button types. Respect reduced motion. Release every listener, timer, observer and GPU resource on unmount and partial initialization failure. Use `onDispose` immediately for resources allocated in a custom stage setup.

For a fix, add a regression that fails for the previous behavior. Use component tests for interaction contracts and real browsers for native dialogs, event timing, layout and GPU integration. Check narrow layouts, long content and both themes. Do not replace browser evidence with jsdom when a browser owns the behavior. Avoid duplicate tests that only restate implementation.

Update the README and Unreleased changelog when public behavior changes. Keep documented APIs consistent with the archive. New APIs need a migration/usage example. Generic CSS class names and the legacy `aa-theme` storage key are existing compatibility constraints; do not rename them silently.

A pull request should name the concrete behavior change, why it helps, which checks passed and any remaining limitation. Review public exports, packed files and dependency changes. No publish, deploy or merge is implied by opening a pull request. Consumers adopt an exact published release with a lockfile update; local source edits do not update them.
