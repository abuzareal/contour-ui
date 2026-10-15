import { useState } from "react";
import { Button, SceneBoundary } from "@abuzareal/contour-ui";

function DemonstrationChild({ fail }: { fail: boolean }) {
  if (fail) throw Error("Intentional local SceneBoundary demonstration");
  return (
    <p>The optional child rendered. No WebGL dependency is loaded here.</p>
  );
}

export default function BoundaryExample() {
  const [fail, setFail] = useState(false);
  const [attempt, setAttempt] = useState(0);
  return (
    <section aria-label="Scene boundary example">
      <p>
        A static fallback stays outside the boundary. A caught render failure
        hides only its child. The expected demonstration error may be logged by
        React; it does not represent a renderer or service failure.
      </p>
      <SceneBoundary key={attempt}>
        <DemonstrationChild fail={fail} />
      </SceneBoundary>
      <Button onClick={() => setFail(true)}>
        Simulate child render failure
      </Button>
      <Button
        onClick={() => {
          setFail(false);
          setAttempt((value) => value + 1);
        }}
      >
        Remount demonstration
      </Button>
    </section>
  );
}
