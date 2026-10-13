"use client";

/** Button switch with a native checkbox backing submission, validation and reset. */
import {
  forwardRef,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type FormEventHandler,
} from "react";
import { cx } from "../../lib/classNames.js";
import useControlRef from "../../hooks/useControlRef.js";
import useFormReset from "../../hooks/useFormReset.js";

export type SwitchProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | "onChange"
  | "value"
  | "defaultValue"
  | "onInvalid"
  | "children"
  | "dangerouslySetInnerHTML"
> & {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  /** Submitted only when checked; defaults to the native checkbox value "on". */
  value?: string;
  required?: boolean;
  description?: string;
  error?: string;
  /** Native invalid event from the backing checkbox; preventDefault owns feedback/focus. */
  onInvalid?: FormEventHandler<HTMLInputElement>;
};

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    label,
    checked,
    defaultChecked,
    onChange,
    description,
    error,
    disabled,
    required,
    name,
    form,
    value = "on",
    id: providedId,
    className,
    onClick,
    onInvalid,
    "aria-describedby": describedBy,
    ...rest
  },
  forwardedRef,
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const [initial] = useState(defaultChecked ?? checked ?? false);
  const [localChecked, setLocalChecked] = useState(initial);
  const [invalid, setInvalid] = useState(false);
  const current = checked ?? localChecked;
  const { ref: button, attach } = useControlRef(forwardedRef);
  const input = useRef<HTMLInputElement>(null);
  const message =
    error ??
    (invalid && !current ? "Turn on this option to continue." : undefined);
  useLayoutEffect(() => {
    if (input.current) {
      input.current.defaultChecked = initial;
      input.current.checked = current;
    }
  });
  useFormReset(input, () => {
    if (checked === undefined)
      setLocalChecked(input.current?.checked ?? initial);
    else if (input.current) input.current.checked = checked;
    setInvalid(false);
  });

  return (
    <div className="switch">
      <button
        {...rest}
        ref={attach}
        id={id}
        name={undefined}
        form={form}
        type="button"
        role="switch"
        aria-labelledby={cx(`${id}-label`, rest["aria-labelledby"])}
        aria-checked={current}
        aria-required={required || undefined}
        aria-invalid={message ? true : rest["aria-invalid"]}
        aria-describedby={
          cx(
            describedBy,
            description && `${id}-description`,
            message && `${id}-error`,
          ) || undefined
        }
        disabled={disabled}
        className={cx("switch-track", className)}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (event.currentTarget.matches(":disabled")) return;
          if (checked === undefined) {
            if (input.current) input.current.checked = !current;
            setLocalChecked(!current);
          }
          setInvalid(false);
          onChange?.(!current);
        }}
      >
        <span className="switch-thumb" />
      </button>
      <input
        ref={input}
        type="checkbox"
        hidden
        aria-hidden="true"
        tabIndex={-1}
        name={name}
        form={form}
        value={value}
        disabled={disabled}
        required={required}
        checked={checked}
        defaultChecked={checked === undefined ? initial : undefined}
        onChange={() => {}}
        onInvalid={(event) => {
          onInvalid?.(event);
          const canceled = event.defaultPrevented;
          // Native validation must never try to focus the noninteractive backing control.
          event.preventDefault();
          if (!canceled) {
            setInvalid(true);
            button.current?.focus();
          }
        }}
      />
      <label htmlFor={id} className="choice-text">
        <span id={`${id}-label`} className="choice-label">
          {label}
        </span>
        {description && (
          <span id={`${id}-description`} className="choice-description">
            {description}
          </span>
        )}
        {message && (
          <span id={`${id}-error`} className="choice-error mono">
            {message}
          </span>
        )}
      </label>
    </div>
  );
});
export default Switch;
