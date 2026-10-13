import assert from "node:assert/strict";
import { readFile, writeFile as saveFile, mkdir } from "node:fs/promises";
import postcss from "postcss";
const checking = process.argv.includes("--check");
async function writeFile(path, text) {
  if (checking)
    assert.equal(
      await readFile(path, "utf8"),
      text,
      `Generated output drifted: ${path}. Run npm run build:styles and commit the result.`,
    );
  else await saveFile(path, text);
}
const schema = JSON.parse(await readFile("tokens/schema.json", "utf8"));
await mkdir("styles/scoped/kit", { recursive: true });
const declarations = (tokens, theme) =>
  tokens.map((token) => `  ${token.name}: ${token.values[theme]};`).join("\n");
await writeFile(
  "styles/scoped/tokens.css",
  `/* Generated from tokens/schema.json by scripts/build-styles.mjs. */\n:where(:root) {\n${declarations(schema.tokens, "light")}\n}\n:where(:root[data-theme="dark"], [data-contour-theme="dark"]) {\n${declarations(
    schema.tokens.filter((t) => t.themeable),
    "dark",
  )}\n  color-scheme: dark;\n}\n:where([data-contour-theme="light"]) {\n${declarations(
    schema.tokens.filter((t) => t.themeable),
    "light",
  )}\n  color-scheme: light;\n}\n`,
);
const semanticMigration = {
  "focus-band-bg": "invert-bg",
  "focus-band-fg": "invert-fg",
  "focus-band-icon": "inverse-accent",
};
const runtime = new Set([
  "progress",
  "indicator-left",
  "indicator-width",
  "scroll-progress",
  "tilt-x",
  "tilt-y",
]);
const families = [
  "actions",
  "forms",
  "navigation",
  "data-display",
  "feedback",
  "overlays",
  "effects",
];
const classes = new Set();
const animationNames = new Set();
for (const file of [
  "ui.css",
  "theme-toggle.css",
  ...families.map((name) => `kit/${name}.css`),
]) {
  const css = postcss.parse(await readFile(`styles/${file}`, "utf8"));
  css.walkAtRules("keyframes", (rule) => animationNames.add(rule.params));
}

for (const file of [
  "ui.css",
  "theme-toggle.css",
  ...families.map((name) => `kit/${name}.css`),
]) {
  const tree = postcss.parse(await readFile(`styles/${file}`, "utf8"));
  tree.walkAtRules("import", (rule) => rule.remove());
  tree.walkRules((rule) => {
    if (/section-space|split-layout|section-intro|:root/.test(rule.selector)) {
      rule.remove();
      return;
    }
    if (rule.selector === "input,\nselect,\ntextarea")
      rule.selector =
        ".field-control input, .field-control select, .field-control textarea";
    rule.selector = rule.selector.replace(/\.([a-zA-Z][\w-]*)/g, (_, name) => {
      classes.add(name);
      return `.contour-${name}`;
    });
  });
  tree.walkAtRules(
    "keyframes",
    (rule) => (rule.params = `contour-${rule.params}`),
  );
  tree.walkDecls((decl) => {
    if (decl.prop.startsWith("--"))
      decl.prop = decl.prop.replace("--", "--contour-");
    decl.value = decl.value.replace(/var\(--([\w-]+)\)/g, (_, name) =>
      runtime.has(name)
        ? `var(--contour-${name}, var(--${name}))`
        : `var(--contour-${semanticMigration[name] ?? name})`,
    );
    if (/animation/.test(decl.prop))
      decl.value = decl.value.replace(/[a-zA-Z][\w-]*/g, (name) =>
        animationNames.has(name) ? `contour-${name}` : name,
      );
    const logical = {
      "margin-left": "margin-inline-start",
      "margin-right": "margin-inline-end",
      "padding-left": "padding-inline-start",
      "padding-right": "padding-inline-end",
      "border-left": "border-inline-start",
      "border-right": "border-inline-end",
    };
    decl.prop = logical[decl.prop] ?? decl.prop;
    if (decl.prop === "text-align" && ["left", "right"].includes(decl.value))
      decl.value = decl.value === "left" ? "start" : "end";
  });
  // Scope theme-dependent component values through inherited tokens, never root selectors.
  tree.walkRules((rule) => {
    if (rule.selector === ".contour-avatar-initials")
      rule.walkDecls("color", (d) => {
        d.value = "var(--contour-inverse-mark)";
      });
    if (rule.selector === ".contour-alert-banner")
      rule.walkDecls("--contour-alert-accent", (d) => {
        d.value = "var(--contour-inverse-accent)";
      });
    if (rule.selector === ".contour-depth-button")
      rule.walkDecls("background", (d) => {
        d.value = "var(--contour-depth-base)";
      });
    if (rule.selector === ".contour-toast")
      rule.append({
        prop: "border",
        value: "1px solid var(--contour-floating-outline)",
      });
  });
  await writeFile(`styles/scoped/${file}`, tree.toString());
}
const spinner = postcss.parse(
  await readFile("styles/scoped/kit/feedback.css", "utf8"),
);
spinner.walkRules((rule) => {
  if (rule.parent.type === "atrule" && rule.parent.name === "keyframes") return;
  if (!rule.selector.includes(".contour-spinner")) rule.remove();
});
spinner.walkAtRules((rule) => {
  if (rule.name === "keyframes" && !rule.params.includes("spinner"))
    rule.remove();
});
await writeFile("styles/scoped/spinner.css", spinner.toString());
const marquee = postcss.parse(
  await readFile("styles/scoped/kit/data-display.css", "utf8"),
);
marquee.walkRules((rule) => {
  if (rule.parent.type === "atrule" && rule.parent.name === "keyframes") return;
  if (!rule.selector.includes(".contour-marquee")) rule.remove();
});
marquee.walkAtRules((rule) => {
  if (rule.name === "keyframes" && !rule.params.includes("marquee"))
    rule.remove();
});
await writeFile("styles/scoped/marquee.css", marquee.toString());
const utility = postcss.parse(await readFile("styles/styles.css", "utf8"));
utility.walkAtRules("import", (rule) => rule.remove());
utility.walkRules((rule) => {
  rule.selector = rule.selector.replace(/\.([a-zA-Z][\w-]*)/g, (_, name) => {
    classes.add(name);
    return `.contour-${name}`;
  });
});
utility.walkDecls((decl) => {
  decl.value = decl.value.replace(/var\(--([\w-]+)\)/g, "var(--contour-$1)");
});
await writeFile("styles/scoped/utilities.css", utility.toString());
// Known legacy class aliases retain old consumer overrides; unknown classes remain untouched.
for (const file of ["styles.css", "motion.css", "reset.css"]) {
  const source = await readFile(`styles/${file}`, "utf8");
  for (const match of source.matchAll(/\.([a-zA-Z][\w-]*)/g))
    classes.add(match[1]);
}
async function componentNames(directory) {
  for (const entry of await (
    await import("node:fs/promises")
  ).readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await componentNames(path);
    else if (path.endsWith(".tsx")) {
      const text = await readFile(path, "utf8");
      for (const match of text.matchAll(/ccx\(\s*["']([^"']+)["']/g))
        for (const name of match[1].split(/\s+/))
          if (name && !name.startsWith("contour-")) classes.add(name);
    }
  }
}
await componentNames("src/components");
await writeFile(
  "src/lib/componentClasses.ts",
  `// Generated compatibility aliases; unknown consumer classes pass through unchanged.\nexport const componentClasses = new Set(${JSON.stringify([...classes].sort())});\n`,
);
for (const family of families)
  await writeFile(
    `styles/${family}.css`,
    `@import "./scoped/tokens.css";\n@import "./scoped/base.css";\n@import "./scoped/utilities.css";\n@import "./scoped/ui.css";\n@import "./scoped/kit/${family}.css";\n${family === "effects" ? '@import "./scoped/marquee.css";\n' : ""}${family === "actions" ? '@import "./scoped/theme-toggle.css";\n@import "./scoped/spinner.css";\n' : ""}`,
  );
await writeFile(
  "styles/scoped.css",
  `@import "./scoped/tokens.css";\n@import "./scoped/base.css";\n@import "./scoped/utilities.css";\n@import "./scoped/ui.css";\n${families.map((name) => `@import "./scoped/kit/${name}.css";`).join("\n")}\n@import "./scoped/theme-toggle.css";\n`,
);
await writeFile("styles/scoped-tokens.css", '@import "./scoped/tokens.css";\n');
console.log(
  `${checking ? "Verified" : "Generated"} isolated CSS from ${schema.tokens.length} canonical tokens.`,
);
