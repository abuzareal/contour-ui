import assert from "node:assert/strict";
import { mkdtemp, writeFile, cp, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build, preview } from "vite";
import { chromium, expect } from "@playwright/test";
import { packedArchive } from "./packed-archive.mjs";
const react = process.env.CONTOUR_REACT_VERSION ?? "18.3.1";
const temporary = await mkdtemp(join(tmpdir(), "contour-adoption-"));
let browser, server;
try {
  const archive = await packedArchive(temporary);
  await writeFile(
    join(temporary, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      dependencies: {
        "@abuzareal/contour-ui": `file:${archive}`,
        react,
        "react-dom": react,
        "@tanstack/react-table": "9.3.1",
        "@tanstack/react-store": "0.11.2",
      },
      devDependencies: {
        "@types/react": `^${react.split(".")[0]}.0.0`,
        "@types/react-dom": `^${react.split(".")[0]}.0.0`,
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
      "--cache",
      join(tmpdir(), "contour-ui-npm-cache"),
    ],
    { cwd: temporary, stdio: "inherit" },
  );
  await cp(
    join(temporary, "node_modules/@abuzareal/contour-ui/examples/recipes"),
    join(temporary, "recipes"),
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
        skipLibCheck: false,
        noEmit: true,
      },
      include: ["recipes/**/*", "main.tsx"],
    }),
  );
  await writeFile(
    join(temporary, "index.html"),
    '<html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
  );
  await writeFile(
    join(temporary, "main.tsx"),
    `
import {useState} from 'react';import {createRoot} from 'react-dom/client';import {AsyncProjectPicker} from './recipes/AsyncProjectPicker.js';import {DeleteProjectConfirmation} from './recipes/DeleteProjectConfirmation.js';import {PasswordField,QuantityField} from './recipes/InputCompositions.js';import {RemoteRecordsTable,parseRecordsPage,type RecordsQuery,type RecordsPage} from './recipes/RemoteRecordsTable.js';import {RecipeServiceError} from './recipes/useRemoteResource.js';import type {ComboboxOption} from '@abuzareal/contour-ui';import '@abuzareal/contour-ui/scoped.css';
function requests<Q,T>(){const pending:{query:Q;signal:AbortSignal;resolve:(value:T)=>void;reject:(error:Error)=>void}[]=[];return {pending,load:(query:Q,signal:AbortSignal)=>new Promise<T>((resolve,reject)=>pending.push({query,signal,resolve,reject}))};}
const search=requests<string,readonly ComboboxOption[]>(),table=requests<RecordsQuery,RecordsPage>(),deletion=requests<string,void>();
const fixture={search,table,deletion,deleted:[] as string[],fail:(kind:'search'|'table'|'deletion',index:number,permission=false)=>{fixture[kind].pending[index].reject(new RecipeServiceError(permission?'permission':'service'));},parseRecordsPage};declare global{interface Window{fixture:typeof fixture;unmount:()=>void}}window.fixture=fixture;
function App(){const [show,setShow]=useState(true),[project,setProject]=useState({id:'p1',name:'Demo project'});return <main className="contour-root" style={{padding:20,maxWidth:700}}><h1>Copied application recipes</h1><p>Local test fixture. No service or deletion is real.</p><form id="picker" onSubmit={e=>e.preventDefault()}><AsyncProjectPicker searchProjects={search.load}/></form>{show&&<DeleteProjectConfirmation project={project} deleteProject={deletion.load} onDeleted={id=>fixture.deleted.push(id)}/>}<button onClick={()=>setShow(!show)}>Toggle confirmation</button><button onClick={()=>setProject({id:'p2',name:'Other project'})}>Change project</button><RemoteRecordsTable loadRecords={table.load}/><form id="inputs"><PasswordField/><QuantityField/></form></main>}
const root=createRoot(document.getElementById('root')!);root.render(<App/>);window.unmount=()=>root.unmount();`,
  );
  execFileSync(
    process.execPath,
    [
      resolve("node_modules/typescript/bin/tsc"),
      "-p",
      join(temporary, "tsconfig.json"),
    ],
    { stdio: "inherit" },
  );
  await build({ root: temporary, configFile: false, logLevel: "warn" });
  server = await preview({
    root: temporary,
    configFile: false,
    preview: { host: "127.0.0.1", port: 0 },
  });
  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (e) => {
    if (e.type() === "error") errors.push(e.text());
  });
  await page.goto("http://127.0.0.1:" + server.httpServer.address().port);
  const latest = async (kind) => {
    await page.waitForFunction(
      (kind) => window.fixture[kind].pending.length > 0,
      kind,
    );
    return page.evaluate(
      (kind) => window.fixture[kind].pending.length - 1,
      kind,
    );
  };
  const finish = (kind, index, data) =>
    page.evaluate(
      ({ kind, index, data }) =>
        window.fixture[kind].pending[index].resolve(data),
      { kind, index, data },
    );
  const fail = (kind, index, permission = false) =>
    page.evaluate(
      ({ kind, index, permission }) =>
        window.fixture.fail(kind, index, permission),
      { kind, index, permission },
    );
  const count = (kind) =>
    page.evaluate((kind) => window.fixture[kind].pending.length, kind);
  const input = page.getByRole("combobox", { name: "Project", exact: true });
  await finish("search", await latest("search"), []);
  await input.fill("a");
  const slow = await latest("search");
  await input.fill("ab");
  const fast = await latest("search");
  assert.ok(fast > slow);
  assert.equal(
    await page.evaluate(
      (index) => window.fixture.search.pending[index].signal.aborted,
      slow,
    ),
    true,
  );
  await finish("search", fast, [{ value: "ab", label: "Abstract project" }]);
  await finish("search", slow, [{ value: "a", label: "Stale Alpha" }]);
  await expect(
    page.getByRole("option", { name: "Abstract project", exact: true }),
  ).toBeVisible();
  assert.equal(
    await page
      .getByRole("option", { name: "Stale Alpha", exact: true })
      .count(),
    0,
  );
  await page
    .getByRole("option", { name: "Abstract project", exact: true })
    .click();
  assert.equal(
    await page
      .locator("#picker")
      .evaluate((e) => new FormData(e).get("project")),
    "ab",
  );
  await input.fill("failure");
  await fail("search", await latest("search"));
  await expect(
    page.getByRole("button", { name: "Retry search", exact: true }),
  ).toBeVisible();
  const beforeRetry = await count("search");
  await page.getByRole("button", { name: "Retry search", exact: true }).click();
  await page.waitForFunction(
    (n) => window.fixture.search.pending.length > n,
    beforeRetry,
  );
  await finish("search", await latest("search"), [
    { value: "r", label: "Recovered project" },
  ]);
  await expect(
    page.getByRole("option", { name: "Recovered project", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await input.fill("translate");
  await finish("search", await latest("search"), [
    { value: "ab", label: "Projet traduit" },
  ]);
  await expect(
    page.getByRole("option", { name: "Projet traduit", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(input).toHaveValue("Projet traduit");
  assert.equal(
    await page
      .locator("#picker")
      .evaluate((e) => new FormData(e).get("project")),
    "ab",
  );
  await page
    .getByRole("button", { name: "Delete Demo project", exact: true })
    .click();
  const modal = page.getByRole("dialog", {
    name: "Delete Demo project?",
    exact: true,
  });
  await expect(
    modal.getByRole("button", { name: "Keep project", exact: true }),
  ).toBeFocused();
  await modal
    .getByRole("button", { name: "Permanently delete project", exact: true })
    .click();
  await expect(
    modal.getByRole("button", { name: "Deleting…", exact: true }),
  ).toBeDisabled();
  await fail("deletion", await latest("deletion"));
  await expect(modal.getByRole("alert")).toContainText(
    "could not be confirmed",
  );
  assert.deepEqual(await page.evaluate(() => window.fixture.deleted), []);
  await modal
    .getByRole("button", { name: "Permanently delete project", exact: true })
    .click();
  const canceled = await latest("deletion");
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  assert.equal(
    await page.evaluate(
      (index) => window.fixture.deletion.pending[index].signal.aborted,
      canceled,
    ),
    true,
  );
  await finish("deletion", canceled);
  assert.deepEqual(await page.evaluate(() => window.fixture.deleted), []);
  await expect(
    page.getByRole("button", { name: "Delete Demo project", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Delete Demo project", exact: true })
    .click();
  await modal
    .getByRole("button", { name: "Permanently delete project", exact: true })
    .click();
  await finish("deletion", await latest("deletion"));
  await expect(modal).toBeHidden();
  assert.deepEqual(await page.evaluate(() => window.fixture.deleted), ["p1"]);
  // Parent-driven target changes/unmounts can happen while a native modal is active.
  await page
    .getByRole("button", { name: "Delete Demo project", exact: true })
    .click();
  await modal
    .getByRole("button", { name: "Permanently delete project", exact: true })
    .click();
  const changedTarget = await latest("deletion");
  await page
    .getByRole("button", {
      name: "Change project",
      exact: true,
      includeHidden: true,
    })
    .evaluate((element) => element.click());
  await expect(
    page.getByRole("button", { name: "Delete Other project", exact: true }),
  ).toBeVisible();
  assert.equal(
    await page.evaluate(
      (index) => window.fixture.deletion.pending[index].signal.aborted,
      changedTarget,
    ),
    true,
  );
  await finish("deletion", changedTarget);
  assert.deepEqual(await page.evaluate(() => window.fixture.deleted), ["p1"]);
  await page
    .getByRole("button", { name: "Delete Other project", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Delete Other project?", exact: true })
    .getByRole("button", { name: "Permanently delete project", exact: true })
    .click();
  const removed = await latest("deletion");
  await page
    .getByRole("button", {
      name: "Toggle confirmation",
      exact: true,
      includeHidden: true,
    })
    .evaluate((element) => element.click());
  assert.equal(
    await page.evaluate(
      (index) => window.fixture.deletion.pending[index].signal.aborted,
      removed,
    ),
    true,
  );
  await finish("deletion", removed);
  assert.deepEqual(await page.evaluate(() => window.fixture.deleted), ["p1"]);
  const firstPage = {
    rows: [{ id: "a", name: "Ada", owner: "Engineering" }],
    total: 25,
    unfilteredTotal: 25,
  };
  await finish("table", await latest("table"), firstPage);
  const table = page.getByRole("table", {
    name: "Records returned by the service",
    exact: true,
  });
  await expect(
    table.getByRole("cell", { name: "Ada", exact: true }),
  ).toBeVisible();
  const beforeSort = await count("table");
  await table.getByRole("button", { name: "Name", exact: true }).click();
  await page.waitForFunction(
    (n) => window.fixture.table.pending.length > n,
    beforeSort,
  );
  const sortIndex = await latest("table");
  assert.equal(
    await page.evaluate(
      (index) => window.fixture.table.pending[index].query.sorting[0]?.id,
      sortIndex,
    ),
    "name",
  );
  await fail("table", sortIndex);
  await expect(
    page.getByRole("alert").filter({ hasText: "Records could not be loaded" }),
  ).toBeVisible();
  await expect(
    table.getByRole("cell", { name: "Ada", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Retry records", exact: true })
    .click();
  await finish("table", await latest("table"), firstPage);
  await expect(
    page.getByRole("button", { name: "Next page", exact: true }),
  ).toBeEnabled();
  const beforePage = await count("table");
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await page.waitForFunction(
    (n) => window.fixture.table.pending.length > n,
    beforePage,
  );
  assert.equal(
    await page.evaluate(
      (index) => window.fixture.table.pending[index].query.pagination.pageIndex,
      await latest("table"),
    ),
    1,
  );
  await finish("table", await latest("table"), {
    ...firstPage,
    rows: [{ id: "g", name: "Grace", owner: "Research" }],
  });
  await expect(
    table.getByRole("cell", { name: "Grace", exact: true }),
  ).toBeVisible();
  const filter = page.getByRole("textbox", {
    name: "Filter records",
    exact: true,
  });
  await filter.fill("G");
  await page.waitForFunction(
    () => window.fixture.table.pending.at(-1)?.query.filter === "G",
  );
  const tableSlow = await latest("table");
  await filter.fill("Gr");
  await page.waitForFunction(
    () => window.fixture.table.pending.at(-1)?.query.filter === "Gr",
  );
  const tableFast = await latest("table");
  await finish("table", tableFast, {
    rows: [{ id: "g", name: "Grace latest", owner: "Research" }],
    total: 1,
    unfilteredTotal: 25,
  });
  await finish("table", tableSlow, firstPage);
  await expect(
    table.getByRole("cell", { name: "Grace latest", exact: true }),
  ).toBeVisible();
  assert.equal(
    await table.getByRole("cell", { name: "Ada", exact: true }).count(),
    0,
  );
  await filter.fill("none");
  await finish("table", await latest("table"), {
    rows: [],
    total: 0,
    unfilteredTotal: 25,
  });
  await expect(
    page.getByText("No records match this filter.", { exact: true }),
  ).toBeVisible();
  assert.equal(
    await page.evaluate(
      (index) => window.fixture.table.pending[index].query.pagination.pageIndex,
      await latest("table"),
    ),
    0,
  );
  await filter.fill("empty");
  await finish("table", await latest("table"), {
    rows: [],
    total: 0,
    unfilteredTotal: 0,
  });
  await expect(
    page.getByText("No records exist yet.", { exact: true }),
  ).toBeVisible();
  await filter.fill("forbidden");
  await fail("table", await latest("table"), true);
  await expect(
    page.getByText("You do not have permission to view these records.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(table).toBeHidden();
  await filter.fill("new permission check");
  await expect(table).toBeHidden();
  const invalid = await page.evaluate(() => {
    let rejected = 0;
    for (const value of [
      {
        rows: [
          { id: "x", name: "X", owner: "A" },
          { id: "x", name: "Y", owner: "B" },
        ],
        total: 2,
        unfilteredTotal: 2,
      },
      { rows: [], total: -1, unfilteredTotal: 0 },
      { rows: [], total: 1.5, unfilteredTotal: 2 },
      { rows: [null], total: 1, unfilteredTotal: 1 },
    ]) {
      try {
        window.fixture.parseRecordsPage(value, 10);
      } catch {
        rejected++;
      }
    }
    return rejected;
  });
  assert.equal(invalid, 4);
  const password = page.getByLabel("Password", { exact: true });
  await password.fill("fixture-password");
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await expect(password).toHaveAttribute("type", "text");
  await expect(password).toBeFocused();
  assert.equal(
    await page
      .locator("#inputs")
      .evaluate((e) => new FormData(e).get("password")),
    "fixture-password",
  );
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await expect(password).toHaveAttribute("type", "password");
  const pendingSearch = await latest("search");
  await page.evaluate(() => window.unmount());
  assert.equal(
    await page.evaluate(
      (index) => window.fixture.search.pending[index].signal.aborted,
      pendingSearch,
    ),
    true,
  );
  await finish("search", pendingSearch, []);
  assert.deepEqual(errors, []);
  console.log(
    `Copied async/confirmation/remote table/input recipes passed on React ${react}; strict declarations and production build passed.`,
  );
} finally {
  await browser?.close();
  if (server) await new Promise((r) => server.httpServer.close(r));
  await rm(temporary, { recursive: true, force: true });
}
