/** Range slider with a filled acid track and a live value readout. */
import { useId, type CSSProperties } from "react";

export type SliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Formats the readout, e.g. (value) => `${value}%`. */
  format?: (value: number) => string;
  disabled?: boolean;
};

export default function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  format = String,
  disabled,
}: SliderProps) {
  const id = useId();
  const progress =
    max > min
      ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
      : 0;

  return (
    <div className="slider">
      <div className="slider-header mono">
        <label htmlFor={id} className="field-label">
          {label}
        </label>
        <output htmlFor={id}>{format(value)}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={format(value)}
        style={{ "--progress": `${progress}%` } as CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
