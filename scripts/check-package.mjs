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
    /^(dist\/|package\.json$|README\.md$|LICENSE$|CHANGELOG\.md$|SECURITY\.md$|RELEASING\.md$)/,
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
]) {
  assert.ok(
    archive.files.some((file) => file.path === name),
    `Missing release document: ${name}`,
  );
}
console.log(
  `Package contents verified: ${archive.files.length} files, ${archive.size} compressed bytes.`,
);
