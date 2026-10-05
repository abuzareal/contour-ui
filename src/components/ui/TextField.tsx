/** Single-line text input with underline styling, optional icon/adornment, and character counter. */
import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { fieldDescribedBy } from "../../lib/a11y.js";
import Field from "./Field.js";

export type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id"
> & {
  label: string;
  hint?: string;
  error?: string;
  hideLabel?: boolean;
  leadingIcon?: ReactNode;
  /** Content after the input, e.g. a unit or an icon button. */
  trailing?: ReactNode;
};

export default function TextField({
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
  const id = useId();
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
      counter={maxLength ? `${length}/${maxLength}` : undefined}
    >
      <div className="field-control">
        {leadingIcon && <span className="field-icon">{leadingIcon}</span>}
        <input
          {...rest}
          id={id}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(id, hint, error)}
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
