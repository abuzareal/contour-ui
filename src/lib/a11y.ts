/** Accessibility id helpers shared by form controls. */

/** aria-describedby value pointing at the message Field renders (error wins over hint). */
export const fieldDescribedBy = (id: string, hint?: string, error?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;
