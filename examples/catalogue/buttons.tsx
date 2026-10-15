import { useState } from "react";
import {
  Button,
  IconButton,
  ExternalLink,
  DepthButton,
} from "@abuzareal/contour-ui";

export default function Actions() {
  const [count, setCount] = useState(0);
  return (
    <>
      <Button onClick={() => setCount((value) => value + 1)}>
        Count {count}
      </Button>
      <IconButton label="Reset count" onClick={() => setCount(0)}>
        <span aria-hidden="true">↺</span>
      </IconButton>
      <ExternalLink href="https://www.npmjs.com/package/@abuzareal/contour-ui">
        Package on npm
      </ExternalLink>
      <DepthButton onClick={() => setCount((value) => value + 1)}>
        Add one
      </DepthButton>
    </>
  );
}
