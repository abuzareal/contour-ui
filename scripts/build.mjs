import { rm, cp } from "node:fs/promises";
import { execFileSync } from "node:child_process";
await rm(new URL("../dist/", import.meta.url), {
  recursive: true,
  force: true,
});
execFileSync(
  process.execPath,
  ["node_modules/typescript/bin/tsc", "-p", "tsconfig.json"],
  { stdio: "inherit" },
);
await cp("styles", "dist", { recursive: true });
