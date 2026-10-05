/** Numbered progress steps joined by a rule; completed steps show a check. */
import { Check } from "lucide-react";
import { cx } from "../../lib/classNames.js";
import { formatIndex } from "../../lib/format.js";

export type StepperProps = {
  steps: { label: string; description?: string }[];
  /** Zero-based index of the step in progress. */
  current: number;
  label?: string;
};

export default function Stepper({
  steps,
  current,
  label = "Progress",
}: StepperProps) {
  return (
    <ol className="stepper" aria-label={label}>
      {steps.map((step, index) => {
        const state =
          index < current
            ? "complete"
            : index === current
              ? "current"
              : "upcoming";
        return (
          <li
            key={step.label}
            className={cx("stepper-step", `stepper-${state}`)}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span className="stepper-marker mono" aria-hidden="true">
              {state === "complete" ? (
                <Check size={14} strokeWidth={2.5} />
              ) : (
                formatIndex(index + 1)
              )}
            </span>
            <span className="stepper-text">
              <span className="stepper-label">{step.label}</span>
              {step.description && (
                <span className="stepper-description mono">
                  {step.description}
                </span>
              )}
              <span className="visually-hidden">({state})</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
