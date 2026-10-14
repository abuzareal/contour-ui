import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
const record = async (name, value) => {
  if (process.env.CONTOUR_QA_OUTPUT) {
    await mkdir(process.env.CONTOUR_QA_OUTPUT, { recursive: true });
    await writeFile(
      join(process.env.CONTOUR_QA_OUTPUT, name),
      JSON.stringify(value, null, 2) + "\n",
    );
  }
};
test("native forms, Combobox dynamic focus, dialogs and popovers", async ({
  page,
  browserName,
  browser,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole("button", { name: "Focus name", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Name", exact: true }),
  ).toBeFocused();
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Grace");
  const choice = page.getByRole("combobox", { name: "Project", exact: true });
  await choice.fill("Café");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page
    .getByRole("button", { name: "Inspect values", exact: true })
    .click();
  await expect(
    page.getByRole("status", { name: "Submitted values" }),
  ).toContainText('"project":"cafe"');
  await expect(
    page.getByRole("status", { name: "Submitted values" }),
  ).toContainText('"name":"Grace"');
  await page.getByRole("button", { name: "Reset values", exact: true }).click();
  await expect(choice).toHaveValue("Atlas");
  await expect(
    page.getByRole("textbox", { name: "Name", exact: true }),
  ).toHaveValue("Ada");
  const closed = await new AxeBuilder({ page }).analyze();
  expect(closed.violations).toEqual([]);
  await choice.click();
  await expect(
    page.getByRole("listbox", { name: "Project", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Project", exact: true }),
  ).toBeVisible();
  const open = await new AxeBuilder({ page }).analyze();
  await record(`${browserName}-axe.json`, {
    date: "2026-10-14",
    browserVersion: browser.version(),
    closed,
    open,
    status: open.violations.length
      ? "automated finding; manual AT review pending"
      : "no automated finding; manual AT unverified",
  });
  // Scan the entire document, including the portaled list and background, without rule exclusions.
  expect.soft(open.violations).toEqual([]);
  await page.keyboard.press("Tab");
  await record(
    `${browserName}-tab.json`,
    await page.evaluate(() => ({
      active: document.activeElement.outerHTML,
      hiddenAncestor: !!document.activeElement.closest('[aria-hidden="true"]'),
      expanded: document
        .querySelector('[role="combobox"]')
        .getAttribute("aria-expanded"),
    })),
  );
  await expect(choice).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("textbox", { name: "After project", exact: true }),
  ).toBeFocused();
  expect(
    await page.evaluate(
      () => !!document.activeElement.closest('[aria-hidden="true"]'),
    ),
  ).toBe(false);
  await choice.click();
  await page.keyboard.press("Shift+Tab");
  await expect(choice).toHaveAttribute("aria-expanded", "false");
  expect(
    await page.evaluate(
      () => !!document.activeElement.closest('[aria-hidden="true"]'),
    ),
  ).toBe(false);
  await page
    .getByRole("button", { name: "Open settings dialog", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Review note" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Open settings dialog", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Open help", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Project help" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Project help" })).toBeHidden();
  expect(errors).toEqual([]);
  await record(`${browserName}-journey.json`, {
    date: "2026-10-14",
    browserVersion: browser.version(),
    nativeForms: "pass",
    keyboardFocus: "pass",
    dialogPopover: "pass",
    manualAT: "unverified",
  });
});
for (const theme of ["light", "dark"])
  for (const width of [390, 1440])
    test(`${theme} ${width} long-content layout and visual baseline`, async ({
      page,
      browserName,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`/?theme=${theme}`);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const choice = page.getByRole("combobox", {
        name: "Project",
        exact: true,
      });
      await choice.click();
      await choice.fill("");
      await expect(page.getByRole("option", { name: /Café/ })).toBeVisible();
      const bounds = await page
        .locator(".contour-combobox-popup")
        .boundingBox();
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      expect(bounds.height).toBeGreaterThan(80);
      if (browserName === "chromium")
        await expect(page).toHaveScreenshot(`${theme}-${width}.png`, {
          fullPage: true,
        });
      await page.keyboard.press("Escape");
      const axe = await new AxeBuilder({ page }).analyze();
      expect(axe.violations).toEqual([]);
    });
test("RTL and forced colors keep choices and focus usable", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Forced-colors fixture evidence is scoped to Chromium.",
  );
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.goto("/?rtl=1");
  const choice = page.getByRole("combobox", { name: "Project", exact: true });
  await choice.click();
  await choice.fill("");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(choice).toHaveAttribute("aria-expanded", "false");
  await choice.focus();
  expect(
    await choice.evaluate(
      (el) => getComputedStyle(el.closest("[dir]")).direction,
    ),
  ).toBe("rtl");
});

for (const language of ["jsx", "tsx"])
  test(`${language} onboarding submits, validates, resets and focuses`, async ({
    page,
  }) => {
    await page.goto(`/?example=${language}`);
    const name = page.getByRole("textbox", { name: "Name", exact: true });
    await name.fill("Grace");
    await page.getByRole("checkbox", { name: "Allow updates" }).uncheck();
    await page
      .getByRole("button", { name: "Inspect values", exact: true })
      .click();
    const output = page.getByRole("status", { name: "Form values" });
    await expect(output).toHaveText('{"name":"Grace","project":"atlas"}');
    await page.getByRole("button", { name: "Reset form", exact: true }).click();
    await expect(name).toHaveValue("Ada");
    await expect(output).toHaveText("");
    await expect(
      page.getByRole("checkbox", { name: "Allow updates" }),
    ).toBeChecked();
    await name.fill("");
    await page
      .getByRole("button", { name: "Inspect values", exact: true })
      .click();
    await expect(output).toHaveText("");
    expect(await name.evaluate((el) => el.checkValidity())).toBe(false);
    await page.getByRole("button", { name: "Focus name", exact: true }).click();
    await expect(name).toBeFocused();
  });
