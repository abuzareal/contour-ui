"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  Button,
  Combobox,
  Dialog,
  TextField,
  ThemeToggle,
  buttonClassName,
} from "@abuzareal/contour-ui";
const projects = [
  { value: "atlas", label: "Atlas" },
  { value: "field", label: "Field notes" },
];
export default function Demo() {
  const [open, setOpen] = useState(false),
    [payload, setPayload] = useState("");
  const name = useRef<HTMLInputElement>(null);
  return (
    <>
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
      <Link href="/next-page" className={buttonClassName("secondary")}>
        Next page
      </Link>
    </>
  );
}
