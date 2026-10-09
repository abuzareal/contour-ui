"use client";

/** Multi-line text input with optional auto-resize and character counter. */
import {
  forwardRef,
  useId,
  useLayoutEffect,
  useState,
  type TextareaHTMLAttributes,
} from "react";
import { fieldDescribedBy } from "../../lib/a11y.js";
import Field from "./Field.js";
import useControlRef from "../../hooks/useControlRef.js";
import useFormReset from "../../hooks/useFormReset.js";

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
  /** Grows with its content instead of scrolling. */
  autoResize?: boolean;
};

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      id: providedId,
      "aria-describedby": describedBy,
      label,
      hint,
      error,
      autoResize = false,
      maxLength,
      onChange,
      rows = 3,
      ...rest
    },
    forwardedRef,
  ) {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const { ref, attach } = useControlRef(forwardedRef);
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
    useFormReset(ref, () => {
      setLength(ref.current?.value.length ?? 0);
      fitContent();
    });

    return (
      <Field
        id={id}
        label={label}
        hint={hint}
        error={error}
        required={rest.required}
        disabled={rest.disabled}
        counter={
          maxLength !== undefined
            ? `${rest.value !== undefined ? String(rest.value).length : length}/${maxLength}`
            : undefined
        }
      >
        <div className="field-control">
          <textarea
            {...rest}
            ref={attach}
            id={id}
            rows={rows}
            maxLength={maxLength}
            data-auto-resize={autoResize || undefined}
            aria-invalid={error ? true : rest["aria-invalid"]}
            aria-describedby={
              [describedBy, fieldDescribedBy(id, hint, error)]
                .filter(Boolean)
                .join(" ") || undefined
            }
            // Native input also runs when React deduplicates a repeated value after form.reset().
            onInput={(event) => {
              setLength(event.currentTarget.value.length);
              fitContent();
              rest.onInput?.(event);
            }}
            onChange={(event) => {
              setLength(event.target.value.length);
              fitContent();
              onChange?.(event);
            }}
          />
        </div>
      </Field>
    );
  },
);
export default TextArea;
