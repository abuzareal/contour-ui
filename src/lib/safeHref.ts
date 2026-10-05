/** Allows ordinary web/contact destinations and relative links, rejecting executable URLs. */
export function safeHref(href: string | undefined): string | undefined {
  if (href === undefined) return undefined;
  try {
    const url = new URL(href, "https://contour.invalid/");
    return ["https:", "http:", "mailto:", "tel:"].includes(url.protocol)
      ? href
      : undefined;
  } catch {
    return undefined;
  }
}
