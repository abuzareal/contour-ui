import { packedArchive } from "./packed-archive.mjs";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "vite";

const reactVersion = process.env.CONTOUR_REACT_VERSION ?? "18.3.1";
const temporary = await mkdtemp(join(tmpdir(), "contour-optional-"));
const cache = join(tmpdir(), "contour-ui-npm-cache");
try {
  const archive = await packedArchive(temporary);
  await writeFile(
    join(temporary, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      dependencies: {
        "@abuzareal/contour-ui": `file:${archive}`,
        react: reactVersion,
        "react-dom": reactVersion,
        three: "0.186.1",
        lenis: "1.3.26",
      },
      devDependencies: {
        "@types/react": `^${reactVersion.split(".")[0]}.0.0`,
        "@types/react-dom": `^${reactVersion.split(".")[0]}.0.0`,
        "@types/three": "0.186.0",
        typescript: "5.9.3",
      },
    }),
  );
  execFileSync(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--strict-peer-deps",
      "--no-audit",
      "--no-fund",
      "--fetch-retries=0",
      "--fetch-timeout=30000",
      "--cache",
      cache,
    ],
    { cwd: temporary, stdio: "inherit" },
  );
  await writeFile(
    join(temporary, "index.html"),
    '<div id="root"></div><script type="module" src="/main.tsx"></script>',
  );
  await writeFile(
    join(temporary, "main.tsx"),
    `import { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { SceneBoundary } from '@abuzareal/contour-ui';
import { ObjectStudy, useThreeStage, type StageContext, type StageScene } from '@abuzareal/contour-ui/three';
import { useSmoothScroll } from '@abuzareal/contour-ui/scroll';
import '@abuzareal/contour-ui/styles.css';
import '@abuzareal/contour-ui/fonts-latin.css';
function Stage() {
  const host = useRef<HTMLDivElement>(null);
  useThreeStage(host, {
    motionEnabled: false,
    cameraDistance: () => 5,
    setup: (context: StageContext): StageScene => ({
      update: ({ pointer }) => { context.camera.position.x = pointer.x; },
      rest: () => {}, dispose: () => {},
    }),
  });
  return <div ref={host}/>;
}
function App() {
  useSmoothScroll(false);
  return <SceneBoundary><Stage/><ObjectStudy label="Packed consumer study" study="geometry" motionEnabled={false}/></SceneBoundary>;
}
createRoot(document.getElementById('root')!).render(<App/>);
`,
  );
  await writeFile(
    join(temporary, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        module: "NodeNext",
        moduleResolution: "NodeNext",
        jsx: "react-jsx",
        strict: true,
        skipLibCheck: false,
        noEmit: true,
        types: ["react", "react-dom"],
      },
      include: ["main.tsx"],
    }),
  );
  execFileSync(
    process.execPath,
    [
      join(temporary, "node_modules/typescript/bin/tsc"),
      "-p",
      join(temporary, "tsconfig.json"),
    ],
    { stdio: "inherit" },
  );
  await build({
    root: temporary,
    configFile: false,
    logLevel: "warn",
    build: { outDir: join(temporary, "built"), emptyOutDir: true },
  });
  const assets = join(temporary, "built/assets");
  const files = await readdir(assets);
  const fonts = files.filter((file) => file.endsWith(".woff2"));
  assert.equal(
    fonts.length,
    3,
    "Latin export must emit exactly the three WOFF2 typefaces",
  );
  for (const family of [
    "dm-sans-latin-wght-normal",
    "space-grotesk-latin-wght-normal",
    "dm-mono-latin-400-normal",
  ]) {
    assert.ok(
      fonts.some((file) => file.startsWith(family)),
      `Missing Latin face: ${family}`,
    );
  }
  assert.ok(
    !files.some((file) => file.endsWith(".woff")),
    "Latin export must omit WOFF fallbacks",
  );
  const bytes = (
    await Promise.all(fonts.map((file) => stat(join(assets, file))))
  ).reduce((sum, item) => sum + item.size, 0);
  const pkg = JSON.parse(
    await readFile(
      join(temporary, "node_modules/@abuzareal/contour-ui/package.json"),
      "utf8",
    ),
  );
  assert.equal(pkg.peerDependenciesMeta.three.optional, true);
  assert.equal(pkg.peerDependenciesMeta.lenis.optional, true);
  console.log(
    `React ${reactVersion} packed optional consumer passed: /three and /scroll strict declarations and production build; Latin fonts emit ${bytes} bytes.`,
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
