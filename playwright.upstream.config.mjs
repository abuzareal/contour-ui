import { defineConfig } from "@playwright/test";
import qa from "./playwright.qa.config.mjs";

// Diagnostic for the unmodified upstream Popup composition, which Contour no longer uses.
// Keep its strict zero-violation assertion and raw findings; it is not the shipped adapter contract.
export default defineConfig({
  ...qa,
  testDir: "./tests/diagnostics",
  testMatch: "upstream.spec.mjs",
  outputDir: "test-results/upstream",
});
