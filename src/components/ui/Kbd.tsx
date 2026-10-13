import { ccx } from "../../lib/classNames.js";
/** Keyboard key cap for shortcuts and instructions. */
import type { ReactNode } from "react";

export default function Kbd({ children }: { children: ReactNode }) {
  return <kbd className={ccx("kbd")}>{children}</kbd>;
}
