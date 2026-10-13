"use client";

/** Square checkbox with an acid check, optional description, error, and indeterminate state. */
import { forwardRef, useEffect, useId, type InputHTMLAttributes } from "react";
import { Check, Minus } from "lucide-react";
import useControlRef from "../../hooks/useControlRef.js";
import useFormReset from "../../hooks/useFormReset.js";
import { cx } from "../../lib/classNames.js";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    description,
    error,
    indeterminate = false,
    className,
    id: providedId,
    ...rest
  }: CheckboxProps,
  forwardedRef,
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const { ref, attach } = useControlRef(forwardedRef);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate, ref]);
  useFormReset(ref, () => {
    if (!ref.current) return;
    if (rest.checked !== undefined) ref.current.checked = rest.checked;
    ref.current.indeterminate = indeterminate;
  });

  return (
    <div className={cx("choice", error && "choice-invalid", className)}>
      <span className="choice-control">
        <input
          {...rest}
          ref={attach}
          id={id}
          type="checkbox"
          className="choice-input"
          aria-invalid={error ? true : rest["aria-invalid"]}
          aria-describedby={
            [
              rest["aria-describedby"],
              description && `${id}-description`,
              error && `${id}-error`,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
        <span className="choice-box" aria-hidden="true">
          {indeterminate ? (
            <Minus size={13} strokeWidth={3} />
          ) : (
            <Check size={13} strokeWidth={3} />
          )}
        </span>
      </span>
      <label htmlFor={id} className="choice-text">
        <span className="choice-label">{label}</span>
        {description && (
          <span id={`${id}-description`} className="choice-description">
            {description}
          </span>
        )}
        {error && (
          <span id={`${id}-error`} className="choice-error mono">
            {error}
          </span>
        )}
      </label>
    </div>
  );
});
export default Checkbox;
