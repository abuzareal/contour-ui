"use client";

/** Native range submission with controlled/default state, reset and a formatted readout. */
import {
  forwardRef,
  useId,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
} from "react";
import { cx, ccx } from "../../lib/classNames.js";
import useControlRef from "../../hooks/useControlRef.js";
import useFormReset from "../../hooks/useFormReset.js";

export type SliderProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | "type"
  | "value"
  | "defaultValue"
  | "onChange"
  | "required"
  | "dangerouslySetInnerHTML"
  | "children"
  | "min"
  | "max"
  | "step"
> & {
  label: string;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number | "any";
  /** Formats the readout and accessible value text. */
  format?: (value: number) => string;
  hint?: string;
  error?: string;
};

const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    label,
    value,
    defaultValue,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    format = String,
    disabled,
    id: providedId,
    className,
    style,
    onInput,
    hint,
    error,
    "aria-describedby": describedBy,
    ...rest
  },
  forwardedRef,
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const [initial] = useState(
    defaultValue ?? value ?? (min + Math.max(min, max)) / 2,
  );
  const [readout, setReadout] = useState(value ?? initial);
  const { ref, attach } = useControlRef(forwardedRef);
  useLayoutEffect(() => {
    const input = ref.current;
    if (!input) return;
    input.defaultValue = String(initial);
    // Read the browser's sanitized value; clamp/step behavior stays native.
    if (value !== undefined) input.value = String(value);
    const actual = input.valueAsNumber;
    if (Number.isFinite(actual)) setReadout(actual);
  }, [readout, initial, min, max, step, ref, value]);
  useFormReset(ref, () => {
    const input = ref.current;
    if (!input) return;
    if (value !== undefined) input.value = String(value);
    setReadout(input.valueAsNumber);
  });
  const progress =
    max > min
      ? Math.min(100, Math.max(0, ((readout - min) / (max - min)) * 100))
      : 0;
  return (
    <div className={ccx("slider")}>
      <div className={ccx("slider-header mono")}>
        <label htmlFor={id} className={ccx("field-label")}>
          {label}
        </label>
        <output htmlFor={id}>{format(readout)}</output>
      </div>
      <input
        {...rest}
        ref={attach}
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={value === undefined ? initial : undefined}
        disabled={disabled}
        className={className}
        aria-invalid={error ? true : rest["aria-invalid"]}
        aria-describedby={
          cx(describedBy, hint && `${id}-hint`, error && `${id}-error`) ||
          undefined
        }
        aria-valuetext={rest["aria-valuetext"] ?? format(readout)}
        style={{ ...style, "--progress": `${progress}%` } as CSSProperties}
        onInput={(event) => {
          if (value === undefined)
            setReadout(event.currentTarget.valueAsNumber);
          onInput?.(event);
        }}
        onChange={(event) => {
          const next = event.currentTarget.valueAsNumber;
          if (value === undefined) setReadout(next);
          onChange?.(next);
        }}
      />
      {hint && (
        <span id={`${id}-hint`} className={ccx("choice-description")}>
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className={ccx("choice-error mono")}>
          {error}
        </span>
      )}
    </div>
  );
});
export default Slider;
