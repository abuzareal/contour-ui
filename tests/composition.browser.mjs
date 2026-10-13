import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build, preview } from "vite";
import { chromium, expect } from "@playwright/test";

test("native ref focus, modal cancellation and styled links preserve real browser defaults", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "contour-composition-"));
  let browser, server;
  try {
    await writeFile(
      join(temporary, "index.html"),
      '<html><div id="root"></div><script type="module" src="/main.js"></script></html>',
    );
    await writeFile(
      join(temporary, "main.js"),
      `
import React, { useRef, useState } from ${JSON.stringify(resolve("node_modules/react/index.js"))};
import { createRoot } from ${JSON.stringify(resolve("node_modules/react-dom/client.js"))};
import { Button, Dialog, Tabs, buttonClassName } from ${JSON.stringify(resolve("dist/index.js"))};
import ${JSON.stringify(resolve("dist/reset.css"))};
import ${JSON.stringify(resolve("dist/styles.css"))};
const h = React.createElement;
const layoutTabs = [{ id: "one", label: "One", content: "First" }, { id: "two", label: "Two", content: "Second" }];
function App() {
 const action = useRef(null), body = useRef(null);
 const [open, setOpen] = useState(false), [veto, setVeto] = useState(true);
 const [padding, setPadding] = useState(0);
 return h('main', null,
  h('h1', null, location.pathname === '/next' ? 'Destination' : 'Controls'),
  h(Tabs, { label: 'Layout views', tabs: layoutTabs, listProps: { style: { paddingLeft: padding } } }),
  h(Button, { onClick: () => setPadding(40) }, 'Change tab padding'),
  h(Button, { ref: action }, 'Measured action'),
  h(Button, { onClick: () => action.current.focus() }, 'Focus action'),
  h(Button, { onClick: () => setOpen(true) }, 'Open modal'),
  h(Dialog, { open, title: 'Settings', onClose: () => setOpen(false),
   onCancel: event => { if (veto) event.preventDefault(); }, bodyProps: { ref: body, id: 'settings-content' } },
   h(Button, { onClick: () => setVeto(false) }, 'Allow dismissal')),
  h('a', { href: '/next', className: buttonClassName('secondary') }, 'Native destination'),
  h('a', { href: '/next', className: buttonClassName('secondary'), onClick: event => event.preventDefault() }, 'Canceled destination'));
}
createRoot(document.getElementById('root')).render(h(App));
`,
    );
    await build({ root: temporary, configFile: false, logLevel: "warn" });
    server = await preview({
      root: temporary,
      configFile: false,
      preview: { host: "127.0.0.1", port: 0 },
    });
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    browser = await chromium.launch({ channel: "chromium" });
    const page = await browser.newPage({
      viewport: { width: 390, height: 800 },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(origin);
    const list = page.getByRole("tablist", { name: "Layout views" });
    const before = await list.evaluate((element) =>
      Number.parseFloat(element.style.getPropertyValue("--indicator-left")),
    );
    await page
      .getByRole("button", { name: "Change tab padding", exact: true })
      .click();
    await expect
      .poll(() =>
        list.evaluate((element) =>
          Number.parseFloat(element.style.getPropertyValue("--indicator-left")),
        ),
      )
      .toBe(before + 40);
    await page
      .getByRole("button", { name: "Focus action", exact: true })
      .click();
    const action = page.getByRole("button", {
      name: "Measured action",
      exact: true,
    });
    await expect(action).toBeFocused();
    assert.ok((await action.boundingBox()).width > 0);
    await page.getByRole("button", { name: "Open modal", exact: true }).click();
    const modal = page.getByRole("dialog", { name: "Settings" });
    await expect(modal).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(modal).toBeVisible();
    assert.equal(
      await page.evaluate(() =>
        document.querySelector("dialog").matches(":modal"),
      ),
      true,
    );
    await page
      .getByRole("button", { name: "Allow dismissal", exact: true })
      .click();
    await page.keyboard.press("Escape");
    await expect(modal).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Open modal", exact: true }),
    ).toBeFocused();
    await page
      .getByRole("link", { name: "Canceled destination", exact: true })
      .click();
    assert.equal(new URL(page.url()).pathname, "/");
    const popupPromise = page.context().waitForEvent("page");
    await page
      .getByRole("link", { name: "Native destination", exact: true })
      .click({
        button: "middle",
      });
    const popup = await popupPromise;
    await popup.waitForLoadState();
    assert.equal(new URL(popup.url()).pathname, "/next");
    assert.equal(new URL(page.url()).pathname, "/");
    await popup.close();
    await page
      .getByRole("link", { name: "Native destination", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Destination" }),
    ).toBeVisible();
    assert.equal(new URL(page.url()).pathname, "/next");
    assert.deepEqual(errors, []);
  } finally {
    await browser?.close();
    await server?.close();
    await rm(temporary, { recursive: true, force: true });
  }
});
