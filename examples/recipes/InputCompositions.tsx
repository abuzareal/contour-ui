"use client";
import { useRef, useState } from "react";
import { TextField } from "@abuzareal/contour-ui";

/** Native number behavior is sufficient for a bounded integer quantity, not locale-aware money. */
export function QuantityField() {
  return (
    <TextField
      leadingIcon={<span aria-hidden="true">#</span>}
      label="Seats"
      name="seats"
      type="number"
      min={1}
      max={100}
      step={1}
      defaultValue={1}
      trailing={<span aria-hidden="true">seats</span>}
      hint="Whole number, 1–100 seats."
    />
  );
}

/** Keep the same native input mounted so form identity and password-manager hooks survive toggling. */
export function PasswordField() {
  const [visible, setVisible] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  return (
    <TextField
      ref={input}
      label="Password"
      name="password"
      type={visible ? "text" : "password"}
      autoComplete="current-password"
      trailing={
        <button
          type="button"
          aria-label="Show password"
          aria-pressed={visible}
          onClick={() => {
            setVisible((previous) => !previous);
            input.current?.focus();
          }}
        >
          {visible ? "Hide" : "Show"}
        </button>
      }
    />
  );
}
