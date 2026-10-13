import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build, preview } from "vite";
import { chromium, expect } from "@playwright/test";
import { packedArchive } from "./packed-archive.mjs";

const version = process.env.CONTOUR_REACT_VERSION ?? "18.3.1";
const major = version.split(".")[0];
const temporary = await mkdtemp(join(tmpdir(), "contour-form-recipes-"));
let browser, server, legacyDirectory;
const install = (directory) => {
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
    { cwd: directory, stdio: "inherit" },
  );
};
const compile = (directory) =>
  execFileSync(
    process.execPath,
    ["node_modules/typescript/bin/tsc", "-p", join(directory, "tsconfig.json")],
    { stdio: "inherit" },
  );
try {
  const archive = await packedArchive(temporary);
  await writeFile(
    join(temporary, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      dependencies: {
        "@abuzareal/contour-ui": `file:${archive}`,
        react: version,
        "react-dom": version,
        "react-hook-form": "7.90.0",
      },
      devDependencies: {
        "@types/react": `^${major}.0.0`,
        "@types/react-dom": `^${major}.0.0`,
      },
    }),
  );
  install(temporary);
  await cp(
    join(temporary, "node_modules/@abuzareal/contour-ui/examples/forms"),
    join(temporary, "examples"),
    { recursive: true },
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
      include: ["main.tsx", "examples/**/*"],
    }),
  );
  await writeFile(
    join(temporary, "index.html"),
    '<html lang="en"><head><link rel="icon" href="/favicon.svg"></head><div id="root"></div><script type="module" src="/main.tsx"></script></html>',
  );
  await writeFile(
    join(temporary, "favicon.svg"),
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"/></svg>',
  );
  await writeFile(
    join(temporary, "main.tsx"),
    `
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {NativeSettingsForm} from './examples/NativeSettingsForm.js';
import {HookFormSettingsForm} from './examples/HookFormSettingsForm.js';
import type {Settings,SaveResult,SaveSettings} from './examples/settings.js';
import '@abuzareal/contour-ui/reset.css';
import '@abuzareal/contour-ui/styles.css';
const pending: {resolve:(result:SaveResult)=>void;reject:()=>void}[]=[];
const fixture={calls:[] as Settings[],signals:[] as AbortSignal[],finish:(index:number,result:SaveResult)=>pending[index].resolve(result),reject:(index:number)=>pending[index].reject()};
declare global {interface Window {fixture:typeof fixture}}
window.fixture=fixture;
const save:SaveSettings=(settings,signal)=>new Promise((resolve,reject)=>{fixture.calls.push(settings);fixture.signals.push(signal);pending.push({resolve,reject:()=>reject(Error('Test service rejected'))})});
const Form=new URLSearchParams(location.search).get('recipe')==='rhf'?HookFormSettingsForm:NativeSettingsForm;
function App(){const [mounted,setMounted]=useState(true);return <main style={{padding:16,maxWidth:600}}><h1>Form recipes — local test service</h1><button onClick={()=>setMounted(!mounted)}>{mounted?'Unmount form':'Remount form'}</button>{mounted&&<Form save={save}/>}</main>}
const root=document.getElementById('root');if(!root)throw Error('Missing fixture root');createRoot(root).render(<React.StrictMode><App/></React.StrictMode>);
`,
  );
  compile(temporary);
  await build({ root: temporary, configFile: false, logLevel: "warn" });
  server = await preview({
    root: temporary,
    configFile: false,
    preview: { host: "127.0.0.1", port: 0 },
  });
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({ channel: "chromium" });
  for (const recipe of ["native", "rhf"]) {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto(`${origin}/?recipe=${recipe}`);
    const email = page.getByRole("textbox", { name: "Email", exact: true });
    const slider = page.getByRole("slider", { name: "Level", exact: true });
    const status = page.getByRole("status", { name: "Submission status" });
    const saveButton = page.getByRole("button", {
      name: "Save settings",
      exact: true,
    });
    const resetButton = page.getByRole("button", {
      name: "Reset settings",
      exact: true,
    });
    const calls = () => page.evaluate(() => window.fixture.calls);
    const resolveResult = (index, result) =>
      page.evaluate(
        ({ index, result }) => window.fixture.finish(index, result),
        { index, result },
      );
    await saveButton.click();
    await expect(email).toBeFocused();
    assert.deepEqual(await calls(), []);
    await email.fill("person@example.com");
    await page.getByRole("switch", { name: "Updates", exact: true }).click();
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await page
      .getByRole("radio", { name: "Phone contact", exact: true })
      .check();
    await saveButton.click();
    await expect(status).toHaveText("Saving settings…");
    assert.equal(
      await status.evaluate((element) =>
        Boolean(element.closest('[aria-busy="true"]')),
      ),
      false,
    );
    await expect(saveButton).toBeDisabled();
    assert.deepEqual(await calls(), [
      {
        email: "person@example.com",
        updates: false,
        level: 25,
        contact: "phone",
      },
    ]);
    await page.locator("form").dispatchEvent("submit");
    assert.equal((await calls()).length, 1);
    await resolveResult(0, {
      ok: false,
      message: "Service unavailable.",
      fields: { email: "Email already in use." },
    });
    await expect(status).toHaveText("Service unavailable.");
    await expect(email).toHaveValue("person@example.com");
    await expect(slider).toHaveValue("25");
    await expect(
      page.getByRole("switch", { name: "Updates", exact: true }),
    ).toHaveAttribute("aria-checked", "false");
    await expect(
      page.getByRole("radio", { name: "Phone contact", exact: true }),
    ).toBeChecked();
    await expect(email).toBeFocused();
    await expect(
      page.getByText("Email already in use.", { exact: true }),
    ).toBeVisible();
    await email.fill("retry@example.com");
    await saveButton.click();
    await expect(status).toHaveText("Saving settings…");
    assert.equal((await calls()).length, 2);
    await resolveResult(1, { ok: true });
    await expect(status).toHaveText("Settings saved.");
    await expect(slider).toHaveValue("25");
    await email.fill("bad");
    await saveButton.click();
    await expect(status).toHaveText("Check the highlighted fields.");
    await expect(email).toBeFocused();
    assert.equal((await calls()).length, 2);
    await resetButton.click();
    await expect(email).toHaveValue("");
    await expect(page.getByText("0/80", { exact: true })).toBeVisible();
    await expect(slider).toHaveValue("20");
    await expect(
      page.getByRole("switch", { name: "Updates", exact: true }),
    ).toHaveAttribute("aria-checked", "true");
    await expect(
      page.getByRole("radio", { name: "Email contact", exact: true }),
    ).toBeChecked();
    await email.fill("obsolete@example.com");
    await saveButton.click();
    await expect(status).toHaveText("Saving settings…");
    await page
      .getByRole("button", { name: "Stop waiting", exact: true })
      .click();
    assert.equal(
      await page.evaluate(() => window.fixture.signals[2].aborted),
      true,
    );
    await email.fill("current@example.com");
    await saveButton.click();
    await expect(status).toHaveText("Saving settings…");
    assert.equal((await calls()).length, 4);
    await resolveResult(2, { ok: true });
    await expect(status).toHaveText("Saving settings…");
    await resolveResult(3, {
      ok: false,
      message: "Contact unavailable.",
      fields: { contact: "Choose another contact method." },
    });
    await expect(status).toHaveText("Contact unavailable.");
    await expect(
      page.getByRole("radio", { name: "Email contact", exact: true }),
    ).toBeFocused();
    await saveButton.click();
    await expect(status).toHaveText("Saving settings…");
    await resetButton.click();
    await expect(email).toHaveValue("");
    assert.equal(
      await page.evaluate(() => window.fixture.signals[4].aborted),
      true,
    );
    await resolveResult(4, { ok: false, message: "Obsolete reset failure." });
    await expect(status).toHaveText(
      "Stopped waiting for the response. The server may still finish this request.",
    );
    await email.fill("unmounted@example.com");
    await saveButton.click();
    await expect(status).toHaveText("Saving settings…");
    await page
      .getByRole("button", { name: "Unmount form", exact: true })
      .click();
    assert.equal(
      await page.evaluate(() => window.fixture.signals[5].aborted),
      true,
    );
    await resolveResult(5, { ok: true });
    await expect(page.locator("form")).toHaveCount(0);
    await page
      .getByRole("button", { name: "Remount form", exact: true })
      .click();
    await expect(email).toHaveValue("");
    await expect(status).toHaveText("");
    await email.fill("rejection@example.com");
    await saveButton.click();
    await expect(status).toHaveText("Saving settings…");
    await page.evaluate(() => window.fixture.reject(6));
    await expect(status).toHaveText("Could not save settings. Try again.");
    await expect(email).toHaveValue("rejection@example.com");
    for (const theme of ["light", "dark"]) {
      await page
        .locator("html")
        .evaluate((el, theme) => (el.dataset.theme = theme), theme);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log(
    `React ${version} / RHF 7.90.0 shipped recipes passed: strict declarations, registration/Controller refs, actual payloads, validation focus, pending/overlap prevention, field/service failures, retry, reset/cancel/unmount and ignored late results.`,
  );
  // Compile the version-qualified legacy guidance against the actual old npm release.
  if (version === "18.3.1") {
    const legacy = await mkdtemp(join(tmpdir(), "contour-legacy-form-"));
    legacyDirectory = legacy;
    await writeFile(
      join(legacy, "package.json"),
      JSON.stringify({
        private: true,
        type: "module",
        dependencies: {
          "@abuzareal/contour-ui": "0.3.0",
          react: version,
          "react-dom": version,
        },
        devDependencies: {
          "@types/react": "^18.0.0",
          "@types/react-dom": "^18.0.0",
        },
      }),
    );
    install(legacy);
    await mkdir(join(legacy, "examples"));
    for (const file of [
      "ManualSettingsForm-0.3.0.tsx",
      "settings.ts",
      "useSubmission.ts",
    ])
      await cp(
        join(temporary, "examples", file),
        join(legacy, "examples", file),
      );
    await writeFile(
      join(legacy, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          jsx: "react-jsx",
          strict: true,
          noEmit: true,
          skipLibCheck: false,
        },
        include: ["examples/**/*"],
      }),
    );
    compile(legacy);
    console.log(
      "Complete manual-state recipe compiles against registry Contour 0.3.0.",
    );
  }
} finally {
  await browser?.close();
  await server?.close();
  if (legacyDirectory)
    await rm(legacyDirectory, { recursive: true, force: true });
  await rm(temporary, { recursive: true, force: true });
}
