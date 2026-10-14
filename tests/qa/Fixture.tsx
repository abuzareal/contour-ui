import UpstreamFixture from "./UpstreamFixture.js";
import JavaScriptSettings from "../../examples/onboarding/SettingsForm.jsx";
import TypeScriptSettings from "../../examples/onboarding/SettingsForm.js";
import { useRef, useState } from "react";
import {
  Button,
  Checkbox,
  Combobox,
  Dialog,
  Popover,
  Switch,
  TextField,
  ThemeScope,
} from "@abuzareal/contour-ui";
const options = [
  { value: "atlas", label: "Atlas" },
  { value: "closed", label: "Closed project", disabled: true },
  {
    value: "cafe",
    label:
      "Café — a long translated project label that wraps without hiding its meaning",
  },
];
export default function Fixture() {
  const [modal, setModal] = useState(false),
    [payload, setPayload] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const review = useRef<HTMLInputElement>(null);
  const params = new URLSearchParams(location.search);
  const theme = params.get("theme") === "dark" ? "dark" : "light";
  if (params.get("upstream")) return <UpstreamFixture />;
  if (params.get("example"))
    return (
      <main className="contour-root qa-page">
        <h1>Onboarding example</h1>
        {params.get("example") === "jsx" ? (
          <JavaScriptSettings />
        ) : (
          <TypeScriptSettings />
        )}
      </main>
    );
  return (
    <ThemeScope theme={theme} dir={params.get("rtl") === "1" ? "rtl" : "ltr"}>
      <main className="qa-page" data-motion="off">
        <h1>Contour accessibility fixture</h1>
        <p>Local synthetic data; nothing is saved or sent.</p>
        <section className="qa-surface" aria-label="Controls">
          <h2>Project settings</h2>
          <Button onClick={() => input.current?.focus()}>Focus name</Button>
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
              ref={input}
              label="Name"
              name="name"
              defaultValue="Ada"
              required
              hint="Use the name shown to collaborators."
            />
            <Checkbox label="Allow updates" name="updates" defaultChecked />
            <Switch label="Notifications" name="notifications" defaultChecked />
            <Combobox
              label="Project"
              name="project"
              defaultValue="atlas"
              options={options}
              required
            />
            <TextField label="After project" />
            <div className="qa-actions">
              <Button type="submit">Inspect values</Button>
              <Button type="reset" variant="secondary">
                Reset values
              </Button>
            </div>
          </form>
          <output aria-label="Submitted values">{payload}</output>
        </section>
        <div className="qa-actions">
          <Button
            onClick={(event) => {
              event.currentTarget.focus();
              setModal(true);
            }}
          >
            Open settings dialog
          </Button>
          <Popover trigger="Open help" title="Project help">
            <p>Choose a project you can access.</p>
            <Button>Help action</Button>
          </Popover>
        </div>
        <Dialog
          initialFocus={review}
          title="Confirm settings"
          description="This fixture does not save data."
          open={modal}
          onClose={() => setModal(false)}
        >
          <TextField ref={review} label="Review note" />
          <Button onClick={() => setModal(false)}>Keep settings</Button>
        </Dialog>
        <p>
          <a href="#details">Read integration details</a>
        </p>
        <section id="details">
          <h2>Integration details</h2>
          <p>
            Native controls keep form and keyboard behavior. Use the public
            package declarations.
          </p>
        </section>
      </main>
    </ThemeScope>
  );
}
