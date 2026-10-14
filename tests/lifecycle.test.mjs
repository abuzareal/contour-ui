import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://example.com/#target",
  pretendToBeVisual: true,
});
for (const key of [
  "window",
  "document",
  "HTMLElement",
  "Element",
  "Node",
  "Event",
  "MutationObserver",
  "getComputedStyle",
])
  globalThis[key] = dom.window[key];
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { renderHook, act, cleanup } = await import("@testing-library/react");
const { usePrintPreparation, useInitialHashScroll } =
  await import("../dist/index.js");
afterEach(() => {
  cleanup();
  document.body.replaceChildren();
  delete document.documentElement.dataset.theme;
});
function details() {
  document.body.innerHTML =
    '<details id="closed"><summary>Closed</summary><p>Private section</p></details><details id="open" open><summary>Open</summary><p>Visible section</p></details>';
  return document.getElementById("closed");
}
function print(type) {
  act(() => window.dispatchEvent(new Event(type)));
}
test("print preparation preserves the original snapshot across repeated beforeprint and afterprint events", () => {
  const closed = details();
  document.documentElement.dataset.theme = "dark";
  renderHook(() => usePrintPreparation());
  print("beforeprint");
  print("beforeprint");
  assert.equal(closed.open, true);
  assert.equal(document.documentElement.dataset.theme, "light");
  print("afterprint");
  print("afterprint");
  assert.equal(closed.open, false);
  assert.equal(document.getElementById("open").open, true);
  assert.equal(document.documentElement.dataset.theme, "dark");
});
test("print cleanup restores absence of a theme attribute and disclosures when unmounted during printing", () => {
  const closed = details();
  const hook = renderHook(() => usePrintPreparation());
  print("beforeprint");
  hook.unmount();
  assert.equal(closed.open, false);
  assert.equal(document.getElementById("open").open, true);
  assert.equal(document.documentElement.hasAttribute("data-theme"), false);
  print("afterprint");
  assert.equal(document.documentElement.hasAttribute("data-theme"), false);
});
test("initial hash alignment ignores a font-ready completion after unmount or user navigation", async () => {
  let ready;
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: {
      ready: new Promise((resolve) => {
        ready = resolve;
      }),
    },
  });
  const target = document.createElement("section");
  target.id = "target";
  let calls = 0;
  target.scrollIntoView = () => calls++;
  document.body.append(target);
  const hook = renderHook(() => useInitialHashScroll());
  assert.equal(calls, 1);
  hook.unmount();
  await act(async () => ready());
  assert.equal(calls, 1);
  let next;
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: {
      ready: new Promise((resolve) => {
        next = resolve;
      }),
    },
  });
  renderHook(() => useInitialHashScroll());
  assert.equal(calls, 2);
  window.dispatchEvent(new Event("wheel"));
  await act(async () => next());
  assert.equal(calls, 2);
});

test("scroll spy preserves a section ID containing a separator and cancels its scheduled frame", async () => {
  const { useScrollSpy } = await import("../dist/index.js");
  const target = document.createElement("section");
  target.id = "part|two";
  target.getBoundingClientRect = () => ({ top: 0 });
  document.body.append(target);
  const pending = new Map();
  let next = 0;
  globalThis.requestAnimationFrame = (callback) => {
    const id = ++next;
    pending.set(id, callback);
    return id;
  };
  globalThis.cancelAnimationFrame = (id) => pending.delete(id);
  const hook = renderHook(() => useScrollSpy(["part|two"]));
  act(() => {
    for (const [id, callback] of pending) {
      pending.delete(id);
      callback(0);
    }
  });
  assert.equal(hook.result.current, "part|two");
  window.dispatchEvent(new Event("scroll"));
  assert.equal(pending.size, 1);
  hook.unmount();
  assert.equal(pending.size, 0);
});
