import { useState } from "react";
import { Button, Dialog } from "@abuzareal/contour-ui";

export default function DetailsDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open details</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Project details"
        description="A local example."
        footer={<Button onClick={() => setOpen(false)}>Close</Button>}
      >
        <p>Your application's details go here.</p>
      </Dialog>
    </>
  );
}
