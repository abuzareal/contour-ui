/** Single-line text input with underline styling, optional icon/adornment, and character counter. */
import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { fieldDescribedBy } from "../../lib/a11y.js";
import Field from "./Field.js";

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  hideLabel?: boolean;
  leadingIcon?: ReactNode;
  /** Content after the input, e.g. a unit or an icon button. */
  trailing?: ReactNode;
};

export default function TextField({
  id: providedId,
  "aria-describedby": describedBy,
  label,
  hint,
  error,
  hideLabel,
  leadingIcon,
  trailing,
  maxLength,
  onChange,
  ...rest
}: TextFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const [length, setLength] = useState(
    String(rest.value ?? rest.defaultValue ?? "").length,
  );

  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      hideLabel={hideLabel}
      disabled={rest.disabled}
      counter={
        maxLength
          ? `${rest.value !== undefined ? String(rest.value).length : length}/${maxLength}`
          : undefined
      }
    >
      <div className="field-control">
        {leadingIcon && <span className="field-icon">{leadingIcon}</span>}
        <input
          {...rest}
          id={id}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [describedBy, fieldDescribedBy(id, hint, error)]
              .filter(Boolean)
              .join(" ") || undefined
          }
          onChange={(event) => {
            setLength(event.target.value.length);
            onChange?.(event);
          }}
        />
        {trailing && <span className="field-trailing">{trailing}</span>}
      </div>
    </Field>
  );
}
