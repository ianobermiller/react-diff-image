import type { UserConfig } from "tsdown";

const config: UserConfig = {
    entry: ["src/index.tsx"],
    format: ["cjs", "esm"],
    platform: "neutral",
    target: "es2020",
    // React 16/17 do not expose their JSX runtime through Node's ESM resolver.
    inputOptions: { transform: { jsx: "react", inject: { React: "react" } } },
    checks: { moduleLevelDirective: false },
    dts: true,
    minify: true,
    sourcemap: true,
    banner: { js: '"use client";' },
    deps: { onlyBundle: [], onlyImport: ["react"] },
    outExtensions: ({ format }) => ({
        js: format === "cjs" ? ".js" : ".mjs",
        dts: format === "cjs" ? ".d.ts" : ".d.mts",
    }),
};

export default config;
