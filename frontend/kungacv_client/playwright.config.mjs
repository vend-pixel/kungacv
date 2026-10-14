import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    timeout: 45_000,
    expect: { timeout: 10_000 },
    fullyParallel: false,
    reporter: [["list"], ["json", { outputFile: "test-results/responsive.json" }]],
    use: {
        browserName: "chromium",
        launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium", args: ["--no-sandbox"] },
        headless: true,
        baseURL: "http://127.0.0.1:3001",
        ignoreHTTPSErrors: true,
        screenshot: "only-on-failure",
        trace: "retain-on-failure",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
        command: "sh -c 'cd ../kungacv_admin && npm run dev -- -p 3002 > /tmp/kungacv-admin-playwright.log 2>&1 & npm run dev -- -p 3001'",
        url: "http://127.0.0.1:3001",
        reuseExistingServer: true,
        timeout: 120_000,
    },
});
