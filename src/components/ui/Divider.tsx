/** Hairline separator, optionally with a centred mono label. */
export type DividerProps = {
  label?: string;
};

export default function Divider({ label }: DividerProps) {
  if (!label) return <hr className="divider" />;
  return (
    <div className="divider divider-labelled mono" role="separator">
      <span>{label}</span>
    </div>
  );
}
