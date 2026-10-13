"use client";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  RadioGroup,
  Slider,
  Switch,
  TextField,
} from "@abuzareal/contour-ui";
import {
  defaultSettings,
  type SaveSettings,
  type Settings,
} from "./settings.js";
import useSubmission from "./useSubmission.js";

/** RHF is an application dependency. Native fields register; value callbacks use Controller. */
export function HookFormSettingsForm({ save }: { save: SaveSettings }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<Settings>({ defaultValues: defaultSettings });
  const submission = useSubmission(save);
  const pending = submission.status === "pending";
  useEffect(() => {
    if (pending) return;
    for (const key of ["email", "updates", "level", "contact"] as const) {
      if (errors[key]) {
        setFocus(key);
        break;
      }
    }
  }, [errors, pending, setFocus]);
  const submit = handleSubmit(async (values) => {
    if (pending) return;
    const result = await submission.run({
      ...values,
      email: values.email.trim(),
    });
    if (result) {
      for (const key of ["email", "updates", "level", "contact"] as const) {
        const message = result.fields[key];
        if (message)
          setError(key, { type: "server", message }, { shouldFocus: false });
      }
    }
  }, submission.validationFailed);
  return (
    <form
      noValidate
      method="post"
      aria-label="Hook Form settings"
      onSubmit={submit}
    >
      <fieldset disabled={pending} aria-busy={pending}>
        <legend>Notification settings</legend>
        <TextField
          maxLength={80}
          type="email"
          label="Email"
          required
          autoComplete="email"
          error={errors.email?.message}
          {...register("email", {
            required: "Enter an email address.",
            validate: (value) =>
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ||
              "Enter a valid email address.",
          })}
        />
        <Controller
          control={control}
          name="updates"
          render={({ field }) => (
            <Switch
              ref={field.ref}
              name={field.name}
              label="Updates"
              checked={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.updates?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="level"
          rules={{
            validate: (value) =>
              (Number.isFinite(value) && value % 5 === 0) ||
              "Use steps of five.",
            min: { value: 0, message: "Choose at least zero." },
            max: { value: 100, message: "Choose at most 100." },
          }}
          render={({ field }) => (
            <Slider
              ref={field.ref}
              name={field.name}
              label="Level"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              min={0}
              max={100}
              step={5}
              format={(value) => `${value}%`}
              error={errors.level?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="contact"
          rules={{
            validate: (value) =>
              value === "email" ||
              value === "phone" ||
              "Choose a contact method.",
          }}
          render={({ field }) => (
            <RadioGroup
              name={field.name}
              legend="Contact method"
              value={field.value}
              onChange={field.onChange}
              required
              error={errors.contact?.message}
              options={[
                {
                  value: "email",
                  label: "Email contact",
                  inputProps: { ref: field.ref, onBlur: field.onBlur },
                },
                {
                  value: "phone",
                  label: "Phone contact",
                  inputProps: { onBlur: field.onBlur },
                },
              ]}
            />
          )}
        />
      </fieldset>
      <p role="status" aria-label="Submission status">
        {submission.message}
      </p>
      <Button type="submit" disabled={pending}>
        Save settings
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={(event) => {
          submission.cancel();
          // Native reset synchronizes registered counters/auto-resize; RHF resets its own state.
          event.currentTarget.form?.reset();
          reset(defaultSettings);
        }}
      >
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
