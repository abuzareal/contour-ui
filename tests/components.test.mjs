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
  TextArea,
  SelectField,
  DropdownMenu,
  Popover,
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

test("field refs focus native controls, preserve caller validity, and allow a zero limit", () => {
  for (const Control of [TextField, TextArea, SelectField]) {
    const ref = React.createRef();
    const view = render(
      React.createElement(
        Control,
        {
          label: "Control",
          options:
            Control === SelectField
              ? [{ value: "one", label: "One" }]
              : undefined,
          ref,
          "aria-invalid": true,
          maxLength: Control === SelectField ? undefined : 0,
        },
        Control === SelectField
          ? React.createElement("option", null, "One")
          : undefined,
      ),
    );
    assert.ok(ref.current instanceof HTMLElement);
    ref.current.focus();
    assert.equal(document.activeElement, ref.current);
    assert.equal(ref.current.getAttribute("aria-invalid"), "true");
    if (Control !== SelectField) assert.ok(view.getByText("0/0"));
    view.unmount();
    assert.equal(ref.current, null);
  }
});

test("native form reset synchronizes uncontrolled counters, including external form controls", async () => {
  for (const Control of [TextField, TextArea]) {
    for (const external of [false, true]) {
      const field = React.createElement(Control, {
        label: "Name",
        defaultValue: "abc",
        maxLength: 20,
        form: external ? "owner" : undefined,
      });
      const view = render(
        React.createElement(
          "div",
          null,
          React.createElement("form", { id: "owner" }, external ? null : field),
          external ? field : null,
        ),
      );
      const input = view.getByRole("textbox");
      fireEvent.change(input, { target: { value: "abcdef" } });
      assert.ok(view.getByText("6/20"));
      await act(async () => {
        document.getElementById("owner").reset();
        await new Promise((resolve) => setTimeout(resolve, 5));
      });
      assert.equal(input.value, "abc");
      assert.ok(view.getByText("3/20"));
      fireEvent.change(input, { target: { value: "abcdefgh" } });
      document
        .getElementById("owner")
        .addEventListener("reset", (event) => event.preventDefault(), {
          once: true,
        });
      await act(async () => {
        document.getElementById("owner").reset();
        await new Promise((resolve) => setTimeout(resolve, 5));
      });
      assert.equal(input.value, "abcdefgh");
      assert.ok(view.getByText("8/20"));
      view.unmount();
    }
  }
});

test("controlled tabs notify the parent without overriding its selection", () => {
  const changes = [];
  const tabs = [
    { id: "one", label: "One", content: "First" },
    { id: "two", label: "Two", content: "Second" },
  ];
  const props = {
    label: "Views",
    tabs,
    activeTabId: "one",
    onTabChange: (id) => changes.push(id),
  };
  const view = render(React.createElement(Tabs, props));
  fireEvent.click(view.getByRole("tab", { name: "Two" }));
  assert.deepEqual(changes, ["two"]);
  assert.equal(view.getByRole("tabpanel").textContent, "First");
  view.rerender(React.createElement(Tabs, { ...props, activeTabId: "two" }));
  assert.equal(view.getByRole("tabpanel").textContent, "Second");
});

test("action menus skip disabled items, open from keyboard, type ahead and restore focus", () => {
  let selected = 0;
  const view = render(
    React.createElement(DropdownMenu, {
      label: "Actions",
      items: [
        {
          label: "Blocked",
          disabled: true,
          onSelect() {
            throw Error("disabled action");
          },
        },
        {
          label: "Alpha",
          onSelect() {
            selected++;
          },
        },
        {
          label: "Beta",
          onSelect() {
            selected++;
          },
        },
      ],
    }),
  );
  const trigger = view.getByRole("button", { name: "Actions" });
  fireEvent.keyDown(trigger, { key: "ArrowUp" });
  assert.equal(document.activeElement.textContent, "Beta");
  fireEvent.keyDown(document.activeElement, { key: "ArrowDown" });
  assert.equal(document.activeElement.textContent, "Alpha");
  fireEvent.keyDown(document.activeElement, { key: "b" });
  assert.equal(document.activeElement.textContent, "Beta");
  fireEvent.click(document.activeElement);
  assert.equal(selected, 1);
  assert.equal(document.activeElement, trigger);
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  fireEvent.keyDown(trigger, { key: "ArrowUp" });
  fireEvent.keyDown(document.activeElement, { key: "a" });
  assert.equal(document.activeElement.textContent, "Alpha");
});

test("controlled disclosures report changes and respect the parent's open state", () => {
  for (const Control of [Popover, DropdownMenu]) {
    const changes = [];
    const props =
      Control === Popover
        ? { trigger: "Open", title: "Details", children: "Content" }
        : { label: "Open", items: [{ label: "Item", onSelect() {} }] };
    const view = render(
      React.createElement(Control, {
        ...props,
        open: false,
        onOpenChange: (value) => changes.push(value),
      }),
    );
    const trigger = view.getByRole("button", { name: "Open" });
    fireEvent.click(trigger);
    assert.deepEqual(changes, [true]);
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    view.rerender(
      React.createElement(Control, {
        ...props,
        open: true,
        onOpenChange: (value) => changes.push(value),
      }),
    );
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    fireEvent.keyDown(document, { key: "Escape" });
    assert.deepEqual(changes, [true, false]);
    view.unmount();
  }
});

test("native input updates counters and preserves caller input/change callbacks", () => {
  for (const Control of [TextField, TextArea]) {
    const inputs = [],
      changes = [];
    const view = render(
      React.createElement(Control, {
        label: "Name",
        defaultValue: "abc",
        maxLength: 20,
        onInput: (event) => inputs.push(event.currentTarget.value),
        onChange: (event) => changes.push(event.currentTarget.value),
      }),
    );
    fireEvent.input(view.getByRole("textbox"), { target: { value: "abcdef" } });
    assert.ok(view.getByText("6/20"));
    assert.deepEqual(inputs, ["abcdef"]);
    assert.deepEqual(changes, ["abcdef"]);
    view.unmount();
  }
});
