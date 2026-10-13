import { ccx } from "../../lib/classNames.js";
/** Hairline separator, optionally with a centred mono label. */
export type DividerProps = {
  label?: string;
};

export default function Divider({ label }: DividerProps) {
  if (!label) return <hr className={ccx("divider")} />;
  return (
    <div className={ccx("divider divider-labelled mono")} role="separator">
      <span>{label}</span>
    </div>
  );
}
