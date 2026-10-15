import ts from "typescript";
import { loadComponentGuides } from "./component-guides.mjs";
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
const authored = await loadComponentGuides();
assert.deepEqual(
  authored.components.map((guide) => guide.name).sort(),
  names,
  "Every core component needs an authored guide, not only discovered props",
);
const rows = names.map((name) => {
  return `| ${name} | [Component guide](COMPONENT-GUIDES.md#${name.toLowerCase()}) | Authored public contract; catalogue release is separate |`;
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
  "COMPONENT-GUIDES.md",
  "docs/component-guides.json",
  "DOCS.md",
  "FOUNDATION.md",
  "NEXTJS.md",
])
  await access(target);
const pkg = JSON.parse(await readFile("package.json", "utf8"));
for (const guide of [
  "COMBOBOX.md",
  "RECIPES.md",
  "GETTING-STARTED.md",
  "HOOKS.md",
  "HELPERS.md",
  "THREE.md",
  "PROP-REFERENCE.md",
  "MIGRATION.md",
  "MODELS.md",
  "SUPPORT.md",
  "MANUAL-QA.md",
]) {
  const text = await readFile(guide, "utf8");
  assert.ok(text.includes(pkg.version), `${guide} version`);
  assert.ok(text.includes("examples/reproduction"), `${guide} reproduction`);
  assert.ok(text.includes(`version=${pkg.version}`), `${guide} issue version`);
}
console.log(
  `${names.length} authored public core guides covered; optional entries and manual evidence remain separately bounded.`,
);

// Compile the exact public modules displayed/copied by the catalogue; discovery is
// not allowed to substitute for a runnable example using the documented export.
const options = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  noEmit: true,
  skipLibCheck: false,
};
const examples = authored.families.map((family) => family.example);
const exampleProgram = ts.createProgram(examples, options);
const diagnostics = ts.getPreEmitDiagnostics(exampleProgram);
assert.equal(
  diagnostics.length,
  0,
  ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCurrentDirectory: () => process.cwd(),
    getCanonicalFileName: (file) => file,
    getNewLine: () => "\n",
  }),
);
for (const guide of authored.components) {
  const family = authored.families.find((item) => item.id === guide.family);
  const file = exampleProgram.getSourceFile(family.example);
  let rendered = false;
  function inspect(node) {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText(file) === guide.name
    )
      rendered = true;
    ts.forEachChild(node, inspect);
  }
  inspect(file);
  assert.ok(
    rendered,
    `${guide.name} must render in its exact advertised family source`,
  );
}
console.log(
  `${examples.length} public family examples compile and render all ${authored.components.length} documented exports.`,
);
