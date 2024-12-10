import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/demo/index.tsx"],
    format: "esm",
    sourcemap: true,
    target: "es2020",
    outDir: "dist-demo",
    noExternal: ["react", "react-dom"],
    env: {
        NODE_ENV: "development",
    },
    publicDir: "src/demo/public",
});
