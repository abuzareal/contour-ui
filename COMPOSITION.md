# Refs, parts, state and links

Contract version **0.3.0**. These additions are absent from npm 0.2.1; a source heading does not establish publication. Use the version named by the release notes. Import components directly and load CSS once. This guide describes existing DOM parts; no copying step or polymorphic Button system is required.

## Native ref targets

| Export                                       | Target and use                                                                                     |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Button, IconButton, DepthButton, ThemeToggle | HTMLButtonElement: focus, measurement, external trigger adapter                                    |
| ExternalLink                                 | HTMLAnchorElement: focus and native-link integration                                               |
| TextField, Checkbox, Slider                  | HTMLInputElement: focus/measurement; Checkbox retains indeterminate behavior                       |
| TextArea / SelectField                       | HTMLTextAreaElement / HTMLSelectElement; existing native reset/validation preserved                |
| Dialog                                       | HTMLDialogElement: focus/measurement; open stays prop-owned, do not bypass it with showModal/close |
| Tabs                                         | Root HTMLDivElement; list/button/panel parts have separate native refs                             |
| Popover                                      | Root HTMLDivElement; triggerProps.ref is its owned button, panelProps.ref its local panel          |

Object refs become null on unmount/ref replacement. Callback refs receive the node then null; on React 19 they may return cleanup instead. Internal refs coexist with caller refs. Stable callback identities avoid deliberate ref replacement. Targets remain mounted while a dialog/panel is closed/hidden.

RadioGroup, SegmentedControl, Pagination and DropdownMenu contain multiple controls; no singular input/action ref is claimed. Field is a frame, Tooltip describes a caller-owned child, Disclosure has native details semantics, and FlipCard/Tag have conditional controls. Presentation/scene wrappers receive no arbitrary native control handle. Part refs for those require a demonstrated reusable need.

React 18 compatibility uses forwardRef; React 19 uses the same JSX API. Render through React; do not call exports as plain functions or depend on typeof being function. [React ref guidance](https://react.dev/reference/react/forwardRef) explains why low-level controls expose DOM nodes.

```tsx
import { useRef } from "react";
import { Button, TextField } from "@abuzareal/contour-ui";
export function FocusName() {
  const action = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <TextField ref={input} label="Name" name="name" />
      <Button ref={action} onClick={() => input.current?.focus()}>
        Focus name
      </Button>
    </>
  );
}
```

JavaScript uses the same imports/JSX and `useRef(null)` without type arguments.

## Root and part customization

Root className/style/id/data/ARIA and supported native handlers target the documented native root. Classes append to defaults. Part props customize existing DOM; children/raw markup/replacement components stay owned by Contour. CSS stays global; this API adds no isolation, scoped theme, portal or collision engine.

| API                                        | DOM target                                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Dialog root/ref                            | dialog; title is its visible heading, onClose remains a no-argument request                |
| Dialog panelProps/bodyProps/footerProps    | div.dialog-panel / div.dialog-body / footer.dialog-footer; footer only mounts with content |
| Dialog closeButtonProps                    | Native close button; protected type=button, default label Close dialog                     |
| Tabs root/ref / listProps                  | Outer div.tabs / div with tablist role and state-owned indicator variables                 |
| TabItem.buttonProps/panelProps             | Tab button / div tabpanel, each with native ref/id/class/style/events/data/ARIA            |
| Popover root/ref / triggerProps/panelProps | Outer div / owned trigger button / local nonmodal panel                                    |

Roles, button types, tabIndex, selected/expanded/hidden state and ARIA relationships stay component-owned. Custom tab/panel IDs update both sides of their relationships. Extra label/description IDs compose with required IDs; callers supply referenced nodes. Native styles/classes can still make a composition unusable. Disabled-tab semantics are not introduced by buttonProps.

```tsx
import { useRef, useState } from "react";
import { Button, Dialog, Popover, Tabs } from "@abuzareal/contour-ui";
export function SettingsParts() {
  const [open, setOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState("profile");
  const dialog = useRef<HTMLDialogElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const help = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open settings</Button>
      <Dialog
        ref={dialog}
        id="settings"
        className="account-dialog"
        open={open}
        onClose={() => setOpen(false)}
        title="Settings"
        bodyProps={{ ref: body, "data-owner": "account" }}
        closeButtonProps={{ "aria-label": "Close settings" }}
      >
        <Tabs
          label="Settings sections"
          activeTabId={activeTabId}
          onTabChange={setActiveTabId}
          listProps={{ className: "account-tabs" }}
          tabs={[
            {
              id: "profile",
              label: "Profile",
              content: <p>Profile content</p>,
            },
            {
              id: "preferences",
              label: "Preferences",
              content: <p>Preferences content</p>,
            },
          ]}
        />
        <Popover
          trigger="Help"
          title="Settings help"
          triggerProps={{ ref: help }}
          panelProps={{ id: "settings-help", className: "account-help" }}
        >
          <p>Local panels need room in their layout.</p>
        </Popover>
      </Dialog>
    </>
  );
}
```

Popover still has local absolute placement and the known nested-dismissal limit. trigger is content inside an owned button, not an arbitrary interactive replacement. No submenu/initial-focus API is implied. Overlay corrections remain separate.

## Event composition

For the composed action handlers on Dialog, Tabs and Popover, the caller handler on the same owned element runs first. preventDefault vetoes internal tab click/arrow selection, popover trigger toggle, and dialog close-button/backdrop dismissal. stopPropagation controls propagation, not this cancellation contract. Root bubbling handlers run after descendant handlers; intercept through the relevant part or capture phase.

Dialog onCancel receives the native event. Caller preventDefault vetoes onClose; Contour always prevents the browser from closing independently of open. An allowed cancel requests onClose and the parent must update open. Native disabled buttons cannot activate; Button loading also disables it. Native field counter/resize bookkeeping runs before its caller input/change handler and remains intact; preventDefault on those notifications is not a counter-reset API.

```tsx
// Fragment: the application owns open, saving and its operation/recovery.
<Dialog
  open={open}
  title="Unsaved changes"
  onClose={() => setOpen(false)}
  onCancel={(event) => {
    if (saving) event.preventDefault();
  }}
  closeButtonProps={{ disabled: saving }}
>
  <p>Finish the current operation before closing.</p>
</Dialog>
```

If dismissal is suppressed, provide a usable cancel/recovery path. Do not disable essential interaction indefinitely.

## State and callback audit

| Family                                     | Existing ownership/callback contract                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Button/IconButton/DepthButton/ExternalLink | Native events; supported button disabled/loading; navigation remains browser/router-owned                     |
| TextField/TextArea/SelectField/Checkbox    | Native event callbacks; controlled value/checked or native defaults; refs, validity/reset remain intact       |
| Slider / Switch                            | Required number value / boolean checked, onChange(value); no new name/form/default/reset API                  |
| RadioGroup / SegmentedControl              | Required string value, onChange(value); generated radio name / button group                                   |
| Tabs                                       | activeTabId + onTabChange(id), or internal defaultTabId; invalid/removed IDs fall back to first available     |
| Popover / DropdownMenu                     | open + onOpenChange(boolean), or internal defaultOpen; unchanged values do not notify                         |
| Dialog                                     | Required open and onClose() request; no independent imperative ownership                                      |
| Disclosure                                 | defaultOpen on native details; no controlled open/onOpenChange                                                |
| Pagination                                 | page/pageCount and onChange(page); app owns URL/fetch/bounds                                                  |
| FlipCard / Tooltip                         | Internal flipped / hover-focus state; no new controlled API                                                   |
| ThemeToggle/useTheme                       | Shared document theme/preference, not scoped provider                                                         |
| Tag, EmptyState, Alert, toast APIs         | Caller removal/actions or supplied feedback/library toast commands; no business operation/persistence implied |

Do not switch controlled/uncontrolled ownership mid-mount. A later default does not reset established state. Controlled callbacks never silently overwrite parent state. Native event callbacks are not cosmetically renamed into value callbacks. Switch/Slider/RadioGroup form integration remains FORM scope.

## Native and router links

Use Button for actions and an anchor/router Link for navigation. buttonClassName supplies existing styles without interception. Preserve modified clicks, context menus, open-in-new-tab, destinations and keyboard activation. Do not nest interactive Buttons and anchors.

```tsx
import { buttonClassName } from "@abuzareal/contour-ui";
export function ReportsLink() {
  return (
    <a href="/reports" className={buttonClassName("secondary")}>
      Open reports
    </a>
  );
}
```

The pinned Next App Router configuration renders a native anchor and owns client navigation. Put interactive handlers in a client boundary. This does not claim universal router support.

```tsx
"use client";
import { useRef } from "react";
import Link from "next/link";
import { buttonClassName } from "@abuzareal/contour-ui";
export function NextReportsLink() {
  const link = useRef<HTMLAnchorElement>(null);
  return (
    <Link ref={link} href="/reports" className={buttonClassName("secondary")}>
      Open reports
    </Link>
  );
}
```

Other routers can use the same recipe when their documented Link forwards standard anchor props/ref. Browser checks cover native links and middle-click background tabs; the pinned Next fixture covers ordinary, canceled and middle-click navigation. [Next Link documentation](https://nextjs.org/docs/app/api-reference/components/link) distinguishes onClick from onNavigate: modified clicks retain native behavior.

Anchors have no native disabled state. Render a suitable non-link explanation when navigation is unavailable, or omit the destination with explicit disabled semantics and app-owned keyboard/pointer behavior. Use a disabled Button when it is an action. CSS alone does not disable a link. ExternalLink retains scheme filtering and new-tab opener protection; internal routes use the router Link.

## Abstraction review

Each addition serves a bounded need: native focus/measurement/trigger refs; existing Dialog/Tabs/Popover root/part access; ID-based reorder-safe tab focus; caller handler cancellation. Private helpers implement those lifecycles. No runtime dependency, provider, build/distribution/styling system, generic component-replacement API or blanket polymorphism is introduced. Existing menu disabled items, keyboard opening, typeahead, stable identity and focus return remain covered.
