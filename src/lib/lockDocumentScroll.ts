/** Reference-counted per document so nested dialogs cannot unlock each other. */
const locks = new WeakMap<Document, { count: number; restore: () => void }>();

export function lockDocumentScroll(document: Document): () => void {
  let lock = locks.get(document);
  if (!lock) {
    const root = document.documentElement;
    const properties = ["overflow", "overscroll-behavior", "scrollbar-gutter"];
    const previous = properties.map((name) => ({
      name,
      value: root.style.getPropertyValue(name),
      priority: root.style.getPropertyPriority(name),
    }));
    // Preserve an existing scrollbar's space; short pages should gain no gutter.
    if (
      document.defaultView &&
      document.defaultView.innerWidth > root.clientWidth
    )
      root.style.setProperty("scrollbar-gutter", "stable", "important");
    root.style.setProperty("overflow", "hidden", "important");
    root.style.setProperty("overscroll-behavior", "none", "important");
    lock = {
      count: 0,
      restore: () => {
        for (const { name, value, priority } of previous) {
          if (value) root.style.setProperty(name, value, priority);
          else root.style.removeProperty(name);
        }
      },
    };
    locks.set(document, lock);
  }
  lock.count += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--lock.count === 0) {
      lock.restore();
      locks.delete(document);
    }
  };
}
