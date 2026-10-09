"use client";

/** Single-line text input with underline styling, optional icon/adornment, and character counter. */
import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { fieldDescribedBy } from "../../lib/a11y.js";
import Field from "./Field.js";
import useControlRef from "../../hooks/useControlRef.js";
import useFormReset from "../../hooks/useFormReset.js";

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  hideLabel?: boolean;
  leadingIcon?: ReactNode;
  /** Content after the input, e.g. a unit or an icon button. */
  trailing?: ReactNode;
};

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
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
    },
    forwardedRef,
  ) {
    const { ref, attach } = useControlRef(forwardedRef);
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const [length, setLength] = useState(
      String(rest.value ?? rest.defaultValue ?? "").length,
    );
    useFormReset(ref, () => setLength(ref.current?.value.length ?? 0));

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
          maxLength !== undefined
            ? `${rest.value !== undefined ? String(rest.value).length : length}/${maxLength}`
            : undefined
        }
      >
        <div className="field-control">
          {leadingIcon && <span className="field-icon">{leadingIcon}</span>}
          <input
            {...rest}
            ref={attach}
            id={id}
            maxLength={maxLength}
            aria-invalid={error ? true : rest["aria-invalid"]}
            aria-describedby={
              [describedBy, fieldDescribedBy(id, hint, error)]
                .filter(Boolean)
                .join(" ") || undefined
            }
            // Native input also runs when React deduplicates a repeated value after form.reset().
            onInput={(event) => {
              setLength(event.currentTarget.value.length);
              rest.onInput?.(event);
            }}
            onChange={(event) => {
              setLength(event.target.value.length);
              onChange?.(event);
            }}
          />
          {trailing && <span className="field-trailing">{trailing}</span>}
        </div>
      </Field>
    );
  },
);
export default TextField;
