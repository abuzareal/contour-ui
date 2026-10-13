"use client";

/** Renders queued toasts in a polite live region; each auto-dismisses unless hovered or focused. */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import {
  ToastContext,
  type ToastContextValue,
  type ToastInput,
} from "../../hooks/useToast.js";
import { ccx } from "../../lib/classNames.js";

type ToastItem = ToastInput & { id: number };

const autoDismissAfter = 5000;

function Toast({
  toast,
  onDismiss,
  dismissLabel,
}: {
  toast: ToastItem;
  onDismiss: (id: number) => void;
  dismissLabel: string;
}) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(
      () => onDismiss(toast.id),
      autoDismissAfter,
    );
    return () => window.clearTimeout(timer);
  }, [paused, toast.id, onDismiss]);

  return (
    <li
      className={ccx("toast", `toast-${toast.tone ?? "neutral"}`)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className={ccx("toast-bar")} aria-hidden="true" />
      <div className={ccx("toast-content")}>
        <strong>{toast.title}</strong>
        {toast.message && <p>{toast.message}</p>}
      </div>
      <button
        type="button"
        className={ccx("toast-close")}
        aria-label={dismissLabel}
        onClick={() => onDismiss(toast.id)}
      >
        <X size={15} />
      </button>
    </li>
  );
}

export type ToastProviderProps = {
  children: ReactNode;
  label?: string;
  dismissLabel?: string;
};
export default function ToastProvider({
  children,
  label = "Notifications",
  dismissLabel = "Dismiss notification",
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback(
    (id: number) =>
      setToasts((current) => current.filter((toast) => toast.id !== id)),
    [],
  );
  const value = useMemo<ToastContextValue>(
    () => ({
      show: (toast) =>
        setToasts((current) => [
          ...current.slice(-2),
          { ...toast, id: (nextId.current += 1) },
        ]),
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ol
        className={ccx("toast-viewport")}
        aria-live="polite"
        aria-label={label}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onDismiss={dismiss}
            dismissLabel={dismissLabel}
          />
        ))}
      </ol>
    </ToastContext.Provider>
  );
}
