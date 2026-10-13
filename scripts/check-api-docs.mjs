import ts from "typescript";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
const config = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(
  config.config,
  ts.sys,
  process.cwd(),
);
const program = ts.createProgram(parsed.fileNames, parsed.options),
  checker = program.getTypeChecker();
const entries = {
  ".": ["src/index.ts", "dist/index.js"],
  "./three": ["src/three.ts", "dist/three.js"],
  "./scroll": ["src/scroll.ts", "dist/scroll.js"],
  "./theme-bootstrap": [
    "src/lib/themeBootstrap.ts",
    "dist/lib/themeBootstrap.js",
  ],
};
const pkg = JSON.parse(await readFile("package.json", "utf8"));
const inventory = [];
for (const [entry, [sourcePath, runtimePath]] of Object.entries(entries)) {
  const file = program.getSourceFile(resolve(sourcePath));
  assert.ok(file, sourcePath);
  const module = checker.getSymbolAtLocation(file);
  assert.ok(module, entry);
  const runtime = await import(pathToFileURL(resolve(runtimePath)).href);
  for (const exported of checker.getExportsOfModule(module)) {
    const target =
      exported.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(exported)
        : exported;
    const declaration = target.getDeclarations()?.[0];
    assert.ok(declaration, exported.name);
    const source = declaration.getSourceFile();
    const path = relative(process.cwd(), source.fileName);
    assert.ok(
      path.startsWith("src/"),
      `Unexpected external public declaration ${exported.name}`,
    );
    const line =
      source.getLineAndCharacterOfPosition(declaration.getStart()).line + 1;
    inventory.push({
      entry,
      name: exported.name,
      kind: Object.hasOwn(runtime, exported.name) ? "runtime" : "type",
      path,
      line,
    });
  }
  for (const name of Object.keys(runtime))
    assert.ok(
      inventory.some(
        (row) =>
          row.entry === entry && row.name === name && row.kind === "runtime",
      ),
      `Missing declaration ${name}`,
    );
}
const tick = String.fromCharCode(96);
const sourceLink = (row) =>
  "[" +
  tick +
  row.name +
  tick +
  "](https://github.com/abuzareal/contour-ui/blob/v" +
  pkg.version +
  "/" +
  row.path +
  "#L" +
  row.line +
  ")";
let docs = await readFile("PUBLIC-API.md", "utf8");
if (process.argv.includes("--write")) {
  docs = docs.replace(
    /https:\/\/github\.com\/abuzareal\/contour-ui\/blob\/v[\d.]+\/([^)#]+)#L\d+/g,
    (url, path) => {
      const name = /\[`([^`]+)`\]\($/.exec(
        docs.slice(0, docs.indexOf(url)),
      )?.[1];
      const row = inventory.find(
        (row) => row.name === name && row.path === path,
      );
      return row
        ? `https://github.com/abuzareal/contour-ui/blob/v${pkg.version}/${row.path}#L${row.line}`
        : url.replace(/\/v[\d.]+\//, `/v${pkg.version}/`);
    },
  );
  // Resolve all existing symbol rows directly; paths can move while the export name stays stable.
  docs = docs.replace(
    /\[`([^`]+)`\]\(https:\/\/github\.com\/abuzareal\/contour-ui\/blob\/v[\d.]+\/(src\/[^)#]+)#L\d+\)/g,
    (_, name, path) => {
      const row =
        inventory.find((row) => row.name === name && row.path === path) ??
        inventory.find((row) => row.name === name);
      assert.ok(row, `Unknown documented symbol ${name}`);
      return sourceLink(row);
    },
  );
  const newRows = inventory.filter(
    (row) => !docs.includes("[" + tick + row.name + tick + "]("),
  );
  if (newRows.length) {
    docs +=
      "\n## Additions in " +
      pkg.version +
      "\n\n| Export / source | Kind | Maintainer | Status | Contract and limits | Evidence |\n| --- | --- | --- | --- | --- | --- |\n";
    for (const row of newRows)
      docs +=
        "| " +
        sourceLink(row) +
        " | " +
        row.kind +
        " | @abuzareal | " +
        (row.name.includes("Floating") || row.name.includes("PanelFocus")
          ? "experimental"
          : "stable (0.x)") +
        " | " +
        (row.name === "ThemeScope"
          ? "Controlled native-div theme scope; caller owns persistence; scoped CSS required."
          : row.name === "ccx"
            ? "Prefixed and compatibility class hooks; cx remains unchanged for IDs/arbitrary strings."
            : "Defining module contract; type-only values are not runtime exports.") +
        " | Declarations, packed consumers and overlay/style fixtures |\n";
  }

  const core = inventory.filter((row) => row.entry === ".");
  docs = docs.replace(
    /\d+ runtime exports; \d+ type-only exports\./,
    `${core.filter((row) => row.kind === "runtime").length} runtime exports; ${core.filter((row) => row.kind === "type").length} type-only exports.`,
  );
  await writeFile("PUBLIC-API.md", docs);
}
for (const row of inventory)
  assert.ok(
    docs.includes(sourceLink(row)),
    `Stale/missing source link: ${row.name} ${row.path}:${row.line}`,
  );
if (process.env.CONTOUR_API_INVENTORY)
  await writeFile(
    process.env.CONTOUR_API_INVENTORY,
    JSON.stringify(
      {
        version: pkg.version,
        exports: inventory,
        styleExports: Object.entries(pkg.exports).filter(
          ([name]) => name.endsWith(".css") || name.endsWith(".json"),
        ),
      },
      null,
      2,
    ) + "\n",
  );
console.log(
  `Public documentation matches ${inventory.length} runtime/type symbols.`,
);
