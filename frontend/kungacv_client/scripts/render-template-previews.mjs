/**
 * Render the hidden /dev-templates Redux previews into local WebP thumbnails.
 * Run from the repository root after starting the client with `npm run dev`.
 */
import { mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { chromium } from "playwright";

const baseUrl = process.env.CLIENT_URL || "http://127.0.0.1:3001";
const outputDir = new URL("../public/templates/", import.meta.url).pathname;
await mkdir(outputDir, { recursive: true });

let browser;
try {
    browser = await chromium.launch({ channel: "chrome", headless: true });
} catch {
    browser = await chromium.launch({ headless: true });
}
const page = await browser.newPage({ viewport: { width: 1000, height: 1400 }, deviceScaleFactor: 1 });

try {
    for (let id = 1; id <= 12; id += 1) {
        await page.goto(`${baseUrl}/dev-templates?preset=${id}`, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(250);
        const source = `${outputDir}template-${String(id).padStart(2, "0")}.png`;
        const target = `${outputDir}template-${String(id).padStart(2, "0")}.webp`;
        await page.locator("#resume-preview").screenshot({ path: source });
        const imageTool = existsSync("/usr/bin/magick") ? "magick" : "convert";
        execFileSync(imageTool, [source, "-resize", "1280x", "-quality", "88", target]);
        execFileSync("rm", [source]);
        console.log(`Rendered ${target}`);
    }
} finally {
    await browser.close();
}
