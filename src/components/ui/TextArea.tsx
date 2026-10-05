/** Multi-line text input with optional auto-resize and character counter. */
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type TextareaHTMLAttributes,
} from "react";
import { fieldDescribedBy } from "../../lib/a11y.js";
import Field from "./Field.js";

export type TextAreaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "id"
> & {
  label: string;
  hint?: string;
  error?: string;
  /** Grows with its content instead of scrolling. */
  autoResize?: boolean;
};

export default function TextArea({
  label,
  hint,
  error,
  autoResize = false,
  maxLength,
  onChange,
  rows = 3,
  ...rest
}: TextAreaProps) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [length, setLength] = useState(
    String(rest.value ?? rest.defaultValue ?? "").length,
  );

  const fitContent = () => {
    const element = ref.current;
    if (!autoResize || !element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };
  useLayoutEffect(fitContent);

  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={rest.required}
      disabled={rest.disabled}
      counter={maxLength ? `${length}/${maxLength}` : undefined}
    >
      <div className="field-control">
        <textarea
          {...rest}
          ref={ref}
          id={id}
          rows={rows}
          maxLength={maxLength}
          data-auto-resize={autoResize || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(id, hint, error)}
          onChange={(event) => {
            setLength(event.target.value.length);
            fitContent();
            onChange?.(event);
          }}
        />
      </div>
    </Field>
  );
}
