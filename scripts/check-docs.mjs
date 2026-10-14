import ts from "typescript";
import assert from "node:assert/strict";
import { readFile, writeFile, access } from "node:fs/promises";
const source = await readFile("src/index.ts", "utf8");
const file = ts.createSourceFile(
  "src/index.ts",
  source,
  ts.ScriptTarget.Latest,
  true,
);
const names = [];
for (const statement of file.statements) {
  if (
    !ts.isExportDeclaration(statement) ||
    statement.isTypeOnly ||
    !statement.moduleSpecifier ||
    !ts.isStringLiteral(statement.moduleSpecifier) ||
    !statement.moduleSpecifier.text.startsWith("./components/") ||
    !statement.exportClause ||
    !ts.isNamedExports(statement.exportClause)
  )
    continue;
  for (const element of statement.exportClause.elements)
    if (!element.isTypeOnly) names.push(element.name.text);
}
names.sort();
assert.ok(names.length >= 49);
assert.equal(new Set(names).size, names.length);
const groups = {
  "FORMS.md": [
    "Checkbox",
    "RadioGroup",
    "SelectField",
    "Slider",
    "Switch",
    "TextArea",
    "TextField",
    "Field",
  ],
  "OVERLAYS.md": ["Dialog", "DropdownMenu", "Popover", "Tooltip"],
  "COMPOSITION.md": [
    "Button",
    "DepthButton",
    "ExternalLink",
    "IconButton",
    "Tabs",
  ],
  "GETTING-STARTED.md": ["ThemeScope", "ThemeToggle"],
  "RECIPES.md": ["DataTable", "Table"],
  "COMBOBOX.md": ["Combobox"],
};
const rows = names.map((name) => {
  const guide =
    Object.entries(groups).find(([, items]) => items.includes(name))?.[0] ??
    "PUBLIC-API.md";
  const complete = ["Combobox", "Table"].includes(name);
  return `| ${name} | [${guide}](${guide}) | ${complete ? "New component contract covered" : "Shared; promotion pending"} |`;
});
let docs = await readFile("DOCS.md", "utf8");
const start = "<!-- component-coverage:start -->",
  end = "<!-- component-coverage:end -->";
const table =
  "\n\n| Component | Public reference | Coverage |\n| --- | --- | --- |\n" +
  rows.join("\n") +
  "\n\n";
if (process.argv.includes("--write")) {
  docs =
    docs.slice(0, docs.indexOf(start) + start.length) +
    table +
    docs.slice(docs.indexOf(end));
  await writeFile("DOCS.md", docs);
}
for (const name of names)
  assert.match(
    docs,
    new RegExp(`\\| ${name} +\\|`),
    `Missing component coverage: ${name}`,
  );
for (const target of [
  ...Object.keys(groups),
  "PUBLIC-API.md",
  "DOCS.md",
  "FOUNDATION.md",
  "NEXTJS.md",
])
  await access(target);
const pkg = JSON.parse(await readFile("package.json", "utf8"));
for (const guide of ["COMBOBOX.md", "RECIPES.md", "GETTING-STARTED.md"]) {
  const text = await readFile(guide, "utf8");
  assert.ok(text.includes(pkg.version), `${guide} version`);
  assert.ok(text.includes("examples/reproduction"), `${guide} reproduction`);
  assert.ok(text.includes(`version=${pkg.version}`), `${guide} issue version`);
}
console.log(
  `${names.length} public UI component references covered; unpromoted guide gaps remain explicit.`,
);
