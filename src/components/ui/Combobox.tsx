"use client";
import {
  forwardRef,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Check, ChevronDown } from "lucide-react";
import { ccx } from "../../lib/classNames.js";
import { fieldDescribedBy } from "../../lib/a11y.js";
import { composeRefs } from "../../lib/composeRefs.js";
import { LayerVisibility } from "../../lib/layers.js";
import { floatingContainer } from "../../hooks/useFloatingPanel.js";
import useControlRef from "../../hooks/useControlRef.js";
import useFormReset from "../../hooks/useFormReset.js";
import useLayerDismiss from "../../hooks/useLayerDismiss.js";
import useOpenState from "../../hooks/useOpenState.js";
import useComboboxAnchor from "../../hooks/useComboboxAnchor.js";
import FloatingScope from "./FloatingScope.js";
import Field from "./Field.js";

export type { ComboboxOption, ComboboxProps } from "./Combobox.types.js";
import type { ComboboxOption, ComboboxProps } from "./Combobox.types.js";

/** Searchable allowed-value selection. The forwarded ref targets the visible input. */
const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    label,
    options,
    filteredOptions,
    value: controlledValue,
    defaultValue = null,
    onValueChange,
    inputValue,
    defaultInputValue,
    onInputValueChange,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    id: providedId,
    name,
    form,
    required,
    disabled,
    readOnly,
    hint,
    error,
    hideLabel,
    loading = false,
    searchError,
    onRetry,
    loadingText = "Loading choices…",
    emptyText = "No matching choices.",
    retryLabel = "Retry search",
    triggerLabel = "Show choices",
    missingValueText = "Selected option is unavailable. Choose another.",
    side = "bottom",
    align = "start",
    sideOffset = 8,
    collisionPadding = 8,
    portal = true,
    container,
    inputProps,
    popupProps,
    rootProps,
  },
  forwardedRef,
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue === undefined ? internalValue : controlledValue;
  const selected = options.find((option) => option.value === value);
  const missing = value !== null && !selected;
  const [query, setQuery] = useState<string | null>(defaultInputValue ?? null);
  const [open, changeOpen] = useOpenState(
    controlledOpen,
    defaultOpen,
    onOpenChange,
  );
  const available = useContext(LayerVisibility) && !disabled && !readOnly;
  const visible = available && open;
  const { ref: input, attach } = useControlRef(forwardedRef);
  const [anchor, setAnchor] = useState<HTMLInputElement | null>(null);
  const attachInput = useMemo(
    () => composeRefs(attach, inputProps?.ref, setAnchor),
    [attach, inputProps?.ref],
  );
  const actions = useRef<BaseCombobox.Root.Actions | null>(null);
  // The custom non-modal popup has no exit animation. Complete the public close
  // lifecycle after it is hidden so controlled query text returns to the selected label.
  useLayoutEffect(() => {
    if (!visible) actions.current?.unmount();
  }, [visible]);
  const root = useRef<HTMLDivElement>(null);
  const attachRoot = useMemo(
    () => composeRefs(root, rootProps?.ref),
    [rootProps?.ref],
  );
  const positioner = useRef<HTMLDivElement>(null);
  const [, mountedPositioner] = useState<HTMLDivElement | null>(null);
  const attachPositioner = useMemo(
    () => composeRefs(positioner, mountedPositioner),
    [],
  );
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const target =
    anchor && portal ? floatingContainer(anchor, { container }) : null;
  const collection = useMemo(
    () =>
      BaseCombobox.createItems(options, {
        getValue: (option) => option.value,
        getLabel: (option) => option.label,
      }),
    [options],
  );
  const close = () => {
    changeOpen(false);
    setQuery(null);
  };
  useLayerDismiss(root, visible, close, {
    branches: [positioner, input],
    layerElement: positioner,
  });
  useFormReset(input, () => {
    if (controlledValue === undefined) setInternalValue(defaultValue);
    setQuery(null);
    changeOpen(false);
  });
  useLayoutEffect(() => {
    const element = input.current;
    element?.setCustomValidity(missing ? missingValueText : "");
    return () => element?.setCustomValidity("");
  }, [input, missing, missingValueText]);
  const fieldError = error ?? (missing ? missingValueText : undefined);
  const results = loading || searchError ? [] : filteredOptions;
  const statusId = `${id}-search-status`;
  const positioning = useComboboxAnchor(anchor, positioner);
  const popup = (
    <FloatingScope
      anchor={anchor}
      open={visible}
      target={target}
      onDirectionChange={setDirection}
    >
      <BaseCombobox.Positioner
        {...positioning}
        ref={attachPositioner}
        className={ccx("combobox-positioner")}
        positionMethod="fixed"
        side={side}
        align={align}
        sideOffset={Number.isFinite(sideOffset) ? sideOffset : 8}
        collisionPadding={
          Number.isFinite(collisionPadding) ? Math.max(0, collisionPadding) : 8
        }
      >
        {/* Keep the labelled list non-modal; the enclosing Dialog owns any focus containment. */}
        <div
          role="region"
          aria-labelledby={`${id}-label`}
          {...popupProps}
          className={ccx("combobox-popup", popupProps?.className)}
          hidden={!visible}
        >
          <BaseCombobox.Empty className={ccx("combobox-status")}>
            {loading ? loadingText : (searchError ?? emptyText)}
          </BaseCombobox.Empty>
          {searchError && onRetry && (
            <button
              type="button"
              className={ccx("combobox-retry")}
              onClick={onRetry}
            >
              {retryLabel}
            </button>
          )}
          <BaseCombobox.List
            className={ccx("combobox-list")}
            aria-labelledby={`${id}-label`}
          >
            {(option: ComboboxOption) => (
              <BaseCombobox.Item
                className={ccx("combobox-option")}
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                <span>{option.label}</span>
                <BaseCombobox.ItemIndicator>
                  <Check size={14} aria-hidden="true" />
                </BaseCombobox.ItemIndicator>
              </BaseCombobox.Item>
            )}
          </BaseCombobox.List>
        </div>
      </BaseCombobox.Positioner>
    </FloatingScope>
  );

  return (
    <DirectionProvider direction={direction}>
      <div
        {...rootProps}
        ref={attachRoot}
        className={ccx("combobox", rootProps?.className)}
      >
        <BaseCombobox.Root
          actionsRef={actions}
          items={collection}
          filteredItems={results}
          value={missing ? null : value}
          onValueChange={(next) => {
            if (controlledValue === undefined) setInternalValue(next);
            setQuery(null);
            onValueChange?.(next);
          }}
          inputValue={inputValue ?? query ?? selected?.label ?? ""}
          onInputValueChange={(next, details) => {
            setQuery(
              details.reason === "input-change" ||
                details.reason === "input-clear"
                ? next
                : null,
            );
            onInputValueChange?.(next);
          }}
          open={visible}
          onOpenChange={(next, details) => {
            // Keep native observers informed; a prevented Escape must not dismiss the host layer.
            details.allowPropagation();
            if (
              (next && !available) ||
              (details.reason === "escape-key" &&
                details.event.defaultPrevented)
            ) {
              details.cancel();
              return;
            }
            if (!next) {
              details.preventUnmountOnClose();
              setQuery(null);
            }
            changeOpen(next);
          }}
          name={name}
          form={form}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
        >
          <Field
            id={id}
            label={label}
            hint={hint}
            error={fieldError}
            required={required}
            disabled={disabled}
            hideLabel={hideLabel}
          >
            <BaseCombobox.InputGroup
              className={ccx("field-control combobox-control")}
            >
              <BaseCombobox.Input
                {...inputProps}
                onMouseDown={(event) => {
                  inputProps?.onMouseDown?.(event);
                  // Own activation on click; leave native focus/caret behavior intact and avoid stale touch timers.
                  event.preventBaseUIHandler();
                }}
                onClick={(event) => {
                  inputProps?.onClick?.(event);
                  if (!event.defaultPrevented && available) changeOpen(true);
                }}
                onKeyDown={(event) => {
                  inputProps?.onKeyDown?.(event);
                  // Contour preserves a closed selection and lets the enclosing layer own Escape.
                  // Cancelling only Base UI's handler leaves the native document event intact.
                  if (
                    event.defaultPrevented ||
                    (event.key === "Escape" && !visible)
                  )
                    event.preventBaseUIHandler();
                  else if (event.key === "Tab" && visible) {
                    // Close even when native traversal leaves the document (for example Safari's last field).
                    // Do not preventDefault: the browser still owns the next keyboard target.
                    event.preventBaseUIHandler();
                    close();
                  }
                }}
                ref={attachInput}
                id={id}
                form={form}
                aria-labelledby={[
                  `${id}-label`,
                  inputProps?.["aria-labelledby"],
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-invalid={fieldError ? true : inputProps?.["aria-invalid"]}
                aria-busy={loading || undefined}
                aria-describedby={[
                  inputProps?.["aria-describedby"],
                  fieldDescribedBy(id, hint, fieldError),
                  statusId,
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
              <BaseCombobox.Trigger
                disabled={disabled || readOnly}
                className={ccx("combobox-trigger")}
                aria-label={triggerLabel}
              >
                <ChevronDown size={16} aria-hidden="true" />
              </BaseCombobox.Trigger>
            </BaseCombobox.InputGroup>
          </Field>
          <span id={statusId} role="status" className={ccx("visually-hidden")}>
            {loading ? loadingText : (searchError ?? "")}
          </span>
          {/* Base UI needs portal context even when the DOM stays inside this wrapper. */}
          <BaseCombobox.Portal
            container={portal ? (target ?? undefined) : root}
          >
            {popup}
          </BaseCombobox.Portal>
        </BaseCombobox.Root>
      </div>
    </DirectionProvider>
  );
});
export default Combobox;
