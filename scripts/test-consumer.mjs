import { packedArchive } from "./packed-archive.mjs";
import { cp, mkdtemp, writeFile, readFile, rm, stat } from "node:fs/promises";
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
  const archive = await packedArchive(temporary);
  await writeFile(
    join(temporary, "package.json"),
    JSON.stringify(
      {
        private: true,
        type: "module",
        dependencies: {
          "@abuzareal/contour-ui": `file:${archive}`,
          react: reactVersion,
          "react-dom": reactVersion,
        },
        devDependencies: {
          "@types/react": `^${typeMajor}.0.0`,
          "@types/react-dom": `^${typeMajor}.0.0`,
          "@testing-library/react": "^16.3.3",
          jsdom: "^30.1.2",
          postcss: "8.5.29",
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
  for (const optional of ["three", "lenis", "react-hook-form"]) {
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
import { Button, IconButton, DepthButton, ExternalLink, Checkbox, Slider, Switch, Dialog, Tabs, Popover, ThemeToggle, TextField, useDismiss, useHeaderScroll, useMobileMenu, type ButtonProps } from '@abuzareal/contour-ui';
import '@abuzareal/contour-ui/reset.css';
import '@abuzareal/contour-ui/fonts.css';
import '@abuzareal/contour-ui/styles.css';
function RefConsumer() {
  const container = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useDismiss(container, false, () => {});
  useHeaderScroll(container);
  useMobileMenu(container, button);
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const anchor = useRef<HTMLAnchorElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  return <div ref={container}>
    <Button ref={button}>Action</Button><IconButton ref={button} label="Copy">Icon</IconButton>
    <DepthButton ref={button}>Depth</DepthButton><ExternalLink ref={anchor} href="https://example.com">Link</ExternalLink>
    <Checkbox ref={input} label="Accept"/><Slider ref={input} label="Amount" value={2} onChange={() => {}}/>
    <Switch ref={button} label="Enabled" checked={false} onChange={() => {}}/><ThemeToggle ref={button} animate={false}/>
    <Dialog ref={dialog} open={false} onClose={() => {}} title="Settings" className="host-dialog" bodyProps={{ ref: panel, 'data-body': 'settings' }}>Content</Dialog>
    <Tabs ref={panel} label="Views" listProps={{ 'data-list': 'views' }} tabs={[{ id: 'one', label: 'One', content: 'Panel', buttonProps: { ref: button }, panelProps: { ref: panel } }]}/>
    <Popover ref={panel} trigger="Help" title="Help" triggerProps={{ ref: button, 'data-trigger': 'help' }} panelProps={{ ref: panel }}>Content</Popover>
  </div>;
}
const props: ButtonProps = { variant: 'accent', children: 'Forecast' };
createRoot(document.getElementById('root')!).render(<main data-motion="off"><RefConsumer/><ThemeToggle animate={false}/><TextField label="City"/><Button {...props}/></main>);
`,
  );
  const compositionGuide = await readFile(
    join(temporary, "node_modules/@abuzareal/contour-ui/COMPOSITION.md"),
    "utf8",
  );
  const completeExamples = [
    ...compositionGuide.matchAll(/```tsx\n([\s\S]*?)```/g),
  ]
    .map((match) => match[1])
    .filter(
      (source) =>
        !source.startsWith("// Fragment:") &&
        !source.includes('from "next/link"'),
    );
  assert.equal(
    completeExamples.length,
    3,
    "complete core composition examples",
  );
  for (const [index, source] of completeExamples.entries())
    await writeFile(join(temporary, `composition-${index}.tsx`), source);
  const formGuide = await readFile(
    join(temporary, "node_modules/@abuzareal/contour-ui/FORMS.md"),
    "utf8",
  );
  const formExamples = [...formGuide.matchAll(/```tsx\n([\s\S]*?)```/g)].map(
    (match) => match[1],
  );
  assert.equal(formExamples.length, 2, "complete core form guide examples");
  for (const [index, source] of formExamples.entries())
    await writeFile(join(temporary, `forms-${index}.tsx`), source);
  for (const guide of ["STYLING.md", "OVERLAYS.md"]) {
    const source = await readFile(
      join(temporary, "node_modules/@abuzareal/contour-ui", guide),
      "utf8",
    );
    const examples = [...source.matchAll(/```tsx\n([\s\S]*?)```/g)].map(
      (match) => match[1],
    );
    assert.equal(
      examples.length,
      guide === "STYLING.md" ? 2 : 1,
      `complete ${guide} examples`,
    );
    for (const [index, example] of examples.entries())
      await writeFile(
        join(
          temporary,
          `${guide.replace(".md", "").toLowerCase()}-${index}.tsx`,
        ),
        example,
      );
  }
  for (const file of [
    "NativeSettingsForm.tsx",
    "settings.ts",
    "useSubmission.ts",
  ]) {
    await cp(
      join(
        temporary,
        "node_modules/@abuzareal/contour-ui/examples/forms",
        file,
      ),
      join(temporary, file),
    );
  }
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
      include: [
        "main.tsx",
        "composition-*.tsx",
        "forms-*.tsx",
        "styling-*.tsx",
        "overlays-*.tsx",
        "NativeSettingsForm.tsx",
        "settings.ts",
        "useSubmission.ts",
      ],
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
  for (const file of [
    "components.test.mjs",
    "public-api.test.mjs",
    "forms.test.mjs",
    "overlays.test.mjs",
  ]) {
    const testSource = (await readFile(join("tests", file), "utf8")).replaceAll(
      "../dist/index.js",
      "@abuzareal/contour-ui",
    );
    await writeFile(join(temporary, file), testSource);
  }
  execFileSync(
    process.execPath,
    [
      "--test",
      "components.test.mjs",
      "public-api.test.mjs",
      "forms.test.mjs",
      "overlays.test.mjs",
    ],
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
