import { useState } from "react";
import {
  Checkbox,
  RadioGroup,
  Switch,
  Slider,
  SegmentedControl,
} from "@abuzareal/contour-ui";

type View = "overview" | "details";
const options: { value: View; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "details", label: "Details" },
];
export default function Preferences() {
  const [view, setView] = useState<View>("overview");
  const [checked, setChecked] = useState(false);
  const [volume, setVolume] = useState(40);
  return (
    <>
      <p>
        Local selection only; this does not configure a global density mode.
      </p>
      <Checkbox
        label="Include archived items"
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
      />
      <RadioGroup
        legend="Example view"
        options={options}
        value={view}
        onChange={setView}
      />
      <SegmentedControl
        label="Preview view"
        options={options}
        value={view}
        onChange={setView}
      />
      <Switch label="Example setting" checked={checked} onChange={setChecked} />
      <Slider
        label="Example volume"
        value={volume}
        onChange={setVolume}
        min={0}
        max={100}
      />
    </>
  );
}
