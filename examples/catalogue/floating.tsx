import { useState } from "react";
import { DropdownMenu, Popover, Tooltip, Button } from "@abuzareal/contour-ui";

export default function FloatingContent() {
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <DropdownMenu
        label="Example actions"
        open={menuOpen}
        onOpenChange={setMenuOpen}
        items={[
          {
            id: "select",
            label: "Select example",
            onSelect: () => setMessage("Example selected locally."),
          },
          {
            id: "unavailable",
            label: "Unavailable example",
            disabled: true,
            onSelect: () => setMessage("Unavailable action."),
          },
          {
            id: "details",
            label: "View details",
            onSelect: () => setMessage("Details selected locally."),
          },
        ]}
      />
      <Popover trigger="About this example" title="Details">
        <p>No network action occurs.</p>
      </Popover>
      <Tooltip content="Displays a local message">
        <Button onClick={() => setMessage("Hello")}>Say hello</Button>
      </Tooltip>
      <p role="status">{message}</p>
    </>
  );
}
