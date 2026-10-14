import { defineConfig, devices } from "@playwright/test";
const engines = (process.env.CONTOUR_QA_ENGINES ?? "chromium").split(",");
for (const engine of engines)
  if (!["chromium", "webkit", "firefox"].includes(engine))
    throw Error(`Unknown QA engine: ${engine}`);
export default defineConfig({
  testDir: "./tests/qa",
  testMatch: "*.spec.mjs",
  workers: 1,
  timeout: 30000,
  reporter: "list",
  outputDir: "test-results/qa",
  snapshotPathTemplate: "{testDir}/snapshots/{arg}{ext}",
  expect: {
    toHaveScreenshot: { animations: "disabled", maxDiffPixelRatio: 0.005 },
  },
  use: {
    baseURL: "http://127.0.0.1:5177",
    viewport: { width: 390, height: 900 },
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects: engines.map((name) => ({
    name,
    use: {
      ...devices[
        name === "chromium"
          ? "Desktop Chrome"
          : name === "webkit"
            ? "Desktop Safari"
            : "Desktop Firefox"
      ],
      viewport: { width: 390, height: 900 },
    },
  })),
  webServer: {
    command: "node scripts/qa-preview.mjs",
    url: "http://127.0.0.1:5177",
    reuseExistingServer: false,
  },
});
