import { useRef, useState } from "react";
import {
  Button,
  Combobox,
  Dialog,
  Popover,
  Table,
  ThemeScope,
} from "@abuzareal/contour-ui";
const choices = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Bravo", disabled: true },
  { value: "c", label: "Café" },
  { value: "j", label: "日本語" },
  {
    value: "long",
    label:
      "A very long translated option whose text must wrap without clipping at narrow widths or high zoom",
  },
];
export default function Expansion() {
  const startingOpen = new URLSearchParams(window.location.search).has(
    "defaultOpen",
  );
  const [value, setValue] = useState<string | null>("a"),
    [changed, setChanged] = useState(false),
    [missing, setMissing] = useState(false),
    [modal, setModal] = useState(startingOpen),
    [status, setStatus] = useState("ready"),
    [disabled, setDisabled] = useState(false),
    [theme, setTheme] = useState<"light" | "dark">("light"),
    [dir, setDir] = useState<"ltr" | "rtl">("ltr");
  const input = useRef<HTMLInputElement>(null);
  const options = missing
    ? choices.filter((o) => o.value !== "a")
    : changed
      ? choices
          .map((o) => (o.value === "a" ? { ...o, label: "Alphabétique" } : o))
          .reverse()
      : choices;
  return (
    <ThemeScope theme={theme} onThemeChange={setTheme} dir={dir}>
      <main style={{ padding: 16, maxWidth: 500, display: "grid", gap: 20 }}>
        <h1>Expansion contracts</h1>
        <Button>Before fields</Button>
        <form id="native" onSubmit={(e) => e.preventDefault()}>
          <Combobox
            ref={input}
            name="choice"
            label="Choice"
            options={options}
            defaultValue="a"
            required
            inputProps={{ "data-input": "native" }}
          />
          <Button type="reset">Reset native</Button>
        </form>
        <form id="controlled" onSubmit={(e) => e.preventDefault()}>
          <Combobox
            label="Controlled"
            name="controlled"
            options={options}
            value={value}
            onValueChange={setValue}
          />
          <Button type="reset">Reset controlled</Button>
        </form>
        <Combobox
          label="External"
          name="external"
          form="native"
          options={choices}
          defaultValue="c"
          disabled={disabled}
        />
        <Combobox
          label="Required"
          name="required"
          form="validation"
          options={choices}
          required
        />
        <form id="validation" onSubmit={(e) => e.preventDefault()}>
          <Button type="submit">Validate</Button>
        </form>
        <Button onClick={() => input.current?.focus()}>Focus input</Button>
        <Button onClick={() => setChanged(true)}>Translate options</Button>
        <Button onClick={() => setMissing(true)}>Remove Alpha</Button>
        <Button onClick={() => setDisabled(!disabled)}>Disable external</Button>
        <Button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          Theme
        </Button>
        <Button onClick={() => setDir(dir === "ltr" ? "rtl" : "ltr")}>
          Direction
        </Button>
        <Combobox
          label="Search state"
          options={choices}
          loading={status === "loading"}
          searchError={status === "error" ? "Search failed" : undefined}
          onRetry={() => setStatus("ready")}
          filteredOptions={status === "empty" ? [] : undefined}
        />
        <Button onClick={() => setStatus("loading")}>Load</Button>
        <Button onClick={() => setStatus("error")}>Fail</Button>
        <Button onClick={() => setStatus("empty")}>Empty</Button>
        <Button onClick={() => setModal(true)}>Open modal</Button>
        <Dialog title="Modal" open={modal} onClose={() => setModal(false)}>
          <Combobox
            label="Modal choice"
            options={choices}
            defaultOpen={startingOpen}
          />
          <Button>Modal after</Button>
          <Popover title="Child" trigger="Open child">
            <Combobox label="Nested choice" options={choices} />
            <Button>Child after</Button>
          </Popover>
        </Dialog>
        <Popover title="Parent" trigger="Open parent">
          <Combobox label="Popover choice" options={choices} />
          <Button>Parent after</Button>
        </Popover>
        <Table caption="Semantic records" showCaption data-test="semantic">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Ada</th>
              <td>
                <Button>Inspect Ada</Button>
              </td>
            </tr>
          </tbody>
        </Table>
        <form id="disabled-owner">
          <fieldset disabled>
            <Combobox
              label="Fieldset choice"
              name="disabledChoice"
              options={choices}
              defaultValue="c"
            />
          </fieldset>
        </form>
        <Combobox
          label="Inline choice"
          options={choices}
          portal={false}
          rootProps={{ id: "inline-combo" }}
        />
        <div
          className="test-edge-clip"
          style={{ overflow: "hidden", height: 64, transform: "translateZ(0)" }}
        >
          <Combobox label="Edge choice" options={choices} />
        </div>
        <Combobox
          label="Veto choice"
          options={choices}
          inputProps={{
            "data-veto": "true",
            onKeyDown: (event) => {
              if (
                event.key === "Escape" &&
                event.currentTarget.dataset.veto === "true"
              )
                event.preventDefault();
            },
          }}
        />
        <Button>Outside</Button>
      </main>
    </ThemeScope>
  );
}
