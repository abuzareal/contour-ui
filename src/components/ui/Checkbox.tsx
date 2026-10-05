/** Square checkbox with an acid check, optional description, error, and indeterminate state. */
import { useEffect, useId, useRef, type InputHTMLAttributes } from "react";
import { Check, Minus } from "lucide-react";
import { cx } from "../../lib/classNames.js";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "id"
> & {
  label: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
};

export default function Checkbox({
  label,
  description,
  error,
  indeterminate = false,
  className,
  ...rest
}: CheckboxProps) {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div className={cx("choice", error && "choice-invalid", className)}>
      <span className="choice-control">
        <input
          {...rest}
          ref={ref}
          id={id}
          type="checkbox"
          className="choice-input"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
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
          <span className="choice-description">{description}</span>
        )}
        {error && (
          <span id={`${id}-error`} className="choice-error mono">
            {error}
          </span>
        )}
      </label>
    </div>
  );
}
