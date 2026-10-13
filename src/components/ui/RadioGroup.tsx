"use client";

/** Native radios with caller form/name, controlled/default selection and option input refs. */
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FieldsetHTMLAttributes,
} from "react";
import { cx } from "../../lib/classNames.js";
import type { NativePartProps } from "../../lib/componentProps.js";
import useFormReset from "../../hooks/useFormReset.js";

export type RadioGroupProps<Value extends string> = Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "onChange" | "defaultValue" | "children" | "dangerouslySetInnerHTML"
> & {
  legend: string;
  options: {
    value: Value;
    label: string;
    description?: string;
    disabled?: boolean;
    /** Native focus/blur/ref/ID access for form controllers; selection stays group-owned. */
    inputProps?: Omit<
      NativePartProps<"input">,
      | "type"
      | "name"
      | "form"
      | "value"
      | "defaultValue"
      | "checked"
      | "defaultChecked"
      | "disabled"
      | "required"
      | "onChange"
    >;
  }[];
  value?: Value;
  defaultValue?: Value;
  onChange?: (value: Value) => void;
  inline?: boolean;
  required?: boolean;
  description?: string;
  error?: string;
};

export default function RadioGroup<Value extends string>({
  legend,
  options,
  value,
  defaultValue,
  onChange,
  inline = false,
  name: providedName,
  form,
  id: providedId,
  disabled,
  required,
  description,
  error,
  className,
  "aria-describedby": describedBy,
  ...rest
}: RadioGroupProps<Value>) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const name = providedName ?? generatedId;
  const [initial] = useState(defaultValue ?? value);
  const ref = useRef<HTMLFieldSetElement>(null);
  const inputs = () =>
    ref.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]');
  useLayoutEffect(() => {
    inputs()?.forEach((input) => {
      input.defaultChecked = input.value === initial;
      if (value !== undefined) input.checked = input.value === value;
    });
  });
  useFormReset(ref, () => {
    if (value !== undefined)
      inputs()?.forEach((input) => {
        input.checked = input.value === value;
      });
  });
  const context =
    cx(
      describedBy,
      description && `${id}-description`,
      error && `${id}-error`,
    ) || undefined;
  return (
    <fieldset
      {...rest}
      ref={ref}
      id={id}
      name={name}
      form={form}
      disabled={disabled}
      aria-invalid={error ? true : rest["aria-invalid"]}
      aria-describedby={context}
      className={cx("radio-group", inline && "radio-group-inline", className)}
    >
      <legend className="field-label mono">{legend}</legend>
      {description && (
        <span id={`${id}-description`} className="choice-description">
          {description}
        </span>
      )}
      {options.map((option) => {
        const optionId = option.inputProps?.id ?? `${id}-${option.value}`;
        return (
          <div key={option.value} className="choice choice-radio">
            <span className="choice-control">
              <input
                {...option.inputProps}
                id={optionId}
                type="radio"
                name={name}
                form={form}
                value={option.value}
                checked={
                  value === undefined ? undefined : option.value === value
                }
                defaultChecked={
                  value === undefined ? option.value === initial : undefined
                }
                required={required}
                disabled={disabled || option.disabled}
                className={cx("choice-input", option.inputProps?.className)}
                aria-invalid={
                  error
                    ? true
                    : (option.inputProps?.["aria-invalid"] ??
                      rest["aria-invalid"])
                }
                aria-describedby={
                  cx(
                    option.inputProps?.["aria-describedby"],
                    context,
                    option.description && `${optionId}-description`,
                  ) || undefined
                }
                onChange={(event) => {
                  if (!event.currentTarget.checked) return;
                  onChange?.(option.value);
                }}
              />
              <span className="choice-box" aria-hidden="true" />
            </span>
            <label htmlFor={optionId} className="choice-text">
              <span className="choice-label">{option.label}</span>
              {option.description && (
                <span
                  id={`${optionId}-description`}
                  className="choice-description"
                >
                  {option.description}
                </span>
              )}
            </label>
          </div>
        );
      })}
      {error && (
        <span id={`${id}-error`} className="choice-error mono">
          {error}
        </span>
      )}
    </fieldset>
  );
}
