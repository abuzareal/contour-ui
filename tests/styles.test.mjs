import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import postcss from "postcss";
test("isolated exports contain canonical tokens and no unscoped application/element rules", async () => {
  const schema = JSON.parse(await readFile("dist/tokens.json", "utf8"));
  const names = schema.tokens.map((token) => token.name);
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.every((name) => name.startsWith("--contour-")));
  assert.ok(
    !names.some((name) =>
      /--contour-(?:header|about|experience|expertise|work|footer)-/.test(name),
    ),
  );
  const css = postcss.parse(await readFile("dist/scoped/tokens.css", "utf8"));
  for (const token of schema.tokens) {
    const declarations = [];
    css.walkDecls(token.name, (decl) =>
      declarations.push(decl.value.replace(/\s+/g, " ").trim()),
    );
    assert.ok(
      declarations.includes(token.values.light.replace(/\s+/g, " ").trim()),
      token.name,
    );
    if (token.themeable)
      assert.ok(
        declarations.includes(token.values.dark.replace(/\s+/g, " ").trim()),
        token.name,
      );
  }
  for (const file of [
    "ui",
    "theme-toggle",
    ...[
      "actions",
      "forms",
      "navigation",
      "data-display",
      "feedback",
      "overlays",
      "effects",
    ].map((name) => "kit/" + name),
  ]) {
    const tree = postcss.parse(
      await readFile("dist/scoped/" + file + ".css", "utf8"),
    );
    tree.walkRules((rule) => {
      if (rule.parent.type === "atrule" && rule.parent.name === "keyframes")
        return;
      assert.ok(
        rule.selector.includes("contour-") && !rule.selector.includes(":root"),
        `${file} leaked ${rule.selector}`,
      );
      assert.ok(
        !/\.contour-(?:page-width|site-shell|split-layout|section-intro|section-space)\b/.test(
          rule.selector,
        ),
      );
    });
  }
  const band = await readFile("dist/scoped/kit/data-display.css", "utf8");
  assert.doesNotMatch(band, /var\(--contour-focus-band-/);
  assert.match(band, /var\(--contour-invert-bg\)/);
  const effects = await readFile("dist/effects.css", "utf8");
  assert.match(effects, /marquee\.css/);
  const reset = await readFile("dist/minimal-reset.css", "utf8");
  assert.doesNotMatch(
    reset,
    /\.page-width|\.site-shell|scroll-margin|font-family|background|--bg/,
  );
});
test("selective actions include required spinner styles and generated animations resolve", async () => {
  const entry = await readFile("dist/actions.css", "utf8");
  assert.match(entry, /spinner\.css/);
  assert.match(entry, /ui\.css/);
  const familyFiles = [
    "ui",
    "theme-toggle",
    "spinner",
    "marquee",
    ...[
      "actions",
      "forms",
      "navigation",
      "data-display",
      "feedback",
      "overlays",
      "effects",
    ].map((name) => "kit/" + name),
  ];
  const keyframes = new Set(),
    animationNames = [];
  for (const file of familyFiles) {
    const tree = postcss.parse(
      await readFile("dist/scoped/" + file + ".css", "utf8"),
    );
    tree.walkAtRules("keyframes", (rule) => keyframes.add(rule.params));
    tree.walkDecls(/^animation(?:-name)?$/, (decl) => {
      for (const name of decl.value
        .replace(/var\([^)]*\)/g, "")
        .match(/[a-zA-Z][\w-]*/g) ?? [])
        if (name.startsWith("contour-")) animationNames.push(name);
    });
  }
  for (const name of animationNames)
    assert.ok(keyframes.has(name), `Missing animation ${name}`);
});
