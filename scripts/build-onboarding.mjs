import ts from "typescript";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
const source = await readFile("examples/onboarding/SettingsForm.tsx", "utf8");
const output = ts.transpileModule(source, {
  fileName: "SettingsForm.tsx",
  compilerOptions: {
    jsx: ts.JsxEmit.Preserve,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    removeComments: false,
  },
}).outputText;
const expected =
  "// Generated from SettingsForm.tsx by scripts/build-onboarding.mjs.\n" +
  output;
if (process.argv.includes("--write"))
  await writeFile("examples/onboarding/SettingsForm.jsx", expected);
else
  assert.equal(
    await readFile("examples/onboarding/SettingsForm.jsx", "utf8"),
    expected,
    "JavaScript example drift; inspect TS source then run --write",
  );
console.log(
  "JavaScript and TypeScript onboarding share one executable source contract.",
);
