import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, Combobox, Dialog, Popover } from "@abuzareal/contour-ui";
import "@abuzareal/contour-ui/scoped.css";
import "./style.css";
const options = [
  { value: "one", label: "One" },
  { value: "two", label: "Two", disabled: true },
];
function Reproduction() {
  const [open, setOpen] = useState(false);
  return (
    <main className="contour-root starter">
      <h1>Contour reproduction</h1>
      <p>
        Contour 0.6.0, React/React DOM 18.3.1. Replace only the smallest
        relevant case. No real user data.
      </p>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Reproduction">
        <Popover trigger="Open popover" title="Nested layer">
          <form onSubmit={(event) => event.preventDefault()}>
            <Combobox label="Choice" name="choice" options={options} required />
            <Button type="reset">Reset</Button>
          </form>
        </Popover>
      </Dialog>
    </main>
  );
}
const element = document.getElementById("root");
if (!element) throw new Error("Missing root");
createRoot(element).render(<Reproduction />);
