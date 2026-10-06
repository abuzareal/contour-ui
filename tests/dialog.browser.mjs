import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build, preview } from "vite";
import { chromium } from "@playwright/test";

test("native dialogs and drawers lock scrolling without moving content, including nested and unmounted dialogs", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "contour-dialog-"));
  let server;
  let browser;
  try {
    await writeFile(
      join(temporary, "index.html"),
      '<html style="overflow:auto!important;overscroll-behavior:contain"><div id="root"></div><script type="module" src="/main.js"></script></html>',
    );
    await writeFile(
      join(temporary, "main.js"),
      `
import React from ${JSON.stringify(resolve("node_modules/react/index.js"))};
import { createRoot } from ${JSON.stringify(resolve("node_modules/react-dom/client.js"))};
import { Dialog } from ${JSON.stringify(resolve("dist/index.js"))};
import ${JSON.stringify(resolve("dist/reset.css"))};
import ${JSON.stringify(resolve("dist/styles.css"))};
const h = React.createElement;
function App() {
  const [open, setOpen] = React.useState(false);
  const [nested, setNested] = React.useState(false);
  const [mounted, setMounted] = React.useState(true);
  const placement = new URLSearchParams(location.search).get('placement') || 'center';
  return h(React.Fragment, null,
    h('button', { style: { position: 'fixed', top: 12, left: 12 }, onClick: () => setOpen(true) }, 'Open'),
    h('div', { id: 'marker', style: { width: '80%', maxWidth: 600, margin: '100px auto', height: 4000 } }, 'Background'),
    mounted && h(Dialog, { open, placement, title: 'First dialog', onClose: () => setOpen(false) },
      h('button', { onClick: () => setNested(true) }, 'Open nested'),
      h('button', { onClick: () => setMounted(false) }, 'Unmount'),
      h('div', { style: { height: 1500 } }, 'Long content'),
      h(Dialog, { open: nested, title: 'Nested dialog', onClose: () => setNested(false) }, 'Nested content')));
}
createRoot(document.getElementById('root')).render(h(React.StrictMode, null, h(App)));
`,
    );
    await build({ root: temporary, configFile: false, logLevel: "warn" });
    server = await preview({
      root: temporary,
      configFile: false,
      preview: { host: "127.0.0.1", port: 0 },
    });
    const port = server.httpServer.address().port;
    browser = await chromium.launch();
    for (const width of [390, 1440]) {
      for (const placement of ["center", "left", "right"]) {
        const page = await browser.newPage({
          viewport: { width, height: 600 },
          reducedMotion: "reduce",
        });
        await page.goto(`http://127.0.0.1:${port}/?placement=${placement}`);
        await page.getByRole("button", { name: "Open", exact: true }).waitFor();
        await page.mouse.move(width / 2, 400);
        await page.mouse.wheel(0, 300);
        await page.waitForTimeout(150);
        const initial = await page.evaluate(() => ({
          top: scrollY,
          left: document.querySelector("#marker").getBoundingClientRect().left,
          style: ["overflow", "overscroll-behavior", "scrollbar-gutter"].map(
            (name) => [
              document.documentElement.style.getPropertyValue(name),
              document.documentElement.style.getPropertyPriority(name),
            ],
          ),
        }));
        assert.ok(initial.top > 0);
        await page.getByRole("button", { name: "Open", exact: true }).click();
        const first = page.getByRole("dialog", {
          name: "First dialog",
          exact: true,
        });
        await first.waitFor();
        assert.equal(
          await page.evaluate(
            () =>
              document.querySelector("#marker").getBoundingClientRect().left,
          ),
          initial.left,
        );
        await page.mouse.move(2, 2);
        await page.mouse.wheel(0, 700);
        await page.waitForTimeout(150);
        assert.equal(await page.evaluate(() => scrollY), initial.top);
        await first.hover();
        await page.mouse.wheel(0, 300);
        await page.waitForTimeout(150);
        assert.ok(await first.evaluate((element) => element.scrollTop > 0));
        assert.equal(await page.evaluate(() => scrollY), initial.top);
        await first.evaluate((element) => (element.scrollTop = 0));
        await page
          .getByRole("button", { name: "Open nested", exact: true })
          .click();
        await page
          .getByRole("dialog", { name: "Nested dialog", exact: true })
          .getByRole("button", { name: "Close dialog" })
          .click();
        assert.equal(
          await page.evaluate(
            () => getComputedStyle(document.documentElement).overflow,
          ),
          "hidden",
        );
        if (placement === "center") await page.keyboard.press("Escape");
        else if (placement === "left")
          await first.getByRole("button", { name: "Close dialog" }).click();
        else await page.mouse.click(2, 2);
        await first.waitFor({ state: "hidden" });
        assert.equal(await page.evaluate(() => scrollY), initial.top);
        assert.deepEqual(
          await page.evaluate(() =>
            ["overflow", "overscroll-behavior", "scrollbar-gutter"].map(
              (name) => [
                document.documentElement.style.getPropertyValue(name),
                document.documentElement.style.getPropertyPriority(name),
              ],
            ),
          ),
          initial.style,
        );
        await page.mouse.move(width / 2, 400);
        await page.mouse.wheel(0, 300);
        await page.waitForTimeout(150);
        assert.ok(await page.evaluate(() => scrollY > 300));
        await page.getByRole("button", { name: "Open", exact: true }).click();
        await page
          .getByRole("button", { name: "Unmount", exact: true })
          .click();
        assert.deepEqual(
          await page.evaluate(() =>
            ["overflow", "overscroll-behavior", "scrollbar-gutter"].map(
              (name) => [
                document.documentElement.style.getPropertyValue(name),
                document.documentElement.style.getPropertyPriority(name),
              ],
            ),
          ),
          initial.style,
        );
        await page.close();
      }
    }
  } finally {
    await browser?.close();
    if (server)
      await new Promise((resolve) => server.httpServer.close(resolve));
    await rm(temporary, { recursive: true, force: true });
  }
});
