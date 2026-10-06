/** Native select styled as an underlined field with a chevron. */
import { useId, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { fieldDescribedBy } from "../../lib/a11y.js";
import Field from "./Field.js";

export type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: { value: string; label: string }[];
  hint?: string;
  error?: string;
  placeholder?: string;
};

export default function SelectField({
  id: providedId,
  "aria-describedby": describedBy,
  label,
  options,
  hint,
  error,
  placeholder,
  ...rest
}: SelectFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      disabled={rest.disabled}
    >
      <div className="field-control field-select">
        <select
          {...rest}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [describedBy, fieldDescribedBy(id, hint, error)]
              .filter(Boolean)
              .join(" ") || undefined
          }
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="field-chevron" size={16} aria-hidden="true" />
      </div>
    </Field>
  );
}
