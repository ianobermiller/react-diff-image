// Build and serve the demo, then run: node perf/screenshots.mjs [baseURL]
// Requires cwebp on PATH to encode the README images.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium, expect } from "@playwright/test";

const temporary = await mkdtemp(join(tmpdir(), "react-diff-image-screenshots-"));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH });
try {
    const page = await browser.newPage({ viewport: { width: 1024, height: 800 }, colorScheme: "light" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("requestfailed", (request) => errors.push(`${request.url()}: ${request.failure().errorText}`));
    await page.goto(process.argv[2] || "http://127.0.0.1:3000");
    await page.locator(".demo-preview img").first().waitFor();
    await page.evaluate(async () => {
        await Promise.all([...document.images].map((image) => image.decode()));
        await document.fonts.ready;
    });
    for (const [name, label, option] of [
        ["split", "Split"],
        ["blend", "Blend"],
        ["pixel-diff", "Pixel-diff"],
        ["side-by-side", "Side-by-side"],
        ["3-up", "3-up"],
        ["new-only", "New only"],
        ["old-only", "Old only"],
        ["overlay", "Split", "Show overlay"],
        ["full-size", "Split", "Show full size"],
        ["no-divider", "Split", "Show divider"],
        ["padding", "Split", "Padding"],
    ]) {
        await page.getByRole("radio", { name: label, exact: true }).check();
        if (option) {
            await page.getByRole("checkbox", { name: option, exact: true }).setChecked(option !== "Show divider");
        }
        if (name === "overlay") await page.locator('div[style*="background-image"][style*="data:image/"]').waitFor();
        await page.mouse.move(0, 0);
        // Let ResizeObserver and the next paint settle after changing modes.
        await page.evaluate(
            () =>
                new Promise((resolve) => {
                    requestAnimationFrame(() => requestAnimationFrame(resolve));
                }),
        );
        const png = join(temporary, `${name}.png`);
        await page.screenshot({ path: png, fullPage: true });
        execFileSync("cwebp", [
            "-quiet",
            "-q",
            "85",
            png,
            "-o",
            fileURLToPath(new URL(`../images/${name}.webp`, import.meta.url)),
        ]);
        if (option) {
            await page.getByRole("checkbox", { name: option, exact: true }).setChecked(option === "Show divider");
        }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole("radio", { name: "Old only", exact: true })).toBeVisible();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await page.getByRole("checkbox", { name: "Show full size", exact: true }).check();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    await page.screenshot({ path: join(temporary, "mobile.png") });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.screenshot({ path: join(temporary, "dark.png") });
    assert.deepEqual(errors, []);
} finally {
    await browser.close();
    await rm(temporary, { recursive: true, force: true });
}
