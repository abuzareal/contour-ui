"use client";

/** Single-choice pill group (filter buttons) with arrow-key navigation. */
import { useRef } from "react";
import { nextIndexForKey } from "../../lib/keyboard.js";

export type SegmentedControlProps<Value extends string> = {
  label: string;
  options: { value: Value; label: string }[];
  value: Value;
  onChange: (value: Value) => void;
};

export default function SegmentedControl<Value extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<Value>) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className="segmented-option"
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              const next = nextIndexForKey(event.key, index, options.length);
              if (next === null) return;
              event.preventDefault();
              onChange(options[next].value);
              buttons.current[next]?.focus();
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
