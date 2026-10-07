import { execFileSync } from "node:child_process";
import { cp, mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Build with the repository's React 18 baseline, consume that exact archive in both majors.
const run = (args, options = {}) =>
  execFileSync(process.execPath, args, {
    stdio: "inherit",
    ...options,
  });
run(["scripts/build.mjs"]);
for (const version of ["18.3.1", "19.0.0", "19.3.0"]) {
  run(["scripts/test-consumer.mjs"], {
    env: { ...process.env, CONTOUR_REACT_VERSION: version },
  });
}

for (const version of ["18.3.1", "19.3.0"]) {
  run(["scripts/test-optional-consumer.mjs"], {
    env: { ...process.env, CONTOUR_REACT_VERSION: version },
  });
}

// Compile the source against React 19 declarations too; runtime-only testing misses ref errors.
const temporary = await mkdtemp(join(tmpdir(), "contour-source19-"));
try {
  for (const path of ["src", "tsconfig.json"]) {
    await cp(path, join(temporary, path), { recursive: true });
  }
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  pkg.devDependencies.react = "19.3.0";
  pkg.devDependencies["react-dom"] = "19.3.0";
  pkg.devDependencies["@types/react"] = "^19.0.0";
  pkg.devDependencies["@types/react-dom"] = "^19.0.0";
  pkg.scripts = {};
  await writeFile(join(temporary, "package.json"), JSON.stringify(pkg));
  execFileSync(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--strict-peer-deps",
      "--no-audit",
      "--no-fund",
      "--cache",
      join(tmpdir(), "contour-ui-npm-cache"),
    ],
    {
      cwd: temporary,
      stdio: "inherit",
    },
  );
  run([
    join(temporary, "node_modules/typescript/bin/tsc"),
    "-p",
    join(temporary, "tsconfig.json"),
    "--noEmit",
  ]);
  console.log("Source compiles against React 19 types.");
} finally {
  await rm(temporary, { recursive: true, force: true });
}
