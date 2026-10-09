import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdtemp, mkdir, writeFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, expect } from "@playwright/test";
import { packedArchive } from "./packed-archive.mjs";

// Exact framework pair. This is an App Router check, not a promise for every Next version.
const nextVersion = "16.4.0";
const reactVersion = "19.3.0";
const optional = process.env.CONTOUR_NEXT_OPTIONAL === "1";
const temporary = await mkdtemp(join(tmpdir(), "contour-next-"));
let server;
let browser;
try {
  const archive = await packedArchive(temporary);
  await writeFile(
    join(temporary, "package.json"),
    JSON.stringify({
      private: true,
      dependencies: {
        "@abuzareal/contour-ui": `file:${archive}`,
        next: nextVersion,
        react: reactVersion,
        "react-dom": reactVersion,
        ...(optional ? { three: "0.186.1" } : {}),
      },
      devDependencies: {
        typescript: "5.9.3",
        "@types/react": "^19.0.0",
        "@types/react-dom": "^19.0.0",
        "@types/node": "^24.0.0",
        ...(optional ? { "@types/three": "0.186.0" } : {}),
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
      "--cache",
      join(tmpdir(), "contour-ui-npm-cache"),
    ],
    { cwd: temporary, stdio: "inherit" },
  );
  for (const peer of optional ? ["lenis"] : ["three", "lenis"])
    await assert.rejects(stat(join(temporary, "node_modules", peer)), {
      code: "ENOENT",
    });
  await mkdir(join(temporary, "app", "next-page"), { recursive: true });
  await writeFile(
    join(temporary, "next.config.mjs"),
    "export default { experimental: { cpus: 2 } };\n",
  );
  await writeFile(
    join(temporary, "app", "layout.tsx"),
    `import '@abuzareal/contour-ui/styles.css';
import '@abuzareal/contour-ui/fonts-latin.css';
import { themeBootstrapScript } from '@abuzareal/contour-ui/theme-bootstrap';
export default function Layout({ children }: { children: React.ReactNode }) {
 return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}/></head><body>{children}</body></html>;
}`,
  );
  await writeFile(
    join(temporary, "app", "page.tsx"),
    `import { TextField, safeHref } from '@abuzareal/contour-ui';
import Demo from './demo';
export default function Page() { return <main><h1>Server route</h1><a href={safeHref('/next-page')}>Server link</a><TextField label="Server field" defaultValue="Rendered on the server"/><Demo/></main>; }`,
  );
  await writeFile(
    join(temporary, "app", "next-page", "page.tsx"),
    `import Link from 'next/link'; export default function Page() { return <main><h1>Next route</h1><Link href="/">Return</Link></main>; }`,
  );
  await writeFile(
    join(temporary, "app", "demo.tsx"),
    `'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { TextField, TextArea, Dialog, Button, ThemeToggle, ToastProvider, useToast, Tabs } from '@abuzareal/contour-ui';
function Content() {
 const [open, setOpen] = useState(false);
 const ref = useRef<HTMLInputElement>(null);
 const toast = useToast();
 return <><ThemeToggle animate={false}/><form><TextField label="Name" ref={ref} defaultValue="abc" maxLength={20}/><TextArea label="Notes" defaultValue="abc" maxLength={20} autoResize/><button type="reset">Reset</button></form><Button onClick={() => ref.current?.focus()}>Focus name</Button><Button onClick={() => setOpen(true)}>Open dialog</Button><Dialog open={open} onClose={() => setOpen(false)} title="Settings"><Button onClick={() => setOpen(false)}>Done</Button></Dialog><Button onClick={() => toast.show({ title: 'Saved', message: 'Local fixture only' })}>Notify</Button><Tabs label="Views" tabs={[{ id: 'one', label: 'One', content: 'First panel' }, { id: 'two', label: 'Two', content: 'Second panel' }]}/><Link href="/next-page">Navigate</Link></>;
}
export default function Demo() { return <ToastProvider><Content/></ToastProvider>; }`,
  );
  if (optional) {
    await mkdir(join(temporary, "app", "scene"), { recursive: true });
    await writeFile(
      join(temporary, "app", "scene", "page.tsx"),
      `'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
const Sculpture = dynamic(() => import('@abuzareal/contour-ui/three').then(module => module.Sculpture), { ssr: false });
export default function ScenePage() { return <main><h1>Optional scene</h1><p>Static scene description remains available while loading.</p><div style={{ height: 400, width: '100%' }}><Sculpture motionEnabled={false}/></div><Link href="/">Return to controls</Link></main>; }`,
    );
  }
  execFileSync(
    process.execPath,
    [join(temporary, "node_modules/next/dist/bin/next"), "build", "--webpack"],
    {
      cwd: temporary,
      stdio: "inherit",
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    },
  );
  server = spawn(
    process.execPath,
    [
      join(temporary, "node_modules/next/dist/bin/next"),
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "0",
    ],
    {
      cwd: temporary,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const origin = await new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(
      () => reject(Error(`Next start timed out: ${output}`)),
      30000,
    );
    server.once("exit", (code) => {
      clearTimeout(timer);
      reject(Error(`Next start exited ${code}: ${output}`));
    });
    const read = (chunk) => {
      output += chunk;
      const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (match && /Ready/.test(output)) {
        clearTimeout(timer);
        resolve(match[0]);
      }
    };
    server.stdout.on("data", read);
    server.stderr.on("data", read);
  });
  browser = await chromium.launch({
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  const page = await browser.newPage({
    viewport: { width: 390, height: 800 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(origin);
  await page.getByRole("button", { name: "Focus name", exact: true }).click();
  assert.equal(
    await page
      .getByRole("textbox", { name: "Name", exact: true })
      .evaluate((element) => element === document.activeElement),
    true,
  );
  for (const label of ["Name", "Notes"])
    await page
      .getByRole("textbox", { name: label, exact: true })
      .fill("abcdef");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByText("3/20", { exact: true }).first().waitFor();
  assert.equal(await page.getByText("3/20", { exact: true }).count(), 2);
  const notes = page.getByRole("textbox", { name: "Notes", exact: true });
  const initialHeight = await notes.evaluate((element) => element.clientHeight);
  await notes.fill("a\nb\nc\nd\ne\nf\ng");
  assert.ok(
    (await notes.evaluate((element) => element.clientHeight)) > initialHeight,
  );
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.waitForFunction(
    (height) => document.querySelector("textarea").clientHeight === height,
    initialHeight,
  );
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("abcdef");
  await expect(page.getByText("6/20", { exact: true })).toHaveCount(1);
  await page.evaluate(() =>
    document
      .querySelector("form")
      .addEventListener("reset", (event) => event.preventDefault(), {
        once: true,
      }),
  );
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  assert.equal(
    await page.getByRole("textbox", { name: "Name", exact: true }).inputValue(),
    "abcdef",
  );
  await expect(page.getByText("6/20", { exact: true })).toHaveCount(1);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByRole("button", { name: "Open dialog", exact: true }).click();
  await page.getByRole("dialog", { name: "Settings" }).waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0);
  assert.equal(
    await page
      .getByRole("button", { name: "Open dialog", exact: true })
      .evaluate((element) => element === document.activeElement),
    true,
  );
  await page.getByRole("button", { name: "Notify", exact: true }).click();
  await page.getByText("Saved", { exact: true }).waitFor();
  await page.getByRole("tab", { name: "Two", exact: true }).click();
  assert.equal(await page.getByRole("tabpanel").textContent(), "Second panel");
  await page.getByRole("button", { name: "Dark theme", exact: true }).click();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await page.getByRole("link", { name: "Navigate", exact: true }).click();
  await page.getByRole("heading", { name: "Next route" }).waitFor();
  await page.getByRole("link", { name: "Return", exact: true }).click();
  await page.getByRole("heading", { name: "Server route" }).waitFor();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  if (optional) {
    await page.goto(`${origin}/scene`);
    await page.locator('.sculpture-canvas[data-state="ready"]').waitFor();
    assert.equal(await page.locator("canvas").count(), 1);
    await page
      .getByRole("link", { name: "Return to controls", exact: true })
      .click();
    await page.getByRole("heading", { name: "Server route" }).waitFor();
    assert.equal(await page.locator("canvas").count(), 0);
  }
  assert.deepEqual(errors, []);
  console.log(
    `Next ${nextVersion} / React ${reactVersion} passed: packed App Router build, server imports, native fields/reset, focus, dialog, toast, theme persistence and client navigation ${optional ? "with a separately lazy-loaded Three.js scene and navigation cleanup" : "without optional peers"}.`,
  );
} finally {
  await browser?.close();
  if (server) {
    const exited = new Promise((resolve) => server.once("exit", resolve));
    server.kill();
    await exited;
  }
  await rm(temporary, { recursive: true, force: true });
}
