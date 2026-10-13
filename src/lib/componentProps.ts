import type { ComponentPropsWithRef, JSX } from "react";

/** Props customize existing owned DOM parts; children and raw markup stay component-owned. */
export type NativePartProps<Tag extends keyof JSX.IntrinsicElements> = Omit<
  ComponentPropsWithRef<Tag>,
  "children" | "dangerouslySetInnerHTML"
> & { [name: `data-${string}`]: string | number | boolean | undefined };
