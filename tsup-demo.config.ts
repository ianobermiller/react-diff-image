import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/demo/index.tsx"],
    env: {
        NODE_ENV: "development",
    },
    format: "esm",
    noExternal: ["react", "react-dom"],
    outDir: "dist-demo",
    publicDir: "src/demo/public",
    sourcemap: true,
    target: "es2020",
});
