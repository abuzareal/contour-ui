"use client";

/** Native select styled as an underlined field with a chevron. */
import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { fieldDescribedBy } from "../../lib/a11y.js";
import Field from "./Field.js";
import useControlRef from "../../hooks/useControlRef.js";
import useFormReset from "../../hooks/useFormReset.js";

export type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: { value: string; label: string }[];
  hint?: string;
  error?: string;
  placeholder?: string;
};

/** Native reset does not preserve React's controlled selection on its own. */
function restoreSelection(
  control: HTMLSelectElement,
  value: string | number | readonly string[],
) {
  const values = new Set(
    Array.isArray(value) ? value.map(String) : [String(value)],
  );
  for (const option of control.options)
    option.selected = values.has(option.value);
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField(
    {
      id: providedId,
      "aria-describedby": describedBy,
      label,
      options,
      hint,
      error,
      placeholder,
      ...rest
    },
    forwardedRef,
  ) {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const { ref, attach } = useControlRef(forwardedRef);
    useFormReset(ref, () => {
      if (!ref.current || rest.value === undefined) return;
      restoreSelection(ref.current, rest.value);
    });

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
            ref={attach}
            id={id}
            aria-invalid={error ? true : rest["aria-invalid"]}
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
  },
);
export default SelectField;
