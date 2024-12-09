import { defineConfig } from "tsup";

export default defineConfig({
    clean: true,
    dts: true,
    entry: ["index.tsx"],
    format: ["cjs", "esm"],
    sourcemap: true,
    target: "es2020",
    minify: "terser",
});
