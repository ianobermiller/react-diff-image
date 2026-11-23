import { execFileSync } from "node:child_process";

const [react, types] = process.argv.slice(2);
if (!react || !types) {
    throw new Error("Usage: npm run ci:compatibility -- <react-version> <types-version>");
}

execFileSync(
    "npm",
    [
        "install",
        "--no-save",
        "--package-lock=false",
        `react@${react}`,
        `react-dom@${react}`,
        `@types/react@${types}`,
        `@types/react-dom@${types}`,
    ],
    { stdio: "inherit" },
);
execFileSync("npm", ["run", "test:package"], { stdio: "inherit" });
