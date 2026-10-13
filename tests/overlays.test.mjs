import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://example.com",
  pretendToBeVisual: true,
});
for (const key of [
  "window",
  "document",
  "Node",
  "Element",
  "HTMLElement",
  "MutationObserver",
  "Event",
  "MouseEvent",
  "KeyboardEvent",
  "getComputedStyle",
])
  globalThis[key] = dom.window[key];
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = (await import("react")).default;
const { render, fireEvent, cleanup } = await import("@testing-library/react");
const { Popover } = await import("../dist/index.js");
afterEach(cleanup);
test("one Escape dismisses only the nested Popover and still reaches document listeners", () => {
  const view = render(
    React.createElement(
      Popover,
      { trigger: "Outer", title: "Parent", defaultOpen: true },
      React.createElement(
        Popover,
        { trigger: "Inner", title: "Child", defaultOpen: true },
        "Child content",
      ),
    ),
  );
  let observed = 0;
  const listener = () => observed++;
  document.addEventListener("keydown", listener);
  fireEvent.keyDown(view.getByText("Child content"), { key: "Escape" });
  assert.equal(
    view.getByRole("button", { name: "Outer" }).getAttribute("aria-expanded"),
    "true",
  );
  assert.equal(
    view.getByRole("button", { name: "Inner" }).getAttribute("aria-expanded"),
    "false",
  );
  assert.equal(observed, 1);
  document.removeEventListener("keydown", listener);
});
test("portaled child presses belong to the child, and outside press closes only the latest sibling", () => {
  const view = render(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(
        Popover,
        { trigger: "First", title: "First panel", defaultOpen: true },
        React.createElement("button", null, "Inside first"),
      ),
      React.createElement(
        Popover,
        { trigger: "Second", title: "Second panel", defaultOpen: true },
        React.createElement("button", null, "Inside second"),
      ),
    ),
  );
  fireEvent.pointerDown(view.getByRole("button", { name: "Inside second" }));
  assert.equal(
    view.getByRole("button", { name: "Second" }).getAttribute("aria-expanded"),
    "true",
  );
  fireEvent.pointerDown(document.body);
  assert.equal(
    view.getByRole("button", { name: "Second" }).getAttribute("aria-expanded"),
    "false",
  );
  assert.equal(
    view.getByRole("button", { name: "First" }).getAttribute("aria-expanded"),
    "true",
  );
  fireEvent.keyDown(document, { key: "Escape" });
  assert.equal(
    view.getByRole("button", { name: "First" }).getAttribute("aria-expanded"),
    "false",
  );
});
test("caller cancellation and ordinary document keyboard handling remain intact", () => {
  const view = render(
    React.createElement(
      Popover,
      {
        trigger: "Protected",
        title: "Protected panel",
        defaultOpen: true,
        onDismiss: (_, event) => event.preventDefault(),
      },
      "Protected content",
    ),
  );
  fireEvent.keyDown(document, { key: "Escape" });
  assert.equal(
    view
      .getByRole("button", { name: "Protected" })
      .getAttribute("aria-expanded"),
    "true",
  );
  fireEvent.pointerDown(document.body);
  assert.equal(
    view
      .getByRole("button", { name: "Protected" })
      .getAttribute("aria-expanded"),
    "true",
  );
  const ordinary = new KeyboardEvent("keydown", {
    key: "a",
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(ordinary);
  assert.equal(ordinary.defaultPrevented, false);
});
test("dismissal is isolated to the owner document and detached layers leave no callbacks", () => {
  const foreign = new JSDOM("<!doctype html><html><body></body></html>", {
    pretendToBeVisual: true,
  });
  const view = render(
    React.createElement(
      Popover,
      {
        trigger: "Foreign",
        title: "Foreign panel",
        defaultOpen: true,
        portal: false,
      },
      "Foreign content",
    ),
    {
      container: foreign.window.document.body,
      baseElement: foreign.window.document.body,
    },
  );
  fireEvent.keyDown(document, { key: "Escape" });
  assert.equal(
    view.getByRole("button", { name: "Foreign" }).getAttribute("aria-expanded"),
    "true",
  );
  fireEvent.keyDown(foreign.window.document, { key: "Escape" });
  assert.equal(
    view.getByRole("button", { name: "Foreign" }).getAttribute("aria-expanded"),
    "false",
  );
  view.unmount();
  foreign.window.close();
  let requests = 0;
  const owned = render(
    React.createElement(
      Popover,
      {
        trigger: "Removed",
        title: "Removed panel",
        defaultOpen: true,
        onOpenChange: () => requests++,
      },
      "Removed content",
    ),
  );
  owned.unmount();
  fireEvent.keyDown(document, { key: "Escape" });
  fireEvent.pointerDown(document.body);
  assert.equal(requests, 0);
});
test("custom Button triggers keep one button, compose handlers/refs, and preserve owned ARIA", async () => {
  const { Button } = await import("../dist/index.js");
  const ref = React.createRef();
  let clicked = 0;
  const view = render(
    React.createElement(
      Popover,
      {
        trigger: "Custom",
        title: "Custom panel",
        triggerProps: { ref, onClick: () => clicked++ },
        renderTrigger: (props) =>
          React.createElement(Button, { ...props, variant: "accent" }),
      },
      "Custom content",
    ),
  );
  assert.equal(view.getAllByRole("button").length, 1);
  assert.equal(ref.current.tagName, "BUTTON");
  fireEvent.click(ref.current);
  assert.equal(clicked, 1);
  assert.equal(ref.current.getAttribute("aria-expanded"), "true");
  fireEvent.keyDown(document, { key: "Escape" });
  assert.equal(document.activeElement === ref.current, true);
});
test("scope theme controls change only caller state, without document or legacy storage ownership", async () => {
  const { ThemeScope, ThemeToggle } = await import("../dist/index.js");
  document.documentElement.dataset.theme = "light";
  function App() {
    const [theme, setTheme] = React.useState("dark");
    return React.createElement(
      ThemeScope,
      { theme, onThemeChange: setTheme, "data-testid": "scope" },
      React.createElement(ThemeToggle, { animate: false, darkLabel: "Oscuro" }),
    );
  }
  const view = render(React.createElement(App));
  const toggle = view.getByRole("button", { name: "Oscuro" });
  fireEvent.click(toggle);
  assert.equal(view.getByTestId("scope").dataset.contourTheme, "light");
  assert.equal(document.documentElement.dataset.theme, "light");
  assert.equal(window.localStorage.getItem("aa-theme"), null);
});
test("tooltip focus survives pointer leave, Escape suppresses the hint, and child semantics survive", async () => {
  const { Tooltip } = await import("../dist/index.js");
  const { act } = await import("@testing-library/react");
  const view = render(
    React.createElement(
      Tooltip,
      { content: "Hint", portal: false },
      React.createElement("button", { "aria-describedby": "existing" }, "Help"),
    ),
  );
  const trigger = view.getByRole("button", { name: "Help" });
  fireEvent.focus(trigger);
  fireEvent.pointerEnter(trigger.parentElement);
  fireEvent.pointerLeave(trigger.parentElement);
  await act(() => new Promise((resolve) => setTimeout(resolve, 180)));
  assert.ok(view.getByRole("tooltip").classList.contains("is-open"));
  fireEvent.keyDown(document, { key: "Escape" });
  assert.equal(view.getByRole("tooltip").classList.contains("is-open"), false);
  assert.match(trigger.getAttribute("aria-describedby"), /^existing /);
  fireEvent.blur(trigger);
  fireEvent.focus(trigger);
  assert.ok(view.getByRole("tooltip").classList.contains("is-open"));
});
test("owner-document moves rebind a public dismissal hook and restore owned stack styles", async () => {
  const { useDismiss } = await import("../dist/index.js");
  const { renderHook } = await import("@testing-library/react");
  const node = document.createElement("div");
  node.style.zIndex = "17";
  document.body.append(node);
  const ref = { current: node };
  let called = 0;
  const hook = renderHook(() =>
    useDismiss(ref, true, () => called++, { layerElement: ref }),
  );
  const foreign = new JSDOM("<html><body></body></html>", {
    pretendToBeVisual: true,
  });
  foreign.window.document.body.append(node);
  hook.rerender();
  fireEvent.keyDown(document, { key: "Escape" });
  assert.equal(called, 0);
  fireEvent.keyDown(foreign.window.document, { key: "Escape" });
  assert.equal(called, 1);
  hook.unmount();
  assert.equal(node.style.zIndex, "17");
  fireEvent.keyDown(foreign.window.document, { key: "Escape" });
  assert.equal(called, 1);
  foreign.window.close();
});
test("closing a parent suspends portaled descendants and returns focus from the owned child", async () => {
  const { act } = await import("@testing-library/react");
  let close;
  function App() {
    const [open, setOpen] = React.useState(true);
    close = () => setOpen(false);
    return React.createElement(
      Popover,
      { trigger: "Parent trigger", title: "Parent panel", open },
      React.createElement(
        Popover,
        { trigger: "Child trigger", title: "Child panel", defaultOpen: true },
        React.createElement("button", null, "Owned child action"),
      ),
    );
  }
  const view = render(React.createElement(App));
  view.getByRole("button", { name: "Owned child action" }).focus();
  act(() => close());
  assert.equal(
    view.getByRole("button", { name: "Parent trigger" }) ===
      document.activeElement,
    true,
  );
  assert.equal(
    view.getByText("Child panel").closest("[role=dialog]").hidden,
    true,
  );
  fireEvent.keyDown(document, { key: "Escape" });
  assert.equal(
    view.getByRole("button", { name: "Parent trigger" }) ===
      document.activeElement,
    true,
  );
});
test("changing focus callback props during an open render does not simulate closing the panel", () => {
  const closes = [];
  const props = {
    trigger: "Focus policy",
    title: "Focus policy panel",
    defaultOpen: true,
  };
  const view = render(
    React.createElement(
      Popover,
      { ...props, onCloseAutoFocus: () => closes.push("first") },
      React.createElement("input", { "aria-label": "Policy field" }),
    ),
  );
  view.getByRole("textbox", { name: "Policy field" }).focus();
  view.rerender(
    React.createElement(
      Popover,
      { ...props, onCloseAutoFocus: () => closes.push("latest") },
      React.createElement("input", { "aria-label": "Policy field" }),
    ),
  );
  assert.equal(closes.length, 0);
  assert.equal(
    document.activeElement ===
      view.getByRole("textbox", { name: "Policy field" }),
    true,
  );
  view.unmount();
  assert.deepEqual(closes, ["latest"]);
});
