/** Form field frame: mono label, control slot, and hint, error, or counter text wired for assistive tech. */
import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cx } from "../../lib/classNames.js";

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
      className={cx(
        "field",
        error && "field-invalid",
        disabled && "field-disabled",
      )}
    >
      <label
        htmlFor={id}
        className={cx("field-label mono", hideLabel && "visually-hidden")}
      >
        {label}
        {required && (
          <span className="field-required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {(hint || error || counter) && (
        <div className="field-footer mono">
          {error ? (
            <span id={`${id}-error`} className="field-error">
              <AlertCircle size={13} aria-hidden="true" />
              {error}
            </span>
          ) : (
            hint && <span id={`${id}-hint`}>{hint}</span>
          )}
          {counter && <span className="field-counter">{counter}</span>}
        </div>
      )}
    </div>
  );
}
