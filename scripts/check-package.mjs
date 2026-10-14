import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
assert.equal(pkg.name, "@abuzareal/contour-ui");
assert.equal(pkg.license, "MIT");
assert.equal(pkg.publishConfig.registry, "https://registry.npmjs.org");
assert.equal(pkg.publishConfig.access, "public");
for (const key of ["preinstall", "install", "postinstall", "prepare"]) {
  assert.equal(
    pkg.scripts[key],
    undefined,
    `Unexpected consumer lifecycle script: ${key}`,
  );
}
const result = JSON.parse(
  execFileSync(
    "npm",
    [
      "pack",
      "--dry-run",
      "--json",
      "--ignore-scripts",
      "--cache",
      join(tmpdir(), "contour-ui-pack-cache"),
    ],
    { encoding: "utf8" },
  ),
);
const archive = Array.isArray(result) ? result[0] : Object.values(result)[0];
for (const { path } of archive.files) {
  assert.match(
    path,
    /^(dist\/|package\.json$|(?:README|LICENSE|CHANGELOG|SECURITY|RELEASING|CONTRIBUTING|CODE_OF_CONDUCT|NEXTJS|CONTRACTS|PUBLIC-API|COMPOSITION|FORMS|OVERLAYS|STYLING|SIZE|FOUNDATION|COMBOBOX|RECIPES|GETTING-STARTED|DOCS|HOOKS|HELPERS|THREE|REFERENCE|PROP-REFERENCE|MIGRATION|MODELS|SUPPORT|MANUAL-QA)(?:\.md)?$|docs\/prop-metadata\.json$|examples\/reference\/HookExamples\.tsx$|examples\/onboarding\/SettingsForm\.(?:tsx|jsx)$|examples\/forms\/(?:NativeSettingsForm\.tsx|HookFormSettingsForm\.tsx|ManualSettingsForm-0\.3\.0\.tsx|useSubmission\.ts|settings\.ts)$|examples\/recipes\/(?:AsyncProjectPicker\.tsx|DeleteProjectConfirmation\.tsx|InputCompositions\.tsx|RemoteRecordsTable\.tsx|useRemoteResource\.ts)$|examples\/optional\/(?:LazyScene\.tsx|OptionalSmoothScroll\.tsx|SmoothScrollOwner\.tsx|optional\.css)$|examples\/(?:starters\/(?:vite|next)|reproduction)\/(?:package\.json|tsconfig\.json|README\.md|index\.html|vite\.config\.ts|next\.config\.mjs|next-env\.d\.ts|proxy\.ts|src\/(?:main\.tsx|style\.css)|app\/(?:layout\.tsx|page\.tsx|Demo\.tsx|style\.css|next-page\/page\.tsx))$)/,
  );
  assert.doesNotMatch(
    path,
    /(?:^|\/)(?:\.env(?:\.[^/]*)?|\.npmrc|node_modules|\.git)(?:\/|$)|\.map$|\.tgz$/,
  );
}
for (const entry of Object.values(pkg.exports)) {
  for (const file of typeof entry === "string"
    ? [entry]
    : Object.values(entry)) {
    assert.ok(existsSync(file), `Missing public export: ${file}`);
  }
}
for (const name of [
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  "SECURITY.md",
  "RELEASING.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "NEXTJS.md",
  "CONTRACTS.md",
  "PUBLIC-API.md",
  "COMPOSITION.md",
  "FORMS.md",
  "OVERLAYS.md",
  "STYLING.md",
  "SIZE.md",
  "FOUNDATION.md",
  "COMBOBOX.md",
  "RECIPES.md",
  "GETTING-STARTED.md",
  "DOCS.md",
  "HOOKS.md",
  "HELPERS.md",
  "THREE.md",
  "REFERENCE.md",
  "PROP-REFERENCE.md",
  "MIGRATION.md",
  "MODELS.md",
  "SUPPORT.md",
  "MANUAL-QA.md",
  "docs/prop-metadata.json",
  "examples/onboarding/SettingsForm.tsx",
  "examples/onboarding/SettingsForm.jsx",
  "examples/reference/HookExamples.tsx",
  "examples/starters/vite/package.json",
  "examples/starters/next/package.json",
  "examples/reproduction/package.json",
  "examples/recipes/AsyncProjectPicker.tsx",
  "examples/optional/LazyScene.tsx",
  "examples/forms/NativeSettingsForm.tsx",
  "examples/forms/HookFormSettingsForm.tsx",
  "examples/forms/ManualSettingsForm-0.3.0.tsx",
  "examples/forms/useSubmission.ts",
  "examples/forms/settings.ts",
]) {
  assert.ok(
    archive.files.some((file) => file.path === name),
    `Missing release document: ${name}`,
  );
}
for (const file of [
  "components/ui/Button.js",
  "components/ui/Combobox.js",
  "components/ui/Table.js",
  "components/ui/IconButton.js",
  "components/ui/DepthButton.js",
  "components/ui/ExternalLink.js",
  "components/ui/Checkbox.js",
  "components/ui/Slider.js",
  "components/ui/Switch.js",
  "components/ui/RadioGroup.js",
  "components/ui/TextField.js",
  "components/ui/TextArea.js",
  "components/ui/SelectField.js",
  "components/ui/ThemeToggle.js",
  "components/ui/Dialog.js",
  "components/ui/Tabs.js",
  "components/ui/Popover.js",
  "components/ui/DropdownMenu.js",
  "hooks/useToast.js",
]) {
  assert.match(
    readFileSync(`dist/${file}`, "utf8"),
    /^"use client";/,
    `Client boundary lost in ${file}`,
  );
}
assert.doesNotMatch(
  readFileSync("dist/index.js", "utf8"),
  /^"use client";/,
  "Keep pure helpers accessible to server imports",
);
for (const name of [
  "dm-sans-latin-wght-normal.woff2",
  "space-grotesk-latin-wght-normal.woff2",
  "dm-mono-latin-400-normal.woff2",
])
  assert.ok(
    archive.files.some((file) => file.path === `dist/fonts/${name}`),
    `Missing relative font ${name}`,
  );
console.log(
  `Package contents verified: ${archive.files.length} files, ${archive.size} compressed bytes.`,
);
