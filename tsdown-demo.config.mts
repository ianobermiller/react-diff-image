import type { UserConfig } from "tsdown";

const config: UserConfig = {
    entry: ["src/demo/index.tsx"],
    outDir: "dist-demo",
    format: "esm",
    platform: "browser",
    target: "es2020",
    checks: { moduleLevelDirective: false },
    dts: false,
    env: { NODE_ENV: "development" },
    deps: { alwaysBundle: [/^(react|react-dom|scheduler)(\/|$)/u], onlyBundle: ["react", "react-dom", "scheduler"] },
    copy: [{ from: "src/demo/public/*" }],
    sourcemap: true,
};

export default config;
