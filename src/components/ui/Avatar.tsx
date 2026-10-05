/** Round avatar showing a photo or Space Grotesk initials, with an optional presence dot. */
import { cx } from "../../lib/classNames.js";

export type AvatarProps = {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
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
  src,
  size = "md",
  status,
}: AvatarProps) {
  return (
    <span className={cx("avatar", `avatar-${size}`)}>
      {src ? (
        <img src={src} alt={name} loading="lazy" decoding="async" />
      ) : (
        <span role="img" aria-label={name} className="avatar-initials">
          {initialsOf(name)}
        </span>
      )}
      {status && (
        <span
          className={cx("avatar-status", `avatar-status-${status}`)}
          role="img"
          aria-label={status === "online" ? "Online" : "Away"}
        />
      )}
    </span>
  );
}
