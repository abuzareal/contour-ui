import { rm, cp, mkdir } from "node:fs/promises";
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

// Relative assets work in both Vite and Next's webpack CSS loader.
await mkdir("dist/fonts", { recursive: true });
for (const [directory, font] of [
  ["@fontsource-variable/dm-sans", "dm-sans-latin-wght-normal.woff2"],
  [
    "@fontsource-variable/space-grotesk",
    "space-grotesk-latin-wght-normal.woff2",
  ],
  ["@fontsource/dm-mono", "dm-mono-latin-400-normal.woff2"],
]) {
  await cp(`node_modules/${directory}/files/${font}`, `dist/fonts/${font}`);
  await cp(
    `node_modules/${directory}/LICENSE`,
    `dist/fonts/${directory.split("/")[1]}-LICENSE.txt`,
  );
}
