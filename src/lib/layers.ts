import { createContext } from "react";
export type DismissReason = "escape" | "outside";
export const LayerVisibility = createContext(true);
export const LayerParent = createContext<symbol | undefined>(undefined);
type Layer = {
  id: symbol;
  parent?: symbol;
  elements: () => (HTMLElement | null)[];
  dismiss: (reason: DismissReason, event: KeyboardEvent | PointerEvent) => void;
  outside: boolean;
  floating?: () => HTMLElement | null;
};
type Registry = {
  layers: Layer[];
  zStyles: Map<HTMLElement, { value: string; priority: string }>;
  dispose: () => void;
};
const documents = new WeakMap<Document, Registry>();
function descendant(layer: Layer, ancestor: Layer, layers: Layer[]): boolean {
  let parent = layer.parent;
  const visited = new Set<symbol>();
  while (parent && !visited.has(parent)) {
    if (parent === ancestor.id) return true;
    visited.add(parent);
    parent = layers.find((entry) => entry.id === parent)?.parent;
  }
  return false;
}
function topLayer(layers: Layer[]) {
  return [...layers]
    .reverse()
    .find(
      (layer) =>
        !layers.some(
          (entry) =>
            entry !== layer &&
            (descendant(entry, layer, layers) ||
              layer
                .elements()
                .some((root) =>
                  entry
                    .elements()
                    .some(
                      (child) =>
                        root && child && root !== child && root.contains(child),
                    ),
                )),
        ),
    );
}
export function layerOwnsFocus(doc: Document, id: symbol) {
  const layers = documents.get(doc)?.layers ?? [];
  const owner = layers.find((layer) => layer.id === id);
  return (
    !!owner &&
    layers.some(
      (layer) =>
        (layer === owner || descendant(layer, owner, layers)) &&
        layer
          .elements()
          .some((element) => element?.contains(doc.activeElement)),
    )
  );
}
/** Paint order follows dismissal order, including later-opened siblings and portaled children. */
export function refreshLayerStack(doc: Document) {
  const registry = documents.get(doc);
  if (!registry) return;
  const remaining = [...registry.layers];
  const ordered: Layer[] = [];
  while (remaining.length) {
    const top = topLayer(remaining);
    if (!top) break;
    ordered.unshift(top);
    remaining.splice(remaining.indexOf(top), 1);
  }
  const active = new Set<HTMLElement>();
  ordered.forEach((layer, index) => {
    const panel = layer.floating?.();
    if (panel) {
      active.add(panel);
      if (!registry.zStyles.has(panel))
        registry.zStyles.set(panel, {
          value: panel.style.getPropertyValue("z-index"),
          priority: panel.style.getPropertyPriority("z-index"),
        });
      const value = `calc(var(--contour-z-overlay, 30) + ${index})`;
      if (panel.style.zIndex !== value) panel.style.zIndex = value;
    }
  });
  for (const [element, old] of registry.zStyles)
    if (!active.has(element)) {
      if (old.value)
        element.style.setProperty("z-index", old.value, old.priority);
      else element.style.removeProperty("z-index");
      registry.zStyles.delete(element);
    }
}
export function isTopLayer(doc: Document, id: symbol) {
  return topLayer(documents.get(doc)?.layers ?? [])?.id === id;
}
/** One bubble listener per owner document. Never stop propagation or cascade a dismissal. */
export function registerLayer(doc: Document, layer: Layer) {
  let registry = documents.get(doc);
  if (!registry) {
    const layers: Layer[] = [];
    const keydown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const top = topLayer(layers);
      if (!top) return;
      top.dismiss("escape", event);
      // Suppress native modal cancellation after dispatching the chosen layer.
      event.preventDefault();
    };
    const pointerdown = (event: PointerEvent) => {
      if (event.defaultPrevented || event.button > 0) return;
      const top = topLayer(layers);
      if (!top?.outside) return;
      const path = event.composedPath();
      if (top.elements().some((element) => element && path.includes(element)))
        return;
      top.dismiss("outside", event);
    };
    doc.addEventListener("keydown", keydown);
    doc.addEventListener("pointerdown", pointerdown);
    registry = {
      layers,
      zStyles: new Map(),
      dispose: () => {
        doc.removeEventListener("keydown", keydown);
        doc.removeEventListener("pointerdown", pointerdown);
      },
    };
    documents.set(doc, registry);
  }
  registry.layers.push(layer);
  refreshLayerStack(doc);
  const owned = registry;
  return () => {
    const index = owned.layers.indexOf(layer);
    if (index !== -1) owned.layers.splice(index, 1);
    refreshLayerStack(doc);
    if (owned.layers.length === 0) {
      owned.dispose();
      documents.delete(doc);
    }
  };
}
