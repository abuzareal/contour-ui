# Hooks and browser lifecycles

Reference for the current package manifest version; exact released implementations and emitted types are linked in [PUBLIC-API.md](PUBLIC-API.md). Hooks belong in a React client component. Import from `@abuzareal/contour-ui` unless the optional `/scroll` entry is named explicitly. No general provider is required except useToast. These are executable contracts, not promises of every browser, renderer or application layout.

## Theme

`useTheme(animate = true)` returns `{theme, toggle(origin), canToggle}`. Theme is `"light" | "dark"`; toggle accepts an HTMLElement that anchors the reveal. Outside ThemeScope it owns html[data-theme], the existing theme-color meta, local storage key `aa-theme`, and subscriptions to root attributes, storage events and system changes when no stored preference exists. Initial server snapshot is light. Use the pure bootstrap entry before paint rather than hiding arbitrary hydration mismatches. Blocked storage does not prevent a local toggle. Animation respects system reduced motion; unsupported View Transitions fall back to a short class-based transition.

Within controlled ThemeScope it reads the scope's theme and invokes onThemeChange; it does not write document preference/storage. Without that callback canToggle is false. ThemeToggle supplies the native button, constant accessible name and aria-pressed state. The hook is not a general persisted settings manager. Independent scopes need scoped CSS. See [STYLING.md](STYLING.md) and the actual hash/nonce starter sources in [GETTING-STARTED.md](GETTING-STARTED.md).

`themeBootstrapScript` and `themeColors` are exported from `@abuzareal/contour-ui/theme-bootstrap`, not the core entry. The string reads valid stored light/dark, otherwise system preference, sets root theme and an existing meta; it does not initialize independent scopes. themeColors contains light `#f2f3ee` and dark `#0f100d`. Hash the exact current string or authorize a fresh request nonce; never interpolate user data, reuse a nonce, copy an old hash, or assume a dynamic nonce setup supports static export. The bootstrap module can be imported by a server/config process without browser globals; executing its string is a browser operation.

## Motion

`useMotionPreference()` returns a boolean for `(prefers-reduced-motion: reduce)` and subscribes to changes, removing the listener on unmount. It reports system preference only. It does not combine an application pause, stop timers, cancel a network request or control unrelated scenes. The app combines `!reducedMotion && !paused` and owns cleanup of its effects.

`motionDisabledFor(element)` synchronously returns true for system reduction or an ancestor `[data-motion="off"]`. It is a browser helper, not a subscription. It uses the current window's media preference and the supplied element's ancestors. CSS motion rules and JavaScript loops have separate responsibilities. Do not call this on the server or infer that merely mounting the preference hook pauses every animation.

## Clipboard

`useClipboardCopy(text: string)` returns `{status, copy}`. CopyStatus is `idle | copying | copied | error`. Invoke copy from an explicit user action. It awaits navigator.clipboard.writeText; only a resolved write yields copied. Missing API, insecure context, denial and rejected writes yield error; there is no fabricated fallback success. Feedback returns to idle after 4,000 ms. Changing text resets feedback and invalidates earlier completions; newer calls win, unmount removes reset timers and ignores late writes. A clipboard write itself cannot be cancelled.

Render visible feedback or a polite status, and a retry action when appropriate. The hook does not request browser permission in advance or guarantee OS clipboard retention. Do not log secrets or use a toast as the only record of failure.

## Dismissal and mobile menus

`useDismiss(containerRef, active, onDismiss, options = {})` returns void. The callback receives DismissReason (`escape | outside`) and the native KeyboardEvent or PointerEvent. The topmost registered layer in that element's owner document dismisses once. Native preventDefault cancellation and ordinary document observers remain meaningful; nested/sibling ordering is described in [OVERLAYS.md](OVERLAYS.md). A render with changed callbacks updates policy without simulating a close. Actual node/document changes rebind registration and unmount removes it.

DismissOptions supplies `branches` (owned refs, including trigger/portals), `layerElement` (floating paint-order owner) and `outside` (default true; native modal backdrop handling may own it instead). This hook does not create a trigger, portal, focus trap, accessible name, modal scroll lock or automatic open state. Prefer Dialog/Popover when their complete interaction fits. Custom layer callers own focus entry/return, role/ARIA, state and structural containment. Do not deep-import internal stack helpers.

`useMobileMenu(containerRef, toggleButtonRef)` returns readonly `[open, setOpen]`, initially false. It uses dismissal with the trigger as an owned branch; Escape closes and focuses a connected toggle, outside press closes without stealing focus. While open it listens for the container's owner window to transition into `(min-width: 768px)` and closes. It does not supply menu markup, ARIA, a modal trap, routing or a responsive design system. Opening programmatically while already at desktop width is not prohibited by the hook; the app owns viewport-dependent rendering. Match refs to the actual connected nodes and choose native links/buttons for the menu's purpose.

PanelFocusOptions is a public type used by built-in floating panels: initialFocus may be a ref or false; onOpenAutoFocus/onCloseAutoFocus receive cancelable events. FloatingOptions covers side/align/offset/collision and portal/container. These types do not expose the internal positioning hook. Use their current declarations; disabling automatic focus transfers responsibility to the application.

## Scroll and navigation

`useHeaderScroll(headerRef)` returns `{scrolled, overDark, activeId}`. It samples `main section[id]` and `[data-header-theme='dark']` once when the effect installs. scrolled means scrollY > 20; overDark tests the header-height line against marked areas; activeId is the last listed section whose top is at or above 35% of viewport height. It subscribes to scroll/resize and removes listeners on cleanup. Dynamic section replacement, arbitrary nested scroll containers and router state are not observed automatically. This is a retained page-oriented hook, not a universal app header API.

`useScrollSpy(ids: string[])` returns the last supplied existing section above a 30% viewport activation line, or an empty string before any qualifies. Keep unique stable section IDs in visual order. Targets are resolved when the ID sequence changes, not on every DOM mutation. Scroll/resize updates are batched through one animation frame and cleanup cancels it. The serialized sequence preserves IDs containing separators; this patch fixes the prior `|`-joined ambiguity. It does not observe a custom scroll container or change the URL.

`useInitialHashScroll()` has no arguments/return value. At mount it decodes the initial hash, finds an existing ID, scrolls to its start and realigns once after document.fonts.ready. Malformed or missing hashes are ignored. Wheel/touchstart/keydown stops the delayed realignment so it cannot override the visitor. Cleanup invalidates font readiness; it cannot scroll a later page after unmount. It does not subscribe to hashchange or wait for a later lazy route to create the target. Native history/focus/routing remain application-owned.

## Idle and print

`useIdleTrigger(enabled)` returns false until enabled and an idle callback fires (timeout 1,200 ms), or a 300 ms setTimeout fallback where idle callbacks are unavailable. It cancels the pending callback/timer when disabled or unmounted. Once true it stays true for that hook instance, even if enabled later becomes false. It is a scheduling hint, not a loading indicator, work queue or guarantee that the main thread is free; actual heavy work still needs a bounded/lazy design.

`usePrintPreparation()` installs beforeprint/afterprint listeners on the current document/window. It temporarily opens closed details and sets root data-theme to light, then restores the exact original theme attribute and only those disclosures it opened. Repeated beforeprint does not replace the original snapshot; repeated afterprint is harmless. Unmount during print also restores the snapshot and removes listeners. Mount one document owner. This inherited page hook changes all disclosures/root theme; independent ThemeScope values, application state, server printing, PDF layout and unrelated printer dialogs are outside its contract. Use CSS print rules for product layout. This patch fixes the prior absent-theme/repeated-event/unmount restoration defects.

## Toast

`useToast()` returns ToastContextValue `{show(toast): void}` and throws outside ToastProvider. ToastInput requires title, accepts message and AlertTone (`neutral | accent | info | success | warning | danger`); neutral is the visual default. The provider requires children and defaults label="Notifications", dismissLabel="Dismiss notification". It renders a polite live region, retains at most the latest three notifications and dismisses each after 5,000 ms while not hovered/focused. Leaving a pause starts a new full timeout, not a remaining-time countdown. Close buttons dismiss individual items. The public command returns no ID and has no update/dismiss/promise/undo API.

A toast describes an already established result. Fetching, business validation, persistence and retry remain application-owned. Keep important errors beside the task and use durable state when a message must outlive a temporary notification. ToastContext appears only as a type-level export through the current public re-export surface; it is not a runtime provider escape hatch.

## Optional scroll

`useSmoothScroll(enabled)` is imported from `@abuzareal/contour-ui/scroll`. Install the declared Lenis peer and import `lenis/dist/lenis.css` in the application. Enabled creates one Lenis with autoRaf=true, duration=1.05, smoothWheel=true, syncTouch=false and anchors=true; disabling or unmounting destroys that owner. It returns no Lenis instance/commands. It does not read system preference itself. The app must combine pause/reduced motion, keep one active owner, preserve native focus/hash behavior and supply native-scroll fallback until opt-in.

The [actual optional recipe](examples/optional/OptionalSmoothScroll.tsx) lazy-loads its owner and stylesheet; core installation has no Lenis requirement. Vite/client integration is exercised; Next Lenis and arbitrary router scroll restoration remain unverified. Three is separate; see [THREE.md](THREE.md).

See [REFERENCE.md](REFERENCE.md) for every runtime/type/style export mapping, [HELPERS.md](HELPERS.md) for pure/browser helpers and [SUPPORT.md](SUPPORT.md) for dated evidence. Report hook/version details through [the public reproduction](examples/reproduction); source/version issue paths are in PUBLIC-API.md and GETTING-STARTED.md.

Copyable [HookExamples.tsx](examples/reference/HookExamples.tsx) uses these public contracts for clipboard feedback, motion policy, custom nonmodal dismissal, idle scheduling, scoped theme and toast ownership. Copied source compiles in the packed React18/19 consumers. The custom help region deliberately has no modal trap; use Dialog/Popover for their complete focus/portal contracts.

## Version and reproduction

Reference version **0.6.2**. A source version does not establish publication; check the npm registry for availability. [Versioned source](https://github.com/abuzareal/contour-ui/tree/v0.6.2/src) and [emitted type inventory](PUBLIC-API.md) describe this contract; tag links resolve after release. [Report Hooks 0.6.2](https://github.com/abuzareal/contour-ui/issues/new?template=bug_report.yml&component=Hooks&version=0.6.2), using the [public minimal reproduction](examples/reproduction) and synthetic data.
