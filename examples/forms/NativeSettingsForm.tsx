"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
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

/** Provide a real save adapter. This example never invents a successful response. */
export function NativeSettingsForm({ save }: { save: SaveSettings }) {
  const submission = useSubmission(save);
  const [errors, setErrors] = useState<FieldErrors>({});
  const email = useRef<HTMLInputElement>(null);
  const level = useRef<HTMLInputElement>(null);
  const contact = useRef<HTMLInputElement>(null);
  const updates = useRef<HTMLButtonElement>(null);
  const pending = submission.status === "pending";
  useEffect(() => {
    if (pending) return;
    if (errors.email) email.current?.focus();
    else if (errors.updates) updates.current?.focus();
    else if (errors.level) level.current?.focus();
    else if (errors.contact) contact.current?.focus();
  }, [errors, pending]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const parsed = readSettings(new FormData(event.currentTarget));
    setErrors(parsed.errors);
    if (!parsed.value) {
      submission.validationFailed();
      return;
    }
    const result = await submission.run(parsed.value);
    if (result) setErrors(result.fields);
  };
  return (
    <form
      noValidate
      method="post"
      onSubmit={submit}
      onReset={() => {
        submission.cancel();
        setErrors({});
      }}
      aria-label="Native settings"
    >
      <fieldset disabled={pending} aria-busy={pending}>
        <legend>Notification settings</legend>
        <TextField
          ref={email}
          name="email"
          maxLength={80}
          type="email"
          label="Email"
          required
          autoComplete="email"
          error={errors.email}
        />
        <Switch
          ref={updates}
          name="updates"
          label="Updates"
          defaultChecked={defaultSettings.updates}
          error={errors.updates}
        />
        <Slider
          ref={level}
          name="level"
          label="Level"
          defaultValue={defaultSettings.level}
          min={0}
          max={100}
          step={5}
          format={(value) => `${value}%`}
          error={errors.level}
        />
        <RadioGroup
          name="contact"
          legend="Contact method"
          defaultValue={defaultSettings.contact}
          required
          error={errors.contact}
          options={[
            {
              value: "email",
              label: "Email contact",
              inputProps: { ref: contact },
            },
            { value: "phone", label: "Phone contact" },
          ]}
        />
      </fieldset>
      <p role="status" aria-label="Submission status">
        {submission.message}
      </p>
      <Button type="submit" disabled={pending}>
        Save settings
      </Button>
      <Button type="reset" variant="secondary">
        Reset settings
      </Button>
      {pending && (
        <Button onClick={submission.cancel} variant="secondary">
          Stop waiting
        </Button>
      )}
    </form>
  );
}
