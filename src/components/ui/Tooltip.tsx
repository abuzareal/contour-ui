"use client";
import {
  useContext,
  cloneElement,
  useMemo,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { composeRefs } from "../../lib/composeRefs.js";
import { ccx } from "../../lib/classNames.js";
import { LayerVisibility } from "../../lib/layers.js";
import useDismiss from "../../hooks/useLayerDismiss.js";
import type { FloatingOptions } from "../../hooks/useFloatingPanel.js";
import FloatingPortal from "./FloatingPortal.js";
export type TooltipProps = Omit<FloatingOptions, "side"> & {
  content: string;
  /** One focusable element. Supplemental noninteractive text only. */
  children: ReactElement<{ "aria-describedby"?: string }>;
  placement?: "top" | "bottom" | "left" | "right";
};
export default function Tooltip({
  content,
  children,
  placement = "top",
  align = "center",
  sideOffset = 10,
  collisionPadding = 8,
  portal = true,
  container,
}: TooltipProps) {
  const id = useId();
  const anchor = useRef<HTMLSpanElement>(null),
    panel = useRef<HTMLSpanElement>(null);
  const [anchorElement, setAnchorElement] = useState<HTMLSpanElement | null>(
    null,
  );
  const attachAnchor = useMemo(() => composeRefs(anchor, setAnchorElement), []);
  const [hovered, setHovered] = useState(false),
    [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const parentVisible = useContext(LayerVisibility);
  const open = (hovered || focused) && !dismissed && parentVisible;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const clear = () => {
    clearTimeout(timer.current);
    timer.current = undefined;
  };
  const enter = () => {
    clear();
    setHovered(true);
    if (!focused && !hovered) setDismissed(false);
  };
  const leave = () => {
    clear();
    timer.current = setTimeout(() => {
      setHovered(false);
    }, 160);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!hovered) return;
    const doc = anchor.current?.ownerDocument;
    const move = (event: PointerEvent) => {
      const a = anchor.current?.getBoundingClientRect(),
        p = panel.current?.getBoundingClientRect();
      if (!a || !p) return;
      // Keep the pointer corridor between trigger and hint available, including slow travel.
      const inside =
        event.clientX >= Math.min(a.left, p.left) - 4 &&
        event.clientX <= Math.max(a.right, p.right) + 4 &&
        event.clientY >= Math.min(a.top, p.top) - 4 &&
        event.clientY <= Math.max(a.bottom, p.bottom) + 4;
      if (inside) clear();
      else leave();
    };
    doc?.addEventListener("pointermove", move);
    return () => doc?.removeEventListener("pointermove", move);
  }, [hovered]);
  useDismiss(anchor, open, () => setDismissed(true), {
    branches: [panel],
    layerElement: panel,
  });
  return (
    <span
      ref={attachAnchor}
      className={ccx("tooltip-anchor")}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onFocus={() => {
        setFocused(true);
        if (!hovered) setDismissed(false);
      }}
      onBlur={() => setFocused(false)}
    >
      {cloneElement(children, {
        "aria-describedby": [children.props["aria-describedby"], id]
          .filter(Boolean)
          .join(" "),
      })}
      <FloatingPortal
        anchorElement={anchorElement}
        anchor={anchor}
        panel={panel}
        open={open}
        options={{
          side: placement,
          align,
          sideOffset,
          collisionPadding,
          portal,
          container,
        }}
      >
        <span
          ref={panel}
          id={id}
          role="tooltip"
          hidden={!open}
          className={ccx(
            "tooltip mono",
            `tooltip-${placement}`,
            open && "is-open",
          )}
          onPointerEnter={enter}
          onPointerLeave={leave}
        >
          {content}
        </span>
      </FloatingPortal>
    </span>
  );
}
