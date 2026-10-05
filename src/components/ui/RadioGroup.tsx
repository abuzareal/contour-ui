/** Fieldset of round radio options sharing one name, with a mono legend. */
import { useId } from "react";
import { cx } from "../../lib/classNames.js";

export type RadioGroupProps<Value extends string> = {
  legend: string;
  options: {
    value: Value;
    label: string;
    description?: string;
    disabled?: boolean;
  }[];
  value: Value;
  onChange: (value: Value) => void;
  /** Lays options out in a row on wider screens. */
  inline?: boolean;
};

export default function RadioGroup<Value extends string>({
  legend,
  options,
  value,
  onChange,
  inline = false,
}: RadioGroupProps<Value>) {
  const name = useId();

  return (
    <fieldset className={cx("radio-group", inline && "radio-group-inline")}>
      <legend className="field-label mono">{legend}</legend>
      {options.map((option) => {
        const id = `${name}-${option.value}`;
        return (
          <div key={option.value} className="choice choice-radio">
            <span className="choice-control">
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={option.value === value}
                disabled={option.disabled}
                className="choice-input"
                onChange={() => onChange(option.value)}
              />
              <span className="choice-box" aria-hidden="true" />
            </span>
            <label htmlFor={id} className="choice-text">
              <span className="choice-label">{option.label}</span>
              {option.description && (
                <span className="choice-description">{option.description}</span>
              )}
            </label>
          </div>
        );
      })}
    </fieldset>
  );
}
