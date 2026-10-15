# Native form and form-library integration

Contract version **0.4.0**. This source heading does not establish npm publication; new contracts are absent from 0.3.0. Use the version named by the release notes. Existing controlled boolean/number/string callbacks and native ref targets remain compatible.

## Existing 0.3.0 installations

TextField, TextArea, SelectField and Checkbox accept native name/form/disabled/default/required props and can be read through FormData. Checkbox generates its own ID in 0.3.0. Switch and Slider in 0.3.0 require checked/value and value callbacks; they do not accept a submission name or external form contract. RadioGroup in 0.3.0 uses its own generated radio name; applications should serialize its selected value under their own stable field name. Construct a payload from native fields plus application state rather than guessing the generated name. Keep parent-owned reset explicit.

[ManualSettingsForm-0.3.0.tsx](examples/forms/ManualSettingsForm-0.3.0.tsx) is a complete old-release recipe. It is compiled against the actual npm 0.3.0 package. It deliberately whitelists the service payload; generated radio names are not sent to the service.

## 0.4.0 control contracts

| Control                                 | Submission and defaults                                                                                                                                                                                                        | Ownership, validation and ref                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Switch                                  | name + optional form; checked submits name=value (default "on"); unchecked/disabled omits it. defaultChecked defaults to false.                                                                                                | checked controls state; absent checked uses internal state. onChange(boolean), not a native input event. Ref remains HTMLButtonElement. Native checkbox backing is noninteractive; required means checked, invalid feedback focuses the visible switch and supplies a linked message. onInvalid receives that checkbox's native event; preventDefault supplies your own feedback/focus. |
| Slider                                  | Native range name/form; numeric value is serialized as a string. defaultValue defaults to the native range midpoint. Disabled omits it.                                                                                        | value controls state; absent value uses native uncontrolled input. onChange(number) remains a value callback. Ref is HTMLInputElement. Browser range clamping/stepping governs value and formatted readout. required is not supported because a native range cannot be empty.                                                                                                           |
| RadioGroup                              | Caller name/form on every radio; selected enabled option submits its string value. Without name the generated name remains compatible but is unsuitable for a service field. Without defaultValue/value no option is selected. | value controls selection; absent value is native uncontrolled selection. onChange(value) stays a string callback. Group disabled and option disabled omit affected radios; required uses native radio validation. No singular group input ref: option.inputProps.ref targets that native radio.                                                                                         |
| TextField/TextArea/SelectField/Checkbox | Native names/owners/defaults/disabled/required and native event callbacks remain. Checkbox now accepts caller id.                                                                                                              | Native input/textarea/select refs, explicit labels, caller ARIA descriptions/validity plus component errors are preserved. Text counters support maxLength=0; textarea auto-resize follows reset.                                                                                                                                                                                       |

Set unique IDs and stable radio option values. Equal names in the same form intentionally form one native radio group; unrelated groups need distinct names. Radio option inputProps allows ref/id/blur/focus/style/ARIA/native handlers; type/name/form/value/checked/default/required/disabled/selection remain group-owned. Extra description IDs must point to nodes you provide. Switch change notification is its boolean callback; do not rely on delegated native form onChange to observe its noninteractive backing checkbox. Switch/Slider native props target their visible native control, except Switch name/value/required belong to its backing input; existing styles/classes are retained. Button type and switch/range semantics remain owned.

Custom defaults for these three controls are captured on mount. Changing a default prop does not reset current state or replace the captured baseline; remount or use controlled values to replace that baseline. Do not switch ownership mid-mount. Supplying a controlled value wins over an initial default. Numeric props should be finite; native range sanitization is not service/domain validation. Missing selections in an enabled group use native required validation. Disabled groups/options omit values; validate availability and missing fields in the application/service.

```tsx
import { Slider, Switch, RadioGroup } from "@abuzareal/contour-ui";
export function PreferencesFields() {
  return (
    <>
      <form id="preferences" />
      <Switch
        label="Updates"
        name="updates"
        form="preferences"
        defaultChecked
      />
      <Slider
        label="Level"
        name="level"
        form="preferences"
        defaultValue={20}
        min={0}
        max={100}
        step={5}
      />
      <RadioGroup
        legend="Contact"
        name="contact"
        form="preferences"
        defaultValue="email"
        required
        options={[
          { value: "email", label: "Email" },
          { value: "phone", label: "Phone" },
        ]}
      />
    </>
  );
}
```

JavaScript uses the same imports/JSX without type arguments. RadioGroup does not require a wrapper/provider. Native form owners also work when the controls are rendered outside the form and when a form prop changes. Disabled fieldsets retain native disabled omission.

## Reset and controlled responsibilities

Native reset fires before the browser restores defaults. Uncontrolled choices/range and supporting readouts/counters synchronize after that default action (a browser task). A canceled reset preserves state/readouts. Reset does not generate a change callback. Listener/timer cleanup uses the owner document and current form owner, including external forms and unmount.

For controlled values, the application must update its own state in onReset or a dedicated reset command. The library restores the controlled visible/submitted value after the native reset task and never changes the parent state. Do not read a just-reset controlled form synchronously and assume React has committed; await the state update/task. React Hook Form Controller values need useForm defaultValues and reset(defaults). A later default prop is not a controlled reset command. A submission cancel stops client waiting; it cannot prove the server rolled back a request already received.

## Copyable native recipe

Copy [NativeSettingsForm.tsx](examples/forms/NativeSettingsForm.tsx), [settings.ts](examples/forms/settings.ts) and [useSubmission.ts](examples/forms/useSubmission.ts) into your application. Their relative .js imports resolve to the TypeScript files under NodeNext; use your bundler's matching source-import convention. Load Contour CSS once and add application layout styles. Pass a real SaveSettings adapter; no service endpoint, delay or fabricated success is built into the recipe.

The recipe reads an exact payload through FormData, validates known fields, displays field/service failures, prevents a second submission while waiting for the current request, disables editing while pending, preserves inputs on failure, permits retry/stop-waiting/reset and aborts/ignores obsolete/unmounted results. Stopping waiting abandons client ownership; it does not guarantee server work has stopped. Success is displayed only when your adapter returns ok:true, and a new invalid submission replaces previous success feedback. Submission announcements stay outside the busy fieldset. The example email/step policy is intentionally small; it is not universal address validation. Accessibility/status/keyboard behaviors are verified in the fixture. Service error strings should be meaningful to the user and safe to display.

```tsx
import { NativeSettingsForm } from "./NativeSettingsForm.js";
import type { SaveSettings } from "./settings.js";
// Your adapter validates unknown response data and confirms the server result.
export function PreferencesPage({ save }: { save: SaveSettings }) {
  return <NativeSettingsForm save={save} />;
}
```

Do not substitute an always-resolving callback for a real service and imply data was persisted. The browser fixture uses an explicitly labeled local test service to verify pending/error/success, not a production backend.

## React Hook Form recipe

Copy [HookFormSettingsForm.tsx](examples/forms/HookFormSettingsForm.tsx) and the same shared files. Install react-hook-form in the **application**, not as a Contour peer. Fixtures pin 7.90.0 with React 18.3.1 and 19.3.0; other versions are separate compatibility questions.

Native TextField registration forwards name/onChange/onBlur/ref. RHF submits its field model rather than FormData; use RHF disabled field options when omission is required. A disabled fieldset prevents editing but is not a replacement for that model policy. Switch/Slider/RadioGroup use Controller because onChange carries a boolean/number/string. Switch still exposes a button ref; radio field.ref goes on an enabled option's inputProps.ref. Blur handlers go on the visible control or radio options. The shown RHF recipe uses field errors rather than shouldUseNativeValidation; the Switch button ref has no input validity methods. Native form validity still includes its backing checkbox. Service errors focus after the disabled pending fieldset becomes enabled. Do not register and Controller the same field or spread a radio group's single controller ref onto every option.

The recipe uses useForm defaultValues, RHF field validation/server errors, handleSubmit, controller refs and reset. Its reset command performs native form.reset() first so registered field counters/auto-resize observe the reset, then reset(defaults) updates RHF state. For arbitrary programmatic RHF setValue calls on fields with counters/auto-resize, use Controller and pass the controlled value; direct DOM writes through a registered ref do not dispatch native input events. Its shared submission lifecycle ignores late results after reset/cancel/unmount even if the service disregards AbortSignal. Real services must enforce validation, authentication, authorization, CSRF policy and idempotency/overlap handling at the server boundary. Treat parsed responses as unknown until your adapter validates them; TypeScript alone does not validate network data.

References: [React native input ownership](https://react.dev/reference/react-dom/components/input), [native range semantics](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range), [RHF Controller](https://react-hook-form.com/docs/usecontroller/controller), [RHF reset](https://react-hook-form.com/docs/useform/reset), [Radix Switch form contract](https://www.radix-ui.com/primitives/docs/components/switch). These inform bounded contracts; Contour does not add a second interaction foundation or copy their implementation. Native-form checks are scoped Chromium evidence, not cross-browser/screen-reader certification.

## Version and reproduction

Reference version **0.6.3**. A source version does not establish publication; check the npm registry for availability. [Versioned source](https://github.com/abuzareal/contour-ui/tree/v0.6.3/src) and [emitted type inventory](PUBLIC-API.md) describe this contract; tag links resolve after release. [Report Forms 0.6.3](https://github.com/abuzareal/contour-ui/issues/new?template=bug_report.yml&component=Forms&version=0.6.3), using the [public minimal reproduction](examples/reproduction) and synthetic data.
