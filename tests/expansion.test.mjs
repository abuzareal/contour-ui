import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
const dom = new JSDOM("<html><body></body></html>", {
  url: "https://example.com",
  pretendToBeVisual: true,
});
for (const key of [
  "window",
  "document",
  "Node",
  "Element",
  "HTMLElement",
  "HTMLInputElement",
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
const { render, cleanup, fireEvent, act } =
  await import("@testing-library/react");
const { Combobox, Table, Popover } = await import("../dist/index.js");
const h = React.createElement;
afterEach(cleanup);
const options = [
  { value: "a", label: "Alpha" },
  { value: "c", label: "Café" },
];

test("Combobox exposes the native input and merges caller parts and descriptions", () => {
  const input = React.createRef(),
    part = React.createRef(),
    root = React.createRef();
  const view = render(
    h(Combobox, {
      ref: input,
      id: "project",
      label: "Project",
      hint: "Choose carefully",
      options,
      defaultValue: "a",
      inputProps: {
        ref: part,
        "aria-describedby": "context",
        "data-native": "yes",
      },
      rootProps: { ref: root, className: "host-root" },
    }),
  );
  const control = view.getByRole("combobox", { name: "Project", exact: true });
  assert.equal(input.current, control);
  assert.equal(part.current, control);
  assert.equal(root.current.classList.contains("host-root"), true);
  assert.match(
    control.getAttribute("aria-describedby"),
    /context project-hint project-search-status/,
  );
  assert.equal(control.value, "Alpha");
  view.unmount();
  assert.equal(input.current, null);
  assert.equal(part.current, null);
  assert.equal(root.current, null);
});

test("missing controlled IDs stay parent-owned, become invalid and serialize empty until resolved", () => {
  const changes = [];
  const props = {
    label: "Project",
    name: "project",
    value: "a",
    onValueChange: (value) => changes.push(value),
  };
  const view = render(h("form", null, h(Combobox, { ...props, options })));
  const form = view.container.querySelector("form");
  view.rerender(
    h("form", null, h(Combobox, { ...props, options: [options[1]] })),
  );
  const input = view.getByRole("combobox", { name: "Project", exact: true });
  assert.equal(input.checkValidity(), false);
  assert.equal(input.getAttribute("aria-invalid"), "true");
  assert.equal(new dom.window.FormData(form).get("project"), "");
  assert.deepEqual(changes, []);
  view.rerender(
    h(
      "form",
      null,
      h(Combobox, {
        ...props,
        options: [{ value: "a", label: "Alphabétique" }, options[1]],
      }),
    ),
  );
  assert.equal(input.value, "Alphabétique");
  assert.equal(input.checkValidity(), true);
  assert.equal(new dom.window.FormData(form).get("project"), "a");
  assert.deepEqual(changes, []);
});

test("prevented reset and readonly external form ownership preserve selection", async () => {
  const view = render(
    h(
      React.Fragment,
      null,
      h("form", { id: "owner", onReset: (event) => event.preventDefault() }),
      h(Combobox, {
        label: "Readonly",
        name: "choice",
        form: "owner",
        options,
        defaultValue: "c",
        readOnly: true,
      }),
    ),
  );
  const input = view.getByRole("combobox", { name: "Readonly", exact: true });
  const form = view.container.querySelector("form");
  assert.equal(input.readOnly, true);
  assert.equal(new dom.window.FormData(form).get("choice"), "c");
  await act(async () => {
    form.reset();
    await new Promise((r) => setTimeout(r, 5));
  });
  assert.equal(input.value, "Café");
  fireEvent.click(
    view.getByRole("button", { name: "Show choices", exact: true }),
  );
  assert.equal(input.getAttribute("aria-expanded"), "false");
});

test("Table owns one caption, preserves semantic children, native refs and scroll customization", () => {
  const table = React.createRef(),
    scroll = React.createRef();
  let clicks = 0;
  const view = render(
    h(
      Table,
      {
        ref: table,
        caption: "Records",
        showCaption: true,
        className: "host-table",
        scrollProps: {
          ref: scroll,
          "data-scroll": "yes",
          onClick: () => clicks++,
        },
      },
      h("thead", null, h("tr", null, h("th", { scope: "col" }, "Name"))),
      h("tbody", null, h("tr", null, h("td", null, "Ada"))),
    ),
  );
  assert.equal(
    view.getByRole("table", { name: "Records", exact: true }),
    table.current,
  );
  assert.equal(scroll.current.getAttribute("data-scroll"), "yes");
  assert.equal(table.current.classList.contains("host-table"), true);
  assert.equal(table.current.querySelectorAll("caption").length, 1);
  assert.equal(
    view.getByText("Records").classList.contains("contour-visually-hidden"),
    false,
  );
  fireEvent.click(view.getByText("Ada"));
  assert.equal(clicks, 1);
});

test("closed Combobox Escape preserves selection and reaches the enclosing layer", () => {
  const changes = [];
  const view = render(
    h(
      Popover,
      { trigger: "Open", title: "Parent", defaultOpen: true },
      h(Combobox, {
        label: "Selection",
        options,
        defaultValue: "c",
        onValueChange: (value) => changes.push(value),
      }),
    ),
  );
  const input = view.getByRole("combobox", { name: "Selection", exact: true });
  fireEvent.keyDown(input, { key: "Escape" });
  assert.equal(
    view
      .getByRole("button", { name: "Open", exact: true })
      .getAttribute("aria-expanded"),
    "false",
  );
  assert.deepEqual(changes, []);
  assert.equal(input.value, "Café");
});
