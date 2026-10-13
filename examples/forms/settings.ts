/** Copy these application contracts with the recipe; adapt them to your real service. */
export type Settings = {
  email: string;
  updates: boolean;
  level: number;
  contact: "email" | "phone";
};
export type FieldErrors = Partial<Record<keyof Settings, string>>;
export type SaveResult =
  { ok: true } | { ok: false; message: string; fields?: FieldErrors };
export type SaveSettings = (
  settings: Settings,
  signal: AbortSignal,
) => Promise<SaveResult>;
export const defaultSettings: Settings = {
  email: "",
  updates: true,
  level: 20,
  contact: "email",
};

export function readSettings(data: FormData): {
  value?: Settings;
  errors: FieldErrors;
} {
  const email = data.get("email"),
    level = data.get("level"),
    contact = data.get("contact");
  const errors: FieldErrors = {};
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  )
    errors.email = "Enter a valid email address.";
  const numeric =
    typeof level === "string" && level.trim() !== "" ? Number(level) : NaN;
  if (
    !Number.isFinite(numeric) ||
    numeric < 0 ||
    numeric > 100 ||
    numeric % 5 !== 0
  )
    errors.level = "Choose a level from 0 to 100 in steps of five.";
  if (contact !== "email" && contact !== "phone")
    errors.contact = "Choose a contact method.";
  if (
    Object.keys(errors).length ||
    typeof email !== "string" ||
    (contact !== "email" && contact !== "phone")
  )
    return { errors };
  return {
    errors,
    value: {
      email: email.trim(),
      updates: data.get("updates") === "on",
      level: numeric,
      contact,
    },
  };
}
