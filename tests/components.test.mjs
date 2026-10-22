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
  "Element",
  "Node",
  "getComputedStyle",
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
const { render, renderHook, fireEvent, cleanup, act } =
  await import("@testing-library/react");
const {
  Avatar,
  SegmentedControl,
  ToastProvider,
  useToast,
  Button,
  IconButton,
  DepthButton,
  Slider,
  Switch,
  Checkbox,
  useClipboardCopy,
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

test("Checkbox preserves external validation and composes its description and error", () => {
  const props = {
    label: "Accept terms",
    description: "Read the terms first.",
    "aria-invalid": "grammar",
    "aria-describedby": "external-error",
  };
  const view = render(React.createElement(Checkbox, props));
  const input = view.getByRole("checkbox", { name: /Accept terms/ });
  assert.equal(input.getAttribute("aria-invalid"), "grammar");
  const description = view.getByText("Read the terms first.");
  assert.ok(description.id);
  assert.equal(
    input.getAttribute("aria-describedby"),
    `external-error ${description.id}`,
  );
  view.rerender(React.createElement(Checkbox, { ...props, error: "Required" }));
  const error = view.getByText("Required");
  assert.equal(input.getAttribute("aria-invalid"), "true");
  assert.equal(
    input.getAttribute("aria-describedby"),
    `external-error ${description.id} ${error.id}`,
  );
  view.rerender(React.createElement(Checkbox, props));
  assert.equal(input.getAttribute("aria-invalid"), "grammar");
  assert.equal(
    input.getAttribute("aria-describedby"),
    `external-error ${description.id}`,
  );
  fireEvent.click(input);
  assert.equal(input.checked, true);
});

test("clipboard ignores a completion after unmount and an older overlapping request", async (t) => {
  const pending = [];
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: () =>
        new Promise((resolve, reject) => pending.push({ resolve, reject })),
    },
  });
  t.after(() => {
    delete navigator.clipboard;
  });
  const originalTimer = globalThis.setTimeout;
  let resetTimers = 0;
  t.mock.method(globalThis, "setTimeout", (callback, delay, ...args) => {
    if (delay === 4000) resetTimers++;
    return originalTimer(callback, delay, ...args);
  });
  const first = renderHook(() => useClipboardCopy("first"));
  let abandoned;
  act(() => {
    abandoned = first.result.current.copy();
  });
  first.unmount();
  await act(async () => {
    pending[0].resolve();
    await abandoned;
  });
  assert.equal(resetTimers, 0);
  const second = renderHook(() => useClipboardCopy("second"));
  let older, newer;
  act(() => {
    older = second.result.current.copy();
    newer = second.result.current.copy();
  });
  await act(async () => {
    pending[2].resolve();
    await newer;
  });
  assert.equal(second.result.current.status, "copied");
  await act(async () => {
    pending[1].reject(new Error("old failure"));
    await older;
  });
  assert.equal(second.result.current.status, "copied");
  assert.equal(resetTimers, 1);
  let denied;
  act(() => {
    denied = second.result.current.copy();
  });
  await act(async () => {
    pending[3].reject(new Error("denied"));
    await denied;
  });
  assert.equal(second.result.current.status, "error");
  second.unmount();
});

test("clipboard discards feedback when the text changes during a pending write", async (t) => {
  let finish;
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    },
  });
  t.after(() => {
    delete navigator.clipboard;
  });
  const view = renderHook(({ text }) => useClipboardCopy(text), {
    initialProps: { text: "old" },
  });
  let operation;
  act(() => {
    operation = view.result.current.copy();
  });
  view.rerender({ text: "new" });
  await act(async () => {
    finish();
    await operation;
  });
  assert.equal(view.result.current.status, "idle");
});

test("single controls expose native object/callback refs and retain them through prop updates", () => {
  const cases = [
    [Button, { children: "Action", variant: "accent" }, "BUTTON"],
    [IconButton, { label: "Action", children: "Icon" }, "BUTTON"],
    [DepthButton, { children: "Action" }, "BUTTON"],
    [ExternalLink, { href: "https://example.com", children: "Visit" }, "A"],
    [ThemeToggle, { animate: false }, "BUTTON"],
    [Checkbox, { label: "Accept", indeterminate: true }, "INPUT"],
    [Slider, { label: "Amount", value: 20, onChange() {} }, "INPUT"],
    [Switch, { label: "Enabled", checked: false, onChange() {} }, "BUTTON"],
    [TextField, { label: "Name" }, "INPUT"],
    [TextArea, { label: "Notes" }, "TEXTAREA"],
    [SelectField, { label: "Plan", options: [] }, "SELECT"],
  ];
  for (const [Component, props, tag] of cases) {
    const ref = React.createRef();
    const view = render(React.createElement(Component, { ...props, ref }));
    assert.equal(ref.current?.tagName, tag);
    ref.current.focus();
    assert.equal(document.activeElement, ref.current);
    if (Component === Checkbox) assert.equal(ref.current.indeterminate, true);
    view.unmount();
    assert.equal(ref.current, null);
    const calls = [];
    const callback = (node) => {
      calls.push(node);
    };
    const callbackView = render(
      React.createElement(Component, { ...props, ref: callback }),
    );
    const node = calls[0];
    assert.equal(node.tagName, tag);
    callbackView.rerender(
      React.createElement(Component, {
        ...props,
        ref: callback,
        title: "Updated",
      }),
    );
    assert.equal(
      calls.length,
      1,
      `${Component.displayName ?? Component.name ?? tag} stable callback attachment`,
    );
    assert.deepEqual(calls, [node]);
    callbackView.unmount();
    assert.equal(calls.length, 2, "one callback detach");
    assert.deepEqual(calls, [node, null]);
  }
});

test(
  "React 19 cleanup-returning refs work alongside internal control and part refs",
  { skip: Number.parseInt(React.version, 10) < 19 },
  () => {
    for (const Component of [
      Button,
      Checkbox,
      TextField,
      Dialog,
      Popover,
      Tabs,
    ]) {
      let attached = 0,
        cleaned = 0;
      const ref = () => {
        attached++;
        return () => {
          cleaned++;
        };
      };
      const props =
        Component === Dialog
          ? { open: false, onClose() {}, title: "Dialog" }
          : Component === Popover
            ? { trigger: "Open", title: "Panel", triggerProps: { ref } }
            : Component === Tabs
              ? {
                  label: "Views",
                  tabs: [
                    {
                      id: "one",
                      label: "One",
                      content: "Panel",
                      buttonProps: { ref },
                    },
                  ],
                }
              : Component === Button
                ? { children: "Action" }
                : { label: "Name" };
      const view = render(React.createElement(Component, { ...props, ref }));
      assert.ok(attached >= 1);
      view.unmount();
      assert.equal(cleaned, attached);
    }
  },
);

test("Button/IconButton preserve native props, default type, loading and required labels", () => {
  let clicks = 0;
  const ref = React.createRef();
  const view = render(
    React.createElement(
      Button,
      {
        ref,
        name: "intent",
        value: "save",
        loading: true,
        variant: "danger",
        size: "lg",
        className: "host-action",
        "data-action": "save",
        onClick() {
          clicks++;
        },
      },
      "Save",
    ),
  );
  assert.equal(ref.current.type, "button");
  assert.equal(ref.current.disabled, true);
  assert.equal(ref.current.getAttribute("aria-busy"), "true");
  assert.match(ref.current.className, /button-danger/);
  assert.match(ref.current.className, /host-action/);
  fireEvent.click(ref.current);
  assert.equal(clicks, 0);
  view.rerender(
    React.createElement(
      Button,
      {
        ref,
        type: "submit",
        onClick() {
          clicks++;
        },
      },
      "Save",
    ),
  );
  assert.equal(ref.current.type, "submit");
  fireEvent.click(ref.current);
  assert.equal(clicks, 1);
  view.unmount();
  const icon = render(
    React.createElement(
      IconButton,
      {
        ref,
        label: "Copy",
        "data-copy": "ready",
        title: "Copy now",
        size: "sm",
      },
      "Icon",
    ),
  );
  assert.equal(ref.current.getAttribute("aria-label"), "Copy");
  assert.equal(ref.current.title, "Copy now");
  assert.equal(ref.current.getAttribute("data-copy"), "ready");
  assert.match(ref.current.className, /icon-button-sm/);
  icon.unmount();
});

test("Dialog root and owned parts accept customization without dropping semantic wiring", () => {
  const root = React.createRef(),
    body = React.createRef(),
    panel = React.createRef(),
    close = React.createRef();
  const view = render(
    React.createElement(
      Dialog,
      {
        ref: root,
        open: true,
        onClose() {},
        title: "Settings",
        description: "Edit preferences",
        id: "settings",
        className: "host-dialog",
        style: { maxWidth: 700 },
        "data-owner": "account",
        "aria-describedby": "external-help",
        panelProps: { ref: panel, className: "host-panel" },
        bodyProps: { ref: body, id: "settings-body", "data-part": "body" },
        closeButtonProps: { ref: close, "aria-label": "Close settings" },
      },
      "Content",
    ),
  );
  assert.equal(root.current.tagName, "DIALOG");
  assert.equal(root.current.id, "settings");
  assert.equal(root.current.getAttribute("data-owner"), "account");
  assert.match(root.current.className, /dialog-center.*host-dialog/);
  assert.equal(root.current.style.maxWidth, "700px");
  assert.equal(view.getByRole("dialog", { name: "Settings" }), root.current);
  const description = view.getByText("Edit preferences");
  assert.ok(
    root.current.getAttribute("aria-describedby").includes(description.id),
  );
  assert.ok(
    root.current.getAttribute("aria-describedby").includes("external-help"),
  );
  assert.equal(
    panel.current.className,
    "dialog-panel host-panel contour-dialog-panel",
  );
  assert.equal(body.current.id, "settings-body");
  assert.equal(close.current.type, "button");
  assert.equal(close.current.getAttribute("aria-label"), "Close settings");
  view.unmount();
  assert.equal(root.current, null);
  assert.equal(body.current, null);
  assert.equal(close.current, null);
});

test("Dialog caller cancellation vetoes dismissal but keeps native cancel controlled", () => {
  let closes = 0,
    clicks = 0;
  const props = {
    open: true,
    onClose() {
      closes++;
    },
    title: "Settings",
  };
  const view = render(
    React.createElement(
      Dialog,
      {
        ...props,
        onCancel(event) {
          event.preventDefault();
        },
        onClick(event) {
          clicks++;
          event.preventDefault();
        },
        closeButtonProps: {
          onClick(event) {
            event.preventDefault();
          },
        },
      },
      "Content",
    ),
  );
  const dialog = view.getByRole("dialog");
  const cancel = new Event("cancel", { bubbles: false, cancelable: true });
  fireEvent(dialog, cancel);
  assert.equal(cancel.defaultPrevented, true);
  fireEvent.click(dialog);
  fireEvent.click(view.getByRole("button", { name: "Close dialog" }));
  assert.equal(closes, 0);
  assert.ok(clicks >= 1);
  view.rerender(React.createElement(Dialog, props, "Content"));
  fireEvent(dialog, new Event("cancel", { cancelable: true }));
  assert.equal(closes, 1);
});

test("Tabs root/list/item parts preserve controlled selection, keyboard behavior, IDs and refs", () => {
  const root = React.createRef(),
    list = React.createRef(),
    button = React.createRef(),
    panel = React.createRef();
  const changes = [];
  const tabs = [
    {
      id: "one",
      label: "One",
      content: "First",
      buttonProps: { id: "one-tab", ref: button, className: "host-tab" },
      panelProps: { id: "one-panel", ref: panel, "data-result": "one" },
    },
    {
      id: "two",
      label: "Two",
      content: "Second",
      buttonProps: {
        onClick(event) {
          event.preventDefault();
        },
        onKeyDown(event) {
          event.preventDefault();
        },
      },
    },
  ];
  const props = {
    ref: root,
    id: "views",
    className: "host-tabs",
    "data-owner": "account",
    label: "Views",
    tabs,
    listProps: { ref: list, className: "host-list", style: { padding: 2 } },
    activeTabId: "one",
    onTabChange: (id) => changes.push(id),
  };
  const view = render(React.createElement(Tabs, props));
  assert.equal(root.current.id, "views");
  assert.equal(root.current.className, "tabs host-tabs contour-tabs");
  assert.equal(list.current.getAttribute("role"), "tablist");
  assert.equal(button.current.id, "one-tab");
  assert.equal(button.current.getAttribute("aria-controls"), "one-panel");
  assert.equal(panel.current.getAttribute("aria-labelledby"), "one-tab");
  fireEvent.click(view.getByRole("tab", { name: "Two" }));
  assert.deepEqual(changes, []);
  fireEvent.keyDown(view.getByRole("tab", { name: "Two" }), {
    key: "ArrowLeft",
  });
  assert.deepEqual(changes, []);
  fireEvent.keyDown(button.current, { key: "ArrowRight" });
  assert.deepEqual(changes, ["two"]);
  assert.equal(view.getByRole("tabpanel").textContent, "First");
  const identity = button.current;
  view.rerender(
    React.createElement(Tabs, {
      ...props,
      tabs: [...tabs].reverse(),
      activeTabId: "two",
    }),
  );
  assert.equal(button.current, identity);
  assert.equal(view.getByRole("tabpanel").textContent, "Second");
  view.unmount();
  assert.equal(root.current, null);
  assert.equal(list.current, null);
  assert.equal(button.current, null);
  assert.equal(panel.current, null);
});

test("Popover owned root/trigger/panel refs and caller handlers compose with controlled state", () => {
  const root = React.createRef(),
    trigger = React.createRef(),
    panel = React.createRef();
  const changes = [];
  const props = {
    ref: root,
    trigger: "Help",
    title: "Help details",
    open: false,
    onOpenChange: (value) => changes.push(value),
    id: "help",
    "data-context": "settings",
    className: "host-popover",
    panelProps: {
      ref: panel,
      id: "help-panel",
      className: "host-panel",
      "aria-describedby": "hint",
    },
    triggerProps: {
      ref: trigger,
      id: "help-trigger",
      className: "host-trigger",
      onClick(event) {
        event.preventDefault();
      },
    },
  };
  const view = render(React.createElement(Popover, props, "Details"));
  assert.equal(root.current.id, "help");
  assert.equal(
    root.current.className,
    "popover popover-start host-popover contour-popover contour-popover-start",
  );
  assert.equal(trigger.current.getAttribute("aria-controls"), "help-panel");
  assert.equal(panel.current.hidden, true);
  fireEvent.click(trigger.current);
  assert.deepEqual(changes, []);
  view.rerender(
    React.createElement(
      Popover,
      { ...props, triggerProps: { ref: trigger, disabled: true } },
      "Details",
    ),
  );
  fireEvent.click(trigger.current);
  assert.deepEqual(changes, []);
  view.rerender(
    React.createElement(
      Popover,
      { ...props, triggerProps: { ref: trigger } },
      "Details",
    ),
  );
  fireEvent.click(trigger.current);
  assert.deepEqual(changes, [true]);
  assert.equal(panel.current.hidden, true);
  view.rerender(
    React.createElement(
      Popover,
      { ...props, open: true, triggerProps: { ref: trigger } },
      "Details",
    ),
  );
  fireEvent.keyDown(document, { key: "Escape" });
  assert.deepEqual(changes, [true, false]);
  assert.equal(document.activeElement, trigger.current);
  view.unmount();
  assert.equal(root.current, null);
  assert.equal(trigger.current, null);
  assert.equal(panel.current, null);
});

test("an external trigger adapter can clone a Button, focus/measure it and release its ref", () => {
  const nodes = [];
  function Adapter({ children }) {
    const ref = React.useRef(null);
    React.useEffect(() => {
      ref.current.focus();
      assert.equal(
        Number.isFinite(ref.current.getBoundingClientRect().width),
        true,
      );
    }, []);
    return React.cloneElement(children, {
      ref: (node) => {
        ref.current = node;
        nodes.push(node);
      },
      "data-trigger": "external",
    });
  }
  const view = render(
    React.createElement(
      Adapter,
      null,
      React.createElement(Button, null, "Open"),
    ),
  );
  assert.equal(
    document.activeElement,
    view.getByRole("button", { name: "Open" }),
  );
  assert.equal(nodes[0].getAttribute("data-trigger"), "external");
  view.unmount();
  assert.equal(nodes.at(-1), null);
});

test("menu stable IDs retain native item identity through duplicate labels and reordering", () => {
  const chosen = [];
  const items = [
    { id: "a", label: "Same", onSelect: () => chosen.push("a") },
    { id: "b", label: "Same", onSelect: () => chosen.push("b") },
  ];
  const view = render(
    React.createElement(DropdownMenu, {
      label: "Actions",
      defaultOpen: true,
      items,
    }),
  );
  const [first, second] = view.getAllByRole("menuitem");
  first.focus();
  view.rerender(
    React.createElement(DropdownMenu, {
      label: "Actions",
      defaultOpen: true,
      items: [...items].reverse(),
    }),
  );
  assert.equal(view.getAllByRole("menuitem")[1], first);
  assert.equal(document.activeElement, first);
  fireEvent.keyDown(first, { key: "ArrowDown" });
  assert.equal(document.activeElement, second);
  fireEvent.click(second);
  assert.deepEqual(chosen, ["b"]);
  assert.equal(
    document.activeElement,
    view.getByRole("button", { name: "Actions" }),
  );
});

test("part customization cannot overwrite owned roles, selected/hidden state or ARIA relationships", () => {
  const tabs = render(
    React.createElement(Tabs, {
      label: "Views",
      tabs: [
        {
          id: "one",
          label: "One",
          content: "First",
          buttonProps: {
            role: "button",
            "aria-selected": false,
            "aria-controls": "wrong",
            tabIndex: -1,
          },
        },
        {
          id: "two",
          label: "Two",
          content: "Second",
          panelProps: { hidden: false, role: "region" },
        },
      ],
    }),
  );
  const selected = tabs.getByRole("tab", { name: "One" });
  assert.equal(selected.getAttribute("aria-selected"), "true");
  assert.equal(selected.tabIndex, 0);
  assert.equal(
    selected.getAttribute("aria-controls"),
    tabs.getByRole("tabpanel").id,
  );
  assert.equal(tabs.getByText("Second").hidden, true);
  tabs.unmount();
  const popup = render(
    React.createElement(
      Popover,
      {
        trigger: "Help",
        title: "Help",
        triggerProps: { "aria-expanded": true, "aria-controls": "wrong" },
        panelProps: { id: "actual-panel", role: "region", hidden: false },
      },
      "Details",
    ),
  );
  const trigger = popup.getByRole("button", { name: "Help" });
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  assert.equal(trigger.getAttribute("aria-controls"), "actual-panel");
  assert.equal(popup.getByText("Details").hidden, true);
  assert.equal(popup.getByText("Details").getAttribute("role"), "dialog");
});

test("avatar recovers from an image failure and attempts a changed source", () => {
  const view = render(
    React.createElement(Avatar, { name: "  Ada   Lovelace ", src: "/bad.png" }),
  );
  fireEvent.error(view.getByRole("img", { name: "Ada Lovelace" }));
  assert.equal(view.container.querySelector("img"), null);
  assert.equal(
    view.getByRole("img", { name: "Ada Lovelace" }).textContent,
    "AL",
  );
  view.rerender(
    React.createElement(Avatar, { name: "Ada Lovelace", src: "/new.png" }),
  );
  assert.equal(
    view.container.querySelector("img").getAttribute("src"),
    "/new.png",
  );
});

test("segmented control preserves a tab stop when the selected option is removed", () => {
  const changes = [];
  const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
  ];
  const view = render(
    React.createElement(SegmentedControl, {
      label: "Filter",
      value: "b",
      options,
      onChange: (next) => changes.push(next),
    }),
  );
  view.rerender(
    React.createElement(SegmentedControl, {
      label: "Filter",
      value: "b",
      options: [options[0]],
      onChange: (next) => changes.push(next),
    }),
  );
  const alpha = view.getByRole("radio", { name: "Alpha" });
  assert.equal(alpha.tabIndex, 0);
  assert.equal(alpha.getAttribute("aria-checked"), "false");
  assert.deepEqual(changes, []);
  fireEvent.keyDown(alpha, { key: "ArrowRight" });
  assert.deepEqual(changes, ["a"]);
});

test("toast pointer leave cannot restart dismissal while keyboard focus remains", () => {
  const pending = new Map();
  let id = 0;
  const originalSet = window.setTimeout,
    originalClear = window.clearTimeout;
  window.setTimeout = (callback) => {
    pending.set(++id, callback);
    return id;
  };
  window.clearTimeout = (timer) => pending.delete(timer);
  function Example() {
    const toast = useToast();
    return React.createElement(
      "button",
      { onClick: () => toast.show({ title: "Saved" }) },
      "Notify",
    );
  }
  try {
    const view = render(
      React.createElement(ToastProvider, null, React.createElement(Example)),
    );
    fireEvent.click(view.getByText("Notify"));
    const toast = view.getByText("Saved").closest("li");
    const close = view.getByRole("button", { name: "Dismiss notification" });
    assert.equal(pending.size, 1);
    fireEvent.focus(close);
    fireEvent.pointerEnter(toast);
    fireEvent.pointerLeave(toast);
    assert.equal(pending.size, 0);
    fireEvent.blur(close, { relatedTarget: document.body });
    assert.equal(pending.size, 1);
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    fireEvent(document, new Event("visibilitychange"));
    assert.equal(pending.size, 0);
    fireEvent.focus(close);
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    fireEvent(document, new Event("visibilitychange"));
    assert.equal(pending.size, 0);
    fireEvent.blur(close, { relatedTarget: document.body });
    assert.equal(pending.size, 1);
    act(() => [...pending.values()][0]());
    assert.equal(view.queryByText("Saved"), null);
    view.unmount();
  } finally {
    window.setTimeout = originalSet;
    window.clearTimeout = originalClear;
    delete document.visibilityState;
  }
});
