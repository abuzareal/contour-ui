"use client";
import { useState } from "react";
import {
  Button,
  RadioGroup,
  Slider,
  Switch,
  TextField,
} from "@abuzareal/contour-ui";
import {
  defaultSettings,
  readSettings,
  type FieldErrors,
  type SaveSettings,
} from "./settings.js";
import useSubmission from "./useSubmission.js";

/** Legacy 0.3.0 recipe: these three controls submit through application state. */
export function ManualSettingsForm({ save }: { save: SaveSettings }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [errors, setErrors] = useState<FieldErrors>({});
  const submission = useSubmission(save);
  const pending = submission.status === "pending";
  return (
    <form
      noValidate
      method="post"
      aria-label="Manual 0.3.0 settings"
      onReset={() => {
        submission.cancel();
        setSettings(defaultSettings);
        setErrors({});
      }}
      onSubmit={async (event) => {
        event.preventDefault();
        if (pending) return;
        const data = new FormData(event.currentTarget);
        // The generated radio name is not a stable service field; explicitly serialize state.
        data.set("level", String(settings.level));
        data.set("contact", settings.contact);
        if (settings.updates) data.set("updates", "on");
        else data.delete("updates");
        const parsed = readSettings(data);
        setErrors(parsed.errors);
        if (!parsed.value) {
          submission.validationFailed();
          return;
        }
        const result = await submission.run(parsed.value);
        if (result) setErrors(result.fields);
      }}
    >
      <fieldset disabled={pending} aria-busy={pending}>
        <legend>Notification settings</legend>
        <TextField
          name="email"
          label="Email"
          type="email"
          required
          error={errors.email}
        />
        <Switch
          label="Updates"
          checked={settings.updates}
          onChange={(updates) =>
            setSettings((current) => ({ ...current, updates }))
          }
        />
        <Slider
          label="Level"
          value={settings.level}
          step={5}
          onChange={(level) =>
            setSettings((current) => ({ ...current, level }))
          }
        />
        <RadioGroup
          legend="Contact method"
          value={settings.contact}
          onChange={(contact) =>
            setSettings((current) => ({ ...current, contact }))
          }
          options={[
            { value: "email", label: "Email contact" },
            { value: "phone", label: "Phone contact" },
          ]}
        />
        <p aria-live="polite">
          {errors.updates ?? errors.level ?? errors.contact}
        </p>
      </fieldset>
      <p role="status" aria-label="Submission status">
        {submission.message}
      </p>
      <Button type="submit" disabled={pending}>
        Save settings
      </Button>
      <Button type="reset">Reset settings</Button>
      {pending && <Button onClick={submission.cancel}>Stop waiting</Button>}
    </form>
  );
}
