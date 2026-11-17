import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command:
      process.platform === "win32"
        ? "pnpm.cmd dev -H localhost -p 3000"
        : "pnpm dev -H localhost -p 3000",
    url: "http://localhost:3000/acceso",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});