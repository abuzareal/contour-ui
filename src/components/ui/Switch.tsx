"use client";

/** On/off switch (role="switch") with a pill track that fills acid when on. */
import { useId } from "react";

export type SwitchProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
};

export default function Switch({
  label,
  checked,
  onChange,
  description,
  disabled,
}: SwitchProps) {
  const id = useId();

  return (
    <div className="switch">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? `${id}-description` : undefined}
        disabled={disabled}
        className="switch-track"
        onClick={() => onChange(!checked)}
      >
        <span className="switch-thumb" />
      </button>
      <label htmlFor={id} className="choice-text">
        <span className="choice-label">{label}</span>
        {description && (
          <span id={`${id}-description`} className="choice-description">
            {description}
          </span>
        )}
      </label>
    </div>
  );
}
