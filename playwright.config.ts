import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config for the admin suite.
 *
 * Design goals (see tests/e2e/support/*):
 *  - One browser (chromium) for admin flows: role login is expensive and multi-browser
 *    only multiplied flakiness without adding admin-behaviour coverage.
 *  - A `setup` project logs in once as admin and once as editor and caches the Supabase
 *    cookie session to tests/e2e/.auth/*.json. Specs opt into a role via
 *    `test.use({ storageState })` instead of logging in per test.
 *  - baseURL + DB host come from env so the exact same specs run locally and in Docker.
 *  - The dev server is auto-started locally, but skipped in Docker where the app runs as
 *    its own container (set E2E_SKIP_WEBSERVER=1).
 */

const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:3000";
const SKIP_WEBSERVER = process.env.E2E_SKIP_WEBSERVER === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  // Generous timeouts: the app runs in dev mode, so the first hit to a heavy admin route
  // or server action pays a Turbopack compile cost (much slower in the Docker container).
  // These ceilings only bite on genuine hangs; fast (warm/host) runs finish well under them.
  timeout: 120_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    // In Docker the app is reached over plain HTTP at a single-label host (http://app:3000).
    // Chromium's automatic HTTPS upgrade turns that into an https:// attempt against a
    // plaintext dev server -> ERR_SSL_PROTOCOL_ERROR. Disable the upgrade features.
    // (No effect locally: localhost is exempt from HTTPS upgrades anyway.)
    launchOptions: {
      args: [
        "--disable-features=HttpsUpgrades,HttpsFirstBalancedModeAutoEnable,HttpsFirstModeV2",
      ],
    },
  },

  projects: [
    {
      name: "setup",
      testMatch: /support[\\/]auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      // Ignore the setup file and the quarantined legacy specs (superseded flaky/
      // false-confidence tests kept under _legacy/ for reference, not run by default).
      testIgnore: [/support[\\/]auth\.setup\.ts/, /[\\/]_legacy[\\/]/],
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  ...(SKIP_WEBSERVER
    ? {}
    : {
        webServer: {
          command: "pnpm dev",
          url: BASE_URL,
          reuseExistingServer: true,
          timeout: 180_000,
        },
      }),
});
