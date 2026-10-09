"use client";

/** Mono "+ tag" label (as in project notes); becomes a removable chip when given onRemove. */
import { X } from "lucide-react";

export type TagProps = {
  children: string;
  onRemove?: () => void;
};

export default function Tag({ children, onRemove }: TagProps) {
  if (!onRemove) return <span className="tag mono">{children}</span>;
  return (
    <span className="tag tag-removable mono">
      {children}
      <button
        type="button"
        className="tag-remove"
        aria-label={`Remove ${children}`}
        onClick={onRemove}
      >
        <X size={12} />
      </button>
    </span>
  );
}
