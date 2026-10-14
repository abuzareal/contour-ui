import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build, preview } from "vite";
import { chromium, expect } from "@playwright/test";

test("Combobox native forms, state changes, keyboard, popup ownership and table semantics", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "contour-expansion-"));
  let server, browser;
  try {
    await writeFile(
      join(temporary, "index.html"),
      '<html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
    );
    await writeFile(
      join(temporary, "main.tsx"),
      `import React from ${JSON.stringify(resolve("node_modules/react/index.js"))};import {createRoot} from ${JSON.stringify(resolve("node_modules/react-dom/client.js"))};import App from ${JSON.stringify(resolve("tests/fixtures/Expansion.tsx"))};import ${JSON.stringify(resolve("dist/scoped.css"))};const root=createRoot(document.getElementById('root'));root.render(<App/>);window.unmount=()=>root.unmount();window.mountOwner=(element)=>{const owner=createRoot(element);owner.render(<App/>);window.unmountOwner=()=>owner.unmount();};`,
    );
    const alias = {
      "@abuzareal/contour-ui": resolve("dist/index.js"),
      react: resolve("node_modules/react"),
      "react-dom": resolve("node_modules/react-dom"),
    };
    await build({
      root: temporary,
      configFile: false,
      logLevel: "warn",
      resolve: { alias },
    });
    server = await preview({
      root: temporary,
      configFile: false,
      preview: { host: "127.0.0.1", port: 0 },
    });
    browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 390, height: 740 },
      hasTouch: true,
      reducedMotion: "reduce",
    });
    page.setDefaultTimeout(5000);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (e) => {
      if (e.type() === "error") errors.push(e.text());
    });
    const origin = "http://127.0.0.1:" + server.httpServer.address().port;
    await page.goto(origin);
    const data = (id) =>
      page.evaluate(
        (id) => Object.fromEntries(new FormData(document.getElementById(id))),
        id,
      );
    const choice = page.getByRole("combobox", { name: "Choice", exact: true });
    await expect(choice).toHaveValue("Alpha");
    assert.deepEqual(await data("native"), { choice: "a", external: "c" });
    await page
      .getByRole("button", { name: "Focus input", exact: true })
      .click();
    await expect(choice).toBeFocused();
    await choice.fill("caf");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(choice).toHaveValue("Café");
    assert.equal((await data("native")).choice, "c");
    await page
      .getByRole("button", { name: "Reset native", exact: true })
      .click();
    await expect(choice).toHaveValue("Alpha");
    assert.equal((await data("native")).choice, "a");
    await choice.fill("br");
    await expect(
      page.getByRole("option", { name: "Bravo", exact: true }),
    ).toHaveAttribute("aria-disabled", "true");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    assert.equal((await data("native")).choice, "a");
    await page.keyboard.press("Escape");
    await choice.fill("caf");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Tab");
    assert.equal((await data("native")).choice, "a");
    await expect(choice).toHaveAttribute("aria-expanded", "false");
    await expect(
      page.getByRole("button", { name: "Reset native", exact: true }),
    ).toBeFocused();
    assert.equal(
      await page.evaluate(
        () => !!document.activeElement.closest('[aria-hidden="true"]'),
      ),
      false,
    );
    await choice.click();
    await expect(choice).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Shift+Tab");
    await expect(
      page.getByRole("button", { name: "Before fields", exact: true }),
    ).toBeFocused();
    await expect(choice).toHaveAttribute("aria-expanded", "false");
    assert.equal(
      await page.evaluate(
        () => !!document.activeElement.closest('[aria-hidden="true"]'),
      ),
      false,
    );
    await choice.click();
    await choice.fill("");
    await expect(choice).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.locator(".contour-combobox-popup .contour-combobox-status"),
    ).toHaveCSS("padding-top", "0px");
    await expect(
      page.locator(".contour-combobox-popup .contour-combobox-status"),
    ).toHaveAttribute("aria-live", "polite");
    assert.equal((await data("native")).choice, "");
    await expect(
      page.getByRole("option", { name: "Alpha", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "Reset native",
        exact: true,
        includeHidden: true,
      })
      .click();
    await expect(choice).toHaveValue("Alpha");
    await expect(choice).toHaveAttribute("aria-expanded", "false");
    assert.deepEqual(await data("disabled-owner"), {});
    await expect(
      page.getByRole("combobox", { name: "Fieldset choice", exact: true }),
    ).toBeDisabled();
    const controlled = page.getByRole("combobox", {
      name: "Controlled",
      exact: true,
    });
    await controlled.fill("caf");
    await page.getByRole("option", { name: "Café", exact: true }).click();
    await page
      .getByRole("button", { name: "Reset controlled", exact: true })
      .click();
    await expect(controlled).toHaveValue("Café");
    assert.equal((await data("controlled")).controlled, "c");
    await page
      .getByRole("button", { name: "Translate options", exact: true })
      .click();
    await expect(choice).toHaveValue("Alphabétique");
    assert.equal((await data("native")).choice, "a");
    await page
      .getByRole("button", { name: "Remove Alpha", exact: true })
      .click();
    await expect(choice).toHaveAttribute("aria-invalid", "true");
    assert.equal((await data("native")).choice, "");
    assert.equal(await choice.evaluate((e) => e.checkValidity()), false);
    await page
      .getByRole("button", { name: "Disable external", exact: true })
      .click();
    assert.equal("external" in (await data("native")), false);
    const required = page.getByRole("combobox", {
      name: "Required",
      exact: true,
    });
    await required.fill("unmatched");
    await page
      .getByRole("button", {
        name: "Validate",
        exact: true,
        includeHidden: true,
      })
      .click();
    assert.equal(
      await page.locator("#validation").evaluate((e) => e.checkValidity()),
      false,
    );
    await page.goto(origin);
    const state = page.getByRole("combobox", {
      name: "Search state",
      exact: true,
    });
    await page.getByRole("button", { name: "Load", exact: true }).click();
    await state.fill("a");
    await expect(
      page.getByText("Loading choices…", { exact: true }).last(),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Fail", exact: true }).click();
    await state.fill("ab");
    await expect(
      page.getByRole("button", { name: "Retry search", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Retry search", exact: true })
      .click();
    await state.fill("caf");
    await page.getByRole("option", { name: "Café", exact: true }).click();
    await page.getByRole("button", { name: "Empty", exact: true }).click();
    await state.fill("zzz");
    await expect(
      page.getByText("No matching choices.", { exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Open modal", exact: true }).click();
    const modal = page.getByRole("dialog", { name: "Modal", exact: true });
    const modalInput = modal.getByRole("combobox", {
      name: "Modal choice",
      exact: true,
    });
    await page.evaluate(() => {
      window.observedEscapes = 0;
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") window.observedEscapes++;
      });
    });
    await modalInput.fill("caf");
    const option = page.getByRole("option", { name: "Café", exact: true });
    await expect(option).toBeVisible();
    assert.equal(
      await option.evaluate((e) => !!e.closest("dialog[open]")),
      true,
    );
    await page.keyboard.press("Escape");
    await expect(modal).toBeVisible();
    await expect(option).toBeHidden();
    assert.equal(await page.evaluate(() => window.observedEscapes), 1);
    await modal
      .getByRole("button", { name: "Open child", exact: true })
      .click();
    const nested = page.getByRole("combobox", {
      name: "Nested choice",
      exact: true,
    });
    await nested.fill("caf");
    await page.getByRole("option", { name: "Café", exact: true }).click();
    const child = page.getByRole("dialog", { name: "Child", exact: true });
    await expect(child).toBeVisible();
    await nested.fill("a");
    await expect(nested).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(nested).toHaveAttribute("aria-expanded", "false");
    await expect(
      page.getByRole("option", { name: "Alpha", exact: true }),
    ).toBeHidden();
    await expect(child).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(child).toBeHidden();
    await expect(modal).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(modal).toBeHidden();
    await page
      .getByRole("button", { name: "Open parent", exact: true })
      .click();
    const parent = page.getByRole("dialog", { name: "Parent", exact: true });
    const nestedInput = parent.getByRole("combobox");
    await nestedInput.fill("caf");
    await page.getByRole("option", { name: "Café", exact: true }).click();
    await expect(parent).toBeVisible();
    await nestedInput.fill("a");
    await expect(nestedInput).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(nestedInput).toHaveAttribute("aria-expanded", "false");
    await expect(
      page.getByRole("option", { name: "Alpha", exact: true }),
    ).toBeHidden();
    await expect(parent).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(parent).toBeHidden();
    await page.getByRole("button", { name: "Theme", exact: true }).click();
    await page.getByRole("button", { name: "Direction", exact: true }).click();
    await page.emulateMedia({ forcedColors: "active" });
    assert.equal(
      await page
        .locator("table caption")
        .evaluate(
          (e) =>
            getComputedStyle(e).color ===
            getComputedStyle(e.closest("[data-contour-theme]")).color,
        ),
      true,
      "visible table caption inherits the scoped theme",
    );
    await choice.tap();
    await choice.fill("long");
    const long = page.getByRole("option", {
      name: /A very long translated option/,
    });
    await expect(long).toBeVisible();
    const bounds = await long.boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 390);
    await long.tap();
    await expect(choice).toHaveValue(/A very long/);
    // A stale delayed touch-open must not revive a popup after its selection committed.
    await page.waitForTimeout(150);
    await expect(choice).toHaveAttribute("aria-expanded", "false");
    await choice.fill("caf");
    await choice.dispatchEvent("compositionstart");
    await choice.dispatchEvent("keydown", {
      key: "Enter",
      keyCode: 229,
      isComposing: true,
      bubbles: true,
      cancelable: true,
    });
    assert.equal((await data("native")).choice, "long");
    await choice.dispatchEvent("compositionend");
    await page.keyboard.press("Escape");
    await expect(choice).toHaveAttribute("aria-expanded", "false");
    await expect(
      page.getByRole("table", { name: "Semantic records", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("rowheader", { name: "Ada", exact: true }),
    ).toBeVisible();
    // Geometry/owner-document cases start with a fresh document after the synthetic IME sequence.
    await page.goto(origin);
    await page.getByRole("button", { name: "Theme", exact: true }).click();
    await page.getByRole("button", { name: "Direction", exact: true }).click();
    await page.emulateMedia({ forcedColors: "none" });
    const inline = page.getByRole("combobox", {
      name: "Inline choice",
      exact: true,
    });
    await inline.fill("caf");
    const inlineOption = page.getByRole("option", {
      name: "Café",
      exact: true,
    });
    await expect(inlineOption).toBeVisible();
    assert.equal(
      await inlineOption.evaluate((e) => !!e.closest("#inline-combo")),
      true,
    );
    await page.keyboard.press("Escape");
    await expect(inline).toHaveAttribute("aria-expanded", "false");
    await expect(inlineOption).toBeHidden();
    await page.locator(".test-edge-clip").evaluate((e) => {
      Object.assign(e.style, {
        position: "fixed",
        bottom: "6px",
        left: "4px",
        width: "calc(100% - 8px)",
      });
    });
    const edge = page.getByRole("combobox", {
      name: "Edge choice",
      exact: true,
    });
    await edge.fill("caf");
    const edgeOption = page.getByRole("option", { name: "Café", exact: true });
    await expect(edgeOption).toBeVisible();
    assert.equal(
      await edgeOption.evaluate((e) => !!e.closest(".test-edge-clip")),
      false,
    );
    await expect(edge).toHaveAttribute("aria-expanded", "true");
    await expect
      .poll(async () => {
        const b = await edgeOption.boundingBox();
        return (
          !!b &&
          b.x >= 0 &&
          b.x + b.width <= 390 &&
          b.y >= 0 &&
          b.y + b.height <= 740
        );
      })
      .toBe(true);
    const edgeBounds = await edgeOption.boundingBox();

    assert.ok(
      edgeBounds.x >= 0 &&
        edgeBounds.x + edgeBounds.width <= 390 &&
        edgeBounds.y >= 0 &&
        edgeBounds.y + edgeBounds.height <= 740,
    );
    assert.equal(
      await edgeOption.evaluate((e) => getComputedStyle(e).direction),
      "rtl",
    );
    await page.keyboard.press("Escape");
    await page.evaluate(() => (document.body.style.zoom = "2"));
    await choice.fill("caf");
    const zoomOption = page.getByRole("option", { name: "Café", exact: true });
    await expect
      .poll(async () => {
        const bounds = await zoomOption.boundingBox();
        return (
          !!bounds &&
          bounds.x >= 0 &&
          bounds.x + bounds.width <= 390 &&
          bounds.y >= 0 &&
          bounds.y + bounds.height <= 740
        );
      })
      .toBe(true);
    assert.ok(
      (await zoomOption.boundingBox()).height >= 70,
      "zoom retains enlarged text and option height",
    );
    await page.keyboard.press("Escape");
    await page.evaluate(() => (document.body.style.zoom = "1"));
    await page.evaluate(() => {
      const frame = document.createElement("iframe");
      frame.title = "Owner document";
      frame.style.width = "360px";
      frame.style.height = "600px";
      document.body.append(frame);
      for (const link of document.querySelectorAll("link[rel=stylesheet]")) {
        const copy = link.cloneNode();
        copy.href = link.href;
        frame.contentDocument.head.append(copy);
      }
      const element = frame.contentDocument.createElement("div");
      frame.contentDocument.body.append(element);
      window.mountOwner(element);
    });
    const frame = page.frameLocator('iframe[title="Owner document"]');
    const ownerInput = frame.getByRole("combobox", {
      name: "Choice",
      exact: true,
    });
    await ownerInput.fill("caf");
    await page
      .locator('iframe[title="Owner document"]')
      .scrollIntoViewIfNeeded();
    await frame.getByRole("option", { name: "Café", exact: true }).click();
    await expect(ownerInput).toHaveValue("Café");
    await page.evaluate(() => window.unmountOwner());
    assert.equal(
      await page.evaluate(() => {
        const doc = document.querySelector("iframe").contentDocument;
        return !doc.dispatchEvent(
          new doc.defaultView.KeyboardEvent("keydown", {
            key: "Escape",
            bubbles: true,
            cancelable: true,
          }),
        );
      }),
      false,
    );
    const veto = page.getByRole("combobox", {
      name: "Veto choice",
      exact: true,
    });
    await veto.fill("caf");
    await page.keyboard.press("Escape");
    await expect(veto).toHaveAttribute("aria-expanded", "true");
    await veto.evaluate((e) => (e.dataset.veto = "false"));
    await page.keyboard.press("Escape");
    await expect(veto).toHaveAttribute("aria-expanded", "false");
    await page.goto(origin + "?defaultOpen=1");
    const initialModal = page.getByRole("dialog", {
      name: "Modal",
      exact: true,
    });
    await expect(initialModal).toBeVisible();
    const initialChoice = page.getByRole("option", {
      name: "Alpha",
      exact: true,
    });
    await expect(initialChoice).toBeVisible();
    assert.equal(
      await initialChoice.evaluate((e) => !!e.closest("dialog[open]")),
      true,
    );
    await page.keyboard.press("Escape");
    await expect(initialChoice).toBeHidden();
    await expect(initialModal).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(initialModal).toBeHidden();
    await page.evaluate(() => window.unmount());
    assert.equal(
      await page.evaluate(
        () =>
          !document.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: "Escape",
              bubbles: true,
              cancelable: true,
            }),
          ),
      ),
      false,
    );
    assert.deepEqual(errors, []);
  } finally {
    await browser?.close();
    if (server) await new Promise((r) => server.httpServer.close(r));
    await rm(temporary, { recursive: true, force: true });
  }
});
