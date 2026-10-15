import { useState } from "react";
import { Alert, ProgressBar, Spinner, Skeleton } from "@abuzareal/contour-ui";

export default function Feedback() {
  const [visible, setVisible] = useState(true);
  return (
    <>
      {visible && (
        <Alert
          title="Example warning"
          tone="warning"
          onDismiss={() => setVisible(false)}
        >
          This is a local demonstration.
        </Alert>
      )}
      <div aria-busy="true">
        <Spinner label="Loading example" />
        <ProgressBar label="Example upload" value={35} />
        <Skeleton width="12rem" height="1rem" />
      </div>
    </>
  );
}
