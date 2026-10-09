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
    /^(dist\/|package\.json$|README\.md$|LICENSE$|CHANGELOG\.md$|SECURITY\.md$|RELEASING\.md$|CONTRIBUTING\.md$|CODE_OF_CONDUCT\.md$|NEXTJS\.md$)/,
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
]) {
  assert.ok(
    archive.files.some((file) => file.path === name),
    `Missing release document: ${name}`,
  );
}
for (const file of [
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
