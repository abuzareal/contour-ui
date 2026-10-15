import { useRef, useState } from "react";
import {
  Button,
  Combobox,
  Dialog,
  Popover,
  Table,
  TextField,
  ThemeScope,
} from "@abuzareal/contour-ui";
const projects = [
  { value: "atlas", label: "Atlas" },
  {
    value: "field",
    label:
      "Field notes — a long project label that remains readable on a narrow screen",
  },
  { value: "closed", label: "Closed project", disabled: true },
];
export default function SelectionExample() {
  const input = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState("");
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  return (
    <div className="demo-stack">
      <p>Local form inspection. No project or settings are saved.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setValues(
            JSON.stringify(
              Object.fromEntries(new FormData(event.currentTarget)),
            ),
          );
        }}
        onReset={() => setValues("")}
      >
        <Combobox
          ref={input}
          label="Project"
          name="project"
          options={projects}
          defaultValue="atlas"
          required
          hint="Choose an allowed project; typed text is not a selection."
        />
        <TextField label="Note after project" name="note" />
        <div className="demo-row">
          <Button type="submit">Inspect project values</Button>
          <Button type="reset" variant="secondary">
            Reset project
          </Button>
          <Button onClick={() => input.current?.focus()}>Focus project</Button>
        </div>
      </form>
      <output aria-label="Project form values">{values}</output>
      <div className="demo-row">
        <Button
          onClick={(event) => {
            event.currentTarget.focus();
            setOpen(true);
          }}
        >
          Open picker dialog
        </Button>
        <Popover trigger="Open parent layer" title="Nested layers">
          <Popover trigger="Open child layer" title="Child layer">
            <p>First Escape closes this child; second closes its parent.</p>
            <Combobox label="Nested project" options={projects} />
          </Popover>
        </Popover>
      </div>
      <Dialog
        title="Choose a local project"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Combobox
          label="Dialog project"
          options={projects}
          defaultValue="atlas"
        />
        <Button onClick={() => setOpen(false)}>Keep local selection</Button>
      </Dialog>
      <ThemeScope
        theme={theme}
        onThemeChange={setTheme}
        style={{ padding: 16 }}
      >
        <p>Independent embedded theme: {theme}.</p>
        <Button
          onClick={() =>
            setTheme((value) => (value === "light" ? "dark" : "light"))
          }
        >
          Toggle embedded theme
        </Button>
        <Combobox label="Embedded project" options={projects} />
        <Table caption="Local project identity" showCaption>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Label</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.value}>
                <th scope="row">{project.value}</th>
                <td>{project.label}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ThemeScope>
    </div>
  );
}
