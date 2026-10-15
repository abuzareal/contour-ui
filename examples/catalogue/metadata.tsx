import { useState } from "react";
import { Badge, Tag, Avatar, Stat, Kbd } from "@abuzareal/contour-ui";

export default function Metadata() {
  const [showTag, setShowTag] = useState(true);
  return (
    <>
      <Badge tone="info">Example status</Badge>
      {showTag && <Tag onRemove={() => setShowTag(false)}>React</Tag>}
      <Avatar name="Alex Chen" />
      <Stat value={12} label="Example records" />
      <p>
        Use <Kbd>Tab</Kbd> to move between controls.
      </p>
    </>
  );
}
