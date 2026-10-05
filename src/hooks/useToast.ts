/** Toast context: lets any component queue a notification rendered by ToastProvider. */
import { createContext, useContext } from "react";
import type { AlertTone } from "../components/ui/Alert.js";

export type ToastInput = {
  title: string;
  message?: string;
  tone?: AlertTone;
};

export type ToastContextValue = {
  show: (toast: ToastInput) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export default function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
