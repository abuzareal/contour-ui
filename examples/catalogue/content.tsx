import { useState } from "react";
import {
  Card,
  Disclosure,
  Divider,
  Timeline,
  EmptyState,
  Button,
} from "@abuzareal/contour-ui";

export default function Content() {
  const [situation, setSituation] = useState<
    "empty" | "filtered" | "error" | "created"
  >("empty");
  const [status, setStatus] = useState("");
  const recovery = () => {
    setSituation(situation === "empty" ? "created" : "empty");
    setStatus(
      situation === "error"
        ? "Local retry completed with no saved projects. No service was contacted."
        : situation === "filtered"
          ? "Local filter cleared."
          : "One local example project added. Nothing was saved.",
    );
  };
  return (
    <>
      <Card
        title="Project notes"
        eyebrow="Example"
        footer={<a href="/docs/getting-started">Read setup</a>}
      >
        <p>Keep the action separate from the card container.</p>
      </Card>
      <Disclosure className="project-notes" summary="Technical details">
        <p>Your application's notes go here.</p>
      </Disclosure>
      <Divider label="History" />
      <Timeline
        entries={[
          {
            date: "Draft",
            title: "Example milestone",
            body: "Illustrative content.",
          },
        ]}
      />
      <section aria-label="Empty-state situations">
        <p>Choose an illustrative local outcome. No request is sent.</p>
        <Button
          onClick={() => {
            setSituation("empty");
            setStatus("");
          }}
        >
          Show no saved data
        </Button>
        <Button
          onClick={() => {
            setSituation("filtered");
            setStatus("");
          }}
        >
          Show no matches
        </Button>
        <Button
          onClick={() => {
            setSituation("error");
            setStatus("");
          }}
        >
          Simulate service failure
        </Button>
        {situation === "created" ? (
          <p>Local example project.</p>
        ) : (
          <EmptyState
            icon={<span aria-hidden="true">○</span>}
            title={
              situation === "error"
                ? "Projects unavailable"
                : situation === "filtered"
                  ? "No matching projects"
                  : "No saved projects"
            }
            message={
              situation === "error"
                ? "The illustrative request failed. This is not an empty successful result."
                : situation === "filtered"
                  ? "Try clearing your filters."
                  : "Add a local example to see it here."
            }
            action={
              <Button onClick={recovery}>
                {situation === "error"
                  ? "Retry local example"
                  : situation === "filtered"
                    ? "Clear local filters"
                    : "Add a local project"}
              </Button>
            }
          />
        )}
        <p role="status">{status}</p>
      </section>
    </>
  );
}
