import {
  Button,
  ThemeToggle,
  useMotionPreference,
  useClipboardCopy,
} from "@abuzareal/contour-ui";

export default function PreferencesAndCopy({
  animate = true,
  command = "npm install @abuzareal/contour-ui@0.6.4 --save-exact",
}: {
  animate?: boolean;
  command?: string;
}) {
  const reducedMotion = useMotionPreference();
  const { status, copy } = useClipboardCopy(command);
  return (
    <>
      <ThemeToggle animate={animate && !reducedMotion} />
      <Button loading={status === "copying"} onClick={() => void copy()}>
        Copy install command
      </Button>
      <p role="status">
        {status === "copied"
          ? "Copied."
          : status === "error"
            ? "Copy failed. Select the command manually."
            : ""}
      </p>
    </>
  );
}
