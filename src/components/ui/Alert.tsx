"use client";

/** Inline or full-width message with a tone icon, 3px accent rule, optional action, and dismiss. */
import type { ReactNode } from "react";
import {
  Asterisk,
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { cx } from "../../lib/classNames.js";

export type AlertTone =
  "neutral" | "accent" | "success" | "info" | "warning" | "danger";

const toneIcons: Record<AlertTone, ReactNode> = {
  neutral: <Asterisk size={18} />,
  accent: <Asterisk size={18} />,
  success: <CircleCheck size={18} />,
  info: <Info size={18} />,
  warning: <TriangleAlert size={18} />,
  danger: <CircleX size={18} />,
};

export type AlertProps = {
  tone?: AlertTone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  /** "banner" spans its container edge to edge on one line. */
  layout?: "inline" | "banner";
};

export default function Alert({
  tone = "neutral",
  title,
  children,
  action,
  onDismiss,
  layout = "inline",
}: AlertProps) {
  const urgent = tone === "warning" || tone === "danger";
  return (
    <div
      role={urgent ? "alert" : "status"}
      className={cx("alert", `alert-${tone}`, `alert-${layout}`)}
    >
      <span className="alert-icon" aria-hidden="true">
        {toneIcons[tone]}
      </span>
      <div className="alert-content">
        <strong className="alert-title">{title}</strong>
        {children && <div className="alert-body">{children}</div>}
      </div>
      {action && <div className="alert-action">{action}</div>}
      {onDismiss && (
        <button
          type="button"
          className="alert-dismiss"
          aria-label="Dismiss"
          onClick={onDismiss}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
