import { useRef, useState } from "react";
import {
  Button,
  TextField,
  ThemeScope,
  ToastProvider,
  useClipboardCopy,
  useDismiss,
  useIdleTrigger,
  useMotionPreference,
  useTheme,
  useToast,
  type Theme,
} from "@abuzareal/contour-ui";
export function ClipboardExample() {
  const { copy, status } = useClipboardCopy(
    "Public synthetic project reference",
  );
  return (
    <section aria-label="Clipboard example">
      <Button onClick={() => void copy()}>Copy reference</Button>
      <p role="status">
        {status === "error"
          ? "Copy failed. You can try again."
          : status === "copied"
            ? "Copied."
            : status === "copying"
              ? "Copying…"
              : "Ready to copy."}
      </p>
    </section>
  );
}
export function MotionExample() {
  const reduced = useMotionPreference();
  const [paused, setPaused] = useState(false);
  return (
    <section aria-label="Motion preference">
      <Button
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
      >
        Pause optional motion
      </Button>
      <p>Optional animation is {!reduced && !paused ? "allowed" : "paused"}.</p>
      <p>
        This example owns no animation loop; a scene must consume this combined
        policy.
      </p>
    </section>
  );
}
export function DismissExample() {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  useDismiss(
    panel,
    open,
    (reason) => {
      setOpen(false);
      if (reason === "escape") trigger.current?.focus();
    },
    { branches: [trigger] },
  );
  return (
    <section aria-label="Custom nonmodal dismissal">
      <Button
        ref={trigger}
        aria-expanded={open}
        aria-controls="example-help"
        onClick={() => setOpen((value) => !value)}
      >
        Toggle custom help
      </Button>
      {open && (
        <div
          id="example-help"
          ref={panel}
          role="region"
          aria-label="Custom help"
        >
          <p>This nonmodal example does not trap or move focus.</p>
          <TextField label="Local note" />
        </div>
      )}
    </section>
  );
}
export function IdleExample() {
  const [enabled, setEnabled] = useState(false);
  const ready = useIdleTrigger(enabled);
  return (
    <section aria-label="Idle signal">
      <Button onClick={() => setEnabled(true)}>Request idle signal</Button>
      <p role="status">
        {ready
          ? "Idle signal received; no work was loaded."
          : enabled
            ? "Waiting for idle signal…"
            : "Not requested."}
      </p>
    </section>
  );
}
function ThemeAction() {
  const { theme, toggle } = useTheme(false);
  return (
    <Button
      aria-pressed={theme === "dark"}
      onClick={(event) => toggle(event.currentTarget)}
    >
      Dark embedded theme
    </Button>
  );
}
export function ScopedThemeExample() {
  const [theme, setTheme] = useState<Theme>("light");
  return (
    <ThemeScope theme={theme} onThemeChange={setTheme}>
      <ThemeAction />
    </ThemeScope>
  );
}
function ToastAction() {
  const toast = useToast();
  return (
    <Button
      onClick={() =>
        toast.show({
          title: "Notification example",
          message: "This local example sends and saves nothing.",
        })
      }
    >
      Show example notification
    </Button>
  );
}
export function ToastExample() {
  return (
    <ToastProvider>
      <ToastAction />
    </ToastProvider>
  );
}
