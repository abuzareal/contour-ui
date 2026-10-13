/** Form field frame: mono label, control slot, and hint, error, or counter text wired for assistive tech. */
import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { ccx } from "../../lib/classNames.js";

export type FieldProps = {
  id: string;
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  hideLabel?: boolean;
  /** e.g. "12/100", shown opposite the hint. */
  counter?: string;
  disabled?: boolean;
};

export default function Field({
  id,
  label,
  children,
  hint,
  error,
  required,
  hideLabel,
  counter,
  disabled,
}: FieldProps) {
  return (
    <div
      className={ccx(
        "field",
        error && "field-invalid",
        disabled && "field-disabled",
      )}
    >
      <label
        htmlFor={id}
        className={ccx("field-label mono", hideLabel && "visually-hidden")}
      >
        {label}
        {required && (
          <span className={ccx("field-required")} aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {(hint || error || counter) && (
        <div className={ccx("field-footer mono")}>
          {error ? (
            <span id={`${id}-error`} className={ccx("field-error")}>
              <AlertCircle size={13} aria-hidden="true" />
              {error}
            </span>
          ) : (
            hint && <span id={`${id}-hint`}>{hint}</span>
          )}
          {counter && <span className={ccx("field-counter")}>{counter}</span>}
        </div>
      )}
    </div>
  );
}
