import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { createServer } from "node:net";
import {
  mkdtemp,
  cp,
  readFile,
  writeFile,
  rm,
  stat,
  lstat,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { preview } from "vite";
import { chromium, expect } from "@playwright/test";
import { packedArchive } from "./packed-archive.mjs";
const temporary = await mkdtemp(join(tmpdir(), "contour-starters-"));
const registry = process.env.CONTOUR_STARTER_REGISTRY === "1";
const pkg = JSON.parse(await readFile("package.json", "utf8"));
const report = {
  mode: registry ? "published registry" : "candidate archive",
  packageVersion: pkg.version,
  cases: {},
};
let browser;
try {
  const archive = registry ? null : await packedArchive(temporary);
  const packageRoot = join(temporary, "package");
  if (archive) execFileSync("tar", ["-xzf", archive, "-C", temporary]);
  browser = await chromium.launch();
  const selected = process.argv[2];
  for (const kind of selected ? [selected] : ["vite", "next", "reproduction"]) {
    const source =
      kind === "reproduction"
        ? "examples/reproduction"
        : `examples/starters/${kind}`;
    const directory = join(temporary, kind);
    await cp(archive ? join(packageRoot, source) : source, directory, {
      recursive: true,
    });
    const manifest = JSON.parse(
      await readFile(join(directory, "package.json"), "utf8"),
    );
    assert.equal(manifest.dependencies[pkg.name], pkg.version);
    if (archive) manifest.dependencies[pkg.name] = `file:${archive}`;
    await writeFile(
      join(directory, "package.json"),
      JSON.stringify(manifest, null, 2) + "\n",
    );
    const run = (command, args) =>
      execFileSync(command, args, {
        cwd: directory,
        stdio: "inherit",
        env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      });
    run("npm", [
      "install",
      "--ignore-scripts",
      "--strict-peer-deps",
      "--include=dev",
      "--no-audit",
      "--no-fund",
      "--cache",
      join(tmpdir(), "contour-ui-npm-cache"),
    ]);
    // Verify a real installed copy and record resolved versions, not just declared ranges.
    const versions = {};
    for (const name of [
      pkg.name,
      "react",
      "react-dom",
      kind === "next" ? "next" : "vite",
      "typescript",
      "@types/react",
      "@types/react-dom",
      "@types/node",
    ])
      versions[name] = JSON.parse(
        await readFile(
          join(directory, "node_modules", name, "package.json"),
          "utf8",
        ),
      ).version;
    for (const optional of [
      "three",
      "lenis",
      "react-hook-form",
      "@tanstack/react-table",
    ])
      await assert.rejects(stat(join(directory, "node_modules", optional)), {
        code: "ENOENT",
      });
    assert.equal(
      (await lstat(join(directory, "node_modules", pkg.name))).isSymbolicLink(),
      false,
    );
    run("npm", ["run", "build"]);
    run("npm", ["run", "typecheck"]);
    let server,
      child,
      origin,
      serverLog = "";
    try {
      if (kind === "next") {
        const reservation = createServer();
        await new Promise((r) => reservation.listen(0, "127.0.0.1", r));
        const port = reservation.address().port;
        await new Promise((r) => reservation.close(r));
        child = spawn(
          process.execPath,
          [
            join(directory, "node_modules/next/dist/bin/next"),
            "start",
            "-p",
            String(port),
            "-H",
            "127.0.0.1",
          ],
          {
            cwd: directory,
            env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
            stdio: ["ignore", "pipe", "pipe"],
          },
        );
        child.stdout.on("data", (s) => (serverLog += s));
        child.stderr.on("data", (s) => (serverLog += s));
        origin = "http://127.0.0.1:" + port;
        let ready = false;
        for (let i = 0; i < 120; i++) {
          if (child.exitCode !== null) throw new Error(serverLog);
          try {
            const response = await fetch(origin);
            if (response.ok) {
              ready = true;
              break;
            }
          } catch {}
          await new Promise((r) => setTimeout(r, 250));
        }
        assert.ok(ready, serverLog);
      } else {
        server = await preview({
          root: directory,
          configFile: false,
          preview: { host: "127.0.0.1", port: 0 },
        });
        origin = "http://127.0.0.1:" + server.httpServer.address().port;
      }
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        reducedMotion: "reduce",
      });
      // Set a persisted preference before any application script runs.
      await context.addInitScript(() => {
        if (localStorage.getItem("aa-theme") === null)
          localStorage.setItem("aa-theme", "dark");
        window.firstTheme = "";
        new MutationObserver(() => {
          if (!window.firstTheme && document.documentElement.dataset.theme)
            window.firstTheme = document.documentElement.dataset.theme;
        }).observe(document, {
          subtree: true,
          attributes: true,
          attributeFilter: ["data-theme"],
        });
      });
      const page = await context.newPage();
      page.setDefaultTimeout(5000);
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (e) => {
        if (e.type() === "error") errors.push(e.text());
      });
      const response = await page.goto(origin, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200);
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      assert.equal(await page.evaluate(() => window.firstTheme), "dark");
      const csp =
        kind === "next"
          ? response.headers()["content-security-policy"]
          : await page
              .locator('meta[http-equiv="Content-Security-Policy"]')
              .getAttribute("content");
      assert.ok(csp.includes("script-src"));
      assert.ok(!/script-src[^;]*unsafe-inline|unsafe-eval/.test(csp));
      if (kind === "next") {
        const nonce = await page
          .locator("head script")
          .first()
          .evaluate((e) => e.nonce);
        assert.ok(nonce && csp.includes(`nonce-${nonce}`));
        const second = await fetch(origin);
        assert.notEqual(second.headers.get("content-security-policy"), csp);
      }
      if (kind === "reproduction") {
        await page
          .getByRole("button", { name: "Open dialog", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Open popover", exact: true })
          .click();
        await page
          .getByRole("combobox", { name: "Choice", exact: true })
          .fill("One");
        await page.getByRole("option", { name: "One", exact: true }).click();
        await page.keyboard.press("Escape");
        await expect(
          page.getByRole("dialog", { name: "Nested layer", exact: true }),
        ).toBeHidden();
        await page.keyboard.press("Escape");
      } else {
        await page
          .getByRole("button", { name: "Focus name", exact: true })
          .click();
        await expect(
          page.getByRole("textbox", { name: "Name", exact: true }),
        ).toBeFocused();
        await page
          .getByRole("textbox", { name: "Name", exact: true })
          .fill("Grace");
        const combo = page.getByRole("combobox", {
          name: "Project",
          exact: true,
        });
        await combo.fill("Field");
        await page
          .getByRole("option", { name: "Field notes", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Inspect values", exact: true })
          .click();
        await expect(page.getByLabel("Form values")).toContainText(
          '"project":"field"',
        );
        await page
          .getByRole("button", { name: "Reset form", exact: true })
          .click();
        await expect(combo).toHaveValue("Atlas");
        await expect(
          page.getByRole("textbox", { name: "Name", exact: true }),
        ).toHaveValue("Ada");
        const trigger = page.getByRole("button", {
          name: "Open dialog",
          exact: true,
        });
        await trigger.click();
        const dialog = page.getByRole("dialog", {
          name: "Starter dialog",
          exact: true,
        });
        await expect(dialog).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(trigger).toBeFocused();
        const toggle = page.getByRole("button", {
          name: "Dark theme",
          exact: true,
        });
        await toggle.click();
        await expect(page.locator("html")).toHaveAttribute(
          "data-theme",
          "light",
        );
        await page.reload({ waitUntil: "networkidle" });
        await expect(page.locator("html")).toHaveAttribute(
          "data-theme",
          "light",
        );
        if (kind === "next") {
          await page
            .getByRole("link", { name: "Next page", exact: true })
            .click();
          await expect(
            page.getByRole("heading", { name: "Next page", exact: true }),
          ).toBeVisible();
          await page
            .getByRole("link", { name: "Return to starter", exact: true })
            .click();
          await expect(
            page.getByRole("heading", {
              name: "Contour Next starter",
              exact: true,
            }),
          ).toBeVisible();
        }
      }
      assert.deepEqual(errors, []);
      report.cases[kind] = {
        versions,
        strictTypes: "pass",
        productionBuild: "pass",
        browser: "pass",
        themeCsp: "pass",
        optionalPeers: "absent",
      };
      await context.close();
    } finally {
      if (child) {
        const exited = new Promise((r) => child.once("exit", r));
        child.kill("SIGTERM");
        await exited;
      }
      if (server) await new Promise((r) => server.httpServer.close(r));
    }
  }
  if (process.env.CONTOUR_STARTER_OUTPUT)
    await writeFile(
      process.env.CONTOUR_STARTER_OUTPUT,
      JSON.stringify(report, null, 2) + "\n",
    );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser?.close();
  await rm(temporary, { recursive: true, force: true });
}
