import { mkdtemp, writeFile, readFile, rm, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { build } from "vite";

const reactVersion = process.env.CONTOUR_REACT_VERSION ?? "18.3.1";
const typeMajor = reactVersion.split(".")[0];
const temporary = await mkdtemp(join(tmpdir(), "contour-consumer-"));
const cache = join(tmpdir(), "contour-ui-npm-cache");
const runNpm = (args) =>
  execFileSync("npm", [...args, "--cache", cache], {
    cwd: temporary,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
try {
  const packed = JSON.parse(
    execFileSync(
      "npm",
      [
        "pack",
        "--json",
        "--ignore-scripts",
        "--pack-destination",
        temporary,
        "--cache",
        cache,
      ],
      { encoding: "utf8" },
    ),
  );
  const archive = Array.isArray(packed) ? packed[0] : Object.values(packed)[0];
  await writeFile(
    join(temporary, "package.json"),
    JSON.stringify(
      {
        private: true,
        type: "module",
        dependencies: {
          "@abuzareal/contour-ui": `file:./${archive.filename}`,
          react: reactVersion,
          "react-dom": reactVersion,
        },
        devDependencies: {
          "@types/react": `^${typeMajor}.0.0`,
          "@types/react-dom": `^${typeMajor}.0.0`,
          "@testing-library/react": "^16.3.3",
          jsdom: "^30.1.2",
        },
      },
      null,
      2,
    ),
  );
  runNpm([
    "install",
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    "--strict-peer-deps",
  ]);
  for (const optional of ["three", "lenis"]) {
    await assert.rejects(stat(join(temporary, "node_modules", optional)), {
      code: "ENOENT",
    });
  }
  await writeFile(
    join(temporary, "index.html"),
    '<div id="root"></div><script type="module" src="/main.tsx"></script>',
  );
  await writeFile(
    join(temporary, "main.tsx"),
    `import React, { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, ThemeToggle, TextField, useDismiss, useHeaderScroll, useMobileMenu, type ButtonProps } from '@abuzareal/contour-ui';
import '@abuzareal/contour-ui/reset.css';
import '@abuzareal/contour-ui/fonts.css';
import '@abuzareal/contour-ui/styles.css';
function RefConsumer() {
  const container = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useDismiss(container, false, () => {});
  useHeaderScroll(container);
  useMobileMenu(container, button);
  return <div ref={container}><button ref={button}/></div>;
}
const props: ButtonProps = { variant: 'accent', children: 'Forecast' };
createRoot(document.getElementById('root')!).render(<main data-motion="off"><RefConsumer/><ThemeToggle animate={false}/><TextField label="City"/><Button {...props}/></main>);
`,
  );
  await writeFile(
    join(temporary, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        jsx: "react-jsx",
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        allowArbitraryExtensions: true,
      },
      include: ["main.tsx"],
    }),
  );
  execFileSync(
    process.execPath,
    ["node_modules/typescript/bin/tsc", "-p", join(temporary, "tsconfig.json")],
    { stdio: "inherit" },
  );
  await build({
    root: temporary,
    configFile: false,
    logLevel: "warn",
    build: {
      minify: true,
      outDir: join(temporary, "built"),
      emptyOutDir: true,
    },
  });
  // Exercise the packed runtime, not repository-relative source or dist imports.
  for (const file of ["components.test.mjs", "public-api.test.mjs"]) {
    const testSource = (await readFile(join("tests", file), "utf8")).replaceAll(
      "../dist/index.js",
      "@abuzareal/contour-ui",
    );
    await writeFile(join(temporary, file), testSource);
  }
  execFileSync(
    process.execPath,
    ["--test", "components.test.mjs", "public-api.test.mjs"],
    {
      cwd: temporary,
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "test" },
    },
  );
  const lock = JSON.parse(
    await readFile(join(temporary, "package-lock.json"), "utf8"),
  );
  const library = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(
    lock.packages["node_modules/@abuzareal/contour-ui"].version,
    library.version,
  );
  console.log(
    `React ${reactVersion} clean consumer passed: strict peer installation, declarations, runtime tests, CSS/fonts, and production build without Three.js or Lenis.`,
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
