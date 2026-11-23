import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
    testDir: "./tests",
    testMatch: "browser.spec.ts",
    fullyParallel: true,
    forbidOnly: Boolean(process.env["CI"]),
    retries: process.env["CI"] ? 2 : 0,
    workers: 2,
    use: {
        browserName: "chromium",
        baseURL: "http://127.0.0.1:18765",
        hasTouch: true,
        trace: "retain-on-failure",
        launchOptions: process.env["CHROMIUM_EXECUTABLE_PATH"]
            ? { executablePath: process.env["CHROMIUM_EXECUTABLE_PATH"] }
            : {},
    },
    webServer: {
        command: "tsdown --config tsdown-test.config.mts && node perf/server.mjs dist-test 18765",
        url: "http://127.0.0.1:18765/test.html",
    },
};

export default config;
