import { useId } from "react";
import { Field, fieldDescribedBy } from "@abuzareal/contour-ui";

export default function DateField() {
  const id = useId();
  const hint = "Choose a delivery date.";
  return (
    <Field id={id} label="Delivery date" hint={hint} required>
      <input
        id={id}
        type="date"
        name="delivery"
        required
        aria-describedby={fieldDescribedBy(id, hint)}
      />
    </Field>
  );
}
