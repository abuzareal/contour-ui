/** Round avatar showing a photo or Space Grotesk initials, with an optional presence dot. */
import { ccx } from "../../lib/classNames.js";

export type AvatarProps = {
  name: string;
  initials?: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  statusLabel?: string;
  status?: "online" | "away";
};

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function Avatar({
  name,
  initials,
  src,
  size = "md",
  status,
  statusLabel,
}: AvatarProps) {
  return (
    <span className={ccx("avatar", `avatar-${size}`)}>
      {src ? (
        <img src={src} alt={name} loading="lazy" decoding="async" />
      ) : (
        <span role="img" aria-label={name} className={ccx("avatar-initials")}>
          {initials ?? initialsOf(name)}
        </span>
      )}
      {status && (
        <span
          className={ccx("avatar-status", `avatar-status-${status}`)}
          role="img"
          aria-label={statusLabel ?? (status === "online" ? "Online" : "Away")}
        />
      )}
    </span>
  );
}
