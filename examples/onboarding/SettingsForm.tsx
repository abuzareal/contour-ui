import { useRef, useState } from "react";
import { Button, Checkbox, Combobox, TextField } from "@abuzareal/contour-ui";
const options = [
  { value: "atlas", label: "Atlas" },
  { value: "field", label: "Field notes" },
];
/** Local inspection only. Validate and authorize real submissions on the server. */
export default function SettingsForm() {
  const [payload, setPayload] = useState("");
  const name = useRef<HTMLInputElement>(null);
  return (
    <section aria-label="Settings example">
      <h2>Project settings</h2>
      <p>This form inspects local values; it does not save them.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setPayload(
            JSON.stringify(
              Object.fromEntries(new FormData(event.currentTarget)),
            ),
          );
        }}
        onReset={() => setPayload("")}
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
          options={options}
          defaultValue="atlas"
          required
        />
        <Checkbox label="Allow updates" name="updates" defaultChecked />
        <Button type="submit">Inspect values</Button>
        <Button type="reset" variant="secondary">
          Reset form
        </Button>
      </form>
      <output aria-label="Form values">{payload}</output>
      <Button onClick={() => name.current?.focus()}>Focus name</Button>
    </section>
  );
}
