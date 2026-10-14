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
test("public upstream composition preserves the strict accessibility reproduction", async ({
  page,
  browserName,
  browser,
}) => {
  await page.goto("/?upstream=1");
  const closed = await new AxeBuilder({ page }).analyze();
  expect(closed.violations).toEqual([]);
  await page.getByRole("combobox", { name: "Upstream project" }).click();
  await expect(page.getByRole("listbox")).toBeVisible();
  const open = await new AxeBuilder({ page }).analyze();
  await record(`${browserName}-upstream-axe.json`, {
    date: "2026-10-14",
    version: "@base-ui/react1.9.0",
    browserVersion: browser.version(),
    modal: false,
    adapter: "none",
    closed,
    open,
  });
  expect(open.violations).toEqual([]);
});
