import { useRef, useState } from "react";
import {
  TextField,
  TextArea,
  SelectField,
  Button,
} from "@abuzareal/contour-ui";

export default function ContactFields() {
  const emailInput = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState("feedback");
  const [submitted, setSubmitted] = useState(false);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <TextField
        ref={emailInput}
        label="Email"
        name="email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        hint="Use a working email address."
      />
      <TextArea
        label="Message"
        name="message"
        required
        autoResize
        maxLength={500}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <SelectField
        label="Topic"
        name="topic"
        value={topic}
        options={[
          { value: "feedback", label: "Feedback" },
          { value: "question", label: "Question" },
        ]}
        onChange={(event) => setTopic(event.target.value)}
      />
      <Button type="submit">Validate locally</Button>
      <Button type="button" onClick={() => emailInput.current?.focus()}>
        Focus email
      </Button>
      {submitted && (
        <p role="status">Fields validated locally. No message was sent.</p>
      )}
    </form>
  );
}
