import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const dom = new JSDOM(
  '<!doctype html><html data-theme="light"><head><meta name="theme-color"></head><body></body></html>',
  { url: "https://example.com", pretendToBeVisual: true },
);
for (const key of [
  "window",
  "document",
  "HTMLElement",
  "HTMLInputElement",
  "MutationObserver",
  "Event",
  "MouseEvent",
  "KeyboardEvent",
  "StorageEvent",
])
  globalThis[key] = dom.window[key];
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
});
const React = (await import("react")).default;
const { render, fireEvent, cleanup, act } =
  await import("@testing-library/react");
const {
  ThemeToggle,
  Tabs,
  TextField,
  Tooltip,
  FlipCard,
  ExternalLink,
  Dialog,
} = await import("../dist/index.js");
// jsdom does not implement native modal methods; real scrolling is browser-tested separately.
dom.window.HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
dom.window.HTMLDialogElement.prototype.close = function () {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
};
afterEach(() => {
  cleanup();
  localStorageReset();
});
function localStorageReset() {
  window.localStorage.clear();
  document.documentElement.dataset.theme = "light";
}

test("nested dialogs retain the lock and restore existing inline styles on unmount", () => {
  const root = document.documentElement;
  root.style.setProperty("overflow", "auto", "important");
  root.style.setProperty("scrollbar-gutter", "stable both-edges");
  root.style.setProperty("overscroll-behavior", "contain");
  const previous = root.getAttribute("style");
  const first = render(
    React.createElement(
      Dialog,
      { open: true, onClose() {}, title: "First" },
      "First body",
    ),
  );
  const second = render(
    React.createElement(
      Dialog,
      { open: true, onClose() {}, title: "Second", placement: "right" },
      "Second body",
    ),
  );
  assert.equal(root.style.overflow, "hidden");
  first.unmount();
  assert.equal(root.style.overflow, "hidden");
  second.unmount();
  assert.equal(root.getAttribute("style"), previous);
  root.removeAttribute("style");
});

test("StrictMode dialogs release the lock through close button, Escape and backdrop", () => {
  for (const dismissal of ["button", "cancel", "backdrop"]) {
    function Harness() {
      const [open, setOpen] = React.useState(true);
      return React.createElement(
        Dialog,
        { open, onClose: () => setOpen(false), title: "Preferences" },
        "Content",
      );
    }
    const view = render(
      React.createElement(React.StrictMode, null, React.createElement(Harness)),
    );
    assert.equal(document.documentElement.style.overflow, "hidden");
    const dialog = view.getByRole("dialog");
    if (dismissal === "button")
      fireEvent.click(view.getByRole("button", { name: "Close dialog" }));
    else if (dismissal === "cancel")
      fireEvent(dialog, new Event("cancel", { cancelable: true }));
    else fireEvent.click(dialog);
    assert.equal(dialog.open, false);
    assert.equal(document.documentElement.style.overflow, "");
    view.unmount();
  }
});

test("both theme controls stay synchronized and storage failures are tolerated", async () => {
  const view = render(
    React.createElement(
      "div",
      null,
      React.createElement(ThemeToggle, { animate: false }),
      React.createElement(ThemeToggle, { animate: false }),
    ),
  );
  const buttons = view.getAllByRole("button", { name: "Dark theme" });
  await act(async () => fireEvent.click(buttons[0]));
  assert.equal(document.documentElement.dataset.theme, "dark");
  assert.deepEqual(
    buttons.map((button) => button.getAttribute("aria-pressed")),
    ["true", "true"],
  );
  await act(async () => fireEvent.click(buttons[1]));
  assert.deepEqual(
    buttons.map((button) => button.getAttribute("aria-pressed")),
    ["false", "false"],
  );
  const original = Object.getOwnPropertyDescriptor(window, "localStorage");
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get() {
      throw Error("blocked");
    },
  });
  try {
    await act(async () => fireEvent.click(buttons[1]));
    assert.equal(document.documentElement.dataset.theme, "dark");
  } finally {
    Object.defineProperty(window, "localStorage", original);
  }
});

test("theme changes from another tab are applied to both controls", async () => {
  const view = render(
    React.createElement(
      "div",
      null,
      React.createElement(ThemeToggle, { animate: false }),
      React.createElement(ThemeToggle, { animate: false }),
    ),
  );
  window.localStorage.setItem("aa-theme", "dark");
  await act(async () =>
    window.dispatchEvent(
      new StorageEvent("storage", { key: "aa-theme", newValue: "dark" }),
    ),
  );
  assert.deepEqual(
    view
      .getAllByRole("button")
      .map((button) => button.getAttribute("aria-pressed")),
    ["true", "true"],
  );
});

test("tabs support keyboard selection, invalid defaults, empty lists, and changed items", () => {
  const tabs = [
    { id: "one", label: "One", content: "First" },
    { id: "two", label: "Two", content: "Second" },
  ];
  const view = render(
    React.createElement(Tabs, {
      label: "Views",
      tabs,
      defaultTabId: "missing",
    }),
  );
  assert.equal(
    view.getByRole("tab", { name: "One" }).getAttribute("aria-selected"),
    "true",
  );
  fireEvent.keyDown(view.getByRole("tab", { name: "One" }), {
    key: "ArrowRight",
  });
  assert.equal(view.getByRole("tab", { name: "Two" }), document.activeElement);
  assert.equal(view.getByRole("tabpanel").textContent, "Second");
  view.rerender(
    React.createElement(Tabs, { label: "Views", tabs: tabs.slice(0, 1) }),
  );
  assert.equal(view.getByRole("tabpanel").textContent, "First");
  view.rerender(React.createElement(Tabs, { label: "Views", tabs: [] }));
  assert.equal(view.queryAllByRole("tab").length, 0);
});

test("form errors have linked descriptions and tooltip preserves existing descriptions", () => {
  const view = render(
    React.createElement(
      "div",
      null,
      React.createElement(TextField, {
        label: "Email",
        error: "Invalid address",
      }),
      React.createElement(
        Tooltip,
        { content: "More context" },
        React.createElement(
          "button",
          { "aria-describedby": "existing" },
          "Help",
        ),
      ),
    ),
  );
  const input = view.getByRole("textbox", { name: "Email" });
  assert.equal(input.getAttribute("aria-invalid"), "true");
  assert.equal(
    document
      .getElementById(input.getAttribute("aria-describedby"))
      .textContent.trim(),
    "Invalid address",
  );
  assert.match(
    view.getByRole("button", { name: "Help" }).getAttribute("aria-describedby"),
    /^existing /,
  );
});

test("hidden flip-card face is inert, and link wrappers reject script URLs", () => {
  const view = render(
    React.createElement(
      "div",
      null,
      React.createElement(FlipCard, {
        front: React.createElement("button", null, "Front"),
        back: React.createElement("button", null, "Back"),
        label: "Flip",
      }),
      React.createElement(
        ExternalLink,
        { href: "javascript:alert(1)" },
        "Unsafe",
      ),
    ),
  );
  assert.ok(view.container.querySelector(".flip-back").hasAttribute("inert"));
  fireEvent.click(view.getByRole("button", { name: "Flip" }));
  assert.ok(view.container.querySelector(".flip-front").hasAttribute("inert"));
  assert.equal(view.container.querySelector("a").getAttribute("href"), null);
});

test("controlled field counters follow programmatic values and caller descriptions survive", () => {
  const view = render(
    React.createElement(TextField, {
      label: "City",
      id: "city",
      value: "Pune",
      maxLength: 20,
      onChange() {},
      hint: "Choose a location",
      "aria-describedby": "context",
    }),
  );
  const input = view.getByRole("textbox", { name: "City" });
  assert.equal(input.id, "city");
  assert.equal(input.getAttribute("aria-describedby"), "context city-hint");
  assert.ok(view.getByText("4/20"));
  view.rerender(
    React.createElement(TextField, {
      label: "City",
      id: "city",
      value: "Mumbai",
      maxLength: 20,
      onChange() {},
    }),
  );
  assert.ok(view.getByText("6/20"));
});

test("theme control does not submit its containing form", () => {
  let submissions = 0;
  const view = render(
    React.createElement(
      "form",
      {
        onSubmit(event) {
          event.preventDefault();
          submissions += 1;
        },
      },
      React.createElement(ThemeToggle, { animate: false }),
    ),
  );
  fireEvent.click(view.getByRole("button"));
  assert.equal(submissions, 0);
});

test("count-up renders its final value when observers are unavailable", async () => {
  const { CountUp } = await import("../dist/index.js");
  const view = render(React.createElement(CountUp, { to: 42 }));
  assert.equal(
    view.container.querySelector('[aria-hidden="true"]').textContent,
    "42",
  );
});
