import { useState } from "react";
import {
  Reveal,
  Magnetic,
  CountUp,
  Marquee,
  ScrollProgress,
  TiltCard,
  FlipCard,
  Button,
} from "@abuzareal/contour-ui";

export default function MotionExamples() {
  const [paused, setPaused] = useState(false);
  return (
    <div data-motion={paused ? "off" : undefined}>
      <Button
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
      >
        Pause examples
      </Button>
      <ScrollProgress />
      <Reveal>
        <p>Content entering view.</p>
      </Reveal>
      <Magnetic>
        <Button>Pointer example</Button>
      </Magnetic>
      <p>
        Example records: <CountUp to={12} />
      </p>
      <Marquee
        label="Example technologies"
        items={["React", "TypeScript", "CSS"]}
      />
      <TiltCard>
        <p>CSS depth example.</p>
      </TiltCard>
      <FlipCard
        label="Show other side"
        front={<p>Front</p>}
        back={<p>Back</p>}
      />
    </div>
  );
}
