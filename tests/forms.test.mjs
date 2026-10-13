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
  "HTMLElement",
  "HTMLInputElement",
  "HTMLFieldSetElement",
  "Event",
  "MutationObserver",
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
const {
  Switch,
  Slider,
  RadioGroup,
  Checkbox,
  TextField,
  TextArea,
  SelectField,
} = await import("../dist/index.js");
const h = React.createElement;
afterEach(cleanup);
const entries = (form) => [...new dom.window.FormData(form).entries()];
const waitReset = async (form) =>
  act(async () => {
    form.reset();
    await new Promise((resolve) => setTimeout(resolve, 5));
  });
const options = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "blocked", label: "Blocked", disabled: true },
];

test("named Switch submits only checked enabled values, preserves its native ref and label", () => {
  const ref = React.createRef();
  const changes = [];
  const view = render(
    h(
      "form",
      null,
      h(Switch, {
        ref,
        id: "updates",
        label: "Updates",
        name: "updates",
        value: "yes",
        defaultChecked: true,
        onChange: (value) => changes.push(value),
        description: "Product updates",
      }),
    ),
  );
  const form = view.container.querySelector("form");
  const button = view.getByRole("switch", { name: "Updates" });
  assert.deepEqual(entries(form), [["updates", "yes"]]);
  assert.equal(ref.current, button);
  assert.equal(button.id, "updates");
  assert.equal(view.getByText("Updates").closest("label").htmlFor, "updates");
  fireEvent.click(button);
  assert.equal(button.getAttribute("aria-checked"), "false");
  assert.deepEqual(entries(form), []);
  assert.deepEqual(changes, [false]);
  fireEvent.click(button);
  assert.deepEqual(entries(form), [["updates", "yes"]]);
  view.rerender(
    h(
      "form",
      null,
      h(Switch, {
        ref,
        label: "Updates",
        name: "updates",
        defaultChecked: true,
        disabled: true,
      }),
    ),
  );
  assert.deepEqual(entries(form), []);
  view.unmount();
  assert.equal(ref.current, null);
});

test("named Slider submits its native numeric value and keeps formatted readout and range ref", () => {
  const ref = React.createRef();
  const values = [];
  const view = render(
    h(
      "form",
      null,
      h(Slider, {
        ref,
        id: "level",
        label: "Level",
        name: "level",
        defaultValue: 20,
        min: 0,
        max: 100,
        step: 5,
        format: (value) => `${value}%`,
        onChange: (value) => values.push(value),
      }),
    ),
  );
  const input = view.getByRole("slider");
  const form = view.container.querySelector("form");
  assert.deepEqual(entries(form), [["level", "20"]]);
  assert.equal(ref.current, input);
  assert.equal(input.id, "level");
  assert.equal(input.getAttribute("aria-valuetext"), "20%");
  fireEvent.change(input, { target: { value: "35" } });
  assert.deepEqual(entries(form), [["level", "35"]]);
  assert.deepEqual(values, [35]);
  assert.ok(view.getByText("35%"));
  view.rerender(
    h(
      "form",
      null,
      h(Slider, {
        label: "Level",
        name: "level",
        defaultValue: 20,
        disabled: true,
      }),
    ),
  );
  assert.deepEqual(entries(form), []);
});

test("RadioGroup accepts stable names, option refs/IDs, defaults and native required/disabled semantics", () => {
  const ref = React.createRef();
  const values = [];
  const items = [
    {
      ...options[0],
      inputProps: { ref, id: "contact-email", "aria-describedby": "context" },
    },
    ...options.slice(1),
  ];
  const view = render(
    h(
      "form",
      null,
      h(RadioGroup, {
        legend: "Contact",
        name: "contact",
        options: items,
        defaultValue: "email",
        required: true,
        onChange: (value) => values.push(value),
        description: "Choose a channel",
        error: "Pick an available channel",
      }),
      h(RadioGroup, {
        legend: "Other",
        name: "other",
        options,
        defaultValue: "phone",
      }),
    ),
  );
  const form = view.container.querySelector("form");
  assert.deepEqual(entries(form), [
    ["contact", "email"],
    ["other", "phone"],
  ]);
  assert.equal(ref.current.id, "contact-email");
  assert.equal(ref.current.required, true);
  assert.equal(ref.current.getAttribute("aria-invalid"), "true");
  assert.ok(ref.current.getAttribute("aria-describedby").includes("context"));
  const contact = view.getByRole("group", { name: "Contact" });
  fireEvent.click(contact.querySelector('input[value="phone"]'));
  assert.deepEqual(entries(form), [
    ["contact", "phone"],
    ["other", "phone"],
  ]);
  assert.deepEqual(values, ["phone"]);
  view.rerender(
    h(
      "form",
      null,
      h(RadioGroup, {
        legend: "Contact",
        name: "contact",
        options,
        defaultValue: "blocked",
        disabled: true,
      }),
    ),
  );
  assert.deepEqual(entries(form), []);
  view.unmount();
  assert.equal(ref.current, null);
});

test("uncontrolled form owners reset choices/readouts without change notifications and honor cancellation", async () => {
  for (const external of [false, true]) {
    const changes = [];
    const props = {
      form: external ? "owner" : undefined,
      onChange: (value) => changes.push(value),
    };
    const controls = h(
      React.Fragment,
      null,
      h(Switch, {
        ...props,
        name: "updates",
        label: "Updates",
        defaultChecked: true,
      }),
      h(Slider, { ...props, name: "level", label: "Level", defaultValue: 20 }),
      h(RadioGroup, {
        ...props,
        name: "contact",
        legend: "Contact",
        options,
        defaultValue: "email",
      }),
    );
    const view = render(
      h(
        "div",
        null,
        h("form", { id: "owner" }, external ? null : controls),
        external ? controls : null,
      ),
    );
    const form = view.container.querySelector("form");
    assert.deepEqual(entries(form), [
      ["updates", "on"],
      ["level", "20"],
      ["contact", "email"],
    ]);
    fireEvent.click(view.getByRole("switch"));
    fireEvent.change(view.getByRole("slider"), { target: { value: "70" } });
    fireEvent.click(view.getByRole("radio", { name: "Phone" }));
    const count = changes.length;
    assert.deepEqual(entries(form), [
      ["level", "70"],
      ["contact", "phone"],
    ]);
    form.addEventListener("reset", (event) => event.preventDefault(), {
      once: true,
    });
    await waitReset(form);
    assert.deepEqual(entries(form), [
      ["level", "70"],
      ["contact", "phone"],
    ]);
    await waitReset(form);
    assert.deepEqual(entries(form), [
      ["updates", "on"],
      ["level", "20"],
      ["contact", "email"],
    ]);
    assert.equal(view.getByRole("switch").getAttribute("aria-checked"), "true");
    assert.ok(view.getByText("20"));
    assert.equal(changes.length, count);
    view.unmount();
  }
});

test("controlled reset retains parent values and only explicit parent updates reset them", async () => {
  const changes = [];
  const base = { onChange: (value) => changes.push(value) };
  const controls = (checked, value, contact) =>
    h(
      React.Fragment,
      null,
      h(Switch, {
        ...base,
        name: "updates",
        label: "Updates",
        checked,
        defaultChecked: false,
      }),
      h(Slider, {
        ...base,
        name: "level",
        label: "Level",
        value,
        defaultValue: 10,
      }),
      h(RadioGroup, {
        ...base,
        name: "contact",
        legend: "Contact",
        options,
        value: contact,
        defaultValue: "email",
      }),
    );
  const view = render(h("form", null, controls(true, 70, "phone")));
  const form = view.container.querySelector("form");
  await waitReset(form);
  assert.deepEqual(entries(form), [
    ["updates", "on"],
    ["level", "70"],
    ["contact", "phone"],
  ]);
  assert.equal(view.getByRole("switch").getAttribute("aria-checked"), "true");
  assert.ok(view.getByText("70"));
  assert.deepEqual(changes, []);
  fireEvent.click(view.getByRole("switch"));
  assert.deepEqual(changes, [false]);
  assert.deepEqual(entries(form), [
    ["updates", "on"],
    ["level", "70"],
    ["contact", "phone"],
  ]);
  view.rerender(h("form", null, controls(false, 10, "email")));
  await waitReset(form);
  assert.deepEqual(entries(form), [
    ["level", "10"],
    ["contact", "email"],
  ]);
});

test("form-owner changes, disabled fieldsets, disabled selected options and cleanup use native semantics", async () => {
  const props = (form) => ({
    form,
    name: "level",
    label: "Level",
    defaultValue: 20,
  });
  const view = render(
    h(
      "div",
      null,
      h("form", { id: "a" }),
      h("form", { id: "b" }),
      h(Slider, props("a")),
    ),
  );
  fireEvent.change(view.getByRole("slider"), { target: { value: "65" } });
  view.rerender(
    h(
      "div",
      null,
      h("form", { id: "a" }),
      h("form", { id: "b" }),
      h(Slider, props("b")),
    ),
  );
  await waitReset(document.getElementById("a"));
  assert.equal(view.getByRole("slider").value, "65");
  await waitReset(document.getElementById("b"));
  assert.equal(view.getByRole("slider").value, "20");
  view.unmount();
  const disabled = render(
    h(
      "form",
      null,
      h(
        "fieldset",
        { disabled: true },
        h(Switch, { label: "Updates", name: "updates", defaultChecked: true }),
        h(Slider, { label: "Level", name: "level", defaultValue: 20 }),
        h(RadioGroup, {
          legend: "Contact",
          name: "contact",
          options,
          defaultValue: "email",
        }),
      ),
    ),
  );
  assert.deepEqual(entries(disabled.container.querySelector("form")), []);
  disabled.unmount();
  const selected = render(
    h(
      "form",
      null,
      h(RadioGroup, {
        legend: "Contact",
        name: "contact",
        options,
        value: "blocked",
        onChange() {},
      }),
    ),
  );
  assert.deepEqual(entries(selected.container.querySelector("form")), []);
  selected.unmount();
  const additions = [],
    removals = [];
  const add = document.addEventListener.bind(document),
    remove = document.removeEventListener.bind(document);
  document.addEventListener = (...args) => {
    if (args[0] === "reset") additions.push(args[1]);
    return add(...args);
  };
  document.removeEventListener = (...args) => {
    if (args[0] === "reset") removals.push(args[1]);
    return remove(...args);
  };
  try {
    const mounted = render(h(Slider, { label: "Level", defaultValue: 20 }));
    mounted.unmount();
    assert.ok(additions.length);
    assert.deepEqual(removals, additions);
  } finally {
    document.addEventListener = add;
    document.removeEventListener = remove;
  }
});

test("caller IDs/descriptions/required/ref and zero limits remain intact for native fields and Checkbox", () => {
  for (const Component of [TextField, TextArea, SelectField, Checkbox]) {
    const ref = React.createRef();
    const checkbox = Component === Checkbox;
    const props = {
      ref,
      label: "Control",
      id: "control",
      name: "control",
      required: true,
      "aria-describedby": "external",
      error: "Invalid",
      maxLength:
        Component === TextField || Component === TextArea ? 0 : undefined,
      options:
        Component === SelectField
          ? [{ value: "one", label: "One" }]
          : undefined,
    };
    const view = render(h(Component, props));
    assert.equal(ref.current.id, "control");
    assert.equal(ref.current.required, true);
    assert.equal(ref.current.getAttribute("aria-invalid"), "true");
    assert.ok(
      ref.current.getAttribute("aria-describedby").includes("external"),
    );
    assert.equal(view.getByText("Control").closest("label").htmlFor, "control");
    if (!checkbox && Component !== SelectField)
      assert.ok(view.getByText("0/0"));
    view.unmount();
    assert.equal(ref.current, null);
  }
});

test("controlled native fields retain parent values after updates and form reset", async () => {
  for (const Component of [TextField, TextArea, SelectField, Checkbox]) {
    const ref = React.createRef();
    const checkbox = Component === Checkbox;
    const props = (value) => ({
      ref,
      name: "field",
      label: "Field",
      onChange() {},
      value: checkbox ? "on" : value,
      checked: checkbox ? value === "first" : undefined,
      options:
        Component === SelectField
          ? [
              { value: "first", label: "First" },
              { value: "second", label: "Second" },
            ]
          : undefined,
    });
    const view = render(h("form", null, h(Component, props("first"))));
    view.rerender(h("form", null, h(Component, props("second"))));
    await waitReset(view.container.querySelector("form"));
    assert.deepEqual(
      entries(view.container.querySelector("form")),
      checkbox ? [] : [["field", "second"]],
    );
    if (checkbox) assert.equal(ref.current.checked, false);
    else assert.equal(ref.current.value, "second");
    view.unmount();
  }
});

test("uncontrolled radio selection and captured defaults survive unrelated prop updates", async () => {
  const view = render(
    h(
      "form",
      null,
      h(RadioGroup, {
        name: "contact",
        legend: "Contact",
        options,
        defaultValue: "email",
      }),
    ),
  );
  fireEvent.click(view.getByRole("radio", { name: "Phone" }));
  view.rerender(
    h(
      "form",
      null,
      h(RadioGroup, {
        name: "contact",
        legend: "Contact",
        options: [...options],
        defaultValue: "phone",
        error: "Service unavailable",
      }),
    ),
  );
  assert.equal(view.getByRole("radio", { name: "Phone" }).checked, true);
  assert.deepEqual(entries(view.container.querySelector("form")), [
    ["contact", "phone"],
  ]);
  await waitReset(view.container.querySelector("form"));
  assert.equal(view.getByRole("radio", { name: "Email" }).checked, true);
});

test("controlled multiple-select reset restores each parent-selected option", async () => {
  const items = [
    { value: "first", label: "First" },
    { value: "second", label: "Second" },
    { value: "third", label: "Third" },
  ];
  const view = render(
    h(
      "form",
      null,
      h(SelectField, {
        name: "choices",
        label: "Choices",
        multiple: true,
        options: items,
        value: ["first"],
        onChange() {},
      }),
    ),
  );
  view.rerender(
    h(
      "form",
      null,
      h(SelectField, {
        name: "choices",
        label: "Choices",
        multiple: true,
        options: items,
        value: ["second", "third"],
        onChange() {},
      }),
    ),
  );
  await waitReset(view.container.querySelector("form"));
  assert.deepEqual(entries(view.container.querySelector("form")), [
    ["choices", "second"],
    ["choices", "third"],
  ]);
});

test("uncontrolled Switch FormData is current inside its value callback and clicks can be vetoed", () => {
  let form;
  const snapshots = [];
  const view = render(
    h(
      "form",
      null,
      h(Switch, {
        name: "updates",
        label: "Updates",
        defaultChecked: false,
        onChange: (value) => snapshots.push([value, entries(form)]),
      }),
    ),
  );
  form = view.container.querySelector("form");
  fireEvent.click(view.getByRole("switch"));
  assert.deepEqual(snapshots, [[true, [["updates", "on"]]]]);
  view.rerender(
    h(
      "form",
      null,
      h(Switch, {
        name: "updates",
        label: "Updates",
        onClick: (event) => event.preventDefault(),
        onChange: (value) => snapshots.push([value, entries(form)]),
      }),
    ),
  );
  fireEvent.click(view.getByRole("switch"));
  assert.equal(snapshots.length, 1);
  assert.deepEqual(entries(form), [["updates", "on"]]);
});
