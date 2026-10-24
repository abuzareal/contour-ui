# Combobox — 0.6.1

Search a list and choose **one allowed value**. Use native SelectField when its simpler platform interaction is sufficient. Combobox is not free-text autocomplete, global search, a command menu, a multi-select, or a virtualized picker. Selection is a string ID or null; query text is never a submitted selection. It needs no provider or consumer-installed foundation package. [Foundation decision](FOUNDATION.md).

```tsx
import { useRef } from "react";
import { Button, Combobox } from "@abuzareal/contour-ui";
import "@abuzareal/contour-ui/scoped.css";
const projects = [
  { value: "atlas", label: "Atlas" },
  { value: "notes", label: "Field notes" },
  { value: "closed", label: "Closed project", disabled: true },
];
export function ProjectForm() {
  const input = useRef<HTMLInputElement>(null);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        console.log(new FormData(event.currentTarget).get("project"));
      }}
    >
      <Combobox
        ref={input}
        label="Project"
        name="project"
        options={projects}
        defaultValue="atlas"
        required
        hint="Choose an available project."
      />
      <Button type="submit">Inspect selection</Button>
      <Button type="reset" variant="secondary">
        Reset
      </Button>
    </form>
  );
}
```

This is local inspection, not persistence. The application's server must validate and authorize the submitted ID. Do not log sensitive form data in a production application.

## Types and defaults

[ComboboxProps and ComboboxOption](PUBLIC-API.md) are emitted declarations; inherited native part props remain typed. [Released implementation](https://github.com/abuzareal/contour-ui/blob/v0.6.1/src/components/ui/Combobox.tsx). The ref targets the **visible HTMLInputElement**, including focus, selection and measurement; it does not target the hidden form input or popup.

| Props                                                                  | Contract / default                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| label, options                                                         | Required visible label and readonly `{value: string; label: string; disabled?: boolean}` choices. Unique nonempty IDs; labels may repeat or translate.                                                                                                                                                               |
| value / defaultValue / onValueChange                                   | Controlled or uncontrolled selection, null by default. Callback receives string or null. Keep the mode stable for the lifetime of the component.                                                                                                                                                                     |
| inputValue / defaultInputValue / onInputValueChange                    | Independent controlled or uncontrolled query. Default derives from the selected label. Callback also reflects selection/close synchronization; a controlled parent must accept it.                                                                                                                                   |
| filteredOptions                                                        | Omitted: foundation filters the known options by label. Provided: authoritative application results, drawn from options; no second local filtering.                                                                                                                                                                  |
| open / defaultOpen / onOpenChange                                      | Controlled or uncontrolled popup; false by default. Disabled/readOnly/hidden ancestor suppresses visible opening.                                                                                                                                                                                                    |
| id, name, form                                                         | Generated accessible ID unless supplied. Optional native name and external form owner. No name means no submitted entry.                                                                                                                                                                                             |
| required, disabled, readOnly, hideLabel, loading                       | false by default. Hidden labels remain accessible; disabled omits submission. Readonly preserves the value without opening/editing.                                                                                                                                                                                  |
| hint, error                                                            | Optional field help or validation failure. Error takes precedence over hint. Native aria-describedby IDs are merged.                                                                                                                                                                                                 |
| searchError, onRetry                                                   | Separate service failure text and optional retry callback. Loading/failure hide selectable results. Retrying is caller-owned; it cannot create a successful result.                                                                                                                                                  |
| loadingText / emptyText / retryLabel / triggerLabel / missingValueText | “Loading choices…”, “No matching choices.”, “Retry search”, “Show choices”, “Selected option is unavailable. Choose another.” Supply translated strings.                                                                                                                                                             |
| inputProps / popupProps / rootProps                                    | Native attributes, events, styles, classes and refs for the existing input, popup and wrapper. Input value/name/form/id/type/state stay owned by the component. Input native events can observe/cancel foundation behavior; use onValueChange for selection. ARIA label references preserve the visible field label. |
| side / align / sideOffset / collisionPadding                           | bottom / start / 8 / 8. Positioner flips/shifts within available space.                                                                                                                                                                                                                                              |
| portal / container                                                     | true / automatic owner body or enclosing native dialog. A custom container must share the owner document and be inside its dialog. false keeps the popup inline; ancestor clipping remains the application's responsibility.                                                                                         |

## Anatomy, states and forms

The wrapper contains Field's label/help/error, input group, native text input, trigger button and a separate form-value input. The portaled fixed positioner contains a popup, status, optional retry and listbox/options. Input focus stays on the combobox during list navigation; an active-descendant ID identifies the highlighted option. Option content is text, not nested interactive actions. No placeholder is a substitute for the label; use inputProps.placeholder only as supplemental guidance.

Uncontrolled form reset restores defaultValue. Controlled selection remains owned by the parent; update it in the form's onReset when a different value is required. The same applies to controlled query/open state. Preventing native reset preserves state. External form association uses form, and a disabled fieldset must retain native successful-control behavior. Required selection is validated by the selection value, not arbitrary query text. Always validate on the server as well.

Reordering/translated labels preserve ID identity and update the selected label when the query is not being edited. If the selected ID disappears from **options**, Contour retains the parent's identity, displays the missing-value error, exposes an invalid visible input and serializes an empty value. It does not call onValueChange merely to rewrite parent data. Resolve the record, clear it, or ask the user to choose another; never silently substitute the first choice. A selected option that later becomes disabled remains a historical selection; disabled options cannot be newly selected. The application decides whether its server permits that historical value.

For remote search, retain the selected record in options even when it is absent from filteredOptions. The [actual async recipe source](examples/recipes/AsyncProjectPicker.tsx) uses one selected snapshot plus current results, an AbortSignal and stale-result guards. See [recipes](RECIPES.md) for service validation and stable loader identity.

Loading and service errors have separate live status text and visible popup messages. Empty results do not imply an empty overall database. The application owns permissions, cache, debounce, request limits, result counts and retry. Keep selected records separate from search results; showing yesterday's results under today's query is misleading.

## Keyboard, layout and limits

Typing searches; ArrowDown/ArrowUp moves among enabled choices, Enter selects the highlighted choice, Escape closes only the current popup, and Tab leaves without selecting an arbitrary highlighted item. Composition Enter must not select prematurely. A second Escape can dismiss an enclosing Contour layer; Escape on a closed picker preserves the selected ID. Contour suppresses the foundation's closed-Escape clear action without stopping the native document event. Outside press dismisses the popup; choosing an option keeps the enclosing Dialog/Popover open. Dialog focus containment and return remain owned by that Dialog.

Scoped CSS uses `contour-combobox`, `contour-combobox-control`, `contour-combobox-trigger`, `contour-combobox-positioner`, `contour-combobox-popup`, `contour-combobox-option`, `contour-combobox-status` and `contour-combobox-retry`. Options expose data-highlighted/data-selected/data-disabled; the input exposes expanded/invalid/busy state. [Semantic tokens](STYLING.md) control surfaces, text, borders and focus. forms.css is the selective family; scoped.css is the aggregate. Legacy styles.css retains unprefixed compatibility classes. Consumer class names are preserved, never automatically prefixed.

Inherited theme and direction travel into portals; collision bounds and long labels support narrow layouts. Options wrap rather than truncate. Forced-colors focus/selection and system reduced motion are respected. Provide localized labels and all status strings; custom matching/remote locale collation belongs to the application. Large collections need a bounded server result set; there is no virtualized/multiple/grouped API in this release.

Automated Chromium keyboard, touch emulation, synthetic composition, RTL, forced colors, native-dialog and packed React tests are evidence for those fixtures only. Manual screen-reader, physical keyboard/IME and mobile keyboard checks remain separate; no universal accessibility certification is claimed.

**Open-state accessibility correction in 0.6.1:** Contour uses a labelled non-modal popup region and listbox, retaining Base UI's public selection/navigation/positioning parts. Opening it no longer hides the surrounding page. Whole-document axe scans pass in the selected Chromium/WebKit fixtures with no excluded rules; Tab and Shift+Tab close it while preserving native traversal. The older Base UI Popup composition's failing diagnostic remains available separately. See [support evidence and limitations](SUPPORT.md); manual VoiceOver/NVDA review remains pending. These fixtures do not establish WCAG conformance.

[Report Combobox 0.6.4](https://github.com/abuzareal/contour-ui/issues/new?template=bug_report.yml&title=Combobox%200.6.4%3A%20&component=Combobox&version=0.6.4), using the [public minimal reproduction](examples/reproduction). Source links for this version resolve when its release tag is published.
