import { defineConfig } from "tsup";

export default defineConfig({
    clean: true,
    dts: true,
    entry: ["src/index.tsx"],
    format: ["cjs", "esm"],
    minify: "terser",
    sourcemap: true,
    target: "es2020",
});
