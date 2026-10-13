"use client";

import { ccx } from "../../lib/classNames.js";

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
    <div className={ccx("segmented")} role="radiogroup" aria-label={label}>
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
            className={ccx("segmented-option")}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              const next = nextIndexForKey(
                event.key,
                index,
                options.length,
                "horizontal",
                event.currentTarget.ownerDocument.defaultView?.getComputedStyle(
                  event.currentTarget,
                ).direction === "rtl"
                  ? "rtl"
                  : "ltr",
              );
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
