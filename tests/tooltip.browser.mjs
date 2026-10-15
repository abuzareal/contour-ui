import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build, preview } from "vite";
import { chromium, expect } from "@playwright/test";

test("closed portalled tooltips never widen the document before opening or after dismissal", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "contour-tooltip-"));
  let browser, server;
  try {
    browser = await chromium.launch();
    for (const stylesheet of ["styles.css", "scoped.css"]) {
      await writeFile(
        join(temporary, "index.html"),
        '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0"><div id="root"></div><script type="module" src="/main.jsx"></script></body></html>',
      );
      await writeFile(
        join(temporary, "main.jsx"),
        `
import React from ${JSON.stringify(resolve("node_modules/react/index.js"))};
import {createRoot} from ${JSON.stringify(resolve("node_modules/react-dom/client.js"))};
import {Button,Tooltip,ThemeScope} from ${JSON.stringify(resolve("dist/index.js"))};
import ${JSON.stringify(resolve("dist", stylesheet))};
const params=new URLSearchParams(location.search);document.documentElement.dataset.theme=params.get('theme');
createRoot(document.getElementById('root')).render(<ThemeScope theme={params.get('theme')} dir={params.get('dir')}><main><h1>Tooltip geometry</h1><Tooltip placement="right" content="A supplemental description"><Button>Hint trigger</Button></Tooltip><button>After hint</button></main></ThemeScope>);
`,
      );
      await build({
        root: temporary,
        configFile: false,
        logLevel: "silent",
        resolve: {
          alias: {
            "react/jsx-runtime": resolve("node_modules/react/jsx-runtime.js"),
          },
        },
      });
      server = await preview({
        root: temporary,
        configFile: false,
        preview: { host: "127.0.0.1", port: 0 },
      });
      const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
      for (const width of [320, 1440])
        for (const theme of ["light", "dark"])
          for (const dir of ["ltr", "rtl"]) {
            const page = await browser.newPage({
              viewport: { width, height: 900 },
            });
            await page.goto(`${origin}/?theme=${theme}&dir=${dir}`);
            const trigger = page.getByRole("button", { name: "Hint trigger" });
            await expect(trigger).toBeVisible();
            await expect(
              page.locator("body > .contour-floating-root"),
            ).toHaveCount(1);
            const fits = () =>
              page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
              );
            assert.equal(
              await fits(),
              true,
              `Closed ${stylesheet}/${width}/${theme}/${dir} widens the document`,
            );
            await expect(trigger).toHaveAccessibleDescription(
              "A supplemental description",
            );
            await trigger.focus();
            const tooltip = page.getByRole("tooltip");
            await expect(tooltip).toBeVisible();
            await expect
              .poll(() =>
                tooltip.evaluate((element) => {
                  const box = element.getBoundingClientRect();
                  return box.left >= 0 && box.right <= innerWidth;
                }),
              )
              .toBe(true);
            await page.keyboard.press("Escape");
            await expect(tooltip).toBeHidden();
            assert.equal(
              await fits(),
              true,
              `Dismissed ${stylesheet}/${width}/${theme}/${dir} widens the document`,
            );
            await expect(trigger).toHaveAccessibleDescription(
              "A supplemental description",
            );
            await page.getByRole("button", { name: "After hint" }).focus();
            await trigger.focus();
            await expect(tooltip).toBeVisible();
            await page.close();
          }
      await new Promise((resolve) => server.httpServer.close(resolve));
      server = undefined;
    }
  } finally {
    await browser?.close();
    if (server)
      await new Promise((resolve) => server.httpServer.close(resolve));
    await rm(temporary, { recursive: true, force: true });
  }
});
