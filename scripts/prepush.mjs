import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const temporary = mkdtempSync(join(tmpdir(), "react-diff-image-ci-"));

function run(node, commands) {
    const executable = execFileSync(
        "npm",
        ["exec", "--yes", `--package=node@${node}`, "--", "node", "-p", "process.execPath"],
        {
            cwd: temporary,
            encoding: "utf8",
        },
    ).trim();
    const options = {
        cwd: temporary,
        stdio: "inherit",
        env: { ...process.env, PATH: `${dirname(executable)}${delimiter}${process.env.PATH}` },
    };
    execFileSync(executable, ["--version"], options);
    for (const args of commands) {
        execFileSync("npm", args, options);
    }
}

try {
    // Include local edits and untracked source files, but exclude ignored build output and dependencies.
    const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
        cwd: repository,
        encoding: "utf8",
    });
    for (const file of new Set(files.split("\0").filter(Boolean))) {
        const source = join(repository, file);
        if (!existsSync(source)) continue;
        const destination = join(temporary, file);
        mkdirSync(dirname(destination), { recursive: true });
        copyFileSync(source, destination);
    }

    // Keep these versions aligned with .github/workflows/ci.yml.
    for (const node of [24, 26]) {
        run(node, [["ci"], ["exec", "--", "playwright", "install", "chromium"], ["run", "ci:check"]]);
    }
    for (const [react, types] of [
        ["16.14.0", "16"],
        ["17", "17"],
        ["18", "18"],
    ]) {
        run(24, [["ci"], ["run", "build"], ["run", "ci:compatibility", "--", react, types]]);
    }
} finally {
    rmSync(temporary, { recursive: true, force: true });
}
