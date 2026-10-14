import ts from "typescript";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdtemp, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
const write = process.argv.includes("--write");
const pkg = JSON.parse(await readFile("package.json", "utf8"));
const temporary = await mkdtemp(join(tmpdir(), "contour-reference-"));
let inventory;
try {
  const path = join(temporary, "api.json");
  execFileSync(process.execPath, ["scripts/check-api-docs.mjs"], {
    stdio: "inherit",
    env: { ...process.env, CONTOUR_API_INVENTORY: path },
  });
  inventory = JSON.parse(await readFile(path, "utf8"));
} finally {
  await rm(temporary, { recursive: true, force: true });
}
const hookAnchors = {
  useTheme: "theme",
  useMotionPreference: "motion",
  useClipboardCopy: "clipboard",
  useDismiss: "dismissal-and-mobile-menus",
  useMobileMenu: "dismissal-and-mobile-menus",
  useHeaderScroll: "scroll-and-navigation",
  useScrollSpy: "scroll-and-navigation",
  useInitialHashScroll: "scroll-and-navigation",
  useIdleTrigger: "idle-and-print",
  usePrintPreparation: "idle-and-print",
  useToast: "toast",
  useSmoothScroll: "optional-scroll",
  usePanelFocus: "dismissal-and-mobile-menus",
  useFloatingPanel: "dismissal-and-mobile-menus",
};
const helperFiles = new Set([
  "classNames",
  "format",
  "storage",
  "keyboard",
  "a11y",
  "motion",
  "safeHref",
]);
function reference(row) {
  if (row.entry === "./three") return "THREE.md";
  if (row.path === "src/lib/themeBootstrap.ts") return "HOOKS.md#theme";
  if (row.path.startsWith("src/hooks/")) {
    const file = row.path.split("/").at(-1).replace(/\.ts$/, "");
    assert.ok(
      hookAnchors[file],
      `Missing authored hook reference: ${row.name}`,
    );
    return "HOOKS.md#" + hookAnchors[file];
  }
  if (row.path === "src/types.ts" || row.path === "src/lib/layers.ts")
    return "HELPERS.md#public-types";
  if (row.path.startsWith("src/lib/")) {
    const file = row.path.split("/").at(-1).replace(/\.ts$/, "");
    assert.ok(helperFiles.has(file), `Missing helper reference: ${row.name}`);
    return file === "motion" ? "HOOKS.md#motion" : "HELPERS.md";
  }
  if (row.path.includes("components/"))
    return row.kind === "type" ? "PROP-REFERENCE.md" : "PUBLIC-API.md";
  throw Error(`Undocumented public source: ${row.path}`);
}
const rows = inventory.exports.map((row) => ({
  ...row,
  reference: reference(row),
}));
for (const row of rows) {
  const [file, anchor] = row.reference.split("#");
  await access(file);
  if (anchor) {
    const text = await readFile(file, "utf8");
    assert.ok(
      text.split("\n").some(
        (line) =>
          line.startsWith("#") &&
          line
            .replace(/^#+\s*/, "")
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-") === anchor,
      ),
      `Missing anchor ${row.reference}`,
    );
  }
}
let docs = `# Export reference register\n\nGenerated for ${pkg.version} from actual source/runtime declarations and the manifest. This register maps all symbols and CSS/data entry points; it does not promote every component page. Human behavior guidance lives in the linked references. Source and exact types remain in [PUBLIC-API.md](PUBLIC-API.md). Run npm run check:reference; newly added hook/helper sources need an authored mapping before this register can update.\n\n| Entry | Symbol | Kind | Reference |\n| --- | --- | --- | --- |\n`;
for (const row of rows)
  docs += `| ${row.entry} | ${row.name} | ${row.kind} | [${row.reference}](${row.reference}) |\n`;
docs += "\n## Styles and data\n\n| Public path | Contract |\n| --- | --- |\n";
for (const [name] of inventory.styleExports)
  docs += `| ${name} | [STYLING.md](STYLING.md), [SIZE.md](SIZE.md) |\n`;
const config = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
const options = ts.parseJsonConfigFileContent(
  config.config,
  ts.sys,
  process.cwd(),
).options;
const program = ts.createProgram([resolve("dist/index.d.ts")], {
  ...options,
  noEmit: true,
  rootDir: undefined,
});
const checker = program.getTypeChecker();
const file = program.getSourceFile(resolve("dist/index.d.ts"));
const module = checker.getSymbolAtLocation(file);
const exports = checker.getExportsOfModule(module);
const selections = {
  Checkbox: [
    "label",
    "description",
    "error",
    "indeterminate",
    "checked",
    "defaultChecked",
    "name",
    "form",
    "required",
    "disabled",
    "ref",
    "aria-describedby",
  ],
  SelectField: [
    "label",
    "options",
    "placeholder",
    "value",
    "defaultValue",
    "onChange",
    "ref",
    "form",
  ],
  ProgressBar: ["label", "value", "tone"],
  TextField: [
    "label",
    "value",
    "defaultValue",
    "hint",
    "error",
    "leadingIcon",
    "trailing",
    "maxLength",
    "ref",
    "form",
  ],
  TextArea: [
    "autoResize",
    "rows",
    "label",
    "value",
    "defaultValue",
    "hint",
    "error",
    "maxLength",
    "ref",
    "form",
  ],
  Dialog: [
    "open",
    "onClose",
    "title",
    "description",
    "placement",
    "initialFocus",
    "onOpenAutoFocus",
    "bodyProps",
    "footerProps",
    "closeButtonProps",
    "ref",
  ],
  Tabs: [
    "label",
    "tabs",
    "activeTabId",
    "defaultTabId",
    "onTabChange",
    "listProps",
    "ref",
  ],
  ToastProvider: ["children", "label", "dismissLabel"],
  DropdownMenu: [
    "label",
    "items",
    "open",
    "defaultOpen",
    "onOpenChange",
    "portal",
    "container",
    "align",
    "side",
    "sideOffset",
    "collisionPadding",
    "triggerProps",
    "renderTrigger",
    "onDismiss",
  ],
  Combobox: [
    "label",
    "options",
    "value",
    "defaultValue",
    "inputValue",
    "defaultInputValue",
    "open",
    "defaultOpen",
    "filteredOptions",
    "loading",
    "searchError",
    "onRetry",
    "inputProps",
    "popupProps",
    "rootProps",
    "ref",
  ],
  Table: ["caption", "showCaption", "children", "scrollProps", "ref"],
};
const metadata = {
  version: pkg.version,
  compiler: ts.version,
  scope:
    "Selected authored contracts from emitted declarations; inherited prop names and all call signatures retained. Runtime defaults are extracted from source parameter initializers; absence is not a native default inference.",
  components: {},
};
for (const [name, props] of Object.entries(selections)) {
  const symbol = exports.find((item) => item.name === name);
  assert.ok(symbol, name);
  const declaration = symbol.declarations[0];
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const signatures = type.getCallSignatures();
  assert.ok(signatures.length, `${name} is callable`);
  const param = signatures[0].parameters[0];
  const propType = checker.getTypeOfSymbolAtLocation(
    param,
    param.valueDeclaration ?? declaration,
  );
  const all = checker.getPropertiesOfType(propType);
  const defaults = {};
  const source = ts.createSourceFile(
    name + ".tsx",
    await readFile(`src/components/ui/${name}.tsx`, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  function visit(node) {
    if (ts.isFunctionLike(node) && node.name?.getText(source) === name) {
      const pattern = node.parameters?.[0]?.name;
      if (pattern && ts.isObjectBindingPattern(pattern))
        for (const item of pattern.elements)
          if (item.initializer)
            defaults[
              (item.propertyName ?? item.name)
                .getText(source)
                .replace(/^['"]|['"]$/g, "")
            ] = item.initializer.getText(source);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  metadata.components[name] = {
    callSignatures: signatures.map((sig) =>
      checker.signatureToString(
        sig,
        undefined,
        ts.TypeFormatFlags.NoTruncation,
      ),
    ),
    inheritedAndAuthoredPropNames: all.map((prop) => prop.name).sort(),
    selectedProps: props.map((propName) => {
      const prop = all.find((item) => item.name === propName);
      assert.ok(prop, `${name}.${propName} is no longer declared`);
      const definition =
        prop.valueDeclaration ?? prop.declarations?.[0] ?? declaration;
      return {
        name: propName,
        optional: !!(prop.flags & ts.SymbolFlags.Optional),
        type: checker.typeToString(
          checker.getTypeOfSymbolAtLocation(prop, definition),
          undefined,
          ts.TypeFormatFlags.NoTruncation,
        ),
        ...(Object.hasOwn(defaults, propName)
          ? { sourceDefault: defaults[propName] }
          : {}),
      };
    }),
  };
}
async function output(path, content) {
  if (write) await writeFile(path, content);
  else
    assert.equal(
      await readFile(path, "utf8"),
      content,
      `Stale reference: ${path}; inspect declaration/source changes then run --write`,
    );
}
await output("REFERENCE.md", docs);
await output(
  "docs/prop-metadata.json",
  JSON.stringify(metadata, null, 2) + "\n",
);
console.log(
  `${rows.length} symbols and ${inventory.styleExports.length} style/data paths referenced; ${Object.keys(metadata.components).length} emitted prop contracts checked.`,
);
