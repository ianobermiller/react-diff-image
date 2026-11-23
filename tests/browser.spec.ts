import { expect, test } from "@playwright/test";

const regionName = "Image comparison";

test.afterEach(async ({ page }) => {
    expect(await page.pageErrors()).toEqual([]);
});

test.beforeEach(async ({ page }) => {
    await page.goto("/test.html");
    await expect(page.getByRole("region", { name: regionName }).locator("img").first()).toHaveJSProperty(
        "naturalWidth",
        3840,
    );
});

test("every mode loads, with custom labels in all labeled modes", async ({ page }) => {
    await page.getByLabel("Custom labels").check();
    const region = page.getByRole("region", { name: regionName });
    for (const [mode, count] of [
        ["Split", 2],
        ["Blend", 2],
        ["Pixel-diff", 1],
        ["Side-by-side", 2],
        ["3-up", 3],
        ["New only", 1],
        ["Old only", 1],
    ] as const) {
        await page.getByRole("button", { name: mode, exact: true }).click();
        await expect(region.locator("img")).toHaveCount(count);
        if (mode !== "Pixel-diff" && mode !== "New only")
            await expect(region.getByText("Before", { exact: true })).toBeVisible();
        if (mode !== "Pixel-diff" && mode !== "Old only")
            await expect(region.getByText("After", { exact: true })).toBeVisible();
        if (mode === "3-up") await expect(region.getByText("Changes", { exact: true })).toBeVisible();
    }
});

test("split supports keyboard, mouse, and touch and keeps its position after rerenders", async ({ page }) => {
    const slider = page.getByRole("region", { name: regionName }).getByRole("slider");
    await slider.focus();
    await slider.press("Home");
    await expect(slider).toHaveAttribute("aria-valuenow", "0");
    await slider.press("ArrowRight");
    await expect(slider).toHaveAttribute("aria-valuenow", "1");
    await slider.press("End");
    await expect(slider).toHaveAttribute("aria-valuenow", "100");
    const bounds = await slider.boundingBox();
    if (!bounds) throw new Error("Missing comparison slider");
    await page.mouse.move(bounds.x + bounds.width * 0.25, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x - 5, bounds.y + bounds.height / 2);
    await expect(slider).toHaveAttribute("aria-valuenow", "25");
    await page.mouse.up();
    await expect(slider).toHaveAttribute("aria-valuenow", "25");
    await page.touchscreen.tap(bounds.x + bounds.width * 0.75, bounds.y + bounds.height / 2);
    await expect(slider).toHaveAttribute("aria-valuenow", "75");
    await expect(slider.locator("img").first().locator("../..")).toHaveCSS("clip-path", "inset(0px 25% 0px 0px)");
    await page.getByLabel("Divider").uncheck();
    await page.getByLabel("Divider").check();
    await page.getByLabel("Custom labels").check();
    await expect(slider).toHaveAttribute("aria-valuenow", "75");
    await expect(slider).toHaveAttribute("aria-valuetext", "75% Before");
    await expect(slider.locator("div").last()).toHaveCSS("left", `${bounds.width * 0.75 - 2}px`);
});

test.describe("mobile split gestures", () => {
    test.use({ isMobile: true, viewport: { width: 800, height: 650 } });

    test("horizontal touch drags move the divider and pinches zoom the page", async ({ page }) => {
        const slider = page.getByRole("region", { name: regionName }).getByRole("slider");
        const bounds = await slider.boundingBox();
        if (!bounds) throw new Error("Missing comparison slider");
        const y = Math.round(bounds.y + bounds.height / 4);
        const touchPoint = (fraction: number) => ({ x: Math.round(bounds.x + bounds.width * fraction), y });
        const session = await page.context().newCDPSession(page);

        await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [touchPoint(0.25)] });
        await expect(slider).toHaveAttribute("aria-valuenow", "25");
        await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [touchPoint(0.75)] });
        await expect(slider).toHaveAttribute("aria-valuenow", "75");
        await expect(slider.locator("img").first().locator("../..")).toHaveCSS("clip-path", "inset(0px 25% 0px 0px)");
        await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });

        const zoom = () => page.evaluate(() => window.visualViewport?.scale);
        await expect.poll(zoom).toBe(1);
        await session.send("Input.synthesizePinchGesture", {
            ...touchPoint(0.5),
            gestureSourceType: "touch",
            scaleFactor: 1.6,
        });
        await expect.poll(zoom, { timeout: 2000 }).toBeCloseTo(1.6);
    });
});

test("blend is named, keyboard accessible, and preserves opacity when resized", async ({ page }) => {
    await page.getByRole("button", { name: "Blend", exact: true }).click();
    const slider = page.getByRole("slider", { name: "Blend OLD and NEW" });
    await slider.focus();
    await slider.press("End");
    await expect(slider).toHaveValue("100");
    const region = page.getByRole("region", { name: regionName });
    const layer = region.locator('div[style*="opacity"]');
    await expect(layer).toHaveCSS("opacity", "1");
    await page.getByLabel("Width", { exact: true }).fill("400");
    await expect(layer).toHaveCSS("opacity", "1");
    await expect(slider).toHaveJSProperty("defaultValue", "100");
});

test("responsive scaling stays finite and nonnegative, including zero-width containers", async ({ page }) => {
    const region = page.getByRole("region", { name: regionName });
    await page.getByLabel("Padding", { exact: true }).check();
    for (const [mode, narrowScale, normalScale] of [
        ["Split", 56 / 1280, 756 / 1280],
        ["Side-by-side", 0, 350 / 1280],
        ["3-up", 0, 214 / 1280],
    ] as const) {
        await page.getByRole("button", { name: mode, exact: true }).click();
        for (const width of [100, 0, 800]) {
            await page.getByLabel("Width", { exact: true }).fill(String(width));
            await expect
                .poll(async () =>
                    region
                        .locator("img")
                        .first()
                        .evaluate((img) => {
                            const transform = getComputedStyle(img.parentElement!).transform;
                            return new DOMMatrixReadOnly(transform).a;
                        }),
                )
                .toBeCloseTo(width === 0 ? 0 : width === 100 ? narrowScale : normalScale, 5);
        }
    }
    await page.getByLabel("Full size").check();
    await expect(region.locator("img").first().locator("..")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
});

test("overlay toggles, follows image URL changes, and recovers after a failed load", async ({ page }) => {
    const region = page.getByRole("region", { name: regionName });
    const overlay = region.locator('div[style*="background-image: url"]');
    await page.getByLabel("Overlay", { exact: true }).check();
    await expect(overlay).toHaveCount(1);
    const initial = await overlay.evaluate((el) => getComputedStyle(el).backgroundImage);
    await page.getByLabel("Overlay", { exact: true }).uncheck();
    await expect(overlay).toHaveCount(0);
    await page.getByLabel("Overlay", { exact: true }).check();
    await expect(overlay).toHaveCSS("background-image", initial);
    const image =
        "data:image/svg+xml," +
        encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="90"><path fill="red" d="M0 0h360v90H0z"/></svg>',
        );
    await page.getByLabel("URL", { exact: true }).fill(image);
    await expect(region.locator("img").first()).toHaveJSProperty("naturalWidth", 360);
    await expect(overlay).toHaveCount(1);
    await expect(overlay).not.toHaveCSS("background-image", initial);
    await page.route("**/missing.webp", (route) => route.fulfill({ status: 404, body: "missing" }));
    await page.getByLabel("URL", { exact: true }).fill("/missing.webp");
    await expect(overlay).toHaveCount(0);
    await page.getByLabel("URL", { exact: true }).fill("/diff.webp");
    await expect(region.locator("img").first()).toHaveJSProperty("naturalWidth", 3840);
    await expect(overlay).toHaveCSS("background-image", initial);
});

test("the demo loads and switches comparison modes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("radio", { name: "Blend", exact: true }).check();
    await expect(page.getByRole("slider", { name: "Blend OLD and NEW" })).toBeVisible();
});
