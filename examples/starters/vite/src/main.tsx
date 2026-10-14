import { StrictMode, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  Combobox,
  Dialog,
  TextField,
  ThemeToggle,
  buttonClassName,
} from "@abuzareal/contour-ui";
import "@abuzareal/contour-ui/scoped.css";
import "./style.css";
const projects = [
  { value: "atlas", label: "Atlas" },
  { value: "field", label: "Field notes" },
];
function App() {
  const [open, setOpen] = useState(false),
    [payload, setPayload] = useState("");
  const name = useRef<HTMLInputElement>(null);
  return (
    <main className="contour-root starter">
      <h1>Contour starter</h1>
      <p>This form inspects local values. It does not save data.</p>
      <ThemeToggle animate={false} />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setPayload(
            JSON.stringify(
              Object.fromEntries(new FormData(event.currentTarget)),
            ),
          );
        }}
      >
        <TextField
          ref={name}
          label="Name"
          name="name"
          defaultValue="Ada"
          required
        />
        <Combobox
          label="Project"
          name="project"
          options={projects}
          defaultValue="atlas"
          required
        />
        <Button type="submit">Inspect values</Button>
        <Button type="reset" variant="secondary">
          Reset form
        </Button>
      </form>
      <output aria-label="Form values">{payload}</output>
      <Button onClick={() => name.current?.focus()}>Focus name</Button>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Starter dialog">
        <p>Try Tab, Escape and focus return.</p>
        <Button onClick={() => setOpen(false)}>Done</Button>
      </Dialog>
      <a className={buttonClassName("secondary")} href="#integration">
        Integration notes
      </a>
      <section id="integration">
        <h2>Application ownership</h2>
        <p>
          Add your own router, validation and persistence. No provider is
          required by the controls above.
        </p>
      </section>
    </main>
  );
}
const root = document.getElementById("root");
if (!root) throw new Error("Missing root element");
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
