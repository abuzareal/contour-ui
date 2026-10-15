# Floating layers and focus

0.5 adds shared dismissal, collision-aware placement and portals to Popover, DropdownMenu and Tooltip. Dialog remains a native modal/drawer. Contour uses MIT-licensed Floating UI DOM 1.8.0 for geometry and observers; it does not replace the public components with another component library.

## Dismissal

One Escape reaches the deepest active layer; independent siblings use most-recent activation. Paint order follows that dismissal order. One outside primary-pointer press dismisses at most one layer. Presses in portaled descendants are inside their owned layer. Explicit buttons can still perform their own actions. A native modal backdrop does not also dismiss its modal when that press already belongs to a child layer.

Listeners attach to the layer's owner document, rebind on document moves and release on inactivity/unmount. They never stop event propagation. Handled Escape prevents its native default so a child dismissal does not also cancel its native parent dialog. Other keys and ordinary outside focus remain available. `onDismiss(reason, nativeEvent)` on Popover/Menu can call `preventDefault()` to veto dismissal. Dialog uses its existing `onCancel` and `onClick` cancellation contracts. `useDismiss(ref, active, callback, options)` uses the same registry; additional `branches` include a caller's trigger/portal. `layerElement` opts a custom floating element into owned stack order; its previous inline z-index is restored on release.

A closed ancestor suspends descendant layers without clearing their controlled/uncontrolled state. Reopening resumes that state; reset child state in the parent's application callback when a different policy is wanted. Modal/native close buttons and controlled parent updates are application-owned.

## Placement and containers

Popover/Menu accept `side` (bottom by default), `align` (start by default; center/end supported), `sideOffset` (8 px) and `collisionPadding` (8 px). Tooltip retains `placement` (top), with center alignment and a 10 px offset. Alignment is logical in RTL. Placement flips, shifts on both axes and constrains scrollable content to the clipping boundary; scroll/resize/layout/element observers update it while open and clean up on close. Nonfinite offsets/padding fall back to defaults; negative collision padding clamps to zero. A geometry failure retains a viewport fallback and emits a warning rather than leaving an unhandled promise. Geometry properties and stack order are owned; use part props for appearance/content, not competing position/transform declarations. `--contour-z-overlay` configures the nonmodal stacking base (30); native modal top-layer ordering is browser-owned.

Default `portal` is true. Content renders in the trigger's owner-document body, or **inside its open native dialog**. A small portal wrapper carries inherited variables, font, text color and direction and follows ancestor theme/style mutations. This escapes a clipped or transformed theme root without changing the document's theme. `container` selects an explicit element in the same document; outside/wrong-document containers inside an active modal fall back to that modal. Keep custom containers unclipped and provide enough space. `portal={false}` preserves local DOM placement for a deliberate integration; clipping ancestors may then clip it.

**Migration from 0.4:** default portal DOM placement changes ancestor selectors and DOM-based tests. Target `panelProps.className` directly rather than `.host-root .host-panel`; use `portal={false}` when local placement is required. Root refs still target the wrapper, trigger refs target buttons and panel refs target panels, and may detach/reattach when the portal container changes. No deep import is needed.

## Triggers and focus

`trigger` still supplies button content. `renderTrigger` supplies a supported ref-forwarding button component. Spread the provided props so refs, caller handlers and owned type/expanded/controls/haspopup relationships survive; do not nest a button inside the default trigger. An ordinary native button or Contour Button works. Link/non-button triggers are not supported by this contract.

```tsx
import { Button, Popover, TextField } from "@abuzareal/contour-ui";
export function HelpPanel() {
  return (
    <Popover
      title="Help"
      trigger="Help"
      renderTrigger={(props) => <Button {...props} variant="secondary" />}
    >
      <TextField label="Question" />
    </Popover>
  );
}
```

Popover focuses its panel on entry; `initialFocus={ref}` selects a mounted descendant and `initialFocus={false}` keeps the trigger focused. Cancelable `onOpenAutoFocus` / `onCloseAutoFocus` events allow caller control. Escape returns to a connected trigger by default, including controlled dismissal requests. Outside press does not steal focus from its destination. Programmatic close/unmount returns focus when the layer or a descendant owned it. A missing/removed trigger receives no forced substitute; the application owns its workflow fallback. Popover is nonmodal: it does not trap focus or make the background inert. Portal DOM order affects Tab order; choose inline placement or explicit focus customization for an application-specific sequence.

Menu enters the first enabled action; ArrowUp from its trigger enters the last. ArrowUp/Down, Home/End and typeahead skip disabled entries. Selection/Escape return to the trigger; Tab dismisses without consuming Tab. Empty/all-disabled menus focus their panel. Labels/content are caller-owned. Dialog uses native focus confinement and focus return; its new `initialFocus` chooses a mounted modal descendant. `onOpenAutoFocus` can cancel that explicit override; it does not undo native showModal autofocus. Existing nested locks, drawer placement, long content and cleanup remain supported.

## Supplemental hints

From 0.6.2, closed Tooltip content uses native hidden state. This prevents fallback placement on the body portal from widening a standards-mode page. The trigger retains its linked supplemental accessible description; opening/dismissal and collision placement remain unchanged.

Tooltip content is a noninteractive string. Hover and keyboard focus cooperate; leaving the pointer does not erase a focused hint. Trigger-to-content travel stays available through a bounded pointer corridor; the hint remains while pointer/focus applies. Escape suppresses it until the current hover/focus conditions end and a new session begins. Existing `aria-describedby` values and the child's accessible name/ref/events are retained. Pointer content is hoverable; tooltip content is never a substitute for a visible label, essential instruction, validation error or interactive panel. Touch users must have the same essential information visibly available.

Production checks cover nested/sibling/portaled layers, native modal portals, touch outside press, RTL, narrow/resized viewports, long scrolling panels and CSS zoom. These are automated browser checks, not physical mobile-keyboard or assistive-technology certification. See [W3C hover/focus guidance](https://www.w3.org/WAI/WCAG21/Techniques/client-side-script/SCR39) and [Floating UI observer lifecycle](https://floating-ui.com/docs/autoupdate).

Keep a portal container stable while open. Changing its DOM target can remount the portaled subtree; keep unsaved child state in the owner when container changes are required.

Default-open children choose an enclosing native dialog even before its open attribute is set. When Dialog calls showModal in the same commit, these children enter its top layer without an additional click or render.

## Version and reproduction

Reference version **0.6.3**. A source version does not establish publication; check the npm registry for availability. [Versioned source](https://github.com/abuzareal/contour-ui/tree/v0.6.3/src) and [emitted type inventory](PUBLIC-API.md) describe this contract; tag links resolve after release. [Report Overlays 0.6.3](https://github.com/abuzareal/contour-ui/issues/new?template=bug_report.yml&component=Overlays&version=0.6.3), using the [public minimal reproduction](examples/reproduction) and synthetic data.
