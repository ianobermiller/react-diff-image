// Usage: node perf/measure.mjs <baseURL> <outDir | -> [label]
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import { chromium } from "@playwright/test";

const [baseURL, outDir, label = "run"] = process.argv.slice(2);
if (!baseURL || !outDir) throw new Error("Usage: node perf/measure.mjs <baseURL> <outDir | -> [label]");

const capture = outDir !== "-";
if (capture) await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
    args: ["--disable-gpu"],
});

try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("requestfailed", (request) => errors.push(`${request.url()}: ${request.failure().errorText}`));
    page.on("response", (response) => {
        if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });

    await page.addInitScript(
        ({ profileCanvas }) => {
            globalThis.measureUpdate = (root, expected, update) =>
                new Promise((resolve, reject) => {
                    if (expected()) {
                        reject(new Error("The expected update was already present"));
                        return;
                    }
                    const observer = new MutationObserver(() => {
                        if (!expected()) return;

                        const elapsedMs = performance.now() - start;
                        observer.disconnect();
                        clearTimeout(timeout);
                        resolve(elapsedMs);
                    });
                    observer.observe(root, {
                        attributes: true,
                        attributeFilter: ["style"],
                        childList: true,
                        subtree: true,
                    });
                    const timeout = setTimeout(() => {
                        observer.disconnect();
                        reject(new Error("The expected DOM update did not happen"));
                    }, 5000);
                    const start = performance.now();
                    update();
                });

            if (!profileCanvas) return;

            globalThis.canvasProfile = { getImageDataMs: 0, drawImageMs: 0, fillMs: 0, toDataURLMs: 0, arcCount: 0 };
            for (const [prototype, methods] of [
                [CanvasRenderingContext2D.prototype, ["drawImage", "getImageData", "fill"]],
                [HTMLCanvasElement.prototype, ["toDataURL"]],
            ]) {
                for (const method of methods) {
                    const original = prototype[method];
                    prototype[method] = function profileMethod(...args) {
                        const start = performance.now();
                        const result = original.apply(this, args);
                        globalThis.canvasProfile[`${method}Ms`] += performance.now() - start;
                        return result;
                    };
                }
            }
            const { arc: originalArc } = CanvasRenderingContext2D.prototype;
            CanvasRenderingContext2D.prototype.arc = function arc(...args) {
                globalThis.canvasProfile.arcCount++;
                return originalArc.apply(this, args);
            };
        },
        { profileCanvas: process.env.PROFILE_CANVAS === "1" },
    );

    async function screenshot(name) {
        if (capture) await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: true });
    }

    const navStart = performance.now();
    await page.goto(baseURL, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(
        () => {
            const layer = document.querySelector("div[style*='clip-path']");
            return layer && layer.getBoundingClientRect().height > 2;
        },
        null,
        { timeout: 5000 },
    );
    const results = { label, navMs: performance.now() - navStart };

    const overlayToggle = page.getByRole("checkbox", { name: "Show overlay" });
    function measureOverlay() {
        return overlayToggle.evaluate(async (checkbox) => {
            const root = document.querySelector("#root");
            const overlay = () => root.querySelector('div[style*="background-image"][style*="data:image/"]');
            const start = performance.now();
            const commitMs = await globalThis.measureUpdate(root, overlay, () => checkbox.click());
            const background = overlay().style.backgroundImage;
            const image = new Image();
            image.src = background.slice(5, -2);
            await image.decode();

            return {
                elapsedMs: performance.now() - start,
                commitMs,
                width: image.naturalWidth,
                height: image.naturalHeight,
            };
        });
    }

    results.overlay = await measureOverlay();
    await screenshot("overlay");

    await overlayToggle.uncheck();
    await page.locator('div[style*="background-image"][style*="data:image/"]').waitFor({ state: "detached" });
    results.overlayReToggle = await measureOverlay();
    if (
        results.overlay.width !== results.overlayReToggle.width ||
        results.overlay.height !== results.overlayReToggle.height
    ) {
        throw new Error("Overlay dimensions changed after toggling");
    }
    await overlayToggle.uncheck();
    await page.locator('div[style*="background-image"][style*="data:image/"]').waitFor({ state: "detached" });

    function measureInteraction(mode) {
        return page.evaluate(async (comparisonMode) => {
            const root = document.querySelector("#root");
            const layers = root.querySelectorAll("div[style*='clip-path']");
            const container = layers[0]?.parentElement;
            const divider = container?.querySelector("div[style*='orange']");
            const slider = root.querySelector('input[type="range"]');
            if (comparisonMode === "split" ? layers.length !== 2 || !divider : !slider) {
                throw new Error(`Missing ${comparisonMode} controls`);
            }

            const near = (actual, expected) => Math.abs(actual - expected) < 0.01;
            const samples = [];
            for (let i = 0; i < 60; i++) {
                // Pace the events before starting the timer, including time for the previous update to paint.
                await new Promise(requestAnimationFrame);
                const value = i % 2 === 0 ? 25 : 75;
                if (comparisonMode === "split") {
                    const rect = container.getBoundingClientRect();
                    const clientX = Math.round(rect.left + (rect.width * value) / 100);
                    const percentage = ((clientX - rect.left) / rect.width) * 100;

                    const expected = () => {
                        const left = layers[0].style.clipPath.match(/([\d.]+)%/u);
                        const right = layers[1].style.clipPath.match(/([\d.]+)%/u);
                        const line = divider.style.left.match(/([\d.]+)%/u);
                        return (
                            left &&
                            right &&
                            line &&
                            near(Number(left[1]), 100 - percentage) &&
                            near(Number(right[1]), percentage) &&
                            near(Number(line[1]), percentage)
                        );
                    };
                    samples.push(
                        await globalThis.measureUpdate(container, expected, () => {
                            container.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX }));
                        }),
                    );
                } else {
                    slider.value = String(value);
                    const expected = () =>
                        Number(root.querySelector("div[style*='opacity']").style.opacity) === value / 100;
                    samples.push(
                        await globalThis.measureUpdate(root, expected, () => {
                            slider.dispatchEvent(new Event("input", { bubbles: true }));
                        }),
                    );
                }
            }
            const sorted = samples.toSorted((left, right) => left - right);
            return {
                events: samples.length,
                perEventMs: samples.reduce((sum, sample) => sum + sample, 0) / samples.length,
                medianMs: (sorted[29] + sorted[30]) / 2,
                p95Ms: sorted[56],
            };
        }, mode);
    }

    results.splitMousemove = await measureInteraction("split");
    await screenshot("split");

    await page.getByRole("radio", { name: "Blend", exact: true }).check();
    await page.locator('input[type="range"]').waitFor();
    results.blendSlider = await measureInteraction("blend");
    await screenshot("blend");

    if (capture) {
        for (const [name, mode] of [
            ["split-default", "Split"],
            ["pixel-diff", "Pixel-diff"],
            ["side-by-side", "Side-by-side"],
            ["3-up", "3-up"],
            ["new-only", "New only"],
            ["old-only", "Old only"],
        ]) {
            await page.getByRole("radio", { name: mode, exact: true }).check();
            await screenshot(name);
        }
    }

    if (errors.length > 0) {
        throw new Error(errors.join("\n"));
    }
    results.errors = 0;
    const canvasProfile = await page.evaluate(() => globalThis.canvasProfile);
    if (canvasProfile) results.canvasProfile = canvasProfile;
    console.log(JSON.stringify(results, null, 2));
} finally {
    await browser.close();
}
