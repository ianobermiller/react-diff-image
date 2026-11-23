import type { UserConfig } from "tsdown";

import demo from "./tsdown-demo.config.mts";

const config: UserConfig = {
    ...demo,
    env: { NODE_ENV: "production" },
    entry: { fixture: "tests/fixture.tsx", index: "src/demo/index.tsx" },
    outDir: "dist-test",
    copy: [{ from: "src/demo/public/*" }, { from: "tests/fixture.html", rename: "test.html" }],
};

export default config;
