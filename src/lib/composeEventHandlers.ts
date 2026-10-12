/** Caller vetoes an internal action without replacing required state/ARIA wiring. */
export function composeEventHandlers<
  Event extends { defaultPrevented: boolean },
>(
  caller: ((event: Event) => void) | undefined,
  internal: (event: Event) => void,
) {
  return (event: Event) => {
    caller?.(event);
    if (!event.defaultPrevented) internal(event);
  };
}
