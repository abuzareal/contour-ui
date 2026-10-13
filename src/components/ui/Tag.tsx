"use client";

import { ccx } from "../../lib/classNames.js";

/** Mono "+ tag" label (as in project notes); becomes a removable chip when given onRemove. */
import { X } from "lucide-react";

export type TagProps = {
  children: string;
  removeLabel?: string;
  onRemove?: () => void;
};

export default function Tag({ children, onRemove, removeLabel }: TagProps) {
  if (!onRemove) return <span className={ccx("tag mono")}>{children}</span>;
  return (
    <span className={ccx("tag tag-removable mono")}>
      {children}
      <button
        type="button"
        className={ccx("tag-remove")}
        aria-label={removeLabel ?? `Remove ${children}`}
        onClick={onRemove}
      >
        <X size={12} />
      </button>
    </span>
  );
}
