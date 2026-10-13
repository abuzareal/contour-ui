import type { ReactElement, ReactNode } from "react";
import type { NativePartProps } from "../../lib/componentProps.js";
type Props = NativePartProps<"button"> & { children: ReactNode };
/** One owned native-button contract shared by default and consumer-rendered triggers. */
export default function OverlayTrigger({
  renderer,
  props,
}: {
  renderer?: (props: Props) => ReactElement;
  props: Props;
}) {
  return renderer ? renderer(props) : <button {...props} />;
}
