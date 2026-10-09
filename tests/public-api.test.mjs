import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as ui from "../dist/index.js";

test("public entry imports on the server without browser globals", () => {
  assert.equal(typeof window, "undefined");
  for (const name of [
    "Button",
    "Dialog",
    "ThemeToggle",
    "ToastProvider",
    "useTheme",
  ]) {
    assert.equal(typeof ui[name], "function", name);
  }
  assert.equal(ui.TextField.$$typeof, Symbol.for("react.forward_ref"));
  assert.equal(ui.Sculpture, undefined);
  assert.equal(ui.useSmoothScroll, undefined);
});

test("text props are escaped and external links protect the opener", () => {
  const markup = renderToStaticMarkup(
    React.createElement(
      ui.ExternalLink,
      { href: "https://example.com" },
      "<script>alert(1)</script>",
    ),
  );
  assert.match(markup, /rel="noopener noreferrer"/);
  assert.match(markup, /&lt;script&gt;/);
  assert.doesNotMatch(markup, /<script>/);
});

test("executable URLs, including whitespace-obfuscated schemes, are rejected", () => {
  for (const href of [
    "javascript:alert(1)",
    " JAVASCRIPT:alert(1)",
    "java\nscript:alert(1)",
    "data:text/html,<script>x</script>",
    "vbscript:x",
  ]) {
    assert.equal(ui.safeHref(href), undefined, href);
    const markup = renderToStaticMarkup(
      React.createElement(ui.ExternalLink, { href }, "Link"),
    );
    assert.doesNotMatch(markup, /href=/);
  }
  for (const href of [
    "https://example.com",
    "/page",
    "#section",
    "mailto:a@example.com",
    "tel:+123",
  ]) {
    assert.equal(ui.safeHref(href), href);
  }
});

test("empty navigation and zero-range sliders render safely", () => {
  assert.equal(ui.nextIndexForKey("ArrowRight", 0, 0), null);
  const slider = renderToStaticMarkup(
    React.createElement(ui.Slider, {
      label: "Range",
      min: 10,
      max: 10,
      value: 10,
      onChange() {},
    }),
  );
  assert.doesNotMatch(slider, /NaN|Infinity/);
  const theme = renderToStaticMarkup(
    React.createElement(ui.ThemeToggle, { animate: false }),
  );
  assert.match(theme, /aria-pressed="false"/);
});
