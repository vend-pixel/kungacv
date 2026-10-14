import { test, expect } from "@playwright/test";

const viewports = [
    { name: "mobile", width: 375, height: 900 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "wide", width: 1920, height: 1200 },
];

for (const viewport of viewports) {
    test.describe(`client ${viewport.name} ${viewport.width}px`, () => {
        test.use({ viewport: { width: viewport.width, height: viewport.height } });

        for (const route of ["/", "/resume", "/resume/create"]) {
            test(`${route} has no horizontal overflow`, async ({ page }) => {
                await page.goto(route, { waitUntil: "domcontentloaded" });
                await page.waitForLoadState("networkidle").catch(() => {});
                const metrics = await page.evaluate(() => ({
                    viewport: window.innerWidth,
                    scrollWidth: document.documentElement.scrollWidth,
                    bodyScrollWidth: document.body.scrollWidth,
                }));
                expect(metrics.scrollWidth, `${route} overflows at ${viewport.width}px`).toBeLessThanOrEqual(metrics.viewport + 1);
                expect(metrics.bodyScrollWidth, `${route} body overflows at ${viewport.width}px`).toBeLessThanOrEqual(metrics.viewport + 1);
            });
        }

        test("homepage keeps one primary heading", async ({ page }) => {
            await page.goto("/", { waitUntil: "domcontentloaded" });
            await expect(page.locator("h1")).toHaveCount(1);
        });
    });
}

for (const viewport of viewports) {
    test(`admin login ${viewport.name} has semantic form and no overflow`, async ({ browser }) => {
        const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
        await page.goto("http://127.0.0.1:3002/#/login", { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle").catch(() => {});
        await expect(page.locator("h1")).toHaveText("KungaCV Admin Portal");
        await expect(page.locator("main")).toHaveCount(1);
        await expect(page.locator("#password")).toHaveAttribute("autocomplete", "current-password");
        const metrics = await page.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
        expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewport + 1);
        await page.close();
    });
}
