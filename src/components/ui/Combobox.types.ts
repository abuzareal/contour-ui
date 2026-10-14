import type { NativePartProps } from "../../lib/componentProps.js";
import type { FloatingOptions } from "../../hooks/useFloatingPanel.js";

export type ComboboxOption = {
  /** Unique, nonempty form value. Labels are presentation, never identity. */
  value: string;
  label: string;
  disabled?: boolean;
};
type InputPart = Omit<
  NativePartProps<"input">,
  | "value"
  | "defaultValue"
  | "name"
  | "form"
  | "id"
  | "disabled"
  | "required"
  | "readOnly"
  | "type"
>;
export type ComboboxProps = FloatingOptions & {
  label: string;
  options: readonly ComboboxOption[];
  /** Application-filtered results. Retain the selected option in options for async searches. */
  filteredOptions?: readonly ComboboxOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (query: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  name?: string;
  form?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  hint?: string;
  error?: string;
  hideLabel?: boolean;
  loading?: boolean;
  /** Search/service failure, distinct from field validation. Results are hidden until retry succeeds. */
  searchError?: string;
  onRetry?: () => void;
  loadingText?: string;
  emptyText?: string;
  retryLabel?: string;
  triggerLabel?: string;
  missingValueText?: string;
  inputProps?: InputPart;
  popupProps?: NativePartProps<"div">;
  rootProps?: NativePartProps<"div">;
};
